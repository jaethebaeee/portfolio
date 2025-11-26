-- 이벤트/생일 CRM 테이블

-- 이벤트 캠페인 테이블
CREATE TABLE IF NOT EXISTS event_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('seasonal', 'birthday', 'procedure_reminder', 'custom')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  discount_rate INTEGER, -- 할인율 (%)
  discount_amount INTEGER, -- 할인 금액 (원)
  coupon_code TEXT,
  template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 이벤트 캠페인 세그먼트 테이블 (JSONB로 저장)
ALTER TABLE event_campaigns 
ADD COLUMN IF NOT EXISTS segment_config JSONB DEFAULT '{}'::jsonb;

-- 이벤트 캠페인 실행 이력 테이블
CREATE TABLE IF NOT EXISTS event_campaign_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  campaign_id UUID REFERENCES event_campaigns(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_event_campaigns_user_id ON event_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_event_campaigns_event_type ON event_campaigns(event_type);
CREATE INDEX IF NOT EXISTS idx_event_campaigns_enabled ON event_campaigns(enabled);
CREATE INDEX IF NOT EXISTS idx_event_campaign_executions_campaign_id ON event_campaign_executions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_event_campaign_executions_patient_id ON event_campaign_executions(patient_id);
CREATE INDEX IF NOT EXISTS idx_event_campaign_executions_status ON event_campaign_executions(status);

-- RLS 정책
ALTER TABLE event_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_campaign_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own event_campaigns" ON event_campaigns
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own event_campaigns" ON event_campaigns
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own event_campaigns" ON event_campaigns
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own event_campaigns" ON event_campaigns
  FOR DELETE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can view own event_campaign_executions" ON event_campaign_executions
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own event_campaign_executions" ON event_campaign_executions
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- updated_at 트리거
CREATE TRIGGER update_event_campaigns_updated_at BEFORE UPDATE ON event_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

