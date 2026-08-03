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
