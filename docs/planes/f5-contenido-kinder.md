# F5 — Plan de contenido de kinder

> **Cómo se produjo esto.** 14 agentes diseñaron una habilidad cada uno, 14
> críticos adversariales revisaron cada diseño buscando lo que estuviera mal, y
> una síntesis lo consolidó. 29 agentes, 2.7 millones de tokens, 44 minutos.
>
> **No es contenido: es el plan.** No hay ni un ítem escrito. Lo que hay es la
> forma de cada plantilla, la cuenta de lo que produce, y —lo que más vale— la
> lista de lo que las críticas encontraron.
>
> **Cinco de los 29 agentes corrieron mientras el clasificador de seguridad
> estaba caído.** Sus resultados no pasaron por esa revisión, y por eso lo que
> sigue son afirmaciones de este documento, no hechos comprobados contra el
> repo. Lo que se vaya a construir se verifica antes.

# F5 — Plan de contenido consolidado (banda KINDER, K01–K14)

**Fuente:** 14 diseños de habilidad + sus 14 críticas adversariales.
**Alcance:** un nivel por habilidad (el que cada diseño eligió), no los 12 niveles de D-017.
**Regla de este documento:** todo número viene de los diseños o de las críticas. Donde no hay dato, dice *falta el dato*. Nada se estima.

---

## 0. Cómo leer esto

Cada habilidad se diseñó por separado y se criticó por separado. Las críticas encontraron tres clases de problema: cuentas que no salen del espacio de parámetros, ítems que el motor de hoy rechaza o califica mal, y causas de error que suenan bien y no existen en la investigación del repo.

Este documento no vuelve a decidir nada de contenido. Sí ordena qué se construye primero, qué está bloqueado por el motor, y qué está bloqueado por falta de investigación.

**Lo primero que hay que saber:** el banco no se queda corto contra el plan. Se pasa. Y ninguna de las 14 habilidades produce hoy un solo ítem servible, porque en 13 de 14 no se declaró ni una `enunciado.clave`.

---

## 1. La cuenta real

### 1.1 Ítems por habilidad

| Hab. | Nivel | Plantillas | Ítems declarados | Tras la crítica | Corrección aplicada |
|---|---|---|---|---|---|
| K01 subitizar 1-3 | N1 | 6 | 44 | **39** | T1 9→6 (n=1 da el mismo dibujo en 3 patrones; n=2 no admite triangular), T2 6→4 (n=1 no admite «disperso»; el distractor n−1 sería una tarjeta en blanco) |
| K02 subitizar 4-6 | N1 | 5 | 31 | **31** | Cuentas no impugnadas. P4 (6) es un documento inválido: `cual_sobra` sin `aceptables` |
| K03 contar 1-10 | N1 | 6 | 86 | **86** | Cuentas no impugnadas |
| K04 contar 1-20 | N2 | 6 | 41 | **41** | Crítica verifica una por una: 12+6+8+5+6+4 |
| K05 uno a uno | N1 | 6 | 37 | **34** | P1 7→5 (en (2,1) y (4,2) el error `dijo_el_otro_grupo` vale lo mismo que la respuesta), P4 3→2 (total=5 no admite dos escenas emparejadas t/2+t/2) |
| K06 cardinalidad | N1 | 6 | 68 | **68** | Crítica verifica: 15+10+8+8+12+15 |
| K07 comparar más/menos | N1 | 6 | 34 | **no reproducible** | Las reglas escritas dan 10+6+8+?+?+4; dos plantillas listan a mano 5 pares donde la regla produce 6 y 8 |
| K08 recta numérica 0-10 | N2 | 7 | 134 | **131** | `cuantos_saltos` 27→24: con a=0 tres de las cuatro opciones son la respuesta correcta |
| K09 marco de diez | N2 | 5 | 37 | **37** | Crítica verifica: 10+6+7+8+6 |
| K10 descomponer | N2 | 6 | 45 | **45 (dudoso)** | `larry_dice` declara 9 y su espacio de parámetros da 18: no hay regla de truncamiento escrita |
| K11 sumar contando | N2 | 8 | 158 | **150** | `haz-que-haya` declara 16 y sus parámetros dan 8 (las «2 variantes de tope» no están definidas) |
| K12 restar quitando | N2 | 6 | 119 | **119** | Crítica verifica: 23+18+18+24+18+18 |
| K13 formas básicas | N1 | 5 | 40 | **30** | `toca.forma` 8→4 (solo existe un tablero posible), `misma.forma.girada` 12→6 (el catálogo de casi-formas solo está decidido para círculo y triángulo) |
| K14 patrones AB | N2 | 7 | 90 | **90** | Crítica verifica: 27+12+9+16+8+6+12 |
| **Total** | | **85** | **964** | **935** | |

Los 935 incluyen dos números que la crítica declara no reproducibles (K07: 34; K10: 45). Si K07 se recalcula con sus propias reglas sube, no baja.

### 1.2 Contra el plan maestro §9

- Presupuesto del plan: **~400 ítems para 14 habilidades** ≈ 28,6 por habilidad.
- Producido: **964 declarados / 935 tras la crítica**, para **un solo nivel por habilidad**.
- Exceso: **+535 ítems sobre el presupuesto, 2,4× el plan.**
- **Ninguna de las 14 habilidades se queda por debajo de 28,6.** La más pequeña (K02, 31) ya lo pasa. Las cuatro más grandes (K11 150, K08 131, K12 119, K14 90) suman 490 ítems: más que el plan entero.

La suma **no** falta. Sobra. Y el exceso no es gratis: 70 de las 85 plantillas declaran `necesitaArte: true` (§2), así que cada ítem de más es arte pagado que quizá nadie vea. mc-40 impl. 4 dice que un ítem que nunca se muestra nunca acumula p-value: no es reserva, es inventario muerto.

### 1.3 Ítems que hoy no se pueden servir

**Inválidos frente a `validarItem` (packages/motor/src/item.ts):**

| Habilidad | Ítems | Motivo |
|---|---|---|
| K02 | 6 | P4 declara `cual_sobra` y niega `tambienCorrectas`; el esquema exige `respuesta.tipo: "aceptables"` con `minItems: 2` |
| K06 | 6 | T5: 3 ítems (`recito_bien_dio_otro`) no tienen su respuesta entre las opciones; 3 ítems (`fallo=ninguno`) no generan ningún error con causa |
| K08 | 11 | `cual_recta_sobra` 8 de 8 (el error nombrado por representación coincide con la respuesta correcta); `cuantos_saltos` 3 con a=0 |
| K09 | 6 | `donde-se-equivoco` no tiene ni una causa computable en las 12 entradas de la tabla de errores |
| K10 | 13 | `cual_no_arma` (6) y `arma_a_tu_manera` (7): ninguna de las 12 fórmulas de error es computable con sus parámetros |
| K12 | 15 | T2 rama b=0 (9): el error `dijo_el_total` = a = la respuesta; T5 `quedan_igual` (6): sin causa para la única respuesta incorrecta |
| K14 | 2 | `es-patron-o-no` con `caso=sano` y `largo=6`: ningún error se emite |
| **Total** | **59** | |

