# Classificação dos ramos da matemática e a sua estrutura de pré-requisitos — de MSC 2020 aos planos universitários e aos currículos escolares do mundo

> Math Challenge research — 2026-08-03 — topic 51

## Resumo executivo (ES)

- Existem três classificações vivas dos ramos da matemática, e são
  diferentes de propósito: **MSC 2020** (63 áreas de dois dígitos, a citável
  por defeito — licença aberta, manutenção dual AMS/zbMATH, revisão decenal)
  [1][2], **arXiv math** (32 categorias, a que reflete a prática atual de
  investigação) [3], e as **secções do ICM** (20 em 2022, revistas a cada
  quatro anos pelo Structure Committee) [4][5]. Para o escolar não existe
  taxonomia de ramos: o que há é PISA (4 categorias de conteúdo de
  avaliação) e ISCED-F da UNESCO (0541 Mathematics / 0542 Statistics) [6][7].
- A **estrutura de pré-requisitos escolar é universal**: contagem →
  soma/subtração → multiplicação/divisão → frações (exige divisão) →
  decimais → percentagem (exige frações/100) → razão e proporção (exige
  multiplicação e frações) → inteiros e pré-álgebra → equações lineares →
  funções → quadráticas → exponenciais → trigonometria (exige
  **simultaneamente** geometria e funções) → cálculo (exige funções).
  Verificado contra Common Core, o National Curriculum inglês, IB, México
  SEP, Espanha LOMLOE, França lycée, Baviera Gymnasium e Singapura MOE
  [8]-[17].
- **O que muda por país não é a ordem mas o empacotamento**: os EUA permitem
  Algebra I → Geometry → Algebra II ou integrado; Espanha bifurca no 4.º
  ESO (A/B); França especializa em première; Singapura faz streaming
  (Standard/Foundation); o O-level base de Singapura e o GCSE **não incluem
  cálculo**.
- Na universidade, a cadeia dominante verificada em 10 instituições (MIT,
  Harvard, Stanford, Cambridge, Oxford, ETH, Princeton, Berkeley, UNAM,
  Sorbonne) [18]-[27]: **a álgebra linear vem depois ou em paralelo ao
  cálculo multivariável, nunca antes do cálculo de uma variável**; a
  probabilidade entra duas vezes (cedo com cálculo, rigorosa após a teoria
  da medida); o **curso ponte de demonstração** existe em toda a parte com
  três desenhos (curso explícito, integrado desde o dia 1, pista acelerada);
  a análise real exige só cálculo, mas tudo o que segue (análise funcional,
  variedades, EDPs) exige **análise real ∧ álgebra linear** ao mesmo tempo.
- Consequência para o Math Challenge: a escada N1-N12 deve levar **códigos
  de ramo** e **arestas de pré-requisito** separadas do nível de
  dificuldade. O nível diz quão difícil é; o ramo diz de que família é; a
  aresta diz o que deve saber antes. Sem as três coisas, «6 desafios por
  nível» (D-122) não pode garantir cobertura por ramo — que é exatamente o
  que este documento habilita medir.
- Advertência de design: o exemplo ingénuo «álgebra exige geometria básica»
  **é falso em todos os sistemas verificados** — a geometria corre em
  espiral paralela, não como pré-requisito de álgebra. As dependências duras
  reais são: frações exige divisão; percentagem exige frações; razão exige
  frações; trigonometria exige geometria + funções; cálculo exige funções;
  análise real exige cálculo; análise funcional/EDPs/probabilidade teórica
  exigem análise real + álgebra linear (+ medida).

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

## 1. As três classificações vivas, e por que não se pode escolher uma só

### 1.1 MSC 2020 — a espinha dorsal citável

A Mathematics Subject Classification, revisão 2020, publicada conjuntamente
por Mathematical Reviews (AMS) e zbMATH sob licença CC-BY-NC-SA [1][2]:
**63 áreas de dois dígitos, 529 de três, 6.022 de cinco** [2]. Cada item
classificado leva exatamente uma classe primária e zero ou mais secundárias
[2].

As 63 áreas de dois dígitos, do PDF oficial descarregado [1]:

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

