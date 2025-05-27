import { Request, Response } from 'express';
import mysql from 'mysql2/promise';
import { Database } from '../../../db/Database';

const pool = Database.connect();

// Función para validar los datos del servicio
const validateServiceData = (data: any): string | null => {
  if (!data.ID_Servicio || !data.nombre || !data.descripcion || !data.costo || !data.tipo) {
    return 'Faltan datos requeridos (ID_Servicio, nombre, descripcion, costo, tipo)';
  }
  if (isNaN(data.costo) || data.costo <= 0) {
    return 'El costo debe ser un número mayor que 0';
  }
  return null;
};


// Controlador para registrar un nuevo servicio
export const registerService = async (req: Request, res: Response): Promise<void> => {
  const { ID_Servicio, nombre, descripcion, costo, tipo } = req.body;

  // Validar los datos del servicio
  const validationError = validateServiceData(req.body);
  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }

  let connection;
  try {
    // Iniciar conexión a la base de datos
    connection = await pool.getConnection();
    await connection.beginTransaction(); // Iniciar transacción

    // Verificar si el tipo de servicio existe (usamos 'ID_producto_tipo' en lugar de 'ID_Servicio_Tipo')
    const [serviceType] = await connection.execute<mysql.RowDataPacket[]>(`
      SELECT ID_producto_tipo FROM servicio_tipo WHERE ID_producto_tipo = ?`, 
      [tipo] // 'tipo' es el ID del tipo de servicio que pasas en el body
    );

    if (serviceType.length === 0) {
      res.status(400).json({ error: `El tipo de servicio con ID ${tipo} no existe` });
      await connection.rollback();
      connection.release();
      return;
    }

    // Verificar si ya existe un servicio con el mismo ID_Servicio
    const [existingService] = await connection.execute<mysql.RowDataPacket[]>(`
      SELECT ID_Servicio FROM servicio WHERE ID_Servicio = ?`, 
      [ID_Servicio]
    );

    if (existingService.length > 0) {
      res.status(400).json({ error: `El servicio con ID_Servicio ${ID_Servicio} ya existe` });
      await connection.rollback();
      connection.release();
      return;
    }

    // Insertar el nuevo servicio en la tabla 'servicio'
    await connection.execute(`
      INSERT INTO servicio (ID_Servicio, Nombre, Descripcion, Precio) 
      VALUES (?, ?, ?, ?)`, 
      [ID_Servicio, nombre, descripcion, costo]
    );

    // Relacionar el servicio con el tipo de servicio en la tabla 'servicio_tipo_relacion'
    await connection.execute(`
      INSERT INTO servicio_tipo_relacion (ID_Servicio, ID_Servicio_tipo) 
      VALUES (?, ?)`, 
      [ID_Servicio, tipo]  // Usamos 'ID_Servicio_tipo' en lugar de 'ID_producto_tipo'
    );

    // Confirmar la transacción
    await connection.commit();
    connection.release();

    // Enviar respuesta positiva
    res.status(201).json({ message: 'Servicio registrado correctamente', ID_Servicio });

  } catch (error: unknown) {
    if (connection) {
      await connection.rollback();  // Revertir en caso de error
      connection.release();
    }

    // Manejo de errores
    if (error instanceof Error) {
      console.error('Error al registrar el servicio:', error.message);
      res.status(500).json({ error: 'Error al registrar el servicio', details: error.message });
    } else {
      console.error('Error desconocido:', error);
      res.status(500).json({ error: 'Error desconocido' });
    }
  }
};

// Controlador para eliminar un servicio
export const deleteService = async (req: Request, res: Response): Promise<void> => {
  const { ID_Servicio } = req.params;

  if (!ID_Servicio) {
    res.status(400).json({ error: 'El ID del servicio es requerido' });
    return;
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Verificar si el servicio existe
    const [service] = await connection.execute<mysql.RowDataPacket[]>(
      `SELECT ID_Servicio FROM servicio WHERE ID_Servicio = ?`,
      [ID_Servicio]
    );

    if (service.length === 0) {
      res.status(404).json({ error: `El servicio con ID ${ID_Servicio} no existe` });
      await connection.rollback();
      connection.release();
      return;
    }

    // Eliminar relaciones primero (si aplica)
    await connection.execute(
      `DELETE FROM servicio_tipo_relacion WHERE ID_Servicio = ?`,
      [ID_Servicio]
    );

    // Eliminar el servicio
    await connection.execute(
      `DELETE FROM servicio WHERE ID_Servicio = ?`,
      [ID_Servicio]
    );

    await connection.commit();
    connection.release();

    res.status(200).json({ message: `Servicio con ID ${ID_Servicio} eliminado correctamente` });

  } catch (error: unknown) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    if (error instanceof Error) {
      console.error('Error al eliminar el servicio:', error.message);
      res.status(500).json({ error: 'Error al eliminar el servicio', details: error.message });
    } else {
      res.status(500).json({ error: 'Error desconocido' });
    }
  }
};


// Controlador para actualizar un servicio
export const updateService = async (req: Request, res: Response): Promise<void> => {
  const { ID_Servicio } = req.params;
  const { nombre, descripcion, costo, tipo } = req.body;

  if (!ID_Servicio || !nombre || !descripcion || !costo || !tipo) {
    res.status(400).json({ error: 'Faltan datos requeridos (nombre, descripcion, costo, tipo)' });
    return;
  }

  if (isNaN(costo) || costo <= 0) {
    res.status(400).json({ error: 'El costo debe ser un número mayor que 0' });
    return;
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Verificar si el servicio existe
    const [service] = await connection.execute<mysql.RowDataPacket[]>(
      `SELECT ID_Servicio FROM servicio WHERE ID_Servicio = ?`,
      [ID_Servicio]
    );

    if (service.length === 0) {
      res.status(404).json({ error: `El servicio con ID ${ID_Servicio} no existe` });
      await connection.rollback();
      connection.release();
      return;
    }

    // Verificar si el tipo de servicio existe
    const [serviceType] = await connection.execute<mysql.RowDataPacket[]>(
      `SELECT ID_producto_tipo FROM servicio_tipo WHERE ID_producto_tipo = ?`,
      [tipo]
    );

    if (serviceType.length === 0) {
      res.status(400).json({ error: `El tipo de servicio con ID ${tipo} no existe` });
      await connection.rollback();
      connection.release();
      return;
    }

    // Actualizar datos del servicio
    await connection.execute(
      `UPDATE servicio SET Nombre = ?, Descripcion = ?, Precio = ? WHERE ID_Servicio = ?`,
      [nombre, descripcion, costo, ID_Servicio]
    );

    // Actualizar relación de tipo
    await connection.execute(
      `UPDATE servicio_tipo_relacion SET ID_Servicio_tipo = ? WHERE ID_Servicio = ?`,
      [tipo, ID_Servicio]
    );

    await connection.commit();
    connection.release();

    res.status(200).json({ message: `Servicio con ID ${ID_Servicio} actualizado correctamente` });

  } catch (error: unknown) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    if (error instanceof Error) {
      console.error('Error al actualizar el servicio:', error.message);
      res.status(500).json({ error: 'Error al actualizar el servicio', details: error.message });
    } else {
      res.status(500).json({ error: 'Error desconocido' });
    }
  }
};












/*curl -X POST http://localhost:1234/Hotel/RegistraServicio \
-H "Content-Type: application/json" \
-d '{
  "ID_Servicio": 1,
  "nombre": "Servicio de Lavandería",
  "descripcion": "Servicio de lavandería para ropa de cama",
  "costo": 20.50,
  "tipo": 2
}'
*/