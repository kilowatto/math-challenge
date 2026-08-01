# Pesquisa competitiva e de design: os principais produtos de aprendizagem de matemática

> Pesquisa Math Challenge — 2026-07-31 — tópico 14

## Resumo executivo (tópicos)

- Khan Academy combina video + prática adaptativa com duas moedas de progresso distintas: **Energy Points** (medem esforço, não domínio) e **Mastery Points** (medem domínio real por habilidade); essa separação evita que "jogar o sistema" se confunda com aprender [1]. É gratuito, financiado por filantropia (~$128M/ano) [Business model].
- A evidência da Khan Academy é mais forte a nível de plataforma (≥30 min/semana → ~20% de ganho adicional em MAP Growth) [2] do que a nível de Khanmigo (tutor IA): um estudo de física com 69 universitários não encontrou diferença significativa em relação ao uso de um buscador, embora a percepção subjetiva tenha sido positiva [3].
- Brilliant.org é a referência de design de "aprender fazendo": cada lição é uma sequência de problemas interativos com scaffolding e feedback imediato, sem videoaulas tradicionais; uma resposta incorreta não penaliza, é explicada e a sequência continua [5][7]. Preço: ~$150/ano ou ~$10/mês.
- Kumon é o modelo de referência para "passos pequenos" e incrementalidade extrema: cada folha de trabalho tem um **Standard Completion Time** (tempo padrão) que decide se a criança repete ou avança — o tempo, não apenas a correção, é o sinal de domínio [9][10]. O **What Works Clearinghouse (WWC)** não pôde emitir conclusão sobre sua eficácia por falta de estudos que cumpram seus padrões [11] — um dado que convém citar com cuidado, não como validação.
- IXL usa **SmartScore** (0–100), um algoritmo que pondera dificuldade, sequência e recência; ao ultrapassar o limiar 90 ("Challenge Zone") os acertos somam pouco e os erros restam muito mais, o que força consistência real em vez de um pico de sorte [12][13].
- Prodigy Math é o caso de advertência mais citado: matemática grátis mas envolta em um RPG com monetização agressiva de cosméticos/mascotes que cria "duas classes" de alunos: houve uma queixa formal à FTC dos EUA em 2021 por publicidade enganosa e manipulação de menores [15][16][17]. Também é evidência de que o "core loop" de batalha (responder para ganhar pontos de magia) não ensina por si só — apenas pratica.
- DreamBox e ST Math têm a evidência independente mais sólida do grupo: DreamBox com estudos de Harvard/CEPR e SRI, classificado "STRONG" por Evidence for ESSA [20]; ST Math cumpre o nível WWC "Meets Evidence Standards with Reservations" segundo WestEd (2014), embora análises posteriores relatem efeitos não significativos em alguns contextos — a evidência é mista, não unânime [21][23].
- ST Math (JiJi) é o design mais radical: **zero palavras**, tudo visual/espacial, pensado para que o idioma não seja barreira — relevante diretamente para o requisito EN/ES/FR/PT/DE do Math Challenge [24][25].
- Photomath mudou de negócio após ser adquirido pelo Google (2023): passou de assinatura pura a alimentar sinais de aprendizado ao ecossistema Google (Search, Workspace for Education) — é uma ferramenta de "resolver", não de prática graduada [26].
- Duolingo Math não fracassou nem foi cancelado: foi fundido dentro do app principal da Duolingo em 2023–2024 após ter menos tração que Chess/Music — uma lição sobre lançar um produto "spin-off" separado versus integrá-lo desde o primeiro dia [28].
- O vazio de mercado que nenhum concorrente cobre bem: ninguém combina (a) problemas reais estilo Brilliant, (b) progressão incremental verificável estilo Kumon/IXL, (c) design multilíngue sem dependência de texto estilo ST Math, e (d) ausência de monetização manipuladora de menores. Esse é o espaço que o Math Challenge pode ocupar.

## Resumo executivo (prosa)

