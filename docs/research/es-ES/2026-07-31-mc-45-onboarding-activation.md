# Onboarding, registro y activación: cuántos campos, y por qué los tours casi nunca sirven

> Math Challenge research — 2026-07-31 — topic 45

## Resumen ejecutivo (ES)

- **El registro es el cuello de botella medible.** HubSpot analizó formularios de 40.000 clientes y encontró que pasar de 4 campos a 3 aumentó la conversión **casi 50 %** [1]. Los benchmarks de 2026 ofrecen una curva completa: 23,1 % con 3 campos, 17,0 % con 5, 11,4 % con 7, 6,9 % con 10 o más [5].
- **La caída no es lineal.** Entre 5 y 7 campos cada campo adicional cuesta ~2,8 puntos porcentuales, frente a ~1,5 antes de ese rango [5] — hay un despeñadero, no una pendiente.
- **La relación no es una ley.** Varias fuentes documentan casos en los que reducir campos *bajó* la conversión un 14 % y análisis donde diez campos convirtieron mejor que tres [3][5]. La lectura honesta: menos campos ayuda casi siempre, pero es una hipótesis que hay que medir, no un axioma.
- **Nielsen Norman Group desaconseja el onboarding, en general.** Su recomendación literal es *«eviten crear onboarding de app siempre que sea posible y, en su lugar, gasten esos recursos en hacer la interfaz más usable»*, por tres razones: sube el **coste** de interacción, carga la memoria de trabajo y la investigación muestra que a menudo no mejora el **rendimiento** real en la tarea [2].
- **El carrusel de tarjetas está desaconsejado por su nombre.** NN/g lo señala explícitamente: hace que la interfaz *parezca más compleja de lo que es*, carga la memoria de trabajo y su investigación sobre «deck‑of‑cards tutorials» encontró que **no mejoraron el rendimiento en la tarea** [2].
- **Solo tres casos justifican el onboarding**, según NN/g: solicitar información indispensable, adaptar la experiencia al contexto del usuario e introducir flujos **genuinamente novedosos** que se apartan de los patrones estándar [2].
- **Lo que sí funciona es contextual.** NN/g prefiere la ayuda en contexto sobre la instrucción anticipada: las pistas aparecen cuando la función se vuelve accionable, no al abrir la app [2]. Las marcas de guía (*coach marks*) funcionan cuando son oportunas y discretas, y van acompañadas de la tarea real [2].
- **Una regla visual concreta:** el estilo de una pista debe dejar inequívocamente claro que es una anotación y **no un elemento interactivo** [2].
- **NN/g recomienda probar la app sin onboarding primero**, para identificar dificultades reales antes de invertir en resolverlas con pantallas [2].
- Implicación central para Math Challenge: **registro de 2 campos, configuración progresiva y saltable, y exactamente cinco marcas contextuales** — las cinco cosas del producto que son de verdad novedosas y no se explican solas.

## Executive summary (EN)

