#!/usr/bin/env node
// Auditor determinista — una sola tabla de bandas y niveles
//
// Hace cumplir: D-002, D-017, D-034, D-046, `mc-15` (escaleras de grado).
//
// Por qué existe. D-017 fija la escalera de niveles y D-002 fija cómo se asigna
// el nivel. Las dos describen la MISMA tabla, y una tabla descrita en dos sitios
// se copia a un tercero en cuanto alguien la necesita en el cliente: un arreglo
// de bandas en la interfaz "para pintar el selector", otro en el worker "para
// validar", y un CHECK en SQL. Tres copias, tres verdades.
//
// El síntoma cuando divergen no es un error: es un niño colocado en N4 por el
// servidor al que la interfaz le enseña "Nivel 3".
//
// Y una regla que D-046 añadió y que es fácil de romper sin querer: **la edad no
// limita el nivel**. Un mapa de edad a nivel máximo es exactamente lo que la
// decisión prohíbe — un niño de 5 años que se coloca en N5 juega N5.
//
// LO QUE NO PUEDE COMPROBAR: si los cortes entre bandas son pedagógicamente
// correctos. Eso es `mc-15` y revisión humana.

import { archivos, leer, informar, SOLO_PRODUCTO, palabra } from "./lib/repo.mjs";

