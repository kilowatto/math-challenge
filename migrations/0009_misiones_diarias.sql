-- ---------------------------------------------------------------------------
-- 0009 — Misiones diarias: una fila por misión y por día, jamás por intento
-- ---------------------------------------------------------------------------
--
-- Hace cumplir: D-014 (misiones diarias en la lista blanca), líneas rojas #3,
-- #4 y #5, D-013, mc-32 riesgo #1, #211, #216, #217, #219, #225, #226.
--
-- Solo AGREGA. No toca, no renombra y no quita ninguna columna de ninguna tabla
-- existente — `audits/migration-safety.mjs` no necesita ninguna anulación aquí.
--
-- Va como archivo 0009 y no como edición de una migración anterior porque **D1
-- lleva el control de migraciones POR NOMBRE DE ARCHIVO**, no por el estado de
-- las tablas: una migración ya marcada como aplicada nunca vuelve a correr, y
-- el cambio se perdería en silencio. Es la lección que costó la 0008.
--
-- ─── Por qué esta tabla no es una tabla de intentos ────────────────────────
--
-- `mc-32` riesgo #1: D1 topa en 10 GB por base, y es el único límite de la
-- arquitectura que se alcanza por un error de diseño y no por crecimiento. La
-- llave de esta tabla es `(aprendiz, día local, tipo de misión)` — como mucho
-- tres filas por persona y por día, no una por cada respuesta. Los intentos
-- crudos van a `math-challenge-attempts-ae` (Analytics Engine).
--
-- El progreso se guarda como **estado**, no como bitácora: `progress` es un
-- entero que sube, y `packages/motor/src/misiones.ts::avanzarMision()` es quien
-- lo calcula. Una fila por evento de progreso sería la tabla por intento con
-- otro nombre.
--
-- ─── Lo que esta tabla NO tiene, y no es que esté vacío: no existe ─────────
--
--  · **Ninguna columna de precio, moneda, cupón, SKU ni plan.** Línea roja #4:
--    nunca se cobra por dejar que un niño practique, así que ninguna misión
--    puede estar detrás de un pago. `audits/mision-recompensa-deterministica.mjs`
--    bloquea el commit que agregue una.
--  · **Ninguna columna de probabilidad, rareza o peso aleatorio.** Línea roja
--    #5. La recompensa es fija y publicada: `xp_awarded` sale de la tabla de
--    `packages/motor/src/xp.ts`, no de una tirada. D-014 prohíbe por su letra la
--    recompensa aleatoria de PAGO; `mc-17` (implicación 3) y `mc-43` (hallazgo
--    5) son explícitos en que el refuerzo de razón variable no necesita dinero
--    para funcionar sobre un niño, así que aquí se prohíbe entera.
--  · **Ninguna columna de texto libre.** Línea roja #3. `mission_type` es TEXT
--    con un CHECK que lo acota a los diez tipos del catálogo cerrado, y los
--    textos de cara a la persona viven en los archivos de locale — aquí viaja la
--    clave, nunca el valor.
--  · **Ninguna columna de puntos de tablero.** #225 y D-055: XP y puntos son dos
--    monedas y ninguna se cambia por la otra. Esta tabla guarda XP otorgado y no
--    sabe que `score_totals` existe.
--
-- ─── Polimórfica, igual que `child_streak` y `xp_totals` ──────────────────
--
-- SERIO/JR/PRO son bandas de adulto aprendiz (D-034) sin `child_profiles`
-- detrás, y las misiones diarias son de PRIMARIA en adelante — o sea que el
-- adulto es el caso con contenido HOY, no el raro. El CHECK obliga a que el
-- dueño sea exactamente uno de los dos, nunca los dos ni ninguno.
--
-- **KINDER no escribe aquí.** Su «misión diaria» es el reto HISTORIA del día en
-- la Sabana (D-019): una etiqueta interna sobre lo que F5/F6 ya construyen, sin
-- UI, sin texto y sin audio nuevos. `elegirMisionesDelDia()` devuelve una lista
-- vacía para KINDER, así que no hay fila que insertar. Y kinder está aplazado
-- (D-073), lo cual hace de esto la forma del hueco y no una promesa.
--
-- ─── Cloudflare: cero recursos nuevos ─────────────────────────────────────
--
-- Todo vive en `math-challenge-db` y su réplica `math-challenge-db-eu`, ya
-- inventariadas en `docs/infrastructure.md`. El renglón de esta migración sí se
-- escribe ahí, en el mismo PR (CLAUDE.md § Cloudflare).

CREATE TABLE mission_daily_summary (
  id               TEXT PRIMARY KEY,

  child_profile_id TEXT REFERENCES child_profiles(id) ON DELETE CASCADE,
  user_id          TEXT REFERENCES users(id) ON DELETE CASCADE,

  -- El día LOCAL del hogar, `YYYY-MM-DD`, jamás un instante UTC. Lo produce
  -- `packages/motor/src/racha.ts::diaEfectivo()`, que es la única puerta entre
  -- un instante y un día — la misma que usa la racha, para que «hoy» signifique
  -- lo mismo en los dos subsistemas. Guardar un epoch obligaría a decidir la
  -- zona al leer, y quien lee no siempre sabe de qué hogar es la fila.
  local_date       TEXT NOT NULL,

  -- El catálogo cerrado de diez tipos. El CHECK está aquí y no solo en el
  -- código por la misma razón que `shields_available` lleva el suyo: una fila
  -- escrita por otra vía con un tipo que el motor no conoce sería una misión
  -- que nadie puede completar y que nadie sabe que no puede completarse.
  mission_type     TEXT NOT NULL CHECK (mission_type IN (
    'volumen', 'variedad', 'repaso', 'dominio', 'problema',
    'fluidez', 'precision', 'descubre', 'duelo', 'meta_de_liga'
  )),

  target           INTEGER NOT NULL CHECK (target > 0),
  progress         INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0),
  completed        INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)),

  -- El XP que esta misión otorgó, una sola vez, con el valor fijo del catálogo.
  -- No puede ser negativo y el motor no lo devuelve nunca: el XP no baja (D-055).
  xp_awarded       INTEGER NOT NULL DEFAULT 0 CHECK (xp_awarded >= 0),

  updated_at       INTEGER NOT NULL,

  -- Exactamente un dueño: un perfil de niño o una cuenta de adulto aprendiz.
  CHECK ((child_profile_id IS NOT NULL) <> (user_id IS NOT NULL)),
  -- El progreso no pasa de la meta. `avanzarMision()` ya lo capa, y esto es la
  -- mitad que sobrevive a una escritura por otra vía.
  CHECK (progress <= target)
);

-- Una fila por (aprendiz, día, tipo), y la base lo obliga. Sin esto, dos
-- cierres de reto concurrentes del mismo niño crean dos progresos para la misma
-- misión y el que se lea depende del orden — que es cómo un número se vuelve
-- irreproducible sin que nadie mienta. Es también lo que hace que el
-- `ON CONFLICT` de `SQL_UPSERT_MISION` tenga a qué agarrarse.
CREATE UNIQUE INDEX idx_mission_daily_perfil
  ON mission_daily_summary (child_profile_id, local_date, mission_type)
  WHERE child_profile_id IS NOT NULL;
CREATE UNIQUE INDEX idx_mission_daily_usuario
  ON mission_daily_summary (user_id, local_date, mission_type)
  WHERE user_id IS NOT NULL;
