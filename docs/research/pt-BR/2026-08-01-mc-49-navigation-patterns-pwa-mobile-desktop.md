# Padrões de navegação para um site PWA-first: app instalado, aba de navegador móvel e desktop

> Pesquisa Math Challenge — 2026-08-01 — tópico 49

## Resumo executivo (PT)

O site hoje pinta **duas barras de navegação completas ao mesmo tempo** no
iOS/Android: `nav.sitio` no topo (seis seções em uma linha que rola na
horizontal, sem pista visual de que se pode rolar) e `.barra-inferior`
embaixo, sem condicionar a se a página roda instalada ou numa aba normal
do navegador. Numa aba do Safari isso produz **três** navegações
empilhadas — as duas próprias mais a barra de endereços do navegador —,
que é a causa raiz de o menu parecer estranho ao iOS em vez de nativo. A
evidência converge em três regras, nenhuma nova para quem projeta software
nativo, mas ausentes até hoje de `docs/decisions.md`: (1) um app **nunca**
combina dois sistemas de navegação primária ao mesmo tempo [3][6][7]; (2)
uma barra inferior tátil se limita a 3-5 destinos, nunca mais — HIG e
Material 3 coincidem no número exato [1][2]; (3) abaixo de 5-6 opções no
celular, um menu hambúrguer vence uma linha que é cortada, em
descobribilidade [4][5][6]. `display-mode: standalone` em CSS —já usado em
`Instalar.astro`— é o sinal correto para distinguir "app instalado" de
"aba de navegador", e permite que cada contexto tenha sua própria
navegação sem que se sobreponham [8][9]. Sobre bibliotecas de "look
nativo" (Framework7, Ionic, Onsen UI): existem e funcionam, mas custam
peso real de JavaScript em cada página do site —não só onde são usadas— e
nenhuma fonte consultada sugere que o resultado seja melhor que CSS bem
feito para o caso concreto de uma barra de abas [10]. No iPad, o Material
3 documenta que a convenção muda de barra inferior para **trilho lateral**
a partir de larguras "medium" (≥600dp) — coincide com a tabela de larguras
de D-041 na linha de tela cheia horizontal [2][11].

## Executive summary (EN)

The site currently paints **two complete navigation bars at once** on
iOS/Android: `nav.sitio` at the top (six sections in a horizontally
scrolling row with no visual affordance that it scrolls) and
`.barra-inferior` at the bottom, unconditioned on whether the page runs
installed or in an ordinary browser tab. In a Safari tab this produces
**three** stacked navigations — the two the site owns plus the browser's own
address bar —, which is the root cause of the menu feeling foreign to iOS
instead of native. The evidence converges on three rules, none new to native
software design but absent from `docs/decisions.md` until now: (1) an app
**never** combines two primary navigation systems at once [3][6][7]; (2) a
touch bottom bar caps at 3-5 destinations, never more — HIG and Material 3
agree on the exact figure [1][2]; (3) below 5-6 options on mobile, a
hamburger menu beats a row that gets cut off, on discoverability [4][5][6].
`display-mode: standalone` in CSS —already used in `Instalar.astro`— is the
correct signal to distinguish "installed app" from "browser tab", letting
each context own its navigation without collision [8][9]. On "native-feel"
libraries (Framework7, Ionic, Onsen UI): they exist and work, but cost real
JavaScript weight on every page of the site —not only where they're used—
and no source consulted suggests the result beats well-made CSS for the
concrete case of a tab bar [10]. On iPad, Material 3 documents the
convention switching from bottom bar to **side rail** at "medium" widths
(≥600dp) — this lines up with D-041's width table at the full-screen
horizontal row [2][11].

---

## Matriz de padrões

| Contexto | Plataforma | Padrão que a evidência respalda | Fonte |
|---|---|---|---|
| App instalado (`display-mode: standalone`) | iOS / Android, largura de telefone | Barra inferior, 3-5 destinos, ícone + texto | [1][2] |
| App instalado, largura de tablet/iPad horizontal completo | iOS (iPad) | Trilho lateral, não barra inferior | [2][11] |
| Aba de navegador normal | iOS / Android | Cabeçalho compacto + menu hambúrguer (não barra de abas de app) | [4][5][6] |
| Qualquer contexto | Windows / macOS / desktop | Barra horizontal no topo — coincide com o modo "top" do Fluent `NavigationView` e com a convenção de apps web do macOS | [12] |
| Qualquer contexto móvel | — | **Nunca** dois sistemas de navegação primária ao mesmo tempo | [3][6][7] |

## Resultados

