-- Enable Row Level Security on all user-owned tables
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_exercises ENABLE ROW LEVEL SECURITY;

-- Workout sessions: users can only access their own
CREATE POLICY "Users own their workout sessions"
  ON workout_sessions FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- User profiles: users can only access their own
CREATE POLICY "Users own their profiles"
  ON user_profiles FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- User badges: users can only access their own
CREATE POLICY "Users own their badges"
  ON user_badges FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Personal records: users can only access their own
CREATE POLICY "Users own their personal records"
  ON personal_records FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- User goals: users can only access their own
CREATE POLICY "Users own their goals"
  ON user_goals FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Workout templates: users can only access their own
CREATE POLICY "Users own their workout templates"
  ON workout_templates FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Workout exercises: accessible if user owns the parent workout session
CREATE POLICY "Users access their workout exercises"
  ON workout_exercises FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions ws
      WHERE ws.id = workout_exercises.workout_session_id
        AND ws.user_id = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_sessions ws
      WHERE ws.id = workout_exercises.workout_session_id
        AND ws.user_id = auth.uid()::text
    )
  );

-- Exercise sets: accessible if user owns the parent workout exercise -> session
CREATE POLICY "Users access their exercise sets"
  ON exercise_sets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM workout_exercises we
      JOIN workout_sessions ws ON ws.id = we.workout_session_id
      WHERE we.id = exercise_sets.workout_exercise_id
        AND ws.user_id = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_exercises we
      JOIN workout_sessions ws ON ws.id = we.workout_session_id
      WHERE we.id = exercise_sets.workout_exercise_id
        AND ws.user_id = auth.uid()::text
    )
  );

-- Template exercises: accessible if user owns the parent template
CREATE POLICY "Users access their template exercises"
  ON template_exercises FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM workout_templates wt
      WHERE wt.id = template_exercises.template_id
        AND wt.user_id = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_templates wt
      WHERE wt.id = template_exercises.template_id
        AND wt.user_id = auth.uid()::text
    )
  );

-- Exercises table: readable by all authenticated users (shared library)
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Exercises are readable by authenticated users"
  ON exercises FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow inserting custom exercises (any authenticated user)
CREATE POLICY "Authenticated users can insert exercises"
  ON exercises FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
