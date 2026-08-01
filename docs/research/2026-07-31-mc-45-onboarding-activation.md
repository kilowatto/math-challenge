# Onboarding, registro y activación: cuántos campos, y por qué los tours casi nunca sirven

> Math Challenge research — 2026-07-31 — topic 45

## Resumen ejecutivo (ES)

- **El registro es el cuello de botella medible.** HubSpot analizó formularios de 40,000 clientes y encontró que bajar de 4 campos a 3 subió la conversión **casi 50%** [1]. Los benchmarks de 2026 dan una curva completa: 23.1% con 3 campos, 17.0% con 5, 11.4% con 7, 6.9% con 10 o más [5].
- **La caída no es lineal.** Entre 5 y 7 campos cada campo extra cuesta ~2.8 puntos porcentuales, contra ~1.5 antes de ese rango [5] — hay un despeñadero, no una pendiente.
- **La relación no es una ley.** Varias fuentes documentan casos donde reducir campos *bajó* la conversión 14%, y análisis donde diez campos convirtieron mejor que tres [3][5]. La lectura honesta: menos campos ayuda casi siempre, pero es una hipótesis a medir, no un axioma.
- **Nielsen Norman Group desaconseja el onboarding, en general.** Su recomendación literal es *"eviten crear onboarding de app siempre que sea posible, y en su lugar gasten esos recursos en hacer la interfaz más usable"*, por tres razones: sube el costo de interacción, carga la memoria de trabajo, y la investigación muestra que a menudo no mejora el desempeño real en la tarea [2].
- **El carrusel de tarjetas está desaconsejado por nombre.** NN/g lo señala explícitamente: hace que la interfaz *parezca más compleja de lo que es*, carga la memoria de trabajo, y su investigación sobre "deck-of-cards tutorials" encontró que **no mejoraron el desempeño en la tarea** [2].
- **Solo tres casos justifican onboarding**, según NN/g: pedir información indispensable, adaptar la experiencia al contexto del usuario, e introducir flujos **genuinamente novedosos** que se apartan de los patrones estándar [2].
- **Lo que sí funciona es contextual.** NN/g favorece la ayuda en contexto sobre la instrucción por adelantado: las pistas aparecen cuando la función se vuelve accionable, no al abrir la app [2]. Las marcas de guía (*coach marks*) funcionan cuando son oportunas y discretas, y van acompañadas de la tarea real [2].
- **Una regla visual concreta:** el estilo de una pista debe dejar inequívocamente claro que es una anotación y **no un elemento interactivo** [2].
- **NN/g recomienda probar la app sin onboarding primero**, para identificar dificultades reales antes de invertir en resolverlas con pantallas [2].
- Implicación central para Math Challenge: **registro de 2 campos, configuración progresiva y saltable, y exactamente cinco marcas contextuales** — las cinco cosas del producto que son de verdad novedosas y no se explican solas.

## Executive summary (EN)

- **Registration is the measurable bottleneck.** HubSpot analyzed forms from 40,000 customers and found that cutting fields from 4 to 3 raised conversion by **almost 50%** [1]. 2026 benchmarks give the full curve: 23.1% at 3 fields, 17.0% at 5, 11.4% at 7, 6.9% at 10+ [5].
- **The drop is non-linear.** Between 5 and 7 fields each added field costs ~2.8 percentage points versus ~1.5 below that range [5] — a cliff, not a slope.
- **It is not a law.** Sources document cases where cutting fields *lowered* conversion by 14%, and analyses where ten fields beat three [3][5]. Honest reading: fewer fields helps almost always, but it is a hypothesis to measure, not an axiom.
- **Nielsen Norman Group advises against onboarding generally.** Their literal recommendation is *"avoid creating app onboarding whenever possible and instead spend your resources making the UI more usable"* — because it raises interaction cost, strains working memory, and research shows it often fails to improve actual task performance [2].
- **The card-carousel format is disrecommended by name.** NN/g notes it makes interfaces *appear more complex than they are*, strains working memory, and their research on deck-of-cards tutorials found they **did not improve task performance** [2].
- **Only three cases justify onboarding**, per NN/g: gathering essential information, tailoring to user context, and introducing **genuinely novel** workflows that deviate from standard patterns [2].
- **What works is contextual.** NN/g champions contextual help over front-loaded instruction: tips appear when features become actionable, not upfront [2]. Coach marks work when timely, unobtrusive, and paired with actual task completion [2].
- **One concrete visual rule:** a hint's visual style must make unmistakably clear that it is an annotation and **not an interactive element** [2].
- **NN/g recommends testing the app without onboarding first**, to find genuine user difficulty before investing in screens to solve it [2].
- Core implication: **2-field registration, progressive and skippable configuration, and exactly five contextual marks** — the five things about this product that are genuinely novel and do not explain themselves.

## Findings

### 1. El costo de cada campo de registro

