import { z } from "zod";

// User roles enum
export const userRoleSchema = z.enum([
  "nurse",
  "physician",
  "admin",
  "ecmo_specialist",
]);
export type UserRole = z.infer<typeof userRoleSchema>;

// User schema
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  full_name: z.string().min(1),
  role: userRoleSchema,
  department: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.string().datetime(),
});
export type User = z.infer<typeof userSchema>;

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: userRoleSchema,
  rememberMe: z.boolean().optional().default(false),
});
export type LoginInput = z.infer<typeof loginSchema>;

// Register schema
export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  role: userRoleSchema,
  department: z.string().optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

// Token response schema
export const tokenResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  token_type: z.literal("bearer"),
});
export type TokenResponse = z.infer<typeof tokenResponseSchema>;

// RBAC Scopes mapping
export const ROLE_SCOPES: Record<UserRole, string[]> = {
  nurse: ["read:patients", "write:vitals", "write:labs"],
  physician: [
    "read:patients",
    "write:patients",
    "write:vitals",
    "write:labs",
    "read:predictions",
  ],
  ecmo_specialist: [
    "read:patients",
    "write:patients",
    "write:vitals",
    "write:labs",
    "read:predictions",
  ],
  admin: [
    "read:patients",
    "write:patients",
    "write:vitals",
    "write:labs",
    "read:predictions",
    "manage:users",
  ],
};

// Helper to check if a role has a specific scope
export function hasScope(role: UserRole, scope: string): boolean {
  return ROLE_SCOPES[role]?.includes(scope) ?? false;
}
