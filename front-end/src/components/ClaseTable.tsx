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
        "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800 dark:hover:bg-emerald-950/70",
      hoverFila: "hover:bg-emerald-50/30 dark:hover:bg-emerald-950/30",
    };
  }

  // 2. Si es Interna, calculamos turno
  const digitoTurno = parseInt(clase.grupo.toString()[2]) || 0;
  const esMatutino = digitoTurno < 5;

  return {
    colorBarra: esMatutino ? "bg-orange-500" : "bg-indigo-500",
    estiloBadge: esMatutino
      ? "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800 dark:hover:bg-orange-950/70"
      : "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800 dark:hover:bg-indigo-950/70",
    hoverFila: esMatutino
      ? "hover:bg-orange-50/30 dark:hover:bg-orange-950/30"
      : "hover:bg-indigo-50/30 dark:hover:bg-indigo-950/30",
  };
};

export const ClaseTable = ({
  datos,
  seleccionadas,
}: {
  datos: Clase[];
  seleccionadas?: (clase: Clase) => boolean;
}) => {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-auto max-h-[600px]">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10 shadow-sm">
            <TableRow className="hover:bg-muted border-b-border">
              <TableHead className="w-[100px] text-foreground font-bold">
                Grupo
              </TableHead>
              <TableHead className="hidden md:table-cell w-[80px] text-foreground font-bold">
                Clave
              </TableHead>
              <TableHead className="min-w-[180px] text-foreground font-bold">
                Materia
              </TableHead>
              <TableHead className="hidden md:table-cell min-w-[200px] text-foreground font-bold">
                Profesor
              </TableHead>
              {/* Días */}
              {["LU", "MA", "MI", "JU", "VI", "SA"].map((d) => (
                <TableHead
                  key={d}
                  className="text-center w-[80px] hidden md:table-cell text-xs font-bold text-muted-foreground"
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
              const esSeleccionada = seleccionadas?.(clase) ?? false;

              return (
                <TableRow
                  key={`${clase.grupo}-${i}`}
                  className={`group relative transition-colors cursor-default ${hoverFila} ${esSeleccionada ? "bg-emerald-50/60 dark:bg-emerald-950/40" : ""}`}
                >
                  {/* Columna Grupo con Barra de Color */}
                  <TableCell className="font-medium relative py-4">
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1.5 ${colorBarra}`}
                    />
                    {esSeleccionada && (
                      <span className="absolute right-2 top-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        ✓
                      </span>
                    )}
                    <div className="flex flex-col ml-3 gap-1">
                      <Badge
                        variant="outline"
                        className={`w-fit text-xs font-bold ${estiloBadge}`}
                      >
                        {clase.grupo}
                      </Badge>
                      {/* Badge pequeño indicando Origen si es externa */}
                      {clase.esExterno && (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter">
                          🎓 {clase.origen || "EXT"}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Columna Clave */}
                  <TableCell className="hidden md:table-cell">
                    <span className="font-mono text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {clase.clave}
                    </span>
                  </TableCell>

                  {/* Columna Materia */}
                  <TableCell>
                    <div className="flex flex-col">
                      {/* Móvil: Clave */}
                      <span className="md:hidden text-[10px] font-mono text-muted-foreground mb-0.5">
                        {clase.clave}
                      </span>

                      <span className="font-semibold text-sm text-foreground leading-tight">
                        {clase.materia}
                      </span>

                      {/* Móvil: Profesor */}
                      <span className="md:hidden text-xs text-muted-foreground mt-1">
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
                              className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground border border-border"
                            >
                              <b>{dia}:</b> {hora}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </TableCell>

                  {/* Columna Profesor (Desktop) */}
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {clase.profesor || "Sin asignar"}
                  </TableCell>

                  {/* Horarios (Desktop) */}
                  {["LU", "MA", "MI", "JU", "VI", "SA"].map((d) => {
                    const hora = clase.horario[d as keyof typeof clase.horario];
                    return (
                      <TableCell key={d} className="p-0 hidden md:table-cell">
                        {hora ? (
                          <div className="flex items-center justify-center h-full w-full py-4">
                            <span className="text-xs font-medium bg-muted text-foreground px-2 py-1 rounded border border-border">
                              {hora}
                            </span>
                          </div>
                        ) : (
                          <div className="text-center text-muted-foreground/40">-</div>
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
