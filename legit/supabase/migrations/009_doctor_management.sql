-- Add color column to users (doctors) or create a doctors table if managing separately
-- For MVP, assuming doctors are just names in consultations, but we can add a simple doctors table for management

CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- The clinic admin's user_id (owner)
  name TEXT NOT NULL,
  specialty TEXT, -- e.g. 'Rhinoplasty', 'Lasik'
  color TEXT DEFAULT '#3b82f6', -- For calendar UI
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own doctors" ON doctors
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can manage own doctors" ON doctors
  FOR ALL USING (auth.uid()::text = user_id);

-- Update appointments to reference doctor_id (optional, can keep string for loose coupling)
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL;

