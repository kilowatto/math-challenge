# Larry Profe — portando Larry para Math Challenge
> Pesquisa Math Challenge — 2026-07-31 — tópico 37

## Resumo executivo (tópicos)

Larry já existe no iOS como copiloto EN/ES sobre Workers AI (`kimi-k2.6` → `gpt-oss-120b` → resposta enlatada), com um prompt de sistema bilíngue único, um protocolo de “tool calling” feito à mão (JSON em uma linha) e auditoria durável no D1. Nada disso usa a API do Claude — seria a primeira integração do Claude neste repositório.

O dono já decidiu: Larry Profe usa a **API do Claude** com **roteamento por dificuldade** (Haiku/Sonnet/Opus). O precedente mais próximo no repositório não é o chat livre, mas `src/larry/contador/explain.ts`: uma descoberta determinística entra, um LLM a explica em linguagem natural sem recalcular nada, com fallback para um modelo. Larry Profe deve seguir exatamente esse padrão: o motor de avaliação decide o que está certo ou errado; Claude apenas explica, no idioma, idade e tom corretos, nunca envergonhando a criança.

## Resumo executivo (prosa)

O Larry no iOS funciona sobre Workers AI (`@cf/moonshotai/kimi-k2.6` → `@cf/openai/gpt-oss-120b` → resposta pré-definida), com um protocolo artesanal de chamada de ferramenta em JSON de linha única e um sink de auditoria D1 durável. Ele nunca acessa a API do Claude — Larry Profe seria a primeira integração do Claude neste repositório, não uma reutilização da infraestrutura existente.

O dono decidiu que o Larry Profe usa a **API do Claude** com **roteamento de modelo por dificuldade** (Haiku/Sonnet/Opus). O precedente existente mais próximo não é o endpoint de chat livre, mas `src/larry/contador/explain.ts`: um padrão de entrada de descoberta determinística e saída de explicação pelo LLM, com a regra rígida “nunca calcular, apenas citar o que está no JSON” e fallback para um modelo. Larry Profe deve seguir esse formato: o próprio motor de avaliação do Math Challenge é a fonte da verdade sobre a correção; a única função do Claude é transformar um veredicto estruturado em uma explicação calorosa, adequada à idade, em cinco idiomas — nunca recalculando a matemática.

## O que existe hoje — caminhos de arquivos e referências de linha deste repositório

