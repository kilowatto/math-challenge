# Auditoría del tablero contra la realidad del repo — 2026-07-31

> Encargo: comparar los 18 elementos de https://github.com/users/kilowatto/projects/1
> contra lo que de verdad hay en `kilowatto/math-challenge`.
>
> **Nada de esto se aplicó.** Ni al tablero, ni a los issues, ni a git. Cada
> acción trae el comando exacto que la aplica y el comando que la comprueba.

---

## 0. El hallazgo que cambia la lectura de todo lo demás

**`main` tiene 2 commits. El producto entero vive en una rama sin PR.**

```
$ git log main --oneline -5
5426284 docs: replace AGENTS.md with CLAUDE.md, drop multi-agent coordination
9c5a8bf docs: bootstrap Math Challenge — 43 research docs, 23 decisions, plan

$ git rev-list --left-right --count main...feat/adversarial-fleet
0	18

$ gh pr list --state all --json number
[]
```

Los 18 commits de `feat/adversarial-fleet` contienen **todo**: F0, F1, el sitio en
siete locales, D-034, D-035, D-036, las 4 investigaciones nuevas (mc-45 a mc-48) y
las 7 auditorías deterministas. En la rama por defecto no existe ninguna.

No es una violación de CLAUDE.md — «nunca push directo a `main`» se respetó al pie
de la letra. Es que el PR nunca se abrió. Consecuencias medibles hoy:

| Afirmación del tablero | En `feat/adversarial-fleet` | En `main` |
|---|---|---|
| F1: «25 alertas en code scanning» | 25 (`?ref=refs/heads/feat/adversarial-fleet`) | **0** |
| S1: «47 investigaciones» | 47 | 43 |
| F0/F1 revisadas por una persona | no | no |
| Despliegue automático al mergear (CLAUDE.md) | se desplegó a mano | nunca corrió |

El sitio **sí** está en producción y **sí** pasa sus 21 comprobaciones
(`node audits/live.mjs`), así que se desplegó desde la rama. Eso hace que el
tablero, la rama y producción coincidan entre sí, y que `main` sea el único que
no se enteró.

---

## 1. Criterios marcados como HECHOS que no lo están

Esto es lo que el encargo pone por encima de todo lo demás.

### 1.1 F1 · «SARIF real subido y procesado: 25 alertas en code scanning» — `[x]`

```
$ gh api /repos/kilowatto/math-challenge/code-scanning/alerts
[]
$ gh api "/repos/kilowatto/math-challenge/code-scanning/alerts?state=closed" -q length
0
$ gh api /repos/kilowatto/math-challenge/code-scanning/analyses \
    -q '.[] | [.created_at,.commit_sha[0:7],.results_count,.ref] | @tsv'
2026-07-31T23:46:56Z	b3262df	25	refs/heads/feat/adversarial-fleet
```

La subida ocurrió y se procesó: hay un análisis con 25 resultados. Pero las
alertas solo son consultables pasando el `ref` de la rama. En el repositorio —el
que ve cualquiera que abra la pestaña Security— hay **cero**. La afirmación es
verdadera sobre una rama y falsa sobre el repo. Se arregla sola al mergear
(acción A-01); mientras tanto el criterio no puede llevar `[x]` sin decir dónde.

### 1.2 F1 · «Segundo filtro determinista de evidencia» — `[x]`, y su punto ciego no está escrito

El filtro existe (`audits/adversarial/evidencia.mjs`) y sus 61 comprobaciones
corren (`node audits/adversarial/prueba.mjs` → `✓ 61 comprobaciones`). Pero en la
corrida de cierre **5 de los 6 hallazgos de `red-lenta` llevan el resumen de otro
hallazgo**. El resumen es el título del issue y el `message` del SARIF, así que el
defecto es exactamente lo que un humano lee primero:

```
$ gh issue view 13 --json title,body -q '.title, (.body|split("\n")[3:8]|join("\n"))'
```

| Issue | Título dice | Cuerpo (`Archivo` / `Evidencia` / `Arreglo`) habla de |
|---|---|---|
| #12 | límite de chunk a 150 KB | `sw.js`, el bloque `install`, ampliar `PRECACHE` |
| #13 | registro del SW tras `load` | `astro.config.mjs`, `chunkSizeWarningLimit`, bajar el bundle |
| #14 | no se aprovecha HTTP/3 | imágenes, `loading="lazy"`, `fetchpriority` |
| #15 | `imageService: "compile"` | D-030, habilitar HTTP/3 |
| #16 | i18n cargado dinámicamente | registro del SW, `requestIdleCallback` |

