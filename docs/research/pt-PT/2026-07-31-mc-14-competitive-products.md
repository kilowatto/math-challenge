# Investigação competitiva e de design: os principais produtos de aprendizagem da matemática

> Math Challenge research — 2026-07-31 — topic 14

## Resumo executivo (ES)

- Khan Academy combina vídeo + prática adaptativa com duas moedas de progresso distintas: **Energy Points** (medem esforço, não domínio) e **Mastery Points** (medem domínio real por competência); esta separação evita que “jogar o sistema” se confunda com aprender [1]. É gratuito, financiado por filantropia (~$128M/ano) [Business model].
- A evidência da Khan Academy é mais forte a nível de plataforma (≥30 min/semana → ~20 % de ganho adicional no MAP Growth) [2] do que a nível do Khanmigo (tutor IA): um estudo de física com 69 universitários não encontrou diferença significativa em relação a usar um motor de busca, embora a perceção subjetiva tenha sido positiva [3].
- Brilliant.org é a referência de design de “aprender a fazer”: cada lição é uma sequência de problemas interativos com scaffolding e feedback imediato, sem video‑aulas tradicionais; uma resposta incorreta não penaliza, é explicada e continua [5][7]. Preço: ~$150/ano ou ~$10/mês.
- Kumon é o modelo de referência para “passos pequenos” e incrementalidade extrema: cada folha de trabalho tem um **Standard Completion Time** (tempo padrão) que decide se a criança repete ou avança — o tempo, não apenas a correção, é o sinal de domínio [9][10]. O **What Works Clearinghouse (WWC)** não pôde emitir conclusão sobre a sua eficácia por falta de estudos que cumpram os seus padrões [11] — um dado que convém citar com cuidado, não como validação.
- IXL usa **SmartScore** (0–100), um algoritmo que pondera dificuldade, racha e recência; ultrapassado o limiar 90 (“Challenge Zone”) os acertos somam pouco e os erros subtraem muito mais, o que força consistência real em vez de um pico de sorte [12][13].
- Prodigy Math é o caso de alerta mais citado: matemática gratuita mas envolta numa RPG com monetização agressiva de cosméticos/mascotas que cria “duas classes” de utilizadores: houve uma queixa formal junto da FTC dos EUA em 2021 por publicidade enganosa e manipulação de menores [15][16][17]. É também evidência de que o “core loop” de batalha (responder para ganhar pontos de magia) não ensina por si próprio — apenas pratica.
- DreamBox e ST Math têm a evidência independente mais sólida do grupo: DreamBox com estudos de Harvard/CEPR e SRI, classificado “STRONG” por Evidence for ESSA [20]; ST Math cumpre o nível WWC “Meets Evidence Standards with Reservations” segundo a WestEd (2014), embora análises posteriores reportem efeitos não significativos em alguns contextos — a evidência é mista, não unânime [21][23].
- ST Math (JiJi) é o design mais radical: **zero palavras**, tudo visual/espacial, pensado para que a língua não seja barreira — relevante diretamente para o requisito EN/ES/FR/PT/DE do Math Challenge [24][25].
- Photomath mudou de negócio após ser adquirido pela Google (2023): passou de subscrição pura a alimentar sinais de aprendizagem no ecossistema Google (Search, Workspace for Education) — é uma ferramenta de “resolver”, não de prática graduada [26].
- Duolingo Math não frustrou nem foi cancelado: fundiu‑se dentro da aplicação principal da Duolingo em 2023–2024 após ter menos tração que Chess/Music — uma lição sobre lançar um produto “spin‑off” separado versus integrá‑lo desde o primeiro dia [28].
- A lacuna de mercado que nenhum concorrente cobre bem: ninguém combina (a) problemas reais ao estilo Brilliant, (b) progressão incremental verificável ao estilo Kumon/IXL, (c) design multilingue sem dependência de texto ao estilo ST Math, e (d) ausência de monetização manipuladora para menores. Esse é o espaço que o Math Challenge pode ocupar.

## Resumo executivo (EN)

