"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { MainLayout } from "@/components/layout/main-layout";
import { useTokenRefresh } from "@/hooks/use-token-refresh";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Automatically refresh tokens to maintain user session
  useTokenRefresh();

  return (
    <AuthGuard>
      <MainLayout>{children}</MainLayout>
    </AuthGuard>
  );
}