`archivo`, `evidencia` y `arreglo` son coherentes entre sí en cada hallazgo; el
único campo desalineado es `resumen`. Por eso `evidencia.mjs` no lo cazó: la
evidencia **sí** aparece en el archivo citado. Lo que nadie comprueba es que el
resumen hable del mismo hallazgo que la evidencia.

Esto importa más allá de la estética: **#16 afirma que los JSON de i18n se cargan
dinámicamente, y es falso** — `apps/web/src/i18n/index.ts` los importa
estáticamente, uno por uno, en las líneas 10-16. Y **#14 afirma que no hay HTTP/3,
cuando `audits/live.mjs` lo verifica en vivo** (`alt-svc: h3=":443"` y 0-RTT con
max early data 14336). Se cerraron los cinco como `NOT_PLANNED` leyendo títulos
que no correspondían a sus cuerpos.

La sección «Lo que la flota NO puede hacer, medido» del cuerpo de F1 nombra la
paráfrasis sin cita. No nombra esto, que es un modo de falla distinto y sí tiene
arreglo determinista.

### 1.3 F1 · «Los 22 hallazgos de seguimiento están en Issues» — 4 no son hallazgos

Los issues #1 a #4 (`anti-trampa`) reportan cumplimiento, no violación:

```
$ gh issue view 1 --json body -q '.body' | sed -n '/Arreglo/,+1p'
## Arreglo propuesto
No se detecta ninguna violación. El campo `responseTimeMs` está claramente...
```

Los cuatro dicen lo mismo: «No se detecta ninguna violación», «Cumple LR-1 y
D-010», «La migración no crea columnas… ». Un veredicto limpio se publicó como
issue **y** como alerta SARIF. De las 25 alertas, 4 son notas de conformidad.

### 1.4 F1 · la evidencia de cierre no está en el repo

```
$ git ls-files audits/adversarial/informes
(vacío)
$ grep -n "informes" .gitignore
audits/adversarial/informes/
```

`ultimo.json`, `ultimo.md` y `ultimo.sarif` están ignorados a propósito
(«evidencia de una corrida, no fuente»). La decisión es razonable, pero tiene una
consecuencia que no está dicha: **desde un clon limpio no se puede re-ejecutar
ninguna de las cifras de cierre de F1** — ni «23 auditores, 0 errores, ~$1.29»,
ni «3 bloquean · 22 reportan · 2 descartados», ni «0 bloquean, 3 anuladas». La
copia local de `ultimo.json` que sí existe en esta máquina dice
`anulados: 0` y tres hallazgos con `bloquea: true`, porque es anterior a las
anulaciones. Lo único permanente y público son los 22 issues y el análisis de
code scanning.

### 1.5 F0 · residuos que su cierre no nombró

CLAUDE.md exige decir lo que un cambio **no** hizo. F0 se cerró sin nombrar tres
cosas comprobables:

```
$ ls audits/pwa-installable.mjs && grep -c "pwa-installable" audits/run.mjs audits/live.mjs
audits/pwa-installable.mjs
audits/run.mjs:0
audits/live.mjs:0
```

- `audits/pwa-installable.mjs` **existe, pasa y no lo corre nadie**: no está en
  `ACTIVE` ni en `PENDING` de `run.mjs`, ni en `live.mjs`, ni en el gancho. Es un
  auditor huérfano. Y hace peticiones a `https://math.kilowatto.com`, así que su
  lugar es `live.mjs`, no el gancho.
- `package.json` declara `audit:i18n` → `audits/i18n-complete.mjs` y
  `audit:migrations` → `audits/migrations.mjs`. **Ninguno de los dos archivos
  existe** (`node audits/i18n-complete.mjs` → `Cannot find module`). Dos scripts
  que fallan si alguien los corre.
- D-032 enumera 16 deterministas en su cuerpo y 15 en su nota de F0;
  `node audits/run.mjs` imprime `30 construidos · 8 esperando fase · 38 planeados`
  con 7 activos. El que sobra en la cuenta de 16 es justamente `pwa-installable`.

Nada de esto invalida el cierre de F0 —sus 21 comprobaciones en vivo pasan hoy—
pero son residuos que el tablero debería llevar escritos.

---

## 2. Criterios marcados como PENDIENTES que ya están hechos

### 2.1 S0 · «Cero peticiones a terceros» — ya está, verificado en vivo

```
$ node audits/live.mjs | grep terceros
    · cero peticiones a terceros
```

Lo cerró F0 al auto-hospedar Raleway (commit `99f005d`). El criterio se puede
marcar `[x]` hoy.

