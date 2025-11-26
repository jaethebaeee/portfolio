import { MarketingGenerator } from "@/components/marketing-generator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Sparkles, Users } from "lucide-react";

export default function PatientMarketingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI 마케팅</h1>
        <p className="text-muted-foreground">
          AI로 환자 대상 맞춤형 마케팅 문구를 생성하세요
        </p>
      </div>

      {/* AI 마케팅 문구 생성기 */}
      <MarketingGenerator />

      {/* 마케팅 캠페인 카드 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 캠페인</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">진행 중인 캠페인</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">생성된 문구</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">이번 달 생성</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">타겟 환자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">마케팅 대상</p>
          </CardContent>
        </Card>
      </div>

      {/* 마케팅 가이드 */}
      <Card>
        <CardHeader>
          <CardTitle>마케팅 문구 작성 가이드</CardTitle>
          <CardDescription>
            효과적인 마케팅 문구를 작성하기 위한 팁
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">✅ 좋은 예시</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>"생일을 맞이하여 특별 할인 쿠폰을 드립니다"</li>
                <li>"예약 확인 및 방문 안내 드립니다"</li>
                <li>"신규 고객 환영 이벤트 진행 중"</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">❌ 피해야 할 예시</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>"증상이 있으시면 방문해주세요" (의료 용어 사용)</li>
                <li>"진단 결과 안내" (의료 용어 사용)</li>
                <li>"치료 과정 설명" (의료 용어 사용)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

