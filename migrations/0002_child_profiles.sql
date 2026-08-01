-- 0002_child_profiles.sql — el niño como perfil, nunca como usuario
--
-- Decisiones que este esquema hace cumplir:
--   D-013  el niño nunca es un usuario. No hay correo, ni nombre real, ni foto,
--          ni fecha exacta de nacimiento. Solo año y mes.
--   D-012  entra con avatar + PIN de tres imágenes. Sin teclado, sin leer.
--   D-017  el tema visual lo manda la edad; la dificultad la manda la ubicación.
--   D-003  alias generados, nunca escritos por el niño.
--   Línea roja #3: ningún niño escribe texto libre, en ninguna superficie.
--
-- La restricción más importante de este archivo es lo que NO tiene: ni una sola
-- columna donde un niño pueda escribir texto libre.

CREATE TABLE child_profiles (
  id             TEXT PRIMARY KEY,
  parent_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Alias GENERADO, no escrito (D-003, mc-43). Se elige tocando entre 3-5
  -- opciones que produce el generador por locale. El sufijo numérico se
  -- aleatoriza, no se secuencia: "Conejo07" no debe delatar el orden de registro.
  alias          TEXT NOT NULL,
  alias_locale   TEXT NOT NULL
                 CHECK (alias_locale IN ('en','es-MX','es-ES','fr-FR','pt-BR','pt-PT','de-DE')),

  -- Año y mes. NUNCA el día (D-013). Basta para la banda de edad y para el
  -- evento de cruce de 13 años, y es un dato personal menos.
  birth_year     INTEGER NOT NULL,
  birth_month    INTEGER NOT NULL CHECK (birth_month BETWEEN 1 AND 12),

  -- Tema visual, derivado de la edad (D-017). Se guarda además de derivarse
  -- porque el papá puede fijarlo si su hijo prefiere otro, dentro de un rango.
  -- Las edades son 4-6 / 7-11 / 12-17: las mismas que en la tabla de puntuación
  -- y en la de límite de pantalla, después de la corrección de D-024.
  theme_band     TEXT NOT NULL CHECK (theme_band IN ('KINDER','PRIMARIA','SECUNDARIA')),

  -- Avatar armado de piezas predefinidas, nunca foto, nunca cámara (mc-43,
  -- línea roja #1). JSON de índices al catálogo de piezas.
  avatar_parts   TEXT NOT NULL DEFAULT '{}',

  locale         TEXT NOT NULL
                 CHECK (locale IN ('en','es-MX','es-ES','fr-FR','pt-BR','pt-PT','de-DE')),

  created_at     INTEGER NOT NULL,
  updated_at     INTEGER NOT NULL,
  deleted_at     INTEGER
);

CREATE INDEX idx_child_parent ON child_profiles (parent_user_id) WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- child_image_pin — el PIN de tres imágenes (D-012)
-- ---------------------------------------------------------------------------
-- Separa hermanos en un dispositivo compartido. La protección real contra un
-- extraño la da el dispositivo vinculado al hogar, no esto — y decirlo así
-- evita que alguien lo trate como autenticación de verdad.
--
-- Se guarda hasheado igual: no hay razón para poder leer la elección de un niño.
CREATE TABLE child_image_pin (
  child_profile_id TEXT PRIMARY KEY REFERENCES child_profiles(id) ON DELETE CASCADE,
  pin_hash         TEXT NOT NULL,
  created_at       INTEGER NOT NULL,
  updated_at       INTEGER NOT NULL
);

-- ---------------------------------------------------------------------------
-- screen_time_settings — el límite que nunca rompe una racha (D-016, línea #6)
-- ---------------------------------------------------------------------------
-- Los defaults por edad los pone la aplicación, no el esquema, porque la tabla
-- de D-016 es criterio nuestro y no ciencia: solo el tope de 60 min para 2-4
-- años viene de fuente primaria (OMS). El esquema guarda lo que el papá eligió.
CREATE TABLE screen_time_settings (
  child_profile_id  TEXT PRIMARY KEY REFERENCES child_profiles(id) ON DELETE CASCADE,

  daily_minutes     INTEGER NOT NULL,
  break_every_min   INTEGER NOT NULL,
  bedtime_cutoff_min INTEGER NOT NULL,   -- minutos antes de dormir

  updated_at        INTEGER NOT NULL,
  updated_by        TEXT NOT NULL REFERENCES users(id)
);

-- ---------------------------------------------------------------------------
-- skill_state — maestría por habilidad, no por pregunta (mc-05)
-- ---------------------------------------------------------------------------
-- El programador de repaso agenda NODOS DE HABILIDAD, no ítems: las habilidades
-- matemáticas generalizan entre muchas instancias, al revés que una tarjeta.
--
-- El estado en vivo del modelo adaptativo vive en math-challenge-learner-do
-- (un Durable Object por niño); esto es el registro durable que sobrevive al
-- objeto y sirve al panel del padre.
CREATE TABLE skill_state (
  child_profile_id TEXT NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  skill_id         TEXT NOT NULL,

  -- Maestría en dos etapas (mc-05, D-018): 3 correctas seguidas es
  -- "provisionalmente aprendido"; solo cuenta como dominado tras sobrevivir un
  -- repaso espaciado a >=3 días. Tres seguidas en el momento no prueban nada.
  streak_correct   INTEGER NOT NULL DEFAULT 0,
  provisional_at   INTEGER,
  mastered_at      INTEGER,

  -- FSRS-lite: estabilidad y dificultad por habilidad, con arranque en frío
  -- estilo Leitner mientras hay pocos datos (mc-05).
  stability        REAL,
  difficulty       REAL,
  due_at           INTEGER,

  attempts         INTEGER NOT NULL DEFAULT 0,
  updated_at       INTEGER NOT NULL,

  PRIMARY KEY (child_profile_id, skill_id)
);

CREATE INDEX idx_skill_due ON skill_state (child_profile_id, due_at);

-- ---------------------------------------------------------------------------
-- score_totals — acumulados, nunca intentos (D-025, mc-32)
-- ---------------------------------------------------------------------------
-- Los intentos crudos van a Analytics Engine. Esta tabla es el rollup que
-- alimenta el tablero, refrescado por lotes cada 30-60 s, jamás por intento.
--
-- El tablero global ordena por PUNTOS, no por habilidad estimada (D-025). Es una
-- decisión tomada contra la recomendación de mc-18, con su razón escrita y con
-- disparador de revisión a >=200 respuestas por ítem.
CREATE TABLE score_totals (
  child_profile_id TEXT NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  period           TEXT NOT NULL,   -- 'all_time' | 'season:<id>'
  theme_band       TEXT NOT NULL,

  total_score      INTEGER NOT NULL DEFAULT 0,
  updated_at       INTEGER NOT NULL,

  PRIMARY KEY (child_profile_id, period)
);

-- Índice compuesto obligatorio: sin él, esta consulta pega en el modo de falla
-- de tiempo de CPU de D1 conforme crece la tabla (mc-32, riesgo #12).
-- Verificar con EXPLAIN QUERY PLAN antes de desplegar, no después de un incidente.
CREATE INDEX idx_score_rank ON score_totals (period, theme_band, total_score DESC);
