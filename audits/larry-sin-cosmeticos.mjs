#!/usr/bin/env node
// Auditor determinista — Larry NUNCA comenta el avatar ni los cosméticos de un niño
//
// Hace cumplir: #257, línea roja #7, D-004, D-014 (filas «cosméticos ganados» y
// «comparación pública por nombre»), D-080, mc-43 §10.
//
// ─── La regla, y por qué con D-080 importa más, no menos ───────────────────
//
// mc-43 §10 lo escribe como implicación de diseño: *«Larry never comments on
// the child's alias or avatar choice. His canon voice stays on math, never on
// appearance or identity — extends D-004's "never shames a child" rule to a
// place shame could otherwise creep in (a bot "complimenting" a name implicitly
// also can judge one)»*.
//
// D-080 decidió que el compañero del mapa y el tutor son LA MISMA criatura:
// los cosméticos son accesorios de Larry, no de una mascota aparte. Eso vuelve
// esta frontera más importante, no menos — el que explica tu error es el mismo
// que lleva puestos los accesorios, así que la diferencia entre «te explico tu
// error» y «qué bonito tu sombrero» tiene que existir EN EL CÓDIGO o no existe.
//
// Un «qué bonito avatar» escrito por un modelo no es un elogio inofensivo: es
// la puerta a «qué feo te quedó», y es juicio sobre la identidad del niño en la
// voz del personaje que el niño quiere. La defensa robusta es la misma que con
// la aritmética (`larry-nunca-calcula`): **el camino de Larry no puede comentar
// lo que no puede conocer**.
//
// ─── Las cuatro cosas que comprueba ────────────────────────────────────────
//
//  1. **El tutor no conoce el catálogo.** Ningún archivo de `packages/tutor/`
//     importa `cosmeticos.ts` ni `alias.ts`, ni nombra sus funciones, sus tipos
//     o las tablas donde viven los cosméticos. La lista está escrita A MANO
//     (D-070): si se importara del módulo que vigila, el auditor aprobaría su
//     propia violación.
//  2. **El sobre no tiene dónde meterlos.** `CAMPOS_DEL_SOBRE` y la interfaz
//     `SobreParaLarry` no pueden tener un campo de avatar, alias o cosmético —
//     el mismo mecanismo con el que ya excluyen `rtMs`, puntos y racha.
//  3. **El texto autorado no los menciona.** Ni las claves ni las cadenas del
//     i18n de Larry (`apps/web/src/i18n/reto/*.json` y `…/larry/*.json`) hablan
//     de avatar, alias o cosméticos. OJO: «marco» NO se prohíbe — en este
//     corpus es el marco de diez, un manipulable matemático (`k.marco.faltan`).
//  4. **Los ids del catálogo, cuando exista.** `cosmetic_catalog` y
//     `content/cosmeticos.json` son territorio del frente #255, en construcción
//     en paralelo. Este auditor los busca; el día que aterricen, cada id del
//     catálogo queda prohibido en el tutor y en el i18n de Larry sin tocar una
//     línea de este archivo. Mientras no existan, lo dice en las notas — no
//     pasa en verde en silencio sobre ese hueco.
//
// LO QUE NO PUEDE COMPROBAR: lo que un modelo diga EN VIVO sobre la apariencia
// sin usar ninguna de estas palabras — «ese estilo no es de alguien bueno en
// matemáticas» no contiene ningún id. Esa mitad es de la carta adversarial
// `anti-humillacion`, que este mismo issue extiende a avatar, alias y
// cosméticos. Doble guardián: estructural aquí, semántico allá.

import { archivos, leer, existe, informar, sinComentarios } from "./lib/repo.mjs";

const TUTOR = /^packages\/tutor\/src\//;
const I18N_LARRY = /^apps\/web\/src\/i18n\/(reto|larry)\/[^/]+\.json$/;
const SOBRE = "packages/motor/src/explicacion.ts";

