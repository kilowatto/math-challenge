#!/usr/bin/env node
// Auditor determinista 09 — Core Web Vitals de CAMPO
//
// Hace cumplir: D-030 (INP ≤150 ms, LCP ≤2.5 s, CLS ≤0.1), D-037 (se mide, y
// jamás sobre un niño), `mc-47` §4.
//
// Por qué existe, y por qué no lo cubre `bundle-budget`. Ese pesa el bundle,
// que es *una causa* del rendimiento, no el rendimiento. `mc-47` §4 lo dice sin
// rodeos: Google rankea con datos de campo, y "un 100 perfecto en Lighthouse no
// significa nada si los usuarios reales en redes 3G sufren". El único número que
// describe la experiencia real viene del navegador de un usuario real.
//
// De dónde sale el dato. De nosotros, sin beacon de terceros:
// `apps/web/src/components/Rum.astro` observa con `PerformanceObserver` y manda
// a `apps/web/src/pages/api/rum.ts`, que escribe en el dataset de Analytics
// Engine `math-challenge-vitals-ae` (binding `VITALS_AE`) con
// blobs [metrica, banda, locale, pais] y doubles [valor].
//
// Se evalúa a **p75**, que es como los evalúa Google: no el promedio, que un
// puñado de sesiones rápidas maquilla, sino el percentil 75 — tres de cada
// cuatro visitas por debajo.
//
// ─────────────────────────────────────────────────────────────────────────────
// ESTADO: INACTIVO. Sale con 0 y explica por qué. Dos razones, ninguna de estilo.
// ─────────────────────────────────────────────────────────────────────────────
//
// RAZÓN 1 — la API GraphQL no puede responder esta pregunta. No es que no sepa
// escribir la consulta: el conjunto `workersAnalyticsEngineAdaptiveGroups` **no
// expone blobs ni doubles**. Se comprobó por introspección contra la API real
// (2026-07-31), no por memoria:
//
//     { __type(name: "AccountWorkersAnalyticsEngineAdaptiveGroups")
//         { fields { name } } }
//     → count, confidence, dimensions
//
//     { __type(name: "AccountWorkersAnalyticsEngineAdaptiveGroupsDimensions")
//         { fields { name } } }
//     → dataset, date, datetime, datetimeFifteenMinutes, datetimeFiveMinutes,
//       datetimeHour, datetimeMinute
//
//     { __type(name: "AccountWorkersAnalyticsEngineAdaptiveGroupsFilter_InputObject")
//         { inputFields { name } } }
//     → AND, OR, dataset*, date*, datetime* — y nada más
//
// O sea: por GraphQL se puede saber **cuántos** eventos hubo y cuándo, y nada
// sobre qué eran. No hay percentil, no hay valor, y —lo que más importa aquí—
// **no hay forma de ver la banda**, así que tampoco podría cazar un dato de
// KINDER. Una consulta GraphQL que "pasara" sería un auditor ciego con cara de
// auditor verde, que es exactamente el bug que este repo ya tuvo una vez
// (`audits/secrets.mjs` con `git ls-files` en un repo sin commits).
//
// La consulta GraphQL queda escrita abajo en `CONSULTA_GRAPHQL_INSUFICIENTE`,
// verificada como válida contra el esquema, para que nadie vuelva a gastar la
// tarde averiguando que no alcanza.
//
// Lo que sí sirve es la **API SQL de Analytics Engine**, que es el otro extremo
// del mismo dato y sí expone `blob1..blob20`, `double1..double20` y
// `_sample_interval`. Ahí sí hay percentil ponderado y ahí sí se ve la banda.
//
// RAZÓN 2 — el token de `.env` no tiene el permiso. Ambas puertas devuelven lo
// mismo hoy con `CLOUDFLARE_API_TOKEN`:
//
//     POST /accounts/{id}/analytics_engine/sql
//     → {"success":false,"errors":[{"code":10000,"message":"Authentication error"}]}
//
//     POST /client/v4/graphql  (viewer.accounts.workersAnalyticsEngineAdaptiveGroups)
//     → "not authorized for that account"
//
// El token es válido y activo (`/user/tokens/verify` responde 200); le falta
// **Account → Account Analytics → Read**. Hasta que se le añada ese permiso, o
// se cree un token aparte, este auditor no tiene de dónde leer.
//
// Mientras tanto la lógica de veredicto —umbrales, p75, muestra mínima y la
// caza de bandas de niño— está escrita y probada contra casos sintéticos que
// viven dentro de este mismo archivo, sin ficheros de apoyo:
//
//     node audits/cwv-budget.mjs --autoprueba      6 casos con veredicto esperado
//     node audits/cwv-budget.mjs --datos f.json    filas a mano, veredicto real
//
// Lo que este auditor NO puede comprobar, dicho antes de que alguien lo suponga:
//   · Nada sobre superficies de niño. Por diseño no hay dato de campo ahí
//     (D-037), así que el rendimiento del niño en Android de gama baja —que es
//     justo el mercado objetivo de `mc-47`— sigue sin medirse en campo. Se
//     compensa en laboratorio, etiquetado como laboratorio, en otro lado.
//   · Si una regresión ya salió a producción hace tres semanas. Este mide una
//     ventana móvil; llega tarde por construcción. `bundle-budget` es el que
//     llega antes, y por eso los dos existen.
//   · Si el beacon dejó de mandar. Cero datos aquí y "el sitio va perfecto" se
//     ven igual desde afuera; por eso cero datos NUNCA se reporta como verde.