La cifra más citada y mejor sustentada viene de HubSpot, que estudió formularios de contacto de 40,000 clientes: la conversión **subió casi la mitad** al reducir de 4 campos a 3 [1]. Un estudio de benchmarks de 2026 traza la curva completa y es la fuente más útil para presupuestar campos [5]:

| Campos | Conversión |
|---|---|
| 3 | 23.1% |
| 5 | 17.0% |
| 7 | 11.4% |
| 10+ | 6.9% |

Lo importante no es la pendiente promedio sino **dónde está el quiebre**: entre 5 y 7 campos cada campo adicional cuesta ~2.8 puntos porcentuales, contra ~1.5 puntos por campo antes de ese rango [5]. Es decir, el sexto y séptimo campo son mucho más caros que el cuarto.

**La advertencia que hay que conservar.** La correlación no es perfecta ni universal: hay casos documentados donde reducir campos produjo una **caída** del 14% en conversión, y al menos un análisis donde diez campos convirtieron mejor que tres [3][5]. La explicación habitual es la calidad de intención — un formulario largo filtra curiosos —, lo cual importa poco para un producto gratuito donde el objetivo es que el papá llegue a ver a su hijo resolviendo una suma. Para Math Challenge la regla de "menos campos" aplica con fuerza, pero se registra como hipótesis a medir, no como hecho establecido.

### 2. La posición de Nielsen Norman Group sobre onboarding

Esta es la parte incómoda y la más valiosa. La recomendación principal de NN/g es que el onboarding **se evite**: *"avoid creating app onboarding whenever possible and instead spend your resources making the UI more usable"* [2]. El razonamiento tiene tres patas: aumenta el costo de interacción, carga la memoria de trabajo, y la investigación muestra que frecuentemente **no mejora el desempeño real en la tarea** [2].

NN/g reconoce exactamente tres escenarios que justifican pantallas de onboarding [2]:

1. **Recolectar información indispensable** (el ejemplo que dan: crear cuenta en una app bancaria).
2. **Adaptar la experiencia** al contexto o las preferencias del usuario.
3. **Introducir flujos genuinamente novedosos o desconocidos** que se apartan de los patrones estándar.

Y una recomendación de método que vale más que cualquier patrón: **probar la app sin onboarding primero**, para identificar las dificultades reales de los usuarios antes de invertir en resolverlas con pantallas [2].

### 3. Qué formato funciona y cuál no

**Carrusel de tarjetas ("deck-of-cards tutorial"): desaconsejado por nombre.** NN/g señala que hace que la interfaz *parezca más compleja de lo que es* y carga la memoria de trabajo; su investigación sobre este formato específico encontró que **no mejoró el desempeño en la tarea** [2]. Es, con diferencia, el formato más popular en la industria y el peor sustentado.

**Marcas de guía y superposiciones instructivas: útiles con condiciones.** Funcionan cuando son **oportunas y discretas**, y cuando van acompañadas de la ejecución real de la tarea [2]. NN/g las califica como *"nice-to-have"* más que esenciales [2]. La regla visual concreta: el estilo de una pista debe dejar **inequívocamente claro que es una anotación, no un elemento interactivo** [2].

**Promoción de funciones al lanzamiento: evitar.** Los usuarios rara vez necesitan que se les repita dentro de la app lo que ya leyeron en la tienda. El patrón sirve mejor para usuarios existentes descubriendo funciones nuevas, y no debe usarse para insistir con funciones viejas poco usadas [2].

**Ayuda contextual: el patrón que NN/g defiende.** Prefiere la ayuda en contexto sobre la instrucción por adelantado, con las pistas apareciendo cuando la función se vuelve accionable para el usuario [2].

### 4. Sobre las cifras de "engagement" que circulan

Varias fuentes secundarias de la industria citan cifras llamativas atribuidas a NN/g — por ejemplo, que la guía disparada por comportamiento tendría 68% más engagement y 54% mejor adopción que las alternativas por tiempo o ubicación. **Esa cifra no se pudo verificar contra una publicación de NN/g** en esta sesión, y proviene de blogs de proveedores de herramientas de onboarding, que tienen un interés comercial directo en que el onboarding parezca eficaz. Se registra aquí como **no verificada** y no se usa como base de ninguna decisión. La posición documentada de NN/g apunta, si acaso, en dirección contraria: menos onboarding, más interfaz usable.

### 5. Qué es genuinamente novedoso en Math Challenge

Aplicando el criterio 3 de NN/g — solo lo que se aparta de los patrones estándar merece explicación — el producto tiene exactamente cinco conceptos que un usuario no puede inferir de la interfaz:

1. **La edad y la dificultad son ejes separados** (D-002, D-017). Contraintuitivo y central; sin esto un papá no entiende por qué su hijo de 7 años ve un tema de primaria pero contenido de kinder.
2. **El niño es un perfil, no un usuario** (D-013). Se aparta del modelo mental de "crear una cuenta para mi hijo" que traen de otros productos.
3. **La ubicación no es un examen**, y en kinder ni siquiera lo parece (D-002, `mc-44`).
4. **Los clubs y salones no tienen chat, y nunca lo van a tener** (D-011, D-027). Es una ausencia deliberada, y una ausencia no se explica sola.
5. **Las prendas no tienen perdedor** (D-028). Se aparta de lo que "apuesta" significa para cualquiera que llegue.

