# F8 · Límite de pantalla con corte suave

> Subsistema de F8 · Padres. No es la fase completa — F8 también trae panel de
> diagnóstico y reportes, diseñados aparte. Este documento cubre solo el límite
> de pantalla: la pantalla donde el padre lo ajusta, el aviso a los 5 minutos,
> la despedida de Larry, el corte nocturno, y la frontera exacta con la racha
> de F7.

## 0. Corrección de alcance, explícita

**Esta pasada no incluye Stripe ni ningún cobro real.** D-021 (Plan Familia
~$8-10/mes) sigue viva como decisión del proyecto — no se toca, no se
contradice — pero implementar el cobro se pospone a una fase futura sin
definir. Ninguna issue de este documento gatea el límite de pantalla, el aviso
de 5 minutos, la despedida de Larry o el corte nocturno detrás de una
suscripción. D-021 listaba "panel del padre con diagnóstico... reportes" como
parte del Plan Familia; **el límite de pantalla no estaba en esa lista** —
D-021 lo da por gratuito implícitamente (nunca aparece en la columna de pago),
y este documento lo construye igual: disponible desde el perfil gratuito, sin
condición de pago, punto.

## 1. Lo que ya existe y no se toca

- **`screen_time_settings`** (`migrations/0002_child_profiles.sql:71`,
  extendida en `0003_accounts_onboarding.sql:118`): `daily_minutes`,
  `break_every_min`, `bedtime_cutoff_min`, `bedtime_local`, `updated_by`. **No
  se rediseña.** Lo que le falta no es una columna — es un lugar donde vivir el
  *consumo de hoy*, que es un problema distinto (§3).
- **`sesion.ts::puntoSeguroDeCorte(estado)`** (F3, ya implementado,
  `packages/motor/src/sesion.ts:165`): devuelve `true` solo si no hay ítem
  servido esperando respuesta. Su propio comentario dice, textual: *"Devuelve
  `true` solo si no hay nada servido esperando. **F8 pregunta, no impone.**"*
  — este documento es, literalmente, el F8 que ese comentario esperaba.
- **`SesionReto.puedeCortar()`** (`apps/ingest/src/sesion-do.ts:159`, ya
  implementado): RPC que envuelve `puntoSeguroDeCorte` y ya trae en su
  comentario *"¿Puede F8 cortar ahora sin partir una respuesta? (D-016)"*. Este
  documento es quien por fin llama ese método.
- **`consent_type_catalog`** ya tiene la fila `SCREEN_TIME` (`0003:69`,
  `legal_basis='CONTRACT'`, `required=0`) — el consentimiento no bloquea nada,
  pero el registro de gobierno ya existe y D-051 dice que `child_consents` es
  la única fuente. Nadie escribe esa fila todavía (ver §5.4).
- **`contextual_marks.mark_code = 'LIMITE_PANTALLA'`** (`0003:185`) — la marca
  ya reservada para "ofrecer configurar el límite". Nadie la dispara todavía.
- **`users.timezone`** — el huso IANA del hogar, ya capturado en el registro
  (`request.cf.timezone`). Es lo único que permite calcular "¿ya es de noche?"
  y "¿qué día es hoy?" en la zona del niño, no en UTC.

### 1.1 Lo que F2 documentó pero no construyó — hallazgo, no suposición

`docs/planes/f2-cuentas-onboarding.md` diseña
`setup/screen-time.astro|.ts` ("defaults de D-016, saltable") como el quinto
paso de la puerta del padre. **No existe en el repo:**

```
$ find apps/web/src/pages -iname "*screen-time*"
(sin resultados)
$ grep -rl "screen_time_settings" apps/web/src
(sin resultados)
```

Ninguna ruta escribe hoy en `screen_time_settings`. Esto importa para el
diseño de §5: la pantalla de F8 **no puede asumir que ya existe una fila** —
tiene que funcionar tanto para un perfil que pasó por el onboarding completo
como para uno que lo saltó o que se creó antes de que esa pieza de F2 se
termine de construir.

### 1.2 Lo que F7 ya diseñó y con lo que este documento coordina, sin repetirlo

Cuatro issues de F7 (Todo, sin código aún: no existe `packages/motor/src/racha.ts`
ni `child_streak` en ninguna migración) fijan el contrato que este documento
**consume**, no rediseña:

| Issue F7 | Qué aporta | Cómo lo usa F8 |
|---|---|---|
| #200 · El día efectivo | `diaEfectivo(instanteUTC, zonaIana)`, y agrega `users.timezone_updated_at` (refresco cada ≥20h desde el login) porque hoy `timezone` solo se escribe una vez, en el registro | El corte nocturno y "minutos de hoy" de F8 necesitan la MISMA fecha/hora local — ver §4 |
| #201 · `child_streak` | `registrarDia(estado, diaEfectivo, motivo)`, `motivo: {tipo:"RETO_COMPLETADO"} \| {tipo:"LIMITE_DE_PANTALLA_CORTO_LA_SESION"}` | F8 es quien produce el segundo motivo — ver §8 |
| #202 · El corte de pantalla nunca rompe la racha | Pide que `EstadoSesion` (o "quien orqueste el cierre") exponga `cortadaPorLimite: boolean` | F8 es quien construye ese campo y el método que lo pone en `true` — ver §8.2, y la pregunta al dueño §14.2 sobre quién lo construye primero |
| #204 · Pausa familiar | Dice explícitamente *"coordina con F8, no bloquea"* para la UI de declarar una pausa | **Fuera de este documento.** Es la UI del subsistema "panel del padre" general, no de límite de pantalla — se nombra aquí para que no se pierda, no se diseña aquí |

