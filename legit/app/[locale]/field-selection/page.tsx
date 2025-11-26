"use client";

import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Stethoscope,
  GraduationCap,
  ArrowRight,
  Building2,
  BookOpen,
  Users,
  Calendar,
  MessageSquare
} from "lucide-react";

const fields = [
  {
    id: "medical",
    title: "의료",
    subtitle: "병원/의원",
    description: "안과, 성형외과, 피부과 등 의료기관을 위한 자동화 솔루션",
    icon: Stethoscope,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    features: [
      "환자 관리 및 예약 시스템",
      "수술 후 자동 케어",
      "마케팅 캠페인 자동화",
      "카카오톡/SMS 연동"
    ],
    examples: ["안과", "성형외과", "피부과", "치과"]
  },
  {
    id: "education",
    title: "교육",
    subtitle: "학원/교육기관",
    description: "학원, 교육센터, 학습관을 위한 학생 관리 및 자동화 솔루션",
    icon: GraduationCap,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    features: [
      "학생 및 학부모 관리",
      "수업 일정 및 출결 관리",
      "진행 상황 보고서",
      "학습 리마인더 자동화"
    ],
    examples: ["영어 학원", "수학 학원", "예체능 학원", "입시 학원"]
  }
];

export default function FieldSelectionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const router = useRouter();

  const handleFieldSelect = (fieldId: string) => {
    if (fieldId === "medical") {
      router.push("/sign-up");
    } else if (fieldId === "education") {
      router.push("/education-setup");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              어떤 분야의
              <br />
              <span className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                자동화 솔루션
              </span>
              이 필요하신가요?
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              귀하의 비즈니스 유형에 맞는 최적화된 자동화 플랫폼을 선택하세요
            </p>
          </div>

          {/* Field Selection Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {fields.map((field) => (
              <Card
                key={field.id}
                className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-none shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden"
              >
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-16 h-16 rounded-2xl ${field.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <field.icon className={`h-8 w-8 ${field.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors">
                        {field.title}
                      </CardTitle>
                      <CardDescription className="text-lg">
                        {field.subtitle}
                      </CardDescription>
                    </div>
                  </div>
                  <CardDescription className="text-base leading-relaxed">
                    {field.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      주요 기능
                    </h4>
                    <ul className="space-y-2">
                      {field.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Examples */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      적용 분야
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {field.examples.map((example, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-sm text-slate-700 dark:text-slate-300"
                        >
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button
                    className="w-full h-12 text-lg rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group-hover:bg-primary/90"
                    onClick={() => handleFieldSelect(field.id)}
                  >
                    {field.title} 솔루션 선택
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stats */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Users className="h-4 w-4" />
              500개 이상의 기관이 DoctorsFlow를 사용하고 있습니다
            </div>
          </div>

          {/* Back to home */}
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="gap-2"
            >
              ← 처음으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
