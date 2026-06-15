-- =============================================================
-- Corrección de horarios (15 jun 2026): Bélgica vs Egipto e
-- Irán vs Nueva Zelanda
--
-- Ambos se juegan en venues de zona Pacífico (PDT, UTC-7), pero
-- la migración 003 los registró usando el horario "ET" del día
-- (3pm/9pm ET) como si fuera hora local del venue, adelantando
-- ambos partidos 3 horas.
--
-- Bélgica vs Egipto: 12:00 PM PDT (Lumen Field, Seattle)
--   = 19:00 UTC = 14:00 Colombia
-- Irán vs Nueva Zelanda: 6:00 PM PDT (SoFi Stadium, Inglewood)
--   = 01:00 UTC (+1 día) = 20:00 Colombia
-- =============================================================

UPDATE matches
SET fecha_hora = '2026-06-15 14:00:00-05:00'
WHERE equipo_local = 'Bélgica'
  AND equipo_visitante = 'Egipto'
  AND fecha_hora = '2026-06-15 17:00:00-05:00';

UPDATE matches
SET fecha_hora = '2026-06-15 20:00:00-05:00'
WHERE equipo_local = 'Irán'
  AND equipo_visitante = 'Nueva Zelanda'
  AND fecha_hora = '2026-06-15 23:00:00-05:00';
