# F9 · Grupos infantiles — diseño operativo

> Salón del maestro y club de papás sobre la misma tabla `grupo_infantil`
> (D-043: en esquema, `child_group`). Reglas de seguridad idénticas para los
> dos — es la misma superficie con dos orígenes distintos, nunca dos
> productos con protecciones distintas. Depende de F2 (cuentas, implementado)
> y F7 (racha/XP/liga — el dueño del grupo lee esos datos de solo lectura,
> `child_streak`/`xp_totals` ya en migración `0007`).
>
> **Antes de este documento, F9 no tenía ni un issue en GitHub ni un plan
> escrito** — a diferencia de F7/F8, que ya tenían documentos de diseño
> cuando se les dio esta pasada. Este documento es el primero.

## 0. Qué se leyó antes de diseñar

`CLAUDE.md` completo (línea roja #2 y #3 sobre todo: el niño nunca es
usuario, nunca escribe texto libre — máxima exposición aquí porque es la
única fase donde un adulto sin ser el padre ve datos de un niño).
`docs/decisions.md` completo, en particular D-011, D-027, D-028, D-029,
D-043, D-044, D-064, D-065, y las tres nuevas de hoy (D-086, D-087, D-088)
que este mismo encargo produjo. `master-plan.md` §7 (protección del menor,
modo maestro) y §13.2 (fila de F9). `docs/research/2026-07-31-mc-28-teacher-classroom-mode.md`
completo (modo maestro/salón — 14 implicaciones de diseño, 7 preguntas al
dueño) y `2026-07-31-mc-46-clubs-social-challenges.md` completo (clubs — las
implicaciones que aplican a `grupo_infantil`, no las de `club_adulto`/
prendas, que son F10). `mc-18` (tableros/competencia, Zearn como precedente
no-competitivo), `mc-25` (privacidad infantil, matriz de obligaciones).
Investigación externa dirigida (WebSearch, agosto 2026) sobre patrones de UI
de roster de aula, tarjetas de revisión de identidad, comunidad de solo
lectura sin chat, botón de reporte, y componentes nativos por plataforma —
citada por sección abajo.

## 1. Qué queda funcionando

Un maestro (con o sin escuela verificada detrás) o un padre crea un
`grupo_infantil` con un código de unión. El código produce una **solicitud
pendiente**, nunca una entrada instantánea: el padre del niño la ve, revisa
la identidad declarada (o verificada) del dueño del grupo, y aprueba o
rechaza. El dueño del grupo, una vez aprobado, ve **solo alias, puntos y
racha** de cada niño — nunca nombre real, edad exacta, ni otros grupos.
**Cero chat, cero mensaje directo, en cualquier dirección.** Un botón de
reporte permanente, visible siempre, para el padre. Bitácora completa de
quién pidió, quién aprobó, cuándo — visible para el padre.

## 2. Los dos orígenes, una sola tabla, reglas idénticas

| | Salón del maestro | Club de papás |
|---|---|---|
| Quién lo abre | Un maestro, con o sin escuela verificada (D-086) | Un padre |
| Verificación del dueño | Escuela verificada → maestro heredado; sin escuela → correo+teléfono, insignia "sin verificar" (D-086, D-044) | Correo + teléfono, insignia "sin verificar" — nunca pasa por el modelo de escuela (D-088) |
| Tope de tamaño | 30-35 niños (D-087) | Menor que el de salón (D-027) |
| Quién aprueba la entrada de un niño | Su propio padre, viendo antes la identidad del dueño | Igual |
| Qué ve el dueño | Alias, puntos, racha — nada más | Igual |
| Mezcla de familias sin vínculo previo | No aplica (el salón agrupa por institución) | Permitida — el código basta; el aislamiento de contacto es la mitigación, no el vínculo previo (D-088) |
| Ranking visible | Opt-in, apagado por default, toda banda (D-087) | Igual |
| Chat / mensaje directo | Nunca, en ninguna dirección | Igual |

**Por qué una sola tabla y no dos.** D-027 ya lo fijó: modelarlo con un
campo `tipo` es un modo de falla, no una decisión de esquema — el día que
alguien agregue algo pensado para uno de los dos casos, aterriza por
defecto sobre el otro. `child_group` es una tabla, con una columna
`origen_tipo` (`salon` | `club_papas`) que solo cambia **de dónde viene**
la fila, nunca qué protecciones aplican — las protecciones son del código
que lee la tabla, no de un `if` sobre esa columna.

