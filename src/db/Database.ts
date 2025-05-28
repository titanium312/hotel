import mysql from 'mysql2/promise';

export class Database {
  private static pool: mysql.Pool;

  public static connect(): mysql.Pool {
    if (!this.pool) {
      try {
        this.pool = mysql.createPool({
          host: 'shortline.proxy.rlwy.net', // Dominio del servidor
          user: 'root',                     // Usuario
          password: 'nUYJKjifjMBkHSDVRstsBaHHtvulXXuB', // Contraseña
          database: 'railway',              // Base de datos
          port: 49916,                      // Puerto de conexión
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
          socketPath: undefined,            // No es necesario un socket si estás usando un protocolo TCP
        });
        console.log('✅ Conexión exitosa a la base de datos');
      } catch (error) {
        console.error('❌ Error al conectar con la base de datos:', error);
        throw error;
      }
    }
    return this.pool;
  }

  public static async query(query: string, params: any[] = []): Promise<any> {
    try {
      const pool = this.connect();
      const [results] = await pool.query(query, params);
      return results;
    } catch (error) {
      console.error('❌ Error al ejecutar la consulta:', error);
      throw error;
    }
  }

  public static async getConnection(): Promise<mysql.Connection> {
    try {
      const pool = this.connect();
      return await pool.getConnection();
    } catch (error) {
      console.error('❌ Error al obtener una conexión:', error);
      throw error;
    }
  }
}