## 2. El motor puro: una sola tabla de D-016, nunca copiada

Mismo patrón que `packages/motor/src/bandas.ts` (`temaPorEdad`,
`temasPermitidos`, `temaPermitido`) — la tabla vive en **un** archivo, y tanto
el cliente (para rechazar en la UI antes de someter) como el servidor (para no
confiar nunca en el cliente) importan las mismas funciones.

`packages/motor/src/limite-pantalla.ts`:

```ts
import type { TemaVisual } from "./bandas.ts";

// D-016. Solo KINDER/PRIMARIA/SECUNDARIA tienen fila: SERIO/JR/PRO son el
// adulto aprendiz, que no tiene child_profiles ni screen_time_settings —
// "sin límite" no es una fila con valores infinitos, es la AUSENCIA de fila.
export type BandaConLimite = Extract<TemaVisual, "KINDER" | "PRIMARIA" | "SECUNDARIA">;

export interface LimiteDeBanda {
  defaultMin: number;
  minMin: number;
  maxMin: number;
  descansoCadaMin: number;
  corteNocturnoMinAntes: number;
}

export const LIMITES_POR_BANDA: Record<BandaConLimite, LimiteDeBanda> = {
  KINDER:     { defaultMin: 20, minMin: 10, maxMin: 45, descansoCadaMin: 15, corteNocturnoMinAntes: 60 },
  PRIMARIA:   { defaultMin: 30, minMin: 15, maxMin: 60, descansoCadaMin: 20, corteNocturnoMinAntes: 60 },
  SECUNDARIA: { defaultMin: 45, minMin: 15, maxMin: 90, descansoCadaMin: 25, corteNocturnoMinAntes: 30 },
};

/** ¿Puede el padre guardar este valor para esta banda? Cliente Y servidor llaman esto, nunca uno solo. */
export function minutosDiariosPermitidos(banda: BandaConLimite, minutos: number): boolean {
  const { minMin, maxMin } = LIMITES_POR_BANDA[banda];
  return Number.isInteger(minutos) && minutos >= minMin && minutos <= maxMin;
}
```

- `audits/limite-pantalla-motor-unico.mjs` (nuevo, propuesto): mismo patrón
  exacto que `audits/tabla-bandas.mjs` — lee la tabla de D-016 en
  `docs/decisions.md` con una expresión regular sobre las columnas del
  markdown, la cruza contra `LIMITES_POR_BANDA`, y bloquea si divergen o si
  aparece una segunda declaración de estos números en cualquier otro archivo
  de producto. La razón de existir es literal la misma que ya escribió
  `tabla-bandas.mjs`: *"el síntoma cuando divergen no es un error: es un niño
  colocado en [un límite] al que la interfaz le enseña otro."*
- La validación del **servidor** (en la ruta que guarda `screen_time_settings`)
  importa `minutosDiariosPermitidos` — nunca reimplementa el rango. La
  validación del **cliente** (deshabilitar el botón "Guardar", marcar el campo
  en rojo) importa la misma función desde el bundle del navegador — es
  aritmética pura sin red, cabe en el cliente sin costo.

## 3. La pieza que le falta al esquema: un lugar para "cuánto lleva jugado hoy"

**No es un rediseño de `screen_time_settings`.** Esa tabla guarda la
*configuración* (lo que el padre eligió) y ya tiene las cuatro columnas
correctas para eso. Lo que no existe en ningún lado del esquema es el
*consumo*: cuántos minutos ya jugó el niño **hoy**, across razón de que un
niño puede abrir varios retos distintos en el mismo día y el límite es
diario, no por reto. Sin este dato, ni el aviso de 5 minutos ni el corte
diario se pueden calcular — solo el corte **nocturno** (que depende de la
hora del reloj, no de un acumulado) funcionaría con el esquema actual.

### 3.1 Por qué NO es un Durable Object nuevo (alternativa considerada y descartada)

La primera idea, la más parecida al patrón ya usado en el repo (`math-challenge-
learner-do`, un DO por niño), es un `math-challenge-screentime-do` por niño que
lleve el contador en vivo. La descarto:

- La razón real para un DO-por-niño en F4 es **latencia y consistencia
  serializada de request-a-request** — la selección del siguiente ítem
  necesita ver la última respuesta antes de decidir. Sumar minutos no tiene
  esa exigencia: una escritura con unos cientos de milisegundos de holgura
  entre dos dispositivos del mismo niño jugando a la vez (raro, pero D-012 no
  lo prohíbe) no produce ningún dato incorrecto — cada sesión reporta su
  propio tiempo real, y sumarlos es lo correcto, no una condición de carrera
  que arreglar.
