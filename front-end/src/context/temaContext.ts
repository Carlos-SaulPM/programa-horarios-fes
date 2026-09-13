import { createContext } from "react";

export type Tema = "light" | "dark";

export interface TemaContextValue {
  tema: Tema;
  alternarTema: () => void;
}

export const TemaContext = createContext<TemaContextValue | null>(null);
