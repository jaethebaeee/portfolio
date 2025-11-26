-- Add compliance fields to patients
ALTER TABLE patients
ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS privacy_consent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS consent_date TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN patients.marketing_consent IS 'User consent for marketing messages (FriendTalk)';
COMMENT ON COLUMN patients.privacy_consent IS 'User consent for PIPA compliance';

-- Add follow-up fields to consultations
ALTER TABLE consultations
ADD COLUMN IF NOT EXISTS follow_up_date DATE,
ADD COLUMN IF NOT EXISTS follow_up_notes TEXT;

COMMENT ON COLUMN consultations.follow_up_date IS 'Scheduled date for follow-up if outcome is follow_up_needed';

-- Create index for follow-up queries
CREATE INDEX IF NOT EXISTS idx_consultations_follow_up_date ON consultations(follow_up_date);

