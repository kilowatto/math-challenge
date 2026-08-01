# Feedback e avaliação formativa em matemática — evidência para um tutor de IA

> Math Challenge research — 2026-07-31 — topic 11

## Resumo executivo (ES)

- Hattie & Timperley (2007): o feedback eficaz responde a três perguntas — “Para onde vou?”, “Como estou?”, “Para onde sigo?” — em quatro níveis: tarefa, processo, autorregulação e “eu”. O nível “eu” (elogios genéricos) é o menos eficaz [1].
- Kluger & DeNisi (1996), meta‑análise de 607 tamanhos de efeito: o feedback melhora o desempenho em média (d≈0,41), mas **mais de um terço das intervenções de feedback o diminuíram** — a mensagem “dar feedback sempre ajuda” é falsa [2].
- Black & Wiliam (1998) revistaram >250 estudos: a avaliação formativa bem implementada produz tamanhos de efeito de 0,4–0,7, maiores que quase qualquer outra intervenção educativa, e reduz sobretudo a lacuna com os estudantes de baixo desempenho [3].
- O momento (imediato vs. diferido) importa menos que o **conteúdo** do feedback; uma meta‑análise recente de 51 estudos (160 tamanhos de efeito) não encontrou diferença média por momento, mas constatou que matemática obtém efeitos maiores que outras disciplinas e que o feedback elaborado supera o de mera correção [4][5].
- Shute (2008) distingue quatro tipos: Conhecimento de Resultado (KR, apenas correto/incorreto), Conhecimento de Resposta Correta (KCR), Feedback Elaborado (EF, explica o porquê) e Tentar‑Até‑Correto (AUC). O EF prevalece em geral, mas o excesso de elaboração pode saturar e prejudicar [5].
- Elogiar a inteligência (“és muito inteligente”) em vez do esforço (“trabalhaste com método”) reduz a persistência após o fracasso, aumenta as atribuições de capacidade fixa e leva a escolher tarefas mais fáceis — descoberta clássica de Mueller & Dweck (1998), 6 estudos [6].
- O elogio inflado (“!incrivelmente perfeito!”) prevê **menor** autoestima ao longo do tempo em crianças, e em crianças com autoestima já alta prevê mais narcisismo; o elogio genuíno e não inflado não produz nenhum dos dois efeitos — Brummelman et al. (2014, 2017) [7].
- Os sistemas tutores inteligentes (ITS) com feedback a nível de passo (step‑based) chegam a d≈0,76, quase tão eficazes como um tutor humano; os que apenas avaliam a resposta final têm desempenho muito menor (d≈0,40) — VanLehn (2011) [8].
- Os LLM atuais, sem ajuste pedagógico, tendem a **revelar a resposta antes de tempo** ou a gerar explicações que de facto raciocinam passo a passo mas contêm erros matemáticos com aparência coerente — MathDial (2023), MathTutorBench (2025) [9][10].
- O ensaio aleatório Tutor CoPilot (2024, 783 tutores, N grande) mostrou que sugestões de IA orientadas a perguntas indagatórias (em vez de elogio genérico) aumentaram o domínio de temas de matemática em 4 pontos percentuais, com maior ganho para tutores de menor classificação [11].

## Resumo executivo (EN)

Hattie & Timperley (2007) sintetizam o feedback como resposta a três perguntas (feed up / feed back / feed forward) ao longo de quatro níveis (tarefa, processo, autorregulação, eu) — com elogios ao nível do eu a alavanca mais fraca [1]. A meta‑análise de Kluger & DeNisi (1996) de 607 tamanhos de efeito é o aviso mais importante aqui: o feedback ajuda em média (d≈,41), mas **mais de um terço das intervenções de feedback reduziram o desempenho**, principalmente quando direcionam a atenção para o eu em vez da tarefa [2]. Black & Wiliam (1998) estabeleceram a avaliação formativa como uma das intervenções educacionais de maior alavancagem (d = 0,4–0,7 em mais de 250 estudos), beneficiando desproporcionalmente os estudantes de baixo desempenho [3]. O timing por si só mostra efeitos fracos e inconsistentes; uma meta‑análise de 2024/2025 de 51 estudos encontrou que a matemática produz efeitos maiores que outras disciplinas, e que a elaboração do conteúdo importa mais que o timing [4][5]. A taxonomia de Shute (2008) — KR, KCR, feedback elaborado, answer‑until‑correct — mostra que a elaboração geralmente vence, mas o excesso pode ser contraproducente [5]. O elogio à capacidade (Mueller & Dweck, 1998) mina a persistência e a procura de desafios após o fracasso em comparação com o elogio ao esforço/processo [6]; o elogio inflado prevê **menor autoestima** ao longo do tempo e, em crianças já com alta autoestima, mais narcisismo (Brummelman et al., 2014/2017) [7]. O feedback de ITS a nível de passo aproxima‑se da eficácia de um tutor humano (d≈0,76 vs. 0,40 para sistemas que apenas avaliam a resposta) [8]. Os tutores LLM atuais, a menos que sejam especificamente treinados (MathDial, SocraticLM, Tutor CoPilot, MathTutorBench), tendem a revelar respostas prematuramente ou a produzir raciocínios fluentes mas matematicamente errados [9][10][12]. O único RCT em direto de tutoria assistida por IA (Tutor CoPilot, 2024) encontrou ganhos concentrados na redução de elogios genéricos e no aumento de perguntas de sondagem [11].

