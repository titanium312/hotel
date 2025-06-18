import { Request, Response } from 'express';
import mysql from 'mysql2/promise';
import { Database } from '../../../db/Database';

const pool = Database.connect();

export const ServicioListaRecep = async (req: Request, res: Response): Promise<Response> => {
    try {
        const connection = await pool.getConnection();

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
                u.nombre_usuario AS Nombre_Usuario_Factura,
                GROUP_CONCAT(DISTINCT mp.Descripcion ORDER BY p.Fecha_Pago SEPARATOR ', ') AS Metodos_Pago
            FROM
                factura f
            JOIN
                servicio_detalle sd ON f.ID_Factura = sd.ID_Factura
            JOIN
                servicio s ON sd.ID_Servicio = s.ID_Servicio
            JOIN
                estadofactura ef ON f.ID_estadoFactura = ef.ID_EstadoFactura
            JOIN
                servicio_tipo_relacion str ON s.ID_Servicio = str.ID_Servicio
            JOIN
                servicio_tipo st ON str.ID_Servicio_tipo = st.ID_producto_tipo
            JOIN
                usuarios u ON f.ID_usuario = u.id
            LEFT JOIN
                pagos p ON f.ID_Factura = p.ID_Factura
            LEFT JOIN
                metodopago mp ON p.ID_MetodoPago = mp.ID_MetodoPago
            WHERE
                st.Descripcion = 'Restaurante'
            GROUP BY
                f.ID_Factura,
                s.Nombre,
                sd.Cantidad,
                sd.Total,
                ef.Descripcion,
                f.Fecha_Emision,
                st.Descripcion,
                sd.mesa,
                u.nombre_usuario;
        `;

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
                u.nombre_usuario AS Nombre_Usuario_Factura,
                GROUP_CONCAT(DISTINCT mp.Descripcion ORDER BY p.Fecha_Pago SEPARATOR ', ') AS Metodos_Pago
            FROM
                factura f
            JOIN
                servicio_detalle sd ON f.ID_Factura = sd.ID_Factura
            JOIN
                servicio s ON sd.ID_Servicio = s.ID_Servicio
            JOIN
                estadofactura ef ON f.ID_estadoFactura = ef.ID_EstadoFactura
            JOIN
                servicio_tipo_relacion str ON s.ID_Servicio = str.ID_Servicio
            JOIN
                servicio_tipo st ON str.ID_Servicio_tipo = st.ID_producto_tipo
            JOIN
                usuarios u ON f.ID_usuario = u.id
            LEFT JOIN
                pagos p ON f.ID_Factura = p.ID_Factura
            LEFT JOIN
                metodopago mp ON p.ID_MetodoPago = mp.ID_MetodoPago
            WHERE
                st.Descripcion = 'Bar'
            GROUP BY
                f.ID_Factura,
                s.Nombre,
                sd.Cantidad,
                sd.Total,
                ef.Descripcion,
                f.Fecha_Emision,
                st.Descripcion,
                sd.mesa,
                u.nombre_usuario;
        `;

        const [rowsRestaurante] = await connection.execute(queryRestaurante);
        const [rowsBar] = await connection.execute(queryBar);

        connection.release();

        return res.status(200).json({
            Restaurante: rowsRestaurante,
            Bar: rowsBar
        });
    } catch (error: any) {
        console.error('Error al obtener los servicios:', error);
        return res.status(500).json({
            error: 'Hubo un problema al obtener los servicios.',
            message: error.message,
            sql: error.sql,
            code: error.code
        });
    }
};
