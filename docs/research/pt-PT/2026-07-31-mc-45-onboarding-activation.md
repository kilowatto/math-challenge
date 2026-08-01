# Onboarding, registo e ativação: quantos campos, e porque é que os tours quase nunca servem

> Math Challenge research — 2026-07-31 — topic 45

## Resumo executivo (ES)

- **O registo é o gargalo mensurável.** A HubSpot analisou formulários de 40.000 clientes e descobriu que reduzir de 4 campos para 3 aumentou a conversão **quase 50 %** [1]. Os benchmarks de 2026 fornecem uma curva completa: 23,1 % com 3 campos, 17,0 % com 5, 11,4 % com 7, 6,9 % com 10 ou mais [5].
- **A queda não é linear.** Entre 5 e 7 campos cada campo extra custa ~2,8 pontos percentuais, contra ~1,5 antes desse intervalo [5] — há um despenhadeiro, não uma inclinação.
- **A relação não é uma lei.** Várias fontes documentam casos em que reduzir campos *abaixou* a conversão em 14 % e análises em que dez campos converteram melhor do que três [3][5]. A leitura honesta: menos campos ajudam quase sempre, mas é uma hipótese a medir, não um axioma.
- **Nielsen Norman Group desaconselha o onboarding, em geral.** A sua recomendação literal é *"evitem criar onboarding de app sempre que possível, e em vez disso gastem esses recursos a tornar a interface mais utilizável"*, por três razões: aumenta o custo de interação, sobrecarrega a memória de trabalho e a investigação mostra que frequentemente não melhora o desempenho real na tarefa [2].
- **O carrossel de cartões está desaconselhado por nome.** NN/g indica explicitamente: faz com que a interface *pareça mais complexa do que realmente é*, sobrecarrega a memória de trabalho, e a sua investigação sobre "deck-of-cards tutorials" encontrou que **não melhoraram o desempenho na tarefa** [2].
- **Só três casos justificam o onboarding**, segundo NN/g: solicitar informação indispensável, adaptar a experiência ao contexto do utilizador, e introduzir fluxos **genuinamente inovadores** que se afastam dos padrões habituais [2].
- **O que funciona é o contextual.** NN/g favorece a ajuda contextual sobre a instrução antecipada: as dicas aparecem quando a funcionalidade se torna acionável, não ao abrir a app [2]. As marcas de guia (*coach marks*) funcionam quando são oportunas e discretas, e são acompanhadas da tarefa real [2].
- **Uma regra visual concreta:** o estilo de uma dica deve deixar inequivocamente claro que se trata de uma anotação e **não um elemento interativo** [2].
- **NN/g recomenda testar a app sem onboarding primeiro**, para identificar dificuldades reais antes de investir em resolvê‑las com ecrãs [2].
- Implicação central para o Math Challenge: **registo de 2 campos, configuração progressiva e saltável, e exatamente cinco marcas contextuais** — as cinco coisas do produto que são verdadeiramente inovadoras e não se explicam por si próprias.

## Resumo executivo (EN)

