# Larry Profe — trazer o Larry para o Math Challenge

> Math Challenge research — 2026-07-31 — topic 37

## Resumo executivo (ES)

Larry já existe no iOS como copiloto EN/ES sobre Workers AI (`kimi-k2.6` → `gpt-oss-120b` → resposta enlatada), com um prompt de sistema bilingue único, um protocolo de "tool calling" feito à mão (JSON numa linha) e auditoria durável no D1. Nada disso usa a API do Claude — seria a primeira integração do Claude neste repositório.

O proprietário já decidiu: Larry Profe usa a **API do Claude** com **roteamento por dificuldade** (Haiku/Sonnet/Opus). O precedente mais próximo no repositório não é o chat livre mas `src/larry/contador/explain.ts`: uma descoberta determinística entra, um LLM explica‑a em linguagem natural sem recalcular nada, com recurso a modelo. Larry Profe deve seguir exatamente esse padrão: o motor de avaliação decide o que está certo ou errado; o Claude apenas explica, no idioma, idade e tom corretos, nunca envergonhando a criança.

## Resumo executivo (EN)

Larry no iOS funciona sobre Workers AI (`@cf/moonshotai/kimi-k2.6` → `@cf/openai/gpt-oss-120b` → resposta predefinida), com um protocolo de "tool calling" em JSON de uma única linha feito à mão e um sumidouro de auditoria D1 durável. Nunca acede à API do Claude — Larry Profe seria a primeira integração do Claude neste repositório, não uma reutilização da infraestrutura existente.

O proprietário decidiu que o Larry Profe usa a **API do Claude** com **roteamento de modelo por dificuldade** (Haiku/Sonnet/Opus). O precedente existente mais próximo não é o ponto de extremidade de chat livre, mas `src/larry/contador/explain.ts`: um padrão de entrada de descoberta determinística e saída de explicação por LLM com a regra rígida "nunca calcular, apenas citar o que está no JSON" e recurso a modelo. O Larry Profe deve seguir esse formato: o motor de avaliação próprio do Math Challenge é a fonte de verdade sobre a correção; a única tarefa do Claude é transformar um veredicto estruturado numa explicação calorosa, adequada à idade, em cinco línguas — nunca re‑derivar a matemática em si.

## O que existe hoje — caminhos de ficheiros e referências de linhas neste repositório