Nove produtos foram analisados quanto ao core loop, apresentação de problemas, avaliação, progressão e evidência independente. O padrão mais claro: plataformas com a evidência de eficácia *independente* mais forte (Khan Academy em escala, DreamBox, IXL, ST Math) separam a camada de recompensa de "esforço/engajamento" do sinal de "domínio", e utilizam limiares algorítmicos de domínio por habilidade em vez de conclusão de curso. Plataformas otimizadas puramente para engajamento (Prodigy) receberam críticas de nível regulatório por monetizar crianças por meio de pressão de bens virtuais, e apresentam evidência de resultados de aprendizagem mais fraca em relação ao tempo gasto. A contribuição do Kumon não é "design de engajamento" — é uma escada de folhas de trabalho cronometrada e incremental, onde um cronômetro, não apenas a correção, decide a progressão; sua evidência formal de eficácia é escassa pelos padrões do WWC apesar de décadas de reputação anedótica. Brilliant.org é o melhor modelo para *apresentar um problema*: introdução curta ao conceito, seguida de problema interativo guiado com scaffolds e tratamento não punitivo de respostas erradas. ST Math é a prova mais robusta existente de que uma abordagem espacial e sem palavras pode ser validada (WWC/ESSA Tier 2) e é diretamente relevante ao requisito de cinco idiomas do Math Challenge. A história do Duolingo Math (mesclado ao app principal em vez de permanecer independente) serve como alerta sobre diluição de spin-offs. O vazio de mercado: nenhum produto único combina a elaboração de problemas ao nível do Brilliant com a segmentação incremental de domínio ao nível do Kumon/IXL, a independência linguística ao nível do ST Math e um modelo de negócio que não pressione crianças a gastar.

## Constatações

### Khan Academy

**Loop central:** vídeo curto opcional ou leitura, seguido de um conjunto de exercícios; respostas corretas concedem Energy Points (moeda de esforço sem limite, não um sinal de domínio) e avançam em Mastery Points (específicos de habilidade, algorítmicos, exigindo correção sustentada ao longo do tempo, não apenas uma sequência) [1]. As habilidades estão organizadas em uma árvore de competências bloqueada por pré-requisitos, com revisões espaçadas que trazem de volta o material já dominado. Khanmigo, o tutor de IA, é uma camada de chat ao estilo socrático, não um currículo separado [4].

**Avaliação:** a correção por questão alimenta o modelo de domínio; Energy Points recompensam avançar para novo material mesmo quando a resposta está errada, para não punir a tomada de risco [1].

**Evidência:** o próprio relatório da Khan Academy de novembro de 2024 afirma que ≥30 min/semana correlaciona-se com ganhos ~20% acima do esperado no MAP Growth [2] — evidência correlacional ao nível da plataforma, não um ECR. Para o Khanmigo especificamente, um estudo revisado por pares de métodos mistos (69 estudantes de graduação, física) encontrou ganhos significativos em todas as condições, mas **nenhuma diferença significativa** entre o Khanmigo e um motor de busca simples, embora os estudantes tenham preferido subjetivamente a orientação passo a passo do Khanmigo [3]. O blog da Khan Academy descreve experimentos em andamento (out 2025–abr 2026) para melhorar a eficácia medida do Khanmigo [4] — a própria organização o trata como não comprovado e em progresso.

**Negócio:** organização sem fins lucrativos 501(c)(3), gratuita para os usuários finais, financiada por ~$128M+/ano em filantropia.

### Brilliant.org

**Loop central:** cada lição começa com uma introdução conceitual de 2–4 frases + ilustração, e então passa direto para uma sequência de problemas interativos que o aprendiz resolve — “aprender fazendo”, explicitamente sem aula inicial [5]. Respostas erradas não são penalizadas: a interface mostra a resposta correta e explica o raciocínio [7].

**Apresentação:** widgets visuais/interativos (deslizadores, diagramas arrastáveis, revelações em múltiplas etapas), não blocos de texto.

**Avaliação:** feedback imediato por problema com explicações detalhadas; desafios diários mais mecânicas de sequência/nível incentivam visitas recorrentes [7].

**Progressão:** mais de 40 cursos, do ensino fundamental ao nível de pós-graduação (matemática, ciências, CS, dados, IA); transição entre tópicos fácil entre cursos, sequenciamento rigoroso dentro de cada lição.

**Evidência:** não foi encontrado estudo independente revisado por pares sobre eficácia; o caso da Brilliant baseia-se na credibilidade de design instrucional e avaliações, não em resultados mensurados.

**Negócio:** modelo freemium; Premium ~US$ 150/ano (~US$ 10/mês faturado anualmente), gratuito para professores de K-12 [6].

### Kumon

**Loop central:** planilhas curtas e cronometradas em sequência fixa de pequenos passos — estudar um exemplo resolvido, depois resolver problemas quase idênticos com intervenção mínima do professor (“auto-aprendizagem”) [8][9].

**Avaliação:** correção *e* um **Standard Completion Time (SCT)** publicado por nível. Concluir com precisão dentro do SCT autoriza a próxima planilha; falhar no SCT — mesmo com respostas corretas — aciona repetição [10]. A velocidade é um critério de aprovação/reprovação de primeira classe aqui, ao contrário de todos os outros produtos analisados.

