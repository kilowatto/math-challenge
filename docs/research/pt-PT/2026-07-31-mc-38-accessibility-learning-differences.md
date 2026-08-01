# Acessibilidade e diferenças de aprendizagem num jogo de matemática global e para todas as idades

> Math Challenge research — 2026-07-31 — topic 38

## Resumo executivo (ES)

- WCAG 2.2 acrescenta requisitos que um jogo tátil, cronometrado e multigeracional afeta diretamente: **2.5.8 Target Size (Mínimo, AA)** exige alvos de ≥24×24 px CSS [1]; **2.5.7 Dragging Movements (AA)** exige alternativa sem arrasto [10]; **2.5.1 Pointer Gestures (A)** exige alternativa de um único ponteiro para gestos multiponto [8].
- O conflito central — pontuação por velocidade vs. **2.2.1 Timing Adjustable (A)** — resolve‑se assim: a "Essential Exception" cobre apenas um limite de tempo onde "estender o limite invalidaria a atividade" [2]. Isso justifica um modo "Speed Challenge" opt‑in, não o modo por defeito, porque existe uma alternativa razoável (modo sem relógio).
- MathML Core é Candidate Recommendation Snapshot desde 24 de junho de 2025 [3]; o seu próprio texto diz que `alttext` "não define nenhum comportamento observável" — a semântica acessível das fórmulas depende do MathJax + Speech Rule Engine, não do núcleo da norma [3][11].
- Discalculia: 3–6 % da população [4], sem critério diagnóstico consensual; melhores intervenções: manipuláveis concretos, linha numérica computadorizada (*The Number Race*, *Graphogame-math*) e software adaptativo (*Calcularis*, *Meister Cody*) [4].
- A evidência sobre fontes especiais para dislexia (OpenDyslexic, Dyslexie) é fraca a negativa: Rello & Baeza‑Yates (2013) não encontraram melhoria no tempo de leitura; um estudo de 2016 mostrou preferência por Arial sobre fontes "de dislexia"; um de 2023 encontrou preferência estética mas nenhuma diferença nos resultados [5].
- A Lei Europeia de Acessibilidade exige cumprimento desde **28 de junho de 2025**, incluindo explicitamente o comércio eletrónico [7]; EN 301 549 (que incorpora WCAG 2.1 completo) é a sua referência técnica [9]. A regra ADA Título II dos EUA exige WCAG 2.1 AA a governos estaduais/locais —incluindo escolas públicas— para 2027/2028 [6].

## Resumo executivo (EN)

Math Challenge combina jogabilidade pontuada por velocidade, renderização simbólica de matemática, idades de 4 anos a adulto, cinco línguas e entrada por telemóvel/tablet/desktop — uma superfície de acessibilidade mais exigente do que a maioria das aplicações de público único. WCAG 2.2 acrescenta critérios que afetam diretamente: **2.5.8 Target Size (Minimum, AA)** requer alvos de ponteiro ≥24×24 px CSS, com quatro exceções restritas [1]; **2.5.7 Dragging Movements (AA)** requer uma alternativa sem arrasto para qualquer mecânica de arrastar [10]. O conflito fundamental é **2.2.1 Timing Adjustable (A)** versus pontuação por velocidade; a sua **Essential Exception** — "the time limit is essential and extending it would invalidate the activity" [2] — é restrita e não cobre um exercício gamificado por defeito; a solução é arquitetónica (um modo separado sem tempo mais um modo cronometrado opt‑in), detalhada abaixo.

MathML Core é um W3C Candidate Recommendation Snapshot (24 de junho de 2025) cujo próprio texto afirma que o atributo `alttext` não tem comportamento observável definido [3] — o MathML Core padroniza a renderização, não a semântica acessível, que em vez disso provém das extensões de acessibilidade do MathJax construídas sobre o Speech Rule Engine [11], mais leitores de ecrã com suporte a matemática (JAWS 16+, VoiceOver) [12]. A discalculia afeta 3–6 % das pessoas [4], não tem critério diagnóstico consensual, e as suas intervenções com melhor evidência — manipuláveis concretos, treino de linha numérica computadorizada, exercícios adaptativos — estão próximas do que o Math Challenge já constrói [4]. A evidência para fontes específicas para dislexia é fraca a negativa; a British Dyslexia Association recomenda fontes sans‑serif normais em alternativa [5]. Legalmente, o European Accessibility Act da UE está em vigor desde 28 de junho de 2025 para produtos/serviços de consumo, incluindo comércio eletrónico [7], EN 301 549 (incorporando WCAG 2.1 na íntegra) é a sua espinha dorsal técnica [9], e a regra ADA Título II dos EUA de 2024 exige WCAG 2.1 AA para sites e aplicações de governos estaduais/locais — incluindo escolas públicas — até 2027/2028 [6], o que surgirá nas aquisições dos distritos escolares ainda que não vincule diretamente o Math Challenge.