**1. HIG: 3-5 abas, a quantidade mínima necessária.** A Apple documenta
explicitamente "use three to five tabs in iOS; use a few more in iPadOS and
tvOS if necessary" e adverte que cada aba adicional aumenta a complexidade
de encontrar informação [1].

**2. Material 3: o mesmo intervalo, e o ponto onde muda de padrão.** As
barras de navegação inferior do M3 se limitam a 3-5 destinos e **só se
aplicam a telefones e tablets pequenos**. A partir de janelas "medium"
(600-839dp) o guia manda substituir a barra inferior por um **trilho
lateral** (3-7 destinos); se houver mais de 5, considerar um trilho
expandido/modal em vez de continuar empilhando na barra [2].

**3. Nenhuma PWA bem-sucedida combina as duas.** Várias fontes de padrões
de navegação em PWAs coincidem em que a abordagem vencedora é escolher
**um só** padrão de navegação primária — a alternativa (ex. The Weather
Channel, que usa barra em cima e embaixo ao mesmo tempo) é citada
explicitamente como o antipadrão, não o modelo a seguir [3].

**4. Abaixo de 5-6 opções, o hambúrguer vence no celular.** Nielsen Norman
Group e várias fontes de padrões de UX coincidem: uma linha de abas
horizontal no celular não aguenta mais de 5-6 antes de precisar de
rolagem, e a rolagem horizontal em navegação **é ignorada** salvo que haja
uma pista visual forte de que continua — a linha de hoje (`nav.sitio`) não
a tem, e por isso a sexta seção ("Código aberto") é invisível na prática
[4][5][6].

**5. O trade-off documentado do hambúrguer.** Não é de graça: NN/g
documenta que esconder a navegação reduz sua descobribilidade frente a
tê-la visível. É o motivo pelo qual a recomendação não é "tudo atrás do
hambúrguer", mas manter as ações de conversão (Entrar, Criar conta) sempre
visíveis e só esconder as seis seções de conteúdo [5].

**6. `display-mode: standalone` já é um padrão provado neste repo.**
`Instalar.astro` já usa `@media (display-mode: standalone), (display-mode:
minimal-ui), (display-mode: fullscreen)` para distinguir se a página roda
instalada. É o mesmo sinal — sem JavaScript novo, sem detecção de
plataforma em JS, coerente com a regra já escrita em
`docs/guia-de-estilo.md` — que resolve qual das duas navegações deve
existir a cada momento [8][9].

**7. Windows/Fluent: o modo "top" é válido, não um compromisso.**
`NavigationView` da Microsoft suporta explicitamente um modo de navegação
horizontal no topo ("Top") como alternativa de primeira classe ao trilho
lateral esquerdo, recomendado quando se quer mostrar todas as opções ao
mesmo tempo e há espaço de tela de sobra — que é exatamente o caso de
desktop do Math Challenge hoje [12].

**8. Sobre bibliotecas de "look nativo".** Framework7, Ionic e Onsen UI
existem especificamente para imitar controles nativos de iOS/Android numa
PWA, mas as fontes consultadas descrevem o Framework7 como "relativamente
grande" em tamanho, com o consequente custo em tempo de carregamento, e
nenhuma fonte sugere uma vantagem de resultado visual sobre CSS bem
construído para o caso concreto de uma barra de abas — que é exatamente o
que `plataformas.css` já constrói hoje para raios, elevação e o material
translúcido do iOS [10].

**9. O overlay de tela cheia tem peculiaridades específicas do iOS
Safari.** Uma fonte centrada em cuidar o detalhe da experiência móvel
documenta que os overlays de tela cheia no iOS Safari não fecham com o
gesto de deslizar que funciona no Android, e que há que manejar
`env(safe-area-inset-*)` com cuidado nesse contexto — um menu que se abre
**empurrando o conteúdo** (em vez de um overlay fixo) evita essa categoria
de bug por construção [6].

## Implicações de design

1. **Nunca renderizar `nav.sitio` completo e `.barra-inferior` ao mesmo
   tempo.** O primeiro é o padrão de aba de navegador; o segundo, o de app
   instalado. Distinguem-se com `display-mode: standalone`, sem JS.
2. **A barra inferior instalada se limita a 5 destinos, todos de um
   toque**: os que HIG/M3 permitem como máximo. Nenhum destino fica atrás
   de um segundo nível se o próprio dono do produto pede que esteja a um
   toque — a solução não é violar o limite de 5, é escolher bem quais 5.