const RAIZ = new URL("..", import.meta.url).pathname;

// Umbrales de D-030. INP en 150 y no en 200 a propósito: `mc-47` §4 documenta
// que 200 es donde falla el 43% de la web, y esto es un juego de alta frecuencia
// de interacción — el perfil exacto donde INP se rompe.
const UMBRALES = {
  INP: { max: 150, unidad: "ms" },
  LCP: { max: 2500, unidad: "ms" },
  CLS: { max: 0.1, unidad: "" },
};

// TTFB y FCP se recolectan (ver `rum.ts`) pero D-030 no les fija umbral. Se
// imprimen como contexto y no bloquean: un auditor que bloquea con un número que
// nadie decidió está opinando, y D-032 dice que entonces no bloquea.
const INFORMATIVAS = ["TTFB", "FCP"];

// Bandas que jamás deben aparecer en el dato de campo (D-037, línea roja #2).
// El cliente no carga el script ahí y el endpoint las rechaza; si aun así
// aparecen, uno de los dos filtros se rompió y se está midiendo a un niño.
const BANDAS_DE_NINO = new Set(["KINDER", "PRIMARIA"]);

// Las únicas que el endpoint acepta. Cualquier otra cosa en `blob2` significa
// que la validación de `rum.ts` tiene un agujero, y eso también es hallazgo:
// el filtro que deja pasar "KINDER " con espacio deja pasar a un niño.
const BANDAS_DE_ADULTO = new Set(["SECUNDARIA", "SERIO", "JR", "PRO", "PUBLICO"]);

// Ventana de evaluación. 28 días es lo que usa CrUX, y coincide con lo que hace
// falta para que un cambio desplegado se note sin que un mal día lo domine.
const DIAS = 28;

// Muestra mínima por métrica para que un p75 signifique algo, y de dónde sale
// el número en vez de ser un redondeo cómodo: el error estándar del rango de un
// cuantil es sqrt(p(1-p)/n). Con n=100, el intervalo de 95% alrededor de p75 es
// ±1.96·sqrt(0.75·0.25/100) ≈ ±8.5 puntos — o sea que el "p75" que reportas
// está en algún lugar entre p66 y p83, y con eso no se aprueba ni se reprueba
// nada. Con n=250 baja a ±5.4 puntos. Es el punto donde el número empieza a
// distinguir 140 ms de 160 ms, que es la decisión que este auditor toma.
const MINIMO_FILAS = 250;

const arg = (nombre) => {
  const i = process.argv.indexOf(nombre);
  return i >= 0 ? process.argv[i + 1] : undefined;
};

