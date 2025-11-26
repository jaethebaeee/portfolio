-- Create workflow_jobs table for the queue system
CREATE TABLE workflow_jobs (
  id VARCHAR(255) PRIMARY KEY,
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  job_data JSONB NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'queued',
  retry_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  scheduled_for TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  execution_time INTEGER, -- milliseconds
  result JSONB,
  error_message TEXT,
  last_error TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_workflow_jobs_workflow_id ON workflow_jobs(workflow_id);
CREATE INDEX idx_workflow_jobs_patient_id ON workflow_jobs(patient_id);
CREATE INDEX idx_workflow_jobs_appointment_id ON workflow_jobs(appointment_id);
CREATE INDEX idx_workflow_jobs_status ON workflow_jobs(status);
CREATE INDEX idx_workflow_jobs_scheduled_for ON workflow_jobs(scheduled_for);
CREATE INDEX idx_workflow_jobs_created_at ON workflow_jobs(created_at);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_workflow_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_workflow_jobs_updated_at
  BEFORE UPDATE ON workflow_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_workflow_jobs_updated_at();
