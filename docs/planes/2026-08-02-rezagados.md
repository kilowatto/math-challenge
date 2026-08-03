# Rezagados — 2026-08-02

> Revisión de solo lectura pedida por el dueño: *«¿hay trabajo que debería estar
> en este sprint y se está quedando fuera sin que nadie lo note?»*
>
> **Nada de este documento cambió código, issues, ramas ni el tablero.** Toda
> afirmación trae el comando que la reproduce (CLAUDE.md § Git, regla 2). Donde
> no verifiqué, lo digo.

**Corte de datos:** 2026-08-02 ~20:00–21:00 hora local. 16 commits hoy en `main`,
22 issues cerrados, 150 issues abiertos, 188 filas en el tablero.

---

## Resumen: los once, por urgencia

| # | Rezagado | ¿Meterlo a este sprint? |
|---|---|---|
| 1 | GA4/Zaraz corriendo en producción, sin issue | **Sí — hoy mismo** |
| 2 | 28 issues abiertos fuera del tablero, F5c entera incluida | **Sí — es de minutos** |
| 3 | F6 pasó a *In Progress* con 23 preguntas del dueño sin contestar | **Sí — contestar P-19/P-6 antes de codificar** |
| 4 | D-074/D-075 abrieron tres piezas de trabajo que no existen como issue | **Sí, una: el pizarrón** |
| 5 | #136 apunta a un mecanismo que el plan de F6 ya enmienda | **Sí — reescribir el título, es gratis** |
| 6 | Archivos duplicados « 2» reproduciéndose ahora mismo | **Sí — 15 vivos en el árbol** |
| 7 | K12 ofrece un número negativo a un pre-lector, en el 100% de sus ítems | **Sí si kinder vuelve; no si sigue aplazado** |
| 8 | #311 y #313 construidos y nunca cerrados | Sí — verificar y cerrar |
| 9 | #357 y #358 de F5c quizá ya están hechos por el trabajo de hoy | Verificar antes de construir |
| 10 | El plan de F5c y D-073 quedaron desactualizados el mismo día | Corregir el texto, no el plan |
| 11 | La deuda del banco híbrido (D-072) no tiene issue | **No — es deuda futura, basta con dejarla escrita** |

---

## 1. Telemetría de terceros corriendo en producción. Sin issue, sin dueño, sin auditor que la vea

**Qué es.** Cloudflare Zaraz inyecta **Google Analytics 4** (`tid=G-Y6E81PKFYR`)
y el beacon de Cloudflare Web Analytics a nivel de borde, configurado en el
dashboard de la zona y **ausente de todo el HTML fuente**. Lo documentó la
auditoría del sitio público del 2026-08-01 como su hallazgo **§0.1, BUG GRAVE**,
el primero de los diecinueve por gravedad
(`docs/planes/2026-08-01-auditoria-sitio-publico.md:28`).