- **Persona/cânon.** `docs/larry.md:1-16` — "orange rhinoceros, honest coach," frase de efeito "¡Ya vas!" apenas ao aceitar uma tarefa, humor sempre direcionado a ele mesmo.
- **A cadeia de modelo é Workers AI, não Claude.** `src/larry/chat.ts:40-41`: `PRIMARY_MODEL = '@cf/moonshotai/kimi-k2.6'`, `FALLBACK_MODEL = '@cf/openai/gpt-oss-120b'` (mesmo par em `src/larry/contador/explain.ts:16-17`). `docs/wiki/decisions.md:42-47` (ADR-006): "nosso próprio modelo (Workers AI) atende de 70–90% do tráfego rotineiro; uma API de fronteira lida com casos difíceis" mais um cache semântico e orçamento por função — forma conceitualmente similar ao que Larry Profe precisa, porém iOS é primeiro Workers-AI com Claude como overflow; o briefing do proprietário do Math Challenge é primeiro Claude com roteamento por dificuldade do problema, não a mesma política.
- **Padrão de prompt único bilíngue.** `src/larry/prompts.ts:24-57`, `buildSystemPrompt(locale, context)` — cada linha de persona/regra é escrita duas vezes, EN depois ES, em uma única string (ex.: `:29`); apenas a instrução "responder no idioma X" (`:47`) é específica de locale. Não escala para 5 idiomas (veja abaixo).
- **Lista rígida de "nunca".** `src/larry/prompts.ts:38-44` — cinco itens: nunca excluir dados do cliente, nunca ler conteúdo de objetos, nunca tocar em cobrança sem confirmação, nunca criar/rotacionar chaves via chat, nunca alterar código/configuração; reescrito em prosa em `docs/larry.md:96-102` (§4.2). Este é o slot de modelo onde Larry Profe precisará inserir suas próprias regras de segurança infantil.
- **Protocolo de ferramenta artesanal.** O modelo deve responder apenas com um JSON de linha única `{"tool": "<name>", "args": {...}}` (`prompts.ts:50-51`), não com blocos de conteúdo `tool_use` da Anthropic. Analisado por `parseToolCall` (`chat.ts:273-289`); iterado por `generateReplyWithTools` (`:236-267`), limitado a `MAX_TOOL_HOPS = 2` (`:44`). A segurança por escopo de locatário está em `src/larry/tools.ts:47-48, 342-394`.
- **Cadeia de fallback, sem retry/backoff.** `chat.ts:295-314` `generateReply` tenta cada modelo uma vez, recai para `cannedErrorReply(locale)` (`prompts.ts:67-71`) se ambos falharem.
- **Sink de auditoria.** `migrations/0011_larry_audit.sql:5-23` — tabela D1, tipos de linha `chat`/`tool`, colunas incluem `tenant_id`, `locale`, `tools_used`, `outcome`, `latency_ms`, `prompt_tokens`, `completion_tokens`. Escritores `src/larry/audit.ts:36-67, 70-97` são best-effort, nunca lançam exceção. Contagens de tokens são uma estimativa aproximada `text.length / 4` (`audit.ts:31-33`), não o `usage` real do modelo — respostas do Claude trazem contagens exatas de tokens, que a auditoria do Larry Profe deve registrar precisamente.
- **Detecção de locale apenas EN/ES.** `src/larry/locale.ts:9, 63-71` — lista fixa de palavras em espanhol mais verificação de caracteres acentuados, inglês é o padrão. Não existe infraestrutura para FR/PT/DE; estender essa heurística é frágil (veja abaixo).
- **O precedente real: `src/larry/contador/explain.ts`.** `:67-75` regra rígida do prompt do sistema ("Every number... MUST appear verbatim in the provided JSON. Never compute, convert, round, or invent a figure... Temperature is 0."); `:106-145` `explainFinding()` remove o campo `explanation` pré-calculado antes de enviar a descoberta ao modelo (`:113`, para que não repita uma string pronta), solicita JSON bilíngue `{"en":..., "es":...}` e recorre a `renderTemplateExplanation()` (`:41-60`) — um despejo de fatos simples, sem LLM — em qualquer falha. Isso é arquitetonicamente o que Larry Profe precisa.
- **Avatar + máquina de estados.** `packages/design-system/larry/LarryAvatar.tsx:4-13` — estados `orb|face|idle|thinking|working|happy|denying|celebrating|presenting`; `larry.css:1-121` um `@keyframes` por estado, desativado sob `prefers-reduced-motion` (`:113-120`). `packages/design-system/src/larry-chat/useLarryChat.ts:1-9,30` documenta `idle → thinking → working → idle`. Reutilizável como está para Larry Profe.
- **Nenhum uso da API do Claude em nenhum lugar deste repositório atualmente** — nenhuma importação `@anthropic-ai/sdk` em `src/` ou `packages/`. Esta é a primeira integração, não uma extensão.

## O que deve mudar para um tutor de matemática infantil

