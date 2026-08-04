-- 0018 · F8 · Panel con diagnóstico (#278, paraguas #277) — child_diagnostic_notes
--
-- La única tabla que F8 · Panel con diagnóstico POSEE de verdad. Todo lo demás
-- que el panel muestra (minutos de pantalla, racha, XP, puntos, liga,
-- cosméticos, dominio por habilidad) se LEE de las tablas que F2/F4/F7/F8-límite
-- ya son dueñas de producir — el panel no reimplementa ninguna fórmula ni
-- duplica ningún hecho (#278, corrección de reconciliación: la tendencia de
-- minutos vive en `screen_time_daily_usage` de la 0011, no en una tabla propia).
--
-- ─── Qué es una nota, y quién la escribe ────────────────────────────────────
--
-- Una nota del SISTEMA para el padre, en dos causas cerradas:
--
--   · HABILIDAD_PAUSADA_LATERAL — el descenso pedagógico lateral de F6
--     (`docs/planes/f6-larry-profe.md` §2.3): Larry no le dice al niño «vamos a
--     algo más sencillo»; la honestidad va donde puede procesarse, y el panel
--     del padre sí dice literalmente qué habilidad se pausó y por qué. La
--     escribe F6 cuando el motor de dificultad baja a un prerrequisito.
--   · PATRON_INUSUAL_PARA_EDAD — D-020 literal: «si el patrón de respuestas es
--     imposible para la edad, el sistema simplemente no sube el nivel y deja
--     una nota suave en el panel del padre. Sin bloqueos, sin advertencias al
--     niño.» La escribe F4 (anti-trampa tier 0).
--
-- NINGUNA de las dos fases escritoras está construida todavía: esta migración
-- fija el CONTRATO de la tabla para que F4/F6 lo implementen sin reabrir el
-- esquema (#278: «esta issue solo diseña el contrato de la tabla»).
--
-- ─── Por qué el esquema es así, y no más cómodo ─────────────────────────────
--
--  · `cause_code` es un CHECK cerrado, no TEXT libre. No hay ninguna columna
--    donde un padre, un niño o un endpoint pueda escribir texto (línea roja
--    #3, y minimización de D-013 para el adulto): la nota se renderiza con
--    plantillas autoradas por locale (`audits/notas-diagnostico-completas.mjs`
--    vigila que toda causa tenga texto en los siete).
--  · `skill_id` es una clave interna (`K07`), nunca texto de un niño — el
--    mismo patrón que `skill_state.skill_id` (0002) y `HABILIDADES_KINDER`.
--  · La nota NUNCA se borra: solo se marca `seen_at` cuando el padre la ve
--    (#283). No hay DELETE en ninguna ruta, y el historial completo queda
--    disponible.
--  · ON DELETE CASCADE: borrar el perfil se lleva sus notas, como el resto de
--    tablas de niño (mc-32 riesgo #7, mismo patrón que la 0015).
--  · SIN columna de precio, plan, moneda ni consentimiento nuevo: D-057 fija
--    que el panel es gratis para todo padre, y `SCREEN_TIME`/`DATA_RETENTION`
--    (D-051, 0003) ya cubren la categoría de dato — ningún `consent_code`
--    nuevo entra al catálogo (#278, criterio de aceptación).
--
-- ─── Verificaciones cruzadas ya corridas ────────────────────────────────────
--
--  · `audits/no-attempts-in-d1.mjs`: sus patrones están ANCLADOS al nombre
--    completo de tabla (`/^attempts?$/i`, `/^events?$/i`, …) y
--    `child_diagnostic_notes` no matchea ninguno — es una tabla de evento
--    agregado por niño, el mismo patrón que `child_streak` o
--    `mission_daily_summary`, no un log por intento (mc-32 riesgo #1 sigue
--    prohibido y sigue yendo solo a `math-challenge-attempts-ae`).
--  · `audits/child-free-text.mjs`: la tabla se añade a `CHILD_TABLES` en el
--    mismo PR, con su control negativo visto fallar (CLAUDE.md § Git regla 3)
--    — el hueco que `f7-juego.md` documentó y F7 no cerró no se repite aquí
--    (`docs/planes/f8-padres.md` §4).
--
-- ─── Numeración ─────────────────────────────────────────────────────────────
--
-- La 0019 está repartida al frente de F8 · Reportes, en construcción en
-- paralelo. NO se declara `migration-safety-reserva` en este archivo a
-- propósito: esta rama corre contigua (…0016, 0017, 0018), así que no tiene
-- hueco que declarar, y una reserva declarada aquí apagaría la sonda de hueco
-- de `audits/pruebas-auditores.mjs` — al plantar `0020_prueba_hueco.sql`, el
-- único hueco (0019) quedaría «declarado» y el caso correría en verde sin
-- degradar nada, que es el auditor apagado en silencio de siempre. Sin
-- reserva, la sonda en 0020 caza el hueco 0019 y el control sigue vivo. El
-- frente de reportes reapuntará la sonda a 0021 cuando su 0019 aterrice.

CREATE TABLE child_diagnostic_notes (
  id                TEXT PRIMARY KEY,
  child_profile_id  TEXT NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,

  -- Enum cerrado, jamás texto libre: la plantilla de texto vive en
  -- `apps/web/src/i18n/padre/<locale>.json` bajo `padre.nota.<cause_code>`,
  -- autorada por locale en la voz de Larry (#283, respuesta del dueño a la
  -- pregunta 2 de #277 — la única superficie donde Larry le habla al adulto).
  cause_code        TEXT NOT NULL CHECK (cause_code IN (
                       'HABILIDAD_PAUSADA_LATERAL',  -- F6 §2.3: descenso pedagógico lateral
                       'PATRON_INUSUAL_PARA_EDAD'     -- D-020: anti-trampa tier 0
                     )),

  -- La habilidad pausada, cuando la causa es de habilidad. NULL en
  -- PATRON_INUSUAL_PARA_EDAD, que es del patrón global, no de una habilidad.
  skill_id          TEXT,

  created_at        INTEGER NOT NULL,
  -- Cuándo la vio el padre. La nota nunca se borra; solo se marca vista.
  seen_at           INTEGER
);

-- La consulta del panel: «las notas de este niño, más reciente primero».
CREATE INDEX idx_notes_child ON child_diagnostic_notes (child_profile_id, created_at DESC);
