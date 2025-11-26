-- Add surgery related fields to appointments and templates

-- Update appointments table
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS surgery_type TEXT,
ADD COLUMN IF NOT EXISTS surgery_details JSONB;

-- Add comment for documentation
COMMENT ON COLUMN appointments.surgery_type IS 'Type of surgery (e.g., lasik, lasek, cataract, rhinoplasty)';
COMMENT ON COLUMN appointments.surgery_details IS 'Additional details about the surgery (e.g., specific method, treated area)';

-- Update templates table to allow targeting specific surgeries
ALTER TABLE templates
ADD COLUMN IF NOT EXISTS target_surgery_type TEXT;

COMMENT ON COLUMN templates.target_surgery_type IS 'Specific surgery type this template is designed for';

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_appointments_surgery_type ON appointments(surgery_type);
CREATE INDEX IF NOT EXISTS idx_templates_target_surgery_type ON templates(target_surgery_type);

