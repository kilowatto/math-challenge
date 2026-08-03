# Dudas pendientes

> Lo que no pude decidir solo, con lo que ya avancé alrededor de cada duda para
> que ninguna esté bloqueando trabajo. Cada entrada dice **qué asumí mientras
> tanto**, para que cambiar la respuesta sea una edición y no un rehacer.
>
> Convención: se contesta borrando la entrada y anotando la decisión en
> `docs/decisions.md` con fecha. Una duda contestada que se queda aquí es ruido.

Abierto el 2026-07-31 de madrugada, mientras el dueño dormía.

---

## 1. `es-MX` y `fr-FR` no tienen ni una traducción, y son los dos mercados grandes

**El hecho.** Al pausar (D-050) el reparto quedó así: `pt-BR` 47/47, `pt-PT`
47/47, `de-DE` 39/47, `es-ES` 10/47, **`es-MX` 0/47, `fr-FR` 0/47**.

**Por qué es raro.** El orden lo eligió quien lanzó las corridas, no el valor de
mercado. Terminamos con el portugués completo —dos locales, ambos completos— y
el español de México, que es probablemente el mercado número uno de este
producto, en cero.

**Lo que asumí.** Nada: está pausado y el manual (`docs/traduccion.md` §11) fija
el orden de reanudación por valor de mercado, empezando por `es-MX`.

**La duda real.** ¿El corpus en español mexicano vale los ~$0.76 y las ~2.2 horas
que cuesta, antes que cualquier otra cosa de F3/F4? Yo diría que sí y que es
barato. Pero D-050 dice pausado, y pausado significa pausado.

---

## 2. El 56% de lo traducido tiene hallazgos, y casi todos son el mismo error

**El hecho.** 74 de 131 documentos medidos fallan `corpus-integridad`. Mirando
los hallazgos uno por uno, la mayoría son un solo error con dos síntomas: el
modelo dejó `3.2` sin convertir a `3,2`, y el verificador lo reporta como número
perdido *y* como convención decimal rota.

**Por qué importa.** Si es eso, **no hace falta retraducir nada**: se puede
arreglar con una pasada determinista que reformatee decimales según la ficha del
locale, sin volver a llamar al modelo. Sería ~$0 y minutos, contra ~$2 y horas.

**Lo que asumí.** Que sí hace falta verificarlo antes de creerlo — exactamente el
error que ya cometí esta noche al reportar dos veces un conteo de traducción sin
comprobar el medidor. No escribí el arreglo automático.

**La duda real.** ¿Escribo `scripts/arreglar-decimales.mjs` que reformatee y
vuelva a verificar? Tiene un riesgo obvio: un reformateador que se equivoca
cambia cifras en un corpus público, que es justo lo que D-033 protege. Yo lo
haría **solo** si al terminar corre `corpus-integridad` y revierte el archivo
entero si empeora.

---

## 3. La traducción no se dejaba matar, y eso dice algo del arranque

**El hecho.** Al pausar, `pkill` sobre los traductores no sirvió: había un
`xargs -P 8` relanzando el siguiente documento cada vez que moría uno, y arriba
de él un guion en el scratchpad que a su vez volvía. Tuve que matar el grupo de
procesos entero y neutralizar el guion. Reporté "detenida" antes de que lo
estuviera; eran ocho procesos vivos escribiendo archivos.

**Por qué importa más allá del susto.** Cualquier corrida larga de este proyecto
—traducción, auditoría adversarial, generación de ítems— tiene el mismo problema:
**no hay una forma declarada de pararla**. Se lanza con un guion desechable en un
directorio temporal y luego no hay un botón.

**Lo que asumí.** Que `docs/traduccion.md` documenta cómo se corre, y que hace
falta también documentar cómo se para.

**La duda real.** ¿Vale la pena un `scripts/correr-lote.mjs` de verdad —con
archivo de PID, `--parar`, y registro de avance reanudable— en vez de guiones
desechables? Es media hora de trabajo y evita repetir esto en cada lote.

---

## 4. `es-ES` tiene 10 traducidos pero solo 8 verificados

**El hecho.** El conteo de integridad se sacó cuando `es-ES` iba en 8; la corrida
alcanzó a escribir 2 más antes de que la matara. Lo mismo con `de-DE`: 29
verificados de 39 traducidos.

**Lo que asumí.** Lo anoté explícitamente en la tabla de `docs/traduccion.md` en
vez de extrapolar en silencio. Un número extrapolado sin decirlo es cómo se
fabrica una afirmación con tono seguro.

**La duda real.** Ninguna, en realidad — basta con volver a correr
`corpus-integridad` sobre los cuatro locales cuando se retome. Lo dejo escrito
para que nadie use la tabla como si estuviera completa.

---

## 5. El corpus se sirve declarando `inLanguage: "en"` en seis locales

**El hecho.** Las páginas de `/investigacion/` en `de-DE`, `fr-FR`, etc. declaran
en su JSON-LD que el contenido está en inglés, porque **lo está**.
`audits/jsonld-valid.mjs` bloquea por eso, y tiene razón.

**Por qué no lo "arreglé".** Cambiar la declaración a `de-DE` sin traducir el
cuerpo sería mentirle a Google y a los modelos generativos sobre el idioma del
contenido — y es exactamente la clase de cosa que el dueño prohibió con "nunca
mentimos". El auditor rojo aquí es información correcta, no un obstáculo.

**Lo que asumí.** Que se queda rojo hasta que haya traducción, y que eso es la
respuesta correcta.

**La duda real.** ¿Servimos esas páginas con un aviso visible al lector —«este
documento aún no está traducido al alemán»— en vez de solo declararlo en el
JSON-LD que nadie ve? Yo diría que sí: es honesto con la persona, no solo con el
buscador.

---

## 6. Los segmentos de URL traducidos rompen las URL ya desplegadas

**El hecho.** Está decidido traducir el segmento (`/de-DE/forschung/` en vez de
`/de-DE/investigacion/`). Las URL viejas llevan horas en producción y ya están en
el `sitemap.xml`.

**Lo que asumí.** Que hay que dejar redirecciones 301 permanentes desde lo viejo,
no romperlas y ya. Lleva horas en línea, no meses, así que el costo es mínimo —
pero un 404 en una URL que ya publicamos es un 404 igual.

**La duda real.** ¿Cuánto tiempo se mantienen esas redirecciones? Mi respuesta
por omisión es "para siempre, cuestan una entrada en una tabla", pero si se
prefiere limpiarlas en seis meses, hay que anotarlo ahora o nadie se acordará.

---

## 7. Trece auditores nacen antes que el código que vigilan

**El hecho.** Está decidido construirlos ya. Nacen en PENDIENTE y no bloquean
nada hasta que abra su fase.

**El riesgo que veo, dicho antes de que pase.** Un auditor escrito contra código
que no existe **no se puede ver fallar**, y la regla 3 de CLAUDE.md dice que una
prueba que nunca se vio fallar no prueba nada. Mi plan es escribir para cada uno
un caso falso —un archivo de mentira que viole la regla— correrlo, verlo fallar,
y pegar esa salida. Eso sí cumple la regla, pero es más trabajo por auditor.

