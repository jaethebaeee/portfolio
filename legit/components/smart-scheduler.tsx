'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@//components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Clock,
  Calendar as CalendarIcon,
  Zap,
  TrendingUp,
  Target,
  Users,
  Send,
  BarChart3,
  Play,
  Pause,
  Square,
  Settings,
  Sparkles,
  MessageSquare,
  Mail,
  Phone,
  CheckCircle,
  AlertTriangle,
  CalendarDays,
  Repeat,
  TestTube,
  Save,
  Eye,
  Link as LinkIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { toast } from 'sonner';
import { TemplatePreviewDialog } from './template-preview-dialog';

interface ScheduledCampaign {
  id: string;
  name: string;
  description: string;
  type: 'one_time' | 'recurring' | 'event_triggered' | 'ab_test';
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'paused' | 'cancelled';
  audience: {
    patient_ids?: string[];
    filters?: {
      surgery_type?: string[];
      age_range?: { min: number; max: number };
      last_visit_days?: number;
      appointment_status?: string[];
    };
  };
  message: {
    type: 'notification' | 'marketing' | 'reminder' | 'care_instructions';
    template_id?: string;
    subject?: string;
    content: string;
    variables?: Record<string, string>;
    buttons?: {
      name: string;
      type: 'WL' | 'AL' | 'BK' | 'MD'; // Web Link, App Link, Bot Keyword, Message Delivery
      linkMobile?: string;
      linkPc?: string;
    }[];
  };
  schedule: {
    send_at?: string;
    recurring?: {
      frequency: 'daily' | 'weekly' | 'monthly';
      days_of_week?: number[];
      time_of_day: string;
      end_date?: string;
    };
    trigger?: {
      event_type: 'surgery_completed' | 'appointment_created' | 'appointment_cancelled' | 'follow_up_due';
      delay_hours?: number;
      delay_days?: number;
    };
    ab_test?: {
      variants: {
        name: string;
        content: string;
        weight: number;
        schedule_offset?: number;
      }[];
      test_duration_hours: number;
      winner_criteria: 'open_rate' | 'response_rate' | 'conversion_rate';
    };
  };
  smart_timing?: {
    enabled: boolean;
    preferred_hours: number[];
    avoid_weekends: boolean;
    timezone: string;
    optimal_days: number[];
  };
  delivery: {
    channels: ('kakao' | 'sms' | 'email')[];
    fallback_order: ('kakao' | 'sms' | 'email')[];
    max_retries: number;
    retry_interval_minutes: number;
  };
  analytics: {
    sent_count: number;
    delivered_count: number;
    open_count: number;
    response_count: number;
    cost_total: number;
    performance_score: number;
  };
  created_at: string;
  updated_at: string;
  created_by: string;
  tags: string[];
}

interface SmartSchedulerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCampaign?: Partial<ScheduledCampaign>;
  onSaveCampaign?: (campaign: ScheduledCampaign) => void;
}

const CAMPAIGN_TYPES = [
  {
    value: 'one_time',
    label: '단일 발송',
    description: '특정 시간에 한 번만 발송',
    icon: <Send className="h-4 w-4" />
  },
  {
    value: 'recurring',
    label: '정기 발송',
    description: '주기적으로 반복 발송',
    icon: <Repeat className="h-4 w-4" />
  },
  {
    value: 'event_triggered',
    label: '이벤트 트리거',
    description: '특정 이벤트 발생 시 자동 발송',
    icon: <Zap className="h-4 w-4" />
  },
  {
    value: 'ab_test',
    label: 'A/B 테스트',
    description: '다른 메시지로 효과 비교',
    icon: <TestTube className="h-4 w-4" />
  }
];

const MESSAGE_TYPES = [
  { value: 'notification', label: '알림', color: 'bg-blue-100 text-blue-800' },
  { value: 'marketing', label: '마케팅', color: 'bg-green-100 text-green-800' },
  { value: 'reminder', label: '리마인더', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'care_instructions', label: '케어 안내', color: 'bg-purple-100 text-purple-800' }
];

const DAYS_OF_WEEK = [
  { value: 1, label: '월' },
  { value: 2, label: '화' },
  { value: 3, label: '수' },
  { value: 4, label: '목' },
  { value: 5, label: '금' },
  { value: 6, label: '토' },
  { value: 0, label: '일' }
];

