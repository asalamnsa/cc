export interface VideoItem {
  title: string
  single_img: string
  splash_img: string
  file_code: string
  length: number
  views: number
  uploaded: string
  api_source: string
  relevance?: number
  download_url?: string
  cat?: string | null
  halaman?: number | null
}

export interface VideoDetails {
  canplay: number
  uploaded: string
  views: string
  title: string
  single_img: string
  protected_embed: string
  status: number
  filecode: string
  protected_dl: string
  splash_img: string
  last_view: string
  api_source: string
  size: number
  length: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
  cache_hit?: boolean
}

export interface SearchParams {
  q: string
  page?: number
}

export interface ListParams {
  page?: number
  per_page?: number
}
