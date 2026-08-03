# Prompt de arranque — cerrar F7 (Juego)

> Cópialo entero como primer mensaje de la sesión siguiente, o dile:
> «Lee `docs/planes/2026-08-03-arranque-cerrar-f7.md` entero y síguelo».
>
> Escrito el **2026-08-03**, al cerrar la sesión que integró cinco frentes de F7
> y el primero de F8. Los números que cita **envejecen**: el documento dice
> cómo comprobar cada uno antes de citarlo.

---

Vas a **cerrar F7 (Juego)** en Math Challenge. Hoy hay **31 issues abiertos de
69**; 38 se cerraron ayer. Todos los **motores puros están construidos,
probados y en `main`** — lo que falta es **interfaz, cableado y una migración
que no puede aplicarse**.

**No escribas una línea de código hasta terminar la Parte 1 y la Parte 2.** Este
proyecto tiene ocho líneas rojas con exposición regulatoria real, 97 auditores
deterministas y 127 controles negativos. Escribir sin leer aquí no es rápido: es
un PR que el gate rechaza.

---

# PARTE 1 — Lectura obligatoria, en este orden

## 1.1 Las reglas del proyecto — 9 archivos, con ruta y extensión

| # | Archivo | Qué buscar exactamente |
|---|---|---|
| 1 | `CLAUDE.md` | **Las ocho líneas rojas** (§«Las ocho líneas que no se cruzan»), §Git con sus cuatro reglas de commit, §Cloudflare con el `--env-file` vacío y el aviso de `.env` en worktrees, §Contenido, §Imágenes |
| 2 | `AGENTS.md` | **Solo la Parte 1**, «Orquestación de agentes en paralelo». La Parte 2 es la especificación de traducción del corpus y **no aplica hoy** |
| 3 | `docs/master-plan.md` | La tabla de fases (busca `F8 · Padres`), y §9 con el esquema de ítem |
| 4 | `docs/decisions.md` | **~3 400 líneas. NO lo leas entero.** Lee por número las de §1.3 con `grep -n "^## D-0NN" -A 40` |
| 5 | `docs/dudas.md` | **§22 y §23 completas.** Son de ayer: cuatro preguntas del dueño sin responder y nueve supuestos que tomaron los agentes |
| 6 | `docs/planes/f7-juego.md` | **La especificación completa de F7.** No rediseñes nada: está escrito, con §3 (los 10 tipos de misión), §0.2 (el compañero) y §6.2 (visibilidad social) |
| 7 | `docs/infrastructure.md` | El inventario de Cloudflare. Todo objeto lleva prefijo `math-challenge-`, y **quien crea un recurso escribe su renglón en el MISMO PR** |
| 8 | `docs/guia-de-estilo.md` | Paleta Ignia, Raleway, y la tabla de las tres formas del mapa que se añadió ayer |
| 9 | `docs/planes/2026-08-02-rezagados.md` | 28 issues fuera del tablero, incluida toda F5c |

## 1.2 La memoria del proyecto — los 17 archivos, todos

Directorio:
`/Users/estebanrey/.claude/projects/-Users-estebanrey-Documents-dev-math-challenge/memory/`

Lee **`MEMORY.md` primero** (es el índice) y después los dieciséis, con estos
nombres exactos:

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

**Seis que cambian lo que haces hoy, y por qué:**

- **`shared-checkout-concurrent-sessions.md`** — otra sesión escribe sobre este
  mismo checkout. Ayer metió **D-082 a D-089** en `docs/decisions.md` a mitad de
  una integración y provocó **dos colisiones de número**. Si `git status`
  muestra cambios que no hiciste tú, **no es tu bug**.
- **`prefers-interactive-questions.md`** — el dueño quiere preguntas de opción
  múltiple con las alternativas explicadas, en olas de 4. No prosa.
- **`owner-wants-continuous-progress.md`** — «no te detengas»: pregunta y sigue
  con lo que la respuesta no bloquea.
- **`nunca-close-numero-en-pr.md`** — **nunca `close #N` en un PR, ni negado.**
  GitHub cierra el issue igual. Ya pasó dos veces.
- **`ramas-siempre-desde-origin-main.md`** — el squash merge deja en conflicto
  toda rama que salga de otra rama.
- **`dist-duplicados-bloquean-el-gate.md`** — `rm -rf apps/web/dist` antes de
  construir, siempre.

## 1.3 Las decisiones, por número — `grep` en `docs/decisions.md`

**Núcleo del producto**

- **D-002** — la edad no limita la dificultad
- **D-010** — un solo motor de puntuación, con sus invariantes
- **D-014** — la racha; **la protección jamás se vende**; misiones diarias en la
  lista blanca
- **D-016** — la tabla de minutos del límite de pantalla, y `users.timezone`
  como fuente del día local
