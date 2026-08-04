-- ---------------------------------------------------------------------------
-- 0019 — Los reportes por correo al PADRE: preferencia y snapshot (F8 #287)
-- ---------------------------------------------------------------------------
--
-- Hace cumplir: D-013 (estado acumulado, nunca una fila por evento), D-025,
-- D-026 (la baja es permanente y no se re-pregunta), D-032, D-051 (ningún
-- consentimiento nuevo: la preferencia de cadencia es una entrega de datos ya
-- consentidos bajo DATA_RETENTION/CHILD_PROFILE, no una recolección nueva),
-- D-057 (los reportes son gratis para todo padre), línea roja #2 (el niño
-- nunca es un usuario: el destinatario es `users.email`), mc-32 (riesgo #1:
-- D1 guarda estados, no eventos; riesgo #7: el borrado toca cuatro sistemas).
--
-- Solo AGREGA. No toca, no renombra y no quita ninguna columna de ninguna
-- tabla existente. Va como archivo 0019 porque D1 lleva el control de
-- migraciones POR NOMBRE DE ARCHIVO: una migración ya marcada como aplicada
-- nunca vuelve a correr, y el cambio se perdería en silencio (la lección de
-- la 0008).
--
-- migration-safety-reserva: 0018 — repartida al frente del panel del padre,
-- que se construye en paralelo sobre otra rama y todavía no aterriza en main.
-- Este marcador bloquea en cuanto `migrations/0018_*.sql` exista: la excepción
-- nunca se vuelve permanente.
--
-- ─── La restricción estructural: una fila por ENTIDAD, nunca por envío ─────
--
-- Es el criterio de aceptación #1 del issue #287 y el mismo principio que
-- `score_totals` y `xp_totals`: ninguna de las dos tablas guarda un campo por
-- intento (`itemId`, `rtMs`) ni una fila por correo enviado. Lo que hay que
-- recordar del envío anterior cabe en tres columnas de snapshot; un historial
-- de envíos sería telemetría sobre la familia sin propósito declarado.
-- `audits/no-attempts-in-d1.mjs` lo verifica en cada commit.
--
-- ─── El borrado (mc-32 riesgo #7) es el CASCADE, como en toda tabla hija ───
--
-- Las dos tablas cuelgan de `users` y de `child_profiles` con
-- `ON DELETE CASCADE`: borrar la cuenta o el perfil limpia estas filas en la
-- misma sentencia, sin que ningún runbook tenga que acordarse. Es el mismo
-- patrón que `push_subscription` (0014) y `skill_state` (0002).

-- ---------------------------------------------------------------------------
-- parent_report_settings — la preferencia del PADRE: cadencia, hora y baja
-- ---------------------------------------------------------------------------
--
-- Una fila por cuenta de adulto. La ausencia de fila significa «todavía no se
-- ha necesitado»: la cadencia por defecto es WEEKLY (decisión del dueño del
-- 2026-08-02, #286 pregunta 1 — activada en silencio, sin sexta marca
-- contextual) y la hora por defecto es 8. El ciclo de envío crea la fila la
-- primera vez que va a escribirle a ese hogar, porque necesita el
-- `unsubscribe_token` para el enlace de baja del propio correo.
CREATE TABLE parent_report_settings (
  -- La cuenta del ADULTO. Nunca `child_profile_id`: el correo va al padre
  -- (línea roja #2, mc-19 rec. #3). ON DELETE CASCADE: borrar la cuenta borra
  -- su preferencia sin runbook.
  user_id           TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

  -- Semanal por defecto (dueño, 2026-08-02). OFF es lo que pone la baja de un
  -- toque; MONTHLY es la opción de menor frecuencia que la pantalla de
  -- preferencia ofrece SIN presentarla como alternativa en el flujo de baja
  -- (D-014: ofrecer «¿prefieres reducir la frecuencia?» antes de dejar
  -- cancelar es exactamente el patrón oscuro que `patrones-oscuros` caza).
  cadence           TEXT NOT NULL DEFAULT 'WEEKLY'
                    CHECK (cadence IN ('WEEKLY', 'MONTHLY', 'OFF')),

  -- La hora LOCAL del hogar en que sale el correo, 7..20: la ventana de
  -- silencio de mc-19 rec. #13 (07:00-20:00) aplicada al correo, reusando el
  -- mismo criterio que D-016 usa para no molestar de noche. La zona es
  -- `users.timezone`, jamás la del aparato — la misma regla que la racha.
  send_hour_local   INTEGER NOT NULL DEFAULT 8 CHECK (send_hour_local BETWEEN 7 AND 20),

  -- Instante UTC del último envío CONFIRMADO. Se escribe solo después de que
  -- `env.EMAIL.send()` resolvió, nunca antes (#289): un correo marcado como
  -- enviado que falló es un padre que no vuelve a saber de nosotros en un mes.
  last_sent_at      INTEGER,

  -- El token del enlace de baja de un toque (#290). Opaco y con la entropía
  -- de `nuevoToken()` de `apps/web/src/lib/sesiones.ts` —el mismo estándar
  -- que los tokens de `mc_h`/`mc_s` (D-052)—, generado con
  -- `crypto.getRandomValues`, NUNCA derivado de `user_id` ni de ningún dato
  -- predecible: quien adivine un token puede silenciar el correo de otro
  -- hogar, que es una molestia, no una fuga — pero molestia evitable.
  unsubscribe_token TEXT NOT NULL UNIQUE,

  -- Sello de la baja de un toque. Un INTEGER que solo sabe ir de NULL a un
  -- instante, por la misma razón que `push_recordatorio.silenciado_at` no es
  -- un booleano (0014): un booleano invita a escribir el 0. La reactivación
  -- existe —desde la pantalla de preferencias, con sesión, cambiando la
  -- cadencia— pero ninguna ruta limpia este sello: queda como registro de que
  -- el padre se dio de baja alguna vez (D-026).
  unsubscribed_at   INTEGER,

  updated_at        INTEGER NOT NULL
);

-- El ciclo horario filtra por cadencia y hora local (#289). Sin este índice
-- esa consulta escanea la tabla entera cada hora — el modo de falla de CPU de
-- D1 que mc-32 riesgo #12 manda prevenir ANTES de desplegar, no después.
CREATE INDEX idx_parent_report_settings_ciclo
  ON parent_report_settings (cadence, send_hour_local);

-- ---------------------------------------------------------------------------
-- child_report_state — el snapshot POR HIJO contra el que se mide el periodo
-- ---------------------------------------------------------------------------
--
-- Una fila por perfil de niño. Guarda lo mínimo para contestar «¿qué cambió
-- desde el último correo?» sin recalcular nada: el reporte COMPONE desde las
-- tablas de estado que ya existen (`score_totals`, `xp_totals`,
-- `child_streak`, `skill_state`, `screen_time_daily_usage`) y compara contra
-- este snapshot — nunca contra otro niño (D-025, mc-18, y el auditor
-- `reporte-sin-comparacion.mjs` que vigila esa frontera).
CREATE TABLE child_report_state (
  child_profile_id    TEXT PRIMARY KEY REFERENCES child_profiles(id) ON DELETE CASCADE,

  -- Instante UTC del último reporte confirmado. NULL = nunca se ha enviado:
  -- el primer correo usa la ventana completa de la cadencia.
  last_reported_at    INTEGER,

  -- Los acumulados tal como estaban en el último envío. `puntosGanados` del
  -- próximo correo es la diferencia contra `last_score_all_time` — y si diera
  -- negativo (una temporada reseteada de `score_totals`), el motor puro lo
  -- trata como 0 y lo documenta, nunca deja pasar un número confuso al padre.
  last_score_all_time INTEGER NOT NULL DEFAULT 0,

  -- NULL tiene significado propio: «F7 todavía no ha desplegado `xp_totals`
  -- para este perfil». Nunca 0, porque 0 diría «no ha ganado XP», que es otra
  -- afirmación (#288: «no hay dato» y «el valor es cero» no se confunden).
  last_xp_total       INTEGER,

  updated_at          INTEGER NOT NULL
);

-- ─── Cloudflare: cero recursos nuevos en esta migración ────────────────────
--
-- Las dos tablas viven en `math-challenge-db`, ya inventariada en
-- `docs/infrastructure.md`. Los objetos nuevos del subsistema de envío
-- (`math-challenge-reports-queue` y `math-challenge-reports-dlq`) se declaran
-- en `wrangler.jsonc` y llevan su propio renglón en la bitácora, en el mismo
-- PR (CLAUDE.md § Cloudflare).
--
-- ─── Por qué NO hay `consent_code` nuevo (criterio del issue #287) ─────────
--
-- La preferencia de cadencia no es una recolección nueva de datos: es la
-- entrega, al padre, de datos que ya consintió bajo `DATA_RETENTION` y
-- `CHILD_PROFILE` (D-051: un solo gobierno de consentimientos). Un
-- `consent_code` «REPORTS» fingiría que hay algo nuevo que consentir y
-- abriría una segunda puerta en el catálogo sin hecho nuevo que registrar.
