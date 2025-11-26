import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getProfile } from '@/lib/profiles';
import OnboardingForm from '@/components/onboarding-form';

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const profile = await getProfile(userId);

  if (profile?.is_onboarding_complete) {
    redirect(`/${locale}/dashboard`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <OnboardingForm locale={locale} />
    </div>
  );
}

