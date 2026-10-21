## How this site ranks models

The leaderboard turns the published counts into intervals and tiers. Nothing here changes a score; it only says how sure the ranking is.

Each question scores $x \in \{1, 0.5, 0\}$. For a cell with $n$ questions, $c$ correct and $p$ partial answers, the cell mean and its variance are:

$$
m = \frac{c + 0.5\,p}{n}, \qquad \operatorname{Var}(m) = \frac{1}{n}\left(\frac{c + 0.25\,p}{n} - m^2\right)
$$

The six meaning cells are independent samples, so the TifinaghBench score and its standard error are:

$$
\text{TB} = \frac{100}{6}\sum_{k=1}^{6} m_k, \qquad \text{SE} = \frac{100}{6}\sqrt{\sum_{k=1}^{6}\operatorname{Var}(m_k)}
$$

The leaderboard shows $\text{TB} \pm 1.96\,\text{SE}$, the 95% interval. The script score uses the same formula over the three transliteration cells.

- **Ties.** Two runs are a statistical tie when $|\text{TB}_a - \text{TB}_b| < 1.96\sqrt{\text{SE}_a^2 + \text{SE}_b^2}$.
- **Tiers.** Runs are sorted by score. A new tier starts at the first run that is not tied with the leader of the current tier, and every run in a tier shares the tier's best rank. A painted band separates tiers.
- **Other setups.** Runs with a different judge, sample size, seed, batch size, dialects or tasks are listed with what differs, but never ranked.
- **Strict spelling.** Strict scores are shown without intervals and tiers, because the exports report them as totals only.
