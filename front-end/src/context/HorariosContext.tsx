import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Clase, HorarioGuardado, ResumenHorario } from "@/types";
import { apiHorarios } from "@/services/api";
import { hayConflicto, mismaClase } from "@/lib/horas";
import {
  HorariosContext,
  type HorariosContextValue,
  type ResultadoAgregar,
} from "./horariosContext";

export const HorariosProvider = ({ children }: { children: ReactNode }) => {
  const [resumenes, setResumenes] = useState<ResumenHorario[]>([]);
  const [horarioActivo, setHorarioActivo] = useState<HorarioGuardado | null>(
    null,
  );
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const refrescarResumenes = useCallback(async () => {
    setResumenes(await apiHorarios.listar());
  }, []);

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const lista = await apiHorarios.listar();
        if (!activo) return;
        setResumenes(lista);

        if (lista.length > 0) {
          const ultimo = await apiHorarios.obtener(lista[lista.length - 1].id);
          if (activo) setHorarioActivo(ultimo);
        }
      } catch {
        // Backend no disponible: arrancar vacío y no bloquear la UI
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, []);

  const crearHorario = useCallback(async () => {
    const nuevo = await apiHorarios.crear();
    setHorarioActivo(nuevo);
    setResumenes((prev) => [
      ...prev,
      {
        id: nuevo.id,
        nombre: nuevo.nombre,
        creado: nuevo.creado,
        modificado: nuevo.modificado,
        numMaterias: 0,
      },
    ]);
  }, []);

  const cargarHorario = useCallback(async (id: string) => {
    const completo = await apiHorarios.obtener(id);
    setHorarioActivo(completo);
  }, []);

  const renombrarHorario = useCallback(async (nombre: string) => {
    setHorarioActivo((actual) =>
      actual ? { ...actual, nombre } : actual,
    );
  }, []);

  const eliminarHorarioActivo = useCallback(async () => {
    if (!horarioActivo) return;
    await apiHorarios.eliminar(horarioActivo.id);
    setHorarioActivo(null);
    await refrescarResumenes();
  }, [horarioActivo, refrescarResumenes]);

  const agregarMateria = useCallback(
    (clase: Clase): ResultadoAgregar => {
      if (!horarioActivo) return { exito: false };

      if (horarioActivo.materias.some((m) => mismaClase(m, clase))) {
        return { exito: false, duplicado: true };
      }

      const conflicto = hayConflicto(horarioActivo.materias, clase);
      if (conflicto) {
        return { exito: false, conflicto };
      }

      setHorarioActivo((prev) =>
        prev ? { ...prev, materias: [...prev.materias, clase] } : prev,
      );
      return { exito: true };
    },
    [horarioActivo],
  );

  const agregarMateriaForzada = useCallback((clase: Clase) => {
    setHorarioActivo((prev) =>
      prev
        ? {
            ...prev,
            materias: prev.materias.some((m) => mismaClase(m, clase))
              ? prev.materias
              : [...prev.materias, clase],
          }
        : prev,
    );
  }, []);

  const cargarMateriasEnActivo = useCallback((materias: Clase[]) => {
    setHorarioActivo((prev) => (prev ? { ...prev, materias } : prev));
  }, []);

  const eliminarMateria = useCallback((index: number) => {
    setHorarioActivo((prev) =>
      prev
        ? { ...prev, materias: prev.materias.filter((_, i) => i !== index) }
        : prev,
    );
  }, []);

  const reemplazarMateria = useCallback(
    (index: number, nueva: Clase): boolean => {
      if (!horarioActivo) return false;

      const sinLaActual = horarioActivo.materias.filter(
        (_, i) => i !== index,
      );

      if (sinLaActual.some((m) => mismaClase(m, nueva))) return false;
      if (hayConflicto(sinLaActual, nueva)) return false;

      setHorarioActivo({
        ...horarioActivo,
        materias: [...sinLaActual, nueva],
      });
      return true;
    },
    [horarioActivo],
  );

  const estaSeleccionada = useCallback(
    (clase: Clase) =>
      horarioActivo?.materias.some((m) => mismaClase(m, clase)) ?? false,
    [horarioActivo],
  );

  const guardar = useCallback(async () => {
    if (!horarioActivo) return;
    setGuardando(true);
    try {
      const guardado = await apiHorarios.actualizar(horarioActivo.id, {
        nombre: horarioActivo.nombre,
        materias: horarioActivo.materias,
      });
      setHorarioActivo(guardado);
      await refrescarResumenes();
    } finally {
      setGuardando(false);
    }
  }, [horarioActivo, refrescarResumenes]);

  const valor: HorariosContextValue = useMemo(
    () => ({
      resumenes,
      horarioActivo,
      cargando,
      guardando,
      cargarHorario,
      crearHorario,
      renombrarHorario,
      eliminarHorarioActivo,
      agregarMateria,
      agregarMateriaForzada,
      cargarMateriasEnActivo,
      eliminarMateria,
      reemplazarMateria,
      estaSeleccionada,
      guardar,
    }),
    [
      resumenes,
      horarioActivo,
      cargando,
      guardando,
      cargarHorario,
      crearHorario,
      renombrarHorario,
      eliminarHorarioActivo,
      agregarMateria,
      agregarMateriaForzada,
      cargarMateriasEnActivo,
      eliminarMateria,
      reemplazarMateria,
      estaSeleccionada,
      guardar,
    ],
  );

  return (
    <HorariosContext.Provider value={valor}>
      {children}
    </HorariosContext.Provider>
  );
};