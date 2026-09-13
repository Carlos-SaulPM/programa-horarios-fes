import { useContext } from "react";
import { TemaContext, type TemaContextValue } from "./temaContext";

export const useTema = (): TemaContextValue => {
  const contexto = useContext(TemaContext);
  if (!contexto) {
    throw new Error("useTema debe usarse dentro de TemaProvider");
  }
  return contexto;
};
