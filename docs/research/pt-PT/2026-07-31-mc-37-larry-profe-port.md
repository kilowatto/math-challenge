# Larry Profe — trazer o Larry para o Math Challenge

> Math Challenge research — 2026-07-31 — topic 37
> pesquisa Math Challenge — 2026-07-31 — tópico 37

## Resumo executivo (ES)

Larry já existe no iOS como copiloto EN/ES sobre Workers AI (`kimi-k2.6` → `gpt-oss-120b` → resposta enlatada), com um prompt de sistema bilingue único, um protocolo de "tool calling" feito à mão (JSON numa linha) e auditoria durável no D1. Nada disso usa a API do Claude — seria a primeira integração do Claude neste repositório.

O proprietário já decidiu: Larry Profe usa a **API do Claude** com **encaminhamento por dificuldade** (Haiku/Sonnet/Opus). O precedente mais próximo no repositório não é o chat livre, mas `src/larry/contador/explain.ts`: uma descoberta determinística entra, um LLM explica-a em linguagem natural sem recalcular nada, com recurso a modelo. Larry Profe deve seguir exatamente esse padrão: o motor de avaliação decide o que está certo ou errado; Claude apenas explica, no idioma, idade e tom corretos, nunca envergonhando a criança.

## Resumo executivo (EN)

Larry no iOS funciona sobre Workers AI (`@cf/moonshotai/kimi-k2.6` → `@cf/openai/gpt-oss-120b` → resposta predefinida), com um protocolo artesanal de chamada de ferramenta em JSON de uma única linha e um depósito de auditoria D1 durável. Nunca acede à API do Claude — Larry Profe seria a primeira integração do Claude neste repositório, não uma reutilização da infraestrutura existente.

O proprietário decidiu que o Larry Profe usa a **API do Claude** com **encaminhamento de modelo por dificuldade** (Haiku/Sonnet/Opus). O precedente existente mais próximo não é o ponto de extremidade de chat livre, mas `src/larry/contador/explain.ts`: um padrão de entrada de descoberta determinística e saída de explicação por LLM, com a regra rígida "nunca calcular, apenas citar o que está no JSON" e um recurso a modelo. Larry Profe deve seguir esse formato: o motor de avaliação próprio do Math Challenge é a fonte da verdade sobre a correção; a única tarefa do Claude é transformar um veredicto estruturado numa explicação calorosa, adequada à idade, em cinco línguas — nunca re‑derivar a matemática em si.

## O que existe hoje — caminhos de ficheiros e referências de linhas deste repositório

