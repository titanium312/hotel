import { Request, Response } from 'express';
import { Database } from '../../db/Database'; 

const pool = Database.connect();

// Función para obtener los roles de un usuario por su id
export const getUserRoles = async (userId: number): Promise<string[]> => {
  const [roles] = await pool.execute(
    `SELECT r.nombre_rol 
     FROM Usuario_roles ur
     JOIN roles r ON ur.id_rol = r.id
     WHERE ur.id_usuario = ?`,
    [userId]
  );
  // @ts-ignore
  return roles.map((row: any) => row.nombre_rol);
};

// Controlador para obtener usuarios, roles y relaciones
export const UsuriosLista = async (req: Request, res: Response): Promise<Response> => {
  try {
    // 1. Obtener todos los usuarios con todos sus campos
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

    // Para cada usuario, obtener sus roles
    // @ts-ignore
    const usuariosConRoles = await Promise.all(usuarios.map(async (usuario: any) => {
      usuario.roles = await getUserRoles(usuario.id);
      return usuario;
    }));

    return res.json({
      usuarios: usuariosConRoles
    });
  } catch (error) {
    console.error('Error al obtener la información:', error);
    return res.status(500).json({ message: 'Error al obtener la información' });
  }
};