- **D-017** — **el número de nivel no se enseña a nadie**
- **D-018** — los cinco modos; el duelo es opt-in
- **D-019** — la Sabana de kinder
- **D-022** — los siete locales, no cinco idiomas
- **D-024, D-045** — sin cronómetros; kinder sin reloj
- **D-025** — el tablero ordena por `total_score`
- **D-026** — registro de dos campos, sin carrusel, **sin nagging**
- **D-030, D-043** — un Durable Object por entidad, nunca global
- **D-032** — la flota de auditores; anular exige escribirlo
- **D-034** — las bandas de adulto (SERIO / JR / PRO)
- **D-040** — opt-in por hijo
- **D-044** — salones y clubs
- **D-047** — offline
- **D-053** — solo el año de nacimiento
- **D-056** — cupos de liga
- **D-060** — la primera sesión ES la ubicación, y el niño no se entera

**Las de ayer, que gobiernan lo que queda**

- **D-070** — **ninguna comprobación puede ser cierta por construcción.** Dos
  fuentes independientes
- **D-073** — kinder aplazado
- **D-075** — la enmienda de la línea roja #1: cámara **solo** para un adulto
  verificado, bajo acción explícita, jamás donde pueda haber un menor
- **D-077 → D-078** — la voz sale con los 7 locales vía `speechSynthesis`
- **D-079** — el tope de 2 escudos es **por racha**, no cada siete días
- **D-080** — **el compañero es Larry con accesorios**, no una mascota nueva
- **D-081** — la escalera de visibilidad social sale completa, **con tres
  condiciones que no son opcionales**
- **D-091** — el día de racha se cuenta en el **primer ítem contestado**, no al
  cerrar el reto
- **D-092** — el precio de una misión se publica **por tipo**

## 1.4 La investigación — `docs/research/`

Empieza por `docs/research/README.md` (índice de 43). Para F7:

| Investigación | Lo que aporta |
|---|---|
| **`mc-16`** | Duolingo. La racha es la palanca de retención — **y la evidencia sobre aprendizaje es débil**. Su propio CEO compara la app con «una elíptica». Ninguna decisión de F7 puede justificarse diciendo «así aprende más» |
| **`mc-17`** | Rachas y protección. §5 sobre patrones oscuros: *confirm-shaming* y urgencia fabricada son categorías nombradas por la FTC. §83: la racha como **contador de mejor marca personal** |
| **`mc-10`** | **La presión de rendimiento empeora el desempeño en matemáticas.** Es la objeción escrita contra D-081 |
| **`mc-18`, `mc-19`, `mc-46`** | Comparación social, duelos asíncronos, grupos |
| **`mc-43`** | Mapa y compañero. **§6 es el riesgo Tamagotchi**. Recomendación 8: KINDER es un sendero con la mascota caminando, sin números. Hallazgo 5: «randomization plus payment is the trigger» |
| **`mc-36`** | Tipología de formatos de ítem (Swan) |
| **`mc-32`** | Riesgos de datos. **Riesgo #1: los intentos no van a D1** |
| **`mc-34`** | Notación por locale. `pt-BR ≠ pt-PT`, `es-MX ≠ es-ES`, y el separador de miles |
| **`mc-11`** | Retroalimentación (Shute; Kluger & DeNisi sobre 607 tamaños de efecto) |

## 1.5 El código que YA existe — **léelo, no lo reescribas**

### Motores puros (`packages/motor/src/`) — todos con su `.prueba.mjs` al lado

```
racha.ts          ← EL PATRÓN del proyecto. Lee su encabezado ENTERO
xp.ts             cosmeticos.ts     misiones.ts
mapa.ts           companero.ts      liga.ts
duelo.ts          tablero.ts        rollup-adulto.ts
limite-pantalla.ts
alias.ts          ← los alias anónimos YA existen. Úsalos
numeros.ts        ← el formateo por locale YA existe. Úsalo
convenciones.ts   sesion.ts         puntuacion.ts     serie.ts
adaptativo.ts     item.ts           banco-kinder.ts   explicacion.ts
```

Del encabezado de **`racha.ts`** salen tres reglas que aplican a todo motor
nuevo: **no toca el reloj** (`diaEfectivo()` es la única puerta entre un
instante y un día, y recibe la zona IANA); **usa los nombres de columna de D1**
y no camelCase, porque una capa de traducción es donde el auditor deja de ver; y
**el `motivo` del día no entra en la aritmética**, para que la línea roja #6 no
dependa de una rama que alguien pueda escribir mal.

### Cliente y superficie

```
apps/web/src/lib/progreso.ts              ← EL CABLE: diaEfectivo → registrarDia
                                            → ganarEscudos → SQL_UPSERT_RACHA,
                                            y xpDeItem → SQL_UPSERT_XP
apps/web/src/lib/liga-do.ts               ← el Durable Object `Liga`
apps/web/src/lib/sesiones.ts              ← cookies, COOKIE_PISTA
apps/web/src/lib/rutas-app.ts             ← rutaCasa()
apps/web/src/pages/api/jugar.ts           ← llama a progreso.ts; devuelve
                                            `progreso: { racha, xp }`
apps/web/src/pages/api/larry.ts           ← el tutor en vivo (F6)
apps/web/src/components/reto/Pantalla.astro   ← LEE SU NOTA DE CABECERA
apps/web/src/components/reto/Formatos.astro
apps/web/src/components/racha/            ← Racha.astro, montada en /app/practicar/
apps/web/src/components/mapa/             ← Mapa, Arbol, Sendero, Companero, Tablero
apps/web/src/layouts/Privada.astro        ← el layout del área privada
```

