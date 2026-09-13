import type { Clase } from "@/types";
import { MateriaSeleccionada } from "@/components/MateriaSeleccionada";
import {
  claveClase,
  encontrarConflictosEnHorario,
  ordenarPorHora,
  type Dia,
} from "@/lib/horas";

interface Props {
  materias: Clase[];
  onEliminar: (index: number) => void;
  onReemplazar: (index: number) => void;
}

export const ListaMaterias = ({ materias, onEliminar, onReemplazar }: Props) => {
  const ordenadas = ordenarPorHora(materias);
  const indiceOriginal = (clase: Clase) => materias.indexOf(clase);
  const conflictos = encontrarConflictosEnHorario(materias);

  const diasConflictoDe = (clase: Clase): Dia[] =>
    (conflictos.get(claveClase(clase)) ?? []).flatMap((c) => c.dias);

  return (
    <ul className="space-y-2">
      {ordenadas.map((clase) => (
        <MateriaSeleccionada
          key={`${clase.grupo}-${clase.clave}`}
          clase={clase}
          index={indiceOriginal(clase)}
          diasConflicto={diasConflictoDe(clase)}
          onEliminar={onEliminar}
          onReemplazar={onReemplazar}
        />
      ))}
    </ul>
  );
};