## Constatações

### 1. WCAG 2.2: os novos critérios que mais impactam aqui

WCAG 2.2 (outubro de 2023) acrescentou nove critérios de sucesso em relação à 2.1. Os mais relevantes para um jogo de matemática cronometrado, com interface predominantemente tátil e capacidade de arrastar:

- **2.5.8 Tamanho do Alvo (Mínimo) — AA.** “O alvo para entrada por ponteiro tem, no mínimo, 24 × 24 píxeis CSS, exceto quando: Equivalente… Inline… Controlo do Agente de Utilizador… Essencial.” [1] Um piso, não um teto — a UI para utilizadores menores de 8 anos deve visar bem acima desse valor.  
- **2.5.7 Movimentos de Arrasto — AA (novo).** “Funcionalidade que pode ser operada por movimentos de arrasto pode também ser operada por ativações de ponteiro único sem arrasto, a menos que o arrasto seja essencial.” [10] Qualquer mecânica de “arrastar para a linha numérica” precisa de um equivalente de toque‑para‑colocar.  
- **2.5.1 Gestos de Ponteiro — A.** “Toda a funcionalidade que usa gestos multiponto ou baseados em caminho para operação pode ser operada com um único ponteiro sem gesto baseado em caminho, a menos que… essencial.” [8]  
- **2.5.4 Acionamento por Movimento — A.** A entrada por movimento do dispositivo tem de ser também operável via componentes de UI, com a resposta ao movimento desactivável [8] — relevante se algum dia se considerar “inclinar para responder”.  
- **1.4.10 Refluxo — AA.** “O conteúdo pode ser apresentado sem perda de informação ou funcionalidade, e sem exigir deslocamento em duas dimensões para: conteúdo de deslocamento vertical numa largura equivalente a 320 píxeis CSS… Exceto para partes do conteúdo que requerem layout bidimensional para uso ou significado.” [13] Um canvas de geometria pode plausivelmente alegar a exceção; o “chrome” circundante (botões, pontuação, instruções) não pode.  
- **1.4.1 Uso de Cor — A.** “A cor não é usada como o único meio visual de transmitir informação, indicar uma ação, incitar uma resposta ou distinguir um elemento visual.” [14] Diretamente implicado por feedback de cor codificado para correto/incorreto ou níveis de dificuldade.  
- Outras adições da 2.2 (Foco Não Obstruído, Aparência do Foco, Ajuda Consistente, Entrada Redundante, Autenticação Acessível) são mais relevantes para a camada de conta/portal; **3.3.8 Autenticação Acessível** vale a pena assinalar se algum portão de perfil usar um puzzle ou teste cognitivo tipo CAPTCHA como único método.

### 2. O conflito de temporização, declarado com precisão

Uma ronda pontuada por velocidade define “um limite de tempo… pelo conteúdo” — a condição de disparo para **2.2.1 Temporização Ajustável (A)**, satisfeita apenas se o utilizador puder desactivar o limite, ajustá‑lo a ≥10 × o padrão, prolongá‑lo com aviso, ou se enquadrar na **Exceção de Tempo Real** (“uma parte necessária de um evento em tempo real… e não há alternativa ao limite de tempo”) ou na **Exceção Essencial** (“essencial e prolongá‑lo invalidaria a atividade”) [2]. Existe ainda uma exceção de 20 horas e uma nota que liga este critério ao 3.2.1 (Previsível) [2]. Resolução completa abaixo.

### 3. Matemática acessível: MathML Core, MathJax, leitores de ecrã

