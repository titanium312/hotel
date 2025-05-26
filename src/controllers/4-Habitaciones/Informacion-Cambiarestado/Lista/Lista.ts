import { Request, Response } from 'express';
import { Database } from '../../../../db/Database';  // Verifica el path correcto

export class Lista {
  // Método para obtener las reservas
  static async obtenerReservas(req: Request, res: Response): Promise<void> {
    const pool = await Database.connect();  // Establecer la conexión

    try {
      const [rows] = await pool.query(`
        SELECT 
          r.ID_Reserva,   -- Agregamos el campo ID_Reserva
          c.Nombre1, 
          c.Nombre2, 
          c.Apellido1, 
          c.Apellido2, 
          r.Fecha_Ingreso, 
          r.Fecha_Salida, 
          h.Nombre AS Habitacion, 
          e.Descripcion AS Estado_Habitacion, 
          rh.Descripcion AS Estado_Reserva
        FROM 
          reserva r
        JOIN 
          cliente c ON r.ID_Cliente = c.ID_Cliente
        JOIN 
          ReservaHabitacion rhb ON r.ID_Reserva = rhb.ID_Reserva
        JOIN 
          habitacion h ON rhb.ID_Habitacion = h.ID_Habitacion
        JOIN 
          estado_habitacion e ON h.ID_Estado_Habitacion = e.ID_Estado_Habitacion
        JOIN 
          RHEstado rh ON rhb.ID_RHEstado = rh.ID_RHEstado
      `);

      res.status(200).json(rows); // Enviar los resultados al cliente
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener las reservas' });
    } finally {
      // No se debe cerrar el pool aquí, ya que se cerraría en cada consulta
      // El pool debe cerrarse solo cuando la aplicación termine, no en cada consulta
      // pool.end(); // Eliminar esta línea
    }
  }
}
