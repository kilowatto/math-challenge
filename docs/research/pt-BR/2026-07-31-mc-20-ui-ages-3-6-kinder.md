# UI and interaction design for children aged 3-6 (KINDER band)

> Math Challenge research — 2026-07-31 — topic 20

## Resumen ejecutivo (ES)

As crianças de 3 a 6 anos têm precisão motora muito inferior à de um adulto: Hourcade et al. (2004) mediram 90 % de precisão de apontamento em crianças de 4 anos apenas com alvos de 23,7 mm, muito acima dos ~9 mm (44pt) que as diretrizes para adultos assumem [1][2]. O arrastar‑e‑soltar (“drag-and-drop”) é o gesto que mais falha nessa idade: é significativamente mais lento que o toque segundo a lei de Fitts em crianças de 4‑6 anos (não assim em crianças de 7‑10) [4], e aparece repetidamente como o gesto mais difícil de executar junto com o duplo toque e o traço [3][5]. A política da Apple para a categoria Kids exige “parental gates” com tarefas de nível adulto antes de compras ou links externos, e indicações por voz para crianças que ainda não leem [11]. O marco dos “quatro pilares” de Hirsh‑Pasek (ativo, engajado, significativo, socialmente interativo) é o padrão acadêmico para avaliar se um app é realmente educativo, não apenas “educativo” de nome [10]. NN/g documenta que crianças de 3‑5 anos preferem animação e som — ao contrário dos adultos — e que precisam de navegação espacial e metáforas da vida real porque ainda não leem [8][9]. A FTC sancionou a Epic Games com $520M por padrões escuros que permitiam compras acidentais de menores [13], o que é diretamente relevante para qualquer fluxo de pagamento ou saída do app. Este relatório traduz esses achados em uma especificação concreta para a faixa KINDER do Math Challenge: tamanhos de alvo tátil, tipografia, paleta, som, animação, profundidade de navegação, número de toques para iniciar um desafio, forma da entrada de resposta e comportamento diante de resposta incorreta, diferenciado por telefone, tablet e desktop.

## Executive summary (EN)

As crianças de 3 a 6 anos têm precisão motora marcadamente menor que a dos adultos. Hourcade et al. (2004) mediram 90 % de precisão de apontamento em crianças de 4 anos apenas em alvos de 23,7 mm, bem acima da linha de base de ~9 mm (44pt) das diretrizes adultas [1][2]. Arrastar‑e‑soltar é o gesto que mais falha nessa idade: é significativamente mais lento que o toque sob a lei de Fitts para crianças de 4‑6 anos (mas não para crianças de 7‑10 anos) [4], e reaparece repetidamente como o gesto mais difícil junto com duplo toque e traçado [3][5]. A política da Apple para a categoria Kids requer “parental gates” — tarefas de nível adulto — antes de compras ou links externos, e prompts de voz para crianças pré‑alfabetizadas [11]. O framework dos “quatro pilares” de Hirsh‑Pasek (ativo, engajado, significativo, socialmente interativo) é o padrão acadêmico para determinar se um app é realmente educativo e não apenas educativo de nome [10]. NN/g documenta que crianças de 3‑5 anos preferem animação e som — ao contrário dos adultos, que geralmente não gostam — e precisam de navegação espacial e metáforas da vida real porque ainda não sabem ler [8][9]. A FTC multou a Epic Games em $520M por padrões escuros que permitiam compras acidentais por menores [13], diretamente relevante para qualquer fluxo de pagamento ou saída. Este relatório traduz esses achados em uma especificação concreta para a faixa KINDER do Math Challenge: tamanhos de alvos táteis, tipografia, paleta, som, animação, profundidade de navegação, toques para iniciar um desafio, forma de entrada de resposta e comportamento diante de resposta errada, segmentado por celular, tablet e desktop.

## Findings

### 1. Desenvolvimento motor e precisão de toque

