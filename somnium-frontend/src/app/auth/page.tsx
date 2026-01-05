"use client";

import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Shield, CheckCircle2, AlertCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function AuthPage() {
  const searchParams = useSearchParams();
  const sessionExpired = searchParams.get("session_expired") === "true";
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

          {/* Session Expired Alert */}
          {sessionExpired && (
            <div className="mb-6 flex items-start gap-3 p-3.5 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                Your session has expired. Please sign in again to continue.
              </span>
            </div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100 p-1">
              <TabsTrigger
                value="login"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <LoginForm />
            </TabsContent>

            <TabsContent value="register">
              <RegisterForm />
            </TabsContent>
          </Tabs>

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
