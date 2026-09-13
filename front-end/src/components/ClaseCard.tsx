import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Clase } from "@/types";

const obtenerTurno = (grupo: string) => {
  const digitoTurno = parseInt(grupo.toString()[2]);
  return digitoTurno < 5 ? "matutino" : "vespertino";
};

export const ClaseCard = ({
  data,
  seleccionada = false,
  onClick,
}: {
  data: Clase;
  seleccionada?: boolean;
  onClick?: () => void;
}) => {
  const dias = ["LU", "MA", "MI", "JU", "VI", "SA"];
  const turno = obtenerTurno(data.grupo);

  const colorBorde =
    turno === "matutino" ? "border-l-orange-500" : "border-l-indigo-600";
  const badgeColor =
    turno === "matutino"
      ? "bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:hover:bg-orange-950/50 dark:border-orange-800"
      : "bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-950/50 dark:border-indigo-800";

  return (
    <Card
      onClick={onClick}
      className={`hover:shadow-md transition-all border-l-4 ${colorBorde} flex flex-col h-full ${onClick ? "cursor-pointer" : ""} ${seleccionada ? "ring-2 ring-emerald-500 ring-offset-1 ring-offset-background" : ""}`}
    >
      {/* INDICADOR VISUAL SI ES EXTERNA */}
      {data.esExterno && (
        <div className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 text-center font-bold tracking-wide uppercase border-b border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900">
          🎓 {data.origen || "Otra Carrera"}
        </div>
      )}
      {/* INDICADOR VISUAL SI ESTÁ SELECCIONADA */}
      {seleccionada && (
        <div className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 text-center font-bold tracking-wide uppercase">
          ✓ Ya en tu horario
        </div>
      )}
      <CardHeader className="pb-2 space-y-1">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-base font-bold text-foreground leading-tight">
            {data.materia}
          </CardTitle>
          <Badge
            variant="outline"
            className={`whitespace-nowrap ${badgeColor}`}
          >
            {data.grupo}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground font-medium truncate h-4">
          {data.profesor || "Profesor por asignar"}
        </p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-end">
        {/* Grilla de horarios */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mt-2 mb-4">
          {dias.map((dia) => {
            const hora = data.horario[dia as keyof typeof data.horario];
            if (!hora) return null;
            return (
              <div
                key={dia}
                className="flex justify-between border-b border-border py-1"
              >
                <span className="font-bold text-muted-foreground w-6">{dia}</span>
                <span className="text-foreground">{hora}</span>
              </div>
            );
          })}
        </div>

        {/* Footer con Metadatos: Clave, Salón y Cupo */}
        <div className="pt-3 mt-auto border-t border-border flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-wider">
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground/50">C:</span>
            <span className="font-mono bg-muted px-1 py-0.5 rounded text-foreground font-bold">
              {data.clave}
            </span>
          </div>
          <div className="flex gap-3">
            <span>
              Salón: <b className="text-foreground">{data.salon}</b>
            </span>
            <span>
              Cupo: <b className="text-foreground">{data.cupo}</b>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
