# O sítio aberto: porque publicar a investigação *é* a estratégia orgânica

> Math Challenge research — 2026-07-31 — topic 48

## Resumo executivo (ES)

- **A descoberta que muda o plano:** after the March 2026 update, *"la investigación original y los casos de estudio documentados se han vuelto de los ativos de contenido de mayor valor que una organización puede producir"* [1].
- **E as citações de IA amplificam-no:** um estudo da Wellows sobre 2.400 citações em AI Overviews encontrou que as páginas com sinais fortes de E-E-A-T têm **2,3× mais probabilidade de serem citadas** [1].
- **O custo de não o ter é real:** centenas de sites perderam **40-70 % do seu tráfego orgânico de um dia para o outro** em atualizações recentes do algoritmo; os que sobreviveram e cresceram tinham investido profundamente em E-E-A-T [1].
- **E-E-A-T são quatro coisas distintas** — Experience (participação de primeira mão), Expertise (conhecimento e credenciais), Authoritativeness (reconhecimento e reputação) e Trustworthiness (exactidão, transparência e experiência de uso) [1][2]. A primeira **E** foi adicionada em dezembro de 2022 [2].
- Math Challenge tem 152.000 palavras de investigação original **com fontes citadas, com limitações declaradas e com afirmações marcadas `[unverified]`** — isso cobre Expertise e Trustworthiness de uma forma que quase ninguém em edtech cobre.
- **O que não pode ser comprado nem investigado é a Experience**: a história de primeira mão de por que o projeto existe. Essa só a fornece o proprietário (ver [`por-que-existe.md`](../por-que-existe.md)).
- **JSON-LD é o formato preferido do Google**, e o conteúdo da estrutura **deve ser traduzido por versão de idioma** mantendo o esquema intacto; cada versão localizada declara o seu `inLanguage` [3][4][5].
- **O esquema não substitui `hreflang`**, complementa‑o: `hreflang` indica as variantes de idioma e região, o esquema reforça essa intenção de forma legível por máquina [3][4].
- **Regra rígida:** o conteúdo do esquema **deve coincidir com o que está visível na página**; se diferir, o Google pode ignorar a marcação por completo [5].
- Implicação central: o site não é marketing com investigação adjacente. **A investigação é o site**, e a acessibilidade WCAG 2.2 AA (`mc-38`) não é apenas uma obrigação legal na UE desde junho de 2025, mas sim um sinal direto de Trustworthiness.

## Resumo executivo (EN)

- **A descoberta que altera o plano:** after the March 2026 update, *"original research and documented case studies have become some of the highest-value content assets an organization can produce"* [1].
- **As citações de IA amplificam-no:** um estudo da Wellows sobre 2.400 citações em AI Overviews encontrou que as páginas com fortes sinais de E-E-A-T têm **2,3× mais probabilidade de serem citadas** [1].
- **O custo de não o ter é real:** centenas de sites perderam **40-70 % do tráfego orgânico da noite para o dia** em recentes atualizações principais; os que sobreviveram e cresceram tinham investido profundamente em E-E-A-T [1].
- **E-E-A-T são quatro coisas distintas** — Experience (envolvimento de primeira mão), Expertise, Authoritativeness, Trustworthiness [1][2]. A primeira **E** foi adicionada em dezembro de 2022 [2].
- Math Challenge tem 152.000 palavras de investigação original **com fontes citadas, limitações declaradas e marcadores `[unverified]`** — cobrindo Expertise e Trustworthiness de uma forma que quase ninguém em edtech faz.
- **O que não pode ser comprado ou investigado é a Experience**: a história de primeira mão de por que o projeto existe.
- **JSON-LD é o formato preferido do Google**, o conteúdo de dados estruturados **deve ser traduzido por versão de idioma** com o esquema intacto, e cada versão localizada declara `inLanguage` [3][4][5].
- **O esquema não substitui `hreflang`** — complementa‑o [3][4]. **Regra rígida:** o conteúdo do esquema **deve corresponder ao que está visível na página**, caso contrário o Google pode ignorar a marcação totalmente [5].
- Implicação principal: a investigação *é* o site, e a acessibilidade WCAG 2.2 AA é um sinal de Trustworthiness, não apenas uma obrigação legal da UE.

## Constatações

