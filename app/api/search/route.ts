import { type NextRequest, NextResponse } from "next/server"
import { ApiClient } from "@/lib/api-client"
import { getCachedData, createCacheKey, CACHE_DURATIONS } from "@/lib/cache"
import { cleanTitle, removeDuplicateItems, calculateRelevance } from "@/lib/utils"

export const dynamic = "force-dynamic"
  export const runtime = 'edge';
interface SearchApiResponse {
  server_time: string
  status: number
  msg: string
  result: Array<{
    single_img: string
    length: string
    views: string
    title: string
    file_code: string
    uploaded: string
    splash_img: string
    canplay: number
    api_source: string
    relevance: number
  }>
  total_results: number
  page: number
  per_page: number
  total_pages: number
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q") || ""
    const page = Number.parseInt(searchParams.get("page") || "1")
    const perPage = Number.parseInt(searchParams.get("per_page") || "100")

    if (!query.trim()) {
      return NextResponse.json<SearchApiResponse>(
        {
          server_time: new Date().toISOString().replace("T", " ").substring(0, 19),
          status: 400,
          msg: "Search query is required",
          result: [],
          total_results: 0,
          page: page,
          per_page: perPage,
          total_pages: 0,
        },
        { status: 400 },
      )
    }

    const cacheKey = createCacheKey("search", query, page)

    const searchResults = await getCachedData(
      cacheKey,
      async () => {
        const keywords = query
          .toLowerCase()
          .split(" ")
          .filter((word) => word.length > 0)

        if (keywords.length === 0) {
          return []
        }

        // Create search queries
        const queries = [...keywords]
        if (keywords.length > 1) {
          queries.push(keywords.slice(0, 2).join(" "))
        }
        if (keywords.length > 2) {
          queries.push(keywords.slice(0, 3).join(" "))
        }

        // Remove duplicates
        const uniqueQueries = [...new Set(queries)]

        // Fetch from multiple queries in parallel
        const fetchPromises = uniqueQueries.map(async (searchQuery) => {
          const response = await ApiClient.fetchFromApi("/api/search", {
            q: searchQuery,
            page: page,
          })

          if (response.status !== 200 || !response.data) {
            console.error(`Search failed for query: ${searchQuery}`)
            return []
          }

          try {
            const responseData = JSON.parse(response.data)
            if (!responseData.result || !Array.isArray(responseData.result)) {
              return []
            }

            return responseData.result.map((item: any) => ({
              single_img: item.single_img || "",
              length: String(item.length || ""),
              views: String(item.views || ""),
              title: cleanTitle(item.title || ""),
              file_code: item.file_code || "",
              uploaded: item.uploaded || "",
              splash_img: item.splash_img || "",
              canplay: item.canplay || 1,
              api_source: item.api_source || "doodstream",
              relevance: calculateRelevance(cleanTitle(item.title || ""), keywords),
            }))
          } catch (parseError) {
            console.error(`Failed to parse response for query: ${searchQuery}`, parseError)
            return []
          }
        })

        const results = await Promise.all(fetchPromises)
        const allItems = results.flat()

        // Remove duplicates and sort by relevance and upload date
        const uniqueItems = removeDuplicateItems(allItems)

        uniqueItems.sort((a, b) => {
          const relevanceDiff = (b.relevance || 0) - (a.relevance || 0)
          if (relevanceDiff !== 0) return relevanceDiff

          const dateA = new Date(a.uploaded).getTime()
          const dateB = new Date(b.uploaded).getTime()
          return dateB - dateA
        })

        return uniqueItems
      },
      CACHE_DURATIONS.LONG,
    )

    const totalResults = searchResults.length
    const totalPages = Math.ceil(totalResults / perPage)

    const responseData = {
      server_time: new Date().toISOString().replace("T", " ").substring(0, 19),
      status: 200,
      msg: "OK",
      result: searchResults,
      total_results: totalResults,
      page: page,
      per_page: perPage,
      total_pages: totalPages,
    }

    return NextResponse.json<SearchApiResponse>(responseData, {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    })
  } catch (error) {
    console.error("Search API error:", error)
    return NextResponse.json<SearchApiResponse>(
      {
        server_time: new Date().toISOString().replace("T", " ").substring(0, 19),
        status: 500,
        msg: "Internal server error",
        result: [],
        total_results: 0,
        page: 1,
        per_page: 100,
        total_pages: 0,
      },
      { status: 500 },
    )
  }
}