- Un `UPDATE screen_time_daily_usage SET minutes_used = minutes_used + ?`
  sobre D1 es atómico por fila sin necesitar el hilo único de un DO, y ya es
  el patrón que usa `score_totals` (rollup periódico, no por intento) —
  **no** es el patrón que `mc-32` riesgo #1 prohíbe (eso es intentos crudos
  con alta cardinalidad; esto es una fila por niño por día, la misma forma
  que `score_totals`).
- Cada DO nuevo es un objeto más en `docs/infrastructure.md` (hoy "5 de 27
  creados", y ya hay al menos un DO más pendiente de anotar de F7,
  `math-challenge-missions-do`, issue #224) — añadir uno que no resuelve un
  problema de latencia real es coste sin beneficio.

### 3.2 La tabla nueva

```sql
-- screen_time_daily_usage — el consumo que D-016 necesita y screen_time_settings
-- (la CONFIGURACIÓN) nunca guardó. Migración siguiente disponible; verificar
-- migrations/ al implementar, no asumir el número aquí (mismo aviso que dejó
-- F7 #201 para child_streak).
CREATE TABLE screen_time_daily_usage (
  child_profile_id TEXT NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  local_date        TEXT NOT NULL,   -- 'YYYY-MM-DD', zona del hogar (users.timezone)
  minutes_used      INTEGER NOT NULL DEFAULT 0,
  minutes_since_break INTEGER NOT NULL DEFAULT 0,
  warned_at         INTEGER,          -- se avisó el "faltan 5 minutos" hoy; evita avisar dos veces
  ended_reason      TEXT CHECK (ended_reason IN ('DAILY_LIMIT', 'BEDTIME')),
  updated_at        INTEGER NOT NULL,

  PRIMARY KEY (child_profile_id, local_date)
);
```

- Fila por niño por día, mismo espíritu que `score_totals` y `skill_state`
  (rollup, nunca intento crudo).
- `ended_reason` es lo que alimenta el "un día que terminó por el límite,
  nunca por descuido" del panel del padre (subsistema "reportes", fuera de
  este documento — se deja la columna lista para que ese subsistema no tenga
  que volver a tocar el esquema).
- **No lleva texto libre.** `audits/child-free-text.mjs` (ya activo) la cubre
  sin cambios.
- Retención: se borra junto con `child_profiles` por `ON DELETE CASCADE`,
  mismo patrón que toda tabla de niño — `audits/borrado-cuatro-sistemas.mjs`
  (ya activo) la incluye automáticamente porque escanea por FK, no por lista
  a mano.

## 4. `diaEfectivo` — un hallazgo real, no solo una dependencia

F7 #200 construye `diaEfectivo(instanteUTC, zonaIana): string` **dentro de**
`packages/motor/src/racha.ts`. F8 necesita exactamente la misma función —
"¿qué día es hoy en la zona del hogar?" — para escribir en
`screen_time_daily_usage.local_date`, y una segunda función que #200 no
necesita pero F8 sí: **la hora local**, `horaLocal(instanteUTC, zonaIana):
string` (`"HH:MM"`), para comparar contra `bedtime_local`.

Importar una función de tiempo desde un archivo llamado `racha.ts` para un
subsistema que no tiene nada que ver con rachas es el tipo de acoplamiento
que confunde a quien lea el código dentro de un año. **Recomendación de este
documento:** extraer `diaEfectivo` (y agregar `horaLocal` junto a ella) a
`packages/motor/src/tiempo-local.ts`, un módulo neutral que ni racha ni
límite de pantalla "posean" — los dos lo importan. Es una issue pequeña y
barata (§15, issue F8-05) que evita que cualquiera de las dos fases termine
con una copia local de la misma aritmética de zona horaria.

## 5. La pantalla del padre

### 5.1 Dónde vive, y qué NO es

**No es** `setup/screen-time.astro` de F2 (ese es el paso de onboarding,
saltable, que precarga el default de la banda). **Es** una pantalla dentro
del panel del padre — `/[locale]/app/parent/screen-time/[childId]` — a la
que el padre vuelve cualquier día para subir o bajar el número, prender o
apagar el corte nocturno, o simplemente ver cuánto lleva jugado su hijo hoy.
Ambas rutas escriben la misma tabla; **F8 no depende de que la de F2 exista**
(§1.1) porque la ruta de F8 hace *upsert*, no *update*.

### 5.2 El formulario

- **Un control: minutos diarios.** Slider o stepper, limitado en el propio
  HTML (`min`/`max`/`step=1`) a `[minMin, maxMin]` de la banda del niño, con
  el valor actual (o el default de la banda si no hay fila) preseleccionado.
  `minutosDiariosPermitidos()` (§2) decide si el botón "Guardar" está activo
  — intentar guardar un valor fuera de rango con JS deshabilitado (el caso
  que la instrucción de este encargo pide verificar explícitamente) también
  falla, porque el `<input type=range min=X max=Y>` nativo ya lo impide en el
  navegador, y el servidor lo revalida con la misma función de todas formas.
- **Un interruptor: corte nocturno.** Apagado = `bedtime_local = NULL` ("sin
  corte nocturno", el estado que la migración 0003 ya distingue
  explícitamente de medianoche). Encendido revela un `<input type="time">`
  para la hora en que el niño se duerme; `bedtime_cutoff_min` **no se
  expone** — es el valor fijo de la banda (`corteNocturnoMinAntes` de §2),
  calculado, no editable. *(Criterio propio: D-016 solo publica un valor por
  banda para esta columna, sin rango — exponerla como número editable
  inventaría un rango que ninguna fuente sugiere.)*
