/**
 * Email normalization: trim + lowercase, applied wherever an email is written
 * or looked up (register, sign-in, the guest-checkout shadow-user paths, the
 * inventory user push).
 *
 * Lookups go through emailWhere(), which also matches case-insensitively.
 * The User.email unique constraint is case-sensitive, and rows written before
 * normalization may still carry uppercase until scripts/lowercase-emails.ts has
 * run against that database; the insensitive match keeps those users able to
 * sign in either way.
 */

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Prisma `where` for a User lookup by email. Use with findFirst, not findUnique. */
export function emailWhere(email: string) {
  return { email: { equals: normalizeEmail(email), mode: 'insensitive' as const } };
}
