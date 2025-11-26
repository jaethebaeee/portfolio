-- 상담 관리 (Consultation CRM) 스키마
-- 성형외과/안과 상담실장을 위한 리드 관리 및 상담 이력

-- 상담 테이블
CREATE TABLE IF NOT EXISTS consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- 병원 ID (Clerk user_id)
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  
  -- 상담 정보
  counselor_name TEXT, -- 상담실장 이름 (시스템 사용자가 아닐 수도 있음)
  doctor_name TEXT, -- 담당 원장 이름
  consultation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 유입 경로 (마케팅 분석용)
  source TEXT CHECK (source IN (
    'gangnam_unni', -- 강남언니
    'babitalk',     -- 바비톡
    'naver_place',  -- 네이버 플레이스/예약
    'naver_blog',   -- 네이버 블로그
    'instagram',    -- 인스타그램
    'youtube',      -- 유튜브
    'friend',       -- 지인 소개
    'walk_in',      -- 내원
    'website',      -- 홈페이지
    'etc'           -- 기타
  )),
  
  -- 상담 상태 및 결과
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'noshow')),
  outcome TEXT CHECK (outcome IN (
    'surgery_booked',   -- 수술 예약됨
    'deposit_paid',     -- 예약금 납부
    'considering',      -- 고민중/보류
    'follow_up_needed', -- 재연락 필요
    'lost'              -- 이탈
  )),
  
  -- 상담 상세
  interested_procedures JSONB, -- 관심 시술 목록 (예: ["rhinoplasty", "blepharoplasty"])
  quoted_price INTEGER, -- 견적 금액
  deposit_amount INTEGER, -- 납부한 예약금
  notes TEXT, -- 상담 메모
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_consultations_user_id ON consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_date ON consultations(consultation_date);
CREATE INDEX IF NOT EXISTS idx_consultations_source ON consultations(source);
CREATE INDEX IF NOT EXISTS idx_consultations_outcome ON consultations(outcome);

-- RLS 정책
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consultations" ON consultations
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own consultations" ON consultations
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own consultations" ON consultations
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own consultations" ON consultations
  FOR DELETE USING (auth.uid()::text = user_id);

-- updated_at 트리거
CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON consultations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

