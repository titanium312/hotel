// ------------------------------ import de SERVICIOS ------------------------------

import { Router } from 'express';
import { registerService } from '../../controllers/5-Servicios-Productos/Servicios/ServivoResgistra';
import { getServicios } from '../../controllers/5-Servicios-Productos/Servicios/select/Select-Servicios'; 
import { recibirPedido }  from '../../controllers/5-Servicios-Productos/Servicios/ServiciosInsertar'; 
import { ServicioListaRecep} from '../../controllers/5-Servicios-Productos/Servicios/ServicioListaRecep'; 
import { actualizarEstadoFactura, eliminarFacturaYDetalles,eliminarServicioDeFactura} from '../../controllers/5-Servicios-Productos/Servicios/select/Servicio-Actuliza-Elimina'; 
import { getServiciosTipo } from '../../controllers/5-Servicios-Productos/Servicios/select/Select-tipoServicios';


// ------------------------------ Rutas de SERVICIOS ------------------------------
import asyncMiddleware from "./asyncMiddleware/asyncMiddleware";

const routerRt = Router();


// Registrar un nuevo servicio
routerRt.post('/RegistraServicio', registerService);
// Ruta para obtener servicios con la opción de filtrar por tipo de servicio
routerRt.get('/ListaServicios', getServicios);
// Registrar un pedido para un servicio

routerRt.post('/recibir-pedido', recibirPedido);

// Obtener detalles de servicios
routerRt.get('/servicio/Recepcion-ServiciosList', asyncMiddleware(ServicioListaRecep));
// Cambiar el estado de un servicio
routerRt.put('/cambiar-estado', asyncMiddleware(actualizarEstadoFactura)); 
// Cambiar el estado de un servicio
routerRt.put('/Eliminar-Factura', asyncMiddleware(eliminarFacturaYDetalles));
routerRt.put('/Eliminar-Factura-Servicio', asyncMiddleware(eliminarServicioDeFactura));
// Obtener los tipos de servicios disponibless
routerRt.get('/servicios/tipo', getServiciosTipo);




routerRt.get("/", (req, res) =>{
    res.send("Estamos en Router Restaurante");
    console.log("Estamos en Router Restaurante");
});

export default routerRt;

// Rt-Restaurante.ts