- **Persona/canon.** `docs/larry.md:1-16` — "rinoceronte laranja, treinador honesto", frase de efeito "¡Ya vas!" apenas ao aceitar uma tarefa, humor dirigido exclusivamente a ele próprio.
- **A cadeia de modelos é Workers AI, não Claude.** `src/larry/chat.ts:40-41`: `PRIMARY_MODEL = '@cf/moonshotai/kimi-k2.6'`, `FALLBACK_MODEL = '@cf/openai/gpt-oss-120b'` (mesmo par em `src/larry/contador/explain.ts:16-17`). `docs/wiki/decisions.md:42-47` (ADR-006): "nosso próprio modelo (Workers AI) serve os 70–90 % de tráfego rotineiro; uma API de fronteira trata dos casos difíceis" mais um cache semântico e orçamento por função — forma conceitualmente semelhante ao que o Larry Profe necessita, mas o iOS é primeiro Workers‑AI com Claude como transbordo; o briefing do proprietário para o Math Challenge é primeiro Claude com encaminhamento por dificuldade do problema, não a mesma política.
- **Padrão de prompt único bilingue.** `src/larry/prompts.ts:24-57`, `buildSystemPrompt(locale, context)` — cada linha de persona/regra está escrita duas vezes, EN depois ES, numa única string (ex.: `:29`); apenas a instrução "responder na língua X" (`:47`) é específica do locale. Não escala para 5 línguas (ver abaixo).
- **Lista rígida de "nunca".** `src/larry/prompts.ts:38-44` — cinco itens: nunca eliminar dados do cliente, nunca ler conteúdos de objetos, nunca tocar na faturação sem confirmação, nunca criar/rodar chaves por chat, nunca alterar código/configuração; reiterado em prosa em `docs/larry.md:96-102` (§ 4.2). Este é o espaço de modelo onde o Larry Profe precisa das suas próprias regras de segurança infantil.
- **Protocolo artesanal de ferramenta.** O modelo deve responder apenas com um JSON de uma única linha `{"tool": "<name>", "args": {...}}` (`prompts.ts:50-51`), não com blocos de conteúdo `tool_use` da Anthropic. Analisado por `parseToolCall` (`chat.ts:273-289`); iterado por `generateReplyWithTools` (`:236-267`), limitado a `MAX_TOOL_HOPS = 2` (`:44`). A segurança de escopo de inquilino reside em `src/larry/tools.ts:47-48, 342-394`.
- **Cadeia de recurso, sem repetição/retardo.** `chat.ts:295-314` `generateReply` tenta cada modelo uma vez, recorre a `cannedErrorReply(locale)` (`prompts.ts:67-71`) se ambos falharem.
- **Depósito de auditoria.** `migrations/0011_larry_audit.sql:5-23` — tabela D1, tipos de linhas `chat`/`tool`, colunas incluem `tenant_id`, `locale`, `tools_used`, `outcome`, `latency_ms`, `prompt_tokens`, `completion_tokens`. Os escritores `src/larry/audit.ts:36-67, 70-97` são best‑effort, nunca lançam exceções. As contagens de tokens são uma estimativa aproximada `text.length / 4` (`audit.ts:31-33`), não o `usage` real do modelo — as respostas do Claude trazem contagens de tokens exatas, que a auditoria do Larry Profe deve registar com precisão.
- **Deteção de locale apenas EN/ES.** `src/larry/locale.ts:9, 63-71` — lista fixa de palavras em espanhol mais verificação de caracteres acentuados, o inglês é o padrão. Não existe infraestrutura para FR/PT/DE; estender esta heurística é frágil (ver abaixo).
- **O verdadeiro precedente: `src/larry/contador/explain.ts`.** `:67-75` regra rígida do prompt do sistema ("Every number... MUST appear verbatim in the provided JSON. Never compute, convert, round, or invent a figure... Temperature is 0."); `:106-145` `explainFinding()` remove o campo `explanation` pré‑calculado antes de enviar ao modelo a descoberta (`:113`, para que não possa simplesmente repetir uma cadeia predefinida), solicita JSON bilingue `{"en":..., "es":...}` e recorre a `renderTemplateExplanation()` (`:41-60`) — um simples despejo de factos, sem LLM — em qualquer falha. Isto é o que o Larry Profe necessita a nível arquitetónico.
- **Avatar + máquina de estados.** `packages/design-system/larry/LarryAvatar.tsx:4-13` — estados `orb|face|idle|thinking|working|happy|denying|celebrating|presenting`; `larry.css:1-121` um `@keyframes` por estado, desativado sob `prefers-reduced-motion` (`:113-120`). `packages/design-system/src/larry-chat/useLarryChat.ts:1-9,30` documenta `idle → thinking → working → idle`. Reutilizável tal como está para o Larry Profe.
- **Nenhum uso da API do Claude em qualquer parte deste repositório atualmente** — nenhuma importação `@anthropic-ai/sdk` em `src/` ou `packages/`. Esta é a primeira integração, não uma extensão.

## O que deve mudar para um tutor de matemática infantil

1. **Tom, não "treinador honesto".** A persona do iOS destina‑se a engenheiros B2B adultos que podem aceitar uma correção direta. Uma criança nunca deve sentir vergonha — mais rigoroso que "o humor nunca zomba das características das pessoas".
2. **Cinco línguas, não duas.** O tipo e o detector de lista de palavras de `locale.ts` `'en'|'es'` não se estendem a FR/PT/DE, e o padrão de `prompts.ts` "escrever cada linha duas vezes" multiplicaria por 5 os tokens do prompt para conteúdo maioritariamente não usado por chamada — em vez disso, criar um prompt de idioma único por locale.
3. **A correção matemática não pode depender do LLM.** Uma resposta errada da ferramenta iOS é uma má sugestão de UI; uma explicação errada do Larry Profe ensina ativamente matemática incorreta. É precisamente por isso que o formato de `contador/explain.ts` "LLM explica, nunca calcula" está correto e o ciclo livre de `chat.ts` não está.
4. **Vocabulário por faixa etária**, explícito no prompt (faixa de idade como parâmetro), não deixado ao modelo para inferir a partir do tom.
5. **Encaminhamento de modelo é novo** — o ADR‑006 descreve encaminhamento híbrido Workers‑AI‑first; o Larry Profe inverte isto (Claude‑first, três níveis de dificuldade, sem Workers AI), conforme o briefing do proprietário.
6. **Retirar ou suavizar o estado de avatar `denying`** para um produto infantil — a linguagem corporal de balançar a cabeça (`larry.css:87-98`) lê‑se como "estás errado"; preferir `thinking`→`presenting` para correções.

