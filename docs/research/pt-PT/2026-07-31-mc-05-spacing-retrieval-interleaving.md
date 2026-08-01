# Espaçamento, prática de evocação e intercalação aplicados à matemática

> Math Challenge research — 2026-07-31 — topic 05

## Resumo executivo (ES)

- A prática **intercalada** (misturar tipos de problema em vez de os agrupar por blocos) duplica o desempenho em testes de matemática no dia seguinte, embora diminua o desempenho *durante* a própria prática [1][2].
- Numa turma real de 7.º ano (n=140, nove semanas, teste surpresa duas semanas depois), a prática intercalada superou a prática em bloco e os professores consideraram‑na viável sem material extra [2][3].
- Uma dose mais alta de intercalação produziu pontuações mais altas tanto a dois dias como a um mês (n=126, 7.º ano); o benefício não depende de os problemas se “parecerem” entre si [4][5].
- Os Bjork (UCLA) chamam isto de “dificuldade desejável”: condições que retardam a aprendizagem aparente mas melhoram a retenção a longo prazo — espaçamento, intercalação, recuperação, geração e variação [6][7].
- O “efeito de teste” (Roediger & Karpicke, 2006): recuperar informação da memória fortalece mais do que reler, e a vantagem aumenta quanto maior for a demora antes do teste final [8].
- O intervalo de revisão ótimo não é fixo: depende de quanto deve durar a recordação. Para uma semana, a lacuna ótima é ~20‑40 % do intervalo; para um ano, ~5‑10 % [9].
- Algoritmos de repetição espaçada em software real: Leitner (caixas com intervalos crescentes), SM‑2 (SuperMemo/Anki clássico, fator de facilidade), FSRS (Anki atual, modela estabilidade/dificuldade/recuperabilidade por cartão) e a regressão de meia‑vida da Duolingo (p = 2^(-Δt/h), melhorou o envolvimento diário em 12 %) [10][11].
- A “aprendizagem de domínio” tradicionalmente exige 80‑90 % de precisão antes de avançar; evidências recentes sugerem que limiares mais altos (0,98) melhoram o desempenho subsequente; “N corretas consecutivas” (tipicamente 3) é um proxy barato e comum [12][13].
- O esquecimento segue melhor uma curva de lei de potência do que uma exponencial pura — motivo pelo qual o FSRS abandonou a exponencial [10][16].
- Para o Math Challenge recomenda‑se um programador tipo FSRS simplificado por competência (não por questão), com intercalação dentro de cada sessão assim que houver duas ou mais competências ativas, e um limiar de domínio de duas etapas (sequência + revisão espaçada bem‑sucedida).

## Resumo executivo (EN)

- **Prática intercalada** (misturar tipos de problema em vez de os agrupar por blocos) praticamente duplica as pontuações nos testes de matemática no dia seguinte em relação à prática em bloco, embora tenha pior desempenho durante a própria sessão de prática [1][2].
- Um ensaio clínico aleatorizado em turma de 7.º ano (n=140, nove semanas, teste não anunciado duas semanas depois) constatou que a prática intercalada superou a prática em bloco, e os professores consideraram‑na viável sem material extra [2][3]. Um estudo de dose‑resposta (n=126) revelou que maior intercalação produziu pontuações melhores tanto com atrasos de 2 dias como de 1 mês, e o efeito não se limita a tipos de problema superficialmente semelhantes [4][5].
- Robert & Elizabeth Bjork (UCLA) enquadram isto como **“dificuldades desejáveis”**: condições que retardam a aquisição mas melhoram a retenção a longo prazo — espaçamento, intercalação, prática de recuperação, geração e prática variada têm a evidência mais robusta [6][7].
- O **efeito de teste** (Roediger & Karpicke, 2006): recuperar uma resposta da memória supera a releitura, e a vantagem aumenta com a demora antes do teste final [8].
- Cepeda et al. (2008, *Psychological Science*, >1.350 participantes): o **intervalo de espaçamento ótimo escala com o objetivo de retenção** — aproximadamente 20‑40 % de uma meta de 1 semana, reduzindo para 5‑10 % de uma meta de 1 ano (“linha de crista temporal”) [9].
- Algoritmos de agendamento de software: **Leitner** (5 caixas, intervalos ~1/2/4/7/14 dias, reinicia ao erro) [14]; **SM‑2** (fator de facilidade 1,3‑2,5, intervalos 1, 6, depois anterior×facilidade) [15]; **FSRS** (padrão atual do Anki — por cartão Estabilidade/Dificuldade/Recuperabilidade, curva de esquecimento de lei de potência, ~19‑21 pesos ajustados, alvo de “retenção desejada” visível ao utilizador ~0,90) [10]; **Half‑Life Regression da Duolingo** (p = 2^(-Δt/h), redução do erro de predição >45 % face a linhas de base, aumento do envolvimento em 12 % ao vivo) [11].
- O **aprendizado por domínio** tradicionalmente usa 80‑90 % de precisão para avançar (Bloom); pesquisas em sistemas adaptativos encontram limiares mais altos (~0,98) que melhoram o desempenho subsequente; “N corretas consecutivas” (geralmente 3) é um proxy barato e comum [12][13].
- O esquecimento segue melhor uma curva de lei de potência/logarítmica do que um decaimento exponencial puro — perda acentuada no início, cauda aplanada — razão pela qual o FSRS abandonou as curvas exponenciais [10][16].
- A competência matemática procedural (fluência de factos, execução de algoritmos) beneficia‑se especialmente da intercalação porque treina a *discriminação de estratégias*, não apenas a recordação; a compreensão conceptual ganha com o espaçamento e com o efeito de transferência da intercalação quando múltiplos conceitos estão em jogo [1][2][6].

