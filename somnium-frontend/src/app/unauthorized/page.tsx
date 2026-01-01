"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleGoBack = () => {
    router.back();
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ShieldAlert className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this resource
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">
                Logged in as:
              </p>
              <p className="font-medium">{user.full_name}</p>
              <p className="text-sm text-muted-foreground capitalize">
                Role: {user.role.replace("_", " ")}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Button onClick={handleGoBack} variant="outline" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full"
            >
              Sign Out
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Contact your administrator if you believe this is an error
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