**Por qué se quedó fuera.** De los 19 hallazgos de esa auditoría, 17 se
convirtieron en issue (#319-#337). **Los dos BUG GRAVE, no.** El §0.1 no es un
cambio de código —es apagar un trigger en el dashboard— y el trabajo que no es
código no encuentra su casilla. `ae73db1` arregló «11 de los 17» y este no
estaba entre los 17.

**Qué lo vuelve urgente.** Sigue vivo hoy, un día después:

```
$ curl -s -o /dev/null -w '%{http_code}\n' https://math.kilowatto.com/cdn-cgi/zaraz/s.js
400
$ curl -s https://math.kilowatto.com/cdn-cgi/zaraz/s.js
Invalid Zaraz parameters      # 400, no 404: el endpoint existe y está configurado
$ curl -s https://math.kilowatto.com/en/ | grep -c "cloudflareinsights\|beacon.min.js"
0                              # por eso live.mjs lo reporta en verde
```

Tres cosas se cruzan aquí y ninguna es cosmética: **contradice D-037** («la
inyección automática del beacon sigue APAGADA»); el `cid` de GA4 **persiste
entre navegaciones**, incluida la página donde un padre escribe su correo, que
es exactamente lo que `mc-25`/`mc-30` sostienen; y **`node audits/live.mjs`
reporta verde** porque busca las cadenas en el HTML servido por `curl`, y Zaraz
no deja texto ahí. No es que el auditor mienta: es un hueco medido de su
comprobación 4c.

**Si sigue esperando.** Cada visita de aquí en adelante sale de la propiedad de
Cloudflare hacia `stats.g.doubleclick.net`. Y el hueco del auditor es peor que
el bug: mientras exista, cualquier auditoría futura va a certificar «cero
terceros» sobre un sitio que sí los tiene, con lo cual el problema deja de ser
descubrible por la vía normal.

*No verificado por mí:* si la zona tiene otros triggers de Zaraz además de esos
dos. Requiere el dashboard, que no toqué.

---

## 2. El tablero no ve 28 issues abiertos — entre ellos, F5c completa

**Qué es.** El tablero tiene 188 filas. Los issues abiertos son 150. **28 de
ellos no están en ninguna fila:**

```
$ gh project item-list 1 --owner kilowatto --limit 400 --format json > /tmp/board.json
$ gh issue list --limit 400 --state open --json number --jq '.[].number' | sort -n > /tmp/open.txt
# cruce → ABIERTOS FUERA DEL TABLERO:
265 266 267 268 269 270 271 272 273 274   ← F8 · límite de pantalla, paraguas + 9
311 313 327 328 330 334 337 366           ← la cola de bugs de hoy y de ayer
350 351 352 353 354 355 356 357 358 359   ← F5c ENTERA, abierta hoy
```

**Por qué se quedó fuera.** Un issue no entra al tablero por existir; hay que
agregarlo. F5c se abrió hoy junto con su plan y nadie corrió ese paso.

**Qué lo vuelve urgente.** El dueño lee «59 Done · 5 In Progress · 124 Todo» y
**la fase que acaba de abrir no está en esos 124**. La única fase que hoy es
ruta crítica es invisible en la herramienta que existe para ver la ruta crítica.
Y `#337` —CSP ausente en `/app/**` y `/api/**`, o sea toda el área privada— es
seguridad, y tampoco aparece.

**Y hay dos issues huérfanos de verdad, no solo del tablero:**

```
$ gh api graphql -f query='...issue(number:350){subIssues{totalCount}}'
350 OPEN subs=0        # el plan dice «Paraguas #350, nueve sub-issues (#351-#359)»
351..359 padre=NINGUNO # ninguno cuelga de él
265 OPEN subs=0        # F8 · límite de pantalla
266..274 padre=NINGUNO
```

Son **las dos únicas excepciones**: #57, #131, #138, #159, #192, #199, #211,
#230, #237, #247, #252, #277 y #286 sí tienen a sus hijos ligados. Sin la liga,
«en progreso» no se puede leer como «3 de 9», que es justo lo que el dueño pide
de una fase.

**Y PR #106 sigue abierto desde el 2026-08-01.** Es el script que sincroniza el
`Status` del tablero con el estado real de cada issue. Sin él, la deriva se
arregla a mano; hoy quedaron dos filas mal:

```
#87  [In Progress] pero CERRADO desde las 01:41
#61  [Done]        pero ABIERTO (Core Web Vitals de campo, sin una semana de beacons)
```

Dos filas es poco. Pero **#61 es la dirección que hace daño**: dice *Done* sobre
trabajo que no está hecho, y ese es el caso exacto que el cuerpo del PR #106
describe como el que miente. Se cerraron 22 issues hoy y nadie corrió el script
porque no está mergeado.

**Si sigue esperando.** Cada día de trabajo mete más filas mal y más issues
fuera. El costo de mergear #106 y agregar 28 filas es de minutos; el de decidir
un sprint con un tablero que subcuenta es de un sprint.

---

## 3. F6 está *In Progress* con 23 preguntas del dueño sin contestar — y una de ellas es la ruta crítica entera

**Qué es.** F6 (#131) se movió a *In Progress* hoy con seis sub-issues
(#132-#137), uno por criterio. Pero `docs/planes/f6-larry-profe.md` cierra con
**23 preguntas al dueño (P-1 … P-23)** y una sección §9 con **12 cosas que el
plan explícitamente no resuelve**. Ninguna de las 23 es un issue.

```
$ grep -c "^\*\*P-" docs/planes/f6-larry-profe.md
23
$ grep -n "^## F6" docs/dudas.md
334:## F6 · Larry Profe — 23 preguntas, agrupadas · 2026-08-01
```

**Por qué se quedó fuera.** El proceso funcionó: las preguntas están escritas y
están en `docs/dudas.md`, que es donde el dueño pidió que vivieran. Lo que no
ocurrió es el paso siguiente — **una pregunta sin contestar no bloquea nada
visible**, así que la fase avanzó a *In Progress* por encima de ellas.

**Qué lo vuelve urgente, y es la parte importante.** La cadena de hoy es:

> D-073 aplaza kinder **porque kinder está bloqueado por F6** → dentro de F6,
> lo que bloquea kinder es **#135, «la voz es la interfaz»** → #135 está
> bloqueado por **P-19/P-6**, que nadie contestó.

Y P-19 no es una preferencia. Es un hecho medido en `f6-larry-profe.md` §4.6 y
en `docs/dudas.md` §21:

- Workers AI tiene 4 modelos de TTS. **Hay voz para en / es-MX / es-ES. No hay
  voz verificada para fr-FR, pt-BR, pt-PT ni de-DE — 4 de los 7 locales.**
- MeloTTS falló **5 de 18 llamadas (27.8%)** y su fonología `DE`/`PT` no se pudo
  verificar.
- **`aura-2-es` acepta texto ALEMÁN sin error** y devuelve audio: un bug de
  ruteo daría una voz segura pronunciando disparates, y ninguna prueba
  automática lo caza.

La consecuencia está escrita: generar la voz **fuera de Cloudflare, en tiempo de
compilación**, es lo único que hoy cubre los siete locales — y eso **no lo
autoriza ninguna decisión**. D-035 dice «solo Cloudflare». El argumento honesto
existe (CLAUDE.md § Imágenes ya autoriza Recraft y Gemini fuera de Cloudflare
para generar arte; si el audio es arte, aplica el mismo permiso), **pero es del
dueño, no mío**.

**Si sigue esperando.** #135 no se puede empezar, y como #135 bloquea kinder,
kinder no vuelve. F5c compra tiempo — no destraba nada. Cada semana sin
contestar P-19 es una semana en la que el producto tiene contenido para primaria
y **ningún camino** de vuelta a la banda que el master-plan llama ruta crítica.

**Recomendación:** contestar P-19/P-6 antes de escribir una línea de F6, y
abrir issue solo para las preguntas cuya respuesta cambie el diseño (P-1, P-6,
P-15, P-18, P-19, P-20). Las otras 17 pueden esperar dentro de la fase.

---

## 4. D-074 y D-075 abrieron tres piezas de trabajo que no existen en ningún lado

Las tres están **nombradas en las decisiones de hoy** como cosas que no existen.
Ninguna tiene issue.

**a) El juicio por paso, del motor.** D-074 resuelve la tensión con la línea
roja #7 diciendo que **el veredicto deja de ser un booleano**: el motor emite un
juicio **por paso**, determinista y del lado del servidor, y Larry lo explica.
Eso es una firma nueva en `packages/motor`. Y el plan de F6, escrito **antes**
de D-074, ya lo había marcado como hueco (§9.3): *«o el veredicto trae los pasos
precomputados por el motor —que nadie ha diseñado— o el peldaño 3 no puede
existir en vivo sin cruzar la línea roja #7»*. **D-074 acaba de convertir ese
hueco en requisito.**

**b) Los métodos de entrada matemática (`mc-23`).** D-074 §1: *«Tocar opciones
no basta. `mc-23` cubre los métodos de entrada matemática por dispositivo. Es
trabajo de interfaz, no de Larry, y no existe.»* Confirmado: cero issues.

**c) El pizarrón en línea.** D-075 cierra diciendo que **el pizarrón resuelve el
mismo problema sin tocar ninguna línea roja**, y que el dueño quiere **primero
el pizarrón y después la foto**. Cero issues:

```
$ gh issue list --state open --limit 400 --search "pizarr in:title,body"
(vacío)
$ gh issue list --state open --limit 400 --search "mc-23 in:title,body"
(solo falsos positivos de F7)
```

**Qué lo vuelve urgente.** D-075 es **la primera enmienda a una de las ocho
líneas rojas**, y se aceptó porque sin alguna entrada D-074 no se puede cumplir.
El dueño dijo explícitamente que **el pizarrón va primero**. Si la única pieza
que se construye es la cámara, la enmienda —que se escribió estrecha a
propósito, con candado— se vuelve el camino principal en vez del de excepción,
que es exactamente lo que el candado existe para impedir.

**Si sigue esperando.** No pasa nada esta semana: nada de esto es de las bandas
que hoy tienen contenido. Lo que sí se degrada es el orden: dentro de un mes
nadie recordará que el pizarrón iba primero, y la enmienda se habrá generalizado
sola.

**Recomendación:** abrir issue **solo para el pizarrón**, hoy, para fijar el
orden por escrito. (a) y (b) pertenecen a la fase que los use y no urge.

*También sin issue, y lo dejo anotado sin recomendarlo:* los tres puntos que
D-075 §«lo que abre» declara sin decidir — almacenamiento de imágenes de usuario
frente a D-013, qué pasa si en la foto sale un menor, y los auditores. Nota
verificada: **hoy ningún auditor de `audits/` menciona `getUserMedia`**
(`grep -rln getUserMedia audits/` solo da `adversarial/cartas.mjs` y un SARIF
simulado), así que el punto 3 de D-075 describe un auditor que todavía no
existe.