// El guion bajo, por tercera vez: `NIVELES_POR_BANDA` no tiene frontera `\b`
// después de NIVELES, así que la constante real del motor era invisible y el
// auditor informaba «todavía no hay tabla de bandas» con la tabla delante.
const DECLARA_BANDAS = /(?<![A-Za-z0-9])(BANDAS|BANDS|NIVELES|LEVELS|LADDER|ESCALERA)\w*\s*(?::\s*[^=]*)?=\s*[[{]/;
const NIVEL = /\bN(?:[1-9]|10)\b/g;
// Lo que D-046 prohíbe es que la EDAD limite el nivel, no que exista un tope de
// escalera. La primera versión marcaba `NIVEL_MAXIMO = 12` —el techo de D-017,
// que es lo contrario de un tope por edad— porque `nivel_?max\w*` bastaba.
//
// Ahora hacen falta las DOS cosas en la misma línea: algo que hable de nivel y
// algo que hable de edad. `nivel_max_por_edad` la tiene; `NIVEL_MAXIMO` no.
const HABLA_DE_NIVEL = palabra("level", "nivel", "grade", "banda", "band");
const HABLA_DE_EDAD = palabra("edad", "age", "years?_?old", "anios", "años", "birth_?year", "cumple\\w*");
const TOPE = palabra("max\\w*", "cap", "limite", "limit", "tope", "restring\\w*", "hasta");


// Fuera los archivos de mensajes: ahí "4 años" y "nivel" son la descripción del
// producto, no una regla de negocio. Marcó `"desde los 4 años hasta el
// matemático profesional"` — que es literalmente lo contrario de un tope por edad.
const fuentes = archivos(/\.(ts|tsx|js|jsx|mjs|json|sql)$/)
  .filter((f) => SOLO_PRODUCTO.test(f))
  .filter((f) => !/\/i18n\//.test(f));
const problemas = [];
const notas = [];
const declaradores = [];

for (const archivo of fuentes) {
  const texto = leer(archivo) ?? "";
  const esSql = archivo.endsWith(".sql");

  if (DECLARA_BANDAS.test(texto)) declaradores.push(archivo);

  // Un CHECK en SQL que enumera niveles es una segunda tabla, aunque se llame
  // restricción. Se acepta —es la defensa de la base— pero se anota, porque si
  // la enumeración deja de coincidir con la del código, el insert falla en
  // producción y en ninguna prueba.
  if (esSql && /CHECK\s*\([^)]*\bN(?:[1-9]|10)\b/i.test(texto)) {
    notas.push(`${archivo}: CHECK con niveles — tiene que coincidir con la tabla del código`);
  }

  const lineas = texto.split("\n");
  for (let i = 0; i < lineas.length; i++) {
    const linea = (esSql ? lineas[i].replace(/--.*$/, "") : lineas[i].replace(/\/\/.*$/, "")).replace(/^\s*\*.*$/, "");
    if (!linea.trim()) continue;

    if (HABLA_DE_NIVEL.test(linea) && HABLA_DE_EDAD.test(linea) && TOPE.test(linea)) {
      problemas.push(
        `${archivo}:${i + 1}: la edad limita el nivel — \`${linea.trim().slice(0, 80)}\`. ` +
          "D-046: la ubicación es opcional y la edad NO limita el nivel. Un niño de 5 años " +
          "que se coloca en N5 juega N5, con el tema de kinder.",
      );
    }
  }
}


// ---------------------------------------------------------------------------
// El cruce contra `docs/decisions.md`, que es el patrón de `citas.mjs`.
//
// Lo pide el criterio de F3 con nombre y apellido, y la razón está escrita en el
// propio criterio: **esa tabla ya se desincronizó una vez**. D-010 decía
// "KINDER 4-7 / PRIMARIA 8-11" y D-017 "KINDER 4-6 / PRIMARIA 7-11", así que un
// niño de 7 años caía en dos bandas distintas según qué documento se leyera.
//
// El documento manda. Si el código y la tabla difieren, este auditor no decide
// cuál tiene razón — dice que difieren y para el commit, que es lo único
// honesto que puede hacer un programa aquí.
// ---------------------------------------------------------------------------

const decisiones = leer("docs/decisions.md") ?? "";

/** Lee la tabla de D-010: banda → d, peso de velocidad. */
function parametrosDeD010(texto) {
  const seccion = texto.slice(texto.indexOf("## D-010"), texto.indexOf("## D-011"));
  const out = {};
  for (const m of seccion.matchAll(/^\|\s*([A-ZÁÉÍÓÚ]+)[^|]*\|\s*([\d.—-]+)\s*\|\s*([\d.—-]+)/gm)) {
    const [, banda, d, a] = m;
    if (d.includes("—") || a.includes("—")) continue; // kinder: regla aparte
    out[banda] = { d: Number(d), a: Number(a) };
  }
  return out;
}

/** Lee la tabla de D-017: banda → rango de niveles. */
function nivelesDeD017(texto) {
  const seccion = texto.slice(texto.indexOf("## D-017"), texto.indexOf("## D-018"));
  const out = {};
  for (const m of seccion.matchAll(/^\|\s*([A-Z]+)\s*\|[^|]*\|\s*N(\d+)[–-]N(\d+)/gm)) {
    out[m[1]] = { min: Number(m[2]), max: Number(m[3]) };
  }
  return out;
}

const dDoc = parametrosDeD010(decisiones);
const nDoc = nivelesDeD017(decisiones);

if (Object.keys(dDoc).length === 0 || Object.keys(nDoc).length === 0) {
  problemas.push(
    "no pude leer las tablas de D-010 y D-017 en docs/decisions.md. Un auditor que no " +
      "encuentra su fuente aprueba siempre, así que esto es un fallo y no un pase.",
  );
} else {
  const motor = await import("../packages/motor/src/puntuacion.ts").catch(() => null);
  if (!motor) {
    problemas.push(
      "no pude importar packages/motor/src/puntuacion.ts para cruzarlo contra las tablas.",
    );
  } else {
    for (const [banda, { d, a }] of Object.entries(dDoc)) {
      const codigo = motor.PARAMETROS[banda];
      if (!codigo) {
        // KINDER no tiene fila y ESO es correcto (D-024). Cualquier otra ausencia no.
        if (banda !== "KINDER") {
          problemas.push(`D-010 declara la banda ${banda} y PARAMETROS no la tiene.`);
        }
        continue;
      }
      if (codigo.d !== d || codigo.a !== a) {
        problemas.push(
          `${banda}: el código dice d=${codigo.d}, a=${codigo.a}; D-010 dice d=${d}, a=${a}. ` +
            "Manda el documento.",
        );
      }
    }

    for (const [banda, rango] of Object.entries(nDoc)) {
      const codigo = motor.NIVELES_POR_BANDA[banda];
      if (!codigo) {
        problemas.push(`D-017 declara la banda ${banda} y NIVELES_POR_BANDA no la tiene.`);
        continue;
      }
      if (codigo.min !== rango.min || codigo.max !== rango.max) {
        problemas.push(
          `${banda}: el código dice N${codigo.min}–N${codigo.max}; D-017 dice ` +
            `N${rango.min}–N${rango.max}. Manda el documento.`,
        );
      }
    }

    notas.push(`cruzadas contra decisions.md: ${Object.keys(dDoc).length} filas de D-010, ${Object.keys(nDoc).length} de D-017`);
  }
}

// ---------------------------------------------------------------------------
// El CHECK de `league_cohort.banda` contra la tabla de D-010 (F7 #238)
//
// Es el TERCER sitio donde viven las mismas seis bandas, y el único que no
// puede derivarse del motor porque es SQL. `packages/motor/src/liga.ts` deriva
// su lista de `NIVELES_POR_BANDA` justamente para no ser un cuarto; este CHECK
// no tiene esa salida, así que se cruza aquí.
//
// El síntoma cuando divergen no es un error de compilación: es un INSERT que
// falla en producción y en ninguna prueba, la primera vez que alguien de esa
// banda entra a una liga.
// ---------------------------------------------------------------------------

/** Los nombres de banda de la tabla de D-010, incluida KINDER (que no tiene `d`). */
function bandasDeD010(texto) {
  const seccion = texto.slice(texto.indexOf("## D-010"), texto.indexOf("## D-011"));
  const out = [];
  for (const m of seccion.matchAll(/^\|\s*([A-Z]{2,})[^|]*\|/gm)) {
    if (m[1] === "Banda" || out.includes(m[1])) continue;
    out.push(m[1]);
  }
  return out;
}

const bandasDoc = bandasDeD010(decisiones);
const migracionesSql = fuentes.filter((f) => f.endsWith(".sql"));
let cohorteEncontrada = false;

for (const archivo of migracionesSql) {
  const sql = (leer(archivo) ?? "").replace(/--[^\n]*/g, "");
  const cuerpo = sql.match(/CREATE\s+TABLE\s+league_cohort\s*\(([\s\S]*?)\n\);/i)?.[1];
  if (!cuerpo) continue;
  cohorteEncontrada = true;

  const check = cuerpo.match(/banda\s+TEXT[\s\S]{0,120}?CHECK\s*\(([^)]*)\)/i)?.[1] ?? "";
  const enElCheck = [...check.matchAll(/'([A-Z]+)'/g)].map((m) => m[1]);

  if (bandasDoc.length === 0) {
    problemas.push(
      "no pude leer los nombres de banda de la tabla de D-010 para cruzarlos contra " +
        "`league_cohort.banda`. Un auditor que no encuentra su fuente aprueba siempre.",
    );
  }
  for (const b of bandasDoc) {
    if (!enElCheck.includes(b)) {
      problemas.push(
        `${archivo}: \`league_cohort.banda\` no admite '${b}', y D-010 la declara. Una banda sin ` +
          "liga se descubre en producción, con un INSERT que falla la primera vez que alguien " +
          "de esa banda entra — y en ninguna prueba.",
      );
    }
  }
  for (const b of enElCheck) {
    if (!bandasDoc.includes(b)) {
      problemas.push(
        `${archivo}: \`league_cohort.banda\` admite '${b}', que no está en la tabla de D-010. ` +
          "Manda el documento.",
      );
    }
  }
}

if (cohorteEncontrada) {
  notas.push(`league_cohort.banda cruzada contra D-010: ${bandasDoc.join(", ")}`);
}

if (declaradores.length > 1) {
  problemas.push(
    `${declaradores.length} archivos declaran la tabla de bandas o niveles (${declaradores.join(", ")}). ` +
      "D-002 y D-017 describen UNA. Dos copias divergen, y el síntoma no es un error: es un " +
      "niño colocado en N4 por el servidor al que la interfaz le enseña «Nivel 3».",
  );
}

notas.unshift(
  declaradores.length === 1
    ? `una sola tabla de bandas: ${declaradores[0]}`
    : declaradores.length === 0
      ? "todavía no hay tabla de bandas; el auditor está listo para la primera (F3)"
      : "",
);

informar({
  nombre: "tabla-bandas",
  problemas,
  notas: notas.filter(Boolean).slice(0, 6),
  cita: "D-002, D-017, D-034, D-046, mc-15",
  revisados: fuentes.length,
  resumen: `${fuentes.length} archivo(s) de producto`,
  porQueBloquea:
    "dos tablas de niveles divergentes no producen un error, producen un niño colocado " +
    "en un nivel al que la interfaz le pone otro nombre.",
  noComprueba: ["si los cortes entre bandas son pedagógicamente correctos — eso es mc-15 y revisión humana."],
});
