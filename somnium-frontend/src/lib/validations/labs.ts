import { z } from "zod";

// Lab result schema
export const labResultSchema = z.object({
  id: z.string().uuid(),
  patient_id: z.string().uuid(),
  timestamp: z.string().datetime(),
  test_name: z.string().min(1),
  value: z.number(),
  unit: z.string(),
  reference_range_low: z.number().nullable(),
  reference_range_high: z.number().nullable(),
  is_abnormal: z.boolean(),
  created_at: z.string().datetime(),
});
export type LabResult = z.infer<typeof labResultSchema>;

// Create lab result schema
export const createLabResultSchema = labResultSchema.omit({
  id: true,
  created_at: true,
});
export type CreateLabResult = z.infer<typeof createLabResultSchema>;

// Lab panel schema (group of related tests)
export const labPanelSchema = z.object({
  id: z.string().uuid(),
  patient_id: z.string().uuid(),
  panel_name: z.string(),
  ordered_at: z.string().datetime(),
  completed_at: z.string().datetime().nullable(),
  results: z.array(labResultSchema),
});
export type LabPanel = z.infer<typeof labPanelSchema>;

// Common lab test names for ECMO patients
export const ECMO_LAB_TESTS = [
  "WBC",
  "Hemoglobin",
  "Hematocrit",
  "Platelet Count",
  "PT",
  "PTT",
  "INR",
  "Fibrinogen",
  "D-Dimer",
  "Creatinine",
  "BUN",
  "Sodium",
  "Potassium",
  "Chloride",
  "Bicarbonate",
  "Glucose",
  "Calcium",
  "Magnesium",
  "Phosphate",
  "ALT",
  "AST",
  "Bilirubin",
  "Albumin",
  "Troponin",
  "BNP",
  "CRP",
  "Procalcitonin",
] as const;

// Lab query schema
export const labQuerySchema = z.object({
  patient_id: z.string().uuid(),
  test_name: z.string().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(1000).default(100),
});
export type LabQuery = z.infer<typeof labQuerySchema>;
