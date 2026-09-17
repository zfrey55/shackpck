import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * The one admin check. The DATABASE role is the only source of admin access:
 * it is read by session user id on every call, so a promotion or demotion takes
 * effect immediately, whatever role an existing session token still carries.
 * Never gate on the token's `role`.
 */

export type AdminUser = { id: string; email: string };

type AdminLookup =
  | { state: 'signed-out' }
  | { state: 'not-admin'; userId: string }
  | { state: 'admin'; user: AdminUser };

async function lookupAdmin(): Promise<AdminLookup> {
  const session = await getServerSession(authOptions);
  const id = (session?.user as { id?: string } | undefined)?.id;
  if (!id) return { state: 'signed-out' };
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, email: true, role: true } });
  if (!user) return { state: 'signed-out' };
  if (user.role !== 'ADMIN') return { state: 'not-admin', userId: user.id };
  return { state: 'admin', user: { id: user.id, email: user.email } };
}

/** For API routes: `{ ok: true, user }`, or `{ ok: false, response }` with 401 / 403. */
export async function requireAdmin(): Promise<
  { ok: true; user: AdminUser } | { ok: false; response: NextResponse }
> {
  const result = await lookupAdmin();
  if (result.state === 'admin') return { ok: true, user: result.user };
  const status = result.state === 'signed-out' ? 401 : 403;
  return {
    ok: false,
    response: NextResponse.json({ error: status === 401 ? 'Unauthorized' : 'Forbidden' }, { status }),
  };
}

/** True only for a signed-in user whose database role is ADMIN. Never errors on signed-out. */
export async function isAdminRequest(): Promise<boolean> {
  return (await lookupAdmin()).state === 'admin';
}

/** True when this user id has the ADMIN role in the database. */
export async function isAdminUserId(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  return user?.role === 'ADMIN';
}

/**
 * For server pages. Signed out -> /auth/signin?callbackUrl=<path>; signed in but
 * not an admin -> /account. Returns the admin otherwise.
 */
export async function requireAdminPage(path: string): Promise<AdminUser> {
  const result = await lookupAdmin();
  if (result.state === 'signed-out') redirect(`/auth/signin?callbackUrl=${encodeURIComponent(path)}`);
  if (result.state === 'not-admin') redirect('/account');
  return result.user;
}
