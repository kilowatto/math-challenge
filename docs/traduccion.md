# Traducción del corpus de investigación

> Manual completo. Está escrito para alguien que retoma esto dentro de un año sin
> recordar nada del contexto — incluido yo. Si algo aquí no basta para reanudar
> el trabajo sin preguntar, es un defecto de este documento.
>
> **Estado: pausado el 2026-07-31 por decisión del dueño (D-050).** El corpus se
> queda como está. Este manual es el entregable, no la traducción.

---

## 1. Qué se traduce y por qué es distinto

El corpus son **47 investigaciones, ~158,858 palabras**, en `docs/research/*.md`.
El original es inglés (D-022: `en` es el origen), y hay **seis locales destino**:
`es-MX`, `es-ES`, `fr-FR`, `pt-BR`, `pt-PT`, `de-DE`. Son **282 traducciones**.

Esto no es traducir una interfaz. Un botón mal traducido molesta; una cifra mal
trasladada **fabrica una cita falsa con nuestro nombre encima**, en un repositorio
público bajo AGPL-3.0 (D-039). El corpus es lo único que hace citable al sitio
(D-033, `mc-48`), y eso solo funciona mientras las cifras aguanten que alguien las
verifique contra la fuente original.

De ahí la regla que gobierna todo lo demás: **el contenido matemático no se
traduce, se autora** (CLAUDE.md § Idiomas). En alemán 21 es *einundzwanzig*
(uno-y-veinte), en francés 90 es *quatre-vingt-dix*, México usa punto decimal y el
resto del mundo hispano coma, y `pt-PT` no es `pt-BR` con otra ortografía.
Investigación de referencia: `docs/research/2026-07-31-mc-34-i18n-math-notation.md`.

---

## 2. Estado real hoy, medido

No es el número de archivos: un archivo copiado en inglés también cuenta como
archivo. Esto compara el **cuerpo después del resumen ejecutivo** — el resumen ya
viene en español en el original, así que compararlo dice que todo está traducido.

| Locale  | Traducidos | Copia en inglés | Sin archivo | Documentos con hallazgo de integridad |
|---------|-----------:|----------------:|------------:|--------------------------------------:|
| `es-MX` |          0 |               0 |          47 | — |
| `es-ES` |         10 |               0 |          37 | 1 de 8 medidos |
| `fr-FR` |          0 |               0 |          47 | — |
| `pt-BR` |         47 |               0 |           0 | 28 de 47 |
| `pt-PT` |         47 |               0 |           0 | 29 de 47 |
| `de-DE` |         39 |               0 |           8 | 16 de 29 medidos |
| **Total** | **143** |           **0** |     **139** | **74 de 131 medidos** |

> Los hallazgos se midieron cuando había 131 documentos; la traducción siguió
> corriendo unos minutos más antes de detenerse del todo, así que los últimos 12
> no están verificados. La proporción —**56% con hallazgo**— es lo que importa,
> y no hay razón para creer que los 12 sin medir sean distintos.

Reproducible:

```bash
# cuántos están traducidos de verdad
node scripts/medir-traduccion.mjs

# cuántos están limpios
for l in es-ES pt-BR pt-PT de-DE; do node audits/corpus-integridad.mjs --locale $l; done
```

**Lo importante de esta tabla no es la primera columna, es la última.** «pt-PT
completo» es engañoso: los 47 documentos existen en portugués europeo, y 29 de
ellos tienen cifras perdidas, inventadas o escritas con la convención decimal
equivocada. **Traducido no significa publicable.** Nada de esto debería servirse
como contenido citable sin pasar `corpus-integridad` en verde.

---

## 3. Qué cuesta y qué tarda, medido

De los registros de las corridas reales (36 documentos completos):

| | |
|---|---|
| Costo medio por documento | **$0.0161 USD** |
| Costo de los 36 documentos | $0.5801 USD |
| **Costo estimado de los 155 que faltan** | **≈ $2.50 USD** |
| **Costo estimado del corpus entero (282)** | **≈ $4.54 USD** |
| Tiempo medio por documento | **168 s** |
| Entrada media | 9,330 tokens |
| Salida media | 17,132 tokens |

