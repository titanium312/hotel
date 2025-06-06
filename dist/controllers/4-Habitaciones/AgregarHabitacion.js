"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteHabitacion = exports.updateImage = exports.getEstadosHabitacion = exports.getTiposHabitacion = exports.insertHabitacionWithImage = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const Database_1 = require("../../db/Database"); // Asegúrate de tener tu archivo de configuración DB
// Crear un pool de conexiones a la base de datos
const pool = Database_1.Database.connect();
// Configuración de Multer para manejar los archivos de imagen
const storage = multer_1.default.memoryStorage(); // Almacenamiento en memoria
exports.upload = (0, multer_1.default)({ storage: storage }); // Exportamos `upload` para ser usado en rutas
// Función para insertar habitación con imagen
const insertHabitacionWithImage = async (req, res) => {
    let connection;
    try {
        // Verificar si se ha subido una imagen
        if (!req.file) {
            res.status(400).json({ message: 'No se ha subido ninguna imagen.' });
            return;
        }
        // Obtener los datos del cuerpo de la solicitud
        const { ID_Habitacion, Nombre, Costo, ID_Estado_Habitacion, ID_Tipo_Habitacion, Descripcion, DescripcionImg, ID_Piso } = req.body;
        // Validar que todos los campos requeridos estén presentes
        if (!ID_Habitacion || !Nombre || !Costo || !ID_Estado_Habitacion || !ID_Tipo_Habitacion || !Descripcion || !ID_Piso) {
            res.status(400).json({ message: 'Faltan parámetros necesarios.' });
            return;
        }
        // Asignamos la imagen a la variable, se obtiene desde req.file.buffer
        const Imagen = req.file.buffer;
        const Fecha_Creacion = new Date();
        // Obtener una conexión al pool de la base de datos
        connection = await pool.getConnection();
        // Verificar si el tipo de habitación existe
        const [tipoHabitacionRows] = await connection.execute(`
      SELECT * FROM tipo_habitacion WHERE ID_Tipo_Habitacion = ?
    `, [ID_Tipo_Habitacion]);
        if (tipoHabitacionRows.length === 0) {
            res.status(400).json({ message: `El tipo de habitación con ID ${ID_Tipo_Habitacion} no existe.` });
            return;
        }
        // Verificar si el piso existe
        const [pisoRows] = await connection.execute(`
      SELECT * FROM Piso WHERE ID_Piso = ?
    `, [ID_Piso]);
        if (pisoRows.length === 0) {
            res.status(400).json({ message: `El piso con ID ${ID_Piso} no existe.` });
            return;
        }
        // Verificar si la habitación con esa ID ya existe
        const [existingHabitacionRows] = await connection.execute(`
      SELECT * FROM habitacion WHERE ID_Habitacion = ?
    `, [ID_Habitacion]);
        if (existingHabitacionRows.length > 0) {
            res.status(400).json({ message: `Ya existe una habitación con el ID ${ID_Habitacion}.` });
            return;
        }
        // Insertar la habitación con la ID proporcionada manualmente
        const [insertHabitacionResult] = await connection.execute(`
      INSERT INTO habitacion (ID_Habitacion, Nombre, Costo, ID_Estado_Habitacion, Descripcion, ID_Tipo_Habitacion, ID_Piso)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [ID_Habitacion, Nombre, Costo, ID_Estado_Habitacion, Descripcion, ID_Tipo_Habitacion, ID_Piso]);
        // Insertar la imagen de la habitación
        await connection.execute(`
      INSERT INTO imagenes_habitacion (ID_Habitacion, Imagen, Descripcion, Fecha_Creacion)
      VALUES (?, ?, ?, ?)
    `, [ID_Habitacion, Imagen, DescripcionImg, Fecha_Creacion]);
        res.status(200).json({ message: 'Habitación e imagen subidas correctamente.' });
    }
    catch (error) {
        console.error('Error al guardar la habitación y la imagen:', error);
        res.status(500).json({ message: 'Error al guardar la habitación y la imagen.' });
    }
    finally {
        if (connection)
            connection.release(); // Aseguramos liberar la conexión
    }
};
exports.insertHabitacionWithImage = insertHabitacionWithImage;
// Función para obtener tipos de habitación
const getTiposHabitacion = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        // Obtener todos los tipos de habitación
        const [rows] = await connection.execute(`
      SELECT ID_Tipo_Habitacion, Descripcion 
      FROM tipo_habitacion
    `);
        if (rows.length > 0) {
            res.status(200).json({ tiposHabitacion: rows });
        }
        else {
            res.status(404).json({ message: 'No se encontraron tipos de habitación.' });
        }
    }
    catch (error) {
        console.error('Error al obtener los tipos de habitación:', error);
        res.status(500).json({ message: 'Error al obtener los tipos de habitación.' });
    }
    finally {
        if (connection)
            connection.release();
    }
};
exports.getTiposHabitacion = getTiposHabitacion;
// Función para obtener estados de habitación
const getEstadosHabitacion = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        // Obtener todos los estados de habitación
        const [rows] = await connection.execute(`
      SELECT ID_Estado_Habitacion, Descripcion 
      FROM estado_habitacion
    `);
        if (rows.length > 0) {
            res.status(200).json({ estadosHabitacion: rows });
        }
        else {
            res.status(404).json({ message: 'No se encontraron estados de habitación.' });
        }
    }
    catch (error) {
        console.error('Error al obtener los estados de habitación:', error);
        res.status(500).json({ message: 'Error al obtener los estados de habitación.' });
    }
    finally {
        if (connection)
            connection.release();
    }
};
exports.getEstadosHabitacion = getEstadosHabitacion;
// Función para actualizar la imagen de una habitación
const updateImage = async (req, res) => {
    let connection;
    try {
        if (!req.file) {
            res.status(400).json({ message: 'No se ha subido ninguna imagen.' });
            return;
        }
        const { ID_Habitacion, Descripcion } = req.body;
        const Imagen = req.file.buffer; // La nueva imagen se encuentra en req.file.buffer
        const Fecha_Creacion = new Date();
        connection = await pool.getConnection();
        // Actualizar la imagen de la habitación
        const [result] = await connection.execute(`
      UPDATE imagenes_habitacion 
      SET Imagen = ?, Descripcion = ?, Fecha_Creacion = ? 
      WHERE ID_Habitacion = ?
    `, [Imagen, Descripcion, Fecha_Creacion, ID_Habitacion]);
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Imagen actualizada correctamente.' });
        }
        else {
            res.status(404).json({ message: 'No se encontró la habitación.' });
        }
    }
    catch (error) {
        console.error('Error al actualizar la imagen:', error);
        res.status(500).json({ message: 'Error al actualizar la imagen.' });
    }
    finally {
        if (connection)
            connection.release();
    }
};
exports.updateImage = updateImage;
// Función para eliminar una habitación
const deleteHabitacion = async (req, res) => {
    let connection;
    try {
        const { ID_Habitacion } = req.params;
        connection = await pool.getConnection();
        // Verificar si la habitación tiene reservas asociadas
        const [reservationRows] = await connection.execute(`
      SELECT * FROM reserva_habitacion WHERE ID_Habitacion = ?
    `, [ID_Habitacion]);
        if (reservationRows.length > 0) {
            res.status(400).json({ message: 'La habitación tiene reservas asociadas, no se puede eliminar.' });
            return;
        }
        // Eliminar las imágenes asociadas a la habitación
        await connection.execute(`
      DELETE FROM imagenes_habitacion WHERE ID_Habitacion = ?
    `, [ID_Habitacion]);
        // Eliminar la habitación
        const [deleteResult] = await connection.execute(`
      DELETE FROM habitacion WHERE ID_Habitacion = ?
    `, [ID_Habitacion]);
        if (deleteResult.affectedRows > 0) {
            res.status(200).json({ message: 'Habitación eliminada correctamente.' });
        }
        else {
            res.status(404).json({ message: 'Habitación no encontrada.' });
        }
    }
    catch (error) {
        console.error('Error al eliminar la habitación:', error);
        res.status(500).json({ message: 'Error al eliminar la habitación.' });
    }
    finally {
        if (connection)
            connection.release();
    }
};
exports.deleteHabitacion = deleteHabitacion;
