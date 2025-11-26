"use client";

import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  BookOpen,
  Users,
  ArrowRight,
  ArrowLeft,
  School,
  Building,
  Palette,
  Calculator,
  Languages,
  Trophy
} from "lucide-react";

const educationTypes = [
  {
    id: "hagwon",
    title: "학원",
    description: "개인 및 그룹 수업을 제공하는 사설 교육 기관",
    icon: GraduationCap,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    examples: ["영어 학원", "수학 학원", "입시 학원"],
    features: [
      "학생 및 학부모 관리",
      "수업 일정 관리",
      "진행 상황 보고",
      "결제 및 수강료 관리"
    ]
  },
  {
    id: "school",
    title: "학교",
    description: "정규 교육 과정을 제공하는 교육 기관",
    icon: School,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    examples: ["초등학교", "중학교", "고등학교"],
    features: [
      "학생 정보 관리",
      "수업 및 시간표 관리",
      "성적 및 평가 관리",
      "학부모 소통 시스템"
    ]
  },
  {
    id: "academy_center",
    title: "교육센터",
    description: "특정 분야 전문 교육을 제공하는 센터",
    icon: Building,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    examples: ["어학센터", "예술센터", "스포츠센터"],
    features: [
      "회원 관리 시스템",
      "프로그램 관리",
      "시설 예약 시스템",
      "수강 신청 및 관리"
    ]
  },
  {
    id: "specialized",
    title: "전문 교육원",
    description: "특정 기술이나 자격증 교육을 제공하는 기관",
    icon: Trophy,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    examples: ["컴퓨터 학원", "요리 학원", "자격증 학원"],
    features: [
      "커리큘럼 관리",
      "실습 일정 관리",
      "자격증 발급 추적",
      "취업 지원 시스템"
    ]
  }
];

const subjectCategories = [
  {
    category: "학문",
    icon: BookOpen,
    subjects: ["국어", "영어", "수학", "과학", "사회", "역사"]
  },
  {
    category: "예체능",
    icon: Palette,
    subjects: ["미술", "음악", "무용", "체육", "연기", "사진"]
  },
  {
    category: "전문 기술",
    icon: Calculator,
    subjects: ["컴퓨터", "코딩", "디자인", "요리", "제빙", "미용"]
  },
  {
    category: "어학",
    icon: Languages,
    subjects: ["영어회화", "중국어", "일본어", "독일어", "프랑스어"]
  }
];

export default function EducationSetupPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const router = useRouter();

  const handleEducationTypeSelect = (typeId: string) => {
    // For now, route to sign-up. Later we can create specific onboarding flows
    if (typeId === "hagwon") {
      router.push("/sign-up?type=hagwon");
    } else {
      router.push("/sign-up?type=" + typeId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/field-selection')}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">
                교육 분야
                <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  세부 유형
                </span>
                선택
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">
                귀하의 교육 기관 유형을 선택해주세요
              </p>
            </div>
          </div>
        </div>

        {/* Education Type Selection */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {educationTypes.map((type) => (
              <Card
                key={type.id}
                className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-none shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm"
              >
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl ${type.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <type.icon className={`h-6 w-6 ${type.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                        {type.title}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {type.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Examples */}
                  <div>
                    <h4 className="font-medium mb-2 text-sm text-slate-700 dark:text-slate-300">
                      예시 기관
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {type.examples.map((example, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-xs text-slate-600 dark:text-slate-400"
                        >
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <h4 className="font-medium mb-2 text-sm text-slate-700 dark:text-slate-300">
                      주요 기능
                    </h4>
                    <ul className="space-y-1">
                      {type.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <div className="w-1 h-1 bg-primary rounded-full flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <Button
                    className="w-full rounded-full shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                    onClick={() => handleEducationTypeSelect(type.id)}
                  >
                    {type.title} 선택
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Subject Categories Info */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">다양한 과목 지원</h2>
            <p className="text-slate-600 dark:text-slate-400">
              모든 교육 분야의 과목을 지원합니다
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {subjectCategories.map((category, index) => (
              <Card key={index} className="border-none shadow-sm bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <category.icon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{category.category}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {category.subjects.map((subject, subIndex) => (
                      <span
                        key={subIndex}
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs text-slate-600 dark:text-slate-400"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="max-w-4xl mx-auto mt-12 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/field-selection')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              분야 선택으로 돌아가기
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="gap-2"
            >
              처음으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
