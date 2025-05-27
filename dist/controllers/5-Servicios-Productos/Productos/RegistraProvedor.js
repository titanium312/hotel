"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProvedor = void 0;
const Database_1 = require("../../../db/Database");
const pool = Database_1.Database.connect();
// Función para validar los datos del proveedor
const validateProviderData = (data) => {
    if (!data.ID_Provedor || !data.Nombre || !data.Telefono || !data.Correo || !data.Direccion) {
        return 'Faltan datos requeridos (ID_Provedor, Nombre, Telefono, Correo, Direccion)';
    }
    return null;
};
const createProvedor = async (req, res) => {
    console.log('Cuerpo de la solicitud:', req.body);
    const { ID_Provedor, Nombre, Telefono, Correo, Direccion } = req.body;
    // Validar los datos del proveedor
    const validationError = validateProviderData(req.body);
    if (validationError) {
        res.status(400).json({ error: validationError });
        return;
    }
    try {
        const connection = await pool.getConnection();
        // Verificar si el proveedor ya existe (por correo)
        const [existingProvider] = await connection.execute('SELECT ID_Provedor FROM Provedor WHERE Correo = ?', [Correo]);
        if (existingProvider.length > 0) {
            res.status(400).json({ error: `El proveedor con correo ${Correo} ya existe` });
            connection.release();
            return;
        }
        // Insertar el nuevo proveedor
        await connection.execute('INSERT INTO Provedor (ID_Provedor, Nombre, Telefono, Correo, Direccion) VALUES (?, ?, ?, ?, ?)', [ID_Provedor, Nombre, Telefono, Correo, Direccion]);
        connection.release();
        res.status(201).json({ message: 'Proveedor creado exitosamente' });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('Error al crear el proveedor:', error.message);
            res.status(500).json({ error: 'Error al crear el proveedor', details: error.message });
        }
        else {
            console.error('Error desconocido:', error);
            res.status(500).json({ error: 'Error desconocido' });
        }
    }
};
exports.createProvedor = createProvedor;
//curl -X POST http://localhost:1234/Hotel/provedores -H "Content-Type: application/json" -d "{\"ID_Provedor\": 123, \"Nombre\": \"Proveedor Test\", \"Telefono\": \"123456789\", \"Correo\": \"proveedor@correo.com\", \"Direccion\": \"Calle Falsa 123\"}"
