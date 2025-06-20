import { Request, Response } from 'express';
import mysql from 'mysql2/promise';
import { Database } from '../../../db/Database';

const pool = Database.connect();

interface Order {
  ID_Servicio: number;
  Cantidad: number;
  mesa: string;
}

const validateOrderData = (orders: Order[]): string | null => {
  for (const order of orders) {
    if (!order.ID_Servicio || !order.Cantidad || !order.mesa) {
      return 'Faltan datos requeridos en uno de los pedidos';
    }
    if (isNaN(order.Cantidad) || order.Cantidad <= 0) {
      return 'La Cantidad debe ser un número mayor que 0';
    }
  }
  return null;
};

export const recibirPedido = async (req: Request, res: Response): Promise<void> => {
  const { orders, ID_usuario, ID_Factura, in: shouldUpdate, Fecha_Emision } = req.body;

  if (!orders || !Array.isArray(orders) || orders.length === 0) {
    res.status(400).json({ error: 'Se requiere al menos un pedido' });
    return;
  }

  if (!ID_usuario || isNaN(ID_usuario)) {
    res.status(400).json({ error: 'ID_usuario es requerido y debe ser un número válido' });
    return;
  }

  const validationError = validateOrderData(orders);
  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const servicioIds = orders.map(o => o.ID_Servicio);
    const [servicioRows] = await connection.query(
      'SELECT ID_Servicio, Precio FROM servicio WHERE ID_Servicio IN (?)',
      [servicioIds]
    );

    if ((servicioRows as any).length !== orders.length) {
      throw new Error('Uno o más servicios no existen');
    }

    const servicioPrecios = (servicioRows as any).map((row: any) => row.Precio);
    const totalFactura = orders.reduce((total, order, i) => total + (order.Cantidad * servicioPrecios[i]), 0);

    if (ID_Factura && !isNaN(ID_Factura)) {
      const [facturaActual] = await connection.query(
        'SELECT * FROM factura WHERE ID_Factura = ?',
        [ID_Factura]
      );

      const [detallesActuales] = await connection.query(
        'SELECT * FROM servicio_detalle WHERE ID_Factura = ?',
        [ID_Factura]
      );

      if (!Array.isArray(facturaActual) || facturaActual.length === 0) {
        throw new Error(`No se encontró la factura con ID: ${ID_Factura}`);
      }

      if (!shouldUpdate) {
        res.status(200).json({
          message: 'Datos actuales de la factura',
          factura: facturaActual[0],
          detalles: detallesActuales
        });
        await connection.rollback();
        return;
      }

      await connection.query(
        'UPDATE factura SET Total = ?, ID_usuario = ? WHERE ID_Factura = ?',
        [totalFactura, ID_usuario, ID_Factura]
      );

      await connection.query(
        'DELETE FROM servicio_detalle WHERE ID_Factura = ?',
        [ID_Factura]
      );

      for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        const precioUnitario = servicioPrecios[i];
        await connection.query(
          'INSERT INTO servicio_detalle (ID_Factura, ID_Servicio, Cantidad, Total, mesa) VALUES (?, ?, ?, ?, ?)',
          [ID_Factura, order.ID_Servicio, order.Cantidad, order.Cantidad * precioUnitario, order.mesa]
        );
      }

      await connection.commit();
      res.status(200).json({ message: 'Factura actualizada correctamente', facturaId: ID_Factura });

    } else {
      // ✅ Si hay fecha personalizada, úsala; si no, usa la fecha actual
      const fechaEmisionFinal = Fecha_Emision || new Date().toISOString().slice(0, 10); // YYYY-MM-DD

      const [insertFacturaResult] = await connection.query(
        `INSERT INTO factura (Fecha_Emision, ID_estadoFactura, TipoFactura, Total, Descuento, Adelanto, ID_usuario)
         VALUES (?, 1, 2, ?, 0.00, 0.00, ?)`,
        [fechaEmisionFinal, totalFactura, ID_usuario]
      );

      const nuevaFacturaId = (insertFacturaResult as mysql.ResultSetHeader).insertId;

      for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        const precioUnitario = servicioPrecios[i];
        await connection.query(
          'INSERT INTO servicio_detalle (ID_Factura, ID_Servicio, Cantidad, Total, mesa) VALUES (?, ?, ?, ?, ?)',
          [nuevaFacturaId, order.ID_Servicio, order.Cantidad, order.Cantidad * precioUnitario, order.mesa]
        );
      }

      await connection.commit();
      res.status(201).json({
        message: 'Pedido recibido y procesado correctamente',
        facturaId: nuevaFacturaId
      });
    }

  } catch (error: unknown) {
    await connection.rollback();
    if (error instanceof Error) {
      console.error('Error al procesar el pedido:', error.message);
      res.status(500).json({ error: error.message });
    } else {
      console.error('Error desconocido:', error);
      res.status(500).json({ error: 'Error inesperado al procesar el pedido' });
    }
  } finally {
    connection.release();
  }
};




