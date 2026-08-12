-- ---------------------------------------------------------------------------
-- 0028 — skill_state gana bioma: Mundo Kinder multi-bioma
-- ---------------------------------------------------------------------------
--
-- Hace cumplir: docs/planes/2026-08-09-mundo-kinder-multi-bioma.md, decisión
-- "dominio independiente por bioma" (2026-08-10).
--
-- POR QUÉ.
--
-- Mundo Kinder tendrá 4 biomas (Sabana, Desierto, Nieve, Costa), cada uno con
-- las mismas 14 habilidades. El dueño decidió que dominar K01 en Desierto NO
-- domina K01 en Sabana — son dos progresos independientes, no el mismo
-- número visto dos veces. La llave de esta tabla era `(child_profile_id,
-- skill_id)`; sin una tercera columna, las filas de los cuatro biomas
-- colisionarían en una sola.
--
-- SQLite no permite `ALTER TABLE` sobre una `PRIMARY KEY` — se reconstruye
-- la tabla completa: se crea la nueva con la llave de tres columnas, se
-- copian las filas existentes con `bioma = 'sabana'` (el único mundo que
-- existía antes de este cambio — nunca se inventa un bioma para una fila
-- vieja), se borra la vieja y se renombra.
--
-- UN HALLAZGO HONESTO, DICHO AQUÍ Y NO ESCONDIDO.
--
-- Al escribir esta migración, ningún camino de producción escribe en
-- `skill_state` — el único `INSERT` de todo el repo vive en un fixture de
-- prueba (`apps/web/src/lib/padre-panel.prueba.mjs`). El dominio REAL de un
-- niño vive en el Durable Object `Aprendiz`
-- (`apps/web/src/lib/aprendiz.ts`), en su propio almacenamiento de SQLite,
-- con llaves `hab:<skill_id>:<bioma>` — ESE es el cambio que de verdad
-- protege datos en vivo. Esta migración mantiene `skill_state` consistente
-- con la forma del DO por si algún día alguien la llena de verdad (F4,
-- pendiente) — no porque haya filas reales que proteger hoy. Por eso el
-- `INSERT ... SELECT` de abajo es seguro incluso si termina copiando cero
-- filas.

-- ── 1. La tabla nueva, con la llave de tres columnas ────────────────────────
CREATE TABLE skill_state_nueva (
  child_profile_id TEXT NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  skill_id         TEXT NOT NULL,
  -- Mundo Kinder multi-bioma. PRIMARIA/SECUNDARIA no tienen bioma — caen
  -- aquí por el mismo motivo que las filas viejas: es el único mundo que
  -- existía antes de que hubiera más de uno.
  bioma            TEXT NOT NULL DEFAULT 'sabana',

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

  PRIMARY KEY (child_profile_id, skill_id, bioma)
);

-- ── 2. Copiar lo que exista, con bioma = 'sabana' ───────────────────────────
INSERT INTO skill_state_nueva
  (child_profile_id, skill_id, bioma, streak_correct, provisional_at,
   mastered_at, stability, difficulty, due_at, attempts, updated_at)
SELECT
  child_profile_id, skill_id, 'sabana', streak_correct, provisional_at,
  mastered_at, stability, difficulty, due_at, attempts, updated_at
FROM skill_state;

-- ── 3. Reemplazar ────────────────────────────────────────────────────────
DROP TABLE skill_state;
ALTER TABLE skill_state_nueva RENAME TO skill_state;

-- ── 4. Los índices, redefinidos con bioma ───────────────────────────────────
--
-- El selector adaptativo y el panel del padre siempre preguntan por un
-- bioma a la vez (el mapa que se está viendo) — `bioma` va primero en
-- `idx_skill_due` por la misma razón que `item_bank` pone `banda` primero
-- en su índice de lectura (0016): es el filtro más ancho, el que descarta
-- más filas antes de tocar las demás columnas.
CREATE INDEX idx_skill_due ON skill_state (child_profile_id, bioma, due_at);
CREATE INDEX idx_skill_mastered ON skill_state (child_profile_id, bioma, mastered_at);

-- ---------------------------------------------------------------------------
-- Lo que esta migración NO hace
-- ---------------------------------------------------------------------------
--
-- · **No migra datos vivos reales** — no los hay, ver el hallazgo de arriba.
-- · **No encadena `bloqueado` entre biomas** en el mapa — eso vive en
--   `packages/motor/src/mapa.ts` y no es probable hasta que exista un
--   segundo bioma jugable de verdad (hoy solo Desierto).
-- · **No toca el Durable Object `Aprendiz`** — ese cambio de código vive en
--   `apps/web/src/lib/aprendiz.ts`, ya hecho por separado; esta migración
--   solo mantiene la tabla D1 consistente con su forma.
