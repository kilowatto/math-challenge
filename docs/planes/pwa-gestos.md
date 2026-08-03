# PWA · Gestos — el mapa completo por dispositivo, el bug del swipe-back y su corrección

> **2026-08-03.** Origen: el dueño, jugando un reto, hizo swipe de
> izquierda a derecha y **el navegador lo sacó del reto** — el gesto de
> «volver atrás» del navegador disparado a media sesión. Este documento
> es el mapa de gestos del producto: qué gesto hace qué en cada
> dispositivo, qué está roto, y el diseño de la corrección. El bug está
> registrado como issue #451.

## 1. El bug, verificado contra el código

Las pantallas del reto **no tienen ninguna protección de gestos**:

- `overscroll-behavior-inline: contain` existe **solo** en el menú del
  sitio público (`apps/web/src/layouts/Base.astro:558`). Ni
  `Pantalla.astro`, ni `kids/jugar.astro`, ni `Privada.astro`, ni
  `reto.css`/`tokens.css` declaran `overscroll-behavior` en ningún eje
  `[medido: grep overscroll sobre apps/web/src]`.
- `touch-action: manipulation` (anti doble-tap-zoom) existe solo en
  `kids/pin.astro:710,794`. La superficie del reto no la tiene.
- No hay ningún manejador de `touchstart`/`touchmove` en el reto
  `[medido: grep touchstart|touchmove|pointerdown — cero]`.

Consecuencia: en una pestaña de navegador, cualquier swipe horizontal
cerca del borde izquierdo es el gesto de «atrás» del navegador, y la
sesión del reto se pierde de vista sin aviso ni confirmación.

## 2. El mapa de gestos por dispositivo (investigado en vivo)

### Android — pestaña de Chrome

- **Swipe desde el borde izquierdo → «atrás»; borde derecho →
  «adelante».** Se desactiva con `overscroll-behavior-x: none` (o
  `contain`) en la página `[verificado en vivo: MDN overscroll-behavior-x —
  "the contain value disables native browser navigation, including the
  vertical pull-to-refresh gesture and horizontal swipe navigation";
  github.com/xyflow/discussions/3379]`.
- **Pull-to-refresh** (swipe vertical hacia abajo recarga la página y
  perdería la sesión): se desactiva con `overscroll-behavior-y: none`
  `[verificado en vivo: MDN]`.
- **Doble-tap zoom** sobre las opciones: se neutraliza con
  `touch-action: manipulation` (ya en `pin.astro`; falta en el reto).
- Soporte: Chrome 63+, Firefox 59+, Edge 18+ — Baseline 2022
  `[verificado en vivo: modern-css.com/overscroll-behavior-x]`.

### Android — app instalada (standalone)

- El gesto de sistema «atrás» (swipe de borde o botón) dispara
  `history.back()` dentro de la PWA — es la salida correcta y **no se
  bloquea**: con el botón de salida de D-151 y la racha protegida por
  construcción, salir es seguro. El swipe-back *de navegador* no existe
  aquí porque no hay pestaña.

### iOS — pestaña de Safari

- **El gesto de borde NO se desactiva con CSS**: `overscroll-behavior-x:
  contain` no deshabilita la navegación de historial en WebKit — bug
  abierto `[verificado en vivo: bugs.webkit.org/show_bug.cgi?id=240183]`.
- **La vía que sí funciona (iOS 13.4+):** un listener de `touchstart`
  que llama `preventDefault()` **solo si el toque nace a ≤20 px del
  borde** — si se aplica a toda la pantalla, el usuario no puede hacer
  scroll `[verificado en vivo: pqina.nl/blog/blocking-navigation-gestures-on-ios-13-4/]`.
  Restricción honesta del patrón: usarlo solo donde tiene sentido
  (pantalla de reto), no como regla global.

### iOS — app instalada (standalone)

- No hay gesto de borde de navegador (no hay pila de pestañas que
  recorrer). El botón de salida de D-151 es la vía.

### iPad

- Mismo comportamiento que iOS en pestaña y en standalone. Además:
  **Split View cambia el ancho real** — la guardia de borde debe medir
  contra `window.innerWidth` en el evento, nunca contra una constante
  de dispositivo (la tabla de anchos de `guia-de-estilo.md` § iPad).

### Escritorio con trackpad (Mac/Windows)

- **Swipe de dos dedos a la izquierda = «atrás»** en Chrome, Edge y
  Safari de escritorio `[verificado en vivo: stackoverflow 79258195,
  Microsoft Learn Q&A 5644919]`. `overscroll-behavior-x: none` lo
  mitiga en Chrome/Edge; en Safari macOS aplica el mismo bug de WebKit
  — y el usuario lo resuelve en Ajustes del trackpad (no es del
  producto, pero hay que saberlo para el runbook de soporte).
