"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServiciosTipo = void 0;
const Database_1 = require("../../../../db/Database"); // Ajusta esta ruta según la ubicación de tu clase Database
// Conexión a la base de datos
const pool = Database_1.Database.connect(); // Suponiendo que 'Database.connect()' es una función que retorna un pool de conexiones
// Controlador para obtener todos los tipos de servicio
const getServiciosTipo = async (req, res) => {
    try {
        // Realizamos la consulta a la base de datos
        const [rows] = await pool.execute('SELECT * FROM servicio_tipo');
        // Devolvemos los resultados como JSON
        res.json(rows);
    }
    catch (error) {
        // En caso de error, respondemos con un error 500
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los tipos de servicio', error });
    }
};
exports.getServiciosTipo = getServiciosTipo;
