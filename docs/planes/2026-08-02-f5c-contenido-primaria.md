# F5c · Contenido primaria — 4 retos para probar de verdad

> Plan acordado con el dueño el 2026-08-02, después de que jugara los primeros
> retos reales de kinder en su teléfono y encontrara seis fallos en quince
> minutos (#345, #347, #348, #349).

## Por qué primaria y por qué ahora

La decisión es del dueño: **saltarse kinder por ahora**. Su razón —«requiere
mucha atención»— es correcta, y la investigación la respalda más de lo que él
planteó.

**1. Kinder está genuinamente bloqueado por F6.** `mc-20` no marca el audio como
mejora: lo marca como *antipatrón* no tenerlo — *«text-only prompts or
instructions with no audio equivalent — unusable by the age band»*. Y `mc-06`
señala que el Number Knowledge Test de Number Worlds es **oral**, «algo
directamente relevante para una app pre-lectora». Sin F6, kinder no es un
producto peor: es un producto que su usuario no puede usar. `mc-21` no dice nada
equivalente de los 7-11, porque leen.

**2. De los cinco formatos, exactamente uno funciona hoy — y es el que primaria
necesita.** Medido sobre las capturas de producción del dueño:

| Formato | Estado real |
|---|---|
| `flash` | no dibuja el estímulo (#345) |
| `toca_para_contar` | dibuja patos diga lo que diga el enunciado (#347) |
| `arma_el_numero` | el marco de diez es un borrón gris (#347) |
| `cual_sobra` | ofrece `casilla3` como respuesta (#349) |
| **`toca_la_respuesta`** | **correcto: opciones legibles, tocables, con marca** |

Leer un enunciado y tocar un número **es** `toca_la_respuesta`. Esta fase rodea
todos los caminos rotos sin esperar a que se arreglen. No es evadirlos —
siguen abiertos y siguen siendo necesarios para kinder— es no bloquear el
producto detrás de ellos.

**3. Un hallazgo incómodo sobre `cual_sobra`.** `mc-36` describe *Which One
Doesn't Belong* como «sin respuesta única, **discurso obligatorio**»: el valor
pedagógico está en que el niño **explique** por qué. La línea roja #3 prohíbe
que un niño escriba texto libre. **Ese formato no encaja en este producto tal
como está concebido**, y eso explica por qué salió deformado — no es solo mala
implementación. Queda como pregunta abierta para el dueño, no como tarea.

## Las cuatro decisiones del dueño

| Pregunta | Respuesta |
|---|---|
| ¿Para quién? | **Para el dueño, en `/app/practicar/`** — sin perfil de hijo, sin marcar aparato, sin PIN |
| ¿Cómo se autoran? | **4 modelos paramétricos**, no 4 ítems fijos |
| ¿#348 (reintentar)? | **Dentro de esta fase** |
| ¿Dónde vive el banco? | **En D1 desde el principio** |

### Sobre «en D1 desde el principio»

Es decisión del dueño **en contra de mi recomendación**, y queda escrito qué
compra y qué cuesta, porque las dos cosas son reales.

**Compra:** el banco deja de ser código. Un ítem se corrige sin desplegar, y
quien autora contenido no necesita saber TypeScript ni esperar un build. Para un
producto cuyo cuello de botella declarado es el contenido (`mc-40`), eso no es
un detalle.

**Cuesta:** una migración, un camino de lectura nuevo en el motor, y **un
producto híbrido durante un tiempo** — KINDER seguirá sirviéndose desde
`banco-kinder.ts` (código) y PRIMARIA desde D1. Dos fuentes de ítems con el
mismo tipo. Eso es deuda desde el día uno, y la forma de que no se pudra es
que KINDER migre después, no que se quede como excepción permanente.

**Lo que NO cambia:** los intentos siguen fuera de D1 (`mc-32` riesgo #1,
auditor `no-attempts-in-d1`). Un banco de ítems es lectura alta y escritura
casi nula; un intento es lo contrario. Que el banco entre a D1 no abre la puerta
a que entren los intentos.

## Los cuatro retos, y de dónde sale cada uno

Los cuatro usan **solo `toca_la_respuesta`**: enunciado en texto + opciones
numéricas. Cero dibujo, cero audio. Cubren propósitos distintos según la
tipología de Swan (`mc-36`), para que probar cuatro diga algo sobre el producto
y no solo sobre un tema.

### 1. Fluidez — suma y resta con distractores de errores reales

`mc-36`: *«los distractores de opción múltiple deben construirse desde errores
reales documentados (no inventados al azar)»*. El esquema de ítem de este
proyecto **ya exige** un arreglo de errores con causa nombrada; aquí es donde
por fin sirve para algo visible: cada distractor es un error concreto
(llevar mal, restar el menor del mayor por columna, olvidar el cero).

**Radical** (lo que cambia la dificultad): tamaño de los números, si hay
reagrupación. **Incidental**: los números concretos, el contexto.

### 2. Concepto — comparación de magnitud y valor posicional

«¿Cuál es mayor?» / «¿Cuánto vale el 7 en 4 738?». Sigue siendo tocar un número.
`mc-06` fundamenta por qué la comparación de magnitudes importa tanto: la
precisión del sistema numérico aproximado medida antes de la instrucción formal
predice el rendimiento posterior.

### 3. Ejemplo resuelto con un paso en blanco

`mc-04`: para principiantes, **estudiar un ejemplo resuelto enseña más, en menos
tiempo y con menos errores, que resolver el mismo problema desde cero** (Sweller
y Cooper, 1985). El camino práctico es el *desvanecimiento* de Renkl: ejemplo
completo → un paso en blanco → problema completo.

Con cuatro retos no cabe la escalera entera, pero sí el peldaño del medio: se
enseña la solución con un paso hueco y se pide ese paso.

**Cuidado documentado**: la *reversión de la pericia* (Kalyuga) dice que ese
mismo andamiaje **perjudica** al que ya sabe. Así que este modelo tiene que
poder apagarse por nivel, no servirse a todo el mundo para siempre.

### 4. Patrón numérico — «¿cuál sigue?»

De *Visual Patterns* (`mc-36`), pero expresado en números —«2, 5, 8, 11, …»—
para que **no necesite dibujo**. Es el formato más barato de parametrizar y el
que más variantes da por modelo.

### Lo que se deja fuera a propósito

**El modelo de barras de Singapur** (`mc-03`), que es *la* herramienta pictórica
central de primaria para problemas verbales. Es pictórico: entra por la parte
rota del producto. Va en la segunda tanda, **después de #347**.

## Los antipatrones de `mc-21` que aplican aquí

No son opcionales, y uno ya lo incumplimos:

1. **«Punitive wrong-answer feedback (red X, no path forward)»** — es #348. Por
   eso entra en esta fase: si se prueban cuatro retos con un callejón sin
   salida, lo que se mide es el callejón.
2. **«A single mandatory typed keypad for every problem»** — nada de teclado
   numérico obligatorio. Las opciones se tocan.
3. **«Default-on countdown timers»** — sin reloj (ya es D-024).
4. **«The word "Kids" anywhere in PRIMARY-facing copy»** — ni «niños» ni
   «Kids» en el texto de esta banda.

## Criterios de aceptación

1. Migración de D1 con la tabla del banco y su índice de lectura por banda y
   habilidad. Sin borrado destructivo (`migration-safety`).
2. Los 4 modelos paramétricos generan, cada uno, al menos 20 variantes
   distintas verificables.
3. Cada distractor de los modelos 1 y 2 tiene causa de error nombrada, y esa
   causa tiene texto en los 7 locales (`retro-completa`).
4. `/api/jugar` sirve ítems de PRIMARIA desde D1 a una sesión de adulto, y
   sigue sirviendo KINDER desde código sin cambiar su comportamiento.
5. `/app/practicar/` juega los 4 sin crear perfil, sin marcar aparato y sin PIN.
6. **Se puede corregir una respuesta** (#348), y corregir no baja el resultado
   (línea roja #8, `mc-30`).
7. El veredicto del ítem anterior no persiste en el siguiente (#348).
8. Ni «niños» ni «Kids» en el texto de PRIMARIA, en los 7 locales.
9. Un auditor determinista nuevo: **ninguna opción de respuesta contiene una
   cadena que no exista en el catálogo de i18n**. Habría cazado `casilla3`.
10. Notación por locale correcta en los números de primaria — el separador de
    millares aparece por primera vez aquí (`mc-34`, `notacion-locale` ya lo
    vigila desde #321/#322).

## Lo que este plan NO resuelve

- **Kinder sigue roto.** #345, #347 y #349 siguen abiertos y siguen siendo
  necesarios. Esta fase los rodea, no los arregla.
- **F6 sigue sin construirse**, y kinder sigue bloqueado detrás.
- **El banco híbrido** (KINDER en código, PRIMARIA en D1) es deuda consciente.
- **Sin racha, sin progresión, sin sonido.** `mc-16` es claro sobre cuál es la
  palanca de retención y son F7/F8. Cuatro retos sin eso prueban si el reto
  funciona, **no** si alguien vuelve mañana. No confundir una cosa con la otra
  al leer el resultado.
