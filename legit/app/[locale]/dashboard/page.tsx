"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3, Users, Calendar, DollarSign, TrendingUp, MessageSquare, Phone, GraduationCap, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { validateKoreanPhoneNumber, formatPhoneNumber } from "@/lib/phone-validation";
import { HappyCallAlerts } from "@/components/happy-call-alerts";
import { ExecutiveDashboard } from "@/components/executive-dashboard";
import { FeedbackReviewQueue } from "@/components/feedback-review-queue";
import { RoleBasedDashboard } from "@/components/role-based-dashboard";
import { FollowUpSummary } from "@/components/dashboard/follow-up-summary";
import { MarketingChart } from "@/components/dashboard/marketing-chart";
import { Profile } from "@/lib/profiles";

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [businessType, setBusinessType] = useState<string>('medical');
  const [isSending, setIsSending] = useState(false);
  const [isSendingSMS, setIsSendingSMS] = useState(false);
  const [kakaoPhoneNumber, setKakaoPhoneNumber] = useState("");
  const [smsPhoneNumber, setSmsPhoneNumber] = useState("");

  useEffect(() => {
    // Get full profile data
    const getProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const profileData = await response.json();
          setProfile(profileData);
          setBusinessType(profileData.business_type || 'medical');
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };
    getProfile();
  }, []);

  // 전화번호 입력 시 자동 포맷팅
  const handleKakaoPhoneChange = (value: string) => {
    // 숫자와 하이픈만 허용
    const cleaned = value.replace(/[^\d-]/g, "");
    setKakaoPhoneNumber(cleaned);
  };

  const handleSmsPhoneChange = (value: string) => {
    // 숫자와 하이픈만 허용
    const cleaned = value.replace(/[^\d-]/g, "");
    setSmsPhoneNumber(cleaned);
  };

  const handleSendTestMessage = async () => {
    // 전화번호 검증
    const validation = validateKoreanPhoneNumber(kakaoPhoneNumber);
    if (!validation.isValid) {
      toast.error("전화번호 오류", {
        description: validation.error || "올바른 전화번호를 입력해주세요.",
      });
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch('/api/kakao/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: validation.formatted,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("발송 완료", {
          description: data.message || `카카오톡 메시지가 ${validation.formatted}로 발송되었습니다.`,
        });
        setKakaoPhoneNumber(""); // 성공 시 입력 필드 초기화
      } else {
        toast.error("발송 실패", {
          description: data.error || "메시지 발송 중 오류가 발생했습니다.",
        });
      }
    } catch (error: any) {
      toast.error("오류", {
        description: error.message || "메시지 발송 중 오류가 발생했습니다.",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSendTestSMS = async () => {
    // 전화번호 검증
    const validation = validateKoreanPhoneNumber(smsPhoneNumber);
    if (!validation.isValid) {
      toast.error("전화번호 오류", {
        description: validation.error || "올바른 전화번호를 입력해주세요.",
      });
      return;
    }

    setIsSendingSMS(true);
    try {
      const response = await fetch('/api/nhn/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientPhone: validation.formatted,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("발송 완료", {
          description: data.message || `SMS가 ${validation.formatted}로 발송되었습니다.`,
        });
        setSmsPhoneNumber(""); // 성공 시 입력 필드 초기화
      } else {
        toast.error("발송 실패", {
          description: data.error || "SMS 발송 중 오류가 발생했습니다.",
        });
      }
    } catch (error: any) {
      toast.error("오류", {
        description: error.message || "SMS 발송 중 오류가 발생했습니다.",
      });
    } finally {
      setIsSendingSMS(false);
    }
  };

  const isHagwon = businessType === 'hagwon' || businessType === 'school' || businessType === 'academy_center' || businessType === 'specialized';

  // Show role-based dashboard if profile is loaded
  if (profile) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <RoleBasedDashboard profile={profile} />

        {/* Executive Summary Widget */}
        <ExecutiveDashboard />
      </div>
    );
  }

  // Fallback dashboard for when profile is not loaded yet
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent medical-heading">
          {businessType === 'hagwon' ? '학원 대시보드' : '닥터스플로우 대시보드'}
        </h1>
        <p className="text-muted-foreground text-lg medical-caption">
          {businessType === 'hagwon' ? '교육 자동화 현황을 한눈에 확인하세요' : '마케팅 자동화 현황을 한눈에 확인하세요'}
        </p>
      </div>

      {/* Executive Summary Widget */}
      <ExecutiveDashboard />

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-all duration-300 hover:border-primary/50 cursor-pointer group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium medical-text">
              {isHagwon ? '전체 학생' : '전체 환자'}
            </CardTitle>
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums medical-heading">1,234</div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1 medical-caption">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">+12.5%</span>
              <span>지난 달 대비</span>
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:border-primary/50 cursor-pointer group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium medical-text">
              {isHagwon ? '수업 수' : '전체 예약'}
            </CardTitle>
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
              <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums medical-heading">456</div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">+8.2%</span>
              <span>지난 달 대비</span>
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:border-primary/50 cursor-pointer group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium medical-text">
              {isHagwon ? '월 수강료 수입' : '총 매출'}
            </CardTitle>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
              <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums medical-heading">₩125,000,000</div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">+15.3%</span>
              <span>지난 달 대비</span>
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:border-primary/50 cursor-pointer group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium medical-text">
              {isHagwon ? '진행 중인 프로그램' : '진행 중인 캠페인'}
            </CardTitle>
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
              {isHagwon ? (
                <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              ) : (
                <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums medical-heading">8</div>
            <p className="text-xs text-muted-foreground mt-2">
              {isHagwon ? '활성 프로그램 수' : '활성 캠페인 수'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-yellow-400">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              카카오톡 테스트 발송
            </CardTitle>
            <CardDescription className="medical-caption">
              카카오톡 메시지 발송 기능을 테스트합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="kakao-phone" className="text-sm font-medium">수신자 전화번호</Label>
              <Input
                id="kakao-phone"
                type="tel"
                placeholder="010-1234-5678"
                value={kakaoPhoneNumber}
                onChange={(e) => handleKakaoPhoneChange(e.target.value)}
                disabled={isSending}
                className="w-full transition-all duration-200 focus:ring-2 focus:ring-yellow-400"
                maxLength={13}
              />
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                💡 전화번호를 입력하세요 (예: 010-1234-5678 또는 01012345678)
              </p>
            </div>
            <Button 
              onClick={handleSendTestMessage}
              disabled={isSending || !kakaoPhoneNumber.trim()}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              {isSending ? '발송 중' : '카톡 테스트 발송'}
            </Button>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                클릭하면 "라식 예약 테스트입니다" 메시지가 발송됩니다.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              문자 테스트
            </CardTitle>
            <CardDescription className="medical-caption">
              SMS 문자 발송 기능을 테스트합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sms-phone" className="text-sm font-medium">수신자 전화번호</Label>
              <Input
                id="sms-phone"
                type="tel"
                placeholder="010-1234-5678"
                value={smsPhoneNumber}
                onChange={(e) => handleSmsPhoneChange(e.target.value)}
                disabled={isSendingSMS}
                className="w-full transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                maxLength={13}
              />
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                💡 전화번호를 입력하세요 (예: 010-1234-5678 또는 01012345678)
              </p>
            </div>
            <Button 
              onClick={handleSendTestSMS}
              disabled={isSendingSMS || !smsPhoneNumber.trim()}
              className="w-full"
              variant="outline"
            >
              {isSendingSMS ? '발송 중' : '문자 테스트'}
            </Button>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                클릭하면 "성형 수술 D-1 리마인더" SMS가 발송됩니다.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 space-y-6">
          {/* Critical Feedback Queue */}
          <FeedbackReviewQueue />
          
          <HappyCallAlerts />
          
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                마케팅 성과
              </CardTitle>
              <CardDescription>최근 6개월간 문의 및 예약 추이</CardDescription>
            </CardHeader>
            <CardContent>
              <MarketingChart />
            </CardContent>
          </Card>
        </div>

        <div className="col-span-3 space-y-6">
          <FollowUpSummary />
          
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                최근 활동
              </CardTitle>
              <CardDescription>최근 환자 예약 및 캠페인 활동</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                  <div className="h-9 w-9 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20 transition-colors">
                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">신규 환자 등록</p>
                    <p className="text-xs text-muted-foreground">2시간 전</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                  <div className="h-9 w-9 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                    <MessageSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">캠페인 발송 완료</p>
                    <p className="text-xs text-muted-foreground">5시간 전</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                  <div className="h-9 w-9 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-500/20 transition-colors">
                    <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">예약 확정</p>
                    <p className="text-xs text-muted-foreground">1일 전</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
