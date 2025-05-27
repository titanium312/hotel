// src/app.ts

import { port } from './db/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import router from './Router/RouterUser';
import RouterHotel from './Router/RouterHotel';

const app = express();
app.use(cors());
app.use(express.json());

app.use("/Hotel", RouterHotel);
app.use("/User", router);

app.get('/', (req: Request, res: Response) => {
  res.send('¡Hola, mundo! Este es el servidor de la aplicación.' + port);
});

// Función para notificar clientes (debes implementar la lógica real aquí)
export function notifyClients(message: string) {
  console.log("Notificando clientes:", message);
  // Aquí podrías enviar mensajes por websocket o lo que necesites
}

// Middleware para manejo de errores
app.use((err: any, req: Request, res: Response, next: any) => {
  if (err.code === 'ECONNREFUSED') {
    res.status(503).json({ message: 'El servidor de la base de datos no está disponible.' });
  } else {
    res.status(500).json({ message: 'Algo salió mal, por favor intente de nuevo más tarde.' });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

export default app; // Exportar app si la necesitas en otros archivos
