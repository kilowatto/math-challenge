/**
 * Los 24 dibujos del PIN y su atrezo, como claves de textura de Phaser
 * (D-201).
 *
 * ─── Se cargan con TODO lo demás, en el precargador ────────────────────────
 *
 * La primera versión de este archivo argumentaba lo contrario —carga en
 * caliente dentro de `PinScene`, porque cada niño ve nueve de veinticuatro— y
 * estaba mal. Se corrigió antes de llegar a producción, y las tres razones
 * están escritas en el `preload()` de `QuienJuegaScene`, que es donde de
 * verdad se cargan: la rejilla se baraja por niño (una tablet con dos
 * hermanos ve casi las 24), el PIN es la segunda pantalla —justo donde D-200
 * puso el precargador para que no hubiera huecos— y las 24 pesan 552 KB, la
 * mitad que los cuadros de Larry que ya se cargan sin discusión.
 *
 * El día que exista un manifiesto global de assets, estas dos listas se mueven
 * ahí y `QuienJuegaScene` deja de nombrarlas — el sitio cambia, la decisión no.
 *
 * ─── Dónde viven los archivos ──────────────────────────────────────────────
 *
 * `public/juego/`, y no una carpeta nueva: `astro.config.mjs` hashea solo
 * `juego`, `mapa` y `avatares` para el candado de versión de D-200. Un
 * directorio propio quedaría fuera del hash y el precargador nunca sabría que
 * el arte cambió.
 */

/**
 * El atrezo de madera, ya generado y aprobado para la pantalla HTML del PIN
 * (D-197.1) — se recoloca en Phaser, no se regenera.
 *
 * `pin-numerico-fondo` sirve a las DOS ramas: es el mismo portón, y la rama de
 * imágenes tenía en HTML un fondo propio (`pin-imagenes-fondo`) que no existe
 * en esta base. Reusar el que sí existe es mejor que generar una segunda
 * escena para la misma puerta.
 */
export const CLAVES_ATREZO_PIN = [
  "pin-numerico-fondo",
  "pin-numerico-letrero",
  "pin-numerico-marco",
  "pin-numerico-boton",
  ...Array.from({ length: 10 }, (_, d) => `pin-numerico-digito-${d}`),
  ...Array.from({ length: 10 }, (_, d) => `pin-numerico-digito-${d}-presionado`),
] as const;

/** La clave de textura de Phaser para un dibujo del catálogo. */
export const clavePinDibujo = (id: string) => `pin-dibujo-${id}`;

/**
 * La URL del archivo.
 *
 * WebP y no AVIF: el recorte a alfa de estos 24 es lo que los deja pegarse
 * sobre la tabla de madera de cada casilla, y el AVIF que produce
 * `libsvtav1` con `yuv420p` **no conserva el canal alfa** — devolvería el
 * fondo blanco justo donde no debe haberlo. `gen-pin-dibujos.mjs` ni siquiera
 * genera el AVIF, por eso.
 */
export const urlPinDibujo = (id: string) => `/juego/pin-dibujo-${id}.webp`;
