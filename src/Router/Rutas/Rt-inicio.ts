// Importaciones necesarias
import { Router } from 'express';
import { EstadisticasController } from '../../controllers/1-Inicio/EstadisticaHabitacion';
import asyncMiddleware from "./asyncMiddleware/asyncMiddleware";

// Inicialización del router
const RtInicio = Router();

// Rutas definidas
RtInicio.get('/estadisticas', asyncMiddleware(EstadisticasController.obtenerEstadisticas));
RtInicio.get('/reservasTabla', EstadisticasController.obtenerReservasActivas);

// Ruta raíz de prueba
RtInicio.get("/", (req, res) =>{
    res.send("estadistiacas 1 ");
    console.log("astaditicas de inicio");
});

// Exportación del router
export default RtInicio;
