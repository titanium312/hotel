"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicioListaRecep = void 0;
const Database_1 = require("../../../db/Database");
const pool = Database_1.Database.connect();
const ServicioListaRecep = async (req, res) => {
    try {
        // Establecer conexión con la base de datos
        const connection = await pool.getConnection();
        // Consulta SQL para obtener la lista de servicios para Restaurante
        const queryRestaurante = `
            SELECT
                f.ID_Factura,
                s.Nombre AS Nombre_Servicio,
                sd.Cantidad,
                sd.Total / sd.Cantidad AS Precio_Unitario,
                sd.Total,
                ef.Descripcion AS Estado_Servicio,
                f.Fecha_Emision,
                st.Descripcion AS Tipo_Servicio,
                sd.mesa,
                u.nombre_usuario AS Nombre_Usuario_Factura
            FROM
                factura f
            JOIN
                servicio_detalle sd ON f.ID_Factura = sd.ID_Factura
            JOIN
                servicio s ON sd.ID_Servicio = s.ID_Servicio
            JOIN
                EstadoFactura ef ON f.ID_estadoFactura = ef.ID_EstadoFactura
            JOIN
                servicio_tipo_relacion str ON s.ID_Servicio = str.ID_Servicio
            JOIN
                Servicio_tipo st ON str.ID_Servicio_tipo = st.ID_producto_tipo
            JOIN
                usuarios u ON f.ID_usuario = u.id
            WHERE
                st.Descripcion = 'Restaurante';
        `;
        // Consulta SQL para obtener la lista de servicios para Bar
        const queryBar = `
            SELECT
                f.ID_Factura,
                s.Nombre AS Nombre_Servicio,
                sd.Cantidad,
                sd.Total / sd.Cantidad AS Precio_Unitario,
                sd.Total,
                ef.Descripcion AS Estado_Servicio,
                f.Fecha_Emision,
                st.Descripcion AS Tipo_Servicio,
                sd.mesa,
                u.nombre_usuario AS Nombre_Usuario_Factura
            FROM
                factura f
            JOIN
                servicio_detalle sd ON f.ID_Factura = sd.ID_Factura
            JOIN
                servicio s ON sd.ID_Servicio = s.ID_Servicio
            JOIN
                EstadoFactura ef ON f.ID_estadoFactura = ef.ID_EstadoFactura
            JOIN
                servicio_tipo_relacion str ON s.ID_Servicio = str.ID_Servicio
            JOIN
                Servicio_tipo st ON str.ID_Servicio_tipo = st.ID_producto_tipo
            JOIN
                usuarios u ON f.ID_usuario = u.id
            WHERE
                st.Descripcion = 'Bar';
        `;
        // Ejecutar ambas consultas
        const [rowsRestaurante] = await connection.execute(queryRestaurante);
        const [rowsBar] = await connection.execute(queryBar);
        connection.release(); // Liberar la conexión
        // Devolver los resultados de ambas consultas
        return res.status(200).json({
            Restaurante: rowsRestaurante,
            Bar: rowsBar
        });
    }
    catch (error) {
        console.error('Error al obtener los servicios:', error);
        return res.status(500).json({ error: 'Hubo un problema al obtener los servicios.' });
    }
};
exports.ServicioListaRecep = ServicioListaRecep;
