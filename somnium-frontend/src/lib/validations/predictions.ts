import { z } from "zod";

// Prediction model type enum
export const modelTypeSchema = z.enum([
  "survival_24h",
  "survival_7d",
  "survival_30d",
  "complication_risk",
  "weaning_readiness",
]);
export type ModelType = z.infer<typeof modelTypeSchema>;

// Risk level enum
export const riskLevelSchema = z.enum(["low", "medium", "high", "critical"]);
export type RiskLevel = z.infer<typeof riskLevelSchema>;

// Feature importance schema
export const featureImportanceSchema = z.object({
  feature_name: z.string(),
  importance: z.number().min(0).max(1),
  value: z.number().nullable(),
});
export type FeatureImportance = z.infer<typeof featureImportanceSchema>;

// Prediction schema
export const predictionSchema = z.object({
  id: z.string().uuid(),
  patient_id: z.string().uuid(),
  model_type: modelTypeSchema,
  model_version: z.string(),
  prediction_value: z.number().min(0).max(1), // Probability
  risk_level: riskLevelSchema,
  confidence: z.number().min(0).max(1),
  feature_importance: z.array(featureImportanceSchema),
  explanation: z.string().optional(),
  predicted_at: z.string().datetime(),
  created_at: z.string().datetime(),
});
export type Prediction = z.infer<typeof predictionSchema>;

// Prediction request schema
export const predictionRequestSchema = z.object({
  patient_id: z.string().uuid(),
  model_type: modelTypeSchema,
  force_refresh: z.boolean().default(false),
});
export type PredictionRequest = z.infer<typeof predictionRequestSchema>;

// Prediction history schema
export const predictionHistorySchema = z.object({
  timestamp: z.string().datetime(),
  prediction_value: z.number(),
  risk_level: riskLevelSchema,
});
export type PredictionHistory = z.infer<typeof predictionHistorySchema>;

// Prediction query schema
export const predictionQuerySchema = z.object({
  patient_id: z.string().uuid(),
  model_type: modelTypeSchema.optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(100).default(20),
});
export type PredictionQuery = z.infer<typeof predictionQuerySchema>;
