# F8 · Padres — plan detallado (panel de diagnóstico y reportes)

> Cubre 2 de los 3 subsistemas de F8 ("Padres"): **panel con diagnóstico** y
> **reportes**. El tercero, **límite de pantalla con corte suave**, ya tiene
> su propio documento y sus propias issues reales —
> [`docs/planes/f8-limite-pantalla.md`](./f8-limite-pantalla.md), issues
> #265-#274 — construido de forma independiente y verificado contra el repo
> con más rigor que este primer intento tenía cuando arrancó. Este documento
> no lo duplica; lo consume como fuente de verdad de "minutos jugados por
> niño por día" (`screen_time_daily_usage`).
>
> Producido por 3 agentes de diseño en paralelo, cada uno con permiso de
> salir a internet y con instrucción explícita de revisar los 23 auditores
> adversariales (`audits/adversarial/cartas.mjs`) y los 7 locales uno por
> uno — seguido de 5 críticos que revisaron los 3 diseños juntos.

## 0. Corrección de alcance — sin Stripe, decisión del dueño

**"No vamos a cobrar nada."** D-021 (Monetización) lista "panel del padre con
diagnóstico" y "reportes" como funciones del Plan Familia de pago. Por
instrucción explícita del dueño, tomada a mitad de este encargo (ver
[D-057](../decisions.md#d-057-f8-pospone-el-cobro-panel-reportes-y-límite-de-pantalla-se-construyen-gratis-para-todo-padre)),
las tres funciones de F8 se construyen **disponibles para cualquier padre,
sin gate de pago**. Stripe/el cobro en sí quedan fuera de esta fase por
completo — ninguna issue de F8 depende de una suscripción activa o un webhook
de Stripe.

## 1. Lo que la crítica cruzada encontró, y cómo se resolvió

**Hallazgo dominante: `panel-diagnostico` y `límite-pantalla` diseñaron, sin
verse, dos tablas D1 para el mismo hecho.** `panel-diagnostico` proponía
`screen_time_daily`; el subsistema hermano (ya con issues reales) había
construido `screen_time_daily_usage` — mismo hecho ("minutos jugados por niño
por día"), escrito en tiempo real (no por lotes, porque el corte necesita el
valor de *ahora*), con una columna (`ended_reason`) dejada explícitamente
lista para que panel/reportes no tuvieran que volver a tocar el esquema. Se
resolvió descartando `screen_time_daily`: el panel lee `screen_time_daily_usage`
directamente, y la pantalla de "hoy jugó X de Y minutos" que ambos diseñaron
por separado se recortó a una sola (#269, ya real) — el panel de diagnóstico
solo agrega la tendencia de 8 semanas que #269 no cubre.

**Segundo hallazgo:** `reportes` excluía "minutos practicados"/"días activos"
de su v1 con la justificación de que "no existe ningún rollup" — premisa que
el propio F8 invalida, porque `screen_time_daily_usage` es exactamente ese
rollup. Queda como pregunta al dueño (issue paraguas de Reportes, pregunta 5),
no resuelta en silencio.

**Hallazgos menores, corregidos directamente:** dos tablas nuevas sin agregar
a `CHILD_TABLES` de `audits/child-free-text.mjs` (mismo hueco silencioso que
ya se vio en F7); una extensión de `audits/retro-completa.mjs` técnicamente
inexacta (el auditor real está cableado a una sola fuente y un solo
directorio — se construye un auditor nuevo, no una extensión); una cita
fabricada de la documentación de Cloudflare Email Service en el primer
borrador de Reportes (corregida: la fuente real solo dice que el soporte de
correo masivo está planeado a futuro, no que esté prohibido); una atribución
de "derecho de acceso parental" a la matriz de obligaciones equivocada de
mc-25 (el derecho es real, COPPA §312.6/GDPR Art. 15, pero mc-25 no lo
documenta en esa tabla — se cita como conocimiento legal general, no como
hallazgo de esa investigación específica); y la carta adversarial
`locale-<idioma>` citada como si cubriera "registro para hablarle a un padre"
cuando su `caza` real dice explícitamente "para hablarle a un niño" — ningún
auditor cubre hoy el registro parental, hallazgo real sin auditor todavía.

**D-057** registra formalmente la corrección de alcance "sin Stripe" en
`docs/decisions.md`, donde CLAUDE.md manda que viva — antes solo existía
repetida, casi palabra por palabra, en tres documentos de subsistema.

---



---

## 2. Panel con diagnóstico

# F8 · Panel con diagnóstico

# F8 · Panel con diagnóstico — diseño operativo

> Subsistema de F8 · Padres. F8 no tiene issues todavía; este documento y las 9
> issues que propone son su primer subsistema diseñado. **Corrección de alcance
> vigente (decisión explícita del dueño, posterior a un primer intento de este
> encargo):** ninguna función de este documento depende de Stripe ni de una
> suscripción activa — D-021 (Plan Familia) sigue existiendo como decisión del
> proyecto, pero el cobro se pospone a una fase futura sin definir. Todo lo
> diseñado aquí queda disponible para **cualquier padre**, sin gate de pago.

## 0. Qué se leyó antes de diseñar

CLAUDE.md completo (línea roja #2 y #4 sobre todo); `docs/decisions.md` completo
(1839 líneas — D-011, D-013, D-014, D-016, D-017, D-020, D-021, D-024, D-025,
D-027, D-032, D-040, D-044, D-045, D-051, D-055, D-056); `master-plan.md` §13.2
y §14; `docs/planes/f2-cuentas-onboarding.md` (las 4 menciones de F8: alias del
dispositivo del hogar, tope de 6 perfiles con bandera en `CONFIG_KV`);
`docs/planes/f7-juego.md` completo (2916 líneas — encontré ~10 menciones reales
de F8, más de las ~7 que el encargo estimaba); `migrations/0002_child_profiles.sql`,
`0003_accounts_onboarding.sql`, `0004_consent_governance.sql`; `audits/run.mjs`
completo y `audits/no-attempts-in-d1.mjs` completo; `audits/adversarial/cartas.mjs`
completo (23 cartas); `docs/planes/f6-larry-profe.md` (grep dirigido de "padre" —
encontró un requisito real que ninguna búsqueda de "F8" iba a mostrar, ver §7);
investigación completa: `mc-26`, `mc-19`, `mc-25`, `mc-13`, y el índice
`docs/research/README.md` completo para no perderme `mc-28` (modo maestro,
citado abajo) y `mc-15` (escaleras de grado). WebSearch dirigido para la
pregunta que el corpus no contesta (§13). Revisé también `docs/planes/f5-contenido-kinder.md`
y `f6-larry-profe.md` completos para igualar el formato.

## 1. Qué lee el panel — una sola fuente de verdad por dato

Regla dura de este subsistema: **el panel nunca recalcula nada que ya tenga
dueño en otra fase.** Es exactamente la lección que la autocrítica cruzada de
F7 dejó escrita para cuando llegara F8 (f7-juego.md, hallazgo final): "F8 va a
leer datos de racha/XP/cosméticos que F7 produce […] vale una nota para cuando
llegue esa fase". Esta es esa nota, convertida en contrato:

| Qué se muestra | Fuente única | Quién es dueño | El panel |
|---|---|---|---|
| Dominio por habilidad | `skill_state` (`migrations/0002_child_profiles.sql:91`) | F4 (motor adaptativo) | lee `streak_correct`/`provisional_at`/`mastered_at`/`due_at`, nunca corre BKT/Elo propio |
| Puntos de tablero | `score_totals` | F3/D-025 | lee `total_score` por `period`/`theme_band`, nunca reimplementa `calificar()` |
| XP y Rango | `xp_totals` + `rangoDeXp()` (`packages/motor/src`) | F7 · xp-niveles | llama la función pura existente, nunca guarda ni deriva `rango` a mano |
| Racha | `child_streak` | F7 · rachas | lee `current_streak`/`shields_available`/`pause_until_local_date` |
| Liga | `league_membership`/`league_cohort` + `calcularPosiciones()` | F7 · ligas/tablero-global | reusa la función pura de ranking, no reordena por su cuenta |
| Cosméticos | `cosmetic_catalog`/`cosmetic_unlock_rules`/`child_cosmetics_unlocked` | F7 · cosméticos | lee el catálogo y el estado de desbloqueo, nunca otorga nada |
| Límite de pantalla (config) | `screen_time_settings` (F2, ya existe) | F2 | lee `daily_minutes`/`break_every_min`/`bedtime_local` |
| Límite de pantalla (uso) | `screen_time_daily` (**nueva**, §4) | F8 (este subsistema) | única tabla nueva de "hechos" que F8 posee de verdad |
| Notas del sistema | `child_diagnostic_notes` (**nueva**, §4) | F8 lee; F4/D-020 y F6 escriben | única tabla de "eventos" nueva |

Ninguna fila de esta tabla introduce una segunda fuente de verdad. Las dos
tablas nuevas (§4) son las únicas que F8 posee — todo lo demás es lectura sobre
lo que F4/F7 ya construyen o van a construir.

## 2. Qué NO muestra el panel, y por qué (la pregunta central del encargo)

**El padre ve el agregado, nunca el intento individual.** Tres razones
independientes, cada una suficiente:

1. **Es físicamente imposible sin violar un auditor ACTIVO.** Leí
   `audits/no-attempts-in-d1.mjs` completo: D1 no puede tener una tabla de
   intentos — el auditor falla en cualquier `CREATE TABLE` que matchee
   `attempts?|responses?|events?|telemetry|interaction_log`. Los intentos
   crudos viven en Analytics Engine (`math-challenge-attempts-ae`, mc-32 riesgo
   #1). Un panel que mostrara "aquí está cada pregunta que contestó y en qué
   tiempo" tendría que leer AE fila por fila y renderizarlo — posible
   técnicamente, prohibido por diseño (ver el auditor nuevo en issue 9, §12).
2. **`mc-13` ya lo recomienda así, para el caso general.** Implicación de
   diseño #10: "Defer BKT/PFA/DKT to a v2 'skill mastery' layer, not v1 item
   selection […] a nightly BKT/PFA batch per fine-grained skill can power
   mastery dashboards and parent-facing signals — **a different surface from
   real-time selection**". El panel es exactamente esa "different surface": no
   reimplementa el modelo de F4 (que ya no es BKT sino Elo/mc-05, decidido en
   D-002), solo expone su salida agregada.
3. **Precedente propio del producto, ya escrito para el maestro y extendible al
   padre.** D-027 fija que un dueño de `grupo_infantil` ve "solo alias, puntos y
   racha. Ni nombre real, ni edad exacta". El padre tiene más acceso que un
   maestro (es el tutor legal, no un tercero aprobado) pero el *principio* de
   minimizar el detalle expuesto por defecto es el mismo: mostrar el agregado
   no es ocultarle información al padre, es no convertir el panel en un log de
   vigilancia sobre su propio hijo. `mc-25` (ley de privacidad infantil)
   refuerza esto desde el ángulo legal: "No profiling, no behavioral ad-tech,
   no third-party analytics against child profiles" — aunque esa frase habla de
   terceros, el espíritu de minimización de datos (GDPR Art. 5(1)(c), citado en
   `mc-25`) aplica igual a cuánto detalle conductual construye el propio
   producto para su propia interfaz, no solo a lo que comparte afuera.

**Lo que esto NO cierra:** un padre tiene derecho legal de acceso a los datos
de su hijo (COPPA/GDPR-K, `mc-25` obligations matrix). Eso es una **exportación
bajo solicitud** — un flujo distinto, ya insinuado por el runbook de borrado de
cuatro sistemas (D-013, `mc-25`, `mc-32`) — no la pantalla que un padre abre a
diario. El panel de este documento es la vista *ambiente*; la exportación
completa es otro mecanismo, fuera de alcance aquí (ver §11 "Qué NO incluye").

**Lo que tampoco muestra, por decisión explícita heredada de F6 (no de una
búsqueda de "F8"):** leí `docs/planes/f6-larry-profe.md` completo buscando
"padre" — encontré la pregunta **P-17**, ya resuelta ahí con recomendación:
*"¿El panel del padre muestra el uso de Larry por hijo? […] 'Tu hijo pidió
ayuda 40 veces' es un dato que puede convertirse en regaño en casa —avergonzar
por la puerta de atrás—, y el informe de fracaso es precisamente el disparador
que Maloney et al. (2015, 438 niños) condiciona: la ansiedad matemática del
padre se transmite solo cuando el padre ansioso ayuda con frecuencia.
Recomendación: agregado por cuenta, nunca por hijo."* F8 adopta esa
recomendación: **el conteo de "veces que pidió ayuda a Larry" no se muestra
por hijo, en ninguna parte del panel v1.** Si algún día se agrega, es agregado
por cuenta completa, nunca desglosado, y Larry sigue sin sugerirle al padre que
practique más con su hijo — la misma P-17 lo prohíbe.

## 3. "Boletín escolar con calificación" — la pregunta que el encargo pidió decidir

El encargo pregunta si D-017 (los niveles no llevan nombre de grado escolar)
aplica también al panel del padre. **Decisión, con justificación, no solo
intuición:**

**Sí aplica, ampliado por tres razones que no estaban en D-017 originalmente
pero son la misma lógica aplicada un paso más allá:**

1. **D-017 en su propia letra:** "Los niveles no llevan nombre de grado escolar
   porque las fracciones se introducen entre los 6 y los 9 años según el país
   (mc-15)." `mc-15` (escaleras de grado internacionales), que leí completo,
   documenta que EE. UU./Reino Unido/México/España/Francia/Alemania/Brasil/
   Portugal tienen **ocho sistemas de grado incompatibles entre sí** — ni
   siquiera "3er año" significa la misma edad ni el mismo contenido en dos
   países del producto. Un panel que le dijera a un padre en `de-DE` "tu hijo
   va en 2º grado de fracciones" estaría inventando una equivalencia que
   `mc-15` demuestra que no existe. Esto no es un problema del NIÑO leyendo la
   etiqueta — es un problema de la etiqueta siendo falsa, y eso le pega
   exactamente igual al padre que lee el panel.
2. **Un porcentaje no es menos "calificación" que una letra.** "72% de dominio"
   se lee como una nota de examen aunque no use la palabra "grado". Decido
   (criterio propio, sin decisión previa que lo fije) que el panel usa
   **cuatro estados categóricos**, no un número:
   `sin_empezar` → `practicando` → `provisional` → `dominado` — que son
   literalmente las cuatro etapas que `skill_state` ya modela (`streak_correct`,
   `provisional_at`, `mastered_at`; mc-05, D-018 "maestría en dos etapas"). No
   es una escala inventada para el panel: es la salida real del motor,
   traducida a lenguaje sin números.
3. **Precedente citado por el propio corpus del proyecto.** `mc-18` (tableros y
   competencia) documenta a Zearn como "deliberately non-competitive and
   mastery-gated rather than leaderboard-driven" — un sistema real que expone
   progreso sin calificación numérica y sin ranking, exactamente el patrón que
   adopto aquí para la sección de dominio (no para la sección de liga, que sí
   es numérica porque el tablero global ya lo es por D-025/D-003).

**Lo que esto prohíbe en el copy, explícitamente, para que un auditor lo pueda
vigilar:** ningún string del panel usa `%` junto a una habilidad; ninguna letra
A-F; ninguna palabra "grado"/"grade"/"nota"/"calificación" pegada a un nombre
de habilidad; ninguna comparación contra "el promedio de niños de su edad" (eso
no existe en el producto — D-025 ya evita comparar niño-vs-adulto por edad, y
extenderlo a "niño vs. promedio" sería inventar una estadística que no tenemos
y que además es exactamente el tipo de comparación que `mc-10` señala como
fuente de ansiedad, aplicada aquí al padre en vez de al niño).

**Auditor adversarial que necesita ampliarse — encontrado, no hipotético,
mismo patrón que Ligas amplió `privacidad`/`patrones-oscuros` en F7:** leí
`audits/adversarial/cartas.mjs` completo. La carta `anti-humillacion` es la que
debería cazar una violación de esta regla ("un texto que insinúe vergüenza" ya
está en su `caza`), pero su `cita` autorizada hoy es
`["LR-7", "D-003", "D-025", "D-027", "D-028", "D-029", "mc-10", "mc-18", "mc-46"]`
— **no incluye D-017 ni D-020**. Sin extenderla, si un PR de este subsistema
mete un `%` en la vista de dominio, `anti-humillacion` puede *sentir* que algo
está mal pero no puede *citar* la decisión que lo prohíbe (D-032 enmienda: "un
auditor solo puede invocar lo que su carta le autoriza"). Se propone (issue 7):

```diff
- cita: ["LR-7", "D-003", "D-025", "D-027", "D-028", "D-029", "mc-10", "mc-18", "mc-46"],
+ cita: ["LR-7", "D-003", "D-017", "D-020", "D-025", "D-027", "D-028", "D-029", "mc-10", "mc-15", "mc-18", "mc-46"],
```

`D-020` se agrega por la razón de §5 (la nota de "patrón inusual" tiene que
sonar a nota suave, nunca a acusación, y esa es literalmente la letra de
D-020). `mc-15` se agrega porque es la evidencia detrás de "no hay equivalencia
de grado que se pueda citar con honestidad".

## 4. Modelo de datos nuevo — las únicas dos tablas que F8 posee

Migración siguiente disponible: D-053 reservó 0005 para el runbook de
`birth_month`; F7 puede haber tomado 0005/0006 si se construye primero —
verificar el número real al implementar, mismo caveat que f7-juego.md ya usó
para `xp_totals`.

```sql
-- screen_time_daily — rollup de minutos jugados, NUNCA por intento (mc-32 riesgo #1)
-- Mismo patrón que score_totals/xp_totals: una fila por (niño, día), escrita
-- por lotes desde el mismo Worker/DO que ya hace flush de score_totals/xp_totals
-- (rollup.ts, INTERVALO_MIN_MS/_MAX existentes) — no un segundo cron.
--
-- local_date usa la zona del hogar (users.timezone, ya existe desde F2) para
-- que el corte nocturno de D-016 y "hoy" signifiquen lo mismo que en la vida
-- real del niño, no en UTC.
CREATE TABLE screen_time_daily (
  child_profile_id TEXT NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  local_date        TEXT NOT NULL,   -- 'YYYY-MM-DD', zona del hogar
  minutes_played    INTEGER NOT NULL DEFAULT 0,
  -- Distingue "no jugó" de "jugó y el límite lo cortó" — mc-26 impl. #11 lo
  -- pide explícitamente: "streak status with an explicit note when a session
  -- ended due to the limit (not non-use)".
  ended_by_limit    INTEGER NOT NULL DEFAULT 0 CHECK (ended_by_limit IN (0,1)),
  updated_at        INTEGER NOT NULL,
  PRIMARY KEY (child_profile_id, local_date)
);
CREATE INDEX idx_screen_time_recent ON screen_time_daily (child_profile_id, local_date DESC);

-- child_diagnostic_notes — notas del SISTEMA, nunca escritas por un padre ni
-- por un niño (línea roja #3 no aplica siquiera: no hay columna de texto
-- libre, cause_code es un CHECK cerrado, igual que consent_code en D-051).
--
-- Quién escribe: F4/anti-trampa (D-020) y F6/Larry (descenso lateral, ver §7).
-- F8 solo LEE esta tabla y la renderiza con plantillas por locale (D-022).
CREATE TABLE child_diagnostic_notes (
  id                TEXT PRIMARY KEY,
  child_profile_id  TEXT NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  cause_code        TEXT NOT NULL CHECK (cause_code IN (
                       'HABILIDAD_PAUSADA_LATERAL',  -- F6 §2.3: descenso pedagógico
                       'PATRON_INUSUAL_PARA_EDAD'     -- D-020: anti-trampa tier 0
                     )),
  skill_id          TEXT,             -- clave interna, no texto de un niño (mismo patrón que HABILIDADES_KINDER)
  created_at        INTEGER NOT NULL,
  seen_at           INTEGER           -- cuándo el padre la vio; la nota nunca se borra, solo se marca vista
);
CREATE INDEX idx_notes_child ON child_diagnostic_notes (child_profile_id, created_at DESC);
```

**Verificado contra `no-attempts-in-d1.mjs` (leído completo, línea por línea):**
ninguno de los dos nombres matchea `attempts?|raw_attempts?|responses?|item_responses?|events?|telemetry|keystrokes?|interaction_log`
— ambas son tablas de **rollup/evento agregado**, exactamente la categoría que
el auditor permite (`score_totals`, `xp_totals`, `child_streak` son el mismo
patrón). Distinción explícita para que quien revise no confunda
`screen_time_daily` con telemetría: **D-045 dice que el sello de tiempo por
ítem va a Analytics Engine, no a D1** — eso sigue siendo cierto y no lo toca
esta tabla, que solo guarda un total de minutos por día, no un timestamp por
respuesta.

**`child-free-text.mjs` necesita extenderse — hueco real, ya documentado en
F7 y repetido aquí a propósito.** Leí el hallazgo exacto en
`f7-juego.md` (línea 2668): *"Los siete subsistemas juntos introducen
`xp_totals`, `child_streak`… — todas tablas donde el sujeto es un niño. Ninguna
issue propuesta dice 'agregar `<tabla>` a `CHILD_TABLES`'… El auditor seguirá
pasando en verde sin haber mirado ni una columna de las tablas nuevas."* Hoy
`audits/child-free-text.mjs:25` sigue diciendo
`const CHILD_TABLES = ["child_profiles", "child_image_pin", "skill_state"]` —
F7 no lo arregló todavía tampoco. **F8 no repite el error**: la issue 2 de este
documento agrega explícitamente `screen_time_daily` y `child_diagnostic_notes`
a `CHILD_TABLES`, con un caso plantado en `audits/pruebas-auditores.mjs` que se
vio fallar antes del arreglo (CLAUDE.md § Git regla 3).

**No se necesita ningún código de consentimiento nuevo.** `child_consents` ya
tiene `SCREEN_TIME` (base legal CONTRACT, D-051/migración 0003) y
`DATA_RETENTION`/`CHILD_PROFILE` (requeridos al crear el perfil) — el panel no
introduce una categoría de dato que no estuviera ya cubierta por esos tres
códigos.

## 5. `diagnostico.ts` — módulo puro de composición, no de cálculo

Mismo patrón exacto que `puntuacion.ts`/`sesion.ts`/`racha.ts` ya establecen en
`packages/motor/src` (nombrado en español porque así está el resto del
paquete, mismo argumento que F7 usó para `racha.ts`): función pura que recibe
filas ya leídas de D1 y las compone en una vista, sin tocar red ni base de
datos ella misma.

```ts
export type EstadoDominio = 'sin_empezar' | 'practicando' | 'provisional' | 'dominado';

export interface DiagnosticoDeHijo {
  hijoId: string;
  dominioPorHabilidad: Record<string, EstadoDominio>;
  racha: { actual: number; maxima: number; escudosDisponibles: number; pausaHasta: string | null };
  xp: { total: number; rango: number };
  puntos: { periodo: string; temaVisual: string; total: number }[];
  liga: ResumenDeLigaParaPanel | null;   // null si no hay consentimiento LEADERBOARD (D-040)
  limiteDePantalla: {
    config: { dailyMinutes: number; breakEveryMin: number; bedtimeLocal: string | null };
    hoyMinutos: number;
    terminoPorLimite: boolean;
    tendenciaSemanal: { localDate: string; minutos: number; terminoPorLimite: boolean }[];
  };
  notas: { causaCode: 'HABILIDAD_PAUSADA_LATERAL' | 'PATRON_INUSUAL_PARA_EDAD'; skillId: string | null; createdAt: number; vistaAt: number | null }[];
  cosmeticosRoadmap: { cosmeticoId: string; siluetaUrl: string; condicionTexto: string; desbloqueado: boolean }[];
}

export function componerDiagnostico(filas: FilasCrudasDeD1): DiagnosticoDeHijo { /* pura, sin fetch, sin reloj propio */ }
```

`estadoDominio(fila: SkillStateRow | undefined): EstadoDominio` es la única
función nueva de negocio real en este módulo:

```ts
function estadoDominio(fila?: { provisional_at: number | null; mastered_at: number | null; attempts: number }): EstadoDominio {
  if (!fila || fila.attempts === 0) return 'sin_empezar';
  if (fila.mastered_at != null) return 'dominado';
  if (fila.provisional_at != null) return 'provisional';
  return 'practicando';
}
```

Nada más se calcula. `xp.rango` llama `rangoDeXp(total_xp)` (F7 §3.2, ya
existente); `liga` llama `calcularPosiciones()` (F7 tablero-global §6, "módulo
puro que F9 puede reusar" — F8 lo reusa igual); `puntos` es una lectura directa
de `score_totals`.

**El catálogo de habilidades no es dueño de F8 tampoco.** Para saber qué
`skill_id` cuentan como "sin_empezar" (una habilidad que el niño nunca tocó no
tiene fila en `skill_state`), `diagnostico.ts` necesita la lista completa de
habilidades del `theme_band` del niño — reusa `HABILIDADES_KINDER` (F6, "viaja
la clave, nunca el valor") en vez de mantener su propia lista.

## 6. El límite de pantalla en el panel — honestidad sobre la cifra, no solo la cifra

Leí `mc-26` completo (115 líneas). Dos implicaciones de diseño, citadas
textualmente, fijan el contenido mínimo:

> **#11.** "Parent dashboard, minimum contents: today's minutes vs. limit;
> streak status with an explicit note when a session ended due to the limit
> (not non-use); the configured min/max and a one-line cited reason […];
> bedtime-cutoff status; a weekly trend, not just today."
>
> **#12.** "Surface the evidence-confidence gap for ages 5+ in-product — say
> 'based on general pediatric guidance,' not a false-precision citation, since
> no primary body publishes a number past age 5."

D-016 ya resolvió la cifra (tabla de 4-6/7-11/12-17/adulto) con la misma
honestidad que #12 pide: *"solo el tope de 60 min para 2-4 años viene de
fuente primaria (OMS). De los 5 años en adelante ninguna autoridad publica una
cifra."* El panel **reusa exactamente esa frase**, no inventa una cita nueva
para cada banda — nuestra banda más joven es KINDER 4-6, que solapa
parcialmente con el rango 2-4 de la OMS y por eso el copy dice "parcialmente
basado en la única cifra publicada" en vez de atribuirle a la OMS un número que
no dio.

Contenido de esta sección del panel (issue 6):

- **Hoy:** minutos jugados / límite configurado, con el estado explícito
  "terminó por el límite" cuando `ended_by_limit=1` — nunca confundido con "no
  jugó".
- **Tendencia semanal:** lista de los últimos días (decisión propia: **8
  semanas visibles**, 56 filas de `screen_time_daily`, criterio de ingeniería
  sin evidencia que lo exija — mc-26 solo pide "weekly trend, not just
  today").
- **La cifra, con su fuente citada en una línea**, tomada literalmente de
  D-016.
- **Corte nocturno:** estado de `bedtime_local`, con nota de que es lo mejor
  evidenciado del corpus (mc-26 impl. #8: "the single best-evidenced causal
  lever in this brief", el RCT de Bath).
- **Conexión explícita con la racha:** si `ended_by_limit=1` hoy, el panel dice
  "la racha de hoy cuenta igual" — hace visible D-014 ("la racha nunca se
  rompe por respetar el límite de pantalla") en vez de dejar al padre
  adivinando.

**Frontera deliberada con esta issue:** ajustar `daily_minutes`/
`break_every_min`/`bedtime_local` (el camino de escritura) puede vivir aquí o
en un subsistema hermano de configuración de cuenta — es la pregunta al dueño
§14.1. La issue 6, tal como está redactada, cubre **solo lectura**; si el
dueño confirma que el ajuste vive en el panel, se agrega como criterio
adicional sin rediseñar nada (la tabla y los límites de D-016 ya existen).

## 7. Notas del sistema — honestidad donde se puede procesar

Esto es lo que ninguna búsqueda de "F8" en f7-juego.md iba a encontrar, y es
la pieza más concreta de este documento. Dos fuentes, ambas ya escritas antes
de que F8 existiera como fase:

**D-020 (anti-trampa en kinder):** *"Si el patrón de respuestas es imposible
para la edad, el sistema simplemente no sube el nivel y deja **una nota suave
en el panel del padre**. Sin bloqueos, sin advertencias al niño."* Esto es un
requisito de F8 escrito el mismo día que se escribió D-020, siete decisiones
antes de que el propio D-021 (monetización) fijara qué es F8.
`child_diagnostic_notes.cause_code = 'PATRON_INUSUAL_PARA_EDAD'` es la
implementación literal de esa frase.

**`f6-larry-profe.md` §2.3 (descenso pedagógico lateral):** *"El descenso, si
ocurre, es lateral en la ficción […] Larry no dice 'vamos a algo más sencillo'
— eso es honesto con un adulto y es una degradación anunciada para un niño de
cinco años. La honestidad va donde puede procesarse: **el panel del padre sí
dice literalmente qué habilidad se pausó y por qué.**"* `cause_code =
'HABILIDAD_PAUSADA_LATERAL'` implementa esto.

**Contrato de escritura (quién escribe, F8 no lo construye, solo lo consume):**
F4 (motor adaptativo/anti-trampa) inserta `PATRON_INUSUAL_PARA_EDAD`; F6
(Larry) inserta `HABILIDAD_PAUSADA_LATERAL` cuando el motor de dificultad baja
a un prerrequisito. Ninguna de las dos fases está construida todavía (F3/F4
no tienen código de anti-trampa tier 0 desplegado — verificado: `migrations/`
solo llega a `0004`), así que F8 diseña el contrato de la tabla ahora y F4/F6
lo implementan cuando les toque, sin re-abrir esquema.

**Regla de tono, no opcional:** ninguna nota usa un verbo dirigido al niño
("hizo trampa", "falló", "se equivocó"). El sujeto gramatical de
`PATRON_INUSUAL_PARA_EDAD` es el **patrón**, no el niño ("el ritmo de
respuestas de esta semana no encaja con la banda de edad" — no "tu hijo hizo
trampa"). Mismo principio exacto que D-020 usa para el niño ("sin bloqueos, sin
advertencias"), extendido al padre: la nota informa, no acusa.

**Auditor — se extiende uno existente, no se crea uno nuevo (disciplina
anti-inflación de D-032, la misma que F7 siguió con `rachas-pantalla`).**
`audits/retro-completa.mjs` ya hace exactamente "toda causa tiene texto no
vacío en los 7 locales" para las causas de error de Larry (`error.*`,
`inesperada`). Se extiende su alcance para cubrir también el namespace de
`cause_code` de `child_diagnostic_notes` — mismo mecanismo, otro prefijo de
clave, en vez de duplicar el auditor completo.

## 8. El salón del maestro NO es este componente — resuelto con evidencia

El encargo pregunta si el panel del maestro es el mismo componente con otro
alcance de datos, o algo aparte. **Es algo aparte, y la evidencia ya estaba
escrita en tres lugares distintos antes de este documento:**

1. **`master-plan.md` §13.2** pone el salón del maestro en **F9** (`grupo_infantil`
   → `child_group`, D-043), dependiente de **F2, F7** — no de F8. Son fases
   distintas en el propio plan.
2. **D-011/D-027/D-044** fijan, sin ambigüedad, qué ve el dueño de un
   `grupo_infantil`: *"el dueño ve solo alias, puntos y racha. Ni nombre real,
   ni edad exacta, ni otros grupos del niño."* Eso es una fracción mínima de
   lo que este documento diseña (dominio por habilidad, notas del sistema,
   roadmap de cosméticos, tendencia de pantalla — ninguno de esos cuatro es
   visible para un maestro, por diseño, no por omisión).
3. **`mc-28` (modo maestro), leído completo:** *"teacher dashboards tend to get
   used most for simple, actionable signals (completion %, time since last
   activity, a short 'struggling/stalled' list) over rich comparative
   visualizations, and **student-facing rank displays are a different design
   surface from teacher-facing progress displays — conflating them risks
   optimizing for the wrong signal**."* Esto no es solo compatible con D-011 —
   es la razón de producto detrás de la razón legal: aunque no hubiera límite
   de privacidad, un maestro con 35 alumnos necesita una señal simple y
   accionable, no el panel rico de un padre con un hijo.

**Decisión:** el salón del maestro reusa el mismo patrón de "solo alias,
puntos y racha" que D-027 ya fijó para clubs, es responsabilidad de **F9**, y
no se construye ni se toca en este subsistema. Si F9 alguna vez quisiera
reusar `calcularPosiciones()` u otra pieza de F8, es una decisión de F9, no de
F8 — mismo principio de frontera que F7 ya declaró bien servido para F9 con
`tablero`/`racha` como los dos ganchos, sin extenderlo al panel de diagnóstico.

## 9. Roadmap de cosméticos — resuelve una pregunta abierta real de F7

`f7-juego.md` (mapa-companero, línea 2420) dejó esta pregunta explícita para
cuando se diseñara F8: *"¿Se incluye ese roadmap de cosméticos como parte del
alcance de F8 […], o se considera fuera de alcance del panel del padre y los
cosméticos quedan siempre como sorpresa, incluso para el adulto?"*

**Respuesta, con la justificación que el propio documento de F7 ya adelantó:**
sí, se incluye. `mapa-companero` §6 ya había resuelto la mitad de la pregunta —
"para el niño, cada desbloqueo es sorpresa […] Lo que sí puede mostrar el
catálogo completo con siluetas y condiciones es el panel del padre — ahí sí
aprovecha el efecto de gradiente de meta que `mc-43` §8 documenta, sin exponer
al niño a nada." El único trabajo que faltaba era decidir *si F8 lo construye*,
no *si tiene sentido* — y sí lo tiene: `cosmetic_catalog`/`cosmetic_unlock_rules`/
`child_cosmetics_unlocked` ya existen (F7), el patrón de "silueta bloqueada +
condición en texto" ya está diseñado, y D-014 ya garantiza que el desbloqueo es
determinista, nunca aleatorio — el roadmap del panel solo **muestra** esa regla
determinista con antelación, no inventa nada nuevo.

**Lo que sigue sin decidir (pregunta real al dueño, §14.4):** si el roadmap va
siempre visible en la pantalla principal del panel, o detrás de una pestaña
que el padre abre a propósito.

## 10. Dependencias reales — F2 confirmada, F7 declarada aunque master-plan calle

`master-plan.md` §13.2 dice "F8 · Padres … | F2". El encargo mismo señala que
F7 dejó evidencia de que esto está incompleto. La confirmación más fuerte que
encontré, ya escrita en la propia crítica cruzada de F7 (línea 2858): *"master-plan
no declara que F8 depende de F7, pero varios documentos F7 (cosméticos P3,
rachas referencias al panel del padre) asumen que F8 va a leer datos de
racha/XP/cosméticos que F7 produce."* Este documento confirma esa
sospecha con hechos: la tabla de §1 lee `xp_totals`, `child_streak`,
`league_membership`, `cosmetic_catalog` — cuatro tablas de F7. **F8 depende de
F7 en la práctica, aunque master-plan §13.2 siga sin decirlo.** No lo resuelvo
aquí (no es mío corregir la tabla de otra fase sin que el dueño lo confirme),
pero lo dejo escrito con la misma claridad que F7 pidió para cuando llegara
este momento.

**F4 (adaptativo):** dependencia de contrato, no de despliegue —
`skill_state.mastered_at` puede estar vacío en producción hasta que F4 exista;
el panel debe degradar con gracia (mostrar "sin_empezar" para todo, no un
error) exactamente igual que F7 diseñó su degradación cuando `resumenF4`
llega `null`.

**F6 (Larry):** dependencia acotada a una sola tabla (`child_diagnostic_notes`,
escritor de `HABILIDAD_PAUSADA_LATERAL`), no al motor de explicaciones
completo — F8 no depende de que Larry esté desplegado para mostrar el resto
del panel.

## 11. Qué NO incluye este documento

- **Ningún gate de pago.** Cero mención de Stripe, cero verificación de
  suscripción activa, en ninguna de las 9 issues. Si D-021 alguna vez gatea
  parte de esto detrás del Plan Familia, es una decisión de una fase futura de
  monetización — no se inventa ni se bloquea aquí.
- El salón del maestro (F9, §8).
- Los subsistemas hermanos de F8 · Padres: **Reportes** (email/push periódico)
  y el mecanismo de **enforcement** del corte suave (banner a media sesión,
  pantalla de despedida de Larry, aviso de descanso — eso vive en el motor de
  reto/F3 o en un subsistema hermano de F8, este documento solo lee y muestra
  el resultado de esos cortes vía `ended_by_limit`).
- La cadencia de notificación push de misión que `f7-juego.md` dejó pendiente
  para "F7 · Rachas o F8 · Padres" — corresponde a **F8 · Reportes**, no a
  Panel con diagnóstico; queda anotado aquí para que no se pierda otra vez.
- El presupuesto conjunto de notificaciones/hogar/día que la crítica cruzada de
  F7 dejó como "posiblemente F8" — misma frontera: es de **F8 · Reportes**.
- Gestión de `household_devices` (ver/revocar dispositivos del hogar) — F2 ya
  anota explícitamente que esto es "F8" (`f2-cuentas-onboarding.md:136`), pero
  es una función de seguridad de cuenta, no de diagnóstico de progreso; queda
  como pendiente de un subsistema hermano de F8 (configuración de cuenta), no
  se construye aquí.
- Exportación completa de datos crudos bajo solicitud legal de acceso
  (`mc-25`) — mecanismo distinto al panel de uso diario (§2).
- El tope de 6 perfiles gratis con bandera en `CONFIG_KV` (`f2-cuentas-onboarding.md`
  §3.2/§10.B.5) — sigue siendo un placeholder "hasta F8" que **esta pasada de
  F8 no resuelve**, porque resolverlo de verdad significa decidir el plan de
  pago, y esta pasada excluye Stripe a propósito. Queda expresamente como
  pendiente, no resuelto ni ignorado.

## 12. Auditores — nuevos, y dos existentes extendidos

**Determinista nuevo:**
- `audits/panel-sin-detalle-de-intento.mjs` — falla si cualquier archivo bajo
  la ruta del panel (`apps/web/src/**panel**`) referencia el binding de
  Analytics Engine (`ATTEMPTS_AE`/`env.ATTEMPTS_AE` o el nombre real que F3 le
  dé) directamente. El panel solo puede leer D1. Cita: mc-32 riesgo #1, D-013.
  Caso plantado en `audits/pruebas-auditores.mjs` antes de mergear (regla de
  Git 3).

**Deterministas existentes, extendidos:**
- `audits/child-free-text.mjs` — `CHILD_TABLES` gana `screen_time_daily` y
  `child_diagnostic_notes` (§4). Corrige, para F8, el hueco que F7 documentó y
  no cerró para sus propias seis tablas.
- `audits/retro-completa.mjs` — su alcance de "causa con texto en 7 locales"
  se extiende al namespace de `cause_code` de `child_diagnostic_notes` (§7),
  en vez de crear un segundo auditor que hace lo mismo.
- `audits/notacion-locale.mjs`, `audits/locales-complete.mjs` — se aplican sin
  cambios: todo número del panel (minutos, XP, puntos, racha) pasa por
  `numeros.ts`/`convenciones.ts`.

**Adversarial extendido — `anti-humillacion` (§3):** agrega `D-017`, `D-020` y
`mc-15` a su `cita` autorizada. Es el mismo movimiento que F7 hizo con
`privacidad`/`patrones-oscuros` para Ligas: la carta ya caza el patrón
correcto, pero no puede nombrarlo hasta que se le autorice a citarlo.

## 13. Preguntas resueltas con investigación externa (WebSearch, agosto 2026)

El encargo sugiere que si `mc-13`/`mc-10` no cubren "qué nivel de detalle en un
panel de progreso ayuda vs. genera ansiedad de comparación **en el padre
mismo**", hay que decidir con criterio propio marcado como tal. Los dos
documentos, leídos completos, en efecto no cubren esto — ambos hablan de la
ansiedad del **niño** ante el cronómetro (mc-10) o del modelo del alumno
(mc-13), no de la ansiedad del padre ante un panel.

Busqué de forma dirigida y **no encontré un estudio primario que mida
directamente "nivel de detalle de un dashboard de progreso infantil" contra
"ansiedad parental"** — es un hueco real de la literatura, no solo de este
corpus. Lo más cercano, con menor confianza de la que tendría una fuente
primaria y por eso marcado `[secundario, no verificado con fetch directo]`:

- **Bodily & Verbert (2017), revisión de 94 estudios de dashboards de
  analítica de aprendizaje** — ya citado dentro del propio corpus del proyecto
  en `mc-28` para el caso del maestro. Confirmé vía búsqueda que es un trabajo
  académico real (ResearchGate: "Review of Research on Student-Facing Learning
  Analytics Dashboards and Educational Recommender Systems"), centrado en
  dashboards de **estudiante**, no de padre — mismo hueco.
  https://www.researchgate.net/publication/319133069_Review_of_Research_on_Student-Facing_Learning_Analytics_Dashboards_and_Educational_Recommender_Systems
- **TTC Labs / investigación sobre Messenger Kids** (citado por búsqueda,
  no verificado con fetch directo a la fuente primaria): un padre entrevistado
  describe que "a summary allows me a good method to gently monitor her
  activity without it being too blatant or invasive" — evidencia cualitativa,
  de un solo producto, de que los padres prefieren resumen sobre detalle
  granular cuando el sujeto es su propio hijo.
  https://www.ttclabs.net/research/research-on-parental-involvement-can-help-guide-the-privacy-design-of-kids

**Decisión, marcada explícitamente como criterio propio informado (no
medido):** el panel por defecto muestra agregados (§1-§2), nunca listas
cronológicas de intentos, apoyado en (a) la imposibilidad técnica/arquitectónica
ya fijada por `no-attempts-in-d1.mjs`, (b) la recomendación de `mc-13` de
tratar el dashboard como "a different surface" del modelo en tiempo real, (c)
el precedente de diseño de teacher-dashboards de `mc-28` ("simple actionable
signals… over rich comparative visualizations"), extendido por analogía al
padre porque ocupa el mismo rol estructural de "adulto guardián observando,
no el niño aprendiendo", y (d) la señal cualitativa de TTC Labs. Ninguna de
estas cuatro es, por sí sola, un estudio controlado sobre exactamente esta
pregunta — la conjunción es lo que sostiene la decisión, y se documenta así en
vez de presentarla como más sólida de lo que es.

## 14. Autocrítica adversarial — lo que ataqué de mi propio diseño

1. **¿El estado "sin_empezar" puede leerse como un veredicto negativo,
   igual que el "0/3" que F7 encontró en sus propias misiones?** Riesgo real:
   un padre viendo 11 de 14 habilidades en "sin_empezar" el primer día de uso
   puede leerlo como una lista de fracasos. Mitigación: la vista de dominio no
   se ordena mostrando primero lo "sin_empezar" — se ordena por lo más
   reciente/lo más avanzado primero, mismo principio que F7 adoptó para el
   resumen de misiones ("lista solo lo logrado… nunca una lista con casillas
   vacías tachadas"), adaptado aquí a "no empieza con la lista de lo que
   falta".
2. **¿La nota `PATRON_INUSUAL_PARA_EDAD` puede sentirse como acusar al niño de
   hacer trampa, aunque el texto no lo diga?** Es el riesgo central de §7.
   Mitigado por la regla de tono (sujeto gramatical = el patrón, nunca el
   niño) y por la extensión de `anti-humillacion` con D-020, pero **no está
   probado con un padre real** — queda como riesgo residual, nombrado, no
   resuelto solo con reglas de redacción.
3. **¿Mostrar el roadmap de cosméticos convierte el panel en una pantalla de
   ventas encubierta, aunque no haya pago?** Revisé contra D-014 y `patrones-oscuros`:
   no hay urgencia, no hay cuenta regresiva, no hay nada que comprar — es
   información de un sistema ya determinista (D-014 "cosméticos ganados,
   deterministas"). El riesgo real no es de monetización sino de **volumen**:
   si el roadmap domina visualmente la pantalla, compite por atención con la
   información de diagnóstico real. Por eso la pregunta al dueño §14.4 (visible
   siempre vs. pestaña) importa de verdad y no es relleno.
4. **¿Necesita este subsistema que F4/F6/F7 ya existan para poder construirse?**
   No para el **módulo puro** (`diagnostico.ts` es aritmética/composición sobre
   datos inventados, como `puntuacion.ts`) ni para las **dos tablas nuevas**
   (pueden migrarse ya). Sí para que el panel muestre datos **reales** en vez
   de estados vacíos — dependencia de contrato, no de bloqueo de construcción,
   igual que F7 lo distinguió para F4.

## 15. Consideraciones i18n — los siete locales, verificado por subsistema

Todo texto de cara al padre se **autora por locale (D-022), nunca se traduce
mecánicamente** — aplica igual a las notas de diagnóstico, las etiquetas de
los cuatro estados de dominio, el copy de límite de pantalla con su cita, y las
condiciones de desbloqueo de cosméticos. Volumen estimado (mismo método que
F7 usó): 4 etiquetas de estado + ~10 encabezados de sección + 2 causas de nota
× ~2 frases + ~10 copys de límite de pantalla (incluida la cita honesta por
banda) + ~5 estados vacíos/primer uso ≈ **60-90 cadenas × 7 locales ≈
420-630 cadenas** — un orden de magnitud menor que las ~2,401 voces de F6,
porque el panel no tiene audio y no repite contenido por ítem.

Riesgos de notación específicos: minutos y XP son enteros (sin riesgo de
coma/punto decimal hasta 4 cifras); XP puede pasar de 999 y necesita separador
de millares correcto por locale (`de-DE`/`fr-FR` usan punto/espacio,
`en`/`es-MX` usan coma) — mismo caso que F7 ya resolvió para XP con
`formatear()`, reusado aquí sin cambios. `bedtime_local` es una hora de 24h
(`GLOB '[0-2][0-9]:[0-5][0-9]'`, ya fijado por el esquema de F2) — su
presentación (12h AM/PM vs. 24h) depende del locale y pasa por
`convenciones.ts`, no se formatea a mano.

## 16. Lista de issues propuestas (9: 1 paraguas + 8 sub-issues)

1. **[PARAGUAS]** F8 · Panel con diagnóstico
2. F8 · Esquema: `screen_time_daily` y `child_diagnostic_notes`
3. F8 · `diagnostico.ts` — composición de lectura, sin recalcular nada
4. F8 · Dominio por habilidad: cuatro estados, nunca un porcentaje ni una nota escolar
5. F8 · Racha, XP/Rango y liga en el panel — solo lectura, ejes separados
6. F8 · Límite de pantalla en el panel: hoy, tendencia semanal, y la fuente citada de cada cifra
7. F8 · Notas del sistema: habilidad pausada (F6) y patrón inusual para la edad (D-020)
8. F8 · Roadmap de cosméticos en el panel — resuelve la pregunta abierta de F7
9. F8 · Selector de hijo, primer uso, y el auditor de privacidad del panel


## Preguntas al dueño

- ¿El control para AJUSTAR el límite de pantalla (daily_minutes/break_every_min/bedtime_local) vive en este panel de diagnóstico, o en un subsistema hermano de configuración de cuenta? La tabla screen_time_settings ya existe (F2) y el CRUD es trivial — incluirlo aquí da una sola pantalla; separarlo mantiene el panel puramente de lectura/diagnóstico.
- ¿Las notas de diagnóstico del sistema (habilidad pausada, patrón inusual para la edad) se redactan en la voz de Larry, o son copy neutro del sistema? Con la voz de Larry se mantiene la personalidad unificada del producto, pero exige que cada nota pase por larry-lexico.mjs y la carta canon-larry igual que el texto que ve el niño. Copy neutro es más simple de autorar y auditar, pero sería la única superficie del producto donde Larry le hablaría al adulto sin ser Larry.
- ¿La posición de liga en el panel del padre muestra el número exacto, o el mismo tercio que ve el niño (pregunta que f7-juego.md dejó abierta para la interfaz infantil)? El padre no es el sujeto de la ansiedad de comparación que mc-10 documenta en niños, así que el número exacto no cruzaría esa línea roja — pero si niño y padre ven cifras distintas de la misma liga, puede generar una conversación confusa en casa.
- ¿El roadmap de cosméticos (siluetas bloqueadas con su condición de desbloqueo) va siempre visible en la pantalla principal del panel, o detrás de una pestaña que el padre abre a propósito? Siempre visible aprovecha más el efecto de gradiente de meta que documenta mc-43 §8; detrás de una pestaña mantiene la pantalla principal enfocada en dominio/racha/límite de pantalla sin competir por atención con la información de diagnóstico real.


---

## 3. Reportes

# F8 · Reportes — resumen periódico por correo al padre


# F8 · Reportes — diseño operativo

> Subsistema de F8 ("Padres"). F8 no tiene ninguna issue de GitHub hoy
> (`gh issue list --search "F8"` no devuelve nada). Este documento diseña
> **un** subsistema — Reportes — con el mismo método que
> `f5-contenido-kinder.md`, `f6-larry-profe.md` y `f7-juego.md`: hechos
> medidos donde existen, `[criterio propio]` donde es elección sin fuente,
> `[contrato asumido]` donde depende de código que F7 diseñó pero no
> construyó, autocrítica adversarial del propio diseño, y preguntas al dueño
> explícitas — nunca inventadas para llenar un cupo.
>
> **Corrección de alcance vigente (dada por el dueño después de un primer
> intento de este encargo):** F8 en esta pasada **no incluye Stripe ni cobro
> real**. D-021 (Plan Familia ~$8-10 USD/mes, con "reportes" listado como
> función de pago) sigue existiendo como decisión, pero el gateo de pago se
> pospone. Reportes se construye **disponible para todo padre, sin ninguna
> comprobación de suscripción** — el día que exista un mecanismo de cobro
> real, alguien decide si gatea esto; esta issue no lo decide ni lo bloquea.

## 0. Qué se leyó antes de diseñar

CLAUDE.md completo (línea roja #2 y #4 en particular); `docs/decisions.md`
completo (56 decisiones, no solo las citadas en el encargo — D-034, D-037,
D-040, D-051, D-052, D-053, D-055, D-056 resultaron relevantes y no estaban en
la lista sugerida); `docs/master-plan.md` completo; las ~4 menciones de F8 en
`f2-cuentas-onboarding.md` y las ~9 en `f7-juego.md` (más de las ~7 que el
encargo estimaba: hay dos adicionales en la crítica adversarial cruzada de F7
que no estaban en el grep superficial); `docs/research/README.md` completo;
`mc-19`, `mc-26`, `mc-25` completos, `mc-13` (para entender qué agrega
`skill_state`, aunque el panel de diagnóstico no es este subsistema), `mc-32`
§Analytics Engine y §riesgos, `mc-18`, `mc-34`; las 23 cartas de
`audits/adversarial/cartas.mjs` completas; `audits/run.mjs` completo (lista
ACTIVE/PENDING real); `migrations/0001`-`0004` completas;
`packages/motor/src/rollup.ts` y `packages/motor/src/numeros.ts`;
`apps/ingest/src/index.ts` y `apps/ingest/src/sesion-do.ts` (para ver
**exactamente** qué campos ya viajan a Analytics Engine, porque el encargo
suponía que ahí podría vivir un dato que resultó no estar); las issues reales
de F7 en GitHub (#199, #204, #207, #192, #211) porque el corpus escrito no
basta — el estado real de qué ya está filed importa para no duplicar trabajo.
Búsqueda externa dirigida: cadencia de correo/fatiga de notificación (no hay
investigación interna sobre esto) y el patrón Cron Trigger + Queues de
Cloudflare para 2026 (para no inventar un mecanismo que ya no es el
recomendado).

## 1. El hallazgo que reordena el diseño: Analytics Engine no tiene el dato del niño

El encargo asume que "tiempo practicado" o "días activos" podría construirse
agregando `ATTEMPTS_AE`. Se verificó contra el código real
(`apps/ingest/src/index.ts:101-113`, `apps/ingest/src/sesion-do.ts:131-146`) y
**no es cierto**: el comentario del propio código lo dice explícito —

> *"Los índices son por lo que se agrupa. El perfil del niño NO va aquí: es el
> campo de mayor cardinalidad y el que convierte una métrica en un
> perfilamiento de menor (D-020, mc-25)."*

`ATTEMPTS_AE` guarda `itemId`, `skillId`, `themeBand`, `locale`, la regla de
puntuación, `acc`, `rtMs` y el puntaje — **nunca `childProfileId`**. Es una
decisión de arquitectura ya tomada (no documentada como D-XXX propia, pero
real en el código) para que ningún análisis de comportamiento pueda
reconstruir el patrón de un niño específico. Consecuencia directa para
Reportes: **Analytics Engine queda fuera de la lista de fuentes posibles**,
no por elección de este diseño sino porque técnicamente no puede identificar
a quién pertenece un intento. Esto también cierra, de paso, "minutos
practicados" y "días activos esta semana" como métricas del reporte v1: **no
existe ningún rollup por niño que las produzca hoy**, en D1 ni en AE. Se
documenta como hueco real en §7, no se inventa una tabla nueva de eventos
para llenarlo — eso violaría exactamente `no-attempts-in-d1.mjs` y el riesgo
#1 de `mc-32` que ese auditor existe para prevenir.

Esto también resuelve, sin necesidad de preguntarlo, una duda que el encargo
sí planteaba ("¿el reporte se construye desde skill_state/score_totals/lo que
F7 agrega, nunca desde una tabla que no existe?"): la respuesta es que
**tiene que ser así por construcción**, no por disciplina — no hay otra
fuente disponible.

## 2. Qué contiene el reporte — solo lo que ya se agrega en algún lado

Fuentes reales, todas ya `PRIMARY KEY` de estado (nunca de evento):

| Fuente | Tabla | Estado hoy |
|---|---|---|
| Puntos del tablero | `score_totals` (`migrations/0002`) | Implementado |
| Maestría por habilidad | `skill_state` (`migrations/0002`) | Implementado |
| XP de por vida | `xp_totals` | **[contrato asumido]** — diseñada en `f7-juego.md` §6, sin migración todavía |
| Racha, escudos, pausa | `child_streak` | **[contrato asumido]** — diseñada en `f7-juego.md` §5, sin migración todavía |

Contenido del correo, en orden, por hijo (nunca comparado entre hermanos —
ver §5):

1. **Puntos ganados en el periodo** — delta de `score_totals.total_score`
   (`period='all_time'`) contra el snapshot del envío anterior. Nunca contra
   otro niño, nunca contra un promedio (§5).
2. **XP ganado y Rango actual** `[contrato asumido, F7]` — se omite la
   sección entera si `xp_totals` no existe todavía en producción (degradación
   elegante: nunca una fila vacía o un placeholder roto).
3. **Racha actual y mejor racha** `[contrato asumido, F7]`, con el mismo
   lenguaje que `f7-juego.md` §3 ya fijó para no generar ansiedad (sin cuenta
   regresiva, sin verbo de pérdida, framing de marca personal). Si
   `child_streak.pause_until_local_date` está activo, el reporte dice "en
   pausa hasta [fecha]" — nunca deja que una pausa familiar (F7 #204) se lea
   como una racha rota.
4. **Habilidades nuevas dominadas en el periodo** — `COUNT(*) FROM skill_state
   WHERE mastered_at BETWEEN <último envío> AND <ahora>`, con hasta 3 nombres
   (viajan como clave i18n, nunca como texto crudo — mismo patrón que
   `HABILIDADES_KINDER` en F6, citado también en `f7-juego.md` §6).
5. **Habilidades con repaso pendiente** — `COUNT(*) FROM skill_state WHERE
   due_at <= <ahora>`, con framing de "buen momento para repasar" — nunca
   "atrasado" ni lenguaje de mora. El repaso espaciado vencido es
   comportamiento normal del algoritmo (`mc-05`), no una señal de fracaso.
6. Enlace al panel de diagnóstico (subsistema hermano, no diseñado aquí) y
   enlace de baja de un toque.

**Explícitamente fuera del contenido v1, y por qué:** minutos practicados,
días activos de la semana, número de retos completados — ninguno tiene una
fuente agregada hoy (§1 y §7). Percentil, ranking, o cualquier frase que
compare contra otro niño o un promedio — ver §5, es una decisión de diseño,
no un hueco.

## 3. Modelo de datos nuevo — dos tablas de estado, cero tablas de evento

Mismo principio que `xp_totals` y `score_totals`: **una fila por entidad,
nunca una fila por envío ni por intento.**

```sql
-- parent_report_settings — preferencia de cadencia, UNA fila por adulto
-- (el reporte es por HOGAR, no por hijo — ver §4, mismo criterio que
-- el push agregado de F7 #207: "un solo push agregado para el hogar")
CREATE TABLE parent_report_settings (
  user_id           TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  cadence           TEXT NOT NULL DEFAULT 'WEEKLY'
                    CHECK (cadence IN ('WEEKLY', 'MONTHLY', 'OFF')),
  -- Ventana de envío, hora local del hogar. Rango 07-20 por la misma regla
  -- de horario que mc-19 rec. #13 ya fija para el push de racha (#207).
  send_hour_local   INTEGER NOT NULL DEFAULT 8 CHECK (send_hour_local BETWEEN 7 AND 20),
  last_sent_at      INTEGER,
  -- Token opaco para el enlace de baja de un toque (RFC 8058). No es una
  -- sesión: solo permite apagar cadence, nada más.
  unsubscribe_token TEXT NOT NULL UNIQUE,
  unsubscribed_at   INTEGER,
  updated_at        INTEGER NOT NULL
);

-- child_report_state — snapshot del último envío, UNA fila por hijo.
-- Es lo que permite calcular "ganaste X desde la última vez" sin leer nunca
-- un intento crudo: se resta el snapshot anterior del valor actual de la
-- tabla de estado correspondiente.
CREATE TABLE child_report_state (
  child_profile_id    TEXT PRIMARY KEY REFERENCES child_profiles(id) ON DELETE CASCADE,
  last_reported_at    INTEGER,
  last_score_all_time INTEGER NOT NULL DEFAULT 0,  -- snapshot de score_totals
  last_xp_total       INTEGER,                     -- snapshot de xp_totals (F7), NULL hasta que exista
  updated_at          INTEGER NOT NULL
);
```

Por qué NO es una tabla de eventos: crece a lo sumo 1 fila por hogar/hijo que
exista, se actualiza por `UPDATE`, nunca por `INSERT` repetido — misma forma
que `score_totals`/`xp_totals`, jamás la forma de `attempts`. `audits/no-attempts-in-d1.mjs`
tiene que seguir pasando limpio sobre estas dos tablas; es un criterio de
aceptación explícito, no una suposición.

**Por qué NO se agrega un `consent_code` nuevo en `consent_type_catalog`.**
Se consideró y se descartó: la cadencia del reporte no es una nueva
recolección de datos sobre el menor — es una nueva *entrega* de datos ya
cubiertos por `DATA_RETENTION` (`CONTRACT`, ya obligatorio) y `CHILD_PROFILE`
(`CONSENT`, ya obligatorio). Forzarlo dentro de `child_consents` sobrecarga
una tabla pensada para consentimiento legal sobre un menor con una preferencia
de entrega de un adulto sobre su propia bandeja de correo. La baja de un toque
(§4) cumple el mismo papel que exigiría un consentimiento revocable, sin
pedirle a D-051 que gobierne algo que no es consentimiento sobre el niño.

## 4. Canal, proveedor y mecanismo de envío

### 4.1 Canal: correo, nunca push — y esto cierra un hallazgo real de F7

La auditoría cruzada de `f7-juego.md` (línea 2858 y el hallazgo débil #6, línea
2512-2518) deja dos cosas explícitas sin resolver, dirigidas a F8:

1. "master-plan no declara que F8 depende de F7, pero varios documentos F7
   asumen que F8 va a leer datos de racha/XP/cosméticos" — **se confirma
   aquí**: F8 depende de F7 en la práctica (§2, §3), aunque §13.2 de
   `master-plan.md` no lo declare todavía. Recomendación: corregir esa fila
   de la tabla cuando se abra esta issue.
2. "sin presupuesto conjunto de notificaciones al padre entre subsistemas de
   F7... anotarlo como pendiente para quien diseñe la capa de notificaciones
   (posiblemente F8)" — **se resuelve aquí por diseño, no por coordinación**:
   Reportes **nunca usa push**. Todo lo que manda es correo, un canal
   distinto que no compite por el tope de `UN_PUSH_POR_HOGAR_POR_DIA = 1` que
   la issue #207 ya implementa para el recordatorio de racha. El hueco que
   F7 señaló para "el recordatorio de racha + el aviso de duelo pendiente de
   ligas" sigue siendo asunto interno de F7 (ninguno de los dos es mío), pero
   al menos queda descartado que Reportes agregue un tercer reclamante al
   mismo presupuesto.

Esto también responde una pregunta que `f7-juego.md` §13 dejaba abierta
("¿notificaciones push de recordatorio de misión... o se revisita al diseñar
F8?"): **no**, Reportes no construye push de ningún tipo. Si en el futuro se
quiere un push de misión, es una extensión de la infraestructura de #207
(recordatorio al padre), no de este subsistema.

**Lo que esto deja explícitamente sin resolver, y no es mío resolverlo:** la
issue #207 dice literal *"Se documenta en el PR, como coordinación abierta y
no como trabajo cerrado, quién construye el envío real de Web Push (VAPID,
service worker) — probablemente F8, no bloquea el resto de esta issue"*.
**Ese trabajo sigue sin dueño.** Reportes no lo reclama (decidió no usar push
en absoluto) — si el dueño quiere que exista, es un subsistema hermano
("F8 · Notificaciones push") que alguien tiene que diseñar aparte. Se anota
en "Qué NO incluye" de la issue paraguas para que no se dé por resuelto por
accidente.

### 4.2 Proveedor: Cloudflare Email Service, con la binding nativa de Workers

D-035 fija *"solo vamos a trabajar con Cloudflare, es una decisión tomada"*
para inferencia; el mismo espíritu aplica aquí por default arquitectónico del
proyecto entero (D-030: RPC nativo, nada externo salvo que Cloudflare no lo
ofrezca). Cloudflare tiene servicio de correo transaccional nativo
(`send_email` binding, sin llaves de API, con SPF/DKIM/reputación de IP
gestionados por Cloudflare) — no hay razón para traer Postmark/SendGrid/Resend
cuando el binding nativo cubre el caso.

**La documentación del propio servicio marca una restricción real que hay que
tomarse en serio, no ignorar:** *"Email Service is for transactional email...
Marketing/bulk campaigns are not permitted — use a dedicated marketing
platform."* Un dígest semanal recurrente **no es marketing** bajo la lectura
operativa de esa regla: es contenido 1:1, calculado sobre los datos propios de
la cuenta del destinatario, disparado por su propia actividad (o falta de
ella), sin lista comprada ni segmentación publicitaria — el mismo patrón que
un "resumen semanal" de GitHub, Fitbit o un estado de cuenta. Aun así, es una
lectura, no una garantía escrita por Cloudflare para este caso específico:
**se documenta como riesgo operativo a vigilar** (tasa de queja/spam,
`docs/infrastructure.md`), no como hecho cerrado.

**Prerrequisito de infraestructura, no una pregunta de diseño:** el dominio
de envío tiene que estar dado de alta en Email Sending
(`npx wrangler email sending list` / `enable`). Dado el patrón de D-054
("math. está dentro de kilowatto.com", el widget de Turnstile se reusa a
nivel de dominio, no de proyecto), lo más probable es que el remitente sea
algo como `reportes@math.kilowatto.com`, sobre un dominio que puede o no
estar ya dado de alta para otro producto de Ignia que comparte la cuenta de
Cloudflare (D-001/D-023). Esto se verifica al implementar, no se supone.

### 4.3 Mecanismo de envío: Cron Trigger horario + Cola — **no el patrón de `rollup.ts`**

El encargo sugiere replicar "el mismo patrón que el rollup de `score_totals`".
Se leyó `rollup.ts` completo para verificarlo, y **el patrón real no sirve
aquí, por una razón concreta, no estética**: el rollup de `score_totals` se
dispara por **tráfico** — `tocaEscribir()` decide escribir cuando hay
suficientes respuestas pendientes o pasó suficiente tiempo desde la última
escritura, dentro del mismo Durable Object de sesión que ya está procesando
respuestas. Un reporte semanal tiene que salir **el mismo día de la semana
para todas las familias**, incluidas las que no abrieron la app esa hora —
depende del **reloj**, no del tráfico. Aplicar el patrón de `rollup.ts`
literalmente significaría que una familia que no juega ese día nunca dispara
su propio envío, lo cual rompe la cadencia que el propio reporte promete.

**Lo que sí se reutiliza de `rollup.ts`, y es lo que importa de verdad:** la
filosofía de *"D1 guarda estados, no eventos"* y el patrón de upsert por
lotes (`ON CONFLICT ... DO UPDATE`). El mecanismo de disparo es distinto por
necesidad.

**Diseño elegido, verificado contra el patrón que Cloudflare recomienda hoy
para "cron que abanica a muchos destinatarios" (no inventado):**

```
Cron Trigger (cada hora, "0 * * * *")
  → math-challenge-reports: scheduled()
    → SELECT de parent_report_settings WHERE cadence != 'OFF'
        AND send_hour_local = <hora local actual del hogar, via users.timezone>
        AND (last_sent_at IS NULL OR han pasado 7/30 días según cadence)
      (consulta acotada por índice, nunca un table scan completo cada hora)
    → por cada fila: encolar {parentUserId} en math-challenge-reports-queue
  → Queue consumer (lote de hasta 10, reintentos con backoff, DLQ)
    → lee child_profiles + score_totals + skill_state (+ xp_totals/child_streak
      si existen) de TODOS los hijos de ese padre
    → construirReporteHogar() [motor puro, §6] produce la estructura de datos
    → renderiza plantilla del locale del padre (§7)
    → env.EMAIL.send() vía Cloudflare Email Service
    → actualiza parent_report_settings.last_sent_at y child_report_state
      de cada hijo incluido, en la MISMA transacción que el envío se confirma
```

Por qué Cron Trigger horario y no uno semanal directo: con 7 locales en 7
zonas horarias reales, un cron semanal fijo en UTC golpea a México a las 2 AM
y a Portugal a las 9 AM el mismo disparo — exactamente el tipo de descuido que
`f7-rachas` ya evitó para el corte nocturno reusando `users.timezone`
(`migrations/0003_accounts_onboarding.sql:32`). Un cron horario que evalúa
"¿es la hora local de este hogar, y ya tocaba?" hace el trabajo real de
"cadencia por reloj local" con una sola definición de cron, dentro del límite
de Cloudflare (hasta 5 cron triggers por Worker en el plan de pago — con uno
horario sobra).

Por qué Cola y no todo dentro del `scheduled()`: un `scheduled()` handler
tiene presupuesto de CPU por invocación; con cientos o miles de hogares
elegibles en la misma hora, renderizar y enviar todo inline arriesga el
timeout. El patrón recomendado por Cloudflare para exactamente este caso
—cron dispara, cola absorbe el volumen, un consumidor procesa por lotes con
reintento y muerto-letra— es el que se usa aquí, no una arquitectura
inventada para este documento.

**Objetos de Cloudflare nuevos** (a documentar en `infrastructure.md` en el
mismo PR que los cree, por regla de CLAUDE.md § Cloudflare):
- `math-challenge-reports` — Worker nuevo, sin ruta pública (mismo patrón que
  `math-challenge-ingest`: solo se alcanza por cron y por cola).
- `math-challenge-reports-queue` — Queue.
- `math-challenge-reports-dlq` — Queue de muerto-letra, para direcciones que
  fallan permanentemente (`E_RECIPIENT_SUPPRESSED`, `E_SENDER_NOT_VERIFIED`)
  sin reintentar para siempre.
- Dominio de envío dado de alta en Email Sending (verificar si ya existe uno
  compartido con otro producto de Ignia antes de pedir uno nuevo).

## 5. Anti-comparación: por qué esto NO es (solo) sobre D-037

El encargo pide verificar si el reporte puede violar D-037 comparando al niño
contra otros o contra un promedio. **Se verificó, y D-037 no es la decisión
correcta para ese riesgo específico** — se deja dicho con claridad para no
propagar la confusión:

> D-037 dice *"rendimiento medido, y nunca sobre un niño"*, pero "rendimiento"
> ahí es **Core Web Vitals** (INP/LCP/CLS vía beacon de Cloudflare Web
> Analytics), no desempeño matemático. Su tabla es explícita: *"Sitio abierto,
> **panel de padres**, bandas adultas → campo"* está **permitido**. Si algún
> día se instrumenta la pantalla de preferencias de Reportes con el beacon de
> Web Analytics, es una superficie de padre y D-037 lo autoriza — con la
> única condición que el propio auditor `telemetria-infantil.mjs` exige:
> **citar D-037 explícitamente** en el código que lo haga, para que quede
> claro que es una decisión y no un descuido.

La decisión real que gobierna "nunca comparar a un niño contra otro o contra
un promedio" es **D-025** (el tablero ordena por puntos, nunca expone
percentil ni θ al niño, precisamente porque "traducirlo a percentil
reintroduce la comparación explícita que `mc-18` señala como dañina") más la
carta adversarial `anti-humillacion`, que existe exactamente para esto:
*"Cualquier superficie donde una persona quede expuesta ante otras por su
desempeño... comparaciones no pedidas."*

**El riesgo real y no obvio que este diseño sí encontró, atacando su propio
diseño:** un hogar con más de un hijo recibe **un solo correo** (§4.1, mismo
criterio que el push agregado de #207). Poner a dos hermanos en el mismo
correo es, en sí mismo, una superficie de comparación implícita aunque nunca
se calcule ni se muestre una diferencia explícita — un padre que ve "Hijo A:
+340 puntos" justo arriba de "Hijo B: +40 puntos" saca su propia conclusión
sin que el producto la haya escrito. Reglas de diseño para neutralizar esto,
no opcionales:

1. **Cada hijo tiene su propia sección autocontenida.** Ningún cálculo cruza
   `child_profile_id` — nunca una resta, un ranking o un "mientras que" entre
   hermanos, en ningún punto del código ni de la plantilla.
2. **El orden de las secciones es alfabético por alias, nunca por
   desempeño.** Ordenar por puntos pondría sistemáticamente al mismo hermano
   arriba cada semana, que es una forma de ranking aunque nadie calcule un
   número de diferencia.
3. **Ninguna cifra global del hogar** ("el hogar ganó X puntos en total") que
   pudiera invitar a sumar y comparar mentalmente entre hijos.

## 6. Motor puro — `packages/motor/src/reportes.ts`

Mismo patrón que `puntuacion.ts`, `sesion.ts`, `racha.ts`: función pura,
sin red, sin reloj propio ni acceso a D1 — recibe filas ya leídas y el
snapshot anterior, devuelve una estructura de datos (nunca HTML, nunca texto
ya formado — mismo principio de "clave, no valor" que el resto del motor).

```ts
export interface FilaHijoParaReporte {
  childProfileId: string;
  alias: string;
  scoreAllTime: number;                  // score_totals actual
  xpTotal?: number;                      // xp_totals, si existe (F7)
  currentStreak?: number;                // child_streak, si existe (F7)
  maxStreak?: number;
  pauseUntilLocalDate?: string | null;
  skillsMasteredInPeriod: string[];      // claves i18n de skillId, máx 3
  skillsDueForReview: number;
  snapshot: { lastScoreAllTime: number; lastXpTotal: number | null };
}

export interface ReporteHogar {
  parentUserId: string;
  periodo: { desde: number; hasta: number };
  hijos: SeccionHijo[];  // orden alfabético por alias, nunca por desempeño
}

export interface SeccionHijo {
  alias: string;
  puntosGanados: number;         // scoreAllTime - snapshot.lastScoreAllTime
  xpGanado: number | null;       // null si xp_totals no existe todavía
  rachaActual: number | null;
  mejorRacha: number | null;
  enPausaHasta: string | null;
  habilidadesNuevas: string[];   // claves i18n
  habilidadesConRepasoPendiente: number;
}

export function construirReporteHogar(
  parentUserId: string,
  periodo: { desde: number; hasta: number },
  filas: FilaHijoParaReporte[],
): ReporteHogar {
  // ordena por alias (localeCompare), nunca por desempeño — invariante
  // verificable con una prueba: dos hijos con puntosGanados muy distintos
  // deben aparecer en el mismo orden sin importar quién ganó más.
  // ...
}
```

Invariantes probadas en `reportes.prueba.mjs` (mismo patrón que
`racha.prueba.mjs`, `puntuacion.prueba.mjs`): el orden de `hijos` nunca
depende de `puntosGanados`/`xpGanado`; ningún campo de `SeccionHijo` referencia
a otro hijo; con `xp_totals`/`child_streak` ausentes, los campos opcionales
son `null` y la plantilla los omite en vez de imprimir `undefined` o `0`
engañoso.

## 7. i18n — autoría por locale, nunca traducción mecánica

Igual que Larry (F6) y las series de kinder (F5): **los siete locales de
D-022**, `en`, `es-MX`, `es-ES`, `fr-FR`, `pt-BR`, `pt-PT`, `de-DE`. El motor
puro (§6) emite claves, nunca texto — la plantilla por locale decide la
redacción exacta del asunto y el cuerpo. Todo número (puntos, XP, conteos)
pasa por `formatear()` de `numeros.ts`, ya construido y ya usado por
racha/misiones — evita el error de separador de miles entre `de-DE`/`fr-FR`
(punto/espacio) y `en`/`es-MX` (coma) que `mc-34` documenta.

Registro y tuteo: el correo le habla a un **adulto**, no a un niño — esto
cambia el registro frente a las pantallas in-app de Larry (que sí le hablan
al niño). Cada auditor `locale-<idioma>` de la flota cubre "registro y tuteo
apropiados" para SU locale — para Reportes, el criterio es que sea el
registro correcto para hablarle a un padre, que ya es distinto en varios de
los siete (p. ej. el "tú"/"usted" de `es-MX` frente al padre no es el mismo
que el tuteo que Larry usa con el niño en la misma app).

## 8. Consentimiento y privacidad — qué SÍ y qué NO cambia

- **No se agrega ningún dato nuevo sobre el niño.** Todo lo que el reporte
  muestra ya existe en `score_totals`/`skill_state`/`xp_totals`/`child_streak`
  y ya es visible en vivo dentro de la app para el padre autenticado. El
  reporte es una **entrega distinta** de datos ya gobernados, no una nueva
  recolección — es la razón por la que §3 decidió no crear un
  `consent_code` nuevo.
- **`child_report_state` y `parent_report_settings` entran al runbook de
  borrado de cuatro sistemas** (`mc-32` riesgo #7, D-013): cuando se borra un
  `child_profile` o un `user`, estas dos tablas se limpian por el `ON DELETE
  CASCADE` ya declarado en el esquema — es criterio de aceptación explícito
  que `audits/borrado-cuatro-sistemas.mjs` las reconozca (hoy no las conoce,
  porque no existen).
- **No hay perfilado nuevo.** El estándar 11 de la AADC del Reino Unido
  (`mc-25`, "Profiling — off by default") habla de perfilado con fines
  publicitarios o de terceros; Reportes no comparte nada con un tercero, no
  hace inferencias nuevas sobre el niño, y no alimenta ningún sistema de
  segmentación — solo relee estado ya calculado por el propio producto para
  el propio padre. Se documenta esta lectura explícitamente porque es
  exactamente el tipo de afirmación que `rigor-cientifico` exige poder
  rastrear, no dar por sentada.
- **El correo del padre ya existe** (registro de 2 campos, D-026) — Reportes
  no pide ningún dato nuevo para funcionar.

## 9. Auditores — qué se construye y qué carta hay que ampliar

**Determinista nuevo:**
- `audits/reporte-sin-comparacion.mjs` — análisis estático sobre
  `packages/motor/src/reportes.ts` y las plantillas de `apps/web` que
  renderizan el correo: bloquea si aparece `AVG(`, `PERCENT_RANK`, cualquier
  cálculo que reste o compare dos `child_profile_id` distintos, o cadenas
  literales como "percentil"/"promedio"/"otros niños"/"mejor que" en las
  plantillas de los 7 locales. Cita: D-025, LR-7. **Tiene que verse fallar
  antes del arreglo** (CLAUDE.md § Git regla 3) — se planta una violación
  (una resta entre dos `SeccionHijo`) antes de escribir la regla real.

**Deterministas ya existentes, verificados que siguen pasando (no se
modifican, se corrobora que el diseño no los rompe):** `no-attempts-in-d1.mjs`
(las dos tablas nuevas son estado, no evento), `child-free-text.mjs` (ninguna
columna de texto libre en `child_report_state`), `migration-safety.mjs`
(la migración nueva no toca ninguna tabla INTOCABLE), `notacion-locale.mjs`
(los números del correo pasan por `formatear()`), `locales-complete.mjs`
(7 locales, no 5), `cf-prefix.mjs` (los 3 objetos nuevos llevan
`math-challenge-`).

**Carta adversarial que hay que ampliar — gap real, no hipotético (mismo
patrón que Ligas de F7 amplió `privacidad`/`patrones-oscuros`):**

`anti-humillacion` hoy tiene `alcance = [...INTERFAZ, ...TEXTOS, ...ESQUEMA,
/club|prenda|tablero|leaderboard/i]`. `INTERFAZ` solo cubre `apps/web/` y
`apps/site/`; el riesgo real de este subsistema (§5 — comparación implícita
entre hermanos en el mismo correo) vive en `packages/motor/src/reportes.ts`,
que **no matchea ninguno** de esos patrones salvo que casualmente contenga
"tablero". Sin extender el `alcance`, el auditor que existe exactamente para
cazar este riesgo **nunca despierta** sobre el archivo donde el riesgo vive.
Se propone agregar `/reporte|informe/i` al arreglo de `alcance` de
`anti-humillacion` — su `cita` (`D-025`, `mc-18`, `LR-7`) ya cubre lo
necesario, no hace falta tocarla, solo el `alcance`.

Verificado que **no** hace falta ampliar `privacidad`: su `alcance` incluye
`/^apps\//` sin más calificador, así que el Worker nuevo `apps/reports/` ya
cae dentro sin cambios. Tampoco `patrones-oscuros` (la ruta de baja de un
toque vive en `apps/web/`, dentro de `INTERFAZ`).

## 10. Autocrítica — lo que se atacó del propio diseño

1. **¿Y si un padre con 6 hijos (Plan Familia, D-021) recibe un correo
   enorme?** Con 6 secciones autocontenidas el correo crece pero no se
   degrada — no hay límite de tamaño real (25 MiB de Cloudflare Email
   Service es órdenes de magnitud más grande que 6 secciones de texto). Sí es
   una razón más para no incluir contenido pesado (imágenes por hijo, por
   ejemplo) sin necesidad.
2. **¿Qué pasa si `xp_totals`/`child_streak` no existen cuando esto se
   implemente?** El reporte v1 sale igual, con menos secciones (§2, §6) — no
   se bloquea Reportes esperando a F7. Es una pregunta real para el dueño
   (§11, pregunta 4) sobre si construir ahora con el contrato asumido o
   recortar el alcance.
3. **¿El envío por hora, con ventana de 07-20h local, puede perder un hogar
   si su `send_hour_local` cae fuera de una hora exacta que el cron evalúa?**
   No: el cron corre cada hora en punto y compara contra `send_hour_local`
   (un entero 7-20), así que cada hogar tiene exactamente una oportunidad de
   disparo por día candidato. El riesgo real es que si el Worker falla esa
   hora específica, el hogar espera hasta la siguiente semana/mes en vez de
   reintentar el mismo día — se mitiga con la Cola (reintentos con backoff
   dentro de la misma hora), pero un fallo total del Worker durante toda la
   hora sí pierde el ciclo de ese hogar. Aceptable para un dígest no crítico;
   se documenta como límite conocido, no se sobre-diseña una recuperación
   compleja para un correo semanal.
4. **¿"Habilidades con repaso pendiente" puede leerse como una acusación
   veiled al niño de estar "atrasado"?** Es el riesgo más cercano a violar
   LR-7 de todo el diseño. Se decidió mantenerlo porque el repaso espaciado
   vencido es información **accionable para el padre** (mc-05: sin la pasada
   de repaso, la maestría "provisional" no se vuelve durable) y el framing
   propuesto ("buen momento para repasar") es deliberadamente neutro — pero
   es exactamente el tipo de copy que `reporte-sin-comparacion.mjs` (§9) y el
   auditor `anti-humillacion` ampliado deben revisar con cuidado en cada
   locale, porque el tono correcto en `en` no garantiza el tono correcto en
   `de-DE`.

## 11. Qué NO incluye este subsistema

- **Ningún cobro ni verificación de suscripción** — corrección de alcance del
  dueño. D-021 sigue listando "reportes" como función del Plan Familia; esta
  issue construye la función completa y disponible para **todo** padre, y dejo
  anotado que el gateo de pago se revisita cuando exista una decisión de
  monetización real. Ninguna issue de esta lista depende de Stripe ni de un
  webhook.
- **El panel de diagnóstico** (mastery/knowledge-tracing interactivo,
  `mc-13`) — subsistema hermano de F8, no diseñado aquí. Reportes solo enlaza
  a él.
- **El panel de límite de pantalla** (consumo diario en vivo, edición del
  rango de D-016) — subsistema hermano de F8, no diseñado aquí.
- **Cualquier notificación push** — decisión explícita de §4.1. La
  infraestructura de envío de Web Push que la issue #207 dejó pendiente
  "probablemente para F8" **sigue sin dueño** después de este documento.
- **Reporte de autoaprendizaje del adulto** (bandas SERIO/JR/PRO, D-034,
  `is_learner=1`) — el modelo de datos de este documento es sobre
  `child_profiles`; extenderlo a un adulto reportándose a sí mismo es una
  variante natural pero no construida aquí.
- **El roadmap de cosméticos con siluetas bloqueadas** que `f7-juego.md`
  (subsistema Cosméticos, §7, y la pregunta abierta de la issue #258 sobre
  su padre) dejó como candidato para "el panel de F8" — se responde
  parcialmente: **no es del correo**. Un dígest es para hojear en segundos,
  no para navegar un catálogo con condiciones de desbloqueo; ese contenido
  encaja mejor en el panel de diagnóstico interactivo (subsistema hermano),
  no en Reportes. Si algún día el catálogo de cosméticos emite un evento
  parecido a `EventoDeRango`, una línea "nuevo cosmético desbloqueado" cabría
  en el correo — pero el catálogo mismo (issue #255/#256) no está construido
  todavía, así que no es v1.
- **El tope de `CONFIG_KV.max_child_profiles_free`** (hoy fijo en 6 "hasta
  F8", según F2 §criterio y la issue #120) — **sigue sin resolverse por esta
  pasada**, tal como el encargo pidió explícitamente no resolver. Queda en 6.
- **Minutos practicados y días activos por semana** — no existe ninguna
  fuente agregada por niño para ninguna de las dos métricas (§1). Construir
  una implicaría un nuevo rollup (posiblemente del subsistema de límite de
  pantalla, no de Reportes) — se deja nombrado, no resuelto.

## 12. Lista de issues propuestas (7: 1 paraguas + 6 sub-issues)

1. F8 · Reportes — resumen periódico por correo al padre (paraguas)
2. F8 · Esquema D1: `parent_report_settings` y `child_report_state`
3. F8 · Motor puro: `construirReporteHogar()` en `packages/motor/src/reportes.ts`
4. F8 · Envío: Cron Trigger horario + Cola + Cloudflare Email Service
5. F8 · Preferencia del padre, baja de un toque y ventana de silencio
6. F8 · Plantillas de correo en los 7 locales — autoría, no traducción
7. F8 · Auditor `reporte-sin-comparacion.mjs` y ampliación de la carta `anti-humillacion`


## Preguntas al dueño

- Cadencia default del reporte: ¿semanal (más accionable, coincide con el estándar de la industria de "un dígest de alto valor por semana" y con el framing de "marca personal" que F7 ya usa para la racha) o mensual (menos riesgo de fatiga/queja de correo, más barato de operar, pero menos visibilidad accionable entre envíos)? No hay investigación interna que fije este número — mc-19 solo cubre cadencia de PUSH (1/día), no de correo.
- ¿Se pide la preferencia de cadencia explícitamente al padre —una sexta marca contextual, extendiendo el CHECK de contextual_marks.mark_code que D-026 fijó en exactamente 5— o se activa en semanal por default silenciosamente, con el toggle disponible pero sin pedirlo? Pedirla es más transparente pero toca la migración de F2 y agrega una interrupción más al onboarding que D-026 trabajó activamente para minimizar; activarla en silencio es más simple pero un padre puede recibir un primer correo que no esperaba.
- ¿El correo debe mencionar explícitamente cuando la racha de un hijo está en pausa familiar ("en pausa hasta [fecha]", issue #204 de F7) o se omite toda mención de racha en esos casos para simplificar la v1? Mencionarla es más honesto y evita que el padre crea que la racha se rompió sin explicación; omitirla es menos copy que revisar en 7 locales para un caso relativamente raro (máximo 4 pausas al año por hogar).
- ¿Se construye Reportes ahora asumiendo el contrato de xp_totals/child_streak de F7 (secciones que se activan solas cuando F7 se despliegue, sin necesidad de rediseñar el motor puro después) o se recorta el alcance v1 a solo lo que existe hoy en producción (score_totals + skill_state), ampliando en una issue posterior cuando F7 tenga código real? La primera opción evita duplicar trabajo de diseño; la segunda evita que Reportes quede formalmente bloqueado por una fase hermana que hoy no tiene ni una sola migración.


---

## Crítica adversarial cruzada — los 5 ángulos completos


> Nota: la crítica se corrió sobre los 3 subsistemas, incluido `límite-pantalla`, pese a que ese subsistema ya tenía issues reales — sirvió precisamente para encontrar la colisión de esquema con `panel-diagnostico` documentada arriba.



### Ángulo: lineas-rojas

# Revisión cruzada — F8 · Panel con diagnóstico / Límite de pantalla / Reportes

Verificado contra el repo real (no solo contra los resúmenes): `docs/decisions.md` (D-016, D-020, D-021, D-037, D-051), `audits/child-free-text.mjs`, `audits/adversarial/cartas.mjs`, `apps/ingest/src/index.ts` y `sesion-do.ts`, `docs/planes/f8-limite-pantalla.md` (632 líneas, el único de los tres ya en el repo con issues reales #265–#274), y `gh issue list`.

---

### 1. CONTRADICE — panel-diagnostico × limite-pantalla: dos tablas distintas para el mismo hecho

`panel-diagnostico` §4 crea `screen_time_daily` (`child_profile_id, local_date, minutes_played, ended_by_limit, updated_at`) y se declara dueño: *"única tabla nueva de 'hechos' que F8 posee de verdad"*, escrita "por lotes desde el mismo Worker/DO que ya hace flush de score_totals/xp_totals (rollup.ts)".

`limite-pantalla` (ya con issues reales, `docs/planes/f8-limite-pantalla.md:171-199`, issue #267 **abierta en GitHub**) crea `screen_time_daily_usage` (`child_profile_id, local_date, minutes_used, minutes_since_break, warned_at, ended_reason, updated_at`), escrita con `UPDATE ... SET minutes_used = minutes_used + ?` **después de cada `responderItem`** — explícitamente **no** por lote (`f8-limite-pantalla.md:157,348`), porque el enforcement (aviso a los 5 min, corte) necesita el valor de *ahora*, no el del último flush.

Es el mismo hecho ("minutos jugados hoy por niño, y si terminó por el límite") modelado dos veces, con nombres distintos, columnas distintas (`ended_by_limit` booleano vs. `ended_reason` enum `DAILY_LIMIT|BEDTIME`, sin `minutes_since_break` en la versión de panel) y **mecanismos de escritura incompatibles** (rollup periódico vs. update atómico por ítem). panel-diagnostico ni siquiera sabe que `screen_time_daily_usage` existe — es un documento nuevo (aún no está en `docs/planes/`), mientras que limite-pantalla ya tiene 10 issues filed. Esto viola la propia regla que panel-diagnostico enuncia en su §1 ("el panel nunca recalcula nada que ya tenga dueño en otra fase... una sola fuente de verdad por dato") — solo que la aplicó a F4/F7 y no a su propio subsistema hermano dentro de F8.

**Recomendación:** antes de filear las issues de panel-diagnostico, reescribir su §1/§4/§6 para leer `screen_time_daily_usage` (#267, ya existe) en vez de inventar `screen_time_daily`. Si a panel-diagnostico le falta algo de `screen_time_daily_usage` (p. ej. tendencia semanal de 8 semanas), es una extensión de esa tabla, no una tabla paralela.

---

### 2. CONTRADICE — limite-pantalla afirma una cobertura de auditor que no existe

`f8-limite-pantalla.md:194`: *"No lleva texto libre. `audits/child-free-text.mjs` (ya activo) la cubre sin cambios."* Verificado contra el archivo real:

```js
const CHILD_TABLES = ["child_profiles", "child_image_pin", "skill_state"];
```

`screen_time_daily_usage` **no está** en esa lista — la afirmación es falsa, no una suposición razonable. Es exactamente el mismo hueco que `f7-juego.md` dejó documentado (`CHILD_TABLES` desactualizado) y que **panel-diagnostico sí detectó y corrigió para sus propias dos tablas** (issue 2: agrega `screen_time_daily` y `child_diagnostic_notes` a `CHILD_TABLES`). limite-pantalla, en cambio, afirma que ya está cubierto sin verificarlo contra el código — falla exactamente el método que ambos documentos dicen seguir ("leído completo, no supuesto").

**Recomendación:** issue #267 (o una nueva) debe agregar `screen_time_daily_usage` a `CHILD_TABLES`, con el caso plantado en `audits/pruebas-auditores.mjs` que se vio fallar antes del arreglo (regla de Git #3 de CLAUDE.md). Si el hallazgo 1 se resuelve fusionando las tablas, esto se resuelve junto con `child_diagnostic_notes`.

---

### 3. DÉBIL/CONTRADICE — la misma pantalla "hoy X/Y minutos + tendencia" se diseñó dos veces

`limite-pantalla` issue #269 ("La pantalla del padre: configurar y ver el límite") ya incluye §6 *"Hoy jugó X de Y minutos se muestra al padre... refrescado al abrir/cada ~30s"*. `panel-diagnostico` issue 6 diseña, independientemente, la misma sección ("Hoy: minutos jugados/límite... Tendencia semanal: 8 semanas visibles") citando el mismo `mc-26` impl. #11. Ninguno de los dos documentos menciona al otro. No es solo duplicación de UI — es la consecuencia directa del hallazgo 1: cada uno la construye sobre su propia tabla inventada.

**Recomendación:** el dueño ya tiene una pregunta abierta en limite-pantalla ("¿el ajuste del límite vive en el panel o en un subsistema hermano?") — la respuesta correcta, dado que #269 ya existe con issues reales, es que **limite-pantalla construye la pantalla completa (config + hoy + tendencia)** y panel-diagnostico solo enlaza a ella, en vez de reconstruirla.

---

### 4. FALTA (proceso) — la corrección de alcance "sin Stripe" no está en `decisions.md`

Los tres documentos citan, casi con las mismas palabras, una "corrección de alcance vigente (decisión explícita del dueño, posterior a un primer intento de este encargo)" que pospone D-021/Stripe. Verificado: `docs/decisions.md` (1838 líneas, hasta D-056) **no tiene ninguna entrada** que registre esta corrección — ni una D-057, ni una nota bajo D-021. CLAUDE.md es explícito: *"Toda decisión nueva se anota ahí con fecha... Si una decisión ya está en decisions.md, no se vuelve a discutir."* Hoy la única evidencia de esta decisión vive repetida en tres documentos de subsistema, no en el registro canónico. Una sesión futura que abra `decisions.md` primero (como CLAUDE.md manda) va a leer D-021 tal cual está — "panel con diagnóstico... reportes" como función de pago — sin encontrar la corrección.

**Recomendación:** antes de filear cualquier issue de los tres subsistemas, agregar una entrada fechada (`D-057` o similar) a `decisions.md` que registre explícitamente: *"D-021 pospone el cobro de panel/reportes/límite de pantalla; las tres funciones se construyen disponibles para todo padre sin gate de pago hasta que exista una decisión de monetización real."*

---

### 5. FALTA — el correo ya entregado queda fuera del runbook de borrado de 4 sistemas

`reportes` §8 es riguroso enumerando qué SÍ y qué NO cambia en materia de consentimiento, y dice explícitamente que `child_report_state`/`parent_report_settings` entran al runbook de borrado de D-013/mc-32 (los 4 sistemas: D1, KV, R2, Analytics Engine). Pero ningún punto del documento reconoce que, una vez enviado, **el contenido del correo (puntos, XP, racha, habilidades dominadas, todo etiquetado por alias y atado a la identidad del padre) queda como copia permanente en un servidor de correo de terceros** (Gmail, Outlook, iCloud — lo que el padre haya elegido), completamente fuera de los cuatro sistemas que `mc-32`/D-013 enumeran y que `audits/borrado-cuatro-sistemas.mjs` puede verificar. Si un padre ejerce su derecho de supresión (COPPA/GDPR-K, ya citado en `mc-25` por el propio documento), el runbook borra D1/KV/R2/AE pero no puede tocar un correo que ya está en la bandeja del padre.

Esto no es necesariamente una violación — es una entrega 1:1 al propio padre, la misma categoría que el registro de cuenta (D-026) ya acepta implícitamente para el correo de verificación. Pero el correo de verificación no lleva datos derivados del desempeño del niño; el reporte periódico sí, y es el primer canal del producto que lo hace. El documento no lo nombra en ningún lado, ni siquiera como riesgo residual aceptado (algo que sí hace consistentemente en otras partes — §10.3 documenta el límite del cron, por ejemplo).

**Recomendación:** agregar una línea explícita en §8 o §11: *"El correo, una vez entregado, sale del alcance de `borrado-cuatro-sistemas.mjs` — es un límite conocido y aceptado, igual que cualquier producto que envía resúmenes por correo, no un hueco a resolver aquí."* Cuesta una frase y cierra la brecha entre "lo audité todo" y lo que en realidad se auditó.

---

### 6. BIEN — línea roja #4, verificado, no solo declarado

Contra `git`/`gh` real: ninguna de las 26 issues propuestas/creadas entre los tres subsistemas menciona Stripe, webhook o verificación de suscripción. `D-021` real (`docs/decisions.md:383-396`) confirma que "panel del padre con diagnóstico" y "reportes" **sí estaban** listados como Plan Familia — la corrección de alcance de los tres documentos es, por tanto, una degradación deliberada de D-021 hacia más gratuito, nunca hacia más gate, consistente con la línea roja. Para límite de pantalla, la lectura de que D-021 nunca lo listó como función de pago también es correcta (columna de pago de D-021 no lo menciona). Consistente con la issue #120 ya abierta en GitHub, que cita literalmente "línea roja #4" para el tope de perfiles y confirma el mismo patrón (bandera en `CONFIG_KV`, nunca bloquea un perfil existente).

---

### 7. BIEN — línea roja #2, verificado contra código, no solo contra el diseño

`apps/ingest/src/index.ts:101-113` y `sesion-do.ts:131-146` confirman literalmente que `ATTEMPTS_AE.writeDataPoint` **nunca** incluye `childProfileId` — el hallazgo central del documento de reportes (§1) es correcto y verificable, no una afirmación en tono seguro. Los tres subsistemas coinciden en que lo único que sale del hogar es el correo dirigido al propio padre (reportes), con alias en vez de nombre real (`SeccionHijo.alias`, mismo patrón que D-027 para maestros), y el panel nunca expone nada fuera de la sesión autenticada del padre. No se encontró ninguna ruta donde un dato del niño llegue a un tercero ajeno al hogar.

---

### 8. DÉBIL — reportes no decide qué hacer con `child_diagnostic_notes`

`panel-diagnostico` §7 construye toda una tabla y un contrato (`HABILIDAD_PAUSADA_LATERAL`, `PATRON_INUSUAL_PARA_EDAD`) para las notas del sistema, con D-020 citado explícitamente ("deja una nota suave en **el panel** del padre" — la letra dice panel, no correo, así que la omisión de reportes es defendible). Pero `reportes` §11 lista con cuidado todo lo que excluye (roadmap de cosméticos, panel de límite, push) y no menciona las notas del sistema ni una vez, ni para incluirlas ni para excluirlas explícitamente — es la única pieza de contenido de panel-diagnostico que no aparece ni en el contenido ni en el "qué NO incluye" de reportes. Dado que D-020 dice "panel", no es una violación, pero rompe el patrón de exhaustividad que el resto de §11 sí mantiene.

**Recomendación:** agregar una línea a §11 de reportes: *"Las notas del sistema (`child_diagnostic_notes`) no aparecen en el correo — D-020 las ata específicamente al panel, no a un canal push/email."* Una frase, cierra la duda de si fue una decisión o un olvido.

---

## Resumen

| # | Veredicto | Subsistema(s) | Severidad |
|---|---|---|---|
| 1 | CONTRADICE | panel-diagnostico × limite-pantalla | Alta — bloquea implementación coherente |
| 2 | CONTRADICE | limite-pantalla | Alta — afirmación falsa sobre cobertura de auditor |
| 3 | DÉBIL/CONTRADICE | panel-diagnostico × limite-pantalla | Media — UI duplicada, consecuencia de #1 |
| 4 | FALTA | los 3 (proceso) | Media — riesgo de reintroducir gate de pago en sesión futura |
| 5 | FALTA | reportes | Baja-media — hueco de privacidad no reconocido |
| 6 | BIEN | los 3 | — línea roja #4 verificada, no solo declarada |
| 7 | BIEN | los 3 | — línea roja #2 verificada contra código real |
| 8 | DÉBIL | reportes | Baja — omisión sin decisión explícita |

**El hallazgo que domina la revisión es el #1/#2/#3**: no es que un subsistema individual cruce una línea roja — ninguno lo hace — sino que **panel-diagnostico y limite-pantalla fueron diseñados como si el otro no existiera**, y ambos reinventan la misma tabla de hechos ("minutos jugados hoy") con nombres, columnas y mecanismos de escritura distintos. Dado que limite-pantalla ya tiene issues reales en GitHub (#265–#274) y panel-diagnostico todavía no se ha fileado, la corrección de menor costo es reescribir panel-diagnostico antes de crear sus issues, no rehacer las de limite-pantalla.


### Ángulo: i18n-bandas

# Revisión — lente de idiomas (D-022, mc-34) sobre los 3 subsistemas de F8

Verifiqué contra el repo real: `docs/decisions.md` (D-022), `packages/motor/src/convenciones.ts` (tabla `MATH_CONVENTIONS`), `packages/motor/src/numeros.ts`, `audits/adversarial/cartas.mjs` (carta `locale-${locale}` y `anti-humillacion`), `audits/retro-completa.mjs`, `audits/notacion-locale.mjs`, `audits/locales-complete.mjs`, y `docs/planes/f8-limite-pantalla.md` (el único de los tres que existe como archivo en disco; panel-diagnostico y reportes solo llegaron como texto del encargo, sin archivo en `docs/planes/`).

## F8 · Panel con diagnóstico

- **[DÉBIL]** §15 trata los "7 locales" como un multiplicador de volumen (`60-90 cadenas × 7 locales`) sin verificar ninguno explícitamente más allá del ejemplo de separador de millares (que además es incorrecto, ver hallazgo transversal abajo). A diferencia de Reportes (que sí baja al caso `es-MX` tú/usted), Panel-diagnóstico nunca nombra una diferencia real entre `es-MX`/`es-ES`, `pt-BR`/`pt-PT`, o el registro apropiado para hablarle a un padre en cada uno de los 7. Es el más débil de los tres en cumplir la instrucción de "verificar los siete explícitamente, no en general".
- **[BIEN]** §4 sí declara explícitamente plantilla por locale para las notas del sistema: *"F8 solo LEE esta tabla y la renderiza con plantillas por locale (D-022)"* — no es una plantilla única con variables sustituidas.
- **[DÉBIL]** La extensión propuesta de `audits/retro-completa.mjs` (§7, §12) para cubrir `cause_code` de `child_diagnostic_notes` subestima el trabajo real. Verificado en `audits/retro-completa.mjs:24-25`: el auditor está cableado a un único directorio (`apps/web/src/i18n/reto`) y una única fuente de causas (`packages/motor/src/banco-kinder.ts::generarBanco().errores`). Extenderlo a una fuente estructuralmente distinta (notas del sistema, no del banco de ítems) y presumiblemente a otro directorio de i18n no está ni nombrado — "mismo mecanismo, otro prefijo de clave" no es exacto.
- **[FALTA]** El documento nunca verifica si la carta `locale-${locale}` autoriza juzgar el registro/tono de las notas del sistema y las etiquetas de dominio dirigidas al padre. Verificado en `audits/adversarial/cartas.mjs:277`: el `caza` de esa carta dice textualmente *"Registro y tuteo apropiados para hablarle a **un niño** en ${locale}"* — no a un padre. Todo el contenido de este subsistema es para el padre; ninguna de las 23 cartas queda propuesta para extenderse en ese punto, a diferencia de cómo el propio documento sí revisa cuidadosamente `anti-humillacion` en §3/§12.

## F8 · Límite de pantalla con corte suave

- **[BIEN]** §10 es el tratamiento más disciplinado de los tres: verifica explícitamente `alcance` y `cita` de `rachas-pantalla`, `privacidad`, `kinder`, `patrones-oscuros`, `ux-banda`, `anti-trampa` uno por uno contra los archivos nuevos, en vez de asumir cobertura.
- **[BIEN]** La cita de la carta `locale-${locale}` (§10) se limita correctamente a "traducción literal donde hacía falta autoría" y a cobertura de archivo — no invoca la cláusula de "hablarle a un niño" para reclamar cobertura de registro-para-padre, a diferencia de Reportes. Es la lectura correcta del alcance real de esa carta.
- **[BIEN]** Trata el caso "5 minutos" como una cadena fija autorada por locale, explícitamente fuera de `numeros.ts`, con la razón documentada para que "nadie lo corrija innecesariamente" — es exactamente el tipo de decisión explícita por locale que la instrucción pide.
- **[DÉBIL]** Comparte el mismo error del ejemplo de separador de millares que los otros dos (ver hallazgo transversal).

## F8 · Reportes

- **[BIEN]** §7 y la issue 6 declaran sin ambigüedad "plantilla por locale... el motor puro emite claves, nunca texto" — responde directamente y de forma correcta a la pregunta central del lente sobre plantilla-única-con-variables vs. plantilla-por-locale.
- **[BIEN]** Es el único de los tres que baja a un caso concreto de registro por locale (tú/usted en `es-MX` para el padre, contrastado con el tuteo de Larry al niño en la misma app).
- **[CONTRADICE]** Esa misma sección afirma: *"Cada auditor `locale-<idioma>` de la flota cubre 'registro y tuteo apropiados' para SU locale — para Reportes, el criterio es que sea el registro correcto para hablarle a un padre."* Verificado contra `audits/adversarial/cartas.mjs:277`, el texto real de `caza` dice *"para hablarle a un niño"*, no a un padre — es una relectura no autorizada de la carta, exactamente el patrón que D-032 prohíbe y que el propio documento aplica correctamente en otro lugar (§9, extensión de `alcance` de `anti-humillacion`, con la misma lógica de "el auditor puede sentir pero no puede citar"). Reportes es 100% copy para adulto y no propone ninguna extensión de `caza` para cubrir esto — es una laguna real, no hipotética, y el documento la contradice al darla por resuelta.
- **[FALTA]** Ningún punto del documento discute concordancia gramatical/pluralización de los conteos interpolados en plantilla (`habilidadesNuevas.length`, `habilidadesConRepasoPendiente`, "3 habilidades nuevas" vs "1 habilidad nueva", con reglas de plural distintas en francés/alemán/portugués). "Plantilla por locale" resuelve la arquitectura pero no elimina el riesgo dentro de cada plantilla — no se menciona.

## Hallazgo transversal (afecta a los tres documentos por igual)

**[CONTRADICE]** Los tres subsistemas repiten, casi palabra por palabra, la misma afirmación sobre el separador de millares: *"de-DE/fr-FR usan punto/espacio, en/es-MX usan coma"* (panel-diagnostico §15, límite-pantalla §10, reportes §7). Verificado contra la tabla real `MATH_CONVENTIONS` en `packages/motor/src/convenciones.ts:39-47`:

| locale | `grouping` |
|---|---|
| en | `,` |
| es-MX | `,` |
| es-ES | `.` |
| fr-FR | ` ` |
| pt-BR | `.` |
| pt-PT | `.` |
| de-DE | `.` |

`es-ES`, `pt-BR` y `pt-PT` — **tres de los siete locales** — quedan fuera del ejemplo de los tres documentos, y de hecho agrupan con `de-DE` (punto), no con `es-MX`/`en` (coma) como el ejemplo sugiere implícitamente. No hay riesgo de código (todos delegan a `formatear()`, que sí usa la tabla completa), pero es exactamente el modo de falla que `locales-complete.mjs` describe en su propio comentario: *"el fallo no es olvidar un idioma, es tratar 'es' o 'pt' como uno solo"*. Que la misma frase inexacta aparezca idéntica en tres documentos escritos por separado sugiere que ninguno se verificó contra `convenciones.ts` antes de escribirla, pese a que los tres citan ese archivo como la fuente de verdad en otras partes.

## Resumen de severidad

- **CONTRADICE (2):** Reportes §7 sobre cobertura de `locale-${locale}` para registro de padre (gap real de auditoría, sin mitigación propuesta); el ejemplo de separador de millares, repetido idéntico en los tres documentos, contradice la tabla real del código.
- **DÉBIL (4):** tratamiento genérico de los 7 locales en Panel-diagnóstico §15; alcance subestimado de la extensión de `retro-completa.mjs`; mismo error de millares en Límite de pantalla (heredado del transversal).
- **FALTA (2):** verificación de cobertura de registro-para-padre en Panel-diagnóstico; reglas de pluralización/concordancia en las plantillas de Reportes.
- **BIEN (5):** declaración explícita de plantilla-por-locale en notas (Panel-diagnóstico) y en correos (Reportes); tratamiento cuidadoso y verificado carta-por-carta en Límite de pantalla §10-11; caso concreto de registro es-MX en Reportes; manejo explícito del "5 minutos" como cadena fija fuera de `numeros.ts` en Límite de pantalla.

Rutas relevantes citadas: `/Users/estebanrey/Documents/dev/math-challenge/docs/decisions.md` (D-022), `/Users/estebanrey/Documents/dev/math-challenge/packages/motor/src/convenciones.ts`, `/Users/estebanrey/Documents/dev/math-challenge/packages/motor/src/numeros.ts`, `/Users/estebanrey/Documents/dev/math-challenge/audits/adversarial/cartas.mjs`, `/Users/estebanrey/Documents/dev/math-challenge/audits/retro-completa.mjs`, `/Users/estebanrey/Documents/dev/math-challenge/docs/planes/f8-limite-pantalla.md`.


### Ángulo: auditorias-cartas

## Resumen

Leí completos `audits/run.mjs` (35 auditores deterministas, 5 pendientes de fase) y `audits/adversarial/cartas.mjs` (23 cartas), y verifiqué cada afirmación de los tres documentos de F8 contra el código real de los auditores citados (`child-free-text.mjs`, `no-attempts-in-d1.mjs`, `retro-completa.mjs`, `tabla-bandas.mjs`) y contra las issues de GitHub reales que ya existen (#265–#274, y los precedentes #57/#63/#69/#28/#230 de "Auditoría de cierre").

**Lo que sí se citó bien** (positivo, no reportado como hallazgo):
- `limite-pantalla` hizo la verificación carta-por-carta más rigurosa de los tres: confirmó con exactitud el `cita`/`alcance` real de `rachas-pantalla` (no necesita ampliarse), amplió correctamente `privacidad` (+D-016, +D-051) y `kinder` (+D-016) en una issue dedicada (#274, ya creada y verificada contra el repo), y descartó explícitamente `patrones-oscuros`/`ux-banda`/`anti-trampa` con razón.
- `reportes` identificó correctamente que `privacidad` y `patrones-oscuros` ya cubren su alcance sin cambios (`/^apps\//` ya incluye el Worker nuevo), y encontró un hueco real y bien evidenciado en el `alcance` (no la `cita`) de `anti-humillacion`, con una issue dedicada (#7) para cerrarlo.
- `panel-diagnostico` citó correctamente el `cita` actual de `anti-humillacion` (verificado carácter por carácter contra `cartas.mjs`) y propuso una ampliación válida (D-017/D-020/mc-15, los tres existen de verdad en `decisions.md`/`research/`).

**Los 6 hallazgos confirmados** (detalle completo en el `ReportFindings`):
1. `reportes` no agrega su propia tabla con sujeto-niño (`child_report_state`, PK `child_profile_id`) a `CHILD_TABLES` de `child-free-text.mjs` — repite exactamente el hueco silencioso que el propio `panel-diagnostico` diagnosticó (citando a F7) y corrigió para sus dos tablas nuevas, pero no para la suya propia.
2. `panel-diagnostico` nunca menciona la carta `privacidad`, pese a ser el subsistema que más directamente expone datos del niño al padre — a diferencia de sus dos hermanos, que sí hacen y documentan esa verificación explícita.
3. `panel-diagnostico` tampoco menciona `rachas-pantalla`, pese a introducir `screen_time_daily` y una sección de pantalla — la carta ya la cubre sin cambios, pero eso nunca se verifica por escrito.
4. La afirmación de que ampliar `retro-completa.mjs` a `child_diagnostic_notes.cause_code` es "mismo mecanismo, otro prefijo de clave" es técnicamente inexacta: el auditor real deriva sus causas solo de `banco-kinder.ts` y solo valida `i18n/reto/*.json` con reglas pensadas para retroalimentación infantil de dos frases — extenderlo exige una fuente de datos y una forma de validación distintas, no un prefijo.
5. La ampliación de `anti-humillacion` que `panel-diagnostico` propone (D-017/D-020/mc-15) no tiene issue dueña entre las 9 propuestas — vive solo en prosa, el mismo patrón que la autocrítica de F7 (`f7-juego.md:2683`) ya señaló como problema en Ligas/Tablero-global.
6. Ninguna de las tres issues paraguas de F8 replica completa la sección "Auditoría de cierre — decisión del dueño" (con `subir-sarif.mjs`) que establecieron #57/#63/#69/#28 — la issue real #265 solo tiene una viñeta parcial (sin `subir-sarif.mjs`), y los otros dos documentos no la mencionan en absoluto, pese a que la propia autocrítica de F7 ya había señalado esta ausencia como hallazgo.


### Ángulo: investigacion-fidelidad

# Revisión de fidelidad a la investigación — F8 (los 3 subsistemas)

## Hallazgos (violaciones de fidelidad)

### 1. Cita fabricada de la documentación de Cloudflare Email Service — `reportes` §4.2 [CONFIRMED]
El documento de Reportes presenta como cita textual entre comillas:
> *"Email Service is for transactional email... Marketing/bulk campaigns are not permitted — use a dedicated marketing platform."*

Verifiqué la fuente real (`developers.cloudflare.com/email-service/reference/faq/`). El texto real es:
> *"Email Service is intended only for transactional emails. We plan to support marketing emails and bulk sender tooling in the future."*

Ninguna página de Cloudflare dice "not permitted" ni "use a dedicated marketing platform" — esa segunda mitad de la cita está inventada y presentada con el formato de cita directa de un proveedor. El análisis posterior del propio documento ("no es marketing bajo la lectura operativa de esa regla... se documenta como riesgo operativo a vigilar, no como hecho cerrado") es honesto y matizado — pero la cita entre comillas que lo antecede no es lo que Cloudflare escribió. Esto importa porque el documento se apoya explícitamente en el rigor de citar texto real ("no como una lectura, sino como fuente verificada") en el resto del subsistema.

### 2. "mc-25 obligations matrix" citada para un derecho que esa matriz no documenta — `panel-diagnostico` §2 y §11 [CONFIRMED]
El documento afirma: *"un padre tiene derecho legal de acceso a los datos de su hijo (COPPA/GDPR-K, `mc-25` obligations matrix)"*.

Leí `mc-25` completo, incluida su tabla "Obligations matrix" (columnas: Consent age, Consent method required, Retention rule, Must NOT do). Ninguna fila para COPPA ni GDPR menciona un derecho de acceso parental — la única mención textual de "derecho de acceso" en todo el documento aparece en la sección de **FERPA** ("gives parents rights to access, amend, and control disclosure of a child's education records"), que es un régimen distinto (modo aula, EE.UU. escolar) y está fuera de la matriz de obligaciones citada. El derecho de acceso bajo COPPA (§312.6) y GDPR (Art. 15) existe en la realidad legal, pero **`mc-25`, tal como está escrito, no lo documenta en el lugar que el subsistema cita** — es una atribución a la fuente equivocada dentro del propio corpus, no una invención del hecho legal en sí.

### 3. Cita de `mc-28` sin heredar su propio matiz de confianza — `panel-diagnostico` §8 [PLAUSIBLE]
La cita textual de `mc-28` ("teacher dashboards tend to get used most for simple, actionable signals... conflating them risks optimizing for the wrong signal") es **exacta, palabra por palabra**. Pero `mc-28` antepone esa misma frase con: *"A primary source (Bodily & Verbert's learning-analytics-dashboard review) returned 403 and could not be confirmed. **Based on general, not live-verified, field knowledge**: [...]"* — es decir, la propia investigación marca esa frase como conocimiento general no verificado, no como un hallazgo confirmado.

`panel-diagnostico` §8 usa esa frase como una de las "tres razones independientes, cada una suficiente" para separar el panel del padre del salón del maestro, sin señalar ese matiz — aunque en §13, sobre un tema distinto (ansiedad parental), el mismo documento sí es cuidadoso en marcar a Bodily & Verbert como "`[secundario, no verificado con fetch directo]`". La inconsistencia es que el mismo nivel de cautela no se aplicó al usar la frase de `mc-28` en §8.

## Verificaciones que SÍ son fieles (confirmado explícitamente)

- **D-016 y su honestidad epistémica**: los tres subsistemas citan la frase de D-016 ("solo el tope de 60 min para 2-4 años viene de fuente primaria (OMS). De los 5 años en adelante ninguna autoridad publica una cifra") **verbatim y correctamente**, y ninguno presenta el resto de la tabla (7-11/12-17) como si fuera evidencia científica — todos la tratan como "criterio propio", que es exactamente lo que D-016 exige. La tabla `LIMITES_POR_BANDA` de `limite-pantalla` reproduce los números de D-016 sin alteración (verificado celda por celda).
- **mc-26 implicaciones #11 y #12**: citadas literalmente y sin distorsión en `panel-diagnostico` §6 y usadas correctamente en `limite-pantalla` §6.
- **mc-19 recomendación #13** ("no push before 7am or after 8pm"): citada con fidelidad en `reportes` §4.2 (ventana 07-20h), con la salvedad honestamente señalada de que es una extensión por analogía de push a correo, no una recomendación de mc-19 sobre email.
- **mc-25, implicación #6** ("No profiling, no behavioral ad-tech, no third-party analytics against child profiles") y **estándar 11 de la AADC** ("Profiling — off by default"): ambas citas son exactas, y `panel-diagnostico` señala honestamente que la frase de mc-25 habla de terceros, no extiende la cita más allá de lo que dice.
- **mc-13, implicación de diseño #10** (deferir BKT/PFA/DKT a v2): cita exacta.
- **mc-15** ("ocho sistemas de grado incompatibles", fracciones entre 6 y 9 años): verificado contra el documento — son efectivamente 8 países objetivo (EE.UU./RU/México/España/Francia/Alemania/Brasil/Portugal, excluyendo Singapur/Japón que mc-15 marca solo como referencia) y el rango de edad de fracciones es correcto.
- **D-020 y D-037**: citados verbatim y usados con el alcance correcto (D-037 efectivamente permite campo en "panel de padres, bandas adultas").
- **Estado real de las cartas adversariales** (`rachas-pantalla`, `kinder`, `privacidad`, `anti-humillación`): verifiqué el archivo real `audits/adversarial/cartas.mjs` y en los tres subsistemas las afirmaciones sobre qué `cita`/`alcance` tiene HOY cada carta, y qué le falta, son exactas — incluida la afirmación no trivial de que `INTERFAZ = [/^apps\/web\//, /^apps\/site\//]` no cubriría `packages/motor/src/reportes.ts`, y que `privacidad.alcance` ya incluye `/^apps\//` sin calificador.
- **El hallazgo central de `reportes` §1** (que `ATTEMPTS_AE` nunca recibe `childProfileId`): verifiqué `apps/ingest/src/index.ts` directamente — el comentario citado es exacto, carácter por carácter, y el código confirma que el campo no viaja en `indexes`/`blobs`/`doubles`.

## Archivos consultados
- `/Users/estebanrey/Documents/dev/math-challenge/docs/decisions.md` (D-016, D-017, D-020, D-021, D-037)
- `/Users/estebanrey/Documents/dev/math-challenge/docs/research/2026-07-31-mc-26-screen-time-healthy-defaults.md`
- `/Users/estebanrey/Documents/dev/math-challenge/docs/research/2026-07-31-mc-19-habit-loops-push-notifications.md`
- `/Users/estebanrey/Documents/dev/math-challenge/docs/research/2026-07-31-mc-25-child-privacy-law.md`
- `/Users/estebanrey/Documents/dev/math-challenge/docs/research/2026-07-31-mc-13-its-knowledge-tracing-elo.md`
- `/Users/estebanrey/Documents/dev/math-challenge/docs/research/2026-07-31-mc-28-teacher-classroom-mode.md`
- `/Users/estebanrey/Documents/dev/math-challenge/docs/research/2026-07-31-mc-15-international-grade-ladders.md`
- `/Users/estebanrey/Documents/dev/math-challenge/audits/adversarial/cartas.mjs`
- `/Users/estebanrey/Documents/dev/math-challenge/audits/child-free-text.mjs`
- `/Users/estebanrey/Documents/dev/math-challenge/apps/ingest/src/index.ts`
- `developers.cloudflare.com/email-service/reference/faq/` (WebFetch, para verificar la cita del hallazgo #1)


### Ángulo: completitud

# Auditoría de completitud — F8 · Padres (3 subsistemas)

## Método

Leí `master-plan.md` completo (línea 509, tabla §13.2, §8 anti-trampa, §12 Dinero, §14), `decisions.md` completo (56 decisiones — grep de cada `D-0XX` citada por los tres documentos, más las no citadas: D-011, D-025, D-026, D-040, D-043, D-044, D-051), las 4 menciones literales de "F8" en `f2-cuentas-onboarding.md` y las 7 en `f7-juego.md`, las migraciones `0001`-`0004` reales, `audits/no-attempts-in-d1.mjs`, `audits/child-free-text.mjs`, `audits/adversarial/cartas.mjs` (las cartas `anti-humillacion`, `privacidad`, `kinder`, `rachas-pantalla` completas), el `gh issue list` real (#195-#274), y el archivo completo `docs/planes/f8-limite-pantalla.md` (los otros dos subsistemas no tienen archivo en disco, solo el texto del encargo).

**Veredicto de exactitud factual:** cada cita verificable que contrasté contra el repo real (nombres de columna, `cita`/`alcance` de cartas, códigos de consentimiento, marcas contextuales, tabla de D-016, feature-list real de D-021, números de issue de F7) resultó **exacta**, incluyendo los diffs propuestos a `anti-humillacion`/`privacidad`/`kinder`/`rachas-pantalla` — verifiqué las cuatro cartas línea por línea y los tres documentos acertaron en cuáles ya bastan y cuáles no. Esto no es trabajo superficial.

---

## 1. Cobertura de las menciones de F8 en F2 (4 encontradas)

| Mención en F2 | Resuelta por | Cómo |
|---|---|---|
| `f2:136` — el padre ve/revoca `household_devices` | **panel-diagnostico** | Explícitamente en "Qué NO incluye" (§11): declarada pendiente de un "subsistema hermano de configuración de cuenta", no construida aquí — correcto, ningún subsistema la construye, y queda nombrada, no perdida. |
| `f2:277` y `f2:977` — tope de 6 perfiles vía `CONFIG_KV` "hasta F8" con Stripe | **panel-diagnostico + reportes**, ambos coinciden | Los dos documentos declaran, con las mismas palabras casi, que el tope **sigue en 6 y sin resolver** — consistente con la corrección de alcance del dueño. `limite-pantalla` no lo toca, correctamente (no es su tema). |

Ninguna mención de F2 quedó silenciosamente ignorada. Las tres coinciden entre sí.

## 2. Cobertura de las menciones de F8 en F7 (7 encontradas)

| Mención en F7 | Resuelta por | Cómo |
|---|---|---|
| `f7:807` — infraestructura de Web Push (VAPID, service worker) "coordinación con F8" | **reportes** | Explícitamente declarado sin dueño: "Reportes no lo reclama (decidió no usar push en absoluto) […] Ese trabajo sigue sin dueño." Anotado en "Qué NO incluye". Correcto: no se resuelve, pero tampoco se pierde — y de hecho el master-plan (línea 509) nunca listó notificaciones como parte de F8, así que no es una obligación incumplida. |
| `f7:1092`, `f7:1178`, `f7:2518` — notificaciones push de misión, "posiblemente F8" | **reportes** | Responde explícitamente que no: Reportes usa solo correo, nunca push. Cierra la pregunta con un "no", no la deja abierta. |
| `f7:2373`, `f7:2420` — roadmap de cosméticos en el panel del padre | **panel-diagnostico** | §9, issue 8: "sí, se incluye", con justificación citando la propia pregunta abierta de `mapa-companero`. Resuelta. |
| `f7:2858` — master-plan no declara que F8 depende de F7, aunque en la práctica sí | **panel-diagnostico (§10) y reportes (§4.1)**, ambos por separado | Los dos confirman el hallazgo con hechos (qué tablas de F7 lee cada uno) y recomiendan corregir la fila de `master-plan.md` §13.2, pero explícitamente no la tocan sin autorización del dueño. Correctamente señalado, correctamente no resuelto por su cuenta. `limite-pantalla` no lo menciona, pero tampoco necesitaba hacerlo. |

Las 7 menciones están cubiertas o explícitamente declaradas pendientes — ninguna se perdió.

## 3. Verificación Stripe/pago

Repasé las 26 issues propuestas: **ninguna depende de Stripe ni de verificación de suscripción**, consistente entre los tres documentos. Y verifiqué algo que ninguno de los tres afirma con evidencia textual pero que sostiene su propia corrección de alcance: `decisions.md:391-392` (D-021, la fuente real de "Plan Familia") lista exactamente `panel del padre con diagnóstico, Larry en vivo ilimitado, modo sin conexión, reportes` como funciones de pago — **`límite de pantalla` nunca estuvo ahí**, pese a que `master-plan.md:509` lo agrupa junto a "Stripe" en la fila de F8. El documento `limite-pantalla` lo dice explícitamente ("D-021 nunca listó el límite de pantalla como función de pago") y es **cierto**, verificado contra la fuente primaria, no solo contra el resumen de master-plan.

---

## 4. Hallazgo mayor: dos tablas nuevas para el mismo hecho, diseñadas sin cruzarse

Este es el problema real de completitud entre subsistemas, y ninguno de los tres documentos lo detectó porque cada uno se diseñó mirando solo su propio archivo.

- **`panel-diagnostico` §4** crea `screen_time_daily (child_profile_id, local_date, minutes_played, ended_by_limit, updated_at)`, y afirma explícitamente que es *"la única tabla nueva de 'hechos' que F8 posee de verdad"*, escrita **por lotes** desde el mismo Worker/DO que hace flush de `score_totals`/`xp_totals` (`rollup.ts`).
- **`limite-pantalla` §3** (verificado contra el archivo real `docs/planes/f8-limite-pantalla.md:171-206`) crea `screen_time_daily_usage (child_profile_id, local_date, minutes_used, minutes_since_break, warned_at, ended_reason, updated_at)`, escrita con un `UPDATE` **después de cada `responderItem`** — descartando explícitamente el patrón de `rollup.ts` por una razón operativa real (necesita el reloj, no el tráfico).

Son la misma entidad ("minutos jugados por niño por día") con dos nombres, dos esquemas y dos mecanismos de escritura distintos — y **`docs/planes/f8-limite-pantalla.md` no menciona `screen_time_daily` ni "panel con diagnóstico" ni una sola vez** (lo verifiqué con grep sobre el archivo completo). La colisión es más concreta todavía: el issue #269 de `limite-pantalla` ("La pantalla del padre: configurar y ver el límite") ya construye *"Hoy jugó X de Y minutos"* leyendo de `screen_time_daily_usage` — literalmente la misma pieza de UI que la issue 6 de `panel-diagnostico` ("Límite de pantalla en el panel: hoy, tendencia semanal…") propone construir leyendo de `screen_time_daily`. Dos pantallas del padre, mismo propósito, dos fuentes de datos.

Ninguna de las dos listas de "preguntas al dueño" (ni la de `panel-diagnostico` ni la de `limite-pantalla`) plantea esto como pregunta — y debería, porque el mecanismo de `limite-pantalla` (escritura en tiempo real, necesaria para poder cortar la sesión) es el que de verdad puede alimentar al de `panel-diagnostico` (que asumía poder hacerlo con un rollup por lotes, que no sirve para decidir un corte en vivo). Antes de abrir issues de GitHub para ambos subsistemas, alguien tiene que decidir cuál tabla es la real y hacer que el otro documento la consuma en vez de duplicarla.

## 5. Hallazgo derivado: la premisa de `reportes` sobre "no hay rollup" queda obsoleta

`reportes` §1 y §11 excluyen explícitamente "minutos practicados" y "días activos esta semana" del correo v1, con la justificación textual: *"no existe ningún rollup por niño que las produzca hoy, en D1 ni en AE"*. Esa afirmación era correcta en el momento en que se escribió (contra el estado real de `migrations/` hasta `0004`), pero **queda contradicha por los otros dos subsistemas de F8 mismos** — tanto `screen_time_daily` como `screen_time_daily_usage` son exactamente el rollup por niño/día que faltaba, y cualquiera de los dos permitiría calcular "días activos" (`minutes_played > 0` / `minutes_used > 0`) sin tocar Analytics Engine ni violar `no-attempts-in-d1.mjs`. No es un error del documento de Reportes en el momento en que se escribió — es una consecuencia de que los tres subsistemas de F8 se diseñaron en paralelo sin verse entre sí, y esta premisa necesita revisitarse antes de fijar el alcance v1 del correo.

## 6. Hallazgo menor: ambigüedad de quién escribe `PATRON_INUSUAL_PARA_EDAD`

`panel-diagnostico` atribuye la escritura de esta nota a **F4** ("motor adaptativo/anti-trampa"). Pero `master-plan.md` §8 describe el mecanismo del tier 0 (kinder) como *"puntuación del lado del servidor"* — que es literalmente el entregable de **F3** en la tabla de §13.2 ("puntuación del lado del servidor con HSHS"), mientras que esa misma tabla atribuye *"Anti-trampa tier 0-1"* como cerrado recién en **F11**. La ambigüedad ya existe en el propio master-plan (no la inventa panel-diagnostico), pero el documento la resuelve tomando partido por F4 sin señalar que hay una lectura alternativa igual de válida contra la fuente. Bajo impacto — es un contrato de escritura entre fases que aún no existen — pero vale una nota para cuando F3/F4 se diseñen.

---

## 7. Conteo de issues propuestas

| Subsistema | Issues propuestas | Estado |
|---|---|---|
| Panel con diagnóstico | 9 (1 paraguas + 8) | Propuestas, no creadas en GitHub |
| Límite de pantalla con corte suave | 10 (1 paraguas + 9) | **Creadas: #265–#274** |
| Reportes | 7 (1 paraguas + 6) | Propuestas, no creadas en GitHub |
| **Total F8** | **26** | |

Comparado con F6 (7 issues, fase de un solo subsistema) y F7 (67 issues repartidas en 7 subsistemas, ~9.6 issues/subsistema en promedio): F8 da **26 issues en 3 subsistemas, ~8.7/subsistema** — en línea con el promedio por subsistema que F7 ya estableció, ni inflado ni recortado artificialmente. El tamaño es razonable.

---

## Resumen ejecutivo

Los tres documentos son individualmente rigurosos — cada cita que verifiqué contra el repo real (esquema, cartas adversariales, decisiones, issues de GitHub) resultó exacta, y las preguntas al dueño en los tres casos son preguntas reales, no relleno. Las menciones de F8 en F2 y F7 están todas cubiertas o explícitamente declaradas pendientes, y ninguna issue depende de Stripe pese a que `master-plan.md` agrupa "límite de pantalla" junto a "Stripe" en la fila de F8 (error de esa tabla, no de los subsistemas: D-021 real nunca listó límite de pantalla como función de pago).

El problema real de completitud **no está dentro de ningún subsistema — está entre ellos**: `panel-diagnostico` y `limite-pantalla` diseñaron, sin saberlo, dos tablas D1 distintas (`screen_time_daily` vs `screen_time_daily_usage`) y dos pantallas de padre distintas para el mismo hecho ("minutos jugados hoy"), y `reportes` excluye dos métricas de su v1 basado en una premisa que las otras dos issues ya invalidan. Antes de crear las issues de GitHub de `panel-diagnostico` y `reportes`, hace falta una pasada de reconciliación entre los tres — probablemente resuelta simplemente descartando `screen_time_daily` y haciendo que `panel-diagnostico` lea `screen_time_daily_usage` (que ya tiene todo lo que `screen_time_daily` tenía, y más), pero es una decisión que le corresponde al dueño o a quien abra las tres issues paraguas juntas, no algo que deba asumirse en silencio.
