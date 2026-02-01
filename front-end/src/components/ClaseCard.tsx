import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Clase } from "@/types";

const obtenerTurno = (grupo: string) => {
  const digitoTurno = parseInt(grupo.toString()[2]);
  return digitoTurno < 5 ? "matutino" : "vespertino";
};

export const ClaseCard = ({ data }: { data: Clase }) => {
  const dias = ["LU", "MA", "MI", "JU", "VI", "SA"];
  const turno = obtenerTurno(data.grupo);

  const colorBorde =
    turno === "matutino" ? "border-l-orange-500" : "border-l-indigo-600";
  const badgeColor =
    turno === "matutino"
      ? "bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200"
      : "bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-indigo-200";

  return (
    <Card
      className={`hover:shadow-md transition-all border-l-4 ${colorBorde} flex flex-col h-full`}
    >
      <CardHeader className="pb-2 space-y-1">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-base font-bold text-slate-900 leading-tight">
            {data.materia}
          </CardTitle>
          <Badge
            variant="outline"
            className={`whitespace-nowrap ${badgeColor}`}
          >
            {data.grupo}
          </Badge>
        </div>
        <p className="text-xs text-slate-500 font-medium truncate h-4">
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
                className="flex justify-between border-b border-slate-100 py-1"
              >
                <span className="font-bold text-slate-500 w-6">{dia}</span>
                <span className="text-slate-900">{hora}</span>
              </div>
            );
          })}
        </div>

        {/* Footer con Metadatos: Clave, Salón y Cupo */}
        <div className="pt-3 mt-auto border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-wider">
          <div className="flex items-center gap-1">
            <span className="text-slate-300">C:</span>
            <span className="font-mono bg-slate-50 px-1 py-0.5 rounded text-slate-600 font-bold">
              {data.clave}
            </span>
          </div>
          <div className="flex gap-3">
            <span>
              Salón: <b className="text-slate-700">{data.salon}</b>
            </span>
            <span>
              Cupo: <b className="text-slate-700">{data.cupo}</b>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
