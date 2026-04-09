import {redirect} from 'next/navigation';

import {SettingsPage} from '@/components/settings/settings-page';
import {getCurrentUser} from '@/lib/server/auth';

export default async function SettingsRoute({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect(`/${locale}/login`);
  }

  return <SettingsPage />;
}
