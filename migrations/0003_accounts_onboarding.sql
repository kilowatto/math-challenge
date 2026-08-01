-- ---------------------------------------------------------------------------
-- 0003 — Cuentas y onboarding (F2)
-- ---------------------------------------------------------------------------
--
-- Hace cumplir: D-026 (registro de 2 campos), D-038 (passkey primero), D-013
-- (consentimiento y datos del menor), D-016 (límite de pantalla), D-040 (tablero
-- opt-in), línea roja #2 (el niño nunca es un usuario), línea roja #4 (nunca se
-- cobra por dejar practicar).
--
-- LA REGLA QUE GOBIERNA ESTA MIGRACIÓN: las cuatro columnas nuevas de `users`
-- —`country`, `timezone`, `data_region`, `signup_intent`— se **derivan de la
-- petición** y **ninguna se pregunta**. El formulario sigue teniendo dos campos
-- (D-026). Cloudflare ya sabe el país (`cf.country`) y la zona horaria
-- (`cf.timezone`) del que se está registrando; preguntárselo es cobrarle un
-- campo por un dato que ya tenemos.
--
-- Y `signup_intent` sale de POR DÓNDE entró: la puerta de padre, la de maestro o
-- la de adulto que aprende. Es la intención observada, no la declarada — que es
-- más fiable y no cuesta un campo.

-- ---------------------------------------------------------------------------
-- users — cuatro columnas derivadas, cero preguntadas
-- ---------------------------------------------------------------------------

-- País ISO 3166-1 alfa-2, de `request.cf.country`. Sirve para la región de datos
-- y para el impuesto; NO para geolocalizar a nadie: es país, no ciudad ni
-- coordenada (mc-25).
ALTER TABLE users ADD COLUMN country TEXT;

-- Zona IANA, de `request.cf.timezone`. Sin ella, el corte nocturno de D-016 se
-- calcularía en UTC y le llegaría a un niño de México a las seis de la tarde.
ALTER TABLE users ADD COLUMN timezone TEXT;

-- Dónde vive su dato. `EU` manda a la base europea (D-042), `GLOBAL` a la de
-- siempre. Se deriva del país, y una vez escrita **no se cambia sola**: mover
-- datos de menores entre jurisdicciones es un problema legal, no técnico.
ALTER TABLE users ADD COLUMN data_region TEXT NOT NULL DEFAULT 'GLOBAL'
  CHECK (data_region IN ('GLOBAL', 'EU'));

-- Por qué puerta entró. Intención OBSERVADA, no declarada.
ALTER TABLE users ADD COLUMN signup_intent TEXT
  CHECK (signup_intent IN ('PADRE', 'MAESTRO', 'ADULTO_APRENDE'));

-- ---------------------------------------------------------------------------
-- consent_type_catalog — el consentimiento no admite tipos inventados
-- ---------------------------------------------------------------------------
--
-- Un catálogo y no un CHECK con una lista: los tipos de consentimiento cambian
-- con la ley, y cambiar una fila es una migración de datos mientras que cambiar
-- un CHECK es reescribir la tabla en SQLite.
CREATE TABLE consent_type_catalog (
  code        TEXT PRIMARY KEY,
  -- Qué se está consintiendo, en una frase que un padre pueda leer.
  description TEXT NOT NULL,
  -- La base legal, porque «consentimiento» no es la única y confundirlas es el
  -- error más común (mc-25): el interés legítimo NO vale para un menor.
  legal_basis TEXT NOT NULL
              CHECK (legal_basis IN ('CONSENT', 'CONTRACT', 'LEGAL_OBLIGATION')),
  -- Si es obligatorio para que el producto funcione. Lo que no lo es, se puede
  -- rechazar sin perder el servicio — y eso es lo que separa un consentimiento
  -- de un peaje.
  required    INTEGER NOT NULL DEFAULT 0 CHECK (required IN (0, 1)),
  created_at  INTEGER NOT NULL
);

