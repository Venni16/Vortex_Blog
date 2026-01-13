import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/auth';

// Simple in-memory rate limit (for local dev)
const rateLimit = new Map<string, { count: number, reset: number }>();

export async function middleware(request: NextRequest) {
  const ip = (request as any).ip || request.headers.get('x-forwarded-for') || '127.0.0.1';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 100;

  let limit = rateLimit.get(ip);
  if (!limit || now > limit.reset) {
    limit = { count: 0, reset: now + windowMs };
  }
  limit.count++;
  rateLimit.set(ip, limit);

  if (limit.count > maxRequests) {
    return new NextResponse('Too many requests', { status: 429 });
  }

  const session = request.cookies.get('session')?.value;
  const path = request.nextUrl.pathname;

  // Protect admin routes
  if (path.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    try {
      const decoded = await decrypt(session);
      if (decoded.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (e) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
