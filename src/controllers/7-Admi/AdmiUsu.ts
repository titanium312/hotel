import { Database } from '../../db/Database';
import { Request, Response } from 'express';

// Exportamos la función para que pueda ser usada en otros archivos
export const getUserRoles = async (userId: number): Promise<string[]> => {
  try {
    const pool = await Database.connect();

    const [roles] = await pool.execute(`
      SELECT r.nombre_rol
      FROM usuario_roles ur
      JOIN roles r ON ur.id_rol = r.id
      WHERE ur.id_usuario = ?
    `, [userId]);

    // @ts-ignore
    return roles.map((rol: any) => rol.nombre_rol);
  } catch (error) {
    console.error('Error obteniendo roles:', error);
    return [];
  }
};


// Controlador para obtener lista de usuarios con sus roles
export const UsuriosLista = async (req: Request, res: Response): Promise<Response> => {
  try {
    const pool = await Database.connect();

    // Obtener usuarios (sin roles)
    const [usuarios] = await pool.execute(`
      SELECT 
        u.id, 
        u.nombre_usuario, 
        u.contraseña, 
        u.correo_electronico, 
        u.fecha_creacion, 
        u.fecha_sesion
      FROM usuarios u
    `);

    // Agregar roles a cada usuario
    // @ts-ignore
    const usuariosConRoles = await Promise.all(usuarios.map(async (usuario: any) => {
      usuario.roles = await getUserRoles(usuario.id);
      return usuario;
    }));

    return res.status(200).json({ usuarios: usuariosConRoles });
  } catch (error) {
    console.error('Error al obtener la información:', error);
    return res.status(500).json({ message: 'Error al obtener la información', error: error instanceof Error ? error.message : error });
  }
};
