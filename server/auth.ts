import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './db';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  user: {
    additionalFields: {
      deviceId: {
        type: 'string',
        required: false,
        input: true,
      },
      username: {
        type: 'string',
        required: true,
        input: true,
      },
      role: {
        type: 'string',
        required: false,
        defaultValue: 'user',
        input: false,
      },
      phoneNumber: {
        type: 'string',
        required: false,
        input: true,
      },
      secondPhone: {
        type: 'string',
        required: false,
        input: true,
      },
      selfieUrl: {
        type: 'string',
        required: false,
        input: true,
      },
      idImageFrontUrl: {
        type: 'string',
        required: false,
        input: true,
      },
      idImageBackUrl: {
        type: 'string',
        required: false,
        input: true,
      },
    },
  },
  trustedOrigins: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://trusted-gamma.vercel.app',
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
  ],
});

export type Session = typeof auth.$Infer.Session;
