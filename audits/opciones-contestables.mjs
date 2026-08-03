#!/usr/bin/env node
// Auditor determinista — el dibujo que el ítem manda es el dibujo que se ve
//
// Hace cumplir: #349, #347, D-048, D-070, línea roja #3, mc-11.
//
// ─── Por qué existe ────────────────────────────────────────────────────────
//
// El dueño jugó quince minutos en su teléfono y recibió, como botones que
// tocar: `casilla3`, `casilla0`, `0` y `1`. No falló por no saber matemáticas:
// **eligió entre etiquetas sin contenido**. Es indistinguible de tirar una
// moneda, y el motor registró un fallo que el niño no cometió (#349).
//
// El mismo día apareció el gemelo: la pantalla tenía `"🦆"` escrito en cinco
// sitios, así que «Toca cada piedrita para contarlas» dibujaba patos (#347).
//
// Los dos son **el mismo defecto con dos caras**: alguien decide qué se dibuja
// en un archivo, y quien lo dibuja está en otro. Mientras haya dos listas del
// mismo hecho, se separan — y ninguna de las dos está mal por separado, que es
// justo por lo que no se ve leyendo ni un archivo ni el otro.
//
// El arreglo fue mover el hecho a un solo sitio: **el glifo viaja con el ítem**
// (`Item.dibujos` y `enunciado.vars.glifo`), y `Pantalla.astro` lo lee en vez
// de tenerlo. Este auditor vigila que siga siendo así.
//
// ─── LA PREGUNTA DE D-070: ¿existe una entrada que lo haga fallar? ─────────
//
// La versión anterior de este archivo leía una tabla `const FIGURAS = […]`
// cableada en `Pantalla.astro` y la cruzaba con el banco. Esa tabla **era el
// bug**, y al desaparecer el auditor se quedó ciego. Bloqueó, que fue lo
// correcto, y hay que reescribirlo.
//
// La reescritura fácil es tautológica y por eso no se hizo: «toda opción no
// numérica trae glifo» es literalmente lo que comprueba `validarItem`, así que
// sería el banco comparado consigo mismo. Verde garantizado para siempre.
//
// Las cuatro comprobaciones que sí muerden cruzan **dos archivos que escriben
// personas distintas**, y ninguna puede ser cierta por construcción porque
// ningún código escribe los dos lados a la vez:
//
//   1. **La pantalla no inventa ni un glifo.** Todo literal pictográfico del
//      script de cliente tiene que estar en posición de respaldo (`?? "●"`).
//      Uno suelto es #347 otra vez. Fuente: `Pantalla.astro`, sola.
//   2. **Todo glifo que la pantalla toma del ítem, el ítem lo trae.** Qué
//      variable se lee lo decide `pintarEscena`; qué variables existen lo
//      decide el banco. Si el banco deja de mandar `glifo`, la pantalla cae al
//      respaldo y dibuja un punto negro donde el enunciado dijo «piedrita» —
//      sin fallar, sin avisar. Fuentes: `Pantalla.astro` × banco.
//   3. **La opción dibuja algo que está en la escena.** En el patrón, la fila
//      se dibuja con `vars.figuras` y las opciones con `dibujos[…].glifo`. Si
//      las dos listas se separan otra vez —que es el bug literal de #347— la
//      opción correcta no está en pantalla. Fuentes: qué se dibuja lo decide
//      la pantalla; qué contiene cada lista, el banco.
//   4. **El cable no se ha desalineado.** La pantalla lee `o.dibujo.glifo`,
//      `.cuantos` y `.grande`; `presentarItem` los emite. Renombrar uno de los
//      dos lados no rompe nada visible: sale `undefined`, y «¿de qué lado hay
//      más?» vuelve a ser incontestable. Fuentes: `Pantalla.astro` × ingesta.
//   5. **El nombre accesible existe en los siete locales.** `dibujos[].clave`
//      es una clave de mensaje; si falta, `presentarItem` sirve la clave y el
//      lector de pantalla dice «forma.circulo». Fuentes: banco × `i18n/reto`.
//
// Y una sexta, la 0, que es la regresión directa de #349 y **la única que
// podría volverse tautológica**: ninguna opción llega a pantalla como su valor
// crudo. Hoy no lo es —nadie corre `validarItem` sobre `generarBanco()`, ver el
// informe—, pero el día que alguien lo cablee, esta mitad dejará de poder
// fallar y las que valdrán serán las cinco de arriba. Queda dicho aquí para que
// nadie la confunda con una comprobación viva.
//
// ─── Fallar CERRADO ────────────────────────────────────────────────────────
//
// Si la pantalla, la ingesta o los catálogos dejan de poder leerse, esto sale
// con 1 y dice qué no entendió. «No encontré nada» y «está todo bien» no son lo
// mismo, y un auditor que los confunde es peor que no tenerlo.

