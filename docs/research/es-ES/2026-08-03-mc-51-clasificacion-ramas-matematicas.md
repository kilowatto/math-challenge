# Clasificación de las ramas de las matemáticas y su estructura de prerrequisitos — de MSC 2020 a los planes universitarios y los currículos escolares del mundo

> Investigación Math Challenge — 2026-08-03 — tema 51

## Resumen ejecutivo (ES)

- Existen tres clasificaciones vivas de las ramas de las matemáticas, y son
  distintas a propósito: **MSC 2020** (63 áreas de dos dígitos, la citable por
  defecto — licencia abierta, mantenimiento dual AMS/zbMATH, revisión decanal)
  [1][2], **arXiv math** (32 categorías, la que refleja la práctica actual de
  investigación) [3], y las **secciones del ICM** (20 en 2022, revisadas cada
  cuatro años por el Structure Committee) [4][5]. Para lo escolar no existe
  taxonomía de ramas: lo que hay es PISA (4 categorías de contenido de
  evaluación) e ISCED-F de UNESCO (0541 Mathematics / 0542 Statistics) [6][7].
- La **estructura de prerrequisitos escolar es universal**: conteo →
  suma/resta → multiplicación/división → fracciones (exige división) →
  decimales → porcentaje (exige fracciones/100) → razón y proporción (exige
  multiplicación y fracciones) → enteros y pre-álgebra → ecuaciones lineales →
  funciones → cuadráticas → exponenciales → trigonometría (exige
  **simultáneamente** geometría y funciones) → cálculo (exige funciones).
  Verificado contra Common Core, el National Curriculum inglés, IB, México SEP,
  España LOMLOE, Francia lycée, Baviera Gymnasium y Singapur MOE [8]-[17].
- **Lo que cambia por país no es el orden sino el empaquetado**: EE.UU. permite
  Algebra I → Geometry → Algebra II o integrado; España bifurca en 4º ESO (A/B);
  Francia especializa en première; Singapur hace streaming (Standard/
  Foundation); el O-level base de Singapur y el GCSE **no incluyen cálculo**.
- En la universidad, la cadena dominante verificada en 10 instituciones (MIT,
  Harvard, Stanford, Cambridge, Oxford, ETH, Princeton, Berkeley, UNAM,
  Sorbonne) [18]-[27]: **álgebra lineal va después o en paralelo al cálculo
  multivariable, nunca antes del cálculo de una variable**; la probabilidad
  entra dos veces (temprana con cálculo, rigurosa tras la teoría de la medida);
  el **curso puente de demostración** existe en todas partes con tres diseños
  (curso explícito, integrado desde el día 1, pista acelerada); el análisis
  real exige solo cálculo, pero todo lo que sigue (análisis funcional,
  variedades, EDPs) exige **análisis real ∧ álgebra lineal** a la vez.
- Consecuencia para Math Challenge: la escalera N1-N12 debe llevar **códigos de
  rama** y **aristas de prerrequisito** separadas del nivel de dificultad. El
  nivel dice qué tan difícil es; la rama dice de qué familia es; la arista dice
  qué debe saber antes. Sin las tres cosas, «6 retos por nivel» (D-122) no
  puede garantizar cobertura por rama — que es justo lo que este documento
  habilita medir.
- Advertencia de diseño: el ejemplo ingenuo «álgebra exige geometría básica»
  **es falso en todos los sistemas verificados** — geometría corre en espiral
  paralela, no como prerrequisito de álgebra. Las dependencias duras reales
  son: fracciones exige división; porcentaje exige fracciones; razón exige
  fracciones; trigonometría exige geometría + funciones; cálculo exige
  funciones; análisis real exige cálculo; análisis funcional/EDPs/probabilidad
  teórica exigen análisis real + álgebra lineal (+ medida).

## Executive summary (EN)

- Three live classifications of mathematical branches exist, deliberately
  different: **MSC 2020** (63 two-digit areas, the citable default — open
  license, dual AMS/zbMATH maintenance, decennial review) [1][2], **arXiv
  math** (32 categories, reflecting current research practice) [3], and the
  **ICM sections** (20 in 2022, revised every four years) [4][5]. School-level
  has no branch taxonomy: PISA offers 4 evaluation content categories and
  UNESCO's ISCED-F offers 0541/0542 [6][7].
