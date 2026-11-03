export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiMeta {
  page?: number;
  pageSize?: number;
  totalPages?: number;
  totalItems?: number;
  timestamp?: string;
  [key: string]: unknown;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiErrorPayload;
  meta?: ApiMeta;
}

export function ok<T>(data: T, meta?: ApiMeta): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
}

export function paginated<T>(
  items: T[],
  page: number,
  pageSize: number,
  totalItems: number,
  extraMeta?: Record<string, unknown>
): ApiResponse<T[]> {
  const totalPages = Math.ceil(totalItems / pageSize);
  return {
    success: true,
    data: items,
    meta: {
      page,
      pageSize,
      totalPages,
      totalItems,
      timestamp: new Date().toISOString(),
      ...extraMeta,
    },
  };
}

export function fail(code: string, message: string, details?: unknown): ApiResponse<never> {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
}

