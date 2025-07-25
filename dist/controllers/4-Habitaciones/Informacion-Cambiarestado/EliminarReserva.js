"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ver = exports.actualizar = void 0;
const Database_1 = require("../../../db/Database");
// Desde src/controllers o cualquier otra subcarpeta dentro de src
const app_1 = require("../../../app"); // Ajusta la ruta según sea necesario
const pool = Database_1.Database.connect();
const actualizar = async (req, res) => {
    const { Actualizar, Cerrar } = req.body;
    // Validar que los valores son números
    if (typeof Actualizar !== 'number' || typeof Cerrar !== 'number') {
        return res.status(400).json({ error: 'Los valores Actualizar y Cerrar deben ser números.' });
    }
    try {
        const connection = await pool.getConnection();
        // Realizar la actualización
        const [result] = await connection.execute(`UPDATE actualizar SET Actulizar = ?, Cerrar = ? WHERE ID = 1`, [Actualizar, Cerrar]);
        // Liberar la conexión
        connection.release();
        // Verificar si la actualización fue exitosa
        if (result.affectedRows > 0) {
            // Notificar a los clientes conectados
            (0, app_1.notifyClients)('Datos actualizados correctamente.'); // Llamar a la función que notifica a los clientes
            return res.status(200).json({ message: 'Datos actualizados correctamente.' });
        }
        else {
            return res.status(404).json({ error: 'No se encontró el registro con el ID 1 para actualizar.' });
        }
    }
    catch (error) {
        console.error('Error al actualizar:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        const errorStack = error instanceof Error ? error.stack : 'No hay detalles de stack disponibles';
        return res.status(500).json({
            error: 'Error interno del servidor.',
            details: errorStack || errorMessage,
        });
    }
};
exports.actualizar = actualizar;
const ver = async (req, res) => {
    try {
        // Obtener una conexión
        const connection = await pool.getConnection();
        // Consultar los datos
        const [rows] = await connection.execute(`SELECT * FROM actualizar WHERE ID = 1`);
        // Si no se encuentra el registro, insertarlo
        if (rows.length === 0) {
            await connection.execute(`INSERT INTO actualizar (ID, Actulizar, Cerrar) VALUES (1, 0, 0)` // Cambié Actualizar a Actulizar aquí también
            );
            // Volver a obtener los datos después de insertar
            const [newRows] = await connection.execute(`SELECT * FROM actualizar WHERE ID = 1`);
            // Liberar la conexión
            connection.release();
            return res.status(200).json(newRows);
        }
        // Liberar la conexión
        connection.release();
        // Devolver los datos existentes
        return res.status(200).json(rows);
    }
    catch (error) {
        console.error('Error al obtener los datos:', error);
        // Verificar si error es una instancia de Error y acceder a sus propiedades
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        const errorStack = error instanceof Error ? error.stack : 'No hay detalles de stack disponibles';
        return res.status(500).json({
            error: 'Error interno del servidor.',
            details: errorStack || errorMessage, // Mostrar detalles del error
        });
    }
};
exports.ver = ver;
