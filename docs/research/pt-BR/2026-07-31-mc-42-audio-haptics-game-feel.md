# Áudio, música, hápticos, movimento e “juice” em jogos de aprendizagem

> Pesquisa Math Challenge — 2026-07-31 — tópico 42

## Resumo executivo (tópicos)

O “juice” (retroalimentação sensorial exagerada: som, partículas, tremor de tela) faz com que um jogo pareça melhor sem mudar sua lógica — tese central de *Game Feel* de Steve Swink e da palestra de 2012 “Juice It or Lose It” de Jonasson e Purho [1][2]. Mas o Math Challenge é software educativo, e aí surge uma tensão real: o “efeito do som irrelevante” mostra que fala e música de fundo degradam a memória de trabalho mesmo quando não recebem atenção consciente [3], e o princípio de coerência de Mayer diz que o material decorativo —incluindo a música de fundo— deve ser eliminado porque compete por recursos cognitivos limitados [4]. Nenhum dos dois lados está errado: o juice ajuda na motivação; a música de fundo durante o cálculo ativo pode prejudicar o desempenho. A solução prática é separar os momentos: silêncio durante a tentativa, juice completo apenas no instante de recompensa/erro.

Para crianças de 4 anos que ainda não leem, o áudio não é decorativo — é o canal de instruções. A Vibration API não funciona no Safari do iOS em nenhuma versão testada, portanto a vibração não pode ser o canal principal em iPad/iPhone [5][6]. `speechSynthesis` tem amplo suporte nos navegadores, mas a qualidade e disponibilidade de vozes por idioma dependem do sistema operacional, não do navegador [7][8]. As políticas de autoplay bloqueiam qualquer áudio com som antes de um gesto do usuário [9][10][11] — isso define a tela inicial —, e a regra de acessibilidade “nenhuma informação essencial apenas por áudio” [12] exige que cada som tenha também um equivalente visual.

## Sumário executivo (EN)

"Juice" — feedback exagerado (som, partículas, tremor de tela) — faz um jogo parecer melhor sem mudar sua lógica, conforme *Game Feel* de Steve Swink e a palestra de 2012 “Juice It or Lose It” [1][2]. O Math Challenge é um software de aprendizagem, porém, e surge uma tensão genuína: o efeito de som irrelevante mostra que fala/música de fundo degradam a memória de trabalho mesmo quando não são atendidos [3], e o princípio de coerência de Mayer afirma que áudio decorativo deve ser removido do material instrucional porque compete por capacidade cognitiva limitada [4]. Ambos estão corretos em seus contextos — juice ajuda na motivação; som ambiente durante cálculo ativo pode prejudicar o desempenho. A solução prática é separar os momentos: silêncio enquanto resolve, juice completo apenas no instante de recompensa/erro.

Para pré-leitores de 4 anos, o áudio é o canal de instrução, não decoração. A Vibration API não tem suporte no Safari iOS em nenhuma versão testada, portanto não pode ser o canal principal de recompensa em iPad/iPhone [5][6]. `speechSynthesis` tem amplo suporte nos navegadores, mas a qualidade/disponibilidade de vozes por idioma é uma propriedade do SO, não do navegador [7][8]. A política de autoplay bloqueia qualquer áudio sem mute antes de um gesto do usuário [9][10][11], o que define a tela inicial, e a regra de acessibilidade “nenhum feedback apenas por som” [12] exige um equivalente visual para cada pista de áudio.

## Resultados
### 1. Game feel e “juice”

*Game Feel* de Steve Swink (2008) define “sentido” como controle + espaço simulado + polimento, onde o polimento inclui som, partículas, tremor de tela e easing que comunicam estado sem mudar as regras [1]. A palestra da GDC Europe de 2012 “Juice It or Lose It” (Jonasson & Purho) é a demonstração prática mais citada: um jogo básico é progressivamente “juizado” com squash-and-stretch, partículas, tremor de câmera e som até ficar muito mais satisfatório, sem nenhuma mudança mecânica [2]. Para o Math Challenge a lição é que o juice é barato e eleva diretamente a recompensa percebida de uma resposta correta — o que importa mais para crianças de 4 anos, cujo engajamento é impulsionado por recompensa sensorial imediata mais que por acompanhamento de progresso a longo prazo.

### 2. Sons de recompensa

