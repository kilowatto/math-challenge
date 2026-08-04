-- 0020_cosmeticos_arte_restante.sql — el arte de las 6 piezas publicadas sin él
--
-- #255 (paraguas #252). La 0015 publicó el catálogo v1 de KINDER con 6 filas
-- en `arte_*_url = NULL`, dicho en voz alta en su propio comentario: las
-- habilidades K05, K06, K08, K09, K13 y K14 esperaban a F5. Las correcciones
-- de F5 a esas habilidades ya están en main (K05 con `patos = gorros`, K06 con
-- n=2, K08 con `antes = 1`, K09 con `llenas = 9`, K13 con el intruso movido,
-- K14 con núcleo AB), así que la pieza ya puede decir la habilidad:
--
--   av_orejeras_par        K05 uno a uno        un PAR exacto: dos, ni uno ni tres
--   av_medalla_ultimo      K06 cardinalidad     el último número dice cuántos hay
--   av_bufanda_recta       K08 recta numérica   la línea punteada, SIN dígitos
--   av_chaleco_bolsillos   K09 marco de diez    diez bolsillos en dos filas de cinco
--   av_cinturon_formas     K13 formas básicas   círculo, cuadrado, triángulo, rectángulo
--   av_collar_patron       K14 patrones AB      cuentas naranja/azul alternadas
--
-- El arte se generó con `scripts/gen-cosmeticos.mjs` (mismo estilo, mismo
-- formato y mismo tamaño que las 15 ya aprobadas: AVIF + WebP a 512 px en
-- /cosmeticos/) y cada imagen se MIRÓ antes de aceptarse — la primera pasada
-- del frente de cosméticos sacó 5 de 15 malas, y esa lección es la razón de
-- las prohibiciones del script.
--
-- ─── Por qué UPDATE y solo UPDATE ───────────────────────────────────────────
--
-- Las filas ya existen con sus claves i18n y sus reglas deterministas; lo que
-- falta es la URL. El `AND arte_avif_url IS NULL` es el seguro contra el doble
-- disparo y contra la mano que edite el IN: **una fila con arte jamás se pisa
-- desde aquí** — las 15 ya aprobadas no las toca esta migración ni por
-- accidente. `arte_silueta_url` sigue NULL en todo el catálogo (la versión
-- gris «bloqueada» no existe todavía; eso es otra pasada de arte).

UPDATE cosmetic_catalog
SET arte_avif_url = '/cosmeticos/av_orejeras_par.avif',
    arte_webp_url = '/cosmeticos/av_orejeras_par.webp'
WHERE id = 'av_orejeras_par' AND arte_avif_url IS NULL;

UPDATE cosmetic_catalog
SET arte_avif_url = '/cosmeticos/av_medalla_ultimo.avif',
    arte_webp_url = '/cosmeticos/av_medalla_ultimo.webp'
WHERE id = 'av_medalla_ultimo' AND arte_avif_url IS NULL;

UPDATE cosmetic_catalog
SET arte_avif_url = '/cosmeticos/av_bufanda_recta.avif',
    arte_webp_url = '/cosmeticos/av_bufanda_recta.webp'
WHERE id = 'av_bufanda_recta' AND arte_avif_url IS NULL;

UPDATE cosmetic_catalog
SET arte_avif_url = '/cosmeticos/av_chaleco_bolsillos.avif',
    arte_webp_url = '/cosmeticos/av_chaleco_bolsillos.webp'
WHERE id = 'av_chaleco_bolsillos' AND arte_avif_url IS NULL;

UPDATE cosmetic_catalog
SET arte_avif_url = '/cosmeticos/av_cinturon_formas.avif',
    arte_webp_url = '/cosmeticos/av_cinturon_formas.webp'
WHERE id = 'av_cinturon_formas' AND arte_avif_url IS NULL;

UPDATE cosmetic_catalog
SET arte_avif_url = '/cosmeticos/av_collar_patron.avif',
    arte_webp_url = '/cosmeticos/av_collar_patron.webp'
WHERE id = 'av_collar_patron' AND arte_avif_url IS NULL;

-- Lo que esta migración NO hace:
--  · No toca las 15 filas con arte, ni las reglas de `cosmetic_unlock_rules`,
--    ni los dos marcos de hito que siguen sin arte a propósito (sus umbrales,
--    5 y 14 habilidades, todavía no son alcanzables por ningún perfil).
--  · No crea ningún objeto nuevo de Cloudflare: corre sobre `math-challenge-db`
--    (y su gemela `math-challenge-db-eu`, D-042), ya inventariadas. El renglón
--    de docs/infrastructure.md va en el mismo PR.
--  · No aplica nada a producción: la aplica el orquestador al integrar, con
--    `wrangler d1 migrations apply`, cuando el registro d1_migrations
--    desincronizado se repare (ver el renglón de la 0011 en infrastructure.md).
