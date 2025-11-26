-- Cancellation and No-Show Workflow Enhancements
-- Adds cancellation_reason field and updates appointment status enum

-- Add cancellation_reason to appointments table
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Add cancellation_reason_category for easier filtering
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS cancellation_reason_category TEXT CHECK (cancellation_reason_category IN (
  'schedule_conflict',
  'financial',
  'health_concern',
  'dissatisfaction',
  'found_other_provider',
  'no_longer_needed',
  'other'
));

-- Update status enum to include 'no_show'
-- First, drop the existing constraint
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;

-- Add new constraint with no_show
ALTER TABLE appointments 
ADD CONSTRAINT appointments_status_check 
CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show'));

-- Add index for cancellation reason queries
CREATE INDEX IF NOT EXISTS idx_appointments_cancellation_reason ON appointments(cancellation_reason_category) 
WHERE cancellation_reason_category IS NOT NULL;

-- Add cancellation_reason to patient records for analysis
-- Store aggregated cancellation reasons in patient metadata
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS cancellation_history JSONB DEFAULT '[]'::jsonb;

-- Create function to track cancellation reasons per patient
CREATE OR REPLACE FUNCTION track_patient_cancellation()
RETURNS TRIGGER AS $$
BEGIN
  -- When appointment is cancelled, add to patient's cancellation history
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' AND NEW.cancellation_reason_category IS NOT NULL THEN
    UPDATE patients
    SET cancellation_history = COALESCE(cancellation_history, '[]'::jsonb) || 
        jsonb_build_object(
          'appointment_id', NEW.id,
          'date', NEW.updated_at,
          'reason_category', NEW.cancellation_reason_category,
          'reason', NEW.cancellation_reason
        )
    WHERE id = NEW.patient_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to track cancellations
DROP TRIGGER IF EXISTS track_cancellation_trigger ON appointments;
CREATE TRIGGER track_cancellation_trigger
AFTER UPDATE ON appointments
FOR EACH ROW
WHEN (NEW.status = 'cancelled' AND OLD.status != 'cancelled')
EXECUTE FUNCTION track_patient_cancellation();

-- Add comment for documentation
COMMENT ON COLUMN appointments.cancellation_reason IS 'Detailed reason for cancellation provided by patient';
COMMENT ON COLUMN appointments.cancellation_reason_category IS 'Categorized reason for easier filtering and workflow routing';
COMMENT ON COLUMN patients.cancellation_history IS 'Array of cancellation records for analysis and pattern detection';

