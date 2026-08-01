# Áudio, música, hápticos, movimento e "juice" nos jogos de aprendizagem

> Math Challenge research — 2026-07-31 — topic 42

## Resumo executivo (ES)

O "juice" (realimentação sensorial exagerada: som, partículas, sacudida de ecrã) faz com que um jogo pareça melhor sem mudar a sua lógica — tese central de *Game Feel* de Steve Swink e da palestra de 2012 "Juice It or Lose It" de Jonasson e Purho [1][2]. Mas Math Challenge é software educativo, e aí surge uma tensão real: o "efeito do som irrelevante" mostra que a fala e a música de fundo degradam a memória de trabalho mesmo quando não se lhes presta atenção consciente [3], e o princípio da coerência de Mayer diz que o material decorativo —incluindo a música de fundo— deve ser eliminado porque compete por recursos cognitivos limitados [4]. Nenhum dos dois lados está errado: o juice ajuda na motivação; a música de fundo durante o cálculo ativo pode prejudicar o desempenho. A solução prática é separar os momentos: silêncio durante a tentativa, juice completo apenas no instante de recompensa/erro.

Para crianças de 4 anos que ainda não leem, o áudio não é decorativo — é o canal de instruções. A Vibration API não funciona no Safari de iOS em nenhuma versão testada, pelo que a vibração não pode ser o canal principal em iPad/iPhone [5][6]. `speechSynthesis` tem amplo suporte nos navegadores, mas a qualidade e disponibilidade de vozes por idioma dependem do sistema operativo, não do navegador [7][8]. As políticas de autoplay bloqueiam qualquer áudio com som antes de um gesto do utilizador [9][10][11] —isto define o ecrã de início—, e a regra de acessibilidade "nenhuma informação essencial apenas por áudio" [12] exige que cada som tenha também um equivalente visual.

## Resumo executivo (EN)

"Juice" — feedback exagerado (som, partículas, sacudida de ecrã) — faz um jogo parecer melhor sem mudar a sua lógica, segundo *Game Feel* de Steve Swink e a palestra de 2012 "Juice It or Lose It" [1][2]. Math Challenge é software de aprendizagem, porém, e surge uma tensão genuína: o efeito do som irrelevante mostra que a fala/música de fundo degrada a memória de trabalho mesmo quando não é atendida [3], e o princípio da coerência de Mayer afirma que o áudio decorativo deve ser removido do material instrucional porque compete por capacidade cognitiva limitada [4]. Ambos estão corretos no seu contexto — o juice ajuda na motivação; o som ambiente durante o cálculo ativo pode prejudicar o desempenho. A solução prática é separar os momentos: silêncio enquanto se resolve, juice completo apenas no instante de recompensa/erro.

Para pré‑leitores de 4 anos, o áudio é o canal de instrução, não decoração. A Vibration API não tem suporte no Safari de iOS em nenhuma versão testada, pelo que não pode ser o canal principal de recompensa em iPad/iPhone [5][6]. `speechSynthesis` tem amplo suporte nos navegadores, mas a qualidade/disponibilidade de vozes por idioma é uma propriedade do SO, não do navegador [7][8]. A política de autoplay bloqueia qualquer áudio sem mute antes de um gesto do utilizador [9][10][11], o que molda o ecrã inicial, e a regra de acessibilidade "sem feedback apenas sonoro" [12] requer um equivalente visual para cada sinal de áudio.

## Constatações

### 1. Game feel e “juice”

*Game Feel* de Steve Swink (2008) enquadra o “feel” como controlo + espaço simulado + acabamento, onde o acabamento inclui som, partículas, vibração de ecrã e easing que comunicam o estado sem alterar as regras [1]. A palestra da GDC Europe de 2012 “Juice It or Lose It” (Jonasson & Purho) é a demonstração prática mais citada: um jogo básico é progressivamente “juizado” com squash‑and‑stretch, partículas, vibração de câmara e som até ficar muito mais satisfatório, sem qualquer mudança mecânica [2]. Para o Math Challenge a conclusão é que o juice é barato e eleva diretamente a recompensa percebida de uma resposta correta — o que importa sobretudo para crianças de 4 anos, cujo envolvimento é impulsionado por recompensa sensorial imediata mais do que por acompanhamento de progresso a longo prazo.

### 2. Sons de recompensa

