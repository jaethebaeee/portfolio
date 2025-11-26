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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Calendar, Gift, Users, TrendingUp, Play, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { seasonalEventTemplates, SeasonalEvent } from "@/lib/event-crm";

interface EventCampaign {
  id: string;
  name: string;
  description?: string;
  event_type: string;
  start_date: string;
  end_date: string;
  discount_rate?: number;
  coupon_code?: string;
  enabled: boolean;
  created_at: string;
}

export default function EventCRMPage() {
  const [campaigns, setCampaigns] = useState<EventCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<SeasonalEvent | null>(null);
  const [customDiscount, setCustomDiscount] = useState<number>(15);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/event-campaigns");
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error("이벤트 캠페인 조회 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async () => {
    if (!selectedTemplate) {
      toast.error("템플릿을 선택하세요.");
      return;
    }

    try {
      const response = await fetch("/api/event-campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "seasonal",
          templateId: selectedTemplate.id,
          customConfig: {
            discount_rate: customDiscount,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "캠페인 생성에 실패했습니다.");
      }

      toast.success("이벤트 캠페인이 생성되었습니다.");
      setIsCreateDialogOpen(false);
      setSelectedTemplate(null);
      fetchCampaigns();
    } catch (error: any) {
      console.error("캠페인 생성 오류:", error);
      toast.error(error.message || "캠페인 생성 중 오류가 발생했습니다.");
    }
  };

  const handleExecuteCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/event-campaigns/${campaignId}/execute`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "캠페인 실행에 실패했습니다.");
      }

      const result = await response.json();
      toast.success(`캠페인이 실행되었습니다. (발송: ${result.sentCount}명)`);
      fetchCampaigns();
    } catch (error: any) {
      console.error("캠페인 실행 오류:", error);
      toast.error(error.message || "캠페인 실행 중 오류가 발생했습니다.");
    }
  };

  const getEventTypeBadge = (type: string) => {
    switch (type) {
      case "seasonal":
        return <Badge className="bg-blue-500">계절별</Badge>;
      case "birthday":
        return <Badge className="bg-pink-500">생일</Badge>;
      case "procedure_reminder":
        return <Badge className="bg-purple-500">시술 리마인더</Badge>;
      default:
        return <Badge variant="outline">커스텀</Badge>;
    }
  };

  const getCurrentMonthEvents = () => {
    const currentMonth = new Date().getMonth() + 1;
    return seasonalEventTemplates.filter((template) =>
      template.months.includes(currentMonth)
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">이벤트/생일 CRM</h1>
          <p className="text-muted-foreground">
            계절별 이벤트 및 생일 기반 마케팅 캠페인을 관리하세요
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              캠페인 생성
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>이벤트 캠페인 생성</DialogTitle>
              <DialogDescription>
                계절별 이벤트 템플릿을 선택하거나 생일 캠페인을 생성하세요
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="seasonal" className="w-full">
              <TabsList>
                <TabsTrigger value="seasonal">계절별 이벤트</TabsTrigger>
                <TabsTrigger value="birthday">생일 캠페인</TabsTrigger>
              </TabsList>
              <TabsContent value="seasonal" className="space-y-4">
                <div>
                  <Label>이벤트 템플릿 선택</Label>
                  <div className="grid gap-3 mt-2">
                    {seasonalEventTemplates.map((template) => (
                      <Card
                        key={template.id}
                        className={`cursor-pointer hover:shadow-md transition-shadow ${
                          selectedTemplate?.id === template.id
                            ? "ring-2 ring-primary"
                            : ""
                        }`}
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-base">{template.name}</CardTitle>
                              <CardDescription className="text-sm mt-1">
                                {template.description}
                              </CardDescription>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <Badge variant="outline">
                                  {template.months.length > 0
                                    ? `${template.months.join(", ")}월`
                                    : "연중"}
                                </Badge>
                                {template.target_segment.age_min && (
                                  <Badge variant="outline">
                                    {template.target_segment.age_min}-
                                    {template.target_segment.age_max}세
                                  </Badge>
                                )}
                                {template.target_segment.gender && (
                                  <Badge variant="outline">
                                    {template.target_segment.gender === "female"
                                      ? "여성"
                                      : "남성"}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-primary">
                                {template.default_discount_rate}%
                              </div>
                              <div className="text-xs text-muted-foreground">할인</div>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>
                {selectedTemplate && (
                  <div>
                    <Label>할인율 (%)</Label>
                    <Input
                      type="number"
                      value={customDiscount}
                      onChange={(e) =>
                        setCustomDiscount(parseInt(e.target.value) || 0)
                      }
                      min={0}
                      max={100}
                    />
                  </div>
                )}
              </TabsContent>
              <TabsContent value="birthday" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm">
                    생일 캠페인은 생일이 있는 환자에게 자동으로 할인 쿠폰을 발송합니다.
                  </p>
                </div>
                <div>
                  <Label>생일 며칠 전 발송?</Label>
                  <Input type="number" defaultValue={3} min={1} max={30} />
                </div>
                <div>
                  <Label>할인율 (%)</Label>
                  <Input type="number" defaultValue={15} min={0} max={100} />
                </div>
              </TabsContent>
            </Tabs>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                취소
              </Button>
              <Button onClick={handleCreateCampaign} disabled={!selectedTemplate}>
                생성
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* 이번 달 추천 이벤트 */}
      {getCurrentMonthEvents().length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              이번 달 추천 이벤트
            </CardTitle>
            <CardDescription>
              현재 시즌에 맞는 이벤트 템플릿입니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {getCurrentMonthEvents().map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <CardDescription className="text-sm mt-1">
                          {template.description}
                        </CardDescription>
                      </div>
                      <Badge className="bg-green-500">
                        {template.default_discount_rate}% 할인
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 캠페인 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>활성 캠페인</CardTitle>
          <CardDescription>
            생성된 이벤트 캠페인 목록입니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              등록된 캠페인이 없습니다. 캠페인을 생성하여 시작하세요.
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{campaign.name}</CardTitle>
                          {getEventTypeBadge(campaign.event_type)}
                          {campaign.enabled ? (
                            <Badge className="bg-green-500">활성</Badge>
                          ) : (
                            <Badge variant="outline">비활성</Badge>
                          )}
                        </div>
                        {campaign.description && (
                          <CardDescription>{campaign.description}</CardDescription>
                        )}
                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span>
                            기간: {new Date(campaign.start_date).toLocaleDateString("ko-KR")} ~{" "}
                            {new Date(campaign.end_date).toLocaleDateString("ko-KR")}
                          </span>
                          {campaign.discount_rate && (
                            <span>할인율: {campaign.discount_rate}%</span>
                          )}
                          {campaign.coupon_code && (
                            <span>쿠폰: {campaign.coupon_code}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExecuteCampaign(campaign.id)}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          실행
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

