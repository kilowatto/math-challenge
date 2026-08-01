# F6 · Larry Profe — plan consolidado

> **Fecha:** 2026-08-01 · **Estado del repo al medir:** rama `main`, `HEAD = 1d54fde`.
>
> Consolida seis diseños de F6 y sus seis críticas adversariales en un solo
> documento para construir **sin volver a decidir nada** — salvo lo que aparece
> en §8, que es del dueño y va a `docs/dudas.md`.
>
> **Regla de este documento:** todo número dice de dónde sale. `[medido]` = se
> re-ejecutó hoy contra este repo y el comando está escrito. `[leído]` = está en
> un archivo o en una decisión, con línea. `[estimado]` = criterio de quien
> escribió el diseño; se puede negociar, y ningún argumento cuelga solo de él sin
> decirlo.

---

## 0. Lo que se midió hoy, antes de escribir nada

Seis diseños y seis críticas discrepan entre sí sobre el estado del banco. Se
re-ejecutó (`npx tsx` sobre `packages/motor/src/banco-kinder.ts` con
`generarBanco()`):

| Hecho | Valor `[medido]` |
|---|---|
| Ítems que produce `generarBanco()` | **185** |
| Habilidades con ítems | **8 de 14** (K01 3, K02 3, K03 10, K04 10, K07 45, K10 44, K11 25, K12 45) |
| Niveles cubiertos | **1 y 2** (61 y 124). Kinder vive en N1–N3 |
| `SIN_PLANTILLA` (`banco-kinder.ts:325`) | **6**: `K05, K06, K08, K09, K13, K14` |
| Formatos | `toca_la_respuesta` 70, `cual_sobra` 45, `arma_el_numero` 44, `toca_para_contar` 20, `flash` 6 |
| Causas distintas que el banco produce | **14** |
| Claves autoradas en `apps/web/src/i18n/reto/*.json` | **17** por locale (15 `error.*` + `acierto` + `inesperada`), × 7 locales |
| Causa autorada que ningún ítem produce | **`error.eligio_al_azar`** (huérfana) |
| Pares `(habilidad, causa)` alcanzables | **18** (K01/K02 comparten `error.subestimo`; K03/K04 comparten `error.se_salto_uno`) |
| Ítems con **un solo** error nombrado | **46 de 185** |
| Ítems con `tambienCorrectas` | **0** — la vía de D-048 está sin ejercer |
| Distractores con valor negativo | **45** (el 100% de K12; `banco-kinder.ts:132` pone `b − a` con `a > b` forzado) |
| Banco serializado | 95,012 B · 513.6 B/ítem |
| Peso de los 7 `reto/*.json` | 11,999 B crudo · 4,705 B gzip como 7 archivos · 2,774 B gzip / 2,423 B brotli como un paquete |

**Corrección a una crítica.** La crítica de `voz-kinder` afirma «270 ítems, 9
habilidades, `SIN_PLANTILLA` en la línea 432 con cinco entradas y sin K13». Contra
`HEAD = 1d54fde` eso es **falso**: son 185 ítems, 8 habilidades con ítems, la
constante está en la **línea 325** y tiene **seis** entradas, **K13 incluida**.
Los números del diseño de `voz-kinder` son los correctos; los de su crítica, no.

**Confirmaciones a las críticas que sí resistieron:** los 46 ítems con un solo
error, los 18 pares `(habilidad, causa)`, los 45 distractores negativos, los 0
`tambienCorrectas`, y las filas rotas de `docs/infrastructure.md` (líneas 38, 49,
69 hablan de Claude y de `ANTHROPIC_BASE_URL`; la **línea 72** inventaria
`math-challenge-tutor-usage-ae` como telemetría **«per-child, per-model»**).

---

## 1. El contrato en una página

### 1.1 Lo que existe hoy

`packages/motor/src/item.ts` ya produce el veredicto y `apps/web/src/pages/api/reto.ts`
ya lo devuelve `[leído]`:

```ts
export interface VeredictoDeItem {
  acc: 0 | 1;
  causa: string | null;        // clave de mensaje, no frase
  razonAlterna: string | null; // D-048: por qué la alterna también vale
  inesperada: boolean;         // ni correcta ni error previsto
}
```

`POST /api/reto` responde `{ acc, causa, razonAlterna, inesperada, habilidad }`,
acota `eleccion` a **32 bytes** (`reto.ts:49`, «la línea roja #3 hecha límite de
bytes») y **no tiene auth, ni sesión, ni rate limit** — hoy es un oráculo de
respuestas para cualquiera que itere valores hasta `acc: 1`. Eso es un hallazgo de
la crítica de `contrato-veredicto`, es cierto, y **bloquea** el tope por perfil
(§5) porque no hay perfil que contar.

### 1.2 El sobre: `SobreParaLarry`

Vive en `packages/motor/src/sobre.ts`. **Lista blanca escrita a mano**, no un
tipo derivado del ítem — con `Omit<Item, …>` un campo nuevo en `Item` viaja solo,
y el día que alguien agregue `item.pista` llega a Larry sin que nadie lo decida.

**Once campos.** (El diseño original decía «diez campos» y listaba once; en una
decisión cuyo argumento entero es la lista blanca, el conteo cuenta.)

```ts
export interface SobreParaLarry {
  acc: 0 | 1;
  causa: Causa | null;          // unión cerrada, ver §1.4
  razonAlterna: RazonAlterna | null; // ver la pregunta P-8
  inesperada: boolean;
  habilidad: HabilidadKinder;   // CLAVE ("K10"), jamás la etiqueta
  banda: Banda;
  locale: Locale;
  formato: Formato;
  proposito: Proposito;
  intentoEnEsteItem: number;    // ver la pregunta P-4 — está en disputa
  pidioAyuda: boolean;
}
```

### 1.3 Lo que Larry JAMÁS recibe, y por qué cada uno

| Campo | Por qué no |
|---|---|
| `item.respuesta.valor` | Revela la respuesta antes de tiempo. `mc-11` §LLM documenta ese modo de falla en MathDial/MathTutorBench. Si Larry no la tiene, no la puede soltar. |
| `item.enunciado.vars` | Son los operandos. Sin operandos no hay aritmética que hacer. |
| `eleccion` | `causa` ya nombra el error; el número del niño en el prompt es un número que Larry puede operar. |
| `item.errores[]` completo | Nombraría errores que el niño no cometió. `mc-11` §5 (Shute): el exceso de elaboración satura y perjudica. |
| `rtMs`, puntos, racha, liga, posición | Dos líneas rojas a la vez. Con el tiempo, Larry dice «tardaste un poco» — el cronómetro por la puerta de atrás, contra D-024/D-045. Con puntos o comparación, el feedback se mueve al nivel «yo», que es el tercio de intervenciones que Kluger & DeNisi (607 tamaños de efecto) midió **empeorando** el desempeño. |
| `childProfileId` | Línea roja #2 y D-037. |
| **La etiqueta de habilidad** | `HABILIDADES_KINDER.K10` es literalmente **«descomponer (5 = 2+3)»**: tres operandos y una igualdad. Viaja la **clave**, nunca el valor del diccionario. Hallazgo de la crítica; se acepta entero. |

### 1.4 Cuatro cosas que hacen la regla imposible, no desaconsejada

1. **`packages/tutor/` no puede nombrar el tipo `Item`.** No tiene `item.ts` ni
   `banco-kinder.ts` en su grafo de dependencias, y `audits/larry-sin-item.mjs`
   bloquea el commit si aparece ese import. Es el patrón de `puntuacion.ts:37`
   (dejar KINDER fuera de `PARAMETROS` hizo que el bug de `a = 0` no se pueda
   volver a escribir).
2. **`ErrorNombrado.causa` deja de ser `string`.** Hoy `item.ts:37` lo declara
   `string` `[leído]`, así que nadie impide escribir `causa: "el niño es lento"` y
   que eso llegue al prompt. Pasa a ser `type Causa = keyof typeof CATALOGO_DE_CAUSAS`.
3. **El sobre se sella en el servidor** (`Ingest.sobreParaLarry()`), y Larry se
   llama desde el servidor. El navegador nunca compone el prompt ni elige modelo.
   `banda` y `locale` vienen del perfil en la cuenta del padre, no del ítem
   (`mc-37` impl. 4: el locale se pasa como parámetro, jamás se infiere del texto).
4. **Compuerta determinista a la salida** (§2.4): la respuesta se descarta si
   contiene un dígito, o la palabra-número —en el locale del sobre— de cualquiera
   de los ≤5 valores del ítem, o un operador prohibido para ese locale.

### 1.5 `inesperada: true` — y por qué no es un caso raro

`inesperada` degrada a **explicación por HABILIDAD**, nunca a explicación del
error: `causa: null` y el prompt sin hueco donde una causa pueda aparecer. No hay
causa nombrada, así que no hay nada que explicar sin inventarlo. Lo que sí se
puede decir sin inventar: reconocer sin avergonzar, re-enseñar el **procedimiento**
de `habilidad`, y ofrecer volver a intentar.

**Pedirle al modelo que clasifique el error no previsto queda descartado:** para
saber que 12 salió de multiplicar 3×4 hay que multiplicar 3 por 4. Y sería el
único camino por el que los operandos tendrían que entrar al sobre — la excepción
se comería la regla.

**El diseño decía que en kinder `inesperada` «casi nunca ocurre por construcción».
Es falso y está medido.** `toca_para_contar` k03-1 (n=1) tiene `respuesta.valor: 1`
y dos errores (`0`, `2`): un niño de cuatro años que toca **tres** veces produce
`inesperada: true` — no es cliente manipulado, es el gesto normal del formato.
**46 de los 185 ítems tienen un solo error nombrado** `[medido]`. En kinder,
`inesperada` es frecuente, y eso derrumba tres cosas del diseño original: que la
capa 2 en kinder no tenga disparador, que el gasto en kinder sea cero, y el
umbral de curaduría. **Consecuencia asumida:** la explicación por habilidad no es
la excepción, es un camino frecuente, y `mc-11` §87 lista «re-enseñanza larga de
material ya dominado» entre las formas contraproducentes de feedback. La ruta
por habilidad necesita variantes (§6.2) o se vuelve una máquina que no escucha.

### 1.6 Presupuesto de latencia: tres eventos, y el veredicto nunca espera

| Evento | Objetivo | De dónde |
|---|---|---|
| **T0** toque → marca visual + chime | ≤150 ms INP · chime ≤500 ms | D-030 y `mc-47` §4 `[leído]`; `mc-42` impl. 1 `[leído]` |
| **T1** veredicto + explicación pregenerada visible | ≤300 ms p75; **0 ms de red en kinder** | `[estimado]`. `calificarRespuesta` es un barrido sobre ≤5 errores; T1 es red y solo red. Falta medirlo con `audits/live.mjs` |
| **T2** Larry en vivo (si aplica) | primer token ≤1.2 s · completo ≤4 s | `[estimado]`, anclado en D-035 |
| **T3** audio sonando (kinder) | **sin presupuesto** | Hueco reconocido. Ver §4.5 |

**Honestidad sobre T2.** D-035 midió `gpt-oss-120b` 1.1 s y `kimi-k2.6` 8.9 s
`[leído]`, pero eso fue una **prueba de esquema con prompt de auditor y
`max_tokens` 24,000**, no un time-to-first-token de un prompt de tutor. Como cota
de latencia total puede ser pesimista; como cota de primer token puede ser
**optimista**. Hay que remedirlo con el prompt real antes de fijar T2 en ningún
documento.

**Lo que sí está cerrado:** el veredicto **jamás** espera a Larry. NN/g, citado en
`mc-20` §7: los niños pequeños esperan retroalimentación en cada acción, y el
silencio tras un toque se lee como «roto», no como «pensando». Y `mc-11` §4: un
meta-análisis de 51 estudios no halla diferencia media entre feedback inmediato y
diferido, pero el inmediato sí sube la confianza en práctica por computadora. Lo
inmediato es el veredicto; la elaboración puede llegar después.

---

## 2. Lo que Larry nunca dice

### 2.1 La carta del nunca

**Elogio**