## Tabela de encaminhamento de modelo

Pricing/model IDs are from the `claude-api` skill (cached 2026-06-24; Sonnet 5 intro pricing runs through 2026-08-31), not training memory. Cost estimates assume a shared system-prompt prefix (covered under caching below) plus a per-call payload of {problem, student steps, grading verdict}; figures are estimates to validate against real prompts, not measurements.

| Banda de dificuldade | ID do modelo | $/MTok entrada / saída | Tokens estimados entrada → saída | Custo estimado / 1.000 explicações | Meta de latência |
|---|---|---|---|---|---|
| Aritmética básica | `claude-haiku-4-5` | $1,00 / $5,00 | ~300 → ~150 | **~$1,05** | < 1,5 s, sem streaming necessário |
| Médio (frações, álgebra, geometria) | `claude-sonnet-5` | $3,00 / $15,00 (intro $2,$10 até 2026-08-31) | ~500 → ~300 | **~$6,00** (intro **~$4,00**) | 2–4 s, stream se > ~3 s |
| Avançado (cálculo tensorial, integrais duplas, provas) | `claude-opus-5` | $5,00 / $25,00 | ~800 → ~600 + pensamento adaptativo | **~$19** floor, realistic $35–60 once thinking tokens are counted | 5–15 s; deve fazer streaming |

Notas:

- **O custo do Opus 5 é dominado por tokens de pensamento.** Segundo a skill, o pensamento está **ativado por defeito** no Opus 5 — um pedido que nunca define `thinking` ainda pensa, e o pensamento é faturado como saída a $25/MTok. Uma explicação difícil pode consumir 1.000–2.000 tokens de pensamento antes da resposta de 600 tokens, acrescentando ~ $25–50/1.000 chamadas por si. Desativar o pensamento tem modos de falha reais (chamadas de ferramenta ou tags `<thinking>` a vazar para o texto visível, conforme `shared/model-migration.md`), pelo que a alavanca mais segura é **`output_config.effort`** — iniciar o Opus 5 em `medium` e elevar apenas se a avaliação mostrar explicações superficiais.
- **Haiku 4.5 precisa de um prefixo cacheável de 4.096 tokens.** Conforme a tabela mínima por modelo em `shared/prompt-caching.md`, o piso do Haiku 4.5 é 4.096 tokens (o maior de todos os modelos atuais; Opus 5/Fable 5 precisam apenas de 512). Um prompt de sistema de aritmética básica (persona + regras + uma faixa etária + um idioma) provavelmente fica bem abaixo disso, o que significa que **as chamadas Haiku podem nunca atingir o cache de prompt** a menos que o prefixo seja deliberadamente preenchido — sinalizar isto ao proprietário em vez de assumir que o cache “simplesmente funciona” no nível mais barato.
- **API em lote (50 % de desconto) serve para pré‑geração, não para tráfego ao vivo.** Uma explicação ao vivo numa sessão não pode ser agrupada, mas pré‑gerar as N principais conceções erradas conhecidas por tópico/idade/idioma antes do lançamento é exatamente o caso de uso da API em lote (até 100 K pedidos/lote, sem sensibilidade à latência).

## The prompt architecture — proposed skeleton, 5 languages, hard rules

Partindo do padrão “every line twice” de `prompts.ts`, criar **um prompt por (local, faixa etária, nível)**, com o inglês apresentado (FR/PT/DE/ES são renderizações paralelas de um único idioma, não concatenações):

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

