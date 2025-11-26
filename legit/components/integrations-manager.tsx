'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  MessageSquare,
  Phone,
  Mail,
  Settings,
  TestTube,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  BarChart3,
  Shield,
  Key,
  Wifi,
  WifiOff,
  RefreshCw,
  Save,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

interface IntegrationConfig {
  kakao: {
    enabled: boolean;
    appKey: string;
    senderKey: string;
    senderKeyFriend: string;
    pfId: string;
    status: 'connected' | 'disconnected' | 'error';
  };
  sms: {
    enabled: boolean;
    provider: 'nhn' | 'coolsms' | 'bizppurio';
    nhn: { appKey: string; secretKey: string; senderPhone: string };
    coolsms: { apiKey: string; apiSecret: string; senderPhone: string };
    bizppurio: { apiKey: string; apiSecret: string; senderPhone: string };
    status: 'connected' | 'disconnected' | 'error';
  };
  email: {
    enabled: boolean;
    provider: 'sendgrid' | 'resend' | 'aws_ses';
    sendgrid: { apiKey: string; fromEmail: string; fromName: string };
    resend: { apiKey: string; fromEmail: string; fromName: string };
    aws_ses: { accessKey: string; secretKey: string; region: string; fromEmail: string; fromName: string };
    status: 'connected' | 'disconnected' | 'error';
  };
  routing: {
    notification: ('kakao' | 'sms' | 'email')[];
    marketing: ('kakao' | 'sms' | 'email')[];
    reminder: ('kakao' | 'sms' | 'email')[];
    care_instructions: ('kakao' | 'sms' | 'email')[];
  };
}

interface IntegrationsManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveConfig?: (config: IntegrationConfig) => void;
}

const DEFAULT_CONFIG: IntegrationConfig = {
  kakao: {
    enabled: false,
    appKey: '',
    senderKey: '',
    senderKeyFriend: '',
    pfId: '',
    status: 'disconnected'
  },
  sms: {
    enabled: false,
    provider: 'nhn',
    nhn: { appKey: '', secretKey: '', senderPhone: '' },
    coolsms: { apiKey: '', apiSecret: '', senderPhone: '' },
    bizppurio: { apiKey: '', apiSecret: '', senderPhone: '' },
    status: 'disconnected'
  },
  email: {
    enabled: false,
    provider: 'sendgrid',
    sendgrid: { apiKey: '', fromEmail: '', fromName: '' },
    resend: { apiKey: '', fromEmail: '', fromName: '' },
    aws_ses: { accessKey: '', secretKey: '', region: 'ap-northeast-2', fromEmail: '', fromName: '' },
    status: 'disconnected'
  },
  routing: {
    notification: ['kakao', 'sms', 'email'],
    marketing: ['sms', 'kakao', 'email'],
    reminder: ['kakao', 'sms', 'email'],
    care_instructions: ['kakao', 'sms', 'email']
  }
};

const INTEGRATION_PLATFORMS = [
  {
    id: 'kakao',
    name: '카카오톡',
    description: '알림톡과 친구톡으로 환자 메시지 전송',
    icon: <MessageSquare className="h-6 w-6 text-yellow-600" />,
    color: 'border-yellow-200 bg-yellow-50',
    features: [
      '알림톡 (진료 알림)',
      '친구톡 (마케팅)',
      '실시간 배송 조회',
      '저비용 고효율'
    ]
  },
  {
    id: 'sms',
    name: 'SMS/LMS',
    description: '문자 메시지로 안정적인 전달 보장',
    icon: <Phone className="h-6 w-6 text-blue-600" />,
    color: 'border-blue-200 bg-blue-50',
    features: [
      '100% 전달률',
      '장문 메시지 지원',
      '다중 사업자 지원',
      '자동 장애 조치'
    ]
  },
  {
    id: 'email',
    name: '이메일',
    description: '상세한 케어 안내와 예약 정보 전송',
    icon: <Mail className="h-6 w-6 text-green-600" />,
    color: 'border-green-200 bg-green-50',
    features: [
      'HTML 템플릿 지원',
      '상세 정보 전달',
      '비용 효율적',
      '추적 및 분석'
    ]
  }
];

