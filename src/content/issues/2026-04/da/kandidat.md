---
readingTimeMinutes: 12
---

For systemer i blandede tilstande — eller når vi er interesserede i delsystemer af sammensatte systemer — er ren-tilstands-formalismen utilstrækkelig. Vi generaliserer til densitetsoperatoren

$$
\rho = \sum_i p_i\,|\psi_i\rangle\langle\psi_i|,\qquad \mathrm{Tr}\,\rho = 1,\ \rho \succeq 0.
$$

En *ren* superposition $|\psi\rangle = \sum_k c_k\,|k\rangle$ svarer til $\rho = |\psi\rangle\langle\psi|$ med $\rho^2 = \rho$, mens $\rho^2 \neq \rho$ karakteriserer en blandet tilstand.

## Koherens og dekohærens

Off-diagonale elementer $\rho_{mn}$ med $m \neq n$ indkoder kvantekohærens. Miljøkobling undertrykker disse eksponentielt,

<details open>
<summary>Vis udledning</summary>

$$
\rho_{mn}(t) = \rho_{mn}(0)\,e^{-t/\tau_{mn}},
$$

Tidskonstanten $\tau_{mn}$ afhænger af koblingsstyrken til miljøet og af tilstandsforskellen $|m-n|$. For makroskopiske superpositioner er $\tau_{mn}$ ekstremt kort, hvilket forklarer hvorfor klassisk verden virker klassisk.

</details>

hvilket effektivt reducerer systemet til en klassisk blanding.

## Superposition i relation til målinger

Ifølge projektionspostulatet sker en ideel projektiv måling i basen $\{|k\rangle\}$ som

$$
\rho \mapsto \sum_k P_k\,\rho\,P_k,\qquad P_k = |k\rangle\langle k|.
$$

Delvise målinger og POVM'er generaliserer dette videre.

## Referencer

- Nielsen & Chuang, *Quantum Computation and Quantum Information*, kapitel 2.
- Breuer & Petruccione, *The Theory of Open Quantum Systems*.