## 3. Modelo de datos

> **Corrección (2026-08-03).** El primer borrador de este esquema no había
> leído `migrations/0005_group_owner_identity.sql` antes de proponerse — esa
> migración ya reservó exactamente esta revisión humana como un cuarto valor
> pendiente de `assurance` (`declared`/`school_domain`/`human_reviewed`, con
> el comentario *"el valor está para que el día que exista no haga falta otra
> migración"*). `school`/`school_teacher` no compiten con `group_owner_identity`
> ni introducen una segunda fuente de confianza: **la alimentan**. Verificar
> una escuela agrega `school_verified` al `CHECK` de `assurance` y actualiza
> el campo de cada maestro activo bajo ella en la misma transacción; toda
> pantalla (tarjeta de identidad, §4) sigue leyendo un solo campo.

```sql
-- school — la entidad que D-086 introduce. Verificada una vez, autoriza
-- maestros bajo su nombre. NO es una segunda fuente de confianza: su único
-- efecto en group_owner_identity es escribir assurance='school_verified'.
CREATE TABLE school (
  id                    TEXT PRIMARY KEY,
  name                  TEXT NOT NULL,           -- declarado, revisado si no hay atajo de dominio
  country               TEXT NOT NULL,
  locale                TEXT NOT NULL,
  verification_status   TEXT NOT NULL DEFAULT 'pending'
                        CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verification_method   TEXT CHECK (verification_method IN ('domain_shortcut', 'document_review')),
  verified_by           TEXT,                    -- id de quien de revisión humana la aprobó, o 'auto'
  verified_at           INTEGER,
  created_at            INTEGER NOT NULL
);

-- school_teacher — quién está autorizado a crear salones bajo esta escuela.
-- La escuela invita/revoca; el maestro individual nunca vuelve a pasar por T-5.
CREATE TABLE school_teacher (
  school_id   TEXT NOT NULL REFERENCES school(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invited_at  INTEGER NOT NULL,
  revoked_at  INTEGER,
  PRIMARY KEY (school_id, user_id)
);

-- child_group — grupo_infantil de D-027/D-043, una sola tabla para salón y club.
CREATE TABLE child_group (
  id             TEXT PRIMARY KEY,
  owner_user_id  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  origen_tipo    TEXT NOT NULL CHECK (origen_tipo IN ('salon', 'club_papas')),
  school_id      TEXT REFERENCES school(id),      -- NULL salvo salón afiliado (D-086)
  join_code      TEXT NOT NULL UNIQUE,
  max_size       INTEGER NOT NULL,                -- 30-35 salón; menor para club (D-087)
  created_at     INTEGER NOT NULL,
  disabled_at    INTEGER                           -- el dueño puede apagar el código sin borrar el grupo
);

-- child_group_membership — una fila por solicitud, nunca borrada (bitácora).
CREATE TABLE child_group_membership (
  id                 TEXT PRIMARY KEY,
  child_group_id     TEXT NOT NULL REFERENCES child_group(id) ON DELETE CASCADE,
  child_profile_id   TEXT NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  status             TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'removed')),
  requested_at       INTEGER NOT NULL,
  decided_at         INTEGER,
  decided_by         TEXT,             -- users.id del padre que decidió
  leaderboard_opt_in INTEGER NOT NULL DEFAULT 0 CHECK (leaderboard_opt_in IN (0, 1))  -- D-087
);

-- child_group_report — el botón de reporte permanente (patrón Roblox 2026, §9)
CREATE TABLE child_group_report (
  id               TEXT PRIMARY KEY,
  child_group_id   TEXT NOT NULL REFERENCES child_group(id),
  reported_by      TEXT NOT NULL REFERENCES users(id),
  reason_code      TEXT NOT NULL,      -- CHECK cerrado, nunca texto libre — línea roja #3 aplica
                                       -- incluso siendo el padre quien reporta, por consistencia de esquema
  screenshot_r2_key TEXT,              -- adjunto automático, sin pedirle al padre que describa nada
  created_at       INTEGER NOT NULL,
  reviewed_at      INTEGER,
  reviewed_by      TEXT
);
```

**Verificado contra `no-attempts-in-d1.mjs`:** ninguna tabla nueva matchea
`attempts?|responses?|events?|telemetry|interaction_log` — todas son estado/
membresía/bitácora, no intento crudo. `child-free-text.mjs` necesita ganar
`school`, `child_group`, `child_group_membership`, `child_group_report` en
`CHILD_TABLES` — visto fallar antes del arreglo, mismo patrón que F7/F8 ya
repitieron dos veces.

## 4. Verificación del dueño del grupo (T-5) — la tarjeta de identidad

**Patrón externo verificado, dos fuentes que se combinan (no hay un
producto que resuelva exactamente este flujo invertido):**

- **ClassDojo verifica gateando *funciones*, no con una insignia cosmética.**
  Un maestro sin verificar simplemente no tiene acceso a las superficies que
  exponen su perfil al padre — verificado (no fetch en vivo, conocimiento de
  producto). Se adopta el mismo principio: un dueño sin verificar puede
  crear un grupo, pero la escuela verificada es lo único que activa la
  ruta FERPA/COPPA (D-086) — sin escuela, el grupo existe igual, con la
  insignia visible.
- **Bark usa una insignia positiva ("Bark Verified") que aparece cuando hay
  verificación, y su ausencia es la señal de "sin verificar"** — nunca un
  sello rojo de alarma. Se adopta esta gramática visual: la insignia de
  verificado es un elemento positivo que se agrega, no una advertencia que
  se resta.

**La tarjeta que ve el padre antes de aprobar** (no existe en ningún
producto investigado en esta dirección exacta — se sintetiza, no se copia):

```
┌─────────────────────────────────────┐
│ [foto o inicial]  Nombre del dueño   │
│                    ✓ Escuela verificada │  ← solo si school_id apunta a verified
│                    o                  │
│                    ⚠ Sin verificar     │  ← insignia neutra, no roja/alarmante
│                                        │
│ Tipo: Salón de [Nombre de escuela]    │
│    o: Club de papás                   │
│ Correo: •••••@dominio.com (parcial)   │
│                                        │
│ [Aprobar]           [Rechazar]        │
└─────────────────────────────────────┘
```

- **Componentes por plataforma:** Android → M3 `Badge`/`Chip` sobre el
  avatar para el estado de verificación (spec: m3.material.io/components/
  badges); iOS/iPadOS/macOS → HIG *Lists and tables*, fila con accessory
  view; Windows → Fluent 2 `PresenceBadge` (ya trae estados tipo
  disponible/ausente, se reusa como verificado/sin-verificar/pendiente —
  fluent2.microsoft.design/components/web/react/core/badge).
- **Un solo badge, un solo significado.** HIG advierte explícitamente contra
  sobrecargar un badge con más de un significado — el estado de
  verificación y el de "necesita atención" (§6) son *dos* badges/chips
  distintos, nunca el mismo elemento reutilizado.

## 5. Dashboard del dueño del grupo — roster, dispositivo por dispositivo

**Precedente externo:** ClassDojo (tarjeta por alumno: avatar + alias +
racha/puntos, sin feed de texto libre visible al niño) y Khan Academy Kids
(fila → detalle con un toque). Kahoot muestra el propio rango en privado a
cada jugador, nunca el ranking completo por default — refuerza D-087.

**Teléfono (Android gama baja, primario):** lista vertical de una columna,
una fila por niño: avatar/inicial + alias + racha + puntos (si
`leaderboard_opt_in`, si no, esos dos campos se omiten para ese niño, no se
muestran en gris). Selector de grupo arriba si el dueño tiene más de uno
(tope de clubs/salones por cuenta, D-087). Botón de reporte permanente
(§9) siempre visible, no dentro de un menú de tres puntos.

**iPad (D-041, primera clase):** horizontal → *list-detail* (roster a la
izquierda, detalle del niño seleccionado a la derecha: mismo alias/racha/
puntos, sin más — no hay más que mostrar, D-027 ya lo limita). Vertical →
una columna, igual que teléfono.

**Escritorio:** dentro de `layouts/Privada.astro` (D-065), pestaña "Grupos"
cuando `esGrupoOwner` (nueva señal derivada, mismo patrón que `esFamilia`/
`esSolo`).

**El "necesita atención" — sin vergüenza, patrón ClassDojo aplicado al
revés.** ClassDojo recomienda que cualquier valor de "por mejorar" se
muestre como neutro (0), nunca como negativo/rojo — aquí no hay ningún
contador negativo que mostrar (D-027 no expone eso), pero el principio
aplica al único caso real: un niño que no ha entrado en mucho tiempo. Se
muestra como **ausencia de una señal positiva reciente** (ningún ícono, fila
simplemente sin el chip de "activo esta semana"), nunca como un ícono de
alerta roja sobre el niño.

## 6. Ranking opt-in — mecánica (D-087)

Precedente exacto: **Strava "Group Goal"** es colaborativo sin tabla de
posiciones en absoluto; otros tipos de Strava Group Challenge sí la
muestran, solo entre participantes — confirma que "con ranking" y "sin
ranking" son dos modos igual de legítimos dentro del mismo producto, no uno
degradado del otro.

- `child_group_membership.leaderboard_opt_in` default `0`.
- El padre lo activa desde el panel de familia (F8), nunca el dueño del
  grupo lo activa por el niño.
- Un niño con `opt_in = 0` sigue en el roster del dueño (alias/racha/puntos
  visibles al dueño — eso no es "ranking", es la visibilidad mínima que
  D-027 ya autoriza) pero **no aparece en ninguna vista ordenada por
  posición** dentro del grupo.
- Control de "salir del ranking" independiente de salir del grupo — mismo
  principio que F7 ya aplicó al tablero global.

## 7. Sin chat, en ningún punto — verificado por construcción

Ninguna tabla de este documento tiene una columna de texto libre entre
adulto y niño. `child_group_report.reason_code` es `CHECK` cerrado, igual
que `cause_code` de F8. El componente de UI del roster no incluye ningún
campo de entrada — ni para el dueño del grupo, ni para el niño (que de
cualquier forma nunca ve esta pantalla: la ve su padre).

## 8. Botón de reporte — patrón Roblox 2026, adaptado

**Investigación externa (julio 2026, la más reciente encontrada):** Roblox
rediseñó su reporte con: ícono persistente (☰ → escudo "Reportar", o
bandera junto a un nombre), preguntas que se **adaptan al tipo de reporte**
(se saltan las que no aplican), lenguaje reescrito en términos simples,
**captura de pantalla adjunta automáticamente** en vez de pedir que alguien
describa algo, y **confirmación de que el reporte se atendió** (antes de
julio 2026 el reporte se sentía "enviado al vacío").

Aplicado a F9:
- Botón de reporte siempre visible en la pantalla del grupo (para el padre,
  nunca para el niño — el niño no tiene esta pantalla).
- `reason_code` con opciones cerradas por contexto (no es el mismo menú
  para "reportar un grupo" que para "reportar tras ver la identidad del
  dueño") — mismo principio de adaptar preguntas al tipo.
- Captura automática del estado de la pantalla al momento del reporte
  (`screenshot_r2_key`) — nunca se le pide al padre que redacte nada, cero
  texto libre, cumple línea roja #3 sin excepción aunque quien reporta sea
  un adulto.
- El padre recibe confirmación de que el reporte se recibió y, cuando se
  resuelve, una notificación — no un silencio.

## 9. Bitácora — visible al padre

`child_group_membership` nunca se borra, solo cambia `status`. El padre ve,
desde el panel de familia (F8), el historial completo de solicitudes,
aprobaciones, rechazos y salidas de cada hijo — es el análogo del "contacto
de salvaguarda nombrado" que la salvaguarda de deportes juveniles exige
(`mc-46`), adaptado a un producto sin personal: la bitácora es la memoria
que sustituye a una persona designada.

## 10. i18n — 7 locales, autoría, y el lanzamiento acotado (D-087)

Todo el copy de este subsistema (tarjeta de identidad, roster, botón de
reporte, mensajes de aprobación/rechazo) se autora por locale, no se
traduce — mismo principio que el resto del producto (D-022). **Se autora
para los 7, pero F9 se activa primero solo en `en`, `es-MX`, `es-ES`,
`pt-BR`** (D-087) — `fr-FR`, `pt-PT`, `de-DE` esperan revisión legal de
GDPR Art. 8/Children's Code antes de que el flag de activación se encienda
en esos locales. El código no distingue "traducido pero apagado" de
"activo" con un `if` disperso: una bandera de `CONFIG_KV` por locale
(`f9_enabled_<locale>`), mismo patrón que el tope de perfiles de F2.

## 11. Auditores

**Deterministas nuevos:**
- `audits/school-verification-required.mjs` — falla si cualquier ruta crea
  un `child_group` con `origen_tipo='salon'` y `school_id` apuntando a una
  `school` con `verification_status != 'verified'` sin que el flujo pase
  por el camino "sin escuela, correo+teléfono" — evita el estado intermedio
  donde un salón se presenta como afiliado sin estar verificado. Cita:
  D-086, mc-28.
- `audits/grupo-sin-chat.mjs` — falla si cualquier archivo bajo la ruta de
  grupos declara un campo `TEXT` sin `CHECK` entre `owner_user_id` y
  `child_profile_id`, o cualquier componente de mensajería. Cita: LR-3,
  D-027.

**Deterministas existentes, extendidos:**
- `child-free-text.mjs` — `CHILD_TABLES` gana `school`, `child_group`,
  `child_group_membership`, `child_group_report`.
- `no-attempts-in-d1.mjs`, `migration-safety.mjs`, `locales-complete.mjs`,
  `notacion-locale.mjs`, `cf-prefix.mjs` — verificados sin cambios contra
  este esquema (§3).

**Cartas adversariales a ampliar:**
- `privacidad` — su `alcance` ya incluye `/^apps\//` sin calificador, cubre
  este subsistema sin cambio.
- `anti-humillacion` — amplía `alcance` con `/grupo|salon|classroom/i` para
  cubrir el "necesita atención sin vergüenza" de §5; `cita` no necesita
  cambio (D-027/D-028 ya autorizados).
- Cartas nativas (`nativo-ios`/`nativo-ipad`/`nativo-android`/
  `nativo-windows`/`nativo-macos`) — aplican sin cambio al roster/tarjeta de
  identidad (§4-§5).

## 12. Qué NO incluye este documento

- **`club_adulto` y las prendas** — F10, no F9. `mc-46` se citó solo en la
  parte que aplica a `grupo_infantil`.
- **La verificación de antecedentes real de un maestro** — sigue sin existir
  ningún mecanismo que la sustituya del todo; D-086 mitiga con el modelo de
  escuela, no la resuelve por completo (T-5 sigue parcialmente abierta,
  §4 de D-086).
- **El estándar de documento aceptado país por país** — trabajo de
  implementación, no de este diseño.
- **La activación real en `fr-FR`/`pt-PT`/`de-DE`** — depende de revisión
  legal externa a este documento (D-087).

## 13. Issues propuestas (9: 1 paraguas + 8 sub-issues)

1. **[PARAGUAS]** F9 · Grupos infantiles
2. F9 · Esquema: `school`, `child_group`, `child_group_membership`,
   `child_group_report`
3. F9 · Verificación de escuela — atajo de dominio + revisión humana (D-086)
4. F9 · Tarjeta de identidad del dueño — aprobación del padre, por
   dispositivo
5. F9 · Roster del dueño del grupo — dominio por dispositivo (D-065,
   `esGrupoOwner`)
6. F9 · Ranking opt-in dentro del grupo (D-087)
7. F9 · Botón de reporte permanente (patrón Roblox 2026)
8. F9 · Bitácora de membresía, visible al padre
9. F9 · Activación por locale y bandera de `CONFIG_KV` (D-087)

## Preguntas al dueño — ya resueltas en esta sesión

Las 8 preguntas que bloqueaban este diseño (verificación T-5, tope de
tamaño, ranking opt-in/opt-out, alcance de lanzamiento, quién verifica la
escuela, barra del club de papás, mezcla de familias, alcance EU/UK) se
resolvieron de forma interactiva y están incorporadas arriba, con cita a
D-086/D-087/D-088. No quedan preguntas abiertas que bloqueen empezar a
construir — las únicas piezas sin resolver (staffing de la cola de
revisión, estándar de documento por país) son operativas, no de diseño.