const inactivo = (razon, detalle = []) => {
  console.log(`○ cwv-budget — inactivo: ${razon}`);
  for (const d of detalle) console.log(`  · ${d}`);
  console.log(`  · la lógica está escrita y probada: node audits/cwv-budget.mjs --autoprueba`);
  process.exit(0);
};

// ── La consulta GraphQL, escrita y verificada como VÁLIDA pero INSUFICIENTE ──
//
// Compila contra el esquema real: `dataset`, `datetime_geq` y `datetime_leq`
// existen en el filtro, y `count` y `dimensions.datetimeHour` existen en el
// grupo. Sirve para una sola cosa honesta: saber si el beacon sigue mandando
// algo. No sirve para el veredicto, porque no hay ni valor ni banda que leer.
export const CONSULTA_GRAPHQL_INSUFICIENTE = `
query VitalesSoloConteo($cuenta: String!, $desde: Time!, $hasta: Time!) {
  viewer {
    accounts(filter: { accountTag: $cuenta }) {
      workersAnalyticsEngineAdaptiveGroups(
        limit: 1000
        filter: {
          dataset: "math-challenge-vitals-ae"
          datetime_geq: $desde
          datetime_leq: $hasta
        }
        orderBy: [datetimeHour_ASC]
      ) {
        count
        dimensions { datetimeHour }
      }
    }
  }
}`;

// ── Las consultas SQL, que son las que sí responden ──────────────────────────
//
// `quantileExactWeighted(q)(columna, peso)` es la firma documentada. El peso es
// `_sample_interval` porque Analytics Engine muestrea bajo carga: sin ponderar,
// un evento que representa a 20 pesa lo mismo que uno que representa a 1, y el
// percentil sale sesgado hacia el tráfico raro.
//
// Se cuentan dos cosas distintas a propósito:
//   · `filas`   = count(), las observaciones realmente almacenadas. Es lo que
//                 sostiene estadísticamente al percentil, y es contra lo que se
//                 mide `MINIMO_FILAS`.
//   · `muestras`= sum(_sample_interval), el número real estimado de eventos.
//                 Es el que se le reporta a una persona. Confundirlos hace creer
//                 que hay 40 000 datos cuando el cuantil descansa sobre 300.
const sqlPorMetrica = () => `
SELECT
  blob1 AS metrica,
  count() AS filas,
  sum(_sample_interval) AS muestras,
  quantileExactWeighted(0.75)(double1, _sample_interval) AS p75
FROM "math-challenge-vitals-ae"
WHERE timestamp >= NOW() - INTERVAL '${DIAS}' DAY
GROUP BY metrica
FORMAT JSONEachRow`;

// La segunda consulta no mide rendimiento: vigila la línea roja #2. Agrupa por
// banda para que un solo dato de KINDER sea visible. No lleva umbral ni mínimo
// de muestra — una sola fila ya es el hallazgo.
const sqlPorBanda = () => `
SELECT
  blob2 AS banda,
  count() AS filas,
  sum(_sample_interval) AS muestras
FROM "math-challenge-vitals-ae"
WHERE timestamp >= NOW() - INTERVAL '${DIAS}' DAY
GROUP BY banda
FORMAT JSONEachRow`;

/**
 * Habla con la API SQL de Analytics Engine. Devuelve filas ya parseadas.
 *
 * `FORMAT JSONEachRow` en vez de `FORMAT JSON` a propósito: la documentación
 * describe JSONEachRow con precisión ("un objeto JSON por fila, separadas por
 * salto de línea, sin encabezado ni esquema") y no describe la forma del sobre
 * de `FORMAT JSON`. Elegir el formato documentado evita adivinar un envoltorio.
 */
