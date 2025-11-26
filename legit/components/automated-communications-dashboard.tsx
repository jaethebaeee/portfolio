'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  MessageSquare,
  Zap,
  Calendar,
  BarChart3,
  Users,
  TrendingUp,
  Settings,
  Plus,
  Play,
  Pause,
  Edit,
  Trash2,
  Sparkles,
  Clock,
  Target,
  Send,
  CheckCircle,
  AlertTriangle,
  Mail,
  Phone
} from 'lucide-react';
import { AITemplateGenerator } from './ai-template-generator';
import { IntegrationsManager } from './integrations-manager';
import { SmartScheduler } from './smart-scheduler';
import { toast } from 'sonner';

interface Campaign {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  analytics: {
    sent_count: number;
    delivered_count: number;
    response_count: number;
    performance_score: number;
  };
}

interface DashboardStats {
  total_campaigns: number;
  active_campaigns: number;
  total_messages_sent: number;
  total_responses: number;
  total_cost: number;
  avg_performance_score: number;
}

export function AutomatedCommunicationsDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_campaigns: 0,
    active_campaigns: 0,
    total_messages_sent: 0,
    total_responses: 0,
    total_cost: 0,
    avg_performance_score: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [showTemplateGenerator, setShowTemplateGenerator] = useState(false);
  const [showIntegrationsManager, setShowIntegrationsManager] = useState(false);
  const [showSmartScheduler, setShowSmartScheduler] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);

  // Load campaigns and stats
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Load campaigns
      const campaignsResponse = await fetch('/api/scheduling/campaigns');
      const campaignsResult = await campaignsResponse.json();

      if (campaignsResult.success) {
        setCampaigns(campaignsResult.campaigns);

        // Calculate stats
        const activeCampaigns = campaignsResult.campaigns.filter((c: Campaign) =>
          ['running', 'scheduled'].includes(c.status)
        ).length;

        const totalSent = campaignsResult.campaigns.reduce((sum: number, c: Campaign) =>
          sum + c.analytics.sent_count, 0
        );

        const totalResponses = campaignsResult.campaigns.reduce((sum: number, c: Campaign) =>
          sum + c.analytics.response_count, 0
        );

        const totalCost = campaignsResult.campaigns.reduce((sum: number, c: Campaign) =>
          sum + c.analytics.cost_total, 0
        );

        const avgPerformance = campaignsResult.campaigns.length > 0
          ? campaignsResult.campaigns.reduce((sum: number, c: Campaign) =>
              sum + c.analytics.performance_score, 0
            ) / campaignsResult.campaigns.length
          : 0;

        setStats({
          total_campaigns: campaignsResult.campaigns.length,
          active_campaigns: activeCampaigns,
          total_messages_sent: totalSent,
          total_responses: totalResponses,
          total_cost: totalCost,
          avg_performance_score: Math.round(avgPerformance)
        });
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('데이터 로딩 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateCampaign = () => {
    setEditingCampaign(null);
    setShowSmartScheduler(true);
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setShowSmartScheduler(true);
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('정말로 이 캠페인을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/scheduling/campaigns/${campaignId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('캠페인이 삭제되었습니다');
        loadData(); // Refresh data
      } else {
        toast.error('캠페인 삭제 실패');
      }
    } catch (error) {
      toast.error('삭제 중 오류가 발생했습니다');
    }
  };

  const handleToggleCampaign = async (campaignId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'running' ? 'paused' : 'running';

    try {
      const response = await fetch(`/api/scheduling/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast.success(`캠페인이 ${newStatus === 'running' ? '시작' : '일시정지'}되었습니다`);
        loadData(); // Refresh data
      } else {
        toast.error('상태 변경 실패');
      }
    } catch (error) {
      toast.error('상태 변경 중 오류가 발생했습니다');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Play className="h-4 w-4 text-green-600" />;
      case 'scheduled':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Settings className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      draft: '초안',
      scheduled: '예약됨',
      running: '실행 중',
      completed: '완료',
      paused: '일시 정지',
      cancelled: '취소'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">자동 커뮤니케이션</h1>
          <p className="text-muted-foreground">
            AI 기반 환자 메시지 자동화로 진료 효율성을 높이세요
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowIntegrationsManager(true)}>
            <Settings className="h-4 w-4 mr-2" />
            연동 설정
          </Button>
          <Button onClick={() => setShowTemplateGenerator(true)}>
            <Sparkles className="h-4 w-4 mr-2" />
            AI 템플릿
          </Button>
          <Button onClick={handleCreateCampaign}>
            <Plus className="h-4 w-4 mr-2" />
            캠페인 생성
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 캠페인</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_campaigns}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active_campaigns}개 실행 중
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">발송 메시지</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_messages_sent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              누적 발송 건수
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">응답률</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total_messages_sent > 0
                ? Math.round((stats.total_responses / stats.total_messages_sent) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.total_responses}건 응답
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">성과 점수</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avg_performance_score}</div>
            <p className="text-xs text-muted-foreground">
              평균 성과 점수
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">캠페인 개요</TabsTrigger>
          <TabsTrigger value="campaigns">캠페인 관리</TabsTrigger>
          <TabsTrigger value="analytics">분석 리포트</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>빠른 작업</CardTitle>
                <CardDescription>자주 사용하는 기능을 바로 실행하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowTemplateGenerator(true)}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI 템플릿 생성
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleCreateCampaign}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  새 캠페인 만들기
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowIntegrationsManager(true)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  연동 플랫폼 설정
                </Button>
              </CardContent>
            </Card>

            {/* Active Campaigns */}
            <Card>
              <CardHeader>
                <CardTitle>실행 중인 캠페인</CardTitle>
                <CardDescription>현재 활성화된 자동화 캠페인들</CardDescription>
              </CardHeader>
              <CardContent>
                {campaigns.filter(c => ['running', 'scheduled'].includes(c.status)).length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>실행 중인 캠페인이 없습니다</p>
                    <Button
                      variant="link"
                      onClick={handleCreateCampaign}
                      className="mt-2"
                    >
                      첫 캠페인 만들기
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {campaigns
                      .filter(c => ['running', 'scheduled'].includes(c.status))
                      .slice(0, 3)
                      .map((campaign) => (
                        <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(campaign.status)}
                            <div>
                              <p className="font-medium">{campaign.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {campaign.analytics.sent_count}건 발송 • 성과 {campaign.analytics.performance_score}점
                              </p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(campaign.status)}>
                            {getStatusText(campaign.status)}
                          </Badge>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Feature Highlights */}
          <Card>
            <CardHeader>
              <CardTitle>주요 기능</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <h3 className="font-semibold mb-1">AI 템플릿 생성</h3>
                  <p className="text-sm text-muted-foreground">
                    환자 데이터로 개인화된 메시지를 즉시 생성
                  </p>
                </div>
                <div className="text-center p-4">
                  <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                  <h3 className="font-semibold mb-1">스마트 스케줄링</h3>
                  <p className="text-sm text-muted-foreground">
                    최적의 시간에 자동 발송으로 효과 극대화
                  </p>
                </div>
                <div className="text-center p-4">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <h3 className="font-semibold mb-1">실시간 분석</h3>
                  <p className="text-sm text-muted-foreground">
                    발송 결과와 환자 응답을 실시간으로 분석
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Management Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">캠페인 관리</h2>
              <p className="text-muted-foreground">자동화된 환자 커뮤니케이션 캠페인을 관리하세요</p>
            </div>
            <Button onClick={handleCreateCampaign}>
              <Plus className="h-4 w-4 mr-2" />
              새 캠페인
            </Button>
          </div>

          {campaigns.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">캠페인이 없습니다</h3>
                <p className="text-muted-foreground mb-4">
                  첫 번째 자동화 캠페인을 만들어보세요
                </p>
                <Button onClick={handleCreateCampaign}>
                  <Plus className="h-4 w-4 mr-2" />
                  캠페인 만들기
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {campaigns.map((campaign) => (
                <Card key={campaign.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(campaign.status)}
                        <div>
                          <h3 className="font-semibold">{campaign.name}</h3>
                          <p className="text-sm text-muted-foreground">{campaign.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span>타입: {campaign.type}</span>
                            <span>발송: {campaign.analytics.sent_count}건</span>
                            <span>응답: {campaign.analytics.response_count}건</span>
                            <span>성과: {campaign.analytics.performance_score}점</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(campaign.status)}>
                          {getStatusText(campaign.status)}
                        </Badge>

                        <div className="flex gap-1">
                          {campaign.status === 'running' || campaign.status === 'scheduled' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleCampaign(campaign.id, campaign.status)}
                            >
                              <Pause className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleCampaign(campaign.id, campaign.status)}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCampaign(campaign)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCampaign(campaign.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Alert>
            <BarChart3 className="h-4 w-4" />
            <AlertDescription>
              <strong>실시간 분석:</strong> 캠페인 성과를 모니터링하고 최적화하세요.
              더 자세한 분석은 추후 업데이트될 예정입니다.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">총 발송 건수</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.total_messages_sent.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">이번 달</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">평균 응답률</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stats.total_messages_sent > 0
                    ? Math.round((stats.total_responses / stats.total_messages_sent) * 100)
                    : 0}%
                </div>
                <p className="text-sm text-muted-foreground">전체 평균</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">총 비용</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">₩{stats.total_cost.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">이번 달</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>캠페인별 성과</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.slice(0, 5).map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{campaign.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {campaign.analytics.sent_count}건 발송 • {campaign.analytics.response_count}건 응답
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{campaign.analytics.performance_score}점</div>
                      <div className="text-sm text-muted-foreground">성과 점수</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AITemplateGenerator
        open={showTemplateGenerator}
        onOpenChange={setShowTemplateGenerator}
        onSaveTemplate={(template) => {
          console.log('Template saved:', template);
          toast.success('템플릿이 저장되었습니다');
        }}
      />

      <IntegrationsManager
        open={showIntegrationsManager}
        onOpenChange={setShowIntegrationsManager}
        onSaveConfig={(config) => {
          console.log('Config saved:', config);
          toast.success('설정이 저장되었습니다');
        }}
      />

      <SmartScheduler
        open={showSmartScheduler}
        onOpenChange={setShowSmartScheduler}
        initialCampaign={editingCampaign}
        onSaveCampaign={(campaign) => {
          console.log('Campaign saved:', campaign);
          loadData(); // Refresh the campaigns list
        }}
      />
    </div>
  );
}
