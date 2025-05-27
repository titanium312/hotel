export const port = process.env.port || 1234;

export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456789',
  database: process.env.DB_NAME || 'hotel',
  port: parseInt(process.env.DB_PORT || '3306', 10)
};


// config.ts