const consultarSQL = async (cuenta, token, sql) => {
  let res;
  let texto;
  try {
    res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${cuenta}/analytics_engine/sql`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: sql,
        signal: AbortSignal.timeout(30_000),
      },
    );
    texto = (await res.text()).trim();
  } catch (err) {
    // Sin red, con DNS caído o con la API en tiempo de espera esto NO es un
    // veredicto: es un auditor que no pudo medir. Se devuelve como error para
    // que el corredor bloquee, en vez de dejar que la promesa rechazada tumbe
    // el proceso con un rastro de pila que nadie va a leer como "falla cerrado".
    return { error: `la petición no llegó: ${err.message}` };
  }

  // Los errores vuelven en el sobre estándar de Cloudflare, no como filas.
  if (texto.startsWith("{") && texto.includes('"success":false')) {
    let mensaje = texto.slice(0, 300);
    try {
      mensaje = JSON.parse(texto).errors?.map((e) => `${e.code}: ${e.message}`).join("; ") ?? mensaje;
    } catch {}
    return { error: mensaje, estado: res.status };
  }
  if (!res.ok) return { error: texto.slice(0, 300) || `HTTP ${res.status}`, estado: res.status };

  if (texto === "") return { filas: [] };

  try {
    return { filas: texto.split("\n").filter(Boolean).map((l) => JSON.parse(l)) };
  } catch (err) {
    // Falla cerrado: una respuesta 200 que no se puede leer NO es "sin datos".
    return { error: `respuesta ilegible (${err.message}): ${texto.slice(0, 200)}` };
  }
};

/**
 * El veredicto. Está separado de la red para poder verlo fallar sin credenciales
 * y sin esperar a que existan usuarios — que es lo único que distingue una
 * prueba de regresión de una afirmación en tono seguro (CLAUDE.md § Git 3).
 *
 * Devuelve { problemas, notas, insuficientes, lineas }.
 */
export const juzgar = ({ porMetrica, porBanda }) => {
  const problemas = [];
  const insuficientes = [];
  const lineas = [];
  const notas = [];

  const num = (v) => (typeof v === "number" ? v : Number(v));

  // ── 1. La línea roja primero. No depende de la muestra ni del umbral. ──────
  //
  // Se juzga antes que el rendimiento porque un p75 excelente medido sobre un
  // niño no es un aprobado: es un problema peor con buen aspecto.
  let filasDeNino = 0;
  for (const fila of porBanda ?? []) {
    const banda = String(fila.banda ?? "");
    const filas = num(fila.filas);
    if (!Number.isFinite(filas)) {
      problemas.push(`fila de banda sin conteo legible: ${JSON.stringify(fila)}`);
      continue;
    }
    if (BANDAS_DE_NINO.has(banda)) {
      filasDeNino += filas;
      problemas.push(
        `HALLAZGO GRAVE — ${filas} medición(es) de campo con banda ${banda}. ` +
          `D-037 y la línea roja #2 dicen que un niño no se mide en campo, nunca. ` +
          `Si esto aparece, el filtro de Rum.astro o el de /api/rum se rompió y se ` +
          `está instrumentando a un menor. No es un umbral que se ajusta: se para el ` +
          `beacon, se borra la ventana afectada del dataset y se arregla el filtro.`,
      );
    } else if (!BANDAS_DE_ADULTO.has(banda)) {
      problemas.push(
        `banda desconocida "${banda}" con ${filas} fila(s). /api/rum solo acepta ` +
          `${[...BANDAS_DE_ADULTO].join(", ")}; cualquier otra cosa significa que su ` +
          `validación tiene un agujero, y el agujero que deja pasar una banda inventada ` +
          `es el mismo que deja pasar KINDER.`,
      );
    }
  }
  // Va a `notas` y no a `lineas` a propósito: `lineas` cuenta vitales dentro de
  // presupuesto y ese conteo se imprime como "N de 3". Meter aquí una nota que
  // no es una vital haría que el resumen dijera "4 de 3".
  if (filasDeNino === 0 && (porBanda?.length ?? 0) > 0) {
    notas.push(`ninguna medición de banda de niño en ${DIAS} días (D-037)`);
  }

  // ── 2. Los umbrales de D-030, a p75 ───────────────────────────────────────
  const porNombre = new Map(
    (porMetrica ?? []).map((f) => [String(f.metrica ?? ""), f]),
  );

  for (const [metrica, { max, unidad }] of Object.entries(UMBRALES)) {
    const fila = porNombre.get(metrica);
    const filas = fila ? num(fila.filas) : 0;
    const muestras = fila ? num(fila.muestras) : 0;
    const p75 = fila ? num(fila.p75) : NaN;

    if (!fila || !Number.isFinite(filas) || filas < MINIMO_FILAS) {
      // D-037: sin datos suficientes NO se dice que todo está bien. Se dice
      // cuántas hay y cuántas hacen falta, y no se bloquea el commit — porque
      // bloquear por falta de usuarios castiga al que despliega, no al que
      // rompió algo.
      insuficientes.push(
        `${metrica}: ${Number.isFinite(filas) ? filas : 0} fila(s) de ${MINIMO_FILAS} ` +
          `necesarias (faltan ${Math.max(0, MINIMO_FILAS - (Number.isFinite(filas) ? filas : 0))})`,
      );
      continue;
    }

    if (!Number.isFinite(p75)) {
      // Hay volumen pero el percentil no se pudo leer: eso es un auditor roto,
      // no un sitio lento. Falla cerrado.
      problemas.push(`${metrica}: ${filas} filas pero p75 ilegible (${JSON.stringify(fila.p75)})`);
      continue;
    }

    const fmt = (v) => (unidad === "ms" ? `${Math.round(v)} ms` : v.toFixed(3));
    if (p75 > max) {
      problemas.push(
        `${metrica} p75 = ${fmt(p75)}, presupuesto ${fmt(max)} ` +
          `(${filas} filas · ~${muestras} eventos · ${DIAS} días)`,
      );
    } else {
      lineas.push(
        `${metrica} p75 ${fmt(p75)} ≤ ${fmt(max)} · ${filas} filas · ~${muestras} eventos`,
      );
    }
  }

  for (const metrica of INFORMATIVAS) {
    const fila = porNombre.get(metrica);
    if (!fila) continue;
    const p75 = num(fila.p75);
    if (Number.isFinite(p75)) {
      notas.push(`${metrica} p75 ${Math.round(p75)} ms (sin umbral en D-030, no bloquea)`);
    }
  }

  return { problemas, insuficientes, lineas, notas };
};

