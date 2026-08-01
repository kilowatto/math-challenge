-- Verificación de punta a punta del rollup a D1 (criterio #35 de F3).
--
-- Corre contra una D1 LOCAL, nunca contra producción: crea un perfil de niño, y
-- un perfil de niño en la base real es un dato de menor que nadie pidió.
--
--   cd apps/ingest
--   npx wrangler d1 execute math-challenge-db --local --env-file /tmp/vacio.env \
--     --file ../../scripts/verificacion/rollup-e2e.sql
--
-- Por qué hace falta un perfil real: `score_totals.child_profile_id` referencia
-- a `child_profiles(id)`, y la clave foránea rechazó la primera prueba de humo
-- con un niño inventado — `D1_ERROR: FOREIGN KEY constraint failed`. Esa
-- restricción es correcta y se queda; lo que hay que hacer es probar con datos
-- que la respeten.

DELETE FROM score_totals WHERE child_profile_id = 'e2e-nino';
DELETE FROM child_profiles WHERE id = 'e2e-nino';
DELETE FROM users WHERE id = 'e2e-papa';

INSERT INTO users (id, email, email_verified, locale, is_learner, created_at, updated_at)
VALUES ('e2e-papa', 'e2e@ejemplo.invalid', 0, 'es-MX', 0, 0, 0);

-- Sin nombre real, sin correo, sin foto, sin día de nacimiento: año y mes bastan
-- para la banda y para el cruce de 13 años, y son un dato personal menos (D-013).
INSERT INTO child_profiles
  (id, parent_user_id, alias, alias_locale, birth_year, birth_month,
   theme_band, avatar_parts, locale, created_at, updated_at)
VALUES
  ('e2e-nino', 'e2e-papa', 'Conejo07', 'es-MX', 2021, 6,
   'KINDER', '{}', 'es-MX', 0, 0);

-- Tres lotes seguidos sobre la MISMA fila. Lo que se comprueba no es que
-- inserte: es que el segundo y el tercero SUMEN en vez de pisar. El upsert manda
-- el incremento y no el total, porque entre leer y escribir cabe otro lote.
INSERT INTO score_totals (child_profile_id, period, theme_band, total_score, updated_at)
VALUES ('e2e-nino', 'all_time', 'KINDER', 10, 1)
ON CONFLICT (child_profile_id, period) DO UPDATE SET
  total_score = total_score + excluded.total_score,
  theme_band  = excluded.theme_band,
  updated_at  = excluded.updated_at;

INSERT INTO score_totals (child_profile_id, period, theme_band, total_score, updated_at)
VALUES ('e2e-nino', 'all_time', 'KINDER', 16, 2)
ON CONFLICT (child_profile_id, period) DO UPDATE SET
  total_score = total_score + excluded.total_score,
  theme_band  = excluded.theme_band,
  updated_at  = excluded.updated_at;

INSERT INTO score_totals (child_profile_id, period, theme_band, total_score, updated_at)
VALUES ('e2e-nino', 'all_time', 'KINDER', 4, 3)
ON CONFLICT (child_profile_id, period) DO UPDATE SET
  total_score = total_score + excluded.total_score,
  theme_band  = excluded.theme_band,
  updated_at  = excluded.updated_at;

-- 10 + 16 + 4 = 30 en UNA fila. Si diera 4, el upsert estaría pisando.
SELECT
  (SELECT COUNT(*) FROM score_totals WHERE child_profile_id = 'e2e-nino') AS filas,
  (SELECT total_score FROM score_totals WHERE child_profile_id = 'e2e-nino') AS total,
  (SELECT COUNT(*) FROM sqlite_master
     WHERE type = 'table' AND (name LIKE '%attempt%' OR name LIKE '%intento%')) AS tablas_por_intento;