- **Persona/canon.** `docs/larry.md:1-16` — "rinoceronte laranja, treinador honesto", frase de efeito "¡Ya vas!" apenas ao aceitar uma tarefa, humor dirigido exclusivamente a ele próprio.
- **A cadeia de modelos é Workers AI, não Claude.** `src/larry/chat.ts:40-41`: `PRIMARY_MODEL = '@cf/moonshotai/kimi-k2.6'`, `FALLBACK_MODEL = '@cf/openai/gpt-oss-120b'` (mesmo par em `src/larry/contador/explain.ts:16-17`). `docs/wiki/decisions.md:42-47` (ADR-006): "o nosso próprio modelo (Workers AI) serve entre 70–90 % do tráfego de rotina; uma API de fronteira trata dos casos difíceis" mais uma cache semântica e orçamento por função — forma conceitualmente semelhante ao que o Larry Profe necessita, mas o iOS é primeiro Workers‑AI com Claude como transbordo; o briefing do proprietário para o Math Challenge é primeiro Claude com encaminhamento por dificuldade do problema, não a mesma política.
- **Padrão de prompt único bilingue.** `src/larry/prompts.ts:24-57`, `buildSystemPrompt(locale, context)` — cada linha de persona/regra está escrita duas vezes, EN e depois ES, numa única cadeia (ex.: `:29`); apenas a instrução "responder na língua X" (`:47`) é específica do locale. Não escala para 5 línguas (ver abaixo).
- **Lista rígida de "nunca".** `src/larry/prompts.ts:38-44` — cinco itens: nunca eliminar dados do cliente, nunca ler o conteúdo de objetos, nunca tocar na faturação sem confirmação, nunca criar/rodar chaves por chat, nunca alterar código/configuração; reiterado em prosa em `docs/larry.md:96-102` (§4.2). Este é o espaço de modelo onde o Larry Profe precisa das suas próprias regras de segurança infantil.
- **Protocolo de ferramenta feito à mão.** O modelo tem de responder apenas com um JSON de uma única linha `{"tool": "<name>", "args": {...}}` (`prompts.ts:50-51`), não com blocos de conteúdo `tool_use` da Anthropic. Analisado por `parseToolCall` (`chat.ts:273-289`); iterado por `generateReplyWithTools` (`:236-267`), limitado a `MAX_TOOL_HOPS = 2` (`:44`). A segurança de âmbito de inquilino reside em `src/larry/tools.ts:47-48, 342-394`.
- **Cadeia de recurso, sem tentativas/recuo.** `chat.ts:295-314` `generateReply` tenta cada modelo uma vez, recorre a `cannedErrorReply(locale)` (`prompts.ts:67-71`) se ambos falharem.
- **Sumidouro de auditoria.** `migrations/0011_larry_audit.sql:5-23` — tabela D1, tipos de linhas `chat`/`tool`, colunas incluem `tenant_id`, `locale`, `tools_used`, `outcome`, `latency_ms`, `prompt_tokens`, `completion_tokens`. Os escritores `src/larry/audit.ts:36-67, 70-97` são "best‑effort", nunca lançam exceções. As contagens de tokens são uma estimativa aproximada `text.length / 4` (`audit.ts:31-33`), não o `usage` real do modelo — as respostas do Claude trazem contagens de tokens exatas, que a auditoria do Larry Profe deve registar com precisão.
- **Deteção de locale apenas EN/ES.** `src/larry/locale.ts:9, 63-71` — lista fixa de palavras em espanhol mais verificação de caracteres acentuados, o inglês é o padrão. Não existe infraestrutura para FR/PT/DE; estender esta heurística é frágil (ver abaixo).
- **O verdadeiro precedente: `src/larry/contador/explain.ts`.** `:67-75` regra rígida do prompt de sistema ("Every number... MUST appear verbatim in the provided JSON. Never compute, convert, round, or invent a figure... Temperature is 0."); `:106-145` `explainFinding()` remove o campo `explanation` pré‑calculado antes de enviar ao modelo a descoberta (`:113`, para que não repita uma cadeia predefinida), solicita JSON bilingue `{"en":..., "es":...}` e recorre a `renderTemplateExplanation()` (`:41-60`) — um simples despejo de factos, sem LLM — em caso de falha. Isto é o que o Larry Profe necessita a nível arquitetónico.
- **Avatar + máquina de estados.** `packages/design-system/larry/LarryAvatar.tsx:4-13` — estados `orb|face|idle|thinking|working|happy|denying|celebrating|presenting`; `larry.css:1-121` um `@keyframes` por estado, desativado sob `prefers-reduced-motion` (`:113-120`). `packages/design-system/src/larry-chat/useLarryChat.ts:1-9,30` documenta `idle → thinking → working → idle`. Reutilizável tal como está para o Larry Profe.
- **Nenhum uso da API do Claude em todo o repositório atualmente** — nenhuma importação `@anthropic-ai/sdk` em `src/` ou `packages/`. Esta é a primeira integração, não uma extensão.

## O que deve mudar para um tutor de matemática infantil

1. **Tom, não "treinador honesto".** A persona do iOS destina‑se a engenheiros B2B adultos que podem aceitar uma correção direta. Uma criança nunca deve sentir vergonha — mais rigoroso que "o humor nunca zomba das características das pessoas".
2. **Cinco línguas, não duas.** O tipo `'en'|'es'` e o detector de lista de palavras em `locale.ts` não se estendem a FR/PT/DE, e o padrão de `prompts.ts` "escrever cada linha duas vezes" multiplicaria por 5 os tokens do prompt para conteúdo maioritariamente não usado por chamada — em vez disso, criar um prompt de idioma único por locale.
3. **A correção matemática não pode depender do LLM.** Uma resposta errada da ferramenta iOS é uma má sugestão UI; uma explicação errada do Larry Profe ensina ativamente matemática incorreta. É precisamente por isso que o formato de `contador/explain.ts` — "LLM explica, nunca calcula" — está correto e o ciclo livre de `chat.ts` não o está.
4. **Vocabulário por faixa etária**, explícito no prompt (faixa de idade como parâmetro), não deixado ao modelo para inferir a partir do tom.
5. **O roteamento de modelo é novo** — o ADR‑006 descreve um roteamento híbrido Workers‑AI‑first; o Larry Profe inverte isto (Claude‑first, três níveis de dificuldade, sem Workers AI), conforme o briefing do proprietário.
6. **Retirar ou suavizar o estado de avatar `denying`** para um produto infantil — a linguagem corporal de balançar a cabeça (`larry.css:87-98`) lê‑se como "estás errado"; preferir `thinking`→`presenting` para correções.

