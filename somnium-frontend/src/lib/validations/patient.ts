import { z } from "zod";
import { vitalsRecordSchema } from "./vitals";

// ECMO mode enum
export const ecmoModeSchema = z.enum(["VV", "VA", "VAV"]);
export type ECMOMode = z.infer<typeof ecmoModeSchema>;

// Patient status enum
export const patientStatusSchema = z.enum([
  "active",
  "stable",
  "critical",
  "recovered",
  "deceased",
]);
export type PatientStatus = z.infer<typeof patientStatusSchema>;

// Gender enum
export const genderSchema = z.enum([
  "male",
  "female",
  "other",
  "prefer_not_to_say",
]);
export type Gender = z.infer<typeof genderSchema>;

// Patient schema
export const patientSchema = z.object({
  id: z.string().uuid(),
  mrn: z.string().min(1).max(50),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  date_of_birth: z.string().datetime(),
  gender: genderSchema,
  hospital_id: z.string().uuid(),
  diagnosis: z.string().optional().nullable(),
  admission_date: z.string().datetime(),
  discharge_date: z.string().datetime().optional().nullable(),
  ecmo_start_date: z.string().datetime().optional().nullable(),
  ecmo_mode: ecmoModeSchema.optional().nullable(),
  flow_rate: z.number().min(0).optional().nullable(),
  sweep_gas: z.number().min(0).optional().nullable(),
  fio2: z.number().min(0).max(1).optional().nullable(),
  status: patientStatusSchema,
  is_active: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type Patient = z.infer<typeof patientSchema>;

// Patient with latest vitals (for dashboard)
export const patientWithLatestVitalsSchema = patientSchema.extend({
  latest_vitals: vitalsRecordSchema.optional().nullable(),
  vitals_count: z.number().int().min(0),
});
export type PatientWithLatestVitals = z.infer<
  typeof patientWithLatestVitalsSchema
>;

// Create patient schema
export const patientCreateSchema = z.object({
  mrn: z.string().min(1).max(50),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  date_of_birth: z.string().datetime(),
  gender: genderSchema,
  hospital_id: z.string().uuid(),
  diagnosis: z.string().optional(),
  admission_date: z.string().datetime(),
  ecmo_start_date: z.string().datetime().optional(),
  ecmo_mode: ecmoModeSchema.optional(),
  flow_rate: z.number().min(0).optional(),
  sweep_gas: z.number().min(0).optional(),
  fio2: z.number().min(0).max(1).optional(),
  status: patientStatusSchema.default("active"),
});
export type PatientCreate = z.infer<typeof patientCreateSchema>;

// Update patient schema
export const patientUpdateSchema = patientCreateSchema
  .omit({ hospital_id: true, mrn: true })
  .partial()
  .extend({
    discharge_date: z.string().datetime().optional(),
    is_active: z.boolean().optional(),
  });
export type PatientUpdate = z.infer<typeof patientUpdateSchema>;

// Patient list item (simplified for lists)
export const patientListItemSchema = patientSchema.pick({
  id: true,
  mrn: true,
  first_name: true,
  last_name: true,
  status: true,
  ecmo_start_date: true,
  is_active: true,
});
export type PatientListItem = z.infer<typeof patientListItemSchema>;

// Vitals entry check response
export const vitalsEntryCheckSchema = z.object({
  can_enter: z.boolean(),
  last_entry_time: z.string().datetime().optional().nullable(),
  hours_since_last_entry: z.number().optional().nullable(),
  next_allowed_time: z.string().datetime().optional().nullable(),
  message: z.string(),
});
export type VitalsEntryCheck = z.infer<typeof vitalsEntryCheckSchema>;

// Vital trend data point
export const vitalTrendSchema = z.object({
  timestamp: z.string().datetime(),
  value: z.number(),
});
export type VitalTrend = z.infer<typeof vitalTrendSchema>;

// Vitals trends response (for graphs)
export const vitalsTrendsSchema = z.object({
  patient_id: z.string().uuid(),
  time_range_hours: z.number().optional().nullable(),
  pao2: z.array(vitalTrendSchema),
  paco2: z.array(vitalTrendSchema),
  lactate: z.array(vitalTrendSchema),
  ph: z.array(vitalTrendSchema),
  hco3: z.array(vitalTrendSchema),
});
export type VitalsTrends = z.infer<typeof vitalsTrendsSchema>;