/**
 * Lo que jamás puede aparecer en el código del tutor. Segunda fuente, escrita
 * a mano, con su razón — una lista sin razones es una lista que alguien acorta
 * sin pensar (D-070: el auditor no puede leer esta lista del módulo que vigila,
// porque entonces juzgaría con la misma fuente que el código usa para decidir).
 */
const PROHIBIDOS_EN_TUTOR = [
  ["cosmeticos.ts", "importarlo le da al tutor el catálogo entero: qué existe y qué se gana"],
  ["alias.ts", "importarlo le da al tutor la identidad pública del niño"],
  ["cosmeticosQueDesbloquea", "la función que sabe QUÉ ganó el niño. Quien la nombra puede comentarlo"],
  ["validarReglas", "la otra puerta al catálogo"],
  ["ReglaDeDesbloqueo", "el tipo de las reglas: nombrarlo es poder recorrer el catálogo"],
  ["TIPOS_DE_EVENTO", "el enum de logros que desbloquean: «ganaste el marco por tu racha de 7»"],
  ["generarAlias", "la función que sabe CÓMO se llama el niño en público"],
  ["aliasPermitido", "su validadora: nombrarla es poder hablar del alias"],
  ["AliasGenerado", "el tipo del alias"],
  ["cosmetic_catalog", "la tabla del catálogo"],
  ["cosmetic_unlock_rules", "la tabla de las reglas de desbloqueo"],
  ["child_cosmetics_unlocked", "la tabla de lo que ESTE niño ya ganó — la más peligrosa de las tres"],
  ["avatar_parts", "la columna del perfil con lo que el niño lleva puesto"],
];

/**
 * Campos que jamás entran al sobre. Mismo mecanismo y misma razón que la lista
 * de `larry-nunca-calcula`: un campo nuevo en el veredicto del Worker de
 * ingesta no debe poder viajar hasta Larry por un `...spread`.
 */
const PROHIBIDOS_EN_SOBRE = [
  ["avatar", "lo que el niño lleva puesto no es asunto del que explica matemáticas (mc-43 §10)"],
  ["alias", "la identidad pública del niño. Un bot que «elogia» un nombre también puede juzgarlo"],
  ["cosmetico", "un cosmético ganado es una recompensa; comentarlo mueve el feedback al nivel «yo»"],
  ["cosmetic", "lo mismo, en el idioma del esquema"],
  ["equipado", "el estado del armario del niño"],
  ["marco", "candidato obvio a cosmético («marco dorado»). En el i18n NO se prohíbe: ahí es el marco de diez"],
];

/**
 * Palabras que no pueden aparecer NI en una clave NI en una cadena del i18n de
 * Larry, en ninguno de los siete locales. Coincidencia por subcadena en minúsculas,
// sin fronteras de palabra: «cosméticos», «cosmétique» y «cosmetic» comparten
// raíz, y una frontera `\b` de JavaScript no entiende la `é` (lección medida de
// `conFronteraUnicode`; aquí la subcadena es más simple y más segura).
 *
 * «avatar» y «alias» se escriben igual en los siete locales. «marco»/«sombrero»
 * NO están: son objetos contables de los problemas de kinder, y prohibirlos
 * castigaría el contenido matemático, no la frontera.
 */
const PROHIBIDOS_EN_I18N = ["avatar", "alias", "cosmétic", "cosmetic", "kosmetik"];

const problemas = [];
const notas = [];
let revisados = 0;

// --- 1. El tutor no conoce el catálogo --------------------------------------
//
// Se mira el código SIN comentarios: `prefijo.ts` y `en-vivo.ts` usan la palabra
// «cosmética» en sus comentarios para explicar decisiones ajenas, y un auditor
// que castiga documentar se acaba anulando por costumbre. Las cadenas SE quedan:
// son el prompt que viaja al modelo, y ahí es exactamente donde viviría la
// violación. Las pruebas (`*.prueba.mjs`) quedan fuera del escaneo de palabras:
// `en-vivo.prueba.mjs` planta un `alias: "Rino"` a propósito para verificar que
// NO viaja en la metadata — prohibirle la palabra sería prohibir la prueba de
// la regla.
const delTutor = archivos(TUTOR);
const deProducto = delTutor.filter((f) => !f.endsWith(".prueba.mjs"));

