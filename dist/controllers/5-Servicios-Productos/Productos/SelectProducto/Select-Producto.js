"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Database_1 = require("../../../../db/Database");
const pool = Database_1.Database.connect();
const obtenerProductos = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                p.ID_Producto AS ID,
                p.Nombre,
                p.Descripcion,
                p.Precio_Unitario,
                p.Stock,
                pr.Nombre AS Proveedor,
                pt.Descripcion AS Tipo,
                u.Descripcion AS Unidad,
                GROUP_CONCAT(s.Nombre SEPARATOR ', ') AS Servicios_Consumidores
            FROM producto p
            LEFT JOIN provedor pr ON p.ID_Provedor = pr.ID_Provedor
            LEFT JOIN producto_tipo pt ON p.ID_producto_tipo = pt.ID_producto_tipo
            LEFT JOIN unidad u ON p.ID_Unidad = u.ID_Unidad
            LEFT JOIN servicio_producto sp ON p.ID_Producto = sp.ID_Producto
            LEFT JOIN servicio s ON sp.ID_Servicio = s.ID_Servicio
            GROUP BY p.ID_Producto
        `);
        res.json(rows);
    }
    catch (error) {
        console.error('Error al obtener los productos:', error);
        res.status(500).json({ message: 'Error al obtener los productos' });
    }
};
exports.default = obtenerProductos;
