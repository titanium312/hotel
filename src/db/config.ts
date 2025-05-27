import dotenv from "dotenv";

dotenv.config();

export const port = process.env.PORT as string | number;
export const dbConfig = {
  host: process.env.DB_HOST as string,
  user: process.env.DB_USER as string,
  password: process.env.DB_PASSWORD as string,
  database: process.env.DB_NAME as string,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
};

console.log("Configuración de la base de datos:", dbConfig);
console.log("Puerto del servidor:", port);

// Opcional: Validar que ninguna variable esté indefinida
for (const [key, value] of Object.entries(dbConfig)) {
  if (value === undefined || value === null) {
    console.warn(`⚠️ La variable de entorno ${key} no está definida`);
  }
}

if (!port) {
  console.warn("⚠️ La variable de entorno PORT no está definida");
}
