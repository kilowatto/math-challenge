# Clubes, desafios de grupo e prendas: como ter apostas sem perdedor e sem exposição regulatória

> Math Challenge research — 2026-07-31 — topic 46

## Resumo executivo (ES)

- **O jogo ilegal é definido, em praticamente toda a legislação estadual dos EUA, por três elementos: prémio, azar e consideração — e os três devem estar presentes** [1]. Basta eliminar um para ficar fora. A estratégia padrão da indústria de sorteios é exatamente essa: remover pelo menos um elemento [1].
- **O azar já está ausente aqui.** Um desafio matemático é ganho por habilidade, não por sorte. A formulação jurídica aplicável é a dos concursos de destreza, onde *"os vencedores não são escolhidos por azar mas com base em algum critério mensurável"* [1].
- **A consideração é eliminada se a plataforma não tocar nada de valor.** Consideração significa *"pagamento de dinheiro ou de algo valioso para entrar, ou a exigência de fazer uma compra"* [1]. Se o Math Challenge não cobra para entrar num desafio, não retém, não transfere e não impõe nada, não há consideração para a plataforma.
- **O prémio também pode ser minimizado:** prémios intangíveis como *"direito de se gabar"* têm valor monetário mínimo e podem não alcançar o limiar legal de "prémio" [1].
- **A Strava já resolveu a aposta sem perdedor, e funciona.** O seu modo *Group Goal* permite ao grupo perseguir uma meta partilhada e —na sua própria documentação— *"não tem tabela de classificação, por isso acabas a comparar-te menos com os outros"* [2][3]. Coexiste com os desafios competitivos como um modo alternativo, não como substituto.
- A Strava oferece quatro tipos de desafio de grupo: *Most Activity*, *Fastest Effort*, *Longest Single Activity* e *Group Goal* — apenas o último é cooperativo [2][3].
- **O padrão real de salvaguarda em desportos juvenis** exige verificação de antecedentes a *"qualquer voluntário com oportunidade de contacto não supervisionado ou um‑a‑um com menores"*, mais uma pessoa nomeada como contacto de salvaguarda conhecida por todos [4][5]. A palavra que importa é **não supervisionado**.
- Não podemos efetuar verificação de antecedentes, mas podemos **desenhar para que não exista contacto não supervisionado**: sem chat, sem canal privado, com o proprietário do clube a ver apenas alias e pontos, e com o pai de cada criança a aprovar a entrada.
- **Nenhum menor entra jamais num desafio com prenda.** Isso mantém toda a análise de jogo longe das crianças, onde a exposição regulatória documentada em `mc-17` (Bélgica, Países Baixos, DSA, Children's Code) seria severa.
- **O Larry modera o texto da prenda antes de que exista**, com critério de jogo entre adultos: a piada passa; sexo, violência e degradação não — e nada que destaque uma pessoa passa. É uma chamada distinta da do tutor, com o seu próprio prompt, o seu próprio registo e comportamento à prova de falhas.
- Conclusão de design: **dois sistemas separados na base de dados** — `grupo_infantil` (salão de mestre + clube de pais, regras idênticas) e `club_adulto` (com desafios e prendas) — para que uma funcionalidade adicionada a "os clubes" não possa aterrar por engano sobre crianças.

## Resumo executivo (EN)

- **O jogo ilegal é definido, em praticamente toda a legislação estadual dos EUA, por três elementos — prémio, azar e consideração — e os três devem estar presentes** [1]. Remover um é suficiente. Essa é precisamente a estratégia padrão da indústria de sorteios: eliminar pelo menos um elemento [1].
- **O azar já está ausente aqui.** Um desafio de matemática é ganho por habilidade. O enquadramento aplicável é o de concurso de destreza, onde *"os vencedores não são selecionados por azar mas sim escolhidos com base em algum critério mensurável"* [1].
- **A consideração é eliminada se a plataforma nunca tocar em nada de valor.** Consideração significa *"pagamento de dinheiro ou algo valioso para entrar, ou a exigência de que se faça uma compra"* [1]. Se o Math Challenge não cobra nada para entrar, não mantém escrow, não transfere nada e não impõe nada, não há consideração a fluir para a plataforma.
- **O prémio também pode ser minimizado:** recompensas intangíveis como *"direitos de se gabar"* têm valor monetário mínimo e podem não cumprir o limiar legal para um prémio [1].
- **A Strava já lançou a aposta sem perdedor, e funciona.** O seu modo *Group Goal* permite a um grupo perseguir um objetivo partilhado e — segundo a sua própria documentação — *"não tem um ranking de classificação, por isso acabas a comparar-te menos com os outros"* [2][3]. Coexiste com desafios competitivos como um modo alternativo, não como substituto.
- **O padrão real de salvaguarda em desportos juvenis** requer verificações de antecedentes para *"qualquer voluntário com oportunidade de contacto não supervisionado ou um‑a‑um com menores"*, além de um contacto de salvaguarda nomeado conhecido por todos [4][5]. A palavra‑chave é **não supervisionado**.
- Não podemos efetuar verificações de antecedentes, mas podemos **desenhar de modo a que não exista contacto não supervisionado**: sem chat, sem canal privado, o proprietário do clube vê apenas alias e pontos, e cada pai da criança aprova a adesão.
- **Nenhum menor está jamais num desafio com apostas.** Isso mantém toda a análise de jogo longe das crianças, onde a exposição regulatória documentada em `mc-17` seria severa.
- **O Larry modera o texto da aposta antes de existir**, com julgamento de jogo adulto: a piada passa; sexo, violência e degradação não — e nada que destaque uma pessoa passa. É uma chamada separada da do tutor, com o seu próprio prompt, registo de auditoria e comportamento fail‑closed.
- Conclusão de design: **dois sistemas separados na camada de dados** — `grupo_infantil` e `club_adulto` — para que uma funcionalidade adicionada a "clubes" não possa aterrar em crianças por acidente.

## Constatações

### 1. Os três elementos, e como se elimina um

Thompson Coburn LLP resume o quadro que governa tudo isto: praticamente toda a lei estadual define o jogo ilegal como a presença simultânea de **prémio, sorte e consideração**, e **os três devem estar presentes** para que uma promoção se qualifique como jogo ilegal [1]. A estratégia inteira da indústria de sorteios consiste em assegurar‑se de eliminar pelo menos um.

Como se elimina cada um, segundo a mesma fonte [1]:

- **Prémio.** Difícil de eliminar por completo, mas recompensas intangíveis como *"direito de presumir"* ou a designação de vencedor semanal têm valor monetário mínimo e **podem não alcançar o limiar legal** de "prémio".
- **Sorte.** Converte o sorteio num concurso de destreza, onde *"os vencedores não são escolhidos por sorte mas com base em algum critério mensurável"*. Alternativamente, estrutura‑se como um presente onde todos recebem algo.
- **Consideração.** É a que mais comumente se elimina. Inclui *"o pagamento de dinheiro ou de algo valioso para entrar, ou o requisito de que se deva fazer uma compra"*. Notavelmente, exigir que alguém **envie os seus dados de contacto não é consideração** — daí que as vias de entrada gratuita sejam padrão no desenho de sorteios. A distinção legal depende de se o participante deve fazer algo **além do comportamento normal de cliente** para entrar.

**Onde se situa o Math Challenge.** A sorte está ausente pela natureza do produto: resolver desafios matemáticos é um critério mensurável de destreza, não de sorte. A consideração está ausente enquanto a plataforma não cobrar para entrar num desafio nem reter, transferir ou fazer cumprir nada de valor. E com as formas de aposta propostas abaixo (§3), o prémio reduz‑se a agência ou a uma experiência partilhada, ou seja, próximo do limiar de "direito de presumir".

**Faltam dois de três, possivelmente os três.** Mas essa posição depende **totalmente** de que a plataforma nunca toque valor. No dia em que o Math Challenge reter $20 de cada participante, surge a consideração e a análise inverte‑se por completo. Essa é a linha, e não é difusa.

### 2. O precedente que já existe: Strava Group Goal

A Strava opera quatro tipos de desafio de grupo: *Most Activity* (quem acumula mais tempo, distância ou desnível), *Fastest Effort* (ritmo médio), *Longest Single Activity*, e *Group Goal* (perseguir uma meta partilhada como grupo) [2][3]. Os três primeiros são competitivos com tabela de classificação; o quarto não.

A descrição da Strava do modo cooperativo é a observação de design mais útil de toda esta investigação: *"Se competir com os teus amigos não é o teu estilo, podes criar um desafio de Group Goal para avançar juntos rumo a uma meta partilhada. Esta versão do desafio grupal **não tem tabela de classificação, por isso passas a comparar‑te menos com os demais**"* [3].

Duas leituras importam. Primeiro, **a ausência de tabela é a função, não uma limitação** — é o que faz com que o modo sirva a quem a competição desmotiva, que é exatamente a população que `mc-18` identifica como a que se desengaja no fundo do tabuleiro. Segundo, **a Strava oferece‑o junto aos competitivos, não em substituição**: a escolha do modo é feita pelo organizador do desafio conforme o seu grupo. Análises da própria plataforma apontam que os desafios grupais priorizam a conexão sobre a competição pura e sustentam a comunidade [2].

Isto converge com o que já está em `mc-18`: a meta‑análise de Johnson & Johnson (122 estudos, 286 descobertas) encontra que as estruturas cooperativas superam consistentemente as competitivas e individualistas tanto em desempenho como em relações entre pares.

### 3. O que torna divertida uma aposta, decomposta

Antes de propor formas, vale decompôr o que produz o prazer de uma aposta social. Quatro coisas: que **todos tenham algo em jogo**, que **o resultado importe**, que **sobre fique uma anedota**, e que **o grupo tenha feito algo em conjunto**.

**Nenhuma das quatro requer um perdedor.** A punição ao último não é o ingrediente ativo — é uma consequência de assumir, sem examiná‑la, que a aposta tem de recair sobre alguém. Deste observação surgem três formas que conservam as quatro propriedades:

A · Aposta coletiva. O grupo compromete‑se em conjunto contra uma meta partilhada. Ganha‑se ou não se ganha em grupo. É o *Group Goal* da Strava aplicado a pontos de matemática, com o apoio cooperativo de Johnson & Johnson.

B · O vencedor escolhe. Inverte‑se a direção do prémio: o primeiro lugar não recebe tributo dos demais, mas **decide** algo para o grupo — o próximo desafio, a meta do clube, o local para onde vão. O prémio é **agência, não tributo**. Legalmente é a forma mais limpa, porque decidir não tem valor monetário e roça o limiar de "direito de presumir" que [1] indica como provavelmente insuficiente para constituir prémio.

C · Compromisso próprio. Cada um aposta contra a sua própria meta, publicamente. É a forma melhor sustentada por evidência: são as intenções de implementação de Gollwitzer já documentadas em `mc-19`, com efeitos grandes e replicados (100 % vs. 53 % de cumprimento em auto‑exames; 4,2 kg vs. 2,1 kg de perda de peso). É também, não por acaso, o mecanismo com que a HealthyWage sustenta que não é jogo: o seu argumento público é que **o utilizador controla o resultado em todo o momento** [6].

### 4. A propriedade estrutural que torna desnecessária a moderação

As três formas partilham algo que vale mais que qualquer regra de moderação: **nenhuma tem uma caixa de perdedor**.

- Na aposta coletiva, o texto descreve o que faz **o grupo**.
- Em "o vencedor escolhe", escreve‑o **quem ganhou**, sobre o que se segue.
- No compromisso próprio, só se pode escrever **sobre si próprio**.

Em nenhuma das três existe um campo que responda a "o que acontece ao último?". Isto significa que **o texto livre pode existir sem que a humilhação tenha onde aterrar**: não é que se proíba escrevê‑la, é que não há ranhura no modelo de dados onde a colocar. É a mesma lógica estrutural com que `mc-43` resolve os alias (escolha dentro de um conjunto limitado em vez de entrada livre), aplicada um nível mais acima: em vez de limitar o vocabulário, limita‑se **o objeto sobre o qual o texto pode falar**.

**Risco residual, dito de forma direta.** Isto não é hermético. Alguém pode escrever, dentro de uma aposta coletiva, "vamos por tacos e o João rapa‑se". O que a estrutura garante é que o sistema nunca *designe* o João, nunca o aponte e nunca o faça cumprir — a aposta continua a ser do grupo. Essa lacuna é a que o Larry fecha em §5, e o que resta depois é mitigado por procedimento: a aposta é visível **antes** de o desafio começar, **todos os membros aceitam‑na explicitamente** para ficar dentro, qualquer pessoa pode sair sem penalização, não se pode editar uma vez iniciado, e há botão de denúncia permanente. Com isso, ninguém fica sujeito a uma aposta que não leu e aceitou.

### 5. Larry como moderador de prendas

**Decisão do proprietário:** o texto livre das prendas é revisto por Larry antes de a prenda existir, com critério explícito de **jogo entre adultos** — a piada passa; o sexo, a violência e o que é denigrante não.

**Isto não quebra o cânone de “Larry nunca calcula”.** Essa regra, documentada em `mc-37` e D-004, existe por uma razão específica: um tutor que recalcula matemática se engana e ensina erro. Julgar se um texto é denigrante é uma tarefa distinta, e é uma das que os modelos de linguagem fazem bem. O que se herda é que **é outra chamada, não a mesma**: prompt próprio, modelo próprio, registo próprio, e nenhuma relação com o endpoint do tutor.

**O critério que Larry aplica**, em ordem de precedência:

1. **Aponta a uma pessoa?** Uma prenda que nomeia um indivíduo como quem carrega a consequência é rejeitada, ainda que venha em tom de piada. É a única regra que não admite matiz, porque sustenta a linha vermelha do produto.  
2. **Há sexo, violência ou denigração?** Rejeita‑se. Inclui o que degrada por aparência, peso, origem, capacidade ou qualquer característica de uma pessoa — o cânone de Larry já proíbe que o humor vá sobre características das pessoas (`mc-37`), e aqui estende‑se do que Larry *diz* ao que Larry *deixa passar*.  
3. **É um jogo entre adultos?** Se passar nos itens 1 e 2, **passa**. Larry não é um censor de bom gosto: “o que ganha escolhe o bar”, “o clube paga a primeira ronda”, “o vencedor escolhe a playlist um mês” são prendas legítimas e Larry não tem de opinar sobre elas.

**O tom ao rejeitar importa tanto quanto a rejeição.** Larry não sermoneia. `mc-11` é explícito ao afirmar que a retroacção dirigida à pessoa em vez da tarefa é o mecanismo pelo qual mais de um terço das intervenções estudadas **pioram** o resultado — e embora essa descoberta seja sobre aprendizagem, o mecanismo social é o mesmo: uma rejeição moralizante converte um adulto em adversário do produto. Larry rejeita brevemente, em personagem, sem lição: *“Vou ter de a devolver — deixa o grupo inteiro na prenda, não só a um. Damos outra volta?”*

**Comportamento à prova de falhas.** Se a chamada de moderação falhar ou expirar, a prenda **não se publica**. Mostra‑se que Larry não pôde revê‑la e oferece‑se a tentar novamente. Nunca se publica texto sem revisão sob qualquer condição de erro — o modo de falha barato é um utilizador irritado, o modo de falha caro é uma humilhação publicada que o produto prometeu que não poderia acontecer.

**Encaminhamento e custo.** O volume é trivial comparado com o do tutor: uma chamada por prenda criada, não por tentativa. Haiku 4.5 basta para o caso claro, com escalada a Sonnet 5 quando o veredicto for de baixa confiança — o matiz entre “piada entre amigos” e “denigração” é exatamente onde um modelo pequeno se engana em ambas as direções. Com o encaminhamento de D-015 e o limite de gasto do AI Gateway, isto não move a agulha do orçamento.

**Falsos positivos e apelação.** Larry vai errar, e vai rejeitar piadas legítimas. Sem via de apelação, isso sente‑se como censura e é a queixa que vai chegar. Toda prenda rejeitada deve poder ser enviada a revisão humana com um toque, e essa fila necessita de dono e tempo de resposta comprometido — a mesma fila dos relatórios.

**Registo.** Cada decisão é registada: texto proposto, veredicto, modelo, motivo e confiança. Serve para três coisas: afinar o prompt com casos reais, resolver apelações com evidência, e detetar quem insiste em passar o mesmo dez vezes com variantes.

### 6. Os clubes de pais e o padrão real de salvaguarda

A literatura de desportos juvenis é a referência mais próxima a “um adulto organiza uma atividade para crianças alheias”. O padrão geral que reporta: requer‑se verificação de antecedentes para *“qualquer voluntário com oportunidade de contacto não supervisionado ou um‑a‑um com menores”* — incluindo pais coordenadores que organizam atividades ou gerem comunicações que envolvem contacto com crianças [4][5]. Uma verificação mínima cobre antecedentes criminais federais e registo de ofensores sexuais; recomenda‑se repeti‑la a cada ano ou a cada temporada, com consentimento escrito prévio [4][5]. E estruturalmente: deve existir **uma pessoa nomeada, cujo nome e contacto sejam conhecidos por todos**, como primeiro ponto de contacto perante qualquer preocupação de salvaguarda [5].

**Math Challenge não pode efetuar verificação de antecedentes**, e fingir o contrário seria pior do que não o fazer. Mas a própria definição indica onde está o risco: **contacto não supervisionado**. A solução de design é eliminar a categoria inteira:

- **Sem chat e sem mensagens diretas, em nenhuma direção, nunca.** Já é a regra para professores (D-011); estende‑se identicamente aos clubes.  
- **O proprietário do clube vê exclusivamente alias, pontos e racha.** Nem nome real, nem idade exata, nem foto, nem outro grupo ao qual a criança pertença.  
- **O pai de cada criança aprova a entrada**, e vê a identidade declarada do proprietário antes de aprovar — o padrão invertido de ClassDojo que `mc-28` identifica como o único mecanismo de segurança confirmado na indústria.  
- **É convidado partilhando um código com os pais**, nunca a procurar ou contactar crianças.  
- **Limite rígido mais pequeno que uma sala**: um clube é um grupo de amigos, não uma escola.  
- **Botão de denúncia permanente** e registo completo de altas, aprovações e baixas.

A afirmação honesta que resulta disso: **um clube de pais é seguro precisamente porque é anémico.** É um tabuleiro partilhado, não um espaço social. Cada vez que alguém propuser acrescentar chat, fotos ou perfis, a resposta já está escrita aqui, com a sua razão.

### 7. Por que dois sistemas e não um com bandeira

`grupo_infantil` (que cobre sala de professor e clube de pais, com regras de segurança idênticas) e `club_adulto` (com desafios e prendas) devem ser **estruturas separadas na base de dados**, não uma tabela com um campo `tipo`.

A razão não é de modelação mas de modo de falha. Com uma única tabela, no dia em que alguém adicione texto livre, mensagens ou upload de imagens aos “clubs”, essa função aterra por defeito também nos grupos infantis, e a proteção depende de quem escreve esse código lembrar a regra. Com duas estruturas, adicionar texto livre ao clube de adultos **não pode** tocar nas crianças mesmo que ninguém se lembre de nada. É a diferença entre uma convenção e um cadeado.

## Tabela de formas de prenda

| Forma | Quem carrega a consequência | Tabela de posições | Respaldo | Elemento legal que elimina |
|---|---|---|---|---|
| **A · Coletiva** | Todo o grupo, em conjunto | Não (por design) | Strava Group Goal [2][3]; Johnson & Johnson via `mc-18` | Prémio (experiência partilhada, sem transferência) |
| **B · O vencedor escolhe** | Ninguém; o primeiro ganha agência | Sim | Thompson Coburn sobre prémios intangíveis [1] | Prémio (decidir não tem valor monetário) |
| **C · Compromisso próprio** | Um mesmo, contra a sua própria meta | Opcional | Gollwitzer via `mc-19`; postura de HealthyWage [6] | Azar (controlas o teu resultado por completo) |
| ~~Castigo ao último~~ | ~~O que ficou atrás~~ | — | **Proibido**: linha vermelha #7, `mc-18` sobre dano no fundo do tabuleiro | — |
| ~~Tributo entre membros~~ | ~~Os perdedores pagam ao vencedor~~ | — | **Proibido**: cria prémio + transferência de valor entre pessoas | — |

## Implicações de design

1. **Nenhuma criança entra jamais num desafio com prémio.** Os grupos infantis têm metas e celebrações; os prémios vivem exclusivamente em `club_adulto`. Isto exclui as crianças de toda a análise da §1.  
2. **A plataforma nunca toca valor**: não cobra por entrar num desafio, não retém, não transfere, não arbitra e não faz cumprir. O prémio é um acordo social que o produto mostra, não uma obrigação que o produto administra. É a única condição que sustenta a posição da §1.  
3. **As três formas de prémio (A, B, C) implementam‑se como tipos distintos**, não como variantes de texto de um mesmo objeto — porque cada uma tem um sujeito gramatical distinto (o grupo, o vencedor, o próprio) e é essa diferença que elimina a caixa do perdedor (§4).  
4. **Não existe nenhum campo que pergunte o que se passa ao último**, em nenhuma forma, em nenhum ecrã, em nenhuma API.  
5. **Larry revê todo prémio de texto livre antes de existir**, com o critério de três passos da §5: apontar uma pessoa rejeita‑se sempre, sexo/violência/denigração rejeitam‑se, e todo o resto passa sem que Larry opine.  
6. **A moderação é uma chamada separada da do tutor** — prompt próprio, registo próprio, encaminhamento próprio (Haiku 4.5 com escalada para Sonnet 5 em baixa confiança). Não partilha endpoint nem prompt com Larry Profe.  
7. **À prova de falhas: se o Larry não puder rever, o prémio não é publicado.** Nunca há texto sem rever em produção, sob nenhuma condição de erro.  
8. **Larry rejeita de forma breve e em personagem, sem sermão** — uma rejeição moralizante converte o adulto em adversário do produto, e o cânone do Larry já proíbe o tom condescendente (`mc-11`, `mc-37`).  
9. **Todo prémio rejeitado tem apelo para revisão humana com um toque.** O Larry vai rejeitar piadas legítimas, e sem apelo isso parece censura.  
10. **Todo prémio é aceito explicitamente por cada membro antes de iniciar o desafio**, é visível desde antes, não pode ser editado após iniciar, e qualquer pessoa pode sair do desafio sem penalização nem sinalização (§4).  
11. **Botão de denúncia permanente em cada prémio e em cada clube**, com revisão humana — a segunda camada, para o que o Larry deixar passar.  
12. **Duas estruturas de dados separadas**, `grupo_infantil` e `club_adulto`, para que nenhuma função social adicionada aos adultos possa alcançar as crianças por omissão (§7).  
13. **O proprietário de um grupo infantil vê alcunhas, pontos e sequência. Nada mais.** Nem nome real, nem idade exata, nem pertença a outros grupos.  
14. **Zero canal privado adulto‑criança**, em qualquer grupo infantil, seja de professor ou de pai — a mitigação direta contra o que a §6 identifica como o risco real.  
15. **O pai de cada criança aprova, vendo antes a identidade declarada do proprietário do clube**, com insígnia visível quando essa identidade não está verificada.  
16. **Limite de tamanho de clube infantil menor que o de salão**, e limite de clubes por conta, porque a criação ilimitada de grupos é a alavanca que um abusador utilizaria.  
17. **Registo completo e visível para o pai** de quem pediu acesso, quem aprovou e quando — o análogo do "contacto de salvaguarda nomeado" que [5] exige, adaptado a um produto sem pessoal.  
18. **Não apresentar o clube de pais como equivalente à supervisão de um clube desportivo real.** Texto honesto: é um quadro partilhado entre famílias que já se conhecem, não um programa supervisionado.  
19. **Registar a posição legal da §1 por escrito e revê‑la com advogado antes de habilitar prémios em qualquer mercado** — este documento é investigação, não assessoria jurídica, e a conclusão "faltam dois dos três elementos" depende de factos do produto que uma mudança de roadmap pode invalidar.

## Questões abertas para o proprietário do projeto

1. Um adolescente de 12‑17 pode estar num `club_adulto`? A resposta por defeito deste documento é **não** (implicação 1), mas isso exclui o caso de um grupo de primos ou de colegas de ensino secundário.  
2. O catálogo de prémios começa vazio com texto livre desde o primeiro dia, ou é semeado com exemplos curados que mostrem o tom esperado? Semeá‑lo é a forma barata de comunicar a norma sem a proibir.  
3. A aceitação explícita do prémio (implicação 5) é por desafio ou uma só vez por clube? Por desafio é mais seguro e mais incômodo.  
4. Os desafios de clube de adultos afetam o quadro global, ou vivem isolados no clube? Se afetam, é preciso rever o controlo de exposição dos itens de `mc-29`.  
5. Quem atende à fila de apelos e denúncias (implicações 9 e 11), e com que tempo de resposta comprometido? É a mesma pessoa para as duas filas ou são duas.  
6. Quando o Larry rejeita um prémio, diz ao autor **qual** das três regras violou, ou apenas que não passou? Dizer ajuda a corrigir; também ensina a contornar o filtro.  
7. O prompt de moderação do Larry é criado por idioma ou traduzido? O que é denegrente é fortemente cultural — o que no México é uma piada entre amigos na Alemanha pode não ser, e vice‑versa.  
6. É permitido que um clube infantil misture filhos de várias famílias que **não** se conhecem entre si, ou limita‑se a famílias que já têm um vínculo prévio? É a diferença entre um risco contido e um aberto.

## Fontes

1. Thompson Coburn LLP, "Shield your sweepstakes from gambling laws" — https://www.thompsoncoburn.com/insights/blogs/sweepstakes-law/post/2011-12-21/shield-your-sweepstakes-from-gambling-laws — fonte dos três elementos, das definições citadas de consideração e azar, e da observação sobre prémios intangíveis.  
2. Strava Community Hub, "Combining Competition and Collaboration with Group Challenges" — https://communityhub.strava.com/insider-journal-9/combining-competition-and-collaboration-with-group-challenges-1494  
3. Strava Support, "Group Challenges" — https://support.strava.com/en-us/articles/15401736-group-challenges — fonte dos quatro tipos de desafio e da citação sobre a ausência deliberada de tabela de classificação no Group Goal.  
4. JDP, "The Ultimate Guide to Background Checks for Youth Sports Volunteers" — https://www.jdp.com/blog/the-ultimate-guide-to-background-checks-for-youth-sports-volunteers/  
5. TidyHQ, "SafeSport Compliance Checklist for US Youth Sports Organizations" — https://tidyhq.com/blog/safeguarding-checklist-us-sports-organizations — fonte do padrão de "contacto não supervisionado" e do requisito de contacto de salvaguarda nomeado.  
6. HealthyWage, HealthyWager FAQ — https://www.healthywage.com/healthywager/faq/ — fonte da posição pública de que o utilizador controla o resultado, usada aqui como precedente de argumentação, não como validação jurídica.  
7. Investigação interna: `2026-07-31-mc-18-leaderboards-competition.md` (Johnson & Johnson sobre estruturas cooperativas; dano concentrado no fundo da tabela), `2026-07-31-mc-19-habit-loops-push-notifications.md` (intenções de implementação de Gollwitzer), `2026-07-31-mc-28-teacher-classroom-mode.md` (o vazio de verificação do professor, T-5), `2026-07-31-mc-43-avatars-identity-progression.md` (escolha limitada em vez de entrada livre), `2026-07-31-mc-17-ethical-gamification-dark-patterns.md` (exposição regulatória de mecânicas de azar com menores), `2026-07-31-mc-37-larry-profe-port.md` (cânone do Larry, encaminhamento de modelos, o padrão de chamada separada), `2026-07-31-mc-11-feedback-formative-assessment.md` (por que a rejeição moralizante é contraproducente).

**Isto é investigação, não assessoria jurídica.** A conclusão da §1 —que faltam pelo menos dois dos três elementos— baseia‑se em factos do produto (a plataforma não cobra, não retém, não transfere, não faz cumprir) que devem continuar a ser verdadeiros para que a conclusão se sustente. Um advogado deve revê‑la antes de habilitar prémios em qualquer mercado, e a fonte [1] é de 2011 e norte‑americana: não cobre México, Brasil, nem a UE, onde `mc-17` já documentou que a Bélgica e os Países Baixos legislaram sobre mecânicas de azar de forma mais rigorosa que os EUA.
