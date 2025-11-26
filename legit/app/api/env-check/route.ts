import { NextRequest, NextResponse } from 'next/server';

// GET /api/env-check
export async function GET(req: NextRequest) {
  const envStatus = {
    // Critical
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: !!process.env.CLERK_SECRET_KEY,
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    
    // Integrations
    KAKAO_REST_API_KEY: !!process.env.KAKAO_REST_API_KEY,
    NHN_SMS_APP_KEY: !!process.env.NHN_SMS_APP_KEY,
    NHN_SMS_SECRET_KEY: !!process.env.NHN_SMS_SECRET_KEY,
    
    // Operational
    CRON_SECRET: !!process.env.CRON_SECRET,
    NEXT_PUBLIC_APP_URL: !!process.env.NEXT_PUBLIC_APP_URL,
  };

  const missingKeys = Object.entries(envStatus)
    .filter(([_, exists]) => !exists)
    .map(([key]) => key);

  return NextResponse.json({
    status: missingKeys.length === 0 ? 'healthy' : 'degraded',
    env: envStatus,
    missing: missingKeys
  });
}

