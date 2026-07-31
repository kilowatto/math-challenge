# Math Challenge — Plan integral

> **math.kilowatto.com** · Plan maestro · 2026-07-31
>
> Construido sobre 47 investigaciones (~157,000 palabras) en
> [`research/`](research/README.md) y 33 decisiones del dueño en
> [`decisions.md`](decisions.md). Cada afirmación de este plan que suene a hecho
> viene de una de esas dos fuentes; donde es criterio nuestro, lo dice.
>
> **Executive summary (EN).** Math Challenge is a PWA-first math learning game
> for ages 4 to professional mathematician, in five languages, built entirely on
> Cloudflare. A parent registers and creates child profiles; an adaptive
> placement test sets difficulty while age sets the visual theme. Challenges are
> composed from an item bank and scored by a validated accuracy-and-speed rule
> from primary school up, with an accuracy-only rule for kindergarten. Larry,
> Ignia's existing orange
> rhino, becomes the tutor. The MVP ships the **entire platform** with **only
> kindergarten content**; each subsequent release adds one grade band.

---

## 1. Qué estamos construyendo

Un juego de retos matemáticos que va de contar patos a topología algebraica, con
un tutor de IA que explica los errores como lo haría un profesor buena onda, en
español, inglés, francés, portugués y alemán, sobre Cloudflare, con la privacidad
de los menores como restricción de diseño y no como aviso legal.

Lo que lo distingue de lo que ya existe, según el análisis competitivo (`mc-14`):
Khan Academy tiene la escala pero no el juego; Prodigy tiene el juego pero se
ganó una queja ante la FTC por monetizar niños; Brilliant tiene los problemas
buenos pero empieza en secundaria; Kumon tiene la progresión pero es papel.
Nadie cubre kinder-a-PhD con una sola escalera, en cinco idiomas, con un tutor
que sepa **qué** error cometiste y no solo que fallaste.

---

## 2. Las cinco decisiones que definen el producto

| # | Decisión | Por qué importa |
|---|----------|-----------------|
| 1 | **Edad ≠ dificultad.** La edad manda el tema visual, la ubicación adaptativa manda el nivel | Un niño de 7 años que va en fracciones no merece una interfaz de adulto, ni un adulto que batalla con quebrados merece una de kinder |
| 2 | **El reloj depende del tipo de reto, no de la edad** | La fluidez se cronometra; el pensamiento profundo no. Resuelve de golpe la tensión entre "puntos por velocidad" y la evidencia de ansiedad matemática |
| 3 | **El niño nunca es un usuario, es un perfil del padre** | Si no recolectamos datos personales del niño, la mayor parte del aparato de cumplimiento no se dispara |
| 4 | **La práctica es gratis para siempre** | Nunca cobramos por dejar que un niño haga matemáticas. Se cobra el acompañamiento al padre |
| 5 | **El ítem se guarda como estructura, nunca como texto** | Es lo único que hace posible cinco idiomas con notación correcta por país sin rehacer el banco |

---

## 3. Plataforma

### 3.1 Stack

**Astro + islas React sobre Cloudflare Workers**, el mismo stack que `apps/portal`
y `apps/partners` en `ignia-object-storage` — convención heredada, no código
compartido (D-023). HTML estático para lo público (tableros,
marketing, SEO en cinco idiomas) e islas React solo para el motor de reto. La
razón no es la convención: es que buena parte del mercado objetivo en LatAm juega
en Android de gama baja, y el bundle importa.

### 3.2 Infraestructura

27 objetos de Cloudflare, todos con prefijo `math-challenge-`, documentados con
nombre, tipo, propósito EN/ES y binding en
[`infrastructure.md`](infrastructure.md). Las cinco decisiones estructurales:

- Los **intentos crudos van a Analytics Engine**, no a D1. D1 topa en 10 GB por
  base y sería la primera pared que golpeamos.
- **Un Durable Object por liga y por salón** (~30 miembros cada uno), con estado
  en vivo por WebSocket. No un objeto global.
