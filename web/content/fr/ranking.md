## Comment ce site classe les modèles

Le classement transforme les décomptes publiés en intervalles et en paliers. Rien ici ne modifie un score : on indique seulement le degré de certitude du classement.

Chaque question vaut $x \in \{1 ; 0{,}5 ; 0\}$. Pour une case de $n$ questions, avec $c$ réponses justes et $p$ partielles, la moyenne de la case et sa variance sont :

$$
m = \frac{c + 0{,}5\,p}{n}, \qquad \operatorname{Var}(m) = \frac{1}{n}\left(\frac{c + 0{,}25\,p}{n} - m^2\right)
$$

Les six cases de sens sont des échantillons indépendants ; le score TifinaghBench et son erreur type sont donc :

$$
\text{TB} = \frac{100}{6}\sum_{k=1}^{6} m_k, \qquad \text{ET} = \frac{100}{6}\sqrt{\sum_{k=1}^{6}\operatorname{Var}(m_k)}
$$

Le classement affiche $\text{TB} \pm 1{,}96\,\text{ET}$, l'intervalle à 95 %. Le score d'écriture applique la même formule aux trois cases de translittération.

- **Égalités.** Deux essais sont à égalité statistique lorsque $|\text{TB}_a - \text{TB}_b| < 1{,}96\sqrt{\text{ET}_a^2 + \text{ET}_b^2}$.
- **Paliers.** Les essais sont triés par score. Un nouveau palier commence au premier essai qui n'est pas à égalité avec le meneur du palier en cours, et tous les essais d'un palier partagent son meilleur rang. Une frise peinte sépare les paliers.
- **Autres protocoles.** Les essais menés avec un autre juge, une autre taille d'échantillon, graine, taille de lot, d'autres dialectes ou tâches sont affichés avec leurs différences, mais jamais classés.
- **Orthographe stricte.** Les scores stricts sont affichés sans intervalles ni paliers, car les exports ne les donnent qu'en total.
