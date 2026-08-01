# Sistemas tutoriais inteligentes e modelação do aluno: BKT, DKT, PFA e a abordagem Elo do Math Garden

> Math Challenge research — 2026-07-31 — topic 13

## Resumo executivo (ES)

- BKT (Corbett & Anderson 1995) modela o domínio de uma competência com quatro parâmetros — `P(L0)` mestria inicial, `P(T)` prob. de aprender, `P(G)` prob. de adivinhar, `P(S)` prob. de “deslizamento” — com valores de exemplo amplamente citados `P(L0)=0.36, P(T)=0.1, P(G)=0.3, P(S)=0.05` [1].
- Cognitive Tutor (motor do MATHia) combina “model tracing” (regras de produção passo a passo) com knowledge tracing (domínio agregado por competência); são mecanismos distintos e frequentemente confundidos [2].
- A evidência de eficácia é mista: o What Works Clearinghouse (2016) classifica o Cognitive Tutor Algebra I como “efeitos mistos” em álgebra (+4 pontos, intervalo -7 a +19) e “sem efeito discernível” no desempenho geral; Geometry obteve efeito potencialmente negativo (-8) [3].
- O ensaio do RAND (Pane et al. 2014) não encontrou efeito no ano 1 e sim ~0,21 desvios‑padrão no ano 2 — a eficácia dependia da fidelidade de implementação [4].
- DKT (Piech et al. 2015) reportou AUC 0,86 vs 0,68 de BKT no ASSISTments, mas Khajah et al. (2016) mostraram que a comparação foi injusta: BKT bem replicado chega a 0,73, e variantes estendidas quase igualam o DKT [5][6].
- PFA e AFM são alternativas de regressão logística ao BKT: contabilizam acertos/erros prévios por componente de conhecimento sem estado bayesiano oculto [7][8].
- O sistema mais relevante aqui é o Math Garden (Rekentuin, U. Ámsterdam / Oefenweb): uma variante Elo que reestima competência e item a cada resposta, sem calibração por lotes [9].
- A sua regra “high‑speed high‑stakes” (HSHS, Maris & van der Maas 2010/2012) combina precisão e tempo: `score = a_i · (d_i − RT) · (2·acc − 1)`, com `d_i` limite de tempo, `a_i` fator de escala, `acc ∈ {0,1}` [10].
- Sob esta regra o modelo de acerto é exatamente o 2PL de TRI, com `d_i` como parâmetro de discriminação — uma ponte entre a TRI clássica e a classificação em tempo real [10].
- O Math Garden amostra itens para ~75 % de sucesso, coerente com a literatura de “dificuldade desejável” (banda ótima ~70‑85 %) [9][11].
- Validade convergente do HSHS com CITO: r=0,78‑0,84; no xadrez, o HSHS correlacionou mais com a FIDE do que a contagem simples [10].
- Recomendação: implementar primeiro Elo/HSHS (não BKT completo) — requer apenas um fator K/incerteza, actualiza em O(1) por resposta (ideal para Durable Objects), e já está validado num domínio quase idêntico (aritmética infantil).

## Resumo executivo (EN)

A investigação ITS divide‑se em duas linhagens frequentemente confundidas: **model tracing** (rastrear a solução passo a passo do estudante contra regras de produção — o mecanismo original do Cognitive Tutor) e **knowledge tracing** (acompanhar a mestria agregada de competências ao longo das tentativas — Bayesian Knowledge Tracing e sucessores) [2]. A evidência de eficácia do produto emblemático de model‑tracing, o Cognitive Tutor/MATHia da Carnegie Learning, é genuinamente mista: a revisão de 2016 do What Works Clearinghouse classifica‑o como “efeitos mistos” em álgebra, “sem efeitos discerníveis” no desempenho geral em matemática, e “potencialmente negativo” para a variante de Geometria [3]. O grande ensaio randomizado do RAND não encontrou efeito no primeiro ano e um modesto efeito de 0,21 SD no segundo ano, dependente da fidelidade de implementação [4] — o tutoria adaptativo não é automaticamente eficaz.

