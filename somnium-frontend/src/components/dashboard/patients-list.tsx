"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Eye, Activity, Heart, Wind, Droplet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { patientsApi } from "@/lib/api/patients";
import { useAuthStore } from "@/stores/auth-store";

export function PatientsList() {
  const { user } = useAuthStore();

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["patientsWithVitals", user?.hospital_id],
    queryFn: () =>
      user?.hospital_id
        ? patientsApi.getPatientsWithLatestVitals(user.hospital_id)
        : Promise.resolve([]),
    enabled: !!user?.hospital_id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const statusColors: Record<string, string> = {
    active: "bg-blue-500",
    stable: "bg-green-500",
    critical: "bg-red-500",
    recovered: "bg-gray-500",
    deceased: "bg-black",
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Activity className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No Active Patients</p>
          <p className="text-sm text-muted-foreground">
            Register new patients in the Nurse Station
          </p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/nurse-station">Go to Nurse Station</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {patients.map((patient) => {
        const latestVitals = patient.latest_vitals;

        return (
          <Card key={patient.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-3">
                    {patient.first_name} {patient.last_name}
                    <Badge className={statusColors[patient.status]}>
                      {patient.status}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    MRN: {patient.mrn} • ECMO: {patient.ecmo_mode || "N/A"}
                  </p>
                </div>
                <Button asChild size="sm">
                  <Link href={`/dashboard/patients/${patient.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Monitoring
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {latestVitals ? (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {/* Heart Rate */}
                  {latestVitals.heart_rate && (
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">HR</p>
                        <p className="font-medium">
                          {latestVitals.heart_rate} bpm
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Blood Pressure */}
                  {latestVitals.blood_pressure_systolic &&
                    latestVitals.blood_pressure_diastolic && (
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">BP</p>
                          <p className="font-medium">
                            {latestVitals.blood_pressure_systolic}/
                            {latestVitals.blood_pressure_diastolic}
                          </p>
                        </div>
                      </div>
                    )}

                  {/* SpO2 */}
                  {latestVitals.spo2 && (
                    <div className="flex items-center gap-2">
                      <Wind className="h-4 w-4 text-cyan-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">SpO2</p>
                        <p className="font-medium">{latestVitals.spo2}%</p>
                      </div>
                    </div>
                  )}

                  {/* PaO2 */}
                  {latestVitals.pao2 && (
                    <div className="flex items-center gap-2">
                      <Droplet className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">PaO2</p>
                        <p className="font-medium">
                          {latestVitals.pao2.toFixed(1)} mmHg
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Lactate */}
                  {latestVitals.lactate && (
                    <div className="flex items-center gap-2">
                      <Droplet className="h-4 w-4 text-orange-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Lactate</p>
                        <p className="font-medium">
                          {latestVitals.lactate.toFixed(1)} mmol/L
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  No vitals recorded yet
                  <p className="text-xs mt-1">
                    Total vitals entries: {patient.vitals_count}
                  </p>
                </div>
              )}

              {latestVitals && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground">
                    Last recorded:{" "}
                    {new Date(latestVitals.recorded_at).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total vitals entries: {patient.vitals_count}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