**Rutas del área privada que ya existen** (`apps/web/src/pages/[locale]/app/`):
`index.astro`, `practicar.astro`, `mapa.astro`, `perfil.astro`,
`perfil-nuevo.astro`, `signin.astro`, `kids/index.astro`, `kids/jugar.astro`,
`kids/pin.astro`.

**La nota de cabecera de `Pantalla.astro` no es opcional.** Ese componente **no
lleva `<style>` a propósito**: Astro escribe los estilos de componente con un
atributo de alcance (`[data-astro-cid-…]`) y **los elementos que crea el script
con `createElement` no lo llevan**, así que ninguna regla los alcanza. Eso
explicó tres bugs que se reportaron por separado. Los estilos van en
`apps/web/src/styles/reto.css`, que es global.

### Estilos e i18n

```
apps/web/src/styles/    tokens.css  fonts.css  bandas.css  reto.css  mapa.css
                        plataformas.css
apps/web/src/i18n/      en.json  es-MX.json  es-ES.json  fr-FR.json
                        pt-BR.json  pt-PT.json  de-DE.json
                        reto/  racha/  liga/  larry/  voz/  limite-pantalla/
                        paginas/  rutas.ts  rutas-tabla.mjs  index.ts
```

**Solo tokens que existen en `tokens.css`.** Un `var()` sin definir **no cae a
un valor por defecto: invalida la declaración entera**. Ya rompió la pantalla
del reto dos veces, y ayer volvió a pasar con `--color-borde`,
`--color-superficie` y `--color-superficie-alta`, que suenan bien y no existen.
Los reales son `--color-bg`, `--color-surface`, `--color-text`,
`--color-text-muted`, `--color-border`, `--color-accent`, `--color-on-accent`,
`--color-error`, `--font-marca`, `--font-sistema`, `--font-mono`, `--measure`,
`--leading-body`, `--text-xs`, `--text-base`, `--text-lg`, `--text-xl`,
`--text-2xl`.

## 1.6 La flota de auditores

```
audits/run.mjs                 ← el registro, 97 auditores. AÑADE AL FINAL
audits/pruebas-auditores.mjs   ← 127 controles negativos. AÑADE AL FINAL
audits/lib/repo.mjs            ← helpers: archivos(), leer(), informar(),
                                 SOLO_PRODUCTO, palabra(),
                                 conFronteraUnicode(), patronUnicode()
audits/live.mjs                ← 40 comprobaciones contra producción real
audits/adversarial/cartas.mjs  ← 28 cartas con LLM. Se corre a mano
```

Los de F7 y F8, para que no dupliques trabajo hecho:

```
racha-nunca-se-vende.mjs        racha-limite-no-rompe.mjs
racha-lexico.mjs                motor-xp.mjs
cosmeticos-deterministas.mjs    mision-recompensa-deterministica.mjs
mision-slot-nunca-vacio.mjs     mision-silenciosa.mjs
misiones-sin-do-ajeno.mjs       mapa-lectura-sin-tabla.mjs
companero-sin-decaimiento.mjs   liga-no-quita.mjs
alias-nunca-nombre.mjs          liga-ascenso-determinista.mjs
liga-sin-fusion-cohorte.mjs     duelo-elegibilidad.mjs
tablero-orden-puntos.mjs        limite-no-rompe-el-dia.mjs
limite-nunca-se-levanta-pagando.mjs   limite-pantalla-motor-unico.mjs
migration-safety.mjs            funcion-sin-llamar.mjs
script-cliente-sin-ts.mjs       archivos-duplicados.mjs
no-attempts-in-d1.mjs           kinder-sin-examen.mjs
notacion-locale.mjs             locales-complete.mjs
retro-completa.mjs              larry-nunca-averguenza.mjs
larry-en-vivo.mjs               larry-tope-gasto.mjs
```

---

# PARTE 2 — Qué leer de GitHub antes de tirar código

Repositorio: **`kilowatto/math-challenge`**.
Tablero: **«Math Challenge — plan integral»**.

## 2.1 Los 31 issues abiertos de F7, uno por uno

```bash
gh issue list --search '"F7 ·" in:title' --state open --limit 100 \
  --json number,title -q '.[]|"#\(.number) \(.title)"' | sort -t'#' -k2 -n
```

Y **lee el cuerpo completo** de cada uno con `gh issue view N`. En este proyecto
**el cuerpo del issue ES la especificación**: trae la vía, de qué depende, **las
decisiones que lo gobiernan por número**, la investigación que lo respalda, **las
líneas rojas que toca**, «Qué queda funcionando», y sus criterios de aceptación
como casillas.