Mudanças 2010 → 2020: nenhuma a dois dígitos («não se criaram novos
campos»); nove classes novas de três dígitos (18M, 18N, 53E, 57K, 57Z, 60L,
62R, 68V, 82M); 113 classes de cinco retiradas e 486 novas; hífenes
uniformizados (`-08` métodos computacionais, `-10` modelação, `-11` dados
de investigação) [2]. O artigo oficial da revisão é Dunne & Hulek, EMS
Newsletter [28].

**Nota estrutural relevante para nós:** o MSC não é uma árvore, é um DAG —
as classes trazem referências cruzadas explícitas (`{For differential
topology, see 57Rxx}`) [1]. Uma classificação de ramos que não admita
ligações cruzadas está mal desenhada desde o primeiro dia.

### 1.2 arXiv math — a prática atual

32 categorias `math.*` com descrições oficiais [3]: AC (comutativa), AG
(algébrica), AP (EDPs), AT (topologia algébrica), CA (análise clássica e
EDOs), CO (combinatória), CT (categorias), CV (variável complexa), DG
(diferencial), DS (dinâmicos), FA (funcional), GM, GN (topologia geral), GR
(grupos), GT (geométrica), HO, IT, KT, LO (lógica), MG (métrica), MP (física
matemática), NA (numérica), NT (números), OA (operadores), OC (otimização e
controlo), PR (probabilidade), QA (quântica), RA (anéis), RT
(representação), SG (simplética), SP (espectral), ST (estatística). Reflete
fronteiras vivas que o MSC reparte (K-theory, simplética, quântica têm
categoria própria), mas não tem processo formal de revisão publicado.

### 1.3 Secções do ICM — a visão comunitária quadrienal

As 20 secções do ICM 2022, das atas oficiais EMS Press [4]: Logic;
Algebra; Number Theory; Algebraic and Complex Geometry; Geometry; Topology;
Lie Theory; Analysis; Dynamics; PDEs; Mathematical Physics; Probability;
Combinatorics; Mathematics of Computer Science; Numerical Analysis and
Scientific Computing; Control Theory and Optimization; Statistics and Data
Analysis; Stochastic and Differential Modelling; Mathematical Education;
History. **Não são fixas**: o Structure Committee da IMU revê-as a cada
quatro anos (primeiro presidente: Terence Tao; desde agosto de 2025: Martin
Hairer) [5].

### 1.4 O escolar: não há taxonomia de ramos, e há que dizê-lo

- **PISA 2022** classifica o conteúdo de *avaliação* em quatro categorias:
  quantity; uncertainty and data; change and relationships; space and shape
  (~¼ de itens cada uma) — não são ramos, são lentes de medição [6].
- **ISCED-F 2013 (UNESCO)** classifica programas educativos: campo `054` →
  **0541 Mathematics** / **0542 Statistics** [7].
- Os currículos nacionais (§3) organizam por domínios ou fios temáticos, não
  por ramos de investigação. Qualquer catálogo que pretenda mapear «ramos»
  a idades escolares está a construir algo novo — como este.

## 2. A estrutura de pré-requisitos escolar: a espinha universal

Verificada contra oito sistemas [8]-[17]. A ordem é a mesma em todos; só
varia o empacotamento e o ano.

### 2.1 Os nove elos, com a sua dependência dura

1. **Contagem e cardinalidade → soma e subtração.** Universal (CCSS K-1, NC
   Y1, Singapura P1, México fase 3, Baviera primária).
2. **Multiplicação e divisão** com o sistema posicional em paralelo. A
   divisão é o pré-requisito mais citado de toda a escolaridade: abre
   frações, razão, percentagem e média.
3. **Frações** (CCSS 3.NF, NC Y3-Y5, Singapura P2-P5, BNCC Números).
   **Exige divisão consolidada.** Os três sistemas mais detalhados tratam
   frações/decimais/percentagens como «formas do mesmo número» (literal no
   NC Y4-Y5).
4. **Decimais → percentagem.** **A percentagem exige frações com
   denominador 100** — é uma razão por cento (CCSS 6.RP.3c, NC Y5).
