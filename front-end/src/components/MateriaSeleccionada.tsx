import { AlertTriangle, Ban, RefreshCcw } from "lucide-react";
import type { Clase } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getHorasDeDia, DIAS, type Dia } from "@/lib/horas";

interface Props {
  clase: Clase;
  index: number;
  diasConflicto?: Dia[];
  onEliminar: (index: number) => void;
  onReemplazar: (index: number) => void;
}

const diasConHorario = (clase: Clase): { d: string; hora: string }[] =>
  DIAS.map((d) => ({ d, hora: getHorasDeDia(clase.horario, d) })).filter(
    (x) => x.hora !== "",
  );

export const MateriaSeleccionada = ({
  clase,
  index,
  diasConflicto = [],
  onEliminar,
  onReemplazar,
}: Props) => {
  const dias = diasConHorario(clase);
  const enConflicto = diasConflicto.length > 0;

  return (
    <li
      className={`flex items-start justify-between gap-3 p-3 rounded-lg border transition-colors ${
        enConflicto
          ? "border-red-400/60 bg-red-500/5"
          : "bg-muted/50 hover:bg-card"
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground truncate">
            {clase.materia}
          </span>
          <Badge variant="outline" className="shrink-0 text-[10px]">
            {clase.grupo}
          </Badge>
          {enConflicto && (
            <Badge
              variant="destructive"
              className="shrink-0 text-[9px] gap-1"
            >
              <AlertTriangle className="h-3 w-3" />
              Traslape
            </Badge>
          )}
          {clase.esExterno && (
            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
              {clase.origen || "Ext"}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {clase.profesor || "Sin asignar"}
        </p>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {dias.map(({ d, hora }) => {
            const enDia = diasConflicto.includes(d as Dia);
            return (
              <span
                key={d}
                className={`text-[10px] border px-1.5 py-0.5 rounded ${
                  enDia
                    ? "bg-red-100 text-red-700 border-red-300 dark:bg-red-500/20 dark:text-red-300 font-semibold"
                    : "bg-card text-muted-foreground border-border"
                }`}
              >
                <b>{d}:</b> {hora}
              </span>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-1 shrink-0">
        <Button
          size="icon-sm"
          variant="outline"
          onClick={() => onReemplazar(index)}
          title="Ver materias que caben en este espacio"
        >
          <RefreshCcw className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={() => onEliminar(index)}
          title="Quitar del horario"
          className="text-destructive hover:text-destructive"
        >
          <Ban className="h-3.5 w-3.5" />
        </Button>
      </div>
    </li>
  );
};