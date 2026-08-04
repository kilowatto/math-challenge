-- 0016_banco_items_primaria.sql — el banco de ítems de PRIMARIA vive en D1
--
-- F5c #351 (paraguas #350). Decisión: D-072 — el banco de primaria se guarda
-- en D1 y no en código, para que un ítem se corrija sin desplegar. KINDER
-- sigue en `packages/motor/src/banco-kinder.ts`: es el híbrido consciente de
-- D-072, y la decisión nombra su propia deuda («si en seis meses KINDER sigue
-- siendo la excepción, la excepción se volvió la regla»).
--
-- Lo que esta tabla NO es, dicho porque se parece: **no es una tabla de
-- intentos**. Los intentos siguen fuera de D1 (mc-32 riesgo #1, auditor
-- `no-attempts-in-d1`). Un banco es lectura alta y escritura casi nula; un
-- intento es exactamente lo contrario. Esta migración no abre esa puerta.
--
-- La SIEMBRA no va aquí a propósito. La produce
-- `scripts/sembrar-banco-primaria.mjs` desde las plantillas paramétricas de
-- `packages/motor/src/banco-primaria.ts` (mc-40: el 40% del banco son
-- plantillas), con `INSERT OR IGNORE`: una fila que ya existe en D1 —incluida
-- una corregida a mano, que es la razón de ser de D-072— no la pisa una
-- re-siembra. Si las filas vinieran en esta migración, cada corrección de
-- contenido necesitaría una migración nueva, y el banco habría cambiado de
-- sitio sin cambiar de problema.

-- ---------------------------------------------------------------------------
-- item_bank — un ítem por fila, como ESTRUCTURA (plan §9), jamás como texto
-- ---------------------------------------------------------------------------
-- `item_json` es el `Item` de `packages/motor/src/item.ts` serializado:
-- enunciado como {clave, vars}, respuesta con tolerancia, `errores` con causa
-- nombrada. Guardar el enunciado ya formado («¿Cuánto es 36 + 47?») ataría el
-- ítem a un idioma y a una notación decimal; como estructura se sirve en los
-- siete locales con el separador de cada uno (D-022, mc-34).
--
-- Deliberadamente SIN: ni texto de interfaz (vive en `i18n/reto/`, por clave),
-- ni precio/probabilidad/rareza (líneas rojas #4 y #5 — un ítem no se cobra ni
-- se sortea), ni ninguna referencia a un niño (el banco es de todos; el modelo
-- del niño vive en su Durable Object).

CREATE TABLE item_bank (
  id             TEXT PRIMARY KEY,
  -- Las seis bandas de D-017. Hoy solo se siembra PRIMARIA; KINDER queda en
  -- código por D-072 y las demás no tienen contenido todavía.
  banda          TEXT NOT NULL CHECK (banda IN
                    ('KINDER','PRIMARIA','SECUNDARIA','SERIO','JR','PRO')),
  habilidad      TEXT NOT NULL,          -- P01…P04 en la primera siembra
  nivel          INTEGER NOT NULL CHECK (nivel BETWEEN 1 AND 12),  -- D-017
  -- Techo de servicio: NULL = sin techo. La reversión de la pericia (Kalyuga,
  -- mc-04) documenta que un andamiaje que enseña al principiante PERJUDICA al
  -- que ya sabe, así que el modelo 3 (ejemplo resuelto con un paso en blanco)
  -- tiene que poder apagarse por nivel (#354). La columna existe desde el
  -- esquema porque añadirla después exigiría tocar cada fila ya curada.
  hasta_nivel    INTEGER CHECK (hasta_nivel IS NULL OR hasta_nivel BETWEEN 1 AND 12),
  -- El prior de arranque en frío, en logits (mc-13 impl. 8). Es un juicio
  -- humano escrito una vez; la calificación viva la mueven las respuestas y
  -- no vive en esta columna.
  dificultad     REAL NOT NULL,
  item_json      TEXT NOT NULL,          -- el Item como estructura (plan §9)
  creado_en      INTEGER NOT NULL,
  actualizado_en INTEGER NOT NULL
);

-- El índice de lectura: el selector adaptativo pide por banda y habilidad, y
-- dentro de ellas por nivel (#351). Sin él, cada «qué ítem toca» recorre la
-- tabla entera (mc-32 riesgo #12: en D1 eso se paga en CPU, meses después y
-- sin error visible).
CREATE INDEX idx_item_bank_lectura ON item_bank (banda, habilidad, nivel);
