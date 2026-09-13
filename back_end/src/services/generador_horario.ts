import dataInterna from "./horarios.json";
import dataExterna from "./materias_externas_coincidentes.json";
import type { ClaseRaw } from "./horarios_storage";

export interface RestriccionDia {
  dia: string;
  horaMax: string;
}

export interface PreferenciasGenerador {
  materias: string[];
  profesoresPreferidos?: string[];
  diasPreferentes?: string[];
  restricciones?: RestriccionDia[];
  turnoPreferido?: "matutino" | "vespertino";
  permitirTraslapes?: boolean;
  maxTraslapeMin?: number;
}

export interface TraslapeGenerado {
  grupo: string;
  clave: string;
  materia: string;
  conGrupo: string;
  conClave: string;
  conMateria: string;
  dias: string[];
  minutos: number;
}

export interface ResultadoGenerador {
  horario: ClaseRaw[];
  traslapes: TraslapeGenerado[];
  materiasNoAsignadas: { materia: string }[];
  materiasAsignadas: number;
  materiasSolicitadas: number;
  puntaje: number;
}

const DIAS = ["LU", "MA", "MI", "JU", "VI", "SA"];

const mapaExterno = new Map<string, ClaseRaw[]>();
Object.entries(dataExterna).forEach(([carrera, gruposObj]) => {
  Object.entries(gruposObj as Record<string, ClaseRaw[]>).forEach(
    ([grupo, clases]) => {
      const conOrigen = clases.map((c) => ({
        ...c,
        origen: carrera,
        esExterno: true,
      }));
      const actual = mapaExterno.get(grupo) ?? [];
      mapaExterno.set(grupo, [...actual, ...conOrigen]);
    },
  );
});

const todasLasClases = (): ClaseRaw[] => {
  const internas = Object.values(dataInterna as Record<string, ClaseRaw[]>).flat();
  const externas = [...mapaExterno.values()].flat();
  return [...internas, ...externas];
};