INSERT INTO consent_type_catalog (code, description, legal_basis, required, created_at) VALUES
  ('CHILD_PROFILE',   'Crear un perfil de niño dentro de la cuenta del adulto', 'CONSENT', 1, 0),
  ('LEADERBOARD',     'Aparecer en el tablero global con un alias generado',    'CONSENT', 0, 0),
  ('SCREEN_TIME',     'Guardar el límite de pantalla que el adulto configura',  'CONTRACT', 0, 0),
  ('DATA_RETENTION',  'Conservar el progreso del niño mientras la cuenta viva', 'CONTRACT', 1, 0);

-- ---------------------------------------------------------------------------
-- child_consents — quién consintió qué, y cuándo
-- ---------------------------------------------------------------------------
CREATE TABLE child_consents (
  child_profile_id TEXT NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  consent_code     TEXT NOT NULL REFERENCES consent_type_catalog(code),
  -- Quién dio el consentimiento. Siempre un adulto: un niño no consiente (D-013).
  granted_by       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  granted_at       INTEGER NOT NULL,
  -- Retirar un consentimiento es un derecho, así que tiene columna propia en vez
  -- de borrarse la fila: hace falta poder demostrar cuándo se retiró.
  revoked_at       INTEGER,

  PRIMARY KEY (child_profile_id, consent_code)
);

-- Índice PARCIAL: solo los vigentes. La pregunta que el producto hace mil veces
-- al día es «¿este niño tiene este consentimiento AHORA?», y los retirados solo
-- se consultan en una auditoría.
CREATE INDEX idx_consent_vigente
  ON child_consents (child_profile_id, consent_code)
  WHERE revoked_at IS NULL;

-- El trigger que hace que el catálogo sirva de algo.
--
-- Sin él, `consent_code` acepta cualquier texto que exista en el catálogo… y la
-- clave foránea de SQLite **solo se aplica con `PRAGMA foreign_keys=ON`**, que
-- D1 activa pero un `.sql` corrido a mano puede no tener. El trigger no depende
-- de ningún pragma.
CREATE TRIGGER trg_consent_tipo_conocido
BEFORE INSERT ON child_consents
FOR EACH ROW
WHEN (SELECT COUNT(*) FROM consent_type_catalog WHERE code = NEW.consent_code) = 0
BEGIN
  SELECT RAISE(ABORT, 'consent_code desconocido: no está en consent_type_catalog');
END;

-- ---------------------------------------------------------------------------
-- screen_time_settings — la hora de dormir
-- ---------------------------------------------------------------------------
--
-- Sin `bedtime_local`, el corte nocturno de D-016 no se puede calcular: se sabe
-- cuántos minutos lleva jugando pero no si son las ocho de la noche o las once.
-- Hora local del niño, no UTC — por eso `users.timezone` es de esta migración.
--
-- `NULL` significa «sin corte nocturno», que es distinto de «medianoche».
ALTER TABLE screen_time_settings ADD COLUMN bedtime_local TEXT
  CHECK (bedtime_local IS NULL OR bedtime_local GLOB '[0-2][0-9]:[0-5][0-9]');

-- ---------------------------------------------------------------------------
-- household_devices — D-012 convertido en una fila
-- ---------------------------------------------------------------------------
--
-- D-012 dice cómo entra un niño: en un dispositivo que el adulto ya marcó como
-- de la casa. `/app/kids` no enseña una sola cara si el dispositivo no está aquí.
--
-- El identificador es un token opaco que ponemos nosotros en una cookie, **no**
-- una huella del dispositivo: una huella es biometría de comportamiento y la
-- línea roja #1 la prohíbe.
CREATE TABLE household_devices (
  device_token   TEXT PRIMARY KEY,
  owner_user_id  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- Un apodo que el ADULTO escribe: "la tablet de la sala". No lo escribe un
  -- niño, así que no cruza la línea roja #3.
  label          TEXT NOT NULL,
  approved_at    INTEGER NOT NULL,
  last_seen_at   INTEGER,
  -- Revocar un dispositivo es lo que hace el adulto cuando lo pierde o lo presta.
  revoked_at     INTEGER
);