### 2.2 S0 · el estado «Todo» ya no describe la realidad

Lo que S0 promete «que quede funcionando» ya está desplegado, porque F0 lo
construyó de paso: siete rutas de locale respondiendo 200, `hreflang` recíproco
con auto-referencia, `x-default`, y JSON-LD por página emitido desde las mismas
variables que renderiza el `<body>` (`apps/web/src/layouts/Base.astro:29-60`).

Lo que falta de S0 es real y son tres cosas, ninguna de ellas «el esqueleto»:

1. Los dos auditores que el criterio nombra **no existen**: `run.mjs` lista
   `jsonld-valid` y `hreflang-recip` en `PENDING`, y no hay archivo.
   La sustancia está verificada en vivo; lo que falta es el auditor que la
   bloquee en el gancho, que es lo que §13.1 del plan maestro pide.
2. **No hay enlace a GitHub en ninguna página** (`grep -rn github apps/web/src`
   → sin resultados), y el criterio lo pide en cada página.
3. **No hay medición de campo de LCP/CLS/INP.** `cwv-budget` está en `PENDING` y
   el sitio no carga ningún beacon (ver conflicto C-2).

Además, un riesgo que el criterio de S0 no cubre y mc-48 sí exige: el JSON-LD
lleva `description` (`Base.astro:47`), y esa cadena **no aparece en el `<body>`**
— solo en `<meta name="description">`. Si `jsonld-valid.mjs` compara contra el
`<head>`, va a dar verde sobre justo lo que mc-48 advierte que hace que Google
ignore el marcado completo.

### 2.3 Lo que revisé y NO estaba secretamente hecho

F3 («`recordAttempt()` implementado — hoy lanza a propósito»):
`apps/ingest/src/index.ts:68-70` sigue lanzando. F3, F4, F7, F8, F11: ningún
criterio se puede marcar. F5, F5b: no existe `docs/planes/esquema-item.schema.json`
en `main` ni banco de ítems. Correcto que sigan en Todo.

---

## 3. Campos del tablero que no corresponden

| Elemento | Campo | Hoy | Debería | Fuente |
|---|---|---|---|---|
| S0 | Status | Todo | In Progress | §2.2 |
| F5b | Depende de | `F5` | `esquema de ítem (§9)` | master-plan §13.2: «esquema de ítem (§9) · **en paralelo con F5**» |
| F10 | Depende de | `F5b, F7` | `F2, F7, F5b` | master-plan §13.2 |
| T-6 | Decisiones | `D-034` | `D-034, D-035` | el propio cuerpo de T-6 |
| F6 | (cuerpo) | `D-004, D-015, D-029, D-035` | `D-004, D-015, D-035` | D-029 es moderación de prendas → F10 |
| F9 | Ruta crítica | `No` | ver C-3 | D-009 |
| F2 | Riesgo | Medio | Alto (a decidir) | 6 hallazgos heredados + D-031 «aproximadamente el doble» |

El de F5b es el que cuesta dinero: el tablero serializa detrás de la ruta crítica
algo que el plan pone en paralelo con ella.

---

## 4. Diez issues que no aterrizan en ningún elemento del tablero

F2 recoge #17-#22 (`ux-banda`) y F3 recoge #5-#10 (`pedagogia`). Los otros diez no
los menciona nadie:

- **#1-#4 (`anti-trampa`)** — no son hallazgos (§1.3). Se pueden dar por muertos,
  pero por escrito.
- **#11 (`red-lenta`)** — cerrado `COMPLETED`, y de verdad: `sw.js:41-47` ya
  precachea las dos fuentes Raleway.
- **#12, #13, #15, #16 (`red-lenta`)** — cerrados `NOT_PLANNED` con el título
  cruzado (§1.2). Hay que releerlos por su cuerpo, no por su título, y decidir si
  caen en S0 (rendimiento del sitio) o en F11 (cierre). Al menos uno,
  `imageService: "compile"`, toca una decisión viva (AVIF/WebP de D-030) y hoy
  sigue tal cual en `apps/web/astro.config.mjs:14`.
- **#14** — falso: HTTP/3 y 0-RTT están verificados en vivo.

---

## 5. Documentación que contradice al tablero o a una decisión

