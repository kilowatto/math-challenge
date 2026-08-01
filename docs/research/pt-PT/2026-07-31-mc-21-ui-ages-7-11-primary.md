# Design de UI/UX para crianças dos 7 aos 11 anos (banda PRIMARY / ELEMENTARY)

> Math Challenge research — 2026-07-31 — topic 21

## Resumo executivo (ES)

A faixa PRIMÁRIA (7-11) corresponde ao estágio «operacional concreto» de Piaget: raciocinam com lógica sobre objetos concretos e ganham «decentralização» (atender a várias dimensões ao mesmo tempo), mas ainda não dominam bem o abstrato [1]. NN/g documenta que esta faixa navega com mais independência que os pré‑leitores de 3‑5 anos, mas continua a rejeitar conteúdo dirigido mesmo que esteja um grau escolar acima ou abaixo do próprio [2]. Um estudo de avatares (arXiv, 48 participantes de 8‑13 anos) documenta o «efeito guarda‑roupa»: as crianças criam vários avatares mas utilizam sistematicamente apenas um [4]. A investigação da NN/g sobre adolescentes (100 utilizadores de 13‑17, 210 sites) define o teto que a PRIMÁRIA deve evitar tocar por baixo: os adolescentes rejeitam a palavra «Kids» e o excesso de animação decorativa [3]. O COPPA exige consentimento parental verificável para menores de 13 anos e limita que dados podem ser recolhidos, restringindo qualquer funcionalidade social nesta faixa [9]. A discalculia (5-10% da população) exige representar quantidades de forma visual além de numérica e evitar pressão de tempo [11]. Este relatório traduz estas constatações numa especificação para o tema PRIMÁRIA, diferenciada de KINDER e de TEEN, por telemóvel, tablet e computador de secretária.

## Resumo executivo (EN)

A banda PRIMÁRIA (idades 7-11) situa‑se no estágio «operacional concreto» de Piaget: raciocínio lógico sobre objetos concretos mais «decentralização» (atender a mais de uma dimensão simultaneamente), mas ainda com raciocínio abstrato fraco [1]. NN/g demonstra que esta banda navega com mais independência do que os pré‑leitores de 3‑5 anos, mas continua a rejeitar conteúdo apresentado mesmo que esteja um nível de ano fora [2]. Um estudo de avatares (arXiv, 48 participantes com idades entre 8‑13) documenta o «efeito guarda‑roupa»: as crianças criam vários avatares mas fixam‑se consistentemente num só [4]. A pesquisa da NN/g sobre adolescentes (100 utilizadores com idades entre 13‑17, 210 sites) define o teto que a PRIMÁRIA deve evitar tocar por baixo: os adolescentes rejeitam a palavra «Kids» e a animação decorativa excessiva [3]. O COPPA requer consentimento parental verificável para menores de 13 anos e restringe a recolha de dados, limitando diretamente qualquer funcionalidade social nesta banda [9]. A discalculia (5-10% da população) requer associar numerais a uma quantidade visual e evitar pressão de tempo [11]. Este relatório transforma estas constatações numa especificação para o tema PRIMÁRIA, diferenciada de KINDER e TEEN, para telemóvel, tablet e computador de secretária.

## Constatações

### 1. Cognitive development: what 7-11 can actually do

A fase operatória concreta de Piaget cobre esta faixa: conservação, raciocínio indutivo e «decentralização» — acompanhar mais de uma variável no ecrã em vez de fixar‑se numa — mas ainda apresenta raciocínio abstrato/hipotético fraco, o que argumenta contra interfaces que exigem manter uma regra na memória sem um apoio concreto (linha numérica, agrupamento, passo trabalhado) [1]. As categorias próprias da NN/g dividem o «intervalo médio» 6‑8 (ainda com apoio) do «mais velho» 9‑12 (navegação independente, leitura mais avançada) [2], pelo que PRIMARY não é internamente uniforme — uma criança de 7 anos situa‑se mais perto de KINDER, uma de 11 anos mais perto de TEEN.

### 2. "Cool" versus "babyish": the rejection mechanism

