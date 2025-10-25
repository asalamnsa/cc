interface HttpResponse {
  data: string
  status: number
  error?: string
}

export class ApiClient {
  private static readonly API_BASE_URL = "https://apifulzz.pages.dev"
  private static readonly REQUEST_TIMEOUT = 15000

  private static getUserAgent(): string {
    const userAgents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0",
      "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/121.0",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
    ]
    return userAgents[Math.floor(Math.random() * userAgents.length)]
  }

  private static getHeaders(): HeadersInit {
    return {
      Referer: this.API_BASE_URL,
      "User-Agent": this.getUserAgent(),
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "en-US,en;q=0.5",
      "Accept-Encoding": "gzip, deflate",
      Connection: "keep-alive",
    }
  }

  static async fetchFromApi(endpoint: string, params: Record<string, string | number> = {}): Promise<HttpResponse> {
    const url = new URL(endpoint, this.API_BASE_URL)

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value))
    })

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT)

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: this.getHeaders(),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.text()
      return {
        data,
        status: response.status,
      }
    } catch (error) {
      console.error(`API request failed for ${url.toString()}:`, error)
      return {
        data: "",
        status: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  static async fetchMultipleUrls(urls: string[]): Promise<Record<string, HttpResponse>> {
    const promises = urls.map(async (url) => {
      const response = await this.fetchFromApi(url)
      return [url, response] as const
    })

    const results = await Promise.allSettled(promises)
    const responses: Record<string, HttpResponse> = {}

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        const [url, response] = result.value
        responses[url] = response
      } else {
        responses[urls[index]] = {
          data: "",
          status: 0,
          error: result.reason?.message || "Request failed",
        }
      }
    })

    return responses
  }
}
