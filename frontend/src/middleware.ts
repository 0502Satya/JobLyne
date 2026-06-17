import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * Re-implemented Middleware for restoration.
 * Handles subdomain rewriting and absolute protection for private areas.
 */
export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host') || '';
  const pathname = url.pathname;

  // Secure session check - relies strictly on JWT tokens
  const token = request.cookies.get('jwt_access')?.value;
  const refreshToken = request.cookies.get('jwt_refresh')?.value;
  const userRole = request.cookies.get('joblyne_role')?.value;
  let isLoggedIn = false;

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET environment variable is missing! Protected routes will be inaccessible.');
  }
  const secret = jwtSecret ? new TextEncoder().encode(jwtSecret) : null;

  if (secret) {
    if (token) {
      try {
        await jwtVerify(token, secret);
        isLoggedIn = true;
      } catch {
        // Access token invalid/expired, check refresh token
        if (refreshToken) {
          try {
            await jwtVerify(refreshToken, secret);
            isLoggedIn = true;
          } catch {
            isLoggedIn = false;
          }
        }
      }
    } else if (refreshToken) {
      try {
        await jwtVerify(refreshToken, secret);
        isLoggedIn = true;
      } catch {
        isLoggedIn = false;
      }
    }
  }

  // List of paths that don't need a login (Auth pages)
  const isAuthPage = pathname.startsWith('/auth/signin') || 
                     pathname.startsWith('/auth/signup') ||
                     pathname.includes('/auth/');

  // Detect if we are on the main domain (not a known subdomain)
  const isMainDomain = !host.startsWith('recruiter.') && !host.startsWith('company.');

  // Strict role and subdomain verification
  if (isLoggedIn && userRole) {
    const isRecruiterSubdomain = host.startsWith('recruiter.');
    const isCompanySubdomain = host.startsWith('company.');
    
    if (isRecruiterSubdomain && userRole !== 'RECRUITER') {
      isLoggedIn = false;
    } else if (isCompanySubdomain && userRole !== 'COMPANY') {
      isLoggedIn = false;
    } else if (isMainDomain && userRole !== 'CANDIDATE') {
      // Automatic cross-subdomain routing for non-candidate roles landing on main domain
      if (userRole === 'RECRUITER') {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.host = `recruiter.${host}`;
        redirectUrl.pathname = pathname === '/' ? '/dashboard' : pathname;
        return NextResponse.redirect(redirectUrl);
      }
      if (userRole === 'COMPANY') {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.host = `company.${host}`;
        redirectUrl.pathname = pathname === '/' ? '/dashboard' : pathname;
        return NextResponse.redirect(redirectUrl);
      }
      isLoggedIn = false;
    }
  }

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

    // Redirect /dashboard to / as company dashboard is hosted at root
    if (pathname === '/dashboard') {
      url.pathname = '/';
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
  // If not logged in and attempting to access private dashboard pages, redirect to sign-in
  if (isMainDomain && !isLoggedIn && (pathname === '/dashboard' || pathname.startsWith('/dashboard/'))) {
    url.pathname = '/auth/signin';
    return NextResponse.redirect(url);
  }

  // If logged in and on an auth page, redirect to dashboard
  if (isLoggedIn && isAuthPage) {
    if (userRole === 'COMPANY') {
      url.pathname = '/';
    } else if (userRole === 'RECRUITER') {
      url.pathname = '/dashboard';
    } else {
      url.pathname = '/dashboard';
    }
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