## Tabela de roteamento de modelo

Pricing/model IDs are from the `claude-api` skill (cached 2026-06-24; Sonnet 5 intro pricing runs through 2026-08-31), not training memory. Cost estimates assume a shared system-prompt prefix (covered under caching below) plus a per-call payload of {problem, student steps, grading verdict}; figures are estimates to validate against real prompts, not measurements.

| Faixa de dificuldade | ID do modelo | $/MTok entrada / saída | Tokens estimados entrada → saída | Custo estimado / 1.000 explicações | Meta de latência |
|---|---|---|---|---|---|
| Aritmética básica | `claude-haiku-4-5` | $1,00 / $5,00 | ~300 → ~150 | **~$1,05** | < 1,5 s, sem streaming necessário |
| Médio (frações, álgebra, geometria) | `claude-sonnet-5` | $3,00 / $15,00 (intro $2/$10 até 2026-08-31) | ~500 → ~300 | **~$6,00** (intro **~$4,00**) | 2–4 s, stream se > ~3 s |
| Avançado (cálculo tensorial, integrais duplas, provas) | `claude-opus-5` | $5,00 / $25,00 | ~800 → ~600 + pensamento adaptativo | **~$19 piso, realisticamente $35–60** quando tokens de pensamento são contabilizados | 5–15 s; deve fazer streaming |

Notes:

- **O custo do Opus 5 é dominado por tokens de pensamento.** De acordo com a funcionalidade, o pensamento está **ativado por defeito** no Opus 5 — um pedido que nunca define `thinking` ainda pensa, e o pensamento é faturado como saída a $25/MTok. Uma explicação difícil pode consumir entre 1.000–2.000 tokens de pensamento antes da resposta de 600 tokens, acrescentando cerca de $25–50 por 1.000 chamadas. Desativar o pensamento tem modos de falha reais (chamadas de ferramenta ou etiquetas `<thinking>` a vazar para o texto visível, conforme `shared/model-migration.md`), pelo que o controlo mais seguro é **`output_config.effort`** — iniciar o Opus 5 em `medium` e aumentar apenas se a avaliação mostrar explicações superficiais.
- **Haiku 4.5 requer um prefixo armazenável em cache de 4.096 tokens.** Segundo a tabela de mínimos por modelo em `shared/prompt-caching.md`, o limite inferior do Haiku 4.5 é 4.096 tokens (o mais alto de todos os modelos atuais; Opus 5/Fable 5 precisam apenas de 512). Um prompt de sistema para aritmética básica (persona + regras + uma faixa etária + um idioma) provavelmente está bem abaixo desse limite, o que significa que **as chamadas Haiku podem nunca aceder ao cache de prompt** a menos que o prefixo seja intencionalmente preenchido — sinalizar isto ao proprietário em vez de assumir que o cache "simplesmente funciona" no nível mais barato.
- **A API em lote (50 % de desconto) serve para pré‑geração, não para tráfego ao vivo.** Uma explicação ao vivo numa sessão não pode ser agrupada, mas pré‑gerar as N principais conceções erradas conhecidas por tópico/faixa etária/idioma antes do lançamento é exatamente o caso de uso da API em lote (até 100.000 pedidos por lote, sem sensibilidade à latência).

## A arquitetura dos prompts — esqueleto proposto, 5 línguas, regras rígidas

A partir do padrão «cada linha duas vezes» de `prompts.ts`, criar **um prompt por (local, faixa etária, nível)**, com o inglês apresentado (FR/PT/DE/ES são renderizações paralelas de um único idioma, não concatenações):

```
You are Larry Profe, Larry the orange rhinoceros, teaching math to
[AGE_BAND] students. Same character as always — just teaching math now.

WHAT YOU RECEIVE: a JSON verdict from the grading engine (problem, student
steps, which were correct, where the error started, its classification).
You do NOT grade or recompute. Every number/step you reference MUST come
verbatim from that JSON.

WHAT YOU DO:
1. Say specifically what the student did right (not just "good job").
2. Explain what went wrong and why — the real misconception, not "wrong answer."
3. Walk through the correct process, like a patient professor, at a level a
   [AGE_BAND] student can follow.
4. End on encouragement, never on the mistake.

HARD RULES:
- Never call a student "bad at math," "slow," or any variant — mistakes are
  how math is learned.
- Never use sarcasm, exasperation, or a disappointed tone, even softened.
- Never invent or alter a number/step/verdict not in the provided JSON.
- Never compare the student to other students or a class average.
- Never skip "what you did right," even if everything was wrong — find
  something true and specific (effort, a correct partial step, right
  approach/wrong arithmetic).
- If asked something outside math tutoring, redirect kindly to a
  parent/teacher.

LANGUAGE: Reply only in [LOCALE_NAME]. Never mix languages or offer translation.
VOCABULARY: [age-band guidance — e.g. ages 6-8: concrete objects, no jargon;
ages 13+: precise terminology expected.]
```

