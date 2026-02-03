-- Atomic XP increment to prevent race conditions
-- Usage: SELECT * FROM increment_xp('user-uuid', 50);

CREATE OR REPLACE FUNCTION increment_xp(p_user_id UUID, p_xp_amount INTEGER)
RETURNS TABLE(new_xp INTEGER, new_level INTEGER, leveled_up BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_old_level INTEGER;
  v_new_xp INTEGER;
  v_new_level INTEGER;
BEGIN
  -- Get current level before update
  SELECT current_level INTO v_old_level
  FROM user_profiles
  WHERE user_id = p_user_id;

  -- Atomic increment
  UPDATE user_profiles
  SET total_xp = total_xp + p_xp_amount,
      current_level = (
        CASE
          WHEN total_xp + p_xp_amount >= 50000 THEN 20
          WHEN total_xp + p_xp_amount >= 40000 THEN 19
          WHEN total_xp + p_xp_amount >= 32000 THEN 18
          WHEN total_xp + p_xp_amount >= 25000 THEN 17
          WHEN total_xp + p_xp_amount >= 20000 THEN 16
          WHEN total_xp + p_xp_amount >= 16000 THEN 15
          WHEN total_xp + p_xp_amount >= 12500 THEN 14
          WHEN total_xp + p_xp_amount >= 10000 THEN 13
          WHEN total_xp + p_xp_amount >= 7500 THEN 12
          WHEN total_xp + p_xp_amount >= 5500 THEN 11
          WHEN total_xp + p_xp_amount >= 4000 THEN 10
          WHEN total_xp + p_xp_amount >= 3000 THEN 9
          WHEN total_xp + p_xp_amount >= 2200 THEN 8
          WHEN total_xp + p_xp_amount >= 1500 THEN 7
          WHEN total_xp + p_xp_amount >= 1000 THEN 6
          WHEN total_xp + p_xp_amount >= 650 THEN 5
          WHEN total_xp + p_xp_amount >= 400 THEN 4
          WHEN total_xp + p_xp_amount >= 200 THEN 3
          WHEN total_xp + p_xp_amount >= 75 THEN 2
          ELSE 1
        END
      )
  WHERE user_id = p_user_id
  RETURNING total_xp, current_level INTO v_new_xp, v_new_level;

  -- Return result
  RETURN QUERY SELECT v_new_xp, v_new_level, (v_new_level > COALESCE(v_old_level, 1));
END;
$$;
