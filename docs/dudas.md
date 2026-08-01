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

**Cómo se contesta esto.** Preferentemente en preguntas de opción múltiple —
cada entrada de arriba ya tiene mi recomendación, así que basta con confirmarla o
cambiarla. Lo que se decida va a `docs/decisions.md` con fecha, y la entrada
desaparece de aquí.
