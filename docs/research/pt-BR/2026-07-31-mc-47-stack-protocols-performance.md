# Stack, protocolos e desempenho real: o que está realmente na vanguarda sobre Cloudflare

> Math Challenge research — 2026-07-31 — topic 47

## Resumo executivo (ES)

- **gRPC não é viável aqui, e não por falta de vontade.** Workers e Durable Objects **não podem fazer chamadas gRPC de saída** porque o runtime não suporta streaming bidirecional HTTP/2; há um issue aberto em `cloudflare/workerd` solicitando isso [1].
- **E o navegador também não fala gRPC.** O cliente web implementa um protocolo distinto do gRPC nativo: os navegadores não expõem as funções de HTTP/2 que o gRPC necessita, então o gRPC-Web usa HTTP/1.1 — *"o que cancela algumas das vantagens de usar gRPC"* — e **não suporta chamadas com streaming do cliente nem bidirecionais** [2][3].
- **O RPC nativo dos Workers ganha por arquitetura, não por pouco.** Com Service Bindings *"não há sobrecarga nem latência adicionada"*, e o Worker chamado *"normalmente nem sequer cruza uma rede, e costuma rodar na mesma thread de quem o chama, reduzindo a latência a zero"* [4][5].
- **HTTP/3 sobre QUIC é um interruptor, não um projeto.** Está disponível em todos os planos da Cloudflare e é ativado nas configurações de otimização de protocolo [6][7].
- **O número que importa para redes ruins:** em conexões com 1-3% de perda de pacotes —o móvel real— HTTP/3 oferece **10-30% de melhoria no tempo de carregamento**, porque a recuperação de perda por stream impede que um único pacote perdido trave a página inteira [8].
- Com **0-RTT** para visitantes recorrentes, a economia pode **superar os 300 ms**, suficiente para mover uma página de "precisa melhorar" a "boa" nos Core Web Vitals [8].
- **INP é a métrica que falha.** 43% dos sites não passam do limite de 200 ms, e é a mais difícil de 2026 porque mede **cada** interação, não a primeira; o inimigo são as tarefas longas de JavaScript que bloqueiam a thread principal [9].
- **Google classifica com dados de campo, não de laboratório:** *"um 100 perfeito no Lighthouse não significa nada se os usuários reais em redes 3G sofrem"* [9].
- **AVIF e WebP geram arquivos 25-50% menores**; pré-carregar a imagem de LCP com `fetchpriority="high"` é uma das estratégias mais eficazes para LCP [9].
- Implicação central: o que está na vanguarda **nesta plataforma** é RPC nativo + HTTP/3 + orçamento rígido de INP, não gRPC. Adotar gRPC aqui seria adotar a geração anterior com mais trabalho.

## Resumo executivo (EN)

- **gRPC não é viável aqui.** Workers e Durable Objects **não podem fazer chamadas gRPC de saída** porque o runtime não possui streaming bidirecional HTTP/2; um issue aberto em `cloudflare/workerd` acompanha isso [1].
- **Os navegadores também não falam gRPC.** O cliente web implementa um protocolo diferente do gRPC nativo: os navegadores não expõem os recursos HTTP/2 que o gRPC necessita, então o gRPC-Web recai para HTTP/1.1 — *"o que cancela algumas das vantagens de usar gRPC"* — e **não suporta streaming do cliente nem chamadas bidirecionais** [2][3].
- **O RPC nativo dos Workers vence em arquitetura.** Com Service Bindings *"não há sobrecarga nem latência adicional"*, e o chamado *"geralmente nem sequer atravessa uma rede, e costuma rodar na mesma thread do chamador, reduzindo a latência a zero"* [4][5].
- **HTTP/3 sobre QUIC é um interruptor, não um projeto** — disponível em todos os planos da Cloudflare [6][7].
- **O número que importa para redes ruins:** em conexões com 1-3% de perda de pacotes, HTTP/3 oferece **10-30% de melhoria no carregamento da página**, porque a recuperação de perda por stream impede que um único pacote perdido trave tudo [8]. Com **0-RTT**, a economia pode **ultrapassar 300 ms** [8].
- **INP é a que falha.** 43% dos sites não atingem o limite de 200 ms; é o vital mais difícil de 2026 porque mede **cada** interação [9].
- **Google classifica com dados de campo, não de laboratório** [9]. AVIF/WebP reduzem arquivos em 25-50% [9].
- Implicação central: a vanguarda **nesta plataforma** é RPC nativo + HTTP/3 + um orçamento rígido de INP — não gRPC.

## Resultados

### 1. Por que gRPC não entra

Três fatos independentes, cada um suficiente por si só.

