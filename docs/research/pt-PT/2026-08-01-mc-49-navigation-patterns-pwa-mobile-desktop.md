# Padrões de navegação para um site PWA-first: aplicação instalada, separador de navegador móvel e computador

> Math Challenge research — 2026-08-01 — topic 49

## Resumo executivo (ES)

O site hoje desenha **duas barras de navegação completas ao mesmo tempo** em
iOS/Android: `nav.sitio` em cima (seis secções numa fila que se desloca na
horizontal, sem pista visual de que se pode deslocar) e `.barra-inferior`
em baixo, sem condicionar a se a página corre instalada ou num separador
normal do navegador. Num separador do Safari isso produz **três**
navegações empilhadas — as duas próprias mais a barra de endereços do
navegador —, que é a causa raiz de o menu parecer estranho ao iOS em vez
de nativo. A evidência converge em três regras, nenhuma nova para quem
desenha software nativo mas ausentes até hoje de `docs/decisions.md`:
(1) uma app **nunca** combina dois sistemas de navegação primária ao mesmo
tempo [3][6][7]; (2) uma barra inferior tátil limita-se a 3-5 destinos,
nunca mais — HIG e Material 3 coincidem no número exato [1][2]; (3) abaixo
de 5-6 opções em telemóvel, um menu hambúrguer ganha em descobribilidade a
uma fila que fica cortada [4][5][6]. `display-mode: standalone` em CSS — já
usado em `Instalar.astro`— é o sinal correto para distinguir "app
instalada" de "separador de navegador", e permite que cada contexto tenha a
sua própria navegação sem que se pisem [8][9]. Sobre bibliotecas de "look
nativo" (Framework7, Ionic, Onsen UI): existem e funcionam, mas custam peso
de JavaScript real em cada página do site — não só onde são usadas— e
nenhuma fonte consultada sugere que o resultado seja melhor do que CSS bem
feito para o caso concreto de uma barra de separadores [10]. No iPad, o
Material 3 documenta que a convenção muda de barra inferior para **calha
lateral** a partir de larguras "medium" (≥600dp) — coincide com a tabela de
larguras de D-041 na fila de ecrã completo horizontal [2][11].

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

| Contexto | Plataforma | Padrão que a evidência apoia | Fonte |
|---|---|---|---|
| App instalada (`display-mode: standalone`) | iOS / Android, largura de telemóvel | Barra inferior, 3-5 destinos, ícone + texto | [1][2] |
| App instalada, largura de tablet/iPad horizontal completo | iOS (iPad) | Calha lateral, não barra inferior | [2][11] |
| Separador de navegador normal | iOS / Android | Cabeçalho compacto + menu hambúrguer (não barra de separadores de app) | [4][5][6] |
| Qualquer contexto | Windows / macOS / computador | Barra horizontal em cima — coincide com o modo "top" do Fluent `NavigationView` e com a convenção das apps web de macOS | [12] |
| Qualquer contexto móvel | — | **Nunca** dois sistemas de navegação primária ao mesmo tempo | [3][6][7] |

## Constatações

**1. HIG: 3-5 separadores, a quantidade mínima necessária.** A Apple
documenta explicitamente "use three to five tabs in iOS; use a few more in
iPadOS and tvOS if necessary" e adverte que cada separador adicional aumenta
a complexidade de encontrar informação [1].

**2. Material 3: o mesmo intervalo, e o ponto onde muda de padrão.** As
barras de navegação inferior de M3 limitam-se a 3-5 destinos e **só se
aplicam a telemóveis e tablets pequenos**. A partir de janelas "medium"
(600-839dp) o guia diz para substituir a barra inferior por uma **calha
lateral** (3-7 destinos); se houver mais de 5, considerar uma calha
expandida/modal em vez de continuar a empilhar na barra [2].

**3. Nenhuma PWA de sucesso combina as duas.** Várias fontes de padrões de
navegação em PWAs coincidem em que a abordagem vencedora é escolher **um
único** padrão de navegação primária — a alternativa (p. ex. The Weather
Channel, que usa barra em cima e em baixo ao mesmo tempo) é citada
explicitamente como o antipadrão, não o modelo a seguir [3].

