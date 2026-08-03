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

/**
 * El mismo patrón, con `\b` reparado para que entienda acentos.
 *
 * ─── El fallo que esto arregla, medido y no supuesto ──────────────────────
 *
 * **`\b` de JavaScript solo conoce ASCII.** `\w` es `[A-Za-z0-9_]` incluso con
 * la bandera `u`, así que una `ó` es, para el motor de expresiones regulares,
 * un carácter que NO es de palabra. Consecuencia directa:
 *
 *     /\bse acab[oó]\b/iu.test("Se acabó la racha")   →  false
 *     /\bse rompi[oó]\b/iu.test("Se rompió la racha") →  false
 *     /\bse acab[oó]\b/iu.test("Se acabo la racha")   →  true
 *
 * La `\b` final exige un cambio entre carácter de palabra y no-palabra; después
 * de la `ó` hay un espacio, y los dos cuentan como no-palabra, así que no hay
 * frontera y el patrón entero falla. **Las dos formas más naturales de decirlo
 * en español pasaban de largo, y las variantes sin acento —que nadie escribe—
 * eran las únicas que se cazaban.** Se encontró construyendo el auditor del
 * límite de pantalla (F8), reusando el léxico de racha de F7 sobre una
 * despedida degradada a propósito: el control negativo salió en verde con
 * «Se acabó la racha» delante.
 *
 * Es la misma clase de fallo que ya obligó a escribir `palabra()` en este mismo
 * archivo —allí era el guion bajo, aquí es el acento— y por eso vive al lado.
 *
 * ─── Cómo lo repara ───────────────────────────────────────────────────────
 *
 * Sustituye cada `\b` por la definición de frontera de palabra generalizada a
 * Unicode, escrita con las dos direcciones para que sirva igual al principio
 * que al final de un patrón: o bien se sale de una letra hacia algo que no lo
 * es, o bien se entra desde algo que no lo es hacia una letra.
 *
 * Exige la bandera `u` al compilar, porque usa `\p{L}` y `\p{N}`.
 *
 * @param {string} patron patrón crudo, tal cual viene del JSON del léxico
 * @returns {string} el mismo patrón con las fronteras reparadas
 */
export function conFronteraUnicode(patron) {
  const FRONTERA =
    "(?:(?<=[\\p{L}\\p{N}_])(?![\\p{L}\\p{N}_])|(?<![\\p{L}\\p{N}_])(?=[\\p{L}\\p{N}_]))";
  // `\\b` (una barra escapada seguida de b) es un literal, no una frontera. Se
  // respeta: sustituir dentro de él rompería el patrón de quien lo escribió.
  return String(patron).replace(/(\\\\)|\\b/g, (todo, escapada) => (escapada ? todo : FRONTERA));
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

/**
 * El texto sin comentarios: `//`, `/* … *\/`, `<!-- … -->` y `-- ` de SQL.
 *
 * Existe porque la misma clase de falso positivo apareció CUATRO veces, y las
 * cuatro con la misma forma: un auditor caza una palabra dentro de un comentario
 * que está ahí **para explicar por qué esa cosa no se hace**.
 *
 *   · `sin-penalizacion` sobre una cadena de prosa y sobre `-- Borrado suave`
 *   · `turnstile-solo-adulto` sobre su propio párrafo que dice dónde NO va
 *   · `adaptativo-simulacion` sobre «eso lo hace el motor adaptativo», escrito
 *     justo para aclarar que ESTE archivo no lo es
 *
 * Un guardián que castiga documentar su propia regla se acaba anulando por
 * costumbre, y entonces deja de guardar. El código se sigue mirando entero: un
 * `if (esAdaptativo)` sigue siendo código.
 *
 * NO se usa para buscar SECRETOS: una llave commiteada dentro de un comentario
 * sigue estando commiteada. `secrets.mjs` mira el archivo crudo, a propósito.
 */
export function sinComentarios(texto) {
  return String(texto ?? "")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1 ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/^\s*--[^\n]*/gm, " ");
}

/**
 * Deuda declarada: un fallo del producto que este auditor YA encontró, que otra
 * persona está arreglando, y que no puede bloquear el commit de todo el mundo
 * mientras tanto.
 *
 * ─── Por qué existe, y por qué no es una anulación disfrazada ──────────────
 *
 * Un auditor nuevo casi siempre nace ROJO: se escribe porque algo se rompió, y
 * lo que se rompió sigue roto el día que se escribe. Hay dos salidas malas y
 * una buena.
 *
 *   · Mala 1 — no registrarlo en `run.mjs` hasta que el producto esté limpio.
 *     Es lo que hizo que seis auditores fallaran abiertos sin que nadie lo
 *     supiera (ver el comentario de los trece en `run.mjs`). Un guardián que
 *     espera su turno en una lista no vigila.
 *   · Mala 2 — ablandar la regla para que pase. Entonces el auditor deja de
 *     cazar la clase entera, que es justo lo que valía.
 *   · Buena — declarar POR ESCRITO cada violación conocida, con su issue, y
 *     bloquear todo lo demás. El día siguiente, una violación NUEVA de la misma
 *     clase bloquea, que es el 90% del valor.
 *
 * **Una entrada rancia BLOQUEA.** Si el fallo ya no está, el renglón sobra y hay
 * que borrarlo. Sin eso, la lista crece y nunca se vacía — que es exactamente
 * cómo un `.eslintrc` acaba con doscientas reglas apagadas.
 *
 * @param {string[]} problemas       todos los problemas encontrados, sin filtrar
 * @param {Array<{id: string, issue: string, porQue: string}>} deuda
 * @returns {{ bloquean: string[], conocidos: string[] }}
 */
export function separarDeuda(problemas, deuda) {
  const bloquean = [];
  const conocidos = [];
  const vistos = new Set();

  for (const p of problemas) {
    const entrada = deuda.find((d) => p.includes(d.id));
    if (entrada) {
      vistos.add(entrada.id);
      conocidos.push(`DEUDA ${entrada.issue} · ${entrada.id} — ${entrada.porQue}`);
    } else {
      bloquean.push(p);
    }
  }

  for (const d of deuda) {
    if (vistos.has(d.id)) continue;
    bloquean.push(
      `la deuda declarada «${d.id}» (${d.issue}) YA NO SE REPRODUCE. Borra su renglón del auditor: ` +
        "una lista de excepciones que nadie vacía es cómo un gate se apaga sin que nadie lo decida.",
    );
  }

  return { bloquean, conocidos };
}
