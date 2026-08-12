# Mundo Kinder multi-bioma — plan ultra detallado de los 1,008 retos de Modo Historia

> **Fecha:** 2026-08-09. **Esto no es contenido: es el plan** — mismo patrón
> que [`f5-contenido-kinder.md`](f5-contenido-kinder.md) y
> [`2026-08-09-f5d-mecanicas-interactivas-primaria.md`](2026-08-09-f5d-mecanicas-interactivas-primaria.md).
> No hay un solo reto escrito aquí; hay la aritmética real (re-ejecutada, no
> estimada), qué habilidades alcanzan y cuáles no, el diseño visual de cada
> bioma, y el catálogo de mecánicas — todo lo que hace falta para que la
> curaduría empiece sin decisiones pendientes.
>
> **Corrección de número:** 252 fue el total del modelo "reparto" (14
> troncos únicos × 18), descartado desde el inicio de esta conversación a
> favor de "multiplicación" (cada bioma con sus 14 troncos completos). Con
> 4 biomas eso da **56 troncos**, no 252. El total de retos sigue siendo
> **1,008** (56 × 18) — ese número no cambió nunca.

---

## 0. Las nueve decisiones tomadas en esta sesión

| # | Pregunta | Decisión |
|---|---|---|
| 1 | ¿Pasar un tronco exige 60% de 18 retos? | **No.** Se mantiene D-190 sin cambios: el siguiente tronco se desbloquea con solo TOCAR el anterior |
| 2 | ¿Los 14 troncos son únicos o cada bioma tiene los suyos? | **Cada bioma tiene sus 14 troncos completos** ("multiplicación") — 56 troncos totales |
| 3 | ¿Cuántos biomas? | **4**: Sabana, Desierto, Nieve, Costa |
| 4 | ¿Los troncos deben estar sobre el camino? | Sí — cada bioma diseña su propio camino sobre su propio arte, ninguno se hereda de otro |
| 5 | Total de retos | **1,008** (4 biomas × 14 habilidades × 18 retos) |
| 6 | ¿Qué mecánicas entran para kinder? | **19 mecánicas propias de kinder**, investigadas y confirmadas — nunca las de resortera/arrastrar de PRIMARIA |
| 7 | ¿Cómo se logran 3 mecánicas por tronco si cada habilidad hoy tiene un solo formato fijo? | **Cada habilidad gana múltiples formatos** — mismo contenido numérico, distinto gesto |
| 8 | Mínimo de mecánicas por nivel | **Al menos 3 mecánicas diferentes dentro de los 18 retos de un mismo tronco** |
| 9 | ¿Hay que ampliar las 6 habilidades cortas (K01,K02,K04,K05,K09,K10)? | **No — superado.** Con 3 mecánicas de 6 retos cada una (no 1 mecánica con 72), todas las 14 habilidades ya alcanzan sin tocar su combinatoria. Ver §4 |
| 10 | ¿Larry explica también POR QUÉ está bien, no solo cuando se equivoca? | **Sí, una explicación específica por acierto**, no genérica — mismo nivel de detalle que los tips de error |
| 11 | ¿Las 19 mecánicas necesitan su propio SFX? | **Sí, 19 nuevos** — "de textura de interacción", separados de los 3 universales de D-198 (evento: toque/acierto/error), que se quedan igual |
| 12 | ¿Música por bioma? | **Sí, 8 pistas** (4 biomas × 2 ánimos) — reemplaza las 2 universales de D-198 |
| 13 | Assets de mecánica × bioma | **Bespoke solo para objetos del mundo** — 40 generaciones de Recraft (10 piezas × 4 biomas). Las 9 mecánicas de interfaz abstracta (no objetos del mundo) se dibujan una sola vez con `Phaser.Graphics`, sin variar por bioma — enmienda del dueño a la decisión original de "100% bespoke", 2026-08-10 |
| 14 | Material de tronco por bioma | **Nuevos por bioma** (roca de arenisca, bloque de nieve) — no reusar madera en los 4 |
| 15 | Plataforma de la voz de Larry (Kilowatto) | **ElevenLabs** — reusa la llave y el tipo de excepción a D-035 que ya tienen música/SFX |

---

## 1. La aritmética exacta, y por qué el problema de volumen ya no existe

