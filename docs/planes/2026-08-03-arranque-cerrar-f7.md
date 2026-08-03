# Prompt de arranque — cerrar F7

> Cópialo entero como primer mensaje de la sesión siguiente.
> Escrito el 2026-08-03, al cerrar la sesión que integró cinco frentes de F7 y el
> primero de F8.

---

Vas a **cerrar F7 (Juego)** en el proyecto Math Challenge. Quedan **31 issues
abiertos de 69**. La sesión anterior integró cinco frentes en paralelo y dejó
todo lo que sigue documentado. **No escribas una línea de código hasta terminar
el bloque de lectura.**

---

## PARTE 1 — Lee esto, en este orden exacto, ANTES de tocar nada

### 1.1 Las reglas del proyecto (obligatorio, sin saltarse ninguno)

| Archivo | Por qué |
|---|---|
| `CLAUDE.md` | Las **ocho líneas rojas**, git, Cloudflare, contenido, imágenes. La #1 tiene una enmienda (D-075) y la #6 gobierna media F7 |
| `AGENTS.md` | **Solo la Parte 1**, «Orquestación de agentes en paralelo». Las cinco trampas que ya costaron caro, y cómo se reparte trabajo entre agentes sin que se pisen. La Parte 2 es traducción del corpus y no aplica hoy |
| `docs/master-plan.md` | El plan integral. Busca la tabla de fases |
| `docs/decisions.md` | **Enorme, no lo leas entero.** Lee por número las de §1.3 |
| `docs/dudas.md` | Las **§22 y §23** son de F7 y F8, escritas ayer. Cuatro preguntas del dueño sin responder y nueve supuestos que tomaron los agentes |
| `docs/planes/f7-juego.md` | **El diseño completo de F7.** No rediseñes: está escrito |
| `docs/planes/2026-08-02-rezagados.md` | 28 issues fuera del tablero |
| `docs/infrastructure.md` | Inventario de Cloudflare. Todo objeto lleva prefijo `math-challenge-` y **quien crea un recurso escribe su renglón en el mismo PR** |
| `docs/guia-de-estilo.md` | Paleta Ignia y tipografía. El naranja `#F36B1C` da **3.03:1 sobre blanco** y no sirve para texto normal |

### 1.2 La memoria del proyecto (17 archivos, todos)

Están en
`/Users/estebanrey/.claude/projects/-Users-estebanrey-Documents-dev-math-challenge/memory/`.
**Lee `MEMORY.md` primero** y después los dieciséis, con estos nombres exactos:

```
MEMORY.md
always-merge-and-deploy.md
decision-triad-guia-auditor-memoria.md
dist-duplicados-bloquean-el-gate.md
dos-modos-familia-y-solo.md
dudas-en-md-no-bloquean.md
fases-con-subfases.md
ignia-brand-and-image-tools.md
never-ask-permission-to-finish.md
no-ci-in-this-project.md
nunca-close-numero-en-pr.md
owner-reverses-decisions-when-shown-evidence.md
owner-wants-continuous-progress.md
prefers-interactive-questions.md
ramas-siempre-desde-origin-main.md
shared-checkout-concurrent-sessions.md
tras-login-siempre-a-la-casa-nunca-al-perfil.md
```

Cuatro que cambian cómo trabajas hoy: **`shared-checkout-concurrent-sessions.md`**
(otra sesión escribe sobre este mismo checkout — ayer metió D-082 a D-089 en
`docs/decisions.md` a mitad de una integración), **`prefers-interactive-questions.md`**,
**`owner-wants-continuous-progress.md`** y **`nunca-close-numero-en-pr.md`**.

### 1.3 Las decisiones concretas, por número

En `docs/decisions.md`, busca `## D-0NN`:

- **D-002, D-010, D-017** — bandas, puntuación, y que **el número de nivel no se enseña a nadie**
- **D-014** — la racha, y que la protección jamás se vende
- **D-016** — la tabla de minutos del límite de pantalla
- **D-018, D-024, D-025** — series, sin cronómetros, puntaje del servidor
- **D-030, D-032, D-043** — Durable Objects, la flota de auditores, un DO por entidad
- **D-040, D-053, D-056** — opt-in, solo el año de nacimiento, cupos de liga
- **D-047** — offline
- **D-070** — **ningún auditor puede ser cierto por construcción**
- **D-073** — kinder aplazado
- **D-079** — el tope de escudos es **por racha**, no cada siete días
- **D-080** — el compañero es **Larry con accesorios**, no una mascota nueva
- **D-081** — la escalera de visibilidad social sale completa, con tres condiciones
- **D-091** — el día de racha se cuenta en el **primer ítem contestado**
- **D-092** — el precio de una misión se publica **por tipo**

