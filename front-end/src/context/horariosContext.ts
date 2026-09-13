import { createContext } from "react";
import type { Clase, HorarioGuardado, ResumenHorario } from "@/types";
import type { Dia } from "@/lib/horas";

export interface ConflictoDetalle {
  dia: Dia;
  materia: Clase;
}

export interface ResultadoAgregar {
  exito: boolean;
  duplicado?: boolean;
  conflicto?: ConflictoDetalle;
}

export interface HorariosContextValue {
  resumenes: ResumenHorario[];
  horarioActivo: HorarioGuardado | null;
  cargando: boolean;
  guardando: boolean;
  cargarHorario: (id: string) => Promise<void>;
  crearHorario: () => Promise<void>;
  renombrarHorario: (nombre: string) => Promise<void>;
  eliminarHorarioActivo: () => Promise<void>;
  agregarMateria: (clase: Clase) => ResultadoAgregar;
  agregarMateriaForzada: (clase: Clase) => void;
  cargarMateriasEnActivo: (materias: Clase[]) => void;
  eliminarMateria: (index: number) => void;
  reemplazarMateria: (index: number, nueva: Clase) => boolean;
  estaSeleccionada: (clase: Clase) => boolean;
  guardar: () => Promise<void>;
}

export const HorariosContext = createContext<HorariosContextValue | null>(null);