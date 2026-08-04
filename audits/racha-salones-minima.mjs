#!/usr/bin/env node
// Auditor determinista — la consulta de grupo no devuelve más que alias,
// puntos y `current_streak` (F7 · #208)
//
// Hace cumplir: #208 (criterios literales: columnas nombradas, solo
// `current_streak`, nunca `max_streak`/escudos/pausas, la racha no ordena),
// D-025 (la racha no ordena), D-044 y mc-46 §6 (el dueño ve alias, puntos y
// racha — nada más).
//
// Por qué existe. El roster del dueño de un salón o club de papás es la
// consulta que más datos de menores pone delante de un adulto sin verificar.
// Las cuatro formas de que se pase, ninguna visible como error:
//
//   1. **`SELECT *`** — añadir una columna a `child_streak` la publica al
//      grupo el día que alguien la cree, sin que nadie lo decida.
//   2. **Una columna de presencia en el SELECT** — `max_streak` (la mejor
//      marca personal del niño, #208 la prohíbe por nombre y D-106 extendió
//      la misma regla a la liga), los escudos, o cualquier campo de pausa
//      («este niño está de viaje / enfermo» dicho a 35 familias).
//   3. **El filtro de `status = 'approved'` quitado** — un niño removido
//      siguiendo expuesto: la revocación que no corta es la revocación que
//      no existe (patrón `household_devices.revoked_at`).
//   4. **La racha ordenando** — un `ORDER BY ... streak` o un `.sort()` por
//      racha convierte la lista informativa en un ranking de constancia, que
//      es exactamente lo que D-025 prohíbe.
//
// Cómo comprueba: lee `apps/web/src/lib/grupo-roster.ts` y lo contrasta con
// la tabla de precondiciones ESCRITA A MANO de abajo — no importada del
// módulo que juzga, porque un auditor que juzga con la misma lista que el
// código usa para decidir no puede fallar nunca (D-070).
//
// LO QUE NO PUEDE COMPROBAR: que la pantalla que algún día pinte este roster
// no añada columnas por su cuenta — la proyección de la interfaz será otro
// auditor cuando la superficie exista. Tampoco el `adult_club` de F10: su
// tabla no existe todavía, y cuando aterrice esta consulta NO se reutiliza
// sobre ella sin releer mc-46 §7 (dos estructuras separadas a propósito).

import { leer, sinComentarios, informar, existe } from "./lib/repo.mjs";

const MODULO = "apps/web/src/lib/grupo-roster.ts";

/**
 * Las columnas de `child_streak` que NINGUNA consulta de grupo puede nombrar,
 * reescritas a mano desde #208 (criterio de aceptación literal) y la 0007.
 * Son identificadores ASCII, así que `\b` alcanza — la trampa del `\b` ASCII
 * es de los léxicos en español con acentos, no de nombres de columna.
 */
const PROHIBIDAS = [
  ["max_streak", "la mejor marca personal del niño — #208 la excluye por nombre"],
  ["shields_available", "los escudos disponibles"],
  ["shields_earned_total", "el acumulado de escudos"],
  ["pause_until_local_date", "la pausa vigente — presencia del menor"],
  ["pause_uses_this_year", "el conteo de pausas del año"],
  ["pause_year", "el año del conteo de pausas"],
];

const problemas = [];
const notas = [];

if (!existe(MODULO)) {
  problemas.push(`${MODULO} no existe — este auditor vigila la consulta del roster del grupo (#208)`);
}

const crudo = leer(MODULO) ?? "";
const texto = sinComentarios(crudo);

// ─── 1. Nunca SELECT * ──────────────────────────────────────────────────────
if (/\bSELECT\s+\*/i.test(texto)) {
  problemas.push(
    `${MODULO}: hay un \`SELECT *\`. #208 lo prohíbe literal: columnas NOMBRADAS, siempre — ` +
      "con `*`, la próxima columna que alguien añada a `child_streak` se publica al grupo " +
      "entero sin que nadie lo decida.",
  );
}

