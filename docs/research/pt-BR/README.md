# Math Challenge — Índice de pesquisa / Research index

> 47 investigações feitas em **2026-07-31** por agentes independentes, cada um com instrução explícita de **não inventar citações** e de marcar como *unverified* o que não pôde confirmar contra uma fonte primária. Total ≈ 157.000 palavras.  
>   
> As mc-45 a mc-48 foram adicionadas após a onda original, ao planejar o onboarding, os clubes, o stack e o site aberto; trazem a mesma data porque o projeto inteiro foi investigado naquele dia.  
>   
> **Como ler isso.** Cada documento traz `Resumen ejecutivo (ES)` e `Executive summary (EN)` acima, achados com citações numeradas no meio, e uma seção `Design implications` ao final com o que é acionável. Se você tem cinco minutos, leia apenas os resumos executivos dos marcados ⭐.  
>   
> **Aviso de método.** A cota de WebSearch da sessão se esgotou a meio da investigação. Os agentes posteriores trabalharam por WebFetch direto contra fontes primárias (MDN, WebKit, W3C, FTC, EUR-Lex, páginas de preços, PDFs de papers) e contra o endpoint HTML do DuckDuckGo. Cada documento declara suas limitações ao final. Vários sites (ftc.gov, ico.org.uk) bloqueiam fetch automatizado, então certas afirmações legais estão marcadas `[unverified]` de propósito — **essas não podem ser usadas como base de conformidade sem confirmá‑las com um advogado.**

## Pedagogia — como se ensinam as matemáticas

| # | Documento | Para que serve |
|---|-----------|----------------|
| 01 | [Japón: lesson study, bansho, neriage, soroban](2026-07-31-mc-01-japan-lesson-study.md) | A estrutura de 4 fases de uma aula japonesa; o estudo TIMSS em vídeo com os números duros; o que a evidência real do ábaco diz |
| 02 | [China: enseñanza con variación y maestría](2026-07-31-mc-02-china-variation-mastery.md) | ⭐ Como gerar **séries** de exercícios com variação sistemática ao invés de números aleatórios. Muda a unidade de autoria |
| 03 | [Singapur: CPA y modelo de barras](2026-07-31-mc-03-singapore-cpa-bar-models.md) | O widget de barras tátil e como concreto→pictórico→abstrato mapeia para níveis de dificuldade |
| 04 | [Carga cognitiva y ejemplos resueltos](2026-07-31-mc-04-cognitive-load-worked-examples.md) | ⭐ Quando mostrar a solução vs. fazer com que resolva; como desfazer o andaime sozinho |
| 05 | [Espaciado, recuperación e intercalado](2026-07-31-mc-05-spacing-retrieval-interleaving.md) | ⭐ O algoritmo de revisão concreto (FSRS-lite) com parâmetros e limiar de maestria |
| 06 | [Numeración temprana (3-7 años)](2026-07-31-mc-06-early-numeracy-kinder.md) | ⭐ A trajetória de aprendizado exata do nível kinder, em ordem |
| 07 | [Fracciones, decimales y razón (8-14)](2026-07-31-mc-07-fractions-rational-numbers.md) | ⭐ Tabela de 13 erros com nome → resposta equivocada que produzem → o que Larry deve dizer |
| 08 | [Álgebra y sus errores (12-17)](2026-07-31-mc-08-algebra-misconceptions.md) | ⭐ Tabela de 9 “regras mal aprendidas” → como repará‑las |
| 09 | [Geometría y razonamiento espacial](2026-07-31-mc-09-geometry-spatial-reasoning.md) | Quais tipos de item geométrico são qualificáveis automaticamente em uma PWA |
| 10 | [Ansiedad matemática, mentalidad y cronómetro](2026-07-31-mc-10-math-anxiety-mindset-timing.md) | ⭐⭐ **Ler antes de decidir o cronômetro.** Onde a evidência contradiz o briefing |
| 11 | [Retroalimentación y evaluación formativa](2026-07-31-mc-11-feedback-formative-assessment.md) | ⭐ Modelos de feedback por faixa etária; que feedback piora o desempenho |
| 12 | [Demostración, olimpiada y nivel PhD](2026-07-31-mc-12-advanced-proof-olympiad-phd.md) | ⭐ 14 faixas acima do ensino médio com seu mecanismo real de avaliação |
| 39 | [Kumon, ábaco, védica, rusa, húngara, finlandesa](2026-07-31-mc-39-eastern-drill-mental-math-traditions.md) | Qual tradição tem evidência e qual é marketing; o que roubar de cada uma |
| 35 | [Evidencia de enseñar por internet](2026-07-31-mc-35-online-learning-evidence.md) | ⭐ Proporção fazer/ver, duração do vídeo, e como mediríamos se o app ensina algo |

