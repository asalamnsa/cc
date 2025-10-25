import { unstable_cache } from "next/cache"

export const CACHE_DURATIONS = {
  SHORT: 60, // 1 minute
  MEDIUM: 3600, // 1 hour
  LONG: 5184000, // 60 days
} as const

export function createCacheKey(prefix: string, ...params: (string | number)[]): string {
  return `${prefix}_${params.join("_")}`
}

export function getCachedData<T>(key: string, fetcher: () => Promise<T>, duration: number = CACHE_DURATIONS.MEDIUM) {
  return unstable_cache(
    async () => {
      try {
        return await fetcher()
      } catch (error) {
        console.error(`Cache fetch error for key ${key}:`, error)
        throw error
      }
    },
    [key],
    {
      revalidate: duration,
      tags: [key],
    },
  )()
}
