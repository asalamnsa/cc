import { type NextRequest, NextResponse } from "next/server"
import { revalidateTag, revalidatePath } from "next/cache"
import type { ApiResponse } from "@/lib/types"

export const dynamic = "force-dynamic"
  export const runtime = 'edge';
interface CacheManagementResponse {
  message: string
  cleared_tags?: string[]
  cleared_paths?: string[]
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const cacheKey = searchParams.get("key")
    const action = searchParams.get("action") || "clear"

    if (action === "clear-all") {
      // Clear all cache by revalidating common paths
      const commonPaths = ["/api/search", "/api/list", "/api/video"]
      const commonTags = ["search", "list_files", "video"]

      for (const path of commonPaths) {
        revalidatePath(path)
      }

      for (const tag of commonTags) {
        revalidateTag(tag)
      }

      return NextResponse.json<ApiResponse<CacheManagementResponse>>({
        success: true,
        data: {
          message: "All cache cleared successfully",
          cleared_paths: commonPaths,
          cleared_tags: commonTags,
        },
      })
    }

    if (cacheKey) {
      // Clear specific cache by tag
      revalidateTag(cacheKey)

      return NextResponse.json<ApiResponse<CacheManagementResponse>>({
        success: true,
        data: {
          message: `Cache cleared for key: ${cacheKey}`,
          cleared_tags: [cacheKey],
        },
      })
    }

    return NextResponse.json<ApiResponse<CacheManagementResponse>>(
      {
        success: false,
        error: "No cache key provided and action is not clear-all",
        data: { message: "Invalid request" },
      },
      { status: 400 },
    )
  } catch (error) {
    console.error("Cache management error:", error)
    return NextResponse.json<ApiResponse<CacheManagementResponse>>(
      {
        success: false,
        error: "Internal server error",
        data: { message: "Failed to clear cache" },
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return cache status information
    const cacheInfo = {
      cache_system: "Next.js unstable_cache",
      available_operations: [
        "DELETE /api/cache?key=<cache_key> - Clear specific cache",
        "DELETE /api/cache?action=clear-all - Clear all cache",
      ],
      cache_durations: {
        SHORT: "60 seconds",
        MEDIUM: "1 hour",
        LONG: "60 days",
      },
    }

    return NextResponse.json<ApiResponse<typeof cacheInfo>>({
      success: true,
      data: cacheInfo,
    })
  } catch (error) {
    console.error("Cache status error:", error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "Internal server error",
        data: null,
      },
      { status: 500 },
    )
  }
}
