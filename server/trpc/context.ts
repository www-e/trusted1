import { prisma } from '../db';
import { auth } from '../auth';

export async function createContext(opts: { req: Request }) {
  const session = await auth.api.getSession({
    headers: opts.req.headers,
  });

  return {
    prisma,
    session,
    user: session?.user ?? null,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