- **Un Durable Object por niño** para el modelo adaptativo, que necesita estado
  consistente y baja latencia para elegir el siguiente ítem.
- **KV guarda instantáneas del tablero**, jamás escrituras por intento — KV
  admite una escritura por segundo por llave.
- **AI Gateway siempre delante de Claude**, para caché, tope de gasto por perfil
  y ruteo de modelo.

Costo estimado del tablero: ~$0.50-1.00 USD por millón de intentos.

### 3.3 Modelo de datos, en una frase

`parent` tiene muchos `child_profile`; cada uno tiene un `skill_state` por
habilidad y un `rating` por tema; los `attempt` no viven en D1; `classroom`
conecta un `teacher` con muchos `child_profile` mediante `classroom_membership`,
que guarda **quién aprobó, cuándo, y qué se comparte** — esa fila es el
consentimiento, y es auditable.

---

## 4. El motor

### 4.1 La escalera

**12 niveles de dificultad × 5 temas visuales**, que se mueven por separado y se
traslapan a propósito.

```
TEMA (por edad)          NIVELES (por habilidad)
KINDER    4-6            N1  N2  N3
PRIMARIA  7-11           N3  N4  N5  N6
SECUND.   12-17          N6  N7  N8
SERIO     adulto         N8  N9  N10
PRO       Jr/profesional         N11 N12
```

Los niveles **no** llevan nombre de grado escolar, y esa decisión tiene evidencia
detrás: las fracciones se introducen entre los 6 y los 9 años según el país, y el
álgebra entre los 10 y los 14 (`mc-15`). Un producto que dice "nivel 3º de
primaria" está mintiendo en cinco mercados a la vez.

### 4.2 Ítem, reto y los cinco modos

Un **ítem** es una pregunta atómica. Un **reto** es lo que el niño juega y lo que
da puntos, y se compone de 1 a N ítems.

| Modo | Composición | Reloj |
|------|-------------|-------|
| **Práctica** | 6-10 ítems mezclados del nivel | no |
| **Fluidez** | 20-30 ítems fáciles seguidos, solo de temas ya dominados | **sí** |
| **Problema** | 1 ítem que cuesta pensar, permite borrar y volver | no |
| **Duelo** | mismo set contra tu liga, opt-in, 8+ años | **sí** |
| **Historia** | cadena de retos en la Sabana de Larry | según el reto |

El modo **Práctica** intercala tipos de problema a propósito: la evidencia de
práctica intercalada muestra que mezclar duele durante la sesión y **duplica** el
desempeño al día siguiente (`mc-05`).

### 4.3 Puntuación

**Dos reglas, no una.** De primaria en adelante rige la regla High-Speed
High-Stakes, validada con millones de niños y matemáticamente equivalente al
modelo IRT 2PL:

```
score = a · (d − RT) · (2·acc − 1)
```

`acc` vale 1 o 0, así que `(2·acc − 1)` vale **−1** al fallar: **fallar rápido
resta más que fallar lento**. El castigo a adivinar está en la fórmula, no en una
regla aparte. `d` es el tiempo permitido y `a` el peso — Jr y Pro no son un caso
especial, son la misma fórmula con `d` corto y `a` alto.

**Kinder tiene su propia regla, y decirlo de frente es más honesto que fingir que
la fórmula es universal:**

```
score = valor_del_ítem · acc
```