**Progressão:** o tamanho do passo é deliberadamente mais fino do que uma sala de aula consideraria um novo tópico, de modo que cada passo pareça alcançável sem ensino direto.

**Evidência:** o What Works Clearinghouse dos EUA revisou estudos de Kumon Math e não encontrou nenhum que atendesse aos seus padrões de evidência, de modo que **o WWC não pôde chegar a uma conclusão** em nenhum sentido [11] — um “sem veredicto”, não um achado negativo, mas indica que décadas de reputação de mercado não são sustentadas por evidência de nível WWC. Comentários secundários relatam ganhos concentrados nos primeiros 12–18 meses (especialmente para estudantes abaixo do nível de série) com platô depois, e críticas recorrentes de que o método recompensa cálculo mecânico em vez de raciocínio conceitual.

**Negócio:** centros de franquia presenciais, mensalidade por disciplina (varia conforme o mercado).

### IXL

**Loop central:** responder a questões de prática adaptativa em uma habilidade escolhida; **SmartScore**, um medidor de domínio de 0–100 por habilidade, atualiza após cada resposta.

**Avaliação:** SmartScore pondera dificuldade, sequências de respostas recentes e consistência, não apenas porcentagem correta [12][13]. Quando o SmartScore está acima de 90 (“Zona de Desafio”), respostas corretas adicionam apenas 1–2 pontos enquanto um erro pode subtrair 3–8 — deliberadamente assimétrico para que a última fase exija consistência real, não um golpe de sorte [13].

**Progressão:** adaptividade de dois níveis — a dificuldade dos itens se adapta dentro de uma habilidade, e um Diagnóstico em Tempo Real recomenda qual habilidade trabalhar a seguir.

**Evidência:** a IXL publica seu próprio artigo de metodologia SmartScore [12]; não foi encontrado estudo independente de terceiros sobre resultados.

**Negócio:** ~US$ 79–159/ano por criança, dependendo do pacote de disciplinas, descontos para múltiplas crianças; licenças escolares a partir de ~US$ 369/ano [14].

### Prodigy Math

**Loop central:** batalha RPG por turnos sobre prática de matemática — responder a uma questão gera Magic Points usados para lançar feitiços contra monstros/outros personagens; o mago sobe de nível, ganha equipamentos e desbloqueia zonas [18].

**Avaliação:** a correção controla o progresso da batalha apenas; nenhuma explicação conceitual está incorporada no ciclo.

**Modelo de negócio e controvérsia:** o conteúdo de Matemática/Inglês é nominalmente gratuito; conteúdo de Ciências e aprimoramentos cosméticos/jogáveis (pets, equipamentos, visual “nuvens vs. terra”) exigem níveis pagos (Core ~US$ 9,95/mês, Plus ~US$ 14,95/mês, Ultra ~US$ 19,95/mês) [19]. Em fevereiro de 2021, grupos de defesa infantil apresentaram uma queixa formal à FTC dos EUA alegando que a Prodigy comercializa “agressivamente” e “injustamente” upgrades premium para crianças, chamando a apresentação “gratuita para escolas” de enganosa e descrevendo uma experiência de dois níveis visível entre estudantes pagantes e não pagantes [15][16][17]. Críticos também argumentam que o jogo “não instrui… oferece apenas prática”, citando pesquisa que classifica a Prodigy em último lugar entre quatro apps comparados quanto ao ganho de aprendizado por hora investida [17]. Resposta da Prodigy: mais de 95% dos usuários registrados nunca pagaram, e o modelo freemium financia o acesso gratuito para o restante [16].

**Conclusão:** A Prodigy é o exemplo de alerta mais claro aqui — não os mecânicos do jogo em si, mas o uso de pressão de status dentro do jogo visível a colegas que não pagam, em um produto anunciado às escolas como gratuito, é exatamente o formato que os reguladores já contestaram formalmente.

### DreamBox Learning

**Loop central:** lições adaptativas, semelhantes a jogos, para K-8 que ramificam com base em *como* o estudante resolve cada problema — estratégia e passos intermediários, não apenas a resposta final — para escolher a próxima tarefa.

