/**
 * Alias de niño, generados por locale. Criterio #115 de F2 · D-003, mc-34.
 *
 * ─── Por qué el niño no escribe su nombre ──────────────────────────────────
 *
 * Línea roja #3: ningún niño escribe texto libre, en ninguna superficie. Y línea
 * roja #2: el niño no es un usuario, así que no tiene nombre real guardado. El
 * alias es lo que le permite reconocerse en el tablero sin que exista un campo
 * donde alguien pueda escribir «Sofía Martínez, 7 años, Escuela Benito Juárez».
 *
 * ─── Autorados, no traducidos ──────────────────────────────────────────────
 *
 * Las siete listas son **siete listas distintas**, no una traducida siete veces.
 * «Conejo Veloz» traducido a alemán da «Schnelles Kaninchen», que es correcto y
 * suena a manual de instrucciones. Cada locale tiene animales que sus niños
 * reconocen y adjetivos que suenan a apodo en su idioma.
 *
 * `pt-BR` y `pt-PT` no comparten lista: «bacana» es brasileño y en Portugal no se
 * usa. `es-MX` y `es-ES` tampoco: «chido» es mexicano.
 *
 * ─── La lista de bloqueo valida la CADENA COMBINADA ────────────────────────
 *
 * Esta es la parte que el criterio subraya y la que es fácil hacer mal. Cada
 * palabra por separado puede ser inocente y la combinación no serlo. El criterio
 * da el ejemplo: «Pato» + «Loco». Y lo que es inocente en un locale puede no
 * serlo en otro, así que **la comprobación se hace sobre la cadena ya formada,
 * contra la lista de bloqueo de ESE locale**.
 *
 * Comprobar solo palabra por palabra —que es lo que sale natural— no vería
 * ninguna de esas combinaciones.
 *
 * ─── El sufijo es ALEATORIO, nunca secuencial ──────────────────────────────
 *
 * `Conejo0042` secuencial diría cuántos niños hay registrados y en qué orden
 * llegaron. Es la misma razón por la que los identificadores públicos no se
 * autoincrementan: un número secuencial es un censo que nadie pidió publicar.
 */

export const LOCALES_ALIAS = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"] as const;
export type LocaleAlias = (typeof LOCALES_ALIAS)[number];

interface ListaDeLocale {
  /** Sustantivos. Animales y criaturas que un niño de ese locale reconoce. */
  nombres: string[];
  /** Adjetivos que suenan a apodo, no a traducción de manual. */
  adjetivos: string[];
  /**
   * Cadenas que NO pueden aparecer en el alias formado, comparadas sin acentos
   * ni mayúsculas. Van combinaciones, no solo palabras sueltas: es el punto del
   * criterio.
   */
  bloqueo: string[];
}

/**
 * Las siete listas.
 *
 * Cortas a propósito en esta primera versión: 12 nombres × 10 adjetivos = 120
 * combinaciones por locale, × 9000 sufijos = más de un millón de alias posibles.
 * Ampliarlas es contenido, y `CLAUDE.md` § Contenido dice que el contenido lo
 * revisa una persona — no se generan con un modelo y se meten.
 */