export function IntegrationsManager({ open, onOpenChange, onSaveConfig }: IntegrationsManagerProps) {
  const [config, setConfig] = useState<IntegrationConfig>(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState('overview');
  const [testingConnection, setTestingConnection] = useState<string | null>(null);

  // Load saved configuration
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/api/integrations/config');
        if (response.ok) {
          const savedConfig = await response.json();
          setConfig({ ...DEFAULT_CONFIG, ...savedConfig });
        }
      } catch (error) {
        console.warn('Failed to load integration config:', error);
      }
    };

    if (open) {
      loadConfig();
    }
  }, [open]);

  const handleTestConnection = useCallback(async (platform: string) => {
    setTestingConnection(platform);
    try {
      const response = await fetch('/api/integrations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, config: config[platform as keyof IntegrationConfig] })
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`${platform} 연결 테스트 성공!`);
        setConfig(prev => ({
          ...prev,
          [platform]: {
            ...prev[platform as keyof IntegrationConfig],
            status: 'connected' as const
          }
        }));
      } else {
        toast.error(`${platform} 연결 실패: ${result.error}`);
        setConfig(prev => ({
          ...prev,
          [platform]: {
            ...prev[platform as keyof IntegrationConfig],
            status: 'error' as const
          }
        }));
      }
    } catch (error) {
      toast.error(`${platform} 연결 테스트 중 오류 발생`);
      setConfig(prev => ({
        ...prev,
        [platform]: {
          ...prev[platform as keyof IntegrationConfig],
          status: 'error' as const
        }
      }));
    } finally {
      setTestingConnection(null);
    }
  }, [config]);

  const handleSaveConfig = useCallback(async () => {
    try {
      const response = await fetch('/api/integrations/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        toast.success('설정이 저장되었습니다');
        onSaveConfig?.(config);
      } else {
        toast.error('설정 저장 실패');
      }
    } catch (error) {
      toast.error('설정 저장 중 오류 발생');
    }
  }, [config, onSaveConfig]);

  const updateConfig = useCallback((path: string, value: any) => {
    setConfig(prev => {
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

  const getConnectionStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <WifiOff className="h-4 w-4 text-gray-400" />;
    }
  };

  const getConnectionStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return '연결됨';
      case 'error':
        return '연결 오류';
      default:
        return '연결 안됨';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-6 w-6" />
            통합 관리
          </DialogTitle>
          <DialogDescription>
            카카오톡, SMS, 이메일 등 다양한 채널과 연동하여 환자 커뮤니케이션을 자동화하세요
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="kakao">카카오톡</TabsTrigger>
            <TabsTrigger value="sms">SMS</TabsTrigger>
            <TabsTrigger value="email">이메일</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {INTEGRATION_PLATFORMS.map((platform) => {
                const platformConfig = config[platform.id as keyof IntegrationConfig] as any;
                const isEnabled = platformConfig?.enabled;
                const status = platformConfig?.status || 'disconnected';

                return (
                  <Card key={platform.id} className={`${platform.color} ${isEnabled ? 'ring-2 ring-primary/20' : ''}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {platform.icon}
                          <div>
                            <CardTitle className="text-lg">{platform.name}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              {getConnectionStatusIcon(status)}
                              <span className="text-sm text-muted-foreground">
                                {getConnectionStatusText(status)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Switch
                          checked={isEnabled}
                          onCheckedChange={(checked) => updateConfig(`${platform.id}.enabled`, checked)}
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-3">{platform.description}</CardDescription>
                      <div className="space-y-2">
                        {platform.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            {feature}
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveTab(platform.id)}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          설정
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTestConnection(platform.id)}
                          disabled={testingConnection === platform.id || !isEnabled}
                        >
                          {testingConnection === platform.id ? (
                            <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <TestTube className="h-4 w-4 mr-1" />
                          )}
                          테스트
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Smart Routing Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  스마트 라우팅
                </CardTitle>
                <CardDescription>
                  메시지 타입별로 최적의 채널을 자동 선택합니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(config.routing).map(([messageType, channels]) => (
                    <div key={messageType} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <span className="font-medium capitalize">
                          {messageType === 'care_instructions' ? '케어 안내' :
                           messageType === 'notification' ? '알림' :
                           messageType === 'marketing' ? '마케팅' : '리마인더'}
                        </span>
                        <p className="text-sm text-muted-foreground">
                          우선순위: {channels.join(' → ')}
                        </p>
                      </div>
                      <Select
                        value={channels[0]}
                        onValueChange={(value) => {
                          const newChannels = [value as any, ...channels.filter(c => c !== value)];
                          updateConfig(`routing.${messageType}`, newChannels);
                        }}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kakao">카카오톡</SelectItem>
                          <SelectItem value="sms">SMS</SelectItem>
                          <SelectItem value="email">이메일</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Usage Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  사용 통계 (이번 달)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">1,247</div>
                    <div className="text-sm text-muted-foreground">카카오톡 발송</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">342</div>
                    <div className="text-sm text-muted-foreground">SMS 발송</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">89</div>
                    <div className="text-sm text-muted-foreground">이메일 발송</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">₩127,500</div>
                    <div className="text-sm text-muted-foreground">총 비용</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Kakao Configuration Tab */}
          <TabsContent value="kakao" className="space-y-6">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>카카오 비즈니스 인증 필요:</strong> 알림톡 사용을 위해서는 카카오 비즈니스 채널 인증이 필요합니다.
                <Button variant="link" className="p-0 h-auto ml-2">
                  인증 가이드 보기
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>카카오톡 설정</CardTitle>
                <CardDescription>알림톡과 친구톡을 위한 API 설정</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>앱 키</Label>
                    <Input
                      type="password"
                      placeholder="Kakao App Key"
                      value={config.kakao.appKey}
                      onChange={(e) => updateConfig('kakao.appKey', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>알림톡 발신키</Label>
                    <Input
                      type="password"
                      placeholder="AlimTalk Sender Key"
                      value={config.kakao.senderKey}
                      onChange={(e) => updateConfig('kakao.senderKey', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>친구톡 발신키</Label>
                    <Input
                      type="password"
                      placeholder="FriendTalk Sender Key"
                      value={config.kakao.senderKeyFriend}
                      onChange={(e) => updateConfig('kakao.senderKeyFriend', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>플러스친구 ID</Label>
                    <Input
                      placeholder="@your_pf_id"
                      value={config.kakao.pfId}
                      onChange={(e) => updateConfig('kakao.pfId', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SMS Configuration Tab */}
          <TabsContent value="sms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SMS 사업자 선택</CardTitle>
                <CardDescription>가장 적합한 SMS 사업자를 선택하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={config.sms.provider}
                  onValueChange={(value) => updateConfig('sms.provider', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nhn">NHN Cloud (추천)</SelectItem>
                    <SelectItem value="coolsms">Coolsms</SelectItem>
                    <SelectItem value="bizppurio">Bizppurio</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {config.sms.provider === 'nhn' && (
              <Card>
                <CardHeader>
                  <CardTitle>NHN Cloud 설정</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>앱 키</Label>
                      <Input
                        type="password"
                        value={config.sms.nhn.appKey}
                        onChange={(e) => updateConfig('sms.nhn.appKey', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>시크릿 키</Label>
                      <Input
                        type="password"
                        value={config.sms.nhn.secretKey}
                        onChange={(e) => updateConfig('sms.nhn.secretKey', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>발신번호</Label>
                      <Input
                        placeholder="010-1234-5678"
                        value={config.sms.nhn.senderPhone}
                        onChange={(e) => updateConfig('sms.nhn.senderPhone', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {config.sms.provider === 'coolsms' && (
              <Card>
                <CardHeader>
                  <CardTitle>Coolsms 설정</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>API 키</Label>
                      <Input
                        type="password"
                        value={config.sms.coolsms.apiKey}
                        onChange={(e) => updateConfig('sms.coolsms.apiKey', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>API 시크릿</Label>
                      <Input
                        type="password"
                        value={config.sms.coolsms.apiSecret}
                        onChange={(e) => updateConfig('sms.coolsms.apiSecret', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>발신번호</Label>
                      <Input
                        placeholder="010-1234-5678"
                        value={config.sms.coolsms.senderPhone}
                        onChange={(e) => updateConfig('sms.coolsms.senderPhone', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Email Configuration Tab */}
          <TabsContent value="email" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>이메일 사업자 선택</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={config.email.provider}
                  onValueChange={(value) => updateConfig('email.provider', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sendgrid">SendGrid (추천)</SelectItem>
                    <SelectItem value="resend">Resend</SelectItem>
                    <SelectItem value="aws_ses">AWS SES</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {config.email.provider === 'sendgrid' && (
              <Card>
                <CardHeader>
                  <CardTitle>SendGrid 설정</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>API 키</Label>
                    <Input
                      type="password"
                      value={config.email.sendgrid.apiKey}
                      onChange={(e) => updateConfig('email.sendgrid.apiKey', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>발신 이메일</Label>
                      <Input
                        type="email"
                        placeholder="noreply@clinic.com"
                        value={config.email.sendgrid.fromEmail}
                        onChange={(e) => updateConfig('email.sendgrid.fromEmail', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>발신자 이름</Label>
                      <Input
                        placeholder="클리닉 이름"
                        value={config.email.sendgrid.fromName}
                        onChange={(e) => updateConfig('email.sendgrid.fromName', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleSaveConfig}>
            <Save className="h-4 w-4 mr-2" />
            설정 저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
