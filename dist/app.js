"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/app.ts
const config_1 = require("./db/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const RouterUser_1 = __importDefault(require("./Router/RouterUser"));
const RouterHotel_1 = __importDefault(require("./Router/RouterHotel"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)()); // Middleware para parsear JSON
app.use(express_1.default.json()); // Middleware para parsear JSON
app.use("/Hotel", RouterHotel_1.default);
app.use("/User", RouterUser_1.default);
app.get('/', (req, res) => {
    res.send('¡Hola, mundo! Este es el servidor de la aplicación.' + config_1.port);
});
// Middleware para manejar errores
app.use((err, req, res, next) => {
    if (err.code === 'ECONNREFUSED') {
        res.status(503).json({ message: 'El servidor de la base de datos no está disponible.' });
    }
    else {
        res.status(500).json({ message: 'Algo salió mal, por favor intente de nuevo más tarde.' });
    }
});
// Iniciar el servidor
app.listen(config_1.port, () => {
    console.log(`Servidor corriendo en http://localhost:${config_1.port}`);
});
// app.ts
