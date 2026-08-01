# Spacing, Retrieval Practice, and Interleaving Applied to Mathematics

> Math Challenge research — 2026-07-31 — topic 05

## Resumen ejecutivo (ES)

- A prática **intercalada** (misturar tipos de problema em vez de agrupá‑los por blocos) duplica o desempenho em provas de matemática um dia depois, embora piore o desempenho *durante* a própria prática [1][2].
- Em uma sala de aula real de 7º ano (n=140, nove semanas, prova surpresa duas semanas depois), a prática intercalada superou a prática em bloco e os professores a consideraram viável sem materiais extras [2][3].
- Uma dose mais alta de intercalamento produziu pontuações mais altas tanto aos dois dias quanto a um mês (n=126, 7º ano); o benefício não depende de os problemas "se parecerem" entre si [4][5].
- Os Bjork (UCLA) chamam isso de "dificuldade desejável": condições que retardam a aprendizagem aparente, mas melhoram a retenção a longo prazo — espaçamento, intercalamento, recuperação, geração e variação [6][7].
- O "efeito de teste" (Roediger & Karpicke, 2006): recuperar informação da memória fortalece mais do que reler, e a vantagem cresce quanto maior for a demora antes do teste final [8].
- O intervalo de revisão ótimo não é fixo: depende de quanto deve durar a lembrança. Para uma semana, a lacuna ótima é ~20-40% do intervalo; para um ano, ~5-10% [9].
- Algoritmos de repetição espaçada em software real: Leitner (caixas com intervalos crescentes), SM-2 (SuperMemo/Anki clássico, fator de facilidade), FSRS (Anki atual, modela estabilidade/dificuldade/recuperabilidade por cartão), e a regressão de meia‑vida do Duolingo (p = 2^(-Δt/h), melhorou o engajamento diário em 12%) [10][11].
- O "aprendizado de domínio" tradicionalmente exige 80-90% de precisão antes de avançar; evidências recentes sugerem que limites mais altos (0,98) melhoram o desempenho posterior; "N corretas seguidas" (tipicamente 3) é um proxy barato e comum [12][13].
- O esquecimento segue melhor uma curva de lei de potência do que uma exponencial pura — motivo pelo qual o FSRS abandonou a exponencial [10][16].
- Para o Math Challenge recomenda‑se um programador tipo FSRS simplificado por habilidade (não por questão), com intercalamento dentro de cada sessão assim que houver duas ou mais habilidades ativas, e um limiar de domínio de duas etapas (sequência + revisão espaçada bem‑sucedida).

## Executive summary (EN)

- **Prática intercalada** (misturar tipos de problema em vez de bloqueá‑los) aproximadamente duplica as pontuações em testes de matemática no dia seguinte em relação à prática em bloco, embora tenha desempenho pior durante a própria sessão de prática [1][2].
- Um ensaio controlado randomizado em sala de 7º ano (n=140, nove semanas, teste não anunciado duas semanas depois) constatou que a prática intercalada superou a prática em bloco, e os professores a consideraram viável sem materiais extras [2][3]. Um estudo de dose‑resposta (n=126) encontrou que mais intercalamento produziu pontuações melhores tanto com atrasos de 2 dias quanto de 1 mês, e o efeito não se limita a tipos de problema superficialmente semelhantes [4][5].
- Robert & Elizabeth Bjork (UCLA) enquadram isso como **"dificuldades desejáveis"**: condições que retardam a aquisição, mas melhoram a retenção a longo prazo — espaçamento, intercalamento, prática de recuperação, geração e prática variada têm as evidências mais fortes [6][7].
- O **efeito de teste** (Roediger & Karpicke, 2006): recuperar uma resposta da memória supera a releitura, e a vantagem cresce com a demora antes do teste final [8].
- Cepeda et al. (2008, *Psychological Science*, >1.350 participantes): o **gap de espaçamento ótimo escala com a meta de retenção** — aproximadamente 20-40% de um objetivo de 1 semana, reduzindo para 5-10% de um objetivo de 1 ano ("linha de crista temporal") [9].
- Algoritmos de agendamento de software: **Leitner** (5 caixas, intervalos ~1/2/4/7/14 dias, reinicia ao errar) [14]; **SM-2** (fator de facilidade 1,3-2,5, intervalos 1, 6, depois anterior×facilidade) [15]; **FSRS** (padrão atual do Anki — estabilidade/dificuldade/recuperabilidade por cartão, curva de esquecimento de lei de potência, ~19-21 pesos ajustados, alvo de "retenção desejada" único para o usuário ~0,90) [10]; **Half‑Life Regression** do Duolingo (p = 2^(-Δt/h), reduziu o erro de previsão em 45%+ vs. linhas de base, aumentou o engajamento em 12% ao vivo) [11].
- **Aprendizagem por domínio** tradicionalmente usa 80-90% de acurácia para avançar (Bloom); pesquisas em sistemas adaptativos encontram limites mais altos (~0,98) que melhoram o desempenho subsequente; "N corretas seguidas" (geralmente 3) é um proxy barato e comum [12][13].
- O esquecimento segue uma curva de lei de potência/logarítmica melhor que o decaimento exponencial puro — perda acentuada no início, cauda achatada — o que explica por que o FSRS se afastou das curvas exponenciais [10][16].
- Habilidade matemática procedural (fluência de fatos, execução de algoritmos) beneficia‑se especialmente do intercalamento porque treina a *discriminação de estratégias*, não apenas a memorização; a compreensão conceitual ganha com o espaçamento e com o efeito de transferência do intercalamento quando múltiplos conceitos estão em jogo [1][2][6].

