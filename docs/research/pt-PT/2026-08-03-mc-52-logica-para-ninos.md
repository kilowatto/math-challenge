# Lógica para crianças: booleana, tabelas de verdade e enigmas — como se ensina no mundo e como se converte em desafios dos 7 anos em diante

> Math Challenge research — 2026-08-03 — topic 52

## Resumo executivo (ES)

- O pedido do proprietário: que as crianças vejam lógica booleana e tabelas
  de verdade desde depois do infantário, em todos os níveis, «porque é a
  base da programação e têm de a conhecer». A investigação diz: **a ideia é
  defensável, e a forma é tudo**.
- **Bebras** é o maior sistema do mundo a ensinar exatamente isto: desafio
  anual de pensamento computacional em 50+ países, com bandas por idade
  (8-10, 10-12, 12-14, 14-16, 16+), tarefas de 1-4 minutos em três
  formatos (interativa, aberta, escolha múltipla) e validação como
  instrumento de medição de pensamento computacional [1][2][3]. Os seus
  cartões «Unplugged» têm sets separados por idade **desde os 3 anos**
  (3-4, 5-6, 7-8, 9-10) [3].
- **A estratégia «unplugged» (sem ecrã) é a mais usada do mundo para
  pensamento computacional em crianças** (Caeli & Yadav 2020) — e a revisão
  honesta é que **não há evidência clara de que estratégia é a melhor**
  (Hsu et al. 2018). Há que dizê-lo assim e não vender o ramo como provado
  [4].
- **Os enigmas de «cavaleiros e mentirosos» de Raymond Smullyan são a ponte
  documentada entre a lógica elementar e a demonstração**: a MAA recomenda
  usá-los para essa transição — desenvolvem a intuição da prova por
  contradição, e «quase todos os estudantes parecem gostar deles» [5]. Os
  Math Circles usam-nos com peças físicas [6].
- **A progressão formal de referência** (Mathematics Manifesto): lógica
  booleana com enigmas e tabelas de verdade aos **11-14**; lógica formal
  com quantificadores aos **14-18** [7]. Isso sugere que a tabela de
  verdade **formal** não é conteúdo de 7 anos; o raciocínio E/OU/NÃO
  encarnado, sim.
- **Conclusão de design**: o ramo LOGI pode existir em **todos os níveis
  desde N4** — mas escalando a forma: atributos e regras compostas (N4-N6),
  enigmas (N6-N8), tabelas de verdade pequenas (N8+), De Morgan (N10),
  predicados e negação de quantificadores (N11-N12, já no catálogo). A
  tabela de verdade como ferramenta **constrói-se antes de se desenhar**:
  primeiro raciocina-se, depois tabula-se.
- Precaução honesta para o produto: uma criança de 7 não lê tabelas de
  símbolos; os desafios de N4-N6 devem funcionar com figuras, atributos e
  grelhas, não com notação lógica (coerente com mc-20/mc-21 e a linha
  vermelha n.º 3).

## Executive summary (EN)

- The owner's request: children should see Boolean logic and truth tables
  right after kindergarten, in every level, "because it's the foundation of
  programming and they have to know it." The research says: **the idea is
  defensible, and the form is everything**.
- **Bebras** is the world's largest system teaching exactly this: an annual
  computational-thinking challenge in 50+ countries, age-banded (8-10 to
  16+), 1-4 minute tasks in three formats, validated as a CT measurement
  instrument [1][2][3]. Its Unplugged cards have age-separated sets **from
  age 3** [3].
- **Unplugged is the most-used strategy worldwide for CT in children**
  (Caeli & Yadav 2020) — and the honest review is that **no strategy is
  clearly proven best** (Hsu et al. 2018) [4].
- **Smullyan's knights-and-knaves puzzles are the documented bridge from
  elementary logic to proof**: the MAA recommends them for that transition —
  they build intuition for proof by contradiction, and students enjoy them
  [5]. Math Circles run them with physical pieces [6].
- **Reference formal progression** (Mathematics Manifesto): Boolean logic
  with puzzles and truth tables at **11-14**; formal logic with quantifiers
  at **14-18** [7]. The formal truth table is not 7-year-old content;
  embodied AND/OR/NOT reasoning is.
- **Design conclusion**: the LOGI branch can exist in **every level from
  N4** — with the form scaling: attributes and compound rules (N4-N6),
  puzzles (N6-N8), small truth tables (N8+), De Morgan (N10), predicates
  and quantifier negation (N11-N12, already in the catalog). The truth
  table is **built before it is drawn**: reason first, tabulate later.

## 1. O que o mundo faz hoje, verificado

### 1.1 Bebras — o sistema de referência