(K05 aporta 3 más, ya descontados en §1.1.)

**Válidos pero que no miden lo que dicen medir:**

- **K08 `flash_mas_cerca`, 18 ítems:** con p < q y la recta izquierda→derecha, la respuesta está SIEMPRE a la derecha. 18/18 sin mirar la pantalla.
- **K02 P1, 9 ítems:** las cuatro opciones {n−2, n−1, n, n+1} «siempre en el mismo orden espacial» dejan la correcta siempre en la misma casilla.
- **K07, 20 ítems:** `lado = f(a+b)` tiene la misma paridad que `d = |a−b|`, así que el lado predice la dificultad; tocar siempre izquierda acierta 6 de 10 y el 100% de los ítems con d=1.
- **K08 `donde_se_rompe` (K14), 3 ítems:** con `tambienCorrectas = [p−1]`, tocar siempre la posición 3 acierta 2 de 3.
- **K11, 39 ítems:** dos causas comparten valor y `.find()` devuelve la primera; Larry explica una causa que el niño puede no haber cometido.
- **K10, 8 de 13 ítems de `completa_el_marco`:** misma colisión.
- **K13, 5 ítems:** 3 de `misma.forma.girada` y 1 de `alguien.dice` son matemáticamente falsos (un cuadrado ES un rectángulo); 1 es degenerado (círculo girado 45° = el mismo círculo).

---

## 2. Qué genera la plantilla y qué necesita mano humana

### 2.1 Lo que salió, comparado con el plan §9 (~40% plantilla / ~29% IA revisada / ~31% a mano)

**La comparación no se puede hacer como la plantea el plan, y hay que decirlo:** el plan reparte *ítems* entre tres modos de producción. Lo que se produjo son **85 plantillas que generan el 100% de la geometría de 964 ítems, y 0 ítems servibles**. El 40% paramétrico se cumple con creces; el 31% escrito a mano no se ha empezado, y es lo único que decide si F5 existe.

| Capa | Estado | Volumen |
|---|---|---|
| Geometría del ítem (parámetros, respuesta, distractores calculados) | **Hecho, 100% paramétrico** | 964 ítems desde 85 plantillas |
| `enunciado.clave` + `vars` | **No existe en 13 de 14 habilidades** | ≥85 claves (una por plantilla, mínimo) |
| Texto de enunciado por locale | **Cero** | ≥85 × 7 locales = **≥595** unidades, autoradas (no traducidas) |
| Explicación de Larry por causa | **Cero** | 176 entradas de causa × 7 locales (ver §3 sobre claves distintas) |
| Audio | **Cero** | Todo enunciado + toda explicación + el conteo hablado de Larry, × 7 locales |
| Arte | **Cero** | **70 de 85 plantillas** declaran `necesitaArte: true` (82%) |
| `razon` de `tambienCorrectas` (D-048) | **Cero** | Una por opción válida, por ítem, por locale — y `razon` es `string`, no clave i18n |
| Curaduría de serie (D-018, mc-02) | **Cero** | Cuáles ítems, en qué orden, con qué eje entre uno y el siguiente |

Las 15 plantillas con `necesitaArte: false` están mal marcadas en al menos tres habilidades: K02 (P1/P3/P4 exigen un renderizador que garantice contraste de tamaño ×2 y calcule bounding boxes), K06 (T1/T3/T6 usan el marco y la escena), K10 (`completa_el_marco` y `arma_a_tu_manera` usan el marco de diez). **En la práctica el arte es prerrequisito del 100% de las plantillas.**

### 2.2 Lo que ninguna plantilla puede producir, por naturaleza

1. **Las explicaciones de causa.** mc-40 impl. 9 prohíbe expresamente que una explicación de error redactada por IA llegue a Larry sin revisión humana. Es el trabajo más caro del banco.
2. **El catálogo de casi-formas de K13.** Qué es «la casi-forma» de un triángulo (¿un lado curvo? ¿sin cerrar? ¿un trapecio?) no está en mc-09 ni en ningún otro documento.
3. **Las razones de `tambienCorrectas`.** El generador calcula qué elecciones son defendibles; la razón que se le dice a un niño de cinco años es prosa didáctica por locale.
4. **La disposición espacial.** mc-06 §1 [13] hace del arreglo un RADICAL: un scatter que forma accidentalmente dos grupos deja de medir conteo y pasa a medir subitizing conceptual. Ojo humano, semilla por semilla.
5. **El equilibrio de la serie.** K01 T5 produce 3 «sí» contra 6 «no»; K06 T6 tiene 3 de 5 transformaciones con respuesta «sí» (60% acertando siempre «sí»); K02 P1 y K07 tienen el lado predecible. Ningún parámetro lo arregla porque el desequilibrio no está en el ítem.
6. **La convención de llenado del marco de diez por locale.** La única fuente (mc-06 [9]) es síntesis de práctica docente estadounidense. Que la convención alemana, francesa o brasileña coincida está sin verificar.
7. **Los objetos cotidianos de K13** («¿qué cosa de la Sabana tiene forma de círculo?»): cultural, se autora siete veces.

### 2.3 Una buena noticia de costo

**K03 y K14 son las habilidades más baratas de localizar de todo el banco.** K03: las palabras del 1 al 10 son regulares en los cinco idiomas; las irregularidades que obligan a autorar (einundzwanzig, quatre-vingt-dix, mc-34 §7) empiezan arriba de 10, o sea en K04. K14: las consignas de patrones no contienen palabras-número en absoluto. Vale la pena verificar esto antes de contratar siete autorías separadas para ellas.

**Y una mala:** el plan y varios diseños dicen «cinco idiomas». `packages/motor/src/convenciones.ts` dice lo contrario: son **siete locales** (en, es-MX, es-ES, fr-FR, pt-BR, pt-PT, de-DE), y `localesQueFaltan()` itera sobre siete. Los diseños de K04 y K10 calcularon su presupuesto de audio e i18n con cinco: están **subestimados en 40%**.

---

## 3. Errores con causa nombrada

### 3.1 El titular

Los 14 diseños declaran **176 entradas de causa**. El número de **claves distintas no se puede derivar** de los diseños: K02 las escribe con prefijo punto (`error.subitiza_de_menos`, ilegal contra el regex `^[a-z][a-z0-9_]{3,48}$` del esquema), `packages/motor/src/banco-kinder.ts` usa un tercer juego (`error.subestimo`, `error.sobreestimo`), y el vocabulario cerrado de `docs/planes/esquema-item.md` §6 usa un cuarto (`subitiza_de_mas`). **`content/causas.json`, donde §6 dice que vive el vocabulario, no existe en el árbol** (verificado). Hasta que se elija uno, la causa —que es la llave de caché de las explicaciones de Larry (D-015) y la que enruta el repaso espaciado— apunta a tres cachés que nunca se cruzan.

### 3.2 Las causas que la investigación del repo sí sostiene

