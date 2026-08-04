# Navegação da área autenticada do app: painel do pai e futuras superfícies de jogo de criança/adulto

> Pesquisa Math Challenge — 2026-08-02 — tópico 50

## Resumo executivo (PT)

O dono descobriu, com uma captura de tela real, que o painel do pai ("Sua
casa") herdava `Base.astro` — a nav de MARKETING, com "Entrar"/"Criar
conta" como ações para alguém que já iniciou sessão. A pesquisa interna
confirmou que isso era omissão, não decisão: os três arquivos de
`app/kids/**` têm raciocínio extenso e citado para NÃO usar `Base.astro`
(zero telemetria, zero navegação de marca, zero JavaScript — linha
vermelha #2, D-037), mas `app/index.astro` e `app/signin.astro` eram os
dois únicos arquivos sob `/app/**` sem nenhum comentário que explicasse
sua escolha de layout. Nem `docs/master-plan.md` nem `docs/decisions.md`
contêm uma só decisão sobre que navegação a área autenticada do adulto
deve ter — D-064 e `mc-49` cobrem exclusivamente o site público.

O achado mais profundo não foi de layout, mas de modelo de dados: a tela
assumia que todo adulto é um pai. `users.is_learner` existe desde a
migração 0001 —"este adulto usa o produto para si mesmo?"— e nada
downstream jamais o lia. Um adulto que se registrou por `registro-aprendo`
via a seção "Seus filhos" vazia e sem sentido, e **não tem nenhum lugar
para onde ir**: não existe tela de prática para um adulto que aprende
sozinho —F5b (conteúdo N8-N10) e F10 (clubes de adultos) continuam sem
construir—, de modo que a lacuna de navegação era na verdade duas lacunas:
o layout errado e uma função que ainda não existe.

A pesquisa externa converge num padrão conhecido: o Google Family Link —o
análogo real mais próximo, um adulto gerenciando o uso de um menor— usa
exatamente 3 abas fixas (Resumo/Controles/Localização), não uma nav de
site de marketing [1]. A literatura de UX confirma que abas fixas servem
quando há 3-5 destinos igualmente importantes [2][3], e que um painel com
mais que isso vira uma lista de uma só tela em vez de abas [4] — a mesma
regra de HIG/Material 3 que D-064 já fixou em 5.

Sobre as superfícies de CRIANÇA em faixas futuras (PRIMARIA, SECUNDARIA):
a pesquisa de `mc-20`/`mc-21` já deixa isso resolvido — navegação máxima
de 2 toques, zero menu, a grade de caras É a navegação [5][6]. `mc-21`
acrescenta, para PRIMARIA, uma faixa leve de "onde estou na sessão" (não
um menu) [7]. `mc-22` (secundária) é a única que sugere um padrão de
navegação distinto: **trilho lateral persistente só no desktop**, teclado
numérico ancorado embaixo no celular — mas está descrito como densidade de
conteúdo dentro da tela de prática, não como app-chrome de conta [8].
`mc-23` (adulto/pro) pede navegação de salto VISÍVEL dentro da prática
(pular de tópico), em vez de um fluxo linear fixo — de novo, dentro da
tela de resolver problemas, não um menu de conta [9].

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

## Resultados

**1. A estrutura de abas do Google Family Link.** Três abas fixas:
Highlights (uso de hoje, app mais usado), Controls (tempo de tela /
limites de apps), Location — mais um hub de notificações compartilhado.
Famílias com vários filhos têm troca rápida de perfil a partir do mesmo
shell [1]. Este é arquiteturalmente o produto real mais próximo de "Sua
casa": uma conta de adulto gerenciando menores, não um site de marketing.

**2. Abas vs. lista de rolagem única, e onde fica a linha.** Abas
inferiores servem para 3-5 destinos primários acessados repetidamente [2].
Telas de configurações especificamente: abas funcionam quando os destinos
são igualmente importantes e não subordinados entre si; quando um destino
é claramente primário e o resto secundário, ou quando há categorias mais
variadas que isso, uma única lista rolável serve melhor [3][4]. Navegação
por barra lateral é a escolha certa para produtos com 15-40 seções (painéis
de administração, dashboards SaaS) — não se aplica na escala desta tela
(2-5 seções) [10].

**3. Achados de navegação de `mc-20` (KINDER), reformulados para o
propósito desta tarefa.** Máximo de 2 toques da abertura do app até
"respondendo a um desafio". Toque 1: escolher avatar. Toque 2: tocar no
mascote/Jogar. Antipadrão explícito: "deep or hidden navigation (hamburger
menus, multi-level settings) inside the child-facing surface" [5]. Aplica-se
a KINDER por design; a base de código atualmente reutiliza este mesmo
padrão de zero-chrome para TODAS as faixas de criança via
`kids/jugar.astro` (explicitamente documentado como simplificação: «en
esta rejilla conviven las tres bandas de niño... manda el piso más alto de
los tres»).

**4. Achados de navegação de `mc-21` (PRIMARIA).** Troca de perfil rápida
e sem digitação; nenhuma suposição de login pessoal persistido (tablets
familiares compartilhados, Chromebooks escolares) [6]. Um elemento novo em
relação a KINDER: uma faixa leve de contexto dentro da sessão (indicador
de progresso/sequência) — a primeira faixa onde "onde estou nesta sessão"
é sequer recomendado, mas ainda assim não um menu [7].

**5. Achados de navegação de `mc-22` (SECUNDARIA/adolescentes).** A única
ideia de chrome diretamente transferível entre os quatro documentos de
faixa: *"Tablet: two-pane (problem + scratch/graph). Desktop: persistent
skill-tree sidebar that phone omits — the 'not a kids app' signal on
desktop leans toward Desmos/Khan-Academy-style utility density."* [8]
Explicitamente enquadrada como densidade por superfície dentro da tela de
prática, não navegação de app em nível de conta. O modo escuro por padrão
para esta faixa já está implementado em `bandas.css`.

**6. Achados de navegação de `mc-23` (adulto/experto).** *"Expose explicit
learner control over path: visible skip/reorder/jump-to-topic... honoring
the self-concept assumption that adults disengage when the system controls
sequencing."* [9] Também dentro da tela de prática — densidade
multi-painel (problema, área de rascunho, histórico de tentativas), não um
menu de configurações/conta.

**7. O que nenhum dos quatro documentos de faixa aborda.** Um menu de
navegação persistente, de nível superior, voltado à conta, para a área
autenticada. KINDER/PRIMARIA querem zero chrome por design. Os achados de
SECUNDARIA/adulto tratam de densidade de conteúdo dentro da prática. Isso
confirma que a lacuna de navegação do app privado que este documento
aborda não tinha nenhuma cobertura de pesquisa anterior — mesma conclusão
a que `mc-49` chegou para o site público antes de D-064.

**8. A lacuna do modelo de dados.** `migrations/0001_identity.sql`,
comentário sobre a ausência deliberada de uma coluna `role`: *"Sin columna
`role`... una persona puede ser las tres cosas a la vez: el propio dueño es
papá y aprendiz adulto (por-que-existe.md). Un rol excluyente obligaría a
mentir."* As capacidades são derivadas: pai ⇐ tem linhas em
`child_profiles`; professor ⇐ tem uma linha em `group_owner_identity` (F9,
não construído); aprendiz ⇐ `users.is_learner = 1`, **a única flag
explícita**, definida no cadastro a partir da porta `registro-aprendo`,
mas nunca lida downstream antes desta passagem.

## Implicações de design

1. **A área autenticada do adulto ganha seu próprio layout, não
   `Base.astro`.** O mesmo princípio que `app/kids/**` já estabeleceu para
   as superfícies de criança, estendido à única lacuna restante (D-065).
2. **Faixa de abas fixa no topo, não a maquinaria de quatro contextos de
   D-064.** Esta tela tem 2-5 destinos, não "6 seções + overflow
   competindo com uma nav de marketing" — o problema que a complexidade de
   D-064 resolve não existe aqui. Uma simples linha de abas sticky,
   presente independentemente de `display-mode` (não há nav de aba de
   navegador vs. instalada competindo com a qual evitar empilhamento),
   corresponde tanto ao precedente do Family Link quanto ao instinto do
   próprio produto de "não construir maquinaria que um problema não
   precisa".
3. **As abas são derivadas do que a conta realmente tem, não de por qual
   porta ela se registrou.** `esFamilia` = tem ≥1 perfil de criança.
   `esSolo` = `users.is_learner = 1`. Não são mutuamente exclusivas. Teto
   de 5 (HIG/Material 3, a própria citação de mc-49, reaplicada aqui).
4. **"Conta" (passkey/senha/sair) está sempre presente e é sempre real** —
   é o único destino que nunca depende do tipo de conta, e garante que o
   painel nunca seja um beco sem saída, mesmo para uma conta sem filhos nem
   `is_learner` definido (ex. só professor, F9 não construído).
5. **A aba inicial é a primeira aba REAL (não "em breve")**, não
   simplesmente a primeira na ordem de exibição — um aprendiz solo não deve
   abrir o app num placeholder de "em breve" quando "Conta" tem conteúdo
   real e funcionando.
6. **A banda RUM é `SERIO`, não `PUBLICO`.** D-037 permite medir
   superfícies de adulto; `PUBLICO` mistura tráfego de marketing com uso
   autenticado do produto no mesmo balde de métricas.
7. **Para as futuras faixas de criança (PRIMARIA, SECUNDARIA): nenhum
   chrome em nível de conta, nunca — este é o lineamento que o dono pediu
   para fixar agora em vez de adiar.** O padrão de zero navegação,
   grade-de-avatares-como-entrada que `kids/**` já implementa para KINDER
   continua sendo o padrão para toda faixa de criança. O que muda por
   faixa é a *densidade de conteúdo dentro da tela de jogo*, nunca a
   navegação em nível de app: PRIMARIA acrescenta uma faixa leve de
   progresso dentro da sessão (não um menu); a tela de prática de desktop
   de SECUNDARIA pode carregar um trilho lateral persistente de árvore de
   habilidades, o telefone continua ancorando o teclado sem chrome
   adicional; nenhuma das três jamais ganha um menu hambúrguer, uma barra
   de abas inferior ou qualquer estrutura que exija mais de 2 toques da
   abertura até "respondendo a um desafio". Uma criança nunca chega a
   `layouts/Privada.astro` — esse layout é só para adultos por construção
   (D-065).
8. **Para a futura superfície de autoestudo adulto/pro (F5b/F10, não
   construída):** quando for lançada, ela vive como uma aba "Praticar"
   **real** neste mesmo shell `Privada.astro` (não um layout novo) — a
   navegação visível de pular/ir-para-tópico de `mc-23` acontece *dentro*
   dessa tela, da mesma forma que dentro de qualquer tela de prática, não
   como um segundo sistema de navegação em nível de conta.

## Perguntas abertas para o dono do projeto

Já resolvidas nesta sessão, registradas aqui para rastreabilidade:

1. *Contas solo vs. familiares, e como o menu deve diferir* → resolvido:
   derivado de dados reais (`is_learner`, contagem de filhos), não da
   porta de cadastro; as abas são a união do que se aplica.
2. *Se convém antecipar as abas de F8 agora* → resolvido: sim, como abas
   "Em breve" visíveis, em vez de reconstruir a navegação duas vezes.
3. *Se convém escrever o lineamento das faixas futuras agora ou adiar* →
   resolvido: agora (implicação de design #7 acima).

Ainda abertas, para quem construir F5b/F9/F10:

1. Quando a aba "Praticar" do adulto passar de placeholder a real, ela
   reutiliza a modelagem de entidades estilo `child_profiles`, ou uma
   tabela separada com chave direta em `users.id`? (Fora do escopo de
   navegação; uma questão de conteúdo/dados para F5b.)
2. Quando F9 (professor/sala de aula) for lançado, o professor ganha uma
   6ª aba aqui, ou uma área `/app/maestro/` totalmente separada? O teto de
   5 abas deste documento assume pai+aprendiz; uma aba de professor
   precisaria de sua própria decisão de escopo nesse momento.

## Fontes

1. Google Families / Family Link product documentation and support pages —
   estrutura de abas (Highlights/Controls/Location), troca de perfil com
   vários filhos — https://support.google.com/families/answer/7103340 ,
   https://families.google/familylink/ (acessado 2026-08-02)
2. UXPin, "Mobile Navigation Patterns: Pros and Cons" —
   https://www.uxpin.com/studio/blog/mobile-navigation-patterns-pros-and-cons/
   (acessado 2026-08-02)
3. LogRocket Blog, "Tabbed navigation in UX: Where and when to use it" —
   https://blog.logrocket.com/ux-design/tabs-ux-best-practices/ (acessado
   2026-08-02)
4. Cursa, "Tab Navigation Patterns and When to Use Them" —
   https://cursa.app/en/page/tab-navigation-patterns-and-when-to-use-them
   (acessado 2026-08-02)
5. Pesquisa interna do Math Challenge, `docs/research/2026-07-31-mc-20-ui-ages-3-6-kinder.md`
   §8, implicações de design #8-#9.
6. Pesquisa interna do Math Challenge, `docs/research/2026-07-31-mc-21-ui-ages-7-11-primary.md`
   §10, implicação de design #13.
7. Mesma que [6], implicação de design #4.
8. Pesquisa interna do Math Challenge, `docs/research/2026-07-31-mc-22-ui-teens-12-17.md`,
   implicação de design #13.
9. Pesquisa interna do Math Challenge, `docs/research/2026-07-31-mc-23-ui-adult-expert.md`,
   implicações de design #8, #10.
10. AlfDesignGroup, "Sidebar Design for Web Apps: UX Best Practices (2026
    Guide)" — https://www.alfdesigngroup.com/post/improve-your-sidebar-design-for-web-apps
    (acessado 2026-08-02)
11. Código/decisões internas do Math Challenge — `migrations/0001_identity.sql`
    (comentário do esquema sobre `role` vs. capacidades derivadas, coluna
    `is_learner`), `apps/web/src/pages/[locale]/app/kids/index.astro` (§"Por
    qué esta pantalla NO usa `layouts/Base.astro`"), `docs/decisions.md`
    D-034, D-064.
