# AGENTS.md — traducción del corpus de investigación

> Este archivo existe para **un agente que llega a traducir y no conoce el
> proyecto**. Es autosuficiente: si necesitas abrir otro archivo para saber qué
> hacer, es un defecto de este documento.
>
> Las reglas generales del proyecto están en [`CLAUDE.md`](CLAUDE.md). El
> trasfondo largo —costos medidos, troceo, modos de fallo— está en
> [`docs/traduccion.md`](docs/traduccion.md). Aquí está lo que hace falta para
> traducir bien.

---

## 1. Dónde está todo

| Qué | Dónde |
|-----|-------|
| **Original, en inglés** | `docs/research/2026-07-31-mc-NN-*.md` — **47** investigaciones |
| Índice del corpus | `docs/research/README.md` |
| **Destino de cada traducción** | `docs/research/<locale>/<mismo-nombre-de-archivo>.md` |
| El guion que traduce | `scripts/traducir-corpus.mjs` |
| El auditor que verifica | `audits/corpus-integridad.mjs` |
| El medidor de avance | `scripts/medir-traduccion.mjs` |

**El nombre del archivo NO cambia.** `docs/research/es-MX/2026-07-31-mc-05-spacing-retrieval-interleaving.md`
es la traducción de `docs/research/2026-07-31-mc-05-spacing-retrieval-interleaving.md`.
El identificador `mc-NN` es lo que hace citable al corpus; traducir el nombre del
archivo rompe la única forma de encontrar el mismo documento en otro idioma.

---

## 2. Qué falta, medido hoy (2026-08-01)

```
   locale   traducido   copia-en-inglés   sin archivo
   es-MX            0                 0            47   ← FALTA TODO
   es-ES           43                 4             0
   fr-FR            0                 0            47   ← FALTA TODO
   pt-BR           47                 0             0
   pt-PT           47                 0             0
   de-DE           47                 0             0
   total          184                 4            94   de 282
```

Reproducible: `node scripts/medir-traduccion.mjs`

**Empieza por `es-MX`, después `fr-FR`.** Son los dos que están en cero y los dos
mercados grandes. No están vacíos porque fueran difíciles: los dos intentos
anteriores los bloqueó un clasificador antes de traducir una sola palabra.

`es-ES` tiene 4 documentos que siguen siendo copia del inglés: **`mc-33`,
`mc-37`, `mc-46` y `mc-47`**. Vuelve a comprobarlo antes de darlos por hechos —
esta lista se sacó así:

```bash
node scripts/medir-traduccion.mjs --locale es-ES
```

---

## 3. Las diez reglas absolutas

Romper cualquiera de estas hace la salida inservible. No son preferencias de
estilo: el corpus se publica bajo AGPL-3.0 en un repositorio público, con el
nombre de Ignia encima, y su valor entero depende de que alguien pueda verificar
cada cifra contra su fuente.

1. **LOS NÚMEROS SOBREVIVEN IDÉNTICOS.** Cada dígito, porcentaje, año, tamaño de
   muestra, tamaño de efecto, precio y conteo conserva su valor exacto. Un 43%
   que se vuelve 34% es **una cita fabricada con nuestro nombre encima**.
   Sí se **reformatea** a la convención del locale (`43.5` → `43,5` donde el
   decimal es coma). Nunca se cambia el valor, ni se redondea, ni se inventa uno.

2. **LAS URL DE FUENTE SON INTOCABLES.** Carácter por carácter. No se traduce el
   dominio, no se acorta, no se «arregla», no se añade ni se quita ninguna.

3. **LA MARCA `[unverified]` SE QUEDA**, con esa ortografía inglesa exacta y en
   los mismos lugares. Perderla convierte una advertencia declarada en una
   afirmación, que es peor que perder un párrafo. Igual con las variantes largas
   (`[unverified this session, high training-knowledge confidence]`): se conserva
   el corchete y la palabra `unverified`; el resto de la frase sí se traduce.

4. **LOS IDENTIFICADORES CITADOS NO SE TRADUCEN.** `mc-01`…`mc-48` y
   `D-001`…`D-999`, tal cual, con sus mayúsculas y minúsculas.

5. **LOS MARCADORES DE CITA** `[1]`, `[2][3]` quedan pegados a la misma
   afirmación. Nunca se renumeran.