Um som curto, distinto e com afeto positivo para resposta correta funciona como reforço secundário, tal como os sons de “coin” nos jogos — elogio instantâneo e independente de idioma. Para uma criança de 4 anos, o toque *é* o elogio, entregue antes de qualquer texto poder ser lido. Mantenha esses sons curtos (~300‑500 ms para um tick; até ~1‑2 s para uma celebração maior) para que nunca atrasem a próxima questão.

### 3. Música de fundo: uma tensão genuína e não resolvida

**Contra ela.** O efeito de som irrelevante é um achado robusto da psicologia cognitiva: som de fundo não relacionado — fala, música ou outros estímulos não silenciosos — degrada a recordação sequencial e a memória de trabalho mesmo quando ignorado e não testado [3]. A explicação padrão é que material auditivo variável intrude no ciclo fonológico usado para a repetição verbal, e isso aplica‑se à música, não apenas à fala [3]. O princípio de coerência de Mayer, do *Cognitive Theory of Multimedia Learning*, afirma independentemente que material extrínseco — incluindo música decorativa de fundo — deve ser excluído porque consome capacidade de processamento limitada necessária para a própria lição [4]; é um dos achados mais replicados na investigação de multimédia educativa.

**A favor dela.** Nenhum dos achados argumenta contra som *momentâneo e significativo* — um toque de resposta correta/incorreta, instruções faladas pré‑leitura, um efeito de celebração. Ambos visam decoração *contínua e concorrente*, não feedback ligado a um evento discreto (§1).

**Síntese:** trate “enquanto resolve” e “na resolução” como regimes de áudio separados. Por defeito, silêncio enquanto resolve; se houver música, que seja opcional e desativada por defeito. Na resolução, o som curto de recompensa/erro + animação é o momento de juice — menos de dois segundos, depois o silêncio retoma.

### 4. Áudio para pré‑leitores

Para idades de 4‑6 anos, o texto no ecrã é inacessível sem um adulto, pelo que o áudio é a interface principal, não um aprimoramento. Duas opções:

- **`speechSynthesis` (TTS).** Gratuito, com capacidade offline assim que a voz do SO está instalada, pode ler conteúdo dinâmico (problemas gerados) sem pré‑gravar cada combinação. Mas a qualidade/abrangência da voz depende do SO, não do navegador [7][8]; um dispositivo sem pacote de voz em espanhol ou francês recorre silenciosamente a um padrão inferior, sem API web para forçar a instalação de um.
- **Voz gravada (VO).** Qualidade consistente independentemente do dispositivo, mas fixa e finita — cada frase, por idioma, tem de ser gravada e enviada. Acessível para um vocabulário limitado (etiquetas de menu, “¡Correto!”, números, nomes de operadores); não escala para texto de problema gerado arbitrariamente.

**Híbrido recomendado:** VO gravada para o vocabulário fixo da UI/celebração em todas as 5 línguas; TTS (ou clips VO concatenados) para tudo o que for combinatório (leitura de problemas gerados) — o padrão que a Khan Academy Kids e a Duolingo utilizam na prática.

### 5. Animação de celebração: ajuda ou distrai?

Confetes, contadores de estrelas e animações de mascotes são motivadores extrínsecos por cima da recompensa intrínseca de uma resposta correta. Uma celebração longa e lenta atrasa o próximo problema e corre o risco de se tornar exatamente o tipo de distração extrínseca que a literatura sobre coerência/sons irrelevantes adverte. Uma celebração curta e não bloqueante (menos de ~1,5 s) capta o benefício motivacional sem interromper o fluxo — “pequenas e frequentes batem longas e ocasionais” para sustentar o envolvimento sem deslocar o tempo de tarefa.

### 6. Haptics na web

O suporte a `navigator.vibrate()` é real mas desigual: Chrome (desktop/Android), Edge, Samsung Internet e a maioria dos navegadores Chromium Android suportam; o Firefox desktop só o suportou até à v128, removido a partir de 129+; e — crucialmente — **o Safari iOS nunca o suportou, em nenhuma versão de 3.2 a 26.5** [5][6]. Como qualquer WebView iOS usa WebKit, isto não é um problema de “trocar de navegador”. A vibração é, na melhor das hipóteses, um acento no Android/Chromium, nunca o canal principal de feedback, pois uma parte significativa da frota‑alvo (todos os iPad/iPhone) não recebe nada. Nenhuma API web expõe o Taptic Engine do iOS como alternativa.

