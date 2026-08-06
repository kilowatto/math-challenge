-- 0023_nucleo_familiar.sql — F12 · núcleo familiar (D-155–D-157)
-- Solo agrega. El hogar no crea una tercera estructura social: el vínculo une
-- cuentas adultas y las vistas mantienen separadas las listas de niños y adultos.

CREATE TABLE household_link (
  id                TEXT PRIMARY KEY,
  user_id           TEXT REFERENCES users(id) ON DELETE CASCADE,
  inviter_user_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invite_code       TEXT NOT NULL UNIQUE,
  created_at        INTEGER NOT NULL,
  accepted_at       INTEGER,
  revoked_at        INTEGER,
  CHECK (user_id IS NULL OR user_id <> inviter_user_id)
);

CREATE UNIQUE INDEX idx_household_link_active_user
  ON household_link(user_id) WHERE revoked_at IS NULL AND user_id IS NOT NULL;
CREATE INDEX idx_household_link_inviter
  ON household_link(inviter_user_id) WHERE revoked_at IS NULL;
CREATE INDEX idx_household_link_code
  ON household_link(invite_code) WHERE revoked_at IS NULL;

CREATE TABLE family_challenge (
  id                TEXT PRIMARY KEY,
  created_by_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_set          TEXT NOT NULL,
  opens_at          INTEGER NOT NULL,
  expires_at        INTEGER NOT NULL,
  created_at        INTEGER NOT NULL,
  CHECK (expires_at > opens_at),
  CHECK (length(item_set) <= 16000)
);

CREATE TABLE family_challenge_result (
  id                  TEXT PRIMARY KEY,
  family_challenge_id TEXT NOT NULL REFERENCES family_challenge(id) ON DELETE CASCADE,
  user_id             TEXT REFERENCES users(id) ON DELETE CASCADE,
  child_profile_id    TEXT REFERENCES child_profiles(id) ON DELETE CASCADE,
  completed_at        INTEGER NOT NULL,
  correct_count       INTEGER NOT NULL CHECK (correct_count >= 0),
  item_count          INTEGER NOT NULL CHECK (item_count > 0),
  CHECK ((user_id IS NOT NULL AND child_profile_id IS NULL) OR
         (user_id IS NULL AND child_profile_id IS NOT NULL))
);

CREATE UNIQUE INDEX idx_family_result_adult
  ON family_challenge_result(family_challenge_id, user_id)
  WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX idx_family_result_child
  ON family_challenge_result(family_challenge_id, child_profile_id)
  WHERE child_profile_id IS NOT NULL;

CREATE TABLE family_cheer (
  id                TEXT PRIMARY KEY,
  from_user_id      TEXT REFERENCES users(id) ON DELETE CASCADE,
  from_child_profile_id TEXT REFERENCES child_profiles(id) ON DELETE CASCADE,
  to_user_id        TEXT REFERENCES users(id) ON DELETE CASCADE,
  to_child_profile_id TEXT REFERENCES child_profiles(id) ON DELETE CASCADE,
  reaction          TEXT NOT NULL CHECK (reaction IN ('animo', 'bien_hecho', 'vamos')),
  created_at        INTEGER NOT NULL,
  CHECK ((from_user_id IS NOT NULL AND from_child_profile_id IS NULL) OR
         (from_user_id IS NULL AND from_child_profile_id IS NOT NULL)),
  CHECK ((to_user_id IS NOT NULL AND to_child_profile_id IS NULL) OR
         (to_user_id IS NULL AND to_child_profile_id IS NOT NULL))
);

CREATE INDEX idx_family_challenge_expiry ON family_challenge(expires_at);
CREATE INDEX idx_family_cheer_target ON family_cheer(to_user_id, to_child_profile_id, created_at);
