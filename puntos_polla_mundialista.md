# Esquema de puntos — Polla Mundialista Osorio

## Regla general

Cada participante predice el resultado (victoria local, empate o victoria visitante) de cada partido. Si la predicción es correcta, suma los puntos asignados a esa fase. Si es incorrecta, no suma nada.

**Desempate:** en caso de empate en puntos al final del torneo, gana quien tenga mayor número de predicciones correctas en total.

---

## Tabla de puntos por fase

| Fase | Partidos | Puntos por acierto | Máximo disponible |
|---|---|---|---|
| Fase de grupos | 96 | 3 | 288 |
| 16avos de final | 16 | 5 | 80 |
| 8avos de final | 8 | 7 | 56 |
| Cuartos de final | 4 | 10 | 40 |
| Semifinales | 2 | 15 | 30 |
| Tercer puesto | 1 | 10 | 10 |
| Final | 1 | 25 | 25 |
| **Total** | **128** | — | **529** |

---

## Distribución del puntaje

- **Fase de grupos:** 288 pts disponibles (54% del total)
- **Fases eliminatorias:** 241 pts disponibles (46% del total)

La fase de grupos concentra más de la mitad del puntaje máximo, lo que premia la consistencia a lo largo del torneo y da peso real al desempate por número de aciertos.

---

## Notas de diseño

- El partido por el **tercer puesto** vale menos que las semifinales (10 vs. 15 pts) dado que es el partido de menor relevancia competitiva del torneo y el más difícil de predecir.
- La **final** (25 pts) equivale a ~8 predicciones correctas en grupos — suficiente para generar emoción en la última jornada, pero no tanto como para voltear completamente una ventaja construida con consistencia.
- El crecimiento de puntos entre fases es sub-exponencial, lo que mantiene alineado el incentivo de acertar con el mecanismo de desempate.
