// Lo que todos los auditores deterministas necesitan: ver el repo entero.
//
// Por qué existe. Cada auditor traía su propia copia de este bloque, y una de
// esas copias tenía un fallo real: `git diff HEAD` y `git ls-files` **no ven
// archivos sin rastrear**, así que un archivo recién creado —justo el que un
// auditor debería mirar con más cuidado— era invisible. Pasó dos veces, en
// `secrets.mjs` y en la flota adversarial.
//
// La lista correcta es `--cached --others --exclude-standard`: lo rastreado más
// lo nuevo, menos lo ignorado. Un solo lugar donde equivocarse, y ya no está
// equivocado.

import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";

export const RAIZ = new URL("../..", import.meta.url).pathname;

const EXCLUIDO = /^(node_modules|dist|\.astro|\.wrangler|coverage)\//;

/**
 * Los archivos del repo que coinciden con un patrón.
 *
 * @param {RegExp} patron
 * @param {{ incluirAuditores?: boolean }} [opciones]
 */
export function archivos(patron, opciones = {}) {
  const salida = execFileSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard"],
    { cwd: RAIZ, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 },
  );

  return salida
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((f) => !EXCLUIDO.test(f))
    // Un auditor que se lee a sí mismo se encuentra la cadena que busca y se
    // reporta. Es la falsa alarma más tonta posible y la más fácil de evitar.
    .filter((f) => opciones.incluirAuditores || !f.startsWith("audits/"))
    .filter((f) => patron.test(f));
}

/**
 * Solo el código de PRODUCTO: la aplicación, los workers y el esquema.
 *
 * Por qué hace falta. `sin-penalizacion` marcó, en su primera corrida, una
 * cadena de `scripts/detallar-proyecto.mjs` que **describe** la regla: el texto
 * de un criterio de aceptación que dice "penalización por cambio o conteo de
 * borrados". Bloqueó el commit por citar la línea roja que hace cumplir.
 *
 * Un auditor con esa clase de falso positivo se apaga a la semana, y entonces no
 * vigila nada. Las reglas de producto se hacen cumplir sobre el producto; la
 * herramienta que documenta las reglas tiene que poder nombrarlas.
 */
export const SOLO_PRODUCTO = /^(apps\/|workers\/|packages\/|migrations\/)/;

/**
 * Una alternancia de palabras con frontera que SÍ entiende el guion bajo.
 *
 * `\b` no lo hace. Para JavaScript, `_` es un carácter de palabra, así que
 * `/\bkinder\b/` **no** encuentra `KINDER_PLACEMENT_REQUIRED` — no hay frontera
 * entre `KINDER` y `_`. Y el código real está lleno de `SCREAMING_SNAKE_CASE` y
 * `snake_case`: es justo donde viven las constantes de configuración, que es
 * justo lo que estos auditores tienen que atrapar.
 *
 * Lo descubrió el arnés de pruebas: `kinder-sin-examen` pasaba en verde con
 * `export const KINDER_PLACEMENT_REQUIRED = true` delante.
 *
 *   palabra("kinder", "preescolar")  →  /(?<![a-z0-9])(kinder|preescolar)(?![a-z0-9])/i
 */
export function palabra(...alternativas) {
  return new RegExp(`(?<![a-z0-9])(?:${alternativas.join("|")})(?![a-z0-9])`, "i");
}

/** Lee un archivo del repo, o `null` si no se puede. */
export function leer(archivo) {
  try {
    return readFileSync(`${RAIZ}${archivo}`, "utf8");
  } catch {
    return null;
  }
}

export function existe(archivo) {
  return existsSync(`${RAIZ}${archivo}`);
}

/**
 * Informe estándar de un auditor.
 *
 * Sale con 1 si hay problemas. Y **sale con 1 si no miró nada**: un escáner que
 * no encuentra archivos aprueba siempre, y "verde" tiene que significar "miré y
 * está bien", nunca "no miré".
 *
 * @param {object} params
 * @param {string} params.nombre
 * @param {string[]} params.problemas
 * @param {string[]} [params.notas]      líneas informativas cuando pasa
 * @param {string} params.cita           las decisiones que hace cumplir (regla 1 de D-032)
 * @param {number} params.revisados      cuántos archivos se miraron
 * @param {string} params.resumen        qué se revisó, en una línea
 * @param {string} [params.porQueBloquea]
 * @param {string[]} [params.noComprueba] lo que este auditor NO puede ver
 */
export function informar({ nombre, problemas, notas = [], cita, revisados, resumen, porQueBloquea, noComprueba = [] }) {
  if (revisados === 0) {
    console.error(`✗ ${nombre} — 0 archivos revisados.`);
    console.error("  Un escáner que no ve nada aprueba siempre, así que esto es un fallo,");
    console.error("  no un pase. Revisa el patrón de archivos.");
    process.exit(1);
  }

  if (problemas.length > 0) {
    console.error(`✗ ${nombre}\n`);
    for (const p of problemas) console.error(`  · ${p}`);
    console.error(`\n  Hace cumplir: ${cita}`);
    if (porQueBloquea) {
      console.error(`  Por qué bloquea: ${porQueBloquea}`);
    }
    process.exit(1);
  }

  console.log(`✓ ${nombre} — ${resumen}`);
  for (const n of notas) console.log(`  · ${n}`);
  for (const n of noComprueba) console.log(`  · NO comprobado aquí: ${n}`);
}

/**
 * Superficies donde puede haber un niño.
 *
 * Se listan de antemano, antes de que existan: un guardián escrito después del
 * código que debía vigilar llega tarde. Copiado de `telemetria-infantil.mjs`,
 * que fue el primero en necesitarlas.
 */
export const SUPERFICIES_DE_NINO = [
  /\/(kinder|primaria|nino|nina|child|kid)/i,
  /\/(reto|retos|challenge|practica|practice|juego|play)/i,
  /(Kinder|Primaria|Child|Reto|Challenge|Practica)[A-Z]?[a-z]*\.(astro|tsx|jsx|ts|js|svelte|vue)$/,
];

export const esDeNino = (ruta) => SUPERFICIES_DE_NINO.some((re) => re.test(ruta));

/** Las tablas de la base que guardan datos de un niño. */
export const TABLAS_DE_NINO = ["child_profiles", "child_group", "child_group_members"];

/** Quita comentarios de SQL para que un ejemplo comentado no cuente como código. */
export function sqlSinComentarios(sql) {
  return sql.replace(/--[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
}
