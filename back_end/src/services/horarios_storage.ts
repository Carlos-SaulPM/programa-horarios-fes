import { access, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

export interface ClaseRaw {
  profesor?: string;
  clave: string;
  materia: string;
  grupo: string;
  tipo?: string;
  horario: Record<string, string>;
  salon?: string;
  cupo?: string;
  esExterno?: boolean;
  origen?: string;
}

export interface HorarioGuardado {
  id: string;
  nombre: string;
  materias: ClaseRaw[];
  creado: string;
  modificado: string;
}

export interface ResumenHorario {
  id: string;
  nombre: string;
  creado: string;
  modificado: string;
  numMaterias: number;
}

const DIR_DATOS = path.join(process.cwd(), "src", "services", "horarios_guardados");
const RUTA_INDEX = path.join(DIR_DATOS, "_index.json");
const NOMBRE_INDEX = "_index.json";
const rutaArchivoDeId = (id: string): string => path.join(DIR_DATOS, `${id}.json`);

const existe = async (ruta: string): Promise<boolean> => {
  try {
    await access(ruta);
    return true;
  } catch {
    return false;
  }
};

const escribir = async (ruta: string, contenido: string): Promise<void> => {
  await writeFile(ruta, contenido, "utf-8");
};

const leerIndex = async (): Promise<ResumenHorario[]> => {
  if (!(await existe(RUTA_INDEX))) return [];
  return JSON.parse(await readFile(RUTA_INDEX, "utf-8"));
};

const escribirIndex = async (entradas: ResumenHorario[]): Promise<void> => {
  await escribir(RUTA_INDEX, JSON.stringify(entradas, null, 2));
};

export const listarHorarios = async (): Promise<ResumenHorario[]> => {
  const entradas = await leerIndex();
  return entradas.slice().sort((a, b) => a.creado.localeCompare(b.creado));
};

export const crearHorario = async (nombre?: string): Promise<HorarioGuardado> => {
  const index = await leerIndex();
  const ahora = new Date().toISOString();
  const id = crypto.randomUUID();
  const asignado = nombre?.trim() || `Horario ${index.length + 1}`;

  const horario: HorarioGuardado = {
    id,
    nombre: asignado,
    materias: [],
    creado: ahora,
    modificado: ahora,
  };

  await escribirIndex([
    ...index,
    {
      id,
      nombre: asignado,
      creado: ahora,
      modificado: ahora,
      numMaterias: 0,
    },
  ]);
  await escribir(rutaArchivoDeId(id), JSON.stringify(horario, null, 2));

  return horario;
};

export const obtenerHorario = async (id: string): Promise<HorarioGuardado | null> => {
  const ruta = rutaArchivoDeId(id);
  if (!(await existe(ruta))) return null;
  return JSON.parse(await readFile(ruta, "utf-8"));
};

export const guardarHorario = async (
  id: string,
  cambios: { nombre?: string; materias?: ClaseRaw[] },
): Promise<HorarioGuardado> => {
  const actual = await obtenerHorario(id);
  if (!actual) throw new Error("Horario inexistente");

  const ahora = new Date().toISOString();
  const proximo: HorarioGuardado = {
    ...actual,
    nombre: cambios.nombre?.trim() || actual.nombre,
    materias: cambios.materias ?? actual.materias,
    modificado: ahora,
  };

  await escribir(rutaArchivoDeId(id), JSON.stringify(proximo, null, 2));

  const index = await leerIndex();
  await escribirIndex(
    index.map((e) =>
      e.id === id
        ? {
            ...e,
            nombre: proximo.nombre,
            modificado: ahora,
            numMaterias: proximo.materias.length,
          }
        : e,
    ),
  );

  return proximo;
};

export const eliminarHorario = async (id: string): Promise<boolean> => {
  const ruta = rutaArchivoDeId(id);
  if (!(await existe(ruta))) return false;

  await rm(ruta);
  await escribirIndex((await leerIndex()).filter((e) => e.id !== id));
  return true;
};

const limpiarArchivosHuérfanos = async (): Promise<void> => {
  const idsIndex = new Set((await leerIndex()).map((e) => e.id));

  const archivos = await readdir(DIR_DATOS);
  const idsHuérfanos = archivos
    .filter((archivo) => archivo !== NOMBRE_INDEX)
    .map((archivo) => archivo.replace(".json", ""))
    .filter((id) => !idsIndex.has(id));

  await Promise.all(idsHuérfanos.map(async (id) => rm(rutaArchivoDeId(id))));
};

export const iniciarAlmacenamiento = async (): Promise<void> => {
  await mkdir(DIR_DATOS, { recursive: true });
  await limpiarArchivosHuérfanos();
};