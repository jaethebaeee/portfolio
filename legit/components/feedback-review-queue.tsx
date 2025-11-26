"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export function FeedbackReviewQueue() {
  // Mock Data - In production, fetch from `patient_responses` where severity_level = 'high' AND is_reviewed = false
  const reviews = [
    {
      id: 1,
      patient: "김철수",
      surgery: "라식",
      day: "1일차",
      feedback: "눈이 너무 시리고 아파서 눈을 뜰 수가 없어요. 진통제 먹어도 되나요?",
      severity: "high",
      date: "10분 전"
    },
    {
      id: 2,
      patient: "이영희",
      surgery: "코성형",
      day: "3일차",
      feedback: "코 끝에서 피가 조금씩 계속 나는데 정상인가요?",
      severity: "high",
      date: "1시간 전"
    }
  ];

  const handleAck = (id: number) => {
    toast.success("확인 처리되었습니다.");
    // In production, update DB: set is_reviewed = true
  };

  return (
    <Card className="border-l-4 border-l-red-500 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse" />
          긴급 피드백 리뷰 (Action Required)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-100 dark:border-red-900/20">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">{review.patient}</span>
                  <Badge variant="outline" className="text-xs bg-background">{review.surgery} {review.day}</Badge>
                  <span className="text-xs text-muted-foreground">{review.date}</span>
                </div>
                <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => handleAck(review.id)}>
                  <CheckCircle className="mr-1 h-3 w-3" /> 확인 완료
                </Button>
              </div>
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                "{review.feedback}"
              </p>
              <div className="mt-3 flex justify-end gap-2">
                <Button size="sm" variant="outline" className="h-7 text-xs bg-white">
                  차트 보기
                </Button>
                <Button size="sm" className="h-7 text-xs bg-red-600 hover:bg-red-700 text-white">
                  <ExternalLink className="mr-1 h-3 w-3" /> 전화 연결
                </Button>
              </div>
            </div>
          ))}
          {reviews.length === 0 && (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500 opacity-50" />
              현재 확인이 필요한 긴급 피드백이 없습니다.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

