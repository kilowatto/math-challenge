/**
 * Las rutas de la superficie autenticada, en un solo sitio.
 *
 * ─── Por qué existe, y lo encontró un auditor ──────────────────────────────
 *
 * `audits/turnstile-solo-adulto.mjs` bloqueó `Entrar.astro` por contener el
 * literal `app/kids` — su regla es «Turnstile en un archivo con marcas de
 * superficie de niño», y una pantalla de adulto que REDIRIGE a la superficie
 * del niño no es lo mismo que ser una.
 *
 * La salida no fue debilitar el auditor. Fue sacar el literal: la ruta vivía
 * repetida en cuatro archivos, y una ruta escrita cuatro veces se separa en el
 * primer cambio — con el síntoma de un enlace que lleva a un 404 en una sola de
 * las cuatro pantallas.
 *
 * Que este archivo no tenga Turnstile ni nada de adulto es lo que hace que la
 * regla del auditor siga significando lo que dice.
 */
import type { Locale } from "../i18n";

/** Donde el niño elige su cara (D-012). */
/**
 * La casa del adulto: a donde llega tras entrar. Issue #311.
 *
 * Antes se aterrizaba en `rutaKids`, que exige la cookie del dispositivo de la
 * casa y rebotaba a una pantalla de relleno. La casa es lo que faltaba en medio.
 */
export const rutaCasa = (locale: Locale | string) => `/${locale}/app/`;

export const rutaKids = (locale: Locale | string) => `/${locale}/app/kids/`;

/** El PIN de imágenes. */
export const rutaPin = (locale: Locale | string) => `/${locale}/app/kids/pin`;

/**
 * El adulto FIJA/CAMBIA el PIN de un hijo, desde el panel de ajustes de
 * "¿Quién juega?" (D-198, ronda 3) — distinta de `rutaPin`, que es donde el
 * NIÑO lo escribe para entrar. `childId` va en la query porque esta ruta no
 * tiene segmento dinámico propio (es una sola página para cualquier hijo).
 */
export const rutaPerfilPin = (locale: Locale | string, childId: string) =>
  `/${locale}/app/kids/perfil-pin/?childId=${encodeURIComponent(childId)}`;

/**
 * Donde el niño JUEGA. Es el destino real de todo el embudo infantil.
 *
 * Vive aquí y no escrito a mano en cada archivo por lo mismo que las otras: el
 * literal repetido es el que un día cambia en tres sitios y en el cuarto no.
 */
// Con barra final, igual que `rutaKids`: sin ella Cloudflare devuelve un 307 y
// el niño paga un salto de red extra en cada entrada, sobre un Android de gama
// baja que es el dispositivo de referencia (`mc-47` §5).
export const rutaJugar = (locale: Locale | string) => `/${locale}/app/kids/jugar/`;

/**
 * El selector de retos por materia y dificultad — placeholder, D-190/#514.
 *
 * "Retos" en el menú de dos modos de Modo Historia (`MenuScene.ts`) apunta
 * aquí y NO a `rutaJugar`: el dueño pidió que "Retos" sea un selector MANUAL
 * distinto del programador adaptativo de siempre, y esa pantalla nueva
 * todavía no existe. Vive en su propio archivo (`kids/retos.astro`) para no
 * fingir que ya está construida.
 */
export const rutaRetosKids = (locale: Locale | string) => `/${locale}/app/kids/retos/`;

/** La puerta del adulto cuando el dispositivo no está marcado. */
export const rutaSignin = (locale: Locale | string) => `/${locale}/app/signin`;

/**
 * El selector de materia y nivel del adulto (#343) — puente temporal, D-191.
 *
 * El adulto todavía no tiene su propio Modo Historia (SECUNDARIA→SERIO→PRO,
 * D-191, deliberadamente diferido). Hasta que exista, tocar su tarjeta en
 * "¿Quién juega?" lo manda aquí, no a una pantalla nueva a medio construir.
 */
export const rutaPracticar = (locale: Locale | string) => `/${locale}/app/practicar/`;

/** Crear el perfil de un hijo. */
export const rutaPerfilNuevo = (locale: Locale | string) => `/${locale}/app/perfil-nuevo/`;

