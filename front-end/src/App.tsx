import { useState } from "react";
import { AlertTriangle, Sparkles } from "lucide-react";
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
import { ClaseTable } from "@/components/ClaseTable";
import { HorarioSelector } from "@/components/HorarioSelector";
import { HorarioCanvas } from "@/components/HorarioCanvas";
import { ListaMaterias } from "@/components/ListaMaterias";
import { ReemplazosModal } from "@/components/ReemplazosModal";
import { ConflictoModal } from "@/components/ConflictoModal";
import { AutoGenerador } from "@/components/AutoGenerador";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useHorarios } from "@/context/useHorarios";
import { abrirImpresionHorario } from "@/lib/imprimirHorario";
import { DIAS, type Dia } from "@/lib/horas";
import type { Clase } from "@/types";
import type { ConflictoDetalle } from "@/context/horariosContext";

function App() {
const {
    horarioActivo: horario,
    cargando: cargandoHorarios,
    agregarMateria,
    agregarMateriaForzada,
    eliminarMateria,
    reemplazarMateria,
    estaSeleccionada,
  } = useHorarios();

  const [modo, setModo] = useState<
    "profesor" | "rango" | "materia" | "virtual"
  >("profesor");
  const [resultados, setResultados] = useState<Clase[]>([]);
  const [loading, setLoading] = useState(false);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);
  const [vista, setVista] = useState<"cards" | "tabla">("cards");

  const [queryProfesor, setQueryProfesor] = useState("");
  const [queryMateria, setQueryMateria] = useState("");

  const [dia, setDia] = useState("LU");
  const [horaInicio, setHoraInicio] = useState("07:00");
  const [horaFin, setHoraFin] = useState("22:00");

  const [ordenar, setOrdenar] = useState(false);
  const [incluirExternas, setIncluirExternas] = useState(false);
  const [diasSeleccionados, setDiasSeleccionados] = useState<Dia[]>([]);
  const [semInicio, setSemInicio] = useState("");
  const [semFin, setSemFin] = useState("");
  const [turno, setTurno] = useState("ambos");

  const [error, setError] = useState("");
  const [reemplazoIndex, setReemplazoIndex] = useState<number | null>(null);
  const [conflictoPendiente, setConflictoPendiente] = useState<{
    clase: Clase;
    detalle: ConflictoDetalle;
  } | null>(null);
  const [generadorAbierto, setGeneradorAbierto] = useState(false);

  const buscar = async () => {
    setLoading(true);
    setResultados([]);
    setBusquedaRealizada(true);
    setError("");

    const params = new URLSearchParams();
    if (ordenar) params.append("ordenarAscendente", "true");
    if (semInicio) params.append("semestre_inicial", semInicio);
    if (semFin) params.append("semestre_final", semFin);
    if (turno !== "ambos") params.append("turno", turno);
    if (incluirExternas) params.append("incluir_externas", "true");
    if (diasSeleccionados.length > 0)
      params.append("dias", diasSeleccionados.join(","));

    try {
      let url = "";
      let options: RequestInit = {};

      if (modo === "profesor") {
        url = `http://localhost:3000/grupos/profesor?${params.toString()}`;
        options = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profesor: queryProfesor }),
        };
      } else if (modo === "materia") {
        url = `http://localhost:3000/grupos/materia?${params.toString()}`;
        options = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ materia: queryMateria }),
        };
      } else if (modo === "virtual") {
        url = `http://localhost:3000/grupos/virtuales?${params.toString()}`;
        options = { method: "GET" };
      } else {
        params.append("hora_inicio", horaInicio);
        params.append("hora_limite", horaFin);
        url = `http://localhost:3000/grupos/rango/${dia}?${params.toString()}`;
        options = { method: "GET" };
      }

      const res = await fetch(url, options);
      if (!res.ok) throw new Error("Error en la petición");
      const data = await res.json();
      setResultados(data);
    } catch {
      setError("Hubo un error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const alClicClase = (clase: Clase) => {
    if (!horario) {
      setError("Crea o selecciona un horario primero.");
      return;
    }
    const resultado = agregarMateria(clase);
    if (resultado.exito) {
      setError("");
    } else if (resultado.conflicto) {
      setConflictoPendiente({ clase, detalle: resultado.conflicto });
    } else if (resultado.duplicado) {
      setError("Esta materia ya está en el horario.");
    }
  };

  if (cargandoHorarios) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <p className="text-muted-foreground animate-pulse">Cargando horarios...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              Creador de Horarios FES
            </h1>
            <p className="text-muted-foreground text-sm">
              Arma tu horario sin traslapes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              onClick={() => setGeneradorAbierto(true)}
              className="gap-1.5 font-semibold"
            >
              <Sparkles className="h-4 w-4" />
              Generador
            </Button>
            <ThemeToggle />
            <HorarioSelector />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-2 rounded-lg">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-[minmax(0,1fr)_400px] gap-6 items-start">
          {/* Panel izquierdo: búsqueda y resultados */}
          <div className="space-y-4 min-w-0">
            <div className="bg-card p-5 rounded-xl shadow-sm border space-y-4">
              <div className="flex space-x-2 border-b pb-3 overflow-x-auto">
                {(["profesor", "materia", "rango", "virtual"] as const).map(
                  (m) => (
                    <Button
                      key={m}
                      variant={modo === m ? "default" : "ghost"}
                      onClick={() => setModo(m)}
                      className="text-sm whitespace-nowrap"
                    >
                      {m === "profesor"
                        ? "Por Profesor"
                        : m === "materia"
                          ? "Por Materia"
                          : m === "rango"
                            ? "Por Horario Libre"
                            : "Salón Virtual"}
                    </Button>
                  ),
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                {modo === "profesor" && (
                  <div className="md:col-span-2 space-y-2">
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
                )}

                {modo === "materia" && (
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-sm font-medium">
                      Nombre de la Materia
                    </Label>
                    <Input
                      placeholder="Ej: Calculo Diferencial"
                      value={queryMateria}
                      onChange={(e) => setQueryMateria(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && buscar()}
                    />
                  </div>
                )}

                {modo === "virtual" && (
                  <p className="md:col-span-2 text-sm text-muted-foreground">
                    Se mostrarán todas las materias que se imparten en salón
                    virtual. Aplica los filtros de semestre y turno si lo
                    deseas.
                  </p>
                )}

                {modo === "rango" && (
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
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Hora Inicio</Label>
                        <Input
                          type="time"
                          value={horaInicio}
                          onChange={(e) => setHoraInicio(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Hora Limite</Label>
                        <Input
                          type="time"
                          value={horaFin}
                          onChange={(e) => setHoraFin(e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}

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

                <div className="space-y-2">
                  <Label>Turno</Label>
                  <Select value={turno} onValueChange={setTurno}>
                    <SelectTrigger>
                      <SelectValue placeholder="Turno" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ambos">Todos</SelectItem>
                      <SelectItem value="matutino">
                        Matutino (Mañana)
                      </SelectItem>
                      <SelectItem value="vespertino">
                        Vespertino (Tarde)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  size="lg"
                  onClick={buscar}
                  disabled={loading}
                  className="w-full font-bold"
                >
                  {loading ? "Buscando..." : "Buscar Horarios"}
                </Button>
              </div>

              <div className="flex flex-wrap gap-4 pt-1">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="ordenar"
                    checked={ordenar}
                    onCheckedChange={setOrdenar}
                  />
                  <Label htmlFor="ordenar" className="cursor-pointer">
                    Ordenar por hora más temprana
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="externas"
                    checked={incluirExternas}
                    onCheckedChange={setIncluirExternas}
                    className="data-[state=checked]:bg-emerald-600"
                  />
                  <Label
                    htmlFor="externas"
                    className="cursor-pointer text-emerald-600 dark:text-emerald-400 font-medium"
                  >
                    Incluir materias de otras carreras
                  </Label>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t pt-4">
                <span className="text-sm font-medium text-muted-foreground">
                  Días:
                </span>
                {DIAS.map((dia) => {
                  const activo = diasSeleccionados.includes(dia);
                  return (
                    <button
                      key={dia}
                      type="button"
                      onClick={() =>
                        setDiasSeleccionados((prev) =>
                          activo
                            ? prev.filter((d) => d !== dia)
                            : [...prev, dia],
                        )
                      }
                      className={`px-3 py-1 rounded-full border text-sm font-semibold transition-colors ${
                        activo
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-transparent text-muted-foreground border-border hover:bg-muted"
                      }`}
                    >
                      {dia}
                    </button>
                  );
                })}
                {diasSeleccionados.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setDiasSeleccionados([])}
                    className="text-xs text-muted-foreground underline hover:text-foreground"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                  Resultados:{" "}
                  <span className="text-primary">{resultados.length}</span>
                  <span className="text-xs ml-2 text-muted-foreground font-normal">
                    (Click en una card para agregar al horario)
                  </span>
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

              {loading ? (
                <div className="py-16 text-center text-muted-foreground animate-pulse">
                  Cargando resultados...
                </div>
              ) : resultados.length > 0 ? (
                vista === "cards" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {resultados.map((clase, i) => (
                      <ClaseCard
                        key={`${clase.grupo}-${clase.clave}-${i}`}
                        data={clase}
                        seleccionada={estaSeleccionada(clase)}
                        onClick={() => alClicClase(clase)}
                      />
                    ))}
                  </div>
                ) : (
                  <ClaseTable datos={resultados} seleccionadas={estaSeleccionada} />
                )
              ) : (
                busquedaRealizada && (
                  <div className="py-16 text-center bg-card rounded-lg border border-dashed border-border">
                    <p className="text-muted-foreground">
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

          {/* Panel derecho: creador de horario */}
          <div className="lg:sticky lg:top-4 space-y-4">
            <div className="bg-card p-4 rounded-xl shadow-sm border">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3">
                Mi Horario ({horario?.materias.length ?? 0} materias)
              </h2>
              {horario ? (
                horario.materias.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-6 text-center border border-dashed rounded-lg">
                    Agrega materias desde la búsqueda
                  </p>
                ) : (
                  <HorarioCanvas materias={horario.materias} />
                )
              ) : (
                <p className="text-sm text-muted-foreground py-6 text-center border border-dashed rounded-lg">
                  Crea un horario para comenzar
                </p>
              )}
            </div>

            <div className="bg-card p-4 rounded-xl shadow-sm border">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3">
                Lista de materias
              </h2>
              {horario && horario.materias.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mb-3"
                  onClick={() => abrirImpresionHorario(horario)}
                >
                  Exportar / Imprimir (PDF)
                </Button>
              )}
              {horario && horario.materias.length > 0 ? (
                <ListaMaterias
                  materias={horario.materias}
                  onEliminar={(i) => eliminarMateria(i)}
                  onReemplazar={setReemplazoIndex}
                />
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">
                  Tu horario está vacío
                </p>
              )}
            </div>
          </div>
        </div>

        {reemplazoIndex !== null && horario && (
          <ReemplazosModal
            horarioId={horario.id}
            index={reemplazoIndex}
            incluirExternas={incluirExternas}
            onClose={() => setReemplazoIndex(null)}
            onSeleccionar={(nueva) => {
              const ok = reemplazarMateria(reemplazoIndex, nueva);
              setError(
                ok ? "" : "No se pudo reemplazar: hay un traslape.",
              );
              setReemplazoIndex(null);
            }}
          />
        )}

        {generadorAbierto && (
          <AutoGenerador onClose={() => setGeneradorAbierto(false)} />
        )}

        {conflictoPendiente && (
          <ConflictoModal
            nueva={conflictoPendiente.clase}
            conflicto={conflictoPendiente.detalle}
            onConfirmar={() => {
              agregarMateriaForzada(conflictoPendiente.clase);
              setConflictoPendiente(null);
              setError("");
            }}
            onCancelar={() => setConflictoPendiente(null)}
          />
        )}
      </div>
    </div>
  );
}

export default App;