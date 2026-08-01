# Stack, protocolos e desempenho real: o que está verdadeiramente na vanguarda sobre a Cloudflare

> Math Challenge research — 2026-07-31 — topic 47

## Resumo executivo (ES)

- **gRPC não é viável aqui, e não por falta de vontade.** Workers e Durable Objects **não podem fazer chamadas gRPC de saída** porque o runtime não suporta streaming bidirecional HTTP/2; há um issue aberto em `cloudflare/workerd` pedindo‑o [1].
- **E o navegador também não fala gRPC.** O cliente web implementa um protocolo distinto do gRPC nativo: os navegadores não expõem as funcionalidades de HTTP/2 que o gRPC necessita, por isso o gRPC-Web usa HTTP/1.1 — *"o que cancela algumas das vantagens de usar gRPC"* — e **não suporta chamadas com streaming do cliente nem bidirecionais** [2][3].
- **O RPC nativo dos Workers ganha por arquitetura, não por pouco.** Com Service Bindings *"não há sobrecarga nem latência adicionada"*, e o Worker chamado *"normalmente nem sequer cruza uma rede, e costuma correr no mesmo thread que quem o invoca, reduzindo a latência a zero"* [4][5].
- **HTTP/3 sobre QUIC é um interruptor, não um projeto.** Está disponível em todos os planos da Cloudflare e ativa‑se a partir da configuração de otimização de protocolo [6][7].
- **O número que importa para redes deficientes:** em ligações com 1‑3 % de perda de pacotes —o móvel real— HTTP/3 oferece **10‑30 % de melhoria no tempo de carregamento**, porque a recuperação de perda por stream impede que um único pacote perdido bloqueie a página inteira [8].
- Com **0‑RTT** para visitantes recorrentes, a poupança pode **ultrapassar os 300 ms**, suficiente para mover uma página de "precisa melhorar" para "boa" nos Core Web Vitals [8].
- **INP é a métrica que falha.** 43 % dos sites não ultrapassam o limiar de 200 ms, e é a mais difícil de 2026 porque mede **cada** interação, não a primeira; o inimigo são as tarefas longas de JavaScript que bloqueiam o thread principal [9].
- **O Google classifica com dados de campo, não de laboratório:** *"um 100 perfeito no Lighthouse não significa nada se os utilizadores reais em redes 3G sofrem"* [9].
- **AVIF e WebP produzem ficheiros 25‑50 % menores**; pré‑carregar a imagem de LCP com `fetchpriority="high"` é das mais eficazes para LCP [9].
- Implicação central: o que está na vanguarda **nesta plataforma** é RPC nativo + HTTP/3 + orçamento rígido de INP, não gRPC. Adotar gRPC aqui seria adotar a geração anterior com mais trabalho.

## Resumo executivo (EN)

- **gRPC não é viável aqui.** Workers e Durable Objects **não podem fazer chamadas gRPC de saída** porque o runtime não tem streaming bidirecional HTTP/2; um issue aberto em `cloudflare/workerd` acompanha isso [1].
- **Os navegadores também não falam gRPC.** O cliente web implementa um protocolo diferente do gRPC nativo: os navegadores não expõem as funcionalidades HTTP/2 que o gRPC necessita, por isso o gRPC-Web recorre ao HTTP/1.1 — *"o que cancela algumas das vantagens de usar gRPC"* — e **não suporta streaming do cliente nem chamadas bidireccionais** [2][3].
- **O RPC nativo dos Workers vence em arquitetura.** Com Service Bindings *"não há sobrecarga nem latência adicional"*, e o chamado *"geralmente nem sequer atravessa uma rede, e costuma correr no mesmo thread que o chamador, reduzindo a latência a zero"* [4][5].
- **HTTP/3 sobre QUIC é um interruptor, não um projeto** — disponível em todos os planos da Cloudflare [6][7].
- **O número que importa para redes deficientes:** em ligações com 1‑3 % de perda de pacotes, HTTP/3 oferece **10‑30 % de melhoria no carregamento da página**, porque a recuperação de perda por stream impede que um único pacote perdido bloqueie tudo [8]. Com **0‑RTT**, a poupança pode **ultrapassar os 300 ms** [8].
- **INP é a que falha.** 43 % dos sites não atingem o limiar de 200 ms; é o vital mais difícil de 2026 porque mede **toda** a interação [9].
- **O Google classifica com dados de campo, não de laboratório** [9]. AVIF/WebP reduzem os ficheiros em 25‑50 % [9].
- Implicação principal: a vanguarda **nesta plataforma** é RPC nativo + HTTP/3 + um orçamento rígido de INP — não gRPC.

