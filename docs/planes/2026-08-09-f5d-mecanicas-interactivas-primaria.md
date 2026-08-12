# F5d · Plantillas interactivas de PRIMARIA — plan

> **Fecha:** 2026-08-09. **Método:** 4 agentes de investigación en paralelo
> (mecánicas técnicas de Phaser, game feel/audio/frases motivadoras,
> plantillas pedagógicas cruzadas con la investigación interna, auditoría del
> motor y las ocho líneas) + 8 preguntas al dueño en dos olas, todas
> contestadas. **Esto no es contenido ni código: es el plan**, mismo patrón
> que [`2026-08-02-f5c-contenido-primaria.md`](2026-08-02-f5c-contenido-primaria.md),
> que es exactamente lo que este documento extiende.
>
> **Lo que dispara este plan.** El dueño pidió retos de PRIMARIA con
> mecánicas de juego casual (arrastrar, resortera, selección rápida,
> apilar/ordenar, rompecabezas, clasificar figuras, match-3), con animación,
> efectos de audio/gráficos y frases motivadoras, referenciando Angry Birds,
> Plants vs Zombies, Candy Crush, Township, Royal Kingdom y juegos de "sort"
> (Nuts Sort/Magic Sort/Block Out) — con al menos 18 plantillas para retos
> ilimitados. A mitad de la investigación agregó el requisito que reordena
> todo lo demás: **la generación tiene que ser sostenible sin repetirse**, y
> preguntó explícitamente qué tan preconstruido debe estar Modo Historia
> contra Modo Retos.

---

## 1. Las 8 decisiones del dueño

