"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Rt_Restaurante_1 = __importDefault(require("./Rutas/Rt-Restaurante"));
const RouterHotel = (0, express_1.Router)();
// Restaurante Routes
RouterHotel.use('/Restaurante', Rt_Restaurante_1.default);
RouterHotel.get("/", (req, res) => {
    res.send("Estamos en Router mastes");
    console.log("Estamos en Router mastes");
});
exports.default = RouterHotel;
// RouterHotel.ts