## Resultados

### 1. Prática intercalada em matemática (Rohrer & Taylor)

Os estudos de laboratório de Rohrer e Taylor fizeram crianças praticarem quatro tipos de problemas de matemática, seja em blocos (AAAA BBBB) ou intercalados (ABCD ABCD). O intercalamento *prejudicou* o desempenho durante a sessão, mas **dobrou as pontuações nos testes do dia seguinte** [1] — o padrão característico de uma dificuldade desejável.

Taylor & Rohrer (2010, *Applied Cognitive Psychology*) conduziram um ECR em sala de aula: 7.º ano (n=140) recebeu prática bloqueada ou intercalada ao longo de nove semanas, sendo testado sem aviso duas semanas depois. O material praticado de forma intercalada obteve pontuação maior [2][3].

Rohrer, Dedrick & Stershic (2015, *J. Educational Psychology* 107(3), 900-908) conduziram um ECR de dose‑resposta (n=126, 7.º ano): uma dose maior de intercalamento nas mesmas folhas de exercícios aumentou as pontuações tanto em atrasos de ~2‑dias quanto de 1‑mês, sem tempo extra de prática [4]. O benefício não é um artefato da semelhança superficial entre os tipos de problema — ele persiste mesmo quando os problemas intercalados parecem bastante diferentes, consistente com o treinamento de intercalamento de *seleção de estratégia*, não de memorização mecânica [5]. Pesquisas com professores avaliaram o intercalamento como altamente viável — requer apenas reordenar os problemas existentes [2][3].

### 2. Dificuldades desejáveis de Bjork (UCLA)

Robert & Elizabeth Bjork (1994) cunharam o termo "dificuldades desejáveis": condições que retardam a *aquisição* costumam melhorar a *retenção e transferência* a longo prazo, porque o desempenho durante a aprendizagem e a própria aprendizagem são dissociáveis [6]. Cinco dificuldades têm forte evidência: espaçamento, intercalamento, prática de recuperação, geração e prática variada [7]. O design instrucional otimizado para sessões suaves e sem erros (repetição massiva, bloqueio, releitura) produz aprendizagem que parece boa, mas não perdura.

### 3. O efeito de teste (Roediger & Karpicke)

Roediger & Karpicke (2006) compararam estudo repetido versus teste repetido do mesmo material. Imediatamente depois, os estudantes apresentaram melhor desempenho (~83 % vs. ~71 % de recordação); uma semana depois o padrão se inverteu (~40 % vs. ~61 %) [8]. O benefício da prática de recuperação aumenta com o atraso antes do teste criterial — o mesmo padrão do intercalamento. Implicação: um ciclo "resposta, depois feedback" deve ser o evento principal de aprendizagem, não uma avaliação acrescentada à instrução.

### 4. Intervalos ótimos de espaçamento — a linha de crista temporal de Cepeda et al.

Cepeda, Vul, Rohrer, Wixted & Pashler (2008, *Psychological Science*, >1.350 participantes) variaram o intervalo entre estudo e reaprendizagem e testaram a retenção até um ano depois. O intervalo ótimo **não é fixo** — como fração do atraso final do teste, ele varia ~20‑40 % para um objetivo de 1 semana até ~5‑10 % para um objetivo de 1 ano [9]. Fazer maratona de estudo antes de um questionário que você precisa lembrar por um ano gera subespaçamento; revisões espaçadas um mês apartadas para lembrar algo por uma semana geram sobreespaçamento — exatamente a tensão que os agendadores adaptativos (SM-2, FSRS, HLR) buscam resolver.