| # | Pregunta | Decisión | Por qué importa |
|---|---|---|---|
| 1 | ¿Cerrar el hueco de "no repetido" real de la sesión antes de sembrar contenido nuevo? | **Cerrarlo primero** | Es deuda ya declarada en el código (`jugar.ts:661-673`). Sembrar 22 plantillas más encima la hace más visible, no la resuelve. |
| 2 | Alcance de "no se repite" en retos diarios — **revisado tras leer el DO real**: "sesión" en este código es UN reto (~6-10 ítems, `retoSesionId` nuevo cada vez), no "todo lo que el niño jugó hoy". Un niño con dos retos el mismo día tendría memoria cero entre uno y otro con la opción barata | **Por día completo, todos los retos** | Garantía más fuerte y más fácil de explicar ("hoy no repites nada"), pero **no es una extensión del Durable Object `SesionReto` que ya existe** — ese objeto vive por reto y se descarta. Hace falta algo que sobreviva a varios retos: otro DO por día o una fila en D1 con los itemIds vistos hoy. Infraestructura nueva, no una extensión (§2.3). |
| 3 | Qué es "dificultad" en una mecánica espacial (resortera, ángulo, área libre) | **Dos ejes separados**: la cuenta la ajusta el motor adaptativo de siempre (IRT); el ancho del blanco/tolerancia motriz es un parámetro de diseño fijo por nivel, **el motor adaptativo no lo toca** | Evita que el motor "corrija" la dificultad moviendo el blanco en vez de cambiar la cuenta — un efecto no pedido y no medido. |
| 4 | ¿Dónde debutan las mecánicas nuevas? | **Ambos modos desde el lanzamiento** (Historia y Retos) | Contradice mi recomendación de fasear (Retos primero); el dueño prefiere consistencia de lanzamiento sobre reducir riesgo de curar con mecánica sin probar. Implica que la curaduría de Historia y la siembra de Retos son trabajo **paralelo**, no secuencial. |
| 5 | Motor de física para la resortera | **Matter.js con constraint de cuerda** | Física más "real" tipo Angry Birds. El dueño elige fidelidad sobre el ahorro de CPU/batería que recomendaba Arcade Physics — la medición real en Android de gama baja (pendiente, D-184) es la que va a decir si esto se sostiene. |
| 6 | ¿Generalizar el esquema de ítem ahora? | **Sí, ahora, para todo el lote** | El lote completo de ≥18 nace parejo. Es el trabajo de esquema más grande de este plan (§3.1). |
| 7 | Plantilla "Problemas en Viñetas" (la más cercana a la línea roja #3) | **Incluirla, 100% toques/arrastres de iconos** | Sin ninguna caja de texto, nunca. Es la plantilla que exige la revisión más cuidadosa antes de aprobar su implementación real. |
| 8 | Plantilla "Origami de Larry" (la más cara de construir) | **Incluirla de todos modos** | El dueño acepta el costo de ingeniería porque cubre visualización espacial 3D que ninguna otra plantilla del lote cubre. |

---

## 2. Arquitectura confirmada: se reutiliza, no se reinventa

La pregunta de fondo del dueño — *"cómo generamos infinitos retos sin que se repitan, y por qué Historia es distinto"* — **ya tiene una respuesta construida y en producción** para las 4 plantillas de PRIMARIA que ya existen (P01-P04, `2026-08-02-f5c-contenido-primaria.md`). No hay que inventar el patrón, hay que extenderlo.

### 2.1 El pipeline plantilla → banco → selección

```
PlantillaPrimaria.parametros()          →  TODAS las combinaciones válidas
  (packages/motor/src/banco-primaria.ts)    (miles por plantilla, no 20 a mano)
        ↓
generarBancoPrimaria()                  →  Item[] concretos, validados
  (banco-primaria.ts:636)                   (revienta aquí si algo sale mal formado)
        ↓
scripts/sembrar-banco-primaria.mjs      →  siembra en D1 `item_bank`
  (D-072)                                   INSERT OR IGNORE: una fila corregida
                                             a mano por un humano no se pisa
        ↓
elegirSiguiente()                       →  UN ítem, por request
  (packages/motor/src/adaptativo.ts:397)    · filtra `yaVistos`
                                             · se queda con los que caen en la
                                               ventana de dificultad IRT del niño
                                             · sortea entre los 3-5 MÁS CERCANOS,
                                               nunca uniforme sobre todo el banco
```

**Por qué el banco vive en D1 y no en código (D-072):** para que un ítem mal
escrito se corrija sin desplegar. Cualquier plantilla nueva de este plan debe
seguir sembrándose por el mismo camino — código nuevo en `banco-primaria.ts`
(o un archivo hermano), nunca generación en vivo dentro de la escena Phaser.

**Por qué el sorteo no es aleatorio uniforme:** `serie.ts:18-20` ya lo dice
para el intercalado y aplica igual aquí — *"un orden aleatorio no es
variación: es ruido que a veces parece variación"*. `elegirSiguiente()`
sortea solo entre candidatos ya filtrados por apropiados (ventana de
dificultad), nunca sobre el banco entero. Esto es lo que hace que "infinitos
retos" no se sienta como "retos al azar".

**La prueba de que el combinatorio ya funciona, re-ejecutada, no estimada:**

```
$ node -e "import('./packages/motor/src/banco-primaria.ts').then(m => {
    for (const p of m.PLANTILLAS_PRIMARIA) console.log(p.habilidad, p.parametros().length);
    console.log('TOTAL', m.generarBancoPrimaria().length);
  })"
P01 814
P02 378
P03 238
P04 404
TOTAL 1834
```

**1,834 ítems distintos salen de 650 líneas de código** (`banco-primaria.ts`
completo), escritas una vez por un humano — nadie escribió los 1,834 a mano.
Cada `parametros()` es un `for` sobre rangos válidos; la combinatoria hace el
resto. Esto es lo que "acercarse a ilimitado sin que nadie lo programe" ya
significa en este motor: el volumen es gratis, y lo que sigue costando
trabajo humano es el diseño de la plantilla (los rangos válidos y,
sobre todo, qué distractores son errores reales — `mc-36`/`mc-40`), no la
cantidad de ítems que produce. Con las 22 plantillas de este plan, el banco
de PRIMARIA puede pasar de ~1,800 a varias decenas de miles sin que nadie
autore un ítem individual.

### 2.2 Historia es curaduría fija, confirmado por código, no por intuición

[`historia.ts`](../../packages/motor/src/historia.ts) obliga tres fases
(exploración → práctica → síntesis) que **no se pueden saltar** —
`avanzar()` lanza si se intenta saltar la síntesis— y usa solo
`metodoId`/`ideaId` autorados por un adulto, nunca texto ni selección al
azar. Es exactamente la misma filosofía que los 2,500 retos curados de
kinder: la serie es la unidad de diseño, no la pregunta suelta.

Con la decisión #4 (ambos modos desde el lanzamiento), esto significa: **cada
plantilla nueva necesita, en paralelo, (a) su `parametros()` para alimentar
Retos vía `elegirSiguiente()`, y (b) un conjunto de instancias congeladas y
elegidas a mano para los lugares de la Sabana que la usen en Historia.** No
es la misma pieza de contenido reutilizada dos veces — es dos productos del
mismo generador.

### 2.3 El hueco que hay que cerrar primero (decisión #1) — más grande de lo que el comentario del código sugiere

[`jugar.ts:661-673`](../../apps/web/src/pages/api/jugar.ts) dice que la
garantía fuerte vive en `math-challenge-sesion-reto-do`, que F3 ya construyó
y que este endpoint todavía no abre. **Al leer ese objeto
(`apps/ingest/src/sesion-do.ts` + `packages/motor/src/sesion.ts`), el
comentario se queda corto**: `SesionReto` existe, pero su estado
(`EstadoSesion`) no guarda ningún historial de ítems servidos —
`pendiente: ItemServido | null` se sobrescribe con cada ítem y se borra al
contestar; `puntuadas: Map<number, ResultadoDeRespuesta>` indexa por número
de turno, no por `itemId`. El objeto está diseñado para idempotencia (no
puntuar dos veces la misma respuesta) y para el punto seguro de corte del
límite de pantalla — no para memoria de qué se ha visto. Conectarlo tal cual
no resolvería nada; primero hay que darle esa memoria.

**Y la decisión #2 (revisada) lo hace más grande todavía.** Una "sesión" en
este código es **un reto** (~6-10 ítems; `retoSesionId` se genera nuevo cada
vez que se abre uno) — no "todo lo que el niño jugó hoy". Con la garantía
por-día que el dueño eligió, el objeto por-reto que ya existe no alcanza ni
extendido: hace falta algo que sobreviva a varios retos en el mismo día.

**Decisión tomada: D1, no un Durable Object nuevo.** `SesionReto` es DO
porque necesita serialización de un solo hilo — dos respuestas simultáneas
no deben poder puntuar dos veces, y eso es una carrera real. "Qué ítems ya
vio hoy" no tiene esa carrera: es un registro de solo-agregar y una lectura
de filtro, sin read-modify-write crítico. Un DO por (niño, día) sería un
objeto activo más por cada niño cada día sin comprar ninguna garantía que
D1 no dé ya — más caro, no más seguro.

**Trabajo de este punto, en dos piezas:**

1. **Tabla nueva en D1**, reusando `DiaLocal`/`diaEfectivo()` que ya existe
   en `packages/motor/src/tiempo-local.ts` (el mismo cálculo que usa la
   racha para el corte nocturno, D-016) — así el "día" de esta tabla es el
   mismo día que ya rige el resto del producto, no un concepto nuevo:

   ```sql
   CREATE TABLE items_vistos_hoy (
     child_profile_id TEXT NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
     item_id          TEXT NOT NULL,
     dia_local        TEXT NOT NULL,   -- DiaLocal, mismo formato que recordatorio.ts
     servido_en       INTEGER NOT NULL,
     PRIMARY KEY (child_profile_id, item_id, dia_local)
   );
   ```

   Escritura: `INSERT OR IGNORE` cada vez que `/api/jugar.ts` sirve un
   ítem — el mismo patrón de `item_bank` (D-072), aquí para no duplicar la
   fila si el cliente reintenta. Limpieza: un borrado periódico de
   `dia_local` vencido; no es urgente porque el filtro por día ya la vuelve
   irrelevante al día siguiente, pero sin limpieza la tabla crece para
   siempre.
2. **`/api/jugar.ts` la consulta antes de llamar a `elegirSiguiente()`**:
   `SELECT item_id FROM items_vistos_hoy WHERE child_profile_id=? AND
   dia_local=?` para construir `evitar` con TODOS los itemIds del día, no
   solo el `ultimoItemId` que manda el cliente hoy.

Esto es más trabajo que "conectar un objeto que ya existe" — es diseñar y
construir la pieza de memoria por-día que hoy no existe en ninguna forma
(la migración, el `INSERT` en el flujo de servir, y la consulta en
`/api/jugar.ts`), no solo conectarla. Sigue siendo una migración nueva
(`migrations/00XX_items_vistos_hoy.sql`, numerada tras la 0027 actual) y una
línea en `docs/infrastructure.md` — la tabla vive dentro de
`math-challenge-db`, no es un recurso de Cloudflare nuevo, así que no
necesita su propio prefijo.

---

## 3. Lo que hay que construir de nuevo

### 3.1 Esquema de ítem generalizado (decisión #6)

Hoy `item.ts` asume respuesta discreta: `respuesta.valor: number | string`,
comparada por igualdad (`calificarRespuesta`, `item.ts:217-239`), y cada
opción necesita un glifo dibujable (`OpcionDibujada`, `item.ts:76-97`). Las
plantillas de resortera, ángulo y área libre necesitan una respuesta
**continua o posicional** (dónde cayó el proyectil, qué ángulo se formó, qué
área se pintó), con tolerancia geométrica, no igualdad exacta.

**Extensión necesaria** (para todo el lote, decisión #6):

1. Un tipo de respuesta nuevo — zona/rango con tolerancia — junto al
   `valor: number | string` existente, no en su lugar: las 5 plantillas ya
   existentes y la mayoría de las 22 nuevas (arrastrar-a-zona, tocar,
   apilar, match-3, clasificar) siguen siendo discretas y no deben tocarse.
2. `errores` debe poder mapear **rangos** a causas (ej.: "cayó 15-25%
   corto" → `error.p.subestimo_la_fuerza`), no solo valores exactos.
3. El parámetro motriz fijo de la decisión #3 (ancho del blanco, tolerancia
   de ángulo) vive en el ítem, junto al nivel, pero **fuera** de lo que
   `elegirSiguiente()` lee como `dificultad` — los dos ejes de la decisión
   #3 tienen que ser dos campos distintos, no uno.
4. `item_bank` en D1 necesita las columnas nuevas correspondientes — el
   mismo patrón de dos sitios que ya usa `TECHO_POR_HABILIDAD`
   (`banco-primaria.ts:70`, declarado en código y hecho cumplir en la
   lectura).

### 3.2 Motor de física: Matter.js para la resortera (decisión #5)

Confirmado por la investigación técnica: **ningún motor de física está
inicializado hoy en Phaser** (`apps/web/src/game/main.ts:37-51` construye
`Phaser.Game` sin clave `physics:`). Agregar Matter.js es la primera vez que
este juego carga un motor de física real.

- Constraint de distancia (cuerda) entre el ancla del resorte y el
  proyectil, liberado al soltar el puntero con `Matter.Body.setVelocity`
  proporcional al vector de estiramiento — patrón del tutorial oficial de
  Phaser ["Make a Rope or Swing using Matter Physics"](https://phaser.io/news/2019/07/make-a-rope-or-swing-using-matter-physics).
- **Costo real, no medido todavía:** el consenso de la comunidad Phaser es
  que Matter.js maneja 50-100 cuerpos a 60fps contra 100+ de Arcade — para
  UN proyectil en pantalla el costo es bajo, pero la medición de FPS real en
  Android de gama baja que `D-184` ya dejó pendiente sigue pendiente, y esta
  decisión la hace más urgente: si Matter.js no rinde en el dispositivo de
  referencia, hay que revisar la decisión #5, no forzarla.
- Todo lo demás del lote (drag-and-drop, apilar, match-3, clasificar) **no
  necesita física** — se implementa con `scene.tweens` puros, más barato y
  suficiente (confirmado por la investigación técnica).

### 3.3 Game feel: animación, partículas, cámara, audio

Técnicas concretas, ya investigadas y listas para implementar (no requieren
decisión del dueño, son ejecución):

| Efecto | Técnica en Phaser 3 |
|---|---|
| Squash & stretch al impacto/acierto | `tweens.add({scaleX, scaleY, yoyo:true, ease:'Elastic.easeOut'})` |
| "Pop" de acierto | Escalado exagerado con overshoot (`ease:'Back.out'`) |
| Impacto/combo | `ParticleEmitter` (API moderna, Phaser 3.60+) |
| Sacudida de cámara | `camera.shake(200, 0.01)` |
| Destello de acierto grande | `camera.flash(150, 255,255,255)` |
| Capas de audio sin fatiga | Pool de 3-4 variantes de SFX + `detune`/`volume` aleatorios por reproducción, nunca el mismo archivo repetido |
| Combos escalados (estilo Candy Crush) | Etiquetas por umbral de racha, cada una con su propio stinger |

**Frases motivadoras — regla dura ya existente, reforzada por la
investigación:** elogio **específico** del proceso ("resolviste la resta
llevando bien la decena"), nunca genérico ("¡buen trabajo!") — Corpus &
Lepper, confirmado por el A/B de Duolingo (+7.2% retorno día-14). El error se
muestra sin alarma (nunca buzzer, nunca X roja agresiva), consistente con la
línea roja #7 (Larry nunca avergüenza).

### 3.4 Render en Phaser: qué falta

`GameplayScene.ts` hoy solo pinta `toca_la_respuesta` — es "100% ese formato"
por decisión explícita (documentado en el propio archivo, D-185). Cada
mecánica nueva necesita su propio render en Phaser (no hay switch
formato→render genérico hoy; `Pantalla.astro:994-1044` en HTML sí tiene un
switch hard-coded de 5 casos, que tampoco generaliza sin tocarlo).

---

## 4. Las 22 plantillas

Todas incluidas (decisiones #7 y #8: ninguna se descartó). Códigos nuevos
`P05`-`P26`, continuando `HABILIDADES_PRIMARIA` de `banco-primaria.ts`.

| Código | Nombre | Mecánica | Habilidad / nivel | Cita principal | Riesgo declarado |
|---|---|---|---|---|---|
| P05 | Cazador de Sumas | Resortera/disparo | Suma/resta ≤100, N3-N4 | `mc-05` (recuperación con feedback) | Un solo disparo por ítem — con varios se vuelve adivinable por descarte |
| P06 | Cinta de Ensamblaje | Apilar/ordenar | Ordenar números/valor posicional, N3 | `mc-15` B2-B3 | Con pocos dígitos se resuelve por heurística visual, no por valor posicional |
| P07 | Modelo de Barras interactivo | Arrastrar (widget dedicado) | Problemas verbales, N4-N6 | `mc-03` (8 pasos del modelo de barras) | La pieza más compleja del lote; necesita andamiaje por tier, no libre desde N4 |
| P08 | Tangram del Rinoceronte | Rompecabezas | Composición/descomposición, N3-N5 | `mc-09` | Se resuelve por ensayo-error visual; no confundir con demostrar comprensión en N5+ |
| P09 | Clasifica las Figuras | Clasificar | Propiedades de figuras, N3-N4 | `mc-09` Van Hiele Nivel 1 | Con 2-3 cajas se adivina por descarte (33-50%); usar ≥4 categorías |
| P10 | Espejo Mágico | Selección rápida | Simetría, N3 | `mc-09` (paradigma validado no-verbal) | Bajo — el más validado de los 22 |
| P11 | Cazafantasmas de Fracciones | Disparo bajo tiempo | Fracciones en recta numérica, N4-N6 | `mc-07` (recta > área para fracciones) | Combinar tiempo + fracciones empeora el sesgo de número entero — reloj estrictamente opcional |
| P12 | Torre de Fracciones | Apilar/ordenar | Ordenar fracciones, N4-N5 | `mc-03` + `mc-07` | Barras a escala pixel-perfecta permiten ordenar por longitud visual sin calcular — usar proporción aproximada |
| P13 | Match de Multiplicación | Match-3 | Tablas de multiplicar, N4-N6 | Propuesta razonada (sin cita directa a match-3 matemático) | Piel visual no debe correlacionar con el valor, o se empareja sin calcular |
| P14 | Reparto Justo | Arrastrar | División como reparto, N3-N4 | `mc-07` (reparto informal antes de división formal) | Repartir uno por uno sin calcular debe migrar a abstracto en N5 |
| P15 | Cazador de Perímetros | Selección rápida en cuadrícula | Perímetro, N4-N5 | `mc-09` | Contar bordes sin ligarlo a la fórmula L×W — forzar el paso en N5 |
| P16 | Explorador de Área | Arrastrar/pintar | Área en cuadrícula, N4-N6 | `mc-09` | Tolerancia de cuadritos parciales sin resolver — calibrar con cuidado |
| P17 | Rueda de la Comparación | Selección rápida bajo tiempo | Mayor/menor/igual, N3-N6 | `mc-07` (instrumento diagnóstico de Steinle & Stacey) | Con 2 opciones el azar es 50% — usar ≥3 opciones |
| P18 | Fila de Secuencias | Arrastrar para completar | Patrones numéricos, N3-N5 | `mc-15` (razonamiento de patrones temprano) | Distractores deben ajustar a una regla incorrecta plausible, no solo "crece" |
| P19 | Balanza Numérica | Arrastrar | Number bonds / igualdad, N3-N4 | `mc-03` + `mc-15` | Pocas combinaciones se resuelven por fuerza bruta sin calcular |
| P20 | Constructor de Valor Posicional | Arrastrar | Bloques base diez, N3-N4 | `mc-03` (bloques de base diez, etapa Concreta) | Exigir paso de traducción a número escrito, o sustituye la comprensión real |
| P21 | Rescate del Ángulo | Arrastrar/rotar | Ángulos, N5-N6 | `mc-09` (protractor arrastrable con tolerancia) | Precisión motriz fina difícil a los 7-8 años — tolerancia debe escalar por edad |
| P22 | **Problemas en Viñetas** | Arrastrar (piezas de modelo de barra/operación) | Problemas verbales de 1-2 pasos, N4-N6 | `mc-03` | **Más cercana a la línea roja #3** — 100% toques/arrastres de iconos, decisión #7, nunca caja de texto |
| P23 | Cadena de Restas | Apilar/ordenar o disparo | Resta con reagrupación en pasos, N4-N5 | Propuesta razonada (`mc-05`, mezclar operaciones) | Limitar a 3-4 eslabones — cadenas largas alargan la sesión más de lo que `mc-21` recomienda |
| P24 | Diana de Clasificación Decimal | Clasificar (arrastrar a urna) | Decimales/fracciones por rango, N5-N6 | `mc-07` (taxonomía de Steinle & Stacey) | Pocas urnas → adivinable; usar suficientes decimales distintos |
| P25 | **Origami de Larry** | Rompecabezas (plegado simulado) | Visualización espacial, N5-N6 | `mc-09` (origami explícitamente recomendado) | **Mayor costo de ingeniería del lote** — decisión #8: incluida de todos modos |
| P26 | Recetario de Larry | Arrastrar/deslizador discreto | Razón y proporción, N6 | `mc-07` (Lamon/Tourniaire — error aditivo vs multiplicativo) | Pasos discretos obligatorios; un slider continuo permite acercarse por prueba visual sin razonar |

**Nota de honestidad de la investigación (no es mía, viene del propio
informe):** la asociación mecánica-de-juego ↔ habilidad matemática
específica no viene de un estudio que probara esa mecánica exacta —
es una aplicación razonada de formatos ya validados (recta numérica,
clasificación, arrastre invariante, recuperación con retroalimentación)
sobre una piel de juego casual.

**Riesgo transversal en todo el lote:** cualquier mecánica de "toca/clasifica
entre pocas opciones" tiene un piso de acierto por azar no trivial (33-50%
con 2-3 opciones). Bajo HSHS, un acierto por azar rápido puntúa alto — usar
≥4 opciones o distractores calibrados donde la mecánica lo permita. Y por
línea roja #8: todo arrastre/apilado debe permitir reposicionar antes de
confirmar, nunca calificar al primer toque.

---

## 5. Secuencia de trabajo recomendada

Por orden de qué le impide a lo siguiente ser verdad, no por número de
plantilla:

1. **Construir la tabla `items_vistos_hoy` en D1 y conectarla** (§2.3,
   decisiones #1 y #2, mecanismo ya decidido) — antes de sembrar nada
   nuevo, para que toda plantilla nazca con la garantía real. Es una
   migración nueva, el `INSERT` en el flujo de servir, y la consulta en
   `/api/jugar.ts` antes de llamar a `elegirSiguiente()`. Es el ítem de
   mayor incertidumbre de tamaño de todo el plan (§6).
2. **Generalizar el esquema de ítem** (§3.1, decisión #6) — bloquea a P05,
   P21, P16 y a cualquier plantilla con respuesta continua/posicional.
3. **Medir FPS real de Matter.js en Android de gama baja** — antes de
   construir P05/P11 con esa base; si no rinde, la decisión #5 se revisita
   con datos, no se fuerza.
4. **Construir las plantillas discretas primero** (P06, P09, P10, P13, P14,
   P17-P20, P22-P24, P26) — no dependen de #2 ni #3, siguen exactamente el
   patrón de `banco-primaria.ts` que ya existe y ya está probado.
5. **Construir las plantillas con esquema nuevo** (P05, P08, P11, P12, P15,
   P16, P21, P25) — dependen de los pasos 2-3.
6. **Curar Historia en paralelo con cada plantilla** (decisión #4) — no al
   final: cada plantilla que se sella para Retos necesita, ese mismo ciclo,
   sus instancias congeladas para los lugares de la Sabana correspondientes.

---

## 6. Lo que no se verificó (y no se esconde)

- **No se midió el costo real de Matter.js en un dispositivo de gama baja.**
  Es la pieza de la decisión #5 con más incertidumbre; D-184 ya lo dejó
  pendiente antes de este plan.
- **El tamaño real de `items_vistos_hoy` no se estimó línea por línea.** El
  mecanismo ya está decidido (D1, §2.3, con el esquema y las consultas
  escritos), pero nadie escribió todavía la migración ni el código real de
  `/api/jugar.ts` que la llena y la consulta — falta medirlo cuando se
  construya, no antes.
- **Ninguna de las 22 plantillas tiene un prototipo jugado por un niño
  real.** El riesgo de adivinabilidad (opciones, lados predecibles) es el
  mismo tipo de defecto que ya se encontró y corrigió en K07 de kinder
  (`banco-kinder.ts:475-525`) — se documenta el riesgo por plantilla, no se
  asume resuelto.
- **La asociación mecánica↔habilidad es una propuesta razonada, no una
  mecánica probada en un estudio** (declarado explícitamente en §4). Once
  de las 22 no tienen cita externa directa a la mecánica de juego, solo al
  formato pedagógico subyacente.
- **El esquema de item_bank en D1 para las columnas nuevas (continuo/zona,
  tolerancia motriz) no se diseñó a nivel de migración SQL** — solo se
  identificó que hace falta.

---

## Fuentes

Investigación interna citada: `mc-02`, `mc-03`, `mc-05`, `mc-07`, `mc-09`,
`mc-11`, `mc-15`, `mc-21`, `mc-36`, `mc-40`, `mc-44`, `mc-47` (todas en
`docs/research/`). Código confirmado con cita `archivo:línea`:
`packages/motor/src/item.ts`, `serie.ts`, `adaptativo.ts`, `historia.ts`,
`programador.ts`, `banco-primaria.ts`; `apps/web/src/pages/api/jugar.ts`;
`apps/web/src/game/main.ts`, `ChallengeScene.ts`, `GameplayScene.ts`.
Investigación externa (URLs completas en los reportes de los 4 agentes que
produjeron este plan, no repetidas aquí para no duplicar): Phaser docs
oficiales, tutorial de rope/constraint de Matter.js, serie de match-3 de
Emanuele Feronato, "Juice it or Lose It" (GDC), literatura de elogio
específico vs. genérico (Corpus & Lepper), A/B de Duolingo sobre retención.
