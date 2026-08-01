# Sistemas tutores inteligentes e modelagem do aprendiz: BKT, DKT, PFA e a abordagem Elo do Math Garden

> Pesquisa Math Challenge — 2026-07-31 — tópico 13

## Resumo executivo (tópicos)

- BKT (Corbett & Anderson 1995) modela o domínio de uma habilidade com quatro parâmetros — `P(L0)` maestria inicial, `P(T)` prob. de aprender, `P(G)` prob. de adivinhar, `P(S)` prob. de "deslize" — com valores de exemplo amplamente citados `P(L0)=0.36, P(T)=0.1, P(G)=0.3, P(S)=0.05` [1].
- Cognitive Tutor (motor de MATHia) combina "model tracing" (regras de produção passo a passo) com rastreio de conhecimento (domínio agregado por habilidade); são mecanismos distintos e frequentemente confundidos [2].
- A evidência de eficácia é mista: What Works Clearinghouse (2016) classifica Cognitive Tutor Algebra I como "efeitos mistos" em álgebra (+4 pontos, intervalo -7 a +19) e "sem efeito discernível" em desempenho geral; Geometry obteve efeito potencialmente negativo (-8) [3].
- O estudo RAND (Pane et al. 2014) não encontrou efeito no primeiro ano e encontrou ~0,21 desvios padrão no segundo ano — a eficácia dependia da fidelidade de implementação [4].
- DKT (Piech et al. 2015) reportou AUC 0,86 vs 0,68 de BKT no ASSISTments, mas Khajah et al. (2016) mostraram que a comparação foi injusta: BKT bem replicado chega a 0,73, e variantes estendidas quase igualam DKT [5][6].
- PFA e AFM são alternativas de regressão logística ao BKT: contabilizam acertos/erros prévios por componente de conhecimento sem estado bayesiano oculto [7][8].
- O sistema mais relevante aqui é Math Garden (Rekentuin, U. Ámsterdam / Oefenweb): uma variante Elo que reestima habilidade e item a cada resposta, sem calibração por lotes [9].
- Sua regra "high-speed high-stakes" (HSHS, Maris & van der Maas 2010/2012) combina precisão e tempo: `score = a_i · (d_i − RT) · (2·acc − 1)`, com `d_i` limite de tempo, `a_i` fator de escala, `acc ∈ {0,1}` [10].
- Sob esta regra o modelo de acerto é exatamente o 2PL de TRI, com `d_i` como parâmetro de discriminação — uma ponte entre TRI clássico e avaliação em tempo real [10].
- Math Garden amostra itens para ~75% de acerto, coerente com a literatura de "dificuldade desejável" (faixa ótima ~70-85%) [9][11].
- Validade convergente de HSHS com CITO: r=,78-,84; em xadrez, HSHS correlacionou mais com FIDE que a contagem simples [10].
- Recomendação: implementar primeiro Elo/HSHS (não BKT completo) — requer apenas um fator K/incerteza, atualiza em O(1) por resposta (ideal para Durable Objects), e já está validado em um domínio quase idêntico (aritmética infantil).

## Resumo executivo (prosa)

A pesquisa ITS se divide em duas linhagens frequentemente confundidas: **rastreio de modelo** (rastrear a solução passo a passo do estudante contra regras de produção — mecanismo original do Cognitive Tutor) e **rastreio de conhecimento** (acompanhar o domínio agregado de habilidades ao longo das tentativas — Bayesian Knowledge Tracing e sucessores) [2]. A evidência de eficácia para o produto emblemático de rastreio de modelo, Cognitive Tutor/MATHia da Carnegie Learning, é genuinamente mista: a revisão de 2016 do What Works Clearinghouse o classifica como "efeitos mistos" em álgebra, "sem efeitos discerníveis" em desempenho geral de matemática e "potencialmente negativo" para a variante de Geometria [3]. O grande ensaio randomizado da RAND não encontrou efeito no primeiro ano e encontrou um modesto efeito de 0,21 DP no segundo ano, condicionado à fidelidade da implementação [4] — tutoria adaptativa não é automaticamente eficaz.