### 7. `prefers-reduced-motion`

Esta funcionalidade de media CSS (Baseline desde janeiro de 2020) expõe uma preferência a nível de SO para reduzir movimento não essencial, porque animações de escala/panning são gatilhos conhecidos de distúrbios vestibulares [13]. Cada celebração de alto movimento (confetes, sacudida, salto) precisa de uma alternativa mais calma `prefers-reduced-motion: reduce` (desvanecimento/alteração de cor) que ainda transmita “correto” — nunca simplesmente removendo o feedback.

### 8. Design “mute‑first”

Salas de aula, salas de espera e dispositivos familiares partilhados são contextos onde o áudio costuma ser indesejado independentemente da capacidade da plataforma. Combinado com a política de reprodução automática (§9), o silêncio deve ser a opção segura por defeito, com um controlo de mute persistente, sempre visível e de um toque, e o ciclo principal (ler → responder → ver resultado) deve ser totalmente utilizável em mute — exigência independente do §10 também.

### 9. Política de reprodução automática

Chrome e Safari bloqueiam áudio com som antes de um gesto do utilizador, a menos que esteja em mute [9][10]. O Media Engagement Index do Chrome pode permitir uma origem de desktop visitada frequentemente; a reprodução automática em mute é sempre permitida [9]. O Safari no iOS requer `playsinline` para vídeo em linha e trata vídeo sem som/mudo permissivamente [10][11]. O Firefox expõe preferências granulares por domínio, incluindo uma que bloqueia especificamente a reprodução automática da Web Audio API sem gesto [11]. Na prática: o primeiro som de uma sessão (incluindo instruções faladas) não pode reproduzir‑se automaticamente — coloque‑o atrás de um toque “Iniciar”/“¡Empezar!” e use esse mesmo toque para retomar/criar o `AudioContext` partilhado (mais um buffer de arranque quase silencioso) para que todos os sons subsequentes toquem instantaneamente.

### 10. O feedback nunca pode ser apenas som

WCAG 1.2.1 exige um equivalente baseado em texto para conteúdo apenas áudio, pois o texto pode ser percebido por qualquer modalidade sensorial [12]. As Game Accessibility Guidelines são mais diretas: “garantir que nenhuma informação essencial seja transmitida apenas por sons”, e informação áudio suplementar deve ser replicada em texto/visuais [14]. Para o Math Challenge cada sinal de correto/incorreto, instrução e celebração precisa de uma forma visual (e, quando relevante, textual) que funcione totalmente em mute — restrição também exigida independentemente pelos §§8 e 9.

### 11. Pipeline de ativos

**Sprites.** Agrupe efeitos curtos (correto, errado, tick, tap) num único buffer de sprite de áudio reproduzido via `AudioBufferSourceNode` da Web Audio com offsets, evitando múltiplas pequenas solicitações e sobrecarga de `<audio>` por instância.

**Latência Web Audio vs `<audio>`.** O elemento `<audio>` em dispositivos móveis tem latência/documentada e falhas, além de não suportar filtros, temporização precisa e áudio posicional; a Web Audio API é o caminho de baixa latência para som tipo jogo, enquanto `<audio>` continua útil para streaming de música de fundo longa sem bloquear o download completo — frequentemente interligado via `MediaElementAudioSourceNode` dentro de um `AudioContext` [15][17]. Ambas as APIs têm amplo suporte ao nível Baseline, incluindo Safari iOS [16][7] — ao contrário da vibração, a reprodução de áudio em si não é um risco multiplataforma.

**Orçamento de tamanho de ficheiro.** Meta de trabalho pendente de confirmação do proprietário: sons de UI/feedback curtos ~10‑30 KB cada (comprimidos, num sprite); um vocabulário gravado de VO limitado (~150‑300 frases) ~15‑40 KB cada gera vários MB por idioma — o maior motor de ativos offline se todas as 5 línguas forem instaladas. Melhor: agrupar apenas a língua selecionada na instalação, buscar em lazy‑fetch/cache as restantes via service worker sob demanda.

**Licenciamento.** Efeitos sonoros de UI costumam provir de bibliotecas royalty‑free/CC0 ou áudio comissionado; confirme atribuição e termos de uso comercial por ativo. VO gravada requer acordo interno com talento ou contrato com fornecedor comercial de VO que inclua direitos de uso comercial e re‑gravação — decisão de aquisição para o proprietário, não resolúvel a partir de documentos públicos.

