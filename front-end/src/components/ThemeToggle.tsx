import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTema } from "@/context/useTema";

export const ThemeToggle = () => {
  const { tema, alternarTema } = useTema();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={alternarTema}
      aria-label={tema === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={tema === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      {tema === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
};