// ─── 2. Ninguna columna prohibida aparece en el módulo ──────────────────────
//
// Fuera de comentarios: el módulo tiene que poder EXPLICAR por qué no las
// selecciona sin que explicarlo cuente como seleccionarlas. Si el nombre no
// está en el código, no hay consulta que la devuelva — es la forma más barata
// de que «solo current_streak» sea verdad.
for (const [columna, que] of PROHIBIDAS) {
  if (new RegExp(`\\b${columna}\\b`).test(texto)) {
    problemas.push(
      `${MODULO}: nombra \`${columna}\` — ${que}. #208: de \`child_streak\` sale EXACTAMENTE ` +
        "`current_streak` por esta vía; todo lo demás es información de presencia del menor " +
        "que el grupo no necesita (la misma regla que D-106 aplicó a la liga).",
    );
  }
}

// ─── 3. La racha SÍ sale, nombrada ──────────────────────────────────────────
if (!/\bcurrent_streak\b/.test(texto)) {
  problemas.push(
    `${MODULO}: no nombra \`current_streak\` — sin ella la consulta no cumple el «junto al ` +
      "alias y los puntos, únicamente current_streak» de #208. ¿Cambió de nombre la columna " +
      "o desapareció la proyección?",
  );
}

// ─── 4. El filtro de membresía vigente vive en el WHERE ─────────────────────
//
// La forma `IN ('approved')` y no `= 'approved'` es deliberada — ver el
// módulo: `grupo-aprobacion-padre` vigila la ESCRITURA de aprobaciones, y un
// filtro de lectura no tiene por qué parecer una. Lo que este auditor exige
// es el FILTRO, no la forma: cualquiera de las dos sirve.
if (!/m\.status\s*(?:=\s*'approved'|IN\s*\('approved'\))/.test(texto)) {
  problemas.push(
    `${MODULO}: la consulta no filtra \`status = 'approved'\`. Sin ese filtro, un niño ` +
      "pendiente, rechazado o REMOVIDO sigue exponiendo su racha al grupo — la revocación " +
      "deja de cortar y #208 la exige inmediata (el patrón de `household_devices.revoked_at`).",
  );
}

// ─── 5. La racha NO ordena (D-025) ──────────────────────────────────────────
//
// Sin `\b` delante de «streak»: en `current_streak` el guion bajo es carácter
// de palabra, así que `\bstreak\b` NO la encuentra — el mismo pozo que el
// `\b` ASCII con los acentos, dentro de un identificador.
if (/ORDER\s+BY[^;]*streak/i.test(texto)) {
  problemas.push(
    `${MODULO}: un ORDER BY ordena por la racha. D-025: la racha no ordena ningún tablero, ` +
      "y #208 fija que esta vía es solo lectura informativa — no participa en NINGÚN " +
      "ordenamiento del salón o club.",
  );
}
if (/\.sort\s*\(/.test(texto)) {
  problemas.push(
    `${MODULO}: hay un \`.sort()\`. El orden del roster es el neutro del SQL (por alias) — ` +
      "un sort en el módulo es el lugar donde alguien reordena por racha o por puntos sin " +
      "que el SQL lo delate.",
  );
}

// ─── 6. La autorización por dueño está en el módulo ─────────────────────────
if (!/owner_user_id\s*=\s*\?/.test(texto)) {
  problemas.push(
    `${MODULO}: no se encontró la comprobación \`owner_user_id = ?\`. Sin ella, cualquier ` +
      "adulto con el id de un grupo lee el roster de los hijos de otros — línea roja #2 en " +
      "su forma de grupo, y el mismo candado que `hijoDelPadre`.",
  );
}

informar({
  nombre: "racha-salones-minima",
  problemas,
  notas,
  revisados: 1,
  resumen: "la consulta del grupo expone alias, puntos y current_streak — y nada más",
  cita: "#208, D-025, D-044, D-106, mc-46 §6",
  porQueBloquea:
    "El roster del dueño es la consulta que más datos de menores pone delante de un adulto " +
    "sin verificar. Que de `child_streak` salga exactamente `current_streak`, que la " +
    "revocación corte en el WHERE y que la racha no ordene no se confía a que cada cambio " +
    "lo recuerde: se comprueba en cada commit.",
});