import { leer, informar, sinComentarios } from "./lib/repo.mjs";
import { generarBanco } from "../packages/motor/src/banco-kinder.ts";

const PANTALLA = "apps/web/src/components/reto/Pantalla.astro";
const INGESTA = "apps/ingest/src/index.ts";
const LOCALES = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];

const problemas = [];
const notas = [];

/** Bloquea y sale. Se usa solo cuando una FUENTE no se puede leer. */
const ciego = (...lineas) => {
  console.error("✗ opciones-contestables — no pude leer una de las fuentes.");
  for (const l of lineas) console.error(`  ${l}`);
  console.error("  Un auditor que deja de entender su segunda fuente no pasa en verde: bloquea,");
  console.error("  porque «no encontré nada» y «está todo bien» no son lo mismo (D-070).");
  process.exit(1);
};

/**
 * El cuerpo de una función, por conteo de llaves.
 *
 * Se corre sobre el texto YA sin comentarios: una llave dentro de un comentario
 * descuadra la cuenta, y un descuadre aquí acaba en «no entendí el archivo», que
 * bloquea. Es el fallo correcto, pero es ruido evitable.
 */
function cuerpoDe(codigo, firma) {
  const i = codigo.indexOf(firma);
  if (i < 0) return null;
  const abre = codigo.indexOf("{", i);
  if (abre < 0) return null;
  let n = 0;
  for (let k = abre; k < codigo.length; k++) {
    if (codigo[k] === "{") n++;
    else if (codigo[k] === "}" && --n === 0) return codigo.slice(abre + 1, k);
  }
  return null;
}

// ───────────────────────────────────────────────────────────────────────────
// FUENTE 1 — la pantalla: qué lee del ítem, y qué se atreve a dibujar sola
// ───────────────────────────────────────────────────────────────────────────

const pantallaCruda = leer(PANTALLA);
if (pantallaCruda === null) {
  ciego(`No encontré ${PANTALLA}.`, "Si la pantalla se movió, este auditor tiene que aprender la ruta nueva.");
}

const iScript = pantallaCruda.indexOf("<script");
const fScript = pantallaCruda.lastIndexOf("</script>");
if (iScript < 0 || fScript < iScript) {
  ciego(`${PANTALLA} ya no tiene un <script> de cliente.`);
}
const script = sinComentarios(pantallaCruda.slice(iScript, fScript));

/**
 * Un glifo: cualquier cosa pictográfica. Figuras geométricas (● ▲ ■ ▬),
 * símbolos y estrellas (⭐ ★), flechas y emoji (🦆 🎩 🪨).
 *
 * Deliberadamente NO incluye `?`, que la pantalla usa como hueco del patrón y
 * es un signo de puntuación, no un dibujo.
 */