- Mouse: sin gestos de borde; no aplica.

### Gestos que NUNCA se bloquean (accesibilidad, mc-38/WCAG)

- **Pinch-zoom** (`user-scalable` ya está libre a propósito —
  `kids/index.astro:554-557` lo explica: impedir el zoom viola WCAG
  1.4.4/1.4.10).
- **Scroll** de cualquier eje dentro de la página.
- **El botón/gesto de sistema «atrás»** en app instalada (es la salida
  legítima, § Android standalone).
- **Selección de texto fuera del juego.** Dentro de la superficie de
  reto se evalúa `user-select: none` + `-webkit-touch-callout: none`
  (long-press en iOS no debe abrir menú contextual sobre una opción) —
  verificar antes de aplicar, no asumir.

## 3. La corrección propuesta (issue #451)

1. **CSS en las pantallas de reto y de juego** (`reto.css` /
   `Pantalla.astro`, `kids/jugar.astro`, `app/practicar.astro`):
   ```css
   overscroll-behavior-x: none;  /* swipe-back del navegador, Chrome/Firefox/Edge */
   overscroll-behavior-y: none;  /* pull-to-refresh a media sesión */
   touch-action: manipulation;   /* anti doble-tap-zoom en las opciones */
   ```
2. **Guardia de borde para iOS** (el bug de WebKit): listener de
   `touchstart` en la pantalla del reto que hace `preventDefault()`
   solo si `pageX <= 20` o `pageX >= window.innerWidth - 20` (medido
   en el evento, por Split View). En un listener pasivo=false, solo en
   la superficie del reto — nunca global (bloquearía el scroll del
  sitio público, que no se toca).
3. **Sin cambios en el sitio público** (`Base.astro`): ahí el
   swipe-back del navegador es comportamiento esperado y el menú ya
   tiene su `contain`.
4. **El criterio de aceptación se prueba a mano en dispositivo real**
   (la lección de #341: esto no lo atrapa ningún auditor automático —
   el dueño lo encontró con el pulgar): swipe de borde en pestaña
   Android, pestaña iOS, iPad Split View, y trackpad de escritorio.
5. **Auditor determinista nuevo** `audits/gestos-reto.mjs`: falla si
   una pantalla de reto (`Pantalla.astro`, `jugar.astro`,
   `practicar.astro` y las que nazcan) no declara
   `overscroll-behavior-x: none` y la guardia de borde — para que la
   quinta pantalla de reto no vuelva a nacer sin ella. Con control
   negativo por degradación (D-070): quitar la declaración del archivo
   real y verlo fallar.

## 4. Lo que NO hace esta corrección

- No bloquea la salida legítima (botón de D-151, sistema «atrás» en
  standalone).
- No toca el zoom, el scroll, ni la selección de texto fuera del reto.
- No implementa gestos propios del producto (swipe para siguiente, etc.)
  — eso sería otra decisión; WCAG 2.5.1 exigiría alternativa de un
  toque para cualquiera de ellos.

## Fuentes

1. MDN — `overscroll-behavior-x` —
   https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior-x
   (descargado: «contain disables native browser navigation, including
   pull-to-refresh and horizontal swipe navigation»).
2. PQINA — Blocking Navigation Gestures on iOS Safari 13.4+ —
   https://pqina.nl/blog/blocking-navigation-gestures-on-ios-13-4/
   (descargado: el patrón `touchstart` + `preventDefault()` solo en el
   borde de 20 px).
3. WebKit Bugzilla #240183 — `overscroll-behavior-x: contain` no
   deshabilita la navegación de historial (abierto) —
   https://bugs.webkit.org/show_bug.cgi?id=240183
4. modern-css.com — overscroll-behavior-x (Baseline 2022, soporte) —
   https://modern-css.com/reference/properties/overscroll-behavior-x/
5. xyflow discussions #3379 — `overscroll-behavior-x: none` en body
   como solución al swipe-back —
   https://github.com/xyflow/xyflow/discussions/3379
6. StackOverflow 79258195 y Microsoft Learn Q&A 5644919 — swipe de dos
   dedos en trackpad = atrás (Chrome/Edge/Safari escritorio).
7. Código real: `apps/web/src/layouts/Base.astro:558`,
   `apps/web/src/pages/[locale]/app/kids/pin.astro:710`,
   `apps/web/src/pages/[locale]/app/kids/index.astro:554`.
