import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function getBuilderUser(): Promise<
  | { id: string; email: string; name: string | null }
  | null
> {
  const session = await getServerSession(authOptions);
  const id = (session?.user as { id?: string } | undefined)?.id;
  const email = session?.user?.email;
  if (!id || !email) return null;
  return {
    id,
    email,
    name: session.user.name ?? null,
  };
}
