-- ---------------------------------------------------------------------------
-- 0007 — La racha y el XP: dos ejes nuevos, ninguno del tablero
-- ---------------------------------------------------------------------------
--
-- Hace cumplir: D-014 (línea roja #6), D-016, D-025, D-055, #192, #201, #225.
--
-- Solo AGREGA. No toca, no renombra y no quita ninguna columna de ninguna tabla
-- existente — `audits/migration-safety.mjs` no necesita ninguna anulación aquí,
-- y eso es a propósito: las dos tablas son nuevas y no hay nada que reconstruir.
--
-- ─── Por qué son DOS tablas y no una, ni una columna en `score_totals` ──────
--
-- D-055 lo decidió después de que dos sesiones construyeran cosas incompatibles
-- en la misma tanda. Tres columnas de esta migración lo explican mejor que un
-- párrafo:
--
--   · `score_totals` tiene `period` y `theme_band`. Se resetea por temporada y
--     se ordena por banda, porque su trabajo es rankear.
--   · `xp_totals` no tiene ninguna de las dos, y no es un olvido: el XP es de
--     por vida y no ordena a nadie. Ponerle un `period` sería la primera mitad
--     de mezclarlas.
--   · `child_streak` no tiene ninguna de las tres. La racha no es una métrica
--     de ranking (D-025) — mide presencia, no volumen ni dificultad.
--
-- Y ninguna de las tres tablas tiene una columna que sume otra: no hay
-- conversión de XP a puntos ni al revés (#225). `audits/motor-xp.mjs` bloquea el
-- commit que escriba la primera.
--
-- ─── Ninguna es una tabla por intento (mc-32 riesgo #1) ─────────────────────
--
-- Una fila por niño en las dos. Los intentos crudos van a Analytics Engine.
-- `audits/no-attempts-in-d1.mjs` lo vigila y pasa sobre esta migración.
--
-- ─── Cloudflare: cero recursos nuevos ───────────────────────────────────────
--
-- Todo vive en `math-challenge-db` y su réplica `math-challenge-db-eu`, ya
-- inventariadas en `docs/infrastructure.md`. No hace falta ningún renglón nuevo
-- en la bitácora, y se dice aquí en vez de suponerlo en silencio (CLAUDE.md
-- § Cloudflare).

-- ---------------------------------------------------------------------------
-- child_streak — una fila por perfil, escrita una vez por día efectivo (#201)
-- ---------------------------------------------------------------------------
--
-- Polimórfica a propósito, mismo patrón que `xp_totals` de abajo: SERIO/JR/PRO
-- son bandas de adulto aprendiz (D-034) sin `child_profiles` detrás, y D-014
-- lista la racha como garantía universal, no solo de niño. El `CHECK` obliga a
-- que sea exactamente una de las dos, nunca las dos ni ninguna.
--
-- `last_completed_local_date` es TEXT `'YYYY-MM-DD'` **en la zona del hogar**
-- (`users.timezone`, la misma columna que D-016 usa para el corte nocturno), y
-- jamás un instante UTC. `packages/motor/src/racha.ts::diaEfectivo()` es la
-- única puerta que lo produce. Guardar un epoch aquí obligaría a decidir la zona
-- al leer, y quien lee no siempre sabe de qué hogar es la fila.
--
-- `shields_available` lleva su tope en un CHECK y no solo en el código: el tope
-- de 2 de D-014/#203 es una promesa al padre, y una promesa que solo vive en un
-- `Math.min()` se rompe el día que alguien escriba la fila por otra vía.
--
-- NO hay columna de precio, de moneda, de cupón ni de transacción, y no es que
-- estén vacías: no existen. Línea roja #6 — la protección de racha jamás se
-- vende. `audits/racha-nunca-se-vende.mjs` bloquea el commit que agregue una.
--
-- NO hay columna de texto libre. La categoría de pausa de #204 («viaje»,
-- «enfermedad», «otro») queda deliberadamente fuera de esta migración: sería un
-- campo más que guardar, explicar y borrar, y `declararPausa()` funciona sin
-- ella. Si el dueño la quiere, entra como enumeración cerrada en un CHECK, nunca
-- como TEXT libre (línea roja #3 para el niño, y minimización de D-013 para el
-- padre).
CREATE TABLE child_streak (
  id                        TEXT PRIMARY KEY,

  child_profile_id          TEXT REFERENCES child_profiles(id) ON DELETE CASCADE,
  user_id                   TEXT REFERENCES users(id) ON DELETE CASCADE,

  current_streak            INTEGER NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
  -- Nunca baja. Es el «contador de mejor marca personal» de mc-17 §83: lo único
  -- que la racha puede decir sin lenguaje de pérdida es cuánto llegaste a hacer.
  max_streak                INTEGER NOT NULL DEFAULT 0 CHECK (max_streak >= 0),

  last_completed_local_date TEXT,
  shields_available         INTEGER NOT NULL DEFAULT 0 CHECK (shields_available BETWEEN 0 AND 2),
  shields_earned_total      INTEGER NOT NULL DEFAULT 0 CHECK (shields_earned_total >= 0),

  pause_until_local_date    TEXT,
  pause_uses_this_year      INTEGER NOT NULL DEFAULT 0 CHECK (pause_uses_this_year BETWEEN 0 AND 4),
  pause_year                INTEGER,

  updated_at                INTEGER NOT NULL,

  -- Exactamente un dueño: un perfil de niño o una cuenta de adulto aprendiz.
  CHECK ((child_profile_id IS NOT NULL) <> (user_id IS NOT NULL)),
  -- La mejor marca no puede ser menor que la actual. Es la única forma de que
  -- una escritura fuera del motor se note al escribirla y no seis meses después.
  CHECK (max_streak >= current_streak)
);

-- Una fila por perfil, y la base lo obliga. Sin esto, dos cierres de reto
-- concurrentes del mismo niño crean dos rachas y la que se lea depende del
-- orden — que es cómo un número se vuelve irreproducible sin que nadie mienta.
CREATE UNIQUE INDEX idx_child_streak_perfil ON child_streak (child_profile_id)
  WHERE child_profile_id IS NOT NULL;
CREATE UNIQUE INDEX idx_child_streak_usuario ON child_streak (user_id)
  WHERE user_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- xp_totals — el eje de progreso personal, de por vida (#192, D-055)
-- ---------------------------------------------------------------------------
--
-- Sin `period` y sin `theme_band`, a diferencia de `score_totals`: el XP no se
-- resetea por temporada y no ordena a nadie. Ver la nota de arriba.
--
-- **Sin columna `rango`, y esto es un criterio de aceptación, no una omisión.**
-- El rango se DERIVA de `total_xp` al leer, con `rangoDeXp()` de
-- `packages/motor/src/xp.ts`. Guardarlo sería guardar dos veces el mismo hecho,
-- y `RANGO_ESCALA` lleva escrita su condición de revisión: se recalibra con
-- datos reales de producción. El día que se recalibre, miles de filas estarían
-- afirmando un rango que la fórmula ya no da, y nadie sabría cuál de los dos
-- números es el bueno.
--
-- `total_xp` no puede bajar, y el CHECK solo puede comprobar la mitad de eso
-- (que no sea negativo). La otra mitad la sostiene el upsert de `xp.ts`, que
-- suma un delta no negativo en vez de escribir un total.
CREATE TABLE xp_totals (
  child_profile_id TEXT REFERENCES child_profiles(id) ON DELETE CASCADE,
  user_id          TEXT REFERENCES users(id) ON DELETE CASCADE,

  total_xp         INTEGER NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
  updated_at       INTEGER NOT NULL,

  CHECK ((child_profile_id IS NOT NULL) <> (user_id IS NOT NULL))
);

CREATE UNIQUE INDEX idx_xp_totals_perfil ON xp_totals (child_profile_id)
  WHERE child_profile_id IS NOT NULL;
CREATE UNIQUE INDEX idx_xp_totals_usuario ON xp_totals (user_id)
  WHERE user_id IS NOT NULL;