## Constatações

### 1. Modelo de feedback de Hattie & Timperley (2007)

Um feedback eficaz responde a três perguntas: «Para onde estou a ir?» (feed up), «Como estou a ir?» (feed back), «Para onde a seguir?» (feed forward) [1]. Funciona em quatro níveis: **tarefa**, **processo** (estratégia/método), **autorregulação** e **eu** (elogio pessoal, «és tão inteligente»). O feedback de tarefa/processo direcionado para a autorregulação é poderoso; o elogio ao nível do eu é o mais fraco dos quatro e pode diluir os outros quando combinado numa única mensagem (por exemplo, «Bom trabalho, és brilhante!» acrescentado a um aviso de correção) [1].

### 2. Kluger & DeNisi (1996): o feedback pode prejudicar

Uma meta‑análise de 607 tamanhos de efeito / 23.663 observações encontrou um efeito médio positivo (d = ,41), mas **mais de um terço das intervenções de feedback diminuíram o desempenho** [2]. A Teoria da Intervenção de Feedback explica a divisão: o feedback que redireciona a atenção para o **eu** (envolvendo o ego, comparativo, elogio/culpa) retira recursos da tarefa e pode suprimir o desempenho após uma falha; o feedback que mantém a atenção na **tarefa** e na estratégia de redução da lacuna tende a ajudar. Esta é a base empírica para considerar a afirmação «dar sempre feedback» como falsa.

### 3. Black & Wiliam e a base de evidências da avaliação formativa

Ao analisar mais de 250 estudos, Black & Wiliam (1998) descobriram que a avaliação formativa eleva os resultados dos testes com tamanhos de efeito entre 0,4 e 0,7 — superiores à maioria das intervenções educativas — com os maiores ganhos para estudantes com baixo rendimento [3]. Condições: a informação tem de ser utilizada para ajustar o ensino em tempo quase real, o feedback tem de indicar como fechar a lacuna (não apenas o quão distante está), e os estudantes precisam de apropriação (auto‑avaliação/avaliação entre pares). Isto defende um ciclo formativo contínuo (tentativa → explicação → ajuste do próximo problema) em vez de um relatório único ao final da sessão.

### 4. Temporalidade: feedback imediato vs. atrasado

Uma meta‑análise recente (51 estudos, 1988–2024, 160 tamanhos de efeito) encontrou **nenhuma diferença média significativa entre feedback imediato e atrasado**, mas as tarefas de matemática mostraram efeitos maiores do que outras disciplinas, e o feedback imediato aumentou a confiança dos aprendentes na prática de matemática baseada em computador mesmo sem alterar os ganhos de exactidão [4]. A elaboração (o que o feedback diz) foi mais importante que o momento (quando chega) [4][5]. Conclusão: o timing é secundário, o conteúdo é primordial — mas a imediatidade ainda ajuda a confiança e impede que um procedimento errado seja ensaiado novamente.

### 5. Taxonomia do conteúdo do feedback (Shute, 2008)

Shute distingue **Knowledge of Results (KR)** (apenas correto/incorreto), **Knowledge of Correct Response (KCR)** (indica a resposta), **Elaborated Feedback (EF)** (explica o porquê, com pistas/exemplos/estratégias) e **Answer‑Until‑Correct**. O EF geralmente supera o KR/KCR, mas **a elaboração excessiva pode ser prejudicial**, sobrecarregando a memória de trabalho [5]. Isto defende feedback elaborado‑mas‑conciso, não um re‑ensino exaustivo do que o estudante já acertou.

### 6. Elogio ao esforço vs. à capacidade, e elogio inflado

