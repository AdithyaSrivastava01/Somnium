"use client";

import { useAuthStore } from "@/stores/auth-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Users,
  AlertTriangle,
  TrendingUp,
  Heart,
  Waves,
  Droplet,
  Wind,
  Thermometer,
  Brain,
  Clock,
  Bell,
  ChevronRight,
  TrendingDown,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  CheckCircle2,
  Timer,
  Stethoscope,
  Users2,
} from "lucide-react";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  // Sample patient data with realistic medical values
  const activePatients = [
    {
      id: "PT-2847",
      name: "Patient A",
      age: 58,
      gender: "M",
      ecmoMode: "VV-ECMO",
      duration: "72h 15m",
      status: "stable",
      survivability: 87,
      vitals: {
        heartRate: 92,
        bloodPressure: "118/76",
        spo2: 94,
        temperature: 37.2,
        flowRate: 4.2,
      },
      alerts: 0,
    },
    {
      id: "PT-2891",
      name: "Patient B",
      age: 45,
      gender: "F",
      ecmoMode: "VA-ECMO",
      duration: "48h 32m",
      status: "warning",
      survivability: 72,
      vitals: {
        heartRate: 108,
        bloodPressure: "142/88",
        spo2: 89,
        temperature: 38.1,
        flowRate: 3.8,
      },
      alerts: 2,
    },
    {
      id: "PT-2903",
      name: "Patient C",
      age: 62,
      gender: "M",
      ecmoMode: "VV-ECMO",
      duration: "124h 08m",
      status: "stable",
      survivability: 91,
      vitals: {
        heartRate: 88,
        bloodPressure: "122/78",
        spo2: 96,
        temperature: 36.8,
        flowRate: 4.5,
      },
      alerts: 0,
    },
  ];

  const recentAlerts = [
    {
      id: 1,
      patient: "PT-2891",
      type: "warning",
      message: "Elevated temperature detected - 38.1°C",
      time: "2 min ago",
      acknowledged: false,
    },
    {
      id: 2,
      patient: "PT-2891",
      type: "warning",
      message: "SpO₂ below target threshold - 89%",
      time: "8 min ago",
      acknowledged: false,
    },
    {
      id: 3,
      patient: "PT-2847",
      type: "info",
      message: "Flow rate adjusted to 4.2 L/min",
      time: "15 min ago",
      acknowledged: true,
    },
    {
      id: 4,
      patient: "PT-2903",
      type: "success",
      message: "Vitals stabilized within normal range",
      time: "32 min ago",
      acknowledged: true,
    },
    {
      id: 5,
      patient: "PT-2847",
      type: "info",
      message: "AI prediction updated - 87% survivability",
      time: "1 hr ago",
      acknowledged: true,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "stable":
        return "text-teal-700 bg-teal-50 border-teal-200";
      case "warning":
        return "text-amber-700 bg-amber-50 border-amber-200";
      case "critical":
        return "text-red-700 bg-red-50 border-red-200";
      default:
        return "text-stone-700 bg-stone-50 border-stone-200";
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "critical":
        return "border-l-red-500 bg-red-50/50";
      case "warning":
        return "border-l-amber-500 bg-amber-50/50";
      case "success":
        return "border-l-teal-500 bg-teal-50/50";
      default:
        return "border-l-blue-500 bg-blue-50/50";
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-teal-600" />;
      default:
        return <Bell className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="space-y-6 pb-8">
        {/* Header Section */}
        <div className="bg-white border-b border-stone-200">
          <div className="px-6 py-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
                    ECMO Monitoring Dashboard
                  </h1>
                  <Badge className="bg-teal-100 text-teal-800 border-teal-200 font-semibold">
                    Live
                  </Badge>
                </div>
                <p className="text-sm text-stone-600">
                  Welcome back,{" "}
                  <span className="font-semibold">{user?.full_name}</span>
                  <span className="mx-2 text-stone-300">•</span>
                  <span className="capitalize text-teal-700 font-medium">
                    {user?.role.replace("_", " ")}
                  </span>
                  <span className="mx-2 text-stone-300">•</span>
                  <span className="text-stone-500">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-stone-700 border-stone-300 hover:bg-stone-50"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Last 24h
                </Button>
                <Button
                  size="sm"
                  className="bg-teal-700 hover:bg-teal-800 text-white font-medium"
                >
                  <Users2 className="w-4 h-4 mr-2" />
                  View All Patients
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 space-y-6">
          {/* Critical Stats Grid - Asymmetric layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Patients */}
            <Card className="bg-white border-stone-200 hover:shadow-md transition-all duration-200 hover:border-teal-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl flex items-center justify-center">
                    <Users
                      className="w-5 h-5 text-teal-700"
                      strokeWidth={2.5}
                    />
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-teal-700">
                    <TrendingUp className="w-3 h-3" />
                    <span>+12%</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-3xl font-bold text-stone-900 tracking-tight">
                  12
                </div>
                <p className="text-sm font-medium text-stone-600">
                  Total Patients
                </p>
                <p className="text-xs text-stone-500">
                  8 on ECMO, 4 post-decannulation
                </p>
              </CardContent>
            </Card>

            {/* Active ECMO */}
            <Card className="bg-white border-stone-200 hover:shadow-md transition-all duration-200 hover:border-cyan-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl flex items-center justify-center">
                    <Activity
                      className="w-5 h-5 text-cyan-700"
                      strokeWidth={2.5}
                    />
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-stone-600">
                    <Minus className="w-3 h-3" />
                    <span>Stable</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-3xl font-bold text-stone-900 tracking-tight">
                  8
                </div>
                <p className="text-sm font-medium text-stone-600">
                  Active ECMO Cases
                </p>
                <p className="text-xs text-stone-500">5 VV-ECMO, 3 VA-ECMO</p>
              </CardContent>
            </Card>

            {/* Critical Alerts */}
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200 hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <AlertTriangle
                      className="w-5 h-5 text-amber-700"
                      strokeWidth={2.5}
                    />
                  </div>
                  <Badge className="bg-amber-600 text-white text-xs font-bold border-0">
                    Action Required
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-3xl font-bold text-amber-900 tracking-tight">
                  2
                </div>
                <p className="text-sm font-semibold text-amber-800">
                  Active Alerts
                </p>
                <p className="text-xs text-amber-700 font-medium">
                  1 patient requires attention
                </p>
              </CardContent>
            </Card>

            {/* Avg Survivability */}
            <Card className="bg-white border-stone-200 hover:shadow-md transition-all duration-200 hover:border-emerald-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl flex items-center justify-center">
                    <Brain
                      className="w-5 h-5 text-emerald-700"
                      strokeWidth={2.5}
                    />
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-emerald-700">
                    <ArrowUpRight className="w-3 h-3" />
                    <span>+8%</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-3xl font-bold text-stone-900 tracking-tight">
                  83%
                </div>
                <p className="text-sm font-medium text-stone-600">
                  Avg AI Survivability
                </p>
                <p className="text-xs text-stone-500">
                  Based on current cohort
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Patients Monitor - Takes 2 columns */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-stone-900">
                    Active ECMO Patients
                  </h2>
                  <p className="text-sm text-stone-600">
                    Real-time monitoring and AI predictions
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-teal-700 hover:text-teal-800 hover:bg-teal-50"
                >
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              {/* Patient Cards */}
              <div className="space-y-3">
                {activePatients.map((patient) => (
                  <Card
                    key={patient.id}
                    className="bg-white border-stone-200 hover:shadow-lg transition-all duration-200 hover:border-teal-200 group"
                  >
                    <CardContent className="p-5">
                      <div className="space-y-4">
                        {/* Patient Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-lg flex items-center justify-center font-bold text-teal-800 text-lg">
                              {patient.name.split(" ")[1]?.[0] || "P"}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-bold text-stone-900">
                                  {patient.name}
                                </span>
                                <span className="text-xs text-stone-500">
                                  ({patient.age}y, {patient.gender})
                                </span>
                                <Badge className="text-xs px-2 py-0 bg-stone-100 text-stone-700 border-stone-200">
                                  {patient.id}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <Badge
                                  className={`font-semibold ${getStatusColor(
                                    patient.status,
                                  )}`}
                                >
                                  {patient.status.toUpperCase()}
                                </Badge>
                                <span className="text-stone-600">
                                  {patient.ecmoMode}
                                </span>
                                <span className="text-stone-400">•</span>
                                <div className="flex items-center gap-1 text-stone-600">
                                  <Timer className="w-3 h-3" />
                                  {patient.duration}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* AI Survivability */}
                          <div className="text-right">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Brain className="w-4 h-4 text-teal-600" />
                              <span className="text-xs font-medium text-stone-600">
                                AI Prediction
                              </span>
                            </div>
                            <div
                              className={`text-2xl font-bold tracking-tight ${
                                patient.survivability >= 85
                                  ? "text-teal-700"
                                  : patient.survivability >= 70
                                    ? "text-amber-700"
                                    : "text-red-700"
                              }`}
                            >
                              {patient.survivability}%
                            </div>
                            <p className="text-xs text-stone-500">
                              survivability
                            </p>
                          </div>
                        </div>

                        {/* Vitals Grid */}
                        <div className="grid grid-cols-5 gap-3 pt-3 border-t border-stone-100">
                          {/* Heart Rate */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-xs text-stone-500">
                              <Heart className="w-3 h-3" />
                              <span>HR</span>
                            </div>
                            <div
                              className={`text-lg font-bold ${
                                patient.vitals.heartRate > 100
                                  ? "text-amber-700"
                                  : "text-stone-900"
                              }`}
                            >
                              {patient.vitals.heartRate}
                            </div>
                            <div className="text-xs text-stone-500">bpm</div>
                          </div>

                          {/* Blood Pressure */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-xs text-stone-500">
                              <Activity className="w-3 h-3" />
                              <span>BP</span>
                            </div>
                            <div className="text-lg font-bold text-stone-900">
                              {patient.vitals.bloodPressure.split("/")[0]}
                            </div>
                            <div className="text-xs text-stone-500">
                              /{patient.vitals.bloodPressure.split("/")[1]} mmHg
                            </div>
                          </div>

                          {/* SpO2 */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-xs text-stone-500">
                              <Wind className="w-3 h-3" />
                              <span>SpO₂</span>
                            </div>
                            <div
                              className={`text-lg font-bold ${
                                patient.vitals.spo2 < 90
                                  ? "text-amber-700"
                                  : "text-stone-900"
                              }`}
                            >
                              {patient.vitals.spo2}
                            </div>
                            <div className="text-xs text-stone-500">%</div>
                          </div>

                          {/* Temperature */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-xs text-stone-500">
                              <Thermometer className="w-3 h-3" />
                              <span>Temp</span>
                            </div>
                            <div
                              className={`text-lg font-bold ${
                                patient.vitals.temperature > 38
                                  ? "text-amber-700"
                                  : "text-stone-900"
                              }`}
                            >
                              {patient.vitals.temperature}
                            </div>
                            <div className="text-xs text-stone-500">°C</div>
                          </div>

                          {/* Flow Rate */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-xs text-stone-500">
                              <Droplet className="w-3 h-3" />
                              <span>Flow</span>
                            </div>
                            <div className="text-lg font-bold text-teal-700">
                              {patient.vitals.flowRate}
                            </div>
                            <div className="text-xs text-stone-500">L/min</div>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-teal-700 border-teal-200 hover:bg-teal-50 hover:border-teal-300 font-medium group-hover:bg-teal-700 group-hover:text-white transition-all duration-200"
                          >
                            <Stethoscope className="w-4 h-4 mr-2" />
                            View Detailed Monitoring
                            <ChevronRight className="w-4 h-4 ml-auto" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Right Sidebar - Alerts & Quick Actions */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="bg-gradient-to-br from-teal-700 to-cyan-700 border-0 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-white">
                    Quick Actions
                  </CardTitle>
                  <CardDescription className="text-teal-50">
                    Common clinical tasks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full justify-start bg-white/90 hover:bg-white text-teal-900 font-medium"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Add New Patient
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-white hover:bg-white/10 font-medium"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Run AI Analysis
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-white hover:bg-white/10 font-medium"
                  >
                    <Waves className="w-4 h-4 mr-2" />
                    ECMO Settings
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-white hover:bg-white/10 font-medium"
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                </CardContent>
              </Card>

              {/* Active Alerts */}
              <Card className="bg-white border-stone-200">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold text-stone-900">
                        Active Alerts
                      </CardTitle>
                      <CardDescription className="text-stone-600">
                        Real-time notifications
                      </CardDescription>
                    </div>
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200 font-bold">
                      2
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {recentAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 border-l-4 rounded-r-lg ${getAlertColor(
                        alert.type,
                      )} ${
                        alert.acknowledged ? "opacity-60" : ""
                      } transition-all duration-200 hover:shadow-sm`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-stone-700">
                              {alert.patient}
                            </span>
                            {!alert.acknowledged && (
                              <Badge className="text-xs px-1.5 py-0 bg-red-600 text-white border-0">
                                NEW
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-stone-700 leading-snug mb-1">
                            {alert.message}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-stone-500">
                              {alert.time}
                            </span>
                            {!alert.acknowledged && (
                              <>
                                <span className="text-stone-300">•</span>
                                <button className="text-xs text-teal-700 font-medium hover:text-teal-800">
                                  Acknowledge
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* System Status */}
              <Card className="bg-white border-stone-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-stone-900">
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                      <span className="text-stone-700">AI Model</span>
                    </div>
                    <span className="text-teal-700 font-semibold">Online</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                      <span className="text-stone-700">Data Stream</span>
                    </div>
                    <span className="text-teal-700 font-semibold">Active</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                      <span className="text-stone-700">Alert System</span>
                    </div>
                    <span className="text-teal-700 font-semibold">
                      Monitoring
                    </span>
                  </div>
                  <div className="pt-2 border-t border-stone-100">
                    <div className="text-xs text-stone-500">
                      Last sync:{" "}
                      <span className="text-stone-700 font-medium">
                        Just now
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Bottom Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white border-stone-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-stone-600 mb-1 font-medium">
                      Avg ECMO Duration
                    </p>
                    <p className="text-2xl font-bold text-stone-900">81.5h</p>
                    <p className="text-xs text-stone-500 mt-1">
                      Current patient cohort
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-stone-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-stone-600 mb-1 font-medium">
                      Alert Response Time
                    </p>
                    <p className="text-2xl font-bold text-stone-900">
                      &lt;3min
                    </p>
                    <p className="text-xs text-teal-700 mt-1 font-medium flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" />
                      18% faster than target
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl flex items-center justify-center">
                    <Timer className="w-6 h-6 text-teal-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-stone-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-stone-600 mb-1 font-medium">
                      Successful Weaning
                    </p>
                    <p className="text-2xl font-bold text-stone-900">76%</p>
                    <p className="text-xs text-emerald-700 mt-1 font-medium flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Above national avg (68%)
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-emerald-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
