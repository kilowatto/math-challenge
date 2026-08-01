# Construir e operar um banco de 2.500 itens de matemática: o que os produtos de aprendizagem reais fazem

> Pesquisa Math Challenge — 2026-07-31 — tópico 40

## Resumo executivo (tópicos)

Os produtos educacionais reais raramente escrevem cada item à mão. IXL publica ~1.219 competências de matemática para pré-escolar–8º ano [1] — não itens, mas *habilidades*, cada uma sustentada por geração dinâmica de perguntas. Khan Academy usa Perseus, seu editor/renderer de exercícios [2], para combinar autoria humana com variação paramétrica. WeBWorK mostra o extremo oposto: um modelo em sua linguagem PG produz um número ilimitado de variantes numéricas [5]. A pesquisa 2023-2026 sobre geração de itens com LLM é clara e modesta ao mesmo tempo: os modelos geram distractores matematicamente válidos, mas **não antecipam bem os erros reais dos estudantes** [arXiv 2404.02124] — por isso este banco não pode automatizar a “explicação do erro comum” sem revisão humana.

Para 2.500 itens em 5 idiomas, o plano distribui o trabalho assim: ~40% gerado por modelos paramétricos (forte em K-8, fraco em pós-graduação/doutorado), ~29% redigido por LLM com revisão humana obrigatória, e ~31% escrito à mão por especialistas (dominante nos níveis mais altos). O custo de API do LLM para redigir e traduzir é, com a aritmética mostrada abaixo, da ordem de centenas de dólares — um erro de arredondamento frente ao custo humano (SME, editorial, tradução, revisão psicométrica), estimado na ordem de mil dias-pessoa. QTI 3.0 é adotável de forma incremental (seu próprio modelo de conformidade permite isso) [3][4]; não é necessário implementá-lo inteiro para o MVP.

## Resumo executivo (prosa)

Os produtos de aprendizagem reais raramente escrevem à mão cada item. IXL publica ~1.219 habilidades de matemática para pré-escolar–8º ano [1] — não itens, mas *habilidades*, cada uma sustentada por geração dinâmica de perguntas. Khan Academy usa Perseus, seu próprio editor/renderer de exercícios [2], para combinar autoria humana com variação paramétrica. WeBWorK representa o extremo limpo: um problema em sua linguagem PG pode gerar instâncias numéricas aleatórias ilimitadas [5]. A pesquisa 2023-2026 sobre geração de itens com LLM é clara e modesta ao mesmo tempo: os modelos criam distractores matematicamente válidos, mas **não são bons em antecipar as concepções errôneas reais dos estudantes** [arXiv 2404.02124] — a razão pela qual este banco não pode automatizar a etapa de “explicação do erro comum” sem revisão humana.

Para 2.500 itens em 5 idiomas, o plano abaixo divide o trabalho aproximadamente 40% em modelos paramétricos (fortes em K-8, fracos em pós-graduação/Doutorado), 29% redigidos por LLM com revisão humana obrigatória e 31% escritos à mão por especialistas (dominantes no topo da escada). O custo da API do LLM para redação e tradução, com a aritmética mostrada abaixo, está na ordem de centenas de dólares — um erro de arredondamento comparado ao custo em horas-humanas (SME, editorial, tradução, revisão psicométrica), estimado em cerca de mil dias-pessoa. QTI 3.0 pode ser adotado incrementalmente (seu próprio modelo de conformidade permite isso) [3][4]; o MVP não precisa da especificação completa.

## Resultados

### Quantos itens os produtos reais realmente têm

Contagens publicadas e verificáveis são mais escassas do que a propaganda sugere. A página de matemática da IXL em idioma espanhol indica contagens de habilidades por faixa de série — Preescolar 73, 1ª 117, 2ª 127, 3ª 183, 4ª 130, 5ª 125, 6ª 112, 7ª 108, 8ª 144 — totalizando **1.219 habilidades em 9 séries** [1]. Isso são *habilidades*, não itens: cada habilidade é uma categoria tipo modelo que a IXL gera questões de prática dinamicamente, de modo que a contagem de perguntas por habilidade é ilimitada, assim como um problema do WeBWorK. Nenhum total comparável foi encontrado nesta sessão para a contagem de exercícios da Khan Academy, a contagem de problemas da Brilliant ou a contagem de folhas de trabalho da Kumon — esses números circulam em materiais de marketing e fontes secundárias, mas nenhuma página primária acessada nesta sessão informou um número, portanto são omitidos ao invés de adivinhados. O artigo da Wikipedia sobre Bancos de Itens descreve os metadados de ciclo de vida que os bancos de itens rastreiam (status: novo/piloto/ativo/aposentado; histórico de uso) [item bank wiki] mas não fornece tamanho concreto para nenhum programa nomeado.

