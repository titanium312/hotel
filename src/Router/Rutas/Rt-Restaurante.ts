// ------------------------------ import de SERVICIOS ------------------------------deleteService,updateService

import { Router } from 'express';
import { RegistraServicio,EliminarServicio } from '../../controllers/5-Servicios-Productos/Servicios/ServivoResgistra';
import { getServicios } from '../../controllers/5-Servicios-Productos/Servicios/select/Select-Servicios'; 
import { recibirPedido,insertEstadoCaja,getEstadosCaja}  from '../../controllers/5-Servicios-Productos/Servicios/ServiciosInsertar'; 
import { ServicioListaRecep} from '../../controllers/5-Servicios-Productos/Servicios/ServicioListaRecep'; 
import { actualizarEstadoFactura, eliminarFacturaYDetalles,eliminarServicioDeFactura,actualizarMetodoPagoPorFactura} from '../../controllers/5-Servicios-Productos/Servicios/select/Servicio-Actuliza-Elimina'; 
import { getServiciosTipo } from '../../controllers/5-Servicios-Productos/Servicios/select/Select-tipoServicios';


// ------------------------------ Rutas de SERVICIOS ------------------------------
import asyncMiddleware from "./asyncMiddleware/asyncMiddleware";

const routerRt = Router();


// Registrar un nuevo servicio
routerRt.post('/RegistraServicio', asyncMiddleware(RegistraServicio));

// Eliminar un servicio 
routerRt.delete('/EliminarServicio/:ID_Servicio', asyncMiddleware(EliminarServicio));

// Ruta para obtener servicios con la opción de filtrar por tipo de servicio
routerRt.get('/ListaServicios', getServicios);
// Registrar un pedido para un servicio
routerRt.post('/recibir-pedido', recibirPedido);
// Obtener detalles de servicios
routerRt.get('/servicio/Recepcion-ServiciosList', asyncMiddleware(ServicioListaRecep));
// caja 
routerRt.post('/Caja',asyncMiddleware(insertEstadoCaja));

routerRt.post('/CajaEstado', asyncMiddleware(getEstadosCaja));


// Cambiar el estado de un servicio
routerRt.put('/cambiar-estado', asyncMiddleware(actualizarEstadoFactura)); 
// Cambiar el metodo de pago de un servicio
routerRt.put('/cambiar-Metodo-pago', asyncMiddleware(actualizarMetodoPagoPorFactura)); 
// Cambiar el estado de un servicio
routerRt.put('/Eliminar-Factura/:ID_Factura', eliminarFacturaYDetalles);
// Eliminar un servicio de una factura
routerRt.put('/Eliminar-Factura-Servicio', asyncMiddleware(eliminarServicioDeFactura));
// Obtener los tipos de servicios disponibless
routerRt.get('/servicios/tipo', getServiciosTipo);




routerRt.get("/", (req, res) =>{
    res.send("Estamos en Router Restaurante");
    console.log("Estamos en Router Restaurante");
});

export default routerRt;

// Rt-Restaurante.ts