# F10 · Clubs de adultos — diseño operativo

> **Primera versión, 2026-08-03.** F10 no tenía ni un issue ni un plan.
> Este documento es el primero.
>
> **Nota de supervivencia (2026-08-03, noche):** este documento se
> perdió con el borrado y recreación del checkout (dudas §24.6) y se
> re-escribió desde el contexto de la sesión, renumerando sus decisiones
> de D-103..D-107 a **D-117..D-121** — D-103 a D-106 las ocupó el cierre
> de F7 en una sesión paralela.
>
> **Estado del repo al medir:** rama `main`, HEAD `a7850dc`
> (`feat(f7): offline sync… (#408)`), árbol limpio.
>
> **Cómo se produjo:** re-lectura completa desde cero (ninguna
> dependencia de memoria): `decisions.md` entero, todos los planes,
> `dudas.md`, `cartas.mjs`, `run.mjs`, y de la investigación `mc-46`,
> `mc-18`, `mc-16`, `mc-29`, `mc-31`, `mc-43`, `mc-37` completos. Estado
> real en GitHub (cero issues de F10 al empezar). Investigación web
> dirigida (2025-2026, citada por sección). **12 preguntas al dueño en 3
> olas de 4** compartidas con F11 — tres contra la recomendación
> presentada (D-120, D-122 forma mixta, D-124) — volcadas en D-117 a
> D-121 para esta fase.
>
> **Regla del documento:** todo número dice de dónde sale. `[leído:
> archivo:línea]`, `[medido: comando]`, `[verificado en vivo: URL]` o
> `[criterio propio]`.

El club de adultos (`adult_club`): un grupo cerrado de hasta 20 personas
que compite en retos con ventana de tiempo y —en el paso 2, tras la
revisión legal— juega prendas sin perdedor con Larry moderando el texto.
Depende de F2 (cuentas), F7 (ligas, `score_totals_adulto`, alias de
adulto) y F5b (la franja N8-N10 que le da contenido, D-034).

## 0. Qué se leyó antes de diseñar

1. `docs/decisions.md` completo: el núcleo es D-027 (dos sistemas
   separados), D-028 (prendas sin perdedor), D-029 (Larry modera, a
   prueba de fallos, con apelación), D-043 (`adult_club` en el esquema),
   D-084 (el adulto solo, enganche pleno sin tocar #5/#6), D-085 (todo
   gratis), D-034 (F5b existe por F10), y las nuevas D-107 a D-127.
2. `docs/research/2026-07-31-mc-46-clubs-social-challenges.md` completo
   — esta vez **la parte que F9 no usó**: §1 (los tres elementos del
   juego ilegal), §3-§5 (las prendas y Larry moderando), las 19
   implicaciones y las 7 preguntas abiertas.
3. `mc-18` completo (tableros, Glicko-2, daño en el fondo), `mc-16`
   completo (mecánicas Duolingo: eventos de 2-3 horas, relojes
   superpuestos), `mc-29` completo (escalera de 6 tiers, índices
   omega/GBT), `mc-31` completo (qué sobrevive a un solver), `mc-43`
   completo (alias, cosméticos deterministas, Roblox como advertencia),
   `mc-37` completo (canon Larry, ruteo, llamada separada).
4. `docs/planes/f7-juego.md` completo — en especial la crítica de
   completitud §5: *«No existe, en ninguno de los 7 documentos, un issue
   que diseñe qué exactamente F10 va a importar de F7 para sus "retos
   con ventana de tiempo"»*. Este plan la resuelve en §2.
5. `audits/adversarial/cartas.mjs` y `audits/run.mjs` completos: las
   cartas `canon-larry` (cita D-029, alcance `/modera/i`),
   `anti-humillacion` (cita D-028/D-029/mc-46, alcance `/club|prenda/i`)
   y `patrones-oscuros` — y la confirmación de que **no existe ningún
   determinista** de prendas ni de clubs.