## Constatações

### 1. Por que o gRPC não entra

Três factos independentes, cada um suficiente por si só.

**Do lado do servidor.** O issue `cloudflare/workerd#6455` documenta que Workers e Durable Objects não podem fazer chamadas gRPC de saída porque o runtime não suporta streaming bidirecional HTTP/2; o próprio issue indica que mesmo suportar apenas gRPC unário — um POST HTTP/2 com corpo protobuf mais trailers — desbloquearia a maioria dos casos de uso, e ainda não existe [1].

**Do lado do navegador.** Isto não é uma limitação da Cloudflare, mas do protocolo: a biblioteca cliente web *implementa um protocolo diferente do gRPC nativo* precisamente porque os navegadores não expõem as funcionalidades HTTP/2 que o gRPC requer [3]. Consequentemente, o gRPC-Web usa HTTP/1.1, *"o que elimina algumas das vantagens de usar gRPC"*, e **o streaming do cliente e o bidirecional ficam fora de alcance** [2].

**Do lado da infraestrutura intermédia.** A Cloudflare documenta no seu próprio blog que os trailers HTTP — que o gRPC necessita para o estado — *não estavam plenamente suportados* pelo seu proxy de borda, e há relatos de corpos e trailers de gRPC a serem removidos através de túneis mesmo com TLS+ALPN+h2 na origem [10][11].

**Conclusão.** Não é que o gRPC seja difícil aqui: é que o caso de uso que o justificaria — streaming binário eficiente e bidirecional — é exatamente o que não está disponível nem no runtime nem no navegador. O que ficaria seria protobuf sobre HTTP/1.1 com um proxy extra: mais peças, mais latência, depuração pior, e sem a vantagem.

### 2. O que realmente está na vanguarda nesta plataforma

A Cloudflare tem RPC nativo de JavaScript sobre Service Bindings, projetado para *"sentir‑se o mais parecido possível a chamar uma função JavaScript dentro do mesmo Worker"* [4]. A sua característica de desempenho não admite comparação com nenhuma arquitetura de rede: *"não há sobrecarga nem latência adicionada. Por defeito, ambos os Workers correm no mesmo thread do mesmo servidor da Cloudflare"*, e o RPC para outro Worker *"normalmente nem sequer cruza uma rede"* [4][5].

Um RPC que não cruza a rede não pode ser superado por um RPC que a cruza, por eficiente que seja a sua serialização. Essa é toda a comparação.

Os Service Bindings suportam dois estilos: encaminhamento de `fetch` (passa‑se um `Request` completo) e RPC tipado (invocam‑se métodos diretamente) [5]. O segundo é o que corresponde ao motor de desafio a chamar o modelo do aluno, ao avaliador e ao tutor.

### 3. HTTP/3, QUIC e o que realmente acontece numa rede congestionada

O HTTP/3 está disponível em todos os planos da Cloudflare e é ativado com um interruptor na configuração de otimização de protocolo [6][7]. Não há trabalho de implementação, apenas de verificação.

O que ganha, com números:

