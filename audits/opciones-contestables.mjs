#!/usr/bin/env node
// Auditor determinista — ninguna opción de respuesta es un identificador interno
//
// Hace cumplir: #349, #358, D-048, D-070, línea roja #3, mc-11.
//
// ─── Por qué existe ────────────────────────────────────────────────────────
//
// El dueño jugó quince minutos en su teléfono y recibió, como botones que
// tocar: `casilla3`, `casilla0`, `0` y `1`. No falló por no saber matemáticas:
// **eligió entre etiquetas sin contenido**. Es indistinguible de tirar una
// moneda, y el motor registró un fallo que el niño no cometió.
//
// Los ítems son matemáticamente correctos y están bien parametrizados. Lo que
// falla es la última traducción: de índice interno a algo que un humano pueda
// elegir. `presentarItem` hace `texto: String(valor)` para todo lo que no es un
// número, así que cualquier cadena que el banco ponga en `respuesta.valor`
// viaja CRUDA a la pantalla del niño.
//
// ─── Por qué «que el texto exista en i18n» NO basta ────────────────────────
//
// Es lo primero que se piensa, y se queda corto por un caso concreto: el
// formato de patrón sirve `0` y `1` —los índices de la familia de figuras— y
// **`0` y `1` sí son números legítimos**. Un auditor de catálogo los aprueba.
//
// La regla real tiene dos mitades, y hacen falta las dos:
//
//   A. Ninguna opción es una cadena que no exista en ningún catálogo de texto
//      de cara al usuario. Caza `casilla3`, `izq`, `der`.
//   B. **En un ítem cuyo estímulo son FIGURAS, las opciones tienen que ser
//      figuras.** Caza `0` y `1`, que la mitad A aprueba.
//
// ─── Por qué la mitad B no puede ser cierta por construcción (D-070) ───────
//
// Porque no pregunta al banco qué dibuja: se lo pregunta a **quien dibuja**.
// `components/reto/Pantalla.astro` tiene la tabla de glifos (`FIGURAS`) y el
// `switch` que decide qué escena se pinta para cada formato. Este auditor lee
// ESE archivo para saber qué ítems se pintan con figuras, y luego mira las
// opciones que produce el motor, que es otro paquete y no sabe nada de glifos.
//
// Nadie escribe las dos listas a la vez. La comprobación solo pasa si el banco
// y la pantalla acabaron de acuerdo, que es justo lo que hoy no pasa.
//
// ─── LO QUE ESTE AUDITOR NO COMPRUEBA ──────────────────────────────────────
//
//  · Que el ítem sea matemáticamente correcto, ni que su respuesta sea única.
//    Los tres generadores que caza aquí son correctos: lo que está mal es cómo
//    se ofrecen.
//  · Que el texto de la opción esté BIEN traducido, o que exista en los siete
//    locales. Eso es `locales-complete` y `retro-completa`.
//  · Que las opciones se distingan entre sí visualmente (dos glifos parecidos,
//    contraste, tamaño de toque). Eso son `contrast` y `touch-targets`.
//  · Los formatos que la pantalla NO dibuja con figuras. Si mañana alguien
//    inventa un estímulo de audio con opciones-índice, este auditor no lo ve:
//    habría que enseñarle a leer ese otro renderizador.
//  · El banco de primaria en adelante. Hoy solo existe kinder.

import { leer, informar, separarDeuda } from "./lib/repo.mjs";
import { generarBanco } from "../packages/motor/src/banco-kinder.ts";

/**
 * Lo que este auditor encontró roto el día que se escribió. `audits/` no toca
 * `apps/` ni `packages/`: los arregla #349. Cada renglón bloquea el día que
 * deje de reproducirse — ver `separarDeuda` en `lib/repo.mjs`.
 */
