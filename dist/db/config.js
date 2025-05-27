"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbConfig = exports.port = void 0;
exports.port = process.env.port || 1234;
exports.dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456789',
    database: process.env.DB_NAME || 'hotel',
    port: parseInt(process.env.DB_PORT || '3306', 10)
};
