import { z } from "zod";

// ECM O configuration schema
export const ecmoConfigSchema = z.object({
  mode: z.enum(["VV", "VA", "VAV"]),
  flow_rate: z.number().min(0),
  sweep_gas: z.number().min(0),
  fio2: z.number().min(0).max(100),
});
export type EcmoConfig = z.infer<typeof ecmoConfigSchema>;

// Patient status enum
export const patientStatusSchema = z.enum([
  "active",
  "stable",
  "critical",
  "recovered",
  "deceased",
]);
export type PatientStatus = z.infer<typeof patientStatusSchema>;

// Patient schema
export const patientSchema = z.object({
  id: z.string().uuid(),
  mrn: z.string().min(1),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  date_of_birth: z.string().datetime(),
  gender: z.enum(["M", "F", "O"]),
  admission_date: z.string().datetime(),
  diagnosis: z.string(),
  ecmo_start_date: z.string().datetime(),
  ecmo_config: ecmoConfigSchema,
  status: patientStatusSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type Patient = z.infer<typeof patientSchema>;

// Patient list item (simplified for lists)
export const patientListItemSchema = patientSchema.pick({
  id: true,
  mrn: true,
  first_name: true,
  last_name: true,
  status: true,
  ecmo_start_date: true,
});
export type PatientListItem = z.infer<typeof patientListItemSchema>;

// Create patient schema
export const createPatientSchema = patientSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export type CreatePatient = z.infer<typeof createPatientSchema>;

// Update patient schema
export const updatePatientSchema = createPatientSchema.partial();
export type UpdatePatient = z.infer<typeof updatePatientSchema>;

// Patient search/filter schema
export const patientFilterSchema = z.object({
  status: patientStatusSchema.optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});
export type PatientFilter = z.infer<typeof patientFilterSchema>;