**Evidência:** um dos dois produtos com melhor evidência revisados. Um estudo da Harvard CEPR com ~3.000 estudantes em dois distritos constatou que estudantes com 14 horas de uso melhoraram ~4% nas avaliações NWEA MAP/PARCC/estaduais [20]. Um estudo da LearnPlatform no William Penn School District (1.800 estudantes K-6, maioria negra e elegíveis a FRL) encontrou que estudantes que completaram menos de uma hora/semana de DreamBox tiveram pontuações finais de Savvas Math significativamente maiores que pares com menor uso [22]. Um instantâneo de evidência separado do WWC existe [21]. Um ECR citado em um distrito do sudeste encontrou ganho de 0,12 DP em um teste de habilidades do ensino fundamental inicial, mas sem vantagem significativa no teste estadual de fim de série — evidência real, porém desigual entre as medidas de resultado. DreamBox é classificado como “STRONG” pela Evidence for ESSA [20].

**Negócio:** licenciamento para distritos/escolas K-8, vendido B2B para escolas.

### ST Math (MIND Research Institute)

**Loop central:** o estudante guia JiJi, o pinguim, por quebra-cabeças espaciais-visuais sem **nenhuma instrução escrita ou falada** — todo o ciclo problema/feedback é visual, construído em torno de raciocínio espacial-temporal ao invés de linguagem [24][25].

**Avaliação:** implícita — JiJi tem sucesso ou falha com base se a manipulação do quebra-cabeça pelo estudante está matematicamente correta; a falha é imediatamente visível e pode ser tentada novamente, sem necessidade de veredicto verbal.

**Evidência:** uma avaliação da WestEd de 2014 encontrou que as turmas de ST Math tiveram 6,3 pontos percentuais a mais de estudantes proficientes no California Standards Test em comparação com escolas de controle pareadas; esse desenho foi considerado pela revisão do WWC como atendendo **“Meets Evidence Standards with Reservations”**, e a MIND afirma que o programa cumpre o ESSA Tier 2 [23][24]. Outras análises na mesma rodada de busca encontraram efeito não significativo ao longo de dois anos em outro contexto — a evidência é real, porém mista entre os estudos.

**Relevância direta:** ST Math é a prova mais forte de que um **design sem palavras pode ser validado independentemente**, útil diretamente para um produto em 5 idiomas (EN/ES/FR/PT/DE) — uma trilha espacial/visual bem projetada não precisa de tradução e pode ser lançada nos cinco idiomas sem custo de localização adicional, especialmente para idades pré-alfabetização de 4–7 anos.

**Negócio:** o MIND Research Institute é uma organização sem fins lucrativos; ST Math é licenciado B2B para distritos/escolas.

### Matific

**Loop central:** conteúdo alinhado ao currículo em quatro formatos — planilhas, “episódios” (apps curtos semelhantes a jogos), problemas de texto e oficinas para professores — em espiral modular e progressiva (os tópicos reaparecem com dificuldade crescente ao invés de uma escada linear estrita).

**Evidência:** o próprio marketing da Matific cita uma melhoria média de 34% nas notas de teste com 30 min/semana [29]; esse é um número reportado pelo fornecedor, não verificado independentemente nas fontes obtidas, devendo ser tratado como uma alegação a ser checada, não como resultado de nível de citação.

**Negócio:** ~US$ 9,99/mês ou US$ 79,99/ano; plano “Galaxy” US$ 19,99 por série única ou US$ 39,99 por K-6/ano; testes gratuitos.

### Mathletics (3P Learning)

**Loop central:** módulos de prática baseados no currículo mais um modo global “Live Mathletics” ao vivo onde estudantes competem cabeça a cabeça em tempo real, junto com certificações/pontos de gamificação.

**Evidência:** não foi encontrado estudo independente específico ao produto. Metanálises gerais sobre gamificação na educação matemática (41 estudos, ~5.071 participantes) mostram um grande efeito médio positivo, mas heterogeneidade significativa — algumas implementações não apresentam efeito ou apresentam efeito negativo, portanto a gamificação não é automaticamente eficaz; a qualidade da execução decide o resultado [32].

**Negócio:** ~US$ 99/ano para uso doméstico (uma criança); preços para escolas/distritos via cotação personalizada.

### Photomath

**Core loop:** fundamentalmente uma **ferramenta de resolução**, não prática graduada — fotografe um problema, OCR (~98% de precisão alegada) converte para uma expressão simbólica, e um motor de álgebra computacional devolve múltiplas soluções passo a passo com demonstrações animadas.

**Grading/progression:** nenhum no sentido de domínio — sem árvore de habilidades ou portão de domínio; o valor está na ajuda de lição de casa sob demanda, o oposto da aposta de design de Kumon/IXL/Khan Academy com progressão bloqueada.

**Business model shift:** adquirido pelo Google/Alphabet em 2023; até 2026 seu papel mudou de um aplicativo de assinatura independente para alimentar dados de sinal de aprendizagem no Google Workspace for Education/Gemini e no “Homework Helper” da Busca — monetizando como valor de ecossistema ao invés de assinatura pura [26][27].