- **El registro es el cuello de botella medible.** HubSpot analizó formularios de 40.000 clientes y descubrió que reducir los campos de 4 a 3 aumentó la conversión **casi 50 %** [1]. Los benchmarks de 2026 proporcionan la curva completa: 23,1 % con 3 campos, 17,0 % con 5, 11,4 % con 7, 6,9 % con 10 o más [5].
- **La caída no es lineal.** Entre 5 y 7 campos, cada campo añadido cuesta ~2,8 puntos porcentuales frente a ~1,5 por debajo de ese rango [5] — se trata de un precipicio, no de una pendiente.
- **No es una ley.** Algunas fuentes documentan casos en los que recortar campos *redujo* la conversión un 14 % y análisis donde diez campos superaron a tres [3][5]. Lectura honesta: menos campos ayuda casi siempre, pero es una hipótesis que debe medirse, no un axioma.
- **Nielsen Norman Group aconseja no usar onboarding en general.** Su recomendación literal es *«eviten crear onboarding de app siempre que sea posible y, en su lugar, destinen esos recursos a hacer la interfaz más usable»* — porque eleva el **coste** de interacción, sobrecarga la memoria de trabajo y la investigación muestra que a menudo no mejora el **rendimiento** real en la tarea [2].
- **El formato carrusel de tarjetas está desaconsejado por su nombre.** NN/g indica que hace que las interfaces *parezcan más complejas de lo que son*, sobrecarga la memoria de trabajo y su estudio sobre tutoriales tipo «deck‑of‑cards» constató que **no mejoraron el rendimiento en la tarea** [2].
- **Solo tres casos justifican el onboarding**, según NN/g: recopilar información esencial, adaptar la experiencia al contexto del usuario e introducir flujos **genuinamente novedosos** que se alejan de los patrones estándar [2].
- **Lo que funciona es la ayuda contextual.** NN/g prefiere la ayuda en contexto sobre la instrucción anticipada: los consejos aparecen cuando la función se vuelve accionable, no al iniciar la app [2]. Las marcas de guía (*coach marks*) son eficaces cuando son oportunas, discretas y se acompañan de la tarea real [2].
- **Una regla visual concreta:** el estilo visual de una pista debe dejar inequívocamente claro que se trata de una anotación y **no de un elemento interactivo** [2].
- **NN/g recomienda probar la app sin onboarding primero**, para detectar dificultades reales antes de invertir en pantallas que las solucionen [2].
- Implicación central: **registro de 2 campos, configuración progresiva y saltable, y exactamente cinco marcas contextuales** — los cinco aspectos del producto que son realmente novedosos y no se explican por sí mismos.

## Hallazgos

### 1. El coste de cada campo de registro

La cifra más citada y mejor sustentada viene de HubSpot, que estudió formularios de contacto de 40.000 clientes: la conversión **subió casi la mitad** al reducir de 4 campos a 3 [1]. Un estudio de benchmarks de 2026 traza la curva completa y es la fuente más útil para presupuestar campos [5]:

| Campos | Conversión |
|---|---|
| 3 | 23,1 % |
| 5 | 17,0 % |
| 7 | 11,4 % |
| 10+ | 6,9 % |

Lo importante no es la pendiente media sino **dónde está el quiebre**: entre 5 y 7 campos cada campo adicional cuesta ~2,8 puntos porcentuales, contra ~1,5 puntos por campo antes de ese rango [5]. Es decir, el sexto y séptimo campo son mucho más caros que el cuarto.

**La advertencia que hay que conservar.** La correlación no es perfecta ni universal: hay casos documentados donde reducir campos produjo una **caída** del 14 % en conversión, y al menos un análisis donde diez campos convirtieron mejor que tres [3][5]. La explicación habitual es la calidad de intención — un formulario largo filtra curiosos —, lo cual importa poco para un producto gratuito donde el objetivo es que el papá llegue a ver a su hijo resolviendo una suma. Para Math Challenge la regla de «menos campos» aplica con fuerza, pero se registra como hipótesis a medir, no como hecho establecido.

### 2. La posición de Nielsen Norman Group sobre onboarding

Esta es la parte incómoda y la más valiosa. La recomendación principal de NN/g es que el onboarding **se evite**: *«avoid creating app onboarding whenever possible and instead spend your resources making the UI more usable»* [2]. El razonamiento tiene tres patas: aumenta el coste de interacción, carga la memoria de trabajo, y la investigación muestra que frecuentemente **no mejora el rendimiento real en la tarea** [2].

NN/g reconoce exactamente tres escenarios que justifican pantallas de onboarding [2]:

1. **Recolectar información indispensable** (el ejemplo que dan: crear cuenta en una app bancaria).
2. **Adaptar la experiencia** al contexto o las preferencias del usuario.
3. **Introducir flujos genuinamente novedosos o desconocidos** que se apartan de los patrones estándar.

Y una recomendación de método que vale más que cualquier patrón: **probar la app sin onboarding primero**, para identificar las dificultades reales de los usuarios antes de invertir en resolverlas con pantallas [2].

