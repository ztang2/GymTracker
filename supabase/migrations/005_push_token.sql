-- Add push_token column to user_profiles for storing Expo push tokens
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS push_token TEXT DEFAULT NULL;

-- Index for looking up users by push token (useful for future server-side notifications)
CREATE INDEX IF NOT EXISTS idx_user_profiles_push_token
ON user_profiles (push_token)
WHERE push_token IS NOT NULL;
