import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { type Clase } from "@/types";

const obtenerEstilos = (clase: Clase) => {
  // 1. Si es EXTERNA (Prioridad sobre el turno)
  if (clase.esExterno) {
    return {
      colorBarra: "bg-emerald-500", // Mismo tono que tu Card
      estiloBadge:
        "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
      hoverFila: "hover:bg-emerald-50/30",
    };
  }

  // 2. Si es Interna, calculamos turno
  const digitoTurno = parseInt(clase.grupo.toString()[2]) || 0;
  const esMatutino = digitoTurno < 5;

  return {
    colorBarra: esMatutino ? "bg-orange-500" : "bg-indigo-500",
    estiloBadge: esMatutino
      ? "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
      : "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100",
    hoverFila: esMatutino ? "hover:bg-orange-50/30" : "hover:bg-indigo-50/30",
  };
};

export const ClaseTable = ({ datos }: { datos: Clase[] }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-auto max-h-[600px]">
        <Table>
          <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
            <TableRow className="hover:bg-slate-50 border-b-slate-200">
              <TableHead className="w-[100px] text-slate-700 font-bold">
                Grupo
              </TableHead>
              <TableHead className="hidden md:table-cell w-[80px] text-slate-700 font-bold">
                Clave
              </TableHead>
              <TableHead className="min-w-[180px] text-slate-700 font-bold">
                Materia
              </TableHead>
              <TableHead className="hidden md:table-cell min-w-[200px] text-slate-700 font-bold">
                Profesor
              </TableHead>
              {/* Días */}
              {["LU", "MA", "MI", "JU", "VI", "SA"].map((d) => (
                <TableHead
                  key={d}
                  className="text-center w-[80px] hidden md:table-cell text-xs font-bold text-slate-500"
                >
                  {d}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {datos.map((clase, i) => {
              const { colorBarra, estiloBadge, hoverFila } =
                obtenerEstilos(clase);

              return (
                <TableRow
                  key={`${clase.grupo}-${i}`}
                  className={`group relative transition-colors cursor-default ${hoverFila}`}
                >
                  {/* Columna Grupo con Barra de Color */}
                  <TableCell className="font-medium relative py-4">
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1.5 ${colorBarra}`}
                    />
                    <div className="flex flex-col ml-3 gap-1">
                      <Badge
                        variant="outline"
                        className={`w-fit text-xs font-bold ${estiloBadge}`}
                      >
                        {clase.grupo}
                      </Badge>
                      {/* Badge pequeño indicando Origen si es externa */}
                      {clase.esExterno && (
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">
                          🎓 {clase.origen || "EXT"}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Columna Clave */}
                  <TableCell className="hidden md:table-cell">
                    <span className="font-mono text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {clase.clave}
                    </span>
                  </TableCell>

                  {/* Columna Materia */}
                  <TableCell>
                    <div className="flex flex-col">
                      {/* Móvil: Clave */}
                      <span className="md:hidden text-[10px] font-mono text-slate-400 mb-0.5">
                        {clase.clave}
                      </span>

                      <span className="font-semibold text-sm text-slate-800 leading-tight">
                        {clase.materia}
                      </span>

                      {/* Móvil: Profesor */}
                      <span className="md:hidden text-xs text-slate-500 mt-1">
                        {clase.profesor || "Sin asignar"}
                      </span>

                      {/* Móvil: Horarios */}
                      <div className="md:hidden flex flex-wrap gap-1 mt-2">
                        {["LU", "MA", "MI", "JU", "VI", "SA"].map((dia) => {
                          const hora =
                            clase.horario[dia as keyof typeof clase.horario];
                          if (!hora) return null;
                          return (
                            <span
                              key={dia}
                              className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 border border-slate-200"
                            >
                              <b>{dia}:</b> {hora}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </TableCell>

                  {/* Columna Profesor (Desktop) */}
                  <TableCell className="hidden md:table-cell text-sm text-slate-600">
                    {clase.profesor || "Sin asignar"}
                  </TableCell>

                  {/* Horarios (Desktop) */}
                  {["LU", "MA", "MI", "JU", "VI", "SA"].map((d) => {
                    const hora = clase.horario[d as keyof typeof clase.horario];
                    return (
                      <TableCell key={d} className="p-0 hidden md:table-cell">
                        {hora ? (
                          <div className="flex items-center justify-center h-full w-full py-4">
                            <span className="text-xs font-medium bg-slate-50 text-slate-700 px-2 py-1 rounded border border-slate-100">
                              {hora}
                            </span>
                          </div>
                        ) : (
                          <div className="text-center text-slate-200">-</div>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
