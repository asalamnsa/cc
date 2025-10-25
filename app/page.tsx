import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">AGC Video API</h1>
          <p className="text-lg text-muted-foreground text-center mb-12">
            Next.js conversion of PHP AGC class for video content management
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Available Endpoints</h2>
              <ul className="space-y-2 text-sm">
                <li>
                  <code className="bg-muted px-2 py-1 rounded">GET /api/search?q=query&page=1</code>
                </li>
                <li>
                  <code className="bg-muted px-2 py-1 rounded">GET /api/list?page=1&per_page=20</code>
                </li>
                <li>
                  <code className="bg-muted px-2 py-1 rounded">GET /api/video/[id]</code>
                </li>
                <li>
                  <code className="bg-muted px-2 py-1 rounded">GET /api/related?title=title&limit=10</code>
                </li>
                <li>
                  <code className="bg-muted px-2 py-1 rounded">GET /api/cache</code>
                </li>
                <li>
                  <code className="bg-muted px-2 py-1 rounded">DELETE /api/cache?key=cache_key</code>
                </li>
              </ul>
            </div>

            <div className="border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Features</h2>
              <ul className="space-y-2 text-sm">
                <li>✅ Smart caching with Next.js unstable_cache</li>
                <li>✅ Parallel API requests for better performance</li>
                <li>✅ Comprehensive error handling</li>
                <li>✅ Input validation and sanitization</li>
                <li>✅ TypeScript support</li>
                <li>✅ OpenAPI documentation</li>
                <li>✅ CORS and middleware support</li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/api-documentation.json"
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              View API Documentation (JSON)
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
