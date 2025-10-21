import { z } from 'zod';
import { router, protectedProcedure } from '../index';

export const userRouter = router({
  // Get current user profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    return ctx.user;
  }),

  // Update user profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        phoneNumber: z.string().optional(),
        secondPhone: z.string().optional(),
        selfieUrl: z.string().optional(),
        idImageFrontUrl: z.string().optional(),
        idImageBackUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updatedUser = await ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: input,
      });
      return updatedUser;
    }),

  // Get user by ID (admin only - you can add role check later)
  getUserById: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
      });
      return user;
    }),
});