**4. Abaixo de 5-6 opções, ganha o hambúrguer em telemóvel.** O Nielsen
Norman Group e várias fontes de padrões de UX coincidem: uma fila de
separadores horizontal em telemóvel não aguenta mais de 5-6 antes de
precisar de scroll, e o scroll horizontal na navegação **é ignorado** salvo
que haja uma pista visual forte de que continua — a fila de hoje
(`nav.sitio`) não a tem, e é por isso que a sexta secção ("Código aberto")
é invisível na prática [4][5][6].

**5. O trade-off documentado do hambúrguer.** Não é grátis: o NN/g documenta
que esconder a navegação reduz a sua descobribilidade face a tê-la visível.
É o motivo por que a recomendação não é "tudo atrás do hambúrguer", mas sim
manter as ações de conversão (Entrar, Criar conta) sempre visíveis e só
esconder as seis secções de conteúdo [5].

**6. `display-mode: standalone` já é um padrão provado neste repo.**
`Instalar.astro` já usa `@media (display-mode: standalone), (display-mode:
minimal-ui), (display-mode: fullscreen)` para distinguir se a página corre
instalada. É o mesmo sinal — sem JavaScript novo, sem deteção de plataforma
em JS, coerente com a regra já escrita em `docs/guia-de-estilo.md` — que
resolve qual das duas navegações deve existir em cada momento [8][9].

**7. Windows/Fluent: o modo "top" é válido, não um compromisso.**
O `NavigationView` da Microsoft suporta explicitamente um modo de navegação
horizontal em cima ("Top") como alternativa de primeira classe à calha
lateral esquerda, recomendado quando se quer mostrar todas as opções ao
mesmo tempo e há espaço de ecrã de sobra — que é exatamente o caso de
computador do Math Challenge hoje [12].

**8. Sobre bibliotecas de "look nativo".** Framework7, Ionic e Onsen UI
existem especificamente para imitar controlos nativos de iOS/Android numa
PWA, mas as fontes consultadas descrevem o Framework7 como "relativamente
grande" em tamanho, com o consequente custo em tempo de carregamento, e
nenhuma fonte sugere uma vantagem de resultado visual sobre CSS bem
construído para o caso concreto de uma barra de separadores — que é
exatamente o que `plataformas.css` já constrói hoje para rádios, elevação e
o material translúcido do iOS [10].

**9. O overlay de ecrã completo tem rarezas específicas do iOS Safari.**
Uma fonte centrada em cuidar o detalhe da experiência móvel documenta que os
overlays de ecrã completo no iOS Safari não fecham com o gesto de deslizar
que funciona no Android, e que há que manejar `env(safe-area-inset-*)` com
cuidado nesse contexto — um menu que se abre **empurrando o conteúdo** (em
vez de um overlay fixo) evita essa categoria de bug por construção [6].

## Implicações de design

1. **Nunca renderizar `nav.sitio` completo e `.barra-inferior` ao mesmo
   tempo.** O primeiro é o padrão de separador de navegador; o segundo, o
   de app instalada. Distinguem-se com `display-mode: standalone`, sem JS.
2. **A barra inferior instalada limita-se a 5 destinos, todos a um
   toque**: os que HIG/M3 permitem como máximo. Nenhum destino fica atrás
   de um segundo nível se o próprio proprietário do produto pede que esteja
   a um toque — a solução não é violar o limite de 5, é escolher bem quais 5.
3. **O resto das secções (Origem, Arquitetura, Código aberto) vive num
   `<details>/<summary>` nativo**, não num sexto separador nem num scroll
   horizontal. Zero JavaScript, o mesmo mecanismo nos dois contextos (app
   instalada e separador de navegador), coerente com "Sem JavaScript: cinco
   ligações" que `Base.astro` já declara.
4. **Em separador de navegador (não instalada), cabeçalho compacto**: marca
   + Entrar + Criar conta sempre visíveis + botão que abre as seis secções
   **por baixo**, empurrando o conteúdo — nunca um overlay de ecrã
   completo, pela constatação n.º 9.
