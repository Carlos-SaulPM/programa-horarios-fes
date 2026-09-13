import Route from "express";
import {
  obtenerGrupo,
  obtenerGruposDeUnProfesor,
  obtenerGruposDeUnSemestre,
  obtenerGruposPorMateria,
  obtenerGruposRangoDeHorario,
  obtenerGruposVirtuales,
} from "../controllers/grupos_controller";

const app = Route();

app.get("/virtuales", obtenerGruposVirtuales);
app.get("/:grupo", obtenerGrupo);
app.get("/semestre/:semestre", obtenerGruposDeUnSemestre);
app.post("/profesor", obtenerGruposDeUnProfesor);
app.post("/materia", obtenerGruposPorMateria);
app.get("/rango/:dia", obtenerGruposRangoDeHorario);

export default app;