MathML Core é um **Snapshot de Recomendação Candidata (24 de junho de 2025)**, “não se espera que avance para Recomendação Proposta antes de 30 de setembro de 2025” [3] — um subconjunto deliberadamente reduzido e testável em navegadores de MathML 3. O seu próprio texto: o atributo `alttext` “não define nenhum comportamento observável que seja específico do atributo alttext” [3] — a especificação padroniza a renderização, não a semântica acessível. Firefox e Safari suportam MathML há muito tempo; o Chromium adicionou uma implementação “no início de 2023” [15]. Leitores de ecrã: **JAWS a partir da versão 16 suporta voz e saída Braille para MathML**; **VoiceOver lê MathML no Safari** [12]; o suporte de MathML no NVDA existe via extensões, mas não foi confirmado por uma fonte primária aqui e deve ser verificado antes do lançamento.

**MathJax** “fornece um conjunto poderoso de extensões de acessibilidade que permitem navegação, exploração e voz no cliente”, incluindo Zoom de Expressão e, para offline/ePub, “descrições textuais alternativas ou anotações de fala e Braille mais granulares” [11]. Por baixo dele, o **Speech Rule Engine (SRE)** converte a estrutura MathML/LaTeX em descrições em linguagem natural (“uma metade mais um terço”, e não nomes brutos de símbolos). **KaTeX** é mais rápido, mas tem ferramentas de acessibilidade incorporadas mais fracas e normalmente requer um fallback a MathML para além de matemática decorativa. Renderizar fórmulas como imagens ou glifos de canvas — um atalho comum de UI amigável para crianças — não produz nada para um leitor de ecrã; MathML mais uma camada de acessibilidade é o único caminho que mantém a notação disponível para utilizadores cegos ou com baixa visão em todas as idades.

### 4. Discalculia: prevalência, identificação, intervenções

A discalculia é “um transtorno de aprendizagem, que resulta em dificuldade para aprender ou compreender a aritmética”, o que “não reflete um défice geral nas capacidades cognitivas ou dificuldades com tempo, medição e raciocínio espacial” [4]. Prevalência: **3–6 %**, comparável entre géneros [4]. **Não existe critério diagnóstico consensual**; a identificação combina testes de desempenho, avaliação de memória de trabalho/função executiva, avaliação do professor e (em investigação) padrões de fMRI [4]. As intervenções com melhor evidência agrupam‑se em três famílias: **manipuláveis concretos** (paradigma de tutoria de Fuchs — jogos, flashcards, manipuláveis) [4]; **treino de linha numérica computadorizado** (*The Number Race*, *Graphogame‑math*) [4]; e **software adaptativo** (*Dybuster Calcularis*, *Meister Cody – Talasia*) [4]. Isto corresponde mecanicamente ao próprio Math Challenge — um jogo de linha numérica e exercícios de aritmética — defendendo um modo explicitamente informado pela discalculia em vez de um adendo superficial.

### 5. Tipografia para dislexia: as fontes são a parte fraca da história

Incontroverso e barato: tipo maior, espaçamento de linhas generoso, linhas curtas, alinhamento à esquerda, sem itálico/tudo em maiúsculas no corpo do texto, contraste sólido mas não extremo. O que **não** se sustenta é a afirmação de que a dislexia requer uma fonte especial. OpenDyslexic (Abbie Gonzalez, 2011) é o exemplo mais conhecido [5]. Evidência: **Rello & Baeza‑Yates (2013)** descobriram que não “melhorou significativamente o tempo de leitura nem reduziu a fixação ocular” [5]; uma **tese de 2010** concluiu que Dyslexie “não levou a leitura mais rápida” comparada com Arial [5]; um **estudo de 2016** encontrou que leitores disléxicos **preferiram Arial** a tipos específicos para dislexia [5]; um **estudo de 2023** revelou preferência estética por OpenDyslexic (58 %) mas “nenhuma diferença nas pontuações dos testes com base na fonte utilizada” [5]. A British Dyslexia Association recomenda fontes sans‑serif comuns em vez de fontes especiais [5]. **Conclusão:** não criar nem licenciar uma “fonte para dislexia”; investir o esforço em espaçamento, comprimento de linha e iconografia consistente.

### 6. TDAH e atenção numa aplicação de aprendizagem gamificada

