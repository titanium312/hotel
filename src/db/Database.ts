import mysql from 'mysql2/promise';
import { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } from './config';

export class Database {
  private static pool: mysql.Pool;

  public static connect(): mysql.Pool {
    if (!this.pool) {
      try {
        this.pool = mysql.createPool({
          host: DB_HOST,
          user: DB_USER,
          password: DB_PASSWORD,
          database: DB_NAME,
          port: DB_PORT,
        });
      } catch (error) {
        console.error('Error creating MySQL pool:', error);
        throw error;
      }
    }
    return this.pool;
  }

  // ✅ Add this method
  public static async getConnection(): Promise<mysql.PoolConnection> {
    const pool = this.connect(); // Ensure pool is initialized
    return await pool.getConnection();
  }
}