Nove produtos foram analisados quanto ao ciclo central, apresentação de problemas, avaliação, progressão e evidência independente. O padrão mais claro: as plataformas com a evidência de eficácia *independente* mais forte (Khan Academy em escala, DreamBox, IXL, ST Math) separam a camada de recompensa de “esforço/envolvimento” do sinal de “domínio”, e utilizam limiares algorítmicos de domínio por competência em vez de conclusão de curso. As plataformas otimizadas puramente para envolvimento (Prodigy) têm atraído críticas ao nível regulatório por monetizar crianças através de pressão de bens virtuais, e apresentam evidência de resultados de aprendizagem mais fraca em relação ao tempo despendido. A contribuição do Kumon não é “design de envolvimento” — trata‑se de uma escada de folhas de trabalho cronometrada e incremental, onde um cronómetro, não apenas a correção, decide a progressão; a sua evidência formal de eficácia é escassa segundo os padrões WWC, apesar de décadas de reputação anedótica. Brilliant.org é o melhor modelo para *apresentar um problema*: curta introdução ao conceito, seguida de problema interativo guiado com scaffolds e tratamento não punitivo de respostas erradas. ST Math é a prova mais robusta existente de que uma abordagem sem palavras e espacial pode ser validada (WWC/ESSA Tier 2) e é diretamente relevante para o requisito de cinco línguas do Math Challenge. A história do Duolingo Math (integrado na aplicação principal em vez de sobreviver como produto independente) serve de alerta sobre a diluição de spin‑off. A lacuna de mercado: nenhum produto único combina a qualidade de elaboração de problemas ao nível Brilliant com a progressão incremental ao nível Kumon/IXL, a independência linguística ao nível ST Math, e um modelo de negócio que não pressione as crianças a gastar.

## Constatações

### Khan Academy

**Ciclo principal:** vídeo ou leitura curta opcional, seguida de um conjunto de exercícios; respostas corretas geram Energy Points (moeda de esforço ilimitada, não sinal de domínio) e avançam para Mastery Points (específicos de competência, algorítmicos, exigindo consistência ao longo do tempo, não um único racha) [1]. As competências estão organizadas numa árvore de competências com pré‑requisitos, com revisão espaçada que reaparece material dominado. Khanmigo, o tutor de IA, é uma camada de chat ao estilo socrático, não um currículo separado [4].

**Avaliação:** a correção por questão alimenta o modelo de domínio; os Energy Points recompensam avançar para novo material mesmo quando se erra, para evitar penalizar a tomada de risco [1].

**Evidência:** o próprio relatório da Khan Academy de novembro de 2024 afirma que ≥30 min/semana correlaciona‑se com ~20 % de ganhos superiores ao esperado no MAP Growth [2] — evidência correlacional a nível de plataforma, não um ensaio controlado randomizado. Para o Khanmigo especificamente, um estudo revisado por pares de métodos mistos (69 estudantes de graduação, física) encontrou ganhos significativos em todas as condições mas **nenhuma diferença significativa** entre Khanmigo e um motor de busca simples, embora os estudantes tenham preferido subjetivamente a orientação passo‑a‑passo do Khanmigo [3]. O blog da Khan Academy descreve experimentos em curso (out 2025–abr 2026) para melhorar a eficácia medida do Khanmigo [4] — a própria organização trata‑o como não comprovado e em desenvolvimento.

**Negócio:** organização sem fins lucrativos 501(c)(3), gratuita para utilizadores finais, financiada por ~128 M$/ano em filantropia.

### Brilliant.org

**Ciclo principal:** cada lição começa com uma introdução conceitual de 2–4 frases + ilustração, passando diretamente a uma cadeia de problemas interativos que o aprendiz resolve — “aprender fazendo”, explicitamente não começa com palestra [5]. Respostas erradas não são penalizadas: a interface mostra a resposta correta e explica o raciocínio [7].

**Apresentação:** widgets visuais/interativos (deslizadores, diagramas arrastáveis, revelações em múltiplas etapas), não muros de texto.

**Avaliação:** feedback imediato por problema com explicações trabalhadas; problemas diários de desafio mais mecânicas de sequência/nível impulsionam visitas recorrentes [7].

**Progressão:** mais de 40 cursos, do ensino básico ao nível de pós‑graduação (matemática, ciência, informática, dados, IA); transição entre tópicos fácil entre cursos, sequenciados de forma apertada dentro de uma lição.

**Evidência:** não foi encontrado estudo independente e revisado por pares sobre a eficácia; o caso da Brilliant baseia‑se na credibilidade do design instrucional e nas avaliações, não em resultados medidos.

**Negócio:** freemium; ~150 $/ano Premium (~10 $/mês faturado anualmente), gratuito para professores do ensino K‑12 [6].

### Kumon

**Ciclo principal:** folhas de exercício curtas e cronometradas numa sequência fixa de pequenos passos — estudar um exemplo resolvido, depois resolver problemas quase idênticos com intervenção mínima do professor (“auto‑aprendizagem”) [8][9].

