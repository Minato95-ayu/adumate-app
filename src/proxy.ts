import { NextResponse, NextRequest } from 'next/server';

// Basic in-memory rate limiting (Note: This is not shared across serverless instances)
// For a production-ready solution, use @upstash/ratelimit with Redis.
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30; // 30 requests per minute per IP

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://www.adumate.in',
  'https://adumate.in',
  'http://localhost:3000',
];

export function proxy(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'anonymous';
  const now = Date.now();
  
  // Dynamic Security Headers
  const response = NextResponse.next();
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

  // CORS — only allow our own domain
  const origin = request.headers.get('origin');
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  }
  
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
      console.warn(`[SECURITY] Rate limit exceeded for IP: ${ip}`);
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

  // Enhanced Bot Detection
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
  const suspiciousBots = ['bot', 'crawler', 'spider', 'headless', 'puppeteer', 'selenium', 'python-requests', 'node-fetch'];
  
  const isBot = suspiciousBots.some(bot => userAgent.includes(bot));
  
  if (isBot) {
    // We allow search engine bots for public pages, but strictly block for API and Auth routes
    const sensitiveRoutes = ['/api/', '/login', '/register'];
    if (sensitiveRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
      console.warn(`[SECURITY] Bot blocked: ${userAgent} on ${request.nextUrl.pathname}`);
      return new NextResponse('Bots not allowed on sensitive routes', { status: 403 });
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
