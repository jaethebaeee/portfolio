/**
 * 환경 변수 검증 유틸리티
 */

interface EnvConfig {
  key: string;
  required: boolean;
  description: string;
  category: 'auth' | 'api' | 'optional';
}

const REQUIRED_ENV_VARS: EnvConfig[] = [
  {
    key: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    required: true,
    description: 'Clerk Publishable Key (인증)',
    category: 'auth',
  },
  {
    key: 'CLERK_SECRET_KEY',
    required: true,
    description: 'Clerk Secret Key (인증)',
    category: 'auth',
  },
  {
    key: 'KAKAO_REST_API_KEY',
    required: false,
    description: 'Kakao REST API Key (카카오톡 발송)',
    category: 'api',
  },
  {
    key: 'NHN_SMS_APP_KEY',
    required: false,
    description: 'NHN SMS App Key (SMS 발송)',
    category: 'api',
  },
  {
    key: 'NHN_SMS_SECRET_KEY',
    required: false,
    description: 'NHN SMS Secret Key (SMS 발송)',
    category: 'api',
  },
  {
    key: 'COOLSMS_API_KEY',
    required: false,
    description: 'Coolsms API Key (대안 SMS 발송)',
    category: 'api',
  },
  {
    key: 'COOLSMS_API_SECRET',
    required: false,
    description: 'Coolsms API Secret (대안 SMS 발송)',
    category: 'api',
  },
  {
    key: 'COOLSMS_SENDER_PHONE',
    required: false,
    description: 'Coolsms 발신번호 (선택사항)',
    category: 'api',
  },
  {
    key: 'GROQ_API_KEY',
    required: false,
    description: 'Groq API Key (AI 문구 생성)',
    category: 'api',
  },
  {
    key: 'NEXT_PUBLIC_SUPABASE_URL',
    required: false,
    description: 'Supabase Project URL (데이터베이스)',
    category: 'api',
  },
  {
    key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: false,
    description: 'Supabase Anon Key (데이터베이스)',
    category: 'api',
  },
  {
    key: 'SUPABASE_SERVICE_ROLE_KEY',
    required: false,
    description: 'Supabase Service Role Key (서버 사이드)',
    category: 'api',
  },
];

export interface EnvValidationResult {
  isValid: boolean;
  missing: EnvConfig[];
  warnings: EnvConfig[];
  errors: string[];
}

/**
 * 환경 변수 검증
 */
export function validateEnvironmentVariables(): EnvValidationResult {
  const missing: EnvConfig[] = [];
  const warnings: EnvConfig[] = [];
  const errors: string[] = [];

  // 필수 환경 변수 확인
  for (const envVar of REQUIRED_ENV_VARS) {
    const value = process.env[envVar.key];

    if (envVar.required && !value) {
      missing.push(envVar);
      errors.push(`${envVar.key}이(가) 설정되지 않았습니다. (${envVar.description})`);
    } else if (!envVar.required && !value) {
      warnings.push(envVar);
    }
  }

  // Clerk 관련 환경 변수 쌍 확인
  const hasClerkPublishable = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const hasClerkSecret = !!process.env.CLERK_SECRET_KEY;

  if (hasClerkPublishable && !hasClerkSecret) {
    errors.push('CLERK_SECRET_KEY가 설정되지 않았습니다. Clerk 인증이 작동하지 않을 수 있습니다.');
  }

  if (hasClerkSecret && !hasClerkPublishable) {
    errors.push('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY가 설정되지 않았습니다. Clerk 인증이 작동하지 않을 수 있습니다.');
  }

  // NHN SMS 관련 환경 변수 쌍 확인
  const hasNhnAppKey = !!process.env.NHN_SMS_APP_KEY;
  const hasNhnSecret = !!process.env.NHN_SMS_SECRET_KEY;

  if (hasNhnAppKey && !hasNhnSecret) {
    warnings.push({
      key: 'NHN_SMS_SECRET_KEY',
      required: false,
      description: 'NHN SMS Secret Key가 없으면 SMS 발송이 작동하지 않습니다.',
      category: 'api',
    });
  }

  if (hasNhnSecret && !hasNhnAppKey) {
    warnings.push({
      key: 'NHN_SMS_APP_KEY',
      required: false,
      description: 'NHN SMS App Key가 없으면 SMS 발송이 작동하지 않습니다.',
      category: 'api',
    });
  }

  // Coolsms 관련 환경 변수 쌍 확인
  const hasCoolsmsApiKey = !!process.env.COOLSMS_API_KEY;
  const hasCoolsmsApiSecret = !!process.env.COOLSMS_API_SECRET;

  if (hasCoolsmsApiKey && !hasCoolsmsApiSecret) {
    warnings.push({
      key: 'COOLSMS_API_SECRET',
      required: false,
      description: 'Coolsms API Secret가 없으면 SMS 발송이 작동하지 않습니다.',
      category: 'api',
    });
  }

  if (hasCoolsmsApiSecret && !hasCoolsmsApiKey) {
    warnings.push({
      key: 'COOLSMS_API_KEY',
      required: false,
      description: 'Coolsms API Key가 없으면 SMS 발송이 작동하지 않습니다.',
      category: 'api',
    });
  }

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
    errors,
  };
}

/**
 * 환경 변수 검증 결과를 사용자 친화적인 메시지로 변환
 */
export function getEnvValidationMessage(result: EnvValidationResult): string {
  const messages: string[] = [];

  if (result.errors.length > 0) {
    messages.push('❌ 필수 환경 변수가 누락되었습니다:');
    result.errors.forEach((error) => {
      messages.push(`  • ${error}`);
    });
  }

  if (result.warnings.length > 0) {
    messages.push('\n⚠️ 선택적 환경 변수가 누락되었습니다 (일부 기능이 작동하지 않을 수 있습니다):');
    result.warnings.forEach((warning) => {
      messages.push(`  • ${warning.key}: ${warning.description}`);
    });
  }

  if (result.isValid && result.warnings.length === 0) {
    messages.push('✅ 모든 환경 변수가 올바르게 설정되었습니다.');
  }

  return messages.join('\n');
}

/**
 * 서버 사이드에서 환경 변수 검증 (앱 시작 시 호출)
 */
export function validateEnvOnServer(): void {
  if (typeof window !== 'undefined') {
    // 클라이언트 사이드에서는 실행하지 않음
    return;
  }

  const result = validateEnvironmentVariables();

  if (!result.isValid) {
    console.error('\n🚨 환경 변수 검증 실패:\n');
    console.error(getEnvValidationMessage(result));
    console.error('\n.env.local 파일을 확인하고 필수 환경 변수를 설정해주세요.\n');
  } else if (result.warnings.length > 0) {
    console.warn('\n⚠️ 환경 변수 경고:\n');
    console.warn(getEnvValidationMessage(result));
    console.warn('\n일부 기능이 작동하지 않을 수 있습니다.\n');
  } else if (process.env.NODE_ENV === 'development') {
    console.log('✅ 환경 변수 검증 완료');
  }
}

