'use server';

import { cookies } from 'next/headers';

export async function setLocaleCookie(locale: string = 'en') {
  const cookieStore = await cookies();
  cookieStore.set('NEXT_LOCALE', locale, {
    path: '/',
    maxAge: 31536000, // 1 year
    sameSite: 'lax',
  });
}
