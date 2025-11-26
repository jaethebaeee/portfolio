import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { EnhancedHeader } from "@/components/enhanced-header";
import { auth } from '@clerk/nextjs/server';
import { getProfile } from '@/lib/profiles';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const profile = await getProfile(userId);

  if (!profile || !profile.is_onboarding_complete) {
    redirect(`/${locale}/onboarding`);
  }

  return (
    <SidebarProvider>
      <AppSidebar profile={profile} />
      <SidebarInset>
        <EnhancedHeader profile={profile} />
        <main id="main-content" className="flex flex-1 flex-col gap-4 p-4 md:p-8 bg-gradient-to-br from-background via-background to-muted/20" role="main" tabIndex={-1}>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