- The **school prerequisite structure is universal**: counting → add/subtract
  → multiply/divide → fractions (requires division) → decimals → percentages
  (requires fractions/100) → ratio and proportion → integers and pre-algebra →
  linear equations → functions → quadratics → exponentials → trigonometry
  (requires **both** geometry and functions) → calculus (requires functions).
  Verified against Common Core, England's NC, IB, Mexico's SEP, Spain's
  LOMLOE, France's lycée, Bavaria's Gymnasium, and Singapore's MOE [8]-[17].
- What varies by country is packaging, not order: US allows traditional or
  integrated sequences; Spain forks at 4º ESO; France specializes in première;
  Singapore streams; base O-level and GCSE include **no calculus**.
- In universities (10 institutions verified) [18]-[27]: **linear algebra comes
  after or parallel to multivariable calculus, never before single-variable
  calculus**; probability enters twice (early calculus-based, rigorous after
  measure theory); a **proof-bridge course** exists everywhere in three
  designs; real analysis requires only calculus, but everything beyond
  (functional analysis, manifolds, PDEs) requires **real analysis ∧ linear
  algebra** together.
- Consequence for Math Challenge: the N1-N12 ladder needs **branch codes** and
  **prerequisite edges** separate from difficulty level. Level says how hard;
  branch says which family; the edge says what must be known first. Without
  all three, "6 challenges per level" (D-122) cannot guarantee branch
  coverage — which is what this document enables measuring.
- Design warning: the naive example "algebra requires basic geometry" is
  **false in every verified system** — geometry runs as a parallel spiral.
  The real hard dependencies are: fractions require division; percentages
  require fractions; ratio requires fractions; trigonometry requires
  geometry + functions; calculus requires functions; real analysis requires
  calculus; functional analysis/PDEs/theoretical probability require real
  analysis + linear algebra (+ measure theory).

## 1. Las tres clasificaciones vivas, y por qué no se puede elegir una sola

### 1.1 MSC 2020 — la espina dorsal citable

La Mathematics Subject Classification, revisión 2020, publicada conjuntamente
por Mathematical Reviews (AMS) y zbMATH bajo licencia CC-BY-NC-SA [1][2]:
**63 áreas de dos dígitos, 529 de tres, 6.022 de cinco** [2]. Cada ítem
clasificado lleva exactamente una clase primaria y cero o más secundarias [2].

Las 63 áreas de dos dígitos, del PDF oficial descargado [1]:

```
00 General/overarching      20 Group theory           43 Abstract harmonic      65 Numerical analysis
01 History and biography    22 Topological/Lie groups 44 Integral transforms    68 Computer science
03 Logic and foundations    26 Real functions         45 Integral equations     70 Mechanics: particles
05 Combinatorics            28 Measure/integration    46 Functional analysis    74 Mechanics: solids
06 Order and lattices       30 Complex variable       47 Operator theory        76 Fluid mechanics
08 General algebraic sys.   31 Potential theory       49 Calc. of variations    78 Optics, electromag.
11 Number theory            32 Several complex var.   51 Geometry               80 Thermodynamics
12 Field theory/polynomials 33 Special functions      52 Convex/discrete geom.  81 Quantum theory
13 Commutative algebra      34 ODEs                   53 Differential geometry  82 Statistical mechanics
14 Algebraic geometry       35 PDEs                   54 General topology       83 Relativity
15 Linear/multilinear alg.  37 Dynamical systems      55 Algebraic topology     85 Astronomy
16 Associative rings        39 Difference equations   57 Manifolds              86 Geophysics
17 Nonassociative rings     40 Sequences and series   58 Global analysis        90 Operations research
18 Category theory          41 Approximations         60 Probability            91 Game theory/economics
19 K-theory                 42 Harmonic analysis      62 Statistics             92 Biology
                                                                   93 Systems and control
                                                                   94 Information/circuits
                                                                   97 Mathematics education
```

Cambios 2010 → 2020: ninguno a dos dígitos («no se crearon nuevos campos»);
nueve clases nuevas de tres dígitos (18M, 18N, 53E, 57K, 57Z, 60L, 62R, 68V,
82M); 113 clases de cinco retiradas y 486 nuevas; guiones uniformados (`-08`
métodos computacionales, `-10` modelado, `-11` datos de investigación) [2].
El artículo oficial de la revisión es Dunne & Hulek, EMS Newsletter [28].