## Constatações

### 1. Prática intercalada em matemática (Rohrer & Taylor)

Os estudos de laboratório de Rohrer e Taylor fizeram crianças praticarem quatro tipos de problemas de matemática, ou de forma bloqueada (AAAA BBBB) ou intercalada (ABCD ABCD). A intercalação *prejudicou* o desempenho durante a sessão, mas **dobrou as pontuações nos testes no dia seguinte** [1] — o padrão típico de uma dificuldade desejável.

Taylor & Rohrer (2010, *Applied Cognitive Psychology*) realizaram um RCT em sala de aula: 7.º ano (n = 140) recebeu prática bloqueada ou intercalada ao longo de nove semanas, testado sem aviso duas semanas depois. O material praticado de forma intercalada obteve pontuações mais altas [2][3].

Rohrer, Dedrick & Stershic (2015, *J. Educational Psychology* 107(3), 900‑908) conduziram um RCT dose‑resposta (n = 126, 7.º ano): uma dose maior de intercalação nos mesmos exercícios aumentou as pontuações tanto com atrasos de ~2 dias como de 1 mês, sem tempo extra de prática [4]. O benefício não é um artefacto de semelhança superficial entre os tipos de problema — mantém‑se mesmo quando os problemas intercalados parecem bastante diferentes, coerente com a intercalação a treinar a *seleção de estratégia*, não a memorização mecânica [5]. Inquéritos a professores avaliaram a intercalação como altamente viável — requer apenas reordenar os problemas existentes [2][3].

### 2. Dificuldades desejáveis de Bjork (UCLA)

Robert & Elizabeth Bjork (1994) cunharam o termo “dificuldades desejáveis”: condições que retardam a *aquisição* costumam melhorar a *retenção e transferência a longo prazo*, porque o desempenho‑enquanto‑aprende e o próprio aprendizado são dissociáveis [6]. Cinco dificuldades têm forte evidência: espaçamento, intercalação, prática de recuperação, geração e prática variada [7]. O design instrucional otimizado para sessões suaves e sem erros (repetição massiva, bloqueio, releitura) produz aprendizagem que parece boa mas não perdura.

### 3. O efeito de teste (Roediger & Karpicke)

Roediger & Karpicke (2006) compararam estudo repetido com teste repetido do mesmo material. Imediatamente depois, os estudantes pareciam melhores (~83 % vs. ~71 % de recordação); uma semana depois o padrão inverteu (~40 % vs. ~61 %) [8]. O benefício da prática de recuperação cresce com o atraso antes do teste criterial — o mesmo padrão da intercalação. Implicação: um ciclo “resposta, depois feedback” deve ser o principal evento de aprendizagem, não uma avaliação acrescentada à instrução.

### 4. Intervalos ótimos de espaçamento — a linha de crista temporal de Cepeda et al.

Cepeda, Vul, Rohrer, Wixted & Pashler (2008, *Psychological Science*, >1.350 participantes) variaram o intervalo entre estudo e reaprendizagem e testaram a retenção até um ano depois. O intervalo ótimo **não é fixo** — como fração do atraso final do teste, situa‑se entre ~20‑40 % para um objetivo de 1 semana até ~5‑10 % para um objetivo de 1 ano [9]. “Cramming” antes de um questionário que se pretende lembrar durante um ano sub‑espacia; espaçar revisões a um mês de intervalo para lembrar algo durante uma semana sobre‑espacia — exatamente a tensão que os agendadores adaptativos (SM‑2, FSRS, HLR) pretendem resolver.