Um som curto, distinto e de afeto positivo para resposta correta funciona como reforço secundário, como os sons de “moeda” nos jogos — elogio instantâneo e independente de idioma. Para uma criança de 4 anos, o toque *é* o elogio, entregue antes que qualquer texto possa ser lido. Mantenha esses sons curtos (~300-500 ms para um “tick”; até ~1-2 s para uma celebração maior) para que nunca atrasem a próxima pergunta.

### 3. Música de fundo: uma tensão genuína e não resolvida

**Against it.** O efeito de som irrelevante é um achado robusto da psicologia cognitiva: som de fundo não relacionado — fala, música ou outro estímulo não silencioso — degrada a recordação serial e a memória de trabalho mesmo quando ignorado e não testado [3]. A explicação padrão é que material auditivo variável interfere no laço fonológico usado para a repetição verbal, e isso se aplica à música, não apenas à fala [3]. O princípio de coerência de Mayer, de sua *Cognitive Theory of Multimedia Learning*, afirma independentemente que material extrínseco — incluindo música de fundo decorativa — deve ser excluído porque consome capacidade de processamento limitada necessária para a lição em si [4]; é um dos achados mais replicados em pesquisas de multimídia educacional.

**For it.** Nenhum dos achados argumenta contra som *momentâneo e significativo* — um toque de acerto/erro, instruções faladas pré-leitura, um efeito de celebração. Ambos visam decoração *contínua e concorrente*, não feedback ligado a um evento discreto (§1).

**Synthesis:** trate “enquanto resolve” e “na resolução” como regimes de áudio separados. Use silêncio por padrão enquanto resolve; se houver música, que seja opcional e desativada por padrão. Na resolução, o som curto de recompensa/erro + animação é o momento de juice — menos de dois segundos, então o silêncio retorna.

### 4. Áudio para pré-leitores

Para idades 4-6, texto na tela é inacessível sem um adulto, portanto o áudio é a interface principal, não um aprimoramento. Duas opções:

- **`speechSynthesis` (TTS).** Gratuito, capaz de funcionar offline depois que a voz do SO está instalada, pode ler conteúdo dinâmico (problemas gerados) sem precisar gravar cada combinação. Mas a qualidade/abrangência da voz depende do SO, não do navegador [7][8]; um dispositivo sem pacote de voz em espanhol ou francês recai silenciosamente para um padrão inferior, sem API web para forçar a instalação.

- **Voice-over gravado (VO).** Qualidade consistente independentemente do dispositivo, mas fixa e finita — cada frase, por idioma, deve ser gravada e enviada. Viável para vocabulário pequeno e delimitado (rótulos de menu, “¡Correcto!”, números, nomes de operadores); não escala para texto de problema gerado arbitrariamente.

**Híbrido recomendado:** VO gravado para o vocabulário fixo de UI/celebração nos 5 idiomas; TTS (ou clipes VO concatenados) para tudo que for combinatório (leitura de problemas gerados) — padrão usado na prática por Khan Academy Kids e Duolingo.

### 5. Animação de celebração: ajuda ou distrai?

Confetes, contadores de estrelas e animações de mascote são motivadores extrínsecos além da recompensa intrínseca de uma resposta correta. Uma celebração longa e lenta atrasa o próximo problema e corre o risco de se tornar exatamente o tipo de atenção extrínseca que a literatura sobre coerência/sons irrelevantes alerta. Uma celebração curta e não bloqueante (menos de ~1,5 s) captura o benefício motivacional sem interromper o fluxo — “pequenas e frequentes batem longas e ocasionais” para manter o engajamento sem deslocar o tempo-de-tarefa.

### 6. Haptics na web

O suporte a `navigator.vibrate()` existe, mas é desigual: Chrome (desktop/Android), Edge, Samsung Internet e a maioria dos navegadores Chromium Android o suportam; Firefox desktop o suportou apenas até v128, removido a partir de 129+; e — crucialmente — **iOS Safari nunca o suportou, em nenhuma versão de 3.2 a 26.5** [5][6]. Como qualquer WebView iOS usa WebKit, isso não é um problema de “trocar de navegador”. A vibração é, no melhor dos casos, um acento no Android/Chromium, nunca o canal principal de feedback, já que uma parcela significativa da frota alvo (todos iPad/iPhone) não recebe nada. Nenhuma API web expõe o Taptic Engine do iOS como alternativa.

