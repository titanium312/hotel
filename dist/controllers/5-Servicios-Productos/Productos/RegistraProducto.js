"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eliminarProducto = exports.getProductoTipos = exports.getProvedores = exports.getUnidades = exports.createOrUpdateProduct = void 0;
const Database_1 = require("../../../db/Database");
const pool = Database_1.Database.connect();
// Validación de datos del producto
const validateProductData = (data) => {
    if (data.ID_Producto !== undefined && data.ID_Producto !== null && isNaN(Number(data.ID_Producto))) {
        return 'El ID_Producto debe ser un número válido';
    }
    if (!data.nombre || !data.descripcion || !data.ID_producto_tipo) {
        return 'Faltan datos requeridos (nombre, descripcion, ID_producto_tipo)';
    }
    if (data.Precio_Unitario !== undefined && isNaN(Number(data.Precio_Unitario))) {
        return 'El Precio_Unitario debe ser un número válido';
    }
    if (data.Stock !== undefined && isNaN(Number(data.Stock))) {
        return 'El Stock debe ser un número válido';
    }
    if (data.ID_Provedor !== undefined && data.ID_Provedor !== null && isNaN(Number(data.ID_Provedor))) {
        return 'El ID_Provedor debe ser un número válido';
    }
    if (isNaN(Number(data.ID_producto_tipo))) {
        return 'El ID_producto_tipo debe ser un número válido';
    }
    if (data.ID_Unidad !== undefined && data.ID_Unidad !== null && isNaN(Number(data.ID_Unidad))) {
        return 'El ID_Unidad debe ser un número válido';
    }
    return null;
};
// Crear o actualizar producto
const createOrUpdateProduct = async (req, res) => {
    console.log('Cuerpo de la solicitud:', req.body);
    const { ID_Producto, nombre, descripcion, Precio_Unitario, Stock = 0, ID_Provedor = null, ID_producto_tipo, ID_Unidad = null, } = req.body;
    const validationError = validateProductData(req.body);
    if (validationError) {
        res.status(400).json({ error: validationError });
        return;
    }
    let connection;
    try {
        connection = await pool.getConnection();
        if (ID_Producto !== undefined && ID_Producto !== null) {
            // Intentar primero actualizar producto
            const [result] = await connection.execute(`UPDATE producto
         SET Nombre = ?, Descripcion = ?, Precio_Unitario = ?, Stock = ?, ID_Provedor = ?, ID_producto_tipo = ?, ID_Unidad = ?
         WHERE ID_Producto = ?`, [nombre, descripcion, Precio_Unitario, Stock, ID_Provedor, ID_producto_tipo, ID_Unidad, ID_Producto]);
            const updateResult = result;
            if (updateResult.affectedRows === 0) {
                // No existe, intentar insertar con ID manual
                const [insertResult] = await connection.execute(`INSERT INTO producto (ID_Producto, Nombre, Descripcion, Precio_Unitario, Stock, ID_Provedor, ID_producto_tipo, ID_Unidad)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [ID_Producto, nombre, descripcion, Precio_Unitario, Stock, ID_Provedor, ID_producto_tipo, ID_Unidad]);
                res.status(201).json({
                    message: 'Producto creado exitosamente con ID manual',
                    insertedId: ID_Producto,
                });
                return;
            }
            res.status(200).json({
                message: 'Producto actualizado exitosamente',
                updatedId: ID_Producto,
            });
        }
        else {
            // Crear producto nuevo sin ID (auto_increment)
            const [result] = await connection.execute(`INSERT INTO producto
         (Nombre, Descripcion, Precio_Unitario, Stock, ID_Provedor, ID_producto_tipo, ID_Unidad)
         VALUES (?, ?, ?, ?, ?, ?, ?)`, [nombre, descripcion, Precio_Unitario, Stock, ID_Provedor, ID_producto_tipo, ID_Unidad]);
            const insertResult = result;
            res.status(201).json({
                message: 'Producto creado exitosamente',
                insertedId: insertResult.insertId,
            });
        }
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('Error al crear o actualizar el producto:', error.message);
            res.status(500).json({ error: 'Error al crear o actualizar el producto', details: error.message });
        }
        else {
            console.error('Error desconocido:', error);
            res.status(500).json({ error: 'Error desconocido' });
        }
    }
    finally {
        if (connection)
            connection.release();
    }
};
exports.createOrUpdateProduct = createOrUpdateProduct;
// Obtener unidades
const getUnidades = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM unidad');
        res.json(rows);
    }
    catch (error) {
        console.error('Error al obtener unidades:', error);
        res.status(500).json({ error: 'Error al obtener unidades' });
    }
};
exports.getUnidades = getUnidades;
// Obtener provedores
const getProvedores = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM provedor');
        res.json(rows);
    }
    catch (error) {
        console.error('Error al obtener provedores:', error);
        res.status(500).json({ error: 'Error al obtener provedores' });
    }
};
exports.getProvedores = getProvedores;
// Obtener tipos de producto
const getProductoTipos = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM producto_tipo');
        res.json(rows);
    }
    catch (error) {
        console.error('Error al obtener tipos de producto:', error);
        res.status(500).json({ error: 'Error al obtener tipos de producto' });
    }
};
exports.getProductoTipos = getProductoTipos;
// Eliminar producto
const eliminarProducto = async (req, res) => {
    const { id } = req.params;
    if (isNaN(Number(id))) {
        res.status(400).json({ error: 'El ID debe ser un número válido' });
        return;
    }
    let connection;
    try {
        connection = await pool.getConnection();
        const [result] = await connection.execute('DELETE FROM producto WHERE ID_Producto = ?', [id]);
        const deleteResult = result;
        if (deleteResult.affectedRows === 0) {
            res.status(404).json({ message: `No se encontró producto con ID ${id}` });
            return;
        }
        res.status(200).json({ message: `Producto con ID ${id} eliminado correctamente` });
    }
    catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ error: 'Error al eliminar producto' });
    }
    finally {
        if (connection)
            connection.release();
    }
};
exports.eliminarProducto = eliminarProducto;
