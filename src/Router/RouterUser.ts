import { Router, Request, Response, NextFunction } from 'express';
import { crearUsuario, editarUsuario, eliminarUsuario, obtenerRoles } from '../controllers/loguin/usuarioController'; 
import { getUserRoles } from '../controllers/7-Admi/AdmiUsu'; // Importa correctamente el controlador
import { iniciarSesion } from '../controllers/loguin/loginController'; 

const router: Router = Router();

// Middleware para manejar errores asincrónicos
const Asincronia = (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Ruta para crear un usuario    
// curl -X POST http://localhost:1234/User/usuarios -H "Content-Type: application/json" -d "{\"nombre_usuario\":\"user\",\"contraseña\":\"user\",\"correo_electronico\":\"user@example.com\",\"id_rol\":2}"


router.post('/usuarios', Asincronia(crearUsuario));

// Ruta para editar un usuario
router.put('/usuarios/:nombre_usuario', Asincronia(editarUsuario));

// Ruta para eliminar un usuario
router.delete('/usuarios/:nombre_usuario', Asincronia(eliminarUsuario));

// Ruta para obtener todos los roles
router.get('/roles', Asincronia(obtenerRoles)); 

// Ruta para obtener usuarios y roles
router.get('/user-roles', Asincronia(getUserRoles)); // Usa el controlador aquí

// Ruta para iniciar sesión
router.post('/login', Asincronia(iniciarSesion)); 

router.get("/",(rep , res) =>{
    res.send("Estamos en Router User");
    console.log("Estamos en Router User");
});


export default router;
