export const formatearHora = (hora: string): string => {
  if (!hora) return "23:59";
  const [h, m] = hora.split(":");
  return `${h.padStart(2, "0")}:${m}`;
};

export const obtenerHoraMinima = (
  horario: any,
  diaEspecifico?: string,
): string => {
  if (diaEspecifico) {
    const horaDia = horario[diaEspecifico.toUpperCase()];
    return horaDia ? formatearHora(horaDia.split("-")[0]) : "23:59";
  }

  const horas = Object.values(horario)
    .filter((v) => v !== "")
    .map((v) => (v as string).split("-")[0])
    .map(formatearHora);

  return horas.length ? horas.sort()[0] : "23:59";
};

export const ordenarGruposCronologicamente = (
  grupos: any[],
  dia?: string,
): any[] => {
  return [...grupos].sort((a, b) => {
    const horaA = obtenerHoraMinima(a.horario, dia);
    const horaB = obtenerHoraMinima(b.horario, dia);
    return horaA.localeCompare(horaB);
  });
};

export const buscarEnMapa = (
  mapa: Map<string, any[]>,
  criterio: (clases: any[], grupo: string) => any[],
) => {
  let resultados: any[] = [];
  mapa.forEach((clases, grupo) => {
    const coincidencias = criterio(clases, grupo);
    if (coincidencias.length > 0) {
      resultados.push(...coincidencias);
    }
  });
  return resultados;
};

const horasAMinutos = (hora: string): number => {
  const [h, m] = hora.split(":").map((n) => parseInt(n));
  return h! * 60 + m!;
};

const rangoDeDia = (clase: any, dia: string) => {
  const rango = clase.horario?.[dia];
  if (!rango || rango === "") return null;
  const [ini, fin] = rango.split("-");
  return { inicio: horasAMinutos(ini), fin: horasAMinutos(fin) };
};

const rangosTraslapan = (a: { inicio: number; fin: number }, b: { inicio: number; fin: number }) =>
  a.inicio < b.fin && b.inicio < a.fin && a.fin > a.inicio && b.fin > b.inicio;

export const traslapaConAlguna = (
  materias: any[],
  nueva: any,
  excluirIndex?: number,
): { dia: string; materia: any } | null => {
  for (let i = 0; i < materias.length; i++) {
    if (i === excluirIndex) continue;
    for (const dia of ["LU", "MA", "MI", "JU", "VI", "SA"]) {
      const rangoA = rangoDeDia(materias[i], dia);
      const rangoB = rangoDeDia(nueva, dia);
      if (rangoA && rangoB && rangosTraslapan(rangoA, rangoB)) {
        return { dia, materia: materias[i] };
      }
    }
  }
  return null;
};