Son **seis familias**, todas de mc-06 y mc-09, y ninguna es específica de la habilidad donde se usa:

| Familia | Fuente | Dónde se usa | Salvedad que las críticas dejaron en pie |
|---|---|---|---|
| `se_salto_uno` / `omite_objeto` | mc-06 §2 [3] — Gelman y Gallistel, correspondencia uno a uno: «cada objeto etiquetado exactamente una vez» | K03, K04, K05, K06, K09, K10, K11, K12 | La fuente documenta el **principio**, no una tasa ni un error observado. En K01 (n≤3) el rango es por definición el que se subitiza y no se cuenta: ahí no aplica |
| `conto_uno_dos_veces` / `doble_conteo` | mc-06 §2 [3] — misma cita | mismas | Igual. Y en `arma_el_numero` (K06 T2, K12) es físicamente imposible: cada objeto se mueve una vez |
| `subestimo` / `sobreestimo` | mc-06 §1 [1][13] — el SNA es aproximado; el subitizar perceptual topa en ~4 | K01, K02, K09, K10, K11 | **La aritmética ±1 no está en la fuente.** En un rango de 3 valores legales (K01) cubre toda respuesta incorrecta por construcción: la causa es tautológica. A n=10 (K09) ±1 capturará una fracción pequeña de los fallos |
| `conto_solo_un_grupo` (composición fallida bajo destello) | mc-06 §1 [13] — subitizar perceptual y conceptual son disociables | K10 `dos_grupos_flash` | La crítica de K10 la señala como la única con cita al grano. En K03 (dos grupos estáticos, contables) la misma clave queda sin respaldo |
| `no_uso_el_conteo_para_decidir` | mc-06 §2 [3], cita literal: «preschoolers' failures on number-comparison tasks stem from not yet accessing the numerical knowledge implicit in their own counting» | K07 | La única causa de todo el banco con respaldo directo y literal. Solo emitible con \|a−b\| ≥ 2 |
| `mismo_aspecto_global` | mc-09 §1 — van Hiele Nivel 0: «shapes recognized by overall gestalt, not by properties» | K13 | El **mecanismo** está documentado; la tabla `casiForma[]` que lo hace calculable no, y en el par cuadrado↔rectángulo produce ítems matemáticamente falsos |

A esto hay que añadir dos que se presentan como sostenidas y no lo están, y conviene no tratarlas como tales:

- **`conto_todos_en_vez_de_completar` / `reconto_desde_cero`** (K09, K11, K08). mc-06 §6 documenta *count-all* como **etapa del desarrollo**, no como error de un ítem. En K08 además está mal derivada: contar todo da la respuesta **correcta**, solo que más lento.
- **`conto_el_primero_dos_veces`** (K09), etiquetada «Error REAL y el más documentado del counting-on». mc-06 §6 no documenta ni un error del counting-on.

### 3.3 Balance por habilidad

| Hab. | Causas declaradas | «Sin fuente» por el propio diseño | Marcadas inventadas o mal citadas por la crítica |
|---|---|---|---|
| K01 | 11 (+1 no-error) | 3 | ~10 de 11 (incluidas `compara_por_area` y `compara_por_tamano`, cuya cita a mc-06 §1 la crítica verificó por grep y no existe) |
| K02 | 10 | 4 | 6, más la premisa entera de P1 («el arreglo disperso rompe el subitizar») |
| K03 | 13 | 5 | 8 |
| K04 | 15 | 6 | 12 |
| K05 | 12 | 5 | 9 |
| K06 | 12 | 5 | 10 |
| K07 | 8 | 5 | **8 de 8** |
| K08 | 18 | 7 | 10 |
| K09 | 12 | 6 | 8 — la crítica cuenta **4 de 12 con fuente real** |
| K10 | 12 | 6 | **11 de 12** |
| K11 | 19 | ~9 | ~11 |
| K12 | 12 | 8 | 7 |
| K13 | 7 | 4 | **7 de 7** |
| K14 | 15 | 11 (el diseño se equivoca: son **13**) | 13, y las 2 con cita están **mal enrutadas** (prestadas de K05) |

### 3.4 Necesita validación con alumnos reales (lista aparte)

Agrupadas por mecanismo, para que se puedan revisar en lotes en vez de una por una. **Ninguna de estas debe llegar a Larry con explicación redactada hasta que un maestro de kinder o un piloto la confirme** (mc-40 impl. 9).

**(a) Conservación del número / longitud contra cantidad — ~15 claves, y no hay UNA sola línea sobre conservación en las 43-48 investigaciones del repo.**
`compara_por_area`, `compara_por_tamano_del_objeto` (K01, K02), `eligio_por_espacio_no_por_cantidad` (K03), `eligio_la_mas_esparcida`, `creyo_que_mover_cambia_la_cantidad` (K04), `miro_el_largo_no_las_parejas` (K05), `eligio_la_fila_mas_larga`, `la_fila_corta_parece_menos`, `el_orden_cambio_el_total` (K06), `se_guio_por_lo_largo_de_la_fila`, `dijo_que_no_porque_una_fila_es_mas_larga`, `dijo_que_si_porque_las_filas_miden_igual` (K07).
Cuatro diseños citan mc-06 §1 para esto y **mc-06 §1 no lo dice** (verificado por grep en tres críticas independientes). Lo que existe en mc-21 sitúa la conservación en el estadio operacional concreto (7-11 años): a los 4-6, fallarla puede ser la respuesta **normativa**, no un error diagnosticable.
**Bloquea plantillas enteras:** K04 `mover.no.cambia` (4 ítems), K06 T6 (15), K07 `fila_larga_enganosa` (5) y `dice_que_hay_lo_mismo` (6), K05 P3 (9).

**(b) Detección de errores ajenos — ~15 claves, y el paradigma no existe en el repo.**
`no_vio_el_fallo`, `vio_error_donde_no_habia`, `creyo_que_el_fallo_fue_al_final` (K04), `confundio_saltar_con_repetir`, `no_vio_el_error` (K05), `confundio_el_tipo_de_fallo`, `recito_bien_pero_senalo_mal` (K06), `no_vio_el_fallo_todavia`, `lo_vio_tarde` (K03), `miro_solo_el_final`, `creyo_que_salio_mal` (K08), `senalo_el_ultimo`, `senalo_al_vecino` (K11), `acepto_el_conteo_de_larry` (K12).
La crítica de K04 grepeó «puppet», «títere», «error detection» y «detection paradigm» en todo `docs/research/`: **cero coincidencias.** mc-06 §2 solo dice que los preescolares tienen conocimiento implícito antes de poder verbalizarlo. De ahí no sale el paradigma, ni el títere, ni el dato de «las falsas alarmas son la mitad».
**Además:** mc-36 §9 sitúa `spot-the-error` en **10+ años**, cinco por encima de esta banda, y su impl. 9 exige que el bug inyectado sea un error ya catalogado.
**Bloquea:** K03 `donde-se-equivoco` (15), K04 `larry.conto` (8), K05 P6 (6), K06 T5 (12), K08 `donde_se_equivoco` (10), K09 `donde-se-equivoco` (6), K10 `donde_se_equivoco_larry` (4), K11 `que-conto-mal-larry` (24), K12 T4 (24), K14 `donde-se-rompe` (9). **~118 ítems, el 12% del banco, sobre un formato sin respaldo a esta edad.**