const PICTOGRAFICO = /[\u{25A0}-\u{25FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{1F300}-\u{1FAFF}]/u;

/** Todos los literales de cadena del script, con dónde empiezan. */
const literales = [...script.matchAll(/(["'`])((?:\\.|(?!\1)[^\\])*)\1/g)];

/**
 * ── 1. La pantalla no inventa ni un glifo ─────────────────────────────────
 *
 * Un glifo escrito en la pantalla es una segunda lista del mismo hecho, y dos
 * listas del mismo hecho siempre se separan: eso fue #347, con «Toca cada
 * piedrita» dibujando patos durante semanas.
 *
 * La única posición tolerada es la de RESPALDO (`glifoDe(v) ?? "●"`), y se
 * tolera porque la comprobación 2 demuestra que nunca se usa: todo ítem que
 * llega a esa rama trae su glifo. Un respaldo demostrablemente muerto es
 * defensa en profundidad; uno vivo es la pantalla decidiendo qué se cuenta.
 */
const inventados = [];
for (const m of literales) {
  if (!PICTOGRAFICO.test(m[2])) continue;
  const antes = script.slice(Math.max(0, m.index - 12), m.index);
  if (/\?\?\s*$/.test(antes)) continue;
  inventados.push(m[2]);
}
for (const g of [...new Set(inventados)]) {
  problemas.push(
    `la pantalla inventa el glifo «${g}»: está escrito en ${PANTALLA} fuera de un respaldo \`??\`. ` +
      "El glifo viaja con el ítem —`vars.glifo`, `vars.figuras`, `dibujos[…].glifo`— justo porque " +
      "una segunda lista en la pantalla se separa de la del banco sin que nada falle: eso fue #347, " +
      "«Toca cada piedrita para contarlas» sobre una fila de patos.",
  );
}

/**
 * `glifoDe(v, clave)` — de qué variable saca el glifo cuando no le dicen cuál.
 *
 * Se lee del archivo en vez de darlo por supuesto: si mañana el nombre por
 * omisión deja de ser `glifo`, la comprobación 2 estaría preguntándole al banco
 * por una variable que ya nadie lee, y pasaría en verde por la razón
 * equivocada.
 */
const cuerpoGlifoDe = cuerpoDe(script, "const glifoDe =");
const mPorOmision = cuerpoGlifoDe?.match(/v\[\s*clave\s*\?\?\s*["'`]([^"'`]+)["'`]\s*\]/);
if (!mPorOmision) {
  ciego(
    "`glifoDe` cambió de forma o desapareció de la pantalla.",
    "Es la función por la que el glifo del ítem llega al dibujo; sin poder leerla no sé qué",
    "variable del enunciado le estoy pidiendo al banco.",
  );
}
const VAR_POR_OMISION = mPorOmision[1];

/** El cuerpo de `pintarEscena`: dónde se decide qué se dibuja para cada ítem. */
const escena = cuerpoDe(script, "function pintarEscena");
if (!escena) {
  ciego(
    "no encontré `function pintarEscena` en la pantalla.",
    "Es la única fuente del repo que dice qué se dibuja para cada formato y cada variable.",
  );
}

/** Las variables del ítem de las que una porción de código saca glifos. */
function glifosQueLee(trozo) {
  const sueltos = new Set();
  const cadenas = new Set();
  for (const m of trozo.matchAll(/glifoDe\(\s*v\s*(?:,\s*["'`]([^"'`]+)["'`]\s*)?\)/g)) {
    sueltos.add(m[1] ?? VAR_POR_OMISION);
  }
  // `[...String(v.figuras ?? "")]` — una cadena que se parte en glifos.
  for (const m of trozo.matchAll(/\[\s*\.\.\.\s*String\(\s*v\.([A-Za-z_$][\w$]*)/g)) {
    cadenas.add(m[1]);
  }
  return { sueltos: [...sueltos], cadenas: [...cadenas] };
}

/**
 * Las ramas de `pintarEscena`, en el orden en que la pantalla las evalúa.
 *
 * Dos clases, porque el `switch` tiene dos: los `case` del formato, y el
 * `default:`, donde `toca_la_respuesta` se reparte entre varias habilidades
 * según qué variable trae el ítem. Ese `else if` es el único sitio del repo
 * donde está escrito qué se dibuja para cada una.
 */
const ramas = [];
{
  const iDefault = escena.indexOf("default:");
  const conCases = iDefault >= 0 ? escena.slice(0, iDefault) : escena;
  const casos = [...conCases.matchAll(/case\s+["'`]([a-z_]+)["'`]\s*:/g)];
  for (let i = 0; i < casos.length; i++) {
    const hasta = i + 1 < casos.length ? casos[i + 1].index : conCases.length;
    ramas.push({
      como: `formato ${casos[i][1]}`,
      formato: casos[i][1],
      guarda: null,
      ...glifosQueLee(conCases.slice(casos[i].index, hasta)),
    });
  }

  // Solo el `default:`, y solo las condiciones de un `if`/`else if`. Un
  // `v.llenas !== undefined ? a : b` DENTRO de otra rama no es una guarda: la
  // primera versión de esto lo tomó por una y marcó el marco de diez como
  // escena de figuras, que es un falso positivo sobre 105 ítems buenos.
  const bloque = iDefault >= 0 ? escena.slice(iDefault) : "";
  const guardas = [...bloque.matchAll(/(?:else\s+)?if\s*\(([^{}]*?)\)\s*\{/g)];
  for (let i = 0; i < guardas.length; i++) {
    const hasta = i + 1 < guardas.length ? guardas[i + 1].index : bloque.length;
    const vars = [...guardas[i][1].matchAll(/v\.([A-Za-z_$][\w$]*)/g)].map((m) => m[1]);
    ramas.push({
      como: `variable ${vars.join(" o ")}`,
      formato: null,
      guarda: vars,
      ...glifosQueLee(bloque.slice(guardas[i].index, hasta)),
    });
  }
}

const conGlifo = ramas.filter((r) => r.sueltos.length > 0 || r.cadenas.length > 0);
if (ramas.length === 0 || conGlifo.length === 0) {
  ciego(
    `leí ${ramas.length} rama(s) de \`pintarEscena\` y ${conGlifo.length} saca(n) glifos del ítem.`,
    "O la pantalla cambió de forma, o dejó de dibujar con lo que el ítem manda — que es #347",
    "otra vez. Las dos posibilidades exigen mirar, y ninguna se resuelve pasando en verde.",
  );
}

/** La rama que la pantalla tomaría para este ítem, o `null` si no dibuja nada. */
function ramaDe(item) {
  const porFormato = ramas.find((r) => r.formato === item.formato);
  if (porFormato) return porFormato;
  const vars = item.enunciado?.vars ?? {};
  return ramas.find((r) => r.guarda?.some((v) => vars[v] !== undefined)) ?? null;
}

// ───────────────────────────────────────────────────────────────────────────
// FUENTE 2 — la ingesta: el cable entre el ítem y el botón
// ───────────────────────────────────────────────────────────────────────────

const ingestaCruda = leer(INGESTA);
if (ingestaCruda === null) ciego(`No encontré ${INGESTA}, que es quien arma las opciones.`);
const ingesta = sinComentarios(ingestaCruda);

/**
 * El método `presentarItem`, acotado al siguiente miembro de la clase.
 *
 * No se usa `cuerpoDe` aquí a propósito: la firma lleva su tipo de retorno
 * escrito con llaves (`Promise<{ … }>`), así que contar llaves desde la primera
 * devuelve la ANOTACIÓN DE TIPO en vez del cuerpo — y la anotación declara un
 * `dibujo?: { … }` que parece lo que se busca y no es lo que se ejecuta.
 */
const iPresentar = ingesta.indexOf("async presentarItem(");
if (iPresentar < 0) ciego(`no encontré \`presentarItem\` en ${INGESTA}, que es quien arma las opciones.`);
const desdePresentar = ingesta.slice(iPresentar);
const finPresentar = desdePresentar.slice(1).search(/\n {2}(?:async |[A-Za-z_$][\w$]*\()/);
const presentar = finPresentar > 0 ? desdePresentar.slice(0, finPresentar + 1) : desdePresentar;

/** Los campos del sub-objeto `dibujo:` que la ingesta llega a mandar. */
const mDibujo = presentar.match(/dibujo:\s*\{([^{}]*)\}/);
if (!mDibujo) {
  ciego(
    `\`presentarItem\` ya no arma un \`dibujo: { … }\` para las opciones (${INGESTA}).`,
    "Ese objeto es TODO lo que la pantalla tiene para dibujar una opción que no es un número.",
    "Sin él, el único rótulo posible vuelve a ser el identificador, que es #349.",
  );
}
const EMITE = new Set([...mDibujo[1].matchAll(/([A-Za-z_$][\w$]*)\s*:/g)].map((m) => m[1]));

/** Los campos que la pantalla lee de ese objeto. */
const opciones = cuerpoDe(script, "function pintarOpciones");
if (!opciones) ciego("no encontré `function pintarOpciones` en la pantalla.");
const LEE = new Set([...opciones.matchAll(/\bo\.dibujo\.([A-Za-z_$][\w$]*)/g)].map((m) => m[1]));
if (LEE.size === 0) {
  ciego(
    "`pintarOpciones` ya no lee ningún campo de `o.dibujo`.",
    "O la opción volvió a pintarse por su valor —que es exactamente #349— o el contrato se movió",
    "a otro sitio que este auditor todavía no sabe leer.",
  );
}

// ── 4. El cable no se ha desalineado ──────────────────────────────────────
for (const campo of [...LEE].sort()) {
  if (EMITE.has(campo)) continue;
  problemas.push(
    `la pantalla lee \`o.dibujo.${campo}\` y \`presentarItem\` no lo manda (${INGESTA}). ` +
      "Renombrar uno de los dos lados no rompe nada visible: sale `undefined`, y el montón de " +
      "«¿de qué lado hay más?» se dibuja con una sola figura. Vuelve a ser una moneda al aire (#349).",
  );
}
const sinLeer = [...EMITE].filter((c) => !LEE.has(c));
if (sinLeer.length > 0) notas.push(`la ingesta manda ${sinLeer.join(", ")} y la pantalla no lo lee`);

// ───────────────────────────────────────────────────────────────────────────
// FUENTE 3 — los catálogos del reto: el nombre accesible de cada dibujo
// ───────────────────────────────────────────────────────────────────────────

const CATALOGO = new Map();
for (const l of LOCALES) {
  const crudo = leer(`apps/web/src/i18n/reto/${l}.json`);
  if (!crudo) continue;
  try {
    CATALOGO.set(l, new Set(Object.keys(JSON.parse(crudo))));
  } catch {
    /* un JSON roto lo caza `locales-complete`, no éste */
  }
}
if (CATALOGO.size < LOCALES.length) {
  ciego(
    `solo pude leer ${CATALOGO.size} de ${LOCALES.length} catálogos de \`i18n/reto\`.`,
    "El nombre accesible de una opción dibujada sale de ahí; sin los siete no puedo decir si",
    "existe en el idioma del niño que no habla el idioma de quien escribió el ítem.",
  );
}

// ───────────────────────────────────────────────────────────────────────────
// El banco, cruzado contra las tres fuentes
// ───────────────────────────────────────────────────────────────────────────

const banco = generarBanco();

const opcionesDe = (item) => [
  ...new Set([
    item.respuesta.valor,
    ...item.errores.map((e) => e.valor),
    ...(item.tambienCorrectas ?? []).map((a) => a.valor),
  ]),
];

/** Agrupado por habilidad: 653 ítems producirían 653 renglones idénticos. */
const agrupa = (mapa, hab, dato) => {
  if (!mapa.has(hab)) mapa.set(hab, new Set());
  mapa.get(hab).add(dato);
};

const crudas = new Map(); // 0 · la opción llegaría a pantalla como su valor
const faltaGlifo = new Map(); // 2 · la pantalla lee una variable que el ítem no trae
const fueraDeEscena = new Map(); // 3 · la opción dibuja algo que no está en la escena
const claveSinTexto = new Map(); // 5 · el nombre accesible no existe
const ramasUsadas = new Set();

for (const item of banco) {
  const vars = item.enunciado?.vars ?? {};
  const rama = ramaDe(item);
  if (rama) ramasUsadas.add(rama.como);

  // ── 0. Ninguna opción llega a pantalla como su valor crudo (#349) ────────
  //
  // La mitad que puede volverse tautológica; ver el encabezado. Reproduce el
  // camino real de `presentarItem`: valor numérico → se formatea y se lee;
  // valor de cadena sin `dibujos[valor]` → `texto: String(v)`, y el botón dice
  // `casilla3` delante de alguien de cuatro años que no sabe leer.
  for (const valor of opcionesDe(item)) {
    if (typeof valor !== "string") continue;
    const dib = item.dibujos?.[valor];
    if (!dib?.glifo) agrupa(crudas, item.habilidad, valor);
  }

  // ── 2. Todo glifo que la pantalla toma del ítem, el ítem lo trae ─────────
  //
  // Sin esto la pantalla cae a su respaldo y dibuja un punto negro donde el
  // enunciado dijo «piedrita»: no falla, no avisa, y la tarea queda rota para
  // quien está aprendiendo QUÉ se cuenta (#347).
  const escenaGlifos = new Set();
  if (rama) {
    for (const v of rama.sueltos) {
      const g = vars[v];
      if (typeof g === "string" && g !== "") escenaGlifos.add(g);
      else agrupa(faltaGlifo, item.habilidad, `vars.${v}`);
    }
    for (const v of rama.cadenas) {
      const s = vars[v];
      if (typeof s === "string" && s !== "") for (const c of s) escenaGlifos.add(c);
      else agrupa(faltaGlifo, item.habilidad, `vars.${v}`);
    }
  }

  for (const [valor, dib] of Object.entries(item.dibujos ?? {})) {
    // ── 3. La opción dibuja algo que está en la escena ─────────────────────
    if (escenaGlifos.size > 0 && dib.glifo && !escenaGlifos.has(dib.glifo)) {
      agrupa(fueraDeEscena, item.habilidad, `«${dib.glifo}» (${valor})`);
    }
    // ── 5. El nombre accesible existe en los siete locales ────────────────
    for (const [l, claves] of CATALOGO) {
      if (dib.clave && !claves.has(dib.clave)) agrupa(claveSinTexto, item.habilidad, `${dib.clave} · ${l}`);
    }
  }
}

const primeros = (valores) => [...valores].sort().slice(0, 6).join(", ");

for (const [hab, v] of [...crudas].sort()) {
  problemas.push(
    `${hab} · opción servida como su identificador: ${primeros(v)}. Sin \`dibujos[valor]\` con glifo, ` +
      "`presentarItem` cae a `texto: String(v)` y esa cadena viaja CRUDA al botón — sin traducir a " +
      "ninguno de los siete locales y sin decir nada. La opción es LA COSA, no su clave (#349).",
  );
}

for (const [hab, v] of [...faltaGlifo].sort()) {
  problemas.push(
    `${hab} · la pantalla dibuja esta escena con ${primeros(v)} y el ítem no lo trae. ` +
      `${PANTALLA} cae entonces a su respaldo y pinta un glifo que el ítem nunca eligió: es #347, ` +
      "«Toca cada piedrita para contarlas» sobre una fila de patos. No falla y no avisa.",
  );
}

for (const [hab, v] of [...fueraDeEscena].sort()) {
  problemas.push(
    `${hab} · la opción dibuja algo que no está en la escena: ${primeros(v)}. La fila se pinta con ` +
      "las figuras del enunciado y la opción con las suyas; si las dos listas se separan, la respuesta " +
      "correcta no está en pantalla y elegir vuelve a ser tirar una moneda (#347, #349).",
  );
}

for (const [hab, v] of [...claveSinTexto].sort()) {
  problemas.push(
    `${hab} · el nombre accesible de una opción dibujada no existe: ${primeros(v)}. \`presentarItem\` ` +
      "sirve entonces la clave, y el lector de pantalla anuncia «forma.circulo». Quien ve el dibujo no " +
      "lo nota; quien depende del lector se queda sin la opción (D-022, mc-11).",
  );
}

const sinItems = conGlifo.filter((r) => !ramasUsadas.has(r.como));
if (sinItems.length > 0) {
  notas.push(`rama(s) de dibujo que ningún ítem alcanza: ${sinItems.map((r) => r.como).join("; ")}`);
}

notas.push(`${banco.length} ítem(s), ${new Set(banco.map((i) => i.habilidad)).size} habilidades`);
notas.push(
  `la pantalla saca glifos del ítem en ${conGlifo.length} rama(s): ` +
    conGlifo.map((r) => `${r.como} → ${[...r.sueltos, ...r.cadenas].join(", ")}`).join("; "),
);
notas.push(`el cable de la opción dibujada: ${[...LEE].sort().join(", ")}`);

informar({
  nombre: "opciones-contestables",
  problemas,
  notas,
  cita: "#349, #347, D-048, D-070",
  revisados: banco.length,
  resumen: `${banco.length} ítem(s) cruzados con la pantalla, la ingesta y los 7 catálogos del reto`,
  porQueBloquea:
    "un ítem incontestable es peor que un ítem menos: el niño no puede decir que la pantalla está " +
    "incompleta, toca al azar, y el motor adaptativo registra como fallo algo que nunca fue una pregunta.",
  noComprueba: [
    "que el ítem sea matemáticamente correcto ni que su respuesta sea única",
    "que el texto esté BIEN traducido — que exista es lo que se mira (eso es locales-complete y retro-completa)",
    "que dos opciones se distingan visualmente: contraste y tamaño son contrast y touch-targets",
    "el destello: `prepararDestello` dibuja un punto de CSS cuando el ítem no manda glifo, y eso es " +
      "deliberado (K01 y K02 traen `glifo` vacío), así que su respaldo sí está vivo y no se exige",
    "los campos de la opción que no son `dibujo` — `valor` y `texto` se dan por buenos",
    "el banco de primaria en adelante — hoy solo existe kinder",
  ],
});