**Avaliação:** correção *e* um **Standard Completion Time (SCT)** publicado por nível. Concluir com precisão dentro do SCT autoriza a folha seguinte; não cumprir o SCT — mesmo com respostas corretas — desencadeia repetição [10]. A velocidade é um critério de aprovação/reprovação de primeira classe aqui, ao contrário de todos os outros produtos analisados.

**Progressão:** o tamanho do passo é deliberadamente mais fino do que uma sala de aula trataria como um novo tópico, por isso cada passo parece alcançável sem ensino direto.

**Evidência:** o U.S. What Works Clearinghouse analisou estudos de Kumon Math e não encontrou nenhum que cumprisse os seus padrões de evidência, pelo que **WWC não pôde tirar uma conclusão** em nenhum sentido [11] — um “sem veredicto”, não um achado negativo, mas significa que décadas de reputação de mercado não são sustentadas por evidência ao nível WWC. Comentários secundários relatam ganhos concentrados nos primeiros 12–18 meses (especialmente para estudantes que começam abaixo do nível de série) com platô posterior, e críticas recorrentes de que o método recompensa cálculo mecânico em detrimento do raciocínio conceitual.

**Negócio:** centros de franquia presenciais, propina mensal por disciplina (varia por mercado).

### IXL

**Ciclo principal:** responder a questões de prática adaptativa numa competência escolhida; **SmartScore**, um medidor de domínio de 0–100 por competência, atualiza‑se após cada resposta.

**Avaliação:** SmartScore pondera a dificuldade, sequências de respostas recentes e consistência, não apenas a percentagem correta [12][13]. Com SmartScore acima de 90 (“Zona de Desafio”), respostas corretas adicionam apenas 1–2 pontos enquanto um erro pode subtrair 3–8 — deliberadamente assimétrico para que a última fase exija consistência real, não um golpe de sorte [13].

**Progressão:** adaptatividade de dois níveis — a dificuldade dos itens adapta‑se dentro de uma competência, e um Diagnóstico em Tempo Real recomenda qual competência trabalhar a seguir.

**Evidência:** a IXL publica o seu próprio artigo de metodologia SmartScore [12]; não foi encontrado estudo independente de terceiros sobre resultados.

**Negócio:** ~79–159 $/ano por criança, dependendo do conjunto de disciplinas, descontos para múltiplas crianças; licenças escolares a partir de ~369 $/ano [14].

### Prodigy Math

**Ciclo principal:** batalha RPG por turnos sobre prática de matemática — responder a uma questão gera Pontos Mágicos gastos em lançar feitiços contra monstros/outros personagens; o mago sobe de nível, obtém equipamento, desbloqueia zonas [18].

**Avaliação:** a correção controla apenas o progresso da batalha; nenhuma explicação de conceito está incorporada no ciclo.

**Modelo de negócio e controvérsia:** o conteúdo de Matemática/Inglês é nominalmente gratuito; o conteúdo de Ciências e melhorias cosméticas/jogo (animais de estimação, equipamento, visual “nuvens vs. terra”) requerem níveis pagos (Core ~9,95 $/mês, Plus ~14,95 $/mês, Ultra ~19,95 $/mês) [19]. Em fevereiro de 2021, grupos de defesa de menores apresentaram uma queixa formal da FTC dos EUA alegando que a Prodigy “aggressivamente” e “injustamente” comercializa atualizações premium a crianças, chamando a apresentação “gratuita para escolas” de enganosa e descrevendo uma experiência visível de dois níveis entre estudantes pagantes e não pagantes [15][16][17]. Críticos também argumentam que o jogo “não instrui… oferece apenas prática”, citando pesquisa que coloca a Prodigy em último entre quatro apps comparados quanto a ganhos de aprendizagem por hora investida [17]. Resposta da Prodigy: mais de 95 % dos utilizadores registados nunca pagaram, e o modelo freemium financia o acesso gratuito para o resto [16].

**Conclusão:** a Prodigy é o exemplo de aviso mais claro aqui — não os mecânicos do jogo em si, mas a pressão de status intra‑jogo visível a pares não pagantes, num produto comercializado como gratuito para escolas, é exatamente o tipo de prática que os reguladores já desafiaram formalmente.

### DreamBox Learning

**Ciclo principal:** lições adaptativas, semelhantes a jogos, para K–8 que ramificam com base em *como* o estudante resolve cada problema — estratégia e passos intermédios, não apenas a resposta final — para escolher a tarefa seguinte.