O Bebras International Challenge on Informatics and Computational
Thinking corre em mais de 50 países desde há ~16 anos [1][3]. Bandas de
idade: Little Beavers 8-10, Benjamins 10-12, Cadets 12-14, Juniors 14-16,
Seniors [2]. Cada participante resolve 15-18 tarefas em 40-45 minutos (1-4
minutos por tarefa), em três formatos: interativas, abertas e escolha
múltipla com quatro opções [2]. Os seus domínios medidos: decomposição,
reconhecimento de padrões, abstração, modelação e simulação, algoritmos e
avaliação [3]. As **Bebras Unplugged Cards** existem em sets por idade
desde os 3 anos (3-4, 5-6, 7-8, 9-10), com opções à escolha e sem exigir
dispositivos nem experiência prévia de código [3]. Há validação publicada
dos cartões como teste de pensamento computacional (Sung 2022, citado em
[3]) e uma avaliação 2024 de um programa Bebras no primário [4].

**O que Bebras prova para nós:** as tarefas lógicas de 1-4 minutos com
escolha múltipla funcionam desde os 7-8 anos — que é exatamente o formato
`toca_la_respuesta` que já temos em produção.

### 1.2 A estratégia unplugged e a sua evidência honesta

A revisão da literatura (EPFL/Springer 2024) constata que o pensamento
computacional se integra cada vez mais em currículos precoces e que
**unplugged é a estratégia mais comummente empregue** para crianças
(Caeli & Yadav 2020) — mas adverte textualmente: *«there is no clear
evidence regarding which strategies are most suitable for this purpose
(Hsu et al., 2018)»* [4]. Ou seja: o mundo fá-lo, a medição do que funciona
melhor está aberta. O nosso produto não pode prometer que o ramo «melhora a
mente» — pode prometer que está bem desenhado e que a medição própria
(master-plan §15) dirá se funciona.

### 1.3 Smullyan e os enigmas como ponte para a demonstração

A Mathematical Association of America, no seu guia de recursos para ensinar
matemática discreta, recomenda os enigmas de «cavaleiros e mentirosos» de
Raymond Smullyan (*What is the Name of this Book?*, 1978) como **ponte da
lógica elementar para a demonstração**: *«working on them helps develop a
basis of intuition for proof by contradiction… almost all students seem to
enjoy the puzzles»* [5]. Os Math Circles operam-nos com peças físicas de
duas cores (cavaleiro/mentiroso) — análise de casos como habilidade
explícita [6]. Smullyan publicou 14 livros de enigmas lógicos entre 1978 e
2015, muitos aninhados em narrativa (Alice, Sherlock Holmes, as Mil e Uma
Noites) [8].

**A lição de formato:** o enigma lógico eficaz é **narrativo e concreto**
(uma ilha, dois guardas, peças de duas cores), nunca uma fórmula. A
avaliação é de consequências, não de notação.

### 1.4 A progressão formal de referência

O Mathematics Manifesto (Emaths, Reino Unido) propõe: aos **11-14**, lógica
booleana (AND, OR, NOT) «through basic logic puzzles and truth tables» —
explicitamente como fundamento da computação; aos **14-18**, lógica formal
com notação e quantificadores, mais computabilidade e fundamentos [7]. O
TryEngineering (IEEE) tem material de álgebra de Boole «is Elementary»
orientado para a escola [9].

**O que isto fixa para nós:** a tabela de verdade como objeto formal cai
aos 11-14 na referência mais direta; o raciocínio booleano encarnado pode
(e em Bebras fá-lo) começar aos 7-8.

### 1.5 A lógica já existe nos currículos — disfarçada

Nenhum currículo escolar de mc-51 ensina «lógica» como matéria no primário,
mas todos a ensinam como **raciocínio**: o NC inglês pede «reason
mathematically» desde Y1 [10]; o Common Core pede «make sense of problems»
como prática transversal [11]; Singapura põe a resolução de problemas no
centro do quadro com cinco componentes [12]. O ramo LOGI de um produto não
compete com a escola: adianta-a com boa forma.

## 2. A escada proposta do ramo LOGI (N4-N12)

Coerente com a evidência de §1 e com o que já há em N11-N12 do catálogo
(`f11-contenido-retos.md`). Cada nível mantém ≥3 ramos (D-129) — LOGI seria
um deles em todos.

