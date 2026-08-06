-- 0024 — F12 · conflicto de vínculo y modalidad del reto (D-155–D-157)
-- Solo agrega columnas: la revocación conserva quién ganó el conflicto.

ALTER TABLE household_link ADD COLUMN revoked_by_user_id TEXT REFERENCES users(id);
ALTER TABLE family_challenge ADD COLUMN kind TEXT NOT NULL DEFAULT 'daily'
  CHECK (kind IN ('daily', 'duel', 'weekly'));

CREATE INDEX idx_household_link_revoked_by
  ON household_link(revoked_by_user_id) WHERE revoked_at IS NOT NULL;
