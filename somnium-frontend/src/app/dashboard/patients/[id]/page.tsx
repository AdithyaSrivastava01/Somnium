"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Activity,
  Brain,
  FileText,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";

import { patientsApi } from "@/lib/api/patients";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { VitalsTrendsChart } from "@/components/patients/vitals-trends-chart";
import { AIInsightsTab } from "@/components/patients/ai-insights-tab";

type TimeFilter = 24 | 48 | 72 | null;

export default function PatientMonitoringPage() {
  const params = useParams();
  const patientId = params.id as string;
  const { user } = useAuthStore();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>(24);
  const [activeTab, setActiveTab] = useState("monitoring");

  // Fetch patient details
  const { data: patient, isLoading: loadingPatient } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => patientsApi.getPatient(patientId),
    enabled: !!patientId,
  });

  // Fetch vitals trends
  const { data: trends, isLoading: loadingTrends } = useQuery({
    queryKey: ["vitalsTrends", patientId, timeFilter],
    queryFn: () =>
      patientsApi.getVitalsTrends(patientId, timeFilter || undefined),
    enabled: !!patientId,
  });

  // Fetch vitals history
  const { data: vitalsHistory = [] } = useQuery({
    queryKey: ["vitalsHistory", patientId, timeFilter],
    queryFn: () =>
      patientsApi.getVitalsHistory(patientId, {
        hours: timeFilter || undefined,
        limit: 100,
      }),
    enabled: !!patientId,
  });

  const isPhysician = user?.role === "physician" || user?.role === "admin";

  if (loadingPatient) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-lg text-muted-foreground">Patient not found</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    active: "bg-blue-500",
    stable: "bg-green-500",
    critical: "bg-red-500",
    recovered: "bg-gray-500",
    deceased: "bg-black",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                {patient.first_name} {patient.last_name}
              </h1>
              <Badge className={statusColors[patient.status]}>
                {patient.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">MRN: {patient.mrn}</p>
          </div>
        </div>
      </div>

      {/* Patient Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Gender</p>
              <p className="font-medium capitalize">{patient.gender}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Admission Date</p>
              <p className="font-medium">
                {new Date(patient.admission_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">ECMO Mode</p>
              <p className="font-medium">{patient.ecmo_mode || "N/A"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Flow Rate</p>
              <p className="font-medium">
                {patient.flow_rate ? `${patient.flow_rate} L/min` : "N/A"}
              </p>
            </div>
            {patient.diagnosis && (
              <div className="col-span-2 md:col-span-4">
                <p className="text-muted-foreground">Diagnosis</p>
                <p className="font-medium">{patient.diagnosis}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Monitoring and AI Insights */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Vital Monitoring
          </TabsTrigger>
          {isPhysician && (
            <TabsTrigger
              value="ai-insights"
              className="flex items-center gap-2"
            >
              <Brain className="h-4 w-4" />
              AI Insights
            </TabsTrigger>
          )}
        </TabsList>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-6">
          {/* Time Filter Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Time Range:</span>
            <div className="flex gap-2">
              <Button
                variant={timeFilter === 24 ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeFilter(24)}
              >
                24 Hours
              </Button>
              <Button
                variant={timeFilter === 48 ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeFilter(48)}
              >
                48 Hours
              </Button>
              <Button
                variant={timeFilter === 72 ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeFilter(72)}
              >
                72 Hours
              </Button>
              <Button
                variant={timeFilter === null ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeFilter(null)}
              >
                All Time
              </Button>
            </div>
          </div>

          {/* Vitals Trends Charts */}
          {loadingTrends ? (
            <div className="grid gap-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : trends ? (
            <VitalsTrendsChart trends={trends} timeFilter={timeFilter} />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">
                  No vitals data available for this time range
                </p>
              </CardContent>
            </Card>
          )}

          {/* Vitals History Table */}
          <Card>
            <CardHeader>
              <CardTitle>Vitals History</CardTitle>
            </CardHeader>
            <CardContent>
              {vitalsHistory.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No vitals recorded yet
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Date/Time</th>
                        <th className="text-left p-2">HR</th>
                        <th className="text-left p-2">BP</th>
                        <th className="text-left p-2">SpO2</th>
                        <th className="text-left p-2">PaO2</th>
                        <th className="text-left p-2">PaCO2</th>
                        <th className="text-left p-2">pH</th>
                        <th className="text-left p-2">Lactate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vitalsHistory.map((vital) => (
                        <tr
                          key={vital.id}
                          className="border-b hover:bg-muted/50"
                        >
                          <td className="p-2">
                            {new Date(vital.recorded_at).toLocaleString()}
                          </td>
                          <td className="p-2">{vital.heart_rate || "-"}</td>
                          <td className="p-2">
                            {vital.blood_pressure_systolic &&
                            vital.blood_pressure_diastolic
                              ? `${vital.blood_pressure_systolic}/${vital.blood_pressure_diastolic}`
                              : "-"}
                          </td>
                          <td className="p-2">{vital.spo2 || "-"}</td>
                          <td className="p-2">
                            {vital.pao2 ? vital.pao2.toFixed(1) : "-"}
                          </td>
                          <td className="p-2">
                            {vital.paco2 ? vital.paco2.toFixed(1) : "-"}
                          </td>
                          <td className="p-2">
                            {vital.ph ? vital.ph.toFixed(2) : "-"}
                          </td>
                          <td className="p-2">
                            {vital.lactate ? vital.lactate.toFixed(1) : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Insights Tab (Physician Only) */}
        {isPhysician && (
          <TabsContent value="ai-insights">
            <AIInsightsTab patientId={patientId} patient={patient} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
