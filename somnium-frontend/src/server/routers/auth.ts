import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import {
  loginSchema,
  registerSchema,
  tokenResponseSchema,
  userSchema,
} from "@/lib/validations/auth";
import { TRPCError } from "@trpc/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const authRouter = createTRPCRouter({
  // Login - calls FastAPI backend
  login: publicProcedure.input(loginSchema).mutation(async ({ input }) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: input.email,
        password: input.password,
        role: input.role,
        remember_me: input.rememberMe, // Send remember me to backend
      }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new TRPCError({
        code: res.status === 403 ? "FORBIDDEN" : "UNAUTHORIZED",
        message: error.error || error.detail || "Invalid credentials",
      });
    }

    const response = await res.json();

    // Backend returns { user: {...}, tokens: {...} }
    return {
      tokens: tokenResponseSchema.parse(response.tokens),
      user: userSchema.parse(response.user),
    };
  }),

  // Register - calls FastAPI backend
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ input }) => {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: input.email,
          password: input.password,
          full_name: input.full_name,
          role: input.role,
          department: input.department,
        }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.error || error.detail || "Registration failed",
        });
      }

      const response = await res.json();

      // Backend returns { user: {...}, tokens: {...} }
      return {
        tokens: tokenResponseSchema.parse(response.tokens),
        user: userSchema.parse(response.user),
      };
    }),

  // Get current user
  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.user;
  }),

  // Refresh token
  refresh: publicProcedure
    .input(z.object({ refresh_token: z.string() }))
    .mutation(async ({ input }) => {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid refresh token",
        });
      }

      return tokenResponseSchema.parse(await res.json());
    }),
});
