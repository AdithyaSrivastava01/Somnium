"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { useAuthStore } from "@/stores/auth-store";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { getCsrfToken } from "@/hooks/use-csrf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { AlertCircle, Loader2, UserPlus, Activity, Shield } from "lucide-react";
import type { UserRole } from "@/lib/validations/auth";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      full_name: "",
      role: "nurse" as UserRole,
      department: "",
    },
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: ({ user }) => {
      // Tokens are now in httpOnly cookies, only store user info
      setAuth(user);

      // Redirect to the page they were trying to access, or dashboard
      const redirectTo = searchParams.get("redirect") || "/dashboard";
      router.push(redirectTo);
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      const csrfToken = await getCsrfToken();
      registerMutation.mutate({ ...data, csrfToken });
    } catch (error) {
      // Handle CSRF token fetch error
      console.error("Failed to fetch CSRF token:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Error Display */}
        {registerMutation.error && (
          <div className="flex items-start gap-3 p-3.5 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              {registerMutation.error.message}
            </span>
          </div>
        )}

        {/* Full Name Field */}
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-stone-700">
                Full Name
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Dr. Jane Smith"
                  autoComplete="name"
                  className="h-11 border-stone-300 bg-white hover:border-teal-400 transition-colors focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  {...field}
                />
              </FormControl>
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
              <FormLabel className="text-sm font-semibold text-stone-700">
                Email Address
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="your.name@hospital.com"
                  autoComplete="email"
                  className="h-11 border-stone-300 bg-white hover:border-teal-400 transition-colors focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  {...field}
                />
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
              <FormLabel className="text-sm font-semibold text-stone-700">
                Password
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  className="h-11 border-stone-300 bg-white hover:border-teal-400 transition-colors focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Role Field */}
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-stone-700">
                Role
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-11 border-stone-300 bg-white hover:border-teal-400 transition-colors focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="border-stone-200">
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

        {/* Department Field (Optional) */}
        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-stone-700">
                Department <span className="text-stone-400">(Optional)</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., ICU, Cardiology"
                  className="h-11 border-stone-300 bg-white hover:border-teal-400 transition-colors focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-11 bg-teal-700 hover:bg-teal-800 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 mt-6"
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              <span>Create Account</span>
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
