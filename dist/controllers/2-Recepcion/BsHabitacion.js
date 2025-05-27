"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BsHabitacionController = void 0;
const Database_1 = require("../../db/Database");
// Conexión a la base de datos
const pool = Database_1.Database.connect();
class BsHabitacionController {
    // Obtener todas las habitaciones
    static async getAllHabitaciones(req, res) {
        try {
            // Consulta SQL para obtener todas las habitaciones
            const query = `
        SELECT 
          h.ID_Habitacion AS 'ID Habitacion',
          h.Nombre AS 'Descripción',
          h.Costo AS 'Precio',
          t.Descripcion AS 'Tipo de Habitación',
          e.Descripcion AS 'Estado de la Habitación',
          p.Descripcion AS 'Piso'
        FROM 
          habitacion h
        JOIN 
          estado_habitacion e ON h.ID_Estado_Habitacion = e.ID_Estado_Habitacion
        JOIN 
          tipo_habitacion t ON h.ID_Tipo_Habitacion = t.ID_Tipo_Habitacion
        JOIN 
          Piso p ON h.ID_Piso = p.ID_Piso;
      `;
            // Ejecutamos la consulta para obtener todas las habitaciones
            const [habitaciones] = await pool.query(query);
            // Realizamos el casting de la respuesta para que TypeScript sepa que es un arreglo de objetos
            const resultado = habitaciones;
            // Si no se encuentran habitaciones, devolvemos un error 404
            if (resultado.length === 0) {
                res.status(404).json({ message: 'No se encontraron habitaciones' });
            }
            else {
                // Devolvemos todas las habitaciones encontradas
                res.json(resultado);
            }
        }
        catch (err) {
            if (typeof err === 'object' && err !== null && 'message' in err) {
                const error = err;
                console.error('Error al obtener las habitaciones:', error.message);
                res.status(500).json({ message: 'Error al obtener las habitaciones', error: error.message });
            }
            else {
                console.error('Error desconocido:', err);
                res.status(500).json({ message: 'Error desconocido al obtener las habitaciones' });
            }
        }
    }
    // Obtener habitación por ID
    static async getHabitacionById(req, res) {
        const { id } = req.params; // Recuperamos el ID de la habitación desde los parámetros de la solicitud
        try {
            // Consulta SQL para obtener la habitación por ID (usamos el valor dinámico 'id' pasado desde la solicitud)
            const query = `
SELECT 
    h.ID_Habitacion AS 'ID Habitacion',
    h.Nombre AS 'Descripción',
    h.Costo AS 'Precio',
    t.Descripcion AS 'Tipo de Habitación',
    e.Descripcion AS 'Estado de la Habitación',
    p.Descripcion AS 'Piso'
FROM 
    habitacion h
JOIN 
    estado_habitacion e ON h.ID_Estado_Habitacion = e.ID_Estado_Habitacion
JOIN 
    tipo_habitacion t ON h.ID_Tipo_Habitacion = t.ID_Tipo_Habitacion
JOIN 
    Piso p ON h.ID_Piso = p.ID_Piso
WHERE 
    h.ID_Habitacion = ?;  -- Usamos el ID proporcionado en la solicitud
      `;
            // Ejecutamos la consulta con el ID proporcionado dinámicamente
            const [habitacion] = await pool.query(query, [id]);
            // Realizamos el casting de la respuesta para que TypeScript sepa que es un arreglo de objetos
            const resultado = habitacion;
            // Si no se encuentra la habitación, devolvemos un error 404
            if (resultado.length === 0) {
                res.status(404).json({ message: 'Habitación no encontrada' });
            }
            else {
                // Devolvemos la habitación encontrada
                res.json(resultado[0]); // 'resultado' es un arreglo, tomamos el primer elemento
            }
        }
        catch (err) {
            if (typeof err === 'object' && err !== null && 'message' in err) {
                const error = err;
                console.error('Error al obtener la habitación:', error.message);
                res.status(500).json({ message: 'Error al obtener la habitación', error: error.message });
            }
            else {
                console.error('Error desconocido:', err);
                res.status(500).json({ message: 'Error desconocido al obtener la habitación' });
            }
        }
    }
}
exports.BsHabitacionController = BsHabitacionController;
