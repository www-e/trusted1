import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma/client";

// Context type that will be available in all procedures
export interface Context {
  session: {
    id: string;
    token: string;
    expiresAt: Date;
    ipAddress: string | null;
    userAgent: string | null;
    userId: string;
  } | null;
  user: {
    id: string;
    username: string;
    email: string;
    emailVerified: boolean;
    role: string;
  } | null;
  headers: Headers;
}

// Create context for each request
export async function createContext(opts: {
  headers: Headers;
}): Promise<Context> {
  // Use Better-Auth to get session
  const session = await auth.api.getSession({
    headers: opts.headers,
  });

  if (!session) {
    return {
      session: null,
      user: null,
      headers: opts.headers,
    };
  }

  // Fetch full user from Prisma
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!dbUser) {
    return {
      session: null,
      user: null,
      headers: opts.headers,
    };
  }

  return {
    session: {
      id: session.session.id,
      token: session.session.token,
      expiresAt: new Date(session.session.expiresAt),
      ipAddress: session.session.ipAddress || null,
      userAgent: session.session.userAgent || null,
      userId: session.user.id,
    },
    user: {
      id: dbUser.id,
      username: dbUser.username,
      email: dbUser.email,
      emailVerified: dbUser.emailVerified,
      role: dbUser.role,
    },
    headers: opts.headers,
  };
}

// Initialize tRPC with context
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof Error && error.cause.name === "ZodError"
            ? error.cause
            : null,
      },
    };
  },
});

// Export reusable router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;

// Protected procedure - requires authentication
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      user: ctx.user,
    },
  });
});

// Middleware for rate limiting (can be enhanced with Redis)
export const rateLimitMiddleware = t.middleware(async ({ next }) => {
  // Basic rate limiting - you can enhance this with Redis
  // For now, we'll rely on database-based rate limiting
  return next();
});

export const createCallerFactory = t.createCallerFactory;
