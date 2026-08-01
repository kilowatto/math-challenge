# Construir e operar um banco de 2.500 itens de matemática: o que fazem os produtos de aprendizagem reais

> Math Challenge research — 2026-07-31 — topic 40

## Resumo executivo (ES)

Os produtos educativos reais raramente escrevem cada item à mão. IXL publica ~1.219 competências de matemática para pré‑escolar–8.º ano [1] — não itens, mas *habilidades*, cada uma suportada por geração dinâmica de perguntas. A Khan Academy usa o Perseus, o seu editor/renderizador de exercícios [2], para combinar autoria humana com variação paramétrica. O WeBWorK mostra o extremo oposto: um modelo na sua linguagem PG produz um número ilimitado de variantes numéricas [5]. A investigação de 2023–2026 sobre geração de itens com LLM é clara e modesta ao mesmo tempo: os modelos geram distratores matematicamente válidos mas **não antecipam bem os erros reais dos estudantes** [arXiv 2404.02124] — por isso este banco não pode automatizar a “explicação do erro comum” sem revisão humana.

Para 2.500 itens em 5 idiomas, o plano reparte o trabalho assim: ~40 % gerado por modelos paramétricos (forte no K‑8, fraco no pós‑graduação/doutoramento), ~29 % redigido por LLM com revisão humana obrigatória, e ~31 % escrito à mão por especialistas (dominante nos níveis mais elevados). O custo de API do LLM para redigir e traduzir é, com a aritmética mostrada abaixo, da ordem de centenas de dólares — um erro de arredondamento face ao custo humano (SME, editorial, tradução, revisão psicométrica), estimado na ordem de mil dias‑pessoa. O QTI 3.0 é adoptável de forma incremental (o seu próprio modelo de conformidade o permite) [3][4]; não é necessário implementá‑lo na totalidade para o MVP.

## Resumo executivo (EN)

Os produtos educativos reais raramente escrevem à mão cada item. A IXL publica ~1.219 competências de matemática para pré‑escolar–8.º ano [1] — não itens, mas *habilidades*, cada uma suportada por geração dinâmica de perguntas. A Khan Academy utiliza o Perseus, o seu próprio editor/renderizador de exercícios [2], para combinar autoria humana com variação paramétrica. O WeBWorK representa o extremo limpo: um problema na sua linguagem PG pode produzir instâncias numéricas aleatórias ilimitadas [5]. A investigação de 2023–2026 sobre geração de itens com LLM é clara e modesta ao mesmo tempo: os modelos redigem distratores matematicamente válidos mas **não são bons a antecipar as conceções erróneas reais dos estudantes** [arXiv 2404.02124] — a razão pela qual este banco não pode automatizar a etapa de “explicação do erro comum” sem revisão humana.

Para 2.500 itens em 5 idiomas, o plano abaixo divide o trabalho aproximadamente 40 % em modelos paramétricos (forte no K‑8, fraco no pós‑graduação/Doutoramento), 29 % redigido por LLM com revisão humana obrigatória, e 31 % escrito à mão por especialistas (dominante no topo da escada). O custo da API do LLM para redigir e traduzir, com a aritmética mostrada abaixo, está na ordem de centenas de dólares — um erro de arredondamento face ao custo humano (SME, editorial, tradução, revisão psicométrica), estimado em cerca de mil dias‑pessoa. O QTI 3.0 pode ser adotado incrementalmente (o seu próprio modelo de conformidade permite isso) [3][4]; o MVP não necessita da especificação completa.

## Constatações

### Quantos itens os produtos reais têm realmente

Contagens publicadas e verificáveis são mais escassas do que o material de marketing sugere. A página de matemática de IXL para o idioma espanhol indica o número de competências por nível de série — Preescolar 73, 1.º 117, 2.º 127, 3.º 183, 4.º 130, 5.º 125, 6.º 112, 7.º 108, 8.º 144 — totalizando **1.219 competências em 9 níveis de série** [1]. Isto são *competências*, não itens: cada competência é uma categoria tipo modelo que a IXL gera questões de prática dinamicamente, pelo que o número de questões por competência é ilimitado, da mesma forma que um problema do WeBWorK. Não foi encontrada nesta sessão uma contagem comparavelmente precisa para o número de exercícios da Khan Academy, o número de problemas da Brilliant ou a contagem de folhas de exercício da Kumon — esses valores circulam em material de marketing e fontes secundárias, mas nenhuma página primária obtida nesta sessão indicou um número, pelo que são omitidos em vez de adivinhados. O artigo da Wikipédia sobre Bancos de Itens descreve os metadados de ciclo de vida que os bancos de itens monitorizam (estado: novo/piloto/ativo/retirado; histórico de utilização) [item bank wiki] mas não fornece um tamanho concreto para qualquer programa nomeado.

