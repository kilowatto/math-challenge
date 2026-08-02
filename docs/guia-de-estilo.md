# Guía de estilo — Math Challenge

> Paleta y tipografía de Ignia, aplicadas a un producto que va de los 4 años al
> matemático profesional en siete locales, y que tiene que cumplir WCAG 2.2 AA.
>
> **Origen:** `Imagen Ignia / Color y tipografia.pdf`. Las cifras de contraste de
> este documento las calcula `audits/brand-image.mjs`, no están escritas a mano —
> corre `node audits/brand-image.mjs --tabla` para reproducirlas.

---

## La paleta

| Color | Hex | Rol |
|---|---|---|
| Naranja Ignia | `#F36B1C` | Principal · **el color de Larry** |
| Azul Ignia | `#0B6AB0` | Principal |
| Naranja claro | `#F8A337` | Complementario |
| Naranja oscuro | `#CE4912` | Complementario |
| Gris 900 | `#434547` | Grises |
| Gris 600 | `#727476` | Grises |
| Gris 400 | `#A4A6A8` | Grises |
| Negro | `#000000` | Grises |
| Blanco | `#FFFFFF` | Grises |

## Contraste — lo que la paleta puede y no puede hacer

Calculado contra WCAG 2.2: **4.5:1** para texto normal, **3:1** para texto grande
(≥18.66 px negrita o ≥24 px) y para gráficos y controles.

| Color | Sobre blanco | Sobre negro | Texto normal sobre blanco |
|---|---|---|---|
| `#F36B1C` naranja Ignia | **3.03** | 6.93 | **No.** Solo texto grande y gráficos |
| `#0B6AB0` azul Ignia | **5.67** | 3.70 | Sí |
| `#F8A337` naranja claro | **2.04** | 10.29 | **No.** Decorativo únicamente |
| `#CE4912` naranja oscuro | **4.58** | 4.59 | Sí — el único que sirve en ambos |
| `#434547` gris 900 | **9.63** | 2.18 | Sí — el gris de texto |
| `#727476` gris 600 | **4.69** | 4.48 | Sí, apenas |
| `#A4A6A8` gris 400 | **2.44** | 8.60 | **No.** Bordes y decoración |

### La consecuencia que hay que aceptar

**El naranja de Ignia no puede llevar texto normal sobre fondo claro.** Es el
color de la marca y el de Larry, y da 3.03:1 — por debajo del 4.5:1 que exige
WCAG 2.2 AA. Esto no es un error a corregir: es un hecho de la marca.

Lo que sí puede: títulos grandes, botones, íconos, fondos, el propio Larry, y
cualquier gráfico o control (donde el umbral es 3:1 y lo pasa). Lo que no:
párrafos, etiquetas chicas, texto de ayuda.

**Para texto de marca sobre claro se usa `#0B6AB0` (azul) o `#CE4912` (naranja
oscuro).** El naranja oscuro conserva la familia cromática de Ignia y pasa el
umbral; es el sustituto natural cuando el diseño pide naranja y hay texto.

### Y la consecuencia que sale gratis

**El naranja de Ignia mejora en oscuro: 6.93:1.** El naranja claro llega a 10.29.
Eso encaja con dos hallazgos independientes: `mc-22` documenta que el modo oscuro
es ya expectativa de diseño para adolescentes, y `mc-23` recomienda tema
oscuro-primero para la banda adulta/experta.

La marca se ve mejor exactamente donde el producto ya quería ir.

## Neutros derivados — los que no vienen del PDF

**El PDF de Ignia no cubre tema oscuro.** Su gris más oscuro es `#434547`, que a
9.63:1 sobre blanco es un texto excelente pero es demasiado claro para servir de
fondo. Así que hubo que derivar cuatro neutros, y se declaran como derivados
para que nadie los confunda con color de marca:

| Token | Hex | Para qué | Verificación |
|---|---|---|---|
| `superficie-clara` | `#F7F7F8` | Superficie en tema claro | Texto `#434547` encima: **8.99:1** ✓ |
| `fondo-oscuro` | `#16181A` | Fondo en tema oscuro | — |
| `superficie-oscura` | `#1F2224` | Superficie en tema oscuro | 1.11:1 contra el fondo — separación, nunca texto |
| `texto-oscuro` | `#ECEDEE` | Texto en tema oscuro | **15.19:1** ✓ |