**(c) Sesgo de aquiescencia y formatos binarios — 7 claves.**
`dice_que_si_a_todo` (K01), `acepta_la_afirmacion` (K02), `no_emparejo` (K05), `acepto_sin_comprobar`, `rechazo_lo_correcto` (K10), `rechazo_la_suma_correcta` (K11), `confundio_quitar_con_juntar` (K12).
Grep sobre `docs/research/`: cero ocurrencias de «acquiesc». Problema añadido: en un ítem de dos opciones, la única respuesta incorrecta **es** el error, así que la causa se dispara en el 100% de los fallos, incluido el 50% que son volados, y `inesperada` queda clavada en 0 — apagando justo la señal con la que se pensaba validar el catálogo.

**(d) Hábitos del marco de diez — 13 claves.**
`llena_el_marco_sin_contar` (K01), `solo_conto_los_sueltos`, `lleno_el_marco_y_paro`, `puso_el_numero_en_los_sueltos` (K04), `lleno_todo_el_marco`, `dijo_la_capacidad_del_marco`, `conto_los_vacios`, `se_quedo_en_la_fila_llena` (K09), `repitio_la_parte`, `puso_el_total` (K10), `lleno_el_marco`, `paro_en_la_fila_de_cinco`, `no_agrego_nada` (K11).
mc-06 §6 describe el marco como andamio; **no documenta ningún error de llenado**. Varias son físicamente inalcanzables en `arma_el_numero`: si el niño toca casillas vacías y hay 10−n, no puede tocar 10.

**(e) Niveles de knower / Give-N (Wynn) — 4 claves.** `toco_todos` (K06), `agarro_todos` (K03), `lleno_todas_las_casillas` (K05), `igualo_en_vez_de_hacer_mas` (K07). Grep de «Give-N», «knower», «Wynn»: cero resultados.

**(f) Composición parte-todo fallida — 5 claves.** `nombra_solo_un_grupo`, `cuenta_los_grupos_no_los_puntos` (K02), `conto_solo_un_grupo`, `se_quedo_en_lo_que_subitiza` (K03), `conto_solo_un_grupo` (K06). Deducidas elegantemente de la definición de subitizar conceptual; ninguna observada.

**(g) Clasificación por el atributo saliente — 8 claves.** `clasifica_por_atributo_no_por_cantidad` (K01), `elige_por_arreglo_no_por_cantidad` (K02), `eligio_por_el_dibujo_no_por_la_cantidad` (K09), `clasifico_por_cantidad` (K12), `eligio_por_el_giro`, `eligio_por_el_tamano`, `nombro_el_objeto` (K13), `alterno_el_atributo_equivocado` (K14). Todas heredan la cita de `clasifica_por_color_no_por_forma` a mc-36 §3, que describe el **tipo de tarea** «clasificar» de Swan y no documenta ningún error de clasificación observado.

**(h) Estructura de patrón — 12 claves, y la habilidad entera sin fuente.** Todo K14. mc-06 menciona «pattern» **una sola vez**, dentro de la cita NAEYC/NCTM, y su trayectoria ordenada (impl. 1, incisos a-g) no incluye patrones en ningún punto.

**(i) Formas — 2 claves + la tabla.** `el_giro_le_cambio_el_nombre` y `acepto_por_parecido` (K13). Sostienen 20 de los 40 ítems de la habilidad, y en `alguien.dice` son el único error posible en una plantilla binaria: infalsificable por construcción.

**(j) Distractores que hay que BORRAR, no validar.**

| Clave | Habilidad | Por qué |
|---|---|---|
| `error.multiplico` | K11 (en producción, banco-kinder.ts:86) | Un niño de kinder no ha visto una multiplicación. En **9 de los 25 ítems** que K11 genera hoy, a×b = max(a,b): al niño que solo contó un grupo, Larry le dice «multiplicaste» |
| `error.resto` | K11 (en producción, :87) | En 4 ítems más \|a−b\| = min(a,b). **Total: 11 de 25 ítems (44%) mal etiquetados hoy, en producción** |
| `error.sumo_en_vez_de_completar` | K10 (en producción) | Exige leer dos numerales y sumarlos; en N2 no se muestran dos numerales |
| `error.resto_al_reves` | K12 (en producción) | b−a con a>b es negativo: no hay nada que tocar |
| `error.invirtio_los_digitos` | K04 | mc-34 §7 dice que la inversión alemana empieza en **21** (einundzwanzig), fuera del 11-20 de K04. En español es fusión, no inversión |
| `error.conto_el_primero_dos_veces` | K11 (en producción, :88) | La clave y el valor no coinciden: a+b+1 no es «contó el primero dos veces» |
| `error.eligio_al_azar` | K07, K08, K09, K13 (en los 7 locales) | No es una causa, es la ausencia de causa. Definida como comodín, **apaga `inesperada`** — la única señal que detecta un catálogo incompleto |
| `error.eligio_sin_particion` | K14 | No es representable: `ErrorNombrado` es `{valor, causa}`, y esto es «el complemento del conjunto aceptado». Ya existe y se llama `inesperada` |
| `error.confunde_el_glifo_2_y_3` | K01 | El propio diseño dice «no se calcula, no debe existir». Es una nota, no una causa: va a `huecos` |

**(k) Ruido de interfaz vendido como cognición.**
`toque_doble_del_dedo` (K05): la fuente citada (mc-20 §1, Baloian 2013) dice que **ejecutar** un doble toque intencional es de los gestos más difíciles a los 5-6 — de donde se sigue lo contrario, que producirlo sin querer es raro. Lo que la fuente sí sostiene es fallo de puntería con blancos chicos, que produce «tocó el de al lado», no «tocó dos veces el mismo».
`senalo_al_vecino` (K11), `eligio_el_del_medio` (K03), `eligio_la_ficha_ajena` (K14 — que además convierte en trampa la saturación que mc-20 rec. 5 recomienda usar como señal de «esto se toca»).

---

## 4. Lo que encontraron las críticas

### 4.1 Colisiones de valor: dos causas, un número, y `.find()` decide

`calificarRespuesta` (item.ts:178) hace `item.errores.find(e => igual(eleccion, e.valor))`: devuelve **el primero del arreglo**. `validarItem` (item.ts:206-211) solo compara cada error contra la respuesta correcta, **nunca contra los otros errores**. Resultado: cuando dos causas comparten valor, la segunda es código muerto y nadie se entera.

Casos contados por las críticas:

- **K11: ~39 de 158 ítems.** `max(a,b) = a+b−1` siempre que min(a,b)=1. En `flash-dos-grupos` es la **mitad** de los ítems.
- **K10: 8 de 13** en `completa_el_marco`, más 3 de 6 en `dos_grupos_flash`.
- **K14: 39 ítems** donde `reinicio_el_nucleo` no se emite jamás; con núcleo AB solo hay dos roles, así que «repitió el último», «reinició el núcleo» y «copió al vecino» son **un solo valor con tres nombres**.
- **K09: n=6** (`se_salto_uno`=5 vs `se_quedo_en_la_fila_llena`=5) y **n=9** (`conto_uno_dos_veces`=10 vs `dijo_la_capacidad_del_marco`=10). Los tres filtros escritos apuntan a n=5, que no existe en el rango.
- **K05: tres** causas sobre el mismo escalar en la mitad de P5.
- **K01, K02, K03, K04, K06, K07, K08, K12:** todas tienen al menos una, documentada en su crítica.

**Esto roza la línea roja #7 por un `.find()`:** Larry explica con seguridad una idea equivocada a un niño que hizo otra cosa.

### 4.2 Ítems que se ganan sin hacer matemáticas

- **K08 flash:** la respuesta siempre a la derecha. 18/18.
- **K02 P1:** opciones en orden fijo, la correcta siempre en la misma casilla. 9/9.
- **K07:** el lado se deriva de la paridad de la suma, que es la misma que la de la diferencia. 6/10, y el 100% de los d=1.
- **K01 T1:** con «el tablero congelado» la posición predice la respuesta — el mismo defecto que K13 `toca.forma`, donde el `por_que` declara estar previniéndolo.
- **K14 `donde-se-rompe`:** tocar siempre la posición 3 acierta 2 de 3.
- **K02 P5:** dos tarjetas con el mismo numeral permiten localizar el par duplicado sin comparar numeral contra cantidad.
- **K06 T6:** 3 de 5 transformaciones tienen respuesta «sí» → 60% contestando siempre «sí».
- **Todos los binarios:** K05 P3 (9 ítems), K10 `larry_dice` (9), K11 `larry-se-equivoco` (24), K13 `alguien.dice` (8), K14 `es-patron-o-no` (16). **66 ítems con 50% de acierto por azar**, y en todos ellos la única respuesta incorrecta lleva causa nombrada.

`docs/planes/esquema-item.schema.json` línea 258 ya lo dice: «Los distractores se ordenan al renderizar con semilla por intento, no aquí: un orden fijo es una respuesta memorizable». K02 convirtió en virtud lo que el esquema prohíbe por nombre.

### 4.3 Citas falsas, estiradas o mal atribuidas

| Cita | Qué se le hizo decir | Qué dice |
|---|---|---|
| mc-06 §1 «la precisión del SNA depende de la razón» | K07, K08 la usan para justificar sus ejes de dificultad | Grepeado: no aparece «ratio» ni «razón» en sentido numérico. §1 dice que la precisión mejora con la edad y predice matemáticas a los 6 |
| mc-06 §1 [13] «los rasgos visuales cambian el subitizar» | K02 lo hace RADICAL y construye 9 ítems encima | «visual features» aparece **una vez en todo el corpus**: en el **título** de la entrada [13] de la bibliografía. El cuerpo de §1 cita [13] solo para la distinción perceptual/conceptual |
| mc-06 §1 «SNA contra conteo exacto» | K01, K02, K07 lo usan para `compara_por_area` | §1 no dice en ningún punto que los niños lean el área de tinta como número. El defecto viene heredado de esquema-item.md §6 línea 288 |
| mc-06 §2 «paradigma de detección de errores» | K04 sostiene una plantilla de 8 ítems y dos causas | El paradigma no existe en el repo. §2 solo dice que hay conocimiento implícito antes de la verbalización |
| mc-06 impl. 4 | K10 la cita «a favor de tocar» | Dice literalmente lo contrario: «ten-frame activities should use **drag-and-drop** into frame cells». La conclusión (tocar) es correcta; sale de mc-20, no de aquí |
| mc-06 §2 «irrelevancia del orden» | K06 la usa para conservación del número | Significa que da igual qué objeto etiquetas «uno» **dentro de un conteo**, no que reacomodar los patos entre dos conteos conserve el total |
| mc-20 §1 (23,7 mm / 88 px) | K06 T2: «8 blancos caben en un teléfono, 10 no»; K03: «separación mínima de 88 px entre centros» | §1 y la impl. 1 fijan el **tamaño del blanco**, no cuántos caben ni la separación entre centros. Si los centros están a 88 px y los blancos miden 88, quedan pegados |
| mc-36 §8 «test-wiseness» | K03 parafrasea «longitud, encaje, **posición**» | La fuente enumera «length, grammatical fit, absolute qualifiers». «Posición» se insertó en una lista citada |
| mc-36 §9 spot-the-error | K03, K12, K14 lo citan como aval | La misma tabla asigna «Ages it suits: **10+**» |
| mc-36 §5 Visual Patterns | esquema-item.md §6 lo cita para `continua_el_patron_por_repeticion` (K14) | Documenta patrones de **crecimiento** para 8+, y WODB. No dice nada de patrones de repetición ni de 4-6 años |
| mc-40 impl. 13 | K14 la usa para barajar la posición de la opción correcta | Es control de **exposición de ítems** en entrega adaptativa. Otra cosa |
| mc-07 §4 | K08 lo usa para la recta 0-10 en kinder | Compara recta contra área **para fracciones**, en 8-10 años |
| D-045 | K09 la cita como base de legalidad del flash | D-045 es el **sello de tiempo** como señal derivada anti-trampa. La autoridad del flash es master-plan §9 y el precedente de K01/K02 |
| D-023 | K04 la cita para «autores nativos» | D-023 es «repo propio e independiente». La que dice eso es **D-022** — y fija **siete** locales, no cinco |
| D-016 | K12 la cita para «la voz es la interfaz» | D-016 es el límite de pantalla. La frase está en decisions.md:272, cierre de la decisión anterior |
| master-plan §8 | K14 lo usa como aval pedagógico de «encontrar el error» | §8 es resistencia a solucionadores de IA en banda olímpica |

**Dos cifras que tampoco reproducen:** K01 declara un bug de tipos en las líneas 102, 146, 275 y 314 de `banco-kinder.ts`; re-ejecutado, son 102, 146, **269** y **309**, más cinco errores que el diseño no menciona. K07 afirma que su regla de lado «sale 5 y 5, comprobable por auditoría»; salen **4 y 6**.

### 4.4 Propósitos y formatos mal asignados

