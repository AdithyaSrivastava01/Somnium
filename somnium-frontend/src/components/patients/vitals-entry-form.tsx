"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import {
  vitalsCreateSchema,
  type VitalsCreate,
} from "@/lib/validations/vitals";
import { patientsApi } from "@/lib/api/patients";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Helper function to convert Date to ISO string with local timezone
function toLocalISOString(date: Date): string {
  const tzOffset = -date.getTimezoneOffset();
  const tzSign = tzOffset >= 0 ? "+" : "-";
  const tzHours = String(Math.floor(Math.abs(tzOffset) / 60)).padStart(2, "0");
  const tzMinutes = String(Math.abs(tzOffset) % 60).padStart(2, "0");

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  const second = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hour}:${minute}:${second}${tzSign}${tzHours}:${tzMinutes}`;
}

export function VitalsEntryForm() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [recordedDate, setRecordedDate] = useState<Date>(new Date());
  const [recordedTime, setRecordedTime] = useState<string>(
    format(new Date(), "HH:mm"),
  );

  // Fetch active patients for the hospital
  const { data: patients = [], isLoading: loadingPatients } = useQuery({
    queryKey: ["activePatients", user?.hospital_id],
    queryFn: () =>
      user?.hospital_id
        ? patientsApi.getActivePatients(user.hospital_id)
        : Promise.resolve([]),
    enabled: !!user?.hospital_id,
  });

  // Check if vitals can be entered for selected patient
  const { data: entryCheck, refetch: refetchEntryCheck } = useQuery({
    queryKey: ["vitalsEntryCheck", selectedPatientId],
    queryFn: () => patientsApi.checkCanEnterVitals(selectedPatientId),
    enabled: !!selectedPatientId,
  });

  const form = useForm<VitalsCreate>({
    resolver: zodResolver(vitalsCreateSchema),
    defaultValues: {
      patient_id: "",
      recorded_at: new Date().toISOString(),
    },
  });

  // Update form when patient is selected
  useEffect(() => {
    if (selectedPatientId) {
      form.setValue("patient_id", selectedPatientId);
    }
  }, [selectedPatientId, form]);

  // Update recorded_at when date/time changes
  useEffect(() => {
    const [hours, minutes] = recordedTime.split(":").map(Number);
    const datetime = new Date(recordedDate);
    datetime.setHours(hours, minutes, 0, 0);
    form.setValue("recorded_at", toLocalISOString(datetime));
  }, [recordedDate, recordedTime, form]);

  const createVitalsMutation = useMutation({
    mutationFn: (data: VitalsCreate) => patientsApi.createVitals(data),
    onSuccess: () => {
      toast.success("Vitals recorded successfully");
      setShowSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      refetchEntryCheck();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to record vitals");
    },
  });

  const handleReset = () => {
    form.reset();
    setSelectedPatientId("");
    setRecordedDate(new Date());
    setRecordedTime(format(new Date(), "HH:mm"));
    setShowSuccess(false);
  };

  const onSubmit = (data: VitalsCreate) => {
    if (!entryCheck?.can_enter) {
      toast.error(entryCheck?.message || "Cannot enter vitals at this time");
      return;
    }

    // Validate that the recorded time is not in the future
    const recordedDateTime = new Date(`${data.recorded_at}`);
    const now = new Date();

    if (recordedDateTime > now) {
      toast.error("Cannot record vitals for a future date/time");
      return;
    }

    createVitalsMutation.mutate(data);
  };

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Patient Vitals Entry</h2>
        <p className="text-sm text-muted-foreground">
          Enter patient vital signs (can only be recorded every 12 hours)
        </p>
      </div>

      {showSuccess && (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-green-800">
              Vitals recorded successfully!
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleReset}
                className="border-green-600 text-green-700 hover:bg-green-100"
              >
                Record More Vitals
              </Button>
              <Button
                size="sm"
                onClick={() => router.push("/dashboard")}
                className="bg-green-600 hover:bg-green-700"
              >
                Go to Dashboard
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Patient Selection */}
      <div className="space-y-2">
        <Label htmlFor="patient">Select Patient *</Label>
        <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a patient..." />
          </SelectTrigger>
          <SelectContent>
            {loadingPatients ? (
              <SelectItem value="loading" disabled>
                Loading patients...
              </SelectItem>
            ) : patients.length === 0 ? (
              <SelectItem value="none" disabled>
                No active patients found
              </SelectItem>
            ) : (
              patients.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  {patient.first_name} {patient.last_name} (MRN: {patient.mrn})
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* 12-Hour Constraint Warning/Info */}
      {selectedPatientId && entryCheck && (
        <Alert
          variant={entryCheck.can_enter ? "default" : "destructive"}
          className="border-2"
        >
          {entryCheck.can_enter ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{entryCheck.message}</AlertDescription>
        </Alert>
      )}

      {/* Patient Info Card */}
      {selectedPatient && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Patient:</span>{" "}
                {selectedPatient.first_name} {selectedPatient.last_name}
              </div>
              <div>
                <span className="font-medium">MRN:</span> {selectedPatient.mrn}
              </div>
              <div>
                <span className="font-medium">Status:</span>{" "}
                <span className="capitalize">{selectedPatient.status}</span>
              </div>
              <div>
                <span className="font-medium">ECMO Mode:</span>{" "}
                {selectedPatient.ecmo_mode || "N/A"}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vitals Entry Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Recording Date/Time */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Recording Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(recordedDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={recordedDate}
                  onSelect={(date) => date && setRecordedDate(date)}
                  disabled={(date) => {
                    // Disable future dates
                    const today = new Date();
                    today.setHours(23, 59, 59, 999);
                    return date > today;
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Recording Time *</Label>
            <Input
              id="time"
              type="time"
              value={recordedTime}
              onChange={(e) => {
                const newTime = e.target.value;
                setRecordedTime(newTime);

                // Check if the new time would create a future timestamp
                const [hours, minutes] = newTime.split(":").map(Number);
                const datetime = new Date(recordedDate);
                datetime.setHours(hours, minutes, 0, 0);

                if (datetime > new Date()) {
                  toast.error(
                    "Recording time cannot be in the future. Please adjust the time.",
                  );
                }
              }}
              required
            />
          </div>
        </div>

        {/* Basic Vitals */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Basic Vitals</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="heart_rate">Heart Rate (bpm)</Label>
              <Input
                id="heart_rate"
                type="number"
                {...form.register("heart_rate", { valueAsNumber: true })}
                placeholder="0-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bp_systolic">BP Systolic (mmHg)</Label>
              <Input
                id="bp_systolic"
                type="number"
                {...form.register("blood_pressure_systolic", {
                  valueAsNumber: true,
                })}
                placeholder="0-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bp_diastolic">BP Diastolic (mmHg)</Label>
              <Input
                id="bp_diastolic"
                type="number"
                {...form.register("blood_pressure_diastolic", {
                  valueAsNumber: true,
                })}
                placeholder="0-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="respiratory_rate">Respiratory Rate (/min)</Label>
              <Input
                id="respiratory_rate"
                type="number"
                {...form.register("respiratory_rate", { valueAsNumber: true })}
                placeholder="0-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature (°C)</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                {...form.register("temperature", { valueAsNumber: true })}
                placeholder="20-45"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="spo2">SpO2 (%)</Label>
              <Input
                id="spo2"
                type="number"
                {...form.register("spo2", { valueAsNumber: true })}
                placeholder="0-100"
              />
            </div>
          </div>
        </div>

        {/* Advanced ECMO Vitals */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">ECMO-Specific Vitals</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cvp">CVP (mmHg)</Label>
              <Input
                id="cvp"
                type="number"
                step="0.1"
                {...form.register("cvp", { valueAsNumber: true })}
                placeholder="Central Venous Pressure"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pao2">PaO2 (mmHg)</Label>
              <Input
                id="pao2"
                type="number"
                step="0.1"
                {...form.register("pao2", { valueAsNumber: true })}
                placeholder="Arterial O2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paco2">PaCO2 (mmHg)</Label>
              <Input
                id="paco2"
                type="number"
                step="0.1"
                {...form.register("paco2", { valueAsNumber: true })}
                placeholder="Arterial CO2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ph">pH</Label>
              <Input
                id="ph"
                type="number"
                step="0.01"
                {...form.register("ph", { valueAsNumber: true })}
                placeholder="6.0-8.0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lactate">Lactate (mmol/L)</Label>
              <Input
                id="lactate"
                type="number"
                step="0.1"
                {...form.register("lactate", { valueAsNumber: true })}
                placeholder="Blood Lactate"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hco3">HCO3 (mmol/L)</Label>
              <Input
                id="hco3"
                type="number"
                step="0.1"
                {...form.register("hco3", { valueAsNumber: true })}
                placeholder="Bicarbonate"
              />
            </div>
          </div>
        </div>

        {/* Clinical Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Clinical Notes</Label>
          <Textarea
            id="notes"
            {...form.register("notes")}
            placeholder="Any observations or notes about the patient's condition..."
            rows={4}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={handleReset}>
            Clear
          </Button>
          <Button
            type="submit"
            disabled={
              !selectedPatientId ||
              !entryCheck?.can_enter ||
              createVitalsMutation.isPending
            }
          >
            {createVitalsMutation.isPending ? "Submitting..." : "Record Vitals"}
          </Button>
        </div>
      </form>
    </div>
  );
}
