'use client';

import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Sparkles,
  Wand2,
  Copy,
  Save,
  RefreshCw,
  MessageSquare,
  Clock,
  User,
  Stethoscope,
  Calendar,
  Phone,
  Mail,
  Zap,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface TemplateGenerationRequest {
  type: 'post_surgery_care' | 'pre_visit_reminder' | 'follow_up' | 'marketing';
  surgery_type?: string;
  patient_data?: {
    name: string;
    age?: number;
    surgery_date?: string;
    next_appointment?: string;
    phone?: string;
  };
  context?: {
    days_post_surgery?: number;
    urgency_level?: 'low' | 'medium' | 'high';
    language?: 'ko' | 'en';
  };
  custom_requirements?: string;
}

interface GeneratedTemplate {
  title: string;
  content: string;
  variables: string[];
  suggested_timing: string;
  channel_preference: 'kakao' | 'sms' | 'email';
}

interface AITemplateGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveTemplate?: (template: GeneratedTemplate) => void;
}

const SURGERY_TYPES = [
  { value: 'lasik', label: '라식/라섹', icon: '👁️' },
  { value: 'cataract', label: '백내장', icon: '👴' },
  { value: 'rhinoplasty', label: '코성형', icon: '👃' },
  { value: 'blepharoplasty_cos', label: '눈성형', icon: '👁️' },
  { value: 'general', label: '일반 수술', icon: '🏥' },
];

const TEMPLATE_TYPES = [
  {
    value: 'post_surgery_care',
    label: '수술 후 케어 안내',
    description: '수술 후 회복 지도 및 주의사항',
    icon: <Stethoscope className="h-5 w-5" />,
    color: 'bg-blue-50 border-blue-200'
  },
  {
    value: 'pre_visit_reminder',
    label: '예약 사전 안내',
    description: '진료 예약 전 준비사항 안내',
    icon: <Calendar className="h-5 w-5" />,
    color: 'bg-green-50 border-green-200'
  },
  {
    value: 'follow_up',
    label: '진료 경과 확인',
    description: '진료 후 상태 확인 및 안내',
    icon: <MessageSquare className="h-5 w-5" />,
    color: 'bg-purple-50 border-purple-200'
  },
  {
    value: 'marketing',
    label: '마케팅 메시지',
    description: '건강 정보 및 서비스 안내',
    icon: <Mail className="h-5 w-5" />,
    color: 'bg-orange-50 border-orange-200'
  },
];

