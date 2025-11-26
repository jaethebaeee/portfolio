-- 웹훅 및 재시도 기능을 위한 추가 스키마

-- 웹훅 테이블
CREATE TABLE IF NOT EXISTS webhooks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  workflow_id UUID REFERENCES templates(id) ON DELETE SET NULL,
  secret TEXT NOT NULL,
  url TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 웹훅 실행 이력 테이블
CREATE TABLE IF NOT EXISTS webhook_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  webhook_id TEXT REFERENCES webhooks(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  payload JSONB,
  response JSONB,
  error_message TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 메시지 로그에 재시도 메타데이터 추가 (JSONB 컬럼)
ALTER TABLE message_logs 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_webhooks_user_id ON webhooks(user_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_enabled ON webhooks(enabled);
CREATE INDEX IF NOT EXISTS idx_webhook_executions_user_id ON webhook_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_executions_webhook_id ON webhook_executions(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_executions_status ON webhook_executions(status);
CREATE INDEX IF NOT EXISTS idx_message_logs_metadata ON message_logs USING GIN (metadata);

-- RLS 정책
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own webhooks" ON webhooks
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own webhooks" ON webhooks
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own webhooks" ON webhooks
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own webhooks" ON webhooks
  FOR DELETE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can view own webhook_executions" ON webhook_executions
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own webhook_executions" ON webhook_executions
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- updated_at 트리거
CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

