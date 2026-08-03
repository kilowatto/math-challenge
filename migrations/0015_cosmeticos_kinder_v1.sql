-- 0015_cosmeticos_kinder_v1.sql — el catálogo v1 de cosméticos de KINDER
--
-- #255 (paraguas #252). Decisiones: D-014 (cosméticos ganados, deterministas;
-- sin moneda comprable), D-019 (la Sabana: una pieza por habilidad de kinder),
-- D-022 (el texto es clave i18n autorada por locale, jamás cadena cruda),
-- D-080 (los cosméticos son accesorios de Larry, no de un personaje aparte).
-- Investigación: mc-43 §5 (cero recompensas aleatorias, gratis o pagadas) y
-- §8 (la condición de desbloqueo solo se muestra al padre).
--
-- ─── Nota de integración, dicha en voz alta ────────────────────────────────
--
-- La issue de esquema (#253) se cerró como «en main», pero las tres tablas
-- NUNCA aterrizaron en `migrations/`: `grep -rn "cosmetic_catalog" migrations/`
-- sobre main solo encuentra comentarios. Este archivo crea el esquema —según
-- la especificación de `docs/planes/f7-juego.md` §3, ajustada al enum final de
-- `packages/motor/src/cosmeticos.ts`— Y siembra el catálogo v1 en la misma
-- migración, porque una migración de filas sin las tablas no se puede aplicar
-- a nada. Las dos diferencias con el borrador del plan:
--
--   · `tipo_evento` admite los SEIS valores del enum cerrado de
--     `cosmeticos.ts` — el borrador del plan se quedó en cinco y le faltaba
--     `nivel_alcanzado`. El auditor `cosmeticos-deterministas.mjs` cruza este
--     CHECK contra el enum del módulo, y manda el módulo.
--   · `cosmetic_unlock_rules` tiene `parametro` NULABLE y una columna `umbral`,
--     porque así es `ReglaDeDesbloqueo` en el módulo ya mergeado: los tipos
--     que cuentan (`habilidades_dominadas_conteo`, `racha_dias`,
--     `liga_top_pct`, `nivel_alcanzado`) necesitan un número, y
--     `habilidad_dominada` es el único que usa `parametro`.
--
-- Lo que este esquema NO tiene, y la ausencia es estructural (D-014, línea
-- roja #5): ni columna de precio, ni de moneda, ni de probabilidad, ni de
-- rareza. `audits/cosmeticos-deterministas.mjs` bloquea el commit que las
-- agregue.

-- ---------------------------------------------------------------------------
-- cosmetic_catalog — qué existe, jamás qué cuesta
-- ---------------------------------------------------------------------------
-- `nombre_clave` y `condicion_clave` son claves i18n del directorio
-- `apps/web/src/i18n/cosmeticos/`, mismo patrón que `enunciado.clave` en
-- `item.ts`: el catálogo guarda la clave, nunca el texto. La condición es
-- texto para el PANEL DEL PADRE (mc-43 §8): en KINDER el desbloqueo es
-- sorpresa, y ninguna superficie de niño la renderiza.
--
-- Las columnas de arte son NULABLES a propósito: NULL significa «fila
-- publicada sin arte, pendiente de que F5 cierre la habilidad» (#255). Seis
-- habilidades de kinder no tienen contenido todavía; sus piezas existen aquí
-- para que el catálogo esté completo y sea visible qué falta, no escondido.

CREATE TABLE cosmetic_catalog (
  id                TEXT PRIMARY KEY,
  categoria         TEXT NOT NULL CHECK (categoria IN (
                       'avatar_pieza','marco_perfil','companero',
                       'insignia_secundaria','insignia_adulto')),
  -- Reusa el dominio de TemaVisual de bandas.ts (5 valores, sin JR).
  banda_minima      TEXT NOT NULL CHECK (banda_minima IN
                       ('KINDER','PRIMARIA','SECUNDARIA','SERIO','PRO')),
  es_inicial        INTEGER NOT NULL DEFAULT 0 CHECK (es_inicial IN (0,1)),
  nombre_clave      TEXT NOT NULL,   -- clave i18n, jamás texto crudo
  condicion_clave   TEXT,            -- clave i18n para el padre; NULL en iniciales
  arte_avif_url     TEXT,            -- NULL = arte pendiente (F5 no cerró la habilidad)
  arte_webp_url     TEXT,
  arte_silueta_url  TEXT,            -- versión "bloqueada" en gris
  created_at        INTEGER NOT NULL
);

-- ---------------------------------------------------------------------------
-- cosmetic_unlock_rules — un cosmético se gana, y se sabe cómo
-- ---------------------------------------------------------------------------
-- `parametro` es el skill_id para `habilidad_dominada` y NULL para todo lo
-- demás. `umbral` es el número a alcanzar en los tipos que cuentan y NULL en
-- `habilidad_dominada` y `primer_intento`. Espejo exacto de
-- `ReglaDeDesbloqueo` en `packages/motor/src/cosmeticos.ts`; la forma la
-- valida `validarReglas()` y el enum lo cruza el auditor.

CREATE TABLE cosmetic_unlock_rules (
  cosmetic_id  TEXT PRIMARY KEY REFERENCES cosmetic_catalog(id),
  tipo_evento  TEXT NOT NULL CHECK (tipo_evento IN (
                 'habilidad_dominada','primer_intento',
                 'habilidades_dominadas_conteo','racha_dias',
                 'liga_top_pct','nivel_alcanzado')),
  parametro    TEXT,
  umbral       INTEGER
);

-- ---------------------------------------------------------------------------
-- child_cosmetics_unlocked — lo ganado, auditable
-- ---------------------------------------------------------------------------
-- PRIMARY KEY (child_profile_id, cosmetic_id): dos disparos del mismo logro
-- nunca duplican fila ni efecto — el INSERT del Worker es OR IGNORE y el
-- reintento de una escritura fallida es seguro. ON DELETE CASCADE: borrar el
-- perfil se lleva sus cosméticos sin un quinto sistema (mc-32 riesgo #7).
-- `evento_causa` lo escribe el Worker, nunca el niño: es el logro exacto que
-- lo disparó, para que el panel del padre pueda auditar cada desbloqueo.

CREATE TABLE child_cosmetics_unlocked (
  child_profile_id TEXT NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  cosmetic_id      TEXT NOT NULL REFERENCES cosmetic_catalog(id),
  unlocked_at      INTEGER NOT NULL,
  evento_causa     TEXT NOT NULL,
  PRIMARY KEY (child_profile_id, cosmetic_id)
);

CREATE INDEX idx_cosmetics_child ON child_cosmetics_unlocked (child_profile_id);

-- La regla `habilidades_dominadas_conteo` hace COUNT(*) sobre skill_state
-- WHERE child_profile_id = ? AND mastered_at IS NOT NULL. 0002 solo indexaba
-- (child_profile_id, due_at); sin este índice esa consulta repite el riesgo
-- #12 de mc-32 que idx_score_rank ya resolvió una vez (criterio de #253).
CREATE INDEX idx_skill_mastered ON skill_state (child_profile_id, mastered_at);

-- ---------------------------------------------------------------------------
-- El catálogo v1 de KINDER (#255)
-- ---------------------------------------------------------------------------
-- 23 filas: 3 piezas iniciales + 1 de bienvenida + 14 por habilidad de la
-- Sabana (D-019) + 3 marcos iniciales + 2 marcos por hitos de conteo.
--
-- `created_at` es una constante, no un reloj: la fecha fija del catálogo v1
-- (2026-08-03 UTC). Un `strftime('%s','now')` haría la fila dependiente de
-- CUÁNDO se aplica la migración, y este subsistema entero existe para que
-- misma entrada dé misma salida.
--
-- Las 8 piezas de habilidad producibles hoy (K01, K02, K03, K04, K07, K10,
-- K11, K12) llevan arte AVIF + WebP en /cosmeticos/. Las otras 6 (K05, K06,
-- K08, K09, K13, K14) van SIN arte —sus habilidades esperan a F5, y K14 está
-- marcada BLOQUEADA en el propio plan de F5—: arte NULL, dicho en voz alta.

INSERT INTO cosmetic_catalog
  (id, categoria, banda_minima, es_inicial, nombre_clave, condicion_clave,
   arte_avif_url, arte_webp_url, arte_silueta_url, created_at)
VALUES
  -- Las tres piezas iniciales: las trae puestas cualquier perfil nuevo.
  ('av_sombrero_explorador','avatar_pieza','KINDER',1,'cosmetico.av_sombrero_explorador.nombre',NULL,
   '/cosmeticos/av_sombrero_explorador.avif','/cosmeticos/av_sombrero_explorador.webp',NULL,1785715200),
  ('av_bandana_sabana','avatar_pieza','KINDER',1,'cosmetico.av_bandana_sabana.nombre',NULL,
   '/cosmeticos/av_bandana_sabana.avif','/cosmeticos/av_bandana_sabana.webp',NULL,1785715200),
  ('av_mochila_viajera','avatar_pieza','KINDER',1,'cosmetico.av_mochila_viajera.nombre',NULL,
   '/cosmeticos/av_mochila_viajera.avif','/cosmeticos/av_mochila_viajera.webp',NULL,1785715200),
  -- La de bienvenida: se gana con el primer intento, lo haya acertado o no.
  ('av_flor_bienvenida','avatar_pieza','KINDER',0,'cosmetico.av_flor_bienvenida.nombre','cosmetico.av_flor_bienvenida.condicion',
   '/cosmeticos/av_flor_bienvenida.avif','/cosmeticos/av_flor_bienvenida.webp',NULL,1785715200),
  -- Las ocho por habilidad con arte.
  ('av_prismaticos_halcon','avatar_pieza','KINDER',0,'cosmetico.av_prismaticos_halcon.nombre','cosmetico.av_prismaticos_halcon.condicion',
   '/cosmeticos/av_prismaticos_halcon.avif','/cosmeticos/av_prismaticos_halcon.webp',NULL,1785715200),
  ('av_lupa_rastreadora','avatar_pieza','KINDER',0,'cosmetico.av_lupa_rastreadora.nombre','cosmetico.av_lupa_rastreadora.condicion',
   '/cosmeticos/av_lupa_rastreadora.avif','/cosmeticos/av_lupa_rastreadora.webp',NULL,1785715200),
  ('av_gorra_pato','avatar_pieza','KINDER',0,'cosmetico.av_gorra_pato.nombre','cosmetico.av_gorra_pato.condicion',
   '/cosmeticos/av_gorra_pato.avif','/cosmeticos/av_gorra_pato.webp',NULL,1785715200),
  ('av_collar_cuentas','avatar_pieza','KINDER',0,'cosmetico.av_collar_cuentas.nombre','cosmetico.av_collar_cuentas.condicion',
   '/cosmeticos/av_collar_cuentas.avif','/cosmeticos/av_collar_cuentas.webp',NULL,1785715200),
  ('av_gorra_balanza','avatar_pieza','KINDER',0,'cosmetico.av_gorra_balanza.nombre','cosmetico.av_gorra_balanza.condicion',
   '/cosmeticos/av_gorra_balanza.avif','/cosmeticos/av_gorra_balanza.webp',NULL,1785715200),
  ('av_pin_rompecabezas','avatar_pieza','KINDER',0,'cosmetico.av_pin_rompecabezas.nombre','cosmetico.av_pin_rompecabezas.condicion',
   '/cosmeticos/av_pin_rompecabezas.avif','/cosmeticos/av_pin_rompecabezas.webp',NULL,1785715200),
  ('av_estrella_suma','avatar_pieza','KINDER',0,'cosmetico.av_estrella_suma.nombre','cosmetico.av_estrella_suma.condicion',
   '/cosmeticos/av_estrella_suma.avif','/cosmeticos/av_estrella_suma.webp',NULL,1785715200),
  ('av_cometa_viento','avatar_pieza','KINDER',0,'cosmetico.av_cometa_viento.nombre','cosmetico.av_cometa_viento.condicion',
   '/cosmeticos/av_cometa_viento.avif','/cosmeticos/av_cometa_viento.webp',NULL,1785715200),
  -- Las seis por habilidad SIN arte: F5 no ha cerrado esas habilidades.
  ('av_orejeras_par','avatar_pieza','KINDER',0,'cosmetico.av_orejeras_par.nombre','cosmetico.av_orejeras_par.condicion',
   NULL,NULL,NULL,1785715200),
  ('av_medalla_ultimo','avatar_pieza','KINDER',0,'cosmetico.av_medalla_ultimo.nombre','cosmetico.av_medalla_ultimo.condicion',
   NULL,NULL,NULL,1785715200),
  ('av_bufanda_recta','avatar_pieza','KINDER',0,'cosmetico.av_bufanda_recta.nombre','cosmetico.av_bufanda_recta.condicion',
   NULL,NULL,NULL,1785715200),
  ('av_chaleco_bolsillos','avatar_pieza','KINDER',0,'cosmetico.av_chaleco_bolsillos.nombre','cosmetico.av_chaleco_bolsillos.condicion',
   NULL,NULL,NULL,1785715200),
  ('av_cinturon_formas','avatar_pieza','KINDER',0,'cosmetico.av_cinturon_formas.nombre','cosmetico.av_cinturon_formas.condicion',
   NULL,NULL,NULL,1785715200),
  ('av_collar_patron','avatar_pieza','KINDER',0,'cosmetico.av_collar_patron.nombre','cosmetico.av_collar_patron.condicion',
   NULL,NULL,NULL,1785715200),
  -- Los tres marcos iniciales.
  ('marco_acacia','marco_perfil','KINDER',1,'cosmetico.marco_acacia.nombre',NULL,
   '/cosmeticos/marco_acacia.avif','/cosmeticos/marco_acacia.webp',NULL,1785715200),
  ('marco_atardecer','marco_perfil','KINDER',1,'cosmetico.marco_atardecer.nombre',NULL,
   '/cosmeticos/marco_atardecer.avif','/cosmeticos/marco_atardecer.webp',NULL,1785715200),
  ('marco_huellas','marco_perfil','KINDER',1,'cosmetico.marco_huellas.nombre',NULL,
   '/cosmeticos/marco_huellas.avif','/cosmeticos/marco_huellas.webp',NULL,1785715200),
  -- Los dos marcos de hito: 5 y 14 habilidades dominadas.
  ('marco_explorador_sabana','marco_perfil','KINDER',0,'cosmetico.marco_explorador_sabana.nombre','cosmetico.marco_explorador_sabana.condicion',
   NULL,NULL,NULL,1785715200),
  ('marco_guardian_sabana','marco_perfil','KINDER',0,'cosmetico.marco_guardian_sabana.nombre','cosmetico.marco_guardian_sabana.condicion',
   NULL,NULL,NULL,1785715200);

-- Toda pieza que no es inicial tiene UNA regla, y ninguna regla usa azar:
-- el evento y el umbral están escritos aquí, publicados, y el evaluador es
-- `cosmeticosQueDesbloquea()` — misma entrada, misma salida, siempre.
INSERT INTO cosmetic_unlock_rules (cosmetic_id, tipo_evento, parametro, umbral)
VALUES
  ('av_flor_bienvenida','primer_intento',NULL,NULL),
  ('av_prismaticos_halcon','habilidad_dominada','K01',NULL),
  ('av_lupa_rastreadora','habilidad_dominada','K02',NULL),
  ('av_gorra_pato','habilidad_dominada','K03',NULL),
  ('av_collar_cuentas','habilidad_dominada','K04',NULL),
  ('av_orejeras_par','habilidad_dominada','K05',NULL),
  ('av_medalla_ultimo','habilidad_dominada','K06',NULL),
  ('av_gorra_balanza','habilidad_dominada','K07',NULL),
  ('av_bufanda_recta','habilidad_dominada','K08',NULL),
  ('av_chaleco_bolsillos','habilidad_dominada','K09',NULL),
  ('av_pin_rompecabezas','habilidad_dominada','K10',NULL),
  ('av_estrella_suma','habilidad_dominada','K11',NULL),
  ('av_cometa_viento','habilidad_dominada','K12',NULL),
  ('av_cinturon_formas','habilidad_dominada','K13',NULL),
  ('av_collar_patron','habilidad_dominada','K14',NULL),
  ('marco_explorador_sabana','habilidades_dominadas_conteo',NULL,5),
  ('marco_guardian_sabana','habilidades_dominadas_conteo',NULL,14);

-- Lo que esta migración NO hace:
--  · No toca `child_profiles.avatar_parts` (0002): «qué trae puesto» sigue en
--    esa columna, reusada por diseño (f7-juego.md §3), y la valida el Worker.
--  · No crea ningún objeto nuevo de Cloudflare: las tres tablas viven en
--    `math-challenge-db` (y su gemela `math-challenge-db-eu`, D-042), ya
--    inventariadas. El renglón de docs/infrastructure.md va en el mismo PR.
--  · No aplica nada a producción: corre con `wrangler d1 migrations apply`
--    cuando el registro d1_migrations desincronizado se repare (ver el
--    renglón de la 0011 en infrastructure.md).
