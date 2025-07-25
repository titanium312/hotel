import { Request, Response } from 'express';
import { Database } from '../../db/Database';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';

// Crear un nuevo usuario
export const crearUsuario = async (req: Request, res: Response): Promise<void> => {
  const { nombre_usuario, contraseña, id_rol, telefono } = req.body;

  try {
    const encryptedPassword = await bcrypt.hash(contraseña, 10);
    const connection = await Database.connect();

    const queryUsuario = 'INSERT INTO usuarios (nombre_usuario, contraseña, telefono) VALUES (?, ?, ?)';
    const [result] = await connection.execute<mysql.ResultSetHeader>(
      queryUsuario,
      [nombre_usuario, encryptedPassword, telefono]
    );

    const insertId = result.insertId;

    if (id_rol) {
      const queryRol = 'INSERT INTO usuario_roles (id_usuario, id_rol) VALUES (?, ?)';
      await connection.execute(queryRol, [insertId, id_rol]);
    }

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      userId: insertId,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: 'Error al crear usuario', error: error.message });
    } else {
      res.status(500).json({ message: 'Error desconocido al crear usuario', error });
    }
  }
};

// Obtener roles disponibles
export const obtenerRoles = async (req: Request, res: Response): Promise<void> => {
  try {
    const connection = await Database.connect();
    const queryRoles = 'SELECT * FROM roles';
    const [roles] = await connection.execute(queryRoles);
    res.status(200).json(roles);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: 'Error al obtener roles', error: error.message });
    } else {
      res.status(500).json({ message: 'Error desconocido al obtener roles', error });
    }
  }
};

// Editar un usuario
export const editarUsuario = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { nombre_usuario, nueva_contraseña, id_rol, telefono } = req.body;

  try {
    const connection = await Database.connect();

    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      'SELECT * FROM usuarios WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    if (nombre_usuario) {
      await connection.execute(
        'UPDATE usuarios SET nombre_usuario = ? WHERE id = ?',
        [nombre_usuario, id]
      );
    }

    if (nueva_contraseña) {
      const encryptedPassword = await bcrypt.hash(nueva_contraseña, 10);
      await connection.execute(
        'UPDATE usuarios SET contraseña = ? WHERE id = ?',
        [encryptedPassword, id]
      );
    }

    if (telefono) {
      await connection.execute(
        'UPDATE usuarios SET telefono = ? WHERE id = ?',
        [telefono, id]
      );
    }

    if (id_rol !== undefined && id_rol !== null) {
      const [rolRows] = await connection.execute<mysql.RowDataPacket[]>(
        'SELECT * FROM usuario_roles WHERE id_usuario = ?',
        [id]
      );

      if (rolRows.length > 0) {
        await connection.execute(
          'UPDATE usuario_roles SET id_rol = ? WHERE id_usuario = ?',
          [id_rol, id]
        );
      } else {
        await connection.execute(
          'INSERT INTO usuario_roles (id_usuario, id_rol) VALUES (?, ?)',
          [id, id_rol]
        );
      }
    }

    res.status(200).json({ message: 'Usuario actualizado exitosamente' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: 'Error al actualizar usuario', error: error.message });
    } else {
      res.status(500).json({ message: 'Error desconocido al actualizar usuario', error });
    }
  }
};

// Eliminar un usuario
export const eliminarUsuario = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const connection = await Database.connect();

    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      'SELECT * FROM usuarios WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    await connection.execute('DELETE FROM usuario_roles WHERE id_usuario = ?', [id]);
    const [result] = await connection.execute<mysql.ResultSetHeader>(
      'DELETE FROM usuarios WHERE id = ?',
      [id]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Usuario eliminado exitosamente' });
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: 'Error al eliminar usuario', error: error.message });
    } else {
      res.status(500).json({ message: 'Error desconocido al eliminar usuario', error });
    }
  }
};
