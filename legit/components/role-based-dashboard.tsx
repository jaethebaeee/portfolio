"use client";

import { Profile } from '@/lib/profiles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Stethoscope, Users, Building2, User, TrendingUp, Calendar, MessageSquare, Settings } from 'lucide-react';

interface RoleBasedDashboardProps {
  profile: Profile;
}

const getRoleConfig = (profile: Profile) => {
  const { practice_size, user_role, business_type } = profile;

  if (business_type !== 'medical') {
    return {
      title: '대시보드',
      subtitle: '교육 기관 관리 시스템',
      primaryColor: 'blue',
      features: ['student-management', 'communication', 'analytics']
    };
  }

  // Medical practice configurations
  if (practice_size === 'individual') {
    return {
      title: '개인 진료실 대시보드',
      subtitle: '진료와 관리를 한번에',
      primaryColor: 'green',
      role: '의사/관리자',
      features: ['patient-care', 'appointment-management', 'communication', 'analytics'],
      quickActions: [
        { label: '오늘 진료', icon: Calendar, href: '/dashboard/appointments' },
        { label: '환자 관리', icon: Users, href: '/dashboard/patients' },
        { label: '메시지 발송', icon: MessageSquare, href: '/dashboard/templates' }
      ]
    };
  }

  if (user_role === 'doctor') {
    return {
      title: '의사 대시보드',
      subtitle: '환자 진료에 집중하세요',
      primaryColor: 'blue',
      role: '의사',
      features: ['patient-care', 'appointment-view', 'communication', 'quick-notes'],
      quickActions: [
        { label: '오늘 진료', icon: Calendar, href: '/dashboard/appointments' },
        { label: '환자 기록', icon: Users, href: '/dashboard/patients' },
        { label: '빠른 메시지', icon: MessageSquare, href: '/dashboard/templates' }
      ]
    };
  }

  if (user_role === 'admin') {
    return {
      title: '관리자 대시보드',
      subtitle: '진료실 운영을 효율적으로',
      primaryColor: 'purple',
      role: '원무과장',
      features: ['appointment-management', 'patient-management', 'communication', 'marketing', 'analytics'],
      quickActions: [
        { label: '예약 관리', icon: Calendar, href: '/dashboard/appointments' },
        { label: '환자 관리', icon: Users, href: '/dashboard/patients' },
        { label: '마케팅 캠페인', icon: TrendingUp, href: '/dashboard/campaigns' },
        { label: '워크플로우', icon: Settings, href: '/dashboard/workflows' }
      ]
    };
  }

  if (user_role === 'manager' || practice_size === 'clinic' || practice_size === 'hospital_chain') {
    return {
      title: '병원장 대시보드',
      subtitle: '전체 진료실을 관리하세요',
      primaryColor: 'red',
      role: '병원장',
      features: ['team-management', 'multi-location', 'analytics', 'compliance', 'communication'],
      quickActions: [
        { label: '팀 현황', icon: Users, href: '/dashboard/team' },
        { label: '전체 예약', icon: Calendar, href: '/dashboard/appointments' },
        { label: '성과 분석', icon: TrendingUp, href: '/dashboard/analytics' },
        { label: '설정', icon: Settings, href: '/dashboard/settings' }
      ]
    };
  }

  // Default fallback
  return {
    title: '닥터스플로우 대시보드',
    subtitle: '의료 마케팅 자동화 플랫폼',
    primaryColor: 'primary',
    features: ['patient-management', 'communication', 'analytics'],
    quickActions: [
      { label: '환자 관리', icon: Users, href: '/dashboard/patients' },
      { label: '메시지 발송', icon: MessageSquare, href: '/dashboard/templates' },
      { label: '분석', icon: TrendingUp, href: '/dashboard/analytics' }
    ]
  };
};

const getRoleIcon = (profile: Profile) => {
  const { practice_size, user_role } = profile;

  if (practice_size === 'individual') return User;
  if (user_role === 'doctor') return Stethoscope;
  if (user_role === 'admin') return Users;
  if (user_role === 'manager') return Building2;

  return Stethoscope; // default
};

const getRoleBadgeColor = (profile: Profile) => {
  const { practice_size, user_role } = profile;

  if (practice_size === 'individual') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  if (user_role === 'doctor') return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  if (user_role === 'admin') return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
  if (user_role === 'manager') return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';

  return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
};

export function RoleBasedDashboard({ profile }: RoleBasedDashboardProps) {
  const config = getRoleConfig(profile);
  const RoleIcon = getRoleIcon(profile);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full bg-${config.primaryColor}-100 dark:bg-${config.primaryColor}-900 flex items-center justify-center`}>
              <RoleIcon className={`h-6 w-6 text-${config.primaryColor}-600 dark:text-${config.primaryColor}-400`} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight medical-heading">
                {config.title}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-muted-foreground medical-caption">
                  {config.subtitle}
                </p>
                {config.role && (
                  <Badge className={getRoleBadgeColor(profile)}>
                    {config.role}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {config.quickActions && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {config.quickActions.map((action, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium medical-text">
                  {action.label}
                </CardTitle>
                <action.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full justify-start p-0 h-auto">
                  바로가기 →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Role-specific Welcome Message */}
      <Card>
        <CardHeader>
          <CardTitle className="medical-heading">
            {profile.hospital_name}님, 환영합니다!
          </CardTitle>
          <CardDescription className="medical-caption">
            {profile.practice_size === 'individual' && '개인 진료실 운영에 필요한 모든 도구를 제공합니다.'}
            {profile.user_role === 'doctor' && '환자 진료에 집중할 수 있도록 지원합니다.'}
            {profile.user_role === 'admin' && '진료실 운영을 효율적으로 관리하세요.'}
            {profile.user_role === 'manager' && '전체 팀과 진료실을 효과적으로 운영하세요.'}
            {!profile.practice_size && !profile.user_role && '닥터스플로우로 환자 관리를 시작하세요.'}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Feature Preview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {config.features?.includes('patient-care') && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg medical-heading">환자 케어</CardTitle>
              <CardDescription className="medical-caption">
                환자별 맞춤 케어 플랜과 자동 알림
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {config.features?.includes('appointment-management') && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg medical-heading">예약 관리</CardTitle>
              <CardDescription className="medical-caption">
                자동 예약 리마인더와 노쇼 방지
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {config.features?.includes('communication') && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg medical-heading">커뮤니케이션</CardTitle>
              <CardDescription className="medical-caption">
                카카오톡과 SMS 자동 발송
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {config.features?.includes('marketing') && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg medical-heading">마케팅 자동화</CardTitle>
              <CardDescription className="medical-caption">
                환자 재방문 유도와 후기 요청
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {config.features?.includes('analytics') && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg medical-heading">성과 분석</CardTitle>
              <CardDescription className="medical-caption">
                환자 만족도와 진료 효율성 분석
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
