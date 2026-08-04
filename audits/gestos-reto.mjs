#!/usr/bin/env node
// Auditor determinista — toda pantalla de reto declara la protección de gestos
//
// Hace cumplir: #451, `docs/planes/pwa-gestos.md` §3, WebKit bug 240183, D-070.
//
// ─── Por qué existe ───────────────────────────────────────────────────────
//
// El dueño, jugando un reto en su teléfono, hizo swipe de izquierda a derecha
// y **el navegador lo sacó de la sesión**: el gesto de «volver atrás»,
// disparado con el pulgar a mitad de un ítem, sin aviso ni confirmación. Es la
// misma lección que #341 — esto no lo atrapa ninguna prueba: lo encontró una
// persona jugando.
//
// La corrección tiene dos mitades, porque ninguna sola alcanza:
//
//  1. **CSS** (`overscroll-behavior-x/y: none`, `touch-action: manipulation`)
//     en la hoja del reto. Cubre Chrome, Firefox y Edge (Baseline 2022): el
//     swipe-back y el pull-to-refresh dejan de existir dentro del reto.
//  2. **Guardia de borde** en el script de la pantalla: en Safari de iOS el
//     CSS NO deshabilita la navegación de historial (WebKit bug 240183,
//     abierto), así que un listener de `touchstart` hace `preventDefault()`
//     solo si el toque nace a ≤20 px del borde, medido contra
//     `window.innerWidth` en el evento (Split View de iPad cambia el ancho
//     real; una constante de aparato apuntaría al centro de la pantalla).
//
// Y hay una tercera cosa que vigilar, que es la razón de que esto sea un
// auditor y no una nota: **la quinta pantalla de reto**. Hoy son dos páginas
// (`kids/jugar`, `practicar`) sobre un componente compartido. Si mañana nace
// otra superficie con `jugar-body` que no monta el componente protegido, el
// bug entero vuelve sin que nada lo avise.
//
// ─── Cómo comprueba (D-070) ───────────────────────────────────────────────
//
// La tabla de exigencias está escrita A MANO aquí abajo: este auditor no
// importa nada del código que juzga. Un guardián que lee la declaración desde
// el propio código no puede fallar nunca — sería el código aprobando su propia
// violación, la trampa que D-070 prohíbe y que este repo ya midió dos veces el
// mismo día.
//
// Comprueba DECLARACIONES como texto (sin comentarios), no comportamiento: el
// comportamiento es la matriz manual de dispositivos reales del issue #451, y
// ningún auditor la sustituye.
//
// ─── LO QUE ESTE AUDITOR NO PUEDE VER ─────────────────────────────────────
//
//  · Que la guardia funcione en un aparato real. El `preventDefault()` en el
//    borde, el scroll intacto a un tercio de Split View, el gesto de sistema
//    «atrás» de la app instalada siguiendo vivo — todo eso es la matriz manual
//    del issue, con aparatos.
//  · Que no exista otra vía de salida accidental (un gesto de teclado, el
//    trackpad de macOS, que el propio plan declara fuera del alcance del
//    producto).

import { archivos, leer, informar, sinComentarios, existe } from "./lib/repo.mjs";

// ─── La tabla, escrita a mano ───────────────────────────────────────────────
//
// Tres piezas, y las tres tienen que estar:
//
//  1. La hoja del reto declara las tres propiedades CSS.
//  2. La pantalla compartida importa esa hoja y lleva la guardia de borde.
//  3. Toda página que sirve una superficie de reto monta la pantalla
//     compartida — y si nace una quinta, esta tabla no la conoce pero la REGLA
//     sí: cualquier página con `jugar-body` que no monte `<Pantalla` bloquea.

const HOJA = "apps/web/src/styles/reto.css";
const PANTALLA = "apps/web/src/components/reto/Pantalla.astro";

/** Las páginas de reto que existen hoy, nombradas una por una. */
const PAGINAS_DE_RETO = [
  "apps/web/src/pages/[locale]/app/kids/jugar.astro",
  "apps/web/src/pages/[locale]/app/practicar.astro",
];

const problemas = [];
const notas = [];
let revisados = 0;

// ─── 1 · El CSS ─────────────────────────────────────────────────────────────

