# Arquitetura Cloudflare para o Math Challenge

> Pesquisa Math Challenge — 2026-07-31 — tópico 32

## Resumo executivo (tópicos)

Math Challenge es una PWA de práctica matemática construida enteramente sobre Cloudflare. La arquitectura propuesta usa **Workers + Astro** para el frontend/BFF, **D1** para datos relacionales (cuentas, contenido, membresías), **Durable Objects con almacenamiento SQLite** para estado en vivo de bajo cardinal (una liga de ~30, un salón, la sesión de un niño), **Analytics Engine** para telemetría de intentos de alto volumen (no D1 — D1 se queda sin espacio primero), **KV** para instantáneas de leaderboard global/por-grado recalculadas periódicamente, **R2** para medios y archivo frío, **Queues + Workflows** para calificación asíncrona y generación de explicaciones de IA, **Vectorize + Workers AI** para RAG multilingüe sobre el banco de pistas, y **AI Gateway** delante de la API de Claude para cachear, limitar tasa y poner tope de gasto al tutor "Larry" con enrutamiento de modelos. El límite que golpearemos primero no es cómputo: es el techo de almacenamiento de D1 (10 GB por base de datos en el plan de pago) si alguien intenta guardar cada intento ahí — por eso los intentos crudos van a Analytics Engine, no a D1.

## Resumo executivo (prosa)

