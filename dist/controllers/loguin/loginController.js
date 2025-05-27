"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.iniciarSesion = void 0;
const Database_1 = require("../../db/Database"); // Conexión a la base de datos
const bcryptjs_1 = __importDefault(require("bcryptjs")); // Importamos bcrypt para comparar contraseñas
// Iniciar sesión de usuario
const iniciarSesion = async (req, res) => {
    const { nombre_usuario, contraseña } = req.body;
    try {
        const connection = await Database_1.Database.getConnection();
        // Buscar al usuario por su nombre
        const query = 'SELECT * FROM usuarios WHERE nombre_usuario = ?';
        const [rows] = await connection.execute(query, [nombre_usuario]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        const usuario = rows[0];
        // Validar contraseña
        const contrasenaValida = await bcryptjs_1.default.compare(contraseña, usuario.contraseña);
        if (!contrasenaValida) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }
        // 🕒 Actualizar la fecha de sesión a la hora actual
        const updateSesionQuery = `
      UPDATE usuarios 
      SET fecha_sesion = CURRENT_TIMESTAMP 
      WHERE nombre_usuario = ?;
    `;
        await connection.execute(updateSesionQuery, [nombre_usuario]);
        // 🔍 Consultar el rol del usuario
        const rolQuery = `
      SELECT r.nombre_rol
      FROM roles r
      JOIN usuario_roles ur ON ur.id_rol = r.id
      WHERE ur.id_usuario = ?;
    `;
        const [rolRows] = await connection.execute(rolQuery, [nombre_usuario]);
        if (rolRows.length === 0) {
            return res.status(404).json({ message: 'Rol no encontrado para el usuario' });
        }
        const rol = rolRows[0].nombre_rol;
        // ✅ Enviar respuesta exitosa
        return res.status(200).json({
            message: 'Inicio de sesión exitoso',
            usuario: {
                id: usuario.id, // 👈 Agregamos el ID del usuario
                nombre_usuario: usuario.nombre_usuario,
                rol: rol,
                fecha_sesion: new Date().toISOString()
            }
        });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
        }
        else {
            return res.status(500).json({ message: 'Error desconocido al iniciar sesión', error });
        }
    }
};
exports.iniciarSesion = iniciarSesion;
