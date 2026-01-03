"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/client";
import { clearCsrfToken, getCsrfToken } from "@/hooks/use-csrf";
import {
  LogOut,
  Activity,
  Home,
  Users,
  Stethoscope,
  Shield,
  Bell,
  Settings,
  Heart,
  ChevronLeft,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      // Clear local state and CSRF token
      logout();
      clearCsrfToken();
      router.push("/auth");
    },
    onError: () => {
      // Even if backend logout fails, clear local state
      logout();
      clearCsrfToken();
      router.push("/auth");
    },
  });

  const handleLogout = async () => {
    try {
      const csrfToken = await getCsrfToken();
      logoutMutation.mutate({ csrfToken });
    } catch (error) {
      console.error("Failed to fetch CSRF token:", error);
      // Even if CSRF token fetch fails, attempt logout with local state clear
      logout();
      clearCsrfToken();
      router.push("/auth");
    }
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
      description: "Overview & monitoring",
    },
    {
      name: "Patients",
      href: "/dashboard/patients",
      icon: Users,
      description: "Patient management",
      badge: "12",
    },
    {
      name: "Nurse Station",
      href: "/dashboard/nurse-station",
      icon: Activity,
      description: "Quick access",
    },
    {
      name: "Physicians Only",
      href: "/dashboard/physicians-only",
      icon: Stethoscope,
      description: "Clinical tools",
      requiresRole: ["physician", "admin"],
    },
    {
      name: "Admin",
      href: "/dashboard/admin",
      icon: Shield,
      description: "System settings",
      requiresRole: ["admin"],
    },
  ];

  const filteredNav = navigation.filter((item) => {
    if (!item.requiresRole) return true;
    return user?.role && item.requiresRole.includes(user.role);
  });

  const isActive = (href: string) => pathname === href;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-stone-200 shadow-sm">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          {/* Left: Logo & Menu Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex items-center justify-center w-9 h-9 rounded-lg hover:bg-stone-100 transition-colors"
            >
              {sidebarOpen ? (
                <ChevronLeft className="w-5 h-5 text-stone-600" />
              ) : (
                <Menu className="w-5 h-5 text-stone-600" />
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-stone-100 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-stone-600" />
              ) : (
                <Menu className="w-5 h-5 text-stone-600" />
              )}
            </button>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-bold text-stone-900 leading-none">
                  Somnium ECMO
                </span>
                <span className="text-xs text-stone-500 font-medium">
                  Clinical Platform
                </span>
              </div>
            </div>
          </div>

          {/* Right: User & Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="relative text-stone-600 hover:text-stone-900 hover:bg-stone-100"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
            </Button>

            <div className="hidden md:flex items-center gap-3 pl-3 border-l border-stone-200">
              <div className="text-right">
                <p className="text-sm font-semibold text-stone-900">
                  {user?.full_name}
                </p>
                <p className="text-xs text-stone-500 capitalize">
                  {user?.role.replace("_", " ")}
                </p>
              </div>
              <div className="w-9 h-9 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold text-teal-800">
                  {user?.full_name?.charAt(0) || "U"}
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-stone-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside
          className={`hidden lg:flex flex-col fixed left-0 top-16 bottom-0 bg-white border-r border-stone-200 transition-all duration-300 ${
            sidebarOpen ? "w-64" : "w-20"
          } z-40`}
        >
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {filteredNav.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                    ${
                      active
                        ? "bg-teal-50 text-teal-900 font-semibold shadow-sm"
                        : "text-stone-700 hover:bg-stone-50 hover:text-stone-900"
                    }
                  `}
                >
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 ${active ? "text-teal-700" : "text-stone-500"}`}
                    strokeWidth={active ? 2.5 : 2}
                  />
                  {sidebarOpen && (
                    <>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm truncate">{item.name}</span>
                          {item.badge && (
                            <Badge className="bg-teal-100 text-teal-800 border-0 text-xs px-1.5">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        {!active && item.description && (
                          <p className="text-xs text-stone-500 truncate">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          {sidebarOpen && (
            <div className="p-4 border-t border-stone-200 bg-stone-50">
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                <span>System Online</span>
              </div>
              <div className="mt-1 text-xs text-stone-600 font-medium">
                Last sync: Just now
              </div>
            </div>
          )}
        </aside>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          >
            <aside
              className="fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-stone-200 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-stone-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-lg flex items-center justify-center">
                    <Heart className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-stone-900 leading-none">
                      Somnium ECMO
                    </span>
                    <span className="text-xs text-stone-500 font-medium">
                      Clinical Platform
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone-100"
                >
                  <X className="w-5 h-5 text-stone-600" />
                </button>
              </div>

              <nav className="p-3 space-y-1">
                {filteredNav.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                        ${
                          active
                            ? "bg-teal-50 text-teal-900 font-semibold shadow-sm"
                            : "text-stone-700 hover:bg-stone-50 hover:text-stone-900"
                        }
                      `}
                    >
                      <Icon
                        className={`w-5 h-5 flex-shrink-0 ${active ? "text-teal-700" : "text-stone-500"}`}
                        strokeWidth={active ? 2.5 : 2}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm truncate">{item.name}</span>
                          {item.badge && (
                            <Badge className="bg-teal-100 text-teal-800 border-0 text-xs px-1.5">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-xs text-stone-500 truncate">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? "lg:ml-64" : "lg:ml-20"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
