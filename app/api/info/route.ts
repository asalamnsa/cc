import { type NextRequest, NextResponse } from "next/server"
import { ApiClient } from "@/lib/api-client"
import { getCachedData, createCacheKey, CACHE_DURATIONS } from "@/lib/cache"
import { cleanTitle, generateETag, checkIfNoneMatch } from "@/lib/utils"

export const dynamic = "force-dynamic"
export const runtime = "edge"

interface InfoApiResponse {
  status: number
  result: Array<{
    filecode: string
    size: number
    status: number
    protected_embed: string
    uploaded: string
    last_view: string
    canplay: number
    protected_dl: string
    single_img: string
    title: string
    views: string
    length: number
    splash_img: string
    api_source: string
  }>
  server_time: string
  msg: string
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const fileCode = searchParams.get("file_code") || ""

    if (!fileCode || fileCode.trim() === "") {
      return NextResponse.json<InfoApiResponse>(
        {
          status: 400,
          result: [],
          server_time: new Date().toISOString().replace("T", " ").substring(0, 19),
          msg: "File code is required",
        },
        { status: 400 },
      )
    }

    const cacheKey = createCacheKey("video", fileCode)

    const videoDetails = await getCachedData(
      cacheKey,
      async () => {
        const response = await ApiClient.fetchFromApi("/api/info", {
          file_code: fileCode,
        })

        if (response.status !== 200 || !response.data) {
          console.error(`Failed to fetch video ${fileCode}. HTTP code: ${response.status}`)
          return null
        }

        try {
          const responseData = JSON.parse(response.data)

          if (!responseData.result || !Array.isArray(responseData.result) || responseData.result.length === 0) {
            return null
          }

          const snippet = responseData.result[0]

          let protectedDl = snippet.protected_dl || ""
          const apiSource = snippet.api_source || "lulustream"

          if (apiSource === "lulustream") {
            protectedDl = `https://lulustream.com/d/${fileCode}`
          } else if (apiSource === "doodapi" || apiSource === "doodstream") {
            protectedDl = `https://doodstream.com/d/${fileCode}`
          }

          return {
            filecode: snippet.filecode || fileCode,
            size: Number(snippet.size) || 0,
            status: snippet.status || 200,
            protected_embed: snippet.protected_embed || "",
            uploaded: snippet.uploaded || "",
            last_view: snippet.last_view || "",
            canplay: snippet.canplay || 1,
            protected_dl: protectedDl,
            single_img: snippet.single_img || "",
            title: cleanTitle(snippet.title || ""),
            views: String(snippet.views || "0"),
            length: Number(snippet.length) || 0,
            splash_img: snippet.splash_img || "",
            api_source: apiSource,
          }
        } catch (parseError) {
          console.error(`Failed to parse response for video ${fileCode}:`, parseError)
          return null
        }
      },
      CACHE_DURATIONS.LONG,
    )

    if (!videoDetails) {
      return NextResponse.json<InfoApiResponse>(
        {
          status: 404,
          result: [],
          server_time: new Date().toISOString().replace("T", " ").substring(0, 19),
          msg: "Video not found",
        },
        { status: 404 },
      )
    }

    const responseData = {
      status: 200,
      result: [videoDetails],
      server_time: new Date().toISOString().replace("T", " ").substring(0, 19),
      msg: "OK",
    }

    const etag = generateETag(responseData)
    const ifNoneMatch = request.headers.get("if-none-match")

    // Check if client has cached version
    if (checkIfNoneMatch(ifNoneMatch, etag)) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: etag,
          "Cache-Control": "public, max-age=60",
        },
      })
    }

    return NextResponse.json<InfoApiResponse>(responseData, {
      headers: {
        ETag: etag,
        "Cache-Control": "public, max-age=60",
      },
    })
  } catch (error) {
    console.error("Info API error:", error)
    return NextResponse.json<InfoApiResponse>(
      {
        status: 500,
        result: [],
        server_time: new Date().toISOString().replace("T", " ").substring(0, 19),
        msg: "Internal server error",
      },
      { status: 500 },
    )
  }
}
