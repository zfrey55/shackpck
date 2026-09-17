import { requireAdminPage } from '@/lib/require-admin';
import { AdminDashboardClient } from './AdminDashboardClient';

export const dynamic = 'force-dynamic';

/**
 * Admin dashboard. Gated server-side on the DATABASE role (lib/require-admin):
 * signed out -> /auth/signin?callbackUrl=/admin, signed in but not an admin ->
 * /account. The session token's role is never consulted.
 */
export default async function AdminPage() {
  await requireAdminPage('/admin');
  return <AdminDashboardClient />;
}
