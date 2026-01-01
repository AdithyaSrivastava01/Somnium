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
  Shield,
  Users,
  Database,
  Settings,
  UserPlus,
  AlertCircle,
} from "lucide-react";

function AdminContent() {
  return (
    <div className="min-h-screen bg-stone-50 p-6 space-y-6">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 -mx-6 -mt-6 px-6 py-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
                Admin Dashboard
              </h1>
              <Badge className="bg-amber-100 text-amber-800 border-amber-200 font-semibold">
                Admin Only
              </Badge>
            </div>
            <p className="text-sm text-stone-600">
              System administration and user management
            </p>
          </div>
          <Button className="bg-teal-700 hover:bg-teal-800 text-white font-medium">
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white border-stone-200 hover:shadow-md transition-all">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 bg-gradient-to-br from-stone-50 to-stone-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-stone-700" strokeWidth={2.5} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-bold text-stone-900 tracking-tight">
              24
            </div>
            <p className="text-sm font-medium text-stone-600">Total Users</p>
            <p className="text-xs text-stone-500">Active system users</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-stone-200 hover:shadow-md transition-all">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-700" strokeWidth={2.5} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-bold text-stone-900 tracking-tight">
              12
            </div>
            <p className="text-sm font-medium text-stone-600">Nurses</p>
            <p className="text-xs text-stone-500">Nursing staff</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-stone-200 hover:shadow-md transition-all">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-teal-700" strokeWidth={2.5} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-bold text-stone-900 tracking-tight">
              8
            </div>
            <p className="text-sm font-medium text-stone-600">Physicians</p>
            <p className="text-xs text-stone-500">Medical doctors</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-stone-200 hover:shadow-md transition-all">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-700" strokeWidth={2.5} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-bold text-stone-900 tracking-tight">
              4
            </div>
            <p className="text-sm font-medium text-stone-600">Specialists</p>
            <p className="text-xs text-stone-500">ECMO specialists</p>
          </CardContent>
        </Card>
      </div>

      {/* Management Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white border-stone-200 hover:shadow-md transition-all">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-teal-700" strokeWidth={2.5} />
              </div>
              <div>
                <CardTitle className="text-lg">User Management</CardTitle>
                <CardDescription className="text-xs">
                  Create, modify, and deactivate user accounts
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-stone-600 leading-relaxed mb-4">
              Admins have full control over user accounts, roles, and
              permissions. This includes managing RBAC scopes and department
              assignments.
            </p>
            <Button
              variant="outline"
              className="w-full border-stone-300 hover:bg-stone-50"
            >
              Manage Users
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white border-stone-200 hover:shadow-md transition-all">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-cyan-700" strokeWidth={2.5} />
              </div>
              <div>
                <CardTitle className="text-lg">System Configuration</CardTitle>
                <CardDescription className="text-xs">
                  Configure system-wide settings and parameters
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-stone-600 leading-relaxed mb-4">
              Manage ML model parameters, alert thresholds, data retention
              policies, and integration settings.
            </p>
            <Button
              variant="outline"
              className="w-full border-stone-300 hover:bg-stone-50"
            >
              System Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Alert Notice */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700" strokeWidth={2.5} />
            <CardTitle className="text-amber-900 text-base">
              Admin Privileges
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-amber-800 leading-relaxed">
            This page is only accessible to users with the{" "}
            <code className="bg-amber-100 px-2 py-0.5 rounded font-semibold">
              admin
            </code>{" "}
            role. All actions are logged for audit purposes and compliance
            monitoring.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AuthGuard allowedRoles={["admin"]}>
      <AdminContent />
    </AuthGuard>
  );
}