Bayesian Knowledge Tracing (BKT) é um modelo oculto de Markov de quatro parâmetros (maestria inicial, taxa de aprendizado, adivinhação, deslize) com equações de atualização em forma fechada [1]. Deep Knowledge Tracing (DKT, Piech et al. 2015) substituiu isso por um LSTM e relatou grandes ganhos de AUC, mas uma replicação rigorosa (Khajah, Lindsey & Mozer 2016) constatou que a comparação original subestimou o BKT, e que BKT estendido fecha a maior parte da diferença [5][6]. Performance Factors Analysis e o Additive Factors Model oferecem uma alternativa de regressão logística mais simples que se ajusta incrementalmente [7][8].

O artefato prévio mais diretamente aplicável é **Math Garden (Rekentuin)**, desenvolvido na University of Amsterdam, comercializado como Oefenweb/Prowise Learn: um sistema de prática aritmética computador-adaptativo para crianças que atualiza a habilidade do aprendiz e a dificuldade do item a cada resposta usando uma variante Elo combinada com a **regra de pontuação high-speed high-stakes (HSHS)** (Maris & van der Maas, 2010/2012), pontuando cada tentativa tanto pela correção quanto pelo tempo de resposta [9][10]. Essa é a base da recomendação concreta abaixo.

## Resultados
### 1. Model tracing vs. knowledge tracing

A arquitetura original do Cognitive Tutor baseia-se em **model tracing**: as ações do estudante são comparadas passo a passo com um modelo de especialista construído a partir de regras de produção (análise de tarefas cognitivas ACT-R), permitindo dicas contextuais e just-in-time [2]. Sobreposto, **knowledge tracing** monitora a maestria gradual de cada habilidade (knowledge component) ao longo das atividades de resolução de problemas, atualizando a probabilidade de que uma regra seja “conhecida” a cada vez que é exercida, independentemente de qual problema específico o passo provém [1][2]. Para um jogo autônomo de aritmética/lógica como Math Challenge — itens discretos e bem especificados, ao contrário de provas abertas de múltiplas etapas — knowledge tracing (ou seu primo Elo) é o mecanismo relevante; o model tracing completo serve para verificação passo a passo de derivações de álgebra/geométrica e provavelmente não será necessário aqui.

### 2. Bayesian Knowledge Tracing: the four parameters and update equations

BKT (Corbett & Anderson, 1994/1995) tem quatro parâmetros por habilidade: `P(L0)` (probabilidade inicial de que a habilidade seja conhecida), `P(T)` (probabilidade de transição de desconhecida para conhecida em qualquer oportunidade), `P(G)` (probabilidade de adivinhar corretamente enquanto desconhecida), `P(S)` (probabilidade de um deslize — resposta incorreta apesar de conhecer a habilidade) [1]. Conforme a re-derivação de van de Sande (2013), as duas equações governantes são:

- Atualização de aprendizado: `P(Lj) = P(Lj-1) + P(T)·(1 − P(Lj-1))`
- Predição de correção: `P(Cj) = P(G)·(1 − P(Lj)) + (1 − P(S))·P(Lj)`

e a atualização posterior online (por observação) usada pelo “Knowledge Tracing Algorithm” em tempo real aplica a regra de Bayes ao resultado observado, avançando um passo de aprendizado:

- Se correto: `P(Lj-1|Oj) = [P(Lj-1|Oj-1)(1−P(S))] / [P(Lj-1|Oj-1)(1−P(S)) + (1−P(Lj-1|Oj-1))·P(G)]`
- Se incorreto: `P(Lj-1|Oj) = [P(Lj-1|Oj-1)·P(S)] / [P(Lj-1|Oj-1)·P(S) + (1−P(Lj-1|Oj-1))·(1−P(G))]`
- Então: `P(Lj|Oj) = P(Lj-1|Oj) + [1 − P(Lj-1|Oj)]·P(T)`

