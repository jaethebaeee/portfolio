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
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ArrowLeft, CheckCircle2, XCircle, Clock, Loader2, Code } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useWebhookExecutions } from "@/lib/queries/webhook-executions";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function WebhookExecutionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialWebhookId = searchParams.get('webhook_id') || undefined;
  
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [webhookFilter, setWebhookFilter] = useState<string | undefined>(initialWebhookId);

  const { data: executions, isLoading } = useWebhookExecutions({
    status: statusFilter,
    webhookId: webhookFilter
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1" /> 성공</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> 실패</Badge>;
      case 'running':
        return <Badge className="bg-blue-500 hover:bg-blue-600 animate-pulse"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> 실행 중</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> 대기</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">웹훅 실행 이력</h1>
          <p className="text-muted-foreground">
            외부 시스템에서의 웹훅 호출 기록을 확인합니다.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>호출 로그</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="상태 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 상태</SelectItem>
                  <SelectItem value="completed">성공</SelectItem>
                  <SelectItem value="failed">실패</SelectItem>
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
          ) : executions && executions.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>상태</TableHead>
                    <TableHead>웹훅 이름</TableHead>
                    <TableHead>실행 시간</TableHead>
                    <TableHead>응답 시간</TableHead>
                    <TableHead>페이로드</TableHead>
                    <TableHead className="text-right">일시</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {executions.map((exec) => (
                    <TableRow key={exec.id}>
                      <TableCell>{getStatusBadge(exec.status)}</TableCell>
                      <TableCell className="font-medium">
                        {exec.webhook?.name || '삭제된 웹훅'}
                      </TableCell>
                      <TableCell>
                         {exec.execution_time_ms ? `${exec.execution_time_ms}ms` : '-'}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Code className="w-4 h-4 mr-1" /> 상세보기
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>실행 상세 정보</DialogTitle>
                              <DialogDescription>
                                웹훅 호출의 상세 페이로드와 응답입니다.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <h4 className="text-sm font-medium">Request Payload</h4>
                                <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-[300px]">
                                  {JSON.stringify(exec.payload, null, 2)}
                                </pre>
                              </div>
                              <div className="space-y-2">
                                <h4 className="text-sm font-medium">Response / Error</h4>
                                <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-[300px]">
                                  {exec.error_message 
                                    ? `Error: ${exec.error_message}` 
                                    : JSON.stringify(exec.response, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(exec.created_at), { addSuffix: true, locale: ko })}
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
    </div>
  );
}