**Corrección de lo que dije antes: traducir esto no es caro, es lento.** Menos de
cinco dólares por el corpus completo. Lo que cuesta son ~7 horas de reloj en serie
para lo que falta, y sobre todo el trabajo humano de revisar los hallazgos de
integridad, que es donde está el gasto de verdad.

Si el argumento para no traducir era el dinero, el número lo desmiente. Si era
que un corpus a medio verificar es peor que un corpus en inglés honesto, el
número no cambia nada — y ese es el argumento bueno.

---

## 4. Qué NUNCA se traduce

Estas diez reglas están en el prompt de sistema del script, en inglés, y son
literalmente lo que separa una traducción publicable de una basura peligrosa.
Van aquí en español para que se puedan discutir sin abrir el código:

1. **Los números sobreviven idénticos.** Cada dígito, porcentaje, año, tamaño de
   muestra, tamaño de efecto, precio y conteo conserva su valor exacto. Un 43%
   que se vuelve 34% es una cita fabricada. Sí se **reformatea** a la convención
   del locale (43.5 → 43,5 donde el decimal es coma); nunca se cambia el valor,
   ni se redondea, ni se inventa uno que no estaba.
2. **Las URL de fuente son intocables.** Carácter por carácter. No se traduce el
   dominio, no se acorta, no se «arregla», no se añade ni se quita ninguna.
3. **La marca `[unverified]` se queda**, con esa ortografía inglesa exacta y en
   los mismos lugares. Perderla convierte una advertencia declarada en una
   afirmación, que es peor que perder un párrafo. Igual con las variantes largas
   (`[unverified this session, high training-knowledge confidence]`): se conserva
   el corchete y la palabra `unverified`; el resto de la frase sí se traduce.
4. **Los identificadores citados no se traducen.** `mc-01`…`mc-48` y `D-001`…`D-999`
   quedan tal cual, con sus mayúsculas.
5. **Los marcadores de cita** `[1]`, `[2][3]` quedan pegados a la misma
   afirmación. Nunca se renumeran.
6. **La estructura Markdown se preserva**: mismos niveles de encabezado, misma
   forma de tabla (mismas columnas, mismas filas, misma fila de alineación),
   mismos marcadores de lista, mismas citas en bloque, mismo énfasis, mismos
   bloques de código cercados.
7. **Código, muestras de notación, rutas e identificadores entre comillas
   invertidas no se traducen.** `wrangler.jsonc`, `docs/research/`, `@cf/…` y
   ejemplos de notación como `` `127 : 4 = 31,75` `` son literales byte a byte.
8. **Los nombres de locale y las etiquetas BCP-47 nunca se traducen.**
9. **Los nombres propios** de organizaciones, productos, normas, leyes e
   investigadores quedan en su forma original (BIPM, ISO 80000-1, COPPA, GDPR,
   CLDR, Cloudflare, Duolingo, Miura, Fuson). Se puede añadir una glosa entre
   paréntesis **solo donde el original mismo explica el término**.
10. **No se resume, no se amplía, no se comenta.** Un párrafo entra, un párrafo
    sale. Sin preámbulo, sin «Aquí está la traducción», sin cercas de código
    envolviendo la respuesta entera.

Y una regla de forma: el documento tiene una sección `## Resumen ejecutivo (ES)`
y otra `## Executive summary (EN)`. **Se traducen las dos** al locale destino,
conservando ambos encabezados. El corpus mantiene la forma de doble resumen a
propósito.

---

## 5. Las fichas de locale

Cada locale lleva su propia ficha en `scripts/traducir-corpus.mjs` (constante
`LOCALES`). **No hay un «es» ni un «pt» genérico**, y esa es la decisión de
diseño más importante del script:

| Locale | Decimal | Millares | Escala de 10⁹ | Léxico que lo distingue |
|--------|---------|----------|---------------|--------------------------|
| `es-MX` | **punto** `.` | coma `1,234,567` | mil millones | computadora, celular, boleta |
| `es-ES` | coma `,` | punto `1.234.567` | mil millones | ordenador, móvil, vosotros |
| `fr-FR` | virgule `,` | espacio fino `1 234 567` | milliard | espacio insecable antes de `: ; ! ?`, comillas `« »` |
| `pt-BR` | vírgula `,` | ponto `1.234.567` | **bilhão** (escala corta) | usuário, tela, celular, time, arquivo, gerúndio |
| `pt-PT` | vírgula `,` | ponto `1.234.567` | **mil milhões** (escala larga) | utilizador, ecrã, telemóvel, equipa, ficheiro, «estar a + infinitivo» |
| `de-DE` | Komma `,` | Punkt `1.234.567` | Milliarde | *Billion* alemán **no** es *billion* inglés; multiplicación con `·`, división con `:`; 21 = einundzwanzig |