```
4 biomas × 14 habilidades × 18 retos = 1,008 retos
```

**El cambio que lo resuelve todo:** en la sesión anterior de este mismo plan,
se pidió que cada habilidad tuviera 72 combinaciones sin repetir (4 biomas ×
18 retos en UN solo formato) — y 6 de las 14 no llegaban. Ahora los 18 retos
de un tronco se reparten en **3 mecánicas de 6 retos cada una**, y cada
mecánica se sirve de la MISMA lista de combinaciones ya existente
(`parametros()`), solo que dibujada con un gesto distinto. El umbral real ya
no es 72: es **24 combinaciones por mecánica** (6 retos × 4 biomas), y
**las 14 habilidades ya lo cumplen sin ampliar nada** — hasta la más corta,
K05, tiene 35.

| Habilidad | Combos hoy | Umbral real (6×4) | ¿Alcanza? |
|---|---|---|---|
| K01 | 40 | 24 | Sí |
| K02 | 44 | 24 | Sí |
| K03 | 90 | 24 | Sí |
| K04 | 50 | 24 | Sí |
| K05 | 35 | 24 | Sí |
| K06 | 77 | 24 | Sí |
| K07 | 90 | 24 | Sí |
| K08 | 133 | 24 | Sí |
| K09 | 37 | 24 | Sí |
| K10 | 45 | 24 | Sí |
| K11 | 162 | 24 | Sí |
| K12 | 135 | 24 | Sí |
| K13 | 160 | 24 | Sí |
| K14 | 135 | 24 | Sí |

**Por qué es pedagógicamente válido reusar los mismos números en dos
mecánicas distintas** (ej. "comparar 3 y 5" aparece una vez como `flash` y
otra vez como `comparar-y-tocar`): no es la misma pregunta repetida, es el
mismo hecho practicado por un canal distinto — exactamente el argumento de
la enseñanza con variación china (`mc-02`) que ya gobierna el resto del
banco: varía el gesto, se mantiene el hecho matemático, y esa combinación es
la que enseña que el hecho no depende del formato en que se presentó.

**§§4-5 de la versión anterior de este documento (ampliar objetos en las 6
habilidades cortas) quedan superadas por este hallazgo** — no hace falta
ese trabajo. Se deja fuera de este documento.

---

## 2. Las 19 mecánicas, confirmadas por investigación

Ninguna usa arrastrar, doble-toque ni sacudir el dispositivo — los tres
gestos que la literatura (`mc-20`, Hourcade et al., Baloian et al., NN/g)
documenta como los que más fallan a los 4-6 años.

| # | Mecánica | Fuente | Nueva o existente |
|---|---|---|---|
| 1 | `toca_la_respuesta` — opción múltiple con dibujos | banco actual | Existente |
| 2 | `toca_para_contar` — tocar cada objeto, Larry cuenta en voz alta | banco actual | Existente |
| 3 | `flash` — destello de puntos, ¿cuántos eran? | banco actual | Existente |
| 4 | `arma_el_numero` — tocar casillas de un marco de diez | banco actual | Existente |
| 5 | `cual_sobra` — tocar el que no pertenece | banco actual | Existente |
| 6 | Tap en secuencia/orden (cada toque crea un objeto con conteo audible) | TouchCounts (Sinclair & Jackiw) | Nueva |
| 7 | Tap-to-pop (reventar burbujas contando) | Bugs and Bubbles, ABCmouse | Nueva |
| 8 | Tap origen→destino con salto animado (toca el objeto, toca el destino, salta solo — sin sostener) | NN/g, sustituto directo del arrastre | Nueva |
| 9 | Swipe corto con snap (carril con paradas fijas, no arrastre libre) | Hourcade — gesto más fácil en preescolares | Nueva |
| 10 | Comparar-y-tocar (dos cantidades aparecen/desaparecen, toca la mayor/menor) | SplashLearn, Math Kids | Nueva |
| 11 | Tap-to-sort en contenedores (toca el ítem, toca el contenedor — dos toques) | Sort & Match: Numbers | Nueva |
| 12 | Match-tap de pares (memoria, voltear cartas tocando) | apps de memoria 2-6 años | Nueva |
| 13 | Tap-to-beat / ritmo | Beatsneak Bandit, Monkey Drum | Nueva |
| 14 | Tap-hasta-un-objetivo con contador visible | TouchCounts | Nueva |
| 15 | Trazado guiado sobre camino fijo (no libre) | Trace Path app | Nueva |
| 16 | Tap-and-hold — **solo pista opcional**, nunca respuesta juzgada | advertencia de la literatura | Nueva (transversal) |
| 17 | Tap-para-fusionar (tocar dos valores para combinarlos en uno con la suma) | Teach Your Monster — "Bubbles" | Nueva |
| 18 | Tap incremental en dos puntos fijos (un punto suma 1, otro suma "un grupo") | Endless Numbers — "Place Value" | Nueva |
| 19 | Tap a blanco en movimiento (el numeral se mueve/gira, tocarlo antes de que pase) | Teach Your Monster — "Monster Trucks" | Nueva |

