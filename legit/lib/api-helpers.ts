/**
 * API Helper Functions
 * 
 * Common utilities for API route handlers
 */

import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from './api-middleware';

/**
 * Extract user ID from request (with error handling)
 */
export async function getUserId(): Promise<string | null> {
  try {
    const { auth } = await import('@clerk/nextjs/server');
    const { userId } = await auth();
    return userId;
  } catch {
    return null;
  }
}

/**
 * Parse JSON body with error handling
 */
export async function parseJsonBody<T = any>(
  request: NextRequest
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const data = await request.json();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: '잘못된 JSON 형식입니다.',
    };
  }
}

/**
 * Get query parameters from request
 */
export function getQueryParams(request: NextRequest): URLSearchParams {
  return new URL(request.url).searchParams;
}

/**
 * Get single query parameter
 */
export function getQueryParam(
  request: NextRequest,
  key: string
): string | null {
  return getQueryParams(request).get(key);
}

/**
 * Get boolean query parameter
 */
export function getBooleanQueryParam(
  request: NextRequest,
  key: string,
  defaultValue: boolean = false
): boolean {
  const value = getQueryParam(request, key);
  if (value === null) return defaultValue;
  return value === 'true' || value === '1';
}

/**
 * Get number query parameter
 */
export function getNumberQueryParam(
  request: NextRequest,
  key: string
): number | null {
  const value = getQueryParam(request, key);
  if (value === null) return null;
  const num = Number(value);
  return isNaN(num) ? null : num;
}

/**
 * Standard error handler wrapper
 */
export function handleApiError(
  error: unknown,
  context?: string
): NextResponse<ApiResponse> {
  const errorMessage =
    error instanceof Error ? error.message : '서버 오류가 발생했습니다.';

  if (context && process.env.NODE_ENV === 'development') {
    console.error(`[${context}]`, error);
  }

  return NextResponse.json(
    {
      success: false,
      error: errorMessage,
    },
    { status: 500 }
  );
}

/**
 * Check if required fields are present
 */
export function validateRequiredFields<T extends Record<string, any>>(
  data: T,
  fields: (keyof T)[]
): { isValid: true } | { isValid: false; missing: string[] } {
  const missing = fields.filter((field) => {
    const value = data[field];
    return value === undefined || value === null || value === '';
  });

  if (missing.length > 0) {
    return {
      isValid: false,
      missing: missing.map((f) => String(f)),
    };
  }

  return { isValid: true };
}

/**
 * Create pagination metadata
 */
export function createPaginationMeta(
  page: number,
  pageSize: number,
  total: number
) {
  const totalPages = Math.ceil(total / pageSize);
  return {
    page,
    pageSize,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/**
 * Format paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  page: number,
  pageSize: number,
  total: number,
  additional?: Record<string, any>
): NextResponse<ApiResponse<{ items: T[]; pagination: ReturnType<typeof createPaginationMeta> }>> {
  return NextResponse.json({
    success: true,
    data: {
      items: data,
      pagination: createPaginationMeta(page, pageSize, total),
      ...additional,
    },
  });
}