**México es la excepción del mundo hispano**: punto decimal, como el inglés.
**Brasil es la excepción lusófona**: escala corta, `10⁹ = bilhão`, mientras que
Portugal dice `mil milhões`. Confundir esas dos es cambiar un número por mil veces
su valor sin tocar un solo dígito.

---

## 6. Cómo se corre

```bash
# un documento
node scripts/traducir-corpus.mjs pt-PT 2026-07-31-mc-05-spacing-retrieval-interleaving.md

# un locale entero
node scripts/traducir-corpus.mjs de-DE --todos

# medir antes de gastar: los primeros 3
node scripts/traducir-corpus.mjs fr-FR --todos --limite 3

# ver el troceo sin llamar al modelo (gratis)
node scripts/traducir-corpus.mjs fr-FR --todos --seco
```

| Bandera | Qué hace |
|---------|----------|
| `--todos` | todos los documentos del corpus |
| `--limite N` | solo los primeros N; sirve para medir costo real antes de comprometerse |
| `--forzar` | retraduce aunque el destino esté al día |
| `--seco` | enseña el plan y el troceo **sin llamar al modelo ni gastar** |
| `--locale X` | forma alterna de dar el locale (la que anuncia `corpus-integridad` al fallar) |

**Es idempotente**: si el destino existe y su `mtime` es mayor o igual al del
origen, se salta. Sin eso, un reintento tras un fallo a mitad de corrida vuelve a
pagar todo lo que ya salió bien.

**Un documento incompleto no se escribe.** Si falla un trozo, se aborta el
documento entero sin tocar el archivo. Un documento a medias pasaría la
idempotencia la próxima vez y quedaría truncado para siempre.

### Variables de entorno

| Variable | Por omisión | Para qué |
|----------|-------------|----------|
| `CLOUDFLARE_ACCOUNT_ID` | — | obligatoria; se lee de `.env` |
| `CLOUDFLARE_API_TOKEN` | — | obligatoria; se captura con `./scripts/set-keys.sh`, **nunca se commitea** |
| `MC_TRAD_MODELO` | `@cf/moonshotai/kimi-k2.6` | modelo primario |
| `MC_TRAD_MODELO_RESPALDO` | `@cf/openai/gpt-oss-120b` | respaldo |
| `MC_TRAD_PALABRAS` | `1400` | palabras por trozo |
| `MC_TRAD_MAX_TOKENS` | `16000` | tope por llamada |
| `MC_TRAD_TOPE_MS` | `300000` | tiempo máximo por llamada |

---

## 7. Cómo trocea, y por qué así

Se corta **solo en encabezados de nivel 2** (`## `) que estén fuera de un bloque
de código cercado — un `## ` dentro de ` ``` ` es contenido, no estructura.

Si una sección sola pasa del presupuesto, se intenta subdividir por `### `. Si ni
así cabe, **se manda entera**: mejor un trozo grande que una tabla partida.

Nunca se corta a media tabla ni dentro de una lista numerada. Una tabla partida
por la mitad se traduce con columnas distintas en cada mitad, y una lista de
fuentes partida pierde la numeración. Esa es la razón entera del troceo por
encabezado: no es elegancia, es que el corte ingenuo destruye exactamente lo que
hace verificable a una investigación.

Los trozos consecutivos pequeños se vuelven a juntar: menos llamadas, menos
costuras entre traducciones.

---

## 8. El modelo, la caché y el fallo que no parece fallo

Cadena: `@cf/moonshotai/kimi-k2.6` → `@cf/openai/gpt-oss-120b`. Dos intentos por
modelo antes de bajar al siguiente. Workers AI y solo Workers AI (D-035).

Endpoint compatible con OpenAI:
`https://api.cloudflare.com/client/v4/accounts/{id}/ai/v1/chat/completions`.

