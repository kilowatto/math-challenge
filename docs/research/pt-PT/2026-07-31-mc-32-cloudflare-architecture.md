# Arquitetura Cloudflare para o Math Challenge

> Math Challenge research — 2026-07-31 — topic 32

> Math Challenge pesquisa — 2026-07-31 — tópico 32

## Resumo executivo (ES)

Math Challenge é uma PWA de prática matemática construída inteiramente sobre a Cloudflare. A arquitetura proposta usa **Workers + Astro** para o frontend/BFF, **D1** para dados relacionais (contas, conteúdo, adesões), **Durable Objects com armazenamento SQLite** para estado ao vivo de baixa cardinalidade (uma liga de ~30, uma sala de aula, a sessão de uma criança), **Analytics Engine** para telemetria de tentativas de alto volume (não D1 — D1 fica sem espaço primeiro), **KV** para instantâneos de leaderboard global/por série recalculados periodicamente, **R2** para media e ficheiro frio, **Queues + Workflows** para classificação assíncrona e geração de explicações de IA, **Vectorize + Workers AI** para RAG multilingue sobre o banco de pistas, e **AI Gateway** à frente da API do Claude para cachear, limitar taxa e colocar limite de gasto ao tutor “Larry” com encaminhamento de modelos. O limite que atingiremos primeiro não é computação: é o teto de armazenamento do D1 (10 GB por base de dados no plano pago) se alguém tentar guardar cada tentativa lá — por isso as tentativas brutas vão para o Analytics Engine, não para o D1.

## Resumo executivo (EN)

