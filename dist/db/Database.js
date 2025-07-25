"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const config_1 = require("./config");
class Database {
    static connect() {
        if (!this.pool) {
            try {
                this.pool = promise_1.default.createPool({
                    host: config_1.DB_HOST,
                    user: config_1.DB_USER,
                    password: config_1.DB_PASSWORD,
                    database: config_1.DB_NAME,
                    port: config_1.DB_PORT,
                });
            }
            catch (error) {
                console.error('Error creating MySQL pool:', error);
                throw error;
            }
        }
        return this.pool;
    }
    // ✅ Add this method
    static async getConnection() {
        const pool = this.connect(); // Ensure pool is initialized
        return await pool.getConnection();
    }
}
exports.Database = Database;