3. **O resto das seções (Origem, Arquitetura, Código aberto) vive num
   `<details>/<summary>` nativo**, não numa sexta aba nem numa rolagem
   horizontal. Zero JavaScript, mesmo mecanismo nos dois contextos (app
   instalado e aba de navegador), coerente com "Sem JavaScript: cinco
   links" que `Base.astro` já declara.
4. **Na aba de navegador (não instalada), cabeçalho compacto**: marca +
   Entrar + Criar conta sempre visíveis + botão que abre as seis seções
   **abaixo**, empurrando o conteúdo — nunca um overlay de tela cheia,
   pelo achado #9.
5. **iPad em horizontal completo (1024-1366px, a linha de D-041) usa um
   trilho lateral**, não a barra inferior do iPhone — coincide com onde o
   Material 3 diz que o padrão muda. Abaixo dessa largura (vertical, Split
   View), o iPad se comporta como iPhone, que já é a base de D-041.
6. **Sem biblioteca nova.** HTML semântico + CSS com `data-platform` e
   `display-mode`, exatamente o padrão que o repo já usa — custo zero de
   bundle adicional no resto do site.
7. **Desktop não muda**: a barra horizontal no topo de hoje coincide com o
   modo "Top" do Fluent NavigationView e com a convenção de apps web do
   macOS — não há evidência de que competir por um padrão diferente aí
   compre algo.

## Perguntas para o dono — resolvidas em 2026-08-01

Estas foram resolvidas em rodadas de perguntas de múltipla escolha durante
a mesma sessão desta pesquisa, e ficam documentadas aqui para que a
decisão não fique órfã de seu porquê:

1. **Quando a barra inferior aparece?** → Só instalada
   (`display-mode: standalone`).
2. **O que acontece com o que não cabe em 5 destinos?** →
   `<details>/<summary>` "Mais", salvo Entrar/Criar conta, que o dono
   pediu explicitamente a um toque, sem passar por "Mais".
3. **Biblioteca ou CSS puro?** → CSS puro, sem dependência nova.
4. **iPad largo como iPhone ou trilho próprio?** → Trilho próprio, só em
   horizontal completo (1024-1366px).
5. **Ações visíveis no cabeçalho compacto de aba de navegador?** → Sempre
   visíveis, mesmo critério da barra instalada.
6. **Como o menu de aba de navegador se abre?** → Empurra o conteúdo para
   baixo, não overlay — pelo achado #9 do iOS Safari.

## Fontes

1. Apple Developer, "Tab bars" — Human Interface Guidelines —
   https://developer.apple.com/design/human-interface-guidelines/tab-bars
   (acessado 2026-08-01)
2. Material Design 3, "Navigation bar" and "Navigation rail" guidelines —
   https://m3.material.io/components/navigation-bar/guidelines ·
   https://m3.material.io/components/navigation-rail/guidelines (acessado
   2026-08-01)
3. Phone Simulator, "Mobile Navigation Patterns That Work in 2026" —
   https://phone-simulator.com/blog/mobile-navigation-patterns-in-2026
   (acessado 2026-08-01)
4. Nielsen Norman Group, "Basic Patterns for Mobile Navigation: A Primer" —
   https://www.nngroup.com/articles/mobile-navigation-patterns/ (acessado
   2026-08-01)
5. Onething Design, "Hamburger Menu vs Tab Bar: Which Works Better?" —
   https://www.onething.design/post/hamburger-menu-vs-tab-bar (acessado
   2026-08-01)
6. Gromov, "Full-screen menu quirks for mobile Safari" —
   https://gromov.com/en/full-screen-menu-quirks-mobile-safari (acessado
   2026-08-01)
7. Smashing Magazine, "How To Decide Which PWA Elements Should Stick" —
   https://www.smashingmagazine.com/2020/01/mobile-pwa-sticky-bars-elements/
   (acessado 2026-08-01)
8. web.dev, "How to provide your own in-app install experience" (documents
   `display-mode` media query) —
   https://web.dev/customize-install/ (acessado 2026-08-01)
9. Código interno do Math Challenge, `apps/web/src/components/Instalar.astro` —
   uso já existente de `@media (display-mode: standalone)` neste repo.
10. StackShare, "Framework7 vs Ionic vs Onsen UI" —
    https://stackshare.io/stackups/framework7-vs-ionic-vs-onsen-ui (acessado
    2026-08-01)
11. Decisão interna do Math Challenge, D-041 — tabela de larguras de iPad —
    `docs/decisions.md`
12. Microsoft Learn, "NavigationView" — Windows apps —
    https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/navigationview
    (acessado 2026-08-01)
