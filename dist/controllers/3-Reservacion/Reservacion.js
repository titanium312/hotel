"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservaController = void 0;
const Database_1 = require("../../db/Database");
const pool = Database_1.Database.connect(); // Se conecta a la base de datos usando el pool de conexiones.
class ReservaController {
    // Método para obtener los detalles de la reserva, habitación y cliente
    static async getReservaHabitacionCliente(req, res) {
        try {
            // Ejecutamos el query con el JOIN necesario para obtener la información de las reservas, habitaciones y clientes
            const [result] = await pool.query(`
        SELECT
          h.ID_Habitacion,
          r.ID_Reserva,
          re.Descripcion AS Estado_Reserva,  -- Usamos la columna 'Descripcion' de la tabla RHEstado
          c.Nombre1,
          r.Fecha_Ingreso AS Fecha_Entrada,
          r.Fecha_Salida AS Fecha_Salida
        FROM
          reserva r
        JOIN
          reservahabitacion rh ON r.ID_Reserva = rh.ID_Reserva
        JOIN
          habitacion h ON rh.ID_Habitacion = h.ID_Habitacion
        JOIN
          cliente c ON r.ID_Cliente = c.ID_Cliente
        JOIN
          RHEstado re ON rh.ID_RHEstado = re.ID_RHEstado;
      `);
            // Convertimos el resultado en un arreglo de filas
            const reservas = result; // Aseguramos que el resultado es un arreglo de filas
            // Si no se encontraron reservas, respondemos con un error 404
            if (reservas.length === 0) {
                res.status(404).json({ message: 'No se encontraron reservas con las habitaciones y clientes asociados' });
            }
            else {
                // Si se encontraron resultados, respondemos con los datos obtenidos
                res.json(reservas);
            }
        }
        catch (err) {
            // Manejo de errores, asegurándonos de capturar errores específicos
            if (typeof err === 'object' && err !== null && 'message' in err) {
                const error = err;
                console.error('Error al obtener las reservas y habitaciones:', error.message); // Log de error detallado
                res.status(500).json({ message: 'Error al obtener las reservas y habitaciones', error: error.message });
            }
            else {
                console.error('Error desconocido:', err); // Log genérico para otros tipos de error
                res.status(500).json({ message: 'Error desconocido al obtener las reservas y habitaciones' });
            }
        }
    }
}
exports.ReservaController = ReservaController;
