# Acessibilidade e diferenças de aprendizagem em um jogo de matemática global e para todas as idades

> Pesquisa Math Challenge — 2026-07-31 — tópico 38

## Resumo executivo (tópicos)

- WCAG 2.2 adiciona requisitos que um jogo tátil, cronometrado e multigeracional atinge de pleno: **2.5.8 Target Size (Mínimo, AA)** exige alvos de ≥24×24 px CSS [1]; **2.5.7 Dragging Movements (AA)** exige alternativa sem arraste [10]; **2.5.1 Pointer Gestures (A)** exige alternativa de um único ponteiro para gestos multiponto [8].
- O conflito central — pontuação por velocidade vs. **2.2.1 Timing Adjustable (A)** — resolve-se assim: a “Essential Exception” cobre apenas um limite de tempo onde “estendê-lo invalidaria a atividade” [2]. Isso justifica um modo “Speed Challenge” opt-in, não o modo padrão, porque existe alternativa razoável (modo sem relógio).
- MathML Core é Candidate Recommendation Snapshot desde 24 de junho de 2025 [3]; seu próprio texto diz que `alttext` “não define nenhum comportamento observável” — a semântica acessível das fórmulas depende de MathJax + Speech Rule Engine, não do núcleo da norma [3][11].
- Discalculia: 3–6% da população [4], sem critério diagnóstico consensual; melhores intervenções: manipuláveis concretos, reta numérica computacional (*The Number Race*, *Graphogame-math*) e software adaptativo (*Calcularis*, *Meister Cody*) [4].
- Evidência sobre fontes especiais para dislexia (OpenDyslexic, Dyslexie) é fraca a negativa: Rello & Baeza-Yates (2013) não encontraram melhora no tempo de leitura; um estudo de 2016 mostrou preferência por Arial sobre fontes “de dislexia”; um de 2023 encontrou preferência estética mas nenhuma diferença nos resultados [5].
- A Lei Europeia de Acessibilidade exige conformidade desde **28 de junho de 2025**, incluindo explicitamente comércio eletrônico [7]; EN 301 549 (que incorpora WCAG 2.1 completo) é sua referência técnica [9]. A regra ADA Título II dos EUA exige WCAG 2.1 AA para governos estaduais/locais —incluindo escolas públicas— para 2027/2028 [6].

## Resumo executivo (prosa)

Math Challenge combina jogabilidade pontuada por velocidade, renderização de matemática simbólica, faixas etárias de 4 anos a adulto, cinco idiomas e entrada por telefone/tablet/desktop — uma superfície de acessibilidade mais exigente que a maioria dos aplicativos de público único. WCAG 2.2 adiciona critérios que impactam diretamente: **2.5.8 Target Size (Minimum, AA)** requer alvos de ponteiro ≥24×24 px CSS, com quatro exceções restritas [1]; **2.5.7 Dragging Movements (AA)** requer uma alternativa sem arraste para qualquer mecânica de arrastar [10]. O conflito central é **2.2.1 Timing Adjustable (A)** versus pontuação por velocidade; sua **Essential Exception** — “the time limit is essential and extending it would invalidate the activity” [2] — é restrita e não cobre um exercício gamificado por padrão; a solução é arquitetural (um modo separado sem tempo mais um modo cronometrado opt-in), detalhada abaixo.

MathML Core é um Snapshot de Candidate Recommendation da W3C (24 de junho de 2025) cujo próprio texto afirma que o atributo `alttext` não tem comportamento observável definido [3] — o MathML Core padroniza a renderização, não a semântica acessível, que provém das extensões de acessibilidade do MathJax construídas sobre o Speech Rule Engine [11], além de leitores de tela com suporte a matemática (JAWS 16+, VoiceOver) [12]. Discalculia afeta 3–6% das pessoas [4], não possui critério diagnóstico consensual, e suas intervenções com melhor evidência — manipuláveis concretos, treinamento computacional de reta numérica, exercícios adaptativos — são próximas ao que o Math Challenge já constrói [4]. Evidências para fontes específicas para dislexia são fracas a negativas; a British Dyslexia Association recomenda fontes sans-serif comuns em vez disso [5]. Legalmente, o European Accessibility Act da UE está em vigor desde 28 de junho de 2025 para produtos/serviços de consumo, incluindo comércio eletrônico [7], EN 301 549 (incorporando WCAG 2.1 na íntegra) é sua espinha dorsal técnica [9], e a regra ADA Title II dos EUA de 2024 exige WCAG 2.1 AA para sites e aplicativos de governos estaduais/locais — incluindo escolas públicas — até 2027/2028 [6], o que aparecerá em processos de compra de distritos escolares ainda que não vincule diretamente o Math Challenge.