### 7. `prefers-reduced-motion`

Esse recurso de mídia CSS (Baseline desde janeiro de 2020) expõe uma preferência do SO de reduzir movimento não essencial, porque animações de escala/panning são gatilhos conhecidos de distúrbios vestibulares [13]. Toda celebração de alto movimento (confete, tremor, salto) precisa de uma alternativa mais calma `prefers-reduced-motion: reduce` (desvanecimento/mudança de cor) que ainda transmita “correto” — nunca simplesmente removendo o feedback.

### 8. Design mute-first

Salas de aula, salas de espera e dispositivos familiares compartilhados são contextos onde o áudio costuma ser indesejado, independentemente da capacidade da plataforma. Combinado à política de autoplay (§9), o silêncio deve ser o padrão seguro, com um controle de mute persistente e sempre visível de um toque, e o loop central (ler → responder → ver resultado) deve ser totalmente utilizável silenciado — exigência independente do §10 também.

### 9. Política de autoplay

Chrome e Safari bloqueiam áudio com som antes de um gesto do usuário, a menos que esteja mudo [9][10]. O Media Engagement Index do Chrome pode permitir lista branca de origens desktop visitadas com frequência; autoplay mudo é sempre permitido [9]. Safari no iOS requer `playsinline` para vídeo inline e trata vídeo mudo/sem áudio permissivamente [10][11]. Firefox expõe preferências granulares por domínio, incluindo uma que bloqueia especificamente autoplay da Web Audio API sem gesto [11]. Na prática: o primeiro som de uma sessão (incluindo instruções faladas) não pode autoplay — coloque-o atrás de um toque “Start”/“¡Empezar!” e use esse mesmo toque para criar/reiniciar o `AudioContext` compartilhado (mais um buffer de primer quase silencioso) para que todos os sons subsequentes toquem instantaneamente.

### 10. Feedback nunca pode ser só som

WCAG 1.2.1 exige equivalente baseado em texto para conteúdo apenas em áudio, já que texto pode ser percebido por qualquer modalidade sensorial [12]. As Game Accessibility Guidelines são mais diretas: “garanta que nenhuma informação essencial seja transmitida apenas por sons”, e informações auditivas suplementares devem ser replicadas em texto/visuais [14]. Para o Math Challenge todo sinal de acerto/erro, instrução e celebração precisa de forma visual (e, quando relevante, textual) que funcione totalmente silenciado — restrição também exigida independentemente por §8 e §9.

### 11. Pipeline de ativos

**Sprites.** Agrupe efeitos curtos (acerto, erro, tick, toque) em um único buffer de áudio-sprite reproduzido via Web Audio `AudioBufferSourceNode` com offsets, evitando muitas requisições pequenas e overhead de `<audio>` por instância.

**Latência Web Audio vs `<audio>`.** O elemento `<audio>` em dispositivos móveis tem latência/documentada e falhas, além de carecer de filtros, temporização precisa e áudio posicional; a Web Audio API é o caminho de baixa latência para som estilo jogo, enquanto `<audio>` continua útil para streaming de música de fundo longa sem bloquear download completo — frequentemente conectado via `MediaElementAudioSourceNode` dentro de um `AudioContext` [15][17]. Ambas as APIs têm amplo suporte ao nível Baseline, inclusive iOS Safari [16][7] — ao contrário da vibração, a reprodução de áudio não é risco cross-platform.

**Orçamento de tamanho de arquivo.** Meta de trabalho pendente de confirmação do proprietário: sons curtos de UI/feedback ~10-30 KB cada (compactados, em um sprite); vocabulário gravado de VO limitado (~150-300 frases) ~15-40 KB cada gera vários MB por idioma — o maior driver de ativos offline se os 5 idiomas forem instalados. Melhor: empacotar apenas o idioma selecionado na instalação, buscar/armazenar sob demanda os demais via service worker.

**Licenciamento.** Efeitos sonoros de UI geralmente vêm de bibliotecas royalty-free/CC0 ou áudio comissionado; confirme atribuição e termos de uso comercial por ativo. VO gravado requer contrato interno com talento ou fornecedor comercial de VO com direitos claros de uso comercial e regravação — decisão de aquisição para o proprietário, não resolvível a partir de documentos públicos.

## Tabela de recursos da plataforma

