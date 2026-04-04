import {redirect} from 'next/navigation';

import {LoginPage} from '@/components/auth/login-page';
import {getCurrentUser} from '@/lib/server/auth';

export default async function LoginRoute({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const currentUser = await getCurrentUser();

  if (currentUser) {
    redirect(`/${locale}`);
  }

  return <LoginPage />;
}
