-- ---------------------------------------------------------------------------
-- 0004 — Un solo consentimiento con gobierno, y un dato de menor que se retira
-- ---------------------------------------------------------------------------
--
-- Hace cumplir: D-051, D-052, D-053 (las tres del 2026-08-01), D-013
-- (consentimiento y datos del menor), línea roja #2 (el niño nunca es un
-- usuario, y no se le pide fecha exacta de nacimiento).
--
-- ESTA MIGRACIÓN EXISTE PORQUE HABÍA DOS VERDADES SOBRE EL MISMO HECHO.
--
-- `consent_records` (0001) y `child_consents` + `consent_type_catalog` (0003)
-- guardaban los dos el consentimiento de un adulto sobre un menor, y no se
-- hablaban. `consent_records.consent_type` es TEXT libre, sin catálogo ni
-- restricción; `child_consents.consent_code` pasa por un trigger que rechaza
-- cualquier código que no esté en el catálogo.
--
-- Dos tablas de consentimiento que no se hablan es exactamente cómo se pierde la
-- prueba de que un padre consintió: la fila cae en una, el producto pregunta en
-- la otra, y ninguna de las dos miente — simplemente no son la misma.
--
-- D-051 la resuelve: **manda `child_consents`.**

-- ---------------------------------------------------------------------------
-- 1. `consent_records` se retira, y NO se borra
-- ---------------------------------------------------------------------------
--
-- No se borra por dos razones, y la segunda es la que manda:
--
--  · `audits/migration-safety.mjs` la lista como INTOCABLE junto a
--    `child_profiles`. Su borrado tiene camino propio —el runbook de erasure de
--    `mc-32` riesgo #7, que toca cuatro sistemas— y ese camino no es una
--    migración.
--  · Es la fila que prueba el cumplimiento ante un regulador. Una tabla de
--    consentimiento borrada no es una tabla vacía: es la desaparición de la
--    prueba, y llega justo cuando alguien la pide.
--
-- Así que se congela: las filas que haya se quedan y se pueden leer; **no entra
-- ninguna nueva**. El trigger lo hace cumplir sin depender de que nadie recuerde
-- la regla, y su mensaje dice a dónde ir — un ABORT sin instrucción produce un
-- reintento, no una corrección.
CREATE TRIGGER trg_consent_records_congelada
BEFORE INSERT ON consent_records
FOR EACH ROW
BEGIN
  SELECT RAISE(ABORT,
    'consent_records está congelada (D-051): el consentimiento vivo va a child_consents, con su código en consent_type_catalog');
END;

-- ---------------------------------------------------------------------------
-- 2. El código que el criterio #114 nombraba no existía
-- ---------------------------------------------------------------------------
--
-- El criterio pedía `consent_type='child_profile_creation'`. Ese string no está
-- en ninguna parte del esquema: el catálogo de 0003 lo llama `CHILD_PROFILE`.
-- Con el trigger de 0003 puesto, insertarlo habría fallado en tiempo de
-- ejecución con un ABORT — o sea, un padre creando el perfil de su hijo y
-- viendo un error.
--
-- Se conserva `CHILD_PROFILE` y se ENMIENDA el criterio, no al revés: el
-- catálogo ya estaba aplicado en local y remoto, y renombrar un código de
-- consentimiento que ya existe es una migración de datos a cambio de nada.
--
-- Lo que sí faltaba es que el catálogo dijera **qué texto** aceptó el adulto.
-- `consent_records` tenía `consent_version` y `child_consents` no, así que al
-- mover el gobierno se perdía la única columna que permite demostrar QUÉ se
-- consintió, no solo que se consintió.
ALTER TABLE child_consents ADD COLUMN consent_version TEXT;

-- El texto vigente de cada tipo, para poder resolver `consent_version` sin
-- guardar el párrafo entero en cada fila.
ALTER TABLE consent_type_catalog ADD COLUMN current_version TEXT NOT NULL DEFAULT 'v1';