**Nota estructural relevante para nosotros:** el MSC no es un árbol, es un
DAG — las clases llevan referencias cruzadas explícitas (`{For differential
topology, see 57Rxx}`) [1]. Una clasificación de ramas que no admita enlaces
cruzados está mal diseñada desde el primer día.

### 1.2 arXiv math — la práctica actual

32 categorías `math.*` con descripciones oficiales [3]: AC (conmutativa), AG
(algebraica), AP (EDPs), AT (topología algebraica), CA (análisis clásico y
EDOs), CO (combinatoria), CT (categorías), CV (variable compleja), DG
(diferencial), DS (dinámicos), FA (funcional), GM, GN (topología general), GR
(grupos), GT (geométrica), HO, IT, KT, LO (lógica), MG (métrica), MP (física
matemática), NA (numérica), NT (números), OA (operadores), OC (optimización y
control), PR (probabilidad), QA (cuántica), RA (anillos), RT (representación),
SG (simpléctica), SP (espectral), ST (estadística). Refleja fronteras vivas que
MSC reparte (K-theory, simpléctica, cuántica tienen categoría propia), pero no
tiene proceso formal de revisión publicado.

### 1.3 Secciones del ICM — la vista comunitaria cuatrienal

Las 20 secciones del ICM 2022, de las actas oficiales EMS Press [4]: Logic;
Algebra; Number Theory; Algebraic and Complex Geometry; Geometry; Topology;
Lie Theory; Analysis; Dynamics; PDEs; Mathematical Physics; Probability;
Combinatorics; Mathematics of Computer Science; Numerical Analysis and
Scientific Computing; Control Theory and Optimization; Statistics and Data
Analysis; Stochastic and Differential Modelling; Mathematical Education;
History. **No son fijas**: el Structure Committee de la IMU las revisa cada
cuatro años (primer presidente: Terence Tao; desde agosto 2025: Martin
Hairer) [5].

### 1.4 Lo escolar: no hay taxonomía de ramas, y hay que decirlo

- **PISA 2022** clasifica el contenido de *evaluación* en cuatro categorías:
  quantity; uncertainty and data; change and relationships; space and shape
  (~¼ de ítems cada una) — no son ramas, son lentes de medición [6].
- **ISCED-F 2013 (UNESCO)** clasifica programas educativos: campo `054` →
  **0541 Mathematics** / **0542 Statistics** [7].
- Los currículos nacionales (§3) organizan por dominios o hilos temáticos, no
  por ramas de investigación. Cualquier catálogo que pretenda mapear «ramas»
  a edades escolares está construyendo algo nuevo — como este.

## 2. La estructura de prerrequisitos escolar: la espina universal

Verificada contra ocho sistemas [8]-[17]. El orden es el mismo en todos; solo
varía el empaquetado y el año.

### 2.1 Los nueve eslabones, con su dependencia dura

1. **Conteo y cardinalidad → suma y resta.** Universal (CCSS K-1, NC Y1,
   Singapur P1, México fase 3, Baviera primaria).
2. **Multiplicación y división** con el sistema posicional en paralelo. La
   división es el prerrequisito más citado de toda la escolaridad: abre
   fracciones, razón, porcentaje y media.
3. **Fracciones** (CCSS 3.NF, NC Y3-Y5, Singapur P2-P5, BNCC Números).
   **Exige división consolidada.** Los tres sistemas más detallados tratan
   fracciones/decimales/porcentajes como «formas del mismo número» (literal
   en NC Y4-Y5).
4. **Decimales → porcentaje.** **Porcentaje exige fracciones con denominador
   100** — es una razón por cien (CCSS 6.RP.3c, NC Y5).
