'use client';

/**
 * Bulk Campaign Builder
 * Create and schedule bulk marketing campaigns to patient segments
 */

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Send, 
  Users, 
  Calendar as CalendarIcon, 
  MessageSquare,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
} from 'lucide-react';
import { PatientFilters, SEGMENT_PRESETS } from '@/lib/patient-segmentation';

interface BulkCampaignBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCampaignCreated?: () => void;
}

type CampaignStep = 'segment' | 'message' | 'schedule' | 'review';

export function BulkCampaignBuilder({ 
  open, 
  onOpenChange,
  onCampaignCreated 
}: BulkCampaignBuilderProps) {
  const t = useTranslations();
  const [step, setStep] = useState<CampaignStep>('segment');
  
  // Campaign data
  const [campaignName, setCampaignName] = useState('');
  const [campaignDescription, setCampaignDescription] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<string>('custom');
  const [customFilters, setCustomFilters] = useState<PatientFilters>({});
  const [messageContent, setMessageContent] = useState('');
  const [channel, setChannel] = useState<'kakao' | 'sms'>('kakao');
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [sendImmediately, setSendImmediately] = useState(true);
  
  // Preview data
  const [patientCount, setPatientCount] = useState<number | null>(null);
  const [isLoadingCount, setIsLoadingCount] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Reset on open
  useEffect(() => {
    if (open) {
      setStep('segment');
      setCampaignName('');
      setCampaignDescription('');
      setSelectedSegment('custom');
      setCustomFilters({});
      setMessageContent('');
      setChannel('kakao');
      setScheduledDate(undefined);
      setScheduledTime('09:00');
      setSendImmediately(true);
      setPatientCount(null);
    }
  }, [open]);
  
  // Load patient count when filters change
  useEffect(() => {
    if (step === 'segment' && (selectedSegment !== 'custom' || Object.keys(customFilters).length > 0)) {
      loadPatientCount();
    }
  }, [selectedSegment, customFilters, step]);
  
  const loadPatientCount = async () => {
    setIsLoadingCount(true);
    try {
      const filters = selectedSegment === 'custom' 
        ? customFilters 
        : SEGMENT_PRESETS[selectedSegment] || {};
      
      const response = await fetch('/api/campaigns/preview-count', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters }),
      });
      
      const data = await response.json();
      if (data.success) {
        setPatientCount(data.count);
      } else {
        toast.error('환자 수 조회 실패', {
          description: data.error || '알 수 없는 오류가 발생했습니다.',
        });
      }
    } catch (error) {
      console.error('Failed to load patient count:', error);
      toast.error('환자 수 조회 실패');
    } finally {
      setIsLoadingCount(false);
    }
  };
  
  const handleNext = () => {
    if (step === 'segment') {
      if (!patientCount || patientCount === 0) {
        toast.error('선택된 환자가 없습니다', {
          description: '필터를 조정하여 환자를 선택해주세요.',
        });
        return;
      }
      setStep('message');
    } else if (step === 'message') {
      if (!messageContent.trim()) {
        toast.error('메시지 내용을 입력해주세요');
        return;
      }
      setStep('schedule');
    } else if (step === 'schedule') {
      setStep('review');
    }
  };
  
  const handleCreateCampaign = async () => {
    if (!campaignName.trim()) {
      toast.error('캠페인 이름을 입력해주세요');
      return;
    }
    
    setIsCreating(true);
    try {
      const filters = selectedSegment === 'custom' 
        ? customFilters 
        : SEGMENT_PRESETS[selectedSegment] || {};
      
      const scheduledAt = sendImmediately 
        ? undefined 
        : scheduledDate && scheduledTime
          ? new Date(`${format(scheduledDate, 'yyyy-MM-dd')}T${scheduledTime}`).toISOString()
          : undefined;
      
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: campaignName,
          description: campaignDescription,
          filters,
          messageContent,
          channel,
          scheduledAt,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('캠페인이 생성되었습니다', {
          description: sendImmediately 
            ? `${patientCount}명에게 메시지를 발송합니다.`
            : `예약된 시간에 자동으로 발송됩니다.`,
        });
        onCampaignCreated?.();
        onOpenChange(false);
      } else {
        toast.error('캠페인 생성 실패', {
          description: data.error || '알 수 없는 오류가 발생했습니다.',
        });
      }
    } catch (error) {
      console.error('Failed to create campaign:', error);
      toast.error('캠페인 생성 실패');
    } finally {
      setIsCreating(false);
    }
  };
  
  const getSegmentLabel = (key: string) => {
    const labels: Record<string, string> = {
      'recent_surgery_patients': '최근 수술 환자 (90일 이내)',
      'no_show_patients': '노쇼 환자',
      'cancelled_appointments': '예약 취소 환자',
      'upcoming_appointments': '예정된 예약 환자',
      'lasik_patients': '라식/라섹 환자',
      'rhinoplasty_patients': '코성형 환자',
      'inactive_patients': '비활성 환자 (180일 이상 미방문)',
      'custom': '사용자 정의',
    };
    return labels[key] || key;
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            대량 캠페인 생성
          </DialogTitle>
          <DialogDescription>
            환자 세그먼트를 선택하여 마케팅 메시지를 일괄 발송합니다
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          {/* Step 1: Segment Selection */}
          {step === 'segment' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>캠페인 이름</Label>
                <Input
                  placeholder="예: 2024년 봄 프로모션"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>설명 (선택사항)</Label>
                <Textarea
                  placeholder="캠페인에 대한 설명을 입력하세요"
                  value={campaignDescription}
                  onChange={(e) => setCampaignDescription(e.target.value)}
                  rows={2}
                />
              </div>
              
              <div className="space-y-4">
                <Label>대상 환자 세그먼트</Label>
                <Select value={selectedSegment} onValueChange={setSelectedSegment}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(SEGMENT_PRESETS).map((key) => (
                      <SelectItem key={key} value={key}>
                        {getSegmentLabel(key)}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">사용자 정의</SelectItem>
                  </SelectContent>
                </Select>
                
                {selectedSegment === 'custom' && (
                  <div className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Filter className="h-4 w-4" />
                      <span>필터 옵션 (향후 구현 예정)</span>
                    </div>
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        사용자 정의 필터는 곧 추가될 예정입니다. 현재는 미리 정의된 세그먼트를 사용해주세요.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
                
                {/* Patient Count Preview */}
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="text-sm font-medium">대상 환자 수</span>
                    </div>
                    {isLoadingCount ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : patientCount !== null ? (
                      <Badge variant="outline" className="text-lg">
                        {patientCount.toLocaleString()}명
                      </Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={loadPatientCount}
                      >
                        조회하기
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 2: Message Content */}
          {step === 'message' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>발송 채널</Label>
                <Select value={channel} onValueChange={(v: 'kakao' | 'sms') => setChannel(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kakao">카카오톡 (AlimTalk/FriendTalk)</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>메시지 내용</Label>
                <Textarea
                  placeholder="환자에게 발송할 메시지를 입력하세요. {{patient_name}} 변수를 사용할 수 있습니다."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  사용 가능한 변수: {`{{patient_name}}, {{appointment_date}}, {{last_visit_date}}`}
                </p>
              </div>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>의료법 준수:</strong> 마케팅 메시지는 의료광고심의위원회(KMAA) 승인을 받아야 합니다.
                  과장된 표현이나 보장성 문구를 사용하지 마세요.
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          {/* Step 3: Schedule */}
          {step === 'schedule' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="send-immediately"
                    checked={sendImmediately}
                    onCheckedChange={(checked) => setSendImmediately(checked as boolean)}
                  />
                  <Label htmlFor="send-immediately" className="cursor-pointer">
                    즉시 발송
                  </Label>
                </div>
                
                {!sendImmediately && (
                  <div className="space-y-4 pl-6 border-l-2">
                    <div className="space-y-2">
                      <Label>발송 날짜</Label>
                      <Input
                        type="date"
                        value={scheduledDate ? scheduledDate.toISOString().split('T')[0] : ''}
                        onChange={(e) => setScheduledDate(e.target.value ? new Date(e.target.value) : undefined)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>발송 시간</Label>
                      <Input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Step 4: Review */}
          {step === 'review' && (
            <div className="space-y-6">
              <div className="grid gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-sm font-medium mb-2">캠페인 정보</div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>이름: {campaignName}</div>
                    {campaignDescription && <div>설명: {campaignDescription}</div>}
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="text-sm font-medium mb-2">대상 환자</div>
                  <div className="text-sm text-muted-foreground">
                    세그먼트: {getSegmentLabel(selectedSegment)}
                  </div>
                  <div className="text-sm font-semibold mt-2">
                    총 {patientCount?.toLocaleString()}명
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="text-sm font-medium mb-2">메시지</div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>채널: {channel === 'kakao' ? '카카오톡' : 'SMS'}</div>
                    <div className="mt-2 p-2 bg-muted rounded text-xs font-mono">
                      {messageContent}
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="text-sm font-medium mb-2">발송 일정</div>
                  <div className="text-sm text-muted-foreground">
                    {sendImmediately ? (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        즉시 발송
                      </div>
                    ) : (
                      <div>
                        {scheduledDate && scheduledTime
                          ? `${scheduledDate.toLocaleDateString('ko-KR')} ${scheduledTime}`
                          : '일정 미지정'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => {
            if (step === 'segment') {
              onOpenChange(false);
            } else {
              setStep((prev) => {
                const steps: CampaignStep[] = ['segment', 'message', 'schedule', 'review'];
                const currentIndex = steps.indexOf(prev);
                return steps[Math.max(0, currentIndex - 1)];
              });
            }
          }}>
            {step === 'segment' ? '취소' : '이전'}
          </Button>
          
          {step !== 'review' ? (
            <Button onClick={handleNext}>
              다음
            </Button>
          ) : (
            <Button onClick={handleCreateCampaign} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  캠페인 생성
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