- **O registo é o gargalo mensurável.** A HubSpot analisou formulários de 40.000 clientes e descobriu que reduzir os campos de 4 para 3 aumentou a conversão em **quase 50 %** [1]. Os benchmarks de 2026 fornecem a curva completa: 23,1 % com 3 campos, 17,0 % com 5, 11,4 % com 7, 6,9 % com 10 ou mais [5].
- **A queda não é linear.** Entre 5 e 7 campos cada campo adicional custa ~2,8 pontos percentuais versus ~1,5 abaixo desse intervalo [5] — um despenhadeiro, não uma inclinação.
- **Não é uma lei.** Fontes documentam casos em que reduzir campos *abaixou* a conversão em 14 % e análises em que dez campos superaram três [3][5]. Leitura honesta: menos campos ajudam quase sempre, mas é uma hipótese a medir, não um axioma.
- **Nielsen Norman Group aconselha contra o onboarding em geral.** A sua recomendação literal é *"evite criar onboarding de app sempre que possível e, em vez disso, gaste os seus recursos a tornar a UI mais utilizável"* — porque aumenta o custo de interação, sobrecarrega a memória de trabalho e a investigação mostra que frequentemente falha em melhorar o desempenho real da tarefa [2].
- **O formato de carrossel de cartões é desaconselhado pelo nome.** NN/g observa que faz as interfaces *parecerem mais complexas do que são*, sobrecarrega a memória de trabalho, e a sua investigação sobre tutoriais de "deck-of-cards" constatou que **não melhoraram o desempenho da tarefa** [2].
- **Só três casos justificam o onboarding**, segundo NN/g: recolher informação essencial, adaptar ao contexto do utilizador e introduzir fluxos **genuinamente inovadores** que se desviam dos padrões habituais [2].
- **O que funciona é o contextual.** NN/g defende a ajuda contextual em vez de instrução antecipada: as dicas surgem quando as funcionalidades se tornam acionáveis, não de imediato [2]. As coach marks funcionam quando são oportunas, discretas e associadas à conclusão real da tarefa [2].
- **Uma regra visual concreta:** o estilo visual de uma dica deve deixar inequívoco que se trata de uma anotação e **não um elemento interativo** [2].
- **NN/g recomenda testar a app sem onboarding primeiro**, para encontrar dificuldades reais dos utilizadores antes de investir em ecrãs para as resolver [2].
- Implicação principal: **registo de 2 campos, configuração progressiva e saltável, e exatamente cinco marcas contextuais** — as cinco coisas deste produto que são genuinamente inovadoras e não se explicam por si próprias.

## Constatações

### 1. O custo de cada campo de registo

A cifra mais citada e melhor sustentada provém da HubSpot, que estudou formulários de contacto de 40.000 clientes: a conversão **subiu quase a metade** ao reduzir de 4 campos para 3 [1]. Um estudo de benchmarks de 2026 traça a curva completa e é a fonte mais útil para orçamentar campos [5]:

| Campos | Conversão |
|---|---|
| 3 | 23,1% |
| 5 | 17,0% |
| 7 | 11,4% |
| 10+ | 6,9% |

O importante não é a inclinação média, mas **onde está a ruptura**: entre 5 e 7 campos cada campo adicional custa ~2,8 pontos percentuais, contra ~1,5 pontos por campo antes desse intervalo [5]. Ou seja, o sexto e o sétimo campo são muito mais caros que o quarto.

**A advertência que há que conservar.** A correlação não é perfeita nem universal: há casos documentados em que reduzir campos produziu uma **queda** de 14 % na conversão, e pelo menos uma análise onde dez campos converteram melhor que três [3][5]. A explicação habitual é a qualidade da intenção — um formulário longo filtra curiosos —, o que importa pouco para um produto gratuito onde o objetivo é que o pai veja o filho a resolver uma soma. Para o Math Challenge a regra de “menos campos” aplica‑se com força, mas regista‑se como hipótese a medir, não como facto estabelecido.

### 2. A posição do Nielsen Norman Group sobre onboarding

Esta é a parte incómoda e a mais valiosa. A recomendação principal da NN/g é que o onboarding **se evite**: *“avoid creating app onboarding whenever possible and instead spend your resources making the UI more usable”* [2]. O raciocínio tem três pernas: aumenta o custo de interação, carrega a memória de trabalho, e a investigação mostra que frequentemente **não melhora o desempenho real na tarefa** [2].

A NN/g reconhece exatamente três cenários que justificam ecrãs de onboarding [2]:

1. **Recolher informação indispensável** (o exemplo que dão: criar conta numa app bancária).
2. **Adaptar a experiência** ao contexto ou às preferências do utilizador.
3. **Introduzir fluxos genuinamente novos ou desconhecidos** que se afastam dos padrões habituais.

E uma recomendação de método que vale mais que qualquer padrão: **testar a app sem onboarding primeiro**, para identificar as dificuldades reais dos utilizadores antes de investir em resolvê‑las com ecrãs [2].