**La duda real.** ¿Se acepta ese sustituto —fallar contra un caso fabricado en
vez de contra código real— como evidencia suficiente para dar por bueno un
auditor? Yo creo que sí, y creo que es la única opción coherente con «escribir el
guardián antes que lo que vigila».

---

## 8. Nadie ha visto el sitio con los ojos

**El hecho.** Hay 372 páginas desplegadas y verificadas con `curl`: códigos 200,
JSON-LD presente, hreflang recíproco, presupuestos de peso. **Ninguna persona ni
yo hemos mirado cómo se ven.**

**Por qué lo digo aquí.** Porque todo lo que reporto del sitio es cierto y aun
así podría verse mal: un `curl` no ve un texto que se sale de su caja, un
contraste insuficiente ni una tabla que desborda en un iPad en Split View — que
es justamente lo que `ipad-usabilidad` declara que **no** puede comprobar.

**Lo que asumí.** Que sigo construyendo, y que esto queda anotado como el hueco
más grande que tiene hoy el proyecto.

## 9. JR y PRO cubren los mismos niveles con parámetros distintos

**El hecho.** D-017 dice `PRO | Jr / profesional | N11–N12` — una sola fila para
las dos. D-010 les da parámetros **distintos**: JR con `d=30, a=0.8`, PRO con
`d=20, a=1.0`. Los dos documentos son correctos por separado y juntos no deciden
nada: dado un ítem de N11, no hay regla que diga si se puntúa como JR o como PRO.

**Lo que asumí.** Codifiqué las dos bandas con el mismo rango `N11–N12`, que es
lo que literalmente dicen los documentos, y `audits/tabla-bandas.mjs` lo cruza
contra ellos en cada commit. No inventé una regla de desempate.

**La duda real.** ¿Qué distingue a un JR de un PRO — el ítem, el perfil, o el
modo de juego? Mi lectura es que **es el perfil**, no el ítem: el mismo problema
de olimpiada vale distinto según quién lo resuelve, igual que un tiempo de 100 m
se juzga distinto en juvenil que en absoluto. Si es así, la banda sale del perfil
y el nivel del ítem, y no hay conflicto — pero eso hay que escribirlo, porque hoy
un lector honesto de D-010 y D-017 no puede deducirlo.

**Bloquea F4**, no F3: el motor ya funciona con cualquiera de las dos lecturas.

---

## 10. El motor rechazaba dos de los doce niveles y las pruebas lo aprobaban

**El hecho.** Escribí `valorDelItem` rechazando por encima de N10, y escribí un
caso que afirmaba «fuera de la escalera 1..10 de D-017, lanza». El caso pasaba.
D-017 dice **doce** niveles, y N11–N12 son precisamente los de PRO.

**Cómo se encontró.** No por una prueba: leyendo el criterio de aceptación de
F3 antes de cerrarlo, que lista `N12 = 1,759` como vector. Si hubiera cerrado el
criterio por criterio propio —que es lo que el texto de cada sub-issue advierte
que no se haga— el bug habría sobrevivido hasta que alguien creara contenido de
PRO.

**No es una duda, es una advertencia.** La anoto aquí porque el patrón importa:
**una prueba escrita por quien escribió el código codifica el mismo error.** Los
19 casos del motor los escribí yo contra mi propia lectura de D-010, y uno de
ellos estaba defendiendo un bug. Los vectores que salvaron el día no eran míos:
venían del criterio, escrito antes y por otra pasada.

**Lo que asumí.** Que los criterios de aceptación se leen enteros antes de tocar
nada, y que los vectores numéricos que traigan se copian a las pruebas tal cual.

---

## 11. Un workflow de traducción terminó DESPUÉS de que D-050 la pausara

**El hecho.** Un workflow lanzado antes de la decisión siguió corriendo 4.5 horas
y terminó a las 04:56, con D-050 ya escrita. Dejó 47 archivos de `es-ES` en el
árbol de trabajo, sin commitear, por **$2.56 medidos**.

**Lo que asumí.** Que pausar es «no lanzar más», no «tirar lo que ya se pagó». Los
commiteé después de comprobar tres cosas: que la integridad no empeora (10
documentos con hallazgo antes y después), que el cambio es una mejora real —traduce
los títulos, que la pasada anterior había dejado en inglés— y que arregla un error
de fondo: el README decía «Desafío Matemático», y **el nombre del producto es
nombre propio y no se traduce**.

**La duda real.** ¿Fue correcto? El argumento en contra es que `es-ES` sube a 43 de
47 mientras `es-MX` sigue en cero, y eso profundiza el desbalance de la duda §1: el
mercado más grande sigue sin nada.

---

## 12. `es-MX` y `fr-FR` los bloqueó un clasificador de seguridad

**El hecho.** De los nueve agentes del workflow, dos fallaron sin llegar a
traducir: `traduce:es-MX` y `traduce:fr-FR`, los dos con
`blocked by safety classifier: Stage 2 classifier error`. El propio mensaje dice
que suele ser transitorio y que reintentar funciona.

**Por qué importa más de lo que parece.** Son exactamente los dos locales que
seguían en cero, y son los dos mercados grandes. No es que el trabajo saliera mal:
es que no se intentó. Si no se anota, dentro de un mes la lectura será «esos dos
son difíciles» cuando la verdad es «esos dos nunca corrieron».

**Lo que asumí.** No reintenté: D-050 dice pausado, y reintentar sería lanzar
traducción nueva, que es justo lo que la decisión prohíbe.

---

## 13. Un agente reportó un defecto que no existe

**El hecho.** El mismo workflow reportó, con detalle convincente, que
`de-DE/mc-48` tenía «7 literales perdidos, `WCAG 2.2` convertido a `WCAG 2,2`
siete veces». Fui a comprobarlo: **`grep "WCAG 2,2"` no devuelve nada** y
`corpus-integridad` da ese archivo por limpio, con sus 6 marcas `[unverified]`
intactas.

**Por qué lo dejo escrito aunque no haya nada que arreglar.** Es el mismo patrón
que ya costó caro esta noche con `locale-pt-PT`: un agente describe un defecto
plausible, con conteo exacto y explicación correcta de por qué sería grave —una
versión de norma no es una cantidad y no lleva coma— y el defecto no está ahí. La
explicación es buena; el hecho es falso.

**Lo que asumí.** Que ningún reporte de un agente se actúa sin verificarlo contra
el archivo. Es barato comprobarlo y caro no hacerlo.

---

## 14. El naranja de Ignia falla el umbral de GRÁFICO sobre la superficie real

**El hecho.** `audits/contrast.mjs` corrió por primera vez —llevaba escrito y en
la lista de pendientes— y encontró tres pares que no pasan:

```
--color-accent      (#F36B1C) sobre --color-surface (#F7F7F8) — 2.83:1, exige 3:1  (gráfico)
--color-text-muted  (#727476) sobre --color-surface (#F7F7F8) — 4.38:1, exige 4.5:1 (texto)
--color-text-brand-warm (#CE4912) sobre --color-surface (#F7F7F8) — 4.28:1, exige 4.5:1 (texto)
```