- **Perda de pacotes.** Em ligações com 1‑3 % de perda — a gama típica de dispositivos móveis reais — estudos da Google e da Cloudflare reportam **10‑30 % de melhoria no tempo de carregamento**, porque o isolamento a nível de stream impede que um pacote perdido bloqueie todos os pedidos [8]. Isto corresponde exatamente ao cenário de "Android de gama baixa em LatAm" que o plano mestre nomeia como mercado‑alvo.
- **Estabelecimento de conexão.** O QUIC foi construído para 0‑RTT/1‑RTT; com 0‑RTT em visitantes recorrentes a poupança pode **ultrapassar os 300 ms**, o suficiente para mudar a avaliação dos Core Web Vitals de uma página [8].

**O que não resolve:** o HTTP/3 acelera o transporte, não o trabalho. Um bundle pesado de JavaScript continua a bloquear o thread principal exatamente da mesma forma sobre QUIC como sobre TCP. Por isso o orçamento de INP (§4) importa mais do que o protocolo.

### 4. INP: a métrica que este produto está em risco de falhar

Os limiares de "bom" em 2026: LCP abaixo de 2,5 s, CLS abaixo de 0,1, INP abaixo de 200 ms — e os sites de maior desempenho apontam para **INP abaixo de 150 ms** [9].

**43 % dos sites falham no limiar de 200 ms de INP**, o que a torna a métrica mais frequentemente falhada em 2026 [9]. A razão por que é mais difícil que as outras: **mede cada toque e cada clique, não só o primeiro**, e o inimigo são as tarefas longas do thread principal — JavaScript pesado que impede o navegador de responder quando o utilizador interage [9].

Este é um risco específico e nomeável para o Math Challenge: o motor de desafio são ilhas React, a criança toca muitas vezes por sessão, e cada toque é medido. Um jogo de matemática é, por sua natureza, uma aplicação de alta frequência de interação — o perfil exato onde o INP falha.

E a estrutura de avaliação fecha a porta ao auto‑engano: **o Google classifica com dados de campo, não de laboratório**; *"um 100 perfeito no Lighthouse não significa nada se os utilizadores reais em redes 3G sofrem"* [9].

### 5. Imagens

Servir formatos modernos —AVIF ou WebP— dá ficheiros **25‑50 % mais pequenos** [9]. Para LCP, o mais eficaz é pré‑carregar a imagem de LCP com `fetchpriority="high"` além de otimizar o seu peso [9].

Para este produto o volume de imagem é real: ~30 peças de arte da Sabana mais ilustrações de itens (`mc-40`, D-019), servidas a partir do R2 aos sete locais. Como a arte é reutilizada entre idiomas — a Sabana não fala (D-019) — o catálogo de imagens é partilhado e, por isso, altamente cacheável.

### 6. Nativo em quatro plataformas

As guias de plataforma são explícitas e distintas: Android segue Material Design, com **Material 3** introduzindo cor dinâmica e design tokens; Apple cobre todas as suas plataformas com as Human Interface Guidelines [12][13]. Para que uma PWA não se sinta web, a recomendação prática converge em três coisas: **tipografia preferida do sistema**, distinta por iOS/Android/Windows; **barras de navegação, separadores e modais ao estilo da plataforma**; e **gestos esperados** — scroll suave, pinçar para aproximar, deslizar [13][14].

As restrições rígidas por plataforma já estão documentadas em `mc-33` e não mudam: no iOS a instalação é manual e o push exige estar instalada; no Android não há barreira de instalação; no macOS Safari 17+ há "Adicionar ao Dock"; no Windows a instalação a partir do Edge/Chromium é a mais integrada das quatro.

O custo da adaptação por plataforma não é de investigação, mas de engenharia: duplica componentes, testes e decisões de design. É uma decisão de produto, não técnica.

### 7. A frota de auditores

Um deployment com auditores adversariais é implementável e encaixa com a forma como este projeto foi construído. Divide‑se em duas classes com custos e velocidades distintas.

