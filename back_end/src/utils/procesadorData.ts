import { ordenarGruposCronologicamente } from "./horarioUtils";
import { infoGrupo } from "./grupoUtils";

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

  // 3. Ordenamiento
  if (query.ordenarAscendente !== undefined) {
    procesados = ordenarGruposCronologicamente(procesados, dia);
  }

  return procesados;
};
