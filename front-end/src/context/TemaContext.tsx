import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { TemaContext, type Tema, type TemaContextValue } from "./temaContext";

const TEMA_KEY = "horarios-tema";

const temaInicial = (): Tema => {
  const guardado = localStorage.getItem(TEMA_KEY);
  if (guardado === "light" || guardado === "dark") return guardado;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const TemaProvider = ({ children }: { children: ReactNode }) => {
  const [tema, setTema] = useState<Tema>(temaInicial);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", tema === "dark");
  }, [tema]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onCambio = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem(TEMA_KEY)) {
        setTema(e.matches ? "dark" : "light");
      }
    };
    media.addEventListener("change", onCambio);
    return () => media.removeEventListener("change", onCambio);
  }, []);

  const alternarTema = useCallback(() => {
    setTema((actual) => {
      const nuevo: Tema = actual === "dark" ? "light" : "dark";
      localStorage.setItem(TEMA_KEY, nuevo);
      return nuevo;
    });
  }, []);

  const valor: TemaContextValue = useMemo(
    () => ({ tema, alternarTema }),
    [tema, alternarTema],
  );

  return (
    <TemaContext.Provider value={valor}>{children}</TemaContext.Provider>
  );
};
