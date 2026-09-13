import { AlertTriangle } from "lucide-react";
import type { Clase } from "@/types";
import {
  DIAS,
  claveClase,
  encontrarConflictosEnHorario,
  getRangoDeDia,
  type Dia,
} from "@/lib/horas";

interface Props {
  materias: Clase[];
}

interface Bloque {
  clase: Clase;
  dia: Dia;
  topPx: number;
  altoPx: number;
}

const HORA_INICIO = 7;
const HORA_FIN = 22;
const ALTURA_PX_POR_HORA = 60;
const ALTURA_TOTAL_GRID = (HORA_FIN - HORA_INICIO) * ALTURA_PX_POR_HORA;
const INICIO_EN_MINUTOS = HORA_INICIO * 60;

const horasDelDia = Array.from(
  { length: HORA_FIN - HORA_INICIO },
  (_, i) => `${String(HORA_INICIO + i).padStart(2, "0")}:00`,
);

const horaAMinutos = (hora: string): number => {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
};

const minutosAPx = (minutos: number): number =>
  ((minutos - INICIO_EN_MINUTOS) / 60) * ALTURA_PX_POR_HORA;

const construirBloques = (materias: Clase[]): Bloque[] => {
  const bloques: Bloque[] = [];

  materias.forEach((clase) => {
    DIAS.forEach((dia) => {
      const rango = getRangoDeDia(clase.horario, dia);
      if (!rango) return;

      const duracionMin = rango.fin - rango.inicio;
      if (duracionMin <= 0) return;

      bloques.push({
        clase,
        dia,
        topPx: minutosAPx(rango.inicio),
        altoPx: (duracionMin / 60) * ALTURA_PX_POR_HORA,
      });
    });
  });

  return bloques;
};

const colorMateria = (clase: Clase, enConflicto: boolean): string => {
  if (enConflicto) return "bg-red-500/90 border-red-600";
  if (clase.esExterno) return "bg-emerald-500/90 border-emerald-600";
  const tercero = clase.grupo?.toString()[2];
  return parseInt(tercero, 10) >= 5
    ? "bg-indigo-500/90 border-indigo-600"
    : "bg-orange-500/90 border-orange-600";
};

export const HorarioCanvas = ({ materias }: Props) => {
  const bloques = construirBloques(materias);
  const conflictos = encontrarConflictosEnHorario(materias);

  const enConflicto = (clase: Clase, dia: Dia): boolean => {
    const info = conflictos.get(claveClase(clase));
    return info?.some((c) => c.dias.includes(dia)) ?? false;
  };

  const totalConflictos = [...conflictos.entries()].reduce(
    (acc, [, infos]) => acc + infos.length,
    0,
  );

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-auto">
      {totalConflictos > 0 && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border-b border-red-500/30 text-red-700 dark:text-red-400 text-xs font-semibold">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          {totalConflictos === 1
            ? "1 traslape detectado"
            : `${totalConflictos} traslapes detectados`}{" "}
          en este horario
        </div>
      )}
      <div
        className="grid min-w-[720px]"
        style={{ gridTemplateColumns: "56px repeat(6, 1fr)" }}
      >
        <div className="sticky left-0 z-20 bg-muted border-b border-border" />
        {DIAS.map((dia) => (
          <div
            key={dia}
            className="py-2 text-center text-xs font-bold text-muted-foreground bg-muted border-b border-l border-border"
          >
            {dia}
          </div>
        ))}

        <div className="sticky left-0 z-10 bg-card">
          {horasDelDia.map((hora) => (
            <div
              key={hora}
              style={{ height: ALTURA_PX_POR_HORA }}
              className="text-[10px] text-muted-foreground pr-2 text-right border-b border-border"
            >
              {hora}
            </div>
          ))}
        </div>

        {DIAS.map((dia) => (
          <div
            key={dia}
            className="relative border-l border-border"
            style={{ height: ALTURA_TOTAL_GRID }}
          >
            {horasDelDia.slice(1).map((hora) => (
              <div
                key={hora}
                className="absolute left-0 right-0 border-t border-border"
                style={{ top: minutosAPx(horaAMinutos(hora)) }}
              />
            ))}

            {bloques
              .filter((b) => b.dia === dia)
              .map((bloque, i) => {
                const conflicto = enConflicto(bloque.clase, bloque.dia);
                return (
                  <div
                    key={`${bloque.clase.grupo}-${bloque.clase.clave}-${bloque.dia}-${i}`}
                    className={`absolute left-1 right-1 rounded px-1.5 py-0.5 overflow-hidden text-[10px] leading-tight text-white border ${colorMateria(bloque.clase, conflicto)}`}
                    style={{ top: bloque.topPx, height: bloque.altoPx }}
                    title={`${bloque.clase.materia} (grupo ${bloque.clase.grupo})`}
                  >
                    <span className="font-bold block">{bloque.clase.grupo}</span>
                    <span className="block truncate">{bloque.clase.materia}</span>
                    {conflicto && (
                      <span className="absolute top-0 right-0 p-0.5 bg-red-600 rounded-bl">
                        <AlertTriangle className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
};