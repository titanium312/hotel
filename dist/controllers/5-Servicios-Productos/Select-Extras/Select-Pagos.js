"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerMetodosPagoController = void 0;
const Database_1 = require("../../../db/Database");
const pool = Database_1.Database.connect();
// Controlador para obtener todos los métodos de pago
const obtenerMetodosPagoController = async (req, res) => {
    try {
        // Realizamos la consulta para obtener todos los métodos de pago
        const [rows] = await pool.query(`SELECT * FROM metodoPago`);
        // Enviamos la respuesta con los datos en formato JSON
        res.json(rows);
    }
    catch (error) {
        console.error('Error al obtener los métodos de pago:', error);
        // Si ocurre un error, enviamos una respuesta 500 con un mensaje de error
        res.status(500).json({ message: 'Error al obtener los métodos de pago' });
    }
};
exports.obtenerMetodosPagoController = obtenerMetodosPagoController;
