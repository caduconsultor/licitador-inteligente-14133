import { initTRPC } from '@trpc/server';
import { z } from 'zod';

const t = initTRPC.create();

// Create a procedure that validates input using zod
const addNumbers = t.procedure
  .input(z.object({ a: z.number(), b: z.number() }))
  .query(({ input }) => {
    return input.a + input.b;
  });

export const appRouter = t.router({
  addNumbers,
});

export type AppRouter = typeof appRouter;
