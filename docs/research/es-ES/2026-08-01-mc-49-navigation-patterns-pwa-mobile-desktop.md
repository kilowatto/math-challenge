# Patrones de navegación para un sitio PWA-first: app instalada, pestaña de navegador móvil y escritorio

> Investigación Math Challenge — 2026-08-01 — tema 49

## Resumen ejecutivo (ES)

El sitio hoy pinta **dos barras de navegación completas al mismo tiempo** en
iOS/Android: `nav.sitio` arriba (seis secciones en una fila que se desplaza
en horizontal, sin pista visual de que se puede desplazar) y `.barra-inferior`
abajo, sin condicionar a si la página corre instalada o en una pestaña normal
del navegador. En una pestaña de Safari eso produce **tres** navegaciones
apiladas — las dos propias más la barra de direcciones del navegador —, que es
la causa raíz de que el menú se sienta ajeno a iOS en vez de nativo. La
evidencia converge en tres reglas, ninguna nueva para quien diseña software
nativo pero ausentes hasta hoy de `docs/decisions.md`: (1) una app **nunca**
combina dos sistemas de navegación primaria a la vez [3][6][7]; (2) una barra
inferior táctil se limita a 3-5 destinos, nunca más — HIG e Material 3
coinciden en la cifra exacta [1][2]; (3) por debajo de 5-6 opciones en móvil,
un menú hamburguesa gana en descubribilidad a una fila que se corta [4][5][6].
`display-mode: standalone` en CSS —ya usado en `Instalar.astro`— es la
señal correcta para distinguir "app instalada" de "pestaña de navegador", y
permite que cada contexto tenga su propia navegación sin que se pisen [8][9].
Sobre librerías de "look nativo" (Framework7, Ionic, Onsen UI): existen y
funcionan, pero cuestan peso de JavaScript real en cada página del sitio
—no solo donde se usan— y ninguna fuente consultada sugiere que el resultado
sea mejor que CSS bien hecho para el caso concreto de una barra de pestañas
[10]. En iPad, Material 3 documenta que la convención cambia de barra
inferior a **riel lateral** a partir de anchos "medium" (≥600dp) — coincide
con la tabla de anchos de D-041 en la fila de pantalla completa horizontal
[2][11].

## Executive summary (EN)

The site currently paints **two complete navigation bars at once** on
iOS/Android: `nav.sitio` at the top (six sections in a horizontally
scrolling row with no visual affordance that it scrolls) and
`.barra-inferior` at the bottom, unconditioned on whether the page runs
installed or in an ordinary browser tab. In a Safari tab this produces
**three** stacked navigations — the two the site owns plus the browser's own
address bar —, which is the root cause of the menu feeling foreign to iOS
instead of native. The evidence converges on three rules, none new to native
software design but absent from `docs/decisions.md` until now: (1) an app
**never** combines two primary navigation systems at once [3][6][7]; (2) a
touch bottom bar caps at 3-5 destinations, never more — HIG and Material 3
agree on the exact figure [1][2]; (3) below 5-6 options on mobile, a
hamburger menu beats a row that gets cut off, on discoverability [4][5][6].
`display-mode: standalone` in CSS —already used in `Instalar.astro`— is the
correct signal to distinguish "installed app" from "browser tab", letting
each context own its navigation without collision [8][9]. On "native-feel"
libraries (Framework7, Ionic, Onsen UI): they exist and work, but cost real
JavaScript weight on every page of the site —not only where they're used—
and no source consulted suggests the result beats well-made CSS for the
concrete case of a tab bar [10]. On iPad, Material 3 documents the
convention switching from bottom bar to **side rail** at "medium" widths
(≥600dp) — this lines up with D-041's width table at the full-screen
horizontal row [2][11].

---

## Pattern matrix

| Contexto | Plataforma | Patrón que la evidencia respalda | Fuente |
|---|---|---|---|
| App instalada (`display-mode: standalone`) | iOS / Android, ancho de teléfono | Barra inferior, 3-5 destinos, icono + texto | [1][2] |
| App instalada, ancho de tablet/iPad horizontal completo | iOS (iPad) | Riel lateral, no barra inferior | [2][11] |
| Pestaña de navegador normal | iOS / Android | Encabezado compacto + menú hamburguesa (no barra de pestañas de app) | [4][5][6] |
| Cualquier contexto | Windows / macOS / escritorio | Barra horizontal arriba — coincide con el modo "top" de Fluent `NavigationView` y con la convención de apps web de macOS | [12] |
| Cualquier contexto móvil | — | **Nunca** dos sistemas de navegación primaria a la vez | [3][6][7] |