Hourcade, Bederson, Druin e Guimbretière (2004) testaram apontamento com mouse em pré‑escolares e descobriram que o tamanho do alvo teve “um efeito significativo na precisão e no re‑entrada do alvo”; crianças de 4 anos atingiram 90 % de precisão de apontamento apenas com tamanhos de alvo em torno de **23,7 mm** — aproximadamente 2,5 × o guia adulto comumente citado de 44 pt (~9,2 mm) [1][2]. Trabalhos específicos sobre telas sensíveis ao toque confirmam a mesma lacuna para entrada por toque direto. O estudo de Vatavu, Cramariuc e Schipor “Touch interaction for children aged 3 to 6 years” analisou crianças na fase pré‑operatória de Piaget realizando toque e arrastar‑e‑soltar em telefones e tablets e relatou erro e variância sistematicamente maiores que as linhas de base de adultos [3]. Um artigo de síntese, “Physical dimensions of children's touchscreen interactions: Lessons Learned”, conduziu seis estudos com mais de 180 participantes (116 crianças) e cita a descoberta de Baloian et al. (2013) de que **tracing, double‑tapping e drag‑and‑drop foram os gestos mais difíceis** de executar de forma confiável para crianças de 5‑6 anos [5][6]. Pesquisas sobre gestos por idade relatam que crianças de 2‑3 anos podem realizar toque, deslizar e flick, enquanto crianças de 4‑6 anos adicionam arrastar‑e‑soltar e pinçar‑para‑zoom — mas com sucesso marcadamente menor que crianças em idade escolar: um estudo encontrou que apenas crianças de 7‑8 anos alcançaram arrastar‑e‑soltar confiável (30 % de sucesso) e seguir instruções de áudio/vídeo (34 %) [6]. Um estudo de validade da Lei de Fitts mostrou que o tempo de movimento foi “significativamente maior para drag‑and‑drop do que para toque” especificamente em crianças de 4‑6 anos, com a diferença desaparecendo entre 7‑10 anos — o déficit está ligado à idade e se fecha por volta do primeiro ano do ensino fundamental [4].

### 2. Por que o arrastar‑e‑soltar tem dificuldades e o que funciona melhor

Arrastar‑e‑soltar requer contato sustentado do dedo, rastreamento visual contínuo de um alvo em movimento e liberação controlada — três subtarefas motoras/atencionais encadeadas, razão pela qual consistentemente tem desempenho inferior ao toque simples em toda a literatura acima [3][4][5][6]. Um estudo da York University (FittsFarm) constatou que a precisão de arrastar‑e‑soltar melhorou significativamente com um **estiloso de baixo custo em vez de entrada por dedo**, já que o estiloso reduz a oclusão e o ruído da área de contato de uma ponta de dedo [7]. O relatório de prototipagem da Khan Academy Kids chegou a uma conclusão complementar: respostas de arrastar‑e‑soltar correlacionaram *mais fortemente* com outros itens de avaliação válidos do que o toque, porque as crianças tratam o arrasto como mais deliberado — útil para avaliação, mas motivo para reservá‑lo para casos em que a deliberatividade é desejada, não para entrada rotineira [15]. Implicação prática para crianças de 3‑6 anos: **prefira toque‑para‑selecionar em vez de arrastar‑e‑soltar** como mecânica de resposta principal; se um arrasto for usado (por exemplo, “coloque a maçã na cesta”), mantenha a distância curta, o alvo grande e adicione um ímã de encaixe que registre um lançamento impreciso ainda como correto.

### 3. Design audio‑first e texto‑para‑fala

Como a leitura está “não desenvolvida de forma alguma” nessa idade segundo a pesquisa por faixas etárias da NN/g (3‑5 vs. 6‑8 vs. 9‑12) [8][9], toda instrução, número e prompt precisam de equivalente falado, não apenas texto. Pesquisas mais recentes da NN/g sobre UX infantil descobriram que crianças de 3 anos já reconhecem ícones de players de vídeo (play, pause, volume, fullscreen) por exposição repetida mesmo sem saber ler, sugerindo que o pareamento ícone+som constrói compreensão real e transferível nessa idade [9]. Os testes internos da Khan Academy Kids servem como alerta útil aqui também: adicionar sons únicos a personagens na tela fez as crianças “passarem mais tempo tocando monstros para ouvir ruídos do que focando” na tarefa — a novidade sonora pode se tornar distração, portanto o som deve ser proposital (confirmando uma ação, lendo um prompt) e não decorativo‑interativo [15].

