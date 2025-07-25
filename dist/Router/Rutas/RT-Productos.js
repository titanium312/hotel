"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// ------------------------------ import de SERVICIOS ------------------------------
const express_1 = require("express");
// ------------------------------ Rutas de PRODUCTOS ------------------------------
const RegistraProducto_1 = require("../../controllers/5-Servicios-Productos/Productos/RegistraProducto");
const Producto_Ingresa_1 = require("../../controllers/5-Servicios-Productos/Productos/Producto-Ingresa");
const Producto_Sale_1 = require("../../controllers/5-Servicios-Productos/Productos/Producto-Sale");
const Select_Producto_1 = __importDefault(require("../../controllers/5-Servicios-Productos/Productos/SelectProducto/Select-Producto"));
const Select_tipoProducto_Provedores_1 = require("../../controllers/5-Servicios-Productos/Productos/SelectProducto/Select-tipoProducto-Provedores");
const RegistraProvedor_1 = require("../../controllers/5-Servicios-Productos/Productos/RegistraProvedor");
// ------------------------------ Rutas de PRODUCTOS ------------------------------
const asyncMiddleware_1 = __importDefault(require("./asyncMiddleware/asyncMiddleware"));
const RTProductos = (0, express_1.Router)();
// Crear un nuevo producto
RTProductos.post('/CrearProductos', RegistraProducto_1.createOrUpdateProduct);
RTProductos.get('/unidades', RegistraProducto_1.getUnidades);
RTProductos.delete('/ELIMINARproductos/:id', RegistraProducto_1.eliminarProducto);
// Registrar la entrada de un producto
RTProductos.post('/productos/entrada', Producto_Ingresa_1.agregarFactura);
// Registrar la venta de un producto
RTProductos.post('/producto/sale', Producto_Sale_1.ProductoSale);
// Obtener todos los productos registrados
RTProductos.get('/productos-Optener', Select_Producto_1.default);
RTProductos.get('/producto-tipos', (0, asyncMiddleware_1.default)(Select_tipoProducto_Provedores_1.ProductoController.obtenerTiposDeProductos));
RTProductos.get('/provedores', Select_tipoProducto_Provedores_1.ProductoController.obtenerProveedores);
RTProductos.post('/Crearprovedores', (0, asyncMiddleware_1.default)(RegistraProvedor_1.createProvedor));
RTProductos.post('/Eliminarprovedor/:ID_Provedor', (0, asyncMiddleware_1.default)(RegistraProvedor_1.eliminarProvedor));
// Obtener proveedores con sus productos
RTProductos.get('/provedores-productos', (0, asyncMiddleware_1.default)(RegistraProvedor_1.obtenerProveedoresConProductos));
RTProductos.get("/", (req, res) => {
    res.send("Estamos en Router master");
    console.log("Estamos en Router master");
});
exports.default = RTProductos;
// Rt-Productos.ts