## Findings

**1. HIG: 3-5 pestañas, la mínima cantidad necesaria.** Apple documenta
explícitamente "use three to five tabs in iOS; use a few more in iPadOS and
tvOS if necessary" y advierte de que cada pestaña adicional aumenta la
complejidad de encontrar información [1].

**2. Material 3: el mismo rango, y el punto donde cambia de patrón.** Las
barras de navegación inferior de M3 se limitan a 3-5 destinos y **solo
aplican a teléfonos y tablets pequeñas**. A partir de ventanas "medium"
(600-839dp) la guía dice reemplazar la barra inferior por un **riel lateral**
(3-7 destinos); si hay más de 5, considerar un riel expandido/modal en vez de
seguir apilando en la barra [2].

**3. Ninguna PWA exitosa combina las dos.** Varias fuentes de patrones de
navegación en PWAs coinciden en que el enfoque ganador es elegir **un solo**
patrón de navegación primaria — la alternativa (ej. The Weather Channel, que
sí usa barra arriba y abajo a la vez) se cita explícitamente como el
antipatrón, no el modelo a seguir [3].

**4. Bajo 5-6 opciones, gana el hamburguesa en móvil.** Nielsen Norman Group
y varias fuentes de patrones de UX coinciden: una fila de pestañas
horizontal en móvil no aguanta más de 5-6 antes de necesitar scroll, y el
scroll horizontal en navegación **se ignora** salvo que haya una pista visual
fuerte de que continúa — la fila de hoy (`nav.sitio`) no la tiene, y por eso
la sexta sección ("Código abierto") es invisible en la práctica [4][5][6].

**5. Trade-off documentado del hamburguesa.** No es gratis: NN/g documenta
que esconder navegación reduce su descubribilidad frente a tenerla visible.
Es el motivo por el que la recomendación no es "todo detrás del
hamburguesa", sino mantener las acciones de conversión (Entrar, Crear
cuenta) siempre visibles y solo esconder las seis secciones de contenido
[5].

**6. `display-mode: standalone` ya es un patrón probado en este repo.**
`Instalar.astro` ya usa `@media (display-mode: standalone), (display-mode:
minimal-ui), (display-mode: fullscreen)` para distinguir si la página corre
instalada. Es la misma señal — sin JavaScript nuevo, sin detección de
plataforma en JS, coherente con la regla ya escrita en
`docs/guia-de-estilo.md` — que resuelve cuál de las dos navegaciones debe
existir en cada momento [8][9].

**7. Windows/Fluent: el modo "top" es válido, no un compromiso.**
`NavigationView` de Microsoft soporta explícitamente un modo de navegación
horizontal arriba ("Top") como alternativa de primera clase al riel lateral
izquierdo, recomendado cuando se quiere mostrar todas las opciones a la vez
y hay espacio de pantalla de sobra — que es exactamente el caso de escritorio
de Math Challenge hoy [12].

**8. Sobre librerías de "look nativo".** Framework7, Ionic y Onsen UI
existen específicamente para imitar controles nativos de iOS/Android en una
PWA, pero las fuentes consultadas describen a Framework7 como
"relativamente grande" en tamaño, con el consiguiente coste en tiempo de
carga, y ninguna fuente sugiere una ventaja de resultado visual sobre CSS
bien construido para el caso concreto de una barra de pestañas — que es
exactamente lo que `plataformas.css` ya construye hoy para radios,
elevación y el material translúcido de iOS [10].

**9. El overlay de pantalla completa tiene rarezas específicas de iOS
Safari.** Una fuente centrada en cuidar el detalle de la experiencia móvil
documenta que los overlays de pantalla completa en iOS Safari no cierran
con el gesto de deslizar que sí funciona en Android, y que hay que manejar
`env(safe-area-inset-*)` con cuidado en ese contexto — un menú que se
despliega **empujando el contenido** (en vez de un overlay fijo) evita esa
categoría de bug por construcción [6].

## Design implications

1. **Nunca renderizar `nav.sitio` completo y `.barra-inferior` al mismo
   tiempo.** El primero es el patrón de pestaña de navegador; el segundo, el
   de app instalada. Se distinguen con `display-mode: standalone`, sin JS.
2. **La barra inferior instalada se limita a 5 destinos, todos de un
   toque**: los que HIG/M3 permiten como máximo. Ningún destino queda detrás
   de un segundo nivel si el propio dueño del producto pide que esté a un
   toque — la solución no es violar el límite de 5, es elegir bien cuáles 5.