### 3. Que formato funciona e qual não

**Carrossel de cartões (“deck-of-cards tutorial”): desaconselhado por nome.** A NN/g assinala que faz a interface *parecer mais complexa do que é* e carrega a memória de trabalho; a sua investigação sobre este formato específico encontrou que **não melhorou o desempenho na tarefa** [2]. É, de longe, o formato mais popular na indústria e o pior sustentado.

**Marcas de guia e sobreposições instrutivas: úteis com condições.** Funcionam quando são **oportunas e discretas**, e quando vão acompanhadas da execução real da tarefa [2]. A NN/g classifica‑as como *“nice‑to‑have”* mais que essenciais [2]. A regra visual concreta: o estilo de uma pista deve deixar **inequivocamente claro que é uma anotação, não um elemento interativo** [2].

**Promoção de funcionalidades ao lançamento: evitar.** Os utilizadores raramente precisam que se lhes repita dentro da app o que já leram na loja. O padrão serve melhor para utilizadores existentes que descobrem funcionalidades novas, e não deve ser usado para insistir com funcionalidades antigas pouco usadas [2].

**Ajuda contextual: o padrão que a NN/g defende.** Prefere a ajuda em contexto sobre a instrução antecipada, com as pistas a aparecerem quando a funcionalidade se torna acionável para o utilizador [2].

### 4. Sobre as cifras de “engagement” que circulam

Várias fontes secundárias da indústria citam cifras chamativas atribuídas à NN/g — por exemplo, que a guia disparada por comportamento teria 68 % mais engagement e 54 % melhor adoção que as alternativas por tempo ou localização. **Essa cifra não se pôde verificar contra uma publicação da NN/g nesta sessão**, e provém de blogs de fornecedores de ferramentas de onboarding, que têm um interesse comercial direto em que o onboarding pareça eficaz. Regista‑se aqui como **não verificada** e não se usa como base de nenhuma decisão. A posição documentada da NN/g aponta, se acaso, em direção contrária: menos onboarding, mais interface utilizável.

### 5. O que é genuinamente inovador no Math Challenge

Aplicando o critério 3 da NN/g — só o que se afasta dos padrões habituais merece explicação — o produto tem exatamente cinco conceitos que um utilizador não pode inferir da interface:

1. **A idade e a dificuldade são eixos separados** (D-002, D-017). Contra‑intuitivo e central; sem isto um pai não entende por que o filho de 7 anos vê um tema de ensino básico mas conteúdo de jardim de infância.
2. **A criança é um perfil, não um utilizador** (D-013). Afasta‑se do modelo mental de “criar uma conta para o meu filho” que trazem de outros produtos.
3. **A localização não é um exame**, e no jardim de infância nem sequer parece (D-002, `mc-44`).
4. **Os clubes e salas não têm chat, e nunca o terão** (D-011, D-027). É uma ausência deliberada, e uma ausência não se explica sozinha.
5. **As vestes não têm perdedor** (D-028). Afasta‑se do que “apostar” significa para quem chega.

Todo o resto — tocar a resposta correta, ver os pontos, mudar de perfil — deve ser explicado por si só ou é um defeito de interface, não um vazio de onboarding.

## Implicações de design