### 1. Por que 152.000 palavras de investigação são o ativo, não o anexo

A mudança de base após março de 2026 é que o Google deixou de premiar o conteúdo que *parece* autoritário e passou a premiar o que **é de forma demonstrável**. A formulação exata da fonte: a investigação original e os casos de estudo documentados *"tornaram‑se nos ativos de conteúdo de maior valor que uma organização pode produzir"* [1].

O segundo efeito é o que importa mais a médio prazo. Com as Visões de IA a mediar cada vez mais consultas, ser **citado** vale mais do que posicionar: o estudo de Wellows sobre 2.400 citações encontrou que as páginas com sinais fortes de E‑E‑A‑T têm **2,3× mais probabilidade de serem citadas** [1]. Uma investigação com fontes numeradas e verificáveis é exatamente o tipo de página que um sistema de recuperação prefere citar.

E o risco de não o fazer está medido: centenas de sites perderam **40‑70 % do seu tráfego orgânico de um dia para o outro** em atualizações recentes, e os que cresceram investiram intensamente em E‑E‑A‑T [1].

**Onde está o Math Challenge.** As 45 investigações têm fontes numeradas, declaram as suas limitações metodológicas, marcam `[unverified]` o que não puderam confirmar contra a fonte primária, e —isto é o incomum— **incluem os trechos onde a evidência contradiz o próprio produto**: `mc-10` desmonta a citação mais famosa sobre exames cronometrados, `mc-17` documenta a exposição regulatória da mecânica que o briefing original pedia, `mc-14` assinala que o tutor da Khan Academy não superou um motor de busca num estudo controlado.

Publicar isso não é humildade: é a definição operativa de Confiabilidade. E praticamente nenhum concorrente o faz — `mc-14` documenta que a Brilliant, a Matific e a Mathletics carecem de evidência independente publicada, e que a Kumon não tem sequer um estudo que cumpra os padrões do What Works Clearinghouse.

### 2. As quatro letras, e qual falta

E‑E‑A‑T des‑compõe‑se em quatro sinais distintos, e convém mapeá‑los porque o site precisa cobrir os quatro por vias diferentes [1][2]:

| Sinal | Que pergunta | Com que cobre este site |
|---|---|---|
| **Experience** | O autor tem participação de primeira mão? | A história do proprietário: por que começou, a sua própria relação com as matemáticas, o seu próprio uso do produto. **Só ele a fornece.** |
| **Expertise** | Há conhecimento e competência demonstrada? | 45 investigações, 152.000 palavras, com fontes primárias citadas |
| **Authoritativeness** | Há reconhecimento e reputação? | Ignia como apoio institucional; citações entrantes que a investigação publicada atraia ao longo do tempo |
| **Trustworthiness** | Há exatidão, transparência e boa experiência de utilização? | Limitações declaradas, `[unverified]` visíveis, contradições publicadas, e acessibilidade WCAG 2.2 AA |

A **Experience** é a única que não se pode produzir com mais trabalho de investigação, e foi adicionada em dezembro de 2022 precisamente para distinguir quem viveu o problema daquele que apenas o estudou [2]. Por isso a entrevista ao proprietário não é conteúdo de preenchimento para a página "sobre": é o sinal que o resto do site não pode gerar.

### 3. Dados estruturados em sete locais

**JSON‑LD é o formato preferido do Google** [3][5]. As regras que regem o seu uso multilingue:

- **O conteúdo dentro do JSON‑LD é traduzido por versão de idioma, mantendo a estrutura intacta** — os dados estruturados devem refletir cada versão localizada de forma independente [3][4].
- **Cada versão declara o seu idioma** com a propriedade `inLanguage`; para nomes de organização convém incluir `alternateName` em diferentes idiomas [3][4].
- **Os tipos de esquema devem permanecer consistentes entre idiomas** — não se usa `Course` em espanhol e `Article` em alemão para a mesma página [5].
- **O esquema não substitui o `hreflang`.** As etiquetas `hreflang` são as que indicam variantes de idioma e região aos motores de busca; o esquema reforça essa intenção de forma legível por máquina [3][4].
- **Regra que invalida tudo o resto se for violada:** o conteúdo do esquema **deve coincidir com o que está visível na página**. Se a marcação contiver algo diferente do que se mostra, o Google pode ignorá‑lo completamente [5].

