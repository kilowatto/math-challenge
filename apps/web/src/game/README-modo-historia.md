# Modo Historia (D-184)

Mapa de niveles en Phaser 4 para **PRIMARIA y SECUNDARIA**. KINDER no lo usa —
sigue con la Sabana de siempre (`components/mapa/EscenaSabana.astro`,
`pages/[locale]/app/kids/mapa.astro`).

## Cómo agregar un mundo/capítulo nuevo, sin tocar ninguna escena

Todo vive en **un solo archivo**: [`data/story.ts`](data/story.ts). Agrega una
entrada al arreglo `CAPITULOS`:

```ts
{
  id: "primaria-2",
  name: "El nombre que se ve en pantalla",
  backgroundKey: "fondo-primaria-2",     // ver "Arte" abajo
  worldWidth: 720,
  worldHeight: 2400,                     // alto del mundo, no de la pantalla
  pathData: [ { x, y }, ... ],           // puntos de control del camino
  vegetationLayers: [ ... ],             // ver VegetationLayerConfig
  musicKey: null,                        // null hasta que exista audio autorado
}
```

`MapScene` construye el camino con `Phaser.Curves.Path` + `Spline` a partir de
`pathData` — nunca hay que calcular coordenadas de nodo a mano: los nodos
salen del árbol REAL del niño (ver la sección siguiente) y `distribuirNodos()`
los coloca sobre la curva.

Ningún capítulo define nodos, estrellas ni progreso. Eso sale siempre del
servidor.

## De dónde salen los nodos — NUNCA de `story.ts`

