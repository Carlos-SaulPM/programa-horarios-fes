import { ordenarGruposCronologicamente } from "./horarioUtils";
import { infoGrupo } from "./grupoUtils";

const DIAS_VALIDOS = ["LU", "MA", "MI", "JU", "VI", "SA"];

const diasActivosDeClase = (clase: any): string[] =>
  DIAS_VALIDOS.filter((dia) => clase.horario?.[dia] !== undefined && clase.horario[dia] !== "");

const mismosDias = (a: string[], b: string[]): boolean => {
  if (a.length !== b.length) return false;
  const ordenadosA = [...a].sort();
  const ordenadosB = [...b].sort();
  return ordenadosA.every((dia, i) => dia === ordenadosB[i]);
};

// En utils/procesadorData.ts
export const aplicarPreferenciaUsuario = (
  resultados: any[],
  query: any,
  dia?: string,
) => {
  let procesados = [...resultados];

  if (query.turno) {
    // Limpieza agresiva del query param
    const turnoSolicitado = (query.turno as string).trim().toLowerCase();

    procesados = procesados.filter((item) => {
      const { turno } = infoGrupo(item.grupo);

      // Validación explicita de NaN
      if (isNaN(turno)) return false;

      if (turnoSolicitado === "matutino") return turno < 5;
      if (turnoSolicitado === "vespertino") return turno >= 5;

      return true;
    });
  }

  // 2. Filtro por Rango de Semestres (Existente)
  const { semestre_inicial, semestre_final } = query;
  if (semestre_inicial || semestre_final) {
    const min = parseInt(semestre_inicial) || 1;
    const max = parseInt(semestre_final) || 9;

    procesados = procesados.filter((item) => {
      const { semestre } = infoGrupo(item.grupo);
      const semestreValido = semestre === 0 ? 10 : semestre;
      return semestreValido >= min && semestreValido <= max;
    });
  }

  // 2.5 Filtro por Días Exactos
  if (query.dias) {
    const diasSolicitados = (query.dias as string)
      .split(",")
      .map((d) => d.trim().toUpperCase())
      .filter((d) => DIAS_VALIDOS.includes(d));

    if (diasSolicitados.length > 0) {
      procesados = procesados.filter((item) =>
        mismosDias(diasActivosDeClase(item), diasSolicitados),
      );
    }
  }

  // 3. Ordenamiento
  if (query.ordenarAscendente !== undefined) {
    procesados = ordenarGruposCronologicamente(procesados, dia);
  }

  return procesados;
};
