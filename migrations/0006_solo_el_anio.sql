-- ---------------------------------------------------------------------------
-- 0006 — Del niño se pide el AÑO, y `birth_month` deja de existir
-- ---------------------------------------------------------------------------
--
-- Hace cumplir: D-053, D-013 (minimización), línea roja #2.
--
-- POR QUÉ ESTA MIGRACIÓN NECESITÓ UNA DECISIÓN DEL DUEÑO.
--
-- `audits/migration-safety.mjs` bloquea quitar una columna de `child_profiles`
-- **sin posibilidad de anulación por comentario**, y esa regla es correcta: el
-- borrado de datos de un menor tiene camino propio (el runbook de erasure de
-- `mc-32` riesgo #7), no una migración.
--
-- Pero esa regla protege contra el caso CONTRARIO al de aquí. Ahí el daño es
-- perder datos de un menor sin querer; **aquí perderlos es el objetivo** — es
-- D-013 funcionando, no fallando.
--
-- El dueño resolvió la tensión el 2026-08-01 con un marcador propio y más
-- estrecho que **exige nombrar la columna**. Un borrado accidental nunca nombra
-- la columna que borra: quien escribe la línea de abajo sabe exactamente qué
-- está quitando. El bloqueo sigue entero para todo lo demás.
--
-- migration-safety-minimizacion: birth_month — D-053: la banda se deriva del AÑO y el mes no alimenta ninguna decisión del producto. Es 12 veces más precisión sobre la identidad de un menor de la que hace falta para nada, y hasta hoy se escribía un 1 que no significaba enero sino «no se preguntó».

PRAGMA foreign_keys=OFF;

CREATE TABLE child_profiles_nueva (
  id             TEXT PRIMARY KEY,
  parent_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Generado por locale y autorado, jamás escrito por el niño (línea roja #3).
  alias          TEXT NOT NULL,
  alias_locale   TEXT NOT NULL,

  -- El año, y solo el año. `birth_month` no viaja: ver el marcador de arriba.
  --
  -- Sigue admitiendo 0, que significa «no se preguntó» — el adulto puede
  -- saltarse el paso con «Ahora no» y el niño practica igual (línea roja #4).
  birth_year     INTEGER NOT NULL,

  theme_band     TEXT NOT NULL CHECK (theme_band IN ('KINDER','PRIMARIA','SECUNDARIA')),
  avatar_parts   TEXT NOT NULL DEFAULT '{}',
  locale         TEXT NOT NULL,
  created_at     INTEGER NOT NULL,
  updated_at     INTEGER NOT NULL,
  deleted_at     INTEGER
);

-- Todas las filas viajan. Lo único que se pierde es una columna, a propósito.
INSERT INTO child_profiles_nueva
  (id, parent_user_id, alias, alias_locale, birth_year, theme_band, avatar_parts, locale, created_at, updated_at, deleted_at)
SELECT
  id, parent_user_id, alias, alias_locale, birth_year, theme_band, avatar_parts, locale, created_at, updated_at, deleted_at
FROM child_profiles;

DROP TABLE child_profiles;

ALTER TABLE child_profiles_nueva RENAME TO child_profiles;

PRAGMA foreign_keys=ON;

-- ---------------------------------------------------------------------------
-- Lo que esta migración NO hace
-- ---------------------------------------------------------------------------
--
-- · **No borra el índice único de alias por padre** — la migración 0003 lo creó
--   sobre `child_profiles`, y una reconstrucción se lleva los índices por
--   delante. Se recrea abajo; sin esto, dos hijos del mismo padre podrían
--   acabar con el mismo alias y ninguno de los dos sabría cuál es cuál.
--
-- · **No toca `birth_year`.** Sigue siendo `NOT NULL` y sigue admitiendo 0 como
--   «no se preguntó». Convertirlo en nullable sería otra reconstrucción a
--   cambio de nada: 0 no es un año y el código ya lo trata así.

CREATE UNIQUE INDEX IF NOT EXISTS idx_alias_por_padre
  ON child_profiles (parent_user_id, alias)
  WHERE deleted_at IS NULL;
