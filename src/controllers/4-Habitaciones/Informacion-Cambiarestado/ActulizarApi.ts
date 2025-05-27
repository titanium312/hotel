import { Request, Response } from 'express';
import { PoolConnection } from 'mysql2/promise';
import { Database } from '../../../db/Database';
import { notifyClients } from '../../../app';

const pool = Database.connect();

export const actualizar = async (req: Request, res: Response): Promise<Response> => {
  const { Actulizar, Cerrar } = req.body;

  if (typeof Actulizar !== 'number' || typeof Cerrar !== 'number') {
    return res.status(400).json({ error: 'Los valores Actulizar y Cerrar deben ser números.' });
  }

  try {
    const connection: PoolConnection = await pool.getConnection();

    const [result] = await connection.execute(
      `UPDATE actualizar SET Actulizar = ?, Cerrar = ? WHERE ID = 1`,
      [Actulizar, Cerrar]
    );

    connection.release();

    if ((result as any).affectedRows > 0) {
      notifyClients('Datos actualizados correctamente');
      return res.status(200).json({ message: 'Datos actualizados correctamente.' });
    } else {
      return res.status(404).json({ error: 'No se encontró el registro con el ID 1 para actualizar.' });
    }
  } catch (error) {
    console.error('Error al actualizar:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return res.status(500).json({ error: 'Error interno del servidor.', details: errorMessage });
  }
};