// ── Impresión ────────────────────────────────────────────────────────────────

const reportar =({ problemas, insuficientes, lineas, notas }, origen) => {
  if (problemas.length > 0) {
    console.error("✗ cwv-budget\n");
    for (const p of problemas) console.error(`  · ${p}`);
    for (const i of insuficientes) console.error(`  ○ ${i}`);
    console.error(`\n  Hace cumplir: D-030, D-037, mc-47 §4`);
    console.error(`  Se evalúa a p75 porque así lo evalúa Google: el promedio lo`);
    console.error(`  maquilla un puñado de sesiones rápidas. INP está en 150 y no en`);
    console.error(`  200 porque 200 es donde falla el 43% de la web (mc-47 §4), y esto`);
    console.error(`  es un juego de alta frecuencia de interacción.`);
    process.exit(1);
  }

  if (lineas.length === 0 && insuficientes.length > 0) {
    // El caso que D-037 nombra explícitamente: no hay con qué juzgar. No se
    // aprueba, no se bloquea, y se dice el número exacto que falta.
    console.log(`○ cwv-budget — sin datos suficientes (${origen})`);
    for (const i of insuficientes) console.log(`  · ${i}`);
    for (const n of notas) console.log(`  · ${n}`);
    console.log(`  · un p75 sobre menos de ${MINIMO_FILAS} filas tiene ±8 puntos de percentil`);
    console.log(`    de incertidumbre: no distingue 140 ms de 160 ms, que es la decisión`);
    console.log(`    que este auditor toma. Callar es más honesto que aprobar.`);
    process.exit(0);
  }

  console.log(`✓ cwv-budget — ${lineas.length} de 3 vitales dentro de presupuesto (p75, ${DIAS} días, ${origen})`);
  for (const l of lineas) console.log(`  · ${l}`);
  for (const i of insuficientes) console.log(`  ○ ${i}`);
  for (const n of notas) console.log(`  · ${n}`);
};

