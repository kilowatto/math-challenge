-- ---------------------------------------------------------------------------
-- 0005 — La tabla no se llama «verificación», porque nadie verifica nada
-- ---------------------------------------------------------------------------
--
-- Hace cumplir: criterio #118 de F2, D-009 (enmendada: T-5 sube a ruta crítica),
-- D-011, D-027.
--
-- ESTA MIGRACIÓN EXISTE PORQUE UN NOMBRE MENTÍA.
--
-- La migración 0003 creó `teacher_verifications`. El criterio #118 dice, con
-- todas sus letras, que la tabla se llama `group_owner_identity` **y no**
-- `teacher_verification`, «porque este producto no verifica que nadie sea
-- maestro».
--
-- No es una preferencia de estilo. Una columna llamada `status` con el valor
-- `VERIFICADO` afirma que alguien comprobó algo. **Nadie comprobó nada.** T-5
-- sigue abierta: no hay proveedor de SMS —Cloudflare no ofrece— y D-044 quitó
-- esa vía sin poner otra. Lo único cierto es que una persona escribió que da
-- clases, y eso es lo que la tabla tiene que poder decir.
--
-- Un nombre que afirma más de lo que sabe se convierte, en seis meses, en una
-- pantalla que le dice a un padre «maestro verificado» sobre alguien a quien
-- nadie verificó.

-- `ALTER TABLE ... RENAME TO` sí existe en SQLite y no necesita la
-- reconstrucción de 12 pasos: no toca columnas, solo el nombre. `teacher_
-- verifications` no está en la lista de INTOCABLES de `migration-safety`
-- —esas son `consent_records` y `child_profiles`— y aquí no se pierde ni una
-- fila: hoy la tabla está vacía, y aunque no lo estuviera, un renombre las
-- conserva todas.
ALTER TABLE teacher_verifications RENAME TO group_owner_identity;

-- ---------------------------------------------------------------------------
-- `assurance` — qué tan cierto es lo que sabemos, no si está «verificado»
-- ---------------------------------------------------------------------------
--
-- El valor por defecto es `declared`, y su significado está escrito aquí para
-- que nadie tenga que adivinarlo: **lo escribió esta persona y nadie lo
-- comprobó**. Es lo que se le muestra al padre tal cual — la insignia de «sin
-- verificar» de D-027.
--
-- No se borra `status`: SQLite no quita columnas sin reconstruir la tabla, y
-- reconstruir para ahorrar una columna vacía no vale el riesgo. Queda muerta y
-- dicho aquí que lo está.
ALTER TABLE group_owner_identity ADD COLUMN assurance TEXT NOT NULL DEFAULT 'declared'
  CHECK (assurance IN (
    -- Lo escribió la persona. Nadie lo comprobó. **Este es el caso normal.**
    'declared',
    -- Un correo en el dominio de una escuela conocida. Es la única señal
    -- automática que existe hoy, y prueba que controla ese buzón — no que dé
    -- clases ahí.
    'school_domain',
    -- Alguien del equipo lo miró. No existe todavía el proceso; el valor está
    -- para que el día que exista no haga falta otra migración.
    'human_reviewed'
  ));

-- El teléfono queda NULL a propósito: **Cloudflare no ofrece SMS** y no hay
-- proveedor decidido (D-044). La columna existe para que el día que lo haya no
-- haya que migrar, y su NULL de hoy es información: dice que esa vía no está.
ALTER TABLE group_owner_identity ADD COLUMN phone_verified_at INTEGER;

-- Lo que la persona declaró: el nombre de su escuela, su club, su grupo. Lo
-- escribe un ADULTO —nunca un niño, línea roja #3— y se muestra al padre junto
-- a la insignia de que nadie lo comprobó.
ALTER TABLE group_owner_identity ADD COLUMN declared_context TEXT;

-- ---------------------------------------------------------------------------
-- Lo que esta migración NO hace
-- ---------------------------------------------------------------------------
--
-- · **No verifica a nadie.** T-5 sigue abierta y esta migración no la cierra:
--   la vuelve legible. Un salón sabe qué tan cierto es lo que sabe de su dueño,
--   y quien decida qué permitir en cada nivel lo decide sobre un dato con
--   nombre honesto en vez de sobre un supuesto.
--
-- · **No borra `status`.** Queda muerta. Quitarla exige la reconstrucción de 12
--   pasos, y hacerla por una columna vacía sería asumir el riesgo del
--   procedimiento a cambio de estética.
--
-- · **No crea la marca de tipo `OwnerProof`.** El criterio pide que el gate no
--   sea un `if` sino un tipo que solo `assertCanOwnChildGroup` pueda fabricar,
--   de modo que `createChildGroup(proof, …)` no compile sin él. Eso es
--   TypeScript, no esquema, y va en el mismo PR — pero no aquí.
