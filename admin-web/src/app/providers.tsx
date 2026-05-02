'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { usePathname } from 'next/navigation';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <QueryClientProvider client={queryClient}>
      {!isLoginPage ? (
        <div className="flex bg-slate-50 min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      ) : (
        children
      )}
    </QueryClientProvider>
  );
}
