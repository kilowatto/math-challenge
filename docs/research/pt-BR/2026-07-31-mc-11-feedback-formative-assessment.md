# Feedback e avaliação formativa em matemática — evidências para um tutor de IA

> Pesquisa Math Challenge — 2026-07-31 — tópico 11

## Resumo executivo (tópicos)

- Hattie & Timperley (2007): a retroalimentação eficaz responde três perguntas — “Para onde vou?”, “Como estou?”, “Para onde sigo?” — em quatro níveis: tarefa, processo, autorregulação e “eu”. O nível “eu” (elogios genéricos) é o menos eficaz [1].
- Kluger & DeNisi (1996), meta-análise de 607 tamanhos de efeito: a retroalimentação melhora o desempenho em média (d=0,41), mas **mais de um terço das intervenções de retroalimentação o pioraram** — a mensagem “dar retroalimentação sempre ajuda” é falsa [2].
- Black & Wiliam (1998) revisaram >250 estudos: a avaliação formativa bem implementada produz tamanhos de efeito de 0,4–0,7, maiores que quase qualquer outra intervenção educativa, e reduz especialmente a lacuna com estudantes de baixo desempenho [3].
- O momento (imediato vs. diferido) importa menos que o **conteúdo** da retroalimentação; uma meta-análise recente de 51 estudos (160 tamanhos de efeito) não encontrou diferença média por momento, mas encontrou que matemática obtém efeitos maiores que outras disciplinas e que a retroalimentação elaborada supera a de apenas correção [4][5].
- Shute (2008) distingue quatro tipos: Conhecimento de Resultado (KR, apenas correto/incorreto), Conhecimento de Resposta Correta (KCR), Retroalimentação Elaborada (EF, explica o porquê) e Tentar-Até-Correto (AUC). A EF vence em geral, mas o excesso de elaboração pode saturar e prejudicar [5].
- Elogiar a inteligência (“você é muito inteligente”) em vez do esforço (“você trabalhou de forma metódica”) reduz a persistência após o fracasso, aumenta as atribuições de habilidade fixa e leva a escolher tarefas mais fáceis — achado clássico de Mueller & Dweck (1998), 6 estudos [6].
- O elogio inflado (“incrivelmente perfeito!”) prediz **menor** autoestima ao longo do tempo em crianças, e em crianças com autoestima já alta prediz mais narcisismo; o elogio genuíno e não inflado não produz nenhum dos dois efeitos — Brummelman et al. (2014, 2017) [7].
- Os sistemas tutores inteligentes (ITS) com retroalimentação ao nível de passo (step-based) chegam a d≈0,76, quase tão eficazes quanto um tutor humano; os que apenas avaliam a resposta final apresentam desempenho muito menor (d≈0,40) — VanLehn (2011) [8].
- Os LLM atuais, sem ajuste pedagógico, tendem a **revelar a resposta antes do tempo** ou a gerar explicações que, embora raciocinem passo a passo, contêm erros matemáticos com aparência coerente — MathDial (2023), MathTutorBench (2025) [9][10].
- O ensaio aleatório Tutor CoPilot (2024, 783 tutores, N grande) mostrou que sugestões de IA orientadas a perguntas investigativas (em vez de elogio genérico) aumentaram o domínio de tópicos de matemática em 4 pontos percentuais, com maior ganho para tutores de menor qualificação [11].

## Resumo executivo (prosa)