### Geração parametrizada vs. autoria manual

O Perseus da Khan Academy é a própria descrição do seu repositório de “editor e renderizador de questões de exercício da Khan Academy” — um sistema para autoria, renderização e avaliação de respostas a exercícios, licenciado pela MIT mas fechado a contribuições externas [2]. A linguagem PG (“Problem Generation”) do WeBWorK é um formato de autoria baseado em Perl construído para randomização: os instrutores escrevem um problema, e a parametrização permite que cada sessão de estudante extraia valores numéricos diferentes a partir do mesmo modelo, produzindo um conjunto de itens efetivamente ilimitado a partir de uma única fonte autorada [5] — o padrão concreto “um modelo, muitos itens” que este projeto necessita para aritmética e álgebra inicial de K‑8. O Brilliant.org descreve a sua abordagem como híbrida: o conteúdo é “hand‑crafted” por uma equipa que vai desde “math PhDs to engineers and designers”, enquanto a aprendizagem automática gera personalização “on‑the‑fly visual and interative” sobreposta — e o Brilliant afirma que o novo conteúdo de conjuntos de revisão é “human‑review[ed] everything”, implementado gradualmente por essa razão [brilliant about page]. O padrão comum a todos os três: modelos e geração dinâmica multiplicam *volume*, mas um ser humano ainda concebe o modelo e as suas restrições.

### Itens gerados por LLM: reais mas limitados (pesquisa 2023–2026)

Um ponto de dados concreto e citável: Feng, Lee, McNichols, Scarlatos, Smith, Woodhead, Otero Ornelas e Lan, “Exploring Automated Distractor Generation for Math Multiple-choice Questions via Large Language Models” (arXiv 2404.02124), testam aprendizagem em contexto e fine‑tuning para gerar distratores de escolha múltipla num conjunto de dados de matemática do mundo real. A sua principal descoberta corresponde exatamente à restrição que o desenho do esquema deste projeto tem de respeitar: “although LLMs can generate some mathematically valid distractors, they are less adept at anticipating common errors or misconceptions among real students” [arXiv 2404.02124]. Nenhuma taxa numérica de aprovação por revisão de especialistas constava no resumo obtido nesta sessão, pelo que nenhuma foi citada — mas a descoberta qualitativa é fundamental: um LLM pode escrever uma resposta errada aparentemente plausível, mas se corresponde ao que um estudante real realmente pensa é um problema mais difícil que os modelos atuais ainda não resolvem bem. A página de investigação da Duolingo lista “Jump-Starting Item Parameters for Adaptive Language Tests” (McCarthy et al., EMNLP 2021) [Duolingo research], abordando o problema adjacente de arranque a frio de estimar a dificuldade de itens recém‑gerados antes de existirem dados de resposta reais — um problema que este banco enfrenta para cada novo item no primeiro dia.

### O fluxo de QA de itens e triagem psicométrica

A Teoria Clássica dos Testes (CTT) define duas estatísticas por item que qualquer pipeline de produção necessita antes de confiar num item: o **p‑value**, “the proportion of examinees responding in the keyed direction” (dificuldade — p mais alto significa mais fácil), e a **discriminação do item**, calculada via correlação ponto‑biserial entre a pontuação de um item e a pontuação total do teste, usada “to evaluate items and diagnose possible issues, such as a confusing distractor” [CTT wiki; point-biserial wiki]. Nenhum dos artigos indicou um limiar numérico para “good enough” discriminação ou dificuldade, pelo que nada é afirmado aqui. O que *está* documentado: o Teste Adaptativo Computadorizado afirma que “all items must be pretested with a large enough sample to obtain stable item statistics. This sample may be required to be as large as **1.000 examinees**” [CAT wiki] — a única cifra quantitativa de tamanho de amostra surgida nesta sessão, e um limite superior útil para o quão conservadores os programas reais podem ser. O Item Bank descreve os metadados de ciclo de vida que sistemas maduros monitorizam: “item status (e.g., new, pilot, active, retired)” e “item history (e.g., usage date(s) and reviews)” [item bank wiki] — informando diretamente o campo `status` abaixo.

