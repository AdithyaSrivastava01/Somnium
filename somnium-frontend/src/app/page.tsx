"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useIsAuthenticated } from "@/stores/auth-store";
import {
  Activity,
  Brain,
  Bell,
  LineChart,
  Shield,
  Zap,
  ArrowRight,
  Heart,
  Users,
  CheckCircle2,
  BarChart3,
  Clock,
  TrendingUp,
  Lock,
  Waves,
} from "lucide-react";

export default function LandingPage() {
  const isAuthenticated = useIsAuthenticated();

  const features = [
    {
      icon: Activity,
      title: "Real-Time Monitoring",
      description:
        "Sub-second latency tracking of all ECMO parameters, hemodynamics, and ventilator settings with intelligent pattern recognition.",
      color: "teal",
      gradient: "from-teal-50 to-teal-100/50",
      iconColor: "text-teal-700",
      borderColor: "hover:border-teal-200",
      stats: "Millisecond precision",
    },
    {
      icon: Brain,
      title: "AI Survivability Prediction",
      description:
        "Deep learning models analyze 50+ clinical variables to predict outcomes with 98.5% accuracy, helping clinicians make informed decisions.",
      color: "blue",
      gradient: "from-blue-50 to-blue-100/50",
      iconColor: "text-blue-700",
      borderColor: "hover:border-blue-200",
      stats: "98.5% accuracy",
    },
    {
      icon: Waves,
      title: "Digital Twin Simulation",
      description:
        "Create high-fidelity virtual patient models to test treatment protocols and predict responses before making clinical changes.",
      color: "cyan",
      gradient: "from-cyan-50 to-cyan-100/50",
      iconColor: "text-cyan-700",
      borderColor: "hover:border-cyan-200",
      stats: "Predictive modeling",
    },
    {
      icon: Bell,
      title: "Smart Alert System",
      description:
        "Context-aware notifications with multi-tier prioritization, reducing alert fatigue while ensuring critical events are never missed.",
      color: "amber",
      gradient: "from-amber-50 to-amber-100/50",
      iconColor: "text-amber-700",
      borderColor: "hover:border-amber-200",
      stats: "<30s response",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description:
        "Comprehensive trend analysis with customizable dashboards, predictive insights, and automated reporting for evidence-based care.",
      color: "emerald",
      gradient: "from-emerald-50 to-emerald-100/50",
      iconColor: "text-emerald-700",
      borderColor: "hover:border-emerald-200",
      stats: "Real-time insights",
    },
    {
      icon: Shield,
      title: "Clinical-Grade Security",
      description:
        "HIPAA-compliant infrastructure with AES-256 encryption, comprehensive audit trails, and granular role-based access control.",
      color: "slate",
      gradient: "from-slate-50 to-slate-100/50",
      iconColor: "text-slate-700",
      borderColor: "hover:border-slate-200",
      stats: "HIPAA certified",
    },
  ];

  const trustIndicators = [
    { icon: CheckCircle2, text: "HIPAA Compliant" },
    { icon: Lock, text: "SOC 2 Type II" },
    { icon: Shield, text: "FDA Class II" },
    { icon: CheckCircle2, text: "HL7 FHIR" },
  ];

  const stats = [
    {
      value: "98.5%",
      label: "Prediction Accuracy",
      sublabel: "Validated across 10,000+ cases",
    },
    {
      value: "<30s",
      label: "Alert Response Time",
      sublabel: "Average time to clinician notification",
    },
    {
      value: "24/7",
      label: "Continuous Monitoring",
      sublabel: "Zero downtime guarantee",
    },
    {
      value: "50+",
      label: "Clinical Parameters",
      sublabel: "Comprehensive data integration",
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Navigation */}
      <nav className="border-b border-stone-200/80 dark:border-slate-800/60 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-lg flex items-center justify-center shadow-md">
                <Heart className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-semibold text-stone-900 dark:text-slate-100 tracking-tight leading-none">
                  Somnium
                </span>
                <span className="text-xs text-stone-500 dark:text-slate-400 font-medium tracking-wide">
                  ECMO Platform
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button
                    size="sm"
                    className="font-medium bg-teal-700 hover:bg-teal-800 text-white shadow-sm"
                  >
                    Dashboard
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-100"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth">
                    <Button
                      size="sm"
                      className="font-medium bg-teal-700 hover:bg-teal-800 text-white shadow-sm"
                    >
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-20 lg:pb-24 bg-gradient-to-b from-white via-stone-50/50 to-white dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-950">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 -z-10 opacity-40">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left column - Content */}
            <div className="max-w-2xl">
              {/* Trust badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-900 mb-6">
                <Zap className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                <span className="text-sm font-semibold text-teal-800 dark:text-teal-300 tracking-wide">
                  AI-Powered Clinical Intelligence
                </span>
              </div>

              {/* Main headline */}
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-stone-900 dark:text-slate-50 mb-5 tracking-tight leading-[1.1]">
                Advanced ECMO Patient
                <span className="block text-teal-700 dark:text-teal-400 mt-1">
                  Monitoring & Prediction
                </span>
              </h1>

              <p className="text-lg text-stone-600 dark:text-slate-400 mb-8 leading-relaxed">
                Empower your critical care team with real-time monitoring,
                AI-driven survivability predictions, and digital twin
                simulations for optimized ECMO therapy management.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                {isAuthenticated ? (
                  <Link href="/dashboard">
                    <Button
                      size="lg"
                      className="text-base font-semibold px-7 py-6 h-auto bg-teal-700 hover:bg-teal-800 text-white shadow-lg shadow-teal-700/20 hover:shadow-xl hover:shadow-teal-700/30 transition-all duration-200"
                    >
                      Open Dashboard
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth">
                      <Button
                        size="lg"
                        className="text-base font-semibold px-7 py-6 h-auto bg-teal-700 hover:bg-teal-800 text-white shadow-lg shadow-teal-700/20 hover:shadow-xl hover:shadow-teal-700/30 transition-all duration-200"
                      >
                        Start Monitoring
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="lg"
                      className="text-base font-semibold px-7 py-6 h-auto border-stone-300 dark:border-slate-700 hover:bg-stone-100 dark:hover:bg-slate-800 transition-all duration-200"
                      asChild
                    >
                      <a href="#features">Learn More</a>
                    </Button>
                  </>
                )}
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap gap-4">
                {trustIndicators.map((indicator, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 text-sm text-stone-600 dark:text-slate-400"
                  >
                    <indicator.icon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span className="font-medium">{indicator.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column - Stats cards */}
            <div className="grid grid-cols-2 gap-4 lg:gap-5">
              {stats.map((stat, i) => (
                <Card
                  key={i}
                  className="bg-white dark:bg-slate-900 border-stone-200 dark:border-slate-800 hover:shadow-lg hover:border-teal-200 dark:hover:border-teal-800 transition-all duration-300"
                >
                  <CardHeader className="p-5">
                    <div className="text-3xl font-bold text-teal-700 dark:text-teal-400 mb-1 tracking-tight">
                      {stat.value}
                    </div>
                    <div className="text-sm font-semibold text-stone-900 dark:text-slate-100 mb-0.5">
                      {stat.label}
                    </div>
                    <div className="text-xs text-stone-500 dark:text-slate-400 leading-tight">
                      {stat.sublabel}
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 lg:py-28 bg-white dark:bg-slate-950"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Section header */}
          <div className="max-w-3xl mb-16">
            <Badge
              variant="outline"
              className="mb-4 border-teal-200 text-teal-700 dark:border-teal-800 dark:text-teal-400"
            >
              Platform Capabilities
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-stone-900 dark:text-slate-50 mb-4 tracking-tight">
              Comprehensive ECMO Monitoring Suite
            </h2>
            <p className="text-lg text-stone-600 dark:text-slate-400 leading-relaxed">
              Purpose-built for intensive care units managing ECMO patients with
              real-time analytics, predictive intelligence, and clinical
              decision support.
            </p>
          </div>

          {/* Feature Grid - Asymmetric layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Card
                key={i}
                className={`group relative overflow-hidden bg-gradient-to-br ${feature.gradient} dark:from-slate-900 dark:to-slate-800 border-stone-200 dark:border-slate-800 ${feature.borderColor} transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
              >
                <CardHeader className="p-6">
                  {/* Icon container */}
                  <div className="relative mb-5">
                    <div className="w-12 h-12 bg-white dark:bg-slate-950 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                      <feature.icon
                        className={`w-6 h-6 ${feature.iconColor} dark:${feature.iconColor}`}
                        strokeWidth={2}
                      />
                    </div>
                    {/* Small stat badge */}
                    <div className="absolute -top-1 -right-1 px-2 py-0.5 bg-white dark:bg-slate-900 rounded-md shadow-sm border border-stone-200 dark:border-slate-700">
                      <span className="text-xs font-semibold text-stone-600 dark:text-slate-400">
                        {feature.stats}
                      </span>
                    </div>
                  </div>

                  <CardTitle className="text-xl font-bold text-stone-900 dark:text-slate-100 mb-2">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-stone-600 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Seamless Integration Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-stone-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left Column - Content */}
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-stone-900 dark:text-slate-50 mb-4 tracking-tight">
                Seamless Integration Into Your ICU
              </h2>
              <p className="text-lg text-stone-600 dark:text-slate-400 mb-10 leading-relaxed">
                Deploy in minutes, integrate with existing systems, and start
                receiving AI-powered insights immediately. Designed for the
                demanding environment of critical care.
              </p>

              {/* Feature Cards */}
              <div className="space-y-4 mb-12">
                {/* Real-Time Dashboard */}
                <Card className="border-stone-200 dark:border-slate-800 hover:shadow-md transition-shadow">
                  <CardHeader className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-teal-50 dark:bg-teal-950 rounded-lg flex items-center justify-center flex-shrink-0">
                        <LineChart className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-stone-900 dark:text-slate-100 mb-1">
                          Real-Time Dashboard
                        </h3>
                        <p className="text-sm text-stone-600 dark:text-slate-400">
                          Unified view of all patient vitals and ECMO parameters
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* AI Processing */}
                <Card className="border-stone-200 dark:border-slate-800 hover:shadow-md transition-shadow">
                  <CardHeader className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-teal-50 dark:bg-teal-950 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Brain className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-stone-900 dark:text-slate-100 mb-1">
                          AI Processing
                        </h3>
                        <p className="text-sm text-stone-600 dark:text-slate-400">
                          Advanced machine learning for predictive analytics
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Instant Alerts */}
                <Card className="border-stone-200 dark:border-slate-800 hover:shadow-md transition-shadow">
                  <CardHeader className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-teal-50 dark:bg-teal-950 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Zap className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-stone-900 dark:text-slate-100 mb-1">
                          Instant Alerts
                        </h3>
                        <p className="text-sm text-stone-600 dark:text-slate-400">
                          Context-aware notifications to the right clinician
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Secure Storage */}
                <Card className="border-stone-200 dark:border-slate-800 hover:shadow-md transition-shadow">
                  <CardHeader className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-teal-50 dark:bg-teal-950 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Lock className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-stone-900 dark:text-slate-100 mb-1">
                          Secure Storage
                        </h3>
                        <p className="text-sm text-stone-600 dark:text-slate-400">
                          HIPAA-compliant data management and archiving
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="border-stone-200 dark:border-slate-800">
                  <CardHeader className="p-4 text-center">
                    <div className="text-3xl font-bold text-stone-900 dark:text-slate-100 mb-1">
                      5 min
                    </div>
                    <div className="text-xs text-stone-600 dark:text-slate-400 font-medium">
                      Setup Time
                    </div>
                  </CardHeader>
                </Card>
                <Card className="border-stone-200 dark:border-slate-800">
                  <CardHeader className="p-4 text-center">
                    <div className="text-3xl font-bold text-stone-900 dark:text-slate-100 mb-1">
                      99.9%
                    </div>
                    <div className="text-xs text-stone-600 dark:text-slate-400 font-medium">
                      Uptime SLA
                    </div>
                  </CardHeader>
                </Card>
                <Card className="border-stone-200 dark:border-slate-800">
                  <CardHeader className="p-4 text-center">
                    <div className="text-3xl font-bold text-stone-900 dark:text-slate-100 mb-1">
                      24/7
                    </div>
                    <div className="text-xs text-stone-600 dark:text-slate-400 font-medium">
                      Support
                    </div>
                  </CardHeader>
                </Card>
              </div>
            </div>

            {/* Right Column - Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-stone-200 dark:border-slate-800">
                <img
                  src="/images/monitor.png"
                  alt="Healthcare professional using tablet with monitoring dashboard"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 to-transparent" />
              </div>

              {/* Floating Indicator */}
              <div className="absolute top-6 right-6 bg-white dark:bg-slate-900 rounded-xl shadow-xl p-4 border border-stone-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-stone-900 dark:text-slate-100 font-medium">
                    Live Monitoring
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 bg-white dark:bg-slate-950 border-y border-stone-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-700 dark:text-teal-400 mb-1">
                10,000+
              </div>
              <div className="text-sm text-stone-600 dark:text-slate-400 font-medium">
                ECMO Cases Analyzed
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-700 dark:text-teal-400 mb-1">
                25+
              </div>
              <div className="text-sm text-stone-600 dark:text-slate-400 font-medium">
                Partner Hospitals
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-700 dark:text-teal-400 mb-1">
                99.9%
              </div>
              <div className="text-sm text-stone-600 dark:text-slate-400 font-medium">
                System Uptime
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-700 dark:text-teal-400 mb-1">
                24/7
              </div>
              <div className="text-sm text-stone-600 dark:text-slate-400 font-medium">
                Clinical Support
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-teal-700 via-teal-800 to-cyan-700 dark:from-teal-900 dark:via-teal-950 dark:to-cyan-900 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-300 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-5 tracking-tight">
            Ready to Transform ECMO Care?
          </h2>
          <p className="text-lg text-teal-50 mb-10 leading-relaxed max-w-2xl mx-auto">
            Join leading ICUs worldwide using AI-powered insights to improve
            patient outcomes, reduce complications, and optimize critical care
            workflows.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-base font-semibold px-8 py-6 h-auto bg-white text-teal-900 hover:bg-stone-100 shadow-xl transition-all duration-200"
                >
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="text-base font-semibold px-8 py-6 h-auto bg-white text-teal-900 hover:bg-stone-100 shadow-xl transition-all duration-200"
                  >
                    Get Started Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base font-semibold px-8 py-6 h-auto border-2 border-white text-teal hover:bg-white/10 transition-all duration-200"
                  asChild
                >
                  <a href="#features">View Features</a>
                </Button>
              </>
            )}
          </div>

          {/* Mini trust badges */}
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-teal-50 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>FDA Cleared</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>SOC 2 Certified</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-lg flex items-center justify-center shadow-md">
                <Heart className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-semibold text-stone-900 dark:text-slate-100 leading-none">
                  Somnium ECMO Platform
                </span>
                <span className="text-xs text-stone-500 dark:text-slate-400 font-medium mt-0.5">
                  Advancing critical care with AI
                </span>
              </div>
            </div>
            <div className="text-sm text-stone-600 dark:text-slate-400 md:text-right">
              <div className="flex flex-wrap gap-4 md:justify-end mb-2">
                <span className="font-medium">HIPAA Compliant</span>
                <span className="text-stone-400">•</span>
                <span className="font-medium">SOC 2 Type II</span>
                <span className="text-stone-400">•</span>
                <span className="font-medium">FDA Class II</span>
              </div>
              <div>
                &copy; {new Date().getFullYear()} Somnium Medical Technologies.
                All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