Math Challenge is a PWA-first math practice app built entirely on Cloudflare. The proposed architecture uses **Workers + Astro** for the frontend/BFF, **D1** for relational data (accounts, content, memberships), **Durable Objects with SQLite storage** for low-cardinality live state (a league of ~30, a classroom, a child's session), **Analytics Engine** for high-volume attempt telemetry (not D1 — D1 runs out of storage first), **KV** for periodically-recomputed global/grade-band leaderboard snapshots, **R2** for media and cold archive, **Queues + Workflows** for async scoring and AI-explanation generation, **Vectorize + Workers AI** for multilingual RAG over the hint bank, and **AI Gateway** in front of the Claude API to cache, rate-limit, and spend-cap the "Larry" tutor with model routing. The limit we hit first is not compute — it is D1's storage ceiling (10 GB per database on the paid plan) if raw attempts are stored there. That is why raw attempts go to Analytics Engine, not D1.

## Product-to-primitive mapping

| Recurso | Primitivo | Por quê | Limite real que o restringe |
|---|---|---|---|
| Frontend + BFF, shell PWA | Workers (Astro via `@astrojs/cloudflare`, Static Assets) | Monorepo já executa Astro em Workers; configuração automática do framework para Astro existe desde dez/2025 [22][23] | Limites de CPU por request em Workers — não é uma restrição de curto prazo |
| Contas de pais/filhos/professores, catálogo de conteúdo, assinaturas | D1 | Relacional, transacional, barato nessa escala | 10 GB/banco de dados (pago), 500 MB (gratuito); 50.000 DBs/conta, 1 TB/conta [2] |
| Telemetria por tentativa (dezenas de milhares de usuários × muitas tentativas/dia) | Analytics Engine | Feito exatamente para isso: eventos de alta cardinalidade e escrita intensiva, sem modelo de cobrança por linha como D1 | 20 blobs / 20 doubles / 1 índice (96 B) por ponto, 250 pontos por invocação de Worker, retenção de 3 meses [13] |
| Liga ao vivo (~30) e classificação de salas de aula | Durable Objects (SQLite storage) | Um DO por liga/sala mantém taxa de requisição por objeto baixa (~30 escritores); ordenação em memória de 30 linhas é trivial, hibernação WebSocket oferece push quase em tempo real com custo quase zero em idle | Teto de throughput suave ~500–1.000 req/s por DO individual — deve-se particionar por liga/sala, nunca um DO global [7] |
| Leaderboard global / por faixa de série | KV (snapshot pré-calculado) + Workflow/Cron rollup | Leitura de KV é cacheada na borda e barata em escala de fan-out; visão global ordenada não precisa de frescor sub-segundo | KV: 1 escrita/segundo por chave, `cacheTtl` mínimo 30 s — não dá para escrever por tentativa, precisa agrupar [9][11][12] |
| Modelo de aprendizagem adaptativa por criança | Durable Object (SQLite) ou rollup D1, lido por Worker na seleção de questão | Precisa de leitura/escrita de baixa latência colocalizada com compute; DO oferece isolamento por criança | 10 GB de armazenamento por objeto DO [8] |
| Banco de conteúdo (5 idiomas, milhares de itens) | D1 (metadados) + R2 (assets de mídia: imagens/áudio) | D1 para linhas estruturadas consultáveis; R2 para grandes arquivos binários, sem taxa de saída | R2 não tem linguagem de consulta própria — combinar com índice D1 |
| Tutor de IA "Larry" (API Claude, roteamento de modelo) | Workers → AI Gateway → Claude API | AI Gateway fornece cache, limites de taxa e limites de gasto por usuário na chamada ao modelo | AI Gateway: máximo 20 regras de limite de gasto/portal [Spend limits] |
| Inferência local barata: embeddings, TTS, tradução | Workers AI | Executa na rede da Cloudflare, sem round-trip externo, precificação por modelo | Específico ao modelo: ex. bge-m3 $0,012/M tokens de entrada [17] |
| RAG sobre banco de dicas/explicações | Vectorize (embeddings de bge-m3) | Modelo de embedding multilíngue atende ao requisito de 5 idiomas | 10 M vetores/índice, 1.536 dimensões máx [16] |
| Pontuação assíncrona, geração de explicação de IA | Queues + Workflows | Desacopla a requisição de submissão de tentativa da geração mais lenta de explicação IA; Workflows dão retries duráveis | Queues: unidade de operação 64 KB, 100 K ops/dia grátis [Queues pricing]; Workflows: 500 K passos incluídos/mês [Workflows pricing] |
| Notificações push | Web Push (via Worker enviando payloads) + service worker PWA | Não é um produto CF distinto — Workers apenas envia; navegador/SO controla entrega | iOS Web Push requer Safari 16.4+ instalado na tela inicial; inconsistente em Chromebooks/iPads gerenciados por escolas |
| Jogo offline | Service worker PWA + Cache API + sync em background para `math-challenge-ingest` | Cache API é por Worker, não compartilhada globalmente | Objeto cacheado máx 512 MB, 1.000 chamadas Cache API/request (pago) [20] |
| Defesa contra bots no cadastro/login | Turnstile | Gratuito, WCAG 2.2 AA, modos não interativos/invisíveis adequados para crianças | Nenhum limite rígido de taxa encontrado nos documentos; verifique limites do plano antes do lançamento |
| Analytics de site que respeita privacidade | Web Analytics | RUM sem cookies, toggle de exclusão para UE | Retenção não amostrada de 7 dias, depois ~10% de amostragem [Web Analytics FAQ] |
| Controle de custo no gasto com Claude | AI Gateway (Billing Unificado, limites de gasto, roteamento dinâmico/fallback) | Um ponto único para visualizar e limitar todo o custo do tutor | 20 regras de limite de gasto/portal como teto |
| Hyperdrive | *(not used)* | Nenhum Postgres/MySQL externo neste design — D1 é o sistema de registro | N/A |
| Imagens/Stream | *(not used at launch)* | Conteúdo são ilustrações + áudio curto, servidos diretamente do R2; reconsiderar se aulas em vídeo forem adicionadas | N/A |

## Descobertas — notas por serviço

**D1.** Limites do plano pago: 10 GB por banco de dados, 50.000 bancos de dados por conta, 1 TB de armazenamento total da conta, duração máxima de consulta de 30 segundos, instrução SQL máxima de 100 KB, linha/BLOB máximo de 2 MB, 6 conexões simultâneas por Worker, 1.000 consultas por invocação do Worker [2]. Preços: 25 bilhões de linhas lidas incluídas/mês, depois $0,001 por milhão; 50 milhões de linhas gravadas incluídas, depois $1,00 por milhão; armazenamento $0,75/GB-mês além dos 5 GB incluídos [1]. **Read replication** está em beta público via a Sessions API, usando marcadores (bookmarks) para consistência sequencial (“read your own writes”, leituras monotônicas); a Cloudflare cria automaticamente uma réplica por região suportada (ENAM, WNAM, WEUR, EEUR, APAC, OC) sem custo adicional — a cobrança permanece inalterada [3][4]. O atraso da réplica é ilimitado no pior caso, portanto qualquer fluxo “aqui está sua nova pontuação” deve fixar no marcador da sessão de escrita, não em uma leitura sem restrição.

**Durable Objects.** O armazenamento SQLite está em GA com 10 GB por objeto [8]; um teto flexível de taxa de aproximadamente 500–1.000 solicitações/segundo se aplica **por objeto**, não por namespace — a própria orientação da Cloudflare classifica um único DO “global” como anti-padrão e exige particionamento por limite natural (por sala, por usuário, por liga) [7]. Computação (pago): 1 M de solicitações/mês incluídas, depois $0,15 por milhão; 400.000 GB-segundos incluídos, depois $12,50 por milhão de GB-s [1]. A cobrança de armazenamento para DOs baseados em SQLite (linhas espelham as tarifas do D1; armazenamento $0,20/GB-mês) começou em 7 de janeiro de 2026 — recente o suficiente para que modelos de custo mais antigos a subestimem [1][9].

**Workers KV.** Pago: 10 M de leituras/mês incluídas, depois $0,50 por milhão; 1 M de gravações/exclusões/listagens incluídas, depois $5,00 por milhão; 1 GB de armazenamento incluído, depois $0,50/GB-mês [Workers pricing]. Consistência eventual: gravações se propagam em até 60 segundos globalmente, ou no `cacheTtl` que você definir — o `cacheTtl` mínimo foi reduzido para 30 segundos em 2026 [12]. **Apenas uma gravação por chave por segundo** é permitido; mais disparam 429s [11]. Leituras em lote (100 chaves) e gravações em lote (10.000 pares, ≤100 MB) existem via a REST API [10][11]. Isso torna o KV inadequado para atualizações por tentativa e adequado para instantâneos atualizados periodicamente.

**Analytics Engine.** `writeDataPoint()` aceita até 20 blobs, 20 doubles, 1 índice (≤96 bytes); uma invocação de Worker pode gravar no máximo 250 pontos de dados; a carga útil de blob é limitada a 16 KB/ponto; a retenção é de três meses [13]. Não foi encontrado preço separado por gravação nos documentos obtidos — trate-o como incluído no plano Workers e reconfirme antes de comprometer um orçamento de volume; é a única cifra que este relatório não pôde obter com certeza.

**Queues.** Uma “operação” é cobrada por bloco de 64 KB lido/gravado/excluído; entregar uma mensagem normalmente custa 3 operações. Gratuito: 10.000 ops/dia. Pago: 1 M ops/mês incluídas, depois $0,40 por milhão. A retenção padrão é de 4 dias, configurável até 14 [Queues pricing].

**Workflows.** Solicitações e tempo de CPU compartilham os pools Workers (10 M de solicitações + $0,30 por milhão além; 30 M de CPU-ms + $0,02 por milhão além); armazenamento 1 GB + $0,20/GB-mês; etapas 500.000/mês incluídas + $0,80 por 100.000 adicionais [Workflows pricing]. A cobrança de etapas/armazenamento ainda não havia iniciado conforme o changelog citado — confirme a data de início antes de finalizar os modelos de custo.

**R2.** Armazenamento $0,015/GB-mês; Classe A (semelhante a gravação) $4,50 por milhão; Classe B (semelhante a leitura) $0,36 por milhão; saída (egress) gratuita. Camada gratuita: 10 GB-mês de armazenamento, 1 M Classe A, 10 M Classe B/mês [R2 pricing]. A ausência de taxa de saída é relevante para arquivo frio: exportações em lote/treinamento não custam nada para leitura.

**Vectorize.** Os índices agora suportam até 10 M vetores (aumento de 5 M em 2026-01-23), limitados a 1.536 dimensões/vetor [16]. Preços: 50 M de dimensões consultadas incluídas/mês, depois $0,01 por milhão; 10 M de dimensões armazenadas incluídas, depois $0,05/100 milhões [1].

**Workers AI.** Preços representativos: `@cf/baai/bge-m3` (incorporações multilíngues, corresponde ao banco de 5 idiomas) $0,012/M de tokens de entrada; `@cf/myshell-ai/melotts` (TTS) $0,0002/minuto de áudio; `@cf/meta/m2m100-1.2b` (tradução) $0,342/M de tokens de entrada/saída [17] — barato o suficiente para ser executado durante a autoria de conteúdo, não por solicitação.

**AI Gateway.** O cache se aplica apenas a solicitações idênticas de texto/imagem, sem cache semântico [Caching doc]. Limites de gasto são orçamentos baseados em custo definidos por modelo/fornecedor/metadados personalizados (por exemplo, por criança, por dia), limitados a 20 regras por gateway [Spend limits doc]. O roteamento dinâmico pode mudar automaticamente para um modelo mais barato quando um orçamento é atingido, em vez de bloquear rigidamente a solicitação.

**Turnstile.** Gratuito, WCAG 2.2 AA, oferece modos não interativos e totalmente invisíveis adequados ao fluxo de cadastro de crianças. Nenhum limite rígido de volume de solicitações foi encontrado nas páginas obtidas; confirme os limites do plano atual antes do lançamento.

**Web Analytics.** Gratuito, RUM sem cookies. Dados de beacon não amostrados são retidos por 7 dias e depois agregados em amostragem de ~10%; visitantes da UE podem ser excluídos com um clique [Web Analytics FAQ].

**Cache API.** Cache por data center e por Worker, distinto do cache de zona. Objeto máximo de 512 MB; 1.000 chamadas `put()`/`match()`/`delete()` por solicitação no plano pago (50 gratuitas), compartilhando a cota de sub-solicitações [20].

**Claude API / model routing.** Preços atuais (do skill `claude-api` incluído, em cache em 2026-06-24): Opus 5 $5/$25 por milhão de tokens de entrada/saída; Sonnet 5 $3/$15 (introdução $2/$10 até 2026-08-31); Haiku 4.5 $1/$5. Plano de roteamento de Larry: Sonnet 5 como explicador padrão, Haiku 4.5 para micro-cópias baratas de alto volume, e uma rara escalada ao nível Opus apenas para as explicações multi-passo mais difíceis — tudo controlado pelos limites de gasto do AI Gateway por criança por dia.

## Inventário de recursos proposto

Todo objeto tem o prefixo `math-challenge-` conforme exigido. Nomes de binding usam `UPPER_SNAKE_CASE`.

| Nome | Tipo | Propósito (EN) | Propósito (ES) | Binding |
|---|---|---|---|---|
| `math-challenge-web` | Worker (Astro, Static Assets) | Frontend PWA público + rotas BFF | Frontend PWA público + rutas BFF | n/a (Worker de entrada) |
| `math-challenge-ingest` | Worker | Valida e ingere envíos de intentos; escribe telemetría, encola calificación | Valida e ingiere envíos de intentos; escribe telemetría, encola calificación | n/a |
| `math-challenge-tutor` | Worker | Hospeda o tutor de IA “Larry”; chama Claude via AI Gateway com RAG | Aloja al tutor de IA "Larry"; llama a Claude vía AI Gateway con RAG | n/a |
| `math-challenge-leaderboard-cron` | Worker (Cron Trigger) | Dispara o Workflow periódico de recálculo de leaderboard | Dispara el Workflow periódico de recálculo de leaderboard | n/a |
| `math-challenge-db` | D1 database | Sistema de registro: usuários, crianças, salas, ligas, metadados de conteúdo, consentimento | Registro maestro: usuarios, niños, salones, ligas, metadatos de contenido, consentimiento | `DB` |
| `math-challenge-league-do` | Durable Object class (SQLite) | Estado em tempo real + broadcast WebSocket para uma liga de ~30 | Estado en vivo + difusión WebSocket de una liga de ~30 | `LEAGUE_DO` |
| `math-challenge-classroom-do` | Durable Object class (SQLite) | Estado em tempo real para a lista e classificação de uma sala | Estado en vivo del roster y clasificación de un salón | `CLASSROOM_DO` |
| `math-challenge-learner-do` | Durable Object class (SQLite) | Modelo adaptativo de aprendizagem por criança (estimativas de domínio, estado de seleção de itens) | Modelo de aprendizaje adaptativo por niño | `LEARNER_DO` |
| `math-challenge-ratelimiter-do` | Durable Object class (SQLite) | Limitação de taxa fragmentada (tentativas de login, chamadas ao tutor, cadastro) | Limitación de tasa fragmentada (inicios de sesión, llamadas al tutor, registro) | `RATE_LIMITER_DO` |
| `math-challenge-leaderboard-kv` | KV namespace | Snapshots pré-calculados do leaderboard global/por faixa de série | Instantáneas precalculadas del leaderboard global/por-grado | `LEADERBOARD_KV` |
| `math-challenge-config-kv` | KV namespace | Flags de recurso e cache do catálogo de conteúdo | Feature flags y caché del catálogo de contenido | `CONFIG_KV` |
| `math-challenge-session-kv` | KV namespace | Tokens de sessão/autenticação de curta duração | Tokens de sesión/autenticación de corta duración | `SESSION_KV` |
| `math-challenge-media` | R2 bucket | Imagens, áudios e ilustrações dos itens | Imágenes, audio e ilustraciones de los reactivos | `MEDIA_BUCKET` |
| `math-challenge-exports` | R2 bucket | Arquivo frio de tentativas expiradas; exportações para solicitações COPPA/GDPR | Archivo frío de intentos vencidos; exportaciones para solicitudes COPPA/GDPR | `EXPORTS_BUCKET` |
| `math-challenge-scoring-queue` | Queue | Jobs assíncronos de pontuação + atualização do modelo de aprendizagem | Trabajos asíncronos de calificación y actualización del modelo de aprendizaje | `SCORING_QUEUE` |
| `math-challenge-scoring-dlq` | Queue (dead-letter) | Jobs de pontuação falhados após tentativas máximas | Trabajos de calificación fallidos tras reintentos máximos | `SCORING_DLQ` |
| `math-challenge-ai-explain-queue` | Queue | Requests assíncronos de geração de explicações de IA | Solicitudes asíncronas de generación de explicaciones de IA | `AI_EXPLAIN_QUEUE` |
| `math-challenge-ai-explain-dlq` | Queue (dead-letter) | Jobs de explicação falhados após tentativas máximas | Trabajos de explicación fallidos tras reintentos máximos | `AI_EXPLAIN_DLQ` |
| `math-challenge-leaderboard-rollup-workflow` | Workflow | Cálculo periódico do leaderboard global/por faixa de série | Cálculo periódico del leaderboard global/por-grado | `LEADERBOARD_WORKFLOW` |
| `math-challenge-onboarding-workflow` | Workflow | Configuração multi-passo de conta + perfil de criança + consentimento | Configuración multi-paso de cuenta + perfil de niño + consentimiento | `ONBOARDING_WORKFLOW` |
| `math-challenge-explanations-index` | Vectorize index | Índice RAG multilíngue sobre dicas/explicações curadas | Índice RAG multilingüe sobre pistas/explicaciones curadas | `EXPLANATIONS_INDEX` |
| `math-challenge-tutor-gateway` | AI Gateway | Cache, limites de taxa, limites de gasto, roteamento de modelo para chamadas Claude | Caché, límites de tasa, límites de gasto y enrutamiento de modelos para Claude | (gateway ID em `ANTHROPIC_BASE_URL`) |
| `math-challenge-attempts-ae` | Analytics Engine dataset | Telemetria por tentativa (alta cardinalidade, alto volume) | Telemetría por intento (alta cardinalidad, alto volumen) | `ATTEMPTS_AE` |
| `math-challenge-tutor-usage-ae` | Analytics Engine dataset | Telemetria de uso/custo do tutor (por criança, por modelo) | Telemetría de uso/costo del tutor (por niño, por modelo) | `TUTOR_AE` |
| `math-challenge-turnstile-signup` | Turnstile widget | Defesa contra bots em formulários de cadastro/login | Defensa contra bots en formularios de registro/inicio de sesión | (site key/secret via env) |
| `math-challenge-web-analytics` | Web Analytics site | RUM focado em privacidade para a PWA | RUM respetuoso de la privacidad para la PWA | (JS snippet, no binding) |
| `math-challenge-secrets` | Secrets Store | Contém `ANTHROPIC_API_KEY` e outras credenciais de terceiros | Contiene `ANTHROPIC_API_KEY` y otras credenciales de terceros | via `wrangler secret put` |

## Design do leaderboard

**Caminho de escrita.** Um cliente envia uma tentativa para `math-challenge-ingest`. O Worker: (1) grava um ponto de dados no Analytics Engine (telemetria bruta — não grava uma linha no D1), (2) faz RPC ao `math-challenge-learner-do` da criança para atualizar o estado de domínio, (3) faz RPC ao `math-challenge-league-do` e/ou `math-challenge-classroom-do` relevantes com o delta da pontuação. Cada DO de liga/sala mantém as pontuações de ≤30 membros em sua própria tabela SQLite; a cada atualização ele reordena essas ≤30 linhas na memória (trivial) e envia novas classificações aos clientes conectados via WebSocket hibernável. Isso é o que torna as classificações de liga/sala “quase em tempo real” sem um primitive de conjunto ordenado global, que a Cloudflare não oferece nativamente.

**Leaderboards globais e por faixa de série seguem caminho diferente.** Um Worker acionado por Cron (`math-challenge-leaderboard-cron`) dispara `math-challenge-leaderboard-rollup-workflow` a cada 30–60 segundos. O Workflow agrega totais (uma tabela de rollup D1 atualizada a partir de SQL do Analytics Engine, ou gravações D1 em lote), calcula o top-N por faixa de série e globalmente, e grava blobs JSON em `math-challenge-leaderboard-kv`. As leituras passam então a ser chamadas simples `get()` do KV — baratas, distribuídas na borda e explicitamente **não** em tempo real (30–60 s de atraso por design), o que evita totalmente o limite de 1 gravação/segundo/chave do KV.

**Custo por 1000000 de tentativas (ordem de grandeza aproximada, plano pago):** solicitações de Workers de ingestão, ~1 M, dentro ou ligeiramente acima da camada incluída de 10 M/mês (≤US$ 0,30). Gravações no Analytics Engine, 1 M de chamadas `writeDataPoint()` — preço não tarifado nos documentos atuais; reconfirme antes de escalar. Solicitações a Durable Objects (liga/sala + learner DOs, ~2 chamadas/tentativa), ~2 M, ≈US$ 0,15–0,30. Linhas SQLite em Durable Objects gravadas, 1–2 M, dentro da camada incluída de 50 M/mês a custo marginal $0. Writes de rollup D1 são em lote a cada 30–60 s, portanto o custo não escala com o número de tentativas. Gravações KV ocorrem uma vez por chave por ciclo de rollup, não por tentativa.

**Resultado:** aproximadamente **US$ 0,50–1,00 por milhão de tentativas** em custo direto de primitives, dominado pelo preço de solicitações Workers/DO ao invés de armazenamento específico do leaderboard — porque gravações por tentativa são deliberadamente mantidas fora do D1 e do KV.

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

Linhas brutas de tentativa são **deliberadamente ausentes** deste esquema — elas vivem em `math-challenge-attempts-ae` (Analytics Engine) e, para tudo que for necessário além da retenção de 3-month, em `math-challenge-exports` (R2, via um periodic Pipeline ou Worker export job).

## Implicações de design / riscos

1. **O teto de 10 GB/banco de dados do D1 é a primeira barreira rígida**, atingida por um erro de design (armazenar tentativas brutas no D1), não pelo crescimento de tráfego — a mitigação via Analytics Engine deve estar presente desde o primeiro commit, não ser adicionada retroativamente [2].
2. **Um único Durable Object “global” é um anti-padrão** — um DO que lida com todos os gargalos de tráfego em ~500–1.000 req/s; ligas e salas de aula devem ser particionadas um-DO-por-entidade desde o primeiro dia [7].
3. **A propagação de pior caso de 60 segundos do KV e o `cacheTtl` mínimo de 30 segundos** significam que o placar global/por faixa de série nunca está realmente ao vivo — exponha isso na UI (“updated a minute ago”) para que as crianças não pensem que pontos ganhos desapareceram [11][12].
4. **O limite de 1 escrita por segundo por chave do KV** faz com que qualquer design de “incrementar a cada tentativa” falhe sob carga de pico — o design de rollup-via-Workflow grava em cadência fixa.
5. **O cache do AI Gateway não deve ser aplicado uniformemente** — armazenar em cache um gateway de embeddings devolve silenciosamente vetores desatualizados, portanto as chamadas ao tutor e ao embedding RAG precisam de configurações de cache de gateway separadas se compartilharem um gateway.
6. **A replicação de leitura do D1 é apenas sequencialmente consistente, com atraso de pior caso ilimitado** — um fluxo de “see your own score immediately after submitting” deve usar o bookmark da Sessions API, não uma leitura sem restrições [3].
7. **A exclusão sob COPPA/GDPR-K é um problema de deleção em quatro sistemas**: linhas do D1, armazenamento SQLite de DO, Analytics Engine (TTL de 3-month ajuda mas não apaga sob demanda) e Vectorize (evitado aqui mantendo o Vectorize restrito apenas ao conteúdo curado). Os runbooks de exclusão devem enumerar todos os quatro.
8. **O Vectorize deve permanecer restrito ao banco de conteúdo/ dicas curado**, não a embeddings por criança — o teto de 10 M-vector é real em escala, e vetores por criança são uma vulnerabilidade de privacidade sem uma história de exclusão limpa [16].
9. **A cobrança de armazenamento SQLite de DO começou em 7 de janeiro de 2026** — recente o suficiente para que modelos de custo antigos subestimem; verifique novamente a página de preços atual antes de um plano de capacidade [9].
10. **Turnstile com usuários jovens, possivelmente não leitores, não foi testado aqui** — a faixa de série mais jovem provavelmente precisará de login mediado por pais, contornando a experiência de defesa contra bots para crianças.
11. **Web Push é inconsistente em dispositivos gerenciados por escolas** — iOS requer um PWA instalado na tela inicial no Safari 16.4+, e Chromebooks/iPads gerenciados por MDM frequentemente bloqueiam prompts de instalação; uma alternativa sem push (digest por e-mail dos pais) é necessária para alcance.
12. **Qualquer consulta a `score_totals` sem o índice composto eventualmente atingirá o modo de falha por tempo de CPU do D1** à medida que a tabela cresce — verifique com `EXPLAIN QUERY PLAN` antes de lançar, não após um incidente [5].
13. **O preço de gravação do Analytics Engine não pôde ser confirmado nas docs atuais** — a estimativa de custo por milhão de tentativas assume que está incluído no plano Workers; verifique na página de preços ao vivo antes que entre em um orçamento.

## Perguntas abertas para o dono do projeto
1. Quais faixas de série / intervalos de idade exatos estão no escopo (K–2, 3–5, 6–8, 9–12, adulto)? Isso orienta a partição do placar por faixa de série e a restrição de idade do COPPA (menores de 13 vs. 13+).
2. A retenção de 3-month do Analytics Engine é aceitável para o histórico bruto de tentativas, ou um relatório de progresso ano a ano requer o caminho de arquivamento frio R2+Pipelines desde o primeiro dia?
3. Para qual pico concorrente de pior caso devemos projetar (por exemplo, um distrito inteiro no mesmo período de aula)? Define a granularidade de particionamento de DO.
4. “Tempo real” para a classificação das ligas é um requisito rígido de WebSocket sub-segundo, ou uma atualização de alguns segundos é aceitável?
5. Um nível de tutor de IA sem limite deve existir, ou um limite diário estrito de gasto por criança no Claude está sempre em vigor?
6. Quais são exatamente as 5 línguas? Determina se o `m2m100` do Workers AI cobre todos os pares ou se alguns precisam de tradução humana/de qualidade Claude para o lançamento.
7. As ligas são atribuídas automaticamente (coorte aleatória) ou curadas por professor/pais? Afeta o Workflow do ciclo de vida da liga e se `math-challenge-league-do` precisa de uma etapa de matchmaking.
8. Qual é a regra de resolução de conflitos para sincronização de progresso offline de PWA entre dois dispositivos?
9. Qual abordagem de identidade é preferida para contas de pais — magic link, passkeys ou federada? Afeta onde o Turnstile se posiciona e a estrutura da tabela `users`.
10. Qual é o teto de gasto mensal alvo para o AI Gateway? Necessário para dimensionar as 20 regras de limite de gasto e a política de modelo de fallback antecipadamente.

## Fontes

1. [Workers Platform Pricing](https://developers.cloudflare.com/workers/platform/pricing/) — tabelas de preços do D1, KV, Vectorize, Queues, Workers e Durable Objects. Acessado 2026-07-31.  
2. [D1 Platform Limits](https://developers.cloudflare.com/d1/platform/limits/) — limites de tamanho de banco de dados, armazenamento, consultas e conexões.  
3. [D1 Read Replication (best practices)](https://developers.cloudflare.com/d1/best-practices/read-replication/) — modelo de consistência, regiões suportadas.  
4. [D1 Read Replication Public Beta (changelog)](https://developers.cloudflare.com/changelog/post/2025-04-10-d1-read-replication-beta/) — 2025-04-10.  
5. [D1 Debug / Error Reference](https://developers.cloudflare.com/d1/observability/debug-d1/) — modos de falha por tempo de CPU e sobrecarga.  
6. [Durable Objects Pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/) — cobrança de computação e armazenamento SQLite.  
7. [Durable Objects: Rules of Durable Objects](https://developers.cloudflare.com/durable-objects/best-practices/rules-of-durable-objects/) — orientações de taxa de transferência por objeto, anti-padrões.  
8. [SQLite in Durable Objects GA (changelog)](https://developers.cloudflare.com/changelog/post/2025-04-07-sqlite-in-durable-objects-ga/) — 2025-04-07, 10 GB por objeto.  
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
19. [Workers Platform Limits](https://developers.cloudflare.com/workers/platform/limits/) — limites da API de Cache, limites de requisição/resposta.  
20. [Cloudflare Web Analytics FAQ](https://developers.cloudflare.com/web-analytics/faq/) — comportamento de amostragem e retenção.  
21. [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/) — modelo de implantação full-stack relevante ao Astro em Workers.  
22. [Configure your framework for Cloudflare automatically (changelog)](https://developers.cloudflare.com/changelog/post/2025-12-16-wrangler-autoconfig/) — 2025-12-16, confirma Astro como framework suportado.  
23. [Workflows Pricing](https://developers.cloudflare.com/workflows/reference/pricing/) — requisições, tempo de CPU, armazenamento, etapas.  
24. Anthropic `claude-api` skill, cached model/pricing table (2026-06-24) — preços do Claude Opus 5 / Sonnet 5 / Haiku 4.5 usados para o plano de roteamento de modelo.
