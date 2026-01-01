"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
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
  Stethoscope,
  Brain,
  TrendingUp,
  Activity,
  ChevronRight,
} from "lucide-react";

function PhysiciansOnlyContent() {
  return (
    <div className="min-h-screen bg-stone-50 p-6 space-y-6">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 -mx-6 -mt-6 px-6 py-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
                Physicians Only
              </h1>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-semibold">
                Clinical Access
              </Badge>
            </div>
            <p className="text-sm text-stone-600">
              Advanced tools restricted to physicians and ECMO specialists
            </p>
          </div>
          <Button className="bg-teal-700 hover:bg-teal-800 text-white font-medium">
            <Brain className="w-4 h-4 mr-2" />
            Run Analysis
          </Button>
        </div>
      </div>

      {/* Main Info Card */}
      <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <Stethoscope
                className="w-6 h-6 text-teal-700"
                strokeWidth={2.5}
              />
            </div>
            <div>
              <CardTitle className="text-lg text-teal-900">
                Clinical Prediction Access
              </CardTitle>
              <CardDescription className="text-teal-700">
                View and analyze ML-based survivability predictions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-teal-800 leading-relaxed">
            Only physicians and ECMO specialists have access to prediction
            models and SHAP analysis. This ensures clinical decisions are made
            by qualified medical professionals with proper context.
          </p>
        </CardContent>
      </Card>

      {/* Model Performance */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-stone-900">
              AI Model Performance
            </h2>
            <p className="text-sm text-stone-600">
              Current prediction accuracy metrics
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-teal-700 hover:text-teal-800 hover:bg-teal-50"
          >
            View Details
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-white border-stone-200 hover:shadow-md transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl flex items-center justify-center">
                  <Activity
                    className="w-5 h-5 text-emerald-700"
                    strokeWidth={2.5}
                  />
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 border-0 text-xs">
                  Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-stone-600 mb-1">
                  24-Hour Survival Model
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-emerald-700">87.3%</p>
                  <div className="flex items-center gap-1 text-xs text-emerald-700">
                    <TrendingUp className="w-3 h-3" />
                    <span>+2.1%</span>
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-stone-100">
                <p className="text-xs text-stone-500">
                  Validated on 10,000+ cases
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-stone-200 hover:shadow-md transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl flex items-center justify-center">
                  <Brain className="w-5 h-5 text-teal-700" strokeWidth={2.5} />
                </div>
                <Badge className="bg-teal-100 text-teal-800 border-0 text-xs">
                  Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-stone-600 mb-1">
                  7-Day Survival Model
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-teal-700">82.1%</p>
                  <div className="flex items-center gap-1 text-xs text-teal-700">
                    <TrendingUp className="w-3 h-3" />
                    <span>+1.8%</span>
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-stone-100">
                <p className="text-xs text-stone-500">
                  Long-term outcome prediction
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Clinical Tools */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white border-stone-200 hover:shadow-md hover:border-teal-200 transition-all group">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">SHAP Analysis</CardTitle>
            <CardDescription className="text-xs">
              Feature importance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-stone-600 mb-3">
              Understand which clinical parameters drive predictions
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-stone-300 group-hover:bg-teal-50 group-hover:border-teal-300 group-hover:text-teal-700"
            >
              Open Tool
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white border-stone-200 hover:shadow-md hover:border-teal-200 transition-all group">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Trend Analysis</CardTitle>
            <CardDescription className="text-xs">
              Historical patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-stone-600 mb-3">
              Visualize patient trajectory over time
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-stone-300 group-hover:bg-teal-50 group-hover:border-teal-300 group-hover:text-teal-700"
            >
              Open Tool
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white border-stone-200 hover:shadow-md hover:border-teal-200 transition-all group">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Cohort Comparison</CardTitle>
            <CardDescription className="text-xs">
              Population insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-stone-600 mb-3">
              Compare outcomes across patient groups
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-stone-300 group-hover:bg-teal-50 group-hover:border-teal-300 group-hover:text-teal-700"
            >
              Open Tool
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function PhysiciansOnlyPage() {
  return (
    <AuthGuard allowedRoles={["physician", "ecmo_specialist", "admin"]}>
      <PhysiciansOnlyContent />
    </AuthGuard>
  );
}
