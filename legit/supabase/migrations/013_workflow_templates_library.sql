-- 워크플로우 템플릿 라이브러리 테이블
create table if not exists workflow_templates (
  id uuid primary key default gen_random_uuid(),
  user_id text, -- null이면 시스템 기본 템플릿, 있으면 사용자가 공유한 템플릿
  name text not null,
  description text,
  category text not null check (category in ('안과', '성형외과', '피부과', '공통')),
  specialty text, -- 세부 전문과목 (예: 'lasik', 'cataract', 'glaucoma', 'rhinoplasty', 'blepharoplasty', 'facelift', 'acne', 'laser')
  target_surgery_type text,
  
  -- 워크플로우 데이터
  visual_data jsonb, -- React Flow nodes/edges for visual workflows
  steps jsonb, -- Legacy linear workflow steps
  
  -- 공유 및 평가
  is_public boolean default false, -- 공개 여부
  is_featured boolean default false, -- 추천 템플릿 여부
  is_system_template boolean default false, -- 시스템 기본 템플릿 여부
  
  -- 통계
  usage_count integer default 0, -- 사용 횟수
  rating_average numeric(3, 2) default 0, -- 평균 평점 (0-5)
  rating_count integer default 0, -- 평점 개수
  
  -- 메타데이터
  tags text[], -- 태그 배열
  preview_image_url text, -- 미리보기 이미지 URL
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 템플릿 평점 테이블
create table if not exists workflow_template_ratings (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references workflow_templates(id) on delete cascade,
  user_id text not null, -- 평가한 사용자
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default now(),
  unique(template_id, user_id) -- 한 사용자는 한 템플릿에 대해 한 번만 평가 가능
);

-- 템플릿 사용 이력 (어떤 클리닉이 어떤 템플릿을 사용했는지)
create table if not exists workflow_template_usage (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references workflow_templates(id) on delete cascade,
  user_id text not null, -- 사용한 클리닉
  workflow_id uuid references workflows(id) on delete set null, -- 생성된 워크플로우 ID
  created_at timestamp with time zone default now()
);

-- 인덱스
create index idx_workflow_templates_category on workflow_templates(category);
create index idx_workflow_templates_specialty on workflow_templates(specialty);
create index idx_workflow_templates_public on workflow_templates(is_public) where is_public = true;
create index idx_workflow_templates_featured on workflow_templates(is_featured) where is_featured = true;
create index idx_workflow_templates_rating on workflow_templates(rating_average desc);
create index idx_workflow_template_ratings_template on workflow_template_ratings(template_id);
create index idx_workflow_template_usage_template on workflow_template_usage(template_id);
create index idx_workflow_template_usage_user on workflow_template_usage(user_id);

-- RLS 정책
alter table workflow_templates enable row level security;
alter table workflow_template_ratings enable row level security;
alter table workflow_template_usage enable row level security;

-- 템플릿 조회: 공개된 템플릿은 모두 볼 수 있고, 자신의 템플릿도 볼 수 있음
create policy "Anyone can view public templates"
  on workflow_templates for select
  using (is_public = true or is_system_template = true or auth.uid()::text = user_id);

-- 템플릿 생성: 자신의 템플릿만 생성 가능
create policy "Users can create their own templates"
  on workflow_templates for insert
  with check (auth.uid()::text = user_id);

-- 템플릿 수정: 자신의 템플릿만 수정 가능 (시스템 템플릿은 수정 불가)
create policy "Users can update their own templates"
  on workflow_templates for update
  using (auth.uid()::text = user_id and is_system_template = false);

-- 템플릿 삭제: 자신의 템플릿만 삭제 가능 (시스템 템플릿은 삭제 불가)
create policy "Users can delete their own templates"
  on workflow_templates for delete
  using (auth.uid()::text = user_id and is_system_template = false);

-- 평점 조회: 모든 평점 조회 가능
create policy "Anyone can view ratings"
  on workflow_template_ratings for select
  using (true);

-- 평점 생성: 로그인한 사용자만 평점 생성 가능
create policy "Authenticated users can create ratings"
  on workflow_template_ratings for insert
  with check (auth.uid()::text = user_id);

-- 평점 수정: 자신의 평점만 수정 가능
create policy "Users can update their own ratings"
  on workflow_template_ratings for update
  using (auth.uid()::text = user_id);

-- 사용 이력 조회: 자신의 사용 이력만 조회 가능
create policy "Users can view their own usage"
  on workflow_template_usage for select
  using (auth.uid()::text = user_id);

-- 사용 이력 생성: 로그인한 사용자만 생성 가능
create policy "Authenticated users can create usage records"
  on workflow_template_usage for insert
  with check (auth.uid()::text = user_id);

-- 평점 평균 업데이트 트리거 함수
create or replace function update_template_rating_average()
returns trigger as $$
begin
  update workflow_templates
  set 
    rating_average = (
      select coalesce(avg(rating)::numeric(3, 2), 0)
      from workflow_template_ratings
      where template_id = coalesce(new.template_id, old.template_id)
    ),
    rating_count = (
      select count(*)
      from workflow_template_ratings
      where template_id = coalesce(new.template_id, old.template_id)
    )
  where id = coalesce(new.template_id, old.template_id);
  return coalesce(new, old);
end;
$$ language plpgsql;

-- 평점 생성/수정/삭제 시 평균 업데이트
create trigger update_template_rating_on_rating_change
  after insert or update or delete on workflow_template_ratings
  for each row execute function update_template_rating_average();

-- 사용 횟수 업데이트 트리거 함수
create or replace function update_template_usage_count()
returns trigger as $$
begin
  update workflow_templates
  set usage_count = (
    select count(*)
    from workflow_template_usage
    where template_id = new.template_id
  )
  where id = new.template_id;
  return new;
end;
$$ language plpgsql;

-- 사용 이력 생성 시 사용 횟수 업데이트
create trigger update_template_usage_on_insert
  after insert on workflow_template_usage
  for each row execute function update_template_usage_count();

