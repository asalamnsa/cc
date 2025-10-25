import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cleanTitle(title: string): string {
  // Remove numbers
  title = title.replace(/[0-9]+/g, "")

  // Remove special characters except spaces
  title = title.replace(/[^a-zA-Z\s]+/g, " ")

  // Clean up multiple spaces
  title = title.trim().replace(/\s+/g, " ")

  // Convert to title case
  title = title.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())

  const words = title.split(" ").filter((word) => word.length > 0)

  // Add random words if title is too short
  if (words.length > 0 && words.length < 10) {
    const randomWords = [
      "Simontok",
      "Bokep31",
      "Bebasindo",
      "Bokepin",
      "Doodflix",
      "Bokepsatset",
      "Doodstream",
      "Dood Tele",
      "Cantik Tobrut",
      "Memeksiana",
      "Doods",
      "Vidio Viral",
      "Telegram",
      "Full Album",
      "Viral",
      "Videos",
      "Poophd",
      "Twitter",
      "Bochiel",
      "Asupan",
      "Link",
      "Streaming",
      "Web Bekeh",
      "Folder",
      "Cilbo",
      "Live",
      "Tele",
      "Terupdate",
      "Terbaru",
      "Links",
      "Lokal",
      "Dodstream",
      "Bokep",
      "Pemersatu",
      "Video",
      "Update",
      "Dood",
    ]

    const needed = 10 - words.length
    if (needed > 0) {
      const shuffled = [...randomWords]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const randomArray = new Uint32Array(1)
        crypto.getRandomValues(randomArray)
        const j = Math.floor((randomArray[0] / (0xffffffff + 1)) * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      words.push(...shuffled.slice(0, needed))
    }
  }

  return words.join(" ")
}

export function removeDuplicateItems<T extends { file_code?: string }>(items: T[]): T[] {
  const unique: T[] = []
  const seenFileCodes = new Set<string>()

  for (const item of items) {
    const fileCode = item.file_code
    if (fileCode && !seenFileCodes.has(fileCode)) {
      unique.push(item)
      seenFileCodes.add(fileCode)
    }
  }

  return unique
}

export function calculateRelevance(title: string, keywords: string[]): number {
  let relevance = 0
  const lowerTitle = title.toLowerCase()

  for (const keyword of keywords) {
    if (lowerTitle.includes(keyword.toLowerCase())) {
      relevance++
    }
  }

  return relevance
}

export function formatBytes(bytes: number, precision = 2): string {
  const units = ["B", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
  const maxBytes = Math.max(bytes, 0)
  const pow = Math.floor(maxBytes ? Math.log(maxBytes) / Math.log(1024) : 0)
  const unitIndex = Math.min(pow, units.length - 1)
  const size = maxBytes / Math.pow(1024, unitIndex)

  return `${size.toFixed(precision)} ${units[unitIndex]}`
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateETag(data: any): string {
  // Create a simple hash-based ETag from the data
  const content = typeof data === "string" ? data : JSON.stringify(data)
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return `"${Math.abs(hash).toString(36)}"`
}

export function checkIfNoneMatch(ifNoneMatch: string | null, etag: string): boolean {
  if (!ifNoneMatch) return false
  return ifNoneMatch === etag || ifNoneMatch === "*"
}
