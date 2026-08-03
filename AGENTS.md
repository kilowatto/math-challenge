# AGENTS.md — cómo se trabaja con agentes en este repositorio

> Dos cosas viven aquí, y conviene no confundirlas:
>
> 1. **Cómo se orquestan varios agentes en paralelo** — la sección de abajo,
>    escrita el 2026-08-03 mientras cinco corrían a la vez.
> 2. **La especificación de traducción del corpus de investigación** — desde
>    «CERRADO Y DESPLEGADO» hacia abajo. Es autosuficiente a propósito: la lee
>    un agente que no conoce el proyecto.

---

# 1 · Orquestación de agentes en paralelo

*Última actualización: 2026-08-03, durante la construcción de F7 y F8.*

## Por qué en paralelo, y cuándo NO

Un agente por frente sirve cuando los frentes **no comparten archivos**. Cuando
los comparten, el paralelismo no ahorra tiempo: lo mueve al final, a quien
integra. La regla práctica que salió de esta sesión:

- **Paralelizar por TERRITORIO, no por issue.** Cada agente recibe una lista
  explícita de archivos suyos y una lista de archivos ajenos que **no toca**.
- **Los registros compartidos se tocan igual, y no pasa nada** — siempre que
  todos añadan **al final** y nadie reordene. Los tres de este repo son
  `audits/run.mjs`, `audits/pruebas-auditores.mjs` y
  `audits/adversarial/cartas.mjs`. Cada conflicto se resolvió igual: **los dos
  lados añaden, se conservan los dos.**
- **Los números de migración se reparten POR ADELANTADO.** D1 lleva el control
  por nombre de archivo, así que dos agentes escribiendo `0009` es un conflicto
  que ninguna prueba encuentra.

## El error de reparto que cometí, para que no se repita

Repartí `0009`, `0010`, `0011` y **`0012`** — saltándome un número, porque uno
de los frentes no iba a necesitar migración y al final sí. `audits/migration-safety.mjs`
**bloquea los huecos de numeración**, así que ese agente no podía commitear de
ninguna manera.

Hizo lo correcto: usó el número contiguo y dejó un **choque visible** en vez de
un hueco silencioso, con el porqué escrito dentro del SQL. De ahí salió el
marcador que ahora existe:

```sql
-- migration-safety-reserva: 0009 — repartida a otra rama en construcción
```

Declara un número reservado por una rama que aún no aterrizó, **y bloquea en
cuanto ese archivo existe** — para que la excepción no se vuelva permanente.
Funcionó de verdad: al mergear el mapa, el auditor exigió estrechar la reserva.

## La plantilla de encargo

Todo agente de este repo recibe, en este orden:

1. **Qué leer, numerado.** `CLAUDE.md`, las decisiones concretas por número
   (`D-014, D-079, …`), la investigación concreta (`mc-16`, `mc-42` §7), los
   issues con `gh issue view N`, y **el archivo que le sirve de patrón**.
2. **Su territorio**, y el de los demás agentes vivos, con nombres de archivo.
3. **Las líneas rojas que su trabajo puede cruzar**, citadas por número y con
   la consecuencia dicha. No «respeta la privacidad», sino «línea roja #6: la
   racha nunca se rompe por respetar el límite de pantalla».
4. **Qué cuenta como prueba**, explícito: gate verde con la salida pegada,
   control negativo **visto fallar degradando el archivo real** (D-070), y para
   lo que toca producto, **jugarlo de verdad**.
5. **Las trampas ya medidas.** Se repiten en cada encargo porque se repiten en
   la realidad — ver abajo.
6. **Cómo cerrar**: rama desde `origin/main`, Conventional Commits en inglés con
   cuerpo, PR abierto, **sin mergear y sin desplegar**, y **decir lo que el
   cambio NO hizo**.

## Las trampas que se repiten, y que van en todos los encargos

Ninguna es teórica. Las cinco ocurrieron en este repositorio.

- **Un auditor puede aprobar su propia violación.** Si el auditor juzga con la
  misma función que el código usa para decidir, no puede fallar nunca. Pasó dos
  veces el mismo día, en dos frentes distintos. La única defensa es reescribir
  la tabla de precondiciones **a mano**, como segunda fuente (D-070).
- **`\b` de JavaScript solo conoce ASCII.** `/\bse acab[oó]\b/` no encuentra
  «Se acabó»: la forma con acento pasa de largo. Dejó un locale entero sin
  protección contra elogios a la capacidad, y un léxico de racha ciego a las dos
  formas naturales de decirlo en español. Usa `conFronteraUnicode()` de
  `audits/lib/repo.mjs`.