**Evidência:** um dos dois produtos com melhor evidência revistos. Um estudo da Harvard CEPR com ~3.000 estudantes em dois distritos encontrou que estudantes com 14 horas de uso melhoraram ~4 % nas avaliações NWEA MAP/PARCC/estaduais [20]. Um estudo da LearnPlatform no William Penn School District (1.800 estudantes K‑6, maioria negra e elegíveis a FRL) constatou que estudantes que completaram menos de uma hora/semana de DreamBox tiveram pontuações finais de Savvas Math significativamente superiores às dos pares com menor uso [22]. Existe ainda um instantâneo de evidência do WWC [21]. Um ensaio randomizado citado num distrito do sudeste encontrou um ganho de 0,12 DP (desvio‑padrão) num teste de competências do início do ensino básico, mas sem vantagem significativa no teste estatal de fim de série — evidência real, porém desigual entre as medidas de resultado.

DreamBox é classificado como “FORTE” pela Evidence for ESSA [20].

**Negócio:** licenciamento para distritos/escolas K‑8, vendido B2B a escolas.

### ST Math (MIND Research Institute)

**Ciclo principal:** o estudante guia JiJi, o pinguim, através de puzzles espaciais‑visuais sem **nenhuma instrução escrita ou falada** — todo o ciclo problema/feedback é visual, construído em torno do raciocínio espacial‑temporal em vez de linguagem [24][25].

**Avaliação:** implícita — JiJi tem sucesso ou falha com base na correção matemática da manipulação do puzzle; a falha é imediatamente visível e pode ser repetida, sem necessidade de veredicto verbal.

**Evidência:** uma avaliação da WestEd de 2014 encontrou que as turmas ST Math tinham 6,3 pontos percentuais a mais de estudantes proficientes no California Standards Test comparado com escolas de comparação pareadas; esse desenho foi considerado pela revisão do WWC como **“Cumpre os Padrões de Evidência com Reservas”**, e a MIND afirma que o programa cumpre o Tier 2 do ESSA [23][24]. Outras análises no mesmo conjunto de buscas encontraram efeito não significativo ao longo de dois anos num contexto diferente — a evidência é real, mas mista entre os estudos.

**Relevância direta:** o ST Math é a prova mais forte de que um **design sem palavras pode ser validado independentemente**, útil para um produto em 5 línguas (EN/ES/FR/PT/DE) — uma trilha visual/espacial bem concebida não necessita de tradução e pode ser lançada nas cinco línguas sem custo de localização adicional, especialmente para idades pré‑leitura de 4–7 anos.

**Negócio:** o MIND Research Institute é uma organização sem fins lucrativos; o ST Math é licenciado B2B a distritos/escolas.

### Matific

**Ciclo principal:** conteúdo alinhado ao currículo em quatro formatos — folhas de exercício, “episódios” (apps curtos semelhantes a jogos), problemas de palavra e workshops para professores — num espiral modular e progressivo (os tópicos reaparecem com dificuldade crescente em vez de uma escada linear estrita).

**Evidência:** o próprio marketing da Matific cita uma melhoria média de 34 % nas pontuações de testes com 30 min/semana [29]; trata‑se de um dado reportado pelo fornecedor, não verificado independentemente nas fontes recolhidas, devendo ser tratado como uma alegação a confirmar, não como um resultado de nível de citação.

**Negócio:** ~9,99 $/mês ou ~79,99 $/ano; nível “Galaxy” ~19,99 $ para uma única série ou ~39,99 $ para K‑6 completo/ano; períodos de teste gratuitos.

### Mathletics (3P Learning)

**Ciclo principal:** módulos de prática baseados no currículo mais um modo global “Live Mathletics” em tempo real, onde os estudantes competem cara a cara, juntamente com gamificação de certificados/pontos.

**Evidência:** não foi encontrado estudo independente específico ao produto. Meta‑análises gerais sobre gamificação na educação matemática (41 estudos, ~5.071 participantes) mostram um grande efeito positivo médio, mas com heterogeneidade significativa — algumas implementações não produzem efeito ou até geram efeito negativo, pelo que a gamificação não é automaticamente eficaz; a qualidade da execução determina o resultado [32].

**Negócio:** ~99 $/ano para uso doméstico (uma criança); preços para escolas/distritos mediante orçamento personalizado.

### Photomath

**Ciclo principal:** fundamentalmente uma **ferramenta de resolução**, não prática classificada — fotografar um problema, OCR (~98 % de precisão alegada) converte‑o numa expressão simbólica, e um motor de álgebra computacional devolve múltiplas soluções passo a passo com demonstrações animadas.

**Classificação/progresso:** nenhum no sentido de domínio — sem árvore de competências ou porta de domínio; o valor está na ajuda de dever de casa sob demanda, o oposto da aposta de design da progressão bloqueada da Kumon/IXL/Khan Academy.

