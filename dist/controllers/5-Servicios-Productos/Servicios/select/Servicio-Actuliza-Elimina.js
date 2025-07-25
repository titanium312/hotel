"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.actualizarMetodoPagoPorFactura = exports.eliminarServicioDeFactura = exports.eliminarFacturaYDetalles = exports.actualizarEstadoFactura = void 0;
const Database_1 = require("../../../../db/Database");
// Conexión al pool de la base de datos
const pool = Database_1.Database.connect();
// ✅ Función para actualizar el estado de una factura
const actualizarEstadoFactura = async (req, res) => {
    const { idFactura, estado } = req.body;
    if (![1, 2, 3].includes(estado)) {
        return res.status(400).json({ error: 'Estado inválido. Usa 1 para Pendiente, 2 para Pagada o 3 para Cancelada.' });
    }
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();
        const [result] = await connection.execute('UPDATE factura SET ID_estadoFactura = ? WHERE ID_Factura = ?', [estado, idFactura]);
        const affectedRows = result.affectedRows;
        if (affectedRows === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({ error: 'Factura no encontrada.' });
        }
        await connection.commit();
        connection.release();
        return res.status(200).json({ message: 'Estado de la factura actualizado con éxito.' });
    }
    catch (error) {
        if (connection)
            await connection.rollback();
        if (connection)
            connection.release();
        console.error('Error al actualizar estado:', error);
        return res.status(500).json({ error: 'Hubo un error al actualizar el estado de la factura.' });
    }
};
exports.actualizarEstadoFactura = actualizarEstadoFactura;
// ✅ Función para eliminar factura y sus detalles
const eliminarFacturaYDetalles = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { ID_Factura } = req.params; // <-- aquí
        if (!ID_Factura) {
            res.status(400).json({ message: 'ID_Factura es requerido' });
            return;
        }
        // Verificar si la factura existe
        const [facturas] = await connection.query(`SELECT ID_Factura FROM factura WHERE ID_Factura = ?`, [ID_Factura]);
        if (facturas.length === 0) {
            res.status(404).json({ message: `Factura con ID ${ID_Factura} no encontrada` });
            return;
        }
        await connection.beginTransaction();
        // Obtener los servicios y cantidades de la factura
        const [detalles] = await connection.query(`SELECT ID_Servicio, Cantidad FROM servicio_detalle WHERE ID_Factura = ?`, [ID_Factura]);
        // Reponer stock de productos usados en cada servicio
        for (const detalle of detalles) {
            const { ID_Servicio, Cantidad: cantidadServicio } = detalle;
            // Obtener productos del servicio
            const [productos] = await connection.query(`SELECT ID_Producto, Cantidad FROM servicio_producto WHERE ID_Servicio = ?`, [ID_Servicio]);
            for (const producto of productos) {
                const cantidadReponer = cantidadServicio * producto.Cantidad;
                await connection.query(`UPDATE producto SET Stock = Stock + ? WHERE ID_Producto = ?`, [cantidadReponer, producto.ID_Producto]);
            }
        }
        // Eliminar los detalles de servicio
        await connection.query(`DELETE FROM servicio_detalle WHERE ID_Factura = ?`, [ID_Factura]);
        // Eliminar la factura
        await connection.query(`DELETE FROM factura WHERE ID_Factura = ?`, [ID_Factura]);
        await connection.commit();
        res.status(200).json({ message: 'Factura eliminada correctamente y stock restaurado' });
    }
    catch (error) {
        await connection.rollback();
        console.error('Error al eliminar la factura:', error);
        res.status(500).json({
            message: 'Error al eliminar la factura',
            error: { message: error.message || 'Error desconocido' }
        });
    }
    finally {
        connection.release();
    }
};
exports.eliminarFacturaYDetalles = eliminarFacturaYDetalles;
// ✅ Función para eliminar un servicio de una factura
const eliminarServicioDeFactura = async (req, res) => {
    const { idFactura, idServicio } = req.body;
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();
        const [result] = await connection.execute('DELETE FROM servicio_detalle WHERE ID_Factura = ? AND ID_Servicio = ?', [idFactura, idServicio]);
        const affectedRows = result.affectedRows;
        if (affectedRows === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({ error: 'Servicio no encontrado en la factura.' });
        }
        await connection.commit();
        connection.release();
        return res.status(200).json({ message: 'Servicio eliminado de la factura con éxito.' });
    }
    catch (error) {
        if (connection)
            await connection.rollback();
        if (connection)
            connection.release();
        console.error('Error al eliminar servicio de factura:', error);
        return res.status(500).json({ error: 'Hubo un error al eliminar el servicio de la factura.' });
    }
};
exports.eliminarServicioDeFactura = eliminarServicioDeFactura;
// ✅ Función para actualizar el método de pago de una factura
const actualizarMetodoPagoPorFactura = async (req, res) => {
    const { idFactura, idMetodoPago } = req.body;
    if (!idFactura || !idMetodoPago) {
        return res.status(400).json({ error: 'Faltan datos: idFactura y idMetodoPago son requeridos.' });
    }
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();
        const [rows] = await connection.query('SELECT * FROM factura WHERE ID_Factura = ?', [idFactura]);
        const facturas = rows;
        if (facturas.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({ error: 'Factura no encontrada.' });
        }
        const [result] = await connection.execute('UPDATE factura SET ID_MetodoPago = ? WHERE ID_Factura = ?', [idMetodoPago, idFactura]);
        await connection.commit();
        connection.release();
        return res.status(200).json({ message: `Método de pago actualizado para la factura ${idFactura}.` });
    }
    catch (error) {
        if (connection)
            await connection.rollback();
        if (connection)
            connection.release();
        console.error('Error al actualizar método de pago:', error);
        return res.status(500).json({ error: 'Error al actualizar método de pago.' });
    }
};
exports.actualizarMetodoPagoPorFactura = actualizarMetodoPagoPorFactura;