- **break_every_min NO se expone en esta pasada.** Se aplica el default fijo
  de la banda, sin control. *(Criterio propio, de bajo costo revertir: D-016
  tampoco publica un rango para esta columna, y la ganancia de exponerla es
  marginal frente al costo de un tercer control en una pantalla que D-026 ya
  quiere mínima.)*
- **"Hoy jugó X de Y minutos."** Un resumen de una línea, leído de
  `screen_time_daily_usage` de hoy (0 si no hay fila), refrescado al abrir la
  pantalla y cada ~30 s si el padre la deja abierta — **no** un contador que
  tiquetee segundo a segundo. Responde directamente la pregunta que sugirió
  este encargo: mc-26 implicación de diseño #11 es explícita — *"Parent
  dashboard, minimum contents: today's minutes vs. limit"* — así que se
  construye, con la cadencia de refresco más barata que cumple la
  recomendación, no la más costosa.

### 5.3 ¿Esto mide al niño, y D-037 lo prohíbe?

**No.** D-037 gobierna la telemetría de **rendimiento** — Core Web Vitals vía
el beacon de Cloudflare Web Analytics — y dice, textual, que la razón es que
*"la línea roja #2 dice que el niño no es un usuario, y medir su navegación
[con ese mecanismo] es tratarlo como uno."* Los minutos jugados que ve el
padre aquí no salen de un beacon de analítica de terceros ni de nada que
mida "cómo navega" el niño: salen del mismo reloj de servidor que ya existe
para poder **aplicar el límite que el propio padre configuró** — es la
función, no una medición añadida. Es first-party, dentro de la cuenta del
padre, sobre su propio hijo, para el propósito exacto que D-016 ya aprobó. La
carta `privacidad` (§11) es la que debe poder citar esto si alguna vez lo
revisa, y hoy no puede — es la ampliación que se propone ahí.

### 5.4 El consentimiento que nadie escribe hoy

Cada vez que el padre guarda `screen_time_settings` (por primera vez o al
editar), la ruta hace `INSERT OR IGNORE INTO child_consents (child_profile_id,
'SCREEN_TIME', granted_by, granted_at)` — la fila ya está prevista en el
catálogo desde `0003` y D-051 exige que `child_consents` sea la única fuente
de gobierno; hoy ninguna ruta la llena porque `setup/screen-time` de F2 nunca
se construyó (§1.1). No bloquea nada (`required=0`), pero sin esta escritura
el registro de "qué consintió este padre" queda con un hueco que un auditor
legal notaría antes que nosotros.

### 5.5 Robustez sin fila previa

Si `screen_time_settings` no tiene fila para el niño (onboarding saltado,
perfil viejo, o simplemente F2 nunca corrió ese paso), la pantalla de F8
**la crea con los defaults de la banda al primer guardado del padre** —
`updated_by = parent_user_id` — no exige que exista de antemano. La
aplicación del default de *enforcement* (§7-9, "¿debe existir protección
desde el día uno sin que el padre haga nada?") es una pregunta distinta y
real — ver §14.3.

## 6. El aviso a los 5 minutos

Constante fija en las 3 bandas: `AVISO_MINUTOS_ANTES = 5` (D-016, textual —
no varía por banda, a diferencia del resto de la tabla). Se dispara cuando
`minutes_used >= daily_minutes - 5` **y** llega al siguiente punto seguro de
corte (`puedeCortar()` de la sesión activa) — nunca a media pregunta, mismo
principio que el corte final.

- **PRIMARIA y SECUNDARIA:** interstitial con Larry y el texto "faltan 5
  minutos" (autorado por locale, no traducido — D-022). Es un número fijo,
  no dinámico, así que es una sola frase por locale, no pasa por
  `numeros.ts` — no hay nada que formatear porque no varía.
- **KINDER, sin números:** el niño no lee (mc-20, y `kinder` la carta lo
  vigila). El aviso es una línea de Larry sin cifra —p. ej. (EN inglés, tono
  de referencia, se autora real por locale en la implementación) *"One more
  and then it's time to rest!"*— acompañada de un ícono (una lunita, un
  bostezo) para quien todavía no entiende ni la frase hablada. **No es una
  cuenta regresiva ni un reloj** — evita chocar con D-024/D-045 (sin reloj
  visible ni presión de tiempo en kinder) porque no es un cronómetro, es un
  evento único que ocurre una vez, igual que el corte mismo.
- `warned_at` en `screen_time_daily_usage` evita avisar dos veces el mismo
  día si el niño cierra y reabre la app entre el aviso y el corte real.

## 7. El descanso periódico (`break_every_min`)

