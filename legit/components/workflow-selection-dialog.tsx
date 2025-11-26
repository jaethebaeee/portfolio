"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWorkflows } from "@/lib/queries/workflows"; // Assuming this exists or I need to create it
import { Workflow } from "@/lib/database.types";
import { Loader2, Play } from "lucide-react";
import { getWorkflows } from "@/lib/workflows"; // Direct import if hook not available
import { useAuth } from "@clerk/nextjs";

interface WorkflowSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onConfirm: (workflowId: string) => Promise<void>;
}

export function WorkflowSelectionDialog({ open, onOpenChange, selectedCount, onConfirm }: WorkflowSelectionDialogProps) {
  const { userId } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>("");
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    if (open && userId) {
      setLoading(true);
      getWorkflows(userId)
        .then(setWorkflows)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [open, userId]);

  const handleConfirm = async () => {
    if (!selectedWorkflowId) return;
    setExecuting(true);
    try {
      await onConfirm(selectedWorkflowId);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>워크플로우 실행 ({selectedCount}명)</DialogTitle>
          <DialogDescription>
            선택한 환자들에게 실행할 워크플로우를 선택하세요.
            <br />
            주로 <strong>"안부 인사"</strong>, <strong>"이벤트 안내"</strong> 등이 적합합니다.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="workflow">워크플로우 선택</Label>
            <Select value={selectedWorkflowId} onValueChange={setSelectedWorkflowId}>
              <SelectTrigger id="workflow">
                <SelectValue placeholder={loading ? "로딩 중..." : "워크플로우를 선택하세요"} />
              </SelectTrigger>
              <SelectContent>
                {workflows.map((wf) => (
                  <SelectItem key={wf.id} value={wf.id}>
                    {wf.name}
                  </SelectItem>
                ))}
                {workflows.length === 0 && !loading && (
                  <SelectItem value="none" disabled>
                    사용 가능한 워크플로우가 없습니다.
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedWorkflowId || executing}>
            {executing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                실행 중...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                실행하기
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