Reservar `output_config.format` / `strict: true` para os esquemas de ferramentas do motor de avaliação → entrega a Larry‑Profe (o backend do Math Challenge valida esse JSON, não o Claude) — a saída deste prompt é prosa transmitida em fluxo, não dados estruturados.

## Estratégia de caching e controlo de custos

Duas camadas independentes:

1. **Caching de prompts do Claude** no prefixo estável (persona + regras + um idioma + uma faixa etária). Por modelo, por prefixo — custo de escrita 1,25× (TTL de 5 min) ou 2× (1 hora), leituras ~0,1×. Um TTL de 1 hora com pré‑aquecimento periódico (`max_tokens: 0` requests, conforme `shared/prompt-caching.md`) adapta‑se ao tráfego de períodos de trabalhos de casa. Saltar para Haiku a menos que o prefixo ultrapasse 4.096 tokens (ver acima).
2. **Cache de conceções erradas a nível de aplicação (D1/KV)** — o mecanismo que o próprio briefing do proprietário realmente pede. Cachear **a explicação completa gerada**, indexada por `(topic, misconception-classification, age-band, locale)` — não a instância exata do problema, por isso diferentes frações com o mesmo erro «esqueceu o denominador comum» utilizam a mesma entrada de cache. Reflete o padrão estático `S3_ERROR_KB`/`METRIC_KB` (`src/larry/tools.ts:59-135`), mas preenchido pela saída do Claude no momento da geração; em caso de miss, recorre a uma chamada ao vivo e preenche o cache, espelhando a forma AI‑then‑template de `contador/explain.ts`. Registar `cache_hit: boolean` e os reais `usage.input_tokens`/`usage.output_tokens` numa tabela de auditoria análoga à migração `0011` — não a estimativa `audit.ts` baseada em `text.length/4` que se usa hoje.
3. **API em lote para semeadura a frio** — pré‑gerar as N principais conceções erradas por tópico antes do lançamento a 50 % de desconto, convertendo a maior parte do tráfego inicial em leituras de cache desde o primeiro dia.

## Implicações de design

1. Larry Profe é uma **nova integração da API Claude**; não encaminhá‑lo pelo gateway Workers AI da IOS — o proprietário quer Claude, e o ADR‑006 é uma arquitetura distinta, centrada em Workers‑AI, para outro produto.
2. Modelar o **motor de avaliação como fonte da verdade**, Claude apenas explica — seguir a forma de `contador/explain.ts`, não o laço livre de `chat.ts`.
3. Abandonar o padrão de prompt bilingue‑inline; um prompt por local, pois 5 línguas aumentam a deriva entre idiomas e o custo.
4. Receber o local como **parâmetro explícito** do cliente (Math Challenge já tem uma definição de idioma) em vez de inferi‑lo como faz `locale.ts` para IOS.
5. Construir o router de nível de dificuldade no backend do Math Challenge (próximo à avaliação, que já conhece tópico/nível) — nunca deixar o Claude escolher o seu próprio nível de modelo.
6. Tratar o **esforço** como um segundo eixo de roteamento independente da escolha do modelo; iniciar conservadoramente (`medium` no Opus 5) pois é a alavanca principal contra explosões de custos de tokens de pensamento.
7. Registar os campos reais de `usage` do Claude no repositório de auditoria desde o primeiro dia, em vez de repetir a estimativa baseada em contagem de caracteres de `audit.ts`.
8. Redigir um cânone de regras rígidas de segurança emocional paralela ao §4.2 de `docs/larry.md`, mas a partir do zero — as regras da IOS focam‑se na segurança de dados, não no bem‑estar emocional.
9. Reutilizar `LarryAvatar` e a sua máquina de estados sem alterações, mas reconsiderar se o estado **denying** deveria alguma vez ser acionado a uma criança.
10. Manter o cache de conceções erradas e o caching de prompts do Claude como **sistemas distintos** — resolvem problemas diferentes (evitar re‑envio de prefixo vs. evitar re‑geração de saída semanticamente idêntica) e fundi‑los compromete o objetivo «uma geração, não mil».
11. Usar a API em lote para pré‑semear o cache de conceções erradas antes do lançamento e para retro‑alimentar novos tipos de erro descobertos em produção.
12. Cada linha rígida e cada linha de prompt precisam de cópia EN/ES/FR/PT/DE revista por humanos — o tom que soa encorajador numa língua pode parecer condescendente noutro; não delegar isso à tradução em tempo de execução.