---

## 5. #136 apunta a un mecanismo que el propio plan de F6 ya enmienda

**Qué es.** El título de #136 es *«Tope de gasto por perfil y por día vía AI
Gateway»*, que copia D-015. Pero `f6-larry-profe.md` §5.1 concluye que el
limitador real vive en el **Durable Object** (`math-challenge-ratelimiter-do`),
porque el Gateway sabe frenar pero no sabe **degradar con criterio pedagógico**,
y anota que **eso enmienda D-015, no la precisa** — es la pregunta **P-15**.

**Por qué se quedó fuera.** El issue se generó del criterio de la fase; el plan
se escribió después y la contradicción no volvió sobre el issue.

**Qué lo vuelve urgente.** Es el caso literal de «issue apuntando a algo que ya
no es cierto». Quien tome #136 sin leer el plan construye el mecanismo que el
plan descartó. Cuesta un minuto arreglarlo.

**Si sigue esperando.** Trabajo hecho dos veces, y una enmienda a D-015 que
nunca llega al dueño.

---

## 6. Los archivos duplicados « 2» se están reproduciendo ahora mismo

**Qué es.** `ae73db1` documentó que **193 archivos duplicados** (`de-DE 2.json`,
`0001_identity 2.sql`, …) rompían `locales-complete`, `migration-safety` **y el
build**, y que se movieron a un directorio temporal en vez de borrarse. No se
abrió issue, no se escribió auditor, y la causa —varias sesiones escribiendo los
mismos archivos— sigue igual.

