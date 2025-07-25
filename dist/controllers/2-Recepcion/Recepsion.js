"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecepcionController = void 0;
const Database_1 = require("../../db/Database");
const moment_1 = __importDefault(require("moment"));
const pool = Database_1.Database.connect();
class RecepcionController {
    static async crearReservaYFactura(req, res) {
        const connection = await pool.getConnection();
        try {
            const { clienteId, habitacionId, fechaInicio, fechaFin, metodoPago, adelanto = 0, descuentoPorcentaje = 0, montoDescuento = 0 } = req.body;
            // Validación básica
            if (!clienteId || !habitacionId || !fechaInicio || !fechaFin || !metodoPago) {
                return res.status(400).json({ message: 'Faltan datos requeridos' });
            }
            if (!(0, moment_1.default)(fechaInicio, 'DD/MM/YYYY HH:mm', true).isValid() || !(0, moment_1.default)(fechaFin, 'DD/MM/YYYY HH:mm', true).isValid()) {
                return res.status(400).json({ message: 'Las fechas proporcionadas no son válidas.' });
            }
            const fechaInicioTimestamp = (0, moment_1.default)(fechaInicio, 'DD/MM/YYYY HH:mm').format('YYYY-MM-DD HH:mm:ss');
            const fechaFinTimestamp = (0, moment_1.default)(fechaFin, 'DD/MM/YYYY HH:mm').format('YYYY-MM-DD HH:mm:ss');
            const hoy = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
            await connection.beginTransaction();
            // Verificar disponibilidad de habitación
            const [reservasExistentes] = await connection.execute(`SELECT r.ID_Reserva, rh.ID_RHEstado
         FROM reserva r
         JOIN ReservaHabitacion rh ON r.ID_Reserva = rh.ID_Reserva
         WHERE rh.ID_Habitacion = ? 
         AND ((r.Fecha_Ingreso BETWEEN ? AND ?) OR (r.Fecha_Salida BETWEEN ? AND ?))
         AND rh.ID_RHEstado != 2;`, [habitacionId, fechaInicioTimestamp, fechaFinTimestamp, fechaInicioTimestamp, fechaFinTimestamp]);
            if (reservasExistentes.length > 0) {
                return res.status(409).json({ message: 'Ya existe una reserva activa para esta habitación en las fechas seleccionadas.' });
            }
            // Obtener costo de habitación por hora
            const [habitacionResult] = await connection.execute(`SELECT Costo FROM habitacion WHERE ID_Habitacion = ?`, [habitacionId]);
            if (habitacionResult.length === 0) {
                return res.status(404).json({ message: 'Habitación no encontrada' });
            }
            const costoPorHora = habitacionResult[0].Costo;
            // Calcular la duración en horas
            const horasEstadia = (0, moment_1.default)(fechaFinTimestamp).diff((0, moment_1.default)(fechaInicioTimestamp), 'hours', true);
            // Calcular el costo total basado en las horas
            let total = costoPorHora * horasEstadia;
            // Aplicar descuentos si existen
            if (descuentoPorcentaje > 0) {
                total -= (total * descuentoPorcentaje) / 100;
            }
            if (montoDescuento > 0) {
                total -= montoDescuento;
            }
            // Crear la reserva
            const [reservaResult] = await connection.execute(`INSERT INTO reserva (ID_Cliente, Fecha_Ingreso, Fecha_Salida, Observaciones) 
         VALUES (?, ?, ?, ?);`, [clienteId, fechaInicioTimestamp, fechaFinTimestamp, `Reserva por ${horasEstadia} horas`]);
            const reservaId = reservaResult.insertId;
            // Crear la factura con el ID generado automáticamente
            const [facturaResult] = await connection.execute(`INSERT INTO factura (Total, ID_estadoFactura, TipoFactura, Fecha_Emision, Adelanto) 
         VALUES (?, ?, ?, ?, ?);`, [total, 1, 2, hoy, adelanto]);
            const facturaId = facturaResult.insertId;
            // Actualizar la referencia de la factura en la reserva
            await connection.execute(`UPDATE reserva SET ID_Factura = ? WHERE ID_Reserva = ?;`, [facturaId, reservaId]);
            // Calcular la diferencia en horas entre la fecha actual y la fecha de inicio
            const horasDiferencia = (0, moment_1.default)(fechaInicioTimestamp).diff((0, moment_1.default)(hoy), 'hours');
            const estadoReservaHabitacion = horasDiferencia > 2 ? 3 : 1; // 3 = espera, 1 = activo
            // Crear relación reserva-habitación y asignar estado
            await connection.execute(`INSERT INTO ReservaHabitacion (ID_Habitacion, ID_RHEstado, ID_Reserva, Fecha_Asignacion) 
         VALUES (?, ?, ?, ?);`, [habitacionId, estadoReservaHabitacion, reservaId, hoy]);
            // Actualizar estado de la habitación solo si la reserva es activa
            if (estadoReservaHabitacion === 1) {
                await connection.execute(`UPDATE habitacion SET ID_Estado_Habitacion = (
             SELECT ID_Estado_Habitacion FROM estado_habitacion WHERE Descripcion = 'Ocupada'
           ) WHERE ID_Habitacion = ?;`, [habitacionId]);
            }
            // Registrar el pago inicial si hay adelanto
            if (adelanto > 0) {
                await connection.execute(`INSERT INTO pagos (ID_Factura, Monto, Fecha_Pago, ID_MetodoPago) 
           VALUES (?, ?, ?, ?);`, [facturaId, adelanto, hoy, metodoPago]);
            }
            await connection.commit();
            return res.status(201).json({
                message: 'Reserva y factura creadas exitosamente',
                reservaId,
                facturaId,
                detalles: {
                    horasEstadia,
                    costoPorHora,
                    total
                }
            });
        }
        catch (error) {
            await connection.rollback();
            console.error('Error:', error);
            return res.status(500).json({
                message: error instanceof Error ? error.message : 'Ocurrió un error desconocido'
            });
        }
        finally {
            connection.release();
        }
    }
}
exports.RecepcionController = RecepcionController;
/*
C:\Users\pc\Documents\trabajo\hotel\Banken\mi-backend-ts\src>curl -X POST http://localhost:1234/Hotel/habitacion ^
¿Más? -F "imagen=@C:\Users\pc\Pictures\c.png" ^
¿Más? -F "ID_Habitacion=1" ^
¿Más? -F "Nombre=Habitación Deluxe" ^s
¿Más? -F "Costo=150" ^ad
¿Más? -F "ID_Estado_Habitacion=1" ^
¿Más? -F "ID_Tipo_Habitacion=1" ^
¿Más? -F "Descripcion=Habitación amplia con vista al mar." ^
¿Más? -F "DescripcionImg=Imagen de la habitación" ^
¿Más? -F "ID_Piso=2"
{"message":"Habitación e imagen subidas correctamente."}

*/ 