### Corrigir um item depois de milhares de respostas já o referirem

Nenhuma fonte abordou a versionamento diretamente, mas o padrão de ciclo de vida‑estado [item bank wiki] implica a resposta: um item com dados de resposta associados nunca é editado no local — as estatísticas são calculadas com base na formulação exata que os estudantes responderam, e alterá‑la silenciosamente invalida a contribuição de todas as respostas anteriores. O padrão seguro: criar uma nova versão, retirar a antiga (`status: retired`, nunca eliminada), iniciar uma nova janela de estatísticas.

### QTI 3.0 — vale a pena para uma startup

O QTI 3.0 da 1EdTech é o padrão para “exchanging assessment items, tests, usage data, and results reporting between different applications”, consolidando versões anteriores do QTI e o padrão de acessibilidade APIP, com suporte nativo a Teste Adaptativo Computadorizado e Interação Personalizada Portátil, e acessibilidade incorporada conforme a Secção 508 / WCAG 2.1 AA [3]. As suas próprias diretrizes de implementação são explícitas ao afirmar que a conformidade é **modular**: “the needs of the assessment program generally dictate which of the many QTI 3 features are used”, e a conformidade/certificação é um documento separado precisamente para que as organizações possam adotar um subconjunto [4]. Um caminho mínimo — validação central XML/XSD, interacções básicas de escolha/entrada de texto, modelos de processamento de respostas, empacotamento padrão, marcação de acessibilidade central — funciona sem tocar em teste adaptativo ou Interações Personalizadas Portáteis [4]. O QTI 3.0 não é tudo‑ou‑nada: adiar CAT/PCI enquanto se obtém interoperabilidade e uma estrutura de acessibilidade para os tipos de item do MVP é uma opção genuína.

### Fluxo de localização em 5 línguas

Nenhuma fonte descreveu um fluxo de tradução específico para matemática, pelo que este raciocínio é derivado. O facto a levar em conta a partir do material AIG/WeBWorK: o custo de tradução escala com *conteúdo autorado distinto*, não com a contagem de itens gerados. O texto fixo de um modelo (“What is __ + __?”) é traduzido uma vez por língua e cobre todas as variantes numéricas que gera, enquanto o texto completo de um item escrito à mão ou gerado por LLM é traduzido por item — a alavanca única mais importante no modelo de custos abaixo.

### Valores reais de custo por item na indústria de avaliação

Nenhum encontrado e independentemente verificado nesta sessão. As tentativas de obtenção nas páginas de recursos da AIR, NCIEA e ETS devolvem 404 ou não apresentam cifras de custo; a página principal de investigação da ETS indica apenas “11,9K publications”, sem cifra de custo [ETS research page]. Blogs da indústria costumam citar custos por item na ordem de alguns milhares de dólares — mas como nenhuma fonte primária foi obtida ao vivo nesta sessão, essa cifra **não** é utilizada abaixo. O modelo de custos deriva inteiramente dos preços declarados das APIs de LLM e de suposições explícitas e rotuladas de pessoa‑dia.

## Tabela de referências

| Produto / sistema | Contagem de itens ou competências | Gerado ou escrito à mão | Fonte |
|---|---|---|---|
| IXL (math, PreK–8) | ~1.219 competências (9 níveis de série) | Categorias de competências curadas; questões geradas dinamicamente por competência | [1] |
| Khan Academy (Perseus) | Não verificado nesta sessão | Híbrido: definições de exercício autoradas por humanos renderizadas/variadas pelo Perseus | [2] |
| WeBWorK (PG language) | Grande biblioteca; contagem não verificada | Baseado em modelo: um problema PG gera instâncias aleatórias ilimitadas | [5] |
| Brilliant.org | Não declarado publicamente | Híbrido: base feita à mão + personalização ML em tempo real, revisão humana | [brilliant about] |
| Duolingo (item calibration research) | N/D — teste de língua | Itens gerados algorítmicamente; calibração de dificuldade assistida por ML para itens de arranque a frio | [Duolingo research] |
| NWEA MAP Growth (CAT) | Não verificado nesta sessão | Banco CAT; amostras de pré‑teste citadas até 1.000 examinados para estatísticas estáveis | [CAT wiki] |
| Prática geral de AIG | Sem figura universal | Especialista em testes cria um “item model”; algoritmo gera famílias de itens a partir dele | [AIG wiki] |

