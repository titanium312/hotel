import { Request, Response } from 'express';
import { Database } from '../../db/Database';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';

// Crear un nuevo usuario
export const crearUsuario = async (req: Request, res: Response): Promise<void> => {
  const { nombre_usuario, contraseña, id_rol } = req.body;

  try {
    // Encriptar la contraseña con bcryptjs antes de almacenarla
    const encryptedPassword = await bcrypt.hash(contraseña, 10);

    const connection = await Database.connect();

    // Insertar el nuevo usuario en la tabla usuarios
    const queryUsuario = 'INSERT INTO usuarios (nombre_usuario, contraseña) VALUES (?, ?)';
    const [result] = await connection.execute<mysql.ResultSetHeader>(queryUsuario, [nombre_usuario, encryptedPassword]);

    // Obtener el id_usuario generado por la base de datos
    const insertId = result.insertId;

    // Asignar un rol al nuevo usuario si id_rol está presente
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
  const { nombre_usuario } = req.params;
  const { nueva_contraseña, id_rol } = req.body;

  try {
    const connection = await Database.connect();

    // Primero, obtener el id_usuario correspondiente al nombre_usuario
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      'SELECT id_usuario FROM usuarios WHERE nombre_usuario = ?',
      [nombre_usuario]
    );

    if (rows.length === 0) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    const id_usuario = rows[0].id_usuario;

    // Actualizar contraseña si se proporciona
    if (nueva_contraseña) {
      const encryptedPassword = await bcrypt.hash(nueva_contraseña, 10);
      await connection.execute(
        'UPDATE usuarios SET contraseña = ?, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id_usuario = ?',
        [encryptedPassword, id_usuario]
      );
    }

    // Actualizar rol si se proporciona
    if (id_rol) {
      // Verificar si ya existe un rol asignado para este usuario
      const [rolRows] = await connection.execute<mysql.RowDataPacket[]>(
        'SELECT * FROM usuario_roles WHERE id_usuario = ?',
        [id_usuario]
      );

      if (rolRows.length > 0) {
        // Actualizar el rol existente
        await connection.execute(
          'UPDATE usuario_roles SET id_rol = ? WHERE id_usuario = ?',
          [id_rol, id_usuario]
        );
      } else {
        // Insertar nuevo rol
        await connection.execute(
          'INSERT INTO usuario_roles (id_usuario, id_rol) VALUES (?, ?)',
          [id_usuario, id_rol]
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
  const { nombre_usuario } = req.params;

  try {
    const connection = await Database.connect();

    // Primero, obtener el id_usuario
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      'SELECT id_usuario FROM usuarios WHERE nombre_usuario = ?',
      [nombre_usuario]
    );

    if (rows.length === 0) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    const id_usuario = rows[0].id_usuario;

    // Eliminar las relaciones de usuario_roles
    await connection.execute('DELETE FROM usuario_roles WHERE id_usuario = ?', [id_usuario]);

    // Eliminar el usuario
    const [result] = await connection.execute<mysql.ResultSetHeader>(
      'DELETE FROM usuarios WHERE id_usuario = ?',
      [id_usuario]
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