3. **El resto de secciones (Origen, Arquitectura, Código abierto) viven en
   un `<details>/<summary>` nativo**, no en una sexta pestaña ni en un
   scroll horizontal. Cero JavaScript, mismo mecanismo en los dos contextos
   (app instalada y pestaña de navegador), coherente con "Sin JavaScript:
   cinco enlaces" que ya declara `Base.astro`.
4. **En pestaña de navegador (no instalada), encabezado compacto**: marca +
   Entrar + Crear cuenta siempre visibles + botón que despliega las seis
   secciones **debajo**, empujando el contenido — nunca un overlay de
   pantalla completa, por el hallazgo #9.
5. **iPad en horizontal completo (1024-1366px, la fila de D-041) usa un
   riel lateral**, no la barra inferior de iPhone — coincide con dónde
   Material 3 dice que cambia el patrón. Por debajo de ese ancho (vertical,
   Split View), iPad se comporta como iPhone, que ya es la base de D-041.
6. **Sin librería nueva.** HTML semántico + CSS con `data-platform` y
   `display-mode`, exactamente el patrón que el repo ya usa — cero coste de
   bundle adicional en el resto del sitio.
7. **Escritorio no cambia**: la barra horizontal arriba de hoy coincide con
   el modo "Top" de Fluent NavigationView y con la convención de apps web de
   macOS — no hay evidencia de que competir por un patrón distinto ahí
   compre algo.

## Preguntas para el dueño — resueltas el 2026-08-01

Estas se resolvieron en rondas de preguntas de opción múltiple durante la
misma sesión que esta investigación, y quedan documentadas aquí para que la
decisión no se vea huérfana de su porqué:

1. **¿Cuándo se muestra la barra inferior?** → Solo instalada
   (`display-mode: standalone`).
2. **¿Qué pasa con lo que no cabe en 5 destinos?** → `<details>/<summary>`
   "Más", salvo Entrar/Crear cuenta que el dueño pidió explícitamente a un
   toque, sin pasar por "Más".
3. **¿Librería o CSS puro?** → CSS puro, sin dependencia nueva.
4. **¿iPad ancho como iPhone o riel propio?** → Riel propio, solo en
   horizontal completo (1024-1366px).
5. **¿Acciones visibles en el encabezado compacto de pestaña de
   navegador?** → Siempre visibles, mismo criterio que la barra instalada.
6. **¿Cómo se despliega el menú de pestaña de navegador?** → Empuja el
   contenido debajo, no overlay — por el hallazgo #9 de iOS Safari.

## Sources

1. Apple Developer, "Tab bars" — Human Interface Guidelines —
   https://developer.apple.com/design/human-interface-guidelines/tab-bars
   (fetched 2026-08-01)
2. Material Design 3, "Navigation bar" and "Navigation rail" guidelines —
   https://m3.material.io/components/navigation-bar/guidelines ·
   https://m3.material.io/components/navigation-rail/guidelines (fetched
   2026-08-01)
3. Phone Simulator, "Mobile Navigation Patterns That Work in 2026" —
   https://phone-simulator.com/blog/mobile-navigation-patterns-in-2026
   (fetched 2026-08-01)
4. Nielsen Norman Group, "Basic Patterns for Mobile Navigation: A Primer" —
   https://www.nngroup.com/articles/mobile-navigation-patterns/ (fetched
   2026-08-01)
5. Onething Design, "Hamburger Menu vs Tab Bar: Which Works Better?" —
   https://www.onething.design/post/hamburger-menu-vs-tab-bar (fetched
   2026-08-01)
6. Gromov, "Full-screen menu quirks for mobile Safari" —
   https://gromov.com/en/full-screen-menu-quirks-mobile-safari (fetched
   2026-08-01)
7. Smashing Magazine, "How To Decide Which PWA Elements Should Stick" —
   https://www.smashingmagazine.com/2020/01/mobile-pwa-sticky-bars-elements/
   (fetched 2026-08-01)
8. web.dev, "How to provide your own in-app install experience" (documents
   `display-mode` media query) —
   https://web.dev/customize-install/ (fetched 2026-08-01)
9. Math Challenge internal code, `apps/web/src/components/Instalar.astro` —
   uso ya existente de `@media (display-mode: standalone)` en este repo.
10. StackShare, "Framework7 vs Ionic vs Onsen UI" —
    https://stackshare.io/stackups/framework7-vs-ionic-vs-onsen-ui (fetched
    2026-08-01)
11. Math Challenge internal decision, D-041 — tabla de anchos de iPad —
    `docs/decisions.md`
12. Microsoft Learn, "NavigationView" — Windows apps —
    https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/navigationview
    (fetched 2026-08-01)