### Grupo A — Superficie de misiones (el motor está hecho, falta TODO lo visible)

| Issue | Qué falta exactamente |
|---|---|
| **#212** | El catálogo de 10 tipos ya está en `misiones.ts`. Falta la **prueba de regresión con ítems reales**, no solo con la declaración: `variedad` mide amplitud de tema y `descubre` amplitud de modo, y hay que comprobarlo contra el banco |
| **#213** | KINDER **no recibe menú de misiones**. Su única «misión» es completar el reto HISTORIA del día — una etiqueta interna sobre lo que F5/F6 ya construyen, **sin componente, sin texto y sin voz nuevos**. `kinder-sin-examen.mjs` tiene que seguir verde |
| **#214, #215** | Los contratos de **solo lectura** con F4 y con el DO de liga. Existen en el motor; falta que alguien los alimente |
| **#218** | Un perfil sin `dueloOptIn` **nunca ve la misión `duelo`** — ni activa, **ni como «misión bloqueada, actívala»**. Mostrarla bloqueada es *nagging*, que D-026 y `mc-17` prohíben por nombre |
| **#220** | Bono de cierre del día (+15 XP) **mostrado como una suma**, nunca como algo que se «abre» o «desenvuelve». Aunque el contenido sea determinista y conocido, **la metáfora de cofre sugiere sorpresa** y se evita a propósito (`mc-43` hallazgo 5) |
| **#222** | El resumen de fin de día lista **solo lo logrado**, como una lista que crece. **Nunca «0/3» ni casillas vacías**: es un veredicto negativo aunque el copy no lo diga (línea roja #7) |
| **#223** | `mission_daily_summary` en D1 — **una fila por niño por día**, sin intentos crudos, sin PII |
| **#224** | `math-challenge-missions-do` — **un DO por niño**, separado del de F4 |
| **#226** | `meta_de_liga` **sin contribución individual visible** y **sin anuncio de meta fallida** |
| **#227** | **≈210 cadenas** (10 tipos × 3 mensajes × 7 locales), **autoradas por locale, no traducidas**. Todo número visible pasa por `numeros.ts`/`convenciones.ts`, **nunca escrito a mano** |
| **#229** | Los dos auditores de cierre, **vistos fallar antes de bloquear** |

### Grupo B — Superficie de racha y XP (el cable existe; falta lo que se ve)

| Issue | Qué falta exactamente |
|---|---|
| **#205** | **KINDER no ve un número de racha.** Ve a Larry avanzando por un sendero de la Sabana, **un paso por día jugado**. Cuando un escudo cubre un día, el sendero **no se detiene** — sin «casi te quedas atrás». Cuando la racha se reinicia, **el sendero recorrido NO retrocede ni se borra**. Hay que extender `kinder-sin-examen.mjs` para que prohíba también **cifras de racha** en esa banda |
| **#206** | De PRIMARIA en adelante: el número con `formatear(n, locale)` de `numeros.ts`, **siempre junto a `max_streak`** — contador de mejor marca, no cuenta regresiva. **Nunca**: color de alarma, cuenta regresiva a medianoche, verbo de pérdida, comparación con otro niño, ni ícono de fuego que se apaga |
| **#195** | Guardarraíl de naming **Rango vs Nivel de dificultad** (D-017), y de no-comparación entre bandas |
| **#198** | XP offline, y **por qué NO hereda la reserva de D-047** sobre puntos |
| **#204** | Pausa familiar. El motor ya la tiene (`declararPausa`, tope de 4 al año, 21 días, ventana de reparación de 5). **Falta la pantalla del padre** |
| **#207** | El recordatorio: **un push al padre, nunca al niño, nunca con culpa** |
| **#208** | Racha de **solo lectura** para salones y clubs (D-044) |
| **#209** | Los intentos offline también cuentan para la racha |

### Grupo C — Liga, tablero y duelo

**#241** — el **ciclo semanal de ascenso y descenso**. La función idempotente y
su prueba existen; **falta el Workflow, su cron y el archivado a 8 semanas**.

### Grupo D — Cosméticos

**#255** — catálogo v1 de KINDER: 18 piezas de avatar + 5 marcos, uno por
habilidad de la Sabana. **#257** — Larry **nunca comenta el avatar ni los
cosméticos** de un niño; con D-080 importa más, porque tutor y compañero son la
misma criatura.

### Grupo E — Paraguas (se cierran cuando cierren sus hijos)

`#192` `#199` `#211` `#230` `#237` `#247`

### Grupo F — Compartidos con F8

**#268** — extraer `diaEfectivo`/`horaLocal` a un módulo neutral. **Se difirió
ayer a propósito** porque `racha.ts` estaba siendo cableado; ahora ya se puede.
**#284** — roadmap de cosméticos en el panel.

## 2.2 Los PRs que explican qué se hizo y por qué

```bash
for n in 377 378 388 391 392 393 395 396 397; do gh pr view $n; done
```

