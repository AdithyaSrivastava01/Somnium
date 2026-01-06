import { z } from "zod";

// Vitals record schema (response from API)
export const vitalsRecordSchema = z.object({
  id: z.string().uuid(),
  patient_id: z.string().uuid(),
  recorded_by: z.string().uuid().nullable().optional(),
  recorded_at: z.string().datetime(),
  // Basic vitals
  heart_rate: z.number().int().min(0).max(300).nullable().optional(),
  blood_pressure_systolic: z.number().int().min(0).max(300).nullable().optional(),
  blood_pressure_diastolic: z.number().int().min(0).max(300).nullable().optional(),
  respiratory_rate: z.number().int().min(0).max(100).nullable().optional(),
  temperature: z.number().min(20).max(45).nullable().optional(),
  spo2: z.number().int().min(0).max(100).nullable().optional(),
  // Advanced ECMO vitals
  cvp: z.number().nullable().optional(),
  pao2: z.number().nullable().optional(),
  paco2: z.number().nullable().optional(),
  ph: z.number().min(6).max(8).nullable().optional(),
  lactate: z.number().nullable().optional(),
  hco3: z.number().nullable().optional(),
  // Notes
  notes: z.string().nullable().optional(),
  created_at: z.string().datetime(),
});
export type VitalsRecord = z.infer<typeof vitalsRecordSchema>;

// Create vitals schema (for data entry)
export const vitalsCreateSchema = z.object({
  patient_id: z.string().uuid(),
  recorded_at: z.string().datetime(),
  // Basic vitals
  heart_rate: z.number().int().min(0).max(300).optional(),
  blood_pressure_systolic: z.number().int().min(0).max(300).optional(),
  blood_pressure_diastolic: z.number().int().min(0).max(300).optional(),
  respiratory_rate: z.number().int().min(0).max(100).optional(),
  temperature: z.number().min(20).max(45).optional(),
  spo2: z.number().int().min(0).max(100).optional(),
  // Advanced ECMO vitals
  cvp: z.number().optional(),
  pao2: z.number().optional(),
  paco2: z.number().optional(),
  ph: z.number().min(6).max(8).optional(),
  lactate: z.number().optional(),
  hco3: z.number().optional(),
  // Notes
  notes: z.string().optional(),
});
export type VitalsCreate = z.infer<typeof vitalsCreateSchema>;

// Legacy schemas for backward compatibility
export const vitalSignsSchema = vitalsRecordSchema;
export type VitalSigns = VitalsRecord;
export const createVitalSignsSchema = vitalsCreateSchema;
export type CreateVitalSigns = VitalsCreate;

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