Sobre `#16181A`, la paleta de marca queda así: naranja Ignia **5.88:1** (aquí sí
lleva texto normal), naranja claro **8.72:1**, gris 400 **7.29:1**.

**Este bloque nació de que el auditor bloqueó un commit.** `brand-image.mjs`
marcó cuatro hex fuera de paleta en `tokens.css` — eran estos. La respuesta
correcta no era relajar el auditor sino declarar los colores y justificar su
contraste, que es lo que está arriba.

---

## Tipografía

**Raleway**, en tres pesos: Light para títulos, Medium para subtítulos, Regular
para textos.

### Las excepciones por sistema (D-036)

D-031 exige **tipografía del sistema** por plataforma; esta guía fija Raleway.
Las dos no pueden ser ciertas a la vez en el mismo elemento, y la salida no es
elegir una y perder la otra: **la marca habla en Raleway, los controles hablan
en la voz del sistema.**

| Superficie | Tipografía | Por qué |
|---|---|---|
| Títulos, cuerpo, textos de Larry | **Raleway** (`--font-marca`) | Es donde se lee a Ignia |
| Botones, campos, selects, navegación | **la del sistema** (`--font-sistema`) | Un control con tipografía ajena se siente web, y `mc-22` documenta que los adolescentes abandonan sin diagnosticar por qué |

Lo que resuelve `system-ui` en cada sistema, y con qué se parece más a Raleway:

| Sistema | Cara del sistema | Distancia a Raleway |
|---|---|---|
| Android | **Roboto** | Neo-grotesca contra humanista; es la más lejana, y es innegociable — es la tipografía de Material 3, y usar otra anula el motivo de la excepción |
| iOS / macOS | **SF Pro** | Cercana en proporciones; el cambio casi no se nota a tamaño de control |
| Windows | **Segoe UI Variable** | Cercana; comparte el aire humanista |
| Linux, web de escritorio | lo que haya | Raleway se queda: no hay convención de plataforma que respetar |

**No se detecta la plataforma en JavaScript.** `system-ui` la resuelve sola en
CSS, y una detección en JS fallaría justo en la primera pintura, que es donde
importa.

**La excepción de kinder manda sobre esta tabla.** En KINDER el grosor de trazo
no se negocia (ver abajo), así que ahí los controles también van en Raleway
Medium o Bold antes que en la cara del sistema si esta resulta más delgada.

### La excepción de kinder, que no es negociable

`mc-20` establece para 3-6 años: sans-serif redondeada, numerales de **24-32 px
mínimo**, y **alto grosor de trazo** para que se distingan de un vistazo.

**Raleway Light contradice el grosor de trazo.** En la banda KINDER:

- **Nunca Light.** Medium es el peso mínimo; Bold para numerales.
- Numerales a 24-32 px mínimo — son el contenido, no decoración.
- El niño no lee: toda instrucción lleva audio, y el texto es apoyo (`mc-20`).

### Las otras bandas

| Banda | Títulos | Cuerpo | Mínimos |
|---|---|---|---|
| KINDER 4-6 | Raleway Medium/Bold | Medium | Numerales 24-32 px |
| PRIMARIA 7-11 | Raleway Medium | Regular | Problema 18-20 px, etiquetas 16 px (`mc-21`) |
| SECUNDARIA 12-17 | Raleway Light/Medium | Regular | Legible en escaneo rápido; oscuro por defecto (`mc-22`) |
| SERIO / PRO | Raleway Light | Regular | Densidad mayor, oscuro-primero (`mc-23`) |

### Dislexia

`mc-21` documenta parámetros verificables: interlineado 1.5×, espaciado entre
letras 0.12em, entre palabras 0.16em, línea de 45-100 caracteres, alineado a la
izquierda, sin cursivas ni versalitas en cuerpo de texto.

**No se construye ni licencia una "fuente para dislexia".** `mc-38` recopila la
evidencia: Rello y Baeza-Yates no encontraron mejora en tiempo de lectura con
OpenDyslexic; un estudio de 2016 encontró que los lectores disléxicos
**prefirieron Arial**; uno de 2023 encontró preferencia estética pero ninguna
diferencia en resultados. La British Dyslexia Association recomienda sans-serif
ordinarias. El esfuerzo va al espaciado, no a la tipografía.