A evidência citável mais clara sobre o limite *superior* provém do corpus de adolescentes da NN/g: adolescentes (13‑17) rejeitam explicitamente a palavra «Kids», não gostam de visuales desordenados ou chamativos e desejam interatividade limpa e intencional, com secções rotuladas separadamente «Kids» e «Teens» quando ambas existem [3]. O mecanismo é a rejeição de uma auto‑imagem ultrapassada, não uma preferência de detalhe — uma criança que atravessa os 7‑11 está a renegociar «não ser mais uma criança pequena» bem antes de se tornar adolescente, pelo que PRIMARY tem de sinalizar mais capacidade do que um tema de mascote e bolhas sem adotar o aspeto mais plano e denso que os adolescentes preferem [3].

### 3. Avatars and customization as identity work

Um estudo de 2026 com 48 crianças de 8‑13 anos que criavam avatares em jogos sociais identificou quatro motivações: autorrepresentação, experimentação com identidades alternativas, necessidades sociais e desempenho no jogo; o design de monetização molda mensuravelmente o que as crianças constroem [4]. A principal descoberta é o «efeito guarda‑roupa» — as crianças criam vários avatares mas convergem para usar apenas um, pelo que o *processo* de personalização é onde reside o valor, ainda que o produto final seja limitado [4]. A síntese do Digital Wellness Lab acrescenta que os avatares funcionam melhor ao expressar um eu atual ou aspiracional, e que a inclusão tem impacto concreto: 42,1 % das meninas e 38,6 % dos meninos na pesquisa citada evitam jogos que retratam personagens femininas de forma hipersexualizada [5]. Um estudo relacionado da Frontiers (82 participantes, estratificado por etnia) constatou que a personalização versus avatares pré‑atribuídos mal alterou o humor imediato, mas a satisfação acompanhou o quão bem as opções representavam a própria identidade da criança — a sub‑representação funciona como uma «micro‑agressão subtil» [6]. As compras aleatórias ao estilo loot‑box são sinalizadas como um risco de monetização distinto, com os meninos a envolver‑se mais do que as meninas [5].

### 4. Avatars and customization as identity work

A teoria da autodeterminação enquadra as alavancas: autonomia (escolha de como progredir), competência (desafio calibrado com feedback claro) e relação (dimensão social); as recompensas extrínsecas sustentam a motivação apenas quando são percebidas como feedback sobre a competência e não como um incentivo controlador [10]. Os colecionáveis são mais duradouros quando a sua recolha está ligada a algo que a criança já valoriza (domínio, história, um objetivo auto‑definido) em vez de serem perseguidos apenas pelo prémio externo [10].

### 5. Social features and their safety implications

O COPPA exige consentimento parental verificável antes de recolher informações pessoais de uma criança menor de 13 anos, define informações pessoais de forma ampla (identificadores persistentes, geolocalização, imagens/áudio) e proíbe condicionar a participação à recolha excessiva de dados [9]. É por isso que a maioria das funcionalidades de chat e de perfil público exclui menores de 13 anos ou coloca uma barreira de consentimento parental [9] — uma restrição real a tabelas de classificação, listas de amigos ou texto livre numa faixa etária predominantemente abaixo dos 13 anos.

### 6. NN/g on the bands immediately above and below PRIMARY

A NN/g alerta contra o tratamento das «crianças» como um único grupo indiferenciado de 3‑12 anos, dividindo as faixas jovem/média/mais velha com diferentes tamanhos de letra e necessidades de apoio [2]. O relatório de adolescentes (100 utilizadores, três rondas de pesquisa, EUA/UK/Austrália) é o ponto de dados mais nítido sobre o teto: os adolescentes são excessivamente confiantes mas têm desempenho inferior ao dos adultos devido à leitura fraca, habilidades de pesquisa pobres e baixa paciência — «não se culpam, culpam‑nos» — abandonando um fluxo confuso em vez de o resolver [3]. A visão geral da NN/g sobre utilizadores jovens quantifica a divisão: um relatório com 156 recomendações para idades 3‑12 versus um relatório separado com 124 dicas para 13‑17 [7] — dois manuais, evidência de que PRIMARY precisa do seu próprio tema em vez de um tema escalado de kinder ou teen.