6. **LA ESTRUCTURA MARKDOWN SE PRESERVA**: mismos niveles de encabezado, misma
   forma de tabla (mismas columnas, mismas filas, misma fila de alineación),
   mismos marcadores de lista, mismas citas en bloque, mismo énfasis, mismos
   bloques de código cercados.

7. **CÓDIGO, RUTAS, IDENTIFICADORES Y MUESTRAS DE NOTACIÓN ENTRE COMILLAS
   INVERTIDAS NO SE TRADUCEN.** `` `wrangler.jsonc` ``, `` `docs/research/` ``,
   `` `@cf/...` `` y ejemplos como `` `127 : 4 = 31,75` `` son literales byte a
   byte.

8. **LOS NOMBRES DE LOCALE Y LAS ETIQUETAS BCP-47** (`en`, `es-MX`, `es-ES`,
   `fr-FR`, `pt-BR`, `pt-PT`, `de-DE`) nunca se traducen.

9. **LOS NOMBRES PROPIOS** de organizaciones, productos, normas, leyes e
   investigadores quedan en su forma original: BIPM, ISO 80000-1, COPPA, GDPR,
   CLDR, Cloudflare, Duolingo, Miura, Fuson. **Y «Math Challenge» es uno de
   ellos** — el nombre del producto no se traduce nunca. Se puede añadir una
   glosa entre paréntesis **solo donde el original mismo explica el término**.

10. **NO SE RESUME, NO SE AMPLÍA, NO SE COMENTA.** Un párrafo entra, un párrafo
    sale. Sin preámbulo, sin «Aquí está la traducción», sin comentarios de
    cierre, sin cercas de código envolviendo la respuesta entera.

### Una regla más, que salió de un error real

**Lo entrecomillado que viene de una fuente no se traduce ni se retoca.** En
`es-ES/mc-46` una pasada anterior convirtió la cita

> *"winners are not selected by chance but instead chosen **based on** some
> measurable criteria"* [1]

en `chosen with base on` — calco literal de «con base en». No es un problema de
estilo: es una cita de una fuente citada, alterada. Si el original entrecomilla
algo en inglés y le pone `[N]` al lado, **se copia tal cual**.

---

## 4. Las siete fichas de locale

**No hay un «es» ni un «pt» genérico**, y esa es la decisión de diseño más
importante de todo esto. Fuente: `docs/research/2026-07-31-mc-34-i18n-math-notation.md`.

| Locale | Decimal | Millares | `10⁹` | `×` | `÷` | Léxico que lo distingue |
|--------|---------|----------|-------|-----|-----|--------------------------|
| `en` | punto `.` | coma `1,234,567` | billion (corta) | `×` | `÷` | — |
| `es-MX` | **punto `.`** | coma `1,234,567` | mil millones | `×` | `÷` | computadora, celular, aplicación, boleta |
| `es-ES` | coma `,` | punto `1.234.567` | mil millones | `×` | `÷` | ordenador, móvil, vosotros |
| `fr-FR` | virgule `,` | **espacio fino insecable** `1 234 567` | milliard | `×` | `:` | espacio insecable antes de `: ; ! ?`, comillas `« »` |
| `pt-BR` | vírgula `,` | ponto `1.234.567` | **bilhão (corta)** | `×` | `÷` | usuário, tela, celular, time, arquivo, esporte, gerúndio |
| `pt-PT` | vírgula `,` | ponto `1.234.567` | **mil milhões (larga)** | `×` | `:` | utilizador, ecrã, telemóvel, equipa, ficheiro, desporto, «estar a + infinitivo» |
| `de-DE` | Komma `,` | Punkt `1.234.567` | Milliarde | **`·`** | **`:`** | sustantivos en mayúscula, `ß`, 21 = einundzwanzig |

**Las tres trampas que hay que saberse:**

- **México es la excepción del mundo hispano**: usa **punto** decimal, como el
  inglés. Escribir `43,5` en `es-MX` es un error.
- **Brasil es la excepción lusófona**: escala **corta**, `10⁹ = bilhão`, mientras
  Portugal dice `mil milhões`. Confundirlas cambia un número por **mil veces su
  valor** sin tocar un dígito. Y `pt-PT` **no** es `pt-BR` con otra ortografía:
  son dos locales distintos, con léxico distinto.