### 5. Algoritmos de repetição espaçada usados em softwares reais

**Leitner (1972).** Os cartões ficam em caixas (clássicamente 5) com cadências fixas (~1, 2, 4, 7, 14 dias); uma resposta correta promove o cartão, uma incorreta o reinicia para a caixa 1 [14].

**SM-2 (Woźniak, 1987).** Cada item tem um fator de facilidade (EF), iniciando em 2,5, com piso em 1,3. Intervalos: I(1)=1, I(2)=6, I(n)=I(n‑1)×EF a partir daí. Uma avaliação de qualidade de 0‑5 ajusta o EF via EF' = EF + (0,1 − (5−Q)×(0,08 + (5−Q)×0,02)); Q<3 reinicia o item [15].

**FSRS (padrão atual do Anki).** Monitora três variáveis de estado por cartão: **Estabilidade** S (dias até que a probabilidade de recordação decaia para 90 %), **Dificuldade** D (1‑10) e **Recuperabilidade** R (0‑1, decaindo segundo uma curva de lei de potência, não exponencial). Um único ajuste, **retenção desejada** (tipicamente 0,85‑0,95, padrão ~0,90), dirige o agendador a inverter a curva de esquecimento e escolher o intervalo onde o R previsto atinge esse alvo. FSRS‑6 ajusta ~19‑21 pesos por aprendiz a partir do histórico de revisões via descida de gradiente, superando o fator de facilidade fixo do SM‑2 quando há dados suficientes (~1.000+ revisões) [10].

**Half-Life Regression (Duolingo; Settles & Meeder, 2016, ACL).** Modela a meia‑vida de memória h de cada item como uma função log‑linear das contagens prévias de acertos/erros; probabilidade de recordação p = 2^(−Δt/h) — uma curva exponencial explícita (em comparação à lei de potência do FSRS). Reduziu o erro de previsão em mais de 45 % em relação às linhas de base e aumentou o engajamento diário em 12 % em um teste A/B ao vivo [11].

**Fio condutor.** Todos os quatro agendam a próxima exposição para o momento em que a probabilidade de recordação está prestes a cruzar um limiar alvo — não antes (repetição desperdiçada), não muito depois (já esquecido). Eles diferem quanto a a curva de esquecimento ser fixa (Leitner, SM‑2) ou ajustada por item/aprendiz (FSRS, HLR), e quanto ao formato exponencial versus lei de potência.

### 6. Limiares de aprendizagem por domínio

A aprendizagem por domínio de Bloom exige ~80‑90 % de acurácia antes de avançar, com remediação abaixo do limiar [12][13]. Um substituto barato e comum, especialmente em programas de fluência factual K‑12, é "N corretas consecutivas" (geralmente 3), que reinicia imediatamente ao errar [13]. Pesquisas recentes de tutoria adaptativa descobriram que elevar a barra de domínio de ~0,95 para ~0,98 de probabilidade de domínio estimada melhorou o desempenho em lições subsequentes dependentes — o limiar tradicional subestima o conteúdo pré‑requisito [12]. A literatura de fluência factual enfatiza que o domínio deve ser avaliado *após um intervalo*, não apenas na sessão de treinamento, pois a acurácia de recordação imediata superestima o domínio duradouro [13].

### 7. Curvas de esquecimento

A curva clássica de Ebbinghaus: perda acentuada no início (~42 % esquecido em 20 minutos, ~67 % em 24 horas) seguida por uma longa cauda de achatamento [16]. Ebbinghaus modelou isso como aproximadamente exponencial, mas o consenso moderno — e a razão pela qual o FSRS substituiu seu próprio modelo exponencial por uma curva de lei de potência no FSRS‑4.5/6 — é que o esquecimento real desacelera mais rápido do que a decaimento exponencial puro prevê [16][10].

### 8. Habilidade matemática procedural vs. conceitual

O trabalho de Rohrer/Taylor foca na habilidade *procedural*: qual método se aplica a qual problema. O benefício do intercalamento é teorizado como proveniente da **prática de discriminação** — notar qual estratégia um problema exige, algo que a prática bloqueada nunca requer, pois o bloco revela a estratégia [1][2][5]. Para a compreensão *conceitual*, o espaçamento e a prática de recuperação ainda ajudam via o mesmo mecanismo de fortalecimento de traço, mas o intercalamento acrescenta valor de transferência — reconhecer a aplicabilidade de um conceito em um contexto novo e misto [6][7][8]. Em resumo: a fluência procedural requer recuperação espaçada *e* intercalada; a compreensão conceitual requer recuperação espaçada e ganha ainda mais com o intercalamento quando múltiplos conceitos estão ativos.