**Qué lo vuelve urgente.** Están volviendo. Al empezar esta revisión había 8; al
terminarla, 15:

```
$ git status --porcelain | grep -E '^\?\? ' | grep -E ' [2-9]( |\.|")' | wc -l
15
?? ".githooks/pre-commit 2" … " 5"        ?? "apps/web/public/.assetsignore 2" … " 5"
?? "apps/web/public/_headers 2"           ?? "apps/web/public/favicon 2.ico"
?? "apps/web/public/robots 2.txt"         ?? "audits/script-cliente-sin-ts 2.mjs"
?? "audits/sitemap-completo 2.mjs"        ?? "wrangler 2.jsonc"
?? "docs/research/2026-08-02-auth-completa 2.md"
```

`wrangler 2.jsonc` y `robots 2.txt` son especialmente feos: un duplicado del
archivo de configuración de despliegue y uno del `robots.txt` cuyo arreglo es
`#330`, todavía abierto. Y **ningún auditor de los 53 los detecta**
(`ls audits/*.mjs | wc -l` → 53; ninguno cruza nombres duplicados).

**Si sigue esperando.** Vuelve a 193 y vuelve a romper tres auditores y el
build, y la próxima vez alguien pierde la tarde buscando por qué
`locales-complete` falla en un locale que está perfecto. Es la clase de fallo que
`da96f20` describe: *«lo que falló no fue el arreglo, fue que nada lo comprobaba
otra vez»*.

**Recomendación:** un issue y un auditor de tres líneas. Es el rezagado más
barato de toda esta lista.

---

## 7. K12 le ofrece un número negativo a un niño de cuatro años, en el 100% de sus ítems

**Qué es.** `packages/motor/src/banco-kinder.ts:179` genera el distractor
`{ valor: b - a, causa: "error.resto_al_reves" }`, y `parametros()` recorre
`b ∈ [1, a-1]`, o sea **`b < a` siempre**. El distractor va de −9 a −1. El plan
de F6 §4.7 lo midió: **45 de 185 ítems, el 100% de K12**, y lo mandó «a F5 como
bug de ítem, antes que a F6 como clip que nunca suena».

```
$ sed -n '176,190p' packages/motor/src/banco-kinder.ts   # el distractor y el rango de b
$ gh issue list --state all --limit 400 --search "negativo"   # ningún issue lo nombra
```

**Por qué se quedó fuera.** Quedó como **P-9** en `docs/dudas.md`, es decir como
pregunta al dueño, no como bug. Y #155 (K12) es un issue de **contenido** — «119
ítems desde 6 plantillas» —, no de defecto: quien lo tome va a generar más
ítems, no a arreglar el distractor.