## Um plano MVP concreto de 2.500 itens

**Bandas de nível e contagem de itens** (pirâmide — mais itens onde mais utilizadores estão):

| Banda | Itens |
|---|---|
| K–2 | 300 |
| 3–5 | 400 |
| 6–8 | 450 |
| 9–10 | 400 |
| 11–12 | 350 |
| Licenciatura (intro) | 350 |
| Licenciatura avançada / Mestrado | 150 |
| Doutoramento / investigação | 100 |
| **Total** | **2.500** |

**Partilha por origem, por banda** (a partilha de modelos diminui e a escrita à mão aumenta à medida que o nível sobe — os modelos têm dificuldade com conteúdo avançado baseado em provas, e a nuance de conceções erradas importa mais onde os LLMs são mais fracos):

| Banda | Modelo % / itens | LLM‑redigido % / itens | Escrito à mão % / itens |
|---|---|---|---|
| K–2 | 70% / 210 | 20% / 60 | 10% / 30 |
| 3–5 | 60% / 240 | 25% / 100 | 15% / 60 |
| 6–8 | 50% / 225 | 30% / 135 | 20% / 90 |
| 9–10 | 35% / 140 | 35% / 140 | 30% / 120 |
| 11–12 | 30% / 105 | 30% / 105 | 40% / 140 |
| Licenciatura | 20% / 70 | 30% / 105 | 50% / 175 |
| Avançado/Mestrado | 10% / 15 | 30% / 45 | 60% / 90 |
| Doutoramento | 5% / 5 | 25% / 25 | 70% / 70 |
| **Total** | **1.010 (40,4%)** | **715 (28,6%)** | **775 (31,0%)** |

**O portão de revisão** (cada item passa por todas as etapas; apenas o esforço por etapa difere): autoria SME / design de modelo → passagem editorial → verificação de exactidão matemática → revisão de acessibilidade (texto alternativo, notação segura para leitores de ecrã) → tradução (4 línguas‑alvo) → piloto (recolher respostas reais) → triagem psicométrica (promover a `active` apenas quando a contagem de respostas for suficiente — implicação 4). Itens escritos à mão entram em "autoria SME"; itens redigidos por LLM entram com um rascunho em mão mas passam por todas as etapas subsequentes; itens gerados por modelo saltam a autoria por item, mas o *modelo* passa pelo mesmo portão uma vez.

**Esquema JSON do item — campos obrigatórios:**

```
item_id, version, status, level_band, topic_tag, source_type, template_id,
languages{locale: {stem, choices, correct_answer, worked_solution,
  misconceptions[]}}, stem_canonical, choices, correct_answer,
worked_solution_canonical, misconceptions[{trigger_answer, explanation,
  remediation_hint}], difficulty_estimate_initial, irt_parameters{a, b, c,
  n_responses, last_calibrated_at}, p_value, point_biserial,
accessibility_metadata{alt_text, mathml, contrast_notes}, media[],
authoring_metadata{author, reviewer, created_at, reviewed_at, notes},
qti_export_ref, curriculum_tags[], retirement_reason
```

**Esforço em pessoa‑dias** (cada cifra é uma estimativa rotulada; aritmética mostrada):

- Design de modelo: 50 modelos (≈20 variantes/modelo cobrindo os 1.010 itens de modelo) × 0,5 dia = **25 dias**; construção única do motor de parametrização **~15 dias** (não por item).
- Revisão/correção de itens redigidos por LLM: 715 × 0,15 dia = **~107 dias**.
- Autoria escrita à mão: 615 itens (K‑2–licenciatura, 0,5 dia cada) + 160 (Avançado+Doutoramento, 1,0 dia cada, tempo de especialista mais escasso) = **~468 dias**.
- Revisão de tradução (verificação pontual bilíngue de SME da tradução LLM, não re‑tradução independente): 50 modelos × 4 línguas = 200 unidades, mais 1.490 itens × 4 línguas = 5.960 → **6.160 unidades** × 0,05 dia = **~308 dias**.
- Passagem editorial + de acessibilidade, uniforme: 2.500 × 0,05 dia = **~125 dias**.
- Revisão psicométrica em lote: 2.500 / 50 por lote × 0,1 dia = **~5 dias** (exclui tempo de calendário à espera de respostas do piloto — uma restrição de cronograma, não um custo de esforço).

