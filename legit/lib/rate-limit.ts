/**
 * Rate limiting utility for API endpoints
 */

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string; // Custom error message
  skipSuccessfulRequests?: boolean; // Skip rate limiting for successful requests
  skipFailedRequests?: boolean; // Skip rate limiting for failed requests
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
  message?: string;
}

/**
 * Rate limiting middleware for API routes
 */
export function rateLimit(
  options: RateLimitOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per 15 minutes
    message: 'Too many requests, please try again later.',
  }
) {
  return async (request: Request): Promise<RateLimitResult> => {
    const ip = getClientIP(request);
    const key = `${ip}:${request.url}`;
    const now = Date.now();

    // Clean up expired entries
    cleanupExpiredEntries(now);

    const entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetTime) {
      // First request or expired window
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + options.windowMs,
      });
      return {
        success: true,
        remaining: options.maxRequests - 1,
        resetTime: now + options.windowMs,
      };
    }

    // Increment counter
    entry.count++;

    if (entry.count > options.maxRequests) {
      return {
        success: false,
        remaining: 0,
        resetTime: entry.resetTime,
        message: options.message,
      };
    }

    return {
      success: true,
      remaining: options.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  };
}

/**
 * Get client IP address from request
 */
function getClientIP(request: Request): string {
  // Check various headers for IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');

  if (cfConnectingIP) return cfConnectingIP;
  if (forwarded) return forwarded.split(',')[0].trim();
  if (realIP) return realIP;

  // Fallback: use a default identifier (not ideal for production)
  return 'unknown';
}

/**
 * Clean up expired rate limit entries
 */
function cleanupExpiredEntries(now: number): void {
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Rate limiting configurations for different endpoints
 */
export const rateLimitConfigs = {
  // Strict rate limiting for authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    message: 'Too many authentication attempts, please try again later.',
  },

  // Moderate rate limiting for general API endpoints
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per 15 minutes
    message: 'Too many requests, please try again later.',
  },

  // Generous rate limiting for marketing content generation
  marketing: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 50, // 50 generations per hour
    message: 'Too many content generation requests, please try again later.',
  },
};