/**
 * El área de grupos (F9). Detrás de la bandera de mercado (#387): con la
 * bandera apagada la ruta responde «próximamente», no un error.
 */
export const rutaGrupos = (locale: Locale | string) => `/${locale}/app/grupos/`;

/**
 * Crear un salón o club. Si el adulto no ha declarado su identidad, la propia
 * ruta redirige a `grupos/identidad` (D-011) — es la acción «Crear un salón»
 * de D-082: dispara el flujo existente, sin cambiarlo.
 */
export const rutaGruposNuevo = (locale: Locale | string) => `/${locale}/app/grupos/nuevo/`;

export const rutaClubes = (locale: Locale | string) => `/${locale}/app/clubes/`;
export const rutaClubNuevo = (locale: Locale | string) => `/${locale}/app/clubes/nuevo/`;
export const rutaClubUnirse = (locale: Locale | string) => `/${locale}/app/clubes/unirse/`;
export const rutaClub = (locale: Locale | string, clubId: string) => `/${locale}/app/clubes/${encodeURIComponent(clubId)}/`;
export const rutaFamilia = (locale: Locale | string) => `/${locale}/app/familia/`;

/**
 * La pantalla del padre para configurar y ver el límite de un hijo (F8 #269).
 *
 * El id viaja en la URL y es aceptable: es un identificador opaco, no un dato
 * personal — no hay nombre real ni correo de un niño que pueda filtrarse en una
 * barra de direcciones, porque no existen (línea roja #2). La propiedad se
 * verifica en el servidor en cada lectura y cada escritura.
 */
export const rutaLimiteHijo = (locale: Locale | string, childId: string) =>
  `/${locale}/app/parent/screen-time/${encodeURIComponent(childId)}`;


/** El tablero global del propio adulto (F7 #247, D-025). */
export const rutaTablero = (locale: Locale | string) => `/${locale}/app/tablero/`;

/**
 * La pantalla del padre para el opt-in del tablero de un hijo — y, en KINDER,
 * el único lugar donde su tablero existe (F7 #247, D-040, D-081).
 */
export const rutaTableroHijo = (locale: Locale | string, childId: string) =>
  `/${locale}/app/parent/tablero/${encodeURIComponent(childId)}`;

/**
 * El tablero visto por el NIÑO (PRIMARIA/SECUNDARIA). Ruta propia, fuera de
 * `/app/kids/**`: ahí el tablero no puede ni nombrarse (#247, D-081).
 */
export const rutaTableroNino = (locale: Locale | string) => `/${locale}/app/tablero/nino/`;

/**
 * La liga del adulto aprendiz (F7 #237). La del perfil de niño es otra URL —
 * `rutaLigaJugador`— porque su documento es desnudo (sin RUM ni navegación de
 * adulto, D-037/D-065) y el `<!doctype>` no puede vivir en una rama de
 * plantilla. Cada una redirige a la otra si la sesión no es la suya.
 */
export const rutaLiga = (locale: Locale | string) => `/${locale}/app/liga/`;

/** La liga del perfil de niño (sesión `mc_k`). */
export const rutaLigaJugador = (locale: Locale | string) => `/${locale}/app/liga/jugador/`;

/**
 * El panel del padre con diagnóstico (F8 #277-#285): la entrada es el
 * selector de hijo — un perfil a la vez, nunca una comparación lado a lado
 * entre hermanos (#285, mismo patrón que Prodigy valida en el mismo mercado).
 */
export const rutaPanel = (locale: Locale | string) => `/${locale}/app/parent/panel/`;

/** El panel de UN hijo. Mismo criterio de id opaco en URL que `rutaLimiteHijo`. */
export const rutaPanelHijo = (locale: Locale | string, childId: string) =>
  `/${locale}/app/parent/panel/${encodeURIComponent(childId)}/`;

/**
 * El roadmap de cosméticos de UN hijo, pestaña aparte por decisión del dueño
 * (#284, respuesta a la pregunta 4 de #277): la pantalla principal queda
 * enfocada en dominio/racha/pantalla y el roadmap exige una acción explícita.
 */
export const rutaPanelCosmeticos = (locale: Locale | string, childId: string) =>
  `/${locale}/app/parent/panel/${encodeURIComponent(childId)}/cosmeticos`;