**Relevance:** Photomath é o anti-padrão a ser evitado — um solucionador puro de respostas compromete “problemas reais, não apenas aritmética básica” se uma criança puder fotografar qualquer problema do Math Challenge e obter uma resposta instantânea. Isso defende formatos de problema interativos/manipuláveis que resistam à solução por foto ingênua.

### Duolingo Math

**History:** lançado como um **aplicativo separado e independente** em outubro de 2022; no Duocon 2023 a Duolingo anunciou que integraria Matemática ao aplicativo principal; o aplicativo independente saiu da App Store em 30 de novembro de 2023, sendo incorporado ao aplicativo principal até o início de 2024 [28]. Matemática (e Música) havia alcançado cerca de 3 milhões de usuários combinados um ano após o lançamento — menor que disciplinas irmãs como Xadrez — contexto que, embora não declarado como causa única, levou à sua integração ao invés de mantê-lo independente. Em setembro de 2025 a Matemática foi redesenhada para agrupar Unidades em Séries e Tópicos, espelhando um currículo escolar [28].

**Design implication:** um alerta sobre a aposta de “spin-off independente bem-sucedido” — uma marca-mãe forte (Duolingo) lançando uma disciplina adjacente como seu próprio aplicativo teve adoção menor que disciplinas irmãs, e a solução foi a integração, não iterar o spin-off. Para o Math Challenge, que *é* o produto independente, o risco transferível é dividir em aplicativos separados por série ou idioma ao invés de um único PWA com modos temáticos.

## Tabela comparativa

| Produto | Loop principal | Mecanismo de avaliação | Modelo de progressão | Evidência independente | Preço / modelo |
|---|---|---|---|---|---|
| Khan Academy | Assistir/ler → conjunto de prática → exercício de domínio | Pontos de Energia (esforço, sem limite) separados dos Pontos de Domínio (por habilidade, algorítmico) [1] | Árvore de habilidades bloqueada por pré-requisitos + revisão espaçada | Plataforma: ~20% de ganho extra em MAP Growth com ≥30 min/sem (relatado pela KA) [2]; estudo estilo RCT do Khanmigo: sem ganho significativo em relação ao motor de busca [3] | Gratuito; sem fins lucrativos, ~$128M+/ano filantropia |
| Brilliant.org | Introdução curta ao conceito → cadeia de problemas interativos | Feedback imediato por problema + explicação; respostas erradas não são penalizadas [7] | 40+ cursos, do ensino fundamental ao superior, fácil de pular entre tópicos | Nenhum estudo independente de eficácia encontrado | ~$150/yr (~$10/mo), gratuito para professores K-12 [6] |
| Kumon | Exemplo trabalhado → problemas de prática quase idênticos, cronometrados | Correção **e** Tempo Padrão de Conclusão (velocidade é aprovado/reprovado) [10] | Etapas lineares extremamente detalhadas | WWC: nenhum estudo atendeu aos padrões de evidência, conclusão impossível [11] | Franquia presencial, mensalidade por disciplina |
| IXL | Questão adaptativa → atualização do SmartScore | SmartScore 0–100, assimetria próximo ao domínio (erro custa mais que acerto ajuda) [13] | Adaptividade de dois níveis: dificuldade da questão + recomendação de habilidade via diagnóstico | Apenas documento de metodologia do fornecedor; nenhum estudo de resultados de terceiros encontrado [12] | ~$79–159/yr per child; school license from $369/yr [14] |
| Prodigy Math | Responder pergunta → Pontos Mágicos → batalha RPG | Correção abre apenas a batalha; sem instrução adaptativa | Nivelamento de personagem/equipamento, desbloqueio de zonas | Citado como o último de 4 apps em ganhos de aprendizado por hora [17]; queixa formal da FTC sobre monetização [15][16] | Math/English free; Science + cosmetics via $9,95–19,95/mo tiers [19] |
| DreamBox | Estratégia de rastreamento de lição adaptativa, não apenas resposta final | Ramificação consciente da estratégia a cada passo | Ramificação adaptativa contínua, K–8 | Harvard CEPR (~3.000 estudantes, +4%) [20]; LearnPlatform William Penn (+ pontuações com <1 h/sem) [22]; instantâneo de evidência WWC existente [21]; “FORTE” segundo Evidência para ESSA | Licenciamento distrital/escolar (B2B) |
| ST Math | Quebra-cabeça espacial sem palavras (JiJi) | Implícito — quebra-cabeça resolvido ou não, totalmente visual | Sequência espacial-temporal, pré-K–8 | WestEd 2014: +6,3pp proficiência; WWC “Atende aos Padrões de Evidência com Reservas”; ESSA Nível 2; outras análises não encontraram efeitos significativos [23][24] | Sem fins lucrativos (MIND Research Institute), licenciamento distrital |
| Matific | Folhas de exercício / episódios / problemas de texto / oficinas | Correção por atividade; revisão espiral de tópicos | Modular, alinhado ao currículo, espiral | Reivindicação de melhoria de 34% reportada pelo fornecedor (não verificada independentemente nesta passagem) | ~$9,99/mo or $79,99/yr; Galaxy $19,99–39,99/yr |
| Mathletics | Módulos curriculares + competição global ao vivo | Correção por questão + certificados/pontos | Módulos alinhados ao currículo, modo competitivo | Nenhum estudo específico de produto encontrado; meta-análises gerais de gamificação mostram efeito grande porém heterogêneo | ~$99/yr home; custom school quotes |
| Photomath | Fotografar problema → OCR → solução passo a passo | Nenhum (solucionador, não prática) | Nenhum (sem árvore de habilidades) | N/D — não é um produto de resultado de aprendizagem | Freemium → Photomath Plus; pós-Google, integrado ao ecossistema (Busca/Workspace) [26] |
| Duolingo Math | Aula diária baseada em sequência, gamificada | Correção + sequência/XP (mecânicas centrais da Duolingo) | Séries → Tópicos → Unidades (redesenhado 2025) | Não pesquisado nesta passagem (nenhum estudo de eficácia encontrado); dados de adoção sugerem que o app independente teve desempenho inferior ao Xadrez | Gratuito, incorporado ao app principal da Duolingo desde 2023–24 [28] |

