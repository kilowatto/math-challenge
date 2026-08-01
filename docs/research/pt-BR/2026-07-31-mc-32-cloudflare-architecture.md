# Cloudflare Architecture for Math Challenge

> Math Challenge research — 2026-07-31 — topic 32

## Resumen ejecutivo (ES)

Math Challenge é uma PWA de prática matemática construída inteiramente sobre a Cloudflare. A arquitetura proposta usa **Workers + Astro** para o frontend/BFF, **D1** para dados relacionais (contas, conteúdo, assinaturas), **Durable Objects com armazenamento SQLite** para estado ao vivo de baixa cardinalidade (uma liga de ~30, uma sala de aula, a sessão de uma criança), **Analytics Engine** para telemetria de tentativas de alto volume (não D1 — o D1 fica sem espaço primeiro), **KV** para instantâneos de leaderboard global/por série recalculados periodicamente, **R2** para mídia e arquivo frio, **Queues + Workflows** para pontuação assíncrona e geração de explicações de IA, **Vectorize + Workers AI** para RAG multilíngue sobre o banco de pistas, e **AI Gateway** na frente da API do Claude para cachear, limitar taxa e colocar teto de gasto ao tutor “Larry” com roteamento de modelos. O limite que atingiremos primeiro não é computação: é o teto de armazenamento do D1 (10 GB por banco de dados no plano pago) se alguém tentar salvar cada tentativa lá — por isso as tentativas brutas vão para o Analytics Engine, não para o D1.

## Executive summary (EN)

Math Challenge é um aplicativo de prática de matemática orientado a PWA, construído inteiramente na Cloudflare. A arquitetura proposta usa **Workers + Astro** para o frontend/BFF, **D1** para dados relacionais (contas, conteúdo, assinaturas), **Durable Objects com armazenamento SQLite** para estado ao vivo de baixa cardinalidade (uma liga de ~30, uma sala de aula, a sessão de uma criança), **Analytics Engine** para telemetria de tentativas de alto volume (não D1 — o D1 fica sem espaço primeiro), **KV** para instantâneos de leaderboard global/por série recalculados periodicamente, **R2** para mídia e arquivo frio, **Queues + Workflows** para pontuação assíncrona e geração de explicações de IA, **Vectorize + Workers AI** para RAG multilíngue sobre o banco de pistas, e **AI Gateway** na frente da API do Claude para cachear, limitar taxa e colocar teto de gasto ao tutor “Larry” com roteamento de modelos. O limite que encontraremos primeiro não é computação — é o teto de armazenamento do D1 (10 GB por banco de dados no plano pago) se as tentativas brutas forem armazenadas lá. Por isso as tentativas brutas vão para o Analytics Engine, não para o D1.

## Product-to-primitive mapping

