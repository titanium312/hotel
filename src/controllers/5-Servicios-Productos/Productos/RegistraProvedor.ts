import { Request, Response } from 'express';
import { Database } from '../../../db/Database';
import mysql from 'mysql2/promise';

const pool = Database.connect();

// Función para validar los datos del proveedor
const validateProviderData = (data: any): string | null => {
  if (!data.ID_Provedor || !data.Nombre || !data.Telefono || !data.Correo || !data.Direccion) {
    return 'Faltan datos requeridos (ID_Provedor, Nombre, Telefono, Correo, Direccion)';
  }
  return null;
};

// Lógica para crear o actualizar un proveedor
export const createProvedor = async (req: Request, res: Response): Promise<Response> => {
  const { ID_Provedor, Nombre, Telefono, Correo, Direccion } = req.body;

  // Validación de datos
  if (!ID_Provedor || !Nombre || !Telefono || !Correo || !Direccion) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  try {
    const connection = await pool.getConnection();

    // Verificar si el proveedor ya existe por ID_Provedor
    const [existingProvider] = await connection.execute<mysql.RowDataPacket[]>(
      'SELECT * FROM Provedor WHERE ID_Provedor = ?',
      [ID_Provedor]
    );

    if (existingProvider.length > 0) {
      // Si el proveedor existe, actualizamos sus datos
      await connection.execute(
        'UPDATE Provedor SET Nombre = ?, Telefono = ?, Correo = ?, Direccion = ? WHERE ID_Provedor = ?',
        [Nombre, Telefono, Correo, Direccion, ID_Provedor]
      );
      connection.release();
      return res.status(200).json({ message: 'Proveedor actualizado exitosamente' });
    } else {
      // Si no existe, creamos un nuevo proveedor
      await connection.execute(
        'INSERT INTO Provedor (ID_Provedor, Nombre, Telefono, Correo, Direccion) VALUES (?, ?, ?, ?, ?)',
        [ID_Provedor, Nombre, Telefono, Correo, Direccion]
      );
      connection.release();
      return res.status(201).json({ message: 'Proveedor creado exitosamente' });
    }
  } catch (error: unknown) {
    console.error('Error al procesar la solicitud:', error);
    if (error instanceof Error) {
      return res.status(500).json({ error: 'Error al procesar la solicitud', details: error.message });
    } else {
      return res.status(500).json({ error: 'Error al procesar la solicitud', details: String(error) });
    }
  }
}





export const eliminarProvedor = async (req: Request, res: Response): Promise<Response> => {
  const { ID_Provedor } = req.params;  // Obtenemos el ID del proveedor desde los parámetros de la URL

  try {
    const connection = await pool.getConnection();

    // Verificamos si el proveedor existe antes de eliminarlo
    const [existingProviderResult] = await connection.execute<mysql.RowDataPacket[]>(
      'SELECT * FROM Provedor WHERE ID_Provedor = ?',
      [ID_Provedor]
    );

    if (existingProviderResult.length === 0) {
      // Si no se encuentra el proveedor, devolvemos un error
      connection.release();
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }

    // Si el proveedor existe, lo eliminamos de la base de datos
    await connection.execute(
      'DELETE FROM Provedor WHERE ID_Provedor = ?',
      [ID_Provedor]
    );

    connection.release();
    return res.status(200).json({ message: 'Proveedor eliminado exitosamente' });
  } catch (error: unknown) {
    console.error('Error al eliminar el proveedor:', error);
    if (error instanceof Error) {
      return res.status(500).json({ error: 'Error al procesar la solicitud', details: error.message });
    } else {
      return res.status(500).json({ error: 'Error al procesar la solicitud', details: String(error) });
    }
  }
};







export const obtenerProveedoresConProductos = async (req: Request, res: Response): Promise<void> => {
  let connection;

  try {
    connection = await pool.getConnection();

    const query = `
      SELECT 
        p.ID_Provedor, p.Nombre AS NombreProvedor, p.Telefono, p.Correo, p.Direccion,
        pr.ID_Producto, pr.Nombre AS NombreProducto, pr.Descripcion, pr.Precio_Unitario, pr.Stock, pr.ID_producto_tipo, pr.ID_Unidad
      FROM provedor p
      LEFT JOIN producto pr ON p.ID_Provedor = pr.ID_Provedor
      ORDER BY p.ID_Provedor, pr.ID_Producto;
    `;

    const [rows] = await connection.query(query);

    // Agrupar productos por proveedor
    const proveedoresMap: Record<number, any> = {};

    (rows as any[]).forEach(row => {
      if (!proveedoresMap[row.ID_Provedor]) {
        proveedoresMap[row.ID_Provedor] = {
          ID_Provedor: row.ID_Provedor,
          Nombre: row.NombreProvedor,
          Telefono: row.Telefono,
          Correo: row.Correo,
          Direccion: row.Direccion,
          Productos: []
        };
      }

      // Si el proveedor tiene productos, agregarlos
      if (row.ID_Producto) {
        proveedoresMap[row.ID_Provedor].Productos.push({
          ID_Producto: row.ID_Producto,
          Nombre: row.NombreProducto,
          Descripcion: row.Descripcion,
          Precio_Unitario: row.Precio_Unitario,
          Stock: row.Stock,
          ID_producto_tipo: row.ID_producto_tipo,
          ID_Unidad: row.ID_Unidad
        });
      }
    });

    // Convertimos el mapa a un array
    const proveedoresConProductos = Object.values(proveedoresMap);

    res.status(200).json({
      message: 'Proveedores con sus productos obtenidos correctamente',
      data: proveedoresConProductos
    });

  } catch (error: unknown) {
    console.error('Error al obtener proveedores con productos:', error);
    if (error instanceof Error) {
      res.status(500).json({ message: 'Error al obtener proveedores con productos', error: error.message });
    } else {
      res.status(500).json({ message: 'Error desconocido al obtener proveedores con productos' });
    }
  } finally {
    if (connection) connection.release();
  }
};










//curl -X POST  http://localhost:1234/Hotel/Productos/Crearprovedores -H "Content-Type: application/json" -d "{\"ID_Provedor\": 434, \"Nombre\": \"Proveedor Test\", \"Telefono\": \"123456789\", \"Correo\": \"proveedor@correo.com\", \"Direccion\": \"Calle Falsa 123\"}"
