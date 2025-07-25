"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuriosLista = void 0;
const Database_1 = require("../../db/Database");
// Esperamos la conexión una vez al iniciar el módulo
const poolPromise = Database_1.Database.connect();
const UsuriosLista = async (req, res) => {
    try {
        // Esperamos el pool (si Database.connect es async)
        const pool = await poolPromise;
        // Ejecutamos la consulta
        const [usuarios] = await pool.execute(`
      SELECT 
        u.id, 
        u.nombre_usuario, 
        u.contraseña, 
        u.telefono, 
        u.fecha_creacion, 
        u.fecha_sesion, 
        r.nombre_rol AS rol
      FROM usuarios u
      LEFT JOIN usuario_roles ur ON u.id = ur.id_usuario
      LEFT JOIN roles r ON ur.id_rol = r.id
    `);
        return res.json({ usuarios });
    }
    catch (error) {
        console.error('Error al obtener la información:', error);
        return res.status(500).json({ message: 'Error al obtener la información' });
    }
};
exports.UsuriosLista = UsuriosLista;
