// Add 'tags' column to patients table
ALTER TABLE patients
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

// Create GIN index for fast tag searching
CREATE INDEX IF NOT EXISTS idx_patients_tags ON patients USING GIN(tags);

// Add 'tag_action' to workflow action types if needed, or handle via update_patient

