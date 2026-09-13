import type { Clase, HorarioGuardado } from "@/types";
import { DIAS, getHorasDeDia, ordenarPorHora } from "@/lib/horas";

const escapeHtml = (texto: string): string =>
  texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const filaMateria = (clase: Clase): string => {
  const celdaDia = (dia: string): string => {
    const hora = getHorasDeDia(clase.horario, dia as (typeof DIAS)[number]);
    return hora ? `<span class="hora">${hora}</span>` : `<span class="vacio"></span>`;
  };

  return `<tr>
    <td>${escapeHtml(clase.clave)}</td>
    <td><strong>${escapeHtml(clase.grupo)}</strong></td>
    <td>${escapeHtml(clase.materia)}</td>
    <td>${escapeHtml(clase.profesor ?? "")}</td>
    <td>${escapeHtml(clase.salon ?? "")}</td>
    ${DIAS.map((d) => `<td>${celdaDia(d)}</td>`).join("")}
  </tr>`;
};

export const abrirImpresionHorario = (horario: HorarioGuardado): void => {
  const ventana = window.open("", "_blank", "width=1000,height=700");
  if (!ventana) return;

  const materias = ordenarPorHora(horario.materias);
  const cuerpoTabla = materias.map(filaMateria).join("");

  ventana.document.write(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8" />
      <title>${escapeHtml(horario.nombre)}</title>
      <style>
        body { font-family: system-ui, sans-serif; padding: 24px; color: #1e293b; }
        h1 { font-size: 20px; margin: 0 0 4px; }
        .sub { color: #64748b; font-size: 12px; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
        th { background: #f1f5f9; text-transform: uppercase; font-size: 10px; }
        .hora { display: block; }
        .vacio { display: block; }
        tr { break-inside: avoid; }
        @media print {
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>Creador de Horarios FES Aragon</h1>
      <div class="sub">${escapeHtml(horario.nombre)} &middot; ${horario.materias.length} materias</div>
      <table>
        <thead>
          <tr>
            <th>Clave</th><th>Grupo</th><th>Materia</th><th>Profesor</th><th>Salon</th>
            ${DIAS.map((d) => `<th>${d}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${cuerpoTabla}
        </tbody>
      </table>
      <script>window.onload = function(){ setTimeout(function(){ window.print(); }, 250); }</script>
    </body>
    </html>
  `);
  ventana.document.close();
};