| Nível | Conteúdo LOGI | Forma do desafio | Referência |
|---|---|---|---|
| N4 | **Atributos e regras compostas**: «toca na figura que é vermelha E redonda»; «toca na que NÃO é azul» | Figuras com atributos (forma/cor/tamanho) — AND/NOT encarnados | Bebras 7-8 [3] |
| N5 | **Regras com OU**: «vale qualquer uma que seja grande OU vermelha»; classificar por dois critérios | Mesma superfície, critério disjuntivo | Bebras 7-8 [3] |
| N6 | **Enigma simples**: «destas três afirmações só uma é falsa, que caixa tem o prémio?» | Enigma narrativo curto, escolha múltipla | Bebras 8-10, Math Circles [3][6] |
| N7 | **Se… então e a sua não-inversa**: «todos os zorbos são azuis; isto não é azul, é um zorbo?» | Lógica proposicional encarnada (contrapositiva sem a nomear) | Smullyan [5] |
| N8 | **Tabelas de verdade pequenas (2 variáveis)**: «em quantas linhas é verdade?» | A tabela como opção: 2×2 com E/OU/NÃO | Manifesto 11-14 [7] |
| N9 | **3 variáveis e equivalências**: «estas duas expressões dizem o mesmo?» | Tabela 2×2×2; equivalência como verdade-em-toda-a-linha | [7] |
| N10 | **De Morgan**: «nega: (grande E vermelha)» | `¬(A∧B) ≡ ¬A∨¬B` com atributos primeiro, símbolos depois | [7] |
| N11 | **Predicados**: «todos / alguns / nenhum» sobre conjuntos concretos | Quantificação encarnada | mc-12, Manifesto 14-18 [7] |
| N12 | **Negação de quantificadores** (já autorado: `n12-p4`) + detetar o erro lógico numa cadeia | `¬∀ ≡ ∃¬`; «que linha quebra o argumento?» | mc-12 [5] |

**A regra de forma que sustenta toda a escada:** primeiro raciocina-se,
depois tabula-se. A tabela de verdade é a **foto do raciocínio que a
criança já fez** com atributos e enigmas — nunca o ponto de partida.

## 3. Como se converte em desafios auto-qualificáveis (com o que já existe)