### 1.4 La investigación (`docs/research/`)

Empieza por `docs/research/README.md` (índice de 43). Para F7 hacen falta:

- **`mc-16`** — Duolingo: la racha es la palanca, y **la evidencia sobre aprendizaje es débil**
- **`mc-17`** — rachas, protección, y por qué no hay lenguaje de pérdida
- **`mc-10`** — la presión de rendimiento **empeora** el desempeño en matemáticas
- **`mc-18`, `mc-19`, `mc-46`** — comparación social, duelos, grupos
- **`mc-43`** — mapa de progreso y compañero; §6 es el riesgo Tamagotchi
- **`mc-36`** — tipología de formatos de ítem
- **`mc-32`** — riesgos de datos; el **riesgo #1** es «los intentos no van a D1»
- **`mc-34`** — notación por locale. `pt-BR ≠ pt-PT`, `es-MX ≠ es-ES`

### 1.5 El código que ya existe — **léelo antes de escribir nada nuevo**

**No reescribas ninguno de estos. Ya están construidos, probados y con auditor.**

```
packages/motor/src/racha.ts          · packages/motor/src/racha.prueba.mjs
packages/motor/src/xp.ts             · packages/motor/src/xp.prueba.mjs
packages/motor/src/cosmeticos.ts     · packages/motor/src/cosmeticos.prueba.mjs
packages/motor/src/misiones.ts       · packages/motor/src/misiones.prueba.mjs
packages/motor/src/mapa.ts           · packages/motor/src/companero.ts
packages/motor/src/liga.ts           · packages/motor/src/duelo.ts
packages/motor/src/tablero.ts        · packages/motor/src/rollup-adulto.ts
packages/motor/src/limite-pantalla.ts
packages/motor/src/alias.ts          ← los alias generados YA existen
packages/motor/src/numeros.ts        ← el formateo por locale YA existe
apps/web/src/lib/progreso.ts         ← el cable entre los motores y /api/jugar
apps/web/src/lib/liga-do.ts          ← el Durable Object de liga
apps/web/src/components/Racha.astro
apps/web/src/components/mapa/        ← cinco componentes
apps/web/src/components/reto/Pantalla.astro
apps/web/src/pages/api/jugar.ts
```

**`racha.ts` es el patrón de módulo puro del proyecto.** Lee su encabezado
entero antes de escribir cualquier motor nuevo: explica por qué no toca el
reloj, por qué usa los nombres de columna de D1 en vez de camelCase, y por qué
el motivo del día **no entra en la aritmética**.

**`Pantalla.astro` tiene una nota de cabecera que debes leer antes de tocarlo.**
No lleva `<style>` a propósito: Astro no alcanza con CSS de alcance lo que el
script dibuja con `createElement`, y eso rompió la pantalla del reto dos veces.

### 1.6 La flota de auditores

```
audits/run.mjs                 ← el registro. 97 auditores. AÑADE AL FINAL, nunca reordenes
audits/pruebas-auditores.mjs   ← 127 controles negativos. Mismo criterio
audits/lib/repo.mjs            ← helpers. `conFronteraUnicode()` y `patronUnicode()`
audits/live.mjs                ← 40 comprobaciones contra producción
audits/adversarial/cartas.mjs  ← 28 cartas con LLM
```

Y los de F7 y F8, para que no dupliques su trabajo:

```
audits/racha-nunca-se-vende.mjs        audits/racha-limite-no-rompe.mjs
audits/racha-lexico.mjs                audits/motor-xp.mjs
audits/cosmeticos-deterministas.mjs    audits/mision-recompensa-deterministica.mjs
audits/mision-slot-nunca-vacio.mjs     audits/mision-silenciosa.mjs
audits/misiones-sin-do-ajeno.mjs       audits/mapa-lectura-sin-tabla.mjs
audits/companero-sin-decaimiento.mjs   audits/liga-no-quita.mjs
audits/alias-nunca-nombre.mjs          audits/liga-ascenso-determinista.mjs
audits/liga-sin-fusion-cohorte.mjs     audits/duelo-elegibilidad.mjs
audits/tablero-orden-puntos.mjs        audits/limite-no-rompe-el-dia.mjs
audits/limite-nunca-se-levanta-pagando.mjs
audits/limite-pantalla-motor-unico.mjs audits/migration-safety.mjs
```

---

## PARTE 2 — Lee esto de GitHub, con `gh`, antes de tirar código

El repositorio es `kilowatto/math-challenge`. El tablero es
**«Math Challenge — plan integral»**.

### 2.1 Los issues abiertos de F7 — los 31, uno por uno

```bash
gh issue list --search '"F7 ·" in:title' --state open --limit 100 \
  --json number,title -q '.[]|"#\(.number) \(.title)"'
```

Y **lee el cuerpo completo** de cada uno con `gh issue view N`. Cada issue de
este proyecto trae, en el cuerpo: la vía, de qué depende, **las decisiones que
lo gobiernan por número**, la investigación que lo respalda, **las líneas rojas
que toca**, y sus criterios de aceptación. No es decoración: es la
especificación.

Los 31 abiertos hoy, agrupados por lo que de verdad falta:

**Paraguas — se cierran cuando sus hijos cierren:**
`#192` `#199` `#211` `#230` `#237` `#247`

**Superficie de racha y XP (el motor está hecho, falta la pantalla):**
`#195` `#198` `#204` `#205` `#206` `#207` `#208` `#209`

**Misiones — el motor está hecho, falta todo lo visible:**
`#212` `#213` `#214` `#215` `#218` `#220` `#222` `#223` `#224` `#226` `#227` `#229`

**Liga y tablero — esquema, motores y DO hechos; falta interfaz, API y el
Workflow del cierre semanal:**
`#241`

**Cosméticos:**
`#255` `#257`

**Compartidos con F8:** `#268` (extraer `diaEfectivo`/`horaLocal`) y `#284`

### 2.2 Los PRs que hay que leer para entender qué se hizo y por qué

```bash
gh pr view 377 && gh pr view 388 && gh pr view 391 \
  && gh pr view 392 && gh pr view 393 && gh pr view 395
```

| PR | Qué trajo |
|---|---|
| **#377** | Los motores puros de F7: racha, escudos, cosméticos, XP |
| **#378** | D-079 — el arreglo del tope de escudos |
| **#388** | F8 — el motor del límite de pantalla |
| **#391** | El mapa, en sus tres formas por banda |
| **#392** | Misiones diarias |
| **#393** | **El cableado**: la racha y el XP se mueven al contestar |
| **#395** | Ligas, tablero global y duelo |
| **#396** | El arreglo de los worktrees que se colaron en `main` |

**Y lee los comentarios de estado** que quedaron en los issues cerrados de F7:
dicen qué aterrizó, qué falta, y qué se decidió sobre la marcha.

### 2.3 Comprueba el estado real antes de creer nada

```bash
cd /Users/estebanrey/Documents/dev/math-challenge
git fetch origin && git log --oneline -15
gh pr list --limit 20
node audits/run.mjs
node audits/pruebas-auditores.mjs
```

---

## PARTE 3 — El bloqueo que hay que resolver PRIMERO

**Nada de F7 escribe una fila en producción todavía**, y no es por falta de
código.

El registro `d1_migrations` de `math-challenge-db` **dice que solo se aplicaron
`0001` y `0002`**. Pero `0003` a `0006` **están aplicadas de verdad** — alguien
las corrió a mano con `d1 execute`. Verificado objeto por objeto contra
`sqlite_master`, no supuesto.

Consecuencia: `wrangler d1 migrations apply` intenta correr la `0003` y **muere**
con `duplicate column name: country`, así que **las migraciones `0007` a `0012`
no pueden entrar**. La racha, el XP, las misiones, las ligas y el límite de
pantalla existen en código y no tienen dónde escribirse.

Los comandos para sincronizar el registro están en el PR **#393**, escritos y
**sin ejecutar**.

