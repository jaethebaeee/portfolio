"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

interface EnvStatus {
  key: string;
  value: string | undefined;
  required: boolean;
  description: string;
  category: string;
}

export default function EnvCheckPage() {
  const [envStatuses, setEnvStatuses] = useState<EnvStatus[]>([]);

  useEffect(() => {
    // 클라이언트 사이드에서 확인 가능한 환경 변수만 체크
    const checkableEnvs: EnvStatus[] = [
      {
        key: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
        value: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        required: true,
        description: 'Clerk Publishable Key',
        category: '인증',
      },
      {
        key: 'KAKAO_REST_API_KEY',
        value: process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY || '서버 사이드에서만 확인 가능',
        required: false,
        description: 'Kakao REST API Key',
        category: 'API',
      },
      {
        key: 'NHN_SMS_APP_KEY',
        value: process.env.NEXT_PUBLIC_NHN_SMS_APP_KEY || '서버 사이드에서만 확인 가능',
        required: false,
        description: 'NHN SMS App Key',
        category: 'API',
      },
      {
        key: 'GROQ_API_KEY',
        value: process.env.NEXT_PUBLIC_GROQ_API_KEY || '서버 사이드에서만 확인 가능',
        required: false,
        description: 'Groq API Key',
        category: 'API',
      },
    ];

    setEnvStatuses(checkableEnvs);
  }, []);

  const getStatusBadge = (env: EnvStatus) => {
    if (env.value && env.value !== '서버 사이드에서만 확인 가능') {
      return (
        <Badge className="bg-green-500">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          설정됨
        </Badge>
      );
    } else if (env.required) {
      return (
        <Badge variant="destructive">
          <XCircle className="mr-1 h-3 w-3" />
          필수
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline">
          <AlertTriangle className="mr-1 h-3 w-3" />
          선택
        </Badge>
      );
    }
  };

  const requiredMissing = envStatuses.filter(
    (env) => env.required && (!env.value || env.value === '서버 사이드에서만 확인 가능')
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">환경 변수 확인</h1>
        <p className="text-muted-foreground">
          현재 설정된 환경 변수를 확인합니다
        </p>
      </div>

      {requiredMissing.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">⚠️ 필수 환경 변수 누락</CardTitle>
            <CardDescription>
              다음 환경 변수들이 설정되지 않았습니다. 일부 기능이 작동하지 않을 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              {requiredMissing.map((env) => (
                <li key={env.key} className="text-sm">
                  <code className="bg-muted px-2 py-1 rounded">{env.key}</code> - {env.description}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>환경 변수 목록</CardTitle>
          <CardDescription>
            .env.local 파일에 설정된 환경 변수 상태입니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {envStatuses.map((env) => (
              <div
                key={env.key}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      {env.key}
                    </code>
                    {getStatusBadge(env)}
                    <Badge variant="outline" className="text-xs">
                      {env.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{env.description}</p>
                  {env.value && env.value !== '서버 사이드에서만 확인 가능' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      값: {env.value.substring(0, 10)}...
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>설정 가이드</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>환경 변수를 설정하려면 프로젝트 루트에 <code className="bg-muted px-1 rounded">.env.local</code> 파일을 생성하세요:</p>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
{`# Clerk 인증 (필수)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key_here
CLERK_SECRET_KEY=your_secret_here

# Kakao API (선택)
KAKAO_REST_API_KEY=your_key_here

# NHN SMS API (선택)
NHN_SMS_APP_KEY=your_key_here
NHN_SMS_SECRET_KEY=your_secret_here

# Groq API (선택)
GROQ_API_KEY=your_key_here`}
            </pre>
            <p className="text-muted-foreground mt-4">
              💡 자세한 설정 방법은 각 API별 설정 가이드 문서를 참고하세요.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

