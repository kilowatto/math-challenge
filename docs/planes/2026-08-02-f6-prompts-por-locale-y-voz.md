# F6 · #134 y #135 — la estructura de prompts y el contrato de voz

> **Fecha:** 2026-08-02 · **Rama:** `feat/larry-prompts-y-voz` · **Base:** `origin/main` en `93fee48`
>
> Implementa la §3 y la §4 de [`f6-larry-profe.md`](f6-larry-profe.md), que ya
> había decidido la arquitectura. Este documento **no vuelve a decidirla**:
> anota lo que se construyó, una corrección de lectura que cambia un argumento,
> y lo que sigue bloqueado por una pregunta del dueño.

---

## 1. Una corrección de lectura de `mc-42`, primero

Circula —y llegó escrita en el encargo de este trabajo— la afirmación de que
**`speechSynthesis` nunca ha existido en iOS Safari, «en ninguna versión, de la
3.2 a la 26.5»**, y que por tanto una voz basada en síntesis del navegador no se
oiría en el iPhone del dueño.

**`mc-42` no dice eso.** Esa frase es de su §6 y su sujeto es la **Vibration
API**. La tabla de capacidades de `mc-42` dice, de `speechSynthesis`, literal:

> *«Supported since Safari 7; voice count/quality per language is an OS
> property»*

Y de `navigator.vibrate`:

> *«Not supported, all versions 3.2–26.5 tested»*

Son dos filas distintas de la misma tabla. Lo que no existe en iPhone son los
**hápticos**; la síntesis de voz sí existe, desde Safari 7.

**Por qué importa y no es un detalle.** Si la síntesis no existiera en iOS, la
voz grabada sería la **única** vía posible y el producto entero estaría
bloqueado detrás de una sesión de doblaje en siete locales. Como sí existe, hay
una red de última instancia, y la voz grabada se elige por razones que siguen
siendo buenas pero que son **otras** —latencia, offline, revisión humana previa,
y que la voz del sistema es la del teléfono y no la de Larry (D-004)—. El plan
de F6 §4.1 ya lo tenía bien; lo que se corrige es la versión que circulaba
fuera de él.

`docs/planes/f6-larry-profe.md` §4.5 también lo tiene bien («`navigator.vibrate`
no existe en iOS Safari en ninguna versión»). No hace falta corregir ningún
archivo del repo: la lectura errónea estaba fuera.

---

## 2. Lo que quedó construido

### 2.1 Tres capas, no siete prompts (#134)

`packages/tutor/src/` — paquete nuevo, deliberadamente **fuera de
`packages/motor/`**, porque el plan §1.4 exige que el tutor **no pueda nombrar el
tipo `Item`**: sin `item.ts` ni `banco-kinder.ts` en su grafo de dependencias, la
regla «Larry nunca calcula» deja de ser una recomendación y pasa a ser
imposible. Lo único que importa del motor es `convenciones.ts` (la tabla de
notación), `bandas.ts` y `puntuacion.ts` (la tabla de bandas).

```
CANON (1)  →  LOCALE (7)  →  BANDA (5)     ‖  sobre (mensaje de usuario, #132)
canon.ts      i18n/larry/    banda.ts
```

| Archivo | Qué es |
|---|---|
| `packages/tutor/src/canon.ts` | El contrato de seguridad, **una vez**. Más `revisarCanon()`, que comprueba sus propios invariantes: ningún numeral usado como cantidad, ninguno de los operadores que `MATH_CONVENTIONS` reparte por locale, ningún nombre de idioma. |
| `packages/tutor/src/banda.ts` | Los cinco bloques de audiencia. `JR` no tiene bloque: usa el de `PRO`, porque es un alias de dificultad y no un tema (D-017). |
| `packages/tutor/src/notacion.ts` | La ficha de notación, **generada** desde `MATH_CONVENTIONS`. Cero separadores declarados aquí. |
| `packages/tutor/src/catalogo.ts` | El contrato del bloque de locale: siete campos obligatorios, tres ejemplos, y la comprobación de que los pares que comparten idioma **no comparten texto**. |
| `packages/tutor/src/prefijo.ts` | El compositor. Llave `larry\|<locale>\|<banda>`, 14 prefijos en el MVP y 35 en la escalera, y `hashDePrefijo()`. |
| `apps/web/src/i18n/larry/*.json` | Los siete bloques, autorados. |

**El criterio de #134, hecho estructura:** añadir el octavo locale es escribir
**un** archivo JSON con siete campos y añadir una fila a `MATH_CONVENTIONS`. No
se toca el CANON, no se tocan los cinco bloques de banda, y no se edita el
archivo de ningún otro locale. En el patrón que `mc-37` midió —«cada línea
escrita dos veces»— añadir un idioma era editar **cada línea** del prompt.

