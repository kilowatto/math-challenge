# F9 · Grupos infantiles — diseño operativo

> **Segunda pasada, 2026-08-03.** El primer borrador (mismo día, más
> temprano) quedó corto frente al estándar de F8: 367 líneas sin flujos
> paso a paso, sin componentes por dispositivo, y con cuatro afirmaciones
> que el repo real contradice. Esta versión lo reescribe completo. Lo que
> el primer borrador pensó distinto queda anotado como **Corrección
> (2026-08-03)** donde tocaba, no borrado.
>
> **Nota de supervivencia (2026-08-03, noche):** este documento se
> perdió con el borrado y recreación del checkout (dudas §24.6) y se
> re-escribió desde el contexto de la sesión, renumerando sus decisiones
> de D-093..D-102 a **D-107..D-116** — D-103 a D-106 las ocupó el cierre
> de F7 en una sesión paralela.
>
> **Estado del repo al medir:** rama `main`, HEAD `a7850dc`
> (`feat(f7): offline sync… (#408)`), árbol limpio.
>
> **Cómo se produjo:** lectura completa de la lista de §0; estado real en
> GitHub (`gh issue list`, `gh project item-list 1`); investigación web
> dirigida (2025-2026) citada por sección; **12 preguntas al dueño en 3
> olas de 4**, todas contestadas — dos contra la recomendación presentada
> (D-111, D-112) y una contra el número recomendado (D-114) — y volcadas
> en D-107 a D-116; y una segunda pasada desconfiando del propio trabajo
> (§16).
>
> **Regla del documento:** todo número dice de dónde sale. `[leído:
> archivo:línea]`, `[medido: comando]`, `[verificado en vivo: URL]` o
> `[criterio propio]` — este último siempre negociable.

Salón del maestro y club de papás sobre la misma tabla `grupo_infantil`
(D-043: en esquema, `child_group`). Reglas de seguridad idénticas para
los dos — es la misma superficie con dos orígenes distintos, nunca dos
productos con protecciones distintas. Depende de F2 (cuentas,
implementado) y F7 (`child_streak`/`xp_totals` en migración `0007`,
`score_totals` en `0002` — el dueño del grupo las lee de solo lectura).

## 0. Qué se leyó antes de diseñar

Todo completo, en este orden — ningún resumen:

1. `CLAUDE.md` (202 líneas) — líneas rojas #2 y #3 sobre todo: es la
   única fase donde un adulto que no es el padre ve datos de un niño.
2. `docs/decisions.md` completo (3.436 líneas en la primera pasada;
   última antes de esta sesión: D-092; esta sesión añade D-107 a D-116).
3. `docs/master-plan.md` completo — §7 (modo maestro), §13.2 (fila F9:
   depende de F2, F7), §14.1 («no resuelve la verificación del
   maestro»).
4. `docs/research/README.md` completo (índice de 47; no existe mc-24).
5. `docs/research/2026-07-31-mc-28-teacher-classroom-mode.md` completo
   (14 implicaciones, 7 preguntas, «The safeguarding question»).
6. `docs/research/2026-07-31-mc-46-clubs-social-challenges.md` completo
   — **solo la parte de `grupo_infantil`** (§6, §7, implicaciones 12-18);
   las prendas y `club_adulto` son F10 y aquí no se tocan.
7. `docs/guia-de-estilo.md` completo (paleta, contraste del naranja
   3.03:1, tipografía por sistema, navegación D-064/D-065, iPad D-041).
8. `docs/infrastructure.md` completo (inventario y bitácora;
   `math-challenge-classroom-do` inventariado sin crear).
9. `docs/por-que-existe.md` completo.
10. `docs/dudas.md` completo (950 líneas — no hay preguntas previas de
    F9; las nuevas abiertas están en §24).
11. **Todos** los `docs/planes/*.md` (17 archivos), en especial
    `f7-juego.md` (los ganchos que F7 le deja a F9: tablero, racha),
    `f8-padres.md` §8 («el salón NO es este componente»),
    `f8-limite-pantalla.md`, `f2-cuentas-onboarding.md` (el gate
    `OwnerProof` y la promesa incumplida de `classroom_join`).
12. `audits/adversarial/cartas.mjs` completo (las 28 cartas) y
    `audits/run.mjs` completo (qué auditor está ACTIVE de verdad).
13. **Las 12 migraciones, leídas una por una** (`0001` a `0012`).
    `node audits/migration-safety.mjs` en verde: «12 migración(es)
    0001..0012, 23 tabla(s) vivas» `[medido: node audits/migration-safety.mjs]`.

Investigación web dirigida (citada por sección, marcada `[verificado en
vivo]` donde se descargó de verdad y `[sin verificar en vivo]` donde
no):

- COPPA 2025: regla final publicada el 2025-04-22 (90 Fed. Reg. 16904),
  en vigor 2025-06-23, cumplimiento pleno **2026-04-22** — ya exigible
  `[verificado en vivo: federalregister.gov/documents/2025/04/22/2025-05904/childrens-online-privacy-protection-rule]`.
  **La FTC NO adoptó la excepción de autorización escolar** que había
  propuesto para ed-tech — el camino legal para un menor sigue siendo el
  consentimiento parental verificable directo `[verificado en vivo:
  lw.com/admin/upload/SiteAttachments/FTC-Publishes-Updates-to-COPPA-Rule.pdf]`.
- Google Classroom: el código de clase se **resetea** y se
  **desactiva** `[verificado en vivo: customguide.com/course/google-classroom/add-or-remove-students]`.
- Fluent 2 `PresenceBadge` existe y está mantenido
  (`@fluentui/react-badge` 9.2.x)
  `[verificado en vivo: npmjs.com/package/@fluentui/react-badge]`.
- ClassDojo: consentimiento parental dentro de la cuenta del padre al
  configurarla `[verificado en vivo: help.classdojo.com/hc/en-us/articles/115004762046]`.
- Roblox, rediseño de reportes (julio 2026): ícono persistente,
  preguntas adaptadas al tipo, confirmación al reportante `[sin
  verificar en vivo: lo cita el primer borrador; no se re-descargó]`.

## 1. Qué queda funcionando

Un maestro (con o sin escuela verificada detrás) o un padre crea un
`grupo_infantil` con un código de unión. Conocer el código nunca mueve
a un niño a ningún roster: el padre que lo captura ve primero la
tarjeta de identidad del dueño del grupo (con su insignia de
verificación o de «sin verificar») y solo una decisión **explícita**
del padre crea la membresía — aprobar (decide también el ranking,
opt-in apagado por default) o rechazar. Si prefiere pensarlo, queda una
**solicitud pendiente** en su propia bitácora, que expira a los 30 días
(D-114).

El dueño del grupo ve **siempre** alias, racha y puntos de cada miembro
aprobado (D-107) — nunca nombre real, edad exacta ni otros grupos — y
solo ve tablas ordenadas por posición de los miembros con opt-in
(D-087). Los standings ordenados se difunden en vivo por un Durable
Object por grupo (D-112). El niño ve una mención neutra de su grupo en
su mapa, sin números (D-111). **Cero chat, cero mensaje directo, en
cualquier dirección.** Un botón de reporte permanente para el padre,
sin captura de pantalla (D-109). Bitácora completa de quién pidió,
quién aprobó, cuándo — visible para el padre, y nunca borrada.

## 2. Los dos orígenes, una sola tabla, reglas idénticas

