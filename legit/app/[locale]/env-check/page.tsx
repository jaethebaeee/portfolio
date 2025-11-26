"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EnvStatus {
  status: 'healthy' | 'degraded';
  env: Record<string, boolean>;
  missing: string[];
}

export default function EnvCheckPage() {
  const [status, setStatus] = useState<EnvStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const checkEnv = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/env-check');
      const data = await res.json();
      setStatus(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkEnv();
  }, []);

  if (loading) return <div className="p-8">환경 변수 확인 중...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">시스템 상태 점검</h1>
        <p className="text-muted-foreground">
          필수 환경 변수 및 서비스 연결 상태를 확인합니다.
        </p>
      </div>

      <Card className={status?.status === 'healthy' ? "border-green-500" : "border-yellow-500"}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {status?.status === 'healthy' ? (
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
              )}
              <CardTitle>
                {status?.status === 'healthy' ? "모든 시스템 정상" : "일부 설정 누락됨"}
              </CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={checkEnv}>
              <RefreshCw className="mr-2 h-4 w-4" />
              새로고침
            </Button>
          </div>
          <CardDescription>
            {status?.missing.length === 0 
              ? "모든 필수 환경 변수가 올바르게 설정되었습니다." 
              : `${status?.missing.length}개의 필수 설정이 누락되었습니다.`}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <EnvSection 
          title="인증 및 데이터베이스" 
          keys={[
            'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 
            'CLERK_SECRET_KEY',
            'NEXT_PUBLIC_SUPABASE_URL',
            'NEXT_PUBLIC_SUPABASE_ANON_KEY',
            'SUPABASE_SERVICE_ROLE_KEY'
          ]} 
          status={status?.env || {}} 
        />
        
        <EnvSection 
          title="메시징 통합 (Kakao/SMS)" 
          keys={[
            'KAKAO_REST_API_KEY',
            'NHN_SMS_APP_KEY',
            'NHN_SMS_SECRET_KEY'
          ]} 
          status={status?.env || {}} 
        />
        
        <EnvSection 
          title="운영 설정" 
          keys={[
            'CRON_SECRET',
            'NEXT_PUBLIC_APP_URL'
          ]} 
          status={status?.env || {}} 
        />
      </div>
    </div>
  );
}

function EnvSection({ title, keys, status }: { title: string, keys: string[], status: Record<string, boolean> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {keys.map(key => (
          <div key={key} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
            <code className="text-xs font-mono break-all">{key}</code>
            {status[key] ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">설정됨</Badge>
            ) : (
              <Badge variant="destructive">누락됨</Badge>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

