import { z } from "zod";

// Vital signs schema
export const vitalSignsSchema = z.object({
  id: z.string().uuid(),
  patient_id: z.string().uuid(),
  timestamp: z.string().datetime(),
  heart_rate: z.number().min(0).max(300).nullable(),
  blood_pressure_systolic: z.number().min(0).max(300).nullable(),
  blood_pressure_diastolic: z.number().min(0).max(300).nullable(),
  respiratory_rate: z.number().min(0).max(100).nullable(),
  temperature: z.number().min(20).max(45).nullable(), // Celsius
  spo2: z.number().min(0).max(100).nullable(),
  cvp: z.number().nullable(), // Central venous pressure
  pao2: z.number().nullable(), // Arterial oxygen partial pressure
  paco2: z.number().nullable(), // Arterial CO2 partial pressure
  ph: z.number().min(6).max(8).nullable(),
  lactate: z.number().nullable(),
  created_at: z.string().datetime(),
});
export type VitalSigns = z.infer<typeof vitalSignsSchema>;

// Create vital signs schema
export const createVitalSignsSchema = vitalSignsSchema.omit({
  id: true,
  created_at: true,
});
export type CreateVitalSigns = z.infer<typeof createVitalSignsSchema>;

// Vital signs query schema
export const vitalSignsQuerySchema = z.object({
  patient_id: z.string().uuid(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(1000).default(100),
});
export type VitalSignsQuery = z.infer<typeof vitalSignsQuerySchema>;

// Vital signs trend data (for charts)
export const vitalTrendSchema = z.object({
  timestamp: z.string().datetime(),
  value: z.number(),
  metric: z.string(),
});
export type VitalTrend = z.infer<typeof vitalTrendSchema>;
