// Importaciones necesarias
import { Router } from 'express';
import { EstadisticasController } from '../../controllers/1-Inicio/EstadisticaHabitacion';
import asyncMiddleware from "./asyncMiddleware/asyncMiddleware";
import { getAllImages } from '../../controllers/4-Habitaciones/Catalgo';
import { InformacionReserva } from '../../controllers/4-Habitaciones/Informacion'; 
import { getHabitacionInfo, eliminarReserva, getPisos } from '../../controllers/4-Habitaciones/Select-Habitacion/Habtacion-Select'; 
import { insertHabitacionWithImage, updateImage, deleteHabitacion, getTiposHabitacion, getEstadosHabitacion, upload } from '../../controllers/4-Habitaciones/AgregarHabitacion';
import { actualizarEstadoHabitacion,obtenerEstadosHabitacion} from '../../controllers/4-Habitaciones/Informacion-Cambiarestado/CambiarEstado';
import { MetodoPago } from '../../controllers/2-Recepcion/Select/EstadoReserva';
import { obtenerMetodosPagoController} from '../../controllers/5-Servicios-Productos/Select-Extras/Select-Pagos';
import { RecepcionController } from '../../controllers/2-Recepcion/Recepsion';
import { ClienteController } from '../../controllers/2-Recepcion/ClienteController';
import { Adelanto,ConsultarDeuda } from '../../controllers/4-Habitaciones/Informacion-Cambiarestado/Adelantos';
import { CheckReserva } from '../../controllers/4-Habitaciones/Informacion-Cambiarestado/CheckReserva';
import { obtenerServiciosDeReserva, insertarServicioAReserva, eliminarServicioDeReserva } from '../../controllers/5-Servicios-Productos/Reserva-Servicios/InsertarServicios';
import { Lista } from '../../controllers/4-Habitaciones/Informacion-Cambiarestado/Lista/Lista';

// Inicialización del router
const RtRecepcion = Router();

// Rutas definidas
RtRecepcion.get('/ver', asyncMiddleware(EstadisticasController.obtenerEstadisticas));

RtRecepcion.get('/get-images/:idHabitacion?', getAllImages);


// Ruta para obtener las crud de habitaciones
RtRecepcion.post('/habitacion', upload.single('imagen'), insertHabitacionWithImage);

RtRecepcion.get('/InformacionReserva/:idReserva', asyncMiddleware(InformacionReserva.obtenerDetallesReserva));

RtRecepcion.get('/metodos-pago', obtenerMetodosPagoController);

RtRecepcion.post('/reserva', asyncMiddleware(RecepcionController.crearReservaYFactura));// Crear una reserva y factura

RtRecepcion.post('/factura/Adelanto', asyncMiddleware(Adelanto));

RtRecepcion.post('/factura/Deuda', asyncMiddleware(ConsultarDeuda));

RtRecepcion.post('/clientes', ClienteController.upsertCliente);// Crear o actualizar un cliente

RtRecepcion.post('/factura/CheckReserva', asyncMiddleware(CheckReserva));

// Obtener los servicios de una reserva específica
RtRecepcion.get('/reservas/:idReserva/servicios',  asyncMiddleware(obtenerServiciosDeReserva));

// Insertar un servicio/producto a una reserva
RtRecepcion.post('/reservasInser/:idReserva/servicios', asyncMiddleware(insertarServicioAReserva));


// Eliminar un servicio/producto de una reserva

  RtRecepcion.delete('/reservasEli/:idReserva/servicios/:idProducto', asyncMiddleware(eliminarServicioDeReserva));

RtRecepcion.put('/habitacion/imagen', upload.single('imagen'), updateImage);
RtRecepcion.delete('/habitacion/:ID_Habitacion', deleteHabitacion);

RtRecepcion.get('/reservas', Lista.obtenerReservas);
RtRecepcion.get('/clientesT', ClienteController.getClientes);// Obtener todos los clientes

RtRecepcion.get('/habitaciones/:id', asyncMiddleware(getHabitacionInfo));

RtRecepcion.get('/reservasTabla', EstadisticasController.obtenerReservasActivas);

RtRecepcion.put('/habitacion/estado', asyncMiddleware(actualizarEstadoHabitacion));

RtRecepcion.get('/estados-habitacion', getEstadosHabitacion);

RtRecepcion.get('/metodos-pago', MetodoPago.getMetodoPago);

// Ruta raíz de prueba
RtRecepcion.get("/", (req, res) =>{
    res.send("Esmos en recepcion ");
    console.log("Estamos en Router recepcion");
});

// Exportación del router
export default RtRecepcion;
