-- 템플릿 즐겨찾기 테이블
create table if not exists workflow_template_favorites (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references workflow_templates(id) on delete cascade,
  user_id text not null,
  created_at timestamp with time zone default now(),
  unique(template_id, user_id)
);

-- 인덱스
create index idx_template_favorites_user on workflow_template_favorites(user_id);
create index idx_template_favorites_template on workflow_template_favorites(template_id);

-- RLS 정책
alter table workflow_template_favorites enable row level security;

create policy "Users can view their own favorites"
  on workflow_template_favorites for select
  using (auth.uid()::text = user_id);

create policy "Users can create their own favorites"
  on workflow_template_favorites for insert
  with check (auth.uid()::text = user_id);

create policy "Users can delete their own favorites"
  on workflow_template_favorites for delete
  using (auth.uid()::text = user_id);

