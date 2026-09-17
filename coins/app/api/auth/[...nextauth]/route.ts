import NextAuth from 'next-auth';
import type { NextRequest } from 'next/server';
import { authOptions } from '@/lib/auth';
import {
  clientIp,
  emailIdentifier,
  ipIdentifier,
  rateLimit,
  tooManyRequests,
} from '@/lib/rate-limit';

export const runtime = 'nodejs';

const handler = NextAuth(authOptions);

type RouteContext = { params: { nextauth: string[] } };

/**
 * Credentials sign-in is rate limited here, before NextAuth sees it: 10 attempts
 * per 10 minutes per IP and per normalized email, every attempt counted (fails
 * open). This has to wrap the route: an error thrown from authorize() always
 * becomes a 401.
 *
 * The 429 body carries a `url` with `error=RateLimited` because next-auth's
 * client signIn() reads the error from data.url; the sign-in page shows a
 * friendly message for it. The email is read from a clone, so NextAuth still
 * receives the untouched body.
 */
async function POST(request: NextRequest, context: RouteContext) {
  if (request.nextUrl.pathname.endsWith('/callback/credentials')) {
    const form = await request.clone().formData().catch(() => null);
    const email = form?.get('email');
    const checks = [rateLimit('signin-ip', ipIdentifier(clientIp(request.headers)))];
    if (typeof email === 'string' && email.trim()) checks.push(rateLimit('signin-email', emailIdentifier(email)));
    const blocked = (await Promise.all(checks)).find((r) => !r.ok);
    if (blocked && !blocked.ok) {
      const origin = process.env.NEXTAUTH_URL?.replace(/\/$/, '') || request.nextUrl.origin;
      return tooManyRequests(
        { url: `${origin}/api/auth/error?error=RateLimited`, error: 'RateLimited' },
        blocked.retryAfterSec
      );
    }
  }
  return handler(request, context);
}

export { handler as GET, POST };
