# F7 · Juego — plan detallado

> Producido por 7 agentes de diseño en paralelo (uno por subsistema: XP y
> niveles, rachas con red de protección, misiones diarias, mapa de progreso y
> compañero, ligas de ~30, tablero global con alias, cosméticos ganados), cada
> uno con permiso de salir a internet donde la investigación interna del
> corpus no alcanzara, seguido de 5 críticos que revisaron los 7 diseños
> **juntos** — líneas rojas cruzadas entre subsistemas, idiomas y
> diferenciación por banda, auditabilidad/estructura, fidelidad de citas, y
> completitud contra `master-plan.md`/`decisions.md`.
>
> F7 no tenía ninguna issue de GitHub antes de este documento. Depende de F3
> (motor de reto, implementado) y F4 (motor adaptativo, todavía Todo — se
> asume su contrato de lectura, no su implementación).

## 0. Lo que la crítica cruzada encontró, y cómo se resolvió

Diseñar 7 subsistemas en paralelo, cada uno leyendo la misma documentación
pero sin verse entre sí, produjo el mismo tipo de colisión que ya se vio en F5
y F6 — con una diferencia: aquí la crítica corrió **antes** de abrir una sola
issue, no después.

**Hallazgo más grave, resuelto como D-055:** dos subsistemas (`xp-niveles` y
un primer borrador de `mapa-companero`) diseñaron XP de dos formas
incompatibles — un eje nuevo que nunca baja, o el mismo número que los puntos
del tablero (que sí pueden bajar y resetearse). Se adoptó la primera:
[D-055](../decisions.md#d-055-xp-es-un-eje-separado-de-los-puntos-del-tablero-nunca-el-mismo-número).

**Segundo hallazgo, resuelto como D-056:** tres cifras distintas de
ascenso/descenso de liga (10% de master-plan, sin verificar; 15-20%/10%
repetido de master-plan por un subsistema; 23.3%/16.7% investigado y
verificado en vivo contra el producto real de Duolingo por el subsistema de
Ligas). Se adoptaron las cifras reales, verificadas:
[D-056](../decisions.md#d-056-ligas-ascenso-233-730-descenso-167-530--las-cifras-reales-de-duolingo-no-el-10-sin-verificar-de-master-plan).

**Tercer hallazgo:** el primer borrador de `mapa-companero` no se quedó en su
carril — diseñó los siete temas de F7 a la vez, con menos rigor que los seis
documentos dedicados, y en varios puntos los contradijo con datos concretos
(cifras de liga, esquema de XP, mecanismo de racha, mecanismo de opt-in del
tablero — que ya existe desde F2/F3 y no necesitaba reinventarse). Se
reconcilió: `mapa-companero` cede por completo XP, rachas, misiones, ligas,
tablero y cosméticos a sus dueños dedicados, y se queda con lo que ningún otro
subsistema cubre — la definición del mapa en sí, la decisión Larry-vs-mascota,
y las tres vistas por banda de edad.

**Cuarto hallazgo, fuera del alcance de F7 pero descubierto diseñándolo:** un
bug real en código ya en producción — `calificar()` (`puntuacion.ts`) no pesa
por dificultad en las bandas cronometradas (PRIMARIA a Pro), rompiendo el
argumento central de D-025. Archivado como issue de F3, no de F7:
**#189**.

**Hallazgos menores** (citas mal atribuidas a la sección o el documento
equivocado, dos issues de una línea fusionadas en una tabla, un ítem de F2
que se había colado en el conteo de F7, dos migraciones de esquema
polimórfico repetidas de forma independiente por tres subsistemas): corregidos
directamente en las issues antes de crearlas, sin issue de reconciliación
aparte.

**Total de issues, tras la reconciliación:** ver el conteo al final de este
documento — no es 81 (la suma cruda de los 7 diseños antes de reconciliar),
es el número real tras quitar las duplicadas de `mapa-companero` y fusionar
los guardarraíles de una línea.

---



---

## 1. XP y niveles

# F7 · XP y niveles


# F7 · XP y niveles — diseño operativo

> Subsistema de F7 ("Juego"). F7 completa (rachas, misiones, mapa, ligas, tablero)
> no tiene ninguna issue todavía; este documento cubre **solo XP y niveles**, y
> deja explícita la interfaz hacia los subsistemas hermanos que no diseña.
>
> Convención de honestidad, heredada de F6: `[medido]` = reejecutado hoy contra
> este repo, comando incluido. `[leído]` = está en un archivo o decisión, con
> línea. `[estimado]` = criterio propio, negociable, y se dice.

## 0. La decisión central: XP y puntos son DOS números, y por qué hacen falta los dos

El proyecto ya tiene "puntos" (`score_totals.total_score`, D-010/D-025): el motor
de reto los calcula con `calificar()` en `packages/motor/src/puntuacion.ts`, con
dos reglas — `valor_del_ítem · acc` en kinder (D-024) y
`a · (d − RT) · (2·acc − 1)` de primaria a Pro (D-010) — y alimentan el tablero,
que ordena por puntos, no por habilidad estimada, a propósito (D-025).

**XP no es el mismo número, y la diferencia no es cosmética — es la propiedad
que hace posible los niveles.** Los puntos, en las bandas cronometradas, pueden
ser **negativos** (fallar rápido resta más que fallar lento, D-010) y se
resetean por temporada (`score_totals.period`: `all_time` | `season:<id>`). Un
sistema de niveles construido sobre un número que puede bajar o resetearse le
quitaría a un niño un nivel ya ganado — que es precisamente lo que D-014
prohíbe con "cosméticos ganados (**deterministas**)": un desbloqueo que se
puede perder no es determinista, es una promesa rota.

Por eso XP es un eje aparte, con tres propiedades que los puntos no tienen:

| Propiedad | Puntos (tablero, D-025) | XP (niveles) |
|---|---|---|
| ¿Puede bajar? | Sí — falla rápido resta (D-010) | **Nunca.** Solo suma o queda igual |
| ¿Depende del reloj? | Sí, de primaria a Pro (`rtMs`) | **Nunca**, en ninguna banda |
| ¿Se resetea? | Sí, por temporada (`period`) | **Nunca.** Es acumulado de por vida |
| ¿Para qué sirve? | Ordenar el tablero/ligas (competitivo) | Progresar de Rango (personal, no comparativo) |
| ¿Puede ser negativo un intento? | Sí, en bandas cronometradas | **No.** Piso en cero por ítem |

**Un niño de 8 años no tiene que reconciliar los dos números.** Se le explican
por lo que HACEN, no por su aritmética: "los puntos son tu marcador de esta
liga, puede subir y bajar con qué tan rápido contestas"; "el XP es todo lo que
has aprendido bien, nunca baja, y sube tu Rango". La regla de oro de diseño:
**nunca se muestran los dos números en la misma pantalla sin una etiqueta que
los distinga**, y ninguno se deriva del otro.

**Caso especial, y vale la pena decirlo porque es elegante:** en KINDER, la
fórmula de puntos (D-024, `valor_del_ítem · acc`) y mi fórmula de XP
(`valorDelItem(nivel) · acc`, ver §2) son **el mismo número**, porque kinder no
tiene componente de tiempo y no puede ir negativo. No es coincidencia: KINDER
es la única banda donde puntos y XP coinciden matemáticamente, precisamente
porque es la única banda con la propiedad "nunca negativo, nunca reloj" en las
dos fórmulas a la vez. **Y kinder es toda la banda que el MVP construye**
(D-009/D-034), así que en el primer release, el "segundo número" no le va a
parecer arbitrario a nadie: crece exactamente igual que el marcador, solo que
uno se acumula para siempre y el otro se reinicia por temporada.

## 1. Hallazgo — bug heredado de F3, descubierto diseñando esto

Antes de reusar `valorDelItem()` para XP, verifiqué si los PUNTOS de las bandas
cronometradas ya lo usan (D-010 dice que sí: *"Valor del ítem por dificultad:
10 × 1.6^(nivel−1)... Ninguna estrategia domina el tablero"*, y la issue #31
cerrada trae vectores dorados N1=10, N2=16, N8=268, N9=429, N12=1,759 —
exactamente `valorDelItem`).

**No lo usan.** `calificar()` (`packages/motor/src/puntuacion.ts:157-179`)
calcula `valor = valorDelItem(nivel)` pero solo lo mete en `detalle` — nunca en
`puntos` para la rama HSHS:

```
const puntos = a * (d - rtSeg) * (2 * acc - 1);   // sin `valor` en ningún lado
```

Reejecutado hoy `[medido]`:

```
$ npx tsx test.mjs   # calificar({banda:"PRIMARIA", nivel, acc:1, rtMs:0})
nivel 1  valorDelItem 10     puntos 18
nivel 2  valorDelItem 16     puntos 18
nivel 8  valorDelItem 268.4  puntos 18
nivel 9  valorDelItem 429.5  puntos 18
nivel 12 valorDelItem 1759.2 puntos 18
```

Un problema de nivel 12 vale **lo mismo** que uno de nivel 1 en PRIMARIA-a-Pro,
en producción, hoy. Esto **no bloquea mi diseño** (XP llama a `valorDelItem()`
directamente, nunca pasa por `calificar()`), pero sí:

1. **Invalida, para las bandas cronometradas, el argumento central de D-025**
   ("el escalado 1.6^(nivel−1) mitiga... ninguna estrategia domina el
   tablero") — hoy solo es cierto en KINDER.
2. **Es exactamente el contenido que el MVP sí ships**: la franja adulta
   N8-N10 (D-034) es banda SERIO, cronometrada. El tablero de la única
   franja no-kinder del MVP no está pesando por dificultad.
3. `audits/motor-puntuacion.mjs` no lo caza — su propio encabezado dice *"LO
   QUE NO PUEDE COMPROBAR: si los pesos de la fórmula son buenos"* `[leído]`.

Lo dejo como issue de bloqueo (§14, issue 2) y como pregunta al dueño (§13,
Q1), porque arreglarlo cambia puntajes ya en producción y no es una decisión
que me toque tomar sola.

## 2. Fórmula de XP — por ítem y por reto

**Por ítem**, reutilizando `valorDelItem()` (única fuente, D-010), sin tocar
`puntuacion.ts`:

```ts
// packages/motor/src/xp.ts
export function xpDeItem(nivel: number, acc: 0 | 1): number {
  return acc === 1 ? valorDelItem(nivel) : 0;
}
```

Nunca negativo (piso en 0), nunca usa `rtMs`, nunca usa `banda` — **el mismo
ítem vale lo mismo en XP sin importar en qué banda se sirvió**, porque XP no es
competitivo entre bandas (§5). Los aciertos de D-048 ("cuál sobra" con varias
respuestas defendibles) ya llegan como `acc=1`, así que no hace falta caso
aparte.

**El modo del reto (D-018) no entra en la fórmula — a propósito.** Un problema
PROBLEMA (D-018: "1 ítem que cuesta pensar, vale muchos puntos") no necesita un
multiplicador de modo: si de verdad cuesta pensar, el autor lo etiquetó con un
`nivel` alto, y `valorDelItem` ya lo premia. Atar XP al `nivel` y no al `modo`
evita que la elección de empaquetado (una serie de 8 contra un ítem solo) sea
por sí misma una estrategia de granjeo.

**Por reto**, sumando los ítems más un bono de finalización fijo:

```ts
export const BONO_FINALIZACION_XP = valorDelItem(1); // 10 — mismo valor que un ítem N1

export function xpDelReto(
  items: Array<{ nivel: number; acc: 0 | 1 }>,
  completado: boolean,
): number {
  const base = items.reduce((s, i) => s + xpDeItem(i.nivel, i.acc), 0);
  return completado ? base + BONO_FINALIZACION_XP : base;
}
```

`completado` = el niño respondió todos los ítems servidos de la serie
(`progreso(estado).contestadas === total`, sobre `EstadoSesion` de
`sesion.ts`). El bono existe porque `mc-16` documenta el patrón de Duolingo —
*"+20 flat per-session completion bonus so any finished session feels like
progress"* [implicación de diseño 7] — como el préstamo "más barato y menos
controvertido" de todo el inventario de mecánicas de Duolingo. Se fija en
`valorDelItem(1)` para no inventar una segunda constante mágica.

**Si el niño abandona a media serie, lo ya contestado ya pagó su XP** —
`xpDeItem` se acredita por ítem, no al cerrar. Solo el bono de finalización se
pierde. Penalizar retroactivamente el XP ya ganado por no terminar violaría la
misma lógica que D-016 protege para la racha ("el límite de pantalla nunca
corta a media respuesta", `sesion.ts:puntoSeguroDeCorte`).

**¿Se otorga el bono aunque el niño falle todos los ítems (acc=0 en los 8)?**
Lo decidí que sí, y lo dejo también como pregunta al dueño (Q4, §13) porque es
un valor, no un hecho: matemáticamente no cambia nada si se decide que no.

## 3. La curva Rango↔XP

### 3.1 Por qué no reusar el 1.6 de `valorDelItem`

La primera idea, la más barata de construir, es reusar la misma constante de
crecimiento que ya existe en el motor: `umbral(r) = 100 × 1.6^(r−1)`. La
descarté con números, no con intuición `[medido]`:

| Rango | Umbral con 1.6^(r−1) | Días a 300 XP/día |
|---|---|---|
| 10 | ~6,872 XP | ~23 días |
| 15 | ~72,058 XP | ~240 días |
| **20** | **~755,579 XP** | **~2,519 días (6.9 años)** |
| 30 | ~83 millones XP | ~758 años |

(300 XP/día = calibración de un niño de kinder "comprometido", ver §3.3.) Un
niño de kinder tardaría casi 7 años en llegar a Rango 20 y su vida entera —
literalmente— en llegar a Rango 30. Esto confirma con números lo que la
investigación externa de diseño de juegos ya advierte:

> *"Exponential Curve — each threshold = previous value × coefficient...
> Disadvantage: coefficient selection is critical—too low yields flat
> progression; too high creates unreachable endgame values."*
> — [Example Level Curve Formulas for Game Progression](https://www.designthegame.com/learning/courses/course/fundamentals-level-curve-design/example-level-curve-formulas-game-progression)

> *"[The recommended approach is that] early thresholds are easy to reach,
> then require an increasing amount of points but without reaching hyperbolic
> values"* — el incremento ENTRE rangos crece linealmente, no el umbral
> mismo exponencialmente.
> — [Quantitative design — How to define XP thresholds?](https://www.gamedeveloper.com/design/quantitative-design---how-to-define-xp-thresholds-) (GameDeveloper.com/Gamasutra)

Esa es exactamente la propiedad que evita el "estancamiento en niveles altos"
que se me pidió investigar: si el incremento crece linealmente en vez de
multiplicarse, el crecimiento total es **cuadrático**, no exponencial — mucho
más suave.

(Nota sobre fuentes: busqué también blogs de producto sobre "Duolingo XP curve
design" — la mayoría (strivecloud.io, orizon.co, ludaxis.io) repiten cifras
tipo "+60% engagement" sin fuente rastreable, el mismo patrón que `mc-16` ya
marcó como no verificado para las cifras de Duolingo. No las uso.)

### 3.2 La fórmula elegida

**Incremento lineal entre rangos consecutivos → umbral cuadrático:**

```ts
export const RANGO_ESCALA = 25;

/** XP acumulado necesario para ENTRAR al rango `r`. Rango 1 empieza en 0. */
export function umbralXpParaRango(r: number): number {
  if (!Number.isInteger(r) || r < 1) throw new RangeError(`rango inválido: ${r}`);
  return RANGO_ESCALA * (r - 1) * (r + 2);
}

/** El rango que corresponde a un total de XP. Función pura, sin estado. */
export function rangoDeXp(xpTotal: number): number {
  if (!Number.isFinite(xpTotal) || xpTotal < 0) throw new RangeError(`xpTotal inválido: ${xpTotal}`);
  let r = 1;
  while (umbralXpParaRango(r + 1) <= xpTotal) r++;
  return r;
}
```

El incremento entre rango `r` y `r+1` es `50 × (r+1)` — crece de forma lineal
y predecible, nunca "hyperbolic" como advierte la fuente citada.

**Forma cerrada de la inversa, verificada `[medido]` (comparada contra la
función iterativa en 811 puntos entre 0 y 30,000 XP, cero discrepancias):**

```
rangoDeXp(xp) = floor( (√(4·xp + 225) − 5) / 10 )
```

### 3.3 La tabla, 15 rangos, con calibración explícita `[estimado]`

Calibración de partida: un ítem de KINDER vale en promedio (N1=10, N2=16,
N3=25.6) → **17.2 XP**; un reto de práctica (D-018: 6-10 ítems, tomo 8) con
**75% de acierto** (criterio, no medido — cifra real de precisión en la
primera semana de un niño de 4-6 años no existe todavía porque F5 no tiene
contenido servible en producción) da **~103 XP + 10 de bono ≈ 113 XP/reto**.
Un niño "comprometido" (varios retos dentro del límite de pantalla de 20 min
por defecto, D-016) hace **~300 XP/día** `[estimado]`.

| Rango | XP para entrar | Incremento | Días a 300 XP/día |
|---|---|---|---|
| 1 | 0 | — | inicio |
| 2 | 100 | 100 | ~1 reto |
| 3 | 250 | 150 | ~1 día |
| 4 | 450 | 200 | ~1.5 días |
| 5 | 700 | 250 | ~2.3 días |
| 6 | 1,000 | 300 | ~3.3 días |
| 7 | 1,350 | 350 | ~4.5 días |
| 8 | 1,750 | 400 | ~5.8 días |
| 9 | 2,200 | 450 | ~7.3 días |
| 10 | 2,700 | 500 | ~9 días |
| 15 | 5,950 | — | ~19.8 días |
| 20 | 10,450 | — | ~35 días (~5 semanas) |
| 30 | 23,200 | — | ~77 días (~2.5 meses) |

Nada de esto sobrevive el lanzamiento sin datos reales — es la misma honestidad
que D-025 aplica a su propia condición de revisión: **`RANGO_ESCALA` y el
supuesto de 300 XP/día se recalibran en cuanto F5 tenga sesiones reales de
kinder en producción**, contra la distribución real de XP/día medida, no
contra este estimado.

No impongo un tope máximo de Rango: la curva cuadrática ya desacelera sola
(matches el patrón "soft cap" recomendado), e imponer un techo artificial se
parecería a las mecánicas de bloqueo que la línea roja #4 prohíbe.

## 4. Rango (XP) contra Nivel (D-017): dos ejes, dos nombres

**Nunca es el mismo número, y el nombre lo tiene que decir.** D-017 ya fijó
"Nivel" (N1-N12) para la dificultad pedagógica del motor adaptativo — el mismo
eje que `NIVELES_POR_BANDA` en `puntuacion.ts` y que D-002/D-046 tratan como
"lo que decide dónde empieza el niño, no la edad". Si el progreso de XP
también se llamara "Nivel", un niño en **Nivel 3** de dificultad podría estar
en **Nivel 12** de XP el mismo día — la fuente de confusión de UX que se me
pidió evitar por nombre.

Propongo **"Rango"** para el eje de XP (código: `rango`, en inglés sería
`rank`, y sigo la convención ya establecida de identificadores en español que
usan `puntuacion.ts`/`sesion.ts`/`bandas.ts` en `packages/motor/src`, pese a lo
que dice CLAUDE.md § Idiomas — es una inconsistencia preexistente del repo, no
la introduzco yo, y romperla en un solo archivo nuevo generaría la
divergencia-entre-archivos que el proyecto trata de evitar). Es una **pregunta
al dueño** (Q2, §13): "Rango" es barato de traducir pero puede sonar a nivel
competitivo de liga; hay alternativas.

**Guardarraíl explícito para quien construya "mapa" y "ligas" (F7 hermanos, no
diseñados aquí):** Rango **nunca** se muestra al lado de Nivel sin distinguir
cuál es cuál, y Rango **nunca** se usa como criterio de ordenamiento
competitivo entre niños de bandas distintas — comparar el Rango 10 de un niño
de kinder con el Rango 10 de un adulto SERIO no dice lo mismo (un ítem N10
vale ~68× lo que un ítem N1), exactamente como el tablero global YA respeta la
segmentación por banda de D-003. Si algún día "mapa" quiere dibujar el Rango
en la Sabana, este es el límite que hereda.

**El mapa de progreso (D-019, ligado a `skill_state.mastered_at` por
habilidad) es OTRO eje, no este.** El mapa dice qué lugares de la Sabana están
desbloqueados (basado en dominio de habilidad); Rango dice cuánto XP
acumulado tiene el niño (basado en volumen y dificultad de aciertos). Un niño
puede subir de Rango practicando fluidez de una habilidad ya dominada sin
desbloquear ningún lugar nuevo del mapa, y viceversa un niño puede dominar una
habilidad nueva (desbloqueando mapa) con relativamente poco XP si el ítem que
la desbloqueó era de nivel bajo. No los until fusiono.

## 5. ¿Domina el volumen sobre la dificultad en XP, como `mc-18` advierte para puntos?

D-025 acepta a sabiendas que su escalado "mitiga, no elimina" el problema que
`mc-18`/`mc-44` señalan para el TABLERO: con tiempo infinito, el volumen le
gana a la dificultad. **Para XP, ese riesgo no aplica de la misma forma, y hay
que decir exactamente por qué:** `mc-18` es una advertencia sobre
**comparación pública** — un niño que hace mil sumas triviales no debería
verse "mejor" que uno que resuelve pocos problemas difíciles **en un mismo
tablero**. XP no es un tablero. No hay ranking, no hay posición, no hay
"quién llega primero a Rango 10" visible entre niños (§4). Que un niño
FLUIDEZ-grinding llegue a Rango 8 más rápido que otro que hace PROBLEMA no es
injusto porque no hay nadie con quien se esté comparando — es exactamente lo
que D-018 quiere de FLUIDEZ: repetir lo ya dominado tiene valor pedagógico
real (`mc-05`), y premiarlo con XP proporcional al volumen practicado es
alineación de incentivos, no el defecto que `mc-18` describe. El freno real
sobre cuánto XP se puede acumular en un día es el límite de pantalla (D-016),
no una regla de XP — igual que la práctica misma es gratis e ilimitada
(D-021, línea roja #4): no le pongo un tope diario de XP por la misma razón
que no hay corazones que se agoten.

## 6. Modelo de datos

Tabla nueva, `xp_totals`, mismo patrón que `score_totals` (D-025,
`migrations/0002_child_profiles.sql:125`) pero **sin `period` ni `theme_band`**
— XP es de por vida y no se segmenta por banda visual (§4):

```sql
-- migración siguiente disponible (0005 está reservada por D-053 para el
-- runbook de birth_month; XP toma el próximo número libre al construirse)
CREATE TABLE xp_totals (
  child_profile_id TEXT PRIMARY KEY REFERENCES child_profiles(id) ON DELETE CASCADE,
  total_xp         INTEGER NOT NULL DEFAULT 0,
  updated_at       INTEGER NOT NULL
);
```

**`rango` NO se guarda como columna — se calcula con `rangoDeXp(total_xp)`.**
Guardarlo sería una segunda fuente de verdad que se desincroniza en el primer
cambio de `RANGO_ESCALA`, el mismo defecto que `audits/tabla-bandas.mjs` ya
existe para prevenir en otro contexto.

**Rollup por lotes, no por intento** (mismo criterio que `rollup.ts`, D1
riesgo #1 de `mc-32`): el XP de cada respuesta se acumula en memoria del mismo
Worker/DO que ya agrega `score_totals` (30-60 s, `INTERVALO_MIN_MS`/`_MAX`
existentes en `rollup.ts`) y se escribe en la MISMA transacción por lote,
reusando la infraestructura de `tocaEscribir()` — no un segundo cron, un
segundo Workflow, ni un segundo intervalo.

```sql
INSERT INTO xp_totals (child_profile_id, total_xp, updated_at)
VALUES (?, ?, ?)
ON CONFLICT (child_profile_id) DO UPDATE SET
  total_xp   = total_xp + excluded.total_xp,
  updated_at = excluded.updated_at
```

El `EstadoSesion` de `sesion.ts` gana un campo paralelo a `puntosTotales`:

```ts
export interface EstadoSesion {
  // ...existente...
  puntosTotales: number;
  xpTotales: number;   // nuevo
}
```

`responder()` computa `xpDeItem(pendiente.nivel, acc)` junto con `calificar()`
y lo acumula igual que los puntos — mismo punto de entrada, mismo Durable
Object, cero infraestructura nueva salvo la tabla D1 de destino.

## 7. Interfaz hacia cosméticos — sin diseñarlos

```ts
export interface EventoDeRango {
  childProfileId: string;
  xpAntes: number;
  xpDespues: number;
  rangoAntes: number;
  rangoDespues: number;  // siempre > rangoAntes cuando el evento se emite
  timestamp: number;
}

export function detectarSaltoDeRango(
  xpAntes: number, xpDespues: number,
): { rangoAntes: number; rangoDespues: number } | null {
  const a = rangoDeXp(xpAntes), b = rangoDeXp(xpDespues);
  return b > a ? { rangoAntes: a, rangoDespues: b } : null;
}
```

**Un solo evento por lote, aunque salte más de un rango.** Si una sesión
grande (p. ej. un adulto SERIO resolviendo varios ítems N9-N10 seguidos) cruza
tres umbrales de golpe, se emite `rangoAntes=5, rangoDespues=8` una sola vez —
no tres eventos seguidos. Un niño no necesita ver tres animaciones de
celebración encimadas; es el mismo principio que F6 aplica a `inesperada`
(nunca sobre-explicar).

**Lo que este subsistema SÍ define:** que el evento existe, que se emite
exactamente una vez por cruce, y que la celebración genérica (sin cosmético
asociado) ocurre siempre — mc-43 documenta que la celebración tiene valor
motivacional incluso sin premio material [§8, implicación 8]. **Lo que NO
define:** qué cosmético (si alguno) corresponde a qué Rango, esa tabla es del
subsistema de cosméticos y D-014 exige que sea "determinista" y "publicada"
(mc-43, implicación de diseño 6).

**El copy del "subiste de Rango" hereda las reglas anti-vergüenza de F6**
(`docs/planes/f6-larry-profe.md` §2.1): celebra el EVENTO ("¡Llegaste a Rango
5!"), nunca el RASGO del niño ("¡eres un genio!") — la prohibición #1 de F6
(Mueller & Dweck 1998, `mc-11`) contra elogiar capacidad aplica exactamente
igual aquí. Este texto debe pasar por el mismo léxico de vergüenza por locale
que F6 ya construye (`audits/lib/lexico-verguenza/<locale>.json`), no un
sistema aparte.

## 8. XP y el mundo real: offline, anti-trampa, y por qué el reloj no importa

**D-047 dice que un intento offline en banda cronometrada puntúa solo por
precisión y NO cuenta para el tablero**, porque sin servidor no hay reloj
confiable para `d − RT`. **XP no tiene ese problema porque nunca usa
`rtMs`** — mi fórmula solo necesita `nivel` y `acc`, los dos verificables sin
reloj. Decisión: **el XP de un intento offline se acredita normalmente al
sincronizar**, sin la reserva que D-047 le pone a los puntos. Es una decisión
real (no una obviedad) porque diverge de cómo tratan el mismo intento los
puntos, y lo justifico: XP no es competitivo (§5), así que la preocupación de
D-047 (un puntaje no verificable compitiendo contra uno verificado) no aplica
— no hay contra quién competir.

**Propiedad emergente, no buscada a propósito pero vale decirla:** como XP
nunca depende del reloj del cliente ni del servidor, es **más resistente a
manipulación que los puntos** por construcción — no hay superficie de ataque
de "reportar un `rtMs` falso" porque XP no lo lee. La única forma de inflar
XP es acertar ítems de verdad, servidos por el motor — exactamente la misma
garantía que ya protege `acc` (D-020, anti-trampa tier 0-5, master-plan §8).
No añade superficie nueva de anti-trampa.

**Sin diferencias por maestría repetida.** Un ítem de una habilidad ya
dominada, servido de nuevo por el programador FSRS-lite de F4
(`skill_state.due_at`), da el mismo XP que la primera vez que se acertó.
Decidí no meter un descuento por repetición porque (a) es estado nuevo que
nadie pidió, y (b) el programador espaciado YA es el freno natural de cuántas
veces resurge el mismo ítem — una segunda regla para el mismo problema es
redundante.

## 9. Visualización por banda y localización del número

**En KINDER, nunca un número.** Solo una barra/indicador visual (Larry
avanzando, un contenedor llenándose) — mismo principio que D-024/D-045 aplican
al reloj ("no lo ve, no lo oye"), y coincide con la recomendación de `mc-43`
§8: *"KINDER — a physical journey path with the mascot walking forward, no
numbers."* Un niño de 4-6 años no lee, y `total_xp` puede llegar a cinco
cifras (§3.3) — un número que no se puede leer no motiva, confunde.

**En PRIMARIA en adelante, el número SÍ se muestra**, y tiene que pasar por
`formatear()` de `packages/motor/src/numeros.ts` — la misma función que ya
existe para D-022/`mc-34`, sin decimales (`formatear(totalXp, locale, 0)` o el
entero por defecto). Con umbrales de cinco cifras a partir de Rango ~20 (§3.3),
el separador de millar por locale deja de ser cosmético: `12,480` (en/es-MX)
contra `12.480` (es-ES/pt-BR/pt-PT/de-DE) contra `12 480` con espacio fino
insecable (fr-FR). **No hace falta un auditor nuevo**: `audits/notacion-locale.mjs`
ya vigila `toLocaleString`/`Intl` sin región y separadores hechos a mano en
CUALQUIER archivo de producto, no solo en contenido matemático — cualquier
pantalla de XP que reimplemente el separador a mano cae bajo su regla 2
(`.replace('.', ',')` a mano) tal como está escrita hoy `[leído,
audits/notacion-locale.mjs:69-78]`.

**"Rango 5" en sí es texto de interfaz, no notación matemática** — se traduce
como cualquier otra cadena de UI en los siete locales (D-022), sin la
complejidad de autoría que sí aplica al contenido matemático (CLAUDE.md §
Idiomas: "el contenido matemático no se traduce, se autora" — Rango no es
contenido matemático, es una etiqueta de producto).

## 10. Mapeo explícito a la tabla sí/no de D-014

| D-014 | Ítem | Cómo lo cumple este diseño |
|---|---|---|
| **Sí** | XP y niveles | Es este subsistema completo (§1-6) |
| **Sí** | Cosméticos ganados (deterministas) | `EventoDeRango` es 100% determinista — cero aleatoriedad en cuánto XP cae o qué rango se cruza (§7) |
| **No** | Corazones/vidas que bloquean | XP nunca bloquea práctica; no hay tope diario de XP, el límite de pantalla (D-016) es el único freno (§5) |
| **No** | Moneda comprable | XP no tiene SKU, no se compra, no se vende, no hay tienda que lo intercambie por dinero |
| **No** | Recompensas aleatorias de pago | `umbralXpParaRango()` es una función pura — el mismo XP siempre cruza el mismo umbral, sin excepción por plan de pago |
| **No** | Notificaciones con culpa | Fuera de alcance (no diseño notificaciones), pero XP no dispara ninguna — no hay mecanismo de "tu XP está en riesgo" |
| **No** | Comparación pública de niños por nombre | Rango es privado por defecto (niño + su padre); si se expone, respeta la segmentación por banda de D-003 y nunca cruza bandas (§4) |

## 11. Auditor propuesto

`audits/motor-xp.mjs`, mismo patrón que `audits/motor-puntuacion.mjs`
(D-032, "cada auditor cita la decisión que hace cumplir"):

1. **Un solo motor.** Igual que `motor-puntuacion.mjs` cuenta archivos que
   "calculan" XP fuera de `xp.ts`, este cuenta archivos que calculan XP fuera
   de `packages/motor/src/xp.ts`.
2. **El tiempo nunca entra al cálculo de XP, en NINGUNA banda** — regla más
   estricta que la de puntos (que sí permite tiempo de primaria a Pro): busca
   `rtMs`/`tiempo`/`elapsed` en contexto de XP y bloquea siempre, sin
   excepción de banda.
3. **XP nunca depende de plan de pago** (mismo patrón `PAGO` que ya existe en
   `motor-puntuacion.mjs`, línea roja #4).
4. **XP nunca se resta** — grep de `xp -=`, `totalXp -=`, `total_xp =
   total_xp -` fuera de un caso de erasure COPPA documentado. Es la
   comprobación de la propiedad "nunca baja" que sostiene todo §0.

Se construye con su caso de prueba en `audits/pruebas-auditores.mjs`
(CLAUDE.md § Git regla 3): planta una violación de cada regla, comprueba que
bloquea por la razón correcta, la borra.

## 12. Qué NO incluye este diseño

- **Rachas con red de protección** — subsistema hermano de F7, no diseñado aquí.
- **Misiones diarias** — ídem.
- **Mapa de progreso** — ídem; §4 solo fija el límite ("no es lo mismo que
  Rango") para quien lo diseñe.
- **Ligas de ~30 y tablero con alias** — ya existen en D-003/D-025; este
  documento solo aclara que XP no los alimenta ni los sustituye.
- **Qué cosmético corresponde a qué Rango** — tabla del subsistema de
  cosméticos; aquí solo se define la interfaz (`EventoDeRango`).
- **Recalibración con datos reales de producción** — queda como condición de
  revisión explícita (§3.3), no resuelta aquí porque los datos no existen
  todavía.
- **El arreglo del bug de `calificar()`** (§1) — se deja como issue de
  bloqueo y pregunta al dueño, no se decide unilateralmente aquí porque
  cambia puntajes ya en producción.

## 13. Preguntas al dueño

**Q1 — El bug de `calificar()` en bandas cronometradas (§1).** ¿Se corrige el
código para que multiplique por `valorDelItem(nivel)` (restaura la intención
de D-010/issue #31, pero sube de golpe los puntajes de la franja SERIO
N8-N10 que ya está en producción — hay que decidir si `a` se renormaliza para
compensar), o se corrige la documentación para que describa lo que el código
YA hace (D-010 deja de afirmar que el ítem escala el puntaje fuera de
kinder, y el argumento "ninguna estrategia domina" de D-025 se vuelve
válido solo para kinder, con eso escrito de frente)?

**Q2 — Nombre del eje de XP (§4).** ¿"Rango" (numérico, barato de traducir,
riesgo de sonar a nivel de liga competitiva), títulos temáticos de la Sabana
("Explorador", ligados a D-019, refuerzan el canon pero se autoran por
locale como el resto del contenido narrativo, no se traducen), o ningún
nombre — mostrar solo el número de XP acumulado sin envolverlo en una
etiqueta de "nivel social"?

**Q3 — ¿Una sola escalera de Rango o una por tema visual (§4)?** Una sola
escalera universal (más simple, un `RANGO_ESCALA`, pero el Rango 10 de un
niño de kinder y el de un adulto SERIO no representan el mismo esfuerzo,
mitigado solo por la regla de "nunca comparar entre bandas"), o cinco
escaleras separadas — una por tema visual de D-017 — estructuralmente
incomparables por construcción, igual que el tablero ya está segmentado por
banda (D-003), a cambio de 5× la calibración y el mantenimiento.

**Q4 — ¿El bono de finalización de reto se otorga siempre, o XP debe ser
estrictamente por acierto (§2)?** Bono siempre al completar (recomendación de
`mc-16`, "cualquier sesión terminada se siente como progreso"; riesgo: un
niño puede desbloquear Rango sin ningún acierto real si hace muchos retos con
0 aciertos), contra XP cero salvo aciertos reales (más estricto con
"ganado" de D-014, pero un niño que se esfuerza y falla todo un reto ve la
barra sin moverse ni un poco).

## 14. Lista de issues (10: 1 paraguas + 9 sub-issues)

Ver el arreglo `issues` de la salida estructurada. Numeradas en el orden en
que conviene construirlas: 1 (paraguas) da contexto; 2 (bug) bloquea porque
toca el mismo archivo que 3 va a importar; 3-4 son el núcleo (fórmula +
curva); 5-6 son el modelo de datos y su auditor; 7-9 son las interfaces
(cosméticos, offline, visualización, copy anti-vergüenza).


## Preguntas al dueño

- El bug de calificar() en bandas cronometradas: ¿se corrige el código para multiplicar por valorDelItem(nivel) (sube de golpe los puntajes ya en producción de la franja SERIO N8-N10), o se corrige la documentación (D-010, D-025) para describir lo que el código ya hace?
- Nombre del eje de XP: ¿"Rango" (numérico, barato de traducir, riesgo de sonar a liga competitiva), títulos temáticos de la Sabana (D-019, se autoran por locale como el resto del contenido narrativo), o ningún nombre — solo mostrar el número de XP acumulado?
- ¿Una sola escalera de Rango universal (kinder a Pro comparten fórmula y umbrales, más simple, pero un Rango 10 de kinder y uno de adulto SERIO no representan el mismo esfuerzo) o cinco escaleras separadas — una por tema visual de D-017 — estructuralmente incomparables por construcción, igual que el tablero ya está segmentado por banda (D-003)?
- ¿El bono de finalización de reto se otorga siempre que se complete (aunque acc=0 en todos los ítems, recomendación de mc-16), o el XP debe depender ESTRICTAMENTE de aciertos, sin ningún componente de participación, para sostener con más rigor el "ganado" de D-014?


---

## 2. Rachas con red de protección

# F7 · Rachas con red de protección

## F7 · Rachas con red de protección — resumen de diseño

### 0. Alcance y método
Este documento diseña **un** subsistema de F7 ("Juego"): rachas con red de
protección. F7 no tiene ninguna issue de GitHub hoy (verificado:
`gh issue list --search "F7"` no devuelve nada). El resto de F7 — ligas de ~30,
tablero global, XP/puntos (ya existen desde F3/D-010), misiones diarias,
cosméticos ganados, mapa de progreso general — se nombra donde toca pero no se
diseña aquí. Se leyó completo: CLAUDE.md, `docs/decisions.md` (las 54
decisiones), las secciones de `docs/master-plan.md` relevantes, F5 y F6
enteros, el código de `packages/motor/src/` (`puntuacion.ts`, `sesion.ts`,
`serie.ts`, `historia.ts`, `offline.ts`, `convenciones.ts`, `numeros.ts`), las
migraciones `0001`-`0004`, y la investigación mc-10, mc-16, mc-17, mc-18,
mc-19, mc-25, mc-30, mc-34, mc-43, mc-46.

### 1. Qué cuenta como "un día"

**Mecanismo:** se reusa `users.timezone` (ya existe desde F2,
`migrations/0003_accounts_onboarding.sql:32`), poblado desde
`request.cf.timezone` de Cloudflare — una cadena IANA (`America/Mexico_City`)
derivada de la geolocalización de IP del que hace la petición, confirmada real
en la documentación pública de Cloudflare Workers (no está disponible en el
editor/preview del dashboard, solo en tráfico real desplegado). El "día
efectivo" de un niño es el día calendario, en la zona horaria de **su hogar**
(no del niño individualmente — el modelo de perfil-dentro-de-la-cuenta-del-padre,
D-013, no le da al niño una zona propia).

**El hueco encontrado y su arreglo:** `users.timezone` hoy solo se escribe una
vez, en el registro (`apps/web/src/pages/api/registro.ts:184-199`). Ninguna
ruta la refresca. Es tolerable para D-016 mientras la familia no viaje ni se
mude; el enunciado de este subsistema nombra "viaje" explícitamente, así que se
agrega un refresco de último-observado (throttle ≥20h) en cada inicio de
sesión — beneficia también al corte nocturno de D-016, que comparte la
columna.

**Meta diaria:** 1 reto completado (cualquier de los 5 modos de D-018),
uniforme entre las 6 bandas — decisión tomada, marcada como pregunta al dueño
por si prefiere escalarla por banda. Se basa en **completar**, no en acertar:
la racha nunca se condiciona a la exactitud, porque condicionarla violaría el
espíritu de la línea roja #8 (nunca penalizar corregir/equivocarse) aplicado a
un nuevo lugar.

### 2. La red de protección, en tres capas (más allá del caso D-016)

**Capa 0 — El caso ya decidido (D-014/D-016):** si el límite de pantalla del
padre corta la sesión antes de que el niño complete la meta, el día se marca
cumplido de inmediato, sin consumir ningún otro recurso de protección. Se
evalúa primero, siempre.

**Capa 1 — Escudos ganados (nuevo, el corazón de "más allá de D-016"):**
- **Cómo se ganan:** `escudosGanados = floor(current_streak / 7)`, capado a 2
  almacenados. Cada semana completa de racha real regala 1 escudo.
- **Cómo se consumen:** automáticamente, en silencio, el momento en que se
  detecta un día perdido sin pausa familiar declarada — nunca hay una pantalla
  de "¿usas un escudo?" (eso sería *confirm-shaming*, categoría nombrada por la
  FTC y citada en mc-17).
- **Tope:** 2. No es "ilimitado" pese a que mc-16 lo sugiera — la lectura
  correcta de esa recomendación es "no es un ítem de inventario escaso que hay
  que comprar", no "infinito". Un escudo verdaderamente infinito vuelve la
  racha una cifra sin señal (jugar cada dos días para siempre nunca la
  rompería). El tope de 2 iguala al nivel gratuito real de Duolingo (confirmado
  por búsqueda externa: 2 freezes gratis, con vías de obtención — gemas,
  cofres — que se mezclan con moneda comprable, exactamente el patrón que
  D-014 prohíbe por nombre y que este diseño evita por construcción: la
  fórmula de ganancia no acepta ningún parámetro de pago).
- **Criterio auditable:** `audits/racha-nunca-se-vende.mjs` bloquea si algún
  archivo que escribe `shields_available` está en el grafo de imports de una
  ruta de pago, y si la firma de `ganarEscudos()` alguna vez gana un parámetro
  de transacción.

**Capa 2 — Pausa familiar (nuevo, para gaps que exceden los escudos):**
declarada por el **padre**, nunca por el niño (línea roja #3 no es el problema
aquí — el problema es fricción y datos innecesarios). Hasta 4 veces por año
calendario, cada una de hasta 21 días, prospectiva o retroactiva (retroactiva
dentro de 5 días de la ruptura). `[criterio propio]`, con la misma honestidad
que D-016 usa para su tabla de minutos: no hay fuente que fije este número. Es
seguro ser generoso porque, a diferencia de los puntos del tablero (D-025), la
racha no ordena ni compite — no hay el mismo riesgo de justicia entre familias.

### 3. Cómo se muestra sin generar ansiedad (cruce con mc-10)

**Por banda, no una sola pantalla para todos** (mc-43 §recomendación 8):
- **KINDER (4-6):** **sin número**. Larry avanza por un sendero de la Sabana
  (D-019), un paso por día — mismo lenguaje visual que el mapa de progreso ya
  define, reusado. Un reset del contador interno nunca borra ni retrocede el
  sendero recorrido (mc-43: "streak loss never erases or visually regresses
  the progress map").
- **PRIMARIA en adelante:** número simple, formateado con `formatear()` de
  `numeros.ts` (mc-34 — separador de miles distinto entre `de-DE` y `fr-FR`
  importa a partir de 4 cifras). Siempre junto a `max_streak`, el mejor marca
  personal — el framing exacto que mc-17 §83 recomienda ("personal-best
  counter with no penalty language"), en vez de una cuenta regresiva.
- **Prohibido en todas las bandas, por lenguaje, no por intención:** color de
  alarma, cuenta regresiva a medianoche, verbo de pérdida ("se rompió", "vas a
  perder"), comparación con otro niño o promedio, ícono de fuego que se apaga
  (se usa la huella de Larry, deliberadamente distinta de la iconografía de
  Duolingo que la propia investigación liga a la aversión a la pérdida).

**El recordatorio que SÍ está permitido** (D-014 prohíbe "notificaciones con
culpa" por nombre; mc-19 da el diseño alternativo con evidencia):
- Va **al padre**, nunca al niño — ningún push toca un dispositivo de niño, en
  ninguna banda.
- Tope duro: **1 por hogar por día**, no por hijo.
- Solo si nadie completó la meta ese día efectivo Y solo cerca del inicio de
  la ventana de pantalla que el propio padre ya configuró (D-016) — nunca
  antes de las 07:00 ni después de las 20:00 hora local del hogar.
- Copy de intención-implementación, no de reenganche genérico: "Es un buen
  momento para el momento de matemáticas de [alias]." Nunca menciona la
  racha, nunca un número de días en riesgo, nunca una mascota decepcionada.
- Silenciable en un toque, permanentemente, sin volver a preguntar (mismo
  principio que D-026 ya fija para las marcas contextuales).

### 4. Mapeo explícito contra la tabla sí/no de D-014

| D-014 | Cómo lo resuelve este diseño |
|---|---|
| Sí — Rachas con red de protección | Capas 0-2 arriba: caso D-016, escudos ganados, pausa familiar |
| No — moneda comprable | `ganarEscudos()` es función pura de `current_streak`; ninguna ruta de pago toca `child_streak`; auditado |
| No — recompensas aleatorias de pago | Los escudos no son un cofre ni tienen componente aleatorio: fórmula determinista, `floor(racha/7)` |
| No — notificaciones con culpa | Recordatorio §3: al padre, 1/día, sin lenguaje de pérdida, auditado por léxico |
| No — comparación pública de niños por nombre | La racha expuesta a salones/clubs (D-044) es solo el número, sin fecha de qué día falló ni por qué |

### 5. Modelo de datos (resumen; detalle completo en las issues)

Tabla nueva `child_streak` (una fila por niño, mismo patrón que `score_totals`
y `skill_state` ya establecen): `current_streak`, `max_streak`,
`last_completed_local_date`, `shields_available` (0-2), `shields_earned_total`,
`pause_until_local_date`, `pause_uses_this_year`, `pause_year`, `updated_at`.
Toda la lógica de transición vive en una función pura nueva,
`packages/motor/src/racha.ts` — mismo patrón exacto que `puntuacion.ts` y
`sesion.ts` ya establecen (sin red, sin reloj propio, el llamador decide de
dónde sale el tiempo). Nombrado en español porque **así está el resto del
paquete** (`puntuacion.ts`, `serie.ts`, `sesion.ts`, `historia.ts`) pese a que
CLAUDE.md pide inglés para código — es una inconsistencia ya existente en el
repo, no una nueva; seguir el patrón local de los archivos vecinos parece más
correcto que romperlo en un archivo nuevo. Las tablas SQL sí van en inglés
(`child_streak`), como el resto del esquema (`score_totals`, `skill_state`).

### 6. i18n (mc-34)

La racha muestra un **número entero**, sin decimales — el único riesgo de
notación es el separador de miles a partir de 4 cifras (`de-DE`/`fr-FR` usan
punto/espacio donde `en`/`es-MX` usan coma). Se resuelve pasando siempre por
`formatear()`, ya construido. El copy alrededor del número (el propio léxico
"racha"/"streak"/"série") se autora por locale como cualquier otro texto de
producto, no se traduce mecánicamente.

### 7. Lo que NO se resolvió aquí, dicho de frente

- El número exacto del tope de pausa familiar (4/año, 21 días) es criterio
  propio sin respaldo de investigación — igual que la tabla de D-016.
- La infraestructura real de envío de Web Push (VAPID, service worker) se deja
  como coordinación con F8, no como trabajo cerrado de F7.
- Si los escudos deben ser visibles al niño, si la meta diaria escala por
  banda, y si los hitos de racha deben disparar cosméticos del subsistema
  vecino de F7 — las tres preguntas reales que quedan al dueño, con
  alternativas.
- No se investigó evidencia académica adicional sobre "streak freeze" y
  ansiedad infantil específicamente más allá de mc-16/mc-17/mc-19 (que ya
  cubren el tema con suficiente profundidad para decidir); la búsqueda externa
  se acotó a verificar dos hechos puntuales que el corpus no tenía: la
  existencia real de `request.cf.timezone` y el tope/mecanismo real de
  Duolingo Streak Freeze en 2025, ambos confirmados con fuente citada en las
  issues.

## Preguntas al dueño

- ¿Los escudos ganados son visibles para el niño (un ícono positivo, 'tienes 2 protecciones guardadas') o quedan completamente invisibles hasta que se consumen en silencio? Recomiendo invisibles, para minimizar cualquier conducta de conteo alrededor del número de escudos — pero es una decisión de producto real, no técnica.
- ¿La meta diaria que sostiene la racha ('1 reto completado, cualquier modo') es la misma para las 6 bandas, o crece con la banda (p. ej. más retos en SECUNDARIA/SERIO/JR/PRO)? Recomiendo uniforme — es el piso real de Duolingo y evita inventar números por banda sin evidencia —, pero cambia lo que se autora y se muestra por banda.
- ¿Los hitos de racha (7, 30, 100 días) deben disparar también un cosmético del subsistema 'Cosméticos ganados' de D-014 (otra pieza de F7, sin diseñar aún), o los dos sistemas son completamente independientes? Si se cruzan, el motor de racha necesita emitir un evento de hito además de gestionar escudos, y esa es una decisión de interfaz entre dos subsistemas de F7 que ninguno de los dos puede tomar por su cuenta.


---

## 3. Misiones diarias

# F7 · Misiones diarias

## 0. Alcance real, dicho de frente

El catálogo que sigue está diseñado para **todas** las bandas ≥ PRIMARIA, pero en
el MVP (D-009, D-034) solo dos configuraciones tienen contenido detrás:
**KINDER** (colapsada, ver §2) y **SERIO** (la franja adulta N8-N10). PRIMARIA,
SECUNDARIA, JR y PRO están en la tabla porque D-007 manda construir la
plataforma antes que los niveles — el catálogo no se vuelve a escribir cuando
lleguen esos niveles, simplemente empieza a tener con qué activarse. Cualquier
cifra de este documento que hable de "primaria+" es sobre la **arquitectura**,
no una afirmación de que hoy hay contenido de primaria para ejercitarla.

## 1. Modelo de datos

```ts
// packages/motor/src/misiones.ts — módulo PURO, mismo patrón que puntuacion.ts:
// entra (perfil, fecha, catálogo, resúmenes), sale una decisión. Sin red, sin
// reloj, sin Math.random. Testeable sin infraestructura.

export type TipoMision =
  | "volumen" | "variedad" | "repaso" | "dominio" | "problema"
  | "fluidez" | "precision" | "descubre" | "duelo" | "meta_de_liga";

export interface DefinicionMision {
  tipo: TipoMision;
  bandaMinima: Exclude<Banda, "KINDER">; // KINDER nunca entra aquí, ver §2
  xpBase: number;          // [estimado] — ver §5, ninguna cifra viene de fuente
  elegible: (r: ResumenAdaptativoParaMisiones, l: ResumenDeLigaParaMisiones) => boolean;
}

/** Lo único que F7 puede pedirle a F4. Lista blanca, igual que SobreParaLarry
 *  en F6 — ni un campo más, y F7 no puede nombrar el tipo `skill_state` ni el
 *  DO de F4. `misiones-sin-do-ajeno.mjs` lo hace cumplir. */
export interface ResumenAdaptativoParaMisiones {
  habilidadesEnRepaso: string[];        // lo que serie.ts::tocaRepasar() marcó HOY
  habilidadesCercaDeDominio: string[];  // skillState en [0.4, 0.8)
  habilidadesDominadas: string[];       // umbral de "ya dominado", para FLUIDEZ
}

/** Lo único que F7 puede pedirle al DO de liga (mc-32: un DO por liga). */
export interface ResumenDeLigaParaMisiones {
  enLiga: boolean;
  dueloOptIn: boolean;                  // D-018: opt-in, 8+
  metaColectivaHoy: { objetivo: number; llevan: number } | null;
}

export interface Mision { tipo: TipoMision; xp: number; }

export function elegirMisionesDelDia(
  childProfileId: string,
  fechaLocal: string,           // "YYYY-MM-DD", MISMO límite de zona horaria que D-035 §5.2
  banda: Banda,
  resumenF4: ResumenAdaptativoParaMisiones | null,  // null = F4 no desplegado aún
  resumenLiga: ResumenDeLigaParaMisiones,
): Mision[]
```

**Por qué dos envelopes y no uno.** F4 (pedagógico) y el DO de liga
(gamificación social) son dominios distintos con dueños distintos y ciclos de
vida distintos — el mismo argumento estructural que D-027 usa para separar
`grupo_infantil` de `club_adulto`: mezclar los dos en un solo contrato hace que
un bug de uno pueda tocar al otro sin que nadie lo decida.

## 2. KINDER: no hay menú de misiones

**Decisión, dicha con la misma honestidad que D-024 usó para el puntaje de
kinder:** en KINDER, "misión diaria" no es una función nueva. Es una etiqueta
interna sobre lo que ya existe — completar el reto HISTORIA del día en la
Sabana (D-019) — puesta ahí solo para que la telemetría del padre pueda
contarlo. No hay UI de misión, no hay menú de 3 tarjetas, no hay número, no
hay texto nuevo: Larry ya narra "hoy vamos a..." como parte del modo HISTORIA
que F5/F6 tienen que construir de todas formas. **F7 no le cuesta a kinder ni
una cadena de audio nueva.**

La razón de fondo, no solo de costo: un niño de 4-6 años no tiene la capacidad
de trabajo mental para sostener un menú de opciones (ver §7), y D-018 ya fijó
que la meta diaria de kinder es **un** reto. Apilar un segundo concepto
("misión" además de "racha") sobre la misma acción sería inventar complejidad
donde D-018 ya decidió simplicidad.

`audits/kinder-sin-examen.mjs` (ACTIVE) corre sobre cualquier archivo que este
subsistema toque en superficies de kinder — como no hay cronómetro ni UI de
examen nueva, no debería encontrar nada, y esa ausencia es en sí un criterio
de cierre.

## 3. Catálogo — 10 tipos para PRIMARIA en adelante

Verificados uno por uno contra D-018 (modos), D-014 (lista negra) y D-030/mc-32
(arquitectura). Ninguno se solapa con otro en el eje que mide:

| Tipo | Qué mide | Fuente de elegibilidad | Eje | Banda mín. | XP `[estimado]` |
|---|---|---|---|---|---|
| `volumen` | N retos de cualquier modo (N=3) | ninguna (siempre elegible) | cantidad | PRIMARIA | 15 |
| `variedad` | practica 2 habilidades distintas | ninguna | amplitud de **tema** | PRIMARIA | 15 |
| `repaso` | practica una habilidad que F4 marcó vencida hoy | F4: `habilidadesEnRepaso` | adaptativo | PRIMARIA | 20 |
| `dominio` | 3 correctas seguidas en una habilidad cercana a dominarse | F4: `habilidadesCercaDeDominio` | adaptativo | PRIMARIA | 25 |
| `problema` | completa un reto modo PROBLEMA (D-018, sin reloj) | ninguna | modo | PRIMARIA | 20 |
| `fluidez` | completa un reto modo FLUIDEZ (D-018, con reloj, solo temas dominados) | F4: `habilidadesDominadas` no vacío | modo | PRIMARIA | 15 |
| `precision` | termina una PRÁCTICA con 100% de aciertos | ninguna | calidad | PRIMARIA | 15 |
| `descubre` | juega un modo que no jugaste esta semana | ninguna | amplitud de **modo** | PRIMARIA | 10 |
| `duelo` | participa en un DUELO hoy | liga: `dueloOptIn === true` (D-018: 8+, opt-in) | liga, individual | PRIMARIA (8+) | 20 |
| `meta_de_liga` | tu liga suma X retos entre todos hoy | liga: `enLiga === true` | liga, cooperativo | PRIMARIA | 10 (compartido) |
| Bono "3 de 3" | completar las 3 misiones del día | — | — | PRIMARIA | +15 |

`variedad` mide amplitud de **tema**; `descubre` mide amplitud de **modo**. No
son el mismo eje aunque suenen parecido — es la clase de colisión que la
crítica de F5 encontró en `proposito` (dos enums cerrados con el mismo nombre
midiendo cosas distintas), y aquí se evita a propósito documentándolo.

`duelo` y `meta_de_liga` son la respuesta directa a que **DUELO es
literalmente una feature de ligas** (D-018): una versión individual-competitiva
y una cooperativa, cada una con su propio mecanismo de "sin perdedor" (§8).

**HISTORIA no está en esta tabla.** D-034 excluye explícitamente el modo
HISTORIA de la franja adulta ("sin modo historia, sin arte de la Sabana"), y
ninguna otra banda ≥7 tiene contenido en el MVP. HISTORIA vive solo en KINDER,
ya cubierta en §2.

## 4. Algoritmo de selección — determinista, nunca aleatorio

```
seed = hash(childProfileId + fechaLocal)     // reproducible, NO Math.random
slot1 (adaptativo) = repaso si habilidadesEnRepaso.length > 0
                      si no, dominio si habilidadesCercaDeDominio.length > 0
                      si no, volumen   // nunca vacío
slot2 = siguiente elegible en rotate(POOL_FIJO, seed) sin repetir slot1
slot3 = meta_de_liga si enLiga
        si no, siguiente elegible en rotate(POOL_FIJO, seed+1) sin repetir slot1/slot2
```

`POOL_FIJO = [variedad, problema, fluidez, precision, descubre, duelo]`, cada
uno filtrado por su columna "fuente de elegibilidad" antes de entrar a la
rotación. `volumen` nunca sale del pool — es el único tipo sin precondición,
así que sirve de red bajo cualquier fallback (mismo principio que el criterio
de F4 "el programador nunca dice 'vuelve mañana'").

**Por qué un hash y no `Math.random`.** No es una preferencia de estilo: es la
misma regla que hace `calificar()` un módulo puro. Un hash de
`(childProfileId, fechaLocal)` es reproducible — se puede depurar "por qué le
tocó esta misión a mi hijo" sin guardar una semilla aparte — y varía de niño a
niño y de día a día sin necesitar ninguna fuente de entropía. El auditor nuevo
`mision-recompensa-deterministica.mjs` falla si aparece `Math.random` (o
equivalente) en cualquier archivo `**/mision*.ts`.

**Degradación sin F4.** Si `resumenF4` llega `null` (F4 todavía no está
desplegado), `slot1` cae directo a `volumen` — F7 puede desplegarse y
ejercitarse antes de que F4 exista, y se enciende sola cuando F4 aterrice, sin
tocar este código.

## 5. Recompensa — nunca aleatoria, ni pagada ni gratis

**D-014 leída con cuidado, como pide la tarea.** La columna "No" de D-014 dice
literalmente *"recompensas aleatorias de **pago**"* — no prohíbe, por su letra,
una recompensa aleatoria **gratis**. Pero tres cosas cierran esa rendija:

1. La columna "Sí" exige **cosméticos ganados, deterministas** — no dice
   "deterministas si se cobran". El calificativo aplica siempre.
2. `mc-17` hallazgo 4 y su tabla de líneas rojas dicen, sin condicionar a pago:
   *"No randomized/loot mechanics anywhere in the product, even free or
   cosmetic"* — Bélgica/Países Bajos declararon ilegales las cajas de botín por
   ser aleatorias, no por ser de pago.
3. `mc-43` hallazgo 5 lo dice todavía más explícito: *"no randomized rewards of
   any kind, paid or free, since the mechanism regulators worry about
   (variable-ratio reinforcement) needs no money to work on a child."*

**Decisión: ninguna recompensa de misión es aleatoria, en ningún caso.** XP fija
por tipo (tabla de §3), sin variar por sesión ni por suerte. Esto es **más
estricto que la letra de D-014**, no una contradicción con ella — se documenta
así, con el mismo patrón de honestidad que D-025 usa quand se aparta de una
recomendación de investigación, pero aquí es al revés: nos apartamos de la
lectura más permisiva (mc-16 impl. 10, "randomized-but-bounded reward reveals
are sound psychology") a favor de la más estricta y más específica para
audiencia infantil (mc-17, mc-43).

**Se evita también la metáfora de "cofre"/"caja".** Aunque el contenido sea
conocido de antemano, un cofre que se abre sugiere sorpresa. El bono de cierre
del día (+15 XP por las 3 misiones) se muestra como una suma directa, sin
animación de desenvolver nada.

**XP nunca es el mismo número que los puntos del tablero.** `puntuacion.ts`
(D-010, D-025) sigue siendo la única fuente de los puntos que ordenan ligas y
tablero. El XP de misiones es una moneda aparte — alimenta un "rango" privado
de progreso (fuera de alcance de este documento, ver §9) — para que la
estrategia de "completar muchas misiones fáciles" nunca le gane a la de
resolver problemas difíciles en el tablero, que es exactamente el problema que
D-025 ya resolvió para los puntos y que no hay que volver a resolver aquí
mezclando las dos monedas.

## 6. Silencio dentro del reto

**Regla dura, nueva en este documento:** ninguna interfaz de misión se muestra
**dentro** de la pantalla de un reto activo. Ni un contador, ni un ícono, ni un
"¡vas por tu misión!" a media resolución. Las misiones se anuncian al empezar
la sesión y se resumen al terminarla — nunca en medio.

**Por qué.** D-018 protege el modo PROBLEMA precisamente para que el reloj no
estorbe al pensamiento; una insignia de misión parpadeando en la esquina
reintroduce la misma presión evaluativa que el modo fue diseñado para evitar,
aunque no sea un cronómetro. Auditor nuevo `mision-silenciosa.mjs`: mismo
patrón de grafo de dependencias que `larry-sin-item.mjs` — ningún componente
`Reto*` importa el componente/estado de misión.

**El resumen de fin de día no muestra ceros.** Se ataca esto en la autocrítica
(§10.1): un renglón "0/3 misiones" es un veredicto negativo aunque el texto no
lo diga. El resumen lista **solo lo logrado**, como una lista que crece —
nunca una lista con casillas vacías tachadas.

## 7. Cuántas misiones simultáneas — la pregunta que el corpus no contesta

`mc-16` y `mc-19` no dan una cifra para "cuántas misiones diarias tolera un
niño de 7-11 sin abrumarse" — la tarea pedía salir a buscarla si no estaba.
Búsqueda dirigida (WebSearch, 2026-08-01): no existe un estudio de HCI con esa
cifra exacta. Dos piezas indirectas, ninguna decisiva por sí sola:

- **Duolingo usa 3 misiones diarias** (bronce/plata/oro), corroborado en
  múltiples fuentes secundarias (Duolingo Wiki/Fandom, duoplanet.com,
  duolingoguides.com) pero sin un post oficial de Duolingo que lo confirme como
  cifra primaria — mismo nivel de confianza que mc-16 ya le da a otras cifras
  de Duolingo (`[unverified pero ampliamente corroborado]`).
- **Cowan (2010), "The Magical Mystery Four"** (https://pubmed.ncbi.nlm.nih.gov/20445769/)
  establece ~4±1 elementos como el techo de memoria de trabajo en **adultos**,
  con la capacidad de niños de 7-11 años todavía **subiendo** hacia ese techo,
  no habiéndolo alcanzado (Reynolds, "Working Memory Capacity Development
  through Childhood", https://twu.edu/media/documents/woodcock-institute/ReynoldsWM.pdf).

**Decisión, documentada como criterio y no como ciencia — mismo patrón que la
tabla de límite de pantalla de D-016:** 3 misiones simultáneas para PRIMARIA en
adelante. Se apoya en el precedente de Duolingo, cae dentro del margen inferior
del techo adulto de Cowan, y mantiene un solo número fácil de razonar en vez de
uno por banda. **Es una pregunta real para el dueño** (ver preguntas), porque
la evidencia es débil en ambas direcciones: 2 sería más conservador dado que
Cowan dice que a los 7 años la capacidad es *menor* que el techo adulto, y 3 es
más simple de construir y de explicar.

## 8. `meta_de_liga` — cooperativa, sin perdedor, sin apuesta

Reusa el mismo patrón estructural que D-028 usa para las prendas de adultos
—"ninguna de las formas tiene casilla de perdedor"— aplicado a niños sin que
haya apuesta de por medio: el contador colectivo (`llevan / objetivo`) nunca se
muestra junto a la contribución individual de nadie (evita que un niño se
autoinfiera "el grupo no llegó por mi culpa" aunque el sistema nunca lo
señale), y si la liga no llega a la meta, el contador simplemente desaparece al
día siguiente **sin anuncio de que no se logró** — el mismo principio que
`mc-46` documenta en Strava *Group Goal*: la ausencia de tabla de posiciones
"es la función, no una limitación".

## 9. Qué NO incluye este documento

- El catálogo de cosméticos y su tabla de desbloqueo determinista (otro
  subsistema de F7: "Cosméticos ganados"). Este documento solo dice que el XP
  de misión **alimenta** ese sistema, no lo diseña.
- El "rango" o nivel de jugador derivado de XP acumulado y su curva (otro
  subsistema).
- El mecanismo interno de ligas y de DUELO — cómo se arma el set de ítems, cómo
  se calcula el ganador (otro subsistema: "F7 · Ligas"). Misiones diarias solo
  **lee** su estado a través de `ResumenDeLigaParaMisiones`.
- El tablero global y su ordenamiento por puntos (D-025, ya cerrado, otro
  subsistema).
- Notificaciones push de recordatorio de misión — mc-19 exige que vayan al
  padre, máximo 1/día, sin culpa; esto es una decisión de F7 · Rachas o de
  F8 · Padres, no de este documento (ver pregunta 4).
- Un compañero tipo Tamagotchi — `mc-43` lo deja como pregunta abierta del
  dueño (¿está siquiera en alcance?); no se construye aquí.
- Misiones semanales/mensuales — mc-16 las recomienda como capa adicional, pero
  se difieren a propósito: complicarían la lógica de "día" con dos horizontes
  de tiempo a la vez, y D-014 solo nombra "misiones **diarias**".
- Contenido de PRIMARIA/SECUNDARIA/JR/PRO — no existe todavía (D-007, D-009).

## 10. Autocrítica adversarial

**10.1 — "0/3" en el resumen es un veredicto, aunque el copy no lo diga.**
Encontrado y corregido en §6: el resumen de fin de día lista solo lo logrado.

**10.2 — ¿`repaso` puede leerse como "el sistema elige lo que peor haces"?**
Riesgo real si F4 eligiera la habilidad más DÉBIL. No es el caso: el
programador de espaciado (`serie.ts::tocaRepasar`) elige por **vencimiento**
(fecha), no por debilidad — una habilidad puede estar bien dominada y aun así
"tocar repasarla" hoy. Esto ya lo resuelve la arquitectura existente, pero
merecía decirse en voz alta en vez de darse por supuesto, y así queda en §3.

**10.3 — `meta_de_liga` y la culpa autoinferida.** Atacado y corregido en §8:
nunca contribución individual junto al total, nunca anuncio de meta no
alcanzada.

**10.4 — ¿la prohibición total de `Math.random` bloquea algo legítimo, como
desempatar entre dos tipos igual de elegibles?** No: el hash de
`(childProfileId, fechaLocal)` ya varía por niño y por día sin necesitar
entropía real. La regla no tiene costo de expresividad.

**10.5 — ¿es honesto contar "10 tipos" si uno de ellos (`sabana_kinder`, §2) es
literalmente "no construir nada"?** Por eso el conteo de §0 y §3 lo dice así:
10 tipos nuevos para PRIMARIA en adelante, y una reinterpretación de lo que
KINDER ya tiene — no 11 cosas nuevas.

**10.6 — ¿`fluidez` puede quedar permanentemente inelegible para un niño
nuevo?** Sí, durante sus primeras sesiones (nada dominado todavía). No es un
bug: cae al fallback del pool general como cualquier otro tipo inelegible
(§4), y es un caso de prueba explícito en el criterio de aceptación
correspondiente.

**10.7 — ¿`dominio` duplica la recompensa del mismo evento que F4 ya iba a
marcar (`provisional_at`, criterio #97 de F4)?** No es duplicación indebida:
son monedas distintas (XP de misión vs. el estado de dominio de F4, que no es
una moneda). La misión simplemente **reconoce con XP** un evento que F4 ya
produce por su cuenta.

## 11. Mapeo explícito a D-014

| Elemento de D-014 | Cómo aparece aquí |
|---|---|
| XP y niveles (Sí) | Cada misión da XP fijo (§5); alimenta un "rango" fuera de alcance |
| Rachas con red de protección (Sí) | Independiente de misiones por diseño (racha nunca depende de completar 0-3 misiones) |
| Ligas de ~30 (Sí) | `duelo` y `meta_de_liga` (§3, §8) |
| Misiones diarias (Sí) | Este documento entero |
| Cosméticos ganados deterministas (Sí) | XP de misión es insumo de ese sistema (fuera de alcance); nunca aleatorio (§5) |
| Mapa de progreso, compañero (Sí) | En KINDER la única "misión" es avanzar en el mapa de la Sabana (§2) |
| Corazones/vidas que bloquean (No) | No completar ninguna misión no bloquea nada (§6) |
| Moneda comprable (No) | XP no se compra ni se convierte a moneda |
| Recompensas aleatorias de pago (No) | Ninguna recompensa de misión es aleatoria — ni pagada ni gratis (§5, extensión deliberada de la letra de D-014) |
| Notificaciones con culpa (No) | Fuera de alcance (§9); si existieran, mc-19 exige 1/día al padre, sin culpa |
| Comparación pública de niños por nombre (No) | `meta_de_liga` muestra solo el agregado (§8) |

## 12. Consideraciones i18n

- Volumen de texto: 10 tipos × ~3 cadenas (título, plantilla de progreso,
  mensaje de logro) × 7 locales ≈ **210 cadenas**, autoradas por locale y no
  traducidas (D-005, `mc-34`) — un orden de magnitud menor que las ~2,401 voces
  de F6, porque KINDER no necesita audio nuevo (§2).
- Todo número visible ("2 de 3", "150 retos entre todos") pasa por
  `packages/motor/src/numeros.ts`/`convenciones.ts`, nunca se escribe a mano —
  `audits/notacion-locale.mjs` lo cubre.
- Los identificadores de tipo (`volumen`, `duelo`...) son claves internas, no
  texto de cara al niño — el texto real vive en los archivos de locale, mismo
  patrón que `HABILIDADES_KINDER` en F6 (viaja la clave, nunca el valor).

## 13. Preguntas resueltas con investigación externa

Ver §7 (cifra de 3 misiones simultáneas, Duolingo + Cowan) y §5 (D-014 leída
con cuidado, mc-17/mc-43).


## Preguntas al dueño

- ¿3 misiones simultáneas para PRIMARIA en adelante, o 2? El corpus no da una cifra para esta edad; investigación externa: Duolingo usa 3 (corroborado en fuentes secundarias, no en un post oficial), y Cowan (2010) fija ~4±1 como techo de memoria de trabajo ADULTO, con niños de 7-11 aún subiendo hacia ese techo. 3 aprovecha el precedente de Duolingo y es más simple; 2 es más conservador porque a esa edad la capacidad real es menor que el techo adulto que 3 casi alcanza.
- ¿SERIO (la franja adulta N8-N10, única banda ≥7 con contenido en el MVP) usa el mismo tope de 3 misiones que PRIMARIA, o uno mayor dado que la memoria de trabajo adulta sí alcanza el techo de Cowan (~4±1)? Un solo número es más simple de mantener; un tope mayor para adultos aprovecha mejor su capacidad real, a costa de una segunda configuración.
- ¿El avance en la Sabana de KINDER debe contarse como 'misión completada' en la analítica del panel del padre, o queda fuera de esa métrica y se reporta solo como parte de la racha ya existente? Contarlo infla una tasa de 'misiones completadas' que en KINDER es indistinguible de 'jugó hoy'; no contarlo deja a KINDER sin fila propia en esa métrica.
- ¿Hay apetito por notificaciones push de recordatorio de misión en v1 (dirigidas al padre, máximo 1/día, per mc-19), o queda completamente fuera de F7 y se revisita al diseñar F8 · Padres? Cambia si este subsistema necesita coordinarse con Web Push ahora o más adelante.


---

## 4. Mapa de progreso y compañero

# f7-mapa-progreso-companero

Ver el documento completo en `docs/planes/f7-juego.md`, escrito con el mismo rigor que `f5-contenido-kinder.md` y `f6-larry-profe.md`: hechos medidos donde existen, `[criterio]` donde es elección propia, `[contrato asumido]` donde depende de F4 (que aún no tiene código), crítica adversarial del propio diseño, y preguntas al dueño explícitas en vez de inventadas.

## Las dos preguntas que el encargo pedía resolver con evidencia

**¿Qué es "el mapa"?** No es la Sabana de D-019. La Sabana es la instancia de la banda KINDER (14 lugares = las 14 habilidades K01-K14, arte ya presupuestado por D-019/F5). El "mapa de progreso" de D-014 es un marco transversal a las seis bandas — evidencia: (1) F5b prohíbe explícitamente Sabana y modo historia en la franja adulta, así que si mapa=Sabana, la franja adulta no tendría mapa, contradiciendo que D-014 lo lista junto a XP/rachas que sí son universales; (2) F7 depende de F4, que cubre las seis bandas, no solo kinder; (3) `mc-43` §8 trae, ya investigado, un diseño de progreso banda por banda (KINDER=camino sin números, PRIMARY=árbol de habilidades, TEEN=dashboard con liga opt-in, ADULT=métricas numéricas planas, skin gamificado apagado por defecto) — exactamente la forma que este documento adopta.

**¿Qué es "el compañero"?** Ningún documento del repo lo define. Se decide (propuesto, no consumado) que es **Larry mismo** con una capa acotada de accesorios deterministas — no una mascota nueva — por tres razones con evidencia: `mc-43` §7 (Calvert/Elmo) muestra que un personaje YA familiar enseña mejor que uno nuevo, y Larry ya es familiar (D-004); `mc-43` §6 documenta que el mecanismo de retención de un compañero-Tamagotchi y el mecanismo de culpa que lo hizo famoso son el mismo mecanismo, y la propia investigación deja sin resolver si vale la pena construir uno incluso sin la amenaza — Larry-compañero no tiene estado de vida/hambre, así que el riesgo desaparece por construcción; y reusa el pipeline de arte de Larry ya presupuestado (CLAUDE.md § Imágenes) en vez de abrir un segundo personaje con su propio costo de diseño, revisión de marca y voz en 7 locales.

## Diseño concreto

- **XP** = el mismo número que "puntos" (D-010/D-024), agregado de por vida — nunca una segunda fórmula (evita repetir el error que `motor-puntuacion.mjs` existe para impedir). Los "niveles" de D-014 son los 12 de D-017, sin escala de jugador nueva que colisione de nombre.
- **Racha**: cumplida por 1 reto/día, corte de pantalla siempre cuenta (D-016/D-014), fecha LOCAL del niño no UTC (mismo hallazgo que F6 hizo para el tope de gasto de Larry), 1 día de gracia/semana no vendible ni acumulable (`[criterio]`, marcado como pregunta al dueño), reinicio del padre sin culpa (mc-19 imp. 8).
- **Misiones**: recompensa siempre fija, nunca aleatoria (mc-17 imp. 3), nunca falla por límite de pantalla. Catálogo contado de verdad contra el contenido real del MVP (kinder + franja SERIO N8-N10, D-034): de 8 plantillas candidatas, solo 6 tienen contenido para ejecutarse hoy — 3 universales, 2 solo-KINDER, 1 solo-SERIO. No se declara "90 misiones" ni ningún número redondo sin haberlas listado.
- **Ligas de ~30**: reusa `math-challenge-league-do` (ya inventariado, sin objeto Cloudflare nuevo). Cohortes nunca cruzan banda de edad (D-003, mc-16 imp. 5); ascenso 15-20% superior, descenso solo 10% inferior entre activos, inactividad congela (mc-18 imp. 5, ya citado en master-plan §6). "Liga sombra" propuesta para el arranque en frío (<15 activos), marcada como `[criterio]`/pregunta al dueño.
- **DUELO** (quinto modo de D-018, sin implementar en F3): diseñado como feature de liga — mismo set de ítems, mismo total semanal, sin tercera cifra de "ELO de duelo". Verificación honesta contra el contenido real: KINDER excluido por edad, PRIMARIA/SECUNDARIA sin contenido en el MVP, así que **DUELO solo es funcional en la banda SERIO durante el MVP** — dicho de frente para que nadie prometa duelos para niños de 9 años en el lanzamiento.
- **Tablero global**: ya diseñado por D-025/D-040; F7 construye el mecanismo concreto (opt-in en `child_game_state`, rollup a KV, cadencia diaria propuesta `[criterio]`) reusando `leaderboard-rollup-workflow`/`leaderboard-kv` ya inventariados.
- **El mapa no tiene tabla propia** — es una vista compuesta sobre `skill_state` (F4, `[contrato asumido]`), `EstadoHistoria` (ya existe en `historia.ts`/F3) y el nuevo estado de F7. Evita una segunda fuente de verdad de progreso.
- **Mapa por banda**: KINDER = envoltura sobre la Sabana existente, sin números (D-019, mc-43 §8). PRIMARIA/SECUNDARIA = árbol de habilidades agrupado por nivel, **sin aristas de prerrequisito** — porque F5 §4.8 bloqueo 10 ya encontró que ese campo no existe en la tabla `skills`; diseñar el árbol con flechas antes de que exista el dato repetiría ese error a propósito. Declarado sin datos que mostrar en el MVP porque no hay contenido de PRIMARIA/SECUNDARIA (D-009/D-034). SERIO/JR/PRO = dashboard numérico, compañero apagado por defecto (mc-43 §8-9).
- **Cosméticos**: mecanismo fijado (1 accesorio determinista por lugar de Sabana completado, 14 nodos, reusa arte ya presupuestado — no abre línea de presupuesto nueva), catálogo real de arte fuera de alcance (como F5 con el contenido de kinder). Consecuencia dicha de frente: con SERIO teniendo el compañero apagado por defecto, el catálogo de cosméticos del MVP solo tiene audiencia en KINDER.

## Mapeo a la tabla D-014

Sección dedicada en el documento (§11) que recorre las 6 filas "Sí" y las 5 filas "No" una por una, mostrando exactamente qué parte de este diseño implementa cada "Sí" y qué mecanismo concreto impide cada "No" (nunca un campo de vidas, nunca una tabla de moneda, nunca una tirada aleatoria en el camino de recompensa, notificaciones sin copy de culpa, mapa/compañero estrictamente privados al perfil+padre).

## Auditores propuestos (6 nuevos deterministas, 0 adversariales nuevos)

`gamificacion-lista-negra.mjs`, `racha-no-penaliza-limite.mjs`, `tablero-orden-puntos.mjs` (protege D-025 y cita su condición de revisión), `liga-mismo-banda.mjs`, `duelo-edad-minima.mjs`, `cosmetico-determinista.mjs` — todos con caso plantado en `audits/pruebas-auditores.mjs` per D-032. Se amplía el alcance declarado de dos adversariales ya existentes (`rachas-y-tiempo-de-pantalla`, `patrones-oscuros`) en vez de crear más, siguiendo la disciplina anti-inflación de la flota que D-032 ya pide.

## Crítica adversarial aplicada al propio diseño (encontrada al escribir, no declarada)

1. Colisión de nombre entre "nivel de jugador" (gamificación) y "nivel" de dificultad (D-017) — resuelta no creando una segunda escala.
2. XP vs. puntos de liga podían leerse como dos sistemas — resuelto: mismo cálculo, distinta ventana de agregación (de por vida vs. semanal).
3. El árbol de habilidades de PRIMARIA/SECUNDARIA presuponía un campo de prerrequisito que F5 §4.8 ya documentó que no existe — resuelto rediseñando sin aristas en vez de fingir que el dato está.
4. "DUELO, 8+ años" sonaba a feature de niños grandes hasta cruzarlo contra el contenido real del MVP — solo SERIO tiene edad y contenido a la vez; declarado explícitamente.
5. El catálogo de cosméticos prometido por D-014 solo tiene audiencia real en KINDER dado que SERIO tiene el compañero apagado por defecto — declarado en vez de ocultado.
6. "90 misiones" habría sido fácil de declarar sin verificar — se listaron 8 plantillas candidatas y se comprobó cuáles tienen contenido ejecutable hoy: 6, no un número redondo.

## Investigación externa usada para resolver preguntas que el repo no cerraba

- `mc-43-avatars-identity-progression.md` §6-§9: resuelve tanto la pregunta del mapa por banda como la del compañero, con cita a Calvert (Elmo/familiaridad) y a la historia de Tamagotchi (retención = mecanismo de culpa).
- `mc-18-leaderboards-competition.md` implicación 5: números concretos de ascenso/descenso suave, ya citados en master-plan §6, aquí aplicados a la implementación de liga.
- `mc-17-ethical-gamification-dark-patterns.md` implicación 3 y 6: fundamento de "nunca aleatorio, nunca comprable" aplicado a cosméticos y misiones, no solo a la lista de D-014.
- `mc-19-habit-loops-push-notifications.md` implicación 8: el reinicio de racha del padre sin culpa.

No se hizo búsqueda web adicional: las preguntas que el encargo anticipó ("compañero no definido con detalle") ya las resolvía `mc-43`, ya presente en el corpus del repo — no hacía falta salir a investigar de nuevo lo que `mc-16/17/18` ya cubren bien, según la instrucción del encargo.

## Preguntas al dueño

- ¿El compañero es Larry con accesorios pequeños (propuesto), o prefieres una mascota nueva y separada? Alternativa A (Larry): cero costo de arte adicional, reusa el pipeline ya presupuestado, cero riesgo de diluir el canon de D-004 con un segundo personaje, pero comparte superficie visual con la voz cuidadosamente protegida de F6. Alternativa B (mascota nueva): más libertad de mecánica y de diseño visual, pero abre un frente nuevo de diseño de personaje, revisión de marca y potencialmente audio en 7 locales que hoy no está en ningún presupuesto.
- ¿1 día de gracia por semana para la racha es el número correcto? Alternativa A: 1/semana como se propuso. Alternativa B: ninguna gracia adicional más allá de la regla de D-016 (el corte de pantalla ya protege la racha; una gracia extra podría ser redundante). Alternativa C: otra cadencia, p. ej. 2 al mes, si prefieres un ciclo mensual sobre semanal.
- ¿El tablero global se recalcula diario o con otra cadencia? Alternativa A: diario (legible, barato, propuesto). Alternativa B: semanal, alineado al ciclo de liga (menos cómputo, tablero más lento). Alternativa C: otra cadencia si hay una medición de costo de Analytics Engine/Workflow que este documento no tiene.
- ¿15 miembros activos es el umbral correcto para formar una 'liga sombra' que no desciende a nadie en el arranque en frío? Alternativa A: 15, como se propuso. Alternativa B: un número más alto, para exigir ligas más llenas antes de arriesgar cualquier descenso. Alternativa C: no construir liga sombra — simplemente no formar liga hasta juntar ~30, y el niño juega en modo práctica sin liga esa semana.


---

## 5. Ligas de ~30

# F7 · Ligas de ~30


# F7 · Ligas de ~30 — diseño operativo

> Subsistema de F7 ("Juego"). F7 no tiene ninguna issue todavía; este documento
> cubre **solo Ligas** — no XP, no rachas, no misiones, no mapa, no tablero
> global (D-003 los trata como estructuras separadas). Sigue la forma de
> `docs/planes/f5-contenido-kinder.md` y `f6-larry-profe.md`: cifras que se
> intentaron romper antes de escribirlas, una crítica adversarial contra el
> propio diseño, y preguntas sin inventar respuesta donde de verdad hace falta
> el dueño.

## 0. Hallazgo que reordena todo lo demás: Ligas NO depende de F4

El master-plan (§13.2) pone "F7 · Juego | Depende de: F4". Revisado contra lo
que Ligas necesita de verdad, eso es cierto para el mapa de progreso y quizás
para una futura migración del tablero a θ (condición de revisión de D-025),
pero **no para Ligas**:

- El puntaje semanal de una liga es la suma de `calificar()`
  (`packages/motor/src/puntuacion.ts`, ya implementado F3) sobre los retos que
  el niño o el adulto ya completa hoy con contenido de F5/F5b.
- DUELO (§5) no necesita selección adaptativa: la equidad no viene de que el
  motor elija un ítem "parejo" para cada jugador, viene de que **los dos
  jugadores reciben el mismo set congelado** de ítems ya curados.

**Consecuencia de planeación:** las issues de este documento declaran
`Depende de: F3` (ya implementado), no F4. Se puede empezar hoy. Si esto es un
error de lectura del master-plan, es una pregunta con respuesta barata —F4
seguiría bloqueando el resto de F7 igual— pero vale decirlo de frente en vez
de heredar una dependencia que no se verificó.

## 1. Lo que ya existe y lo que falta (auditoría del estado real)

`docs/infrastructure.md` **ya** inventaría `math-challenge-league-do` ("Live
state + WebSocket broadcast for one league of ~30") y
`math-challenge-leaderboard-kv`/`-cron`/`-rollup-workflow` (esos son del
**tablero global**, fuera de este subsistema). Cero de los dos está creado
(5 de 27 objetos existen hoy). No hay una sola tabla de liga en
`migrations/*.sql` — es terreno abierto de verdad.

Dos huecos de esquema que Ligas necesita y que **no son culpa de nadie
todavía** porque nadie los había necesitado:

1. **`score_totals` (migración 0002) solo referencia `child_profiles(id)`.**
   D-034 existe precisamente porque el adulto aprendiz (`users.is_learner=1`,
   banda SERIO/JR/PRO) necesita algo contra qué competir — y hoy no hay dónde
   acumular sus puntos. Ligas no puede segmentar por banda si la mitad de las
   bandas (SERIO, JR, PRO) no tiene fila de puntaje posible.
2. **`users` no tiene `alias`/`alias_locale`.** Solo `child_profiles` los
   tiene (migración 0002, D-003/mc-43). Un adulto en una liga necesita el
   mismo velo de anonimato que un niño — D-003 no dice "alias generados para
   niños", dice "alias generados", punto.

Los dos se resuelven en la §2 de abajo, y son la primera issue de la lista.

## 2. Modelo de datos

### 2.1 Participante polimórfico, nunca mezclado

Un miembro de liga es **o un `child_profile_id` o un `user_id`, nunca ambos, y
nunca los dos tipos en la misma cohorte** — ver §7.1 para por qué esto es un
hallazgo de la crítica adversarial y no una elegancia de esquema.

```sql
-- Extiende migración 0001: el adulto aprendiz gana alias anónimo, igual que
-- el niño. Nullable porque solo aplica cuando is_learner = 1.
ALTER TABLE users ADD COLUMN alias        TEXT;
ALTER TABLE users ADD COLUMN alias_locale TEXT
  CHECK (alias_locale IN ('en','es-MX','es-ES','fr-FR','pt-BR','pt-PT','de-DE'));

-- Extiende migración 0002/0003 (o migración propia de F7): rollup semanal por
-- participante. NO reemplaza score_totals (all_time); es su análogo semanal,
-- con la llave de participante ya polimórfica.
CREATE TABLE league_cohort (
  id                TEXT PRIMARY KEY,
  banda             TEXT NOT NULL
                    CHECK (banda IN ('KINDER','PRIMARIA','SECUNDARIA','SERIO','JR','PRO')),
  tipo_participante TEXT NOT NULL CHECK (tipo_participante IN ('child','adult')),
  tier              INTEGER NOT NULL DEFAULT 1,
  week_start        INTEGER NOT NULL,
  week_end          INTEGER NOT NULL,
  status            TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
  member_count      INTEGER NOT NULL DEFAULT 0,
  created_at        INTEGER NOT NULL
);
CREATE INDEX idx_cohort_open ON league_cohort (banda, tipo_participante, tier, status)
  WHERE status = 'open';

CREATE TABLE league_membership (
  id               TEXT PRIMARY KEY,
  cohort_id        TEXT NOT NULL REFERENCES league_cohort(id),
  child_profile_id TEXT REFERENCES child_profiles(id) ON DELETE CASCADE,
  user_id          TEXT REFERENCES users(id) ON DELETE CASCADE,
  CHECK ((child_profile_id IS NOT NULL) <> (user_id IS NOT NULL)),

  points_this_week INTEGER NOT NULL DEFAULT 0,
  active_days      INTEGER NOT NULL DEFAULT 0,
  joined_at        INTEGER NOT NULL,

  final_rank       INTEGER,
  outcome          TEXT CHECK (outcome IN ('promoted','demoted','stayed','frozen'))
);
CREATE INDEX idx_membership_rank ON league_membership (cohort_id, points_this_week DESC);
```

**Por qué `tipo_participante` es columna y no se infiere de qué FK está
llena:** porque la segmentación tiene que poder consultarse ANTES de tener
miembros (para decidir en qué cohorte abierta cae un recién llegado), y porque
hace el candado "nunca mezclar niño y adulto" verificable con un solo `WHERE`
en vez de con disciplina de quien escriba la consulta — el mismo argumento que
D-027 usa para separar `child_group`/`adult_club` en tablas distintas en vez
de una con bandera.

### 2.2 Por qué NO se reusa `score_totals` tal cual

`score_totals` ya tiene `period TEXT -- 'all_time' | 'season:<id>'`, que en
teoría podría cargar 'season:2026-W32'. Se decide **no** reusarla y crear
`league_cohort`/`league_membership` aparte porque:

- `score_totals` no tiene concepto de cohorte (30 pares), de tier, ni de
  ascenso/descenso — cargarle eso la convierte en dos tablas con un nombre.
- `score_totals` es del **tablero global** (D-025 ya la referencia por
  `theme_band` + `period`); si Ligas escribe ahí también, un bug en el cierre
  semanal de liga puede corromper el tablero global, que es una superficie
  distinta con su propia decisión (D-025) y su propio Workflow ya inventariado
  (`math-challenge-leaderboard-rollup-workflow`).

## 3. Algoritmo de formación de cohortes

### 3.1 Eje de segmentación: banda + tipo de participante, nunca menos, nunca más

- **Banda** (los 6 valores de D-010/D-017, no los 5 temas): D-003 dice
  "separadas por banda de nivel" de forma literal y no se cruza — JR y PRO
  comparten tema visual pero tienen parámetros de puntuación distintos
  (D-010), así que comparten liga tampoco.
- **Tipo de participante** (`child`/`adult`): no está en ninguna decisión
  explícita, es un hallazgo de la crítica adversarial de este mismo diseño
  (§7.1) — un `child_profile` de 16 años en banda JR nunca puede caer en la
  misma cohorte que un `user` adulto de 30 años en banda JR, aunque compartan
  banda nominal.
- **Locale: se agrupa entre todos**, a propósito, sin subdividir. La
  puntuación no depende del idioma de interfaz, y a escala de MVP (kinder +
  una franja SERIO) subdividir por locale garantiza cohortes de 2-3 personas
  en la mayoría de las combinaciones. Se autoriza porque el alias ya es
  ilegible como "extranjero" — es una palabra generada, no un nombre real, y
  el jugador nunca necesita entender el alias de otro para competir contra él.
  **Condición de revisión** (mismo patrón que D-025): cuando una combinación
  (banda, locale) sostenga ≥90 jugadores activos por semana durante 4 semanas
  seguidas, se puede subdividir esa combinación por locale sin tocar las
  demás.

### 3.2 Sin sala de espera: bin-packing continuo

Un participante nunca se queda sin liga por falta de gente:

1. Al primer reto completado de la semana (o al desactivarse la protección de
   racha semanal — ver §6), el sistema busca una cohorte `status='open'` en
   `(banda, tipo_participante, tier=1)` con `member_count < 30`.
2. Si existe, se une. Si no, se crea una cohorte nueva — **de 1 miembro si
   hace falta**. No hay umbral mínimo para "activar" una liga.
3. La cohorte queda `open` toda la semana; el domingo a las 23:59 UTC se
   cierra (`status='closed'`) y ya no acepta nuevos miembros esa semana.

**El "piso mínimo" que pedía el encargo no es un piso de existencia, es un
piso de movimiento** (§4): una liga de 2 personas existe y puntúa igual que
una de 30, pero no asciende ni desciende a nadie hasta que tenga suficientes
activos para que el movimiento no se sienta arbitrario.

### 3.3 Corte semanal en UTC fijo, y por qué eso es consecuencia y no descuido

D-016 exige que el corte de pantalla respete la hora **local** del niño. Aquí
se decide UTC fijo (lunes 00:00) para el cierre de cohorte, y es consecuencia
directa de §3.1: una cohorte agrupa varios locales/zonas horarias a propósito,
así que **no existe una única "hora local" que aplicarle**. Un corte por
familia exigiría cohortes homogéneas por zona horaria, que es exactamente la
subdivisión que §3.1 evita para no vaciar las cohortes. Se acepta el costo
(una familia en México puede ver el cierre de su liga a la mitad de una tarde
de domingo) porque la alternativa rompe el fill-rate que es el problema real
del MVP.

## 4. Ciclo de promoción y descenso

### 4.1 La cifra real de Duolingo, y su estado de verificación

**No estaba en mc-16/mc-18 con el detalle necesario** (mc-16 dice "aumento de
sesiones... sin cifra exacta verificable"; mc-18 da su propia recomendación de
diseño, no la cifra real de Duolingo). Se buscó fuera del repo: fuentes
secundarias consistentes entre sí (no la documentación oficial de Duolingo,
que no publica el número) dan **30 miembros por liga, top 7 ascienden
(23.3%), bottom 5 descienden (16.7%)**, con la liga Diamante como techo sin
ascenso — de ella solo se puede descender (posiciones 26-30), y el top 5 de la
liga inferior (Obsidiana) asciende a Diamante [happilyevertravels.com,
duoplanet.com, duolingoguides.com/what-are-all-the-leagues-in-duolingo/,
duolingoguides.com/can-you-be-demoted-from-diamond-league-duolingo/]. Se cita
con el mismo cuidado que `mc-16` ya usa para sus propias cifras de Duolingo:
marcada como fuente secundaria, no verificada contra Duolingo directamente.

### 4.2 Lo que se adopta, lo que se ablanda, y por qué cada uno

| Elemento | Duolingo (real, no verificado) | Math Challenge | Por qué difiere |
|---|---|---|---|
| Tamaño de cohorte | 30 | ~30 (D-003, D-014) | Ya decidido |
| % que asciende | 23.3% (7/30) | Igual, escalado | Cifra probada a escala real; no hay evidencia de que un producto infantil necesite un ascenso más difícil |
| % que desciende | 16.7% (5/30) | Igual, **pero solo entre activos** | mc-18 impl. #5 pide explícitamente "never demote anyone active fewer than N days"; la cifra no cambia, la POBLACIÓN elegible sí |
| Techo (Diamante) | Sin ascenso, solo descenso | Tier tope configurable (constante interna, arranca en 10) | Un techo real hoy sería prematuro con el volumen del MVP; se deja el mecanismo, no una cifra final |

### 4.3 Fórmula con piso de movimiento

| Tamaño de cohorte (activos) | Ascienden | Descienden |
|---|---|---|
| < 5 | 0 (congelada) | 0 (congelada) |
| 5–9 | 1 | 1 |
| 10–29 | `round(tamaño × 7/30)`, mín. 1 | `round(tamaño × 5/30)`, mín. 1, **solo activos** |
| 30 | 7 | 5 |
| tier tope | 0 (no hay ascenso posible) | igual fórmula |

**El descenso nunca cuenta a un inactivo.** Si los últimos lugares de la
cohorte son niños que respetaron su límite de pantalla toda la semana (0
puntos, no jugaron), no cuentan para el cupo de descenso — el cupo se llena
con los activos peor ubicados, aunque estén más arriba en la tabla cruda. Es
la misma lógica de D-014 regla de racha ("la racha nunca se rompe por
respetar el límite de pantalla") aplicada a un mecanismo distinto: **el
descenso de liga tampoco castiga respetar el límite.** Esto no está escrito en
ninguna D-XXX porque D-014 habla de racha, no de liga — es una extensión
razonada de este diseño, y queda anotada como tal, no como decisión ya tomada.

**Housekeeping, no descenso:** una membresía sin actividad durante 8 semanas
seguidas se archiva en silencio (deja de contarse en `member_count`, nunca se
le notifica nada al niño ni al padre) para que el censo de una cohorte vieja
no se llene de fantasmas. No es punitivo porque nadie lo ve.

### 4.4 Qué pasa al cerrar la semana

Por cada cohorte `status='open'` con `week_end` vencido:
1. Calcular ascensos/descensos con la tabla de §4.3.
2. Escribir `final_rank` y `outcome` en cada `league_membership`.
3. Mover a cada ascendido/descendido a una cohorte abierta del tier
   correspondiente (mismo bin-packing de §3.2, un tier arriba o abajo).
4. Los que se quedan (`stayed`) y los congelados (`frozen`, inactivos)
   entran a una cohorte **nueva** del mismo tier — los puntos se reinician
   cada semana, igual que Duolingo.
5. Marcar la cohorte vieja `status='closed'`. No se borra: es el historial
   que alimenta el panel del padre y, eventualmente, cosméticos
   deterministas (fuera de este subsistema).

Esto corre como un **Workflow** (Cloudflare Workflows, mismo patrón que
`math-challenge-leaderboard-rollup-workflow`), no un Worker de cron simple:
mover cientos de membresías con reintentos idempotentes es exactamente el caso
de uso de un Workflow, y un cron desnudo que muere a medias deja cohortes en
un estado inconsistente sin forma de retomar.

## 5. DUELO

### 5.1 Elegibilidad

- **Dentro de tu liga, nunca fuera.** D-018: "mismo set contra tu liga" —
  literal, no hay matchmaking global. Un reto se dirige a un miembro
  específico de la cohorte actual.
- **8+ años, calculado desde `birth_year`** (D-053 solo guarda el año, así que
  la edad tiene el mismo margen de ±1 que ya acepta el resto del producto).
  Como KINDER llega hasta 6 años, DUELO **nunca existe en banda KINDER** — la
  restricción de edad y la de banda coinciden y se refuerzan.
- **Opt-in, default apagado, para `child_profile`** — lo dice D-018
  literalmente ("opt-in"), lo activa el padre en la configuración del perfil,
  mismo patrón que D-040 usó para el tablero global.
- **Para `user` adulto (`is_learner=1`), default encendido.** La razón de
  opt-in en D-018 es proteger al menor; un adulto consintiendo para sí mismo
  no necesita la misma puerta — es coherente con cómo D-026/D-038 tratan el
  registro de adulto contra el de niño.

### 5.2 Mecánica: asíncrono, nunca en vivo

Se decide **asíncrono** (reto pendiente con ventana de 48 h), no
emparejamiento en tiempo real, por tres razones:

1. **No hace falta infraestructura nueva de sincronización de dos jugadores.**
   Cada duelista juega su propia instancia de `math-challenge-sesion-reto-do`
   (F3, ya construido), sembrada con **el mismo listado congelado de
   `itemId`s** en vez de con selección adaptativa en vivo — así los dos
   enfrentan literalmente el mismo problema, que es lo que hace justa la
   comparación (no la sincronía).
2. **No revela presencia.** Un duelo en vivo necesitaría mostrar "fulano está
   conectado ahora" para poder emparejar — eso es un canal de información
   sobre un niño específico que hoy no existe en ningún otro lugar del
   producto. Asíncrono lo evita por construcción.
3. **Coincide con D-018:** "reloj: sí" en la tabla de modos ya asume que cada
   quien juega su propio intervalo cronometrado, no una carrera compartida.

Tabla `league_duel`:

```sql
CREATE TABLE league_duel (
  id                      TEXT PRIMARY KEY,
  cohort_id               TEXT NOT NULL REFERENCES league_cohort(id),
  challenger_membership_id TEXT NOT NULL REFERENCES league_membership(id),
  challenged_membership_id TEXT NOT NULL REFERENCES league_membership(id),
  item_set                TEXT NOT NULL,   -- JSON: array de itemId, congelado al crear
  status                  TEXT NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending','completed','expired')),
  created_at              INTEGER NOT NULL,
  expires_at              INTEGER NOT NULL,   -- created_at + 48h
  challenger_points       INTEGER,
  challenged_points       INTEGER,
  winner_membership_id    TEXT REFERENCES league_membership(id)  -- NULL si empate o expiró
);
```

- Los puntos del duelo **son puntos normales**: se calculan con
  `calificar()` sin ningún cambio, y se suman al `points_this_week` de la
  liga como cualquier otro reto — DUELO no es un sistema de puntuación
  paralelo, es una composición especial de reto (mismo patrón que
  PRÁCTICA/FLUIDEZ/PROBLEMA/HISTORIA en D-018).
- Ganar el duelo se decide por puntos totales en el set compartido, nunca por
  "quién llegó primero" en tiempo real (evita convertir el duelo en pura
  velocidad, que es exactamente lo que D-025/mc-18 ya advierten sobre premiar
  volumen sobre dificultad).
- **Sin recompensa aleatoria ni cosmético en este subsistema.** `winner_membership_id`
  queda expuesto para que un futuro subsistema de cosméticos lo use de forma
  determinista (D-014: "cosméticos ganados, deterministas" es sí; nada
  aleatorio se construye aquí).
- **Límite anti-acoso:** máximo 3 retos pendientes salientes por perfil a la
  vez. Rechazar es silencioso — el reto simplemente expira sin avisarle al
  retador que fue rechazado, para no convertir un "no, gracias" de un niño de
  ocho años en una fricción social visible.
- **Aviso al retado:** una notificación, tono neutro, sin cuenta regresiva ni
  urgencia ("Alguien de tu liga te retó a un duelo" — no "¡Solo te quedan 3
  horas!"), siguiendo mc-19 (implementation-intention, no urgencia fabricada)
  y la prohibición de "nagging" de mc-17. Se manda una vez, no se repite si no
  se abre.

### 5.3 Honestidad sobre quién puede usar DUELO en el MVP de verdad

D-009/D-034 dejan el MVP con **kinder completo + franja SERIO N8-N10**.
PRIMARIA y SECUNDARIA (donde vive el "8+ años" real de D-018) **no tienen
contenido en el MVP**. Consecuencia dicha de frente: en el día uno, DUELO solo
tiene jugadores reales en banda SERIO (adultos aprendices) — el caso de uso
que D-018 describe (niño de 8-11 retando a un compañero de liga) queda
construido y probado con datos sintéticos hasta que una fase futura de
contenido de PRIMARIA/SECUNDARIA exista. No es una razón para no construirlo
—la lógica no depende de la edad del contenido— pero es una razón real para
preguntarle al dueño si vale la pena en el orden de entrega (pregunta 4).

## 6. Visibilidad social y privacidad

### 6.1 Qué ve un miembro de otro miembro de su liga

Avatar (piezas predefinidas, D-012/mc-43), alias, puntos de esta semana,
racha, posición. **Nunca:** nombre real, edad exacta, otras ligas o grupos a
los que pertenezca, puntaje histórico total. La lista de "qué sí" replica
exactamente lo que D-027 ya autoriza que vea el **dueño** de un
`child_group` sobre sus miembros ("alias, puntos y racha") — aquí se extiende
a visibilidad **entre pares**, que es una relación distinta y no estaba
cubierta por ninguna decisión explícita; se documenta así por consistencia
con el precedente, no porque D-027 lo diga literalmente.

### 6.2 Default por banda — resuelve el pendiente que D-003 dejó abierto

D-003 dice explícitamente "leer mc-10 antes de fijar el default" para el
riesgo de tableros públicos con niños chicos. mc-10 impl. #3 lo responde:
*"Public leaderboards should not be shown to young children by default."*
Se decide:

- **KINDER (4-6): opt-in, default APAGADO.** El padre lo activa, mismo patrón
  de D-040 para el tablero global. Si se activa, la posición se muestra en
  **tercios** (arriba/medio/abajo de la cohorte), nunca el número exacto —
  mc-18 impl. #7: "never show the literal last-place rank number to a child
  by default."
- **PRIMARIA en adelante: default ENCENDIDO**, posición numérica exacta
  permitida. El umbral fino (¿desde qué edad exacta dentro de PRIMARIA?) es la
  pregunta 2 de abajo — mc-10 impl. #2 sugiere un corte más cerca de los 8-9
  años que del arranque de PRIMARIA a los 7.

### 6.3 Lo que NO se construye en este subsistema

Reaccionar/"animar" a un compañero de liga sin chat es una pregunta real del
encargo, y la respuesta depende de si el dueño quiere pagar esa superficie
ahora — ver pregunta 1. Si se construye: reacción de **un toque**, conjunto
cerrado de íconos (no texto), y **agregada y anónima** — un niño ve "3
compañeros te animaron" y nunca quién, para no crear un canal dirigido y
repetible entre dos niños específicos, que es justo el patrón que D-027/mc-46
identifican como el riesgo real ("contacto no supervisado" entre pares, aquí
entre menores en vez de adulto-menor, pero el mecanismo de "canal repetible
entre dos identidades" es el mismo).

## 7. Crítica adversarial de este mismo diseño

### 7.1 El hallazgo real: JR/PRO puede mezclar niño y adulto

La primera versión de este diseño segmentaba solo por banda (los 6 valores de
D-010), asumiendo — sin verificarlo — que SERIO/JR/PRO son exclusivamente
`users` adultos y KINDER/PRIMARIA/SECUNDARIA exclusivamente `child_profiles`.
Eso es cierto para SERIO (D-034 lo define como franja adulta) pero **no está
garantizado para JR**: "JR (olimpiada)" en D-010 no fija edad, y en la
realidad de las olimpiadas de matemáticas la mayoría de los competidores son
menores de edad. Si algún día `child_profiles.theme_band` se amplía para
admitir JR (hoy su CHECK solo permite KINDER/PRIMARIA/SECUNDARIA — otro hueco
de esquema, ver pregunta 3), una cohorte JR segmentada solo por banda podría
sentar a un adolescente de 16 años (`child_profile`, alias sin identidad) en
la misma liga que un adulto de 30 (`user`, autoconsentido) — un adulto
desconocido con visibilidad de puntos/racha/alias de un menor, y la capacidad
de retarlo a DUELO. Eso es exactamente el tipo de "contacto no supervisado
entre un adulto y un menor" que D-011/D-027/mc-46 tratan como la categoría de
riesgo a eliminar por diseño, no a mitigar con reglas.

**Corrección aplicada, no solo anotada:** §2.1/§3.1 ya incorporan
`tipo_participante` como eje de segmentación de primera clase, separado de
banda. Un `child_profile` y un `user` **nunca** comparten `league_cohort`,
sin importar qué banda declaren. El costo es una cohorte JR-niño y una
JR-adulto que pueden quedar ambas muy vacías al inicio — aceptable, porque el
`league_cohort` de piso mínimo (§3.2) ya tolera cohortes de 1.

### 7.2 Lo que este diseño NO resuelve

- **`child_profiles.theme_band` no admite JR/PRO hoy.** Si un menor de 16
  años en olimpiada existe como caso real, hace falta ampliar ese CHECK antes
  de que Ligas pueda darle una cohorte — no es trabajo de este subsistema,
  pero bloquea una parte de él. Ver pregunta 3.
- **La fórmula de §4.3 nunca se corrió contra tráfico real.** Los porcentajes
  vienen de una fuente externa no verificada (§4.1) y de una recomendación de
  investigación (mc-18), no de datos propios — no hay datos propios porque el
  producto no existe todavía. Se anota la misma condición de revisión que
  D-025 usa: reevaluar cuando haya semanas reales de datos.
- **El "housekeeping" de 8 semanas (§4.3) es un número inventado**, sin cita.
  Se marca `[criterio propio]` a propósito en vez de vestirlo de evidencia.
- **Un padre que activa DUELO no tiene forma de desactivarlo a mitad de una
  semana sin dejar duelos pendientes huérfanos.** Este diseño no especifica
  qué pasa con un `league_duel` `pending` si el retado se desactiva DUELO
  antes de responder — se propone que expire igual que si no hubiera
  respondido, pero no se decidió con la misma profundidad que el resto.
- **No cubre el tablero global**, que es una estructura separada (D-003) con
  su propio Workflow ya inventariado. Un lector que busque ahí el ranking
  cross-banda no lo va a encontrar en este documento a propósito.
- **No cubre XP, rachas, misiones, mapa ni cosméticos** — son subsistemas
  hermanos de F7, fuera de este encargo.

## 8. Mapeo explícito a D-014

| D-014 | Cómo aparece en Ligas |
|---|---|
| **Sí** — Ligas de ~30 | Es este subsistema completo |
| **Sí** — XP y niveles | Los puntos de liga REUSAN `calificar()` (D-010); no se inventa una segunda fórmula de puntos aquí |
| **Sí** — Cosméticos deterministas | `league_duel.winner_membership_id` queda expuesto para que un futuro subsistema los otorgue; nunca se decide el cosmético aquí |
| **Sí** — Rachas con red | El descenso de liga hereda la misma protección al inactivo que D-014 da a la racha (§4.3), por extensión razonada, no por cita literal |
| **No** — corazones/vidas que bloquean | Nunca existe un estado donde perder en liga o duelo bloquee seguir practicando |
| **No** — moneda comprable | No hay forma de comprar ascenso, protección de descenso, ni cupos extra de duelo |
| **No** — recompensas aleatorias de pago | Ganar un duelo o ascender nunca dispara nada aleatorio; `winner_membership_id` es determinista |
| **No** — notificaciones con culpa | El aviso de duelo pendiente y de cierre de semana usan tono neutro (§5.2), nunca cuenta regresiva ni urgencia fabricada |
| **No** — comparación pública de niños por nombre | Todo lo visible es alias (§6.1), nunca nombre real, y KINDER además oculta el número exacto (§6.2) |

## 9. i18n

- El alias ya se genera por locale (mc-43, existente); Ligas no toca ese
  generador, solo lo extiende a `users` (§2.1).
- Los números visibles (puntos, rango) se renderizan con
  `packages/motor/src/numeros.ts`/`convenciones.ts` (D-022, mc-34) — nunca se
  formatean a mano en la interfaz de liga. `1.234` en `de-DE`/`es-ES` no es
  `1,234`.
- Cualquier copy de Larry sobre ascenso/descenso/invitación a duelo se autora
  por locale, nunca se traduce palabra por palabra (D-022, D-004) y sigue la
  carta de "nunca avergüenza" de F6 — un mensaje de descenso no puede sonar a
  regaño en ningún idioma.

## 10. Auditores necesarios

**Deterministas nuevos:**
- `audits/liga-sin-fusion-cohorte.mjs` — falla si algún `INSERT`/`UPDATE` de
  `league_membership` permite `banda` distinta dentro de una `league_cohort`,
  o `tipo_participante` distinto (§3.1, §7.1). Cita: D-003, hallazgo §7.1.
- `audits/duelo-elegibilidad.mjs` — falla si el código de creación de
  `league_duel` no verifica banda KINDER excluida, edad ≥8 vía `birth_year`,
  y el flag de opt-in del `child_profile` en `true`. Cita: D-018.

**Deterministas ya existentes, extendidos a Ligas** (mismo patrón que F4 hizo
con `do-por-entidad` — "sirve también a F7... cuando lleguen"):
- `audits/do-por-entidad.mjs` — `math-challenge-league-do` debe usar
  `idFromName` sobre `cohort_id`, nunca un literal.
- `audits/tabla-bandas.mjs` — el `CHECK` de `league_cohort.banda` debe
  coincidir con las 6 bandas canónicas.
- `audits/child-free-text.mjs` — ninguna columna de `league_cohort`,
  `league_membership` o `league_duel` acepta texto libre.
- `audits/no-attempts-in-d1.mjs` — `league_duel.item_set` guarda IDs, nunca
  intentos ni respuestas.
- `audits/motor-puntuacion.mjs` — el camino de puntuación de duelo llama
  `calificar()`, no reimplementa la fórmula.

**Adversariales — gap real encontrado, no hipotético:** las cartas
`privacidad` y `patrones-oscuros` (`audits/adversarial/cartas.mjs`) tienen
lista de citas autorizadas fija (D-032 enmienda: "un auditor solo puede
invocar lo que su carta le autoriza"). Hoy:
- `privacidad` cita `[LR-2, LR-3, D-012, D-013, D-027, mc-25, mc-27, mc-30]`
  — **no incluye D-003, D-040, D-043**, que son exactamente las decisiones que
  gobiernan alias/opt-in de liga. Sin extender la carta, este auditor no
  puede señalar una violación del opt-in de KINDER (§6.2) aunque la vea.
- `patrones-oscuros` cita `[LR-4, LR-5, LR-6, D-014, D-016, D-021, D-026,
  mc-16, mc-17, mc-19, mc-41]` — **no incluye D-003, D-025, D-040, mc-18**,
  que son las fuentes que definen qué es una presión de descenso indebida en
  una liga.

Es el mismo patrón que F6 encontró con `anti-humillacion` y `mc-11`: la carta
existe, pero no puede citar lo que necesita para vigilar el subsistema nuevo.

## 11. Qué NO incluye este subsistema

- El tablero global con alias (estructura separada de D-003, su propio
  Workflow ya inventariado).
- XP, rachas, misiones diarias, mapa de progreso, cosméticos — subsistemas
  hermanos de F7.
- El salón del maestro (F9, tabla `child_group`, su propio
  `math-challenge-classroom-do`) — comparte la filosofía de "solo alias,
  puntos y racha" pero es una estructura de datos distinta.
- Verificación legal de la posición de "juego ilegal" para DUELO — DUELO no
  tiene prenda ni apuesta (eso es F10/`adult_club`), así que el análisis de
  mc-46 §1 (premio/azar/consideración) ni siquiera aplica aquí.
- Ampliar `child_profiles.theme_band` para admitir JR/PRO — depende de la
  respuesta a la pregunta 3.


## Preguntas al dueño

- ¿Se construye el mecanismo de "animar" (reacción cerrada, agregada y anónima, sin texto) a un compañero de liga en este subsistema, o se difiere a una fase posterior? No hay ninguna decisión que lo exija; construirlo ahora agrega una superficie de contacto entre menores que D-027/mc-46 tratan como riesgo a eliminar por diseño, no a mitigar.
- ¿El umbral de mostrar posición exacta vs. tercios en el ranking es por banda (KINDER=tercios, PRIMARIA en adelante=exacta, mi propuesta, más simple de construir) o por edad más fina dentro de PRIMARIA (p. ej. tercios hasta los 8 años, exacta desde los 9, más fiel al corte de mc-10 en ~grado 3/8 años)?
- ¿JR (olimpiada) admite menores de edad (`child_profile`) o es exclusivamente para adultos (`users.is_learner=1`)? Si admite menores, hay que ampliar el CHECK de `child_profiles.theme_band` (hoy solo permite KINDER/PRIMARIA/SECUNDARIA) y el particionamiento niño/adulto de la cohorte JR se vuelve obligatorio desde el lanzamiento de esa banda, no una previsión a futuro.
- DUELO, tal como lo describe D-018, sirve principalmente a niños de 8-11 años retando a un compañero de liga — pero esa banda de contenido (PRIMARIA) no existe en el MVP (D-009/D-034 solo traen kinder + franja adulta SERIO). ¿Se construye el issue de DUELO ahora igual (queda listo, se prueba con la banda SERIO de adultos) o se difiere hasta que exista contenido de PRIMARIA/SECUNDARIA, que es donde su caso de uso real vive?


---

## 6. Tablero global con alias generados

# F7 · Tablero global con alias generados


# F7 · Tablero global con alias generados — diseño operativo

> Subsistema de F7 dentro de "Producto". F7 no tiene ninguna issue de GitHub
> todavía; este documento cubre **solo** el tablero global con alias
> generados — no XP, no rachas, no misiones, no ligas de ~30, no el mapa de
> progreso. Esas son otras piezas de D-003/D-014 y quedan fuera a propósito
> (ver "Qué NO incluye" de la issue paraguas).

## 0. Lo que ya existe, y que este diseño hereda en vez de repetir

Antes de diseñar nada se leyó el código real, no solo la documentación. El
hallazgo central: **F7 ya tiene la mitad de su cimiento construido por F2/F3,
sin que ninguna issue de F7 exista todavía.**

| Pieza | Dónde vive | Estado |
|---|---|---|
| Alias generados por locale (7 listas, autoradas, no traducidas) | `packages/motor/src/alias.ts` | Hecho, con pruebas |
| UI de elegir alias (6 opciones, botón "Otro") | `apps/web/src/components/paginas/PerfilNuevo.astro` | Hecho |
| `score_totals` — acumulado por niño, por periodo, por banda, con índice `(period, theme_band, total_score DESC)` | `migrations/0002_child_profiles.sql:125-139` | Hecho |
| El rollup por lotes que llena `score_totals` (30-60s, nunca por intento) | `packages/motor/src/rollup.ts` | Hecho, con pruebas |
| El código de consentimiento `LEADERBOARD` en el catálogo, y la regla de que el opt-in **no** se activa al crear el perfil | `migrations/0003_accounts_onboarding.sql:68,186,211-213`; `apps/web/src/pages/api/perfil-nuevo.ts` | Hecho |
| La marca contextual `TABLERO_OPTIN` | `migrations/0003_accounts_onboarding.sql:186` | La tabla existe; nada la dispara todavía |
| Infraestructura **planeada pero no creada**: `math-challenge-leaderboard-cron`, `math-challenge-leaderboard-kv`, `math-challenge-leaderboard-rollup-workflow`, `math-challenge-league-do`, `math-challenge-classroom-do` | `docs/infrastructure.md:50,52-53,59,68` | Listadas en el inventario, ausentes de la bitácora de creación — alguien ya pensó la forma general y nunca abrió la issue |

Esto cambia el diseño de raíz: **no hay que inventar el modelo de datos del
lado de escritura.** Lo que falta es el lado de **lectura** (cómo se
convierte `score_totals` en algo que un padre o un niño puede ver sin pegarle
a D1 en cada carga de página) y el mecanismo real de activación/desactivación
(la tabla de consentimiento existe; el endpoint que la usa, no).

## 1. Dos hallazgos adversariales antes de diseñar una sola línea nueva

Siguiendo la regla de oro del proyecto (ninguna cifra sin haber intentado
tumbarla), se auditó el código existente que este subsistema va a heredar.
Salieron dos problemas reales, verificados con comandos re-ejecutables — no
apreciaciones.

### 1.1 El alias no es único, aunque el código diga que sí (bug de F2)

`perfil-nuevo.ts` tiene un comentario que afirma: *"El alias tiene índice
único por padre (migración 0003)"*. `grep -rn "alias" migrations/*.sql`
no encuentra ningún `UNIQUE` cerca de `alias` en ninguna migración. El
`catch` que busca `UNIQUE` en el mensaje de error de D1 es código muerto.

Verificado con `node`:
```
node -e 'const c=12*10*9000; let p=0,l=0; for(let i=0;i<1000;i++) l+=Math.log((c-i)/c); console.log((1-Math.exp(l))*100)'
```
Con **1,000 niños** en un solo locale (es-MX), la probabilidad de que **al
menos dos** compartan el mismo alias es **37.04%**, no "raro". Con 2,000,
84%. Y `es-MX`/`es-ES` comparten 11 de 12 sustantivos y los 10 adjetivos
completos — dos locales distintos pueden producir literalmente la misma
cadena. Esto **no es un detalle cosmético para F7**: dos filas indistinguibles
en el mismo tablero global rompen la premisa entera de que el alias identifica
una posición. Se archiva como issue de **F2** (donde vive el bug), no de F7,
siguiendo el mismo patrón que F6 usó con el bug de K12 de F5 — la fase que lo
encuentra no siempre es la fase que lo arregla.

### 1.2 SERIO/JR/PRO no pueden tener tablero con el esquema actual

`score_totals.child_profile_id` tiene `REFERENCES child_profiles(id)`, y
`child_profiles.theme_band` solo admite `KINDER`/`PRIMARIA`/`SECUNDARIA`
(`CHECK` en la migración 0002). Un adulto que juega para sí mismo en banda
SERIO, JR o PRO **no tiene fila de `child_profiles`** —
`perfil-nuevo.ts` rechaza explícitamente crear un perfil con esas bandas
("esta persona necesita su propia cuenta", D-034)— y por lo tanto no puede
tener fila en `score_totals`. El propio `health.ts` lo confirma: su prueba de
humo llama `recordAttempt` con banda `SERIO` pero **evita a propósito**
probar el rollup a D1, porque fallaría con `FOREIGN KEY constraint failed`.

D-010 pone tabla de puntuación para las **seis** bandas (incluidas
SERIO/JR/PRO); D-034 justifica la franja adulta del MVP explícitamente
"para que los clubs de adultos tengan de qué competir" — y hoy no existe
ningún lugar donde ese "de qué competir" pueda vivir. Se resuelve con una
tabla `score_totals_adulto` separada (no una columna nullable ni un
discriminador), siguiendo el mismo patrón que D-027 ya fijó para
`child_group`/`adult_club`: dos estructuras, no una con un `tipo`, para que
una consulta que junta "todo el tablero" no pueda alcanzar por descuido una
tabla de niños desde el lado adulto ni viceversa.

## 2. Operacionalizar D-025: ¿top-N? ¿por banda? ¿con qué frecuencia?

D-025 ya decidió ordenar por puntos, no por θ, con condición de revisión a
≥200 respuestas por ítem. Lo que faltaba decidir:

- **Por banda:** ya resuelto por el esquema — `theme_band` es la columna de
  segmentación y ya tiene índice compuesto. Un tablero por
  `(period, theme_band)`. Esto además **mitiga en la práctica** la crítica de
  `mc-18`/`mc-44` que D-025 ya reconoce no resolver del todo: nunca se compara
  a un niño de 6 años sumando contra un adulto en topología, porque nunca
  comparten tablero — la segmentación por banda hace estructuralmente
  imposible el ejemplo que ambas investigaciones usan para objetar el diseño,
  aunque no resuelva el problema más fino que señalan dentro de una misma
  banda.
- **Top-N mostrado:** **100** posiciones numeradas por `(period, theme_band)`
  para las bandas SECUNDARIA+, más "tú estás aquí" fuera del top 100.
  `[criterio propio]` — ninguna fuente da un número; Duolingo eligió 30 para
  su unidad de ~30, que es el tamaño de una **liga**, no de un tablero global,
  así que no es el número correcto aquí. Se declara como criterio, no como
  ciencia, igual que la tabla de D-016.
- **Frecuencia:** el lado de **escritura** (`score_totals`) ya está fijado en
  30-60s por F3/rollup.ts — no se toca. El lado de **lectura** (recalcular el
  ranking completo y publicarlo en KV) se propone en **5 minutos**,
  `[criterio propio]`: ningún niño en una sola sesión de 20-45 minutos
  (D-016) va a notar que su posición no cambia en vivo, y recalcular un
  `ORDER BY` completo sobre toda la tabla más seguido que eso cuesta sin dar
  nada a cambio.

## 3. La escalera de visibilidad por banda (la pregunta sugerida del enunciado)

La investigación del repo **no** da un número mágico de "cuántas posiciones
mostrar sin ansiedad", pero sí da la arquitectura correcta, y de ahí sale un
diseño concreto sin necesidad de salir a buscar más fuentes externas —las
preguntas que `mc-18`/`mc-10` sí resuelven son las que importan (mecanismo),
no el número (que en toda la literatura revisada, incluido el propio
Duolingo, es siempre una elección de producto, nunca un resultado medido):

| Banda | Qué ve el niño | Por qué |
|---|---|---|
| KINDER | Nada. Si el padre activó el tablero, solo aparece en su propio panel, nunca en `/app/kids` | mc-10: "default kinder–early-elementary out of public ranking is evidence-aligned"; D-024/D-045 ya sacaron el puntaje de la vista del niño en kinder por otra razón, y esto es consistente con esa decisión, no una nueva |
| PRIMARIA, dentro del top 20 | Posición exacta + la lista | Se muestra **como logro ganado**, no como comparación por defecto |
| PRIMARIA, fuera del top 20 (la mayoría) | Solo su propio total. Cero rango, cero "mitad de arriba/abajo", cero vecinos | mc-10 implicación 6 ("personal-bests... as the primary score for young... learners"); mc-18 implicación 6 ("private, non-comparative signal instead of only public rank") — la lectura más fuerte disponible, no la intermedia (top-mitad/no-top-mitad) que mc-18 también ofrece, porque D-040 ya hace el tablero opt-in y el remanente de riesgo tras el opt-in es exactamente esta población, la de en medio |
| SECUNDARIA, SERIO, JR, PRO | Posición numérica exacta siempre | mc-43 hallazgo 8: TEEN y ADULT ya se diseñan con métricas planas/liga opt-in en el resto del producto; ser la única banda con dato oculto sería inconsistente con cómo el resto de la interfaz ya los trata |

Esto **no** contradice el "8+" de DUELO (D-018): DUELO es un modo simétrico,
elegido, contra ~30 pares — riesgo distinto de un tablero pasivo,
potencialmente de miles, que aparece por defecto una vez activado. El primero
ya tiene su propia compuerta de edad en otra decisión; este diseño no la
reabre ni la copia.

## 4. Alias generados: mecanismo y ejemplos reales (ya construido, aquí documentado)

D-003 pide "sin nombres reales, sin foto, sin ciudad" y `mc-43` pide
generación **por locale, no traducida**, con selección por toque, nunca
tecleo. Las dos cosas ya están hechas en `packages/motor/src/alias.ts`:
sustantivo (animal) + adjetivo + sufijo numérico de 4 dígitos **aleatorio, no
secuencial** (un sufijo secuencial delataría el orden de registro). Ejemplos
reales, tomados del código, no inventados:

- `en`: `OtterBrave7392`
- `es-MX`: `TejonAudaz5108`
- `de-DE`: `NashornFlink2044`

Lo único que faltaba —y es el hallazgo de §1.1— es que el sistema garantice
que dos niños nunca terminan con el mismo alias visible en el mismo tablero.

## 5. Opt-in/opt-out (D-040): mecanismo exacto y qué pasa con el historial

**Activar:** `POST /api/tablero/activar`, sesión de adulto, inserta
`child_consents(child_profile_id, 'LEADERBOARD', granted_by, granted_at,
consent_version)` — mismo patrón exacto que `CHILD_PROFILE` en
`perfil-nuevo.ts`. No crea ninguna fila nueva en `score_totals`: esa tabla ya
acumula para todos los niños, activados o no, porque el total también
alimenta el panel privado del padre (D-021, diagnóstico del Plan Familia).
Activar el tablero **no genera datos nuevos, solo cambia visibilidad.**

**Desactivar:** `POST /api/tablero/desactivar` pone `revoked_at`. **No borra
la fila de `score_totals`.** Esta es la distinción central que hay que dejar
explícita: **opt-out no es borrado.** El derecho de supresión real (borrar al
niño de verdad, de los cuatro sistemas) sigue el runbook que
`audits/borrado-cuatro-sistemas.mjs` ya vigila — D1, KV, R2, Analytics
Engine— y ese runbook, cuando exista, tiene que incluir explícitamente la
instantánea de `math-challenge-leaderboard-kv` como el sistema #2 (KV) que
también guarda el alias y los puntos de un niño, aunque sea una caché de vida
corta que se autolimpia en el siguiente ciclo del Workflow (≤5 min). Un
`DELETE` inmediato de esa entrada de KV no es obligatorio dado ese
autolimpiado, pero **la ventana de hasta 5 minutos se declara en la interfaz
al desactivar**, no se esconde — el mismo patrón de honestidad que D-025 usa
para su propia limitación.

## 6. El salón del maestro (D-003) y el límite con F9, sin construir F9

D-003 dice que el salón es su propio tablero. F9 (grupos infantiles) no tiene
ninguna issue todavía y este diseño **no la abre**. Lo que sí se deja es el
punto de extensión: `tablero.ts` expone una función pura
`calcularPosiciones(filas, opciones)` que recibe **cualquier conjunto de
filas que el llamador ya filtró** — no sabe ni le importa si esas filas
vinieron de "niños con `LEADERBOARD` activo" (el tablero global, este
issue) o de "niños en `child_group_membership.group_id = X`" (el salón,
issue futuro de F9). Cuando F9 exista, reutiliza el mismo módulo de ranking
sin que nadie tenga que volver a escribir la lógica de ordenar y paginar —
y sin que el tablero del salón herede por accidente la puerta de opt-in
global, porque la visibilidad del salón la gobierna la aprobación del padre
(D-011), un consentimiento distinto que F9 tiene que diseñar, no uno que
este issue le presta.

## 7. Mapeo explícito a la tabla sí/no de D-014

| Fila de D-014 | ¿La toca este subsistema? |
|---|---|
| XP y niveles (Sí) | No — es `score_totals`/F3, reusado sin rediseño |
| Rachas con red de protección (Sí) | No — otro sub-issue de F7 |
| Ligas de ~30 (Sí) | No — DUELO (D-018) depende de ligas, no de este tablero |
| Misiones diarias (Sí) | No |
| Cosméticos ganados deterministas (Sí) | No |
| Mapa de progreso, compañero (Sí) | No — F3/F6 (la Sabana) |
| Corazones/vidas que bloquean (No) | N/A — el tablero nunca bloquea práctica |
| Moneda comprable (No) | N/A |
| Recompensas aleatorias de pago (No) | N/A — el tablero no otorga premios, solo posición |
| Notificaciones con culpa (No) | **Sí, directamente**: cero notificación de "bajaste" o "te alcanzaron", es criterio de aceptación explícito |
| Comparación pública de niños por nombre (No) | **Sí, es el núcleo**: alias generado siempre, nunca nombre, foto, ciudad ni edad exacta |

## 8. Consideraciones de i18n

- Los alias ya se autoran por locale, no se traducen (§4, ya construido).
- Los puntos y posiciones se formatean con `packages/motor/src/numeros.ts`
  según el locale de **quien mira**, no el `alias_locale` del dueño de la
  fila — un tablero global mezcla locales por diseño, y `1,234` (en) vs
  `1.234` (de-DE) tienen que decidirse por el visor, nunca por el dato.
- Las cadenas de la escalera de visibilidad ("llevas X puntos", "top 20") se
  autoran por locale como el resto de la interfaz — **no** pasan por el
  pipeline de Larry: F6 §1.3 (`docs/planes/f6-larry-profe.md`) ya excluye
  puntos, racha, liga y posición del sobre de Larry por nombre, con su propia
  tabla de razones. Este subsistema no reabre esa frontera ni intenta que
  Larry narre la posición de nadie.

## 9. Auditores propuestos

| Auditor | Qué comprueba | Cita |
|---|---|---|
| `tablero-orden-puntos.mjs` | Ni `tablero.ts` ni el Workflow referencian un campo de habilidad estimada (θ, `rating`, `elo`, `glicko`) en la cláusula de orden | D-025 |
| `tablero-optin.mjs` | Ninguna ruta de creación de perfil inserta `LEADERBOARD` en `child_consents` | D-040 |
| `tablero-sin-kinder-publico.mjs` | Nada bajo `apps/web/src/pages/app/kids/**` importa datos de `math-challenge-leaderboard-kv` | D-024, D-045, mc-10 |
| `alias-unico.mjs` | Toda migración con una columna `alias` tiene un `UNIQUE` en el mismo bloque | hallazgo §1.1 |

## 10. Autocrítica adversarial — lo que este diseño NO resuelve

- **El corte de 100/20 es criterio propio, no medido.** Si en producción el
  top-20 de PRIMARIA resulta ser una franja demasiado angosta (pocos niños
  llegan nunca) o demasiado ancha (todos llegan y el "logro ganado" deja de
  sentirse como logro), el número necesita revisarse con datos reales, no
  solo con la cita que lo justificó hoy.
- **La ventana de 5 minutos entre desactivar y desaparecer del tablero** es
  una limitación real, no cosmética, aunque acotada y declarada.
- **`score_totals_adulto` es una decisión de esquema sin datos que la usen
  todavía** — F5b (franja adulta) no tiene contenido aún, así que este
  cambio se puede construir y quedar vacío por un tiempo. Se documenta como
  tal, no se finge urgencia que no existe.
- **El disparador automático de la condición de revisión de D-025** (≥200
  respuestas por ítem) no se construye aquí: vive en Analytics Engine, que
  ningún auditor estático de este repo puede leer. Queda como hueco
  reconocido, no resuelto.


## Preguntas al dueño

- ¿El tablero global se ve sin sesión iniciada (página pública, como el sitio abierto de las fases S) o solo dentro de la cuenta de un adulto/niño con sesión? Cambia si `GET /api/tablero` necesita autenticación o puede servir directo desde KV como página pública. Mi recomendación es (a) solo con sesión — el alias no identifica a nadie hacia afuera pero exponer sin sesión el tamaño de la población activa y su distribución de puntos es más superficie de la que el producto necesita mostrar hoy — contra (b) público, que le daría al tablero valor de marketing/viral pero abre una pregunta de moderación (¿qué se hace si alguien hace scraping del tablero completo, alias por alias?).
- ¿Existen temporadas (reinicio periódico del tablero) en el MVP? `score_totals.period` ya admite `season:<id>` en el esquema (migración 0002) pero ninguna decisión dice si se usa. (a) Solo `all_time` en el MVP — más simple, y el patrón de Duolingo real ata sus reinicios a la LIGA semanal, no al tablero global, así que diferirlo hasta que exista el sub-issue de ligas es consistente. (b) Temporadas desde el MVP con alguna cadencia (¿semanal? ¿mensual?) — más trabajo (archivo de temporada anterior, posible cosmético de cierre de temporada que D-014 sí permite) pero le da al tablero un ritmo de "empezar de nuevo" que algunos productos usan para no castigar para siempre a quien empezó tarde. Mi recomendación es (a), y dejar (b) para cuando exista el sub-issue de ligas de F7.
- ¿Se le ofrece al padre la opción de activar el tablero para un perfil de banda KINDER, sabiendo que el niño nunca lo va a ver (D-045/D-024 ya dicen que en kinder el niño no ve puntaje, y este diseño lo saca por completo de `/app/kids`)? (a) Sí se ofrece, como un widget informativo en el panel del padre — le da al padre un dato de contexto aunque el niño nunca lo vea. (b) No se ofrece en absoluto para KINDER — quitar la opción entera es la lectura más conservadora de mc-10 (el hallazgo de mayor riesgo poblacional de toda la investigación cae exactamente en esta edad), y evita construir una pantalla del padre para un dato que D-024 ya trató como algo que el producto activamente protege de la vista de nadie más que el propio padre. Mi recomendación es (b): si el niño nunca lo ve y D-024 ya decidió que el puntaje de kinder no se muestra, ofrecer un tablero que solo el padre ve es una superficie nueva para un beneficio marginal.


---

## 7. Cosméticos ganados (deterministas)

# F7 · Cosméticos ganados (deterministas)


# F7 · Cosméticos ganados (deterministas) — diseño operativo

> Subsistema único dentro de F7 ("Juego"). F7 no tiene ninguna issue de GitHub
> todavía; este documento diseña **solo** el último renglón de la columna "Sí"
> de D-014 y produce la lista de issues que lo implementan. No diseña XP,
> rachas, misiones, mapa ni ligas — son subsistemas hermanos, sin código ni
> plan todavía, y este documento los trata como dependencias externas con un
> contrato mínimo, nunca como algo que yo invento aquí.

## 0. Lo primero: esto NO es D-028/D-029, y hay que decirlo con nombre

Antes de diseñar nada, confirmé leyendo D-028 y D-029 completas que son un
sistema **distinto**, no una variante del mismo. La tabla de las cinco
diferencias reales:

| | D-028/D-029 "Prendas" (F10) | Este subsistema: "Cosméticos" (F7) |
|---|---|---|
| **Quién** | Solo adultos, dentro de `club_adulto` | Todas las edades, incluidos niños |
| **Contenido** | Texto libre escrito por el adulto | Selección cerrada de un catálogo (arte + clave i18n), nunca texto |
| **Cómo se gana** | El grupo compite; hay ganador y prenda | Progreso individual del propio jugador — nunca depende de vencer a otro |
| **Quién lo aprueba** | Larry lo modera **antes de publicarse** (D-029), porque es texto libre de un adulto | No hay nada que moderar: no hay texto libre que un humano haya escrito |
| **Tabla** | `adult_club` + su propia tabla de prendas (D-043) | `cosmetic_catalog` / `cosmetic_unlock_rules` / `child_cosmetics_unlocked` — cero relación de esquema |
| **Riesgo que resuelve** | Humillación pública dentro de un juego de apuesta social (D-028: "prendas sin perdedor") | Ninguno: no hay competencia, no hay "perdedor" posible porque no hay oponente |

**Por qué la confusión es fácil y por qué hay que blindarla en código, no solo
en prosa.** D-027 ya enseñó la lección con `grupo_infantil`/`club_adulto`: "no
es modelado, es modo de falla — el día que alguien agregue texto libre a 'los
clubs', eso aterriza por defecto también sobre los niños". El mismo peligro
existe aquí al revés: si "cosméticos" y "prendas" comparten una tabla o un
endpoint algún día, un cosmético de niño podría terminar mostrando texto que
un adulto escribió. **Por eso ninguna tabla de este subsistema referencia
`adult_club` ni viceversa**, y lo dejo como criterio de aceptación verificable
(§ auditor, issue 5).

---

## 1. Qué son los cosméticos, concretamente — catálogo v1

Decisión de diseño: los cosméticos viven en tres superficies visuales, no
cuatro. Evalué las cuatro que sugiere el enunciado del encargo:

| Superficie sugerida | ¿Entra en v1? | Por qué |
|---|---|---|
| **Piezas de avatar** (pelo/tocado, accesorio) | **Sí** | Ya existe la columna `child_profiles.avatar_parts` (migración 0002, D-012/mc-43) con el comentario "JSON de índices al catálogo de piezas" — **el catálogo al que apunta nunca se construyó**. Este subsistema es quien por fin lo construye. |
| **Marco de imagen de perfil** | **Sí, pequeño** | Se muestra donde ya hay una superficie decidida y sin datos personales: el tablero con alias (D-003/D-040) y la rejilla de avatares del login (D-012). Cero infraestructura nueva. |
| **Compañero del subsistema de mapa** | **Reservado, sin catálogo v1** | Ver §1.3 — depende de una pregunta al dueño (P1) que no es mía de contestar. |
| **El mapa (la Sabana) mismo** | **Excluido explícitamente** | La Sabana ya es contenido fijo de F5: "14 lugares, ~30 piezas de arte… el arte se reusa entre los 5 idiomas" (D-019). F5 ya midió que 70 de 85 plantillas necesitan arte y que el banco **se pasa** del presupuesto (§1.2 de `f5-contenido-kinder.md`). Reskinnable el mapa multiplicaría ese presupuesto sin evidencia de que alguien lo pida — mc-16 §8 (Duolingo) documenta que **cambiar la metáfora del mapa produjo rechazo visible de usuarios**, así que "cosmetizar" el mapa mismo es además arriesgado, no solo caro. |

### 1.1 Catálogo v1 (banda KINDER — la única con contenido real en el MVP)

Antes de inventar un número lo até a lo único auditable que existe hoy:
**14 habilidades de kinder** (K01–K14, master-plan §9) y **8 de esas 14 con
ítems servibles hoy** (medido en `f6-larry-profe.md` §0: K01, K02, K03, K04,
K07, K10, K11, K12; `SIN_PLANTILLA` en K05, K06, K08, K09, K13, K14).

| Categoría | Pieza | Cuántas | Disparador | Fuente del dato |
|---|---|---|---|---|
| `avatar_pieza` | Piezas iniciales (elegidas, no ganadas) | **3** | ninguno — se eligen al crear el perfil | — |
| `avatar_pieza` | Una por habilidad de kinder dominada | **14** | `habilidad_dominada(skill_id)` | `skill_state.mastered_at IS NOT NULL` (existe, migración 0002) |
| `avatar_pieza` | "Bienvenida" | **1** | `primer_intento` | primera fila jamás creada en `skill_state` para ese niño |
| `marco_perfil` | Marcos iniciales (elegidos) | **3** | ninguno | — |
| `marco_perfil` | "Vas a la mitad" | **1** | `habilidades_dominadas_conteo(5)` | `COUNT(*) FROM skill_state WHERE mastered_at IS NOT NULL` |
| `marco_perfil` | "Sabana completa" | **1** | `habilidades_dominadas_conteo(14)` | igual, con las 14 |
| **Total** | | **23** | | |

Aritmética verificada: 3+14+1 = 18 `avatar_pieza`; 3+1+1 = 5 `marco_perfil`;
18+5 = 23. Ganados por regla (no iniciales): 14+1+1+1 = **17**. Iniciales:
3+3 = **6**. 17+6 = 23. ✓

**Autocrítica, con el número real puesto:** de las 14 piezas por habilidad,
solo **8 son producibles hoy** porque las otras 6 habilidades no tienen ni un
ítem servible (F5, medido). Y una de esas 6 (**K14 patrones**) está marcada
`BLOQUEADA` en `f5-contenido-kinder.md` §5 — su propia existencia como
habilidad de kinder está en duda, sin fuente en la investigación del repo. El
catálogo lo soporta sin romperse: **cada regla de desbloqueo es independiente
de las demás** (§2), así que si K14 se cae, el catálogo baja de 18 a 17 piezas
de avatar sin tocar código. El marco "Sabana completa" (requiere las 14)
queda bloqueado hasta que F5 cierre las 6 que faltan — igual que F6 decidió
esperar a grabar voz hasta que F5 cerrara el banco (`f6-larry-profe.md` P-10).

### 1.2 Por banda de edad — el diseño distingue, no reusa un solo skin

La pregunta del encargo era literal: *"¿un cosmético 'cool' para un teen se ve
infantil para un adulto?"* Sí, y la investigación ya lo documenta con cita:

- **KINDER/PRIMARIA (4-11):** avatar completo, estilo "pieza que se prueba" —
  `mc-43` implicación 5 (Mii-style, piezas predefinidas) y `mc-21` implicación
  6 ("build for the wardrobe effect… invest depth in traits shown to matter").
- **SECUNDARIA (12-17):** **nada de vestir un avatar de mascota.** `mc-22`
  implicación 8 es explícita: *"Avatar/identity as functional customization,
  not a social profile. Earned cosmetic/badge choices tied to mastery, not
  spend or popularity"*. Reservo la categoría `insignia_secundaria` (una
  línea de insignias, no piezas de disfraz) — **sin catálogo v1**, porque el
  MVP no tiene contenido de SECUNDARIA (master-plan §14: "N4 a N7 y N11-N12
  están investigadas, no construidas"). Diseñar la tabla ahora y poblarla
  después evita rehacer el esquema cuando llegue esa fase.
- **SERIO/PRO (adulto):** `mc-23` §14 es tajante: *"Reserve color for state,
  not decoration… the opposite bias from a child theme's decorative color
  use"*. Y `mc-43` implicación 8: *"gamified skin optional and off by default"*.
  Reservo `insignia_adulto` — **sin catálogo v1** por una razón más fuerte que
  la de teens: **no existe ninguna tabla que registre progreso de un adulto**.
  `skill_state` tiene `FOREIGN KEY (child_profile_id)`; un adulto (`users.id`,
  `is_learner = 1`) no tiene fila ahí. Inventar esa tabla como efecto
  colateral de diseñar cosméticos sería construir la mitad de F4/F5b sin que
  nadie lo haya pedido. Queda como dependencia explícita, no como código.

**Por qué NO reutilizo la misma pieza entre bandas ("un sombrero para todos"):**
las 23 piezas del catálogo v1 nunca aparecen fuera de `banda_minima = KINDER`.
Reutilizo el tipo `TemaVisual` que ya existe en
`packages/motor/src/bandas.ts` (cinco valores, sin `JR` — JR y PRO comparten
pantalla) en vez de inventar una sexta tabla de bandas, que es justo lo que
`audits/tabla-bandas.mjs` existe para impedir.

### 1.3 El "compañero" — por qué NO lo diseño aquí, y por qué es una pregunta real

D-014 lista "Mapa de progreso, **compañero**" junto a "Cosméticos ganados
(deterministas)" como dos renglones separados de la columna "Sí". Eso implica
que la existencia de un compañero **ya está decidida en principio**, pero
**qué es** no lo está en ningún documento del repo. Y hay una ambigüedad real
que cambia mi diseño: ¿el "compañero" es una criatura nueva y distinta de
Larry, o es Larry mismo acompañando el mapa?

Si es Larry: **no se puede cosmetizar**. D-004 fija su canon (rinoceronte
naranja de Ignia) y el estado `denying` de su avatar ya es un asset reusado
tal cual (`f6-larry-profe.md` §2.1). Vestir a Larry con un sombrero ganado
rompería la continuidad de marca que CLAUDE.md § Imágenes protege
explícitamente con Recraft.

Si es una criatura nueva: entra limpio en este catálogo — reservo la
categoría `companero` en el enum cerrado de `cosmetic_catalog.categoria`
(cero filas en v1) para que, cuando el subsistema hermano "Mapa y compañero"
decida que existe, enchufe sus skins con la misma maquinaria de desbloqueo sin
tocar esquema. Esto es la pregunta **P1** para el dueño.

---

## 2. Cómo se ganan — el mecanismo, verificado 100% determinista

**Regla de oro aplicada aquí, no solo declarada:** revisé cada punto de
contacto donde podría colarse azar.

1. **Elegir una pieza inicial** (`es_inicial = true`) — el niño **toca** una
   de 3 opciones ya visibles. No hay `Math.random` en ese camino: es un menú,
   no una tirada. Mismo patrón que el selector de color de `avatar_parts` ya
   existente.
2. **Ganar una pieza** — es una función pura, sin entrada aleatoria:

```ts
// packages/motor/src/cosmeticos.ts (nuevo)
export type LogroDeterminista =
  | { tipo: "habilidad_dominada"; habilidadId: string }
  | { tipo: "primer_intento" }
  | { tipo: "habilidades_dominadas_conteo"; conteo: number }
  // Reservados para cuando existan sus subsistemas hermanos — CERO catálogo
  // los usa en v1, pero el tipo ya existe para no re-diseñar el esquema:
  | { tipo: "racha_dias"; dias: number }
  | { tipo: "liga_top_pct"; porcentaje: number };

export interface ReglaDeDesbloqueo {
  cosmeticoId: string;
  evento: LogroDeterminista["tipo"];
  parametro: string | number;
}

/** Pura: mismo `logro` + mismas `reglas` ⇒ mismo resultado, siempre. */
export function cosmeticosQueDesbloquea(
  logro: LogroDeterminista,
  reglas: ReglaDeDesbloqueo[],
): string[] { /* … */ }
```

Mismo patrón que `puntuacion.ts` y `historia.ts` (módulo puro: "no toca la
red, ni el reloj, ni la base"). Se prueba sin infraestructura, igual que
`calificar()`.

3. **Persistir el logro** — `INSERT OR IGNORE INTO child_cosmetics_unlocked`
   con `PRIMARY KEY (child_profile_id, cosmetic_id)`: dos disparos del mismo
   evento (una reconexión, una carrera) nunca duplican la fila ni el efecto —
   mismo patrón de idempotencia que `sesion.ts` usa para no puntuar dos veces
   una respuesta repetida.

**Ninguna caja, ningún cofre, ningún "quizá".** No existe ningún camino de
código donde el cosmético que sale dependa de algo que no sea el logro mismo.
Esto cumple D-014 en su forma más estricta: no solo "recompensas aleatorias
**de pago**" (que ya está prohibido por nombre) sino cualquier azar, pagado o
gratis — que es exactamente la lectura que `mc-17` §7 pide ("any future
'mystery reward' or 'surprise box' mechanic — even cosmetic, even free — sits
in the blast radius of this regulatory history") y que `mc-43` implicación 6
adopta como recomendación de diseño.

---

## 3. Esquema de datos

Tres tablas nuevas + reutilización de una columna existente. **Cero recursos
nuevos de Cloudflare** — todo vive en `math-challenge-db` (y su gemela
`math-challenge-db-eu`, D-042) ya inventariada. No hace falta un Durable
Object: los desbloqueos son deterministas e idempotentes por PK, no necesitan
coordinación en vivo como sí la necesita `math-challenge-league-do`.

```sql
-- migración siguiente disponible — verificar el número real al implementar:
-- D-053 ya reservó conceptualmente "0005" para el borrado de birth_month, así
-- que si esa migra primero, esto es 0006. No lo fijo aquí para no chocar.

CREATE TABLE cosmetic_catalog (
  id                TEXT PRIMARY KEY,
  categoria         TEXT NOT NULL CHECK (categoria IN (
                       'avatar_pieza','marco_perfil','companero',
                       'insignia_secundaria','insignia_adulto')),
  -- Reusa TemaVisual de bandas.ts (5 valores, sin JR) — no una sexta tabla.
  banda_minima      TEXT NOT NULL CHECK (banda_minima IN
                       ('KINDER','PRIMARIA','SECUNDARIA','SERIO','PRO')),
  es_inicial        INTEGER NOT NULL DEFAULT 0 CHECK (es_inicial IN (0,1)),
  nombre_clave      TEXT NOT NULL,   -- clave i18n, jamás texto crudo
  arte_avif_url     TEXT NOT NULL,
  arte_webp_url     TEXT NOT NULL,
  arte_silueta_url  TEXT NOT NULL,   -- versión "bloqueada" en gris, ver §6
  created_at        INTEGER NOT NULL
  -- SIN columna price/precio/costo/moneda. La ausencia es estructural, no una
  -- política que alguien pueda saltarse — mismo patrón que D-028 usa para
  -- "prendas sin perdedor": no hay campo donde un precio pueda aterrizar.
);

CREATE TABLE cosmetic_unlock_rules (
  cosmetic_id  TEXT PRIMARY KEY REFERENCES cosmetic_catalog(id),
  tipo_evento  TEXT NOT NULL CHECK (tipo_evento IN (
                 'habilidad_dominada','primer_intento',
                 'habilidades_dominadas_conteo','racha_dias','liga_top_pct')),
  parametro    TEXT NOT NULL
);

CREATE TABLE child_cosmetics_unlocked (
  child_profile_id TEXT NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  cosmetic_id      TEXT NOT NULL REFERENCES cosmetic_catalog(id),
  unlocked_at      INTEGER NOT NULL,
  evento_causa     TEXT NOT NULL,  -- auditable: qué logro exacto lo disparó
  PRIMARY KEY (child_profile_id, cosmetic_id)
);
CREATE INDEX idx_cosmetics_child ON child_cosmetics_unlocked (child_profile_id);
```

**Lo que "traigo puesto" — reuso deliberado, no tabla nueva.** La migración
0002 ya declaró `child_profiles.avatar_parts TEXT NOT NULL DEFAULT '{}'` con
el comentario *"JSON de índices al catálogo de piezas"* — el catálogo nunca
existió hasta este subsistema. En vez de agregar `child_cosmetics_equipped`
(una cuarta tabla), este diseño **reutiliza esa columna** para las dos
categorías equipables (`avatar_pieza`, `marco_perfil`), con claves JSON por
categoría. Evita duplicar el estado "qué trae puesto" en dos sitios que
podrían desincronizarse — el mismo motivo por el que `puntuacion.ts` es el
único motor de puntuación. La validación de que solo se puede equipar algo
`es_inicial = 1` o ya presente en `child_cosmetics_unlocked` se hace en el
Worker (el único escritor de esa columna), no con un trigger SQL — se
consideró un trigger que parseara el JSON y se descartó por complejidad
innecesaria para una primera versión; queda anotado como simplificación
consciente, no como hueco escondido.

**Índice, dicho de frente porque `score_totals` ya enseñó la lección:** la
regla `habilidades_dominadas_conteo` hace `COUNT(*) FROM skill_state WHERE
child_profile_id = ? AND mastered_at IS NOT NULL`. Sin un índice sobre
`(child_profile_id, mastered_at)` repite el riesgo #12 de `mc-32` que
`score_totals.idx_score_rank` ya resolvió una vez — hay que verificarlo con
`EXPLAIN QUERY PLAN` antes de desplegar, no después de un incidente, tal como
esa tabla ya advierte.

**Borrado.** Las tres tablas nuevas están enteramente en D1 y caen bajo el
mismo `ON DELETE CASCADE` que ya usa `skill_state`/`score_totals`. No agregan
un quinto sistema al runbook de borrado de `mc-32` riesgo #7 — siguen siendo
D1, DO, Analytics Engine y R2, nada nuevo que perseguir.

---

## 4. Mapeo explícito a la tabla sí/no de D-014

| Columna de D-014 | Cómo lo cumple este diseño |
|---|---|
| **Sí — Cosméticos ganados (deterministas)** | Es este subsistema completo: §2 demuestra cero azar en el camino de otorgamiento. |
| Sí — XP y niveles | No lo construyo; el catálogo v1 no depende de XP (usa maestría de habilidad, ya existente). Reservo `nivel_alcanzado` en el enum para cuando exista, sin usarlo. |
| Sí — Rachas con red | No lo construyo; reservo `racha_dias`, cero filas. Nota de diseño: cuando se enchufe, debe leer el estado de racha **ya calculado** por ese subsistema (que ya debe respetar D-016 — "si el límite de pantalla corta la sesión, la racha se da por cumplida") y no recalcularlo por su cuenta, igual que Larry nunca calcula (D-004) — dos fuentes de la misma verdad divergen tarde o temprano. |
| Sí — Ligas de ~30 | No lo construyo; reservo `liga_top_pct`, cero filas. Si algún día se usa, **nunca** puede premiar solo al primer lugar de forma que exponga el último — mismo espíritu que D-025/`mc-18` ya aplican al tablero. |
| Sí — Misiones diarias | No lo construyo; no reservé un tipo de evento propio porque una misión, vista desde este subsistema, **es** un `habilidad_dominada` o un `primer_intento` con otro nombre — no necesita un tipo nuevo. |
| Sí — Mapa de progreso, compañero | El mapa (Sabana) es contenido fijo de F5, no cosmetizable (§1). El compañero es una pregunta al dueño (P1), con la categoría reservada. |
| **No — corazones/vidas que bloquean** | Un cosmético nunca bloquea nada: no hay ningún camino donde no tener un cosmético impida jugar, y equipar uno nunca cambia `calificar()` (D-010). |
| **No — moneda comprable** | `cosmetic_catalog` no tiene columna de precio. Estructuralmente imposible de comprar, no una política. |
| **No — recompensas aleatorias de pago** | Cero azar en absoluto (§2), así que ni siquiera la mitad "aleatoria" existe, pagada o no. |
| **No — notificaciones con culpa** | Un desbloqueo produce, como mucho, un aviso dentro de la app en el momento en que ocurre (un *toast*, nunca un *push*). Cero notificación push sobre cosméticos en v1 — si algún día existe, tiene que pasar por el mismo criterio de D-014 que ya prohíbe la culpa. |
| **No — comparación pública de niños por nombre** | El marco de perfil solo se muestra donde ya hay alias, nunca nombre (D-003/D-040), y solo si el padre activó el tablero para ese hijo (D-040 es opt-in por hijo — este subsistema no cambia ese default). |

---

## 5. i18n — una corrección importante que casi repito del error de F6

**El arte NO se multiplica por locale.** A diferencia del audio de Larry
(F6, que sí necesita 7 grabaciones porque es habla), un sombrero se ve igual
en siete países — el arte es **una** pieza por cosmético, no siete. Lo que sí
se autora por locale, siguiendo el patrón de `alias.ts` (no de `mc-42`/voz),
es el **texto**: `nombre_clave` (nombre corto) y la frase de condición
("Domina contar hasta 10 para ganarlo") — 23 cosméticos × 2 cadenas × 7
locales ≈ 322 cadenas cortas, autoradas por el mismo revisor nativo de D-022,
no traducidas. Barato: comparable en volumen a las 119 cadenas de F6 §4.3,
no a sus ~2,401 clips de audio.

**Hueco reconocido, no verificado:** un ícono puede tener una connotación
distinta por mercado (un animal, un color, un gesto) aunque el arte no
necesite regenerarse por idioma. Igual que F5 dejó "verificar la convención
del marco de diez en de-DE/fr-FR/pt-PT/pt-BR" como tarea del maestro
revisor, dejo aquí "el revisor nativo de cada locale confirma que ningún
ícono del catálogo v1 tiene una lectura ofensiva o rara en su mercado" como
criterio de aceptación, no como algo ya resuelto.

---

## 6. Arte — decisión con la guía ya existente, no una nueva

CLAUDE.md § Imágenes ya fija el reparto: *"Recraft… mantiene la continuidad
del avatar de Larry… Gemini/Nano Banana para las piezas complejas de
interfaz."* Las 18 `avatar_pieza` son continuidad de personaje (mismo mundo
visual que Larry y la Sabana, D-019) → **Recraft**. Los 5 `marco_perfil` son
piezas de interfaz (bordes, no personajes) → **Gemini/Nano Banana**. No hace
falta una decisión nueva: la guía existente ya resuelve la pregunta sugerida
en el encargo.

Formato: **AVIF con respaldo WebP**, como manda CLAUDE.md § Imágenes — salvo
que un cosmético termine siendo ícono de instalación del manifest, lo cual no
aplica aquí. `audits/brand-image.mjs` ya verifica paleta y formato en cada
commit; correrlo sobre el arte nueva es parte del criterio de cierre, no un
auditor nuevo.

**Silueta bloqueada, y para quién es.** `arte_silueta_url` es una versión en
gris del cosmético, mostrada **antes** de ganarlo. Resuelve a favor la
pregunta abierta #4 de `mc-43` ("¿el catálogo se muestra por adelantado o es
sorpresa?") de una forma que ninguno de los dos lados de esa pregunta
contemplaba: **en KINDER el niño no lee** (D-016/`mc-20`), así que un catálogo
con texto de condición no le sirve de nada — para él, cada desbloqueo **es**
sorpresa, sin que nadie lo haya decidido explícitamente. Lo que sí puede
mostrar el catálogo completo con siluetas y condiciones es **el panel del
padre** (F8, no construido todavía) — ahí sí aprovecha el efecto de gradiente
de meta que `mc-43` §8 documenta, sin exponer al niño a nada. Esto no es una
pregunta que dejo abierta del todo: la resuelvo para el niño (sorpresa, por
la razón de que no lee) y la dejo como pregunta real para el padre (P3),
porque depende de un panel que no existe.

---

## 7. Autocrítica — lo que ataqué de mi propio diseño y lo que sobrevivió

1. **¿El niño que pasa de KINDER a PRIMARIA se queda con piezas "de bebé"?**
   Sí, y no lo resuelvo. Lo ganado nunca se quita (mismo espíritu que "la
   racha nunca se rompe por respetar el límite", D-014) pero `mc-21` dice que
   PRIMARIA necesita señalar más capacidad, no un kinder escalado. Un niño de
   8 años puede dejar de equiparse voluntariamente una pieza que ganó a los 5
   — eso es autonomía (SDT, `mc-17` §1), no una falla, pero es una tensión
   real entre "lo ganado se queda" y "PRIMARIA no es kinder escalado" que
   este documento no cierra.
2. **¿Qué pasa si K14 no existe?** Ya cubierto en §1.1 — el catálogo baja de
   18 a 17 piezas sin romper nada, porque cada regla es independiente.
3. **¿Puede alguien "otorgarse" un cosmético llamando al endpoint dos veces?**
   No: `INSERT OR IGNORE` con PK compuesta lo hace imposible a nivel de fila.
   Lo que sí puede pasar (y no cierro) es que la UI muestre el aviso de
   "¡lo ganaste!" dos veces si hay una carrera de red — es un defecto de UI,
   no de integridad de datos, y lo dejo nombrado para quien implemente.
4. **¿Necesita este subsistema que exista F4?** Sí, y con precisión: el
   **módulo puro** (`cosmeticos.ts`) no depende de F4 para construirse ni
   para probarse — es aritmética sobre datos inventados, igual que
   `puntuacion.ts`. Lo que sí depende de F4 es que `skill_state.mastered_at`
   alguna vez tenga un valor real en producción, porque el comentario de la
   migración 0002 dice explícitamente que el modelo adaptativo vive en
   `math-challenge-learner-do` (F4) y que la tabla es "el registro durable
   que sobrevive al objeto". Es exactamente la dependencia que
   master-plan §13.2 declara ("F7 depende de F4"), aquí acotada a una sola
   columna en vez de a toda la fase.

---

## Preguntas al dueño

Solo tres — las que de verdad cambian lo que se construye.


## Preguntas al dueño

- ¿El 'compañero' de D-014 ("Mapa de progreso, compañero") es una criatura nueva y distinta de Larry —cosmetizable, con su propia línea de skins— o es Larry mismo acompañando el mapa? Si es Larry, no se puede vestir: D-004 fija su canon y CLAUDE.md § Imágenes protege esa continuidad con Recraft, así que la categoría 'companero' de este catálogo se elimina en vez de quedar reservada. Si es una criatura nueva, este subsistema ya reserva la categoría para que ese subsistema hermano (todavía sin diseñar) la use sin tocar el esquema.
- De las 14 piezas de avatar ligadas a una habilidad de kinder, hoy solo 8 son producibles porque las otras 6 habilidades no tienen ni un ítem servible (medido en f6-larry-profe.md §0), y una de esas 6 (K14 patrones) está marcada BLOQUEADA en el propio plan de F5 por falta de fuente de investigación. ¿Se autoran y se manda a Recraft las 8 piezas que sí se pueden ilustrar ya, dejando el catálogo incompleto un tiempo (recomendado: evita rehacer arte si K14 cambia o se cae), o se espera a que F5 cierre las 14 habilidades antes de encargar cualquier arte de este catálogo (más lento, pero un solo lote, sin riesgo de rehacer)?
- El catálogo completo con siluetas bloqueadas y condiciones de desbloqueo ("Domina contar hasta 10 para ganar esto") tiene sentido mostrarlo al padre en el panel de F8 —que no existe todavía— para aprovechar el efecto de gradiente de meta que documenta mc-43 §8, sin exponer nunca ese texto al niño (que en KINDER no lee de todas formas). ¿Se incluye ese roadmap de cosméticos como parte del alcance de F8 cuando se diseñe esa fase, o se considera fuera de alcance del panel del padre y los cosméticos quedan siempre como sorpresa, incluso para el adulto?


---

## Crítica adversarial cruzada — los 5 ángulos completos



### Ángulo: lineas-rojas

# Auditoría cruzada — F7 · Juego (7 subsistemas contra D-014 y líneas rojas)

Método: leí D-014 completa, D-003, D-010, D-016, D-017, D-018, D-024, D-025, D-034, D-040, D-044, D-047, D-013 en `docs/decisions.md`, y el único subsistema ya commiteado (`docs/planes/f7-juego.md`, = mapa-companero). Los otros seis subsistemas (xp-niveles, rachas, misiones, ligas, tablero-global, cosméticos) no tienen archivo en el repo todavía — se auditaron contra el texto que se me entregó. Verifiqué también el código real (`packages/motor/src/puntuacion.ts:157-179`) para confirmar el bug que reporta xp-niveles.

**Resultado sobre las líneas rojas #4-#8 y la columna "No" de D-014: ningún subsistema, por sí solo, las cruza.** No hay corazones/vidas, no hay columna de precio en ningún esquema propuesto, no hay azar (varios documentos incluso extienden la prohibición más allá de la letra de D-014, a recompensas aleatorias *gratis*), no hay notificación con lenguaje de pérdida, y todo lo público usa alias. Eso es real y hay que decirlo — pero el encargo pedía cruzar los siete entre sí, y ahí sí aparecen problemas serios, uno de ellos de severidad alta.

---

### 1. [CONTRADICE] — "XP" tiene tres diseños incompatibles, escritos en paralelo, ninguno menciona a los otros dos

**Subsistemas:** xp-niveles, mapa-companero (`docs/planes/f7-juego.md:246`), misiones.

**Evidencia exacta:**
- **xp-niveles §0**, decisión central del documento entero: *"XP no es el mismo número [que los puntos], y la diferencia no es cosmética... Los puntos, en las bandas cronometradas, pueden ser negativos... y se resetean por temporada. Un sistema de niveles construido sobre un número que puede bajar o resetearse le quitaría a un niño un nivel ya ganado."* Propone `packages/motor/src/xp.ts` con `xpDeItem()`/`xpDelReto()`, tabla `xp_totals` nueva, curva `rangoDeXp()`.
- **mapa-companero, `docs/planes/f7-juego.md:246-247`**: *"**Resolución:** XP **es** el mismo valor que produce `calificar()` en `puntuacion.ts` — sin segunda fórmula, sin segundo auditor de fórmula."* Su propia lista de issues incluye textualmente "F7 · XP es el mismo número que los puntos de D-010/D-024, no una fórmula paralela" — el opuesto literal de la issue núcleo de xp-niveles ("F7 · Fórmula de XP por ítem y por reto").
- **misiones §5**: un tercer diseño — XP fija por tipo de misión (10-25, tabla propia, +15 bono), que llama "una moneda aparte" que "alimenta un 'rango' privado de progreso" — asumiendo que existe un Rango (que es exactamente el de xp-niveles) pero **sin ningún camino de escritura** hacia `xp_totals`/`xpDeItem()`. La tabla de recompensa de misiones no pasa por `xp.ts` en ningún punto del documento.

Si las tres issues se abren tal cual están escritas, un ingeniero recibe instrucciones contradictorias sobre si XP puede bajar (mapa-companero: sí, hereda la volatilidad de puntos cronometrados) o nunca (xp-niveles: es la premisa fundacional del documento), y sobre si existe o no un segundo motor de cálculo (que es precisamente lo que el propio auditor propuesto por xp-niveles, `motor-xp.mjs` regla 1, existiría para bloquear — y el propio mapa-companero citaría `motor-puntuacion.mjs` para bloquear la propuesta de xp-niveles).

**Recomendación:** decisión del dueño, no técnica — es Q1/Q2 de xp-niveles disfrazada de una pregunta distinta. Antes de abrir cualquier issue de XP en F7, reconciliar los tres documentos en uno: o XP es un eje nuevo y determinista (xp-niveles) o es un alias de puntos (mapa-companero), nunca los dos. Si se elige xp-niveles, la tabla de misiones (§5) necesita reescribirse para llamar `xpDeItem`/emitir su bono a través de `xp.ts`, no como constante suelta.

---

### 2. [FALTA] — `xp_totals` (xp-niveles) excluye exactamente a la única población adulta del MVP, y el propio documento no lo nota

**Subsistemas:** xp-niveles (falla), ligas y cosméticos (ambos sí vieron el mismo problema en su propio dominio).

**Evidencia exacta:** xp-niveles §6:
```sql
CREATE TABLE xp_totals (
  child_profile_id TEXT PRIMARY KEY REFERENCES child_profiles(id) ON DELETE CASCADE,
  ...
```
Solo admite `child_profile_id`. Pero el propio §1 del mismo documento centra su hallazgo de bug en la banda **SERIO** ("la franja adulta N8-N10 (D-034) es banda SERIO, cronometrada... es exactamente el contenido que el MVP sí ships"), y `xpDeItem(nivel, acc)` se define explícitamente sin restricción de banda ("nunca usa `banda`... el mismo ítem vale lo mismo en XP sin importar en qué banda se sirvió"). Un adulto aprendiz (`users.id`, `is_learner=1`, sin fila en `child_profiles`) **no tiene dónde acumular el XP que la propia fórmula dice que gana**.

Este exacto problema ya lo resolvieron en paralelo otros dos subsistemas del mismo lote:
- **ligas §2.1** creó "participante polimórfico" (`child_profile_id` O `user_id`, nunca ambos) precisamente para que SERIO/JR/PRO puedan competir.
- **cosméticos §1.2/§7.4** lo reconoce de frente: *"no existe ninguna tabla que registre progreso de un adulto... Queda como dependencia explícita, no como código."*

xp-niveles no hace ninguna de las dos cosas: ni resuelve el esquema polimórfico, ni declara la limitación. Es el mismo hueco que ligas encontró y corrigió, sin que xp-niveles lo haya visto.

**Recomendación:** aplicar a `xp_totals` el mismo patrón polimórfico que `league_membership` (§2.1 de ligas) ya estableció, o declarar explícitamente — como sí hizo cosméticos — que XP en v1 solo cubre KINDER y que SERIO queda sin Rango hasta una migración futura.

---

### 3. [CONTRADICE] — la "red de protección" de racha tiene dos diseños distintos e incompatibles

**Subsistemas:** rachas, mapa-companero (`docs/planes/f7-juego.md:293`).

**Evidencia exacta:**
- **rachas, Capa 1-2**: escudos ganados `floor(current_streak/7)`, tope acumulable de **2**, consumo silencioso automático; **más** una pausa familiar declarada por el padre, hasta **4 veces/año**, cada una de hasta **21 días**, prospectiva o retroactiva. Dos mecanismos, con auditor propio (`racha-nunca-se-vende.mjs`).
- **mapa-companero, §4, línea 293**: *"`[criterio]` **1 día de gracia por semana, repuesto cada lunes hora local, nunca acumulable entre semanas.**"* Un solo mecanismo, sin equivalente de pausa familiar para ausencias largas (viaje, enfermedad) — el caso que el propio encargo de rachas nombra explícitamente como motivador.

Son dos propuestas de issue reales para el mismo renglón de D-014 ("Rachas con red de protección"): una semana de vacaciones (10 días) queda cubierta por la pausa familiar de rachas pero **no** por la gracia semanal de mapa-companero (que da como máximo 1 día suelto, no acumulable). Si se implementa mapa-companero tal cual, el caso de uso que dio origen al encargo de rachas ("viaje") queda sin resolver.

**Recomendación:** mismo tratamiento que el hallazgo 1 — decidir cuál documento gobierna antes de abrir issues de racha. rachas es más completo (cubre ausencias cortas y largas con evidencia citada por separado); mapa-companero es más simple pero deja el caso "viaje" sin cubrir pese a que el encargo lo pedía resolver.

---

### 4. [FALTA] — el tablero global para adultos (SERIO/JR/PRO) no tiene de dónde sacar el alias que D-003 exige

**Subsistemas:** tablero-global (falla), ligas (ya lo encontró y lo arregló para su propio dominio).

**Evidencia exacta:** D-003 dice, sin condicionar a edad: *"tablero global con alias generados — sin nombres reales, sin foto, sin ciudad."* tablero-global §1.2 identifica correctamente que `score_totals` no puede almacenar puntaje adulto y propone `score_totals_adulto` — pero en ningún punto del documento (§1, §2, issue "F7 · `score_totals_adulto`") se menciona que **`users` (la tabla de cuentas adultas) no tiene columna `alias`** — solo `child_profiles` la tiene. Sin alias, un adulto en SERIO/JR/PRO no puede aparecer en el tablero global sin mostrar su identidad real, violando D-003 por la vía del hueco de esquema, no por diseño.

ligas §1 (mismo lote de documentos) encontró exactamente este hueco de forma independiente: *"`users` no tiene `alias`/`alias_locale`. Solo `child_profiles` los tiene... Un adulto en una liga necesita el mismo velo de anonimato que un niño"* — y lo resuelve con `ALTER TABLE users ADD COLUMN alias TEXT`. tablero-global no lo vio y no lo referencia.

**Recomendación:** la issue de `score_totals_adulto` en tablero-global debe declarar dependencia explícita de la migración de alias que ligas ya diseñó (`ALTER TABLE users ADD COLUMN alias/alias_locale`), en vez de que ambos subsistemas terminen proponiendo la misma migración por separado sin saberlo.

---

### 5. [DÉBIL] — la pausa familiar de rachas no está conectada a la determinación de "activo" de ligas

**Subsistemas:** rachas, ligas.

**Evidencia exacta:** ligas §4.3 define "inactivo" (protegido de descenso) puramente por comportamiento: *"Si los últimos lugares de la cohorte son niños que respetaron su límite de pantalla toda la semana (**0 puntos**, no jugaron), no cuentan para el cupo de descenso."* No hay ninguna referencia a `child_streak.pause_until_local_date` (rachas §5). En el caso de una ausencia total (0 puntos toda la semana) los dos sistemas coinciden por accidente — el niño que no jugó nada también aparece como "inactivo" en ligas. Pero en una pausa familiar **parcial** (declarada a mitad de semana, con algo de actividad antes de pausar) el niño puede tener puntos bajos y no-cero, y ligas no tiene forma de saber que esos días están cubiertos por una pausa familiar legítima — podría demoted igual, mientras rachas sí lo protege del lado de la racha.

**Recomendación:** decidir si `league_membership`/el cálculo de ascenso-descenso debe consultar `child_streak.pause_until_local_date` antes de contar a alguien como candidato a descenso, o documentar explícitamente que es un caso no cubierto (como sí hace rachas §7 para otros huecos).

---

### 6. [DÉBIL] — sin presupuesto conjunto de notificaciones al padre entre subsistemas de F7

**Subsistemas:** rachas, ligas.

**Evidencia:** rachas §3 fija *"Tope duro: 1 [recordatorio] por hogar por día"* — pero ese tope es específico del recordatorio de racha. ligas §5.2 agrega, de forma independiente, un aviso de "duelo pendiente" al retado, sin coordinarse con el tope de rachas. Individualmente ninguno de los dos infringe D-014 ("notificaciones con culpa" — ambos son de tono neutro), pero no existe ningún documento que declare un presupuesto total de notificaciones de F7 por hogar/día — un padre podría recibir el recordatorio de racha y, el mismo día, un aviso de duelo, sin que ningún subsistema lo haya contemplado como interacción.

**Recomendación:** de severidad baja; suficiente con anotarlo como pendiente para quien diseñe la capa de notificaciones (posiblemente F8), no bloquea construcción.

---

### 7. [BIEN] — la lista negra de D-014 (columna "No") y las líneas rojas #4-#8 se respetan de forma consistente en los siete documentos

Verificado explícitamente en cada subsistema: ningún esquema propuesto tiene columna de precio o moneda; toda recompensa (XP, cosméticos, resultado de duelo) es una función pura sin `Math.random`; toda racha/liga se apaga sin culpa ni cuenta regresiva; todo lo visible entre pares usa alias generado, nunca nombre real; y **misiones §5 y cosméticos §2 van más allá de la letra de D-014**, extendiendo la prohibición de azar a recompensas gratuitas (no solo pagadas), citando `mc-17`/`mc-43` para hacerlo — es la lectura más estricta disponible, no la mínima exigida. No encontré ningún camino, directo ni indirecto, hacia corazones/vidas que bloqueen práctica en ninguno de los siete documentos.

---

## Resumen priorizado

| # | Severidad | Hallazgo | Acción antes de abrir issues |
|---|---|---|---|
| 1 | **Alta** | Tres diseños de XP incompatibles (xp-niveles / mapa-companero / misiones) | Reconciliar en un documento antes de tocar código |
| 2 | **Alta** | `xp_totals` no admite adultos SERIO, el único no-kinder del MVP | Aplicar el patrón polimórfico de ligas, o declarar el hueco |
| 3 | **Media-alta** | Dos diseños de red de protección de racha (rachas vs mapa-companero) | Decidir cuál gobierna; mapa-companero no cubre "viaje" |
| 4 | **Media** | Tablero adulto sin alias de `users` — D-003 roto por hueco de esquema | Enlazar con la migración de alias ya diseñada en ligas |
| 5 | **Baja-media** | Pausa familiar no conectada a "activo" de ligas (caso parcial) | Documentar o conectar |
| 6 | **Baja** | Sin presupuesto conjunto de notificaciones/hogar entre rachas y ligas | Anotar como pendiente |

No se encontraron violaciones de las líneas rojas #4-#8 ni de la columna "No" de D-014 en ningún subsistema individual — los problemas reales están todos en la **intersección** entre subsistemas diseñados en paralelo, exactamente donde el encargo pedía mirar.


### Ángulo: i18n-bandas

# Auditoría F7 — lente idiomas (D-022/mc-34) y diferenciación por banda (D-017, mc-20/21/22/23)

Revisé los 7 subsistemas contra dos preguntas fijas: (1) ¿todo texto/número de cara al usuario declara si se autora o se traduce, y formatea por locale? (2) ¿el subsistema diseña un tono/interacción distinto para kinder (no lee) vs. teen/adulto (sí leen, tono distinto — el hueco que F6 ya encontró), o asume un trato uniforme?

---

## 1. XP y niveles

**[CONTRADICE]** — "Rango 5" se traduce, no se autora, citando la misma decisión que los demás usan para lo contrario.

§9: *"'Rango 5' en sí es texto de interfaz, no notación matemática — se traduce como cualquier otra cadena de UI en los siete locales (D-022)"*.

Los otros cinco documentos que tocan el tema citan **D-022 para la conclusión opuesta**, sobre cadenas del mismo tipo (etiquetas cortas de producto, no notación matemática):
- racha §6: *"el propio léxico 'racha'/'streak'/'série' se autora por locale... no se traduce mecánicamente"*.
- misiones §12: *"autoradas por locale y no traducidas (D-005, mc-34)"*.
- ligas §9: *"cualquier copy de Larry... se autora por locale, nunca se traduce palabra por palabra (D-022, D-004)"*.
- cosmeticos §5: *"autoradas por el mismo revisor nativo de D-022, no traducidas"*.
- tablero-global §8: *"se autoran por locale como el resto de la interfaz"*.

"Rango" es exactamente análogo a "racha" o al nombre de una misión: una etiqueta de producto corta, no notación matemática. Cinco de seis documentos hermanos tratan ese tipo de cadena como autorada; xp-niveles es el único que la trata como traducción mecánica, invocando el mismo D-022. Esto no es una preferencia estilística menor — determina si "Rango" se manda a un traductor o a un revisor nativo que autora por locale, con implicaciones de calidad de copy distintas. Antes de construir, hay que resolver esta divergencia de lectura de D-022 entre hermanos de F7.

**[BIEN]** — Formateo de números y ocultamiento por banda, §9: KINDER nunca ve el número (solo barra visual, justificado con "un niño de 4-6 años no lee"), PRIMARIA+ usa `formatear()` de `numeros.ts` con ejemplos reales correctos por locale (`12,480` en/es-MX vs `12.480` es-ES/pt-BR/pt-PT/de-DE vs `12 480` con espacio fino en fr-FR — los tres patrones están bien atribuidos).

**[FALTA]** — El tono del evento "subiste de Rango" (§7) no se diferencia por banda más allá de heredar el léxico anti-vergüenza de F6. No dice si el copy de celebración para un niño de PRIMARIA (7-11) debe sonar distinto al de un adulto SERIO/JR/PRO — exactamente el mismo hueco que la auditoría de F6 sobre Larry ya encontró (tono único asumido donde niño y adulto necesitan diseños distintos). El documento diferencia SI se muestra el número (kinder no, resto sí) pero no CÓMO suena el mensaje de celebración entre un niño de 8 años y un adulto.

---

## 2. Rachas con red de protección

**[BIEN]** — §6 declara explícitamente autoría por locale para el copy alrededor del número, y formateo vía `formatear()` para el número entero. §3 diferencia bien KINDER (sin número, sendero de Larry) vs. resto (número + `max_streak`, sin lenguaje de pérdida).

**[FALTA]** — El diseño entero asume que solo existen niños con un padre detrás, y no dice nada de SERIO/JR/PRO (adultos aprendices, `users.is_learner=1`). Evidencia:
- La tabla se llama literalmente `child_streak`, "una fila por niño" (§5).
- El mecanismo de recordatorio (§3) dice *"Va al padre, nunca al niño"* — pero un adulto SERIO no tiene padre.
- La Capa 2 (pausa familiar) dice *"declarada por el padre, nunca por el niño"* — un adulto que se ausenta por viaje/enfermedad no tiene quién declare la pausa por él.

D-014 lista "Rachas con red de protección" como un renglón universal de la columna Sí, igual que XP y Ligas (que sí cubren las 6 bandas explícitamente). Este documento no dice si SERIO/JR/PRO simplemente no tienen racha, o si el mecanismo se adapta (¿el propio adulto se autodeclara la pausa?, ¿el recordatorio se manda a sí mismo?) — es un vacío real de diferenciación por banda, no solo de tono sino de existencia del subsistema para media población del MVP (SERIO es la única banda no-kinder con contenido real).

---

## 3. Misiones diarias

**[BIEN]** — §12 declara ~210 cadenas autoradas no traducidas, números vía `numeros.ts`/`convenciones.ts`. §7 es el ejemplo más riguroso de diferenciación por banda basada en evidencia real (Cowan 2010 + precedente Duolingo), y lo eleva a pregunta explícita al dueño (Q2) sobre si SERIO necesita un tope distinto al de PRIMARIA por diferencia de memoria de trabajo adulta vs. infantil — exactamente el tipo de verificación que pedía este lente.

**[DÉBIL]** — La diferenciación de §7 es solo de **cantidad** (cuántas misiones simultáneas), no de **tono**. El catálogo de 10 tipos (`volumen`, `duelo`, etc., §3) es el mismo set de nombres/plantillas para PRIMARIA (niños) y SERIO (adultos) — las dos únicas bandas con contenido real en el MVP según el propio §0. El documento no dice si el copy de una misión ("completa un reto modo FLUIDEZ") suena igual para un niño de 8 años que para un adulto en la franja SERIO N8-N10, ni si el léxico motivacional de cierre de día debe diferir. Dado que §7 sí hizo el trabajo de diferenciar por cantidad, la ausencia de la misma pregunta para tono es una asimetría notable.

---

## 4. Mapa de progreso y compañero

**[BIEN]** — La diferenciación por banda es la más citada y explícita de los siete: KINDER=Sabana sin números, PRIMARIA/SECUNDARIA=árbol de habilidades, SERIO/JR/PRO=dashboard numérico con compañero apagado por defecto — todo trazado a `mc-43` §8, que a su vez ya trae la separación KINDER/PRIMARY/TEEN/ADULT por diseño. Es el uso correcto de la investigación de bandas que este lente pedía verificar.

**[DÉBIL]** — Documento resumen: la sección de i18n se reduce a un título de issue ("reutilizar el canal de mensajes de Larry, sin cuarto catálogo") sin especificar si las etiquetas del mapa (nombres de nodos, logros del compañero) se autoran o se traducen, ni reafirmar el paso obligatorio por `numeros.ts` para el dashboard numérico de SERIO/JR/PRO. Puede ser aceptable por tratarse de un resumen que remite a `docs/planes/f7-juego.md`, pero tal como está el texto entregado, no cumple el lente por sí solo.

**[CONTRADICE]** *(hallazgo adicional, fuera del lente estricto pero con impacto directo en qué número se muestra/formatea por banda)* — Este documento afirma: *"XP = el mismo número que 'puntos' (D-010/D-024), agregado de por vida — nunca una segunda fórmula"*. Esto contradice frontalmente la tesis central de xp-niveles §0, que dedica una sección entera a demostrar que XP y puntos **tienen que ser dos números distintos** precisamente porque los puntos pueden bajar/resetearse por temporada y XP no puede. Si el dashboard SERIO/JR/PRO de este documento muestra "XP" pero en realidad reutiliza `score_totals` (que sí resetea por `period` y sí puede ir negativo en bandas cronometradas), el criterio "nunca baja, nunca se resetea" de D-014 ("cosméticos ganados, deterministas") queda roto en el mismo diseño que dice cumplirlo. Alguien tiene que reconciliar estos dos documentos antes de escribir código — es exactamente el tipo de colisión de nombre que el propio documento dice haber cazado para "nivel de jugador vs. nivel de dificultad" (§ crítica adversarial #1), pero no la cazó para XP vs. puntos.

También noto, con menor prioridad por ser mecanismo y no lenguaje: la racha de este resumen ("1 día de gracia/semana no acumulable") no coincide con el mecanismo real que el documento de rachas diseña (escudos ganados `floor(racha/7)`, tope 2, más pausa familiar de hasta 4/año). Mismo patrón de divergencia entre resumen y diseño detallado.

---

## 5. Ligas de ~30

**[BIEN]** — §9 declara con precisión: alias autorados por locale (ya construido), números vía `numeros.ts`/`convenciones.ts` con ejemplo concreto (`1.234` de-DE/es-ES ≠ `1,234`), copy de Larry autorado no traducido palabra por palabra (D-022, D-004) — coherente con la convención de los otros hermanos, a diferencia de xp-niveles.

**[BIEN]** — §6.2 es de las diferenciaciones por banda mejor sustentadas: KINDER opt-in default apagado + posición en **tercios** (nunca número exacto, citando mc-18 impl. #7) vs. PRIMARIA+ default encendido + posición numérica exacta, con el umbral fino dejado como pregunta al dueño en vez de inventado.

**[DÉBIL]** — El principio "un mensaje de descenso no puede sonar a regaño en ningún idioma" (§9) cubre el eje de idioma pero no el eje de banda: no dice si el tono de "ascendiste"/"descendiste" debe diferir entre un niño de PRIMARIA y un adulto en SERIO (única banda con contenido real de liga hoy, junto con kinder que ni participa en liga de forma comparable). Menor que los hallazgos de xp-niveles/racha/misiones porque el foco aquí es más numérico que narrativo, pero la misma pregunta que ya se hizo en otros lugares para el copy de celebración no se repite aquí para el copy de descenso.

---

## 6. Tablero global con alias generados

**[BIEN]** — El ejemplo más completo de los siete en ambos ejes. §8: alias autorados no traducidos, y un matiz correcto que ningún otro documento hace: *"los puntos y posiciones se formatean... según el locale de **quien mira**, no el `alias_locale` del dueño de la fila"* — resuelve correctamente el caso de un tablero que mezcla locales por diseño. §3 (escalera de visibilidad) es la diferenciación por banda más granular y mejor citada: KINDER=nada, PRIMARIA-top20=posición exacta, PRIMARIA-resto=solo su total sin rango, SECUNDARIA/SERIO/JR/PRO=posición exacta siempre — con justificación distinta y citada (mc-10, mc-18, mc-43) para cada celda de la tabla, incluyendo por qué se eligió la lectura *más* conservadora de mc-18 para la franja de en medio de PRIMARIA en vez de la intermedia.

Sin hallazgos negativos en este lente para este documento.

---

## 7. Cosméticos ganados (deterministas)

**[BIEN]** — El documento que mejor resuelve exactamente lo que este lente pedía verificar. §1.2 diferencia tono/mecánica por banda con cita específica por banda, calcada del estilo mc-20/21/22/23 que el lente pide: KINDER/PRIMARIA=avatar de vestir (mc-21 impl. 6, "wardrobe effect"), SECUNDARIA=nada de vestir mascota, insignias ligadas a maestría no a gasto/popularidad (mc-22 impl. 8, citada casi textual), SERIO/PRO=color reservado para estado no decoración, skin apagado por defecto (mc-23 §14, mc-43 impl. 8). Es la única vez en los siete documentos donde se cita investigación específica de tono por banda de la forma que el lente esperaba encontrar en todos.

§6 aplica explícitamente la implicación "kinder no lee" al diseño del catálogo (silueta bloqueada + sorpresa en vez de catálogo con condiciones de texto para el niño, reservando el catálogo con condiciones para el panel del padre). Esto es exactamente el patrón que el lente pedía verificar ("kinder no lee... adulto/teen sí leen, tono distinto").

§5: arte no se multiplica por locale (correcto, distinto del audio de F6), pero el texto sí se autora no se traduce — consistente con la convención mayoritaria, y además reconoce honestamente un hueco no resuelto (posible connotación cultural distinta de un ícono por mercado, dejado como criterio de aceptación del revisor nativo).

Sin hallazgos negativos en este lente para este documento.

---

## Resumen

| Subsistema | Autoría vs. traducción (D-022) | Formateo numérico por locale | Diferenciación de tono por banda |
|---|---|---|---|
| XP y niveles | **CONTRADICE** hermanos en "Rango 5" | BIEN | FALTA (evento de celebración) |
| Rachas | BIEN | BIEN | FALTA (SERIO/JR/PRO sin diseñar) |
| Misiones | BIEN | BIEN | DÉBIL (solo cantidad, no tono) |
| Mapa/compañero | DÉBIL (resumen, sin detalle) | DÉBIL (no reafirmado) | BIEN |
| Ligas | BIEN | BIEN | DÉBIL (descenso/ascenso) |
| Tablero global | BIEN | BIEN (mejor caso: locale del visor) | BIEN (más granular) |
| Cosméticos | BIEN | N/A (números pequeños) | BIEN (mejor caso, cita mc-21/22/23) |

**Hallazgo transversal más importante:** la lectura de D-022 se bifurca dentro de F7 — cinco documentos (racha, misiones, ligas, cosméticos, tablero) tratan toda cadena de producto como autorada por locale citando D-022; xp-niveles trata "Rango 5" como traducción mecánica citando el mismo D-022. Esto debe resolverse antes de escribir las 322+210+119... cadenas de F7, porque cambia el proceso (traductor vs. revisor nativo que autora) y el presupuesto.

**Segundo hallazgo transversal (fuera del lente estricto pero verificado al leer):** mapa-companero contradice a xp-niveles sobre si XP y puntos son el mismo número o dos números deliberadamente distintos — esto determina qué dato exacto se muestra en el dashboard SERIO/JR/PRO que el propio mapa-companero diseña por banda, así que también tiene efecto directo sobre "qué número se formatea y se muestra" en ese subsistema.

**Patrón por banda:** los documentos que mejor resolvieron la diferenciación de tono (cosméticos, tablero-global, mapa-companero) son los que citaron investigación específica por banda (mc-21/22/23, mc-10, mc-43 §8) celda por celda. Los que peor lo resolvieron (racha, xp-niveles para el evento de celebración, misiones para el tono) son los que trataron "PRIMARIA en adelante" o "todas las bandas" como un bloque uniforme sin repetir el ejercicio de citar evidencia por banda que sí hicieron para otras decisiones del mismo documento.


### Ángulo: auditorias-estructura

# Revisión F7 — auditabilidad y estructura (lente: patrón S0/S1/S2/#57·#63·#69 y F3/#28)

Leí `audits/run.mjs` completo (162 líneas), `audits/adversarial/cartas.mjs`, `audits/child-free-text.mjs`, `audits/puntaje-servidor.mjs`, las issues #57/#63/#69/#28 completas, y el archivo real `docs/planes/f7-juego.md` (subsistema "mapa-companero", que en el encargo solo vino resumido). Los otros seis subsistemas no existen todavía como archivo en `docs/planes/` — llegaron solo como texto pegado en el encargo.

## Hallazgos, de mayor a menor severidad

**1. Contradicción de diseño entre dos subsistemas hermanos sobre qué ES el XP — no es redundancia, es incompatibilidad.**
`docs/planes/f7-juego.md:237-269` (mapa-companero, §3 "XP: un solo número, no una fórmula paralela") fija como **decisión tomada**: *"XP **es** el mismo valor que produce `calificar()`... sin segunda fórmula, sin segundo auditor de fórmula."* El subsistema `xp-niveles` construye su diseño entero sobre lo opuesto (§0): *"XP no es el mismo número, y la diferencia no es cosmética"* — precisamente porque los puntos pueden ser negativos y resetearse por temporada, y XP nunca. Su auditor propuesto `audits/motor-xp.mjs` regla 1 bloquea justo lo que mapa-companero pide: "cuenta archivos que calculan XP fuera de `packages/motor/src/xp.ts`" — si `xp_total` se deriva de `calificar()` como manda f7-juego.md, ese archivo `xp.ts` no existe y la propia migración `xp_totals` (§6 de xp-niveles) tampoco tendría sentido. Si ambos issues se abren tal cual están escritos, la que se cierre segunda invalida los criterios de aceptación de la primera. Esto necesita resolverse ANTES de crear las issues, no descubrirse en el PR.

**2. Ninguno de los seis subsistemas dados en texto completo lleva la sección "Auditoría de cierre — decisión del dueño" con el comando exacto que #57/#63/#69/#28 sí llevan.**
Verificado con grep sobre el propio `f7-juego.md`: cero apariciones de `adversarial.mjs --todos` ni `subir-sarif`. Los otros seis (xp-niveles, rachas, misiones, ligas, tablero-global, cosmeticos) tampoco la mencionan en ningún punto del texto que recibí. El patrón establecido no es solo "auditores propuestos" — es correr **la flota entera** (`node audits/adversarial.mjs --todos` + `subir-sarif.mjs`) al cerrar la fase, con la justificación textual de por qué (F0 se cerró con un criterio sin verificar). Ninguna de las siete issues-paraguas de F7 lo reproduce. La issue de misiones "Auditoría de cierre — los dos auditores nuevos vistos fallar antes de bloquear" reusa el mismo título pero para otra cosa (ver hallazgo 9) — riesgo de que alguien lo dé por cerrado creyendo que ya corrió la flota completa.

**3. `audits/child-free-text.mjs` (ACTIVE, línea roja #3) tiene una lista blanca de tablas hardcodeada, y ningún subsistema de F7 propone extenderla.**
`audits/child-free-text.mjs:25`: `const CHILD_TABLES = ["child_profiles", "child_image_pin", "skill_state"];`. Los siete subsistemas juntos introducen `xp_totals`, `child_streak`, `league_cohort`/`league_membership`/`league_duel`, `mission_daily_summary`, `cosmetic_catalog`/`child_cosmetics_unlocked` — todas tablas donde el sujeto es un niño. Ninguna issue propuesta dice "agregar `<tabla>` a `CHILD_TABLES` de `child-free-text.mjs`". El auditor seguirá pasando en verde sin haber mirado ni una columna de las tablas nuevas — exactamente el modo de falla que el propio preámbulo de `run.mjs` describe ("de los ocho que ya estaban ahí, seis fallaban abiertos sin que nadie lo supiera").

**4. Redundancia real entre auditores propuestos por distintos subsistemas — deberían fusionarse, no construirse dos veces.**
- `audits/tablero-orden-puntos.mjs`: propuesto **con el mismo nombre** de forma independiente por mapa-companero (`f7-juego.md:592`) y por tablero-global (§9). Mismo propósito exacto (orden por puntos, no por θ, cita D-025 y su condición de revisión).
- `cosmetico-determinista.mjs` (mapa-companero, singular) vs `cosmeticos-deterministas.mjs` (subsistema cosmeticos, plural, con más alcance — "sin precio, sin azar, sin cosmético huérfano"). Mismo propósito, nombres distintos, dueños distintos.
- `liga-mismo-banda.mjs` (mapa-companero) vs `liga-sin-fusion-cohorte.mjs` (subsistema ligas, que además cubre `tipo_participante`, el hallazgo más fuerte de ese documento §7.1 — mapa-companero ni siquiera contempla la mezcla niño/adulto).
- `duelo-edad-minima.mjs` (mapa-companero) vs `duelo-elegibilidad.mjs` (ligas, que cubre edad **y** banda KINDER excluida **y** opt-in — superconjunto).
- `racha-no-penaliza-limite.mjs`: propuesto solo por mapa-companero. El subsistema `rachas`, que es el dueño real y detallado del tema, tiene una issue con ese propósito exacto ("El corte de pantalla nunca rompe la racha") pero **no nombra ningún archivo de auditor para ella** (ver hallazgo 9).

Neto: de los 6 auditores que propone mapa-companero, 4 duplican o casi-duplican auditores que, por diseño de propiedad, pertenecen a subsistemas hermanos más detallados. Riesgo concreto: cada lado asume que el otro lo construye, o se construyen dos archivos parcialmente redundantes que divergen con el tiempo.

**5. Miscuenta interna en `f7-juego.md`.** §13 lista una tabla de **6** auditores nuevos pero el párrafo siguiente dice *"Los **cuatro** auditores nuevos entran con su caso en `audits/pruebas-auditores.mjs`"* (`f7-juego.md:596`). Ni "cuatro" ni "seis" coincide con nada más en el documento — hay que corregirlo antes de abrir la issue de auditores.

**6. Cita a una carta adversarial que no existe con ese nombre.** `f7-juego.md:603` dice que se amplía el alcance de `rachas-y-tiempo-de-pantalla` y `patrones-oscuros`. El id real en `audits/adversarial/cartas.mjs:178` es **`rachas-pantalla`** (título humano "Rachas y tiempo de pantalla" — de ahí la confusión, pero el id de línea de comandos y de `cita` es el corto). Si la issue se abre citando el nombre largo, quien la implemente no encuentra el archivo a editar. El subsistema `ligas`, en cambio, sí cita bien `privacidad` y `patrones-oscuros` por su id real.

**7. Dos subsistemas (ligas, tablero-global) no tienen ninguna issue dedicada a construir/activar sus auditores nuevos**, a diferencia de xp-niveles (issue `audits/motor-xp.mjs`), misiones (issue "Auditoría de cierre — los dos auditores nuevos...") y cosmeticos (issue "Auditor determinista `cosmeticos-deterministas.mjs`"). Ligas menciona `liga-sin-fusion-cohorte.mjs` y `duelo-elegibilidad.mjs` solo en prosa (§10); su lista de 9 issues no tiene ninguna titulada para construirlos y ponerlos en `ACTIVE` de `run.mjs` con caso en `pruebas-auditores.mjs`. Tablero-global tiene el mismo problema con sus 4 auditores de §9 — su lista de 5 issues no incluye ninguna de auditor.

**8. `audits/puntaje-servidor.mjs` no cubre XP, y nadie propone extenderlo.** Su regex `LEE_DEL_CUERPO` (`audits/puntaje-servidor.mjs:24`) busca `score|puntaje|puntos|points|rating|theta|elo` en el cuerpo de una petición — no `xp`. El diseño de xp-niveles pone el cálculo de XP en el mismo Worker/DO que calcula puntos (§6, mismo `responder()`), exactamente la superficie que este auditor protege para puntos. Ninguna issue de F7 propone añadir `xp`/`total_xp` a esa lista, así que un cliente que mande `{xp: 999999}` no lo cazaría ni este auditor ni el nuevo `motor-xp.mjs` (que solo vigila que no exista un segundo *cálculo*, no que el número no llegue del cliente).

**9. La issue "Auditores de la racha: un solo motor, nunca se vende, nunca culpa" (subsistema rachas) nombra tres propiedades en el título y solo cita un archivo en el cuerpo** (`racha-nunca-se-vende.mjs`, solo para "nunca se vende"). "Un solo motor" y "nunca culpa" no tienen archivo nombrado en ningún lugar del documento — a diferencia de xp-niveles, donde `motor-xp.mjs` enumera sus 4 reglas con nombre en el mismo párrafo (§11).

**10. "Qué NO incluye" como sección propia, presente de forma inconsistente.** Está como encabezado explícito en xp-niveles (§12), misiones (§9), ligas (§11) y mapa-companero (§15 de `f7-juego.md`). Está ausente como sección dedicada en rachas (solo notas sueltas en §0/§7), tablero-global (§10 mezcla límites de diseño con alcance, sin encabezado "Qué NO incluye") y cosmeticos (alcance solo mencionado inline en la intro, sin sección).

**11. `kinder-sin-examen.mjs` (ACTIVE) se cita por nombre en misiones (§2) pero no en xp-niveles**, pese a que xp-niveles hace la misma clase de afirmación fuerte sobre superficies de kinder (§8-9: "nunca un número", "nunca usa `rtMs`"). No es un calce perfecto (ese auditor vigila exámenes/cronómetros, no visualización numérica), pero ninguna issue de xp-niveles propone un auditor de UI que verifique "en KINDER, `total_xp` nunca se renderiza como número" — la regla queda solo en prosa de diseño, sin gancho verificable en `run.mjs` ni en el auditor nuevo (que es de `motor.ts`, no de interfaz).

## Resumen para el dueño

De los cuatro chequeos que pediste: (1) la mayoría de issues sí cita un archivo de auditor real o propuesto, con las excepciones nombradas en 7 y 9; (2) sí hay redundancia real y concentrada — específicamente los 4-de-6 auditores de mapa-companero que duplican trabajo de subsistemas hermanos, más el duplicado exacto de nombre `tablero-orden-puntos.mjs`; (3) ninguna de las siete issues-paraguas reproduce el patrón "Auditoría de cierre" con el comando exacto de #57/#63/#69/#28, y "Qué NO incluye" falta como sección en tres de siete; (4) `child-free-text.mjs` y `puntaje-servidor.mjs` son los dos auditores ACTIVE con más exposición a F7 y ninguno de los siete documentos propone extenderlos — son hallazgos más importantes que cualquiera de las preguntas ya planteadas al dueño en los propios documentos, porque son huecos de auditoría silenciosos, no decisiones de producto.

El hallazgo #1 (contradicción XP vs. puntos entre `xp-niveles` y `f7-juego.md`) es el único que bloquea: las dos issues-paraguas no pueden aceptarse ambas tal como están redactadas.


### Ángulo: investigacion-fidelidad

# Auditoría de fidelidad de citas — F7 (7 subsistemas)

Verifiqué contra los archivos reales en `docs/research/` (mc-10, 16, 17, 18, 19, 25, 30, 43, 46) y contra las URLs externas citadas (WebFetch en vivo). mc-25 y mc-30 solo aparecen en listas de "se leyó" sin ninguna cita puntual atribuible en ningún subsistema — no hay nada que verificar ahí.

## Fallas encontradas (con evidencia)

**1. XP y niveles §3.1 — la cita de "designthegame.com" no está en esa página; pertenece a la otra fuente citada.**
El bloque *"Exponential Curve — each threshold = previous value × coefficient... Disadvantage: coefficient selection is critical—too low yields flat progression; too high creates unreachable endgame values"* se atribuye a `designthegame.com/.../example-level-curve-formulas-game-progression`. Fetché esa página dos veces (pidiendo resumen y pidiendo texto verbatim): no contiene esa advertencia ni ese vocabulario; solo trae la fórmula `XP_base·Multiplier^(n−1)` sin lista de ventajas/desventajas. Fetché la segunda URL citada (`gamedeveloper.com/.../quantitative-design...`) y **ahí sí** está, verbatim, exactamente esa frase de "Exponential Curve... coefficient selection is critical". Es decir: las dos citas del documento en realidad vienen de la **misma** fuente (gamedeveloper.com), no de dos fuentes independientes que se corroboran entre sí como el texto da a entender. La segunda cita ("early thresholds are easy to reach... without reaching hyperbolic values") sí está correctamente atribuida a gamedeveloper.com — verificada verbatim.

**2. XP y niveles §2 — "el préstamo más barato y menos controvertido" no describe el bono de finalización, describe otra mecánica.**
El texto dice que mc-16 documenta el `+20 flat per-session completion bonus` (implicación de diseño 7) *"como el préstamo 'más barato y menos controvertido' de todo el inventario de mecánicas de Duolingo"*. Leí mc-16: esa frase ("the cheapest, least controversial 1:1 borrow from Duolingo") es la **implicación 6**, y describe el **Daily Quest**, no el bono de +20 XP. La implicación 7 (el bono) no trae ninguna calificación de "barato/poco controvertido" en el original — es una caracterización añadida, atribuida al número equivocado.

**3. XP y niveles §7 — cita a mc-43 sin respaldo textual.**
*"mc-43 documenta que la celebración tiene valor motivacional incluso sin premio material [§8, implicación 8]"*. Grepeé "celebrat" en el archivo completo de mc-43: cero ocurrencias. Ni el hallazgo §8 (efecto de gradiente de meta / visualización de progreso) ni la implicación de diseño 8 (skins por banda de edad) dicen nada sobre celebración sin premio material. Es una afirmación sin respaldo en el documento citado.

**4. Cosméticos §1.2 — documento equivocado: la cita es de mc-43, no de mc-16.**
*"mc-16 §8 (Duolingo) documenta que cambiar la metáfora del mapa produjo rechazo visible de usuarios"*. mc-16 (mecánicas de Duolingo: rachas, XP, corazones, ligas, notificaciones) nunca menciona el cambio de árbol de habilidades a camino lineal. Ese hallazgo exacto — *"it replaced its tree-shaped skill map with a linear path in August 2022, drawing visible, sustained user backlash"* — está en **mc-43 §8** ("Visualizing progress for children"), no en mc-16. Ambos documentos tienen contenido en un "§8" propio, lo que probablemente causó la confusión, pero el número de documento (mc-16 vs mc-43) está mal.

**5. Misiones diarias §5 — cita atribuida a la sección equivocada dentro de mc-17.**
*"mc-17 hallazgo 4 y su tabla de líneas rojas dicen... 'No randomized/loot mechanics anywhere in the product, even free or cosmetic'"*. El hallazgo 4 de mc-17 es la taxonomía de Zagal/Björk/Lewis (patrones temporales/monetarios/de capital social) y no contiene esa oración; la fila más cercana de la tabla de líneas rojas usa otra redacción ("Variable/randomized reward drops"). La oración citada, verbatim, es la **Implicación de diseño #3**, sección distinta del mismo documento.

**6. Ligas §6.2 (pregunta 2 al dueño) — el "corte de 8-9 años" no está en la implicación #2 de mc-10.**
*"mc-10 impl. #2 sugiere un corte más cerca de los 8-9 años que del arranque de PRIMARIA a los 7"*. La implicación de diseño #2 de mc-10 trata de la defensibilidad del puntaje por velocidad desde grado 6-7 (~11+), no de edades 8-9 ni de visibilidad de posición en tablero. La cifra "grado 3 / edad ~8" que sí existe en mc-10 aparece en **Open Questions #2** ("default off through grade 3 / age ~8"), sobre el puntaje por velocidad — no sobre exactitud de rango — y no está numerada como "implicación #2".

## Punto menor, no un error de cita pero sí un hueco de honestidad

**Ligas §4.1-4.2** adopta las cifras reales de Duolingo (23.3% asciende / 16.7% desciende, verificadas en vivo — ver abajo) y cita correctamente mc-18 implicación 5 para "nunca descender a un inactivo". Pero esa misma implicación 5 también recomienda cifras más conservadoras que las adoptadas — *"Promote the top band (e.g., top 15-20%)... demote only the very bottom band (e.g., bottom 10%)"* — y el documento nunca menciona ni reconcilia esa discrepancia, aunque cita la fuente dos líneas después para otra parte de la misma regla. No es tan grave como los hallazgos 1-6 (no hay tergiversación de la fuente, solo omisión de una parte de ella), pero rompe el patrón de honestidad explícita que el resto del documento sí sigue.

## Colisión entre subsistemas hermanos (no es fidelidad de cita, pero es relevante a tu pregunta sobre D-025)

**Mapa-companero** dice: *"XP = el mismo número que 'puntos' (D-010/D-024), agregado de por vida — nunca una segunda fórmula."* Esto contradice directamente la tesis central (§0) del propio subsistema **XP y niveles**, que argumenta con detalle por qué XP **tiene que ser** una segunda fórmula separada — porque los puntos pueden ser negativos y resetearse por temporada en bandas cronometradas, lo cual rompería la garantía de "nunca baja" que exige D-014. Ningún subsistema cita mal una fuente aquí; es que dos documentos del mismo lote se declaran autoritativos sobre la misma pregunta y llegan a respuestas opuestas — vale la pena que quien reconcilie los 7 documentos lo vea antes de abrir issues.

## D-025 — verificación específica pedida

Ningún subsistema sustituye el ranking por puntos (D-025) por θ sin la misma honestidad explícita que D-025 ya modela. **Tablero-global** (§2), **Ligas** (§8) y **Misiones** (§5) reusan `calificar()`/puntos explícitamente y lo declaran; Tablero-global además extiende correcta y honestamente la crítica de mc-18/mc-44 explicando qué mitiga la segmentación por banda y qué no resuelve dentro de una misma banda — consistente con el patrón de D-025.

## Citas verificadas como fieles (no solo las que fallan)

- **mc-16 impl. 10** ("randomized-but-bounded reward reveals...") — Misiones §5, verbatim y bien numerada.
- **mc-17 §83** (fila de la tabla de líneas rojas) — Rachas §3, cita insólita por número de línea de archivo, pero verificada: es exactamente esa línea.
- **mc-19 impl. 8** (padre puede reiniciar/perdonar sin penalidad) — Rachas y Mapa-companero, usada dos veces, correcta ambas.
- **mc-18 impl. 5 y 7** (descenso suave excluye inactivos; nunca mostrar el último lugar exacto) — Ligas, verbatim y bien numeradas.
- **mc-10 impl. 3 y 6** (tableros públicos apagados por defecto para niños pequeños; personal-bests como puntaje primario) — Tablero-global, verbatim y bien atribuidas.
- **mc-43 impl. 5, 6, 7, 8 y hallazgo 5** — Cosméticos y Mapa-companero, todas correctamente citadas y numeradas.
- **mc-46** ("la ausencia de tabla es la función, no una limitación") — Misiones §8, verbatim.
- **Cowan (2010), PubMed** — confirmado en vivo: el paper sí establece ~3-5 ítems de memoria de trabajo en adultos jóvenes, con la capacidad subiendo desde los 7 años hasta la adultez — coincide con lo que Misiones afirma.
- **Duolingo Streak Freeze real** (tope 2, obtenible por cofres/gemas) — confirmado por búsqueda en vivo, coincide con Rachas §2.
- **Duolingo ligas reales** (30 miembros, top 7/23.3%, bottom 5/16.7%, Diamante solo desciende) — confirmado por fetch en vivo de duolingoguides.com, coincide con Ligas §4.1.

## Nota aparte, verificada por curiosidad (no citación de investigación, pero sustenta el hallazgo central de XP §1)

Confirmé en el código real (`packages/motor/src/puntuacion.ts:186`) que `calificar()` en efecto calcula `const puntos = a * (d - rtSeg) * (2 * acc - 1)` sin multiplicar por `valor` en la rama HSHS — el bug que XP y niveles §1 reporta es exacto, no una apreciación.


### Ángulo: completitud

# Auditoría de completitud — F7 "Juego" (7 subsistemas) contra master-plan.md y decisions.md

## Método

Leí completo `docs/master-plan.md` (599 líneas) y localicé todas las decisiones D-0XX citables en `docs/decisions.md` (1742 líneas, 54 decisiones), con foco en D-003, D-014, D-017, D-018, D-019, D-025, D-027, D-028, D-029, D-034, D-040, D-043, D-051. Crucé la fila `F7 · Juego` y las filas `F9`/`F10` de §13.2, y conté issues reales ya creados en GitHub (`gh issue list`) como vara de comparación de tamaño de fase.

---

## 1. Cobertura nominal: completa, en apariencia

La fila F7 de master-plan (§13.2) dice literalmente: **"XP, rachas con red, misiones, mapa, ligas de ~30, tablero con alias generados"**. D-014 (la decisión canónica) dice: **"XP y niveles · Rachas con red de protección · Ligas de ~30 · Misiones diarias · Cosméticos ganados (deterministas) · Mapa de progreso, compañero"**. Unión de ambas listas = 7 elementos, y hay exactamente 7 documentos, uno por elemento:

| Elemento (D-014 / master-plan §13.2) | Subsistema que lo cubre |
|---|---|
| XP y niveles | `xp-niveles` |
| Rachas con red | `rachas` |
| Ligas de ~30 | `ligas` |
| Misiones diarias | `misiones` |
| Cosméticos ganados (deterministas) | `cosmeticos` |
| Mapa de progreso, compañero | `mapa-companero` |
| Tablero con alias generados (master-plan §13.2, no está en D-014 pero sí en D-003/D-025/D-040) | `tablero-global` |

Nominalmente, nada de la fila F7 quedó sin dueño. **Pero esta tabla es engañosa**, porque `mapa-companero` no se quedó en su carril — ver §2.

---

## 2. Hallazgo central: `mapa-companero` duplica y **contradice** a los otros seis documentos

`mapa-companero` no diseñó solo "mapa y compañero" (su encargo real, según §0 del propio documento). Su lista de 19 issues incluye XP, racha, ligas, DUELO, tablero, misiones y cosméticos — los siete temas de F7 a la vez, con un nivel de rigor muy inferior al de los seis documentos dedicados, y en varios puntos **contradiciéndolos con datos concretos, no con matices de estilo**:

**2.1 — XP: ¿es un eje separado de los puntos, o el mismo número?**
- `xp-niveles` dedica su §0 entero a demostrar por qué XP **no puede** ser el mismo número que los puntos: los puntos pueden ser negativos en bandas cronometradas (`a·(d−RT)·(2·acc−1)`, D-010) y se resetean por temporada (`period`), y un sistema de niveles construido sobre un número que baja rompería la garantía "ganado, determinista" de D-014.
- `mapa-companero` dice literalmente: *"XP = el mismo número que 'puntos' (D-010/D-024), agregado de por vida — nunca una segunda fórmula"*. Esto es matemáticamente inconsistente con su propia frase "agregado de por vida": si se agrega un número que puede ser negativo, el agregado puede **bajar**, violando D-014.
- Estos son issues 3 de `mapa-companero` ("XP es el mismo número que los puntos de D-010/D-024, no una fórmula paralela") contra los issues 3-4 de `xp-niveles` — dos issues de F7 que, tal como están redactadas, no pueden implementarse ambas.

**2.2 — Ligas: los porcentajes de ascenso/descenso no coinciden entre tres fuentes**
- master-plan §6 afirma como hecho: *"Descenso suave (solo el 10% inferior, solo entre activos)"* — sin cifra de ascenso.
- `ligas` investigó la cifra real de Duolingo fuera del corpus y adoptó **23.3% asciende (7/30), 16.7% desciende (5/30)** — ya escalado por tamaño de cohorte (`round(tamaño×7/30)` / `round(tamaño×5/30)`), citando explícitamente que diverge del "10%" cuando no lo reconcilia contra el texto de master-plan.
- `mapa-companero` issue 12 dice **"ascenso 15-20% superior, descenso solo 10% inferior"**, citando "master-plan §6, ya citado" — es decir, repite la cifra vieja del master-plan sin la investigación que `ligas` sí hizo.
- Tres números distintos (10% / 16.7% / 15-20%) para el mismo mecanismo, en el mismo F7, ninguno reconciliado contra los otros dos.

**2.3 — Esquema D1: seis propuestas de tabla para el mismo estado**
`mapa-companero` issue 2 propone **una sola tabla consolidada**: *"Esquema D1 del estado de juego (XP, racha, cosméticos, misiones, historial de liga)"*. Los otros cinco documentos, cada uno de forma independiente, diseñaron **tablas separadas** con su propio razonamiento explícito de por qué no consolidar (`xp_totals` sin `period` ni `theme_band`; `child_streak`; `cosmetic_catalog`/`cosmetic_unlock_rules`/`child_cosmetics_unlocked`; `league_cohort`/`league_membership`/`league_duel`; `mission_daily_summary`). Nadie escribió el issue que reconcilia estas seis propuestas de esquema antes de que alguien empiece a migrar.

**2.4 — Tablero: mecanismo de opt-in inventado dos veces**
`tablero-global` documenta que el opt-in **ya existe**: `child_consents` con código `LEADERBOARD` (migración 0003), construido en F2/F3, solo falta el endpoint que lo dispare. `mapa-companero` issue 14 dice en cambio *"opt-in en `child_game_state`"* — una columna que no existe en ningún esquema real, reinventando un mecanismo que ya está a medio construir.

**Conclusión de esta sección:** antes de convertir estos 7 documentos en issues de GitHub, hace falta un paso de reconciliación explícito que decida, issue por issue, cuál de las dos versiones (la de `mapa-companero` o la del documento dedicado) es la que se construye — y casi siempre la respuesta correcta es la del documento dedicado, porque llegó con más investigación y más autocrítica. `mapa-companero` debería quedarse con lo que **nadie más cubre**: la definición de "mapa" (marco transversal, no la Sabana), la decisión Larry-vs-mascota-nueva, las tres vistas por banda (KINDER/PRIMARIA-SECUNDARIA/SERIO-JR-PRO) y el i18n de esas dos piezas — issues 1, 5, 6, 7, 8, 9, 19 de su propia lista, y descartar o fusionar 2, 3, 4, 10, 11, 12, 13, 14 (8 issues) hacia los documentos dueños del tema.

---

## 3. Interfaz rota entre `xp-niveles` y `cosmeticos`

`xp-niveles` §7 construye `EventoDeRango`/`detectarSaltoDeRango` explícitamente como la interfaz "hacia cosméticos, sin diseñarlos". `cosmeticos` §4 (tabla de mapeo a D-014) responde: *"Reservo `nivel_alcanzado` en el enum para cuando exista, sin usarlo"* — pero el tipo real, en `cosmeticos` §2:

```ts
export type LogroDeterminista =
  | { tipo: "habilidad_dominada"; habilidadId: string }
  | { tipo: "primer_intento" }
  | { tipo: "habilidades_dominadas_conteo"; conteo: number }
  | { tipo: "racha_dias"; dias: number }
  | { tipo: "liga_top_pct"; porcentaje: number };
```

**no incluye `nivel_alcanzado` ni ningún caso de rango/XP.** El propio documento de cosméticos se contradice entre su prosa (§4, promete el campo reservado) y su código (§2, no lo tiene). El efecto práctico: el evento que `xp-niveles` construyó específicamente para que cosméticos lo consuma no tiene dónde aterrizar en el enum de cosméticos tal como está escrito hoy. Esto debería ser un issue explícito de reconciliación entre ambos documentos, y no lo hay en ninguna de las dos listas.

---

## 4. F9 "Grupos infantiles" — lo que pide de F7, y si lo recibe

La fila de master-plan dice: *"Salón del maestro y club de papás sobre la misma tabla `grupo_infantil`: código, aprobación del padre, **tablero**, bitácora... F2, **F7**"*. D-027 añade: el dueño del grupo ve *"solo alias, puntos y racha"*.

- **Tablero:** cubierto explícitamente. `tablero-global` §6 diseña `calcularPosiciones(filas, opciones)` como módulo puro que F9 puede reusar sin reescribir la lógica de ranking, y aclara que el opt-in global no se hereda por accidente.
- **Racha:** cubierto explícitamente. `rachas` tiene el issue dedicado *"Racha de solo lectura para salones y clubs (D-044/mc-46)"*.
- **Puntos:** no es una necesidad nueva de F7 — `score_totals` ya existe desde F3.
- **Alias:** ya existe desde F2 (aunque `tablero-global` encontró que no es único — issue archivado correctamente en F2, no en F7).

**Veredicto F9: bien servido.** Los dos ganchos que pedía (tablero, racha) están diseñados con nombre y con función de interfaz explícita.

---

## 5. F10 "Clubs de adultos" — lo que pide de F7, y **no lo recibe**

La fila de master-plan dice: *"`club_adulto`, **retos con ventana de tiempo**, las tres formas de prenda, y Larry moderando el texto libre... F2, **F7**, F5b"*.

Repasé los 7 documentos buscando qué pieza de F7 alimenta "retos con ventana de tiempo" — el candidato obvio es el mecanismo asíncrono de DUELO que `ligas` construye (`league_duel`, ítems congelados, ventana de 48h, expiración silenciosa). Pero:

- `ligas` §11 menciona F10 **una sola vez**, y solo para decir que la verificación legal de "juego ilegal" es de F10, no de este subsistema — nunca propone que `club_adulto` reuse `league_duel` o el patrón de ítems congelados con expiración.
- `cosmeticos` §0 menciona F10/D-028/D-029 solo para decir "esto es un sistema distinto, no comparte tabla" — una frontera negativa, no una interfaz positiva.
- Ningún otro de los 7 documentos nombra F10.

**No existe, en ninguno de los 7 documentos, un issue que diseñe qué exactamente F10 va a importar de F7 para sus "retos con ventana de tiempo".** Dado que master-plan declara la dependencia explícitamente y D-028 (prenda tipo A, "meta colectiva") es estructuralmente idéntica a `meta_de_liga` de `misiones` y al bin-packing de cohortes de `ligas`, esto huele a trabajo que se va a duplicar cuando alguien diseñe F10 sin encontrar ninguna pieza reutilizable documentada. Es el hueco más concreto de esta auditoría del lado de "requisito de dependencia declarado y no resuelto".

---

## 6. Hallazgos menores

- **`xp-niveles` se contradice en su propio conteo.** §14 dice *"Lista de issues (10: 1 paraguas + 9 sub-issues)"* (1+9=10), pero la lista real bajo "Issues propuestas (9)" tiene 9 elementos totales (1 paraguas + 8 subs). El documento promete un issue que no entrega.
- **`tablero-global` cuenta un issue de F2 dentro de su "(5)".** La issue 5, *"F2 · El alias de un perfil de niño no es único"*, el propio documento dice que se archiva en F2, no en F7 — así que el conteo real de issues **de F7** de ese subsistema es 4, no 5.
- **master-plan §6 se contradice con D-014 sobre "historia".** La tabla de §6 (Gamificación) lista "Mapa, compañero, **historia**" en la columna Sí; D-014, la decisión canónica, dice solo *"Mapa de progreso, compañero"* — sin historia. No es un hueco de los 7 subsistemas (ninguno la reclama, correctamente, porque D-014 manda), pero es una inconsistencia interna de master-plan que vale la pena que el dueño sepa que existe, porque de ahí pudo salir la confusión de que `mapa-companero` tratara "historia"/Sabana como parte de su alcance.
- **master-plan no declara que F8 depende de F7**, pero varios documentos F7 (`cosmeticos` P3, `rachas` referencias al panel del padre) asumen que F8 va a leer datos de racha/XP/cosméticos que F7 produce. Cuando se diseñe F8, va a necesitar F7 como dependencia real aunque la tabla de §13.2 hoy no lo diga — vale una nota para cuando llegue esa fase, no una acción ahora.

---

## 7. ¿El total de issues es razonable?

Conteo real de issues de GitHub por fase completa, hoy:

| Fase | Issues reales |
|---|---|
| F2 | 23 |
| F3 | 21 |
| F4 | 22 |
| F5 | 20 |
| F6 | 7 |
| S0/S1/S2 | 5-6 c/u |

Suma propuesta para **F7 solo**, por subsistema:

| Subsistema | Issues propuestas |
|---|---|
| `xp-niveles` | 9 |
| `rachas` | 12 |
| `misiones` | 21 |
| `mapa-companero` | 19 |
| `ligas` | 9 |
| `tablero-global` | 5 (4 son de F7; 1 es de F2) |
| `cosmeticos` | 6 |
| **Total** | **81** (80 reales de F7 + 1 de F2) |

**81 issues para una sola fase es aproximadamente 3.5-4× el tamaño de F2, F3, F4 o F5 — cada una de las cuales es también una fase completa, no un subsistema.** Dos cosas explican parte de esa diferencia real (F7 tiene 7 subsistemas internos donde otras fases tienen uno o dos) pero no toda:

1. **Sobra `mapa-companero`.** Como se documentó en §2, entre 8 y 11 de sus 19 issues son redundantes con — y en varios casos contradicen — issues ya propuestas por documentos con más rigor. Descontando eso, el total baja a ~70-73.
2. **`misiones` con 21 issues es, por sí sola, del tamaño de F2 entera** (23 issues). Es defendible por la genuina complejidad del catálogo (10 tipos × contratos × algoritmo × auditores), pero varias son fusionables sin perder cobertura: por ejemplo las issues "El día de misiones usa el mismo límite de zona horaria que D-035" y "Racha e independencia de misiones" son guardarraíles de una línea, no trabajo de implementación separado del resto.

**Veredicto: el conteo está inflado, no por relleno artificial (cada issue individual tiene justificación real, a diferencia de "preguntas de relleno"), sino por falta de un paso de reconciliación entre `mapa-companero` y los otros seis documentos antes de listar issues.** Recomiendo: (a) reescribir `mapa-companero` para que ceda XP/ligas/tablero/misiones/cosméticos a sus dueños y se quede con ~8 issues propias; (b) revisar `misiones` para fusionar 3-4 issues de guardarraíl con las issues de implementación que ya las mencionan. Total esperado tras esa poda: **~62-68 issues** para F7 completo — todavía el subsistema más grande de la fase (justificado: son 7 mecánicas distintas), pero ya no 4× el tamaño de una fase hermana.

---

## Conteo final

| Subsistema | Issues propuestas (tal como están hoy) |
|---|---|
| F7 · XP y niveles | 9 |
| F7 · Rachas con red de protección | 12 |
| F7 · Misiones diarias | 21 |
| F7 · Mapa de progreso y compañero | 19 |
| F7 · Ligas de ~30 | 9 |
| F7 · Tablero global con alias generados | 5 (1 pertenece a F2) |
| F7 · Cosméticos ganados (deterministas) | 6 |
| **Total general** | **81** (80 de F7 + 1 de F2) |

**Hallazgos que requieren decisión antes de crear issues, en orden de severidad:**
1. `xp-niveles` vs `mapa-companero`: ¿XP es eje separado de puntos (nunca baja) o el mismo número (puede bajar)? Son incompatibles.
2. `ligas` vs `mapa-companero` vs master-plan §6: tres cifras distintas de ascenso/descenso de liga (23.3%/16.7% investigado, 15-20%/10% repetido de master-plan, 10% original de master-plan).
3. Seis propuestas de esquema D1 para el mismo estado de juego (`mapa-companero` consolidada vs. cinco tablas separadas) sin reconciliar.
4. `xp-niveles` → `cosmeticos`: la interfaz `EventoDeRango` no tiene caso correspondiente en el enum `LogroDeterminista` de cosméticos, pese a que el propio documento de cosméticos dice que sí lo reservó.
5. F10 depende de F7 según master-plan para "retos con ventana de tiempo", y ningún subsistema de F7 diseñó esa interfaz — solo exclusiones legales negativas.
6. `xp-niveles` promete 10 issues y entrega 9; `tablero-global` cuenta un issue de F2 dentro de su total de F7.