## Implicações de design para o Math Challenge

1. **Separe o sinal de esforço do sinal de domínio**, como a Khan Academy separa Energy Points de Mastery Points [1]. Os placares devem recompensar o domínio demonstrado por habilidade, não o volume de prática fácil.  
2. **Copie o formato de apresentação de problemas da Brilliant**: introdução curta ao conceito, seguida de um único problema interativo com apoio, e depois feedback imediato não punitivo com uma explicação trabalhada [5][7] — isso corresponde diretamente a “problemas reais, não aritmética pura.”  
3. **Adote um limiar de domínio assimétrico próximo ao topo**, como a Challenge Zone da IXL (erros custam mais do que acertos dão ganho acima de 90) [13], de modo que uma sequência de sorte não possa falsificar o domínio.  
4. **Reserve a dimensão de tempo apenas para habilidades de fluência procedimental** (fatos de aritmética, manipulação algébrica), inspirado no Standard Completion Time da Kumon [10] — não estenda a pressão de tempo para tarefas de raciocínio, onde a WWC não encontrou evidência forte de que o modelo de velocidade constrói compreensão conceitual [11].  
5. **Não construa uma economia de status ao estilo Prodigy.** Evite mecânicas em que usuários pagantes recebem cosméticos visivelmente superiores que pares não pagantes veem — o formato exato de uma queixa formal à FTC [15][16][17]. Se o Math Challenge for monetizado, mantenha os níveis premium voltados para os pais (relatórios, perfis extras, profundidade do tutor), não símbolos de status voltados para crianças.  
6. **Crie ao menos uma trilha de problemas sem palavras/minimo texto para idades de 4 a 7**, seguindo o modelo JiJi da ST Math [24][25] — não necessita de tradução e é lançada em todas as cinco línguas sem custo incremental de localização.  
7. **Projete a infraestrutura de evidência desde o primeiro dia**, idealmente no formato da WWC. A maioria dos produtos revisados com forte reputação de mercado (Brilliant, Matific, Mathletics) carece de evidência de eficácia independente; os que podem fazer reivindicações de nível escolar/distrital (DreamBox, ST Math) foram construídos para medição desde o início, não depois.  
8. **Trate o resultado nulo do Khanmigo como um alerta contra exageros de tutores de IA.** Um estudo controlado não encontrou vantagem significativa em relação a um motor de busca simples, apesar da preferência subjetiva pela IA [3]; valide o tutor do Math Challenge com base em resultados, não em satisfação, antes de divulgá-lo como pedagogicamente superior.  
9. **Projete formatos de problema que resistam à solução fotográfica trivial.** Um solucionador de foto de lição de casa (pilha OCR+Gemini do Google) derrota qualquer problema estático simbólico/textual em segundos [26]; prefira UI interativa/manipulável (arrastar, ordenar, construir, revelação em múltiplas etapas) para problemas que devem ser raciocinados, não pesquisados.  
10. **Evite lançar uma disciplina adjacente como um aplicativo independente.** A menor adoção do Duolingo Math em comparação com disciplinas irmãs, que foi reintegrado ao aplicativo principal em cerca de um ano [28], defende um único PWA com modos temáticos por série/idioma ao invés de dividir em aplicativos separados.  
11. **Use um currículo em espiral, não uma escada linear estrita**, seguindo o design modular/espiral da Matific — os tópicos reaparecem com dificuldade crescente. Isso atende a perfis gerenciados por pais e multisseriados, onde uma criança que transita entre séries precisa de tópicos anteriores acessíveis e retestáveis, não arquivados.  
12. **Mantenha o “por quê” visível em cada interação de avaliação**, como a Brilliant [7] e a Khan Academy fazem por padrão, e como a ST Math demonstra através da consequência direta de um movimento errado ao invés de um veredicto textual [24]. O estado de falha deve ensinar, não apenas marcar em vermelho.  
13. **Considere um modo ao vivo/competitivo com cautela.** A competição em tempo real da Mathletics é um diferencial, mas meta-análises de gamificação mostram efeitos grandes porém altamente heterogêneos [32] — a qualidade de execução, não a presença de competição, decide se ajuda ou gera ansiedade para aprendizes menos confiantes.  
14. **A lacuna de mercado:** nenhum produto revisado combina (a) a elaboração de problemas reais de nível Brilliant, (b) a segmentação incremental de domínio verificável de nível Kumon/IXL, (c) o design independente de idioma de nível ST Math, e (d) um modelo de negócio que não pressione crianças por status dentro do jogo. Produtos apresentam elaboração sem evidência (Brilliant), evidência sem design multilíngue (DreamBox, ST Math) ou engajamento sem integridade (Prodigy) — um produto que reivindique credivelmente os quatro simultaneamente tem espaço real de posicionamento.

