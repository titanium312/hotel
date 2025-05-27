"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancelarReserva = void 0;
const Database_1 = require("../../../db/Database");
// Conexión a la base de datos
const pool = Database_1.Database.connect();
const CancelarReserva = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { idReserva } = req.body;
        if (!idReserva) {
            return res.status(400).json({ message: 'El parámetro "idReserva" es requerido.' });
        }
        // Paso 1: Verificar si hay habitaciones activas (Estado "activo")
        const [habitacionesActivas] = await connection.execute(`
      SELECT rh.ID_Habitacion
      FROM ReservaHabitacion rh
      WHERE rh.ID_Reserva = ? AND rh.ID_RHEstado = 1;  -- Estado "activo"
      `, [idReserva]);
        const habitacionesActivasResult = habitacionesActivas;
        if (habitacionesActivasResult.length === 0) {
            return res.status(400).json({ message: 'No hay habitaciones activas en esta reserva.' });
        }
        // Obtener las habitaciones que se van a actualizar
        const habitacionesIds = habitacionesActivasResult.map((row) => row.ID_Habitacion);
        if (habitacionesIds.length === 0) {
            return res.status(400).json({ message: 'No se encontraron habitaciones para actualizar.' });
        }
        // Paso 2: Actualizar el estado de la reserva a "Cancelada" (ID 3)
        await connection.execute(`
      UPDATE reserva
      SET ID_Factura = NULL  -- Eliminamos la factura asociada, ya que será cancelada
      WHERE ID_Reserva = ?;
      `, [idReserva]);
        // Paso 3: Actualizar el estado de las habitaciones en ReservaHabitacion a "terminado" (Estado 2)
        await connection.execute(`
      UPDATE ReservaHabitacion
      SET ID_RHEstado = 2  -- Estado "terminado"
      WHERE ID_Reserva = ? AND ID_RHEstado = 1;  -- Cambiar solo las activas
      `, [idReserva]);
        // Paso 4: Actualizar el estado de las habitaciones en la tabla habitacion a "No disponible" (Estado 5)
        await connection.execute(`
      UPDATE habitacion
      SET ID_Estado_Habitacion = 5  -- Estado "No disponible"
      WHERE ID_Habitacion IN (${habitacionesIds.join(',')});
      `);
        // Paso 5: Actualizar el estado de la factura a "Cancelada" (Estado 3), sin verificar saldo
        await connection.execute(`
      UPDATE factura
      SET ID_estadoFactura = 3  -- Estado "Cancelada"
      WHERE ID_Factura = (
        SELECT r.ID_Factura FROM reserva r WHERE r.ID_Reserva = ?
      );
      `, [idReserva]);
        // Confirmar la actualización exitosa
        return res.status(200).json({
            message: `Reserva cancelada, habitaciones actualizadas al estado "No disponible" y factura cancelada.`,
            habitacionesActualizadas: habitacionesIds.length,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error en el proceso.', error: error instanceof Error ? error.message : error });
    }
    finally {
        connection.release();
    }
};
exports.CancelarReserva = CancelarReserva;