### Geração parametrizada vs. autoria manual

O Perseus da Khan Academy é a descrição do próprio repositório de “editor e renderizador de questões de exercício da Khan Academy” — um sistema para autoria, renderização e avaliação de respostas de exercícios, licenciado sob MIT mas fechado a contribuições externas [2]. A linguagem PG (“Problem Generation”) do WeBWorK é um formato de autoria baseado em Perl construído para randomização: instrutores escrevem um problema, e a parametrização permite que cada sessão de estudante extraia valores numéricos diferentes do mesmo modelo, produzindo um pool de itens efetivamente ilimitado a partir de uma única fonte autorada [5] — o padrão concreto “um modelo, muitos itens” que este projeto precisa para aritmética K-8 e álgebra inicial. O Brilliant.org descreve sua abordagem como híbrida: o conteúdo é “feito à mão” por uma equipe que vai de “PhDs em matemática a engenheiros e designers”, enquanto aprendizado de máquina gera personalização “visual e interativa on-the-fly” sobreposto — e a Brilliant afirma que o novo conteúdo de conjuntos de revisão é “human-review[ed] everything”, lançado gradualmente por esse motivo [brilliant about page]. O padrão em todos os três: modelos e geração dinâmica multiplicam *volume*, mas um humano ainda projeta o modelo e suas restrições.

O artigo da Wikipedia sobre Geração Automática de Itens (AIG) enquadra o método: “um especialista em testes cria um modelo de item; então, um algoritmo de computador é desenvolvido para gerar itens de teste” — algoritmos então “geram famílias de itens a partir de um conjunto menor de modelos-pai”, o que “pode gerar muito mais itens em um dado período de tempo do que um especialista humano”, reduzindo custos [AIG wiki]. Nenhum artigo forneceu um multiplicador concreto de itens-por-modelo ou percentual de redução de custo nesta sessão.

### Itens gerados por LLM: reais, porém limitados (pesquisa 2023–2026)

Um ponto de dado concreto e citável: Feng, Lee, McNichols, Scarlatos, Smith, Woodhead, Otero Ornelas e Lan, “Exploring Automated Distractor Generation for Math Multiple-choice Questions via Large Language Models” (arXiv 2404.02124), testam aprendizado in-contexto e fine-tuning para gerar distractores de múltipla escolha em um conjunto de dados de matemática do mundo real. Seu principal achado corresponde exatamente à restrição que o esquema deste projeto deve respeitar: “embora LLMs possam gerar alguns distractores matematicamente válidos, eles são menos hábeis em antecipar erros ou concepções equivocadas comuns entre estudantes reais” [arXiv 2404.02124]. Nenhuma taxa de aprovação por revisão de especialista numérica estava no resumo recuperado nesta sessão, portanto nenhuma foi citada — mas o achado qualitativo é fundamental: um LLM pode escrever uma resposta errada plausível, mas se ela corresponde ao que um estudante real realmente pensaria é um problema mais difícil que os modelos atuais ainda não resolvem bem. A página de pesquisa da Duolingo lista “Jump-Starting Item Parameters for Adaptive Language Tests” (McCarthy et al., EMNLP 2021) [Duolingo research], abordando o problema adjacente de cold-start ao estimar dificuldade para itens recém-gerados antes que existam dados de resposta reais — um problema que este banco enfrenta para cada novo item no dia zero.

### Fluxo de QA de itens e triagem psicométrica