export function AITemplateGenerator({ open, onOpenChange, onSaveTemplate }: AITemplateGeneratorProps) {
  const [selectedType, setSelectedType] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTemplate, setGeneratedTemplate] = useState<GeneratedTemplate | null>(null);
  const [formData, setFormData] = useState<TemplateGenerationRequest>({
    type: 'post_surgery_care',
    patient_data: {
      name: '',
      age: undefined,
      surgery_date: '',
      next_appointment: '',
      phone: '',
    },
    context: {
      days_post_surgery: 0,
      urgency_level: 'medium',
      language: 'ko',
    },
  });

  const handleGenerate = useCallback(async () => {
    if (!selectedType) {
      toast.error('템플릿 타입을 선택해주세요');
      return;
    }

    setIsGenerating(true);
    try {
      const requestData: TemplateGenerationRequest = {
        ...formData,
        type: selectedType as any,
      };

      const response = await fetch('/api/templates/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (result.success) {
        setGeneratedTemplate(result.template);
        toast.success('템플릿이 성공적으로 생성되었습니다!');
      } else {
        toast.error(`생성 실패: ${result.error}`);
      }
    } catch (error) {
      console.error('Template generation error:', error);
      toast.error('템플릿 생성 중 오류가 발생했습니다');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedType, formData]);

  const handleSaveTemplate = useCallback(() => {
    if (generatedTemplate && onSaveTemplate) {
      onSaveTemplate(generatedTemplate);
      toast.success('템플릿이 저장되었습니다');
      onOpenChange(false);
    }
  }, [generatedTemplate, onSaveTemplate, onOpenChange]);

  const handleCopyContent = useCallback(async () => {
    if (generatedTemplate) {
      await navigator.clipboard.writeText(generatedTemplate.content);
      toast.success('내용이 클립보드에 복사되었습니다');
    }
  }, [generatedTemplate]);

  const resetForm = () => {
    setSelectedType('');
    setGeneratedTemplate(null);
    setFormData({
      type: 'post_surgery_care',
      patient_data: {
        name: '',
        age: undefined,
        surgery_date: '',
        next_appointment: '',
        phone: '',
      },
      context: {
        days_post_surgery: 0,
        urgency_level: 'medium',
        language: 'ko',
      },
    });
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            AI 템플릿 생성기
          </DialogTitle>
          <DialogDescription>
            환자 데이터와 상황을 입력하면 AI가 개인화된 메시지를 즉시 생성합니다
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Input Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">템플릿 설정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Template Type Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">템플릿 타입</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {TEMPLATE_TYPES.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setSelectedType(type.value)}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          selectedType === type.value
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-primary/50'
                        } ${type.color}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {type.icon}
                          <span className="font-medium text-sm">{type.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{type.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Surgery Type (for post-surgery care) */}
                {selectedType === 'post_surgery_care' && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">수술 종류</Label>
                    <Select
                      value={formData.surgery_type || ''}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        surgery_type: value
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="수술 종류 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {SURGERY_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Patient Data */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">환자 정보</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">이름</Label>
                      <Input
                        placeholder="환자 이름"
                        value={formData.patient_data?.name || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          patient_data: {
                            ...prev.patient_data,
                            name: e.target.value
                          }
                        }))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">나이</Label>
                      <Input
                        type="number"
                        placeholder="나이"
                        value={formData.patient_data?.age || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          patient_data: {
                            ...prev.patient_data,
                            age: parseInt(e.target.value) || undefined
                          }
                        }))}
                      />
                    </div>
                  </div>

                  {selectedType === 'post_surgery_care' && (
                    <div>
                      <Label className="text-xs text-muted-foreground">수술 후 경과일</Label>
                      <Input
                        type="number"
                        placeholder="예: 3"
                        value={formData.context?.days_post_surgery || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          context: {
                            ...prev.context,
                            days_post_surgery: parseInt(e.target.value) || 0
                          }
                        }))}
                      />
                    </div>
                  )}
                </div>

                {/* Custom Requirements */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">추가 요구사항 (선택)</Label>
                  <Textarea
                    placeholder="특별히 강조하고 싶은 내용이나 추가 지시사항을 입력하세요..."
                    value={formData.custom_requirements || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      custom_requirements: e.target.value
                    }))}
                    rows={3}
                  />
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={!selectedType || isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      생성 중...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      AI로 템플릿 생성
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Generated Template Preview */}
          <div className="space-y-6">
            {generatedTemplate ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        생성된 템플릿
                      </CardTitle>
                      <CardDescription>{generatedTemplate.title}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyContent}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        복사
                      </Button>
                      {onSaveTemplate && (
                        <Button
                          size="sm"
                          onClick={handleSaveTemplate}
                        >
                          <Save className="h-4 w-4 mr-1" />
                          저장
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Template Metadata */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {generatedTemplate.suggested_timing}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      {generatedTemplate.channel_preference === 'kakao' && <MessageSquare className="h-3 w-3" />}
                      {generatedTemplate.channel_preference === 'sms' && <Phone className="h-3 w-3" />}
                      {generatedTemplate.channel_preference === 'email' && <Mail className="h-3 w-3" />}
                      {generatedTemplate.channel_preference.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Variables Info */}
                  {generatedTemplate.variables.length > 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>사용 가능한 변수:</strong>{' '}
                        {generatedTemplate.variables.map(v => `{{${v}}}`).join(', ')}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Template Content */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">메시지 내용</Label>
                    <div className="bg-muted/50 rounded-lg p-4 border">
                      <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                        {generatedTemplate.content}
                      </pre>
                    </div>
                  </div>

                  {/* Regenerate Option */}
                  <div className="flex justify-center pt-4 border-t">
                    <Button
                      variant="ghost"
                      onClick={handleGenerate}
                      disabled={isGenerating}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      다시 생성
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <Wand2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    AI 템플릿 생성
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    왼쪽에서 템플릿 타입과 환자 정보를 입력한 후<br />
                    AI로 개인화된 메시지를 생성해보세요
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            닫기
          </Button>
          {generatedTemplate && (
            <Button onClick={handleGenerate} disabled={isGenerating}>
              <Zap className="h-4 w-4 mr-2" />
              새로 생성
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
