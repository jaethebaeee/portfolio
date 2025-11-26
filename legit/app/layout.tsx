import type { Metadata } from "next";
import { Inter, Noto_Sans_KR } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from "sonner";
import { Providers } from "@/lib/providers";
import { validateEnvOnServer } from "@/lib/env-validation";
import "./globals.css";

// 서버 사이드에서 환경 변수 검증
if (typeof window === 'undefined') {
  validateEnvOnServer();
}

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: 'swap',
});

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700'],
  variable: "--font-korean",
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: "닥터스플로우 - 마케팅 자동화 대시보드",
  description: "한국 안과·성형외과 전용 마케팅 자동화 대시보드",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="ko" suppressHydrationWarning>
        <body className={`${inter.variable} ${notoSansKR.variable} font-korean antialiased`}>
          <Providers>
            {/* Skip to main content link for accessibility */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
            >
              메인 콘텐츠로 건너뛰기
            </a>
            {children}
            <Toaster position="top-right" />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