const horaAMinutos = (hora: string): number => {
  const [h, m] = hora.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

const rangoDeDia = (clase: ClaseRaw, dia: string): { inicio: number; fin: number } | null => {
  const rango = clase.horario?.[dia];
  if (!rango) return null;
  const [inicio, fin] = rango.split("-");
  if (!inicio || !fin) return null;
  return { inicio: horaAMinutos(inicio), fin: horaAMinutos(fin) };
};

const minutosTraslape = (a: ClaseRaw, b: ClaseRaw): { dias: string[]; minutos: number } => {
  const dias: string[] = [];
  let minutos = 0;
  for (const dia of DIAS) {
    const rangoA = rangoDeDia(a, dia);
    const rangoB = rangoDeDia(b, dia);
    if (!rangoA || !rangoB) continue;
    const solape = Math.min(rangoA.fin, rangoB.fin) - Math.max(rangoA.inicio, rangoB.inicio);
    if (solape > 0) {
      dias.push(dia);
      minutos += solape;
    }
  }
  return { dias, minutos };
};

const esDeTurno = (clase: ClaseRaw, turno: "matutino" | "vespertino"): boolean => {
  const tercero = clase.grupo?.toString()[2];
  const esTarde = parseInt(tercero ?? "0", 10) >= 5;
  return turno === "vespertino" ? esTarde : !esTarde;
};

const violaRestriccion = (clase: ClaseRaw, restricciones: RestriccionDia[]): boolean => {
  for (const { dia, horaMax } of restricciones) {
    const rango = rangoDeDia(clase, dia);
    if (rango && rango.fin > horaAMinutos(horaMax)) return true;
  }
  return false;
};

export const listarMateriasDisponibles = (): { materia: string; grupos: number }[] => {
  const porNombre = new Map<string, { materia: string; grupos: Set<string> }>();
  for (const clase of todasLasClases()) {
    const nombre = (clase.materia ?? "").trim().toUpperCase();
    if (!nombre) continue;
    const existente = porNombre.get(nombre);
    if (existente) {
      existente.grupos.add(clase.grupo);
    } else {
      porNombre.set(nombre, { materia: clase.materia, grupos: new Set([clase.grupo]) });
    }
  }
  return [...porNombre.values()]
    .map(({ materia, grupos }) => ({ materia, grupos: grupos.size }))
    .sort((a, b) => a.materia.localeCompare(b.materia, "es"));
};

export const generarHorario = (prefs: PreferenciasGenerador): ResultadoGenerador => {
  const nombresSolicitados = [...new Set(prefs.materias.map((m) => m.trim().toUpperCase()).filter(Boolean))];
  const maxTraslape = Math.max(0, prefs.maxTraslapeMin ?? 20);
  const permiteTraslapes = prefs.permitirTraslapes === true;
  const restricciones = prefs.restricciones ?? [];
  const diasPreferentes = new Set(prefs.diasPreferentes ?? []);
  const profesoresPreferidos = (prefs.profesoresPreferidos ?? []).map((p) =>
    p.trim().toLowerCase(),
  );

  const nombreCanonico = new Map<string, string>();
  const gruposPorMateria = new Map<string, ClaseRaw[]>();

  for (const clase of todasLasClases()) {
    const nombre = (clase.materia ?? "").trim().toUpperCase();
    if (!nombresSolicitados.includes(nombre)) continue;
    nombreCanonico.set(nombre, clase.materia);
    const lista = gruposPorMateria.get(nombre) ?? [];
    lista.push(clase);
    gruposPorMateria.set(nombre, lista);
  }

  const materiasOrdenadas = [...nombresSolicitados].sort(
    (a, b) => (gruposPorMateria.get(a)?.length ?? 0) - (gruposPorMateria.get(b)?.length ?? 0),
  );

  const turnoPreferido = prefs.turnoPreferido;
  let mejor: {
    asignadas: ClaseRaw[];
    restantes: string[];
    puntaje: number;
  } | null = null;

  const maxPuntajePorMateria = (materia: string): number => {
    let max = 0;
    for (const clase of gruposPorMateria.get(materia) ?? []) {
      let s = 0;
      if (profesoresPreferidos.includes(clase.profesor?.toLowerCase() ?? "")) s += 50;
      if (turnoPreferido && esDeTurno(clase, turnoPreferido)) s += 20;
      s += 10;
      max = Math.max(max, s);
    }
    return max;
  };

  const puntajeClase = (clase: ClaseRaw, parcial: ClaseRaw[]): number => {
    let puntos = 0;
    const profesorIdx = profesoresPreferidos.indexOf(clase.profesor?.toLowerCase() ?? "");
    if (profesorIdx >= 0) puntos += 50 - profesorIdx * 5;
    if (turnoPreferido && esDeTurno(clase, turnoPreferido)) puntos += 20;
    for (const dia of DIAS) {
      if (!diasPreferentes.has(dia)) continue;
      const rango = rangoDeDia(clase, dia);
      if (!rango) continue;
      const yaCubierto = parcial.some((p) => rangoDeDia(p, dia) !== null);
      if (!yaCubierto) puntos += 10;
    }
    return puntos;
  };

  const asignar = (indice: number, parcial: ClaseRaw[], restantes: string[], puntaje: number): void => {
    if (indice >= materiasOrdenadas.length) {
      if (
        !mejor ||
        parcial.length > mejor.asignadas.length ||
        (parcial.length === mejor.asignadas.length && puntaje > mejor.puntaje)
      ) {
        mejor = { asignadas: [...parcial], restantes: [...restantes], puntaje };
      }
      return;
    }

    const materia = materiasOrdenadas[indice];
    if (!materia) return;
    const candidatos = (gruposPorMateria.get(materia) ?? [])
      .filter((c) => {
        if (violaRestriccion(c, restricciones)) return false;
        for (const p of parcial) {
          const { minutos } = minutosTraslape(c, p);
          if (minutos > 0 && !permiteTraslapes) return false;
          if (minutos > maxTraslape) return false;
        }
        return true;
      })
      .sort((a, b) => puntajeClase(b, parcial) - puntajeClase(a, parcial));

    const restanteMax = materiasOrdenadas
      .slice(indice + 1)
      .reduce((acc, k) => acc + maxPuntajePorMateria(k), 0);

    for (const clase of candidatos) {
      const puntos = puntajeClase(clase, parcial);
      if (mejor && puntaje + puntos + restanteMax <= mejor.puntaje && parcial.length + 1 <= mejor.asignadas.length) {
        continue;
      }
      asignar(indice + 1, [...parcial, clase], restantes, puntaje + puntos);
    }

    asignar(indice + 1, parcial, [...restantes, materia], puntaje);
  };

  asignar(0, [], [], 0);

  const leerMejor = (): { asignadas: ClaseRaw[]; restantes: string[]; puntaje: number } | null => mejor;
  const solucion = leerMejor();

  const asignadas = solucion?.asignadas ?? [];
  const noAsignadas = (solucion?.restantes ?? materiasOrdenadas).map((materia) => ({
    materia: nombreCanonico.get(materia) ?? materia,
  }));

  const traslapes: TraslapeGenerado[] = [];
  for (let i = 0; i < asignadas.length; i++) {
    for (let j = i + 1; j < asignadas.length; j++) {
      const a = asignadas[i];
      const b = asignadas[j];
      if (!a || !b) continue;
      const { dias, minutos } = minutosTraslape(a, b);
      if (minutos <= 0) continue;
      traslapes.push({
        grupo: a.grupo,
        clave: a.clave,
        materia: a.materia,
        conGrupo: b.grupo,
        conClave: b.clave,
        conMateria: b.materia,
        dias,
        minutos,
      });
    }
  }

  return {
    horario: asignadas,
    traslapes,
    materiasNoAsignadas: noAsignadas,
    materiasAsignadas: asignadas.length,
    materiasSolicitadas: nombresSolicitados.length,
    puntaje: solucion?.puntaje ?? 0,
  };
};
