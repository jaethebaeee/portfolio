interface ExecutionTimingFields {
  started_at?: string | null;
  completed_at?: string | null;
}

export function formatWorkflowExecutionDuration(execution: ExecutionTimingFields): string {
  if (!execution?.started_at) {
    return '-';
  }

  const start = new Date(execution.started_at);
  const end = execution.completed_at ? new Date(execution.completed_at) : new Date();
  const durationSeconds = Math.max(0, Math.round((end.getTime() - start.getTime()) / 1000));

  if (durationSeconds < 60) {
    return `${durationSeconds}초`;
  }

  const durationMinutes = Math.round(durationSeconds / 60);
  if (durationMinutes < 60) {
    return `${durationMinutes}분`;
  }

  const hours = Math.floor(durationMinutes / 60);
  const remainingMinutes = durationMinutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}시간`;
  }

  return `${hours}시간 ${remainingMinutes}분`;
}


