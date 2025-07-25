"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyClients = notifyClients;
const config_1 = require("./db/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const RouterUser_1 = __importDefault(require("./Router/RouterUser"));
const RouterHotel_1 = __importDefault(require("./Router/RouterHotel"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Arreglo para guardar todas las conexiones SSE activas
const clients = [];
// Función para enviar eventos SSE a todos los clientes conectados
function sendEventToClients(message) {
    clients.forEach(client => {
        client.write(`data: ${message}\n\n`);
    });
}
// Función que notifica a los clientes y escribe en consola
function notifyClients(message) {
    sendEventToClients(message);
}
// Middleware global que detecta cada petición y notifica
app.use((req, res, next) => {
    const info = `${req.method} ${req.originalUrl} - ${new Date().toLocaleTimeString()}`;
    notifyClients(`Nueva conexión: ${info}`);
    next();
});
app.use("/Hotel", RouterHotel_1.default);
app.use("/User", RouterUser_1.default);
app.get('/', (req, res) => {
    res.send('¡Hola, mundo! Este es el servidor de la aplicación.' + config_1.port);
});
// Endpoint SSE para logs en tiempo real
app.get('/logs', (req, res) => {
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
app.use((err, req, res, next) => {
    if (err.code === 'ECONNREFUSED') {
        res.status(503).json({ message: 'El servidor de la base de datos no está disponible.' });
    }
    else {
        res.status(500).json({ message: 'Algo salió mal, por favor intente de nuevo más tarde.' });
    }
});
app.listen(config_1.port, () => {
    console.log(`Servidor corriendo en http://localhost:${config_1.port}`);
});
exports.default = app;