| PR | Qué trajo | Lo que hay que sacar de él |
|---|---|---|
| **#377** | Los motores puros: racha, escudos, cosméticos, XP | El límite de pantalla no se protege con una rama amable: el `motivo` no entra en la aritmética |
| **#378** | **D-079** | Por qué el tope es por racha, y por qué la migración fue `0008` y no una edición de la `0007` |
| **#388** | F8 — el motor del límite de pantalla | El mecanismo `migration-safety-reserva`, y el arreglo del `\b` ASCII |
| **#391** | El mapa en sus tres formas | Las tres piezas de Larry que hay que generar en Recraft |
| **#392** | Misiones diarias | Por qué murió `XP_POR_TIPO.mision_diaria = 20` |
| **#393** | **El cableado** | **Los dos comandos para arreglar `d1_migrations`**, escritos y sin ejecutar |
| **#395** | Ligas, tablero, duelo | La contradicción entre #242 y #243, y por qué el opt-in vive en `child_consents` |
| **#396** | El arreglo de los worktrees en `main` | Por qué `git add -A` es una escopeta en este repo |
| **#397** | Este documento | — |

**Y lee los comentarios de estado** que quedaron en los 45 issues cerrados
ayer: dicen qué aterrizó, qué falta y qué se decidió sobre la marcha.

## 2.3 Comprueba el estado real antes de creer nada de este documento

```bash
cd /Users/estebanrey/Documents/dev/math-challenge
git fetch origin && git log --oneline -20
git status --porcelain          # otra sesión puede haber tocado cosas
gh pr list --limit 20
gh issue list --search '"F7 ·" in:title' --state open --limit 100 | wc -l
grep -o '^## D-[0-9]\{3\}' docs/decisions.md | sort -u | tail -3   # el D más alto
ls migrations/                  # la serie va 0001..0012 hoy
node audits/run.mjs
node audits/pruebas-auditores.mjs
```

---

# PARTE 3 — El bloqueo que va PRIMERO, antes de escribir código

**Nada de F7 escribe una fila en producción todavía**, y no es por falta de
código.

El registro `d1_migrations` de `math-challenge-db` **dice que solo se aplicaron
`0001` y `0002`**. Pero **`0003` a `0006` están aplicadas de verdad** — alguien
las corrió a mano con `d1 execute`. Verificado objeto por objeto contra
`sqlite_master`, no supuesto.

Consecuencia exacta: `wrangler d1 migrations apply` intenta correr la `0003` y
**muere** con `duplicate column name: country`, así que **las migraciones `0007`
a `0012` no pueden entrar**:

| Migración | Qué queda sin poder escribir |
|---|---|
| `0007_racha_y_xp.sql` | `child_streak`, `xp_totals` |
| `0008_escudos_por_racha.sql` | `shields_earned_this_streak` |
| `0009_misiones_diarias.sql` | las misiones |
| `0010_mapa_companero.sql` | `companion_state` |
| `0011_screen_time_daily_usage.sql` | el consumo de pantalla |
| `0012_ligas_tablero_duelo.sql` | cohortes, membresías, duelos, `score_totals_adulto` |

Los comandos para sincronizar el registro están en el **PR #393**, escritos y
**sin ejecutar**.

> ### Esto no lo ejecutas por tu cuenta
>
> Es una escritura a la **tabla de control de migraciones de PRODUCCIÓN**.
> Pídele al dueño el visto bueno explícito, **enséñale los comandos**, comprueba
> el estado **antes y después**, y no lo hagas aunque parezca obvio. Si sale
> mal, la siguiente migración de cualquier fase se aplica sobre un esquema que
> nadie sabe describir.

**`math-challenge-db-eu` no aparece en ninguna configuración de wrangler**: el
proyecto **no la usa**. Comprobado, no supuesto. Hay que decidir si se borra o
se documenta — es una decisión del dueño, y va a `docs/infrastructure.md`.

---

# PARTE 4 — Las líneas rojas que F7 puede cruzar

Están completas en `CLAUDE.md`. Estas cinco son las que este trabajo toca de
verdad, con la forma exacta en que se cruzan:

### #6 — La racha nunca se rompe por respetar el límite de pantalla

Y la protección **jamás se vende**. La forma de garantizarlo importa más que la
regla: **el `motivo` no entra en la aritmética**, así que `RETO_COMPLETADO` y
`LIMITE_DE_PANTALLA_CORTO_LA_SESION` producen **estados idénticos**.
`racha-limite-no-rompe.mjs` lo mide **ejecutando el motor sobre 1 620 estados**,
y `limite-no-rompe-el-dia.mjs` recorre el grafo sobre 216 más.
**Si escribes una rama que trate distinto a uno de los dos, la cruzaste** —
aunque la rama sea amable.

### #5 — Sin moneda comprable y sin recompensas aleatorias de pago

Las cajas de botín fueron declaradas **juego ilegal en Bélgica y Países Bajos**.
La tabla de XP es **fija y publicada**: el jugador sabe de antemano cuánto vale
cada cosa. Y `mc-43` hallazgo 5 va más lejos: se evita **la sugerencia visual**,
no solo el mecanismo — de ahí #220, que prohíbe la metáfora de cofre aunque el
contenido sea determinista.

