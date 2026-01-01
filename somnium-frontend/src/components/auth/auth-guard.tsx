"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Loader2 } from "lucide-react";
import type { UserRole } from "@/lib/validations/auth";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredScope?: string;
}

export function AuthGuard({
  children,
  allowedRoles,
  requiredScope,
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user, hasScope, _hasHydrated } =
    useAuthStore();

  useEffect(() => {
    // Wait for store to hydrate from localStorage
    if (!_hasHydrated || isLoading) return;

    if (!isAuthenticated) {
      router.push(`/auth?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.push("/unauthorized");
      return;
    }

    if (requiredScope && !hasScope(requiredScope)) {
      router.push("/unauthorized");
      return;
    }
  }, [
    isAuthenticated,
    isLoading,
    user,
    allowedRoles,
    requiredScope,
    router,
    pathname,
    hasScope,
    _hasHydrated,
  ]);

  if (!_hasHydrated || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
