import { type NextRequest, NextResponse } from "next/server"
import { ApiClient } from "@/lib/api-client"
import { getCachedData, createCacheKey, CACHE_DURATIONS } from "@/lib/cache"
import { cleanTitle, removeDuplicateItems } from "@/lib/utils"

interface ListApiResponse {
  msg: string
  server_time: string
  status: number
  result: {
    total_pages: number
    files: Array<{
      download_url: string
      api_source: string
      single_img: string
      file_code: string
      canplay: number
      length: string
      views: string
      uploaded: string
      public: string
      fld_id: string
      title: string
    }>
    results_total: string
    results: number
  }
}

export const dynamic = "force-dynamic"
  export const runtime = 'edge';
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const perPage = Number.parseInt(searchParams.get("per_page") || "20")

    if (page < 1) {
      return NextResponse.json<ListApiResponse>(
        {
          msg: "Page number must be greater than 0",
          server_time: new Date().toISOString().replace("T", " ").substring(0, 19),
          status: 400,
          result: {
            total_pages: 0,
            files: [],
            results_total: "0",
            results: 0,
          },
        },
        { status: 400 },
      )
    }

    const cacheKey = createCacheKey("list_files_v3", page, perPage)

    const listResult = await getCachedData(
      cacheKey,
      async () => {
        const response = await ApiClient.fetchFromApi("/api/list", {
          page: page,
          per_page: perPage,
        })

        if (response.status !== 200 || !response.data) {
          console.error(`Failed to fetch page ${page}. HTTP code: ${response.status}`)
          return {
            total_pages: 0,
            files: [],
            results_total: "0",
            results: 0,
          }
        }

        try {
          const responseData = JSON.parse(response.data)

          if (!responseData.result || !responseData.result.files || !Array.isArray(responseData.result.files)) {
            return {
              total_pages: 0,
              files: [],
              results_total: "0",
              results: 0,
            }
          }

          const files = responseData.result.files.map((item: any) => ({
            download_url: item.download_url || "",
            api_source: item.api_source || "doodstream",
            single_img: item.single_img || "",
            file_code: item.file_code || "",
            canplay: item.canplay || 1,
            length: String(item.length || ""),
            views: String(item.views || "1"),
            uploaded: item.uploaded || "",
            public: "1",
            fld_id: String(item.fld_id || "0"),
            title: cleanTitle(item.title || ""),
          }))

          const uniqueFiles = removeDuplicateItems(files)

          return {
            total_pages: responseData.result.total_pages || 1,
            files: uniqueFiles,
            results_total: String(uniqueFiles.length),
            results: uniqueFiles.length,
          }
        } catch (parseError) {
          console.error(`Failed to parse response for page ${page}:`, parseError)
          return {
            total_pages: 0,
            files: [],
            results_total: "0",
            results: 0,
          }
        }
      },
      CACHE_DURATIONS.MEDIUM,
    )

    const responseData = {
      msg: "OK",
      server_time: new Date().toISOString().replace("T", " ").substring(0, 19),
      status: 200,
      result: listResult,
    }

    return NextResponse.json<ListApiResponse>(responseData, {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    })
  } catch (error) {
    console.error("List API error:", error)
    return NextResponse.json<ListApiResponse>(
      {
        msg: "Internal server error",
        server_time: new Date().toISOString().replace("T", " ").substring(0, 19),
        status: 500,
        result: {
          total_pages: 0,
          files: [],
          results_total: "0",
          results: 0,
        },
      },
      { status: 500 },
    )
  }
}
