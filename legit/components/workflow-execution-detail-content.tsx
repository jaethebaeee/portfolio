import { WorkflowExecutionWithDetails } from "@/lib/queries/workflow-executions";
import { WorkflowExecutionStatusBadge } from "@/components/workflow-execution-status-badge";
import { formatWorkflowExecutionDuration } from "@/lib/utils/workflow-execution";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface WorkflowExecutionDetailContentProps {
  execution: WorkflowExecutionWithDetails;
}

export function WorkflowExecutionDetailContent({
  execution,
}: WorkflowExecutionDetailContentProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">상태</label>
          <div className="mt-1">
            <WorkflowExecutionStatusBadge status={execution.status} />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">워크플로우</label>
          <div className="mt-1 font-medium">{execution.workflow?.name || "삭제된 워크플로우"}</div>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">환자</label>
          <div className="mt-1">
            <div>{execution.patient?.name || "알 수 없음"}</div>
            <div className="text-sm text-muted-foreground">{execution.patient?.phone || "-"}</div>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">트리거 타입</label>
          <div className="mt-1">{execution.trigger_type}</div>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">진행 단계</label>
          <div className="mt-1">
            {execution.current_step_index}/{execution.total_steps || 0}
            {execution.steps_completed !== undefined && (
              <span className="text-sm text-muted-foreground ml-2">
                (완료: {execution.steps_completed})
              </span>
            )}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">소요 시간</label>
          <div className="mt-1">{formatWorkflowExecutionDuration(execution)}</div>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">시작 시간</label>
          <div className="mt-1 text-sm">
            {execution.started_at
              ? format(new Date(execution.started_at), "yyyy-MM-dd HH:mm:ss", { locale: ko })
              : "-"}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">완료 시간</label>
          <div className="mt-1 text-sm">
            {execution.completed_at
              ? format(new Date(execution.completed_at), "yyyy-MM-dd HH:mm:ss", { locale: ko })
              : "-"}
          </div>
        </div>
      </div>

      {execution.error_message && (
        <div>
          <label className="text-sm font-medium text-destructive">에러 메시지</label>
          <div className="mt-1 p-3 bg-destructive/10 rounded-md text-sm text-destructive">
            {execution.error_message}
          </div>
        </div>
      )}

      {execution.execution_data && Object.keys(execution.execution_data).length > 0 && (
        <div>
          <label className="text-sm font-medium text-muted-foreground">실행 데이터</label>
          <div className="mt-1 p-3 bg-muted rounded-md">
            <pre className="text-xs overflow-x-auto">
              {JSON.stringify(execution.execution_data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}


