/**
 * API Middleware Utilities
 * 
 * Provides reusable middleware functions for common API route patterns:
 * - Authentication
 * - Rate limiting
 * - Request validation
 * - Error handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { rateLimit, rateLimitConfigs, RateLimitResult } from '@/lib/rate-limit';
import { validateRequestBody, ValidationSchema } from '@/lib/input-validation';

/**
 * Standard API response types
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  [key: string]: any;
}

/**
 * Standard error response
 */
export function errorResponse(
  message: string,
  status: number = 500,
  additional?: Record<string, any>
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...additional,
    },
    { status }
  );
}

/**
 * Standard success response
 */
export function successResponse<T>(
  data: T,
  status: number = 200,
  additional?: Record<string, any>
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...additional,
    },
    { status }
  );
}

/**
 * Validation error response
 */
export function validationError(
  errors: string[],
  additional?: Record<string, any>
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: errors.join(', '),
      errors,
      ...additional,
    },
    { status: 400 }
  );
}

/**
 * Rate limit error response
 */
export function rateLimitError(
  rateLimitResult: RateLimitResult
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: rateLimitResult.message || '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
      remaining: rateLimitResult.remaining,
      resetTime: rateLimitResult.resetTime,
    },
    {
      status: 429,
      headers: {
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
      },
    }
  );
}

/**
 * Handler function type for authenticated routes
 */
export type AuthenticatedHandler<T = any> = (
  userId: string,
  request: NextRequest
) => Promise<NextResponse<ApiResponse<T>>>;

/**
 * Handler function type for routes with request body
 */
export type BodyHandler<TBody = any, TResponse = any> = (
  userId: string,
  body: TBody,
  request: NextRequest
) => Promise<NextResponse<ApiResponse<TResponse>>>;

/**
 * Wrapper for authenticated API routes
 * Automatically checks authentication and extracts userId
 */
export function withAuth<T = any>(
  handler: AuthenticatedHandler<T>
): (request: NextRequest) => Promise<NextResponse<ApiResponse<T>>> {
  return async (request: NextRequest) => {
    try {
      const { userId } = await auth();
      if (!userId) {
        return errorResponse('인증이 필요합니다.', 401);
      }
      return await handler(userId, request);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : '서버 오류가 발생했습니다.';
      return errorResponse(errorMessage, 500);
    }
  };
}

/**
 * Wrapper for authenticated routes with rate limiting
 */
export function withRateLimit<T = any>(
  handler: AuthenticatedHandler<T>,
  config = rateLimitConfigs.api
): (request: NextRequest) => Promise<NextResponse<ApiResponse<T>>> {
  return async (request: NextRequest) => {
    try {
      const rateLimitResult = await rateLimit(config)(request);
      if (!rateLimitResult.success) {
        return rateLimitError(rateLimitResult);
      }

      return await withAuth(handler)(request);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : '서버 오류가 발생했습니다.';
      return errorResponse(errorMessage, 500);
    }
  };
}

/**
 * Wrapper for routes that need request body validation
 */
export function withValidation<TBody = any, TResponse = any>(
  handler: BodyHandler<TBody, TResponse>,
  schema: ValidationSchema
): AuthenticatedHandler<TResponse> {
  return async (userId: string, request: NextRequest) => {
    try {
      const body = await request.json();
      const validation = validateRequestBody(body, schema);

      if (!validation.isValid) {
        return validationError(validation.errors);
      }

      return await handler(userId, validation.sanitizedData, request);
    } catch (error: unknown) {
      if (error instanceof SyntaxError) {
        return errorResponse('잘못된 요청 형식입니다.', 400);
      }
      const errorMessage =
        error instanceof Error ? error.message : '서버 오류가 발생했습니다.';
      return errorResponse(errorMessage, 500);
    }
  };
}

/**
 * Complete wrapper: Auth + Rate Limit + Validation
 */
export function withAuthRateLimitAndValidation<TBody = any, TResponse = any>(
  handler: BodyHandler<TBody, TResponse>,
  schema: ValidationSchema,
  rateLimitConfig = rateLimitConfigs.api
): (request: NextRequest) => Promise<NextResponse<ApiResponse<TResponse>>> {
  return withRateLimit(
    withValidation(handler, schema),
    rateLimitConfig
  );
}

/**
 * Helper to extract query parameters
 */
export function getQueryParams(request: NextRequest): URLSearchParams {
  return new URL(request.url).searchParams;
}

/**
 * Helper to get JSON body with error handling
 */
export async function getJsonBody<T = any>(
  request: NextRequest
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const data = await request.json();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      response: errorResponse('잘못된 요청 형식입니다.', 400),
    };
  }
}

