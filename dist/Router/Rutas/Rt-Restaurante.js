"use strict";
// ------------------------------ import de SERVICIOS ------------------------------
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ServivoResgistra_1 = require("../../controllers/5-Servicios-Productos/Servicios/ServivoResgistra");
const Select_Servicios_1 = require("../../controllers/5-Servicios-Productos/Servicios/select/Select-Servicios");
const ServiciosInsertar_1 = require("../../controllers/5-Servicios-Productos/Servicios/ServiciosInsertar");
const ServicioListaRecep_1 = require("../../controllers/5-Servicios-Productos/Servicios/ServicioListaRecep");
const Servicio_Actuliza_Elimina_1 = require("../../controllers/5-Servicios-Productos/Servicios/select/Servicio-Actuliza-Elimina");
const Select_tipoServicios_1 = require("../../controllers/5-Servicios-Productos/Servicios/select/Select-tipoServicios");
// ------------------------------ Rutas de SERVICIOS ------------------------------
const asyncMiddleware_1 = __importDefault(require("./asyncMiddleware/asyncMiddleware"));
const routerRt = (0, express_1.Router)();
// Registrar un nuevo servicio
routerRt.post('/RegistraServicio', ServivoResgistra_1.registerService);
// Ruta para obtener servicios con la opción de filtrar por tipo de servicio
routerRt.get('/ListaServicios', Select_Servicios_1.getServicios);
// Registrar un pedido para un servicio
routerRt.post('/recibir-pedido', ServiciosInsertar_1.recibirPedido);
// Obtener detalles de servicios
routerRt.get('/servicio/Recepcion-ServiciosList', (0, asyncMiddleware_1.default)(ServicioListaRecep_1.ServicioListaRecep));
// Cambiar el estado de un servicio
routerRt.put('/cambiar-estado', (0, asyncMiddleware_1.default)(Servicio_Actuliza_Elimina_1.actualizarEstadoFactura));
// Cambiar el estado de un servicio
routerRt.put('/Eliminar-Factura', (0, asyncMiddleware_1.default)(Servicio_Actuliza_Elimina_1.eliminarFacturaYDetalles));
routerRt.put('/Eliminar-Factura-Servicio', (0, asyncMiddleware_1.default)(Servicio_Actuliza_Elimina_1.eliminarServicioDeFactura));
// Obtener los tipos de servicios disponibless
routerRt.get('/servicios/tipo', Select_tipoServicios_1.getServiciosTipo);
routerRt.get("/", (req, res) => {
    res.send("Estamos en Router Restaurante");
    console.log("Estamos en Router Restaurante");
});
exports.default = routerRt;
// Rt-Restaurante.ts
