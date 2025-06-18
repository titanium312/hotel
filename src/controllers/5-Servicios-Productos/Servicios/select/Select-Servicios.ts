import { Request, Response } from 'express';
import mysql from 'mysql2/promise';
import { Database } from '../../../../db/Database';

const pool = Database.connect();

export const getServicios = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tipo_servicio } = req.query;

    let tipoServicioArray: string[] = [];

    // Validar y normalizar tipo_servicio en array de strings sin valores vacíos
    if (Array.isArray(tipo_servicio)) {
      tipoServicioArray = tipo_servicio
        .filter((item): item is string => typeof item === 'string')
        .map(item => item.trim())
        .filter(item => item.length > 0);
    } else if (typeof tipo_servicio === 'string') {
      const trimmed = tipo_servicio.trim();
      if (trimmed.length > 0) tipoServicioArray = [trimmed];
    }

    let query = `
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
          mp.Descripcion AS Metodo_Pago
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
          MetodoPago mp ON f.ID_MetodoPago = mp.ID_MetodoPago
    `;

    const queryParams: string[] = [];

    if (tipoServicioArray.length > 0) {
      const placeholders = tipoServicioArray.map(() => '?').join(', ');
      query += ` WHERE st.Descripcion IN (${placeholders})`;
      queryParams.push(...tipoServicioArray);
    } else {
      query += ` WHERE st.Descripcion IN ('Restaurante', 'Bar')`; // por defecto
    }

    query += `
      GROUP BY
          f.ID_Factura,
          s.Nombre,
          sd.Cantidad,
          sd.Total,
          ef.Descripcion,
          f.Fecha_Emision,
          st.Descripcion,
          sd.mesa,
          u.nombre_usuario,
          mp.Descripcion
    `;

    const [rows] = await pool.query<mysql.RowDataPacket[]>(query, queryParams);

    if (rows.length === 0) {
      res.status(404).json({ message: 'No se encontraron servicios.' });
      return;
    }

    // Agrupar por tipo de servicio
    const serviciosPorTipo: { [key: string]: any[] } = {};

    rows.forEach(servicio => {
      const tipo = servicio.Tipo_Servicio;
      if (!serviciosPorTipo[tipo]) {
        serviciosPorTipo[tipo] = [];
      }
      serviciosPorTipo[tipo].push(servicio);
    });

    res.status(200).json(serviciosPorTipo);
  } catch (error) {
    console.error('Error en getServicios:', error);
    res.status(500).json({ message: 'Error al obtener los servicios.', error });
  }
};