| # | Nunca | Razón |
|---|---|---|
| 1 | Elogia la **capacidad**: «qué listo eres», «eres un genio», «se te dan las matemáticas» — ni su negativo, «no eres de números» | Mueller & Dweck (1998, seis estudios), `mc-11` §6 `[leído]`: tras un fracaso posterior, **92%** de los elogiados por esfuerzo eligió el rompecabezas más difícil, contra **33%** de los elogiados por inteligencia. El elogio a un rasgo fijo hace que el siguiente fallo se lea como que el rasgo falló. **Ésta es la contraintuitiva:** casi todo el mundo cree que es lo amable que hay que decir |
| 2 | Elogio **inflado**: superlativos, exclamaciones apiladas, «¡perfectísimo!» para un acierto rutinario | Brummelman et al. (2014/2017): el elogio inflado predice **menor** autoestima con el tiempo. El genuino y proporcionado no produce ese efecto |
| 3 | Elogio pegado a la retroalimentación de tarea en la misma frase («¡Correcto, qué inteligente!») | Hattie & Timperley: el nivel «yo» es el más débil de los cuatro y **diluye** a los otros tres cuando va en el mismo mensaje |
| 4 | Elogio **fabricado** cuando no hay nada verdadero que elogiar («¡buen intento!» sobre una respuesta al azar) | Es lo que produce el tope de longitud aplicado a «encuentra algo bueno aunque todo estuviera mal» |

**Comparación y conteo**

| # | Nunca | Razón |
|---|---|---|
| 5 | Compara con otro niño, con un promedio, con «niños de tu edad» o con un salón | Kluger & DeNisi (607 tamaños de efecto, 23,663 observaciones, d=0.41 medio): **más de un tercio** de las intervenciones **empeoró** el desempeño, y el mecanismo es el desvío de la atención al «yo». `mc-11` impl. #10 nombra la retroalimentación normativa |
| 6 | Nombra cuántas veces se ha fallado: «otra vez», «de nuevo», «llevas tres», «como la vez pasada» | Es conteo de fallas dicho en voz alta. Se cierra por esquema, no por redacción (§2.3) |
| 7 | Menciona tiempo, velocidad o lentitud a un niño de kinder | D-024/D-045: el tiempo se mide para anti-trampa pero «el niño no lo ve, no lo oye, y no le cuesta puntos». `mc-10` §2 (Ashcraft): los mismos problemas no producen efecto de ansiedad en papel sin reloj y sí bajo reloj |
| 8 | Minimiza el ítem fallado: «era fácil», «sencillo», «obvio», «solo te faltaba» | Si era fácil y fallé, el problema soy yo |
| 9 | Se disculpa por el niño o excusa el ítem | Igual |

**Tono, forma y momento**

| # | Nunca | Razón |
|---|---|---|
| 10 | Sarcasmo, ironía, exasperación, decepción — ni suavizados («mmm…», «uy», «casi, casi») | Regla dura heredada del canon de Larry (`mc-37` §prompt) |
| 11 | «Mal» / «incorrecto» sin dar el siguiente paso | Shute (`mc-11` §5): KR desnudo es de los tipos más pobres. `audits/retro-completa.mjs` líneas 84-100 ya exige **exactamente dos frases** `[leído]` |
| 12 | Re-enseña largo lo que el niño ya domina | Shute: el exceso de elaboración satura la memoria de trabajo |
| 13 | Revela la respuesta o el método mientras el intento sigue abierto | «telling@k» (MathDial, `mc-11` §8). **Y por diseño no puede: Larry no tiene la respuesta.** Si alguna vez se revela, la revela el **motor**, no Larry |
| 14 | Predica mindset de crecimiento como consuelo rutinario | `mc-10` §4: d=0.08, concentrado en bajo desempeño y condicionado al contexto social. Dicho justo tras fallar, se lee como consuelo — o sea, como confirmación de que hubo algo que consolar |
| 15 | Le pide al niño que escriba, o le habla por su nombre | Líneas rojas #3 y #2, y D-013: no hay nombre que usar porque nunca se pidió |

**Aritmética**

| # | Nunca | Razón |
|---|---|---|
| 16 | Produce un número, un paso, una operación o un veredicto que no venga del sobre | Línea roja #7. Precedente con archivo:línea: `src/larry/contador/explain.ts:67-75` en IOS — «Every number MUST appear verbatim in the provided JSON. Never compute, convert, round, or invent a figure», temperatura 0 (`mc-37`) |

**No verbal**

| # | Nunca | Razón |
|---|---|---|
| 17 | El estado `denying` del avatar ante un niño. Las correcciones usan `thinking → presenting` | `mc-37` §6 e impl. #9: el lenguaje corporal de negación (`larry.css:87-98` en IOS) se lee como «estás mal», y ese componente se reusa tal cual. Es la única prohibición que un auditor de **texto** no ve |

### 2.2 La celebración vive en la animación y el sonido

El texto de acierto es **confirmación, no elogio**, y no varía con la dificultad
ni con la velocidad. Hoy es una sola cadena en los siete locales `[medido: clave
`acierto`]`. El afecto lo cargan el estado del avatar y el audio, no los adjetivos.

Un pool de líneas celebratorias («¡esa estaba difícil y la sacaste!») reintroduce
a la vez la atribución de capacidad, el elogio inflado de Brummelman **y** el
comentario sobre la dificultad que la prohibición #8 veta en su forma negativa.
Si «Eso es.» se siente repetitivo, la respuesta es más variedad de animación y
sonido —que no puede avergonzar a nadie— no más adjetivos sobre el niño.
**Está en disputa: es la pregunta P-11.**

### 2.3 La falla repetida no se maneja: se impide

El enunciado de esta dimensión es una trampa. En el quinto intento **no existe
ninguna frase que no suene condescendiente**, porque el problema ya no es qué se
dice sino que se siga sirviendo el mismo ítem. Todo tutor que suena
condescendiente llegó ahí escalando el lenguaje en vez de ceder la situación.

**Escalera de cuatro peldaños:**

| Peldaño | Qué sirve |
|---|---|
| 1 · primera falla | Texto fijo de la causa, dos frases (qué pasó, siguiente paso). **Ya existe** |
| 2 · segunda | El **mismo** ítem con andamiaje concreto (fichas/objetos, `mc-03` CPA) y otra frase de siguiente paso. **Cambia el material, no el discurso sobre el niño** |
| 3 · tercera | Ejemplo trabajado + un ítem **gemelo**, no el mismo |
| 4 | El ítem sale de la sesión y el motor baja a la habilidad prerrequisito |

**Base:** `mc-10` §8 (Bjork) — la dificultad solo es deseable por encima de un
piso de conocimiento previo; sin ese piso el estudiante atribuye la confusión a
su propia falta de aptitud. La respuesta pedagógicamente correcta a la quinta
falla es **bajar**, y tiene que ocurrir **antes** de que la vergüenza se acumule.
`mc-11` §7 (VanLehn): la retroalimentación por paso llega a d≈0.76 contra d≈0.40
de la que solo mira la respuesta final — por eso los peldaños 2 y 3 cambian el
andamiaje y no el adjetivo.

**Los topes (3 servidas por ítem/sesión, 4 fallas por habilidad, ≥24 h de
descanso) NO se adoptan en este plan.** Son `[estimado]` sin ninguna fuente, y
tres críticas independientes muestran que rozan la línea roja #4 y chocan con
D-019 (la Sabana es una cadena de desbloqueo: pausar una habilidad deja el lugar
siguiente bloqueado, y bajar al prerrequisito sobre un mapa con orden de
desbloqueo **se ve** como ir hacia atrás, aunque el texto no lo diga). **Es la
pregunta P-12.**

**El descenso, si ocurre, es lateral en la ficción:** la Sabana se mueve a otro
lugar del mapa (D-019). Larry no dice «vamos a algo más sencillo» — eso es
honesto con un adulto y es una degradación anunciada para un niño de cinco años.
La honestidad va donde puede procesarse: **el panel del padre sí dice
literalmente qué habilidad se pausó y por qué.**

### 2.4 Cómo se comprueba mecánicamente

**Lo que ya existe** `[leído]`: `audits/retro-completa.mjs` — importa el banco,
exige que toda causa producida tenga texto en los siete locales, que toda clave
`error.*` y la clave `inesperada` sean **exactamente dos frases** no vacías, y
corre un regex único `ELOGIO_A_LA_CAPACIDAD` con las palabras de los cinco idiomas
mezcladas (líneas 107-108). El propio auditor declara en su encabezado que **no
puede comprobar si el texto es bueno**.

**Lo que F6 añade:**

| Auditor | Qué vigila | Capa |
|---|---|---|
| `larry-sin-item.mjs` | `packages/tutor/` no importa `item.ts` ni `banco-kinder.ts`; ninguna etiqueta de `HABILIDADES_KINDER[...]` se renderiza en un prompt | grafo de dependencias |
| `larry-lexico.mjs` | El léxico prohibido **por locale** sobre todo texto de cara al niño (i18n fijo, caché sembrada, textos de la Sabana) | texto |
| `larry-sin-contador.mjs` | El esquema de petición al modelo no tiene dónde poner `rtMs`, puntos, racha ni historial — misma forma que `puntaje-servidor.mjs` | esquema |
| `larry-cache-revisado.mjs` | La consulta de lectura de caché filtra por `revisado_por` no nulo: una explicación sin revisor no se sirve | camino de servicio |
| `larry-prompt.mjs` | La frontera de §3 | prompts |

**El léxico se parte por locale.** Hoy `ELOGIO_A_LA_CAPACIDAD` es una expresión
regular con las palabras de los cinco idiomas mezcladas, aplicada a los siete
locales por igual. Pasa a `audits/lib/lexico-verguenza/<locale>.json`, uno por
locale, firmado por el autor nativo de D-022, con seis categorías: capacidad,
elogio inflado, comparación, conteo de fallas, minimizadores, tiempo/velocidad.
Con 15 textos por locale el regex único es inofensivo; con el corpus completo deja
de serlo. Y una lista global traducida produce **falsos positivos contra texto ya
aprobado**: `es-ES` sirve «Inténtalo otra vez, sin prisa» y `de-DE` «Versuch es
noch einmal, in Ruhe» `[leído]` — prohibir «otra vez» marcaría eso, mientras que
«otra vez te equivocaste», que sí humilla, es la misma palabra en otra
construcción. **Lo que se prohíbe es una construcción, y las construcciones no se
traducen.**

**Los cuatro auditores nuevos entran con su caso en `audits/pruebas-auditores.mjs`,
que escribe la violación, comprueba que bloquea POR LA RAZÓN CORRECTA y la borra**
(CLAUDE.md § Git, regla 3). Y al auditor adversarial `anti-humillacion` de
`audits/adversarial/cartas.mjs` hay que **agregarle `mc-11` a sus citas
autorizadas**: hoy no la tiene, y sin ella no puede invocar el hallazgo de elogio
a la capacidad.

**Dos límites que hay que decir en voz alta, no esconder:**

1. **El léxico es un cable trampa, no un juez.** «No todos nacemos para los
   números» es atribución de rasgo fijo pura y no contiene ni una palabra
   prohibida. Ninguna lista la caza, en ningún idioma. Lo único que cubre ese
   hueco es la revisión humana por locale y el auditor adversarial, que corre a
   mano y cuesta dinero.
2. **Nadie ha oído a Larry.** Toda esta carta se verifica leyendo texto, y en
   kinder el niño no lee: escucha. Un texto que pasa todas las compuertas puede
   sonar condescendiente por la entonación, el ritmo o la pausa. No hay auditor
   para eso y no se propone uno: se propone que **alguien escuche los siete
   locales antes de soltar kinder**.

### 2.5 Cuando el modelo cruza la línea: se descarta, nunca se filtra

Cuatro compuertas en orden, todas dentro del Worker:

1. **Estructural** — todo numeral y todo operador de la salida debe estar
   **verbatim** en el sobre; operador prohibido para el locale (`×` en `de-DE`,
   `÷` en `fr-FR`/`pt-PT`/`de-DE`, según `MATH_CONVENTIONS` `[leído]`) → descarte.
2. **Léxico** — la lista prohibida del locale de salida.
3. **Forma** — tope de longitud por banda, sin revelar la respuesta con el intento
   abierto, sin pregunta que pida texto al niño.
4. **Juez** — segunda llamada con la rúbrica anti-vergüenza sola. **Solo si existe
   camino en vivo; ver P-1 y P-2.**

