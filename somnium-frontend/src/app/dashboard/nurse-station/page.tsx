"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { VitalsEntryForm } from "@/components/patients/vitals-entry-form";
import { PatientRegistryForm } from "@/components/patients/patient-registry-form";
import { Activity, UserPlus } from "lucide-react";

export default function NurseStationPage() {
  const [activeTab, setActiveTab] = useState("vitals-entry");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nurse Station</h1>
        <p className="text-muted-foreground">
          Manage patient vitals and register new patients
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="vitals-entry" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Vitals Entry
          </TabsTrigger>
          <TabsTrigger value="new-patient" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            New Patient
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vitals-entry" className="mt-6">
          <Card className="p-6">
            <VitalsEntryForm />
          </Card>
        </TabsContent>

        <TabsContent value="new-patient" className="mt-6">
          <Card className="p-6">
            <PatientRegistryForm />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