Cada vez que `minutes_since_break` alcanza el valor fijo de la banda, en el
siguiente punto seguro de corte se muestra una interstitial de descanso —
Larry sugiriendo estirarse, ver a otro lado, tomar agua (mc-26 implicación de
diseño #6 y #7: el 20-20-20 es una heurística razonable pero no validada por
ensayo, y toda pausa se empareja con una sugerencia de actividad al aire
libre porque es el factor mejor evidenciado contra la miopía, más que el
límite en sí). **No es un bloqueo cronometrado** — un botón "seguir jugando"
está disponible de inmediato; forzar una espera de N segundos sin poder
tocarlo convertiría una pausa saludable en el mismo tipo de fricción punitiva
que D-016 quiere evitar. Al mostrarse, `minutes_since_break` se reinicia a 0;
`minutes_used` (el total del día) no se toca — el descanso no cuenta ni a
favor ni en contra del límite diario.

## 8. La despedida de Larry — el corte real, y la frontera con la racha

### 8.1 El mecanismo

Después de cada `responderItem` exitoso (el mismo punto donde ya se escribe
a `ATTEMPTS_AE`, `apps/ingest/src/sesion-do.ts:129`), el Worker:

1. Calcula el delta de tiempo transcurrido desde el último checkpoint con el
   reloj del servidor (mismo `Date.now()` que `sesion-do.ts` ya usa — nunca
   un tiempo que mande el cliente, mismo principio que protege `anti-trampa`
   aunque aquí el riesgo no sea puntaje sino que el límite se pueda evadir
   cambiando el reloj del dispositivo).
2. Hace `UPDATE screen_time_daily_usage SET minutes_used = minutes_used + ?,
   minutes_since_break = minutes_since_break + ? ...` (creando la fila del
   día si no existe).
3. Si `minutes_used >= daily_minutes` **o** `horaLocal(ahora, zona) `está
   dentro de la ventana de corte nocturno, llama
   `sesionDO.puedeCortar()`.
   - Si `seguro: false` (hay un ítem servido sin contestar): no corta —
     sirve la respuesta normal y vuelve a preguntar en el siguiente
     checkpoint. **Nunca fuerza el corte a media respuesta** (D-016,
     textual).
   - Si `seguro: true`: llama el nuevo RPC `sesionDO.cerrarPorLimite(motivo:
     'DIARIO' | 'NOCTURNO')`, deja de servir ítems nuevos, y el cliente
     recibe la instrucción de mostrar la pantalla de despedida en vez del
     siguiente ítem.

### 8.2 `cerrarPorLimite` — el campo que #202 (F7) esperaba

`packages/motor/src/sesion.ts` gana una función más, mismo estilo que
`servir`/`responder` (pura, sin red, lanza si se llama en mal momento):

```ts
export function cerrarPorLimite(estado: EstadoSesion): EstadoSesion {
  if (!puntoSeguroDeCorte(estado)) {
    throw new Error("cerrarPorLimite llamado con un ítem pendiente — el llamador debe esperar el siguiente punto seguro");
  }
  return { ...estado, cerradaPorLimite: true };
}
```

`EstadoSesion` gana el campo `cerradaPorLimite: boolean` (default `false`).
`SesionReto` (el DO) expone `cerrarPorLimite(motivo)` como RPC, guarda el
resultado, y lo devuelve en la respuesta para que el Worker sepa que puede
mostrar la despedida.

**Esto es exactamente el campo que la issue #202 de F7 pide** ("`EstadoSesion`
... expone si el corte fue por límite de pantalla"). Este documento propone
que **F8 lo construya** — es F8 quien detecta el momento y quien ya está
tocando `sesion.ts`/`sesion-do.ts` para el resto de este mecanismo — y que
#202 se actualice para **leer** `cerradaPorLimite` en vez de reimplementarlo.
Es una decisión de secuenciación real entre dos fases que tocan el mismo
archivo; se deja como pregunta al dueño (§14.2) en vez de asumirse.

### 8.3 La pantalla de despedida

Interstitial de pantalla completa, sin botón "seguir jugando" (a diferencia
del descanso de §7 — aquí sí se terminó). Contenido, por banda:

- **KINDER:** Larry despidiéndose con calidez, sin número de minutos, sin
  "0/N" (mismo principio que F7 issue #222, "El resumen de fin de día
  muestra solo lo logrado, nunca 0/N" — aunque esa issue es de misiones, el
  principio es el mismo y aplica aquí igual). Ícono de "hasta mañana", nunca
  un candado ni un ícono de error — mc-26 implicación de diseño #5: *"a
  friendly character, a session recap, a clear 'see you tomorrow'"*, nunca
  un estado de bloqueo.
- **PRIMARIA/SECUNDARIA:** lo mismo, con el número de retos completados hoy
  (ya lo calcula `progreso(estado)` de `sesion.ts`, reutilizado, no
  recalculado) y una frase que **no** insinúa que el tiempo dañó nada — mc-26
  hallazgo 7/implicación 9: Orben & Przybylski (2019) miden como máximo
  0.4% de varianza de bienestar explicada por tiempo de pantalla, así que el
  copy no dice "ya jugaste demasiado", dice algo del orden de "buen trabajo
  hoy, nos vemos mañana".
- El copy se autora por locale (D-022), igual que todo texto de producto —
  no hay ninguna cifra que formatear salvo el conteo de retos, que si se
  muestra pasa por `numeros.ts::formatear()`.

### 8.4 Lo que F8 NO hace en este punto

