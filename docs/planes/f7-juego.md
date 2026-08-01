# F7 · Juego — mapa de progreso y compañero

> **Fecha:** 2026-08-01 · **Estado del repo al diseñar:** `main`, F4 en Todo (sin
> código), F3 implementado (`packages/motor/src/`), F5/F6 con plan consolidado
> pero sin construir. **F7 no tenía ninguna issue de GitHub antes de este
> documento** — es terreno abierto.
>
> **Alcance de este documento:** un subsistema de F7 — "mapa de progreso y
> compañero" — no F7 completa. XP, racha, misiones, ligas y tablero se diseñan
> aquí porque el mapa y el compañero **los necesitan para tener algo que
> mostrar** (el mapa visualiza XP/racha/dominio; el compañero se viste con
> cosméticos que XP desbloquea) — no porque este documento sea el diseño
> integral de F7. Un documento posterior puede profundizar cada pieza.
>
> **Regla de este documento, igual que F5 y F6:** ninguna cifra se declara sin
> haberla atacado. Donde algo es criterio propio y no evidencia, se marca
> `[criterio]`. Donde depende de F4 sin que F4 exista, se marca `[contrato
> asumido]`.

---

## 0. Las dos preguntas que este documento tiene que resolver con evidencia

### 0.1 ¿Qué es "el mapa"? — Sabana ≠ mapa de progreso

**Conclusión: son cosas distintas, y confundirlas rompería F5b.**

Evidencia, en orden:

1. **D-019 fija la Sabana como contenido de kinder, con presupuesto de arte
   cerrado.** "Cada habilidad de kinder es un lugar del mapa... 14 lugares,
   ~30 piezas de arte." Son las 14 habilidades K01–K14 de la banda KINDER
   (master-plan §9), nada más.
2. **D-018 dice lo mismo desde el ángulo de los modos**: HISTORIA es "cadena
   de retos en la Sabana de Larry... el gancho principal **en kinder**". No
   dice "en el producto" — dice **en kinder**.
3. **F5b (la franja adulta N8-N10) prohíbe explícitamente la Sabana**: "Sin
   modo historia y sin arte de la Sabana. La Sabana es de kinder"
   (D-034). Si el "mapa de progreso" de D-014 fuera la Sabana, F5b no tendría
   ningún mapa que mostrarle a un adulto — y D-014 lista "mapa de progreso"
   como una mecánica del producto entero, en la misma fila que XP y rachas,
   que sí aplican a todas las bandas.
4. **F7 depende de F4** (master-plan §13.2), y F4 es el motor adaptativo que
   cubre las **seis bandas**, no solo kinder (D-002, D-044/D-046 hablan de
   ubicación adaptativa sin restringirla a kinder). Un mapa que dependiera de
   F4 pero solo existiera en kinder sería una dependencia falsa.
5. **`mc-43` §8 (avatares/progresión) ya trae la respuesta que este proyecto
   necesitaba** y la trae **banda por banda**, no una sola pantalla para
   todos: *"KINDER — a physical journey path with the mascot walking forward,
   no numbers; PRIMARY — a named-topic skill tree/mastery map; TEEN — a stats
   dashboard with an opt-in league; ADULT — plain numeric mastery metrics,
   gamified skin optional and off by default."* Es investigación externa
   citable, no una elección arbitraria de este documento.

**Decisión de diseño:** el "mapa de progreso" de D-014 es un **marco
transversal a las seis bandas**, del que la Sabana (D-019, propiedad de F5)
es la **instancia de la banda KINDER** — con contenido y arte ya
presupuestados, que F7 no vuelve a autorar. En las demás bandas, F7 diseña una
representación **sin contenido narrativo nuevo** (sin lugares, sin historia),
derivada de datos que F4 ya calcula. Esto es lo que hace que F5b sea
consistente: la franja adulta no tiene Sabana, pero sí tiene mapa — un
dashboard numérico, que es exactamente lo que `mc-43` recomienda para esa
banda y lo que no cuesta un solo asset de arte nuevo.

### 0.2 ¿Qué es "el compañero"? — decisión propuesta, no hecho consumado

Ningún documento del repo define "compañero" con detalle operativo. D-014 lo
nombra en la misma celda que "mapa de progreso" y no dice más. `mc-43` es la
única investigación que lo trata a fondo, y trae dos hallazgos que apuntan en
direcciones distintas — hay que decidir con ellos a la vista, no ignorarlos:

- **A favor de que el compañero sea Larry mismo:** `mc-43` §7 (agentes
  pedagógicos) encuentra que el personaje ayuda sobre todo si es **familiar**,
  citando el estudio de Calvert con Elmo (los niños de 21 meses aprenden mejor
  de un personaje que ya conocen que de uno nuevo, y darles un peluche del
  personaje nuevo primero cierra la brecha). Larry **ya es familiar** —es el
  personaje transversal de Ignia (D-004)— así que la investigación favorece
  reusarlo, no inventar uno nuevo.
- **En contra de una mascota nueva tipo Tamagotchi:** `mc-43` §6 documenta que
  el mecanismo de retención de un compañero-mascota y el mecanismo de culpa
  que lo hizo famoso **son el mismo mecanismo** — el dispositivo no funciona
  como compañero sin una amenaza, y la amenaza produjo el enganche y el
  backlash a la vez. La propia investigación deja como **pregunta abierta sin
  resolver** (`mc-43` pregunta 2) si construir un compañero tipo Tamagotchi
  vale la pena siquiera con la amenaza quitada.

