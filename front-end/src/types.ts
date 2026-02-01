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
  profesor?: string;
  clave: string;
  materia: string;
  grupo: string;
  tipo: string;
  horario: Horario;
  salon: string;
  cupo: string;
}
