import { useQuery } from "@tanstack/react-query";
import { WorkflowExecution } from "@/lib/database.types";

export interface WorkflowExecutionWithDetails extends WorkflowExecution {
  workflow?: { name: string };
  patient?: { name: string; phone: string };
}

export interface WorkflowExecutionListResponse {
  executions: WorkflowExecutionWithDetails[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
}

export interface WorkflowExecutionFilters {
  workflowId?: string;
  status?: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  patientId?: string;
}

export const workflowExecutionKeys = {
  all: ["workflow-executions"] as const,
  lists: () => [...workflowExecutionKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...workflowExecutionKeys.lists(), filters] as const,
};

async function fetchWorkflowExecutions(
  filters: WorkflowExecutionFilters = {}
): Promise<WorkflowExecutionListResponse> {
  const params = new URLSearchParams();

  if (filters.workflowId) params.append("workflow_id", filters.workflowId);
  if (filters.status && filters.status !== "all") params.append("status", filters.status);
  if (filters.page) params.append("page", String(filters.page));
  if (filters.limit) params.append("limit", String(filters.limit));
  if (filters.startDate) params.append("start_date", filters.startDate);
  if (filters.endDate) params.append("end_date", filters.endDate);
  if (filters.patientId) params.append("patient_id", filters.patientId);

  const queryString = params.toString();
  const response = await fetch(`/api/workflows/executions${queryString ? `?${queryString}` : ""}`);

  if (!response.ok) {
    throw new Error("워크플로우 실행 이력을 불러올 수 없습니다.");
  }

  const data = await response.json();
  return {
    executions: data.executions || [],
    total: data.total ?? 0,
    page: data.page ?? filters.page ?? 1,
    limit: data.limit ?? filters.limit ?? 50,
    pageCount: data.pageCount ?? 0,
  };
}

export function useWorkflowExecutions(filters: WorkflowExecutionFilters = {}) {
  return useQuery({
    queryKey: workflowExecutionKeys.list(filters),
    queryFn: () => fetchWorkflowExecutions(filters),
    keepPreviousData: true,
  });
}