| Recurso | Primitivo | Por quê | Limite real que o restringe |
|---|---|---|---|
| Frontend + BFF, shell PWA | Workers (Astro via `@astrojs/cloudflare`, Static Assets) | Monorepo já executa Astro em Workers; configuração automática do framework para Astro existe desde dez/2025 [22][23] | Limites de CPU/solicitação dos Workers — não é uma restrição de curto prazo |
| Contas de pais/filhos/professores, catálogo de conteúdo, assinaturas | D1 | Relacional, transacional, barato nessa escala | 10 GB/database (paid), 500 MB (free); 50 000 DBs/account, 1 TB/account [2] |
| Telemetria por tentativa (dezenas de milhares de usuários × muitas tentativas/dia) | Analytics Engine | Construído exatamente para isso: eventos de alta cardinalidade com muitas gravações, sem modelo de cobrança por linha de armazenamento como o D1 | 20 blobs / 20 doubles / 1 index (96 B) per point, 250 points per Worker invocation, 3‑month retention [13] |
| Liga ao vivo (~30) e classificação de salas | Durable Objects (SQLite storage) | Um DO por liga/sala mantém a taxa de requisições por objeto baixa (~30 escritores), ordenação completa em memória de 30 linhas é trivial, hibernação de WebSocket fornece push quase em tempo real com custo quase zero em idle | Soft throughput ceiling ~500–1 000 req/s per individual DO — must shard by league/classroom, never one global DO [7] |
| Leaderboard global / por série | KV (precomputed snapshot) + Workflow/Cron rollup | Leitura de KV é cacheada na borda e barata em escala de fan‑out; uma visão global ordenada não precisa de frescor subsegundo | KV: 1 write/sec per key, min `cacheTtl` 30 s — cannot write per‑attempt, must batch [9][11][12] |
| Modelo de aprendizagem adaptativa por criança | Durable Object (SQLite) or D1 rollup, read by Worker at question‑selection time | Precisa de leitura/gravação de baixa latência colocalizada com o compute; DO oferece isolamento por criança | 10 GB storage per DO object [8] |
| Banco de conteúdo (5 idiomas, milhares de itens) | D1 (metadata) + R2 (media assets: images/audio) | D1 para linhas estruturadas consultáveis; R2 para grandes ativos binários, sem taxa de saída | R2 has no query language of its own — pair with D1 index |
| Tutor de IA “Larry” (API Claude, roteamento de modelo) | Workers → AI Gateway → Claude API | AI Gateway fornece cache, limites de taxa e limites de gasto por usuário na frente da chamada ao modelo | AI Gateway: max 20 spend‑limit rules/gateway [Spend limits] |
| Inferência local barata: embeddings, TTS, tradução | Workers AI | Executa na rede da Cloudflare, sem ida externa, precificação por modelo | Model‑specific: e.g. bge‑m3 $0.012/M input tokens [17] |
| RAG sobre banco de dicas/explicações | Vectorize (embeddings from bge‑m3) | Modelo de embedding multilíngue atende ao requisito de 5 idiomas | 10 M vectors/index, 1 536 dims max [16] |
| Pontuação assíncrona, geração de explicação de IA | Queues + Workflows | Desacopla a requisição de envio de tentativa da geração mais lenta de explicação de IA; Workflows fornecem tentativas duráveis | Queues: 64 KB operation unit, 100 K ops/day free [Queues pricing]; Workflows: 500 K steps included/month [Workflows pricing] |
| Notificações push | Web Push (via a Worker sending payloads) + PWA service worker | Não é um produto CF distinto — Workers é apenas o remetente; navegador/SO controla a entrega | iOS Web Push requires installed‑to‑homescreen Safari 16.4+; inconsistent on school‑managed Chromebooks/iPads |
| Jogo offline | PWA service worker + Cache API + background sync to `math-challenge-ingest` | Cache API é por Worker, não compartilhado globalmente | 512 MB max cached object, 1 000 Cache API calls/request (paid) [20] |
| Defesa contra bots no cadastro/login | Turnstile | Gratuito, WCAG 2.2 AA, modos não interativos/invisíveis adequados para crianças | No hard rate limit found in fetched docs; verify current plan limits before launch |
| Analytics de site que respeita privacidade | Web Analytics | RUM sem cookies, alternador de exclusão da UE | 7‑day unsampled retention, then ~10 % sampling [Web Analytics FAQ] |
| Controle de custo no gasto com Claude | AI Gateway (Unified Billing, spend limits, dynamic routing/fallback) | Um único lugar para ver e limitar toda a superfície de custo do tutor | 20 spend‑limit rules/gateway ceiling |
| Hyperdrive | *(not used)* | Nenhum Postgres/MySQL externo neste design — D1 é o sistema de registro | N/A |
| Imagens/Stream | *(not used at launch)* | Conteúdo são ilustrações + áudio curto, servidos bem diretamente do R2; reconsiderar se aulas em vídeo forem adicionadas | N/A |

## Findings — per-service notes

**D1.** Limites do plano pago: 10 GB por banco de dados, 50.000 bancos de dados por conta, 1 TB de armazenamento total da conta, duração máxima de consulta de 30 segundos, instrução SQL máxima de 100 KB, linha/BLOB máximo de 2 MB, 6 conexões simultâneas por Worker, 1.000 consultas por invocação do Worker [2]. Preços: 25 bilhões de linhas lidas incluídas/mês, depois $0,001/milhão; 50 milhões de linhas gravadas incluídas, depois $1,00/milhão; armazenamento $0,75/GB‑mês além dos 5 GB incluídos [1]. **Read replication** está em beta público via a Sessions API, usando marcadores para consistência sequencial (“read your own writes”, leituras monotônicas); a Cloudflare cria automaticamente uma réplica por região suportada (ENAM, WNAM, WEUR, EEUR, APAC, OC) sem custo extra — a cobrança permanece a mesma [3][4]. O atraso da réplica é ilimitado no pior caso, portanto qualquer fluxo “aqui está sua nova pontuação” deve fixar o marcador da sessão de escrita, não uma leitura sem restrição.

**Durable Objects.** Armazenamento SQLite está em GA com 10 GB por objeto [8]; há um teto de taxa suave de aproximadamente 500–1.000 solicitações/segundo **por objeto**, não por namespace — a própria orientação da Cloudflare classifica um único DO “global” como anti‑padrão e exige particionamento por limite natural (por sala, por usuário, por liga) [7]. Computação (pago): 1 milhão de solicitações/mês incluídas, depois $0,15/milhão; 400.000 GB‑segundos incluídos, depois $12,50/milhão GB‑s [1]. A cobrança de armazenamento para DOs baseados em SQLite (linhas seguem as tarifas da D1; armazenamento $0,20/GB‑mês) começou em 7 de janeiro de 2026 — recente o suficiente para que modelos de custo mais antigos a subestimem [1][9].