for (const f of delTutor) {
  revisados++;
  const codigo = sinComentarios(leer(f) ?? "");
  for (const [token, porQue] of PROHIBIDOS_EN_TUTOR) {
    if (codigo.includes(token)) {
      problemas.push(
        `${f} menciona \`${token}\`: ${porQue}. Línea roja #7 y mc-43 §10 — Larry no puede ` +
          "comentar lo que no puede conocer, y este token es el conocimiento.",
      );
    }
  }
}

for (const f of deProducto) {
  const codigo = sinComentarios(leer(f) ?? "").toLowerCase();
  for (const palabra of PROHIBIDOS_EN_I18N) {
    if (codigo.includes(palabra)) {
      problemas.push(
        `${f} contiene «${palabra}» en su código o en sus cadenas. El prompt y el canon de Larry ` +
          "no hablan de apariencia ni de identidad: su voz se queda en la matemática (mc-43 §10).",
      );
    }
  }
}

// --- 2. El sobre no tiene dónde meterlos ------------------------------------
//
// La frontera fuerte ya la hace `larry-nunca-calcula` (lista blanca cerrada,
// sellado campo por campo). Esta es la mitad que le toca a ESTE issue: que de
// los campos que la lista blanca admite mañana, ninguno sea de cosméticos. Se
// demuestra con el auditor, no con un cambio — la lista blanca ya los excluye
// por construcción.
const fuenteSobre = existe(SOBRE) ? leer(SOBRE) : null;
if (!fuenteSobre) {
  // Fallar CERRADO: si el módulo se renombra, este auditor se quedaría sin la
  // mitad de su frontera y saldría en verde sobre ella.
  problemas.push(
    `no existe \`${SOBRE}\`. Ahí vive la lista blanca del sobre; sin ella la mitad estructural ` +
      "de esta frontera no la hace cumplir nadie.",
  );
} else {
  revisados++;
  const listaCruda = fuenteSobre.match(/CAMPOS_DEL_SOBRE\s*=\s*\[([\s\S]*?)\]/);
  const interfaz = fuenteSobre.match(/interface\s+SobreParaLarry\s*\{([\s\S]*?)\n\}/);
  if (!listaCruda) {
    problemas.push("no encuentro `CAMPOS_DEL_SOBRE` en el módulo del sobre. La lista blanca ES la frontera.");
  }
  const declarados = listaCruda ? [...listaCruda[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]) : [];
  for (const [campo, porQue] of PROHIBIDOS_EN_SOBRE) {
    const enLista = declarados.some((d) => d.toLowerCase() === campo);
    const enInterfaz = interfaz
      ? new RegExp(`(^|\\n)\\s*${campo}\\s*\\??\\s*:`, "i").test(interfaz[1])
      : false;
    if (enLista || enInterfaz) {
      problemas.push(
        `el sobre de Larry tiene un campo \`${campo}\` (${enLista ? "en CAMPOS_DEL_SOBRE" : "en la interfaz"}). ` +
          `${porQue}. #257: el sobre excluye cosméticos igual que excluye \`rtMs\`, puntos y racha.`,
      );
    }
  }
}

// --- 3. El texto autorado no los menciona ------------------------------------
const i18nLarry = archivos(I18N_LARRY);
for (const f of i18nLarry) {
  revisados++;
  const texto = (leer(f) ?? "").toLowerCase();
  for (const palabra of PROHIBIDOS_EN_I18N) {
    if (texto.includes(palabra)) {
      problemas.push(
        `${f} menciona «${palabra}». Ningún texto pregenerado de Larry —clave o cadena— habla del ` +
          "avatar, del alias o de los cosméticos del niño (#257, criterio 3). Si una pieza del " +
          "catálogo necesita nombre visible, su texto vive en OTRO namespace, no en la voz del tutor.",
      );
    }
  }
}

