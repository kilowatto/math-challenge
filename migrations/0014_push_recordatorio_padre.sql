-- ---------------------------------------------------------------------------
-- 0014 — El recordatorio permitido: Web Push al PADRE, nunca al niño (F7 #207)
-- ---------------------------------------------------------------------------
--
-- Hace cumplir: D-014 («notificaciones con culpa», prohibición por nombre),
-- D-016 (la ventana de pantalla la aprueba el padre), D-026 (una marca
-- descartada no reaparece: el silencio es permanente y no se re-pregunta),
-- D-105 (el mecanismo se construye en el cierre de F7, no se aplaza a F8),
-- línea roja #2 (el niño nunca es un usuario) y #6, mc-19 (rec. #3: al canal
-- del padre; rec. #4: tope de 1/día; rec. #13: horas de silencio; rec. #14:
-- cerca de la ventana de pantalla aprobada).
--
-- Solo AGREGA. No toca, no renombra y no quita ninguna columna de ninguna tabla
-- existente. Va como archivo 0014 porque D1 lleva el control de migraciones
-- POR NOMBRE DE ARCHIVO: una migración ya marcada como aplicada nunca vuelve
-- a correr, y el cambio se perdería en silencio (la lección de la 0008).
--
-- (La 0013 era de este frente una reserva `migration-safety-reserva` mientras
-- kinder la construía en paralelo; aterrizó en `main` y el marcador se borró
-- aquí mismo, como el mecanismo exige: la excepción nunca se vuelve permanente.)
--
-- ─── La restricción estructural: NO EXISTE child_profile_id aquí ───────────
--
-- Es literalmente el criterio de aceptación #1 del issue #207: ninguna ruta de
-- envío de push toma `childProfileId` como destinatario. La suscripción es del
-- ADULTO (`user_id` → `users`), el tope es por HOGAR (la cuenta del adulto) y
-- el silencio es del ADULTO. Que un hijo complete o no su meta se consulta en
-- la capa de decisión (`apps/web/src/lib/push-hogares.ts`) como un agregado —
-- un conteo, jamás un identificador— y viaja al decisor puro
-- (`packages/motor/src/recordatorio.ts`) ya convertido en números.
--
-- `audits/recordatorio-sin-culpa.mjs` bloquea el commit que añada la columna
-- o la referencia en el camino de envío. No es que la columna esté vacía:
-- es que no existe, igual que `companion_state` no tiene hambre (0010): lo que
-- no existe no se puede llenar por otra vía.
--
-- ─── Por qué dos tablas y no una ───────────────────────────────────────────
--
-- `push_subscription` es por APARATO: un padre con teléfono y laptop tiene dos
-- endpoints, y cada endpoint puede morir por su cuenta (el servicio de push
-- devuelve 404/410 y se borra solo esa fila). `push_recordatorio` es por
-- HOGAR: el tope de UN push al día y el silencio permanente no son del
-- aparato, son de la cuenta — si fueran del aparato, el padre con dos
-- aparatos recibiría dos pushes al día, que es exactamente lo que mc-19
-- rec. #4 prohíbe.

