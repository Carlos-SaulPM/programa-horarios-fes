import { AlertTriangle, Zap } from "lucide-react";
import type { Clase } from "@/types";
import type { ConflictoDetalle } from "@/context/horariosContext";
import { Button } from "@/components/ui/button";
import { DIAS, getHorasDeDia, getRangoDeDia } from "@/lib/horas";

interface Props {
  nueva: Clase;
  conflicto: ConflictoDetalle;
  onConfirmar: () => void;
  onCancelar: () => void;
}

const diasConHorario = (clase: Clase) =>
  DIAS.map((d) => ({ dia: d, hora: getHorasDeDia(clase.horario, d) })).filter(
    (x) => x.hora !== "",
  );

const solapeEnDia = (a: Clase, b: Clase, dia: string): number => {
  const rangoA = getRangoDeDia(a.horario, dia as (typeof DIAS)[number]);
  const rangoB = getRangoDeDia(b.horario, dia as (typeof DIAS)[number]);
  if (!rangoA || !rangoB) return 0;
  return Math.min(rangoA.fin, rangoB.fin) - Math.max(rangoA.inicio, rangoB.inicio);
};

export const ConflictoModal = ({
  nueva,
  conflicto,
  onConfirmar,
  onCancelar,
}: Props) => {
  const diasConflictivos = DIAS.filter(
    (d) =>
      getHorasDeDia(nueva.horario, d) &&
      getHorasDeDia(conflicto.materia.horario, d),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-4 flex items-center gap-3">
          <span className="bg-amber-500 text-white rounded-full p-2">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-bold text-amber-700 dark:text-amber-400">
              Conflicto de horario detectado
            </h3>
            <p className="text-xs text-amber-700/70 dark:text-amber-400/70">
              Las materias se traslapan. Puedes inscribirlas si llegas a un
              acuerdo con los profesores.
            </p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-3">
            {/* Nueva materia */}
            <div className="rounded-xl border-2 border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-500/5 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400 mb-1">
                Nueva materia
              </p>
              <p className="text-sm font-bold text-foreground leading-tight">
                {nueva.materia}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Grupo {nueva.grupo} · {nueva.profesor || "Sin asignar"}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {diasConHorario(nueva).map(({ dia, hora }) => (
                  <span
                    key={dia}
                    className={`text-[10px] px-1.5 py-0.5 rounded border ${
                      diasConflictivos.includes(dia)
                        ? "bg-red-100 text-red-700 border-red-300 dark:bg-red-500/20 dark:text-red-300"
                        : "bg-card text-muted-foreground border-border"
                    }`}
                  >
                    {dia} {hora}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center">
              <Zap className="h-6 w-6 text-amber-500" />
            </div>

            {/* Materia existente */}
            <div className="rounded-xl border-2 border-red-500/50 bg-red-50/50 dark:bg-red-500/5 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-red-700 dark:text-red-400 mb-1">
                Ya está en tu horario
              </p>
              <p className="text-sm font-bold text-foreground leading-tight">
                {conflicto.materia.materia}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Grupo {conflicto.materia.grupo} ·{" "}
                {conflicto.materia.profesor || "Sin asignar"}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {diasConHorario(conflicto.materia).map(({ dia, hora }) => (
                  <span
                    key={dia}
                    className={`text-[10px] px-1.5 py-0.5 rounded border ${
                      diasConflictivos.includes(dia)
                        ? "bg-red-100 text-red-700 border-red-300 dark:bg-red-500/20 dark:text-red-300"
                        : "bg-card text-muted-foreground border-border"
                    }`}
                  >
                    {dia} {hora}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Detalle del traslape */}
          <div className="rounded-xl border border-red-200 bg-red-50/60 dark:bg-red-500/10 p-3">
            <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-2">
              Traslape detectado:
            </p>
            <div className="space-y-1">
              {diasConflictivos.map((d) => {
                const minutos = solapeEnDia(nueva, conflicto.materia, d);
                return (
                  <p key={d} className="text-xs text-muted-foreground">
                    <span className="font-bold text-red-600 dark:text-red-400">
                      Día {d}
                    </span>
                    : {getHorasDeDia(nueva.horario, d)} vs{" "}
                    {getHorasDeDia(conflicto.materia.horario, d)} →{" "}
                    <span className="font-bold text-red-600 dark:text-red-400">
                      {minutos} min
                    </span>{" "}
                    solapados
                  </p>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t bg-muted/30 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancelar}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirmar}
            className="font-semibold"
          >
            Forzar inscripción
          </Button>
        </div>
      </div>
    </div>
  );
};