**Workers KV.** Pago: 10 milhões de leituras/mês incluídas, depois $0,50/milhão; 1 milhão de gravações/exclusões/listas incluídas, depois $5,00/milhão; 1 GB de armazenamento incluído, depois $0,50/GB‑mês [Workers pricing]. Consistência eventual: gravações propagam em até 60 segundos globalmente, ou no `cacheTtl` definido — o `cacheTtl` mínimo foi reduzido para 30 segundos em 2026 [12]. **Apenas uma gravação por chave por segundo** é permitida; mais disparam 429s [11]. Leituras em lote (100 chaves) e gravações em lote (10.000 pares, ≤100 MB) existem via a API REST [10][11]. Isso torna o KV inadequado para atualizações por tentativa e adequado para snapshots periodicamente atualizados.

**Analytics Engine.** `writeDataPoint()` aceita até 20 blobs, 20 doubles, 1 índice (≤96 bytes); uma invocação de Worker pode gravar no máximo 250 pontos de dados; o payload de blob é limitado a 16 KB/ponto; retenção de três meses [13]. Não foi encontrado preço separado por gravação nos documentos obtidos — trate como incluído no plano Workers e reconfirme antes de comprometer um orçamento de volume; é a única cifra que este relatório não pôde obter com certeza.

**Queues.** Uma “operação” cobra por bloco de 64 KB lido/gravado/excluído; entregar uma mensagem normalmente custa 3 operações. Gratuito: 10.000 ops/dia. Pago: 1 milhão de ops/mês incluídas, depois $0,40/milhão. Retenção padrão de 4 dias, configurável até 14 dias [Queues pricing].

**Workflows.** Solicitações e tempo de CPU compartilham os pools Workers (10 milhões de solicitações + $0,30/milhão além; 30 milhões de CPU‑ms + $0,02/milhão além); armazenamento 1 GB + $0,20/GB‑mês; etapas 500.000/mês incluídas + $0,80/100.000 adicionais [Workflows pricing]. A cobrança de etapas/armazenamento ainda não havia começado na data do changelog citado — confirme a data de início antes de finalizar os modelos de custo.

**R2.** Armazenamento $0,015/GB‑mês; Classe A (tipo gravação) $4,50/milhão; Classe B (tipo leitura) $0,36/milhão; saída (egress) gratuita. Camada gratuita: 10 GB‑mês de armazenamento, 1 milhão de Classe A, 10 milhões de Classe B/mês [R2 pricing]. A ausência de taxa de saída não importa para arquivo frio: exportações em lote/treinamento não custam nada para leitura.

**Vectorize.** Índices agora suportam até 10 milhões de vetores (aumento de 5 milhões em 23 de janeiro 2026), limitados a 1.536 dimensões/vetor [16]. Preços: 50 milhões de dimensões consultadas incluídas/mês, depois $0,01/milhão; 10 milhões de dimensões armazenadas incluídas, depois $0,05/100 milhões [1].

**Workers AI.** Preços representativos: `@cf/baai/bge-m3` (embeddings multilíngues, corresponde ao banco de 5 idiomas) $0,012/M tokens de entrada; `@cf/myshell-ai/melotts` (TTS) $0,0002/minuto de áudio; `@cf/meta/m2m100-1.2b` (tradução) $0,342/M tokens de entrada/saída [17] — barato o suficiente para rodar na hora da autoria de conteúdo, não por requisição.

**AI Gateway.** Cache aplica‑se apenas a solicitações idênticas de texto/imagem, sem cache semântico [Caching doc]. Limites de gasto são orçamentos baseados em custo, escopados por modelo/fornecedor/metadados personalizados (ex.: por criança, por dia), limitados a 20 regras por gateway [Spend limits doc]. Roteamento dinâmico pode mudar automaticamente para um modelo mais barato quando um orçamento é atingido, em vez de bloquear a requisição.

**Turnstile.** Gratuito, WCAG 2.2 AA, oferece modos não interativos e totalmente invisíveis adequados a um fluxo de cadastro infantil. Nenhum limite rígido de volume de requisições foi encontrado nas páginas obtidas; confirme os limites atuais do plano antes do lançamento.

