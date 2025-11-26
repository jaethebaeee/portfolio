-- Patient Photos table
CREATE TABLE IF NOT EXISTS patient_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  photo_type TEXT NOT NULL DEFAULT 'general' CHECK (photo_type IN ('before', 'after', 'general')),
  taken_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_patient_photos_user_id ON patient_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_patient_photos_patient_id ON patient_photos(patient_id);

-- RLS
ALTER TABLE patient_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own patient photos" ON patient_photos
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own patient photos" ON patient_photos
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own patient photos" ON patient_photos
  FOR DELETE USING (auth.uid()::text = user_id);

-- Storage bucket policy (handled in Supabase Dashboard usually, but good to note)
-- Bucket: 'patient-photos'
-- Policy: Authenticated users can read/write their own folders (e.g., by user_id prefix) or generally if limited to app users.

