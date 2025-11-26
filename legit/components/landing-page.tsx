"use client";

import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  BarChart3, 
  Megaphone, 
  Users, 
  Calendar, 
  Settings, 
  Stethoscope, 
  FileText, 
  Workflow, 
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Clock,
  Zap,
  Shield,
  Sparkles,
  Menu,
  X,
  LogIn,
  UserPlus
} from "lucide-react";
import { useState } from 'react';

const features = [
  {
    title: "대시보드",
    description: "전체 현황 및 지표 요약",
    icon: LayoutDashboard,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "환자 관리",
    description: "환자 정보 및 진료 이력",
    icon: Users,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    title: "예약 관리",
    description: "진료 및 수술 예약",
    icon: Calendar,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    title: "마케팅 캠페인",
    description: "타겟 마케팅 및 성과 분석",
    icon: Megaphone,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    title: "해피콜 워크플로우",
    description: "수술 후 자동 케어 시나리오",
    icon: Workflow,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
  },
  {
    title: "메시지 템플릿",
    description: "알림톡/문자 템플릿 관리",
    icon: FileText,
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
  },
  {
    title: "통계 및 분석",
    description: "데이터 기반 의사결정 지원",
    icon: BarChart3,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
  },
  {
    title: "설정",
    description: "계정 및 시스템 설정",
    icon: Settings,
    color: "text-slate-500",
    bgColor: "bg-slate-500/10",
  }
];

const benefits = [
  {
    icon: Clock,
    title: "시간 절약",
    description: "반복적인 업무를 자동화하여 하루 3시간 이상 절약"
  },
  {
    icon: TrendingUp,
    title: "환자 만족도 향상",
    description: "자동화된 케어로 환자 만족도 평균 40% 증가"
  },
  {
    icon: Zap,
    title: "즉시 시작",
    description: "복잡한 설정 없이 바로 사용 가능한 직관적인 인터페이스"
  },
  {
    icon: Shield,
    title: "안전한 데이터",
    description: "의료 데이터 보안 표준을 준수하는 안전한 플랫폼"
  }
];

const stats = [
  { value: "500+", label: "활성 병원" },
  { value: "50K+", label: "월간 메시지" },
  { value: "95%", label: "만족도" },
  { value: "3시간", label: "일일 절약 시간" }
];

const steps = [
  {
    number: "01",
    title: "계정 생성",
    description: "간단한 가입 절차로 바로 시작하세요"
  },
  {
    number: "02",
    title: "템플릿 설정",
    description: "환자 케어 메시지 템플릿을 만들거나 선택하세요"
  },
  {
    number: "03",
    title: "자동화 시작",
    description: "워크플로우를 설정하고 자동화를 시작하세요"
  },
  {
    number: "04",
    title: "성과 확인",
    description: "대시보드에서 실시간 성과를 확인하세요"
  }
];