6. Investigación web (2025-2026):
   - Marco legal vigente: premio+azar+consideración sigue siendo el
     test `[verificado en vivo: ussweeps.com/about-us/blog/sweepstakes-law/sweepstakes-101/,
     terms.law 2026]`; **Montana endureció en 2025** (SB 555, en vigor
     2025-10-01) y varios estados rechazaron leyes similares — el mapa
     estatal se mueve, lo que refuerza la bandera por mercado del paso 2
     `[verificado en vivo: riverslot.net/blog/the-future-of-sweepstakes-software/]`.
   - Skillz como comparable real: concursos de habilidad con premio en
     efectivo en 45 estados, habilitando por jurisdicción — la prueba de
     que «habilitar por mercado» es la operación normal de este dominio
     `[verificado en vivo: filing SKLZ vía barchart]`.
   - Moderación: la **pre-moderación** (nada se publica antes de
     revisión) es el modelo estándar para superficies de alto riesgo —
     es exactamente D-029 `[verificado en vivo: wraycastle.com guía
     2025/2026, musubilabs.ai guía T&S 2026]`.

## 1. Qué queda funcionando

**Paso 1 (sin apuestas, D-119):** un adulto crea un club (tope 20
miembros, D-118), obtiene un código de unión, y quien lo recibe se une
— los adultos directamente; un adolescente, cuando su padre aprueba
(D-120). El club tiene su tabla (solo alias, puntos del club, racha —
la lista cerrada de siempre) y **retos con ventana de tiempo**: un
miembro lanza un reto, todos juegan el mismo set congelado de ítems
dentro de la ventana, y la tabla del club se ordena por puntos de ese
reto. Nada de esto mueve el tablero global ni las ligas (D-117).

**Paso 2 (prendas, tras la revisión legal de D-126):** el club juega
con las tres formas de prenda de D-028 — colectiva, el ganador elige,
compromiso propio — con el texto moderado por Larry antes de existir
(D-029), aceptación explícita de cada participante antes de arrancar,
salida sin penalización, y apelación humana con un toque (D-121).
**Ningún menor entra jamás a un reto con prenda, y eso es imposible por
esquema, no por regla** (D-120).

## 2. Lo que F10 importa de F7 — la interfaz que la crítica de F7 no encontró

La auditoría de completitud de F7 declaró el hueco. Esta es la
respuesta, pieza por pieza:

| Pieza de F7 (real, en código) | Cómo la usa F10 |
|---|---|
| `league_duel` — set congelado de ítems, ventana 48 h, expiración silenciosa `[leído: migrations/0012_ligas_tablero_duelo.sql:294-322]` | **Molde de `club_challenge`**: misma mecánica (mismo `item_set` JSON congelado para todos, ventana, expiración sin aviso), pero N jugadores en vez de 2, y sin cohorte: la llave es el club |
| `score_totals_adulto` `[leído: migrations/0012:116-133]` | **No se escribe desde el club** (D-117). El club acumula en su propia tabla de resultado por reto |
| `users.alias` / `alias_locale` `[leído: migrations/0012:84-90]` | La identidad del miembro dentro del club: siempre alias, nunca nombre |
| Participante polimórfico (`child_profile_id` XOR `user_id`) `[leído: migrations/0012:228-247]` | El patrón de `adult_club_membership` para D-120 |
| `meta_de_liga` (misión cooperativa sin perdedor) `[leído: docs/planes/f7-juego.md §3.8]` | Molde de la **prenda tipo A** (colectiva): `mc-46` ya la declaró «estructuralmente idéntica» |
| `sumarEnLiga` / `Liga` DO `[leído: apps/web/src/lib/liga-do.ts:299]` | **No se reusa el DO.** El reto del club es asíncrono con ventana larga: la tabla se lee de D1; no hay standings en vivo que difundir (§8) |

**Lo que F10 NO importa:** `cosmetic_catalog` (frontera explícita de
F7: «ninguna tabla de este subsistema referencia `adult_club` ni
viceversa» `[leído: docs/planes/f7-juego.md §7.0]`), ni la cohorte de
liga, ni el opt-in de duelo (aquí el club entero es opt-in por
definición).

## 3. Modelo de datos — migración `0016_clubs_adultos.sql`

**Numeración: `0016`.** Reparto confirmado por el dueño (dudas §24.5):
`0013` = F8 panel, `0014` = F8 reportes, `0015` = F9 grupos, `0016` =
F10 (ésta). Solo AGREGA.