## Resultados
### 1. WCAG 2.2: os novos critérios que mais impactam aqui

WCAG 2.2 (outubro 2023) adicionou nove critérios de sucesso em relação ao 2.1. Mais relevantes para um jogo de matemática cronometrado, com toque como prioridade e arraste habilitado:

- **2.5.8 Tamanho do Alvo (Mínimo) — AA.** “O alvo para entrada de ponteiro tem, no mínimo, 24 × 24 pixels CSS de tamanho, exceto quando: Equivalente… Inline… Controle do Agente do Usuário… Essencial.” [1] Um piso, não um teto — a UI para menores de 8 anos deve mirar bem acima disso.  
- **2.5.7 Movimentos de Arraste — AA (novo).** “Funcionalidade que pode ser operada por movimentos de arraste também pode ser operada por ativações de ponteiro único sem arraste, a menos que o arraste seja essencial.” [10] Qualquer mecânica de “arrastar para a linha numérica” precisa de um equivalente de toque-para-posicionar.  
- **2.5.1 Gestos de Ponteiro — A.** “Toda funcionalidade que usa gestos multiponto ou baseados em caminho para operação pode ser operada com um único ponteiro sem gesto baseado em caminho, a menos que… seja essencial.” [8]  
- **2.5.4 Atuação por Movimento — A.** Entrada por movimento do dispositivo também deve ser operável via componentes de UI, com resposta de movimento desativável [8] — relevante se “inclinar para responder” for considerado.  
- **1.4.10 Refluxo — AA.** “O conteúdo pode ser apresentado sem perda de informação ou funcionalidade, e sem exigir rolagem em duas dimensões para: conteúdo de rolagem vertical em largura equivalente a 320 pixels CSS… Exceto para partes do conteúdo que requerem layout bidimensional para uso ou significado.” [13] Uma tela de geometria pode plausivelmente alegar a exceção; o chrome ao redor (botões, pontuação, instruções) não pode.  
- **1.4.1 Uso de Cor — A.** “A cor não é usada como o único meio visual de transmitir informação, indicar uma ação, solicitar uma resposta ou distinguir um elemento visual.” [14] Diretamente implicado por feedback codificado por cor (correto/incorreto) ou níveis de dificuldade.  
- Outras adições do 2.2 (Foco Não Obstruído, Aparência de Foco, Ajuda Consistente, Entrada Redundante, Autenticação Acessível) são mais relevantes para a camada de conta/portal; **3.3.8 Autenticação Acessível** vale sinalizar se algum bloqueio de perfil usar um puzzle ou teste cognitivo tipo CAPTCHA como método único.

### 2. O conflito de tempo, declarado com precisão

Uma rodada pontuada por velocidade define “um limite de tempo… pelo conteúdo” — a condição disparadora para **2.2.1 Tempo Ajustável (A)**, satisfeita somente se o usuário puder desligar o limite, ajustá-lo ≥ 10× o padrão, estendê-lo com aviso, ou se ele se enquadrar na **Exceção de Tempo Real** (“uma parte obrigatória de um evento em tempo real… e nenhuma alternativa ao limite de tempo é possível”) ou na **Exceção Essencial** (“essencial e estendê-lo invalidaria a atividade”) [2]. Existe ainda uma exceção de 20 horas e uma nota vinculando este SC ao 3.2.1 (Previsível) [2]. Resolução completa abaixo.

### 3. Matemática acessível: MathML Core, MathJax, leitores de tela