Reserve os esquemas de ferramenta `output_config.format` / `strict: true` para a passagem do motor de avaliação → Larry-Profe (o backend próprio do Math Challenge valida esse JSON, não a Claude) — a saída deste prompt é texto simples transmitido em fluxo, não dados estruturados.

## Estratégia de caching e controlo de custos

Dois níveis independentes:

1. **Claude prompt caching** no prefixo estável (persona + regras + um idioma + uma faixa etária). Por modelo, por prefixo — gravações custam 1,25× (TTL de 5 min) ou 2× (1 hora), leituras ~0,1×. Um TTL de 1 hora com pré‑aquecimento periódico (`max_tokens: 0` requests, conforme `shared/prompt-caching.md`) adapta‑se ao tráfego intenso nas horas de dever de casa. Ignorar para Haiku a menos que o prefixo ultrapasse 4.096 tokens (ver acima).

2. **Cache a nível de aplicação para conceções erróneas (D1/KV)** — o mecanismo que o resumo do proprietário realmente solicita. Cachear a **explicação completa gerada**, indexada por `(topic, misconception-classification, age-band, locale)` — não a instância exata do problema, por isso diferentes problemas de frações com o mesmo erro de “esquecer o denominador comum” utilizam a mesma entrada de cache. Reflete o padrão de pesquisa estática existente `S3_ERROR_KB`/`METRIC_KB` (`src/larry/tools.ts:59-135`), mas preenchido com a saída da Claude no momento da geração; recorre a uma chamada ao vivo em caso de falha e preenche o cache, espelhando a estrutura AI‑then‑template de `contador/explain.ts`. Registar `cache_hit: boolean` e os verdadeiros `usage.input_tokens`/`usage.output_tokens` numa tabela de auditoria análoga à migração `0011` — não a estimativa `text.length/4` que o `audit.ts` usa hoje.

3. **API em lote para semeadura em arranque a frio** — pré‑gerar as N principais conceções erróneas por tópico antes do lançamento com 50 % de desconto, convertendo a maior parte do tráfego inicial em leituras de cache desde o primeiro dia.

## Implicações de design

- Larry Profe é uma **nova integração da API Claude**; não o encaminhe através do gateway Workers AI da IOS — o proprietário quer Claude, e o ADR‑006 é uma arquitetura diferente, orientada para Workers‑AI, para outro produto.  
- Modelar o **motor de avaliação como fonte da verdade**, Claude apenas como explicador — seguir a estrutura de `contador/explain.ts`, não o ciclo livre de ferramentas de `chat.ts`.  
- Eliminar o padrão de prompt bilingue‑inline; um prompt por local, pois 5 idiomas tornam a deriva entre línguas dentro de um único prompt cara e propensa a erros.  
- Obter o local como um **parâmetro explícito** do cliente (Math Challenge já tem uma definição de idioma) em vez de inferi‑lo como o `locale.ts` faz para a IOS.  
- Construir o roteador de nível de dificuldade no backend do Math Challenge (ao lado da avaliação, que já conhece tópico/nível) — nunca deixar a Claude escolher o seu próprio nível de modelo.  
- Tratar `effort` como um segundo eixo de roteamento independente da escolha do modelo; iniciar de forma conservadora (`medium` no Opus 5) pois é a alavanca principal contra o aumento de custos de tokens de pensamento.  
- Registar os campos reais de `usage` da Claude no repositório de auditoria desde o primeiro dia, em vez de repetir a estimativa de contagem de caracteres de `audit.ts`.  
- Redigir um cânone de regras rígidas de segurança infantil paralelo à lista de cinco itens da §4.2 de `docs/larry.md`, mas a partir do zero — as regras da IOS referem‑se à segurança de dados, não à segurança emocional.  
- Reutilizar `LarryAvatar` e a sua máquina de estados sem alterações, mas reconsiderar se o estado `denying` deveria alguma vez ser acionado a uma criança.  
- Manter o cache de conceções erróneas e o cache de prompts da Claude como **sistemas distintos** — resolvem problemas diferentes (evitar o reenvio de prefixos vs. evitar a re‑geração de saída semanticamente idêntica) e fundi‑los resulta numa entrega inferior ao objetivo de “uma geração, não mil”.  
- Utilizar a API em lote para pré‑popular o cache de conceções erróneas antes do lançamento e para retro‑alimentar novos tipos de conceções erróneas encontrados em produção.  
- Cada regra rígida e linha de prompt necessita de cópia revisada por humanos em EN/ES/FR/PT/DE — o tom que parece encorajador numa língua pode soar condescendente noutro; não delegar isto à tradução em tempo de execução.