### 7. Error tolerance and frustration

Nenhuma fonte encontrou medida de tolerância a erros especificamente para 7‑11 diretamente. A evidência mais próxima: a descentração de Piaget indica que esta idade pode manter «errei» e «posso corrigir» como factos separados, ao contrário de uma criança de 4‑6 anos que os confunde [1]; e o corpus de adolescentes demonstra impaciência com interfaces confusas, culpando o produto, já presente aos 13‑17 anos [3]. A investigação sobre discalcúlia acrescenta um ponto concreto: a pressão temporal piora o desempenho em manipulação numérica para crianças com sentido numérico fraco, e um ritmo flexível reduz as quedas ligadas ao stress [11] — um argumento contra temporizadores de contagem regressiva estritos para esta faixa etária em geral.

### 8. Reading level, text length, iconography and labels

A segmentação da NN/g aplica‑se diretamente: crianças de 6‑8 anos precisam de texto maior e com apoio, crianças de 9‑12 anos lidam com leitura mais avançada e navegação independente, mas conteúdo mesmo que esteja a um ano de escolaridade de diferença é rejeitado — ao contrário dos adultos, que toleram um nível de 8.º a 10.º ano por defeito [2]. O corpus de adolescentes, um passo acima, recomenda um nível de leitura de 6.º ano ou inferior mesmo para um público nominalmente mais avançado, porque a velocidade e a atenção — não a decodificação — são o gargalo [3]. Essa lógica aplica‑se com mais força aqui: rótulos curtos, uma ideia por ecrã, ícones literais em vez de metafóricos.

### 9. Onboarding without long tutorials

Nenhum estudo abordou a duração de tutoriais de integração especificamente para 7‑11 — uma lacuna de evidência. Evidência transferível: a baixa paciência do corpus de adolescentes para qualquer coisa que atrase a tarefa orientada a objetivos [3], e a descoberta operatória concreta de que instruções abstratas sem um exemplo concreto inicial são mal retidas [1] — juntos defendem «aprender ao fazer o primeiro problema real, com dicas de apoio», e não um explicador de múltiplas ecrãs.

### 10. Device context

Nenhuma fonte recolheu medida de uso de tablet partilhado ou Chromebook escolar para esta faixa exata — uma segunda lacuna, sinalizada em vez de encoberta. Continua a ser uma restrição quase certa — troca rápida de perfis, limites claros de sessão, sem pressupor um login pessoal persistente — que as implicações de design abaixo tratam como requisito mesmo sem citação de apoio.

### 11. Accessibility: dyslexia typography and dyscalculia

A tipografia amiga da dislexia converge para parâmetros verificáveis: tipos de letra sans‑serif abertos (Arial, Verdana, Open Sans, ou os específicos Atkinson Hyperlegible/OpenDyslexic), texto corporal mínimo de 16 px, 1,5× espaçamento entre linhas, 0,12 em espaçamento entre letras, 0,16 em espaçamento entre palavras, comprimento de linha de 45‑100 caracteres, contraste WCAG 4.5:1 (3:1 para texto grande/negrito), alinhamento à esquerda, sem todo em maiúsculas ou itálico pesado [8]. A discalcúlia (5‑10 % de prevalência) é uma dificuldade neurobiológica com sentido de quantidade, mapeamento número‑para‑quantidade, memorização de factos e manutenção de números na memória durante cálculos, em todos os níveis de dificuldade [11]. A resposta de design: emparelhar numerais com uma quantidade visual (pontos, blocos, uma linha numérica) em vez de dígitos nus, minimizar a desordem, oferecer mais de uma modalidade de entrada, evitar ou tornar opcional qualquer pressão temporal [11].

### 12. On-screen numeric input