### #4 — Nunca se cobra por dejar que un niño practique

Sin corazones, sin vidas, sin energía que se agote. Ninguna misión detrás de un
pago. `limite-nunca-se-levanta-pagando.mjs` **ejecuta 4 050 decisiones con
campos de pago inyectados** y exige que ninguna se mueva.

### #3 — Ningún niño escribe texto libre, en ninguna superficie

Un duelo **no tiene chat**, no tiene emotes escritos, no tiene nada que teclear.

### #7 — Larry nunca avergüenza, y nunca calcula

Recibe el veredicto ya calculado y solo lo explica. Y **#257: nunca comenta el
avatar ni los cosméticos de un niño.** Con D-080 esto importa más, no menos: el
tutor y el compañero son **la misma criatura**, así que la frontera entre «te
explico tu error» y «qué bonito tu sombrero» tiene que ser explícita.

### Las tres condiciones de D-081, que no son opcionales

1. **La liga nunca puede quitar nada.** Descender **no** borra XP, **no** quita
   escudos, **no** toca la racha, **no** cambia el mapa. `liga-no-quita.mjs` lo
   hace cumplir siguiendo el grafo.
2. **Sin presencia en vivo.** El duelo es asíncrono, ventana de 48 h, y **no
   revela si el otro está conectado**.
3. **Sin lenguaje de pérdida en ninguna banda.** Le toca a `racha-lexico.mjs`,
   que ya cubre 22 archivos de léxico y 154 cadenas en 7 locales.

---

# PARTE 5 — Cómo trabajar en este repositorio

## 5.1 Git

- **Rama por trabajo, siempre desde `origin/main`.** El squash merge deja en
  conflicto toda rama que salga de otra rama.
- Prefijos: `feat/` `fix/` `docs/` `content/` `chore/` `refactor/` `infra/`.
- **Nunca push directo a `main`.** Todo pasa por PR.
- Commits en **Conventional Commits, en inglés**, con cuerpo que explique el
  **qué**, el **porqué** y el **contexto**.
- **Nunca `close #N` en un PR, ni negado.** GitHub cierra el issue igual.
- **Nunca `git add -A`.** Hay worktrees de agente anidados y ya se colaron en
  `main` una vez (`cec2662`). Nombra las rutas.

**Las cuatro reglas de commit de `CLAUDE.md` no son opcionales:**

1. **Nombra cada archivo borrado.** Lee `git status` antes de commitear.
2. **Toda afirmación factual debe poder re-ejecutarse.** «Gate verde, 300 tests»
   sin la salida del comando es una aserción en tono seguro, no un hecho.
3. **Toda prueba de regresión debe haberse visto fallar sin el arreglo**, con la
   evidencia pegada en el PR.
4. **Di lo que el cambio NO hizo.** Alcance diferido, residuos, cosas dejadas
   rotas a propósito.

## 5.2 El gate — no hay CI, es local

```bash
cd /Users/estebanrey/Documents/dev/math-challenge
rm -rf apps/web/dist
cd apps/web && npx astro build && cd ../..
node audits/run.mjs
node audits/pruebas-auditores.mjs
npx astro check --root apps/web        # hay ~31 errores preexistentes; no añadas
```

El `rm -rf` **no es superstición**: iCloud Drive sincroniza este repositorio y
fabrica duplicados —«index 2.html», «archivos-duplicados 2.mjs»— que rompen
`axe`, `jsonld` y el build con páginas fantasma. En `ae73db1` fueron **193**.

`scripts/sacar-de-icloud.sh` está escrito y **el dueño no lo ha corrido**.
Ofrécele hacerlo cuando no haya agentes trabajando:
`bash scripts/sacar-de-icloud.sh` (ensayo) y `--hazlo` (de verdad).

## 5.3 Desplegar

```bash
cd apps/web && npx wrangler deploy --env-file /tmp/vacio.env
cd ../.. && node audits/live.mjs
```

El `--env-file` **vacío** no es superstición: `.env` tiene un
`CLOUDFLARE_API_TOKEN` de Workers AI que **eclipsa** la sesión OAuth y hace
fallar el despliegue con `Authentication error [code: 10000]`.

**Si compilas desde un worktree aislado, copia `.env` ahí ANTES de
`astro build`** — es un archivo distinto del `--env-file` de arriba, vive en
`.gitignore`, y un `git worktree add` limpio **no lo trae**.
`TURNSTILE_SITE_KEY` se hornea en el HTML en tiempo de build, así que un build
sin `.env` **compila perfecto, despliega perfecto y omite Turnstile entero** en
las tres puertas de registro y en `/entrar/`, en los siete locales. Nadie puede
entrar ni registrarse. **Pasó de verdad en producción el 2026-08-02.**

```bash
cp /Users/estebanrey/Documents/dev/math-challenge/.env <ruta-del-worktree>/.env
```