## Perguntas abertas para o dono do projeto
1. O Math Challenge deve se comprometer, desde o primeiro dia, com instrumentação que suporte um futuro estudo de eficácia no estilo WWC ou de comparação pareada (mesmo que o estudo seja contratado posteriormente)?  
2. A trilha de problemas sem palavras/espaciais (inspirada na ST Math) deve ser limitada apenas para idades de 4 a 7, ou estendida como um modo geral de “raciocínio visual” em todas as séries?  
3. Dado o precedente da FTC contra a Prodigy, o Math Challenge deve adotar uma política interna explícita que proíba totalmente a monetização de cosméticos voltados para crianças, documentada em `docs/wiki/decisions.md` como um ADR, para que nenhuma proposta futura de recurso possa reintroduzi-la sem uma decisão consciente de sobrescrever?  
4. Um modo competitivo ao vivo/em tempo real (estilo Mathletics) está dentro do escopo para um marco posterior, e, em caso afirmativo, o proprietário deseja um filtro por nível de confiança (por exemplo, apenas oponentes com habilidades pareadas) para mitigar o risco de ansiedade que a literatura de gamificação aponta para aprendizes com baixa confiança?  
5. A funcionalidade de tutor de IA deve evitar explicitamente alegações de “ganhos de aprendizado comprovados” no material de marketing até que o Math Challenge realize seu próprio estudo de resultados, dado o resultado nulo do Khanmigo em ao menos uma comparação controlada?

## Fontes