export const insertEstadoCaja = async (req: Request, res: Response) => {
  const { descripcion, comentario } = req.body;

  if (descripcion !== 'Abierta' && descripcion !== 'Cerrada') {
    return res.status(400).json({ error: 'El estado debe ser "Abierta" o "Cerrada"' });
  }

  try {
    const conn = await pool.getConnection();

    // Buscar si ya existe un estado para HOY (sin importar si es 'Abierta' o 'Cerrada')
    const [rows]: any = await conn.execute(
      `SELECT ID_estado, Comentario, Descripcion FROM estado_caja
       WHERE DATE(Fecha) = CURDATE()`
    );

    const now = new Date();
    const fechaHora = `[${now.toLocaleString('es-ES')}]`;
    const comentarioNuevo = `${fechaHora} ${comentario}`;

    // Limitar el tamaño máximo del comentario (ajusta este valor al tamaño real de tu columna)
    const MAX_COMMENT_LENGTH = 500;

    if (rows.length > 0) {
      // Ya hay un estado hoy → actualizar descripción (si es diferente) y añadir comentario
      const { ID_estado, Comentario: comentarioExistente, Descripcion: descripcionActual } = rows[0];

      let comentarioActualizado = comentarioExistente
        ? `${comentarioExistente}\n${comentarioNuevo}`
        : comentarioNuevo;

      // Recortar comentario si es demasiado largo
      if (comentarioActualizado.length > MAX_COMMENT_LENGTH) {
        comentarioActualizado = comentarioActualizado.slice(-MAX_COMMENT_LENGTH);
        // Se queda con los últimos caracteres para no perder el comentario más reciente
      }

      await conn.execute(
        `UPDATE estado_caja
         SET Comentario = ?, Descripcion = ?
         WHERE ID_estado = ?`,
        [comentarioActualizado, descripcion, ID_estado]
      );

      conn.release();
      return res.status(200).json({ message: 'Estado actualizado correctamente' });

    } else {
      // No existe aún: insertar nuevo
      let comentarioInsert = comentarioNuevo;
      if (comentarioInsert.length > MAX_COMMENT_LENGTH) {
        comentarioInsert = comentarioInsert.slice(-MAX_COMMENT_LENGTH);
      }

      await conn.execute(
        `INSERT INTO estado_caja (Descripcion, Fecha, Comentario)
         VALUES (?, NOW(), ?)`,
        [descripcion, comentarioInsert]
      );

      conn.release();
      return res.status(201).json({ message: 'Estado insertado correctamente' });
    }

  } catch (error) {
    console.error('Error al insertar/actualizar estado:', error);
    return res.status(500).json({ error: 'Error al registrar el estado de la caja' });
  }
};




export const getEstadosCaja = async (req: Request, res: Response) => {
  try {
    const conn = await pool.getConnection();

    const fechaQuery = req.query.fecha as string | undefined;

    let query = `SELECT ID_estado, Descripcion, Fecha, Comentario FROM estado_caja`;
    let params: string[] = [];

    if (fechaQuery) {
      query += ` WHERE DATE(Fecha) = ?`; // <-- compara solo la fecha
      params.push(fechaQuery);
    }

    query += ` ORDER BY Fecha DESC`;

    const [rows] = await conn.query(query, params);

    conn.release();

    if ((rows as any).length === 0) {
      return res.status(200).json({
        message: fechaQuery ? `No hay registros para la fecha ${fechaQuery}` : 'No hay registros disponibles'
      });
    }

    return res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener estados de caja:', error);
    return res.status(500).json({ error: 'Error al obtener los estados de caja' });
  }
};
