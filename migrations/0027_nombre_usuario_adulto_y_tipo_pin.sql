-- 0027 — Nombre + @usuario público del adulto (D-197, reversa puntual de
-- D-003), y el tipo de PIN de cada hijo (D-197)
--
-- ─── display_name / username: la PRIMERA superficie de texto libre de todo
-- el producto visible a otros usuarios ───────────────────────────────────
--
-- D-003 fija que ligas/tableros/clubes muestran SIEMPRE un alias generado,
-- nunca un nombre real — ni de niño ni de adulto (`migrations/0012` amplió
-- explícito la regla al adulto). D-197 la reversa a propósito, solo para el
-- adulto, solo aquí: el dueño quiere que su nombre y su `@usuario` sean
-- públicos en esas superficies, en vez del alias. El niño NO gana estos
-- campos ni ninguna variante — D-013/línea roja #2/línea roja #3 siguen
-- intactas, así que esta columna vive en `users`, nunca en `child_profiles`.
--
-- `username` es único en TODA la plataforma (no por liga/club) — el índice
-- de abajo lo hace cumplir sobre la forma NORMALIZADA (minúsculas), para que
-- "Kilowatto" y "kilowatto" no puedan coexistir como dos personas distintas.
-- La validación de formato/lista de bloqueo vive en código de aplicación
-- (D-197 §1), no en el esquema — SQLite no tiene expresiones regulares
-- portables para un CHECK de charset.
ALTER TABLE users ADD COLUMN display_name TEXT;
ALTER TABLE users ADD COLUMN username TEXT;

CREATE UNIQUE INDEX idx_username_unico ON users (LOWER(username)) WHERE username IS NOT NULL AND deleted_at IS NULL;

-- ─── El tipo de PIN, por banda (D-197 §2) ───────────────────────────────────
--
-- Hasta hoy `child_image_pin` solo modelaba UN sistema (3-de-9 imágenes) y
-- de hecho nada en el repo lo escribía todavía (ver D-197 §2 — la pantalla
-- de ajustes es la PRIMERA vez que algo fija un PIN de verdad). Con
-- KINDER en imágenes y PRIMARIA/SECUNDARIA en teclado numérico, la fila
-- necesita decir cuál de los dos es — el hash en sí sigue siendo un solo
-- campo opaco (`pin_hash`), calculado distinto según `tipo`
-- (`hashearPin` para imágenes, `hashearPinNumerico` para dígitos).
ALTER TABLE child_image_pin ADD COLUMN tipo TEXT NOT NULL DEFAULT 'imagenes' CHECK (tipo IN ('imagenes', 'numerico'));