No escribe `child_streak`, no llama `registrarDia`, no decide si la racha
avanza. Eso es F7 (#201/#202): F8 deja el hecho (`cerradaPorLimite: true`)
disponible; F7 lo lee y decide la racha. **Esta es la frontera exacta** que
pedía el encargo: F8 construye el detector y el interruptor; F7 construye lo
que ese interruptor enciende.

## 9. El corte nocturno

Mismo mecanismo de §8, disparado por `horaLocal(ahora, zona)` en vez de por
`minutes_used`. Dos preguntas de diseño que D-016 no resuelve por sí sola:

1. **¿El corte nocturno también impide iniciar una sesión nueva de
   madrugada, o solo corta la que esté en curso al llegar la hora?** Real,
   sin resolver aquí — §14.1.
2. **`bedtime_local = NULL` por default** — sin corte nocturno hasta que el
   padre lo prenda explícitamente (§5.2, §5.5). No se inventa una hora de
   dormir adivinada a partir del año de nacimiento: sería un dato que el
   producto no tiene y no debería fingir tener.

## 10. Los siete locales

- Todo copy de este subsistema (aviso de 5 minutos, descanso, despedida,
  textos del formulario del padre) se **autora por locale**, nunca se
  traduce mecánicamente (D-022) — mismo principio que cada subsistema
  hermano ya aplicó.
- Los únicos números dinámicos visibles a un adulto son los minutos
  configurados (10-90) y el conteo de retos de hoy — ambos pasan por
  `numeros.ts::formatear(n, locale)`. Al ser todos de una o dos cifras, el
  separador de miles (el riesgo que más ha mordido a otros subsistemas,
  `de-DE`/`fr-FR` vs `en`/`es-MX`) no aplica en la práctica hoy, pero pasar
  por `formatear()` igual es lo que exige `audits/notacion-locale.mjs` y lo
  que evita que alguien lo escriba a mano el día que un límite de 3 dígitos
  exista.
- El aviso fijo de "5 minutos" para KINDER es un ícono/frase sin cifra — cero
  riesgo de notación porque no hay número que mostrar (§6).
- Auditor `locale-<idioma>` (los 7, `audits/adversarial/cartas.mjs:270`) ya
  cubre "traducción literal donde hacía falta autoría" sobre cualquier
  archivo bajo `i18n/` o `locales?/` — el alcance ya incluye los archivos
  nuevos que este documento crea (`i18n/reto/*.json` para el aviso/descanso/
  despedida, un nuevo directorio `i18n/panel-padre/*.json` para el
  formulario) sin necesitar ninguna ampliación.

## 11. Auditores adversariales — qué se amplía y qué no

Se revisaron las 23 cartas de `audits/adversarial/cartas.mjs` contra este
subsistema, mismo ejercicio que F7 hizo para Ligas (issue real #245,
"Extender las cartas adversariales `privacidad` y `patrones-oscuros` para
poder citar Ligas").

### 11.1 `rachas-pantalla` — NO se amplía (verificado, no asumido)

Es la carta obvia para este subsistema — su propio título es "Rachas y
tiempo de pantalla" y su `caza` nombra, textual, *"un límite que se pueda
saltar sin que el padre lo sepa"* y *"un corte de sesión que pierda el
trabajo del niño a media respuesta"*, exactamente lo que este documento
construye. Se revisó su `cita` (`[LR-6, D-014, D-016, mc-16, mc-19, mc-26]`)
y su `alcance` (`ESQUEMA` + `INTERFAZ` + regex
`racha|streak|pantalla|screen.?time|limite`): **ya incluye D-016 y mc-26**
—las dos fuentes que gobiernan este subsistema— y su `alcance` ya coincide
con toda migración nueva (`ESQUEMA`) y toda ruta/componente nuevo bajo
`apps/web/` (`INTERFAZ`), sin necesitar ninguna palabra clave adicional. A
diferencia de Ligas (que necesitó D-003/D-040/D-043, ausentes de
`privacidad`), aquí no hay una brecha real que cerrar — se documenta la
verificación en vez de inventar una ampliación de relleno. **Nota para quien
la use:** el id de línea de comandos es `rachas-pantalla`, no
"rachas-y-tiempo-de-pantalla" — la propia flota adversarial de F7 encontró
esa confusión en su primera pasada (línea 2681 de `f7-juego.md`); este
documento la cita bien a propósito.

### 11.2 `privacidad` — SÍ se amplía

Su `cita` hoy es `[LR-2, LR-3, D-012, D-013, D-027, mc-25, mc-27, mc-30]` —
**no incluye D-016 ni D-051**. Sin ellas, el auditor no puede señalar con
autoridad si `screen_time_daily_usage` retiene más de lo necesario, o si la
fila de `child_consents` para `SCREEN_TIME` (§5.4) se está escribiendo
correctamente, aunque lo vea: D-032 dice que un auditor solo puede invocar lo
que su carta autoriza. **Se propone agregar `D-016` (la fuente de qué datos
de tiempo de pantalla son necesarios y por qué) y `D-051` (child_consents
como única fuente de gobierno del consentimiento)** a la lista `cita` de
`privacidad`. Su `alcance` (`ESQUEMA` + `MOTOR` + `apps/` + `docs/`) ya
cubre los archivos nuevos sin cambios.

### 11.3 `kinder` — SÍ se amplía

Su `cita` hoy es `[LR-3, D-017, D-020, D-024, mc-06, mc-20, mc-38]` — no
incluye D-016. La interstitial de aviso/descanso/despedida en KINDER (§6-8)
es exactamente la superficie que esta carta vigila ("todo lo que un niño de
4 a 6 años no puede hacer, apareciendo en su banda") y este documento decide
ahí, explícitamente, no mostrar números ni cuenta regresiva — pero si algún
PR futuro lo rompiera (p. ej. alguien agrega "5:00" en vez de la frase sin
cifra), el auditor necesita poder citar D-016 para explicar por qué esa
pantalla existe y qué debía cumplir, no solo D-024/mc-20 en abstracto. **Se
propone agregar `D-016`** a `cita`. `alcance` ya cubre `apps/web/` e incluye
`/kinder/i`, sin cambios necesarios.

### 11.4 `patrones-oscuros`, `ux-banda`, `anti-trampa` — revisadas, no se amplían

- `patrones-oscuros` ya cita D-014, D-016, D-021 — suficiente para vigilar
  que nada de este subsistema empuje hacia una oferta de pago (recordatorio:
  §0, nada aquí depende de cobro) ni fabrique urgencia.
- `ux-banda` ya cita D-017/D-031/D-036/D-041 y los mc- de tamaño de blanco
  táctil por banda — suficiente para el formulario del padre y las tres
  interstitials.
- `anti-trampa` se revisó por el uso de `Date.now()` del servidor en vez del
  reloj del cliente (§8.1) — ya cita D-010/D-020/D-024/mc-29/mc-30/mc-31, que
  cubren "cronometraje hecho en el navegador" en abstracto; este subsistema
  sigue esa misma regla por diseño, no necesita ampliación para que el
  auditor la vigile porque su `caza` ya la nombra en general.

## 12. Auditores deterministas nuevos propuestos

- `audits/limite-pantalla-motor-unico.mjs` (§2) — patrón de
  `audits/tabla-bandas.mjs`, cruza `LIMITES_POR_BANDA` contra la tabla de
  D-016 en `docs/decisions.md`.
- Ninguno más. `child-free-text`, `borrado-cuatro-sistemas`,
  `puntaje-servidor`, `motor-puntuacion`, `notacion-locale`, `retro-completa`
  (ya ACTIVE) cubren el resto de las propiedades relevantes sin necesitar un
  auditor dedicado nuevo — proponer uno por cada issue sería la "inflación de
  la flota" que D-032 pide evitar explícitamente.

## 13. Qué NO incluye este documento

- **Stripe ni ningún cobro real** (§0) — pospuesto a una fase futura sin
  definir; D-021 sigue viva como decisión, no se toca.
- **El panel de diagnóstico** (rendimiento medido con cuidado de D-037, mc-13
  ITS/knowledge tracing) — subsistema hermano de F8, no diseñado aquí.
- **Los reportes** (digest, cadencia, qué se manda) — subsistema hermano de
  F8. `screen_time_daily_usage.ended_reason` (§3.2) se deja lista para que
  ese subsistema la lea, no se diseña el reporte en sí.
- **La declaración de pausa familiar** (F7 #204) — su propio documento ya
  dice "coordina con F8, no bloquea"; su UI vive en el panel del padre
  general, no en la pantalla de límite de pantalla.
- **`registrarDia`/`child_streak`/la decisión de si la racha avanza** (F7
  #201/#202) — F8 expone `cerradaPorLimite`, F7 decide qué hacer con ese
  hecho (§8.4).
- **El tope de perfiles gratis y `CONFIG_KV=6` "hasta F8"** que
  `f2-cuentas-onboarding.md:277,975-977` menciona — ese placeholder existe
  porque F2 asumió que F8 traería Stripe. Como esta pasada de F8 **no** trae
  cobro (§0), **el placeholder sigue sin resolverse** — no se toca, no se
  reemplaza, se deja anotado aquí explícitamente como pendiente real para la
  fase futura de monetización, no como algo que este documento resuelve ni
  ignora en silencio.
- **Notificaciones push relacionadas con el límite** (p. ej. avisar al padre
  cuando el corte ocurrió) — F7 #207 ya reserva el único recordatorio push
  permitido (racha, 1/día, al padre) y su propio documento deja la
  infraestructura de VAPID/service worker como "coordinación con F8, no
  trabajo cerrado". Este documento no la construye — el resumen de "hoy jugó
  X minutos" (§5.2) ya cubre la necesidad sin requerir push.

## 14. Preguntas al dueño — RESUELTAS (2026-08-03, noche)

> **14.1 → D-138:** el corte nocturno **también bloquea iniciar** de
> madrugada. **14.2 →** F8 construye `cerrarPorLimite` y F7 lo lee (ya
> implementado así; ratificado). **14.3 → D-139: SUPERADA la respuesta A
> implementada.** El dueño decidió lo contrario de lo que este documento
> recomendó y de lo que se construyó: **sin fila en
> `screen_time_settings` no hay límite diario** — la protección empieza
> cuando el padre la configura. `configuracionVigente(banda, null)` debe
> dejar de devolver el default de la banda. El cambio de código es
> criterio nuevo de las issues #269 y #404. El texto original de las tres
> preguntas queda abajo como registro.

### 14.1 ¿El corte nocturno también bloquea iniciar una sesión nueva de madrugada, o solo corta la que ya estaba en curso?

- **A) También bloquea iniciar.** Si la hora local está dentro de la ventana
  de corte nocturno, `SesionReto.iniciar()` rechaza (o el Worker no lo llama
  y muestra directamente la pantalla de "es hora de dormir"). Protege el
  caso real que motiva el corte nocturno (mc-26, el RCT de Bath): un niño
  que se despierta a la 1 a.m. y abre la app no debería poder empezar un
  reto nuevo solo porque no había ninguno "en curso" al momento del corte.
  **Mi recomendación**, porque limitar solo las sesiones ya abiertas deja el
  hueco más obvio sin cerrar.
- **B) Solo corta la sesión en curso.** Más simple de construir (una sola
  ruta de código, la de §8, sin tocar `iniciar()`), pero un niño que se
  despierta de madrugada puede jugar libremente mientras no hubiera un reto
  ya abierto al momento exacto del corte — el escenario que la evidencia del
  RCT de Bath (mc-26 §5) trata de prevenir queda parcialmente sin cubrir.

### 14.2 ¿Quién construye `cerrarPorLimite()`/`cerradaPorLimite` en `sesion.ts`/`sesion-do.ts` — F8 o F7?

La issue #202 de F7 ("El corte de pantalla nunca rompe la racha") ya pide que
`EstadoSesion` exponga este campo, pero no está construido y ninguna de las
dos fases tiene código todavía en ese archivo compartido.

- **A) F8 lo construye** (lo que este documento recomienda en §8.2, y sobre
  lo que ya escribió el diseño): F8 es quien detecta el momento del corte y
  ya está tocando `sesion.ts`/`sesion-do.ts` para el resto de este
  mecanismo (§8.1); F7 #202 se actualiza para **leer** `cerradaPorLimite` en
  vez de construirlo.
- **B) F7 lo construye primero**, como su propia issue #202 ya asume; F8
  espera a que exista y solo lo **llama**. Respeta el orden que el propio
  F7 ya escribió, a costa de que F8 quede bloqueado por una fase que ni
  siquiera tiene su primera migración (`child_streak`) escrita todavía.

### 14.3 ¿El límite diario protege desde el día uno sin que el padre haga nada, o solo después de que visite la pantalla de configuración al menos una vez?

- **A) Protección silenciosa desde el día uno** (lo que este documento
  asume en §5.5 y §3): en cuanto existe `child_profiles`, el enforcement
  usa el default de la banda (`LIMITES_POR_BANDA[banda].defaultMin`) aunque
  `screen_time_settings` no tenga fila todavía — la fila se crea al primer
  guardado real del padre, pero el límite ya aplicaba antes de eso.
  **Mi recomendación**, porque la línea roja #6 y D-016 leen como una
  garantía del producto, no como una función opcional que depende de que el
  padre recuerde configurarla — y la marca `LIMITE_PANTALLA` ya prevista en
  el esquema (§1) puede cerrarse con "Cerró" sin que el padre haga nada, lo
  que dejaría a un niño sin protección indefinidamente bajo la alternativa
  B.
