"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eliminarUsuario = exports.editarUsuario = exports.obtenerRoles = exports.crearUsuario = void 0;
const Database_1 = require("../../db/Database");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Crear un nuevo usuario
const crearUsuario = async (req, res) => {
    const { nombre_usuario, contraseña, id_rol } = req.body;
    try {
        // Encriptar la contraseña con bcryptjs antes de almacenarla
        const encryptedPassword = await bcryptjs_1.default.hash(contraseña, 10);
        const connection = await Database_1.Database.connect();
        // Insertar el nuevo usuario en la tabla usuarios
        const queryUsuario = 'INSERT INTO usuarios (nombre_usuario, contraseña) VALUES (?, ?)';
        const [result] = await connection.execute(queryUsuario, [nombre_usuario, encryptedPassword]);
        // Obtener el id_usuario generado por la base de datos
        const insertId = result.insertId;
        // Asignar un rol al nuevo usuario si id_rol está presente
        if (id_rol) {
            const queryRol = 'INSERT INTO usuario_roles (id_usuario, id_rol) VALUES (?, ?)';
            await connection.execute(queryRol, [insertId, id_rol]);
        }
        res.status(201).json({
            message: 'Usuario creado exitosamente',
            userId: insertId,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error al crear usuario', error: error.message });
        }
        else {
            res.status(500).json({ message: 'Error desconocido al crear usuario', error });
        }
    }
};
exports.crearUsuario = crearUsuario;
// Obtener roles disponibles
const obtenerRoles = async (req, res) => {
    try {
        const connection = await Database_1.Database.connect();
        const queryRoles = 'SELECT * FROM roles';
        const [roles] = await connection.execute(queryRoles);
        res.status(200).json(roles);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error al obtener roles', error: error.message });
        }
        else {
            res.status(500).json({ message: 'Error desconocido al obtener roles', error });
        }
    }
};
exports.obtenerRoles = obtenerRoles;
// Editar un usuario
const editarUsuario = async (req, res) => {
    const { nombre_usuario } = req.params;
    const { nueva_contraseña, id_rol } = req.body;
    try {
        const connection = await Database_1.Database.connect();
        // Primero, obtener el id_usuario correspondiente al nombre_usuario
        const [rows] = await connection.execute('SELECT id_usuario FROM usuarios WHERE nombre_usuario = ?', [nombre_usuario]);
        if (rows.length === 0) {
            res.status(404).json({ message: 'Usuario no encontrado' });
            return;
        }
        const id_usuario = rows[0].id_usuario;
        // Actualizar contraseña si se proporciona
        if (nueva_contraseña) {
            const encryptedPassword = await bcryptjs_1.default.hash(nueva_contraseña, 10);
            await connection.execute('UPDATE usuarios SET contraseña = ?, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id_usuario = ?', [encryptedPassword, id_usuario]);
        }
        // Actualizar rol si se proporciona
        if (id_rol) {
            // Verificar si ya existe un rol asignado para este usuario
            const [rolRows] = await connection.execute('SELECT * FROM usuario_roles WHERE id_usuario = ?', [id_usuario]);
            if (rolRows.length > 0) {
                // Actualizar el rol existente
                await connection.execute('UPDATE usuario_roles SET id_rol = ? WHERE id_usuario = ?', [id_rol, id_usuario]);
            }
            else {
                // Insertar nuevo rol
                await connection.execute('INSERT INTO usuario_roles (id_usuario, id_rol) VALUES (?, ?)', [id_usuario, id_rol]);
            }
        }
        res.status(200).json({ message: 'Usuario actualizado exitosamente' });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error al actualizar usuario', error: error.message });
        }
        else {
            res.status(500).json({ message: 'Error desconocido al actualizar usuario', error });
        }
    }
};
exports.editarUsuario = editarUsuario;
// Eliminar un usuario
const eliminarUsuario = async (req, res) => {
    const { nombre_usuario } = req.params;
    try {
        const connection = await Database_1.Database.connect();
        // Primero, obtener el id_usuario
        const [rows] = await connection.execute('SELECT id_usuario FROM usuarios WHERE nombre_usuario = ?', [nombre_usuario]);
        if (rows.length === 0) {
            res.status(404).json({ message: 'Usuario no encontrado' });
            return;
        }
        const id_usuario = rows[0].id_usuario;
        // Eliminar las relaciones de usuario_roles
        await connection.execute('DELETE FROM usuario_roles WHERE id_usuario = ?', [id_usuario]);
        // Eliminar el usuario
        const [result] = await connection.execute('DELETE FROM usuarios WHERE id_usuario = ?', [id_usuario]);
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Usuario eliminado exitosamente' });
        }
        else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error al eliminar usuario', error: error.message });
        }
        else {
            res.status(500).json({ message: 'Error desconocido al eliminar usuario', error });
        }
    }
};
exports.eliminarUsuario = eliminarUsuario;
