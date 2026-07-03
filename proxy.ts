import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const indexNowKey = process.env.INDEXNOW_KEY?.trim();

  if (indexNowKey && request.nextUrl.pathname === `/${indexNowKey}.txt`) {
    const url = request.nextUrl.clone();
    url.pathname = "/indexnow-key.txt";
    return NextResponse.rewrite(url);
  }

  const intlResponse = intlMiddleware(request);

  return intlResponse;
}

export const config = {
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',

    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(en)/:path*',

    // Expose the IndexNow key at the root-level path required by crawlers
    '/:path*.txt',

    // Enable redirects that add missing locales
    // (e.g. `/pathnames` -> `/en/pathnames`)
    '/((?!api|_next|_vercel|auth|privacy-policy|terms-of-service|refund-policy|.*\\.|favicon.ico).*)'
  ]
};