O trabalho de Acessibilidade Cognitiva (COGA) da W3C mapeia para três títulos de diretriz WCAG: **2.2 Tempo Suficiente**, **2.4 Navegável**, **3.2 Previsível** [16], com padrões mais profundos na nota “Making Content Usable”. Em termos de produto: estrutura de sessão previsível, estímulos visuais/áudio concorrentes mínimos durante a resolução ativa de problemas, ecrãs de foco único e limites de tempo ajustáveis ou evitáveis por defeito. Mecânicas de recompensa variável e comparação social — ganchos de envolvimento comuns para TDAH na gamificação comercial — acarretam um custo documentado de stress/atenção juntamente com o benefício de envolvimento (ver tópico 10 desta série) e devem ser tratadas como troca, não como vitória gratuita.

### 7. Autismo e design sensorial: movimento, som, previsibilidade

`prefers-reduced-motion` tem **estado de disponibilidade geral desde janeiro de 2020** [17] e permite que uma aplicação respeite a preferência a nível de SO. A sua justificação documentada são **distúrbios vestibulares de movimento** — animações de escala/panning que provocam tontura ou desorientação [17]; a extensão para autismo/sensibilidade sensorial é prática bem estabelecida, embora não seja a afirmação específica citada na fonte primária aqui usada. O critério WCAG **2.3.3 Animação a partir de Interações (AAA)** exige que “a animação de movimento desencadeada por interação possa ser desactivada, a menos que a animação seja essencial” [18] — AAA, não obrigatório ao nível AA, mas barato e diretamente protetor. O som merece o mesmo tratamento: um interruptor persistente e descobrível “reduzir movimento / reduzir som”, por defeito alinhado ao sinal do SO.

### 8. Deficiência visual e o problema de geometria

A geometria é o sub‑domínio mais difícil para utilizadores cegos ou com baixa visão porque o seu conteúdo é inerentemente espacial. O conjunto de ferramentas padrão: **gráficos táteis** (papel em relevo ou formas impressas em 3D); **Código Braille Nemeth** (Abraham Nemeth, primeiro documentado em 1952), um sistema de seis pontos para linearizar a notação matemática com cobertura total de símbolos para triângulos, círculos, paralelogramos e relações como paralela/perpendicular/ângulo [19]; e **descrição verbal estruturada** — uma gramática fixa (tipo de forma, depois vértices/lados, depois ângulos, mesma ordem sempre) que permite ao utilizador de leitor de ecrã construir um modelo mental sem dispositivo tátil. Para uma aplicação web, o caminho a curto prazo é a autoria rigorosa de texto‑alternativo com gramática fixa, mais dados de forma navegáveis por teclado e descrevíveis — os píxeis de canvas são invisíveis a um leitor de ecrã independentemente da qualidade do alt‑text em outros locais.

### 9. Deficiência motora e acesso por interruptor

**2.5.2 Cancelamento de Ponteiro (A)** requer que a ativação de ponteiro único não dispare no evento de pressionar inicial, a menos que se aplique uma salvaguarda (abort/undo, reversão no evento de levantar, ou um gatilho de pressionar essencial) [8] — protegendo utilizadores com tremor de ativações acidentais numa interface de toque rápido. O acesso total por interruptor necessita ainda de acessibilidade sequencial via teclado/interruptor com foco visível (2.4.7/2.4.11), e nenhuma interação que exija arrasto, pinça ou duplo toque cronometrado sem alternativa de um único interruptor.

### 10. Deficiência de visão de cores num jogo codificado por cores

As deficiências vermelho‑verde (protanopia, deuteranopia) são as mais comuns; a tritanopia (azul‑amarelo) é mais rara; a acromatopsia (total, em tons de cinzento) afeta uma minoria muito pequena [20]. Regra principal, coerente com 1.4.1 [14]: nunca deixar que a cor, por si só, indique correto/incorreto, dificuldade ou categoria — combinar cada pista de cor com forma, ícone ou texto, e verificar a paleta numa simulação em tons de cinzento, não apenas contra um utilizador “típico” [20].

### 11. Legendas e alternativas áudio

Os prompts de números falados, o vídeo tutorial e o áudio de celebração precisam de legendas/equivalentes de texto sincronizados e de um caminho sem som (o caso de uso predominante em escolas e espaços públicos) — território padrão WCAG 1.2.x, risco comparativamente baixo face aos problemas mais difíceis acima.

