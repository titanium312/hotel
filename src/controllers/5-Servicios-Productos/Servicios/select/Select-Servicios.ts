import { Request, Response } from 'express';
import { Database } from '../../../../db/Database';

const pool = Database.connect();

export const getServicios = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tipo_servicio } = req.query;

    // Normalizar tipo_servicio a un array de strings limpio
    let tipoServicioArray: string[] = [];

    if (Array.isArray(tipo_servicio)) {
      tipoServicioArray = tipo_servicio
        .filter((item): item is string => typeof item === 'string')
        .map(item => item.trim())
        .filter(item => item.length > 0);
    } else if (typeof tipo_servicio === 'string') {
      const trimmed = tipo_servicio.trim();
      if (trimmed.length > 0) tipoServicioArray = [trimmed];
    }

    if (tipoServicioArray.length === 0) {
      // Si no se envía ningún tipo, devolver error o todos (según tu lógica)
      res.status(400).json({ error: 'Debe enviar al menos un tipo_servicio válido en query params.' });
      return;
    }

    // Crear placeholders para la consulta
    const placeholders = tipoServicioArray.map(() => '?').join(',');

    const sql = `
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
      FROM factura f
      JOIN servicio_detalle sd ON f.ID_Factura = sd.ID_Factura
      JOIN servicio s ON sd.ID_Servicio = s.ID_Servicio
      JOIN estadofactura ef ON f.ID_estadoFactura = ef.ID_EstadoFactura
      JOIN servicio_tipo_relacion str ON s.ID_Servicio = str.ID_Servicio
      JOIN servicio_tipo st ON str.ID_Servicio_tipo = st.ID_producto_tipo
      JOIN usuarios u ON f.ID_usuario = u.id
      LEFT JOIN metodopago mp ON f.ID_MetodoPago = mp.ID_MetodoPago
      WHERE st.Descripcion IN (${placeholders})
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
      ORDER BY f.Fecha_Emision DESC, f.ID_Factura DESC;
    `;

    const [rows] = await pool.query(sql, tipoServicioArray);

    res.json(rows);
  } catch (error) {
    console.error('Error en getServicios:', error);
    res.status(500).json({
      error: 'Hubo un problema al obtener los servicios.',
      message: (error as Error).message,
    });
  }
};
