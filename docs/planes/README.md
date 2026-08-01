# Síntesis de los cuatro planes — una sola recomendación

> **Fecha:** 2026-07-31 19:14 · **Estado del repo al medir:** rama
> `feat/adversarial-fleet`, `HEAD = 4e676c1`, **25 archivos sin commitear**.
>
> Esto NO repite los cuatro planes. Sintetiza `2026-07-31-auditoria-tablero.md`,
> `f2-cuentas-onboarding.md`, `sitio-s0-s1-s2.md` y `esquema-item.md` con sus
> cuatro revisiones adversariales, y dice qué se construye hoy, en qué orden, qué
> está bloqueado por una decisión del dueño, y qué se descartó.
>
> **Todo lo factual de aquí se re-ejecutó hoy**, contra el árbol de arriba. Los
> comandos están pegados. Lo que no pude verificar está en §5, y no está
> escondido al final por casualidad: léelo antes de aprobar nada.

---

## 0. El hecho que reordena los cuatro planes

Los cuatro planes se escribieron contra un árbol en movimiento, y los cuatro lo
declararon. Al sintetizarlos encontré que **el movimiento ya invalidó parte de lo
que proponen construir**.

### 0.1 Nada de esto existe en `main`

```
$ git rev-list --left-right --count main...feat/adversarial-fleet
0	18
$ gh pr list --state all --json number
[]
$ git ls-tree main --name-only docs/research/ | wc -l
      44
$ git ls-tree feat/adversarial-fleet --name-only docs/research/ | wc -l
      48
```

F0, F1, el sitio en siete locales, D-034 a D-037 y las investigaciones mc-45 a
mc-48 viven en una rama sin un solo PR abierto. Consecuencia medible: el criterio
de F1 «25 alertas en code scanning», marcado hecho, **es falso en el
repositorio**.

```
$ gh api /repos/kilowatto/math-challenge/code-scanning/alerts
[]
$ gh api "/repos/kilowatto/math-challenge/code-scanning/alerts?ref=refs/heads/feat/adversarial-fleet" -q length
25
```

### 0.2 Ocho auditores que tres planes proponen escribir **ya existen**, sin commitear — y tres están en rojo

El plan del sitio dice que `jsonld-valid` y `hreflang-recip` «no existen». El plan
de F2 propone escribir `touch-targets` y `migration-safety`. Los cuatro existen en
disco, junto con otros cuatro, escritos por el frente de D-037 durante las mismas
horas. **Ninguno está en `ACTIVE` de `audits/run.mjs`**, así que el gancho
pre-commit sale verde mientras tres de ellos fallan:

```
$ for f in jsonld-valid hreflang-recip touch-targets axe-a11y contrast \
           precache-budget migration-safety cwv-budget; do
    out=$(node audits/$f.mjs 2>&1); code=$?
    printf "%-18s EXIT=%s  %s\n" "$f" "$code" "$(echo "$out" | head -1)"
  done

jsonld-valid       EXIT=1  ✗ jsonld-valid
hreflang-recip     EXIT=0  ✓ hreflang-recip — 7 locales + x-default, recíproco y con auto-referencia
touch-targets      EXIT=0  ✓ touch-targets — 3 blanco(s) táctil(es) ≥ su piso de banda
axe-a11y           EXIT=1  ✗ axe-a11y
contrast           EXIT=1  ✗ contrast
precache-budget    EXIT=0  ✓ precache-budget — 5 entrada(s), shell 70.9 KB de 200 KB (35%)
migration-safety   EXIT=0  ✓ migration-safety — 2 migración(es) 0001..0002, ningún borrado destructivo
cwv-budget         EXIT=0  ○ cwv-budget — inactivo: el token no tiene Account → Account Analytics → Read
```

**Esto reordena el trabajo.** Lo primero no es escribir auditores: es enchufar los
ocho que ya existen y apagar los tres rojos. Cualquier plan que empiece por
«escribir `jsonld-valid`» duplica trabajo hecho.

### 0.3 Dos conflictos que los planes escalaron al dueño ya no existen

- **C-1 del tablero y pregunta 1 de `esquema-item` (F5b contra D-018) se
  disuelve.** La frase «la unidad de diseño es la **serie**, no la pregunta
  suelta» vive dentro del párrafo *«**Tamaño del MVP:** 2,500 retos jugables,
  compuestos a partir de ~400 ítems **de kinder** en 14 habilidades»*
  (`sed -n '328,332p' docs/decisions.md`). Y D-018 **abre** diciendo que un reto
  puede ser «un solo ítem difícil». D-034 dice «los 2,500 retos curados **son de
  kinder**». Mismo alcance, no lo contrario. **No es una contradicción entre dos
  decisiones del dueño y no se le sube.** El único residuo real es
  `CLAUDE.md:124`, que repite la frase sin alcance: es una edición de una línea.
  El cuerpo de F5b en el tablero, que hoy dice «son incompatibles, resolver antes
  de construir», está mal y hay que corregirlo.

- **C-2 del tablero (medición de campo contra cero terceros) ya está resuelto por
  D-037**, que es posterior al plan: campo solo en superficies de adulto,
  inyección de zona apagada, `audits/telemetria-infantil.mjs` bloqueando.
  `docs/decisions.md:1144`. **No se le sube al dueño.**

Se le quitan dos preguntas de encima. Se le agregan otras que ningún plan hizo
(§2).

---

## 1. Qué empieza hoy, y en qué orden

