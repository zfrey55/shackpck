import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './db';
import bcrypt from 'bcryptjs';
import { emailWhere } from './normalize-email';
import { safeRedirectPath } from './safe-redirect';

/** Positive integer from the environment, or the default. Never throws. */
function positiveIntEnv(raw: string | undefined, fallback: number): number {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}

// Admin access comes ONLY from the database role, checked per request by
// lib/require-admin.ts. The token's `role` is informational and is never used
// to gate anything; the old ADMIN_EMAILS env override was removed.

export const authOptions: NextAuthOptions = {
  // Netlify / reverse proxies: required so /api/auth/* resolves the public URL (avoids 500 + CLIENT_FETCH_ERROR)
  // @ts-expect-error NextAuth AuthOptions types omit trustHost; it is supported at runtime
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Trimmed, lowercased and matched case-insensitively (lib/normalize-email).
        const user = await prisma.user.findFirst({
          where: emailWhere(credentials.email),
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    // Every callbackUrl (sign-in, sign-out, the callback cookie) goes through
    // safeRedirectPath: same-origin paths only, "/account" otherwise, never a
    // throw. NextAuth's default threw on unparseable values and returned 500.
    async redirect({ url, baseUrl }) {
      return `${baseUrl}${safeRedirectPath(url, baseUrl)}`;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
    /**
     * IDLE timeout, not an absolute one. NextAuth re-issues the JWT whenever a
     * session is read more than `updateAge` after it was issued, and each
     * re-issue sets a fresh `maxAge` expiry — so someone who keeps using the
     * site never gets logged out, and someone who walks away is signed out
     * 8 hours later. `updateAge` is the granularity: with 30 minutes, the
     * effective idle window is between 7.5 and 8 hours.
     *
     * Existing sessions keep their old expiry until their next refresh, which
     * happens within `updateAge` of their next activity.
     *
     * The env overrides exist so the timeout can be exercised in development
     * (see scripts / docs); production uses the defaults below.
     */
    maxAge: positiveIntEnv(process.env.SESSION_MAX_AGE_SECONDS, 8 * 60 * 60),
    updateAge: positiveIntEnv(process.env.SESSION_UPDATE_AGE_SECONDS, 30 * 60),
  },
  secret: process.env.NEXTAUTH_SECRET,
};