**Qué lo vuelve urgente.** Es de la misma familia que los cinco fallos que el
dueño encontró hoy en quince minutos con su teléfono (#345/#347/#348/#349/#361):
opciones que un pre-lector no puede contestar. Este sobrevivió a esa ronda porque
`b - a` **es un número**, y los auditores buscaban cadenas.

**Si sigue esperando.** Mientras kinder esté aplazado por D-073, no le llega a
nadie. En el momento en que kinder vuelva, vuelve con él.

**Recomendación:** issue sí; sprint **solo si kinder vuelve a este sprint**. Con
D-073 vigente, no.

---

## 8. #311 y #313: construidos, mergeados, y nunca cerrados

```
$ git log --oneline --all | grep -E "#311|#313"
5310d35 content: kinder bank 344 -> 653 items, and change-password from inside (#313) (#314)
2a0a25d feat(app): the adult home — a signed-in parent had nowhere to go (#311) (#312)
$ gh issue view 311 --json state   # OPEN
$ gh issue view 313 --json state   # OPEN
```

**Por qué se quedó fuera.** Es el efecto secundario correcto de una regla
correcta: en este proyecto **nunca se escribe `close #N` en un PR** porque
GitHub cierra el issue igual, así que el cierre es manual — y el paso manual se
saltó. Ninguno de los dos está en el tablero (ver §2), así que tampoco había
fila que moviera nadie.

**Si sigue esperando.** El siguiente que lea la lista de abiertos vuelve a
construir la casa del adulto.

**No verificado por mí:** #311 pide dos cosas —casa y **marcar el dispositivo**—
y solo confirmé que existe el código de dispositivos (`household_devices`/`mc_h`
en `lib/sesiones.ts`, `api/casa.ts`, `app/signin.astro`). **No lo ejercité.** Si
la segunda mitad no está, el issue no se cierra: se parte.

---

## 9. Dos criterios de F5c quizá ya están hechos por el trabajo de hoy

Vale la pena mirarlos **antes** de asignarlos, porque construir algo que ya
existe es la forma cara de descubrirlo.

**#357 — «Se puede corregir una respuesta, y corregir no baja el resultado».**
Es #348, que se cerró hoy en `b38e653`: tocar selecciona, se cambia de opinión
las veces que se quiera, y **nada sale al servidor hasta confirmar**. El arreglo
vive en `components/reto/Pantalla.astro`, y `/app/practicar/` —la superficie de
F5c— **importa ese mismo componente**:

```
$ grep -rn "Pantalla" apps/web/src/pages/
apps/web/src/pages/[locale]/app/practicar.astro:50:  import Pantalla from "../../../components/reto/Pantalla.astro";
apps/web/src/pages/[locale]/app/kids/jugar.astro:64:  import Pantalla from "../../../../components/reto/Pantalla.astro";
```

**#358 — «Auditor: ninguna opción de respuesta es una cadena que no exista en
i18n».** `audits/opciones-contestables.mjs` se construyó hoy (`da96f20`) y se
reescribió el mismo día (`8aadc51`). Su comprobación 5 exige que
`dibujos[].clave` resuelva **en los siete catálogos de `i18n/reto`**, que es
buena parte de lo que #358 pide.

**No verificado por mí:** que #357 se cumpla de punta a punta para PRIMARIA
—solo confirmé que es el mismo componente, no el comportamiento— ni que #358
quede completo; el propio `8aadc51` dice que el auditor **no** revisa los campos
`valor`/`texto` de una opción, solo el sub-objeto `dibujo`. Es probable que #358
quede reducido a media tarea, no a cero.

---

## 10. El plan de F5c y D-073 quedaron desactualizados el mismo día en que se escribieron

**Qué es.** El plan (`07d91f6`, y D-073) argumenta saltarse kinder con dos
razones. La segunda es una tabla: *«de los cinco formatos, exactamente uno
funciona hoy»* — `flash` no dibuja, `toca_para_contar` dibuja patos,
`arma_el_numero` es un borrón, `cual_sobra` ofrece `casilla3`. Y cierra con
*«Kinder sigue roto: #345, #347 y #349 siguen abiertos»*.

**Horas después, `b38e653` arregló los cinco y cerró #345, #347, #348, #349 y
#361:**

```
$ gh issue list --state closed --json number,closedAt --jq '.[]|select(.number>=345)'
345 2026-08-03T00:29   347 2026-08-03T00:29   348 2026-08-03T00:29
349 2026-08-03T00:29   361 2026-08-03T00:29
```

**Qué cambia y qué no.** **La decisión sigue siendo correcta**: la razón 1
—kinder está bloqueado por el audio, `mc-20` marca su ausencia como antipatrón,
no como carencia— es la que sostiene D-073, y esa no la tocó nadie. Lo que se
cayó es la razón 2 y el párrafo de «lo que no resuelve».

**Si sigue esperando.** El riesgo no es técnico, es de lectura: dentro de un mes
alguien abre el plan, ve «cuatro de cinco formatos rotos», y toma una decisión
de prioridad con datos de una tarde que ya no existe.

**Recomendación:** corregir el texto del plan, no el plan. No es sprint.

---

## 11. La deuda del banco híbrido (D-072) no tiene issue — y está bien así

**Qué es.** D-072 pone el banco de primaria en D1 y deja kinder en
`banco-kinder.ts`. La decisión **nombra su propia deuda**: *«dos fuentes para el
mismo tipo de ítem es deuda desde el día uno. La forma de que no se pudra es que
KINDER migre después; si en seis meses sigue siendo la excepción, la excepción
se volvió la regla.»* No hay issue de «migrar kinder a D1».

**Por qué NO lo recomiendo para este sprint.** El disparador que la propia
decisión fija es **seis meses**, no ahora. Abrirlo hoy pone en la lista una tarea
que no se puede empezar —#351, el esquema D1, ni siquiera existe todavía— y una
lista con tareas imposibles es una lista que se deja de leer. **La decisión ya
está fechada en `decisions.md`, que es el mecanismo correcto para una deuda con
fecha de vencimiento.**

---

## Lo que parece rezagado y no lo es

Un informe que solo encuentra problemas es un informe que no filtró. Estas cinco
las revisé y **están bien donde están**:

1. **La deuda de `validarItem` sí tiene issue.** `8aadc51` la declaró —«lo
   llama nadie excepto su propia prueba unitaria»— y **#366 existe**, abierto
   hoy. La tríada funcionó; es el contraejemplo de todo lo demás en esta lista.

2. **CLAUDE.md sí se enmendó con D-075.** Esperaba encontrar la línea roja #1 en
   su forma absoluta y no es así:
   `grep -n "Nunca cámara" -A3 CLAUDE.md` → líneas 28-31, ya dice *«para un
   menor»* y marca la enmienda. La decisión llegó a los dos documentos.

3. **Las 124 filas Todo de F7 y F8 (#192-#292) no son un rezagado.** Están
   correctamente aparcadas: D-034 ancla «MVP terminado» a que kinder esté
   completo (#167 lo dice como criterio), y el plan de F5c avisa por escrito que
   cuatro retos sin racha ni progresión prueban si el reto funciona, **no** si
   alguien vuelve mañana. Meterlas al sprint sería el error.

4. **`/reto-demo/` roto (el otro BUG GRAVE, §0.2) está en vuelo ahora mismo.** El
   árbol tiene `apps/web/src/pages/[locale]/reto-demo.astro` modificado y
   `audits/script-cliente-sin-ts.mjs` sin seguir — o sea, alguien está
   escribiendo el arreglo **y** su auditor. No hace falta issue; hace falta que
   ese trabajo aterrice.

5. **F5 kinder (#138, 19 sub-issues abiertos) en *In Progress* no está
   estancado, está aplazado a propósito** por D-073, tomada hoy y por escrito. La
   fila del tablero es engañosa, pero eso es el §2, no un problema de F5.

---

## Lo que NO comprobé

Para que nadie lo lea como verificado:

- **No corrí ningún auditor, ni `astro build`, ni `wrangler deploy`.** Dos
  sesiones están construyendo F6 en este checkout; correr el gate habría pisado
  su árbol. Todo lo que digo de los auditores sale de leer su código y los
  cuerpos de commit de hoy.
- **No abrí ni modifiqué ningún issue, PR, rama ni fila del tablero.**
- **No verifiqué el dashboard de Cloudflare** (§1): solo el comportamiento
  observable desde fuera con `curl`.
- **No ejercité** la mitad «marcar el dispositivo» de #311 (§8), ni el
  comportamiento de corrección de respuesta en PRIMARIA (§9). En ambos confirmé
  que el código existe y de dónde se importa, nada más.
- **No revisé** #327 (LCP fuera de presupuesto), #328 (36/282 documentos del
  corpus con hallazgo), #330 (robots.txt) ni #334 (5 huecos menores de a11y/i18n)
  más allá de constatar que siguen abiertos y fuera del tablero.
