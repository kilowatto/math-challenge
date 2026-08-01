# El sitio abierto: por qué publicar la investigación *es* la estrategia orgánica

> Math Challenge research — 2026-07-31 — topic 48

## Resumen ejecutivo (ES)

- **A descoberta que muda o plano:** após a atualização de março de 2026, *"a pesquisa original e os estudos de caso documentados se tornaram alguns dos ativos de conteúdo de maior valor que uma organização pode produzir"* [1].
- **E as citações de IA amplificam isso:** um estudo da Wellows sobre 2.400 citações em AI Overviews encontrou que páginas com sinais fortes de E-E-A-T têm **2,3× mais probabilidade de serem citadas** [1].
- **O custo de não tê-lo é real:** centenas de sites perderam **40-70% do seu tráfego orgânico de um dia para o outro** em atualizações recentes do algoritmo; os que sobreviveram e cresceram haviam investido profundamente em E-E-A-T [1].
- **E-E-A-T são quatro coisas distintas** — Experience (participação de primeira mão), Expertise (conhecimento e credenciais), Authoritativeness (reconhecimento e reputação) e Trustworthiness (exatidão, transparência e experiência de uso) [1][2]. A primeira **E** foi adicionada em dezembro de 2022 [2].
- Math Challenge tem 152.000 palavras de pesquisa original **com fontes citadas, com limitações declaradas e com afirmações marcadas `[unverified]`** — isso cobre Expertise e Trustworthiness de uma forma que quase ninguém em edtech cobre.
- **O que não pode ser comprado nem pesquisado é a Experience**: a história de primeira mão de por que o projeto existe. Isso só o fornece o proprietário (ver [`por-que-existe.md`](../por-que-existe.md)).
- **JSON-LD é o formato preferido do Google**, e o conteúdo da estrutura **deve ser traduzido por versão de idioma** mantendo o esquema intacto; cada versão localizada declara seu `inLanguage` [3][4][5].
- **O esquema não substitui `hreflang`**, ele o complementa: `hreflang` indica as variantes de idioma e região, o esquema reforça essa intenção de forma legível por máquina [3][4].
- **Regra rígida:** o conteúdo do esquema **deve coincidir com o que está visível na página**; se diferir, o Google pode ignorar a marcação completamente [5].
- Implicação central: o site não é marketing com pesquisa anexada. **A pesquisa é o site**, e a acessibilidade WCAG 2.2 AA (`mc-38`) não é apenas obrigação legal na UE desde junho de 2025, mas sinal direto de Trustworthiness.

## Executive summary (EN)

- **A descoberta que muda o plano:** após a atualização de março de 2026, *"pesquisa original e estudos de caso documentados se tornaram alguns dos ativos de conteúdo de maior valor que uma organização pode produzir"* [1].
- **Citações de IA amplificam isso:** um estudo da Wellows de 2.400 citações em AI Overview encontrou que páginas com sinais fortes de E-E-A-T têm **2,3× mais probabilidade de serem citadas** [1].
- **O custo de não tê-lo é real:** centenas de sites perderam **40-70% do tráfego orgânico da noite para o dia** em atualizações recentes do algoritmo; os que sobreviveram e cresceram investiram profundamente em E-E-A-T [1].
- **E-E-A-T são quatro coisas distintas** — Experience (envolvimento de primeira mão), Expertise, Authoritativeness, Trustworthiness [1][2]. A primeira **E** foi adicionada em dezembro de 2022 [2].
- Math Challenge tem 152.000 palavras de pesquisa original **com fontes citadas, limitações declaradas e marcadores `[unverified]`** — cobrindo Expertise e Trustworthiness de uma forma que quase ninguém em edtech faz.
- **O que não pode ser comprado ou pesquisado é a Experience**: a história de primeira mão de por que o projeto existe.
- **JSON-LD é o formato preferido do Google**, o conteúdo de dados estruturados **deve ser traduzido por versão de idioma** com o esquema intacto, e cada versão localizada declara `inLanguage` [3][4][5].
- **Esquema não substitui `hreflang`** — ele o complementa [3][4]. **Regra rígida:** o conteúdo do esquema **deve corresponder ao que está visível na página**, ou o Google pode ignorar totalmente a marcação [5].
- Implicação central: a pesquisa *é* o site, e a acessibilidade WCAG 2.2 AA é um sinal de Trustworthiness, não apenas uma obrigação legal da UE.