Sin tiempo, sin resta al fallar. La razón es aritmética antes que pedagógica: con
`a = 0` la regla HSHS colapsa a cero para toda respuesta, correcta o no — no
"puntúa sin cronómetro", **no puntúa nada**. Y es la banda que el MVP entero va a
ejercitar. Ver [D-024](decisions.md#d-024--regla-de-puntuación-de-kinder--2026-07-31).

| Banda | Regla | `d` | Peso velocidad | Reloj | Anti-trampa |
|-------|-------|-----|----------------|-------|-------------|
| KINDER 4-6 | precisión | — | — | no | tier 0 |
| PRIMARIA 7-11 | HSHS | 60 s | 0.3 | opcional | tier 1-2 |
| SECUNDARIA 12-17 | HSHS | 45 s | 0.5 | sí | tier 3 |
| SERIO (adulto) | HSHS | 40 s | 0.6 | sí | tier 3 |
| JR (olimpiada) | HSHS | 30 s | 0.8 | sí | tier 4 |
| PRO (matemático) | HSHS | 20 s | 1.0 | sí | tier 5 |

Las edades de esta tabla son **las mismas** que las de la escalera de temas
(§4.1) y las del límite de pantalla (§7). Un niño de 7 años es PRIMARIA en las
tres, sin excepción.

**Valor del ítem por dificultad:** `10 × 1.6^(nivel−1)`. Un problema de nivel 8
vale ~268 puntos y 30 sumas de nivel 1 valen ~300. Quedan comparables a
propósito, para que el primer lugar mundial no sea quien hace mil sumas triviales
rápido.

Esto **se aparta de lo que recomienda la investigación**: `mc-18` y `mc-44` piden
ordenar el tablero global por habilidad estimada (θ, estilo TRI), no por puntos
acumulados. Elegimos el valor-por-dificultad a sabiendas, y el porqué está
escrito en [D-025](decisions.md#d-025--el-tablero-global-ordena-por-puntos-no-por-θ--2026-07-31).

### 4.4 Ubicación adaptativa

El padre da la edad; el niño hace 10-15 ítems y el sistema lo ubica **por tema**,
no con un número global. En v1, sin banco calibrado: dificultad asignada por
experto en escala 1-100, selección del ítem más cercano a la habilidad estimada,
actualización estilo Elo con K decreciente, corte a 10-15 ítems. Cuando cada ítem
acumule 200-400 respuestas, se migra a calibración Rasch real (`mc-44`).

En kinder la ubicación **no se llama prueba y no lo parece**: es el primer paseo
por la Sabana.

### 4.5 Repaso espaciado

Programador estilo FSRS por nodo de habilidad, con cajas de Leitner para el
arranque en frío y retención objetivo de 0.90. Maestría en dos etapas: 3
correctas seguidas **más** una pasada de repaso después de un intervalo (`mc-05`).
Tres seguidas en el momento no prueban nada durable.

---

## 5. Larry Profe

Larry no es un chatbot nuevo: es el mismo rinoceronte naranja de Ignia, con su
canon intacto — coach honesto, humor solo sobre sí mismo, "¡Ya vas!" únicamente
al aceptar una tarea. La investigación `mc-37` documenta con `archivo:línea` lo
que existe hoy en `ignia-object-storage` y lo que hay que cambiar. Ese código
**no está a la mano desde aquí**: se reimplementa, no se importa (D-023).

**Lo que cambia para un tutor de niños:**

1. **Regla nueva y dura:** Larry nunca avergüenza a un niño por equivocarse.
2. Cinco idiomas en vez de dos.
3. **En kinder la voz es la interfaz** — el niño no lee, Larry habla.
4. Larry **nunca calcula**: recibe el veredicto ya calculado y solo lo explica.
   Es el patrón de `src/larry/contador/explain.ts` en `ignia-object-storage`, y
   es lo que evita que el tutor se equivoque en matemáticas.

**Arquitectura híbrida:** explicación pregenerada y revisada al cerrar el reto
(instantánea, gratis, offline, sin alucinación). La API de Claude entra solo
cuando el niño pide más o comete un error no catalogado.

| Banda | Modelo | ~Costo / 1k explicaciones |
|-------|--------|---------------------------|
| Kinder–Primaria | Haiku 4.5 | ~$1 |
| Secundaria / Adulto / Jr | Sonnet 5 | ~$6 |
| Pro | Opus 5 | ~$19-60 |

Tope de gasto por perfil y por día vía AI Gateway. Caché de explicaciones por
tipo de error: la misma confusión no se paga mil veces.

**Lo que el feedback debe y no debe hacer** (`mc-11`): más de un tercio de las
intervenciones de retroalimentación estudiadas **empeoran** el desempeño, y el
mecanismo probable es el feedback dirigido a la persona en vez de a la tarea.
Prohibido en el prompt: elogio de rasgo ("qué inteligente eres"), elogio inflado,
comparación con otros niños, y revelar la respuesta antes de tiempo.

---

## 6. Gamificación

Todo el motor con evidencia, ninguna mecánica con exposición regulatoria.

| Sí | No, por nombre |
|----|----------------|
| XP y niveles | corazones o vidas que bloquean la práctica |
| Rachas con red | moneda comprable |
| Ligas de ~30 | recompensas aleatorias de pago |
| Misiones diarias | notificaciones con culpa |
| Cosméticos deterministas | comparación pública de niños por nombre |
| Mapa, compañero, historia | |

**Por qué esa lista negra no es timidez:** el DSA ya obligó a TikTok a retirar
TikTok Lite Rewards por "efecto adictivo... en menores"; el Children's Code
británico prohíbe las técnicas de nudge en su estándar 12; las cajas de botín
fueron declaradas juego ilegal en Bélgica y Países Bajos; y Prodigy Math recibió
una queja ante la FTC firmada por más de 20 organizaciones por monetizar dentro
de un producto para niños (`mc-17`).

**Tableros.** Ligas de ~30 pares anónimos más un tablero global con alias
generados — sin nombre real, sin foto, sin ciudad. Descenso suave (solo el 10%
inferior, solo entre activos) y nunca se le muestra el último lugar exacto a un
niño chico. La evidencia de tableros es genuinamente mixta: motivan a los de
arriba y desmotivan a los de abajo, así que el efecto se mide **por posición**,
no por promedio (`mc-18`).

**Rachas.** Si el límite de pantalla corta la sesión, la racha del día se da por
cumplida. Nunca se vende protección de racha. La meta diaria de kinder es **un
reto**, alcanzable en tres minutos.

---

## 7. Protección del menor

- **El niño nunca es un usuario.** Es un perfil dentro de la cuenta del padre. No
  pedimos nombre real, ni correo, ni foto, ni fecha exacta de nacimiento.
- **Entrada del niño:** rejilla de avatares + PIN de tres imágenes que él eligió.
  Sin teclado, sin leer, menos de cinco segundos.
- **Sin texto libre de un niño**, en ninguna superficie. Los alias se eligen de
  listas curadas **por idioma**, no traducidas, con validación de la cadena
  combinada.
- **Límite de pantalla** con corte suave: aviso a los 5 minutos y despedida de
  Larry, nunca corte seco a media respuesta. Defaults por edad, ajustables dentro
  de un rango.

**Honestidad sobre los límites:** solo el tope de 60 minutos para 2-4 años viene
de fuente primaria (OMS). De los cinco años en adelante **ninguna autoridad
publica una cifra**. Nuestra tabla es criterio, y se documenta como criterio.

**Modo maestro.** El maestro crea un salón y obtiene un código; **el padre**
captura el código, ve nombre, escuela y foto del maestro **antes** de aprobar, y
elige qué hijo y qué se comparte. Sin canal privado maestro-niño. Tope de 35
alumnos y 3 salones. Bitácora completa y reporte de un toque.

> **La pregunta incómoda, contestada:** ningún producto estudiado impide que un
> extraño abra un "salón". Todos descansan en una capa de confianza previa
> (el área de sistemas de una escuela, un PIN compartido en persona) que nosotros
> no vamos a tener. Lo anterior es el stack mínimo viable, no una garantía. Si
> esto va a producción con menores, **se revisa con abogado antes**, y la
> investigación `mc-25` marca a propósito varias afirmaciones legales como
> `[unverified]` porque los sitios de la FTC y del ICO bloquean descarga
> automatizada.

---

## 8. Anti-trampa progresivo

Seis niveles. Sube con la banda, no con la sospecha.

| Tier | Banda | Qué se activa |
|------|-------|---------------|
| 0 | Kinder | Puntuación del lado del servidor. Patrón imposible → no sube de nivel, sin acusar. Nota suave al padre |
| 1-2 | Primaria | Tiempos de respuesta imposibles, límite de tasa, banco grande con exposición controlada |
| 3 | Secundaria / Adulto | Ítems parametrizados por sesión, análisis de valores atípicos de tiempo, Turnstile |
| 4 | Jr | Detección de colusión entre cuentas, control de exposición de ítems, WebAuthn opcional |
| 5 | Pro / competitivo | Ventanas de competencia, ítems de un solo uso, revisión estadística de anomalías |

**Regla permanente, todas las bandas, sin excepción:** nunca cámara, nunca
micrófono, nunca biometría, nunca navegador bloqueado. A ningún niño, en ningún
nivel.

**Lo que no se puede impedir, dicho de frente** (`mc-31`): una foto de la
pantalla con otro teléfono es un canal fuera de banda que ninguna defensa del
lado del cliente puede ver. Los solucionadores resuelven casi todo hasta cálculo
en segundos, y los modelos de frontera ya alcanzan nivel de medalla de oro de
IMO. La única defensa durable es el **diseño del reto**: pedir el proceso, pedir
que encuentre el error en una solución dada, pedir estimación, pedir manipular —
no pedir un número final.

**Telemetría conductual, con una corrección importante** (`mc-30`): borrar y
corregir **no** es señal de trampa ni de duda culpable. Cambiar una respuesta
mejora la calificación en el 79% de los casos donde alguien cambia. Penalizar el
borrado sería pedagógicamente al revés. Guardamos señales derivadas, nunca flujos
crudos de teclas, y **nunca** construimos un modelo de ritmo de tecleo por niño —
esa es la línea que separa esto del artículo 9 del GDPR.

---

## 9. Contenido: kinder primero

**~400 ítems en 14 habilidades**, compuestos en **~2,500 retos jugables**.

```
K01 subitizar 1-3        K08 recta numérica 0-10
K02 subitizar 4-6        K09 marco de diez
K03 contar 1-10          K10 descomponer (5 = 2+3)
K04 contar 1-20          K11 sumar contando
K05 uno a uno            K12 restar quitando
K06 cardinalidad         K13 formas básicas
K07 comparar más/menos   K14 patrones AB
```

La secuencia no es intuición: es la trayectoria de aprendizaje que la
investigación de numeración temprana respalda (`mc-06`), donde el sistema
aproximado de número y el subitizar son sistemas distintos que necesitan
instrucción distinta.

**Cinco formatos, todos de tocar.** A los 4-6 años arrastrar es medibledamente
más lento y más propenso a error que tocar, y esa diferencia desaparece hasta los
7-10. Blancos de ~88 px: un niño de cuatro años necesita ~23.7 mm para acertar el
90% de las veces, contra los ~9 mm de un adulto.

1. **Toca la respuesta** — opción múltiple con dibujos, nunca con texto
2. **Toca para contar** — toca cada pato, se marca, Larry cuenta en voz alta
3. **Flash** — aparecen cuatro puntos medio segundo, ¿cuántos eran?
4. **Arma el número** — toca casillas del marco de diez hasta llegar a siete
5. **¿Cuál sobra?** — toca el que no pertenece

**Cómo se guarda un ítem.** Estructura, jamás texto ya formado:

```json
{ "tipo": "suma", "a": 3, "b": 4,
  "enunciado": { "clave": "k.suma.patos", "vars": { "a": 3, "b": 4 } },
  "respuesta": { "valor": 7, "tol": 0 },
  "errores": [ { "valor": 12, "causa": "multiplicó" },
               { "valor": 1,  "causa": "restó" } ] }
```

Ese arreglo `errores` es lo que permite que Larry sepa **qué** error cometió el
niño y no solo que falló. Las tablas de errores con nombre para fracciones (13
filas) y álgebra (9 filas) ya están escritas en `mc-07` y `mc-08` para cuando
lleguen esas bandas.

**Origen de los ítems** (`mc-40`): ~40% de plantillas paramétricas (contar patos
del 1 al 20 es **una** plantilla, no 20 ítems), ~29% redactados con IA y
revisados por humano, ~31% escritos a mano — los buenos. El dato duro que obliga
a la revisión humana: los modelos redactan distractores matemáticamente válidos
pero son notablemente malos anticipando los errores que los alumnos reales
cometen.

**La curaduría es el trabajo, no la generación.** Los 2,500 retos se arman con
intención — qué ítems, en qué orden, con qué variación sistemática. Es la unidad
de diseño de la enseñanza con variación china (`mc-02`), y es lo que separa una
serie que enseña de treinta sumas al azar.

**La Sabana de Larry.** 14 lugares, uno por habilidad, con ~30 piezas de arte
generadas con Recraft (continuidad con el avatar existente) y Gemini para lo
complejo. El arte se reusa entre los cinco idiomas: **la Sabana no habla**.

---

## 10. Cinco idiomas desde el lanzamiento

Decisión del dueño, con su costo dicho de frente: **el contenido de kinder no se
puede traducir.** En alemán el 21 es "einundzwanzig" (uno-y-veinte) y en francés
el 90 es "quatre-vingt-dix" (cuatro-veintes-diez); esa estructura cambia el orden
en que un niño puede aprender a contar. Se necesitan autores nativos con criterio
didáctico, no traductores.

**Son siete autores, no cinco.** Cinco idiomas, pero siete locales — y los pares
que comparten idioma no comparten contenido matemático: `es-MX` usa punto decimal
y `es-ES` coma; `pt-BR` dibuja la división larga a la europea y `es-MX` a la
anglosajona; Portugal usa escala larga y Brasil corta. No son revisiones
cosméticas sobre un original, son autorías separadas (`mc-34`).

Trampas de notación ya documentadas (`mc-34`), que la arquitectura de árbol
estructurado resuelve pero la autoría no:

- **México es el único país hispano con punto decimal.** España, Argentina,
  Colombia usan coma.
- **`pt-PT` y `pt-BR` son dos locales.** Portugal usa escala larga y Brasil
  corta: "mil millones" no es "bilhão" en los dos lados.
- La **división larga se dibuja de cuatro maneras distintas** según el país. Un
  tutor que enseñe el procedimiento paso a paso tiene que saber cuál.

---

## 11. PWA

PWA primero, móvil segundo, escritorio tercero. Realidad verificada contra
documentación de WebKit y MDN (`mc-33`):

- **Push en iOS existe desde 16.4**, pero **exige** que el usuario instale la app
  en la pantalla de inicio y que el permiso se pida tras un gesto. No hay
  `beforeinstallprompt` en iOS: la instalación se explica, no se ofrece.
- **La app instalada queda exenta** de la expulsión proactiva de almacenamiento a
  los 7 días, y accede a ~60% de la cuota de disco. Sin instalar, el progreso
  offline es frágil.
- **Background Sync es solo de Chromium.** Los intentos hechos sin conexión se
  sincronizan al volver a abrir, no en segundo plano, y eso hay que diseñarlo:
  los intentos offline entran con marca de tiempo del cliente y **no cuentan para
  ligas ni tablero** hasta validarse en el servidor.
- **iOS Safari no tiene Vibration API en ninguna versión.** La háptica es acento
  donde exista, jamás canal de retroalimentación.

Presupuesto de audio offline: ~5 MB en la primera instalación.

---

## 12. Dinero

**La práctica es gratis para siempre.** Se cobra el acompañamiento.

| Gratis | Plan Familia (~$8-10 USD/mes) |
|--------|-------------------------------|
| Práctica ilimitada | Hasta 6 perfiles |
| 1 perfil de hijo | Panel del padre con diagnóstico |
| Ligas, tablero, rachas, historia | Larry en vivo ilimitado |
| Larry con explicaciones pregeneradas | Modo sin conexión, reportes |

Referencias verificadas (`mc-41`): IXL $9.95/mes +$4 por hijo extra; mediana
anual en educación $44.99; una prueba de 17-32 días convierte 1.7× mejor que una
de 4 días.

**Dos hallazgos que afectan el lanzamiento por mercado:** OXXO (México) y Boleto
(Brasil) **no pueden renovar una suscripción automáticamente**; y Stripe Tax no
lista Brasil, lo cual es una puerta de decisión real antes de vender ahí.

---

## 13. Entrega

Cada fase termina con algo que se puede usar, no con un documento.

**Son dos vías en paralelo, no una.** El sitio abierto no depende de una sola
línea del producto — las 157,000 palabras de investigación ya existen — y su
valor compone con el tiempo, porque la autoridad de dominio y las citas entrantes
tardan meses (`mc-48`). Si el sitio sale cuando sale la app, llega con cero
audiencia. Si sale ahora, la app aterriza sobre público ya formado.

### 13.1 Vía B — el sitio abierto

| Fase | Qué queda funcionando | Depende de |
|------|----------------------|-----------|
| **S0 · Cimientos del sitio** | Astro sobre Workers, 7 rutas de locale con `hreflang` recíproco y `x-default`, JSON-LD con `inLanguage` por versión, WCAG 2.2 AA, auditores de esquema y `hreflang` bloqueando en CI | — |
| **S1 · El corpus** | Las 47 investigaciones publicadas e indexables, con fuentes, limitaciones y `[unverified]` visibles — incluidas las que contradicen al producto | S0 |
| **S2 · La historia y el producto** | Página de origen desde [`por-que-existe.md`](por-que-existe.md), los niveles y el propósito explicados, la arquitectura técnica como contenido citable, atribución Ignia + Cloudflare | S0 |

### 13.2 Vía A — el producto

| Fase | Qué queda funcionando | Depende de |
|------|----------------------|-----------|
| **F0 · Cimientos y gates** | Worker en math.kilowatto.com, D1 con esquema, Astro con las **siete** rutas de locale, PWA instalable, HTTP/3 y 0-RTT verificados, esqueleto de RPC nativo entre Workers, y **los 12 auditores deterministas bloqueando en CI** | — |
| **F1 · La flota adversarial** | Los 23 auditores con LLM, cada uno con su carta y con la regla de citar la decisión que hace cumplir; anulación por escrito | F0 |
| **F2 · Cuentas y onboarding** | Las tres puertas de registro de 2 campos, perfiles de hijo, entrada del niño con avatar + PIN de imágenes, verificación del maestro antes de crear salón, y las cinco marcas contextuales | F0 |
| **F3 · Motor de reto** | Los 5 formatos táctiles, un reto de práctica de principio a fin, puntuación del lado del servidor con HSHS **y la regla de precisión de kinder** (D-024) | F2 |
| **F4 · Adaptativo** | Ubicación por tema, selección del siguiente ítem, repaso espaciado, modelo por niño en su Durable Object | F3 |
| **F5 · Contenido kinder** | ~400 ítems × **7 locales**, 2,500 retos curados, 14 habilidades, arte de la Sabana | esquema de ítem (§9) · en paralelo con F3-F4 |
| **F6 · Larry Profe** | Explicación pregenerada al cerrar el reto + Claude en vivo con ruteo y tope de gasto, voz en los siete locales | F3, F5 |
| **F7 · Juego** | XP, rachas con red, misiones, mapa, ligas de ~30, tablero con alias generados | F4 |
| **F8 · Padres** | Panel con diagnóstico, límite de pantalla con corte suave, reportes, Stripe | F2 |
| **F9 · Grupos infantiles** | Salón del maestro y club de papás sobre la misma tabla `grupo_infantil`: código, aprobación del padre, tablero, bitácora. Sin chat, en ninguna dirección (D-027) | F2, F7 |
| **F10 · Clubs de adultos** | `club_adulto`, retos con ventana de tiempo, las tres formas de prenda, y Larry moderando el texto libre a prueba de fallos (D-028, D-029) | F2, F7 · **ver T-7** |
| **F11 · Cierre** | Anti-trampa tier 0-1, accesibilidad auditada, revisión legal con abogado, offline completo, interfaz adaptativa terminada en las cuatro plataformas | todas |

### 13.3 Cuatro cosas que la tabla no dice sola

**F0 y F1 van primero por una razón, no por burocracia.** Construir 35 auditores
después del código es reajustar; construirlos antes es que el código nazca
cumpliendo. Es también lo único que convierte las ocho líneas rojas en algo que
el sistema impone en vez de algo que alguien recuerda.

**F5 sigue siendo la ruta crítica, y creció.** Son **siete** autores nativos, no
cinco: `es-MX` y `es-ES` no comparten separador decimal ni formato de división
larga, y `pt-BR` y `pt-PT` no comparten escala numérica (`mc-34`, D-022).
Producir y revisar 400 ítems y curar 2,500 retos es más trabajo que el motor que
los sirve — la investigación estima ~1,053 días-persona para el banco completo de
todas las bandas, y kinder es una fracción, pero no una pequeña (`mc-40`). **F5
no espera a F3**: el esquema de ítem ya está especificado en §9, así que la
autoría puede arrancar en cuanto haya autores contratados.

**La interfaz adaptativa no es una fase, es un impuesto.** Material 3 en Android,
HIG en iOS y macOS, controles del sistema en Windows (D-031) se pagan en cada
función de F2 a F10, no en un bloque al final. Aparece en F11 solo como
verificación; el costo real está repartido.

**F10 tiene un problema de contenido antes que de código.** D-009 fija que el MVP
lleva la plataforma completa con **solo contenido de kinder**. Un club de adultos
compitiendo en sumas de kinder no tiene sentido — es decir, la vía del adulto, que
es el caso de uso del propio dueño ([`por-que-existe.md`](por-que-existe.md)),
**no tiene contenido en el MVP**. Registrado como tensión abierta T-7 en
[`decisions.md`](decisions.md).

---

## 14. Lo que este plan NO hace

Dicho explícitamente, porque un plan que no menciona sus límites no los ha
buscado.

1. **No resuelve la verificación del maestro.** Propone un stack de mitigación y
   dice que no es garantía.
2. **No es asesoría legal.** Varias afirmaciones de `mc-25` están marcadas
   `[unverified]` a propósito. Antes de lanzar con menores esto se revisa con
   abogado, en particular COPPA 2025 (cumplimiento exigible desde abril 2026), el
   Children's Code, y el estado real de la LFPDPPP tras la desaparición del INAI.
3. **No incluye contenido arriba de kinder.** Las bandas N4 a N12 están
   investigadas, no construidas.
4. **No promete resultados de aprendizaje.** No podemos afirmar que la app enseña
   hasta medirlo con pre/post y retención diferida. Nunca citar "las 2 sigma de
   Bloom" en mercadotecnia: el efecto real de tutoría en meta-análisis es 0.37
   desviaciones estándar, no 2.
5. **No define el modo Pro con precisión.** Sabemos que una demostración en
   lenguaje natural no se califica confiablemente ni con modelos de frontera
   (~52% de acuerdo con humanos), y que lo único inequívoco es CAS o Lean. Qué
   tanto de eso construimos es una decisión que todavía no se toma.

---

## 15. Cómo sabremos si sirve

| Qué | Cómo se mide | Umbral |
|-----|--------------|--------|
| ¿Engancha? | Retención D7 y D30 por banda de edad | — |
| ¿Enseña? | Pre/post por habilidad **más retención diferida a 4 semanas** | el único que importa de verdad |
| ¿Es sano? | % de sesiones cortadas por límite; % de rachas rotas | una racha rota por el límite es un defecto |
| ¿Es justo? | Retención del quintil inferior del tablero vs. el superior | si el 20% de abajo se va, el tablero está mal diseñado |
| ¿Cuesta? | Costo de Larry por perfil activo al mes | — |

La cuarta fila es la que casi nadie mide y la que la investigación de tableros
señala como el punto de falla (`mc-18`).

---

## Referencias

- [`decisions.md`](decisions.md) — las 33 decisiones del dueño, con fecha
- [`infrastructure.md`](infrastructure.md) — los 27 objetos `math-challenge-*`
- [`research/README.md`](research/README.md) — índice de las 47 investigaciones
- [`por-que-existe.md`](por-que-existe.md) — la historia del dueño, voz del sitio