A Teoria Clássica dos Testes (CTT) define duas estatísticas por item que qualquer pipeline de produção precisa antes de confiar em um item: o **p-value**, “a proporção de examinados que respondem na direção chaveada” (dificuldade — p maior significa mais fácil), e a **discriminação do item**, calculada via correlação ponto-biserial entre a pontuação do item e a pontuação total do teste, usada “para avaliar itens e diagnosticar possíveis problemas, como um distractor confuso” [CTT wiki; point-biserial wiki]. Nenhum artigo indicou um limiar numérico para discriminação ou dificuldade “suficientemente boa”, portanto nada é afirmado aqui. O que está documentado: o Teste Adaptativo Computadorizado afirma que “todos os itens devem ser pré-testados com uma amostra grande o suficiente para obter estatísticas estáveis. Essa amostra pode precisar ser tão grande quanto **1.000 examinados**” [CAT wiki] — a única figura quantitativa de tamanho de amostra surgida nesta sessão, e um limite superior útil para o quão conservadores programas reais podem ser. O Item Bank descreve os metadados de ciclo de vida que sistemas maduros rastreiam: “status do item (ex.: novo, piloto, ativo, aposentado)” e “histórico do item (ex.: data(s) de uso e revisões)” [item bank wiki] — informando diretamente o campo `status` abaixo.

### Corrigindo um item após milhares de respostas já referenciá-lo

Nenhuma fonte abordou versionamento diretamente, mas o padrão de status de ciclo de vida [item bank wiki] implica a resposta: um item com dados de resposta anexados nunca é editado no local — as estatísticas são calculadas contra a redação exata que os estudantes responderam, e alterá-la silenciosamente invalida toda contribuição das respostas anteriores. O padrão seguro: criar uma nova versão, aposentar a antiga (`status: retired`, nunca excluída), iniciar uma nova janela de estatísticas.

### QTI 3.0 — vale a pena para uma startup

O QTI 3.0 da 1EdTech é o padrão para “troca de itens de avaliação, testes, dados de uso e relatórios de resultados entre diferentes aplicações”, consolidando versões anteriores do QTI e o padrão de acessibilidade APIP, com suporte nativo a Teste Adaptativo Computadorizado e Interação Customizada Portátil, e acessibilidade incorporada Section 508 / WCAG 2.1 AA [3]. Sua própria orientação de implementação deixa explícito que a conformidade é **modular**: “as necessidades do programa de avaliação geralmente determinam quais dos muitos recursos do QTI 3 são usados”, e conformidade/certificação é um documento separado precisamente para que organizações possam adotar um subconjunto [4]. Um caminho mínimo — validação XML/XSD central, interações básicas de escolha/entrada de texto, templates de processamento de respostas, empacotamento padrão, marcação de acessibilidade central — funciona sem tocar em teste adaptativo ou Interações Customizadas Portáteis [4]. O QTI 3.0 não é tudo-ou-nada: adiar CAT/PCI enquanto se ganha interoperabilidade e estrutura de acessibilidade para os tipos de item do MVP é uma opção genuína.

### Fluxo de localização em 5 idiomas

Nenhuma fonte descreveu um fluxo de tradução específico para matemática, portanto este é um raciocínio derivado. O ponto relevante do material AIG/WeBWorK: o custo de tradução escala com *conteúdo autorado distinto*, não com a contagem de itens gerados. O texto fixo de um modelo (“Qual é __ + __?”) é traduzido uma vez por idioma e cobre todas as variantes numéricas que ele gerar, enquanto o texto completo de um item escrito à mão ou gerado por LLM é traduzido por item — a alavanca única maior no modelo de custo abaixo.

### Valores reais de custo-por-item na indústria de avaliação

Nenhum encontrado e verificado independentemente nesta sessão. Tentativas de acesso a páginas de recursos da AIR, NCIEA e ETS retornaram 404 ou nenhum dado de custo; a página de pesquisa da ETS indicava apenas “11,9K publicações” existentes, sem cifra de custo [ETS research page]. Blogs da indústria costumam citar custos por item na faixa de poucos milhares de dólares — mas como nenhuma fonte primária foi recuperada ao vivo nesta sessão, esse número **não** é usado abaixo. O modelo de custo, em vez disso, deriva inteiramente da precificação declarada de APIs de LLM e de suposições explícitas e rotuladas de pessoa-dia.

## Tabela de benchmarks

