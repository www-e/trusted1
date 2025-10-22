import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
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
  // Extract token from Authorization header
  const authHeader = opts.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return {
      session: null,
      user: null,
      headers: opts.headers,
    };
  }

  // Find session in database
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return {
      session: null,
      user: null,
      headers: opts.headers,
    };
  }

  return {
    session: {
      id: session.id,
      token: session.token,
      expiresAt: session.expiresAt,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      userId: session.userId,
    },
    user: {
      id: session.user.id,
      username: session.user.username,
      email: session.user.email,
      emailVerified: session.user.emailVerified,
      role: session.user.role,
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