MathML Core é um **Snapshot de Recomendação Candidata (24 de junho 2025)**, “não se espera que avance para Recomendação Proposta antes de 30 de setembro 2025” [3] — um subconjunto deliberadamente reduzido e testável em navegadores do MathML 3. Seu próprio texto: o atributo `alttext` “não define nenhum comportamento observável que seja específico ao atributo alttext” [3] — a especificação padroniza a renderização, não a semântica acessível. Firefox e Safari há muito suportam MathML; Chromium adicionou implementação “no início de 2023” [15]. Leitores de tela: **JAWS a partir da versão 16 suporta voz e saída Braille para MathML**; **VoiceOver lê MathML no Safari** [12]; o suporte a matemática do **NVDA** existe via complementos, mas não foi confirmado a partir de uma fonte primária aqui e deve ser verificado antes do lançamento.

**MathJax** “fornece um conjunto poderoso de extensões de acessibilidade que oferecem navegação, exploração e voz no cliente”, incluindo Zoom de Expressão e, para offline/ePub, “descrições textuais alternativas ou anotações de fala e Braille mais granulares” [11]. Por baixo dele, o **Speech Rule Engine (SRE)** converte a estrutura MathML/LaTeX em descrições em linguagem natural (“um meio mais um terço”, não nomes brutos de símbolos). **KaTeX** é mais rápido, mas tem ferramentas de acessibilidade embutidas mais fracas e normalmente requer um fallback MathML além da matemática decorativa. Renderizar fórmulas como imagens ou glifos de canvas — um atalho comum de UI amigável para crianças — não produz nada para um leitor de tela; MathML mais uma camada de acessibilidade é o único caminho que mantém a notação disponível para usuários cegos ou com baixa visão em todas as idades.

### 4. Discalculia: prevalência, identificação, intervenções

Discalculia é “um transtorno de aprendizagem, resultando em dificuldade para aprender ou compreender aritmética”, que “não reflete um déficit geral nas habilidades cognitivas ou dificuldades com tempo, medição e raciocínio espacial” [4]. **Prevalência: 3–6%**, comparável entre gêneros [4]. **Não há critério diagnóstico consensual**; a identificação combina testes de desempenho, avaliação de memória de trabalho/função executiva, avaliação docente e (em pesquisa) padrões de fMRI [4]. As intervenções com melhor evidência agrupam-se em três famílias: **manipulativos concretos** (paradigma de tutoria de Fuchs — jogos, flashcards, manipuláveis) [4]; **treinamento computadorizado de linha numérica** (*The Number Race*, *Graphogame-math*) [4]; e **software adaptativo** (*Dybuster Calcularis*, *Meister Cody – Talasia*) [4]. Isso corresponde mecanicamente ao próprio Math Challenge — um jogo de linha numérica e exercícios de aritmética — defendendo um modo explicitamente informado pela discalculia ao invés de um recurso adicional.

### 5. Tipografia para dislexia: a fonte é a parte fraca da história

Incontroverso e barato: tipo maior, espaçamento de linha generoso, linhas mais curtas, alinhamento à esquerda, sem itálico/todas maiúsculas no texto principal, contraste sólido mas não extremo. O que **não** se sustenta é a alegação de que a dislexia requer uma fonte especial. OpenDyslexic (Abbie Gonzalez, 2011) é o exemplo mais conhecido [5]. Evidência: **Rello & Baeza-Yates (2013)** descobriram que ela “não melhorou significativamente o tempo de leitura nem encurtou a fixação ocular” [5]; uma **tese de 2010** constatou que Dyslexie “não levou a leitura mais rápida” comparada ao Arial [5]; um **estudo de 2016** encontrou que leitores disléxicos **preferiram Arial** a tipografias específicas para dislexia [5]; um **estudo de 2023** mostrou preferência estética por OpenDyslexic (58%) mas “nenhuma diferença nas pontuações dos testes baseada na fonte usada” [5]. A **British Dyslexia Association** recomenda fontes sans-serif comuns em vez de fontes especiais [5]. **Conclusão:** não crie ou licencie uma “fonte para dislexia”; invista o esforço em espaçamento, comprimento de linha e iconografia consistente.

### 6. TDAH e atenção em um app de aprendizagem gamificado