A síntese de Hattie & Timperley (2007) enquadra o feedback como resposta a três perguntas (feed up / feed back / feed forward) em quatro níveis (tarefa, processo, autorregulação, eu) — sendo o elogio ao nível do “eu” a alavanca mais fraca [1]. A meta-análise de Kluger & DeNisi (1996), com 607 tamanhos de efeito, é a advertência mais importante aqui: o feedback ajuda em média (d = ,41), mas **mais de um terço das intervenções de feedback reduziu o desempenho**, principalmente quando dirige a atenção ao eu em vez da tarefa [2]. Black & Wiliam (1998) estabeleceram a avaliação formativa como uma das intervenções de maior alavancagem da educação (d = 0,4–0,7 em mais de 250 estudos), beneficiando desproporcionalmente os alunos de baixo desempenho [3]. O momento, isoladamente, mostra efeitos fracos e inconsistentes; uma meta-análise de 2024/2025 com 51 estudos constatou que a matemática produz efeitos maiores que outras disciplinas e que a elaboração do conteúdo importa mais que o momento [4][5]. A taxonomia de Shute (2008) — KR, KCR, feedback elaborado, tentar-até-acertar — mostra que a elaboração em geral vence, mas o excesso pode sair pela culatra [5]. O elogio à habilidade (Mueller & Dweck, 1998) mina a persistência e a busca por desafios após o fracasso, em comparação com o elogio ao esforço/processo [6]; o elogio inflado prediz menor autoestima ao longo do tempo e, em crianças que já têm autoestima alta, mais narcisismo (Brummelman et al., 2014/2017) [7]. O feedback de ITS no nível do passo se aproxima da eficácia de um tutor humano (d ≈ 0,76 contra 0,40 dos sistemas que só avaliam a resposta) [8]. Os tutores de LLM atuais, a menos que sejam treinados especificamente (MathDial, SocraticLM, Tutor CoPilot, MathTutorBench), tendem a entregar a resposta prematuramente ou a produzir raciocínio fluente, porém matematicamente errado [9][10][12]. O único ECR em campo de tutoria assistida por IA (Tutor CoPilot, 2024) encontrou ganhos concentrados na redução do elogio genérico e no aumento das perguntas investigativas [11].

## Resultados

### 1. O modelo de feedback de Hattie & Timperley (2007)

Feedback eficaz responde a três perguntas: “Onde estou indo?” (feed up), “Como estou indo?” (feed back), “Para onde agora?” (feed forward) [1]. Ele opera em quatro níveis: **tarefa**, **processo** (estratégia/método), **autorregulação** e **eu** (elogio pessoal, “você é muito inteligente”). Feedback de tarefa/processo voltado à autorregulação é poderoso; elogios ao nível do eu são o mais fraco dos quatro e podem diluir os demais quando combinados em uma única mensagem (por exemplo, “Ótimo trabalho, você é brilhante!” acrescentado a um aviso de correção) [1].

### 2. Kluger & DeNisi (1996): feedback pode prejudicar

Uma meta-análise de 607 tamanhos de efeito / 23.663 observações encontrou um efeito médio positivo (d = ,41), mas **mais de um terço das intervenções de feedback diminuiu o desempenho** [2]. A Teoria da Intervenção de Feedback explica a divisão: feedback que redireciona a atenção para o **eu** (envolvendo ego, comparativo, elogio/culpa) desvia recursos da tarefa e pode suprimir o desempenho após falha; feedback que mantém a atenção na **tarefa** e na estratégia de fechamento da lacuna tende a ajudar. Essa é a base evidencial para tratar “sempre dê feedback” como falso.

### 3. Black & Wiliam e a base de evidências da avaliação formativa

Revisando mais de 250 estudos, Black & Wiliam (1998) descobriram que a avaliação formativa eleva os resultados de testes com tamanhos de efeito de 0,4–0,7 — maiores que a maioria das intervenções educacionais — com os maiores ganhos para estudantes de baixo desempenho [3]. Condições: a informação deve ser usada para ajustar o ensino em tempo quase real, o feedback deve dizer como fechar a lacuna (não apenas o quão distante está), e os estudantes precisam de protagonismo (auto-avaliação/avaliação por pares). Isso defende um ciclo formativo contínuo (tentativa → explicação → ajuste do próximo problema) em vez de um relatório pontual ao final da sessão.

### 4. Tempo: feedback imediato vs. retardado

Uma meta-análise recente (51 estudos, 1988–2024, 160 tamanhos de efeito) encontrou **nenhuma diferença média significativa entre feedback imediato e retardado**, mas tarefas de matemática mostraram efeitos maiores que outras disciplinas, e o feedback imediato aumentou a confiança do aprendiz em prática matemática computadorizada mesmo sem mudar os ganhos de acurácia [4]. A elaboração (o que o feedback diz) importou mais que o tempo (quando ele chega) [4][5]. Conclusão: o tempo é secundário, o conteúdo é primário — embora a imediatidade ainda ajude a confiança e evite que um procedimento errado seja praticado mais vezes.

### 5. Taxonomia de conteúdo de feedback (Shute, 2008)

Shute distingue **Conhecimento de Resultado (KR)** (apenas correto/incorreto), **Conhecimento da Resposta Correta (KCR)** (informa a resposta), **Feedback Elaborado (EF)** (explica o porquê, com pistas/exemplos/estratégias) e **Resposta-até-correta**. EF geralmente supera KR/KCR, mas **elaboração excessiva pode ser prejudicial**, sobrecarregando a memória de trabalho [5]. Isso sustenta feedback elaborado-mas-conciso, não um reensino exaustivo do que o estudante já acertou.

