"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CheckCircle2, Camera, AlertCircle, Frown, Meh, Smile } from "lucide-react";

function SurveyContent() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get("pid");
  const workflowId = searchParams.get("wid");
  const userId = searchParams.get("uid"); // 병원 ID
  const stepIndex = parseInt(searchParams.get("step") || "0");
  const type = searchParams.get("type") as 'survey' | 'photo' || 'survey';

  const [painLevel, setPainLevel] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!patientId || !userId) {
      toast.error("잘못된 접근입니다.");
      return;
    }

    if (type === 'survey' && painLevel === null) {
      toast.error("통증 정도를 선택해주세요.");
      return;
    }

    if (type === 'photo' && !selectedFile) {
      toast.error("사진을 선택해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      let responseValue = "";

      if (type === 'photo' && selectedFile) {
        // 실제 구현에서는 여기서 S3/Supabase Storage에 업로드하고 URL을 받아와야 함
        // MVP를 위해 가짜 URL 사용 또는 Base64 (작은 파일만)
        // 여기서는 시뮬레이션을 위해 파일명만 저장
        responseValue = `https://storage.example.com/uploads/${patientId}/${selectedFile.name}`;
        
        // 실제 파일 업로드 로직이 들어갈 자리
        // const formData = new FormData();
        // formData.append('file', selectedFile);
        // const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        // responseValue = (await uploadRes.json()).url;
      } else {
        responseValue = painLevel?.toString() || "0";
      }

      const res = await fetch('/api/happy-call/response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          patient_id: patientId,
          workflow_id: workflowId,
          step_index: stepIndex,
          response_type: type === 'survey' ? 'pain_level' : 'photo',
          response_value: responseValue,
          note: note // API에 note 필드 추가 필요
        })
      });

      if (res.ok) {
        setIsSubmitted(true);
      } else {
        const error = await res.json();
        toast.error(error.error || "제출 중 오류가 발생했습니다.");
      }
    } catch (e) {
      console.error(e);
      toast.error("네트워크 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md text-center py-10">
          <CardContent className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">제출 완료</h2>
            <p className="text-slate-600">
              소중한 정보가 담당 의료진에게 전달되었습니다.<br/>
              빠른 회복을 기원합니다.
            </p>
            {painLevel && painLevel >= 4 && (
              <div className="mt-6 p-4 bg-amber-50 text-amber-800 rounded-lg text-sm text-left">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p>
                    통증이 심하다고 응답하셨습니다. 담당 간호사가 곧 연락드릴 예정입니다. 
                    응급 상황 시 병원으로 바로 전화주세요.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">닥터스플로우 케어 센터</h1>
          <p className="text-slate-500">수술 후 회복 상태를 체크합니다</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {type === 'survey' ? '오늘 컨디션은 어떠신가요?' : '수술 부위 사진'}
            </CardTitle>
            <CardDescription>
              {type === 'survey' 
                ? '현재 느끼시는 통증이나 불편감 정도를 선택해주세요.' 
                : '정확한 상태 확인을 위해 밝은 곳에서 촬영해주세요.'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {type === 'survey' ? (
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => setPainLevel(level)}
                    className={`
                      aspect-square rounded-lg flex flex-col items-center justify-center gap-1 border-2 transition-all
                      ${painLevel === level 
                        ? level >= 4 
                          ? 'border-red-500 bg-red-50 text-red-700' 
                          : 'border-green-500 bg-green-50 text-green-700'
                        : 'border-slate-100 hover:border-slate-200 bg-white'
                      }
                    `}
                  >
                    <span className="text-xl font-bold">{level}</span>
                    <span className="text-[10px]">
                      {level === 1 ? '편안' : level === 5 ? '매우 아픔' : ''}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Camera className="w-10 h-10 mb-3 text-slate-400" />
                        <p className="mb-2 text-sm text-slate-500">
                          <span className="font-semibold">클릭하여 사진 촬영/업로드</span>
                        </p>
                        <p className="text-xs text-slate-500">PNG, JPG (최대 10MB)</p>
                      </div>
                    )}
                    <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="note">추가로 전하고 싶은 말씀</Label>
              <Textarea 
                id="note"
                placeholder="특이사항이 있다면 적어주세요."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>

          <CardFooter>
            <Button 
              className="w-full h-12 text-lg" 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? '제출 중...' : '제출하기'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function SurveyPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">로딩 중...</div>}>
      <SurveyContent />
    </Suspense>
  );
}