> **Es una escritura a la tabla de control de migraciones de PRODUCCIÓN.
> Pídele el visto bueno explícito al dueño antes de correrla, enséñale los
> comandos, y comprueba el estado antes y después.** No la ejecutes por tu
> cuenta aunque parezca obvia.

`math-challenge-db-eu` **no aparece en ninguna configuración de wrangler**: el
proyecto no la usa. Hay que decidir si se borra o se documenta.

---

## PARTE 4 — Las líneas rojas que F7 puede cruzar

Están en `CLAUDE.md`. Estas cinco son las que este trabajo toca de verdad:

1. **#6 — la racha NUNCA se rompe por respetar el límite de pantalla**, y la
   protección jamás se vende. La forma en que se garantiza importa: el `motivo`
   **no entra en la aritmética**, así que «paré por el límite» y «terminé el
   reto» producen estados idénticos. `racha-limite-no-rompe` lo mide sobre
   1 620 estados. Si escribes una rama que trate distinto a uno de los dos, la
   cruzaste.
2. **#5 — sin moneda comprable y sin recompensas aleatorias de pago.** Las cajas
   de botín fueron declaradas juego ilegal en Bélgica y Países Bajos. La tabla
   de XP es **fija y publicada**: el jugador puede saber de antemano cuánto vale
   cada cosa.
3. **#4 — nunca se cobra por dejar que un niño practique.**
4. **#3 — ningún niño escribe texto libre**, en ninguna superficie. Un duelo
   **no tiene chat**.
5. **#7 — Larry nunca avergüenza**, y **#257: nunca comenta el avatar ni los
   cosméticos de un niño**. Con D-080 eso importa más, no menos: el tutor y el
   compañero son la misma criatura.

Y las tres condiciones de **D-081**, que no son opcionales:
**la liga nunca puede quitar nada** (descender no borra XP, no quita escudos,
no toca la racha); **sin presencia en vivo**; **sin lenguaje de pérdida en
ninguna banda**.

---

## PARTE 5 — Cómo trabajar

### 5.1 Git

- Rama por trabajo, **siempre desde `origin/main`** — el squash merge deja en
  conflicto toda rama que salga de otra rama.
- **Nunca push directo a `main`.** Todo pasa por PR.
- Commits en **Conventional Commits, en inglés**, con cuerpo que explique el
  qué, el porqué y el contexto.
- **Nunca `close #N`** en un PR, ni negado: GitHub cierra el issue igual. Ya
  pasó dos veces.
- **Nunca `git add -A`** en este repositorio: hay worktrees de agente anidados y
  ya se colaron en `main` una vez. Nombra las rutas.

Las cuatro reglas de commit de `CLAUDE.md` no son opcionales: nombra cada
archivo borrado; toda afirmación factual debe poder re-ejecutarse; **toda
prueba de regresión debe haberse visto fallar sin el arreglo**; y **di lo que el
cambio NO hizo**.

### 5.2 El gate — no hay CI, es local

```bash
rm -rf apps/web/dist && cd apps/web && npx astro build && cd ../..
node audits/run.mjs
node audits/pruebas-auditores.mjs
```

El `rm -rf` no es superstición: **iCloud Drive sincroniza este repositorio** y
fabrica duplicados —«index 2.html», «archivos-duplicados 2.mjs»— que rompen
`axe`, `jsonld` y el build con páginas fantasma. `scripts/sacar-de-icloud.sh`
está escrito y **el dueño no lo ha corrido todavía**; ofrécele hacerlo cuando no
haya agentes trabajando.

### 5.3 Desplegar

```bash
cd apps/web && npx wrangler deploy --env-file /tmp/vacio.env
node audits/live.mjs
```

El `--env-file` vacío no es superstición: `.env` tiene un `CLOUDFLARE_API_TOKEN`
que **eclipsa** la sesión OAuth. Y si compilas desde un worktree aislado,
**copia `.env` ahí antes de `astro build`** — sin él el build compila perfecto,
despliega perfecto y **omite Turnstile entero**, dejando a todo el mundo sin
poder entrar. Pasó de verdad en producción el 2026-08-02.

### 5.4 Las cinco trampas que ya costaron caro

Están en `AGENTS.md` Parte 1. Ninguna es teórica:

1. **Un auditor puede aprobar su propia violación** — si juzga con la misma
   función que el código usa para decidir, no puede fallar nunca. Pasó dos veces
   el mismo día, en dos frentes distintos.