## Produto, motor e conteúdo

| # | Documento | Para que serve |
|---|-----------|----------------|
| 13 | [Modelo del alumno: BKT, DKT, Elo de Math Garden](2026-07-31-mc-13-its-knowledge-tracing-elo.md) | ⭐⭐ A fórmula que combina precisão **e** tempo em uma única pontuação, já validada. É a resposta ao “pontos por velocidade” |
| 14 | [Khan, Brilliant, Kumon, IXL, Prodigy, ST Math…](2026-07-31-mc-14-competitive-products.md) | ⭐ O que copiar, o que evitar, e onde está a lacuna de mercado |
| 15 | [Escaleras de grado internacionales](2026-07-31-mc-15-international-grade-ladders.md) | ⭐ Proposta de escada interna de 11 faixas, neutra ao país, com nomes em 5 idiomas |
| 36 | [Diseño de retos y formatos de reactivo](2026-07-31-mc-36-problem-design-item-formats.md) | ⭐ Catálogo de 20 formatos com “resiste um solver?” e ordem de construção do MVP |
| 40 | [Banco de 2,500 reactivos: cómo se opera](2026-07-31-mc-40-item-bank-content-operations.md) | ⭐⭐ O plano concreto dos 2.500: modelos vs. manual vs. LLM, esquema, esforço e custo |
| 44 | [Ubicación adaptativa (CAT, IRT, ALEKS)](2026-07-31-mc-44-adaptive-placement-cat.md) | ⭐ O algoritmo de alocação construível na v1 sem banco calibrado |
| 37 | [Larry Profe: portar a Larry](2026-07-31-mc-37-larry-profe-port.md) | ⭐⭐ O que existe hoje no repo (com `archivo:línea`), a tabela de roteamento de modelos e o custo por explicação |

## Gamificação, competição e identidade

| # | Documento | Para que serve |
|---|-----------|----------------|
| 16 | [Gamificación de Duolingo](2026-07-31-mc-16-duolingo-gamification.md) | ⭐ Inventário de mecânicas com evidência e risco com menores; economia de XP proposta |
| 17 | [Gamificación ética y patrones oscuros](2026-07-31-mc-17-ethical-gamification-dark-patterns.md) | ⭐⭐ **A contraparte do “o mais viciante possível”.** Tabela de linhas vermelhas com exposição regulatória |
| 18 | [Tableros y competencia](2026-07-31-mc-18-leaderboards-competition.md) | ⭐ Glicko-2, ligas de 30, e como normalizar pontos entre uma criança somando e um doutorando |
| 19 | [Hábito, rachas y notificaciones push](2026-07-31-mc-19-habit-loops-push-notifications.md) | ⭐ Plano de notificações + a realidade técnica do push no iOS |
| 42 | [Audio, háptica y "juice"](2026-07-31-mc-42-audio-haptics-game-feel.md) | Spec de som por faixa; **iOS Safari não tem Vibration API, em nenhuma versão** |
| 43 | [Avatares, alias e identidad](2026-07-31-mc-43-avatars-identity-progression.md) | Como gerar aliases seguros em 5 idiomas e quais cosméticos não são caixa de loot |

## Interface por faixa etária e dispositivo

| # | Documento | Para que serve |
|---|-----------|----------------|
| 20 | [3-6 años · KINDER](2026-07-31-mc-20-ui-ages-3-6-kinder.md) | ⭐ Brancos táteis de ~88px com sua fonte; por que arrastar é um erro nessa idade |
| 21 | [7-11 años · PRIMARIA](2026-07-31-mc-21-ui-ages-7-11-primary.md) | O ponto médio: já não infantil, ainda não adolescente |
| 22 | [12-17 años · SECUNDARIA](2026-07-31-mc-22-ui-teens-12-17.md) | ⭐ O que faz com que um app **não** pareça um app de crianças; modo escuro por padrão |
| 23 | [Adulto / universidad / experto](2026-07-31-mc-23-ui-adult-expert.md) | ⭐ KaTeX vs MathJax vs MathLive com licenças e acessibilidade; entrada de matemática por dispositivo |
| 38 | [Accesibilidad y diferencias de aprendizaje](2026-07-31-mc-38-accessibility-learning-differences.md) | ⭐ Como um jogo cronometrado pode cumprir WCAG 2.2 (a exceção textual); modo discalcúlia |
| 34 | [i18n de la notación matemática](2026-07-31-mc-34-i18n-math-notation.md) | ⭐⭐ México usa **ponto** decimal e o resto do mundo hispano **vírgula**; a divisão longa é desenhada de 4 formas distintas |

