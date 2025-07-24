import { Request, Response } from 'express';
import { Database } from '../../../db/Database';
import { RowDataPacket } from 'mysql2/promise';

const pool = Database.connect();

interface ServicioFactura {
  ID_Servicio: number;
  Cantidad: number;
  mesa?: string;
}

export const recibirPedido = async (req: Request, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  try {
    const {
      ID_Factura,
      Fecha_Emision,
      TipoFactura,
      ID_usuario,
      ID_MetodoPago,
      Descuento = 0,
      Adelanto = 0,
      Descripsion = '',
      servicios = [],
    }: {
      ID_Factura?: number;
      Fecha_Emision: string;
      TipoFactura: number;
      ID_usuario: number;
      ID_MetodoPago: number;
      Descuento?: number;
      Adelanto?: number;
      Descripsion?: string;
      servicios: ServicioFactura[];
    } = req.body;

    // --- VALIDACIONES PREVIAS ---

    // 1. Validar que cada servicio tenga cantidad >= 1
    for (const servicio of servicios) {
      if (servicio.Cantidad < 1) {
        res.status(400).json({
          message: `Cantidad inválida para el servicio ID ${servicio.ID_Servicio}. Debe ser al menos 1.`,
        });
        connection.release();
        return;
      }
    }

    // 2. Validar stock suficiente para cada servicio (multiplicado por cantidad)
    for (const servicio of servicios) {
      // Obtener productos relacionados con el servicio
      const [productos] = await connection.query<RowDataPacket[]>(
        `SELECT sp.ID_Producto, sp.Cantidad as CantidadPorServicio, p.Stock 
         FROM servicio_producto sp
         JOIN producto p ON sp.ID_Producto = p.ID_Producto
         WHERE sp.ID_Servicio = ?`,
        [servicio.ID_Servicio]
      );

      for (const producto of productos) {
        const stockNecesario = servicio.Cantidad * producto.CantidadPorServicio;
        if (producto.Stock < stockNecesario) {
          res.status(400).json({
            message: `Stock insuficiente para el producto ID ${producto.ID_Producto} necesario para el servicio ID ${servicio.ID_Servicio}. Stock disponible: ${producto.Stock}, requerido: ${stockNecesario}.`,
          });
          connection.release();
          return;
        }
      }
    }

    // --- FIN VALIDACIONES PREVIAS ---

    await connection.beginTransaction();

    // 1. Obtener servicios anteriores si es una actualización
    const serviciosAnteriores = new Map<number, number>();
    if (ID_Factura) {
      const [detallesAntiguos] = await connection.query<RowDataPacket[]>(
        'SELECT ID_Servicio, Cantidad FROM servicio_detalle WHERE ID_Factura = ?',
        [ID_Factura]
      );

      for (const detalle of detallesAntiguos) {
        serviciosAnteriores.set(detalle.ID_Servicio, detalle.Cantidad);
      }
    }

    // 2. Insertar o actualizar la factura
    let nuevaFacturaID = ID_Factura;
    if (ID_Factura) {
      await connection.query(
        `UPDATE factura SET Fecha_Emision=?, TipoFactura=?, ID_usuario=?, ID_MetodoPago=?, Descuento=?, Adelanto=?, Descripsion=?
         WHERE ID_Factura=?`,
        [Fecha_Emision, TipoFactura, ID_usuario, ID_MetodoPago, Descuento, Adelanto, Descripsion, ID_Factura]
      );
    } else {
      const [result] = await connection.query<any>(
        `INSERT INTO factura (Fecha_Emision, TipoFactura, ID_usuario, ID_MetodoPago, Descuento, Adelanto, Descripsion, ID_estadoFactura)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
        [Fecha_Emision, TipoFactura, ID_usuario, ID_MetodoPago, Descuento, Adelanto, Descripsion]
      );
      nuevaFacturaID = result.insertId;
    }

    // 3. Reponer stock para servicios eliminados (servicios que estaban antes pero no están ahora)
    const serviciosNuevosIds = new Set(servicios.map(s => s.ID_Servicio));
    for (const [idServicioAntiguo, cantidadAntigua] of serviciosAnteriores) {
      if (!serviciosNuevosIds.has(idServicioAntiguo)) {
        // Servicio eliminado, reponer stock
        const [productos] = await connection.query<RowDataPacket[]>(
          `SELECT ID_Producto, Cantidad FROM servicio_producto WHERE ID_Servicio=?`,
          [idServicioAntiguo]
        );

        for (const producto of productos) {
          const cantidadAjuste = cantidadAntigua * producto.Cantidad;
          await connection.query(
            `UPDATE producto SET Stock = Stock + ? WHERE ID_Producto = ?`,
            [cantidadAjuste, producto.ID_Producto]
          );
        }
      }
    }

    // 4. Eliminar detalles viejos
    if (ID_Factura) {
      await connection.query('DELETE FROM servicio_detalle WHERE ID_Factura=?', [nuevaFacturaID]);
    }

    // 5. Insertar detalles nuevos y ajustar stock
    for (const servicio of servicios) {
      const cantidadNueva = servicio.Cantidad;
      const cantidadAntigua = serviciosAnteriores.get(servicio.ID_Servicio) || 0;
      const diferencia = cantidadNueva - cantidadAntigua;

      // Obtener productos del servicio
      const [productos] = await connection.query<RowDataPacket[]>(
        `SELECT ID_Producto, Cantidad FROM servicio_producto WHERE ID_Servicio=?`,
        [servicio.ID_Servicio]
      );

      for (const producto of productos) {
        const cantidadAjuste = diferencia * producto.Cantidad;
        // Si diferencia es positivo, descontar; si es negativo, reponer sumando el valor absoluto
        await connection.query(
          `UPDATE producto SET Stock = Stock - ? WHERE ID_Producto = ?`,
          [cantidadAjuste, producto.ID_Producto]
        );
      }

      // Obtener precio del servicio
      const [datosServicio] = await connection.query<RowDataPacket[]>(
        `SELECT Precio FROM servicio WHERE ID_Servicio=?`,
        [servicio.ID_Servicio]
      );

      if (!datosServicio.length) {
        throw new Error(`Servicio con ID ${servicio.ID_Servicio} no existe`);
      }

      const precio = parseFloat(datosServicio[0].Precio);
      const total = precio * cantidadNueva;

      // Insertar detalle nuevo
      await connection.query(
        `INSERT INTO servicio_detalle (ID_Factura, ID_Servicio, Cantidad, Total, mesa)
         VALUES (?, ?, ?, ?, ?)`,
        [nuevaFacturaID, servicio.ID_Servicio, cantidadNueva, total, servicio.mesa || null]
      );
    }

    await connection.commit();
    res.status(200).json({ message: 'Factura registrada correctamente', ID_Factura: nuevaFacturaID });

  } catch (error: any) {
    await connection.rollback();
    console.error('Error al guardar la factura:', error);
    res.status(500).json({
      message: 'Error al guardar la factura',
      error: { message: error.message || 'Error desconocido' }
    });
  } finally {
    connection.release();
  }
};





// Controlador insertEstadoCaja.ts

export const insertEstadoCaja = async (req: Request, res: Response) => {
  try {
    const { descripcion, comentario, fecha } = req.body;

    if (!fecha || !descripcion || !comentario) {
      return res.status(400).json({ error: 'Faltan datos: fecha, descripcion o comentario' });
    }

    if (descripcion !== 'Abierta' && descripcion !== 'Cerrada') {
      return res.status(400).json({ error: 'Descripcion debe ser "Abierta" o "Cerrada"' });
    }

    const fechaObj = new Date(fecha);
    if (isNaN(fechaObj.getTime())) {
      return res.status(400).json({ error: 'Fecha inválida' });
    }

    // Normalizar fecha para comparar solo fecha sin hora
    const fechaStr = fechaObj.toISOString().slice(0, 10); // "YYYY-MM-DD"

    // Crear nuevo objeto Date con hora 00:00:00 para insertar y evitar problemas de zona horaria
    const fechaParaInsertar = new Date(fechaStr + 'T00:00:00');

    const conn = await pool.getConnection();

    // Buscar estado de caja para esa fecha
    const [rows]: any = await conn.execute(
      `SELECT ID_estado, Comentario FROM estado_caja WHERE DATE(Fecha) = ?`,
      [fechaStr]
    );

    const ahoraStr = new Date().toLocaleString();
    const comentarioNuevo = `[${ahoraStr}] ${comentario}`;

    const MAX_COMMENT_LENGTH = 500;

    if (rows.length > 0) {
      // Existe: actualizar comentarios concatenando
      const { ID_estado, Comentario: comentarioExistente } = rows[0];
      let comentarioActualizado = comentarioExistente
        ? `${comentarioExistente}\n${comentarioNuevo}`
        : comentarioNuevo;

      if (comentarioActualizado.length > MAX_COMMENT_LENGTH) {
        comentarioActualizado = comentarioActualizado.slice(-MAX_COMMENT_LENGTH);
      }

      await conn.execute(
        `UPDATE estado_caja SET Descripcion = ?, Comentario = ? WHERE ID_estado = ?`,
        [descripcion, comentarioActualizado, ID_estado]
      );

      conn.release();
      return res.status(200).json({ message: 'Estado de caja actualizado correctamente' });
    } else {
      // No existe: insertar nuevo
      let comentarioInsert = comentarioNuevo;
      if (comentarioInsert.length > MAX_COMMENT_LENGTH) {
        comentarioInsert = comentarioInsert.slice(-MAX_COMMENT_LENGTH);
      }

      await conn.execute(
        `INSERT INTO estado_caja (Descripcion, Fecha, Comentario) VALUES (?, ?, ?)`,
        [descripcion, fechaParaInsertar, comentarioInsert]
      );

      conn.release();
      return res.status(201).json({ message: 'Estado de caja creado correctamente' });
    }
  } catch (error) {
    console.error('Error al insertar o actualizar estado caja:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
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