**Do lado do servidor.** O issue `cloudflare/workerd#6455` documenta que Workers e Durable Objects não podem fazer chamadas gRPC de saída porque o runtime não suporta streaming bidirecional HTTP/2; o próprio issue aponta que até mesmo suportar apenas gRPC unário —um POST HTTP/2 com corpo protobuf mais trailers— desbloquearia a maioria dos casos de uso, e ainda não existe [1].

**Do lado do navegador.** Isso não é uma limitação da Cloudflare, mas do protocolo: a biblioteca cliente web *implementa um protocolo distinto do gRPC nativo* precisamente porque os navegadores não expõem as funções de HTTP/2 que o gRPC requer [3]. Em consequência, gRPC-Web usa HTTP/1.1, *“o que cancela algumas das vantagens de usar gRPC”*, e **o streaming de cliente e o bidirecional ficam fora de alcance** [2].

**Do lado da infraestrutura intermediária.** A Cloudflare documenta em seu próprio blog que os trailers de HTTP —que o gRPC precisa para o estado— *não estavam plenamente suportados* por seu proxy de borda, e há relatos de corpos e trailers de gRPC sendo removidos através de túneis mesmo com TLS+ALPN+h2 na origem [10][11].

**Conclusão.** Não é que o gRPC seja difícil aqui: é que o caso de uso que o justificaria —streaming binário eficiente e bidirecional— é exatamente o que não está disponível nem no runtime nem no navegador. O que restaria seria protobuf sobre HTTP/1.1 com um proxy extra: mais peças, mais latência, depuração pior, e sem a vantagem.

### 2. O que realmente está na vanguarda nesta plataforma

A Cloudflare tem RPC nativo de JavaScript sobre Service Bindings, projetado para *“sentir-se o mais parecido possível a chamar uma função JavaScript dentro do mesmo Worker”* [4]. Sua característica de desempenho não admite comparação com nenhuma arquitetura de rede: *“não há sobrecarga nem latência adicionada. Por padrão, ambos os Workers rodam no mesmo thread do mesmo servidor da Cloudflare”*, e o RPC para outro Worker *“normalmente nem sequer cruza uma rede”* [4][5].

Um RPC que não cruza a rede não pode ser superado por um RPC que a cruza, por eficiente que seja sua serialização. Essa é toda a comparação.

Os Service Bindings suportam dois estilos: encaminhamento de `fetch` (passa‑se um `Request` completo) e RPC tipado (invocam‑se métodos diretamente) [5]. O segundo é o que corresponde ao motor de desafio chamando o modelo do aluno, o avaliador e o tutor.

### 3. HTTP/3, QUIC e o que realmente acontece em uma rede congestionada

HTTP/3 está disponível em todos os planos da Cloudflare e é ativado com um interruptor na configuração de otimização de protocolo [6][7]. Não há trabalho de implementação, apenas de verificação.

O que se ganha, com números:

- **Perda de pacotes.** Em conexões com 1‑3 % de perda —o intervalo típico do móvel real— estudos do Google e da Cloudflare relatam **10‑30 % de melhoria no tempo de carregamento**, porque o isolamento a nível de stream impede que um pacote perdido bloqueie todas as requisições [8]. Esse é exatamente o cenário de “Android de gama baixa na LatAm” que o plano mestre nomeia como mercado‑alvo.
- **Estabelecimento de conexão.** QUIC foi construído para 0‑RTT/1‑RTT; com 0‑RTT em visitantes recorrentes a economia pode **superar os 300 ms**, o bastante para mudar a avaliação de Core Web Vitals de uma página [8].

**O que não resolve:** HTTP/3 acelera o transporte, não o trabalho. Um bundle de JavaScript pesado continua bloqueando o thread principal exatamente da mesma forma sobre QUIC que sobre TCP. Por isso o orçamento de INP (§4) importa mais que o protocolo.

### 4. INP: a métrica que este produto está em risco de falhar

Os limiares de “bom” em 2026: LCP abaixo de 2,5 s, CLS abaixo de 0,1, INP abaixo de 200 ms — e os sites de mais alto desempenho apontam para **INP abaixo de 150 ms** [9].

**43 % dos sites falham no limiar de 200 ms de INP**, o que a torna a métrica vital mais comumente falhada em 2026 [9]. A razão de ser mais difícil que as demais: **mede cada toque e cada clique, não apenas o primeiro**, e o inimigo são tarefas longas do thread principal — JavaScript pesado que impede o navegador de responder quando o usuário interage [9].

Isso é um risco específico e nomeável para Math Challenge: o motor de desafio são ilhas React, a criança toca muitas vezes por sessão, e cada toque é medido. Um jogo de matemática é, por sua natureza, uma aplicação de alta frequência de interação — o perfil exato onde o INP se quebra.

E o framework de avaliação fecha a porta para autoengano: **o Google classifica com dados de campo, não de laboratório**; *“um 100 perfeito no Lighthouse não significa nada se os usuários reais em redes 3G sofrem”* [9].

