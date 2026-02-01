import { Request, Response } from "express";
import horarios from "../services/horarios_db";
import { formatearHora } from "../utils/horarioUtils";
import { aplicarPreferenciaUsuario } from "../utils/procesadorData";

export const obtenerGrupo = (req: Request, res: Response) => {
  const { grupo } = req.params;

  const grupoEncontrado = horarios.get(grupo);

  // Ojo aquí: quitamos el ";" después del if y agregamos el return
  if (!grupoEncontrado) {
    return res.status(404).json({ msj: "Grupo no encontrado" });
  }

  return res.status(200).json(grupoEncontrado);
};

export const obtenerGruposDeUnSemestre = (req: Request, res: Response) => {
  const { semestre } = req.params;
  let resultados: any[] = [];

  horarios.forEach((value, key) => {
    // Usamos el índice 1 para obtener el segundo dígito (semestre)
    if (key.toString()[1] === semestre) {
      // Inyectamos el nombre del grupo para que el front sepa cuál es
      const dataConGrupo = value.map((materia) => ({ ...materia, grupo: key }));
      resultados.push(...dataConGrupo);
    }
  });

  // Ahora este endpoint también puede ordenar y filtrar por rangos extras
  const respuesta = aplicarPreferenciaUsuario(resultados, req.query);
  res.status(200).json(respuesta);
};

export const obtenerGruposDeUnProfesor = (req: Request, res: Response) => {
  const { profesor } = req.body;
  if (!profesor) return res.status(400).json({ message: "Nombre requerido" });

  let resultados: any[] = [];
  const busqueda = profesor.trim().toUpperCase();

  horarios.forEach((dataGrupo, nombreGrupo) => {
    const coincidencias = dataGrupo
      .filter((d) => d.profesor.toUpperCase().includes(busqueda))
      .map((d) => ({ ...d, grupo: nombreGrupo }));
    resultados.push(...coincidencias);
  });

  const respuesta = aplicarPreferenciaUsuario(resultados, req.query);
  res.status(200).json(respuesta);
};

export const obtenerGruposRangoDeHorario = (req: Request, res: Response) => {
  const { dia } = req.params;
  const { hora_inicio, hora_limite } = req.query as any;

  if (!hora_inicio || !hora_limite) {
    return res
      .status(400)
      .json({ message: "Se requieren hora_inicio y hora_limite" });
  }

  const inicioNorm = formatearHora(hora_inicio);
  const limiteNorm = formatearHora(hora_limite);
  const diaUpper = dia.toUpperCase();
  let resultados: any[] = [];

  horarios.forEach((clases, nombreGrupo) => {
    clases.forEach((clase: any) => {
      const hDia = clase.horario[diaUpper];

      if (hDia && hDia !== "") {
        const [inicioRaw, finRaw] = hDia.split("-");

        const inicioClase = formatearHora(inicioRaw);
        const finClase = formatearHora(finRaw);

        if (inicioClase >= inicioNorm && finClase <= limiteNorm) {
          resultados.push({ ...clase, grupo: nombreGrupo });
        }
      }
    });
  });

  const respuesta = aplicarPreferenciaUsuario(resultados, req.query, diaUpper);
  res.status(200).json(respuesta);
};