**Decisión propuesta al dueño (no hecho consumado):** el compañero **es
Larry**, presente en el mapa como guía animada — camina hacia adelante en
KINDER (`mc-43` §8), aparece en cada nodo alcanzado en PRIMARIA/SECUNDARIA, y
queda disponible bajo demanda en SERIO/JR/PRO (mismo patrón que `mc-43` §9 ya
propone para la presencia de Larry por banda, coherente con F6). **No se
introduce una segunda criatura.** Se le añade una capa muy acotada de
accesorios deterministas (§10) — nunca una piel nueva, nunca alterar especie o
color de marca.

**Por qué se decide así y no con una mascota separada, con la crítica
completa:**

| | Larry-compañero (propuesto) | Mascota nueva y separada |
|---|---|---|
| Costo de arte | Cero adicional: reusa el pipeline de Recraft ya presupuestado para Larry (D-019, CLAUDE.md § Imágenes) | Un personaje nuevo completo: diseño, revisión de marca, continuidad en 7 locales de audio (F6 §4.6 ya mide que la voz de Larry en 4 de 7 locales ni siquiera está resuelta — una segunda voz multiplica ese problema) |
| Riesgo Tamagotchi | Bajo por construcción: Larry no tiene estado de vida/hambre, solo aparece cuando el niño juega — no hay nada que "descuidar" | Alto si se copia el loop de cuidado sin querer; `mc-43` mismo lo señala como pregunta sin resolver |
| Canon de marca | D-004 fija a Larry como "el mismo personaje transversal de Ignia... no un personaje nuevo" — coherente | Tensiona esa misma frase: introduce un segundo personaje que D-004 no previó |
| Familiaridad (evidencia) | `mc-43` §7 favorece explícitamente un personaje ya conocido | Empieza en cero de familiaridad |
| Riesgo para el canon de F6 | Real y hay que vigilarlo: F6 exige que Larry "nunca avergüence" y nunca suene condescendiente; vestirlo con un gorro no debería tocar esa voz, pero es una superficie nueva que un accesorio mal elegido podría rozar (p. ej. un accesorio que se lea como burla) | No aplica — la mascota es un personaje sin las reglas estrictas de tutor de Larry, lo cual la hace más *segura* de decorar pero también un personaje sin ningún propósito pedagógico propio |

La fila que no se puede eliminar del lado "en contra" es la última: dar a
Larry accesorios visuales es tocar, aunque sea tangencialmente, la misma
imagen de marca que F6 protege con un auditor de léxico por locale. Por eso el
catálogo de accesorios (§10) se mantiene deliberadamente pequeño y con
revisión de diseño obligatoria, no generado.

**Esto se marca explícitamente como decisión propuesta — ver Preguntas al
dueño (§14).**

---

## 1. Contrato asumido de F4 — lo que este diseño necesita y F4 todavía no da

F4 no tiene código. Este documento no puede diseñar contra su implementación,
solo contra su contrato declarado en el plan maestro. Lo que F7 asume
`[contrato asumido]`:

1. Por cada `(child_profile_id, habilidad)` existe un **`skill_state`** en
   `[0, 1]` — el mismo valor que `packages/motor/src/serie.ts` ya consume
   (`ejemploSegunPericia`, con los cortes 0.2 / 0.6 / 1.0). El mapa de F7
   **reusa esos mismos cortes**, no inventa una segunda escala de dominio.
2. Existe un **Durable Object por niño** (`math-challenge-learner-do`, ya
   inventariado) con un método de lectura que F7 puede llamar para obtener el
   vector de `skill_state` sin recalcular nada — F7 nunca reimplementa el
   modelo adaptativo, solo lo lee.
3. El nivel actual del niño (N1–N12, D-017) es legible del mismo lugar.
4. **Lo que NO se asume:** que F4 exponga aristas de prerrequisito entre
   habilidades. F5 §4.8 bloqueo 10 encontró que **ese campo no existe hoy en
   la tabla `skills`** ("No hay campo de prerrequisito en la escalera").
   Diseñar el mapa de PRIMARIA/SECUNDARIA como un árbol con flechas de
   prerrequisito **antes** de que ese campo exista sería repetir el patrón que
   la crítica de F5 ya encontró una vez: una feature que presupone un dato que
   el esquema no tiene. §6 de este documento diseña alrededor de ese hueco en
   vez de fingir que no existe.

---

## 2. Modelo de datos

**Principio de diseño, y por qué importa citarlo primero:** el mapa **no
tiene tabla propia**. Es una vista compuesta sobre datos que ya existen o que
otras fases ya van a poseer — `skill_state` (F4), `EstadoHistoria` (ya en
`packages/motor/src/historia.ts`, F3) y XP/racha (F7, nuevo). Guardar una
segunda copia del progreso solo en F7 crearía dos fuentes de verdad que se
pueden desincronizar — exactamente el problema que `packages/motor/src/
puntuacion.ts` documenta contra una segunda fórmula de puntuación
("Dos motores dan dos números para el mismo intento").

Lo que **sí** necesita tabla propia es el estado de juego que ninguna otra
fase posee: XP acumulada, racha, opt-in de tablero, cosméticos y misiones.

