import { useContext } from "react";
import {
  HorariosContext,
  type HorariosContextValue,
} from "./horariosContext";

export const useHorarios = (): HorariosContextValue => {
  const contexto = useContext(HorariosContext);
  if (!contexto) {
    throw new Error("useHorarios debe usarse dentro de HorariosProvider");
  }
  return contexto;
};