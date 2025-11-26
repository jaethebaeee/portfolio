"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Clock, Eye, Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useWorkflowExecutions,
  WorkflowExecutionWithDetails,
} from "@/lib/queries/workflow-executions";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { WorkflowExecutionStatusBadge } from "@/components/workflow-execution-status-badge";
import { formatWorkflowExecutionDuration } from "@/lib/utils/workflow-execution";
import { WorkflowExecutionDetailContent } from "@/components/workflow-execution-detail-content";

export default function WorkflowExecutionsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedExecution, setSelectedExecution] = useState<WorkflowExecutionWithDetails | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const {
    data: executionsData,
    isLoading,
    refetch,
  } = useWorkflowExecutions({
    status: statusFilter,
  });

  const executions = executionsData?.executions ?? [];

  // Fetch workflows for filter dropdown
  const handleViewDetails = (exec: WorkflowExecutionWithDetails) => {
    setSelectedExecution(exec);
    setDetailsOpen(true);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">워크플로우 실행 이력</h1>
          <p className="text-muted-foreground">워크플로우 자동 실행 및 결과 로그를 확인합니다.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>실행 로그</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                새로고침
              </Button>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="상태 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 상태</SelectItem>
                  <SelectItem value="completed">성공</SelectItem>
                  <SelectItem value="failed">실패</SelectItem>
                  <SelectItem value="running">실행 중</SelectItem>
                  <SelectItem value="pending">대기</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : executions.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>상태</TableHead>
                    <TableHead>워크플로우</TableHead>
                    <TableHead>환자</TableHead>
                    <TableHead>단계</TableHead>
                    <TableHead>소요 시간</TableHead>
                    <TableHead>메시지/에러</TableHead>
                    <TableHead className="text-right">실행 시간</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {executions.map((exec) => (
                    <TableRow key={exec.id} className="hover:bg-muted/50">
                      <TableCell>
                        <WorkflowExecutionStatusBadge status={exec.status} />
                      </TableCell>
                      <TableCell className="font-medium">
                        {exec.workflow?.name || "삭제된 워크플로우"}
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
                      <TableCell className="max-w-[300px]">
                        {exec.error_message ? (
                          <span className="text-destructive text-sm line-clamp-2">{exec.error_message}</span>
                        ) : exec.execution_data?.log ? (
                          <span className="text-muted-foreground text-sm line-clamp-2">
                            {Array.isArray(exec.execution_data.log)
                              ? exec.execution_data.log.join(", ")
                              : String(exec.execution_data.log)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">정상 실행됨</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(exec.created_at), { addSuffix: true, locale: ko })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetails(exec)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Clock className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p>실행 이력이 없습니다.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Execution Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>실행 상세 정보</DialogTitle>
            <DialogDescription>워크플로우 실행의 상세 로그 및 메타데이터를 확인합니다.</DialogDescription>
          </DialogHeader>
          {selectedExecution && <WorkflowExecutionDetailContent execution={selectedExecution} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

