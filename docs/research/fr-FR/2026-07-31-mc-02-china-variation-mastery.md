# L'enseignement des mathématiques en Chine : théorie de la variation, maîtrise (mastery) et les preuves derrière la réputation

> Recherche Math Challenge — 2026-07-31 — sujet 02

## Résumé exécutif (FR)

- L'« enseignement avec variation » (bianshi jiaoxue, 变式教学), développé par Gu Lingyuan dans le district de Qingpu, à Shanghai (depuis les années 80), distingue la **variation conceptuelle** (mettre en contraste des exemples/contre-exemples pour révéler les traits essentiels) et la **variation procédurale** (des séquences où l'on change un élément à la fois, en gardant le reste invariant) [1][2][7].
- Les « deux fondamentaux » (connaissances + compétences de base) constituent le principe curriculaire chinois depuis les années 60 (influence soviétique) ; ils expliquent l'accent mis sur le calcul rapide et précis [3].
- Depuis 2022, le curriculum officiel a évolué vers les « quatre fondamentaux » (+ idées et expérience de l'activité mathématique) et six compétences clés, incluant des exigences formelles de « formulation de problèmes » (problem-posing) par tranches de niveau [4][9].
- Le modèle de « maîtrise » (mastery) de Shanghai a été exporté vers l'Angleterre via le NCETM/Maths Hubs à partir de 2014 ; le gouvernement anglais a investi 76 millions de livres sterling dans « Teaching for Mastery » [5][8].
- L'évaluation officielle (Sheffield Hallam/DfE, 2019) a constaté des **effets positifs en Key Stage 1** mais **aucune preuve quantifiable en Key Stage 2**, et aucun changement dans l'attitude des élèves — un tableau plus nuancé que le récit « nous avons importé la méthode chinoise et ça a marché » [6][8].
- Liping Ma a forgé l'expression « compréhension profonde des mathématiques fondamentales » (Profound Understanding of Fundamental Mathematics, PUFM) : les enseignants chinois organisent leurs connaissances en « paquets » connectés ; 77 % des enseignants américains étudiés n'avaient qu'une compréhension procédurale de la soustraction avec regroupement [10].
- Shanghai a été n° 1 mondial à PISA 2009/2012, mais ne représente que 1,7 % de la population chinoise, avec un PIB par habitant plus de deux fois supérieur à la moyenne nationale — l'échantillon n'est pas représentatif de la Chine [11].
- L'« éducation de l'ombre » (le tutorat privé) est massive en Asie de l'Est ; son effet causal sur la performance reste **non concluant** dans la littérature, et son coût pose un problème d'inégalité [12][13].
- Hong Kong utilise un curriculum en spirale (nombres, algèbre, mesures, forme/espace, données) mais a été critiqué pour sa densité et son recours au drill intensif en fin de primaire [14].
- BNU et ECNU sont les deux centres de recherche en éducation mathématique les plus influents de Chine, avec des bases nationales en matière de manuels scolaires et de formation des enseignants [15][16].

## Executive summary (EN)

Chinese mathematics education's reputation rests on a documented pedagogy — teaching with variation — layered on the "two/four basics" curricular philosophy and reinforced by teacher-research-group collaboration. The most exportable mechanism for a digital product is **procedural and conceptual variation**: instead of random practice items, Chinese teachers/textbooks design deliberate *sequences* where one problem element changes while others stay constant, so students discern structure rather than pattern-match. England's Shanghai teacher exchange produced a genuinely mixed transfer result — gains at Key Stage 1, none at Key Stage 2 — a useful corrective against assuming the pedagogy transfers automatically. Liping Ma's PUFM research explains *why* variation works: teachers need "knowledge packages" connecting each skill backward and forward through the curriculum, not isolated procedures. China's PISA dominance is a contested data point (Shanghai is not representative of China), and shadow education confounds any simple "curriculum causes performance" story. The single highest-leverage change for Math Challenge: replace randomized item generation with **systematic variation sequences** per learning objective.

## Constats

### 1. L'enseignement avec variation — Gu Lingyuan et l'expérience de Qingpu

L'enseignement avec variation (bianshi jiaoxue) est né d'un projet de réforme commandé par le bureau de l'éducation du district de Qingpu, à Shanghai, au début des années 1980, dirigé par Gu Lingyuan [1][7]. Gu, Huang et Marton (2004) en ont formalisé deux catégories [2][7] :

- **La variation conceptuelle** — de multiples exemples variés ainsi que des non-exemples/contre-exemples soigneusement choisis, afin que les élèves perçoivent sous plusieurs angles les traits définitoires invariants d'un concept.
- **La variation procédurale** — une séquence de problèmes où un trait de surface change à la fois tandis que la structure sous-jacente reste constante, afin que les élèves généralisent la méthode au lieu de mémoriser un seul exemple résolu.

Un cadre opérationnel désigne cela par « un problème, plusieurs changements » (yiti duobian) et « un problème, plusieurs solutions » (yiti duojie), avec des sous-types décrits ailleurs comme variation inductive, d'élargissement, d'approfondissement et d'application [7]. L'*ensemble* d'exercices, et non l'item isolé, est l'unité de conception — chaque problème est une perturbation contrôlée du précédent. La cohérence des cours dans les salles de classe chinoises a été explicitement reliée à cette conception délibérée [7].

*Signalement : deux PDF sources (un article d'ATM* Mathematics Teaching *et un article de Lai & Murray hébergé par le CIMT) n'ont renvoyé via WebFetch que des données binaires/métadonnées, sans texte lisible. Leur pertinence thématique est confirmée par des extraits de recherche, mais les affirmations spécifiques qui en proviendraient au-delà de ce qui est énoncé ici ne sont pas vérifiées.*

### 2. Les « deux fondamentaux » et l'évolution vers les « quatre fondamentaux »

Les « deux fondamentaux » (connaissances de base + compétences de base) sont le principe curriculaire explicite de la Chine depuis le début des années 1960 (sous influence soviétique), à l'origine d'un fort accent mis sur la fluidité de calcul — par exemple, les élèves du primaire sont censés résoudre environ 10 problèmes d'addition/soustraction dans les limites de 100 par minute [3]. Les standards chinois de 2022 pour l'enseignement obligatoire ont officialisé un basculement vers les **« quatre fondamentaux »** (connaissances, compétences, idées mathématiques, expérience de l'activité) plus six compétences clés (abstraction, raisonnement logique, modélisation, imagination intuitive, opération, analyse de données), et ont ajouté des exigences par tranche de niveau pour la capacité de *formulation de problèmes* (niveaux 1-3, 4-6, 7-9) [4][9].

### 3. L'enseignement de la maîtrise (mastery) de Shanghai et son exportation vers l'Angleterre

L'approche de Shanghai repose sur des enseignants spécialistes experts de leur matière, des manuels informés par la recherche, et des réunions hebdomadaires de « groupe de recherche d'enseignants » (teacher research group, TRG) pour l'affinement collectif des cours [5]. Le NCETM a mené un China–England Mathematics Teacher Exchange (2014-2019) et a formé des spécialistes de la maîtrise dans 37 Maths Hubs, en finançant des manuels « mastery » accrédités [5]. Le modèle de maîtrise du NCETM invoque la « variation » pour la « pratique intelligente » parmi ses grandes idées nommées (liste complète et faisant autorité non entièrement récupérée durant cette session — à vérifier sur ncetm.org.uk avant tout usage externe) [6].

Une évaluation de la Sheffield Hallam University pour le DfE (janvier 2019) a constaté [6][8] :

- Des **effets positifs au Key Stage 1** dans les écoles les plus impliquées.
- **Aucune preuve quantifiable** de gains de réussite au Key Stage 2.
- Les enseignants ont perçu un bénéfice aux deux stades, mais les attitudes des élèves (anxiété, préférence pour l'indépendance, engagement) n'ont montré **aucun changement significatif**.
- La mise en œuvre a été inégale — toutes les écoles n'ont pas réellement adopté la pédagogie mastery.
- Le coût du programme, 76 millions de livres sterling, a conduit les chercheurs à demander un examen du rapport coût-bénéfice ; plus de 20 % des enseignants participant à l'échange estimaient que le temps passé à observer des cours « vitrines » soigneusement préparés aurait été mieux utilisé sur des cours ordinaires.

La réputation de cette pédagogie dépasse la preuve causale de sa transférabilité telle qu'elle a été mise en œuvre.

### 4. Beijing Normal University et East China Normal University

Les mathématiques à la BNU constituent une discipline clé nationale de premier rang, hébergeant une base nationale de recherche pour la construction des manuels scolaires (le groupe de Yiming Cao étudie l'interaction en classe) [15]. L'ECNU (Shanghai), première université « normale » d'après 1949, dispose d'une influente School of Mathematical Sciences formant des enseignants professionnels de mathématiques et pilotant la réforme de la formation des enseignants [16] — notamment co-implantée avec le système de Shanghai où le travail de théorie de la variation de Gu a vu le jour.

### 5. Liping Ma et la « compréhension profonde des mathématiques fondamentales »

L'ouvrage *Knowing and Teaching Elementary Mathematics* de Ma définit la PUFM comme « profonde, vaste et rigoureuse » (deep, vast, and thorough) : la compréhension profonde relie un sujet à des idées d'un pouvoir conceptuel supérieur ; la compréhension vaste/large le relie à des idées de pouvoir similaire ; la rigueur tisse la matière en un tout cohérent [10]. Au centre se trouve le **« paquet de connaissances »** (knowledge package) — un enseignant détient une carte structurée des prérequis et des prolongements d'un cours, pas seulement la procédure isolée [10]. Son contraste empirique sur la soustraction avec regroupement : 77 % des enseignants américains étudiés s'appuyaient sur une règle d'« emprunt » apprise par cœur, avec seulement une compréhension procédurale, tandis que les enseignants chinois ancraient plus souvent l'algorithme dans la décomposition des unités de valeur de position et maîtrisaient couramment des méthodes de regroupement non standards [10].

### 6. Ce que montrent réellement les preuves PISA/TIMSS — et leurs limites

Le classement n° 1 de Shanghai à PISA (2009, répété en 2012) ancre les affirmations du type « la Chine est n° 1 », mais il est fortement contesté (Loveless, Brookings, 2013) [11] : la Chine en tant que nation n'a jamais passé PISA — seule Shanghai (puis plus tard quelques autres provinces) y a participé, sélectionnée de façon non aléatoire par le gouvernement chinois ; Shanghai représente environ 1,7 % de la population chinoise, avec un PIB par habitant plus de deux fois supérieur à la moyenne nationale et un taux d'entrée à l'université d'environ 84 % contre environ 24 % au niveau national ; environ deux tiers des enfants chinois vivent en zone rurale, avec un taux de scolarisation au lycée pouvant descendre jusqu'à 40 %, de sorte que les élèves les moins performants exclus sont structurellement absents de l'échantillon. Conclusion de Loveless : les scores de Shanghai ne représentent pas la performance « de la Chine » tant que la Chine ne participe pas en tant que nation selon les règles standards [11]. TIMSS montre une performance constamment forte à travers plusieurs juridictions d'Asie de l'Est (Hong Kong, Taipei chinois, Singapour), un constat *régional* plus robuste que le résultat PISA d'une seule ville, Shanghai [11].

L'**éducation de l'ombre** (le tutorat privé) est l'autre facteur de confusion majeur — répandue dans toute l'Asie de l'Est (les familles de Shanghai dépenseraient environ 6 000 yuans/an en tutorat, montant à environ 30 000 yuans/an au lycée) [12][13]. Son effet causal sur la réussite est décrit dans la littérature comme **non concluant** : certains échantillons transnationaux montrent une association négative (plausiblement une causalité inverse, puisque les élèves faibles recherchent du tutorat), tandis qu'une étude centrée sur Pékin a trouvé une corrélation positive pour les élèves de 8e année [12][13]. La plupart des pays de TIMSS étudiés utilisent l'éducation de l'ombre principalement pour le rattrapage, non pour l'enrichissement [12]. Tout récit du type « le curriculum X cause de hauts scores » est confondu par l'ampleur du tutorat.

### 7. Le séquençage du curriculum de Hong Kong pour l'arithmétique

Le curriculum de l'EDB de Hong Kong utilise explicitement une **« approche en spirale »**, revisitant les sujets à un niveau de sophistication croissant tout au long de la scolarité, organisée en cinq axes : nombres, algèbre, mesures, forme et espace, traitement des données [14]. Les enseignants peuvent réordonner la séquence recommandée selon les besoins de leurs élèves. Critique documentée : le curriculum du primaire est trop dense, les mathématiques de fin de primaire s'apprennent en grande partie par un entraînement intensif (drilling), et il existe un chevauchement de contenu entre le préscolaire et la première année du primaire [14] — un avertissement selon lequel les curriculums en spirale/orientés maîtrise ne sont pas automatiquement exempts de drill.

## Implications pour la conception de Math Challenge

1. **Remplacer la génération aléatoire d'items par des séquences de variation par objectif d'apprentissage** : un ensemble ordonné où exactement un paramètre de surface change entre items consécutifs, opérationnalisant la variation procédurale (yiti duobian) [1][2][7].
2. **Intégrer des paires de variation conceptuelle dans les exercices d'introduction de concept** : un exemple correct plus un contre-exemple proche mais erroné, en demandant aux apprenants d'identifier les traits définitoires invariants, programmés avant les exercices procéduraux [1][7].
3. **Modéliser chaque compétence comme un « paquet de connaissances »** dans le graphe de contenu — avec des liens explicites en amont (prérequis) et en aval (compétences dépendantes) — afin que l'explication du tuteur IA puisse faire référence à ce à quoi un défi se rattache [10].
4. **Faire de l'ensemble d'exercices, et non de l'item, l'unité atomique de conception**, avec un type de variation déclaré (élargissement/approfondissement/application) par ensemble [7].
5. **Ajouter « un problème, plusieurs solutions » (yiti duojie) comme type d'exercice à part entière** dans les tranches de niveau supérieures, en comparant les parcours de solution en termes d'efficacité/de généralité [7].
6. **Ne pas survendre la « pédagogie mastery chinoise » comme une promesse de résultats garantis** dans le marketing — l'évaluation DfE/Sheffield Hallam n'a trouvé aucun gain mesurable au KS2 malgré une mise en œuvre bien financée [6][8] ; dire « inspiré par », non « prouvé par ».
7. **Suivre séparément, dans les analyses, l'entraînement à la fluidité et les exercices conceptuels/de formulation de problèmes**, reflétant le basculement des deux aux quatre fondamentaux — un signal également utile pour l'anti-triche (fluidité rapide seule vs raisonnement authentique) [3][4][9].
8. **Ajouter un type d'exercice de formulation de problèmes** aux tranches de niveau appropriées (correspondant au découpage chinois 1-3/4-6/7-9) : les apprenants inventent un problème répondant à des contraintes données, pas seulement en résolvent un [9].
9. **Traiter l'affinement de type « groupe de recherche d'enseignants » comme une métaphore d'assurance qualité** : réviser périodiquement les modèles d'ensembles d'exercices au regard des schémas d'erreurs agrégés des apprenants, assisté par IA plutôt que par de véritables TRG humains [5].
10. **Utiliser pour l'arithmétique une carte de curriculum en spirale, et non strictement linéaire/à verrous**, en revisitant les sujets de sens du nombre à une profondeur croissante, tout en évitant explicitement, aux points de transition, le mode d'échec par densité de drill documenté à Hong Kong même [14].
11. **Construire des détecteurs anti-triche informés par le facteur de confusion de l'éducation de l'ombre** : sonder périodiquement les items de variation conceptuelle/formulation de problèmes (plus difficiles à préparer par un entraînement mécanique) par rapport aux scores de pure fluidité procédurale que le tutorat externe pourrait gonfler [12][13].
12. **Signaler en interne la critique de représentativité PISA-Shanghai** : ne jamais affirmer ni laisser entendre une « moyenne nationale chinoise » quand une source citée ne concerne que Shanghai [11].

## Questions ouvertes pour le porteur du projet

1. Chaque modèle d'exercice doit-il déclarer un type de variation explicite (conceptuelle/procédurale, élargissement/approfondissement/application) comme métadonnée obligatoire au moment de la révision ?
2. L'explication du tuteur IA après le défi doit-elle toujours énoncer les liens de « paquet de connaissances », ou seulement à certaines tranches de niveau ?
3. Étant donné le résultat nul du DfE au KS2, voulons-nous un langage marketing faisant référence à « mastery » ou à la « méthode de Shanghai », ou est-il plus prudent de décrire le mécanisme sans association géographique/de marque ?
4. Les exercices de formulation de problèmes doivent-ils être notés/porteurs de points dès le lancement, ou introduits plus tard étant donné la difficulté accrue de la correction automatique ?
5. Voulons-nous un mode diagnostique dédié « résistant au tutorat de l'ombre », mêlant des items de variation conceptuelle et de formulation de problèmes, étant donné que l'anti-triche est un objectif produit déclaré ?

## Sources

1. [Theory and Development of Teaching Through Variation in Mathematics in China](https://www.researchgate.net/publication/313409813_Theory_and_Development_of_Teaching_Through_Variation_in_Mathematics_in_China) — chapitre ResearchGate/Springer, s.d.
2. [Teaching with variation: An effective way of mathematics teaching in China](https://www.researchgate.net/publication/291569306_Teaching_with_variation_An_effective_way_of_mathematics_teaching_in_China) — Gu, Huang & Marton, 2004
3. [The "Two Basics": Mathematics Teaching and Learning in Mainland China](https://www.researchgate.net/publication/313749719_The_Two_Basics_Mathematics_Teaching_and_Learning_in_Mainland_China) — ResearchGate, s.d.
4. [From "Two Basics" to "Four Basics" in Chinese Mathematics Curriculum Standards](https://www.researchgate.net/publication/321649079_From_Two_Basics_to_Four_Basics_in_Chinese_Mathematics_Curriculum_Standards_Development_Reflection_and_Prospects) — ResearchGate, s.d.
5. [Background to the Maths Hubs Programme — NCETM](https://www.ncetm.org.uk/maths-hubs/about-maths-hubs/background-to-the-maths-hubs-programme/) — NCETM, consulté en 2026
6. [Teaching mathematics for mastery at secondary school — NCETM](https://www.ncetm.org.uk/features/teaching-mathematics-for-mastery-at-secondary-school/) — NCETM, consulté en 2026
7. ["Variation problems" and their roles in the topic of fraction division in Chinese mathematics textbook examples](https://link.springer.com/article/10.1007/s10649-010-9263-4) — *Educational Studies in Mathematics*, Springer, 2010
8. [Evaluation of Shanghai Maths Teacher Exchange — main report](https://assets.publishing.service.gov.uk/media/5c49b38340f0b61717193d2d/MTE_main_report.pdf) — Sheffield Hallam University pour le DfE britannique, 25 janv. 2019 ; résumé dans [Schools Week](https://schoolsweek.co.uk/shanghai-maths-teacher-exchange-failed-to-boost-ks2-outcomes-dfe-report-finds/), 2019
9. [Mathematical problem posing in Chinese Curriculum Standards](https://journals.sagepub.com/doi/10.1177/27527263251340993) — Jinfa Cai, Tao Wang, Shengying Xie, 2025 (SAGE)
10. [Liping Ma: Knowing and Teaching Elementary Mathematics](https://www.math.utoronto.ca/barbeau/ma.pdf) — Liping Ma, 1999 (Routledge/Lawrence Erlbaum)
11. [PISA's China Problem](https://www.brookings.edu/articles/pisas-china-problem/) — Tom Loveless, Brookings Institution, 9 oct. 2013
12. [The impact of shadow education on student academic achievement: Why the research is inconclusive](https://link.springer.com/article/10.1007/s12564-014-9326-9) — *Asia Pacific Education Review*, Springer, 2014
13. [Illuminating the shadows: the role of private supplementary tutoring on student math performance in PISA 2022](https://largescaleassessmentsineducation.springeropen.com/articles/10.1186/s40536-024-00228-5) — *Large-scale Assessments in Education*, 2024
14. [Mathematics Education — Curriculum Documents, Education Bureau (Hong Kong)](https://www.edb.gov.hk/en/curriculum-development/kla/ma/curr/index2.html) — Hong Kong EDB, consulté en 2026
15. [Investigation of mathematics teaching and learning in China](https://researchfeatures.com/investigation-of-mathematics-teaching-and-learning-in-china/) — Research Features, sur Yiming Cao (BNU)
16. [School of Mathematical Sciences, East China Normal University](https://math.ecnu.edu.cn/en/) — site officiel de l'ECNU, consulté en 2026

**Non vérifié / signalé :** l'article d'ATM *Mathematics Teaching* n° 289 et l'article de Lai & Murray hébergé par le CIMT n'ont pas pu être extraits en texte (données binaires/métadonnées uniquement) ; leur pertinence n'est confirmée que par des extraits de recherche. La liste complète des « cinq grandes idées » du NCETM est énoncée à partir de connaissances générales, et non d'une source primaire entièrement récupérée durant cette session — à vérifier sur ncetm.org.uk avant toute citation externe.