### 3. Qué formato funciona y cuál no

**Carrusel de tarjetas («deck-of-cards tutorial»): desaconsejado por nombre.** NN/g señala que hace que la interfaz *parezca más compleja de lo que es* y carga la memoria de trabajo; su investigación sobre este formato específico encontró que **no mejoró el rendimiento en la tarea** [2]. Es, con diferencia, el formato más popular en la industria y el peor sustentado.

**Marcas de guía y superposiciones instructivas: útiles con condiciones.** Funcionan cuando son **oportunas y discretas**, y cuando van acompañadas de la ejecución real de la tarea [2]. NN/g las califica como *«nice-to-have»* más que esenciales [2]. La regla visual concreta: el estilo de una pista debe dejar **inequívocamente claro que es una anotación, no un elemento interactivo** [2].

**Promoción de funciones al lanzamiento: evitar.** Los usuarios rara vez necesitan que se les repita dentro de la app lo que ya leyeron en la tienda. El patrón sirve mejor para usuarios existentes descubriendo funciones nuevas, y no debe usarse para insistir con funciones viejas poco usadas [2].

**Ayuda contextual: el patrón que NN/g defiende.** Prefiere la ayuda en contexto sobre la instrucción por adelantado, con las pistas apareciendo cuando la función se vuelve accionable para el usuario [2].

### 4. Sobre las cifras de «engagement» que circulan

Varias fuentes secundarias de la industria citan cifras llamativas atribuidas a NN/g — por ejemplo, que la guía disparada por comportamiento tendría un 68 % más de engagement y un 54 % mejor adopción que las alternativas por tiempo o ubicación. **Esa cifra no se pudo verificar contra una publicación de NN/g** en esta sesión, y proviene de blogs de proveedores de herramientas de onboarding, que tienen un interés comercial directo en que el onboarding parezca eficaz. Se registra aquí como **no verificada** y no se usa como base de ninguna decisión. La posición documentada de NN/g apunta, si acaso, en dirección contraria: menos onboarding, más interfaz usable.

### 5. Qué es genuinamente novedoso en Math Challenge

Aplicando el criterio 3 de NN/g — solo lo que se aparta de los patrones estándar merece explicación — el producto tiene exactamente cinco conceptos que un usuario no puede inferir de la interfaz:

1. **La edad y la dificultad son ejes separados** (D-002, D-017). Contraintuitivo y central; sin esto un papá no entiende por qué su hijo de 7 años ve un tema de primaria pero contenido de Educación Infantil.
2. **El niño es un perfil, no un usuario** (D-013). Se aparta del modelo mental de «crear una cuenta para mi hijo» que traen de otros productos.
3. **La ubicación no es un examen**, y en Educación Infantil ni siquiera lo parece (D-002, `mc-44`).
4. **Los clubs y salones no tienen chat, y nunca lo van a tener** (D-011, D-027). Es una ausencia deliberada, y una ausencia no se explica sola.
5. **Las prendas no tienen perdedor** (D-028). Se aparta de lo que «apuesta» significa para cualquiera que llegue.

Todo lo demás — tocar la respuesta correcta, ver tus puntos, cambiar de perfil — debe explicarse solo o es un defecto de interfaz, no un hueco de onboarding.

## Design implications

