import { type NextRequest, NextResponse } from "next/server"
import { ApiClient } from "@/lib/api-client"
import { getCachedData, createCacheKey, CACHE_DURATIONS } from "@/lib/cache"
import { cleanTitle, removeDuplicateItems, calculateRelevance } from "@/lib/utils"
import type { VideoItem, ApiResponse } from "@/lib/types"

export const dynamic = "force-dynamic"
  export const runtime = 'edge';
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const title = searchParams.get("title") || ""
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    if (!title.trim()) {
      return NextResponse.json<ApiResponse<VideoItem[]>>(
        {
          success: false,
          error: "Title parameter is required",
          data: [],
        },
        { status: 400 },
      )
    }

    const cacheKey = createCacheKey("related", title, limit)

    const relatedVideos = await getCachedData(
      cacheKey,
      async () => {
        // Extract keywords from the title for better matching
        const keywords = title
          .toLowerCase()
          .replace(/[^a-zA-Z\s]/g, " ")
          .split(" ")
          .filter((word) => word.length > 2)
          .slice(0, 5) // Limit to 5 most relevant keywords

        if (keywords.length === 0) {
          return []
        }

        // Create search queries from keywords
        const queries = [
          keywords.join(" "), // Full keyword combination
          ...keywords.slice(0, 3), // Individual top keywords
        ]

        // Remove duplicates
        const uniqueQueries = [...new Set(queries)]

        // Fetch related videos using search functionality
        const fetchPromises = uniqueQueries.map(async (searchQuery) => {
          const response = await ApiClient.fetchFromApi("/api/search", {
            q: searchQuery,
            page: 1,
          })

          if (response.status !== 200 || !response.data) {
            console.error(`Related search failed for query: ${searchQuery}`)
            return []
          }

          try {
            const responseData = JSON.parse(response.data)
            if (!responseData.result || !Array.isArray(responseData.result)) {
              return []
            }

            return responseData.result.map(
              (item: any): VideoItem => ({
                title: cleanTitle(item.title || ""),
                single_img: item.single_img || "",
                splash_img: item.splash_img || "",
                file_code: item.file_code || "",
                length: item.length ? new Date(item.length * 1000).toISOString().substr(11, 8) : "",
                views: item.views || 0,
                uploaded: item.uploaded || "",
                api_source: item.api_source || "doodstream",
                relevance: calculateRelevance(cleanTitle(item.title || ""), keywords),
              }),
            )
          } catch (parseError) {
            console.error(`Failed to parse related videos response for query: ${searchQuery}`, parseError)
            return []
          }
        })

        const results = await Promise.all(fetchPromises)
        const allItems = results.flat()

        // Remove duplicates and sort by relevance
        const uniqueItems = removeDuplicateItems(allItems)

        // Filter out exact matches (same title) and sort by relevance
        const filteredItems = uniqueItems
          .filter((item) => item.title.toLowerCase() !== title.toLowerCase())
          .sort((a, b) => {
            const relevanceDiff = (b.relevance || 0) - (a.relevance || 0)
            if (relevanceDiff !== 0) return relevanceDiff

            // Secondary sort by views
            return (b.views || 0) - (a.views || 0)
          })
          .slice(0, limit) // Limit results

        return filteredItems
      },
      CACHE_DURATIONS.MEDIUM,
    )

    const responseData = {
      success: true,
      data: relatedVideos,
      cache_hit: true,
    }

    return NextResponse.json<ApiResponse<VideoItem[]>>(responseData, {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    })
  } catch (error) {
    console.error("Related videos API error:", error)
    return NextResponse.json<ApiResponse<VideoItem[]>>(
      {
        success: false,
        error: "Internal server error",
        data: [],
      },
      { status: 500 },
    )
  }
}
