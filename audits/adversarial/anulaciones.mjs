// La regla 2 de D-032, hecha código.
//
//   "Anular a un auditor exige escribir por qué, y esa razón queda en el
//    historial."
//
// El historial es git. Por eso la anulación se escribe en un archivo del repo y
// se commitea: queda fechada, firmada y con el diff que la introdujo. Una
// anulación que solo vive en la cabeza de quien la decidió no es una anulación,
// es un olvido.
//
// Formato en ANULACIONES.md — legible por una persona y por este parser:
//
//   ### `auditor` · `ruta/del/archivo` · `CITA` · AAAA-MM-DD · quién
//
//   Razón: por qué este hallazgo no detiene el trabajo.
//
// La huella es `auditor · archivo · cita`. NO incluye el texto del hallazgo: el
// LLM lo redacta distinto cada vez, y una huella que cambia entre corridas
// dejaría de reconocer su propia anulación en la siguiente revisión.

import { readFileSync, existsSync } from "node:fs";

const ARCHIVO = new URL("./ANULACIONES.md", import.meta.url).pathname;

/**
 * La ruta se normaliza antes de entrar en la huella.
 *
 * El campo `archivo` que devuelve el modelo no siempre es una ruta: en una
 * corrida real llegó `"fonts.css, tokens.css"` —dos archivos en un campo— y
 * `"wrangler.toml (no incluido en el diff)"`. Con la ruta cruda, una anulación
 * escrita a mano nunca empareja con el hallazgo que pretende anular, y el
 * mecanismo entero queda roto sin avisar. Se toma el primer archivo y se le
 * quita la prosa, igual que para SARIF.
 */
export function normalizarRuta(archivo) {
  return String(archivo ?? "")
    .split(",")[0]
    .replace(/\s*\([^)]*\)\s*$/, "")
    .trim();
}

export function huella(auditorId, archivo, cita) {
  return `${auditorId}·${normalizarRuta(archivo)}·${cita}`;
}

/** Mapa huella → { fecha, quien, razon }. */
export function leerAnulaciones(ruta = ARCHIVO) {
  if (!existsSync(ruta)) return new Map();
  const texto = readFileSync(ruta, "utf8");
  const mapa = new Map();

  const encabezado = /^### `([^`]+)` · `([^`]+)` · `([^`]+)` · (\d{4}-\d{2}-\d{2}) · (.+)$/gm;
  for (const m of texto.matchAll(encabezado)) {
    const [, auditor, archivo, cita, fecha, quien] = m;
    const cuerpo = texto.slice(m.index + m[0].length);
    const razon = cuerpo.match(/^\s*Razón:\s*([\s\S]*?)(?=\n### |\n## |$)/)?.[1]?.trim() ?? "";

    // Fallar cerrado: una anulación sin razón escrita no anula nada. Si se
    // aceptara vacía, la regla 2 se cumpliría escribiendo un encabezado.
    if (razon.length < 20) continue;

    mapa.set(huella(auditor, archivo, cita), { fecha, quien: quien.trim(), razon });
  }
  return mapa;
}

/** Encabezado listo para pegar, cuando alguien decide anular un hallazgo. */
export function plantilla(hallazgo, hoy) {
  return [
    "### `" + hallazgo.auditor + "` · `" + hallazgo.archivo + "` · `" + hallazgo.cita_id + "` · " + hoy + " · TU-NOMBRE",
    "",
    "Razón: (mínimo 20 caracteres — explica por qué este hallazgo no detiene el",
    "trabajo. Lo que se lea aquí dentro de un año es todo lo que va a quedar.)",
  ].join("\n");
}