**Mudança no modelo de negócio:** adquirida pela Google/Alphabet em 2023; até 2026 o seu papel mudou de uma aplicação de subscrição independente para alimentar dados de sinal de aprendizagem no Google Workspace for Education/Gemini e no “Homework Helper” da Search — monetizando como valor do ecossistema em vez de subscrição pura [26][27].

**Relevância:** a Photomath é o anti‑padrão a evitar copiar — um solucionador puro de respostas mina “problemas reais, não apenas aritmética simples” se uma criança puder fotografar qualquer problema do Math Challenge e obter uma resposta instantânea. Isto defende formatos de problema interativos/manipuláveis que resistam à resolução fotográfica ingênua.

### Duolingo Math

**História:** lançada como uma **app separada e independente** em outubro de 2022; no Duocon 2023 a Duolingo anunciou que iria integrar a Matemática na app principal; a app independente saiu da App Store a 30 de novembro de 2023, sendo incorporada na app principal até ao início de 2024 [28]. A Matemática (e Música) tinha atingido cerca de 3 milhões de utilizadores combinados um ano após o lançamento — menos que disciplinas irmãs como o Xadrez — contexto que, embora não declarado como a única causa, explica a sua integração em vez de permanecer independente. Em setembro de 2025 a Matemática foi redesenhada para agrupar Unidades em Anos e Tópicos, espelhando um currículo escolar [28].

**Implicação de design:** um alerta sobre a aposta no “spin‑off independente bem‑sucedido” — uma marca‑mãe forte (Duolingo) que lança uma disciplina adjacente como app próprio viu menor adoção que disciplinas irmãs, e a solução foi a integração, não iterar o spin‑off. Para o Math Challenge, que *é* o produto independente, o risco transferível é dividir em apps separados por faixa de ano ou idioma em vez de um único PWA com modos temáticos.

## Tabela comparativa

| Produto | Ciclo principal | Mecanismo de classificação | Modelo de progressão | Evidência independente | Preço / modelo |
|---|---|---|---|---|---|
| Khan Academy | Ver/ler → conjunto de prática → exercício de domínio | Pontos de Energia (esforço, sem limite) separados dos Pontos de Domínio (por competência, algorítmico) [1] | Árvore de competências bloqueada por pré-requisitos + revisão espaçada | Plataforma: ~20 % de ganho extra em MAP Growth com ≥30 min/semana (relatado pela KA) [2]; estudo estilo RCT do Khanmigo: sem ganho significativo face a motor de pesquisa [3] | Gratuito; sem fins lucrativos, $128M+/yr filantropia |
| Brilliant.org | Introdução curta ao conceito → cadeia de problemas interativos | Feedback imediato por problema + explicação; respostas erradas não penalizadas [7] | Mais de 40 cursos, do ensino básico ao superior, com navegação entre tópicos | Nenhum estudo independente de eficácia encontrado | $150/ano (~$10/mês), gratuito para professores do ensino K‑12 [6] |
| Kumon | Exemplo trabalhado → problemas de prática quase idênticos, cronometrados | Precisão **e** Tempo Padrão de Conclusão (velocidade é aprovado/reprovado) [10] | Passos lineares extremamente detalhados | WWC: nenhum estudo cumpriu os padrões de evidência, sem conclusão possível [11] | Franquia presencial, mensalidade por disciplina |
| IXL | Questão adaptativa → atualização do SmartScore | SmartScore 0–100, assimétrico próximo do domínio (erro custa mais do que acerto ajuda) [13] | Adaptatividade de dois níveis: dificuldade do item + recomendação de competências via diagnóstico | Apenas documento metodológico do fornecedor; nenhum estudo de resultados independente encontrado [12] | $79–159/ano por criança; licença escolar a partir de $369/ano [14] |
| Prodigy Math | Responder pergunta → Pontos Mágicos → batalha RPG | Precisão desbloqueia apenas a batalha; sem instrução adaptativa | Níveis de personagem/equipamento, desbloqueio de zonas | Citado como o último de 4 apps em ganhos de aprendizagem por hora [17]; queixa formal da FTC sobre monetização [15][16] | $9,95–19,95/mês |
| DreamBox | Estratégia de acompanhamento de lições adaptativas, não apenas a resposta final | Ramificação consciente da estratégia a cada passo | Ramificação adaptativa contínua, K–8 | Harvard CEPR (~3.000 estudantes, +4 %) [20]; LearnPlatform William Penn (+ pontuações com <1 h/semana) [22]; instantâneo de evidência WWC disponível [21]; “STRONG” segundo Evidência para ESSA | Licenciamento por distrito/escola (B2B) |
| ST Math | Puzzle espacial sem palavras (JiJi) | Implícito — puzzle resolvido ou não, totalmente visual | Sequência espacial‑temporal, pré‑K–8 | WestEd 2014: +6,3pp proficiência; WWC “Cumpre os Padrões de Evidência com Reservas”; ESSA Nível 2; outras análises não encontraram efeitos significativos [23][24] | Sem fins lucrativos, licenciamento distrital |
| Matific | Folhas de exercício / episódios / problemas de texto / workshops | Precisão por atividade; revisão espiral de tópicos | Modular, alinhado ao currículo, espiral | Reclamação de melhoria de 34 % reportada pelo fornecedor (não verificada independentemente nesta passagem) | $9,99/mês ou $79,99/ano; Galaxy $19,99–39,99/ano |
| Mathletics | Módulos curriculares + competição global ao vivo | Precisão por questão + certificados/pontos | Módulos alinhados ao currículo, modo competitivo | Nenhum estudo específico do produto encontrado; meta‑análises gerais de gamificação mostram efeito grande mas heterogéneo | $99/ano doméstico; orçamentos escolares personalizados |
| Photomath | Fotografar problema → OCR → resolução passo a passo | Nenhum (solucionador, não prática) | Nenhum (sem árvore de competências) | N/D — não é um produto de resultados de aprendizagem | Freemium → Photomath Plus; pós‑Google, integrado ao ecossistema (Search/Workspace) [26] |
| Duolingo Math | Lição diária baseada em racha, gamificada | Precisão + racha/XP (mecânicas principais do Duolingo) | Ano escolar → Tópicos → Unidades (re‑desenhado em 2025) | Não pesquisado nesta passagem (nenhum estudo de eficácia encontrado); dados de adoção sugerem que a app independente teve desempenho inferior ao Chess | Gratuito, integrado na app principal do Duolingo desde 2023–24 [28] |