Mueller & Dweck (1998, seis estudos): crianças elogiadas pela inteligência mostraram, após uma falha subsequente, menor persistência, menos prazer, mais atribuições de baixa capacidade a si próprias e pior desempenho do que crianças elogiadas pelo esforço/estratégia; 92 % das crianças elogiadas pelo esforço escolheram puzzles mais difíceis em seguida contra 33 % das crianças elogiadas pela inteligência [6]. Brummelman et al. (2014, 2017) descobriram que o elogio **inflado** prevê menor autoestima ao longo do tempo e maior narcisismo em crianças que já têm alta autoestima; elogios não inflados e precisos não produziram nenhum desses efeitos [7]. Em conjunto: o processo/estratégia do elogio, mantê‑lo proporcional, nunca elogiar traços fixos.

### 7. Meta‑análises de feedback ITS/CAI

VanLehn (2011): os sistemas de tutoria inteligente atingem d ≈ 0,58 em comparação com a ausência de tutoria, quase equiparando‑se à tutoria humana. **Step‑based tutoring** (feedback em cada passo da solução) atingiu d ≈ 0,76 — quase tão bom quanto um tutor humano — enquanto **answer‑based systems** (feedback apenas na resposta final) alcançaram apenas d ≈ 0,40 [8]. Sinal forte: comentar os passos/trabalho, não apenas a resposta final, sempre que o formato captura o trabalho intermédio.

### 8. Feedback de tutoria de matemática gerado por LLM (2023–2026)

MathDial (EMNLP 2023) construiu 3.000 diálogos de tutoria porque os LLMs brutos «falham na tutoria» — geram feedback incorreto ou revelam soluções demasiado cedo («telling@k») [9]. SocraticLM e PEARL treinam modelos para reter respostas e apoiar com perguntas em vez disso [10][12]. MathTutorBench (EMNLP 2025): a capacidade de resolução **não** se transfere para uma boa tutoria, há um trade‑off entre pedagogia e competência, e a qualidade degrada‑se em diálogos mais longos [10]. Os LLMs também produzem cadeias de pensamento fluentes‑mas‑erradas, distintas da revelação de respostas [13]. O único RCT de campo, Tutor CoPilot (2024, 783 tutores, ~350k mensagens), encontrou que as sugestões de IA aumentaram as perguntas de sondagem e **diminuíram o elogio genérico**, um ganho de mestria de 4 pp (p<0,01), concentrado entre tutores com classificação mais baixa [11]. Avaliações do Khanmigo relatam que supera o GPT‑4o bruto na deteção de erros, e sinais de desempenho estruturados melhoraram a exactidão do próximo item em ~6 % — mas a utilização regular permanece baixa (~15 %) [14].

### 9. Formulação adequada à idade

As orientações para a primeira infância (NAEYC, Wisconsin DCF) recomendam **feedback descritivo e específico** em vez de elogio genérico («contaste os feijões novamente e obtiveste o mesmo número» vs. «bom trabalho»), pois a especificidade permite que a criança ligue o feedback a uma ação repetível [15]. O gradiente etário vai de linguagem concreta/sensorial para crianças pequenas até linguagem abstrata metacognitiva (estratégia, porquê, transferência) para estudantes mais velhos.

## Implicações de design para o Math Challenge

1. **Estruturar cada mensagem do tutor como feed‑up / feed‑back / feed‑forward**: (a) reformular o objetivo, (b) dizer o que aconteceu em relação a ele, (c) dar um próximo passo concreto. Nunca parar em (b) — isso deixa a parte de maior valor do modelo de Hattie & Timperley sem uso [1].

2. **Nunca combinar feedback da tarefa com elogio a nível de traço/autopercepção na mesma frase.** Proibir “Correct! You're so smart at math” — separar a correção do encorajamento, e manter o encorajamento focado no esforço/estratégia, nunca na capacidade. Decorre da descoberta de Kluger & DeNisi de que a captura de atenção a nível de self‑level é o provável mecanismo por trás do feedback que tem efeito contrário [2][6].

3. **Comentar o trabalho/passos do estudante, não apenas a resposta final**, sempre que o formato capturar passos intermédios. A escolha arquitetónica de maior alavancagem segundo a meta‑análise de VanLehn (passo‑a‑passo d≈0,76 vs. resposta d≈0,40) [8].

4. **Manter o feedback elaborado curto — de 3 a 6 frases, no máximo um exemplo trabalhado.** O efeito adverso da elaboração excessiva de Shute implica que o prompt precise de um limite explícito de comprimento, não “explique tudo o que puder” [5].