### 5. Imagens

Servir formatos modernos —AVIF ou WebP— gera arquivos **25‑50 % menores** [9]. Para LCP, o mais eficaz é pré‑carregar a imagem de LCP com `fetchpriority="high"` além de otimizar seu peso [9].

Para este produto o volume de imagem é real: ~30 peças de arte da Savana mais ilustrações de itens (`mc-40`, D-019), servidas a partir do R2 nos sete locais. Como a arte é reutilizada entre idiomas —a Savana não fala (D-019)— o catálogo de imagens é compartilhado e, portanto, altamente cacheável.

### 6. Nativo em quatro plataformas

Os guias de plataforma são explícitos e distintos: Android segue Material Design, com **Material 3** introduzindo cor dinâmica e design tokens; Apple cobre todas as suas plataformas com as Human Interface Guidelines [12][13]. Para que uma PWA não se sinta web, a recomendação prática converge em três coisas: **tipografia preferida do sistema**, distinta para iOS/Android/Windows; **barras de navegação, abas e modais ao estilo da plataforma**; e **gestos esperados** — rolagem suave, pinçar para aproximar, deslizar [13][14].

As restrições duras por plataforma já estão documentadas em `mc-33` e não mudam: no iOS a instalação é manual e o push exige estar instalado; no Android não há barreira de instalação; no macOS Safari 17+ há “Adicionar ao Dock”; no Windows a instalação via Edge/Chromium é a mais integrada das quatro.

O custo da adaptação por plataforma não é de pesquisa, mas de engenharia: duplica componentes, testes e decisões de design. É uma decisão de produto, não técnica.

### 7. A frota de auditores

Um deployment com auditores adversariais é implementável e encaixa com a forma como este projeto foi construído. Ele se divide em duas classes com custos e velocidades distintas.

**Determinísticos (12), a cada commit, em segundos:** orçamento de bundle · Core Web Vitals com limiares de §4 · axe‑core · contraste · tamanho de alvos táteis por banda (24 px WCAG AA / 44 px HIG / 88 px kinder, per `mc-38` e `mc-20`) · completude das sete chaves de idioma · validação de JSON‑LD · reciprocidade de `hreflang` · escaneamento de segredos · prefixo `math-challenge-` (`CLAUDE.md` § Cloudflare) · segurança de migrações · orçamento de pré‑cache offline (~5 MB de áudio, `mc-42`).

**Adversariais com LLM (23), a cada PR, instruídos para encontrar a violação e não para aprovar:** linhas vermelhas (as oito) · privacidade COPPA/GDPR‑K · anti‑humilhação · anti‑trapaça · padrões obscuros · pedagogia · rigor matemático · rigor científico (toda afirmação factual rastreável) · cânon de Larry · rachas e tempo de tela · kinder · PWA iOS · PWA Android · PWA‑first/offline · desempenho em rede lenta · UX por faixa etária · e **um por locale**: `en`, `es-MX`, `es-ES`, `fr-FR`, `pt-BR`, `pt-PT`, `de-DE`.

Total: **35**.

**As duas regras que os fazem servir em vez de atrapalhar.** Primeiro: **cada auditor cita a decisão ou o documento que faz cumprir** — um auditor que não pode apontar uma decisão de `decisions.md` ou um hallazgo de `research/` está opinando, e seu veredicto não bloqueia. Segundo: **anular um auditor exige escrever o porquê**, e essa razão fica no histórico. Sem o primeiro, a frota gera ruído; sem o segundo, torna‑se um obstáculo que as pessoas aprendem a contornar em silêncio.

**Risco conhecido, dito de frente:** 23 auditores com LLM por PR têm um custo por PR e uma taxa de falsos positivos. A mitigação é que apenas os determinísticos bloqueiam por padrão, e os adversariais bloqueiam somente quando citam uma linha vermelha ou uma decisão explícita; o resto reporta sem bloquear.

## Design implications

1. **Nada de gRPC nem gRPC-Web.** RPC nativo de Workers sobre Service Bindings para tudo interno (§1, §2).
2. **HTTP/3 verificado, não assumido**, incluindo 0-RTT para recorrentes; é configuração, e é preciso confirmar que está ativo antes de reivindicá‑lo (§3).
3. **Orçamento rígido de INP ≤ 150 ms**, não 200 — é um jogo de alta frequência de interação e o limiar frouxo é onde falha 43 % da web (§4).
4. **Medição com dados de campo desde o primeiro dia**, não com Lighthouse; 100 % de laboratório não diz nada sobre o usuário em 3G (§4).
5. **AVIF com fallback WebP para todo o arte**, com `fetchpriority="high"` na imagem de LCP de cada tela (§5).
6. **A arte da Savana é cacheada uma vez e serve aos sete locais**, porque não contém texto (D-019) — é a alavanca de peso mais barata que o produto tem.
7. **Interface adaptativa por plataforma**: Material 3 no Android, HIG no iOS/macOS, controles do sistema no Windows, com tipografia do sistema em cada um (§6).
8. **Orçamento de desempenho como auditor determinista que bloqueia**, não como relatório que se ignora (§7).
9. **35 auditores, com as duas regras do §7**: citar a decisão que fazem cumprir, e anulação por escrito.
10. **Só os deterministas bloqueiam por padrão**; os adversariais bloqueiam apenas ao citar uma linha vermelha ou uma decisão explícita (§7).