### 6. Elogio ao esforço vs. à habilidade, e elogio inflado

Mueller & Dweck (1998, seis estudos): crianças elogiadas por inteligência mostraram, após uma falha subsequente, menos persistência, menos prazer, mais atribuições de baixa habilidade a si mesmas e pior desempenho que crianças elogiadas por esforço/estratégia; 92% das crianças elogiadas por esforço escolheram quebra-cabeças mais difíceis versus 33% das elogiadas por inteligência [6]. Brummelman et al. (2014, 2017) encontraram que elogio **inflado** prediz menor autoestima ao longo do tempo e maior narcisismo em crianças que já possuem alta autoestima; elogio não inflado e preciso não produziu nenhum desses efeitos [7]. Em conjunto: elogie processos/estratégias, mantenha a proporção, nunca elogie traços fixos.

### 7. Meta-análises de feedback em ITS/CAI

VanLehn (2011): sistemas de tutoria inteligente alcançam d ≈ 0,58 vs. nenhuma tutoria, quase equiparando-se à tutoria humana. **Tutoria baseada em passos** (feedback a cada passo da solução) alcançou d ≈ 0,76 — quase tão bom quanto um tutor humano — enquanto **sistemas baseados em resposta** (feedback apenas na resposta final) alcançaram apenas d ≈ 0,40 [8]. Sinal forte: comentar os passos/trabalho, não apenas a resposta final, sempre que o formato captura o trabalho intermediário.

### 8. Feedback de tutoria matemática gerado por LLM (2023–2026)

MathDial (EMNLP 2023) construiu 3.000 diálogos de tutoria porque LLMs “falham na tutoria” — geram feedback incorreto ou revelam soluções cedo demais (“telling@k”) [9]. SocraticLM e PEARL treinam modelos para reter respostas e apoiar com perguntas [10][12]. MathTutorBench (EMNLP 2025): capacidade de resolução **não** se transfere para boa tutoria, há troca entre pedagogia e competência, e a qualidade degrada em diálogos mais longos [10]. LLMs também produzem cadeias de raciocínio fluentes-mas-erradas, distintas de revelação de respostas [13]. O único RCT de campo, Tutor CoPilot (2024, 783 tutores, ~350 mil mensagens), encontrou que sugestões de IA aumentaram perguntas de sondagem e **diminuíram elogios genéricos**, gerando um ganho de maestria de 4 pp (p<0,01), concentrado entre tutores com avaliação mais baixa [11]. Avaliações do Khanmigo relatam que ele supera o GPT-4o bruto na detecção de erros, e sinais de desempenho estruturados melhoraram a correção do próximo item em ~6% — porém o uso regular permanece baixo (~15%) [14].

### 9. Formulação adequada à idade

Diretrizes para primeira infância (NAEYC, Wisconsin DCF) recomendam **feedback descritivo e específico** em vez de elogio genérico (“você contou os feijões novamente e obteve o mesmo número” vs. “bom trabalho”), já que a especificidade permite que a criança conecte o feedback a uma ação repetível [15]. O gradiente etário vai de linguagem concreta/sensorial para crianças pequenas até linguagem abstrata metacognitiva (estratégia, por quê, transferência) para estudantes mais velhos.

## Implicações de design para o Math Challenge

1. **Estruture cada mensagem do tutor como feed-up / feed-back / feed-forward**: (a) reformule o objetivo, (b) indique o que aconteceu em relação a ele, (c) forneça um próximo passo concreto. Nunca pare em (b) — isso deixa a parte de maior valor do modelo de Hattie & Timperley sem uso [1].

2. **Nunca combine feedback de tarefa com elogio de nível pessoal/traço na mesma frase.** Proíba “Correto! Você é muito bom em matemática” — separe a correção do encorajamento, e mantenha o encorajamento focado em esforço/estratégia, nunca em habilidade. Isso decorre da descoberta de Kluger & DeNisi de que a captura de atenção em nível pessoal é o provável mecanismo por trás do feedback que retrocede [2][6].

3. **Comente o trabalho/passos do estudante, não apenas a resposta final**, sempre que o formato capturar etapas intermediárias. A escolha arquitetural de maior alavancagem segundo a meta-análise de VanLehn para ITS (passo a passo d≈0,76 vs. resposta d≈0,40) [8].

4. **Mantenha o feedback elaborado curto — de 3 a 6 frases, no máximo um exemplo trabalhado.** O efeito adverso da elaboração excessiva de Shute indica que o prompt precisa de um limite de comprimento explícito, não “explique tudo que puder” [5].

