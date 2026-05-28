// Promote an existing user account to ADMIN role.
//
// Usage:
//   DATABASE_URL="postgres://..." npx tsx scripts/promote-admin.ts you@example.com
//
// Or pass an env var instead of an argv:
//   DATABASE_URL="..." PROMOTE_EMAIL="you@example.com" npx tsx scripts/promote-admin.ts
//
// Use the SAME email you sign into shackpck.com with. The script verifies the
// user exists, prints what was found, then sets role=ADMIN.

import { prisma } from '../lib/db';

async function main() {
  const emailRaw = (process.argv[2] || process.env.PROMOTE_EMAIL || '').trim();
  if (!emailRaw) {
    console.error('Usage: npx tsx scripts/promote-admin.ts <email>');
    console.error('       (Or set PROMOTE_EMAIL env var.)');
    process.exit(1);
  }
  const email = emailRaw.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, role: true, isShadowUser: true },
  });

  if (!user) {
    console.error(`No user found with email "${email}".`);
    console.error('Sign up on the site first (or use create-admin.ts) and then run this script.');
    process.exit(1);
  }

  if (user.isShadowUser) {
    console.error(
      `User "${email}" is a guest-checkout shadow account with no password set.\n` +
        'Register a real account at /auth/register with this email first, then re-run this script.'
    );
    process.exit(1);
  }

  if (user.role === 'ADMIN') {
    console.log(`User "${email}" is already an ADMIN. Nothing to do.`);
    process.exit(0);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { role: 'ADMIN' },
    select: { id: true, email: true, name: true, role: true },
  });

  console.log('✅ User promoted to ADMIN.');
  console.log(`   id:    ${updated.id}`);
  console.log(`   email: ${updated.email}`);
  console.log(`   name:  ${updated.name ?? '(none)'}`);
  console.log(`   role:  ${updated.role}`);
  console.log('\nNext: sign OUT of the site, sign back IN, then visit /admin/builds.');
}

main()
  .catch((err) => {
    console.error('Error promoting user:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
