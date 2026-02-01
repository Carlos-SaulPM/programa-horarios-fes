export const infoGrupo = (nombreGrupo: string | number) => {
  // Forzamos string y limpiamos espacios
  const g = nombreGrupo.toString().trim();

  // Validación de seguridad: Si tiene menos de 4 dígitos, algo anda mal
  if (g.length < 3)
    return { periodo: 0, semestre: 0, turno: 0, consecutivo: "0" };

  return {
    periodo: parseInt(g[0]),
    semestre: parseInt(g[1]),
    // OJO AQUÍ: Asegúrate que el índice sea 2 (el tercer caracter)
    turno: parseInt(g[2]),
    consecutivo: g.substring(3),
  };
};
