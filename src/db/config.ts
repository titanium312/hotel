import dotenv from 'dotenv';
dotenv.config();

export const port = process.env.PORT || 1234;

export const DB_HOST = process.env.DB_HOST || 'localhost';
export const DB_USER = process.env.DB_USER || 'root';
export const DB_PASSWORD = process.env.DB_PASSWORD || '123456789';
export const DB_NAME = process.env.DB_NAME || 'hotel';
export const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);

// Mostrar valores actuales
console.log('🌍 Variables de entorno cargadas:');
console.log(`DB_HOST: ${DB_HOST}`);
console.log(`DB_USER: ${DB_USER}`);
console.log(`DB_PASSWORD: ${DB_PASSWORD}`);
console.log(`DB_NAME: ${DB_NAME}`);
console.log(`DB_PORT: ${DB_PORT}`);
console.log(`APP PORT: ${port}`);
