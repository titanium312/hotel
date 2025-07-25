"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.actualizar = void 0;
const Database_1 = require("../../../db/Database");
const app_1 = require("../../../app");
const pool = Database_1.Database.connect();
const actualizar = async (req, res) => {
    const { Actulizar, Cerrar } = req.body;
    if (typeof Actulizar !== 'number' || typeof Cerrar !== 'number') {
        return res.status(400).json({ error: 'Los valores Actulizar y Cerrar deben ser números.' });
    }
    try {
        const connection = await pool.getConnection();
        const [result] = await connection.execute(`UPDATE actualizar SET Actulizar = ?, Cerrar = ? WHERE ID = 1`, [Actulizar, Cerrar]);
        connection.release();
        if (result.affectedRows > 0) {
            (0, app_1.notifyClients)('Datos actualizados correctamente');
            return res.status(200).json({ message: 'Datos actualizados correctamente.' });
        }
        else {
            return res.status(404).json({ error: 'No se encontró el registro con el ID 1 para actualizar.' });
        }
    }
    catch (error) {
        console.error('Error al actualizar:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return res.status(500).json({ error: 'Error interno del servidor.', details: errorMessage });
    }
};
exports.actualizar = actualizar;
