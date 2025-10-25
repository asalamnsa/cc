import { ValidationError } from "./errors"

export function validateSearchParams(q: string, page: number): void {
  if (!q || typeof q !== "string" || q.trim().length === 0) {
    throw new ValidationError("Search query is required and must be a non-empty string")
  }

  if (q.trim().length > 200) {
    throw new ValidationError("Search query must be less than 200 characters")
  }

  if (!Number.isInteger(page) || page < 1) {
    throw new ValidationError("Page must be a positive integer")
  }

  if (page > 1000) {
    throw new ValidationError("Page number cannot exceed 1000")
  }
}

export function validateListParams(page: number, perPage: number): void {
  if (!Number.isInteger(page) || page < 1) {
    throw new ValidationError("Page must be a positive integer")
  }

  if (page > 1000) {
    throw new ValidationError("Page number cannot exceed 1000")
  }

  if (!Number.isInteger(perPage) || perPage < 1 || perPage > 100) {
    throw new ValidationError("Per page must be between 1 and 100")
  }
}

export function validateVideoId(id: string): void {
  if (!id || typeof id !== "string" || id.trim().length === 0) {
    throw new ValidationError("Video ID is required and must be a non-empty string")
  }

  if (id.length > 50) {
    throw new ValidationError("Video ID must be less than 50 characters")
  }

  // Basic alphanumeric validation
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
    throw new ValidationError("Video ID contains invalid characters")
  }
}

export function validateRelatedParams(title: string, limit: number): void {
  if (!title || typeof title !== "string" || title.trim().length === 0) {
    throw new ValidationError("Title is required and must be a non-empty string")
  }

  if (title.length > 200) {
    throw new ValidationError("Title must be less than 200 characters")
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw new ValidationError("Limit must be between 1 and 50")
  }
}