## Questões abertas para o proprietário do projeto

1. O roteador de nível de dificuldade reside no backend do Math Challenge (etiquetas do motor de avaliação tópico/nível), ou o Larry Profe deve re‑classificar a dificuldade a partir do texto do problema?  
2. Quais são as faixas etárias reais (K‑2/3‑5/6‑8/9‑12, ou por série)? Isto determina tanto as variantes de vocabulário como o número de combinações de prompts a criar (local × faixa etária × nível poderia ser 5×4×3 = 60).  
3. O `effort` do Opus 5 deve ser fixo por nível, ou ajustável por tópico dentro de “avançado” (uma dupla integral e uma demonstração completa de cálculo tensorial podem necessitar de esforços diferentes)?  
4. Existe um orçamento de latência a nível de produto (por exemplo, “deve iniciar a transmissão em 2 s ou mostrar um estado de carregamento”) que deve limitar a transmissão padrão por nível?  
5. Quem revê a cópia das regras rígidas e prompts em FR/PT/DE — um revisor de conteúdo educativo multilingue, ou a tradução automática como rascunho inicial a partir da versão EN/ES?  
6. O cache de conceções erróneas necessita de TTL, ou uma explicação em cache para uma conceção rara pode ser servida indefinidamente?  
7. A secção “o que o estudante fez bem” tem de encontrar sempre algo, mesmo para uma resposta vazia ou adivinhada — e, em caso afirmativo, qual é o mínimo honesto (por exemplo, “tentou”)?

## Fontes

- `docs/larry.md` (§1, §4.2, §9, §10)
- `docs/wiki/decisions.md:42-47` (ADR-006)
- `src/larry/prompts.ts:24-71`
- `src/larry/chat.ts:40-44, 236-267, 273-289, 295-336`
- `src/larry/tools.ts:47-48, 59-135, 342-394`
- `src/larry/audit.ts` (whole file)
- `src/larry/locale.ts:9-71`
- `src/larry/contador/explain.ts` (whole file — the closest existing precedent)
- `migrations/0011_larry_audit.sql`
- `packages/design-system/larry/LarryAvatar.tsx`, `larry.css`
- `packages/design-system/src/larry-chat/useLarryChat.ts:1-30`

Todos os caminhos são relativos a `/Users/estebanrey/Documents/dev/ignia-object-storage/`.

**Factos da API Claude** (do skill `claude-api`, em cache a 24‑06‑2026; não da memória de treino):

- IDs de modelo/preços: `claude-haiku-4-5` ($1/$5 por MTok), `claude-sonnet-5` ($3/$15, introdução $2/$10 até 31‑08‑2026), `claude-opus-5` ($5/$25) — tabela “Current Models” do skill.  
- Economia de caching de prompts e prefixo mínimo cacheável por modelo (Haiku 4.5 = 4.096 tokens; Opus 5 = 512) — `shared/prompt-caching.md`.  
- API em lote (desconto de 50 %, até 100.000 pedidos/lote) — `python/claude-api/batches.md`.  
- Pensamento adaptativo ativado por defeito no Opus 5, `output_config.effort`, o pensamento é cobrado como saída — `SKILL.md` § Thinking & Effort, `shared/model-migration.md` → Migrating to Claude Opus 5.  
- Saídas estruturadas (`output_config.format`, `strict: true`) — `SKILL.md` § Architecture, `shared/tool-use-concepts.md` § Structured Outputs.  
- Alvos de obtenção de preços ao vivo nomeados pelo skill (`shared/live-sources.md`): `https://platform.claude.com/docs/en/pricing.md`, `https://platform.claude.com/docs/en/about-claude/models/overview.md` — não foram obtidos separadamente nesta passagem, pois a tabela em cache do skill estava atual para os modelos necessários.