### 12. A camada legal

**EU European Accessibility Act (Directive 2019/882).** Cumprimento obrigatório a partir de **28 June 2025**: “todos os produtos e serviços relevantes disponibilizados no mercado da UE devem agora cumprir os requisitos de acessibilidade” [7]. O âmbito inclui explicitamente dispositivos informáticos pessoais, e‑books e **serviços de comércio eletrónico** [7]. Micro‑empresas (<10 colaboradores, <€2M de volume de negócios) estão isentas [7]; a conformidade é auto‑certificada, com penalizações que variam significativamente entre os Estados‑membros [7]. **Se o Math Challenge vender subscrições na UE, está plausivelmente no âmbito como serviço de comércio eletrónico** — a questão jurídica de maior prioridade aqui.

**EN 301 549.** O padrão harmonizado de acessibilidade ICT da UE; v3.2.1 “inclui o texto completo da WCAG 2.1” [9] e é a referência técnica tanto para a Directiva de Acessibilidade Web como para o EAA, estendendo‑se além de sites para aplicações móveis e serviços de telecomunicações; o Canadá adotou‑o formalmente em 2024 [9].

**US ADA Title II (2024) / Section 508.** Exige que entidades governamentais estaduais/locais — incluindo distritos escolares públicos — cumpram **WCAG 2.1 AA** para conteúdo web/aplicação, com prazos **26 April 2027** (pop. ≥50.000) / **2028** (menores), com cinco exceções de conteúdo restritas [6]. A Secção 508 vincula separadamente a aquisição por agências federais [21]. O Math Challenge não está diretamente sujeito, mas os compradores dos distritos escolares provavelmente exigirão uma declaração de conformidade WCAG 2.1 AA (VPAT); desenvolver para WCAG 2.2 AA satisfaz ambos os regimes com margem.

## Lista de verificação de conformidade — critérios WCAG 2.2 AA mais em risco aqui

| SC | Nível | Risco no Math Challenge | Regra de design |
|---|---|---|---|
| 2.5.8 Target Size (Minimum) | AA | Fragmentos de resposta/pad de números dimensionados para desktop | Todos os alvos ≥24×24 px CSS; ≥44×44 px para UI de menores de 8 anos |
| 2.5.7 Dragging Movements | AA | Arrastar para linha numérica, arrastar para ordenar | Alternativa de tocar‑para‑selecionar + tocar‑para‑colocar para cada arrasto |
| 2.5.1 Pointer Gestures | A | Qualquer pinça/deslizar‑para‑responder | Alternativa de ponteiro único; nenhuma essencial por design |
| 2.5.2 Pointer Cancellation | A | Pontuação por toque rápido disparada ao pressionar | Ativar no evento de libertar/soltar, abortar ao arrastar para fora |
| 2.2.1 Timing Adjustable | A | Modo predefinido cronometrado | Ver "conflito de temporização" — modo sem tempo é o caminho de conformidade |
| 1.4.10 Reflow | AA | Canvas de geometria, grelhas de coordenadas | Refluxo de toda a interface a 320 px; apenas a figura pode precisar de layout 2D |
| 1.4.1 Use of Color | A | Codificação de correto/incorreto, nível, categoria | Cada pista de cor também inclui ícone/forma/texto |
| 1.4.3 / 1.4.11 Contrast | AA | Paletas brilhantes e lúdicas para crianças | 4,5:1 texto, 3:1 UI/gráficos, verificado contra a paleta real |
| 2.4.7 / 2.4.11 Focus Visible/Not Obscured | AA | Componentes de jogo personalizados, sem estilo de foco nativo | Indicador de foco visível e não obstruído em todo o lado |
| 3.3.8 Accessible Authentication | AA | "Resolver para desbloquear" portões de perfil | Nenhum teste de função cognitiva como método único de autenticação |

## O conflito de temporização — resolvido

**2.2.1 Timing Adjustable (Level A)** aplica‑se sempre que “um limite de tempo… é definido pelo conteúdo” [2] — uma ronda cronometrada qualifica‑se inequivocamente. As duas exceções que poderiam cobri‑lo integralmente são restritas:

> “Real-time Exception: The time limit is a required part of a real-time event (for example, an auction), and no alternative to the time limit is possible.” [2]

> “Essential Exception: The time limit is essential and extending it would invalidate the activity.” [2]