Nenhum estudo dedicado ao teclado numérico para 7‑11 foi encontrado — uma terceira lacuna. Dois achados adjacentes delimitam o design: o HIG da Apple define 44×44 pt como o piso geral de alvo tocável [12], e a diferença de precisão motora ao toque entre crianças e adultos — grande na faixa de 3‑6 anos — fecha aproximadamente ao primeiro ano de escolaridade [relatório acompanhante, tópico 20]. O apelo da literatura sobre discalcúlia a múltiplas modalidades de entrada [11] defende um teclado que não seja o *único* caminho de resposta — toques de escolha múltipla, uma linha numérica tocável/arrastável, ou um teclado, escolhido conforme o tipo de problema.

## Implicações de design para o Math Challenge

1. **Alvos táteis: 48×48 CSS px mínimo em telemóvel/tablet, 44×44 px em desktop com rato** — um pouco acima do limite de 44×44 pt da Apple [12], não o mínimo muito maior do KINDER (~88‑96 px), uma vez que a diferença de precisão motora em relação aos adultos está amplamente fechada aos 7‑10 [companion report, topic 20]. Esta é a diferença mecânica mais clara em relação ao KINDER: sem zonas “seguras para bebés” superdimensionadas.  
2. **Tipografia: sans‑serif arredondado mas não extravagante**, base de 18‑20 px para o texto do problema, 16 px mínimo para a etiqueta secundária — menor e menos “estrondosa” que os numerais de 24‑32 px do KINDER. Oferecer um alternador amigável à dislexia na aplicação (Atkinson Hyperlegible/OpenDyslexic, 1,5× line‑height, 0,12 em spacing, alinhamento à esquerda) conforme os parâmetros documentados [8].  
3. **Paleta: saturada mas não pastel, nem neon.** Uma paleta confiante, adjacente a jogos, de tons joia (teal, indigo, amber, coral) usada com moderação — a cor indica estado/categoria, não todas as superfícies. Longe da direção mais plana e monocromática do TEEN, implícita na aversão dos adolescentes a visuales “glitzy” [3]: o PRIMARY mantém notavelmente mais cor e calor.  
4. **Densidade: uma tarefa por ecrã com contexto visível** (faixa de progresso, pequeno indicador de sequência/avatar) — o KINDER omite isto, o TEEN renderizaria como estatísticas densas. A descentração permite que esta faixa contenha “onde estou nesta sessão” ao lado do problema atual [1].  
5. **Movimento: intencional e ágil, não saltitante.** Reduzir o mascote de animação constante em idle do KINDER para um padrão mais calmo (presente, estático exceto nas mudanças de estado) mantendo animações rápidas de confirmação — entre a preferência de animação do KINDER e a tolerância inferida mais baixa do TEEN para decoração, da aversão dos adolescentes a “multimédia sem sentido” [3].  
6. **Avatares: construir para o efeito de guarda‑roupa, não contra ele.** Criação de avatar barata e de baixa fricção, esperando que as crianças se fixem num; investir profundidade em traços que se mostraram importantes (cabelo, roupa, acessórios, opções inclusivas de tom de pele/corpo/género) em vez de amplitude de opções descartáveis [4][5]. Desbloquear itens através do progresso, nunca caixas de recompensa com dinheiro real [5].  
7. **Progressão: vincular desbloqueios à competência, não ao tempo gasto.** Emblemas, sequências e colecionáveis são percebidos como feedback de domínio (um tópico aprendido, uma sequência de respostas genuínas), com alguma escolha do utilizador sobre o que perseguir a seguir, satisfazendo a alavanca da autonomia [10].  
8. **Social: sem chat aberto, sem perfil público, sem classificação visível fora de um grupo gerido por professor/pai**, apenas nome próprio ou alcunha — consequência direta do COPPA para uma audiência maioritariamente com menos de 13 anos [9].  
9. **Respostas erradas: corretivas, não punitivas, mais diretas que o KINDER.** Mostrar o caminho correto (passo resolvido, auxílio visual de quantidade), não apenas um som de incentivo — esta faixa pode conter “estava errado” e “aqui está a correção” separadamente [1]; um simples X vermelho sem caminho a seguir violaria a cautela motivada pela discalculia contra pressão sem apoio [11].  
10. **Sem temporizadores de contagem decrescente rígidos por defeito; tornar a cronometragem opcional por conjunto.** A pressão de tempo degrada o desempenho de crianças com fraca noção numérica, e a prevalência de 5‑10 % é suficientemente alta para desavantajar uma parte real de qualquer base de utilizadores de tamanho de turma [11].  
11. **Entrada numérica: combinar a modalidade ao tipo de problema**, não um teclado universal — toques de escolha múltipla para verificações de conceito, toque/arrasto de linha numérica para magnitude, teclado de 48 px para inserção de numerais abertos — conforme a cautela da literatura sobre discalculia contra um único caminho de entrada forçado [11].  
12. **Duração da sessão: rondas curtas com um ponto de paragem visível a cada alguns problemas** (um conjunto de problemas temático, não uma única questão) — não foi encontrado um benchmark exato de minutos por idade nesta análise; trate qualquer número como uma decisão de produto informada, não ditada, pelo padrão de paciência documentado numa faixa superior [3].  
13. **Definições de dispositivo: troca rápida de perfil sem escrita**, sem suposição de login pessoal persistente, para tablets familiares partilhados ou Chromebooks escolares — um requisito inferido, não citado, dado o lapso observado na §10.  
14. **Integração: saltar a sequência de tutorial; ensinar através do primeiro problema real** com apoio integrado (primeiro passo resolvido, botão de dica), correspondendo à baixa paciência desta faixa para atrasos [3] e à fraca retenção de instruções abstratas sem um âncora concreto [1].

