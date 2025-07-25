"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServicios = void 0;
const Database_1 = require("../../../../db/Database");
const pool = Database_1.Database.connect();
const getServicios = async (req, res) => {
    try {
        // Actualización de la consulta SQL para incluir la unidad de cada producto
        const [servicios] = await pool.query(`
      SELECT s.ID_Servicio, s.Nombre, s.Descripcion, s.Precio,
             sp.ID_Producto, sp.Cantidad, 
             p.Nombre AS Nombre_Producto, p.Precio_Unitario, p.Stock, u.Descripcion AS Unidad_Producto
      FROM servicio s
      LEFT JOIN servicio_producto sp ON s.ID_Servicio = sp.ID_Servicio
      LEFT JOIN producto p ON sp.ID_Producto = p.ID_Producto
      LEFT JOIN unidad u ON p.ID_Unidad = u.ID_Unidad
    `);
        // Organizar los servicios con sus productos
        const serviciosConProductos = servicios.reduce((acc, s) => {
            let servicio = acc.find(item => item.ID_Servicio === s.ID_Servicio);
            if (!servicio) {
                servicio = {
                    ID_Servicio: s.ID_Servicio,
                    Nombre: s.Nombre,
                    Descripcion: s.Descripcion,
                    Costo: s.Precio,
                    Productos: [],
                    MaxUnidades: 0
                };
                acc.push(servicio);
            }
            if (s.ID_Producto) {
                servicio.Productos.push({
                    ID_Producto: s.ID_Producto,
                    Nombre_Producto: s.Nombre_Producto,
                    Cantidad: s.Cantidad,
                    Precio_Unitario: s.Precio_Unitario,
                    Stock: s.Stock,
                    Unidad_Producto: s.Unidad_Producto // Agregar la unidad de medida
                });
            }
            return acc;
        }, []);
        // Calcular las unidades máximas por servicio
        serviciosConProductos.forEach(servicio => {
            if (servicio.Productos.length === 0) {
                servicio.MaxUnidades = Infinity;
            }
            else {
                const cantidadesPosibles = servicio.Productos.map((p) => {
                    const cantidadNecesaria = parseFloat(p.Cantidad.toString());
                    const disponible = parseFloat(p.Stock.toString());
                    return Math.floor(disponible / cantidadNecesaria);
                });
                servicio.MaxUnidades = Math.min(...cantidadesPosibles);
            }
        });
        // Enviar la respuesta con los servicios y sus productos
        res.status(200).json(serviciosConProductos);
    }
    catch (error) {
        console.error('Error al obtener los servicios:', error);
        res.status(500).json({ error: 'Error al obtener los servicios.' });
    }
};
exports.getServicios = getServicios;