### 4. Compreensão de ícones

Pesquisas sobre pictogramas/ícones geralmente tratam a compreensão de símbolos como ainda em desenvolvimento durante os anos pré‑escolares e enfatizam a concreção sobre a abstração — um ícone fotográfico ou literal (uma maçã, um número inteiro de pontos) é compreendido bem antes de um ícone abstrato ou metafórico [17][18]. Isso está alinhado com a constatação da NN/g de que crianças de 3 anos reconhecem ícones *funcionais* ligados a uma ação consistente e repetida (play/pause) em vez de ícones novos ou pontuais [9].

### 5. Personagens, mascotes e animação

A NN/g relata explicitamente que crianças pequenas (3‑5) “mostraram preferência por animação e som”, apontando que isso é o oposto da preferência adulta, onde tais elementos são “geralmente desagradáveis” [8]. Essa é uma das divergências mais claras entre UX adulta e infantil no corpus e justifica investimento em nível de tema em um mascote consistente para a faixa KINDER, já que um personagem recorrente também serve como veículo para narração em áudio e para suavizar feedback de resposta errada (ver §7).

### 6. Cor e design visual

Um estudo dedicado à cor de interface para aplicativos infantis constatou que “a frequência de alta saturação em interfaces de usuário infantis é maior que em interfaces de usuário adultas” [16], e trabalhos de eye‑tracking sobre preferência de cor infantil encontraram tons quentes (vermelho, laranja, amarelo) ligeiramente dominantes, embora a interação precisa de matiz/saturação/brilho permaneça inconclusiva ao nível de pesquisa [19]. Diretrizes tipográficas convergem para tipos sans‑serif grandes, simples e arredondados: uma síntese de praticantes especifica um mínimo de 18‑19 px para texto de corpo/etiqueta nessa faixa etária, bem acima do texto corporal móvel adulto [12].

### 7. Feedback, recompensa e tratamento de erro

Os testes de usabilidade da NN/g afirmam claramente que crianças pequenas “esperam feedback em cada ação que realizam” [12] — silêncio após um toque é percebido como “quebrado”, não como “nada aconteceu”. Combinado ao framework de quatro pilares que enfatiza o engajamento *significativo* sobre loops de recompensa chamativos [10], e ao alerta da Smashing Magazine de que mecânicas de recompensa extrínseca podem minar a motivação intrínseca ao longo do tempo [12], a implicação é: forneça feedback sensorial instantâneo (som + micro‑animação) a cada toque, mas mantenha a camada de *recompensa* (estrelas, emblemas, celebração do mascote) vinculada à conclusão genuína da tarefa, não ao simples ato de tocar.

### 8. Navegação, duração da sessão e saídas acidentais

As diretrizes da categoria Kids da Apple exigem um “portão parental” — uma tarefa de nível adulto como um problema de matemática — antes de uma compra dentro do app ou qualquer link externo, com prompts de voz para que crianças pré‑alfabetizadas entendam por que estão bloqueadas [11]. O programa Families do Google Play impõe obrigações de política comparáveis para revisão de conteúdo e publicidade comportamental [14]. A FTC trata formalmente padrões escuros que permitem que crianças acumulem compras sem que um pai perceba como prática enganosa; seu acordo de 2022 com a Epic Games sobre Fortnite custou US$ 520 mi especificamente por “padrões escuros para enganar jogadores a fazer compras indesejadas” acessíveis a crianças [13]. Quanto à duração da sessão, a orientação mais recente da AAP sobre mídia infantil (coberta em um release de 2026 no healthychildren.org) organiza recomendações por faixa etária — incluindo “primeira infância 0‑5” — e pede “designs centrados na criança” construídos com crianças e famílias no processo de design, embora o trecho público não forneça um número exato de minutos por sessão [20]; trate qualquer número específico como decisão de produto, não como padrão citado, na ausência do relatório técnico completo da *Pediatrics*.

### 9. Login sem leitura

