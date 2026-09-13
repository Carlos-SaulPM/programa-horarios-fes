import type { Request, Response } from "express";
import db from "../services/horarios_db";
import { buscarEnMapa, formatearHora } from "../utils/horarioUtils";
import { aplicarPreferenciaUsuario } from "../utils/procesadorData";

// --- 1. OBTENER UN GRUPO ESPECÍFICO ---
export const obtenerGrupo = (req: Request, res: Response) => {
  const { grupo } = req.params;

  // 1. Buscamos en Internos
  let rawGrupo = db.horariosInternos.get(grupo);
  let esExterno = false;

  // 2. Si no está, buscamos en Externos
  if (!rawGrupo && db.horariosExternos) {
    rawGrupo = db.horariosExternos.get(grupo);
    esExterno = true; // 🔥 Marcamos que lo encontramos en la DB externa
  }

  if (!rawGrupo) {
    return res.status(404).json({ msj: "Grupo no encontrado" });
  }

  // 🔥 INYECTAMOS LA BANDERA ANTES DE ENVIAR
  const grupoProcesado = rawGrupo.map((clase) => ({
    ...clase,
    esExterno: esExterno,
    origen: esExterno ? "Externa" : undefined, // Opcional: para el badge
  }));

  return res.status(200).json(grupoProcesado);
};

// --- 2. OBTENER POR SEMESTRE ---
export const obtenerGruposDeUnSemestre = (req: Request, res: Response) => {
  const { semestre } = req.params;
  const { incluir_externas } = req.query;

  let resultados: any[] = [];

  // 🔥 CAMBIO AQUÍ: Agregamos el parámetro 'esExterno' a la función auxiliar
  const filtrarPorSemestre = (mapa: Map<string, any[]>, esExterno: boolean) => {
    mapa.forEach((clases, nombreGrupo) => {
      const strGrupo = nombreGrupo.toString();
      if (strGrupo.length > 1 && strGrupo[1] === semestre) {
        const dataConGrupo = clases.map((materia) => ({
          ...materia,
          grupo: nombreGrupo,
          esExterno: esExterno, // 🔥 Inyectamos true/false
          origen: esExterno ? "Externa" : undefined,
        }));
        resultados.push(...dataConGrupo);
      }
    });
  };

  // 1. Buscar en internos (False)
  filtrarPorSemestre(db.horariosInternos, false);

  // 2. Buscar en externos (True)
  if (incluir_externas === "true") {
    filtrarPorSemestre(db.horariosExternos, true);
  }

  const respuesta = aplicarPreferenciaUsuario(resultados, req.query);
  res.status(200).json(respuesta);
};

// --- 3. OBTENER POR PROFESOR ---
export const obtenerGruposDeUnProfesor = (req: Request, res: Response) => {
  const { profesor } = req.body;
  const { incluir_externas } = req.query;

  if (!profesor) return res.status(400).json({ message: "Nombre requerido" });

  const busqueda = profesor.trim().toUpperCase();
  let resultados: any[] = [];

  // 🔥 CAMBIO AQUÍ: Función generadora para pasar el flag
  const crearFiltro = (esExterno: boolean) => (clases: any[], grupo: string) =>
    clases
      .filter((d) => d.profesor.toUpperCase().includes(busqueda))
      .map((d) => ({
        ...d,
        grupo,
        esExterno: esExterno, // 🔥 Inyectamos flag
        origen: esExterno ? "Externa" : undefined,
      }));

  // 1. Internos
  resultados.push(...buscarEnMapa(db.horariosInternos, crearFiltro(false)));

  // 2. Externos
  if (incluir_externas === "true") {
    resultados.push(...buscarEnMapa(db.horariosExternos, crearFiltro(true)));
  }

  const respuesta = aplicarPreferenciaUsuario(resultados, req.query);
  res.status(200).json(respuesta);
};

