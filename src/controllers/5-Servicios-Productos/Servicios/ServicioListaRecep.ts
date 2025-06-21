import { Request, Response } from 'express';
import { Database } from '../../../db/Database';

const pool = Database.connect();
export const ServicioListaRecep = async (req: Request, res: Response): Promise<Response> => {
    try {
        const connection = await pool.getConnection();

        const idFactura = req.query.idFactura ? parseInt(req.query.idFactura as string, 10) : null;
        const fechaInicio = req.query.fechaInicio as string | undefined;
        const fechaFin = req.query.fechaFin as string | undefined;

const buildQuery = (tipo: string, withFilter: boolean, withFecha: boolean) => `
    SELECT
        f.ID_Factura,
        s.ID_Servicio,
        s.Nombre AS Nombre_Servicio,
        sd.Cantidad,
        sd.Total / sd.Cantidad AS Precio_Unitario,
        sd.Total,
        ef.Descripcion AS Estado_Servicio,
        f.Fecha_Emision,
        st.Descripcion AS Tipo_Servicio,
        sd.mesa,
        u.nombre_usuario AS Nombre_Usuario_Factura,
        mp.Descripcion AS Metodo_Pago
    FROM factura f
    JOIN servicio_detalle sd ON f.ID_Factura = sd.ID_Factura
    JOIN servicio s ON sd.ID_Servicio = s.ID_Servicio
    JOIN estadofactura ef ON f.ID_estadoFactura = ef.ID_EstadoFactura
    JOIN servicio_tipo_relacion str ON s.ID_Servicio = str.ID_Servicio
    JOIN servicio_tipo st ON str.ID_Servicio_tipo = st.ID_producto_tipo
    JOIN usuarios u ON f.ID_usuario = u.id
    LEFT JOIN metodoPago mp ON f.ID_MetodoPago = mp.ID_MetodoPago
    WHERE st.Descripcion = ?
    ${withFilter ? 'AND f.ID_Factura = ?' : ''}
    ${withFecha ? 'AND f.Fecha_Emision BETWEEN ? AND ?' : ''}
    LIMIT 100;
`;

        const paramsRestaurante: any[] = ['Restaurante'];
        if (idFactura) paramsRestaurante.push(idFactura);
        if (fechaInicio && fechaFin) paramsRestaurante.push(fechaInicio, fechaFin);

        const paramsBar: any[] = ['Bar'];
        if (idFactura) paramsBar.push(idFactura);
        if (fechaInicio && fechaFin) paramsBar.push(fechaInicio, fechaFin);

        const [rowsRestaurante] = await connection.execute(
            buildQuery('Restaurante', !!idFactura, !!(fechaInicio && fechaFin)),
            paramsRestaurante
        );

        const [rowsBar] = await connection.execute(
            buildQuery('Bar', !!idFactura, !!(fechaInicio && fechaFin)),
            paramsBar
        );

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