1. **Nenhum registo passa de 3 campos, e nenhum dos nossos necessita de mais de 2.** Email e palavra‑passe para as três portas de entrada (adulto, pai, professor). Todo o resto é configuração posterior.
2. **Registar‑se não é configurar‑se.** O perfil da criança, a faixa etária, o limite de ecrã e a sala pedem‑se *depois* do registo, em passos separados e saltáveis com valores por defeito saudáveis — o intervalo de 5‑7 campos é exatamente onde está o despenhadeiro [5].
3. **Zero carrossel de boas‑vindas**, em nenhuma das cinco entradas. É o formato que a NN/g desaconselha por nome e cuja investigação específica não encontrou melhoria no desempenho [2].
4. **Exatamente cinco marcas contextuais**, uma por cada conceito genuinamente inovador (§5), cada uma disparada no momento em que a sua funcionalidade se torna acionável, não ao abrir a app [2].
5. **Cada marca contextual apresenta‑se como anotação, nunca como controlo.** Estilo visual inequivocamente distinto de qualquer elemento tocável [2].
6. **O adulto chega à sua primeira questão de matemática sem passar por um formulário além do registo.** É a prova de fogo de “testar a app sem onboarding” [2] aplicada ao caso de uso principal.
7. **A verificação do professor ocorre antes de criar uma sala, não antes de registar‑se.** Mover a fricção de identidade para o registo penaliza todos por um requisito que só se aplica a quem vai ter crianças alheias à vista.
8. **Toda marca contextual é descartável permanentemente e não se volta a mostrar.** Reaparecer é a versão de onboarding do padrão de “nagging” que a FTC nomeia explicitamente (`mc-17`).
9. **Instrumentar o funil por passo desde o primeiro dia**, para poder medir a hipótese do §1 nos nossos próprios dados em vez de herdar o benchmark: registo iniciado → registo completo → primeiro perfil criado → primeiro desafio concluído.
10. **No jardim de infância não há onboarding para a criança, de forma alguma.** O primeiro passeio pela Savana *é* a localização (`mc-44`), e a criança não lê — qualquer ecrã explicativo dirigido a ela é, por definição, inútil.

## Questões abertas para o proprietário do projeto

1. O registo do adulto usa palavra‑passe, link mágico ou passkey? O link mágico reduz a **um** campo mas adiciona um salto ao email a meio da ativação.
2. O funil é medido com Web Analytics (sem cookies, amostrado a 10 % após 7 dias) ou é preciso algo com retenção mais longa para poder comparar coortes de registo?
3. As cinco marcas contextuais são autorreferidas por idioma ou são traduzidas? O tom de uma explicação breve é justo onde a tradução literal soa condescendente (`mc-37`).
4. Vale a pena um teste A/B de 2 vs. 3 campos no registo do pai, dado que a evidência externa não é unânime (§1)?

## Fontes

1. HubSpot, análise de formulários de 40.000 clientes (4→3 campos, ~+50% conversão), retransmitido via Venture Harbour, “5 Studies on How Form Length Impacts Conversion Rates” — https://ventureharbour.com/how-form-length-impacts-conversion-rates/
2. Nielsen Norman Group, “Mobile App Onboarding” — https://www.nngroup.com/articles/mobile-app-onboarding/ — fonte primária da posição contra o onboarding, da descoberta sobre tutoriais em baralho de cartas, dos três casos justificados e da regra visual de anotação‑vs‑controlo.
3. Cobloom, “Form Fields and Conversion Rates: Is Less Really More?” — https://www.cobloom.com/blog/form-fields-and-conversion-rates-is-less-really-more — fonte dos contra‑exemplos (queda de 14%, dez campos a superar três).
4. Mailmunch, “How Does Form Length Affect Your Conversion Rate” — https://www.mailmunch.com/blog/form-length-affect-conversion-rate
5. Digital Applied, “Form Conversion Rate Benchmarks 2026: 100+ Data Points” — https://www.digitalapplied.com/blog/form-conversion-rate-benchmarks-2026-data-points — fonte da curva 3/5/7/10+ e da ruptura não linear entre 5 e 7 campos.

**Aviso de método e qualidade das fontes.** Apenas a fonte [2] é investigação primária de uma organização independente de UX. As fontes [1], [3], [4] e [5] são publicações da indústria de marketing e de fornecedores de ferramentas de formulários, com interesse comercial no tema que medem; a cifra da HubSpot é citada de segunda mão porque o estudo original não foi recuperável diretamente nesta sessão. As cifras de conversão do §1 devem tratar‑se como **ordem de grandeza direcional**, não como constantes. A cifra de “68 % mais envolvimento” que circula atribuída à NN/g **não se pôde verificar e não se usa** (§4).
