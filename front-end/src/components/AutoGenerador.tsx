import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  Loader2,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HorarioCanvas } from "@/components/HorarioCanvas";
import { apiHorarios, type ResultadoGeneracion } from "@/services/api";
import { useHorarios } from "@/context/useHorarios";
import { DIAS } from "@/lib/horas";

interface Props {
  onClose: () => void;
}

export const AutoGenerador = ({ onClose }: Props) => {
  const { horarioActivo, cargarMateriasEnActivo } = useHorarios();

  const [disponibles, setDisponibles] = useState<
    { materia: string; grupos: number }[]
  >([]);
  const [busqueda, setBusqueda] = useState("");
  const [seleccionadas, setSeleccionadas] = useState<string[]>([]);

  const [inputProfesor, setInputProfesor] = useState("");
  const [profesores, setProfesores] = useState<string[]>([]);

  const [diasPreferentes, setDiasPreferentes] = useState<string[]>([]);
  const [restricciones, setRestricciones] = useState<
    { dia: string; horaMax: string }[]
  >([]);
  const [turno, setTurno] = useState<"" | "matutino" | "vespertino">("");
  const [permitirTraslapes, setPermitirTraslapes] = useState(false);

  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState("");
  const [resultado, setResultado] = useState<ResultadoGeneracion | null>(null);

  useEffect(() => {
    apiHorarios
      .materiasDisponibles()
      .then(setDisponibles)
      .catch(() => setError("No se pudo cargar la lista de materias."));
  }, []);

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return q
      ? disponibles.filter((m) => m.materia.toLowerCase().includes(q))
      : disponibles;
  }, [disponibles, busqueda]);

  const agregarProfesor = () => {
    const nombre = inputProfesor.trim();
    if (!nombre) return;
    setProfesores((prev) =>
      prev.some((p) => p.toLowerCase() === nombre.toLowerCase())
        ? prev
        : [...prev, nombre],
    );
    setInputProfesor("");
  };

  const toggleDia = (dia: string) =>
    setDiasPreferentes((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia],
    );

  const generar = async () => {
    if (seleccionadas.length === 0) {
      setError("Selecciona al menos una materia.");
      return;
    }
    setError("");
    setGenerando(true);
    setResultado(null);
    try {
      const res = await apiHorarios.autogenerar({
        materias: seleccionadas,
        profesoresPreferidos: profesores,
        diasPreferentes,
        restricciones,
        turnoPreferido: turno || undefined,
        permitirTraslapes,
        maxTraslapeMin: 20,
      });
      setResultado(res);
    } catch {
      setError("No se pudo generar el horario.");
    } finally {
      setGenerando(false);
    }
  };

  const usarHorario = () => {
    if (!resultado) return;
    cargarMateriasEnActivo(resultado.horario);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Cabecera */}
        <div className="px-6 py-4 border-b flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="bg-primary/10 text-primary rounded-full p-2">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-bold text-lg">Generador automático de horarios</h3>
              <p className="text-xs text-muted-foreground">
                Elige materias y preferencias: el generador busca la mejor
                combinación posible.
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {error && (
          <div className="px-6 py-2 bg-destructive/10 border-b border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-[380px_minmax(0,1fr)] overflow-auto">
          {/* Configuración */}
          <div className="p-5 space-y-5 border-r border-border">
            {/* Materias */}
            <div className="space-y-2">
              <Label className="font-semibold">
                Materias ({seleccionadas.length})
              </Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar materia..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="max-h-44 overflow-y-auto border rounded-lg divide-y divide-border">
                {filtradas.length === 0 && (
                  <p className="p-3 text-xs text-muted-foreground">
                    Sin resultados.
                  </p>
                )}
                {filtradas.map((m) => {
                  const activa = seleccionadas.includes(m.materia);
                  return (
                    <button
                      key={m.materia}
                      type="button"
                      onClick={() =>
                        setSeleccionadas((prev) =>
                          activa
                            ? prev.filter((s) => s !== m.materia)
                            : [...prev, m.materia],
                        )
                      }
                      className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 text-left text-xs transition-colors ${
                        activa
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted"
                      }`}
                    >
                      <span className="truncate">{m.materia}</span>
                      <span className="shrink-0 flex items-center gap-1.5">
                        <span className="text-[10px] text-muted-foreground">
                          {m.grupos} grupos
                        </span>
                        {activa && <Check className="h-3.5 w-3.5" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Profesores preferidos */}
            <div className="space-y-2">
              <Label className="font-semibold">Profesores preferidos</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Nombre del profesor (Enter para agregar)"
                  value={inputProfesor}
                  onChange={(e) => setInputProfesor(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && agregarProfesor()}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={agregarProfesor}
                  title="Agregar profesor"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {profesores.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {profesores.map((p) => (
                    <Badge key={p} variant="secondary" className="gap-1">
                      {p}
                      <button
                        onClick={() =>
                          setProfesores((prev) =>
                            prev.filter((x) => x !== p),
                          )
                        }
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Días preferentes */}
            <div className="space-y-2">
              <Label className="font-semibold">Días preferentes</Label>
              <div className="flex flex-wrap gap-1.5">
                {DIAS.map((dia) => {
                  const activo = diasPreferentes.includes(dia);
                  return (
                    <button
                      key={dia}
                      type="button"
                      onClick={() => toggleDia(dia)}
                      className={`px-2.5 py-1 rounded-md text-xs font-bold border transition-colors ${
                        activo
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-muted-foreground border-border hover:bg-muted"
                      }`}
                    >
                      {dia}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Restricciones por día */}
            <div className="space-y-2">
              <Label className="font-semibold">
                Sin clases después de (por día)
              </Label>
              <div className="space-y-1.5">
                {restricciones.map((r, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Select
                      value={r.dia}
                      onValueChange={(dia) =>
                        setRestricciones((prev) =>
                          prev.map((x, j) =>
                            j === i ? { ...x, dia } : x,
                          ),
                        )
                      }
                    >
                      <SelectTrigger className="w-24 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DIAS.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="time"
                      className="h-8 text-xs flex-1"
                      value={r.horaMax}
                      onChange={(e) =>
                        setRestricciones((prev) =>
                          prev.map((x, j) =>
                            j === i
                              ? { ...x, horaMax: e.target.value }
                              : x,
                          ),
                        )
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() =>
                        setRestricciones((prev) =>
                          prev.filter((_, j) => j !== i),
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() =>
                  setRestricciones((prev) => [
                    ...prev,
                    { dia: "VI", horaMax: "17:00" },
                  ])
                }
              >
                <Plus className="h-3.5 w-3.5" /> Agregar restricción
              </Button>
            </div>

            {/* Turno preferido */}
            <div className="space-y-2">
              <Label className="font-semibold">Turno preferido</Label>
              <Select
                value={turno === "" ? "ninguno" : turno}
                onValueChange={(v) =>
                  setTurno(
                    v === "ninguno" ? "" : (v as "matutino" | "vespertino"),
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin preferencia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ninguno">Sin preferencia</SelectItem>
                  <SelectItem value="matutino">Matutino</SelectItem>
                  <SelectItem value="vespertino">Vespertino</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Traslapes */}
            <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
              <div>
                <Label htmlFor="traslapes" className="font-semibold">
                  Permitir traslapes ≤ 20 min
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Útil cuando un profesor imparte materias consecutivas.
                </p>
              </div>
              <Switch
                id="traslapes"
                checked={permitirTraslapes}
                onCheckedChange={setPermitirTraslapes}
                className="data-[state=checked]:bg-amber-500"
              />
            </div>

            <Button
              size="lg"
              className="w-full font-bold"
              onClick={generar}
              disabled={generando}
            >
              {generando ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Generando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Generar horario
                </>
              )}
            </Button>
          </div>

          {/* Resultado */}
          <div className="p-5 space-y-4 min-w-0">
            {!resultado && (
              <div className="h-full min-h-64 grid place-items-center border border-dashed rounded-xl">
                <div className="text-center space-y-2 p-6">
                  <Sparkles className="h-8 w-8 mx-auto text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    Configura las preferencias y presiona{" "}
                    <b>Generar horario</b>.
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    El resultado mostrará aquí el mejor horario encontrado.
                  </p>
                </div>
              </div>
            )}

            {resultado && (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant={
                        resultado.materiasNoAsignadas.length === 0
                          ? "default"
                          : "secondary"
                      }
                    >
                      {resultado.materiasAsignadas} /{" "}
                      {resultado.materiasSolicitadas} materias asignadas
                    </Badge>
                    {resultado.traslapes.length > 0 && (
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {resultado.traslapes.length} traslape(s)
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {horarioActivo && horarioActivo.materias.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={usarHorario}
                      >
                        Reemplazar horario actual
                      </Button>
                    )}
                    <Button size="sm" onClick={usarHorario}>
                      Usar este horario
                    </Button>
                  </div>
                </div>

                <HorarioCanvas materias={resultado.horario} />

                {resultado.traslapes.length > 0 && (
                  <div className="rounded-xl border border-amber-300/60 bg-amber-50 dark:bg-amber-500/10 p-3 space-y-1.5">
                    <p className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Traslapes permitidos (≤ 20 min)
                    </p>
                    {resultado.traslapes.map((t, i) => (
                      <p key={i} className="text-xs text-muted-foreground">
                        {t.dias.join(", ")} · {t.materia}{" "}
                        <span className="text-muted-foreground/70">
                          [{t.grupo}]
                        </span>{" "}
                        vs {t.conMateria}{" "}
                        <span className="text-muted-foreground/70">
                          [{t.conGrupo}]
                        </span>{" "}
                        →{" "}
                        <b className="text-amber-700 dark:text-amber-400">
                          {t.minutos} min
                        </b>
                      </p>
                    ))}
                  </div>
                )}

                {resultado.materiasNoAsignadas.length > 0 && (
                  <div className="rounded-xl border border-red-300/60 bg-red-50 dark:bg-red-500/10 p-3">
                    <p className="text-xs font-bold text-red-700 dark:text-red-400 mb-1.5">
                      No se pudieron incluir:
                    </p>
                    <ul className="space-y-1">
                      {resultado.materiasNoAsignadas.map((m, i) => (
                        <li
                          key={i}
                          className="text-xs text-muted-foreground"
                        >
                          • {m.materia} — no hay grupo compatible con las
                          restricciones
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};