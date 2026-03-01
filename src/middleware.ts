import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. HTTPS Enforcement (Production only)
  if (process.env.NODE_ENV === 'production') {
    const proto = request.headers.get('x-forwarded-proto');
    const host = request.headers.get('host');

    const isLocalHost =
      host?.startsWith('localhost') ||
      host?.startsWith('127.0.0.1') ||
      host?.startsWith('0.0.0.0');

    if (proto === 'http' && host && !isLocalHost) {
      return NextResponse.redirect(
        `https://${host}${request.nextUrl.pathname}${request.nextUrl.search}`,
        301
      );
    }
  }

  // 2. Admin Route Protection
  if (request.nextUrl.pathname.startsWith('/admin/dashboard')) {
    const adminToken = request.cookies.get('admin_token');

    if (!adminToken || adminToken.value !== 'valid') {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files with common extensions
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)',
  ],
};