El orden no es por fase: es por **qué le impide a la siguiente cosa ser verdad**.
Las dos vías (sitio y producto) corren en paralelo desde el paso 3.

### Paso 1 — Aterrizar la rama y el frente sin commitear

Nada de lo que sigue es verificable por otra persona hasta que esto pase. Son dos
PRs, no uno:

1. `feat/adversarial-fleet` → `main` (18 commits: F0, F1, sitio, D-034…D-036,
   mc-45…mc-48).
2. El frente de D-037 sin commitear: 9 modificados + 12 sin seguimiento, entre
   ellos los ocho auditores de §0.2, `apps/web/src/pages/api/rum.ts` y la propia
   D-037.

Al abrir el primero, **el criterio de F1 «25 alertas» se vuelve verdadero solo
entonces**. Hasta ese momento sigue marcado hecho y no lo es.

### Paso 2 — Apagar los tres auditores en rojo, antes de construir sobre ellos

Los tres fallan **hoy**, sobre `apps/web/dist` como está en el árbol.

**a) `contrast` — tres tokens de marca por debajo del umbral.**

```
· [claro · :root] --color-text-muted (#727476) sobre --color-surface (#F7F7F8) — 4.38:1, exige 4.5:1
· [claro · :root] --color-text-brand-warm (#CE4912) sobre --color-surface (#F7F7F8) — 4.28:1, exige 4.5:1
· [claro · :root] --color-accent (#F36B1C) sobre --color-surface (#F7F7F8) — 2.83:1, exige 3:1 (gráfico/control)
```

El tercero corrige una línea de `CLAUDE.md`. La regla dice que el naranja de
Ignia «da 3.03:1 sobre blanco y no alcanza para texto normal — solo títulos
grandes, botones y gráficos». Los 3.03:1 son contra **blanco puro**. La
superficie real del producto es `--color-surface: #F7F7F8`, y ahí da **2.83:1**,
que **no alcanza ni para gráficos y controles**:

```
$ node -e 'const L=h=>{const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=0.03928?v/12.92:((v+0.055)/1.055)**2.4);return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]};const R=(a,b)=>{const x=L(a),y=L(b);return ((Math.max(x,y)+0.05)/(Math.min(x,y)+0.05)).toFixed(2)};console.log("sobre #F7F7F8:",R("#F36B1C","#F7F7F8"));console.log("sobre #FFFFFF:",R("#F36B1C","#FFFFFF"))'
sobre #F7F7F8: 2.83
sobre #FFFFFF: 3.03
```

No es un token que se ajusta y ya: es la frase de `CLAUDE.md` y de
`guia-de-estilo.md` la que hay que corregir, porque hoy autoriza un uso que el
auditor rechaza. Ninguno de los cuatro planes lo encontró.

**b) `axe-a11y` — la página raíz `/` falla dos reglas WCAG 2.2 AA.**

```
· / — html-has-lang [serious] · WCAG 3.1.1
· / — meta-refresh [critical] · WCAG 2.2.1

$ cat apps/web/dist/index.html
<!doctype html><title>Redirecting to: /en/</title><meta http-equiv="refresh" content="2;url=/en/">…
```

Es la página de redirección que genera Astro, no código escrito a mano. D-033
declara WCAG 2.2 AA **requisito de publicación del sitio**, y el sitio se publica
en S1/S2. Se arregla con un redirect real en el borde (301/302) en vez de un
`meta refresh`, que además es lo correcto para el rastreador.

**c) `jsonld-valid` está en rojo Y hace cumplir la regla equivocada.** Esto es lo
más importante del paso 2, y afina el hallazgo bloqueante de la revisión del
sitio. El auditor reporta dos páginas `fr-FR` porque compara la `description` del
marcado contra `<meta name="description">` — dos campos del `<head>`. La regla
dura de `mc-48` §3 es que el marcado coincida con lo **visible**. Con esa regla,
fallan **6 de 6 cadenas en todos los locales**:

```
$ node -e 'const fs=require("fs");for(const l of ["en","de-DE"]){const h=fs.readFileSync(`apps/web/dist/${l}/index.html`,"utf8");const ld=JSON.parse(h.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);const b=h.replace(/<head[\s\S]*?<\/head>/i,"").replace(/<script[\s\S]*?<\/script>/g,"").replace(/<[^>]+>/g," ");for(const n of ld["@graph"])for(const k of ["name","description"])if(typeof n[k]==="string")console.log(l,n["@type"]+"."+k,b.includes(n[k]))}'
en WebSite.name false          de-DE WebSite.name false
en WebSite.description false   de-DE WebSite.description false
en Organization.name false     de-DE Organization.name false
en Organization.description false  de-DE Organization.description false
en WebPage.name false          de-DE WebPage.description false
en WebPage.description false   de-DE WebPage.name false
```

El propio auditor afirma en su texto de error que «el título y la descripción del
esquema salen de las mismas variables que rinde el `<body>` justamente para que
no puedan separarse». **Eso es falso hoy** y el auditor no lo detecta. **Primero
se corrige el auditor, después las páginas** — al revés se arregla contra una
regla que nadie está comprobando.

Recomendación para las páginas: renderizar `description` como párrafo de entrada
visible y alinear `Organization.name` con el pie (hoy el esquema dice «Ignia
Cloud» y el pie dice «A project by Ignia»). La alternativa —sacar `name` y
`description` del marcado— también cierra la regla, pero desperdicia el argumento
de `mc-48`, que es que el sitio es la estrategia.

