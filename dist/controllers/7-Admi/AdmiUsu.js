"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserRoles = void 0;
const Database_1 = require("../../db/Database");
// Crea el pool de conexiones de la base de datos
const pool = Database_1.Database.connect();
// Controlador para obtener usuarios, roles y relaciones
const getUserRoles = async (req, res) => {
    try {
        // 1. Obtener todos los usuarios
        const [usuarios] = await pool.query('SELECT nombre_usuario, fecha_creacion, fecha_actualizacion FROM usuarios');
        // 2. Obtener todos los roles
        const [roles] = await pool.query('SELECT id, nombre_rol, descripcion FROM roles');
        // 3. Obtener las relaciones entre usuarios y roles
        const [usuarioRoles] = await pool.query('SELECT ur.id_usuario, ur.id_rol, r.nombre_rol FROM usuario_roles ur JOIN roles r ON ur.id_rol = r.id');
        // Responder con la información combinada
        return res.json({
            usuarios,
            roles,
            usuarioRoles
        });
    }
    catch (error) {
        console.error('Error al obtener la información:', error);
        return res.status(500).json({ message: 'Error al obtener la información' });
    }
};
exports.getUserRoles = getUserRoles;
