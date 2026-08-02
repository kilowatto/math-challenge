#!/usr/bin/env node
// Auditor determinista — ningún componente Astro se usa sin importarlo
//
// Hace cumplir: #341, #342, D-032.
//
// ─── Por qué existe ────────────────────────────────────────────────────────
//
// `components/paginas/PerfilNuevo.astro` usaba `<Marca …/>` en dos sitios y NO
// la importaba. Lo que pasa entonces no es un error: Astro compila el archivo,
// `astro build` sale con 0, `wrangler deploy` sube, y la ruta responde **200
// con cero bytes de cuerpo**. Una página en blanco con estado de éxito.
//
// Y esa página era la de crear el primer perfil de hijo. O sea: no se podía
// crear un perfil, así que no se podía llegar a un solo reto — el producto
// entero era inalcanzable desde una cuenta nueva, con el gate en verde.
//
// `astro check` SÍ lo decía, con estas palabras: `ts(2304): Cannot find name
// 'Marca'`. Estaba enterrado en una lista de errores que alguien había marcado
// como «preexistentes» y que nadie volvió a leer. Un aviso que nadie lee no es
// un aviso: por eso esto es un auditor que bloquea y no una recomendación.
//
// ─── Por qué no es `astro check` a secas ───────────────────────────────────
//
// Porque `astro check` tarda decenas de segundos, necesita `node_modules`
// instalado y falla por 40 razones más que no son ésta — que es exactamente
// cómo su salida se convirtió en ruido ignorable. Esto son milisegundos, no
// depende de nada instalado, y solo dice una cosa.
//
// ─── Por qué no puede ser cierto por construcción (D-070) ──────────────────
//
// Cruza dos fuentes que nadie escribe a la vez: los nombres que la PLANTILLA
// usa como etiqueta, y los nombres que el FRONTMATTER liga. Un archivo nuevo
// puede tener cualquiera de las dos listas sin la otra — de hecho eso es
// exactamente lo que pasó — y el auditor solo pasa si coinciden.
//
// ─── LO QUE ESTE AUDITOR NO COMPRUEBA ──────────────────────────────────────
//
//  · Que el archivo importado EXISTA. `import Marca from "../Marca.astro"`
//    apuntando a una ruta borrada pasa por aquí; eso sí lo revienta el build.
//  · Que las props que se le pasan sean las que el componente declara. Eso es
//    TypeScript y `astro check`, y esto no pretende sustituirlo.
//  · Componentes usados desde una expresión que este análisis no ve, como
//    `{lista.map((C) => <C />)}` — la ligadura está en el parámetro y aquí se
//    da por buena.
//  · Cualquier otro motivo por el que una página pueda servir 200 vacío. Este
//    auditor cubre UNA causa, la que ya ocurrió.

import { archivos, leer, informar } from "./lib/repo.mjs";

const problemas = [];
const notas = [];

/**
 * Nombres en mayúscula que Astro/JSX resuelven sin que nadie los importe.
 *
 * `Fragment` es la única etiqueta con nombre propio del compilador. `Astro` se
 * lista porque `<Astro.self />` es recursión legítima de un componente.
 */
const GLOBALES = new Set(["Fragment", "Astro"]);

const ASTRO_DE_WEB = /^apps\/web\/src\/.*\.astro$/;

function partir(texto) {
  const m = texto.match(/^---\r?\n([\s\S]*?)\r?\n---([\s\S]*)$/);
  return m ? { frontmatter: m[1], plantilla: m[2] } : { frontmatter: "", plantilla: texto };
}

/**
 * La plantilla sin lo que no es marcado: comentarios de Astro, comentarios de
 * HTML, y el contenido de `<style>` y `<script>`.
 *
 * Sin esto, un `<Marca>` citado dentro de un comentario que explica por qué se
 * quitó contaría como uso — la misma clase de falso positivo que ya obligó a
 * escribir `sinComentarios` en `lib/repo.mjs`, cuatro veces.
 */
