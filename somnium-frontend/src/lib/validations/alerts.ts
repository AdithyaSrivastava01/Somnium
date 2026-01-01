import { z } from "zod";

// Alert severity enum
export const alertSeveritySchema = z.enum(["critical", "warning", "info"]);
export type AlertSeverity = z.infer<typeof alertSeveritySchema>;

// Alert category enum
export const alertCategorySchema = z.enum([
  "vitals",
  "labs",
  "equipment",
  "medication",
  "clinical",
]);
export type AlertCategory = z.infer<typeof alertCategorySchema>;

// Alert status enum
export const alertStatusSchema = z.enum(["active", "acknowledged", "resolved"]);
export type AlertStatus = z.infer<typeof alertStatusSchema>;

// Alert schema
export const alertSchema = z.object({
  id: z.string().uuid(),
  patient_id: z.string().uuid(),
  severity: alertSeveritySchema,
  category: alertCategorySchema,
  title: z.string().min(1),
  message: z.string(),
  status: alertStatusSchema,
  triggered_at: z.string().datetime(),
  acknowledged_at: z.string().datetime().nullable(),
  acknowledged_by: z.string().uuid().nullable(),
  resolved_at: z.string().datetime().nullable(),
  resolved_by: z.string().uuid().nullable(),
  metadata: z.record(z.any()).optional(),
  created_at: z.string().datetime(),
});
export type Alert = z.infer<typeof alertSchema>;

// Create alert schema
export const createAlertSchema = alertSchema.omit({
  id: true,
  status: true,
  acknowledged_at: true,
  acknowledged_by: true,
  resolved_at: true,
  resolved_by: true,
  created_at: true,
});
export type CreateAlert = z.infer<typeof createAlertSchema>;

// Acknowledge alert schema
export const acknowledgeAlertSchema = z.object({
  alert_id: z.string().uuid(),
  user_id: z.string().uuid(),
});
export type AcknowledgeAlert = z.infer<typeof acknowledgeAlertSchema>;

// Resolve alert schema
export const resolveAlertSchema = z.object({
  alert_id: z.string().uuid(),
  user_id: z.string().uuid(),
  resolution_notes: z.string().optional(),
});
export type ResolveAlert = z.infer<typeof resolveAlertSchema>;

// Alert filter schema
export const alertFilterSchema = z.object({
  patient_id: z.string().uuid().optional(),
  severity: alertSeveritySchema.optional(),
  category: alertCategorySchema.optional(),
  status: alertStatusSchema.optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});
export type AlertFilter = z.infer<typeof alertFilterSchema>;
