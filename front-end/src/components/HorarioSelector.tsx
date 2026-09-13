import { useState } from "react";
import { Plus, Pencil, Save, Trash2, Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHorarios } from "@/context/useHorarios";

export const HorarioSelector = () => {
  const {
    resumenes,
    horarioActivo,
    cargando,
    guardando,
    cargarHorario,
    crearHorario,
    renombrarHorario,
    eliminarHorarioActivo,
    guardar,
  } = useHorarios();

  const [editandoNombre, setEditandoNombre] = useState(false);
  const [nombreTemp, setNombreTemp] = useState("");

  const iniciarRenombre = () => {
    setNombreTemp(horarioActivo?.nombre ?? "");
    setEditandoNombre(true);
  };

const confirmarRenombre = async () => {
    await renombrarHorario(nombreTemp.trim() || (horarioActivo?.nombre ?? ""));
    setEditandoNombre(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 bg-card p-4 rounded-xl border shadow-sm">
      <div className="flex items-center gap-2 min-w-[200px] flex-1 sm:flex-none">
        <span className="text-sm font-semibold text-muted-foreground">Horario:</span>
        <Select
          value={horarioActivo?.id ?? ""}
          onValueChange={(id) => id && cargarHorario(id)}
          disabled={cargando || resumenes.length === 0}
        >
          <SelectTrigger className="w-[220px]" disabled={resumenes.length === 0}>
            <SelectValue placeholder="Selecciona un horario" />
          </SelectTrigger>
          <SelectContent>
            {resumenes.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.nombre} ({r.numMaterias} mat.)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={crearHorario}
        disabled={cargando}
      >
        <Plus className="h-4 w-4 mr-1" /> Nuevo
      </Button>

      {horarioActivo && (
        <>
          {editandoNombre ? (
            <div className="flex items-center gap-1">
              <Input
                autoFocus
                value={nombreTemp}
                onChange={(e) => setNombreTemp(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") confirmarRenombre();
                  if (e.key === "Escape") setEditandoNombre(false);
                }}
                className="h-8 w-40"
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={confirmarRenombre}
                aria-label="Confirmar nombre"
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <span
              className="text-sm font-medium text-foreground cursor-pointer hover:underline flex items-center gap-1"
              onClick={iniciarRenombre}
              title="Click para renombrar"
            >
              {horarioActivo.nombre}
              <Pencil className="h-3 w-3 text-muted-foreground" />
            </span>
          )}

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={guardar}
              disabled={guardando}
              title="Guardar cambios"
            >
              <Save className="h-4 w-4 mr-1" />
              {guardando ? "Guardando..." : "Guardar"}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                if (confirm("¿Eliminar este horario?")) eliminarHorarioActivo();
              }}
              title="Eliminar horario"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};