**Total: 25+15+107+468+308+125+5 ≈ 1.053 pessoa‑dias, aproximadamente 4,2 pessoa‑anos.** Uma equipa de 5 pessoas (2 SMEs de matemática, 1 líder de localização, 1 editor/psicométrico, 1 engenheiro) conclui isto em ≈1.053÷5 ≈ **210 dias úteis, aproximadamente 10 meses** — uma estimativa derivada, não um dado da indústria.

**Custo estimado de LLM para redação + tradução (preços padrão Claude Sonnet 5: $3,00 entrada / $15,00 saída por milhão de tokens):**

- Itens redigidos por LLM, primeiro rascunho (~1.500 entrada + ~800 saída tokens/item): (1.500×$3 + 800×$15)/1.000.000 = **$0,0165/item** × 715 ≈ **$12**.
- Itens escritos à mão, apenas elaboração de conceções erradas assistida por LLM (mesmo perfil de tokens): 775 × $0,0165 ≈ **$13**.
- Assistência na autoria de modelos (~5.000 entrada + 2.000 saída tokens/modelo): $0,045/modelo × 50 ≈ **$2**.
- Tradução (~800 entrada + ~900 saída tokens/unidade): $0,0159/unidade × 6.160 unidades ≈ **$98**.

**Total bruto de passagem única ≈ $125.** Um multiplicador de segurança de 5× para iteração realista (repetições de validação, regeneração desencadeada por revisão, Opus 5 para as bandas mais difíceis) resulta em **≈ $500–$700** no total para toda a fase de redação e tradução — ainda abaixo de $1.500 dobrado para contingência, três ordens de grandeza abaixo do custo de mão‑de‑obra em pessoa‑dias. O cache de prompts reduziria ainda mais isto, mas não está contabilizado aqui.

## Implicações de design

1. Utilizar modelos parametrizados para aritmética K–8 e álgebra inicial — um modelo ao estilo WeBWorK que gera variantes numéricas ilimitadas [5] é a alavanca de maior impacto neste plano.  
2. Reservar o orçamento de autoria escrita à mão para os níveis 11–12 até Doutoramento, onde os modelos têm a menor participação (30 % a 5 %) porque o conteúdo baseado em demonstrações resiste à randomização segura.  
3. Traduzir os modelos, não as instâncias geradas: 200 unidades de tradução cobrem 1.010 itens de modelo versus 5.960 unidades para itens únicos — a maior alavanca de localização no modelo.  
4. Tratar os p‑values e a discriminação ponto‑biserial como provisórios até que as respostas se acumulem; a literatura CAT cita amostras de até 1.000 examinados para estatísticas de pré‑teste estáveis [CAT wiki] — não promover automaticamente um item para `active` abaixo de um mínimo claramente declarado (questão aberta 4).  
5. Versionar itens de forma imutável. Nunca editar um item com respostas associadas — criar uma nova versão, retirar a antiga (`status: retired`, nunca eliminada), espelhando o ciclo de vida novo/piloto/ativo/retirado documentado para bancos de itens em geral [item bank wiki].  
6. Adotar QTI 3.0 incrementalmente — o seu modelo de conformidade é explicitamente modular [4]; implementar as interações principais e os metadados de acessibilidade para o MVP e adiar o suporte CAT/PCI.  
7. Construir o portão de revisão como uma máquina de estados explícita que corresponda ao campo `status`: draft → editorial → math check → accessibility → translation → pilot → psychometric screening → active/retired.  
8. Orçamentar o custo da API LLM como negligível (centenas de dólares) em relação ao custo da revisão humana (centenas de milhares, segundo a matemática de pessoa‑dias acima) — a restrição real é o tempo de SME e tradutor, não os tokens.  
9. Porque a pesquisa de 2023–2026 mostra que os LLMs redigem distractores matematicamente válidos mas cegos a conceções erradas [arXiv 2404.02124], exigir revisão humana de conceções erradas em cada item redigido ou assistido por LLM — nunca enviar uma explicação de conceção errada de LLM não revisada ao Larry.  
10. Esperar que o ROI dos modelos caia drasticamente no topo da pirâmide de níveis: o custo de design por modelo é aproximadamente fixo independentemente da dificuldade, mas um modelo de Doutoramento gera muito menos variantes utilizáveis com segurança do que um de K‑2 — o plano já reduz a participação dos modelos à medida que o nível sobe.  
11. Sequenciar a tradução *após* a verificação matemática e a revisão de acessibilidade, não antes — traduzir conteúdo que depois falha na revisão técnica desperdiça o tempo do tradutor.  
12. Cachear o texto partilhado de instruções/esquema/guia de estilo entre chamadas de redação e tradução; 715+775+6.160 chamadas partilham um grande prefixo estável, por isso o cache de prompts pode reduzir ainda mais o custo de LLM realizado abaixo da estimativa.  
13. Planear o controlo de exposição de itens assim que a plataforma suportar entrega adaptativa — mesmo um banco de 2.500 itens beneficia do princípio de controlo de exposição que os sistemas CAT utilizam para evitar a exibição excessiva de itens populares [CAT wiki].  
14. Tratar cada dia‑esforço e cifra de custo aqui como uma estimativa a validar contra um piloto, não como um alvo fixo — nenhuma fonte forneceu um multiplicador verificado de itens‑por‑modelo ou custo por item para conteúdo matemático especificamente; os números de 20×‑por‑modelo e $/item são suposições modeladas, rotuladas como tal.

