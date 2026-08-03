# F11 · Catálogo de contenido — los 54 retos del piso, autorados

> **2026-08-03.** El plan de F11 (`f11-cierre.md` §2) fijó el piso — 6
> retos por nivel en N4-N12, 2 fijos + 4 plantillas por nivel (D-122) —
> pero dejó las materias en tabla. Este documento es el contenido mismo:
> los 54 retos, en **20 ramas de matemáticas**, con respuesta y
> distractores de causa nombrada, en el formato real del `Item` del motor
> (`packages/motor/src/item.ts:99`).
>
> **Regla del documento:** cada reto es estructura, jamás texto formado
> (CLAUDE.md § Contenido). El texto visible vive en las claves de
> enunciado; los números viajan como `vars` y se renderizan por locale
> con `numeros.ts` (D-123: una autoría, siete notaciones). Toda `causa`
> es una clave nueva que hay que registrar en el vocabulario de causas
> con su fuente — las clásicas vienen de `mc-07` (fracciones) y `mc-08`
> (álgebra).
>
> **Estado:** propuesta autorada, no revisada por humano todavía. La
> regla del proyecto es que todo ítem pasa revisión humana antes de
> entrar al banco (mc-40) — este documento es el insumo de esa revisión,
> no el banco.

## Cómo se lee cada entrada

- **FIJO**: reto curado a mano, JSON completo listo para revisión.
- **PLANTILLA**: `radical` (lo que gradúa la dificultad) e `incidental`
  (lo que cambia por instancia sin cambiar la enseñanza), más **una
  instancia de ejemplo** verificada. El motor de parametrización de F5c
  genera las demás.
- `dificultad_experta`: escala 1-100 para el adaptativo (`mc-44`
  implicación 2). `proposito`: los cinco de Swan (`mc-36`) — el banco
  no puede ser puro `calcular`.
