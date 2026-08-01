# Por qué existe Math Challenge

> La historia del dueño, en sus términos. Levantada en entrevista el 2026-07-31.
>
> **Para qué sirve este documento.** Es la fuente de la voz del sitio público. La
> investigación aporta *Expertise* y *Trustworthiness*; esto aporta la *Experience*
> — la participación de primera mano que ninguna cita puede sustituir, y que
> Google añadió como primera letra de E-E-A-T en diciembre de 2022 (`mc-48`).
> No se inventa, no se adorna, y si algo aquí deja de ser cierto se corrige.

---

## El origen, en dos mitades

**La primera mitad es sobre los niños y TikTok.**

Esteban empezó pensando en la cantidad de niños que pierden el tiempo en TikTok y
plataformas parecidas, y pensó en hacer algo adictivo que pudiera competirle a
eso.

Esa palabra —*adictivo*— es el origen literal del brief, y es la que la
investigación pasó semanas contradiciendo. Vale la pena decir con precisión qué
pasó, porque el relato fácil sería esconderlo y el relato verdadero es mejor:

**la intención nunca fue explotar a un niño; fue recuperar su atención de algo que
ya lo hace.** TikTok es el incumbente de la atención infantil. Querer competirle
es una meta legítima, y muy pocos productos educativos la enuncian tan
directamente.

Lo que la investigación demostró es que **no se le puede ganar a TikTok siendo más
adictivo** — ni éticamente ni legalmente. `mc-17` documenta que la Ley de Equidad
Digital de la UE se está escribiendo específicamente contra el "diseño adictivo",
que el Children's Code británico prohíbe las técnicas de *nudge* con menores, y
que a Prodigy Math le llegó una queja ante la FTC firmada por más de veinte
organizaciones. `mc-10` documenta que las mecánicas que más enganchan a un niño
chico son las mismas que le producen ansiedad matemática.

Así que el objetivo se quedó y el método cambió: **no ser más adictivo que TikTok,
sino ser lo que vale la pena elegir.** Esa es la tensión T-1 en `decisions.md`, y
se cerró con D-014 — toda la maquinaria de enganche que tiene evidencia detrás, y
ninguna que tenga exposición regulatoria.

**La segunda mitad es sobre él.**

También le gustan las matemáticas, y lleva veinticinco años sin estudiarlas. Así
que pensó en un juego para retar su propia mente.

Esto explica algo del producto que de otra forma parecería ambición desmedida:
**por qué la escalera llega hasta topología algebraica y nivel doctorado, y por qué
existen los clubs de adultos con retos entre amigos.** No son funciones que se le
agregaron a un producto infantil para ampliar mercado. Son el caso de uso del
propio dueño. El adulto que quiere volver a las matemáticas veinticinco años
después no es un segmento secundario: es la persona que empezó esto.

---

## Su relación con las matemáticas

**Siempre se le dieron.**

Importa decirlo porque cambia desde dónde está escrito el producto. No es la
historia de alguien que sufrió las matemáticas y quiere evitárselo a otros. Es la
de alguien a quien se le dieron bien, y que por eso **vio de cerca a los que se
quedaban en el camino** — y sabe que la diferencia no fue solo talento.

De ahí sale una postura concreta del producto: las líneas rojas contra humillar a
un niño y contra el cronómetro en las edades chicas no vienen de una herida
propia. Vienen de haber visto el sistema perder gente que sí servía para esto.

---

## Contra qué está

**Cobrarle a un niño por practicar.**

Corazones, vidas, energía que se acaba. Un niño que quiere hacer matemáticas y no
puede porque se le acabaron los intentos.

De ahí sale la línea que no se negocia: **la práctica es gratis para siempre**
(D-021). Nunca se cobra por dejar que un niño haga matemáticas. Se cobra el
acompañamiento al padre, que es otra cosa.

Y hay una segunda mitad, en positivo: **usar sus capacidades y las de Ignia Cloud
para llevar al extremo un proyecto que sea benéfico para todos.** No es un
proyecto pequeño a propósito. La ambición técnica —siete locales, kinder a
doctorado, offline en redes malas, 35 auditores adversariales en el despliegue—
es parte del punto, no un exceso.

---

## Qué haría que valiera la pena

**Que llegue a quien no puede pagar.**

Niños en escuelas públicas, en redes congestionadas, en teléfonos viejos, en cinco
idiomas, sin costo. Que la gratuidad no sea una versión recortada del producto
sino **el producto**.

Eso convierte varias decisiones técnicas en decisiones morales, y conviene verlas
juntas:

- El presupuesto de rendimiento en Android de gama baja sobre 3G no es una
  optimización: es la condición para que este objetivo sea cierto (`mc-47`).
- HTTP/3, que da 10-30% de mejora en conexiones con pérdida de paquetes, importa
  precisamente para el usuario que este objetivo nombra (`mc-47`).
- El modo sin conexión no es una función de lujo: es lo que hace que la app sirva
  donde la red no (`mc-33`).
- Los siete locales autorados en vez de traducidos son caros justo por esto
  (`mc-34`, D-022).

---

## Lo que esta historia obliga a no hacer

Publicar esto tiene consecuencias, y es honesto anotarlas junto a la historia:

1. **No se puede reclamar que enseña** hasta tener un estudio propio con pre/post
   y retención diferida. El plan maestro §14 ya lo prohíbe; con un sitio que
   presume rigor, una sola afirmación sin sustento cuesta más.
2. **No se puede presumir infraestructura que no es.** El proyecto es de Ignia y
   corre sobre Cloudflare; las dos cosas se dicen por separado y las dos son
   verificables (`mc-48` §6).
3. **No se puede esconder la palabra "adictivo".** Está en el origen, la
   investigación la contradijo, y el producto cambió. Contarlo completo es más
   fuerte que omitirlo — y es lo que separa un sitio con evidencia de un sitio
   con marketing.
4. **La gratuidad deja de ser una decisión de precio** y pasa a ser una promesa
   pública. Si algún día se cobra por practicar, esta página es el documento que
   lo contradice.

---

## Cómo se usa esto en el sitio

La historia se cuenta completa, incluidas la palabra "adictivo" y su corrección.
La página de origen no abre con el producto: abre con **niños perdiendo el tiempo
en TikTok y un adulto que extrañaba las matemáticas**, que es de dónde salió de
verdad.

Y no se le pone épica que no tiene. Es un tipo al que se le daban bien las
matemáticas, que vio a otros quedarse fuera, que no soporta que le cobren a un
niño por practicar, y que tiene los medios para hacer algo al respecto. Eso
alcanza.
