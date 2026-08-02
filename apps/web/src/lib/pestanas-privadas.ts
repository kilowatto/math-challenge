/**
 * La franja de pestañas del área privada, en un solo sitio. D-065, issue #346.
 *
 * ─── Por qué existe este archivo ───────────────────────────────────────────
 *
 * La lista de pestañas estaba escrita dos veces: una en `app/index.astro` (las
 * cinco de familia) y otra en `app/perfil.astro` (dos, «Tu casa» y «Tu
 * cuenta»). Eran distintas, así que la navegación **cambiaba de forma al
 * moverse entre dos rutas de la misma superficie**: entrabas a la cuenta y las
 * pestañas de tus hijos desaparecían. Nadie lo decidió; se separaron solas, que
 * es lo que hace siempre una lista escrita dos veces.
 *
 * ─── La regla, que es de D-065 punto 3 ─────────────────────────────────────
 *
 * «Las pestañas se derivan de lo que la cuenta REALMENTE tiene.» El dueño
 * reportó lo contrario con una captura de su iPhone: una cuenta SIN un solo
 * hijo veía **Hijos · Progreso · Tiempo de pantalla**, las tres del modo
 * familia y las tres vacías o marcadas «Próximamente».
 *
 * La causa fue `esFamilia = hijos.length > 0 || !esSolo`, escrito al arreglar
 * «la casa no tiene menú» (#344): daba pestañas de familia a toda cuenta que no
 * se hubiera registrado por la puerta «quiero aprender yo» — o sea a casi
 * todas. Aquí vuelve a ser lo que D-065 dice: **hay pestañas de familia cuando
 * hay al menos un hijo.**
 *
 * ─── Y el hijo, entonces, ¿por dónde se crea? ──────────────────────────────
 *
 * Ese es el motivo por el que la condición se había relajado: si «Hijos»
 * desaparece, un padre recién registrado se queda sin ninguna forma de crear el
 * primer perfil, encerrado. La salida NO es enseñarle tres pestañas vacías: es
 * que **«añadir un hijo» viva dentro de «Cuenta»** (`app/perfil.astro`), que
 * toda cuenta ve siempre. En cuanto existe el primer hijo, la cuenta es de
 * familia y las tres pestañas aparecen solas.
 *
 * Esto es la mitad barata de los **dos modos explícitos** que el dueño pidió
 * —familia y solo, conmutables desde el perfil, con el registro empezando en
 * solo—. El interruptor de verdad necesita una columna en `users` y un endpoint
 * que la escriba, y no cabía en este arreglo. Lo que sí queda garantizado desde
 * ya: quien no tiene hijos no lee una sola palabra sobre familia en su
 * navegación.
 */
import { t, type Locale } from "../i18n";

export type ClavePestana = "hijos" | "progreso" | "limite" | "practicar" | "cuenta";

export interface Pestana {
  clave: string;
  label: string;
  href: string;
  activa: boolean;
  proximamente?: boolean;
}

/**
 * Lo que está decidido y no construido: Progreso y Límite de pantalla son F8
 * (D-057). Se enseñan igual, marcadas — D-065 punto 5, el dueño prefirió el
 * hueco visible a rehacer la navegación cuando esas fases lleguen.
 *
 * «Practicar» ya NO está aquí: `/app/practicar/` sirve retos reales (#343).
 */
export const PROXIMAMENTE: ReadonlySet<ClavePestana> = new Set<ClavePestana>([
  "progreso",
  "limite",
]);

/**
 * Las claves visibles para esta cuenta, en orden.
 *
 * Con hijos: cinco, que es el tope de D-065 punto 4 (HIG, Material 3).
 * Sin hijos: **dos** — Practicar y Cuenta. Es el mínimo que D-065 admite y es
 * exactamente lo que el issue #346 pide ver.
 */
export function clavesDePestana(tieneHijos: boolean): ClavePestana[] {
  return tieneHijos
    ? ["hijos", "progreso", "limite", "practicar", "cuenta"]
    : ["practicar", "cuenta"];
}

/**
 * Las etiquetas de la NAVEGACIÓN son cortas a propósito, y no siempre son el
 * título de la pantalla a la que llevan.
 *
 * «Tiempo de pantalla» son 18 caracteres; cinco etiquetas así no caben en los
 * 390 px de un iPhone, y lo que se veía era «Tiemp» cortado a la mitad. La
 * pantalla se sigue titulando «Tiempo de pantalla» (`casaTabLimite`); lo que
 * cambia es el rótulo de la pestaña (`casaTabLimiteCorto`), igual que hace iOS.
 */
function etiquetas(locale: Locale): Record<ClavePestana, string> {
  const m = t(locale);
  return {
    hijos: m.casaTabHijos,
    progreso: m.casaTabProgreso,
    limite: m.casaTabLimiteCorto,
    practicar: m.casaTabPracticar,
    cuenta: m.casaTabCuenta,
  };
}

/**
 * A dónde va cada pestaña.
 *
 * «Cuenta» apunta a `/app/perfil/` — una ruta propia, como D-065 punto 7
 * mandaba desde el principio. Estuvo apuntando a una vista dentro de
 * `app/index.astro` porque cuando se escribió esa pestaña el destino todavía no
 * existía y llevaba a un 404 real. Existe desde #340; el duplicado (dos altas
 * de passkey y dos cambios de contraseña, uno en cada archivo) ya no tiene
 * excusa para seguir vivo.
 *
 * «Practicar» apunta a la vista de la casa, no directo a `/app/practicar/`: esa
 * pantalla es el reto a pantalla completa, sin franja de pestañas ni forma de
 * volver salvo «ya terminé». Una pestaña que te saca de la navegación no es una
 * pestaña.
 */
function href(locale: Locale, clave: ClavePestana): string {
  return clave === "cuenta" ? `/${locale}/app/perfil/` : `/${locale}/app/?vista=${clave}`;
}

export function pestanasPrivadas(
  locale: Locale,
  tieneHijos: boolean,
  activa: ClavePestana,
): Pestana[] {
  const rotulo = etiquetas(locale);
  return clavesDePestana(tieneHijos).map((clave) => ({
    clave,
    label: rotulo[clave],
    href: href(locale, clave),
    activa: clave === activa,
    proximamente: PROXIMAMENTE.has(clave),
  }));
}
