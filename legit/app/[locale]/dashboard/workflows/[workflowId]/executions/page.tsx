"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Calendar, Clock, Loader2, RefreshCw } from "lucide-react";
import {
  useWorkflowExecutions,
  WorkflowExecutionWithDetails,
} from "@/lib/queries/workflow-executions";
import { Workflow } from "@/lib/database.types";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { WorkflowExecutionStatusBadge } from "@/components/workflow-execution-status-badge";
import { formatWorkflowExecutionDuration } from "@/lib/utils/workflow-execution";
import { WorkflowExecutionDetailContent } from "@/components/workflow-execution-detail-content";

const PAGE_SIZE = 10;

export default function WorkflowExecutionHistoryPage({
  params,
}: {
  params: { workflowId: string };
}) {
  const router = useRouter();
  const workflowId = params.workflowId;

  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedExecution, setSelectedExecution] = useState<WorkflowExecutionWithDetails | null>(null);

  const { data: workflowData, isLoading: workflowLoading } = useQuery({
    queryKey: ["workflow", workflowId],
    enabled: Boolean(workflowId),
    queryFn: async () => {
      const response = await fetch(`/api/workflows/${workflowId}`);
      if (!response.ok) {
        throw new Error("워크플로우 정보를 불러올 수 없습니다.");
      }
      const data = await response.json();
      return data.workflow as Workflow;
    },
  });

  const {
    data: executionList,
    isLoading: executionsLoading,
    refetch,
  } = useWorkflowExecutions({
    workflowId,
    status: statusFilter,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const executions = executionList?.executions ?? [];
  const total = executionList?.total ?? 0;
  const totalPages = executionList?.pageCount ?? 0;

  const handleResetFilters = () => {
    setStatusFilter("all");
    setStartDate("");
    setEndDate("");
    setPage(1);
    refetch();
  };

  const handleViewDetails = (exec: WorkflowExecutionWithDetails) => {
    setSelectedExecution(exec);
    setDetailsOpen(true);
  };

  const fromRecord = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const toRecord = total === 0 ? 0 : Math.min(page * PAGE_SIZE, total);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">워크플로우 실행 이력</h1>
          <p className="text-muted-foreground">
            선택한 워크플로우의 실행 현황, 성공률, 에러 로그를 추적합니다.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>{workflowLoading ? "워크플로우 불러오는 중..." : workflowData?.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {workflowData?.description || "설명 없음"}
            </p>
          </div>
          {workflowData && (
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={workflowData.is_active ? "default" : "secondary"}>
                {workflowData.is_active ? "활성" : "비활성"}
              </Badge>
              <Badge variant="outline">{workflowData.trigger_type}</Badge>
              {workflowData.target_surgery_type && (
                <Badge variant="outline" className="text-xs">
                  대상: {workflowData.target_surgery_type}
                </Badge>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">전체 실행</p>
            <p className="text-2xl font-bold">{total}</p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">최근 실행 시간</p>
            <p className="text-base font-medium">
              {executions[0]
                ? formatDistanceToNow(new Date(executions[0].created_at), { addSuffix: true, locale: ko })
                : "-"}
            </p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">표시 범위</p>
            <p className="text-base font-medium">
              {fromRecord}-{toRecord}
            </p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">상태 필터</p>
            <p className="text-base font-medium">
              {statusFilter === "all" ? "전체" : statusFilter}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">필터</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="flex flex-col gap-2">
            <Label htmlFor="status">상태</Label>
            <Select value={statusFilter} onValueChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}>
              <SelectTrigger id="status" className="w-[200px]">
                <SelectValue placeholder="상태 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="completed">성공</SelectItem>
                <SelectItem value="failed">실패</SelectItem>
                <SelectItem value="running">실행 중</SelectItem>
                <SelectItem value="pending">대기</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="start-date">시작일</Label>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="end-date">종료일</Label>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              새로고침
            </Button>
            <Button variant="ghost" onClick={handleResetFilters}>
              필터 초기화
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">실행 로그</CardTitle>
        </CardHeader>
        <CardContent>
          {executionsLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : executions.length > 0 ? (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>상태</TableHead>
                      <TableHead>환자</TableHead>
                      <TableHead>단계</TableHead>
                      <TableHead>소요 시간</TableHead>
                      <TableHead>메시지/에러</TableHead>
                      <TableHead className="text-right">실행 일시</TableHead>
                      <TableHead className="text-right">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {executions.map((exec) => (
                      <TableRow key={exec.id} className="hover:bg-muted/60">
                        <TableCell>
                          <WorkflowExecutionStatusBadge status={exec.status} />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{exec.patient?.name || "알 수 없음"}</span>
                            <span className="text-xs text-muted-foreground">{exec.patient?.phone || "-"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {exec.current_step_index}/{exec.total_steps || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatWorkflowExecutionDuration(exec)}
                        </TableCell>
                        <TableCell className="max-w-[260px]">
                          {exec.error_message ? (
                            <span className="text-destructive text-sm line-clamp-2">{exec.error_message}</span>
                          ) : exec.execution_data?.log ? (
                            <span className="text-muted-foreground text-sm line-clamp-2">
                              {Array.isArray(exec.execution_data.log)
                                ? exec.execution_data.log.join(", ")
                                : String(exec.execution_data.log)}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">정상 실행됨</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(exec.created_at), { addSuffix: true, locale: ko })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleViewDetails(exec)}>
                            상세
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-muted-foreground">
                  총 {total}건 중 {fromRecord}-{toRecord} 표시
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  >
                    이전
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {page} / {Math.max(totalPages, 1)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={totalPages === 0 || page >= totalPages}
                    onClick={() => setPage((prev) => prev + 1)}
                  >
                    다음
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Clock className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p>이 워크플로우에 대한 실행 이력이 없습니다.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>실행 상세 정보</DialogTitle>
            <DialogDescription>해당 실행의 전체 로그와 메타데이터를 확인합니다.</DialogDescription>
          </DialogHeader>
          {selectedExecution && <WorkflowExecutionDetailContent execution={selectedExecution} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}


