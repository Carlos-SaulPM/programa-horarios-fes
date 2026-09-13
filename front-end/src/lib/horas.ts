import type { Clase, Horario } from "@/types";

export const DIAS = ["LU", "MA", "MI", "JU", "VI", "SA"] as const;
export type Dia = (typeof DIAS)[number];

const parseHora = (hora: string): number => {
  if (!hora) return -1;
  const [h, m] = hora.split(":").map((n) => parseInt(n));
  return h * 60 + m;
};

export const minutosATexto = (min: number): string => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export const getHorasDeDia = (horario: Horario, dia: Dia): string => {
  return horario[dia] || "";
};

export const getRangoDeDia = (
  horario: Horario,
  dia: Dia,
): { inicio: number; fin: number } | null => {
  const rango = horario[dia];
  if (!rango || rango === "") return null;
  const [ini, fin] = rango.split("-");
  return { inicio: parseHora(ini), fin: parseHora(fin) };
};

export const traslapan = (rangoA: { inicio: number; fin: number }, rangoB: { inicio: number; fin: number }): boolean => {
  return (
    rangoA.inicio < rangoB.fin &&
    rangoB.inicio < rangoA.fin &&
    rangoA.fin > rangoA.inicio &&
    rangoB.fin > rangoB.inicio
  );
};

export const hayConflicto = (
  materias: Clase[],
  nueva: Clase,
  excluirIndex?: number,
): { dia: Dia; materia: Clase } | null => {
  for (let i = 0; i < materias.length; i++) {
    if (i === excluirIndex) continue;
    const existente = materias[i];
    for (const dia of DIAS) {
      const rangoA = getRangoDeDia(existente.horario, dia);
      const rangoB = getRangoDeDia(nueva.horario, dia);
      if (rangoA && rangoB && traslapan(rangoA, rangoB)) {
        return { dia, materia: existente };
      }
    }
  }
  return null;
};

export const mismaClase = (a: Clase, b: Clase): boolean =>
  a.grupo === b.grupo && a.clave === b.clave;

export const claveClase = (clase: Clase): string =>
  `${clase.grupo}-${clase.clave}`;

export interface ConflictoInfo {
  materia: string;
  grupo: string;
  dias: Dia[];
  minutos: number;
}

export const encontrarConflictosEnHorario = (
  materias: Clase[],
): Map<string, ConflictoInfo[]> => {
  const conflictos = new Map<string, ConflictoInfo[]>();

  for (let i = 0; i < materias.length; i++) {
    for (let j = i + 1; j < materias.length; j++) {
      const a = materias[i];
      const b = materias[j];
      const dias: Dia[] = [];
      let minutos = 0;

      for (const dia of DIAS) {
        const rangoA = getRangoDeDia(a.horario, dia);
        const rangoB = getRangoDeDia(b.horario, dia);
        if (!rangoA || !rangoB) continue;
        if (!traslapan(rangoA, rangoB)) continue;

        dias.push(dia);
        const solape =
          Math.min(rangoA.fin, rangoB.fin) - Math.max(rangoA.inicio, rangoB.inicio);
        if (solape > 0) minutos += solape;
      }

      if (dias.length === 0) continue;

      const info: ConflictoInfo = {
        materia: b.materia,
        grupo: b.grupo,
        dias,
        minutos,
      };
      conflictos.set(claveClase(a), [
        ...(conflictos.get(claveClase(a)) ?? []),
        info,
      ]);

      conflictos.set(claveClase(b), [
        ...(conflictos.get(claveClase(b)) ?? []),
        { materia: a.materia, grupo: a.grupo, dias, minutos },
      ]);
    }
  }

  return conflictos;
};

export const minutosSolapados = (
  a: Clase,
  b: Clase,
  dias: Dia[],
): number => {
  let total = 0;
  for (const dia of dias) {
    const rangoA = getRangoDeDia(a.horario, dia);
    const rangoB = getRangoDeDia(b.horario, dia);
    if (!rangoA || !rangoB) continue;
    const solape =
      Math.min(rangoA.fin, rangoB.fin) - Math.max(rangoA.inicio, rangoB.inicio);
    if (solape > 0) total += solape;
  }
  return total;
};

export const ordenarPorHora = (materias: Clase[], dia?: Dia): Clase[] =>
  [...materias].sort((a, b) => {
    const horaA = obtenerHoraMinima(a, dia);
    const horaB = obtenerHoraMinima(b, dia);
    return horaA.localeCompare(horaB);
  });

export const obtenerHoraMinima = (clase: Clase, dia?: Dia): string => {
  if (dia) {
    const rango = getRangoDeDia(clase.horario, dia);
    return rango ? minutosATexto(rango.inicio) : "23:59";
  }
  let minima = "23:59";
  for (const d of DIAS) {
    const rango = getRangoDeDia(clase.horario, d);
    if (rango) {
      const texto = minutosATexto(rango.inicio);
      if (texto < minima) minima = texto;
    }
  }
  return minima;
};