O trabalho de Acessibilidade Cognitiva (COGA) da W3C mapeia para três cabeçalhos de diretriz WCAG: **2.2 Tempo Suficiente**, **2.4 Navegável**, **3.2 Previsível** [16], com padrões mais profundos na nota “Making Content Usable”. Em termos de produto: estrutura de sessão previsível, estímulos visuais/áudio concorrentes mínimos durante a resolução ativa de problemas, telas de foco único e limites de tempo ajustáveis ou evitáveis por padrão. Mecânicas de recompensa variável e comparação social — ganchos de engajamento comuns para TDAH na gamificação comercial — acarretam um custo documentado de estresse/atenção junto ao benefício de engajamento (veja o tópico 10 desta série) e devem ser tratadas como um trade-off, não como um ganho gratuito.

### 7. Autismo e design sensorial: movimento, som, previsibilidade

`prefers-reduced-motion` tem **status de disponibilidade geral desde janeiro 2020** [17] e permite que um app honre a preferência ao nível do SO. Seu racional documentado são **distúrbios vestibulares de movimento** — animações de escala/panning que causam tontura ou desorientação [17]; a extensão para autismo/sensibilidade sensorial é prática bem estabelecida embora não seja a alegação específica citada na fonte primária usada aqui. O critério WCAG **2.3.3 Animação a partir de Interações (AAA)** exige que “animação de movimento disparada por interação possa ser desativada, a menos que a animação seja essencial” [18] — AAA, não obrigatório em AA, mas barato e diretamente protetor. O som merece o mesmo tratamento: um interruptor persistente e descobrível “reduzir movimento / reduzir som”, padrão ao sinal do SO.

### 8. Deficiência visual e o problema de geometria

Geometria é o sub-domínio mais difícil para usuários cegos ou com baixa visão porque seu conteúdo é inerentemente espacial. O conjunto de ferramentas padrão: **gráficos táteis** (papel embossado/inflação ou formas impressas em 3D); **Código Braille Nemeth** (Abraham Nemeth, primeiro documentado em 1952), um sistema de seis pontos para linearizar notação matemática com cobertura total de símbolos para triângulos, círculos, paralelogramos e relações como paralela/perpendicular/ângulo [19]; e **descrição verbal estruturada** — uma gramática fixa (tipo de forma, depois vértices/lados, depois ângulos, mesma ordem sempre) que permite ao usuário de leitor de tela construir um modelo mental sem dispositivo tátil. Para um app web, o caminho de curto prazo é autoria rigorosa de texto-alternativo com gramática fixa mais dados de forma navegáveis por teclado e descrevíveis — pixels de canvas são invisíveis a um leitor de tela independentemente da qualidade do alt-text em outros lugares.

### 9. Deficiência motora e acesso por interruptor

**2.5.2 Cancelamento de Ponteiro (A)** requer que a ativação de ponteiro único não dispare no evento de pressionamento inicial, a menos que uma salvaguarda se aplique (abortar/desfazer, reversão do evento de liberação, ou um gatilho essencial de pressionamento) [8] — protegendo usuários com tremor de ativações acidentais em uma interface de toque rápido. Acesso total por interruptor também requer acessibilidade sequencial via teclado/interruptor com foco visível (2.4.7/2.4.11), e nenhuma interação que exija arraste, pinça ou duplo toque cronometrado precisamente sem uma alternativa de interruptor único.

### 10. Daltonismo em um jogo codificado por cores

Deficiências vermelho-verde (protanopia, deuteranopia) são as mais comuns; tritanopia (azul-amarelo) é mais rara; acromatopsia (total, escala de cinza) afeta uma minoria muito pequena [20]. Regra central, consistente com 1.4.1 [14]: nunca deixe que apenas a cor sinalize correto/incorreto, dificuldade ou categoria — combine cada pista de cor com forma, ícone ou texto, e verifique a paleta em simulação em escala de cinza, não apenas contra um visualizador “típico” [20].

### 11. Legendas e alternativas de áudio

Prompt de número falado, vídeo tutorial e áudio comemorativo precisam de legendas/textos sincronizados e de um caminho sem som (o caso de uso majoritário em escolas e ambientes públicos) — território padrão WCAG 1.2.x, risco comparativamente baixo ao lado dos problemas mais difíceis acima.

