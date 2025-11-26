"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Play, Edit2, Trash2, Calendar, Users, FileText, Search, Send } from "lucide-react";
import { toast } from "sonner";
import { Campaign } from "@/lib/database.types";
import { MarketingTemplate } from "@/lib/template-types";
import { Patient } from "@/lib/database.types";
import { BulkCampaignBuilder } from "@/components/campaigns/bulk-campaign-builder";
import {
  useCampaigns,
  useCreateCampaign,
  useUpdateCampaign,
  useDeleteCampaign,
  useExecuteCampaign,
} from "@/lib/queries/campaigns";
import { usePatients } from "@/lib/queries/patients";

export default function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);
  const [executingCampaignId, setExecutingCampaignId] = useState<string | null>(null);
  const [isBulkCampaignOpen, setIsBulkCampaignOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    template_id: "",
    target_patients: [] as string[],
    scheduled_at: "",
    status: "draft" as "draft" | "scheduled" | "running" | "completed" | "cancelled",
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
  const { data: campaigns = [], isLoading, error } = useCampaigns(statusFilter);
  const { data: patients = [] } = usePatients();
  const createCampaignMutation = useCreateCampaign();
  const updateCampaignMutation = useUpdateCampaign();
  const deleteCampaignMutation = useDeleteCampaign();
  const executeCampaignMutation = useExecuteCampaign();

  // 캠페인 추가
  const handleAddCampaign = async () => {
    try {
      if (!formData.name || !formData.template_id) {
        toast.error("캠페인 이름과 템플릿은 필수입니다.");
        return;
      }

      await createCampaignMutation.mutateAsync(formData);
      toast.success("캠페인이 생성되었습니다.");
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "캠페인 추가 중 오류가 발생했습니다.");
    }
  };

  // 캠페인 실행
  const handleExecuteCampaign = async (campaignId: string) => {
    try {
      setExecutingCampaignId(campaignId);
      const result = await executeCampaignMutation.mutateAsync(campaignId);
      toast.success(
        `캠페인이 실행되었습니다. 성공: ${result.sentCount}건, 실패: ${result.failedCount}건`
      );
    } catch (error: any) {
      toast.error(error.message || "캠페인 실행 중 오류가 발생했습니다.");
    } finally {
      setExecutingCampaignId(null);
    }
  };

  // 캠페인 수정
  const handleUpdateCampaign = async () => {
    if (!editingCampaign) return;

    try {
      if (!formData.name || !formData.template_id) {
        toast.error("캠페인 이름과 템플릿은 필수입니다.");
        return;
      }

      await updateCampaignMutation.mutateAsync({
        id: editingCampaign.id,
        data: formData,
      });
      toast.success("캠페인 정보가 수정되었습니다.");
      setEditingCampaign(null);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "캠페인 수정 중 오류가 발생했습니다.");
    }
  };

  // 캠페인 삭제
  const handleDeleteCampaign = async () => {
    if (!campaignToDelete) return;

    try {
      await deleteCampaignMutation.mutateAsync(campaignToDelete.id);
      toast.success("캠페인이 삭제되었습니다.");
      setIsDeleteDialogOpen(false);
      setCampaignToDelete(null);
    } catch (error: any) {
      toast.error(error.message || "캠페인 삭제 중 오류가 발생했습니다.");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      template_id: "",
      target_patients: [],
      scheduled_at: "",
      status: "draft",
    });
  };

  const startEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      description: campaign.description || "",
      template_id: campaign.template_id || "",
      target_patients: (campaign.target_patients as string[]) || [],
      scheduled_at: campaign.scheduled_at || "",
      status: campaign.status,
    });
  };

  const confirmDelete = (campaign: Campaign) => {
    setCampaignToDelete(campaign);
    setIsDeleteDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">완료</Badge>;
      case "running":
        return <Badge className="bg-blue-500">실행 중</Badge>;
      case "scheduled":
        return <Badge className="bg-yellow-500">예정</Badge>;
      case "cancelled":
        return <Badge variant="destructive">취소</Badge>;
      default:
        return <Badge variant="outline">초안</Badge>;
    }
  };

  const getTemplateName = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    return template?.name || "알 수 없음";
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    const query = searchQuery.toLowerCase();
    return campaign.name.toLowerCase().includes(query);
  });

  // 에러 처리
  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-destructive">캠페인 목록을 불러오는 중 오류가 발생했습니다.</p>
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            캠페인
          </h1>
          <p className="text-muted-foreground text-lg">
            마케팅 캠페인을 생성하고 관리하세요
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsBulkCampaignOpen(true)}
          >
            <Send className="mr-2 h-4 w-4" />
            대량 캠페인
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                캠페인 생성
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>캠페인 생성</DialogTitle>
              <DialogDescription>
                새로운 마케팅 캠페인을 생성하세요
              </DialogDescription>
            </DialogHeader>
            <CampaignForm
              formData={formData}
              setFormData={setFormData}
              templates={templates}
              patients={patients}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                취소
              </Button>
              <Button
                onClick={handleAddCampaign}
                disabled={createCampaignMutation.isPending}
              >
                {createCampaignMutation.isPending ? "생성 중..." : "생성"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
        
        {/* Bulk Campaign Builder */}
        <BulkCampaignBuilder
          open={isBulkCampaignOpen}
          onOpenChange={setIsBulkCampaignOpen}
          onCampaignCreated={() => {
            // Refresh campaigns list
            window.location.reload();
          }}
        />
      </div>

      {/* 필터 및 검색 */}
      <Card className="shadow-md">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="캠페인 이름으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 transition-all duration-200 focus:ring-2"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="draft">초안</SelectItem>
                <SelectItem value="scheduled">예정</SelectItem>
                <SelectItem value="running">실행 중</SelectItem>
                <SelectItem value="completed">완료</SelectItem>
                <SelectItem value="cancelled">취소</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm font-medium text-muted-foreground bg-muted px-4 py-2 rounded-lg">
              총 {filteredCampaigns.length}개
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 캠페인 목록 */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
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
      ) : filteredCampaigns.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {searchQuery ? "검색 결과가 없습니다." : "등록된 캠페인이 없습니다."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {filteredCampaigns.map((campaign) => (
            <Card key={campaign.id} className="hover:shadow-lg transition-all duration-300 hover:border-primary/30 group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      {campaign.name}
                    </CardTitle>
                    <CardDescription className="mt-2 ml-11">
                      {campaign.description || "설명 없음"}
                    </CardDescription>
                  </div>
                  {getStatusBadge(campaign.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>템플릿: {campaign.template_id ? getTemplateName(campaign.template_id) : "없음"}</span>
                </div>
                {campaign.target_patients && (campaign.target_patients as string[]).length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>타겟 환자: {(campaign.target_patients as string[]).length}명</span>
                  </div>
                )}
                {campaign.scheduled_at && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      예정일: {new Date(campaign.scheduled_at).toLocaleString("ko-KR")}
                    </span>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  {(campaign.status === "draft" || campaign.status === "scheduled") && (
                    <Button
                      size="sm"
                      onClick={() => handleExecuteCampaign(campaign.id)}
                      disabled={executingCampaignId === campaign.id || executeCampaignMutation.isPending}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      {executingCampaignId === campaign.id ? "실행 중..." : "실행"}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(campaign)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => confirmDelete(campaign)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 수정 다이얼로그 */}
      {editingCampaign && (
        <Dialog open={!!editingCampaign} onOpenChange={() => setEditingCampaign(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>캠페인 정보 수정</DialogTitle>
              <DialogDescription>
                캠페인 정보를 수정하세요
              </DialogDescription>
            </DialogHeader>
            <CampaignForm
              formData={formData}
              setFormData={setFormData}
              templates={templates}
              patients={patients}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingCampaign(null)}>
                취소
              </Button>
              <Button
                onClick={handleUpdateCampaign}
                disabled={updateCampaignMutation.isPending}
              >
                {updateCampaignMutation.isPending ? "저장 중..." : "저장"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>캠페인 삭제</DialogTitle>
            <DialogDescription>
              정말로 {campaignToDelete?.name} 캠페인을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCampaign}
              disabled={deleteCampaignMutation.isPending}
            >
              {deleteCampaignMutation.isPending ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 캠페인 폼 컴포넌트
function CampaignForm({
  formData,
  setFormData,
  templates,
  patients,
}: {
  formData: any;
  setFormData: (data: any) => void;
  templates: MarketingTemplate[];
  patients: Patient[];
}) {
  const togglePatient = (patientId: string) => {
    if (formData.target_patients.includes(patientId)) {
      setFormData({
        ...formData,
        target_patients: formData.target_patients.filter((id: string) => id !== patientId),
      });
    } else {
      setFormData({
        ...formData,
        target_patients: [...formData.target_patients, patientId],
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">캠페인 이름 *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="예: 생일 할인 캠페인"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">설명</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="캠페인에 대한 설명을 입력하세요..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="template_id">템플릿 *</Label>
        <Select
          value={formData.template_id}
          onValueChange={(value) => setFormData({ ...formData, template_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="템플릿을 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>타겟 환자 (선택사항)</Label>
        <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
          {patients.length === 0 ? (
            <p className="text-sm text-muted-foreground">등록된 환자가 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {patients.map((patient) => (
                <div key={patient.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={patient.id}
                    checked={formData.target_patients.includes(patient.id)}
                    onCheckedChange={() => togglePatient(patient.id)}
                  />
                  <Label
                    htmlFor={patient.id}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {patient.name} ({patient.phone})
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          선택하지 않으면 모든 환자에게 발송됩니다.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="scheduled_at">예정일시 (선택사항)</Label>
          <Input
            id="scheduled_at"
            type="datetime-local"
            value={formData.scheduled_at}
            onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">상태</Label>
          <Select
            value={formData.status}
            onValueChange={(value: any) => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">초안</SelectItem>
              <SelectItem value="scheduled">예정</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