Los primeros segundos tras desplegar dan **404 intermitentes** en rutas nuevas:
es propagación del manifest de assets entre nodos, no un archivo faltante. Se
asienta al minuto.

## 5.4 Las cinco trampas que ya costaron caro

Ninguna es teórica. Las cinco ocurrieron en este repositorio, varias **dos
veces**.

1. **Un auditor puede aprobar su propia violación.** Si juzga con la misma
   función que el código usa para decidir, **no puede fallar nunca**. Pasó dos
   veces el mismo día, en dos frentes distintos: `mision-slot-nunca-vacio`
   juzgaba con `definicionDe(t).elegible`, y una barrida de determinismo tenía
   una regla por tipo de evento. **La única defensa es reescribir la tabla de
   precondiciones a mano, como segunda fuente** (D-070).
2. **`\b` de JavaScript solo conoce ASCII.** `\w` es `[A-Za-z0-9_]` incluso con
   la bandera `u`, así que `/\bse acab[oó]\b/iu.test("Se acabó la racha")` es
   **`false`** y con «acabo» sin acento es `true`. Dejó **un locale entero** sin
   protección contra elogios a la capacidad, y a `es-MX` y `es-ES` ciegos a las
   dos formas naturales de decir que la racha terminó. Usa
   **`conFronteraUnicode()`** o **`patronUnicode()`** de `audits/lib/repo.mjs`.
3. **Un control negativo cuyo objetivo se movió es un auditor apagado en
   silencio.** El arnés lo caza —«el caso corría en verde sin degradar nada»— y
   hay que **reapuntarlo, no borrarlo**. Pasó tres veces ayer al integrar.
4. **Código correcto que ninguna ruta alcanza.** `marcarDispositivoDelHogar`
   escrita y sin llamador; `<Marca>` usada sin importar (**200 con cero bytes**);
   `validarItem` que `generarBanco()` no llama. `funcion-sin-llamar.mjs` existe
   para esto — **y él mismo falló abierto** por contar llamadas dentro de
   comentarios, así que `racha.ts` se contaba a sí mismo como su llamador.
5. **`define:vars` implica `is:inline`**, y un script inline con TypeScript
   viaja **crudo** al navegador, lanza `SyntaxError` y **mata el script entero**
   sin fallar en ningún sitio. La página se pinta perfecta y no tiene
   JavaScript. Estuvo así la entrada con passkey en producción (D-032).

**Dos más, de Astro, que también costaron:**

- `export type` con unión de barra inicial en el frontmatter **rompe esbuild**
  con `Unexpected "|"` señalando la línea equivocada.
- Los comentarios JSX `{/* */}` **no pueden ir entre atributos** de un elemento
  (rompe `astro check`) ni como primer hijo después de `&& (` (rompe el build).

## 5.5 Migraciones

La serie va **0001..0012, sin saltos y sin reservas vivas**. La tuya sería la
**0013**. Solo puede **agregar**. Escribe su renglón en
`docs/infrastructure.md` **en el mismo PR**.

**D1 lleva el control por NOMBRE DE ARCHIVO, no por el estado de las tablas.**
Nunca edites una migración ya commiteada: encadena otra. Ayer intenté editar la
`0007` tras comprobar que sus tablas no existían en remoto, y **la comprobación
era la equivocada** — `migration-safety` lo paró.

Si necesitas reservar un número para otra rama:
`-- migration-safety-reserva: NNNN — <razón de 20+ caracteres>`.
**Bloquea en cuanto ese archivo existe**, para que la excepción no se vuelva
permanente. Funcionó dos veces ayer al integrar.

## 5.6 Números de decisión

El más alto hoy es **D-092**. **Léelo del archivo en el momento**:

```bash
grep -o '^## D-[0-9]\{3\}' docs/decisions.md | sort -u | tail -3
```

Otra sesión escribe sobre el mismo checkout. Ayer metió D-082 a D-089 a mitad de
una integración y provocó **dos colisiones** que hubo que renumerar a mano
(D-091 y D-092), con sus referencias cruzadas en `docs/dudas.md`.

**La tríada de decisión** (memoria `decision-triad-guia-auditor-memoria.md`):
toda decisión de diseño no trivial va a **`docs/guia-de-estilo.md` o
`docs/decisions.md`** + **un auditor determinista** + **la memoria**. Las tres,
no una.

## 5.7 Agentes en paralelo

El dueño los quiere cuando se pueda, y ayer corrieron cinco a la vez. La regla,
en `AGENTS.md` Parte 1: **paralelizar por TERRITORIO, no por issue**.

A cada agente se le da:

1. **Qué leer, numerado** — `CLAUDE.md`, las decisiones por número, la
   investigación concreta, los issues con `gh issue view N`, y **el archivo que
   le sirve de patrón**.
2. **Su territorio y el de los demás**, con nombres de archivo.
3. **Las líneas rojas que su trabajo puede cruzar**, por número y con la
   consecuencia dicha.