Os tipos que correspondem a este site: `Organization` (Ignia como editor), `WebSite`, `Course` para as faixas de nível, `FAQPage` para as perguntas dos pais, `BreadcrumbList` para a navegação, e para cada uma das 45 investigações um tipo de artigo académico com as suas fontes citadas — que é precisamente o formato que um sistema de citações prefere consumir.

### 4. Sete locais, não cinco idiomas

O site herda a realidade de `mc-34`: `en`, `es-MX`, `es-ES`, `fr-FR`, `pt-BR`, `pt-PT`, `de-DE`. Para SEO isso significa sete versões com `hreflang` recíproco — cada página apontando para todas as outras e para si própria — mais `x-default`.

A armadilha específica deste produto: **`es-MX` e `es-ES` não são a mesma página traduzida**, porque a notação matemática difere (ponto contra vírgula decimal, formato de divisão longa). Publicar uma única versão "es" e declarar dois `hreflang` seria tecnicamente válido e **factualmente incorreto** no conteúdo matemático, que é precisamente o conteúdo que o site pretende que seja citado.

### 5. Acessibilidade como sinal, não apenas como obrigação

`mc-38` já estabelece o requisito legal: a Lei Europeia de Acessibilidade aplica‑se desde 28 de junho de 2025 e inclui explicitamente o comércio eletrónico, com EN 301 549 (que incorpora WCAG 2.1 completo) como referência técnica. O objetivo interno é WCAG 2.2 AA, superconjunto estrito.

O que este documento acrescenta: a Confiabilidade do E‑E‑A‑T avalia também **a experiência de utilização** [1][2]. Um site inacessível não só viola a UE — falha uma das quatro sinais que determinam se o conteúdo se posiciona e é citado. É o caso raro em que o cumprimento legal e a estratégia orgânica apontam exatamente para o mesmo trabalho.

### 6. A atribuição da Ignia, e por que a precisão aqui é estratégica

Ignia Cloud é um fornecedor de cloud com sede na Cidade do México e operação nos Estados Unidos, que se descreve com o lema *"Trust, Integrity and Availability in one place"*, oferece infraestrutura, segurança de dados, gestão de dados a grande escala e computação de alto desempenho, e declara 99,99 % de SLA com parcerias com Microsoft, Dell Technologies, Cisco Systems, OpenStack, Canonical e Acronis [6].

**Math Challenge funciona sobre a Cloudflare** (`mc-32`). Afirmar que a pilha é provida pela Ignia seria refutável com uma consulta DNS, e o público‑alvo da página de arquitetura é exatamente o que a faria.

A formulação exata e verificável tem duas partes: **Ignia faz e patrocina o projeto** — o que é verdade, e inclui que o Larry é o seu personagem preexistente (`mc-37`, D-004) — **e a Cloudflare é a infraestrutura**. Ambas as afirmações resistem ao escrutínio, e, por sinal, a página de arquitetura torna‑se conteúdo técnico citável por si próprio, o que gera mais tráfego orgânico e não menos.

Isto liga‑se à Confiabilidade de forma direta: um site que publica os seus `[unverified]` e depois exagera sobre a sua própria infraestrutura contradiz‑se no seu sinal mais valioso.

## Implicações de design

1. **Publicar as 45 investigações completas** como páginas próprias e indexáveis, com fontes, limitações e `[unverified]` visíveis — é o ativo que a atualização de março de 2026 premia (§1).
2. **Publicar também o que contradiz o produto.** É a parte que nenhum concorrente faz e que sustenta o sinal de Trustworthiness (§1, §2).
3. **A história do proprietário é conteúdo de primeiro nível, não uma página “sobre”.** É a única fonte de Experience do site (§2).
4. **JSON-LD com `inLanguage` por versão**, estrutura idêntica entre locais e conteúdo traduzido dentro (§3).
5. **`hreflang` recíproco entre os sete locais mais `x-default`**, complementado —não substituído— pelo esquema (§3, §4).
6. **`es-MX` e `es-ES` são duas páginas distintas onde haja notação matemática**, não uma com duas etiquetas (§4).
7. **Auditor determinista que valide o JSON-LD e a reciprocidade de `hreflang`** em cada commit, e outro que verifique que o esquema coincide com o visível (§3) — a regra cujo incumprimento invalida todo o marcado.
8. **WCAG 2.2 AA como requisito de publicação do site**, não só da app (§5).
9. **Atribuição de duas partes: projeto da Ignia, infraestrutura da Cloudflare** (§6).
10. **A página de arquitetura é conteúdo, não um rodapé.** Explicar por que RPC nativo em vez de gRPC, por que HTTP/3, por que as tentativas não vão a D1 — é material técnico citável (`mc-47`).
11. **Um auditor de locale por idioma revê também o site**, não só a app: a notação matemática mal localizada numa página pública é um erro citável por terceiros.
12. **Não reclamar resultados de aprendizagem** até ter o estudo próprio; o plano mestre §14 já o proíbe, e num site que presume rigor, uma única afirmação não sustentada custa mais do que num que não o presume.