---

## Imágenes

**Recraft es la herramienta oficial** para arte generado — mantiene la
continuidad del avatar de Larry, que se generó ahí (`CLAUDE.md` § Imágenes).
**Google (Gemini / Nano Banana)** para las piezas complejas de interfaz.

### Formato

**AVIF con respaldo WebP.** Da 25-50% menos peso que PNG/JPG (`mc-47` §5), y el
mercado objetivo es Android de gama baja sobre 4G lento. Excepción: los íconos
de instalación del manifest siguen siendo PNG por compatibilidad.

En la imagen de LCP de cada pantalla, `fetchpriority="high"`.

### Las llaves

**Las llaves de Recraft y de Google nunca se commitean.** Van en `.env` local
(que `.gitignore` bloquea) o en `wrangler secret put`. Los nombres de variable
están en `.env.example`; los valores, jamás.

`audits/brand-image.mjs` busca patrones de llave de Recraft y de Google en cada
commit, y `audits/secrets.mjs` hace el barrido general. Una llave commiteada
sigue en el historial de git aunque se borre después: **se rota, no se borra**.

### Larry

El arte de Larry se genera en Recraft para conservar la continuidad del avatar.
Su canon está en `mc-37` y D-004: rinoceronte naranja, coach honesto, humor solo
sobre sí mismo, nunca condescendiente, y **nunca avergüenza a un niño**.

`mc-37` señala además que el estado `denying` del avatar existente —lenguaje
corporal de negación con la cabeza— se lee como "estás mal" y no debería
dispararse hacia un niño; para correcciones se prefiere `thinking` → `presenting`.

### La Sabana no habla

El arte del mundo de juego **no contiene texto** (D-019). Por eso se autora una
vez y sirve a los siete locales sin volver a generarse — es la palanca de peso
más barata que tiene el producto, y la razón de que 30 piezas de arte no se
multipliquen por siete.

---

## Lo que hace cumplir el auditor

`audits/brand-image.mjs`, en cada commit:

1. Todo hex en el código fuente pertenece a la paleta Ignia.
2. Ninguna imagen en PNG/JPG salvo íconos de instalación.
3. Ningún patrón de llave de Recraft o Google en archivos rastreados o nuevos.
4. Recuerda, en cada corrida, el contraste real del naranja sobre blanco.

Lo que **todavía no** verifica, y toca a las fases que lo habilitan: que el
naranja no se use para texto chico en una pantalla real (F2, junto con
`contrast` y `axe-a11y`), y que los pesos de Raleway respeten la excepción de
kinder (F2).

---

## Navegación — una sola primaria a la vez (D-064)

Nació de una captura real de un iPhone: `nav.sitio` (arriba) y
`.barra-inferior` (abajo) se pintaban juntas en iOS/Android, y en una
pestaña de Safari eso son **tres** navegaciones apiladas —las dos del sitio
más la barra de direcciones del navegador—. La regla que lo evita, y que
vale para cualquier pantalla nueva que se agregue: **nunca dos sistemas de
navegación primaria visibles al mismo tiempo.** Investigación completa en
`mc-49`.

### Qué navegación existe en cada contexto

| Contexto | Señal | Navegación |
|---|---|---|
| App instalada, ancho de teléfono | `[data-platform=ios\|android]` + `display-mode: standalone` | Barra inferior, 5 destinos fijos, ícono + texto |
| App instalada, iPad en horizontal completo | `[data-platform=ios]` (iPad) + `display-mode: standalone` + 1024-1366px | Riel lateral |
| Pestaña de navegador, móvil | `[data-platform=ios\|android]` sin `display-mode: standalone` | Encabezado compacto + `<details>/<summary>` que despliega las 6 secciones debajo |
| Escritorio, cualquier estado | `[data-platform=macos\|windows\|otro]` | Barra horizontal arriba (sin cambio) |

`display-mode: standalone` es CSS puro — el mismo mecanismo que ya usa
`Instalar.astro`. Nunca se detecta con JavaScript, por la misma razón que
`data-platform` no se detecta en JS: fallaría en la primera pintura.

### La barra inferior instalada: 5 y solo 5

