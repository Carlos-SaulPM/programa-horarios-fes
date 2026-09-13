import type { Request, Response } from "express";
import {
  crearHorario,
  eliminarHorario,
  guardarHorario,
  listarHorarios,
  obtenerHorario,
} from "../services/horarios_storage";
import { buscarReemplazos } from "../services/reemplazos";
import {
  generarHorario,
  listarMateriasDisponibles,
  type PreferenciasGenerador,
} from "../services/generador_horario";

const idDeParametro = (req: Request): string | null => {
  const id = req.params.id;
  return typeof id === "string" && id.length > 0 ? id : null;
};

export const listar = async (_req: Request, res: Response) => {
  res.status(200).json(await listarHorarios());
};

export const crear = async (req: Request, res: Response) => {
  const { nombre } = req.body ?? {};
  const horario = await crearHorario(nombre);
  res.status(201).json(horario);
};

export const obtener = async (req: Request, res: Response) => {
  const id = idDeParametro(req);
  if (!id) return res.status(400).json({ msj: "ID requerido" });

  const horario = await obtenerHorario(id);
  if (!horario) {
    return res.status(404).json({ msj: "Horario no encontrado" });
  }
  res.status(200).json(horario);
};

export const actualizar = async (req: Request, res: Response) => {
  const id = idDeParametro(req);
  if (!id) return res.status(400).json({ msj: "ID requerido" });

  const { nombre, materias } = req.body ?? {};
  try {
    const horario = await guardarHorario(id, {
      nombre,
      materias: Array.isArray(materias) ? materias : undefined,
    });
    res.status(200).json(horario);
  } catch {
    res.status(404).json({ msj: "Horario no encontrado" });
  }
};

export const eliminar = async (req: Request, res: Response) => {
  const id = idDeParametro(req);
  if (!id) return res.status(400).json({ msj: "ID requerido" });

  const eliminado = await eliminarHorario(id);
  if (!eliminado) {
    return res.status(404).json({ msj: "Horario no encontrado" });
  }
  res.status(204).end();
};

export const reemplazos = async (req: Request, res: Response) => {
  const id = idDeParametro(req);
  if (!id) return res.status(400).json({ msj: "ID requerido" });

  const horario = await obtenerHorario(id);
  if (!horario) {
    return res.status(404).json({ msj: "Horario no encontrado" });
  }

  const rawIndex = req.params.index;
  const index = Number(rawIndex);
  if (!Number.isInteger(index)) {
    return res.status(400).json({ msj: "Índice de materia inválido" });
  }

  const materia = horario.materias[index];
  if (!materia) {
    return res.status(400).json({ msj: "Índice de materia inválido" });
  }

  const incluirExternas =
    (req.body ?? {}).incluir_externas === true ||
    (req.body ?? {}).incluir_externas === "true";

  const resto = horario.materias.filter((_, i) => i !== index);
  const sustitutos = buscarReemplazos(materia, resto, { incluirExternas });

  res.status(200).json(sustitutos);
};

export const materiasDisponibles = (_req: Request, res: Response) => {
  res.status(200).json(listarMateriasDisponibles());
};

export const autogenerar = async (req: Request, res: Response) => {
  const body = (req.body ?? {}) as Partial<PreferenciasGenerador>;

  if (!Array.isArray(body.materias) || body.materias.length === 0) {
    return res
      .status(400)
      .json({ msj: "Selecciona al menos una materia para generar" });
  }
  if (body.materias.length > 12) {
    return res.status(400).json({ msj: "Máximo 12 materias por horario" });
  }

  const prefs: PreferenciasGenerador = {
    materias: body.materias.filter((m) => typeof m === "string"),
    profesoresPreferidos: Array.isArray(body.profesoresPreferidos)
      ? body.profesoresPreferidos.filter((p) => typeof p === "string")
      : [],
    diasPreferentes: Array.isArray(body.diasPreferentes)
      ? body.diasPreferentes.filter((d) => typeof d === "string")
      : [],
    restricciones: Array.isArray(body.restricciones)
      ? body.restricciones.filter(
          (r) => r && typeof r.dia === "string" && typeof r.horaMax === "string",
        )
      : [],
    turnoPreferido:
      body.turnoPreferido === "matutino" || body.turnoPreferido === "vespertino"
        ? body.turnoPreferido
        : undefined,
    permitirTraslapes: body.permitirTraslapes === true,
    maxTraslapeMin:
      typeof body.maxTraslapeMin === "number" ? body.maxTraslapeMin : 20,
  };

  res.status(200).json(generarHorario(prefs));
};