5. **Não permitir que o tutor revele a resposta ou o método do próximo problema prematuramente durante a tentativa** (por exemplo, num fluxo de dica antes da submissão) — o modo de falha MathDial/“telling@k”. Restringir o tutor a dicas socráticas/escalonadas por passo durante uma tentativa ativa, e reservar explicações completas para a revisão pós‑submissão [9][10][12].

6. **Proteger contra cadeias de pensamento confiantemente erradas.** Validar qualquer explicação passo‑a‑passo gerada contra uma solução correta calculada deterministicamente antes de a mostrar — o LLM deve narrar uma derivação conhecida como correta, não re‑derivar livremente a matemática, dado os registos de cadeias de raciocínio fluentes mas erradas [13].

7. **Feedback imediato para sinais de correção/completude (certo/errado, pontos ganhos); um pequeno atraso (de subsegundo a alguns segundos) é aceitável para a explicação mais profunda do “porquê”, mas não no fim da sessão — feedback imediato ajuda a confiança e impede que um procedimento errado seja praticado mais vezes [4].**

8. **Reservar feedback a nível de padrão para um resumo ao fim da sessão**, distinto do feedback por problema: por exemplo, “mais rápido nas tabuadas de multiplicação, mais lento nos problemas de palavras com múltiplas etapas; a próxima sessão acrescenta mais problemas de palavras escalonados”. Isto corresponde ao ciclo formativo de Black & Wiliam — usar evidência agregada para ajustar a *próxima* unidade instrucional, não apenas a frase seguinte [3].

9. **Modelos de feedback por faixa etária para o prompt do tutor:**

   - **Idades ~4–6:** 1–2 frases curtas, concretas/sensoriais, sem discurso abstrato de estratégia. Modelo: *[observação concreta] → [passo correto simples] → [elogio ao esforço ligado à ação específica]*. Exemplo: “Contaste as maçãs uma a uma — são 7, disseste 6; vamos contar juntos: 1, 2, 3… Está a ficar muito bom contar com cuidado.”
   - **Idades ~7–10:** 3–4 frases nomeando o passo específico onde ocorreu a divergência, uma estratégia nomeada, elogio ao esforço/estratégia. Modelo: *[o que acertaste] + [o passo exato que desviou] + [por que o passo correto funciona] + [encorajamento baseado na estratégia]*.
   - **Idades ~11–14:** 4–5 frases introduzindo o *porquê* da regra, convidando à comparação com a abordagem correta, usando vocabulário da disciplina. Modelo: *[feed up: o que o problema testou] + [feed back: onde o raciocínio coincidiu/divergiu] + [regra correta com um mini‑exemplo trabalhado] + [feed forward: um tipo de problema relacionado para observar]*.
   - **Idades 15+ / adulto:** Conciso, técnico, a nível de pares; omitir o boilerplate de elogio, focar na precisão (“correto mas não minimal; aqui está um caminho mais rápido”), oferecer profundidade mediante pedido.

   Todas as faixas: nunca enquadramento de traço fixo (“não és pessoa de matemática”); sempre nomear a *ação específica*, nunca um juízo global.

10. **Feedback a evitar, porque a evidência indica que tem efeito contrário:** elogio genérico a traço/capacidade [6]; elogio inflado/superlativo por correção rotineira [7]; feedback apenas de correção sem caminho a seguir quando está errado [5]; revelar a solução completa antes de terminar a tentativa [9][10]; re‑ensinar extensivamente material já dominado [5]; feedback comparativo/normativo (“atrás de outras crianças da tua idade”) — o mecanismo de mudança de ego por trás das quedas de desempenho induzidas por feedback [2].

11. **Ligar o feedback de gamificação a sinais de esforço/processo** (persistência, uso de estratégia, melhoria sobre a própria linha de base), não apenas velocidade ou rachas, para que a pontuação não reintroduza feedback enquadrado em capacidade através de tabelas de líderes ou distintivos de talento fixo.

12. **Exigir que o prompt do tutor faça uma auto‑verificação contra um pequeno rubro antes de emitir uma mensagem**: separa tarefa de elogio; nomeia um próximo passo concreto; respeita o limite de comprimento da faixa etária; evita revelar respostas da próxima tentativa; qualquer passo trabalhado é validado contra a verdade de base calculada. Isto operacionaliza as regras acima como um portão, não como esperança.

## Questões abertas para o proprietário do projeto