export function SmartScheduler({ open, onOpenChange, initialCampaign, onSaveCampaign }: SmartSchedulerProps) {
  const [campaign, setCampaign] = useState<Partial<ScheduledCampaign>>({
    type: 'one_time',
    status: 'draft',
    audience: {},
    message: { type: 'notification', content: '' },
    schedule: {},
    delivery: {
      channels: ['kakao'],
      fallback_order: ['kakao', 'sms', 'email'],
      max_retries: 3,
      retry_interval_minutes: 5
    },
    analytics: {
      sent_count: 0,
      delivered_count: 0,
      open_count: 0,
      response_count: 0,
      cost_total: 0,
      performance_score: 0
    },
    tags: [],
    ...initialCampaign
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [optimizations, setOptimizations] = useState<any>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Initialize campaign data
  useEffect(() => {
    if (open) {
      setCampaign({
        type: 'one_time',
        status: 'draft',
        audience: {},
        message: { type: 'notification', content: '' },
        schedule: {},
        delivery: {
          channels: ['kakao'],
          fallback_order: ['kakao', 'sms', 'email'],
          max_retries: 3,
          retry_interval_minutes: 5
        },
        analytics: {
          sent_count: 0,
          delivered_count: 0,
          open_count: 0,
          response_count: 0,
          cost_total: 0,
          performance_score: 0
        },
        tags: [],
        ...initialCampaign
      });
    }
  }, [open, initialCampaign]);

  const handleOptimizeTiming = useCallback(async () => {
    setIsOptimizing(true);
    try {
      const optimizationRequest = {
        campaign_type: campaign.type,
        patient_segment: campaign.audience?.filters,
        message_type: campaign.message?.type,
        channels: campaign.delivery?.channels || []
      };

      const response = await fetch('/api/scheduling/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(optimizationRequest)
      });

      const result = await response.json();

      if (result.success) {
        setOptimizations(result.recommendations);

        // Apply best recommendations
        const bestTime = result.recommendations.optimal_send_times[0];
        if (bestTime) {
          setCampaign(prev => ({
            ...prev,
            smart_timing: {
              enabled: true,
              preferred_hours: [bestTime.hour],
              avoid_weekends: bestTime.day_of_week >= 1 && bestTime.day_of_week <= 5,
              timezone: 'Asia/Seoul',
              optimal_days: [bestTime.day_of_week]
            }
          }));
        }

        toast.success('최적화 완료! 추천 설정이 적용되었습니다.');
      } else {
        toast.error(`최적화 실패: ${result.error}`);
      }
    } catch (error) {
      toast.error('최적화 중 오류가 발생했습니다');
    } finally {
      setIsOptimizing(false);
    }
  }, [campaign]);

  const handleSaveCampaign = useCallback(async () => {
    try {
      if (!campaign.name || !campaign.message?.content) {
        toast.error('캠페인 이름과 메시지 내용은 필수입니다');
        return;
      }

      const saveData = {
        ...campaign,
        id: campaign.id || `campaign_${Date.now()}`,
        created_at: campaign.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'user' // Replace with actual user ID
      };

      const response = await fetch('/api/scheduling/campaigns', {
        method: campaign.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saveData)
      });

      const result = await response.json();

      if (result.success) {
        toast.success(campaign.id ? '캠페인이 수정되었습니다' : '캠페인이 생성되었습니다');
        onSaveCampaign?.(result.campaign);
        onOpenChange(false);
      } else {
        toast.error(`저장 실패: ${result.error}`);
      }
    } catch (error) {
      toast.error('저장 중 오류가 발생했습니다');
    }
  }, [campaign, onSaveCampaign, onOpenChange]);

  const updateCampaign = useCallback((path: string, value: any) => {
    setCampaign(prev => {
      const keys = path.split('.');
      const updated = { ...prev };

      let current: any = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;

      return updated;
    });
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Play className="h-4 w-4 text-green-600" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'cancelled':
        return <Square className="h-4 w-4 text-red-600" />;
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

  const handlePreview = () => {
    if (!campaign.message?.content) {
      toast.error("메시지 내용을 입력해주세요.");
      return;
    }
    setShowPreview(true);
  };

  const handleAddButton = () => {
    const currentButtons = campaign.message?.buttons || [];
    if (currentButtons.length >= 5) {
      toast.error("버튼은 최대 5개까지 추가할 수 있습니다.");
      return;
    }
    
    const newButtons = [...currentButtons, { 
      name: "버튼명", 
      type: "WL", 
      linkMobile: "https://", 
      linkPc: "https://" 
    }];
    updateCampaign('message.buttons', newButtons);
  };

  const handleUpdateButton = (index: number, field: string, value: string) => {
    const currentButtons = [...(campaign.message?.buttons || [])];
    currentButtons[index] = { ...currentButtons[index], [field]: value };
    updateCampaign('message.buttons', currentButtons);
  };

  const handleRemoveButton = (index: number) => {
    const currentButtons = [...(campaign.message?.buttons || [])];
    currentButtons.splice(index, 1);
    updateCampaign('message.buttons', currentButtons);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-6 w-6" />
            스마트 스케줄러
          </DialogTitle>
          <DialogDescription>
            AI 기반 최적화로 환자 메시지를 가장 효과적인 시간에 자동 발송하세요
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">기본 설정</TabsTrigger>
            <TabsTrigger value="audience">대상 설정</TabsTrigger>
            <TabsTrigger value="schedule">스케줄</TabsTrigger>
            <TabsTrigger value="optimize">최적화</TabsTrigger>
          </TabsList>

          {/* Basic Settings Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>캠페인 기본 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>캠페인 이름</Label>
                    <Input
                      placeholder="예: 라식 수술 후 케어"
                      value={campaign.name || ''}
                      onChange={(e) => updateCampaign('name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>캠페인 타입</Label>
                    <Select
                      value={campaign.type}
                      onValueChange={(value) => updateCampaign('type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CAMPAIGN_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              {type.icon}
                              <span>{type.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>설명</Label>
                  <Textarea
                    placeholder="캠페인에 대한 간단한 설명"
                    value={campaign.description || ''}
                    onChange={(e) => updateCampaign('description', e.target.value)}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>메시지 설정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>메시지 타입</Label>
                    <Select
                      value={campaign.message?.type}
                      onValueChange={(value) => updateCampaign('message.type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MESSAGE_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <Badge className={type.color}>{type.label}</Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>제목 (이메일용)</Label>
                    <Input
                      placeholder="메시지 제목"
                      value={campaign.message?.subject || ''}
                      onChange={(e) => updateCampaign('message.subject', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label>메시지 내용</Label>
                  <Textarea
                    placeholder="발송할 메시지 내용을 입력하세요"
                    value={campaign.message?.content || ''}
                    onChange={(e) => updateCampaign('message.content', e.target.value)}
                    rows={6}
                  />
                </div>

                {/* Kakao Buttons Editor */}
                {campaign.delivery?.channels?.includes('kakao') && (
                  <div className="space-y-3 border rounded-lg p-4 bg-muted/20">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-yellow-500" />
                        알림톡 버튼 설정
                      </Label>
                      <Button variant="outline" size="sm" onClick={handleAddButton} className="h-7 text-xs">
                        <Sparkles className="h-3 w-3 mr-1" />
                        버튼 추가
                      </Button>
                    </div>
                    
                    {(!campaign.message?.buttons || campaign.message.buttons.length === 0) && (
                      <div className="text-xs text-muted-foreground text-center py-2">
                        버튼을 추가하여 링크 연결 기능을 제공하세요 (최대 5개)
                      </div>
                    )}

                    <div className="space-y-3">
                      {campaign.message?.buttons?.map((btn: any, idx: number) => (
                        <div key={idx} className="grid gap-2 p-3 bg-background rounded border">
                          <div className="flex items-center gap-2">
                            <Input 
                              value={btn.name} 
                              onChange={(e) => handleUpdateButton(idx, 'name', e.target.value)}
                              placeholder="버튼명 (예: 예약하기)"
                              className="h-8 text-sm flex-1"
                            />
                            <Select 
                              value={btn.type} 
                              onValueChange={(val) => handleUpdateButton(idx, 'type', val)}
                            >
                              <SelectTrigger className="h-8 w-[120px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="WL">웹링크</SelectItem>
                                <SelectItem value="AL">앱링크</SelectItem>
                                <SelectItem value="BK">봇키워드</SelectItem>
                                <SelectItem value="MD">메시지전달</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleRemoveButton(idx)}
                              className="h-8 w-8 p-0 text-destructive"
                            >
                              <Square className="h-4 w-4 rotate-45" /> 
                            </Button>
                          </div>
                          {btn.type === 'WL' && (
                            <div className="grid grid-cols-2 gap-2">
                              <Input 
                                value={btn.linkMobile} 
                                onChange={(e) => handleUpdateButton(idx, 'linkMobile', e.target.value)}
                                placeholder="모바일 링크 (https://...)"
                                className="h-8 text-xs"
                              />
                              <Input 
                                value={btn.linkPc} 
                                onChange={(e) => handleUpdateButton(idx, 'linkPc', e.target.value)}
                                placeholder="PC 링크 (선택)"
                                className="h-8 text-xs"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <Label>사용 가능한 변수</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['patient_name', 'appointment_date', 'clinic_name', 'doctor_name'].map((variable) => (
                      <Badge key={variable} variant="outline" className="cursor-pointer hover:bg-primary/10 transition-colors"
                             onClick={() => {
                               const textarea = document.querySelector('textarea');
                               if (textarea) {
                                 const text = campaign.message?.content || '';
                                 const newText = text + `{{${variable}}}`;
                                 updateCampaign('message.content', newText);
                               }
                             }}>
                        {`{{${variable}}}`}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Button variant="secondary" className="w-full mt-2" onClick={handlePreview}>
                  <Eye className="h-4 w-4 mr-2" />
                  메시지 미리보기
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audience Settings Tab */}
          <TabsContent value="audience" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>대상 환자 설정</CardTitle>
                <CardDescription>메시지를 받을 환자 그룹을 설정하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>수술 종류</Label>
                    <Select
                      value={campaign.audience?.filters?.surgery_type?.[0] || ''}
                      onValueChange={(value) => updateCampaign('audience.filters.surgery_type', value ? [value] : undefined)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="모든 수술" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">모든 수술</SelectItem>
                        <SelectItem value="lasik">라식/라섹</SelectItem>
                        <SelectItem value="cataract">백내장</SelectItem>
                        <SelectItem value="rhinoplasty">코성형</SelectItem>
                        <SelectItem value="blepharoplasty_cos">눈성형</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>나이 범위</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="최소"
                        value={campaign.audience?.filters?.age_range?.min || ''}
                        onChange={(e) => {
                          const min = parseInt(e.target.value);
                          const max = campaign.audience?.filters?.age_range?.max;
                          updateCampaign('audience.filters.age_range', { min, max });
                        }}
                      />
                      <span className="self-center">-</span>
                      <Input
                        type="number"
                        placeholder="최대"
                        value={campaign.audience?.filters?.age_range?.max || ''}
                        onChange={(e) => {
                          const max = parseInt(e.target.value);
                          const min = campaign.audience?.filters?.age_range?.min;
                          updateCampaign('audience.filters.age_range', { min, max });
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label>마지막 방문일 (일)</Label>
                  <Input
                    type="number"
                    placeholder="예: 30 (최근 30일 내 방문한 환자)"
                    value={campaign.audience?.filters?.last_visit_days || ''}
                    onChange={(e) => updateCampaign('audience.filters.last_visit_days', parseInt(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedule Settings Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>발송 스케줄</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {campaign.type === 'one_time' && (
                  <div>
                    <Label>발송 시간</Label>
                    <Input
                      type="datetime-local"
                      value={campaign.schedule?.send_at || ''}
                      onChange={(e) => updateCampaign('schedule.send_at', e.target.value)}
                    />
                  </div>
                )}

                {campaign.type === 'recurring' && (
                  <div className="space-y-4">
                    <div>
                      <Label>반복 주기</Label>
                      <Select
                        value={campaign.schedule?.recurring?.frequency}
                        onValueChange={(value) => updateCampaign('schedule.recurring.frequency', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">매일</SelectItem>
                          <SelectItem value="weekly">매주</SelectItem>
                          <SelectItem value="monthly">매월</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>발송 시간</Label>
                      <Input
                        type="time"
                        value={campaign.schedule?.recurring?.time_of_day}
                        onChange={(e) => updateCampaign('schedule.recurring.time_of_day', e.target.value)}
                      />
                    </div>

                    {campaign.schedule?.recurring?.frequency === 'weekly' && (
                      <div>
                        <Label>요일 선택</Label>
                        <div className="flex gap-2 mt-2">
                          {DAYS_OF_WEEK.map((day) => (
                            <button
                              key={day.value}
                              onClick={() => {
                                const current = campaign.schedule?.recurring?.days_of_week || [];
                                const updated = current.includes(day.value)
                                  ? current.filter(d => d !== day.value)
                                  : [...current, day.value];
                                updateCampaign('schedule.recurring.days_of_week', updated);
                              }}
                              className={`px-3 py-1 rounded border ${
                                campaign.schedule?.recurring?.days_of_week?.includes(day.value)
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              {day.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {campaign.type === 'event_triggered' && (
                  <div className="space-y-4">
                    <div>
                      <Label>트리거 이벤트</Label>
                      <Select
                        value={campaign.schedule?.trigger?.event_type}
                        onValueChange={(value) => updateCampaign('schedule.trigger.event_type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="surgery_completed">수술 완료</SelectItem>
                          <SelectItem value="appointment_created">예약 생성</SelectItem>
                          <SelectItem value="appointment_cancelled">예약 취소</SelectItem>
                          <SelectItem value="follow_up_due">추적 진료 예정</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>지연 시간 (시간)</Label>
                        <Input
                          type="number"
                          placeholder="예: 6"
                          value={campaign.schedule?.trigger?.delay_hours || ''}
                          onChange={(e) => updateCampaign('schedule.trigger.delay_hours', parseInt(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>지연 일수 (일)</Label>
                        <Input
                          type="number"
                          placeholder="예: 1"
                          value={campaign.schedule?.trigger?.delay_days || ''}
                          onChange={(e) => updateCampaign('schedule.trigger.delay_days', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>전송 설정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>발송 채널 (우선순위순)</Label>
                  <div className="flex gap-2 mt-2">
                    {['kakao', 'sms', 'email'].map((channel) => (
                      <button
                        key={channel}
                        onClick={() => {
                          const current = campaign.delivery?.channels || [];
                          const updated = current.includes(channel as any)
                            ? current.filter(c => c !== channel)
                            : [...current, channel as any];
                          updateCampaign('delivery.channels', updated);
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded border ${
                          campaign.delivery?.channels?.includes(channel as any)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {channel === 'kakao' && <MessageSquare className="h-4 w-4" />}
                        {channel === 'sms' && <Phone className="h-4 w-4" />}
                        {channel === 'email' && <Mail className="h-4 w-4" />}
                        {channel.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>최대 재시도 횟수</Label>
                    <Input
                      type="number"
                      value={campaign.delivery?.max_retries}
                      onChange={(e) => updateCampaign('delivery.max_retries', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>재시도 간격 (분)</Label>
                    <Input
                      type="number"
                      value={campaign.delivery?.retry_interval_minutes}
                      onChange={(e) => updateCampaign('delivery.retry_interval_minutes', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Optimization Tab */}
          <TabsContent value="optimize" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI 최적화
                </CardTitle>
                <CardDescription>
                  환자 데이터와 메시지 타입을 분석하여 최적의 발송 시간과 채널을 추천합니다
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleOptimizeTiming}
                  disabled={isOptimizing}
                  className="w-full"
                >
                  {isOptimizing ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                      최적화 분석 중...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      AI로 최적화하기
                    </>
                  )}
                </Button>

                {optimizations && (
                  <div className="space-y-4">
                    <Alert>
                      <TrendingUp className="h-4 w-4" />
                      <AlertDescription>
                        <strong>예상 개선 효과:</strong> 비용 {optimizations.estimated_cost_savings}% 절감,
                        응답률 {optimizations.estimated_response_improvement}% 향상
                      </AlertDescription>
                    </Alert>

                    <div>
                      <h4 className="font-medium mb-2">추천 발송 시간</h4>
                      <div className="space-y-2">
                        {optimizations.optimal_send_times.slice(0, 3).map((time: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                            <span>{DAYS_OF_WEEK.find(d => d.value === time.day_of_week)?.label}요일 {time.hour}시</span>
                            <Badge variant="outline">{time.confidence_score}% 신뢰도</Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">채널 우선순위</h4>
                      <div className="space-y-2">
                        {optimizations.channel_priorities.map((channel: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                            <span className="capitalize">{channel.channel}</span>
                            <Badge variant="outline">점수: {channel.priority_score}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleSaveCampaign}>
            <Save className="h-4 w-4 mr-2" />
            캠페인 저장
          </Button>
        </DialogFooter>
      </DialogContent>

      <TemplatePreviewDialog 
        template={{
          id: 'preview',
          name: campaign.name || '캠페인 미리보기',
          description: campaign.description || '',
          messages: [{
            channel: (campaign.delivery?.channels?.[0] || 'kakao') as any,
            content: campaign.message?.content || '',
            buttons: campaign.message?.buttons
          }],
          trigger: { type: 'manual', value: 0 },
          enabled: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }}
        open={showPreview}
        onOpenChange={setShowPreview}
      />
    </Dialog>
  );
}
