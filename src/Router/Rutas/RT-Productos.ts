// ------------------------------ import de SERVICIOS ------------------------------
import { Router } from 'express';

// ------------------------------ Rutas de PRODUCTOS ------------------------------

import { createOrUpdateProduct,getUnidades,eliminarProducto, } from '../../controllers/5-Servicios-Productos/Productos/RegistraProducto'; 
import { agregarFactura } from '../../controllers/5-Servicios-Productos/Productos/Producto-Ingresa'; 
import { ProductoSale } from '../../controllers/5-Servicios-Productos/Productos/Producto-Sale'; 
import obtenerProductos from '../../controllers/5-Servicios-Productos/Productos/SelectProducto/Select-Producto';
import { ProductoController} from '../../controllers/5-Servicios-Productos/Productos/SelectProducto/Select-tipoProducto-Provedores';
import { createProvedor,obtenerProveedoresConProductos,eliminarProvedor} from '../../controllers/5-Servicios-Productos/Productos/RegistraProvedor'; 


// ------------------------------ Rutas de PRODUCTOS ------------------------------
import asyncMiddleware from "./asyncMiddleware/asyncMiddleware";

const RTProductos = Router();
// Crear un nuevo producto
RTProductos.post('/CrearProductos', createOrUpdateProduct);

RTProductos.get('/unidades', getUnidades);

RTProductos.delete('/ELIMINARproductos/:id', eliminarProducto);
// Registrar la entrada de un producto
RTProductos.post('/productos/entrada', agregarFactura);
// Registrar la venta de un producto
RTProductos.post('/producto/sale', ProductoSale);
// Obtener todos los productos registrados
RTProductos.get('/productos-Optener', obtenerProductos);
RTProductos.get('/producto-tipos', asyncMiddleware(ProductoController.obtenerTiposDeProductos));
RTProductos.get('/provedores', ProductoController.obtenerProveedores);
RTProductos.post('/Crearprovedores', asyncMiddleware(createProvedor));
RTProductos.post('/Eliminarprovedor/:ID_Provedor', asyncMiddleware(eliminarProvedor));
// Obtener proveedores con sus productos
RTProductos.get('/provedores-productos', asyncMiddleware(obtenerProveedoresConProductos));

RTProductos.get("/", (req, res) => {
    res.send("Estamos en Router master");
    console.log("Estamos en Router master");
}); 


export default  RTProductos;

// Rt-Productos.ts