5. **Não permita que o tutor revele a resposta ou o método do próximo problema prematuramente durante a tentativa** (por exemplo, em um fluxo de dica antes da submissão) — modo de falha MathDial/"telling@k". Restrinja o tutor a dicas socráticas/escalonadas por etapas durante uma tentativa ativa, e reserve explicações completas trabalhadas para a revisão pós-submissão [9][10][12].

6. **Proteja contra cadeias de raciocínio confiantemente erradas.** Valide qualquer explicação passo a passo gerada contra uma solução correta computada deterministicamente antes de mostrá-la — o LLM deve narrar uma derivação conhecida como correta, não re-derivar livremente a matemática, dado o registro de cadeias de raciocínio fluentes-mas-erradas [13].

7. **Feedback imediato para sinais de correção/completação (certo/errado, pontos ganhos); um pequeno atraso (subsegundo a alguns segundos) é aceitável para a explicação mais profunda do “por quê”, mas não ao final da sessão** — feedback imediato ajuda a confiança e impede que um procedimento errado seja praticado novamente [4].

8. **Reserve feedback em nível de padrão para um resumo ao final da sessão**, distinto do feedback por problema: por exemplo, “mais rápido em fatos de multiplicação, mais lento em problemas de palavras de múltiplas etapas; a próxima sessão adiciona mais problemas de palavras estruturados”. Isso se alinha ao ciclo formativo de Black & Wiliam — usando evidências agregadas para ajustar a *próxima* unidade instrucional, não apenas a próxima frase [3].

9. **Modelos de FEEDBACK segmentados por faixa etária para o prompt do tutor:**

   - **Idades ~4–6:** 1–2 frases curtas, concretas/sensoriais, sem discurso de estratégia abstrata. Modelo: *[observação concreta] → [passo correto simples] → [elogio ao esforço ligado à ação específica]*. Exemplo: “Você contou as maçãs uma a uma — são 7, você disse 6; vamos contar juntos: 1, 2, 3... Você está ficando muito bom em contar com cuidado.”
   - **Idades ~7–10:** 3–4 frases nomeando a etapa específica onde ocorreu a divergência, uma estratégia nomeada, elogio ao esforço/estratégia. Modelo: *[o que você acertou] + [a etapa exata que saiu do caminho] + [por que o passo correto funciona] + [encorajamento baseado em estratégia]*.
   - **Idades ~11–14:** 4–5 frases introduzindo o *porquê* da regra, convidando à comparação com a abordagem correta, usando vocabulário da disciplina. Modelo: *[feed up: o que o problema testou] + [feed back: onde o raciocínio coincidiu/divergiu] + [regra correta com um mini passo trabalhado] + [feed forward: um tipo de problema relacionado para observar]*.
   - **Idades 15+ / adulto:** Conciso, técnico, nível de pares; omita o boilerplate de encorajamento, foque na precisão (“correto, mas não minimal; aqui está um caminho mais rápido”), ofereça profundidade sob demanda.

   Todas as faixas: nunca enquadramento de traço fixo (“você não é uma pessoa de matemática”); sempre nomeie a ação *específica*, nunca um julgamento global.

10. **Feedback a evitar, pois a evidência mostra que retrocede:** elogio genérico de traço/habilidade [6]; elogio inflado/superlativo por correção rotineira [7]; feedback apenas de correção sem caminho futuro quando errado [5]; revelar a solução completa antes que a tentativa termine [9][10]; reensino longo de material já dominado [5]; feedback comparativo/normativo (“atrás de outras crianças da sua idade”) — o mecanismo exato de mudança de ego por trás da queda de desempenho induzida por feedback [2].

11. **Vincule o feedback de gamificação a sinais de esforço/processo** (persistência, uso de estratégia, melhoria em relação à própria linha de base), não apenas velocidade ou sequências, para que a pontuação não reintroduza feedback enquadrado em habilidade por meio de placares ou distintivos de talento fixo.

12. **Exija que o prompt do tutor faça uma auto-verificação de uma rubrica curta antes de emitir uma mensagem**: separa tarefa de elogio; nomeia um próximo passo concreto; dentro do limite de comprimento da faixa etária; evita revelar respostas da próxima tentativa; qualquer passo trabalhado é validado contra uma verdade de base computada. Isso operacionaliza as regras acima como um filtro, não como esperança.

