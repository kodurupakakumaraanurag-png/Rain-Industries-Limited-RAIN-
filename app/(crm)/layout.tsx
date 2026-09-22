import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { CrmShell } from '@/components/layout/CrmShell';

export default async function CrmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // If no session is active, redirect to login
  if (!session) {
    redirect('/login');
  }

  return <CrmShell user={session}>{children}</CrmShell>;
}
