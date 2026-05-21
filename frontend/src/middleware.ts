import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Re-implemented Middleware for restoration.
 * Handles subdomain rewriting and absolute protection for private areas.
 */
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host') || '';
  const pathname = url.pathname;

  // Secure session check - relies strictly on JWT tokens
  const isLoggedIn = request.cookies.has('jwt_access') || request.cookies.has('jwt_refresh');

  // List of paths that don't need a login (Auth pages)
  const isAuthPage = pathname.startsWith('/auth/signin') || 
                     pathname.startsWith('/auth/signup') ||
                     pathname.includes('/auth/');

  // Detect if we are on the main domain (not a known subdomain)
  const isMainDomain = !host.startsWith('recruiter.') && !host.startsWith('company.');

  // 1. Redirect role-prefixed paths from main domain to subdomains
  if (isMainDomain) {
    if (pathname.startsWith('/recruiter')) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.host = `recruiter.${host}`;
      redirectUrl.pathname = pathname.replace('/recruiter', '') || '/';
      return NextResponse.redirect(redirectUrl);
    }
    if (pathname.startsWith('/company')) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.host = `company.${host}`;
      redirectUrl.pathname = pathname.replace('/company', '') || '/';
      return NextResponse.redirect(redirectUrl);
    }
  }

  // 2. Recruiter Subdomain Logic
  if (host.startsWith('recruiter.')) {
    // Redirect if it starts with /recruiter to keep URLs clean
    if (pathname.startsWith('/recruiter')) {
      url.pathname = pathname.replace('/recruiter', '') || '/';
      return NextResponse.redirect(url);
    }

    // If not logged in and not on an auth page, redirect to sign-in
    // Note: isAuthPage logic handles '/auth/' correctly now
    if (!isLoggedIn && !isAuthPage) {
      url.pathname = '/auth/signin';
      return NextResponse.redirect(url);
    }

    // Rewrite internally to the /recruiter directory
    if (!pathname.startsWith('/recruiter')) {
      url.pathname = `/recruiter${pathname === '/' ? '' : pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  // 3. Company Subdomain Logic
  if (host.startsWith('company.')) {
    // Redirect if it starts with /company to keep URLs clean
    if (pathname.startsWith('/company')) {
      url.pathname = pathname.replace('/company', '') || '/';
      return NextResponse.redirect(url);
    }

    // If not logged in and not on an auth page, redirect to sign-in
    if (!isLoggedIn && !isAuthPage) {
      url.pathname = '/auth/signin';
      return NextResponse.redirect(url);
    }

    // Rewrite internally to the /company directory
    if (!pathname.startsWith('/company')) {
      url.pathname = `/company${pathname === '/' ? '' : pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  // 4. Main Domain fallback (Candidates/Marketing)
  // If logged in and on an auth page, redirect to dashboard
  if (isMainDomain && isLoggedIn && isAuthPage) {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

/**
 * Middleware Matcher Configuration.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes
     * - static files (_next/static)
     * - images (_next/image)
     * - icons (favicon.ico)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