## Perguntas abertas para o dono do projeto
1. O feedback imediato por problema e a explicação mais completa do tutor de IA devem sempre ser exibidos juntos, ou as idades 4–6 devem receber uma reação simplificada inline imediatamente e a explicação completa apenas em uma revisão para o responsável/sessão?
2. Estamos atualmente capturando o trabalho/passos intermediários em problemas de múltiplas etapas, não apenas a resposta final? Caso não, isso vale a pena priorizar dado o gap ITS baseado em passos vs baseado em respostas (d≈0,76 vs 0,40)?
3. Os resumos ao final da sessão devem ser enviados à criança, ao responsável, ou a ambos, com formulações diferentes (encorajamento voltado à criança vs. detalhe diagnóstico voltado ao responsável)?
4. Como o tutor deve validar sua narração da solução trabalhada contra a verdade de base — um resolvedor determinístico separado, ou uma passagem de verificação secundária por LLM?
5. Queremos um fallback de “professor novato” (revelação simples da resposta correta) quando uma explicação socrática/elaborada completa seria muito lenta ou custosa, e em qual limite de latência/custo?

## Fontes

1. Hattie & Timperley (2007). The Power of Feedback, *Review of Educational Research* 77(1). Follow-up: [Revisiting "The Power of Feedback"](https://www.sciencedirect.com/science/article/abs/pii/S0959475222001396).
2. Kluger & DeNisi (1996). The Effects of Feedback Interventions on Performance, *Psychological Bulletin* 119(2). [ResearchGate](https://www.researchgate.net/publication/232458848_The_Effects_of_Feedback_Interventions_on_Performance_A_Historical_Review_a_Meta-Analysis_and_a_Preliminary_Feedback_Intervention_Theory).
3. Black & Wiliam (1998). Inside the Black Box, *Phi Delta Kappan*. [PDF](http://allianceforlearning.co.uk/wp-content/uploads/2017/03/William-and-Black-Inside-the-Black-Box.pdf).
4. A Meta-Analysis of the Impact of Feedback Timing on Learning Outcomes in Computer-Assisted Learning, *Educational Psychology Review* (2026). [Springer](https://link.springer.com/article/10.1007/s10648-026-10117-8).
5. Shute (2008). Focus on Formative Feedback, *Review of Educational Research* 78(1). [PDF](https://andymatuschak.org/files/papers/Shute%20-%202008%20-%20Focus%20on%20Formative%20Feedback.pdf).
6. Mueller & Dweck (1998). Praise for Intelligence Can Undermine Children's Motivation and Performance. [PubMed](https://pubmed.ncbi.nlm.nih.gov/9686450/).
7. Brummelman et al. (2014, 2017). Person Praise Backfires in Children With Low Self-Esteem; When Parents' Praise Inflates, Children's Self-Esteem Deflates, *Child Development*. [Wiley](https://onlinelibrary.wiley.com/doi/full/10.1111/cdev.12936).
8. VanLehn (2011), summarized in: [Effectiveness of Intelligent Tutoring Systems: A Meta-Analytic Review](https://www.researchgate.net/publication/277636218_Effectiveness_of_Intelligent_Tutoring_Systems_A_Meta-Analytic_Review).
9. MathDial: A Dialogue Tutoring Dataset with Rich Pedagogical Properties, EMNLP Findings 2023. [arXiv:2305.14536](https://arxiv.org/abs/2305.14536).
10. MathTutorBench: A Benchmark for Measuring Open-ended Pedagogical Capabilities of LLM Tutors, EMNLP 2025. [arXiv:2502.18940](https://arxiv.org/abs/2502.18940).
11. Tutor CoPilot: A Human-AI Approach for Scaling Real-Time Expertise (2024). [arXiv:2410.03017](https://arxiv.org/html/2410.03017).
12. Boosting LLMs with Socratic Method for Conversational Mathematics Teaching. [arXiv:2407.17349](https://arxiv.org/html/2407.17349).
13. Mathematical Computation and Reasoning Errors by Large Language Models. [arXiv:2508.09932](https://arxiv.org/pdf/2508.09932).
14. Khan Academy Blog. How Khan Academy Is Building a Better AI Tutor. [blog.khanacademy.org](https://blog.khanacademy.org/how-khan-academy-is-building-a-better-ai-tutor-our-most-recent-learnings/).
15. Providing Descriptive Feedback to Young Children, Wisconsin DCF / YoungStar. [PDF](https://dcf.wisconsin.gov/files/youngstar/pdf/ys-2019-20/desc-fdbk.pdf).
