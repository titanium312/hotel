"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB_PORT = exports.DB_NAME = exports.DB_PASSWORD = exports.DB_USER = exports.DB_HOST = exports.port = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.port = process.env.PORT || 1234;
exports.DB_HOST = process.env.DB_HOST || 'localhost';
exports.DB_USER = process.env.DB_USER || 'root';
exports.DB_PASSWORD = process.env.DB_PASSWORD || '123456789';
exports.DB_NAME = process.env.DB_NAME || 'hotel';
exports.DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
// Mostrar valores actuales
console.log('🌍 Variables de entorno cargadas:');
console.log(`DB_HOST: ${exports.DB_HOST}`);
console.log(`DB_USER: ${exports.DB_USER}`);
console.log(`DB_PASSWORD: ${exports.DB_PASSWORD}`);
console.log(`DB_NAME: ${exports.DB_NAME}`);
console.log(`DB_PORT: ${exports.DB_PORT}`);
console.log(`APP PORT: ${exports.port}`);
