import { Request, Response } from 'express';
import mysql from 'mysql2/promise';
import { Database } from '../../../../db/Database';

const pool = Database.connect();

export class ProductoController {

  // Obtener todos los tipos de productos
  static async obtenerTiposDeProductos(req: Request, res: Response): Promise<void> {
    const connection = await pool.getConnection();

    try {
      const [tiposProductos] = await connection.query('SELECT * FROM producto_tipo');

      res.status(200).json({
        message: 'Tipos de productos obtenidos correctamente',
        data: tiposProductos
      });

    } catch (error: unknown) {
      console.error('Error al obtener los tipos de productos:', error);

      if (error instanceof Error) {
        res.status(500).json({ message: 'Error al obtener los tipos de productos', error: error.message });
      } else {
        res.status(500).json({ message: 'Error desconocido al obtener los tipos de productos' });
      }
    } finally {
      connection.release();
    }
  }

  // Obtener todos los proveedores
  static async obtenerProveedores(req: Request, res: Response): Promise<void> {
    const connection = await pool.getConnection();

    try {
      const [proveedores] = await connection.query('SELECT * FROM provedor'); // 🟢 minúsculas

      res.status(200).json({
        message: 'Proveedores obtenidos correctamente',
        data: proveedores
      });

    } catch (error: unknown) {
      console.error('Error al obtener los proveedores:', error);

      if (error instanceof Error) {
        res.status(500).json({ message: 'Error al obtener los proveedores', error: error.message });
      } else {
        res.status(500).json({ message: 'Error desconocido al obtener los proveedores' });
      }
    } finally {
      connection.release();
    }
  }
}
