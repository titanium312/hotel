import { Router } from "express"; 
import routerRt from "./Rutas/Rt-Restaurante";
import RtInicio from "./Rutas/Rt-inicio";
import RtRecepcion from "./Rutas/Rt-Recepcion";
import RTProductos from "./Rutas/RT-Productos";
const RouterHotel= Router();

// Restaurante Routes
RouterHotel.use('/Restaurante',routerRt);

RouterHotel.use("/Inicio",RtInicio);

RouterHotel.use("/Recepcion",RtRecepcion);

RouterHotel.use("/Productos",RTProductos);

RouterHotel.get("/", (req, res) => {
    res.send("Estamos en Router master");
    console.log("Estamos en Router master");
}); 

export default RouterHotel;

// RouterHotel.ts