Um conjunto de parâmetros amplamente usado (correspondente ao modelo ilustrativo de Baker et al. 2008, reproduzido na Fig. 3 de van de Sande) é `P(S)=0.05, P(G)=0.3, P(T)=0.1, P(L0)=0.36` [1]. Van de Sande também demonstra que BKT só se comporta bem (monotonicamente não degenerado) quando `P(G)+P(S) < 1`, e que sua forma de cadeia de Markov oculta é identificável apenas até três parâmetros combinados, a menos que seja ajustada com o algoritmo recursivo por observação — um aviso publicado sobre ajuste de parâmetros, não apenas um detalhe de implementação [1].

### 3. Efficacy evidence — mixed, not uniformly positive

O relatório da WWC de junho 2016 revisou 22 estudos candidatos, 7 atendendo aos padrões de desenho grupal, abrangendo 12.840 estudantes em 118 localidades [3]. Avaliações: Cognitive Tutor Algebra I → **mixed effects** em álgebra (índice de melhoria +4, intervalo −7 a +19, 5 estudos/12.182 estudantes, evidência “média a grande”) e **no discernible effects** em desempenho geral de matemática (+2, 1 estudo, evidência “pequena”); Cognitive Tutor Geometry → **potentially negative effects** (−8, 1 estudo, evidência “pequena”) [3]. O ensaio cluster-randomizado da RAND (Pane et al., 2014) não encontrou diferença no primeiro ano e um efeito significativo de +0,21 DP no segundo ano (≈50.º→58.º percentil), atribuído em grande parte à maturidade da implementação [4]. Conclusão: o tamanho do efeito é modesto e dependente da implementação, não uma vitória garantida apenas pelo algoritmo.

### 4. Deep Knowledge Tracing and the fairness controversy

Piech et al. (2015) introduziram o DKT, modelando sequências de interação com um LSTM: AUC 0,86 no ASSISTments (vs. 0,68 BKT) e 0,85 no Khan Academy (vs. 0,68 BKT, 0,63 baseline marginal) [5], lido como prova de que deep learning domina o BKT. Khajah, Lindsey & Mozer (2016) mostraram que a comparação subestimou o BKT: uma re-implementação correta atingiu 0,73 (vs. 0,67 reportado) nos mesmos dados, e estender o BKT com esquecimento, habilidade por estudante e descoberta de habilidades fechou a maior parte da lacuna [6]. Lição: não assuma que um modelo mais sofisticado supera um modelo simples bem ajustado sem verificação — as necessidades de dados/computação do DKT (sequências longas, habilidades opacas) também combinam mal com um produto que requer dificuldade interpretável e amigável ao início frio desde o primeiro dia.

### 5. Performance Factors Analysis and the Additive Factors Model

AFM (Cen, Koedinger & Junker) modela a correção via regressão logística em três termos aditivos por knowledge component: intercepto de habilidade do estudante, intercepto de facilidade do KC e inclinação de taxa de aprendizado do KC multiplicada pelas oportunidades prévias [7]. PFA (Pavlik, Cen & Koedinger, 2009) estende isso substituindo “contagem de oportunidades” por **contagens separadas de sucessos e falhas prévias** por KC [7][8]. Ambos são ajustados online via regressão logística incremental, não necessitando de passagem EM/pesquisa em grade, ao contrário do BKT completo.

### 6. Elo/IRT-based adaptive difficulty, and Math Garden specifically

A ideia central do IRT: a probabilidade de correção é uma função logística da habilidade latente menos a dificuldade do item (1PL), opcionalmente escalada por discriminação (2PL) e um piso de adivinhação (3PL); testes adaptativos escolhem, após cada resposta, o item não respondido que maximiza a informação na estimativa de habilidade corrente [12]. A Half-Life Regression da Duolingo (Settles & Meeder 2016) é relacionada, porém distinta: ajusta uma curva exponencial de esquecimento por item/estudante a partir de características linguísticas/históricas para prever o momento de esquecimento, otimizando o timing de repetição espaçada ao invés da seleção baseada em dificuldade [13].

