import type {Metadata} from 'next';
import {hasLocale, NextIntlClientProvider} from 'next-intl';
import {getMessages, setRequestLocale} from 'next-intl/server';
import {Inter, Manrope} from 'next/font/google';
import {notFound} from 'next/navigation';

import '../globals.css';

import {AppFrame} from '@/components/layout/app-frame';
import {Providers} from '@/components/layout/providers';
import {routing} from '@/i18n/routing';
import {getCurrentUser} from '@/lib/server/auth';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
});

export const metadata: Metadata = {
  title: 'POSKU',
  description: 'Tablet-first POS frontend for a single F&B outlet.',
};

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const currentUser = await getCurrentUser();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.variable} ${manrope.variable}`}>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <AppFrame authenticated={Boolean(currentUser)}>{children}</AppFrame>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