**Nota de numeración de migración:** D-053 ya reservó la migración `0005`
para el retiro de `birth_month`. Este documento usa **`000N` (el siguiente
número libre tras 0005)** como marcador — quien implemente debe verificar cuál
es el número real disponible en el momento, no asumir `0005` ni `0006` a
ciegas.

```sql
-- 000N_game_state.sql — XP, racha, cosméticos, misiones, historial de liga.
-- NINGUNA de estas tablas guarda intentos crudos (audits/no-attempts-in-d1.mjs
-- sigue limpio): todo aquí es estado agregado, de baja frecuencia de escritura.

CREATE TABLE child_game_state (
  child_profile_id            TEXT PRIMARY KEY
                               REFERENCES child_profiles(id) ON DELETE CASCADE,

  -- El MISMO número que el tablero global (D-025), acumulado de por vida.
  -- Nunca una segunda fórmula: sale de calificar() en puntuacion.ts (§3).
  xp_total                    REAL NOT NULL DEFAULT 0,

  streak_days                 INTEGER NOT NULL DEFAULT 0,
  -- Fecha LOCAL del niño (YYYY-MM-DD), no UTC (D-045, F6 §5.2: "día" necesita
  -- zona horaria o el tope/corte es irreproducible).
  streak_last_fulfilled_date  TEXT,
  streak_grace_available      INTEGER NOT NULL DEFAULT 1,   -- se repone lunes local
  streak_grace_reset_week     TEXT,                          -- semana ISO del último repuesto

  -- D-040: el tablero global es opt-in por hijo. Se registra igual que un
  -- consentimiento — quién, cuándo (mismo patrón que child_consents, D-051).
  leaderboard_opt_in          INTEGER NOT NULL DEFAULT 0,
  leaderboard_opt_in_at       INTEGER,
  leaderboard_opt_in_by       TEXT REFERENCES users(id),

  -- Si el compañero aparece decorado en el mapa. Default por banda al crear
  -- el perfil (KINDER/PRIMARIA=1, SECUNDARIA=1 pero apagable, SERIO+=0),
  -- ajustable después por el padre o el propio jugador adulto (mc-43 §8-9).
  companion_visible           INTEGER NOT NULL DEFAULT 1,

  updated_at                  INTEGER NOT NULL
);

CREATE TABLE cosmetic_unlock (
  id                TEXT PRIMARY KEY,
  child_profile_id  TEXT NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  cosmetic_id        TEXT NOT NULL,        -- catálogo estático en código, ver §10
  source_milestone   TEXT NOT NULL,        -- qué hito lo desbloqueó — auditable
  unlocked_at        INTEGER NOT NULL,
  UNIQUE(child_profile_id, cosmetic_id)
);

CREATE TABLE quest_assignment (
  id                TEXT PRIMARY KEY,
  child_profile_id  TEXT NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  quest_key         TEXT NOT NULL,   -- referencia al catálogo estático de §9, no una tabla
  period_type        TEXT NOT NULL CHECK (period_type IN ('daily','weekly')),
  period_start       TEXT NOT NULL,  -- YYYY-MM-DD o semana ISO, local
  completed_at        INTEGER,
  xp_awarded          REAL,          -- fijo por plantilla, NUNCA aleatorio (mc-17 imp. 3)
  UNIQUE(child_profile_id, quest_key, period_start)
);

CREATE TABLE league_season_history (
  id                TEXT PRIMARY KEY,
  child_profile_id  TEXT NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  league_id          TEXT NOT NULL,
  band               TEXT NOT NULL,
  week_start         TEXT NOT NULL,
  final_rank         INTEGER,
  final_points       REAL,
  outcome            TEXT CHECK (outcome IN ('promoted','held','demoted','frozen')),
  archived_at        INTEGER NOT NULL
);
```

Ninguna de estas tablas guarda texto libre de un niño (`audits/child-free-
text.mjs` sigue limpio) ni un intento individual (`audits/no-attempts-in-
d1.mjs` sigue limpio).

---

## 3. XP: un solo número, no una fórmula paralela

