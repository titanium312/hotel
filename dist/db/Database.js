"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const config_1 = require("./config");
class Database {
    // Método para conectar a la base de datos y obtener el pool de conexiones
    static connect() {
        if (!this.pool) {
            try {
                // Crear un pool con soporte para promesas
                this.pool = promise_1.default.createPool({
                    host: config_1.dbConfig.host, // Cambia esto si tu base de datos está en otro servidor
                    user: config_1.dbConfig.user, // Tu usuario de la base de datos
                    password: config_1.dbConfig.password, // Cambia esto con tu contraseña
                    database: config_1.dbConfig.database, // Nombre de la base de datos
                    waitForConnections: true,
                    connectionLimit: 10, // Límite de conexiones simultáneas
                    queueLimit: 0 // Sin límite de espera
                });
                console.log('Conexión exitosa a la base de datos');
            }
            catch (error) {
                console.error('Error al conectar con la base de datos:', error);
                throw error; // Lanza el error para detener la aplicación si es necesario
            }
        }
        return this.pool;
    }
    // Método para ejecutar una consulta utilizando el pool de conexiones
    static async query(query, params = []) {
        try {
            const pool = this.connect(); // Aseguramos que el pool de conexiones esté creado
            const [results] = await pool.query(query, params); // Ejecuta la consulta
            return results; // Retorna los resultados de la consulta
        }
        catch (error) {
            console.error('Error al ejecutar la consulta:', error);
            throw error; // Lanza el error para manejo externo
        }
    }
    // Opcional: Método para obtener una conexión específica (aunque no es necesario en muchos casos)
    static async getConnection() {
        try {
            const pool = this.connect(); // Aseguramos que el pool de conexiones esté creado
            return await pool.getConnection(); // Obtener una conexión desde el pool
        }
        catch (error) {
            console.error('Error al obtener una conexión:', error);
            throw error; // Lanza el error para manejo externo
        }
    }
}
exports.Database = Database;