1. **Ningún registro pasa de 3 campos, y ninguno de los nuestros necesita más de 2.** Correo y contraseña para las tres puertas de entrada (adulto, padre, maestro). Todo lo demás es configuración posterior.  
2. **Registrarse no es configurarse.** El perfil del hijo, la franja de edad, el límite de pantalla y el aula se piden *después* del registro, en pasos separados y saltables con defaults sanos — el rango de 5-7 campos es justo donde está el despeñadero [5].  
3. **Cero carrusel de bienvenida**, en ninguna de las cinco entradas. Es el formato que NN/g desaconseja por nombre y cuya investigación específica no encontró mejora en el rendimiento [2].  
4. **Exactamente cinco marcas contextuales**, una por cada concepto genuinamente novedoso (§5), cada una disparada en el momento en que su función se vuelve accionable, no al abrir la app [2].  
5. **Cada marca contextual se ve como anotación, nunca como control.** Estilo visual inequívocamente distinto de cualquier elemento tocable [2].  
6. **El adulto llega a su primera pregunta de matemáticas sin pasar por un formulario más allá del registro.** Es la prueba de fuego de "probar la app sin onboarding" [2] aplicada al caso de uso principal.  
7. **La verificación del maestro va antes de crear un aula, no antes de registrarse.** Mover fricción de identidad al registro castiga a todos por un requisito que solo aplica a quien va a tener niños ajenos a la vista.  
8. **Toda marca contextual es descartable permanentemente y no se vuelve a mostrar.** Reaparecer es la versión de onboarding del patrón de "nagging" que la FTC nombra explícitamente (`mc-17`).  
9. **Instrumentar el embudo por paso desde el primer día**, para poder medir la hipótesis de §1 en nuestros propios datos en vez de heredar el benchmark: registro iniciado → registro completo → primer perfil creado → primer reto terminado.  
10. **En educación infantil no hay onboarding para el niño, en absoluto.** El primer paseo por la Sabana *es* la ubicación (`mc-44`), y el niño no lee — cualquier pantalla explicativa dirigida a él es, por definición, inútil.

## Open questions for the project owner

1. ¿El registro del adulto usa contraseña, enlace mágico o passkey? El enlace mágico baja a **un** campo pero agrega un salto al correo a media activación.  
2. ¿Se mide el embudo con Web Analytics (sin cookies, muestreado al 10 % tras 7 días) o hace falta algo con retención más larga para poder comparar cohortes de registro?  
3. ¿Las cinco marcas contextuales se autoran por idioma o se traducen? El tono de una explicación breve es justo donde la traducción literal suena condescendiente (`mc-37`).  
4. ¿Vale la pena una prueba A/B de 2 vs. 3 campos en el registro del padre, dado que la evidencia externa no es unánime (§1)?

## Sources

1. HubSpot, análisis de formularios de 40.000 clientes (4→3 campos, ~+50 % conversión), relayed vía Venture Harbour, "5 Studies on How Form Length Impacts Conversion Rates" — https://ventureharbour.com/how-form-length-impacts-conversion-rates/  
2. Nielsen Norman Group, "Mobile App Onboarding" — https://www.nngroup.com/articles/mobile-app-onboarding/ — fuente primaria de la posición contra el onboarding, del hallazgo sobre deck-of-cards tutorials, de los tres casos justificados y de la regla visual de anotación‑vs‑control.  
3. Cobloom, "Form Fields and Conversion Rates: Is Less Really More?" — https://www.cobloom.com/blog/form-fields-and-conversion-rates-is-less-really-more — fuente de los contraejemplos (caída del 14 %, diez campos superando a tres).  
4. Mailmunch, "How Does Form Length Affect Your Conversion Rate" — https://www.mailmunch.com/blog/form-length-affect-conversion-rate  
5. Digital Applied, "Form Conversion Rate Benchmarks 2026: 100+ Data Points" — https://www.digitalapplied.com/blog/form-conversion-rate-benchmarks-2026-data-points — fuente de la curva 3/5/7/10+ y del quiebre no lineal entre 5 y 7 campos.

**Advertencia de método y calidad de fuentes.** Solo la fuente [2] es investigación primaria de una organización de UX independiente. Las fuentes [1], [3], [4] y [5] son publicaciones de la industria del marketing y de proveedores de herramientas de formularios, con interés comercial en el tema que miden; la cifra de HubSpot se cita de segunda mano porque el estudio original no fue recuperable directamente en esta sesión. Las cifras de conversión de §1 deben tratarse como **orden de magnitud direccional**, no como constantes. La cifra de "68 % más engagement" que circula atribuida a NN/g **no se pudo verificar y no se usa** (§4).
