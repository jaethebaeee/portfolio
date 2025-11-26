-- Create workflow_jobs table
create table if not exists workflow_jobs (
  id text primary key,
  workflow_id uuid references workflows(id) on delete cascade,
  patient_id uuid references patients(id) on delete cascade,
  appointment_id uuid references appointments(id) on delete set null,
  
  -- Job Configuration & Context
  job_data jsonb not null default '{}'::jsonb,
  execution_context jsonb default '{}'::jsonb,
  delay_config jsonb,
  resume_from_node_id text,
  original_execution_id text,
  
  -- Status & Scheduling
  status text not null default 'queued', -- queued, processing, completed, failed, cancelled
  priority text default 'normal', -- critical, high, normal, low
  scheduled_for timestamptz,
  
  -- Retry Logic
  retry_count int default 0,
  max_retries int default 3,
  last_error text,
  
  -- Results
  result jsonb,
  error_message text,
  execution_time int,
  
  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  completed_at timestamptz,
  failed_at timestamptz,
  cancelled_at timestamptz
);

-- Indexes for performance
create index if not exists idx_workflow_jobs_status_scheduled on workflow_jobs(status, scheduled_for);
create index if not exists idx_workflow_jobs_priority on workflow_jobs(priority);
create index if not exists idx_workflow_jobs_patient on workflow_jobs(patient_id);
create index if not exists idx_workflow_jobs_workflow on workflow_jobs(workflow_id);

-- Function to safely fetch and lock the next batch of jobs
-- This prevents multiple cron executions from processing the same jobs
create or replace function get_next_jobs(
  limit_count int default 10,
  max_retries int default 3
)
returns setof workflow_jobs
language plpgsql
as $$
begin
  return query
  update workflow_jobs
  set 
    status = 'processing',
    updated_at = now()
  where id in (
    select id
    from workflow_jobs
    where status = 'queued'
    and (scheduled_for is null or scheduled_for <= now())
    order by 
      case priority 
        when 'critical' then 1 
        when 'high' then 2 
        when 'normal' then 3 
        when 'low' then 4 
        else 5 
      end asc,
      scheduled_for asc
    limit limit_count
    for update skip locked
  )
  returning *;
end;
$$;