**Deterministas (12), em cada commit, em segundos:** orçamento de bundle · Core Web Vitals com limiares de §4 · axe‑core · contraste · tamanho de alvos táteis por banda (24 px WCAG AA / 44 px HIG / 88 px kinder, conforme `mc-38` e `mc-20`) · completude das sete chaves de idioma · validação de JSON‑LD · reciprocidade de `hreflang` · varredura de segredos · prefixo `math-challenge-` (`CLAUDE.md` § Cloudflare) · segurança de migrações · orçamento de pré‑cache offline (~5 MB de áudio, `mc-42`).

**Adversariais com LLM (23), em cada PR, instruídos para encontrar a violação e não para aprovar:** linhas vermelhas (as oito) · privacidade COPPA/GDPR‑K · anti‑humilhação · anti‑trapaça · padrões obscuros · pedagogia · rigor matemático · rigor científico (toda afirmação factual rastreável) · cânon de Larry · rachas e tempo de ecrã · kinder · PWA iOS · PWA Android · PWA‑first/offline · desempenho em rede lenta · UX por faixa etária · e **um por locale**: `en`, `es-MX`, `es-ES`, `fr-FR`, `pt-BR`, `pt-PT`, `de-DE`.

Total: **35**.

**As duas regras que os fazem servir em vez de atrapalhar.** Primeiro: **cada auditor cita a decisão ou o documento que faz cumprir** — um auditor que não pode apontar uma decisão de `decisions.md` ou uma descoberta de `research/` está a opinar, e o seu veredicto não bloqueia. Segundo: **anular um auditor exige escrever o porquê**, e essa razão fica no histórico. Sem o primeiro, a frota gera ruído; sem o segundo, torna‑se um obstáculo que as pessoas aprendem a contornar em silêncio.

**Risco conhecido, dito de forma direta:** 23 auditores com LLM por PR têm um custo por PR e uma taxa de falsos positivos. A mitigação é que apenas os deterministas bloqueiam por defeito, e os adversariais bloqueiam apenas quando citam uma linha vermelha ou uma decisão explícita; o resto reporta sem bloquear.

## Implicações de design

1. **Nada de gRPC nem gRPC-Web.** RPC nativo dos Workers sobre Service Bindings para todo o interno (§1, §2).  
2. **HTTP/3 verificado, não assumido**, incluindo 0‑RTT para recorrentes; é configuração, e há que confirmar que está ativo antes de o reivindicar (§3).  
3. **Orçamento rígido de INP ≤ 150 ms**, não 200 — é um jogo de alta frequência de interação e o limiar frouxo é onde falha 43 % da web (§4).  
4. **Medição com dados de campo desde o primeiro dia**, não com Lighthouse; um 100 de laboratório não diz nada da criança em 3G (§4).  
5. **AVIF com suporte WebP para todo o arte**, com `fetchpriority="high"` na imagem LCP de cada ecrã (§5).  
6. **A arte da Savana é armazenada em cache uma vez e servida nos sete locais**, porque não contém texto (D-019) — é a alavanca de peso mais barata que o produto tem.  
7. **Interface adaptativa por plataforma**: Material 3 no Android, HIG no iOS/macOS, controlos do sistema no Windows, com tipografia do sistema em cada um (§6).  
8. **Orçamento de desempenho como auditor determinista que bloqueia**, não como relatório que se ignora (§7).  
9. **35 auditores, com as duas regras do §7**: citar a decisão que fazem cumprir, e anulação por escrito.  
10. **Só os deterministas bloqueiam por defeito**; os adversariais bloqueiam apenas ao citar uma linha vermelha ou uma decisão explícita (§7).

## Questões abertas para o proprietário do projeto