2. **`\b` de JavaScript solo conoce ASCII.** `/\bse acab[oó]\b/` no encuentra
   «Se acabó». Usa `conFronteraUnicode()` de `audits/lib/repo.mjs`.
3. **Un control negativo cuyo objetivo se movió es un auditor apagado en
   silencio.**
4. **Código correcto que ninguna ruta alcanza** — `funcion-sin-llamar.mjs`
   existe para eso, y él mismo falló abierto por contar llamadas dentro de
   comentarios.
5. **`define:vars` implica `is:inline`**, y un script inline con TypeScript
   viaja crudo al navegador y **mata el script entero** sin fallar en ningún
   sitio.

### 5.5 Migraciones

La serie va **0001..0012, sin saltos y sin reservas vivas**. La tuya sería la
**0013**. Solo puede agregar, y **escribe su renglón en `docs/infrastructure.md`
en el mismo PR**.

**D1 lleva el control por NOMBRE DE ARCHIVO, no por el estado de las tablas.**
Nunca edites una migración ya commiteada: encadena otra. Y si necesitas reservar
un número para otra rama, el marcador es
`-- migration-safety-reserva: NNNN — <razón de 20+ caracteres>`, que **bloquea
en cuanto ese archivo existe**.

### 5.6 Números de decisión

El más alto hoy es **D-092**. **Léelo del archivo en el momento**, no de este
documento: otra sesión escribe sobre el mismo checkout y ayer metió D-082 a
D-089 a mitad de una integración, provocando dos colisiones.

### 5.7 Agentes en paralelo

El dueño los quiere cuando se pueda. La regla, en `AGENTS.md`: **paralelizar por
TERRITORIO, no por issue**. A cada agente se le dan sus archivos y los ajenos
que no toca, su número de migración **por adelantado**, y su número de decisión.
Los tres registros compartidos —`audits/run.mjs`,
`audits/pruebas-auditores.mjs`, `audits/adversarial/cartas.mjs`— los toca todo
el mundo añadiendo **al final**, y **los merges los resuelve el orquestador,
nunca los agentes**.

---

## PARTE 6 — Cómo trata el dueño el trabajo

- **Prefiere preguntas interactivas de opción múltiple con las alternativas
  explicadas**, en olas de 4. Haz todas las que cambien lo que vas a construir.
- **«No te detengas.»** Pregunta y sigue avanzando en lo que la respuesta no
  bloquea. Si no está, la duda va a `docs/dudas.md` y el trabajo sigue.
- **Mergear y desplegar son flujo normal**, no eventos que pidan permiso.
  **Excepto** la escritura a `d1_migrations` de la Parte 3.
- **Cambia de opinión con evidencia.** Si encuentras una fuente que contradice
  una decisión suya, enséñasela: decide rápido y sin discutir. Pasó ayer con la
  voz (D-077 → D-078).
- **Mira el tablero de GitHub**, y un issue sin cerrar le dice que no hubo
  avance. **Cierra los issues cuyo criterio esté genuinamente cumplido**, con un
  comentario que diga qué se verificó y qué queda. No los dejes abiertos «por
  prudencia»: eso también miente, solo que en la otra dirección.

---

## PARTE 7 — Lo primero que harás, en orden

1. **Leer todo lo de la Parte 1 y la Parte 2.** No negociable.
2. **Correr el gate** y comprobar que `main` está verde antes de tocar nada.
3. **Preguntarle al dueño**, de forma interactiva, sobre el bloqueo de
   `d1_migrations` (Parte 3) y sobre las cuatro preguntas abiertas de
   `docs/dudas.md` §23.
4. **Mientras contesta**, empezar por lo que no depende de la respuesta: la
   **superficie de misiones** (`#212` `#213` `#218` `#220` `#222` `#227`) y la
   **superficie de racha** (`#205` `#206`), que son lo único que el dueño va a
   poder tocar jugando.
5. **Cerrar los issues** conforme sus criterios se cumplan, con evidencia.

Lo que hace falta para cerrar F7, dicho en una frase: **los motores están todos
construidos y probados; falta la interfaz, el cableado de misiones y liga, el
Workflow del cierre semanal, y aplicar las migraciones.**