**`x-session-affinity`** manda todos los trozos de un documento a la misma
instancia para que acierte la caché de prefijo. El prompt de sistema es idéntico
en todos los trozos: es exactamente lo que se quiere cachear. Entrada cacheada
$0.16/M contra $0.95/M fresca.

**El fallo que hay que conocer antes de depurarlo a ciegas:** `kimi-k2.6` es un
modelo de razonamiento. Gasta parte de `max_tokens` **pensando**, en
`reasoning_content`, antes de escribir. Con presupuesto justo devuelve `content`
**vacío** y `finish_reason: "length"` — que se lee como «no tradujo» cuando en
realidad no le alcanzó. El script detecta ese caso exacto y lo reporta nombrando
`reasoning_content` y la variable que lo arregla, en vez de decir «devolvió
vacío». Si alguna vez ves ese error, la respuesta es subir `MC_TRAD_MAX_TOKENS`,
no cambiar de modelo.

Nota de Workers AI: **el modo JSON es «best effort»** — la plataforma no garantiza
que el modelo respete un esquema. Por eso este script pide Markdown plano y
verifica después, en vez de confiar en salida estructurada.

---

## 9. La verificación: `audits/corpus-integridad.mjs`

**El traductor no se verifica a sí mismo, a propósito.** Un traductor que se
autoevalúa aprueba lo que acaba de escribir. La verificación es un programa
distinto:

```bash
node audits/corpus-integridad.mjs --locale pt-PT
```

Qué comprueba, contra el original:

- **Números**: cada valor del original aparece en la traducción, y no aparece
  ninguno que no estuviera. Reporta *perdido* e *inventado* por separado.
- **Convención decimal**: que los números estén escritos con el decimal y los
  millares del locale. Un `3.2` en pt-PT es un error aunque el valor sea correcto.
- **URL**: idénticas, ninguna de más, ninguna de menos.
- **`[unverified]`**: mismo conteo, misma ortografía.
- **Identificadores** `mc-NN` / `D-NNN` y literales con número (`§9`, `ISO 80000-1`).
- **Estructura**: encabezados y forma de tabla.

Hace cumplir D-033, D-022 y `mc-34`. **Bloquea**, y la razón está escrita en su
propia salida: una cifra mal trasladada no degrada el texto, fabrica una cita
falsa con nuestro nombre encima.

### El modo de fallo real, observado

De las corridas hechas, casi todos los hallazgos son de dos clases:

```
✗ números: 4 valor(es) del original no aparecen en la traducción, 1 aparecen de más
    perdido: 3.2      perdido: 26.5      inventado: 9
✗ convención decimal: 4 número(s) no están escritos con la convención de pt-PT
    «3.2»  «26.5»
```

Fíjate en que son el **mismo** hallazgo contado dos veces: el modelo dejó `3.2`
sin convertir a `3,2`. El verificador lo ve como número perdido (`3.2` no aparece
tal cual) *y* como convención rota. No es un doble error, es un error con dos
síntomas. Al arreglar la conversión decimal desaparecen los dos.

Los `inventado:` sí son otra cosa y son los graves: un número que no estaba en el
original y apareció en la traducción.

---

## 9bis. Dos defectos que encontró la flota adversarial, y uno que no se pudo automatizar

Corrida del 2026-08-01 sobre `docs/research/` — 23 auditores, 0 bloqueantes, 2 que
reportan, $0.759. Los dos hallazgos eran ciertos y se verificaron a mano antes de
actuar.

**1. El traductor alteró una cita textual de una fuente.** En
`es-ES/mc-46`, el original dice

> *"winners are not selected by chance but instead chosen **based on** some
> measurable criteria"* [1]

y la traducción escribió **`with base on`**, calco literal de «con base en». No es
estilo: es una cita de una fuente citada, alterada, con nuestro nombre encima —
exactamente la clase de error que la regla 1 del prompt existe para impedir, y
que `corpus-integridad` no atrapa porque solo vigila números, URLs, `[unverified]`
e identificadores. **Arreglado.**

**2. El resumen etiquetado `(EN)` está en español en 23 de 143 traducciones.**
El prompt del traductor dice, textualmente: *"Translate BOTH into the target
locale, keeping both headings' structure"*. Y eso hace: traduce el resumen inglés
al idioma destino y le deja el encabezado `## Executive summary (EN)`. El
resultado es una sección que promete inglés y entrega otra cosa.