**Web Analytics.** Gratuito, RUM sem cookies. Dados de beacon não amostrados são retidos por 7 dias e depois agregados a ~10 % de amostragem; visitantes da UE podem ser excluídos com um clique [Web Analytics FAQ].

**Cache API.** Cache por data center, por Worker, distinto do cache de zona. Objeto máximo de 512 MB; 1.000 chamadas `put()`/`match()`/`delete()` por requisição no plano pago (50 gratuitas), compartilhando a cota de sub‑requisições [20].

**Claude API / model routing.** Preços atuais (do skill `claude-api` empacotado, em cache em 24 de junho 2026): Opus 5 $5/$25 por milhão de tokens de entrada/saída; Sonnet 5 $3/$15 (intro $2/$10 até 31 de agosto 2026); Haiku 4.5 $1/$5. Plano de roteamento de Larry: Sonnet 5 como explicador padrão, Haiku 4.5 para micro‑cópias de alto volume e baixo custo, e uma rara escalada ao nível Opus apenas para as explicações multi‑passo mais difíceis — tudo controlado pelos limites de gasto do AI Gateway por criança por dia.

## Proposed resource inventory

Every object is prefixed `math-challenge-` as required. Binding names use `UPPER_SNAKE_CASE`.

| Name | Type | Purpose (EN) | Propósito (ES) | Binding |
|---|---|---|---|---|
| `math-challenge-web` | Worker (Astro, Static Assets) | Frontend PWA público + rotas BFF | Frontend PWA público + rotas BFF | n/a (entry Worker) |
| `math-challenge-ingest` | Worker | Valida e ingere envios de tentativas; grava telemetria, enfileira pontuação | Valida e ingiere envíos de intentos; escribe telemetría, encola calificación | n/a |
| `math-challenge-tutor` | Worker | Hospeda o tutor de IA "Larry"; chama Claude via AI Gateway com RAG | Aloja al tutor de IA "Larry"; llama a Claude vía AI Gateway con RAG | n/a |
| `math-challenge-leaderboard-cron` | Worker (Cron Trigger) | Dispara o Workflow periódico de consolidação do leaderboard | Dispara el Workflow periódico de recálculo de leaderboard | n/a |
| `math-challenge-db` | D1 database | Sistema de registro: usuários, crianças, salas de aula, ligas, metadados de conteúdo, consentimento | Registro maestro: usuarios, niños, salones, ligas, metadatos de contenido, consentimiento | `DB` |
| `math-challenge-league-do` | Durable Object class (SQLite) | Estado ao vivo + transmissão WebSocket para uma liga de ~30 | Estado en vivo + difusión WebSocket de una liga de ~30 | `LEAGUE_DO` |
| `math-challenge-classroom-do` | Durable Object class (SQLite) | Estado ao vivo da lista de alunos e classificações em sala de uma turma | Estado en vivo del roster y clasificación de un salón | `CLASSROOM_DO` |
| `math-challenge-learner-do` | Durable Object class (SQLite) | Modelo adaptativo de aprendizagem por criança (estimativas de domínio, estado de seleção de itens) | Modelo de aprendizaje adaptativo por niño | `LEARNER_DO` |
| `math-challenge-ratelimiter-do` | Durable Object class (SQLite) | Limitação de taxa fragmentada (tentativas de login, chamadas ao tutor, cadastro) | Limitación de tasa fragmentada (inicios de sesión, llamadas al tutor, registro) | `RATE_LIMITER_DO` |
| `math-challenge-leaderboard-kv` | KV namespace | Instantâneos pré-computados do leaderboard global/por faixa de série | Instantáneas precalculadas del leaderboard global/por-grado | `LEADERBOARD_KV` |
| `math-challenge-config-kv` | KV namespace | Flags de recursos e cache do catálogo de conteúdo | Feature flags y caché del catálogo de contenido | `CONFIG_KV` |
| `math-challenge-session-kv` | KV namespace | Tokens de autenticação/sessão de curta duração | Tokens de sesión/autenticación de corta duración | `SESSION_KV` |
| `math-challenge-media` | R2 bucket | Imagens, áudios e ilustrações dos itens | Imágenes, audio e ilustraciones de los reactivos | `MEDIA_BUCKET` |
| `math-challenge-exports` | R2 bucket | Arquivo frio de tentativas expiradas; exportações de dados conforme COPPA/GDPR | Archivo frío de intentos vencidos; exportaciones para solicitudes COPPA/GDPR | `EXPORTS_BUCKET` |
| `math-challenge-scoring-queue` | Queue | Jobs assíncronos de pontuação + atualização do modelo de aprendizagem | Trabajos asíncronos de calificación y actualización del modelo de aprendizaje | `SCORING_QUEUE` |
| `math-challenge-scoring-dlq` | Queue (dead-letter) | Jobs de pontuação falhados após número máximo de tentativas | Trabajos de calificación fallidos tras reintentos máximos | `SCORING_DLQ` |
| `math-challenge-ai-explain-queue` | Queue | Solicitações assíncronas de geração de explicações por IA | Solicitudes asíncronas de generación de explicaciones de IA | `AI_EXPLAIN_QUEUE` |
| `math-challenge-ai-explain-dlq` | Queue (dead-letter) | Jobs de explicação falhados após número máximo de tentativas | Trabajos de explicación fallidos tras reintentos máximos | `AI_EXPLAIN_DLQ` |
| `math-challenge-leaderboard-rollup-workflow` | Workflow | Cálculo periódico do leaderboard global/por faixa de série | Cálculo periódico del leaderboard global/por-grado | `LEADERBOARD_WORKFLOW` |
| `math-challenge-onboarding-workflow` | Workflow | Configuração multi-etapa de conta + perfil de criança + consentimento | Configuración multi-paso de cuenta + perfil de niño + consentimiento | `ONBOARDING_WORKFLOW` |
| `math-challenge-explanations-index` | Vectorize index | Índice RAG multilíngue sobre dicas/explicações curadas | Índice RAG multilingüe sobre pistas/explicaciones curadas | `EXPLANATIONS_INDEX` |
| `math-challenge-tutor-gateway` | AI Gateway | Cache, limites de taxa, limites de gasto, roteamento de modelo para chamadas ao Claude | Caché, límites de tasa, límites de gasto y enrutamiento de modelos para Claude | (gateway ID in `ANTHROPIC_BASE_URL`) |
| `math-challenge-attempts-ae` | Analytics Engine dataset | Telemetria por tentativa (alta cardinalidade, alto volume) | Telemetría por intento (alta cardinalidad, alto volumen) | `ATTEMPTS_AE` |
| `math-challenge-tutor-usage-ae` | Analytics Engine dataset | Telemetria de uso/custo do tutor (por criança, por modelo) | Telemetría de uso/costo del tutor (por niño, por modelo) | `TUTOR_AE` |
| `math-challenge-turnstile-signup` | Turnstile widget | Defesa contra bots em formulários de cadastro/login | Defensa contra bots en formularios de registro/inicio de sesión | (site key/secret via env) |
| `math-challenge-web-analytics` | Web Analytics site | RUM focado em privacidade para a PWA | RUM respetuoso de la privacidad para la PWA | (JS snippet, no binding) |
| `math-challenge-secrets` | Secrets Store | Armazena `ANTHROPIC_API_KEY` e outras credenciais de terceiros | Contiene `ANTHROPIC_API_KEY` y otras credenciales de terceros | via `wrangler secret put` |