- **B) Sin protección hasta que el padre configure explícitamente.** Más
  fiel a "el padre decide", pero un perfil recién creado (o uno viejo, de
  antes de que este documento se implemente) juega sin ningún límite hasta
  que un adulto visite una pantalla que nada lo obliga a visitar.

## 15. Lista de issues

Creadas en GitHub con el mismo formato que las de F5/F6/F7:
**Vía/Depende de/Decisiones/Investigación**, "Qué queda funcionando",
criterios de aceptación en checklist citando auditor por archivo, y, para la
paraguas, "Qué NO incluye" y "Preguntas al dueño".

1. [#265 · Límite de pantalla — issue paraguas](https://github.com/kilowatto/math-challenge/issues/265)
2. [#266 · `packages/motor/src/limite-pantalla.ts` — la tabla única de D-016](https://github.com/kilowatto/math-challenge/issues/266)
3. [#267 · Esquema: `screen_time_daily_usage`, el consumo que faltaba](https://github.com/kilowatto/math-challenge/issues/267)
4. [#268 · Extraer `diaEfectivo`/`horaLocal` a un módulo neutral compartido con F7](https://github.com/kilowatto/math-challenge/issues/268)
5. [#269 · La pantalla del padre: configurar y ver el límite](https://github.com/kilowatto/math-challenge/issues/269)
6. [#270 · El aviso a los 5 minutos, en el punto seguro de corte](https://github.com/kilowatto/math-challenge/issues/270)
7. [#271 · El descanso periódico (`break_every_min`), sin bloqueo cronometrado](https://github.com/kilowatto/math-challenge/issues/271)
8. [#272 · `cerrarPorLimite`: el corte real y la despedida de Larry](https://github.com/kilowatto/math-challenge/issues/272)
9. [#273 · El corte nocturno (`bedtime_local`)](https://github.com/kilowatto/math-challenge/issues/273)
10. [#274 · Ampliar `privacidad` y `kinder` para poder citar límite de pantalla](https://github.com/kilowatto/math-challenge/issues/274)
