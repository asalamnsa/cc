export class AGCError extends Error {
  public readonly code: string
  public readonly statusCode: number

  constructor(message: string, code = "UNKNOWN_ERROR", statusCode = 500) {
    super(message)
    this.name = "AGCError"
    this.code = code
    this.statusCode = statusCode
  }
}

export class ValidationError extends AGCError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR", 400)
    this.name = "ValidationError"
  }
}

export class NotFoundError extends AGCError {
  constructor(message = "Resource not found") {
    super(message, "NOT_FOUND", 404)
    this.name = "NotFoundError"
  }
}

export class ExternalAPIError extends AGCError {
  constructor(message: string, statusCode = 502) {
    super(message, "EXTERNAL_API_ERROR", statusCode)
    this.name = "ExternalAPIError"
  }
}

export class CacheError extends AGCError {
  constructor(message: string) {
    super(message, "CACHE_ERROR", 500)
    this.name = "CacheError"
  }
}

export function handleAPIError(error: unknown): { message: string; code: string; statusCode: number } {
  if (error instanceof AGCError) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: "UNKNOWN_ERROR",
      statusCode: 500,
    }
  }

  return {
    message: "An unknown error occurred",
    code: "UNKNOWN_ERROR",
    statusCode: 500,
  }
}