## Questões abertas para o proprietário do projeto

1. O router de nível de dificuldade reside no backend do Math Challenge (etiquetas do motor de avaliação tópico/nível), ou o Larry Profe deve re‑classificar a dificuldade a partir do texto do problema?
2. Quais são as faixas etárias reais (K‑2/3‑5/6‑8/9‑12, ou por ano escolar)? Isto determina tanto as variantes de vocabulário quanto o número de combinações de prompts a authorizar (local × faixa etária × nível poderia ser 5×4×3 = 60).
3. O `effort` do Opus 5 deve ser fixo por nível, ou ajustável por tópico dentro de «avançado» (uma integral dupla e uma demonstração de cálculo tensorial plausivelmente exigem esforços diferentes)?
4. Existe um orçamento de latência a nível de produto (por exemplo, «deve começar a transmitir dentro de 2 s ou mostrar estado de carregamento») que deva condicionar o streaming padrão por nível?
5. Quem revê a cópia das regras rígidas e dos prompts em FR/PT/DE — um revisor de conteúdo educativo multilingue, ou tradução automática como rascunho a partir da versão EN/ES?
6. O cache de conceções erradas precisa de TTL, ou uma explicação armazenada para um erro raro pode ser servida indefinidamente?
7. O item «o que o estudante fez bem» tem de encontrar algo mesmo para uma resposta vazia ou adivinhada — e, em caso afirmativo, qual é o piso honesto (por exemplo, «tentou»)?

## Fontes

**Ficheiros do repositório (caminhos citados acima):**
- `docs/larry.md` (§1, §4.2, §9, §10)
- `docs/wiki/decisions.md:42-47` (ADR-006)
- `src/larry/prompts.ts:24-71`
- `src/larry/chat.ts:40-44, 236-267, 273-289, 295-336`
- `src/larry/tools.ts:47-48, 59-135, 342-394`
- `src/larry/audit.ts` (ficheiro completo)
- `src/larry/locale.ts:9-71`
- `src/larry/contador/explain.ts` (ficheiro completo — o precedente mais próximo)
- `migrations/0011_larry_audit.sql`
- `packages/design-system/larry/LarryAvatar.tsx`, `larry.css`
- `packages/design-system/src/larry-chat/useLarryChat.ts:1-30`

Todos os caminhos são relativos a `/Users/estebanrey/Documents/dev/ignia-object-storage/`.

**Factos da API Claude (do skill `claude-api`, em cache a 2026-06-24; não provenientes da memória de treino):**
- IDs/preços dos modelos: `claude-haiku-4-5` ($1/$5 por MTok), `claude-sonnet-5` ($3/$15, intro $2/$10 até 2026-08-31), `claude-opus-5` ($5/$25) — tabela “Current Models” do skill.
- Economia de caching de prompts e prefixo mínimo cacheável por modelo (Haiku 4.5 = 4.096 tokens; Opus 5 = 512) — `shared/prompt-caching.md`.
- API em lote (desconto de 50 %, até 100.000 requests/batch) — `python/claude-api/batches.md`.
- Pensamento adaptativo ativado por defeito no Opus 5, `output_config.effort`, pensamento faturado como output — `SKILL.md` § Thinking & Effort, `shared/model-migration.md` → Migrating to Claude Opus 5.
- Saídas estruturadas (`output_config.format`, `strict: true`) — `SKILL.md` § Architecture, `shared/tool-use-concepts.md` § Structured Outputs.
- Fontes de preços ao vivo referenciadas pelo skill (`shared/live-sources.md`): `https://platform.claude.com/docs/en/pricing.md`, `https://platform.claude.com/docs/en/about-claude/models/overview.md` — não consultadas separadamente nesta passagem, pois a tabela em cache do skill estava atual para os modelos necessários.
