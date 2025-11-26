"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { workflowTemplates, WorkflowTemplate } from "@/lib/workflow-templates";
import { Eye, Copy, Plus, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface WorkflowTemplateSelectorProps {
  onSelectTemplate: (template: WorkflowTemplate) => void;
  onCreateWorkflow: (template: WorkflowTemplate) => void;
  onCancel: () => void;
}

export function WorkflowTemplateSelector({ onSelectTemplate, onCreateWorkflow, onCancel }: WorkflowTemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTemplates = useMemo(() => {
    if (selectedCategory === 'all') return workflowTemplates;
    return workflowTemplates.filter(t => t.category === selectedCategory);
  }, [selectedCategory]);

  const handleSelectTemplate = (template: WorkflowTemplate) => {
    setSelectedTemplate(template);
    onSelectTemplate(template);
  };

  const handleCreateWorkflow = (template: WorkflowTemplate) => {
    onCreateWorkflow(template);
  };

  const handlePreviewTemplate = (template: WorkflowTemplate) => {
    setSelectedTemplate(template);
    setPreviewOpen(true);
  };

  const categoryLabels: Record<string, string> = {
    '안과': '안과',
    '성형외과': '성형외과',
    '공통': '공통',
    '화상 상담': '화상 상담',
  };

  const categoryColors: Record<string, string> = {
    '안과': 'bg-blue-500',
    '성형외과': 'bg-pink-500',
    '공통': 'bg-gray-500',
    '화상 상담': 'bg-purple-500',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          {onCancel && (
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-bold tracking-tight">워크플로우 템플릿</h2>
            <p className="text-muted-foreground">
              자주 사용하는 워크플로우를 템플릿에서 선택하여 빠르게 시작하세요.
            </p>
          </div>
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full md:w-auto">
          <TabsList className="grid w-full grid-cols-4 md:w-[400px]">
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="안과">안과</TabsTrigger>
            <TabsTrigger value="성형외과">성형외과</TabsTrigger>
            <TabsTrigger value="공통">공통</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer border-t-4 border-t-transparent hover:border-t-primary group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">{template.name}</CardTitle>
                  <CardDescription className="text-sm line-clamp-2 h-10">
                    {template.description}
                  </CardDescription>
                </div>
                <Badge className={categoryColors[template.category]}>
                  {categoryLabels[template.category]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {template.nodes.length}개 노드 • {template.edges.length}개 연결
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePreviewTemplate(template)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    선택
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleCreateWorkflow(template)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    생성
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Template Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTemplate?.name}
              <Badge className={categoryColors[selectedTemplate?.category || '공통']}>
                {categoryLabels[selectedTemplate?.category || '공통']}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              {selectedTemplate?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto">
            <div className="space-y-6">
              {/* Template Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">템플릿 정보</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">카테고리:</span> {categoryLabels[selectedTemplate?.category || '공통']}</div>
                    <div><span className="font-medium">노드 수:</span> {selectedTemplate?.nodes.length}</div>
                    <div><span className="font-medium">연결 수:</span> {selectedTemplate?.edges.length}</div>
                    {selectedTemplate?.targetSurgery && (
                      <div><span className="font-medium">대상 수술:</span> {selectedTemplate.targetSurgery}</div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">워크플로우 구조</h4>
                  <div className="space-y-1 text-sm">
                    {selectedTemplate?.nodes.map((node, index) => (
                      <div key={node.id} className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {node.type === 'trigger' ? '트리거' :
                           node.type === 'action' ? '액션' :
                           node.type === 'delay' ? '지연' :
                           node.type === 'condition' ? '조건' : node.type}
                        </Badge>
                        <span>{node.data.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Node Details */}
              <div>
                <h4 className="font-semibold mb-3">노드 상세 정보</h4>
                <div className="space-y-3">
                  {selectedTemplate?.nodes.map((node, index) => (
                    <Card key={node.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <Badge variant="outline">
                          {node.type === 'trigger' ? '트리거' :
                           node.type === 'action' ? '액션' :
                           node.type === 'delay' ? '지연' :
                           node.type === 'condition' ? '조건' : node.type}
                        </Badge>
                        <div className="flex-1">
                          <div className="font-medium">{node.data.label}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {node.type === 'delay' && node.data.delay && (
                              <span>
                                {node.data.delay.value}{node.data.delay.type === 'minutes' ? '분' :
                                                       node.data.delay.type === 'hours' ? '시간' :
                                                       '일'} 대기
                              </span>
                            )}
                            {node.type === 'action' && node.data.actionType && (
                              <span>
                                {node.data.actionType === 'send_kakao' ? '카카오톡 발송' :
                                 node.data.actionType === 'send_sms' ? 'SMS 발송' :
                                 node.data.actionType === 'send_coupon' ? '쿠폰 발송' :
                                 node.data.actionType === 'request_review' ? '후기 요청' :
                                 node.data.actionType}
                              </span>
                            )}
                            {node.type === 'condition' && node.data.condition && (
                              <span>
                                조건: {node.data.condition.variable} {node.data.condition.operator} {node.data.condition.value}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              닫기
            </Button>
            <Button onClick={() => handleCreateWorkflow(selectedTemplate!)}>
              <Plus className="h-4 w-4 mr-2" />
              이 템플릿으로 워크플로우 생성
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