## Implicações de design para o Math Challenge

1. **Separar o sinal de esforço do sinal de domínio**, como a Khan Academy separa Energy Points de Mastery Points [1]. Os quadros de líderes devem recompensar o domínio demonstrado por competência, não o volume de esforço fácil.  
2. **Copiar o formato de apresentação de problemas da Brilliant**: introdução curta ao conceito, seguida de um único problema interativo com apoio, e depois feedback imediato não punitivo com uma explicação trabalhada [5][7] — isto corresponde diretamente a “problemas reais, não apenas aritmética básica”.  
3. **Adotar um limiar de domínio assimétrico próximo do topo**, como a Challenge Zone da IXL (erros custam mais do que acertos dão ganhos após 90) [13], para que uma sequência de sorte não possa falsificar o domínio.  
4. **Reservar a dimensão de tempo apenas para competências de fluência procedimental** (factos de aritmética, manipulação algébrica), inspirado no Standard Completion Time da Kumon [10] — não estender a pressão de tempo a tarefas de raciocínio, onde a WWC não encontrou evidência forte de que o modelo de velocidade constrói compreensão conceptual [11].  
5. **Não criar uma economia de status ao estilo Prodigy.** Evitar mecânicas em que utilizadores pagantes recebem cosméticos visivelmente superiores que os pares não pagantes veem — a forma exata de uma queixa formal à FTC [15][16][17]. Se o Math Challenge for monetizado, manter os níveis premium voltados para os pais (relatórios, perfis extra, profundidade do tutor), não para símbolos de status voltados para as crianças.  
6. **Criar pelo menos uma pista de problemas sem texto ou com texto mínimo para idades entre 4 e 7 anos**, seguindo o modelo JiJi da ST Math [24][25] — não necessita de tradução e é lançada em todas as cinco línguas sem custo de localização incremental.  
7. **Desenhar a infraestrutura de evidência desde o primeiro dia**, idealmente no formato WWC. A maioria dos produtos revistos com forte reputação de mercado (Brilliant, Matific, Mathletics) carece de evidência independente de eficácia; os que podem fazer afirmações a nível escolar/distrital (DreamBox, ST Math) foram construídos para medição desde o início, não depois dos factos.  
8. **Tratar o resultado nulo do Khanmigo como um aviso contra exageros de tutores de IA.** Um estudo controlado não encontrou vantagem significativa face a um motor de pesquisa simples, apesar da preferência subjetiva pela IA [3]; validar o tutor do Math Challenge com base em resultados, não em satisfação, antes de o comercializar como pedagogicamente superior.  
9. **Desenhar formatos de problema que resistam à resolução fotográfica trivial.** Um resolvedor de fotos de deveres de casa (pilha OCR+Gemini da Google) derrota qualquer problema estático simbólico/textual em segundos [26]; favorecer UI interativa/manipulável (arrastar, ordenar, construir, revelação em múltiplas etapas) para problemas que devem ser resolvidos por raciocínio, não pesquisados.  
10. **Evitar lançar uma disciplina adjacente como uma aplicação autónoma separada.** A menor adoção do Duolingo Math em comparação com as disciplinas irmãs, reintegrada na aplicação principal em cerca de um ano [28], defende uma única PWA com modos temáticos por série/idioma em vez de dividir em aplicações separadas.  
11. **Utilizar um currículo em espiral, não uma escada linear estrita**, seguindo o design modular/espiral da Matific — os tópicos reaparecem com dificuldade crescente. Isto adequa‑se a perfis geridos pelos pais e multi‑série, onde uma criança que transita entre séries precisa de tópicos anteriores acessíveis e reavaliáveis, não arquivados.  
12. **Manter o “porquê” visível em cada interação de avaliação**, como a Brilliant [7] e a Khan Academy fazem por defeito, e como a ST Math demonstra através da consequência direta de um movimento errado em vez de um veredicto textual [24]. O estado de falha deve ensinar, não apenas marcar a vermelho.  
13. **Considerar cuidadosamente um modo ao vivo/competitivo.** A competição em tempo real da Mathletics é um diferenciador, mas meta‑análises de gamificação mostram efeitos grandes mas altamente heterogéneos [32] — a qualidade da execução, não a presença da competição, decide se ajuda ou gera ansiedade em aprendizes menos confiantes.  
14. **A lacuna de mercado:** nenhum produto revisto combina (a) a qualidade de problemas reais ao nível da Brilliant, (b) a verificação incremental de domínio ao nível da Kumon/IXL, (c) o design independente de idioma ao nível da ST Math, e (d) um modelo de negócio que não pressiona as crianças através de status no jogo. Os produtos apresentam: qualidade sem evidência (Brilliant), evidência sem design multilingue (DreamBox, ST Math) ou envolvimento sem integridade (Prodigy) — um produto que reivindique credivelmente os quatro simultaneamente tem espaço real de posicionamento.

