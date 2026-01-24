import { NextRequest, NextResponse } from 'next/server';

// No i18n middleware needed as the app is Arabic-only.
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