### 12. A camada legal

**EU European Accessibility Act (Directive 2019/882).** Conformidade obrigatória a partir de **28 de junho de 2025**: “todos os produtos e serviços relevantes disponibilizados no mercado da UE devem agora cumprir os requisitos de acessibilidade” [7]. O escopo inclui explicitamente dispositivos de computação pessoal, e-books e **serviços de comércio eletrônico** [7]. Microempresas (<10 funcionários, <€2 M de faturamento) são isentas [7]; a conformidade é auto-certificada, com penalidades variando bastante entre os Estados-membros [7]. **Se o Math Challenge vender assinaturas na UE, ele está plausivelmente no escopo como um serviço de comércio eletrônico** — a questão legal de maior prioridade aqui.

**EN 301 549.** O padrão harmonizado de acessibilidade de TI da UE; v3.2.1 “inclui o texto completo do WCAG 2.1” [9] e é a referência técnica tanto para a Web Accessibility Directive quanto para o EAA, estendendo-se além de sites para aplicativos móveis e serviços de telecomunicações; o Canadá o adotou formalmente em 2024 [9].

**US ADA Title II (2024) / Section 508.** Exige que entidades governamentais estaduais/locais — incluindo distritos escolares públicos — atendam ao **WCAG 2.1 AA** para conteúdo web/aplicativo, com prazos **26 de abril de 2027** (pop. ≥50.000) / **2028** (menores), com cinco exceções de conteúdo restritas [6]. A Seção 508 vincula separadamente a aquisição por agências federais [21]. O Math Challenge não está diretamente vinculado, mas compradores de distritos escolares provavelmente exigirão uma declaração de conformidade WCAG 2.1 AA (VPAT); construir para WCAG 2.2 AA satisfaz ambos os regimes com margem.

## Checklist de conformidade — critérios WCAG 2.2 AA mais em risco aqui

| SC | Nível | Risco no Math Challenge | Regra de design |
|---|---|---|---|
| 2.5.8 Target Size (Minimum) | AA | Chips de resposta/painéis numéricos dimensionados para desktop | Todos os alvos ≥24×24 px CSS; ≥44×44 px para UI de crianças <8 anos |
| 2.5.7 Dragging Movements | AA | Arrastar-para-linha-numérica, arrastar-para-ordenar | Alternativa de tocar-para-selecionar + tocar-para-colocar para cada arraste |
| 2.5.1 Pointer Gestures | A | Qualquer pinçar/deslizar-para-responder | Alternativa de ponteiro único; nenhuma essencial por design |
| 2.5.2 Pointer Cancellation | A | Pontuação de toque-rápido disparando no toque-inicial | Ativar no evento de liberação, abortar ao arrastar-para-fora |
| 2.2.1 Timing Adjustable | A | Modo padrão cronometrado | Ver “conflito de tempo” — modo sem tempo é o caminho de conformidade |
| 1.4.10 Reflow | AA | Canvas de geometria, grades coordenadas | Refluxo de toda a interface a 320 px; apenas a figura pode precisar de layout 2D |
| 1.4.1 Use of Color | A | Codificação de correto/incorreto, nível, categoria | Cada pista de cor também traz ícone/forma/texto |
| 1.4.3 / 1.4.11 Contrast | AA | Paletas brilhantes e lúdicas para crianças | 4,5:1 texto, 3:1 UI/gráficos, verificado contra a paleta real |
| 2.4.7 / 2.4.11 Focus Visible/Not Obscured | AA | Componentes de jogo customizados, sem estilo nativo de foco | Indicador de foco visível e não obstruído em todo lugar |
| 3.3.8 Accessible Authentication | AA | Portões de perfil “Resolver para desbloquear” | Nenhum teste de função cognitiva como único método de autenticação |

## O conflito de tempo — resolvido

**2.2.1 Timing Adjustable (Nível A)** se aplica sempre que “um limite de tempo… é definido pelo conteúdo” [2] — uma rodada cronometrada qualifica inequivocamente. As duas exceções que poderiam cobri-lo integralmente são restritas:

