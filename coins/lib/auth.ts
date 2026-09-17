import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './db';
import bcrypt from 'bcryptjs';
import { emailWhere } from './normalize-email';
import { safeRedirectPath } from './safe-redirect';

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
  },
  secret: process.env.NEXTAUTH_SECRET,
};
