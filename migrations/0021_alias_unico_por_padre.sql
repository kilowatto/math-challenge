-- ---------------------------------------------------------------------------
-- 0021 — El alias del niño es único por padre, de verdad y para siempre
-- ---------------------------------------------------------------------------
--
-- Hace cumplir: D-003, issue #259.
--
-- EL BUG QUE ESTA MIGRACIÓN CIERRA.
--
-- `apps/web/src/pages/api/perfil-nuevo.ts` capturaba `/UNIQUE/i` del error de
-- D1 para reintentar con otro alias, y su comentario citaba «la migración
-- 0003» como la que creaba el índice. **En la 0003 no hay ningún índice de
-- alias** — la frase era falsa y el catch parecía código muerto. El índice
-- existe en realidad desde la **0006**, que lo creó al reconstruir
-- `child_profiles` para retirar `birth_month`:
--
--     CREATE UNIQUE INDEX IF NOT EXISTS idx_alias_por_padre
--       ON child_profiles (parent_user_id, alias)
--       WHERE deleted_at IS NULL;
--
-- Entonces, ¿qué hace ESTA migración? Dos cosas que la 0006 no podía hacer:
--
-- 1. DEDUPLICAR lo que ya exista. Si algún ambiente acumuló duplicados mientras
--    no había restricción —o si en producción la 0006 se aplicó a mano y su
--    índice nunca llegó a crearse, que es un estado que este repo no puede
--    ver— el índice no se puede crear encima de filas repetidas. La
--    deduplicación es EXPLÍCITA, determinista y verificable:
--
--      · se CONSERVA el perfil más antiguo de cada grupo (created_at, id);
--      · a los demás se les RENOMBRA el alias con un sufijo derivado de su
--        propio id (`-XXXXXX`, seis caracteres hex del UUID);
--      · NUNCA se borra un perfil. Un alias es una etiqueta generada, no un
--        dato: renombrarlo no pierde nada del niño; borrar el perfil sí.
--
--    Es idempotente: una segunda corrida no encuentra duplicados y no toca
--    nada. Y es segura con cero duplicados: el UPDATE no selecciona filas.
--
-- 2. REAFIRMAR el índice. `IF NOT EXISTS` lo hace inocuo donde la 0006 ya lo
--    creó, y lo GARANTIZA donde por cualquier desincronización de
--    `d1_migrations` no llegó — ahora sí, sobre datos ya deduplicados.
--
-- POR QUÉ POR PADRE Y NO GLOBAL.
--
-- La unicidad es `(parent_user_id, alias)`: dos niños de familias distintas
-- pueden compartir alias; dos hijos del MISMO padre no, porque son los dos
-- perfiles que ese padre ve juntos en su casa y tienen que ser distinguibles.
-- El issue #259 pedía unicidad GLOBAL por el tablero (dos niños con el mismo
-- alias son indistinguibles ahí); esa es una decisión de producto que el
-- orquestador resolvió por padre, y el tablero global tendrá que resolver la
-- ambigüedad en la presentación si alguna vez importa.
--
-- El WHERE `deleted_at IS NULL` importa: un perfil borrado (baja lógica) no
-- bloquea el alias de un hermano nuevo.

-- ── 1. La deduplicación, explícita ──────────────────────────────────────────
--
-- ROW_NUMBER sobre (parent_user_id, alias): el 1 se queda, del 2 en adelante
-- se renombra. El sufijo sale del propio id, así que dos corridas producen el
-- MISMO resultado — y la prueba (`apps/web/src/lib/alias-unico.prueba.mjs`)
-- calcula el sufijo esperado a mano, no con esta misma expresión.
UPDATE child_profiles
SET alias = alias || '-' || upper(substr(replace(id, '-', ''), 1, 6))
WHERE deleted_at IS NULL
  AND id IN (
    SELECT id FROM (
      SELECT id,
             ROW_NUMBER() OVER (
               PARTITION BY parent_user_id, alias
               ORDER BY created_at ASC, id ASC
             ) AS rn
      FROM child_profiles
      WHERE deleted_at IS NULL
    )
    WHERE rn > 1
  );

-- ── 2. El índice, garantizado ───────────────────────────────────────────────
--
-- Mismo índice que la 0006, byte a byte. Si ya existe, no pasa nada; si no
-- existía, ahora sí — sobre datos limpios.
CREATE UNIQUE INDEX IF NOT EXISTS idx_alias_por_padre
  ON child_profiles (parent_user_id, alias)
  WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- Lo que esta migración NO hace
-- ---------------------------------------------------------------------------
--
-- · **No borra ningún perfil.** La deduplicación renombra, nunca elimina: el
--   borrado de datos de un menor va por el runbook de erasure (mc-32 riesgo
--   #7), no por una migración.
-- · **No impone unicidad global.** Es la decisión descrita arriba: el choque
--   entre familias distintas sigue siendo posible y el generador
--   (`packages/motor/src/alias.ts`, ~1,080,000 combinaciones por locale) lo
--   hace raro; el que se prohíbe es el que un padre VERÍA en su propia casa.
-- · **No toca `users.alias`** (el velo del adulto de la 0012): ese alias es
--   nullable y su unicidad es otro problema, de otra fase.