function marcadoLimpio(plantilla) {
  return plantilla
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/\/\*[\s\S]*?\*\//g, " ");
}

/**
 * Los nombres que el frontmatter LIGA: importados, declarados o desestructurados.
 *
 * Se es deliberadamente generoso. Un falso positivo aquí bloquea un commit
 * legítimo, y un auditor que hace eso se anula por costumbre hasta que deja de
 * guardar nada.
 */
function ligados(frontmatter) {
  const nombres = new Set();

  // import X from "…"   ·   import X, { A as B } from "…"   ·   import * as X
  for (const m of frontmatter.matchAll(/import\s+([\s\S]*?)\s+from\s+["'`]/g)) {
    const clausula = m[1];
    for (const n of clausula.matchAll(/[A-Za-z_$][\w$]*/g)) nombres.add(n[0]);
  }
  // const X = …  ·  let X = …  ·  function X()  ·  class X
  for (const m of frontmatter.matchAll(/\b(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/g)) {
    nombres.add(m[1]);
  }
  // const { X, Y } = …   ·   const [X] = …
  for (const m of frontmatter.matchAll(/\b(?:const|let|var)\s*[{[]([^}\]]*)[}\]]\s*=/g)) {
    for (const n of m[1].matchAll(/[A-Za-z_$][\w$]*/g)) nombres.add(n[0]);
  }
  return nombres;
}

/** Las etiquetas de componente que usa la plantilla: `<Foo`, `<Foo.Bar`. */
function usados(marcado) {
  const nombres = new Set();
  for (const m of marcado.matchAll(/<([A-Z][A-Za-z0-9_$]*)(?:\.[A-Za-z0-9_$]+)*[\s/>]/g)) {
    nombres.add(m[1]);
  }
  return nombres;
}

const paginas = archivos(ASTRO_DE_WEB);
let etiquetasRevisadas = 0;

for (const archivo of paginas) {
  const texto = leer(archivo);
  if (texto === null) continue;
  const { frontmatter, plantilla } = partir(texto);
  const marcado = marcadoLimpio(plantilla);
  const enPlantilla = usados(marcado);
  if (enPlantilla.size === 0) continue;

  const enFrontmatter = ligados(frontmatter);
  etiquetasRevisadas += enPlantilla.size;

  for (const nombre of enPlantilla) {
    if (GLOBALES.has(nombre) || enFrontmatter.has(nombre)) continue;
    problemas.push(
      `${archivo} usa <${nombre}> y no liga «${nombre}» en su frontmatter. ` +
        "Astro compila igual, el build sale con 0 y el despliegue sube: lo que se sirve es un 200 con " +
        "CERO BYTES. Pasó con <Marca> en PerfilNuevo.astro y dejó imposible crear un perfil de hijo, o " +
        "sea imposible llegar a un solo reto. Impórtalo, o quítalo de la plantilla.",
    );
  }
}

notas.push(`${paginas.length} archivo(s) .astro revisados`);
notas.push(`${etiquetasRevisadas} etiqueta(s) de componente cruzadas contra su frontmatter`);

informar({
  nombre: "componente-sin-importar",
  problemas,
  notas,
  cita: "#341, #342, D-032",
  revisados: paginas.length,
  resumen: `${paginas.length} .astro, ${etiquetasRevisadas} etiqueta(s) de componente`,
  porQueBloquea:
    "el síntoma no es un error sino una página en blanco con estado 200 — el modo de fallo que ni el " +
    "build, ni el despliegue, ni una prueba de humo que mire el código de respuesta pueden ver.",
  noComprueba: [
    "que el archivo importado exista: un import a una ruta borrada pasa por aquí (lo revienta el build)",
    "que las props coincidan con las que el componente declara — eso es astro check",
    "componentes ligados dentro de una expresión, como {lista.map((C) => <C />)}",
    "cualquier otra causa de un 200 vacío; esto cubre la que ya ocurrió",
  ],
});