Es un defecto **de diseño del prompt, no del modelo**. Al reanudar hay que elegir:
o el encabezado se traduce también (`## Zusammenfassung`), o el resumen inglés se
deja en inglés. Yo haría lo segundo: un lector alemán que quiere comprobar una
cifra contra la fuente inglesa agradece tener el resumen original a mano.

**3. Lo que NO se pudo automatizar, y por qué se dice.** Intenté añadir a
`corpus-integridad` una comprobación de citas textuales —que lo entrecomillado en
inglés sobreviva intacto— y **marcó 162 de 143 documentos**: el extractor cruzaba
comillas no relacionadas y capturaba párrafos enteros. Se revirtió sin publicarlo.

Un auditor con esa proporción de ruido se apaga en una semana, y entonces no
vigila nada. Queda como trabajo pendiente: hace falta delimitar la cita por su
marcador de fuente (`[1]`) y no por comillas sueltas.

---

## 10. Lo que falta construir

**El bucle de reintento con retroalimentación no existe.** Es lo único que
convertiría esto de «traduce y alguien revisa 74 documentos a mano» en «traduce,
se verifica, y solo escala lo que no pudo arreglar».

El diseño ya está pensado y `comparar()` está exportada de `corpus-integridad.mjs`
justamente para eso:

1. Traducir el trozo.
2. Correr `comparar()` sobre ese trozo contra su original.
3. Si hay números perdidos o inventados, **reintentar el mismo trozo nombrando lo
   que se perdió**: «tu traducción perdió los valores 3.2 y 26.5 y añadió un 9 que
   no estaba; tradúcelo otra vez conservándolos».
4. Máximo dos reintentos. Si al tercero sigue mal, se escribe el documento **y se
   deja el hallazgo registrado**, nunca se escribe silenciosamente.

No se construyó porque el archivo estaba siendo editado por otro proceso a mitad
de vuelo. Es el primer trabajo que hay que hacer si esto se reanuda: sin él,
reanudar la traducción solo aumenta la pila de documentos por revisar a mano.

---

## 11. Cómo se reanuda

En este orden. Saltarse el paso 1 es multiplicar el trabajo manual.

1. **Construir el bucle de reintento** (§10). Sin él, cada documento nuevo tiene
   ~56% de probabilidad de salir con hallazgos, medido.
2. **Limpiar lo que ya existe**: 74 documentos con hallazgos, empezando por los
   `inventado:` que son los peligrosos.
3. **Terminar lo que falta**, en este orden por valor de mercado:
   `es-MX` (47) → `fr-FR` (47) → `es-ES` (37) → `de-DE` (8).
4. **Correr `corpus-integridad` en verde** para cada locale antes de publicarlo.
5. **Quitar el `inLanguage: "en"`** de las páginas de ese locale — mientras el
   cuerpo sea inglés, esa declaración es la verdad y `audits/jsonld-valid.mjs`
   tiene razón al bloquear.

```bash
# el ciclo completo de un locale, cuando se reanude
node scripts/traducir-corpus.mjs es-MX --todos
node audits/corpus-integridad.mjs --locale es-MX
```

---

## 12. Lo que este manual no resuelve

- **No dice si vale la pena traducir.** Dice qué cuesta ($4.54), qué tarda (~7 h)
  y qué queda por revisar (74 documentos). La decisión es del dueño y hoy está
  tomada: pausado (D-050).
- **No cubre la traducción de la interfaz.** Eso son los archivos de mensajes por
  locale y sigue otras reglas: ahí el texto sí es corto y sí se revisa a ojo.
- **No cubre el contenido matemático de los ítems.** Eso **no se traduce, se
  autora** — ver CLAUDE.md § Idiomas y `mc-34`. Usar este script para un ítem
  sería exactamente el error que la regla existe para evitar.

---

**Decisiones que hace cumplir:** D-022 (siete locales), D-033 (corpus citable),
D-035 (solo Workers AI), D-039 (AGPL-3.0), D-050 (traducción pausada).
**Investigación:** `mc-34` (notación matemática por locale), `mc-48` (citabilidad).