Math Challenge is a PWA‑first math practice app built entirely on Cloudflare. The proposed architecture uses **Workers + Astro** for the frontend/BFF, **D1** for relational data (accounts, content, memberships), **Durable Objects with SQLite storage** for low‑cardinality live state (a league of ~30, a classroom, a child's session), **Analytics Engine** for high‑volume attempt telemetry (not D1 — D1 runs out of storage first), **KV** for periodically‑recomputed global/grade‑band leaderboard snapshots, **R2** for media and cold archive, **Queues + Workflows** for async scoring and AI‑explanation generation, **Vectorize + Workers AI** for multilingual RAG over the hint bank, and **AI Gateway** in front of the Claude API to cache, rate‑limit, and spend‑cap the “Larry” tutor with model routing. The limit we hit first is not compute — it is D1's storage ceiling (10 GB per database on the paid plan) if raw attempts are stored there. That is why raw attempts go to Analytics Engine, not D1.

## Mapeamento produto‑para‑primitivo

| Funcionalidade | Primitivo | Porquê | Limite real que o restringe |
|---|---|---|---|
| Frontend + BFF, shell PWA | Workers (Astro via `@astrojs/cloudflare`, recursos estáticos) | Monorepo já executa Astro em Workers; a auto‑configuração do framework para Astro existe desde dez‑2025 [22][23] | Limites de CPU por pedido nos Workers — não é uma restrição a curto prazo |
| Contas de pai/filho/professor, catálogo de conteúdo, adesões | D1 | Relacional, transacional, barato a esta escala | 10 GB/base de dados (pago), 500 MB (gratuito); 50.000 bases de dados/conta, 1 TB/conta [2] |
| Telemetria por tentativa (dezenas de milhares de utilizadores × muitas tentativas/dia) | Analytics Engine | Construído exatamente para isto: eventos de escrita intensiva e alta cardinalidade, sem modelo de cobrança por linha como o D1 | 20 blobs / 20 doubles / 1 índice (96 B) por ponto, 250 pontos por invocação de Worker, retenção de 3 meses [13] |
| Liga ao vivo (~30) e classificações de sala de aula | Durable Objects (SQLite storage) | Um DO por liga/sala de aula mantém a taxa de pedidos por objeto baixa (~30 escritores), ordenação completa em memória de 30 linhas é trivial, a hibernação de WebSocket fornece push quase em tempo real a custo quase nulo em idle | Teto de taxa suave ~500–1.000 req/s por DO individual — deve ser fragmentado por liga/sala de aula, nunca um DO global [7] |
| Classificação global / por série | KV (snapshot pré‑calculado) + Workflow/Cron rollup | Leitura KV é cacheada na edge e barata a escala de fan‑out; uma vista global ordenada não necessita de frescura sub‑segundo | KV: 1 escrita/seg por chave, `cacheTtl` mínimo 30 s — não pode escrever por tentativa, tem de agrupar [9][11][12] |
| Modelo de aprendizagem adaptativo por criança | Durable Object (SQLite) ou rollup D1, lido por Worker na hora da seleção da questão | Necessita de leitura/escrita de baixa latência co‑localizada com o compute; DO oferece isolamento por criança | 10 GB de armazenamento por objeto DO [8] |
| Banco de conteúdo (5 idiomas, milhares de itens) | D1 (metadados) + R2 (ativos de media: imagens/áudio) | D1 para linhas estruturadas consultáveis; R2 para ativos binários grandes, sem taxa de saída | R2 não tem linguagem de consulta própria — combinar com índice D1 |
| Tutor IA “Larry” (API Claude, encaminhamento de modelo) | Workers → AI Gateway → Claude API | AI Gateway fornece cache, limites de taxa e limites de gasto por utilizador na frente da chamada ao modelo | AI Gateway: máx. 20 regras de limite de gasto/portal [Spend limits] |
| Inferência local barata: embeddings, TTS, tradução | Workers AI | Funciona na rede da Cloudflare, sem ida e volta externa, tarifação por modelo | Específico do modelo: p. ex. bge-m3 $0,012/M tokens de entrada [17] |
| RAG sobre banco de dicas/explicações | Vectorize (embeddings from bge-m3) | Modelo de embedding multilingue corresponde ao requisito de 5 idiomas | 10 M vetores/índice, máximo 1.536 dimensões [16] |
| Pontuação assíncrona, geração de explicação IA | Queues + Workflows | Desacopla o pedido de submissão de tentativa da geração mais lenta de explicação IA; Workflows fornecem tentativas duráveis | Queues: unidade de operação 64 KB, 100 K ops/dia grátis [Queues pricing]; Workflows: 500 K passos incluídos/mês [Workflows pricing] |
| Notificações push | Web Push (via um Worker a enviar payloads) + service worker PWA | Não é um produto CF distinto — Workers é apenas o remetente; o navegador/SO controla a entrega | Web Push iOS requer Safari 16.4+ instalado na tela inicial; inconsistente em Chromebooks/iPads geridos por escolas |
| Jogo offline | Service worker PWA + Cache API + sync em background para `math-challenge-ingest` | Cache API é por Worker, não partilhada globalmente | 512 MB máximo de objeto em cache, 1.000 chamadas Cache API/pedido (pago) [20] |
| Defesa contra bots no registo/login | Turnstile | Gratuito, WCAG 2.2 AA, modos não interativos/invisíveis adequados a crianças | Nenhum limite de taxa rígido encontrado nos documentos obtidos; verificar limites do plano atual antes do lançamento |
| Analytics de site respeitadores da privacidade | Web Analytics | RUM sem cookies, alternância de exclusão da UE | Retenção não amostrada de 7 dias, depois ~10 % de amostragem [Web Analytics FAQ] |
| Controlo de custos no gasto com Claude | AI Gateway (Facturação Unificada, limites de gasto, encaminhamento dinâmico/alternativo) | Um único local para ver e limitar toda a despesa do tutor | 20 regras de limite de gasto/portal |
| Hyperdrive | *(not used)* | Nenhum Postgres/MySQL externo neste design — D1 é o sistema de registo | N/A |
| Imagens/Fluxo | *(not used at launch)* | O conteúdo são ilustrações + áudio curto, servidos diretamente a partir de R2; rever se forem adicionadas aulas em vídeo | N/A |

## Conclusões — notas por serviço

**D1.** Limites do plano pago: 10 GB por base de dados, 50.000 bases de dados por conta, 1 TB de armazenamento total da conta, duração máxima de consulta de 30 segundos, instrução SQL máxima de 100 KB, linha/BLOB máximo de 2 MB, 6 ligações simultâneas por Worker, 1.000 consultas por invocação do Worker [2]. Preços: 25 mil milhões de linhas lidas incluídas por mês e depois $0.001 por milhão; 50 milhões de linhas escritas incluídas e depois $1,00 por milhão; armazenamento $0.75/GB‑mês além dos 5 GB incluídos [1]. **Read replication** está em beta público através da Sessions API, usando marcadores para consistência sequencial (“read your own writes”, leituras monotónicas); a Cloudflare cria automaticamente uma réplica por região suportada (ENAM, WNAM, WEUR, EEUR, APAC, OC) sem custo adicional — a faturação permanece inalterada [3][4]. O atraso da réplica é ilimitado no pior caso, pelo que qualquer fluxo “here’s your new score” tem de ser fixado no marcador da sessão de escrita, e não numa leitura sem restrições.

**Durable Objects.** O armazenamento SQLite está em GA com 10 GB por objeto [8]; um teto suave de taxa de cerca de 500–1.000 pedidos/segundo aplica‑se **por objeto**, não por namespace — a própria orientação da Cloudflare considera um único DO “global” um anti‑padrão e exige fragmentação por limite natural (por sala, por utilizador, por liga) [7]. Computação (pago): 1 M pedidos/mês incluídos e depois $0.15 por milhão; 400.000 GB‑segundos incluídos e depois $12,50 por milhão de GB‑s [1]. A faturação de armazenamento para DOs com SQLite (as linhas refletem as tarifas do D1; armazenamento $0.20/GB‑mês) começou a 7 de janeiro de 2026 — recente o suficiente para que modelos de custo mais antigos a subestimem [1][9].

**Workers KV.** Pago: 10 M leituras/mês incluídas e depois $0.50 por milhão; 1 M gravações/eliminações/listagens incluídas e depois $5,00 por milhão; 1 GB de armazenamento incluído e depois $0.50/GB‑mês [Workers pricing]. Consistência eventual: as gravações propagam‑se em até 60 segundos a nível mundial, ou no `cacheTtl` que definir — o `cacheTtl` mínimo foi reduzido para 30 segundos em 2026 [12]. **Only one write per key per second** é permitido; mais disparam 429s [11]. Leituras em lote (100 chaves) e gravações em lote (10.000 pares, ≤100 MB) estão disponíveis através da API REST [10][11]. Isto torna o KV inadequado para atualizações por tentativa e adequado para instantâneos atualizados periodicamente.

**Analytics Engine.** `writeDataPoint()` aceita até 20 blobs, 20 doubles, 1 índice (≤96 bytes); uma invocação de Worker pode gravar no máximo 250 pontos de dados; a carga útil do blob está limitada a 16 KB/ponto; a retenção é de três meses [13]. Não foi encontrado um preço separado por gravação nos documentos obtidos — trate‑o como incluído no plano Workers e reconfirme antes de comprometer um orçamento de volume; é a única cifra que este relatório não conseguiu obter com certeza.

**Queues.** Uma “operação” é cobrada por bloco de 64 KB lido/escrito/eliminado; entregar uma mensagem costuma custar 3 operações. Gratuito: 10.000 ops/dia. Pago: 1 M ops/mês incluídas e depois $0.40 por milhão. A retenção é de 4 dias por defeito, configurável até 14 dias [Queues pricing].

**Workflows.** Os pedidos e o tempo de CPU partilham os pools Workers (10 M pedidos + $0.30 por milhão além; 30 M CPU‑ms + $0.02 por milhão além); armazenamento 1 GB + $0.20/GB‑mês; passos 500.000/mês incluídos + $0.80 por 100.000 adicionais [Workflows pricing]. A faturação de passos/armazenamento ainda não tinha começado na data do changelog citado — confirme a data de início antes de finalizar os modelos de custo.

**R2.** Armazenamento $0.015/GB‑mês; Classe A (semelhante a escrita) $4,50 por milhão; Classe B (semelhante a leitura) $0.36 por milhão; saída (egress) gratuita. Camada gratuita: 10 GB‑mês de armazenamento, 1 M Classe A, 10 M Classe B/mês [R2 pricing]. A ausência de taxa de saída é relevante para ficheiro frio: exportações em lote/extrações para treino não custam nada para ler.

**Vectorize.** Os índices agora suportam até 10 M vetores (aumentado de 5 M em 2026-01-23), limitados a 1.536 dimensões/vetor [16]. Preços: 50 M dimensões consultadas incluídas/mês e depois $0.01 por milhão; 10 M dimensões armazenadas incluídas e depois $0.05 por 100 milhões [1].

**Workers AI.** Preços representativos: `@cf/baai/bge-m3` (embeddings multilingues, corresponde ao banco de 5 línguas) $0.012/M tokens de entrada; `@cf/myshell-ai/melotts` (TTS) $0.0002/minuto de áudio; `@cf/meta/m2m100-1.2b` (tradução) $0.342/M tokens de entrada/saída [17] — barato o suficiente para ser executado durante a criação de conteúdo, não por pedido.

**AI Gateway.** O cache aplica‑se apenas a pedidos idênticos de texto/imagem, sem cache semântico [Caching doc]. Os limites de despesa são orçamentos baseados em custos definidos por modelo/fornecedor/metadados personalizados (por exemplo, por criança, por dia), limitados a 20 regras por gateway [Spend limits doc]. O encaminhamento dinâmico pode recuar para um modelo mais barato automaticamente quando um orçamento é atingido, em vez de bloquear rigidamente o pedido.

**Turnstile.** Gratuito, WCAG 2.2 AA, oferece modos não interativos e totalmente invisíveis adequados a um fluxo de registo de crianças. Nenhum limite rígido de volume de pedidos apareceu nas páginas obtidas; confirme os limites do plano atual antes do lançamento.

**Web Analytics.** Gratuito, RUM sem cookies. Dados de beacon não amostrados são retidos por 7 dias e depois agregados a uma amostragem de ~10 %; visitantes da UE podem ser excluídos com um clique [Web Analytics FAQ].

**Cache API.** Cache por centro de dados, por Worker, distinta da cache de zona. Objeto máximo 512 MB; 1.000 chamadas `put()`/`match()`/`delete()` por pedido em plano pago (50 gratuitas), partilhando a quota de sub‑pedidos [20].

**Claude API / model routing.** Preços atuais (do skill `claude-api` incluído, em cache a 2026-06-24): Opus 5 $5/$25 por milhão de tokens de entrada/saída; Sonnet 5 $3/$15 (intro $2/$10 até 2026-08-31); Haiku 4.5 $1/$5. Plano de encaminhamento de Larry: Sonnet 5 como explicador predefinido, Haiku 4.5 para micro‑cópia barata e de alto volume, e uma rara escalada ao nível Opus apenas para as explicações multi‑passo mais difíceis — tudo controlado pelos limites de despesa do AI Gateway por criança por dia.

## Inventário de recursos proposto

Cada objeto tem o prefixo `math-challenge-` conforme exigido. Os nomes de ligação utilizam `UPPER_SNAKE_CASE`.

| Nome | Tipo | Propósito (EN) | Propósito (ES) | Ligação |
|---|---|---|---|---|
| `math-challenge-web` | Worker (Astro, Static Assets) | Front‑end PWA público + rotas BFF | Frontend PWA público + rutas BFF | n/a (Worker de entrada) |
| `math-challenge-ingest` | Worker | Valida e ingere submissões de tentativas; grava telemetria, enfileira pontuação | Valida e ingiere envíos de intentos; escribe telemetría, encola calificación | n/a |
| `math-challenge-tutor` | Worker | Hospeda o tutor de IA “Larry”; invoca Claude via AI Gateway com RAG | Aloja al tutor de IA "Larry"; llama a Claude vía AI Gateway con RAG | n/a |
| `math-challenge-leaderboard-cron` | Worker (Cron Trigger) | Aciona o Workflow periódico de agregação do leaderboard | Dispara el Workflow periódico de recálculo de leaderboard | n/a |
| `math-challenge-db` | D1 database | Sistema de registo: utilizadores, crianças, salas de aula, ligas, metadados de conteúdo, consentimento | Registro maestro: utilizadores, niños, salones, ligas, metadatos de contenido, consentimiento | `DB` |
| `math-challenge-league-do` | Durable Object class (SQLite) | Estado em tempo real + difusão WebSocket para uma liga de ~30 | Estado en vivo + difusión WebSocket de una liga de ~30 | `LEAGUE_DO` |
| `math-challenge-classroom-do` | Durable Object class (SQLite) | Estado em tempo real para o registo e classificação de uma sala de aula | Estado en vivo del roster y clasificación de un salón | `CLASSROOM_DO` |
| `math-challenge-learner-do` | Durable Object class (SQLite) | Modelo de aprendizagem adaptativo por criança (estimativas de domínio, estado de seleção de itens) | Modelo de aprendizaje adaptativo por niño | `LEARNER_DO` |
| `math-challenge-ratelimiter-do` | Durable Object class (SQLite) | Limitação de taxa fragmentada (tentativas de login, chamadas ao tutor, registo) | Limitación de tasa fragmentada (inicios de sesión, llamadas al tutor, registro) | `RATE_LIMITER_DO` |
| `math-challenge-leaderboard-kv` | KV namespace | Instantâneos pré‑calculados do leaderboard global/por faixa de série | Instantáneas precalculadas del leaderboard global/por-grado | `LEADERBOARD_KV` |
| `math-challenge-config-kv` | KV namespace | Flags de funcionalidades e cache do catálogo de conteúdo | Feature flags y caché del catálogo de contenido | `CONFIG_KV` |
| `math-challenge-session-kv` | KV namespace | Tokens de sessão/autenticação de curta duração | Tokens de sesión/autenticación de corta duración | `SESSION_KV` |
| `math-challenge-media` | R2 bucket | Imagens, áudio e ilustrações dos itens | Imágenes, audio e ilustraciones de los reactivos | `MEDIA_BUCKET` |
| `math-challenge-exports` | R2 bucket | Ficheiro frio de tentativas expiradas; exportações para pedidos COPPA/GDPR | Archivo frío de intentos vencidos; exportaciones para solicitudes COPPA/GDPR | `EXPORTS_BUCKET` |
| `math-challenge-scoring-queue` | Queue | Pontuação assíncrona + trabalhos de atualização do modelo de aprendizagem | Async scoring + learner‑model update jobs | `SCORING_QUEUE` |
| `math-challenge-scoring-dlq` | Queue (dead-letter) | Trabalhos de pontuação falhados após o número máximo de tentativas | Trabajos de calificación fallidos tras reintentos máximos | `SCORING_DLQ` |
| `math-challenge-ai-explain-queue` | Queue | Pedidos assíncronos de geração de explicações de IA | Solicitudes asíncronas de generación de explicaciones de IA | `AI_EXPLAIN_QUEUE` |
| `math-challenge-ai-explain-dlq` | Queue (dead-letter) | Trabalhos de explicação falhados após o número máximo de tentativas | Trabajos de explicación fallidos tras reintentos máximos | `AI_EXPLAIN_DLQ` |
| `math-challenge-leaderboard-rollup-workflow` | Workflow | Cálculo periódico do leaderboard global/por faixa de série | Cálculo periódico del leaderboard global/por-grado | `LEADERBOARD_WORKFLOW` |
| `math-challenge-onboarding-workflow` | Workflow | Configuração multi‑passo de conta + perfil de criança + consentimento | Configuración multi‑paso de cuenta + perfil de niño + consentimiento | `ONBOARDING_WORKFLOW` |
| `math-challenge-explanations-index` | Vectorize index | Índice RAG multilingue sobre dicas/explicações curadas | Índice RAG multilingüe sobre pistas/explicaciones curadas | `EXPLANATIONS_INDEX` |
| `math-challenge-tutor-gateway` | AI Gateway | Cache, limites de taxa, limites de gasto, roteamento de modelo para chamadas ao Claude | Caché, límites de tasa, límites de gasto y enrutamiento de modelos para Claude | (gateway ID em `ANTHROPIC_BASE_URL`) |
| `math-challenge-attempts-ae` | Analytics Engine dataset | Telemetria por tentativa (alta cardinalidade, alto volume) | Telemetría por intento (alta cardinalidad, alto volumen) | `ATTEMPTS_AE` |
| `math-challenge-tutor-usage-ae` | Analytics Engine dataset | Telemetria de uso/custo do tutor (por criança, por modelo) | Telemetría de uso/costo del tutor (por niño, por modelo) | `TUTOR_AE` |
| `math-challenge-turnstile-signup` | Turnstile widget | Defesa contra bots em formulários de registo/início de sessão | Defensa contra bots en formularios de registro/inicio de sesión | (site key/secret via env) |
| `math-challenge-web-analytics` | Web Analytics site | RUM centrado na privacidade para a PWA | RUM respetuoso de la privacidad para la PWA | (JS snippet, no binding) |
| `math-challenge-secrets` | Secrets Store | Contém `ANTHROPIC_API_KEY` e outras credenciais de terceiros | Contiene `ANTHROPIC_API_KEY` y otras credenciales de terceros | via `wrangler secret put` |

## Design do leaderboard

**Caminho de escrita.** Um cliente submete uma tentativa a `math-challenge-ingest`. O Worker: (1) grava um ponto de dados no Analytics Engine (telemetria bruta — não uma escrita de linha D1), (2) faz RPC ao `math-challenge-learner-do` da criança para atualizar o estado de domínio, (3) faz RPC ao `math-challenge-league-do` e/ou `math-challenge-classroom-do` relevantes com o delta da pontuação. Cada DO de liga/sala de aula mantém as pontuações dos seus ≤30 membros numa tabela SQLite própria; a cada atualização reordena essas ≤30 linhas em memória (trivial) e envia as novas classificações aos clientes conectados através de um WebSocket hibernável. É isto que permite que as classificações de liga/sala de aula sejam “quase em tempo real” sem um primitivo global de conjunto ordenado, que a Cloudflare não disponibiliza nativamente.

**Os leaderboards global e por faixa de série seguem um caminho diferente.** Um Worker acionado por Cron (`math‑challenge‑leaderboard‑cron`) dispara o `math‑challenge‑leaderboard‑rollup‑workflow` a cada 30–60 segundos. O Workflow agrega os totais (uma tabela de roll‑up D1 actualizada a partir de SQL do Analytics Engine, ou escritas D1 em lote), calcula o top‑N por faixa de série e globalmente, e grava blobs JSON em `math‑challenge‑leaderboard‑kv`. As leituras passam então a ser chamadas simples `get()` ao KV — baratas, distribuídas na edge e explicitamente **não** em tempo real (30–60 s desatualizado por design), o que evita totalmente o limite de 1 escrita/segundo/chave do KV.

**Custo por 1.000.000 de tentativas (ordem de grandeza aproximada, plano pago):** pedidos de ingestão dos Workers, ~1 M, dentro/apenas ultrapassando o escalão incluído de 10 M/mês (≤ $0,30). Escritas no Analytics Engine, 1 M de chamadas `writeDataPoint()` — preço não tarifado encontrado na documentação atual; reconfirmar antes de escalar. Pedidos a Durable Objects (liga/sala de aula + learner DOs, ~2 chamadas/tentativa), ~2 M, ≈ $0,15–$0,30. Linhas SQLite em Durable Objects escritas, 1–2 M, dentro do escalão incluído de 50 M/mês a custo marginal $0. Escritas de roll‑up D1 são em lote a cada 30–60 s, pelo que o custo não escala com o número de tentativas. Escritas KV ocorrem uma vez por chave por ciclo de roll‑up, não por tentativa.

**Resultado:** aproximadamente **$0,50–$1,00 por milhão de tentativas** em custos diretos de primitivos, dominados pelo preço de pedidos a Workers/DOs em vez de armazenamento específico do leaderboard — porque as escritas por tentativa são deliberadamente mantidas fora do D1 e do KV.

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

Registos brutos por tentativa estão **deliberadamente ausentes** deste esquema — vivem em `math-challenge-attempts-ae` (Analytics Engine) e, para tudo o que for necessário além da retenção de 3 meses, em `math-challenge-exports` (R2, via um Pipeline ou tarefa Worker periódico).

## Implicações de design / riscos

1. **O limite de 10 GB por base de dados do D1 é a primeira barreira rígida**, atingida por um erro de design (armazenar tentativas brutas no D1), não pelo crescimento de tráfego — a mitigação do Analytics Engine tem de estar presente desde o primeiro commit, não ser retro‑adaptada [2].
2. **Um único "Durable Object" "global" é um anti‑padrão** — um DO que gere todos os gargalos de tráfego a ~500–1.000 req/s; ligas e salas de aula devem ser fragmentadas com um DO por entidade desde o primeiro dia [7].
3. **A propagação no pior caso de 60 segundos do KV e o `cacheTtl` mínimo de 30 segundos** significam que o leaderboard global/por faixa de série nunca está realmente em tempo real — mostre isto na UI ("actualizado há um minuto") para que as crianças não pensem que os pontos ganhos desapareceram [11][12].
4. **O limite de 1 escrita por segundo por chave do KV** faz com que qualquer design de "incremento a cada tentativa" falhe sob carga de pico — o design de rollup via Workflow escreve a uma cadência fixa.
5. **O cache do AI Gateway não deve ser aplicado uniformemente** — ao colocar em cache um gateway de embeddings devolve silenciosamente vetores desatualizados, por isso as chamadas ao tutor e aos embeddings RAG precisam de configurações de cache de gateway separadas se partilharem o mesmo gateway.
6. **A replicação de leitura do D1 é apenas sequencialmente consistente, com atraso no pior caso ilimitado** — um fluxo de "ver a tua pontuação imediatamente após submeter" tem de usar o marcador da Sessions API, não uma leitura sem restrições [3].
7. **A eliminação ao abrigo do COPPA/GDPR‑K é um problema de eliminação em quatro sistemas**: linhas D1, armazenamento SQLite de DO, Analytics Engine (o TTL de 3 meses ajuda mas não elimina sob demanda) e Vectorize (evitado aqui mantendo o Vectorize limitado ao conteúdo curado). Os manuais de eliminação têm de enumerar os quatro.
8. **O Vectorize tem de permanecer limitado ao banco de conteúdo/indícios curado**, não a embeddings por criança — o teto de 10 milhões de vetores é real em escala, e vetores por criança são uma vulnerabilidade de privacidade sem um processo de eliminação limpo [16].
9. **A faturação do armazenamento SQLite de DO começou a 7 de janeiro de 2026** — recente o suficiente para que modelos de custos antigos a subestimem; verifique novamente a página de preços atual antes de um plano de capacidade [9].
10. **O Turnstile com utilizadores jovens, possivelmente não leitores, não foi testado aqui** — a faixa de série mais jovem provavelmente precisará de um início de sessão mediado pelos pais, contornando a experiência de defesa contra bots para crianças.
11. **O Web Push é inconsistente em dispositivos geridos por escolas** — iOS requer uma PWA instalada na tela inicial no Safari 16.4+, e Chromebooks/iPads geridos por MDM frequentemente bloqueiam os prompts de instalação; é necessário um recurso alternativo sem push (digest por e‑mail para os pais) para alcançar os utilizadores.
12. **Qualquer consulta a `score_totals` sem o índice composto acabará por atingir o modo de falha por tempo de CPU do D1** à medida que a tabela cresce — verifique com `EXPLAIN QUERY PLAN` antes de lançar, não após um incidente [5].
13. **O preço de escrita do Analytics Engine não pôde ser confirmado nos documentos atuais** — a estimativa de custo por milhão de tentativas assume que está incluído no plano Workers; verifique na página de preços ao vivo antes de o incluir num orçamento.

## Questões abertas para o proprietário do projeto

1. Quais são exatamente as faixas de série / intervalos de idade incluídos (K–2, 3–5, 6–8, 9–12, adulto)? Determina a partição do leaderboard por faixa e a limitação de idade do COPPA (menos de 13 anos vs. 13+).
2. A retenção de 3 meses do Analytics Engine para histórico de tentativas brutas é aceitável, ou um relatório de progresso anual requer o caminho de ficheiro frio R2+Pipelines desde o primeiro dia?
3. Qual o pior caso de pico concorrente que devemos dimensionar (por exemplo, um distrito inteiro na mesma aula)? Define a granularidade de fragmentação dos DO.
4. O "tempo real" para classificação das ligas é um requisito de WebSocket sub‑segundo ou um refresco de alguns segundos é aceitável?
5. Deve existir alguma camada de tutor de IA sem limites, ou um teto diário estrito por criança para gastos com Claude está sempre em vigor?
6. Quais são exatamente as 5 línguas? Determina se o `m2m100` do Workers AI cobre todos os pares ou se alguns precisarão de tradução humana/Claude para o lançamento.
7. As ligas são atribuídas automaticamente (coorte aleatória) ou curadas por professor/pais? Afeta o workflow de ciclo de vida da liga e se `math-challenge-league-do` precisa de um passo de matchmaking.
8. Qual a regra de resolução de conflitos para sincronização de progresso PWA offline entre dois dispositivos?
9. Que abordagem de identidade é preferida para contas de pais — link mágico, passkeys ou federada? Influencia onde o Turnstile se insere e a forma da tabela `users`.
10. Qual é o teto mensal de gastos do AI Gateway? Necessário para dimensionar as 20 regras de limite de gasto e a política de modelo de recurso de reserva.

## Fontes

1. [Workers Platform Pricing](https://developers.cloudflare.com/workers/platform/pricing/) — tabelas de preços de D1, KV, Vectorize, Queues, Workers, Durable Objects. Acedido a 2026-07-31.  
2. [D1 Platform Limits](https://developers.cloudflare.com/d1/platform/limits/) — tamanho da base de dados, armazenamento, limites de consulta e conexão.  
3. [D1 Read Replication (best practices)](https://developers.cloudflare.com/d1/best-practices/read-replication/) — modelo de consistência, regiões suportadas.  
4. [D1 Read Replication Public Beta (changelog)](https://developers.cloudflare.com/changelog/post/2025-04-10-d1-read-replication-beta/) — 2025-04-10.  
5. [D1 Debug / Error Reference](https://developers.cloudflare.com/d1/observability/debug-d1/) — modos de falha por tempo de CPU e sobrecarga.  
6. [Durable Objects Pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/) — preços de computação e faturação de armazenamento SQLite.  
7. [Durable Objects: Rules of Durable Objects](https://developers.cloudflare.com/durable-objects/best-practices/rules-of-durable-objects/) — orientações de taxa por objeto, anti‑padrões.  
8. [SQLite in Durable Objects GA (changelog)](https://developers.cloudflare.com/changelog/post/2025-04-07-sqlite-in-durable-objects-ga/) — 2025-04-07, 10 GB por objeto.  
9. [Billing for SQLite Storage (changelog)](https://developers.cloudflare.com/changelog/post/2025-12-12-durable-objects-sqlite-storage-billing/) — 2025-12-12, data de início da faturação.  
10. [KV: Read key-value pairs](https://developers.cloudflare.com/kv/api/read-key-value-pairs/) — leituras em lote, `cacheTtl`.  
11. [KV: Write key-value pairs](https://developers.cloudflare.com/kv/api/write-key-value-pairs/) — limite de 1 escrita/segundo/chave, limites de escrita em lote.  
12. [Reduced minimum cacheTtl for Workers KV (changelog)](https://developers.cloudflare.com/changelog/post/2026-01-30-kv-reduced-minimum-cachettl/) — 2026-01-30.  
13. [Workers Analytics Engine — data point limits](https://developers.cloudflare.com/analytics/analytics-engine/limits/) — limites de blobs/doubles/índices/retenção.  
14. [R2 Pricing](https://developers.cloudflare.com/r2/pricing/) — armazenamento, operações Classe A/B, saída.  
15. [Vectorize indexes now support up to 10 million vectors (changelog)](https://developers.cloudflare.com/changelog/post/2026-01-23-increased-index-capacity/) — 2026-01-23.  
16. [Workers AI Pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/) — preços por modelo (bge-m3, melotts, m2m100).  
17. [AI Gateway: Spend limits](https://developers.cloudflare.com/ai-gateway/features/spend-limits/) — regras de orçamento, fallback de rota dinâmica, teto de 20 regras.  
18. [AI Gateway: Caching](https://developers.cloudflare.com/ai-gateway/features/caching/) — escopo de cache e correspondência de pedidos idênticos.  
19. [Workers Platform Limits](https://developers.cloudflare.com/workers/platform/limits/) — limites da API Cache, limites de pedido/resposta.  
20. [Cloudflare Web Analytics FAQ](https://developers.cloudflare.com/web-analytics/faq/) — comportamento de amostragem e retenção.  
21. [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/) — modelo de implantação full‑stack relevante para Astro em Workers.  
22. [Configure your framework for Cloudflare automatically (changelog)](https://developers.cloudflare.com/changelog/post/2025-12-16-wrangler-autoconfig/) — 2025-12-16, confirma Astro como framework suportado.  
23. [Workflows Pricing](https://developers.cloudflare.com/workflows/reference/pricing/) — pedidos, tempo de CPU, armazenamento, etapas.  
24. Anthropic `claude-api` skill, cached model/pricing table (2026-06-24) — preços de Claude Opus 5 / Sonnet 5 / Haiku 4.5 usados no plano de roteamento de modelo.
