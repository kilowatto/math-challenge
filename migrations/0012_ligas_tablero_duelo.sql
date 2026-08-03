-- ---------------------------------------------------------------------------
-- 0012 — Ligas de ~30, tablero global del adulto, y duelo asíncrono
-- ---------------------------------------------------------------------------
--
-- ─── Por qué 0011 y no 0010, con dos números reservados en medio ───────────
--
-- Cuatro frentes construyen F7 en paralelo y el reparto de números lo fija el
-- coordinador: misiones `0009`, mapa `0010`, social `0011` (ésta), límite de
-- pantalla `0012`. Esta migración se escribió primero como `0010` y se renumeró
-- al recibir el reparto definitivo.
--
-- Renumerar **antes** de commitear es gratis; renumerar después no existe. D1
-- lleva el control por NOMBRE DE ARCHIVO, así que una `0010` ya aplicada en
-- cualquier base seguiría marcada como aplicada para siempre, y la `0010` del
-- mapa nunca correría. Los dos marcadores de abajo declaran esos números como
-- ajenos y bloquean en cuanto sus archivos existan sin estar en su rama.
--
-- La reserva de numeración que vivía aquí SE BORRÓ al integrar, y la exigió el
-- propio auditor: las 0009 (misiones) y 0010 (mapa) ya aterrizaron en `main`,
-- así que no queda hueco que declarar. Una reserva sobre archivos que ya
-- existen deja de vigilar el hueco para siempre — que es exactamente cómo una
-- excepción temporal se vuelve permanente sin que nadie lo decida.
-- La reserva de numeración que vivía aquí SE BORRÓ al integrar, y la exigió el
-- propio auditor: las 0009 (misiones) y 0010 (mapa) ya aterrizaron en `main`,
-- así que no queda hueco que declarar. Una reserva sobre archivos que ya
-- existen deja de vigilar el hueco para siempre — que es exactamente cómo una
-- excepción temporal se vuelve permanente sin que nadie lo decida.
--
-- Hace cumplir: D-003, D-010, D-025, D-034, D-040, D-043, D-053, D-055, D-056,
-- D-081, líneas rojas #2, #3 y #5, e issues #237, #238, #239, #244, #250.
--
-- Solo AGREGA. Ninguna columna se toca, se renombra ni se quita, y ninguna
-- tabla existente se reconstruye: `audits/migration-safety.mjs` no necesita
-- ninguna anulación aquí. Lo que sí hay son dos `ALTER TABLE users ADD COLUMN`
-- —`alias` y `alias_locale`, #239— y dos filas nuevas en el catálogo de
-- consentimiento.
--
-- **No se edita ninguna migración anterior, y esa es la lección de la 0008.**
-- D1 lleva el control de migraciones **por nombre de archivo**, no por el
-- estado de las tablas: una 0007 ya marcada como aplicada nunca vuelve a
-- correr, así que un cambio metido ahí se pierde en silencio.
--
-- ─── Lo que esta migración NO trae, dicho antes de que alguien lo busque ────
--
--  · **Ninguna columna de presencia.** No hay `last_seen`, ni `online`, ni
--    `connected_at`, en ninguna de las cuatro tablas. Es la condición 2 de
--    D-081: el duelo es asíncrono y **no revela si el otro está conectado**,
--    porque eso es exactamente lo que hace que un niño se quede esperando. Una
--    columna así no está vacía: no existe, y no puede llenarse por descuido.
--  · **Ninguna columna de precio, moneda, cupón o transacción.** Línea roja
--    #5 y D-014: ninguna posición se compra. `audits/cosmeticos-deterministas.mjs`
--    y `audits/racha-nunca-se-vende.mjs` bloquean el commit que agregue una.
--  · **Ningún texto libre escribible por un niño.** Un duelo no tiene chat, no
--    tiene emotes escritos y no tiene nada que teclear (línea roja #3). El
--    único TEXT de forma abierta es `league_duel.item_set`, que es un JSON de
--    identificadores de ítem generado por el servidor.
--  · **Ninguna tabla por intento** (`mc-32` riesgo #1). `league_membership`
--    tiene una fila por (participante, cohorte semanal) y `league_duel` una por
--    duelo; los intentos crudos siguen yendo a `math-challenge-attempts-ae`.
--
-- Cloudflare: **un recurso nuevo**, el Durable Object `math-challenge-league-do`
-- (clase `Liga`), con su renglón en la bitácora de `docs/infrastructure.md` en
-- este mismo PR. Las cuatro tablas viven en `math-challenge-db`, ya inventariada.

-- ---------------------------------------------------------------------------
-- users.alias / users.alias_locale — el adulto aprendiz también va con velo (#239)
-- ---------------------------------------------------------------------------
--
-- D-003 dice «alias generados» sin restringirlo a niños. Nadie lo había
-- necesitado porque hasta D-034 no existía un adulto compitiendo por sí mismo
-- dentro del producto: ligas y tablero global son las dos primeras superficies
-- donde un adulto necesita el mismo velo que un niño.
--
-- **NULL a propósito, y no `NOT NULL DEFAULT ''`.** El alias se genera al
-- primer `is_learner = 1`, no al registrarse: generarlo para quien nunca
-- practica sería reservar un nombre público para alguien que nunca aparece en
-- ninguna lista. NULL significa «esta cuenta no compite todavía», y es una
-- distinción que un `''` no puede hacer.
--
-- El generador es el que ya existe — `packages/motor/src/alias.ts`, con sus
-- siete listas autoradas y su lista de bloqueo sobre la CADENA COMBINADA. No se
-- escribe un segundo generador: `audits/alias-nunca-nombre.mjs` bloquea el
-- commit que lo intente.
ALTER TABLE users ADD COLUMN alias TEXT;

-- El mismo CHECK de siete locales que `child_profiles.alias_locale`. Siete, no
-- cinco idiomas: `es-MX` y `es-ES` no comparten separador decimal y `pt-BR` y
-- `pt-PT` no comparten escala numérica (D-022, mc-34).
ALTER TABLE users ADD COLUMN alias_locale TEXT
  CHECK (alias_locale IN ('en','es-MX','es-ES','fr-FR','pt-BR','pt-PT','de-DE'));

-- ---------------------------------------------------------------------------
-- score_totals_adulto — sin esto, SERIO/JR/PRO nunca tienen tablero (#250)
-- ---------------------------------------------------------------------------
--
-- El hallazgo, verificado contra el esquema: `score_totals.child_profile_id`
-- tiene `REFERENCES child_profiles(id)` (migración 0002), y
-- `child_profiles.theme_band` solo admite KINDER/PRIMARIA/SECUNDARIA. Un adulto
-- que juega para sí mismo **no tiene fila de `child_profiles`** —
-- `/api/perfil-nuevo` rechaza crear una con banda de adulto (D-034)— y por lo
-- tanto no podía tener fila en `score_totals`. `api/health.ts` lo dice de
-- frente: su prueba de humo no puede probar el rollup porque «un niño de humo
-- es rechazado por la base: FOREIGN KEY constraint failed».
--
-- ─── Por qué tabla separada y no una columna polimórfica ───────────────────
--
-- `child_streak` y `xp_totals` (0007) resolvieron el mismo problema con un
-- participante polimórfico, y aquí se hace al revés a propósito, siguiendo el
-- precedente que D-027 fijó para `child_group`/`adult_club`: con una sola
-- tabla, el día que alguien escriba «todo `score_totals`» para el tablero de
-- niños, un adulto se cuela por descuido. Con dos tablas esa consulta **no
-- puede** alcanzar al adulto aunque nadie recuerde la regla.
--
-- El precio, dicho: dos consultas donde habría una, y la prohibición explícita
-- de unirlas con UNION — `audits/tablero-orden-puntos.mjs` la hace cumplir.
CREATE TABLE score_totals_adulto (
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period      TEXT NOT NULL,   -- 'all_time' | 'season:<id>', igual que score_totals
  -- SECUNDARIA entra porque un adulto puede estar practicando ahí; KINDER y
  -- PRIMARIA no, y no es un descuido: un adulto no compite en la banda de un
  -- niño ni aunque juegue su contenido.
  theme_band  TEXT NOT NULL CHECK (theme_band IN ('SECUNDARIA','SERIO','JR','PRO')),
  total_score INTEGER NOT NULL DEFAULT 0,
  updated_at  INTEGER NOT NULL,

  PRIMARY KEY (user_id, period)
);

-- El mismo índice compuesto que `score_totals`. Sin él, la consulta del tablero
-- pega en el modo de falla de tiempo de CPU de D1 conforme crece la tabla
-- (`mc-32` riesgo #12).
CREATE INDEX idx_score_adulto_rank
  ON score_totals_adulto (period, theme_band, total_score DESC);

-- ---------------------------------------------------------------------------
-- league_cohort — una liga de ~30, de UNA banda y de UN tipo de participante
-- ---------------------------------------------------------------------------
--
-- ─── Por qué `tipo_participante` es columna y no se infiere de la FK (#238) ─
--
-- La membresía sabe si es de niño o de adulto porque una de sus dos FK está
-- llena. La cohorte NO puede depender de eso: la pregunta que el producto hace
-- mil veces al día es «¿hay cupo en una cohorte de niños, banda PRIMARIA, escalón
-- 3, de esta semana?», y contestarla mirando qué FK tienen sus filas obliga a
-- leer las filas — es decir, a tocar datos de participantes para decidir dónde
-- meter a uno nuevo.
--
-- ─── Separadas por banda Y por tipo, y esto no estaba en ninguna decisión ───
--
-- D-003 separa los tableros por banda. La separación por **tipo de
-- participante** salió de la crítica adversarial del diseño de F7 y no está en
-- ninguna decisión previa: un adulto de banda SECUNDARIA y un niño de banda
-- SECUNDARIA tienen la misma fórmula de puntuación (D-010) y no tienen por qué
-- compartir lista. Mezclarlos pondría a un adulto y a un menor en la misma
-- superficie social, que es exactamente la categoría que D-027 eliminó entera.
-- `audits/liga-sin-fusion-cohorte.mjs` lo hace cumplir sobre el esquema y sobre
-- el motor.
--
-- `escalon` es el peldaño de la escalera de ligas. El tope arranca en 10 (#241):
-- desde ahí no se asciende, y sí se desciende. La constante vive en
-- `packages/motor/src/liga.ts` y el CHECK de aquí es su gemelo en la base — la
-- misma razón por la que `child_streak.shields_available` lleva su tope en un
-- CHECK y no solo en un `Math.min()`.
--
-- ─── Por qué `escalon` y no `tier`, que es como lo llaman #238 y #241 ──────
--
-- Se escribió `tier` primero, y `audits/motor-puntuacion.mjs` bloqueó el commit
-- con ocho hallazgos: su léxico de línea roja #4 incluye `tier` junto a
-- `premium`, `plan`, `vidas` y `corazones`, porque en un producto con planes de
-- pago **un «tier» es lo que compras**. El auditor no se equivocaba de regla;
-- se equivocaba de sentido de la palabra.
--
-- De las dos salidas —ablandar el léxico del guardián o renombrar la columna—
-- se eligió renombrar. Quitar `tier` de esa lista dejaría pasar un `if
-- (tier === "premium")` de verdad, que es exactamente lo que la línea roja #4
-- prohíbe; y `escalon` encaja mejor con el resto de esta migración, que ya
-- nombra en español (`banda`, `tipo_participante`).
CREATE TABLE league_cohort (
  id                TEXT PRIMARY KEY,

  -- Las SEIS bandas de D-010. `audits/tabla-bandas.mjs` cruza esta lista contra
  -- la tabla de la decisión: si alguien añade una banda al motor y no aquí, el
  -- INSERT falla en producción y en ninguna prueba.
  banda             TEXT NOT NULL
                    CHECK (banda IN ('KINDER','PRIMARIA','SECUNDARIA','SERIO','JR','PRO')),
  tipo_participante TEXT NOT NULL CHECK (tipo_participante IN ('child','adult')),
  escalon           INTEGER NOT NULL CHECK (escalon BETWEEN 1 AND 10),

  -- `YYYY-MM-DD` del lunes de la semana, en UTC. No es el día local del hogar
  -- que usa la racha: una cohorte junta a familias de varias zonas horarias y
  -- tiene que cerrar a la vez para todas. Que la racha use día local y la liga
  -- use semana UTC no es una inconsistencia — son dos preguntas distintas.
  week_start        TEXT NOT NULL,
  week_end          TEXT NOT NULL,

  status            TEXT NOT NULL CHECK (status IN ('OPEN','CLOSED')),
  member_count      INTEGER NOT NULL DEFAULT 0 CHECK (member_count >= 0),
  created_at        INTEGER NOT NULL
);

-- El índice de la única consulta caliente: buscar cupo sin sala de espera
-- (#237). Parcial sobre las abiertas, mismo criterio que `idx_consent_vigente`.
CREATE INDEX idx_league_cohort_cupo
  ON league_cohort (banda, tipo_participante, escalon, week_start)
  WHERE status = 'OPEN';

-- ---------------------------------------------------------------------------
-- league_membership — participante polimórfico: o niño, o adulto, nunca los dos
-- ---------------------------------------------------------------------------
--
-- El `CHECK ((child_profile_id IS NOT NULL) <> (user_id IS NOT NULL))` es el
-- mismo patrón de `child_streak` y `xp_totals` (0007), y hace cumplir las dos
-- mitades a la vez: **ninguna** de las dos llena es una fila huérfana, y **las
-- dos** llenas es un participante que aparecería dos veces en su propia liga.
--
-- ─── Lo que esta tabla NO guarda, y por qué importa ────────────────────────
--
-- No hay `total_xp`, no hay `current_streak`, no hay `shields_available`, y no
-- hay ninguna columna de mapa. Es la condición 1 de D-081 escrita en el
-- esquema: **la liga no puede quitar nada**, y la forma más barata de que no
-- pueda es que no tenga dónde escribirlo. Descender cambia `outcome` y el
-- `cohort_id` de la semana siguiente; no toca ningún contador de aprendizaje
-- porque no lo tiene delante. `audits/liga-no-quita.mjs` sigue el grafo.
--
-- `points_this_week` es la moneda del tablero (D-025), y **no se convierte a
-- XP ni al revés** (#225, D-055). Son dos monedas: una puede bajar y se
-- resetea cada semana, la otra no baja nunca y es de por vida.
CREATE TABLE league_membership (
  id               TEXT PRIMARY KEY,
  cohort_id        TEXT NOT NULL REFERENCES league_cohort(id) ON DELETE CASCADE,

  child_profile_id TEXT REFERENCES child_profiles(id) ON DELETE CASCADE,
  user_id          TEXT REFERENCES users(id) ON DELETE CASCADE,

  points_this_week INTEGER NOT NULL DEFAULT 0,
  -- Cuántos días de esta semana practicó. Es lo que separa «activo» de
  -- «inactivo» al cerrar el ciclo, y por eso no puede pasar de 7.
  active_days      INTEGER NOT NULL DEFAULT 0 CHECK (active_days BETWEEN 0 AND 7),
  joined_at        INTEGER NOT NULL,

  final_rank       INTEGER,
  -- ARCHIVADA es el housekeeping de #241: ocho semanas sin actividad y la
  -- membresía se archiva **en silencio**, sin notificación a nadie.
  outcome          TEXT CHECK (outcome IN ('SUBE','SE_QUEDA','BAJA','ARCHIVADA')),

  CHECK ((child_profile_id IS NOT NULL) <> (user_id IS NOT NULL))
);

-- Un participante, una sola membresía por cohorte. Sin esto, dos cierres de
-- reto concurrentes del mismo niño crean dos filas y la que se lea depende del
-- orden — que es cómo un número se vuelve irreproducible sin que nadie mienta.
CREATE UNIQUE INDEX idx_league_member_perfil
  ON league_membership (cohort_id, child_profile_id)
  WHERE child_profile_id IS NOT NULL;
CREATE UNIQUE INDEX idx_league_member_usuario
  ON league_membership (cohort_id, user_id)
  WHERE user_id IS NOT NULL;

-- La tabla de la liga se lee ordenada por puntos (D-025), nunca por θ.
CREATE INDEX idx_league_member_tabla
  ON league_membership (cohort_id, points_this_week DESC);

-- ---------------------------------------------------------------------------
-- league_duel — reto asíncrono dentro de la propia liga (#244, D-018)
-- ---------------------------------------------------------------------------
--
-- ─── El set de ítems se CONGELA al crear ───────────────────────────────────
--
-- `item_set` es un JSON de identificadores de ítem, escrito una vez y nunca
-- reescrito. La equidad del duelo no viene de que el motor adaptativo elija
-- bien para cada uno: viene de que los dos reciben **exactamente los mismos
-- ítems, en el mismo orden**. Por eso el duelo no depende de F4 y por eso esta
-- columna es de escritura única.
--
-- ─── 48 horas, y ninguna cuenta regresiva ──────────────────────────────────
--
-- `expires_at` es `created_at + 48 h`. Existe para que el duelo caduque solo,
-- no para pintarle un reloj a nadie: `audits/racha-lexico.mjs` bloquea una
-- cuenta regresiva en una superficie de liga igual que en una de racha, porque
-- la urgencia fabricada es una categoría nombrada por la FTC y aquí el
-- destinatario puede tener ocho años.
--
-- ─── Rechazar es silencioso ────────────────────────────────────────────────
--
-- No hay columna `rejected_at` ni `declined_by`. Un duelo que expira sin
-- respuesta pasa a EXPIRADO y **no se le dice al retador que lo rechazaron**:
-- decírselo convertiría el silencio de un niño en un mensaje sobre ese niño.
--
-- ─── `winner_membership_id` es un gancho, no una funcionalidad ─────────────
--
-- La columna existe y se llena. **Ningún cosmético y ninguna recompensa se
-- otorgan en este subsistema**, y eso es criterio de aceptación de #244, no una
-- omisión: D-014 prohíbe lo aleatorio y esta migración no abre la puerta.
CREATE TABLE league_duel (
  id                       TEXT PRIMARY KEY,
  cohort_id                TEXT NOT NULL REFERENCES league_cohort(id) ON DELETE CASCADE,

  -- Los dos lados son MEMBRESÍAS, no participantes. Es lo que hace imposible
  -- retar fuera de la propia liga: una membresía pertenece a una cohorte, y el
  -- CHECK de abajo exige que las dos sean de la misma.
  challenger_membership_id TEXT NOT NULL REFERENCES league_membership(id) ON DELETE CASCADE,
  challenged_membership_id TEXT NOT NULL REFERENCES league_membership(id) ON DELETE CASCADE,

  -- JSON de identificadores de ítem, congelado al crear. Lo escribe el
  -- servidor; ningún participante teclea nada aquí (línea roja #3).
  item_set                 TEXT NOT NULL,

  created_at               INTEGER NOT NULL,
  expires_at               INTEGER NOT NULL,

  challenger_points        INTEGER,
  challenged_points        INTEGER,
  winner_membership_id     TEXT REFERENCES league_membership(id),

  status                   TEXT NOT NULL
                           CHECK (status IN ('PENDIENTE','JUGADO','EXPIRADO')),

  -- Nadie se reta a sí mismo. Parece obvio y es el primer defecto que aparece
  -- cuando la lista de rivales se arma con un `SELECT` sin filtro.
  CHECK (challenger_membership_id <> challenged_membership_id),
  CHECK (expires_at > created_at)
);

-- El tope de 3 duelos salientes pendientes (#244) se comprueba con este índice:
-- es la consulta que lo cuenta, y sin él cuesta un escaneo por cada creación.
CREATE INDEX idx_duel_salientes
  ON league_duel (challenger_membership_id)
  WHERE status = 'PENDIENTE';
CREATE INDEX idx_duel_recibidos
  ON league_duel (challenged_membership_id)
  WHERE status = 'PENDIENTE';

-- ---------------------------------------------------------------------------
-- El opt-in: dos códigos nuevos en el catálogo de consentimiento
-- ---------------------------------------------------------------------------
--
-- D-040 fijó el patrón para el tablero global: **no se inserta la fila al crear
-- el perfil; se inserta cuando el padre lo enciende, y esa acción se registra
-- igual que el consentimiento — quién, cuándo, y qué se comparte.** D-081
-- extiende ese patrón a la liga de KINDER y al duelo, y #243 lo pide con esas
-- palabras.
--
-- ─── Por qué el opt-in vive aquí y no como columna de `child_profiles` ─────
--
-- #244 lo describe como «default apagado en `child_profile`», y una columna
-- `duel_opt_in INTEGER DEFAULT 0` habría sido más corta de escribir. Va en
-- `child_consents` por tres razones, y conviene que estén escritas porque es
-- una desviación de la letra del issue:
--
--   1. **La ausencia de fila ES el default apagado**, que es literalmente el
--      mecanismo que D-040 exige («no se inserta fila al crear el perfil»). Una
--      columna con DEFAULT 0 también apaga, pero no deja constancia de quién lo
--      encendió ni cuándo.
--   2. `child_consents` ya tiene `granted_by`, `granted_at` y `revoked_at`, que
--      es exactamente lo que #243 pide registrar. Una columna booleana no puede
--      responder «¿quién activó esto y cuándo?» sin una segunda tabla.
--   3. Apagar tiene que ser **revocar**, no borrar (mismo criterio que #247
--      exige para el tablero: `revoked_at`, jamás `DELETE`).
--
-- El adulto aprendiz no pasa por aquí: consiente por sí mismo, y para él la
-- liga viene encendida (D-081, «PRIMARIA en adelante: default encendido»). El
-- duelo del adulto también, y eso es criterio de #244.
INSERT INTO consent_type_catalog (code, description, legal_basis, required, created_at) VALUES
  ('LEAGUE', 'Participar en una liga de ~30 pares, con un alias generado',      'CONSENT', 0, 0),
  ('DUEL',   'Enviar y aceptar retos de duelo dentro de su propia liga',        'CONSENT', 0, 0);