5. **O iPad em horizontal completo (1024-1366px, a fila de D-041) usa uma
   calha lateral**, não a barra inferior do iPhone — coincide com onde o
   Material 3 diz que o padrão muda. Abaixo dessa largura (vertical, Split
   View), o iPad comporta-se como o iPhone, que já é a base de D-041.
6. **Sem biblioteca nova.** HTML semântico + CSS com `data-platform` e
   `display-mode`, exatamente o padrão que o repo já usa — custo zero de
   bundle adicional no resto do site.
7. **O computador não muda**: a barra horizontal em cima de hoje coincide
   com o modo "Top" do Fluent NavigationView e com a convenção das apps web
   de macOS — não há evidência de que competir por um padrão distinto aí
   compre alguma coisa.

## Questões para o proprietário — resolvidas em 2026-08-01

Estas foram resolvidas em rondas de perguntas de escolha múltipla durante a
mesma sessão desta investigação, e ficam documentadas aqui para que a
decisão não fique órfã do seu porquê:

1. **Quando se mostra a barra inferior?** → Só instalada
   (`display-mode: standalone`).
2. **O que acontece ao que não cabe em 5 destinos?** → `<details>/<summary>`
   "Mais", salvo Entrar/Criar conta, que o proprietário pediu explicitamente
   a um toque, sem passar pelo "Mais".
3. **Biblioteca ou CSS puro?** → CSS puro, sem dependência nova.
4. **iPad largo como iPhone ou calha própria?** → Calha própria, só em
   horizontal completo (1024-1366px).
5. **Ações visíveis no cabeçalho compacto de separador de navegador?** →
   Sempre visíveis, o mesmo critério da barra instalada.
6. **Como se abre o menu de separador de navegador?** → Empurra o conteúdo
   para baixo, não overlay — pela constatação n.º 9 do iOS Safari.

## Fontes

1. Apple Developer, "Tab bars" — Human Interface Guidelines —
   https://developer.apple.com/design/human-interface-guidelines/tab-bars
   (fetched 2026-08-01)
2. Material Design 3, "Navigation bar" and "Navigation rail" guidelines —
   https://m3.material.io/components/navigation-bar/guidelines ·
   https://m3.material.io/components/navigation-rail/guidelines (fetched
   2026-08-01)
3. Phone Simulator, "Mobile Navigation Patterns That Work in 2026" —
   https://phone-simulator.com/blog/mobile-navigation-patterns-in-2026
   (fetched 2026-08-01)
4. Nielsen Norman Group, "Basic Patterns for Mobile Navigation: A Primer" —
   https://www.nngroup.com/articles/mobile-navigation-patterns/ (fetched
   2026-08-01)
5. Onething Design, "Hamburger Menu vs Tab Bar: Which Works Better?" —
   https://www.onething.design/post/hamburger-menu-vs-tab-bar (fetched
   2026-08-01)
6. Gromov, "Full-screen menu quirks for mobile Safari" —
   https://gromov.com/en/full-screen-menu-quirks-mobile-safari (fetched
   2026-08-01)
7. Smashing Magazine, "How To Decide Which PWA Elements Should Stick" —
   https://www.smashingmagazine.com/2020/01/mobile-pwa-sticky-bars-elements/
   (fetched 2026-08-01)
8. web.dev, "How to provide your own in-app install experience" (documents
   `display-mode` media query) —
   https://web.dev/customize-install/ (fetched 2026-08-01)
9. Math Challenge internal code, `apps/web/src/components/Instalar.astro` —
   uso já existente de `@media (display-mode: standalone)` neste repo.
10. StackShare, "Framework7 vs Ionic vs Onsen UI" —
    https://stackshare.io/stackups/framework7-vs-ionic-vs-onsen-ui (fetched
    2026-08-01)
11. Math Challenge internal decision, D-041 — tabela de larguras de iPad —
    `docs/decisions.md`
12. Microsoft Learn, "NavigationView" — Windows apps —
    https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/navigationview
    (fetched 2026-08-01)