| Produto / sistema | Contagem de item ou habilidade | Gerado ou manual | Fonte |
|---|---|---|---|
| IXL (matemática, PreK–8) | ~1.219 habilidades (9 faixas de série) | Categorias de habilidade curadas; perguntas geradas dinamicamente por habilidade | [1] |
| Khan Academy (Perseus) | Não verificado nesta sessão | Híbrido: definições de exercícios criadas por humanos renderizadas/variadas pelo Perseus | [2] |
| WeBWorK (linguagem PG) | Grande biblioteca; contagem não verificada | Baseado em modelo: um problema PG gera instâncias randomizadas ilimitadas | [5] |
| Brilliant.org | Não declarado publicamente | Híbrido: base feita à mão + personalização ML on-the-fly, revisado por humanos | [brilliant about] |
| Duolingo (pesquisa de calibração de itens) | N/D — teste de idioma | Itens gerados algoritmicamente; calibração de dificuldade assistida por ML para itens de cold-start | [Duolingo research] |
| NWEA MAP Growth (CAT) | Não verificado nesta sessão | Banco CAT; amostras de pré-teste citadas de até 1.000 examinados para estatísticas estáveis | [CAT wiki] |
| Prática geral de AIG | Não há figura universal | Especialista cria um “modelo de item”; algoritmo gera famílias de itens a partir dele | [AIG wiki] |

## Um plano MVP concreto de 2.500 itens

**Bandas de nível e contagem de itens** (pirâmide — mais itens onde a maioria dos usuários está):

| Banda | Itens |
|---|---|
| K–2 | 300 |
| 3–5 | 400 |
| 6–8 | 450 |
| 9–10 | 400 |
| 11–12 | 350 |
| Undergraduate (intro) | 350 |
| Advanced undergrad / Masters | 150 |
| PhD / research | 100 |
| **Total** | **2.500** |

**Participação por fonte, por banda** (a participação de modelos cai e a participação manuscrita sobe à medida que o nível aumenta — modelos têm dificuldade com conteúdo avançado baseado em provas, e nuances de concepções errôneas importam mais onde os LLMs são mais fracos):

| Banda |% Modelo / itens |% Redigido por LLM / itens |% Manuscrito / itens |
|---|---|---|---|
| K–2 | 70% / 210 | 20% / 60 | 10% / 30 |
| 3–5 | 60% / 240 | 25% / 100 | 15% / 60 |
| 6–8 | 50% / 225 | 30% / 135 | 20% / 90 |
| 9–10 | 35% / 140 | 35% / 140 | 30% / 120 |
| 11–12 | 30% / 105 | 30% / 105 | 40% / 140 |
| Undergraduate | 20% / 70 | 30% / 105 | 50% / 175 |
| Advanced/Masters | 10% / 15 | 30% / 45 | 60% / 90 |
| PhD | 5% / 5 | 25% / 25 | 70% / 70 |
| **Total** | **1.010 (40,4%)** | **715 (28,6%)** | **775 (31,0%)** |

**O portão de revisão** (todo item passa por todas as etapas; apenas o esforço por etapa difere): autoria SME / design de modelo → passagem editorial → verificação de exatidão matemática → revisão de acessibilidade (texto alternativo, notação segura para leitores de tela) → tradução (4 idiomas-alvo) → piloto (coleta de respostas reais) → triagem psicométrica (promover a `active` somente quando a contagem de respostas for suficiente — implicação 4). Itens manuscritos entram em “autoria SME”; itens redigidos por LLM entram com um rascunho em mãos, mas passam por todas as etapas subsequentes; itens gerados por modelo pulam a autoria por item, mas o *modelo* passa pelo mesmo portão uma vez.

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

**Esforço em dias-pessoa** (cada figura é uma estimativa rotulada; aritmética mostrada):

- Design de modelo: 50 modelos (≈20 variantes/modelo cobrindo os 1.010 itens de modelo) × 0,5 dia = **25 dias**; construção do motor de parametrização única **≈15 dias** (não por item).
- Revisão/correção de itens redigidos por LLM: 715 × 0,15 dia = **≈107 dias**.
- Autoria manuscrita: 615 itens (K-2–undergrad, 0,5 dia cada) + 160 (Advanced+PhD, 1,0 dia cada, tempo de especialista mais escasso) = **≈468 dias**.
- Revisão de tradução (verificação pontual bilíngue de SME da tradução LLM, não re-tradução independente): 50 modelos × 4 idiomas = 200 unidades, mais 1.490 itens × 4 idiomas = 5.960 → **6.160 unidades** × 0,05 dia = **≈308 dias**.
- Passagem editorial + acessibilidade, uniforme: 2.500 × 0,05 dia = **≈125 dias**.
- Revisão psicométrica em lote: 2.500 / 50 por lote × 0,1 dia = **≈5 dias** (exclui tempo de calendário aguardando respostas do piloto — restrição de cronograma, não custo de esforço).

