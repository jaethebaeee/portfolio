"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SpeechTextarea } from "@/components/ui/speech-textarea";
import { Consultation } from "@/lib/database.types";
import { Patient } from "@/lib/database.types";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Type definitions
type ConsultationStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'noshow';
type ConsultationOutcome = 'surgery_booked' | 'deposit_paid' | 'considering' | 'follow_up_needed' | 'lost';
type ConsultationSource = 'gangnam_unni' | 'babitalk' | 'naver_place' | 'naver_blog' | 'instagram' | 'youtube' | 'friend' | 'walk_in' | 'website' | 'etc';

interface ConsultationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<Consultation>) => Promise<void>;
  initialData?: Consultation;
  patients: Patient[];
}

export function ConsultationDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  initialData,
  patients 
}: ConsultationDialogProps) {
  const [loading, setLoading] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  
  const getInitialFormData = (): Partial<Consultation> => {
    if (initialData) {
      return {
        ...initialData,
        consultation_date: initialData.consultation_date?.split('T')[0] || new Date().toISOString().split('T')[0],
        follow_up_date: initialData.follow_up_date ? initialData.follow_up_date.split('T')[0] : undefined,
      };
    }
    return {
      status: 'scheduled',
      consultation_date: new Date().toISOString().split('T')[0],
      source: 'walk_in',
      quoted_price: 0,
      deposit_amount: 0,
      notes: '',
      follow_up_date: undefined,
      follow_up_notes: ''
    };
  };

  const [formData, setFormData] = useState<Partial<Consultation>>(getInitialFormData());

  useEffect(() => {
    if (open) {
      setFormData(getInitialFormData());
      setIsAiProcessing(false);
    }
  }, [open, initialData?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData = {
        ...formData,
        consultation_date: formData.consultation_date 
          ? new Date(formData.consultation_date).toISOString()
          : new Date().toISOString(),
        follow_up_date: formData.follow_up_date || null, // Ensure null if empty for DB
      };
      await onSubmit(submitData);
      onOpenChange(false);
      setFormData(getInitialFormData());
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleAiFormat = async () => {
    if (!formData.notes || formData.notes.trim().length === 0) {
      toast.error("분석할 상담 내용이 없습니다.");
      return;
    }

    // Check minimum length for meaningful analysis
    if (formData.notes.trim().length < 10) {
      toast.error("상담 내용이 너무 짧습니다. 최소 10자 이상 입력해주세요.");
      return;
    }

    // Check maximum length to avoid API issues
    if (formData.notes.length > 5000) {
      toast.error("상담 내용이 너무 깁니다. 5000자 이하로 입력해주세요.");
      return;
    }

    setIsAiProcessing(true);
    
    try {
      // 환자 정보 가져오기
      const selectedPatient = patients.find(p => p.id === formData.patient_id);
      const patientName = selectedPatient?.name;
      
      // 관심 시술 정보 추출 (formData.interested_procedures가 있다면)
      // Note: interested_procedures는 JSONB 타입이므로 안전하게 처리
      let procedureType: string | undefined;
      if (formData.interested_procedures) {
        if (Array.isArray(formData.interested_procedures)) {
          procedureType = formData.interested_procedures.join(', ');
        } else if (typeof formData.interested_procedures === 'object') {
          procedureType = JSON.stringify(formData.interested_procedures);
        } else {
          procedureType = String(formData.interested_procedures);
        }
      }

      const response = await fetch('/api/groq/format-consultation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rawNotes: formData.notes,
          patientName,
          consultationDate: formData.consultation_date,
          procedureType,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        toast.error(result.error || "AI 포맷팅에 실패했습니다.");
        setIsAiProcessing(false);
        return;
      }

      if (result.formattedNote) {
        setFormData(prev => ({ ...prev, notes: result.formattedNote }));
        toast.success("AI가 상담 내용을 SOAP 형식으로 정리했습니다.");
      } else {
        toast.error("포맷팅된 노트를 받지 못했습니다.");
      }
    } catch (error: any) {
      console.error("AI formatting error:", error);
      toast.error("AI 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsAiProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? '상담 기록 수정' : '새 상담 등록'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patient">환자 선택</Label>
              <Select 
                value={formData.patient_id} 
                onValueChange={(val) => setFormData({...formData, patient_id: val})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="환자 선택" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name} ({p.phone})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">상담 일자</Label>
              <Input 
                id="date" 
                type="date"
                value={formData.consultation_date?.split('T')[0]}
                onChange={(e) => setFormData({...formData, consultation_date: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="counselor">상담실장</Label>
              <Input 
                id="counselor" 
                value={formData.counselor_name || ''}
                onChange={(e) => setFormData({...formData, counselor_name: e.target.value})}
                placeholder="담당 실장명"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doctor">담당 원장</Label>
              <Input 
                id="doctor" 
                value={formData.doctor_name || ''}
                onChange={(e) => setFormData({...formData, doctor_name: e.target.value})}
                placeholder="담당 원장명"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source">유입 경로</Label>
              <Select 
                value={formData.source} 
                onValueChange={(val) => setFormData({...formData, source: val as ConsultationSource})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="유입 경로" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gangnam_unni">강남언니</SelectItem>
                  <SelectItem value="babitalk">바비톡</SelectItem>
                  <SelectItem value="naver_place">네이버 예약</SelectItem>
                  <SelectItem value="naver_blog">블로그</SelectItem>
                  <SelectItem value="friend">지인 소개</SelectItem>
                  <SelectItem value="walk_in">내원 (Walk-in)</SelectItem>
                  <SelectItem value="etc">기타</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">상담 상태</Label>
              <Select 
                value={formData.status} 
                onValueChange={(val) => setFormData({...formData, status: val as ConsultationStatus})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">예약됨</SelectItem>
                  <SelectItem value="in_progress">상담 중</SelectItem>
                  <SelectItem value="completed">상담 완료</SelectItem>
                  <SelectItem value="cancelled">취소됨</SelectItem>
                  <SelectItem value="noshow">노쇼</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="outcome">상담 결과</Label>
              <Select 
                value={formData.outcome || ''} 
                onValueChange={(val) => setFormData({...formData, outcome: val as ConsultationOutcome})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="결과 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="surgery_booked">수술 예약</SelectItem>
                  <SelectItem value="deposit_paid">예약금 납부</SelectItem>
                  <SelectItem value="considering">고민중</SelectItem>
                  <SelectItem value="follow_up_needed">재연락 필요</SelectItem>
                  <SelectItem value="lost">이탈</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deposit">예약금 (원)</Label>
              <Input 
                id="deposit" 
                type="number"
                value={formData.deposit_amount || 0}
                onChange={(e) => setFormData({...formData, deposit_amount: parseInt(e.target.value) || 0})}
                min="0"
              />
            </div>
          </div>

          {/* Follow-up Section - Only show if 'follow_up_needed' is selected */}
          {formData.outcome === 'follow_up_needed' && (
            <div className="p-4 bg-yellow-50 rounded-md border border-yellow-100 space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="follow_up_date" className="text-yellow-800">재연락 예정일</Label>
                  <Input 
                    id="follow_up_date" 
                    type="date"
                    value={formData.follow_up_date || ''}
                    onChange={(e) => setFormData({...formData, follow_up_date: e.target.value})}
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="follow_up_notes" className="text-yellow-800">재연락 메모</Label>
                  <Input 
                    id="follow_up_notes" 
                    value={formData.follow_up_notes || ''}
                    onChange={(e) => setFormData({...formData, follow_up_notes: e.target.value})}
                    placeholder="예: 비용 문제로 고민 중, 3일 뒤 연락"
                    className="bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quoted_price">견적 금액 (원)</Label>
              <Input 
                id="quoted_price" 
                type="number"
                value={formData.quoted_price || 0}
                onChange={(e) => setFormData({...formData, quoted_price: parseInt(e.target.value) || 0})}
                min="0"
                placeholder="예상 비용"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="notes">상담 메모 (음성 입력 가능)</Label>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className={`h-7 text-xs transition-all ${
                  isAiProcessing 
                    ? 'text-purple-500 cursor-wait' 
                    : formData.notes && formData.notes.trim().length > 0
                    ? 'text-purple-600 hover:text-purple-700 hover:bg-purple-50'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
                onClick={handleAiFormat}
                disabled={isAiProcessing || !formData.notes || formData.notes.trim().length === 0}
              >
                {isAiProcessing ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    AI 분석 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI SOAP 정리
                  </>
                )}
              </Button>
            </div>
            {isAiProcessing && (
              <div className="flex items-center gap-2 text-xs text-purple-600 bg-purple-50 p-2 rounded-md">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>AI가 상담 내용을 SOAP 형식으로 구조화하고 있습니다...</span>
              </div>
            )}
            <SpeechTextarea 
              id="notes" 
              value={formData.notes || ''}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              onValueChange={(val) => setFormData({...formData, notes: val})}
              placeholder="상담 내용, 특이사항 등을 입력하세요. (마이크 버튼으로 음성 입력 가능, AI 버튼으로 SOAP 형식 자동 정리)"
              disabled={isAiProcessing}
              className={isAiProcessing ? 'opacity-60 cursor-wait' : ''}
              maxLength={5000}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 mt-1">
                💡 팁: 상담 내용을 입력한 후 "AI SOAP 정리" 버튼을 클릭하면 자동으로 구조화된 의료 기록 형식으로 정리됩니다.
              </p>
              <span className="text-xs text-gray-400 mt-1">
                {formData.notes?.length || 0} / 5000자
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading || isAiProcessing}
            >
              취소
            </Button>
            <Button type="submit" disabled={loading || isAiProcessing}>
              {loading ? '저장 중...' : '저장하기'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
