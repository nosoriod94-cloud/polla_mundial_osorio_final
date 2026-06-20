-- =============================================================
-- Actualización de puntos de la fase eliminatoria
--
-- El esquema de puntos cambió (ver puntos_polla_mundialista.md).
-- Si ya ejecutaste la migración 006 original, corre esta para
-- actualizar los puntos_acierto a los nuevos valores. Si NO
-- habías corrido la 006 todavía, puedes ignorar esta migración
-- y simplemente correr la 006 actualizada (ya tiene los valores
-- correctos).
-- =============================================================

UPDATE jornadas SET puntos_acierto = 5 WHERE nombre = '16avos de Final';
UPDATE jornadas SET puntos_acierto = 8 WHERE nombre = '8avos de Final';
UPDATE jornadas SET puntos_acierto = 12 WHERE nombre = 'Cuartos de Final';
UPDATE jornadas SET puntos_acierto = 18 WHERE nombre = 'Semifinales';
UPDATE jornadas SET puntos_acierto = 12 WHERE nombre = 'Tercer Puesto';
UPDATE jornadas SET puntos_acierto = 30 WHERE nombre = 'Final';