-- ---------------------------------------------------------------------------
-- push_subscription — un endpoint Web Push del ADULTO, por aparato
-- ---------------------------------------------------------------------------
--
-- El endpoint y las claves son del navegador del padre (las genera el
-- `pushManager` del service worker al aceptar el *soft-ask*). Son secretos de
-- transporte: quien posee el endpoint puede empujar a ese aparato, así que se
-- tratan con el mismo cuidado que un token de sesión — nunca se devuelven en
-- ninguna respuesta de la API una vez guardados.
CREATE TABLE push_subscription (
  id               TEXT PRIMARY KEY,

  -- La cuenta del ADULTO. Nunca `child_profile_id`: el destinatario del
  -- recordatorio es el padre, por diseño y por auditor (issue #207, mc-19
  -- rec. #3). ON DELETE CASCADE: borrar la cuenta borra sus suscripciones sin
  -- que ningún runbook tenga que acordarse — el mismo patrón que toda tabla
  -- que cuelga de `users`.
  user_id          TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- La URL que entrega el servicio de push del navegador. UNIQUE: si el mismo
  -- aparato se vuelve a suscribir, es la MISMA suscripción y se actualiza —
  -- no una fila nueva que enviaría el recordatorio dos veces al mismo
  -- teléfono, rompiendo el tope por la puerta de atrás.
  endpoint         TEXT NOT NULL UNIQUE,

  -- Las claves del par ECDH del suscriptor (RFC 8291). Se guardan aunque el
  -- envío de hoy sea un «tickle» sin payload —el cuerpo del mensaje lo pide el
  -- service worker a `/api/push-mensaje`, decisión documentada en el PR—
  -- porque el día que el payload viaje cifrado en el push, estas claves son
  -- las que lo cifran y exigirlas desde ya evita una migración de esquema en
  -- caliente.
  p256dh           TEXT NOT NULL,
  auth             TEXT NOT NULL,

  created_at       INTEGER NOT NULL,
  updated_at       INTEGER NOT NULL
);

CREATE INDEX idx_push_subscription_usuario ON push_subscription (user_id);

-- ---------------------------------------------------------------------------
-- push_recordatorio — el estado del recordatorio POR HOGAR: tope y silencio
-- ---------------------------------------------------------------------------
--
-- Una fila por cuenta de adulto, creada la primera vez que hace falta (al
-- silenciar o al enviar). La ausencia de fila significa «ni silenciado ni
-- enviado hoy», que es el estado de toda cuenta nueva.
CREATE TABLE push_recordatorio (
  user_id              TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

  -- El tope de 1 push al día por hogar (mc-19 rec. #4, issue #207):
  -- `UN_PUSH_POR_HOGAR_POR_DIA = 1` en `packages/motor/src/recordatorio.ts`.
  -- Se guarda el DÍA LOCAL DEL HOGAR del último envío —'YYYY-MM-DD' en la zona
  -- de `users.timezone`, calculado por `racha.ts::diaEfectivo`— y jamás un
  -- instante UTC: «hoy» tiene que significar lo mismo aquí que en la racha y
  -- en el límite de pantalla, o el tope se reiniciaría a medianoche UTC para
  -- una familia de Ciudad de México a las 18:00 de su tarde.
  --
  -- El GLOB es la misma defensa que `screen_time_daily_usage.local_date` en la
  -- 0011: una fecha mal formada aquí no daría error, daría un tope que no
  -- topa.
  last_sent_local_date TEXT
    CHECK (last_sent_local_date IS NULL OR last_sent_local_date GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]'),

  -- El silencio permanente (D-026, issue #207). Un toque del padre lo pone y
  -- NADA lo quita: ninguna ruta lo limpia, ni siquiera volver a suscribirse —
  -- re-pedir lo descartado es nagging de manual (mc-17, FTC 2022), y D-026 ya
  -- estableció que una marca descartada no reaparece.
  --
  -- Por eso aquí no hay `silenciado INTEGER CHECK (IN (0,1))`: un booleano
  -- invita a escribir el 0. Un sello de tiempo solo sabe ir de NULL a un
  -- instante, y `audits/recordatorio-sin-culpa.mjs` verifica que ningún
  -- archivo escriba `silenciado_at = NULL`.
  silenciado_at        INTEGER,

  updated_at           INTEGER NOT NULL
);

-- ─── Cloudflare: cero recursos nuevos ──────────────────────────────────────
--
-- Todo vive en `math-challenge-db` y su réplica `math-challenge-db-eu`, ya
-- inventariadas en `docs/infrastructure.md`. El renglón de esta migración sí
-- se escribe ahí, en el mismo PR (CLAUDE.md § Cloudflare).
--
-- Lo que SÍ es nuevo y no es una tabla: el par de claves VAPID del remitente.
-- NO van en esta migración ni en el repositorio: se generan fuera (`npx
-- web-push generate-vapid-keys` o Web Crypto), la privada se instala con
-- `wrangler secret put VAPID_PRIVATE_KEY` y la pública como var
-- `VAPID_PUBLIC_KEY`. Sin ellas el código degrada en silencio: el cron corre,
-- no envía nada y no rompe — que es el estado seguro por defecto.
