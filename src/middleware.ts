import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Target only /admin routes
  if (pathname.startsWith('/admin')) {
    // 2. Allow /admin/login to skip check
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    // 3. Check for admin session cookie
    const adminVerified = request.cookies.get('fbt_admin_verified')?.value === 'true';

    if (!adminVerified) {
      // Redirect to login if not verified
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Config to match only /admin routes for performance
export const config = {
  matcher: ['/admin/:path*'],
};
