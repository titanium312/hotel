"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Importaciones necesarias
const express_1 = require("express");
const EstadisticaHabitacion_1 = require("../../controllers/1-Inicio/EstadisticaHabitacion");
const asyncMiddleware_1 = __importDefault(require("./asyncMiddleware/asyncMiddleware"));
const Catalgo_1 = require("../../controllers/4-Habitaciones/Catalgo");
const Informacion_1 = require("../../controllers/4-Habitaciones/Informacion");
const Habtacion_Select_1 = require("../../controllers/4-Habitaciones/Select-Habitacion/Habtacion-Select");
const AgregarHabitacion_1 = require("../../controllers/4-Habitaciones/AgregarHabitacion");
const CambiarEstado_1 = require("../../controllers/4-Habitaciones/Informacion-Cambiarestado/CambiarEstado");
const EstadoReserva_1 = require("../../controllers/2-Recepcion/Select/EstadoReserva");
const Select_Pagos_1 = require("../../controllers/5-Servicios-Productos/Select-Extras/Select-Pagos");
const Recepsion_1 = require("../../controllers/2-Recepcion/Recepsion");
const ClienteController_1 = require("../../controllers/2-Recepcion/ClienteController");
const Adelantos_1 = require("../../controllers/4-Habitaciones/Informacion-Cambiarestado/Adelantos");
const CheckReserva_1 = require("../../controllers/4-Habitaciones/Informacion-Cambiarestado/CheckReserva");
const InsertarServicios_1 = require("../../controllers/5-Servicios-Productos/Reserva-Servicios/InsertarServicios");
const Lista_1 = require("../../controllers/4-Habitaciones/Informacion-Cambiarestado/Lista/Lista");
// Inicialización del router
const RtRecepcion = (0, express_1.Router)();
// Rutas definidas
RtRecepcion.get('/ver', (0, asyncMiddleware_1.default)(EstadisticaHabitacion_1.EstadisticasController.obtenerEstadisticas));
RtRecepcion.get('/get-images/:idHabitacion?', Catalgo_1.getAllImages);
// Ruta para obtener las crud de habitaciones
RtRecepcion.post('/habitacion', AgregarHabitacion_1.upload.single('imagen'), AgregarHabitacion_1.insertHabitacionWithImage);
RtRecepcion.get('/InformacionReserva/:idReserva', (0, asyncMiddleware_1.default)(Informacion_1.InformacionReserva.obtenerDetallesReserva));
RtRecepcion.get('/metodos-pago', Select_Pagos_1.obtenerMetodosPagoController);
RtRecepcion.post('/reserva', (0, asyncMiddleware_1.default)(Recepsion_1.RecepcionController.crearReservaYFactura)); // Crear una reserva y factura
RtRecepcion.post('/factura/Adelanto', (0, asyncMiddleware_1.default)(Adelantos_1.Adelanto));
RtRecepcion.post('/factura/Deuda', (0, asyncMiddleware_1.default)(Adelantos_1.ConsultarDeuda));
RtRecepcion.post('/clientes', ClienteController_1.ClienteController.upsertCliente); // Crear o actualizar un cliente
RtRecepcion.post('/factura/CheckReserva', (0, asyncMiddleware_1.default)(CheckReserva_1.CheckReserva));
// Obtener los servicios de una reserva específica
RtRecepcion.get('/reservas/:idReserva/servicios', (0, asyncMiddleware_1.default)(InsertarServicios_1.obtenerServiciosDeReserva));
// Insertar un servicio/producto a una reserva
RtRecepcion.post('/reservasInser/:idReserva/servicios', (0, asyncMiddleware_1.default)(InsertarServicios_1.insertarServicioAReserva));
// Eliminar un servicio/producto de una reserva
RtRecepcion.delete('/reservasEli/:idReserva/servicios/:idProducto', (0, asyncMiddleware_1.default)(InsertarServicios_1.eliminarServicioDeReserva));
RtRecepcion.put('/habitacion/imagen', AgregarHabitacion_1.upload.single('imagen'), AgregarHabitacion_1.updateImage);
RtRecepcion.delete('/habitacion/:ID_Habitacion', AgregarHabitacion_1.deleteHabitacion);
RtRecepcion.get('/reservas', Lista_1.Lista.obtenerReservas);
RtRecepcion.get('/clientesT', ClienteController_1.ClienteController.getClientes); // Obtener todos los clientes
RtRecepcion.get('/habitaciones/:id', (0, asyncMiddleware_1.default)(Habtacion_Select_1.getHabitacionInfo));
RtRecepcion.get('/reservasTabla', EstadisticaHabitacion_1.EstadisticasController.obtenerReservasActivas);
RtRecepcion.put('/habitacion/estado', (0, asyncMiddleware_1.default)(CambiarEstado_1.actualizarEstadoHabitacion));
RtRecepcion.get('/estados-habitacion', AgregarHabitacion_1.getEstadosHabitacion);
RtRecepcion.get('/metodos-pago', EstadoReserva_1.MetodoPago.getMetodoPago);
// Ruta raíz de prueba
RtRecepcion.get("/", (req, res) => {
    res.send("Esmos en recepcion ");
    console.log("Estamos en Router recepcion");
});
// Exportación del router
exports.default = RtRecepcion;
