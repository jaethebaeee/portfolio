"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 데이터가 stale로 간주되는 시간 (1분)
            staleTime: 60 * 1000,
            // 윈도우 포커스 시 자동 리프레시 비활성화
            refetchOnWindowFocus: false,
            // 네트워크 재연결 시 자동 리프레시 활성화
            refetchOnReconnect: true,
            // 에러 발생 시 재시도 횟수
            retry: 1,
            // 재시도 간격
            retryDelay: 1000,
          },
          mutations: {
            // 뮤테이션 에러 재시도 비활성화
            retry: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* 개발 환경에서만 DevTools 표시 */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

