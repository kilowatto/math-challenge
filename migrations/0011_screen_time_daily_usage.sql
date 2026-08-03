-- 0011 — El consumo que faltaba: cuántos minutos lleva HOY (D-016, #267)
--
-- ─── Qué falta hoy en el esquema, y qué NO ─────────────────────────────────
--
-- `screen_time_settings` (0002, ampliada en 0003) guarda la CONFIGURACIÓN: lo
-- que el padre eligió. Tiene ya las cuatro columnas correctas y **no se
-- rediseña**. Lo que no existe en ningún sitio es el CONSUMO — cuántos minutos
-- lleva jugados el niño hoy — y sin ese dato ni el aviso de los 5 minutos ni el
-- corte diario se pueden calcular. Solo el corte nocturno funcionaría con el
-- esquema actual, porque depende de la hora del reloj y no de un acumulado.
--
-- ─── Por qué D1 y no un Durable Object nuevo ───────────────────────────────
--
-- La alternativa obvia era un `math-challenge-screentime-do` por niño, copiando
-- el patrón de `math-challenge-learner-do`. Se descartó:
--
--   · La razón real de un DO por niño en F4 es latencia y consistencia
--     serializada petición a petición: elegir el siguiente ítem exige ver la
--     última respuesta. Sumar minutos no tiene esa exigencia. Dos dispositivos
--     del mismo niño reportando a la vez producen dos sumas correctas, no una
--     carrera que arreglar.
--   · Esta tabla es un ROLLUP —una fila por niño y por día—, el mismo patrón
--     que `score_totals` y `skill_state`, y por eso NO es lo que prohíbe
--     `mc-32` riesgo #1: eso son intentos crudos de alta cardinalidad, que
--     siguen yendo a `math-challenge-attempts-ae` y a ningún otro sitio.
--     `audits/no-attempts-in-d1.mjs` sigue vigilando esa frontera sin cambios.
--   · Cada DO nuevo es un objeto más que inventariar en `docs/infrastructure.md`.
--     Uno que no resuelve un problema de latencia real es costo sin beneficio.
--
-- ─── Qué hace, y qué NO ────────────────────────────────────────────────────
--
-- Solo AGREGA una tabla. No borra, no renombra, no reescribe, no toca
-- `screen_time_settings` ni ninguna otra tabla existente. Sobre una base con
-- filas es indistinguible de sobre una vacía: el primer día que un niño juegue
-- se le crea su fila con `minutes_used = 0`, y a partir de ahí el motor la sube.
--
-- Y una lección que ya costó una vez en este repositorio, escrita aquí para que
-- no cueste dos: **D1 lleva el control de migraciones por NOMBRE DE ARCHIVO**,
-- no por el estado de las tablas. Una migración ya marcada como aplicada no
-- vuelve a correr aunque se edite, así que el cambio se perdería en silencio.
-- Si esta tabla necesita otra columna, se encadena una 0012.
--
-- ─── Por qué la numeración salta de 0008 a 0011 ───────────────────────────
--
-- No falta ninguna migración: 0009 y 0010 están repartidas por el coordinador
-- a dos ramas que se construyen a la vez que ésta (F7 misiones y F7 ligas) y
-- que todavía no mergean. Se declara aquí para que `audits/migration-safety.mjs`
-- distinga este hueco —de reparto— del que de verdad le importa: una migración
-- que ya corrió en algún ambiente y se borró del repo. Ese hueco no lo declara
-- nadie, que es justo lo que lo hace peligroso.
--
-- El renglón se borra solo en cuanto 0009 y 0010 existan: el auditor bloquea si
-- una reserva sigue escrita con el archivo ya en el repositorio.
--
-- migration-safety-reserva: 0009, 0010 — repartidas a F7 misiones y F7 ligas, en construcción paralela; ninguna migración se ha borrado de este repositorio
--
-- Cloudflare: cero recursos nuevos. Todo vive en `math-challenge-db` y su
-- réplica `math-challenge-db-eu`, ya inventariadas en `docs/infrastructure.md`.

-- ---------------------------------------------------------------------------
-- screen_time_daily_usage — una fila por niño y por DÍA LOCAL DEL HOGAR
-- ---------------------------------------------------------------------------
--
-- `local_date` es el día en la zona de `users.timezone` —la del padre dueño de
-- la cuenta—, calculado por `packages/motor/src/racha.ts::diaEfectivo`, que es
-- la misma función que usa la racha. **Jamás la zona del dispositivo del niño**:
-- un límite diario que se reinicia cambiando el huso del teléfono no es un
-- límite, y la racha y el límite tienen que estar de acuerdo sobre qué día es
-- hoy o el corte le rompería el día al niño (línea roja #6).
--
-- No lleva `id` propio: la llave es (niño, día). Un identificador sintético
-- permitiría dos filas para el mismo niño y el mismo día, que es exactamente lo
-- que esta tabla no puede tener — el límite es diario, no por sesión.
CREATE TABLE screen_time_daily_usage (
  child_profile_id    TEXT NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,

  -- 'YYYY-MM-DD' en la zona del hogar. El GLOB es la misma defensa que usa
  -- `bedtime_local` en la 0003: una fecha mal formada aquí desalinea el día del
  -- límite con el día de la racha, y eso no daría error, daría un niño cortado
  -- el día equivocado.
  local_date          TEXT NOT NULL
    CHECK (local_date GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]'),

  -- Minutos jugados hoy, sumados por checkpoints del reloj DEL SERVIDOR. Nunca
  -- un tiempo que mande el cliente: el riesgo no es el puntaje, es que el
  -- límite se evada cambiando el reloj del aparato.
  minutes_used        INTEGER NOT NULL DEFAULT 0 CHECK (minutes_used >= 0),

  -- Minutos desde el último descanso OFRECIDO. Vuelve a 0 al mostrarse la
  -- pantalla de descanso; `minutes_used` no se toca en ese momento, porque el
  -- descanso no cuenta ni a favor ni en contra del límite diario (#271).
  minutes_since_break INTEGER NOT NULL DEFAULT 0 CHECK (minutes_since_break >= 0),

  -- Instante UTC en que se avisó hoy, o NULL. Existe para que el niño que
  -- cierra la app entre el aviso y el corte, y la reabre, no reciba el mismo
  -- aviso otra vez (#270).
  warned_at           INTEGER,

  -- Por qué terminó el día. Enum cerrado, jamás texto libre: la línea roja #3
  -- prohíbe que un niño escriba texto, y `audits/child-free-text.mjs` cubre
  -- esta tabla sin ningún cambio porque escanea por forma de columna, no por
  -- una lista a mano.
  --
  -- Lo lee el panel del padre —«el día terminó por el límite, no por descuido»—
  -- que es un subsistema hermano y no se construye en este PR. La columna se
  -- deja lista para que ese subsistema no tenga que volver a tocar el esquema.
  ended_reason        TEXT CHECK (ended_reason IS NULL OR ended_reason IN ('DAILY_LIMIT', 'BEDTIME')),

  updated_at          INTEGER NOT NULL,

  PRIMARY KEY (child_profile_id, local_date)
);

-- El panel del padre lee «los últimos N días de este niño», que con la llave
-- primaria compuesta ya sale ordenado por (niño, día). No hace falta un índice
-- más: uno que nadie usa es escritura más lenta a cambio de nada.
--
-- Retención y borrado: `ON DELETE CASCADE` sobre `child_profiles`. Borrar el
-- perfil borra esto sin que ningún runbook tenga que acordarse, que es el
-- mismo patrón de toda tabla de niño — `audits/borrado-cuatro-sistemas.mjs`
-- la incluye automáticamente porque escanea las claves foráneas, no una lista.