1. **Tom, não "honest coach".** A persona do iOS tem como alvo engenheiros adultos B2B que podem aceitar uma correção direta. Uma criança nunca deve se sentir envergonhada — mais rigoroso que "humor nunca zomba das características das pessoas".
2. **Cinco idiomas, não dois.** O tipo `'en'|'es'` e o detector de lista de palavras em `locale.ts` não se estendem a FR/PT/DE, e o padrão de `prompts.ts` "escreva cada linha duas vezes" multiplicaria em 5× os tokens do prompt para conteúdo quase nunca usado por chamada — construa um prompt de idioma único por locale.
3. **A correção matemática não pode depender do LLM.** Uma resposta errada da ferramenta IOS é uma pista de UI ruim; uma explicação errada do Larry Profe ensina ativamente matemática incorreta. É exatamente por isso que o formato de `contador/explain.ts` "LLM explica, nunca calcula" está correto e o loop livre de `chat.ts` não está.
4. **Vocabulário por faixa etária**, explícito no prompt (faixa de idade como parâmetro), não deixado para o modelo inferir a partir do tom.
5. **Roteamento de modelo é novo** — ADR-006 descreve roteamento híbrido Workers-AI-first; Larry Profe inverte isso (Claude-first, três níveis de dificuldade, sem Workers AI), conforme o briefing do proprietário.
6. **Retire ou suavize o estado de avatar `denying`** para um produto infantil — a linguagem corporal de balançar a cabeça (`larry.css:87-98`) lê-se como "você está errado"; prefira `thinking`→`presenting` para correções.

## Tabela de roteamento de modelo

Os IDs de modelo e os preços vêm do skill `claude-api` (em cache em 2026-06-24; o preço de introdução do Sonnet 5 vale até 2026-08-31), não da memória de treinamento. As estimativas de custo pressupõem um prefixo de system prompt compartilhado (coberto em cache mais adiante) mais um payload por chamada de {problema, passos do aluno, veredicto de correção}; são estimativas a validar contra prompts reais, não medições.

| Faixa de dificuldade | ID do modelo | $/MTok entrada / saída | Tokens estimados entrada → saída | Custo estimado / 1.000 explicações | Meta de latência |
|---|---|---|---|---|---|
| Aritmética básica | `claude-haiku-4-5` | $1,00 / $5,00 | ~300 → ~150 | **~$1,05** | < 1,5 s, sem streaming necessário |
| Nível intermediário (frações, álgebra, geometria) | `claude-sonnet-5` | $3,00 / $15,00 (intro $2/$10 até 2026-08-31) | ~500 → ~300 | **~$6,00** (intro **~$4,00**) | 2–4 s, stream se > ~3 s |
| Avançado (cálculo tensorial, integrais duplas, provas) | `claude-opus-5` | $5,00 / $25,00 | ~800 → ~600 + pensamento adaptativo | **~$19** floor, realisticamente $35–60 | 5–15 s; deve stream |

- **O custo do Opus 5 é dominado por tokens de pensamento.** Conforme a skill, o pensamento está **ativado por padrão** no Opus 5 — uma requisição que nunca define `thinking` ainda pensa, e o pensamento é cobrado como saída a $25/MTok. Uma explicação difícil pode consumir 1.000–2.000 tokens de pensamento antes da resposta de 600 tokens, adicionando ~$25–50/1.000 chamadas por si só. Desativar o pensamento tem modos de falha reais (chamadas de ferramenta ou tags `<thinking>` vazando para o texto visível, conforme `shared/model-migration.md`), portanto o controle mais seguro é **`output_config.effort`** — iniciar o Opus 5 em `medium` e aumentar somente se a avaliação mostrar explicações superficiais.
- **Haiku 4.5 requer um prefixo cacheável de 4.096 tokens.** Conforme a tabela de mínimo por modelo em `shared/prompt-caching.md`, o piso do Haiku 4.5 é 4.096 tokens (o maior de todos os modelos atuais; Opus 5/Fable 5 precisam apenas de 512). Um prompt de sistema de aritmética básica (persona + regras + uma faixa etária + um idioma) provavelmente está bem abaixo disso, o que significa que **chamadas ao Haiku podem nunca alcançar o cache de prompt** a menos que o prefixo seja deliberadamente preenchido — sinalize isso ao proprietário ao invés de assumir que o cache "simplesmente funciona" no nível mais barato.
- **A API Batch (50% de desconto) serve para pré-geração, não para tráfego ao vivo.** Uma explicação ao vivo em sessão não pode ser batch, mas pré-gerar as N principais concepções errôneas conhecidas por tópico/idade/idioma antes do lançamento é exatamente o caso de uso da API Batch (até 100K requisições/batch, sem sensibilidade à latência).

