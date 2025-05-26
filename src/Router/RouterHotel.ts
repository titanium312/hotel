import { Router } from "express"; 
import routerRt from "./Rutas/Rt-Restaurante";
const RouterHotel= Router();

// Restaurante Routes
RouterHotel.use('/Restaurante',routerRt);


RouterHotel.get("/", (req, res) => {
    res.send("Estamos en Router mastes");
    console.log("Estamos en Router mastes");
}); 

export default RouterHotel;

// RouterHotel.ts

