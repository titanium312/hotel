"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerService = void 0;
const Database_1 = require("../../../db/Database");
const pool = Database_1.Database.connect();
// Función para validar los datos del servicio
const validateServiceData = (data) => {
    if (!data.ID_Servicio || !data.nombre || !data.descripcion || !data.costo || !data.tipo) {
        return 'Faltan datos requeridos (ID_Servicio, nombre, descripcion, costo, tipo)';
    }
    if (isNaN(data.costo) || data.costo <= 0) {
        return 'El costo debe ser un número mayor que 0';
    }
    return null;
};
const registerService = async (req, res) => {
    const { ID_Servicio, nombre, descripcion, costo, tipo } = req.body;
    // Validar los datos del servicio
    const validationError = validateServiceData(req.body);
    if (validationError) {
        res.status(400).json({ error: validationError });
        return;
    }
    let connection;
    try {
        // Iniciar conexión a la base de datos
        connection = await pool.getConnection();
        await connection.beginTransaction(); // Iniciar transacción
        // Verificar si el tipo de servicio existe (usamos 'ID_producto_tipo' en lugar de 'ID_Servicio_Tipo')
        const [serviceType] = await connection.execute(`
      SELECT ID_producto_tipo FROM servicio_tipo WHERE ID_producto_tipo = ?`, [tipo] // 'tipo' es el ID del tipo de servicio que pasas en el body
        );
        if (serviceType.length === 0) {
            res.status(400).json({ error: `El tipo de servicio con ID ${tipo} no existe` });
            await connection.rollback();
            connection.release();
            return;
        }
        // Verificar si ya existe un servicio con el mismo ID_Servicio
        const [existingService] = await connection.execute(`
      SELECT ID_Servicio FROM servicio WHERE ID_Servicio = ?`, [ID_Servicio]);
        if (existingService.length > 0) {
            res.status(400).json({ error: `El servicio con ID_Servicio ${ID_Servicio} ya existe` });
            await connection.rollback();
            connection.release();
            return;
        }
        // Insertar el nuevo servicio en la tabla 'servicio'
        await connection.execute(`
      INSERT INTO servicio (ID_Servicio, Nombre, Descripcion, Precio) 
      VALUES (?, ?, ?, ?)`, [ID_Servicio, nombre, descripcion, costo]);
        // Relacionar el servicio con el tipo de servicio en la tabla 'servicio_tipo_relacion'
        await connection.execute(`
      INSERT INTO servicio_tipo_relacion (ID_Servicio, ID_Servicio_tipo) 
      VALUES (?, ?)`, [ID_Servicio, tipo] // Usamos 'ID_Servicio_tipo' en lugar de 'ID_producto_tipo'
        );
        // Confirmar la transacción
        await connection.commit();
        connection.release();
        // Enviar respuesta positiva
        res.status(201).json({ message: 'Servicio registrado correctamente', ID_Servicio });
    }
    catch (error) {
        if (connection) {
            await connection.rollback(); // Revertir en caso de error
            connection.release();
        }
        // Manejo de errores
        if (error instanceof Error) {
            console.error('Error al registrar el servicio:', error.message);
            res.status(500).json({ error: 'Error al registrar el servicio', details: error.message });
        }
        else {
            console.error('Error desconocido:', error);
            res.status(500).json({ error: 'Error desconocido' });
        }
    }
};
exports.registerService = registerService;
/*curl -X POST http://localhost:1234/Hotel/RegistraServicio \
-H "Content-Type: application/json" \
-d '{
  "ID_Servicio": 1,
  "nombre": "Servicio de Lavandería",
  "descripcion": "Servicio de lavandería para ropa de cama",
  "costo": 20.50,
  "tipo": 2
}'
*/ 