**Al fallar cualquiera: se descarta la salida completa y se sirve el peldaño de
abajo.** Filtrar deja una explicación mutilada cuyas frases restantes referencian
la que se quitó; reparar es una segunda generación con el mismo riesgo. El
respaldo **no es degradado**: es la explicación revisada por humano de la misma
causa, y pasa todas las compuertas por construcción. El niño **nunca** ve un
error, un reintento ni una disculpa.

**Un solo reintento, y solo en la compuerta estructural**, donde el fallo típico
es de formato (el modelo escribió «cuatro» donde el sobre tiene «4») y una
regeneración a temperatura 0 lo arregla. **Cero reintentos en las compuertas de
vergüenza:** la prohibición ya estaba en el prompt, así que la violación significa
que el prompt no sostuvo, y reintentar es pedirle otra vez que hable del niño.
**Está en disputa: es la pregunta P-13.**

**Lo que NINGUNA de las cuatro compuertas atrapa, dicho de frente:** matemática
falsa. La compuerta estructural comprueba **presencia literal, no corrección**:
«4 menos 1 son 5» pasa si 4, 1 y 5 están todos en el sobre. El juez recibe la
rúbrica anti-vergüenza y no el sobre completo, así que tampoco lo ve. `mc-11` [13]
documenta la cadena de razonamiento **fluida pero equivocada** como modo de falla
distinto de revelar la respuesta, y `mc-37` §3 dice que un error de herramienta en
IOS es una mala pista de interfaz mientras que aquí **enseña matemática
incorrecta**. Este hueco es la razón más fuerte para que kinder no tenga camino en
vivo (P-1).

**El juez es otra llamada:** prompt propio, bitácora propia, ruteo propio, ninguna
relación con el endpoint del tutor. Es la forma que D-029 ya estableció. **Y
comparte punto ciego con el tutor:** los dos corren sobre la misma familia de
modelos en la misma cuenta de Workers AI, así que un sesgo compartido pasa las dos
compuertas sin ruido. D-035 ya nombró este límite («el falso negativo no tiene
mitigación técnica, solo medición») y **aquí es peor: no hay 23 auditores votando,
hay uno**.

**Interruptor automático por tasa de descarte**, con dimensiones
`(compuerta, causa, banda, locale, modelo)` y **nada más** — sin id de niño, sin
id de sesión, sin la respuesta del niño. Si la tasa de un par `(banda, locale)`
pasa el umbral, el camino en vivo de ese par se apaga solo. **Los umbrales
propuestos (>2% en 1,000 rodantes, >5 en 100) son `[estimado]`, incoherentes entre
sí (5 de 100 es 5%, más del doble del otro) y con el volumen del MVP la ventana de
1,000 tarda semanas en llenarse** — es decir, el guardián no observa nada durante
exactamente el periodo en que nadie lo vigila. **Es la pregunta P-14.**

---

## 3. La arquitectura de prompts para los siete locales

### 3.1 Tres capas, no dos

```
CANON (1, común)  →  LOCALE (7)  →  BANDA (5)  ‖  sobre (mensaje de usuario)
```

Ordenados **por tasa de cambio**, no por tema. La caché de prefijo casa por
prefijo literal de tokens: con este orden, editar el bloque de banda invalida solo
la cola; con el orden intuitivo (locale primero, «porque es lo que define la voz»)
cualquier cambio en el bloque más volátil invalida todo lo que va detrás.

### 3.2 Dónde cae la frontera, en concreto

