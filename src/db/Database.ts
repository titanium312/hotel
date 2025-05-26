import mysql from 'mysql2/promise';
import { dbConfig } from './config';

export class Database {
  private static pool: mysql.Pool;

  // Método para conectar a la base de datos y obtener el pool de conexiones
  public static connect(): mysql.Pool {
    if (!this.pool) {
      try {
        // Crear un pool con soporte para promesas
        this.pool = mysql.createPool({
          host: dbConfig.host,      // Cambia esto si tu base de datos está en otro servidor
          user: dbConfig.user,           // Tu usuario de la base de datos
          password: dbConfig.password,  // Cambia esto con tu contraseña
          database: dbConfig.database,      // Nombre de la base de datos
          waitForConnections: true,
          connectionLimit: 10,    // Límite de conexiones simultáneas
          queueLimit: 0           // Sin límite de espera
        });
        console.log('Conexión exitosa a la base de datos');
      } catch (error) {
        console.error('Error al conectar con la base de datos:', error);
        throw error;  // Lanza el error para detener la aplicación si es necesario
      }
    }
    return this.pool;
  }

  // Método para ejecutar una consulta utilizando el pool de conexiones
  public static async query(query: string, params: any[] = []): Promise<any> {
    try {
      const pool = this.connect(); // Aseguramos que el pool de conexiones esté creado
      const [results] = await pool.query(query, params); // Ejecuta la consulta
      return results;  // Retorna los resultados de la consulta
    } catch (error) {
      console.error('Error al ejecutar la consulta:', error);
      throw error;  // Lanza el error para manejo externo
    }
  }

  // Opcional: Método para obtener una conexión específica (aunque no es necesario en muchos casos)
  public static async getConnection(): Promise<mysql.Connection> {
    try {
      const pool = this.connect(); // Aseguramos que el pool de conexiones esté creado
      return await pool.getConnection(); // Obtener una conexión desde el pool
    } catch (error) {
      console.error('Error al obtener una conexión:', error);
      throw error;  // Lanza el error para manejo externo
    }
  }
}