| # | Dónde | Qué dice | Qué es cierto |
|---|---|---|---|
| 1 | `docs/master-plan.md` §13.2, fila F1 | «⚠️ **No cerrada:** falta correr los 23 completos —solo `pwa-ios` se ha ejercido— y ejercer una anulación de punta a punta» | El tablero dice CERRADA, y la evidencia lo respalda: `ultimo.json` registra 23 auditores y `ANULACIONES.md` tiene 2 vigentes + 1 retirada |
| 2 | `docs/infrastructure.md:49,68` | `math-challenge-tutor` «calls Claude via AI Gateway»; `math-challenge-tutor-gateway` «model routing for Claude calls», binding vía `ANTHROPIC_BASE_URL` | D-035: «No queda ningún camino a la API de Claude — ni en la flota, ni en la banda Pro de Larry, ni como escalada de moderación» |
| 3 | `CLAUDE.md` | «índice de 43 investigaciones» | 47 (`ls docs/research/*.md \| wc -l` → 48 con README). D-033 dice 45. El tablero (S1) es el único que dice 47 |
| 4 | `audits/README.md` y cuerpo de F1 | «un hallazgo que cite `D-036` cuando las decisiones llegan a D-034 se descarta» / «Atrapó `D-036`, que yo inventé» | D-035 y D-036 existen desde `4e676c1`. El ejemplo ya no reproduce; el mecanismo sí sigue vivo porque `citas.mjs` lee el archivo real |

---

## 6. Conflictos

**C-1 · D-018 y CLAUDE.md contra D-034, en el cuerpo de F5b.**
D-018 y CLAUDE.md: «la unidad de diseño es la serie, no la pregunta suelta».
D-034, barandal explícito: «**Sin retos curados en serie.** Los 2,500 retos
curados son de kinder; la franja adulta compone retos del banco sin curaduría
pedagógica por serie». D-034 es posterior y del dueño, así que de facto ya decidió
— pero **no enmienda a D-018 por escrito ni a CLAUDE.md**, y el cuerpo de F5b
sigue tratándolo como pregunta abierta. Por CLAUDE.md, una decisión en
`decisions.md` no se vuelve a discutir; aquí hay dos, y se contradicen. Pregunta
P-1.

**C-2 · D-030 contra el criterio de cero terceros de S0.**
D-030 exige «medición con datos de campo desde el día uno, no con Lighthouse».
S0 exige cero peticiones a terceros, y F0 ya lo cerró así. Hoy no hay ningún
beacon en el sitio, y `math-challenge-web-analytics` está en `infrastructure.md`
como recurso previsto: activarlo carga `static.cloudflareinsights.com`, que es un
tercero. No se puede cerrar S0 con los dos criterios como están escritos.
Pregunta P-2.

**C-3 · D-009 contra el campo «Ruta crítica» de F9.**
D-009: «el modo maestro entra desde el MVP, lo que sube el consentimiento parental
verificable y **la verificación de identidad del maestro a la ruta crítica**».
En el tablero, T-5 (verificación del adulto) es Ruta crítica **Sí**, y F9 —la fase
que la consume, y que T-5 bloquea— es Ruta crítica **No** y Riesgo **Bloqueada**.
D-034 enmendó el alcance del MVP y no tocó el modo maestro. Pregunta P-3.

**Ninguna línea roja se cruza.** Revisé los 18 elementos contra las ocho: ningún
criterio del tablero pide cámara, micrófono, biometría, navegador bloqueado,
texto libre de niño, cobro por practicar, moneda comprable, romper racha por
límite de pantalla, que Larry calcule, ni penalizar borrado. Los criterios que las
mencionan las hacen cumplir, no las cruzan.

---

## 7. Lo que NO pude verificar

- **La UI en un dispositivo real.** LCP/CLS/INP en Android de gama baja sobre 4G
  lento (criterio 4 de S0) no se mide desde una terminal, y no existe ni el
  auditor `cwv-budget` ni datos de campo. Tampoco la instalación manual en iOS,
  que `pwa-installable.mjs` declara explícitamente como no verificable.
- **Que la corrida de cierre de F1 costara ~$1.29 en ~15 min.** El informe está
  gitignored; lo leí de la copia local de esta máquina, que no es reproducible
  desde un clon.
- **El repo tiene trabajo en curso de otro proceso mientras auditaba**:
  `git status` muestra `audits/adversarial.mjs` y `scripts/detallar-proyecto.mjs`
  modificados sin commitear, y un `docs/planes/esquema-item.schema.json` nuevo que
  no escribí yo. Las corridas de `node audits/adversarial.mjs --cartas` y
  `--simular` usaron ese archivo modificado, no el commiteado.
- **Si los 22 issues se cerraron a mano o con script**, y con qué criterio. La API
  da `stateReason` pero no quién ni por qué.
- **La pestaña Security en la interfaz web.** Consulté la API; no abrí la página.