Nenhuma deve ser o único argumento de conformidade para a experiência predefinida, porque existe claramente uma alternativa razoável (um modo sem tempo que ensina a mesma matemática). A Exceção Essencial é defensável apenas para um modo distinto, claramente rotulado **“Speed Challenge”** onde a temporização é realmente *a* atividade medida.

**Resolução:**
1. O **modo de aprendizagem predefinido** é sem tempo ou padrão‑conforme (Desactivar / Ajustar ≥10× / Estender com aviso) [2].
2. Um modo separado, opt‑in **Speed Challenge** mantém a temporização rígida e invoca honestamente a Exceção Essencial.
3. A progressão (sequências, desbloqueios) no modo predefinido é impulsionada por precisão/conclusão, não por latência; a velocidade é um estatístico de bónus apresentado apenas no Speed Challenge.
4. Isto também corresponde à literatura sobre ansiedade matemática (tópico 10 desta série): o relógio é o amplificador documentado de quedas de desempenho ligadas à ansiedade, pelo que a sua remoção do caminho predefinido está alinhada com a evidência, não é apenas um atalho de conformidade.

## Implicações de design

1. Renderizar toda a notação matemática como MathML ou marcação ARIA acessível através de uma camada de acessibilidade tipo MathJax — nunca glifos apenas em canvas/imagem [3][11].
2. Modo de jogo predefinido sem temporizador ou com temporizador ajustável; isolar a temporização rígida para um modo opt‑in “Speed Challenge” que invoque honestamente a Exceção Essencial [2].
3. Todos os alvos interativos ≥24×24 px CSS, ≥44×44 px para UI de menores de 8 anos [1].
4. Cada interação de arrasto inclui uma alternativa de tocar‑para‑selecionar/tocar‑para‑colocar; o arrasto é um aprimoramento, nunca o único caminho [10].
5. Nunca codificar correto/incorreto, dificuldade ou categoria apenas em cor; combinar com ícone/forma/texto e verificar contra simulações de protanopia/deuteranopia/tritanopia/acromatopsia [14][20].
6. Disponibilizar um controlo persistente “reduzir movimento/áudio” com valor predefinido `prefers-reduced-motion`, para além do 2.3.3 apenas AAA, porque a população servida é real independentemente do estado AA [17][18].
7. Construir um modo distinto **Discalculia / Sentido Numérico**: apresentação com linha numérica em primeiro plano, visualizações concretas e manipuláveis, rampa adaptativa modelada no Number Race/Calcularis em vez de uma curva Elo genérica; descobrível nas definições, não bloqueado por diagnóstico (não há consenso) [4].
8. Não criar/licenciar uma “fonte disléxica”; investir em espaçamento de linhas, linhas instrucionais mais curtas, alinhamento à esquerda, sans‑serif padrão legível [5].
9. Cada figura geométrica recebe uma descrição textual estruturada de gramática fixa (forma, depois vértices/lados, depois ângulos) mais dados de forma navegáveis por teclado/descrevíveis, não apenas renderização em canvas [19].
10. Adicionar um “Modo de Foco” de baixo estímulo para TDAH/atenção: ecrãs de tarefa única, sem animação/áudio concorrente no meio do problema, estrutura previsível, efeitos de celebração adiados — alinhado ao Enough Time/Navigable/Predictable da COGA [16].
11. Operabilidade total por interruptor/teclado: ordem de foco sequencial, indicador de foco visível e não obstruído, nenhuma interação que exija multi‑toque ou toque cronometrado precisamente sem uma alternativa de ponteiro único [8].
12. Legendar/equivalente em texto cada prompt falado e clipe instrucional; tornar todo o ciclo de resolução de problemas completável em silêncio por predefinição.
13. Tratar o EAA da UE como já vinculativo (data de conformidade ultrapassada em 28 June 2025) se vender a consumidores da UE; encomendar uma auto‑avaliação ao estilo VPAT contra EN 301 549 agora [7][9].
14. Almejar WCAG 2.2 AA internamente, um superset rigoroso que pré‑satisfaz o requisito WCAG 2.1 AA que os distritos escolares dos EUA exigirão em processos de compra [6].

## Questões abertas para o proprietário do projeto