**Y el matiz que el dueño ya había anotado en la propia issue se respeta:** «un
prompt por locale» describe la capa LOCALE, no la arquitectura. El eje BANDA
existe, tiene sus cinco bloques y está probado; sin él, kinder y Pro sonarían
igual.

**El orden de las capas no es estético.** Va de menos volátil a más, porque la
caché de prefijo casa por prefijo literal de tokens: editar un bloque de banda
invalida cinco llaves; con el orden intuitivo —locale primero— invalidaría todo
lo que va detrás. Está probado midiendo hashes: tocar `de-DE` mueve exactamente
5 de los 35 y ninguno de otro locale.

### 2.2 El contrato de voz (#135)

| Archivo | Qué es |
|---|---|
| `packages/tutor/src/voz.ts` | Los dos regímenes con presupuestos separados, la elección de fuente, la sonda de voces del sistema, la regla de «ningún sonido va solo», y el contrato del desbloqueo por gesto. |
| `apps/web/src/i18n/voz/*.json` | El **único** texto hablado nuevo: el nombre de cada número del rango que el banco produce (0-21 y 25), autorado por locale. |

**Dos regímenes, no uno.** `mc-42` §3 mide que el sonido irrelevante durante la
tarea perjudica el desempeño —efecto de habla irrelevante y principio de
coherencia de Mayer, por caminos independientes—, así que «mientras resuelve» y
«al resolver» son dos presupuestos y no uno. Mientras resuelve: silencio por
defecto, sin música, sin animación de celebración, y nada arranca solo. Al
resolver: ≤500 ms de audio y ≤800 ms de animación, y ahí sí hay juice. Están
probados por separado, y la prueba falla si alguien los unifica «para
simplificar» — que es exactamente cómo esto se rompería sin romper nada visible.

**El catálogo de voz no es una segunda copia del texto.** Los rótulos, los
enunciados y la retroalimentación viven una sola vez en `i18n/reto/*.json` y se
pronuncian desde ahí; `regimenDeClave()` reparte por prefijo de clave, no por
lista, para que una habilidad nueva de F5 no exija tocar dos catálogos. Lo único
que `i18n/voz/` aporta es lo que **ninguna función puede componer**: en alemán
el veintiuno es «einundzwanzig», una sola palabra con la unidad delante, y en
francés el noventa son tres. Una función que pegue decenas y unidades produce
palabras que no existen, **sin fallar**. Por eso es una tabla y hay un control
negativo que bloquea si alguien la sustituye por un algoritmo.

**Larry nunca escucha.** El criterio de #135 decía que Larry habla y no decía en
ninguna parte que el niño no habla — y un hueco textual en una línea roja es
cómo se cruza sin que nadie lo decida. `voz.ts` lo dice, no nombra ninguna API
de entrada de audio, y una prueba lee el archivo para comprobarlo. La línea roja
#1 no distingue edad: «a nadie, en ninguna banda».

**La vía muda es de primera clase**, no un modo degradado: es lo que devuelve
`elegirFuente` antes del gesto del usuario, con el sonido apagado, o sin voz
para el locale. Y una voz de otra región **no se acepta en silencio**: una voz
de `pt-BR` leyendo texto `pt-PT` cambia la fonología de las vocales átonas, así
que `coberturaDeVoz` la devuelve como categoría propia y obliga a decidir en vez
de dejar que un `||` la convierta en un sí.

---

## 3. Lo que bloquea, y no es código

**Ningún clip existe, y no puede existir todavía.** No es un pendiente de
implementación: son preguntas del dueño sin contestar en `docs/dudas.md` y en
`f6-larry-profe.md` §8 Grupo F.

| Pregunta | Qué bloquea | Estado |
|---|---|---|
| **P-19** — ¿dónde se genera la voz? | Todo. Workers AI **no tiene voz verificada para `fr-FR`, `pt-BR`, `pt-PT` ni `de-DE`** — cuatro de los siete locales. Generarla fuera de Cloudflare toca D-035, que el dueño amplió a «solo vamos a trabajar con Cloudflare». Ese permiso lo da él o no lo da nadie. | Sin contestar |
| **P-20** — ¿quién es la voz de Larry? | Con cualquiera de las tres opciones, **Larry no suena igual en los siete países**: los paquetes de hablantes son distintos por idioma. Eso toca el canon de D-004 y hay que escribirlo en el canon en vez de fingir que es una sola voz. | Sin contestar |
| **P-21** — ¿24 kbps o 16? | Decide si el modo avión de D-047 cabe en el presupuesto. No se decide con una tabla: hace falta escuchar los dos en la bocina de un Android de gama baja. | Sin contestar |
| **P-22** — ¿quién revisa y quién **escucha**? | Los textos necesitan revisión humana antes de existir, y **toda la carta anti-vergüenza se verifica leyendo, cuando en kinder el niño escucha**. Sin revisor por locale, el camino de kinder no se enciende. | Sin contestar |