4. **Su número de migración por adelantado**, y **su número de decisión**.
5. **Qué cuenta como prueba**: gate verde con la salida pegada, control negativo
   **visto fallar degradando el archivo real**, y para producto, **jugarlo**.
6. **Las cinco trampas de §5.4**, verbatim.
7. **Cómo cerrar**: rama desde `origin/main`, PR abierto, **sin mergear y sin
   desplegar**, y **decir lo que NO hizo**.

**Lo que el orquestador NO delega**: resolver los merges de los tres registros
compartidos (`audits/run.mjs`, `audits/pruebas-auditores.mjs`,
`audits/adversarial/cartas.mjs`), renumerar migraciones, repartir números de
decisión, y **cualquier acción irreversible en producción**.

**Cómo se resuelven esos merges**, que fue idéntico las seis veces de ayer: los
dos lados **añaden** entradas al final del mismo registro, y **se conservan los
dos**. Después hay que revisar a mano el punto de sutura: al quitar los
marcadores queda un `},` de menos y el archivo no parsea.
`node -e 'import("./audits/pruebas-auditores.mjs")'` lo detecta en un segundo.

**La excepción**, y la única que exige leer:
si **dos ramas arreglaron el mismo bug**, un merge textual deja dos funciones
incompatibles. Pasó ayer con `conFronteraUnicode`: dos firmas distintas y el
mismo nombre.

---

# PARTE 6 — Cómo trata el dueño el trabajo

- **Prefiere preguntas interactivas de opción múltiple con las alternativas
  explicadas**, en olas de 4. Haz todas las que cambien lo que vas a construir —
  si son 3, son 3; si son 40, son 40. **No inventes preguntas de relleno.**
- **«No te detengas.»** Pregunta y sigue avanzando en lo que la respuesta no
  bloquea. Si el dueño no está, la duda va a **`docs/dudas.md`** y el trabajo
  sigue.
- **Mergear y desplegar son flujo normal**, no eventos que pidan permiso.
  **La excepción es la Parte 3.**
- **Cambia de opinión con evidencia.** Si encuentras una fuente que contradice
  una decisión suya, **enséñasela**: decide rápido y sin discutir. Pasó ayer con
  la voz — D-077 salió con 3 locales y D-078 la enmendó a 7 el mismo día, porque
  la alternativa que faltaba llevaba en `mc-42` §7 desde el 31 de julio y yo no
  la había puesto sobre la mesa.
- **Mira el tablero de GitHub**, y un issue sin cerrar le dice que no hubo
  avance. **Cierra los issues cuyo criterio esté genuinamente cumplido**, con un
  comentario que diga qué se verificó y qué queda. Ayer dejé 45 abiertos «por
  prudencia» con el código desplegado, y el dueño lo vio en el tablero antes que
  yo: **eso también es mentir, solo que en la otra dirección**.
- **Nunca le pidas permiso para terminar.** Si sabes que falta algo, hazlo.
  Preguntar «¿sigo con X o Y?» al cerrar es pasarle una decisión que era tuya.

---

# PARTE 7 — El orden concreto de arranque

1. **Leer la Parte 1 y la Parte 2 completas.** No negociable.
2. **Correr el gate** y comprobar que `main` está verde **antes** de tocar nada.
   Si sale rojo, mira primero si es un duplicado de iCloud.
3. **Preguntarle al dueño, de forma interactiva**, sobre:
   - El bloqueo de `d1_migrations` (Parte 3) — con los comandos a la vista.
   - Las cuatro preguntas abiertas de `docs/dudas.md` §23.
   - Si `math-challenge-db-eu` se borra o se documenta.
   - Si `bash scripts/sacar-de-icloud.sh --hazlo` se corre ya.
4. **Mientras contesta, empezar por lo que no depende de la respuesta**, en este
   orden de valor para el dueño:
   - **#206** — la racha visible en primaria+. Es lo primero que va a **ver**.
   - **#205** — el sendero de kinder, sin cifras.
   - **#212 #213 #218 #220 #222 #227** — la superficie de misiones.
   - **#268** — extraer `diaEfectivo`/`horaLocal`, que ya no está bloqueado.
   - **#241** — el Workflow del cierre semanal de liga.
5. **Cerrar los issues** conforme sus criterios se cumplan, con evidencia en el
   comentario.
6. **Desplegar y verificar con `live.mjs`** cada vez que algo llegue a `main`.

## Lo que hace falta para cerrar F7, en una frase

**Los motores están todos construidos, probados y auditados; falta la interfaz
de misiones y de racha, el Workflow del cierre semanal de liga, el catálogo de
cosméticos de kinder, y aplicar las migraciones — que hoy es imposible porque el
registro de D1 en producción está desincronizado.**

## Lo que este documento NO hace

No rediseña F7: eso es `docs/planes/f7-juego.md`, que sigue siendo la
especificación. No sustituye a los issues, que traen sus propios criterios de
aceptación. Y **no te exime de leer `CLAUDE.md`**: las ocho líneas rojas están
resumidas aquí, no copiadas.