> “Exceção em tempo real: O limite de tempo é parte obrigatória de um evento em tempo real (por exemplo, um leilão), e nenhuma alternativa ao limite de tempo é possível.” [2]

> “Exceção essencial: O limite de tempo é essencial e estendê-lo invalidaria a atividade.” [2]

Nenhuma deve ser o único argumento de conformidade para a experiência padrão, porque existe uma alternativa razoável (um modo sem tempo que ensina a mesma matemática). A Exceção Essencial é defensável apenas para um modo **“Desafio de Velocidade”** distinto, claramente rotulado, onde o tempo realmente *é* a atividade medida.

**Resolução:**
1. O **modo de aprendizagem padrão** é sem tempo ou ajustável (Desligar / Ajustar ≥10× / Estender com aviso) [2].
2. Um modo **Desafio de Velocidade** separado, opt-in, mantém o tempo rígido e invoca honestamente a Exceção Essencial.
3. A progressão (sequências, desbloqueios) no modo padrão é impulsionada por precisão/conclusão, não por latência; a velocidade é um bônus exibido apenas no Desafio de Velocidade.
4. Isso também corresponde à literatura sobre ansiedade matemática (tópico 10 desta série): o relógio é o amplificador documentado de quedas de desempenho ligadas à ansiedade, portanto removê-lo do caminho padrão está alinhado à evidência, não é apenas um artifício de conformidade.

## Implicações de design

1. Renderizar toda notação matemática como MathML ou marcação ARIA acessível via camada de acessibilidade tipo MathJax — nunca glifos apenas em canvas/imagem [3][11].
2. Modo de jogo padrão sem tempo ou com timer ajustável; isolar o tempo rígido para um modo opt-in “Desafio de Velocidade” que invoque a Exceção Essencial de forma honesta [2].
3. Todos os alvos interativos ≥24×24 px CSS, ≥44×44 px para UI de crianças <8 anos [1].
4. Cada interação de arraste oferece alternativa de toque-selecionar/tocar-colocar; arrastar é um aprimoramento, nunca o único caminho [10].
5. Nunca codificar correto/incorreto, dificuldade ou categoria apenas em cor; combinar com ícone/forma/texto e verificar contra simulações de protanopia/deuteranopia/tritanopia/achromatopsia [14][20].
6. Disponibilizar controle persistente “reduzir movimento/áudio” padrão para `prefers-reduced-motion`, além do 2.3.3 AAA-only, porque a população atendida é real independentemente do status AA [17][18].
7. Construir um modo **Discalculia / Sensibilidade Numérica**: apresentação primeiro em linha-numérica, visualizações concretas/manipuláveis, rampa adaptativa modelada no Number Race/Calcularis ao invés de curva Elo genérica; descobrível nas configurações, não bloqueado por diagnóstico (não há consenso) [4].
8. Não criar/licenciar uma “fonte disléxica”; investir em espaçamento de linhas, frases instrucionais mais curtas, alinhamento à esquerda, sans-serif padrão legível [5].
9. Cada figura geométrica recebe descrição textual estruturada de gramática fixa (forma, depois vértices/lados, depois ângulos) mais dados de forma navegáveis por teclado, não renderização apenas em canvas [19].
10. Adicionar modo “Foco” de baixo estímulo para TDAH/atenção: telas de tarefa única, sem animação/áudio concorrente no meio do problema, estrutura previsível, efeitos comemorativos adiados — alinhado ao Enough Time/Navigable/Predictable da COGA [16].
11. Operabilidade total via switch/teclado: ordem de foco sequencial, indicador de foco visível e não obstruído, nenhuma interação que exija multitouch ou toque cronometrado preciso sem alternativa de ponteiro único [8].
12. Legenda/equivalente textual para todo prompt falado e clipe instrucional; permitir que todo o ciclo de resolução de problemas seja completado silenciado por padrão.
13. Tratar o EU EAA como já vinculativo (data de conformidade ultrapassada em 28 de junho de 2025) se vender para consumidores da UE; comissionar agora uma auto-avaliação estilo VPAT contra EN 301 549 [7][9].
14. Almejar WCAG 2.2 AA internamente, um superset estrito que pré-satisfaz a exigência WCAG 2.1 AA que distritos escolares dos EUA demandarão em processos de compra [6].

