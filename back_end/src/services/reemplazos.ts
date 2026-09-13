import db from "./horarios_db";
import type { ClaseRaw } from "./horarios_storage";
import { traslapaConAlguna } from "../utils/horarioUtils";

const DIAS = ["LU", "MA", "MI", "JU", "VI", "SA"];

const diasOcupados = (clase: ClaseRaw): string[] =>
  DIAS.filter((d) => clase.horario?.[d] && clase.horario[d] !== "");

const esMismaOferta = (a: ClaseRaw, b: ClaseRaw): boolean =>
  a.grupo === b.grupo && a.clave === b.clave;

export const buscarReemplazos = (
  materiaActual: ClaseRaw,
  resto: ClaseRaw[],
  opciones: { incluirExternas?: boolean } = {},
): ClaseRaw[] => {
  const diasAfectados = diasOcupados(materiaActual);
  if (diasAfectados.length === 0) return [];

  const mapas = [db.horariosInternos];
  if (opciones.incluirExternas) mapas.push(db.horariosExternos);

  const resultados: ClaseRaw[] = [];

  for (const mapa of mapas) {
    mapa.forEach((clases, grupo) => {
      clases.forEach((clase: any) => {
        const candidato: ClaseRaw = { ...clase, grupo: clase.grupo ?? grupo };
        if (esMismaOferta(candidato, materiaActual)) return;

        const ocupaTodosLosDíasAfectados = diasAfectados.every((d) =>
          candidato.horario?.[d],
        );
        if (!ocupaTodosLosDíasAfectados) return;

        if (traslapaConAlguna(resto, candidato) !== null) return;

        resultados.push(candidato);
      });
    });
  }

  return resultados;
};