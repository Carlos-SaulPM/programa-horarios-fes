import Route from "express"
import { obtenerGrupo, obtenerGruposDeUnProfesor, obtenerGruposDeUnSemestre, obtenerGruposRangoDeHorario } from "../controllers/grupos_controller";

const app = Route();

app.get("/:grupo", obtenerGrupo)
app.get("/semestre/:semestre", obtenerGruposDeUnSemestre)
app.post("/profesor", obtenerGruposDeUnProfesor)
app.get("/rango/:dia", obtenerGruposRangoDeHorario)

export default app;