## Leaderboard design

**Write path.** Um cliente envia uma tentativa para `math-challenge-ingest`. O Worker: (1) grava um ponto de dados no Analytics Engine (telemetria bruta — não grava linha no D1), (2) faz RPC ao `math-challenge-learner-do` da criança para atualizar o estado de domínio, (3) faz RPC ao `math-challenge-league-do` e/ou `math-challenge-classroom-do` relevantes com o delta da pontuação. Cada DO de liga/sala mantém as pontuações de seus ≤30 membros em sua própria tabela SQLite; a cada atualização ele reordena essas ≤30 linhas na memória (trivial) e envia novas classificações aos clientes conectados via WebSocket hibernável. É isso que torna as classificações de liga/sala “quase em tempo real” sem um primitivo global de conjunto ordenado, que a Cloudflare não fornece nativamente.

**Global and grade-band leaderboards take a different path.** Um Worker acionado por Cron (`math-challenge-leaderboard-cron`) dispara `math-challenge-leaderboard-rollup-workflow` a cada 30–60 segundos. O Workflow agrega totais (uma tabela de rollup D1 atualizada a partir do SQL do Analytics Engine, ou gravações D1 em lote), calcula o top‑N por faixa de série e globalmente, e grava blobs JSON em `math-challenge-leaderboard-kv`. As leituras tornam‑se chamadas simples de KV `get()` — baratas, distribuídas na borda, e explicitamente **não** em tempo real (30–60 s desatualizadas por design), o que evita totalmente o limite de 1 gravação/segundo/chave do KV.

