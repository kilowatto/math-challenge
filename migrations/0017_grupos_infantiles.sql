-- ---------------------------------------------------------------------------
-- 0017 — Grupos infantiles: escuela verificada, salón y club de papás
-- ---------------------------------------------------------------------------
--
-- (La 0016 era una reserva `migration-safety-reserva` de este archivo mientras
-- F5c la construía en paralelo; aterrizó en `main` y el marcador se borró aquí
-- mismo al integrar, como el mecanismo exige: la excepción nunca se vuelve
-- permanente — una excepción que nadie borra deja de vigilar el hueco para
-- siempre, ver la lección de la 0012.)
--
-- Hace cumplir: D-011, D-027, D-043, D-044, D-086, D-087, D-088, D-089, D-090
-- y las decisiones de detalle de F9 (D-093 a D-102 según el reparto del
-- orquestador: la membresía ES el consentimiento, el código de unión de 6
-- caracteres, los topes, el toggle de ranking en la aprobación, el reporte sin
-- captura), líneas rojas #2 y #3, e issues #379 a #387.
-- Investigación: mc-28 (FERPA/COPPA, modo maestro), mc-46 (clubs), mc-25
-- (privacidad infantil), mc-32 (D1 guarda estado, no evento).
--
-- ─── Lo que esta migración NO trae, dicho antes de que alguien lo busque ────
--
--  · **Ningún texto libre entre adulto y niño, en ninguna dirección.** Línea
--    roja #3. `child_group_report.reason_code` es un CHECK cerrado de cinco
--    valores (issue #385). El único TEXT de forma abierta es `school.name`,
--    que lo escribe un ADULTO sobre su propia institución y se muestra al
--    padre junto a la insignia de qué tan comprobado está — nunca lo escribe
--    ni lo recibe un niño.
--  · **Ninguna captura de pantalla.** El plan de F9 §3 llegó a proponer
--    `screenshot_r2_key` siguiendo el patrón Roblox; la decisión posterior
--    (D-095, según el reparto del orquestador) lo descartó: el estado del
--    grupo al momento del reporte **se reconstruye de D1** — las filas de
--    `child_group_membership` no se borran jamás, así que la revisión humana
--    puede ver exactamente lo que el padre vio sin guardar imágenes de una
--    pantalla con datos de menores. La columna no existe y no puede llenarse
--    por descuido.
--  · **Ninguna columna de precio, plan o azar.** Líneas rojas #4 y #5.
--  · **Ninguna tabla por intento** (mc-32 riesgo #1). Una fila por escuela,
--    por grupo, por solicitud de membresía y por reporte.
--  · **Ningún consentimiento aparte.** D-096 (reparto del orquestador): la
--    membresía ES el consentimiento. La fila de `child_group_membership` con
--    `decided_by` + `decided_at` es la prueba de que ESTE padre aprobó la
--    entrada de ESTE niño a ESTE grupo — duplicarla en `child_consents`
--    crearía dos verdades sobre el mismo hecho, que es exactamente lo que
--    D-051 cerró para el consentimiento general.
--
-- Cloudflare: las cinco tablas viven en `math-challenge-db`, ya inventariada.
-- El Durable Object `math-challenge-classroom-do` (clase `Salon`) viaja en el
-- mismo PR con su renglón en la bitácora de `docs/infrastructure.md`.

-- ---------------------------------------------------------------------------
-- school — la entidad que D-086 introduce
-- ---------------------------------------------------------------------------
--
-- Se verifica UNA vez, como institución, y es la escuela quien autoriza a sus
-- maestros. Es la única forma que `mc-28` identifica de invocar limpiamente la
-- excepción de «school official» de FERPA (34 CFR 99.31(a)(1)): una
-- institución real que determina el interés educativo legítimo y mantiene
-- «control directo» — revocación incluida.
--
-- NO es una segunda fuente de confianza. Su único efecto sobre lo que ve el
-- padre es escribir `group_owner_identity.assurance = 'school_verified'` por
-- medio de los triggers de abajo; toda pantalla sigue leyendo UN solo campo
-- (corrección del 2026-08-03 en la issue #380).
--
-- El estándar de documento es laxo y universal (D-090): membrete, nombre y
-- dirección, revisado a ojo por el dueño (D-089: una sola persona, sin flujo
-- de asignación — por eso no hay `assigned_to` ni nada que lo sugiera).
CREATE TABLE school (
  id                  TEXT PRIMARY KEY,
  -- Lo declara el adulto que registra la escuela. Es texto libre de un ADULTO
  -- sobre su institución (nunca de un niño), y se muestra al padre junto a la
  -- insignia de assurance — la misma regla que `declared_context` de la 0005.
  name                TEXT NOT NULL,
  country             TEXT NOT NULL,
  locale              TEXT NOT NULL
                      CHECK (locale IN ('en','es-MX','es-ES','fr-FR','pt-BR','pt-PT','de-DE')),
  verification_status TEXT NOT NULL DEFAULT 'pending'
                      CHECK (verification_status IN ('pending','verified','rejected')),
  verification_method TEXT CHECK (verification_method IN ('domain_shortcut','document_review')),
  -- users.id de quien revisó (D-089: el dueño, manual), o 'auto' para el atajo
  -- de dominio. `created_at` en cada fila pendiente es lo que le permite medir
  -- su tiempo de respuesta real — criterio explícito de D-089.
  verified_by         TEXT,
  verified_at         INTEGER,
  created_at          INTEGER NOT NULL
);

-- ---------------------------------------------------------------------------
-- school_teacher — quién está autorizado a crear salones bajo esta escuela
-- ---------------------------------------------------------------------------
--
-- La escuela invita y revoca; el maestro individual nunca vuelve a pasar por
-- la barra de T-5 mientras su fila siga activa. `revoked_at` y no DELETE: la
-- revocación es un hecho que importa (baja el assurance en el momento, ver el
-- trigger de abajo), y una fila borrada no puede contarlo.
CREATE TABLE school_teacher (
  school_id  TEXT NOT NULL REFERENCES school(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invited_at INTEGER NOT NULL,
  revoked_at INTEGER,
  PRIMARY KEY (school_id, user_id)
);

CREATE INDEX idx_school_teacher_usuario
  ON school_teacher (user_id)
  WHERE revoked_at IS NULL;

-- ---------------------------------------------------------------------------
-- child_group — una sola tabla para salón y club de papás (D-027, D-043)
-- ---------------------------------------------------------------------------
--
-- `origen_tipo` solo dice DE DÓNDE viene la fila, nunca qué protecciones
-- aplican: las protecciones son del código que lee la tabla, no de un `if`
-- sobre esa columna (F9 §2). Modelarlo con dos tablas sería el modo de falla
-- a la inversa: que alguien agregue una protección a una y no a la otra.
--
-- `join_code` son 6 caracteres sin ambiguos (D-099 del reparto: lo genera
-- `packages/motor/src/grupo.ts`, con el mismo estándar de entropía que
-- `mc_h`/`mc_s` de D-052). El CHECK de longitud es el gemelo en la base, la
-- misma razón por la que `child_streak.shields_available` lleva su tope en un
-- CHECK y no solo en un `Math.min()`.
CREATE TABLE child_group (
  id            TEXT PRIMARY KEY,
  owner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  origen_tipo   TEXT NOT NULL CHECK (origen_tipo IN ('salon','club_papas')),
  -- NULL salvo salón afiliado a escuela verificada (D-086). Que apunte a una
  -- escuela NO verificada no presenta al grupo como afiliado: lo que ve el
  -- padre sale siempre de `group_owner_identity.assurance`.
  school_id     TEXT REFERENCES school(id),
  join_code     TEXT NOT NULL UNIQUE CHECK (length(join_code) = 6),
  -- El tope DURO del esquema es 35 (D-087: salón 30-35). El tope menor del
  -- club de papás lo hace cumplir el motor por `origen_tipo`
  -- (`packages/motor/src/grupo.ts`) y el trigger de cupo de abajo lee ESTA
  -- columna, así que aprobar de más aborta aunque la ruta falle.
  max_size      INTEGER NOT NULL CHECK (max_size BETWEEN 1 AND 35),
  created_at    INTEGER NOT NULL,
  -- El dueño puede apagar el código sin borrar el grupo (F9 §3). Un grupo
  -- deshabilitado no admite solicitudes nuevas; las membresías aprobadas no
  -- se tocan.
  disabled_at   INTEGER
);

CREATE INDEX idx_child_group_dueno ON child_group (owner_user_id);

-- ---------------------------------------------------------------------------
-- child_group_membership — una fila por SOLICITUD, nunca borrada (bitácora)
-- ---------------------------------------------------------------------------
--
-- El código de unión produce una solicitud `pending`, nunca una entrada
-- instantánea: el padre del niño ve la identidad del dueño ANTES de decidir
-- (D-011, F9 §4). `decided_by` es el users.id del padre que decidió — la
-- membresía ES el consentimiento, y esta fila es su prueba.
--
-- `status = 'removed'` y jamás DELETE (F9 §9, issue #386): remover a un niño
-- es de un toque y sin aprobación del dueño (mc-28 implicación #5), pero corta
-- VISIBILIDAD, no la fila — la bitácora que ve el padre conserva el historial
-- completo, que es lo que sustituye al «contacto de salvaguarda nombrado» de
-- la salvaguarda de deportes juveniles (mc-46).
--
-- `leaderboard_opt_in` default 0 y lo pone el PADRE al aprobar (D-087, D-101
-- del reparto): el dueño del grupo no puede activarlo por el niño en ningún
-- endpoint, y un niño con 0 no aparece en ninguna vista ordenada por posición
-- aunque sí en el roster del dueño (D-027 ya autoriza alias/racha/puntos).
CREATE TABLE child_group_membership (
  id                 TEXT PRIMARY KEY,
  child_group_id     TEXT NOT NULL REFERENCES child_group(id) ON DELETE CASCADE,
  child_profile_id   TEXT NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  status             TEXT NOT NULL
                     CHECK (status IN ('pending','approved','rejected','removed')),
  requested_at       INTEGER NOT NULL,
  decided_at         INTEGER,
  decided_by         TEXT REFERENCES users(id),
  leaderboard_opt_in INTEGER NOT NULL DEFAULT 0 CHECK (leaderboard_opt_in IN (0,1))
);

-- Un niño no puede tener dos solicitudes vivas en el mismo grupo. Rechazadas y
-- removidas no estorban: una nueva solicitud es una fila nueva en la bitácora.
CREATE UNIQUE INDEX idx_cgm_viva
  ON child_group_membership (child_group_id, child_profile_id)
  WHERE status IN ('pending','approved');

CREATE INDEX idx_cgm_grupo ON child_group_membership (child_group_id, status);
CREATE INDEX idx_cgm_hijo  ON child_group_membership (child_profile_id);

-- ---------------------------------------------------------------------------
-- El tope de tamaño se HACE CUMPLIR, no se declara (hueco de la issue #380)
-- ---------------------------------------------------------------------------
--
-- Un `max_size` que solo vive como número es la «protección de adorno» que
-- D-089 ya nombró para las colas. Estos dos triggers abortan la aprobación que
-- exceda el cupo EN LA MISMA TRANSACCIÓN, así que el tope no depende de que
-- ninguna ruta recuerde contar.
CREATE TRIGGER trg_cgm_cupo_insert
BEFORE INSERT ON child_group_membership
FOR EACH ROW WHEN NEW.status = 'approved'
BEGIN
  SELECT RAISE(ABORT, 'child_group lleno: max_size alcanzado (D-087)')
  WHERE (SELECT COUNT(*) FROM child_group_membership
         WHERE child_group_id = NEW.child_group_id AND status = 'approved')
        >= (SELECT max_size FROM child_group WHERE id = NEW.child_group_id);
END;

CREATE TRIGGER trg_cgm_cupo_update
BEFORE UPDATE OF status ON child_group_membership
FOR EACH ROW WHEN NEW.status = 'approved' AND OLD.status <> 'approved'
BEGIN
  SELECT RAISE(ABORT, 'child_group lleno: max_size alcanzado (D-087)')
  WHERE (SELECT COUNT(*) FROM child_group_membership
         WHERE child_group_id = NEW.child_group_id AND status = 'approved')
        >= (SELECT max_size FROM child_group WHERE id = NEW.child_group_id);
END;

-- ---------------------------------------------------------------------------
-- child_group_report — el botón de reporte permanente (issue #385, D-089)
-- ---------------------------------------------------------------------------
--
-- `reason_code` es un CHECK cerrado con los cinco valores que la issue #385
-- enumera — «cerrado» sin lista era una promesa sin cumplir. Nunca texto
-- libre: la línea roja #3 aplica aunque quien reporta sea un adulto, por
-- consistencia de esquema (F9 §7). Sin captura de pantalla (ver la cabecera):
-- el estado se reconstruye de D1 porque `child_group_membership` no se borra.
--
-- `created_at` ordena la cola por antigüedad para que el revisor único (D-089)
-- mida si se está atrasando. `reviewed_by` es su users.id — sin
-- `assigned_to`: no hay equipo que asignar.
CREATE TABLE child_group_report (
  id             TEXT PRIMARY KEY,
  child_group_id TEXT NOT NULL REFERENCES child_group(id) ON DELETE CASCADE,
  reported_by    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason_code    TEXT NOT NULL
                 CHECK (reason_code IN (
                   'IDENTIDAD_SOSPECHOSA',
                   'CONTACTO_INDEBIDO',
                   'CONTENIDO_INAPROPIADO',
                   'TAMANIO_O_COMPOSICION_SOSPECHOSA',
                   'OTRO'
                 )),
  created_at     INTEGER NOT NULL,
  reviewed_at    INTEGER,
  reviewed_by    TEXT REFERENCES users(id)
);

CREATE INDEX idx_cg_report_cola
  ON child_group_report (created_at)
  WHERE reviewed_at IS NULL;

-- ---------------------------------------------------------------------------
-- group_owner_identity gana `school_verified` — el cuarto valor de assurance
-- ---------------------------------------------------------------------------
--
-- La 0005 reservó este momento con sus palabras: «el valor está para que el
-- día que exista no haga falta otra migración». Existe: es D-086. Una escuela
-- verificada escribe `school_verified` en el assurance de cada maestro activo
-- bajo ella, y revocarlo lo baja a `declared` en el momento.
--
-- SQLite no puede modificar un CHECK sin reconstruir la tabla, así que aquí sí
-- se justifica la reconstrucción de 12 pasos que la 0005 evitó: no se pierde
-- ni una columna (las ocho viajan, incluida `status`, muerta a propósito), y
-- `audits/migration-safety.mjs` verifica la firma crear→copiar→borrar→renombrar
-- y que ninguna columna se quede fuera.
CREATE TABLE group_owner_identity_nueva (
  user_id           TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  status            TEXT NOT NULL DEFAULT 'SIN_VERIFICAR'
                    CHECK (status IN ('SIN_VERIFICAR','EN_REVISION','VERIFICADO','RECHAZADO')),
  method            TEXT CHECK (method IN ('DOMINIO_ESCOLAR','REVISION_MANUAL','INVITACION_DE_COLEGA')),
  reviewed_at       INTEGER,
  note              TEXT,
  assurance         TEXT NOT NULL DEFAULT 'declared'
                    CHECK (assurance IN (
                      -- Lo escribió la persona. Nadie lo comprobó. El caso normal.
                      'declared',
                      -- Un correo en el dominio de una escuela conocida: prueba
                      -- que controla ese buzón, no que dé clases ahí.
                      'school_domain',
                      -- Alguien del equipo lo miró (reservado por la 0005).
                      'human_reviewed',
                      -- Su escuela está verificada y su fila de school_teacher
                      -- sigue activa. Lo escriben los triggers de abajo, jamás
                      -- una ruta a mano — `audits/school-verification-required.mjs`
                      -- bloquea cualquier otra escritura de este valor.
                      'school_verified'
                    )),
  phone_verified_at INTEGER,
  declared_context  TEXT
);

INSERT INTO group_owner_identity_nueva
  SELECT user_id, status, method, reviewed_at, note,
         assurance, phone_verified_at, declared_context
  FROM group_owner_identity;

DROP TABLE group_owner_identity;
ALTER TABLE group_owner_identity_nueva RENAME TO group_owner_identity;

-- ---------------------------------------------------------------------------
-- Los triggers que mantienen assurance sincronizado con la escuela
-- ---------------------------------------------------------------------------
--
-- Son la respuesta al criterio de la issue #381: verificar una escuela y
-- actualizar a sus maestros ocurren EN LA MISMA TRANSACCIÓN o no ocurren —
-- un paso separado podría quedar a medias y dejar a un maestro presentándose
-- como afiliado sin estarlo (o al revés).

-- Verificar la escuela sube a sus maestros activos.
CREATE TRIGGER trg_school_verificada
AFTER UPDATE OF verification_status ON school
FOR EACH ROW WHEN NEW.verification_status = 'verified' AND OLD.verification_status <> 'verified'
BEGIN
  UPDATE group_owner_identity SET assurance = 'school_verified'
  WHERE user_id IN (
    SELECT user_id FROM school_teacher
    WHERE school_id = NEW.id AND revoked_at IS NULL
  );
END;

-- Si la escuela deja de estar verificada, el assurance baja de inmediato.
CREATE TRIGGER trg_school_degradada
AFTER UPDATE OF verification_status ON school
FOR EACH ROW WHEN OLD.verification_status = 'verified' AND NEW.verification_status <> 'verified'
BEGIN
  UPDATE group_owner_identity SET assurance = 'declared'
  WHERE assurance = 'school_verified'
    AND user_id IN (SELECT user_id FROM school_teacher WHERE school_id = NEW.id);
END;

-- Invitar a un maestro bajo una escuela YA verificada lo sube al insertar.
CREATE TRIGGER trg_school_teacher_alta
AFTER INSERT ON school_teacher
FOR EACH ROW WHEN NEW.revoked_at IS NULL
BEGIN
  UPDATE group_owner_identity SET assurance = 'school_verified'
  WHERE user_id = NEW.user_id
    AND (SELECT verification_status FROM school WHERE id = NEW.school_id) = 'verified';
END;

-- Revocar baja el assurance a `declared` en la misma transacción, no «al día
-- siguiente»: un maestro revocado no puede seguir presentándose como afiliado
-- ni un minuto (issue #380, caso plantado antes del arreglo).
CREATE TRIGGER trg_school_teacher_revocado
AFTER UPDATE OF revoked_at ON school_teacher
FOR EACH ROW WHEN NEW.revoked_at IS NOT NULL AND OLD.revoked_at IS NULL
BEGIN
  UPDATE group_owner_identity SET assurance = 'declared'
  WHERE user_id = NEW.user_id AND assurance = 'school_verified';
END;

-- ---------------------------------------------------------------------------
-- Lo que esta migración NO hace, dicho aquí para que no se suponga
-- ---------------------------------------------------------------------------
--
-- · **No crea rutas ni pantallas.** El contrato de datos es esta migración;
--   quién escribe y lee estas tablas es de las issues #381-#386.
-- · **No verifica a ninguna escuela.** La cola de revisión la atiende el
--   dueño a mano (D-089) y el estándar de documento es laxo y universal
--   (D-090): la primera capa, no la única — las capas reales son el tope de
--   tamaño/creación (D-087) y la aprobación del padre por niño (D-011).
-- · **No toca `consent_records` ni `child_consents`.** La membresía es su
--   propia prueba; no hay doble registro.
-- · **No siembra dominios institucionales conocidos.** El atajo de dominio de
--   D-086 necesita su lista, y esa lista es contenido que se decide con datos,
--   no una constante inventada en una migración.
