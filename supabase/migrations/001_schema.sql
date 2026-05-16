-- =============================================================
-- Polla Mundial Osorio Final — Schema inicial
-- =============================================================

-- Participantes (sin Supabase Auth — solo email como identificador)
CREATE TABLE participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  email text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  registered_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz
);

-- Jornadas (Fase de Grupos, Octavos, etc.)
CREATE TABLE jornadas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  orden int NOT NULL,
  puntos_acierto int NOT NULL DEFAULT 3,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Partidos
CREATE TABLE matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jornada_id uuid NOT NULL REFERENCES jornadas(id) ON DELETE CASCADE,
  equipo_local text NOT NULL,
  equipo_visitante text NOT NULL,
  fecha_hora timestamptz NOT NULL,
  resultado text CHECK (resultado IN ('local', 'empate', 'visitante'))
    -- NULL hasta que admin ingresa el resultado
);

-- Predicciones
CREATE TABLE predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  prediccion text NOT NULL CHECK (prediccion IN ('local', 'empate', 'visitante')),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (participant_id, match_id)
);

-- Tabla de posiciones (cache, actualizado por trigger)
CREATE TABLE standings_cache (
  participant_id uuid PRIMARY KEY REFERENCES participants(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  email text NOT NULL,
  puntos_totales int NOT NULL DEFAULT 0,
  aciertos int NOT NULL DEFAULT 0,
  total_predicciones int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Admins (FK a auth.users de Supabase — se insertan manualmente)
CREATE TABLE admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);

-- =============================================================
-- Row Level Security
-- =============================================================

ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE jornadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE standings_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Helper: verifica si el usuario actual es admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = auth.uid()
  );
$$;

-- participants: anon puede INSERT (registro) y SELECT su propio row por email
CREATE POLICY "participants_insert_anon"
  ON participants FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "participants_select_own"
  ON participants FOR SELECT
  TO anon
  USING (true);  -- permitimos lectura por email via frontend lookup

CREATE POLICY "participants_admin_all"
  ON participants FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- jornadas: lectura pública, escritura solo admin
CREATE POLICY "jornadas_select_public"
  ON jornadas FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "jornadas_admin_write"
  ON jornadas FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- matches: lectura pública, escritura solo admin
CREATE POLICY "matches_select_public"
  ON matches FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "matches_admin_write"
  ON matches FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- predictions: anon puede INSERT/UPDATE, admin puede SELECT ALL
CREATE POLICY "predictions_insert_anon"
  ON predictions FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM participants p
      WHERE p.id = participant_id AND p.status = 'approved'
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
  );

CREATE POLICY "predictions_select_anon"
  ON predictions FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "predictions_admin_all"
  ON predictions FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- standings_cache: SELECT público
CREATE POLICY "standings_select_public"
  ON standings_cache FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "standings_admin_write"
  ON standings_cache FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- admin_users: solo admins pueden verse a sí mismos
CREATE POLICY "admin_users_select"
  ON admin_users FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Habilitar Realtime en standings_cache
ALTER PUBLICATION supabase_realtime ADD TABLE standings_cache;
ALTER PUBLICATION supabase_realtime ADD TABLE predictions;