// ── Autoprueba ───────────────────────────────────────────────────────────────
//
// Seis casos con su veredicto esperado. Existe porque este auditor no puede
// correr contra datos reales todavía, y un auditor que nunca se vio decidir es
// una intención, no un guardián (CLAUDE.md § Git 3). Cada caso está construido
// para que UNA sola cosa cambie respecto al caso limpio.
const CASOS = [
  {
    nombre: "limpio: los tres dentro de presupuesto",
    datos: {
      porMetrica: [
        { metrica: "INP", filas: 900, muestras: 900, p75: 118 },
        { metrica: "LCP", filas: 1400, muestras: 1400, p75: 2100 },
        { metrica: "CLS", filas: 1400, muestras: 1400, p75: 0.04 },
        { metrica: "TTFB", filas: 1400, muestras: 1400, p75: 310 },
      ],
      porBanda: [
        { banda: "PUBLICO", filas: 3200, muestras: 3200 },
        { banda: "SECUNDARIA", filas: 500, muestras: 500 },
      ],
    },
    espera: { problemas: 0, insuficientes: 0, lineas: 3 },
  },
  {
    nombre: "INP a 168 ms: pasaría el umbral flojo de 200, reprueba el de D-030",
    datos: {
      porMetrica: [
        { metrica: "INP", filas: 900, muestras: 900, p75: 168 },
        { metrica: "LCP", filas: 1400, muestras: 1400, p75: 2100 },
        { metrica: "CLS", filas: 1400, muestras: 1400, p75: 0.04 },
      ],
      porBanda: [{ banda: "PUBLICO", filas: 3200, muestras: 3200 }],
    },
    espera: { problemas: 1, insuficientes: 0, lineas: 2 },
  },
  {
    nombre: "CLS en 0.1 exacto: el umbral es ≤, no <",
    datos: {
      porMetrica: [
        { metrica: "INP", filas: 900, muestras: 900, p75: 118 },
        { metrica: "LCP", filas: 1400, muestras: 1400, p75: 2100 },
        { metrica: "CLS", filas: 1400, muestras: 1400, p75: 0.1 },
      ],
      porBanda: [{ banda: "PUBLICO", filas: 3200, muestras: 3200 }],
    },
    espera: { problemas: 0, insuficientes: 0, lineas: 3 },
  },
  {
    nombre: "una sola medición de KINDER, con todo lo demás perfecto",
    datos: {
      porMetrica: [
        { metrica: "INP", filas: 900, muestras: 900, p75: 90 },
        { metrica: "LCP", filas: 1400, muestras: 1400, p75: 1200 },
        { metrica: "CLS", filas: 1400, muestras: 1400, p75: 0.01 },
      ],
      porBanda: [
        { banda: "PUBLICO", filas: 3200, muestras: 3200 },
        { banda: "KINDER", filas: 1, muestras: 1 },
      ],
    },
    espera: { problemas: 1, insuficientes: 0, lineas: 3 },
  },
  {
    nombre: "banda inventada: el agujero de validación que deja pasar a un niño",
    datos: {
      porMetrica: [
        { metrica: "INP", filas: 900, muestras: 900, p75: 90 },
        { metrica: "LCP", filas: 1400, muestras: 1400, p75: 1200 },
        { metrica: "CLS", filas: 1400, muestras: 1400, p75: 0.01 },
      ],
      porBanda: [{ banda: "kinder", filas: 12, muestras: 12 }],
    },
    espera: { problemas: 1, insuficientes: 0, lineas: 3 },
  },
  {
    nombre: "beacon recién desplegado: nada que juzgar, y no se aprueba",
    datos: {
      porMetrica: [{ metrica: "LCP", filas: 31, muestras: 31, p75: 900 }],
      porBanda: [{ banda: "PUBLICO", filas: 31, muestras: 31 }],
    },
    espera: { problemas: 0, insuficientes: 3, lineas: 0 },
  },
];

