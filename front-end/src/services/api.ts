import type { Clase, HorarioGuardado, ResumenHorario } from "@/types";

export interface PreferenciasGenerador {
  materias: string[];
  profesoresPreferidos?: string[];
  diasPreferentes?: string[];
  restricciones?: { dia: string; horaMax: string }[];
  turnoPreferido?: "matutino" | "vespertino";
  permitirTraslapes?: boolean;
  maxTraslapeMin?: number;
}

export interface ResultadoGeneracion {
  horario: Clase[];
  traslapes: {
    grupo: string;
    clave: string;
    materia: string;
    conGrupo: string;
    conClave: string;
    conMateria: string;
    dias: string[];
    minutos: number;
  }[];
  materiasNoAsignadas: { materia: string }[];
  materiasAsignadas: number;
  materiasSolicitadas: number;
  puntaje: number;
}

const BASE_URL = "http://localhost:3000/horarios";

const peticion = async <T>(ruta: string, opciones?: RequestInit): Promise<T> => {
  const res = await fetch(`${BASE_URL}${ruta}`, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    ...opciones,
  });
  if (!res.ok) {
    throw new Error(`Error ${res.status} al consultar ${ruta}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
};

export const apiHorarios = {
  listar: (): Promise<ResumenHorario[]> => peticion("/"),

  crear: (nombre?: string): Promise<HorarioGuardado> =>
    peticion("/", {
      method: "POST",
      body: JSON.stringify({ nombre }),
    }),

  obtener: (id: string): Promise<HorarioGuardado> => peticion(`/${id}`),

  actualizar: (
    id: string,
    cambios: { nombre?: string; materias?: Clase[] },
  ): Promise<HorarioGuardado> =>
    peticion(`/${id}`, {
      method: "PUT",
      body: JSON.stringify(cambios),
    }),

  eliminar: (id: string): Promise<void> =>
    peticion(`/${id}`, { method: "DELETE" }),

  reemplazos: (
    id: string,
    index: number,
    incluirExternas: boolean,
  ): Promise<Clase[]> =>
    peticion(`/${id}/reemplazos/${index}`, {
      method: "POST",
      body: JSON.stringify({ incluir_externas: incluirExternas }),
    }),

  materiasDisponibles: (): Promise<{ materia: string; grupos: number }[]> =>
    peticion("/materias-disponibles"),

  autogenerar: (prefs: PreferenciasGenerador): Promise<ResultadoGeneracion> =>
    peticion("/generar", {
      method: "POST",
      body: JSON.stringify(prefs),
    }),
};