1. O Math Challenge vende a consumidores fisicamente na UE hoje ou dentro de 12 meses? Determina se a conformidade com o EAA (já exigida desde 28 June 2025) está em vigor ou é prospectiva [7].
2. O placar público é uma funcionalidade central permanente, ou pode ser reencadrado como o modo opt‑in Speed Challenge, mantendo o relógio opcional por predefinição?
3. A adoção por distritos escolares dos EUA é um canal de mercado real? Se sim, um VPAT WCAG 2.1 AA torna‑se um ativo de vendas, não apenas de conformidade [6].
4. O conteúdo de geometria deve limitar‑se a formas estruturadas em texto/navegáveis por teclado, ou a faixa etária mais avançada necessita de geometria interativa em canvas/SVG (exigindo um investimento maior em acessibilidade)?
5. Orçamento/disposição para uma camada de renderização de acessibilidade tipo MathJax (voz baseada em SRE) versus um renderizador mais leve como KaTeX puro com ferramentas integradas mais fracas?
6. Lançar o interruptor de reduzir movimento/áudio no lançamento, ou adiar para uma fase de acessibilidade pós‑lançamento, dado que é barato, apenas AAA, e protetor para utilizadores autistas/vestibulares [17][18]?

## Fontes

1. W3C, WCAG 2.2, SC 2.5.8 Tamanho do Alvo (Mínimo) — https://www.w3.org/TR/WCAG22/#target-size-minimum  
2. W3C, WCAG 2.2, SC 2.2.1 Tempo Ajustável — https://www.w3.org/TR/WCAG22/#timing-adjustable  
3. W3C, MathML Core (Snapshot da Recomendação Candidata, 24 de junho de 2025) — https://www.w3.org/TR/mathml-core/  
4. Wikipedia, “Dyscalculia” — https://en.wikipedia.org/wiki/Dyscalculia  
5. Wikipedia, “OpenDyslexic” — https://en.wikipedia.org/wiki/OpenDyslexic  
6. ADA.gov, “Regra de Acessibilidade para Web e Aplicações Móveis do Título II de 2024” — https://www.ada.gov/resources/2024-03-08-web-rule/  
7. Wikipedia, “European Accessibility Act” — https://en.wikipedia.org/wiki/European_Accessibility_Act  
8. W3C, WCAG 2.2, SC 2.5.1 Gestos de Ponteiro / 2.5.2 Cancelamento de Ponteiro / 2.5.4 Acionamento por Movimento — https://www.w3.org/TR/WCAG22/#pointer-gestures  
9. Wikipedia, “EN 301 549” — https://en.wikipedia.org/wiki/EN_301_549  
10. W3C, WCAG 2.2, SC 2.5.7 Movimentos de Arrasto — https://www.w3.org/TR/WCAG22/#dragging-movements  
11. MathJax Project, visão geral das funcionalidades de acessibilidade — https://www.mathjax.org/#accessibility  
12. Wikipedia, “MathML” (suporte a leitores de ecrã) — https://en.wikipedia.org/wiki/MathML  
13. W3C, WCAG 2.2, SC 1.4.10 Refluxo — https://www.w3.org/TR/WCAG22/#reflow  
14. W3C, WCAG 2.2, SC 1.4.1 Uso de Cor — https://www.w3.org/TR/WCAG22/#use-of-color  
15. Wikipedia, “MathML” (história da implementação no Chromium) — https://en.wikipedia.org/wiki/MathML  
16. W3C WAI, visão geral da Acessibilidade Cognitiva — https://www.w3.org/WAI/cognitive/  
17. MDN Web Docs, “prefers-reduced-motion” — https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion  
18. W3C, WCAG 2.2, SC 2.3.3 Animação a partir de Interacções — https://www.w3.org/TR/WCAG22/#animation-from-interactions  
19. Wikipedia, “Nemeth Braille” — https://en.wikipedia.org/wiki/Nemeth_Braille  
20. WebAIM, “Deficiências Visuais: Daltonismo” — https://webaim.org/articles/visual/colorblind  
21. Section508.gov, “Leis e Políticas” — https://www.section508.gov/manage/laws-and-policies/  
22. W3C, WCAG 2.2 Referência Rápida (novos critérios de sucesso em 2.2) — https://www.w3.org/WAI/WCAG22/quickref/?versions=2.2