## A arquitetura do prompt — esqueleto proposto, 5 idiomas, regras rígidas

Partindo do padrão "cada linha duas vezes" de `prompts.ts`, construa **um prompt por (localidade, faixa etária, nível)**, com o inglês exibido (FR/PT/DE/ES são renderizações paralelas de um único idioma, não concatenações):

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

Reserve os esquemas de ferramenta `output_config.format` / `strict: true` para a transferência do motor de avaliação → Larry-Profe (o backend próprio do Math Challenge valida esse JSON, não o Claude) — a saída deste prompt é prosa simples transmitida em fluxo, não dados estruturados.

## Estratégia de cache e controle de custos

Duas camadas independentes:

1. **Cache de prompt do Claude** no prefixo estável (persona + regras + um idioma + uma faixa etária). Por modelo, por prefixo — gravações custam 1,25× (TTL de 5 min) ou 2× (1 h), leituras ~0,1×. Um TTL de 1 h com pré-aquecimento periódico (`max_tokens: 0` requests, conforme `shared/prompt-caching.md`) atende ao tráfego intenso durante horas de lição de casa. Ignorar para Haiku a menos que o prefixo ultrapasse 4.096 tokens (veja acima).

2. **Cache de concepções equivocadas em nível de aplicação (D1/KV)** — o mecanismo que o briefing do proprietário realmente solicita. Armazene em cache **toda a explicação gerada**, usando como chave `(topic, misconception-classification, age-band, locale)` — não a instância exata do problema, de modo que diferentes problemas de fração com o mesmo erro de "esquecer o denominador comum" utilizem a mesma entrada de cache. Reflete o padrão de consulta estática existente `S3_ERROR_KB`/`METRIC_KB` (`src/larry/tools.ts:59-135`), porém preenchido pela saída do Claude no momento da geração; recorra a uma chamada ao vivo em caso de falta e preencha o cache, espelhando a estrutura AI-then-template de `contador/explain.ts`. Registre `cache_hit: boolean` e os reais `usage.input_tokens`/`usage.output_tokens` em uma tabela de auditoria análoga à migração `0011` — não a estimativa `text.length/4` que o `audit.ts` usa hoje.

3. **API em lote para semeadura em início frio** — pré-gere as N principais concepções equivocadas por tópico antes do lançamento com 50% de desconto, convertendo a maior parte do tráfego inicial em leituras de cache desde o primeiro dia.

## Implicações de design

1. Larry Profe é uma **nova integração com a API do Claude**; não o roteie através do gateway Workers AI da IOS — o proprietário quer Claude, e o ADR-006 é uma arquitetura diferente, orientada a Workers-AI, para outro produto.  
2. Modele o **motor de avaliação como fonte da verdade**, Claude apenas como explicador — siga a estrutura de `contador/explain.ts`, não o loop de ferramenta livre de `chat.ts`.  
3. Elimine o padrão de prompt bilíngue-inline; um prompt por localidade, já que 5 idiomas tornam a deriva entre idiomas dentro de um único prompt cara e propensa a erros.  
4. Receba a localidade como um **parâmetro explícito** do cliente (Math Challenge já possui uma configuração de idioma) em vez de inferi-la como `locale.ts` faz para a IOS.  
5. Construa o roteador de nível de dificuldade no backend do Math Challenge (ao lado da avaliação, que já conhece tópico/nível) — nunca deixe o Claude escolher seu próprio nível de modelo.  
6. Trate `effort` como um segundo eixo de roteamento independente da escolha do modelo; comece de forma conservadora (`medium` no Opus 5) já que é a alavanca principal contra o aumento de custo de tokens de pensamento.  
7. Registre os campos reais de `usage` do Claude no repositório de auditoria desde o primeiro dia, em vez de repetir a estimativa de contagem de caracteres de `audit.ts`.  
8. Escreva um cânon de regras rígidas de segurança infantil paralelo à lista de cinco itens da §4.2 de `docs/larry.md`, mas do zero — as regras da IOS tratam de segurança de dados, não de segurança emocional.  
9. Reutilize `LarryAvatar` e sua máquina de estados sem alterações, mas reconsidere se `denying` deveria ser acionado para uma criança.  
10. Mantenha o cache de concepções equivocadas e o cache de prompt do Claude como **sistemas distintos** — eles resolvem problemas diferentes (evitar reenvio de prefixo vs. evitar regeneração de saída semanticamente idêntica) e combiná-los entrega menos do objetivo "uma geração, não mil".  
11. Use a API em lote para pré-popular o cache de concepções equivocadas antes do lançamento e para retroalimentar novos tipos de concepções encontradas em produção.  
12. Cada regra rígida e linha de prompt precisa de cópia revisada por humanos em EN/ES/FR/PT/DE — o tom que soa encorajador em um idioma pode parecer condescendente em outro; não deixe isso para tradução em tempo de execução.

