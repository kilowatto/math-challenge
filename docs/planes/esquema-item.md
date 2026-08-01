# Esquema de ítem — propuesta para §9 del plan maestro

> **Estado: propuesta. No está implementada, no hay migración escrita en
> `migrations/`, no hay commit.** Lo único que este trabajo dejó en el árbol son
> tres archivos bajo `docs/planes/`:
>
> | Archivo | Qué es |
> |---|---|
> | `docs/planes/esquema-item.md` | este documento |
> | `docs/planes/esquema-item.schema.json` | el esquema, en JSON Schema draft-07 |
> | `docs/planes/esquema-item-demo.mjs` | la prueba ejecutable de que aguanta |
>
> Reprodúcelo todo con un comando:
>
> ```
> node docs/planes/esquema-item-demo.mjs
> ```
>
> Sale con código 0 y con la salida que está pegada en §8 y §9. Si algo de este
> documento afirma un hecho, el comando que lo prueba está junto a la
> afirmación.

Fecha: 2026-07-31 · Desbloquea: **F5** (contenido kinder, la ruta crítica) y
**F5b** (franja adulta) · No depende de F2 ni de F3.

---

## 1. Qué tiene que hacer cumplir este esquema

No es una lista de campos bonitos. Cada pieza existe porque una decisión ya
tomada la exige, y la columna de la derecha es dónde vive esa exigencia en el
esquema — no en la cabeza de quien autora.

| Regla | De dónde viene | Dónde vive en el esquema |
|---|---|---|
| Un ítem se guarda como **estructura**, jamás como texto formado | CLAUDE.md § Contenido; `mc-34` implicación 1 | `cuerpo.escena` es un árbol de nodos `op`/`num`/`coleccion`. Ningún nodo puede contener un símbolo de notación |
| Todo ítem trae **errores con causa nombrada** | CLAUDE.md § Contenido; D-004 punto 1 | `errores` tiene `minItems: 1` y cada entrada exige `causa` de un vocabulario cerrado |
| La unidad de diseño es la **serie** | D-018 | El reto solo se compone en modo `serie` o `receta`, y **ambos exigen `variacion.{varia, constante, por_que}`** |
| El contenido de kinder no se traduce, **se autora** | D-022, `mc-34` §7 | `autoria: "por_locale"` obliga a `locale`, y son siete ítems hermanos bajo una `familia` |
| La franja adulta se autora una vez y se renderiza siete veces | D-034 | `autoria: "universal"` **prohíbe** el campo `locale` |
| Ningún niño escribe texto libre | Línea roja #3 | `additionalProperties: false` en todo el árbol. No hay ningún campo de texto del alumno, y no se puede agregar uno sin que el validador lo rechace |
| Nunca se penaliza borrar o corregir | Línea roja #8, `mc-30` | **No existe** campo de intentos permitidos, de bloqueo de cambio ni de penalización. La ausencia es el mecanismo |
| Larry nunca calcula: recibe el veredicto | Línea roja #7 | El ítem trae la respuesta y las explicaciones **pregeneradas y revisadas** por causa. Larry recibe `causa` y devuelve la frase, nunca el número |
| Kinder no se cronometra, ni visible ni invisible | D-024 | El ítem **no tiene** campo de tiempo. `flash_ms` es exposición del estímulo, no reloj, y está acotado a 200-2000 ms. Un reto de banda KINDER no puede ser `FLUIDEZ` ni `DUELO` |
| Siete locales, no cinco idiomas | D-022 | El `enum` de `locale` tiene los siete y es el único lugar donde se declara |

Los cinco controles positivos de §9 muestran cada una de estas reglas
**rechazando** un documento que la viola. Una regla que nunca se vio bloquear no
prueba nada (CLAUDE.md § Git, regla 3).

---

## 2. Las cuatro capas, y por qué son cuatro

```
  habilidad   K01..K14 (kinder) · S1xx (franja adulta)
      │        el nodo que agenda el repaso espaciado. Ya existe en D1:
      │        skill_state.skill_id (migrations/0002_child_profiles.sql)
      ▼
  modelo      plantilla paramétrica (AIG). Separa RADICALES —lo que fija la
      │       dificultad— de INCIDENTALES —lo que varía sin cambiarla.
      │       ~70% de kinder sale de aquí (mc-40).
      ▼
  ítem        la pregunta atómica: estructura + respuesta + errores con causa.
      │       Es lo que se califica.
      ▼
  reto        lo que el niño juega y lo que da puntos. 1..N ítems (D-018).
              Dos formas de componerlo: SERIE curada o RECETA. Ver §10.
```

Y una capa transversal que no es una de las cuatro:

```
  frase       content/frases/<locale>.json — el ÚNICO lugar del sistema donde
              existe texto de contenido. Lo escribe un autor nativo, no un
              traductor (D-022). El ítem solo guarda la llave y las variables.
```

La razón de separar la frase del ítem no es elegancia: es dinero. Un modelo se
traduce una vez y cubre todas sus instancias — 200 unidades de traducción contra
5,960 (`mc-40` implicación 3). Es la palanca de localización más grande del
plan, y solo funciona si el texto no vive dentro del ítem.

---

## 3. Dónde vive el contenido

**Fuente de verdad: el repositorio, en `content/`.** No una base de datos.

```
content/
  causas.json                     vocabulario cerrado de causas de error
  frases/<locale>.json            el texto, autorado por locale
  modelos/K04-palabra-a-numeral.json
  items/K04/K04-numeral-17-de-DE.json
  retos/K04-serie-decenas-01.json
```

Tres razones, todas verificables en el repo:

1. **El banco de ítems es producto, y el producto se revisa en PR.** CLAUDE.md
   ya tiene un tipo de commit propio para esto: `content`. Sin fuente en git, un
   cambio de contenido no pasa por revisión humana, que es exactamente lo que
   `mc-40` (implicación 9) prohíbe para todo lo redactado con IA.
2. **No hay CI ni panel de administración.** Los gates de este proyecto son
   locales, en el gancho `pre-commit` (D-032, tal como quedó en F0). Un auditor
   determinista solo puede validar contenido que esté en el árbol.
