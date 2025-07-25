import { Request, Response } from 'express';
import { Database } from '../../../db/Database';




export const ServicioListaRecep = async (req: Request, res: Response): Promise<Response> => {
  try {
    const connection = await Database.getConnection();

    // Parámetros recibidos
    const idFacturaRaw = req.query.idFactura as string | undefined;
    const fechaInicio = req.query.fechaInicio as string | undefined;
    const fechaFin = req.query.fechaFin as string | undefined;

    // Si idFactura es 't' o no existe, no filtramos por ID_Factura
    const idFactura = (idFacturaRaw && idFacturaRaw.toLowerCase() !== 't') ? parseInt(idFacturaRaw, 10) : null;

    // Armar query base
    let baseQuery = `
      SELECT
        f.ID_Factura,
        sd.ID_Servicio,
        s.Nombre AS Nombre_Servicio,
        sd.Cantidad,
        sd.Total,
        ef.Descripcion AS Estado_Servicio,
        f.Fecha_Emision,
        st.Descripcion AS Tipo_Servicio,
        sd.mesa,
        u.nombre_usuario AS Nombre_Usuario_Factura,
        mp.Descripcion AS Metodo_Pago
      FROM factura f
      JOIN servicio_detalle sd ON f.ID_Factura = sd.ID_Factura
      JOIN servicio s ON sd.ID_Servicio = s.ID_Servicio
      JOIN estadofactura ef ON f.ID_estadoFactura = ef.ID_EstadoFactura
      JOIN servicio_tipo_relacion str ON s.ID_Servicio = str.ID_Servicio
      JOIN servicio_tipo st ON str.ID_Servicio_tipo = st.ID_producto_tipo
      JOIN usuarios u ON f.ID_usuario = u.id
      LEFT JOIN metodoPago mp ON f.ID_MetodoPago = mp.ID_MetodoPago
      WHERE 1=1
    `;

    const params: any[] = [];

    if (idFactura) {
      baseQuery += ' AND f.ID_Factura = ?';
      params.push(idFactura);
    }

    // Solo filtra por fechas si existen y no es 't'
    if (
      fechaInicio && fechaInicio.toLowerCase() !== 't' &&
      fechaFin && fechaFin.toLowerCase() !== 't'
    ) {
      baseQuery += ' AND f.Fecha_Emision BETWEEN ? AND ?';
      params.push(fechaInicio, fechaFin);
    }

    baseQuery += ' LIMIT 100;';

    // Ejecutar query
    const [rows]: any[] = await connection.execute(baseQuery, params);

    // Obtener precios de servicios para cálculo
    const servicioIds = Array.from(new Set(rows.map((r: any) => r.ID_Servicio)));
    let preciosMap: Record<number, number> = {};

    if (servicioIds.length > 0) {
      const [preciosRows]: any[] = await connection.query(
        `SELECT ID_Servicio, Precio FROM servicio WHERE ID_Servicio IN (${servicioIds.join(',')})`
      );
      preciosMap = preciosRows.reduce((acc: any, cur: any) => {
        acc[cur.ID_Servicio] = Number(cur.Precio);
        return acc;
      }, {});
    }

    connection.release();

    // Formatea número eliminando ceros innecesarios
    const formatearNumero = (num: number): string => {
      return num % 1 === 0 ? num.toFixed(0) : num.toString();
    };

    // Calcula precio unitario desde tabla o total
    const calcularPrecioUnitario = (item: any): number => {
      const precioTabla = preciosMap[item.ID_Servicio];
      if (precioTabla && item.Cantidad > 0) return precioTabla;
      if (item.Cantidad > 0) return Number(item.Total) / item.Cantidad;
      return 0;
    };

    // Agrupar resultados por factura y tipo de servicio
    const facturasMap: Record<number, any> = {};

    for (const item of rows) {
      const precioUnitarioNum = calcularPrecioUnitario(item);
      const precioUnitario = formatearNumero(precioUnitarioNum);

      const servicioObj = {
        ID_Servicio: item.ID_Servicio,
        Nombre_Servicio: item.Nombre_Servicio,
        Cantidad: item.Cantidad,
        Precio_Unitario: precioUnitario,
      };

      if (!facturasMap[item.ID_Factura]) {
        facturasMap[item.ID_Factura] = {
          ID_Factura: item.ID_Factura,
          Fecha_Emision: item.Fecha_Emision,
          mesa: item.mesa,
          Nombre_Usuario_Factura: item.Nombre_Usuario_Factura,
          Metodo_Pago: item.Metodo_Pago,
          Estado_Servicio: item.Estado_Servicio,
          Servicios: {},
          TotalFactura: 0,
        };
      }

      // Inicializar arreglo si no existe para ese tipo de servicio
      if (!facturasMap[item.ID_Factura].Servicios[item.Tipo_Servicio]) {
        facturasMap[item.ID_Factura].Servicios[item.Tipo_Servicio] = [];
      }

      facturasMap[item.ID_Factura].Servicios[item.Tipo_Servicio].push(servicioObj);

      facturasMap[item.ID_Factura].TotalFactura += precioUnitarioNum * item.Cantidad;
    }

    // Formatear totales finales
    const facturas = Object.values(facturasMap).map(f => ({
      ...f,
      TotalFactura: f.TotalFactura % 1 === 0
        ? f.TotalFactura.toFixed(0)
        : f.TotalFactura.toFixed(2),
    }));

    return res.status(200).json({ facturas });

  } catch (error: any) {
    console.error('Error al obtener los servicios:', error);
    return res.status(500).json({
      error: 'Hubo un problema al obtener los servicios.',
      message: error.message,
      sql: error.sql,
      code: error.code,
    });
    }
};