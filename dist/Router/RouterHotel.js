"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Rt_Restaurante_1 = __importDefault(require("./Rutas/Rt-Restaurante"));
const Rt_inicio_1 = __importDefault(require("./Rutas/Rt-inicio"));
const Rt_Recepcion_1 = __importDefault(require("./Rutas/Rt-Recepcion"));
const RT_Productos_1 = __importDefault(require("./Rutas/RT-Productos"));
const RouterHotel = (0, express_1.Router)();
// Restaurante Routes
RouterHotel.use('/Restaurante', Rt_Restaurante_1.default);
RouterHotel.use("/Inicio", Rt_inicio_1.default);
RouterHotel.use("/Recepcion", Rt_Recepcion_1.default);
RouterHotel.use("/Productos", RT_Productos_1.default);
RouterHotel.get("/", (req, res) => {
    res.send("Estamos en Router master");
    console.log("Estamos en Router master");
});
exports.default = RouterHotel;
// RouterHotel.ts
