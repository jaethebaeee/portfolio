-- 워크플로우 실행 이력 테이블 (Workflow Executions)
CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  trigger_type TEXT NOT NULL, -- 'webhook', 'schedule', 'manual', 'event'
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  current_step_index INTEGER DEFAULT 0,
  steps_completed INTEGER DEFAULT 0,
  total_steps INTEGER DEFAULT 0,
  error_message TEXT,
  execution_data JSONB DEFAULT '{}'::jsonb, -- Store variable context, etc.
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_workflow_executions_user_id ON workflow_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_patient_id ON workflow_executions(patient_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_started_at ON workflow_executions(started_at);

-- RLS 정책
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workflow_executions" ON workflow_executions
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own workflow_executions" ON workflow_executions
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own workflow_executions" ON workflow_executions
  FOR UPDATE USING (auth.uid()::text = user_id);

