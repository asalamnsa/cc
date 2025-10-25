import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Add CORS headers for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const response = NextResponse.next()

    // Add CORS headers
    response.headers.set("Access-Control-Allow-Origin", "*")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")

    // Add rate limiting headers (placeholder - implement actual rate limiting as needed)
    response.headers.set("X-RateLimit-Limit", "100")
    response.headers.set("X-RateLimit-Remaining", "99")

    if (
      request.nextUrl.pathname.includes("/search") ||
      request.nextUrl.pathname.includes("/list") ||
      request.nextUrl.pathname.includes("/related")
    ) {
      // For server-optimal caching: 5 minutes CDN cache
      response.headers.set("Cache-Control", "public, max-age=300, s-maxage=300")
    } else if (request.nextUrl.pathname.includes("/info")) {
      // For dynamic content with ETag validation: 1 minute cache
      response.headers.set("Cache-Control", "public, max-age=60")
      // ETag will be set in individual route handlers
    } else if (request.nextUrl.pathname.includes("/cache")) {
      // Cache management should not be cached
      response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate")
    } else {
      // Default cache for other API routes
      response.headers.set("Cache-Control", "public, max-age=300, s-maxage=300")
    }

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/api/:path*",
}