HIG y Material 3 coinciden en el máximo: **3-5 destinos**, nunca más. Los
cinco de Math Challenge son **Inicio, Niveles, Investigación, Entrar, Crear
cuenta** — las dos acciones de cuenta van adentro porque el dueño pidió
explícitamente que Entrar sea de un solo toque, sin pasar por un segundo
nivel. Eso agota los 5 slots: no queda uno para una pestaña "Más".

Origen, Arquitectura y Código abierto —las tres secciones que no caben— van
en un `<details>/<summary>` nativo en la franja superior del modo
instalado. Cero JavaScript, mismo elemento que el menú de pestaña de
navegador de abajo.

### El menú de pestaña de navegador (Chrome/Safari sin instalar)

Esta es la vista que ve la mayoría de las visitas nuevas — la que produjo
la captura que originó esta regla. Encabezado compacto: marca + **Entrar y
Crear cuenta siempre visibles** (mismo criterio de "un toque" que la barra
instalada) + un botón que despliega las 6 secciones.

El menú se despliega **empujando el contenido hacia abajo**, nunca como un
overlay de pantalla completa: `mc-49` documenta que los overlays de
pantalla completa en iOS Safari no cierran con el gesto de deslizar que sí
funciona en Android, y que las áreas seguras hay que manejarlas con cuidado
en ese contexto. Empujar el contenido evita esa categoría entera de bug por
construcción.

### Íconos de la barra inferior

Ícono + texto, no solo texto — es lo que HIG y Material 3 esperan. Los 5
glifos son **línea simple, monocromos, SVG inline con `currentColor`**, no
arte de Recraft ni pieza de Gemini/Nano Banana (`CLAUDE.md` § Imágenes): un
glifo de navegación no es ilustración de marca, y SVG inline no pesa una
petición HTTP ni entra en la regla de AVIF/WebP, que es para fotografía.

### Sin librería

Framework7, Ionic y Onsen UI prometen "look nativo" de fábrica, pero cuestan
peso de JavaScript real en **todas** las páginas del sitio, no solo donde
se usan, y `mc-49` no encontró evidencia de que el resultado supere a CSS
bien hecho para una barra de pestañas. La navegación se construye con HTML
semántico + `data-platform` + `display-mode`, exactamente el patrón que ya
existe en el resto del sitio.

---

## Navegación privada — el área autenticada nunca hereda el nav público (D-065)

`layouts/Base.astro` es el sitio de MARKETING. Ninguna pantalla detrás de
sesión lo usa — ni las de niño (`app/kids/**`, que ya tenían su propio
razonamiento citado tres veces) ni las de adulto (`app/index.astro`,
`app/signin.astro`, antes de D-065). Toda pantalla autenticada de adulto usa
`layouts/Privada.astro`; toda pantalla de niño sigue construyendo su propio
árbol mínimo, sin heredar ningún layout compartido. Investigación completa
en `mc-50`.

### El área de adulto (`layouts/Privada.astro`)

Una franja de pestañas simple, fija arriba — **no** los cuatro bloques de
D-064. Esa máquina existe para un problema que aquí no hay: 2-5 destinos,
sin un nav de marketing con el que competir ni una pestaña de navegador que
evitar. Family Link —el análogo real más cercano, un adulto gestionando el
uso de un menor— resuelve lo mismo con exactamente este patrón: pestañas
fijas, sin importar si la app está instalada.

**Las pestañas se derivan de la cuenta real, nunca de la puerta de
registro:**

| Señal | Pestaña |
|---|---|
| `hijos.length > 0` | Hijos, Progreso*, Límite de pantalla* |
| `users.is_learner = 1` | Practicar* |
| Siempre | Cuenta (`/app/perfil/`, ruta aparte — passkey, contraseña) |

\* "Próximamente" hasta que F8 (Progreso, Límite de pantalla) o F5b/F10
(Practicar) existan de verdad. Se enseñan igual: el hueco visible ahora
cuesta menos que rehacer la navegación cuando esas fases lleguen.

Tope de 5 (HIG, Material 3 — el mismo límite que `mc-49` ya fijó para el
sitio público). Sin ninguna pestaña real propia (ej. cuenta de maestro, F9
sin construir), la página redirige directo a `/app/perfil/` — una pantalla
con una sola pestaña no es una pantalla. La pestaña de aterrizaje es la
primera REAL, no la primera de la lista: un aprendiz solo no debe abrir la
app y encontrar un "Próximamente" como bienvenida.