- Formato único: `toca_la_respuesta` (el único que funciona hoy en
  producción — F5c). Nada de arrastre, nada de texto libre (línea roja
  #3), todo auto-calificable (D-124).

## Mapa de ramas (20) por nivel

| Nivel | Ramas |
|---|---|
| N4 | Aritmética entera · Divisibilidad |
| N5 | Fracciones · Geometría plana (área/perímetro) |
| N6 | Decimales · Porcentaje · Razón y proporción · Estadística (media) |
| N7 | Pre-álgebra · Sucesiones · Enteros con signo |
| N8 | Álgebra (ecuaciones, sistemas) · Geometría analítica |
| N9 | Funciones · Trigonometría · Probabilidad |
| N10 | Cálculo diferencial · Cálculo integral · Estadística (mediana) · Trigonometría aplicada |
| N11 | Combinatoria · Teoría de números · Álgebra lineal (matrices) |
| N12 | Análisis real · Álgebra abstracta · Cálculo vectorial · Topología · Lógica y demostración |

---

## N4 — Aritmética entera · Divisibilidad

**FIJO n4-mult-f1** · dificultad_experta 38 · proposito `interpretar`

```json
{
  "id": "n4-mult-f1", "habilidad": "N4-MULTIPLICACION", "nivel": 4,
  "formato": "toca_la_respuesta",
  "enunciado": { "clave": "n4.multiplicacion.dos_por_dos", "vars": { "a": 23, "b": 14 } },
  "respuesta": { "valor": 322, "tol": 0 },
  "errores": [
    { "valor": 92,  "causa": "multiplico_solo_las_unidades" },
    { "valor": 230, "causa": "multiplico_solo_la_decena" },
    { "valor": 312, "causa": "error_de_acarreo" }
  ],
  "proposito": "interpretar", "variacion": null
}
```

**FIJO n4-div-f2** · dificultad_experta 44 · proposito `analizar`

```json
{
  "id": "n4-div-f2", "habilidad": "N4-DIVISION", "nivel": 4,
  "formato": "toca_la_respuesta",
  "enunciado": { "clave": "n4.division.exacta", "vars": { "a": 144, "b": 12 } },
  "respuesta": { "valor": 12, "tol": 0 },
  "errores": [
    { "valor": 132, "causa": "resto_en_vez_de_dividir" },
    { "valor": 11,  "causa": "error_en_la_tabla_del_12" },
    { "valor": 14,  "causa": "sumo_los_digitos_del_divisor" }
  ],
  "proposito": "analizar", "variacion": null
}
```

**PLANTILLA n4-p1 · multiplicación 2d × 1d** · radical: con/sin acarreo ·
incidental: los dígitos. Ejemplo verificado: `47 × 6 = 282` (errores:
`242` — acarreo olvidado; `42` — solo unidades; `2820` — cero de más,
`confunde_valor_posicional`).

**PLANTILLA n4-p2 · multiplicación 2d × 2d** · radical: tamaño de la
decena · incidental: dígitos. Ejemplo: `31 × 12 = 372` (errores: `62`,
`341`, `382`).

**PLANTILLA n4-p3 · división exacta 3d ÷ 1d** · radical: con/sin paso
intermedio de la tabla · incidental: dígitos. Ejemplo: `256 ÷ 8 = 32`
(errores: `31`, `4`, `248`).

**PLANTILLA n4-p4 · ¿cuál de estos números es múltiplo de N?** ·
radical: el divisor (3, 4, 6, 9) · incidental: las cuatro opciones.
Ejemplo: ¿múltiplo de 9? → `117` (errores: `115` — cerca pero no;
`98`; `111` — suma de dígitos 3, confunde regla del 9 con la del 3
invertida, `confunde_criterios_de_divisibilidad`).

## N5 — Fracciones · Geometría plana

**FIJO n5-frac-f1** · dificultad_experta 46 · proposito `interpretar`

```json
{
  "id": "n5-frac-f1", "habilidad": "N5-FRACCIONES", "nivel": 5,
  "formato": "toca_la_respuesta",
  "enunciado": { "clave": "n5.fraccion.suma_distinto_denominador", "vars": { "a": 1, "b": 2, "c": 1, "d": 3 } },
  "respuesta": { "valor": "5/6", "tol": 0 },
  "errores": [
    { "valor": "2/5", "causa": "suma_numeradores_y_denominadores" },
    { "valor": "2/6", "causa": "suma_solo_numeradores_con_denominador_comun_inventado" },
    { "valor": "1",   "causa": "redondea_mentalmente_a_uno" }
  ],
  "proposito": "interpretar", "variacion": null
}
```

(La primera causa es la fila 1 de la tabla de `mc-07`: el error más
documentado de la enseñanza de fracciones.)

**FIJO n5-geo-f2** · dificultad_experta 40 · proposito `clasificar`

```json
{
  "id": "n5-geo-f2", "habilidad": "N5-GEOMETRIA", "nivel": 5,
  "formato": "toca_la_respuesta",
  "enunciado": { "clave": "n5.geometria.area_rectangulo", "vars": { "base": 9, "altura": 7 } },
  "respuesta": { "valor": 63, "tol": 0 },
  "errores": [
    { "valor": 32, "causa": "calculo_el_perimetro" },
    { "valor": 16, "causa": "sumo_base_y_altura" },
    { "valor": 56, "causa": "error_en_la_tabla_del_9" }
  ],
  "proposito": "clasificar", "variacion": null
}
```

**PLANTILLA n5-p1 · comparación de fracciones** · radical: mismo
numerador vs. distinto · incidental: los valores. Ejemplo: ¿mayor,
`3/4` o `5/6`? → `5/6` (errores: `3/4` — `compara_solo_denominadores`;
`iguales` — `cree_equivalentes_sin_verificar`).

**PLANTILLA n5-p2 · fracción de una cantidad** · radical: la fracción
(unitaria vs. compuesta) · incidental: la cantidad. Ejemplo: `2/3 de
24 = 16` (errores: `36` — invirtió la fracción; `8` — solo un tercio;
`12` — mitad).

**PLANTILLA n5-p3 · área del triángulo** · radical: altura entera vs.
mitad exacta · incidental: base y altura. Ejemplo: base 10, altura 6 →
`30` (errores: `60` — `olvido_dividir_entre_dos`; `16`; `32`).

**PLANTILLA n5-p4 · perímetro con un lado desconocido** · radical:
figura (rectángulo vs. triángulo isósceles) · incidental: medidas.
Ejemplo: rectángulo con perímetro 26 y base 8 → altura `5` (errores:
`9` — no dividió entre dos; `18`; `4`).

## N6 — Decimales · Porcentaje · Razón · Estadística

**FIJO n6-dec-f1** · dificultad_experta 42 · proposito `interpretar`

```json
{
  "id": "n6-dec-f1", "habilidad": "N6-DECIMALES", "nivel": 6,
  "formato": "toca_la_respuesta",
  "enunciado": { "clave": "n6.decimal.suma", "vars": { "a": "0.4", "b": "0.25" } },
  "respuesta": { "valor": "0.65", "tol": 0 },
  "errores": [
    { "valor": "0.29", "causa": "alinea_mal_los_decimales" },
    { "valor": "0.45", "causa": "olvido_el_acarreo_decimal" },
    { "valor": "2.9",  "causa": "error_de_valor_posicional" }
  ],
  "proposito": "interpretar", "variacion": null
}
```

**FIJO n6-porc-f2** · dificultad_experta 48 · proposito `interpretar`

```json
{
  "id": "n6-porc-f2", "habilidad": "N6-PORCENTAJE", "nivel": 6,
  "formato": "toca_la_respuesta",
  "enunciado": { "clave": "n6.porcentaje.de_cantidad", "vars": { "p": 25, "n": 80 } },
  "respuesta": { "valor": 20, "tol": 0 },
  "errores": [
    { "valor": 25, "causa": "confunde_el_porcentaje_con_la_cantidad" },
    { "valor": 40, "causa": "calculo_la_mitad_en_vez_del_cuarto" },
    { "valor": 2,  "causa": "dividio_entre_el_porcentaje_dos_veces" }
  ],
  "proposito": "interpretar", "variacion": null
}
```

**PLANTILLA n6-p1 · resta de decimales con distinto número de cifras** ·
radical: acarreo/prestamo · incidental: valores. Ejemplo: `1.2 − 0.75 =
0.45` (errores: `0.55` — alineación; `1.55`; `0.35`).

**PLANTILLA n6-p2 · razón/proporción directa** · radical: factor entero
vs. mitad · incidental: el contexto (receta, mapa). Ejemplo: «3 vasos
para 2 personas, ¿para 6?» → `9` (errores: `6` — sumó en vez de
multiplicar, `proporcion_aditiva_en_vez_de_multiplicativa`; `4`; `12`).

**PLANTILLA n6-p3 · media de cuatro números** · radical: con/sin
decimal en el resultado · incidental: los valores. Ejemplo: media de
`4, 7, 9, 12` → `8` (errores: `32` — no dividió; `9`; `7`).

**PLANTILLA n6-p4 · porcentaje de aumento/descuento** · radical:
aumento vs. descuento · incidental: precio y tasa. Ejemplo: «playera
de 60 con 10% de descuento» → `54` (errores: `6` — solo el descuento;
`66` — sumó; `50`).

## N7 — Pre-álgebra · Sucesiones · Enteros

**FIJO n7-eq-f1** · dificultad_experta 45 · proposito `analizar`

```json
{
  "id": "n7-eq-f1", "habilidad": "N7-PREALGEBRA", "nivel": 7,
  "formato": "toca_la_respuesta",
  "enunciado": { "clave": "n7.ecuacion.x_mas_a", "vars": { "a": 7, "b": 15 } },
  "respuesta": { "valor": 8, "tol": 0 },
  "errores": [
    { "valor": 22,  "causa": "sumo_en_vez_de_despejar" },
    { "valor": -8,  "causa": "cambio_el_signo_al_pasar_el_termino" },
    { "valor": 105, "causa": "multiplico_en_vez_de_despejar" }
  ],
  "proposito": "analizar", "variacion": null
}
```

**FIJO n7-suc-f2** · dificultad_experta 41 · proposito `crear`

```json
{
  "id": "n7-suc-f2", "habilidad": "N7-SUCESIONES", "nivel": 7,
  "formato": "toca_la_respuesta",
  "enunciado": { "clave": "n7.sucesion.aritmetica_siguiente", "vars": { "a1": 3, "a2": 7, "a3": 11, "a4": 15 } },
  "respuesta": { "valor": 19, "tol": 0 },
  "errores": [
    { "valor": 18, "causa": "sumo_la_diferencia_mal" },
    { "valor": 20, "causa": "confunde_diferencia_con_termino" },
    { "valor": 16, "causa": "sumo_uno_en_vez_de_la_diferencia" }
  ],
  "proposito": "crear", "variacion": null
}
```

**PLANTILLA n7-p1 · ecuación ax = b con coeficiente** · radical:
coeficiente compartido vs. primo con b · incidental: valores. Ejemplo:
`3x = 27 → 9` (errores: `24` — restó; `81`; `7`).

**PLANTILLA n7-p2 · suma de enteros con signo** · radical: resultado
positivo vs. negativo · incidental: valores. Ejemplo: `-3 + 8 = 5`
(errores: `-11` — `suma_los_absolutos_y_conserva_el_signo`; `11`;
`-5`).

**PLANTILLA n7-p3 · evaluar expresión lineal** · radical: coeficiente 2
vs. 3 · incidental: valores. Ejemplo: `2x + 3` con `x = 4` → `11`
(errores: `14` — sumó todo; `10`; `24`).

**PLANTILLA n7-p4 · sucesión con patrón de multiplicación** · radical:
×2 vs. +d · incidental: primer término. Ejemplo: `2, 6, 18, …` → `54`
(errores: `24` — vio +4, `vio_suma_donde_hay_producto`; `36`; `52`).

## N8 — Álgebra · Geometría analítica

**FIJO n8-eq-f1** · dificultad_experta 52 · proposito `analizar`

```json
{
  "id": "n8-eq-f1", "habilidad": "N8-ALGEBRA", "nivel": 8,
  "formato": "toca_la_respuesta",
  "enunciado": { "clave": "n8.ecuacion.ax_mas_b", "vars": { "a": 2, "b": 6, "c": 20 } },
  "respuesta": { "valor": 7, "tol": 0 },
  "errores": [
    { "valor": 10, "causa": "olvido_el_termino_constante" },
    { "valor": 13, "causa": "sumo_la_constante_en_vez_de_restarla" },
    { "valor": 4,  "causa": "dividio_solo_parte_del_resultado" }
  ],
  "proposito": "analizar", "variacion": null
}
```

(`olvido_el_termino_constante` y `sumo_la_constante_en_vez_de_restarla`
son filas de la tabla de las 9 «reglas mal aprendidas» de `mc-08`.)

**FIJO n8-sis-f2** · dificultad_experta 58 · proposito `analizar`

```json
{
  "id": "n8-sis-f2", "habilidad": "N8-SISTEMAS", "nivel": 8,
  "formato": "toca_la_respuesta",
  "enunciado": { "clave": "n8.sistema.dos_ecuaciones", "vars": { "suma": 10, "diferencia": 4 } },
  "respuesta": { "valor": 7, "tol": 0 },
  "errores": [
    { "valor": 3,  "causa": "dio_la_otra_variable" },
    { "valor": 5,  "causa": "promedio_sin_usar_la_segunda_ecuacion" },
    { "valor": 14, "causa": "sumo_ambos_resultados" }
  ],
  "proposito": "analizar", "variacion": null
}
```

**PLANTILLA n8-p1 · ecuación con paréntesis a(x + b) = c** · radical:
con/sin factor común · incidental: valores. Ejemplo: `3(x + 2) = 21 →
5` (errores: `19` — no distribuyó, `olvido_distribuir`; `7`; `6`).

**PLANTILLA n8-p2 · pendiente entre dos puntos** · radical: pendiente
entera vs. fraccionaria · incidental: los puntos. Ejemplo: entre (1, 2)
y (5, 10) → `2` (errores: `1/2` — invirtió el cociente,
`invirtio_orden_de_la_pendiente`; `8`; `4`).

**PLANTILLA n8-p3 · sistema con suma y producto dados** · radical:
producto factorizable fácil · incidental: valores. Ejemplo: «dos
números suman 12 y multiplican 35» → `7` o `5` (se pide el mayor;
errores: `6` — la mitad; `35`; `8`).

**PLANTILLA n8-p4 · distancia entre dos puntos del plano** · radical:
eje compartido vs. diagonal pitagórica · incidental: puntos. Ejemplo:
entre (0, 0) y (3, 4) → `5` (errores: `7` — sumó; `12`; `25` — no sacó
raíz, `olvido_la_raiz_en_pitagoras`).

## N9 — Funciones · Trigonometría · Probabilidad

**FIJO n9-fun-f1** · dificultad_experta 55 · proposito `interpretar`

```json
{
  "id": "n9-fun-f1", "habilidad": "N9-FUNCIONES", "nivel": 9,
  "formato": "toca_la_respuesta",
  "enunciado": { "clave": "n9.funcion.cuadratica_evaluar", "vars": { "a": 1, "b": -3, "c": 2, "x": 4 } },
  "respuesta": { "valor": 6, "tol": 0 },
  "errores": [
    { "valor": 2,  "causa": "evaluo_en_otro_punto" },
    { "valor": 14, "causa": "signo_perdido_en_el_termino_lineal" },
    { "valor": -6, "causa": "error_de_signo_global" }
  ],
  "proposito": "interpretar", "variacion": null
}
```

**FIJO n9-trig-f2** · dificultad_experta 50 · proposito `clasificar`

```json
{
  "id": "n9-trig-f2", "habilidad": "N9-TRIGONOMETRIA", "nivel": 9,
  "formato": "toca_la_respuesta",
  "enunciado": { "clave": "n9.trigonometria.razon_especial", "vars": { "funcion": "sen", "angulo": 30 } },
  "respuesta": { "valor": "1/2", "tol": 0 },
  "errores": [
    { "valor": "√3/2", "causa": "confunde_seno_con_coseno" },
    { "valor": "√2/2", "causa": "confunde_el_angulo_con_45" },
    { "valor": "1",    "causa": "confunde_con_el_angulo_recto" }
  ],
  "proposito": "clasificar", "variacion": null
}
```

**PLANTILLA n9-p1 · vértice de una parábola** · radical: b par vs.
impar · incidental: coeficientes. Ejemplo: `f(x) = x² − 6x + 5`, la x
del vértice → `3` (errores: `-3` — signo de la fórmula; `6`; `5`).

**PLANTILLA n9-p2 · razón trigonométrica en triángulo rectángulo** ·
radical: sen/cos/tan · incidental: lados (ternas 3-4-5, 5-12-13).
Ejemplo: cateto opuesto 3, hipotenusa 5 → sen = `3/5` (errores: `4/5`
— usó el adyacente; `3/4` — eso es la tangente,
`confunde_las_razones_trigonometricas`; `5/3`).

**PLANTILLA n9-p3 · probabilidad con un dado** · radical: evento simple
vs. compuesto · incidental: el evento. Ejemplo: P(sacar más de 4) →
`1/3` (errores: `1/2` — contó desde 4; `1/6`; `2/3`).

**PLANTILLA n9-p4 · probabilidad en urna** · radical: con/sin reposición
conceptual (una sola extracción) · incidental: composición. Ejemplo: 4
rojas y 6 azules, P(roja) → `2/5` (errores: `4/6` — comparó entre
colores, `comparo_subconjuntos_en_vez_de_parte_a_total`; `1/2`; `4`).

## N10 — Cálculo (diferencial e integral) · Estadística · Trigonometría aplicada

**FIJO n10-der-f1** · dificultad_experta 62 · proposito `interpretar`

```json
{
  "id": "n10-der-f1", "habilidad": "N10-DERIVADAS", "nivel": 10,
  "formato": "toca_la_respuesta",
  "enunciado": { "clave": "n10.derivada.polinomio_en_punto", "vars": { "a": 3, "b": 2, "x": 2 } },
  "respuesta": { "valor": 14, "tol": 0 },
  "errores": [
    { "valor": 16, "causa": "sustituye_sin_derivar" },
    { "valor": 12, "causa": "derivo_solo_el_termino_cuadratico" },
    { "valor": 10, "causa": "error_al_evaluar_la_derivada" }
  ],
  "proposito": "interpretar", "variacion": null
}
```

(f'(x) = 6x + 2; en x = 2: 14. El primer distractor es el valor de la
función sin derivar —f(2) = 16— la confusión central del inicio del
cálculo; el segundo es olvidar el término lineal al derivar —6x en
x = 2—.)

**FIJO n10-est-f2** · dificultad_experta 52 · proposito `clasificar`

```json
{
  "id": "n10-est-f2", "habilidad": "N10-ESTADISTICA", "nivel": 10,
  "formato": "toca_la_respuesta",
  "enunciado": { "clave": "n10.estadistica.mediana", "vars": { "datos": "3, 7, 8, 12, 15" } },
  "respuesta": { "valor": 8, "tol": 0 },
  "errores": [
    { "valor": 9,  "causa": "confunde_mediana_con_media" },
    { "valor": 7,  "causa": "no_ordeno_los_datos" },
    { "valor": 12, "causa": "confunde_mediana_con_rango" }
  ],
  "proposito": "clasificar", "variacion": null
}
```

**PLANTILLA n10-p1 · integral definida de potencia** · radical:
exponente 1 vs. 2 · incidental: límites. Ejemplo: ∫₀² 2x dx → `4`
(errores: `2` — no evaluó los límites; `8`; `6` —
`integro_el_coeficiente_mal`).

**PLANTILLA n10-p2 · regla de la cadena simple** · radical: función
interna lineal · incidental: coeficientes. Ejemplo: d/dx (2x + 1)² en
x = 1 → `12` (errores: `4` — olvidó la derivada interna,
`olvido_la_regla_de_la_cadena`; `6`; `9`).

**PLANTILLA n10-p3 · media con dato que cambia** · radical: agregar un
valor vs. quitarlo · incidental: datos. Ejemplo: «la media de 4
números es 10; tres de ellos son 8, 11 y 13» → el cuarto es `8`
(errores: `40` — el total; `10`; `11`).

**PLANTILLA n10-p4 · hipotenusa con terna pitagórica escalada** ·
radical: escala (×2, ×3, ×10) · incidental: la terna base. Ejemplo:
catetos 9 y 12 → `15` (errores: `21` — sumó; `225` — no sacó raíz;
`13`).

## N11 — Combinatoria · Teoría de números · Álgebra lineal

**FIJO n11-comb-f1** · dificultad_experta 66 · proposito `analizar`

```json
{
  "id": "n11-comb-f1", "habilidad": "N11-COMBINATORIA", "nivel": 11,
  "formato": "toca_la_respuesta",
  "enunciado": { "clave": "n11.combinatoria.combinaciones", "vars": { "n": 5, "k": 2 } },
  "respuesta": { "valor": 10, "tol": 0 },
  "errores": [
    { "valor": 20, "causa": "conto_el_orden_cuando_no_importa" },
    { "valor": 25, "causa": "elevo_en_vez_de_combinar" },
    { "valor": 5,  "causa": "confunde_combinaciones_con_eleccion_simple" }
  ],
  "proposito": "analizar", "variacion": null
}
```

**FIJO n11-tn-f2** · dificultad_experta 60 · proposito `clasificar`

```json
{
  "id": "n11-tn-f2", "habilidad": "N11-TEORIA-DE-NUMEROS", "nivel": 11,
  "formato": "toca_la_respuesta",
  "enunciado": { "clave": "n11.teoria_numeros.mcd", "vars": { "a": 18, "b": 24 } },
  "respuesta": { "valor": 6, "tol": 0 },
  "errores": [
    { "valor": 72, "causa": "confunde_mcd_con_mcm" },
    { "valor": 3,  "causa": "encontro_un_divisor_comun_no_el_mayor" },
    { "valor": 12, "causa": "error_al_descomponer_en_primos" }
  ],
  "proposito": "clasificar", "variacion": null
}
```

**PLANTILLA n11-p1 · permutaciones de k de n** · radical: k = 2 vs. 3 ·
incidental: n. Ejemplo: P(6, 2) → `30` (errores: `15` — combinó en vez
de permutar; `36`; `12`).

**PLANTILLA n11-p2 · mcm de dos números** · radical: primos entre sí
vs. con factor común · incidental: valores. Ejemplo: mcm(6, 8) → `24`
(errores: `48` — multiplicó directo, `multiplico_sin_quitar_el_factor_comun`;
`2` — eso es el mcd; `14`).

**PLANTILLA n11-p3 · determinante 2×2** · radical: signos de las
entradas · incidental: valores. Ejemplo: det [[2, 3], [1, 4]] → `5`
(errores: `11` — sumó todo; `2` — restó los productos al revés,
`invirtio_el_orden_del_determinante`; `8`).

**PLANTILLA n11-p4 · un elemento del producto de matrices 2×2** ·
radical: posición pedida · incidental: valores. Ejemplo: (AB)₁₁ con
A = [[1, 2], [0, 1]], B = [[3, 1], [1, 1]] → `5` (errores: `3` — solo
el primer término del producto interno; `4`; `7`).

## N12 — Análisis real · Álgebra abstracta · Cálculo vectorial · Topología · Lógica

**FIJO n12-lim-f1** · dificultad_experta 72 · proposito `analizar`

```json
{
  "id": "n12-lim-f1", "habilidad": "N12-ANALISIS", "nivel": 12,
  "formato": "toca_la_respuesta",
  "enunciado": { "clave": "n12.analisis.limite_indeterminado", "vars": { "a": 1 } },
  "respuesta": { "valor": 2, "tol": 0 },
  "errores": [
    { "valor": 0, "causa": "sustituye_en_indeterminacion" },
    { "valor": 1, "causa": "cancelo_mal_el_factor" },
    { "valor": "no existe", "causa": "confunde_indeterminacion_con_inexistencia" }
  ],
  "proposito": "analizar", "variacion": null
}
```

(límite de (x² − 1)/(x − 1) cuando x → 1: factorizar (x−1)(x+1)/(x−1)
→ x + 1 → 2. Toca el punto de `mc-12`: evaluar un razonamiento, no solo
un número.)

**FIJO n12-vec-f2** · dificultad_experta 64 · proposito `interpretar`

```json
{
  "id": "n12-vec-f2", "habilidad": "N12-VECTORES", "nivel": 12,
  "formato": "toca_la_respuesta",
  "enunciado": { "clave": "n12.vectores.producto_punto", "vars": { "u": "1,2", "v": "3,4" } },
  "respuesta": { "valor": 11, "tol": 0 },
  "errores": [
    { "valor": 10, "causa": "sumo_las_componentes_sin_ponderar" },
    { "valor": 24, "causa": "multiplico_las_magnitudes" },
    { "valor": 7,  "causa": "sumo_los_productos_parciales_mal" }
  ],
  "proposito": "interpretar", "variacion": null
}
```

**PLANTILLA n12-p1 · derivada de un producto en un punto** · radical:
grado de los factores · incidental: coeficientes. Ejemplo: d/dx
[x · (x + 3)] en x = 2 → `7` (errores: `3` — derivó cada factor por
separado y multiplicó, `derivo_los_factores_por_separado`; `10`;
`4`).

**PLANTILLA n12-p2 · componente z del producto cruz en el plano** ·
radical: signo del resultado · incidental: vectores. Ejemplo:
(1, 2, 0) × (3, 4, 0), componente z → `-2` (errores: `2` — signo
invertido, `invirtio_el_orden_del_producto_cruz`; `10`; `-10`).

**PLANTILLA n12-p3 · orden de un elemento en Z_n** · radical: el
elemento generador vs. no generador · incidental: n. Ejemplo: orden de
2 en Z₅ (aditivo) → `5` (errores: `2` — confundió el elemento con su
orden; `4`; `1`).

**PLANTILLA n12-p4 · lógica de la negación** · radical: cuantificador
(∀ vs. ∃) · incidental: la afirmación. Ejemplo: la negación de «todo
número par es divisible entre 4» es «existe un número par que no es
divisible entre 4» — opciones: la negación correcta, «ningún número par
es divisible entre 4» (`niego_la_proposicion_en_vez_del_cuantificador`
— la fila central de `mc-12`: negar mal mata la prueba por
contradicción), «todo número impar es divisible entre 4».

**PLANTILLA n12-p5 (topología, formato evaluar)** · ¿Cuál afirmación
sobre funciones continuas es verdadera? → «la imagen inversa de un
abierto es abierta» (errores: «la imagen de un abierto siempre es
abierta» — `confunde_imagen_con_imagen_inversa`; «la imagen de un
cerrado siempre es cerrada»; «toda función continua es abierta»).

> **Nota de conteo:** N12 lleva 5 plantillas y no 4 porque la pista
> Lean 4 (D-124) aterrizará como sexta pieza de ese nivel cuando exista;
> el piso de 6 por nivel se cumple con las 5 + 2 fijos = 7 entradas —
> la pista Lean queda **además**, nunca como sustituto.

## Lo que este catálogo NO hace

- **No entró al banco.** Es propuesta autorada: cada reto pasa revisión
  humana (la regla de mc-40 y de CLAUDE.md § Contenido) antes de
  insertarse en D1. Las causas nuevas se registran en el vocabulario
  con su fuente en el mismo PR de inserción.
- **No cubre geometría con figura dibujada** (formato pictórico): el
  único formato en producción es `toca_la_respuesta` numérico/de
  opciones; las figuras con gramática fija de descripción (`mc-38`)
  son una extensión de formato, no de este catálogo.
- **No incluye la pista Lean 4** — su esqueleto formalizado es trabajo
  de su propia issue (D-124).
- **No reemplaza la ubicación adaptativa** (§2.4 del plan de F11: el
  piso es un piso).

---

## Anexo (2026-08-03, D-147) — Los retos LOGI («Acertijos»), adicionales al piso

Un reto LOGI por nivel, autorado con la misma regla (estructura, causas
nombradas, `toca_la_respuesta`). **No cuentan dentro de los 6 del piso**:
son la rama transversal (D-147). La escalera completa y su evidencia
están en `docs/research/2026-08-03-mc-52-logica-para-ninos.md`.

**N4 · atributos compuestos (Y/NO encarnados)** · dificultad_experta 34 ·
proposito `clasificar`

```json
{
  "id": "n4-logi-atributos", "habilidad": "LOGI-ATRIBUTOS", "nivel": 4,
  "formato": "toca_la_respuesta",
  "enunciado": { "clave": "logi.atributos.doble_regla", "vars": { "regla1": "roja", "regla2": "redonda" } },
  "respuesta": { "valor": "circulo_rojo", "tol": 0 },
  "errores": [
    { "valor": "cuadrado_rojo", "causa": "cumplio_una_sola_regla" },
    { "valor": "circulo_azul",  "causa": "cumplio_una_sola_regla" }
  ],
  "dibujos": {
    "circulo_rojo":  { "clave": "logi.figura.circulo_rojo",  "glifo": "●", "cuantos": 1 },
    "cuadrado_rojo": { "clave": "logi.figura.cuadrado_rojo", "glifo": "■", "cuantos": 1 },
    "circulo_azul":  { "clave": "logi.figura.circulo_azul",  "glifo": "●", "cuantos": 1 }
  },
  "proposito": "clasificar", "variacion": null
}
```

**N5 · la regla O (con D-048: dos respuestas correctas autoradas)** ·
dificultad_experta 40 · proposito `clasificar`

```json
{
  "id": "n5-logi-regla_o", "habilidad": "LOGI-ATRIBUTOS", "nivel": 5,
  "formato": "toca_la_respuesta",
  "enunciado": { "clave": "logi.atributos.regla_o", "vars": { "regla1": "grande", "regla2": "roja" } },
  "respuesta": { "valor": "circulo_grande_azul", "tol": 0 },
  "tambienCorrectas": [
    { "valor": "cuadrado_chico_rojo", "razon": "tambien_cumple_la_regla_o" }
  ],
  "errores": [
    { "valor": "cuadrado_chico_azul", "causa": "no_cumple_ninguna_de_las_dos" },
    { "valor": "circulo_grande_rojo", "causa": "pidio_las_dos_cuando_bastaba_una" }
  ],
  "proposito": "clasificar", "variacion": null
}
```

(El distractor `pidio_las_dos_cuando_bastaba_una` es el error real de la
disyunción: el niño que lee «O» como «Y». Su texto de Larry explica la
diferencia con la regla, no con el niño.)

**N6 · el primer acertijo (una sola afirmación es verdad)** ·
dificultad_experta 48 · proposito `analizar`

```json
{
  "id": "n6-logi-acertijo_cajas", "habilidad": "LOGI-ACERTIJOS", "nivel": 6,
  "formato": "toca_la_respuesta",
  "enunciado": { "clave": "logi.acertijo.tres_cajas", "vars": {} },
  "respuesta": { "valor": "caja_b", "tol": 0 },
  "errores": [
    { "valor": "caja_a", "causa": "siguio_la_afirmacion_sin_verificarla" },
    { "valor": "caja_c", "causa": "confundio_la_caja_que_habla_con_la_del_premio" }
  ],
  "proposito": "analizar", "variacion": null
}
```

(Tres cajas; solo una dice la verdad. A dice «el premio está aquí», B
dice «el premio no está aquí», C dice «el premio no está en A». A y C se
contradicen, así que una de las dos es la verdadera — y entonces B
miente: el premio ESTÁ en B. Es el análisis de casos de los Math
Circles, en tres líneas.)

**N7 · la contrapositiva sin nombrarla** · dificultad_experta 52 ·
proposito `evaluar`

```json
{
  "id": "n7-logi-contrapositiva", "habilidad": "LOGI-ACERTIJOS", "nivel": 7,
  "formato": "toca_la_respuesta",
  "enunciado": { "clave": "logi.acertijo.zorbos", "vars": { "criatura": "zorbo", "color": "azul" } },
  "respuesta": { "valor": "no", "tol": 0 },
  "errores": [
    { "valor": "si", "causa": "asumio_la_inversa" },
    { "valor": "no_se_puede_saber", "causa": "confundio_certeza_con_duda" }
  ],
  "proposito": "evaluar", "variacion": null
}
```

(«Todos los zorbos son azules. Esto no es azul. ¿Es un zorbo?» El
distractor `no_se_puede_saber` es el más interesante: muchos niños —y
adultos— lo eligen por prudencia mal entendida. La explicación de Larry
distingue «no sé» de «sé que no».)

**N8 · la primera tabla de verdad (2 variables)** · dificultad_experta 55 ·
proposito `interpretar`

```json
{
  "id": "n8-logi-tabla_y", "habilidad": "LOGI-TABLAS", "nivel": 8,
  "formato": "toca_la_respuesta",
  "enunciado": { "clave": "logi.tabla.dos_variables_y", "vars": { "regla": "roja Y redonda" } },
  "respuesta": { "valor": 1, "tol": 0 },
  "errores": [
    { "valor": 2, "causa": "confundio_y_con_o" },
    { "valor": 4, "causa": "conto_todas_las_filas" },
    { "valor": 0, "causa": "penso_que_ninguna_cumple" }
  ],
  "proposito": "interpretar", "variacion": null
}
```

(La tabla se dibuja 2×2 con figuras: roja sí/no × redonda sí/no. La
pregunta es «¿en cuántas filas es verdad?» — la tabla como foto del
razonamiento de N4-N5, como pide mc-52 §2.)

**N9 · tres variables** · dificultad_experta 60 · proposito `interpretar`

```json
{
  "id": "n9-logi-tabla_tres", "habilidad": "LOGI-TABLAS", "nivel": 9,
  "formato": "toca_la_respuesta",
  "enunciado": { "clave": "logi.tabla.tres_interruptores", "vars": { "necesarios": "A y B" } },
  "respuesta": { "valor": 2, "tol": 0 },
  "errores": [
    { "valor": 4, "causa": "confundio_y_con_o" },
    { "valor": 1, "causa": "exigio_tambien_el_tercero" },
    { "valor": 8, "causa": "conto_todas_las_combinaciones" }
  ],
  "proposito": "interpretar", "variacion": null
}
```

(Tres interruptores; la luz enciende solo si A y B están prendidos, C da
igual. 2³ = 8 combinaciones; A∧B se cumple en 2. Es la primera vez que
«da igual» es parte del razonamiento — la semilla de las variables
libres.)

**N10 · De Morgan con atributos** · dificultad_experta 64 · proposito `evaluar`

```json
{
  "id": "n10-logi-demorgan", "habilidad": "LOGI-TABLAS", "nivel": 10,
  "formato": "toca_la_respuesta",
  "enunciado": { "clave": "logi.demorgan.negar_compuesta", "vars": { "regla1": "grande", "regla2": "roja" } },
  "respuesta": { "valor": "no_es_grande_o_no_es_roja", "tol": 0 },
  "errores": [
    { "valor": "no_es_grande_y_no_es_roja", "causa": "nego_sin_cambiar_y_por_o" },
    { "valor": "es_chica_y_azul", "causa": "niego_los_atributos_en_vez_de_la_regla" }
  ],
  "proposito": "evaluar", "variacion": null
}
```

(El primer distractor es EL error de De Morgan — el que la literatura
documenta como el fallo más persistente de la lógica escolar. Su causa
nombrada alimenta la mejor explicación que Larry puede dar en toda la
rama: «negar "las dos cosas" no es negar cada cosa».)

**N11 · predicados sobre una pecera** · dificultad_experta 58 ·
proposito `clasificar`

```json
{
  "id": "n11-logi-predicados", "habilidad": "LOGI-PREDICADOS", "nivel": 11,
  "formato": "toca_la_respuesta",
  "enunciado": { "clave": "logi.predicados.pecera", "vars": { "rojos": 3, "azules": 2 } },
  "respuesta": { "valor": "algunos_son_rojos", "tol": 0 },
  "errores": [
    { "valor": "todos_son_rojos", "causa": "confundio_alguno_con_todos" },
    { "valor": "ninguno_es_azul", "causa": "niego_el_subconjunto_que_si_existe" },
    { "valor": "la_mitad_son_rojos", "causa": "no_conto_el_total" }
  ],
  "proposito": "clasificar", "variacion": null
}
```

**N12 · negación de cuantificadores + detectar la línea que rompe** · ya
autorados en la sección N12 de este documento (`n12-p4` y su plantilla
de lógica de la negación) — son la cima de esta misma escalera, no un
contenido aparte.

**Causas nuevas que esta rama registra en el vocabulario** (con su
fuente): `cumplio_una_sola_regla`, `no_cumple_ninguna_de_las_dos`,
`pidio_las_dos_cuando_bastaba_una`, `siguio_la_afirmacion_sin_verificarla`,
`confundio_la_caja_que_habla_con_la_del_premio`, `asumio_la_inversa`,
`confundio_certeza_con_duda`, `confundio_y_con_o`, `conto_todas_las_filas`,
`penso_que_ninguna_cumple`, `exigio_tambien_el_tercero`,
`conto_todas_las_combinaciones`, `nego_sin_cambiar_y_por_o`,
`niego_los_atributos_en_vez_de_la_regla`, `confundio_alguno_con_todos`,
`niego_el_subconjunto_que_si_existe`, `no_conto_el_total` — fuente:
mc-52 §3 (errores reales de la literatura de enseñanza de la lógica) y
mc-12 (cuantificadores).