const declaracion = (propiedad, valor) =>
  new RegExp(`${propiedad}\\s*:\\s*${valor}(?![\\w-])`);
// El shorthand `overscroll-behavior: none` cubre los dos ejes a la vez; vale
// como declaración de cualquiera de los dos.
const SHORTHAND_OVERSCROLL = declaracion("overscroll-behavior", "none");

const EXIGENCIAS_CSS = [
  {
    id: "overscroll-behavior-x",
    cumple: (css) => declaracion("overscroll-behavior-x", "none").test(css) || SHORTHAND_OVERSCROLL.test(css),
    para: "el swipe de borde = «atrás»/«adelante» del navegador (Chrome/Firefox/Edge, Baseline 2022)",
  },
  {
    id: "overscroll-behavior-y",
    cumple: (css) => declaracion("overscroll-behavior-y", "none").test(css) || SHORTHAND_OVERSCROLL.test(css),
    para: "el pull-to-refresh, que a media sesión recarga la página y pierde el ítem en curso",
  },
  {
    id: "touch-action",
    cumple: (css) => declaracion("touch-action", "manipulation").test(css),
    para: "el doble-tap-zoom sobre las opciones — `manipulation` conserva pan y pinch-zoom (WCAG 1.4.4)",
  },
];

if (existe(HOJA)) {
  revisados++;
  const css = sinComentarios(leer(HOJA) ?? "");
  for (const exigencia of EXIGENCIAS_CSS) {
    if (!exigencia.cumple(css)) {
      problemas.push(
        `${HOJA} no declara «${exigencia.id}: ${exigencia.id === "touch-action" ? "manipulation" : "none"}». ` +
          `#451: sin esa declaración, ${exigencia.para}. El diseño y el mapa de gestos por ` +
          "dispositivo están en `docs/planes/pwa-gestos.md` §3.",
      );
    }
  }
} else {
  problemas.push(
    `${HOJA} no existe. Es la hoja que viste la pantalla del reto; si se movió, este auditor ` +
      "tiene que saber dónde quedó — un guardián mirando una ruta vacía aprueba siempre.",
  );
}

// ─── 2 · La guardia de borde (Safari iOS, WebKit bug 240183) ───────────────
//
// Cuatro piezas independientes, para que quitar CUALQUIERA de ellas bloquee:
// el listener, el preventDefault, la medida contra el ancho real del evento,
// y el `passive: false` — sin éste último, el preventDefault se ignora y la
// guardia entera es decorativa.

