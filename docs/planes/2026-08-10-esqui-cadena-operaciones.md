# Esquí de cadena de operaciones — investigación y plantilla propuesta

> **Fecha:** 2026-08-10. **Esto no es contenido ni código: es el plan**, mismo
> patrón que el resto de `docs/planes/`. Se investigó con 4 agentes en
> paralelo (mecánica de referencia, mercado de juegos de matemáticas, base
> pedagógica cruzada con nuestra propia investigación, viabilidad técnica
> contra el motor real) antes de proponer nada.
>
> **El pedido original:** un avatar se desliza sin parar (inspirado en
> "Hamster Rescue" de Phaser Game Agent) y debe elegir entre 3 puertas, cada
> una con un resultado, pasando por la correcta a una operación —
> operaciones **encadenadas** (el resultado de una es el operando inicial de
> la siguiente), 12 en modo fácil / 60 en modo difícil, **un solo fallo
> descalifica y reinicia desde el principio**, desde PRIMARIA hasta PRO, y
> posiblemente KINDER en una versión simplificada con formas y voz de Larry.

---

## 1. El hallazgo que reordena todo el diseño

**"Descalificar y reiniciar desde cero" no es un detalle de dificultad — es
la mecánica que este mismo proyecto ya prohibió, con evidencia, en otro
documento.** No es una zona gris:

- **Línea roja #7 (`CLAUDE.md`): "Larry nunca avergüenza a un niño por
  equivocarse."** `mc-20` §10 lo hace literal: *"no red X, no buzzer, no
  fail language... la opción incorrecta se atenúa suavemente, nunca
  desaparece, y el niño puede intentar de nuevo en la MISMA pantalla"* — el
  opuesto exacto de expulsar al niño de la corrida entera por un fallo.
- **La versión "con formas geométricas, narrada por voz" no arregla esto.**
  El problema no es que haya números — es el castigo estructural del
  reinicio total. Cambiar el contenido no cambia la mecánica que lo rodea.
- **Tampoco hay respaldo en diseño de juegos en general, fuera de contexto
  educativo.** Un estudio de mecánicas de respawn (72 participantes) encontró
  que reiniciar LEJOS del punto de fallo es la variante con peor cociente
  motivación/frustración, salvo para un público autoseleccionado de reto
  extremo. *Celeste* —el ejemplo célebre de dificultad alta que SÍ funciona—
  se sostiene en reintento INMEDIATO en el punto exacto de la falla, no en
  perder todo el progreso.
- **Los productos educativos reales para niños evitan esto sistemáticamente.**
  Todo Math ni siquiera registra la respuesta incorrecta como fallo; Prodigy
  y Toon Math dejan seguir jugando. Los juegos que SÍ usan "choque = fin
  inmediato" (3x3 Runner, Math Runner) son de la tradición Subway
  Surfers/Temple Run — diseñados para reto de puntaje, no para aprender, y
  apuntan a 6-11 años, nunca a preescolar.

**Decisión del dueño (2026-08-10), viendo esta evidencia antes de
responder:** reinicio total, tal cual se propuso originalmente — no
checkpoints. La razón que dio, y que se anota porque cambia cómo se lee la
decisión: **el XP se declara desde el ANTES de empezar la corrida, y solo
se otorga completo si se termina la cadena entera** — es una apuesta de
todo o nada conocida de antemano, no un castigo oculto. No se borra la
evidencia de arriba: se anota que el dueño decidió en contra de ella a
sabiendas, mismo patrón que otras decisiones de este archivo (D-025 del
tablero por puntos en vez de θ es el precedente directo).

**Requisito nuevo, del propio dueño, que la investigación no había
cubierto:** cada intento — incluido cada reinicio tras un fallo — tiene que
generar una secuencia FRESCA de números/operaciones, a la MISMA dificultad,
nunca la misma secuencia repetida. Motivo explícito: evitar que memorizar
la cadena de un intento fallido sea una forma de "resolver" el siguiente
intento sin calcular de verdad.

**Tono del mensaje de fin:** Larry-safe en todas las bandas por defecto;
tono arcade dramático ("¡CHOCASTE!") permitido SOLO donde el modo ya es
opt-in de alto reto (SECUNDARIA+/PRO) — nunca en PRIMARIA.

