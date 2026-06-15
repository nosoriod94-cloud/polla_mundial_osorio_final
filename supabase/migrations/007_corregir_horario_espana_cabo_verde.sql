-- =============================================================
-- Corrección de horario: España vs Cabo Verde (15 jun 2026)
-- Kickoff real: 12:00 PM ET (16:00 UTC) = 11:00 hora Colombia
-- La migración 003 lo registró erróneamente a las 12:00 Colombia.
-- =============================================================

UPDATE matches
SET fecha_hora = '2026-06-15 11:00:00-05:00'
WHERE equipo_local = 'España'
  AND equipo_visitante = 'Cabo Verde'
  AND fecha_hora = '2026-06-15 12:00:00-05:00';