## Perguntas abertas para o dono do projeto
1. O Math Challenge vende atualmente para consumidores fisicamente na UE ou dentro de 12 meses? Determina se a conformidade EAA (já devida desde 28 de junho de 2025) está em vigor ou é prospectiva [7].
2. O placar público é um recurso central permanente, ou pode ser reformulado como modo opt-in Desafio de Velocidade, mantendo o relógio opcional no padrão?
3. A adoção por distritos escolares dos EUA é um canal real de mercado? Se sim, um VPAT WCAG 2.1 AA torna-se um ativo de vendas, não apenas de conformidade [6].
4. O conteúdo de geometria deve ser limitado a formas estruturadas em texto/navegáveis por teclado, ou a faixa etária mais velha necessita de canvas/SVG interativo (exigindo maior investimento em acessibilidade)?
5. Orçamento/apetite para camada de renderização de acessibilidade tipo MathJax (vozeamento baseado em SRE) versus um renderizador mais leve como KaTeX puro com ferramentas integradas mais fracas?
6. Lançar o toggle de reduzir-movimento/áudio no lançamento, ou postergar para uma fase de acessibilidade pós-lançamento, considerando que é barato, AAA-only, e protetor para usuários autistas/vestibulares [17][18]?

## Fontes

1. W3C, WCAG 2.2, SC 2.5.8 Target Size (Minimum) — https://www.w3.org/TR/WCAG22/#target-size-minimum
2. W3C, WCAG 2.2, SC 2.2.1 Timing Adjustable — https://www.w3.org/TR/WCAG22/#timing-adjustable
3. W3C, MathML Core (Candidate Recommendation Snapshot, 24 June 2025) — https://www.w3.org/TR/mathml-core/
4. Wikipedia, "Dyscalculia" — https://en.wikipedia.org/wiki/Dyscalculia
5. Wikipedia, "OpenDyslexic" — https://en.wikipedia.org/wiki/OpenDyslexic
6. ADA.gov, "2024 Title II Web and Mobile App Accessibility Rule" — https://www.ada.gov/resources/2024-03-08-web-rule/
7. Wikipedia, "European Accessibility Act" — https://en.wikipedia.org/wiki/European_Accessibility_Act
8. W3C, WCAG 2.2, SC 2.5.1 Pointer Gestures / 2.5.2 Pointer Cancellation / 2.5.4 Motion Actuation — https://www.w3.org/TR/WCAG22/#pointer-gestures
9. Wikipedia, "EN 301 549" — https://en.wikipedia.org/wiki/EN_301_549
10. W3C, WCAG 2.2, SC 2.5.7 Dragging Movements — https://www.w3.org/TR/WCAG22/#dragging-movements
11. MathJax Project, accessibility features overview — https://www.mathjax.org/#accessibility
12. Wikipedia, "MathML" (screen reader support) — https://en.wikipedia.org/wiki/MathML
13. W3C, WCAG 2.2, SC 1.4.10 Reflow — https://www.w3.org/TR/WCAG22/#reflow
14. W3C, WCAG 2.2, SC 1.4.1 Use of Color — https://www.w3.org/TR/WCAG22/#use-of-color
15. Wikipedia, "MathML" (Chromium implementation history) — https://en.wikipedia.org/wiki/MathML
16. W3C WAI, Cognitive Accessibility overview — https://www.w3.org/WAI/cognitive/
17. MDN Web Docs, "prefers-reduced-motion" — https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
18. W3C, WCAG 2.2, SC 2.3.3 Animation from Interactions — https://www.w3.org/TR/WCAG22/#animation-from-interactions
19. Wikipedia, "Nemeth Braille" — https://en.wikipedia.org/wiki/Nemeth_Braille
20. WebAIM, "Visual Disabilities: Color Blindness" — https://webaim.org/articles/visual/colorblind
21. Section508.gov, "Laws and Policies" — https://www.section508.gov/manage/laws-and-policies/
22. W3C, WCAG 2.2 Quick Reference (new success criteria in 2.2) — https://www.w3.org/WAI/WCAG22/quickref/?versions=2.2