-- ---------------------------------------------------------------------------
-- 3. `mc_h`, no `mc_d`, y vive en D1
-- ---------------------------------------------------------------------------
--
-- D-052. El bloque final de 0003 decía que las tres cookies de F2 son
-- `mc_s`/`mc_k`/`mc_d` y que **las tres viven en KV**. Las dos cosas están mal, y
-- el propio archivo se contradecía: `household_devices` es una tabla de D1 cuya
-- llave primaria es `device_token`, que es exactamente lo que la cookie del
-- dispositivo del hogar lleva dentro.
--
-- Lo correcto, y lo que F2 implementa:
--
--   mc_s  adulto              KV   30 días
--   mc_h  dispositivo del     D1   400 días   → household_devices.device_token
--         hogar (D-012)
--   mc_k  perfil de niño      KV   12 horas
--         activo
--
-- No hay cambio de esquema aquí: `household_devices` ya servía para esto. Lo que
-- cambia es que el comentario de 0003 dejaba de ser cierto, y un comentario
-- falso sobre dónde vive una sesión es cómo alguien construye la mitad
-- equivocada dentro de un año.

-- ---------------------------------------------------------------------------
-- 4. `birth_month` NO se retira aquí, y hay que decir por qué
-- ---------------------------------------------------------------------------
--
-- D-053 decidió que el producto solo pide el AÑO: la banda se deriva de él y el
-- mes no alimenta ninguna decisión, así que es 12 veces más precisión sobre la
-- identidad de un menor de la que hace falta.
--
-- Quitar la columna exige la reconstrucción de 12 pasos de SQLite, y
-- `audits/migration-safety.mjs` la bloquea con la razón correcta:
--
--     la reconstrucción de child_profiles deja fuera la columna "birth_month":
--     es un DROP COLUMN escrito de otra forma
--
-- Y sobre `child_profiles` ese bloqueo **no se puede anular con un comentario**,
-- a propósito: el borrado de datos de un menor va por el runbook de erasure, que
-- toca cuatro sistemas (`mc-32` riesgo #7).
--
-- El auditor está protegiendo la regla correcta contra el caso contrario al
-- nuestro —perder datos de un menor sin querer—, y aquí perderlos ES el objetivo
-- (D-013, minimización). Resolver esa tensión significa tocar un guardián que
-- vigila una línea roja, y eso no se hace de paso dentro de otra migración.
--
-- Queda en `docs/dudas.md` y sale en su propia migración `0005`, con la decisión
-- del dueño sobre el mecanismo escrita antes. Hasta entonces `birth_month` sigue
-- siendo `NOT NULL`: la puerta del padre **no lo pregunta**, y quien inserte un
-- perfil tendrá que dar un valor — ese es el residuo conocido de este PR y está
-- dicho aquí para que nadie lo descubra solo.

-- ---------------------------------------------------------------------------
-- Lo que esta migración NO hace, dicho aquí para que no se suponga
-- ---------------------------------------------------------------------------
--
-- · **No borra `consent_records` ni una sola de sus filas.** La congela. Quien
--   necesite borrarlas usa el runbook de erasure, que toca cuatro sistemas.
--
-- · **No migra las filas de `consent_records` a `child_consents`.** Hoy no hay
--   ninguna: F2 no ha salido y ningún adulto ha consentido nada todavía. Si
--   alguna vez las hubiera, moverlas es una migración de datos con su propio
--   archivo — y una que tiene que decidir qué hacer con los `consent_type` de
--   texto libre que no tengan código en el catálogo.
--
-- · **No crea los tres objetos de Cloudflare** que el criterio #113 nombra
--   (`math-challenge-turnstile-signup`, `math-challenge-ratelimiter-do`,
--   `math-challenge-funnel-ae`). Son infraestructura, no esquema, y van con su
--   renglón en `docs/infrastructure.md` en el PR que los cree.
--
-- · **No toca los índices de `child_profiles`.** La reconstrucción de 12 pasos
--   pide recrearlos después del renombre; esta tabla no tenía ninguno declarado
--   fuera de su PRIMARY KEY, que viaja con la definición.