**Decisión de diseño, y la crítica que la motivó:** al leer el master-plan
de cerca, "XP" (línea de F7 en la tabla de fases) y "puntos" (D-010/D-024/
D-025) se pueden leer como dos sistemas distintos si nadie lo aclara — y un
segundo sistema de puntuación es exactamente lo que `puntuacion.ts` existe
para impedir ("Hay UN lugar donde vive la fórmula. `audits/motor-
puntuacion.mjs` bloquea el commit si aparece un segundo").

**Resolución:** XP **es** el mismo valor que produce `calificar()` en
`puntuacion.ts` — sin segunda fórmula, sin segundo auditor de fórmula. Lo que
cambia entre "XP" y "puntos de liga" es la **ventana de agregación**, no el
cálculo:

- **`xp_total`** (child_game_state) — acumulado **de por vida**. Es lo que
  alimenta el mapa y las misiones, y es el mismo número que ordena el
  tablero global (D-025).
- **Puntos de liga** — el mismo flujo de eventos, agregado solo dentro de
  **la semana en curso**, vivo en `math-challenge-league-do` (ya
  inventariado). Se resetea cada ciclo semanal; `xp_total` no.

**No se introduce un "nivel de jugador" 1–50 ni nada parecido.** D-014 dice
"XP y niveles" — la lectura de este documento es que "niveles" ya está resuelto
por D-017 (los 12 niveles de dificultad): XP alimenta el **mapa** y las
**misiones**, y el "nivel" que el niño sube es el mismo N1–N12 que ya existe.
Inventar una segunda escala de niveles colisionaría de nombre con la escalera
de D-017 en cada pantalla que muestre ambas cifras — el tipo de confusión que
D-010 ya sufrió una vez con las bandas de edad, y que `audits/tabla-
bandas.mjs` existe para impedir que se repita. **Esto se marca como decisión
tomada, no como pregunta al dueño**, porque no hay alternativa razonable que
no cree la misma colisión.

---

## 4. Racha con red de protección

Reglas ya fijas (D-014 regla 6, D-016, D-045):

- Cumplida por completar **≥1 reto** en el día — la meta diaria de kinder ya es
  "un reto, alcanzable en tres minutos" (master-plan §6); las demás bandas
  heredan la misma regla mínima.
- **Si el límite de pantalla corta la sesión, el día se da por cumplido**
  (D-014, D-016) — sin excepción, y verificado por un auditor nuevo (§13).
- **Fecha local del niño**, no UTC — el mismo hallazgo que F6 §5.2 hizo para
  el tope de gasto de Larry aplica aquí letra por letra: "UTC parte el día a
  media tarde en México". El corte de racha usa la misma zona horaria que
  D-016 usa para el corte nocturno.
- **Nunca se vende protección de racha** (línea roja #6). No hay ningún campo
  de precio ni de compra en `child_game_state`.
- **Reinicio del padre sin penalización**: un botón en el panel de padres que
  pone `streak_days = 0` sin copy de culpa — mc-19 implicación 8 ("we're still
  here, restart gently"), para la familia que vuelve de vacaciones y no quiere
  ver un "0" que se sienta como un fracaso acumulado.

**Lo que es criterio propio, no evidencia, y se marca así:**

`[criterio]` **1 día de gracia por semana, repuesto cada lunes hora local,
nunca acumulable entre semanas.** Ninguna investigación del repo da un número
verificado — `mc-16` documenta el "Streak Freeze" de Duolingo pero sus cifras
de efecto (21% menos abandono) están marcadas `[unverified]` en la fuente
misma, y en cualquier caso ese mecanismo se vende, lo cual está prohibido
aquí. Un día por semana es la elección de este documento porque: (a) es
gratis y no acumulable, así que no puede convertirse en una reserva que se
guarda para "hacer trampa" varias semanas seguidas; (b) coincide con el ciclo
semanal que ya gobierna las ligas (§8), así que no introduce un segundo
calendario. **Se marca como pregunta al dueño (§14)** porque es un número
inventado, no medido, y CLAUDE.md pide preguntar cuando la respuesta cambia
el diseño.

**No varía por banda de edad.** `mc-16` pregunta 2 deja esto abierto
explícitamente ("¿la severidad del quiebre de racha debe variar por banda de
edad?"). Este documento decide **una sola regla para todas las bandas**, por
simplicidad de implementación y porque D-016 ya hace variar la protección
*efectiva* por banda de forma indirecta — el límite de pantalla más corto de
KINDER (20 min) hace más probable que la regla "el corte cuenta como
cumplido" entre en juego que en SERIO (sin límite) — sin necesitar una
segunda tabla de excepciones.

---

## 5. Misiones diarias y semanales

**Regla dura, antes que el catálogo:** ninguna misión puede fallar por
alcanzar el límite de pantalla. Si el límite corta antes de que la misión se
complete, queda pendiente para el día siguiente — nunca "fallida", nunca resta
racha (misma lógica que D-014 regla 6, extendida aquí a explícita).

**Recompensa siempre fija, nunca aleatoria** — la línea roja de `mc-17`
implicación 3 aplica también a algo tan chico como una misión: "no
randomized/loot mechanics anywhere in the product, even free or cosmetic".
Cada plantilla de misión otorga un XP fijo, declarado en el catálogo, jamás
un rango ni una tirada.

**El catálogo, contado de verdad y no declarado en redondo.** Con el alcance
del MVP (kinder completo + franja adulta N8-N10, D-034 — nada de PRIMARIA,
SECUNDARIA, JR ni PRO todavía), estas son las plantillas que **de verdad
tienen contenido para ejecutarse hoy**:

| # | Plantilla | Tipo | Bandas donde funciona en el MVP | Por qué funciona / no funciona |
|---|-----------|------|----------------------------------|----------------------------------|
| 1 | Juega un reto hoy | diaria | KINDER, SERIO | Universal — cualquier modo cuenta |
| 2 | Practica 3 series de [habilidad] | diaria | KINDER | SERIO no tiene "series curadas" — D-018 enmienda dice explícito "sin curaduría por serie" en la franja adulta, así que esta plantilla no tiene con qué ejecutarse ahí |
| 3 | Corrige un ítem que fallaste | diaria | KINDER, SERIO | Existe en las dos bandas: repetir un ítem fallado no depende de curaduría por serie |
| 4 | Consigue racha de N días | semanal | KINDER, SERIO | Universal |
| 5 | Visita un lugar nuevo de la Sabana | diaria | KINDER | No existe Sabana en SERIO (D-034) — la plantilla no aplica ahí, no hay sustituto en el MVP |
| 6 | Termina tu meta diaria 3 días seguidos | semanal | KINDER, SERIO | Universal |
| 7 | Prueba el modo Fluidez hoy | diaria | — | Bloqueada en el MVP: Fluidez con reloj visible tiene más sentido a partir de PRIMARIA (D-010: en KINDER no hay reloj en absoluto, D-024); en SERIO sí hay Fluidez pero sin curaduría de serie la plantilla se reduce a la #1 — se difiere, no se cuenta |
| 8 | Compite en un DUELO | semanal | SERIO | KINDER está excluido por edad (D-018: DUELO es 8+); ver §7 sobre por qué solo SERIO tiene DUELO funcional en el MVP |

**Total utilizable en el MVP: 6 plantillas** (#1, #3, #4, #6 universales; #2 y
#5 solo KINDER; #8 solo SERIO). Las plantillas #2 y #5 activas en KINDER y
#8 en SERIO no se superponen — un niño de kinder nunca ve la misión de DUELO
y un jugador de SERIO nunca ve la de "visita la Sabana". Esto **no es "90
misiones"** ni ningún número redondo: es lo que sobrevive de listarlas una
por una contra el contenido que el MVP de verdad tiene, siguiendo la misma
disciplina que la crítica de F5 aplicó a los 964 ítems.

Plantillas #2/#5/#8 con dependencia de contenido futuro (PRIMARIA/SECUNDARIA)
se dejan **documentadas pero no construidas**: el motor de misiones (§13,
issue de esquema) debe admitir agregar plantillas nuevas sin migración —
`quest_key` es una cadena libre en código, no un enum en el esquema — para que
activar la plantilla #7 completa cuando llegue PRIMARIA no toque D1.

---

## 6. El mapa por banda

### 6.1 KINDER (N1–N3) — envoltura sobre la Sabana

F7 **no re-autora** la Sabana. Construye la capa de progreso que se apoya en
lo que ya existe:

- Estado de "lugar visitado / en curso / completado" viene de
  `EstadoHistoria` (`historia.ts`, F3) — F7 lo lee, no lo duplica.
- **Sin números visibles**, coherente con D-019 ("el niño no lee") y con
  `mc-43` §8 ("no numbers" para KINDER) — el "progreso" que un niño de cuatro
  años ve es la posición del compañero en el camino, no un porcentaje.
- El compañero (Larry) camina hacia adelante conforme se completan lugares —
  reusa las animaciones que F6 ya diseña para el veredicto (`thinking →
  presenting`), sin encargar animación nueva.

### 6.2 PRIMARIA / SECUNDARIA (N3–N8) — árbol de habilidades, sin aristas todavía

**No existe hoy el campo de prerrequisito** (§1.4). Diseñar un árbol con
flechas de dependencia entre habilidades sería construir sobre un dato que no
está — el error exacto que la crítica de F5 encontró una vez y que este
documento no va a repetir.

**Lo que sí se puede construir con lo que existe:** nodos agrupados por
**nivel** (N3, N4, N5…), cada nodo = una habilidad/tema dentro de ese nivel,
relleno del nodo = `skill_state` (0–1, mismo corte que `ejemploSegunPericia`).
Sin líneas de prerrequisito entre nodos — se agrupan por nivel, no se
conectan por dependencia. Cuando el campo de prerrequisito exista (fuera de
alcance de este documento — es trabajo de F4/F5), el árbol puede ganar
aristas sin cambiar el resto del diseño.

**Riesgo conocido y dicho de frente:** sin PRIMARIA en el contenido del MVP
(D-009/D-034), esta vista **no tiene datos que mostrar hasta que exista
contenido de PRIMARIA**. Se diseña ahora porque F7 depende de F4 (que sí
cubre todas las bandas) y porque construirla tarde sería repetir el patrón de
F9/F10 dependiendo de F7 sin que F7 exista — pero se declara aquí, sin
esconderlo, que **esta vista se queda vacía en el MVP**.

### 6.3 SECUNDARIA (parcial) / SERIO / JR / PRO — dashboard numérico

Sin mapa espacial. Barras o cifras de dominio por tema, racha, misión activa
y posición de liga si el usuario está en una — exactamente lo que `mc-43` §8
recomienda para TEEN/ADULT ("a stats dashboard with an opt-in league"; "plain
numeric mastery metrics, gamified skin optional and off by default").

**El compañero está apagado por defecto en SERIO/JR/PRO** (`companion_visible
= 0` al crear el perfil), encendible por el propio usuario. Un adulto que
retoma matemáticas veinticinco años después (el caso de uso del propio dueño,
`por-que-existe.md`, citado en D-034) no tiene por qué ver un rinoceronte
caminando — puede activarlo si lo quiere, pero el default es la vista seria.

---

## 7. Ligas de ~30

Reutiliza `math-challenge-league-do` (ya inventariado en `infrastructure.md`
— no se crea ningún objeto nuevo de Cloudflare para esto). Reglas:

- **Cohortes nunca cruzan `theme_band`** (D-003, `mc-16` implicación 5: "a
  hard age/grade-band constraint so a 6-year-old is never ranked against a
  12-year-old").
- **Rango por puntos de la semana en curso** (§3) — el mismo formulario de
  D-010/D-024, ventana semanal.
- **Ascenso suave: el 15-20% superior sube; descenso solo el 10% inferior, y
  solo entre activos** — cita exacta de `mc-18` implicación 5 y ya presente en
  master-plan §6 ("descenso suave, solo el 10% inferior, solo entre
  activos").
- **Inactividad congela, no desciende** — mismo `mc-18` implicación 5.
- Ciclo semanal corre como **alarma del propio `league-do`**, no un Workflow
  global nuevo: cada liga decide su propio ascenso/descenso de forma
  independiente, coherente con la razón por la que `mc-32`/`infrastructure.md`
  ya eligió "un DO por liga, no uno global" (serialización sin carrera, sin
  cola compartida). `math-challenge-leaderboard-rollup-workflow` (ya
  inventariado) queda reservado para el tablero **global** (§9), que sí es un
  cálculo agregado sobre todas las ligas.

**Arranque en frío, dicho de frente:** con pocos niños activos en una
banda+semana, una liga de "~30" puede no juntar ni 15. `[criterio]` **liga
sombra**: si al cerrarse la semana la liga tiene menos de 15 miembros activos,
no desciende a nadie esa semana — se congela entera, como si todos hubieran
estado inactivos. Evita el caso de un niño solo en su liga siendo "el último
lugar" contra nadie. Marcado como pregunta al dueño (§14): el número 15 es
inventado, no medido.

---

## 8. DUELO — el quinto modo de D-018, como feature de liga

D-018 ya define DUELO: "mismo set contra tu liga... reloj: sí... opt-in, solo
8+ años". Es, literalmente, una feature de F7 vestida de modo de reto — F3 lo
lista pero no lo implementa (no aparece en `serie.ts`, `sesion.ts` ni
`item.ts`).

**Diseño:** dentro de una liga, dos miembros reciben el **mismo set de
ítems** (para que el reto sea justo — sin exponer el ítem dos veces al mismo
niño en la misma semana, mismo principio de "exposición controlada" que
`mc-29`/anti-trampa tier 1-2 ya usa). El resultado se puntúa con la fórmula
normal de la banda del duelo (con reloj, aunque la banda por default tenga
"reloj opcional" — D-010: entrar a DUELO **fuerza** el reloj, porque el modo
mismo es de carrera) y **entra al mismo total semanal de liga** — no hay una
tercera cifra de "ELO de duelo" separada.

**Verificación de edad/contenido honesta, no solo declarada:** DUELO exige
8+ años (D-018). Cruzando eso contra el contenido real del MVP (D-009/D-034:
solo KINDER + franja SERIO N8-N10):

- **KINDER (4-6 años) queda excluido por la regla de edad**, sin importar el
  contenido — no hay ambigüedad aquí.
- **PRIMARIA/SECUNDARIA (7-17 años) no tienen ningún ítem en el MVP** — cero
  contenido, así que DUELO no tiene con qué ejecutarse aunque la edad
  calificara.
- **SERIO (adulto, presumiblemente 18+)** es la única banda del MVP con edad
  por encima de 8 **y** contenido real (~150 ítems N8-N10, D-034). Es
  además el caso de uso del propio dueño (`por-que-existe.md`, citado en
  D-034) y alimenta a F10 (clubs de adultos, que depende de F7).

**Conclusión que hay que decir de frente:** DUELO se construye ahora porque
la infraestructura de liga que necesita ya está reservada y porque F10
depende de F7 completo — pero **en el MVP, DUELO solo tiene una banda donde
de verdad se puede jugar: SERIO.** No es una feature inútil, pero tampoco es
la feature de PRIMARIA que su nombre en D-018 podría sugerir a primera
lectura. Se documenta así para que nadie prometa "duelos para niños de 9
años" en el lanzamiento.

---

## 9. Tablero global

Ya diseñado por D-025 (ordena por puntos, no por θ, con condición de
revisión explícita) y D-040 (opt-in por hijo). Lo que F7 construye
concretamente:

- `leaderboard_opt_in` en `child_game_state` (§2) — el padre lo enciende,
  nunca nace encendido (D-040).
- `math-challenge-leaderboard-rollup-workflow` (ya inventariado) recalcula el
  snapshot y lo escribe a `math-challenge-leaderboard-kv` (ya inventariado) —
  nunca escrituras por intento en KV (ya documentado en
  `infrastructure.md`).
- **Cadencia de rollup:** `[criterio]` **diaria**. `mc-18` recomienda
  "ventanas de calificación cortas" para Glicko-2 ("daily, given many small
  matches") — Math Challenge no usa Glicko/θ (D-025 lo rechaza a propósito),
  pero el mismo argumento de legibilidad aplica: un tablero que se mueve una
  vez al día es fácil de explicar ("se actualiza cada mañana") y barato de
  calcular contra uno que se recalcula por evento. Marcado como pregunta al
  dueño (§14) porque no hay medición de costo real detrás del número.
- Segmentado por banda (D-003) — el salón del maestro es su propio tablero,
  pero eso lo construye F9 (que depende de F7) reusando el mismo mecanismo de
  snapshot, no un sistema aparte.

---

## 10. Compañero: mecanismo de cosméticos

**Lo que este documento fija es el mecanismo, no el catálogo de arte real**
— igual que F5 fija el esquema del ítem y deja la autoría real a los
autores nativos, aquí se fija la regla y se deja el diseño visual de cada
accesorio a Recraft/revisión de marca.

- **Un accesorio determinista por lugar de la Sabana completado** — 14 nodos
  (K01–K14), reusando el arte ya presupuestado por D-019 en vez de abrir una
  línea de presupuesto nueva. Esto responde directamente al hallazgo de F5
  §1.2 de que "cada ítem de más es arte pagado que quizá nadie vea" — aquí no
  hay ítem de más: el hito que desbloquea el accesorio es el mismo hito que
  ya cuesta arte por otra razón (completar el lugar).
- **Nunca aleatorio, nunca comprable** (D-014, `mc-17` implicación 3 y 6).
- **Nunca altera la silueta, el color de marca ni la especie de Larry** — el
  naranja de Ignia y el diseño base del rinoceronte son de marca (guía de
  estilo); un accesorio es un sombrero, una banda, unas gafas, nunca un
  "traje" que lo transforme.
- **Consecuencia de alcance que hay que decir de frente:** con el MVP siendo
  kinder + franja SERIO (D-034), y SERIO teniendo el compañero apagado por
  defecto (§6.3), **el catálogo de cosméticos del MVP solo tiene audiencia en
  KINDER.** D-014 promete "cosméticos ganados" para el producto en general;
  este documento no lo contradice — solo declara que en el MVP concreto, la
  única banda donde alguien los ve es KINDER. Cuando SECUNDARIA/PRIMARIA
  tengan contenido, el mismo mecanismo (accesorio determinista por hito) se
  extiende sin rediseño.

---

## 11. Mapeo explícito a la tabla sí/no de D-014

| Fila de D-014 | Cómo la implementa este documento |
|---|---|
| **Sí** — XP y niveles | §3: XP = mismo número que puntos (D-010/D-024), agregado de por vida. "Niveles" = los 12 de D-017, sin escala nueva |
| **Sí** — Rachas con red de protección | §4: cumplida por 1 reto/día, corte de pantalla siempre cuenta, 1 gracia/semana no vendible, reinicio del padre sin culpa |
| **Sí** — Ligas de ~30 | §7: cohorte por banda, ascenso 15-20%/descenso 10% solo activos, congela en frío |
| **Sí** — Misiones diarias | §5: 6 plantillas usables en el MVP, recompensa fija, nunca falla por límite de pantalla |
| **Sí** — Cosméticos ganados (deterministas) | §10: 1 accesorio por hito de Sabana, nunca aleatorio ni comprable |
| **Sí** — Mapa de progreso, compañero | §0.1/§0.2/§6: mapa transversal a bandas (Sabana=instancia KINDER); compañero=Larry con accesorios, sin mascota nueva (propuesto) |
| **No** — corazones/vidas que bloquean | No existe ningún campo ni mecanismo de "vidas" en este diseño; practicar nunca se bloquea (línea roja #4) |
| **No** — moneda comprable | Ningún campo de precio, wallet o compra en `child_game_state`, `cosmetic_unlock` ni `quest_assignment` |
| **No** — recompensas aleatorias de pago | Cosméticos y misiones son deterministas por diseño (§5, §10); no existe ninguna tirada aleatoria en el camino de recompensa |
| **No** — notificaciones con culpa | Fuera de alcance directo de este documento (ver §12), pero cualquier notificación de racha que F7/F8 construyan hereda la prohibición explícita aquí, sin copy de pérdida |
| **No** — comparación pública de niños por nombre | El tablero usa alias generados (D-003/D-025), nunca nombre real; el mapa y el compañero son estrictamente privados al perfil y al padre — ni la liga ni el club ven el mapa de nadie (D-027: "el dueño ve solo alias, puntos y racha") |

---

## 12. i18n

**Ninguna superficie de este subsistema abre un cuarto catálogo de
mensajes.** Reusa lo que ya existe:

- Nombres de habilidad/tema en el mapa: las mismas claves i18n que ya
  producen `enunciado.clave` en el banco de ítems — no se traducen aparte.
- Texto del compañero (celebración, ánimo): el mismo catálogo de mensajes de
  Larry que F6 ya diseña por locale, con la misma frontera CANON/LOCALE/BANDA
  (F6 §3) — F7 no escribe un prompt ni un catálogo de frases nuevo, reusa las
  claves de `acierto`/celebración que F6 ya cubre en los 7 locales.
- Animaciones del compañero: reusa las ~18 animaciones que F6 §4.5 ya
  documenta como independientes de idioma ("la Sabana no habla") — cero
  trabajo de audio nuevo para el compañero.
- Números en el dashboard de SECUNDARIA+/SERIO/JR/PRO: pasan por
  `MATH_CONVENTIONS`/`numeros.ts` como cualquier otro número del producto
  (`mc-34`) — un XP de "1.234" en `es-MX` y "1.234" con coma en `es-ES` no
  son el mismo carácter, y este documento no introduce un formateador
  paralelo.

---

## 13. Auditores propuestos

Deterministas nuevos, siguiendo el patrón de `audits/` (nombre de archivo,
qué verifica, qué decisión cita):

| Auditor | Qué verifica | Cita |
|---|---|---|
| `audits/gamificacion-lista-negra.mjs` | Sin campos/columnas que coincidan con `heart\|life\|lives\|energy` atados a bloquear práctica; sin `Math.random()` en el camino de recompensa/cosmético/misión; sin tabla de moneda o wallet; sin plantilla de UI que muestre el nombre real de otro niño | D-014 tabla completa |
| `audits/racha-no-penaliza-limite.mjs` | Cuando una sesión termina por corte de límite de pantalla, `streak_last_fulfilled_date` se actualiza igual que si hubiera terminado por elección propia | D-014 regla 6, D-016 |
| `audits/tablero-orden-puntos.mjs` | El código de orden del tablero global no referencia ningún identificador tipo `theta\|rating\|elo\|glicko`; el mensaje de fallo apunta a D-025 y a su condición de revisión (≥200 respuestas/ítem) para que quien lo lea sepa cuándo esta regla deja de aplicar | D-025 |
| `audits/liga-mismo-banda.mjs` | El código de formación de cohortes de liga nunca junta dos `theme_band` distintos en una misma liga | D-003, `mc-16` imp. 5 |
| `audits/duelo-edad-minima.mjs` | El camino de entrada a DUELO comprueba edad/banda ≥ 8 años antes de admitir a un perfil | D-018 |
| `audits/cosmetico-determinista.mjs` | Cada `cosmetic_id` insertado en `cosmetic_unlock` mapea a un `source_milestone` fijo en una tabla de código, sin selección aleatoria en el camino | D-014, `mc-17` imp. 3 |

**Los cuatro auditores nuevos entran con su caso en
`audits/pruebas-auditores.mjs`** (D-032 enmienda 2026-08-01): se planta la
violación, se comprueba que el auditor bloquea **por la razón correcta**, y se
borra — nada de lo anterior cuenta como cerrado sin eso.

**No se crean auditores adversariales nuevos.** En cambio, se **amplía el
alcance declarado** de dos cartas ya existentes (D-032, los 23 adversariales
con LLM): `rachas-y-tiempo-de-pantalla` y `patrones-oscuros` deben poder ver
diffs que tocan mapa/compañero/misiones/ligas, no solo los archivos de racha y
límite de pantalla que cubrían hasta ahora. Es una edición de su carta
(`audits/adversarial/cartas.mjs`), no una llamada nueva por PR — coherente
con el riesgo que D-032 ya nombra sobre inflar la flota sin necesidad.

---

## 14. Preguntas al dueño

Solo las que de verdad cambian el diseño, con alternativas:

1. **¿El compañero es Larry con accesorios pequeños (propuesto en §0.2), o
   prefieres una mascota nueva y separada?** Alternativas: (a) Larry con
   accesorios — cero costo de arte adicional, cero riesgo de un segundo
   personaje que diluya el canon de D-004, pero comparte superficie con la
   voz cuidadosamente protegida de F6; (b) mascota nueva — más libertad
   visual y de mecánica (podría tener su propio pequeño "estado" sin tocar a
   Larry), pero abre un frente de diseño de personaje, revisión de marca y
   posiblemente audio en 7 locales que hoy no existe en ningún presupuesto.
2. **¿1 día de gracia por semana para la racha (§4) es el número correcto?**
   Alternativas: (a) 1/semana como aquí propuesto; (b) ninguna gracia
   adicional más allá de la regla de D-016 (el corte de pantalla ya protege
   la racha; una gracia extra podría sentirse redundante); (c) un número
   distinto (p. ej. 2/mes) si el dueño prefiere una cadencia mensual sobre
   semanal.
3. **¿El tablero global se recalcula diario o con otra cadencia (§9)?**
   Alternativas: (a) diario, como aquí propuesto — legible ("se actualiza
   cada mañana") y barato; (b) semanal, alineado con el ciclo de liga —
   menos trabajo de cómputo pero un tablero que se siente más lento; (c)
   otra cadencia si hay una medición de costo de Analytics
   Engine/Workflow que este documento no tiene.
4. **¿15 miembros activos es el umbral correcto para la "liga sombra" en frío
   (§7)?** Alternativas: (a) 15, como aquí propuesto; (b) un número más alto
   si el dueño prefiere ligas más llenas antes de arriesgar descenso; (c) no
   construir liga sombra y simplemente no formar liga hasta juntar ~30,
   dejando al niño en modo práctica sin liga esa semana.

---

## 15. Qué NO incluye este documento

Dicho de frente, para que nadie lo asuma incluido:

1. **No diseña el motor de notificaciones push** (VAPID, Workers, cadencia).
   `mc-19` ya deja un diseño técnico completo (Web Crypto en Workers,
   `nodejs_compat`); este documento solo hereda la prohibición de "sin
   culpa" para cualquier copy de racha que ese motor use — la implementación
   del canal es de F7 o F8, a decidir en otro documento.
2. **No diseña el panel de padres** que muestra el mapa/racha/misiones
   (eso es F8, que depende de F2).
3. **No diseña `child_group`/`adult_club`** ni el tablero de salón —
   eso es F9/F10, que dependen de F7 y reusan el mecanismo de snapshot de
   §9, no lo reimplementan.
4. **No resuelve el campo de prerrequisito de habilidades** que bloquea las
   aristas del árbol en §6.2 — eso es trabajo de F4/F5, fuera de este
   subsistema.
5. **No autora contenido de PRIMARIA/SECUNDARIA** — el árbol de §6.2 y las
   plantillas de misión #2/#5/#7/#8 (parcial) se quedan sin datos hasta que
   ese contenido exista, en fases posteriores al MVP (master-plan §14.3).
6. **No define el catálogo de arte real de los accesorios de Larry** (§10)
   — fija el mecanismo (determinista, 1 por lugar de Sabana), no los 14
   diseños concretos, que son trabajo de Recraft + revisión de marca.
7. **No revisa con abogado** ninguna implicación de privacidad nueva — el
   mapa y el compañero no introducen recolección de datos personales del
   niño más allá de lo que `child_profiles` ya guarda (D-013), pero esta
   afirmación no sustituye la revisión legal general que master-plan §14
   ya exige antes de producción.
