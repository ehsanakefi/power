import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = ['/login', '/register'];

// Define routes that require authentication
const protectedRoutes = ['/dashboard', '/profile', '/tickets', '/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Get the token from the request cookies or headers
  const token = request.cookies.get('power-crm-auth')?.value ||
                request.headers.get('authorization')?.replace('Bearer ', '');

  // If it's a protected route and there's no token, redirect to login
  // if (isProtectedRoute && !token) {
  //   const loginUrl = new URL('/login', request.url);
  //   loginUrl.searchParams.set('redirect', pathname);
  //   return NextResponse.redirect(loginUrl);
  // }

  // If user is authenticated and tries to access login page, redirect to dashboard
  if (isPublicRoute && token && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Allow the request to continue
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
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
