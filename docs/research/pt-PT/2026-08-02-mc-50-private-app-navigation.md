# Navegação para a área autenticada da aplicação: painel do pai e futuras superfícies de jogo de criança/adulto

> Math Challenge research — 2026-08-02 — topic 50

## Resumo executivo (ES)

O proprietário descobriu, com uma captura de ecrã real, que o painel do pai
("Tu casa") herdava `Base.astro` — a nav de MARKETING, com "Entrar"/"Criar
conta" como ações para alguém que já iniciou sessão. A investigação interna
confirmou que isto era omissão, não decisão: os três ficheiros de
`app/kids/**` têm raciocínio extenso e citado para NÃO usar `Base.astro`
(zero telemetria, zero navegação de marca, zero JavaScript — linha vermelha
n.º 2, D-037), mas `app/index.astro` e `app/signin.astro` eram os dois
únicos ficheiros sob `/app/**` sem nenhum comentário que explicasse a sua
escolha de layout. Nem `docs/master-plan.md` nem `docs/decisions.md` contêm
uma única decisão sobre que navegação deve ter a área autenticada do adulto
— D-064 e `mc-49` cobrem exclusivamente o site público.

A constatação mais profunda não foi de layout mas de modelo de dados: o
ecrã assumia que todo o adulto é um pai. `users.is_learner` existe desde a
migração 0001 — "este adulto usa o produto para si próprio?"— e nada
downstream o lia nunca. Um adulto que se registou por `registro-aprendo`
via a secção "Tus hijos" vazia e sem sentido, e **não tem nenhum lugar para
onde ir**: não existe ecrã de prática para um adulto que aprende sozinho
— F5b (conteúdo N8-N10) e F10 (clubes de adultos) continuam por construir—,
pelo que o buraco de navegação era na realidade dois buracos: o layout
errado e uma função que ainda não existe.

A investigação externa converge num padrão conhecido: o Google Family
Link — o análogo real mais próximo, um adulto a gerir o uso de um menor—
usa exatamente 3 separadores fixos (Resumo/Controlos/Localização), não uma
nav de site de marketing [1]. A literatura de UX confirma que separadores
fixos servem quando há 3-5 destinos igualmente importantes [2][3], e que um
painel com mais do que isso se torna uma lista de um só ecrã em vez de
separadores [4] — a mesma regra de HIG/Material 3 que D-064 já fixou em 5.

Sobre as superfícies de CRIANÇA em bandas futuras (PRIMARIA, SECUNDARIA): a
investigação de `mc-20`/`mc-21` já deixa isto resolvido — navegação máxima
de 2 toques, zero menu, a grelha de caras É a navegação [5][6]. `mc-21`
acrescenta, para PRIMARIA, uma faixa ligeira de "onde estou na sessão" (não
um menu) [7]. `mc-22` (secundária) é a única que sugere um padrão de
navegação distinto: **calha lateral persistente só em computador**, teclado
numérico ancorado em baixo em telemóvel — mas está descrito como densidade
de conteúdo dentro do ecrã de prática, não como app-chrome de conta [8].
`mc-23` (adulto/pro) pede navegação de salto VISÍVEL dentro da prática
(saltar de tema), em vez de um fluxo linear fixo — de novo, dentro do ecrã
de resolução de problemas, não um menu de conta [9].

## Executive summary (EN)