- **Alemania multiplica con el punto medio `·`**, no con `×`, porque en un aula
  alemana el `×` se lee como la variable x. Y divide con `:`. Además, *Billion*
  en alemán es `10¹²`, **no** el *billion* inglés.

Donde el decimal es coma (`es-ES`, `fr-FR`, `pt-BR`, `pt-PT`, `de-DE`), el
separador de una lista de números es **punto y coma**: «1,5; 2,5». Con coma sería
ilegible.

---

## 5. La forma del documento

Cada investigación tiene esta estructura, y se conserva:

```markdown
# Título del documento

> Investigación Math Challenge — 2026-07-31 — tema NN

## Resumen ejecutivo (ES)
- …

## Executive summary (EN)
- …

## <secciones del cuerpo>
…

## Fuentes
1. …
```

**El título SÍ se traduce.** La línea de metadatos también.

**Los dos resúmenes:** el corpus lleva dos a propósito. Traduce el cuerpo del
documento al locale destino. Con los resúmenes hay una decisión pendiente y un
defecto conocido:

> **Defecto conocido, sin resolver.** El prompt anterior decía «traduce los dos
> resúmenes al locale destino, conservando los encabezados», y eso produjo **23
> de 143 archivos con una sección titulada `## Executive summary (EN)` cuyo
> contenido está en español o alemán**. La etiqueta promete inglés y entrega otra
> cosa.
>
> **Recomendación para quien retome:** deja el `## Executive summary (EN)` **en
> inglés, sin tocar**. Un lector alemán que quiere comprobar una cifra contra la
> fuente inglesa agradece tener el resumen original a mano. Traduce solo el
> `## Resumen ejecutivo (ES)` al locale destino, y renómbralo al idioma que
> corresponda.
>
> Esta recomendación **no está confirmada por el dueño**. Si la sigues, anótalo.

---

## 6. Cómo se corre

```bash
# un locale entero
node scripts/traducir-corpus.mjs es-MX --todos

# medir antes de comprometerse: los tres primeros
node scripts/traducir-corpus.mjs es-MX --todos --limite 3

# ver el troceo sin llamar al modelo, gratis
node scripts/traducir-corpus.mjs fr-FR --todos --seco

# un documento suelto
node scripts/traducir-corpus.mjs es-MX 2026-07-31-mc-05-spacing-retrieval-interleaving.md
```

| Bandera | Qué hace |
|---------|----------|
| `--todos` | todos los documentos del corpus |
| `--limite N` | solo los primeros N |
| `--forzar` | retraduce aunque el destino esté al día |
| `--seco` | enseña el plan y el troceo **sin gastar nada** |

**Es idempotente**: si el destino existe y es más nuevo que el origen, se salta.
**Un documento que falla a medias no se escribe**, porque uno truncado pasaría la
idempotencia la próxima vez y quedaría roto para siempre.

> **Ojo con el conteo: `--todos` procesa 48, no 47.** El guion recorre todos los
> `.md` de la carpeta, y ahí está también `README.md`, que es el índice y no una
> investigación. Por eso `ls docs/research/*.md | wc -l` da **48** y el conteo de
> investigaciones da **47**. No es un error de ninguno de los dos: son dos cosas
> distintas contadas bien. El índice **sí conviene traducirlo** —es la portada del
> corpus en ese idioma— pero recuerda que «47 traducidos» y «48 archivos» son
> ambos ciertos a la vez.

### El modelo

Cadena por omisión: `@cf/moonshotai/kimi-k2.6` → `@cf/openai/gpt-oss-120b`.
Se cambia con `MC_TRAD_MODELO` y `MC_TRAD_MODELO_RESPALDO`.

**kimi-k2.6 es un modelo de razonamiento**, y esto hay que saberlo antes de
depurar a ciegas: gasta parte de `max_tokens` **pensando**, en
`reasoning_content`, antes de escribir. Con presupuesto justo devuelve `content`
**vacío** y `finish_reason: "length"` — que se lee como «no tradujo» cuando en
realidad no le alcanzó. Medido el 2026-08-01: **1,638 tokens de salida para
traducir una frase de siete palabras**, con 4,819 caracteres de razonamiento.

Si ves ese error, sube `MC_TRAD_MAX_TOKENS`. No cambies de modelo.

