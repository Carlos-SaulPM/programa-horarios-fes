import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import type { Clase } from "@/types";
import { ClaseCard } from "@/components/ClaseCard";
import { Button } from "@/components/ui/button";
import { apiHorarios } from "@/services/api";

interface Props {
  horarioId: string;
  index: number;
  incluirExternas: boolean;
  onSeleccionar: (nueva: Clase) => void;
  onClose: () => void;
}

export const ReemplazosModal = ({
  horarioId,
  index,
  incluirExternas,
  onSeleccionar,
  onClose,
}: Props) => {
  const [candidatos, setCandidatos] = useState<Clase[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const sustitutos = await apiHorarios.reemplazos(
          horarioId,
          index,
          incluirExternas,
        );
        if (activo) setCandidatos(sustitutos);
      } catch {
        if (activo) setError("No se pudieron cargar los reemplazos.");
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, [horarioId, index, incluirExternas]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h3 className="font-bold text-foreground">Posibles reemplazos</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="overflow-y-auto p-5 space-y-3">
          {cargando ? (
            <div className="py-16 flex flex-col items-center gap-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              Buscando materias que quepan en este espacio...
            </div>
          ) : error ? (
            <p className="text-sm text-destructive text-center py-8">{error}</p>
          ) : candidatos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No hay materias disponibles para este espacio.
            </p>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                Elige una materia para reemplazar la actual y cerrar el modal.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {candidatos.map((c, i) => (
                  <ClaseCard
                    key={`${c.grupo}-${c.clave}-${i}`}
                    data={c}
                    onClick={() => onSeleccionar(c)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};