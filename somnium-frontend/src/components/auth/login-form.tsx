"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { getCsrfToken } from "@/hooks/use-csrf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  Loader2,
  Lock,
  Activity,
  Shield,
  Eye,
  EyeOff,
  Mail,
} from "lucide-react";
import type { UserRole } from "@/lib/validations/auth";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const queryClient = useQueryClient();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "nurse" as UserRole,
      rememberMe: false,
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: LoginInput) => {
    try {
      setIsLoading(true);
      setError(null);

      const csrfToken = await getCsrfToken();

      // Call backend API through Next.js API route proxy (same origin = cookies work!)
      const response = await fetch("/api/backend-proxy/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include", // CRITICAL: This allows cookies to be set
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          role: data.role,
          remember_me: data.rememberMe,
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Login failed" }));
        throw new Error(
          errorData.error || errorData.detail || "Invalid credentials",
        );
      }

      const user = await response.json();

      // Store user in auth store FIRST (sets _lastAuthTime for grace period)
      setAuth(user);

      // CRITICAL: Clear ALL cached queries (removes cached data completely)
      // This is stronger than invalidate - it deletes the cache entirely
      // Ensures validateSession will fetch fresh with new cookies, not use old cached {user: null}
      queryClient.clear();

      // Small delay to ensure cookies are fully set in browser before navigation
      // This prevents race conditions where validateSession runs before cookies are ready
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Redirect to the page they were trying to access, or dashboard
      const redirectTo = searchParams.get("redirect") || "/dashboard";
      router.push(redirectTo);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred during login",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Error Display */}
        {error && (
          <div className="flex items-start gap-3 p-3.5 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Role Field */}
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-gray-700">
                Role
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-12 bg-gray-50 border-gray-200 focus:border-teal-500 focus:ring-teal-500">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="border-gray-200">
                  <SelectItem value="nurse">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-teal-600" />
                      <span>Nurse</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="physician">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-teal-600" />
                      <span>Physician</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="ecmo_specialist">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-teal-600" />
                      <span>ECMO Specialist</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-teal-600" />
                      <span>Admin</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-gray-700">
                Email Address
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="your.name@hospital.com"
                    autoComplete="email"
                    className="h-12 pl-10 bg-gray-50 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Password Field */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-gray-700">
                Password
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="h-12 pl-10 pr-10 bg-gray-50 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Remember Me and Forgot Password */}
        <div className="flex items-center justify-between text-sm">
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="w-4 h-4"
                  />
                </FormControl>
                <FormLabel className="text-gray-600 font-normal cursor-pointer">
                  Remember me
                </FormLabel>
              </FormItem>
            )}
          />
          <Link
            href="/auth/forgot-password"
            className="text-teal-600 hover:text-teal-700"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-12 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-lg shadow-teal-500/30"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              <span>Signing In...</span>
            </>
          ) : (
            <>
              <Lock className="mr-2 h-5 w-5" />
              <span>Sign In</span>
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
