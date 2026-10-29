import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { username } from 'better-auth/plugins';
import { nextCookies } from 'better-auth/next-js';
import { db } from './db';

export const auth = betterAuth({
    database: drizzleAdapter(db, { provider: 'pg' }),
    emailAndPassword: { enabled: true },
    user: {
        additionalFields: {
            isBot: { type: 'boolean', defaultValue: false, input: false },
            lastSeenAt: { type: 'date', required: false, input: false },
        },
    },
    plugins: [username(), nextCookies()],   // nextCookies — всегда последним
});