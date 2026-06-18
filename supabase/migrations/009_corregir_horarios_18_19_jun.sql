-- =============================================================
-- Corrección de horarios: partidos 18 y 19 jun 2026
--
-- Tres partidos fueron registrados con horas incorrectas.
-- Fuentes verificadas: worldcupwiki.com, Yahoo Sports, Sky Sports.
-- Fórmula correcta: Colombia (UTC-5) = ET (EDT, UTC-4) - 1 hora
--
-- México vs Corea del Sur (18 jun, Estadio Akron, Zapopan):
--   9pm ET → 20:00 Colombia (DB tenía 22:00 — error de 2 horas)
--
-- Brasil vs Haití (19 jun, Lincoln Financial Field, Philadelphia):
--   8:30pm ET → 19:30 Colombia (DB tenía 20:00 — error de 30 min)
--
-- Turquía vs Paraguay (19 jun, Levi's Stadium, Santa Clara):
--   11pm ET → 22:00 Colombia (DB tenía 23:00 — error de 1 hora)
-- =============================================================

UPDATE matches
SET fecha_hora = '2026-06-18 20:00:00-05:00'
WHERE equipo_local = 'México'
  AND equipo_visitante = 'Corea del Sur'
  AND fecha_hora = '2026-06-18 22:00:00-05:00';

UPDATE matches
SET fecha_hora = '2026-06-19 19:30:00-05:00'
WHERE equipo_local = 'Brasil'
  AND equipo_visitante = 'Haití'
  AND fecha_hora = '2026-06-19 20:00:00-05:00';

UPDATE matches
SET fecha_hora = '2026-06-19 22:00:00-05:00'
WHERE equipo_local = 'Turquía'
  AND equipo_visitante = 'Paraguay'
  AND fecha_hora = '2026-06-19 23:00:00-05:00';