`packages/motor/src/mapa.ts::construirArbol()` (F7 #233) recibe el progreso
real (`skill_state`, vía `lib/mapa-primaria.ts::entradasDelArbol()`) y decide
qué habilidades existen y en qué grupo caen. `MapScene` solo posiciona ese
árbol sobre el camino — no inventa progreso. Si `story.ts` tuviera su propia
lista de nodos, sería una segunda fuente de verdad, exactamente lo que el
encabezado de `mapa.ts` prohíbe.

Esto también significa: **el número de habilidades que caben en un capítulo no
lo decide este archivo**. Un niño con 2 habilidades tocadas ve 2 nodos; uno con
10, ve 10. `pathData` solo necesita suficientes puntos de control para que la
curva se vea bien con el rango esperado de habilidades de esa banda.

## Arte: real, de Recraft (D-186, D-187) — con una excepción de marca

`backgroundKey` y las claves de `VegetationLayerConfig` (`arbusto-a`,
`arbusto-b`, `helecho-a`) son ilustraciones reales, generadas por
[`scripts/gen-mapa-historia.mjs`](../../../../../scripts/gen-mapa-historia.mjs)
y cargadas por `scenes/PreloadScene.ts` desde `apps/web/public/juego/*.webp`.
Solo WebP (no el par AVIF+WebP de siempre): un `Phaser.Loader` pide una url
fija, sin el mecanismo de negociación de formato de un `<picture>` — ver el
encabezado del script.

**El fondo es UNA escena grande por capítulo, no un mosaico** (`MapScene`
usa `Image` + `setDisplaySize`, no `tileSprite`). Trae un camino de tierra
pintado que **NO es el camino real** — `MapScene` sigue dibujando su propio
sendero encima, exacto a la posición de cada nodo; los dos conviven, y es
una concesión cosmética conocida, no un defecto (ver D-187).

**El verde de estas piezas es una excepción de marca (D-186)** —
`docs/guia-de-estilo.md` declara `verde-follaje`/`verde-claro`, y
`audits/brand-image.mjs` los reconoce. Nunca se usan fuera de esta arte: ni
un botón, ni texto, ni un ícono de interfaz lleva verde, en ninguna banda.

Lo que sigue siendo procedural: `avatar-marca` (`scenes/BootScene.ts`), y
las estrellas de celebración de `GameplayScene.ts` (`this.add.star`, no
arte — una forma simple no necesita ilustración).

Para agregar/reemplazar una pieza de arte:

1. Escribe el prompt en `gen-mapa-historia.mjs` (o uno nuevo). Fondo:
   pide una escena, nunca un mosaico — el modelo lo ignora. Props/vegetación:
   evita "cute"/"picture book" en objetos chicos — dispara caras.
2. Corre el script, **mira cada imagen antes de commitearla**.
3. En `scenes/PreloadScene.ts`, agrega `this.load.image(clave, ruta)`.
4. Si la clave era procedural, quítala de `BootScene.ts`.

Ninguna otra escena cambia — todas piden texturas por clave, nunca les importa
si detrás hay un dibujo generado o un archivo cargado.

## El nivel (D-183) — cualitativo, nunca un número

`ChallengeScene` ofrece Fácil/Medio/Difícil solo si `ProgressManager.
puedeElegirNivel` es verdadero — un booleano que **decide el servidor**
(`puedeElegirNivel()` en `apps/web/src/pages/api/jugar.ts`) contra la banda
real del niño en D1, nunca esta escena. No hay ningún `if` de edad que agregar
aquí: si el booleano llega en `false`, el selector simplemente no se dibuja.

Si tocas cualquier archivo de este directorio y mencionas la palabra "nivel"
en un lugar nuevo, `audits/mapa-sin-numero-de-nivel.mjs` y
`audits/rango-vs-nivel.mjs` van a pedir que el archivo también mencione
`puedeElegirNivel` o `nivelFijo` — es la marca de que ya pasó por esta
revisión.

## "Jugar" es el reto real, también en Phaser (D-185)

`ChallengeScene` arranca `scenes/GameplayScene.ts` — el reto de verdad,
dibujado en Phaser, sobre `reto/RetoController.ts`: un puerto SIN RENDERER
de la misma lógica que `components/reto/Pantalla.astro` (KINDER) usa hoy —
mismo `/api/jugar`, mismo elegir-antes-de-confirmar (línea roja #8), misma
cola offline, misma voz. `reto/AccessibleReto.ts` es la SEGUNDA vista de ese
mismo controlador: un espejo DOM/ARIA oculto (`#historia-accesible`, montado
por `HistoriaMount.astro`), para que un lector de pantalla pueda contestar
sin depender del `<canvas>`. Las dos vistas llaman a los mismos métodos —
nunca guardan su propia copia del ítem actual, así que no pueden divergir.

Formato único hoy: el banco de PRIMARIA es enteramente `toca_la_respuesta`
(enunciado + opciones de texto/número, sin dibujo) — por eso `GameplayScene`
no porta el switch de cinco formatos de `Pantalla.astro`. El día que
PRIMARIA tenga un formato con dibujo, esa escena gana un método
`pintarEscena()`, no una nueva.

**Entrada del reto (D-187):** al abrir `GameplayScene`, una sola vez por
sesión (no por ítem), se ve un letrero de madera colgante
(`letrero-madera.webp`, con el texto de `rotulos.mirar` pintado por Phaser
encima — nunca horneado en la imagen) y una cuenta regresiva "3, 2, 1". Al
acertar una respuesta, un estallido de estrellas procedurales. Ninguno de
los tres tiene espejo en `AccessibleReto.ts`: son refuerzo visual sin
información nueva que un lector de pantalla necesite.

## Huecos conocidos, documentados a propósito (no descubiertos después)

- **Sin capa de accesibilidad paralela — solo en el MAPA.** `MapScene`
  sigue siendo 100% `<canvas>`; tocar un nodo no tiene espejo DOM/ARIA
  todavía. El RETO (`GameplayScene`) sí lo tiene — ver arriba y D-185. La
  Sabana de KINDER (HTML/CSS) no se tocó y sigue siendo accesible como
  siempre.
- **Sin auditor determinista nuevo** para código de escena Phaser (texto
  dibujado en canvas es invisible para los auditores que leen `.astro`/JSON).
  Los ~140 auditores existentes siguen cubriendo TODO lo demás del producto.
  Un hueco real y ya encontrado: `audits/brand-image.mjs` solo relee hex en
  formato `#RRGGBB` en el código fuente — un color de Phaser escrito como
  `0xc9e9a3` (numérico) se le escapó hasta que alguien lo vio a simple
  vista (D-187). No corregido; declarado.
- **`DialogueScene` existe sin contenido.** Ningún capítulo tiene diálogo
  autorado — inventar narrativa aquí sería contenido de producto, y ese pasa
  por revisión humana (CLAUDE.md § Contenido), no por un commit de código.
- **El presupuesto de bundle tiene una excepción documentada.** Phaser pesa
  ~380 KB gz — `audits/bundle-budget.mjs` lo mide aparte del resto del sitio
  (mismo patrón que D-182 con Zaraz) porque solo lo descarga quien entra a
  esta pantalla, nunca el resto del sitio.
- **CORREGIDO (D-188, 2026-08-08).** `servirSiguiente()` en `/api/jugar.ts`
  ahora lee la banda real (`bandaRealDe()`) y sirve `item_bank` (D-072) a
  PRIMARIA/SECUNDARIA fuera de un duelo, igual que ya hacía con el adulto —
  antes servía KINDER a cualquier niño sin importar su banda. Era arquitectura
  anterior a Modo Historia, encontrada verificando D-185. Ver D-188.
- **El sistema de composición de props por ítem queda sin diseñar.** El
  video de referencia del dueño mostraba un rompecabezas (contar triángulos
  sobre bloques de hielo) que representa la cantidad real de un ítem — eso
  no es una pieza de arte, es un sistema (qué props existen, cómo se
  posicionan según el número real, qué formatos lo usan). Ver D-187.

Las decisiones de arriba se tomaron las noches del 2026-08-06 y 2026-08-07
(D-184, D-185, D-186, D-187 en `docs/decisions.md`), no son olvidos — pero
varias siguen siendo trabajo pendiente real.