Nenhuma das fontes consultadas especifica um estudo nomeado de “senha pictórica” para essa faixa etária exata, sendo essa uma lacuna de evidência genuína na literatura aplicada encontrada. O que está estabelecido, e sobre o que qualquer login baseado em avatar/PIN deve se apoiar, é (a) a evidência da NN/g e da linha de pesquisa de Hourcade de que o reconhecimento de ícones por exposição repetida é confiável bem antes da leitura de texto [9], e (b) a exigência da Apple de que qualquer ação bloqueada por adulto para esse grupo etário use um **mecanismo não textual, pareado com áudio** [11]. Um padrão de grade de avatares “escolha seu rosto” (usado por apps no estilo Khan Academy Kids) está consistente com ambos: não requer leitura, nem digitação, e é trivialmente rápido para uma criança de 4 anos executar corretamente.

### 10. Co‑jogo com pais

O próprio framework de quatro pilares trata “interativo socialmente” como um dos quatro pilares obrigatórios de um app educacional — um app que funciona melhor *com* um adulto co‑jogando pontua mais alto nessa dimensão, não menos [10]. O mecanismo de portão parental da Apple e o programa Families do Google formalizam uma camada distinta e separada voltada ao pai (configurações, aprovação de compra, limites de tempo) da experiência voltada à criança [11][14], que é a arquitetura a ser copiada: duas superfícies claramente separadas, não uma tela compartilhada com controles adultos ocultos.

## Implicações de design para Math Challenge