## Questões abertas para o proprietário do projeto

1. Qual taxa diária carregada devemos assumir para o tempo de SME/tradutor/editor, para converter os ~1.053 pessoa‑dias acima num valor de orçamento?  
2. Os 2.500 itens são um alvo firme ou um piso, com margem reservada para tópicos que precisem de mais itens quando os dados do piloto retornarem?  
3. Qual das 4 línguas não‑inglês pode usar tradução LLM + verificação pontual (conforme modelado acima), e quais necessitam de tradução humana independente desde o primeiro dia?  
4. Qual o número mínimo de respostas que deve bloquear a promoção para `active` — a regra prática tradicional da CTT (geralmente ~30), ou a gama mais conservadora de ~200–1.000 citada na literatura CAT para estatísticas estáveis [CAT wiki]?  
5. O portão de revisão deve bloquear a exportação QTI 3.0 no MVP, ou adiar isso para um marco de interoperabilidade pós‑MVP?  
6. Licenciatura avançada/Mestrado e Doutoramento têm a menor participação de modelo e o maior custo por item — devemos orçamentar um SME contratado especializado apenas para essas duas bandas?  
7. As explicações de conceções erradas de Larry devem ser criadas uma vez em inglês e traduzidas, ou independentemente por língua (por exemplo, confusão entre vírgula decimal e ponto em ES/FR/DE)?

## Fontes

1. [IXL — Matemática (localização em espanhol, contagem de competências por série)](https://la.ixl.com/math)  
2. [Khan/perseus — editor e renderizador de questões de exercício da Khan Academy](https://github.com/Khan/perseus)  
3. [1EdTech — visão geral dos padrões QTI](https://www.1edtech.org/standards/qti)  
4. [1EdTech — orientação de implementação/conformidade do QTI 3.0](https://www.imsglobal.org/spec/qti/v3p0/impl)  
5. [Wikipedia — WeBWorK](https://en.wikipedia.org/wiki/WeBWorK)  
6. [Wikipedia — Geração automática de itens](https://en.wikipedia.org/wiki/Automatic_item_generation)  
7. [Wikipedia — Teoria clássica dos testes](https://en.wikipedia.org/wiki/Classical_test_theory)  
8. [Wikipedia — Coeficiente de correlação ponto-biserial](https://en.wikipedia.org/wiki/Point-biserial_correlation_coefficient)  
9. [Wikipedia — Banco de itens](https://en.wikipedia.org/wiki/Item_bank)  
10. [Wikipedia — Teste adaptativo informatizado](https://en.wikipedia.org/wiki/Computerized_adaptive_testing)  
11. [Wikipedia — Teoria da resposta ao item](https://en.wikipedia.org/wiki/Item_response_theory)  
12. [Wikipedia — Duolingo English Test](https://en.wikipedia.org/wiki/Duolingo_English_Test)  
13. [Duolingo Research — página de publicações](https://research.duolingo.com/)  
14. [arXiv 2404.02124 — Explorando a geração automática de distratores para questões de escolha múltipla em Matemática via grandes modelos de linguagem (Feng, Lee, McNichols, Scarlatos, Smith, Woodhead, Otero Ornelas, Lan)](https://arxiv.org/abs/2404.02124)  
15. [Brilliant.org — Sobre](https://brilliant.org/about/)  
16. [ETS Research Institute — página inicial](https://www.ets.org/research.html)
