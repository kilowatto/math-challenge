-- 0010 — El compañero: Larry con accesorios, sin nada que decaiga (D-080, #235)
--
-- El número 0009 queda reservado a la rama de misiones de F7, que todavía no
-- está en `main`. Sin esta línea el hueco bloquea, y con razón — ver la nota de
-- numeración al final de este encabezado.
-- migration-safety-reserva: 0009 — F7-misiones la tiene tomada en su propia rama y aún no llega a main; el reparto en orden de merge es misiones 0009, mapa 0010, social 0011, límite de pantalla 0012.
--
-- ─── Por qué esta migración existe, si #231 dice «sin tabla propia» ────────
--
-- Porque son dos cosas distintas, y conviene decirlo antes de que alguien las
-- confunda al leer el diff.
--
-- **El MAPA no tiene tabla** (#231): es una capa de lectura sobre `skill_state`
-- (F4), `EstadoHistoria` (F3), `xp_totals` y `child_streak`. `packages/motor/
-- src/mapa.ts` no contiene una sola sentencia SQL, y `audits/mapa-lectura-sin-
-- tabla.mjs` lo hace cumplir.
--
-- **El COMPAÑERO sí**, y lo pide #235 con nombre y con el `CREATE TABLE` ya
-- escrito en su criterio de aceptación. No guarda progreso: guarda dos
-- preferencias que no están en ninguna otra parte —si se ve, y qué lleva
-- puesto—. Sin esta tabla, «el compañero apagado por defecto en SERIO» (#234)
-- no tendría dónde vivir y el adulto lo volvería a encontrar encendido en cada
-- aparato.
--
-- ─── Lo que esta tabla NO tiene, que es el punto entero ────────────────────
--
-- No hay `hunger`. No hay `happiness`. No hay `health`, ni `energy`, ni
-- `last_fed_at`, ni `mood`, ni ninguna columna que baje sola con el tiempo.
--
-- `mc-43` §6 documenta el caso Tamagotchi: tres medidores que decaen sin
-- atención y una muerte real como estado de fracaso. Vendió 40 millones de
-- unidades en dos años **por eso**, y produjo funerales de mentira en patios de
-- escuela por lo mismo — el mecanismo de retención y el mecanismo de culpa son
-- el mismo mecanismo. D-080 lo resuelve por construcción y no por regla: si no
-- existe la columna, nadie la puede encender dentro de un año, ni por descuido
-- ni con buena intención.
--
-- Una regla escrita se olvida en una revisión de código. Un `CREATE TABLE` de
-- cinco columnas se lee entero de un vistazo, y ninguna de las cinco decae.
--
-- ─── Y tampoco tiene precio ────────────────────────────────────────────────
--
-- Ni `price`, ni `currency`, ni `sku`, ni `rarity`, ni `drop_rate`. Línea roja
-- #5: las cajas de botín se declararon juego ilegal en Bélgica y Países Bajos
-- en 2018, y `mc-17` §7 es explícito en que el radio alcanza a lo cosmético y a
-- lo gratuito. `audits/cosmeticos-deterministas.mjs` ya bloquea una columna de
-- precio en cualquier migración; esta no le da trabajo.
--
-- ─── Numeración: 0010, con la 0009 reservada y declarada ───────────────────
--
-- El reparto definitivo, en orden de merge: **misiones 0009, mapa 0010, social
-- 0011, límite de pantalla 0012.** Este archivo es el mapa, así que es la 0010.
--
-- Este renglón existe porque la 0009 no está en `main` todavía y
-- `audits/migration-safety.mjs` **bloquea cualquier hueco en la numeración** —
-- con razón: un hueco casi siempre es una migración que ya corrió en algún
-- ambiente y se borró del repo, y desde ahí local y remoto dejan de ser el
-- mismo esquema sin que nadie lo note.
--
-- El marcador `-- migration-safety-reserva:` de arriba es la salida que la rama
-- del límite de pantalla añadió a ese auditor para exactamente este caso, y
-- tiene la mitad que importa: **una reserva rancia BLOQUEA.** El día que la
-- 0009 exista de verdad, ese renglón sobra y hay que borrarlo, o el hueco deja
-- de vigilarse para siempre.
--
-- Lo que NO se puede hacer nunca es reusar un número ya aplicado: la migración
-- perdedora quedaría marcada como corrida sin haber corrido — es exactamente el
-- hallazgo que produjo la 0008.
--
-- Cloudflare: cero recursos nuevos. Vive en `math-challenge-db` y su réplica
-- `math-challenge-db-eu`, ya inventariadas en `docs/infrastructure.md`.

-- El participante es polimórfico, igual que en `child_streak` y `xp_totals`
-- (0007): un perfil de hijo O un usuario adulto, nunca los dos y nunca ninguno.
-- El `CHECK` con `<>` sobre dos booleanos es un XOR, y es el mismo que la 0007
-- ya usa — copiarlo es a propósito: dos formas distintas de decir lo mismo en
-- el mismo esquema es cómo una de las dos se queda sin arreglar.
--
-- D-034 hace que esto no sea teórico: el adulto que aprende para sí mismo es de
-- primera clase, y es justo la banda a la que #234 le apaga el compañero.
CREATE TABLE companion_state (
  id               TEXT PRIMARY KEY,

  child_profile_id TEXT REFERENCES child_profiles(id) ON DELETE CASCADE,
  user_id          TEXT REFERENCES users(id) ON DELETE CASCADE,

  -- Si el compañero se pinta. Lo decide la persona y nada más.
  --
  -- Sin DEFAULT a propósito: quien inserta la fila tiene que decir qué banda es
  -- (`VISIBLE_AL_CREAR` en `packages/motor/src/companero.ts`), y un DEFAULT 0
  -- habría apagado a Larry en KINDER —donde CAMINA por el sendero y es el mapa
  -- entero— por herencia de una decisión que solo valía para SERIO/PRO.
  visible          INTEGER NOT NULL CHECK (visible IN (0, 1)),

  -- Ids de accesorios equipados, como arreglo JSON. Ids, nunca texto de nadie:
  -- ningún niño escribe en ninguna superficie (línea roja #3), y este campo
  -- llega desde una lista cerrada de cosméticos ya desbloqueados
  -- (`equipar()` en companero.ts descarta lo que no esté en esa lista).
  accessory_ids    TEXT NOT NULL DEFAULT '[]',

  CHECK ((child_profile_id IS NOT NULL) <> (user_id IS NOT NULL))
);

-- Una fila por participante. Los índices parciales son la forma de que un
-- UNIQUE conviva con la columna nula del otro tipo — mismo patrón que 0007.
CREATE UNIQUE INDEX idx_companion_state_perfil ON companion_state (child_profile_id)
  WHERE child_profile_id IS NOT NULL;
CREATE UNIQUE INDEX idx_companion_state_usuario ON companion_state (user_id)
  WHERE user_id IS NOT NULL;
