"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Search,
  Bell,
  Plus,
  Settings,
  Moon,
  Sun,
  Monitor,
  User,
  LogOut,
  AlertCircle,
  CheckCircle,
  Users,
  Calendar,
  Megaphone,
  FileText,
  Workflow,
  MessageSquare,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Profile } from "@/lib/profiles";

// Quick action items
const quickActions = [
  {
    title: "신규 환자 등록",
    description: "새로운 환자를 시스템에 추가합니다",
    icon: Users,
    href: "/dashboard/patients/new",
    shortcut: "⌘N",
  },
  {
    title: "예약 생성",
    description: "새로운 예약을 생성합니다",
    icon: Calendar,
    href: "/dashboard/appointments/new",
    shortcut: "⌘A",
  },
  {
    title: "캠페인 생성",
    description: "마케팅 캠페인을 새로 만듭니다",
    icon: Megaphone,
    href: "/dashboard/campaigns/new",
    shortcut: "⌘C",
  },
  {
    title: "템플릿 생성",
    description: "새로운 메시지 템플릿을 만듭니다",
    icon: FileText,
    href: "/dashboard/templates/new",
    shortcut: "⌘T",
  },
  {
    title: "워크플로우 생성",
    description: "자동화 워크플로우를 생성합니다",
    icon: Workflow,
    href: "/dashboard/workflows/new",
    shortcut: "⌘W",
  },
  {
    title: "빠른 메시지",
    description: "빠른 메시지를 발송합니다",
    icon: MessageSquare,
    href: "/dashboard/inbox/new",
    shortcut: "⌘M",
  },
];

// Mock notifications - in real app, this would come from API
const mockNotifications = [
  {
    id: 1,
    title: "신규 환자 등록",
    description: "김철수가 새로 등록되었습니다.",
    time: "2분 전",
    type: "info",
    unread: true,
  },
  {
    id: 2,
    title: "캠페인 완료",
    description: "봄철 프로모션 캠페인이 완료되었습니다.",
    time: "1시간 전",
    type: "success",
    unread: true,
  },
  {
    id: 3,
    title: "예약 리마인더",
    description: "내일 오전 10시에 예약이 있습니다.",
    time: "3시간 전",
    type: "warning",
    unread: false,
  },
];

// Breadcrumb generation based on current path
function generateBreadcrumbs(pathname: string, locale: string) {
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [{ title: "홈", href: `/${locale}/dashboard` }];

  const pathMap: Record<string, string> = {
    patients: "환자 관리",
    appointments: "예약 관리",
    campaigns: "캠페인",
    templates: "템플릿",
    workflows: "워크플로우",
    webhooks: "웹훅",
    settings: "설정",
    statistics: "통계",
    analytics: "분석",
    inbox: "메시지함",
    "patient-marketing": "AI 마케팅",
    "event-crm": "이벤트/생일 CRM",
    "consultations": "상담 관리",
    students: "학생 관리",
    classes: "수업 일정",
    progress: "진행 상황",
    tuition: "수강료 관리",
  };

  let currentPath = `/${locale}/dashboard`;
  for (let i = 2; i < pathSegments.length; i++) {
    const segment = pathSegments[i];
    currentPath += `/${segment}`;

    if (pathMap[segment]) {
      breadcrumbs.push({
        title: pathMap[segment],
        href: currentPath,
      });
    }
  }

  return breadcrumbs;
}