**Por qué el primero es distinto de lo que ya sabíamos.** CLAUDE.md dice que
`#F36B1C` da **3.03:1 sobre blanco** y por eso no sirve para texto normal, pero sí
para títulos grandes, botones y gráficos. Eso es cierto **sobre blanco puro**. La
superficie real del sitio no es blanca, es `#F7F7F8`, y contra ella el mismo
naranja da **2.83:1** — por debajo del 3:1 que exige un elemento gráfico o un
control. O sea: el color de la marca no alcanza ni para el uso que teníamos por
bueno.

**Lo que asumí.** Nada: no toqué la paleta. Cambiar el color de la marca es
decisión del dueño, no mía, y `contrast` sigue en la lista de pendientes en vez de
bloquear cada commit.

**Las salidas, con su costo:**

1. **Oscurecer el naranja** solo para bordes y controles —un `--color-accent-borde`
   más oscuro— y dejar `#F36B1C` para superficies grandes donde no aplica umbral.
   Es lo que hacen casi todas las marcas con naranja. Conserva la identidad.
2. **Aclarar la superficie a blanco puro.** Recupera el 3.03:1 documentado, pero
   `#F7F7F8` está ahí para que las tarjetas se distingan del fondo.
3. **Aceptarlo y anularlo por escrito**, que es lo que permite D-032. Yo no lo
   haría: es el color del producto entero y el umbral de 3:1 existe para que un
   borde se vea con luz de sol en un teléfono de gama baja, que es exactamente
   nuestro dispositivo de referencia.

Mi recomendación es la 1. `--color-text-muted` y `--color-text-brand-warm` se
arreglan solos oscureciéndolos un paso, y ésos sí los haría sin preguntar si me
dices que sí a la 1.

### RESUELTA · 2026-08-01 — el dueño eligió la 2, la que yo no recomendaba

`--color-surface: #F7F7F8` → `#FFFFFF`. **Ningún color de marca cambió**, que es
lo que la salida 1 no conseguía: oscurecer el naranja para bordes habría metido
un segundo naranja al producto.

Los tres pares medidos después del cambio:

```
--color-accent          2.83:1 → 3.03:1  (exige 3:1, gráfico)   ✓
--color-text-muted      4.38:1 → 4.58:1  (exige 4.5:1, texto)   ✓
--color-text-brand-warm 4.28:1 → 4.69:1  (exige 4.5:1, texto)   ✓
```

El 3.03:1 pasa por **0.03**, y eso hay que decirlo en vez de celebrarlo: el
naranja de Ignia sigue sin servir para texto normal en ningún fondo, y cualquier
superficie que no sea blanco puro lo vuelve a tumbar. Por eso `contrast` pasó de
PENDING a ACTIVO en `audits/run.mjs` — no para festejar el verde, sino para que
el día que alguien vuelva a poner un gris de fondo, el commit se detenga.

**La segunda mitad de esta duda, la del espaciado**, se resolvió el mismo día:
`guia-de-estilo.md` cita mc-21 con «0.12em / 0.16em / 1.5×» y **ésas son
literalmente las cifras de WCAG 1.4.12**, una pauta que no pide aplicarlas sino
*aguantarlas*. Decisión: **tolerar, no aplicar**. `--tracking-readable: 0.012em`
—diez veces menos— se queda como decisión estética, y lo que faltaba era la
prueba: `audits/espaciado-tolerante.mjs`. Lo que ese auditor **no** puede
comprobar está escrito en su encabezado: si el texto de verdad desborda exige un
motor de maquetación midiendo, y su verde significa «no tiene las formas que lo
rompen», no «cumple 1.4.12».

---

## F6 · El camino EN VIVO ya está construido, y descansa sobre cuatro supuestos · 2026-08-02

**El hecho.** El criterio #136 está implementado: camino en vivo sobre Workers
AI, ruteo de modelo por complejidad, tope de gasto por perfil y por día, y los
interruptores por banda. **Está apagado**, y no por precaución retórica: sin el
secreto `TUTOR_PD_SECRET` no se llama al modelo en absoluto, y sin él no hay
seudónimo diario con el que contar el gasto de un perfil. Encenderlo son tres
acciones deliberadas —crear el AI Gateway, poner el secreto, marcar el plan de
una cuenta como `familia`— y ninguna ocurre sola.

Las 23 preguntas de la entrada de abajo siguen abiertas. Lo que sigue es lo que
**tuve que suponer para poder construir**, escrito para que cambiar la respuesta
sea editar una constante y no rehacer una fase.

**1. Seguí el PLAN y no el issue, en dónde vive el tope.** El issue #136 dice
«vía AI Gateway» (que viene de D-015); el plan §5.1 lo mueve al Durable Object y
lo llama enmienda, que es la pregunta **P-15**. Seguí el plan porque el Gateway
no puede hacer lo único que este producto quiere que pase al tocar el tope:
servir la explicación pregenerada revisada por humano. Puede devolver 429 o
cambiar a un modelo más barato, y lo segundo es justo lo que D-035 prohíbe en la
banda Pro. El Gateway se queda como red de seguridad en dólares. **Si la
respuesta a P-15 es no, lo que cambia es de sitio, no de comportamiento.**

**2. Los números del tope son `[estimado]` y uno no tiene de dónde derivarse.**
El de un perfil de niño **sí** se deriva, y la cuenta está en el código:
$8/mes (piso de D-021) ÷ 6 perfiles ÷ 30 días × 20% = **8.888 µ$ ≈ $0.0089 al
día**. El 20% es criterio mío; el resto es D-021.

El de un perfil **adulto** no se deriva de nada, porque **no hay precio de
adulto en ninguna decisión**: D-021 fija el Plan Familia y D-034 hace del adulto
que practica solo un caso de primera clase, pero nadie ha decidido qué paga.
Puse **60.000 µ$ = $0.06 al día**, que sería un quinto de una suscripción
individual de unos $9 al mes. Es más alto que el del niño porque el modelo es
otro: `kimi-k2.6` cuesta 5.3× más por token de salida que `gpt-oss-120b`, y un
tope idéntico dejaría la banda adulta sin ni una llamada. **La duda: ¿cuál es el
precio del adulto?** Con ese número, este tope se deriva igual que el otro.

Y el aviso que el plan §5.4 ya daba, que sigue vigente: las tres estimaciones de
costo que circulan son incompatibles entre sí, y la que decide todo —los tokens
de razonamiento— este repo ya la falló por **6.3×** (D-035 hallazgo 3). Por eso
la medición de **P-18** (~$5 y una tarde) sigue siendo el primer entregable
pendiente de verdad de esta fase.

**3. Encendí PRIMARIA, SECUNDARIA y SERIO; dejé KINDER y PRO apagadas.** Es la
recomendación (a) de **P-1** para kinder y la condición de D-035 para Pro, y las
dos son un valor por defecto en el código que una llave de `CONFIG_KV` puede
cambiar sin desplegar — que es exactamente lo que el encargo pedía para Pro. Si
la respuesta a P-1 es que kinder sí tiene modelo en vivo, se enciende una llave.
Nota que no depende de P-1: en kinder el niño **no lee, escucha**, y una línea
generada en vivo no se puede pregrabar (§4.1), así que hoy un texto en vivo en
kinder es un texto que nadie oiría.

