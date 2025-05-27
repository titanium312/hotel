"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetodoPago = void 0;
const Database_1 = require("../../../db/Database"); // Asegúrate de que esta importación sea correcta
const pool = Database_1.Database.connect(); // Conexión a la base de datos
class MetodoPago {
    // Obtener todos los métodos de pago
    static async getMetodoPago(req, res) {
        try {
            // Realizamos la consulta SQL para obtener los métodos de pago
            const [rows] = await pool.query('SELECT * FROM MetodoPago');
            // Enviamos la respuesta con los datos obtenidos
            res.status(200).json(rows);
        }
        catch (error) {
            console.error('Error al obtener los métodos de pago:', error);
            res.status(500).json({ message: 'Error al obtener los métodos de pago' });
        }
    }
}
exports.MetodoPago = MetodoPago;