**Total: 25+15+107+468+308+125+5 ≈ 1.053 dias-pessoa**, aproximadamente 4,2 anos-pessoa. Uma equipe de 5 pessoas (2 SMEs de matemática, 1 líder de localização, 1 editor/psicométrico, 1 engenheiro) conclui isso em ≈1.053÷5 ≈ **210 dias úteis, cerca de 10 meses** — estimativa derivada, não um número citado da indústria.

**Custo estimado de LLM para redação + tradução** (preço padrão Claude Sonnet 5: US$3,00 entrada / US$15,00 saída por milhão de tokens):

- Itens redigidos por LLM, primeiro rascunho (~1.500 tokens de entrada + ~800 tokens de saída por item): (1.500×US$3 + 800×US$15)/um milhão = **US$0,0165/item** × 715 ≈ **US$12**.
- Itens manuscritos, assistência LLM apenas para redação de concepções errôneas (mesmo perfil de tokens): 775 × US$0,0165 ≈ **US$13**.
- Assistência na autoria de modelo (~5.000 tokens de entrada + 2.000 tokens de saída por modelo): US$0,045/modelo × 50 ≈ **US$2**.
- Tradução (~800 tokens de entrada + ~900 tokens de saída por unidade): US$0,0159/unidade × 6.160 unidades ≈ **US$98**.

**Total bruto de passagem única ≈ US$125.** Um multiplicador de segurança de 5× para iteração realista (re-validações, regeneração acionada por revisão, Opus 5 para as bandas mais difíceis) gera **≈ US$500–US$700** total para toda a fase de redação e tradução — ainda abaixo de US$1.500 dobrado para contingência, três ordens de magnitude abaixo do custo de mão-de-obra em dias-pessoa. Cache de prompts reduziria ainda mais, mas não está contabilizado aqui.

## Implicações de design

1. Use modelos parametrizados para aritmética K–8 e álgebra inicial — um modelo estilo WeBWorK que gera variantes numéricas ilimitadas [5] é a alavanca de maior impacto neste plano.  
2. Reserve orçamento de autoria manuscrita para 11–12 até PhD, onde os modelos têm menor participação (30% descendo para 5%) porque conteúdo baseado em provas resiste à randomização segura.  
3. Traduza modelos, não instâncias geradas: 200 unidades de tradução cobrem 1.010 itens de modelo versus 5.960 unidades para itens únicos — a maior alavanca de localização no modelo.  
4. Trate p-values e discriminação point-biserial como provisórios até que respostas se acumulem; literatura CAT cita amostras de até 1.000 examinados para estatísticas de pré-teste estáveis [CAT wiki] — não promova um item a `active` abaixo de um mínimo claramente declarado (questão aberta 4).  
5. Versione itens de forma imutável. Nunca edite um item com respostas anexadas — crie uma nova versão, retire a antiga (`status: retired`, nunca excluída), espelhando o ciclo de vida novo/piloto/ativo/retirado documentado para bancos de itens em geral [item bank wiki].  
6. Adote QTI 3.0 incrementalmente — seu modelo de conformidade é explicitamente modular [4]; implemente interações centrais e metadados de acessibilidade para o MVP e adie suporte a CAT/PCI.  
7. Construa o portão de revisão como uma máquina de estados explícita correspondendo ao campo `status`: draft → editorial → math check → accessibility → translation → pilot → psychometric screening → active/retired.  
8. Orce o custo da API LLM como insignificante (centenas de dólares) em relação ao custo de revisão humana (centenas de milhares, conforme o cálculo de dias-pessoa acima) — a restrição real são tempo de SME e tradutor, não tokens.  
9. Porque pesquisas de 2023–2026 mostram que LLMs redigem conteúdo matematicamente válido mas distrações cegas a concepções errôneas [arXiv 2404.02124], exija revisão humana de concepções errôneas em todo item redigido ou assistido por LLM — nunca entregue uma explicação de concepção errônea não revisada ao Larry.  
10. Espere que o ROI dos modelos caia drasticamente no topo da pirâmide de níveis: custo de design por modelo é aproximadamente fixo independentemente da dificuldade, mas um modelo PhD gera muito menos variantes utilizáveis com segurança que um modelo K-2 — o plano já reduz a participação de modelo à medida que o nível sobe.  
11. Sequencie a tradução *após* a verificação matemática e a revisão de acessibilidade, não antes — traduzir conteúdo que depois falha na revisão técnica desperdiça tempo do tradutor.  
12. Cache o texto compartilhado de instrução/esquema/guia de estilo entre chamadas de redação e tradução; 715+775+6.160 chamadas compartilham um grande prefixo estável, de modo que o cache de prompts pode reduzir ainda mais o custo LLM realizado.  
13. Planeje controle de exposição de itens quando a plataforma suportar entrega adaptativa — mesmo um banco de 2.500 itens se beneficia do princípio de controle de exposição que sistemas CAT usam para evitar superexposição de itens populares [CAT wiki].  
14. Trate cada dia-pessoa e figura de custo aqui como estimativa a validar contra um piloto, não como meta fixa — nenhuma fonte forneceu um multiplicador verificado de itens-por-modelo ou custo-por-item para conteúdo matemático especificamente; os números 20×-por-modelo e US$/item são suposições modeladas, rotuladas como tal.