## Questões abertas para o proprietário do projeto

1. Deve o Math Challenge comprometer‑se, desde o primeiro dia, com instrumentação que suporte um futuro estudo de eficácia ao estilo WWC ou de comparação pareada (mesmo que o estudo seja encomendado mais tarde)?  
2. Deve a pista de problemas sem texto/espacial (inspirada na ST Math) ser limitada a idades entre 4 e 7 anos, ou ser expandida como um modo geral de “raciocínio visual” ao longo das séries?  
3. Dado o precedente da FTC contra a Prodigy, o Math Challenge deve adotar uma política interna explícita que proíba totalmente a monetização de cosméticos voltados para crianças, documentada em `docs/wiki/decisions.md` como um ADR, para que nenhuma proposta futura de funcionalidade possa reintroduzi‑la sem uma decisão consciente de ultrapassar a política?  
4. Está um modo competitivo ao vivo/em tempo real (ao estilo Mathletics) no âmbito de um marco posterior, e, em caso afirmativo, o proprietário deseja um filtro por nível de confiança (por exemplo, apenas adversários com competências equivalentes) para mitigar o risco de ansiedade que a literatura de gamificação assinala para aprendizes com baixa confiança?  
5. Deve a funcionalidade de tutor de IA evitar explicitamente alegações de “ganhos de aprendizagem comprovados” no material de marketing até que o Math Challenge realize o seu próprio estudo de resultados, dado o resultado nulo do Khanmigo em pelo menos uma comparação controlada?

## Fontes

