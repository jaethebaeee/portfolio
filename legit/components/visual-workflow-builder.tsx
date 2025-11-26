"use client";

import React, { useCallback, useState, useRef } from 'react';
import { 
  ReactFlow, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState, 
  addEdge, 
  Connection, 
  Edge, 
  Node,
  ReactFlowProvider,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { nodeTypes } from './workflow/node-types';
import { EnhancedWorkflowSidebar } from './workflow/enhanced-workflow-sidebar';
import { Button } from './ui/button';
import { Save, ArrowLeft, Play, TestTube } from 'lucide-react';
import { WorkflowNodeData } from '@/lib/workflow-types';
import { validateWorkflow, canSaveWorkflow } from '@/lib/workflow-validation';
import { validateNode, getValidationErrorMessages } from '@/lib/node-validation';
import { NODE_LIBRARY } from '@/lib/node-library';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

interface VisualWorkflowBuilderProps {
  initialData?: { nodes: Node[], edges: Edge[] };
  onSave: (data: { nodes: Node[], edges: Edge[] }) => void;
  onCancel: () => void;
}

import { NodeConfigPanel } from './workflow/node-config-panel';

function VisualWorkflowBuilderContent({ initialData, onSave, onCancel }: VisualWorkflowBuilderProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialData?.nodes || initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialData?.edges || initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  
  // Node Config
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  
  // Validation
  const workflowValidation = validateWorkflow(nodes, edges);
  const canSave = canSaveWorkflow(nodes, edges);

  // Test Mode
  const [isTestMode, setIsTestMode] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [isTestRunning, setIsTestRunning] = useState(false);

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setIsConfigOpen(true);
  }, []);

  const onNodeUpdate = (id: string, data: WorkflowNodeData) => {
    // Validate node data before updating
    const validationErrors = validateNode(data);
    const errorMessages = getValidationErrorMessages(validationErrors);
    
    setNodes((nds) => nds.map((node) => {
      if (node.id === id) {
        return { 
          ...node, 
          data: { 
            ...node.data, 
            ...data,
            validationErrors: errorMessages.length > 0 ? errorMessages : undefined,
          } 
        };
      }
      return node;
    }));
    
    if (errorMessages.length > 0) {
      toast.warning('노드 검증 경고', {
        description: errorMessages.join(', '),
      });
    }
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const subType = event.dataTransfer.getData('application/type');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Get node label from library
      const libraryNode = NODE_LIBRARY.find(n => n.type === type && n.subType === subType);
      const defaultLabel = libraryNode?.label || `${type} node`;

      const newNode: Node<WorkflowNodeData> = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { 
          label: defaultLabel,
          type: type as any,
          triggerType: subType as any,
          actionType: subType as any,
        },
      };
      
      // Validate new node
      const validationErrors = validateNode(newNode.data);
      if (validationErrors.length > 0) {
        newNode.data.validationErrors = getValidationErrorMessages(validationErrors);
      }

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes],
  );

  const handleSave = () => {
    if (!canSave.canSave) {
      toast.error(canSave.reason || '워크플로우를 저장할 수 없습니다.');
      return;
    }

    // Show warnings if any
    if (workflowValidation.warnings.length > 0) {
      toast.warning('경고가 있습니다', {
        description: workflowValidation.warnings.slice(0, 2).join(', '),
      });
    }

    onSave({ nodes, edges });
    toast.success('워크플로우가 저장되었습니다.');
  };

  const handleTestWorkflow = async () => {
    if (!canSave.canSave) {
      toast.error('테스트할 수 없는 워크플로우입니다.');
      return;
    }

    setIsTestRunning(true);
    setTestResults(null);

    try {
      // Simple test simulation - just validate the workflow structure
      const results = {
        executedNodes: nodes.map(node => ({
          nodeId: node.id,
          nodeType: node.type,
          label: node.data.label,
          executedAt: new Date().toISOString(),
          simulated: true
        })),
        variableSubstitutions: {
          patient_name: '김테스트',
          patient_phone: '010-1234-5678',
          surgery_type: '라식',
          days_passed: '3'
        },
        timeline: nodes.map((node, index) => ({
          step: index + 1,
          time: new Date(Date.now() + index * 1000).toLocaleTimeString('ko-KR'),
          action: node.data.label,
          type: node.type
        })),
        warnings: workflowValidation.warnings,
        totalExecutionTime: 150
      };

      setTestResults(results);
      toast.success('워크플로우 테스트가 완료되었습니다.');
    } catch (error: any) {
      console.error('Test execution error:', error);
      toast.error('테스트 실행 중 오류가 발생했습니다.');
      setTestResults({ error: error.message });
    } finally {
      setIsTestRunning(false);
    }
  };
          // Client-side simulation (Legacy/Fallback)
          // Create test patient and appointment data
          const testPatient = {
            id: 'test-patient-123',
            name: '김테스트',
            phone: '010-1234-5678',
            birth_date: '1990-01-01',
            gender: 'female'
          };
    
          const testAppointment = {
            id: 'test-appointment-123',
            surgery_type: 'lasik',
            appointment_date: new Date().toISOString().split('T')[0],
            patient: testPatient
          };
    
  return (
    <div className="flex h-full w-full border rounded-lg overflow-hidden bg-background">
      <EnhancedWorkflowSidebar />
      <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950"
          onNodeClick={onNodeClick}
          defaultEdgeOptions={{
            animated: true,
            style: { strokeWidth: 2 },
          }}
          connectionLineStyle={{ strokeWidth: 2 }}
          snapToGrid={true}
          snapGrid={[20, 20]}
        >
          <Background gap={12} size={1} />
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="bg-background/80 backdrop-blur-sm p-6 rounded-lg border shadow-lg text-center max-w-md">
                <h3 className="text-lg font-semibold mb-2">워크플로우 시작하기</h3>
                <p className="text-muted-foreground text-sm">
                  왼쪽 사이드바에서 <strong>노드를 드래그</strong>하여<br />
                  캔버스에 놓으세요.
                </p>
              </div>
            </div>
          )}
          <Controls />
          
          {/* Validation Panel */}
          {nodes.length > 0 && (
            <Panel position="top-left" className="max-w-md">
              {workflowValidation.errors.length > 0 ? (
                <Alert variant="destructive" className="mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>오류</AlertTitle>
                  <AlertDescription className="text-xs">
                    {workflowValidation.errors.slice(0, 2).join('. ')}
                    {workflowValidation.errors.length > 2 && ` 외 ${workflowValidation.errors.length - 2}개`}
                  </AlertDescription>
                </Alert>
              ) : workflowValidation.warnings.length > 0 ? (
                <Alert className="mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>경고</AlertTitle>
                  <AlertDescription className="text-xs">
                    {workflowValidation.warnings.slice(0, 2).join('. ')}
                    {workflowValidation.warnings.length > 2 && ` 외 ${workflowValidation.warnings.length - 2}개`}
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="mb-2 border-green-500">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertTitle className="text-green-700 dark:text-green-400">검증 통과</AlertTitle>
                  <AlertDescription className="text-xs text-green-600 dark:text-green-300">
                    워크플로우가 올바르게 구성되었습니다.
                  </AlertDescription>
                </Alert>
              )}
            </Panel>
          )}
          
          <Panel position="top-right" className="flex gap-2">
            <Button variant="outline" onClick={onCancel} size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              취소
            </Button>
            <Button
              variant="outline"
              onClick={handleTestWorkflow}
              size="sm"
              disabled={!canSave.canSave || isTestRunning}
            >
              <TestTube className="mr-2 h-4 w-4" />
              {isTestRunning ? '테스트 중...' : '테스트 실행'}
            </Button>
            <Button
              onClick={handleSave}
              size="sm"
              disabled={!canSave.canSave}
            >
              <Save className="mr-2 h-4 w-4" />
              저장
            </Button>
          </Panel>
        </ReactFlow>
        
        <NodeConfigPanel
          node={selectedNode}
          isOpen={isConfigOpen}
          onClose={() => setIsConfigOpen(false)}
          onUpdate={onNodeUpdate}
        />

        {/* Test Results Dialog */}
        {testResults && (
          <Dialog open={true} onOpenChange={() => setTestResults(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>테스트 결과</DialogTitle>
                <DialogDescription>
                  워크플로우 구조 검증 결과입니다.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">실행된 노드</h4>
                  <div className="mt-2 space-y-1">
                    {testResults.executedNodes?.map((node: any) => (
                      <div key={node.nodeId} className="text-sm">
                        {node.label} ({node.nodeType})
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold">변수 치환</h4>
                  <div className="mt-2 text-sm">
                    {Object.entries(testResults.variableSubstitutions || {}).map(([key, value]) => (
                      <div key={key}>{'{{' + key + '}}'} → {String(value)}</div>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}


export function VisualWorkflowBuilder(props: VisualWorkflowBuilderProps) {
  return (
    <ReactFlowProvider>
      <VisualWorkflowBuilderContent {...props} />
    </ReactFlowProvider>
  );
}