O Bayesian Knowledge Tracing (BKT) é um modelo de Markov oculto de quatro parâmetros (mestria inicial, taxa de aprendizagem, adivinhação, deslizamento) com equações de atualização em forma fechada [1]. O Deep Knowledge Tracing (DKT, Piech et al. 2015) substituiu este modelo por uma LSTM e reportou grandes ganhos de AUC, mas uma replicação rigorosa (Khajah, Lindsey & Mozer 2016) constatou que a comparação original subestimou o BKT, e que o BKT estendido fecha a maior parte da lacuna [5][6]. A Performance Factors Analysis e o Additive Factors Model oferecem uma alternativa de regressão logística mais simples que se ajusta incrementalmente [7][8].

A arte prévia mais diretamente aplicável é o **Math Garden (Rekentuin)**, desenvolvido na Universidade de Amesterdão e comercializado como Oefenweb/Prowise Learn: um sistema de prática de aritmética computador‑adaptativo para crianças que actualiza a capacidade do estudante e a dificuldade do item após cada resposta usando uma variante Elo combinada com a **regra de pontuação high‑speed high‑stakes (HSHS)** (Maris & van der Maas, 2010/2012), pontuando cada tentativa tanto pela correção quanto pelo tempo de resposta [9][10]. Esta é a base da recomendação concreta abaixo.

## Constatações

### 1. Model tracing vs. knowledge tracing

A arquitetura original do Cognitive Tutor baseia‑se no **rastreio de modelo**: as ações do utilizador são comparadas passo a passo com um modelo de especialista construído a partir de regras de produção (análise de tarefa cognitiva ACT‑R), permitindo sugestões contextuais e em tempo real [2]. Por cima, o **rastreio de conhecimento** monitoriza a progressiva mestria de cada habilidade (componente de conhecimento) ao longo das atividades de resolução de problemas, actualizando a probabilidade de que uma regra esteja “conhecida” sempre que a mesma é exercida, independentemente do problema específico de onde provém o passo [1][2]. Para um jogo autónomo de aritmética/lógica como o Math Challenge — itens discretos e bem especificados em vez de provas multi‑passo abertas — o rastreio de conhecimento (ou o seu primo Elo) é o mecanismo relevante; o rastreio de modelo completo serve para a verificação passo a passo de derivações de álgebra/geometria e é pouco provável que seja necessário aqui.

### 2. Bayesian Knowledge Tracing: os quatro parâmetros e as equações de atualização

O BKT (Corbett & Anderson, 1994/1995) tem quatro parâmetros por habilidade: `P(L0)` (probabilidade inicial de a habilidade estar conhecida), `P(T)` (probabilidade de transição de desconhecida para conhecida em qualquer oportunidade), `P(G)` (probabilidade de adivinhar corretamente enquanto desconhecida), `P(S)` (probabilidade de um deslize — resposta incorrecta apesar de conhecer a habilidade) [1]. Segundo a re‑derivação de van de Sande (2013), as duas equações governantes são:

- Atualização da aprendizagem: `P(Lj) = P(Lj-1) + P(T)·(1 − P(Lj-1))`
- Predição de correção: `P(Cj) = P(G)·(1 − P(Lj)) + (1 − P(S))·P(Lj)`

e a atualização posterior online (por observação) usada pelo “Knowledge Tracing Algorithm” em tempo real aplica a regra de Bayes ao resultado observado e depois avança um passo de aprendizagem:

- Se correta: `P(Lj-1|Oj) = [P(Lj-1|Oj-1)(1−P(S))] / [P(Lj-1|Oj-1)(1−P(S)) + (1−P(Lj-1|Oj-1))·P(G)]`
- Se incorrecta: `P(Lj-1|Oj) = [P(Lj-1|Oj-1)·P(S)] / [P(Lj-1|Oj-1)·P(S) + (1−P(Lj-1|Oj-1))·(1−P(G))]`
- Depois: `P(Lj|Oj) = P(Lj-1|Oj) + [1 − P(Lj-1|Oj)]·P(T)`

Um conjunto de parâmetros amplamente usado (correspondente ao modelo ilustrativo de Baker et al. 2008, reproduzido na Fig. 3 de van de Sande) é `P(S)=0.05, P(G)=0.3, P(T)=0.1, P(L0)=0.36` [1]. Van de Sande também demonstra que o BKT só se comporta bem (monotonamente não degenerado) quando `P(G)+P(S) < 1`, e que a sua forma de cadeia de Markov oculta só é identificável até três parâmetros combinados, a menos que seja ajustada com o algoritmo recursivo por observação — um aviso publicado sobre o ajuste de parâmetros, não apenas um detalhe de implementação [1].

### 3. Evidência de eficácia — mista, não uniformemente positiva

