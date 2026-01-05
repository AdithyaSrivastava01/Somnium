"use client";

import { useState } from "react";
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
import {
  AlertCircle,
  Loader2,
  UserPlus,
  Activity,
  Shield,
  Building2,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import type { UserRole } from "@/lib/validations/auth";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [hospitalSearch, setHospitalSearch] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Fetch hospitals list
  const { data: hospitals, isLoading: hospitalsLoading } =
    trpc.auth.getHospitals.useQuery();

  // Filter hospitals based on search
  const filteredHospitals = hospitals?.filter((hospital) =>
    `${hospital.name} ${hospital.city} ${hospital.state}`
      .toLowerCase()
      .includes(hospitalSearch.toLowerCase()),
  );

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      full_name: "",
      role: "nurse" as UserRole,
      hospital_id: "",
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
    // Validate email domain matches selected hospital
    const selectedHospital = hospitals?.find((h) => h.id === data.hospital_id);
    if (selectedHospital) {
      const emailDomain = data.email.split("@")[1]?.toLowerCase();
      if (emailDomain !== selectedHospital.email_domain.toLowerCase()) {
        form.setError("email", {
          type: "manual",
          message: `Email must use @${selectedHospital.email_domain} domain for ${selectedHospital.name}`,
        });
        return;
      }
    }

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
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    className="h-11 border-stone-300 bg-white hover:border-teal-400 transition-colors focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 pr-10"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-700 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Hospital Field - Searchable */}
        <FormField
          control={form.control}
          name="hospital_id"
          render={({ field }) => {
            const selectedHospital = hospitals?.find(
              (h) => h.id === field.value,
            );

            return (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-stone-700">
                  Hospital
                </FormLabel>
                <div className="space-y-2">
                  {/* Selected Hospital Display */}
                  {selectedHospital ? (
                    <div className="p-3 bg-teal-50 border border-teal-200 rounded-md">
                      <div className="flex items-center gap-2 text-sm mb-2">
                        <Check className="w-4 h-4 text-teal-600" />
                        <span className="text-teal-900 font-medium">
                          {selectedHospital.name} - {selectedHospital.city},{" "}
                          {selectedHospital.state}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            field.onChange("");
                            setHospitalSearch("");
                          }}
                          className="ml-auto text-teal-600 hover:text-teal-800 font-semibold"
                          aria-label="Clear hospital selection"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="text-xs text-teal-700 bg-teal-100 px-2 py-1 rounded">
                        <strong>Required email domain:</strong> @
                        {selectedHospital.email_domain}
                      </div>
                    </div>
                  ) : (
                    <>
                      <FormControl>
                        <Input
                          placeholder={
                            hospitalsLoading
                              ? "Loading hospitals..."
                              : "Search hospital name, city, or state..."
                          }
                          value={hospitalSearch}
                          onChange={(e) => setHospitalSearch(e.target.value)}
                          disabled={hospitalsLoading}
                          className="h-11 border-stone-300 bg-white hover:border-teal-400 transition-colors focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                        />
                      </FormControl>

                      {/* Filtered Hospitals List */}
                      {hospitalSearch && (
                        <div className="max-h-[200px] overflow-y-auto border border-stone-200 rounded-md bg-white shadow-md">
                          {filteredHospitals && filteredHospitals.length > 0 ? (
                            filteredHospitals.map((hospital) => (
                              <button
                                key={hospital.id}
                                type="button"
                                onClick={() => {
                                  field.onChange(hospital.id);
                                  setHospitalSearch("");
                                }}
                                className="w-full text-left p-3 hover:bg-teal-50 transition-colors border-b border-stone-100 last:border-b-0"
                              >
                                <div className="flex items-center gap-2">
                                  <Building2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-stone-900 truncate">
                                      {hospital.name}
                                    </div>
                                    <div className="text-xs text-stone-500">
                                      {hospital.city}, {hospital.state}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="p-3 text-sm text-stone-500 text-center">
                              No hospitals found
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
                <FormMessage className="text-xs" />
              </FormItem>
            );
          }}
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