const DEUDA = [
  {
    id: "K13 · opción con identificador interno",
    issue: "#349 · el caso que abrió el issue",
    porQue:
      "«cuál sobra» sirve casilla0..casilla3, que son POSICIONES. El niño ve cuatro figuras dibujadas y " +
      "cuatro botones que dicen «casilla3»; nada en la pantalla dice cuál casilla es cuál.",
  },
  {
    id: "K13 · escena de figuras con opciones que no son figuras",
    issue: "#349 · el caso que abrió el issue",
    porQue: "la escena se pinta con ● ▲ ■ ★ y las opciones son cadenas de posición.",
  },
  {
    id: "K14 · escena de figuras con opciones que no son figuras",
    issue: "#349 · el segundo formato, en el comentario del dueño",
    porQue:
      "el patrón sirve 0 y 1 —los índices de la familia de figuras— y los dos son números legítimos, así " +
      "que un auditor de catálogo los aprueba. Esta es la mitad que hacía falta.",
  },
  {
    id: "K07 · opción con identificador interno",
    issue: "#349 · TERCER generador, encontrado por este auditor el 2026-08-02",
    porQue:
      "«¿de qué lado hay más?» sirve las cadenas «izq» y «der» tal cual: `presentarItem` hace " +
      "String(valor) para todo lo que no es número. El niño ve dos botones que dicen «izq» y «der», sin " +
      "traducir a ninguno de los siete locales. No estaba en #349 — lo encontró este auditor.",
  },
];

const problemas = [];
const notas = [];

// ───────────────────────────────────────────────────────────────────────────
// Fuente 1 — la pantalla: qué dibuja, y con qué glifos
// ───────────────────────────────────────────────────────────────────────────

const PANTALLA = "apps/web/src/components/reto/Pantalla.astro";
const pantalla = leer(PANTALLA);
if (pantalla === null) {
  console.error(`✗ opciones-contestables — no encontré ${PANTALLA}.`);
  console.error("  Sin el renderizador no hay segunda fuente, y la mitad B de la regla no se puede");
  console.error("  comprobar. Si la pantalla se movió, este auditor tiene que aprender la ruta nueva.");
  process.exit(1);
}