- **N4-N5 (atributos):** o formato `toca_la_respuesta` com opções
  desenhadas (`dibujos` do `Item` — o mecanismo que já existe desde #349):
  a opção é a figura, não um identificador. Um desafio são 3-4 figuras que
  variam em 2-3 atributos; a resposta é a única que cumpre a regra
  composta. **Nenhuma tabela, nenhum símbolo.**
- **N6-N7 (enigmas):** enunciado narrativo de 1-2 linhas (autorado por
  locale, linha vermelha n.º 3 intacta: a criança nunca escreve) + 3-4
  opções. O distrator é o erro lógico real com causa nomeada
  (`tomó_la_contraria`, `confundió_todos_con_alguno`,
  `asumió_la_inversa`).
- **N8-N10 (tabelas):** a tabela desenha-se com figuras/ticks, não com V/F
  sozinhos; a pergunta é sobre uma linha ou sobre a contagem — escolha
  múltipla numérica ou de figura. A tabela completa como resposta livre NÃO
  entra (não é auto-qualificável com `toca_la_respuesta`; as tabelas
  grandes ficam para o quadro de D-075 em bandas adultas).
- **N11-N12:** já autorado no catálogo (`n12-p4` e o modelo de lógica da
  negação); completa-se com «deteta a linha que quebra» (formato de mc-12,
  já decidido).

**Erros com causa nomeada que este ramo acrescenta ao vocabulário**
(família própria, com fonte): `tomó_la_contraria` (nega ao contrário),
`asumió_la_inversa` (se A→B crê que B→A), `confundió_y_con_o`,
`confundió_todos_con_alguno` (quantificadores),
`negó_la_proposición_en_vez_del_cuantificador` (já no catálogo),
`olvidó_un_caso` (análise de casos incompleta).

## 4. Precauções (a parte que não há que saltar)

1. **Não prometer transferência.** A revisão diz que não há evidência clara
   de que estratégia de pensamento computacional funciona melhor (Hsu et
   al. 2018, via [4]). O produto não pode dizer «a lógica melhora a
   mente» — pode dizer «está bem desenhada, e medimos» (master-plan §15: o
   único limiar que importa é retenção diferida).
2. **Uma criança de 7 não lê notação lógica.** Os níveis N4-N6 são
   figuras, atributos e enigmas narrados — coerente com mc-20/mc-21 e a
   linha vermelha n.º 3. O símbolo chega quando a intuição já existe.
3. **O prazer é um ativo documentado, não um adorno** («almost all students
   seem to enjoy the puzzles» [5]) — mas o enigma que humilha quem falha é
   anti-Larry: os erros com causa nomeada de §3 são o canal do feedback
   (mc-11).
4. **Não competir com Bebras, complementar:** o seu desafio é anual e
   escolar; o nosso é adaptativo e diário. A inspiração de formato é
   explícita e citada, não cópia de tarefas (são concurso protegido).

## 5. Implicações de design para o Math Challenge

1. **LOGI passa de ramo de N11-N12 a ramo presente em TODOS os níveis
   N4-N12** (pedido do proprietário 2026-08-03), com a escada de §2. O mapa
   de `mc-51` §4 é atualizado: `LOGI` deixa de ser só predicados e torna-se
   a escada completa (booleana → enigmas → tabelas → predicados), com as
   suas duas sub-etiquetas (booleana / predicados).
2. **É o quarto ramo de cada nível** — D-129 pede ≥3 ramos por nível; com
   LOGI presente em todos, cada nível tem um ramo garantido transversal
   mais dois da sua matéria.
3. **O catálogo dos 54 cresce com desafios LOGI por nível** (secção à parte
   em `f11-contenido-retos.md`), sem mudar o piso de 6: os desafios LOGI
   são **adicionais** ao piso, porque a sua função é transversal (base de
   programação e demonstração), não de matéria.
4. **É a base oficial da pista de demonstração** (D-132): a pista
   transversal arranca em enigmas (N6) e termina em Lean 4 (D-124) — a
   mesma espinha, dez anos de comprimento.
5. **O nome de pessoa do ramo** (D-128) é autorado por locale: «enigmas
   lógicos» / «logic puzzles» — nunca «03 Mathematical logic and
   foundations» no ecrã.

## 6. Questões abertas para o proprietário — RESOLVIDAS (2026-08-03, D-147)

| # | Pergunta | Resposta |
|---|---|---|
| 1 | Dentro do piso de 6 ou adicionais? | **Adicionais** — a lógica é transversal, não uma matéria do nível |
| 2 | Quando a tabela de verdade formal? | **N8**, após atributos e enigmas |
| 3 | Nome do ramo no ecrã? | **«Enigmas»**, autorado por locale |
| 4 | Kinder? | **Fora, desde N4** — a trajetória de mc-06 tem prioridade |

Os desafios ficaram autorados como anexo de
`docs/planes/f11-contenido-retos.md`.

## Fontes

1. **USA Bebras Computing Challenge** — https://bebraschallenge.org/ —
   a competição e o seu formato.
2. **Constructionism 2016 Proceedings** (descrição do desafio Bebras:
   bandas, 15-18 tarefas, 40-45 minutos, três formatos) —
   https://e-school.kmutt.ac.th/constructionism2016/Constructionism%202016%20Proceedings.pdf
   — descarregado.
3. **Bebras Unplugged Computational Thinking Cards** (sets por idade desde
   3 anos, domínios medidos, validação) — via
   https://adn.reviste.ubbcluj.ro/papers/article_16_1_3.pdf — descarregado.
4. **A Bebras Computational Thinking program for primary school
   (Springer 2024)** — https://link.springer.com/article/10.1007/s10639-023-12441-w
   — descarregado; inclui a advertência de Hsu et al. 2018 («no clear
   evidence which strategies are most suitable») e Caeli & Yadav 2020.
5. **MAA, Resources for Teaching Discrete Mathematics** —
   https://www.maa.org/wp-content/uploads/2024/10/NTE74.pdf#page=200 —
   descarregado; Smullyan como ponte para a demonstração, a citação sobre o
   prazer.
6. **Carleton Math Circle — Knights and Knaves com peças físicas** —
   https://cdn.carleton.edu/uploads/sites/66/2020/06/Math-Circle-Comps.pdf
   — descarregado; e MathCircles.org «Knights and Knaves: a journey to the
   land of logic».
7. **Mathematics Manifesto (Emaths)** —
   https://www.emaths.co.uk/images/Blogs/MathematicsManifesto/Mathematics%20Manifesto.pdf
   — descarregado; a progressão 11-14 booleana / 14-18 formal.
8. **Computational Complexity blog — Smullyan obituário/bibliografia** —
   https://blog.computationalcomplexity.org/2017/02/raymond-smullyan-was-born-on-may-25.html
   — descarregado; os 14 livros de enigmas (1978-2015).
9. **TryEngineering — Boolean Algebra is Elementary (IEEE)** —
   https://tryengineering.org/wp-content/uploads/Boolean-Algebra-Elementary.pdf
   — descarregado.
10. **National Curriculum in England** — gov.uk (via mc-51 [9]) — «reason
    mathematically» como fio desde Y1.
11. **Common Core** — thecorestandards.org (via mc-51 [8]) — práticas
    transversais.
12. **Singapura MOE Primary Mathematics Syllabus 2021** (via mc-51 [16]) —
    resolução de problemas no centro do quadro.

**Advertências desta sessão:** as tarefas concretas de Bebras são de
concurso e não se descarregaram (citam-se formato e bandas, não tarefas); a
referência do Manifesto é de um autor e não um padrão nacional; a evidência
de eficácia das estratégias de pensamento computacional está aberta (§4.1)
e este documento não afirma transferência.
