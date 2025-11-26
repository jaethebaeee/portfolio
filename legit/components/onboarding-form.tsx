'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Stethoscope, GraduationCap, User, Users, Building2 } from 'lucide-react';

type OnboardingStep = 'business-type' | 'practice-size' | 'user-role' | 'details';

export default function OnboardingForm({ locale }: { locale: string }) {
  const searchParams = useSearchParams();
  const initialBusinessType = searchParams.get('type') || 'medical';
  const router = useRouter();

  // Form state
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(
    initialBusinessType === 'medical' ? 'practice-size' : 'business-type'
  );
  const [businessType, setBusinessType] = useState(initialBusinessType);
  const [practiceSize, setPracticeSize] = useState('');
  const [userRole, setUserRole] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNextStep = () => {
    if (currentStep === 'business-type') {
      setCurrentStep('practice-size');
    } else if (currentStep === 'practice-size') {
      setCurrentStep('user-role');
    } else if (currentStep === 'user-role') {
      setCurrentStep('details');
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 'details') {
      setCurrentStep('user-role');
    } else if (currentStep === 'user-role') {
      setCurrentStep('practice-size');
    } else if (currentStep === 'practice-size') {
      setCurrentStep('business-type');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalName,
          businessType,
          practiceSize,
          userRole,
          specialty: specialty || null
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save profile');
      }

      router.push(`/${locale}/dashboard`);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'business-type':
        return (
          <>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>사업 유형 선택</CardTitle>
                  <CardDescription>
                    어떤 분야의 서비스를 이용하시나요?
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>사업 유형</Label>
                <Select value={businessType} onValueChange={setBusinessType}>
                  <SelectTrigger>
                    <SelectValue placeholder="사업 유형을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medical">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4" />
                        의료 기관 (병원, 클리닉)
                      </div>
                    </SelectItem>
                    <SelectItem value="hagwon">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        교육 기관 (학원, 학교)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleNextStep} className="w-full">
                다음
              </Button>
            </CardFooter>
          </>
        );

      case 'practice-size':
        if (businessType !== 'medical') {
          // Skip to details for non-medical
          setCurrentStep('details');
          return null;
        }

        return (
          <>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>진료실 형태</CardTitle>
                  <CardDescription>
                    귀하의 진료실은 어떤 형태인가요?
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>진료실 규모</Label>
                <Select value={practiceSize} onValueChange={setPracticeSize}>
                  <SelectTrigger>
                    <SelectValue placeholder="진료실 형태를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        개인 진료실 (나 혼자 운영)
                      </div>
                    </SelectItem>
                    <SelectItem value="small_team">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        의사 + 원무과장 (2-3명 팀)
                      </div>
                    </SelectItem>
                    <SelectItem value="clinic">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        병원/클리닉 (여러 의사 + 스태프)
                      </div>
                    </SelectItem>
                    <SelectItem value="hospital_chain">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        병원 체인/그룹 (다수의 지점)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline" onClick={handlePrevStep} className="flex-1">
                이전
              </Button>
              <Button onClick={handleNextStep} className="flex-1">
                다음
              </Button>
            </CardFooter>
          </>
        );

      case 'user-role':
        if (businessType !== 'medical' || practiceSize === 'individual') {
          // Skip role selection for non-medical or individual practices
          setCurrentStep('details');
          return null;
        }

        return (
          <>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>사용자 역할</CardTitle>
                  <CardDescription>
                    귀하는 어떤 역할을 하시나요?
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>주요 역할</Label>
                <Select value={userRole} onValueChange={setUserRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="역할을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doctor">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4" />
                        의사 (환자 진료 담당)
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        원무과장/관리자 (업무 운영 담당)
                      </div>
                    </SelectItem>
                    <SelectItem value="manager">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        병원장/총괄 (전체 관리 담당)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline" onClick={handlePrevStep} className="flex-1">
                이전
              </Button>
              <Button onClick={handleNextStep} className="flex-1">
                다음
              </Button>
            </CardFooter>
          </>
        );

      case 'details':
        const isMedical = businessType === 'medical';
        const config = {
          title: isMedical ? "병원 정보 입력" : "기관 정보 입력",
          description: "서비스 이용을 위해 기관 이름을 입력해주세요.",
          label: isMedical ? "병원명" : "기관명",
          placeholder: isMedical ? "예: 서울아산병원" : "예: 서울 영어 학원",
          icon: isMedical ? Stethoscope : GraduationCap
        };

        return (
          <>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <config.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>{config.title}</CardTitle>
                  <CardDescription>
                    {config.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hospitalName">{config.label}</Label>
                  <Input
                    id="hospitalName"
                    placeholder={config.placeholder}
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    required
                  />
                </div>

                {isMedical && userRole === 'doctor' && (
                  <div className="space-y-2">
                    <Label htmlFor="specialty">진료과 (선택사항)</Label>
                    <Select value={specialty} onValueChange={setSpecialty}>
                      <SelectTrigger>
                        <SelectValue placeholder="진료과를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ophthalmology">안과</SelectItem>
                        <SelectItem value="dermatology">피부과</SelectItem>
                        <SelectItem value="plastic_surgery">성형외과</SelectItem>
                        <SelectItem value="dentistry">치과</SelectItem>
                        <SelectItem value="internal_medicine">내과</SelectItem>
                        <SelectItem value="other">기타</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {error && <p className="text-sm text-red-500">{error}</p>}
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button type="button" variant="outline" onClick={handlePrevStep} className="flex-1">
                  이전
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      저장 중...
                    </>
                  ) : (
                    '시작하기'
                  )}
                </Button>
              </CardFooter>
            </form>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      {renderStepContent()}
    </Card>
  );
}

