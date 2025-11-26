"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { CheckCircle2, AlertCircle, CalendarX, DollarSign, Heart, ThumbsDown, Building2, XCircle, HelpCircle } from "lucide-react";

const CANCELLATION_REASONS = [
  { 
    value: 'schedule_conflict', 
    label: '일정 변경/충돌', 
    icon: CalendarX,
    description: '다른 일정과 겹쳐서'
  },
  { 
    value: 'financial', 
    label: '경제적 사유', 
    icon: DollarSign,
    description: '비용 문제로'
  },
  { 
    value: 'health_concern', 
    label: '건강상의 우려', 
    icon: Heart,
    description: '건강 상태가 좋지 않아서'
  },
  { 
    value: 'dissatisfaction', 
    label: '서비스 불만', 
    icon: ThumbsDown,
    description: '서비스에 불만이 있어서'
  },
  { 
    value: 'found_other_provider', 
    label: '다른 병원 선택', 
    icon: Building2,
    description: '다른 병원을 선택해서'
  },
  { 
    value: 'no_longer_needed', 
    label: '더 이상 필요 없음', 
    icon: XCircle,
    description: '시술이 더 이상 필요 없어서'
  },
  { 
    value: 'other', 
    label: '기타', 
    icon: HelpCircle,
    description: '기타 사유'
  },
];

function CancellationSurveyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const appointmentId = searchParams.get("aid");
  const patientId = searchParams.get("pid");
  const userId = searchParams.get("uid");
  const workflowId = searchParams.get("wid");
  const nodeId = searchParams.get("nid");

  const [selectedReason, setSelectedReason] = useState<string>("");
  const [customReason, setCustomReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast.error("취소 사유를 선택해주세요.");
      return;
    }

    if (selectedReason === 'other' && !customReason.trim()) {
      toast.error("기타 사유를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Update appointment with cancellation reason
      if (appointmentId && userId) {
        const updateRes = await fetch(`/api/appointments/${appointmentId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cancellation_reason: selectedReason === 'other' ? customReason : CANCELLATION_REASONS.find(r => r.value === selectedReason)?.label,
            cancellation_reason_category: selectedReason,
          })
        });

        if (!updateRes.ok) {
          throw new Error('Failed to update appointment');
        }
      }

      // Store survey response
      if (patientId && userId && workflowId && nodeId) {
        const surveyRes = await fetch('/api/workflows/survey-response', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            patient_id: patientId,
            workflow_id: workflowId,
            node_id: nodeId,
            appointment_id: appointmentId,
            survey_type: 'cancellation_reason',
            response_value: selectedReason,
            response_text: selectedReason === 'other' ? customReason : CANCELLATION_REASONS.find(r => r.value === selectedReason)?.label,
          })
        });

        if (!surveyRes.ok) {
          console.error('Failed to store survey response');
        }
      }

      setIsSubmitted(true);
      
      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (e) {
      console.error(e);
      toast.error("제출 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md text-center py-10">
          <CardContent className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">설문 제출 완료</h2>
            <p className="text-slate-600">
              소중한 의견 감사합니다.<br/>
              더 나은 서비스로 보답하겠습니다.
            </p>
            <div className="mt-6 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>
                  재예약을 원하시면 언제든지 연락주세요.<br/>
                  담당자가 곧 연락드릴 예정입니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">예약 취소 사유</h1>
          <p className="text-slate-500">더 나은 서비스를 위해 취소 사유를 알려주세요</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>예약을 취소하신 이유는 무엇인가요?</CardTitle>
            <CardDescription>
              선택하신 사유는 서비스 개선에 활용됩니다
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
              <div className="space-y-3">
                {CANCELLATION_REASONS.map((reason) => {
                  const Icon = reason.icon;
                  return (
                    <label
                      key={reason.value}
                      className={`
                        flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all
                        ${selectedReason === reason.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                        }
                      `}
                    >
                      <RadioGroupItem value={reason.value} id={reason.value} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="h-5 w-5 text-slate-600" />
                          <span className="font-medium text-slate-900">{reason.label}</span>
                        </div>
                        <p className="text-sm text-slate-500">{reason.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </RadioGroup>

            {selectedReason === 'other' && (
              <div className="space-y-2 pt-2">
                <Label htmlFor="custom-reason">기타 사유를 입력해주세요</Label>
                <Textarea 
                  id="custom-reason"
                  placeholder="취소 사유를 자세히 적어주세요"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  rows={4}
                />
              </div>
            )}
          </CardContent>

          <CardFooter>
            <Button 
              className="w-full h-12 text-lg" 
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedReason}
            >
              {isSubmitting ? '제출 중...' : '제출하기'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function CancellationSurveyPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">로딩 중...</div>}>
      <CancellationSurveyContent />
    </Suspense>
  );
}

