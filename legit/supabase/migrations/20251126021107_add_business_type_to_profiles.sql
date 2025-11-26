-- Add business_type column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_type TEXT DEFAULT 'medical' CHECK (business_type IN ('medical', 'hagwon', 'school', 'academy_center', 'specialized'));

-- Update existing profiles to have medical as default
UPDATE profiles SET business_type = 'medical' WHERE business_type IS NULL;

-- Make business_type NOT NULL
ALTER TABLE profiles ALTER COLUMN business_type SET NOT NULL;