```sql
-- adult_club — el club de D-027/D-043. Sin chat, sin texto libre visible
-- entre miembros: el único texto libre de todo el subsistema es el de la
-- prenda (paso 2), y pasa por Larry ANTES de existir (D-029).
CREATE TABLE adult_club (
  id             TEXT PRIMARY KEY,
  owner_user_id  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name_key       TEXT NOT NULL,               -- clave i18n del nombre generado, NUNCA texto del dueño:
                                              -- el nombre del club se elige de opciones generadas,
                                              -- mismo patrón que el alias (el texto libre visible a
                                              -- otros es solo la prenda, moderada)
  join_code      TEXT NOT NULL UNIQUE,        -- 6 caracteres, alfabeto sin ambiguos (D-113, mismo generador)
  max_size       INTEGER NOT NULL DEFAULT 20 CHECK (max_size BETWEEN 1 AND 20),  -- D-118
  created_at     INTEGER NOT NULL,            -- tasa compartida con F9: 1 grupo/día por cuenta (D-114)
  disabled_at    INTEGER
);

-- adult_club_membership — polimórfica por D-120: un adulto por sí mismo,
-- o un adolescente con la aprobación registrada de su padre.
CREATE TABLE adult_club_membership (
  id               TEXT PRIMARY KEY,
  adult_club_id    TEXT NOT NULL REFERENCES adult_club(id) ON DELETE CASCADE,
  user_id          TEXT REFERENCES users(id) ON DELETE CASCADE,
  child_profile_id TEXT REFERENCES child_profiles(id) ON DELETE CASCADE,
  -- La aprobación del padre, solo para miembros adolescentes (D-120):
  approved_by      TEXT REFERENCES users(id),
  approved_at      INTEGER,
  joined_at        INTEGER NOT NULL,
  left_at          INTEGER,                   -- salida libre, siempre; la fila queda como bitácora
  CHECK ((user_id IS NOT NULL) <> (child_profile_id IS NOT NULL)),
  -- Un adolescente SIN aprobación no existe: las dos columnas o están
  -- las dos (child + aprobación) o ninguna es child.
  CHECK ((child_profile_id IS NULL) = (approved_by IS NULL))
);

-- club_challenge — el reto con ventana de tiempo. Molde league_duel,
-- N jugadores, sin cohorte.
CREATE TABLE club_challenge (
  id            TEXT PRIMARY KEY,
  adult_club_id TEXT NOT NULL REFERENCES adult_club(id) ON DELETE CASCADE,
  item_set      TEXT NOT NULL,                -- JSON de itemIds congelado al crear (servidor)
  nivel         INTEGER NOT NULL CHECK (nivel BETWEEN 1 AND 12),
  created_by    TEXT NOT NULL REFERENCES users(id),
  starts_at     INTEGER NOT NULL,
  expires_at    INTEGER NOT NULL,             -- starts_at + 72 h [criterio propio, §4.4]
  status        TEXT NOT NULL CHECK (status IN ('open','closed','expired')),
  CHECK (expires_at > starts_at)
);

-- club_challenge_result — una fila por miembro y reto: la tabla del club.
-- Puntos del reto, calculados por el servidor con calificar() (D-010);
-- NUNCA alimentan score_totals_adulto (D-117).
CREATE TABLE club_challenge_result (
  challenge_id TEXT NOT NULL REFERENCES club_challenge(id) ON DELETE CASCADE,
  membership_id TEXT NOT NULL REFERENCES adult_club_membership(id) ON DELETE CASCADE,
  points       INTEGER NOT NULL DEFAULT 0,
  completed_at INTEGER,
  PRIMARY KEY (challenge_id, membership_id)
);

-- ─── Paso 2 (prendas, D-119): las tablas nacen apagadas tras la bandera ───

-- club_stake — la prenda. D-028: ninguna forma tiene casilla de perdedor,
-- y esta tabla no tiene ninguna columna donde quepa una: no hay
-- `loser_membership_id`, ni `penalty`, ni `forfeit`. La estructura ES
-- la regla.
CREATE TABLE club_stake (
  id              TEXT PRIMARY KEY,
  challenge_id    TEXT NOT NULL REFERENCES club_challenge(id) ON DELETE CASCADE,
  forma           TEXT NOT NULL CHECK (forma IN ('colectiva','ganador_elige','compromiso_propio')),
  texto           TEXT NOT NULL,               -- el ÚNICO texto libre del subsistema,
                                               -- y solo llega aquí TRAS la moderación (D-029)
  propuesto_por   TEXT NOT NULL REFERENCES users(id),
  moderacion      TEXT NOT NULL CHECK (moderacion IN ('aprobada','rechazada','pendiente')),
  created_at      INTEGER NOT NULL
);

-- club_stake_acceptance — cada participante acepta explícitamente antes
-- de que arranque el reto (mc-46 implicación 10). Solo users(id):
-- un adolescente NO PUEDE aceptar, y solo quien aceptó juega la prenda —
-- así la exclusión del menor de la prenda es imposible de violar por
-- esquema (D-120), no un if que alguien tenga que recordar.
CREATE TABLE club_stake_acceptance (
  stake_id   TEXT NOT NULL REFERENCES club_stake(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  accepted_at INTEGER NOT NULL,
  PRIMARY KEY (stake_id, user_id)
);

-- stake_moderation_log — la bitácora de D-029: cada decisión de Larry,
-- con su texto, veredicto, modelo, motivo y confianza; y la apelación.
CREATE TABLE stake_moderation_log (
  id           TEXT PRIMARY KEY,
  stake_id     TEXT NOT NULL REFERENCES club_stake(id) ON DELETE CASCADE,
  texto        TEXT NOT NULL,
  veredicto    TEXT NOT NULL CHECK (veredicto IN ('pasa','rechaza_persona','rechaza_contenido')),
  modelo       TEXT NOT NULL,                  -- 'gpt-oss-120b' | 'kimi-k2.6'
  confianza    REAL,                           -- escala si baja → modelo mayor (D-035)
  created_at   INTEGER NOT NULL,
  appealed_at  INTEGER,                        -- la apelación de un toque (D-029/D-121)
  human_verdict TEXT CHECK (human_verdict IN ('pasa','rechaza')),
  reviewed_at  INTEGER
);
```