## Implicações de design para o Desafio de Matemática

1. **Agendar por nó de habilidade, não por questão.** Acompanhe unidades como “subtração de 2 dígitos com empréstimo” como a entidade agendável — as habilidades matemáticas se generalizam em muitas instâncias de questões, ao contrário de flashcards.

2. **Algoritmo recomendado concreto: FSRS-lite com início frio Leitner.** Novas habilidades com <20 pontos de dados usam uma escada simples ao estilo Leitner (1 → 3 → 7 → 16 → 35 dias, reinicia ao erro, sem ajuste necessário). Quando houver tentativas suficientes, troque para um modelo estilo FSRS semeado com os pesos padrão publicados do FSRS‑6, refazendo o ajuste periodicamente offline. Exponha um único parâmetro ajustável: **retenção desejada = 0,90** por padrão, ajustável por faixa etária (0,85 para as idades mais jovens a fim de reduzir frustração, 0,92+ para usuários mais velhos/competitivos).

3. **Limiar de domínio em duas etapas.** Exija **3 respostas corretas consecutivas em dificuldade crescente** dentro de uma habilidade como sinal de “aprendido provisoriamente” (a convenção comum de fluência de fatos [13]), mas não marque a habilidade como “dominada” para agendamento até que ela também sobreviva a **uma revisão espaçada correta com intervalo ≥3‑dia** — codificando diretamente a lição do efeito teste de que sequências de recall imediato superestimam a aprendizagem durável.

4. **Nunca bloquear a prática por habilidade quando 2+ habilidades estiverem em rotação.** Quando uma segunda habilidade estiver pendente de revisão, intercale‑a com a lição atual na mesma sessão (ABAB/ABCABC), em vez de terminar os problemas de uma habilidade antes de iniciar a próxima — a mudança de maior alavancagem e custo zero que a literatura apoia [1][2][4].

5. **Proporção de interleaving na sessão: ~40‑60 % de novo/atual‑lição misturado com ~40‑60 % de revisão pendente**, extraído de 2‑4 outras habilidades, misturado ao nível da questão (não blocos de 3‑4 problemas do mesmo tipo). Para pré‑K/K, favoreça 70/30 novo/revisão e intercale no máximo 2 habilidades, dadas as restrições de memória de trabalho que a literatura de dificuldades desejáveis aponta como condição limite [6][7].

6. **Revisões são sempre recuperação, nunca reexposição passiva.** Um evento de revisão exige que a criança produza uma resposta antes que qualquer explicação seja mostrada, mesmo para material “já aprendido” [8].

7. **Escalar os intervalos de revisão ao tempo que a habilidade precisa durar, não a uma cadência fixa de calendário.** Classifique habilidades como “de unidade” (intervalos mais curtos, ~20‑30 % da janela de retenção) vs. “fundamentais” (intervalos progressivamente maiores, ~5‑10 % de um horizonte de um ano quando bem estabelecidas), conforme a linha de crista de Cepeda [9].

8. **Acompanhar Dificuldade separadamente da Estabilidade por habilidade**, como faz o FSRS, de modo que uma criança que tem dificuldade receba tanto um próximo intervalo mais curto quanto ganhos de estabilidade menores por resposta correta comparado a quem achou fácil — evitando que um algoritmo de facilidade fixa trate um chute acertado como domínio genuíno.

9. **Modelar o esquecimento com curva de lei de potência, não exponencial puro**, para estimativas de colocação/dificuldade adaptativa de “quanto esta criança esqueceu desde a última prática” — uma exponencial pura superestima o esquecimento em atrasos longos e subestima logo após a aprendizagem [16][10].

10. **Instrumentar assinaturas Rohrer como métricas internas.** Acompanhe acurácia na mesma sessão e acurácia de recall retardado (por exemplo, um pequeno quiz de aquecimento sobre habilidades de ontem) como KPIs separados; espere que a acurácia em sessões intercaladas às vezes pareça *mais baixa* que em sessões bloqueadas enquanto a acurácia retardada é maior — não deixe que uma queda na acurácia da mesma sessão dispare a volta ao bloqueio.

11. **Reportar “praticado” vs. “aprendido” separadamente para pais/professores.** Exiba o sinal de domínio em duas etapas (item 3) em vez da acurácia bruta da sessão, evitando a armadilha onde uma sequência no mesmo dia parece domínio e depois falha na próxima revisão não anunciada.