**Math Garden (Rekentuin)**, do departamento de métodos psicológicos da University of Amsterdam (2007), agora comercializado pela Oefenweb/Prowise Learn, é o análogo mais próximo ao objetivo do Math Challenge de pontuar velocidade e precisão juntos [9]. Ele aplica uma variante do Elo (1978) onde a habilidade do estudante e a dificuldade do item são re-estimadas a cada item respondido — sem lote de calibração offline, permitindo calibração em tempo real de conteúdo recém-criado [9]. Itens na validação de 2011 foram amostrados para atingir uma probabilidade média de sucesso de **,75** [9], exatamente dentro da faixa de 70–80% que este projeto visa, e foram validados empiricamente contra o desempenho real de crianças.

O mecanismo de pontuação — lido diretamente do artigo “High Speed High Stakes Scoring Rule” de Klinkenberg — remonta a van der Maas & Wagenmakers (2005), que deram a cada item um limite de tempo `d` e pontuaram a resposta como tempo restante vezes acurácia binária: `score = acc · (d − RT)` (0 se incorreto, respostas mais rápidas pontuam mais se corretas) [10]. Isso premiava adivinhações arriscadas em itens que pareciam muito difíceis (adivinhar era gratuito), de modo que Maris & van der Maas (2010) tornaram a acurácia simétrica (`{-1,+1}` ao invés de `{0,1}`):

**`score = a_i · (d_i − RT) · (2·acc − 1)`**

onde `d_i` é o limite de tempo do item, `RT` o tempo de resposta, `acc ∈ {0,1}` a correção, `a_i` um fator de escala do item — uma resposta rápida e errada torna-se fortemente negativa, removendo o incentivo de adivinhar e desistir [10]. Maris & van der Maas (2012, Psychometrika) provaram que sob essa regra o modelo implícito de probabilidade de acerto é **exatamente o modelo IRT 2PL**, com o limite de tempo `d` atuando como discriminação do item — uma ponte limpa entre uma regra de pontuação em tempo real e o IRT clássico [10]. Validação empírica: avaliações HSHS correlacionaram r=0,78–0,84 com notas CITO holandesas em quatro operações aritméticas, e em um conjunto de dados de xadrez (CORUS 2008) correlacionaram mais com Elo FIDE (r=,808) do que com soma simples de corretas (r=,575) [10].

### 7. Practical Elo mechanics for adaptive item selection

A literatura mais ampla sobre Elo em aprendizagem adaptativa (Pelánek, “Applications of the Elo Rating System in Adaptive Educational Systems”) enquadra a mesma atualização bidirecional como no xadrez: após cada tentativa, a classificação do aprendiz e a dificuldade do item movem-se um ao outro proporcional ao “surpresa” (resultado real menos esperado, função logística da diferença de classificação), escalada por uma “função de incerteza” que desempenha o papel do fator K do xadrez — maior para itens/aprendizes recém-criados, diminuindo à medida que as observações se acumulam [14]. Esse é o mecanismo recomendado a seguir.

## Implicações de design para o Math Challenge

1. **Implemente primeiro um modelo estilo Math-Garden Elo/HSHS, e não o BKT completo.** BKT precisa de ajuste de parâmetros por habilidade (busca em grade ou EM) antes de se comportar de forma sensata [1]; Elo-com-HSHS atualiza a classificação do aprendiz e do item a cada tentativa de forma fechada, sem calibração offline — ideal para um grande banco de itens em crescimento ao vivo desde o primeiro dia.

2. **Fórmula de pontuação concreta:** para um item cronometrado com limite `d_i` (segundos), tempo de resposta `RT`, correção `acc ∈ {0,1}`: `score = a_i · (d_i − RT) · (2·acc − 1)`, limitando `RT` a `d_i` se puder exceder o limite [10]. Comece com `a_i = 1` para todos os itens; introduza discriminação por item somente quando houver dados suficientes para estimá-la (Maris & van der Maas mostram que `a_i`/`d_i` estão entrelaçados com a discriminação 2PL) [10].

