// La regla 1, segunda capa: que la evidencia exista de verdad.
//
// La primera capa (`citas.mjs`) verifica que la **cita** exista en el repo. La
// primera corrida completa demostró que eso no alcanza: `locale-pt-PT` citó
// D-022 —que existe— y luego afirmó que `pt-PT.json` contenía la cadena
// `"Ainda sem versión pública"`. El archivo dice `"versão"`. **La cita era real
// y la evidencia inventada**, y el hallazgo salió clasificado como bloqueante.
//
// De 2 veredictos bloqueantes en esa corrida, uno estaba fabricado. Una tasa
// así es exactamente el ruido que D-032 nombra como el riesgo de la flota.
//
// Lo que hace esta capa: extrae las cadenas que el auditor dice haber visto —lo
// que puso entre comillas, comillas angulares o acentos graves— y comprueba que
// aparezcan de verdad en lo que se le mostró. Si ninguna aparece, el hallazgo
// deja de bloquear.
//
// **Se compara contra el turno completo, no solo contra el diff.** Al auditor
// se le dan también los textos de sus decisiones y los resúmenes de su
// investigación, y citar de ahí es legítimo — de hecho es lo que le pedimos.
// Comparar solo contra el diff marcaría como fabricada toda cita correcta a una
// decisión.
//
// Lo que esta capa NO puede hacer, dicho antes de que alguien lo suponga:
// un auditor que parafrasea en vez de citar no deja cadenas que verificar, y
// pasa sin comprobación. Se detecta la fabricación literal, no la interpretación
// equivocada — que fue el otro fallo de esa misma corrida, y ese no tiene
// arreglo determinista.

/** Longitud mínima de una cita para que valga la pena verificarla. */
const MIN = 8;

/**
 * Extrae lo que el auditor presenta como citado textualmente.
 *
 * Se cubren las cuatro formas que usan los modelos al escribir en español:
 * acentos graves, comillas dobles rectas, comillas angulares y comillas
 * tipográficas.
 */
export function extraerCitasTextuales(texto) {
  if (typeof texto !== "string") return [];
  const patrones = [
    /`([^`\n]{8,200})`/g,
    /"([^"\n]{8,200})"/g,
    /«([^»\n]{8,200})»/g,
    /[“”]([^“”\n]{8,200})[“”]/g,
    /'([^'\n]{8,200})'/g,
  ];
  const fuera = new Set();
  for (const p of patrones) {
    for (const m of texto.matchAll(p)) {
      const s = m[1].trim();
      if (s.length >= MIN) fuera.add(s);
    }
  }
  return [...fuera];
}

/**
 * Normaliza para comparar. El modelo reescribe espacios y saltos al citar, y
 * exigir coincidencia byte a byte marcaría como fabricada una cita correcta que
 * solo cambió un salto de línea por un espacio.
 *
 * NO se normalizan acentos: el fallo que motivó todo esto fue exactamente
 * `versión` contra `versão`, y quitar diacríticos lo haría invisible.
 */
const normalizar = (s) => s.replace(/\s+/g, " ").trim().toLowerCase();

/**
 * ¿La evidencia de este hallazgo existe en lo que el auditor vio?
 *
 * Devuelve `{ verificable, citas, encontradas, faltantes }`.
 *
 * `verificable: true` significa una de dos cosas: que al menos una cita textual
 * se encontró, o que el auditor no citó nada textualmente (y entonces no hay
 * nada que desmentir). Ese segundo caso es una limitación conocida, no un pase.
 */
export function verificarEvidencia(hallazgo, turnoMostrado) {
  const citas = extraerCitasTextuales(hallazgo?.evidencia ?? "");
  if (citas.length === 0) {
    return { verificable: true, sinCitas: true, citas: [], encontradas: [], faltantes: [] };
  }

  const heno = normalizar(turnoMostrado ?? "");
  const encontradas = [];
  const faltantes = [];
  for (const c of citas) {
    (heno.includes(normalizar(c)) ? encontradas : faltantes).push(c);
  }

  return {
    verificable: encontradas.length > 0,
    sinCitas: false,
    citas,
    encontradas,
    faltantes,
  };
}

/**
 * ¿El archivo del hallazgo es uno de los que se le mostraron al auditor?
 *
 * En la corrida real, `red-lenta` reportó sobre `wrangler.toml (no incluido en
 * el diff)` — y lo decía en el propio campo. Un hallazgo sobre un archivo que
 * el auditor nunca vio es, en el mejor caso, una conjetura razonable; no es
 * evidencia, y no puede detener a nadie.
 */
export function archivoFueMostrado(archivo, archivosMostrados) {
  const limpio = String(archivo ?? "").split(",")[0].replace(/\s*\([^)]*\)\s*$/, "").trim();
  if (!limpio) return false;
  return archivosMostrados.some((a) => a === limpio || a.endsWith(`/${limpio}`) || limpio.endsWith(`/${a}`));
}
