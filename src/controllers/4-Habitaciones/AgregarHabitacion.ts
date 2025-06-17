import { Request, Response } from 'express';
import multer from 'multer';
import mysql from 'mysql2/promise';
import { Database } from '../../db/Database';  // Ajusta según tu estructura

const pool = Database.connect();

// Configuración Multer para manejar archivos en memoria
const storage = multer.memoryStorage();
export const upload = multer({ storage });

// Insertar habitación con imagen
export const insertHabitacionWithImage = async (req: Request, res: Response): Promise<void> => {
  let connection;
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No se ha subido ninguna imagen.' });
      return;
    }

    const { ID_Habitacion, Nombre, Costo, ID_Estado_Habitacion, ID_Tipo_Habitacion, Descripcion, DescripcionImg, ID_Piso } = req.body;

    if (!ID_Habitacion || !Nombre || !Costo || !ID_Estado_Habitacion || !ID_Tipo_Habitacion || !Descripcion || !ID_Piso) {
      res.status(400).json({ message: 'Faltan parámetros necesarios.' });
      return;
    }

    const Imagen = req.file.buffer;
    const Fecha_Creacion = new Date();

    connection = await pool.getConnection();

    // Validar tipo habitación
    const [tipoHabitacionRows] = await connection.execute<mysql.RowDataPacket[]>(
      `SELECT * FROM tipo_habitacion WHERE ID_Tipo_Habitacion = ?`, [ID_Tipo_Habitacion]
    );

    if (tipoHabitacionRows.length === 0) {
      res.status(400).json({ message: `El tipo de habitación con ID ${ID_Tipo_Habitacion} no existe.` });
      return;
    }

    // Validar piso
    const [pisoRows] = await connection.execute<mysql.RowDataPacket[]>(
      `SELECT * FROM Piso WHERE ID_Piso = ?`, [ID_Piso]
    );

    if (pisoRows.length === 0) {
      res.status(400).json({ message: `El piso con ID ${ID_Piso} no existe.` });
      return;
    }

    // Validar existencia habitación
    const [existingHabitacionRows] = await connection.execute<mysql.RowDataPacket[]>(
      `SELECT * FROM habitacion WHERE ID_Habitacion = ?`, [ID_Habitacion]
    );

    if (existingHabitacionRows.length > 0) {
      res.status(400).json({ message: `Ya existe una habitación con el ID ${ID_Habitacion}.` });
      return;
    }

    // Insertar habitación
    await connection.execute<mysql.ResultSetHeader>(
      `INSERT INTO habitacion (ID_Habitacion, Nombre, Costo, ID_Estado_Habitacion, Descripcion, ID_Tipo_Habitacion, ID_Piso)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [ID_Habitacion, Nombre, Costo, ID_Estado_Habitacion, Descripcion, ID_Tipo_Habitacion, ID_Piso]
    );

    // Insertar imagen
    await connection.execute<mysql.ResultSetHeader>(
      `INSERT INTO imagenes_habitacion (ID_Habitacion, Imagen, Descripcion, Fecha_Creacion)
       VALUES (?, ?, ?, ?)`,
      [ID_Habitacion, Imagen, DescripcionImg, Fecha_Creacion]
    );

    res.status(200).json({ message: 'Habitación e imagen subidas correctamente.' });
  } catch (error: any) {
    console.error('Error al guardar la habitación y la imagen:', error);
    res.status(500).json({ message: 'Error al guardar la habitación y la imagen.', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

// Obtener tipos de habitación
export const getTiposHabitacion = async (req: Request, res: Response): Promise<void> => {
  let connection;
  try {
    connection = await pool.getConnection();

    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      `SELECT ID_Tipo_Habitacion, Descripcion FROM tipo_habitacion`
    );

    if (rows.length > 0) {
      res.status(200).json({ tiposHabitacion: rows });
    } else {
      res.status(404).json({ message: 'No se encontraron tipos de habitación.' });
    }
  } catch (error: any) {
    console.error('Error al obtener los tipos de habitación:', error);
    res.status(500).json({ message: 'Error al obtener los tipos de habitación.', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

// Obtener estados de habitación
export const getEstadosHabitacion = async (req: Request, res: Response): Promise<void> => {
  let connection;
  try {
    connection = await pool.getConnection();

    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      `SELECT ID_Estado_Habitacion, Descripcion FROM estado_habitacion`
    );

    if (rows.length > 0) {
      res.status(200).json({ estadosHabitacion: rows });
    } else {
      res.status(404).json({ message: 'No se encontraron estados de habitación.' });
    }
  } catch (error: any) {
    console.error('Error al obtener los estados de habitación:', error);
    res.status(500).json({ message: 'Error al obtener los estados de habitación.', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

// Actualizar imagen de habitación
export const updateImage = async (req: Request, res: Response): Promise<void> => {
  let connection;
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No se ha subido ninguna imagen.' });
      return;
    }

    const { ID_Habitacion, Descripcion } = req.body;
    const Imagen = req.file.buffer;
    const Fecha_Creacion = new Date();

    connection = await pool.getConnection();

    const [result] = await connection.execute<mysql.ResultSetHeader>(
      `UPDATE imagenes_habitacion 
       SET Imagen = ?, Descripcion = ?, Fecha_Creacion = ? 
       WHERE ID_Habitacion = ?`,
      [Imagen, Descripcion, Fecha_Creacion, ID_Habitacion]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Imagen actualizada correctamente.' });
    } else {
      res.status(404).json({ message: 'No se encontró la habitación.' });
    }
  } catch (error: any) {
    console.error('Error al actualizar la imagen:', error);
    res.status(500).json({ message: 'Error al actualizar la imagen.', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

// Eliminar habitación
export const deleteHabitacion = async (req: Request, res: Response): Promise<void> => {
  let connection;
  try {
    const { ID_Habitacion } = req.params;

    connection = await pool.getConnection();

    // Opcional: validar si la habitación tiene reservas antes de eliminar, aquí no lo haces

    // Eliminar imágenes asociadas
    await connection.execute<mysql.ResultSetHeader>(
      `DELETE FROM imagenes_habitacion WHERE ID_Habitacion = ?`, [ID_Habitacion]
    );

    // Eliminar habitación
    const [deleteResult] = await connection.execute<mysql.ResultSetHeader>(
      `DELETE FROM habitacion WHERE ID_Habitacion = ?`, [ID_Habitacion]
    );

    if (deleteResult.affectedRows > 0) {
      res.status(200).json({ message: 'Habitación eliminada correctamente.' });
    } else {
      res.status(404).json({ message: 'Habitación no encontrada.' });
    }
  } catch (error: any) {
    console.error('Error al eliminar la habitación:', error);
    res.status(500).json({ message: 'Error al eliminar la habitación.', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};