## Perguntas abertas para o responsável do projeto

1. O que fazer quando um auditor adversarial e outro se contradizem — por exemplo, desempenho pedindo menos JavaScript e acessibilidade pedindo mais lógica de foco? Existe uma ordem de precedência escrita?
2. Os 23 auditores com LLM rodam em cada PR ou apenas nos que tocam rotas sensíveis? O custo por PR e o tempo de espera mudam muito.
3. O orçamento de INP de 150 ms é medido em qual dispositivo de referência? `mc-33` propõe um Android de gama média em 3G lento; é preciso defini‑lo ou o orçamento não será verificável.
4. A interface adaptativa inclui Windows e macOS desde o início, ou apenas mobile na v1?

## Fontes

1. GitHub, `cloudflare/workerd` issue #6455 — "Support HTTP/2 bidirectional streaming (gRPC) in Workers/Durable Objects" — https://github.com/cloudflare/workerd/issues/6455
2. GitHub, `cloudflare/workerd` issue #3150 — "[Question] gRPC/gRPC-web (+streaming) support for Cloudflare Workers" — https://github.com/cloudflare/workerd/issues/3150
3. gRPC Core documentation, "gRPC Web" (PROTOCOL-WEB) — https://grpc.github.io/grpc/core/md_doc__p_r_o_t_o_c_o_l-_w_e_b.html
4. Cloudflare Blog, "We've added JavaScript-native RPC to Cloudflare Workers" — https://blog.cloudflare.com/javascript-native-rpc/
5. Cloudflare Workers docs, "Service bindings — RPC (WorkerEntrypoint)" — https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/rpc/
6. Cloudflare Speed docs, "HTTP/3 (with QUIC)" — https://developers.cloudflare.com/speed/optimization/protocol/http3/
7. Cloudflare Speed docs, "Protocol optimization" — https://developers.cloudflare.com/speed/optimization/protocol/
8. Calmops, "HTTP/3 and QUIC Protocol Complete Guide 2026" — https://calmops.com/network/http3-quic-protocol-complete-guide/ — fonte das cifras de 10‑30 % com 1‑3 % de perda e da economia >300 ms com 0‑RTT.
9. Digital Applied, "Core Web Vitals 2026: INP, LCP & CLS Optimization" — https://www.digitalapplied.com/blog/core-web-vitals-2026-inp-lcp-cls-optimization-guide — fonte dos limites, dos 43 % que falham INP, da economia 25‑50 % de AVIF/WebP e da distinção campo‑vs‑laboratório.
10. Cloudflare Blog, "Road to gRPC" — https://blog.cloudflare.com/road-to-grpc/
11. GitHub, `cloudflare/cloudflared` issue #1641 — trailers de gRPC removidos através de túnel — https://github.com/cloudflare/cloudflared/issues/1641
12. UXPin, "iOS vs. Android UI Design: 9 Key Differences (2026)" — https://www.uxpin.com/studio/blog/ios-vs-andoid-ui-design-for-mobile/
13. DEV Community, "Designing Native-Like Progressive Web Apps for iOS" — https://dev.to/oskarlarsson/designing-native-like-progressive-web-apps-for-ios-510o
14. MagicBell, "4 Essential PWA Strategies for Enhanced iOS Performance" — https://www.magicbell.com/blog/essential-pwa-strategies-for-enhanced-ios-performance
15. Investigação interna: `mc-32-cloudflare-architecture.md`, `mc-33-pwa-first-reality.md`, `mc-38-accessibility-learning-differences.md`, `mc-42-audio-haptics-game-feel.md`.

**Qualidade das fontes.** As fontes [1]-[7] e [10]-[11] são primárias: documentação oficial da Cloudflare, do gRPC, e issues públicos de seus repositórios. As fontes [8], [9], [12]-[14] são publicações da indústria; seus números (10‑30 %, 43 %, 25‑50 %) devem ser tratados como **ordem de magnitude direcional** e reverificados contra o Web Almanac ou o CrUX antes de serem usados em material público. A conclusão sobre gRPC (§1) baseia‑se **apenas em fontes primárias** e é a mais firme deste documento.