**Verificaciones contra auditores:**

- `no-attempts-in-d1.mjs`: ninguna tabla es por intento; los puntos son
  rollup por reto. Pasa.
- `child-free-text.mjs`: la extensión de F9 (#401) debe cubrir también
  `adult_club_membership` (tabla que puede contener `child_profile_id`).
  `club_stake.texto` es texto libre — **de un adulto, moderado**, así
  que pertenece a la lista blanca escrita a mano del auditor, con su
  razón. Visto fallar antes del arreglo (D-070).
- **Borrado en cascada:** todo cuelga de `users`/`adult_club`/
  `child_profiles` con CASCADE. Borrar la cuenta borra sus clubs,
  membresías, prendas y la bitácora de moderación.
- `migration-safety.mjs`: sin anulaciones, todo es CREATE.

## 4. Flujos, paso a paso

Todo bajo `/[locale]/app/clubes/`, `prerender = false`, noindex,
`layouts/Privada.astro` (D-065) — superficie de adulto.

### 4.1 Crear un club

1. Desde `/app/home`, acción «Crear un club» (patrón D-082). Requiere
   `is_learner = 1` (el club es de adultos que juegan; si la cuenta no
   lo es, la acción lo activa — ya tiene alias por 0012).
2. Nombre del club: **se elige entre opciones generadas** por locale
   (mismo generador y misma lista blanca que el alias — nunca texto
   libre: el nombre del club es visible para 20 personas y no hay
   moderación para nombres; la prenda ya tiene la suya).
3. El servidor verifica la tasa de D-114 (1 grupo/día compartida con
   F9 — la consulta cuenta `child_group` y `adult_club` del día),
   genera el `join_code` (mismo generador que D-113) e inserta.
4. Pantalla del club con el código y el texto autorado: «hasta 20
   personas; los retos son entre ustedes y no mueven el tablero
   global» (D-117, dicho en el producto).

### 4.2 Unirse (adulto)

Código → pantalla del club (nombre, conteo de miembros «12 de 20», sin
lista de miembros — no hay directorio público de quién está dentro
antes de unirse) → un toque para entrar. Sin aprobación del dueño: el
club es entre pares que se pasan el código; la barrera es el código y
el tope.

### 4.3 Unirse (adolescente, D-120)

1. El padre captura el código en SU cuenta (la superficie es de
   adulto), elige qué hijo adolescente entra (`theme_band =
   'SECUNDARIA'` — KINDER y PRIMARIA no existen como opción en este
   flujo).
2. Pantalla de aprobación: qué es un club (tabla compartida entre
   conocidos), qué verá el club sobre su hijo (**alias, puntos del
   reto, racha** — la lista cerrada), y la frase autorada que fija el
   límite: «tu hijo nunca podrá entrar a retos con prenda; esos son
   solo para adultos».
3. Aprobar → `adult_club_membership` con `child_profile_id`,
   `approved_by` = padre, `approved_at`. Rechazar o cerrar no escribe
   nada.
4. **Revocación:** desde la misma pantalla, un toque, inmediato —
   `left_at`. El adolescente desaparece de la tabla del club en la
   siguiente lectura; la fila queda como bitácora.

### 4.4 Lanzar un reto con ventana (cualquier miembro [criterio propio: un club de amigos no tiene jerarquía])

1. Elegir nivel (N8-N10 en la práctica del MVP, D-034) y ventana:
   **72 horas** `[criterio propio]`. Razón: el duelo 1:1 de F7 usa
   48 h; un reto de 20 personas en zonas horarias distintas necesita
   cubrir un fin de semana completo. Se declara negociable.
2. El servidor congela el `item_set` (mismo set para todos — la
   equidad del duelo de F7, aquí con N jugadores) e inserta el reto
   `open` con `expires_at = starts_at + 72 h`.
3. **Ninguna cuenta regresiva visible con urgencia** — la ventana se
   muestra como fecha («hasta el sábado»), nunca como cronómetro que
   tiquetea (`racha-lexico` ya bloquea ese patrón; la urgencia
   fabricada es patrón oscuro también para adultos, D-084 techos).

### 4.5 Jugar el reto y la tabla

1. Cada miembro juega su propia instancia de sesión
   (`math-challenge-sesion-reto-do`, como hoy) con el `item_set`
   congelado; los puntos los calcula `calificar()` (D-010) y caen en
   `club_challenge_result` — nunca en `score_totals_adulto` (D-117).
2. La tabla del reto: alias + puntos, ordenada, visible para todos los
   miembros. Aquí no hay tercios ni posición oculta: son adultos, y
   D-084 fija enganche competitivo pleno — con los techos de siempre
   (la tabla nunca anuncia al último con lenguaje de pérdida;
   `racha-lexico` aplica igual).
3. Al expirar: `status='expired'`, resultados finales, y el ganador es
   quien más puntos — **sin recompensa del sistema** (ningún cosmético,
   ningún XP extra: la victoria es la anécdota, D-028). En el paso 2,
   si el reto tenía prenda, se muestra la prenda cumpliéndose.

### 4.6 La prenda (paso 2, tras `CONFIG_KV.f10_prendas_enabled`)

1. **Proponer:** al crear el reto, cualquier miembro propone la prenda
   eligiendo la **forma** primero (colectiva / el ganador elige /
   compromiso propio) — la forma decide el sujeto gramatical del texto
   (mc-46 §4: es lo que elimina la casilla de perdedor).
2. **Moderar:** el texto viaja al endpoint de moderación
   (`/api/larry/moderar`, llamada separada de la del tutor: prompt
   propio, bitácora propia — D-029/mc-37). Criterio en orden: ¿señala
   a una persona? → rechaza; ¿sexo, violencia, denigración? → rechaza;
   ¿juego entre adultos? → pasa. Ruteo: `gpt-oss-120b`; baja confianza
   → `kimi-k2.6` (D-035). **A prueba de fallos: si la llamada falla o
   expira, la prenda no se publica** — se ofrece reintentar; nunca
   texto sin revisar.
3. **Rechazo:** breve, en personaje, sin sermón (mc-11). **Sin decir
   cuál regla se rompió** `[criterio propio — responde la pregunta
   abierta 6 de mc-46: decirlo enseña a esquivar el filtro]`, más el
   botón de apelación (D-121).
4. **Aceptar:** la prenda aprobada se muestra a todos los miembros
   **antes** de que arranque el reto; solo entra quien la acepta
   explícitamente (`club_stake_acceptance` — solo `users.id`: el
   adolescente no puede, por esquema). Quien no acepta juega el reto
   sin prenda, sin señalamiento. La prenda no se edita una vez
   arrancado el reto.
5. **Cerrar:** al expirar, la prenda se «cumple» sola: la colectiva
   muestra si el grupo llegó (sin anuncio de fracaso si no — el
   contador desaparece, patrón `meta_de_liga`); el ganador elige
   muestra la elección pendiente del ganador; el compromiso propio
   muestra solo a cada quien el suyo.
6. **Apelar:** un toque sobre cualquier rechazo → `appealed_at`; la
   cola la atiende el dueño con el runbook de §9 (D-121).

## 5. Dispositivo por dispositivo

Superficie de adulto completa (tokens SERIO, oscuro por defecto).

**Teléfono (Android gama baja, primario):** lista de clubs (nombre +
«12/20»), dentro del club dos pestañas — Tabla | Retos — nunca la
misma lista con dos órdenes. Fila de reto: nombre, estado («abierto,
hasta el sábado»), mi posición en él si ya jugué. Blancos 48 px. La
propuesta de prenda usa `input type="text"` con `maxlength` (140
caracteres `[criterio propio]` — una prenda es una frase, no un
párrafo), contador incluido, y el estado de la moderación inline
(«Larry la está leyendo…»).

**iPad (D-041):** horizontal → lista de clubs a la izquierda, detalle
(tabla + retos) a la derecha; un tercio de Split View (320-375 px) →
una columna sin scroll horizontal. El modal de prenda nunca es overlay
de pantalla completa: empuja el contenido (la regla de `mc-49` que
D-064 fijó).

**Escritorio:** misma estructura, dos columnas de datos donde el
teléfono apila. El foco visible y el teclado completan todo el flujo
(sin él no hay aceptación de prenda accesible — WCAG 2.1.1).

**Componentes por plataforma (D-031):** pestañas Tabla/Retos → M3
`TabRow` con píldora en Android; segmented control en iOS; línea de
acento Fluent en Windows; radios de sistema (cápsula M3 / 10-12 pt HIG
/ 4 px Fluent); tipografía del sistema en controles (D-036).

## 6. i18n — 7 locales

Todo el copy se autora por locale (D-022): club, tabla, retos,
prendas, rechazos de Larry, apelación, la pantalla de aprobación del
padre. El **prompt de moderación también se autora por idioma**
(responde la pregunta abierta 7 de mc-46: lo denigrante es cultural —
una broma entre cuates en México no lo es en Alemania, y al revés).
Sin bandera de activación por locale para el paso 1; **el paso 2 hereda
el acotamiento de mercado de la revisión legal** (D-119/D-126).

Los nombres de club se generan por locale (mismo generador de alias,
listas autoradas por idioma — mc-43 implicación 1).

## 7. Auditores

**Deterministas nuevos (3):**

1. `audits/prenda-sin-perdedor.mjs` — falla si el esquema gana una
   columna donde quepa un perdedor (`loser|penalty|forfeit|castigo` en
   tablas de club/stake), si `club_stake_acceptance` admite algo que no
   sea `users.id`, o si una ruta escribe `club_stake.texto` sin pasar
   por el endpoint de moderación. Cita: D-028, D-120. Es el auditor
   central de la fase: **la estructura es la regla**, y este vigila la
   estructura.
2. `audits/prenda-falla-cerrada.mjs` — falla si el endpoint de
   moderación tiene un camino de error que inserte la prenda igual, o
   si `club_stake` admite `moderacion='aprobada'` sin fila en
   `stake_moderation_log` (la prenda sin moderación registrada es la
   violación de D-029). Ejecuta el endpoint con el modelo apagado:
   **debe no publicar** (control negativo real, D-070).
3. `audits/club-sin-chat.mjs` — hermano del de F9: ningún `TEXT` sin
   `CHECK`/moderación en tablas de club salvo `club_stake.texto` (con su
   razón en la lista blanca escrita a mano), ningún componente de
   mensajería bajo `app/clubes/`. Cita: D-027, LR-3.

**Existentes, extendidos:**

- `child-free-text.mjs` — la extensión de F9 (#401) gana
  `adult_club_membership` (puede contener `child_profile_id`).
- `alias-nunca-nombre.mjs` — alcance gana `/club/` (la tabla del club
  muestra alias, siempre).
- Cartas adversariales: `canon-larry` (alcance ya cubre `/modera/i` —
  verificar que atrape el nuevo endpoint con un caso plantado);
  `anti-humillacion` (ya cita D-028/D-029 y despierta con
  `/club|prenda/i` — verificado); `patrones-oscuros.cita` gana D-084
  (el techo del enganche adulto).

## 8. Infraestructura Cloudflare

| Objeto | Estado | Nota |
|---|---|---|
| `math-challenge-db` · migración `0016_clubs_adultos.sql` | Nueva | bitácora en el PR |
| `math-challenge-config-kv` | Sin objeto nuevo | `f10_prendas_enabled` |
| **Sin DO nuevo** | Decisión documentada | El reto del club es asíncrono con ventana de 72 h: la tabla se lee de D1; no hay nada que difundir en vivo. Si el paso 2 quisiera «la prenda en vivo», se revisa entonces — no antes |
| Workers AI | Reuso | la llamada de moderación (D-035), tope del DO de gasto igual que el tutor |

## 9. Runbook de la cola de apelaciones (D-121)

```sql
-- Apelaciones pendientes, de más vieja a más nueva:
SELECT l.id, l.texto, l.veredicto, l.modelo, l.confianza, l.appealed_at
 FROM stake_moderation_log l
 WHERE l.appealed_at IS NOT NULL AND l.human_verdict IS NULL
 ORDER BY l.appealed_at;

-- Resolver (tras leer el texto y el veredicto de Larry):
BEGIN;
UPDATE stake_moderation_log SET human_verdict='pasa', reviewed_at=unixepoch()
 WHERE id='<id>';
-- Si pasa: la prenda se publica en la misma transacción…
UPDATE club_stake SET moderacion='aprobada' WHERE id='<stake_id>';
COMMIT;
-- …y el autor recibe el correo de la plantilla autorada por locale.
```

## 10. Qué NO incluye este documento

- **El tablero global y las ligas** (D-117: aislados por decisión).
- **Cosméticos por ganar retos de club** — F7 blindó la frontera; si
  algún día se quiere, es decisión nueva que toca D-014.
- **Chat o cualquier mensaje entre miembros** — D-027, en los dos
  sistemas, para siempre.
- **La pantalla de admin para las colas** — D-116/D-121: SQL + correo.
- **Kinder y PRIMARIA como miembros** — D-120 solo abre SECUNDARIA con
  aprobación del padre.
- **La pista Lean 4** — es contenido de F11 (D-124), no del club.

## 11. Lo que no se pudo verificar

- **El mapa estatal de EE.UU. para prendas** (Montana SB 555 y
  similares): verificado que se mueve; la lista mercado-por-mercado es
  parte del checklist legal de D-126, no de este plan.
- **La latencia real de `gpt-oss-120b` para moderación** en el caso
  claro: la promesa «Larry la está leyendo…» asume <2 s; si no, la UX
  pasa a «te avisamos» — se mide en la primera implementación.
- **Si 72 h es la ventana correcta**: `[criterio propio]`; se ajusta
  con datos de completitud por reto.

## 12. Segunda pasada desconfiando de este documento

1. **Tablas verificadas contra `migrations/`:** `score_totals_adulto`
   y `users.alias` existen (0012); `adult_club` y afines no existen en
   ninguna migración — todo esto es nuevo, sin colisiones de nombre.
2. **Lo que F10 le pide a fases hermanas que ellas no saben:** a F9,
   la tasa de creación compartida (D-114 cubre los dos sistemas — la
   consulta debe contar ambas tablas, y el plan de F9 solo nombra la
   suya; quien aterrice segundo añade la del otro al conteo). A F11, el
   checklist legal que habilita el paso 2 (D-119/D-126). A F7, nada —
   la interfaz es leer su código, no pedirle cambios.
3. **Campos declarados pero nunca exigidos:** `max_size` se exige en la
   ruta de unión (el CHECK solo acota); `moderacion='pendiente'` sin
   moderación ejecutada queda imposible por `prenda-falla-cerrada`.
4. **El punto débil honesto:** la aceptación de prenda referencia
   `users.id` y eso es lo que excluye al adolescente — si algún día se
   propone «prendas familiares», la estructura bloquea exactamente lo
   que D-120 quiere bloquear, y habrá que enmendar D-120/D-028 a
   sabiendas, no por descuido.

## 13. Issues propuestas (1 paraguas + 8)

1. **[PARAGUAS]** F10 · Clubs de adultos
2. F10 · Esquema: `adult_club`, membresía polimórfica, `club_challenge`,
   resultados (migración `0016`)
3. F10 · Crear/unirse al club — código, tope 20, tasa compartida con F9
4. F10 · Membresía de adolescente con aprobación del padre (D-120)
5. F10 · Retos con ventana de 72 h — set congelado, tabla del club,
   aislado del global (D-117)
6. F10 · Larry moderador: endpoint separado, a prueba de fallos, bitácora
   (D-029/D-035)
7. F10 · Las tres formas de prenda + aceptación explícita (paso 2, tras
   bandera — D-119)
8. F10 · Apelaciones: cola del dueño con runbook (D-121)
9. F10 · Auditores: `prenda-sin-perdedor`, `prenda-falla-cerrada`,
   `club-sin-chat` + extensiones

## 14. Ejecución en paralelo (swarm) — territorios, y quién no toca qué

Mismas reglas que F9 (AGENTS.md §1): territorio por agente, registros
compartidos solo al final, migración `0016` ya repartida — ningún
frente toca otro número. Y F10 puede correr en paralelo con F9: rutas
distintas (`/app/clubes/` vs `/app/grupos/`), y su único punto
compartido —la tasa de creación de D-114— lo implementa cada fase
sobre su tabla y quien aterrice segundo añade la del otro al conteo
(§12.2).

### Frentes (4 agentes en paralelo tras el esquema)

| Frente | Issues | Archivos SUYOS | NO toca |
|---|---|---|---|
| **A · Esquema** | #2 de §13 | `migrations/0016_clubs_adultos.sql` (nuevo) | rutas, i18n, endpoints |
| **B · Club y miembros** | #3, #4 de §13 | `pages/[locale]/app/clubes/*.astro`, `pages/api/clubes/*.ts`, `components/clubes/*` | la migración (espera a A), el endpoint de moderación (C), i18n (E) |
| **C · Retos y moderación** | #5, #6, #8 de §13 | `pages/api/clubes/retos/*.ts`, `pages/api/larry/moderar.ts`, el runbook de apelaciones en el PR | las pantallas de B, las prendas UI (D) |
| **D · Prendas (paso 2)** | #7 de §13 | `components/clubes/prenda/*`, la bandera `CONFIG_KV.f10_prendas_enabled` | todo lo del paso 1; su código nace tras la bandera y muere sin ella |
| **E · Auditores y copy** | #9 de §13 | `audits/prenda-*.mjs`, `audits/club-sin-chat.mjs` (nuevos), `apps/web/src/i18n/*.json` (claves `club*`, **solo añadir al final**) | los registros compartidos hasta el cierre |

**A va primero, solo.** B+C en paralelo después; D puede construirse en
paralelo con todo (su código no se enciende sin la bandera); E en
paralelo con todos, con controles negativos sobre archivos reales ya
aterrizados (la `0016` cuando exista, el endpoint de C cuando exista).

### Los archivos que NO se paralelizan en esta fase

`audits/run.mjs` + `audits/pruebas-auditores.mjs` +
`audits/adversarial/cartas.mjs` (registro de E), `docs/infrastructure.md`
(bitácora), y `apps/web/src/i18n/*.json` si dos frentes los tocan la
misma semana — en ese caso **solo añadir al final** y el orquestador
resuelve: los dos lados se conservan. `wrangler.jsonc` y
`astro.config.mjs` no los toca nadie en F10: no hay DO nuevo (§8).

### El encargo de cada agente

La misma plantilla de F9 §19: qué leer numerado (CLAUDE.md, este plan,
D-027/028/029/035/043/084/085 y las de su frente, `mc-46` completo, el
archivo patrón — para A es la `0012`; para C, `apps/web/src/lib/liga-do.ts`
y `packages/tutor/src/en-vivo.ts`) · su territorio y el de los demás ·
las líneas rojas que puede cruzar (B/D: LR-3 y D-027; D: D-028 es su
trabajo entero) · qué cuenta como prueba (gate verde pegado; para C, el
endpoint con el modelo apagado **visto no publicar**) · las cinco
trampas medidas · cierre: rama desde `origin/main`, Conventional
Commits, PR sin mergear, y decir lo que el cambio NO hizo.

## Preguntas al dueño — resueltas en esta sesión

| # | Pregunta | Respuesta | Decisión |
|---|---|---|---|
| 1 | ¿Retos aislados o con efecto global? | Aislados en el club | D-117 |
| 2 | ¿Tope del club? | 20 miembros | D-118 |
| 3 | ¿Prendas en v1? | Dos pasos, tras revisión legal | D-119 |
| 4 | ¿Adolescentes en el club? | Sí, con aprobación del padre — nunca en prendas | D-120 |
| 5 | ¿Quién atiende apelaciones? | Dueño, patrón D-116 | D-121 |