- **Un control negativo cuyo objetivo se movió es un auditor apagado en
  silencio.** El arnés lo caza —«el caso corría en verde sin degradar nada»— y
  hay que reapuntarlo, no borrarlo.
- **Código correcto que ninguna ruta alcanza.** `marcarDispositivoDelHogar`,
  `<Marca>` sin importar, `validarItem` sin llamador. `funcion-sin-llamar.mjs`
  existe para esto — y él mismo falló abierto por contar llamadas **dentro de
  comentarios**, así que un módulo se contaba a sí mismo como su llamador.
- **`define:vars` implica `is:inline`,** y un script inline con TypeScript viaja
  crudo al navegador y **mata el script entero** sin fallar en ningún sitio
  (D-032).

## Lo que el orquestador hace, y no delega

- **Resolver los merges** de los registros compartidos. Nunca los agentes.
- **Renumerar migraciones** antes de que ninguna toque una base. Después no
  sería gratis.
- **Decidir sobre decisiones**: los números de `docs/decisions.md` los reparte
  el orquestador, porque dos agentes escribiendo «D-080» es una colisión
  silenciosa en el documento que gobierna el producto. Pasó, y se atrapó.
- **No ejecutar acciones irreversibles en producción sin el dueño.** El registro
  `d1_migrations` de la base real está desincronizado —`0003` a `0006` se
  aplicaron a mano y no quedaron registradas— y arreglarlo es una escritura a la
  tabla de control de migraciones. Los comandos están escritos y **sin
  ejecutar**.

## Estado al 2026-08-03

