/**
 * Queue Test Page
 * 
 * Test the workflow queue system with a 1-minute delay workflow.
 * This page helps verify that the cron job processes delayed jobs correctly.
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usePatients } from "@/lib/queries/patients";
import { useAppointments } from "@/lib/queries/appointments";

export default function QueueTestPage() {
  const [patientId, setPatientId] = useState("");
  const [appointmentId, setAppointmentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const { data: patients = [] } = usePatients();
  const { data: appointments = [] } = useAppointments("all");

  const handleTest = async () => {
    if (!patientId || !appointmentId) {
      toast.error("환자와 예약을 선택해주세요.");
      return;
    }

    setLoading(true);
    setTestResult(null);

    try {
      const response = await fetch("/api/test/queue-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, appointmentId }),
      });

      const data = await response.json();

      if (data.success) {
        setTestResult(data);
        toast.success("테스트 워크플로우가 생성되었습니다!");
      } else {
        toast.error(data.error || "테스트 실패");
        setTestResult({ error: data.error });
      }
    } catch (error: any) {
      toast.error(error.message || "테스트 중 오류가 발생했습니다.");
      setTestResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          큐 시스템 테스트
        </h1>
        <p className="text-muted-foreground text-lg">
          워크플로우 큐 시스템이 정상 작동하는지 테스트합니다
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>테스트 설정</CardTitle>
          <CardDescription>
            1분 지연 워크플로우를 생성하여 큐 시스템을 테스트합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patient">환자 선택</Label>
              <Select value={patientId} onValueChange={setPatientId}>
                <SelectTrigger>
                  <SelectValue placeholder="환자를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name} ({patient.phone})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="appointment">예약 선택</Label>
              <Select value={appointmentId} onValueChange={setAppointmentId}>
                <SelectTrigger>
                  <SelectValue placeholder="예약을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {appointments.map((appointment) => (
                    <SelectItem key={appointment.id} value={appointment.id}>
                      {new Date(appointment.appointment_date).toLocaleDateString("ko-KR")}{" "}
                      {appointment.appointment_time} - {appointment.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleTest}
            disabled={loading || !patientId || !appointmentId}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                테스트 생성 중...
              </>
            ) : (
              "1분 지연 워크플로우 생성"
            )}
          </Button>
        </CardContent>
      </Card>

      {testResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {testResult.error ? (
                <>
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  테스트 실패
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  테스트 워크플로우 생성 완료
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {testResult.error ? (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-destructive font-medium">{testResult.error}</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">워크플로우 ID:</span>
                    <Badge variant="outline">{testResult.workflowId}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">작업 ID:</span>
                    <Badge variant="outline" className="font-mono text-xs">
                      {testResult.jobId}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">예약 실행 시간:</span>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{testResult.scheduledForKST}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <p className="text-sm font-medium">다음 단계:</p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    {testResult.instructions?.map((instruction: string, index: number) => (
                      <li key={index}>{instruction}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>확인 방법:</strong> 1분 후{" "}
                    <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">
                      workflow_executions
                    </code>{" "}
                    테이블에서 실행 결과를 확인하거나, 메시지 로그에서 SMS 발송 내역을 확인하세요.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>시스템 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Cron 설정:</span>
            <Badge variant="outline">매 분 실행 (* * * * *)</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">엔드포인트:</span>
            <code className="text-xs bg-muted px-2 py-1 rounded">/api/cron/process-delayed-jobs</code>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">큐 시스템:</span>
            <Badge variant="outline">Database Locking</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

