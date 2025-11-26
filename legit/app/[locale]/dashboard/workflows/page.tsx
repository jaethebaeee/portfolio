"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Layout, Clock, History, Sparkles } from "lucide-react";
import { VisualWorkflowBuilder } from "@/components/visual-workflow-builder";
import { WorkflowTemplateSelector } from "@/components/workflow-template-selector";
import { Workflow } from "@/lib/database.types";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Node, Edge } from '@xyflow/react';
import { getWorkflows, createWorkflow, updateWorkflow, deleteWorkflow } from "@/lib/workflows";
import { WorkflowTemplate } from "@/lib/workflow-templates";
import { TestIncomingMessage } from "@/components/test-incoming-message";
import Link from "next/link";

export default function WorkflowsPage() {
  const { userId, isLoaded } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | undefined>(undefined);

  // Visual Builder Data
  const [initialNodes, setInitialNodes] = useState<Node[]>([]);
  const [initialEdges, setInitialEdges] = useState<Edge[]>([]);

  const fetchWorkflows = async () => {
    if (!userId) return;
    try {
      const data = await getWorkflows(userId);
      setWorkflows(data);
    } catch (error) {
      console.error(error);
      toast.error("워크플로우를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && userId) {
      fetchWorkflows();
    }
  }, [isLoaded, userId]);

  const handleSaveVisual = async (data: { nodes: Node[], edges: Edge[] }) => {
    if (!userId) return;

    try {
      const visualData = { nodes: data.nodes, edges: data.edges };
      
      // Convert visual nodes to steps for backward compatibility / logic processing
      const steps = data.nodes
        .filter(n => n.type === 'action' || n.type === 'survey' || n.type === 'photo')
        .map((n, i) => ({
          day: i + 1, // Simple logic for now, ideally derived from delay nodes
          type: (n.data.type === 'action' ? 'survey' : 'photo') as any,
          title: n.data.label as string,
          message_template: "자동 생성된 메시지"
        }));

      if (editingWorkflow) {
        // Update
        await updateWorkflow(userId, editingWorkflow.id, {
          visual_data: visualData,
          steps: steps,
          updated_at: new Date().toISOString()
        });
        toast.success("워크플로우가 수정되었습니다.");
      } else {
        // Create
        await createWorkflow(userId, {
          name: "새 워크플로우 " + (workflows.length + 1),
          description: "비주얼 빌더로 생성됨",
          trigger_type: "post_surgery",
          is_active: true,
          visual_data: visualData,
          steps: steps
        });
        toast.success("새 워크플로우가 생성되었습니다.");
      }

      setIsBuilderOpen(false);
      setEditingWorkflow(undefined);
      fetchWorkflows();
    } catch (error) {
      console.error(error);
      toast.error("저장에 실패했습니다.");
    }
  };

  const handleEdit = (workflow: Workflow) => {
    setEditingWorkflow(workflow);
    
    // Load visual data if exists
    if (workflow.visual_data && (workflow.visual_data as any).nodes) {
      setInitialNodes((workflow.visual_data as any).nodes);
      setInitialEdges((workflow.visual_data as any).edges);
    } else {
      setInitialNodes([]);
      setInitialEdges([]);
    }
    
    setIsBuilderOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!userId) return;
    if (confirm("정말 삭제하시겠습니까?")) {
      try {
        await deleteWorkflow(userId, id);
        toast.success("삭제되었습니다.");
        fetchWorkflows();
      } catch (error) {
        toast.error("삭제에 실패했습니다.");
      }
    }
  };

  const openNewBuilder = () => {
    setEditingWorkflow(undefined);
    setInitialNodes([]);
    setInitialEdges([]);
    setIsBuilderOpen(true);
  };

  const handleSelectTemplate = (template: WorkflowTemplate) => {
    setInitialNodes(template.nodes);
    setInitialEdges(template.edges);
    setIsTemplateSelectorOpen(false);
    setIsBuilderOpen(true);
  };

  const handleCreateFromTemplate = async (template: WorkflowTemplate) => {
    if (!userId) return;

    try {
      // Convert visual nodes to steps for backward compatibility / logic processing
      const steps = template.nodes
        .filter(n => n.type === 'action')
        .map((n, i) => ({
          day: i + 1,
          type: 'survey' as any,
          title: n.data.label as string,
          message_template: (n.data.message_template as string) || "템플릿에서 생성된 메시지"
        }));

      await createWorkflow(userId, {
        name: `${template.name} (복사본)`,
        description: template.description,
        trigger_type: "post_surgery",
        target_surgery_type: template.targetSurgery,
        is_active: false, // Start as inactive so user can review
        visual_data: { nodes: template.nodes, edges: template.edges },
        steps: steps
      });

      toast.success(`"${template.name}" 워크플로우가 생성되었습니다.`);
      fetchWorkflows();
    } catch (error) {
      console.error(error);
      toast.error("워크플로우 생성에 실패했습니다.");
    }
  };

  if (!isLoaded || loading) {
    return <div className="p-8">로딩 중...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 h-[calc(100vh-100px)]">
      {!isBuilderOpen ? (
        <>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                해피콜 워크플로우
              </h1>
              <p className="text-muted-foreground text-lg">
                드래그 앤 드롭으로 자동화 시나리오를 구성하세요
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/dashboard/workflows/executions">
                <Button variant="outline" size="lg">
                  <History className="mr-2 h-5 w-5" />
                  실행 이력
                </Button>
              </Link>
              <Link href="/dashboard/workflows/templates">
                <Button variant="outline" size="lg" className="shadow-lg hover:shadow-xl transition-all">
                  <Sparkles className="mr-2 h-5 w-5" />
                  템플릿 마켓플레이스
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsTemplateSelectorOpen(true)}
                className="shadow-lg hover:shadow-xl transition-all"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                기본 템플릿
              </Button>
              <Button onClick={openNewBuilder} size="lg" className="shadow-lg hover:shadow-xl transition-all">
                <Plus className="mr-2 h-5 w-5" />
                빈 워크플로우 만들기
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {workflows.map((workflow) => (
              <Card key={workflow.id} className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-t-4 border-t-primary/20 hover:border-t-primary" onClick={() => handleEdit(workflow)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Layout className="h-5 w-5 text-primary" />
                      <Badge variant={workflow.is_active ? "default" : "secondary"}>
                        {workflow.is_active ? "활성" : "비활성"}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="mt-2 text-xl">{workflow.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {workflow.description || "설명 없음"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>마지막 수정: {new Date(workflow.updated_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
                <div className="p-4 pt-0 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/dashboard/workflows/${workflow.id}/executions`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      실행 로그
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(workflow);
                  }}>편집</Button>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(workflow.id);
                  }}>삭제</Button>
                </div>
              </Card>
            ))}

            {workflows.length === 0 && (
              <div className="col-span-full text-center py-20 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                <Layout className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>등록된 워크플로우가 없습니다.</p>
                <Button variant="link" onClick={openNewBuilder} className="mt-2">
                  첫 워크플로우 만들기 &rarr;
                </Button>
              </div>
            )}
          </div>
          
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">개발자 도구</h2>
            <div className="grid gap-6 md:grid-cols-2">
               <TestIncomingMessage />
            </div>
          </div>
        </>
      ) : isTemplateSelectorOpen ? (
        <WorkflowTemplateSelector
          onSelectTemplate={handleSelectTemplate}
          onCreateWorkflow={handleCreateFromTemplate}
          onCancel={() => setIsTemplateSelectorOpen(false)}
        />
      ) : (
        <div className="h-full flex flex-col">
          <VisualWorkflowBuilder
            initialData={{ nodes: initialNodes, edges: initialEdges }}
            workflowId={editingWorkflow?.id}
            onSave={handleSaveVisual}
            onCancel={() => setIsBuilderOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