1. Khan Academy Help Center — "What are energy points, badges, and avatars?" https://support.khanacademy.org/hc/en-us/articles/202487710-What-are-energy-points-badges-and-avatars  
2. Khan Academy Blog — "Khan Academy Efficacy Results, November 2024" https://blog.khanacademy.org/khan-academy-efficacy-results-november-2024/  
3. Journal of Teaching and Learning — "Leveraging 'Khanmigo' Generative AI-Powered Tool for Personalized Tutoring to Learn Scientific Concepts" https://jtl.uwindsor.ca/index.php/jtl/article/view/10052  
4. Khan Academy Blog — "How Khan Academy Is Building a Better AI Tutor: Our Most Recent Learnings" https://blog.khanacademy.org/how-khan-academy-is-building-a-better-ai-tutor-our-most-recent-learnings/  
5. SkillsCouter — "Brilliant.org Review 2026" https://skillscouter.com/brilliant-review-math-science-coding/  
6. SchemaNinja — "Brilliant.org Pricing 2026" https://schemaninja.com/brilliant-org-pricing/  
7. Brilliant — "Brilliant Basics" Help Center https://brilliant.org/help/using-brilliant/  
8. Kumon — "Self-Learning: The Kumon Method and Its Strengths" https://www.kumon.com/about-kumon/kumon-method/self-learning  
9. Kumon Institute of Education — "Small-Step Worksheets" https://www.kumongroup.com/eng/about-kumon/method/small-steps/  
10. Kumon — "Understanding Completion Time in Kumon: A Parent's Practical Guide" https://www.kumon.com/resources/canadian_english/understanding-completion-time-in-kumon-a-parents-practical-guide/  
11. What Works Clearinghouse — "WWC Intervention Report: Kumon Math" (March 2009) https://ies.ed.gov/ncee/wwc/Docs/InterventionReports/wwc_kumon_031009.pdf  
12. IXL — "SmartScore Guide" https://www.ixl.com/materials/SmartScore_Guide.pdf  
13. IXL Official Blog — "IXL SmartScore: The key to mastery-based learning" https://blog.ixl.com/2020/11/11/ixl-smartscore-the-key-to-mastery-based-learning/  
14. Brighterly — "IXL Cost: All You Need to Know [2026]" https://brighterly.com/blog/ixl-cost/  
15. EdWeek — "Popular Interative Math Game Prodigy Is Target of Complaint to Federal Trade Commission" https://www.edweek.org/technology/popular-interactive-math-game-prodigy-is-target-of-complaint-to-federal-trade-commission/2021/02  
16. NBC News — "In Complaint to FTC, Child Advocates Warn Prodigy Math Game Exploiting Pandemic to Prey on Students, Parents" https://www.nbcnews.com/tech/tech-news/child-protection-nonprofit-alleges-manipulative-upselling-math-game-prodigy-n1258294  
17. Fairplay for Kids — "7 reasons to say 'no' to Prodigy" https://fairplayforkids.org/pf/prodigy/  
18. Prodigy Game Wiki (Fandom) — "Battles" https://prodigy-game.fandom.com/wiki/Battles  
19. Brighterly — "Prodigy Membership Cost 2026: How Much Does It Really Cost?" https://brighterly.com/blog/prodigy-membership-cost/  
20. Higher Ed Dive — "Harvard research finds positive results from DreamBox adaptive learning" https://www.highereddive.com/news/harvard-research-finds-positive-results-from-dreambox-adaptive-learning/420471/  
21. What Works Clearinghouse — "Evidence Snapshot: DreamBox Learning" https://ies.ed.gov/ncee/wwc/EvidenceSnapshot/627  
22. Business Wire — "Study Proves DreamBox Learning Significantly Increases Math Achievement After Only One Hour of Use Per Week" https://www.businesswire.com/news/home/20230330005199/en/Study-Proves-DreamBox-Learning%C2%AE-Significantly-Increases-Math-Achievement-After-Only-One-Hour-of-Use-Per-Week  
23. WestEd — "Evaluation of the MIND Research Institute's Spatial-Temporal Math (ST Math) Program in California" (2014) https://www.wested.org/resource/stmathevaluation2014/  
24. MIND Research Institute — "ST Math Meets ESSA Tier 2 and WWC Standards" https://blog.mindresearch.org/news/st-math-meets-essa-tier-2-and-wwc-standards  
25. MIND Education / ST Math — "Validation and Methodology" https://stmath.com/impact/validation-and-methodology  
26. Business Model Canvas Template — "How Does Photomath Company Work?" https://businessmodelcanvastemplate.com/blogs/how-it-works/photomath-how-it-works  
27. AI Chat Daily — "Photomath review 2026: is the math solver still essential?" https://www.aichatdaily.com/tools/photomath  
28. Duolingo Wiki (Fandom) — "Math" https://duolingo.fandom.com/wiki/Duolingo_Math  
29. Matific — Parents product page (efficacy claim) https://www.matific.com/us/en-us/home/parents/  
30. Educational App Store — "Matific Review - Features, Pricing, Pros & Cons" https://www.educationalappstore.com/app/matific-for-school-educational-math-games  
31. Mathletics — "How much does Mathletics cost?" https://knowledgebase.mathletics.com/pricing/how-much-does-mathletics-cost  
32. PMC — "Examining the effectiveness of gamification as a tool promoting teaching and learning in educational settings: a meta-analysis" https://pmc.ncbi.nlm.nih.gov/articles/PMC10591086/