## Findings

### 1. Por que 152.000 palavras de pesquisa são o ativo, não o anexo

A mudança de base após março de 2026 é que o Google deixou de premiar o conteúdo que *parece* autoritário e passou a premiar o que **é autoritário de forma demonstrável**. A formulação exata da fonte: a pesquisa original e os casos de estudo documentados *"tornaram‑se os ativos de conteúdo de maior valor que uma organização pode produzir"* [1].

O segundo efeito é o que importa mais a médio prazo. Com AI Overviews mediando cada vez mais consultas, ser **citado** vale mais que posicionar: o estudo de Wellows sobre 2.400 citações encontrou que as páginas com sinais fortes de E‑E‑A‑T têm **2,3× mais probabilidade de ser citadas** [1]. Uma pesquisa com fontes numeradas e verificáveis é exatamente o tipo de página que um sistema de recuperação prefere citar.

E o risco de não fazê‑lo está medido: centenas de sites perderam **40‑70 % de seu tráfego orgânico de um dia para o outro** em atualizações recentes, e os que cresceram haviam investido a fundo em E‑E‑A‑T [1].

**Onde está o Math Challenge.** As 45 investigações têm fontes numeradas, declaram suas limitações de método, marcam `[unverified]` o que não puderam confirmar contra a fonte primária, e — isso é o incomum — **incluem os trechos onde a evidência contradiz o próprio produto**: `mc-10` desmonta a citação mais famosa sobre exames cronometrados, `mc-17` documenta a exposição regulatória da mecânica que o briefing original pedia, `mc-14` aponta que o tutor da Khan Academy não superou um buscador em um estudo controlado.

Publicar isso não é humildade: é a definição operativa de Trustworthiness. E praticamente nenhum concorrente o faz — `mc-14` documenta que Brilliant, Matific e Mathletics carecem de evidência independente publicada, e que Kumon não tem nem um estudo que cumpra os padrões do What Works Clearinghouse.

### 2. As quatro letras, e qual falta

E‑E‑A‑T se desdobra em quatro sinais distintos, e convém mapeá‑los porque o site precisa cobrir os quatro por vias diferentes [1][2]:

| Sinal | O que pergunta | Como o site cobre |
|---|---|---|
| **Experience** | O autor tem participação de primeira mão? | A história do dono: por que começou, sua própria relação com a matemática, seu próprio uso do produto. **Só ele a fornece.** |
| **Expertise** | Há conhecimento e competência demonstrada? | 45 investigações, 152.000 palavras, com fontes primárias citadas |
| **Authoritativeness** | Há reconhecimento e reputação? | Ignia como respaldo institucional; citações entrantes que a pesquisa publicada atrai com o tempo |
| **Trustworthiness** | Há exatidão, transparência e boa experiência de uso? | Limitações declaradas, `[unverified]` visíveis, contradições publicadas e acessibilidade WCAG 2.2 AA |

A **Experience** é a única que não pode ser produzida com mais trabalho de pesquisa, e foi adicionada em dezembro de 2022 precisamente para distinguir quem viveu o problema de quem apenas o estudou [2]. Por isso a entrevista com o dono não é conteúdo de preenchimento para a página “sobre”: é o sinal que o resto do site não pode gerar.

### 3. Dados estruturados em sete locais

**JSON‑LD é o formato preferido do Google** [3][5]. As regras que regem seu uso multilíngue:

- **O conteúdo dentro do JSON‑LD é traduzido por versão de idioma, mantendo a estrutura intacta** — os dados estruturados devem refletir cada versão localizada de forma independente [3][4].
- **Cada versão declara seu idioma** com a propriedade `inLanguage`; para nomes de organização convém incluir `alternateName` em diferentes idiomas [3][4].
- **Os tipos de esquema devem permanecer consistentes entre idiomas** — não se usa `Course` em espanhol e `Article` em alemão para a mesma página [5].
- **O esquema não substitui `hreflang`.** As etiquetas `hreflang` são as que indicam variantes de idioma e região aos buscadores; o esquema reforça essa intenção em forma legível por máquina [3][4].
- **Regra que invalida todo o resto se for violada:** o conteúdo do esquema **deve coincidir com o que está visível na página**. Se a marcação contiver algo diferente do que é exibido, o Google pode ignorá‑la completamente [5].

