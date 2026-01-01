"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import Link from "next/link";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validations/auth";
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
  Activity,
  Shield,
  CheckCircle2,
  Mail,
  ArrowLeft,
  Loader2,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    // Simulate API call - replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Password reset requested for:", data.email);
    setIsLoading(false);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-teal-50 to-cyan-50 rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-purple-50 to-pink-50 rounded-full blur-3xl opacity-30 translate-y-1/2 -translate-x-1/2" />

        <div className="w-full max-w-md relative z-10">
          {/* Logo and Title */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl shadow-teal-500/30">
                <Activity className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Somnium ECMO Platform
            </h1>
            <p className="text-gray-600">Clinical Intelligence System</p>
          </div>

          {!isSubmitted ? (
            <>
              {/* Back to Sign In Link */}
              <Link
                href="/auth"
                className="inline-flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium mb-6 hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>

              {/* Title */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Forgot Password?
                </h2>
                <p className="text-sm text-gray-600">
                  Enter your email address and we'll send you a link to reset
                  your password.
                </p>
              </div>

              {/* Form */}
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
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

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-lg shadow-teal-500/30"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        <span>Sending Reset Link...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-5 w-5" />
                        <span>Send Reset Link</span>
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </>
          ) : (
            <div className="space-y-6">
              {/* Success Message */}
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-teal-600" />
                </div>
              </div>

              <div className="text-center space-y-3">
                <h2 className="text-2xl font-bold text-gray-900">
                  Check Your Email
                </h2>
                <p className="text-sm text-gray-600">
                  We've sent a password reset link to{" "}
                  <span className="font-semibold text-gray-900">
                    {form.getValues("email")}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Click the link in the email to reset your password. If you
                  don't see the email, check your spam folder.
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-4">
                <Link href="/auth" className="block">
                  <Button className="w-full h-12 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-lg shadow-teal-500/30">
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Back to Sign In
                  </Button>
                </Link>

                <button
                  onClick={() => setIsSubmitted(false)}
                  className="w-full text-sm text-teal-600 hover:text-teal-700 font-medium hover:underline"
                >
                  Try a different email address
                </button>
              </div>
            </div>
          )}

          {/* Security Notice */}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-500">
            <Shield className="w-4 h-4 text-teal-600" />
            <span>
              Secure connection. All data is encrypted and HIPAA compliant.
            </span>
          </div>
        </div>
      </div>

      {/* Right side - Info Panel */}
      <div className="hidden lg:block lg:w-1/2 relative bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src="/images/doctor.png"
            alt="Medical professionals working"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-teal-900/90 via-cyan-900/85 to-blue-900/90" />
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-between p-12">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm self-start">
            <Shield className="w-4 h-4" />
            <span>Trusted by 250+ Healthcare Institutions</span>
          </div>

          {/* Center Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-white">
                Advanced ECMO Patient Intelligence
              </h2>
              <p className="text-xl text-teal-50 max-w-lg">
                Real-time monitoring, AI-powered predictions, and clinical
                decision support for critical care teams.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3">
              <div className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm">
                98.5% Prediction Accuracy
              </div>
              <div className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm">
                &lt;30s Alert Response
              </div>
              <div className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm">
                HIPAA Compliant
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-white">250+</div>
                <div className="text-sm text-teal-100">Active ICUs</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-white">50K+</div>
                <div className="text-sm text-teal-100">Patients Monitored</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-white">99.9%</div>
                <div className="text-sm text-teal-100">System Uptime</div>
              </div>
            </div>
          </div>

          {/* Bottom Quote */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <p className="text-teal-50 mb-4">
              "Somnium has transformed how we manage ECMO patients. The
              predictive analytics have helped us identify deteriorating
              patients hours earlier."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-sm">
                SC
              </div>
              <div>
                <div className="text-white text-sm font-semibold">
                  Dr. Sarah Chen
                </div>
                <div className="text-xs text-teal-100">
                  Director of Critical Care, Mass General
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