CREATE INDEX idx_devices_activos
  ON household_devices (owner_user_id)
  WHERE revoked_at IS NULL;

-- ---------------------------------------------------------------------------
-- teacher_verifications — T-5, y es criterio de F2, no de F9
-- ---------------------------------------------------------------------------
--
-- T-5 sigue abierta: nadie verifica de verdad que un adulto que abre un salón
-- sea maestro. D-044 quitó el SMS —Cloudflare no lo ofrece— y eso **no cierra el
-- problema**, solo quita una barrera que no podíamos implementar.
--
-- Lo que esta tabla hace es que el estado sea explícito en vez de implícito: un
-- salón sabe si su dueño está verificado, sin verificar o rechazado, y quien
-- decida qué permitir en cada estado lo decide sobre un dato, no sobre un
-- supuesto.
CREATE TABLE teacher_verifications (
  user_id     TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'SIN_VERIFICAR'
              CHECK (status IN ('SIN_VERIFICAR', 'EN_REVISION', 'VERIFICADO', 'RECHAZADO')),
  -- Cómo se verificó. `DOMINIO_ESCOLAR` es el único automático que tenemos hoy:
  -- un correo en el dominio de una escuela conocida. Los demás son manuales.
  method      TEXT CHECK (method IN ('DOMINIO_ESCOLAR', 'REVISION_MANUAL', 'INVITACION_DE_COLEGA')),
  reviewed_at INTEGER,
  -- Por qué se rechazó, para poder decírselo a la persona. Lo escribe un adulto
  -- del equipo, no un niño.
  note        TEXT
);

-- ---------------------------------------------------------------------------
-- contextual_marks — las cinco marcas contextuales
-- ---------------------------------------------------------------------------
--
-- Las marcas son los momentos en que el producto pide algo o explica algo, y el
-- punto de D-026 es que se piden **en contexto** y no en un carrusel al
-- registrarse. Cada una se dispara una vez por usuario.
CREATE TABLE contextual_marks (
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mark_code  TEXT NOT NULL
             CHECK (mark_code IN (
               'PRIMER_PERFIL',        -- crear el primer perfil de niño
               'PRIMER_RETO',          -- el niño terminó su primer reto
               'LIMITE_PANTALLA',      -- ofrecer configurar el límite (D-016)
               'TABLERO_OPTIN',        -- ofrecer el tablero global (D-040)
               'SEGUNDO_DISPOSITIVO'   -- marcar otro dispositivo de la casa
             )),
  shown_at   INTEGER NOT NULL,
  -- Qué hizo: la aceptó, la rechazó, o la cerró sin decidir. Las tres son
  -- respuestas distintas y tratarlas igual es cómo se acaba insistiendo.
  outcome    TEXT CHECK (outcome IN ('ACEPTO', 'RECHAZO', 'CERRO')),

  PRIMARY KEY (user_id, mark_code)
);

-- ---------------------------------------------------------------------------
-- Lo que esta migración NO hace, dicho aquí para que no se suponga
-- ---------------------------------------------------------------------------
--
-- · **No hay tabla de sesiones.** Las tres cookies opacas de F2 —`mc_s`, `mc_k`,
--   `mc_d`— viven en KV, no en D1: una sesión es un dato efímero de alta
--   escritura, y D1 topa en 10 GB por lo que se escribe, no por lo que se guarda
--   (mc-32 riesgo #1).
--
-- · **No hay tope de perfiles como columna.** La línea roja #4 dice que nunca se
--   cobra por dejar practicar, así que el tope vive como bandera de producto y
--   jamás como restricción de esquema: una restricción aquí sería un `INSERT`
--   que falla, o sea un niño que no puede practicar.
--
-- · **No se crea la fila del tablero.** D-040: el tablero global es opt-in por
--   hijo, así que al crear un perfil **no se inserta** nada en `child_consents`
--   con `LEADERBOARD`. Aparecer requiere un acto, no requiere salirse.
