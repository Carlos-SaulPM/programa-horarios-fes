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