5. **Razão e proporcionalidade** — a ponte para o secundário (CCSS 6.RP, NC
   Y6, México «variación», a big idea «Proportionality» de Singapura, o
   «taux d'évolution» francês). **Exige multiplicação, divisão e frações ao
   mesmo tempo** — é a primeira dependência múltipla real.
6. **Inteiros com sinal e pré-álgebra → equações lineares → funções
   lineares** (CCSS 7.NS → 8.EE → 8.F; Baviera M5 ℤ → M8; França seconde).
7. **Quadráticas e polinómios → exponenciais e logaritmos** (França 1ʳᵉ:
   second degré → exponentielle definida como única f com f′ = f [14];
   Baviera M9 → M10; CCSS HS Algebra).
8. **Trigonometria.** **Exige simultaneamente geometria (semelhança,
   Pitágoras) e funções** — por isso chega tarde em todos os sistemas
   (GCSE Higher, França 1ʳᵉ com círculo trigonométrico, Baviera M9-M10,
   O-level Singapura, CCSS HS Geometry/Algebra II).
9. **Cálculo** (derivada → integral). **Exige funções e limites
   intuitivos.** É o conteúdo de fecho — com duas exceções de peso:
   **o O-level base de Singapura e o GCSE inglês NÃO incluem cálculo**
   [16][10]; entra aos 16-17 em França e Espanha [14][13], aos 17-18 em
   A-level, Abitur e AP Calc.

### 2.2 As duas espirais paralelas

**Geometria e medida** (figuras → medida → ângulos → Pitágoras →
coordenadas → vetores) e **estatística e probabilidade** (pictogramas →
média → probabilidade simples → distribuições) correm em espiral desde o
primário em **todos** os sistemas verificados [8]-[17]. **A geometria não é
pré-requisito de álgebra em nenhum**: são fios paralelos que se encontram
tarde (na geometria analítica e na trigonometria). A afirmação «não podes
fazer álgebra sem geometria básica» é falsa como pré-requisito; a verdade
estrutural é que as duas espirais se *cruzam* em pontos concretos:
coordenadas (álgebra × geometria), declive (razão × funções), trigonometria
(geometria × funções), vetores (álgebra linear × geometria).

### 2.3 O que varia por país (e por que importa a um produto em 7 locales)

- **Empacotamento do secundário**: os EUA permitem Algebra I → Geometry →
  Algebra II *ou* integrado — os estados decidem (Appendix A de CCSS) [8];
  Espanha integra e bifurca no 4.º ESO (Matemáticas A académicas / B
  aplicadas) e por modalidade no Bachillerato com prelação formal 1.º→2.º
  [13]; França: tronco comum em seconde + especialidade [14]; Alemanha:
  integrado por Jahrgangsstufe [15]; Singapura: streaming
  Standard/Foundation em P5 e Express/NA/NT depois [16].
- **Quando entra a demonstração formal**: França e o IB (Proofs, só HL)
  tornam-na explícita [14][12]; os EUA concentram-na no curso de Geometry;
  o NC inglês dilui-a em «reason mathematically» [9].
- **México em transição**: a MCCEMS (Acuerdo 09/08/23) reorganiza o ensino
  médio superior em progressões transversais de «Pensamiento Matemático» em
  vez das matérias clássicas Álgebra → Geometría y Trigonometría → Cálculo
  [11]. Um produto que fale de «álgebra do secundário» fala com o sistema
  velho.

## 3. A estrutura de pré-requisitos universitária: dez instituições verificadas

Fontes primárias descarregadas: catálogos e planos oficiais de MIT [18],
Harvard [19], Stanford [20], Cambridge [21], Oxford [22], ETH Zürich [23],
Princeton [24], UC Berkeley [25], UNAM [26] e Sorbonne (parcial) [27].

### 3.1 Os cinco padrões que se repetem

**Padrão 1 — A álgebra linear vem depois ou em paralelo ao multivariável,
nunca antes do cálculo de uma variável.** MIT: `18.06` exige `18.02` [18].
Harvard: `21b` (linear + EDOs) após `21a` [19]. Berkeley: `54` após `52`,
junto a `53` [25]. Princeton: `202` após `104`, intermutável com `201`
[24]. Stanford: integrado (`Math 51` é linear + multivariável) [20]. Os
sistemas europeus de ano fechado (Cambridge, Oxford, ETH, UNAM) põem-na no
primeiro ano **em paralelo** com a análise, porque todo o ano 1 é núcleo
[21][22][23][26].

**Padrão 2 — A probabilidade entra duas vezes.** Cedo e baseada em cálculo
(MIT `18.05` exige `18.02`; Cambridge/Oxford/ETH no ano 1-2); rigorosa com
medida, **depois da análise real**: a ETH declara `Analysis III
(Masstheorie)` como base da `Wahrscheinlichkeitstheorie`, da análise
funcional e das EDPs [23]; MIT `18.675` recomenda `18.600` [18]; Harvard
`114` (medida) abre a corrente de análise [19].

**Padrão 3 — O curso ponte de demonstração existe em toda a parte, com três
desenhos.** (a) Curso explícito: MIT `18.090`, Berkeley `55`, Harvard
`101/112/121`, Princeton `210/214`, ETH `Grundstrukturen`, UNAM `Álgebra
Superior` (primeiro semestre: indução, divisibilidade, congruências) [26];
(b) integrado desde o dia 1: Cambridge (`Numbers and Sets` + `Analysis I`
com ε-δ no ano 1), Oxford (`Introduction to University Mathematics`); (c)
pista acelerada paralela: Harvard `25/55`, Stanford `60CM/DM`, Princeton
`215-217`. **Nenhum sistema lança um estudante para cursos de demonstração
sem ponte.**

**Padrão 4 — A análise real exige só cálculo; tudo o resto exige ambos.**
MIT `18.100A/B`: pré-requisito unicamente `18.02` [18]. Mas `18.101`
(variedades), `18.102` (funcional), `18.112` (complexa avançada), `18.152`
(EDPs) exigem **(álgebra linear) ∧ (análise real)** ao mesmo tempo [18]. A
conjunção é a porta do upper division também em Berkeley (`104` + `110`
obrigatórios) [25] e Cambridge (`Linear Algebra` e `Analysis & Topology`
em IB) [21].

**Padrão 5 — Dois níveis de álgebra linear** (computacional → teórica): MIT
`18.06` → `18.700`; Berkeley `54` → `110`; Stanford `51` → `113`; Cambridge
`Vectors and Matrices` → `Linear Algebra`. O segundo passe é o que alimenta
álgebra abstrata, representações e geometria.

### 3.2 O grafo de pré-requisitos universitário (síntese)

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

As dependências **duras de inscrição** são fenómeno estadunidense
(`Prereq:` no catálogo); Cambridge, Oxford, ETH e UNAM usam ano fechado +
dependências «indicativas» por conteúdo [21][22][23][26].

## 4. O mapa de ramos para o Math Challenge

Síntese de §1-§3 numa classificação operativa. Cada ramo leva o seu código
MSC 2020, a sua posição escolar (se existir) e a sua porta de
pré-requisitos. É a classificação que o catálogo de desafios
(`docs/planes/f11-contenido-retos.md`) referencia, e a que um futuro campo
`rama` do banco deveria usar.

### Família F0 · Fundamentos do número (MSC 11 em parte, 97)

| Código | Ramo | Porta (exige) | Nível N |
|---|---|---|---|
| `ARIT` | Aritmética inteira | contagem | N1-N4 |
| `ENTE` | Inteiros com sinal | aritmética | N7 |
| `FRAC` | Frações | divisão | N5 |
| `DECI` | Decimais e percentagem | frações | N6 |
| `RAZO` | Razão e proporção | frações + multiplicação | N6 |
| `DIVI` | Divisibilidade e primos | multiplicação/divisão | N4-N7 |
| `TNUM` | Teoria dos números | divisibilidade + congruências | N11 |

### Família F1 · Álgebra (MSC 12, 15, 16, 20, 08)

| Código | Ramo | Porta (exige) | Nível N |
|---|---|---|---|
| `PREA` | Pré-álgebra e sucessões | aritmética | N7 |
| `ALGE` | Álgebra (equações, sistemas, polinómios) | pré-álgebra | N8 |
| `EXP` | Exponenciais e logaritmos | quadráticas | N9 |
| `ALIN` | Álgebra linear (matrizes, vetores, determinantes) | álgebra + funções | N11 |
| `AABS` | Álgebra abstrata (grupos, anéis) | álgebra linear teórica + ponte de demonstração | N12 |

### Família F2 · Geometria e medida (MSC 51, 52, 53, 14)

| Código | Ramo | Porta (exige) | Nível N |
|---|---|---|---|
| `GEOP` | Geometria plana (figuras, área, perímetro) | aritmética | N5 |
| `GEOA` | Geometria analítica (coordenadas, declive, distância) | álgebra | N8 |
| `VECT` | Vetores e cálculo vetorial | álgebra linear + cálculo multivariável | N12 |
| `TOPO` | Topologia (como formato avaliar, mc-12) | análise real | N12 |

### Família F3 · Análise (MSC 26, 28, 30, 34, 35, 40, 46)

| Código | Ramo | Porta (exige) | Nível N |
|---|---|---|---|
| `FUNC` | Funções | equações lineares | N9 |
| `TRIG` | Trigonometria | geometria + funções (ao mesmo tempo) | N9-N10 |
| `CALD` | Cálculo diferencial | funções | N10 |
| `CALI` | Cálculo integral | cálculo diferencial | N10 |
| `ANAL` | Análise real (limites rigorosos) | cálculo + ponte de demonstração | N12 |
| `VCOM` | Variável complexa | análise real ∧ álgebra linear | (futuro) |
| `EDOS` | Equações diferenciais | cálculo integral + álgebra linear | (futuro) |

### Família F4 · Probabilidade e estatística (MSC 60, 62)

| Código | Ramo | Porta (exige) | Nível N |
|---|---|---|---|
| `ESTB` | Estatística (média, mediana, dados) | aritmética + frações | N6-N10 |
| `PROB` | Probabilidade | frações + funções | N9 |
| `COMB` | Combinatória | multiplicação + álgebra | N11 |

### Família F5 · Demonstração e lógica (MSC 03)

| Código | Ramo | Porta (exige) | Nível N |
|---|---|---|---|
| `LOGI` | Lógica e negação de quantificadores | álgebra | N11-N12 |
| `DEMO` | Demonstração (validação, detetar o erro) | ponte — a «pista Lean 4» de D-124 | N11-N12 |

**Regras do mapa:** (1) o nível N é de **dificuldade**, o ramo é de
**família** — movem-se por separado (D-017 já o diz para tema visual e
nível; aqui é o mesmo princípio uma camada abaixo). (2) As portas são a
metade verificada deste documento (§2-§3), não critério: cada uma cita o
seu sistema. (3) O mapa é um DAG como o MSC, não uma árvore: `TRIG` tem
duas portas, `VCOM` e `EDOS` duas cada uma.

## 5. Implicações de design para o Math Challenge

1. **O banco ganha um campo `rama`** (os códigos de §4), separado de
   `nivel` e de `habilidad`. Sem ele, «6 desafios por nível» (D-122) pode
   cumprir-se com seis desafios do mesmo ramo e ninguém daria por isso. Com
   ele, o auditor do piso (`piso-seis-retos.mjs`) pode exigir cobertura:
   ≥3 ramos distintos por nível.
2. **As arestas de pré-requisito do adaptativo** (F4) devem vir de §4, não
   inventar-se: `skill_state` agenda nós de habilidade, e a pergunta «pode
   ver frações?» responde-se com a aresta `FRAC ← división`. A tabela de §4
   é a primeira fonte verificada do projeto para essas arestas.
3. **O catálogo dos 54 desafios fica medido pela primeira vez.** Cobertura
   atual: 20 ramos dos 24 do mapa — **faltam `VCOM`, `EDOS`, `FUNC` como
   ramo explícito (está repartido), e `DIVI` solto fora de N4**. Os buracos
   são compatíveis com D-124 (os formatos auto-qualificáveis mandam) mas
   agora são visíveis e decidíveis, não invisíveis.
4. **A «ponte de demonstração» tem que existir como pista**, não como
   esperança: os dez sistemas universitários têm-na, e a nossa versão é a
   pista Lean 4 (D-124) mais os formatos de `mc-12` (detetar o erro,
   ordenação de passos) já presentes em N11-N12 do catálogo.
5. **A geometria corre em espiral, não se «passa» uma vez**: o mapa põe-na
   em N5, N8 e N12, e a trigonometria com duas portas. Qualquer desenho de
   pré-requisitos linear («primeiro toda a geometria, depois toda a
   álgebra») contradiz os oito sistemas escolares verificados.
6. **México e Singapura introduzem álgebra cedo** (variación/big ideas); os
   EUA esperam pelo 6.º. Para os 7 locales, o nível N de um desafio é
   neutro ao país (D-017/mc-15) — e esta investigação é a evidência de por
   que deve continuar a sê-lo: o conteúdo por idade varia; a estrutura de
   dependências, não.
7. **A probabilidade ensina-se duas vezes** (cedo com cálculo, rigorosa com
   medida). O nosso `PROB` de N9 é a primeira; a segunda não é
   auto-qualificável com os formatos atuais e fica explicitamente fora.
8. **MSC 97 (Mathematics education) e a secção 19 do ICM** são a ponte
   oficial entre investigação e ensino — este documento vive aí, e a
   classificação de §4 deve ser revista quando MSC 2030 sair (ciclo decenal
   declarado [2]).

## 6. Questões abertas para o proprietário — RESOLVIDAS (2026-08-03)

| # | Pergunta | Resposta | Decisão |
|---|---|---|---|
| 1 | Códigos próprios ou MSC? | **MSC de 2 dígitos, com nome em linguagem de pessoas autorado por locale** (resposta personalizada do proprietário: rigor do padrão, cara de pessoa) | D-128 |
| 2 | Cobertura do auditor do piso? | ≥3 ramos MSC distintos por nível, além dos 6 desafios | D-129 |
| 3 | `VCOM`/`EDOS`? | Entram como níveis futuros — `mc-12` confirma que são auto-qualificáveis | D-130 |
| 4 | As espirais como arestas? | Fracas (recomendam, não bloqueiam); duras só as verificadas | D-131 |
| 5 | A ponte de demonstração? | Pista transversal visível no mapa, não mais um nível | D-132 |
| 6 | Quem o mantém atualizado? | Entradas datadas em `dudas.md`: 2027 (currículos) e 2030 (MSC) | D-133 |
| 7 | `FUNC` explícita? | Sim — é a porta de todo o cálculo e deve ser auditável | D-134 |
| 8 | Onde vive o grafo? | Módulo puro `packages/motor/src/ramas.ts` | D-135 |

## Fontes

1. **MSC 2020, PDF oficial completo** — zbMATH/Mathematical Reviews —
   https://zbmath.org/static/msc2020.pdf — descarregado; fonte das 63
   áreas e das referências cruzadas.
2. **Portal MSC 2020 e regras de uso** — https://msc2020.org/ e
   https://mathscinet.ams.org/msc/msc2020.html — descarregados; contagens
   (63/529/6022), mudanças 2010→2020, licença CC-BY-NC-SA, regra de classe
   primária única.
3. **arXiv category taxonomy** — https://arxiv.org/category_taxonomy —
   descarregado; as 32 categorias math.* com descrições.
4. **Atas do ICM 2022, índice** — EMS Press —
   https://www.proceedings.com/content/074/074997webtoc.pdf — descarregado;
   as 20 secções.
5. **IMU — ICM Structure Committee** — https://www.mathunion.org/icm/icm-2022
   e https://www.mathunion.org/icm/icm-2026 — descarregados; a revisão
   quadrienal de secções. As secções do ICM 2026 não se puderam descarregar
   (site inalcançável) — pendente.
6. **OCDE, PISA 2022 Assessment and Analytical Framework** —
   https://www.oecd-ilibrary.org/content/dam/oecd/en/publications/reports/2023/08/pisa-2022-assessment-and-analytical-framework_a124aec8/dfe0bf9c-en.pdf
   — a página principal da OCDE deu 403; conteúdo corroborado via iLibrary
   e espelhos (ilsa-gateway.org). As 4 categorias de conteúdo.
7. **UNESCO ISCED-F 2013** — uis.unesco.org (PDF oficial não descarregável
   diretamente; códigos 0541/0542 corroborados via egracons.eu).
8. **Common Core State Standards** — https://www.thecorestandards.org/Math/
   e páginas de domínio por grau (K, 3.NF, 6.RP, 8.F, HSA) — descarregadas.
9. **National Curriculum in England: Mathematics programmes of study** —
   gov.uk — descarregado (Y1-Y5 literal; KS3/KS4 truncado). GCSE: página
   índice descarregada, conteúdo corroborado. A-level: 404, **não
   verificado**.
10. **IB — Mathematics in the DP** — https://www.ibo.org/programmes/diploma-programme/curriculum/mathematics/
    — descarregado (4 cursos, 5 temas, Proofs e Vectors só HL).
11. **México SEP** — Campo formativo Saberes y Pensamiento Científico (PDF
    SNTE) e Pensamiento Matemático II, Colegio de Bachilleres, Plan 2023
    (gob.mx) — descarregados. A nota do DOF do Acuerdo 09/08/23 falhou por
    rede.
12. **IB Group 5 subjects** — Wikipédia — descarregada (fonte secundária,
    cruzada com [10]).
13. **Espanha LOMLOE** — RD 217/2022 (ESO) e RD 243/2022 (Bachillerato),
    BOE — descarregados (a prelação 1.º→2.º do art. 21,2, literal; anexos
    de conteúdo truncados).
14. **França, programme de spécialité Mathématiques de première** (PDF
    oficial) e BO maths intégré à l'enseignement scientifique —
    education.gouv.fr — descarregados completos. Seconde e terminale: não
    descarregados.
15. **Alemanha, LehrplanPLUS Bayern Gymnasium** (M5, M10) e KMK
    Bildungsstandards — descarregados. É um Land de 16: não extrapolar
    para toda a Alemanha sem cuidado.
16. **Singapura** — MOE Primary Mathematics Syllabus 2021 (PDF) e SEAB
    O-Level Mathematics 4052 (PDF) — descarregados. Nota: a abordagem CPA
    não aparece com esse nome no syllabus oficial (vive nos materiais
    didáticos) — dito para que ninguém a cite do documento errado.
17. **Brasil BNCC** — portal oficial é aplicação JS (não descarregável);
    estrutura corroborada via Wikipédia (descarregada). As 5 unidades
    temáticas (Números; Álgebra; Geometria; Grandezas e medidas;
    Probabilidade e estatística). Detalhe por ano: **pendente de
    verificação fina**.
18. **MIT** — catálogo Course 18 (student.mit.edu/catalog/m18a.html,
    catalog.mit.edu/subjects/18/) e roadmaps do departamento —
    descarregados; os pré-requisitos literais citados em §3.
19. **Harvard** — Courses in Mathematics (PDF do departamento) —
    descarregado; os cursos ponte e «Math 123 cannot be taken before Math
    122».
20. **Stanford** — bulletin.stanford.edu/programs/MATH-BS — descarregado.
21. **Cambridge** — Guide to Courses in Part IA e IB 2024-25 (PDFs) —
    descarregados; as dependências indicativas («builds on», «essential
    for»).
22. **Oxford** — prospectus oficial do Mathematical Institute —
    descarregado; a tabela ano a ano.
23. **ETH Zürich** — Wegleitung Bachelor Mathematik 2024 (PDF, em alemão) —
    descarregado; Masstheorie como base de probabilidade/funcional/EDPs,
    textual.
24. **Princeton** — Standard Math Sequences e Overview of Lower Division
    (math.princeton.edu) — descarregados; a dupla via example/proof-based.
25. **UC Berkeley** — Course Requirements: Pure Mathematics
    (math.berkeley.edu) — descarregado.
26. **UNAM, Facultad de Ciencias** — ficha da licenciatura, plano de
    estudos (oferta.unam.mx PDF) e estrutura DGAE-SIAE — descarregados; a
    «seriación indicativa» e as cadeias numeradas.
27. **Sorbonne Université** — Onisep, licence mention mathématiques —
    acesso parcial (site oficial 404/muro de cookies); só a estrutura de
    portais L1 e as bifurcações L2/L3. **A maquette curso a curso não ficou
    verificada.**
28. **Dunne & Hulek, "The revision of the Mathematics Subject
    Classification"** — EMS Newsletter, https://doi.org/10.4171/NEWS/115/2
    — o artigo oficial da revisão MSC 2020.

**Advertências desta sessão:** Khan Academy ficou totalmente sem verificar
(site JS-only, API 410 Gone, Wayback bloqueado) — o mapa de cursos que
circula por aí não se pôde certificar; A-level, BNCC por ano, seconde/
terminale, e a maquette da Sorbonne ficam marcados como não descarregados.
Todo o resto tem URL verificada acima.
