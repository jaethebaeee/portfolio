import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import LandingPage from '@/components/landing-page';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { userId } = await auth();

  if (!userId) {
    // 비로그인 시 랜딩 페이지 표시
    return <LandingPage />;
  }

  // 로그인 상태 -> 대시보드로
  redirect(`/${locale}/dashboard`);
}