### Paso 3 — Los tres huecos en reglas que ya existen, antes de la migración que los estrena

Cada uno es de ~10 líneas y cada uno **debe verse fallar antes del arreglo**
(regla 3 de `CLAUDE.md`), con la salida pegada en el PR.

| Hueco | Verificación | Qué deja pasar |
|---|---|---|
| `audits/child-free-text.mjs` solo mira 3 tablas y solo `CREATE TABLE` | `grep -n 'CHILD_TABLES' audits/child-free-text.mjs` → `["child_profiles","child_image_pin","skill_state"]`; `grep -nE 'CREATE TABLE\|child_profile_id' migrations/0002_child_profiles.sql` → `screen_time_settings` y `score_totals` también son de niño | **Línea roja #3.** La única columna TEXT nueva que propone la 0003 de F2 es `ALTER TABLE screen_time_settings ADD COLUMN bedtime_local TEXT` — la tabla que el auditor no mira, con la sintaxis que el auditor no parsea. Arreglo: ampliar `CHILD_TABLES` a 5 **y** parsear `ALTER TABLE`. Hacer solo lo segundo, como propone el plan de F2, no cierra nada |
| `audits/cf-prefix.mjs` no cruza Durable Objects ni Turnstile | `sed -n '18,28p' audits/cf-prefix.mjs` → `NAMED_FIELDS` no incluye `durable_objects` | **CLAUDE.md § Cloudflare.** Un DO o un widget de Turnstile se crea sin renglón en la bitácora y el gancho pasa verde. F2 crea los dos |
| `audits/locales-complete.mjs` es ciego a `CHECK (locale IS NULL OR locale IN (…))` | `grep -n CHECK audits/locales-complete.mjs` → `/CHECK\s*\(\s*\w*locale\w*\s+IN\s*\(([^)]*)\)/gi` | **D-022.** Es la forma natural de la columna nullable que exige el ítem `universal` de D-034. La comprobación de los siete locales se salta en silencio |

### Paso 4 — Los residuos documentales, antes de que alguien construya contra ellos

`D-035` dice literal: «No queda ningún camino a la API de Claude — ni en la
flota, ni en la banda Pro de Larry, ni como escalada de moderación»
(`docs/decisions.md:957-958`; la frase se parte entre dos líneas, así que un
`grep` de la frase completa devuelve 0). Quedan cinco residuos, **no dos**:

```
$ git show HEAD:docs/infrastructure.md | grep -n 'Claude\|ANTHROPIC'
38:5. **AI Gateway va delante de Claude siempre**, para caché, límite de gasto por
49:| `math-challenge-tutor` | Worker | … calls Claude via AI Gateway with RAG …
68:| `math-challenge-tutor-gateway` | AI Gateway | … model routing for Claude calls … (gateway ID in `ANTHROPIC_BASE_URL`)
73:| `math-challenge-secrets` | Secrets Store | Holds `ANTHROPIC_API_KEY` … 
```

Son **cuatro**, no tres, y las dos que el plan del tablero no nombró son las que
hacen que alguien cree el recurso: la 38 es una **regla de arquitectura**, no una
fila de inventario, y la 73/74 es literalmente la llave que D-035 mató.

Y el quinto, que **ningún plan encontró**:

```
$ sed -n '251p' docs/decisions.md
offline) + API de Claude en vivo solo cuando el niño pide más o comete un error
```

Es la **frase de decisión de D-015**, sin tachar. D-035 tachó la tabla de modelos
de D-015 pero no su frase de decisión, así que la decisión vigente sobre Larry
sigue ruteando a la API de Claude. Se tacha con nota fechada, igual que se hizo
con la tabla — no se reescribe la decisión del dueño.

Otros residuos del mismo paso, todos re-ejecutables:

- `migrations/0001_identity.sql:6` justifica las passkeys citando **D-035**, que
  es «Workers AI como proveedor de inferencia». **No existe ninguna decisión
  sobre passkeys.** La cita es falsa aunque la implementación sea razonable, y
  `rigor-cientifico` la caza por carta. Se corrige la cita o se crea la decisión
  (pregunta 5 de §2).
- `audits/adversarial/cartas.mjs:264` — la carta de `ux-banda` no autoriza citar
  `D-036`, así que un hallazgo correcto sobre tipografía se tira mecánicamente.
  Verificado: `cita: ["D-017","D-031","mc-21","mc-22","mc-23","mc-38","mc-43"]`.
- `audits/README.md:83` — el ejemplo dice «un hallazgo que cite `D-036` cuando
  las decisiones llegan a D-034». D-036 y D-037 existen. El ejemplo enseña lo
  contrario de lo que la regla hace.
- **Conteos de investigaciones, tres cifras distintas y ninguna correcta:**
  `CLAUDE.md:14` dice 43, `docs/decisions.md:854` dice 45 y «152,000 palabras»,
  `docs/research/README.md:3` dice 47. Real:
  `ls docs/research/2026-07-31-mc-*.md | wc -l` → **47**;
  `cat docs/research/2026-07-31-mc-*.md | wc -w` → **157235**. Las decisiones del
  dueño se anotan con nota fechada, no se editan; `CLAUDE.md` sí se corrige.
- `README.md:32` dice «**Fase de planeación.** No hay código todavía». Falso:
  existen `apps/web`, `apps/ingest`, dos migraciones aplicadas, un Worker
  desplegado y auditores bloqueando. Cada página del sitio va a enlazar ahí.