3. **Regra de atualização:** `expected = 1 / (1 + 10^(-(ability − difficulty)/400))` (logística padrão Elo), `actual = score / (a_i·d_i)` reescalado para `[0,1]`, então `ability += K_learner · (actual − expected)` e `difficulty −= K_item · (actual − expected)` [9][14].

4. **Agenda do fator K:** decaia a função de incerteza em vez de usar um K constante — grande (por exemplo, ≈0,5–1,0) para as primeiras ~10–20 tentativas de um aprendiz ou item, reduzindo para um pequeno estado estável (≈0,05–0,1) depois, espelhando o tratamento de início frio vs. estado estável em sistemas educacionais baseados em Elo [14]. Acompanhe um contador de tentativas por habilidade-do-aprendiz e por item para conduzir esse decaimento.

5. **A estimativa de dificuldade do item é online por construção:** cada tentativa no item `i` ajusta sua classificação de dificuldade, de modo que um item recém-criado obtém uma dificuldade provisória após algumas respostas, sem necessidade de pré-teste — a maior vantagem prática do Elo sobre BKT/DKT/PFA, que assumem uma taxonomia fixa e/ou uma etapa de ajuste em lote [1][7][9].

6. **Taxa de sucesso alvo para seleção de itens: 70–80%, centrada próximo a 75%**, correspondendo ao alvo validado de .75 do Math Garden [9] e à literatura mais ampla sobre dificuldade desejável [11]. Ao selecionar o próximo item para a habilidade `θ`, escolha entre itens cuja dificuldade `β_i` coloca `expected(θ, β_i)` em `[0.70, 0.80]`; amostre entre os 3–5 itens elegíveis de dificuldade mais próxima em vez de sempre o único mais próximo, para evitar saltos visivelmente repetitivos.

7. **Esquema D1 mínimo por tentativa:** `attempt_id, learner_id, item_id, skill_id(s), timestamp, response_time_ms, time_limit_ms, correct, raw_score, learner_rating_before/after, item_difficulty_before/after, k_factor_used, context flags (input_method, hint_used), sequence_index_in_session`. Armazenar as classificações antes/depois (não apenas o estado atual) torna o histórico auditável e reproduzível, e suporta comparação offline contra um experimento posterior de BKT/PFA sem re-instrumentação.

8. **Separe a dificuldade do item dos metadados de dificuldade de conteúdo.** Armazene uma etiqueta de série/nível atribuída pelo autor independentemente da classificação Elo ao vivo; use-a apenas como prior de início frio (semente próximo à classificação média de itens com a mesma etiqueta), permitindo que a classificação ao vivo assuma após ~10 respostas — isso evita que um item mal etiquetado nunca seja encaminhado a aprendizes que revelariam sua verdadeira dificuldade.

9. **Durable Object para o caminho crítico, D1 como o livro-razão.** A atualização O(1) por evento do Elo se encaixa em um Durable Object que mantém a classificação ao vivo de um aprendiz (e uma partição das classificações de itens quentes), gravando cada tentativa como uma linha D1 somente-apêndice; isso evita corridas de leitura-modificação-escrita em linhas de itens compartilhados que um design ingênuo apenas D1 sofre sob concorrência real.

10. **Adie BKT/PFA/DKT para uma camada v2 de “domínio de habilidade”,** não para a seleção de itens v1. Quando houver histórico D1 suficiente, um lote noturno de BKT/PFA por habilidade de granularidade fina pode alimentar painéis de domínio e sinais voltados aos pais — uma superfície diferente da seleção em tempo real, e misturá-los cedo aumenta o risco de repetir a armadilha de justiça DKT/BKT [5][6].

11. **Não espere que o algoritmo sozinho garanta ganhos de aprendizagem.** As descobertas mistas/nulas/negativas da WWC para um produto maduro [3] e o resultado nulo de um ano da RAND [4] mostram que a dificuldade adaptativa é necessária, mas não suficiente. Faça testes A/B do modelo de aprendiz contra uma escada fixa simples antes de atribuir ganhos de engajamento especificamente ao Elo.