| Capability | iOS Safari | Android Chrome | Desktop (Chrome/Edge/Firefox/Safari) | Source |
|---|---|---|---|---|
| **Vibration API** (`navigator.vibrate`) | **Não suportado**, todas as versões 3.2–26.5 testadas | Suportado (atual) | Chrome v30+/Edge v79+ suportado; Firefox v11–128 **apenas**, removido a partir de 129+; Safari desktop não suportado | caniuse.com/vibration [5]; MDN [6] |
| **Web Audio API** | Suportado desde Safari 6 | Suportado (atual) | Chrome v14+, Edge v12+, Firefox v25+, Safari v6+ todos suportados | caniuse.com/audio-api [16]; MDN [15] |
| **Autoplay (audio with sound)** | Bloqueado antes de gesto; vídeo sem áudio ou silenciado pode reproduzir automaticamente; `playsinline` exigido inline | Bloqueado antes de gesto a menos que silenciado; Chrome MEI pode permitir lista de origens frequentes | Chrome/Edge: bloqueado a menos que silenciado/gesticulado/MEI; Firefox: preferências granulares por domínio; Safari desktop: mesma política do iOS | WebKit blog [10]; Chrome blog [9]; MDN [11] |
| **`speechSynthesis`** | Suportado desde Safari 7; **contagem/qualidade de vozes por idioma é uma propriedade do SO** | Suportado (atual); o navegador de sistema Android não o possui | Chrome v33+, Edge v14+, Firefox v49+, Safari v7+ todos suportados | caniuse.com/speech-synthesis [7]; MDN [8] |

Os inventários de vozes por idioma (EN/ES/FR/PT/DE) não podem ser enumerados apenas a partir da documentação — eles precisam ser verificados por SO/dispositivo alvo durante a implementação [7][8].

---

## Implicações de design

1. **Idades 4-6.** Cada instrução é áudio (VO gravado, §4) mais um pictograma grande — nunca apenas texto. Sem música de fundo por padrão. Resposta correta: toque de ≤500 ms + brilho/efeito visual simultâneo, seguro para silêncio.  
2. **Idades 4-6, erros.** Tom suave, não punitivo (sem zumbidos agressivos) + sinal de retorno amigável, mantido dentro de amplitude segura para `prefers-reduced-motion` mesmo por padrão — este grupo etário é mais sensível a tremores/flash.  
3. **Idades 7-10.** Texto torna-se primário; áudio torna-se opcional, alternável para leitura em voz alta. 2-3 variantes de toque rotativas para evitar monotonia, ≤700 ms, sem animação bloqueadora.  
4. **Idades 11+/adultos.** Áudio desligado por padrão atrás de um prompt explícito “ativar som” (não reprodução automática); celebração mínima (marcação na barra de progresso, não confete) para usuário com baixa distração e alta produtividade.  
5. **Música desligada por padrão em todas as faixas etárias** (§3). Se oferecida, somente mediante opt-in, redução automática para quase silêncio durante a resolução ativa, volume total apenas em telas de menu/ocioso.  
6. **Divisão VO/TTS (§4).** VO gravado para o vocabulário fixo limitado (~150-300 frases) em todas as 5 línguas; `speechSynthesis` (ou clipes concatenados) para leituras de problemas gerados combinatoriamente.  
7. **Desbloqueio de áudio na primeira sessão.** O primeiro toque (um botão “Iniciar”, nunca reprodução automática) funciona também como o gesto que retoma/cria o `AudioContext` compartilhado e dispara um primer quase silencioso, de modo que sons posteriores não tenham atraso perceptível (§9).  
8. **Haptics apenas como acento.** Disparar um toque curto (~40-80 ms) onde `navigator.vibrate` existe (Android Chrome); projetar paridade total usando apenas som+animação para iOS, onde está totalmente ausente (§6).  
9. **Variante `prefers-reduced-motion` para cada celebração**, enviada no mesmo PR que a celebração — um fade/pulsar calmo que preserva o sinal de recompensa sem gatilhos vestibulares (§7).  
10. **Controle de mudo persistente de um toque**, sempre visível, lembrando a última escolha por dispositivo; o loop principal silenciado é um cenário testado de primeira classe, não um detalhe posterior (§8, §10).  
11. **Nenhum feedback apenas sonoro em nenhum lugar** — cada sinal de áudio tem um equivalente visual (e, onde houver texto na tela, textual), verificado a cada novo som adicionado (§10).  
12. **Orçamento de duração da celebração.** Por resposta: áudio ≤500 ms / animação ≤800 ms, não bloqueante. Nível de sessão (sequência/nível concluído): ≤2,5 s total, pulável, nunca impedindo “continuar” além desse limite.  
13. **Orçamento total de tamanho de ativos offline** (meta de trabalho, aguardando confirmação do proprietário): ≤1,5 MB de sprite de efeitos sonoros da UI (independente de idioma) + ≤2-3 MB para o pacote de VO gravado do idioma padrão na instalação, com as outras quatro línguas obtidas/armazenadas sob demanda em vez de incluídas inicialmente. Meta de pegada de áudio na primeira instalação: **menos de 5 MB**.

