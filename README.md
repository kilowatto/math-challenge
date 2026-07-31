# Math Challenge

> **math.kilowatto.com** — de contar patos a topología algebraica.
> **From counting ducks to algebraic topology.**
>
> 🇪🇸 Español · 🇬🇧 English

---

## Español

Un juego de retos matemáticos **PWA-first** que va de los 4 años al matemático
profesional, en cinco idiomas, sobre Cloudflare.

**Cómo funciona.** Un padre se registra y crea perfiles para sus hijos. Una
prueba de ubicación adaptativa determina el **nivel de dificultad**; la edad
determina el **tema visual** — son dos ejes distintos, a propósito, para que un
niño de 7 años que va adelantado no reciba una interfaz de adulto ni un adulto
que batalla con fracciones reciba una de kinder.

Los retos se componen de un banco de ítems y se califican con una regla validada
que combina **precisión y velocidad** — con el peso de la velocidad en cero para
los niños pequeños, porque cronometrar a un niño de cinco años mide su ansiedad,
no su matemática.

**Larry**, el rinoceronte naranja de Ignia, es el tutor: al cerrar cada reto
explica qué estuvo bien, por qué se perdieron puntos y cómo hacerlo bien — como
un profesor buena onda, nunca como un examinador.

### Estado

**Fase de planeación.** No hay código todavía. Lo que existe es la
investigación y el plan:

| Documento | Qué es |
|-----------|--------|
| [`docs/master-plan.md`](docs/master-plan.md) | El plan integral, en 15 secciones |
| [`docs/decisions.md`](docs/decisions.md) | Las decisiones del dueño, con fecha y evidencia |
| [`docs/infrastructure.md`](docs/infrastructure.md) | Los 27 objetos `math-challenge-*` de Cloudflare |
| [`docs/research/`](docs/research/README.md) | 43 investigaciones, ~143,000 palabras |
| [`CLAUDE.md`](CLAUDE.md) | Reglas del proyecto: líneas rojas, commits, contenido |

### Principios que no se negocian

1. La práctica es **gratis para siempre**. Nunca se cobra por dejar que un niño
   haga matemáticas.
2. El niño **nunca es un usuario**: es un perfil dentro de la cuenta del padre.
   No pedimos su nombre, ni su correo, ni su foto.
3. **Nunca** cámara, micrófono ni biometría. A nadie, en ningún nivel.
4. El límite de pantalla **nunca rompe una racha**. Castigar a un niño por
   respetar un límite sano lo pone en contra de su padre.
5. Larry **nunca avergüenza** a un niño por equivocarse.

---

## English

A **PWA-first** math challenge game spanning ages 4 to professional
mathematician, in five languages, built on Cloudflare.

**How it works.** A parent registers and creates profiles for their children. An
adaptive placement test sets the **difficulty level**; age sets the **visual
theme** — two separate axes, deliberately, so an advanced seven-year-old doesn't
get an adult interface and an adult struggling with fractions doesn't get a
kindergarten one.

Challenges are composed from an item bank and scored by a validated rule
combining **accuracy and speed** — with the speed weight set to zero for young
children, because timing a five-year-old measures their anxiety, not their
mathematics.

**Larry**, Ignia's orange rhino, is the tutor: after each challenge he explains
what went right, why points were lost, and how to do it properly — like a
friendly professor, never like an examiner.

### Status

**Planning phase.** No code yet. What exists is the research and the plan — see
the table above; every document has an English executive summary.

### Non-negotiable principles

1. Practice is **free forever**. We never charge a child for doing mathematics.
2. A child is **never a user** — only a profile inside a parent's account. We
   don't ask for their name, email, or photo.
3. **Never** camera, microphone, or biometrics. For anyone, at any tier.
4. A screen-time limit **never breaks a streak**. Punishing a child for
   respecting a healthy limit turns them against their parent.
5. Larry **never shames** a child for being wrong.

---

## Idiomas del producto / Product languages

`en` · `es-MX` · `es-ES` · `fr-FR` · `pt-BR` · `pt-PT` · `de-DE`

El contenido matemático se **autora** por idioma, no se traduce. En alemán el 21
se dice "einundzwanzig" (uno-y-veinte) y en francés el 90 es "quatre-vingt-dix"
(cuatro-veintes-diez), y eso cambia el orden en que un niño puede aprender a
contar. México es el único país hispanohablante con **punto** decimal, y Portugal
usa escala larga mientras Brasil usa escala corta.

*Math content is authored per language, not translated — see
[`docs/research/2026-07-31-mc-34-i18n-math-notation.md`](docs/research/2026-07-31-mc-34-i18n-math-notation.md).*

---

## Licencia / License

Privado. Todos los derechos reservados. · Private. All rights reserved.
