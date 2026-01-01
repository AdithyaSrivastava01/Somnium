"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function DashboardNotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-stone-900 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-stone-700 mb-4">
            Page Not Found
          </h2>
          <p className="text-stone-600">
            The page you're looking for doesn't exist in the dashboard.
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
          <Link href="/dashboard">
            <Button className="gap-2 bg-teal-700 hover:bg-teal-800">
              <Home className="w-4 h-4" />
              Dashboard Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