Tokens SERIO (`bandas.css`, oscuro por defecto) — es superficie de adulto
por construcción, nunca de niño. `Rum banda="SERIO"`, no `PUBLICO`: D-037
permite medir aquí, pero mezclar tráfico de marketing con uso real del
producto en el mismo balde de métricas sería un dato mentiroso.

### Las bandas de niño futuras (PRIMARIA, SECUNDARIA): cero navegación de cuenta, siempre

Esto se decidió ahora, antes de que esas fases arranquen, a pedido expreso
del dueño — para no tener que redecidirlo por partes. La regla que
`app/kids/**` ya aplica hoy para KINDER **no cambia por banda**: la rejilla
de caras es la navegación completa, máximo 2 toques de abrir la app a
"respondiendo un reto", cero menú, cero configuración de cuenta a la vista
de un niño. Ningún niño llega nunca a `layouts/Privada.astro` — ese layout
es de adulto por construcción, no por convención que alguien podría romper
sin querer.

Lo que sí cambia por banda es la **densidad de contenido dentro de la
pantalla de práctica**, nunca la navegación de cuenta:

- **PRIMARIA** (`mc-21`): una franja ligera de "dónde estoy en la sesión"
  (progreso/racha) — es la primera banda donde ese contexto tiene sentido,
  pero sigue sin ser un menú.
- **SECUNDARIA** (`mc-22`): riel lateral persistente **solo en escritorio**
  dentro de la pantalla de práctica; en teléfono, el teclado numérico anclado
  abajo, sin chrome añadido.
- **Adulto/PRO, cuando "Practicar" pase de próximamente a real** (`mc-23`,
  F5b/F10): navegación de salto visible (saltar de tema) **dentro** de esa
  pantalla — vive en el mismo `Privada.astro`, no en un layout nuevo.

## iPad — primera clase, no un teléfono ancho (D-041)

El iPad y el teléfono se diseñan por separado. Lo que sigue es la tabla que
`audits/ipad-usabilidad.mjs` hace cumplir.

### Orientación

| | Regla |
|---|---|
| Horizontal | Donde vive la experiencia buena. Dos columnas, manipulables grandes, el teclado numérico al alcance del pulgar |
| Vertical | **Funciona con dignidad.** Una columna, sin scroll horizontal, sin contenido cortado |
| Bloqueo | **Nunca.** En iPad es imposible —Apple ignora el `orientation` del manifest— y en Android sería una violación de WCAG 2.2 AA 1.3.4 |

### Anchos que hay que aguantar

No son resoluciones de dispositivo: son los anchos que la multitarea produce, y
es donde se rompe un diseño pensado solo a pantalla completa.

| Contexto | Ancho aproximado |
|---|---|
| Split View a un tercio | 320–375 px |
| Split View a la mitad | 507–512 px |
| Split View a dos tercios | 694–795 px |
| Pantalla completa vertical | 744–1032 px |
| Pantalla completa horizontal | 1024–1366 px |

**Ninguna regla CSS puede exigir un ancho mínimo mayor que el tercio.** Un
`min-width: 400px` en un contenedor rompe la multitarea en silencio.

### Entrada — cuatro a la vez, no una

Un iPad con Magic Keyboard es un equipo de escritorio; el mismo iPad en las manos
de un niño de cinco años es táctil. Los dos son el mismo día.

| Entrada | Regla |
|---|---|
| Dedo | 44 px (HIG) · **88 px en kinder** (`mc-20`), también aquí: hay sitio de sobra |
| Trackpad y ratón | Los estados de *hover* **nunca esconden función**. Lo que solo aparece al pasar el cursor, con el dedo no existe |
| Teclado físico | Navegación completa por tabulador, con **foco visible** (WCAG 2.1.1 y 2.4.7). El orden de tabulación sigue el orden visual |
| Apple Pencil | Nada depende de un gesto que el Pencil no hace: ni pellizcar, ni deslizar con dos dedos, ni mantener pulsado |

### Áreas seguras

Se respetan `env(safe-area-inset-*)` en los cuatro lados. El indicador de inicio
se come el borde inferior en horizontal, que es justo donde un diseño de teléfono
suele poner la barra de acciones.