- **Los 22 issues de F1.** Cuatro (`#1`–`#4`, todos de `anti-trampa`) no son
  hallazgos sino notas de conformidad, publicadas como issue y como alerta SARIF.
  Y cinco de los seis de `red-lenta` traen el resumen de **otro** hallazgo:

  ```
  $ gh issue view 14 --json body -q .body   # título: "No se está aprovechando HTTP/3"
    ## Evidencia: El template actual no incluye imágenes; … 
  $ gh issue view 15 --json body -q .body   # título: "usa imageService: compile"
    ## Evidencia: La decisión D‑030 prescribe uso de HTTP/3 sobre QUIC con 0‑RTT, …
  ```

  Los títulos están cruzados respecto de sus propios cuerpos. **Hay que releerlos
  por `Archivo`+`Evidencia`+`Arreglo`, nunca por el título** — el plan del tablero
  advirtió esto y después juzgó a `#14` y `#15` por sus títulos, exactamente el
  error que denunciaba. Los 22 issues están CLOSED
  (`gh issue list --state all`). El arreglo permanente es que `evidencia.mjs`
  rechace un resumen que no mencione ni el archivo ni el símbolo de su propia
  evidencia.

### Paso 5 — Vía B (sitio), en paralelo desde aquí

Cerrar **S0**, que está peor descrita que la realidad: su criterio de cero
terceros ya se cumple y el esqueleto ya está desplegado
(`node audits/live.mjs` → 22 comprobaciones, exit 0). Lo que falta de S0 después
del paso 2 es enchufar `jsonld-valid` y `hreflang-recip` a `ACTIVE`, arreglar el
JSON-LD y la raíz `/`, y **mover S0 de Todo a In Progress** en el tablero.

**S1 no arranca todavía**: depende de la pregunta 1 de §2 y tiene dos bloqueos
técnicos medidos (§3).

### Paso 6 — Vía A (producto): F2, después del paso 3

La migración `0003` del plan de F2, con las seis piezas que faltan (país/huso/
región/puerta en `users`, dominio de `consent_type`, `household_devices`,
`group_owner_identity`, `onboarding_marks`, hora de dormir) y el índice único de
alias por padre. **No antes del paso 3**, porque `0003` estrena los tres huecos.

Corregir además dos criterios del tablero que F2 no puede cerrar:
`classroom_membership` está en F9 por `master-plan.md` §13.2 y por
`0001_identity.sql:14`; y `audit:i18n` / `audit:migrations` de `package.json`
apuntan a archivos inexistentes (`ls audits/i18n-complete.mjs audits/migrations.mjs`
→ *No such file*).

### Paso 7 — El esquema de ítem: cuatro candados y una aritmética

Es la **ruta crítica** (F5, siete autores nativos, D-022). El esquema de
`docs/planes/esquema-item.schema.json` es sólido —su demo sale con código 0— pero
le faltan cuatro candados que sabe poner y no puso, y su presupuesto de audio está
mal contado.

**Candado 1, el más grave.** El barandal de D-034 «sin modo historia y sin arte de
la Sabana» para la franja adulta no está en ninguna parte:

```
$ node -e '…ajv.compile(esquema-item.schema.json)…'
SERIO + HISTORIA + lugar sabana VALIDA: true
```

El esquema ya sabe hacer este candado —el `if/then` de
`KINDER → [PRACTICA,PROBLEMA,HISTORIA]` está diez líneas antes— y solo cubre la
banda de kinder (`banda enum: ["KINDER","PRIMARIA","SECUNDARIA","SERIO","PRO"]`).

**Candado 2.** La restricción de formato por banda existe en `reto` y no en
`item`: un ítem de kinder con formato no táctil valida.

**Candado 3.** `frase.vars` admite `string` sin acotar, así que un ítem puede
llevar texto ya formado adentro — lo que la primera fila del propio plan declara
imposible.

**Candado 4.** `medios[].rol` incluye `audio_respuesta`, que aparece **una sola
vez en todo el esquema y en ninguna parte del plan**
(`grep -n audio_respuesta docs/planes/esquema-item.schema.json` → línea 186, sin
descripción). `mc-34` implicación 15 usa ese mismo nombre para entrada de voz
dictada, que exigiría micrófono. Hoy no cruza nada porque un `medio` es un asset
de R2 con `bytes`, no una captura — pero es un valor de enum sin dueño, y así es
como una lectura equivocada entra sin que nadie la note. Se documenta o se
renombra.

**La aritmética del audio.** El plan presupuesta «400 ítems × ~9 KB ≈ 3.6 MB por
locale — cabe, pero apenas» (`docs/planes/esquema-item.md:139`) contando **un solo
audio por ítem**, el de la consigna. Pero D-015 dice «en kinder **la voz es la
interfaz**: el niño no lee, Larry habla», y exige que la explicación del error sea
pregenerada y offline. Con las 2-3 causas por ítem que el esquema exige
(`errores` con `minItems: 1`, tres en `de-DE`), el inventario sube a **~1,200-1,600
pistas por locale, ~4× la cifra del plan**, y revienta los ~5 MB del plan maestro
§11 en vez de caber apenas. Además `medios[].rol` no tiene rol para ese audio, así
que hoy ni siquiera es declarable, y el auditor no lo puede pesar. **La pregunta
4 de §2 está planteada sobre una cifra que subestima el problema por cuatro.**