/** La tabla de glifos del renderizador: `const FIGURAS = ["●", "▲", …]`. */
const mFiguras = pantalla.match(/const\s+FIGURAS\s*=\s*\[([^\]]*)\]/);
const FIGURAS = mFiguras
  ? [...mFiguras[1].matchAll(/["'`]([^"'`]+)["'`]/g)].map((m) => m[1])
  : [];

/** El cuerpo de `pintarEscena`, que es donde se decide qué se dibuja. */
const iEscena = pantalla.indexOf("function pintarEscena");
const cuerpoEscena = iEscena >= 0 ? pantalla.slice(iEscena, pantalla.indexOf("function pintarOpciones")) : "";

/** Los formatos cuya rama del `switch` dibuja una figura. */
const FORMATOS_FIGURA = new Set();
{
  const casos = [...cuerpoEscena.matchAll(/case\s+["'`]([a-z_]+)["'`]\s*:/g)];
  for (let i = 0; i < casos.length; i++) {
    const desde = casos[i].index;
    const hasta = i + 1 < casos.length ? casos[i + 1].index : cuerpoEscena.length;
    if (/cajita\(\s*["'`]figura/.test(cuerpoEscena.slice(desde, hasta))) {
      FORMATOS_FIGURA.add(casos[i][1]);
    }
  }
}

/**
 * Las variables del enunciado cuya rama del `default:` dibuja una figura.
 *
 * `toca_la_respuesta` cubre varias habilidades y la pantalla las distingue por
 * qué variable trae el ítem: `v.izq` son dos montones de patos, `v.largo` es el
 * patrón de figuras. Ese `else if` es el único sitio del repo donde está
 * escrito qué se dibuja para cada una.
 */
const VARS_FIGURA = new Set();
{
  // Solo el `default:`, y solo las condiciones de un `if`/`else if`. Un
  // `v.llenas !== undefined ? a : b` DENTRO de otra rama no es una guarda: la
  // primera versión de esto lo tomó por una y marcó el marco de diez como
  // escena de figuras, que es un falso positivo sobre 105 ítems buenos.
  const iDefault = cuerpoEscena.indexOf("default:");
  const bloque = iDefault >= 0 ? cuerpoEscena.slice(iDefault) : "";
  const guardas = [...bloque.matchAll(/(?:else\s+)?if\s*\(([^{}]*?)\)\s*\{/g)];
  for (let i = 0; i < guardas.length; i++) {
    const desde = guardas[i].index;
    const hasta = i + 1 < guardas.length ? guardas[i + 1].index : bloque.length;
    if (!/cajita\(\s*["'`]figura/.test(bloque.slice(desde, hasta))) continue;
    for (const v of guardas[i][1].matchAll(/v\.([A-Za-z_$][\w$]*)/g)) VARS_FIGURA.add(v[1]);
  }
}

// Fallar ABIERTO aquí sería lo peor que puede pasar: el auditor pasaría en
// verde sobre el banco entero porque dejó de entender el renderizador.
if (FIGURAS.length === 0 || (FORMATOS_FIGURA.size === 0 && VARS_FIGURA.size === 0)) {
  console.error("✗ opciones-contestables — no pude leer el renderizador.");
  console.error(`  FIGURAS: ${FIGURAS.length} glifo(s); formatos con figura: ${FORMATOS_FIGURA.size};`);
  console.error(`  variables con figura: ${VARS_FIGURA.size}.`);
  console.error("  `Pantalla.astro` cambió de forma. Un auditor que deja de entender su segunda fuente");
  console.error("  no pasa en verde: bloquea, porque «no encontré nada» y «está todo bien» no son lo mismo.");
  process.exit(1);
}

// ───────────────────────────────────────────────────────────────────────────
// Fuente 2 — el catálogo de texto de cara al usuario
// ───────────────────────────────────────────────────────────────────────────

const CATALOGO = new Set();
{
  const i18n = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];
  const recorrer = (v) => {
    if (typeof v === "string") CATALOGO.add(v);
    else if (v && typeof v === "object") for (const x of Object.values(v)) recorrer(x);
  };
  for (const l of i18n) {
    const crudo = leer(`apps/web/src/i18n/${l}.json`);
    if (crudo) {
      try {
        recorrer(JSON.parse(crudo));
      } catch {
        /* un JSON roto lo caza `locales-complete`, no éste */
      }
    }
  }
  // Los mensajes del reto viven en el worker de ingesta, no en los JSON.
  const ingest = leer("apps/ingest/src/index.ts") ?? "";
  const bloque = ingest.slice(ingest.indexOf("MENSAJES_DE_RETO"), ingest.indexOf("MENSAJES_DE_RETO") + 12000);
  for (const m of bloque.matchAll(/["'`]([^"'`\n]{2,})["'`]/g)) CATALOGO.add(m[1]);
}

if (CATALOGO.size === 0) {
  console.error("✗ opciones-contestables — el catálogo de texto salió vacío.");
  console.error("  Con un catálogo vacío toda cadena parecería un identificador interno y el auditor");
  console.error("  bloquearía por la razón equivocada.");
  process.exit(1);
}

// ───────────────────────────────────────────────────────────────────────────
// El banco, y las opciones que de verdad se sirven
// ───────────────────────────────────────────────────────────────────────────

const banco = generarBanco();

/**
 * Las opciones tal como las arma `presentarItem`: la correcta, los distractores
 * con causa, y las alternas de D-048 — sin bandera de cuál es la buena.
 */
const opcionesDe = (item) => [
  ...new Set([
    item.respuesta.valor,
    ...item.errores.map((e) => e.valor),
    ...(item.tambienCorrectas ?? []).map((a) => a.valor),
  ]),
];

const glifos = new Set(FIGURAS);
/** Agrupado por habilidad: 653 ítems producirían 653 renglones idénticos. */
const identificadores = new Map();
const figurasIncoherentes = new Map();

for (const item of banco) {
  const opciones = opcionesDe(item);

  // ── A. ninguna opción es una cadena fuera del catálogo de i18n ────────────
  for (const valor of opciones) {
    if (typeof valor !== "string") continue;
    if (glifos.has(valor) || CATALOGO.has(valor)) continue;
    if (!identificadores.has(item.habilidad)) identificadores.set(item.habilidad, new Set());
    identificadores.get(item.habilidad).add(valor);
  }

  // ── B. si la escena son figuras, las opciones son figuras ────────────────
  const vars = Object.keys(item.enunciado?.vars ?? {});
  const esDeFiguras = FORMATOS_FIGURA.has(item.formato) || vars.some((v) => VARS_FIGURA.has(v));
  if (!esDeFiguras) continue;

  const noSonFiguras = opciones.filter((v) => !glifos.has(String(v)));
  if (noSonFiguras.length > 0) {
    if (!figurasIncoherentes.has(item.habilidad)) figurasIncoherentes.set(item.habilidad, new Set());
    for (const v of noSonFiguras) figurasIncoherentes.get(item.habilidad).add(String(v));
  }
}

for (const [hab, valores] of [...identificadores].sort()) {
  problemas.push(
    `${hab} · opción con identificador interno: ${[...valores].sort().slice(0, 6).map((v) => `«${v}»`).join(", ")}. ` +
      "`presentarItem` hace `texto: String(valor)` para todo lo que no es número, así que esa cadena viaja " +
      "cruda al botón que el niño toca — sin traducir a ninguno de los siete locales y sin decir nada. " +
      "La opción tiene que ser LA COSA, no el identificador de la cosa (#349).",
  );
}

for (const [hab, valores] of [...figurasIncoherentes].sort()) {
  problemas.push(
    `${hab} · escena de figuras con opciones que no son figuras: ${[...valores].sort().slice(0, 6).map((v) => `«${v}»`).join(", ")}. ` +
      `${PANTALLA} dibuja esta escena con ${FIGURAS.join(" ")}, y las opciones son índices de esa tabla. ` +
      "Que «0» y «1» sean números legítimos es justo por lo que un auditor de catálogo no basta: el niño " +
      "elige entre dos etiquetas sin contenido, que es tirar una moneda (#349).",
  );
}

notas.push(`${banco.length} ítem(s) del banco, ${new Set(banco.map((i) => i.habilidad)).size} habilidades`);
notas.push(
  `la pantalla dibuja con figuras: formato(s) ${[...FORMATOS_FIGURA].join(", ") || "—"} y ` +
    `variable(s) ${[...VARS_FIGURA].join(", ") || "—"}; glifos ${FIGURAS.join(" ")}`,
);
notas.push(`${CATALOGO.size} cadena(s) de cara al usuario en el catálogo`);

const { bloquean, conocidos } = separarDeuda(problemas, DEUDA);
notas.push(...conocidos);

informar({
  nombre: "opciones-contestables",
  problemas: bloquean,
  notas,
  cita: "#349, #358, D-048, D-070",
  revisados: banco.length,
  resumen: `${banco.length} ítem(s), ${FORMATOS_FIGURA.size + VARS_FIGURA.size} escena(s) de figuras cruzadas con la pantalla`,
  porQueBloquea:
    "un ítem incontestable es peor que un ítem menos: el niño no puede decir que la pantalla está " +
    "incompleta, toca al azar, y el motor adaptativo registra como fallo algo que nunca fue una pregunta.",
  noComprueba: [
    "que el ítem sea matemáticamente correcto ni que su respuesta sea única — los tres que caza lo son",
    "que el texto de la opción esté bien traducido (eso es locales-complete y retro-completa)",
    "que dos opciones se distingan visualmente: contraste y tamaño son contrast y touch-targets",
    "formatos que la pantalla NO dibuja con figuras; habría que enseñarle a leer ese otro renderizador",
    "el banco de primaria en adelante — hoy solo existe kinder",
  ],
});