## Perguntas abertas para o dono do projeto
1. O roteador de nível de dificuldade reside no backend do Math Challenge (tags do motor de avaliação tópico/nível), ou o Larry Profe deve reclassificar a dificuldade a partir do texto do problema?  
2. Quais são as faixas etárias reais (K-2/3-5/6-8/9-12, ou por série)? Isso determina tanto as variantes de vocabulário quanto o número de combinações de prompts em cache a serem criadas (localidade × faixa-etária × nível pode ser 5×4×3 = 60).  
3. O `effort` do Opus 5 deve ser fixo por nível, ou ajustável por tópico dentro de "avançado" (uma dupla integral e uma prova completa de cálculo tensorial podem precisar de esforços diferentes)?  
4. Existe um orçamento de latência a nível de produto (ex.: "deve iniciar o streaming em até 2 s ou mostrar um estado de carregamento") que deve controlar o streaming padrão por nível?  
5. Quem revisa a cópia das regras rígidas e prompts em FR/PT/DE — um revisor de conteúdo educacional multilíngue, ou a tradução automática como rascunho inicial a partir da versão EN/ES?  
6. O cache de concepções equivocadas precisa de TTL, ou uma explicação em cache para uma concepção rara pode ser servida indefinidamente?  
7. A seção "o que o estudante fez certo" deve sempre encontrar algo, mesmo para uma resposta em branco ou adivinhada — e, se sim, qual é o limite honesto (ex.: "você tentou")?

## Fontes

**Arquivos do repositório (caminhos citados acima):**
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

**Fatos da API Claude (do skill `claude-api`, em cache em 2026-06-24; não da memória de treinamento):**
- IDs de modelo/preços: `claude-haiku-4-5` (US$ 1/US$ 5 por MTok), `claude-sonnet-5` (US$ 3/US$ 15, introdução US$ 2/US$ 10 até 2026-08-31), `claude-opus-5` (US$ 5/US$ 25) — tabela "Current Models" do skill.  
- Economia de cache de prompt e prefixo mínimo cacheável por modelo (Haiku 4.5 = 4.096 tokens; Opus 5 = 512) — `shared/prompt-caching.md`.  
- API em lote (desconto de 50%, até 100.000 requisições/lote) — `python/claude-api/batches.md`.  
- Pensamento adaptativo ativado por padrão no Opus 5, `output_config.effort`, pensamento cobrado como saída — `SKILL.md` § Thinking & Effort, `shared/model-migration.md` → Migrating to Claude Opus 5.  
- Saídas estruturadas (`output_config.format`, `strict: true`) — `SKILL.md` § Architecture, `shared/tool-use-concepts.md` § Structured Outputs.  
- Alvos de busca de preços ao vivo nomeados pelo skill (`shared/live-sources.md`): `https://platform.claude.com/docs/en/pricing.md`, `https://platform.claude.com/docs/en/about-claude/models/overview.md` — não buscados separadamente nesta passagem, pois a tabela em cache do skill estava atual para os modelos necessários.
