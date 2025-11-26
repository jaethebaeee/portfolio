"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Node } from "@xyflow/react";
import { WorkflowNodeData } from "@/lib/workflow-types";
import { validateNode, getValidationErrorMessages } from "@/lib/node-validation";
import { AdvancedVariableAutocomplete } from "@/components/advanced-variable-autocomplete";
import { AlertCircle, Plus, Trash2 } from "lucide-react";

interface NodeConfigPanelProps {
  node: Node | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: WorkflowNodeData) => void;
}

export function NodeConfigPanel({ node, isOpen, onClose, onUpdate }: NodeConfigPanelProps) {
  const [data, setData] = useState<WorkflowNodeData | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (node) {
      const nodeData = { ...node.data } as WorkflowNodeData;
      setData(nodeData);
      
      // Validate on load
      const errors = validateNode(nodeData);
      setValidationErrors(getValidationErrorMessages(errors));
    }
  }, [node]);

  useEffect(() => {
    if (data) {
      const errors = validateNode(data);
      setValidationErrors(getValidationErrorMessages(errors));
    }
  }, [data]);

  const handleSave = () => {
    if (node && data) {
      if (validationErrors.length > 0) {
        // Still allow save but show warning
        // User might want to save incomplete node
      }
      onUpdate(node.id, data);
      onClose();
    }
  };

  const addHeader = () => {
    const currentHeaders = data?.httpRequest?.headers || [];
    setData({
      ...data!,
      httpRequest: {
        ...(data?.httpRequest || { method: 'GET', url: '' }),
        headers: [...currentHeaders, { key: '', value: '' }]
      }
    });
  };

  const removeHeader = (index: number) => {
    const currentHeaders = data?.httpRequest?.headers || [];
    setData({
      ...data!,
      httpRequest: {
        ...(data?.httpRequest || { method: 'GET', url: '' }),
        headers: currentHeaders.filter((_, i) => i !== index)
      }
    });
  };

  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const currentHeaders = data?.httpRequest?.headers || [];
    const newHeaders = [...currentHeaders];
    newHeaders[index] = { ...newHeaders[index], [field]: value };
    setData({
      ...data!,
      httpRequest: {
        ...(data?.httpRequest || { method: 'GET', url: '' }),
        headers: newHeaders
      }
    });
  };

  if (!node || !data) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>노드 설정: {data.label}</SheetTitle>
          <SheetDescription>
            {node.type === 'trigger' && "워크플로우가 시작되는 조건을 설정합니다."}
            {node.type === 'delay' && "다음 단계로 넘어가기 전 대기 시간을 설정합니다."}
            {node.type === 'action' && "실행할 작업의 세부 내용을 설정합니다."}
            {node.type === 'condition' && "조건에 따라 흐름을 분기합니다."}
            {node.type === 'time_window' && "특정 시간대에만 실행되도록 제한합니다."}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {validationErrors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label>노드 이름</Label>
            <Input 
              value={data.label} 
              onChange={(e) => setData({ ...data, label: e.target.value })} 
            />
          </div>

          {node.type === 'trigger' && data.triggerType === 'keyword_received' && (
            <div className="space-y-4 border p-4 rounded-md bg-muted/20">
              <div className="space-y-2">
                <Label>반응할 키워드 (콤마로 구분)</Label>
                <Input 
                  value={data.keywordConfig?.keywords?.join(', ') || ''}
                  placeholder="예: 위치, 주차, 비용, 예약취소"
                  onChange={(e) => {
                    const keywords = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                    setData({
                      ...data,
                      keywordConfig: { ...(data.keywordConfig || { matchType: 'contains' }), keywords }
                    });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>매칭 방식</Label>
                <Select 
                  value={data.keywordConfig?.matchType || 'contains'}
                  onValueChange={(val: any) => setData({
                    ...data,
                    keywordConfig: { ...(data.keywordConfig || { keywords: [] }), matchType: val }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contains">포함 (Contains)</SelectItem>
                    <SelectItem value="exact">정확히 일치 (Exact)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  고객이 카카오톡/문자로 이 키워드를 포함한 메시지를 보내면 이 워크플로우가 시작됩니다.
                </p>
              </div>
            </div>
          )}

          {node.type === 'trigger' && data.triggerType === 'webhook' && (
            <div className="space-y-4 border p-4 rounded-md bg-muted/20">
              <div className="space-y-2">
                <Label>웹훅 사용법</Label>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>이 워크플로우를 저장한 후, 생성된 웹훅 URL로 POST 요청을 보내면 워크플로우가 시작됩니다.</p>
                  <div className="bg-muted p-2 rounded border font-mono text-xs">
                    POST /api/webhooks/{'{webhook_id}'}
                  </div>
                  <p>전송된 JSON 데이터는 워크플로우 내에서 변수로 사용할 수 있습니다.</p>
                  <ul className="list-disc list-inside pl-1">
                    <li>{'{{patient_id}}'} : 환자 ID (자동 매핑)</li>
                    <li>{'{{variable_name}}'} : payload 내의 필드</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {node.type === 'delay' && (
            <div className="space-y-4 border p-4 rounded-md bg-muted/20">
              <div className="space-y-2">
                <Label>대기 시간</Label>
                <div className="flex gap-2">
                  <Input 
                    type="number" 
                    min="1"
                    max={data.delay?.type === 'days' || data.delay?.type === 'business_days' ? 30 : undefined}
                    value={data.delay?.value || 1}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      const maxValue = data.delay?.type === 'days' || data.delay?.type === 'business_days' ? 30 : undefined;
                      const finalValue = maxValue && value > maxValue ? maxValue : value;
                      setData({
                        ...data,
                        delay: { 
                          ...(data.delay || { type: 'days' }), 
                          value: finalValue 
                        }
                      });
                    }}
                  />
                  <Select 
                    value={data.delay?.type || 'days'}
                    onValueChange={(val: any) => {
                      const currentValue = data.delay?.value || 1;
                      // Cap value at 30 for days/business_days
                      const maxValue = (val === 'days' || val === 'business_days') ? 30 : undefined;
                      const finalValue = maxValue && currentValue > maxValue ? maxValue : currentValue;
                      setData({
                        ...data,
                        delay: { 
                          ...(data.delay || { value: 1 }), 
                          type: val,
                          value: finalValue,
                          // Reset skipWeekends/skipHolidays when switching to non-business_days
                          skipWeekends: val === 'business_days' ? (data.delay?.skipWeekends ?? true) : undefined,
                          skipHolidays: val === 'business_days' ? (data.delay?.skipHolidays ?? true) : undefined,
                        }
                      });
                    }}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutes">분</SelectItem>
                      <SelectItem value="hours">시간</SelectItem>
                      <SelectItem value="days">일</SelectItem>
                      <SelectItem value="business_days">영업일</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(data.delay?.type === 'days' || data.delay?.type === 'business_days') && data.delay?.value > 30 && (
                  <Alert variant="destructive" className="text-xs">
                    <AlertCircle className="h-3 w-3" />
                    <AlertDescription>
                      지연 시간은 30일을 초과할 수 없습니다.
                    </AlertDescription>
                  </Alert>
                )}
                {data.delay?.type === 'business_days' && (
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`skip-weekends-${node.id}`}
                        checked={data.delay?.skipWeekends ?? true}
                        onChange={(e) => setData({
                          ...data,
                          delay: { 
                            ...(data.delay || { type: 'business_days', value: 1 }), 
                            skipWeekends: e.target.checked 
                          }
                        })}
                        className="rounded"
                      />
                      <Label htmlFor={`skip-weekends-${node.id}`} className="text-sm font-normal cursor-pointer">
                        주말 제외 (토/일)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`skip-holidays-${node.id}`}
                        checked={data.delay?.skipHolidays ?? true}
                        onChange={(e) => setData({
                          ...data,
                          delay: { 
                            ...(data.delay || { type: 'business_days', value: 1 }), 
                            skipHolidays: e.target.checked 
                          }
                        })}
                        className="rounded"
                      />
                      <Label htmlFor={`skip-holidays-${node.id}`} className="text-sm font-normal cursor-pointer">
                        공휴일 제외 (한국 공휴일)
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      영업일은 주말과 공휴일을 제외한 날짜를 계산합니다.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {node.type === 'action' && data.actionType === 'http_request' && (
             <div className="space-y-4 border p-4 rounded-md bg-muted/20">
               <div className="grid grid-cols-4 gap-2">
                 <div className="col-span-1">
                   <Label>Method</Label>
                   <Select 
                     value={data.httpRequest?.method || 'GET'}
                     onValueChange={(val: any) => setData({
                       ...data,
                       httpRequest: { ...(data.httpRequest || { url: '' }), method: val }
                     })}
                   >
                     <SelectTrigger>
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="GET">GET</SelectItem>
                       <SelectItem value="POST">POST</SelectItem>
                       <SelectItem value="PUT">PUT</SelectItem>
                       <SelectItem value="DELETE">DELETE</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
                 <div className="col-span-3">
                   <Label>URL</Label>
                   <Input 
                     value={data.httpRequest?.url || ''}
                     placeholder="https://api.example.com/v1/resource"
                     onChange={(e) => setData({
                       ...data,
                       httpRequest: { ...(data.httpRequest || { method: 'GET' }), url: e.target.value }
                     })}
                   />
                 </div>
               </div>

               <div className="space-y-2">
                 <div className="flex items-center justify-between">
                   <Label>Headers</Label>
                   <Button variant="ghost" size="sm" onClick={addHeader} className="h-6 px-2">
                     <Plus className="h-3 w-3 mr-1" /> 추가
                   </Button>
                 </div>
                 {data.httpRequest?.headers?.map((header, idx) => (
                   <div key={idx} className="flex gap-2 items-center">
                     <Input 
                       placeholder="Key" 
                       value={header.key} 
                       onChange={(e) => updateHeader(idx, 'key', e.target.value)}
                       className="flex-1"
                     />
                     <Input 
                       placeholder="Value" 
                       value={header.value} 
                       onChange={(e) => updateHeader(idx, 'value', e.target.value)}
                       className="flex-1"
                     />
                     <Button variant="ghost" size="icon" onClick={() => removeHeader(idx)} className="h-9 w-9">
                       <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                     </Button>
                   </div>
                 ))}
                 {(!data.httpRequest?.headers || data.httpRequest.headers.length === 0) && (
                   <div className="text-xs text-muted-foreground text-center py-2 border border-dashed rounded">
                     헤더가 없습니다.
                   </div>
                 )}
               </div>

               <div className="space-y-2">
                 <Label>Body (JSON)</Label>
                 <div className="relative">
                   <Textarea 
                     id={`node-http-body-${node.id}`}
                     className="min-h-[150px] font-mono text-sm"
                     placeholder="{ 'key': 'value' }"
                     value={data.httpRequest?.body || ''}
                     onChange={(e) => setData({
                       ...data,
                       httpRequest: { ...data.httpRequest!, body: e.target.value }
                     })}
                   />
                   <AdvancedVariableAutocomplete
                     value={data.httpRequest?.body || ''}
                     onChange={(newValue) => setData({
                       ...data,
                       httpRequest: { ...data.httpRequest!, body: newValue }
                     })}
                     textareaId={`node-http-body-${node.id}`}
                   />
                 </div>
                 <p className="text-xs text-muted-foreground">
                   POST/PUT 요청 시 전송할 데이터입니다. 변수 사용 가능.
                 </p>
               </div>
             </div>
          )}

          {node.type === 'action' && data.actionType === 'medication_reminder' && (
            <div className="space-y-4 border p-4 rounded-md bg-muted/20">
              <div className="space-y-2">
                <Label>약물 이름 *</Label>
                <Input 
                  value={data.medication?.name || ''}
                  placeholder="예: 항생제 안약"
                  onChange={(e) => setData({ 
                    ...data, 
                    medication: { ...(data.medication || { frequency: '', times: [], duration: 7, instructions: '' }), name: e.target.value } 
                  })} 
                />
              </div>

              <div className="space-y-2">
                <Label>복용 횟수 *</Label>
                <Input 
                  value={data.medication?.frequency || ''}
                  placeholder="예: 4회/일"
                  onChange={(e) => setData({ 
                    ...data, 
                    medication: { ...(data.medication || { name: '', times: [], duration: 7, instructions: '' }), frequency: e.target.value } 
                  })} 
                />
              </div>

              <div className="space-y-2">
                <Label>복약 시간 * (HH:MM 형식, 여러 개는 쉼표로 구분)</Label>
                <Input 
                  value={data.medication?.times?.join(', ') || ''}
                  placeholder="예: 08:00, 12:00, 18:00, 22:00"
                  onChange={(e) => {
                    const times = e.target.value.split(',').map(t => t.trim()).filter(t => t);
                    setData({ 
                      ...data, 
                      medication: { ...(data.medication || { name: '', frequency: '', duration: 7, instructions: '' }), times } 
                    });
                  }} 
                />
                <p className="text-xs text-muted-foreground">
                  복약 시간을 HH:MM 형식으로 입력하세요. 여러 시간은 쉼표로 구분합니다.
                </p>
              </div>

              <div className="space-y-2">
                <Label>복약 기간 (일) *</Label>
                <Input 
                  type="number"
                  min="1"
                  value={data.medication?.duration || 7}
                  onChange={(e) => setData({ 
                    ...data, 
                    medication: { ...(data.medication || { name: '', frequency: '', times: [], instructions: '' }), duration: parseInt(e.target.value) || 7 } 
                  })} 
                />
              </div>

              <div className="space-y-2">
                <Label>복용 방법 *</Label>
                <Textarea 
                  value={data.medication?.instructions || ''}
                  placeholder="예: 1방울씩 점안"
                  onChange={(e) => setData({ 
                    ...data, 
                    medication: { ...(data.medication || { name: '', frequency: '', times: [], duration: 7 }), instructions: e.target.value } 
                  })} 
                />
              </div>
            </div>
          )}

          {node.type === 'action' && (data.actionType === 'send_kakao' || data.actionType === 'send_sms' || data.actionType === 'send_email') && (
            <div className="space-y-4 border p-4 rounded-md bg-muted/20">
              
              {/* Email Subject Input */}
              {data.actionType === 'send_email' && (
                <div className="space-y-2">
                  <Label>이메일 제목</Label>
                  <Input 
                    value={data.emailConfig?.subject || ''}
                    placeholder="이메일 제목을 입력하세요"
                    onChange={(e) => setData({ 
                      ...data, 
                      emailConfig: { ...(data.emailConfig || {}), subject: e.target.value } 
                    })} 
                  />
                </div>
              )}
              
              {/* Kakao AlimTalk Template Code Input */}
              {data.actionType === 'send_kakao' && (
                <div className="space-y-2">
                  <Label>알림톡 템플릿 코드 (선택사항)</Label>
                  <Input 
                    value={data.templateId || ''}
                    placeholder="예: hello_01 (NHN Cloud 콘솔의 템플릿 코드)"
                    onChange={(e) => setData({ ...data, templateId: e.target.value })} 
                  />
                  <p className="text-xs text-muted-foreground">
                    입력 시 <strong>알림톡</strong>으로 발송되며, 미입력 시 <strong>친구톡(텍스트)</strong>으로 발송됩니다.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label>메시지 내용 {data.actionType === 'send_kakao' && data.templateId && '(변수 매핑용 / 대체 메시지)'}</Label>
                <div className="relative">
                  <Textarea 
                    id={`node-message-${node.id}`}
                    className="min-h-[200px] font-mono text-sm"
                    placeholder="메시지를 입력하세요. {{ 입력 시 변수 자동완성이 표시됩니다."
                    value={data.message_template || ''}
                    onChange={(e) => setData({ ...data, message_template: e.target.value })}
                  />
                  <AdvancedVariableAutocomplete
                    value={data.message_template || ''}
                    onChange={(newValue) => setData({ ...data, message_template: newValue })}
                    textareaId={`node-message-${node.id}`}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  💡 <code className="bg-muted px-1 rounded">{`{{`}</code> 입력 시 변수 자동완성
                </p>
              </div>
            </div>
          )}

          {node.type === 'condition' && (
             <div className="space-y-4 border p-4 rounded-md bg-muted/20">
              <div className="space-y-2">
                <Label>변수</Label>
                <Select 
                  value={data.condition?.variable || 'surgery_type'}
                  onValueChange={(val) => setData({
                    ...data,
                    condition: { ...(data.condition || { operator: 'equals', value: '' }), variable: val }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="surgery_type">수술 종류</SelectItem>
                    <SelectItem value="patient_gender">환자 성별</SelectItem>
                    <SelectItem value="age">나이</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>조건</Label>
                <Select 
                  value={data.condition?.operator || 'equals'}
                  onValueChange={(val) => setData({
                    ...data,
                    condition: { ...(data.condition || { variable: 'surgery_type', value: '' }), operator: val }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">같음 (=)</SelectItem>
                    <SelectItem value="not_equals">다름 (!=)</SelectItem>
                    <SelectItem value="contains">포함</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>값</Label>
                <Input 
                  value={data.condition?.value || ''}
                  placeholder="예: lasik, male, 30"
                  onChange={(e) => setData({
                    ...data,
                    condition: { ...(data.condition || { variable: 'surgery_type', operator: 'equals' }), value: e.target.value }
                  })}
                />
              </div>
             </div>
          )}

          {node.type === 'time_window' && (
             <div className="space-y-4 border p-4 rounded-md bg-muted/20">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>시작 시간</Label>
                  <Input 
                    type="time" 
                    value={data.timeWindow?.startTime || "09:00"}
                    onChange={(e) => setData({
                      ...data,
                      timeWindow: { ...(data.timeWindow || { endTime: "18:00" }), startTime: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>종료 시간</Label>
                  <Input 
                    type="time" 
                    value={data.timeWindow?.endTime || "18:00"}
                    onChange={(e) => setData({
                      ...data,
                      timeWindow: { ...(data.timeWindow || { startTime: "09:00" }), endTime: e.target.value }
                    })}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                이 시간대 외에는 다음 단계로 넘어가지 않고 대기합니다. (익일 해당 시간대까지)
              </p>
             </div>
          )}
        </div>

        <div className="mt-8 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={handleSave}>설정 저장</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
