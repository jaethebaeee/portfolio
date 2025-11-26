"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X, MessageSquare, Phone, Eye, AlertCircle, Send, Loader2 } from "lucide-react";
import { MarketingTemplate, TemplateMessage, Channel, TriggerType } from "@/lib/template-types";
import { validateTemplateForSave, AVAILABLE_VARIABLES, getByteLength } from "@/lib/template-validation";
import { validateKoreanPhoneNumber } from "@/lib/phone-validation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AdvancedVariableAutocomplete } from "@/components/advanced-variable-autocomplete";
import { toast } from "sonner";

interface TemplateEditDialogProps {
  template: MarketingTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (template: MarketingTemplate) => void;
}

export function TemplateEditDialog({
  template,
  open,
  onOpenChange,
  onSave,
}: TemplateEditDialogProps) {
  const [formData, setFormData] = useState<Partial<MarketingTemplate>>({
    name: "",
    description: "",
    trigger: {
      type: "appointment_completed",
    },
    messages: [],
    enabled: true,
  });

  const [testPhone, setTestPhone] = useState("");
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description,
        trigger: template.trigger,
        messages: template.messages,
        enabled: template.enabled,
      });
    }
  }, [template]);

  const handleAddMessage = () => {
    const newMessage: TemplateMessage = {
      channel: "kakao",
      content: "",
      variables: [],
    };
    setFormData({
      ...formData,
      messages: [...(formData.messages || []), newMessage],
    });
  };

  const handleRemoveMessage = (index: number) => {
    const newMessages = formData.messages?.filter((_, i) => i !== index) || [];
    setFormData({
      ...formData,
      messages: newMessages,
    });
  };

  const handleMessageChange = (index: number, field: keyof TemplateMessage, value: any) => {
    const newMessages = [...(formData.messages || [])];
    newMessages[index] = {
      ...newMessages[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      messages: newMessages,
    });
  };

  const handleSave = () => {
    if (!template || !formData.name || !formData.description) {
      return;
    }

    const updated: MarketingTemplate = {
      ...template,
      name: formData.name,
      description: formData.description,
      trigger: formData.trigger!,
      messages: formData.messages || [],
      enabled: formData.enabled ?? true,
      updatedAt: new Date(),
    };

    // 템플릿 검증
    const validation = validateTemplateForSave(updated);
    
    if (!validation.isValid) {
      // 에러는 상위 컴포넌트에서 처리
      onSave(updated);
      return;
    }

    onSave(updated);
    onOpenChange(false);
  };

  const handleTestSend = async () => {
    if (!testPhone) {
      toast.error("전화번호를 입력해주세요.");
      return;
    }
    
    const phoneValidation = validateKoreanPhoneNumber(testPhone);
    if (!phoneValidation.isValid) {
      toast.error(phoneValidation.error || "올바른 전화번호 형식이 아닙니다.");
      return;
    }

    if (!formData.messages || formData.messages.length === 0) {
      toast.error("발송할 메시지가 없습니다.");
      return;
    }

    setIsTesting(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (const message of formData.messages) {
        // Replace variables with dummy data for testing
        let content = message.content;
        AVAILABLE_VARIABLES.forEach(v => {
          // Simple replacement for test
          const regex = new RegExp(`{{${v.name}}}`, 'g');
          let replacement = `[${v.description}]`;
          
          if (v.name === 'patient_name') replacement = '홍길동';
          else if (v.name.includes('date')) replacement = new Date().toISOString().split('T')[0];
          else if (v.name.includes('time')) replacement = '14:00';
          
          content = content.replace(regex, replacement);
        });

        const channelsToSend = message.channel === 'both' ? ['kakao', 'sms'] : [message.channel];

        for (const ch of channelsToSend) {
          const ep = ch === 'sms' ? '/api/nhn/send-sms' : '/api/kakao/send-message';
          const bodyField = ch === 'sms' ? 'recipientPhone' : 'phoneNumber';

          try {
            const res = await fetch(ep, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                [bodyField]: phoneValidation.formatted,
                content
              })
            });

            if (res.ok) successCount++;
            else failCount++;
          } catch (e) {
            console.error(e);
            failCount++;
          }
        }
      }
      
      if (successCount > 0) {
        toast.success(`테스트 메시지 발송 완료 (성공: ${successCount}, 실패: ${failCount})`);
      } else {
        toast.error(`테스트 메시지 발송 실패 (성공: ${successCount}, 실패: ${failCount})`);
      }
    } catch (error) {
      console.error(error);
      toast.error("오류가 발생했습니다.");
    } finally {
      setIsTesting(false);
    }
  };

  // 실시간 검증
  const validation = formData.messages
    ? validateTemplateForSave({
        ...template!,
        name: formData.name || '',
        description: formData.description || '',
        trigger: formData.trigger!,
        messages: formData.messages,
        enabled: formData.enabled ?? true,
        createdAt: template!.createdAt,
        updatedAt: new Date(),
      })
    : { isValid: true, warnings: [], errors: [] };

  const getTriggerOptions = () => {
    return [
      { value: "appointment_completed", label: "예약 완료 시" },
      { value: "days_after_surgery", label: "수술 후 N일째" },
      { value: "days_before_birthday", label: "생일 N일 전" },
      { value: "months_since_last_visit", label: "N개월 미방문" },
      { value: "review_request", label: "리뷰 요청" },
    ];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>템플릿 편집</DialogTitle>
          <DialogDescription>
            템플릿 정보를 수정하고 메시지를 관리하세요
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 기본 정보 */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">템플릿 이름</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="예: 예약 완료 리마인더"
              />
            </div>

            <div>
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="템플릿에 대한 설명을 입력하세요"
                rows={2}
              />
            </div>

            {/* 트리거 설정 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>트리거 유형</Label>
                <Select
                  value={formData.trigger?.type}
                  onValueChange={(value: TriggerType) =>
                    setFormData({
                      ...formData,
                      trigger: {
                        ...formData.trigger!,
                        type: value,
                      },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getTriggerOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(formData.trigger?.type === "days_after_surgery" ||
                formData.trigger?.type === "days_before_birthday" ||
                formData.trigger?.type === "months_since_last_visit") && (
                <div>
                  <Label>값</Label>
                  <Input
                    type="number"
                    value={formData.trigger?.value || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        trigger: {
                          ...formData.trigger!,
                          value: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    placeholder="숫자 입력"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 메시지 목록 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>메시지</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddMessage}>
                <Plus className="mr-2 h-4 w-4" />
                메시지 추가
              </Button>
            </div>

            {formData.messages?.map((message, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {message.channel === "kakao" && (
                      <Badge className="bg-yellow-500">
                        <MessageSquare className="mr-1 h-3 w-3" />
                        카톡
                      </Badge>
                    )}
                    {message.channel === "sms" && (
                      <Badge className="bg-blue-500">
                        <Phone className="mr-1 h-3 w-3" />
                        SMS
                      </Badge>
                    )}
                    {message.channel === "both" && (
                      <>
                        <Badge className="bg-yellow-500">카톡</Badge>
                        <Badge className="bg-blue-500">SMS</Badge>
                      </>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMessage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div>
                  <Label>발송 채널</Label>
                  <Select
                    value={message.channel}
                    onValueChange={(value: Channel) =>
                      handleMessageChange(index, "channel", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kakao">카카오톡</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="both">카톡 + SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>메시지 내용</Label>
                    {(message.channel === 'sms' || message.channel === 'both') && (
                      <span className={`text-xs ${
                        getByteLength(message.content) > 90 
                          ? 'text-destructive font-medium' 
                          : 'text-muted-foreground'
                      }`}>
                        {getByteLength(message.content)}바이트 / 90바이트 권장
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Textarea
                      id={`message-${index}`}
                      value={message.content}
                      onChange={(e) => handleMessageChange(index, "content", e.target.value)}
                      placeholder="메시지 내용을 입력하세요. {{ 입력 시 변수 자동완성이 표시됩니다."
                      rows={4}
                      className="font-mono text-sm"
                    />
                    <AdvancedVariableAutocomplete
                      value={message.content}
                      onChange={(newValue) => handleMessageChange(index, "content", newValue)}
                      triggerType={formData.trigger?.type}
                      textareaId={`message-${index}`}
                    />
                  </div>
                  <div className="flex items-start justify-between">
                    <p className="text-xs text-muted-foreground">
                      💡 <code className="bg-muted px-1 rounded">{`{{`}</code> 입력 시 변수 자동완성
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // Quick insert common variable
                        const commonVar = 'patient_name';
                        const currentContent = message.content || '';
                        handleMessageChange(index, "content", `${currentContent}{{${commonVar}}}`);
                      }}
                      className="h-6 text-xs"
                    >
                      빠른 삽입: {`{{patient_name}}`}
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {(!formData.messages || formData.messages.length === 0) && (
              <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                메시지가 없습니다. 메시지를 추가해주세요.
              </div>
            )}
          </div>
        </div>

        {/* 검증 결과 표시 */}
        {validation.errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>오류</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {validation.errors.map((error, idx) => (
                  <li key={idx} className="text-sm">{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {validation.warnings.length > 0 && validation.errors.length === 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>경고</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {validation.warnings.map((warning, idx) => (
                  <li key={idx} className="text-sm">{warning}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* 사용 가능한 변수 목록 */}
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-2">사용 가능한 변수:</p>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_VARIABLES.map((variable) => (
              <Badge key={variable.name} variant="outline" className="text-xs">
                {`{{${variable.name}}}`}
              </Badge>
            ))}
          </div>
        </div>

        {/* 테스트 발송 섹션 */}
        <div className="border-t pt-4 mt-4">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-sm font-semibold">테스트 발송</h4>
            <Badge variant="secondary" className="text-[10px]">개발 모드</Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Input 
                placeholder="전화번호 입력 (010-1234-5678)" 
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleTestSend} 
              disabled={isTesting || !testPhone || !formData.messages || formData.messages.length === 0}
              variant="secondary"
            >
              {isTesting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              테스트 발송
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            * 입력된 전화번호로 현재 편집 중인 템플릿 내용을 테스트 발송합니다. 변수는 임의의 값으로 대체됩니다.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={validation.errors.length > 0}>
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