---

## 2. Las preguntas al dueño, deduplicadas y ordenadas por cuánto cambian el trabajo

De las ~28 preguntas de los cuatro planes quedan 19. Se eliminaron dos por §0.3
(F5b/D-018, y medición de campo), y se fusionaron los duplicados de nombres de
tabla. **Tres son nuevas y no las hizo ningún plan** (marcadas ⊕).

### Las que cambian el tamaño del trabajo

**1. ¿En cuántos locales se publica el corpus de las 47 investigaciones?**
Es el mayor multiplicador de trabajo de todo el proyecto: 47 páginas contra 329.
Y publicar en 2 no es «lo mismo pero menos»: `Base.astro:75` cablea los 7 locales
en el `hreflang`, así que apuntaría a 404s. *(sitio §S1)*

**2. ¿El modo maestro (F9) sigue en el MVP?**
D-009 dice que sí y que eso «sube el consentimiento parental verificable y la
verificación de identidad del maestro a la **ruta crítica**». D-034 enmendó el
alcance del MVP y no tocó este punto. La tensión **T-5 sigue listada como
Abierta** en `decisions.md`, y `master-plan.md` §14.1 dice, primero de la lista,
«**No resuelve la verificación del maestro.**» En el tablero, T-5 es Ruta crítica
**Sí** y F9 —la fase que la consume— es Ruta crítica **No**. Si la respuesta es
sí, entra a la ruta crítica un problema que el plan declara sin resolver.
*(tablero P-3)*

**3. El audio de kinder: ¿por ítem, por modelo, o descarga progresiva?**
Ver §1 paso 7: no son ~400 pistas por locale, son ~1,200-1,600. Decide si kinder
es instalable offline. *(esquema Q4, con la aritmética corregida)*

**4. ¿Se enruta a las familias de UE y Reino Unido a una base de datos europea
desde el día uno?** Retrofitear una región de datos cuando ya hay familias es lo
más caro de esta lista. *(f2 Q5)*

**5. ¿Passkey, contraseña, o las dos?**
Decide toda la superficie de autenticación de F2. Y hay una deuda de disciplina
adjunta: `0001_identity.sql:6` ya cita **D-035** para justificar «passkey
primero», y D-035 es «Workers AI como proveedor de inferencia». No existe ninguna
decisión sobre passkeys en `decisions.md`. Se corrige la cita, o se crea la
decisión — pero no se deja como está. *(f2 Q1)*

### Las de exposición, que no son técnicas

**6. ¿Qué significa exactamente «código abierto» aquí?**
```
$ gh repo view kilowatto/math-challenge --json visibility,licenseInfo
{"licenseInfo":null,"visibility":"PUBLIC"}
$ ls LICENSE
ls: LICENSE: No such file or directory
$ grep -n 'Todos los derechos' README.md
111:Privado. Todos los derechos reservados. · Private. All rights reserved.
```
Y D-023 dice que el repositorio es **privado**. Cuatro afirmaciones incompatibles.
Un repo público sin licencia no es código abierto, y el visitante que siga el
enlace ve la contradicción en el primer scroll. **No se escribe «código abierto»
en el sitio hasta que exista LICENSE y D-023 se enmiende.** *(sitio Q2)*

**7. ⊕ `mc-37` describe las tripas de un repositorio privado de Ignia. ¿Se
publica?** `mc-37` publica con `archivo:línea` el encadenamiento de modelos, la
estructura del prompt de sistema, la lista de «never», el protocolo de tool
calling, el esquema de la tabla de auditoría en D1 y el ADR interno de
`kilowatto/iob` — que D-023 confirma que es otro producto y otro repositorio. S1
convierte esos documentos en páginas indexables **y activamente optimizadas para
ser citadas**, y la propuesta de licenciar `docs/` bajo CC BY 4.0 licenciaría para
reuso la descripción de un repo privado. Es del mismo tipo que la pregunta 6, y
ningún plan la subió. *(revisión del sitio)*

**8. ⊕ `birth_month` contra D-013.** D-013 dice, con esas palabras, «no se pide …
ni fecha exacta de nacimiento — **solo año o rango de edad**». Pero
`migrations/0002_child_profiles.sql:28` ya trae
`birth_month INTEGER NOT NULL CHECK (birth_month BETWEEN 1 AND 12)`, y su
comentario cita D-013 como si la cumpliera. Mes no es «solo año». Tiene respaldo
real en la investigación (`mc-25` impl. 3 y `mc-27` impl. 9 piden año+mes o banda
de edad), así que el problema **no es de privacidad, es de disciplina**:
`CLAUDE.md` manda implementar la decisión o pedirle al dueño que la cambie. Y hay
que decidirlo **antes de que haya datos**. *(revisión de f2)*

### Las que deciden una firma o un nombre que después no se cambia

**9. ¿Cómo se nombran los grupos infantiles en el esquema?**
D-027 dice `grupo_infantil` y `club_adulto`; `master-plan.md` §3.3 y el tablero
dicen `classroom` y `classroom_membership`; `CLAUDE.md` dice que los nombres van
en inglés. F2 nombra el tipo en la firma del gate, así que se decide en F2 aunque
la tabla nazca en F9. Incluye si la tabla de identidad se llama
`teacher_verification` (como dice un comentario de `0001`) o
`group_owner_identity` (que es lo que de verdad hace: el producto no verifica
nada). *(f2 Q6+Q7)*