## Perguntas abertas para o dono do projeto
1. Qual taxa diária carregada devemos assumir para tempo de SME/tradutor/editor, para converter os ~1.053 dias-pessoa acima em um valor de orçamento?  
2. Os 2.500 itens são um alvo firme ou um piso, com margem reservada para tópicos que precisem de mais itens após os dados do piloto retornarem?  
3. Quais das 4 línguas não-inglês podem usar tradução LLM + verificação pontual (como modelado acima), e quais precisam de tradução humana independente desde o primeiro dia?  
4. Qual contagem mínima de respostas deve bloquear a promoção a `active` — a regra prática tradicional de CTT (geralmente ~30), ou a faixa mais conservadora de ~200–1.000 citada na literatura CAT para estatísticas estáveis [CAT wiki]?  
5. O portão de revisão deve bloquear a exportação QTI 3.0 no MVP, ou adiar isso para um marco de interoperabilidade pós-MVP?  
6. Advanced/Masters e PhD carregam a menor participação de modelo e maior custo por item — devemos orçar um SME contratado especializado apenas para essas duas bandas?  
7. As explicações de concepções errôneas do Larry devem ser criadas uma vez em inglês e traduzidas, ou independentemente por idioma (ex.: confusão vírgula decimal vs ponto em ES/FR/DE)?

## Fontes

1. [IXL — Math (Spanish locale, skill counts by grade)](https://la.ixl.com/math)
2. [Khan/perseus — Khan Academy's exercise question editor and renderer](https://github.com/Khan/perseus)
3. [1EdTech — QTI standards overview](https://www.1edtech.org/standards/qti)
4. [1EdTech — QTI 3.0 implementation/conformance guidance](https://www.imsglobal.org/spec/qti/v3p0/impl)
5. [Wikipedia — WeBWorK](https://en.wikipedia.org/wiki/WeBWorK)
6. [Wikipedia — Automatic item generation](https://en.wikipedia.org/wiki/Automatic_item_generation)
7. [Wikipedia — Classical test theory](https://en.wikipedia.org/wiki/Classical_test_theory)
8. [Wikipedia — Point-biserial correlation coefficient](https://en.wikipedia.org/wiki/Point-biserial_correlation_coefficient)
9. [Wikipedia — Item bank](https://en.wikipedia.org/wiki/Item_bank)
10. [Wikipedia — Computerized adaptive testing](https://en.wikipedia.org/wiki/Computerized_adaptive_testing)
11. [Wikipedia — Item response theory](https://en.wikipedia.org/wiki/Item_response_theory)
12. [Wikipedia — Duolingo English Test](https://en.wikipedia.org/wiki/Duolingo_English_Test)
13. [Duolingo Research — publications page](https://research.duolingo.com/)
14. [arXiv 2404.02124 — Exploring Automated Distractor Generation for Math Multiple-choice Questions via Large Language Models (Feng, Lee, McNichols, Scarlatos, Smith, Woodhead, Otero Ornelas, Lan)](https://arxiv.org/abs/2404.02124)
15. [Brilliant.org — About](https://brilliant.org/about/)
16. [ETS Research Institute — homepage](https://www.ets.org/research.html)