O relatório da WWC de junho de 2016 analisou 22 estudos candidatos, 7 dos quais cumpriam os padrões de desenho grupal, abrangendo 12.840 estudantes em 118 locais [3]. Classificações: Cognitive Tutor Algebra I → **efeitos mistos** em álgebra (índice de melhoria +4, intervalo −7 a +19, 5 estudos/12.182 estudantes, evidência “média a grande”) e **sem efeitos discerníveis** no desempenho geral em matemática (+2, 1 estudo, evidência “pequena”); Cognitive Tutor Geometry → **efeitos potencialmente negativos** (−8, 1 estudo, evidência “pequena”) [3]. O ensaio cluster‑randomizado da RAND (Pane et al., 2014) não encontrou diferença no primeiro ano e registou um efeito significativo de +0,21 DP no segundo ano (≈50.º→58.º percentil), atribuído em grande parte à maturidade da implementação [4]. Conclusão: o tamanho do efeito é modesto e dependente da implementação, não constituindo uma vitória garantida apenas pelo algoritmo.

### 4. Deep Knowledge Tracing e a controvérsia da equidade

Piech et al. (2015) introduziram o DKT, modelando sequências de interacções com uma LSTM: AUC 0,86 no ASSISTments (vs. 0,68 BKT) e 0,85 na Khan Academy (vs. 0,68 BKT, 0,63 base marginal) [5], interpretado como prova de que o deep learning domina o BKT. Khajah, Lindsey & Mozer (2016) mostraram que a comparação subestimou o BKT: uma re‑implementação correta atingiu 0,73 (vs. 0,67 reportado) nos mesmos dados, e a extensão do BKT com esquecimento, capacidade por estudante e descoberta de habilidades reduziu a maior parte da diferença [6]. Lição: não assumir que um modelo mais sofisticado supera um modelo simples bem ajustado sem verificação — as exigências de dados/computação do DKT (sequências longas, habilidades opacas) também se alinham mal com um produto que precisa de dificuldade interpretável e amigável ao arranque a frio desde o primeiro dia.

### 5. Análise de Factores de Performance e o Modelo de Factores Aditivos

O AFM (Cen, Koedinger & Junker) modela a correção via regressão logística em três termos aditivos por componente de conhecimento: intercepto de capacidade do estudante, intercepto de facilidade do KC e inclinação de taxa de aprendizagem do KC multiplicada pelas oportunidades prévias [7]. O PFA (Pavlik, Cen & Koedinger, 2009) amplia isto substituindo “contagem de oportunidades” por **contagens separadas de sucessos e falhas pré‑vias** por KC [7][8]. Ambos são ajustados online por regressão logística incremental, não necessitando de passagem EM ou pesquisa em grelha, ao contrário do BKT completo.

### 6. Dificuldade adaptativa baseada em Elo/IRT, e o Math Garden especificamente

A ideia central do IRT: a probabilidade de correção é uma função logística da capacidade latente menos a dificuldade do item (1PL), opcionalmente escalada por discriminação (2PL) e um piso de adivinhação (3PL); o teste adaptativo escolhe, após cada resposta, o item não respondido que maximiza a informação na estimativa de capacidade atual [12]. A “Half‑Life Regression” da Duolingo (Settles & Meeder 2016) está relacionada mas distinta: ajusta uma curva exponencial de esquecimento por item/estudante a partir de características linguísticas/históricas para prever o momento de esquecimento, optimizando o timing de repetição espaçada em vez da seleção baseada em dificuldade [13].

**Math Garden (Rekentuin)**, do departamento de métodos psicológicos da Universidade de Amesterdão (2007), agora comercializado pela Oefenweb/Prowise Learn, é o análogo mais próximo ao objetivo do Math Challenge de pontuar rapidez e exactidão simultaneamente [9]. Aplica uma variante de Elo (1978) em que a capacidade do estudante e a dificuldade do item são re‑estimadas a cada item respondido — sem lote de calibração offline, permitindo calibração instantânea de conteúdo recém‑criado [9]. Os itens na validação de 2011 foram amostrados para visar uma probabilidade média de sucesso de **0,75** [9], exatamente dentro da banda de 70 %–80 % que este projeto pretende, e foram validados empiricamente contra o desempenho real de crianças.