const PIEZAS_GUARDIA = [
  {
    id: "un listener de «touchstart»",
    cumple: (t) => /addEventListener\(\s*["']touchstart["']/.test(t),
  },
  {
    id: "el «preventDefault()» dentro del listener",
    cumple: (t) => /\.preventDefault\(\)/.test(t),
  },
  {
    id: "la medida contra «window.innerWidth» en el evento (Split View de iPad)",
    cumple: (t) => /window\.innerWidth/.test(t),
  },
  {
    id: "«passive: false» — en un listener pasivo el preventDefault se ignora",
    cumple: (t) => /passive:\s*false/.test(t),
  },
  {
    id: "el borde de 20 px del diseño (pwa-gestos.md §3)",
    cumple: (t) => /=(?!=)\s*20(?![\d.])/.test(t),
  },
];

if (existe(PANTALLA)) {
  revisados++;
  const texto = sinComentarios(leer(PANTALLA) ?? "");

  if (!/import\s+["'][^"']*styles\/reto\.css["']/.test(texto)) {
    problemas.push(
      `${PANTALLA} no importa \`styles/reto.css\`. La hoja existe pero no llega a la pantalla: ` +
        "las tres declaraciones de #451 estarían escritas y sin efecto, que es exactamente el " +
        "modo de fallo de «compila, se sirve, y no hace nada» que esta pantalla ya vivió con su " +
        "propio `<style>`.",
    );
  }

  for (const pieza of PIEZAS_GUARDIA) {
    if (!pieza.cumple(texto)) {
      problemas.push(
        `${PANTALLA}: la guardia de borde para iOS no tiene ${pieza.id}. En Safari el CSS de ` +
          "overscroll NO deshabilita la navegación de historial (WebKit bug 240183, abierto), así " +
          "que sin esta guardia el swipe de borde vuelve a sacar al jugador del reto a media " +
          "sesión — el bug de #451 entero, solo en el navegador de la mitad de los aparatos.",
      );
    }
  }
} else {
  problemas.push(
    `${PANTALLA} no existe. Es la pantalla compartida del reto: si se movió o se renombró, las ` +
      "páginas de abajo y este auditor tienen que enterarse, no quedarse vigilando una ruta vacía.",
  );
}

// ─── 3 · Las páginas de reto montan la pantalla protegida ──────────────────
//
// Las dos de hoy, por nombre. Y la REGLA para la quinta: cualquier página que
// sirva `jugar-body` — la clase del cuerpo de una superficie de reto — tiene
// que montar `<Pantalla`, que es donde viven la hoja y la guardia. Una página
// nueva con `jugar-body` y sin `<Pantalla` es el bug naciendo otra vez.

const MONTA_PANTALLA = /<Pantalla[\s>/]/;

for (const pagina of PAGINAS_DE_RETO) {
  if (!existe(pagina)) {
    problemas.push(
      `${pagina} ya no existe y está en la tabla de pantallas de reto de este auditor. Bórrala ` +
        "de la tabla si de verdad se fue: una entrada rancia es cómo una lista de vigilancia se " +
        "convierte en ruido que nadie lee.",
    );
    continue;
  }
  revisados++;
  const texto = sinComentarios(leer(pagina) ?? "");
  if (!MONTA_PANTALLA.test(texto)) {
    problemas.push(
      `${pagina} sirve una superficie de reto y no monta \`<Pantalla\`. La protección de gestos ` +
        "de #451 vive en ese componente y en la hoja que importa: una pantalla de reto que no lo " +
        "monta nace con el bug puesto — el swipe de borde saca al jugador a media sesión.",
    );
  }
}

const paginas = archivos(/\.astro$/).filter(
  (f) => f.startsWith("apps/web/src/pages/") && !f.includes("/pages/api/") && !PAGINAS_DE_RETO.includes(f),
);
for (const pagina of paginas) {
  const texto = sinComentarios(leer(pagina) ?? "");
  if (!/\bjugar-body\b/.test(texto)) continue;
  revisados++;
  if (!MONTA_PANTALLA.test(texto)) {
    problemas.push(
      `${pagina}: una página NUEVA con «jugar-body» que no monta \`<Pantalla\`. Es la quinta ` +
        "pantalla de reto naciendo sin la protección de #451 — la razón entera de que este " +
        "auditor exista. Monta la pantalla compartida, o explica aquí por qué esta página es una " +
        "excepción y añádela a la tabla.",
    );
  }
}

notas.push(`${PAGINAS_DE_RETO.length} páginas de reto nombradas en la tabla, más el barrido de «jugar-body»`);
notas.push(
  "el sitio público (`Base.astro`) queda fuera a propósito: ahí el swipe-back del navegador es " +
    "comportamiento esperado y no se toca",
);

informar({
  nombre: "gestos-reto",
  problemas,
  notas,
  cita: "#451, docs/planes/pwa-gestos.md §3, WebKit bug 240183, D-070",
  revisados,
  resumen: `${revisados} archivo(s): la hoja del reto, la pantalla compartida y las páginas que la montan`,
  porQueBloquea:
    "el bug lo encontró el dueño con el pulgar, jugando: un swipe de borde dispara el «atrás» " +
    "del navegador y saca al jugador del reto a media sesión, sin aviso. No rompe nada visible " +
    "al volver — la página se ve perfecta y el gesto sigue siendo del navegador — así que la " +
    "única defensa es que ninguna pantalla de reto pueda nacer sin la declaración.",
  noComprueba: [
    "que la guardia funcione en un aparato real: el preventDefault en el borde, el scroll " +
      "intacto en Split View, el gesto de sistema «atrás» de la app instalada siguiendo vivo. " +
      "Eso es la matriz manual de #451, con dispositivos, y ningún auditor la sustituye.",
    "el swipe de dos dedos del trackpad en Safari de escritorio: el propio plan lo declara fuera " +
      "del alcance del producto (se resuelve en Ajustes del trackpad, pwa-gestos.md §2).",
  ],
});