**Cost per 1.000.000 attempts (rough order of magnitude, paid plan):** Workers ingestion requests, ~1M, dentro/um pouco acima do tier incluído de 10M/mês (≤$0,30). Writes no Analytics Engine, 1M chamadas `writeDataPoint()` — preço não tarifado encontrado na documentação atual; reconfirme antes de escalar. Requests a Durable Objects (liga/sala + learner DOs, ~2 chamadas/tentativa), ~2M, ≈$0,15–$0,30. Linhas SQLite de Durable Objects gravadas, 1–2M, dentro do tier incluído de 50M/mês a custo marginal $0. D1 rollup writes são agrupados a cada 30–60 s, portanto o custo não escala com o número de tentativas. Writes em KV ocorrem uma vez por chave por ciclo de rollup, não por tentativa.

**Net:** roughly **$0,50–$1,00 per million attempts** in direct primitive cost, dominated by Workers/DO request pricing rather than leaderboard-specific storage — because per-attempt writes are deliberately kept off D1 and off KV.

## Esboço do modelo de dados (D1)

```sql
-- Accounts
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('parent','teacher','admin')),
  email TEXT UNIQUE,
  locale TEXT NOT NULL DEFAULT 'en',
  created_at INTEGER NOT NULL
);

-- Children never get a direct login credential of their own kind that
-- collects full DOB; only a birth-year bucket, per COPPA minimization.
CREATE TABLE children (
  id TEXT PRIMARY KEY,
  parent_user_id TEXT NOT NULL REFERENCES users(id),
  display_name TEXT NOT NULL,
  grade_band TEXT NOT NULL,
  birth_year_bucket INTEGER,
  locale TEXT NOT NULL DEFAULT 'en',
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_children_parent ON children(parent_user_id);

CREATE TABLE classrooms (
  id TEXT PRIMARY KEY,
  teacher_user_id TEXT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  grade_band TEXT NOT NULL,
  join_code TEXT UNIQUE NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE classroom_members (
  classroom_id TEXT NOT NULL REFERENCES classrooms(id),
  child_id TEXT NOT NULL REFERENCES children(id),
  joined_at INTEGER NOT NULL,
  PRIMARY KEY (classroom_id, child_id)
);
CREATE INDEX idx_classroom_members_child ON classroom_members(child_id);

CREATE TABLE leagues (
  id TEXT PRIMARY KEY,
  grade_band TEXT NOT NULL,
  season_id TEXT NOT NULL,
  size_cap INTEGER NOT NULL DEFAULT 30,
  created_at INTEGER NOT NULL
);

CREATE TABLE league_members (
  league_id TEXT NOT NULL REFERENCES leagues(id),
  child_id TEXT NOT NULL REFERENCES children(id),
  joined_at INTEGER NOT NULL,
  PRIMARY KEY (league_id, child_id)
);
CREATE INDEX idx_league_members_child ON league_members(child_id);

-- Content bank
CREATE TABLE content_items (
  id TEXT PRIMARY KEY,
  subject TEXT NOT NULL,
  skill_tag TEXT NOT NULL,
  difficulty INTEGER NOT NULL,
  item_type TEXT NOT NULL,
  media_key TEXT,          -- R2 key in math-challenge-media
  version INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_content_items_skill ON content_items(subject, skill_tag, difficulty);

CREATE TABLE item_translations (
  item_id TEXT NOT NULL REFERENCES content_items(id),
  language TEXT NOT NULL,   -- one of the 5 supported languages
  prompt_text TEXT NOT NULL,
  choices_json TEXT,
  PRIMARY KEY (item_id, language)
);

-- Rollups (NOT raw attempts — those live in Analytics Engine)
CREATE TABLE score_totals (
  child_id TEXT NOT NULL REFERENCES children(id),
  period TEXT NOT NULL,     -- 'all_time' | 'season:<season_id>'
  total_score INTEGER NOT NULL DEFAULT 0,
  grade_band TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (child_id, period)
);
CREATE INDEX idx_score_totals_rank ON score_totals(period, grade_band, total_score DESC);

CREATE TABLE push_subscriptions (
  id TEXT PRIMARY KEY,
  child_id TEXT REFERENCES children(id),
  endpoint TEXT NOT NULL,
  keys_json TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE consent_records (
  id TEXT PRIMARY KEY,
  parent_user_id TEXT NOT NULL REFERENCES users(id),
  child_id TEXT REFERENCES children(id),
  consent_type TEXT NOT NULL,
  granted_at INTEGER NOT NULL,
  ip_hash TEXT
);
```

Linhas brutas de tentativas são **deliberadamente ausentes** deste esquema — elas residem em `math-challenge-attempts-ae` (Analytics Engine) e, para tudo que for necessário além da retenção de 3 meses, em `math-challenge-exports` (R2, via um pipeline periódico ou job de exportação de Worker).

## Implicações de design / riscos