| Fase | Estado |
|---|---|
| **F6 · Larry Profe** | Código completo y **desplegado** (`38052c7f`). Los 7 issues siguen abiertos: nadie ha **escuchado** una voz en un aparato real |
| **F7 · Juego** | Motores puros en `main`. Mapa en `main`. Cableado y misiones en PR. Social en construcción |
| **F8 · Padres** | Motor del límite de pantalla en `main` (#388). Panel y reportes sin empezar |

La flota de auditores pasó de 66 a **87** en dos días, y el arnés de controles
negativos de 32 a **103 casos**. Ese crecimiento no es decorativo: **cuatro de
los defectos más caros de esta sesión los encontró un control negativo, no una
lectura del código.**

---

## CERRADO Y DESPLEGADO — 2026-08-01, tarde

Traducción, cableado y despliegue: **terminados**. PR #174 mergeado a `main`
(`ddedf3f`), desplegado a `math.kilowatto.com` (versión `e7b6728f`),
verificado con `node audits/live.mjs` (22/22) y con `curl` directo contra una
página traducida en producción. No queda trabajo de traducción pendiente de
esta sesión.

**Manifiesto al momento de desplegar** (`apps/web/src/lib/corpus-verificado.json`,
regenerable con `node audits/corpus-integridad.mjs --manifiesto`): es-MX 44/47,
es-ES 38/47, fr-FR 29/47, pt-BR 41/47, pt-PT 41/47, de-DE 37/47 — 230/282.
**Este número se mueve** sin que el contenido cambie, porque el propio
`audits/corpus-integridad.mjs` sigue recibiendo ajustes de otras sesiones
(qué cuenta como literal protegido vs. número). No lo tomes como el techo real
de calidad — vuelve a correr el manifiesto antes de citar una cifra.

**Lo que queda en rojo y NO es trabajo de traducción:**
1. Números dentro de `## Executive summary (EN)` — intacto por decisión
   confirmada del dueño (ver más abajo). Nunca va a pasar el auditor tal como
   está, salvo que se le enseñe a excluir esa sección.
2. Huecos del propio auditor, verificados uno por uno contra el original por
   los agentes de reparación: identificadores WCAG/CFR/guideline sin
   palabra-gatillo adyacente, números ≥1.000.000 con agrupación por puntos
   que colisiona con el regex de literales de versión, títulos de fuente
   citados textualmente que no se pueden reformatear.

Si retomas esto, es trabajo de `audits/corpus-integridad.mjs`, no de
`docs/research/`.

---

## Estado real — 2026-08-01 (actualizado, no confiar en la tabla de §2 más abajo)

**Los seis locales están 100% traducidos.** `node scripts/medir-traduccion.mjs`
da 282/282 (47 × 6). La tabla de §2 y el «74 de 131» de §7 son de ANTES de la
corrida del 2026-08-01 — quedan como registro histórico, no como estado
actual. Reproduce con el comando de arriba antes de creer cualquier número de
este archivo, incluido este.

**Cómo se hizo, distinto de lo que dice §6 de aquí abajo:** no se usó
`scripts/traducir-corpus.mjs` (la cadena Workers AI). Se tradujo con Claude
directo — agentes en paralelo vía el `Agent`/`Workflow` de Claude Code, un
lote de ~4 documentos por agente — por instrucción explícita del dueño en
sesión, decisión que §5 más abajo ya deja anotada y confirmada. Si retomas la
traducción de algo que falte, sigue este patrón, no el de §6.

**Integridad:** `corpus-integridad.mjs` pasa en verde salvo un puñado de
falsos positivos ya documentados y esperados por diseño (ver §5: la sección
`## Executive summary (EN)` intacta, y en `mc-34` los ejemplos que citan a
propósito la notación de OTRO locale). Conteo por locale del 2026-08-01:
es-MX 1, es-ES 7, fr-FR 15, pt-BR 4, pt-PT 3, de-DE 8 archivos con hallazgo —
todos revisados, ninguno es cifra fabricada real.

**El sitio ya lee las traducciones — parcialmente.** `apps/web/src/lib/corpus.ts`
tiene `LOCALES_TRADUCCION_VERIFICADA = ["es-MX", "es-ES", "fr-FR"]`:
esos tres sirven el cuerpo traducido en `/{locale}/.../mc-NN.../`, verificado
con `pnpm build` (141/141 páginas, cero regresión en los demás locales).
`pt-BR`, `pt-PT` y `de-DE` se quedan en inglés a propósito: sus 47 archivos
traducidos tienen encabezados `## Resumen ejecutivo`/`## Sources` inconsistentes
entre sí (herencia de pasadas de traducción anteriores, antes de este archivo),
y `trimBody()` falla fuerte por diseño — conectarlos sin antes normalizar
tumbaría el build entero por un solo documento raro. Para ampliar la lista:
normaliza encabezados en ese locale, confírmalo con el mismo barrido que usó
esta sesión (`grep -h "^## " docs/research/<locale>/*.md`), y añade el locale
a `LOCALES_TRADUCCION_VERIFICADA` + `SOURCES_IDS_POR_LOCALE`.

**Pendiente, sin resolver:** `node audits/jsonld-valid.mjs` reporta
`description del marcado no coincide con <meta name="description">` en ~15
documentos de `en/research/` (bug preexistente en `firstSentence()`/`leadOf()`,
ajeno a esta traducción) y ~8 casos NUEVOS por locale en es-MX/es-ES/fr-FR
—mismo bug, disparado por puntuación/comillas del resumen ya traducido—.
No se investigó a fondo. Si vas a comitear esto, correr ese auditor primero.

**Nada de esto está comiteado.** La sesión que lo hizo terminó en la rama
`tools/sincronizar-tablero` (compartida, cambiada por otra sesión en curso, no
por esta). Varias sesiones de Claude Code corren en paralelo sobre este mismo
repo — si vas a comitear, revisa `git status` primero: puede haber cambios de
otra sesión mezclados en el working tree que no son tuyos ni de esta nota.

---

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
> **Decisión del dueño — confirmada el 2026-08-01.** Deja el `## Executive
> summary (EN)` **en inglés, sin tocar, copia byte a byte**. Un lector alemán
> que quiere comprobar una cifra contra la fuente inglesa agradece tener el
> resumen original a mano. Traduce solo el `## Resumen ejecutivo (ES)` al
> locale destino, y renómbralo al idioma que corresponda.
>
> **Consecuencia aceptada a propósito:** en los locales de decimal-coma
> (es-ES, fr-FR, pt-BR, pt-PT, de-DE), `corpus-integridad.mjs` lee el archivo
> **entero** bajo la convención del locale destino, así que números en formato
> inglés dentro de esa sección intacta (`43.5`, `1,234`) casi siempre se
> reportan como «número perdido» o «convención decimal rota». Es un falso
> positivo estructural, verificado de forma independiente por decenas de
> agentes en la corrida del 2026-08-01 en los seis locales. **No se repara
> traduciendo la sección** — eso violaría esta misma decisión. Se acepta el
> hallazgo del auditor como ruido conocido en esa sección específica.

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