| Variable | Por omisión |
|----------|-------------|
| `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN` | se leen de `.env` — **nunca se commitean** |
| `MC_TRAD_PALABRAS` | `1400` palabras por trozo |
| `MC_TRAD_MAX_TOKENS` | `16000` |
| `MC_TRAD_TOPE_MS` | `300000` por llamada |

### El troceo

Se corta **solo en encabezados de nivel 2** (`## `) fuera de bloques de código.
Nunca a media tabla ni dentro de una lista numerada: una tabla partida se traduce
con columnas distintas en cada mitad, y una lista de fuentes partida pierde la
numeración. Esa es la razón entera del troceo por encabezado.

---

## 7. Cómo se verifica

**El traductor no se verifica a sí mismo, a propósito** — quien se autoevalúa
aprueba lo que acaba de escribir. La verificación es otro programa:

```bash
node audits/corpus-integridad.mjs --locale es-MX
```

Comprueba, contra el original: que cada número aparezca y ninguno se invente; que
los números estén escritos con la convención del locale; que las URL sean
idénticas; que las marcas `[unverified]` se conserven; que los identificadores
`mc-NN` / `D-NNN` y los literales con número (`§9`, `ISO 80000-1`, `WCAG 2.2`)
estén intactos.

**Bloquea**, y con razón: una cifra mal trasladada no degrada el texto, fabrica
una cita falsa.

### El modo de fallo que vas a ver

Casi todos los hallazgos son **un solo error con dos síntomas**: el modelo dejó
`3.2` sin convertir a `3,2`, y el verificador lo reporta como número perdido *y*
como convención decimal rota. Al arreglar la conversión desaparecen los dos.

Los `inventado:` sí son otra cosa y son **los graves**: un número que no estaba en
el original y apareció en la traducción.

### El ciclo completo de un locale

```bash
node scripts/traducir-corpus.mjs es-MX --todos
node audits/corpus-integridad.mjs --locale es-MX
node scripts/medir-traduccion.mjs
```

**Un locale no se da por terminado hasta que `corpus-integridad` pasa en verde.**
Hoy, 74 de 131 documentos medidos tienen hallazgos: traducido no es publicable.

---

## 8. Lo que este guion todavía no hace

**No hay bucle de reintento con retroalimentación.** Es lo único que convertiría
esto de «traduce y alguien revisa 74 documentos a mano» en «traduce, se verifica,
y solo escala lo que no pudo arreglar». `comparar()` está exportada de
`corpus-integridad.mjs` justamente para eso.

El diseño, si lo construyes:

1. Traducir el trozo.
2. Correr `comparar()` sobre ese trozo contra su original.
3. Si hay números perdidos o inventados, **reintentar el mismo trozo nombrando lo
   que se perdió**: «tu traducción perdió los valores 3.2 y 26.5 y añadió un 9 que
   no estaba; tradúcelo otra vez conservándolos».
4. Máximo dos reintentos. Al tercero se escribe el documento **y se deja el
   hallazgo registrado** — nunca se escribe en silencio.

**No hay forma declarada de parar un lote.** El 2026-08-01 una corrida no se
dejaba matar: había un `xargs -P 8` relanzando el siguiente documento cada vez que
moría uno. Hubo que matar el grupo de procesos entero. Si lanzas un lote largo,
deja escrito cómo se para.

---

## 9. Lo que NO entra aquí

- **La interfaz.** Los archivos de mensajes por locale
  (`apps/web/src/i18n/*.json`) siguen otras reglas: ahí el texto es corto y se
  revisa a ojo.
- **El contenido matemático de los ítems.** Eso **no se traduce, se autora** —
  ver `CLAUDE.md` § Idiomas. Usar este guion para un ítem sería exactamente el
  error que la regla existe para evitar.
- **La calidad de la prosa.** `corpus-integridad` comprueba invariantes —cifras,
  URL, marcas, identificadores—, no si el alemán es bueno ni si `pt-PT` dice
  «utilizador» y no «usuário». Eso necesita revisión humana nativa, y sigue
  pendiente para los 184 documentos ya traducidos.

---

**Decisiones que gobiernan esto:** D-022 (siete locales), D-033 (el corpus es lo
que hace citable al sitio), D-035 (solo Workers AI), D-039 (AGPL-3.0), D-050 (la
traducción se pausó el 2026-07-31; reanudarla es una decisión del dueño).
**Investigación:** `mc-34` (notación matemática por locale), `mc-48` (citabilidad).