export default function LandingPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Geometric Shapes */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-r from-emerald-400/15 to-cyan-400/15 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-gradient-to-r from-rose-400/20 to-pink-400/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-gradient-to-r from-amber-400/25 to-orange-400/25 rounded-full blur-lg animate-bounce" style={{ animationDuration: '3s', animationDelay: '1s' }}></div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMS41IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+Cjwvc3ZnPg==')] opacity-30"></div>

        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-primary/5 via-primary/3 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/5 via-blue-500/3 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }}></div>
      </div>
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                <Stethoscope className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                닥터스플로우
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/sign-in')}
                className="gap-2"
              >
                <LogIn className="h-4 w-4" />
                로그인
              </Button>
              <Button 
                onClick={() => router.push('/sign-up')}
                className="gap-2"
              >
                <UserPlus className="h-4 w-4" />
                무료 시작하기
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-2 animate-in slide-in-from-top">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2"
                onClick={() => {
                  router.push('/sign-in');
                  setMobileMenuOpen(false);
                }}
              >
                <LogIn className="h-4 w-4" />
                로그인
              </Button>
              <Button 
                className="w-full justify-start gap-2"
                onClick={() => {
                  router.push('/sign-up');
                  setMobileMenuOpen(false);
                }}
              >
                <UserPlus className="h-4 w-4" />
                무료 시작하기
              </Button>
            </div>
          )}
        </nav>
      </header>

      <main className="flex flex-col">
        {/* Hero Section */}
        <section className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-6xl mx-auto text-center space-y-8 relative z-10">
            {/* Floating Icons Around Header */}
            <div className="absolute inset-0 -top-20 pointer-events-none">
              <div className="absolute top-0 left-1/4 animate-float" style={{ animationDelay: '0s' }}>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <Stethoscope className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="absolute top-8 right-1/4 animate-float" style={{ animationDelay: '2s' }}>
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <MessageSquare className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
              <div className="absolute top-16 left-1/6 animate-float" style={{ animationDelay: '4s' }}>
                <div className="w-8 h-8 bg-gradient-to-br from-rose-500/20 to-pink-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <Calendar className="h-4 w-4 text-rose-600" />
                </div>
              </div>
              <div className="absolute top-4 right-1/6 animate-float" style={{ animationDelay: '1s' }}>
                <div className="w-11 h-11 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <Workflow className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-primary text-sm font-medium mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700 border border-white/20 shadow-lg">
              <Sparkles className="h-4 w-4 animate-pulse" />
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent font-semibold">
                안과·성형외과 전문 솔루션
              </span>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 relative">
              <span className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
                닥터스플로우
              </span>
              <br />
              <span className="text-slate-900 dark:text-slate-100 bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                마케팅 자동화 솔루션
              </span>
              {/* Decorative underline */}
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-primary via-blue-500 to-purple-500 rounded-full opacity-60 animate-pulse"></div>
            </h1>
            
            <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              복잡한 업무는 줄이고, 환자 케어에 집중하세요.<br className="hidden sm:block" />
              <span className="text-slate-500 dark:text-slate-500">안과·성형외과에 최적화된 환자 관리 및 마케팅 자동화 플랫폼</span>
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-blue-500 to-purple-500 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                <Button
                  size="lg"
                  className="relative h-16 px-10 text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto bg-gradient-to-r from-primary via-blue-600 to-purple-600 hover:from-primary/90 hover:via-blue-500 hover:to-purple-500 border-0"
                  onClick={() => router.push('/field-selection')}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    분야 선택하기
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
              </div>
              <Button
                size="lg"
                variant="outline"
                className="h-16 px-10 text-lg font-semibold rounded-full w-full sm:w-auto border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm"
                onClick={() => router.push('/sign-in')}
              >
                <span className="flex items-center gap-2">
                  로그인
                  <LogIn className="h-5 w-5" />
                </span>
              </Button>
            </div>

            {/* Enhanced Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 pt-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-400">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group cursor-pointer">
                  <div className="relative">
                    {/* Background glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-blue-500/10 to-purple-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Main stat card */}
                    <div className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                        {stat.value}
                      </div>
                      <div className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">
                        {stat.label}
                      </div>

                      {/* Decorative element */}
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-primary to-blue-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Benefits Section */}
        <section className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          {/* Section background with gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent rounded-3xl"></div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 shadow-lg mb-6">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  강력한 기능들
                </span>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              </div>

              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-slate-100 dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
                왜 닥터스플로우를
                <br />
                <span className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  선택해야 할까요?
                </span>
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                의료진의 업무 효율을 높이는 혁신적인 자동화 솔루션으로
                <br className="hidden sm:block" />
                <span className="font-semibold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  환자 케어의 새로운 기준
                </span>
                을 제시합니다
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="group relative">
                  {/* Hover glow effect */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <Card className="relative overflow-hidden hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 border-none shadow-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-md group-hover:bg-white/95 dark:group-hover:bg-slate-900/95">
                    {/* Card background pattern */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <CardHeader className="relative z-10 pb-6">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border border-white/20">
                          <benefit.icon className="h-8 w-8 text-primary group-hover:text-primary/80 transition-colors duration-300" />
                        </div>

                        {/* Floating particles */}
                        <div className="absolute -top-2 -right-2 w-3 h-3 bg-primary/40 rounded-full animate-ping opacity-0 group-hover:opacity-100" style={{ animationDelay: '0.2s' }}></div>
                        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-400/40 rounded-full animate-ping opacity-0 group-hover:opacity-100" style={{ animationDelay: '0.5s' }}></div>
                      </div>

                      <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors duration-300">
                        {benefit.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <CardDescription className="text-base leading-relaxed group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors duration-300">
                        {benefit.description}
                      </CardDescription>

                      {/* Bottom accent line */}
                      <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-primary to-blue-500 group-hover:w-full transition-all duration-500 rounded-b-lg"></div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {/* Decorative elements */}
            <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-full blur-3xl animate-pulse opacity-30"></div>
            <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse opacity-30" style={{ animationDelay: '2s' }}></div>
          </div>
        </section>

        {/* Enhanced Features Section */}
        <section className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 overflow-hidden">
          {/* Dynamic background */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-blue-50/30 to-purple-50/30 dark:from-slate-900/80 dark:via-slate-800/30 dark:to-slate-900/30"></div>

          {/* Floating background elements */}
          <div className="absolute top-1/3 left-1/4 w-24 h-24 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-32 h-32 bg-gradient-to-r from-purple-400/15 to-pink-400/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '3s' }}></div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-white/30 shadow-xl mb-6">
                <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
                <span className="text-sm font-semibold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  통합 솔루션
                </span>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
              </div>

              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-100 dark:to-slate-200 bg-clip-text text-transparent">
                  모든 기능을
                </span>
                <br />
                <span className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  한 곳에서
                </span>
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-4xl mx-auto leading-relaxed">
                환자 관리부터 마케팅 자동화까지,
                <br className="hidden sm:block" />
                <span className="font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  의료기관 운영의 모든 과정을 혁신
                </span>
                하는 통합 플랫폼
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {features.map((feature, index) => (
                <div key={index} className="group relative">
                  {/* Enhanced hover glow */}
                  <div className="absolute -inset-3 bg-gradient-to-r from-primary/10 via-blue-500/10 to-purple-500/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 scale-75 group-hover:scale-100"></div>

                  <Card className="relative overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-none shadow-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md group-hover:bg-white dark:group-hover:bg-slate-900 h-full">
                    {/* Animated background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Top accent line */}
                    <div className="absolute top-0 left-0 w-0 h-1 bg-gradient-to-r from-primary to-blue-500 group-hover:w-full transition-all duration-500"></div>

                    <CardHeader className="space-y-4 relative z-10 p-8">
                      <div className="relative">
                        <div className={`w-16 h-16 rounded-2xl ${feature.bgColor} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border-2 border-white/20 shadow-lg`}>
                          <feature.icon className={`h-8 w-8 ${feature.color} group-hover:scale-110 transition-transform duration-300`} />
                        </div>

                        {/* Floating accent dots */}
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary/60 rounded-full animate-bounce opacity-0 group-hover:opacity-100" style={{ animationDelay: '0.1s' }}></div>
                        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500/60 rounded-full animate-bounce opacity-0 group-hover:opacity-100" style={{ animationDelay: '0.3s' }}></div>
                      </div>

                      <div className="space-y-2">
                        <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors duration-300">
                          {feature.title}
                        </CardTitle>
                        <CardDescription className="text-base leading-relaxed group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors duration-300">
                          {feature.description}
                        </CardDescription>
                      </div>
                    </CardHeader>

                    {/* Bottom gradient bar */}
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-blue-500/20 to-purple-500/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                  </Card>
                </div>
              ))}
            </div>

            {/* Call to action within features section */}
            <div className="text-center mt-16">
              <div className="inline-flex items-center gap-4 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary/10 via-blue-500/10 to-purple-500/10 backdrop-blur-md border border-white/20 shadow-lg">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-lg font-semibold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  지금 바로 시작해서 효율적인 의료기관 운영을 경험해보세요
                </span>
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                시작하는 방법
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                간단한 4단계로 시작하세요
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  <Card className="h-full hover:shadow-lg transition-all duration-300 border-none shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                    <CardHeader>
                      <div className="text-4xl font-bold text-primary/20 mb-2">
                        {step.number}
                      </div>
                      <CardTitle className="text-lg font-semibold">
                        {step.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm">
                        {step.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                      <ArrowRight className="h-6 w-6 text-slate-300 dark:text-slate-700" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 overflow-hidden">
          {/* Dynamic background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-blue-500/5 to-purple-500/5 rounded-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary/10 via-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>

          <div className="max-w-5xl mx-auto relative z-10">
            <div className="text-center space-y-8">
              {/* Animated icon with glow */}
              <div className="relative inline-flex justify-center">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-blue-500 to-purple-500 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
                <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary via-blue-600 to-purple-600 text-white shadow-2xl animate-bounce">
                  <Stethoscope className="h-12 w-12 animate-pulse" />
                </div>
              </div>

              {/* Enhanced title with animations */}
              <div className="space-y-4">
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
                  <span className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-100 dark:to-slate-200 bg-clip-text text-transparent">
                    지금 바로
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent animate-pulse">
                    시작하세요
                  </span>
                </h2>

                <div className="flex items-center justify-center gap-2 text-lg text-slate-600 dark:text-slate-400">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
                  <span>무료로 가입하고</span>
                  <span className="font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    환자 관리의 새로운 경험
                  </span>
                  <span>을 시작하세요</span>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                </div>
              </div>

              {/* Enhanced CTA buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
                <div className="relative group">
                  <div className="absolute -inset-2 bg-gradient-to-r from-primary via-blue-500 to-purple-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 animate-tilt"></div>
                  <Button
                    size="lg"
                    className="relative h-16 px-10 text-lg font-bold rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 w-full sm:w-auto bg-gradient-to-r from-primary via-blue-600 to-purple-600 hover:from-primary/90 hover:via-blue-500 hover:to-purple-500 border-0 group"
                    onClick={() => router.push('/field-selection')}
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      분야 선택하기
                      <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-2 group-hover:scale-110" />
                    </span>
                  </Button>
                </div>

                <Button
                  size="lg"
                  variant="outline"
                  className="h-16 px-10 text-lg font-semibold rounded-full w-full sm:w-auto border-2 hover:border-primary/60 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md"
                  onClick={() => router.push('/sign-in')}
                >
                  <span className="flex items-center gap-2">
                    <LogIn className="h-5 w-5" />
                    이미 계정이 있으신가요?
                  </span>
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="pt-12 flex flex-col items-center gap-6">
                <div className="flex items-center gap-8 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span>무료 시작</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                    <span>14일 무료 체험</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                    <span>취소 언제든지 가능</span>
                  </div>
                </div>

                {/* Social proof */}
                <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/30 shadow-lg">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white text-xs font-bold">김</div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white text-xs font-bold">이</div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white text-xs font-bold">박</div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-rose-400 to-rose-600 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white text-xs font-bold">최</div>
                  </div>
                  <span className="text-sm font-medium">
                    <span className="font-bold text-primary">500+</span> 개 기관이 이미 사용 중
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Enhanced Footer */}
      <footer className="relative border-t bg-gradient-to-br from-white/80 via-slate-50/50 to-blue-50/30 dark:from-slate-900/80 dark:via-slate-800/50 dark:to-slate-900/30 backdrop-blur-md overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMS41IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIi8+Cjwvc3ZnPg==')] opacity-40"></div>
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-gradient-to-r from-primary/5 to-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-3xl"></div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 mb-12">
            {/* Company Info */}
            <div className="md:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-500 rounded-2xl blur-lg opacity-30"></div>
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-xl">
                    <Stethoscope className="h-7 w-7" />
                  </div>
                </div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    닥터스플로우
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      마케팅 자동화 플랫폼
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-md">
                안과·성형외과를 위한 혁신적인 환자 관리 및 마케팅 자동화 솔루션으로
                의료진의 업무 효율을 극대화합니다.
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500/20 to-blue-600/20 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                  <span className="text-blue-600 font-bold text-sm">f</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-sky-500/20 to-sky-600/20 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                  <span className="text-sky-600 font-bold text-sm">t</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-rose-500/20 to-rose-600/20 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                  <span className="text-rose-600 font-bold text-sm">i</span>
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                제품
              </h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors flex items-center gap-2 group">
                    <div className="w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    환자 관리
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors flex items-center gap-2 group">
                    <div className="w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    마케팅 자동화
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors flex items-center gap-2 group">
                    <div className="w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    워크플로우
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors flex items-center gap-2 group">
                    <div className="w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    통계 분석
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                지원
              </h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors flex items-center gap-2 group">
                    <div className="w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    문서
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors flex items-center gap-2 group">
                    <div className="w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    가이드
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors flex items-center gap-2 group">
                    <div className="w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors flex items-center gap-2 group">
                    <div className="w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    고객 지원
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom section */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                <span>© 2025 DoctorsFlow. All rights reserved.</span>
                <div className="hidden md:block w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
                <span>개인정보처리방침</span>
                <div className="hidden md:block w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
                <span>이용약관</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Made with ❤️ for Korean healthcare professionals
                </span>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

