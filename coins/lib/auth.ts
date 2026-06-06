import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './db';
import bcrypt from 'bcryptjs';

/**
 * Comma-separated list of emails that should always be treated as ADMIN, even if
 * their DB row says role=USER. Lets us grant admin without a DB write.
 *
 * Example Netlify env: ADMIN_EMAILS=gjpacking123@gmail.com,owner2@example.com
 */
function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const raw = process.env.ADMIN_EMAILS;
  if (!raw) return false;
  const normalized = email.trim().toLowerCase();
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
    .includes(normalized);
}

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

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isValid) {
          return null;
        }

        const elevatedRole = isAdminEmail(user.email) ? 'ADMIN' : user.role;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: elevatedRole,
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
      // Re-evaluate ADMIN_EMAILS on every JWT refresh so promotion/demotion via
      // env var takes effect for existing sessions without forcing re-login.
      if (token.email && isAdminEmail(token.email as string)) {
        token.role = 'ADMIN';
      }
      return token;
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