**KINDER — rediseño confirmado, no descartado:** una versión sin cadena, sin
fallo, sin reinicio — el niño se desliza sin parar y avanza siempre, tocando
figuras; Larry cuenta los aciertos/errores y da el reporte con tono de
aliento y consejo ("se te fueron 3 figuras, la próxima ponle un poco más de
atención"), nunca con lenguaje de fracaso. Es un producto distinto al de
las bandas con cadena — comparte el motor visual (deslizamiento infinito,
3 carriles), no la mecánica de puntuación.

**Recomendación de banda mínima de la investigación original, para
contraste — no antes de PRIMARIA tardía (~9-11 años), y ahí como modo
opt-in.** El dueño ya decidió cruzarla para las bandas con cadena; sigue
como referencia de por qué era la recomendación por defecto — cita completa:
"defensible desde ~grado 6-7, siempre opt-in" (`mc-10`). **La versión CON
cadena/fallo queda descartada para KINDER no por falta de evidencia, sino
por evidencia directa en contra ya incorporada al proyecto — por eso la
versión rediseñada de arriba (sin cadena, sin fallo) es la única que aplica
a esa banda.**

### 1.1 El resto de las decisiones del dueño (25 preguntas interactivas, olas 2-6, 2026-08-10)

Todas se preguntaron con evidencia ya puesta sobre la mesa, en olas de 4, per
la convención de `CLAUDE.md`. Se agrupan por tema, no por ola:

**Progresión y dificultad**
- El XP también varía por la dificultad de las operaciones, no solo por la
  longitud de la cadena o la banda.
- Banda mínima confirmada para las bandas CON cadena: **PRIMARIA tardía,
  9-11 años**, y siempre opt-in.
- El modo opt-in también existe en **SECUNDARIA** (no solo PRO) — mismo
  patrón de opt-in, consistencia entre bandas.
- **El modo nunca arriesga la racha diaria** — perder una corrida de este
  modo no cuenta como día roto, sin excepción (línea roja #6).
- Dentro de UNA MISMA corrida la dificultad es **pareja** (no escala paso a
  paso) — la variación entre intentos viene de reiniciar con una secuencia
  fresca (§1), no de que la corrida se vuelva más difícil mientras avanza.
- El anti-trampa de "secuencia fresca por intento" (§1) se extiende: **el
  orden de los TIPOS de operación también cambia** entre intentos, no solo
  los números.
- Mezcla de tipos de operación: **homogénea al empezar una banda/nivel**
  (todo suma, o todo resta); **mixta solo en niveles ya dominados**.
- Se aceptan **decimales y fracciones** en niveles altos.
- **PRO/"nivel supremo" se define por lo que SÍ hacen los mejores
  calculistas humanos del mundo** (Mental Calculation World Cup: suma de
  10 dígitos, raíz cuadrada de 6 dígitos, cálculo de calendario) — **no**
  trigonometría/ecuaciones arbitrarias, que ningún humano resuelve de
  memoria fuera de un puñado de ángulos memorizados (§2.3 de la
  investigación original). El dueño pidió investigar esto explícitamente
  antes de decidir, y confirmó la recomendación tras ver el hallazgo.
- Número de puertas: **3 en niveles bajos, 4-5 en PRO/niveles altos**.

**Presentación**
- El avatar que se desliza es **el avatar cosmético/elegible del jugador**,
  no Larry — Larry acompaña y narra desde fuera, nunca es el personaje
  jugable.
- La estética **reusa/adapta los 4 biomas del Mundo Kinder multi-bioma**
  (Sabana/Desierto/Nieve/Costa), con una versión PRIMARIA+ de cada uno — no
  un quinto mundo visual dedicado. **Implicación de dependencia real: este
  modo no puede lanzarse antes de que el arte de bioma (§9 del plan de
  Mundo Kinder) avance lo suficiente para tener una variante PRIMARIA+.**
- Audio **dedicado**, estilo Angry Birds: música y SFX propios del modo
  (no reuso de `musica-energia`/`sfx-acierto`/`sfx-error`), más **voces de
  espectadores de fondo tipo olimpiadas** — el dueño pidió explícitamente
  que se vea "wow tipo Angry Bird", en pseudo-3D, 3D o incluso 2D si el
  acabado lo logra.
- Nombre del modo: **"Esquí" / "Deslizada"** — el dueño prefirió conservar
  la metáfora visual original sobre una alternativa más neutra ("Cadena"),
  a sabiendas de que el modo vive en los 4 biomas y no solo en nieve.

**Infraestructura y anti-trampa**
- **Autorizado**: el servidor precalcula la cadena completa al inicio de la
  corrida y la manda entera al cliente; el cliente juega y califica sin red
  hasta el final; el servidor verifica al terminar. Aislado de los demás
  modos — no toca `sesion.ts` ni Modo Historia (aclarado en vivo tras una
  pregunta de "qué significa esto" del dueño; ver §2.3).
- Verificación al terminar: **el servidor reconstruye la cadena completa
  con la misma semilla y valida que los tiempos totales sean razonables**
  (mismo espíritu que el anti-trampa tier 1-2 ya existente sobre tiempos de
  respuesta imposibles) — no solo "¿terminaste sí/no?".
- **Entra al tablero/liga competitiva** (consistente con D-025).

**KINDER (producto separado, sin cadena, sin fallo — confirmado en §1)**
- Duración de una corrida: **longitud fija** (ej. 12 figuras), nunca
  descalifica ni reinicia — consistente con que en kinder todo tiene un
  final declarado, nunca un modo infinito.
- El aliento/reporte de Larry se da **en tiempo real, sin detener el
  juego** — un globo de voz breve mientras el avatar sigue deslizándose,
  nunca una pantalla de resumen que interrumpa el ritmo
  ([[feedback_modo-historia-siempre-videojuego]]).
- El contenido **reusa las mecánicas/habilidades K01-K14 ya diseñadas**
  (conteo, comparar cantidad, etc.) donde aplique; las formas geométricas
  puras ("pasa por los triángulos") quedan como respaldo solo donde ninguna
  habilidad K01-K14 aplique — no es el diseño por defecto que se había
  sugerido originalmente.

---

## 2. Los otros tres hallazgos

### 2.1 El género sí existe — con precedente técnico y comercial real

- **"Hamster Rescue"** (Phaser Game Agent) no tiene documentación técnica
  pública — es un juego generado por IA desde un prompt de una línea, sin
  post-mortem. Se investigó el patrón general en su lugar.
- **Precedente técnico directo en Phaser:** "The Freaking Awesome Slalom"
  (2017) — esquí infinito, velocidad progresiva, puertas, control lateral
  simple. El patrón "endless runner" está exhaustivamente documentado
  (tutorial oficial de Phaser en 5 partes, Emanuele Feronato).
- **Precedente comercial de la mecánica exacta** (carriles + respuesta
  correcta): *Run with Math*, *Math Runner 3D: Trivia Runner*, *3x3 Runner*,
  *Toon Math*, *Run Math Runner*. Todas con preguntas **independientes**.
- **Precedente de operación encadenada, aunque no como "matemática formal":**
  *Last War: Number Gate Runner* y *Count Control Legends* — puertas que
  suman/restan/multiplican un contador que se acarrea entre puertas. Es el
  género viral "number merge runner" (TikTok), no un producto educativo,
  pero confirma que la mecánica de acarreo SÍ es técnicamente viable y
  jugada por millones.
- **La combinación exacta que pides (runner + carriles + cadena aritmética
  heterogénea con operaciones distintas por paso) no tiene precedente
  comercial verificado** — sería una combinación nueva, no una copia.

### 2.2 La base pedagógica de la cadena es más débil de lo que parece

La tradición con más respaldo real (soroban/anzan, `mc-39`) sí encadena
operaciones — pero el mecanismo validado es la **visualización de un ábaco
mental**, que reduce la carga de memoria de trabajo porque solo hay que
retener el estado de las cuentas, no cada número verbalmente. **La mecánica
propuesta no tiene ese soporte**: operaciones heterogéneas (suma, resta,
multiplicación, raíz mezcladas), sin técnica de descarga, bajo presión de
tiempo continua. Eso no es "flash anzan con más pasos" — es un dígito-span
creciente sin ayuda, exactamente el perfil de tarea donde `mc-10` documenta
que la ansiedad "roba" memoria de trabajo, y le pega más fuerte a quien
**más** memoria de trabajo tendría para gastar. No se encontró literatura
que evalúe cadenas heterogéneas como pedagógicamente distintas de ítems
independientes.

También choca con `mc-05` en un eje puntual: la cadena obliga a **bloquear**
(cada paso depende del resultado anterior), lo opuesto del intercalado que
duplica el desempeño a un día — aunque esto se puede mitigar intercalando
*cadenas completas* de habilidades distintas entre sesiones, no ítems dentro
de una misma cadena.

### 2.3 El motor actual no soporta esto tal cual, y no por descuido

- **HSHS no aplica.** La fórmula (`score = a·(d−RT)·(2·acc−1)`) asume un
  ítem, un reloj que arranca al servirlo, un viaje de red. Una cadena de 60
  decisiones con movimiento continuo comparte un solo "reloj" físico (la
  velocidad del avatar), no 60 relojes independientes. Peor: el "todo o
  nada" es un evento binario compuesto (Bernoulli en serie), no una suma de
  puntos por ítem — no hay fórmula en el §4.3 actual que modele eso.
- **`sesion.ts` RECHAZA explícitamente servir un segundo ítem mientras haya
  uno pendiente** ("serían dos relojes corriendo a la vez"). El contrato de
  hoy es un viaje de red por ítem (`?accion=siguiente` / `?accion=responder`).
  Someter 60 decisiones con movimiento continuo contra ese patrón, en Android
  de gama baja/4G lento (`mc-47` §5), produciría el jitter que un avatar que
  no se detiene no puede tolerar.
- **Ninguno de los 5 modos existentes** (Práctica, Fluidez, Problema, Duelo,
  Historia) define ni eliminación total ni movimiento continuo sin ítems
  discretos. Fluidez es la más cercana en *forma* (ítems fáciles,
  secuenciales, con reloj) pero su reloj es por ítem servido, no movimiento
  físico, y no tiene regla eliminatoria.
- **Conclusión:** esto es candidato a un **6º modo**, con dos piezas de
  infraestructura nuevas: (a) un modelo de puntuación/aprobación binario o
  por checkpoints, distinto de HSHS, y (b) un mecanismo de entrega de
  reto-completo-precalculado (mandar todo al inicio, calificar en el
  cliente, verificar después en el servidor) que hoy el motor no tiene y
  que el diseño actual de doble-sello-de-servidor activamente evita.

---

## 3. Receta técnica concreta (si se construye)

Confirmada contra el ecosistema real de Phaser, no inventada:

- **Pista infinita:** un `TileSprite` del ancho del canvas, `tilePosition.y`
  avanzando por frame — nunca escalar el sprite, solo el offset. El avatar
  se queda FIJO en X/Y; el mundo se mueve hacia él (patrón estándar de
  endless runner, evita recalcular cámara/parallax).
- **3 carriles = 3 posiciones fijas, no física de carriles.** El avatar
  tiene 3 coordenadas X destino; un swipe/tap/flecha dispara un tween corto
  (150-200ms) entre ellas — state machine de 3 posiciones, no colisión de
  cuerpos físicos entre carriles.
- **Puertas con object pooling** (`Physics.Arcade.Group`, dos grupos
  activo/inactivo) — nunca instanciar/destruir en tiempo real, crítico para
  Android de gama baja.
- **Perspectiva pseudo-3D barata:** lerp de escala + separación en X
  conforme la puerta "se acerca" (el truco clásico de raster-road, sin
  geometría 3D real). Existe un plugin dedicado (`TwoPointFive`) para
  perspectiva real si se quiere ese nivel de fidelidad — evaluar aparte, no
  es necesario para el efecto básico.
- **Velocidad progresiva** por acierto encadenado, mismo mecanismo que
  cualquier endless runner (aumenta urgencia sin tocar física real).

---

## 4. La plantilla propuesta (decisiones finales del dueño, tras 25 preguntas)

### 4.1 Bandas con cadena (PRIMARIA tardía en adelante)

| Eje | Decisión final | Por qué / fuente |
|---|---|---|
| Nombre | **Esquí / Deslizada** | 1.1, elección explícita del dueño sobre "Cadena" |
| Banda mínima | PRIMARIA tardía (9-11), opt-in | §1, `mc-10` |
| Opt-in también en | SECUNDARIA y PRO (no solo PRO) | 1.1 |
| Reinicio al fallar | **Total, desde cero — no checkpoints** | §1, decisión del dueño en contra de la evidencia de respawn, a sabiendas |
| XP | Declarado ANTES de empezar; todo o nada; varía por dificultad de operación y no solo por longitud/banda | §1, 1.1 |
| Secuencia por intento | Siempre fresca — números, operaciones Y su orden cambian en cada reinicio (anti-memorización) | §1, 1.1 |
| Racha diaria | Nunca se arriesga por este modo | 1.1, línea roja #6 |
| Dificultad dentro de una corrida | Pareja/plana, no escala paso a paso | 1.1 |
| Mezcla de operaciones | Homogénea al empezar una banda/nivel; mixta solo en niveles ya dominados | §2.2, 1.1 |
| Rango numérico | Acepta decimales y fracciones en niveles altos | 1.1 |
| Definición de PRO/"supremo" | Lo que hacen los mejores calculistas humanos (aritmética de números grandes) — NO trigonometría/ecuaciones | §2.3, 1.1 |
| Puertas | 3 en niveles bajos, 4-5 en PRO/niveles altos | 1.1 |
| Avatar | El avatar cosmético/elegible del jugador; Larry narra desde fuera, no es el personaje jugable | 1.1 |
| Estética | Reusa/adapta los 4 biomas del Mundo Kinder multi-bioma, versión PRIMARIA+ de cada uno — **depende de que ese arte avance primero** | 1.1 |
| Audio | Dedicado (música, SFX, voces de espectadores) — no reuso del audio de Modo Historia | 1.1 |
| Mensaje de fin | Neutral en bandas bajas/medias; tono arcade solo donde el modo ya es opt-in de alto reto (SECUNDARIA+/PRO) | Línea roja #7 |
| Modelo de puntuación | Nuevo, binario todo-o-nada con XP predeclarado — no HSHS | §2.3, 1.1 |
| Entrega de reto | Precalculado completo al inicio, calificado en cliente, verificado después en servidor (infraestructura nueva, autorizada) | §2.3, 1.1 |
| Verificación anti-trampa final | El servidor reconstruye la cadena completa con la misma semilla y valida tiempos totales razonables | 1.1 |
| Tablero/liga | Entra al tablero competitivo | 1.1, D-025 |
| Modo | 6º modo nuevo, no variante de Fluidez | §2.3 |

### 4.2 KINDER (producto separado — sin cadena, sin fallo, sin reinicio)

| Eje | Decisión final | Por qué / fuente |
|---|---|---|
| Mecánica | Avanza siempre, tocando figuras — nunca descalifica ni reinicia | §1, línea roja #7, `mc-20` §10 |
| Duración | Longitud fija (ej. 12 figuras) | 1.1 |
| Retroalimentación | Larry cuenta aciertos/errores y da un reporte con tono de aliento y consejo, EN TIEMPO REAL sin detener el juego | §1, 1.1, [[feedback_modo-historia-siempre-videojuego]] |
| Contenido | Reusa mecánicas/habilidades K01-K14 donde aplique; formas geométricas puras solo como respaldo | 1.1 |
| Puntuación | Solo accuracy, sin tiempo, sin castigo (D-024) | §1, D-024 |
| Relación con el modo de cadena | Comparte el motor visual (deslizamiento infinito, 3 carriles); no comparte mecánica de puntuación ni reglas | §1 |

---

## 4.3 Estado del proyecto: documentado, no en construcción

**Decisión de cierre del dueño (2026-08-10):** este modo **queda como plan
documentado**, no entra a construcción todavía — mismo patrón que la
resortera de PRIMARIA (F5d), que también quedó solo en diseño. Motivo: dos
dependencias reales sin resolver (§4.1 "Estética", §6): el arte PRIMARIA+
de los 4 biomas del Mundo Kinder y la infraestructura de
reto-completo-precalculado. Cuando esas dos piezas avancen, este documento
es el punto de partida — no hace falta volver a investigar ni volver a
preguntar lo ya decidido en §1.1.

---

## 5. Inventario detallado de assets, todos los idiomas (2026-08-11)

**Nota metodológica:** todo lo marcado "Hecho" en esta sección se verificó
en disco, en vivo — primero el 2026-08-11 (`ls`/`grep` sobre
`apps/web/public/`, `apps/web/src/i18n/`, `packages/motor/src/convenciones.ts`,
`packages/tutor/src/voz.ts`), luego actualizado el 2026-08-12 conforme se
ejecutó el plan de generación (D-202→D-206) — no se copió del inventario
del plan de Mundo Kinder ni se asumió nada.

**Resumen actualizado (2026-08-12): la mayor parte del inventario ya está
hecha.** 76/76 imágenes (64 sprites de avatar + 12 piezas de pista),
12/12 audios dedicados, 553/553 clips de voz (7 locales), texto de
interfaz en 7/7 locales. Todo generado con Nano Banana (Gemini 2.5 Flash
Image) donde Recraft falló repetidamente (D-204, D-205) y con ElevenLabs
para audio/voz (D-203). **Nada de esto pasó por revisión humana
completa** — imágenes sin mirar una por una, música/SFX sin escuchar
completos, y los 553 clips de voz con solo una muestra parcial (~15/79
de es-MX) confirmada por el dueño, el resto sin oír (D-080, pendiente).
Sigue sin conectarse a ninguna escena de Phaser — el modo sigue
"documentado, no en construcción" (§4.3). El wireo del manifest
(`IMAGENES_ESQUI_DESLIZADA`/`AUDIOS_ESQUI_DESLIZADA`/`VOZ_LARRY_ESQUI` en
`assets-manifest.ts`) está en disco pero sin comitear — ese archivo
mezcla este trabajo con el de otra sesión, y se acordó esperar a que esa
otra sesión comitee primero.

### 5.1 Visual

**Prioridad de plataforma (dictada por el dueño, 2026-08-11, aplica a todo
el producto, no solo a este modo): "PWA First, Mobile Second, Desktop
third, Desktop 4K fourth"** — se construye y entrega en ese orden, pero se
DISEÑA pensando hasta el último escalón desde el principio
([[feedback_prioridad-pwa-mobile-desktop-4k]]). Hallazgo que disparó esta
regla: todo el arte de Modo Historia hoy es vertical puro — los fondos se
generan en Recraft a `1024x2048` (1:2) y Phaser los estira a un mundo de
`720:2400` (`scripts/gen-mapa-historia.mjs:68-79`) — nunca se construyó ni
se probó una composición horizontal, en ningún modo, en toda la app. El
código (`main.ts`: `Phaser.Scale.RESIZE`, `width/height: "100%"`) sí es
agnóstico de proporción; el arte no. **Decisión para este modo: dos
composiciones de pista separadas por orientación (vertical y horizontal),
no un patrón tileable único** — dobla el conteo de cada fondo/pista.

| Pieza | Alcance | Estado | Nota |
|---|---|---|---|
| Fondo de pista ("placa"), vertical (celular/PWA) | Sabana, Desierto, Nieve, Costa (4) | **Hecho — 4/4** (`apps/web/public/esqui/esqui-placa-{bioma}-vertical.webp`) | Generadas 2026-08-12 con Nano Banana, no Recraft (D-205: Recraft insistía en dibujar un camino de tierra pese a 4 rondas de negativos con Recraft). Costa necesitó un segundo prompt explícito mencionando el agua — la paleta heredada de `gen-mapa-historia.mjs` solo trae el verde del pasto. **Re-verificado 2026-08-12: las 4 versiones FINALES (ya generadas con Gemini, no las de Recraft) no tienen camino visible en ninguna** — un reporte anterior de "defecto aceptado en desierto" citaba una imagen vieja de antes del cambio de proveedor, corregido |
| Fondo de pista ("placa"), horizontal (desktop/4K) | Sabana, Desierto, Nieve, Costa (4) | **Hecho — 4/4** (`apps/web/public/esqui/esqui-placa-{bioma}-horizontal.webp`) — primera composición horizontal de todo el proyecto | Mismo hallazgo que la vertical (D-205). Usa `imageConfig.aspectRatio: "16:9"` de Gemini — sin ese parámetro, Gemini devuelve 1024×1024 sin importar lo que diga el prompt sobre "panorama" |
| Superficie de pista repetible (nieve/arena/pasto/agua-arena) | Sabana, Desierto, Nieve, Costa (4) | **Hecho — 4/4** (`apps/web/public/esqui/esqui-superficie-{bioma}.webp`) | No estaba en el inventario original de esta tabla — se agregó al ejecutar el plan (D-205 §0.3): la placa de fondo NUNCA se repite/scrollea, esta textura sí. Generada con Nano Banana tras 2 fallos de Recraft (paisaje completo en vez de patrón plano) |
| Vegetación/decoración lateral, vertical, recompuesta para pasar a los lados a velocidad | Los 4 biomas | No hecho | Las piezas sueltas del Mundo Kinder existen (28 piezas de mecánica + fondos), pero ninguna se recortó/compuso para este uso |
| Vegetación/decoración lateral, horizontal | Los 4 biomas | No hecho | Misma composición nueva que el fondo horizontal — se decide junto con él, no por separado |
| Marco de puerta (3 carriles en niveles bajos, 4-5 en PRO) | Genérico | No hecho | Sin precedente en el catálogo actual — pieza nueva |
| Glifo de número/operación dentro de la puerta | — | **No necesita arte nuevo** | Se dibuja como texto de Phaser (Raleway), no como imagen — ver 5.5 |
| Avatar del jugador — identidad/especie (16 opciones) | Global | Hecho, pero **no reusable en este modo** | `apps/web/src/lib/avatares-animal.ts`, arte real en `apps/web/public/avatares/avatar_*.{webp,avif}` (D-194) — son retratos de frente, hechos para la rejilla de "¿quién juega?"; decisión 2026-08-11: en este modo NINGUNA pantalla usa el retrato frontal, ni siquiera resultados — todo pasa a la vista trasera nueva. El retrato sigue vigente para su uso original (D-194), no se deprecó |
| Avatar del jugador — ciclo de deslizamiento, vista trasera 3/4 (sobre el hombro) | Las mismas 16 identidades, 4 cuadros cada una | **Hecho — 64/64 piezas** (`apps/web/public/esqui/esqui_avatar_*_{1..4}.webp`), pendiente revisión humana final (D-080), sin commitear | Generadas 2026-08-12 con Nano Banana (Gemini 2.5 Flash Image), no Recraft — D-204: Recraft falló dos veces, en dos estilos, la instrucción de "vista trasera" (una escena de esquí literal en vez de la grilla; luego un ciclo de carrera real pero de perfil). Nano Banana la resolvió a la primera. `scripts/gen-esqui-avatares.mjs`. El cambio de carril se resuelve con un tween de posición/inclinación en código sobre este MISMO ciclo — no hace falta un ciclo separado por carril |
| Efecto de choque/descalificación | Genérico, compartido entre los 16 avatares, 2 variantes de tono | No hecho — 2 piezas | Decisión 2026-08-11: efecto de partículas (nube de polvo / destello) que cubre al avatar en su pose base, NO arte de choque por especie — variante neutra (PRIMARIA tardía) y dramática (SECUNDARIA+/PRO, §1.1). Candidato claro a `Phaser.Graphics`/`ParticleEmitter` en código, mismo patrón que `EfectoFusion.ts` |
| Efecto de victoria | Genérico, compartido entre los 16 avatares | No hecho — 1 pieza | Confeti/destello al completar la cadena — mismo patrón de partículas en código, sin arte por especie |
| Larry acompañante (narra desde fuera, nunca juega) | Global | **Resuelto 2026-08-12: no hace falta arte nuevo** | Confirmado visualmente: `larry_idle_1` (saludando) y `larry_idle_2` (calma, sonrisa suave) sirven para narrar/acompañar y para el tono de aliento en descalificación; `larry_festejo` (brazos arriba) sirve para victoria. Las 3 piezas ya existen (`apps/web/public/mapa/`) |
| HUD (puertas superadas, velocidad, XP en juego) | Global | No hecho | Candidato a reusar el patrón de `ContadorVisual.ts` (arco de progreso dibujado en código, sin imagen) |
| Pantalla de resultado — victoria | Global, tono por banda | No hecho | — |
| Pantalla de resultado — descalificado | Global, tono por banda | No hecho | Bifurcado igual que la pose de choque |
| KINDER — figuras a tocar (triángulo, círculo, cuadrado...) | — | No hecho | Candidato claro a `Phaser.Graphics` (formas puras), no a Recraft — mismo patrón ya documentado para UI abstracta |

**Por qué las puertas, el HUD, los avatares y los efectos NO se duplican
por orientación** (a diferencia del fondo/pista): son piezas pequeñas,
posicionadas por código relativo a `this.scale.width/height` (mismo patrón
que `ContadorVisual.ts`/`BlancoMovil.ts`), no composiciones de escena
completa — el mismo sprite sirve en cualquier proporción porque el layout,
no el arte, es lo que cambia entre celular y 4K.

### 5.2 Audio dedicado (decisión 1.1: no reusa el audio de Modo Historia)

| Pieza | Alcance | Estado | Nota |
|---|---|---|---|
| Música tema por bioma, con escalado de intensidad | 4 biomas | **Hecho — 8/8** (`apps/web/public/esqui/musica-esqui-{bioma}-{calma,energia}.mp3`, ElevenLabs Music, 60s c/u) | Generada 2026-08-12, dedicada como pedía la decisión — no reusa las pistas de Mundo Kinder. Verificado: volumen real en las 8 (-16 a -22 dB), ninguna silenciosa. Revisión de OÍDO completa pendiente (D-080) |
| SFX puerta correcta | Global | **Hecho** (`sfx-esqui-acierto.mp3`, 0.6s) | Verificado: -21.3 dB, no silencioso |
| SFX puerta incorrecta / descalificación | Global | **Hecho** (`sfx-esqui-choque.mp3`, 0.68s) | Verificado: -18.3 dB. Pendiente de oído: que suene a tope suave, nunca a castigo (línea roja #7) |
| SFX victoria / meta | Global | **Hecho** (`sfx-esqui-victoria.mp3`, 1.48s) | Verificado: -21.2 dB |
| Voces de espectadores de fondo (ambiente tipo olimpiadas) | Global | **Hecho** (`sfx-esqui-publico.mp3`, 20s, sin palabras) | Se decidió loop ambiental sin palabras (no necesita variante por locale) — el intento a 20s funcionó a la primera, sin necesitar el candidato de respaldo a 15s/10s |

### 5.3 Voz de Larry (TTS), por los 7 locales

**Estado (2026-08-12, actualizado — D-203, D-206): Hecho, 7/7 locales,
553 clips.** Historia real, no idealizada: se redactaron y generaron
primero los 60 líneas de es-MX (79 clips tras dividir las que llevan
`{n}`); el dueño escuchó una **muestra parcial (~15 de 79)**, no el lote
completo, y confirmó que el tono estaba bien; con esa autorización se
adaptaron (no tradujeron literal) los otros 6 locales, verificados
programáticamente (mismas 60 claves, mismo orden, `{n}` siempre al final
de la frase); al generar el audio de esos 6, la primera corrida devolvió
**0 clips** por un bug real — `VOICE_ID_POR_LOCALE` en
`scripts/gen-esqui-voz.mjs` tenía los 6 comentados, dejados así por
precaución en la Fase A, antes de que D-203 autorizara generarlos —
corregido y reejecutado: 474 clips más, 0 errores. **Ninguno de los 553
clips fue escuchado por un humano en su totalidad** — todos siguen con
`revisadoPor: null` en `scripts/datos/guion-esqui.mjs`, pendiente de
revisión nativa (D-080) antes de que un niño los oiga.

| Línea | Banda | Variantes reales | Estado por los 7 locales |
|---|---|---|---|
| Instrucción de inicio | PRIMARIA tardía+ | 1 | **Hecho, 7/7** |
| Instrucción de inicio, versión formas/habilidad K | KINDER | 7 (una por habilidad + 1 de formas) | **Hecho, 7/7** |
| Aliento en tiempo real, sin detener el juego | KINDER | 10 | **Hecho, 7/7** |
| Reporte de cierre | KINDER | 8 (2 perfecto + 3 casi + 3 oportunidad) | **Hecho, 7/7** |
| Descalificación, tono Larry-safe | PRIMARIA tardía | 8 | **Hecho, 7/7** |
| Descalificación, tono arcade opt-in | SECUNDARIA+/PRO | 8 | **Hecho, 7/7** |
| Victoria / cadena completa | Todas las bandas con cadena | 6 | **Hecho, 7/7** |
| Cuenta atrás antes de arrancar | Todas | 4 (decidido: sí existe, autorado 2026-08-12) | **Hecho, 7/7** |
| Narración en vivo durante la cadena | PRIMARIA tardía+/SECUNDARIA/PRO | 8 (decidido: sí habla, siempre tono safe, sin `{n}`) | **Hecho, 7/7** |

### 5.4 Texto de interfaz (i18n), por los 7 locales

Verificado en vivo (`grep` sobre `apps/web/src/i18n/`, 2026-08-11): **ninguna
clave "esqui"/"deslizada"/"ski" existe hoy en ningún archivo de ningún
locale.**

| Cadena | Dónde viviría | Estado por los 7 locales |
|---|---|---|
| Nombre del modo ("Esquí"/"Deslizada") | `apps/web/src/i18n/esqui/{locale}.json` | **Hecho, 7/7** — solo es-MX es contenido autorado, los otros 6 son borrador pendiente de revisión nativa | Sub-namespace nuevo (2026-08-12), no en los 7 archivos top-level — mismo patrón que `i18n/reto/`/`i18n/voz/`. `astro check`: 0 errores |
| Copy de la pantalla de resultado (victoria/descalificado) | idem | **Hecho, 7/7** (mismo estado de revisión) | — |
| Entrada/etiqueta en el tablero competitivo | idem | **Hecho, 7/7** (mismo estado de revisión) | — |

### 5.5 Notación numérica y símbolos de operación

- **Ya hecho, y el modo DEBE reusarlo, no reinventarlo:**
  `packages/motor/src/convenciones.ts` ya define, para los 7 locales, el
  separador decimal (punto en en/es-MX, coma en los otros 5), el símbolo
  de división (÷ en la mayoría, `:` en fr-FR/pt-PT/de-DE) y el de
  multiplicación (× en casi todos, `·` en de-DE). Esto resuelve por
  adelantado el requisito de la ola 3 ("decimales y fracciones en niveles
  altos") sin escribir código nuevo de formato.
- **No varía por locale, no necesita arte por idioma:** los dígitos
  arábigos (0-9) y los glifos +/−/√ son universales — se dibujan como
  texto de Phaser con la tipografía Raleway del proyecto, nunca como
  imagen separada por locale.
- **Ya hecho, pero su uso en este modo no está decidido:** el catálogo de
  números hablados por locale (`packages/tutor/src/voz.ts`), validado con
  una función que "falla cerrado" si falta alguno de los 7 — pero no se
  decidió si Larry debe leer cada número EN VOZ ALTA durante una corrida
  de este modo; podría ser demasiado lento a la velocidad de
  deslizamiento. Pendiente, no asumido.

---

## 6. Lo que no se verificó

- Nadie jugó "Hamster Rescue" directamente para inspeccionar su código — no
  hay documentación técnica pública, solo el patrón general del género.
- El plugin `TwoPointFive` (perspectiva 3D real) no se evaluó a fondo — se
  encontró que existe, no se probó.
- Ningún prototipo se construyó — todo lo de arriba es investigación y
  propuesta, no código.
- El dueño decidió reinicio total en contra de la recomendación de
  checkpoints que sostenía la literatura de respawn (§1) — no se validó con
  jugadores reales si el XP-todo-o-nada predeclarado compensa la
  frustración que esa misma literatura documenta.
- No se construyó ni se dimensionó la pieza de infraestructura de
  "reto-completo-precalculado + verificación posterior" — está autorizada
  (1.1) pero es trabajo de ingeniería nuevo, no estimado en tiempo/esfuerzo.
- La dependencia con el Mundo Kinder multi-bioma (arte PRIMARIA+ de los 4
  biomas) no tiene fecha — este modo no puede empezar a construirse en
  serio hasta que ese trabajo avance.
- No se decidió si esto se construye ya o queda como plan documentado hasta
  que el motor de Mundo Kinder y la infraestructura de red nueva avancen
  más — mismo patrón que la resortera de PRIMARIA (F5d), que quedó solo en
  diseño.

---

## Fuentes

Investigación interna citada: `mc-05`, `mc-10`, `mc-20`, `mc-39`, `mc-47` §5
(todas en `docs/research/`). Código confirmado con cita `archivo:línea`:
`docs/master-plan.md` §4.2-4.3, `packages/motor/src/sesion.ts`,
`packages/motor/src/serie.ts`, `apps/web/src/pages/api/jugar.ts`,
`packages/motor/src/historia.ts`. Externas (URLs completas en los 4
reportes de investigación que produjeron este documento, no repetidas aquí):
Phaser endless runner tutorial oficial, Emanuele Feronato, "The Freaking
Awesome Slalom", Math Runner / Math Runner 3D / 3x3 Runner / Toon Math /
Run with Math / Last War: Number Gate Runner (tiendas de apps), "Numbers
Chain" (moadly.app), estudio de mecánicas de respawn, análisis de diseño de
*Celeste*, Todo Math / Prodigy Math (Common Sense Media, reseñas).