export function EnhancedHeader({ profile }: { profile?: Profile }) {
  const pathname = usePathname();
  const locale = useLocale();
  const { theme, setTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);

  const breadcrumbs = generateBreadcrumbs(pathname, locale);
  const unreadNotifications = mockNotifications.filter(n => n.unread).length;
  const isHagwon = profile?.business_type === 'hagwon' || profile?.business_type === 'school' ||
                  profile?.business_type === 'academy_center' || profile?.business_type === 'specialized';

  // Environment status check
  const hasMissingEnvVars = typeof window !== 'undefined' &&
    (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY);

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background/80 backdrop-blur-sm sticky top-0 z-50" role="banner">
      {/* Sidebar Trigger */}
      <SidebarTrigger className="-ml-1 hover:bg-muted/80 transition-colors rounded-lg" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      {/* Breadcrumbs */}
      <div className="flex-1 min-w-0">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.href} className="flex items-center">
                {index > 0 && <BreadcrumbSeparator className="mx-2" />}
                <BreadcrumbItem>
                  {index === breadcrumbs.length - 1 ? (
                    <BreadcrumbPage className="font-medium text-foreground truncate max-w-48">
                      {crumb.title}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link
                        href={crumb.href}
                        className="text-muted-foreground hover:text-foreground transition-colors truncate max-w-32"
                      >
                        {crumb.title}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Environment Warning */}
      {hasMissingEnvVars && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <span className="text-xs font-medium text-amber-800 dark:text-amber-200">
            환경변수 설정 필요
          </span>
        </div>
      )}

      {/* Quick Actions */}
      <Popover open={quickActionsOpen} onOpenChange={setQuickActionsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
            aria-label="빠른 작업 메뉴 열기"
            aria-haspopup="true"
            aria-expanded={quickActionsOpen}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">빠른 작업</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="p-2">
            <h4 className="font-medium text-sm mb-2">빠른 작업</h4>
            <div className="grid grid-cols-1 gap-1">
              {quickActions.map((action) => (
                <Button
                  key={action.href}
                  variant="ghost"
                  className="justify-start h-auto p-3"
                  asChild
                  onClick={() => setQuickActionsOpen(false)}
                  aria-label={`${action.title}: ${action.description}`}
                >
                  <Link href={`/${locale}${action.href}`}>
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10" aria-hidden="true">
                        <action.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-sm">{action.title}</div>
                        <div className="text-xs text-muted-foreground">{action.description}</div>
                      </div>
                      <Badge variant="secondary" className="text-xs" aria-label={`단축키: ${action.shortcut}`}>
                        <span aria-hidden="true">{action.shortcut}</span>
                      </Badge>
                    </div>
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Search */}
      <Popover open={searchOpen} onOpenChange={setSearchOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 hover:bg-muted/80 transition-colors"
            aria-label="검색 메뉴 열기 (단축키: Command+K)"
            aria-haspopup="true"
            aria-expanded={searchOpen}
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">검색</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100" aria-hidden="true">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <Command>
            <CommandInput placeholder="메뉴, 기능, 환자를 검색하세요..." />
            <CommandList>
              <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
              <CommandGroup heading="메뉴">
                <CommandItem>
                  <Users className="mr-2 h-4 w-4" aria-hidden="true" />
                  <span>환자 관리</span>
                </CommandItem>
                <CommandItem>
                  <Calendar className="mr-2 h-4 w-4" aria-hidden="true" />
                  <span>예약 관리</span>
                </CommandItem>
                <CommandItem>
                  <Megaphone className="mr-2 h-4 w-4" aria-hidden="true" />
                  <span>캠페인</span>
                </CommandItem>
              </CommandGroup>
              <CommandGroup heading="빠른 작업">
                <CommandItem>
                  <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                  <span>신규 환자 등록</span>
                </CommandItem>
                <CommandItem>
                  <Calendar className="mr-2 h-4 w-4" aria-hidden="true" />
                  <span>새 예약 생성</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Notifications */}
      <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="relative hover:bg-muted/80 transition-colors"
            aria-label={`알림 메뉴 열기${unreadNotifications > 0 ? `, 읽지 않은 알림 ${unreadNotifications}개` : ''}`}
            aria-haspopup="true"
            aria-expanded={notificationsOpen}
          >
            <Bell className="h-4 w-4" aria-hidden="true" />
            {unreadNotifications > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                aria-label={`읽지 않은 알림 ${unreadNotifications}개`}
              >
                <span aria-hidden="true">{unreadNotifications}</span>
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="p-4 border-b">
            <h4 className="font-medium">알림</h4>
            <p className="text-sm text-muted-foreground">최근 활동 및 업데이트</p>
          </div>
          <div className="max-h-80 overflow-y-auto" role="list" aria-label="알림 목록">
            {mockNotifications.map((notification) => (
              <div
                key={notification.id}
                role="listitem"
                className={cn(
                  "flex items-start gap-3 p-4 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer",
                  notification.unread && "bg-blue-50/50 dark:bg-blue-950/20"
                )}
                aria-label={`${notification.title}, ${notification.description}, ${notification.time}${notification.unread ? ', 읽지 않음' : ''}`}
              >
                <div 
                  className={cn(
                    "mt-0.5 h-2 w-2 rounded-full flex-shrink-0",
                    notification.type === 'success' && "bg-green-500",
                    notification.type === 'warning' && "bg-yellow-500",
                    notification.type === 'info' && "bg-blue-500"
                  )}
                  aria-hidden="true"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{notification.title}</p>
                    {notification.unread && (
                      <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0" aria-label="읽지 않음" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{notification.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-2 border-t">
            <Button variant="ghost" size="sm" className="w-full">
              모든 알림 보기
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Theme Toggle */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            aria-label="테마 설정 메뉴 열기"
            aria-haspopup="true"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" aria-hidden="true" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" aria-hidden="true" />
            <span className="sr-only">테마 전환</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setTheme("light")} aria-label="밝은 테마로 전환">
            <Sun className="mr-2 h-4 w-4" aria-hidden="true" />
            <span>밝은 테마</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")} aria-label="어두운 테마로 전환">
            <Moon className="mr-2 h-4 w-4" aria-hidden="true" />
            <span>어두운 테마</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")} aria-label="시스템 설정에 따라 테마 설정">
            <Monitor className="mr-2 h-4 w-4" aria-hidden="true" />
            <span>시스템</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            aria-label={`사용자 메뉴 열기, ${profile?.full_name || '사용자'}`}
            aria-haspopup="true"
          >
            <User className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{profile?.full_name || '사용자'}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{profile?.full_name || '사용자'}</p>
              <p className="text-xs text-muted-foreground">{profile?.email || ''}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/${locale}/dashboard/settings`} aria-label="설정 페이지로 이동">
              <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
              <span>설정</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-600 focus:text-red-600" aria-label="로그아웃">
            <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
            <span>로그아웃</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