**10. ¿Con qué proveedor se verifica el teléfono, o se difiere a F9?**
D-027 exige «correo y teléfono verificados» para abrir un grupo infantil, y
Cloudflare no ofrece SMS — sería el primer tercero del producto. Depende de la
pregunta 2. *(f2 Q4)*

**11. ¿Se publica `decisions.md` en el sitio, incluidas las decisiones revertidas
y las enmiendas?** D-001→D-023, D-009→D-034, D-010→D-024, D-004/D-015/D-029/
D-032→D-035. *(sitio Q4)*

**12. ¿Quién firma las 47 investigaciones como autor?** El README dice que las
hicieron «agentes independientes». En un sitio cuyo argumento es el rigor, la
autoría no es un detalle de pie de página. *(sitio Q3)*

### Las de contenido, que cambian lo que los siete autores producen

**13. La franja adulta: ¿compone con recetas declaradas —una regla diseñada una
vez, con qué varía, qué se mantiene y por qué— o «sin curaduría por serie»
significa literalmente sin ninguna intención de serie declarada?**
Ya **no** es una contradicción entre decisiones (§0.3): D-034 manda sin oposición.
Es una pregunta de diseño mucho más chica de lo que el plan la presentó, pero
todavía real, porque una receta declara intención pedagógica por serie.
*(esquema Q1, degradada)*

**14. `MATH_CONVENTIONS` no coincide con CLDR en dos locales.** En `pt-PT` CLDR
agrupa millares con espacio duro (U+00A0) y la tabla dice punto; en `fr-FR` CLDR
usa espacio fino (U+202F) y la tabla usa espacio normal. Reproducido hoy:
`node docs/planes/esquema-item-demo.mjs` → `≠ pt-PT tabla: 12.345,6 CLDR:
12U+A0345,6`. ¿Quién manda? *(esquema Q2)*

**15. El formato «¿cuál sobra?» (`mc-36` §5): ¿entra a kinder con varias
respuestas aceptables, cada una con su razón autorada por un adulto y todas
puntuando igual, o se recorta a una sola correcta?** *(esquema Q3)*

**16. ¿Las cinco marcas contextuales de D-026 se autoran por idioma o se
traducen?** *(f2 Q8)*

### Las chicas, que se pueden contestar en una línea cada una

**17. ¿Los segmentos de las URLs se traducen por locale?** *(sitio Q5)*

**18. ¿Se hacen imágenes de vista previa social (`og:image`)?** Hoy no hay
ninguna: cada vez que alguien comparta una investigación sale una tarjeta gris. Y
si se hacen, es la **segunda excepción** a la regla de `CLAUDE.md` de AVIF con
respaldo WebP, porque los rastreadores sociales exigen PNG/JPEG en la práctica.
*(sitio Q6)*

**19. Cuando un auditor de la flota devuelve un veredicto limpio, ¿qué debe hacer
el corredor?** Hoy lo publica como issue y como alerta SARIF: `#1`–`#4` son eso, y
4 de las 25 alertas son notas de conformidad. *(tablero P-4)*

**Diferidas, no bloquean nada hoy:** el default del tablero global para un hijo
recién creado; si el padre necesita PIN para salir del modo niño; cuántas
respuestas promueven un ítem de `piloto` a `activo`; y si `dificultad_experta` la
fija un calibrador o cada autor nativo. Se preguntan cuando F4 y F7 estén cerca.

---

## 3. Qué está bloqueado, y por qué

| Bloqueado | Por qué | Se desbloquea con |
|---|---|---|
| **S1 · el corpus** | Pregunta 1. Además dos bloqueos técnicos medidos: `Base.astro:75` cablea los 7 locales en el `hreflang`, y los artículos revientan el presupuesto de 12 KB gz por página (el mayor documento son 15.7 KB gz solo en Markdown crudo) | Respuesta a la pregunta 1 + presupuesto partido por clase de página |
| **La frase «código abierto» en el sitio** | Preguntas 6 y 7. No es una redacción: es una licencia que no existe y una decisión (D-023) que dice lo contrario | LICENSE + enmienda a D-023 |
| **F9 y la verificación del maestro** | Pregunta 2, y **T-5 sigue listada como Abierta en `decisions.md`**. `master-plan.md` §14.1 dice que el plan no la resuelve | Decisión del dueño sobre si F9 entra al MVP |
| **El criterio de F1 «25 alertas en code scanning»** | La rama no tiene PR. Contra `main` la API devuelve `[]` | Paso 1 |
| **`cwv-budget`, o sea toda la medición de campo de D-030 y D-037** | ⊕ No es una decisión, es un permiso: `node audits/cwv-budget.mjs` → *«inactivo: el token no tiene Account → Account Analytics → Read»*. Ningún plan lo nombró | Ampliar el token de API en el dashboard |
| **El criterio de F2 «cada `classroom_membership` guarda quién aprobó»** | `master-plan.md` §13.2 pone los grupos infantiles en **F9**, y `0001_identity.sql:14` dice que van «en sus propias migraciones, en sus propias fases». F2 no puede cerrarlo | Corregir el criterio en el tablero: F2 cierra `group_owner_identity` y el gate, no la membresía |
| **El cuerpo de F5b en el tablero** | Dice «son incompatibles, resolver antes de construir». **No lo está** (§0.3). Está bloqueando F5b contra un fantasma | Corregir el cuerpo citando el alcance de kinder de D-018 |
| **La franja adulta contra la Sabana** | El esquema deja validar `SERIO + HISTORIA + lugar sabana`. No es una decisión pendiente: es un candado que falta | §1 paso 7, candado 1 |
| **`docs/master-plan.md` §13.2 fila F1 dice «⚠️ No cerrada»** y el tablero dice cerrada | Contradicción entre dos documentos de gobierno | Resolver en una dirección, no dejar las dos |