| | Salón del maestro | Club de papás |
|---|---|---|
| Quién lo abre | Un maestro, con o sin escuela verificada (D-086) | Un padre |
| Verificación del dueño | Escuela verificada → maestro autorizado por ella; sin escuela → identidad declarada, insignia «sin verificar» (D-086, D-044) | Identidad declarada, insignia «sin verificar» — nunca pasa por el modelo de escuela (D-088) |
| Tope de tamaño | 30-35 niños (D-087) | **20 niños (D-114)** |
| Tope de creación | 3 por cuenta, 1 por día (D-114; D-011 fijó los 3) | 3 por cuenta, 1 por día (D-114) |
| Quién aprueba la entrada de un niño | Su propio padre, viendo antes la tarjeta de identidad del dueño | Igual |
| Qué ve el dueño | Alias, racha, puntos — siempre (D-107), nada más (D-027) | Igual |
| Mezcla de familias sin vínculo previo | No aplica (el salón agrupa por institución) | Permitida — el código basta; el aislamiento de contacto es la mitigación, no el vínculo previo (D-088) |
| Ranking visible | Opt-in por membresía, apagado por default, toda banda (D-087, D-115) | Igual |
| Chat / mensaje directo | Nunca, en ninguna dirección | Igual |

**Por qué una sola tabla y no dos.** D-027 ya lo fijó: modelarlo con un
campo `tipo` es un modo de falla, no una decisión de esquema — el día
que alguien agregue algo pensado para uno de los dos casos, aterriza
por defecto sobre el otro. `child_group` es una tabla, con una columna
`origen_tipo` (`salon` | `club_papas`) que solo cambia **de dónde
viene** la fila, nunca qué protecciones aplican — las protecciones son
del código que lee la tabla, no de un `if` sobre esa columna. Y la
frontera que sí es estructural es la otra: `adult_club` (F10) será una
estructura **separada**, para que ninguna función social de adultos
alcance a los niños por omisión (`mc-46` §7).

## 3. Modelo de datos — migración `0018_grupos_infantiles.sql`

> **Corrección (2026-08-03) — cuatro cosas que el primer borrador
> afirmó y el repo contradice:**
>
> 1. **«`classroom_join` ya está en el catálogo».** Falso: la `0003`
>    real insertó solo `CHILD_PROFILE`, `LEADERBOARD`, `SCREEN_TIME`,
>    `DATA_RETENTION` `[leído:
>    migrations/0003_accounts_onboarding.sql:66-70]`, y la `0012`
>    añadió `LEAGUE`/`DUEL`. La promesa venía del *plan* de F2, no del
>    esquema. D-110 lo resuelve: **la membresía ES el consentimiento**;
>    este esquema no toca `consent_type_catalog`.
> 2. **`screenshot_r2_key`.** Retirado por D-109: la captura sería de
>    la pantalla del padre, con datos de menores ajenos.
> 3. **`status` sin expiración.** D-114 añade `expired` y `expires_at`.
> 4. **La corrección del primer borrador sobre `0005` se mantiene:**
>    `school`/`school_teacher` no compiten con `group_owner_identity`;
>    la alimentan. Verificar una escuela agrega `school_verified` al
>    `CHECK` de `assurance` y actualiza el campo de cada maestro activo
>    bajo ella en la misma transacción (corrección de D-086, 2026-08-03).