1. **Alvo de toque mínimo: 88×88 px CSS em telefone/tablet, 76×76 px aceitável em desktop com mouse.** Derivado da medida de 23,7 mm de Hourcade et al. em uma linha de base típica de ~160 dpi (≈150 px em uma tela de ativos de alta densidade, escalando para ~88‑96 px CSS após considerar a relação de pixels do dispositivo) [1][2], e verificado contra o mínimo de praticante da Smashing Magazine de 75×75 px para esta faixa etária [12]. Use a medida maior, não o 44 pt (~9 mm) da baseline adulta HIG — esse número está documentado como muito pequeno para crianças de 4 anos por uma ampla margem [1].
2. **Sem arrastar e soltar como mecânica principal de resposta.** Use toque‑para‑selecionar (por exemplo, toque no número/objeto correto entre 3‑4 opções grandes). Reserve qualquer interação de arrastar para um momento secundário/celebrativo (por exemplo, arrastar um adesivo para um quadro de recompensas), com zonas de encaixe grandes, porque arrastar e soltar é o gesto que falha de forma mais consistente na literatura para idades 3‑6 [3][4][5][6].
3. **Cada tela e cada prompt tem um equivalente falado (TTS ou VO gravado), acionado automaticamente ao entrar na tela, reproduzível ao tocar no mascote.** Nenhum prompt deve depender apenas de texto, já que a leitura ainda não está desenvolvida nessa idade [8][9].
4. **Tipografia: mínimo de 24‑32 px para qualquer numeral ou rótulo na tela** (maior que o piso de 18‑19 px para texto corrido de praticantes [12], porque o conteúdo principal do Math Challenge são numerais que as crianças precisam discriminar visualmente rapidamente, não texto de parágrafo), sem serifa arredondado, largura de traço alta para legibilidade instantânea.
5. **Paleta: cores primárias de alta saturação e tendência quente** para o tema KINDER (mascote, botões, estados de celebração), consistente com a saturação maior medida em interfaces infantis versus adultas e a preferência infantil por tons quentes [16][19]. Mantenha a saturação mais baixa na camada de fundo/tela para que os objetos tocáveis sejam os elementos mais saturados na tela — a saturação em si torna‑se uma affordance de “isto é tocável”.
6. **Som: apenas intencional, não decorativo‑interativo.** Um toque de confirmação a cada toque (conforme a descoberta da NN/g de “feedback em toda ação” [12]), narração falada de número/prompt, e linhas de voz do mascote ao acertar/repetir — mas sem som ambiente ao tocar em elementos de fundo, segundo a descoberta da Khan Academy Kids de que sons de novidade desviam a atenção da tarefa [15].
7. **Animação: toda mudança de estado é animada** (pressão de botão, revelação correta/incorreta, reações do mascote) — a animação é uma preferência documentada nessa idade, ao contrário do padrão adulto de “reduzir movimento” [8]. Respeite as configurações de redução de movimento do sistema operacional como sobrescrita de acessibilidade, mas não defina como padrão um tema KINDER de movimento mínimo.
8. **Profundidade de navegação: máximo de 2 toques desde a abertura do app até “um desafio estar sendo respondido”.** Toque 1: escolher avatar/perfil da criança (sem login, veja #9). Toque 2: tocar no mascote ou em um único botão grande “Play”. Isso corresponde à evidência de que estruturas de menu profundas e navegação em múltiplas etapas são o tipo de complexidade projetada por adultos que crianças de 3‑6 anos não conseguem analisar de forma confiável sem leitura [8][12].
9. **Login: seleção em grade de avatares, sem PIN nem senha digitada para a faixa KINDER.** Uma grade de 4‑6 blocos de avatar grandes (um por perfil infantil na casa), tocados uma vez, substitui funcionalmente o login; qualquer ação voltada ao pai (alterar cobrança de perfis, configurações) fica atrás de uma superfície separada, protegida por adulto, conforme a exigência de “parental gate” da Apple [9][11].
10. **Comportamento para resposta errada: sem X vermelho, sem buzina, sem linguagem de “falha”.** O mascote fornece um sinal de áudio encorajador (“¡Casi! / Almost!”), a escolha errada treme/escurece suavemente ao invés de desaparecer, e a criança é convidada a tentar novamente na mesma tela — consistente com manter o feedback encorajador ao invés de punitivo numa idade em que a NN/g documenta que a autoimagem é facilmente ferida por enquadramentos como “isso é para bebês” se o tom não condiz com o estágio de desenvolvimento da criança [8][10].
11. **Uma superfície de configurações/compras apenas para pais, protegida por um problema de matemática ou padrão de pressionar‑e‑segurar, nunca acessível por toque acidental da experiência infantil** — implementando diretamente a exigência de “parental gate” da Apple para a categoria Kids [11] e evitando a responsabilidade de dark‑pattern que a FTC multou em $520 M em categoria de produto comparável [13]. Nenhum fluxo de compra dentro do app deve ser acessível a partir da superfície voltada à criança para a faixa KINDER; todas as ações de compra/assinatura ficam exclusivamente atrás do gate dos pais.
12. **Estrutura de sessão/nível: rodadas curtas e autônomas de desafio (60‑120 segundos cada) com um ponto de parada natural (celebração do mascote + prompt “play again?”) a cada 3‑5 rodadas**, para que um pai possa encerrar a sessão em um limite limpo ao invés de no meio da tarefa — o impulso da AAP por design centrado na criança e envolvimento familiar apoia a criação de pontos de pausa naturais ao invés de uma estrutura de rolagem infinita, embora nenhum número exato em minutos seja citável do trecho obtido [20].
13. **Adaptação específica para desktop: manter o mesmo mínimo de alvo de 76 px+ e a mecânica de toque‑primeiro (clique‑primeiro); não introduzir entrada apenas por teclado para a faixa KINDER**, já que nenhuma pesquisa de precisão assume fluência em teclado nessa idade e a pesquisa de precisão de apontamento de mouse (o estudo original de Hourcade) usou a mesma lógica de alvo grande como toque [1].
14. **Design de ícones: literal, não abstrato** — uma maçã inteira para “1 maçã”, não uma fração estilizada; ícones funcionais (play, home, retry) repetidos identicamente em todas as telas para que o reconhecimento se transfira, conforme a descoberta da NN/g de que ícones repetidos e consistentes são o que crianças de 3 anos realmente aprendem a reconhecer [9].

## Anti‑padrões a evitar

- **Arrastar e soltar como única forma de responder a uma pergunta** — o modo de falha mais consistentemente documentado para a faixa etária [3][4][5][6].
- **Alvos de toque de 44 pt/9 mm** copiados de diretrizes móveis gerais para adultos — medidos como insuficientes para crianças de 4 anos por Hourcade et al. [1][2].
- **Qualquer compra, assinatura ou link externo acessível sem um gate parental** — risco de aplicação da FTC, não apenas um problema de UX [11][13].
- **Prompts ou instruções apenas em texto** sem equivalente em áudio — inutilizáveis por quem não lê, por definição [8][9].
- **Som decorativo ao tocar em elementos não acionáveis** — distrai mensuravelmente as crianças da tarefa em questão [15].
- **Feedback punitivo para resposta errada** (X vermelho, buzina, “Wrong!”, opções que desaparecem) — vai contra o tom encorajador que a faixa etária precisa e arrisca uma reação de “este app não gosta de mim” que a pesquisa da NN/g mostra que crianças articulam diretamente (“isso é para bebês”) quando o tom não condiz com a idade [8].
- **Navegação profunda ou oculta** (menus hamburger, configurações de múltiplos níveis dentro da superfície voltada à criança) — este grupo etário não consegue navegar de forma confiável estruturas que assumem leitura ou memória de telas anteriores [8][12].
- **Mecânicas de recompensa que premiam o próprio toque/engajamento** ao invés da conclusão da tarefa — enfraquece o pilar “significativo” do framework de quatro pilares e a motivação intrínseca de forma mais ampla [10][12].
- **Senhas digitadas ou PINs para a troca de perfil voltada à criança** — nenhuma evidência obtida apoia a entrada de credenciais digitadas como utilizável para uma criança de 4 anos que não lê, e a própria orientação da Apple assume bloqueio sem texto para essa idade [11].
- **Reprodução automática para o próximo conteúdo sem ponto de parada** — vai contra o impulso da AAP por design centrado na criança e envolvimento familiar e remove a fronteira natural de sessão que o pai precisa [20].

## Perguntas abertas para o proprietário do projeto

1. Deve a faixa KINDER suportar **mais de um perfil infantil por domicílio** via o login em grade de avatares, ou o Math Challenge é de conta única por criança para esta faixa?
2. Vale a pena suportar um **caminho de entrada via stylus/Apple Pencil** no tablet para atividades bônus baseadas em arrastar, dado a descoberta da FittsFarm de que o stylus melhora materialmente a precisão de arrastar e soltar das crianças em relação ao dedo [7]?
3. Qual é a **posição do Math Challenge sobre qualquer moeda de recompensa** (estrelas, moedas) para KINDER — puramente cosmética/celebratória, ou vinculada ao desbloqueio de conteúdo, considerando a tensão que a literatura aponta entre mecânicas de recompensa e motivação intrínseca [10][12]?
4. Os prompts de limite de sessão (“play again?”) **devem contar ou resetar** qualquer recurso de limite diário que o app ou os controles parentais a nível de SO possam impor?
5. Para o gate parental, o proprietário prefere **um simples desafio aritmético** (padrão sugerido pela Apple [11]) ou um padrão de **pressionar‑e‑segurar** — o primeiro duplica como conteúdo temático, o último é mais rápido para um pai que deseja abrir as configurações com frequência?

## Fontes

1. Hourcade, J.P., Bederson, B.B., Druin, A., Guimbretière, F. (2004).  
   "Differences in pointing task performance between preschool children and adults using mice." ACM TOCHI. https://dl.acm.org/doi/10.1145/1035575.1035577  

2. Resumo do ResearchGate de Hourcade et al. (2004), citando alvo de 23,7 mm / 90 % de acurácia para crianças de 4 anos.  
   https://www.researchgate.net/publication/220286166_Differences_in_pointing_task_performance_between_preschool_children_and_adults_using_mice  

3. Vatavu, R.-D., Cramariuc, G., Schipor, D.M. "Touch interaction for children aged 3 to 6 years: Experimental findings and relationship to motor skills." International Journal of Human-Computer Studies.  
   https://www.sciencedirect.com/science/article/pii/S1071581914001426  

4. "Children's interaction with touchscreen devices: Performance and validity of Fitts' law" (movement-time comparison, drag-and-drop vs. tap, ages 4-6 vs. 7-10).  
   https://www.researchgate.net/publication/355490786_Children's_interaction_with_touchscreen_devices_Performance_and_validity_of_Fitts'_law  

5. "Physical dimensions of children's touchscreen interactions: Lessons Learned" (six studies, 180+ participants incl. 116 children; cites Baloian et al. 2013 on tracing/double-tap/drag-and-drop difficulty).  
   https://www.sciencedirect.com/science/article/pii/S1071581918302441  

6. "Ability of children to perform touchscreen gestures and follow prompting techniques when using mobile apps" (gesture ability by age, 2-3 vs. 4-6 vs. 7-8).  
   https://www.researchgate.net/publication/339053838_Ability_of_children_to_perform_touchscreen_gestures_and_follow_prompting_techniques_when_using_mobile_apps  

7. "FittsFarm: Comparing Children's Drag-and-Drop Performance Using Finger [and Stylus]." York University / INTERACT 2019.  
   https://www.yorku.ca/mack/interact2019.html  

8. Nielsen Norman Group. "Children's UX: Usability Issues in Designing for Young People." https://www.nngroup.com/articles/childrens-websites-usability-issues/  

9. Nielsen Norman Group. "UX Design for Children (Ages 3-12)" report. https://www.nngroup.com/reports/children-on-the-web/  

10. Hirsh-Pasek, K., Zosh, J.M., Golinkoff, R.M., et al. (2015). "Putting Education in 'Educational' Apps: Lessons from the Science of Learning." Psychological Science in the Public Interest. https://journals.sagepub.com/doi/abs/10.1177/1529100615569721  

11. Apple Developer. "Design safe and age-appropriate experiences" (Kids category guidance: age bands, parental gates, data/ad restrictions). https://developer.apple.com/kids/  

12. Smashing Magazine (2024). "A Practical Guide to Designing for Children" (75×75px minimum tap target, 18-19px text, feedback-on-every-action, reward-vs-intrinsic-motivation caution). https://www.smashingmagazine.com/2024/02/practical-guide-design-children/  

13. FTC. Press release, "Fortnite Video Game Maker Epic Games to Pay More Than Half a Billion Dollars over FTC Allegations" (dark patterns enabling unauthorized charges by children), 2022. https://www.ftc.gov/news-events/news/press-releases/2022/12/fortnite-video-game-maker-epic-games-pay-more-half-billion-dollars-over-ftc-allegations  

14. Google Play Console. "Families" program policies. https://play.google.com/console/about/programs/families/  

15. Khan Academy Blog. "Prototyping Playful and Nimble Pre-K Assessments" (audio-as-distraction finding; drag-and-drop vs. tap assessment validity). https://blog.khanacademy.org/prototyping-playful-and-nimble-pre-k-assessments/  

16. "Color design in application interfaces for children." Color Research & Application (Wiley). https://onlinelibrary.wiley.com/doi/abs/10.1002/col.22726  

17. Siegler, R. "Using Symbols: Developmental Perspectives" (children's understanding of words, photographs, scale models, maps, text). https://siegler.tc.columbia.edu/wp-content/uploads/2020/08/wcs.1280.pdf  

18. Frontiers in Developmental Psychology. "Exploring the Potential Relations Between a Novel Visual [icon-matching task] and preschool spatial/math skill." https://www.frontiersin.org/journals/developmental-psychology/articles/10.3389/fdpys.2026.1746813/full  

19. Frontiers in Psychology. "Using head-mounted eye trackers to explore children's color preferences" (warm-hue preference). https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2023.1205213/full  

20. AAP / HealthyChildren.org. "A Child-Friendly Digital World: AAP Releases New Media Recommendations" (age-banded guidance incl. early childhood 0-5, child-centered design). https://www.healthychildren.org/English/news/Pages/creating-a-child-friendly-digital-world-AAP-releases-new-media-recommendations.aspx  

21. Kirkorian, H.L., et al. (2017). "All Tapped Out: Touchscreen Interactivity and Young Children's Self-Regulation and Word Learning." Frontiers in Psychology. https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2017.00578/full
