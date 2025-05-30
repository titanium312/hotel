import { Request, Response } from 'express';
import mysql from 'mysql2/promise';
import { Database } from '../../../../db/Database'; // Ajusta la ruta si es necesario

const pool = Database.connect();

export const getServicios = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tipo_servicio } = req.query;
    let tipoServicioArray: string[] = [];

    if (Array.isArray(tipo_servicio)) {
      tipoServicioArray = tipo_servicio.filter(item => typeof item === 'string').map(item => item.trim());
    } else if (typeof tipo_servicio === 'string') {
      tipoServicioArray = [tipo_servicio.trim()];
    }

    let query = `
      SELECT 
          s.ID_Servicio, 
          s.Nombre, 
          s.Descripcion, 
          s.Precio, 
          st.Descripcion AS Tipo_Servicio
      FROM 
          servicio s
      JOIN 
          servicio_tipo_relacion str ON s.ID_Servicio = str.ID_Servicio
      JOIN 
          Servicio_tipo st ON str.ID_Servicio_tipo = st.ID_producto_tipo
    `;

    const queryParams: any[] = [];

    if (tipoServicioArray.length > 0) {
      const placeholders = tipoServicioArray.map(() => '?').join(', ');
      query += ` WHERE st.Descripcion IN (${placeholders})`;
      queryParams.push(...tipoServicioArray);
    }

    const [result] = await pool.query(query, queryParams);
    const rows = result as mysql.RowDataPacket[];

    if (rows.length === 0) {
      res.status(404).json({ message: 'No se encontraron servicios.' });
    } else {
      res.status(200).json({ servicios: rows });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los servicios.', error });
  }
};
