import { Request, Response } from 'express';
import { Database } from '../../db/Database'; 

// Crea el pool de conexiones de la base de datos
const pool = Database.connect();

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
  u.fecha_sesion, 
  r.nombre_rol AS rol
FROM usuarios u
LEFT JOIN Usuario_roles ur ON u.id = ur.id_usuario
LEFT JOIN roles r ON ur.id_rol = r.id;

    `);
    return res.json({
      usuarios
    });
  } catch (error) {
    console.error('Error al obtener la información:', error);
    return res.status(500).json({ message: 'Error al obtener la información' });
  }
};