// --- 4. OBTENER POR RANGO ---
export const obtenerGruposRangoDeHorario = (req: Request, res: Response) => {
  const { dia } = req.params;
  const { hora_inicio, hora_limite, incluir_externas } = req.query as any;

  if (!hora_inicio || !hora_limite) {
    return res.status(400).json({ message: "Se requieren horas" });
  }

  const inicioNorm = formatearHora(hora_inicio);
  const limiteNorm = formatearHora(hora_limite);
  const diaUpper = dia.toUpperCase();
  let resultados: any[] = [];

  // 🔥 CAMBIO AQUÍ: Función generadora para pasar el flag
  const crearFiltro =
    (esExterno: boolean) => (clases: any[], grupo: string) => {
      const matches: any[] = [];
      clases.forEach((clase: any) => {
        const hDia = clase.horario[diaUpper];
        if (hDia && hDia !== "") {
          const [inicioRaw, finRaw] = hDia.split("-");
          const inicioClase = formatearHora(inicioRaw);
          const finClase = formatearHora(finRaw);

          if (inicioClase >= inicioNorm && finClase <= limiteNorm) {
            matches.push({
              ...clase,
              grupo,
              esExterno: esExterno, // 🔥 Inyectamos flag
              origen: esExterno ? "Externa" : undefined,
            });
          }
        }
      });
      return matches;
    };

  // 1. Internos
  resultados.push(...buscarEnMapa(db.horariosInternos, crearFiltro(false)));

  // 2. Externos
  if (incluir_externas === "true") {
    resultados.push(...buscarEnMapa(db.horariosExternos, crearFiltro(true)));
  }

  const respuesta = aplicarPreferenciaUsuario(resultados, req.query);
  res.status(200).json(respuesta);
};

// --- 6. OBTENER POR SALÓN VIRTUAL ---
export const obtenerGruposVirtuales = (req: Request, res: Response) => {
  const { incluir_externas } = req.query;
  let resultados: any[] = [];

  const crearFiltro =
    (esExterno: boolean) => (clases: any[], grupo: string) =>
      clases
        .filter((d) => (d.salon ?? "").toString().toUpperCase() === "VIRTUAL")
        .map((d) => ({
          ...d,
          grupo,
          esExterno: esExterno,
          origen: esExterno ? "Externa" : undefined,
        }));

  resultados.push(...buscarEnMapa(db.horariosInternos, crearFiltro(false)));

  if (incluir_externas === "true") {
    resultados.push(...buscarEnMapa(db.horariosExternos, crearFiltro(true)));
  }

  const respuesta = aplicarPreferenciaUsuario(resultados, req.query);
  res.status(200).json(respuesta);
};

// En controllers/grupos_controller.ts

export const obtenerGruposPorMateria = (req: Request, res: Response) => {
  const { materia } = req.body;
  const { incluir_externas } = req.query;

  if (!materia)
    return res.status(400).json({ message: "Nombre de materia requerido" });

  const busqueda = materia.trim().toUpperCase();
  let resultados: any[] = [];

  // Función generadora de filtro
  const crearFiltro = (esExterno: boolean) => (clases: any[], grupo: string) =>
    clases
      .filter((d) => {
        // 🔥 MODIFICACIÓN: Buscamos en 'asignatura', 'materia' o 'nombre'
        // para asegurar que encontremos el campo correcto.
        const nombreReal = d.asignatura || d.materia || d.nombre || "";

        // Debug: Si esto sigue fallando, descomenta la siguiente línea para ver qué campos tiene tu objeto en la consola
        // console.log("Objeto clase:", d);

        return nombreReal.toString().toUpperCase().includes(busqueda);
      })
      .map((d) => ({
        ...d,
        grupo,
        esExterno: esExterno,
        origen: esExterno ? "Externa" : undefined,
      }));

  // 1. Internos
  resultados.push(...buscarEnMapa(db.horariosInternos, crearFiltro(false)));

  // 2. Externos
  if (incluir_externas === "true") {
    resultados.push(...buscarEnMapa(db.horariosExternos, crearFiltro(true)));
  }

  const respuesta = aplicarPreferenciaUsuario(resultados, req.query);
  res.status(200).json(respuesta);
};