1. O feedback imediato por problema e a explicação mais completa do tutor IA devem ser mostrados sempre juntos, ou as crianças de 4–6 anos devem receber uma reação simplificada em linha imediatamente e a explicação completa apenas numa revisão de sessão/pai?
2. Atualmente capturamos trabalho/passos intermédios em problemas de múltiplas etapas, ou apenas a resposta final? Se não, vale a pena priorizar isso dado a diferença de eficácia passo‑a‑passo vs. resposta (d≈0,76 vs 0,40)?
3. Os resumos ao fim da sessão devem ser enviados à criança, ao pai, ou a ambos, com formulações diferentes (encorajamento voltado para a criança vs. detalhe diagnóstico para o pai)?
4. Como o tutor deve validar a narração da sua solução trabalhada contra a verdade de base — um resolvedor determinístico separado, ou uma passagem de verificação LLM secundária?
5. Queremos um recurso “professor novato” (revelação simples da resposta correta) quando uma explicação socrática/elaborada completa seria demasiado lenta ou cara, e em que limiar de latência/custo?

## Fontes

1. Hattie & Timperley (2007). *The Power of Feedback*, Review of Educational Research 77(1). Follow‑up: [Revisiting "The Power of Feedback"](https://www.sciencedirect.com/science/article/abs/pii/S0959475222001396).
2. Kluger & DeNisi (1996). *The Effects of Feedback Interventions on Performance*, Psychological Bulletin 119(2). [ResearchGate](https://www.researchgate.net/publication/232458848_The_Effects_of_Feedback_Interventions_on_Performance_A_Historical_Review_a_Meta-Analysis_and_a_Preliminary_Feedback_Intervention_Theory).
3. Black & Wiliam (1998). *Inside the Black Box*, Phi Delta Kappan. [PDF](http://allianceforlearning.co.uk/wp-content/uploads/2017/03/William-and-Black-Inside-the-Black-Box.pdf).
4. A Meta‑Analysis of the Impact of Feedback Timing on Learning Outcomes in Computer‑Assisted Learning, *Educational Psychology Review* (2026). [Springer](https://link.springer.com/article/10.1007/s10648-026-10117-8).
5. Shute (2008). *Focus on Formative Feedback*, Review of Educational Research 78(1). [PDF](https://andymatuschak.org/files/papers/Shute%20-%202008%20-%20Focus%20on%20Formative%20Feedback.pdf).
6. Mueller & Dweck (1998). *Praise for Intelligence Can Undermine Children’s Motivation and Performance*. [PubMed](https://pubmed.ncbi.nlm.nih.gov/9686450/).
7. Brummelman et al. (2014, 2017). *Person Praise Backfires in Children With Low Self‑Esteem; When Parents’ Praise Inflates, Children’s Self‑Esteem Deflates*, Child Development. [Wiley](https://onlinelibrary.wiley.com/doi/full/10.1111/cdev.12936).
8. VanLehn (2011), resumido em: [Effectiveness of Intelligent Tutoring Systems: A Meta‑Analytic Review](https://www.researchgate.net/publication/277636218_Effectiveness_of_Intelligent_Tutoring_Systems_A_Meta-Analytic_Review).
9. MathDial: A Dialogue Tutoring Dataset with Rich Pedagogical Properties, EMNLP Findings 2023. [arXiv:2305.14536](https://arxiv.org/abs/2305.14536).
10. MathTutorBench: A Benchmark for Measuring Open‑ended Pedagogical Capabilities of LLM Tutors, EMNLP 2025. [arXiv:2502.18940](https://arxiv.org/abs/2502.18940).
11. Tutor CoPilot: A Human‑AI Approach for Scaling Real‑Time Expertise (2024). [arXiv:2410.03017](https://arxiv.org/html/2410.03017).
12. Boosting LLMs with Socratic Method for Conversational Mathematics Teaching. [arXiv:2407.17349](https://arxiv.org/html/2407.17349).
13. Mathematical Computation and Reasoning Errors by Large Language Models. [arXiv:2508.09932](https://arxiv.org/pdf/2508.09932).
14. Khan Academy Blog. *How Khan Academy Is Building a Better AI Tutor*. [blog.khanacademy.org](https://blog.khanacademy.org/how-khan-academy-is-building-a-better-ai-tutor-our-most-recent-learnings/).
15. Providing Descriptive Feedback to Young Children, Wisconsin DCF / YoungStar. [PDF](https://dcf.wisconsin.gov/files/youngstar/pdf/ys-2019-20/desc-fdbk.pdf).
