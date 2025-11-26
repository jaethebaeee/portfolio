"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Phone, Copy, Check, Link as LinkIcon, ExternalLink, Smartphone } from "lucide-react";
import { MarketingTemplate, TemplateMessage } from "@/lib/template-types";
import { replaceTemplateVariables, generateTemplateVariables, TemplateVariableContext } from "@/lib/template-engine";
import { getByteLength } from "@/lib/template-validation";
import { toast } from "sonner";

interface TemplatePreviewDialogProps {
  template: MarketingTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context?: TemplateVariableContext;
}

export function TemplatePreviewDialog({
  template,
  open,
  onOpenChange,
  context,
}: TemplatePreviewDialogProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  if (!template) return null;

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("메시지가 복사되었습니다.");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // 샘플 데이터 생성
  const sampleContext: TemplateVariableContext = context || {
    patient: {
      id: 'sample',
      user_id: 'sample',
      name: '홍길동',
      phone: '010-1234-5678',
      email: 'hong@example.com',
      birth_date: '1990-01-15',
      gender: 'male',
      last_visit_date: '2024-01-01',
      last_surgery_date: '2024-01-10',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any,
    appointment: {
      id: 'sample',
      user_id: 'sample',
      patient_id: 'sample',
      appointment_date: '2024-01-20',
      appointment_time: '14:30',
      type: '라식',
      status: 'scheduled',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any,
  };

  const variables = generateTemplateVariables(sampleContext);

  const getChannelBadge = (channel: TemplateMessage['channel']) => {
    switch (channel) {
      case "kakao":
        return <Badge className="bg-yellow-500"><MessageSquare className="mr-1 h-3 w-3" />카카오톡</Badge>;
      case "sms":
        return <Badge className="bg-blue-500"><Phone className="mr-1 h-3 w-3" />SMS</Badge>;
      case "both":
        return (
          <>
            <Badge className="bg-yellow-500">카톡</Badge>
            <Badge className="bg-blue-500">SMS</Badge>
          </>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>템플릿 미리보기</DialogTitle>
          <DialogDescription>
            실제 발송될 메시지를 미리 확인하세요 (샘플 데이터 사용)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">샘플 데이터:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>환자: {sampleContext.patient?.name} ({sampleContext.patient?.phone})</li>
              {sampleContext.appointment && (
                <li>
                  예약: {sampleContext.appointment.appointment_date}{" "}
                  {sampleContext.appointment.appointment_time}
                </li>
              )}
            </ul>
          </div>

          {template.messages.map((message, index) => {
            const previewContent = replaceTemplateVariables(message.content, variables);
            const byteLength = getByteLength(previewContent);
            const isSMS = message.channel === "sms" || message.channel === "both";

            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">메시지 {index + 1}</CardTitle>
                    <div className="flex items-center gap-2">
                      {getChannelBadge(message.channel)}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(previewContent, index)}
                        className="h-7"
                      >
                        {copiedIndex === index ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {message.channel === "kakao" || message.channel === "both" ? (
                    <div className="space-y-2">
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm">
                            <span className="text-xs font-bold text-yellow-900">병원</span>
                          </div>
                          <div className="text-sm font-medium text-gray-800 dark:text-gray-200">닥터스플로우</div>
                        </div>
                        <div className="text-sm whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
                          {previewContent}
                        </div>
                        
                        {/* Kakao Buttons Preview */}
                        {message.buttons && message.buttons.length > 0 && (
                          <div className="mt-4 space-y-2">
                            {message.buttons.map((btn, btnIdx) => (
                              <div 
                                key={btnIdx}
                                className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded text-center text-sm font-medium cursor-pointer flex items-center justify-center gap-2 transition-colors"
                              >
                                {btn.type === 'WL' && <ExternalLink className="h-3 w-3 text-gray-500" />}
                                {btn.type === 'AL' && <Smartphone className="h-3 w-3 text-gray-500" />}
                                {btn.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}

                  {message.channel === "sms" || message.channel === "both" ? (
                    <div className="space-y-2">
                      <div className={`p-4 rounded-lg border shadow-sm ${
                        byteLength > 90 
                          ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800' 
                          : 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'
                      }`}>
                        <div className="text-xs text-muted-foreground mb-2 font-medium">
                          [닥터스플로우]
                        </div>
                        <div className="text-sm whitespace-pre-wrap leading-relaxed">
                          {previewContent}
                        </div>
                        <div className={`text-xs mt-3 font-medium ${
                          byteLength > 90 
                            ? 'text-red-600 dark:text-red-400' 
                            : 'text-muted-foreground'
                        }`}>
                          {byteLength}바이트 {byteLength > 90 ? '(90바이트 초과!)' : '/ SMS 권장: 90바이트 이하'}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