### 5. Algoritmos de repetição espaçada usados em software real

**Leitner (1972).** Os cartões vivem em caixas (clássico 5) com cadências fixas (~1, 2, 4, 7, 14 dias); uma resposta correta promove, uma incorreta devolve à caixa 1 [14].

**SM‑2 (Woźniak, 1987).** Cada item tem um fator de facilidade (EF), começando em 2,5, com piso em 1,3. Intervalos: I(1)=1, I(2)=6, I(n)=I(n‑1)×EF a partir daí. Uma classificação de qualidade 0‑5 ajusta o EF via EF' = EF + (0,1 − (5−Q)×(0,08 + (5−Q)×0,02)); Q<3 devolve o item [15].

**FSRS (padrão atual do Anki).** Rastreia três variáveis de estado por cartão: **Estabilidade** S (dias até a probabilidade de recordação decair para 90 %), **Dificuldade** D (1‑10) e **Recuperabilidade** R (0‑1, decaindo segundo uma curva de lei de potência, não exponencial). Um único controlo, **retenção desejada** (tipicamente 0,85‑0,95, predefinição ~0,90), conduz o agendador a inverter a curva de esquecimento e escolher o intervalo onde a R prevista atinge esse alvo. O FSRS‑6 ajusta ~19‑21 pesos por aprendiz a partir do histórico de revisões via descida de gradiente, superando o fator de facilidade fixo do SM‑2 quando há dados suficientes (~1.000+ revisões) [10].

**Half‑Life Regression (Duolingo; Settles & Meeder, 2016, ACL).** Modela a meia‑vida de memória h de cada item como uma função log‑linear das contagens prévias corretas/incorretas; probabilidade de recordação p = 2^(−Δt/h) — uma curva exponencial explícita (vs. a lei de potência do FSRS). Reduz o erro de predição em >45 % vs. linhas de base e aumentou o envolvimento diário em 12 % num teste A/B ao vivo [11].

**Fio condutor.** Todos os quatro agendam a próxima exposição para o momento em que a probabilidade de recordação está prestes a cruzar um limiar‑alvo — não antes (repetição desperdiçada), não muito depois (já esquecido). Diferem se a curva de esquecimento é fixa (Leitner, SM‑2) ou ajustada por item/aprendiz (FSRS, HLR), e se a forma é exponencial ou lei de potência.

### 6. Limiares de aprendizagem de mestria

A aprendizagem de mestria de Bloom pede ~80‑90 % de exactidão antes de avançar, com remediação abaixo do limiar [12][13]. Um proxy barato comum, sobretudo em programas de fluência factual K‑12, é “N corretas consecutivas” (geralmente 3), que reinicia limpo ao errar [13]. Investigação recente em tutoria adaptativa encontrou que elevar a barra de mestria de ~0,95 para ~0,98 de probabilidade estimada de mestria melhorou o desempenho em lições subsequentes dependentes — o limiar tradicional subestima o conteúdo pré‑requisito [12]. A literatura sobre fluência factual sublinha que a mestria deve ser avaliada *após um intervalo*, não apenas na sessão de treino, pois a exactidão de recordação imediata superestima a mestria duradoura [13].

### 7. Curvas de esquecimento

A curva clássica de Ebbinghaus: perda acentuada no início (~42 % esquecido em 20 minutos, ~67 % em 24 horas) seguida de uma longa cauda aplanada [16]. Ebbinghaus modelou isto como aproximadamente exponencial, mas o consenso moderno — e a razão pela qual o FSRS substituiu o seu próprio modelo exponencial por uma curva de lei de potência no FSRS‑4,5/6 — é que o esquecimento real desacelera mais rapidamente do que a decaída exponencial pura prevê [16][10].

### 8. Habilidade matemática procedural vs. conceptual

O trabalho de Rohrer/Taylor foca a habilidade *procedural*: que método aplicar a cada problema. O benefício da intercalação é teoricamente proveniente da **prática de discriminação** — notar que estratégia um problema requer, algo que a prática bloqueada nunca exige, pois o bloco revela a estratégia [1][2][5]. Para a compreensão *conceptual*, o espaçamento e a prática de recuperação ainda ajudam via o mesmo mecanismo de reforço de traço, mas a intercalação acrescenta valor de transferência — reconhecer a aplicabilidade de um conceito num contexto misto e novel [6][7][8]. Em suma: a fluência procedural requer recuperação espaçada *e* intercalada; a compreensão conceptual beneficia da recuperação espaçada e ganha ainda mais com a intercalação quando múltiplos conceitos estão ativos.

