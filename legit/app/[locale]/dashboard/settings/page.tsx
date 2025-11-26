"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Key, Palette, Shield, User, Mail } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">설정</h1>
        <p className="text-muted-foreground">
          시스템 설정을 관리하세요
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              환경 변수
            </CardTitle>
            <CardDescription>
              API 키 및 환경 변수 설정 확인
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/env-check">
              <Button variant="outline" className="w-full">
                환경 변수 확인하기
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-2">
              현재 설정된 환경 변수를 확인하고 누락된 항목을 확인하세요
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              의료진 관리
            </CardTitle>
            <CardDescription>
              의사/원장님 정보 및 캘린더 색상 설정
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/settings/doctors">
              <Button variant="outline" className="w-full">
                의료진 관리하기
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-2">
              예약 및 상담에 배정될 의료진을 등록하고 관리하세요
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              이메일 설정
            </CardTitle>
            <CardDescription>
              SMTP 연동 및 발신자 이메일 관리
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Link href="/dashboard/settings/email">
              <Button variant="outline" className="w-full">
                이메일 설정하기
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-2">
              회사 이메일 계정을 연동하여 알림을 발송하세요
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              테마 설정
            </CardTitle>
            <CardDescription>
              다크 모드 및 테마 설정
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              다크 모드 기능은 곧 추가될 예정입니다.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              보안 설정
            </CardTitle>
            <CardDescription>
              보안 및 권한 설정
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              보안 설정 기능은 곧 추가될 예정입니다.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
