import { router } from "@/lib/trpc/trpc";
import { authRouter } from "./auth.router";

// Combine all routers here
export const appRouter = router({
  auth: authRouter,
  // Add more routers as your app grows:
  // user: userRouter,
  // courses: coursesRouter,
});

// Export type router type signature for Flutter/client consumption
export type AppRouter = typeof appRouter;