12. **Proteja contra explorações de adivinhação arriscada.** A transformação `(2·acc−1)` existe para tornar respostas rápidas e erradas custosas [10] — verifique em QA que pressionar respostas aleatórias rapidamente não supere o engajamento genuíno, especialmente para usuários jovens que podem não ler a estrutura de incentivos como um adulto faria.

## Perguntas abertas para o dono do projeto
1. O limite de tempo `d_i` por item deve ser fixado por faixa etária/série, ou ser ele próprio um parâmetro estimado ao vivo (conforme o resultado de equivalência 2PL)?
2. Para usuários muito jovens (idades 4-6) que podem não operar de forma confiável uma interface de temporizador, o HSHS deve ser aplicado de todo, ou o conteúdo de primeira infância deve usar uma regra apenas de acurácia até que a criança alcance a idade para jogar cronometrado?
3. Uma escala Elo global por aprendiz, ou escalas por domínio (aritmética vs. lógica vs. geometria) que não se comparam diretamente?
4. A camada de domínio em lote noturno BKT/PFA (§10) está dentro do escopo do mesmo marco que o seletor Elo ao vivo, ou em uma fase posterior?
5. Qual tolerância de erro de início frio é aceitável para itens recém-criados — quantas respostas são necessárias antes que uma classificação de dificuldade seja “confiável” o suficiente para ser encaminhada amplamente?

## Fontes

1. Van de Sande (2013). "Properties of the Bayesian Knowledge Tracing Model." JEDM 5(2). https://files.eric.ed.gov/fulltext/EJ1115329.pdf
2. Koedinger & Corbett (2006). Cognitive Tutors — model tracing vs. knowledge tracing. PACT Center, CMU. https://pact.cs.cmu.edu/pubs/koedingercorbett06.pdf
3. What Works Clearinghouse (June 2016). "Cognitive Tutor" Intervention Report. https://ies.ed.gov/ncee/wwc/Docs/InterventionReports/wwc_cognitivetutor_062116.pdf
4. Pane, Griffin, McCaffrey & Karam (2014). "Effectiveness of Cognitive Tutor Algebra I at Scale." RAND. https://www.rand.org/pubs/research_briefs/RB9746.html
5. Piech et al. (2015). "Deep Knowledge Tracing." NeurIPS 28. https://arxiv.org/pdf/1506.05908
6. Khajah, Lindsey & Mozer (2016). "How Deep is Knowledge Tracing?" https://arxiv.org/pdf/1604.02416
7. Pavlik, Cen & Koedinger (2009). "Performance Factors Analysis." https://files.eric.ed.gov/fulltext/ED506305.pdf
8. Cen, Koedinger & Junker — Additive/Instructional Factors Analysis. https://www.cs.cmu.edu/~ggordon/chi-etal-ifa.pdf
9. Klinkenberg, Straatemeier & van der Maas (2011). "Computer adaptive practice of Maths ability..." Computers & Education 57, 1813–1824. https://www.klinkenberg.amsterdam/publication/math-garden/
10. Klinkenberg, "High Speed High Stakes Scoring Rule" (SURF report), building on Maris & van der Maas (2012) Psychometrika 77, 615–633. https://www.surf.nl/files/2019-04/Artikel%20High%20Speed%20High%20Stakes%20Scoring%20Rule.pdf ; https://link.springer.com/article/10.1007/s11336-012-9288-y
11. Wilson et al. (2019). "The Eighty Five Percent Rule for optimal learning." Nature Communications. https://www.nature.com/articles/s41467-019-12552-4
12. IRT basics (1PL/2PL/3PL, adaptive selection via maximum information). https://www.cogn-iq.org/learn/theory/item-response-theory/
13. Settles & Meeder (2016). "A Trainable Spaced Repetition Model for Language Learning" (Duolingo HLR). ACL. https://research.duolingo.com/papers/settles.acl16.pdf
14. Pelánek. "Applications of the Elo Rating System in Adaptive Educational Systems." Computers & Education. https://www.fi.muni.cz/~xpelanek/publications/CAE-elo.pdf