## Tabela de capacidades da plataforma

| Capacidade | iOS Safari | Android Chrome | Desktop (Chrome/Edge/Firefox/Safari) | Fonte |
|---|---|---|---|---|
| **Vibration API** (`navigator.vibrate`) | **Não suportado**, todas as versões 3.2–26.5 testadas | Suportado (atual) | Chrome v30+/Edge v79+ suportado; Firefox v11–128 **apenas**, removido a partir de 129+; Safari desktop não suportado | caniuse.com/vibration [5]; MDN [6] |
| **Web Audio API** | Suportado desde Safari 6 | Suportado (atual) | Chrome v14+, Edge v12+, Firefox v25+, Safari v6+ todos suportados | caniuse.com/audio-api [16]; MDN [15] |
| **Autoplay (audio with sound)** | Bloqueado antes de gesto; vídeo sem som ou silenciado pode reproduzir‑se automaticamente; `playsinline` necessário em linha | Bloqueado antes de gesto a menos que silenciado; Chrome MEI pode permitir origens frequentes | Chrome/Edge: bloqueado a menos que silenciado/gesto/MEI; Firefox: preferências granulares por domínio; Safari desktop: mesma política que iOS | WebKit blog [10]; Chrome blog [9]; MDN [11] |
| **`speechSynthesis`** | Suportado desde Safari 7; **contagem/qualidade de vozes por idioma é propriedade do SO** | Suportado (atual); o navegador de sistema Android não o possui | Chrome v33+, Edge v14+, Firefox v49+, Safari v7+ todos suportados | caniuse.com/speech-synthesis [7]; MDN [8] |

Os inventários de vozes por idioma (EN/ES/FR/PT/DE) não podem ser enumerados apenas a partir da documentação — devem ser verificados no SO/dispositivo alvo durante a implementação [7][8].

---

## Implicações de design

1. **Idades 4‑6.** Cada instrução é áudio (VO gravado, §4) mais um pictograma grande — nunca apenas texto. Música de fundo desativada por defeito. Resposta correta: toque de ≤500 ms + brilho/rebote visual simultâneo, sem som intrusivo.  
2. **Idades 4‑6, erros.** Tom suave, não punitivo (sem zumbidos agressivos) + sinal de retorno amigável, mantido dentro de amplitude segura para `prefers-reduced-motion` mesmo por defeito — este grupo etário é mais sensível a vibrações/flash.  
3. **Idades 7‑10.** O texto torna‑se principal; o áudio torna‑se opcional e comutável para leitura em voz alta. 2‑3 variantes de toque rotativas para evitar monotonia, ≤700 ms, sem animação bloqueadora.  
4. **Idades 11+/adultos.** Áudio desativado por defeito atrás de um prompt explícito “som ligado” (não autoplay); celebração mínima (marcador de barra de progresso, não confete) para um utilizador de baixa distração e alta rapidez.  
5. **Música desativada por defeito em todas as faixas etárias** (§3). Se oferecida, apenas por opt‑in, com redução automática para quase silêncio durante a resolução ativa, volume total apenas em ecrãs de menu/repouso.  
6. **Divisão VO/TTS (§4).** VO gravado para o vocabulário fixo limitado (~150‑300 frases) em todas as 5 línguas; `speechSynthesis` (ou clips concatenados) para leituras de problemas gerados combinatoriamente.  
7. **Desbloqueio de áudio na primeira sessão.** O primeiro toque (botão “Iniciar”, nunca autoplay) serve também como gesto que cria/recria o `AudioContext` partilhado e dispara um primer quase silencioso, de modo que sons posteriores não tenham atraso perceptível (§9).  
8. **Haptics apenas como acento.** Emitir um curto (~40‑80 ms) toque onde `navigator.vibrate` exista (Android Chrome); garantir paridade total via som+animação para iOS, onde está totalmente ausente (§6).  
9. **Variante `prefers-reduced-motion` para cada celebração**, enviada no mesmo PR que a celebração — um desvanecimento/pulsar calmo que preserva o sinal de recompensa sem gatilhos vestibulares (§7).  
10. **Controlo de silêncio persistente de um toque**, sempre visível, lembrando a última escolha por dispositivo; o ciclo principal silenciado é um cenário testado de primeira classe, não um adendo (§8, §10).  
11. **Nenhum feedback apenas sonoro** — cada sinal áudio acompanha um equivalente visual (e, quando o texto está no ecrã, equivalente textual), verificado a cada novo som adicionado (§10).  
12. **Orçamento de duração da celebração.** Por resposta: ≤500 ms áudio / ≤800 ms animação, não bloqueante. A nível de sessão (sequência/nível concluído): ≤2,5 s total, saltável, nunca a impedir “continuar” após esse limite.  
13. **Orçamento total de tamanho de ativos offline** (meta de trabalho, aguardando confirmação do proprietário): ≤1,5 MB de sprite de efeitos sonoros UI (independente de idioma) + ≤2‑3 MB para o pacote de VO gravado da língua padrão na instalação, com as outras quatro línguas obtidas/em cache sob demanda em vez de incluídas inicialmente. Meta de pegada de áudio na primeira instalação: **menos de 5 MB**.

