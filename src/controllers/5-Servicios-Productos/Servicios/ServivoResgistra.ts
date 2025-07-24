import { Request, Response } from 'express';
import { Database } from '../../../db/Database';
import { RowDataPacket } from 'mysql2/promise';
import { OkPacket } from 'mysql2';

const pool = Database.connect();

// Interface for associated products
interface ProductoAsociado {
  ID_Producto: number;
  Cantidad: number;
}

export const RegistraServicio = async (req: Request, res: Response): Promise<void> => {
  const {
    ID_Servicio,
    Nombre,
    Descripcion,
    Precio,
    productos,
  }: {
    ID_Servicio: number;
    Nombre: string;
    Descripcion: string;
    Precio: number;
    productos: ProductoAsociado[];
  } = req.body;

  const connection = await pool.getConnection();

  try {
    // Inicia la transacción
    await connection.beginTransaction();

    // Verifica si el servicio existe
    const [existingService] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM servicio WHERE ID_Servicio = ?',
      [ID_Servicio]
    );

    if (existingService.length > 0) {
      // Actualiza el servicio existente
      const [updateResult] = await connection.query<OkPacket>(
        'UPDATE servicio SET Nombre = ?, Descripcion = ?, Precio = ? WHERE ID_Servicio = ?',
        [Nombre, Descripcion, Precio, ID_Servicio]
      );

      if (updateResult.affectedRows === 0) {
        throw new Error('Error updating the service');
      }
    } else {
      // Inserta un nuevo servicio con ID_Servicio incluido
      const [insertResult] = await connection.query<OkPacket>(
        'INSERT INTO servicio (ID_Servicio, Nombre, Descripcion, Precio) VALUES (?, ?, ?, ?)',
        [ID_Servicio, Nombre, Descripcion, Precio]
      );

      if (insertResult.affectedRows === 0) {
        throw new Error('Error inserting the service');
      }
    }

    // Elimina productos antiguos asociados
    await connection.query('DELETE FROM servicio_producto WHERE ID_Servicio = ?', [ID_Servicio]);

    // Inserta o actualiza productos nuevos
    for (const producto of productos) {
      await connection.query(
        'INSERT INTO servicio_producto (ID_Servicio, ID_Producto, Cantidad) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE Cantidad = ?',
        [ID_Servicio, producto.ID_Producto, producto.Cantidad, producto.Cantidad]
      );
    }

    // Confirma la transacción
    await connection.commit();

    res.status(200).json({ message: 'Service registered or updated successfully' });
  } catch (error: unknown) {
    // Reversa la transacción en caso de error
    await connection.rollback();

    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  } finally {
    // Libera la conexión
    connection.release();
  }
};

// Controller to delete a service
export const EliminarServicio = async (req: Request, res: Response): Promise<void> => {
  const { ID_Servicio } = req.params;

  const connection = await pool.getConnection();

  try {
    // Start a transaction
    await connection.beginTransaction();

    // Check if the service exists
    const [existingService] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM servicio WHERE ID_Servicio = ?',
      [ID_Servicio]
    );

    if (existingService.length === 0) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }

    // Delete associated products first
    await connection.query('DELETE FROM servicio_producto WHERE ID_Servicio = ?', [ID_Servicio]);

    // Delete the service
    const [deleteResult] = await connection.query<OkPacket>(
      'DELETE FROM servicio WHERE ID_Servicio = ?',
      [ID_Servicio]
    );

    if (deleteResult.affectedRows === 0) {
      throw new Error('Error deleting the service');
    }

    // Commit transaction
    await connection.commit();

    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error: unknown) {
    // Handle the error properly with a type guard or cast
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }

    // Rollback transaction on error
    await connection.rollback();
  } finally {
    // Release connection back to pool
    connection.release();
  }
};