3. **Cabe.** Un ítem serializado pesa **1,090 bytes**; 400 ítems × 7 locales +
   150 adultos = **3.07 MB**, el **0.03%** del tope de 10 GB de D1 (`mc-32`
   riesgo #1). El banco no es un problema de tamaño en ninguna de las opciones.
   El comando mide el ítem de ejemplo de §4 leyéndolo de este mismo archivo
   (va con cuatro comillas invertidas porque el propio comando contiene tres):

````
node -e '
const marca="`" + "``jsonc";
const item=require("fs").readFileSync("docs/planes/esquema-item.md","utf8")
  .split(marca)[1].split("`" + "``")[0].replace(/\/\/.*$/gm,"");
const b=Buffer.byteLength(JSON.stringify(JSON.parse(item)),"utf8");
console.log("bytes:",b,"| 400x7+150 =",(((400*7+150)*b)/1024/1024).toFixed(2),"MB",
            "|",(((400*7+150)*b)/(10*1024**3)*100).toFixed(4),"% de 10GB");'
````

```
bytes: 1090 | 400x7+150 = 3.07 MB | 0.0299 % de 10GB
```

**En runtime**, la propuesta es publicar desde git a tres destinos, cada uno con
su razón:

| Destino | Qué guarda | Por qué ahí |
|---|---|---|
| `math-challenge-db` (D1) | **índice de selección**: id, habilidad, nivel, dificultad_experta, formato, estado, hash — y la psicometría que se acumula | Es lo que consulta la selección adaptativa (F4) y lo único que cambia en producción sin un despliegue |
| Assets estáticos del Worker, por locale | el **paquete de ítems y frases** que el cliente precachea | La PWA tiene que funcionar sin conexión (plan maestro §11). **No pueden ir en el bundle de JS**: el presupuesto es de **60 KB gz para todo el JS de cliente** (`audits/bundle-budget.mjs:24`), y el paquete de un locale lo revienta cien veces |
| `math-challenge-media` (R2) | audio y arte | Ya existe y ya está documentado en `infrastructure.md` |

**Lo que esto NO resuelve, dicho de frente:** el presupuesto de precaché de
audio es de ~5 MB en la primera instalación (plan maestro §11) y cada ítem de
kinder trae audio obligatorio en su locale. 400 ítems × ~9 KB de opus ≈ 3.6 MB
por locale — cabe, pero apenas, y solo si se precachea **un** locale y el audio
es opus y no wav. Nadie ha medido un opus real de Larry todavía; los 9 KB del
ejemplo son una suposición etiquetada como tal, no una medición.

Y esa medición, cuando llegue, **no puede venir de campo**: la pantalla de un
reto es superficie de niño, y D-037 solo permite ahí laboratorio con
estrangulamiento de CPU y red, etiquetado como laboratorio. El peso del paquete
de contenido es de las pocas causas de INP que sí se pueden acotar antes de
tener usuarios, y por eso la comprobación 10 del auditor de §13 pesa los medios
en vez de esperar a un beacon que nunca va a existir.

---

## 4. El ítem

El esquema completo está en
[`esquema-item.schema.json`](esquema-item.schema.json). Lo esencial:

```jsonc
{
  "tipo_doc": "item",
  "id": "K04-numeral-17-de-DE",
  "familia": "K04-numeral-17",     // agrupa a los siete hermanos por locale
  "version": 1,
  "estado": "borrador",            // borrador→editorial→matematica→accesibilidad
                                   // →locales→piloto→activo→retirado  (mc-40)
  "habilidad": "K04",
  "nivel": 2,                      // N1..N12 (D-017). Manda el valor en puntos
  "dificultad_experta": 34,        // 1-100, lo que usa el adaptativo en v1 (§4.4)
  "proposito": "concepto",         // los cinco de Swan (mc-36 §3)
  "formato": "toca_la_respuesta",
  "qti": "choiceInteraction",      // vocabulario QTI 3.0 sin implementar el XML
  "autoria": "por_locale",         // ← siete autorías
  "locale": "de-DE",
  "origen": "plantilla",           // plantilla | ia_revisada | a_mano
  "modelo": "K04-palabra-a-numeral",

  "cuerpo": {
    "consigna": { "clave": "k04.toca_el_numero", "vars": { "n": 17 } },
    "escena":   { "t": "num", "v": 17 },
    "opciones": [ {"t":"num","v":17}, {"t":"num","v":71},
                  {"t":"num","v":7},  {"t":"num","v":10} ],
    "audio_obligatorio": true      // toda la banda KINDER: la voz es la interfaz
  },

  "respuesta": { "tipo": "opcion", "valor": 17, "tol": 0 },

  "errores": [
    { "causa": "elige_la_unidad", "valor": 7,
      "explicacion": "k04.err.unidad", "remedia": "K04",
      "evidencia": "mc-34 §7" },
    { "causa": "inversion_decena_unidad", "valor": 71,
      "explicacion": "k04.err.inversion", "remedia": "K04",
      "locales": ["de-DE"],
      "evidencia": "mc-34 §7 [unverified]" },
    { "causa": "elige_la_decena", "valor": 10,
      "explicacion": "k04.err.decena", "remedia": "K04",
      "evidencia": "mc-06 §6" }
  ],

  "medios": [
    { "rol": "audio_consigna",
      "clave": "audio/k04/de-DE/toca_el_numero_17.opus",
      "formato": "opus", "bytes": 9400 }
  ]
}
```

**Cuatro cosas de este ejemplo que no son detalles.**

1. **`nivel` y `dificultad_experta` son ejes distintos y los dos hacen falta.**
   `nivel` manda el valor en puntos —`10 × 1.6^(nivel−1)`, D-010— así que un
   ítem N2 vale **16 puntos** y uno N9 vale **429**
   (`node -e 'console.log(10*1.6**1, Math.round(10*1.6**8))'`).
   `dificultad_experta` (1-100) es lo que usa la ubicación adaptativa mientras
   no haya banco calibrado (plan maestro §4.4, `mc-44`). Colapsarlos obligaría a
   que doce niveles cubran cien grados de dificultad.

2. **El catálogo de errores es distinto en alemán.** `inversion_decena_unidad`
   solo existe en `de-DE`, porque "siebzehn" se dice *sieben-zehn* y el niño
   escribe 71. Es la consecuencia más cara de `mc-34` §7 y es la que justifica
   que `autoria: por_locale` exista: **no es que el texto cambie, es que el
   error cambia**, y Larry explica errores. La literatura de errores de
   transcodificación en alemán está marcada `[unverified]` en `mc-34`, y esa
   marca se hereda al campo `evidencia` en vez de borrarse.

3. **`errores` nunca puede estar vacío**, y por eso el validador rechaza un ítem
   sin errores (control positivo #1 de §9). Un ítem sin errores catalogados
   obliga a Larry a improvisar, y Larry no calcula (línea roja #7).

4. **Lo que el ítem no tiene.** No hay `tiempo_limite`, no hay
   `intentos_permitidos`, no hay `penaliza_cambio`, no hay `costo`, no hay
   `justificacion`. Con `additionalProperties: false`, agregarlos no es una mala
   práctica: es un documento inválido. Es el mismo patrón que ya usan
   `migrations/0002_child_profiles.sql` y `audits/child-free-text.mjs` — la
   protección no depende de que alguien recuerde la regla.

---

## 5. Los formatos, y a qué habilidad sirven

Los cinco de §9 son todos **de tocar**: a los 4-6 años arrastrar es, de forma
medible, más lento y más propenso a error que tocar. Esto **contradice a `mc-06`
implicación 4**, que propone *drag-and-drop* para el marco de diez; manda §9 del
plan maestro, y queda escrito que se está eligiendo contra esa implicación a
propósito.

| `formato` | `qti` | Habilidades | Nota |
|---|---|---|---|
| `toca_la_respuesta` | `choiceInteraction` | K01,K02,K04,K07,K13,K14 | opción múltiple **con dibujos**, nunca con texto |
| `toca_para_contar` | `selectPointInteraction` | K03,K04,K05,K06 | cada toque marca un objeto: hace observable la correspondencia uno a uno (`mc-06` §2) |
| `flash` | `choiceInteraction` + `flash_ms` | K01,K02 | subitizar perceptual. `flash_ms` es exposición, **no** reloj |
| `arma_el_numero` | `hotspotInteraction` | K09,K10 | se **tocan** las celdas del marco de diez, no se arrastran |
| `cual_sobra` | `choiceInteraction` + `respuesta.tipo: "aceptables"` | K07,K13,K14 | ver abajo |

**`cual_sobra` es el formato que casi choca con una línea roja.** *Which One
Doesn't Belong* (`mc-36` §5) vale precisamente porque **varias respuestas son
correctas por razones distintas**, y su forma canónica se califica sobre la
justificación que escribe el alumno. Un niño no puede escribir (línea roja #3).

La salida no es tirar el formato ni pedirle texto al niño: es que el **adulto
autore la razón de cada elección legítima** y el niño solo toque.
`respuesta.tipo: "aceptables"` exige mínimo dos elecciones válidas, cada una con
su `razon` (una llave de frase). El niño toca; Larry dice en voz alta la razón
de lo que tocó. Se conserva lo que hace valioso al formato —que no hay una sola
respuesta— sin pedir una sola letra.

---

## 6. El vocabulario cerrado de causas

`content/causas.json`. Cerrado a propósito: es la llave de caché de las
explicaciones de Larry (D-015) y lo que permite que el repaso espaciado sepa a
qué habilidad mandar al niño. Una causa escrita a mano en un ítem suelto rompe
las dos cosas.

| `causa` | Habilidad | Qué error nombra | Fuente |
|---|---|---|---|
| `doble_conteo` | K05 | cuenta dos veces el mismo objeto | `mc-06` §2 (correspondencia uno a uno) |
| `omite_objeto` | K05 | salta un objeto al contar | `mc-06` §2 |
| `orden_inestable` | K03,K04 | la secuencia de palabras-número se rompe | `mc-06` §2 (orden estable) |
| `recita_sin_cardinalidad` | K06 | cuenta bien pero no sabe cuántos hay | `mc-06` §2 (cardinalidad) |
| `responde_el_ordinal` | K06 | contesta "el quinto" en vez de "cinco" | `mc-06` §2 |
| `salta_la_decena` | K04 | se rompe justo en 11-20, donde la lengua se vuelve irregular | `mc-34` §7 |
| `inversion_decena_unidad` | K04 | escribe 71 al oír "siebzehn" — **solo `de-DE`** | `mc-34` §7 `[unverified]` |
| `elige_la_unidad` | K04 | oye la unidad dentro de la palabra compuesta | `mc-34` §7 |
| `elige_la_decena` | K04 | se queda con la decena de la palabra compuesta | `mc-06` §6 |
| `subitiza_de_mas` / `subitiza_de_menos` | K01,K02 | falla el subitizar cuando el arreglo es disperso | `mc-06` §1 |
| `compara_por_area` | K07 | "más espacio" se lee como "más cosas" | `mc-06` §1 (SNA contra conteo exacto) |
| `compara_por_tamano_del_objeto` | K07 | objetos grandes se leen como más | `mc-06` §1 |
| `posicion_por_extremos` | K08 | coloca todo en un extremo de la recta | `mc-06` §3 (Siegler/Ramani) |
| `llena_el_marco_sin_contar` | K09 | llena el marco de diez completo por hábito | `mc-06` §6 |
| `descompone_incompleto` | K10 | 5 = 2 + 2 | `mc-06` §6 (parte-parte-todo) |
| `cuenta_todo_en_vez_de_contar_desde` | K11 | recuenta desde 1 en vez de contar-desde | `mc-06` §6 |
| `suma_en_vez_de_restar` | K12 | invierte la operación | `mc-06` §6 |
| `clasifica_por_color_no_por_forma` | K13 | usa el atributo equivocado | `mc-36` §3 (clasificar, Swan) |
| `continua_el_patron_por_repeticion` | K14 | AB → AAB | `mc-36` §5 (patrones visuales) |

Son 19 causas de arranque, no las definitivas. Lo que sí es definitivo es la
regla: **una causa sin fuente citada no entra al vocabulario**, por la misma
razón que un auditor sin cita no bloquea (D-032, regla 1). `mc-40` documenta con
cita que los modelos redactan distractores matemáticamente válidos pero fallan
al anticipar los errores reales de los alumnos; el campo `evidencia` es lo que
convierte esa advertencia en algo revisable.

---

## 7. El renderizador: la única capa donde existe la notación

```
  ítem (estructura)  +  frases[locale]  +  MATH_CONVENTIONS[locale]
                                │
                                ▼
                        presentación
```

`MATH_CONVENTIONS` ya existe en `apps/web/src/i18n/index.ts:51-70` y hoy no lo
usa nadie. **Este es su primer consumidor.** El renderizador toma de ahí el
separador decimal, el agrupador de millares, el símbolo de división (`÷` contra
`:`) y el de multiplicación (`×` contra `·`), y nunca del código de idioma.

Tres hallazgos que salieron al escribir el renderizador, los tres reproducibles:

**a) `MATH_CONVENTIONS` no se puede importar desde Node.**

```
$ node -e "import('./apps/web/src/i18n/index.ts').then(m=>console.log(Object.keys(m))).catch(e=>console.log('ERR', e.message))"
ERR Module "file:///…/apps/web/src/i18n/en.json" needs an import attribute of "type: json"
```

`index.ts` importa los siete JSON de mensajes, así que cualquier herramienta que
solo quiera la tabla de convenciones arrastra todo el paquete de i18n. El demo
lo resuelve extrayendo el literal del texto fuente, que es un truco y está
marcado como tal en el archivo. **La acción real es mover `MATH_CONVENTIONS` a
su propio módulo sin dependencias**, para que el renderizador, el publicador de
contenido y el auditor lo lean sin cargar mensajes.

**b) La tabla del producto y CLDR no coinciden en dos locales.** Salida de la §5
del demo:

```
  = en     tabla: 12,345.6     CLDR: 12,345.6
  = es-MX  tabla: 12,345.6     CLDR: 12,345.6
  = es-ES  tabla: 12.345,6     CLDR: 12.345,6
  ≠ fr-FR  tabla: 12 345,6     CLDR: 12U+202F345,6
  = pt-BR  tabla: 12.345,6     CLDR: 12.345,6
  ≠ pt-PT  tabla: 12.345,6     CLDR: 12U+A0345,6
  = de-DE  tabla: 12.345,6     CLDR: 12.345,6
```

En `fr-FR`, CLDR usa espacio fino sin ruptura (U+202F) donde la tabla tiene un
espacio normal. En `pt-PT`, CLDR agrupa con espacio duro (U+00A0) donde la tabla
dice punto. Uno de los dos está mal para el aula portuguesa, y no lo puede
decidir un ingeniero: es pregunta de autor nativo (§13, pregunta 2). Mientras
tanto el renderizador usa **la tabla**, porque es la que el dueño revisó y la
que el repositorio audita.

**c) `Intl` no parsea, solo formatea.** `mc-34` implicación 2 ya lo advertía: no
existe `Intl.NumberFormat.parse`. Cuando la franja adulta acepte entrada
numérica (`entrada_numerica`), un adulto alemán va a teclear `1543,2` y hay que
normalizarlo con la misma tabla, en el borde de entrada. En kinder no aplica:
no hay teclado.

---

## 8. El ítem de kinder en los siete locales

Comando: `node docs/planes/esquema-item-demo.mjs`, sección 3. Salida literal:

```
── 3. Un ítem de kinder en los siete locales ──
     familia K04-numeral-17 · autoria: por_locale · SIETE ítems hermanos

  en     consigna : Tap the number seventeen.
         opciones : 17  71  7  10
         errores  : elige_la_unidad, elige_la_decena
         audio    : audio/k04/en/toca_el_numero_17.opus
         Larry si toca 7 : You tapped 7. Listen again: seven-TEEN — it ends in seven, but it is ten and seven.

  es-MX  consigna : Toca el número diecisiete.
         opciones : 17  71  7  10
         errores  : elige_la_unidad, elige_la_decena
         audio    : audio/k04/es-MX/toca_el_numero_17.opus
         Larry si toca 7 : Tocaste el 7. Escucha otra vez: dieci-SIETE — termina en siete, pero es diez y siete.

  es-ES  consigna : Toca el número diecisiete.
         opciones : 17  71  7  10
         errores  : elige_la_unidad, elige_la_decena
         audio    : audio/k04/es-ES/toca_el_numero_17.opus
         Larry si toca 7 : Has tocado el 7. Escucha otra vez: dieci-SIETE — acaba en siete, pero es diez y siete.

  fr-FR  consigna : Touche le nombre dix-sept.
         opciones : 17  71  7  10
         errores  : elige_la_unidad, elige_la_decena
         audio    : audio/k04/fr-FR/toca_el_numero_17.opus
         Larry si toca 7 : Tu as touché 7. Écoute encore : dix-SEPT — c'est dix et sept.

  pt-BR  consigna : Toque no número dezessete.
         opciones : 17  71  7  10
         errores  : elige_la_unidad, elige_la_decena
         audio    : audio/k04/pt-BR/toca_el_numero_17.opus
         Larry si toca 7 : Você tocou no 7. Escute de novo: deze-SSETE — termina em sete, mas é dez e sete.

  pt-PT  consigna : Toca no número dezassete.
         opciones : 17  71  7  10
         errores  : elige_la_unidad, elige_la_decena
         audio    : audio/k04/pt-PT/toca_el_numero_17.opus
         Larry si toca 7 : Tocaste no 7. Ouve outra vez: deza-SSETE — acaba em sete, mas é dez e sete.

  de-DE  consigna : Tippe auf die Zahl siebzehn.
         opciones : 17  71  7  10
         errores  : elige_la_unidad, inversion_decena_unidad, elige_la_decena
         audio    : audio/k04/de-DE/toca_el_numero_17.opus
         Larry si toca 7 : Du hast auf die 7 getippt. Hör noch einmal: SIEB-zehn — es endet auf sieben, aber es ist zehn und sieben.
```

**Qué demuestra esta salida, y qué no.**

- **`pt-BR` y `pt-PT` no son el mismo locale, y se ve sin saber portugués:**
  *dezessete* contra *dezassete*, *Toque no* contra *Toca no*. Es exactamente la
  fila de la matriz de `mc-34` que D-022 cita para justificar siete autores. Si
  el esquema tuviera un solo campo `pt`, este ítem sería incorrecto en un país.
- **`de-DE` tiene un error que los otros seis no tienen.** Tres causas contra
  dos. La estructura aguanta esa asimetría sin campos opcionales inventados.
- **`es-MX` y `es-ES` salen idénticos en la consigna, y eso es honesto.** En
  este ítem no hay decimal, ni división, ni millar: no hay nada donde diverjan.
  La divergencia entre los dos aparece en la franja adulta, y por eso el demo
  imprime también un ítem N9 (§4 del demo):

```
── 4. Un ítem adulto: UNA autoría, SIETE renders (D-034) ──

  en     What is 12,345.6 ÷ 8?
  es-MX  ¿Cuánto es 12,345.6 ÷ 8?
  es-ES  ¿Cuánto es 12.345,6 ÷ 8?
  fr-FR  Combien font 12 345,6 : 8 ?
  pt-BR  Quanto é 12.345,6 ÷ 8?
  pt-PT  Quanto é 12.345,6 : 8?
  de-DE  Wie viel ist 12.345,6 : 8?
```

Un solo ítem, un solo autor, siete notaciones: punto contra coma decimal, tres
agrupadores distintos, `÷` contra `:`. **Es la primera vez que el proyecto cobra
la decisión de guardar el ítem como árbol** — que es literalmente lo que D-034
prometió que pasaría.

---

## 9. Lo que el esquema rechaza

Salida literal de la sección 2 del demo:

```
── 2. Controles positivos: lo que el esquema DEBE rechazar ──

  ✓ rechazado — ítem sin errores catalogados
  ✓ rechazado — ítem con campo de justificación libre
  ✓ rechazado — ítem 'universal' con locale
  ✓ rechazado — reto de KINDER en modo DUELO
  ✓ rechazado — serie sin declarar qué varía
```

Los cinco corresponden uno a uno con la tabla de §1: línea roja #7, línea roja
#3, D-034, D-024/D-018 y D-018. **Se vieron fallar**: si borras
`additionalProperties: false` del esquema, el segundo control pasa y el demo
sale con código 1.

---

## 10. La contradicción de F5b — serie contra receta

El plan maestro §13.2 dice que F5b va **"sin curaduría por serie"**, y D-018 dice
que **"la unidad de diseño es la serie, no la pregunta suelta"**. El auditor de
pedagogía levantó el choque y no está resuelto.

**Lo que sí está claro y no admite lectura ambigua:** D-034 puso el barandal
—"los 2,500 retos curados son de kinder; la franja adulta compone retos del
banco sin curaduría pedagógica por serie"— para que la franja no se coma la ruta
crítica. Y D-018 es una decisión del dueño sobre cómo se diseña, no sobre cuánto
se produce.

**La propuesta: las dos son ciertas si la serie puede declararse como regla en
vez de como lista.** El esquema soporta dos modos de composición, y los dos
exigen el mismo bloque `variacion`:

```jsonc
// KINDER — serie curada: alguien eligió estos cuatro ítems, en este orden.
"composicion": {
  "modo": "serie",
  "items": ["K04-numeral-13-de-DE","K04-numeral-17-de-DE",
            "K04-numeral-19-de-DE","K04-numeral-71-de-DE"],
  "variacion": {
    "varia": "la unidad dentro de la palabra compuesta, y después el orden escrito (17 contra 71)",
    "constante": "el formato, las cuatro opciones y la decena",
    "por_que": "mc-02 — la variación es la que enseña; el cuarto ítem contrasta 17 con 71 justo después de haber fijado 17"
  }
}

// FRANJA ADULTA — receta: nadie eligió los ítems, pero alguien diseñó la regla.
"composicion": {
  "modo": "receta",
  "n": 20,
  "filtros": { "habilidades": ["S104","S105"], "nivel": [8,10], "proposito": ["fluidez"] },
  "restricciones": ["sin_repetir_modelo","max_dos_por_causa","intercalar_habilidades"],
  "variacion": {
    "varia": "el divisor y la posición del decimal",
    "constante": "el número de cifras del dividendo",
    "por_que": "mc-05 — intercalar duele en la sesión y duplica el desempeño al día siguiente"
  }
}
```

**Por qué esto es una resolución y no un truco de palabras:**

- Se cumple el barandal de D-034: **nadie cura 150 series a mano** en la franja
  adulta. Se curan unas pocas recetas, una vez.
- Se cumple D-018: sigue habiendo un diseño de serie —qué varía, qué se
  mantiene, por qué—, y el esquema **lo exige en los dos modos**. Un reto no
  puede existir sin declararlo (control positivo #5).
- Lo que queda prohibido es la tercera opción, la que nadie decidió pero que es
  a donde se cae solo: **"toma N ítems al azar del nivel"**. Esa es la que
  D-018 llama "treinta sumas al azar" y la que `mc-02` dice que no enseña. El
  esquema no la puede expresar.

**Lo que esto NO decide, y por eso está en §13 como pregunta 1:** si el dueño
lee "sin curaduría por serie" como "sin ninguna intención de serie, ni
declarada", entonces la propuesta se cae y hay que quitar `variacion` del modo
receta. Es una decisión suya, no mía.

---

## 11. La migración propuesta (no escrita)

`migrations/0003_content.sql`, **para revisión, no aplicada**. D1 guarda el
índice de selección y la psicometría; el contenido viaja como assets.

```sql
-- 0003_content.sql — el banco de ítems como ÍNDICE, no como texto
--
-- Decisiones que este esquema hace cumplir:
--   D-018  el reto se compone de 1..N ítems; la serie es la unidad de diseño.
--   D-022  siete locales. Un ítem de kinder es siete ítems hermanos.
--   D-034  un ítem adulto es UNO, y se renderiza siete veces.
--   D-024  kinder no se cronometra: no hay columna de tiempo en ninguna tabla.
--   mc-40  el ciclo de vida del ítem es una máquina de estados, no un booleano.
--
-- Lo que deliberadamente NO está aquí:
--   - el TEXTO de los ítems: viaja como asset versionado con el Worker, para
--     que la PWA funcione sin conexión (plan maestro §11).
--   - los intentos: Analytics Engine (mc-32 riesgo #1).
--   - cualquier columna donde un niño escriba: línea roja #3.

CREATE TABLE skills (
  skill_id     TEXT PRIMARY KEY,               -- 'K01'..'K14', 'S104'
  banda        TEXT NOT NULL CHECK (banda IN ('KINDER','PRIMARIA','SECUNDARIA','SERIO','PRO')),
  orden        INTEGER NOT NULL,               -- la trayectoria de mc-06, no el gusto de nadie
  prereq       TEXT REFERENCES skills(skill_id),
  nombre_clave TEXT NOT NULL                   -- llave de frase; el nombre se renderiza
);

CREATE TABLE item_models (
  model_id     TEXT PRIMARY KEY,
  skill_id     TEXT NOT NULL REFERENCES skills(skill_id),
  formato      TEXT NOT NULL,
  rinde        INTEGER NOT NULL DEFAULT 1,     -- isomorfos declarados (mc-36 §11)
  por_locale   INTEGER NOT NULL DEFAULT 0 CHECK (por_locale IN (0,1)),
  estado       TEXT NOT NULL,
  radicales    TEXT NOT NULL,                  -- JSON: lo que fija la dificultad
  incidentales TEXT NOT NULL                   -- JSON: lo que puede variar
);

CREATE TABLE items (
  item_id            TEXT PRIMARY KEY,
  familia_id         TEXT NOT NULL,            -- agrupa a los hermanos por locale
  version            INTEGER NOT NULL DEFAULT 1,
  supersede          TEXT REFERENCES items(item_id),

  skill_id           TEXT NOT NULL REFERENCES skills(skill_id),
  model_id           TEXT REFERENCES item_models(model_id),

  nivel              INTEGER NOT NULL CHECK (nivel BETWEEN 1 AND 12),
  dificultad_experta INTEGER NOT NULL CHECK (dificultad_experta BETWEEN 1 AND 100),
  proposito          TEXT NOT NULL CHECK (proposito IN ('fluidez','concepto','resolucion','lenguaje','aplicacion')),
  formato            TEXT NOT NULL,
  origen             TEXT NOT NULL CHECK (origen IN ('plantilla','ia_revisada','a_mano')),

  -- El CHECK se escribe con IN ANTES del IS NULL a propósito: escrito al revés,
  -- audits/locales-complete.mjs NO lo ve y la comprobación de los siete locales
  -- se salta en silencio. Verificado, ver docs/planes/esquema-item.md §12.
  locale             TEXT CHECK (locale IN ('en','es-MX','es-ES','fr-FR','pt-BR','pt-PT','de-DE') OR locale IS NULL),
  autoria            TEXT NOT NULL CHECK (autoria IN ('universal','por_locale')),

  estado             TEXT NOT NULL CHECK (estado IN ('borrador','editorial','matematica','accesibilidad','locales','piloto','activo','retirado')),
  hash_contenido     TEXT NOT NULL,            -- del JSON publicado: detecta drift asset/índice
  publicado_en       INTEGER,
  retirado_en        INTEGER,

  -- Un ítem con respuestas encima NUNCA se edita en su lugar (mc-40 impl. 5).
  CHECK ((autoria = 'por_locale' AND locale IS NOT NULL)
      OR (autoria = 'universal'  AND locale IS NULL))
);

CREATE INDEX idx_items_seleccion ON items (skill_id, estado, dificultad_experta);
CREATE INDEX idx_items_familia   ON items (familia_id);

-- Mutable, y por eso separada de items, que es inmutable por versión.
CREATE TABLE item_psicometria (
  item_id       TEXT PRIMARY KEY REFERENCES items(item_id) ON DELETE CASCADE,
  p_value       REAL,        -- proporción de aciertos (CTT)
  biserial      REAL,        -- discriminación punto-biserial
  n_respuestas  INTEGER NOT NULL DEFAULT 0,
  calibrado_en  INTEGER
);

CREATE TABLE retos (
  reto_id     TEXT PRIMARY KEY,
  tipo        TEXT NOT NULL CHECK (tipo IN ('PRACTICA','FLUIDEZ','PROBLEMA','DUELO','HISTORIA')),
  banda       TEXT NOT NULL CHECK (banda IN ('KINDER','PRIMARIA','SECUNDARIA','SERIO','PRO')),
  locale      TEXT CHECK (locale IN ('en','es-MX','es-ES','fr-FR','pt-BR','pt-PT','de-DE') OR locale IS NULL),
  lugar       TEXT,                            -- lugar de la Sabana (D-019), solo HISTORIA
  modo        TEXT NOT NULL CHECK (modo IN ('serie','receta')),
  composicion TEXT NOT NULL,                   -- JSON validado contra el esquema antes de publicar
  estado      TEXT NOT NULL,

  -- NO hay columna de reloj. El reloj se deriva del tipo (D-018) y kinder no
  -- tiene ni FLUIDEZ ni DUELO. Una columna sería una manera de contradecirlo.
  CHECK (NOT (banda = 'KINDER' AND tipo IN ('FLUIDEZ','DUELO')))
);

-- Solo para el modo 'serie': el orden es el diseño y se consulta por índice.
CREATE TABLE reto_items (
  reto_id  TEXT NOT NULL REFERENCES retos(reto_id) ON DELETE CASCADE,
  orden    INTEGER NOT NULL,
  item_id  TEXT NOT NULL REFERENCES items(item_id),
  PRIMARY KEY (reto_id, orden)
);
```

---

## 12. Hechos verificados, con su comando

| Afirmación | Comando | Resultado |
|---|---|---|
| El esquema es válido y los 10 documentos de ejemplo lo cumplen | `node docs/planes/esquema-item-demo.mjs` | `✓ 0 fallo(s)`, código de salida 0 |
| Los 5 controles positivos se ven rechazar | mismo comando, sección 2 | los 5 `✓ rechazado` |
| El ítem de kinder rinde en los 7 locales | mismo comando, sección 3 | §8 de este documento |
| Un ítem adulto rinde 7 notaciones desde una autoría | mismo comando, sección 4 | §8 |
| `MATH_CONVENTIONS` no coincide con CLDR en `fr-FR` y `pt-PT` | mismo comando, sección 5 | 2 de 7 con `≠` |
| `MATH_CONVENTIONS` no se puede importar desde Node | `node -e "import('./apps/web/src/i18n/index.ts').then(...)"` | `needs an import attribute of "type: json"` |
| Un `CHECK (locale IS NULL OR locale IN (…))` es **invisible** para `audits/locales-complete.mjs` | ver abajo | `INVISIBLE para el auditor` |
| Valor en puntos: N2 = 16, N9 = 429 | `node -e 'console.log(10*1.6**1, Math.round(10*1.6**8))'` | `16 429` |
| Presupuesto de JS de cliente = 60 KB gz | `sed -n '22,28p' audits/bundle-budget.mjs` | `jsTotal: 60` |

El de la fila del auditor, completo:

```
node -e '
const L=["en","es-MX","es-ES","fr-FR","pt-BR","pt-PT","de-DE"];
const pruebas={
 "IS NULL primero":"  locale TEXT CHECK (locale IS NULL OR locale IN (\x27en\x27,\x27es-MX\x27,\x27es-ES\x27,\x27fr-FR\x27,\x27pt-BR\x27,\x27pt-PT\x27,\x27de-DE\x27)),",
 "IN primero":"  locale TEXT CHECK (locale IN (\x27en\x27,\x27es-MX\x27,\x27es-ES\x27,\x27fr-FR\x27,\x27pt-BR\x27,\x27pt-PT\x27,\x27de-DE\x27) OR locale IS NULL),",
};
for(const [n,sql] of Object.entries(pruebas)){
 const m=sql.match(/CHECK\s*\(\s*\w*locale\w*\s+IN\s*\(([^)]*)\)/gi);
 console.log(n.padEnd(18), m?("visto, 7 completos="+L.every(l=>m[0].includes("\x27"+l+"\x27"))):"INVISIBLE para el auditor");
}'
```

```
IS NULL primero    INVISIBLE para el auditor
IN primero         visto, 7 completos=true
```

**Esto es un hueco real del auditor `locales-complete`, no un detalle de
estilo.** Su expresión regular ancla en `CHECK (` seguido inmediatamente del
nombre de la columna y de `IN`; cualquier otra forma de escribir la restricción
—y una columna `locale` nullable pide justamente la otra forma— **se salta sin
avisar**. La migración de §11 esquiva el hueco escribiendo el `IN` primero, pero
esquivarlo no lo cierra: hay que arreglar el auditor (acción 6).

---

## 13. Auditor determinista propuesto: `audits/item-schema.mjs`

D-032 dice que quien encuentra un auditor que falta, lo escribe. Este es el que
falta para F5, y es barato: valida archivos, no llama a ningún modelo.

Qué comprueba, en orden de importancia:

1. Todo `content/**/*.json` valida contra `docs/planes/esquema-item.schema.json`
   (que al implementarse se mueve a `content/esquema/item.schema.json`).
2. **Completitud de familia:** si algún miembro de una `familia` es
   `por_locale`, tienen que estar **los siete**. Es la versión de contenido del
   auditor `locales-complete`.
3. Toda `causa` usada existe en `content/causas.json`. Vocabulario cerrado.
4. Toda `clave` de frase existe en **los siete** paquetes de frases.
5. Ningún ítem de banda KINDER usa `entrada_numerica`, `ordenar`, `clasificar` ni
   `encuentra_el_error` — nada de teclado a los 4-6 (`mc-06` implicación 4,
   D-012).
6. Todo ítem de banda KINDER tiene `audio_obligatorio: true` y un medio con rol
   `audio_consigna` en su locale (D-015: la voz es la interfaz).
7. Ningún ítem `ia_revisada` con `estado: activo` tiene un error sin
   `revisado_por_humano: true` (`mc-40` implicación 9).
8. Todo `errores[].valor` es distinto de `respuesta.valor`. Un distractor igual a
   la respuesta es un ítem sin respuesta correcta única.
9. Toda `opciones` de un ítem `toca_la_respuesta` contiene la respuesta.
10. Suma de `medios[].bytes` por locale ≤ 5 MB — el presupuesto de precaché del
    plan maestro §11, comprobado antes de grabar el audio y no después.
11. Ningún reto de banda KINDER es `FLUIDEZ` ni `DUELO`.
12. Todo reto declara `variacion` completa (los tres campos).
13. Ningún `estado: activo` sin `autoria_meta.revisor` y `revisado`.
14. Ninguna causa del vocabulario queda huérfana (declarada y nunca usada) — es
    señal de que el catálogo se está escribiendo de adorno.

Se agrega a `ACTIVE` en `audits/run.mjs` cuando exista `content/`; hasta
entonces sale con código 0 y un `○`, igual que hace hoy `bundle-budget` cuando
no hay build.

---

## 14. Orden de trabajo

Lo que desbloquea a lo demás va primero.

| # | Qué | Archivos | Verificable con |
|---|---|---|---|
| 1 | Contestar las preguntas de §15 (al menos 1, 2 y 4) | — | — |
| 2 | Mover `MATH_CONVENTIONS` a su propio módulo sin dependencias | `apps/web/src/i18n/math-conventions.ts`, `index.ts` | `node -e "import('./apps/web/src/i18n/math-conventions.ts')"` sin error |
| 3 | Fijar el esquema en `content/esquema/item.schema.json` y crear `content/causas.json` | `content/` | `node docs/planes/esquema-item-demo.mjs` apuntado al nuevo camino |
| 4 | Escribir `audits/item-schema.mjs` con las 14 comprobaciones | `audits/item-schema.mjs`, `audits/run.mjs` | `node audits/run.mjs`; y verlo fallar con un ítem roto a propósito |
| 5 | Sembrar un modelo y su familia de 7 por cada una de K01-K04 | `content/modelos/`, `content/items/` | `node audits/item-schema.mjs` |
| 6 | Arreglar el hueco de `locales-complete` (§12) | `audits/locales-complete.mjs` | el comando de §12 dejando de decir `INVISIBLE` |
| 7 | Escribir `migrations/0003_content.sql` y el publicador `scripts/publicar-contenido.mjs` | `migrations/`, `scripts/` | `pnpm db:migrate:local` y `node audits/run.mjs` |
| 8 | Guía de autoría para los siete autores, con las 19 causas y los 5 formatos | `docs/guia-de-autoria.md` | revisión humana |

Los pasos 2-6 no dependen de F2 ni de F3 y se pueden hacer hoy, que es lo que
§13.3 del plan maestro promete cuando dice que **F5 no espera a F3**.

---

## 15. Preguntas al dueño

Solo las que cambian lo que se construye.

1. **La contradicción de F5b (§10).** ¿La franja adulta compone retos con
   **recetas curadas** —una regla diseñada una vez, con qué varía y qué se
   mantiene declarados—, o "sin curaduría por serie" significa literalmente sin
   ninguna intención declarada y hay que quitar `variacion` del modo receta?
   Cambia el esquema y cambia el trabajo de autoría de F5b.

2. **CLDR contra la tabla del producto (§7b).** En `pt-PT` CLDR agrupa millares
   con espacio duro y `MATH_CONVENTIONS` dice punto; en `fr-FR` CLDR usa espacio
   fino y la tabla usa espacio normal. ¿Manda la tabla (y se corrige CLDR al
   renderizar), manda CLDR (y se corrige la tabla), o se espera al autor
   portugués antes de tocar nada? Afecta a todo número de la franja adulta en
   dos locales.

3. **`cual_sobra` (§5).** ¿Entra a kinder con varias respuestas aceptables, cada
   una con su razón autorada y **todas puntuando igual** —que es lo que hace
   valioso al formato—, o se recorta a una sola respuesta correcta para que la
   puntuación sea simple? La primera opción obliga a que la regla de kinder
   `score = valor · acc` trate cualquier elección listada como `acc = 1`.

4. **Alcance del audio en kinder.** Cada ítem lleva audio en su locale y el
   presupuesto de precaché es de ~5 MB. Con 400 ítems eso está al límite.
   ¿Se graba audio por **ítem**, por **modelo** (una consigna genérica más el
   número, que es más barato pero suena más robótico), o se acepta que el primer
   arranque baje solo el primer lugar de la Sabana y el resto llegue después?

5. **Promoción a `activo`.** `mc-40` pregunta lo mismo sin respuesta: ¿cuántas
   respuestas hacen falta antes de que un ítem pase de `piloto` a `activo` —30
   al estilo CTT, o las 200-1,000 que cita la literatura de CAT? Con el banco
   nuevo, el día del lanzamiento **ningún ítem** cumpliría el umbral alto, así
   que hace falta una regla de arranque explícita o el estado `piloto` es una
   trampa que nadie puede salir.

6. **`dificultad_experta` 1-100: ¿quién la pone?** El plan maestro §4.4 la
   asigna "por experto". Con siete autores y una escala de 100 grados, dos
   autores van a calibrar distinto el mismo ítem en dos idiomas. ¿La fija un
   solo calibrador para toda la familia, o cada autor la suya?

---

## 16. Lo que este esquema NO hace

Dicho explícitamente, porque un plan que no menciona sus límites no los ha
buscado.

1. **No cubre la división larga.** `mc-34` §4 documenta **cuatro** trazados
   distintos y lo llama el punto de más riesgo para un tutor de pasos.
   `MATH_CONVENTIONS.longDivision` ya tiene la llave por locale, pero el esquema
   no modela el procedimiento paso a paso. No hace falta para kinder ni para la
   franja N8-N10 de fluidez; hará falta en F5 de primaria.
2. **No modela notación de intervalos, fracciones mixtas ni nombres de escala
   grande.** El nodo `magnitud` existe para no perder el exponente, pero nadie ha
   escrito el nombrador de escala corta/larga.
3. **No define el modo HISTORIA.** El reto sabe que tiene un `lugar` de la
   Sabana; la cadena de retos, el desbloqueo y el arte son D-019 y otro trabajo.
4. **No toca la puntuación.** Deja `nivel` para que F3 calcule, y nada más.
5. **No resuelve la exposición de ítems** (`mc-40` implicación 13): con 400 ítems
   y un niño practicando diario, la repetición llega rápido. Es asunto del
   selector (F4), pero el esquema debería crecer un campo de exposición cuando
   se mida.
6. **No propone exportación QTI 3.0.** Adopta el vocabulario de nombres, que es
   gratis, y deja el XML para cuando exista una razón real de interoperar
   (`mc-36` pregunta abierta 1, `mc-40` implicación 6).

---

## 17. Lo que NO se pudo verificar

- **Nada de esto se ejecutó contra D1.** La migración de §11 no se aplicó ni en
  local: el encargo prohíbe tocar `migrations/`. Que el SQL sea sintácticamente
  válido para SQLite **no está comprobado**.
- **El peso del audio (~9 KB por consigna) es una suposición etiquetada.** No
  existe todavía un opus de Larry que medir. El cálculo de 3.6 MB por locale
  hereda esa incertidumbre entera.
- **La corrección lingüística de las siete frases del ejemplo no está
  revisada por hablantes nativos.** Sirven para demostrar la estructura; el
  contraste `dezessete`/`dezassete` viene de la matriz de `mc-34`, pero el resto
  del fraseo lo escribí yo y **no cuenta como contenido autorado**.
- **La inversión decena-unidad del alemán está `[unverified]` en origen.**
  `mc-34` marca como no confirmada la literatura de errores de transcodificación;
  el ítem la usa como causa y hereda la marca. Un autor alemán tiene que
  confirmar que 71 es el error real que comete un niño de cinco años.
- **No corrí `node audits/run.mjs`** completo: habría intentado validar un árbol
  que este encargo no modificó, y su salida no sería evidencia de nada de lo que
  aquí se propone.
- **La flota adversarial no revisó este plan.** `node audits/adversarial.mjs`
  cuesta dinero y D-032 la corre antes de abrir el PR, no antes de escribirlo.

---

## 18. Conflictos con las líneas rojas

Ninguno se cruzó. Dos se acercaron lo suficiente como para escribirlos:

1. **Línea roja #3 contra el formato *Which One Doesn't Belong*.** `mc-36` §5
   recomienda calificarlo sobre la justificación escrita del alumno. Con niños
   eso es imposible, no difícil. Resuelto en §5: las razones las autora un
   adulto y el niño solo toca. **El campo de justificación no existe en el
   esquema**, así que la línea no se puede cruzar por descuido.
2. **Línea roja del cronómetro (D-024) contra el formato `flash`.** Un
   subitizar perceptual necesita que el estímulo se muestre medio segundo
   (`mc-06` §1, §9 del plan maestro). `flash_ms` **mide el estímulo, no al
   niño**: no puntúa, no se muestra, no corre hacia atrás y no existe en ningún
   otro formato. Si alguien lo lee como un reloj, la lectura correcta está aquí
   escrita.