## Implicações de design para o Math Challenge

1. **Agendar por nó de competência, não por questão.** Monitorizar unidades como “subtração de 2 dígitos com empréstimo” como a entidade programável — as competências de matemática generalizam‑se por muitas instâncias de questões, ao contrário dos flashcards.

2. **Algoritmo recomendado concreto: FSRS‑lite com arranque a frio Leitner.** Novas competências com <20 pontos de dados utilizam uma escada simples ao estilo Leitner (1 → 3 → 7 → 16 → 35 dias, reiniciar após resposta errada, sem necessidade de ajuste). Quando se acumulam tentativas suficientes, mudar para um modelo ao estilo FSRS semeado com os pesos predefinidos do FSRS‑6 publicados, reajustando periodicamente offline. Expor um parâmetro ajustável: **retenção desejada = 0,90** por defeito, ajustável por nível de série (0,85 para as idades mais jovens para reduzir a frustração, 0,92+ para utilizadores mais velhos/competitivos).

3. **Limite de domínio em duas fases.** Exigir **3 corretas consecutivas com dificuldade crescente** dentro de uma competência como sinal de “aprendido provisoriamente” (a convenção comum de fluência de factos [13]), mas não marcar uma competência como “dominada” para agendamento até que também sobreviva a **uma revisão espaçada correta com um intervalo ≥3 dias** — codificando diretamente a lição do efeito de teste que sequências de recordação imediata exageram a aprendizagem duradoura.

4. **Nunca bloquear a prática por competência quando houver 2+ competências em rotação.** Quando uma segunda competência está programada para revisão, intercalar‑a com a lição atual na mesma sessão (ABAB/ABCABC), em vez de terminar os problemas de uma competência antes de iniciar a seguinte — a única mudança de maior impacto e custo zero que a literatura apoia [1][2][4].

5. **Rácio de interlevação na sessão: ~40‑60 % novo/aula‑atual misturado com ~40‑60 % a rever**, extraído de 2‑4 outras competências, misturado ao nível da questão (não blocos de 3‑4 problemas do mesmo tipo). Para pré‑K/K, inclinar para 70/30 novo/revisão e intercalar no máximo 2 competências, dadas as restrições de memória de trabalho que a literatura sobre dificuldades desejáveis identifica como condição limite [6][7].

6. **As revisões são sempre de recuperação, nunca de reexposição passiva.** Um evento de revisão obriga a criança a produzir uma resposta antes de qualquer explicação ser mostrada, mesmo para material “já aprendido” [8].

7. **Escalar os intervalos de revisão à duração necessária da competência, não a um calendário fixo.** Etiquetar competências como “unit‑scoped” (intervalos mais curtos, ~20‑30 % da janela de retenção) versus “foundational” (intervalos progressivamente mais amplos, ~5‑10 % de um horizonte de um ano, uma vez bem estabelecida), segundo a linha de crista de Cepeda [9].

8. **Monitorizar Dificuldade separadamente da Estabilidade por competência**, como faz o FSRS, para que uma criança que tem dificuldades receba tanto um intervalo seguinte mais curto como ganhos de estabilidade menores por resposta correta do que quem a achou fácil — evitando que um algoritmo de facilidade fixa trate um palpite acertado da mesma forma que um domínio genuíno.

9. **Modelar o esquecimento com uma curva de lei de potência, não exponencial pura**, para estimativas de colocação/dificuldade adaptativa de “quanto esta criança esqueceu desde a última prática” — uma exponencial pura superestima o esquecimento em atrasos longos e subestima‑o logo após a aprendizagem [16][10].

10. **Instrumentar ambas as assinaturas de Rohrer como métricas internas.** Monitorizar a precisão na mesma sessão e a precisão de recordação retardada (por exemplo, um pequeno questionário de aquecimento sobre as competências de ontem) como KPIs separados; esperar que a precisão em sessões intercaladas pareça às vezes *mais baixa* do que em sessões bloqueadas, enquanto a precisão retardada é maior — não deixar que uma queda na precisão da mesma sessão desencadeie o regresso ao bloqueio.

11. **Reportar “praticado” vs. “aprendido” separadamente a pais/professores.** Evidenciar o sinal de domínio em duas fases (item 3) em vez da precisão bruta da sessão, evitando a armadilha em que uma sequência no mesmo dia parece domínio e depois falha na revisão não anunciada seguinte.