1. **O teto de 10 GB/banco de dados do D1 é a primeira barreira rígida**, atingida por um erro de design (armazenar tentativas brutas no D1), não pelo crescimento de tráfego — a mitigação via Analytics Engine deve estar presente desde o primeiro commit, não ser adicionada retroativamente [2].
2. **Um único Durable Object “global” é um anti‑padrão** — um DO que lida com todos os gargalos de tráfego em ~500–1.000 req/s; ligas e salas de aula devem ser particionadas com um DO por entidade desde o primeiro dia [7].
3. **A propagação de pior caso de 60 segundos do KV e o `cacheTtl` mínimo de 30 segundos** significam que o placar global/por faixa de série nunca está realmente ao vivo — exiba isso na UI (“atualizado há um minuto”) para que as crianças não pensem que pontos ganhos desapareceram [11][12].
4. **O limite de 1 escrita por segundo por chave do KV** faz com que qualquer design de “incremento a cada tentativa” falhe sob carga de pico — o design de agregação via Workflow grava em cadência fixa.
5. **O cache do AI Gateway não deve ser aplicado uniformemente** — armazenar em cache um gateway de embeddings devolve silenciosamente vetores desatualizados, portanto as chamadas ao tutor e ao embedding RAG precisam de configurações de cache de gateway separadas se compartilharem um gateway.
6. **A replicação de leitura do D1 é apenas sequencialmente consistente, com atraso de pior caso ilimitado** — um fluxo de “ver sua própria pontuação imediatamente após enviar” deve usar o bookmark da Sessions API, não uma leitura sem restrições [3].
7. **A exclusão sob COPPA/GDPR‑K é um problema de deleção em quatro sistemas**: linhas do D1, armazenamento SQLite de DO, Analytics Engine (TTL de 3 meses ajuda mas não apaga sob demanda) e Vectorize (evitado aqui mantendo o Vectorize restrito apenas ao conteúdo curado). Os runbooks de exclusão devem enumerar todos os quatro.
8. **O Vectorize deve permanecer restrito ao banco de conteúdo/ dicas curado**, não a embeddings por criança — o teto de 10 milhões de vetores é real em escala, e vetores por criança são uma vulnerabilidade de privacidade sem uma história de exclusão limpa [16].
9. **A cobrança de armazenamento SQLite de DO começou em 7 de janeiro de 2026** — recente o suficiente para que modelos de custo antigos subestimem; verifique novamente a página de preços atual antes de um plano de capacidade [9].
10. **O Turnstile com usuários jovens, possivelmente não leitores, não foi testado aqui** — a faixa de série mais jovem provavelmente precisará de login mediado por pais, contornando a experiência de defesa contra bots para crianças.
11. **Web Push é inconsistente em dispositivos gerenciados por escolas** — iOS requer um PWA instalado na tela inicial no Safari 16.4+, e Chromebooks/iPads gerenciados por MDM frequentemente bloqueiam prompts de instalação; um fallback sem push (digest por e‑mail dos pais) é necessário para alcance.
12. **Qualquer consulta a `score_totals` sem o índice composto eventualmente atingirá o modo de falha por tempo de CPU do D1** à medida que a tabela cresce — verifique com `EXPLAIN QUERY PLAN` antes de lançar, não após um incidente [5].
13. **O preço de gravação do Analytics Engine não pôde ser confirmado nas docs atuais** — a estimativa de custo por milhão de tentativas assume que está incluído no plano Workers; verifique na página de preços ao vivo antes que entre no orçamento.

## Perguntas abertas para o proprietário do projeto

1. Quais faixas de série / intervalos de idade exatos estão no escopo (K–2, 3–5, 6–8, 9–12, adulto)? Direciona a partição do placar por faixa de série e a restrição de idade do COPPA (menor que 13 vs. 13+).
2. A retenção de 3 meses do Analytics Engine é aceitável para o histórico bruto de tentativas, ou um relatório de progresso ano a ano requer o caminho de arquivamento frio R2+Pipelines desde o primeiro dia?
3. Para qual pico concorrente de pior caso devemos projetar (por exemplo, um distrito inteiro no mesmo período de aula)? Define a granularidade de particionamento de DO.
4. “Tempo real” para a classificação das ligas é um requisito rígido de WebSocket subsegundo, ou uma atualização de alguns segundos é aceitável?
5. Um nível de tutor de IA sem limite deve existir, ou um limite diário estrito de gasto por criança no Claude está sempre em vigor?
6. Quais são exatamente as 5 línguas? Determina se o `m2m100` do Workers AI cobre todos os pares ou se alguns precisam de tradução humana/qualidade Claude para o lançamento.
7. As ligas são atribuídas automaticamente (coorte aleatória) ou curadas por professor/pais? Afeta o Workflow do ciclo de vida da liga e se `math-challenge-league-do` precisa de uma etapa de matchmaking.
8. Qual é a regra de resolução de conflitos para sincronização de progresso offline de PWA entre dois dispositivos?
9. Qual abordagem de identidade é preferida para contas de pais — magic link, passkeys ou federada? Afeta onde o Turnstile se posiciona e a estrutura da tabela `users`.
10. Qual é o teto de gasto mensal alvo para o AI Gateway? Necessário para dimensionar as 20 regras de limite de gasto e a política de modelo de fallback antecipadamente.

