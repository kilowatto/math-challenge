-- 0001_identity.sql — cuentas de adulto, passkeys y contraseña de respaldo
--
-- Decisiones que este esquema hace cumplir:
--   D-013  el niño NUNCA es un usuario. No hay fila de niño en esta migración.
--   D-026  registro de 2 campos: correo + credencial. Nada más al registrarse.
--   D-038  passkey primero, contraseña como respaldo.
--   D-022  siete locales, no cinco.
--
-- Lo que deliberadamente NO está aquí:
--   - sesiones: viven en math-challenge-session-kv, no en D1 (infrastructure.md).
--   - intentos: van a Analytics Engine. D1 topa en 10 GB y sería la primera
--     pared que golpeamos (mc-32).
--   - perfiles de niño: migración 0002.
--   - grupos y clubs: sus propias migraciones, en sus propias fases (D-027).

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
-- Sin columna `role`. El plan maestro §3.3 proponía role IN
-- ('parent','teacher','admin'), pero se escribió antes de que el adulto que
-- aprende para sí mismo fuera de primera clase (D-034) — y una persona puede ser
-- las tres cosas a la vez: el propio dueño es papá y aprendiz adulto
-- (por-que-existe.md). Un rol excluyente obligaría a mentir.
--
-- Las capacidades se derivan de los datos:
--   papá    -> tiene filas en child_profiles
--   maestro -> tiene filas en teacher_verification (fase F9)
--   adulto  -> is_learner = 1
CREATE TABLE users (
  id             TEXT PRIMARY KEY,
  email          TEXT NOT NULL UNIQUE,
  email_verified INTEGER NOT NULL DEFAULT 0 CHECK (email_verified IN (0, 1)),

  -- Locale de la interfaz del adulto. Siete, no cinco: es-MX y es-ES no
  -- comparten separador decimal, pt-BR y pt-PT no comparten escala numérica
  -- (mc-34, D-022).
  locale         TEXT NOT NULL DEFAULT 'en'
                 CHECK (locale IN ('en','es-MX','es-ES','fr-FR','pt-BR','pt-PT','de-DE')),

  -- ¿Este adulto usa el producto para sí mismo, además de para sus hijos?
  -- Habilita la franja adulta N8-N10 (D-034) y los clubs de adultos (D-028).
  is_learner     INTEGER NOT NULL DEFAULT 0 CHECK (is_learner IN (0, 1)),

  created_at     INTEGER NOT NULL,
  updated_at     INTEGER NOT NULL,

  -- Borrado suave. El borrado duro corre por el runbook de erasure, que toca
  -- cuatro sistemas: D1, DO, Analytics Engine y R2 (mc-32, riesgo #7).
  deleted_at     INTEGER
);

CREATE INDEX idx_users_email_active ON users (email) WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- user_passkeys — WebAuthn, el camino principal (D-035)
-- ---------------------------------------------------------------------------
-- Un usuario puede tener varias: teléfono, laptop, llave física. Registrar una
-- segunda es lo que evita que perder el teléfono signifique perder la cuenta.
CREATE TABLE user_passkeys (
  credential_id  TEXT PRIMARY KEY,          -- base64url del rawId
  user_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  public_key     BLOB NOT NULL,             -- COSE
  sign_count     INTEGER NOT NULL DEFAULT 0,

  -- 'usb','nfc','ble','internal','hybrid' — separados por coma. Se guarda para
  -- poder explicarle al usuario cuál credencial es cuál sin adivinar.
  transports     TEXT,
  aaguid         TEXT,

  -- Nombre que pone el usuario ("mi teléfono"). Nunca se autogenera con datos
  -- del dispositivo: sería una huella que no necesitamos.
  nickname       TEXT,

  -- Señal para F9/F10: "una tercera credencial nueva esta semana" es una de las
  -- entradas del tier 3 de anti-trampa, nunca la única ni bloqueante (mc-29).
  created_at     INTEGER NOT NULL,
  last_used_at   INTEGER
);

CREATE INDEX idx_passkeys_user ON user_passkeys (user_id);

-- ---------------------------------------------------------------------------
-- user_password — el respaldo, no el camino principal (D-035)
-- ---------------------------------------------------------------------------
-- PRIMARY KEY sobre user_id: máximo una contraseña por usuario. Existe porque
-- el soporte de passkeys en 2026 es bueno pero no universal, y porque el
-- mercado objetivo incluye Android de gama baja donde el autenticador puede
-- fallar. No se ofrece primero; se ofrece cuando el passkey no se puede.
CREATE TABLE user_password (
  user_id       TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

  -- Cadena PHC completa, con el algoritmo adentro, para poder migrar de
  -- algoritmo sin adivinar cómo se hasheó cada fila.
  password_hash TEXT NOT NULL,

  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL
);

-- ---------------------------------------------------------------------------
-- consent_records — la fila que es el consentimiento, y es auditable
-- ---------------------------------------------------------------------------
-- COPPA 2025 exige política de retención por escrito y consentimiento SEPARADO
-- antes de divulgar a terceros; LGPD art. 14 exige consentimiento específico y
-- destacado, y verificación con las tecnologías disponibles (mc-25).
--
-- child_profile_id se llena en la 0002; aquí queda nullable para que el
-- consentimiento de la propia cuenta (términos, privacidad) también viva aquí.
CREATE TABLE consent_records (
  id               TEXT PRIMARY KEY,
  user_id          TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  child_profile_id TEXT,

  consent_type     TEXT NOT NULL,
  consent_version  TEXT NOT NULL,   -- qué texto exacto aceptó, para poder probarlo
  locale           TEXT NOT NULL,   -- en qué idioma lo leyó

  granted_at       INTEGER NOT NULL,
  revoked_at       INTEGER,

  -- Hash, nunca la IP. Sirve para demostrar que hubo un acto distinto, sin
  -- guardar un dato personal que no necesitamos (mc-25, minimización).
  ip_hash          TEXT
);

CREATE INDEX idx_consent_user ON consent_records (user_id, consent_type);