---

## 4. Qué se descartó por cruzar una línea roja

**Ninguno de los cuatro planes propone cruzar una de las ocho.** Las cuatro
revisiones adversariales lo confirmaron por separado. Lo que sigue son cosas que
la investigación o el diseño sugerían y que se descartaron **a propósito**, con
dónde quedó escrito el descarte:

| Se descartó | Lo pedía | Línea roja |
|---|---|---|
| Calificar «¿cuál sobra?» sobre la justificación **escrita** del alumno | `mc-36` §5 | **#3 — ningún niño escribe texto libre.** Con niños de 4-6 no es difícil, es imposible. En el esquema las razones las autora un adulto, el niño solo toca, y el campo de justificación **no existe** con `additionalProperties: false`, así que no se puede añadir por descuido |
| Beacon de Core Web Vitals de campo en pantallas de niño | La física de la medición: sin beacon no hay dato de campo | **#2 — el niño nunca es un usuario.** D-037 lo descarta de frente y acepta el hueco: nunca habrá datos de campo justo donde está el mercado objetivo. Se compensa con laboratorio estrangulado, siempre etiquetado como laboratorio |
| Inyección de Cloudflare Web Analytics a nivel de zona | Es la forma más barata de activarlo | **#2.** Pondría el beacon en todas las páginas sin pasar por el código, incluidas las de niños. D-037: se activa por código, página por página, o no se activa. `audits/telemetria-infantil.mjs` lo hace cumplir |
| Entrada de voz dictada para respuestas numéricas | `mc-34` impl. 15 | **#1 — nunca micrófono.** No se propuso; el riesgo es que el valor `audio_respuesta` del enum, sin descripción, invite esa lectura. Ver candado 4 |
| Que el tope de perfiles de D-021 detenga la práctica antes de que exista Stripe (F8) | El tope de 1 perfil gratis | **#4 — nunca se cobra por dejar practicar.** El tope se lee de `CONFIG_KV` y queda en 6 hasta F8, y **nunca detiene un perfil que ya existe**. El precio se muestra ANTES del formulario, no después |
| `<input type="date">` para el nacimiento del niño | Es el control obvio | **#2** y D-013. Prohibido por auditor. (Que el mes se pida o no es la pregunta 8, y esa sí es una pregunta) |
| Guardar el tablero de 9 imágenes del PIN como JSON en tabla de niño | Es lo simple | **#2/#3.** Se deriva con HKDF en vez de guardarse, para no meter una columna JSON en una tabla de niño |

**Descartado contra la investigación, pero no por una línea roja:** el
drag-and-drop del marco de diez que propone `mc-06` implicación 4. `master-plan`
§9 fija los cinco formatos como táctiles porque a los 4-6 años arrastrar es
medible­mente más lento y más propenso a error que tocar. Manda §9, y queda
escrito que se eligió contra esa implicación a propósito.

**Casi-cruce bien resuelto, para que nadie lo reabra:** `flash_ms` en el formato
de subitizar mide el **estímulo**, no al niño. No puntúa, no se muestra, no corre
hacia atrás, está acotado a 200-2000 ms y no existe en ningún otro formato. No es
un cronómetro y D-024 no lo alcanza.

---

## 5. Lo que NO se verificó en todo este ejercicio

Esta lista es la unión de lo que los cuatro planes y las cuatro revisiones
declararon, más lo mío. **No se encogió al sintetizar.**

### Lo que nadie ha ejecutado nunca

1. **Nada contra D1.** La migración `0003` no se aplicó ni en local. El trigger
   `BEFORE INSERT` con `RAISE(ABORT)`, el `CHECK` en `ALTER TABLE` y el índice
   único parcial se probaron contra `sqlite3 3.51.0` local, **no contra D1**.
   Igual la `0003_content.sql` del esquema de ítem: que el SQL sea sintácticamente
   válido para SQLite no está comprobado.
2. **La flota adversarial completa.** `node audits/adversarial.mjs` cuesta dinero
   y ninguno de los cinco encargos lo pidió. Solo `pwa-ios` se ha ejercido de
   punta a punta.
3. **LCP / CLS / INP de campo.** El auditor existe y está **inactivo por
   permisos** (§3). Hoy nadie mide lo que D-030 y D-037 exigen medir. Tampoco la
   instalación manual en iOS, que el propio `pwa-installable.mjs` declara
   «pendiente de dispositivo real» — y ese auditor **no lo corre nadie**:
   `grep -c pwa-installable audits/run.mjs audits/live.mjs` → `0` y `0`, con el
   archivo presente.
4. **El costo de CPU de PBKDF2 dentro de un Worker.** Fijar el número de
   iteraciones sin medirlo es exactamente la aserción en tono seguro que
   `CLAUDE.md` prohíbe.
5. **`Sec-CH-UA-Platform` y `Critical-CH` en el borde de Cloudflare.** Toda la
   estrategia de adaptar la plataforma en el servidor —para no violar la
   prohibición de D-036 de detectarla en JavaScript— descansa en que ese client
   hint llegue al Worker. Se comprueba con `curl -I` en el primer despliegue de
   F2.