// --- 4. Los ids del catálogo, el día que exista ------------------------------
//
// El catálogo es territorio del frente #255 (`content/cosmeticos.json`,
// `migrations/0015*`), en construcción en paralelo a este auditor. Se buscan
// sus ids en los dos sitios donde puede aterrizar, y cada id encontrado queda
// prohibido en el tutor y en el i18n de Larry. Que la lista venga del catálogo
// real es lo que hace que un cosmético NUEVO quede prohibido sin editar este
// archivo; la lista de arriba (escrita a mano) es la que vigila mientras tanto.
const idsDelCatalogo = new Set();

const jsonCatalogo = leer("content/cosmeticos.json");
if (jsonCatalogo) {
  try {
    const catalogo = JSON.parse(jsonCatalogo);
    const lista = Array.isArray(catalogo) ? catalogo : (catalogo.cosmeticos ?? catalogo.catalogo ?? []);
    for (const pieza of lista) {
      if (pieza && typeof pieza.id === "string" && pieza.id) idsDelCatalogo.add(pieza.id);
    }
  } catch {
    problemas.push("`content/cosmeticos.json` no parsea como JSON. No se puede vigilar lo que no se puede leer.");
  }
}
for (const sql of archivos(/^migrations\/.*\.sql$/)) {
  const texto = leer(sql) ?? "";
  if (!/cosmetic_catalog/i.test(texto)) continue;
  // INSERT INTO cosmetic_catalog (id, ...) VALUES ('marco_dorado', …)
  for (const m of texto.matchAll(/INSERT\s+INTO\s+cosmetic_catalog[^;]*?VALUES\s*\(\s*'([^']+)'/gi)) {
    idsDelCatalogo.add(m[1]);
  }
}

if (idsDelCatalogo.size === 0) {
  notas.push(
    "el catálogo de cosméticos todavía no existe (#255, en construcción): la vigilancia de ids " +
      "queda armada y la segunda fuente escrita a mano es la que manda mientras tanto",
  );
} else {
  for (const f of [...deProducto, ...i18nLarry]) {
    revisados++;
    const texto = sinComentarios(leer(f) ?? "");
    for (const id of idsDelCatalogo) {
      if (texto.includes(id)) {
        problemas.push(
          `${f} menciona el cosmético \`${id}\` del catálogo. Un id de \`cosmetic_catalog\` en la voz ` +
            "o en el código de Larry es la frontera cruzada con nombre propio (#257, mc-43 §10).",
        );
      }
    }
  }
  notas.push(`${idsDelCatalogo.size} id(s) del catálogo prohibidos en el tutor y en el i18n de Larry`);
}

if (revisados > 0) {
  notas.push(`${PROHIBIDOS_EN_TUTOR.length} tokens prohibidos en el tutor · ${PROHIBIDOS_EN_SOBRE.length} campos prohibidos en el sobre`);
  notas.push(`${i18nLarry.length} archivos de i18n de Larry sin avatar/alias/cosméticos`);
}

informar({
  nombre: "larry-sin-cosmeticos",
  problemas,
  notas,
  cita: "#257, línea roja #7, D-004, D-014, D-080, mc-43 §10",
  revisados,
  resumen: `${deProducto.length} archivo(s) del tutor + sobre + ${i18nLarry.length} de i18n`,
  porQueBloquea:
    "con D-080 el tutor y el compañero son la misma criatura: si el código de Larry puede conocer " +
    "el avatar o los cosméticos del niño, «qué bonito tu sombrero» lo escribe un modelo, y la misma " +
    "puerta sirve para «qué feo te quedó». La frontera es estructural o no es.",
  noComprueba: [
    "lo que un modelo diga EN VIVO sobre la apariencia sin usar ninguna de estas palabras ni ids. " +
      "Esa mitad es semántica y la caza la carta adversarial `anti-humillacion`, extendida por este " +
      "mismo issue (mc-43 en sus citas, avatar/alias/cosméticos en su `caza`).",
    "que el mapa o el armario pinten cosméticos. Eso es producto legítimo (D-014, fila «cosméticos " +
      "ganados»): la frontera no es que existan, es que LARRY no los comente.",
  ],
});