Os tipos que correspondem a este site: `Organization` (Ignia como editora), `WebSite`, `Course` para as faixas de nível, `FAQPage` para as perguntas de pais, `BreadcrumbList` para a navegação, e para cada uma das 45 investigações um tipo de artigo acadêmico com suas fontes citadas — que é justamente o formato que um sistema de citações prefere consumir.

### 4. Sete locais, não cinco idiomas

O site herda a realidade de `mc-34`: `en`, `es-MX`, `es-ES`, `fr-FR`, `pt-BR`, `pt-PT`, `de-DE`. Para SEO isso significa sete versões com `hreflang` recíproco — cada página apontando a todas as demais e a si mesma — mais `x-default`.

A armadilha específica deste produto: **`es-MX` e `es-ES` não são a mesma página traduzida**, porque a notação matemática difere (ponto contra vírgula decimal, formato de divisão longa). Publicar uma única versão “es” e declarar dois `hreflang` seria tecnicamente válido e **factualmente incorreto** no conteúdo matemático, que é exatamente o conteúdo que o site quer que seja citado.

### 5. Acessibilidade como sinal, não apenas como obrigação

`mc-38` já estabelece o requisito legal: a Lei Europeia de Acessibilidade aplica‑se desde 28 de junho de 2025 e inclui explicitamente o comércio eletrônico, com EN 301 549 (que incorpora WCAG 2.1 completo) como referência técnica. O objetivo interno é WCAG 2.2 AA, superconjunto estrito.

O que este documento acrescenta: a Trustworthiness do E‑E‑A‑T avalia também **a experiência de uso** [1][2]. Um site inacessível não só viola a UE — falha uma das quatro sinais que determinam se o conteúdo se posiciona e é citado. É o caso raro onde conformidade legal e estratégia orgânica apontam exatamente ao mesmo trabalho.

### 6. A atribuição da Ignia, e por que a precisão aqui é estratégica

Ignia Cloud é um provedor de nuvem com sede na Cidade do México e operação nos Estados Unidos, que se descreve com o lema *"Trust, Integrity and Availability in one place"*, oferece infraestrutura, segurança de dados, gerenciamento de dados em grande escala e computação de alto desempenho, e declara 99,99 % de SLA com alianças com Microsoft, Dell Technologies, Cisco Systems, OpenStack, Canonical e Acronis [6].

**Math Challenge roda sobre Cloudflare** (`mc-32`). Afirmar que o stack é provido pela Ignia seria refutável com uma consulta DNS, e o público‑alvo da página de arquitetura é exatamente quem a faria.

A formulação exata e verificável tem duas partes: **Ignia faz e patrocina o projeto** — o que é verdade, e inclui que Larry é seu personagem preexistente (`mc-37`, D-004) — **e Cloudflare é a infraestrutura**. Ambas as afirmações resistem ao escrutínio, e de passo a página de arquitetura se torna conteúdo técnico citável por si só, que gera mais tráfego orgânico e não menos.

Isso conecta-se à Trustworthiness de forma direta: um site que publica seus `[unverified]` e depois exagera sobre sua própria infraestrutura se contradiz em seu sinal mais valioso.

## Implicações de design

1. **Publicar as 45 investigações completas** como páginas próprias e indexáveis, com fontes, limitações e `[unverified]` visíveis — é o ativo que a atualização de março de 2026 premia (§1).  
2. **Publicar também o que contradiz o produto.** É a parte que nenhum concorrente faz e a que sustenta o sinal de Trustworthiness (§1, §2).  
3. **A história do dono é conteúdo de primeiro nível, não uma página "sobre".** É a única fonte de Experience do site (§2).  
4. **JSON-LD com `inLanguage` por versão**, estrutura idêntica entre locais e conteúdo traduzido dentro (§3).  
5. **`hreflang` recíproco entre os sete locais mais `x-default`**, complementado —não substituído— pelo esquema (§3, §4).  
6. **`es-MX` e `es-ES` são duas páginas distintas onde houver notação matemática**, não uma com duas etiquetas (§4).  
7. **Auditor determinista que valide o JSON-LD e a reciprocidade de `hreflang`** em cada commit, e outro que verifique que o esquema coincide com o visível (§3) — a regra cujo descumprimento invalida todo o marcado.  
8. **WCAG 2.2 AA como requisito de publicação do site**, não apenas do app (§5).  
9. **Atribuição de duas partes: projeto da Ignia, infraestrutura da Cloudflare** (§6).  
10. **A página de arquitetura é conteúdo, não um rodapé.** Explicar por que RPC nativo em vez de gRPC, por que HTTP/3, por que as tentativas não vão a D1 — é material técnico citável (`mc-47`).  
11. **Um auditor de locale por idioma revisa também o site**, não apenas o app: a notação matemática mal localizada em uma página pública é um erro citável por terceiros.  
12. **Não reivindicar resultados de aprendizagem** até ter o estudo próprio; o plano mestre §14 já o proíbe, e em um site que presume rigor, uma única afirmação não sustentada custa mais que em um que não o presume.  