## Questões abertas para o proprietário do projeto

1. As 45 investigações são publicadas nos sete locais ou apenas em `en` e `es-MX`? Traduzir 152.000 palavras × 6 é um custo real; publicá‑las apenas em dois e declarar `hreflang` correto é defensável.
2. O site está em `math.kilowatto.com` junto com a app, ou num domínio próprio? Afeta a autoridade de domínio e a separação entre o público e o autenticado.
3. Quem assina as investigações como autor? A Authoritativeness melhora com autoria atribuída e verificável, e hoje os documentos não têm assinatura.
4. Publica‑se também `decisions.md` — incluídas as decisões que foram revertidas, como D-001 e D-010? É o nível máximo de transparência e também o mais exposto.
5. Existe apetite por procurar citações entrantes ativamente (investigadores, imprensa educativa, comunidade edtech), ou a estratégia é puramente orgânica passiva?

## Fontes

1. Digital Applied, “E-E-A-T in March 2026: Google Rewards Experience Content” — https://www.digitalapplied.com/blog/e-e-a-t-march-2026-google-rewards-experience-content-guide — fonte da descoberta sobre investigação original como ativo de maior valor, do estudo Wellows de 2.400 citações (2,3×), e da perda de 40‑70 % de tráfego.
2. Keywords Everywhere, “Google E-E-A-T Guidelines: an Overview (2026 Playbook)” — https://keywordseverywhere.com/blog/google-e-e-a-t-guidelines-an-overview/ — fonte da definição das quatro sinais e da data de adição de Experience.
3. Better i18n, “Multilingual Schema Markup: Structured Data for International SEO” — https://better-i18n.com/en/blog/multilingual-schema-markup/
4. Linguise, “Using schema markup and structured data for multilingual websites SEO” — https://www.linguise.com/blog/guide/using-schema-markup-and-structured-data-for-multilingual-websites-seo/
5. SearchX, “Structured Data For Multilingual SEO: Top 7 Tips” — https://searchxpro.com/structured-data-for-multilingual-seo-top-7-tips/ — fonte da regra de correspondência esquema‑página.
6. Ignia Cloud, site oficial — https://ignia.cloud — fonte da descrição, lema, serviços, SLA e alianças.
7. Investigação interna: `mc-34-i18n-math-notation.md` (os sete locais e por que não são cinco), `mc-38-accessibility-learning-differences.md` (WCAG 2.2 AA e a Lei Europeia de Acessibilidade), `mc-14-competitive-products.md` (a ausência de evidência publicada nos concorrentes), `mc-47-stack-protocols-performance.md` (o conteúdo técnico citável), `mc-32-cloudflare-architecture.md` (o que corre onde, para a atribuição de §6).

**Qualidade das fontes.** Nenhuma fonte deste documento é primária do Google: [1]-[5] são publicações de agências e consultorias de SEO, que têm interesse comercial em que o SEO pareça decisivo. Os números concretos —2,3×, 40‑70 %, o estudo Wellows de 2.400 citações— **devem ser tratados como não verificados contra fonte primária** e confirmados na documentação do Google Search Central antes de serem usados em material público ou para justificar orçamento. A orientação estrutural (JSON‑LD preferido, `inLanguage`, esquema não substitui `hreflang`, o esquema deve coincidir com a página) é consistente entre as cinco fontes e com a documentação pública do Google, e é a parte mais fiável. A fonte [6] é primária da própria Ignia.