---

## Perguntas abertas para o dono do projeto
1. Oferecer música de fundo em todas as situações (mesmo opt-in), dado a evidência do §3 contra isso durante a resolução ativa — ou reservá-la estritamente para telas de menu/ocioso?  
2. Existe orçamento/cronograma para VO profissional em todas as 5 línguas para o vocabulário fixo, ou o lançamento deve depender inicialmente de `speechSynthesis` em todo lugar, adicionando VO por idioma depois?  
3. Entregar as 5 línguas no pacote offline inicial, ou incluir apenas o idioma selecionado e buscar os demais sob demanda (minha recomendação de trabalho, veja a implicação 13)?  
4. Qual é o teto de tamanho de ativos offline para o aplicativo inteiro (não apenas áudio) — isso altera o quão agressivo o orçamento de áudio precisa ser?  
5. Para implantações em salas de aula/dispositivos compartilhados, uma configuração de professor/admin deve forçar mudo por padrão ou desativar a alternância de som para estudantes, separada da alternância de usuário por sessão?  
6. Já foi escolhida uma biblioteca licenciada de efeitos sonoros, ou a nota de licenciamento do §11 precisa influenciar uma decisão de aquisição antes que qualquer ativo sonoro seja enviado?

---

## Fontes

1. Steve Swink, *Game Feel: A Game Designer's Guide to Virtual Sensation* (2008) — estrutura para “sensação” via controle, espaço e polimento.  
2. GDC Vault, “Juice It or Lose It” (Martin Jonasson & Petri Purho, GDC Europe 2012) — https://www.gdcvault.com/play/1016487/Juice-It-or-Lose  
3. Wikipedia, “Irrelevant speech effect” — https://en.wikipedia.org/wiki/Irrelevant_speech_effect  
4. Mayer, R. & Moreno, R., “A Cognitive Theory of Multimedia Learning: Implications for Design Principles” (1998) — princípio de coerência (referenciado via https://en.wikipedia.org/wiki/Multimedia_learning).  
5. caniuse.com, “Vibration API” — https://caniuse.com/vibration  
6. MDN, “Vibration API” — https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API  
7. caniuse.com, “Speech Synthesis API” — https://caniuse.com/speech-synthesis  
8. MDN, “SpeechSynthesis” — https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis  
9. Blog de desenvolvedores do Chrome, “Autoplay policy in Chrome” — https://developer.chrome.com/blog/autoplay/  
10. Blog da WebKit, “New Video Policies for iOS” — https://webkit.org/blog/6784/new-video-policies-for-ios/  
11. MDN, “Autoplay guide for media and Web Audio APIs” — https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay  
12. W3C WAI, “Understanding SC 1.2.1: Audio-only and Video-only (Prerecorded)” — https://www.w3.org/WAI/WCAG21/Understanding/audio-only-and-video-only-prerecorded.html  
13. MDN, “prefers-reduced-motion” — https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion  
14. Game Accessibility Guidelines, “Ensure no essential information is conveyed by sounds alone” — http://gameaccessibilityguidelines.com/full-list/  
15. MDN, “Web Audio API” — https://developer.mozilla.org/en-US/docs/Web/Web_Audio_API  
16. caniuse.com, “Web Audio API” — https://caniuse.com/audio-api  
17. web.dev, “Web Audio for games” — https://web.dev/articles/webaudio-games  
18. W3C WAI, “Understanding SC 1.4.2: Audio Control” — https://www.w3.org/WAI/WCAG21/Understanding/audio-control.html
