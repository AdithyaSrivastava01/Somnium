"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";

import {
  patientCreateSchema,
  type PatientCreate,
  type Gender,
  type ECMOMode,
  type PatientStatus,
} from "@/lib/validations/patient";
import { patientsApi } from "@/lib/api/patients";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

export function PatientRegistryForm() {
  const { user } = useAuthStore();
  const [dateOfBirth, setDateOfBirth] = useState<Date>();
  const [admissionDate, setAdmissionDate] = useState<Date>(new Date());
  const [ecmoStartDate, setEcmoStartDate] = useState<Date>();

  const form = useForm<PatientCreate>({
    resolver: zodResolver(patientCreateSchema),
    defaultValues: {
      hospital_id: user?.hospital_id || "",
      status: "active",
      admission_date: new Date().toISOString(),
    },
  });

  const createPatientMutation = useMutation({
    mutationFn: (data: PatientCreate) => patientsApi.createPatient(data),
    onSuccess: () => {
      toast.success("Patient registered successfully");
      form.reset();
      setDateOfBirth(undefined);
      setAdmissionDate(new Date());
      setEcmoStartDate(undefined);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to register patient");
    },
  });

  const onSubmit = (data: PatientCreate) => {
    if (!user?.hospital_id) {
      toast.error("Hospital information not found");
      return;
    }
    createPatientMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">New Patient Registration</h2>
        <p className="text-sm text-muted-foreground">
          Register a new patient to the hospital system
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Demographics Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Patient Demographics</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mrn">Medical Record Number (MRN) *</Label>
              <Input
                id="mrn"
                {...form.register("mrn")}
                placeholder="e.g., MRN-12345"
                required
              />
              {form.formState.errors.mrn && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.mrn.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select
                value={form.watch("gender")}
                onValueChange={(value: Gender) =>
                  form.setValue("gender", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer_not_to_say">
                    Prefer not to say
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                {...form.register("first_name")}
                placeholder="John"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                {...form.register("last_name")}
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Date of Birth *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateOfBirth ? (
                    format(dateOfBirth, "PPP")
                  ) : (
                    <span className="text-muted-foreground">Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateOfBirth}
                  onSelect={(date) => {
                    setDateOfBirth(date);
                    if (date) {
                      form.setValue("date_of_birth", date.toISOString());
                    }
                  }}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Clinical Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Clinical Information</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Admission Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(admissionDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={admissionDate}
                    onSelect={(date) => {
                      if (date) {
                        setAdmissionDate(date);
                        form.setValue("admission_date", date.toISOString());
                      }
                    }}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Patient Status *</Label>
              <Select
                value={form.watch("status") || "active"}
                onValueChange={(value: PatientStatus) =>
                  form.setValue("status", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="stable">Stable</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="recovered">Recovered</SelectItem>
                  <SelectItem value="deceased">Deceased</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Textarea
              id="diagnosis"
              {...form.register("diagnosis")}
              placeholder="Primary diagnosis and relevant medical history..."
              rows={3}
            />
          </div>
        </div>

        {/* ECMO Configuration Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">ECMO Configuration</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ECMO Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {ecmoStartDate ? (
                      format(ecmoStartDate, "PPP")
                    ) : (
                      <span className="text-muted-foreground">
                        Optional - Select date
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={ecmoStartDate}
                    onSelect={(date) => {
                      setEcmoStartDate(date);
                      if (date) {
                        form.setValue("ecmo_start_date", date.toISOString());
                      }
                    }}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ecmo_mode">ECMO Mode</Label>
              <Select
                value={form.watch("ecmo_mode") || undefined}
                onValueChange={(value: ECMOMode) =>
                  form.setValue("ecmo_mode", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select mode (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VV">VV - Veno-Venous</SelectItem>
                  <SelectItem value="VA">VA - Veno-Arterial</SelectItem>
                  <SelectItem value="VAV">
                    VAV - Veno-Arterial-Venous
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="flow_rate">Flow Rate (L/min)</Label>
              <Input
                id="flow_rate"
                type="number"
                step="0.1"
                {...form.register("flow_rate", { valueAsNumber: true })}
                placeholder="e.g., 4.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sweep_gas">Sweep Gas (L/min)</Label>
              <Input
                id="sweep_gas"
                type="number"
                step="0.1"
                {...form.register("sweep_gas", { valueAsNumber: true })}
                placeholder="e.g., 3.0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fio2">FiO2 (0-1)</Label>
              <Input
                id="fio2"
                type="number"
                step="0.01"
                {...form.register("fio2", { valueAsNumber: true })}
                placeholder="e.g., 0.60"
              />
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset();
              setDateOfBirth(undefined);
              setAdmissionDate(new Date());
              setEcmoStartDate(undefined);
            }}
          >
            Clear Form
          </Button>
          <Button type="submit" disabled={createPatientMutation.isPending}>
            {createPatientMutation.isPending
              ? "Registering..."
              : "Register Patient"}
          </Button>
        </div>
      </form>
    </div>
  );
}