## Anti‑padrões a evitar

- **Alvos superdimensionados do KINDER e animação constante do mascote em idle tal como estão** — parece infantil para um jovem de 9‑11 anos; não suportado pelas evidências motoras desta idade [companion report, topic 20].  
- **A palavra "Kids" em qualquer texto voltado ao PRIMARY** — um repelente documentado para adolescentes, e a renegociação “não é uma criança pequena” começa mais cedo [3].  
- **Chat, perfis públicos ou classificações não delimitadas** sem um grupo gerido por pai/professor — exposição direta ao COPPA para uma audiência maioritariamente com menos de 13 anos [9].  
- **Compras cosméticas aleatórias ao estilo loot‑box** — um risco de monetização próximo do jogo que os rapazes utilizam mais [5].  
- **Um único teclado obrigatório para todos os problemas** — contradiz a recomendação de múltiplas modalidades de entrada da pesquisa sobre discalculia [11].  
- **Temporizadores de contagem decrescente ativados por defeito** — piora mensuravelmente o desempenho de um grupo de alta prevalência (5‑10 %) [11].  
- **Um tutorial longo e passo a passo antes do primeiro problema real** — combate a impaciência com atraso e fraca retenção de instrução abstrata [1][3].  
- **Feedback punitivo de resposta errada (X vermelho, sem caminho a seguir)** — deixa a criança presa exatamente onde o apoio, não a pressão, é necessário [11].  
- **Assumir um login pessoal persistente como o único caminho de autenticação** — ignora a realidade de dispositivos partilhados em tablets familiares e Chromebooks escolares, embora este relatório não tenha encontrado citação direta a quantificar essa realidade para esta faixa exata.

## Questões abertas para o proprietário do projeto

1. Deve o PRIMARY suportar um **classificação limitada a professor/aula** além de uma familiar, dado que o requisito de consentimento do COPPA se aplica de forma diferente quando uma escola inscreve a criança em vez de um pai diretamente [9]?  
2. Qual é a posição do Math Challenge sobre **qualquer superfície de compra com dinheiro real** acessível a partir da experiência voltada para a criança no PRIMARY — ausente totalmente, ou presente atrás de um portão parental sem mecânica aleatória?  
3. Devem os avatares ser **partilhados/portáteis entre KINDER, PRIMARY e TEEN** à medida que a criança envelhece, ou cada faixa deve ter um sistema separado que corresponda à sua própria linguagem visual?  
4. Dado o efeito de guarda‑roupa [4], vale a pena **armazenar múltiplos avatares** ou o PRIMARY deve oferecer um único slot editável para corresponder ao uso real?  
5. Deve o **alternador de tipografia amigável à dislexia** ser exposto diretamente à criança, ou apenas configurado por um pai/professor?  
6. O Math Challenge já possui um **benchmark interno ou licenciado de duração de sessão por idade** que deveria substituir a lacuna de “nenhum dado encontrado” assinalada aqui, em vez de deixá‑la como uma decisão puramente de produto?

