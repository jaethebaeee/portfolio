-- Telemedicine Integration Schema
-- Adds video consultation support to appointments and consultations

-- Add telemedicine fields to appointments table
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS is_telemedicine BOOLEAN DEFAULT false;

ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS video_provider TEXT CHECK (video_provider IN ('zoom', 'google_meet', 'custom'));

ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS meeting_id TEXT;

ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS meeting_url TEXT;

ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS meeting_password TEXT;

ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS recording_consent BOOLEAN DEFAULT false;

ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS recording_url TEXT;

ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS video_metadata JSONB DEFAULT '{}'::jsonb;

-- Add telemedicine fields to consultations table
ALTER TABLE consultations 
ADD COLUMN IF NOT EXISTS is_telemedicine BOOLEAN DEFAULT false;

ALTER TABLE consultations 
ADD COLUMN IF NOT EXISTS video_provider TEXT CHECK (video_provider IN ('zoom', 'google_meet', 'custom'));

ALTER TABLE consultations 
ADD COLUMN IF NOT EXISTS meeting_id TEXT;

ALTER TABLE consultations 
ADD COLUMN IF NOT EXISTS meeting_url TEXT;

ALTER TABLE consultations 
ADD COLUMN IF NOT EXISTS meeting_password TEXT;

ALTER TABLE consultations 
ADD COLUMN IF NOT EXISTS recording_consent BOOLEAN DEFAULT false;

ALTER TABLE consultations 
ADD COLUMN IF NOT EXISTS recording_url TEXT;

ALTER TABLE consultations 
ADD COLUMN IF NOT EXISTS video_metadata JSONB DEFAULT '{}'::jsonb;

-- Create telemedicine settings table for clinic configuration
CREATE TABLE IF NOT EXISTS telemedicine_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  
  -- Provider configuration
  default_provider TEXT NOT NULL DEFAULT 'zoom' CHECK (default_provider IN ('zoom', 'google_meet')),
  
  -- Zoom settings
  zoom_api_key TEXT,
  zoom_api_secret TEXT,
  zoom_account_id TEXT,
  zoom_access_token TEXT,
  zoom_refresh_token TEXT,
  zoom_token_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Google Meet settings
  google_client_id TEXT,
  google_client_secret TEXT,
  google_refresh_token TEXT,
  google_access_token TEXT,
  google_token_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Default meeting settings
  default_duration_minutes INTEGER DEFAULT 30,
  auto_record BOOLEAN DEFAULT false,
  require_password BOOLEAN DEFAULT true,
  waiting_room_enabled BOOLEAN DEFAULT true,
  
  -- Consent settings
  require_recording_consent BOOLEAN DEFAULT true,
  consent_text TEXT DEFAULT '이 상담은 품질 향상을 위해 녹화될 수 있습니다. 녹화에 동의하시나요?',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create telemedicine recordings table
CREATE TABLE IF NOT EXISTS telemedicine_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,
  
  -- Recording info
  provider TEXT NOT NULL CHECK (provider IN ('zoom', 'google_meet')),
  meeting_id TEXT NOT NULL,
  recording_id TEXT, -- Provider's recording ID
  recording_url TEXT,
  recording_start_time TIMESTAMP WITH TIME ZONE,
  recording_end_time TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  file_size_bytes BIGINT,
  
  -- Consent
  patient_consent BOOLEAN DEFAULT false,
  consent_date TIMESTAMP WITH TIME ZONE,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed', 'deleted')),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_appointments_telemedicine ON appointments(is_telemedicine) WHERE is_telemedicine = true;
CREATE INDEX IF NOT EXISTS idx_appointments_meeting_id ON appointments(meeting_id) WHERE meeting_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_consultations_telemedicine ON consultations(is_telemedicine) WHERE is_telemedicine = true;
CREATE INDEX IF NOT EXISTS idx_consultations_meeting_id ON consultations(meeting_id) WHERE meeting_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_telemedicine_recordings_user_id ON telemedicine_recordings(user_id);
CREATE INDEX IF NOT EXISTS idx_telemedicine_recordings_appointment_id ON telemedicine_recordings(appointment_id);
CREATE INDEX IF NOT EXISTS idx_telemedicine_recordings_consultation_id ON telemedicine_recordings(consultation_id);
CREATE INDEX IF NOT EXISTS idx_telemedicine_recordings_status ON telemedicine_recordings(status);

-- RLS Policies
ALTER TABLE telemedicine_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemedicine_recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own telemedicine settings" ON telemedicine_settings
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own telemedicine settings" ON telemedicine_settings
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own telemedicine settings" ON telemedicine_settings
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can view own telemedicine recordings" ON telemedicine_recordings
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own telemedicine recordings" ON telemedicine_recordings
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own telemedicine recordings" ON telemedicine_recordings
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Triggers
CREATE TRIGGER update_telemedicine_settings_updated_at BEFORE UPDATE ON telemedicine_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_telemedicine_recordings_updated_at BEFORE UPDATE ON telemedicine_recordings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON COLUMN appointments.is_telemedicine IS 'Whether this appointment is a video consultation';
COMMENT ON COLUMN appointments.video_provider IS 'Video platform provider (zoom, google_meet, custom)';
COMMENT ON COLUMN appointments.meeting_url IS 'Join URL for the video consultation';
COMMENT ON COLUMN appointments.recording_consent IS 'Whether patient consented to recording';
COMMENT ON COLUMN consultations.is_telemedicine IS 'Whether this consultation is a video consultation';
COMMENT ON TABLE telemedicine_settings IS 'Clinic-level telemedicine configuration and API credentials';
COMMENT ON TABLE telemedicine_recordings IS 'Stored video consultation recordings with consent tracking';