1. Khan Academy Help Center — “O que são energy points, badges e avatars?” https://support.khanacademy.org/hc/en-us/articles/202487710-What-are-energy-points-badges-and-avatars  
2. Khan Academy Blog — “Resultados de eficácia da Khan Academy, novembro de 2024” https://blog.khanacademy.org/khan-academy-efficacy-results-november-2024/  
3. Journal of Teaching and Learning — “Aproveitando a ferramenta de IA generativa ‘Khanmigo’ para tutoria personalizada no aprendizado de conceitos científicos” https://jtl.uwindsor.ca/index.php/jtl/article/view/10052  
4. Khan Academy Blog — “Como a Khan Academy está construindo um tutor de IA melhor: Nossos aprendizados mais recentes” https://blog.khanacademy.org/how-khan-academy-is-building-a-better-ai-tutor-our-most-recent-learnings/  
5. SkillsCouter — “Revisão da Brilliant.org 2026” https://skillscouter.com/brilliant-review-math-science-coding/  
6. SchemaNinja — “Preços da Brilliant.org 2026” https://schemaninja.com/brilliant-org-pricing/  
7. Brilliant — “Brilliant Basics” Help Center https://brilliant.org/help/using-brilliant/  
8. Kumon — “Autoaprendizagem: O método Kumon e seus pontos fortes” https://www.kumon.com/about-kumon/kumon-method/self-learning  
9. Kumon Institute of Education — “Planilhas Small-Step” https://www.kumongroup.com/eng/about-kumon/method/small-steps/  
10. Kumon — “Entendendo o Tempo de Conclusão na Kumon: Guia Prático para Pais” https://www.kumon.com/resources/canadian_english/understanding-completion-time-in-kumon-a-parents-practical-guide/  
11. What Works Clearinghouse — “Relatório de Intervenção WWC: Kumon Math” (março de 2009) https://ies.ed.gov/ncee/wwc/Docs/InterventionReports/wwc_kumon_031009.pdf  
12. IXL — “Guia SmartScore” https://www.ixl.com/materials/SmartScore_Guide.pdf  
13. IXL Official Blog — “IXL SmartScore: A chave para a aprendizagem baseada em domínio” https://blog.ixl.com/2020/11/11/ixl-smartscore-the-key-to-mastery-based-learning/  
14. Brighterly — “Custo da IXL: Tudo o que você precisa saber [2026]” https://brighterly.com/blog/ixl-cost/  
15. EdWeek — “Jogo interativo de matemática popular Prodigy é alvo de queixa à Federal Trade Commission” https://www.edweek.org/technology/popular-interactive-math-game-prodigy-is-target-of-complaint-to-federal-trade-commission/2021/02  
16. NBC News — “Em queixa à FTC, defensores de crianças alertam que o jogo de matemática Prodigy explora a pandemia para se aproveitar de estudantes e pais” https://www.nbcnews.com/tech/tech-news/child-protection-nonprofit-alleges-manipulative-upselling-math-game-prodigy-n1258294  
17. Fairplay for Kids — “7 razões para dizer ‘não’ ao Prodigy” https://fairplayforkids.org/pf/prodigy/  
18. Prodigy Game Wiki (Fandom) — “Battles” https://prodigy-game.fandom.com/wiki/Battles  
19. Brighterly — “Custo da assinatura Prodigy 2026: Quanto realmente custa?” https://brighterly.com/blog/prodigy-membership-cost/  
20. Higher Ed Dive — “Pesquisa da Harvard encontra resultados positivos do aprendizado adaptativo da DreamBox” https://www.highereddive.com/news/harvard-research-finds-positive-results-from-dreambox-adaptive-learning/420471/  
21. What Works Clearinghouse — “Visão geral de evidências: DreamBox Learning” https://ies.ed.gov/ncee/wwc/EvidenceSnapshot/627  
22. Business Wire — “Estudo comprova que DreamBox Learning aumenta significativamente o desempenho em matemática após apenas uma hora de uso por semana” https://www.businesswire.com/news/home/20230330005199/en/Study-Proves-DreamBox-Learning%C2%AE-Significantly-Increases-Math-Achievement-After-Only-One-Hour-of-Use-Per-Week  
23. WestEd — “Avaliação do programa Spatial-Temporal Math (ST Math) do MIND Research Institute na Califórnia” (2014) https://www.wested.org/resource/stmathevaluation2014/  
24. MIND Research Institute — “ST Math atende aos padrões ESSA Tier 2 e WWC” https://blog.mindresearch.org/news/st-math-meets-essa-tier-2-and-wwc-standards  
25. MIND Education / ST Math — “Validação e Metodologia” https://stmath.com/impact/validation-and-methodology  
26. Business Model Canvas Template — “Como funciona a empresa Photomath?” https://businessmodelcanvastemplate.com/blogs/how-it-works/photomath-how-it-works  
27. AI Chat Daily — “Revisão do Photomath 2026: o solucionador de matemática ainda é essencial?” https://www.aichatdaily.com/tools/photomath  
28. Duolingo Wiki (Fandom) — “Math” https://duolingo.fandom.com/wiki/Duolingo_Math  
29. Matific — Página do produto para pais (reivindicação de eficácia) https://www.matific.com/us/en-us/home/parents/  
30. Educational App Store — “Revisão da Matific – Recursos, Preços, Prós e Contras” https://www.educationalappstore.com/app/matific-for-school-educational-math-games  
31. Mathletics — “Quanto custa o Mathletics?” https://knowledgebase.mathletics.com/pricing/how-much-does-mathletics-cost  
32. PMC — “Examinando a eficácia da gamificação como ferramenta que promove ensino e aprendizagem em ambientes educacionais: uma meta-análise” https://pmc.ncbi.nlm.nih.gov/articles/PMC10591086/
