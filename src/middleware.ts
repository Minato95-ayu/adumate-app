import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

// Basic in-memory rate limiting (Note: This is not shared across serverless instances)
// For a production-ready solution, use @upstash/ratelimit with Redis.
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 50; // 50 requests per minute per IP

export function middleware(request: NextRequest) {
  const ip = request.ip || 'anonymous';
  const now = Date.now();
  
  // Security Headers
  const response = NextResponse.next();
  
  // Rate Limiting Logic
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const rateLimitInfo = rateLimitMap.get(ip) || { count: 0, lastReset: now };
    
    if (now - rateLimitInfo.lastReset > RATE_LIMIT_WINDOW) {
      rateLimitInfo.count = 1;
      rateLimitInfo.lastReset = now;
    } else {
      rateLimitInfo.count++;
    }
    
    rateLimitMap.set(ip, rateLimitInfo);
    
    if (rateLimitInfo.count > MAX_REQUESTS_PER_WINDOW) {
      return new NextResponse('Too Many Requests', { 
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': MAX_REQUESTS_PER_WINDOW.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': (rateLimitInfo.lastReset + RATE_LIMIT_WINDOW).toString(),
        }
      });
    }
    
    // Add rate limit headers to response
    response.headers.set('X-RateLimit-Limit', MAX_REQUESTS_PER_WINDOW.toString());
    response.headers.set('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS_PER_WINDOW - rateLimitInfo.count).toString());
  }

  // Bot Detection: Block requests with no User-Agent or suspicious ones
  const userAgent = request.headers.get('user-agent') || '';
  if (!userAgent || userAgent.includes('bot') || userAgent.includes('crawler') || userAgent.includes('spider')) {
    // We allow search engine bots for pages, but not for API routes
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return new NextResponse('Bots not allowed on API routes', { status: 403 });
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