## Plataforma, segurança e negócios

| # | Documento | Para que serve |
|---|-----------|----------------|
| 32 | [Arquitetura Cloudflare](2026-07-31-mc-32-cloudflare-architecture.md) | ⭐⭐ **Inventário completo de objetos `math-challenge-*`** com nome, tipo, propósito EN/ES e binding |
| 33 | [Realidade da PWA em 2026](2026-07-31-mc-33-pwa-first-reality.md) | ⭐ Matriz de capacidades iOS/Android/desktop; push no iOS exige instalação na tela inicial |
| 25 | [Lei de privacidade infantil](2026-07-31-mc-25-child-privacy-law.md) | ⭐⭐ COPPA 2025, GDPR art. 8, Children's Code, LGPD art. 14, LFPDPPP após o desaparecimento do INAI |
| 26 | [Tempo de tela saudável](2026-07-31-mc-26-screen-time-healthy-defaults.md) | ⭐ Tabela de limites por idade — padrão, mínimo e máximo que um pai pode definir |
| 27 | [Contas familiares e consentimento](2026-07-31-mc-27-family-accounts-parental-consent.md) | ⭐ Modelo de entidades; como entra uma criança de 5 anos em menos de 5 segundos sem ler |
| 28 | [Modo mestre / sala](2026-07-31-mc-28-teacher-classroom-mode.md) | ⭐⭐ **A lacuna legal:** um professor sem escola por trás não pode invocar a exceção escolar |
| 29 | [Integridade e anti-trapaça](2026-07-31-mc-29-assessment-integrity-anticheat.md) | ⭐ Escada progressiva de 6 níveis e a lista do que jamais se faz a uma criança |
| 30 | [Telemetria comportamental](2026-07-31-mc-30-behavioral-telemetry-process-data.md) | ⭐⭐ Corrigir uma resposta **melhora** a classificação em 79 % dos casos: penalizar a exclusão é um erro |
| 31 | [Resistência a solvers de IA](2026-07-31-mc-31-ai-solver-resistance.md) | ⭐ Quais formatos sobrevivem ao Photomath e a um modelo de fronteira, e o que não pode ser impedido |
| 41 | [Monetização e preços](2026-07-31-mc-41-monetization-pricing.md) | Preços reais da concorrência, métodos de pagamento por mercado, IVA e direito de desistimento |
| 45 | [Onboarding, registro e ativação](2026-07-31-mc-45-onboarding-activation.md) | ⭐ Quanto custa cada campo de registro, e por que NN/g desaconselha o carrossel de boas‑vindas **por nome** |
| 46 | [Clubs, desafios de grupo e prêmios](2026-07-31-mc-46-clubs-social-challenges.md) | ⭐⭐ Os três elementos do jogo ilegal e como se elimina um; o *Group Goal* do Strava; como ter apostas sem perdedor |
| 47 | [Stack, protocolos e desempenho real](2026-07-31-mc-47-stack-protocols-performance.md) | ⭐⭐ **Por que gRPC não entra**: Workers não pode fazer gRPC de saída e o navegador não o suporta. HTTP/3 em redes com perda; INP é a que falha |
| 48 | [O site aberto e a estratégia orgânica](2026-07-31-mc-48-public-site-seo.md) | ⭐⭐ A pesquisa original é o ativo que o Google premia desde março de 2026; E-E-A-T, JSON‑LD multilíngue e `hreflang` em sete locais |

---

## Documentos relacionados fora desta pasta

- [`../decisions.md`](../decisions.md) — as 34 decisões do dono (D-001 … D-034), com data, e as duas tensões que permanecem abertas.
- [`../por-que-existe.md`](../por-que-existe.md) — a história do dono, fonte da voz do site público.
- [`../master-plan.md`](../master-plan.md) — o plano integral, em 15 seções.
- [`../infrastructure.md`](../infrastructure.md) — os 27 objetos `math-challenge-*` da Cloudflare.

## Numeração

Os números são identificadores de tema, não uma ordem de leitura. **Não existe um mc-24**: o tema "métodos de entrada matemática por dispositivo" foi fundido no mc-23 durante o design da pesquisa, e o espaço foi deixado de propósito para não renumerar 20 arquivos nem quebrar referências cruzadas já escritas.
