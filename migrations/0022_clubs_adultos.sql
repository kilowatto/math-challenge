-- 0022 — F10 · Clubs de adultos (D-043, D-117–D-121)
--
-- Solo agrega tablas. El diseño original reservaba 0019, pero 0019 ya está
-- aplicado en este repositorio para reportes de padres; 0016 también es el
-- banco de primaria. No se reutiliza ningún número de migración.

CREATE TABLE adult_club (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name_key TEXT NOT NULL,
  join_code TEXT NOT NULL UNIQUE CHECK (length(join_code) = 6),
  max_size INTEGER NOT NULL DEFAULT 20 CHECK (max_size BETWEEN 1 AND 20),
  created_at INTEGER NOT NULL,
  disabled_at INTEGER
);

CREATE INDEX idx_adult_club_owner ON adult_club (owner_user_id);

CREATE TABLE adult_club_membership (
  id TEXT PRIMARY KEY,
  adult_club_id TEXT NOT NULL REFERENCES adult_club(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  child_profile_id TEXT REFERENCES child_profiles(id) ON DELETE CASCADE,
  approved_by TEXT REFERENCES users(id),
  approved_at INTEGER,
  joined_at INTEGER NOT NULL,
  left_at INTEGER,
  CHECK ((user_id IS NOT NULL) <> (child_profile_id IS NOT NULL)),
  CHECK ((child_profile_id IS NULL) = (approved_by IS NULL)),
  CHECK ((child_profile_id IS NULL) = (approved_at IS NULL))
);

CREATE UNIQUE INDEX idx_adult_club_live_user
  ON adult_club_membership (adult_club_id, user_id)
  WHERE user_id IS NOT NULL AND left_at IS NULL;

CREATE UNIQUE INDEX idx_adult_club_live_child
  ON adult_club_membership (adult_club_id, child_profile_id)
  WHERE child_profile_id IS NOT NULL AND left_at IS NULL;

CREATE INDEX idx_adult_club_membership_club
  ON adult_club_membership (adult_club_id, left_at);

CREATE TABLE club_challenge (
  id TEXT PRIMARY KEY,
  adult_club_id TEXT NOT NULL REFERENCES adult_club(id) ON DELETE CASCADE,
  item_set TEXT NOT NULL,
  nivel INTEGER NOT NULL CHECK (nivel BETWEEN 1 AND 12),
  created_by TEXT NOT NULL REFERENCES users(id),
  starts_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'closed', 'expired')),
  CHECK (expires_at > starts_at),
  CHECK (expires_at - starts_at <= 259200)
);

CREATE INDEX idx_club_challenge_active
  ON club_challenge (adult_club_id, status, expires_at);

CREATE TABLE club_challenge_result (
  challenge_id TEXT NOT NULL REFERENCES club_challenge(id) ON DELETE CASCADE,
  membership_id TEXT NOT NULL REFERENCES adult_club_membership(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
  completed_at INTEGER,
  PRIMARY KEY (challenge_id, membership_id)
);

CREATE TABLE club_stake (
  id TEXT PRIMARY KEY,
  challenge_id TEXT NOT NULL REFERENCES club_challenge(id) ON DELETE CASCADE,
  forma TEXT NOT NULL CHECK (forma IN ('colectiva', 'ganador_elige', 'compromiso_propio')),
  texto TEXT NOT NULL,
  propuesto_por TEXT NOT NULL REFERENCES users(id),
  moderacion TEXT NOT NULL CHECK (moderacion IN ('aprobada', 'rechazada', 'pendiente')),
  created_at INTEGER NOT NULL
);

CREATE TABLE club_stake_acceptance (
  stake_id TEXT NOT NULL REFERENCES club_stake(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  accepted_at INTEGER NOT NULL,
  PRIMARY KEY (stake_id, user_id)
);

CREATE TABLE stake_moderation_log (
  id TEXT PRIMARY KEY,
  stake_id TEXT NOT NULL REFERENCES club_stake(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  veredicto TEXT NOT NULL CHECK (veredicto IN ('pasa', 'rechaza_persona', 'rechaza_contenido')),
  modelo TEXT NOT NULL CHECK (modelo IN ('gpt-oss-120b', 'kimi-k2.6')),
  confianza REAL,
  created_at INTEGER NOT NULL,
  appealed_at INTEGER,
  human_verdict TEXT CHECK (human_verdict IN ('pasa', 'rechaza')),
  reviewed_at INTEGER
);

CREATE INDEX idx_stake_appeals
  ON stake_moderation_log (appealed_at, human_verdict);