12. **Feedback do tutor de IA deve provocar recuperação antes de revelar soluções.** Em resposta a um erro, ofereça primeiro uma dica estruturada para recuperação (efeito geração [6][7]); reserve exemplos totalmente resolvidos para uma segunda tentativa errada.

## Perguntas abertas para o proprietário do projeto

1. O estado de agendamento deve viver por criança‑por‑habilidade apenas, ou devemos também manter um ajuste de parâmetros FSRS a nível populacional para semear os agendamentos de novas crianças antes que existam dados suficientes delas?
2. A retenção desejada deve ser um valor fixo de 0,90 em toda a plataforma, ou um parâmetro ajustável para usuários mais velhos/nível de doutorado, como o Anki expõe a usuários avançados?
3. A rotulagem de habilidades “de unidade” vs. “fundamentais” deve ser criada manualmente por nó curricular, ou inferida a partir da profundidade do grafo de pré‑requisitos?
4. A proporção de interleaving interage com o sistema de sinal comportamental anti‑trapaça — a mistura de tipos de habilidade facilita ou dificulta a detecção de padrões de tempo?
5. A barra de domínio em duas etapas (sequência + revisão retardada) deve bloquear a progressão para a próxima unidade curricular, ou afetar apenas o agendamento de revisões enquanto a progressão permanece baseada em outro limiar de acurácia?

## Fontes

1. Rohrer & Taylor, “The shuffling of mathematics problems improves learning” — http://uweb.cas.usf.edu/~drohrer/pdfs/Rohrer&Taylor2007IS.pdf  
2. Taylor & Rohrer (2010), “The effects of interleaved practice,” *Applied Cognitive Psychology* 24, 837‑848 — https://onlinelibrary.wiley.com/doi/abs/10.1002/acp.1598  
3. IES WWC Study 89950, interleaved mathematics practice classroom RCT — https://ies.ed.gov/ncee/wwc/Study/89950  
4. Rohrer, Dedrick & Stershic (2015), “Interleaved practice improves mathematics learning,” *Journal of Educational Psychology* 107(3), 900‑908 — https://files.eric.ed.gov/fulltext/ED557355.pdf  
5. Rohrer et al. (2014), “The benefit of interleaved mathematics practice is not limited to superficially similar kinds of problems” — https://pubmed.ncbi.nlm.nih.gov/24578089/  
6. Bjork & Bjork (2011), “Making things hard on yourself, but in a good way: Creating desirable difficulties to enhance learning” — https://mirjamglessmer.com/2026/03/07/currently-reading-bjork-bjork-2011-on-making-things-hard-on-yourself-but-in-a-good-way-creating-desirable-difficulties-to-enhance-learning/  
7. “Desirable Difficulties: Bjork's 5 Principles” — https://www.structural-learning.com/post/desirable-difficulties  
8. Roediger & Karpicke (2006), “Test-Enhanced Learning” / “The Power of Testing Memory,” *Perspectives on Psychological Science* 1(3), 181‑210 — https://journals.sagepub.com/doi/10.1111/j.1467-9280.2006.01693.x  
9. Cepeda, Vul, Rohrer, Wixted & Pashler (2008), “Spacing Effects in Learning: A Temporal Ridgeline of Optimal Retention,” *Psychological Science* — https://laplab.ucsd.edu/articles/Cepeda%20et%20al%202008_psychsci.pdf  
10. Documentação do algoritmo FSRS — https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm and https://github.com/open-spaced-repetition/awesome-fsrs/wiki/The-Algorithm  
11. Settles & Meeder (2016), “A Trainable Spaced Repetition Model for Language Learning,” ACL — https://research.duolingo.com/papers/settles.acl16.pdf ; código — https://github.com/duolingo/halflife-regression/blob/master/README.md  
12. “How Much Mastery is Enough Mastery?” EDM 2025 — https://educationaldatamining.org/EDM2025/proceedings/2025.EDM.short-papers.4/index.html  
13. “The Importance of Math Fact Fluency: Evidence-Informed Classroom Practices” — https://www.ldatschool.ca/the-importance-of-math-fact-fluency-evidence-informed-classroom-practices/  
14. Visão geral do sistema Leitner — https://e-student.org/leitner-system/ and https://supermemo.guru/wiki/Leitner_system  
15. Especificação original do algoritmo SuperMemo SM‑2 — https://super-memory.com/english/ol/sm2.htm  
16. Curva de esquecimento de Ebbinghaus — https://www.flashcardify.me/blog/ebbinghaus-forgetting-curve and https://www.structural-learning.com/post/ebbinghaus-forgetting-curve
