-- Improve workflow_jobs table to store full execution context
-- This ensures delayed executions have complete patient/appointment context

-- Add execution context columns
ALTER TABLE workflow_jobs 
ADD COLUMN IF NOT EXISTS execution_context JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS resume_from_node_id TEXT,
ADD COLUMN IF NOT EXISTS original_execution_id UUID,
ADD COLUMN IF NOT EXISTS delay_config JSONB;

-- Add comment for documentation
COMMENT ON COLUMN workflow_jobs.execution_context IS 'Full execution context snapshot: patient data, appointment data, workflow state';
COMMENT ON COLUMN workflow_jobs.resume_from_node_id IS 'Node ID to resume execution from after delay';
COMMENT ON COLUMN workflow_jobs.original_execution_id IS 'Original workflow_executions.id that triggered this delayed job';
COMMENT ON COLUMN workflow_jobs.delay_config IS 'Delay configuration: {type, value, skipWeekends, skipHolidays}';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_workflow_jobs_resume_node ON workflow_jobs(resume_from_node_id) WHERE resume_from_node_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_workflow_jobs_execution_context ON workflow_jobs USING GIN(execution_context);
CREATE INDEX IF NOT EXISTS idx_workflow_jobs_original_execution ON workflow_jobs(original_execution_id) WHERE original_execution_id IS NOT NULL;

-- Update existing jobs to have empty execution_context if null
UPDATE workflow_jobs 
SET execution_context = '{}'::jsonb 
WHERE execution_context IS NULL;

