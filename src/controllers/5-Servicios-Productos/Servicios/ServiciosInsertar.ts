import { Request, Response } from 'express';
import mysql from 'mysql2/promise';
import { Database } from '../../../db/Database';

const pool = Database.connect();

// Definir la interfaz para los detalles de un pedido
interface Order {
  ID_Servicio: number;
  Cantidad: number;
  mesa: string; // Corregir tipo de 'mesa'
}

// Función para validar los datos de los pedidos
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
  const { orders, ID_usuario } = req.body;

  // Validación básica
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

    // Obtener precios
    const servicioIds = orders.map(o => o.ID_Servicio);
    const [servicioRows] = await connection.query(
      'SELECT ID_Servicio, Precio FROM servicio WHERE ID_Servicio IN (?)',
      [servicioIds]
    );

    if ((servicioRows as any).length !== orders.length) {
      throw new Error('Uno o más servicios no existen');
    }

    const servicioPrecios = (servicioRows as any).map((row: any) => row.Precio);

    // Calcular total
    const totalFactura = orders.reduce((total, order, i) => {
      return total + (order.Cantidad * servicioPrecios[i]);
    }, 0);

    // 🔄 Insertar la factura con ID_usuario
    const [insertFacturaResult] = await connection.query(
      `INSERT INTO factura (Fecha_Emision, ID_estadoFactura, TipoFactura, Total, Descuento, Adelanto, ID_usuario)
       VALUES (CURDATE(), 1, 2, ?, 0.00, 0.00, ?)`,
      [totalFactura, ID_usuario]
    );

    const facturaId = (insertFacturaResult as mysql.ResultSetHeader).insertId;

    // Insertar detalles
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const precioUnitario = servicioPrecios[i];
      await connection.query(
        'INSERT INTO servicio_detalle (ID_Factura, ID_Servicio, Cantidad, Total, mesa) VALUES (?, ?, ?, ?, ?)',
        [facturaId, order.ID_Servicio, order.Cantidad, order.Cantidad * precioUnitario, order.mesa]
      );
    }

    await connection.commit();

    res.status(201).json({
      message: 'Pedido recibido y procesado correctamente',
      facturaId
    });

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