The owner found, via a real screenshot, that the parent dashboard ("Tu
casa") inherited `Base.astro` — the MARKETING nav, with "Sign in"/"Sign up"
as actions for someone already logged in. Internal research confirmed this
was omission, not decision: the three `app/kids/**` files carry extensive,
cited reasoning for NOT using `Base.astro` (zero telemetry, zero brand nav,
zero JavaScript — red line #2, D-037), but `app/index.astro` and
`app/signin.astro` were the only two files under `/app/**` with no comment
explaining their layout choice. Neither `master-plan.md` nor `decisions.md`
contains a single decision about what navigation the authenticated adult
area should have — D-064 and `mc-49` cover the public site exclusively.

The deeper finding wasn't about layout but about the data model: the screen
assumed every adult is a parent. `users.is_learner` has existed since
migration 0001 — "does this adult use the product for themselves?" — and
nothing downstream ever read it. An adult who registered via
`registro-aprendo` saw the same empty, meaningless "Your children" section,
and **has nowhere to go**: no practice screen exists for a solo adult
learner — F5b (N8-N10 content) and F10 (adult clubs) remain unbuilt — so the
navigation gap was really two gaps: the wrong layout, and a feature that
doesn't exist yet.

External research converges on a known pattern: Google Family Link — the
closest real analogue, an adult managing a minor's usage — uses exactly 3
fixed tabs (Highlights/Controls/Location), not a marketing-site nav [1]. UX
literature confirms fixed tabs work for 3-5 equally-important destinations
[2][3], and that a panel with more than that becomes a single scrollable
list instead of tabs [4] — the same HIG/Material 3 rule D-064 already fixed
at 5. On future CHILD-facing bands (PRIMARIA, SECUNDARIA): `mc-20`/`mc-21`
already settle this — maximum 2-tap navigation, zero menu, the avatar grid
IS the navigation [5][6]. `mc-21` adds, for PRIMARIA, a lightweight
in-session "where am I" strip (not a menu) [7]. `mc-22` (teens) is the only
one suggesting a different navigation pattern: **persistent sidebar,
desktop-only**, docked numeric keypad on phone — but framed as in-screen
content density, not account-level chrome [8]. `mc-23` (adult/pro) asks for
visible jump navigation inside practice (skip to topic), instead of a fixed
linear flow — again inside the problem-solving screen, not an account menu
[9].

---

## Constatações

**1. A estrutura de separadores do Google Family Link.** Três separadores
fixos: Highlights (uso de hoje, app mais usada), Controls (tempo de ecrã /
limites de apps), Location — mais um centro de notificações partilhado. Os
agregados com vários menores têm troca rápida de perfil a partir da mesma
shell [1]. Este é, arquiteturalmente, o produto real mais próximo de "Tu
casa": uma conta de adulto a gerir menores, não um site de marketing.

**2. Separadores vs. lista de scroll único, e onde fica a linha.** Os
separadores inferiores servem 3-5 destinos primários acedidos
repetidamente [2]. Ecrãs de definições especificamente: os separadores
funcionam quando os destinos são igualmente importantes e não subordinados
uns aos outros; quando um destino é claramente primário e os restantes
secundários, ou quando há categorias mais variadas do que isso, uma lista
de scroll único serve melhor [3][4]. A navegação por barra lateral é a
escolha certa para produtos com 15-40 secções (painéis de administração,
dashboards SaaS) — não aplicável à escala deste ecrã (2-5 secções) [10].

**3. Constatações de navegação de `mc-20` (KINDER), reformuladas para o
propósito desta tarefa.** Máximo de 2 toques desde abrir a app até "estar a
responder a um desafio". Toque 1: escolher o avatar. Toque 2: tocar na
mascote/Play. Antipadrão explícito: "deep or hidden navigation (hamburger
menus, multi-level settings) inside the child-facing surface" [5]. Aplica-se
a KINDER por design; a base de código reutiliza atualmente este mesmo
padrão de zero-chrome para TODAS as bandas de criança via
`kids/jugar.astro` (explicitamente documentado como uma simplificação: "en
esta rejilla conviven las tres bandas de niño... manda el piso más alto de
los tres").

**4. Constatações de navegação de `mc-21` (PRIMARIA).** Troca de perfil
rápida e sem teclado; nenhuma assunção de um login pessoal persistido
(tablets familiares partilhados, Chromebooks escolares) [6]. Um elemento
novo face a KINDER: uma faixa ligeira de contexto dentro da sessão
(indicador de progresso/sequência) — a primeira banda onde "onde estou
nesta sessão" é sequer recomendado, mas ainda assim não um menu [7].

**5. Constatações de navegação de `mc-22` (SECUNDARIA/adolescentes).** A
única ideia de chrome diretamente transferível entre os quatro documentos
de banda: *"Tablet: two-pane (problem + scratch/graph). Desktop: persistent
skill-tree sidebar that phone omits — the 'not a kids app' signal on
desktop leans toward Desmos/Khan-Academy-style utility density."* [8]
Explicitamente enquadrada como densidade por superfície dentro do ecrã de
prática, não navegação de app ao nível da conta. O modo-escuro-por-defeito
para esta banda já está implementado em `bandas.css`.

**6. Constatações de navegação de `mc-23` (adulto/especialista).**
*"Expose explicit learner control over path: visible skip/reorder/jump-to-
topic... honoring the self-concept assumption that adults disengage when the
system controls sequencing."* [9] Também dentro do ecrã de prática —
densidade multi-painel (problema, área de rascunho, histórico de
tentativas), não um menu de definições/conta.

**7. O que nenhum dos quatro documentos de banda aborda.** Um menu de
navegação persistente, de nível superior, virado para a conta, para a área
autenticada. KINDER/PRIMARIA querem zero chrome por design. As constatações
de SECUNDARIA/adulto tratam de densidade de conteúdo dentro da prática.
Isto confirma que o buraco de navegação da app privada que este documento
aborda não tinha qualquer cobertura de investigação anterior — a mesma
conclusão a que `mc-49` chegou para o site público antes de D-064.

**8. O buraco do modelo de dados.** `migrations/0001_identity.sql`,
comentário sobre a ausência deliberada de uma coluna `role`: *"Sin columna
`role`... una persona puede ser las tres cosas a la vez: el propio dueño es
papá y aprendiz adulto (por-que-existe.md). Un rol excluyente obligaría a
mentir."* As capacidades derivam-se: pai ⇐ tem linhas em `child_profiles`;
professor ⇐ tem uma linha em `group_owner_identity` (F9, por construir);
aprendiz ⇐ `users.is_learner = 1`, **a única flag explícita**, definida no
registo a partir da porta `registro-aprendo` mas nunca lida downstream
antes desta passagem.

## Implicações de design

1. **A área autenticada do adulto tem o seu próprio layout, não
   `Base.astro`.** O mesmo princípio que `app/kids/**` já estabeleceu para
   as superfícies de criança, estendido ao único buraco restante (D-065).
2. **Faixa de separadores fixa no topo, não a maquinaria de quatro
   contextos de D-064.** Este ecrã tem 2-5 destinos, não "6 secções +
   overflow a competir com uma nav de marketing" — o problema que a
   complexidade de D-064 resolve não existe aqui. Uma fila de separadores
   sticky simples, presente independentemente de `display-mode` (não há
   nenhuma nav separador-de-navegador-vs-instalada a competir com que se
   possa empilhar), corresponde tanto ao precedente do Family Link como ao
   instinto do próprio produto de "não construir maquinaria de que um
   problema não precisa".
3. **Os separadores derivam-se do que a conta realmente tem, não da porta
   por que se registou.** `esFamilia` = tem ≥1 perfil de criança. `esSolo`
   = `users.is_learner = 1`. Não mutuamente exclusivos. Limite de 5
   (HIG/Material 3, a citação do próprio mc-49, reaplicada aqui).
4. **"Cuenta" (passkey/palavra-passe/terminar sessão) está sempre presente
   e é sempre real** — é o único destino que nunca depende do tipo de
   conta, e garante que o painel nunca é um beco sem saída mesmo para uma
   conta sem crianças nem `is_learner` definido (p. ex. só-professor, F9
   por construir).
5. **O separador de aterragem é o primeiro separador REAL (não "em
   breve")**, não simplesmente o primeiro na ordem de apresentação — um
   aprendiz solo não deve abrir a app num placeholder de "em breve" quando
   "Cuenta" tem conteúdo real e funcional.
6. **A banda RUM é `SERIO`, não `PUBLICO`.** D-037 permite medir
   superfícies de adulto; `PUBLICO` mistura tráfego de marketing com uso
   autenticado do produto no mesmo balde de métricas.
7. **Para as futuras bandas de criança (PRIMARIA, SECUNDARIA): nenhum
   chrome ao nível da conta, nunca — este é o lineamento que o proprietário
   pediu para fixar agora em vez de adiar.** O padrão de zero-navegação,
   grelha-de-avatares-como-entrada que `kids/**` já implementa para KINDER
   continua a ser o padrão para cada banda de criança. O que muda por banda
   é a *densidade de conteúdo dentro do ecrã de jogo*, nunca a navegação ao
   nível da app: PRIMARIA acrescenta uma faixa ligeira de progresso dentro
   da sessão (não um menu); o ecrã de prática de SECUNDARIA em computador
   pode ter uma calha lateral persistente de árvore de competências, o
   telemóvel continua a ancorar o teclado sem chrome adicional; nenhuma das
   três recebe nunca um menu hambúrguer, uma barra de separadores inferior,
   ou qualquer estrutura que exija mais de 2 toques desde abrir até "estar
   a responder a um desafio". Uma criança nunca chega a
   `layouts/Privada.astro` — esse layout é só-de-adulto por construção
   (D-065).
8. **Para a futura superfície de autoestudo adulto/pro (F5b/F10, por
   construir):** quando sair, vive como um separador "Practicar" **real**
   nesta mesma shell `Privada.astro` (não um layout novo) — a navegação
   visível de saltar/ir-para-o-tema de `mc-23` acontece *dentro* desse
   ecrã, da mesma forma que aconteceria dentro de qualquer ecrã de prática,
   não como um segundo sistema de navegação ao nível da conta.

## Questões abertas para o proprietário do projeto

Já resolvidas nesta sessão, registadas aqui para rastreabilidade:

1. *Contas solo vs. familiares, e como o menu deve diferir* → resolvido:
   derivado de dados reais (`is_learner`, número de crianças), não da porta
   de registo; os separadores são a união do que se aplica.
2. *Se se devem antecipar já os separadores de F8* → resolvido: sim, como
   separadores visíveis de "Próximamente", em vez de reconstruir a
   navegação duas vezes.
3. *Se se deve escrever já a diretriz das bandas futuras ou adiar* →
   resolvido: agora (implicação de design n.º 7 acima).

Ainda abertas, para quem construir F5b/F9/F10:

1. Quando o separador "Practicar" do adulto passar de placeholder a real,
   reutiliza a modelação de entidades ao estilo de `child_profiles`, ou uma
   tabela separada indexada diretamente em `users.id`? (Fora do âmbito da
   navegação; uma questão de conteúdo/dados para F5b.)
2. Quando F9 (professor/sala de aula) sair, o professor recebe um 6.º
   separador aqui, ou uma área `/app/maestro/` totalmente separada? O
   limite de 5 separadores deste documento assume pai+aprendiz; um
   separador de professor precisaria da sua própria decisão de âmbito nessa
   altura.

## Fontes

1. Google Families / Family Link product documentation and support pages —
   tab structure (Highlights/Controls/Location), multi-child profile
   switching — https://support.google.com/families/answer/7103340 ,
   https://families.google/familylink/ (fetched 2026-08-02)
2. UXPin, "Mobile Navigation Patterns: Pros and Cons" —
   https://www.uxpin.com/studio/blog/mobile-navigation-patterns-pros-and-cons/
   (fetched 2026-08-02)
3. LogRocket Blog, "Tabbed navigation in UX: Where and when to use it" —
   https://blog.logrocket.com/ux-design/tabs-ux-best-practices/ (fetched
   2026-08-02)
4. Cursa, "Tab Navigation Patterns and When to Use Them" —
   https://cursa.app/en/page/tab-navigation-patterns-and-when-to-use-them
   (fetched 2026-08-02)
5. Math Challenge internal research, `docs/research/2026-07-31-mc-20-ui-ages-3-6-kinder.md`
   §8, design implications #8-#9.
6. Math Challenge internal research, `docs/research/2026-07-31-mc-21-ui-ages-7-11-primary.md`
   §10, design implication #13.
7. Same as [6], design implication #4.
8. Math Challenge internal research, `docs/research/2026-07-31-mc-22-ui-teens-12-17.md`,
   design implication #13.
9. Math Challenge internal research, `docs/research/2026-07-31-mc-23-ui-adult-expert.md`,
   design implications #8, #10.
10. AlfDesignGroup, "Sidebar Design for Web Apps: UX Best Practices (2026
    Guide)" — https://www.alfdesigngroup.com/post/improve-your-sidebar-design-for-web-apps
    (fetched 2026-08-02)
11. Math Challenge internal code/decisions — `migrations/0001_identity.sql`
    (schema comment on `role` vs. derived capabilities, `is_learner`
    column), `apps/web/src/pages/[locale]/app/kids/index.astro` (§"Por qué
    esta pantalla NO usa `layouts/Base.astro`"), `docs/decisions.md` D-034,
    D-064.