1. O que se faz quando um auditor adversarial e outro se contradizem — por exemplo, desempenho a pedir menos JavaScript e acessibilidade a pedir mais lógica de foco? Existe uma ordem de precedência escrita?  
2. Os 23 auditores com LLM correm em cada PR ou apenas nos que tocam rotas sensíveis? O custo por PR e o tempo de espera mudam muito.  
3. O orçamento de INP de 150 ms é medido em que dispositivo de referência? `mc-33` propõe um Android de gama média sobre 3G lento; é preciso defini‑lo ou o orçamento não é verificável.  
4. A interface adaptativa inclui Windows e macOS desde o início, ou apenas móvel na v1?

## Fontes

1. GitHub, `cloudflare/workerd` issue #6455 — "Support HTTP/2 bidirectional streaming (gRPC) in Workers/Durable Objects" — https://github.com/cloudflare/workerd/issues/6455  
2. GitHub, `cloudflare/workerd` issue #3150 — "[Question] gRPC/gRPC-web (+streaming) support for Cloudflare Workers" — https://github.com/cloudflare/workerd/issues/3150  
3. gRPC Core documentation, "gRPC Web" (PROTOCOL-WEB) — https://grpc.github.io/grpc/core/md_doc__p_r_o_t_o_c_o_l-_w_e_b.html  
4. Cloudflare Blog, "We've added JavaScript-native RPC to Cloudflare Workers" — https://blog.cloudflare.com/javascript-native-rpc/  
5. Cloudflare Workers docs, "Service bindings — RPC (WorkerEntrypoint)" — https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/rpc/  
6. Cloudflare Speed docs, "HTTP/3 (with QUIC)" — https://developers.cloudflare.com/speed/optimization/protocol/http3/  
7. Cloudflare Speed docs, "Protocol optimization" — https://developers.cloudflare.com/speed/optimization/protocol/  
8. Calmops, "HTTP/3 and QUIC Protocol Complete Guide 2026" — https://calmops.com/network/http3-quic-protocol-complete-guide/ — fonte das cifras de 10‑30 % com 1‑3 % de perda e da poupança >300 ms com 0‑RTT.  
9. Digital Applied, "Core Web Vitals 2026: INP, LCP & CLS Optimization" — https://www.digitalapplied.com/blog/core-web-vitals-2026-inp-lcp-cls-optimization-guide — fonte dos limiares, dos 43 % que falham INP, da poupança de 25‑50 % de AVIF/WebP e da distinção campo‑vs‑laboratório.  
10. Cloudflare Blog, "Road to gRPC" — https://blog.cloudflare.com/road-to-grpc/  
11. GitHub, `cloudflare/cloudflared` issue #1641 — trailers de gRPC removidos através de túnel — https://github.com/cloudflare/cloudflared/issues/1641  
12. UXPin, "iOS vs. Android UI Design: 9 Key Differences (2026)" — https://www.uxpin.com/studio/blog/ios-vs-andoid-ui-design-for-mobile/  
13. DEV Community, "Designing Native-Like Progressive Web Apps for iOS" — https://dev.to/oskarlarsson/designing-native-like-progressive-web-apps-for-ios-510o  
14. MagicBell, "4 Essential PWA Strategies for Enhanced iOS Performance" — https://www.magicbell.com/blog/essential-pwa-strategies-for-enhanced-ios-performance  
15. Investigação interna: `mc-32-cloudflare-architecture.md`, `mc-33-pwa-first-reality.md`, `mc-38-accessibility-learning-differences.md`, `mc-42-audio-haptics-game-feel.md`.

**Qualidade das fontes.** As fontes [1]-[7] e [10]-[11] são primárias: documentação oficial da Cloudflare, do gRPC, e issues públicos dos seus repositórios. As fontes [8], [9], [12]-[14] são publicações da indústria; as suas cifras (10‑30 %, 43 %, 25‑50 %) devem ser tratadas como **ordem de magnitude direcional** e reverificadas contra o Web Almanac ou o CrUX antes de serem usadas em material público. A conclusão sobre gRPC (§1) apoia‑se **apenas em fontes primárias** e é a mais firme deste documento.