O mecanismo de pontuação — retirado diretamente do artigo de Klinkenberg “High Speed High Stakes Scoring Rule” — remonta a van der Maas & Wagenmakers (2005), que atribuíram a cada item um limite de tempo `d` e pontuaram a resposta como tempo restante vezes exactidão binária: `score = acc · (d − RT)` (0 se incorrecta, respostas mais rápidas pontuam mais se corretas) [10]. Isto premiava a adivinhação arriscada em itens que pareciam demasiado difíceis (adivinhar era gratuito), pelo que Maris & van der Maas (2010) tornaram a exactidão simétrica (`{-1,+1}` em vez de `{0,1}`):

**`score = a_i · (d_i − RT) · (2·acc − 1)`**

onde `d_i` é o limite de tempo do item, `RT` o tempo de resposta, `acc ∈ {0,1}` a exactidão, `a_i` um factor de escala do item — uma resposta rápida e errada torna‑se fortemente negativa, removendo o incentivo a adivinhar e desistir [10]. Maris & van der Maas (2012, *Psychometrika*) demonstraram que, sob esta regra, o modelo implícito de probabilidade de acerto corresponde **exatamente ao modelo IRT 2PL**, com o limite de tempo `d` a atuar como discriminação do item — uma ponte limpa entre uma regra de pontuação em tempo real e o IRT clássico [10]. Validação empírica: as classificações HSHS correlacionaram r=0,78–0,84 com pontuações CITO holandesas em quatro operações aritméticas, e num conjunto de dados de xadrez (CORUS 2008) correlacionaram mais com o Elo FIDE (r=0,808) do que com a soma simples de respostas corretas (r=0,575) [10].

### 7. Mecânica prática de Elo para a seleção adaptativa de itens

A literatura mais ampla sobre Elo em aprendizagem adaptativa (Pelánek, “Applications of the Elo Rating System in Adaptive Educational Systems”) enquadra a mesma atualização bidireccional como no xadrez: após cada tentativa, a classificação do aprendiz e a dificuldade do item movem‑se um ao outro proporcional ao “surpresa” (resultado real menos esperado, função logística da diferença de classificação), escalada por uma “função de incerteza” que desempenha o papel do factor K do xadrez — maior para itens/aprendizes recém‑criados, diminuindo à medida que se acumulam observações [14]. Este é o mecanismo recomendado abaixo.

## Implicações de design para o Math Challenge

1. **Implementar primeiro um modelo Elo/HSHS ao estilo Math‑Garden, e não o BKT completo.** O BKT requer ajuste de parâmetros por competência (busca em grelha ou EM) antes de se comportar de forma sensata [1]; o Elo‑com‑HSHS actualiza a classificação do aprendiz e do item por tentativa de forma fechada, sem calibração offline — ideal para um grande banco de itens em crescimento ao vivo desde o primeiro dia.

2. **Fórmula de pontuação concreta:** para um item cronometrado com limite `d_i` (segundos), tempo de resposta `RT`, correção `acc ∈ {0,1}`: `score = a_i · (d_i − RT) · (2·acc − 1)`, limitando `RT` a `d_i` se ultrapassar o limite [10]. Começar com `a_i = 1` para todos os itens; introduzir discriminação por item apenas quando houver dados suficientes para a estimar (Maris & van der Maas mostram que `a_i`/`d_i` estão entrelaçados com a discriminação 2PL) [10].

3. **Regra de atualização:** `expected = 1 / (1 + 10^(-(ability − difficulty)/400))` (logística Elo padrão), `actual = score / (a_i·d_i)` reescalado para `[0,1]`, depois `ability += K_learner · (actual − expected)` e `difficulty −= K_item · (actual − expected)` [9][14].

4. **Calendário do factor K:** fazer decair a função de incerteza em vez de usar um K constante — grande (por exemplo, ≈0,5–1,0) para as primeiras ~10–20 tentativas de um aprendiz ou item, reduzindo‑se a um estado estável pequeno (≈0,05–0,1) posteriormente, espelhando a gestão de arranque a frio versus estado estável em sistemas educativos baseados em Elo [14]. Rastrear um contador de tentativas por competência do aprendiz e por item para conduzir esta decaída.

5. **A estimativa da dificuldade do item é online por construção:** cada tentativa no item `i` ajusta a sua classificação de dificuldade, pelo que um item recém‑criado obtém uma dificuldade provisória após algumas respostas, sem necessidade de pré‑teste — a maior vantagem prática do Elo sobre BKT/DKT/PFA, que assumem uma taxonomia fixa e/ou um passo de ajuste em lote [1][7][9].