- **Dos enums cerrados incompatibles bajo el mismo nombre.** `packages/motor/src/item.ts` define `proposito` como los cinco **tipos de tarea** de Swan (clasificar, interpretar, evaluar, crear, analizar). `docs/planes/esquema-item.schema.json` lo define como los cinco **propósitos** de Swan (fluidez, concepto, resolución, lenguaje, aplicación). Los 14 diseños usan el primero; el esquema JSON rechazaría los 964 ítems. **Nadie ha casado los dos.**
- **`interpretar` es el valor por defecto cuando nadie decidió.** K11: 82 de 158 ítems (52%). K03: `contar-arreglo` (20) y `dos-grupos` (10) presentan **una sola** representación. K01: 15 de 44. En Swan, interpretar es representaciones **múltiples** del mismo objeto («el mismo 7 como puntos, marco y número», item.ts:114).
- **`crear` está forzado en cinco habilidades.** En Swan es *problem posing* — inventar un problema. Poner 14 fichas, dar N patos, armar un grupo o elegir una escena es **producir una respuesta**. Y plantear un problema exige lenguaje libre, prohibido por la línea roja #3: la salida honesta es declarar que `crear` es inalcanzable en kinder, no rellenar la casilla.
- **Formatos usados fuera de la tabla de `esquema-item.md` §5:** `cual_sobra` y `arma_el_numero` en K01; `toca_para_contar` y `arma_el_numero` en K14; `arma_el_numero` en K05 y K06.
- **`arma_el_numero` de K14 es un sexto formato con nombre prestado:** el quinto es `hotspotInteraction` sobre celdas fijas del marco; armar un listón exige paleta + listón y dos toques por ficha.
- **K10 `donde_se_equivoco_larry` declara `toca_la_respuesta` y es un hotspot** sobre hasta 10 casillas del marco — que además no caben con blancos de 88 px.

### 4.5 Conflictos con D-048

- **K01 T4, K03 `cual-sobra`:** `tambienCorrectas` se evalúa **antes** que `errores` (item.ts:173 contra :178). Si la tarjeta del color raro recibe la razón autorada que el formato obliga, se califica acierto y el distractor estrella **no se dispara nunca**.
- **K02 P4:** declara `cual_sobra` y niega `tambienCorrectas`. No es un WODB pobre: es un documento que el validador rechaza.
- **K06 T4:** para neutralizar «sobra la flor porque es la única flor» pone **cuatro familias distintas** — con lo que las cuatro son «la única de su tipo» y el razonamiento no numérico queda disponible para todas.
- **K09:** fabrica a propósito tres arreglos distintos de la misma cantidad y luego puntúa acc=0 a quien use esa partición.
- **K12 T3:** trata D-048 como una amenaza a evitar («si no, D-048 obligaría a dar por buena…») en vez de como la regla a cumplir. Cero `tambienCorrectas`.
- **K13:** cero `tambienCorrectas` en las cinco plantillas, y con el par cuadrado/rectángulo eso produce ítems **matemáticamente falsos**.
- **K10 `arma_a_tu_manera`, K11 `haz-que-haya`:** usan `tambienCorrectas` fuera de `cual_sobra`, que es una extensión **que el dueño no ha aprobado**.
- **El campo `razon` es `string`, no `{clave, vars}`** (item.ts:77): escribirla produce un ítem monolingüe por construcción, y son ~42 cadenas en español dentro del banco solo en K10.

### 4.6 `inesperada` apagada justo donde hacía falta

`VeredictoDeItem.inesperada` (item.ts:183) es la señal que mc-40 nombra para detectar un catálogo de errores incompleto — y **todos los diseños la nombran como su plan de validación**. Se apaga sola en:

- Todo formato binario (66 ítems).
- K03 `donde-se-equivoco`: tres causas por rango cubren el 100% del espacio de respuesta.
- K05 P4 y P6, K09 `cual-sobra`, K13, K14: `eligio_al_azar` / `eligio_sin_particion` definidos como comodín.
- K02 P1: los dos distractores emitidos a propósito, con lo que el plan de piloto declarado («mirar `inesperada` para decidir la dirección del error») no puede ejecutarse nunca.

**La plantilla con más causas inventadas es, en varias habilidades, exactamente aquella donde el detector queda apagado por construcción.**

### 4.7 Límites físicos que nadie calculó

Blanco táctil 88×88 px CSS (mc-20 impl. 1, de los 23,7 mm de Hourcade). Mercado objetivo: Android de gama baja, 360-390 px de ancho.

- **K08:** recta de 11 casillas × 88 = **968 px**. Solo cabe por encima de ~1000 px. (La crítica añade que si la recta es dibujo y no superficie de respuesta, el mínimo táctil no aplica — y sobre esa aplicación equivocada el diseño descartó 2 de 5 formatos y 1 de 5 propósitos.)
- **K09:** marco 2×5 = ≥440 px. Cuatro marcos simultáneos en `cual-sobra` dan ~17 px por casilla.
- **K03 `cual-sobra`:** 34 objetos × 7.744 px² = 263.000 px² contra ~273.000 de un viewport 390×700. **96% de la pantalla**, con empaquetado perfecto, sin Larry y sin barra.
- **K04:** 4 escenas × hasta 19 objetos = hasta 75 simultáneos; `contar.arreglo` 20 objetos tocables = ~155.000 px²; el marco doble mide 440 px de ancho.
- **K14:** listón de 6 fichas + 3-4 opciones no cabe sin encoger la ficha o meter scroll, y el scroll es un gesto que mc-20 §1 no valida a esta edad.

### 4.8 Bloqueos del motor y del esquema (transversales)

| # | Bloqueo | Dónde | Habilidades afectadas |
|---|---|---|---|
| 1 | `id()` concatena solo los **valores** de los parámetros, sin nombre de plantilla | banco-kinder.ts:61-63 | Todas las que tienen >1 plantilla: K01, K03, K05, K06, K09, K10, K12, K13, K14. K12 tiene 18 colisiones seguras (T1 vs T3) |
| 2 | `Plantilla.generar(params: Record<string, number>)` no admite parámetros categóricos | banco-kinder.ts:56-60 | K03, K05, K09, K12, K13, K14 — mínimo 3 de 6 plantillas en cada una |
| 3 | `.find()` devuelve la primera causa; `validarItem` no compara errores entre sí | item.ts:178, 206-211 | Todas (§4.1) |
| 4 | `tambienCorrectas` se evalúa antes que `errores` | item.ts:173 vs 178 | K01, K03 (§4.5) |
| 5 | `Item` no guarda proceso (traza de toques) | item.ts | K05 (la habilidad **es** el proceso), K11 (count-all vs count-on es el objetivo de K11), K06 (`reconto_en_vez_de_contestar`) |
| 6 | La respuesta es un escalar: no identifica panel, ficha ni posición | item.ts:162 | K01 T2, K03 `cual-sobra`, K08, K14 `eligio_por_el_giro` |
| 7 | `errores` no puede depender del locale | item.ts | K04 (`invirtio_los_digitos` sería real en de-DE y no en en-US) |
| 8 | `errores` no puede depender de otro ítem | item.ts | K07 (dos plantillas enteras dependen del gemelo de control) |
| 9 | `razon` de `tambienCorrectas` es `string`, no clave i18n | item.ts:77 | K09, K10, K13, K14 |
| 10 | No hay campo de prerrequisito en la escalera | tabla `skills` | K09/K10/K11 (el marco va después de cardinalidad, mc-06 impl. 11), K14 (presupone K03) |
| 11 | No hay `status` ni versión de ítem (mc-40 impl. 4/5/7) | item.ts | Todas — renombrar causas o borrar distractores **edita ítems en sitio**, que mc-40 prohíbe |
| 12 | Dos enums de `proposito` incompatibles | item.ts vs esquema-item.schema.json | Todas (§4.4) |
| 13 | Vocabulario de causas: 3-4 convenciones, `content/causas.json` **no existe** (verificado) | — | Todas |
| 14 | `enunciado.clave` sin declarar | — | **13 de 14 habilidades.** La única clave existente es `k.resta.patos` / `k.suma.patos` / `k.flash.puntos` en el banco actual, y ninguna está definida en ningún locale |
| 15 | No hay regla de qué 3-4 distractores se pintan de los 5-6 que calcula la plantilla | — | K01, K04, K09, K11 |
| 16 | `serie.ts` MAX_SEGUIDOS = 2 impide servir gemelos adyacentes | serie.ts:69, 167-189 | K07 (dos plantillas lo exigen), K10 (su único remedio al 50/50 lo exige) |
| 17 | `validarSerie` se **salta** el intercalado cuando hay <2 formatos disponibles | serie.ts:173-176 | K03 — la premisa fundacional de su rediseño («una sola plantilla no puede pasar validarSerie») es falsa |
| 18 | Sin gesto de deshacer en `toca_para_contar` / `arma_el_numero` | — | K05, K11, K12 — un toque accidental es una respuesta incorrecta irrecuperable: **línea roja #8** |

