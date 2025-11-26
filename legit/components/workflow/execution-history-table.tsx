"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Loader2, AlertCircle, CheckCircle2, XCircle, Clock } from "lucide-react";
import { WorkflowExecution } from "@/lib/database.types";

interface ExecutionHistoryTableProps {
  workflowId: string;
}

interface ExtendedExecution extends WorkflowExecution {
  patient?: {
    name: string;
    phone: string;
  };
}

export function ExecutionHistoryTable({ workflowId }: ExecutionHistoryTableProps) {
  const [executions, setExecutions] = useState<ExtendedExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExecutions();
  }, [workflowId]);

  const fetchExecutions = async () => {
    try {
      const response = await fetch(`/api/workflows/executions?workflow_id=${workflowId}&limit=20`);
      if (!response.ok) throw new Error("Failed to fetch executions");
      const data = await response.json();
      setExecutions(data.executions);
    } catch (err) {
      setError("실행 이력을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-48 text-destructive gap-2">
        <AlertCircle className="h-5 w-5" />
        <span>{error}</span>
      </div>
    );
  }

  if (executions.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-48 text-muted-foreground gap-2 border rounded-md bg-muted/10">
        <Clock className="h-8 w-8 opacity-50" />
        <p>아직 실행된 이력이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>상태</TableHead>
            <TableHead>환자명</TableHead>
            <TableHead>현재 단계</TableHead>
            <TableHead>시작 시간</TableHead>
            <TableHead>완료 시간</TableHead>
            <TableHead>메시지</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {executions.map((exec) => (
            <TableRow key={exec.id}>
              <TableCell>
                <StatusBadge status={exec.status} />
              </TableCell>
              <TableCell className="font-medium">
                {exec.patient?.name || "알 수 없음"}
                <div className="text-xs text-muted-foreground">
                  {exec.patient?.phone}
                </div>
              </TableCell>
              <TableCell>
                {exec.current_step_index !== undefined 
                  ? `${exec.current_step_index + 1}단계` 
                  : "-"}
              </TableCell>
              <TableCell>
                {exec.created_at ? format(new Date(exec.created_at), "MM/dd HH:mm", { locale: ko }) : "-"}
              </TableCell>
              <TableCell>
                {exec.completed_at ? format(new Date(exec.completed_at), "MM/dd HH:mm", { locale: ko }) : "-"}
              </TableCell>
              <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                {exec.error_message || "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
          <CheckCircle2 className="h-3 w-3" /> 성공
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1">
          <XCircle className="h-3 w-3" /> 실패
        </Badge>
      );
    case "running":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1">
          <Loader2 className="h-3 w-3 animate-spin" /> 진행중
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-muted-foreground gap-1">
          <Clock className="h-3 w-3" /> 대기중
        </Badge>
      );
  }
}

