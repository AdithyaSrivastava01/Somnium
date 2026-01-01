import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import type { Context } from "./context";
import { ROLE_SCOPES } from "@/lib/validations/auth";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

// Protected procedure - requires valid JWT
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

// Scope-based procedure
export const scopedProcedure = (scope: string) =>
  protectedProcedure.use(async ({ ctx, next }) => {
    const userScopes = ROLE_SCOPES[ctx.user.role] || [];
    if (!userScopes.includes(scope)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Requires scope: ${scope}`,
      });
    }
    return next({ ctx });
  });