**Dicho sin rodeos: la producción de audio en siete locales es trabajo de
producción, no de código, y bloquea la voz de kinder por completo.** Lo que este
trabajo deja listo es el contrato — los regímenes, la elección de fuente, el
catálogo de números, la regla de equivalente visual — para que el día que P-19
se conteste no haya que diseñar nada, solo producir bytes.

**Lo que NO bloquea, y conviene decirlo:** la vía muda está completa por
construcción. Los cinco formatos de kinder son pictóricos y de tocar, así que el
bucle ver → tocar → ver resultado funciona sin un solo clip. Lo que falta para
que sea usable por un pre-lector no es el audio: es que el **veredicto** se vea,
y eso es animación (plan §4.5), que no lleva idioma y cubre los siete locales
con ~18 piezas.

### 3.1 Y una nota de prioridad, por D-073

D-073 aplazó kinder para ir a primaria, **que lee**. Eso no cancela nada de lo
de arriba, pero sí cambia cuándo duele: para primaria `mc-42` pide audio
**opcional y apagado por defecto**, así que la ausencia de clips es una función
que falta, no un producto roto. La urgencia de P-19 baja con D-073; la de #134
—los prompts— no, porque primaria sí va a querer explicación en vivo.

---

## 4. Lo que este trabajo NO hizo

1. **No llama a ningún modelo.** `packages/tutor/` no importa ningún cliente de
   inferencia y no debe. Componer y llamar son dos trabajos, y el que se puede
   probar sin gastar dinero es el de aquí.
2. **No define `SobreParaLarry`.** El mensaje de usuario —el veredicto ya
   calculado que Larry recibe— es de #132 y vive fuera de este paquete. Aquí
   solo se compone el prefijo de sistema.
3. **No hay auditor determinista propio.** El plan §3.3 diseña
   `audits/larry-prompt.mjs` y §4 implica uno de voz; `audits/` es de otras
   sesiones en este momento y tocarlo habría chocado. La regla no se perdió: los
   invariantes están escritos **como datos exportados** (`INVARIANTES_CANON`,
   `CAMPOS_OBLIGATORIOS`, `PARES_QUE_NO_SE_COMPARTEN`, `PRESUPUESTO`,
   `RANGO_DE_NUMEROS`) precisamente para que el auditor los lea de ahí en vez de
   volver a teclearlos y desincronizarse. **Queda pendiente**, y hasta que exista
   lo que vigila son las dos pruebas del paquete.
4. **No se generó ni un clip de audio.** Ver §3.
5. **Los ejemplos few-shot son tres por locale y son míos, no de un autor
   nativo contratado.** Están calcados en registro de los 119 mensajes ya
   autorados que sí pasaron por criterio nativo, y `es-MX`/`es-ES` y
   `pt-BR`/`pt-PT` están escritos como cuatro autorías distintas, no dos. Pero
   D-022 pide siete autores con criterio didáctico y ese sigue siendo el
   requisito; esto es un andamio revisable, no el entregable final.
6. **No se midió `kimi-k2.6` contra explicaciones avanzadas revisadas.** Es la
   condición que D-035 pone antes de soltar la banda Pro con explicación en
   vivo, y sigue abierta.
7. **El rango de números hablados llega al 25**, que es lo que el banco de
   kinder produce hoy. Primaria lo va a rebasar, y ahí es donde entran
   `soixante-dix` y `quatre-vingt-dix`, que el bloque de prompt de `fr-FR` ya
   nombra como riesgo pero el catálogo hablado todavía no cubre.

---

## 5. Texto propuesto para `docs/decisions.md`

No se escribió en `decisions.md` porque otra sesión lo tiene modificado y el
número de la siguiente decisión colisionaría. Queda aquí para pegarlo:

> ## D-0NN — La voz de Larry no depende de `speechSynthesis`, y no por iOS · 2026-08-02
>
> **Corrección de un hecho que circulaba mal.** `speechSynthesis` **sí** existe
> en iOS Safari desde Safari 7 (`mc-42`, tabla de capacidades). Lo que no existe
> en iOS, en ninguna versión de la 3.2 a la 26.5, es la **Vibration API**. Las
> dos afirmaciones se habían fundido en una.
>
> **La decisión no cambia:** la voz se pregenera y se revisa antes de sonar, por
> latencia (`mc-47` §4), por modo avión (D-047), por revisión humana previa
> (CLAUDE.md § Contenido) y porque la voz del sistema es la del teléfono y no la
> de Larry (D-004). `speechSynthesis` queda como red de última instancia, con
> detección explícita de ausencia y **sin aceptar una voz de otra región en
> silencio**.
>
> **Lo que cambia es el argumento**, y por tanto lo que bloquea: la voz grabada
> ya no es «la única vía técnicamente posible», es «la vía que el producto
> elige». Sigue bloqueada por P-19 y P-20.
