import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import {
  loginSchema,
  registerSchema,
  userSchema,
} from "@/lib/validations/auth";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Extended schemas with CSRF token
const loginWithCsrfSchema = loginSchema.extend({
  csrfToken: z.string(),
});

const registerWithCsrfSchema = registerSchema.extend({
  csrfToken: z.string(),
});

export const authRouter = createTRPCRouter({
  // Login - calls FastAPI backend
  login: publicProcedure
    .input(loginWithCsrfSchema)
    .mutation(async ({ input, ctx }) => {
      const { csrfToken, ...loginData } = input;

      // Forward cookies from the client request
      const cookieHeader = ctx.headers.get("cookie") || "";

      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
          ...(cookieHeader && { Cookie: cookieHeader }),
        },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
          role: loginData.role,
          remember_me: loginData.rememberMe,
        }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new TRPCError({
          code: res.status === 403 ? "FORBIDDEN" : "UNAUTHORIZED",
          message: error.error || error.detail || "Invalid credentials",
        });
      }

      const user = await res.json();

      // Backend now returns only user (tokens in httpOnly cookies)
      return {
        user: userSchema.parse(user),
      };
    }),

  // Register - calls FastAPI backend
  register: publicProcedure
    .input(registerWithCsrfSchema)
    .mutation(async ({ input, ctx }) => {
      const { csrfToken, ...registerData } = input;

      // Forward cookies from the client request
      const cookieHeader = ctx.headers.get("cookie") || "";

      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
          ...(cookieHeader && { Cookie: cookieHeader }),
        },
        body: JSON.stringify({
          email: registerData.email,
          password: registerData.password,
          full_name: registerData.full_name,
          role: registerData.role,
          department: registerData.department,
        }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.error || error.detail || "Registration failed",
        });
      }

      const user = await res.json();

      // Backend now returns only user (tokens in httpOnly cookies)
      return {
        user: userSchema.parse(user),
      };
    }),

  // Get current user (protected - requires Bearer token)
  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.user;
  }),

  // Validate session from cookies (public - for initial page load)
  validateSession: publicProcedure.query(async ({ ctx }) => {
    // Forward cookies from the client request
    const cookieHeader = ctx.headers.get("cookie") || "";

    if (!cookieHeader) {
      return { user: null };
    }

    try {
      // Call backend directly - we're on the server, so use the backend URL
      const res = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(cookieHeader && { Cookie: cookieHeader }),
        },
      });

      if (!res.ok) {
        return { user: null };
      }

      const user = await res.json();
      return { user: userSchema.parse(user) };
    } catch (error) {
      return { user: null };
    }
  }),

  // Refresh token
  refresh: publicProcedure.mutation(async () => {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Send refresh token cookie
    });

    if (!res.ok) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid refresh token",
      });
    }

    return await res.json();
  }),

  // Logout
  logout: publicProcedure
    .input(z.object({ csrfToken: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Forward cookies from the client request
      const cookieHeader = ctx.headers.get("cookie") || "";

      const res = await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": input.csrfToken,
          ...(cookieHeader && { Cookie: cookieHeader }),
        },
      });

      if (!res.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Logout failed",
        });
      }

      return await res.json();
    }),
});