const autoprueba = () => {
  let malos = 0;
  for (const { nombre, datos, espera } of CASOS) {
    const v = juzgar(datos);
    const real = {
      problemas: v.problemas.length,
      insuficientes: v.insuficientes.length,
      lineas: v.lineas.length,
    };
    const bien =
      real.problemas === espera.problemas &&
      real.insuficientes === espera.insuficientes &&
      real.lineas === espera.lineas;
    console.log(`  ${bien ? "✓" : "✗"} ${nombre}`);
    if (!bien) {
      malos++;
      console.log(`      esperado ${JSON.stringify(espera)}`);
      console.log(`      obtenido ${JSON.stringify(real)}`);
      for (const p of v.problemas) console.log(`      · ${p}`);
    }
  }
  if (malos > 0) {
    console.error(`\n✗ cwv-budget --autoprueba — ${malos} de ${CASOS.length} caso(s) fuera de lo esperado`);
    console.error(`  Hace cumplir: D-030, D-037, mc-47 §4`);
    process.exit(1);
  }
  console.log(`\n✓ cwv-budget --autoprueba — ${CASOS.length} casos, veredicto correcto en todos`);
  process.exit(0);
};

// ── Corredor ─────────────────────────────────────────────────────────────────

const fixture = arg("--datos");

if (process.argv.includes("--autoprueba")) {
  console.log("cwv-budget — autoprueba del veredicto (sin red, sin credenciales)\n");
  autoprueba();
} else if (fixture) {
  // Camino sintético: alimenta al juez con filas de la misma forma que devuelve
  // la API SQL. Existe para poder ver fallar este auditor hoy, sin permisos y
  // sin usuarios. Una prueba que nunca se vio fallar no prueba nada.
  const { readFileSync } = await import("node:fs");
  const { isAbsolute, join } = await import("node:path");
  const ruta = isAbsolute(fixture) ? fixture : join(RAIZ, fixture);
  let datos;
  try {
    datos = JSON.parse(readFileSync(ruta, "utf8"));
  } catch (err) {
    console.error(`✗ cwv-budget — no se pudo leer el caso sintético ${ruta}: ${err.message}`);
    process.exit(1);
  }
  if (!Array.isArray(datos.porMetrica) || !Array.isArray(datos.porBanda)) {
    console.error(`✗ cwv-budget — el caso sintético necesita porMetrica[] y porBanda[]`);
    process.exit(1);
  }
  reportar(juzgar(datos), `sintético: ${fixture}`);
} else {
  try {
    process.loadEnvFile(`${RAIZ}.env`);
  } catch {
    // Sin .env se sigue: las variables pueden venir del entorno.
  }

  const cuenta = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;

  if (!cuenta || !token) {
    inactivo("faltan CLOUDFLARE_ACCOUNT_ID y/o CLOUDFLARE_API_TOKEN", [
      "se capturan con ./scripts/set-keys.sh — nunca en la línea de comandos",
    ]);
  }

  const [metricas, bandas] = await Promise.all([
    consultarSQL(cuenta, token, sqlPorMetrica()),
    consultarSQL(cuenta, token, sqlPorBanda()),
  ]);

  const fallo = metricas.error ?? bandas.error;
  if (fallo) {
    // Un 403/401 es "todavía no tenemos llave", no "el sitio está mal". Se
    // reporta como inactivo y no bloquea el commit. Cualquier OTRO error sí
    // bloquea: falla cerrado, porque un auditor que no pudo medir y calla es
    // indistinguible de uno que midió y aprobó.
    const esPermiso =
      /Authentication error|not authorized|10000|Unauthorized/i.test(fallo) ||
      [401, 403].includes(metricas.estado ?? bandas.estado);
    if (esPermiso) {
      inactivo("el token no tiene Account → Account Analytics → Read", [
        `la API SQL respondió: ${fallo}`,
        "GraphQL tampoco sirve aquí: workersAnalyticsEngineAdaptiveGroups no expone",
        "blobs ni doubles — solo count, confidence y dimensiones de tiempo (verificado",
        "por introspección, ver el encabezado de este archivo)",
      ]);
    }
    console.error("✗ cwv-budget\n");
    console.error(`  · la consulta a Analytics Engine falló: ${fallo}`);
    console.error(`  · un auditor que no pudo medir NO es un auditor que aprobó`);
    console.error(`\n  Hace cumplir: D-030, D-037, mc-47 §4`);
    process.exit(1);
  }

  reportar(
    juzgar({ porMetrica: metricas.filas, porBanda: bandas.filas }),
    "campo, API SQL de Analytics Engine",
  );
}
