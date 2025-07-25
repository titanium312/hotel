"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agregarFactura = void 0;
const Database_1 = require("../../../db/Database");
// Conexión a la base de datos
const pool = Database_1.Database.connect();
const agregarFactura = async (req, res) => {
    const connection = await pool.getConnection();
    const { productos, proveedorId, tipoFactura, metodoPago, descuento = 0, adelanto = 0 } = req.body;
    try {
        await connection.beginTransaction();
        if (!Array.isArray(productos) || productos.length === 0) {
            throw new Error('La lista de productos no puede estar vacía.');
        }
        if (![1, 2].includes(tipoFactura)) {
            throw new Error('Tipo de factura inválido. Debe ser 1 (entrada) o 2 (venta).');
        }
        const totalFactura = calcularTotal(productos);
        // Insertar factura
        const [facturaResult] = await connection.query(`INSERT INTO factura (Fecha_Emision, Total, ID_estadoFactura, TipoFactura, Descuento, Adelanto, ID_MetodoPago)
       VALUES (CURRENT_DATE, ?, 1, ?, ?, ?, ?)`, [totalFactura, tipoFactura, descuento, adelanto, metodoPago]);
        const facturaId = facturaResult.insertId;
        for (const producto of productos) {
            const { idProducto, cantidad, precioCompra } = producto;
            if (!idProducto || cantidad <= 0 || precioCompra < 0) {
                throw new Error('Datos inválidos para producto en la factura.');
            }
            if (tipoFactura === 1) {
                // Entrada (compra): aumentar stock y registrar entrada
                await connection.query(`INSERT INTO entrada (ID_Producto, Cantidad, Precio_Compra)
           VALUES (?, ?, ?)`, [idProducto, cantidad, precioCompra]);
                await connection.query(`UPDATE producto SET Stock = Stock + ? WHERE ID_Producto = ?`, [cantidad, idProducto]);
            }
            else if (tipoFactura === 2) {
                // Salida (venta): validar stock, disminuir stock y registrar salida
                const [rows] = await connection.query(`SELECT Stock FROM producto WHERE ID_Producto = ?`, [idProducto]);
                const stockActual = (rows[0]?.Stock ?? 0);
                if (stockActual < cantidad) {
                    throw new Error(`Stock insuficiente para producto ID ${idProducto}. Disponible: ${stockActual}, solicitado: ${cantidad}`);
                }
                // Aquí puedes crear tabla `salida` o registrar en otra tabla similar si la tienes
                // Por ahora solo actualizamos stock y registramos detalles
                await connection.query(`UPDATE producto SET Stock = Stock - ? WHERE ID_Producto = ?`, [cantidad, idProducto]);
            }
            // Registrar detalles de factura (común para entrada y salida)
            await connection.query(`INSERT INTO detallesProducto (ID_Factura, ID_Producto, Cantidad, Fecha_emicion)
         VALUES (?, ?, ?, CURRENT_DATE)`, [facturaId, idProducto, cantidad]);
        }
        await connection.commit();
        res.status(200).json({ message: 'Factura registrada exitosamente', facturaId });
    }
    catch (error) {
        await connection.rollback();
        if (error instanceof Error) {
            console.error('Error al registrar la factura:', error.message);
            res.status(500).json({ message: 'Error al registrar la factura', error: error.message });
        }
        else {
            console.error('Error desconocido al registrar la factura');
            res.status(500).json({ message: 'Error desconocido al registrar la factura' });
        }
    }
    finally {
        connection.release();
    }
};
exports.agregarFactura = agregarFactura;
// Función para calcular el total de la factura
const calcularTotal = (productos) => {
    return productos.reduce((total, { cantidad, precioCompra }) => total + cantidad * precioCompra, 0);
};