**4. El plan gratis es CERO llamadas en vivo**, que es lo que D-021 ya decía y la
recomendación de **P-5**. No inventé una cuota de cortesía. Si el dueño quiere
un gusto en el gratis, es una **enmienda a D-021**.

**Lo que NO construí, y por qué.** La cuarta compuerta —el **juez**, una segunda
llamada con la rúbrica anti-vergüenza sola— no está. Depende de P-1, P-2 y P-13,
que están abiertas; **duplica el costo por turno**, que es justo el número que
P-18 todavía no ha medido; y el plan §2.5 ya avisa de que comparte punto ciego
con el tutor, porque los dos corren sobre la misma familia de modelos en la
misma cuenta. Las tres compuertas deterministas —estructural, léxica y de forma—
sí están, corren dentro del Worker, no cuestan nada y se midieron contra los 119
mensajes ya autorados.

---

## F6 · Larry Profe — 23 preguntas, agrupadas · 2026-08-01

**El hecho.** Se consolidaron seis diseños de F6 y sus seis críticas
adversariales en [`docs/planes/f6-larry-profe.md`](planes/f6-larry-profe.md).
Veintitrés preguntas quedaron sin poder decidirse solas, y **cuatro de ellas son
contradicciones frontales entre diseños**, no dudas de matiz.

**Lo que asumí.** Todo lo que no depende de estas respuestas ya está decidido en
ese documento — el contrato del sobre, la carta anti-vergüenza, la frontera de
prompts, la cuenta de bytes del audio y la capa offline. Las 23 preguntas están
en su §8, cada una con las alternativas explicadas y una recomendación, y no se
repiten aquí para que no haya dos copias que envejezcan distinto.

**Las cuatro que bloquean todo lo demás:**

1. **P-1 — ¿Kinder tiene modelo en vivo, alguna vez?** Cuatro diseños dicen que
   no, dos asumen que sí. Es la palanca de alcance más grande de la fase entera.
   Cerrarla en «no» **enmienda D-015**, no la interpreta.
2. **P-5 — D-021 dice que el plan gratis tiene «Larry con explicaciones
   pregeneradas» y el de pago «Larry en vivo ilimitado».** ¿La cuota gratuita de
   Larry en vivo es **cero**? Un diseño propuso 12 llamadas gratis sin notar que
   D-021 ya lo respondió.
3. **P-6 — D-021 pone «modo sin conexión» en el Plan Familia.** ¿El niño gratis
   puede jugar offline? Toda la capa offline asume que sí.
4. **P-19 — Workers AI no tiene voz verificada para `fr-FR`, `pt-BR`, `pt-PT` ni
   `de-DE`** (4 de 7 locales, medido). Generar la voz fuera de Cloudflare toca
   D-035; lanzar solo en en/es revierte D-022. Ninguna de las dos la decido yo.

**Cómo se contesta.** Igual que el resto: confirmando o cambiando la
recomendación de cada una en §8 del plan. Lo que se decida va a
`docs/decisions.md` con fecha, y esta entrada desaparece.

---

**Cómo se contesta esto.** Preferentemente en preguntas de opción múltiple —
cada entrada de arriba ya tiene mi recomendación, así que basta con confirmarla o
cambiarla. Lo que se decida va a `docs/decisions.md` con fecha, y la entrada
desaparece de aquí.

## F2 · Cómo quitar `birth_month` sin apagar un guardián de línea roja · 2026-08-01

**El hecho.** D-053 decidió que del niño se pide solo el año.
`child_profiles.birth_month` es `NOT NULL`, así que dejar de pedirlo no basta:
quien inserte un perfil tiene que dar un valor. Quitar la columna exige la
reconstrucción de 12 pasos de SQLite, y `audits/migration-safety.mjs` la bloquea:

    la reconstrucción de child_profiles deja fuera la columna "birth_month":
    es un DROP COLUMN escrito de otra forma