6. **Taxa de sucesso alvo para a seleção de itens: 70–80 %, centrada perto de 75 %**, correspondendo ao alvo validado de .75 do Math Garden [9] e à literatura sobre dificuldade desejável [11]. Ao selecionar o próximo item para a habilidade `θ`, escolher entre os itens cuja dificuldade `β_i` coloca `expected(θ, β_i)` em `[0.70, 0.80]`; amostrar entre os 3–5 itens elegíveis de dificuldade mais próxima em vez de escolher sempre o único mais próximo, para evitar saltos visivelmente repetitivos.

7. **Esquema D1 mínimo por tentativa:** `attempt_id, learner_id, item_id, skill_id(s), timestamp, response_time_ms, time_limit_ms, correct, raw_score, learner_rating_before/after, item_difficulty_before/after, k_factor_used, context flags (input_method, hint_used), sequence_index_in_session`. Guardar as classificações antes/depois (não apenas o estado atual) torna o histórico auditável e reproduzível, e suporta comparações offline contra um experimento posterior BKT/PFA sem re‑instrumentação.

8. **Separar a dificuldade do item dos metadados de dificuldade de conteúdo.** Guardar uma etiqueta de grau/nível atribuída pelo autor independentemente da classificação Elo ao vivo; usá‑la apenas como prior de arranque a frio (semente perto da classificação média dos itens com a mesma etiqueta), deixando a classificação ao vivo assumir após ~10 respostas — isto evita que um item mal etiquetado nunca seja encaminhado a utilizadores que revelariam a sua verdadeira dificuldade.

9. **Objeto Durable para o caminho quente, D1 como o registo.** A atualização O(1) por evento do Elo encaixa num Objeto Durable que mantém a classificação ao vivo de um aprendiz (e uma partição das classificações quentes de itens), gravando cada tentativa como uma linha D1 apenas de anexar; isto evita corridas de leitura‑modificação‑escrita nas linhas de itens partilhadas que um design ingénuo apenas D1 sofre sob concorrência real.

10. **Adiar BKT/PFA/DKT para uma camada v2 de “domínio de competências”, não para a seleção de itens v1.** Quando existir história D1 suficiente, um lote noturno BKT/PFA por competência de granularidade fina pode alimentar painéis de domínio e sinais para os pais — uma superfície diferente da seleção em tempo real, e misturá‑los cedo arrisca repetir a armadilha de justiça DKT/BKT [5][6].

11. **Não esperar que o algoritmo por si só garanta ganhos de aprendizagem.** Os resultados mistos/nulos/negativos do WWC para um produto maduro [3] e o resultado nulo da RAND no primeiro ano [4] mostram que a dificuldade adaptativa é necessária mas não suficiente. Fazer A/B do modelo do aprendiz contra uma escada fixa simples antes de atribuir ganhos de envolvimento especificamente ao Elo.

12. **Proteger contra explorações de adivinhação arriscada.** A transformação `(2·acc−1)` existe para tornar respostas rápidas e erradas custosas [10] — verificar em QA que pressionar respostas aleatórias rapidamente não supera o envolvimento genuíno, especialmente para utilizadores jovens que podem não ler a estrutura de incentivos da mesma forma que um adulto faria.

## Questões abertas para o proprietário do projeto

1. O limite de tempo `d_i` por item deve ser fixado por faixa etária/ano escolar, ou ser ele próprio um parâmetro estimado ao vivo (conforme o resultado de equivalência 2PL)?
2. Para utilizadores muito jovens (idades 4‑6) que podem não operar de forma fiável uma UI de temporizador, o HSHS deve ser aplicado de todo, ou o conteúdo da primeira infância deve usar apenas uma regra de precisão até que a criança alcance uma idade que lhe permita jogar cronometrado?
3. Um escalão Elo global por aprendiz, ou escalões por domínio (aritmética vs. lógica vs. geometria) que não se comparam diretamente?
4. Uma camada noturna de lote BKT/PFA de domínio (§10) está dentro do âmbito do mesmo marco que o selector Elo ao vivo, ou será uma fase posterior?
5. Qual a tolerância de erro de arranque a frio aceitável para itens recém‑criados — quantas respostas são necessárias antes de a classificação de dificuldade ser “fiável” o suficiente para ser encaminhada amplamente?

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