## Fontes

1. Wikipedia. "Piaget's theory of cognitive development" (concrete operational stage: conservation, inductive reasoning, decentration, limits on abstract reasoning).  
   https://en.wikipedia.org/wiki/Piaget%27s_theory_of_cognitive_development  
2. Nielsen Norman Group. "Children's UX: Usability Issues in Designing for Young People" (age-banding 3-5/6-8/9-12; grade-level rejection; animation preference; ad-blindness).  
   https://www.nngroup.com/articles/childrens-websites-usability-issues/  
3. Nielsen Norman Group. "Teenagers' UX: Designing Websites for Teens" (100 users aged 13-17, 210 sites/30 apps; 6th-grade reading recommendation; "Kids" as repellent; low patience; dislike of clutter).  
   https://www.nngroup.com/articles/usability-of-websites-for-teenagers/  
4. arXiv. "Understanding Children's Avatar Making in Social Online Games" (48 participants aged 8-13; four motivations; the "wardrobe effect").  
   https://arxiv.org/abs/2502.18705  
5. Digital Wellness Lab. "Young People's Use of Avatars and Virtual Character Customization" research brief (identity expression, gendered customization, hypersexualization-avoidance stats, loot-box concerns).  
   https://digitalwellnesslab.org/research-briefs/young-peoples-use-of-avatars-and-virtual-character-customization/  
6. Frontiers in Virtual Reality. "Designing the Self: Avatar Customization, Identity, and Affective Experience" (82 participants, ethnicity‑stratified; customization satisfaction vs. representation).  
   https://www.frontiersin.org/journals/virtual-reality/articles/10.3389/frvir.2026.1784948/full  
7. Nielsen Norman Group. "Young Users Usability Research Reports" (topic page: 156-recommendation Children ages 3-12 report vs. 124-tip Teenagers ages 13-17 report).  
   https://www.nngroup.com/reports/topic/young-users/  
8. accessiBe. "Dyslexia-Friendly Fonts & Typography Best Practices" (font choice, 16 px minimum, 1,5x line‑height, 0,12 em letter‑spacing, 0,16 em word‑spacing, 45‑100 character lines, WCAG 4.5:1/3:1 contrast).  
   https://accessibe.com/blog/knowledgebase/dyslexia-friendly-fonts  
9. Wikipedia. "Children's Online Privacy Protection Act" (under-13 threshold, personal-information definition, verifiable parental consent, restriction on excess data collection).  
   https://en.wikipedia.org/wiki/Children%27s_Online_Privacy_Protection_Act  
10. Wikipedia. "Self-determination theory" (autonomy/competence/relatedness; intrinsic vs. extrinsic reward mechanics).  
    https://en.wikipedia.org/wiki/Self-determination_theory  
11. Understood.org. "What Is Dyscalculia" (5‑10 % prevalence, quantity-sense and numeral-mapping difficulty, time‑pressure sensitivity, multi‑input recommendations).  
    https://www.understood.org/en/articles/what-is-dyscalculia  
12. Apple Developer. Human Interface Guidelines — Accessibility (44×44pt minimum tappable target).  
    https://developer.apple.com/design/human-interface-guidelines/accessibility  

**Lacunas de evidência assinaladas neste relatório** (nenhuma fonte obtida abordou estas questões especificamente para a faixa 7‑11): benchmarks exatos de duração de sessão por idade; estudos sobre a extensão do tutorial de integração; medição de uso de tablets familiares/Chromebooks escolares; estudo dedicado de design de teclado numérico para esta idade. As implicações de design baseadas nestas lacunas estão marcadas como inferidas acima, não citadas como constatação estabelecida.
