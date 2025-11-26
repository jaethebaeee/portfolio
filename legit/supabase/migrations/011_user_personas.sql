-- Add user persona fields to profiles table for better onboarding
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS practice_size TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_role TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS specialty TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS team_size INTEGER;

-- Add comments for documentation
COMMENT ON COLUMN profiles.practice_size IS '진료실 규모: individual, small_team, clinic, hospital_chain';
COMMENT ON COLUMN profiles.user_role IS '사용자 역할: doctor, admin, manager';
COMMENT ON COLUMN profiles.specialty IS '진료과 (의사인 경우): ophthalmology, dermatology, etc';
COMMENT ON COLUMN profiles.team_size IS '팀 규모 (관리자인 경우)';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_practice_size ON profiles(practice_size);
CREATE INDEX IF NOT EXISTS idx_profiles_user_role ON profiles(user_role);