## Perguntas abertas para o proprietário do projeto

1. As 45 investigações são publicadas nos sete locais ou apenas em `en` e `es-MX`? Traduzir 152.000 palavras × 6 é um custo real; publicá‑las apenas em dois e declarar `hreflang` correto é defensável.  
2. O site vive em `math.kilowatto.com` junto à app, ou em um domínio próprio? Afeta autoridade de domínio e a separação entre o público e o autenticado.  
3. Quem assina as investigações como autor? A Authoritativeness melhora com autoria atribuída e verificável, e hoje os documentos não têm assinatura.  
4. Publica‑se também `decisions.md` — incluídas as decisões que foram revertidas, como D-001 e D-010? É o nível máximo de transparência e também o mais exposto.  
5. Há apetite por buscar citações entrantes ativamente (pesquisadores, imprensa educativa, comunidade edtech), ou a estratégia é puramente orgânica passiva?  

## Fontes

1. Digital Applied, "E-E-A-T in March 2026: Google Rewards Experience Content" — https://www.digitalapplied.com/blog/e-e-a-t-march-2026-google-rewards-experience-content-guide — fonte da descoberta sobre pesquisa original como ativo de maior valor, do estudo Wellows de 2.400 citações (2,3×), e da perda de 40-70% de tráfego.  
2. Keywords Everywhere, "Google E-E-A-T Guidelines: an Overview (2026 Playbook)" — https://keywordseverywhere.com/blog/google-e-e-a-t-guidelines-an-overview/ — fonte da definição das quatro sinais e da data de adição de Experience.  
3. Better i18n, "Multilingual Schema Markup: Structured Data for International SEO" — https://better-i18n.com/en/blog/multilingual-schema-markup/  
4. Linguise, "Using schema markup and structured data for multilingual websites SEO" — https://www.linguise.com/blog/guide/using-schema-markup-and-structured-data-for-multilingual-websites-seo/  
5. SearchX, "Structured Data For Multilingual SEO: Top 7 Tips" — https://searchxpro.com/structured-data-for-multilingual-seo-top-7-tips/ — fonte da regra de correspondência esquema‑página.  
6. Ignia Cloud, site oficial — https://ignia.cloud — fonte da descrição, lema, serviços, SLA e alianças.  
7. Pesquisa interna: `mc-34-i18n-math-notation.md` (os sete locais e por que não são cinco), `mc-38-accessibility-learning-differences.md` (WCAG 2.2 AA e a Lei Europeia de Acessibilidade), `mc-14-competitive-products.md` (a ausência de evidência publicada nos concorrentes), `mc-47-stack-protocols-performance.md` (o conteúdo técnico citável), `mc-32-cloudflare-architecture.md` (o que roda onde, para a atribuição de §6).  

**Qualidade das fontes.** Nenhuma fonte deste documento é primária do Google: [1]-[5] são publicações de agências e consultorias de SEO, que têm interesse comercial em que o SEO pareça decisivo. Os números concretos —2,3×, 40-70%, o estudo Wellows de 2.400 citações— **devem ser tratados como não verificados contra fonte primária** e confirmados na documentação do Google Search Central antes de serem usados em material público ou para justificar orçamento. A orientação estrutural (JSON-LD preferido, `inLanguage`, esquema não substitui `hreflang`, o esquema deve coincidir com a página) é consistente entre as cinco fontes e com a documentação pública do Google, e é a parte mais confiável. A fonte [6] é primária da própria Ignia.