## Fontes

1. [Workers Platform Pricing](https://developers.cloudflare.com/workers/platform/pricing/) — tabelas de preços do D1, KV, Vectorize, Queues, Workers, Durable Objects. Acessado em 2026-07-31.
2. [D1 Platform Limits](https://developers.cloudflare.com/d1/platform/limits/) — limites de tamanho de banco de dados, armazenamento, consultas e conexões.
3. [D1 Read Replication (best practices)](https://developers.cloudflare.com/d1/best-practices/read-replication/) — modelo de consistência, regiões suportadas.
4. [D1 Read Replication Public Beta (changelog)](https://developers.cloudflare.com/changelog/post/2025-04-10-d1-read-replication-beta/) — 2025-04-10.
5. [D1 Debug / Error Reference](https://developers.cloudflare.com/d1/observability/debug-d1/) — modos de falha por tempo de CPU e sobrecarga.
6. [Durable Objects Pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/) — cobrança de computação e armazenamento SQLite.
7. [Durable Objects: Rules of Durable Objects](https://developers.cloudflare.com/durable-objects/best-practices/rules-of-durable-objects/) — orientações de taxa de transferência por objeto, anti‑padrões.
8. [SQLite in Durable Objects GA (changelog)](https://developers.cloudflare.com/changelog/post/2025-04-07-sqlite-in-durable-objects-ga/) — 2025-04-07, 10 GB por objeto.
9. [Billing for SQLite Storage (changelog)](https://developers.cloudflare.com/changelog/post/2025-12-12-durable-objects-sqlite-storage-billing/) — 2025-12-12, data de início da cobrança.
10. [KV: Read key-value pairs](https://developers.cloudflare.com/kv/api/read-key-value-pairs/) — leituras em lote, `cacheTtl`.
11. [KV: Write key-value pairs](https://developers.cloudflare.com/kv/api/write-key-value-pairs/) — limite de 1 escrita/segundo/chave, limites de gravação em lote.
12. [Reduced minimum cacheTtl for Workers KV (changelog)](https://developers.cloudflare.com/changelog/post/2026-01-30-kv-reduced-minimum-cachettl/) — 2026-01-30.
13. [Workers Analytics Engine — data point limits](https://developers.cloudflare.com/analytics/analytics-engine/limits/) — limites de blobs/doubles/índices/retenção.
14. [R2 Pricing](https://developers.cloudflare.com/r2/pricing/) — armazenamento, operações Classe A/B, saída.
15. [Vectorize indexes now support up to 10 million vectors (changelog)](https://developers.cloudflare.com/changelog/post/2026-01-23-increased-index-capacity/) — 2026-01-23.
16. [Workers AI Pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/) — preços por modelo (bge-m3, melotts, m2m100).
17. [AI Gateway: Spend limits](https://developers.cloudflare.com/ai-gateway/features/spend-limits/) — regras de orçamento, fallback de rota dinâmica, teto de 20 regras.
18. [AI Gateway: Caching](https://developers.cloudflare.com/ai-gateway/features/caching/) — escopo de cache e correspondência de requisições idênticas.
19. [Workers Platform Limits](https://developers.cloudflare.com/workers/platform/limits/) — limites da Cache API, limites de requisição/resposta.
20. [Cloudflare Web Analytics FAQ](https://developers.cloudflare.com/web-analytics/faq/) — comportamento de amostragem e retenção.
21. [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/) — modelo de implantação full‑stack relevante ao Astro em Workers.
22. [Configure your framework for Cloudflare automatically (changelog)](https://developers.cloudflare.com/changelog/post/2025-12-16-wrangler-autoconfig/) — 2025-12-16, confirma Astro como framework suportado.
23. [Workflows Pricing](https://developers.cloudflare.com/workflows/reference/pricing/) — requisições, tempo de CPU, armazenamento, etapas.
24. Anthropic `claude-api` skill, tabela de modelo/preço em cache (2026-06-24) — preços do Claude Opus 5 / Sonnet 5 / Haiku 4.5 usados para o plano de roteamento de modelo.