**Numeración: `0018`.** Reparto confirmado por el dueño el 2026-08-03
(dudas §24.5): otras sesiones tomaron `0013`-`0015` mientras tanto
(sendero, push, cosméticos — verificado en `d1_migrations` remoto), así
que el reparto vigente es: `0016` = F8 panel (#278), `0017` = F8
reportes (#287), `0018` = F9 (ésta), `0019` = F10, `0020` = F11 push,
`0021` = F12 (`household_link`). `migration-safety` confirma la serie
0001..0012 sin huecos `[medido]`. Solo AGREGA: cuatro tablas nuevas,
dos índices, un `ALTER` del `CHECK` de `group_owner_identity.assurance`
(que es ampliación de dominio, no borrado — **verificar antes del PR
degradando el archivo real**, D-070).

```sql
-- school — la entidad que D-086 introduce. Verificada una vez, autoriza
-- maestros bajo su nombre. NO es una segunda fuente de confianza: su único
-- efecto en group_owner_identity es escribir assurance='school_verified'.
CREATE TABLE school (
  id                    TEXT PRIMARY KEY,
  name                  TEXT NOT NULL,           -- declarado; revisado a ojo (D-090)
  country               TEXT NOT NULL,           -- ISO 3166-1 alfa-2
  locale                TEXT NOT NULL,
  verification_status   TEXT NOT NULL DEFAULT 'pending'
                        CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verification_method   TEXT CHECK (verification_method IN ('domain_shortcut', 'document_review')),
  verified_by           TEXT,                    -- 'owner' mientras D-116 (cola manual)
  verified_at           INTEGER,
  created_at            INTEGER NOT NULL         -- D-089: medir el tiempo real de respuesta
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
  join_code      TEXT NOT NULL UNIQUE,            -- 6 caracteres, alfabeto sin ambiguos (D-113)
  max_size       INTEGER NOT NULL CHECK (max_size BETWEEN 1 AND 35), -- 30-35 salón; 20 club (D-114)
  created_at     INTEGER NOT NULL,                -- tasa de creación: 1/día por cuenta (D-114)
  disabled_at    INTEGER                          -- el dueño apaga el código sin borrar el grupo
);

-- child_group_membership — una fila por solicitud, NUNCA borrada: es la
-- bitácora Y el consentimiento (D-110): quién aprobó, cuándo, qué se comparte.
CREATE TABLE child_group_membership (
  id                 TEXT PRIMARY KEY,
  child_group_id     TEXT NOT NULL REFERENCES child_group(id) ON DELETE CASCADE,
  child_profile_id   TEXT NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  status             TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'removed', 'expired')),
  requested_at       INTEGER NOT NULL,
  expires_at         INTEGER NOT NULL,            -- requested_at + 30 días (D-114)
  decided_at         INTEGER,
  decided_by         TEXT REFERENCES users(id),   -- el padre que decidió; NULL si expiró
  leaderboard_opt_in INTEGER NOT NULL DEFAULT 0 CHECK (leaderboard_opt_in IN (0, 1))  -- D-087/D-115
);

-- Un niño, una sola solicitud viva por grupo. Las expiradas/rechazadas no
-- bloquean una nueva solicitud con el mismo código.
CREATE UNIQUE INDEX idx_membership_viva
  ON child_group_membership (child_group_id, child_profile_id)
  WHERE status IN ('pending', 'approved');

-- child_group_report — el botón de reporte permanente. Sin screenshot (D-109).
CREATE TABLE child_group_report (
  id               TEXT PRIMARY KEY,
  child_group_id   TEXT NOT NULL REFERENCES child_group(id) ON DELETE CASCADE,
  reported_by      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason_code      TEXT NOT NULL
                   CHECK (reason_code IN (
                     'identidad_sospechosa',   -- la tarjeta no cuadra con quien dijo ser
                     'contacto_fuera_de_app',  -- pidió hablar con el niño por otro canal
                     'contenido_inapropiado',  -- algo visible en el grupo no debería estar
                     'otro'                    -- sin texto libre: la llamada de seguimiento es por correo (D-116)
                   )),
  created_at       INTEGER NOT NULL,              -- D-089: medir tiempo real de respuesta
  reviewed_at      INTEGER,
  reviewed_by      TEXT
);
```

**Verificaciones contra los auditores deterministas, hechas antes de
proponerlo:**

- `no-attempts-in-d1.mjs`: ninguna tabla matchea
  `attempts?|responses?|events?|telemetry|interaction_log` — todas son
  estado/membresía/bitácora. Pasa por construcción.
- `child-free-text.mjs`: **FALLA HOY, y no solo por F9** — su
  `CHILD_TABLES` es una lista dura de 3 tablas `[leído:
  audits/child-free-text.mjs:25]` y no cubre `score_totals`,
  `child_streak`, `xp_totals`, `mission_daily_summary`,
  `league_membership`, `companion_state` ni `screen_time_daily_usage`
  (deuda declarada por F7/F8 y nunca cerrada; el comentario de la
  migración `0011` que afirma «cubre esta tabla sin ningún cambio
  porque escanea por forma de columna» es **falso** `[leído:
  audits/child-free-text.mjs:25]`). La extensión es parte del alcance de
  F9 (§13) y cubre **todas**, no solo las de F9. Con la extensión, este
  esquema pasa: ningún `TEXT` sin `CHECK` escribible por un niño.
- `migration-safety.mjs`: sin anulaciones — todo es `CREATE`/`ALTER ADD`.
  El `ALTER` del `CHECK` de `assurance` se escribe como tabla nueva +
  renombre si el auditor lo exige; decidirlo contra el auditor real, no
  de memoria.
- **Borrado en cascada (§16.4):** las cinco tablas nuevas cuelgan con
  `ON DELETE CASCADE` de `users` o de `child_profiles` — borrar la
  cuenta del dueño borra sus grupos, membresías y reportes; borrar el
  perfil del niño borra sus membresías. `child_group_report` gana
  CASCADE respecto al primer borrador (fila huérfana de reporte es peor
  que reporte borrado con su grupo: el runbook de erasure toca cuatro
  sistemas, y la copia de cumplimiento del reporte ya viajó por correo,
  D-116). `borrado-cuatro-sistemas.mjs` escanea FKs, así que cubre las
  tablas nuevas sin cambio.

## 4. Verificación del dueño del grupo (T-5) — la tarjeta de identidad

**El marco legal, actualizado 2026-08-03:** mc-28 concluyó que sin
escuela real detrás no hay atajo institucional y hay que tratar el
consentimiento como **parental verificable directo**. La regla COPPA
2025 lo confirma desde otro ángulo: la FTC propuso codificar una
excepción de autorización escolar para ed-tech y **no la adoptó** en la
regla final `[verificado en vivo: lw.com PDF]`. Es decir: incluso con
escuela verificada (D-086), la aprobación del padre de F9 no es una
cortesía — es el mecanismo de consentimiento, y la escuela verificada es
una señal de confianza adicional, no un sustituto legal.

**Gramática visual de la insignia:** patrón positivo — la insignia de
verificado es un elemento que se **agrega** cuando existe («✓ Escuela
verificada»), nunca un sello rojo de alarma cuando falta («sin
verificar» se muestra como estado neutro). Un solo badge, un solo
significado: verificación y «necesita atención» son dos elementos
distintos.

**La tarjeta que ve el padre antes de aprobar:**

```
┌──────────────────────────────────────────┐
│ [foto del dueño]    Nombre del dueño      │  ← D-136: foto real subida por el adulto
│                        ✓ Escuela verificada │  ← solo si school verificada (D-086)
│                        o                    │
│                        Sin verificar        │  ← neutro, sin rojo, sin ⚠ de alarma
│                                           │
│ Tipo: Salón de [Nombre de escuela]        │
│      o: Club de papás                     │
│                                           │
│ Qué verá sobre tu hijo: su alias, su      │
│ racha y sus puntos. Nada más.             │  ← D-107, dicho en la tarjeta
│                                           │
│ ☐ Puede aparecer en la tabla de           │
│   posiciones del grupo  (apagado)         │  ← D-115: el toggle vive aquí
│                                           │
│ [Aprobar]               [Rechazar]        │
└──────────────────────────────────────────┘
```

- **Con foto (D-136, 2026-08-03 noche).** Este apartado decía «sin foto
  en v1» porque la migración `0005` no tiene `photo_r2_key`. El dueño
  decidió lo contrario: D-011 se mantiene y la `0018` añade la columna
  `photo_r2_key` a `group_owner_identity`, con su superficie de subida
  (adulto, acción explícita, AVIF/WebP en `math-challenge-media`, parte
  del runbook de borrado). La foto es presentación, **no verificación**:
  la insignia sigue siendo la señal (`assurance`) y nunca se mezcla con
  ella.
- **Sin correo parcial.** El primer borrador mostraba `•••••@dominio`.
  Se quita: el correo del dueño no añade confianza verificable al padre
  y sí es un dato personal del dueño expuesto a cada familia que
  recibe el código.
- **El texto «qué verá sobre tu hijo» se autora por locale** y nombra
  exactamente los tres datos de D-107 — el consentimiento informado es
  esta línea, no un enlace a una política.

**Componentes por plataforma (D-031):**

| Plataforma | Control de insignia | Control de la tarjeta |
|---|---|---|
| Android | M3 `Badge`/`AssistChip` sobre el avatar-inicial (m3.material.io/components/badges) | `Card` elevada, radios de cápsula M3, Roboto en controles (D-036) |
| iOS/iPadOS/macOS | Fila HIG *Lists* con accessory view; SF Pro | `UIColor` de sistema agrupado, radios 10-12pt, sin sombra en botones |
| Windows | Fluent 2 `PresenceBadge` reutilizado como verificado/sin-verificar `[verificado en vivo: @fluentui/react-badge 9.2.x]` | radios 4px, Segoe UI Variable, línea de acento en el elemento activo |

## 5. Flujos, paso a paso

Toda ruta vive bajo `/[locale]/app/grupos/`, `prerender = false`,
noindex — el patrón de F2 para rutas autenticadas. Los endpoints
siguientes son la lista completa; ninguno acepta texto libre.

### 5.1 Crear un grupo (dueño)

1. Desde `/app/home`, acción «Crear un salón o club» (D-082: acción
   posterior, nunca puerta). `GET /[locale]/app/grupos/nuevo`.
2. El servidor llama `assertCanOwnChildGroup(fila)` `[leído:
   apps/web/src/lib/owner-proof.ts:76]` sobre la fila de
   `group_owner_identity`. Sin fila → se redirige a completar la
   identidad (nombre + contexto declarado), que escribe
   `group_owner_identity` por primera vez — **esta ruta es hoy el
   primer escritor y el primer llamador del gate en todo el repo**
   (§16.3).
3. El adulto elige origen (`salon`/`club_papas`) y, si es salón y tiene
   escuela verificada (`school_teacher` sin `revoked_at` sobre una
   `school` con `verification_status='verified'`), la escuela — esto
   fija `school_id`. Un salón sin escuela existe igual, con insignia
   «sin verificar» (D-086).
4. El servidor verifica los topes de D-114 (≤3 del tipo por cuenta,
   ningún otro grupo creado hoy por esta cuenta — consulta sobre
   `child_group.created_at`), genera el `join_code` (6 caracteres del
   alfabeto sin ambiguos, `crypto.getRandomValues`, reintento ante
   colisión de UNIQUE) e inserta.
5. Pantalla de éxito: el código en grande (numerales Raleway Bold, que
   pasan 3:1) con botón de copiar, y el texto autorado que explica:
   «comparte este código solo con los padres de tus alumnos; cada padre
   verá tu nombre y tu insignia antes de aprobar».
6. **La marca `no-chat` se dispara aquí** (D-137, 2026-08-03 noche):
   el mecanismo de marcas de F2 se construye de verdad — lector y
   `CHECK` ampliado con `NO_CHAT` en la `0018` — y su primer disparo
   nuevo es este: la primera vez que un adulto termina de crear un
   grupo. *Nota de corrección: este paso decía que F9 no usaría el
   mecanismo y lo diría solo en pantalla; D-137 lo revierte.*

### 5.2 Unirse con código (padre)

1. El padre recibe el código (por el canal que sea — el producto no
   participa) y entra a `/[locale]/app/grupos/unirse`.
2. Captura el código: `input type="text"` con `inputmode="text"`,
   `autocomplete="off"`, `maxlength="6"`, mayúsculas forzadas. **Es una
   superficie de adulto** — la línea roja #3 prohíbe texto libre de un
   niño, no un campo de código en la cuenta del padre; `api/marca.ts` ya
   tiene el mismo patrón.
3. `POST /api/grupos/unirse` → el servidor busca el grupo por
   `join_code` **no desactivado** (`disabled_at IS NULL`) y devuelve la
   tarjeta de identidad del dueño (§4). Código desconocido o apagado →
   el mismo mensaje neutro («este código no está activo»), sin
   distinguir cuál de los dos casos — no se filtra si un código existe.
4. El padre elige **qué hijo** (lista de sus perfiles con avatar +
   alias; un perfil con membresía viva en ese grupo —`pending` u
   `approved`— no se ofrece: `idx_membership_viva`), decide el toggle
   de ranking (D-115) y tiene **tres salidas**:
   - **[Aprobar]** → la membresía nace `approved`, con `decided_at` y
     `decided_by` = el padre de la sesión. Es la aprobación de D-011:
     informada (vio la tarjeta), registrada y revocable.
   - **[Rechazar]** → la membresía nace `rejected`. También es una
     decisión y también va a la bitácora — un rechazo no registrado es
     indistinguible de un código que nunca se usó.
   - **[Decidir después]** → la membresía nace `pending` con
     `expires_at = ahora + 30 días` (D-114). La ve el padre en su
     bitácora (#386) y la decide desde ahí.
5. **Ver la tarjeta no escribe nada.** Cerrar la pantalla sin decidir
   no crea fila — si se registrara la intención, un vistazo bloquearía
   30 días la re-solicitud (`idx_membership_viva`) y llenaría la
   bitácora de filas que no son ninguna decisión. El `pending` solo
   nace del botón explícito.
6. **El dueño del grupo nunca ve los `pending`** — no hay lista de
   espera visible para él: ver quién «casi entra» es un canal de
   presión sobre la familia. Su roster muestra únicamente `approved`.

> **Corrección (2026-08-03, tercera lectura).** La versión anterior de
> esta sección creaba el `pending` en el paso 4 y luego se contradecía
> explicando que «el paso 4 YA es la aprobación», con un párrafo de
> «los dos sentidos del flujo» que no cerraba. El modelo de arriba es
> el que queda: una sola dirección (el padre siempre inicia), tres
> salidas explícitas, y `pending` solo como decisión aplazada.

### 5.3 Aprobar / rechazar / revocar (padre)

- Aprobar tiene dos caminos: la aprobación directa al unirse (§5.2
  paso 4, la membresía nace `approved`) y la aprobación de un
  `pending` desde la bitácora: `POST /api/grupos/membresia/[id]/aprobar`
  — solo si `status='pending'`, `expires_at > ahora`, y el
  `child_profile_id` pertenece a la cuenta del padre de la sesión (la
  triple comprobación va en el servidor, y es lo que
  `audits/grupo-aprobacion-padre.mjs` exige, §13). Escribe `decided_at`,
  `decided_by`, y el `leaderboard_opt_in` del toggle.
- Rechazar: misma ruta con `rejected`. No se le notifica nada al dueño
  del grupo más allá de que el niño nunca aparece — un rechazo con
  aviso es un mensaje sobre una familia específica.
- **Revocar (salir del grupo):** un toque desde la bitácora (#386),
  efectivo de inmediato, sin aprobación del dueño (mc-28 implicación
  5: la salida no se negocia). `status='removed'`. La visibilidad del
  dueño se corta en la siguiente lectura (el roster consulta
  `status='approved'` con JOIN, no un flag cacheado) y el DO borra al
  miembro en su próxima difusión (§8). La fila queda — la bitácora es
  la memoria.
- **Salir del ranking sin salir del grupo:** toggle independiente sobre
  la misma fila (`leaderboard_opt_in = 0`), desde la bitácora. Mismo
  principio que mc-28 implicación 9 y que F7 aplicó al tablero global.

### 5.4 Expiración (30 días, D-114)

Sin cron nuevo: la expiración se **evalúa al leer** — toda consulta de
membresías trata `pending` con `expires_at <= ahora` como `expired`, y
un barrido dentro del cron horario de reportes de F8
(`math-challenge-reports`, ya inventariado) materializa el cambio de
estado una vez al día para que la bitácora muestre el estado real sin
cálculo implícito. El padre ve la solicitud expirada en su bitácora,
puede volver a usar el código si sigue activo (nueva fila —
`idx_membership_viva` no lo bloquea porque la anterior ya no es viva).

### 5.5 Reset y disable del código (dueño, D-113)

Desde la pantalla del grupo: «Generar código nuevo» (el viejo muere en
el acto; las membresías `approved` no se tocan) y «Desactivar código»
(`disabled_at`; reactivar borra el campo). Ambas acciones piden
confirmación con el texto de consecuencia («los padres que tengan el
código viejo no podrán usarlo»), y quedan en la bitácora interna del
grupo (campos del propio `child_group`; no hace falta tabla de eventos
para dos acciones).

### 5.6 Reporte (padre, D-109)

Botón permanente en la pantalla del grupo (para el padre, desde la
bitácora de membresía de su hijo) y en la tarjeta de identidad antes de
aprobar. Un toque → cuatro opciones cerradas (`reason_code`) →
confirmación de recibido con el texto de D-089: «lo revisa una persona;
te avisamos por correo». **Sin captura, sin texto libre, sin foto.** El
revisor (el dueño del producto, D-116) reconstruye el contexto desde
D1 con las consultas del runbook de §17.

## 6. Dashboard del dueño — roster, dispositivo por dispositivo

**Qué contiene una fila del roster** (la lista cerrada de D-027/D-107):
avatar (piezas predefinidas, nunca foto), alias, racha actual
(`child_streak.current_streak`, solo lectura), puntos
(`score_totals.total_score`, período `all_time`, solo lectura), y el
chip «activo esta semana» (derivado de `league_membership.active_days`
si existe, o de `screen_time_daily_usage` del hogar — **decidir la
fuente en la issue #383**, dudas §24.3; lo que no puede ser es un
`last_seen`, que D-081 prohibió como categoría). Si el ranking está
activo para ese niño (`leaderboard_opt_in=1`), su fila puede aparecer
en la vista ordenada (§7); si no, solo en el roster alfabético.

**El «necesita atención»:** se muestra como **ausencia de señal
positiva** — la fila sin el chip «activo esta semana» — nunca un ícono
de alerta roja sobre el niño. No hay contador de fallos, no hay rojo,
no hay ordenación por «quién va peor»: el roster se ordena
**alfabéticamente por alias** (misma regla anti-comparación que F8
aplicó al reporte de hermanos).

### Teléfono (Android gama baja, primario — mc-47)

- Lista vertical de una columna, virtualizada a partir de 35 filas (el
  tope de salón). Cada fila: avatar 48px, alias en Raleway Medium,
  racha y puntos formateados **con el locale de quien mira**
  (`packages/motor/src/numeros.ts::formatear` `[leído:
  packages/motor/src/numeros.ts:38]` — regla escrita en
  `tablero.ts:39-41`).
- Blancos de 48px mínimo (bandas de adulto; WCAG 24px es el piso
  absoluto). Selector de grupo arriba si tiene más de uno (tope 3+3).
- El botón de reporte NO va en esta pantalla — es del padre, no del
  dueño. Lo del dueño es «Generar código nuevo» / «Desactivar», dentro
  de la pantalla del grupo, nunca en un menú de tres puntos como única
  vía.
- Presupuesto: la página del roster es HTML del servidor con isla mínima
  (la tabla ordenada en vivo, §8); `bundle-budget` aplica sin cambio.

### iPad (D-041, primera clase)

- **Horizontal / Split View a dos tercios (694-795px):** *list-detail* —
  roster a la izquierda, detalle del niño seleccionado a la derecha
  (mismos tres datos; no hay más que mostrar, D-027 ya lo limita — el
  detalle existe para el foco de teclado y para no saltar de página).
- **Split View a un tercio (320-375px) y vertical:** una columna, igual
  que teléfono. **Ninguna regla puede exigir más del tercio** — la
  tabla de anchos de `guia-de-estilo.md` § iPad es la que
  `audits/ipad-usabilidad.mjs` hace cumplir.
- Teclado físico: navegación completa por tabulador con foco visible;
  el hover nunca esconde el botón de acciones del grupo.

### Escritorio

- Dentro de `layouts/Privada.astro` (D-065), en el área `/app/grupos/`
  (D-108). Tokens SERIO (oscuro por defecto) — superficie de adulto por
  construcción.
- La tabla puede usar dos columnas de datos (racha | puntos) donde el
  teléfono apila; nunca más columnas de las tres de la lista cerrada.

### El dueño también es padre

Nada especial: las pestañas de `Privada.astro` se derivan de la cuenta
real (`pestanas-privadas.ts` `[leído:
apps/web/src/lib/pestanas-privadas.ts:73-77]`) y `/app/grupos/` es un
área más a la que entra desde `/app/home`. Un maestro que no tiene
hijos ni `is_learner` aterriza directo en `/app/grupos/`.

## 7. Ranking opt-in — mecánica (D-087, D-107, D-115)

- `child_group_membership.leaderboard_opt_in`, default `0`. Lo activa
  el padre en la pantalla de aprobación (D-115) y lo cambia después en
  la bitácora — nunca el dueño del grupo por el niño.
- **Qué se ordena:** la vista ordenada del grupo usa
  `packages/motor/src/tablero.ts::armarTablero(banda, filas, quienId)`
  `[leído: packages/motor/src/tablero.ts:145-197]` con las filas ya
  filtradas por `child_group_id` + `status='approved'` + `opt_in=1`.

  > **Corrección (2026-08-03).** El primer borrador citaba
  > `calcularPosiciones(filas, opciones)`. Esa función **no existe**:
  > era el nombre del diseño en el plan de F7; en el código aterrizó
  > como `armarTablero` + `ordenarPorPuntos` (global) y `ordenar` +
  > `posicionVisible` (liga) `[leído: packages/motor/src/tablero.ts:98,
  > :145; packages/motor/src/liga.ts:314, :419]`. F9 reusa los reales.

- **La escalera de visibilidad por banda aplica igual** (`formaDeTablero`:
  KINDER tercios, PRIMARIA top 20 + propio total, SECUNDARIA+ exacta)
  — con una advertencia: **en v1 el ranking del grupo solo lo ven
  adultos** (dueño y padres), así que el matiz KINDER/PRIMARIA protege
  la lectura que el padre hace en voz alta, no la pantalla del niño.
- Un niño con `opt_in=0` no aparece en la vista ordenada **y el DO no
  recibe sus datos** (D-112) — no es que no se difundan: no están.
- La vista ordenada **no se mezcla con el roster alfabético**: son dos
  pestañas de la pantalla del grupo, nunca la misma lista con un
  orden — que el orden alfabético sea el default es la regla
  anti-comparación.
- Precedente externo: Strava *Group Goal* prueba que «con tabla» y «sin
  tabla» son dos modos legítimos, no uno degradado del otro `[leído:
  mc-46 §2]`; Kahoot muestra el propio rango en privado por default
  `[sin verificar en vivo: conocimiento de producto]`.

## 8. Standings en vivo — `math-challenge-classroom-do` (D-112)

- **Clase `Grupo`** (inglés en el código), un objeto por grupo:
  `idFromName(child_group_id)`. Los tres sitios de siempre para añadir
  una clase de DO: `worker.ts` (export con nombre), `astro.config.mjs`
  (`namedExports`), `wrangler.jsonc` (binding `CLASSROOM_DO` +
  `migrations` con etiqueta nueva — una migración de DO desplegada es
  inmutable) `[leído: docs/infrastructure.md, bitácora 2026-08-01 y
  2026-08-03]`.
- **Qué guarda:** estado derivado para difundir — alias, avatar,
  puntos, racha de los miembros con opt-in. Nunca el intento crudo (va
  a `math-challenge-attempts-ae`), nunca un miembro sin opt-in (D-112),
  nunca una señal de presencia: sin contador de sockets, sin
  `last_seen`, y la difusión manda la tabla entera, jamás «fulano
  acaba de jugar» (condición 2 de D-081, heredada).
- **Quién escribe:** el mismo punto del flujo de cierre de reto que hoy
  llama `sumarEnLiga` `[leído: apps/web/src/lib/liga-do.ts:299]` llamará
  `sumarEnGrupo` por cada grupo aprobado del niño con opt-in — **falla
  abierto** como la liga (un standing atrasado se arregla solo; un
  reto que no cierra, no). La racha se lee de D1 al difundir, no se
  mantiene en el DO.
- **Quién lee:** el dueño del grupo y el padre (WebSocket desde la
  pantalla del grupo/vista ordenada). **El niño nunca es cliente de
  este DO** (D-111): ningún WebSocket llega a una superficie de niño.
- **Borrar el grupo es `deleteAll()`** — la razón de que sea un objeto
  por grupo y no global (mc-32 riesgo #2).
- **Sin rankings en vivo para KINDER en v1:** la vista ordenada es de
  adultos; si todos los miembros con opt-in de un grupo son KINDER, el
  DO difunde igual (tercios, nunca posición exacta, por
  `formaDeTablero`).

## 9. La mención neutra en el mapa del niño (D-111)

- **Qué es:** una línea de identidad en el mapa del niño — «Estás en
  el salón de [nombre de la escuela o 'un club de familias']» — sin
  números, sin posiciones, sin compañeros nombrados. Se autora por
  locale (§11).
- **KINDER:** sello visual (ícono de Larry con un grupo pequeño) con
  `aria-label` autorado; la pantalla funciona idéntica si el niño no
  puede leerla (D-019, mc-20). Nunca dentro del sendero como si fuera
  un lugar/habilidad — va fuera de la secuencia de nodos.
- **PRIMARIA/SECUNDARIA:** línea de texto fuera del árbol de
  habilidades (no es un nodo de dominio).
- **De dónde se lee:** de `child_group_membership`
  (`status='approved'`), una consulta más en la página del mapa.
  **Verificar contra `audits/mapa-lectura-sin-tabla.mjs`** antes del
  PR: ese auditor exige que el mapa lea de F4/F3 sin tabla propia; la
  membresía no es tabla del mapa (no guarda progreso) pero el auditor
  puede necesitar su lista blanca ampliada — visto fallar primero
  (D-070), no asumido.
- **Lo que nunca muestra:** puntos del grupo, posición, otros miembros,
  la identidad del dueño más allá del nombre de la escuela/club, y
  nada dentro de un reto activo (la regla de `mision-silenciosa`).

## 10. Sin chat, en ningún punto — verificado por construcción

Ninguna tabla de §3 tiene una columna de texto libre entre adulto y
niño (el único `TEXT` sin `CHECK` de dominio es `school.name`, escrito
por un adulto sobre una institución, y `reason_code` va en `CHECK`
cerrado). Ningún endpoint de §5 acepta texto libre. Ningún componente
de las pantallas de grupo incluye campo de entrada — el único `input`
de todo el subsistema es el del código de unión, en superficie de
adulto. `audits/grupo-sin-chat.mjs` (§13) lo hace cumplir.

## 11. i18n — 7 locales autorados, activación acotada (D-087)

Todo el copy de este subsistema (tarjeta de identidad, flujo de unión,
roster, toggle de ranking, botón de reporte, expiración, bitácora, la
mención neutra del mapa) se **autora por locale, no se traduce**
(D-022), en los archivos planos `apps/web/src/i18n/<locale>.json` con
el patrón de claves ya usado (`grupo*`). Los números viajan por
`formatear()` con el locale de quien mira — el dueño de un salón de
`es-ES` que mira el roster ve coma decimal; su colega de `es-MX`, punto
(mc-34).

**Se autora para los 7, se activa para 4** (`en`, `es-MX`, `es-ES`,
`pt-BR`, D-087): `fr-FR`, `pt-PT`, `de-DE` esperan la revisión legal de
GDPR Art. 8/Children's Code (D-126 la define: checklist interno
documentado). Mecanismo: `CONFIG_KV.f9_enabled_<locale>` — una bandera
por locale, mismo patrón que `max_child_profiles_free` de F2, leída en
el servidor en cada ruta de `/app/grupos/` (locale apagado → 404
honesto, no una pantalla de «próximamente» que acumule solicitudes).
Las siete autorías se escriben de todas formas: el copy apagado no
cuesta nada y evita el «locale olvidado» al encender.

Los textos de la **cola de revisión** (correos al dueño de escuela y al
padre reportante) también se autoran por locale — son el único texto
que el producto envía fuera de la app en esta fase.

## 12. Infraestructura Cloudflare

| Objeto | Estado | Renglón |
|---|---|---|
| `math-challenge-classroom-do` (clase `Grupo`) | **Se crea en esta fase** (D-112) — el inventario ya lo lista; la bitácora gana su fila en el PR | `docs/infrastructure.md` |
| `math-challenge-db` · migración `0018_grupos_infantiles.sql` | Nueva, add-only | bitácora, mismo PR |
| `math-challenge-config-kv` | Sin objeto nuevo: 7 llaves `f9_enabled_<locale>` | se anota en el renglón existente |
| `math-challenge-reports` (cron de F8) | Reuso: el barrido diario de `expired` vive ahí (§5.4) | sin renglón nuevo |

Nada más. Sin KV nuevo, sin cola, sin Worker, sin bucket: la retirada
del screenshot (D-109) elimina el único candidato a R2 de esta fase.

## 13. Auditores

**Deterministas nuevos (4):**

1. `audits/grupo-sin-chat.mjs` — falla si cualquier migración declara
   una columna `TEXT` sin `CHECK` en las tablas de grupo (salvo la
   lista blanca escrita a mano: `id`, `join_code`, `school.name`,
   `origen_tipo`…), o si aparece un componente/ruta de mensajería bajo
   `app/grupos/`. Cita: LR-3, D-027. Control negativo: degradar la
   `0018` real quitando un `CHECK`.
2. `audits/grupo-aprobacion-padre.mjs` — falla si la ruta de aprobación
   no exige las tres condiciones (membresía `pending` vigente, perfil
   perteneciente a la cuenta de la sesión, `decided_by` = usuario de la
   sesión). Cita: D-011, D-110. Es el análogo de F9 al gate
   `OwnerProof` de F2: la ruta que aprueba **no compila** sin el tipo
   de marca, y este auditor mira que el tipo se use.
3. `audits/school-verification-required.mjs` — falla si alguna ruta
   crea un `child_group` con `school_id` apuntando a una `school` no
   `verified`, o si algo escribe `assurance='school_verified'` fuera de
   la transacción de verificación de escuela. Cita: D-086.
4. `audits/grupo-visibilidad-minima.mjs` — falla si la consulta del
   roster selecciona algo fuera de la lista cerrada (alias, racha,
   puntos, avatar) o si la vista ordenada incluye miembros con
   `opt_in=0` — incluido el payload que entra al DO (D-112). Cita:
   D-027, D-107. **Con la tabla de precondiciones escrita a mano, no
   importada del módulo** — la trampa D-070 de
   `mision-slot-nunca-vacio`, que aprobó su propia violación.

**Deterministas existentes, extendidos:**

- `child-free-text.mjs` — `CHILD_TABLES` gana `score_totals`,
  `child_streak`, `xp_totals`, `mission_daily_summary`,
  `league_membership`, `companion_state`, `screen_time_daily_usage` (la
  deuda de F7/F8) **más** `child_group`, `child_group_membership`,
  `child_group_report`, `school_teacher`. Visto fallar antes del
  arreglo degradando la `0012` real (que tiene `item_set` TEXT sin
  CHECK en `league_duel`, una tabla de niño por membresía — si el
  auditor extendido no la atrapa, la extensión está mal).
- `mapa-lectura-sin-tabla.mjs` — verificar contra §9; ampliar su lista
  blanca con `child_group_membership` si bloquea (la membresía no es
  progreso del mapa).
- `alias-nunca-nombre.mjs` — su alcance gana las rutas de grupo y el
  payload del `Grupo` DO: en una superficie social, siempre alias.
- `telemetria-infantil.mjs` — sin cambio: todas las pantallas de F9 son
  de adulto salvo la mención neutra, que no lleva métrica.
- Los de siempre, verificados sin cambios contra §3:
  `no-attempts-in-d1`, `migration-safety`, `locales-complete`,
  `notacion-locale`, `cf-prefix`, `do-por-entidad` (el `Grupo` DO es
  por entidad), `navegacion-unica` (D-108 no añade navegación),
  `area-privada` (`/app/grupos/` usa `Privada.astro`).

**Cartas adversariales a ampliar (contra `cartas.mjs` leído, no de
memoria):**

- `privacidad` — alcance ya cubre `/^apps\//` y `/^migrations/`; su
  `cita` gana **D-086, D-087, D-088, D-110** (hoy no puede invocar el
  modelo de escuela ni la membresía-consentimiento) `[leído:
  audits/adversarial/cartas.mjs:91]`.
- `anti-humillacion` — alcance gana `/grupo|salon|classroom/i` (hoy
  filtra `club|prenda|tablero|leaderboard`, que no atrapa `grupos/`);
  `cita` gana **D-107, D-111** y `mc-28` `[leído:
  audits/adversarial/cartas.mjs:133,142-150]`.
- `patrones-oscuros` — sin cambio de alcance (`/apps/` ya cubre); nada
  en F9 se compra, se sortea ni se cuenta regresivamente — la
  expiración de 30 días **no se pinta como cuenta regresiva**
  (`racha-lexico` ya bloquea ese patrón en superficie de liga y aquí
  aplica el mismo criterio).
- `nativo-*` (cinco) — aplican sin cambio al roster/tarjeta (§4, §6).
- `kinder` — la mención neutra del mapa KINDER (§9) cae en su alcance;
  nada de texto obligatorio que leer.
- `locale-*` (siete) — el copy nuevo `grupo*` cae en `TEXTOS`; cada
  carta de locale juzga el suyo.

**Arnés:** los cuatro auditores nuevos y la extensión de
`child-free-text` llevan su caso en `audits/pruebas-auditores.mjs` con
control negativo por **degradación del archivo real** (D-070) — la
`0018` real, la ruta real de aprobación, la consulta real del roster.

## 14. Qué NO incluye este documento

- **`club_adulto` y las prendas** — F10 (`docs/planes/f10-clubs-adultos.md`).
  `mc-46` se citó solo en la parte que aplica a `grupo_infantil`.
- **La verificación de antecedentes real de un maestro** — ningún
  mecanismo la sustituye; D-086 mitiga con el modelo de escuela. T-5
  queda **acotada, no cerrada**.
- **El estándar de documento aceptado país por país** — D-090 fija el
  estándar laxo universal; la validación contra registros oficiales es
  condición de revisión, no trabajo de esta fase.
- **La activación real en `fr-FR`/`pt-PT`/`de-DE`** — depende del
  checklist legal de D-126.
- **Foto del dueño del grupo** — la columna no existe en el esquema
  real (§4); registrada en `dudas.md` §24.1.
- **UI de administración para las colas** — D-116: SQL + correo en v1.
- **Notificaciones push de solicitudes** — el canal de push es de D-105
  (F7) y D-127 (F11); la solicitud se entera el padre al entrar a su
  área.

## 15. Lo que no se pudo verificar

- **El rediseño de reportes de Roblox (julio 2026)**: lo citó el primer
  borrador de memoria; no se re-descargó. La decisión que lo tocaba
  (screenshot) se retiró por D-109 por razones independientes, así que
  el diseño no descansa en esa fuente.
- **El comportamiento exacto de la insignia de Bark** («Bark
  Verified»): conocimiento de producto, no fetch en vivo. La gramática
  «insignia positiva, nunca alarma» se sostiene también sin él (HIG
  advierte contra badges con doble significado).
- **Kahoot mostrando el propio rango en privado**: conocimiento de
  producto. La mecánica de ranking de §7 descansa en D-087/D-107 y en
  `formaDeTablero`, no en ese precedente.
- **La cola de reportes bajo volumen real**: D-089/D-116 asumen que el
  dueño puede atender a mano el lanzamiento en 4 locales. No hay forma
  de medirlo sin lanzar; `created_at` está en el esquema justo para
  medirlo después.
- **Si `migration-safety.mjs` acepta el `ALTER` del `CHECK` de
  `assurance` sin marcador**: se verifica contra el auditor real en la
  issue #380, no aquí (dudas §24.4).

## 16. Segunda pasada desconfiando de este documento

Hecha contra las migraciones reales y el código real, no contra la
memoria del primer borrador. Cada corrección queda con su nota en el
cuerpo; aquí el resumen:

1. **Tablas verificadas una por una contra `migrations/`.** Encontrado:
   `classroom_join` no existe (D-110); `group_owner_identity` no tiene
   `photo_r2_key` ni `full_name`/`school_name`/`revoked_reason` — la
   tabla real es mínima (`assurance`, `phone_verified_at`,
   `declared_context`) y el flujo de identidad de §5.1 debe escribir
   **solo** esas columnas `[leído:
   migrations/0005_group_owner_identity.sql]`. Encontrado también: el
   plan de F2 describía `onboarding_marks` con marca `no-chat`; la real
   es `contextual_marks` con otro `CHECK` y sin lector (§5.1 paso 6).
2. **Lo que F9 le pide a fases hermanas que ellas no saben.** A F7:
   `sumarEnGrupo` en el punto donde hoy llama `sumarEnLiga` (§8) — F7
   ya cerró sus PRs; esto es trabajo de F9 sobre código de F7, y la
   interfaz es un sobre como `misiones-sin-do-ajeno` exige, no una
   lectura por dentro del DO de liga. A F8: el barrido de `expired` en
   su cron (§5.4) y ninguna otra cosa — F8 ya declaró en su §8 que el
   salón no es suyo, y este diseño no le pide el panel para el toggle
   (D-115 lo resolvió en F9).
3. **Campos declarados pero nunca exigidos.** El primer borrador
   declaraba `max_size` sin mecanismo: ahora el tope se exige en la
   ruta de creación (D-114) y el `CHECK` lo acota a 35. La insignia
   «sin verificar» tenía componente pero ninguna ruta que la calculara:
   ahora §5.1 la deriva de `assertCanOwnChildGroup` + `school_teacher`.
   `funcion-sin-llamar.mjs` existe por este tipo de hallazgo — el gate
   `OwnerProof` lleva sin llamador desde F2, y §5.1 paso 2 es su primer
   llamador; la prueba ausente `owner-proof.prueba.mjs` (citada por su
   propio comentario `[leído: apps/web/src/lib/owner-proof.ts:21]` y
   **inexistente**) se escribe en la issue #402.
4. **Borrado en cascada.** Cubierto en §3: las cinco tablas cuelgan de
   `users`/`child_profiles` con CASCADE; `child_group_report` ganó
   CASCADE respecto al primer borrador.
5. **El número de migración.** `0018`, por reparto confirmado del dueño
   (dudas §24.5: `0013`/`0014` son de F8, `0016` de F10). Si otra rama
   toma `0018` antes, se renumera ANTES de commitear — renumerar
   después no existe (lección de la `0008`).

## 17. Runbook de la cola manual (D-116)

Las consultas que el dueño corre a mano, escritas aquí para que ninguna
se improvise:

```sql
-- Escuelas pendientes de revisión, de más vieja a más nueva:
SELECT id, name, country, locale, created_at FROM school
 WHERE verification_status = 'pending' ORDER BY created_at;

-- Aprobar una escuela (tras revisión a ojo del documento, D-090),
-- y elevar a sus maestros activos EN LA MISMA TRANSACCIÓN (corrección D-086):
BEGIN;
UPDATE school SET verification_status='verified',
       verification_method='document_review',
       verified_by='owner', verified_at=unixepoch() WHERE id='<id>';
UPDATE group_owner_identity SET assurance='school_verified'
 WHERE user_id IN (SELECT user_id FROM school_teacher
                    WHERE school_id='<id>' AND revoked_at IS NULL);
COMMIT;

-- Reportes abiertos, de más viejo a más nuevo:
SELECT r.id, r.reason_code, r.created_at, g.origen_tipo, o.assurance
 FROM child_group_report r
 JOIN child_group g ON g.id = r.child_group_id
 JOIN group_owner_identity o ON o.user_id = g.owner_user_id
 WHERE r.reviewed_at IS NULL ORDER BY r.created_at;

-- Cerrar un reporte atendido:
UPDATE child_group_report SET reviewed_at=unixepoch(), reviewed_by='owner'
 WHERE id='<id>';

-- Revocar a un dueño (ya no puede tener grupos; D-011 bitácora):
-- sus grupos se desactivan, no se borran — la bitácora se conserva.
UPDATE child_group SET disabled_at=unixepoch()
 WHERE owner_user_id='<id>' AND disabled_at IS NULL;
```

La respuesta al padre que reportó va por correo (D-089: «confirmación
de que se atendió»), con plantilla autorada por locale (§11).

## 18. Issues

Las 9 existentes (paraguas + 8), creadas en la primera pasada y ya en
el proyecto 1, **más 4 nuevas** de esta segunda pasada:

| # | Issue | Qué cambia en esta pasada |
|---|---|---|
| #379 | F9 · Grupos infantiles (paraguas) | decisiones D-107 a D-116 |
| #380 | Esquema: `school`, `child_group`, `child_group_membership`, `child_group_report` | migración `0018`; sin screenshot; `expired`/`expires_at`; sin `CLASSROOM_JOIN` |
| #381 | Verificación de escuela — dominio + revisión humana (D-086) | runbook SQL de §17 como criterio (D-116) |
| #382 | Tarjeta de identidad del dueño — aprobación del padre | sin foto, sin correo parcial; toggle de ranking integrado (D-115) |
| #383 | Roster del dueño del grupo — por dispositivo | alias+racha+puntos siempre (D-107); orden alfabético; fuente del chip «activo» por decidir (dudas §24.3) |
| #384 | Ranking opt-in dentro del grupo (D-087) | `armarTablero`, no `calcularPosiciones`; el toggle vive en la aprobación (D-115) |
| #385 | Botón de reporte permanente | **sin screenshot** (D-109); `reason_code` de 4 valores |
| #386 | Bitácora de membresía, visible al padre | incluye `expired`; toggles de ranking y salida desde aquí |
| #387 | Activación por locale y bandera de `CONFIG_KV` (D-087) | sin cambio |
| #399 | F9 · Mención neutra del grupo en el mapa del niño (D-111) | superficie de niño acotada; verificar `mapa-lectura-sin-tabla` |
| #400 | F9 · `math-challenge-classroom-do` — standings en vivo por grupo (D-112) | clase `Grupo`, `sumarEnGrupo`, sin presencia |
| #401 | F9 · Auditores: 4 nuevos + extensión de `child-free-text` (deuda F7/F8) | controles negativos por degradación (D-070) |
| #402 | F9 · Gate `OwnerProof`: primer llamador real y prueba ausente | §5.1 paso 2; hoy no lo llama nadie |

Las 13 issues (paraguas + 12) están enlazadas con `addSubIssue` y
agregadas al proyecto 1 `[medido: gh api graphql … addSubIssue; gh
project item-add 1]`.

**Orden de ejecución:** #380 (esquema) + #402 (gate) → #381 (escuela) →
#382 (tarjeta) → #383 (roster) → #384 (ranking) → #400 (DO) →
#385/#386 (reporte y bitácora) → #399 (mapa del niño) → #387
(activación). Los auditores se escriben **con** su código, no después —
la lección de F0 a F8.

## 19. Ejecución en paralelo (swarm) — territorios, y quién no toca qué

Las reglas son las de `AGENTS.md` §1, aplicadas a estas 13 issues:
**paralelizar por TERRITORIO, no por issue**; cada agente recibe su
lista de archivos y la lista de los ajenos; los registros compartidos
se tocan **solo añadiendo al final** y el orquestador resuelve los
merges; los números de migración ya están repartidos (F8 = `0013`/`0014`,
F9 = `0018`, F10 = `0016`) así que **ningún frente de F9 toca otro
número ni edita una migración existente**.

### Frentes (5 agentes en paralelo tras el esquema, luego 2)

| Frente | Issues | Archivos SUYOS | NO toca |
|---|---|---|---|
| **A · Esquema y gate** | #380, #402 | `migrations/0018_grupos_infantiles.sql` (nuevo), `apps/web/src/lib/owner-proof.ts` y `owner-proof.prueba.mjs` (nuevo) | rutas, componentes, i18n, DOs, wrangler |
| **B · Escuela** | #381 | `apps/web/src/pages/api/grupos/escuela*.ts`, `pages/[locale]/app/grupos/escuela.astro` | la migración (espera a A), el roster, el DO |
| **C · Flujo del padre** | #382, #386 | `pages/[locale]/app/grupos/unirse.astro`, `.../bitacora.astro`, `pages/api/grupos/unirse.ts`, `pages/api/grupos/membresia/*.ts`, `components/grupos/Tarjeta*.astro` | el roster del dueño (D), la escuela (B), el mapa (E) |
| **D · Roster, ranking y DO** | #383, #384, #400 | `pages/[locale]/app/grupos/[id].astro`, `apps/web/src/lib/grupo-do.ts` (nuevo), lectura de `packages/motor/src/tablero.ts` y `liga.ts` | `wrangler.jsonc`, `astro.config.mjs`, `worker.ts` **hasta el paso de integración** (ver abajo), la tarjeta (C) |
| **E · Mapa del niño** | #399 | `pages/[locale]/app/mapa.astro`, `components/mapa/*`, i18n claves `mapaGrupo*` | todo lo demás — es el único frente que toca superficie de niño |
| **F · Auditores** | #401 | `audits/grupo-*.mjs`, `audits/school-verification-required.mjs` (nuevos) | los registros compartidos **hasta el cierre** (ver abajo) |
| **G · Activación, reporte y copy** | #387, #385 | flags `CONFIG_KV` en rutas ya construidas, `apps/web/src/i18n/*.json` (claves `grupo*`, **solo añadir al final**), el botón de reporte sobre las pantallas de C/D | esquema, motor, DO |

**A va primero, solo** (B, C, D, E dependen de la migración). Después
corren B+C+D+E en paralelo; G entra cuando C y D tienen pantallas; F
escribe auditores en paralelo con todos — su control negativo degrada
archivos que YA existen (la `0012`, la `0018` cuando aterrice), nunca
el trabajo de otro frente vivo.

### Los cinco archivos que NO se paralelizan

1. `wrangler.jsonc`, 2. `astro.config.mjs`, 3. `apps/web/src/worker.ts`
   (los tres sitios del DO de D), 4. `audits/run.mjs` +
   `audits/pruebas-auditores.mjs` + `audits/adversarial/cartas.mjs`
   (los registros de F), 5. `docs/infrastructure.md` (bitácora).
   **Los toca un solo frente a la vez, al final de su trabajo, y el
   orquestador resuelve el merge** — la regla ya medida: los dos lados
   añaden, se conservan los dos.

### Paralelismo entre fases

F9 y F10 pueden correr a la vez: sus rutas no se tocan
(`/app/grupos/` vs `/app/clubes/`), sus migraciones ya tienen número
(`0018`/`0016`), y su único punto compartido —la tasa de creación de
D-114, que cuenta las dos tablas— lo implementa cada quien sobre su
tabla y quien aterrice segundo añade la del otro al conteo (dicho en
el plan de F10 §12). El registro de decisiones y `dudas.md` los toca
solo el orquestador.

### El encargo de cada agente (la plantilla de AGENTS.md §1)

Qué leer numerado (CLAUDE.md, este plan, las decisiones citadas por su
frente, el archivo patrón — para D es `liga-do.ts`; para A, la 0012) ·
su territorio y el de los demás · las líneas rojas que su trabajo puede
cruzar citadas por número (C/E: #2 y #3; D: D-081 cond. 2) · qué cuenta
como prueba (gate verde pegado, control negativo visto fallar degradando
el archivo real) · las cinco trampas medidas (auditor que aprueba su
propia violación, `\b` sin Unicode —usa `conFronteraUnicode()` de
`audits/lib/repo.mjs`—, control negativo reapuntado, función sin
llamador, `define:vars`+TS) · cómo cerrar (rama desde `origin/main`,
Conventional Commits en inglés con cuerpo, PR sin mergear, y **decir lo
que el cambio NO hizo**).

## Preguntas al dueño — resueltas en esta sesión (12, en 3 olas de 4)

| # | Pregunta | Respuesta | Decisión |
|---|---|---|---|
| 1 | Contradicción §5/§6: ¿qué ve el dueño sin opt-in? | Alias+racha+puntos siempre | D-107 |
| 2 | ¿6ª pestaña o área separada? | Área propia `/app/grupos/` | D-108 |
| 3 | ¿Screenshot automático en reportes? | Se retira | D-109 |
| 4 | ¿`CLASSROOM_JOIN` en el catálogo? | No; la membresía ES el consentimiento | D-110 |
| 5 | ¿Qué ve el niño? | Mención neutra en su mapa (contra recomendación) | D-111 |
| 6 | ¿`classroom-do`? | Sí, standings en vivo (contra recomendación) | D-112 |
| 7 | ¿Mecánica del código? | Reset + disable, sin expiración | D-113 |
| 8 | ¿Herramienta de la cola de revisión? | SQL + correo, sin UI | D-116 |
| 9 | ¿Tope del club de papás? | 20 niños (contra el 12 recomendado) | D-114 |
| 10 | ¿Límite de creación? | 3+3 por cuenta, 1/día | D-114 |
| 11 | ¿Solicitud pendiente? | Expira a 30 días, queda en bitácora | D-114 |
| 12 | ¿Dónde vive el toggle de ranking? | En la pantalla de aprobación | D-115 |