| Capa | Contiene | NO contiene |
|---|---|---|
| **CANON** | Quién es Larry. El contrato (recibe veredicto, nunca calcula, todo número verbatim). La forma de una explicación. Las reglas anti-vergüenza dichas como **conductas** («describe el pensamiento, no a la persona»), no como palabras. La prohibición de preguntas que esperen texto tecleado. **Que la voz es solo de salida: Larry habla, el niño nunca habla** (línea roja #1). Qué hacer cuando no puede: no producir nada | Ninguna cifra de contenido, ningún operador matemático, ningún nombre de idioma, ninguna frase de ejemplo |
| **LOCALE** (×7) | El compromiso de idioma escrito **en** ese idioma. La ficha de notación **generada desde `MATH_CONVENTIONS`**. Los riesgos de palabra-número. Registro y léxico. La lista anti-vergüenza de ese idioma. 3 ejemplos autorados | Nada del contrato de seguridad — eso vive una sola vez |
| **BANDA** (×5) | Techo de vocabulario, longitud de frase, canal, cuántos pasos son honestos | |

**Por qué no siete prompts completos e independientes:** duplicaría siete veces el
contrato de seguridad que hace cumplir la línea roja #7, y un bug arreglado en seis
de siete archivos es el modo de falla que esta separación elimina por
construcción. **Por qué no «cada línea escrita dos veces»:** `mc-37` §What must
change punto 2 lo dice literal — multiplica por 5 los tokens de prompt para
contenido que en cada llamada se usa en una sola lengua.

### 3.3 El auditor de frontera, corregido

El diseño proponía que `audits/larry-prompt.mjs` fallara si el CANON contiene
`[0-9]` o alguno de `÷ × · :`. **Eso marca en rojo el archivo que él mismo
describe**: una lista numerada, una cita a `D-035` o a `mc-11`, y `:` como
puntuación en prosa («Regla:») llevan dígitos y dos puntos. Es exactamente el
guardián ruidoso que el propio diseño denuncia citando D-032 («la gente aprende a
rodear en silencio a un guardián que se equivoca»).

**Regla corregida, que sí es implementable:**

- El CANON no puede contener **ningún numeral usado como cantidad matemática**:
  se comprueba con el patrón «dígito adyacente a un operador o a un signo `=`»
  y con la ausencia de `÷ × · ⋅` en cualquier posición. Los `:` se permiten;
  las citas `D-0NN` / `mc-NN` y las listas numeradas se permiten por una lista de
  excepciones **explícita y corta**.
- El CANON no puede contener ninguno de los siete identificadores de locale ni un
  nombre de idioma.
- Cada archivo de locale debe tener sus siete campos obligatorios.
- **Hash de los prefijos compuestos (G1):** los 14 prefijos del MVP (7 locales ×
  2 bandas) se hashean. Un PR que toca `de-DE` debe mover **exactamente 2** hashes
  y ninguno más; un PR que toca el CANON mueve los 14. **El hash detecta; no
  convoca a nadie** — la regla de que un cambio al CANON requiere revisión de los
  siete autores es social y hay que escribirla en el PR template, no fingir que un
  auditor la impone.

### 3.4 Cómo entra la convención matemática

**No se le pide al modelo: le llega ya escrita.** Los números del sobre viajan
como **cadenas ya formateadas** por `packages/motor/src/numeros.ts`. Larry no puede
escribir `31.75` en alemán si `31.75` nunca existió en su entrada:
`formatear(31.75, "de-DE")` produce `"31,75"` y `operacion(127, "division", 4,
"de-DE")` produce `"127 : 4"`. La ficha de notación del bloque de locale **se
genera** desde `MATH_CONVENTIONS` (`convenciones.ts:29-49` `[leído]`), no se teclea
— es la misma fuente única que `audits/notacion-locale.mjs` ya hace cumplir.

Instruirlo en el prompt («en alemán el decimal es coma») **se queda como
refuerzo**, nunca como mecanismo principal: una instrucción se puede desobedecer y
un número mal escrito en un producto de matemáticas es una respuesta distinta, no
un defecto de estilo. La evidencia de este repo: D-050 y `docs/traduccion.md` §2
midieron **74 de 131 documentos con hallazgos de integridad al traducir**, y la
clase más frecuente fue exactamente un `3.2` que no se convirtió a `3,2`. (Matiz
que hay que decir: esa muestra es casi toda `pt-BR`, `pt-PT` y `de-DE`; `es-MX` y
`fr-FR` tienen 0 traducidos. No es una tasa de los siete locales.)

**Hueco conocido:** la regla «sin dígitos» es exacta; la regla «sin las
palabras-número del ítem» es la que puede tener falsos negativos, y justo donde
más cuesta — en alemán 21 es «einundzwanzig» (una palabra, invertida) y en francés
90 es «quatre-vingt-dix» (tres). En kinder el rango es 0-20 y el vocabulario es
acotado; en bandas altas no lo es.

### 3.5 pt-BR y pt-PT: dos bloques completos, ejemplos no compartidos

No es hipótesis: los 17 mensajes ya autorados en `pt-BR.json` y `pt-PT.json`
difieren en casi todos **por persona verbal y clítico**, no por acentuación
`[leído]`. Con AO90 la ortografía convergió; lo que no convergió es la gramática
de dirigirse a alguien, que es el 100% de lo que hace un tutor.

| Qué cambia | pt-BR | pt-PT |
|---|---|---|
| Trato | `você` + 3ª persona | `tu` + 2ª persona |
| Clíticos | proclíticos | enclíticos (`juntam-se`, `Tira do grupo`) |
| Progresivo | gerúndio | `estar a` + infinitivo |
| División | `÷` | `:` `[leído: MATH_CONVENTIONS]` |
| Escala | corta (`bilhão` = 10⁹) | larga `[leído]` |

Un bloque `pt` con dos variantes cortas encima produciría un prompt que **se
contradice a sí mismo en cada oración de ejemplo**.

### 3.6 Los ejemplos few-shot

Se **autoran por locale, nunca se traducen**, y su verdad de referencia son los
**119 mensajes ya autorados** (17 claves × 7 locales `[medido]`). Esos ya pasaron
por criterio nativo y ya están en el producto: usarlos como referencia hace que
Larry en vivo suene como Larry pregenerado, que es el requisito real — **el niño
no sabe cuál de los dos caminos le respondió**.

### 3.7 Qué se cachea

| Cosa | Llave | Nota |
|---|---|---|
| Prefijo del modelo | afinidad de sesión `larry\|<locale>\|<banda>` | 14 llaves en el MVP, 35 en la escalera completa. **Jamás por perfil del niño** — cada niño pagaría el prefijo frío en su primera explicación (el peor momento) y metería un identificador de menor en una cabecera HTTP hacia un proveedor de inferencia |
| Explicaciones | `(habilidad, causa, banda, locale)` | **Nunca `itemId`.** Es lo que convierte «mil sumas distintas con el mismo error» en una entrada |
| Caché de AI Gateway | **apagado** | Solo empata peticiones idénticas, sin caché semántico. Con un `itemId` distinto por petición la tasa de acierto es ~0 |

**Consecuencia aceptada a propósito:** la explicación **no puede mencionar el
contexto del ítem** («los patos»). Meter `contexto` en la llave multiplicaría la
caché por el número de contextos del banco y volvería irrevisable lo que hoy son
cientos de cadenas revisables. Es una pérdida real —`mc-20` y `mc-06` insisten en
objetos concretos, y «cada patito se toca una sola vez» es mejor que «cada cosa se
toca una sola vez»— y se elige a sabiendas.

**Corrección aritmética que el diseño no hizo:** con la llave que él mismo eligió,
la capa 1 de kinder **no son 14 causas × 7 locales = 98**, son **18 pares
`(habilidad, causa)` × 7 = 126** `[medido]`. Del 98 colgaban tres argumentos
(«cabe en voz grabada», «cabe en config-kv», «se revisa entera a mano»); con 126
los tres siguen en pie, pero el número correcto es 126.

**Cardinalidad máxima teórica** si se autoran las 14 habilidades × las causas de
cada una: **no es 14 × 15 × 7 = 1,470**. Ese producto cruzado no existe
(`error.multiplico` no se puede dar en una habilidad de conteo). La cifra
alcanzable hoy es 126 y crece con lo que F5 cierre.

### 3.8 El tutor y la moderación no comparten nada

Ni CANON, ni caché, ni llave de afinidad. La moderación (D-029) **sí** recibe
texto libre escrito por adultos, y es la única superficie de inyección de prompt
del producto entero. Compartir prefijo o caché la conectaría con el tutor de
niños. El ahorro sería trivial (una llamada por prenda creada); el riesgo es
categórico.

---

## 4. La voz en kinder

### 4.1 Cómo se produce: pregenerada, nunca TTS en vivo

**Tres razones independientes, cada una suficiente:**

1. **Latencia.** El dispositivo de referencia es Android de gama baja sobre 4G
   lento (`mc-47` §4). Una llamada de TTS por enunciado mete un viaje de red donde
   hoy no hay ninguno.
2. **Offline.** D-047 exige modo avión, y una voz que necesita red no existe a
   diez mil metros.
3. **Revisión.** Pregenerado hace que la voz pase por revisión humana **antes** de
   sonar (CLAUDE.md § Contenido); en vivo es imposible.

**`speechSynthesis` no es la vía principal.** `mc-42` §111 documenta que la
disponibilidad y calidad de voz **por idioma es propiedad del sistema operativo,
no del navegador**, y no hay API web para forzar la instalación de un paquete de
voz. En el dispositivo de referencia, un Android sin paquete de francés deja a un
niño de cuatro años frente a una pantalla muda — y como no lee, eso no es
degradación, es producto roto. Segunda razón, independiente: `speechSynthesis` da
la voz del **teléfono**, no la de Larry, que es un personaje de marca con canon
(D-004). Queda como red de última instancia **con detección explícita de
ausencia** — y esa detección tiene que manejar que `getVoices()` devuelve vacío de
forma asíncrona en el primer arranque de varios navegadores, o produce falsos
positivos justo en la primera sesión.

### 4.2 En kinder no corre ningún modelo al responder

`POST /api/reto` → `{acc, causa}` → tabla de consulta `causa → clipId + animacionId`.
Es la línea roja #7 en su forma más fuerte: Larry no solo no calcula — **ni
siquiera genera texto en tiempo de ejecución**. Cero inferencia, cero latencia,
cero costo por reproducción, funciona offline, superficie de alucinación nula. El
LLM sí participa, pero **en tiempo de compilación**: redacta candidatos que pasan
por revisión humana (`mc-40`: los modelos escriben distractores válidos y son
malos anticipando los errores reales).

**Esto contradice a otro diseño de F6 y es la pregunta P-1.**

### 4.3 La cuenta de frases

**Base medida:** 17 claves × 7 locales = **119 cadenas** ya autoradas, 2 frases
cada una salvo `acierto` `[medido]`.

**Lo que hace falta de verdad por locale** `[estimado, sobre base medida]`:

| Bloque | Frases/locale | Origen |
|---|---|---|
| 18 pares `(habilidad, causa)` × 2 frases | 36 | `[medido]` los 18 pares |
| Variantes de la frase que nombra el error (×3 — **en disputa, P-11**) | +36 | `[estimado]` |
| `inesperada` por **formato** (5 formatos × 2 frases) | 10 | `[medido]` los 5 formatos |
| `acierto` (×3 variantes) | 3 | `[estimado]` |
| Números 0-21 y 25 pronunciados sueltos | 23 | `[medido]`: es el rango del banco |
| Interfaz, despedida (D-016), celebración | ~50 | `[estimado]` |
| **Residentes por locale** | **~158** | |
| Enunciados renderizados (185 ítems) | 185 | `[medido]` — cada ítem produce un enunciado distinto |
| **Total por locale** | **~343** | |

× 7 locales = **~2,401 clips**, de los cuales ~1,106 son residentes.

**Aviso de método.** El rango de `mc-42` §204 —«~150-300 frases»— es **por
idioma**, no un total cruzando siete locales. Comparar 196 o 343 con ese rango
tiene sentido **por locale**; comparar un total con un presupuesto unitario, no.
Con ~158 residentes por locale se está **dentro** del rango; con los enunciados
incluidos (~343) se está **fuera**.

### 4.4 ¿Cabe en el presupuesto de `mc-42`? — la cuenta, con el número

**Lo que `mc-42` §271-275 dice de verdad** `[leído]`, y hay que citarlo bien
porque tres diseños lo citaron mal:

> «Total offline asset-size budget (**working target, pending owner
> confirmation**): ≤1.5 MB UI sound-effect sprite (language-independent) + **≤2-3
> MB for the default-language recorded-VO bundle at install**… First-install audio
> footprint target: **under 5 MB**.»

Es decir: **no son 5 MB para la voz.** Son ≤1.5 MB de sprite + ≤2-3 MB de voz del
idioma por defecto, con <5 MB de total, y es un objetivo **pendiente de
confirmación del dueño**. `offline.ts:121` codifica `TOPE_AUDIO_BYTES = 5 MB` y
`audits/precache-budget.mjs` lo llama «el límite duro de mc-42» `[leído]` — esa
lectura convierte un objetivo pendiente en física, y hay que corregirla o
confirmarla.

**Densidad de bytes.** El único dato medido en toda esta dimensión es del diseño
de `voz-kinder`: **3,087 B/s** de habla en Opus mono 24 kbps, sobre 54 clips
reales (118.2 s → 364,940 B), consistente en tres idiomas. A 16 kbps: **~2,090 B/s
(−32%)**. `mc-42` §204 da un rango por frase de **15-40 KB**, que a 3,087 B/s son
frases de 5 a 13 s — un rango pensado para VO de celebración, no para dos frases
de tutor.

**La cuenta, con 3,087 B/s medidos y una frase promedio `[estimado]` de 3 s ≈ 9.3 KB:**

| Concepto | Bytes |
|---|---|
| Sprite de efectos (independiente del idioma) | ≤1.5 MB `[leído: mc-42 §272]` |
| Voz residente, **un** locale (158 frases × 9.3 KB) | ~1.47 MB `[estimado]` |
| Shell del precaché (medido hoy) | ~72 KB `[leído: precache-budget.mjs]` |
| **Subtotal de primera instalación** | **~3.04 MB** |
| Enunciados del **nivel en curso** (146 ítems de N1 × 9.3 KB) | +1.36 MB `[estimado]` |
| **Primera instalación con enunciados de N1** | **~4.40 MB** |
| Modo avión D-047: enunciados de N1+N2 (185 × 9.3 KB) | +1.72 MB, **aparte y se suma** `[leído: D-047]` |
| **Instalación + modo avión** | **~6.12 MB** |

**Veredictos, con el número:**

- **Un locale, sin modo avión: CABE**, con ~0.6 MB de holgura contra los <5 MB.
  Contra la línea que de verdad aplica (≤2-3 MB de voz del idioma por defecto),
  la voz residente (~1.47 MB) cabe; **los enunciados (~1.36 MB) la sacan del
  rango**, porque `mc-42` presupuestó vocabulario fijo, no lectura de ítems.
- **Un locale con modo avión: NO CABE.** ~6.12 MB contra <5 MB. `[estimado]`
- **Siete locales al instalar: NO CABE, ni de lejos.** 7 × ~1.47 MB de voz
  residente = **~10.3 MB solo de vocabulario fijo**, antes de enunciados y antes
  del sprite. `[estimado]`

**Decisión que se toma:** **un locale en la primera instalación**; los otros seis
se traen cuando el padre cambia de idioma. Es lo que `mc-42` ya proponía en su
pregunta abierta 3, ahora con número. **Esto NO revierte D-022** (los siete
locales se autoran y existen desde el lanzamiento); lo que se difiere es la
**precarga**, no la existencia. Y **la descarga tiene que ser explícita**: D-047
dice literal «nada se baja solo, porque el mercado objetivo paga sus datos», así
que traer un locale nuevo o el nivel siguiente es una acción del padre con los
bytes dichos por adelantado en `PaqueteDeVuelo.bytes` — que hay que **actualizar
para que sume el audio de explicación**, o le miente al padre.

**Y el audio de explicación no se recorta.** `offline.ts:153-157` recorta el audio
del nivel siguiente cuando el paquete no cabe `[leído]`. La voz de explicación es
por **causa** y por **locale**, no por nivel: archivada bajo `audioPorNivel` sería
lo primero en caer, y un niño que se equivoca en un vuelo oiría silencio. Va en un
campo propio `audioExplicacion: string[]` **que sí entra en la comparación del
tope** — una exención incondicional no es una protección, es un hueco en el
presupuesto.

### 4.5 Sin audio: la vía muda es de primera clase

**Cada causa nombrada lleva una repetición visual muda** — Larry vuelve a hacer en
pantalla el conteo del niño, y el pato contado dos veces parpadea dos veces. **No
un subtítulo.** `mc-42` §10 y WCAG 1.2.1 exigen equivalente no sonoro, pero un
subtítulo es inútil para un pre-lector: cumplir la letra de 1.2.1 no hace el
producto usable. Los cinco formatos de kinder ya son pictóricos y de tocar, así
que el bucle mudo ver→tocar→ver resultado está completo por construcción; lo único
que falta es que el **veredicto** se vea.

**Y como «la Sabana no habla» (D-019), las animaciones no llevan idioma: ~18
animaciones cubren los siete locales, contra 119 clips de audio.** Es el activo de
mayor palanca de toda F6.

- **El niño sordo usa exactamente la misma vía.** No hay «modo accesible» aparte:
  si la vía muda es de primera clase y está probada, ya **es** la vía accesible.
  Una vía separada es la que se rompe sin que nadie lo note, porque nadie la juega.
- **Hápticos descartados como canal:** `mc-42` §6 midió que `navigator.vibrate` no
  existe en iOS Safari en ninguna versión, y D-041 hace del iPad primera clase.
- **Bajo `prefers-reduced-motion: reduce` la repetición NO se quita:** se vuelve
  una versión lenta, sin escalado ni paneo, que avanza paso a paso al tocar. En la
  vía muda esa animación **no es decoración: es la información esencial**. WCAG
  2.3.3 exime a la animación esencial y `mc-42` §7 pide «preservar la señal, nunca
  simplemente quitar la retroalimentación». Aplicar la regla genérica de
  reduced-motion aquí apaga el único canal que le quedaba a un niño sordo con
  sensibilidad vestibular.
- **`prefers-reduced-motion` NUNCA se reutiliza para silenciar.** No existe
  `prefers-reduced-sound` en ningún navegador; el control tiene que ser explícito.
  Son discapacidades distintas con necesidades opuestas: un niño con baja visión
  puede querer **menos** movimiento y **más** voz.
- **Dos controles separados —«voz» y «efectos»—** en el perfil del padre (línea
  roja #2), con anulación por dispositivo en un ícono de bocina siempre visible que
  el niño puede tocar (`mc-42` §262).
- **El primer toque de la sesión** es una elección de dos mosaicos con pictograma
  (bocina encendida / bocina tachada), ≥88 px, sin una sola palabra, y ese mismo
  toque desbloquea el `AudioContext` y dispara el buffer cebador (`mc-42` §9). **No
  va en el onboarding**: D-026 fija registro de dos campos y «sin carrusel de
  bienvenida», y meterle una pregunta de audio reabre una decisión cerrada.
- **Falta el control más obvio para un pre-lector: REPETIR.** Ningún diseño lo
  contempló. «Dilo otra vez» va a ser el botón más usado del producto. Se añade al
  alcance, con comportamiento definido para el toque durante la reproducción.

### 4.6 Riesgos medidos de la generación de voz

Del diseño de `voz-kinder`, con comandos `[medido]` que **hay que mover al repo**
antes de que sustenten nada (viven en un scratchpad que muere con la sesión —
CLAUDE.md § Git, regla 2):

- Workers AI ofrece **4 modelos de TTS** (`wrangler ai models list --task
  "Text-to-Speech"`): `aura-1` (en), `aura-2-en`, `aura-2-es`, `melotts`. **Hay voz
  para en/es-MX/es-ES. No hay voz verificada para fr-FR, pt-BR, pt-PT ni de-DE —
  4 de los 7 locales.**
- **MeloTTS falló 5 de 18 llamadas (27.8%)**, devuelve PCM crudo de 44.1 kHz
  etiquetado como MP3 (~14× el peso de Aura), y **no se pudo verificar que su
  fonología `DE`/`PT` sea realmente alemana o portuguesa** — documenta EN/ES/FR/ZH/JP/KR.
- **`aura-2-es` acepta texto ALEMÁN sin error** y devuelve audio: un bug de ruteo
  de locale no daría error, daría una **voz segura pronunciando disparates**.
  Ninguna prueba automática caza eso; solo un humano escuchando.
- **`wrangler ai models list` sin `--task` pagina en silencio** y devuelve 45
  modelos con solo 2 de TTS. Cualquier auditoría del catálogo que no filtre
  reporta falsos negativos.
- **Larry no puede tener la misma voz en los siete locales con ninguna opción
  disponible**: los paquetes de hablantes de Aura son distintos por idioma. Larry
  sonaría como un rinoceronte distinto en cada país, contra el canon de D-004.
- **`mc-34` §84 marca la cobertura de locales de `melotts` como explícitamente NO
  verificada**, con duda nombrada sobre si `pt-PT`/`pt-BR` y `es-MX`/`es-ES` reciben
  voces distintas.

**Consecuencia:** generar la voz **fuera de Cloudflare, en tiempo de compilación**,
es lo único que cubre los siete locales hoy. **Pero eso NO está autorizado por
ninguna decisión.** El diseño lo justificó con una cita a CLAUDE.md que **no
existe** («lo desplegado corre sobre Cloudflare y las herramientas de desarrollo
no»). Lo que sí existe es D-035, ampliada por el dueño: «solo vamos a trabajar con
Cloudflare, es una decisión tomada». El argumento honesto es otro y hay que
hacerlo explícito: **CLAUDE.md § Imágenes ya autoriza Recraft y Gemini fuera de
Cloudflare para generar arte.** Si el audio es arte, el mismo permiso aplica. Eso
lo decide el dueño: **es la pregunta P-6.**

### 4.7 Un bug de ítem que apareció midiendo la voz

**45 de 185 ítems (el 100% de K12) tienen un distractor con valor negativo**
`[medido]`: `banco-kinder.ts:132` pone `{valor: b - a, causa: "error.resto_al_reves"}`
y `parametros()` fuerza `a > b`, así que ese distractor va de −9 a −1. Un niño de
cuatro años no va a tocar «menos tres». Eso no es un problema de voz: **es un ítem
que le ofrece «−3» a un pre-lector**. Va a **F5 como bug de ítem**, antes que a F6
como clip que nunca suena.

---

## 5. El gasto

### 5.1 Dónde vive el tope: en los dos, con reparto explícito

| Capa | Cuenta | Puede |
|---|---|---|
| **Durable Object** (`math-challenge-ratelimiter-do`, ya inventariado para «tutor calls») | **llamadas** | Decidir **antes** de gastar. Degradar con criterio pedagógico. Respetar «2 toques por ítem» |
| **AI Gateway** | **dólares** | Ver el costo real por tokens. Seguir frenando cuando lo roto es la lógica del Worker (bucle de razonamiento, reintento infinito). Su única respuesta es **429**, que no sabe degradar |

**Precisión que hay que hacer, porque el diseño la argumentó con un hecho falso:**
`mc-32` §Servicios dice que el **ruteo dinámico** del Gateway puede caer a un
modelo más barato al tocar presupuesto, en vez de bloquear duro. Así que «el
Gateway solo sabe devolver 429» no es cierto. La conclusión —que la degradación
**pedagógica** la decida el Worker— se sostiene por otra razón: el Gateway puede
cambiar de modelo, pero no puede servir la explicación pregenerada revisada por
humano, que es el peldaño que este producto quiere.

**Esto ENMIENDA D-015, no la precisa.** D-015 dice «Límite de gasto por perfil/día
**vía AI Gateway**». Mover el limitador real al DO cambia el mecanismo. Va al
dueño como enmienda (P-15), no como detalle de implementación.

### 5.2 La clave por perfil, sin identificar al niño

`pd = HMAC(secreto, fecha || profile_id)` truncado, en `cf-aig-metadata`. La
derivación tiene que ser **determinista** (HMAC de un secreto con la fecha): si la
sal se genera aleatoria y se guarda, distintos nodos producen `pd` distintos para
el mismo perfil el mismo día, y como el presupuesto del Gateway es **por valor de
metadata**, el tope efectivo se multiplica por el número de sales vivas — falla
abierto, en silencio. La rotación diaria coincide con la ventana del tope, así que
no cuesta nada y los contadores de ayer dejan de ser vinculables.

**Y «día» necesita zona horaria.** El DO y el Gateway tienen que coincidir en
cuándo empieza el día; D-016 tiene cortes nocturnos que son hora **local**, y UTC
parte el día a media tarde en México. Sin definirlo, el tope es irreproducible.

**Límite verificado:** AI Gateway admite **máximo 5 entradas de metadata** por
petición. **Pero el reparto de reglas del diseño no se puede implementar con una
sola entrada `pd`:** las reglas por banda necesitan un campo `banda`, y `pd` no
codifica el plan, así que **una sola regla split-by-value da el mismo presupuesto
a gratis y a Familia**. Son ≥3 entradas de metadata, o dos espacios de seudónimo.
Hay que decidirlo al implementar, no descubrirlo.

**Registro del gateway del tutor en Zero Data Retention** en producción: se
conservan conteos y costos, no prompts ni respuestas. El prompt lleva la respuesta
que dio un menor. La capacidad de depurar leyendo el log se conserva en el gateway
de **desarrollo**.

### 5.3 Qué se mide y dónde

| Dato | Dónde | Índice |
|---|---|---|
| Conteo de llamadas, costo, peldaño | `math-challenge-ratelimiter-do`, una instancia por perfil, una fila por día, alarma que poda a 7 días | — |
| Telemetría de uso/costo | `math-challenge-tutor-usage-ae` (Analytics Engine) | **`banda\|locale\|modelo`. NUNCA el perfil, ni siquiera hasheado** |
| **Cero filas por llamada en D1** | — | `audits/no-attempts-in-d1.mjs`, `mc-32` riesgo #1 |

**Hay que corregir `docs/infrastructure.md` ANTES de crear nada** `[leído hoy]`:

- Línea 38: «AI Gateway va delante de **Claude** siempre» → falso desde D-035.
- Línea 49: `math-challenge-tutor` «calls **Claude** via AI Gateway with RAG».
- Línea 69: `math-challenge-tutor-gateway` «for **Claude** calls», gateway ID en
  `ANTHROPIC_BASE_URL`.
- **Línea 72: `math-challenge-tutor-usage-ae` = «Tutor usage/cost telemetry
  (per-child, per-model)».** Ésta es la peor: contradice la decisión de arriba y la
  línea roja #2, y es la que hay que arreglar antes de crear el dataset. Las de
  Claude solo cuestan un recurso mal nombrado.
- `math-challenge-moderacion-gateway` **no existe en el inventario** y F6 lo
  necesita separado (§3.8): quien lo cree escribe su renglón en el mismo PR.

**Analytics Engine retiene tres meses y no borra bajo demanda** (`mc-32` riesgo
#7). Con el índice en banda/locale/modelo no hay nada del niño que borrar. **Pero
el DO sí guarda un contador por perfil siete días, y el DO NO está en la lista de
`audits/borrado-cuatro-sistemas.mjs`** (que enumera D1, KV, R2, AE). Hay que
extender el auditor o el borrado no alcanza el contador. Nota aparte: **el repo
tiene dos listas distintas de «los cuatro sistemas»** —la del auditor y la de
D-035 (D1, DO, AE, Vectorize)— y nadie lo había notado.

### 5.4 Cuánto cuesta

**Precios verificados** `[leído: D-035 y `audits/adversarial/proveedores.mjs`]`:

| Modelo | entrada $/M | cacheada $/M | salida $/M |
|---|---|---|---|
| `@cf/openai/gpt-oss-120b` | 0.35 | **n/d** | 0.75 |
| `@cf/moonshotai/kimi-k2.6` | 0.95 | 0.16 | 4.00 |

`melotts`: **$0.0002 por minuto de audio** `[leído: mc-32 §54]`.

**Todo lo demás son estimaciones, y las tres estimaciones que circulan no
coinciden entre sí.** Se dejan las tres en la mesa, con su supuesto, porque
elegir una sin medir sería inventar:

| Fuente | $/1k explicaciones kinder | $/1k banda adulta | Supuesto de tokens |
|---|---|---|---|
| D-015 (enmendada por D-035) `[leído]` | ~$0.22 | ~$1.50 | ~300 entrada → ~150 salida, **sin razonamiento** |
| Diseño `prompt-por-locale` `[estimado]` | $0.76 | $1.67 (cacheado) – $9.67 (2,000 tok de razonamiento) | 1,920 entrada, 120-300 salida |
| Diseño `tope-gasto` `[estimado]` | $0.71 | $4.19 | ~950 entrada → ~500 salida (350 de razonamiento) |

**El supuesto que decide todo es el razonamiento, y este repo ya lo midió una vez
en la dirección contraria:** D-035 hallazgo 3 dice literal que estimó 1,200 tokens
de salida por auditor y **midió 7,560, casi todo razonamiento**, cobrado como
salida — un error de **6.3×**. `docs/traduccion.md` §3 da una media de 17,132
tokens de salida por documento. **Ninguna de las tres estimaciones de arriba
sobrevive a un razonamiento de ese orden.**

**Segundo hallazgo de D-035 que muerde aquí:** con `max_tokens` corto, la
respuesta llega **vacía** con `finish_reason: "length"` porque el razonamiento se
comió el presupuesto. Un presupuesto de ~500 tokens de salida —que es lo que dos
diseños proponen para cumplir la latencia— es **exactamente esa condición**. Hay
que nombrarla por lo que es y subir `max_tokens`, no reintentar ni cambiar de
modelo.

**Mil niños al día:** no se publica una cifra. Las tres que circulan
($0.27/día, $1.82/día, $4.73/día) dependen de tres supuestos inventados que se
multiplican entre sí (ítems/día, tasa de fallo, fracción que pide explicación), y
uno de ellos —«~25 ítems/día»— contradice D-018, que define FLUIDEZ como **20-30
ítems seguidos en un solo reto**. **Lo que sí se puede decir con precios reales:**
un solo perfil a 60 llamadas/día en `kimi-k2.6`, al $0.0042 estimado, cuesta
**~$7.56/mes — casi la suscripción entera de una familia de seis** (D-021: $8-10
USD/mes). Un tope que está 5× arriba del precio no es tope económico, es permiso.

**El primer entregable de F6 es medir**, no construir: ~$5 y una tarde para fijar
50 explicaciones reales por banda con el prompt real, comprobar si `metadata`
llega al Gateway desde el binding de `env.AI.run()` (la doc de Cloudflare se
contradice entre la página del proveedor y la de custom metadata), y comprobar si
**AI Gateway calcula costo para modelos `@cf/`** — porque si no está en su base de
precios, **el tope de dólares no dispara nunca y el Gateway deja de ser red de
seguridad**. Mitigación conocida: `cf-aig-custom-cost`.

**Y una regla que no es opcional:** si la respuesta no trae `usage`, el medidor
carga el **máximo estimado de esa banda, nunca cero**. Un tope que falla abierto en
silencio es peor que no tener tope, porque nadie lo revisa. Es el modo de falla
que este proyecto ya sufrió con los auditores (D-032: «seis fallaban abiertos sin
que nadie lo supiera»).

### 5.5 Qué pasa cuando un niño agota su tope

**Lo que se raciona es UNA VARIANTE de la explicación, jamás la práctica ni el
hecho de recibir explicación.** El piso —explicación pregenerada con causa
nombrada, instantánea, gratis, offline, revisada por humano— **no depende de
presupuesto, de red ni de modelo, y no tiene tope**.

| Peldaño | Umbral | Qué pasa |
|---|---|---|
| **P0** | 0-60% | Camino completo con el modelo de la banda |
| **P1** | 60-85% | RAG apagado; solo llamada en vivo por error **no catalogado** |
| **P2** | 85-100% | Cero llamadas en vivo: caché de causas revisada + variantes autoradas («otra manera») |
| **P3** | >100% | Idéntico a P2 **para el niño**. Distinto solo en telemetría |

**La degradación se mueve hacia contenido humano revisado, nunca hacia un modelo
más débil que improvise.** Eso la hace **más segura, no menos**: en P2, Larry sirve
solo texto que pasó revisión humana, y la línea roja #7 se cumple mejor bajo
presión que en condiciones normales. **En la banda Pro el único peldaño permitido
es ir directo a pregenerada** — bajar de modelo está prohibido: D-035 dice que una
explicación de cálculo tensorial incorrecta enseña error.

**El niño no ve NADA cuando se degrada:** sin aviso, sin contador, sin mención del
plan de pago. Cualquier aviso convierte el tope en superficie de monetización
apuntada a un menor, y el paso siguiente inevitable es «pídele a tu papá»
(`mc-17`, precedente FTC/Prodigy). **Está en disputa: es la pregunta P-16.**

**El limitador real no es un número, es una regla estructural:** el botón de «no
entendí / otra manera» existe **únicamente colgado de un ítem recién calificado**,
y admite **máximo 2 toques por ítem**. Convierte «distinguir curiosidad de abuso»
de un problema de heurística en un problema de esquema — el patrón que D-027 usó
con los clubs y D-028 con las prendas: **la categoría se elimina en vez de
vigilarse.**

**Y la cota que ese límite da NO es la que el diseño afirmaba.** «2 × ítems
intentados» no está acotado por 25 ítems/día: D-018 define FLUIDEZ como 20-30
ítems seguidos, y D-016 da hasta 90 minutos a los 12-17. **Dos retos de fluidez =
60 ítems = 120 llamadas elegibles**, sin nada anómalo. El límite estructural es
necesario y no es suficiente.

**Tres objeciones que este plan NO resuelve y hay que decir:**

1. **La cuota es regresiva.** Las llamadas se disparan por error: el niño que más
   se equivoca agota el presupuesto primero y cae a P1/P2, mientras el que acierta
   conserva su cuota intacta. Y P1 degrada **a mitad de sesión**: cuanto más
   practica un niño en un día, peor es la ayuda que recibe. No cobra por
   practicar en la letra, pero **es una mecánica de energía que se agota aplicada
   al acompañamiento**, y es la objeción pedagógica más fuerte de toda la
   dimensión.
2. **La escalera es código que solo corre bajo ataque.** Con la mediana modelada
   muy por debajo de la cuota, P1/P2/P3 nunca se ejercitan en uso normal: la
   primera vez que P2 corre de verdad es en producción, con un niño real, en el
   camino que puede dejarlo sin explicación. Hace falta forzar P2 en desarrollo y
   en un canario, con una prueba que se haya visto fallar sin el arreglo.
3. **P2 aterriza sobre un banco que todavía no existe.** Si F5 publica ítems sin
   catálogo de errores con causa nombrada en los siete locales, en P2 **el niño cae
   al vacío y la línea roja #4 se cruza en silencio**, porque nadie mira el peldaño
   P2 en una demo. Exige auditor determinista y bloqueante **en F5**, no una nota.

---

## 6. La capa offline

### 6.1 La regla de ruteo, decidible sin red

**Se decide con el veredicto, jamás con `navigator.onLine`.** Cuatro ramas sobre
tres campos que `VeredictoDeItem` ya devuelve:

| Rama | Condición | Qué sirve | ¿Modelo? |
|---|---|---|---|
| 1 | `acc = 1` | `acierto` + la `razon` autorada de la opción elegida (D-048) | **Nunca** |
| 2 | `acc = 0`, `causa != null` | El texto autorado de esa causa | **Nunca** |
| 3 | `acc = 0`, `inesperada = true` | Pista procedimental del formato → luego respuesta autorada + su porqué | La única rama donde el modelo aportaría algo |
| 4 | El niño toca «no entendí» (botón, jamás texto tecleado) | Variante o siguiente peldaño | Según P-1 |

`navigator.onLine` reporta `true` detrás de un portal cautivo; una interfaz
ramificada sobre esa bandera deja al niño con una explicación vacía. **Su uso
actual en `cola-offline.ts:160` es correcto** —decide si vale la pena *intentar* un
vaciado— y esa distinción hay que preservarla. El portón real en las ramas 3 y 4
es «la llamada resolvió antes del plazo», no la bandera.

### 6.2 Qué se pregenera exactamente

Hoy existe **solo lo primero**:

1. **Dos frases por causa nombrada** — 17 claves × 7 locales, ya escritas
   `[medido: 11,999 B]`.
2. **Variantes de la frase que nombra el error**, rotadas de forma **determinista**
   sobre `(itemId, orden)` — para que offline y online digan lo mismo y
   re-sincronizar no cambie la historia. Una serie de FLUIDEZ son 20-30 ítems
   (D-018) y el mismo error se repite: oír la frase idéntica seis veces es
   exactamente donde la capa pregenerada se siente mecánica. `mc-42` rec. 3 ya
   prescribe 2-3 variantes rotativas para los chimes; el argumento es más fuerte
   para el habla. **Número de variantes en disputa: P-11.**
3. **`inesperada` por FORMATO, no una global** — cinco en kinder `[medido: 5
   formatos]`. Hoy `inesperada` es una sola cadena y es literalmente el marcador
   desnudo que Kluger & DeNisi señalan como contraproducente. **Y dado que
   `inesperada` es frecuente (§1.5), ésta es la frase que más se va a repetir en
   todo el producto: necesita variantes antes que ninguna otra.**
4. **`respuesta.porQue`** — la razón autorada de por qué la respuesta correcta lo
   es, como `{clave, vars}` igual que `enunciado`. Es lo que convierte la rama
   offline de `inesperada` en una explicación en vez de un marcador, y **no cruza
   la línea roja #7**: leer un campo autorado es el patrón `contador/explain.ts`.
5. **El catálogo propio de la franja adulta N8-N10** (D-034/F5b). `mc-07` tiene 13
   errores de fracciones con nombre y `mc-08` tiene 10 de álgebra, ya escritos como
   tablas. **Hoy la franja adulta tiene CERO textos de retroalimentación**, y
   `retro-completa.mjs` solo audita las causas del banco de kinder: si N8-N10 sale
   con camino en vivo, su fail-safe descansa en un corpus que no existe y que nadie
   ha contado. Advertencia de D-034: «una sola autoría, siete renders de notación»
   vale para la **estructura** del ítem; **la prosa de retroalimentación sí son
   siete autorías** y no está en ningún barandal de D-034.

**Extensión de tipo que hay que hacer al añadir 4:** `validarItem` y
`localesQueFaltan` (`item.ts:248-257`) hoy solo revisan `enunciado.clave`. Un campo
nuevo con la misma forma repite el mismo hueco si no se extienden **en el mismo
PR**.

### 6.3 Qué cambia en `retro-completa.mjs`

**El auditor se rompe con esto y nadie lo había dicho** `[leído: líneas 84-93]`:
exige que toda clave `error.*` **y** la clave literal `inesperada` sean un arreglo
de **exactamente 2 frases**.

- Las variantes múltiples (punto 2) hacen 4+ entradas por causa → **bloquea**.
- Las claves `inesperada.<formato>` (punto 3) **no empiezan con `error.` ni son
  iguales a `"inesperada"`**: caen fuera del filtro y quedan **sin auditar** — sin
  dos frases, sin frase vacía, sin comprobación de que existan en los siete
  locales (§3 solo itera `causasDelBanco`).

Hay que extenderlo en el mismo PR: forma `{ frases: [qué pasó, siguiente paso],
variantes?: [...] }`, y el filtro por prefijo `inesperada` en vez de igualdad.

**Segundo hueco del mismo auditor:** audita en una sola dirección (causa → texto).
El sentido inverso —**texto sin causa que lo genere**— no lo vigila nadie, y por
eso `error.eligio_al_azar` lleva siete locales autorados sin que ningún ítem la
produzca `[medido]`. El catálogo puede llenarse de ficción sin que se note.

### 6.4 Cuánto pesa

| Cosa | Peso | Nota |
|---|---|---|
| Texto de las 17 claves × 7 locales | **11,999 B crudo · 2,423 B brotli** como paquete `[medido hoy]` | El lado de TEXTO **nunca** es la restricción |
| Costo unitario de una clave nueva | ~100.8 B por locale → ~706 B en los siete `[derivado]` | |
| Ítems del paquete de vuelo (185, dos niveles) | ~95 KB con metadatos de autor · ~56 KB sin ellos `[medido]` | `variacion.por_que` es prosa en español que el niño nunca ve y que no está localizada: **no tiene por qué viajar al dispositivo** (−41%) |
| **Audio** | Ver §4.4 | Es la única restricción real |

### 6.5 `inesperada: true` sin conexión

**Dos escalones, y ninguno calcula:**

1. **Primer fallo inesperado en el ítem:** la pista procedimental del formato.
2. **Segundo:** la respuesta autorada + su `respuesta.porQue`, leída en voz alta.

**El valor inesperado se encola** —un número o el id de una opción, **jamás texto
libre**— para que la curaduría de F5 le ponga nombre a la causa que faltaba.
`item.ts:154-157` ya dice que `inesperada` es material de curaduría. **Ése es el
mecanismo por el que la capa pregenerada deja de necesitar al modelo: cada
`inesperada` recurrente se convierte en una causa autorada en la siguiente entrega
de contenido. La capa mejora con datos de producción, sin modelo y sin red.**

**Dos condiciones que la cola tiene que cumplir, y que ningún diseño resolvió:**

- **No puede ser una fila por intento en D1** (`mc-32` riesgo #1,
  `audits/no-attempts-in-d1.mjs`), y el umbral propuesto («10 ocurrencias o 5% de
  los intentos del ítem») **exige exactamente eso**: contar `(itemId, eleccion)`
  repetidas en el tiempo, con un denominador por ítem. Las dos cosas no pueden ser
  ciertas a la vez. **El umbral es `[estimado]` sin fuente** — el anclaje en los
  200-400 de `mc-44` es falso apoyo: ése es tamaño de muestra para **calibrar
  dificultad**, sin relación con detectar una respuesta no catalogada.
- **Una tabla nueva de valores elegidos por un niño es invisible para
  `audits/child-free-text.mjs`**, que vigila tres tablas por nombre
  (`CHILD_TABLES = ["child_profiles", "child_image_pin", "skill_state"]`
  `[leído: línea 24]`). Hay que extender `CHILD_TABLES` en el mismo PR o la línea
  roja #3 nace sin guardián sobre la superficie nueva.

**Y el escalón 2 choca con la línea roja #8.** D-018 dice que el modo PROBLEMA
«permite borrar y volver», y `mc-30` dice que cambiar de respuesta mejora la
calificación el 79% de las veces. Un contador de «segundo fallo inesperado» que
revela la respuesta convierte **explorar y corregir** en el gatillo que quita el
problema. Hay que definir si el contador se reinicia al borrar y si un valor
corregido se encola dos veces. **Sin definirlo, corregir cuesta.**

### 6.6 ¿Debe el niño notar la diferencia entre las dos vías?

**Aquí dos diseños se contradicen de frente y no se elige por ellos** (P-1, P-2):

- **`offline-sin-modelo`:** la pregenerada **no es respaldo, es la capa base**; el
  modelo solo **añade** una segunda línea, nunca sustituye. Así no hay dos
  versiones que comparar.
- **Su propia crítica:** presencia o ausencia **es** la comparación, y ocurre en la
  misma pantalla, sobre el mismo error, del mismo niño. Larry le dice más al niño
  que paga sobre su propio error.
- **`anti-humillacion` y `voz-kinder`:** en kinder no hay segunda línea en absoluto,
  y el problema desaparece.
- **Y en kinder la segunda línea es imposible de todos modos:** una línea generada
  en vivo **no se puede pregrabar**, así que o se lee con el `speechSynthesis` que
  §4.1 descartó, o es texto que un niño de 4-6 años no puede leer.

**Lo que sí queda cerrado, con o sin segunda línea:** cualquier `Larry en vivo`
futuro **añade, nunca sustituye**, y eso necesita un **auditor determinista propio**
o la consecuencia de la línea roja #4 queda dependiendo de que alguien se acuerde
en la revisión del PR.

---

## 7. Riesgos y líneas rojas en peligro

### 7.1 Líneas rojas realmente en riesgo

**#7 — Larry nunca calcula.** Cuatro vías independientes:

1. **Vía `habilidad`:** `HABILIDADES_KINDER.K10` es «descomponer (5 = 2+3)». Si
   viaja la etiqueta en vez de la clave, entran tres operandos y una igualdad **el
   día uno**. Se cierra con `habilidad: HabilidadKinder` y un auditor que prohíba
   renderizar `HABILIDADES_KINDER[...]` dentro de `packages/tutor/`.
2. **Vía `razonAlterna`:** `item.ts:77` declara `razon: string` — prosa autorada
   libre — y el sobre la lleva mientras afirma «ningún operando, ninguna
   respuesta». «Sobra el 8 porque es par» **mete el 8**. Está identificado como
   riesgo pero programado como pregunta pendiente, no como bloqueo previo. **Hoy
   ningún ítem tiene `tambienCorrectas` `[medido: 0]`, así que este canal está sin
   ejercer y el momento de cerrarlo es ahora**, no cuando existan datos.
3. **Vía `inesperada`:** es por definición el veredicto **sin** causa nombrada. Si
   el modelo lo explica, tiene que derivar por qué la respuesta está mal — eso es
   calcular. Este plan lo cierra degradando a habilidad (§1.5), pero cualquier
   futuro «que el modelo clasifique el error» reabre la línea.
4. **Vía compuerta:** la compuerta estructural comprueba **presencia literal, no
   corrección**. «4 menos 1 son 5» pasa. **Ninguna de las cuatro compuertas atrapa
   matemática falsa** (§2.5).

**#7 — Larry nunca avergüenza.** Vía `intentoEnEsteItem`: un contador de intentos
permite «es tu tercer intento» — feedback de nivel «yo», el mismo mecanismo por el
que este plan excluye `rtMs`, los puntos y la liga citando a Kluger & DeNisi. Nadie
justificó por qué un contador de intentos es seguro y uno de milisegundos no. **Es
la pregunta P-4.** Nota adicional: «el peldaño como tipo de ayuda» **no es una
imposibilidad de esquema** — con una escalera fija y determinista, «ejemplo
trabajado» ⇔ tercer intento, y el contador llega igual, con otro nombre.

**#4 — Nunca se cobra por dejar que un niño practique.** Cinco frentes, ninguno
doloso:

- **D-021 pone «modo sin conexión» en el Plan Familia** y «Larry con explicaciones
  pregeneradas» en el gratis `[leído]`. Si offline es de pago, la capa base offline
  del niño gratis **no existe**, y el argumento fundacional de §6 se cae. **Ningún
  diseño lo mencionó.**
- **La cuota gratuita del diseño de gasto (12 llamadas en vivo) contradice D-021**,
  donde el plan gratis **no tiene Larry en vivo en absoluto**.
- **El vacío de P2** sobre un ítem sin catálogo de errores en los siete locales.
- **Offline + kinder no lector:** si el audio del piso no cabe en el precaché, el
  niño recibe **texto que no puede leer**, que es no recibir explicación. `mc-33`
  §4 añade que **ITP purga Cache API / IndexedDB tras 7 días sin interacción y solo
  las apps instaladas están exentas** — y en iOS no hay `beforeinstallprompt`, así
  que el default es no instalada. Un iPad tras una semana de vacaciones abre la app
  muda. **D-041 hace del iPad primera clase y ningún diseño lo contempló.**
- **La regresividad de la cuota** (§5.5).
- **Los topes de la escalera** (3 servidas/sesión, ≥24 h de descanso) sobre la
  cadena de desbloqueo de D-019.

**#2 — El niño nunca es un usuario.** Dos frentes:
`math-challenge-tutor-usage-ae` está inventariado **hoy** como «per-child,
per-model» `[leído: infrastructure.md:72]`; y el DO guarda contadores por perfil
siete días **fuera de la lista de `audits/borrado-cuatro-sistemas.mjs`**. Añádase
que el anillo de texto candidato descartado (§2.5) guarda salida del modelo con
sello temporal junto a contadores con el mismo sello: sin plazo de retención
declarado, es reidentificable por unión aunque no lleve id.

**#3 — Ningún niño escribe texto libre.** No se cruza tal como está escrito
—`pidioAyuda: boolean` no tiene dónde meter una frase y la elección se acota a 32
bytes— pero queda a un paso en tres sitios: (a) `CHILD_TABLES` no cubre la cola de
curaduría; (b) el disparador «cuéntame más» sin eje de turno en la caché devuelve
la misma cadena dos veces, y el arreglo obvio (eje de profundidad/historia) es
literalmente construir una conversación por turnos con un niño; (c) la literatura
que estos diseños citan (SocraticLM, «andamiar con preguntas») empuja al tutor
hacia una pregunta que invita a responder.

**#8 — Nunca se penaliza corregir.** Sin resolver, no cruzada. Ningún contador
—«servidas», «fallas consecutivas», «segundo fallo inesperado», cuota— tiene
semántica definida frente al «permite borrar y volver» de D-018. **Si una
corrección cuenta, corregir baja al niño de peldaño más rápido y consume cuota, y
ningún auditor de texto lo va a ver porque vive en el motor.**

**#1 — Nunca micrófono.** No se cruza, y hay que escribirlo: «la voz es la
interfaz» sin decir «Larry habla, el niño nunca habla» es la ambigüedad que un
implementador resuelve con un botón de dictado o una prueba de escucha. **Va en el
CANON, explícito, y `larry-sin-item.mjs` verifica que ninguna superficie de niño
pida `getUserMedia`.**

### 7.2 Riesgos de ejecución

- **Los tokens de razonamiento pueden tirar todo el modelo de costo.** D-035 ya
  falló por 6.3× en este repo, y los tres diseños construyeron sobre supuestos que
  no se midieron. Nada se enciende sin una pasada equivalente al `--seco` de la
  flota.
- **La caída silenciosa a plantilla no tiene detector.** Con `finish_reason:
  "length"` documentado, la tasa de caída es el **único** indicador de que se está
  pagando por nada, y en todos los diseños quedó como verbo en infinitivo («hay que
  instrumentar»). Sin métrica, sin umbral y sin auditor, la capa 2 puede volverse
  decorativa sin que nadie lo note.
- **F5 no ha cerrado 6 de las 14 habilidades** `[medido]`: K05, K06, K08, K09, K13,
  K14 no tienen plantilla, ni ítems, ni causas. **Sin causa no hay frase, sin frase
  no hay voz, y sin voz esas habilidades no tienen interfaz en kinder.** Y grabar
  es un **evento de procuración**, no un paso de build que se vuelve a correr: la
  sesión no se puede agendar antes de que F5 cierre el catálogo.
- **Y solo hay niveles 1 y 2 de los tres de kinder** `[medido]`. Las 14 causas son
  la cosecha de 8 habilidades sobre 2 niveles, presentada en varios diseños como
  «kinder entero».
- **Las ~18 animaciones de repetición son ARTE, no código** (Recraft/Gemini), y son
  a la vez la vía del niño sordo, la del aula silenciada **y** el respaldo de toda
  falla de audio. Es una dependencia crítica tratada como entregable paralelo.
- **`audits/precache-budget.mjs` lee un literal `const PRECACHE = [...]` y falla
  cerrado ante algo que no sea literal de cadena.** Un manifiesto de audio por
  locale no puede ser literal: en cuanto entre la voz, el auditor **o queda ciego o
  bloquea por su propia regla**. Tiene que aprender a leer un manifiesto **antes**
  de F6.
- **`audits/locales-complete.mjs` solo inspecciona el nivel superior de
  `apps/web/src/i18n/`:** el subdirectorio `reto/` queda fuera hoy, y un directorio
  nuevo de prompts también. Un locale que falte no bloquearía nada hasta que un
  niño alemán abra la app.
- **Nada obliga a versionar el paquete de voz.** Sin manifiesto con conteo esperado
  de clips por locale verificado en build, un locale sale incompleto (MeloTTS falla
  27.8%) y **nadie lo nota hasta que un niño toca a Larry y no pasa nada**.
- **La brecha estructural que este plan no cierra:** `mc-11` §6 mide tutoría por
  pasos d≈0.76 contra respuesta final d≈0.40. Los cinco formatos de kinder son de
  tocar y **no capturan pasos intermedios**, así que Larry vive en el lado bajo de
  esa brecha. Se anota para que nadie presuma efectividad de tutor inteligente que
  el producto no tiene — **D-033 prohíbe reclamar resultados de aprendizaje sin el
  estudio propio.**

---

## 8. Preguntas para el dueño

> Van a `docs/dudas.md`. Agrupadas, con las alternativas explicadas y una
> recomendación. **Las cuatro primeras son de contradicción entre diseños: no se
> eligió por ti a propósito.**

### Grupo A — ¿Existe Larry en vivo, y para quién?

**P-1. ¿Kinder tiene modelo en vivo, alguna vez?**
Cuatro de los seis diseños dicen que no y dos asumen que sí. D-015 dice «API en
vivo cuando el niño pide más **o comete un error no catalogado**», sin excluir a
kinder.
- **(a) Kinder 100% pregenerado.** 126 pares `(habilidad, causa)` × 7 revisables y
  grabables, cero latencia, cero alucinación, cero costo de inferencia, funciona
  offline, y **el hueco de «matemática fluida pero falsa» desaparece** porque
  ninguna compuerta lo cubre. Cuesta autoría y una sesión de grabación.
- **(b) En vivo con juez anti-vergüenza.** Ahorra autoría; añade costo, latencia
  sobre Android de gama baja, y **un texto nuevo que hay que sintetizar en vivo**
  para un niño que no lee.
- **Recomendación: (a).** Y hay que decirlo con su nombre: **esto ENMIENDA D-015**,
  no la interpreta.

**P-2. Si kinder sale sin modelo, ¿la franja adulta N8-N10 sale con explicación en
vivo, o también solo pregenerada?**
Si es lo segundo, F6 **no construye compuertas, ni juez, ni interruptor** en el
MVP, y esa maquinaria se difiere entera — varios días de trabajo. Precedente ya
escrito en D-035 para la banda Pro: «si no pasa evaluación, la salida no es volver
a Claude, es no soltar la banda con explicación en vivo».
- **Recomendación: pregenerada en el MVP.** N8-N10 no tiene **ni un solo texto de
  retroalimentación hoy**, así que el fail-safe de la única banda en vivo
  descansaría sobre un corpus inexistente.

**P-3. ¿El modelo AÑADE una segunda línea a la pregenerada, o la SUSTITUYE?**
Dos diseños se contradicen (§6.6). «Añade» evita que la vía gratuita se vea
degradada; su crítica responde que presencia/ausencia **es** la comparación.
- **Recomendación: añade** — con la salvedad de que en kinder es imposible de todos
  modos (no se puede pregrabar una línea generada en vivo), así que la pregunta
  solo aplica de PRIMARIA hacia arriba.

**P-4. ¿`intentoEnEsteItem` viaja en el sobre?**
Un diseño lo incluye; su crítica muestra que es el mismo error que ese diseño
denuncia en `rtMs`: permite «es tu tercer intento», feedback de nivel «yo».
- **(a) No viaja.** El selector determinista del servidor sabe el intento y elige
  qué **tipo de ayuda** corresponde; al modelo le llega el tipo, no el conteo.
  Honestidad: como la escalera es fija, «ejemplo trabajado» ⇔ tercer intento — es
  ofuscación, no imposibilidad, y hay que escribirlo así.
- **(b) Viaja, y el prompt prohíbe mencionarlo.** Es una petición, no una garantía.
- **Recomendación: (a).**

### Grupo B — La contradicción con D-021

**P-5. D-021 dice que el plan gratis tiene «Larry con explicaciones
pregeneradas» y el Plan Familia «Larry en vivo ilimitado». ¿La cuota gratuita de
Larry en vivo es CERO?**
Un diseño propuso «12 llamadas gratis» sin notar que D-021 ya lo respondió.
- **Recomendación: cero, tal como dice D-021.** Si el dueño quiere un gusto en el
  gratis, es una **enmienda a D-021**, no una elección de número.

**P-6. D-021 pone «modo sin conexión» en el Plan Familia. ¿El niño gratis puede
jugar offline?**
Toda la §6 asume que sí. Si no, la capa base offline del niño gratis no existe y
el argumento entero cambia.
- **Recomendación: la explicación pregenerada y la práctica offline son gratis
  siempre; lo de pago es la DESCARGA ANTICIPADA masiva (modo avión de varios
  niveles).** Es la lectura que sostiene la línea roja #4, pero cambia lo que D-021
  vende y por eso no se decide aquí.

**P-7. Si existe Larry en vivo de pago, ¿cómo se redacta que eso NO cruza la línea
roja #4?**
El argumento es: no se cobra por practicar ni por recibir explicación —la capa 1
es completa y revisada por humano— se cobra la explicación **adicional** bajo
demanda. **Creo que se sostiene; es una afirmación que el dueño tiene que
respaldar con sus palabras**, porque el muro de pago quedaría exactamente en el
momento «no entendí».

### Grupo C — Contenido y esquema del ítem

**P-8. ¿`tambienCorrectas[].razon` se convierte en clave de mensaje cerrada?**
D-048 dice literal «el ítem guarda **una justificación por opción correcta**».
- **(a) Clave cerrada.** Cierra la última puerta por la que texto libre y números
  llegan al tutor, y es coherente con `causa`, que ya es clave «porque traducirla
  aquí pondría texto de interfaz en el banco».
- **(b) Sigue siendo prosa.** «Sobra el 8 porque es par» y «sobra el 9 porque no
  está en la tabla del 2» **no son enumerables**: convertirlas en claves cambia lo
  que D-048 le pide al autor.
- **Recomendación: (a) para el MVP**, con la advertencia honesta de que **esto es
  cambiar D-048, no implementarla**. Hoy hay 0 ítems con `tambienCorrectas`, así
  que cerrarlo ahora es gratis y cerrarlo después es una migración.

**P-9. ¿Qué se hace con los 45 ítems de K12 que ofrecen un distractor negativo a un
niño de cuatro años?**
- **Recomendación: arreglar la plantilla en F5.** Es un bug de ítem, no un clip que
  no suena.

**P-10. ¿F6 saca voz para las 8 habilidades que tienen ítems, o espera a que F5
cierre las 6 que faltan (K05, K06, K08, K09, K13, K14)?**
Sacar 8 de 14 significa que **en 6 lugares de la Sabana Larry no dice nada**. Y
grabar es un evento de procuración que no se repite barato.
- **Recomendación: esperar a F5 para la sesión de grabación**, y avanzar en todo lo
  demás mientras tanto.

**P-11. Variación del texto: ¿cuántas variantes por causa, y varía el acierto?**
`acierto` es hoy una sola cadena invariable en los siete locales.
- **(a) Sin variantes.** Un niño oye la misma frase hasta seis veces en una serie
  de fluidez.
- **(b) Tres variantes.** Triplica la sesión de grabación de esa frase (~+400 KB
  por locale `[estimado]`).
- **Recomendación: tres variantes para las frases que más se repiten
  (`inesperada` por formato y las causas de K07/K10/K12), una sola para el resto; y
  el ACIERTO se queda plano** — toda la calidez la cargan la animación y el sonido,
  nunca los adjetivos sobre el niño.

### Grupo D — La falla repetida

**P-12. ¿Se adoptan los topes de la escalera (máx. 3 servidas del mismo ítem por
sesión, y ≥24 h sin que el motor elija una habilidad tras 4 fallas)?**
Son criterio propio sin ninguna fuente, y chocan con D-019 (la Sabana es una
cadena de desbloqueo: pausar una habilidad deja el lugar siguiente bloqueado, y
bajar al prerrequisito **se ve** como ir hacia atrás aunque el texto no lo diga) y
rozan la línea roja #4 («sin energía que se agote»).
- **Recomendación: adoptar solo el peldaño 4 (bajar al prerrequisito) SIN tope
  temporal ni contador visible.** El niño puede reintentar el ítem cuantas veces
  quiera; lo que cambia es qué le sirve el motor a continuación. Y si alguna vez la
  interfaz dibuja un candado sobre una habilidad pausada, **cruza la línea roja #4
  sin que nadie haya decidido cruzarla** — `larry-escalera.mjs` puede comprobar el
  motor, no puede comprobar que un diseñador no dibuje un candado.

**P-13. Cuando el modelo cruza la línea anti-vergüenza, ¿cero reintentos o uno?**
- **(a) Cero.** La prohibición ya estaba en el prompt; reintentar es pedirle otra
  vez que hable del niño. Cambia una probabilidad por una garantía.
- **(b) Uno correctivo.** Es lo que hace casi todo el mundo y probablemente
  funcionaría la mayoría de las veces; conserva una explicación mejor en la banda
  adulta.
- **Recomendación: (a).**

**P-14. El interruptor automático: umbral y reactivación.**
Los umbrales propuestos (>2% en 1,000 rodantes, >5 en 100) son incoherentes entre
sí y **la ventana de 1,000 no se llena en semanas** con el volumen del MVP.
- **Recomendación: un solo umbral absoluto y pequeño (p. ej. 5 descartes en una
  ventana de 100, sin ventana grande) y reactivación A MANO.** Un apagado que se
  cura solo esconde un problema que empeora.

### Grupo E — Gasto e infraestructura

**P-15. Mover el limitador real al Durable Object ENMIENDA D-015 («límite de gasto
por perfil/día vía AI Gateway»). ¿Se aprueba la enmienda?**
El Gateway se queda como red de seguridad en dólares; el DO decide antes de gastar
y elige la degradación pedagógica. **Recomendación: sí**, y anotarlo como enmienda
con fecha, no como detalle.

**P-16. ¿El niño ve algo cuando Larry degrada?**
- **(a) Nada.** Larry simplemente explica de otra manera.
- **(b) Un aviso honesto y sin culpa** («Larry te lo va a contar de otra manera»).
  Más transparente; abre la puerta a que algún día ese texto mencione el plan.
- **Recomendación: (a).**

**P-17. ¿El panel del padre muestra el uso de Larry por hijo?**
«Tu hijo pidió ayuda 40 veces» es un dato que puede convertirse en regaño en casa
—avergonzar por la puerta de atrás—, y **el informe de fracaso es precisamente el
disparador que Maloney et al. (2015, 438 niños) condiciona:** la ansiedad
matemática del padre se transmite **solo** cuando el padre ansioso ayuda con
frecuencia.
- **Recomendación: agregado por cuenta, nunca por hijo**, y **Larry nunca le
  sugiere al padre que practique con su hijo** hasta que exista el andamiaje que
  `mc-10` pide (decirle CÓMO ayudar sin transmitir ansiedad), que no es contenido
  que hoy tengamos ni sepamos autorar. Compárese con D-020, que para el caso
  análogo pide «una nota suave», no un conteo.

**P-18. ¿Se acepta un gasto de medición ANTES de construir F6?**
~$5 y una tarde: 50 explicaciones reales por banda para fijar el perfil de tokens
de razonamiento, una llamada para comprobar si `metadata` llega al Gateway desde
`env.AI.run()`, y otra para comprobar si **AI Gateway calcula costo para modelos
`@cf/`** — porque si no, el tope de dólares nunca dispara.
- **Recomendación: sí, es el primer entregable de F6.** Sin eso, los tres números
  centrales de esta fase siguen siendo estimaciones.

### Grupo F — Voz

**P-19. ¿Dónde se genera la voz, sabiendo que Workers AI no cubre 4 de los 7
locales?**
- **(a) Fuera de Cloudflare, en tiempo de compilación** (lo que se despliega son
  bytes estáticos). Precedente disponible: CLAUDE.md § Imágenes ya autoriza Recraft
  y Gemini fuera de Cloudflare para generar arte. **Si el audio es arte, aplica el
  mismo permiso — y eso lo dices tú, no lo deduce un diseño.**
- **(b) Lanzar kinder solo en en/es.** **Esto revierte D-022** («los 5 idiomas
  desde el lanzamiento de kinder»), y hay que decirlo así.
- **(c) MeloTTS** con 27.8% de fallos medidos y fonología alemana/portuguesa sin
  verificar.
- **Recomendación: (a).** (c) me parece indefendible; (b) revierte una decisión
  tuya.

**P-20. ¿Quién es la voz de Larry?**
Sintética / talento humano de doblaje por locale (con contrato de uso comercial y
derechos de regrabación, `mc-42` §11) / híbrido. **Con cualquiera de las tres,
Larry NO suena igual en los siete países** —los paquetes de hablantes son
distintos por idioma— y eso toca el canon de D-004.
- **Recomendación: humano en `en` y `es-MX` (locales de lanzamiento), sintético
  revisado en el resto**, y decirlo en el canon en vez de fingir que es una sola
  voz.

**P-21. ¿24 kbps o 16 kbps?**
16 ahorra 32% `[medido]` y decide si el modo avión cabe. **No se decide con una
tabla: hace falta escuchar los dos en la bocina de un Android de gama baja, con un
niño de cuatro años delante.**

**P-22. ¿Quién revisa el corpus, y quién ESCUCHA?**
Los textos necesitan revisión humana antes de existir (CLAUDE.md § Contenido) y
**toda la carta anti-vergüenza se verifica leyendo, cuando en kinder el niño
escucha**. Hoy no hay revisor pedagógico contratado por locale, y **sin revisor el
camino de kinder no puede encenderse**. ¿Los siete autores nativos de D-022 —que
ya están en la ruta crítica más larga del plan— o un revisor aparte?

**P-23. ¿El padre tiene interruptor de transcripción/subtítulo?**
Sirve al **padre que co-juega** (`mc-20` §10, pilar «socialmente interactivo» de
Hirsh-Pasek) y **no** al niño, que no lee. ¿Se ofrece? ¿Viene encendido en un
perfil marcado como con necesidad de apoyo?

---

## 9. Lo que este plan NO resuelve

**Cosas que quedan explícitamente fuera, con su razón:**

1. **La brecha de tutoría por pasos.** `mc-11` §6: d≈0.76 por paso contra d≈0.40
   por respuesta final. Los cinco formatos de kinder son de tocar y no capturan
   pasos intermedios. Este plan **no lo arregla ni pretende arreglarlo** — se anota
   para que nadie presuma efectividad que el producto no tiene (D-033).
2. **Matemática falsa en salida generada.** Ninguna de las cuatro compuertas la
   atrapa. La única mitigación real es no tener camino en vivo en kinder (P-1); de
   PRIMARIA hacia arriba el hueco queda abierto y medido, no cerrado.
3. **El ejemplo trabajado del peldaño 3.** Necesita **pasos intermedios** («7 y 3
   son 10, y 2 más, 12») que no están en el ítem ni en el sobre. O el veredicto
   trae los pasos **precomputados por el motor** —que nadie ha diseñado— o el
   peldaño 3 no puede existir en vivo sin cruzar la línea roja #7. **Este plan no
   diseña ese campo.**
4. **La autenticación de `POST /api/reto`.** Sin identidad no hay perfil que
   contar, `banda` y `locale` no tienen de dónde salir, y el endpoint **ya es un
   oráculo de respuestas**. Es prerrequisito de §5 y no es trabajo de F6.
5. **El disparador «cuéntame más» / «no entendí».** Existe en D-015 pero nadie lo
   diseñó: qué pictograma, cuántas veces por reto, qué saca (andamiaje o ejemplo
   trabajado), y **qué devuelve si se toca dos veces** — la llave de caché
   `(habilidad, causa, banda, locale)` **no tiene eje de turno**, así que hoy
   devolvería lo mismo. El arreglo obvio (eje de profundidad) es construir una
   conversación por turnos con un niño.
6. **El presupuesto T3 (audio sonando).** En kinder la capa en vivo no termina
   cuando el modelo responde: termina cuando **empieza a sonar el audio**. Nadie ha
   medido `melotts` en este proyecto, y `mc-34` §84 marca su cobertura de locales
   como no verificada.
7. **El costo real por perfil y por mes.** `docs/master-plan.md:586` ya lista
   «Costo de Larry por perfil activo al mes» con un guion. **F6 lo deja igual de
   abierto**, porque no hay modelo de volumen y las tres estimaciones que circulan
   son incompatibles entre sí.
8. **La cobertura de kinder.** 8 de 14 habilidades, 2 de 3 niveles, 185 de los ~400
   ítems que D-018 presupuesta `[medido]`. Todo lo que este plan dimensiona
   —frases, bytes, cadenas, sesión de grabación— es sobre **poco más de la mitad**
   de kinder, y el catálogo de causas puede crecer cuando entre el ~29% redactado
   con IA y el ~31% escrito a mano (`mc-40`, D-006).
9. **El corpus de retroalimentación de la franja adulta N8-N10.** Cero textos hoy.
   D-034 presupuestó «una sola autoría, siete renders de notación» para la
   **estructura** del ítem; **la prosa de tutor sí son siete autorías** y no está
   en ningún barandal.
10. **La entonación.** Un texto puede pasar las siete compuertas y sonar
    condescendiente por el ritmo o la pausa. No hay auditor para eso y no se
    propone uno.
11. **El purgado de iOS.** `mc-33` §4: ITP purga Cache API / IndexedDB a los 7 días
    sin interacción y **solo las apps instaladas están exentas**. D-041 hace del
    iPad primera clase. El estado de instalación tiene que ser parte del diseño de
    audio, y este plan solo lo nombra.
12. **La interacción con D-014/D-016.** Si una misión diaria pide una habilidad que
    el motor acaba de pausar, el sistema apaga por su cuenta el camino a la racha.
    **No analizado y no descartado.**
