# Esquema de puntos — Polla Mundialista Osorio

## Regla general

Cada participante predice el resultado (victoria local, empate o victoria visitante) de cada partido. Si la predicción es correcta, suma los puntos asignados a esa fase. Si es incorrecta, no suma nada.

**Desempate:** en caso de empate en puntos al final del torneo, gana quien tenga mayor número de predicciones correctas en total.

---

## Tabla de puntos por fase

| Fase | Partidos | Puntos por acierto | Máximo disponible |
|---|---|---|---|
| Fase de grupos | 72 | 3 | 216 |
| 16avos de final | 16 | 5 | 80 |
| 8avos de final | 8 | 8 | 64 |
| Cuartos de final | 4 | 12 | 48 |
| Semifinales | 2 | 18 | 36 |
| Tercer puesto | 1 | 12 | 12 |
| Final | 1 | 30 | 30 |
| **Total** | **104** | — | **486** |

---

## Distribución del puntaje

- **Fase de grupos:** 216 pts disponibles (44% del total)
- **Fases eliminatorias:** 270 pts disponibles (56% del total)

Las eliminatorias pesan más que la fase de grupos, reflejando que acertar un resultado se vuelve más difícil a medida que avanza el torneo: los equipos son más parejos en nivel, hay menos margen de error, y factores como penales, tiempo extra y bajas por suspensión aumentan la incertidumbre.

---

## Notas de diseño

- El **partido por el tercer puesto** vale menos que las semifinales (12 vs. 18 pts), ya que su resultado suele ser más impredecible por rotación de jugadores y baja motivación, pero conserva un valor cercano a 8avos por la dificultad inherente de cualquier eliminatorio.
- La **final** (30 pts) equivale a 10 predicciones correctas en grupos — el mayor salto de todo el esquema, reflejando que es el partido más difícil de predecir y el de mayor expectativa del torneo.
- El crecimiento entre fases es más pronunciado que en un esquema lineal, premiando la dificultad creciente de acertar conforme el nivel de los equipos se equipara en las rondas eliminatorias.