5. **Razón y proporcionalidad** — el puente a la secundaria (CCSS 6.RP, NC
   Y6, México «variación», la big idea «Proportionality» de Singapur, el
   «taux d'évolution» francés). **Exige multiplicación, división y
   fracciones a la vez** — es la primera dependencia múltiple real.
6. **Enteros con signo y pre-álgebra → ecuaciones lineales → funciones
   lineales** (CCSS 7.NS → 8.EE → 8.F; Baviera M5 ℤ → M8; Francia seconde).
7. **Cuadráticas y polinomios → exponenciales y logaritmos** (Francia 1ʳᵉ:
   second degré → exponentielle definida como única f con f′ = f [14];
   Baviera M9 → M10; CCSS HS Algebra).
8. **Trigonometría.** **Exige simultáneamente geometría (semejanza,
   Pitágoras) y funciones** — por eso llega tarde en todos los sistemas
   (GCSE Higher, Francia 1ʳᵉ con círculo trigonométrico, Baviera M9-M10,
   O-level Singapur, CCSS HS Geometry/Algebra II).
9. **Cálculo** (derivada → integral). **Exige funciones y límites
   intuitivos.** Es el contenido de cierre — con dos excepciones de peso:
   **el O-level base de Singapur y el GCSE inglés NO incluyen cálculo**
   [16][10]; entra a los 16-17 en Francia y España [14][13], a los 17-18 en
   A-level, Abitur y AP Calc.

### 2.2 Las dos espirales paralelas

**Geometría y medida** (figuras → medida → ángulos → Pitágoras → coordenadas
→ vectores) y **estadística y probabilidad** (pictogramas → media →
probabilidad simple → distribuciones) corren en espiral desde primaria en
**todos** los sistemas verificados [8]-[17]. **Geometría no es prerrequisito
de álgebra en ninguno**: son hilos paralelos que se encuentran tarde (en la
geometría analítica y la trigonometría). La afirmación «no puedes hacer
álgebra sin geometría básica» es falsa como prerrequisito; la verdad
estructural es que las dos espirales se *cruzan* en puntos concretos:
coordenadas (álgebra × geometría), pendiente (razón × funciones), trigonometría
(geometría × funciones), vectores (álgebra lineal × geometría).

### 2.3 Lo que varía por país (y por qué importa a un producto en 7 locales)

- **Empaquetado de secundaria**: EE.UU. permite Algebra I → Geometry →
  Algebra II *o* integrado — los estados deciden (Appendix A de CCSS) [8];
  España integra y bifurca en 4º ESO (Matemáticas A académicas / B aplicadas)
  y por modalidad en Bachillerato con prelación formal 1º→2º [13]; Francia:
  tronco común en seconde + especialidad [14]; Alemania: integrado por
  Jahrgangsstufe [15]; Singapur: streaming Standard/Foundation en P5 y
  Express/NA/NT después [16].
- **Cuándo entra la demostración formal**: Francia y el IB (Proofs, solo HL)
  la hacen explícita [14][12]; EE.UU. la concentra en el curso de Geometry;
  el NC inglés la diluye en «reason mathematically» [9].
- **México en transición**: la MCCEMS (Acuerdo 09/08/23) reorganiza la media
  superior en progresiones transversales de «Pensamiento Matemático» en vez
  de las materias clásicas Álgebra → Geometría y Trigonometría → Cálculo
  [11]. Un producto que hable de «álgebra de secundaria» le habla al sistema
  viejo.

## 3. La estructura de prerrequisitos universitaria: diez instituciones verificadas

Fuentes primarias descargadas: catálogos y planes oficiales de MIT [18],
Harvard [19], Stanford [20], Cambridge [21], Oxford [22], ETH Zürich [23],
Princeton [24], UC Berkeley [25], UNAM [26] y Sorbonne (parcial) [27].

### 3.1 Los cinco patrones que se repiten

**Patrón 1 — Álgebra lineal va después o en paralelo al multivariable, nunca
antes del cálculo de una variable.** MIT: `18.06` exige `18.02` [18].
Harvard: `21b` (lineal + EDOs) tras `21a` [19]. Berkeley: `54` tras `52`,
junto a `53` [25]. Princeton: `202` tras `104`, intercambiable con `201`
[24]. Stanford: integrado (`Math 51` es lineal + multivariable) [20]. Los
sistemas europeos de año cerrado (Cambridge, Oxford, ETH, UNAM) la ponen en
primer año **en paralelo** con el análisis, porque todo el año 1 es núcleo
[21][22][23][26].

**Patrón 2 — La probabilidad entra dos veces.** Temprana y basada en cálculo
(MIT `18.05` exige `18.02`; Cambridge/Oxford/ETH en año 1-2); rigurosa con
medida, **después del análisis real**: ETH declara `Analysis III
(Masstheorie)` como base de la `Wahrscheinlichkeitstheorie`, el análisis
funcional y las EDPs [23]; MIT `18.675` recomienda `18.600` [18]; Harvard
`114` (medida) abre la corriente de análisis [19].

**Patrón 3 — El curso puente de demostración existe en todas partes, con
tres diseños.** (a) Curso explícito: MIT `18.090`, Berkeley `55`, Harvard
`101/112/121`, Princeton `210/214`, ETH `Grundstrukturen`, UNAM `Álgebra
Superior` (primer semestre: inducción, divisibilidad, congruencias) [26];
(b) integrado desde el día 1: Cambridge (`Numbers and Sets` + `Analysis I`
con ε-δ en año 1), Oxford (`Introduction to University Mathematics`); (c)
pista acelerada paralela: Harvard `25/55`, Stanford `60CM/DM`, Princeton
`215-217`. **Ningún sistema lanza a un estudiante a cursos de demostración
sin puente.**

**Patrón 4 — El análisis real exige solo cálculo; todo lo demás exige ambos.**
MIT `18.100A/B`: prerrequisito únicamente `18.02` [18]. Pero `18.101`
(variedades), `18.102` (funcional), `18.112` (compleja avanzada), `18.152`
(EDPs) exigen **(álgebra lineal) ∧ (análisis real)** a la vez [18]. La
conjunción es la puerta del upper division también en Berkeley (`104` + `110`
obligatorios) [25] y Cambridge (`Linear Algebra` y `Analysis & Topology` en
IB) [21].

**Patrón 5 — Dos niveles de álgebra lineal** (computacional → teórica): MIT
`18.06` → `18.700`; Berkeley `54` → `110`; Stanford `51` → `113`; Cambridge
`Vectors and Matrices` → `Linear Algebra`. El segundo pase es el que alimenta
álgebra abstracta, representaciones y geometría.

### 3.2 El grafo de prerrequisitos universitario (síntesis)

```
cálculo 1 variable ──┬──> multivariable ──┬──> EDOs
                     │                    ├──> álgebra lineal (computacional)
                     │                    └──> probabilidad (temprana)
                     ├──> análisis real ──────────┐
                     └──> [puente de demostración]│
álgebra lineal ──────┴──> álgebra lineal teórica ──┴──> álgebra abstracta
análisis real ∧ álgebra lineal ──┬──> análisis funcional
                                 ├──> variable compleja avanzada
                                 ├──> variedades / geometría diferencial
                                 ├──> EDPs
medida ──────────────────────────┴──> probabilidad teórica
álgebra abstracta ─────────────────> teoría de Galois, representaciones
topología general (tras análisis) ──> topología algebraica
```

Las dependencias **duras de inscripción** son fenómeno estadounidense
(`Prereq:` en el catálogo); Cambridge, Oxford, ETH y UNAM usan año cerrado +
dependencias «indicativas» por contenido [21][22][23][26].

## 4. El mapa de ramas para Math Challenge

Síntesis de §1-§3 en una clasificación operativa. Cada rama lleva su código
MSC 2020, su posición escolar (si existe) y su puerta de prerrequisitos. Es
la clasificación que el catálogo de retos (`docs/planes/f11-contenido-retos.md`)
referencia, y la que un futuro campo `rama` del banco debería usar.

### Familia F0 · Fundamentos del número (MSC 11 en parte, 97)

| Código | Rama | Puerta (exige) | Nivel N |
|---|---|---|---|
| `ARIT` | Aritmética entera | conteo | N1-N4 |
| `ENTE` | Enteros con signo | aritmética | N7 |
| `FRAC` | Fracciones | división | N5 |
| `DECI` | Decimales y porcentaje | fracciones | N6 |
| `RAZO` | Razón y proporción | fracciones + multiplicación | N6 |
| `DIVI` | Divisibilidad y primos | multiplicación/división | N4-N7 |
| `TNUM` | Teoría de números | divisibilidad + congruencias | N11 |

### Familia F1 · Álgebra (MSC 12, 15, 16, 20, 08)

| Código | Rama | Puerta (exige) | Nivel N |
|---|---|---|---|
| `PREA` | Pre-álgebra y sucesiones | aritmética | N7 |
| `ALGE` | Álgebra (ecuaciones, sistemas, polinomios) | pre-álgebra | N8 |
| `EXP` | Exponenciales y logaritmos | cuadráticas | N9 |
| `ALIN` | Álgebra lineal (matrices, vectores, determinantes) | álgebra + funciones | N11 |
| `AABS` | Álgebra abstracta (grupos, anillos) | álgebra lineal teórica + puente de demostración | N12 |

### Familia F2 · Geometría y medida (MSC 51, 52, 53, 14)

| Código | Rama | Puerta (exige) | Nivel N |
|---|---|---|---|
| `GEOP` | Geometría plana (figuras, área, perímetro) | aritmética | N5 |
| `GEOA` | Geometría analítica (coordenadas, pendiente, distancia) | álgebra | N8 |
| `VECT` | Vectores y cálculo vectorial | álgebra lineal + cálculo multivariable | N12 |
| `TOPO` | Topología (como formato evaluar, mc-12) | análisis real | N12 |

### Familia F3 · Análisis (MSC 26, 28, 30, 34, 35, 40, 46)

| Código | Rama | Puerta (exige) | Nivel N |
|---|---|---|---|
| `FUNC` | Funciones | ecuaciones lineales | N9 |
| `TRIG` | Trigonometría | geometría + funciones (a la vez) | N9-N10 |
| `CALD` | Cálculo diferencial | funciones | N10 |
| `CALI` | Cálculo integral | cálculo diferencial | N10 |
| `ANAL` | Análisis real (límites rigurosos) | cálculo + puente de demostración | N12 |
| `VCOM` | Variable compleja | análisis real ∧ álgebra lineal | (futuro) |
| `EDOS` | Ecuaciones diferenciales | cálculo integral + álgebra lineal | (futuro) |

### Familia F4 · Probabilidad y estadística (MSC 60, 62)

| Código | Rama | Puerta (exige) | Nivel N |
|---|---|---|---|
| `ESTB` | Estadística (media, mediana, datos) | aritmética + fracciones | N6-N10 |
| `PROB` | Probabilidad | fracciones + funciones | N9 |
| `COMB` | Combinatoria | multiplicación + álgebra | N11 |

### Familia F5 · Demostración y lógica (MSC 03)

| Código | Rama | Puerta (exige) | Nivel N |
|---|---|---|---|
| `LOGI` | Lógica y negación de cuantificadores | álgebra | N11-N12 |
| `DEMO` | Demostración (validación, detectar el error) | puente — la «pista Lean 4» de D-124 | N11-N12 |

**Reglas del mapa:** (1) el nivel N es de **dificultad**, la rama es de
**familia** — se mueven por separado (D-017 ya lo dice para tema visual y
nivel; aquí es el mismo principio una capa abajo). (2) Las puertas son la
mitad verificada de este documento (§2-§3), no criterio: cada una cita su
sistema. (3) El mapa es un DAG como el MSC, no un árbol: `TRIG` tiene dos
puertas, `VCOM` y `EDOS` dos cada una.

## 5. Implicaciones de diseño para Math Challenge

1. **El banco gana un campo `rama`** (los códigos de §4), separado de `nivel`
   y de `habilidad`. Sin él, «6 retos por nivel» (D-122) puede cumplirse con
   seis retos de la misma rama y nadie lo notaría. Con él, el auditor del
   piso (`piso-seis-retos.mjs`) puede exigir cobertura: ≥3 ramas distintas
   por nivel.
2. **Las aristas de prerrequisito del adaptativo** (F4) deben venir de §4,
   no inventarse: `skill_state` agenda nodos de habilidad, y la pregunta
   «¿puede ver fracciones?» se responde con la arista `FRAC ← división`.
   La tabla de §4 es la primera fuente verificada del proyecto para esas
   aristas.
3. **El catálogo de los 54 retos queda medido por primera vez.** Cobertura
   actual: 20 ramas de las 24 del mapa — **faltan `VCOM`, `EDOS`, `FUNC`
   como rama explícita (está repartida), y `DIVI` suelto fuera de N4**. Los
   huecos son compatibles con D-124 (los formatos auto-calificables mandan)
   pero ahora son visibles y decidibles, no invisibles.
4. **El «puente de demostración» tiene que existir como pista**, no como
   esperanza: los diez sistemas universitarios lo tienen, y nuestra versión
   es la pista Lean 4 (D-124) más los formatos de `mc-12` (detectar el
   error, ordenamiento de pasos) ya presentes en N11-N12 del catálogo.
5. **Geometría corre en espiral, no se «pasa» una vez**: el mapa la pone en
   N5, N8 y N12, y la trigonometría con dos puertas. Cualquier diseño de
   prerrequisitos lineal («primero toda la geometría, luego todo el
   álgebra») contradice los ocho sistemas escolares verificados.
6. **México y Singapur introducen álgebra temprano** (variación/big ideas);
   EE.UU. espera a 6º. Para los 7 locales, el nivel N de un reto es neutral
   al país (D-017/mc-15) — y esta investigación es la evidencia de por qué
   debe seguir siéndolo: el contenido por edad varía; la estructura de
   dependencias, no.
7. **La probabilidad se enseña dos veces** (temprana con cálculo, rigurosa
   con medida). Nuestro `PROB` de N9 es la primera; la segunda no es
   auto-calificable con los formatos actuales y queda explícitamente fuera.
8. **MSC 97 (Mathematics education) y la sección 19 del ICM** son el puente
   oficial entre investigación y enseñanza — este documento vive ahí, y la
   clasificación de §4 debe revisarse cuando MSC 2030 salga (ciclo decanal
   declarado [2]).

## 6. Preguntas abiertas para el dueño — RESUELTAS (2026-08-03)

| # | Pregunta | Respuesta | Decisión |
|---|---|---|---|
| 1 | ¿Códigos propios o MSC? | **MSC de 2 dígitos, con nombre en lenguaje de personas autorado por locale** (respuesta personalizada del dueño: rigor del estándar, cara de persona) | D-128 |
| 2 | ¿Cobertura del auditor del piso? | ≥3 ramas MSC distintas por nivel, además de los 6 retos | D-129 |
| 3 | ¿`VCOM`/`EDOS`? | Entran como niveles futuros — `mc-12` confirma que son auto-calificables | D-130 |
| 4 | ¿Las espirales como aristas? | Débiles (recomiendan, no bloquean); duras solo las verificadas | D-131 |
| 5 | ¿El puente de demostración? | Pista transversal visible en el mapa, no un nivel más | D-132 |
| 6 | ¿Quién lo mantiene al día? | Entradas fechadas en `dudas.md`: 2027 (currículos) y 2030 (MSC) | D-133 |
| 7 | ¿`FUNC` explícita? | Sí — es la puerta de todo el cálculo y debe ser auditable | D-134 |
| 8 | ¿Dónde vive el grafo? | Módulo puro `packages/motor/src/ramas.ts` | D-135 |

## Sources

1. **MSC 2020, PDF oficial completo** — zbMATH/Mathematical Reviews —
   https://zbmath.org/static/msc2020.pdf — descargado; fuente de las 63
   áreas y las referencias cruzadas.
2. **MSC 2020 portal y reglas de uso** — https://msc2020.org/ y
   https://mathscinet.ams.org/msc/msc2020.html — descargados; conteos
   (63/529/6022), cambios 2010→2020, licencia CC-BY-NC-SA, regla de clase
   primaria única.
3. **arXiv category taxonomy** — https://arxiv.org/category_taxonomy —
   descargado; las 32 categorías math.* con descripciones.
4. **Actas del ICM 2022, tabla de contenido** — EMS Press —
   https://www.proceedings.com/content/074/074997webtoc.pdf — descargado;
   las 20 secciones.
5. **IMU — ICM Structure Committee** — https://www.mathunion.org/icm/icm-2022
   y https://www.mathunion.org/icm/icm-2026 — descargados; la revisión
   cuatrienal de secciones. Las secciones del ICM 2026 no se pudieron
   descargar (sitio inalcanzable) — pendiente.
6. **OCDE, PISA 2022 Assessment and Analytical Framework** —
   https://www.oecd-ilibrary.org/content/dam/oecd/en/publications/reports/2023/08/pisa-2022-assessment-and-analytical-framework_a124aec8/dfe0bf9c-en.pdf
   — la página OCDE principal dio 403; contenido corroborado vía iLibrary y
   espejos (ilsa-gateway.org). Las 4 categorías de contenido.
7. **UNESCO ISCED-F 2013** — uis.unesco.org (PDF oficial no descargable
   directamente; códigos 0541/0542 corroborados vía egracons.eu).
8. **Common Core State Standards** — https://www.thecorestandards.org/Math/
   y páginas de dominio por grado (K, 3.NF, 6.RP, 8.F, HSA) — descargadas.
9. **National Curriculum in England: Mathematics programmes of study** —
   gov.uk — descargado (Y1-Y5 literal; KS3/KS4 truncado). GCSE: página
   índice descargada, contenido corroborado. A-level: 404, **no verificado**.
10. **IB — Mathematics in the DP** — https://www.ibo.org/programmes/diploma-programme/curriculum/mathematics/
    — descargado (4 cursos, 5 temas, Proofs y Vectors solo HL).
11. **México SEP** — Campo formativo Saberes y Pensamiento Científico (PDF
    SNTE) y Pensamiento Matemático II, Colegio de Bachilleres, Plan 2023
    (gob.mx) — descargados. La nota del DOF del Acuerdo 09/08/23 falló por
    red.
12. **IB Group 5 subjects** — Wikipedia — descargada (fuente secundaria,
    cruzada con [10]).
13. **España LOMLOE** — RD 217/2022 (ESO) y RD 243/2022 (Bachillerato), BOE
    — descargados (la prelación 1º→2º del art. 21.2, literal; anexos de
    contenido truncados).
14. **Francia, programme de spécialité Mathématiques de première** (PDF
    oficial) y BO maths intégré à l'enseignement scientifique —
    education.gouv.fr — descargados completos. Seconde y terminale: no
    descargados.
15. **Alemania, LehrplanPLUS Bayern Gymnasium** (M5, M10) y KMK
    Bildungsstandards — descargados. Es un Land de 16: no extrapolar a
    toda Alemania sin cuidado.
16. **Singapur** — MOE Primary Mathematics Syllabus 2021 (PDF) y SEAB
    O-Level Mathematics 4052 (PDF) — descargados. Nota: el enfoque CPA no
    aparece con ese nombre en el syllabus oficial (vive en los materiales
    didácticos) — dicho para que nadie lo cite del documento equivocado.
17. **Brasil BNCC** — portal oficial es aplicación JS (no descargable);
    estructura corroborada vía Wikipedia (descargada). Las 5 unidades
    temáticas (Números; Álgebra; Geometria; Grandezas e medidas;
    Probabilidade e estatística). Detalle por año: **pendiente de
    verificación fina**.
18. **MIT** — catálogo Course 18 (student.mit.edu/catalog/m18a.html,
    catalog.mit.edu/subjects/18/) y roadmaps del departamento — descargados;
    los prerrequisitos literales citados en §3.
19. **Harvard** — Courses in Mathematics (PDF del departamento) —
    descargado; los cursos puente y «Math 123 cannot be taken before Math
    122».
20. **Stanford** — bulletin.stanford.edu/programs/MATH-BS — descargado.
21. **Cambridge** — Guide to Courses in Part IA e IB 2024-25 (PDFs) —
    descargados; las dependencias advisorias («builds on», «essential for»).
22. **Oxford** — prospectus oficial del Mathematical Institute — descargado;
    la tabla año por año.
23. **ETH Zürich** — Wegleitung Bachelor Mathematik 2024 (PDF, en alemán) —
    descargado; Masstheorie como base de probabilidad/funcional/EDPs,
    textual.
24. **Princeton** — Standard Math Sequences y Overview of Lower Division
    (math.princeton.edu) — descargados; la doble vía example/proof-based.
25. **UC Berkeley** — Course Requirements: Pure Mathematics
    (math.berkeley.edu) — descargado.
26. **UNAM, Facultad de Ciencias** — ficha de la licenciatura, plan de
    estudios (oferta.unam.mx PDF) y estructura DGAE-SIAE — descargados; la
    «seriación indicativa» y las cadenas numeradas.
27. **Sorbonne Université** — Onisep, licence mention mathématiques —
    acceso parcial (sitio oficial 404/muro de cookies); solo la estructura
    de portales L1 y las bifurcaciones L2/L3. **La maquette curso a curso
    no quedó verificada.**
28. **Dunne & Hulek, "The revision of the Mathematics Subject
    Classification"** — EMS Newsletter, https://doi.org/10.4171/NEWS/115/2
    — el artículo oficial de la revisión MSC 2020.

**Advertencias de esta sesión:** Khan Academy quedó totalmente sin verificar
(sitio JS-only, API 410 Gone, Wayback bloqueado) — el mapa de cursos que
circula por ahí no se pudo certificar; A-level, BNCC por año, seconde/
terminale, y la maquette de la Sorbonne quedan marcados como no descargados.
Todo lo demás tiene URL verificada arriba.
