"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Save, ArrowRight, MessageSquare, Camera, ClipboardCheck } from "lucide-react";
import { Workflow, WorkflowStep, WorkflowStepType } from "@/lib/workflow-types";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface WorkflowBuilderProps {
  workflow?: Partial<Workflow>;
  onSave: (workflow: Partial<Workflow>) => void;
  onCancel: () => void;
}

export function WorkflowBuilder({ workflow: initialWorkflow, onSave, onCancel }: WorkflowBuilderProps) {
  const [workflow, setWorkflow] = useState<Partial<Workflow>>(initialWorkflow || {
    name: "",
    description: "",
    trigger_type: "post_surgery",
    steps: [],
    is_active: true
  });

  const addStep = () => {
    const newStep: WorkflowStep = {
      day: 1,
      type: 'survey',
      title: '새 단계',
      message_template: ''
    };
    setWorkflow({
      ...workflow,
      steps: [...(workflow.steps || []), newStep]
    });
  };

  const updateStep = (index: number, field: keyof WorkflowStep, value: any) => {
    const newSteps = [...(workflow.steps || [])];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setWorkflow({ ...workflow, steps: newSteps });
  };

  const removeStep = (index: number) => {
    const newSteps = [...(workflow.steps || [])];
    newSteps.splice(index, 1);
    setWorkflow({ ...workflow, steps: newSteps });
  };

  const handleSave = () => {
    if (!workflow.name) {
      toast.error("워크플로우 이름을 입력해주세요.");
      return;
    }
    if (!workflow.steps || workflow.steps.length === 0) {
      toast.error("최소 하나 이상의 단계가 필요합니다.");
      return;
    }
    onSave(workflow);
  };

  const getStepIcon = (type: WorkflowStepType) => {
    switch (type) {
      case 'survey': return <ClipboardCheck className="h-5 w-5 text-blue-500" />;
      case 'photo': return <Camera className="h-5 w-5 text-purple-500" />;
      default: return <MessageSquare className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">워크플로우 이름</Label>
          <Input
            id="name"
            value={workflow.name}
            onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
            placeholder="예: 라식 수술 해피콜"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">설명</Label>
          <Textarea
            id="description"
            value={workflow.description}
            onChange={(e) => setWorkflow({ ...workflow, description: e.target.value })}
            placeholder="이 워크플로우의 목적을 설명해주세요"
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch 
            checked={workflow.is_active}
            onCheckedChange={(checked) => setWorkflow({ ...workflow, is_active: checked })}
          />
          <Label>활성화</Label>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">진행 단계 (Steps)</h3>
          <Button onClick={addStep} variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            단계 추가
          </Button>
        </div>

        <div className="relative space-y-6 before:absolute before:inset-0 before:ml-6 before:h-full before:w-0.5 before:-translate-x-1/2 before:bg-border before:content-['']">
          {workflow.steps?.map((step, index) => (
            <Card key={index} className="relative ml-12">
              <div className="absolute -left-12 top-6 flex h-12 w-12 items-center justify-center rounded-full border bg-background shadow-sm">
                {getStepIcon(step.type)}
              </div>
              <div className="absolute -left-12 top-20 flex w-12 justify-center">
                <Badge variant="outline" className="bg-background">
                  Day {step.day}
                </Badge>
              </div>
              
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Step {index + 1}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeStep(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>수술 후 경과일 (Day)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={step.day}
                      onChange={(e) => updateStep(index, 'day', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>유형</Label>
                    <Select
                      value={step.type}
                      onValueChange={(value: WorkflowStepType) => updateStep(index, 'type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="survey">설문/상태 체크 (Survey)</SelectItem>
                        <SelectItem value="photo">사진 요청 (Photo)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>단계 제목 (내부용)</Label>
                  <Input
                    value={step.title || ''}
                    onChange={(e) => updateStep(index, 'title', e.target.value)}
                    placeholder="예: 통증 확인"
                  />
                </div>

                <div className="space-y-2">
                  <Label>발송 메시지</Label>
                  <Textarea
                    value={step.message_template || ''}
                    onChange={(e) => updateStep(index, 'message_template', e.target.value)}
                    placeholder={step.type === 'survey' 
                      ? "안녕하세요, 수술 후 상태는 어떠신가요? 버튼을 눌러 알려주세요."
                      : "수술 부위 확인을 위해 사진을 업로드해주세요."
                    }
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    * {{patient_name}} 변수 사용 가능. 메시지 하단에 자동으로 '{step.type === 'survey' ? '상태 체크하기' : '사진 업로드하기'}' 버튼이 추가됩니다.
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {(!workflow.steps || workflow.steps.length === 0) && (
            <div className="ml-12 flex h-32 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
              단계를 추가하여 워크플로우를 구성하세요
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>취소</Button>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          저장하기
        </Button>
      </div>
    </div>
  );
}

