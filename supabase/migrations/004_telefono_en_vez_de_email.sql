-- =============================================================
-- Reemplazar correo electrónico por teléfono (10 dígitos)
-- como identificador del participante
-- =============================================================

-- Eliminar participantes existentes (cascada: predicciones y standings_cache)
DELETE FROM participants;

-- participants: email -> telefono
ALTER TABLE participants DROP COLUMN email;
ALTER TABLE participants ADD COLUMN telefono text UNIQUE NOT NULL
  CHECK (telefono ~ '^[0-9]{10}$');

-- standings_cache: email -> telefono
ALTER TABLE standings_cache DROP COLUMN email;
ALTER TABLE standings_cache ADD COLUMN telefono text NOT NULL;

-- Recrear triggers usando telefono en vez de email
CREATE OR REPLACE FUNCTION refresh_standings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_jornada_id uuid;
  v_puntos_acierto int;
BEGIN
  -- Obtener la jornada y sus puntos
  SELECT m.jornada_id, j.puntos_acierto
    INTO v_jornada_id, v_puntos_acierto
  FROM matches m
  JOIN jornadas j ON j.id = m.jornada_id
  WHERE m.id = NEW.id;

  -- Recalcular standings para todos los participantes
  INSERT INTO standings_cache (participant_id, nombre, telefono, puntos_totales, aciertos, total_predicciones, updated_at)
  SELECT
    p.id,
    p.nombre,
    p.telefono,
    COALESCE(SUM(
      CASE WHEN pr.prediccion = m.resultado
        THEN j.puntos_acierto
        ELSE 0
      END
    ), 0) AS puntos_totales,
    COALESCE(SUM(
      CASE WHEN pr.prediccion = m.resultado THEN 1 ELSE 0 END
    ), 0) AS aciertos,
    COUNT(pr.id) AS total_predicciones,
    now()
  FROM participants p
  LEFT JOIN predictions pr ON pr.participant_id = p.id
  LEFT JOIN matches m ON m.id = pr.match_id AND m.resultado IS NOT NULL
  LEFT JOIN jornadas j ON j.id = m.jornada_id
  WHERE p.status = 'approved'
  GROUP BY p.id, p.nombre, p.telefono
  ON CONFLICT (participant_id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    telefono = EXCLUDED.telefono,
    puntos_totales = EXCLUDED.puntos_totales,
    aciertos = EXCLUDED.aciertos,
    total_predicciones = EXCLUDED.total_predicciones,
    updated_at = now();

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION init_participant_standings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    INSERT INTO standings_cache (participant_id, nombre, telefono, puntos_totales, aciertos, total_predicciones, updated_at)
    VALUES (NEW.id, NEW.nombre, NEW.telefono, 0, 0, 0, now())
    ON CONFLICT (participant_id) DO UPDATE SET
      nombre = EXCLUDED.nombre,
      telefono = EXCLUDED.telefono,
      updated_at = now();
  END IF;
  RETURN NEW;
END;
$$;
