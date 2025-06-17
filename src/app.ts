import { port } from './db/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import router from './Router/RouterUser';
import RouterHotel from './Router/RouterHotel';

const app = express();
app.use(cors());
app.use(express.json());

// Arreglo para guardar todas las conexiones SSE activas
const clients: Response[] = [];

// Función para enviar eventos SSE a todos los clientes conectados
function sendEventToClients(message: string) {
  clients.forEach(client => {
    client.write(`data: ${message}\n\n`);
  });
}

// Función que notifica a los clientes y escribe en consola
export function notifyClients(message: string) {
  sendEventToClients(message);
}

// Middleware global que detecta cada petición y notifica
app.use((req: Request, res: Response, next) => {
  const info = `${req.method} ${req.originalUrl} - ${new Date().toLocaleTimeString()}`;
  notifyClients(`Nueva conexión: ${info}`);
  next();
});

app.use("/Hotel", RouterHotel);
app.use("/User", router);

app.get('/', (req: Request, res: Response) => {
  res.send('¡Hola, mundo! Este es el servidor de la aplicación.' + port);
});

// Endpoint SSE para logs en tiempo real
app.get('/logs', (req: Request, res: Response) => {
  // Configura las cabeceras para SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Añadimos esta conexión a la lista
  clients.push(res);

  // Mandamos mensaje inicial
  res.write(`data: Conexión establecida. Esperando mensajes...\n\n`);

  // Cuando el cliente desconecta, removemos la conexión
  req.on('close', () => {
    const index = clients.indexOf(res);
    if (index !== -1) {
      clients.splice(index, 1);
    }
  });
});

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

export default app;