Todo lo demás — tocar la respuesta correcta, ver tus puntos, cambiar de perfil — debe explicarse solo o es un defecto de interfaz, no un hueco de onboarding.

## Design implications

1. **Ningún registro pasa de 3 campos, y ninguno de los nuestros necesita más de 2.** Correo y contraseña para las tres puertas de entrada (adulto, papá, maestro). Todo lo demás es configuración posterior.
2. **Registrarse no es configurarse.** El perfil del hijo, la banda de edad, el límite de pantalla y el salón se piden *después* del registro, en pasos separados y saltables con defaults sanos — el rango de 5-7 campos es justo donde está el despeñadero [5].
3. **Cero carrusel de bienvenida**, en ninguna de las cinco entradas. Es el formato que NN/g desaconseja por nombre y cuya investigación específica no encontró mejora en el desempeño [2].
4. **Exactamente cinco marcas contextuales**, una por cada concepto genuinamente novedoso (§5), cada una disparada en el momento en que su función se vuelve accionable, no al abrir la app [2].
5. **Cada marca contextual se ve como anotación, nunca como control.** Estilo visual inequívocamente distinto de cualquier elemento tocable [2].
6. **El adulto llega a su primera pregunta de matemáticas sin pasar por un formulario más allá del registro.** Es la prueba de fuego de "probar la app sin onboarding" [2] aplicada al caso de uso principal.
7. **La verificación del maestro va antes de crear un salón, no antes de registrarse.** Mover fricción de identidad al registro castiga a todos por un requisito que solo aplica a quien va a tener niños ajenos a la vista.
8. **Toda marca contextual es descartable permanentemente y no se vuelve a mostrar.** Reaparecer es la versión de onboarding del patrón de "nagging" que la FTC nombra explícitamente (`mc-17`).
9. **Instrumentar el embudo por paso desde el primer día**, para poder medir la hipótesis de §1 en nuestros propios datos en vez de heredar el benchmark: registro iniciado → registro completo → primer perfil creado → primer reto terminado.
10. **En kinder no hay onboarding para el niño, en absoluto.** El primer paseo por la Sabana *es* la ubicación (`mc-44`), y el niño no lee — cualquier pantalla explicativa dirigida a él es, por definición, inútil.

## Open questions for the project owner

1. ¿El registro del adulto usa contraseña, enlace mágico o passkey? El enlace mágico baja a **un** campo pero agrega un salto al correo a media activación.
2. ¿Se mide el embudo con Web Analytics (sin cookies, muestreado al 10% tras 7 días) o hace falta algo con retención más larga para poder comparar cohortes de registro?
3. ¿Las cinco marcas contextuales se autoran por idioma o se traducen? El tono de una explicación breve es justo donde la traducción literal suena condescendiente (`mc-37`).
4. ¿Vale la pena una prueba A/B de 2 vs. 3 campos en el registro del papá, dado que la evidencia externa no es unánime (§1)?

## Sources

1. HubSpot, análisis de formularios de 40,000 clientes (4→3 campos, ~+50% conversión), relayed vía Venture Harbour, "5 Studies on How Form Length Impacts Conversion Rates" — https://ventureharbour.com/how-form-length-impacts-conversion-rates/
2. Nielsen Norman Group, "Mobile App Onboarding" — https://www.nngroup.com/articles/mobile-app-onboarding/ — fuente primaria de la posición contra el onboarding, del hallazgo sobre deck-of-cards tutorials, de los tres casos justificados y de la regla visual de anotación-vs-control.
3. Cobloom, "Form Fields and Conversion Rates: Is Less Really More?" — https://www.cobloom.com/blog/form-fields-and-conversion-rates-is-less-really-more — fuente de los contraejemplos (caída del 14%, diez campos superando a tres).
4. Mailmunch, "How Does Form Length Affect Your Conversion Rate" — https://www.mailmunch.com/blog/form-length-affect-conversion-rate
5. Digital Applied, "Form Conversion Rate Benchmarks 2026: 100+ Data Points" — https://www.digitalapplied.com/blog/form-conversion-rate-benchmarks-2026-data-points — fuente de la curva 3/5/7/10+ y del quiebre no lineal entre 5 y 7 campos.

**Advertencia de método y calidad de fuentes.** Solo la fuente [2] es investigación primaria de una organización de UX independiente. Las fuentes [1], [3], [4] y [5] son publicaciones de la industria del marketing y de proveedores de herramientas de formularios, con interés comercial en el tema que miden; la cifra de HubSpot se cita de segunda mano porque el estudio original no fue recuperable directamente en esta sesión. Las cifras de conversión de §1 deben tratarse como **orden de magnitud direccional**, no como constantes. La cifra de "68% más engagement" que circula atribuida a NN/g **no se pudo verificar y no se usa** (§4).
