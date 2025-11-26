"use client";

import { SignUp } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const businessType = searchParams.get('type') || 'medical';
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            닥터스플로우
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            마케팅 자동화 대시보드
          </p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-xl",
              headerTitle: "text-2xl font-bold",
              headerSubtitle: "text-sm text-muted-foreground",
              socialButtonsBlockButton: "border border-border hover:bg-accent transition-colors",
              socialButtonsBlockButtonText: "font-medium",
              socialButtonsBlockButton__google: "bg-white text-gray-700 hover:bg-gray-50",
              socialButtonsBlockButton__kakao: "bg-[#FEE500] text-black hover:bg-[#FDD835]",
              formButtonPrimary: "bg-primary hover:bg-primary/90",
            },
            variables: {
              colorPrimary: "hsl(221.2 83.2% 53.3%)",
            },
          }}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          forceRedirectUrl={`/onboarding?type=${businessType}`}
        />
      </div>
    </div>
  );
}

