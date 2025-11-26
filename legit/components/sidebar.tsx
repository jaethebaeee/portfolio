"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { 
  LayoutDashboard, 
  BarChart3, 
  Megaphone, 
  Users, 
  Calendar,
  Settings,
  Stethoscope,
  FileText,
  TrendingUp,
  MessageSquare,
  Webhook,
  Workflow,
  Sparkles,
  ClipboardList,
  GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";
import { Profile } from "@/lib/profiles";

// Medical menu items organized by groups
const medicalMenuGroups = [
  {
    title: "핵심 기능",
    items: [
      {
        title: "대시보드",
        icon: LayoutDashboard,
        href: "/dashboard",
        description: "전체 현황 및 주요 지표",
      },
      {
        title: "AI 마케팅",
        icon: MessageSquare,
        href: "/dashboard/patient-marketing",
        description: "AI 기반 마케팅 콘텐츠 생성",
      },
      {
        title: "템플릿",
        icon: FileText,
        href: "/dashboard/templates",
        description: "메시지 및 마케팅 템플릿 관리",
      },
    ],
  },
  {
    title: "환자 관리",
    items: [
      {
        title: "환자",
        icon: Users,
        href: "/dashboard/patients",
        description: "환자 정보 및 기록 관리",
      },
      {
        title: "예약",
        icon: Calendar,
        href: "/dashboard/appointments",
        description: "진료 예약 및 일정 관리",
      },
      {
        title: "상담 관리 (CRM)",
        icon: ClipboardList,
        href: "/dashboard/consultations",
        description: "상담 기록 및 후속 관리",
      },
    ],
  },
  {
    title: "마케팅 자동화",
    items: [
      {
        title: "캠페인",
        icon: Megaphone,
        href: "/dashboard/campaigns",
        description: "마케팅 캠페인 관리",
      },
      {
        title: "이벤트/생일 CRM",
        icon: Sparkles,
        href: "/dashboard/event-crm",
        description: "이벤트 및 생일 자동 관리",
      },
      {
        title: "메시지함",
        icon: MessageSquare,
        href: "/dashboard/inbox",
        description: "메시지 발송 및 수신함",
      },
    ],
  },
  {
    title: "분석 및 통계",
    items: [
      {
        title: "통계",
        icon: TrendingUp,
        href: "/dashboard/statistics",
        description: "전체 통계 및 성과 분석",
      },
      {
        title: "분석",
        icon: BarChart3,
        href: "/dashboard/analytics",
        description: "상세 분석 및 인사이트",
      },
    ],
  },
  {
    title: "자동화",
    items: [
      {
        title: "워크플로우",
        icon: Workflow,
        href: "/dashboard/workflows",
        description: "자동화 워크플로우 관리",
      },
      {
        title: "웹훅",
        icon: Webhook,
        href: "/dashboard/webhooks",
        description: "외부 서비스 연동",
      },
    ],
  },
  {
    title: "설정",
    items: [
      {
        title: "설정",
        icon: Settings,
        href: "/dashboard/settings",
        description: "시스템 설정 및 환경설정",
      },
    ],
  },
];

// Hagwon menu items organized by groups
const hagwonMenuGroups = [
  {
    title: "핵심 기능",
    items: [
      {
        title: "대시보드",
        icon: LayoutDashboard,
        href: "/dashboard",
        description: "전체 현황 및 주요 지표",
      },
      {
        title: "템플릿",
        icon: FileText,
        href: "/dashboard/templates",
        description: "알림 및 메시지 템플릿 관리",
      },
    ],
  },
  {
    title: "학생 관리",
    items: [
      {
        title: "학생 관리",
        icon: Users,
        href: "/dashboard/students",
        description: "학생 정보 및 기록 관리",
      },
      {
        title: "수업 일정",
        icon: Calendar,
        href: "/dashboard/classes",
        description: "수업 스케줄 및 예약 관리",
      },
      {
        title: "진행 상황",
        icon: TrendingUp,
        href: "/dashboard/progress",
        description: "학생별 학습 진행 상황",
      },
    ],
  },
  {
    title: "커뮤니케이션",
    items: [
      {
        title: "학부모 소통",
        icon: MessageSquare,
        href: "/dashboard/inbox",
        description: "학부모와의 메시지 소통",
      },
      {
        title: "캠페인",
        icon: Megaphone,
        href: "/dashboard/campaigns",
        description: "마케팅 캠페인 관리",
      },
    ],
  },
  {
    title: "관리",
    items: [
      {
        title: "수강료 관리",
        icon: BarChart3,
        href: "/dashboard/tuition",
        description: "수강료 및 결제 관리",
      },
      {
        title: "통계",
        icon: TrendingUp,
        href: "/dashboard/statistics",
        description: "학원 운영 통계",
      },
    ],
  },
  {
    title: "자동화",
    items: [
      {
        title: "워크플로우",
        icon: Workflow,
        href: "/dashboard/workflows",
        description: "자동화 워크플로우 관리",
      },
    ],
  },
  {
    title: "설정",
    items: [
      {
        title: "설정",
        icon: Settings,
        href: "/dashboard/settings",
        description: "시스템 설정 및 환경설정",
      },
    ],
  },
];

function getMenuGroups(businessType?: string) {
  return businessType === 'hagwon' || businessType === 'school' || businessType === 'academy_center' || businessType === 'specialized'
    ? hagwonMenuGroups
    : medicalMenuGroups;
}

export function AppSidebar({ profile }: { profile?: Profile }) {
  const pathname = usePathname();
  const locale = useLocale();
  const menuGroups = getMenuGroups(profile?.business_type);
  const isHagwon = profile?.business_type === 'hagwon' || profile?.business_type === 'school' || profile?.business_type === 'academy_center' || profile?.business_type === 'specialized';

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border p-4 bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg`} aria-hidden="true">
            {isHagwon ? (
              <GraduationCap className="h-6 w-6" />
            ) : (
              <Stethoscope className="h-6 w-6" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {isHagwon ? '학원플로우' : '닥터스플로우'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isHagwon ? '교육 자동화' : '마케팅 자동화'}
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="gap-0">
        {menuGroups.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-2">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="px-2">
                {group.items.map((item) => {
                  const fullPath = `/${locale}${item.href}`;
                  const isActive = pathname === fullPath || pathname?.startsWith(fullPath);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={cn(
                          "w-full justify-start transition-all duration-200 rounded-lg hover:bg-muted/80 group",
                          isActive && "bg-primary/10 text-primary font-medium shadow-sm border-l-2 border-l-primary"
                        )}
                        tooltip={item.description}
                        aria-label={`${item.title}${isActive ? ', 현재 페이지' : ''}`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <Link href={fullPath} className="flex items-center gap-3 py-2.5">
                          <div className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-lg transition-colors",
                            isActive ? "bg-primary/20 text-primary" : "bg-muted/50 group-hover:bg-muted"
                          )} aria-hidden="true">
                            <item.icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">{item.title}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {item.description}
                            </div>
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-border p-4 bg-muted/30" aria-label="사용자 계정 메뉴">
        <div className="flex items-center justify-between">
          <UserButton afterSignOutUrl={`/${locale}/sign-in`} />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
