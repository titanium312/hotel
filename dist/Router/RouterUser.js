"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const usuarioController_1 = require("../controllers/loguin/usuarioController");
const AdmiUsu_1 = require("../controllers/7-Admi/AdmiUsu"); // Importa correctamente el controlador
const loginController_1 = require("../controllers/loguin/loginController");
const router = (0, express_1.Router)();
// Middleware para manejar errores asincrónicos
const Asincronia = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
// Ruta para crear un usuario    
// curl -X POST http://localhost:1234/User/usuarios -H "Content-Type: application/json" -d "{\"nombre_usuario\":\"user\",\"contraseña\":\"user\",\"correo_electronico\":\"user@example.com\",\"id_rol\":2}"
router.post('/usuarios', Asincronia(usuarioController_1.crearUsuario));
// Ruta para editar un usuario
router.put('/usuarios/:nombre_usuario', Asincronia(usuarioController_1.editarUsuario));
// Ruta para eliminar un usuario
router.delete('/usuarios/:nombre_usuario', Asincronia(usuarioController_1.eliminarUsuario));
// Ruta para obtener todos los roles
router.get('/roles', Asincronia(usuarioController_1.obtenerRoles));
// Ruta para obtener usuarios y roles
router.get('/user-roles', Asincronia(AdmiUsu_1.getUserRoles)); // Usa el controlador aquí
// Ruta para iniciar sesión
router.post('/login', Asincronia(loginController_1.iniciarSesion));
router.get("/", (rep, res) => {
    res.send("Estamos en Router User");
    console.log("Estamos en Router User");
});
exports.default = router;
