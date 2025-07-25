"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstadisticasController = void 0;
const Database_1 = require("../../db/Database");
const pool = Database_1.Database.connect();
class EstadisticasController {
    // Función para obtener las estadísticas
    static async obtenerEstadisticas(req, res) {
        try {
            const query = `
      SELECT
        COUNT(*) AS 'Total de Habitaciones',
        SUM(CASE WHEN eh.Descripcion = 'Disponible' THEN 1 ELSE 0 END) AS 'Habitaciones Libres',
        SUM(CASE WHEN eh.Descripcion = 'Ocupada' THEN 1 ELSE 0 END) AS 'Habitaciones Ocupadas',
        (
          SELECT COUNT(*)
          FROM reserva r
          JOIN reservahabitacion rh ON r.ID_Reserva = rh.ID_Reserva
          WHERE r.Fecha_Ingreso = CURRENT_DATE
        ) AS 'Habitaciones Reservadas Hoy'
      FROM habitacion h
      JOIN estado_habitacion eh ON h.ID_Estado_Habitacion = eh.ID_Estado_Habitacion
    `;
            const [result] = await pool.query(query);
            const estadisticas = result[0];
            // Siempre habrá resultados (al menos ceros)
            res.json({
                success: true,
                data: estadisticas
            });
        }
        catch (err) {
            console.error('Error en obtenerEstadisticas:', err);
            res.status(500).json({
                success: false,
                message: 'Error interno al obtener las estadísticas',
                error: process.env.NODE_ENV === 'development' && err instanceof Error ? err.message : undefined
            });
        }
    }
    // Función para obtener las reservas activas
    static async obtenerReservasActivas(req, res) {
        try {
            const query = `
        SELECT
          c.ID_Cliente,
          CONCAT_WS(' ', c.Nombre1, c.Nombre2) AS Nombres,
          CONCAT_WS(' ', c.Apellido1, c.Apellido2) AS Apellidos,
          h.Nombre AS Nombre_Habitacion,
          h.Costo AS Tarifa,
          t.Descripcion AS Tipo,
          r.Fecha_Ingreso
        FROM
          reserva r
        JOIN
          cliente c ON r.ID_Cliente = c.ID_Cliente
        JOIN
          reservahabitacion rh ON r.ID_Reserva = rh.ID_Reserva
        JOIN
          habitacion h ON rh.ID_Habitacion = h.ID_Habitacion
        JOIN
          tipo_habitacion t ON h.ID_Tipo_Habitacion = t.ID_Tipo_Habitacion
        JOIN
          rhestado re ON rh.ID_RHEstado = re.ID_RHEstado
        WHERE
          r.Fecha_Ingreso IS NOT NULL
          AND re.Descripcion = 'Activo';  -- Asegúrate de que 'Activo' es el estado que buscas
      `;
            // Ejecutamos la consulta
            const [result] = await pool.query(query);
            const reservas = result;
            res.status(200).json(reservas); // Siempre devolvemos la lista, vacía o no
        }
        catch (err) {
            res.status(500).json({ message: 'Error al obtener las reservas activas', error: err });
        }
    }
}
exports.EstadisticasController = EstadisticasController;
