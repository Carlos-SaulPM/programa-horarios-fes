import dataInterna from "./horarios.json";
import dataExterna from "./materias_externas_coincidentes.json";

const horariosInternos = new Map(Object.entries(dataInterna));

// 2. Aplanamos los horarios externos para facilitar la búsqueda
// Estructura resultante: Map<Grupo, Clases[]> pero inyectando el nombre de la carrera origen
const mapaExterno = new Map();

Object.entries(dataExterna).forEach(([nombreCarrera, gruposObj]) => {
  Object.entries(gruposObj as Record<string, any[]>).forEach(
    ([grupo, clases]) => {
      // Inyectamos el origen en cada clase para saber de dónde viene
      const clasesConOrigen = clases.map((clase) => ({
        ...clase,
        origen: nombreCarrera, // Ej: "Ingeniería Civil"
        esExterno: true, // Flag útil para el frontend
      }));

      // Guardamos en el mapa. Nota: Si un grupo se repite entre carreras (raro pero posible),
      // se sobrescribiría. Para evitarlo, podrías usar una clave compuesta,
      // pero para búsqueda simple esto suele bastar.
      mapaExterno.set(grupo, clasesConOrigen);
    },
  );
});

const horariosExternos = mapaExterno;

export default { horariosInternos, horariosExternos };
