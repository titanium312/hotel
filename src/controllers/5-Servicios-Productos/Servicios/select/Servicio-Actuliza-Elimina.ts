import { Request, Response } from 'express';
import mysql from 'mysql2/promise';
import { Database } from '../../../../db/Database';

// Conexión a la base de datos
const pool = Database.connect();

// Función para actualizar el estado de la factura
export const actualizarEstadoFactura = async (req: Request, res: Response): Promise<Response> => {
  const { idFactura, estado } = req.body;

  if (![1, 2, 3].includes(estado)) {
    return res.status(400).json({ error: 'Estado inválido. Usa 1 para Pendiente, 2 para Pagada o 3 para Cancelada.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [result] = await connection.execute(
      'UPDATE factura SET ID_estadoFactura = ? WHERE ID_Factura = ?',
      [estado, idFactura]
    );

    const affectedRows = (result as mysql.OkPacket).affectedRows;

    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Factura no encontrada.' });
    }

    await connection.commit();

    return res.status(200).json({ message: 'Estado de la factura actualizado con éxito.' });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error al actualizar estado:', error);
    return res.status(500).json({ error: 'Hubo un error al actualizar el estado de la factura.' });
  } finally {
    if (connection) connection.release();
  }
};

// Función para eliminar detalles de la factura y la factura en sí
export const eliminarFacturaYDetalles = async (req: Request, res: Response): Promise<Response> => {
  const { idFactura } = req.body;

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    await connection.execute(
      'DELETE FROM servicio_detalle WHERE ID_Factura = ?',
      [idFactura]
    );

    const [result] = await connection.execute(
      'DELETE FROM factura WHERE ID_Factura = ?',
      [idFactura]
    );

    const affectedRows = (result as mysql.OkPacket).affectedRows;

    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Factura no encontrada.' });
    }

    await connection.commit();

    return res.status(200).json({ message: 'Factura y detalles eliminados con éxito.' });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error al eliminar factura:', error);
    return res.status(500).json({ error: 'Hubo un error al eliminar la factura y sus detalles.' });
  } finally {
    if (connection) connection.release();
  }
};

// Función para eliminar un servicio específico de la factura
export const eliminarServicioDeFactura = async (req: Request, res: Response): Promise<Response> => {
  const { idFactura, idServicio } = req.body;

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [result] = await connection.execute(
      'DELETE FROM servicio_detalle WHERE ID_Factura = ? AND ID_Servicio = ?',
      [idFactura, idServicio]
    );

    const affectedRows = (result as mysql.OkPacket).affectedRows;

    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Servicio no encontrado en la factura.' });
    }

    await connection.commit();

    return res.status(200).json({ message: 'Servicio eliminado de la factura con éxito.' });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error al eliminar servicio de factura:', error);
    return res.status(500).json({ error: 'Hubo un error al eliminar el servicio de la factura.' });
  } finally {
    if (connection) connection.release();
  }
};

// Función para actualizar el método de pago de una factura
export const actualizarMetodoPagoPorFactura = async (req: Request, res: Response): Promise<Response> => {
  const { idFactura, idMetodoPago } = req.body;

  if (!idFactura || !idMetodoPago) {
    return res.status(400).json({ error: 'Faltan datos: idFactura y idMetodoPago son requeridos.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // ✅ Arreglado: Tipado explícito del resultado como array de cualquier objeto
    const [facturas] = await connection.execute(
      'SELECT * FROM factura WHERE ID_Factura = ?',
      [idFactura]
    );

    if (facturas.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ error: 'Factura no encontrada.' });
    }

    const [result] = await connection.execute(
      'UPDATE factura SET ID_MetodoPago = ? WHERE ID_Factura = ?',
      [idMetodoPago, idFactura]
    );

    await connection.commit();
    connection.release();

    return res.status(200).json({ message: `Método de pago actualizado para la factura ${idFactura}.` });
  } catch (error) {
    if (connection) await connection.rollback();
    if (connection) connection.release();
    console.error('Error al actualizar método de pago:', error);
    return res.status(500).json({ error: 'Error al actualizar método de pago.' });
  }
};
