-- ============================================================================
-- GAMIFICATION TABLES MIGRATION
-- FitTrack App - Phase 1 & 2 Features
-- ============================================================================

-- ============================================================================
-- 1. USER PROFILES (XP, Levels)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- ============================================================================
-- 2. BADGES (Achievement definitions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('streak', 'volume', 'strength', 'milestone', 'consistency', 'variety')),
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  xp_reward INTEGER DEFAULT 0,
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. USER BADGES (Earned achievements)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);

-- ============================================================================
-- 4. PERSONAL RECORDS (PR Tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS personal_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  record_type TEXT NOT NULL CHECK (record_type IN ('max_weight', 'max_reps', 'estimated_1rm', 'max_volume')),
  value DECIMAL NOT NULL,
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  workout_session_id UUID REFERENCES workout_sessions(id) ON DELETE SET NULL,
  previous_value DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_personal_records_user_id ON personal_records(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_records_exercise_id ON personal_records(exercise_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_personal_records_unique ON personal_records(user_id, exercise_id, record_type);

-- ============================================================================
-- 5. WORKOUT TEMPLATES
-- ============================================================================
CREATE TABLE IF NOT EXISTS workout_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  estimated_duration INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_workout_templates_user_id ON workout_templates(user_id);

-- ============================================================================
-- 6. TEMPLATE EXERCISES
-- ============================================================================
CREATE TABLE IF NOT EXISTS template_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES workout_templates(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  target_sets INTEGER DEFAULT 3,
  target_reps INTEGER DEFAULT 10,
  target_weight DECIMAL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_template_exercises_template_id ON template_exercises(template_id);

-- ============================================================================
-- 7. USER GOALS
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('workout_days', 'total_volume', 'streak_days', 'total_workouts')),
  target_value INTEGER NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('weekly', 'monthly')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals(user_id);

-- ============================================================================
-- 8. USER SETTINGS (for rest timer preference, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  rest_timer_seconds INTEGER DEFAULT 90,
  notifications_enabled BOOLEAN DEFAULT true,
  haptic_feedback_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- ============================================================================
-- SEED DATA: Starter Badges
-- ============================================================================
INSERT INTO badges (name, description, icon_name, category, requirement_type, requirement_value, xp_reward, rarity) VALUES
-- Milestone badges (first achievements)
('First Rep', 'Complete your first workout', 'barbell', 'milestone', 'total_workouts', 1, 50, 'common'),
('Getting Started', 'Complete 5 workouts', 'rocket', 'milestone', 'total_workouts', 5, 100, 'common'),
('Committed', 'Complete 25 workouts', 'medal', 'milestone', 'total_workouts', 25, 250, 'uncommon'),
('Dedicated', 'Complete 50 workouts', 'star', 'milestone', 'total_workouts', 50, 500, 'rare'),
('Century', 'Complete 100 workouts', 'trophy', 'milestone', 'total_workouts', 100, 1000, 'epic'),
('Legendary', 'Complete 500 workouts', 'diamond', 'milestone', 'total_workouts', 500, 5000, 'legendary'),

-- Streak badges
('On Fire', '7-day workout streak', 'flame', 'streak', 'streak_days', 7, 150, 'uncommon'),
('Unstoppable', '14-day workout streak', 'flame', 'streak', 'streak_days', 14, 300, 'rare'),
('Warrior', '30-day workout streak', 'flame', 'streak', 'streak_days', 30, 750, 'epic'),
('Iron Will', '100-day workout streak', 'flame', 'streak', 'streak_days', 100, 2000, 'legendary'),

-- Volume badges
('Heavy Lifter', 'Lift 1,000 kg total volume', 'barbell', 'volume', 'total_volume', 1000, 100, 'common'),
('Strong', 'Lift 10,000 kg total volume', 'barbell', 'volume', 'total_volume', 10000, 300, 'uncommon'),
('Powerhouse', 'Lift 50,000 kg total volume', 'barbell', 'volume', 'total_volume', 50000, 750, 'rare'),
('Beast Mode', 'Lift 100,000 kg total volume', 'barbell', 'volume', 'total_volume', 100000, 1500, 'epic'),
('Titan', 'Lift 500,000 kg total volume', 'barbell', 'volume', 'total_volume', 500000, 5000, 'legendary'),

-- Consistency badges
('Weekly Warrior', 'Work out 3+ days in a week', 'calendar', 'consistency', 'weekly_workouts', 3, 75, 'common'),
('Iron Schedule', 'Work out 5+ days in a week', 'calendar', 'consistency', 'weekly_workouts', 5, 200, 'uncommon'),
('Perfect Week', 'Work out 7 days in a week', 'calendar', 'consistency', 'weekly_workouts', 7, 500, 'rare'),

-- Variety badges
('Explorer', 'Try 10 different exercises', 'compass', 'variety', 'unique_exercises', 10, 100, 'common'),
('Versatile', 'Try 25 different exercises', 'compass', 'variety', 'unique_exercises', 25, 250, 'uncommon'),
('Master of All', 'Try 49 different exercises', 'compass', 'variety', 'unique_exercises', 49, 750, 'rare')

ON CONFLICT DO NOTHING;

-- ============================================================================
-- UPDATE TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_workout_templates_updated_at ON workout_templates;
CREATE TRIGGER update_workout_templates_updated_at
    BEFORE UPDATE ON workout_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_goals_updated_at ON user_goals;
CREATE TRIGGER update_user_goals_updated_at
    BEFORE UPDATE ON user_goals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
