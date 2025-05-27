"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDetallesFacturasConPagos = void 0;
const Database_1 = require("../../db/Database"); // Importa la clase de la base de datos
// Crea el pool de conexiones de la base de datos
const pool = Database_1.Database.connect();
// Función para obtener los detalles de las facturas con pagos
const getDetallesFacturasConPagos = async (req, res) => {
    try {
        const connection = await pool;
        const [rows] = await connection.execute(`
      SELECT 
        f.ID_Factura,
        f.Fecha_Emision,
        f.Total,
        f.ID_estadoFactura,
        f.TipoFactura,
        f.Descuento,
        f.Adelanto,
        p.ID_Factura AS Pago_ID_Factura,
        p.Monto AS Pago_Monto,
        p.Fecha_Pago,
        p.ID_MetodoPago
      FROM 
        factura f
      LEFT JOIN 
        Pagos p ON f.ID_Factura = p.ID_Factura;
    `);
        res.json({ detallesFacturasConPagos: rows });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los detalles de las facturas con pagos.' });
    }
};
exports.getDetallesFacturasConPagos = getDetallesFacturasConPagos;