6. **Que el `glob()` loader de Astro 5.13 lea contenido fuera de la raíz de
   `apps/web`.** Todo S1 descansa en ese supuesto. Es el primer spike de S1.
7. **`timezone` del cliente.** Se declara «del hint del navegador», y **no existe
   ningún encabezado estándar de zona horaria que un navegador mande solo**. Si
   solo sale de `Intl.DateTimeFormat().resolvedOptions().timeZone`, hace falta un
   campo oculto poblado por JS. Sin huso no se puede calcular el corte nocturno de
   D-016 ni el día de la racha.
8. **Ningún auditor nuevo se ha visto fallar** para los arreglos propuestos.
   `CLAUDE.md` regla 3 exige que cada prueba de regresión se haya visto fallar sin
   el arreglo, con la evidencia pegada en el PR.

### Lo que se midió pero no es reproducible por otra persona

9. **Las cifras de cierre de F1** («23 auditores, 0 errores, ~$1.29, ~15 min»,
   «3 bloquean · 22 reportan», «0 bloquean, 3 anuladas») **no se pueden
   reproducir desde un clon**: `audits/adversarial/informes/` está en
   `.gitignore` y `git ls-files audits/adversarial/informes` sale vacío. Lo único
   permanente y público son los 22 issues y las alertas de code scanning.
10. **Todas las mediciones del sitio salen de `apps/web/dist` como está en el
    árbol**, de un `pnpm build` local, **no de producción**. No verifiqué que
    `dist` coincida con lo desplegado.
11. **No sé si los 22 issues se cerraron a mano o con script, ni con qué
    criterio.** La API da `stateReason`, no quién ni por qué.
12. **Consulté code scanning por API; nadie abrió la pestaña Security en el
    navegador.**

### Lo que la investigación misma marca como no confirmado

13. **Nada de la posición legal está verificado.** D-013 ya dice que debe
    revisarse con abogado antes de lanzar, y `mc-25` marca varias afirmaciones
    como `[unverified]` porque `ftc.gov` e `ico.org.uk` bloquean fetch
    automatizado. Esta síntesis hereda esa incertidumbre entera; no la reduce.
14. **La inversión decena-unidad del alemán**, que es el error que justifica todo
    el mecanismo `por_locale` del esquema, está `[unverified]` en `mc-34` §7. Un
    autor alemán tiene que confirmar que 71 es el error real de un niño de cinco
    años.
15. **Las cifras de `mc-48`** (2.3× de probabilidad de cita, 40-70% de pérdida de
    tráfico, el estudio Wellows) siguen sin confirmar contra fuente primaria — el
    propio documento lo dice. **No deben aparecer en el sitio público ni
    justificar presupuesto.**
16. **Los requisitos vigentes de Google** para el resultado enriquecido de
    `Course` y el estado del de `FAQPage`. `mc-48` advierte que ninguna de sus
    fuentes es primaria de Google.
17. **El peso del audio (~9 KB por consigna)** es una suposición etiquetada: no
    existe todavía un opus real de Larry que medir. Y el conteo de pistas del §1
    paso 7 corrige el multiplicador, no el tamaño unitario.
18. **Las siete frases del ejemplo del esquema no están revisadas por hablantes
    nativos** y no cuentan como contenido autorado.
19. **Los límites vigentes de Cloudflare Workers Static Assets** (número de
    archivos, tamaño por archivo) frente a las ~380 páginas de la opción de 7
    locales.
20. **El peso real en HTML de un artículo de S1.** Se midió el Markdown crudo
    comprimido (15.7 KB gz el mayor, 9.6 KB gz la mediana); el HTML renderizado
    pesa más. Los 30 KB gz propuestos son una calibración, no un dato.
21. **Nadie leyó las 47 investigaciones completas.** Entre los cinco encargos se
    leyeron íntegras `mc-06`, `mc-25`, `mc-27`, `mc-34`, `mc-36`, `mc-40`,
    `mc-45`, `mc-48` y partes de `mc-32` y `mc-37`. De `mc-20/21/22/23/38/43` solo
    lo que ya está destilado en `guia-de-estilo.md` y `tokens.css`. Si alguna de
    esas seis tiene una restricción de interfaz que no llegó a la guía de estilo,
    esta síntesis no la conoce.

### Advertencia de concurrencia, que es más fuerte que la que levantó cada plano

22. **El árbol se movió durante los cinco encargos y sigue sucio: 25 archivos.**
    Aparecieron durante las sesiones D-037, `audits/telemetria-infantil.mjs`,
    `apps/web/src/pages/api/rum.ts` y **los ocho auditores de §0.2**. Nada de eso
    lo escribieron los cuatro planes. **Los cuatro planes se escribieron contra
    árboles distintos entre sí**, así que cualquier afirmación suya con
    `archivo:línea` hay que releerla contra el árbol antes de trabajarla, o fijar
    el comando a un SHA con `git show <sha>:archivo`. Ya hay ejemplos concretos de
    referencias `archivo:línea` de los planes que no apuntan a lo que dicen.

### Qué se tocó en el repo al escribir esto

**Nada permanente.** Se leyeron archivos, se corrieron auditores en solo lectura
y se validaron documentos contra el esquema con `ajv`. **No se commiteó, no se
hizo push, no se abrió ni cerró ningún issue, no se tocó el tablero, no se tocó
`migrations/`.** El único archivo escrito es este, bajo `docs/planes/`.