**Dos gestos investigados y rechazados, con evidencia:** doble-toque (se
registra como dos toques lentos, no confiable en preescolares) y sacudir el
dispositivo (excluye a niños con dificultad motriz, choca con "reducir
movimiento").

---

## 3. Las 3 mecánicas por habilidad — el mapeo completo

Regla de asignación: cada habilidad conserva su mecánica actual (para no
perder la combinatoria ya construida y revisada) y gana exactamente 2
mecánicas nuevas, elegidas por afinidad real con lo que la habilidad mide
— nunca al azar.

| Código | Mecánica existente (se mantiene) | Mecánica nueva 1 | Mecánica nueva 2 | Por qué estas dos |
|---|---|---|---|---|
| K01 subitizar 1-3 | `flash` (#3) | Tap-to-pop (#7) | Comparar-y-tocar (#10) | Pop mide subitización activa (reventar exactamente N); comparar mide subitización bajo contraste |
| K02 subitizar 4-6 | `flash` (#3) | Tap-to-pop (#7) | Tap-to-beat (#13) | Mismo eje que K01; el ritmo agrupa 4-6 en pulsos, reforzando subitización conceptual (`mc-06` §1) |
| K03 contar 1-10 | `toca_para_contar` (#2) | Tap secuencia/orden (#6) | Tap-to-pop (#7) | Ambas refuerzan correspondencia uno-a-uno con un gesto distinto al de señalar |
| K04 contar 11-20 | `toca_para_contar` (#2) | Tap-hasta-objetivo (#14) | Tap a blanco en movimiento (#19) | Objetivo con contador visible extiende el conteo; blanco en movimiento mide fluidez de numeral ya no solo conteo |
| K05 uno a uno | `toca_la_respuesta` (#1) | Tap origen→destino (#8) | Match-tap de pares (#12) | Mover un gorro a un pato ES correspondencia uno a uno con las manos; emparejar es la misma habilidad en formato memoria |
| K06 cardinalidad | `toca_la_respuesta` (#1) | Tap secuencia/orden (#6) | Match-tap de pares (#12) | Secuencia refuerza "el último número dicho es el total"; emparejar cantidad-numeral es cardinalidad directa |
| K07 comparar más/menos | `toca_la_respuesta` (#1) | Comparar-y-tocar (#10) | Tap-to-sort contenedores (#11) | Comparar-y-tocar es el instrumento diagnóstico directo de esta habilidad; clasificar en "más"/"menos" la generaliza a 3+ grupos |
| K08 recta numérica 0-10 | formato actual mixto | Swipe corto con snap (#9) | Trazado guiado (#15) | Mover un indicador y trazar un tramo son las dos formas naturales de operar sobre una recta |
| K09 marco de diez | `arma_el_numero` (#4) | Tap origen→destino (#8) | Tap incremental 2 puntos (#18) | Mover una ficha al marco reusa el gesto; el incremental adapta "unidad vs. grupo completo" sin romper que el marco es de 10 |
| K10 descomponer (5=2+3) | `arma_el_numero` (#4) | Tap-para-fusionar (#17) | Tap origen→destino (#8) | Fusionar dos partes en el total es la operación inversa exacta de descomponer |
| K11 sumar contando | `toca_la_respuesta` (#1) | Tap-to-pop (#7) | Tap-para-fusionar (#17) | Reventar hasta el total y fusionar dos valores son dos maneras válidas de "ver" una suma |
| K12 restar quitando | `toca_la_respuesta` (#1) | Tap origen→destino (#8) | Tap-to-pop (#7) | Mover-fuera y reventar-para-quitar son ambas formas concretas de "quitar" |
| K13 formas básicas | `cual_sobra` (#5) | Tap-to-sort contenedores (#11) | Trazado guiado (#15) | Clasificar por tipo de forma; trazar el contorno refuerza reconocimiento de bordes |
| K14 patrones AB | `toca_la_respuesta` (#1) | Swipe corto con snap (#9) | Tap-to-beat (#13) | Avanzar por la secuencia con paradas fijas, y el ritmo, son dos maneras de sentir un patrón antes de nombrarlo |

**Cobertura de las 13 mecánicas nuevas:** las 13 se usan; ninguna quedó sin
asignar. Las más reutilizadas son tap-to-pop (K01,K02,K03,K11,K12 — 5
habilidades) y tap origen→destino (K05,K09,K10,K12 — 4 habilidades), lo que
importa para la secuencia de trabajo (§7): construir esas dos primero
cubre más terreno por hora de ingeniería.

---

## 4. Los 4 biomas: diseño visual completo

Principio transversal (decisión #4 y la que motivó esta vuelta del plan):
**cada tronco es el elemento que da apoyo visual sobre el camino — nunca un
círculo flotando sobre el fondo.** Por eso el "tronco" cambia de material
según el bioma: no es un tronco de madera en los cuatro, es lo que la
lógica del terreno permite pisar.

### 4.1 Sabana

- **Paleta:** dorado/verde cálido (ocre `#D9A345`-ish para el pastizal, verde
  oliva para acacias), cielo azul claro diurno — continuidad con el arte
  Recraft ya existente de las 14 lugares.
- **Elementos de fondo:** acacias dispersas, pastizal alto, un abrevadero
  como punto de referencia narrativo (no jugable), colinas suaves de fondo
  lejano.
- **Material del tronco:** tronco de madera clara (`tronco-a`/`tronco-b`,
  ya generados por D-190) — es el único bioma donde "tronco" es
  literalmente un tronco.
- **Música:** percusión suave, tono cálido y abierto.
- **Larry:** pose habitual, sin atuendo especial — es su hogar.

### 4.2 Desierto ("Las dunas de arena")

- **Paleta:** arena/terracota (`#C98A4B`-ish), cielo despejado más pálido
  que la Sabana para diferenciarse.
- **Elementos de fondo:** dunas onduladas como capas de profundidad,
  cactus (`cactus-b`, ya generado), rocas de arenisca (`roca-desierto`, ya
  generado), sin oasis con agua visible (evita que Recraft cuele
  vegetación fuera de tono).
- **Material del "tronco":** **piedra de arenisca redondeada**, no madera
  — coherente con que en un desierto no hay troncos de árbol tirados. Es
  un asset nuevo a generar (`roca-paso` o similar), reusando la paleta ya
  aprobada de `roca-desierto`.
- **Camino:** debe dibujarse sobre las dunas mismas — el borde de una
  duna, no un río. Este es el trabajo de ejecución ya señalado en la
  decisión #4; aquí se fija que la superficie de apoyo es la cresta de
  las dunas, no un cauce.
- **Música:** más espaciada, con un instrumento de viento.
- **Larry:** puede llevar un pañuelo/turbante ligero como variación de
  vestuario — decisión de arte, no bloqueante.

### 4.3 Nieve ("Las montañas nevadas")

- **Paleta:** blanco/azul frío, con acentos violeta pálido de
  `cristal-hielo` (ya generado).
- **Elementos de fondo:** pinos nevados (`pino-nevado`), rocas cubiertas
  de nieve (`roca-nieve`), cristales de hielo como acento brillante,
  cielo más gris/crepuscular para contraste cálido-frío con Sabana y
  Desierto.
- **Material del "tronco":** **bloque de nieve compactada** o pequeño
  islote de hielo — no madera. Asset nuevo, mismo principio que Desierto.
- **Camino:** sobre la línea de cresta de las montañas o un sendero
  despejado de nieve — nunca cruzando una grieta o pendiente empinada sin
  apoyo visual debajo del tronco.
- **Música:** más lenta, con campanas o tono cristalino.
- **Larry:** bufanda o gorro como variación de vestuario, decisión de
  arte no bloqueante.

### 4.4 Costa (pendiente de arte — especificación para la próxima sesión de Recraft)

Este bioma no tiene arte todavía; 3 intentos previos fallaron porque
Recraft coló gente, casas, veleros y un faro pese a exclusiones explícitas.
**Especificación para el próximo intento, más restrictiva que las
anteriores:**

- **Paleta:** turquesa/arena pastel, sin azul marino oscuro (que sugiere
  mar profundo/barcos).
- **Elementos permitidos:** arena de playa, palmeras (silueta de hoja
  solamente, sin base tipo "choza"), conchas, espuma de ola en la orilla
  (textura, no una ola con forma de barrida completa que sugiera oleaje
  fuerte/tormenta), **madera de deriva** — que resuelve el material del
  tronco de forma natural: **el tronco de Costa es, literalmente, un
  tronco de madera de deriva**, sin necesidad de inventar un material
  nuevo.
- **Elementos prohibidos, explícitos en el prompt de generación:** ninguna
  persona, ninguna estructura habitable (casa, choza, cabaña), ningún
  barco/velero de ningún tamaño, ningún faro, ninguna embarcación de
  ningún tipo.
- **Camino:** a lo largo de la línea de marea, sobre arena firme — nunca
  sobre agua.
- **Música:** pendiente, junto con el arte.
- **Nota de proceso:** esta especificación es más estricta que las 3
  anteriores porque nombra explícitamente "ninguna embarcación de ningún
  tipo" — las exclusiones previas probablemente decían "sin barcos" y
  Recraft coló un "velero", que es una embarcación pero quizás no se leyó
  como sinónimo exacto.

---

## 5. Distribución de los 1,008 retos

Por tronco (una habilidad, en un bioma): **18 retos = 6 + 6 + 6**, uno por
cada una de las 3 mecánicas asignadas en §3.

Por habilidad, a través de los 4 biomas: cada mecánica necesita 24
combinaciones únicas (6 × 4), tomadas de la lista `parametros()` que la
plantilla YA genera — sin ampliar nada (§1). La partición en 4 bloques de 6
por bioma es una **decisión de curaduría, no un sorteo** (mismo principio
que `serie.ts` ya aplica: "un orden aleatorio no es variación, es ruido").

**Regla de partición recomendada:** ordenar la lista de `parametros()` por
su propio eje de variación (ej. K07 por diferencia entre montones, K10 por
tamaño del total) y tomar bloques consecutivos de 24, uno por mecánica; y
dentro de esos 24, los 4 sub-bloques de 6 para cada bioma en el mismo
orden — así Sabana ve los casos más simples de esa mecánica y Costa los
más complejos, en vez de una asignación arbitraria. Esto no es obligatorio
pero es consistente con cómo K10 ya declara su propio eje de variación en
el código.

```
Total: 14 habilidades × 4 biomas × 18 retos = 1,008
     = 14 habilidades × 4 biomas × (6+6+6 por 3 mecánicas)
     = 14 habilidades × 3 mecánicas × 24 combinaciones únicas
```

---

## 6. Implicación de ingeniería (revisada — mucho más barata que la versión anterior)

1. **13 mecánicas nuevas → 13 nuevas escenas/vistas de Phaser** (una por
   mecánica, reutilizada entre todas las habilidades que la usan — tap-to-pop
   se construye UNA vez y sirve a K01, K02, K03, K11, K12).
2. **28 pares (habilidad, mecánica nueva) → 28 funciones `generar()`
   nuevas y ligeras**, cada una reusando la `parametros()` YA ESCRITA de su
   habilidad — no hay que diseñar combinatoria nueva, solo envolver los
   mismos parámetros en el `formato` nuevo. Esto es sustancialmente más
   barato que "ampliar objetos en 6 plantillas", que era el plan anterior.
3. **`item.ts`** necesita que `Formato` acepte los 13 valores nuevos (mismo
   tipo de cambio que ya se hizo al agregar `arma_el_numero`/`cual_sobra`
   sobre los 3 originales de kinder).
4. **`construirArbol()`** sigue necesitando la agrupación por bioma de §2
   del documento anterior (secuencia reinicia por bioma, bloqueado
   encadena entre biomas) — eso no cambió.
5. **Arte nuevo por bioma:** el material del "tronco" de Desierto y Nieve
   (roca de arenisca, bloque de nieve) son assets nuevos; Costa necesita
   la sesión de Recraft completa con la especificación de §4.4.

---

## 7. Secuencia de trabajo recomendada

1. **Extender `Formato` en `item.ts`** con las 13 mecánicas nuevas — desbloquea todo lo demás.
2. **Construir las 2 mecánicas más reutilizadas primero:** tap-to-pop (5
   habilidades) y tap origen→destino (4 habilidades) — cubren 9 de los 28
   pares con solo 2 escenas de Phaser.
3. **Construir las 11 mecánicas restantes**, en el orden de cuántas
   habilidades cubren (§3, columna de reuso).
4. **Escribir los 28 `generar()` nuevos**, reusando cada `parametros()`
   existente — en paralelo con el punto 3, habilidad por habilidad.
5. **Extender `construirArbol()`** para agrupar por bioma.
6. **Generar el arte de Desierto/Nieve para el material del tronco**, y la
   sesión de Recraft de Costa con la especificación de §4.4.
7. **Curar los 1,008 retos** — elegir, por habilidad y mecánica, cuáles 24
   combinaciones de las ya existentes se usan y en qué orden por bioma
   (§5).

---

## 8. Lo que no se verificó

- **Nadie jugó una versión con 3 mecánicas por tronco.** Que 6 retos por
  mecánica se sienta como variedad real, y no como "la misma pregunta tres
  veces con más pasos", solo se confirma con niños reales.
- **El costo real de construir 13 escenas nuevas de Phaser** no se
  estimó en horas — sí se ordenó por cuánto reuso da cada una (§7).
- **Corrección sobre Costa:** el prompt de fondo y vegetación de Costa
  **ya existe, completo, en `gen-mapa-historia.mjs`** (con exclusiones de
  barcos/faro/gente) — la afirmación anterior de este documento ("3
  intentos fallidos, sin arte") venía de un comentario viejo en `story.ts`,
  no del script real. Lo que falta es solo CORRERLO: en disco no existe
  `fondo-costa-1.webp` ni `palmera.webp`/`roca-costa.webp`/`concha.webp`
  todavía (verificado con `ls`, 2026-08-09).
- **La regla de partición de §5** (ordenar por eje de variación y tomar
  bloques consecutivos) es una recomendación razonada, no algo ya
  implementado o probado.
- **De los 68 assets de mecánica, 9 ya se generaron y revisaron a ojo**
  (2026-08-10): 7 buenos (los 4 `ficha-conteo`, `blanco-movil-nieve`,
  `icono-pista-nieve`, `objeto-saltarin-nieve`), 2 fallidos y descartados
  (`marco-comparar`, `camino-guia` — ver más abajo, ahora se dibujan con
  Phaser en vez de Recraft). **Dos hallazgos reales de esta corrida:** (a)
  "counting token"/"pebble marker"/"a single bubble" hornearon un número
  con estrellas, una piedra con cara, y una escena completa con una rana
  antropomorfizada — el candado `NO_ESCENA` (nuevo, en el script) lo
  corrigió; (b) con ese candado, 65 de las 76 prompts originales pasaban el
  límite de 1000 caracteres de Recraft — ya recortadas, máximo real 975.
  Las 19 SFX y las 8 pistas de música siguen sin correr.
- **El `voice_id` de Kilowatto ya está confirmado**: `PB3qgWFhiD1nqaQ2qiEZ`,
  verificado contra `GET /v1/voices` de ElevenLabs (2026-08-09) — única voz
  de categoría "cloned" en la cuenta, escrito directo en
  `gen-voz-larry.mjs`. Ya no es un pendiente.
- **Las frases de Larry (§9.4) son un primer borrador en español, sin
  revisión humana todavía** — se escribieron ahora porque se pidió
  explícitamente no esperar a una sesión de autoría aparte, pero eso no
  sustituye la revisión de tono que `CLAUDE.md` exige antes de que suenen
  en producción, y no cubren los otros 6 locales.

---

## 9. Los assets — inventario completo y los 4 archivos ya escritos

### 9.1 Audio

| Tipo | Cantidad | Archivo | Estado |
|---|---|---|---|
| Números autorados (catálogo compartido) | 23 | `scripts/gen-voz-larry.mjs` (`NUMEROS`) | Texto listo, `voice_id` confirmado |
| Tips de error (causas existentes) | 15 | `scripts/gen-voz-larry.mjs` (`CAUSAS`) | Texto completo, listo |
| Acierto explicado (uno por habilidad) | 14 | `scripts/gen-voz-larry.mjs` (`ACIERTOS`) | Texto completo, listo |
| Enunciados nuevos (ejemplo, 4 de 28 pares) | 4 | `scripts/gen-voz-larry.mjs` (`ENUNCIADOS_NUEVOS`) | Ejemplo — 24 pares restantes se autoran después de que el dueño oiga estos 4 |
| SFX de mecánica (textura de interacción) | 19 | `scripts/gen-sfx.mjs` (`EFECTOS_MECANICA`) | Prompt listo |
| Música por bioma (4 × 2 ánimos) | 8 | `scripts/gen-musica-fondo.mjs` (`PISTAS`, reemplaza las 2 de D-198) | Prompt listo |

### 9.2 Visual

| Tipo | Cantidad | Archivo | Estado |
|---|---|---|---|
| Material de tronco nuevo (Desierto, Nieve) | 2 | `scripts/gen-mapa-historia.mjs` (`TRONCOS_BIOMA`) | Prompt listo, agregado a esta sesión |
| Fondo/vegetación de Costa | 4 (fondo+palmera+roca+concha) | `scripts/gen-mapa-historia.mjs` (`FONDOS`/`VEGETACION_COSTA`, ya existían) | Prompt listo desde antes de esta sesión — nunca corrido |
| Assets de mecánica × bioma (objetos del mundo) | 40 (10 piezas × 4 biomas) | `scripts/gen-mecanicas-historia.mjs` | **7 generados y aprobados**, 33 pendientes |
| Mecánicas de interfaz abstracta (9, sin variar por bioma) | 0 assets — se dibujan en código | `Phaser.GameObjects.Graphics` (pendiente de implementar): marco-comparar, camino-guia, zona-destino, indicador-pulso, contador-visual, icono-pista, efecto-fusion, punto-incremento, blanco-movil | 2 sacadas por 3 intentos fallidos cada una (espejo, aro de luz, pantalla — ver [[feedback_recraft-overfitting-fixes]]); las otras 7 nunca se intentaron en Recraft, se decidieron directo como interfaz (2026-08-10) |

### 9.3 Lo que sigue, en orden

1. Correr los 5 scripts (`gen-mapa-historia.mjs --forzar` para Costa/troncos,
   `gen-mecanicas-historia.mjs`, `gen-sfx.mjs`, `gen-musica-fondo.mjs`,
   `gen-voz-larry.mjs`) — nada más bloquea correrlos ya.
2. Revisión de oído/vista del dueño (D-080) — **obligatoria antes de
   commitear cualquier archivo generado**, mismo estándar que toda la
   demás arte/audio de este proyecto.
3. Autorar los 24 pares (habilidad×mecánica) restantes de enunciados
   nuevos, siguiendo el patrón de los 4 ejemplos ya aprobados.
4. Autorar las otras 6 voces (en, fr-FR, pt-BR, pt-PT, de-DE, es-ES si
   difiere) — sigue sin decidir, `docs/dudas.md` P-19/P-20.

---

## Fuentes

Código confirmado con cita `archivo:línea`: `packages/motor/src/banco-kinder.ts`
(conteos de las 14 habilidades), `item.ts` (`Formato`), `mapa.ts`
(`construirArbol()`), `apps/web/src/game/data/story.ts` (los 3 `WorldChapter`
existentes y sus assets ya generados: `cactus-b`, `roca-desierto`,
`pino-nevado`, `roca-nieve`, `cristal-hielo`, `tronco-a`/`tronco-b`).
Decisiones: D-190 (sin cambios). Investigación: `mc-06` (subitizing
perceptual, rangos por edad), `mc-05` (variación china, repaso espaciado),
`mc-20` (gestos táctiles seguros/inseguros para 3-6 años), más las dos
rondas de investigación de esta sesión sobre mecánicas de interacción
(TouchCounts, Teach Your Monster, Endless Numbers, y la literatura de
Hourcade/Baloian/NN/g sobre motricidad infantil).