---

## Questões abertas para o proprietário do projeto

1. Oferecer música de fundo em todas as situações (mesmo por opt‑in), dado que a evidência do §3 indica o contrário durante a resolução ativa — ou reservá‑la estritamente para ecrãs de menu/repouso?  
2. Existe orçamento/cronograma para VO profissional em todas as 5 línguas para o vocabulário fixo, ou o lançamento deve depender inicialmente de `speechSynthesis` em todo o lado, adicionando VO por idioma mais tarde?  
3. Incluir as 5 línguas no pacote offline inicial, ou apenas a língua selecionada e obter as demais sob demanda (recomendação de trabalho, ver implicação 13)?  
4. Qual é o teto de tamanho de ativos offline para a aplicação completa (não apenas áudio) — isto altera a agressividade necessária do orçamento de áudio?  
5. Para implantações em salas de aula/dispositivos partilhados, deve uma definição de professor/admin forçar silêncio por defeito ou desativar o interruptor de som para os estudantes, separada do interruptor de utilizador por sessão?  
6. Já foi escolhida uma biblioteca licenciada de efeitos sonoros, ou a nota de licenciamento do §11 precisa orientar uma decisão de aquisição antes de qualquer ativo sonoro ser enviado?

---

## Fontes

1. Steve Swink, *Game Feel: A Game Designer's Guide to Virtual Sensation* (2008) — estrutura para “sensação” através de controlo, espaço e polimento.  
2. GDC Vault, “Juice It or Lose It” (Martin Jonasson & Petri Purho, GDC Europe 2012) — https://www.gdcvault.com/play/1016487/Juice-It-or-Lose  
3. Wikipedia, “Irrelevant speech effect” — https://en.wikipedia.org/wiki/Irrelevant_speech_effect  
4. Mayer, R. & Moreno, R., “A Cognitive Theory of Multimedia Learning: Implications for Design Principles” (1998) — princípio da coerência (referenciado via https://en.wikipedia.org/wiki/Multimedia_learning).  
5. caniuse.com, “Vibration API” — https://caniuse.com/vibration  
6. MDN, “Vibration API” — https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API  
7. caniuse.com, “Speech Synthesis API” — https://caniuse.com/speech-synthesis  
8. MDN, “SpeechSynthesis” — https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis  
9. Chrome Developers blog, “Autoplay policy in Chrome” — https://developer.chrome.com/blog/autoplay/  
10. WebKit blog, “New Video Policies for iOS” — https://webkit.org/blog/6784/new-video-policies-for-ios/  
11. MDN, “Autoplay guide for media and Web Audio APIs” — https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay  
12. W3C WAI, “Understanding SC 1.2.1: Audio-only and Video-only (Prerecorded)” — https://www.w3.org/WAI/WCAG21/Understanding/audio-only-and-video-only-prerecorded.html  
13. MDN, “prefers-reduced-motion” — https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion  
14. Game Accessibility Guidelines, “Ensure no essential information is conveyed by sounds alone” — http://gameaccessibilityguidelines.com/full-list/  
15. MDN, “Web Audio API” — https://developer.mozilla.org/en-US/docs/Web/Web_Audio_API  
16. caniuse.com, “Web Audio API” — https://caniuse.com/audio-api  
17. web.dev, “Web Audio for games” — https://web.dev/articles/webaudio-games  
18. W3C WAI, “Understanding SC 1.4.2: Audio Control” — https://www.w3.org/WAI/WCAG21/Understanding/audio-control.html
