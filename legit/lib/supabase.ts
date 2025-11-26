/**
 * Supabase 클라이언트 설정
 * 
 * 참고: Clerk를 인증으로 사용하므로 Supabase Auth는 사용하지 않습니다.
 * RLS 정책은 user_id 필드를 직접 비교하는 방식으로 작동합니다.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 서버 사이드용 Supabase 클라이언트 (서비스 롤 키 사용, RLS 우회)
export function createServerClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    // Supabase가 설정되지 않은 경우 null 반환 (선택적)
    if (process.env.NODE_ENV === 'development') {
      console.warn('Supabase 환경 변수가 설정되지 않았습니다. 일부 기능이 작동하지 않을 수 있습니다.');
    }
    return null;
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// 클라이언트 사이드용 Supabase 클라이언트 (선택적)
export function createClientClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  
  return createClient(supabaseUrl, supabaseAnonKey);
}

// 기본 export는 제거 - createServerClient()를 직접 사용하세요
// 이전 버전과의 호환성을 위해 유지하되, null 체크가 필요합니다
// @deprecated Use createServerClient() instead
export const supabase = createServerClient();

