"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Copy, Trash2, CheckCircle2, XCircle, History } from "lucide-react";
import { toast } from "sonner";
import { MarketingTemplate } from "@/lib/template-types";
import Link from "next/link";
import {
  useWebhooks,
  useCreateWebhook,
  useToggleWebhook,
  useDeleteWebhook,
} from "@/lib/queries/webhooks";

export default function WebhooksPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [webhookToDelete, setWebhookToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    workflow_id: "",
    enabled: true,
  });

  // 템플릿 목록 (localStorage에서 가져오기)
  const [templates, setTemplates] = useState<MarketingTemplate[]>([]);

  useEffect(() => {
    try {
      const savedTemplates = localStorage.getItem("marketing_templates");
      if (savedTemplates) {
        const parsed = JSON.parse(savedTemplates);
        setTemplates(parsed);
      }
    } catch (error) {
      console.error("템플릿 목록 조회 오류:", error);
    }
  }, []);

  // React Query hooks
  const { data: webhooks = [], isLoading, error } = useWebhooks();
  const createWebhookMutation = useCreateWebhook();
  const toggleWebhookMutation = useToggleWebhook();
  const deleteWebhookMutation = useDeleteWebhook();

  const handleAddWebhook = async () => {
    try {
      if (!formData.name) {
        toast.error("웹훅 이름은 필수입니다.");
        return;
      }

      await createWebhookMutation.mutateAsync(formData);
      toast.success("웹훅이 생성되었습니다.");
      setIsAddDialogOpen(false);
      setFormData({ name: "", workflow_id: "", enabled: true });
    } catch (error: any) {
      toast.error(error.message || "웹훅 생성 중 오류가 발생했습니다.");
    }
  };

  const handleToggleWebhook = async (webhookId: string, enabled: boolean) => {
    try {
      await toggleWebhookMutation.mutateAsync({ id: webhookId, enabled });
      toast.success(`웹훅이 ${enabled ? "활성화" : "비활성화"}되었습니다.`);
    } catch (error: any) {
      toast.error(error.message || "웹훅 상태 변경 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteWebhook = async () => {
    if (!webhookToDelete) return;

    try {
      await deleteWebhookMutation.mutateAsync(webhookToDelete);
      toast.success("웹훅이 삭제되었습니다.");
      setIsDeleteDialogOpen(false);
      setWebhookToDelete(null);
    } catch (error: any) {
      toast.error(error.message || "웹훅 삭제 중 오류가 발생했습니다.");
    }
  };

  const copyWebhookUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("웹훅 URL이 복사되었습니다.");
  };

  const getTemplateName = (templateId?: string) => {
    if (!templateId) return "없음";
    const template = templates.find((t) => t.id === templateId);
    return template?.name || "알 수 없음";
  };

  // 에러 처리
  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-destructive">웹훅 목록을 불러오는 중 오류가 발생했습니다.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            새로고침
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">웹훅</h1>
          <p className="text-muted-foreground">
            외부 시스템에서 워크플로우를 트리거할 수 있는 웹훅을 관리하세요
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/webhooks/executions">
            <Button variant="outline">
              <History className="mr-2 h-4 w-4" />
              실행 이력
            </Button>
          </Link>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setFormData({ name: "", workflow_id: "", enabled: true })}>
                <Plus className="mr-2 h-4 w-4" />
                웹훅 생성
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>웹훅 생성</DialogTitle>
                <DialogDescription>
                  외부 시스템에서 호출할 수 있는 웹훅을 생성하세요
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">웹훅 이름 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="예: 예약 시스템 연동"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workflow_id">연결된 템플릿 (선택사항)</Label>
                  <Select
                    value={formData.workflow_id}
                    onValueChange={(value) => setFormData({ ...formData, workflow_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="템플릿을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">없음</SelectItem>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  취소
                </Button>
                <Button
                  onClick={handleAddWebhook}
                  disabled={createWebhookMutation.isPending}
                >
                  {createWebhookMutation.isPending ? "생성 중..." : "생성"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 웹훅 목록 */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : webhooks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            등록된 웹훅이 없습니다. 웹훅을 생성하여 외부 시스템과 연동하세요.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {webhooks.map((webhook) => (
            <Card key={webhook.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{webhook.name}</CardTitle>
                      {webhook.enabled ? (
                        <Badge className="bg-green-500">
                          <CheckCircle2 className="h-3 w-3 mr-1" />활성
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <XCircle className="h-3 w-3 mr-1" />비활성
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      템플릿: {getTemplateName(webhook.workflow_id)}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={webhook.enabled}
                      onCheckedChange={(enabled) => handleToggleWebhook(webhook.id, enabled)}
                      disabled={toggleWebhookMutation.isPending}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyWebhookUrl(webhook.url)}
                      title="URL 복사"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setWebhookToDelete(webhook.id)}
                      title="삭제"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium">웹훅 URL:</Label>
                    <code className="text-xs bg-muted px-2 py-1 rounded flex-1">
                      {webhook.url}
                    </code>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    생성일: {new Date(webhook.created_at).toLocaleString("ko-KR")}
                  </div>
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-2">사용 예시:</p>
                    <pre className="text-xs overflow-x-auto">
{`curl -X POST ${webhook.url} \\
  -H "Content-Type: application/json" \\
  -d '{
    "patient_id": "patient-uuid",
    "appointment_id": "appointment-uuid",
    "variables": {
      "custom_var": "value"
    }
  }'`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>웹훅 삭제</DialogTitle>
            <DialogDescription>
              정말로 이 웹훅을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteWebhook}
              disabled={deleteWebhookMutation.isPending}
            >
              {deleteWebhookMutation.isPending ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