12. **O feedback do tutor IA deve incitar a recuperação antes de revelar as soluções.** Após uma resposta errada, dar primeiro uma pista estruturada para recuperação (efeito de geração [6][7]); reservar exemplos completos resolvidos para uma segunda tentativa errada.

## Questões abertas para o proprietário do projeto

1. O estado de agendamento deve viver apenas por criança‑por‑competência, ou devemos também manter um ajuste de parâmetros FSRS a nível populacional para semear os horários de novas crianças antes de existirem dados suficientes?
2. A retenção desejada deve ser um valor fixo de 0,90 para toda a plataforma, ou um parâmetro ajustável para utilizadores mais avançados/de nível doutoramento, como o Anki oferece aos utilizadores avançados?
3. A etiquetagem “unit‑scoped” vs. “foundational” deve ser criada manualmente por nó curricular, ou inferida a partir da profundidade do grafo de pré‑requisitos?
4. O rácio de interlevação interage com o sistema de sinal anti‑trapaça — a mistura de tipos de competência facilita ou dificulta a deteção de padrões de tempo?
5. A barra de domínio em duas fases (sequência + revisão retardada) deve bloquear a progressão para a unidade curricular seguinte, ou apenas influenciar o agendamento de revisões enquanto a progressão permanece dependente de outro limiar de precisão?

## Fontes

1. Rohrer & Taylor, “A mistura de problemas de matemática melhora a aprendizagem” — http://uweb.cas.usf.edu/~drohrer/pdfs/Rohrer&Taylor2007IS.pdf  
2. Taylor & Rohrer (2010), “The effects of interleaved practice,” *Applied Cognitive Psychology* 24, 837‑848 — https://onlinelibrary.wiley.com/doi/abs/10.1002/acp.1598  
3. IES WWC Study 89950, prática de matemática intercalada em sala de aula RCT — https://ies.ed.gov/ncee/wwc/Study/89950  
4. Rohrer, Dedrick & Stershic (2015), “Interleaved practice improves mathematics learning,” *Journal of Educational Psychology* 107(3), 900‑908 — https://files.eric.ed.gov/fulltext/ED557355.pdf  
5. Rohrer et al. (2014), “The benefit of interleaved mathematics practice is not limited to superficially similar kinds of problems” — https://pubmed.ncbi.nlm.nih.gov/24578089/  
6. Bjork & Bjork (2011), “Making things hard on yourself, but in a good way: Creating desirable difficulties to enhance learning” — https://mirjamglessmer.com/2026/03/07/currently-reading-bjork-bjork-2011-on-making-things-hard-on-yourself-but-in-a-good-way-creating-desirable-difficulties-to-enhance-learning/  
7. “Desirable Difficulties: Bjork's 5 Principles” — https://www.structural-learning.com/post/desirable-difficulties  
8. Roediger & Karpicke (2006), “Test-Enhanced Learning” / “The Power of Testing Memory,” *Perspetives on Psychological Science* 1(3), 181‑210 — https://journals.sagepub.com/doi/10.1111/j.1467-9280.2006.01693.x  
9. Cepeda, Vul, Rohrer, Wixted & Pashler (2008), “Spacing Effects in Learning: A Temporal Ridgeline of Optimal Retention,” *Psychological Science* — https://laplab.ucsd.edu/articles/Cepeda%20et%20al%202008_psychsci.pdf  
10. Documentação do algoritmo FSRS — https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm and https://github.com/open-spaced-repetition/awesome-fsrs/wiki/The-Algorithm  
11. Settles & Meeder (2016), “A Trainable Spaced Repetition Model for Language Learning,” ACL — https://research.duolingo.com/papers/settles.acl16.pdf ; código — https://github.com/duolingo/halflife-regression/blob/master/README.md  
12. “How Much Mastery is Enough Mastery?” EDM 2025 — https://educationaldatamining.org/EDM2025/proceedings/2025.EDM.short-papers.4/index.html  
13. “The Importance of Math Fact Fluency: Evidence-Informed Classroom Practices” — https://www.ldatschool.ca/the-importance-of-math-fact-fluency-evidence-informed-classroom-practices/  
14. Visão geral do sistema Leitner — https://e-student.org/leitner-system/ and https://supermemo.guru/wiki/Leitner_system  
15. Especificação original do algoritmo SuperMemo SM-2 — https://super-memory.com/english/ol/sm2.htm  
16. Curva de esquecimento de Ebbinghaus — https://www.flashcardify.me/blog/ebbinghaus-forgetting-curve and https://www.structural-learning.com/post/ebbinghaus-forgetting-curve
