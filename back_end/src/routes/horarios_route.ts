import Route from "express";
import {
  actualizar,
  autogenerar,
  crear,
  eliminar,
  listar,
  materiasDisponibles,
  obtener,
  reemplazos,
} from "../controllers/horarios_controller";

const app = Route();

app.get("/", listar);
app.post("/", crear);
app.get("/materias-disponibles", materiasDisponibles);
app.post("/generar", autogenerar);
app.get("/:id", obtener);
app.put("/:id", actualizar);
app.delete("/:id", eliminar);
app.post("/:id/reemplazos/:index", reemplazos);

export default app;