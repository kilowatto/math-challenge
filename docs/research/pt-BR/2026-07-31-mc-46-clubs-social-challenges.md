# Clubs, retos de grupo y prendas: cómo tener apuestas sin perdedor y sin exposición regulatoria

> Math Challenge research — 2026-07-31 — topic 46

## Resumo executivo (ES)

- **O jogo ilegal é definido, em praticamente toda lei estadual dos EUA, por três elementos: prêmio, sorte e consideração — e os três devem estar presentes** [1]. Basta eliminar um para ficar fora. A estratégia padrão da indústria de sorteios é exatamente essa: remover ao menos um elemento [1].
- **A sorte já está ausente aqui.** Um desafio matemático é ganho por habilidade, não por sorte. A formulação jurídica que se aplica é a dos concursos de destreza, onde *"os vencedores não são escolhidos por sorte, mas com base em algum critério mensurável"* [1].
- **A consideração é eliminada se a plataforma não tocar em nada de valor.** Consideração significa *"pagamento de dinheiro ou de algo valioso para entrar, ou a exigência de fazer uma compra"* [1]. Se o Math Challenge não cobra para entrar em um desafio, não retém, não transfere e não impõe nada, não há consideração em relação à plataforma.
- **O prêmio também pode ser minimizado:** prêmios intangíveis como *"direito de se gabar"* têm valor monetário mínimo e podem não atingir o limiar legal de "prêmio" [1].
- **Strava já resolveu a aposta sem perdedor, e funciona.** Seu modo *Group Goal* permite que o grupo persiga uma meta compartilhada e —em sua própria documentação— *"não tem tabela de classificação, então você acaba se comparando menos com os demais"* [2][3]. Convive com os desafios competitivos como um modo alternativo, não como substituto.
- Strava oferece quatro tipos de desafio de grupo: *Most Activity*, *Fastest Effort*, *Longest Single Activity* e *Group Goal* — apenas o último é cooperativo [2][3].
- **O padrão real de salvaguarda em esportes juvenis** exige verificação de antecedentes para *"qualquer voluntário com oportunidade de contato não supervisionado ou individual com menores"*, além de uma pessoa nomeada como contato de salvaguarda conhecida por todos [4][5]. A palavra que importa é **não supervisionado**.
- Não podemos realizar verificação de antecedentes, mas podemos **projetar para que não exista contato não supervisionado**: sem chat, sem canal privado, com o dono do clube vendo apenas apelidos e pontos, e com o pai de cada criança aprovando a entrada.
- **Nenhum menor entra jamais em um desafio com aposta.** Isso mantém toda a análise de jogo longe das crianças, onde a exposição regulatória documentada em `mc-17` (Bélgica, Países Baixos, DSA, Children's Code) seria severa.
- **Larry modera o texto da aposta antes de que exista**, com critério de jogo entre adultos: a piada passa, sexo, violência e conteúdo degradante não passam — e nada que aponte para uma pessoa passa. É uma chamada distinta da do tutor, com seu próprio prompt, seu próprio registro e comportamento à prova de falhas.
- Conclusão de design: **dois sistemas separados na camada de dados** — `grupo_infantil` (sala de mestre + clube de pais, regras idênticas) e `club_adulto` (com desafios e apostas) — para que uma funcionalidade adicionada aos "clubs" não possa cair por engano sobre crianças.

## Resumo executivo (EN)

- **O jogo de azar ilegal é definido, em praticamente todas as leis estaduais dos EUA, por três elementos — prêmio, sorte e consideração — e os três devem estar presentes** [1]. Remover um é suficiente. Essa é exatamente a estratégia padrão da indústria de sorteios: eliminar ao menos um elemento [1].
- **A sorte já está ausente aqui.** Um desafio matemático é vencido por habilidade. A estrutura aplicável é a de concurso de habilidade, onde *"os vencedores não são selecionados por sorte, mas sim escolhidos com base em algum critério mensurável"* [1].
- **A consideração é eliminada se a plataforma nunca tocar em nada de valor.** Consideração significa *"pagamento de dinheiro ou algo valioso para entrar, ou a exigência de que uma compra seja feita"* [1]. Se o Math Challenge não cobra nada para entrar, não mantém escrow, não transfere nada e não impõe nada, não há consideração fluindo para a plataforma.
- **O prêmio também pode ser minimizado:** recompensas intangíveis como *"direito de se gabar"* têm valor monetário mínimo e podem não atender ao limiar legal para um prêmio [1].
- **Strava já lançou a aposta sem perdedor, e funciona.** Seu modo *Group Goal* permite que um grupo persiga um objetivo compartilhado e — conforme sua própria documentação — *"não tem um placar classificado, então você acaba se comparando menos com os outros"* [2][3]. Ele convive com desafios competitivos como um modo alternativo, não como substituto.
- **O verdadeiro padrão de salvaguarda em esportes juvenis** exige verificação de antecedentes para *"qualquer voluntário com oportunidade de contato não supervisionado ou individual com menores"*, além de um contato de salvaguarda nomeado conhecido por todos [4][5]. A palavra-chave é **não supervisionado**.
- Não podemos realizar verificações de antecedentes, mas podemos **projetar para que não exista contato não supervisionado**: sem chat, sem canal privado, o dono do clube vê apenas apelido e pontos, e o próprio pai de cada criança aprova a entrada.
- **Nenhum menor está jamais em um desafio com apostas.** Isso mantém toda a análise de jogo longe das crianças, onde a exposição regulatória documentada em `mc-17` seria severa.
- **Larry modera o texto da aposta antes de que exista**, com julgamento de jogo adulto: a piada passa; sexo, violência e degradação não passam — e nada que destaque uma pessoa passa. É uma chamada separada da do tutor, com seu próprio prompt, registro de auditoria e comportamento fail-closed.
- Conclusão de design: **dois sistemas separados na camada de dados** — `grupo_infantil` e `club_adulto` — para que uma funcionalidade adicionada aos "clubs" não possa cair sobre crianças por acidente.

## Findings

### 1. Os três elementos, e como eliminar um deles

Thompson Coburn LLP resume o quadro que governa tudo isso: praticamente toda lei estadual define jogo ilegal como a presença simultânea de **prêmio, sorte e consideração**, e **os três devem estar presentes** para que uma promoção se qualifique como jogo ilegal [1]. A estratégia inteira da indústria de sorteios consiste em garantir a eliminação de pelo menos um.

Como eliminar cada um, segundo a própria fonte [1]:

- **Prêmio.** Difícil de eliminar completamente, mas recompensas intangíveis como *"direito de se gabar"* ou a designação de vencedor semanal têm valor monetário mínimo e **podem não atingir o limiar legal** de “prêmio”.
- **Sorte.** Transforma o sorteio em um concurso de destreza, onde *"os vencedores não são escolhidos por sorte, mas com base em algum critério mensurável"*. Alternativamente, estrutura‑se como um presente onde todos recebem algo.
- **Consideração.** É a que mais comumente se elimina. Inclui *"o pagamento de dinheiro ou de algo valioso para entrar, ou a exigência de que se faça uma compra"*. Notavelmente, exigir que alguém **envie seus dados de contato não é consideração** — por isso as vias de entrada gratuita são padrão no design de sorteios. A distinção legal depende de se o participante deve fazer algo **além do comportamento normal de cliente** para entrar.

**Onde fica o Math Challenge.** A sorte está ausente pela natureza do produto: resolver desafios matemáticos é um critério mensurável de destreza, não de sorte. A consideração está ausente enquanto a plataforma não cobrar para entrar em um desafio nem reter, transferir ou fazer cumprir nada de valor. E com as formas de aposta propostas abaixo (§3), o prêmio se reduz a agência ou a uma experiência compartilhada, isto é, próximo ao limiar de “direito de se gabar”.

**Faltam dois de três, possivelmente os três.** Mas essa posição depende **totalmente** de que a plataforma nunca toque em valor. No dia em que o Math Challenge reter US$ 20 de cada participante, surge a consideração e a análise se inverte completamente. Essa é a linha, e não é difusa.

### 2. O precedente que já existe: Strava Group Goal

Strava opera quatro tipos de desafio de grupo: *Most Activity* (quem acumula mais tempo, distância ou elevação), *Fastest Effort* (ritmo médio), *Longest Single Activity* e *Group Goal* (perseguir uma meta compartilhada como grupo) [2][3]. Os três primeiros são competitivos com tabela de classificação; o quarto não.

A descrição da Strava do modo cooperativo é a observação de design mais útil de toda esta pesquisa: *"Se competir com seus amigos não é seu estilo, você pode criar um desafio de Group Goal para avançar juntos rumo a uma meta compartilhada. Esta versão do desafio grupal **não tem tabela de classificação, então você acaba se comparando menos com os demais**"* [3].

Duas leituras importam. Primeiro, **a ausência de tabela é a função, não uma limitação** — é o que faz o modo servir a quem a competição desmotiva, que é exatamente a população que `mc-18` identifica como a que se desengaja no fundo do quadro. Segundo, **a Strava o oferece junto aos competitivos, não em substituição**: a escolha do modo a faz o organizador do desafio conforme seu grupo. Análises da própria plataforma apontam que os desafios grupais priorizam a conexão sobre a competição pura e sustentam a comunidade [2].

Isso converge com o que já está em `mc-18`: a meta‑análise de Johnson & Johnson (122 estudos, 286 achados) encontra que as estruturas cooperativas superam consistentemente as competitivas e individualistas tanto em desempenho quanto em relações entre pares.

### 3. O que torna divertida uma aposta, decomposta

Antes de propor formas, vale decompôr o que produz o prazer de uma aposta social. Quatro coisas: que **todos tenham algo em jogo**, que **o resultado importe**, que **sobre o que se crie uma anedota**, e que **o grupo tenha feito algo junto**.

**Nenhuma das quatro requer um perdedor.** O castigo ao último não é o ingrediente ativo — é uma consequência de assumir, sem examiná‑lo, que a aposta tem que recair sobre alguém. Dessa observação surgem três formas que conservam as quatro propriedades:

**A · Aposta coletiva.** O grupo se compromete junto contra uma meta compartilhada. Ganha ou não ganha em grupo. É o *Group Goal* da Strava aplicado a pontos de matemática, com o respaldo cooperativo de Johnson & Johnson.

**B · O vencedor escolhe.** Inverte‑se a direção do prêmio: o primeiro lugar não recebe tributo dos demais, mas **decide** algo para o grupo — o próximo desafio, a meta do clube, o local onde vão. O prêmio é **agência, não tributo**. Legalmente é a forma mais limpa, porque decidir não tem valor monetário e roça o limiar de “direito de se gabar” que [1] indica como provavelmente insuficiente para constituir prêmio.

**C · Compromisso próprio.** Cada um aposta contra sua própria meta, publicamente. É a forma melhor respaldada por evidência: são as intenções de implementação de Gollwitzer já documentadas em `mc-19`, com efeitos grandes e replicados (100 % vs. 53 % de cumprimento em autoexames; 4,2 kg vs. 2,1 kg de perda de peso). É também, não por acaso, o mecanismo com o qual a HealthyWage sustenta que não é jogo: seu argumento público é que **o usuário controla o resultado o tempo todo** [6].

### 4. A propriedade estrutural que torna a moderação desnecessária

As três formas compartilham algo que vale mais que qualquer regra de moderação: **nenhuma tem uma caixa de perdedor**.

- Na aposta coletiva, o texto descreve o que faz **o grupo**.
- Em “o vencedor escolhe”, o escreve **quem ganhou**, sobre o que segue.
- No compromisso próprio, só se pode escrever **sobre si mesmo**.

Em nenhuma das três existe um campo que responda a “o que acontece com o último?”. Isso significa que **o texto livre pode existir sem que a humilhação tenha onde aterrissar**: não é que se proíba escrevê‑la, é que não há ranura no modelo de dados onde colocá‑la. É a mesma lógica estrutural com a qual `mc-43` resolve os alias (escolha dentro de um conjunto limitado em vez de entrada livre), aplicada um nível acima: em vez de limitar o vocabulário, limita‑se **o objeto sobre o qual o texto pode falar**.

**Risco residual, dito de frente.** Isso não é hermético. Alguém pode escrever, dentro de uma aposta coletiva, “vamos por tacos e o Juan se rapa”. O que a estrutura garante é que o sistema nunca *designe* o Juan, nunca o aponte e nunca o faça cumprir — a aposta continua sendo do grupo. Essa brecha é a que fecha Larry em §5, e o que resta depois é mitigado por procedimento: a aposta é visível **antes** de iniciar o desafio, **todos os membros a aceitam explicitamente** para permanecer dentro, qualquer um pode sair sem penalização, não se pode editar uma vez iniciado, e há botão de denúncia permanente. Com isso, ninguém fica sujeito a uma aposta que não leu e aceitou.

### 5. Larry como moderador de desafios

**Decisão do dono:** o texto livre dos desafios é revisado por Larry antes que o desafio exista, com critério explícito de **jogo entre adultos** — a piada passa; sexo, violência e o que for denigrante não.

**Isso não quebra o cânon de “Larry nunca calcula”.** Essa regra, documentada em `mc-37` e D-004, existe por um motivo específico: um tutor que recalcula matemática se engana e ensina erro. Julgar se um texto é denigrante é uma tarefa distinta, e é uma das que os modelos de linguagem fazem bem. O que se herda é que **é outra chamada, não a mesma**: prompt próprio, modelo próprio, registro próprio, e nenhuma relação com o endpoint do tutor.

**O critério que Larry aplica**, em ordem de precedência:

1. **Aponta a uma pessoa?** Um desafio que nomeia um indivíduo como quem carrega a consequência é rejeitado, mesmo que venha em tom de brincadeira. É a única regra que não admite matiz, porque sustenta a linha vermelha do produto.  
2. **Há sexo, violência ou denigração?** É rejeitado. Inclui o que degrada por aparência, peso, origem, capacidade ou qualquer característica de uma pessoa — o cânon de Larry já proíbe que o humor recai sobre características das pessoas (`mc-37`), e aqui se estende do que Larry *diz* ao que Larry *deixa passar*.  
3. **É um jogo entre adultos?** Se passar 1 e 2, **passa**. Larry não é um censor de bom gosto: “quem ganha escolhe o bar”, “o clube paga a primeira rodada”, “o vencedor escolhe a playlist por um mês” são desafios legítimos e Larry não precisa opinar sobre eles.

**O tom ao rejeitar importa tanto quanto a rejeição.** Larry não prega. `mc-11` é explícito que o feedback direcionado à pessoa em vez da tarefa é o mecanismo pelo qual mais de um terço das intervenções estudadas **piora** o resultado — e embora essa descoberta seja sobre aprendizado, o mecanismo social é o mesmo: uma rejeição moralizante transforma um adulto em adversário do produto. Larry rejeita de forma breve, em personagem, sem lição: *"Vou ter que devolver isso — deixa o grupo inteiro no desafio, não só um. Vamos dar outra volta?"*

**Comportamento à prova de falhas.** Se a chamada de moderação falhar ou expirar, o desafio **não é publicado**. É mostrado que Larry não pôde revisá‑lo e é oferecida a tentativa novamente. Nunca se publica texto sem revisão sob qualquer condição de erro — o modo de falha barato é um usuário irritado, o modo de falha caro é uma humilhação publicada que o produto prometeu que não poderia acontecer.

**Roteamento e custo.** O volume é trivial comparado ao do tutor: uma chamada por desafio criado, não por tentativa. Haiku 4,5 basta para o caso claro, com escalonamento para Sonnet 5 quando o veredicto for de baixa confiança — o matiz entre “piada entre amigos” e “denigração” é exatamente onde um modelo pequeno erra em ambas as direções. Com o roteamento de D-015 e o limite de gasto do AI Gateway, isso não move a agulha do orçamento.

**Falsos positivos e apelação.** Larry vai errar, e vai rejeitar piadas legítimas. Sem via de apelação, isso se sente como censura e é a reclamação que chegará. Todo desafio rejeitado deve poder ser enviado para revisão humana com um toque, e essa fila precisa de dono e tempo de resposta comprometido — a mesma fila dos relatórios.

**Registro.** Cada decisão é registrada: texto proposto, veredicto, modelo, motivo e confiança. Serve para três coisas: afinar o prompt com casos reais, resolver apelações com evidência, e detectar quem insiste em passar o mesmo dez vezes com variantes.

### 6. Os clubes de pais e o padrão real de salvaguarda

A literatura de esportes juvenis é a referência mais próxima a “um adulto organiza uma atividade para crianças alheias”. O padrão geral que relata: exige‑se verificação de antecedentes para *“qualquer voluntário com oportunidade de contato não supervisionado ou um‑a‑um com menores”* — incluindo pais coordenadores que organizam atividades ou gerenciam comunicações que envolvem contato com crianças [4][5]. Uma verificação mínima cobre antecedentes criminais federais e registro de agressores sexuais; recomenda‑se repeti‑la a cada ano ou a cada temporada, com consentimento escrito prévio [4][5]. E estruturalmente: deve existir **uma pessoa nomeada, cujo nome e contato sejam conhecidos por todos**, como primeiro ponto de contato diante de qualquer preocupação de salvaguarda [5].

**Math Challenge não pode realizar verificação de antecedentes**, e fingir o contrário seria pior do que não fazê‑lo. Mas a própria definição indica onde está o risco: **contato não supervisionado**. A solução de design é eliminar a categoria inteira:

- **Sem chat e sem mensagens diretas, em nenhuma direção, nunca.** Já é a regra para professores (D-011); estende‑se idêntica aos clubes.  
- **O dono do clube vê exclusivamente apelidos, pontos e sequência.** Nem nome real, nem idade exata, nem foto, nem outro grupo ao qual a criança pertença.  
- **O pai de cada criança aprova a entrada**, e vê a identidade declarada do dono antes de aprovar — o padrão invertido do ClassDojo que `mc-28` identifica como o único mecanismo de segurança confirmado na indústria.  
- **Convida‑se compartilhando um código com os pais**, nunca buscando ou contatando crianças.  
- **Limite rígido menor que uma sala**: um clube é um grupo de amigos, não uma escola.  
- **Botão de denúncia permanente** e registro completo de altas, aprovações e baixas.

A afirmação honesta que surge disso: **um clube de pais é seguro precisamente porque é anêmico.** É um quadro compartilhado, não um espaço social. Cada vez que alguém propuser adicionar chat, fotos ou perfis, a resposta já está escrita aqui, com sua razão.

### 7. Por que dois sistemas e não um com bandeira

`grupo_infantil` (que cobre sala de professor e clube de pais, com regras de segurança idênticas) e `club_adulto` (com desafios e tarefas) devem ser **estruturas separadas no banco de dados**, não uma tabela com um campo `tipo`.

A razão não é de modelagem, mas de modo de falha. Com uma única tabela, no dia em que alguém adicionar texto livre, mensagens ou upload de imagens aos “clubs”, essa função recairá por padrão também sobre os grupos infantis, e a proteção depende de que quem escreva esse código lembre da regra. Com duas estruturas, adicionar texto livre ao clube de adultos **não pode** afetar as crianças mesmo que ninguém se lembre de nada. É a diferença entre uma convenção e um cadeado.

## Tabla de formas de prenda

| Forma | Quem carrega a consequência | Tabela de posições | Respaldo | Elemento legal que elimina |
|---|---|---|---|---|
| **A · Coletiva** | Todo o grupo, junto | Não (por design) | Strava Group Goal [2][3]; Johnson & Johnson vía `mc-18` | Prêmio (experiência compartilhada, sem transferência) |
| **B · O vencedor escolhe** | Ninguém; o primeiro ganha agência | Sim | Thompson Coburn sobre premios intangibles [1] | Prêmio (decidir não tem valor monetário) |
| **C · Compromisso próprio** | Um mesmo, contra sua própria meta | Opcional | Gollwitzer vía `mc-19`; postura de HealthyWage [6] | Azar (você controla seu resultado por completo) |
| ~~Castigo ao último~~ | ~~O que ficou para trás~~ | — | **Proibido**: linha vermelha #7, `mc-18` sobre dano no fundo do quadro | — |
| ~~Tributo entre membros~~ | ~~Os perdedores pagam ao vencedor~~ | — | **Proibido**: cria prêmio + transferência de valor entre pessoas | — |

## Implicações de design

1. **Nenhuma criança entra jamais em um desafio com aposta.** Os grupos infantis têm metas e celebrações; as apostas vivem exclusivamente em `club_adulto`. Isso exclui as crianças de toda a análise da §1.  
2. **A plataforma nunca toca valor**: não cobra para entrar em um desafio, não retém, não transfere, não arbitra e não faz cumprir. A aposta é um acordo social que o produto exibe, não uma obrigação que o produto administra. É a única condição que sustenta a posição da §1.  
3. **As três formas de aposta (A, B, C) são implementadas como tipos distintos**, não como variantes de texto de um mesmo objeto — porque cada uma tem um sujeito gramatical diferente (o grupo, o vencedor, o próprio) e é essa diferença que elimina a caixa de perdedor (§4).  
4. **Não existe nenhum campo que pergunte o que acontece com o último**, em nenhuma forma, em nenhuma tela, em nenhuma API.  
5. **Larry revisa toda aposta de texto livre antes que exista**, com o critério de três passos da §5: apontar uma pessoa é sempre rejeitado, sexo/violência/denigração são rejeitados, e todo o resto passa sem que Larry opine.  
6. **A moderação é uma chamada separada da do tutor** — prompt próprio, registro próprio, roteamento próprio (Haiku 4.5 com escalada para Sonnet 5 em baixa confiança). Não compartilha endpoint nem prompt com Larry Profe.  
7. **À prova de falhas: se Larry não puder revisar, a aposta não é publicada.** Nunca há texto sem revisão em produção, sob nenhuma condição de erro.  
8. **Larry rejeita de forma breve e em personagem, sem sermão** — uma rejeição moralizante transforma o adulto em adversário do produto, e o cânon de Larry já proíbe o tom condescendente (`mc-11`, `mc-37`).  
9. **Toda aposta rejeitada tem apelação para revisão humana com um toque.** Larry vai rejeitar piadas legítimas, e sem apelação isso se sente como censura.  
10. **Toda aposta é aceita explicitamente por cada membro antes de iniciar o desafio**, é visível desde antes, não pode ser editada após iniciar, e qualquer pessoa pode sair do desafio sem penalidade nem sinalização (§4).  
11. **Botão de denúncia permanente em cada aposta e em cada clube**, com revisão humana — a segunda camada, para o que Larry deixar passar.  
12. **Duas estruturas de dados separadas**, `grupo_infantil` e `club_adulto`, para que nenhuma função social adicionada aos adultos possa alcançar as crianças por omissão (§7).  
13. **O dono de um grupo infantil vê apelido, pontos e sequência. Nada mais.** Nem nome real, nem idade exata, nem pertencimento a outros grupos.  
14. **Zero canal privado adulto‑criança**, em qualquer grupo infantil, seja de professor ou de pai — a mitigação direta contra o que §6 identifica como o risco real.  
15. **O pai de cada criança aprova, vendo antes a identidade declarada do dono do clube**, com insígnia visível quando essa identidade não está verificada.  
16. **Limite de tamanho de clube infantil menor que o de salão**, e limite de clubes por conta, porque a criação ilimitada de grupos é a alavanca que um abusador usaria.  
17. **Registro completo e visível para o pai** de quem pediu acesso, quem aprovou e quando — o análogo do "contato de salvaguarda nomeado" que [5] exige, adaptado a um produto sem equipe.  
18. **Não apresentar o clube de pais como equivalente à supervisão de um clube esportivo real.** Texto honesto: é um quadro compartilhado entre famílias que já se conhecem, não um programa supervisionado.  
19. **Registrar a posição legal da §1 por escrito e revisá‑la com advogado antes de habilitar apostas em qualquer mercado** — este documento é pesquisa, não assessoria jurídica, e a conclusão "faltam dois de três elementos" depende de fatos do produto que uma mudança de roadmap pode invalidar.

## Perguntas abertas para o proprietário do projeto

1. Um adolescente de 12‑17 pode estar em um `club_adulto`? A resposta padrão deste documento é **não** (implicação 1), mas isso exclui o caso de um grupo de primos ou de colegas de ensino médio.  
2. O catálogo de apostas começa vazio com texto livre desde o primeiro dia, ou é semeado com exemplos curados que mostrem o tom esperado? Semeá‑lo é a forma barata de comunicar a norma sem proibí‑la.  
3. A aceitação explícita da aposta (implicação 5) é por desafio ou uma única vez por clube? Por desafio é mais seguro e mais incômodo.  
4. Os desafios de clube de adultos afetam o quadro global, ou vivem isolados no clube? Se afetam, é preciso revisar o controle de exposição de itens de `mc-29`.  
5. Quem atende a fila de apelações e denúncias (implicações 9 e 11), e com qual tempo de resposta comprometido? É a mesma pessoa para as duas filas ou são duas.  
6. Quando Larry rejeita uma aposta, ele diz ao autor **qual** das três regras quebrou, ou apenas que não passou? Dizer ajuda a corrigir; também ensina a driblar o filtro.  
7. O prompt de moderação do Larry é criado por idioma ou traduzido? O que é denegrente é fortemente cultural — o que no México é uma piada entre amigos na Alemanha pode não ser, e vice‑versa.  
6. É permitido que um clube infantil misture filhos de várias famílias que **não** se conhecem entre si, ou é limitado a famílias que já têm um vínculo prévio? Essa é a diferença entre um risco contido e um aberto.

## Fontes

1. Thompson Coburn LLP, "Shield your sweepstakes from gambling laws" — https://www.thompsoncoburn.com/insights/blogs/sweepstakes-law/post/2011-12-21/shield-your-sweepstakes-from-gambling-laws — fonte dos três elementos, das definições citadas de consideração e azar, e da observação sobre prêmios intangíveis.  
2. Strava Community Hub, "Combining Competition and Collaboration with Group Challenges" — https://communityhub.strava.com/insider-journal-9/combining-competition-and-collaboration-with-group-challenges-1494  
3. Strava Support, "Group Challenges" — https://support.strava.com/en-us/articles/15401736-group-challenges — fonte dos quatro tipos de desafio e da citação sobre a ausência deliberada de tabela de classificação no Group Goal.  
4. JDP, "The Ultimate Guide to Background Checks for Youth Sports Volunteers" — https://www.jdp.com/blog/the-ultimate-guide-to-background-checks-for-youth-sports-volunteers/  
5. TidyHQ, "SafeSport Compliance Checklist for US Youth Sports Organizations" — https://tidyhq.com/blog/safeguarding-checklist-us-sports-organizations — fonte do padrão de "contato não supervisionado" e do requisito de contato de salvaguarda nomeado.  
6. HealthyWage, HealthyWager FAQ — https://www.healthywage.com/healthywager/faq/ — fonte da postura pública de que o usuário controla o resultado, usada aqui como precedente de argumentação, não como validação legal.  
7. Investigação interna: `2026-07-31-mc-18-leaderboards-competition.md` (Johnson & Johnson sobre estruturas cooperativas; dano concentrado no fundo do quadro), `2026-07-31-mc-19-habit-loops-push-notifications.md` (intenções de implementação de Gollwitzer), `2026-07-31-mc-28-teacher-classroom-mode.md` (o vazio de verificação do professor, T-5), `2026-07-31-mc-43-avatars-identity-progression.md` (escolha limitada em vez de entrada livre), `2026-07-31-mc-17-ethical-gamification-dark-patterns.md` (exposição regulatória de mecânicas de azar com menores), `2026-07-31-mc-37-larry-profe-port.md` (cânon de Larry, roteamento de modelos, o padrão de chamada separada), `2026-07-31-mc-11-feedback-formative-assessment.md` (por que a rejeição moralizante é contraproducente).

**Isto é pesquisa, não assessoria jurídica.** A conclusão da §1 —que faltam ao menos dois dos três elementos— baseia‑se em fatos do produto (a plataforma não cobra, não retém, não transfere, não faz cumprir) que devem continuar verdadeiros para que a conclusão se sustente. Um advogado deve revisá‑la antes de habilitar apostas em qualquer mercado, e a fonte [1] é de 2011 e dos EUA: não cobre México, Brasil, nem a UE, onde `mc-17` já documentou que Bélgica e Países Baixos legislaram sobre mecânicas de azar de forma mais rígida que os EUA.