Sobre `child_profiles` ese bloqueo **no se puede anular con un comentario**,
igual que sobre `consent_records`, y eso es deliberado: el borrado de datos de un
menor va por el runbook de erasure, que toca cuatro sistemas (`mc-32` riesgo #7).

**Lo que asumí para no detenerme.** La migración 0004 salió sin esa parte, con el
residuo escrito en el propio archivo. `birth_month` sigue existiendo y sigue
siendo `NOT NULL`; la puerta del padre **no lo va a preguntar**.

**La tensión, en una frase.** El auditor protege contra perder datos de un menor
sin querer. Aquí perderlos es el objetivo — es minimización, D-013 funcionando,
no fallando. La regla mecánica no distingue las dos cosas porque desde el SQL se
ven idénticas.

**Tres salidas, con lo que cuesta cada una:**

1. **Un marcador propio y más estrecho**, distinto del genérico:
   `-- migration-safety-minimizacion: birth_month — <razón>`, que además **exija
   nombrar la columna**. Un borrado accidental nunca nombra la columna que borra,
   así que el bloqueo sigue en pie para el caso que importa. Es la que
   recomiendo, y es un cambio a un guardián de línea roja: necesita tu visto
   bueno explícito, no el mío.
2. **Dejar la columna y no escribirla**: cambiarla a nullable. Exige la MISMA
   reconstrucción de 12 pasos, así que no evita nada — solo deja el dato a medias.
3. **No quitarla nunca.** La puerta no la pregunta, el producto no la lee, y la
   columna queda como residuo documentado. Cuesta cero hoy y cuesta una
   explicación incómoda el día que alguien pregunte por qué el esquema guarda un
   dato de un menor que nadie usa.

**Por qué no la decidí solo:** tocar el auditor que vigila el borrado de datos de
menores para permitir un borrado de datos de menores es exactamente el tipo de
cambio que CLAUDE.md manda no hacer sin preguntar.

## Interfaz · El espaciado de dislexia: 0.12em o 0.012em, y en qué sentido · 2026-08-01

**El hecho, medido.** `docs/guia-de-estilo.md` § Dislexia cita `mc-21` con estos
parámetros: interlineado 1.5×, **espaciado entre letras 0.12em**, **entre
palabras 0.16em**, línea de 45-100 caracteres, alineado a la izquierda.
`mc-21:164-165` los dice igual.

El código dice otra cosa:

    apps/web/src/styles/tokens.css:81   --leading-body: 1.6        ✓ cumple (≥1.5)
    apps/web/src/styles/tokens.css:85   --tracking-readable: 0.012em   ← DIEZ VECES MENOS
    apps/web/src/styles/tokens.css:86   --measure: 68ch            ✓ dentro de 45-100
    (no existe ningún token de word-spacing)

**Por qué no lo cambié solo.** Porque las dos lecturas posibles llevan a
implementaciones distintas, y elegir mal es peor que preguntar:

1. **Aplicar.** `mc-21` los presenta como parámetros de tipografía amable con la
   dislexia, citando su fuente [8]. Bajo esta lectura el token es un error de
   coma decimal y hay que subirlo a `0.12em` y añadir `word-spacing: 0.16em`.
   Cuesta: el texto se ve notablemente más suelto en todo el sitio.
2. **Tolerar.** Esas tres cifras exactas —0.12em, 0.16em, 1.5×— son las de
   **WCAG 2.1 SC 1.4.12 «Text Spacing»**, que NO pide aplicarlas: pide que el
   contenido **no se rompa** cuando la persona usuaria las aplique. Bajo esta
   lectura el token de 0.012em es una decisión estética legítima y lo que falta
   es una **prueba** de que la maquetación aguanta el espaciado del usuario.

La coincidencia exacta de las tres cifras con 1.4.12 hace pensar que la lectura 2
es la correcta y que el resumen de `mc-21` las trasladó como si fueran valores a
poner. Pero `mc-21` cita una fuente propia, así que no es seguro.

**Lo que recomiendo:** hacer las dos. La tolerancia es obligatoria bajo WCAG 2.2
AA —que F2 exige— pase lo que pase, así que esa prueba se escribe igual. Y si
además se decide aplicar, es cambiar dos tokens.

**Lo que asumí para no detenerme:** nada. El token sigue en 0.012em y ninguna
pantalla de F2 depende de esto para funcionar. Pero `audits/contrast.mjs`,
`axe-a11y` y `touch-targets` están en PENDING esperando que haya interfaz — ya la
hay— y cuando se activen, esta pregunta hay que tenerla contestada.

---

## 21. La voz de Larry: medida contra Workers AI, no supuesta · 2026-08-02

**El hecho.** El dueño pidió «revisa que las voces de Larry funcionen bien».
**No hay voces que revisar:** F6 está diseñada al detalle en
[`docs/planes/f6-larry-profe.md`](planes/f6-larry-profe.md) y no hay ni una línea
de código de audio, ni un clip, ni nada en `math-challenge-media`. Las seis
issues de F6 (#131-#137) están abiertas.

Lo que sí se puede revisar hoy es **si la voz que F6 necesita existe en la
plataforma**, y eso se midió en vez de repetir la investigación.

### Lo que hay en Workers AI, comprobado llamándolo

| locale | modelo | ¿sirve? |
|---|---|---|
| `en` | `@cf/deepgram/aura-2-en` | **sí** — Whisper lo devuelve al 1.00 de confianza |
| `es-MX`, `es-ES` | `@cf/deepgram/aura-2-es` | **sí** — 0.81 en frase corta, 1.00 en frase larga |
| `fr-FR` | — | **no** |
| `pt-BR`, `pt-PT` | — | **no** |
| `de-DE` | — | **no** |

**Tres de siete.** Coincide con lo que `mc-42` avisaba, ahora con medición.

### El hallazgo que no estaba en la investigación, y es una trampa

**`@cf/myshell-ai/melotts` acepta `lang` y devuelve 200 y audio distinto para
cada idioma — pero habla SIEMPRE en inglés.** No falla. No avisa. Devuelve más
bytes para el francés que para el inglés, que es justo lo que haría un modelo que
sí cambia de idioma.

Se comprobó devolviendo el audio a `@cf/openai/whisper-large-v3-turbo`:

```
pedido  detectado  conf   lo que Whisper oyó
EN      en OK      1.00   How many dots did you see?
ES      en MAL     0.71   Quantos pontos vist?
FR      en MAL     1.00   Kambionde points as two views.
PT      en MAL     0.67   Quantos pontinhos vos viu?
DE      en MAL     0.89   We veal punk tasks do geshin.
```

«Wie viele Punkte hast du gesehen» sale como **«We veal punk tasks do geshin»**:
fonética inglesa aplicada a ortografía alemana. Sin esta comprobación de ida y
vuelta, alguien pregenera 2.400 clips, los ve pesar lo que deben, los sube a R2,
y el error aparece cuando un niño francés de cuatro años oye a Larry hablar en
inglés macarrónico — y como no lee, no puede decir qué pasa.

**Consecuencia para F6:** cualquier pipeline de pregeneración tiene que llevar
la vuelta por Whisper como paso obligatorio, comparando el idioma detectado
contra el pedido. Es barato y es lo único que atrapa este fallo.

### Lo otro que se midió: MeloTTS es poco fiable

De 5 llamadas por idioma, entre 2 y 4 devolvieron audio; el resto dio
`Internal server error (code 3043)` de forma intermitente. Aura-2 respondió
siempre en las corridas que hice. Para un pipeline de pregeneración con
reintentos no es bloqueante, pero descarta MeloTTS como camino en vivo — que ya
estaba descartado por latencia y por offline (§4.1 del plan de F6).

### Las salidas, con su costo

1. **Lanzar la voz solo en `en` y `es`.** Es lo único que hoy funciona en
   Cloudflare. En kinder **la voz es la interfaz** (issue #135: el niño no lee),
   así que esto significa que kinder no existe en francés, portugués ni alemán —
   revierte D-022 de hecho aunque no en el texto.
2. **Generar fuera de Cloudflare** (ElevenLabs, Azure, Google) y subir los clips
   a R2. El audio queda pregenerado, así que en ejecución no hay dependencia
   externa y D-047 sigue en pie. **Toca D-035** —todo en Cloudflare— pero solo en
   tiempo de autoría, no en producción.
3. **Voz humana grabada.** Es lo que más se parece a lo que `mc-42` recomienda
   para kinder y lo único que da un Larry con personalidad de verdad. ~158 clips
   residentes por locale (§4.3 del plan de F6). Cuesta dinero y semanas.

Mi recomendación es la **2 para arrancar y la 3 para kinder** cuando haya
presupuesto: la síntesis alcanza para probar el producto con personas, y la voz
del personaje de marca no debería salir de un modelo genérico.

**Esta duda no bloquea nada de lo que está construido hoy** — el bucle de juego
funciona sin voz, con el enunciado escrito. Bloquea a kinder de verdad, que es
donde el niño no lee.

---

## 22. F7 · Cinco decisiones que tomé sin que estuvieran escritas · 2026-08-02

Salieron de construir los motores de racha, cosméticos y XP (#192, #194, #201,
#203, #206, #219, #225, #254). **Ninguna bloquea nada de lo que está
construido** — las cinco están implementadas y probadas. Lo que hace falta es
que el dueño confirme o cambie, y que la respuesta entre a `docs/decisions.md`.

### 22.1 El banco de escudos se REPONE al crecer la racha

`ganarEscudos` es `min(2, floor(current_streak / 7))`, que es literalmente la
fórmula de #203 y da los tres vectores que el issue escribe (13→1, 14→2, 21 con
banco lleno→2). La consecuencia que el issue no menciona: un niño que gasta un
escudo con racha 15 vuelve a tener 2 al llegar a 21. **Pasado el día 14,
saltarse un día de cada siete no cuesta prácticamente nada.**

La alternativa —contar los escudos ganados *dentro de la racha actual*— necesita
una columna que `child_streak` no tiene. **Lo que asumí:** la fórmula literal
del issue, documentada en el comentario de la función. Cambiarla es una columna
nueva y tres líneas.

### 22.2 Los escudos NO se gastan cuando no alcanzan a salvar la racha

Tres días perdidos con 2 escudos: la racha vuelve a 1 y **los dos escudos se
quedan**. El issue no dice qué pasa aquí. Gastarlos sería pérdida sobre pérdida
por nada, y `mc-17` §5 pide lo contrario: que un día saltado sencillamente no
avance el contador, sin castigo añadido. **Lo que asumí:** se consumen solo
cuando de verdad salvan.

### 22.3 Un día que llega FUERA DE ORDEN es un no-op

Una cola offline (#209) puede entregar el martes después del miércoles.
`registrarDia` ignora cualquier día anterior o igual al último cumplido: la
racha nunca retrocede, y el precio es que ese día viejo no se recupera.
Recuperarlo exige guardar el conjunto de días cumplidos, no solo el último —
otra columna, y una de tamaño no acotado. **Lo que asumí:** no-op documentado.

### 22.4 `EstadoRacha` usa los nombres de columna de D1, no camelCase

`current_streak`, no `rachaActual`. Rompe el estilo del resto de
`packages/motor/`. La razón: `racha-nunca-se-vende.mjs` vigila el grafo de lo
que toca `shields_available`, y una capa de traducción entre los dos nombres es
exactamente el punto donde el auditor deja de ver. **Lo que asumí:** los nombres
de la tabla, con la razón escrita en la cabecera del módulo.

### 22.5 Dos números de la tabla de XP no tienen fuente

`XP_POR_TIPO` fija `mision_diaria: 20` y `mision_semanal: 100`. **No hay fuente
para esos dos números** — están marcados `[criterio propio]` en el código, misma
honestidad que D-016 usa para su tabla de minutos. Lo que sí está sostenido por
`mc-16` (implicación de diseño 7) es la FORMA: un bono plano por sesión
terminada. Y `RANGO_ESCALA = 25` y los 300 XP/día llevan su condición de
revisión escrita: se recalibran con datos reales, no antes.

**Además, la pregunta P4 de #192 sigue abierta:** el bono de finalización se
otorga siempre que el reto se cierre, incluso sin un solo acierto — es lo que
recomienda `mc-16`. La lectura más estricta de «ganado» en D-014 diría cero XP
sin aciertos. Implementé la de `mc-16`.

## 23. F7 social · Dos issues que se contradicen, y tres decisiones que tomé · 2026-08-03

Contexto: **D-081** mandó salir con la escalera de visibilidad social completa
—ligas de ~30, tablero global y duelo— y este PR construye el esquema, el motor
y el Durable Object. Lo que sigue es lo que tuve que decidir sin que estuviera
escrito, o donde dos documentos decían cosas distintas.

### 23.1 RESUELTA · 2026-08-03 — la racha SÍ se muestra entre pares (D-106)

**#242** (el Durable Object) autorizaba difundir «avatar, alias, puntos,
racha, posición» y **#243** prohibía «mostrar racha… entre pares de liga».
Implementé el restrictivo (sin racha) por prudencia; el dueño lo contestó al
día siguiente: la racha **sí** se difunde, solo `current_streak`, y #243
quedó enmendado por **D-106**. El ajuste de `FilaDifundida` queda como trabajo
pendiente de esa decisión.

### 23.2 El opt-in del duelo vive en `child_consents`, no como columna

#244 lo describe como *«default apagado en `child_profile`»*, que se lee como
una columna booleana. Lo puse en `child_consents` con dos códigos nuevos
—`LEAGUE` y `DUEL`— y tres razones:

1. **La ausencia de fila ES el default apagado**, que es literalmente el
   mecanismo que D-040 exige para el tablero («no se inserta fila al crear el
   perfil»).
2. `child_consents` ya tiene `granted_by`, `granted_at` y `revoked_at`: es
   exactamente lo que #243 pide registrar («quién, cuándo»). Una columna
   booleana no puede responder eso sin una segunda tabla.
3. Apagar tiene que ser **revocar**, no borrar — el mismo criterio que #247
   exige para el tablero.

**Lo que asumí:** que la letra de #244 describía la intención (default
apagado), no el mecanismo. Si el dueño quiere la columna, es un `ALTER TABLE`
de una línea, pero entonces hay dos sitios que responden la misma pregunta.

### 23.3 La edad del duelo se calcula sin mes, y el sesgo ADELANTA el acceso

#244 pide edad ≥ 8 desde `birth_year`, y D-053 quitó el mes del producto. Eso
significa que la edad de este producto es `añoActual − birth_year` y **puede
equivocarse hasta en once meses**, siempre en la misma dirección: un niño que
cumple 8 en diciembre cuenta como de 8 desde el 1 de enero.

**Lo que asumí:** se acepta, y se dice. Corregirlo exige pedir el mes, que es
doce veces más precisión sobre la identidad de un menor de la que hace falta
para nada que hagamos — D-053 ya respondió esa pregunta y no se reabre por un
portón de elegibilidad. Está probado como caso explícito en
`packages/motor/src/duelo.prueba.mjs`.

### 23.4 `tier` se llama `escalon`, y no fue una preferencia de estilo

#238 y #241 llaman `tier` al peldaño de la escalera de ligas. Escrito así,
`audits/motor-puntuacion.mjs` bloqueó el commit con ocho hallazgos: su léxico de
línea roja #4 tiene `tier` junto a `premium`, `plan`, `vidas` y `corazones`,
porque en un producto con planes de pago **un «tier» es lo que compras**.

Había dos salidas y elegí renombrar en vez de ablandar el léxico del guardián:
quitar `tier` de esa lista dejaría pasar un `if (tier === "premium")` de verdad.
La columna y las constantes son `escalon` / `ESCALON_TOPE` / `ESCALON_MINIMO`.

### 23.5 El descenso ignora a los inactivos: es una EXTENSIÓN de D-014, no una cita

#241 lo pide y lo marca como extensión razonada. Lo escribo aquí también porque
es la regla de este subsistema que más fácil se «optimiza» sin darse cuenta: la
semana en que una familia respeta su límite de pantalla, declara una pausa, o
sencillamente no juega, **la liga no puede cobrárselo**. D-014 lo dice para la
racha con estas palabras —«si el límite de pantalla corta la sesión, la racha
del día se da por cumplida»— y aquí se aplica la misma idea: no jugar no es
perder.

**El precio, dicho:** una cohorte donde casi nadie juega apenas mueve a nadie, y
sus dos o tres activos se quedan compitiendo entre ellos.
---

## 23 · Cablear la racha y el XP a una pantalla de verdad (F7 frente A, 2026-08-02)

### 23.1 ¿Se le enseña la racha con número a un niño de KINDER?

**Asumí que no, y hace falta que el dueño lo confirme o lo revierta.**

#206 dice que la racha visible es «de PRIMARIA en adelante», y #205 dice que en
KINDER la racha es el camino de Larry en la Sabana, **sin número**. Ese
componente no existe todavía. Así que hoy hay tres salidas y elegí la tercera:

1. Enseñar `Racha.astro` también en kinder — contradice #205 y #206, y mete un
   número que contar en la pantalla donde D-060 y el criterio #100 piden que no
   haya ninguno.
2. Construir el camino de la Sabana en este mismo trabajo — es una pieza de
   producto entera, con su arte, y este trabajo es de cableado.
3. **No enseñar nada de racha en kinder, y escribirlo.** La racha del niño **sí
   se registra y se escribe en D1** desde el primer ítem: lo único que falta es
   la superficie donde se ve. El día que exista el camino de la Sabana, el dato
   ya lleva semanas acumulándose.

Lo que cuesta la tercera: un niño de kinder practica cinco días seguidos y el
producto no se lo dice de ninguna forma. Es real, y es menos malo que las otras
dos.

### 23.2 El bono de finalización de reto no se otorga todavía

`XP_POR_TIPO.reto_completado` existe, vale `valorDelItem(1)` y **nadie lo
llama**. La razón no es una decisión de diseño: es que **nadie observa el final
de un reto**. «Ya terminé» es un `<a href>` que navega, y no hay ninguna
petición que el servidor pueda contar como cierre.

El XP por ítem sí se otorga en cada respuesta, así que el eje se mueve. Lo que
falta es el bono plano que `mc-16` (implicación 7) recomienda «para que
cualquier sesión terminada se sienta como progreso». **Lo que asumí:** dejarlo
sin otorgar y decirlo, en vez de inventar un cierre que el cliente pueda mentir.

### 23.3 RESUELTA · 2026-08-03 — el registro ya dice la verdad

`d1_migrations` tenía dos renglones —0001 y 0002— y la base tenía aplicadas
**también 0003, 0004, 0005 y 0006** (corridas a mano con `d1 execute`, nunca
registradas), así que `migrations apply` moría en la 0003 y 0007+ no podían
entrar. El dueño autorizó la corrección el 2026-08-03 y se ejecutó con
verificación antes y después: `INSERT OR IGNORE` de los cuatro renglones que
faltaban y `wrangler d1 migrations apply`. Estado final comprobado:
**12/12 migraciones registradas** y las nueve tablas de F7/F8 creadas
(`child_streak`, `xp_totals`, `mission_daily_summary`, `companion_state`,
`screen_time_daily_usage`, `league_cohort`, `league_membership`, `league_duel`,
`score_totals_adulto`). F7 ya puede escribir filas en producción.

## 23. F7 · Misiones diarias — cuatro preguntas ya contestadas (D-103, D-104, D-105) y cinco supuestos míos · 2026-08-03

Las cuatro preguntas de esta sección las contestó el dueño el 2026-08-03 y
cada una dice abajo dónde quedó registrada. Los cinco supuestos de
implementación se conservan como estaban: son decisiones de código, no de
producto, y siguen gobernados por D-092.

### 23.1 y 23.2 RESUELTAS · 2026-08-03 — 3 en PRIMARIA/SECUNDARIA, 4 en SERIO (D-103)

**Implementé 3 para todas las bandas** (`MISIONES_POR_DIA`). Las dos preguntas
—¿3 o 2 en las bandas de menor?, ¿el mismo tope en SERIO o uno mayor?— las
contestó el dueño el 2026-08-03: **3 en PRIMARIA y SECUNDARIA** (Duolingo usa
3; Cowan 2010 fija ~4±1 como techo de memoria de trabajo ADULTA y los niños
de 7-11 aún no lo alcanzan) y **4 en SERIO** (la memoria de trabajo adulta sí
alcanza ese techo). `MISIONES_POR_DIA` pasa de constante a tabla por banda;
queda registrado en **D-103** con su condición de revisión.

### 23.3 RESUELTA · 2026-08-03 — KINDER no cuenta como misión en el panel (D-104)

**Hoy no cuenta**: KINDER no escribe ninguna fila en `mission_daily_summary`,
porque `elegirMisionesDelDia()` le devuelve una lista vacía (D-092 §5). El
dueño lo confirmó el 2026-08-03: contarlo inflaría la tasa de «misiones
completadas» hasta hacerla indistinguible de «jugó hoy». Queda en **D-104**:
si un día se muestra «jugó hoy» en el panel, se muestra como eso, no como
misión.

### 23.4 RESUELTA · 2026-08-03 — el push se coordina AHORA, no en F8 (D-105)

**Había asumido «fuera de alcance»** por no haber superficie. El dueño lo
contestó distinto el 2026-08-03: el mecanismo Web Push del recordatorio de
misión (#207) se construye dentro del cierre de F7. Las reglas del canal no
cambian: al padre, nunca al niño; máximo 1/día por hogar; sin culpa y sin
mencionar la racha; silencio permanente en un toque (`mc-19`, D-026). Queda en
**D-105**.

---

### Los cinco supuestos que tomé sin que estuvieran escritos

**23.5 — `duelo` exige `dueloOptIn` Y `enLiga`.** El diseño de
`docs/planes/f7-juego.md` §3 solo pedía el opt-in. Un duelo sin liga es contra
nadie, y #217 dice que una misión incumplible es peor que no tener misión.
**Desviación consciente**, escrita en el catálogo y en D-092 §4a.

**23.6 — El XP se otorga en la TRANSICIÓN a completada, una sola vez.**
`avanzarMision()` devuelve **el mismo objeto** si la misión ya estaba completa,
igual que `registrarDia()` en `racha.ts`: quien llama compara por referencia para
saber si hay algo que escribir, y el reintento de una cola offline no paga dos
veces. El issue no dice qué pasa con un reintento.

**23.7 — No hay `completed_at`.** Un sello de tiempo obligaría al módulo a leer
el reloj, y el reloj es la puerta que la cabecera cierra. `completed` es 0 o 1 y
el `updated_at` de la fila lo pone quien escribe. El precio: no se puede saber a
qué hora se completó una misión, solo qué día.

**23.8 — El cierre del día no devuelve ningún denominador.** `cierreDelDia()`
lista **solo lo logrado**, y no hay campo con el total. Un renglón «0/3 misiones»
es un veredicto negativo aunque el copy no lo diga (`mc-17` §5: el
*confirm-shaming* y la urgencia son categorías nombradas por la FTC). Quien quiera
pintar un progreso tiene `Mision.meta` y el estado, que son datos; lo que no hay
es un «te faltaron dos». La prueba comprueba que ningún campo del cierre se llame
`total`, `faltan`, `pendientes` ni `restantes`.

**23.9 — `EstadoDeMision` usa los nombres de columna de D1, no camelCase.**
Rompe el estilo del resto de `packages/motor/`, igual que `EstadoRacha` (§22.4) y
por la misma razón: los auditores vigilan el grafo de lo que toca `xp_awarded`, y
una capa de traducción entre `xp_awarded` y `xpOtorgado` es exactamente el punto
donde el auditor deja de ver.

---

> **§22.5 queda superada por D-092.** Esa sección dice que la tabla de XP fija
> `mision_diaria: 20` y `mision_semanal: 100` sin fuente. `mision_diaria` **ya no
> existe**: lo sustituyen once claves `mision_<tipo>` más `mision_dia_completo`,
> porque un solo número daba dos respuestas a «¿cuánto vale una misión diaria?» y
> ese par iba a divergir sin que nadie lo tocara a propósito. Los once siguen
> siendo `[criterio propio]`. `mision_semanal` se queda publicado y sin usar.
## 23. F8 · Las tres preguntas de #265 que implementé sin respuesta · 2026-08-02

La issue paraguas del límite de pantalla (#265) hace tres preguntas al dueño y
ninguna está contestada en `decisions.md`. **Las tres cambian lo que se
construye**, así que no se podían dejar para después: se implementó la
recomendación que el propio plan (`docs/planes/f8-limite-pantalla.md` §14)
escribe para cada una, y aquí queda dicho cuál, dónde vive y qué costaría
cambiarla.

### 23.1 El corte nocturno TAMBIÉN impide empezar de madrugada (respuesta A)

`limite-pantalla.ts::decidirAlIniciar` devuelve `CERRAR / BEDTIME` si la hora
local cae en la ventana, así que un niño que se despierta a la una de la mañana
no puede abrir un reto nuevo — no solo se le corta el que ya tenía abierto.

Con la alternativa B, ese niño juega sin tropezar con nada, porque no había
ninguna sesión «en curso» al momento del corte, y ése es exactamente el caso
que motiva la única evidencia experimental de todo `mc-26` (el ECA de la
Universidad de Bath, §5). **Costo de cambiar a B:** una línea —`decidirAlIniciar`
deja de existir y las puertas se separan— pero entonces hay dos tablas de
decisión y una regla nueva puede aplicarse a una y olvidarse en la otra.

### 23.2 F8 construye `cerrarPorLimite`/`cerradaPorLimite`, y F7 lo lee (respuesta A)

Están en `packages/motor/src/sesion.ts` y en `apps/ingest/src/sesion-do.ts`, que
es donde F8 ya estaba tocando para el resto del mecanismo. La issue #202 de F7
pide ese mismo campo; **se actualiza para LEERLO, no para construirlo**.

`sesion.ts` no escribe ninguna racha y no la nombra: deja el hecho disponible.
El motivo que la racha espera lo produce `limite-pantalla.ts::diaCumplidoPorCorte`,
y `audits/limite-no-rompe-el-dia.mjs` ejecuta ese cable de punta a punta.

### 23.3 El límite protege desde el día uno, sin que el padre haga nada (respuesta A)

`configuracionVigente(banda, null)` devuelve el default de la banda, así que un
perfil sin fila en `screen_time_settings` —que hoy son **todos**, porque el paso
de onboarding que F2 diseñó nunca se construyó— ya juega con límite.

La alternativa B es más fiel a «el padre decide» y deja a un perfil nuevo o
viejo jugando sin ningún límite hasta que un adulto visite una pantalla que nada
lo obliga a visitar. **Lo que NO se hizo por defecto:** el corte nocturno.
`bedtime_local` nace en `NULL` y no se enciende solo, porque adivinar una hora
de dormir a partir del año de nacimiento sería un dato que el producto no tiene
y no debería fingir tener (D-053).

### 23.4 Y dos números sin fuente, marcados como tales

`FIN_DE_LA_NOCHE = "05:00"` y `TOPE_DE_CHECKPOINT_MIN = 10` son
`[criterio propio]`, con la misma honestidad que D-016 usa para su tabla de
minutos. El primero hace falta porque `bedtime_local` dice dónde empieza la
noche y **ninguna decisión dice dónde termina**; el segundo recorta el
checkpoint de un aparato que se durmió con la sesión abierta, para que cerrar la
tapa no le cueste minutos al niño.

---

## 24. F9 — lo que la segunda pasada dejó abierto (2026-08-03)

Registrado tras reescribir `docs/planes/f9-grupos-infantiles.md`. Las 12
preguntas de diseño se cerraron en decisiones D-107 a D-116 (escritas
primero como D-093 a D-102 y renumeradas tras el cierre de F7, que tomó
D-103 a D-106 en una sesión paralela); esto es lo que NO se cerró.

### 24.1 La foto del dueño del grupo no existe en el esquema real

El plan de F2 diseñó `group_owner_identity` con `full_name`,
`school_name`, `photo_r2_key`, `revoked_at` y `revoked_reason`; la
migración `0005` real solo tiene `assurance`, `phone_verified_at` y
`declared_context`. La tarjeta de identidad de F9 se diseñó sin foto por
esto. **Pregunta:** ¿la foto del maestro (que D-011 menciona) entra como
migración + superficie de subida aparte, o se enmienda D-011 para
quitarla?

### 24.2 `contextual_marks` no tiene lector, y `no-chat` no existe en su CHECK

La migración `0003` real creó `contextual_marks` con cinco códigos
(`PRIMER_PERFIL`, `PRIMER_RETO`, `LIMITE_PANTALLA`, `TABLERO_OPTIN`,
`SEGUNDO_DISPOSITIVO`) — no el `onboarding_marks` con `no-chat` que el
plan de F2 diseñó. Además ningún código de la app hace
`SELECT … FROM contextual_marks`: las marcas se escriben y nunca se
leen, así que «se muestra una vez» no está implementado. F9 dice «sin
chat» en la propia pantalla de éxito de creación del grupo en vez de
disparar una marca. **Pregunta:** ¿se construye el lector de marcas y se
amplía el CHECK (reconstrucción de tabla), o se retira el mecanismo de
marcas como camino y cada fase lo dice en contexto como hizo F9?

### 24.3 La fuente del chip «activo esta semana» del roster

`docs/planes/f9-grupos-infantiles.md` §6 lo deja por decidir en la issue
#383: `league_membership.active_days` (solo existe si el niño está en
liga) vs `screen_time_daily_usage` (existe para todo niño con límite
configurado). Nunca `last_seen` (D-081). Recomendación:
`screen_time_daily_usage`.

### 24.4 El `ALTER` del `CHECK` de `assurance` contra migration-safety

F9 necesita agregar `school_verified` al dominio de
`group_owner_identity.assurance`. En SQLite eso es reconstrucción de
tabla; `audits/migration-safety.mjs` puede exigir marcador. Se decide
contra el auditor real en la issue #380, degradando primero (D-070).

### 24.5 Los números de migración de F8 y F9 chocaban si no se repartían

**RESUELTA (2026-08-03):** el dueño confirmó el reparto — `0013` = F8
panel (#278), `0014` = F8 reportes (#287), `0015` = F9 grupos (#380),
`0016` = F10 clubs (nueva). Los planes quedaron con su número.

### 24.6 El checkout se borró y se recreó en medio de la sesión

El 2026-08-03 el directorio del repo desapareció durante ~1 hora con
trabajo no commiteado dentro, y reapareció sincronizado con
`origin/main` — el trabajo local se perdió y hubo que re-aplicarlo.
Además, la sesión paralela de cierre de F7 escribió D-103 a D-106
mientras esta escribía las suyas: la colisión de números se resolvió
renumerando a D-107 en adelante. **Pregunta:** ¿hace falta una regla de
que ninguna sesión haga limpieza de worktrees/directorios mientras haya
ramas con trabajo no commiteado, o basta con la regla de commitear al
final de cada encargo?
