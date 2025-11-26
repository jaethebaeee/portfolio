-- 워크플로우 정의 테이블
create table if not exists workflows (
  id uuid primary key default gen_random_uuid(),
  user_id text not null, -- Clerk user_id
  name text not null,
  trigger_type text not null, -- 'post_surgery'
  steps jsonb not null, -- [{ day: 1, type: 'survey' }, { day: 3, type: 'photo' }]
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 환자 응답/설문 결과 테이블
create table if not exists patient_responses (
  id uuid primary key default gen_random_uuid(),
  user_id text not null, -- 병원 ID (Clerk user_id)
  patient_id uuid references patients(id) on delete cascade,
  workflow_id uuid references workflows(id),
  step_index int, -- 워크플로우의 몇 번째 단계인지
  response_type text not null, -- 'pain_level', 'photo'
  response_value text not null, -- '5' or 'image_url'
  severity_level text default 'normal', -- 'normal', 'high'
  is_reviewed boolean default false, -- 의료진 확인 여부
  created_at timestamp with time zone default now()
);

-- RLS 정책 (기존 패턴 따름)
alter table workflows enable row level security;
alter table patient_responses enable row level security;

create policy "Users can view their own workflows"
  on workflows for select
  using (auth.uid()::text = user_id);

create policy "Users can insert their own workflows"
  on workflows for insert
  with check (auth.uid()::text = user_id);

create policy "Users can update their own workflows"
  on workflows for update
  using (auth.uid()::text = user_id);

create policy "Users can delete their own workflows"
  on workflows for delete
  using (auth.uid()::text = user_id);

create policy "Users can view their own patient responses"
  on patient_responses for select
  using (auth.uid()::text = user_id);

-- 환자 응답은 공개적으로 insert 가능해야 함 (모바일 웹페이지에서)
-- 실제로는 별도 서명/토큰 검증이 필요하지만, MVP 단계에서는 열어둠
create policy "Anyone can insert responses"
  on patient_responses for insert
  with check (true);

create policy "Users can update their own patient responses"
  on patient_responses for update
  using (auth.uid()::text = user_id);

