-- ============================================================================
-- ENRICH BADGES MIGRATION
-- Add dedication category and new achievement badges
-- ============================================================================

-- Update the category CHECK constraint to include 'dedication'
ALTER TABLE badges DROP CONSTRAINT IF EXISTS badges_category_check;
ALTER TABLE badges ADD CONSTRAINT badges_category_check
  CHECK (category IN ('streak', 'volume', 'strength', 'milestone', 'consistency', 'variety', 'dedication'));

-- ============================================================================
-- NEW BADGES
-- ============================================================================

INSERT INTO badges (name, description, icon_name, category, requirement_type, requirement_value, xp_reward, rarity) VALUES

-- CONSISTENCY: Streak badges
('Spark', '3-day workout streak', 'flash', 'streak', 'streak_days', 3, 75, 'common'),

-- CONSISTENCY: Total workouts (100 already covered by Century)

-- STRENGTH: PR badges
('Record Breaker', 'Set your first Personal Record', 'ribbon', 'strength', 'total_prs', 1, 100, 'common'),
('PR Machine', 'Set 10 Personal Records', 'medal', 'strength', 'total_prs', 10, 300, 'uncommon'),
('Bench Centurion', 'Bench Press 100 kg', 'barbell', 'strength', 'bench_max', 100, 500, 'rare'),
('Squat King', 'Squat 140 kg', 'barbell', 'strength', 'squat_max', 140, 750, 'epic'),
('Deadlift Titan', 'Deadlift 180 kg', 'barbell', 'strength', 'deadlift_max', 180, 1000, 'legendary'),

-- VOLUME: Lifetime volume (existing covers 1K, 10K, 50K, 100K, 500K)
-- Add 1 ton = 1000 kg (already exists as Heavy Lifter)
-- Add 10 tons = 10000 kg (already exists as Strong)
-- Add 100 tons = 100000 kg (already exists as Beast Mode)

-- VARIETY: Muscle groups and exercise variety
('Well Rounded', 'Train all muscle groups in a single week', 'globe', 'variety', 'all_muscle_groups_week', 1, 200, 'uncommon'),
('Exercise Collector', 'Try 20 different exercises', 'library', 'variety', 'unique_exercises', 20, 200, 'uncommon'),
('Movement Master', 'Try 50 different exercises', 'school', 'variety', 'unique_exercises', 50, 1000, 'epic'),

-- DEDICATION: Time-based badges
('Early Bird', 'Complete a workout before 7 AM', 'sunny', 'dedication', 'early_workouts', 1, 150, 'uncommon'),
('Night Owl', 'Complete a workout after 10 PM', 'moon', 'dedication', 'night_workouts', 1, 150, 'uncommon'),
('Weekend Warrior', 'Complete 5 weekend workouts', 'fitness', 'dedication', 'weekend_workouts', 5, 300, 'rare')

ON CONFLICT DO NOTHING;
