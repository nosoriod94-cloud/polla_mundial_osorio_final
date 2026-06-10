-- =============================================================
-- Reforzar el bloqueo de predicciones a nivel de base de datos
-- (1 minuto antes del inicio del partido), para que no pueda
-- evitarse aunque alguien llame a la API directamente.
-- =============================================================

DROP POLICY IF EXISTS "predictions_insert_anon" ON predictions;
DROP POLICY IF EXISTS "predictions_update_anon" ON predictions;

CREATE POLICY "predictions_insert_anon"
  ON predictions FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM participants p
      WHERE p.id = participant_id AND p.status = 'approved'
    )
    AND EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = match_id AND m.fecha_hora > now() + interval '1 minute'
    )
  );

CREATE POLICY "predictions_update_anon"
  ON predictions FOR UPDATE
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM participants p
      WHERE p.id = participant_id AND p.status = 'approved'
    )
    AND EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = match_id AND m.fecha_hora > now() + interval '1 minute'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM participants p
      WHERE p.id = participant_id AND p.status = 'approved'
    )
    AND EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = match_id AND m.fecha_hora > now() + interval '1 minute'
    )
  );
