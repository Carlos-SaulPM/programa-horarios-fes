// src/types.ts

export interface Horario {
  LU?: string;
  MA?: string;
  MI?: string;
  JU?: string;
  VI?: string;
  SA?: string;
}

export interface Clase {
  profesor?: string; // Ya lo tenías opcional, excelente
  clave: string;
  materia: string;
  grupo: string;
  tipo: string;
  horario: Horario;
  salon: string;
  cupo: string;

  // --- CAMPOS NUEVOS ---
  esExterno?: boolean; // Opcional: true si viene de materias_externas.json
  origen?: string; // Opcional: El nombre de la carrera (ej. "Ingeniería Civil")
}