### 4.9 Líneas rojas rozadas

- **#7 (Larry no avergüenza y no calcula).** Se cruza indirectamente en cada colisión de valor: Larry nombra con seguridad un error que el niño no cometió. Y **48 de 158 ítems de K11 (30%), 24 de K12 y plantillas enteras de K03/K04/K08/K09/K10** ponen a Larry contando mal en voz alta, sin ninguna decisión en `decisions.md` que lo autorice. K06 (Pati) y K13 lo resuelven bien proponiendo un personaje par; K04 señala el problema real: en `contar.arreglo` la voz de Larry **es** la verdad, y en `larry.conto` la misma voz miente, sin señal que un prelector pueda usar.
- **#8 (nunca penalizar corregir).** Ver bloqueo 18.
- **#3 (ningún niño escribe texto libre).** Todas las plantillas lo respetan. La consecuencia que nadie declaró: `evaluar` en Swan pide «true/false **con justificación**», y sin justificación queda degradado a un binario casi sin poder diagnóstico. Eso hay que decirlo, no atribuirlo a `serie.ts`.

### 4.10 Lo que las críticas confirmaron que está bien

Para no rehacerlo: **ningún ítem de las 85 plantillas pide leer, escribir ni arrastrar** — los cinco formatos son de tocar y `arma_el_numero` es tocar casillas, no arrastrar fichas (mc-20 impl. 2 respetada). **Ningún enunciado aparece como texto ya formado** dentro del banco (salvo `razon` y las etiquetas de opción de K06). **Casi todos los distractores se derivan del parámetro**, no se escriben a mano. Las cuentas de K04, K06, K09, K12 y K14 se verificaron una por una. La exclusión de `flash` en K03, K04, K10 y K12 está bien argumentada y bien citada. El diagnóstico del K07 actual (45 ítems donde el correcto es siempre el segundo) y el de `error.multiplico` (11 de 25 mal etiquetados, en producción) son reales y reproducibles.

---

## 5. Orden de construcción

**No por número.** La trayectoria de mc-06 impl. 1 va (a) subitizar → (b) principios de conteo → (c) cardinalidad → (d) marco de diez → (e) descomponer → … → (g) recta numérica **al final**. Y mc-06 impl. 11 es explícita: los marcos van después de que cardinalidad y subitizar estén establecidos, «introducirlos antes arriesga enseñar un truco visual sin el concepto».

### Fase 0 — Antes de escribir un solo ítem (bloquea todo)

