"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Importaciones necesarias
const express_1 = require("express");
const EstadisticaHabitacion_1 = require("../../controllers/1-Inicio/EstadisticaHabitacion");
const asyncMiddleware_1 = __importDefault(require("./asyncMiddleware/asyncMiddleware"));
// Inicialización del router
const RtInicio = (0, express_1.Router)();
// Rutas definidas
RtInicio.get('/estadisticas', (0, asyncMiddleware_1.default)(EstadisticaHabitacion_1.EstadisticasController.obtenerEstadisticas));
RtInicio.get('/reservasTabla', EstadisticaHabitacion_1.EstadisticasController.obtenerReservasActivas);
// Ruta raíz de prueba
RtInicio.get("/", (req, res) => {
    res.send("estadistiacas 1 ");
    console.log("astaditicas de inicio");
});
// Exportación del router
exports.default = RtInicio;
