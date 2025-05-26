// src/app.ts
import { port } from './db/config';
import express, { Request, Response, Router } from 'express';
import cors from 'cors';
import router from './Router/RouterUser';
import RouterHotel from './Router/RouterHotel';

const app = express();
app.use(cors()); // Middleware para parsear JSON
app.use(express.json()); // Middleware para parsear JSON


app.use("/Hotel",RouterHotel);
app.use("/User",router);


app.get('/', (req: Request, res: Response) => {
  res.send('¡Hola, mundo! Este es el servidor de la aplicación.'+port);
});

// Middleware para manejar errores
app.use((err: any, req: Request, res: Response, next: any) => {
  if (err.code === 'ECONNREFUSED') {
    res.status(503).json({ message: 'El servidor de la base de datos no está disponible.' });
  } else {
    res.status(500).json({ message: 'Algo salió mal, por favor intente de nuevo más tarde.' });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});



// app.ts