const LISTAS: Record<LocaleAlias, ListaDeLocale> = {
  "en": {
    nombres: ["Rhino", "Otter", "Falcon", "Badger", "Panda", "Heron", "Lynx", "Puffin", "Beaver", "Ibis", "Moose", "Wren"],
    adjetivos: ["Swift", "Clever", "Bright", "Bold", "Calm", "Keen", "Sunny", "Brave", "Quick", "Kind"],
    bloqueo: ["madbadger", "boldpanda"],
  },
  "es-MX": {
    nombres: ["Rinoceronte", "Nutria", "Halcon", "Tejon", "Panda", "Garza", "Lince", "Frailecillo", "Castor", "Ibis", "Alce", "Chara"],
    adjetivos: ["Veloz", "Listo", "Brillante", "Audaz", "Sereno", "Agudo", "Radiante", "Valiente", "Rapido", "Amable"],
    // «Pato Loco» es el ejemplo del criterio. Ninguna de las dos palabras esta en
    // las listas de arriba, y aun asi la combinacion se bloquea: la lista tiene
    // que sobrevivir a que alguien amplie los nombres sin mirar aqui.
    bloqueo: ["patoloco", "lincechido"],
  },
  "es-ES": {
    nombres: ["Rinoceronte", "Nutria", "Halcon", "Tejon", "Panda", "Garza", "Lince", "Frailecillo", "Castor", "Ibis", "Alce", "Abubilla"],
    adjetivos: ["Veloz", "Listo", "Brillante", "Audaz", "Sereno", "Agudo", "Radiante", "Valiente", "Rapido", "Amable"],
    bloqueo: ["patoloco", "tejonguay"],
  },
  "fr-FR": {
    nombres: ["Rhinoceros", "Loutre", "Faucon", "Blaireau", "Panda", "Heron", "Lynx", "Macareux", "Castor", "Ibis", "Elan", "Roitelet"],
    adjetivos: ["Rapide", "Malin", "Brillant", "Audacieux", "Serein", "Vif", "Radieux", "Brave", "Agile", "Gentil"],
    bloqueo: ["blaireaumalin", "canardfou"],
  },
  "pt-BR": {
    nombres: ["Rinoceronte", "Lontra", "Falcao", "Texugo", "Panda", "Garca", "Lince", "Papagaio", "Castor", "Ibis", "Alce", "Bemtevi"],
    adjetivos: ["Veloz", "Esperto", "Brilhante", "Ousado", "Sereno", "Atento", "Radiante", "Corajoso", "Rapido", "Gentil"],
    // «bacana» es brasileño; en Portugal no se usa, y por eso las dos listas de
    // bloqueo portuguesas no son la misma.
    bloqueo: ["patodoido", "lincebacana"],
  },
  "pt-PT": {
    nombres: ["Rinoceronte", "Lontra", "Falcao", "Texugo", "Panda", "Garca", "Lince", "Papagaio", "Castor", "Ibis", "Alce", "Poupa"],
    adjetivos: ["Veloz", "Esperto", "Brilhante", "Ousado", "Sereno", "Atento", "Radiante", "Corajoso", "Rapido", "Gentil"],
    bloqueo: ["patodoido", "texugofixe"],
  },
  "de-DE": {
    nombres: ["Nashorn", "Otter", "Falke", "Dachs", "Panda", "Reiher", "Luchs", "Papageitaucher", "Biber", "Ibis", "Elch", "Zaunkoenig"],
    adjetivos: ["Flink", "Klug", "Hell", "Kuehn", "Ruhig", "Wach", "Sonnig", "Tapfer", "Schnell", "Freundlich"],
    bloqueo: ["dachskuehn", "verruecktereente"],
  },
};

/**
 * Normaliza para comparar contra la lista de bloqueo: sin acentos, sin
 * mayúsculas, sin espacios ni signos.
 *
 * Sin esto, «Pató Loco» o «pato-loco» esquivarían un bloqueo escrito como
 * «patoloco», y esquivar una lista de bloqueo con un acento es el primer truco
 * que alguien prueba.
 */
export function normalizar(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/**
 * ¿Es aceptable este alias en este locale?
 *
 * Comprueba la **cadena combinada**, no las palabras sueltas. Es el punto del
 * criterio y la razón por la que esta función recibe el alias ya formado.
 */
export function aliasPermitido(alias: string, locale: LocaleAlias): boolean {
  const n = normalizar(alias);
  return !LISTAS[locale].bloqueo.some((malo) => n.includes(normalizar(malo)));
}

/** El sufijo: 4 dígitos ALEATORIOS. Nunca secuencial — ver el encabezado. */
function sufijo(aleatorio: () => number): string {
  return String(1000 + Math.floor(aleatorio() * 9000));
}

export interface AliasGenerado {
  alias: string;
  locale: LocaleAlias;
}

/**
 * Genera un alias para un locale.
 *
 * `aleatorio` se inyecta para poder probar de forma determinista. En producción
 * es `Math.random`; en las pruebas, una secuencia fija — sin eso, un caso que
 * comprueba que la lista de bloqueo funciona sería un caso que a veces pasa.
 *
 * Reintenta si cae en la lista de bloqueo. El tope existe porque una lista de
 * bloqueo mal escrita —una que bloquee todo— produciría un bucle infinito en el
 * momento en que un padre crea el perfil de su hijo.
 */
export function generarAlias(
  locale: LocaleAlias,
  aleatorio: () => number = Math.random,
  intentos = 20,
): AliasGenerado {
  const lista = LISTAS[locale];
  for (let i = 0; i < intentos; i++) {
    const nombre = lista.nombres[Math.floor(aleatorio() * lista.nombres.length)];
    const adjetivo = lista.adjetivos[Math.floor(aleatorio() * lista.adjetivos.length)];
    const alias = `${nombre}${adjetivo}${sufijo(aleatorio)}`;
    if (aliasPermitido(alias, locale)) return { alias, locale };
  }
  throw new Error(
    `alias: ${intentos} intentos sin encontrar uno permitido en ${locale}. ` +
      "Casi seguro la lista de bloqueo de ese locale está mal escrita — una que bloquee " +
      "demasiado deja a un padre sin poder crear el perfil de su hijo.",
  );
}

/** Cuántas combinaciones distintas puede producir un locale. Para el informe. */
export function combinaciones(locale: LocaleAlias): number {
  const l = LISTAS[locale];
  return l.nombres.length * l.adjetivos.length * 9000;
}

/** Los locales que tienen lista. Lo usa el auditor: siete, no cinco (D-022). */
export function localesConLista(): string[] {
  return Object.keys(LISTAS);
}