1. Elegir **un** vocabulario de causas y crear `content/causas.json` (bloqueo 13).
2. Elegir **un** enum de `proposito` (bloqueo 12).
3. Arreglar `id()` con nombre de plantilla, **con retiro versionado, no edición en sitio** (bloqueos 1 y 11).
4. Ensanchar `Plantilla` a parámetros categóricos (bloqueo 2).
5. `validarItem`: rechazar dos errores con el mismo valor, y errores cuyo valor no esté entre las opciones pintadas (bloqueo 3).
6. Definir la regla de selección de distractores (bloqueo 15).
7. Borrar `error.multiplico`, `error.resto`, `error.sumo_en_vez_de_completar`, `error.resto_al_reves`, `error.eligio_al_azar` del banco en producción.
8. Decidir el gesto de deshacer (bloqueo 18, línea roja #8).

### Fase 1 — Subitizar (mc-06 impl. 1a)

**K01 (39) → K02 (31).** Antes: decidir si K02 se parte (4 perceptual / 5-6 conceptual) o se acepta por escrito que una habilidad contiene dos tareas cognitivas distintas. Hoy K01 y K02 salen del **mismo generador**, lo que afirma en código que son la misma tarea.

### Fase 2 — Principios de conteo (mc-06 impl. 1b)

**K03 (86) → K05 (34).** K05 exige tocar K03 primero para declararle `dispersion: fila`; si no, las dos habilidades generan ítems indistinguibles salvo por el prefijo del id. K05 no puede medir su habilidad sin la traza de toques (bloqueo 5): decidir si se implementa o si K05 mide el total y se dice.

### Fase 3 — Cardinalidad (mc-06 impl. 1c)

**K06 (68, −6 inválidos).** Es prerrequisito declarado de la fase 5.

### Fase 4 — Contar 1-20 y comparar

**K04 (41) → K07 (34, cuenta no reproducible).** K04 depende de que se resuelva antes el conflicto de secuencia: usa el marco doble, que es K09, y mc-06 impl. 11 pone el marco **después**. K07 depende de la investigación de conservación (§3.4a): 5 de sus 8 causas y 2 de sus 6 plantillas están bloqueadas.

### Fase 5 — Marco de diez y descomponer (mc-06 impl. 1d, 1e)

**K09 (37, −6) → K10 (45, −13).** Antes: resolver la frontera K09/K10, porque `K09-cuantos-faltan` **es** K10 con total=10 y otra etiqueta. Y verificar la convención de llenado en los siete locales.

### Fase 6 — Sumar y restar contando (mc-06 §6)

**K11 (150) → K12 (119, −15).** El objetivo declarado de K11 (count-all → count-on) **no es medible** sin la traza de toques: las dos estrategias dan la misma respuesta correcta. O se implementa el bloqueo 5, o K11 no mide lo que dice medir y hay que escribirlo.

### Fase 7 — Recta numérica (mc-06 impl. 1g, el último paso)

**K08 (131, −11).** Antes: decidir si la recta se sirve solo en ≥1000 px (tableta/escritorio), si es dibujo y no superficie de respuesta, o si se rediseña. Partirla en dos renglones **no** es salida: mc-06 §3 midió que el tablero circular no produjo el efecto, así que la geometría lineal es contenido.

### Pista paralela — Fuera de la trayectoria numérica

- **K13 formas (30).** Su fuente es mc-09, no mc-06. Puede construirse en cualquier momento tras la fase 0, **pero** necesita: borrar el par cuadrado/rectángulo del catálogo o meterlo en `tambienCorrectas`, un catálogo de casi-formas autorado, y el **fallback audio-táctil que mc-09 impl. 9 pide «from day one»** — que ninguno de los once huecos del diseño menciona, en la única habilidad donde el dibujo *es* la respuesta.
- **K14 patrones (90). BLOQUEADA.** La existencia de la habilidad no tiene fuente: mc-06 menciona «pattern» una sola vez y su trayectoria no la incluye. Hace falta una investigación nueva (mc-49) antes de escribir causas; con el corpus de hoy y la regla de esquema-item.md §6 («una causa sin fuente citada no entra»), K14 tiene **cero** causas propias.

---

## 6. Lo que este plan NO resuelve

### 6.1 Decisiones que faltan del dueño

1. **¿Larry puede equivocarse delante del niño?** Afecta a 7 habilidades y a ~118 ítems. Decisión única para todo el banco: o Larry, o un personaje par (Pati de K06 es la propuesta más desarrollada, y no existe: hay que diseñarlo en Recraft con continuidad).
2. **¿Se parte K02** en 4-perceptual / 5-6-conceptual, o se acepta por escrito que una habilidad contiene dos tareas?
3. **¿Cuál es el presupuesto real de ítems por habilidad?** 964 contra ~400. Nadie ha decidido si K11 necesita 150 o 20.
4. **¿D-048 se extiende fuera de `cual_sobra`?** (K10 `arma_a_tu_manera`, K11 `haz-que-haya`).
5. **¿El flash puntúa?** Y en particular: ¿puntúa la rama deliberadamente difícil de K09 (7 fichas dispersas), diseñada para que el niño falle? mc-06 pregunta abierta 2 lo deja al dueño.
6. **¿Se topa el trabajo simbólico en 0-10** hasta pasar una compuerta? (mc-06 pregunta abierta 1; afecta a K03, que muestra los numerales 11 y 12 en 4 ítems).
7. **¿La recta numérica se sirve solo en pantallas grandes?**
8. **Los prerrequisitos de la escalera** (columna `prereq` vacía para las 14 habilidades).
9. **¿Cinco idiomas o siete locales?** El plan y varios diseños dicen cinco; el código dice siete. Cambia el presupuesto de i18n y audio en 40%.
10. **Si K14 existe** como habilidad de kinder.

### 6.2 Investigación que falta (candidatas a mc-49+)

| Tema | Qué desbloquea | Volumen bloqueado |
|---|---|---|
| Conservación del número (Piaget; Clearfield & Mix, extensión continua) | ~15 causas en 7 habilidades | K04 `mover.no.cambia`, K05 P3, K06 T6, K07 dos plantillas |
| Paradigma de detección de errores de conteo (Gelman & Meck) | ~15 causas; el formato «¿se equivocó X?» entero | **~118 ítems en 10 habilidades** |
| Niveles de knower / Give-N (Wynn) | 4 causas | K03, K05, K06, K07 |
| Errores de figuras en kinder (Clements & Sarama; Burger & Shaughnessy) | Las 7 causas de K13 y el catálogo de casi-formas | K13 entera |
| Patterning temprano | La existencia de K14 | K14 entera (90 ítems) |
| Sesgo de aquiescencia en preescolares | 7 causas | Los 66 ítems binarios |
| Duración de flash por cantidad y por estructura | El único parámetro que decide si la tarea es subitizar o conteo rápido | K01, K02, K08, K09, K10 |
| ¿Funciona `spot-the-error` a los 4-6? | mc-36 lo asigna a 10+ | Ver fila 2 |

### 6.3 Lo que necesita específicamente a un maestro de kinder

No a un traductor, no a un modelo, no a un ingeniero:

1. **Validar o tirar ~120 causas** de las 176 declaradas. Es el entregable que decide si Larry sirve.
2. **Escribir las explicaciones de error**, una por causa por locale, revisadas (mc-40 impl. 9). Con feedback **explicativo**, no motivacional (mc-06 impl. 8).
3. **Escribir las razones de `tambienCorrectas`** por opción, por ítem, por locale.
4. **Decidir el catálogo de casi-formas** de K13 y el catálogo de familias de pares de K05 (perro/sombrero, pájaro/nido: el emparejamiento tiene que leerse como *necesario*, y eso es cultural).
5. **Aprobar cada escena dispersa a ojo:** que un scatter no forme accidentalmente dos grupos subitizables, que la fila «estirada» del ítem trampa de verdad se vea más larga en un teléfono real.
6. **Verificar la convención de llenado del marco** en de-DE, fr-FR, pt-PT y pt-BR.
7. **Elegir los objetos cotidianos** de K13 por locale.
8. **Curar la serie**: qué ~28 ítems de los 964, en qué orden, con qué eje entre uno y el siguiente. Es D-018 y mc-02, y es lo único que convierte 964 preguntas sueltas en un producto.
9. **Equilibrar sí/no y lado** por serie, que es donde el desequilibrio vive y donde ninguna plantilla lo puede arreglar.

### 6.4 La frase que resume el estado

De las 176 causas declaradas, **seis familias tienen fuente en la investigación del repo**, y las seis vienen de mc-06 §1/§2/§6 y mc-09 §1 — ninguna es específica de la habilidad donde se usa. mc-40 lo documenta con cita (arXiv 2404.02124): los modelos redactan distractores matemáticamente válidos y son malos anticipando los errores que los alumnos reales cometen. **Este banco es exactamente eso, hecho bien: 964 ítems de geometría impecable sobre concepciones erróneas que nadie ha observado.** El instrumento para desmentirlo existe (`inesperada`), y varias de las plantillas más especulativas lo apagan por construcción.

---

**Archivos que este plan toca y que hay que abrir antes de empezar:**
`/Users/estebanrey/Documents/dev/math-challenge/packages/motor/src/item.ts`,
`/Users/estebanrey/Documents/dev/math-challenge/packages/motor/src/banco-kinder.ts`,
`/Users/estebanrey/Documents/dev/math-challenge/packages/motor/src/serie.ts`,
`/Users/estebanrey/Documents/dev/math-challenge/packages/motor/src/convenciones.ts`,
`/Users/estebanrey/Documents/dev/math-challenge/docs/planes/esquema-item.md`,
`/Users/estebanrey/Documents/dev/math-challenge/docs/planes/esquema-item.schema.json`,
`/Users/estebanrey/Documents/dev/math-challenge/docs/master-plan.md`,
`/Users/estebanrey/Documents/dev/math-challenge/docs/decisions.md`.
**No existe** `/Users/estebanrey/Documents/dev/math-challenge/content/causas.json` (verificado), y es el primer archivo que hay que crear.
