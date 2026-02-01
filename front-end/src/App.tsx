import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClaseCard } from "@/components/ClaseCard";
import { ClaseTable } from "@/components/ClaseTable"; // Asegúrate de haber creado este componente
import { type Clase } from "@/types";

function App() {
  // --- ESTADOS DE LA APLICACIÓN ---

  // Modo de búsqueda: 'profesor' o 'rango' (horario libre)
  const [modo, setModo] = useState<"profesor" | "rango">("profesor");

  // Datos y Carga
  const [resultados, setResultados] = useState<Clase[]>([]);
  const [loading, setLoading] = useState(false);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);

  // Vista: 'cards' o 'tabla'
  const [vista, setVista] = useState<"cards" | "tabla">("cards");

  // --- FILTROS ---
  const [queryProfesor, setQueryProfesor] = useState("");
  const [dia, setDia] = useState("LU");
  const [horaInicio, setHoraInicio] = useState("07:00");
  const [horaFin, setHoraFin] = useState("22:00");
  const [ordenar, setOrdenar] = useState(false);

  // Filtros Avanzados
  const [semInicio, setSemInicio] = useState("");
  const [semFin, setSemFin] = useState("");
  const [turno, setTurno] = useState("ambos"); // 'matutino', 'vespertino', 'ambos'

  // --- LÓGICA DE BÚSQUEDA ---
  const buscar = async () => {
    setLoading(true);
    setResultados([]);
    setBusquedaRealizada(true);

    // Construcción de filtros comunes (Query Params)
    const params = new URLSearchParams();
    if (ordenar) params.append("ordenarAscendente", "true");
    if (semInicio) params.append("semestre_inicial", semInicio);
    if (semFin) params.append("semestre_final", semFin);
    if (turno !== "ambos") params.append("turno", turno);

    try {
      let url = "";
      let options: RequestInit = {};

      if (modo === "profesor") {
        // Endpoint POST para profesor
        url = `http://localhost:3000/grupos/profesor?${params.toString()}`;
        options = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profesor: queryProfesor }),
        };
      } else {
        // Endpoint GET para rango de horario
        params.append("hora_inicio", horaInicio);
        params.append("hora_limite", horaFin);
        url = `http://localhost:3000/grupos/rango/${dia}?${params.toString()}`;
        options = { method: "GET" };
      }

      const res = await fetch(url, options);
      if (!res.ok) throw new Error("Error en la petición");
      const data = await res.json();
      setResultados(data);
    } catch (error) {
      console.error(error);
      alert("Hubo un error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* ENCABEZADO */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Buscador de Horarios FES
          </h1>
          <p className="text-slate-500 text-lg">
            Planifica tu semestre sin dolor de cabeza
          </p>
        </div>

        {/* PANEL DE CONTROL */}
        <div className="bg-white p-6 rounded-xl shadow-sm border space-y-6">
          {/* Tabs de Modo de Búsqueda */}
          <div className="flex space-x-4 border-b pb-4">
            <Button
              variant={modo === "profesor" ? "default" : "ghost"}
              onClick={() => setModo("profesor")}
              className="text-base"
            >
              Por Profesor
            </Button>
            <Button
              variant={modo === "rango" ? "default" : "ghost"}
              onClick={() => setModo("rango")}
              className="text-base"
            >
              Por Horario Libre
            </Button>
          </div>

          {/* Grid de Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
            {/* Inputs Dinámicos según Modo */}
            {modo === "profesor" ? (
              <div className="lg:col-span-2 space-y-2">
                <Label className="text-sm font-medium">
                  Nombre del Profesor
                </Label>
                <Input
                  placeholder="Ej: Sanchez Hernandez"
                  value={queryProfesor}
                  onChange={(e) => setQueryProfesor(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && buscar()}
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Día</Label>
                  <Select value={dia} onValueChange={setDia}>
                    <SelectTrigger>
                      <SelectValue placeholder="Día" />
                    </SelectTrigger>
                    <SelectContent>
                      {["LU", "MA", "MI", "JU", "VI", "SA"].map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Hora Inicio</Label>
                  <Input
                    type="time"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hora Límite</Label>
                  <Input
                    type="time"
                    value={horaFin}
                    onChange={(e) => setHoraFin(e.target.value)}
                  />
                </div>
                <div className="hidden lg:block"></div> {/* Espaciador */}
              </>
            )}

            {/* Filtros Globales */}
            <div className="space-y-2">
              <Label>Sem. Min</Label>
              <Input
                type="number"
                placeholder="1"
                value={semInicio}
                onChange={(e) => setSemInicio(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Sem. Max</Label>
              <Input
                type="number"
                placeholder="9"
                value={semFin}
                onChange={(e) => setSemFin(e.target.value)}
              />
            </div>

            {/* Filtro de Turno */}
            <div className="space-y-2">
              <Label>Turno</Label>
              <Select value={turno} onValueChange={setTurno}>
                <SelectTrigger>
                  <SelectValue placeholder="Turno" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ambos">Todos</SelectItem>
                  <SelectItem value="matutino">Matutino (Mañana)</SelectItem>
                  <SelectItem value="vespertino">Vespertino (Tarde)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Botón Buscar */}
            <div className="lg:col-span-1">
              <Button
                size="lg"
                onClick={buscar}
                disabled={loading}
                className="w-full font-bold"
              >
                {loading ? "Buscando..." : "Buscar Horarios"}
              </Button>
            </div>
          </div>

          {/* Opciones Extra (Switch) */}
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="ordenar"
              checked={ordenar}
              onCheckedChange={setOrdenar}
            />
            <Label htmlFor="ordenar" className="cursor-pointer">
              Ordenar por hora más temprana
            </Label>
          </div>
        </div>

        {/* RESULTADOS */}
        <div className="space-y-4">
          {/* Header de Resultados y Toggle de Vista */}
          {(resultados.length > 0 || busquedaRealizada) && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b pb-4">
              <h2 className="text-xl font-semibold text-slate-800">
                Resultados encontrados:{" "}
                <span className="text-primary">{resultados.length}</span>
              </h2>

              {resultados.length > 0 && (
                <Tabs
                  value={vista}
                  onValueChange={(v) => setVista(v as "cards" | "tabla")}
                  className="w-[200px]"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="cards">Tarjetas</TabsTrigger>
                    <TabsTrigger value="tabla">Tabla</TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
            </div>
          )}

          {/* Renderizado Condicional de Vistas */}
          {loading ? (
            <div className="py-20 text-center text-slate-400 animate-pulse">
              Cargando resultados...
            </div>
          ) : resultados.length > 0 ? (
            vista === "cards" ? (
              // VISTA DE TARJETAS
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resultados.map((clase, i) => (
                  <ClaseCard
                    key={`${clase.grupo}-${clase.clave}-${i}`}
                    data={clase}
                  />
                ))}
              </div>
            ) : (
              // VISTA DE TABLA
              <ClaseTable datos={resultados} />
            )
          ) : (
            busquedaRealizada && (
              <div className="py-20 text-center bg-white rounded-lg border border-dashed border-slate-300">
                <p className="text-slate-500">
                  No se encontraron grupos con esos criterios.
                </p>
                <Button
                  variant="link"
                  onClick={() => {
                    setSemInicio("");
                    setSemFin("");
                    setTurno("ambos");
                  }}
                >
                  Limpiar filtros
                </Button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
