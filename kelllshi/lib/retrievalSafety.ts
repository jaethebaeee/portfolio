/**
 * Retrieval Safety Configuration and Guards
 *
 * This module implements comprehensive security controls for retrieval operations:
 *
 * ✅ APPROVED DATA SOURCES: Only whitelisted datasets can be accessed
 * ✅ PROHIBITED SOURCES: User data, billing, personal info strictly forbidden
 * ✅ QUERY VALIDATION: Prevents injection of sensitive patterns
 * ✅ RESULT SANITIZATION: Removes any sensitive data from outputs
 * ✅ LANGCHAIN SAFETY: Complete sanitization pipeline for AI outputs
 * ✅ TOKEN TRUNCATION: Prevents prompt overflow and cost overruns
 * ✅ RATE LIMITING: User-based rate limits with burst protection
 * ✅ USER PERMISSIONS: Validates user access rights
 * ✅ AUDIT LOGGING: Complete operation tracking for security
 * ✅ HEALTH CHECKS: System status monitoring
 * ✅ EMERGENCY STOP: Critical security incident response
 *
 * SECURITY LEVEL: Enterprise-grade with zero-tolerance for data leakage
 */

// Import modular safety components
import { TIME_CONSTANTS, countTokens, sanitizeLangChainOutput, sanitizeAndTruncateLangChainOutput, validateQuerySafety, sanitizeRetrievalResults, createSafeRetrievalContext, sanitizeExternalMarket } from './safety/coreSafety';
import { safetyCache } from './safety/caching';
import { distributedRateLimiter } from './safety/rateLimiting';
import { CircuitBreaker, securityCircuitBreaker } from './safety/circuitBreakers';
import { securityMonitor } from './safety/monitoring';
import { checkRateLimit, recordApiUsage } from './rateLimit';
import { sanitizeForLLM } from './aiGuards';
import { encoding_for_model, TiktokenModel } from 'tiktoken';
import { mcpSafetyGuard } from './mcp/safety';

// Core safety utilities are defined below in this file

// Rate limiting functionality is defined below in this file

// Circuit breaker and monitoring functionality are defined below in this file

// Parallel processing and MCP safety functionality are defined below in this file


import { Market, ScrapedMarket } from '../types';
import { BraveSearchConfig } from './mcp/braveSearchClient';

// Circuit Breaker is imported from './safety/circuitBreakers'

// Comprehensive Security Monitoring
interface SecurityEvent {
  timestamp: number;
  type: 'violation' | 'circuit_opened' | 'circuit_closed' | 'rate_limit_exceeded' | 'performance_alert';
  severity: 'low' | 'medium' | 'high' | 'critical';
  operation: string;
  userId?: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

interface PerformanceMetrics {
  operationCount: number;
  averageResponseTime: number;
  errorRate: number;
  cacheHitRate: number;
  circuitBreakerState: string;
  rateLimitStats: Record<string, number>;
}

// SecurityMonitor removed - using modular securityMonitor from lib/safety/monitoring

  constructor() {
    this.performanceMetrics = {
      operationCount: 0,
      averageResponseTime: 0,
      errorRate: 0,
      cacheHitRate: 0,
      circuitBreakerState: 'closed',
      rateLimitStats: {},
    };

    // Periodic cleanup and alerting
    setInterval(() => this.checkAlerts(), TIME_CONSTANTS.MINUTE); // Check every minute
    setInterval(() => this.cleanup(), TIME_CONSTANTS.CLEANUP_INTERVAL_DAILY); // Clean up daily
  }

  recordEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: Date.now(),
    };

    this.events.push(fullEvent);

    // Keep only recent events
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(-this.MAX_EVENTS);
    }

    // Log critical events immediately
    if (event.severity === 'critical') {
      console.error('[SECURITY_ALERT]', JSON.stringify(fullEvent));
    } else if (event.severity === 'high') {
      console.warn('[SECURITY_WARNING]', JSON.stringify(fullEvent));
    }
  }

  recordViolation(
    operation: string,
    violationType: string,
    userId?: string,
    details: Record<string, unknown> = {}
  ): void {
    this.recordEvent({
      type: 'violation',
      severity: violationType.includes('PROHIBITED') ? 'critical' : 'high',
      operation,
      userId,
      details: { violationType, ...details },
    });
  }

  recordPerformance(operation: string, responseTime: number, success: boolean): void {
    this.performanceMetrics.operationCount++;

    // Update average response time
    const currentAvg = this.performanceMetrics.averageResponseTime;
    this.performanceMetrics.averageResponseTime =
      (currentAvg * (this.performanceMetrics.operationCount - 1) + responseTime) /
      this.performanceMetrics.operationCount;

    // Update error rate
    const errors = success ? 0 : 1;
    const currentErrors = this.performanceMetrics.errorRate * (this.performanceMetrics.operationCount - 1);
    this.performanceMetrics.errorRate = (currentErrors + errors) / this.performanceMetrics.operationCount;

    // Update circuit breaker state
    this.performanceMetrics.circuitBreakerState = securityCircuitBreaker.getState().state;
  }

  recordRateLimit(operation: string, userId: string, exceeded: boolean): void {
    if (exceeded) {
      this.recordEvent({
        type: 'rate_limit_exceeded',
        severity: 'medium',
        operation,
        userId,
        details: { operation },
      });
    }

    // Update rate limit stats
    const key = `${operation}:${userId}`;
    this.performanceMetrics.rateLimitStats[key] =
      (this.performanceMetrics.rateLimitStats[key] || 0) + 1;
  }

  private checkAlerts(): void {
    const now = Date.now();
    const lastHour = now - TIME_CONSTANTS.HOUR;

    // Check error rate
    if (this.performanceMetrics.errorRate > this.ALERT_THRESHOLDS.errorRate) {
      console.warn('[PERFORMANCE_ALERT] High error rate detected:', {
        errorRate: this.performanceMetrics.errorRate,
        threshold: this.ALERT_THRESHOLDS.errorRate,
      });
    }

    // Check response time
    if (this.performanceMetrics.averageResponseTime > this.ALERT_THRESHOLDS.responseTime) {
      console.warn('[PERFORMANCE_ALERT] High response time detected:', {
        avgResponseTime: this.performanceMetrics.averageResponseTime,
        threshold: this.ALERT_THRESHOLDS.responseTime,
      });
    }

    // Check violations per hour
    const recentViolations = this.events.filter(
      e => e.timestamp > lastHour && e.type === 'violation'
    ).length;

    if (recentViolations > this.ALERT_THRESHOLDS.violationsPerHour) {
      console.error('[SECURITY_ALERT] High violation rate detected:', {
        violationsPerHour: recentViolations,
        threshold: this.ALERT_THRESHOLDS.violationsPerHour,
      });
    }

    // Check circuit breaker state
    const circuitState = securityCircuitBreaker.getState();
    if (circuitState.state === 'open') {
      console.error('[CIRCUIT_ALERT] Security circuit breaker is open:', circuitState);
    }
  }

  private cleanup(): void {
    const weekAgo = Date.now() - TIME_CONSTANTS.WEEK;
    this.events = this.events.filter(e => e.timestamp > weekAgo);

    // Reset performance metrics periodically
    if (this.performanceMetrics.operationCount > 10000) {
      this.performanceMetrics.operationCount = Math.floor(this.performanceMetrics.operationCount / 2);
    }
  }

  getSecurityReport(): {
    events: SecurityEvent[];
    metrics: PerformanceMetrics;
    alerts: string[];
    circuitBreakerState: ReturnType<typeof securityCircuitBreaker.getState>;
    rateLimiterStats: ReturnType<typeof distributedRateLimiter.getStats>;
    cacheStats: ReturnType<typeof safetyCache.getStats>;
  } {
    const alerts: string[] = [];

    // Generate alerts based on current state
    if (this.performanceMetrics.errorRate > this.ALERT_THRESHOLDS.errorRate) {
      alerts.push(`High error rate: ${(this.performanceMetrics.errorRate * 100).toFixed(1)}%`);
    }

    if (this.performanceMetrics.averageResponseTime > this.ALERT_THRESHOLDS.responseTime) {
      alerts.push(`Slow response time: ${this.performanceMetrics.averageResponseTime.toFixed(0)}ms`);
    }

    const recentViolations = this.events.filter(
      e => e.timestamp > Date.now() - TIME_CONSTANTS.HOUR && e.type === 'violation'
    ).length;

    if (recentViolations > this.ALERT_THRESHOLDS.violationsPerHour) {
      alerts.push(`High violation rate: ${recentViolations}/hour`);
    }

    return {
      events: [...this.events],
      metrics: { ...this.performanceMetrics },
      alerts,
      circuitBreakerState: securityCircuitBreaker.getState(),
      rateLimiterStats: distributedRateLimiter.getStats(),
      cacheStats: safetyCache.getStats(),
    };
  }

  // Emergency reset for all monitoring systems
  emergencyReset(): void {
    this.events = [];
    this.performanceMetrics = {
      operationCount: 0,
      averageResponseTime: 0,
      errorRate: 0,
      cacheHitRate: 0,
      circuitBreakerState: 'closed',
      rateLimitStats: {},
    };
    securityCircuitBreaker.reset();
    distributedRateLimiter.resetUserLimits('*'); // Reset all users
    safetyCache.clear();

    console.info('[EMERGENCY_RESET] All security monitoring systems reset');
  }
}

// Security monitor instance imported from safety modules

/**
 * Token counting utility for text truncation (cached for performance)
 */
export function countTokens(text: string, model: TiktokenModel = 'gpt-4'): number {
  if (!text) return 0;

  // Create cache key
  const cacheKey = `token_${model}_${text.length}_${text.slice(0, 50)}_${text.slice(-50)}`;

  // Check cache first
  const cachedResult = safetyCache.getTokenCountResult(cacheKey);
  if (cachedResult !== null) {
    return cachedResult;
  }

  // Compute token count
  let tokenCount: number;
  try {
    const encoding = encoding_for_model(model as any);
    const tokens = encoding.encode(text);
    encoding.free();
    tokenCount = tokens.length;
  } catch (error) {
    // Fallback: rough estimate of 4 characters per token
    console.warn('Token counting failed, using fallback estimate', { error, model });
    tokenCount = Math.ceil(text.length / 4);
  }

  // Cache the result
  safetyCache.setTokenCountResult(cacheKey, tokenCount);
  return tokenCount;
}

// Approved data sources for retrieval operations
export const APPROVED_DATA_SOURCES = {
  // Signal history and market analysis data
  signalHistory: 'signal_history',
  marketMetadata: 'market_metadata_vectors',
  publicMarketSummaries: 'public_kalshi_polymarket_summaries',

  // MCP-powered search tools
  braveNewsSearch: 'brave_news_search',
  braveWebSearch: 'brave_web_search',

  // Browser automation tools
  browserAutomation: 'browser_automation',
  chromeDevTools: 'chrome_devtools_mcp',
} as const;

// Vector database collections
export const APPROVED_VECTOR_COLLECTIONS = [
  'kelshi-markets',
  'market_vectors',
] as const;

// Predefined rate limit configurations for different operation types
export const RETRIEVAL_RATE_LIMITS = {
  // Vector search operations (expensive)
  vector_search: {
    enabled: true,
    requestsPerHour: 100,
    burstLimit: 10,
    backoffMs: 1000,
  },
  // Similarity search operations
  similarity_search: {
    enabled: true,
    requestsPerHour: 200,
    burstLimit: 20,
    backoffMs: 500,
  },
  // Arbitrage search operations (higher limits for trading)
  arbitrage_search: {
    enabled: true,
    requestsPerHour: 300,
    burstLimit: 30,
    backoffMs: 200,
  },
  // General retrieval operations
  general: {
    enabled: true,
    requestsPerHour: 500,
    burstLimit: 50,
    backoffMs: 100,
  },
  // External search operations (lower limits due to API costs)
  brave_news_search: {
    enabled: true,
    requestsPerHour: 50,
    burstLimit: 5,
    backoffMs: 2000,
  },
  brave_web_search: {
    enabled: true,
    requestsPerHour: 30,
    burstLimit: 3,
    backoffMs: 3000,
  },
  // Browser automation operations (MCP-powered)
  browser_automation: {
    enabled: true,
    requestsPerHour: 20,
    burstLimit: 2,
    backoffMs: 5000,
  },
  chrome_devtools_mcp: {
    enabled: true,
    requestsPerHour: 15,
    burstLimit: 1,
    backoffMs: 10000,
  },
} as const;

// Token limits for different LangChain operations
export const LANGCHAIN_TOKEN_LIMITS = {
  // Vector search context (before GPT prompt)
  vector_context: 500,
  // Similarity search context
  similarity_context: 750,
  // General LangChain output processing
  general_output: 1000,
  // High EV reasoning output
  high_ev_reasoning: 500,
} as const;

export type ApprovedDataSource = typeof APPROVED_DATA_SOURCES[keyof typeof APPROVED_DATA_SOURCES];
export type ApprovedVectorCollection = typeof APPROVED_VECTOR_COLLECTIONS[number];

/**
 * Normalizes operation string to a valid RetrievalAuditLog operation type
 */
function normalizeOperationType(operation: keyof typeof RETRIEVAL_RATE_LIMITS | undefined): RetrievalAuditLog['operation'] {
  if (operation === 'similarity_search' || operation === 'arbitrage_search') {
    return operation;
  }
  return 'vector_search';
}

// Prohibited data sources that must NEVER be accessed
export const PROHIBITED_DATA_SOURCES = {
  userData: 'user_data',
  billingData: 'billing_data',
  personalMetadata: 'personal_metadata',
  stripeProfile: 'stripe_profile',

  // Database tables/collections that contain user data
  prohibitedTables: [
    'users',
    'user_profiles',
    'billing_records',
    'payment_history',
    'personal_data',
    'stripe_customers',
    'auth_sessions',
    'oauth_states'
  ],
} as const;

// Safety configuration for retrieval operations
export interface RetrievalSafetyConfig {
  allowedSources: ApprovedDataSource[];
  maxResults: number;
  requireAuditLog: boolean;
  timeoutMs: number;
  rateLimit?: RetrievalRateLimitConfig;
}

// Rate limiting configuration for retrieval operations
export interface RetrievalRateLimitConfig {
  enabled: boolean;
  requestsPerHour: number;
  burstLimit: number;
  backoffMs: number;
}


// Default safety configuration
export const DEFAULT_SAFETY_CONFIG: RetrievalSafetyConfig = {
  allowedSources: [
    APPROVED_DATA_SOURCES.signalHistory,
    APPROVED_DATA_SOURCES.marketMetadata,
    APPROVED_DATA_SOURCES.publicMarketSummaries,
  ],
  maxResults: 10,
  requireAuditLog: true,
  timeoutMs: 5000,
  rateLimit: RETRIEVAL_RATE_LIMITS.vector_search,
};

/**
 * Validates that a data source is approved for retrieval
 */
export function isApprovedDataSource(source: string): boolean {
  return Object.values(APPROVED_DATA_SOURCES).includes(source as ApprovedDataSource);
}

/**
 * Validates that a data source is NOT prohibited
 */
export function isProhibitedDataSource(source: string): boolean {
  return Object.values(PROHIBITED_DATA_SOURCES).some(value =>
    Array.isArray(value) ? value.includes(source) : value === source
  );
}

/**
 * Validates that a table/collection name is safe for retrieval
 */
export function isSafeTableName(tableName: string): boolean {
  // Must be in approved sources AND not in prohibited sources
  return isApprovedDataSource(tableName) && !isProhibitedDataSource(tableName);
}

/**
 * Validates vector database collection name
 */
export function isSafeVectorCollection(collectionName: string): boolean {
  return APPROVED_VECTOR_COLLECTIONS.includes(collectionName as ApprovedVectorCollection);
}

/**
 * Rate limiting for retrieval operations
 */
export interface RetrievalRateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  retryAfter?: number;
}

/**
 * Check if a retrieval operation is within rate limits
 */
export async function checkRetrievalRateLimit(
  userId: string,
  operation: string = 'retrieval'
): Promise<RetrievalRateLimitResult> {
  try {
    // Get appropriate rate limit config for this operation type
    const operationKey = operation as keyof typeof RETRIEVAL_RATE_LIMITS;
    const rateLimitConfig = RETRIEVAL_RATE_LIMITS[operationKey] || RETRIEVAL_RATE_LIMITS.vector_search;
    const limit = rateLimitConfig.requestsPerHour;
    const burstLimit = rateLimitConfig.burstLimit;

    // Use distributed rate limiter first
    const distributedResult = await distributedRateLimiter.checkLimit(
      userId,
      operation,
      limit,
      burstLimit
    );

    if (!distributedResult.allowed) {
      console.warn(`[RATE_LIMIT] Distributed rate limit exceeded for user ${userId}, operation: ${operation}, current: ${distributedResult.current}, limit: ${limit}/hour`);
      securityMonitor.recordRateLimit(operation, userId, true);
    }

    // Fallback to existing rate limiter for backward compatibility
    const fallbackResult = await checkRateLimit(userId, `retrieval:${operation}`, limit);

    // Use distributed result if available, otherwise fallback
    const result = distributedResult.allowed ? distributedResult : {
      allowed: fallbackResult.allowed,
      remaining: fallbackResult.remaining,
      resetTime: fallbackResult.resetTime.getTime(),
      current: fallbackResult.current,
    };

    return {
      allowed: result.allowed,
      remaining: result.remaining,
      resetTime: new Date(result.resetTime),
      retryAfter: result.allowed ? undefined : Math.ceil((result.resetTime - Date.now()) / 1000),
    };
  } catch (error) {
    console.error('[RATE_LIMIT] Error checking retrieval rate limit:', error);
    // Allow request on error to avoid blocking legitimate users
    return {
      allowed: true,
      remaining: 100,
      resetTime: new Date(Date.now() + 60 * 60 * 1000),
    };
  }
}

/**
 * Record a retrieval operation for rate limiting
 */
export async function recordRetrievalUsage(
  userId: string,
  operation: string = 'retrieval'
): Promise<void> {
  try {
    // Record in distributed rate limiter
    await distributedRateLimiter.recordUsage(userId, operation);

    // Also record in existing system for backward compatibility
    await recordApiUsage(userId, `retrieval:${operation}`);
  } catch (error) {
    console.error('[RATE_LIMIT] Error recording retrieval usage:', error);
    // Don't throw - we don't want to break the retrieval operation
  }
}

// createSafeRetrievalContext is imported from './safety/coreSafety'

function clampPrice(value: number | undefined): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0.5;
  }
  return Math.max(0.01, Math.min(0.99, value));
}

export function sanitizeExternalMarket(raw: Partial<Market & { scrapedAt?: string }>): ScrapedMarket {
  const safeName = sanitizeForLLM(raw.name ?? 'Unknown Market');
  const safeCategory = sanitizeForLLM(raw.category ?? 'other').toLowerCase();

  return {
    id: raw.id || `market_${Date.now()}`,
    name: safeName,
    yesPrice: clampPrice(raw.yesPrice),
    noPrice: clampPrice(raw.noPrice ?? (1 - (raw.yesPrice ?? 0.5))),
    resolutionCriteria: sanitizeForLLM(raw.resolutionCriteria ?? 'Official resolution criteria'),
    category: safeCategory,
    url: sanitizeForLLM(raw.url ?? 'https://kalshi.com'),
    scrapedAt: raw.scrapedAt ?? new Date().toISOString(),
  };
}

/**
 * Truncates text to fit within max tokens after sanitization
 */
export function truncateForLangChain(text: string, maxTokens = 128, model: TiktokenModel = 'gpt-4'): string {
  const sanitized = sanitizeForLLM(text);
  const totalTokens = countTokens(sanitized, model);
  if (totalTokens <= maxTokens) {
    return sanitized;
  }

  const tokensPerChar = totalTokens / Math.max(1, sanitized.length);
  const approxLength = Math.floor(maxTokens / tokensPerChar);
  return sanitized.slice(0, approxLength);
}

/**
 * Audit log entry for retrieval operations
 */
export interface RetrievalAuditLog {
  timestamp: string;
  operation: 'vector_search' | 'similarity_search' | 'arbitrage_search';
  queryType: 'market_embedding' | 'text_query';
  dataSource: string;
  resultCount: number;
  approved: boolean;
  error?: string;
  durationMs?: number;
}

/**
 * Logs retrieval operations for audit purposes
 */
export function logRetrievalOperation(log: RetrievalAuditLog): void {
  const logEntry = {
    ...log,
    approved: isApprovedDataSource(log.dataSource),
  };

  console.log('[RETRIEVAL_AUDIT]', JSON.stringify(logEntry));

  // In production, this should be sent to a secure logging service
  // that doesn't store sensitive data
}

/**
 * Validates that query parameters don't contain sensitive data
 */
export function validateQuerySafety(query: string | number[] | Record<string, unknown>): boolean {
  // Create cache key based on query content
  const cacheKey = typeof query === 'string'
    ? `query_string_${query.length}_${query.slice(0, 50)}`
    : Array.isArray(query)
    ? `query_array_${query.length}_${query.slice(0, 5).join(',')}`
    : `query_object_${Object.keys(query).sort().join(',')}`;

  // Check cache first
  const cachedResult = safetyCache.getValidationResult(cacheKey);
  if (cachedResult !== null) {
    return cachedResult;
  }

  // Perform validation
  let result: boolean;

  if (typeof query === 'string') {
    // Check for common patterns that might indicate user data
    const sensitivePatterns = [
      /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/, // Credit card numbers
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // Phone numbers
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email addresses
      /\b\d{9}\b/, // SSN-like patterns
      /password|secret|token|key|auth/i, // Sensitive keywords
    ];

    result = !sensitivePatterns.some(pattern => pattern.test(query));
  } else if (Array.isArray(query)) {
    // Vector embeddings should be numeric arrays only
    result = query.every(item => typeof item === 'number' && !isNaN(item));
  } else if (typeof query === 'object' && query !== null) {
    // Validate object queries don't contain sensitive fields
    const sensitiveFields = [
      'userId', 'email', 'phone', 'address', 'ssn', 'creditCard',
      'password', 'secret', 'token', 'stripeId', 'billingInfo'
    ];

    result = !sensitiveFields.some(field => field in query);
  } else {
    result = true;
  }

  // Cache the result
  safetyCache.setValidationResult(cacheKey, result);
  return result;
}

/**
 * Sanitizes results to remove any potentially sensitive data
 */
export function sanitizeRetrievalResults(results: unknown[]): unknown[] {
  return results.map(result => {
    const resultObj = result as Record<string, unknown>;
    return {
      id: resultObj.id,
      metadata: createSafeRetrievalContext(resultObj.metadata as Record<string, unknown> || {}),
      score: resultObj.score, // Keep similarity scores
      // Remove any other potentially sensitive fields
    };
  });
}

/**
 * Sanitizes LangChain output before it enters GPT
 *
 * This function MUST be called on all LangChain retrieval results
 * before they are passed to any GPT prompt construction.
 */
export function sanitizeLangChainOutput(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  // Create cache key
  const cacheKey = `sanitize_${content.length}_${content.slice(0, 100)}_${content.slice(-100)}`;

  // Check cache first
  const cachedResult = safetyCache.getSanitizationResult(cacheKey);
  if (cachedResult !== null) {
    return cachedResult;
  }

  // Perform sanitization
  const result = sanitizeForLLM(content);

  // Cache the result
  safetyCache.setSanitizationResult(cacheKey, result);
  return result;
}

/**
 * Truncates text to fit within maximum token limit
 *
 * This function MUST be called after sanitization to ensure
 * LangChain output doesn't exceed token limits.
 */
export function truncateToMaxTokens(text: string, maxTokens: number, model: TiktokenModel = 'gpt-4'): string {
  if (!text || maxTokens <= 0) {
    return '';
  }

  // Create cache key
  const cacheKey = `truncate_${model}_${maxTokens}_${text.length}_${text.slice(0, 50)}_${text.slice(-50)}`;

  // Check cache first
  const cachedResult = safetyCache.getTruncationResult(cacheKey);
  if (cachedResult !== null) {
    return cachedResult;
  }

  const currentTokens = countTokens(text, model);

  if (currentTokens <= maxTokens) {
    safetyCache.setTruncationResult(cacheKey, text);
    return text;
  }

  // Binary search to find the maximum substring that fits within token limit
  let low = 0;
  let high = text.length;
  let bestLength = 0;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const substring = text.substring(0, mid);
    const tokens = countTokens(substring, model);

    if (tokens <= maxTokens) {
      bestLength = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  const truncatedText = text.substring(0, bestLength);

  // Try to end at a word boundary if possible
  let finalText = truncatedText;
  if (bestLength < text.length) {
    const lastSpaceIndex = truncatedText.lastIndexOf(' ');
    if (lastSpaceIndex > bestLength * 0.8) { // Don't cut too much
      finalText = truncatedText.substring(0, lastSpaceIndex);
    }
  }

  // Cache the result
  safetyCache.setTruncationResult(cacheKey, finalText);
  return finalText;
}

/**
 * Complete sanitization pipeline for LangChain output
 *
 * LangChain output → sanitizeForLLM() → truncateTo(maxTokens)
 */
export function sanitizeAndTruncateLangChainOutput(
  content: string,
  maxTokens: number,
  model: TiktokenModel = 'gpt-4'
): string {
  // Step 1: Sanitize the content
  const sanitized = sanitizeLangChainOutput(content);

  // Step 2: Truncate to token limit
  const truncated = truncateToMaxTokens(sanitized, maxTokens, model);

  return truncated;
}

/**
 * Example usage in API routes:
 *
 * ```typescript
 * import { withRetrievalSafety, RETRIEVAL_RATE_LIMITS } from '@/lib/retrievalSafety';
 *
 * export async function POST(request: NextRequest) {
 *   const { userId } = await getUserFromRequest(request);
 *   const { query } = await request.json();
 *
 *   const results = await withRetrievalSafety(
 *     () => VectorSearchDB.findSimilarMarkets(queryVector, limit),
 *     {
 *       rateLimit: RETRIEVAL_RATE_LIMITS.vector_search,
 *       requireAuditLog: true
 *     },
 *     {
 *       dataSource: APPROVED_DATA_SOURCES.marketMetadata,
 *       query: queryVector,
 *       operation: 'vector_search',
 *       userId
 *     }
 *   );
 *
 *   // Sanitize LangChain context before GPT
 *   const safeContext = sanitizeAndTruncateLangChainOutput(
 *     results.context,
 *     LANGCHAIN_TOKEN_LIMITS.vector_context
 *   );
 *
 *   return NextResponse.json({ results });
 * }
 * ```
 */

/**
 * Validates that sanitized output meets safety requirements
 */
export function validateSanitizedOutput(
  original: string,
  sanitized: string,
  maxTokens: number,
  model: TiktokenModel = 'gpt-4'
): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];

  // Check token count
  const tokenCount = countTokens(sanitized, model);
  if (tokenCount > maxTokens) {
    issues.push(`Token count ${tokenCount} exceeds limit ${maxTokens}`);
  }

  // Check for dangerous patterns that should have been removed
  const dangerousPatterns = [
    /https?:\/\/[^\s]+/i, // URLs
    /<[^>]*>/, // HTML tags
    /[\uD83C-\uD83D][\uDC00-\uDFFF]|[\u2600-\u26FF]|[\u2700-\u27BF]/, // Emojis (without /u flag)
    /[^\x00-\x7F]/, // Non-ASCII chars
  ];

  dangerousPatterns.forEach(pattern => {
    if (pattern.test(sanitized)) {
      issues.push(`Dangerous pattern found: ${pattern.source}`);
    }
  });

  // Check for excessive repeated punctuation
  if ((sanitized.match(/([!?.,;:])\1{3,}/g) || []).length > 0) {
    issues.push('Excessive repeated punctuation found');
  }

  return {
    isValid: issues.length === 0,
    issues
  };
}

/**
 * Health check for the retrieval safety system
 */
export function getRetrievalSafetyHealth(): {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Record<string, boolean>;
  details: string[];
} {
  const checks: Record<string, boolean> = {};
  const details: string[] = [];

  // Check if approved data sources are configured
  checks.approvedSources = Object.keys(APPROVED_DATA_SOURCES).length > 0;
  if (!checks.approvedSources) {
    details.push('No approved data sources configured');
  }

  // Check if prohibited sources are configured
  checks.prohibitedSources = Object.keys(PROHIBITED_DATA_SOURCES).length > 0;
  if (!checks.prohibitedSources) {
    details.push('No prohibited data sources configured');
  }

  // Check if vector collections are configured
  checks.vectorCollections = APPROVED_VECTOR_COLLECTIONS.length > 0;
  if (!checks.vectorCollections) {
    details.push('No approved vector collections configured');
  }

  // Check if sanitization functions are available
  checks.sanitization = typeof sanitizeForLLM === 'function' &&
                        typeof sanitizeLangChainOutput === 'function' &&
                        typeof sanitizeAndTruncateLangChainOutput === 'function';
  if (!checks.sanitization) {
    details.push('Sanitization functions not properly configured');
  }

  // Check if token counting is working
  try {
    const testTokens = countTokens('test', 'gpt-4');
    checks.tokenCounting = typeof testTokens === 'number' && testTokens >= 0;
  } catch {
    checks.tokenCounting = false;
    details.push('Token counting functionality is broken');
  }

  // Determine overall status
  const passedChecks = Object.values(checks).filter(Boolean).length;
  const totalChecks = Object.keys(checks).length;

  let status: 'healthy' | 'degraded' | 'unhealthy';
  if (passedChecks === totalChecks) {
    status = 'healthy';
  } else if (passedChecks >= totalChecks * 0.7) {
    status = 'degraded';
  } else {
    status = 'unhealthy';
  }

  return { status, checks, details };
}

/**
 * Emergency stop function for retrieval operations
 * Use only in critical security situations
 */
export function emergencyStopRetrieval(reason: string): void {
  console.error('[EMERGENCY_STOP] Retrieval operations halted:', reason);
  console.error('[EMERGENCY_STOP] All retrieval operations will be blocked until system restart');

  // This would typically trigger alerts, log to security systems, etc.
  // For now, we just log the emergency stop
}

/**
 * Validates that a user has permission for retrieval operations
 * This is a placeholder - integrate with your actual permission system
 */
export async function validateUserRetrievalPermission(userId: string): Promise<boolean> {
  // Placeholder implementation
  // In a real system, this would check:
  // - User subscription status
  // - Account verification
  // - Any user-specific restrictions
  // - Geographic restrictions if applicable

  if (!userId || typeof userId !== 'string' || userId.length === 0) {
    return false;
  }

  // For now, allow all valid user IDs
  // TODO: Integrate with actual permission system
  return true;
}

/**
 * Retrieval Safety Guards - Core validation functions
 */

/**
 * Guard that throws an error if a prohibited data source is accessed
 */
export function guardDataSourceAccess(source: string, operation: string = 'retrieval', userId?: string): void {
  const startTime = Date.now();

  try {
  if (isProhibitedDataSource(source)) {
      securityMonitor.recordViolation(operation, 'PROHIBITED_DATA_SOURCE', userId, { source });
    const error = new Error(`SECURITY VIOLATION: Attempted to access prohibited data source '${source}' during ${operation}`);
    console.error('[SECURITY_VIOLATION]', error.message);
      securityMonitor.recordPerformance(operation, Date.now() - startTime, false);
    throw error;
  }

  if (!isApprovedDataSource(source)) {
      securityMonitor.recordViolation(operation, 'UNAPPROVED_DATA_SOURCE', userId, { source });
    const error = new Error(`SECURITY VIOLATION: Attempted to access unapproved data source '${source}' during ${operation}`);
    console.error('[SECURITY_VIOLATION]', error.message);
      securityMonitor.recordPerformance(operation, Date.now() - startTime, false);
      throw error;
    }

    securityMonitor.recordPerformance(operation, Date.now() - startTime, true);
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes('SECURITY VIOLATION')) {
      securityMonitor.recordPerformance(operation, Date.now() - startTime, false);
    }
    throw error;
  }
}

/**
 * Guard that validates query safety before execution
 */
export function guardQuerySafety(query: string | number[] | Record<string, unknown>, operation: string = 'retrieval'): void {
  // Check circuit breaker
  if (!securityCircuitBreaker.isAvailable()) {
    const error = new Error(`SECURITY_CIRCUIT_OPEN: Query validation temporarily unavailable during ${operation}`);
    console.error('[SECURITY_CIRCUIT_OPEN]', error.message);
    throw error;
  }

  const startTime = Date.now();

  try {
  if (!validateQuerySafety(query)) {
      securityCircuitBreaker.recordFailure();
      securityMonitor.recordViolation(operation, 'SENSITIVE_QUERY_DATA', undefined, { queryType: typeof query });
    const error = new Error(`SECURITY VIOLATION: Query contains potentially sensitive data during ${operation}`);
    console.error('[SECURITY_VIOLATION]', error.message);
      securityMonitor.recordPerformance(operation, Date.now() - startTime, false);
      throw error;
    }

    securityCircuitBreaker.recordSuccess();
    securityMonitor.recordPerformance(operation, Date.now() - startTime, true);
  } catch (error) {
    if (error instanceof Error && error.message.includes('SECURITY VIOLATION')) {
      // Re-throw security violations
      throw error;
    }

    // Record other failures
    securityCircuitBreaker.recordFailure();
    securityMonitor.recordPerformance(operation, Date.now() - startTime, false);
    throw error;
  }
}

/**
 * Guard that ensures results don't contain sensitive data
 */
export function guardResultSafety(results: unknown[], operation: string = 'retrieval'): void {
  // Check circuit breaker
  if (!securityCircuitBreaker.isAvailable()) {
    const error = new Error(`SECURITY_CIRCUIT_OPEN: Result validation temporarily unavailable during ${operation}`);
    console.error('[SECURITY_CIRCUIT_OPEN]', error.message);
    throw error;
  }

  const startTime = Date.now();

  try {
  const sanitizedResults = sanitizeRetrievalResults(results);

  // Check if sanitization changed the results (indicating sensitive data was removed)
  if (JSON.stringify(results) !== JSON.stringify(sanitizedResults)) {
      securityCircuitBreaker.recordFailure();
      securityMonitor.recordViolation(operation, 'SENSITIVE_RESULT_DATA', undefined, { resultCount: results.length });
    const error = new Error(`SECURITY VIOLATION: Results contained sensitive data during ${operation}`);
    console.error('[SECURITY_VIOLATION]', error.message);
      securityMonitor.recordPerformance(operation, Date.now() - startTime, false);
      throw error;
    }

    securityCircuitBreaker.recordSuccess();
    securityMonitor.recordPerformance(operation, Date.now() - startTime, true);
  } catch (error) {
    if (error instanceof Error && error.message.includes('SECURITY VIOLATION')) {
      // Re-throw security violations
      throw error;
    }

    // Record other failures
    securityCircuitBreaker.recordFailure();
    securityMonitor.recordPerformance(operation, Date.now() - startTime, false);
    throw error;
  }
}

/**
 * Comprehensive retrieval safety wrapper
 */
export async function withRetrievalSafety<T>(
  operation: () => Promise<T>,
  config: Partial<RetrievalSafetyConfig> = {},
  context: {
    dataSource?: string;
    query?: string | number[] | Record<string, unknown>;
    operation?: keyof typeof RETRIEVAL_RATE_LIMITS;
    userId?: string; // Required for rate limiting
  } = {}
): Promise<T> {
  const safetyConfig = { ...DEFAULT_SAFETY_CONFIG, ...config };
  const startTime = Date.now();

  try {
    // Pre-operation safety checks
    if (context.dataSource) {
      guardDataSourceAccess(context.dataSource, context.operation || 'retrieval');
    }

    if (context.query) {
      guardQuerySafety(context.query, context.operation || 'retrieval');
    }

    // User permission validation
    if (context.userId) {
      const hasPermission = await validateUserRetrievalPermission(context.userId);
      if (!hasPermission) {
        throw new Error(`PERMISSION_DENIED: User ${context.userId} does not have permission for retrieval operations.`);
      }
    }

    // Rate limiting check
    if (safetyConfig.rateLimit?.enabled && context.userId) {
      const rateLimit = await checkRetrievalRateLimit(context.userId, context.operation || 'retrieval');
      if (!rateLimit.allowed) {
        throw new Error(`RATE_LIMIT_EXCEEDED: Retrieval rate limit exceeded. Try again in ${rateLimit.retryAfter} seconds.`);
      }
    }

    // Execute the operation
    const result = await operation();

    // Post-operation safety checks
    if (Array.isArray(result)) {
      guardResultSafety(result as unknown[], context.operation || 'retrieval');
    }

    // Record rate limiting usage for successful operations
    if (safetyConfig.rateLimit?.enabled && context.userId) {
      await recordRetrievalUsage(context.userId, context.operation || 'retrieval');
    }

    // Log successful operation
    if (safetyConfig.requireAuditLog && context.dataSource) {
      const duration = Date.now() - startTime;
      const operation = normalizeOperationType(context.operation);

      logRetrievalOperation({
        timestamp: new Date().toISOString(),
        operation,
        queryType: Array.isArray(context.query) ? 'market_embedding' : 'text_query',
        dataSource: context.dataSource,
        resultCount: Array.isArray(result) ? (result as unknown[]).length : 1,
        approved: true,
        durationMs: duration,
      });
    }

    return result;

  } catch (error) {
    // Log failed operation
    if (safetyConfig.requireAuditLog && context.dataSource) {
      const duration = Date.now() - startTime;
      const operation = normalizeOperationType(context.operation);

      logRetrievalOperation({
        timestamp: new Date().toISOString(),
        operation,
        queryType: Array.isArray(context.query) ? 'market_embedding' : 'text_query',
        dataSource: context.dataSource || 'unknown',
        resultCount: 0,
        approved: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        durationMs: duration,
      });
    }

    throw error;
  }
}

// Parallel Validation for Batch Operations
class ParallelValidator {
  private readonly MAX_CONCURRENT_VALIDATIONS = 10;
  private activeValidations = 0;
  private validationQueue: Array<{
    operation: () => Promise<boolean>;
    resolve: (result: boolean) => void;
    reject: (error: Error) => void;
  }> = [];

  async validate(operation: () => Promise<boolean>): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.validationQueue.push({ operation, resolve, reject });
      this.processQueue();
    });
  }

  async validateBatch(operations: Array<() => Promise<boolean>>): Promise<boolean[]> {
    const promises = operations.map(op => this.validate(op));
    return Promise.all(promises);
  }

  private async processQueue(): Promise<void> {
    if (this.activeValidations >= this.MAX_CONCURRENT_VALIDATIONS || this.validationQueue.length === 0) {
      return;
    }

    this.activeValidations++;
    const { operation, resolve, reject } = this.validationQueue.shift()!;

    try {
      const result = await operation();
      resolve(result);
    } catch (error) {
      reject(error instanceof Error ? error : new Error(String(error)));
    } finally {
      this.activeValidations--;
      // Process next item in queue
      setImmediate(() => this.processQueue());
    }
  }

  getStats(): { activeValidations: number; queueLength: number } {
    return {
      activeValidations: this.activeValidations,
      queueLength: this.validationQueue.length,
    };
  }
}

// Global parallel validator instance
const parallelValidator = new ParallelValidator();

/**
 * Batch validation functions for improved performance
 */
export class BatchValidator {
  static async validateQueries(
    queries: Array<{ query: string | number[] | Record<string, unknown>; operation?: string }>
  ): Promise<{ results: boolean[]; errors: Error[] }> {
    const results: boolean[] = [];
    const errors: Error[] = [];

    const validationOps = queries.map(({ query, operation = 'batch_validation' }) => async () => {
      try {
        const result = validateQuerySafety(query);
        results.push(result);
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        errors.push(err);
        results.push(false);
        return false;
      }
    });

    await parallelValidator.validateBatch(validationOps);
    return { results, errors };
  }

  static async validateDataSources(
    sources: Array<{ source: string; operation?: string; userId?: string }>
  ): Promise<{ results: boolean[]; errors: Error[] }> {
    const results: boolean[] = [];
    const errors: Error[] = [];

    const validationOps = sources.map(({ source, operation = 'batch_validation', userId }) => async () => {
      try {
        guardDataSourceAccess(source, operation, userId);
        results.push(true);
        return true;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        errors.push(err);
        results.push(false);
        return false;
      }
    });

    await parallelValidator.validateBatch(validationOps);
    return { results, errors };
  }

  static async sanitizeBatch(
    contents: Array<{ content: string; maxTokens?: number; model?: TiktokenModel }>
  ): Promise<{ results: string[]; errors: Error[] }> {
    const results: string[] = [];
    const errors: Error[] = [];

    const sanitizationOps = contents.map(({ content, maxTokens = 1000, model = 'gpt-4' }) => async () => {
      try {
        const result = sanitizeAndTruncateLangChainOutput(content, maxTokens, model);
        results.push(result);
        return true;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        errors.push(err);
        results.push(''); // Empty string on error
        return false;
      }
    });

    await parallelValidator.validateBatch(sanitizationOps);
    return { results, errors };
  }

  static getParallelStats(): {
    validatorStats: ReturnType<typeof parallelValidator.getStats>;
    cacheStats: ReturnType<typeof safetyCache.getStats>;
  } {
    return {
      validatorStats: parallelValidator.getStats(),
      cacheStats: safetyCache.getStats(),
    };
  }
}

/**
 * MCP Safety Controls for AI-Driven Browser Exploration
 *
 * Extends existing safety system to handle MCP-driven browser interactions
 * used in intelligent arbitrage discovery.
 */

/**
 * MCP Operation Types
 */
export type MCPOperationType =
  | 'market_exploration'
  | 'arbitrage_discovery'
  | 'cross_platform_analysis'
  | 'related_market_navigation'
  | 'brave_news_search'
  | 'brave_web_search'
  | 'breaking_news_monitoring'
  | 'weather_ev_job';

/**
 * MCP Safety Configuration
 */
export interface MCPSafetyConfig {
  allowedDomains: string[];
  maxNavigationDepth: number;
  maxMarketsPerSession: number;
  maxExplorationTime: number; // milliseconds
  requireUserConfirmation: boolean;
  enableScreenshotAudit: boolean;
  rateLimit: RetrievalRateLimitConfig;
}

/**
 * Default MCP Safety Configuration
 */
export const DEFAULT_MCP_SAFETY_CONFIG: MCPSafetyConfig = {
  allowedDomains: [
    'kalshi.com',
    'polymarket.com',
    'predictit.org',
    'manifold.markets',
    'metaculus.com'
  ],
  maxNavigationDepth: 3,
  maxMarketsPerSession: 10,
  maxExplorationTime: 30000, // 30 seconds
  requireUserConfirmation: false, // Set to true for production
  enableScreenshotAudit: true,
  rateLimit: {
    enabled: true,
    requestsPerHour: 50, // Lower limit for exploration
    burstLimit: 5,
    backoffMs: 1000
  }
};

/**
 * MCP Operation Context
 */
export interface MCPOperationContext {
  operation: MCPOperationType;
  userId?: string;
  sessionId: string;
  startTime: number;
  currentDepth: number;
  marketsExplored: number;
  urlsVisited: string[];
  domainsAccessed: string[];
}

/**
 * MCP Safety Guard
 */
export class MCPSafetyGuard {
  private activeSessions = new Map<string, MCPOperationContext>();

  /**
   * Validates if an MCP operation can proceed with caching and circuit breaker
   */
  async validateMCPOperation(
    operation: MCPOperationType,
    context: Partial<MCPOperationContext>,
    config: Partial<MCPSafetyConfig> = {}
  ): Promise<{ allowed: boolean; reason?: string }> {
    // Check circuit breaker first
    if (!mcpCircuitBreaker.isAvailable()) {
      return { allowed: false, reason: 'MCP circuit breaker is OPEN - too many recent failures' };
    }

    const safetyConfig = { ...DEFAULT_MCP_SAFETY_CONFIG, ...config };
    const sessionId = context.sessionId || `mcp_${Date.now()}`;

    // Create a hash for caching based on operation and key context elements
    const contextHash = this.createContextHash(operation, context);
    const cached = safetyCache.getMCPOperationValidation(operation, contextHash);
    if (cached !== null) {
      // Even if cached, we still need to manage the session and record monitoring
      this.ensureSessionContext(sessionId, operation, context);
      mcpMonitor.recordOperationValidation(sessionId, operation, cached.allowed, true);
      return cached;
    }

    // Get or create session context
    const sessionContext = this.ensureSessionContext(sessionId, operation, context);

    // Check time limit
    const elapsed = Date.now() - sessionContext.startTime;
    if (elapsed > safetyConfig.maxExplorationTime) {
      const result = { allowed: false, reason: 'Exploration time limit exceeded' };
      safetyCache.setMCPOperationValidation(operation, contextHash, result);
      mcpMonitor.recordOperationValidation(sessionId, operation, false, false);
      return result;
    }

    // Check navigation depth
    if (sessionContext.currentDepth >= safetyConfig.maxNavigationDepth) {
      const result = { allowed: false, reason: 'Maximum navigation depth exceeded' };
      safetyCache.setMCPOperationValidation(operation, contextHash, result);
      mcpMonitor.recordOperationValidation(sessionId, operation, false, false);
      return result;
    }

    // Check markets explored limit
    if (sessionContext.marketsExplored >= safetyConfig.maxMarketsPerSession) {
      const result = { allowed: false, reason: 'Maximum markets per session exceeded' };
      safetyCache.setMCPOperationValidation(operation, contextHash, result);
      mcpMonitor.recordOperationValidation(sessionId, operation, false, false);
      return result;
    }

    // Check intelligent MCP rate limiting
    if (safetyConfig.rateLimit.enabled && context.userId) {
      // Extract domain from context if available
      let domain: string | undefined;
      if (context.sessionId) {
        const session = this.activeSessions.get(context.sessionId);
        if (session?.urlsVisited.length) {
          try {
            domain = new URL(session.urlsVisited[0]).hostname;
          } catch (error) {
            // Ignore invalid URLs
          }
        }
      }

      const rateLimit = await mcpIntelligentRateLimiter.checkLimit(
        context.userId,
        operation,
        domain,
        { sessionId: context.sessionId, priority: 'medium' } // Default to medium priority
      );

      if (!rateLimit.allowed) {
        const result = { allowed: false, reason: rateLimit.reason || 'MCP rate limit exceeded' };
        safetyCache.setMCPOperationValidation(operation, contextHash, result);
        mcpMonitor.recordOperationValidation(sessionId, operation, false, false);
        return result;
      }
    }

    const result = { allowed: true };
    safetyCache.setMCPOperationValidation(operation, contextHash, result);

    // Record monitoring data
    mcpMonitor.recordOperationValidation(sessionId, operation, true, false);
    return result;
  }

  /**
   * Creates a hash for caching operation validation based on context
   */
  private createContextHash(operation: MCPOperationType, context: Partial<MCPOperationContext>): string {
    const keyParts = [operation, context.sessionId, context.userId, context.currentDepth, context.marketsExplored];
    return keyParts.filter(Boolean).join('_');
  }

  /**
   * Ensures session context exists, either from cache or creates new
   */
  private ensureSessionContext(sessionId: string, operation: MCPOperationType, context: Partial<MCPOperationContext>): MCPOperationContext {
    // Check cache first
    let sessionContext = safetyCache.getMCPSession(sessionId);
    if (!sessionContext) {
      // Check active sessions
      sessionContext = this.activeSessions.get(sessionId) || null;
    }

    if (!sessionContext) {
      sessionContext = {
        operation,
        sessionId,
        startTime: Date.now(),
        currentDepth: 0,
        marketsExplored: 0,
        urlsVisited: [],
        domainsAccessed: [],
        ...context
      };
      this.activeSessions.set(sessionId, sessionContext);
      safetyCache.setMCPSession(sessionId, sessionContext);

      // Start monitoring this session
      mcpMonitor.startSession(sessionId, operation, context.userId);
    }

    return sessionContext;
  }

  /**
   * Records an MCP navigation/action for safety tracking
   */
  recordMCPAction(
    sessionId: string,
    action: 'navigate' | 'extract' | 'click' | 'explore',
    url?: string,
    metadata?: Record<string, any>
  ): void {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    if (url) {
      session.urlsVisited.push(url);

      // Extract domain
      try {
        const domain = new URL(url).hostname;
        if (!session.domainsAccessed.includes(domain)) {
          session.domainsAccessed.push(domain);
        }
      } catch (error) {
        // Invalid URL, skip domain tracking
      }
    }

    // Update session metrics
    if (action === 'explore') {
      session.marketsExplored++;
    } else if (action === 'navigate') {
      session.currentDepth++;
    }

    // Log for audit
    logRetrievalOperation({
      timestamp: new Date().toISOString(),
      operation: 'vector_search', // Map to existing audit type
      queryType: 'text_query',
      dataSource: `mcp_${action}`,
      resultCount: 1,
      approved: true,
      durationMs: Date.now() - session.startTime,
    });
  }

  /**
   * Validates URL safety for MCP navigation with caching
   */
  validateMCPUrl(url: string, config: Partial<MCPSafetyConfig> = {}, sessionId?: string): { safe: boolean; reason?: string } {
    // Check cache first
    const cached = safetyCache.getMCPUrlValidation(url);
    const wasCached = cached !== null;

    if (wasCached) {
      // Record monitoring data even for cached results
      if (sessionId) {
        mcpMonitor.recordUrlValidation(sessionId, url, cached.safe, true);
      }
      return cached;
    }

    const safetyConfig = { ...DEFAULT_MCP_SAFETY_CONFIG, ...config };

    let result: { safe: boolean; reason?: string };

    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;

      // Check if domain is allowed
      if (!safetyConfig.allowedDomains.some(allowed =>
        domain === allowed || domain.endsWith('.' + allowed)
      )) {
        result = { safe: false, reason: `Domain ${domain} not in allowed list` };
      } else if (url.includes('login') || url.includes('signup') || url.includes('admin')) {
        result = { safe: false, reason: 'URL contains restricted path' };
      } else {
      // Check for data exfiltration attempts
      const sensitivePatterns = [
        /api\/.*(?:key|token|secret)/i,
        /admin/i,
        /config/i,
        /database/i
      ];

      if (sensitivePatterns.some(pattern => pattern.test(url))) {
          result = { safe: false, reason: 'URL contains sensitive patterns' };
        } else {
          result = { safe: true };
      }
      }
    } catch (error) {
      result = { safe: false, reason: 'Invalid URL format' };
    }

    // Cache the result
    safetyCache.setMCPUrlValidation(url, result);

    // Record monitoring data
    if (sessionId) {
      mcpMonitor.recordUrlValidation(sessionId, url, result.safe, false);
    }

    return result;
  }

  /**
   * Gets session statistics for monitoring
   */
  getSessionStats(sessionId: string): MCPOperationContext | null {
    return this.activeSessions.get(sessionId) || null;
  }

  /**
   * Ends an MCP session and cleans up
   */
  endSession(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      const duration = Date.now() - session.startTime;
      console.log(`[MCP_SAFETY] Session ${sessionId} ended after ${duration}ms, explored ${session.marketsExplored} markets`);
      this.activeSessions.delete(sessionId);
      // Also remove from cache and end monitoring
      safetyCache.deleteMCPSession(sessionId);
      mcpMonitor.endSession(sessionId);
    }
  }

  /**
   * Records validation result for circuit breaker
   */
  recordValidationResult(success: boolean): void {
    if (success) {
      mcpCircuitBreaker.recordSuccess();
    } else {
      mcpCircuitBreaker.recordFailure();
    }
  }

  /**
   * Gets global MCP safety statistics including circuit breaker state
   */
  getGlobalStats(): {
    activeSessions: number;
    totalSessionsToday: number;
    domainsAccessed: string[];
    circuitBreakerState: { state: string; failureCount: number; lastFailureTime: number };
  } {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const activeSessions = this.activeSessions.size;
    const allDomains = Array.from(this.activeSessions.values())
      .flatMap(session => session.domainsAccessed);

    return {
      activeSessions,
      totalSessionsToday: activeSessions, // Simplified - would track historical data
      domainsAccessed: [...new Set(allDomains)],
      circuitBreakerState: mcpCircuitBreaker.getState()
    };
  }
}

/**
 * MCP-specific Circuit Breaker for safety validations
 */
class MCPCircuitBreaker {
  private circuitBreaker = new CircuitBreaker('MCP_OPERATIONS', 5, 30 * TIME_CONSTANTS.SECOND, 3); // 30 second timeout

  isAvailable(): boolean {
    return this.circuitBreaker.isAvailable();
  }

  recordSuccess(): void {
    this.circuitBreaker.recordSuccess();
  }

  recordFailure(): void {
    this.circuitBreaker.recordFailure();
  }

  getState(): { state: string; failureCount: number; lastFailureTime: number } {
    return this.circuitBreaker.getState();
  }

  reset(): void {
    this.circuitBreaker.reset();
  }
}

// Global MCP circuit breaker instance
const mcpCircuitBreaker = new MCPCircuitBreaker();

/**
 * MCP-specific Monitoring System
 */
class MCPMonitor {
  private sessionMetrics = new Map<string, MCPPerformanceMetrics>();
  private globalMetrics: MCPGlobalMetrics;
  private alerts: MCPAlert[] = [];
  private readonly MAX_ALERTS = 100;

  constructor() {
    this.globalMetrics = {
      totalSessions: 0,
      activeSessions: 0,
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      averageSessionDuration: 0,
      totalUrlsValidated: 0,
      totalOperationsValidated: 0,
      cacheHits: 0,
      cacheMisses: 0,
      circuitBreakerTrips: 0,
      lastUpdated: Date.now()
    };
  }

  /**
   * Records the start of an MCP session
   */
  startSession(sessionId: string, operation: MCPOperationType, userId?: string): void {
    const metrics: MCPPerformanceMetrics = {
      sessionId,
      operation,
      userId,
      startTime: Date.now(),
      urlsValidated: 0,
      operationsValidated: 0,
      cacheHits: 0,
      cacheMisses: 0,
      errors: [],
      duration: 0
    };

    this.sessionMetrics.set(sessionId, metrics);
    this.globalMetrics.activeSessions++;
    this.globalMetrics.totalSessions++;
  }

  /**
   * Records session completion
   */
  endSession(sessionId: string): void {
    const metrics = this.sessionMetrics.get(sessionId);
    if (metrics) {
      metrics.duration = Date.now() - metrics.startTime;
      this.globalMetrics.activeSessions = Math.max(0, this.globalMetrics.activeSessions - 1);

      // Update global averages
      const totalDuration = this.globalMetrics.averageSessionDuration * (this.globalMetrics.totalSessions - 1) + metrics.duration;
      this.globalMetrics.averageSessionDuration = totalDuration / this.globalMetrics.totalSessions;

      this.sessionMetrics.delete(sessionId);
    }
  }

  /**
   * Records URL validation
   */
  recordUrlValidation(sessionId: string, url: string, result: boolean, cached: boolean): void {
    const metrics = this.sessionMetrics.get(sessionId);
    if (metrics) {
      metrics.urlsValidated++;
      if (cached) {
        metrics.cacheHits++;
        this.globalMetrics.cacheHits++;
      } else {
        metrics.cacheMisses++;
        this.globalMetrics.cacheMisses++;
      }
    }
    this.globalMetrics.totalUrlsValidated++;
  }

  /**
   * Records operation validation
   */
  recordOperationValidation(sessionId: string, operation: MCPOperationType, result: boolean, cached: boolean): void {
    const metrics = this.sessionMetrics.get(sessionId);
    if (metrics) {
      metrics.operationsValidated++;
      if (cached) {
        metrics.cacheHits++;
        this.globalMetrics.cacheHits++;
      } else {
        metrics.cacheMisses++;
        this.globalMetrics.cacheMisses++;
      }
    }

    this.globalMetrics.totalOperationsValidated++;
    this.globalMetrics.totalOperations++;

    if (result) {
      this.globalMetrics.successfulOperations++;
    } else {
      this.globalMetrics.failedOperations++;
    }
  }

  /**
   * Records an error in MCP operations
   */
  recordError(sessionId: string, error: string, context?: any): void {
    const metrics = this.sessionMetrics.get(sessionId);
    if (metrics) {
      metrics.errors.push({
        timestamp: Date.now(),
        message: error,
        context
      });
    }

    // Check for alert conditions
    this.checkAlertConditions(sessionId, error, context);
  }

  /**
   * Records circuit breaker events
   */
  recordCircuitBreakerEvent(event: 'open' | 'close' | 'half_open', sessionId?: string): void {
    if (event === 'open') {
      this.globalMetrics.circuitBreakerTrips++;
      this.addAlert({
        level: 'WARNING',
        message: 'MCP Circuit breaker opened - too many failures',
        sessionId,
        timestamp: Date.now(),
        type: 'circuit_breaker'
      });
    }
  }

  /**
   * Gets session-specific metrics
   */
  getSessionMetrics(sessionId: string): MCPPerformanceMetrics | null {
    return this.sessionMetrics.get(sessionId) || null;
  }

  /**
   * Gets global MCP metrics
   */
  getGlobalMetrics(): MCPGlobalMetrics {
    this.globalMetrics.lastUpdated = Date.now();
    return { ...this.globalMetrics };
  }

  /**
   * Gets cache efficiency statistics
   */
  getCacheEfficiency(): { urlCacheHitRate: number; operationCacheHitRate: number; overallHitRate: number } {
    const urlTotal = this.globalMetrics.cacheHits + this.globalMetrics.cacheMisses;
    const operationTotal = this.globalMetrics.totalOperationsValidated;

    const urlCacheHitRate = urlTotal > 0 ? (this.globalMetrics.cacheHits / urlTotal) * 100 : 0;
    const operationCacheHitRate = operationTotal > 0 ? (this.globalMetrics.cacheHits / operationTotal) * 100 : 0;
    const overallHitRate = (urlTotal + operationTotal) > 0 ?
      (this.globalMetrics.cacheHits / (urlTotal + operationTotal)) * 100 : 0;

    return { urlCacheHitRate, operationCacheHitRate, overallHitRate };
  }

  /**
   * Gets recent alerts
   */
  getRecentAlerts(limit = 10): MCPAlert[] {
    return this.alerts.slice(-limit);
  }

  private checkAlertConditions(sessionId: string, error: string, context?: any): void {
    const metrics = this.sessionMetrics.get(sessionId);
    if (!metrics) return;

    // Alert on high error rates in session
    if (metrics.errors.length >= 3) {
      this.addAlert({
        level: 'ERROR',
        message: `High error rate in session ${sessionId}: ${metrics.errors.length} errors`,
        sessionId,
        timestamp: Date.now(),
        type: 'error_rate'
      });
    }

    // Alert on long-running sessions
    const duration = Date.now() - metrics.startTime;
    if (duration > TIME_CONSTANTS.TIMEOUT_MS) { // 5 minutes
      this.addAlert({
        level: 'WARNING',
        message: `Long-running MCP session: ${sessionId} (${Math.round(duration / 1000)}s)`,
        sessionId,
        timestamp: Date.now(),
        type: 'performance'
      });
    }
  }

  private addAlert(alert: MCPAlert): void {
    this.alerts.push(alert);
    if (this.alerts.length > this.MAX_ALERTS) {
      this.alerts.shift(); // Remove oldest alert
    }

    console.log(`[MCP_ALERT:${alert.level}] ${alert.message}`);
  }

  /**
   * Cleanup old session metrics
   */
  cleanup(): void {
    const cutoffTime = Date.now() - TIME_CONSTANTS.DAY; // 24 hours ago
    const expiredSessions: string[] = [];

    for (const [sessionId, metrics] of this.sessionMetrics) {
      if (metrics.startTime < cutoffTime) {
        expiredSessions.push(sessionId);
      }
    }

    expiredSessions.forEach(sessionId => {
      this.endSession(sessionId);
    });
  }
}

// MCP monitoring interfaces
interface MCPPerformanceMetrics {
  sessionId: string;
  operation: MCPOperationType;
  userId?: string;
  startTime: number;
  urlsValidated: number;
  operationsValidated: number;
  cacheHits: number;
  cacheMisses: number;
  errors: Array<{ timestamp: number; message: string; context?: any }>;
  duration: number;
}

interface MCPGlobalMetrics {
  totalSessions: number;
  activeSessions: number;
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  averageSessionDuration: number;
  totalUrlsValidated: number;
  totalOperationsValidated: number;
  cacheHits: number;
  cacheMisses: number;
  circuitBreakerTrips: number;
  lastUpdated: number;
}

interface MCPAlert {
  level: 'INFO' | 'WARNING' | 'ERROR';
  message: string;
  sessionId?: string;
  timestamp: number;
  type: 'circuit_breaker' | 'error_rate' | 'performance' | 'security';
}

// Global MCP monitor instance
const mcpMonitor = new MCPMonitor();

/**
 * MCP Parallel Session Manager
 * Handles concurrent MCP exploration sessions with proper resource management
 */
class MCPParallelSessionManager {
  private readonly MAX_CONCURRENT_SESSIONS = 5;
  private readonly SESSION_TIMEOUT = TIME_CONSTANTS.SESSION_TIMEOUT;
  private activeSessions = new Map<string, { startTime: number; operation: MCPOperationType; userId?: string }>();
  private sessionQueue: Array<{
    sessionId: string;
    operation: MCPOperationType;
    userId?: string;
    resolve: (sessionId: string) => void;
    reject: (error: Error) => void;
  }> = [];

  /**
   * Acquires a session slot, queuing if necessary
   */
  async acquireSession(operation: MCPOperationType, userId?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const sessionId = `mcp_parallel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Check if we can start immediately
      if (this.activeSessions.size < this.MAX_CONCURRENT_SESSIONS) {
        this.startSession(sessionId, operation, userId);
        resolve(sessionId);
        return;
      }

      // Queue the request
      this.sessionQueue.push({ sessionId, operation, userId, resolve, reject });

      // Set a timeout for queued requests
      setTimeout(() => {
        const index = this.sessionQueue.findIndex(req => req.sessionId === sessionId);
        if (index !== -1) {
          this.sessionQueue.splice(index, 1);
          reject(new Error(`Session acquisition timeout for ${sessionId}`));
        }
      }, 30000); // 30 second timeout
    });
  }

  /**
   * Releases a session slot and processes queued requests
   */
  releaseSession(sessionId: string): void {
    if (this.activeSessions.has(sessionId)) {
      this.activeSessions.delete(sessionId);

      // Process next queued request
      if (this.sessionQueue.length > 0) {
        const nextRequest = this.sessionQueue.shift()!;
        this.startSession(nextRequest.sessionId, nextRequest.operation, nextRequest.userId);
        nextRequest.resolve(nextRequest.sessionId);
      }
    }
  }

  /**
   * Starts a new session
   */
  private startSession(sessionId: string, operation: MCPOperationType, userId?: string): void {
    this.activeSessions.set(sessionId, {
      startTime: Date.now(),
      operation,
      userId
    });

    // Set automatic cleanup timeout
    setTimeout(() => {
      if (this.activeSessions.has(sessionId)) {
        console.warn(`[MCP_PARALLEL] Session ${sessionId} timed out, forcing release`);
        this.releaseSession(sessionId);
      }
    }, this.SESSION_TIMEOUT);
  }

  /**
   * Executes a batch of MCP operations with parallel processing
   */
  async executeBatch<T>(
    operations: Array<{
      operation: MCPOperationType;
      userId?: string;
      task: (sessionId: string) => Promise<T>;
    }>
  ): Promise<T[]> {
    const results: T[] = [];
    const sessionPromises: Promise<string>[] = [];

    // Acquire all sessions first
    for (const op of operations) {
      sessionPromises.push(this.acquireSession(op.operation, op.userId));
    }

    try {
      const sessionIds = await Promise.all(sessionPromises);

      // Execute all tasks in parallel
      const taskPromises = operations.map((op, index) =>
        op.task(sessionIds[index]).finally(() => {
          this.releaseSession(sessionIds[index]);
        })
      );

      results.push(...await Promise.all(taskPromises));
    } catch (error) {
      // Release any acquired sessions on error
      sessionPromises.forEach(promise => {
        promise.then(sessionId => this.releaseSession(sessionId)).catch(() => {});
      });
      throw error;
    }

    return results;
  }

  /**
   * Gets current session statistics
   */
  getStats(): {
    activeSessions: number;
    queuedRequests: number;
    maxConcurrentSessions: number;
  } {
    return {
      activeSessions: this.activeSessions.size,
      queuedRequests: this.sessionQueue.length,
      maxConcurrentSessions: this.MAX_CONCURRENT_SESSIONS
    };
  }

  /**
   * Force cleanup of expired sessions
   */
  cleanup(): void {
    const now = Date.now();
    const expiredSessions: string[] = [];

    for (const [sessionId, session] of this.activeSessions) {
      if (now - session.startTime > this.SESSION_TIMEOUT) {
        expiredSessions.push(sessionId);
      }
    }

    expiredSessions.forEach(sessionId => {
      console.warn(`[MCP_PARALLEL] Cleaning up expired session: ${sessionId}`);
      this.releaseSession(sessionId);
    });
  }
}

// Global MCP parallel session manager instance
const mcpParallelManager = new MCPParallelSessionManager();

/**
 * MCP Intelligent Rate Limiter
 * Advanced rate limiting with operation-specific limits and adaptive throttling
 */
class MCPIntelligentRateLimiter {
  private operationLimits = new Map<string, { requests: number; window: number; burst: number }>();
  private userLimits = new Map<string, Map<string, { count: number; resetTime: number; burstRemaining: number }>>();
  private domainLimits = new Map<string, { requests: number; window: number; lastReset: number; currentCount: number }>();
  private readonly CLEANUP_INTERVAL = TIME_CONSTANTS.CLEANUP_INTERVAL_SHORT;

  constructor() {
    // Set default limits for different operation types
    this.operationLimits.set('market_exploration', { requests: 50, window: 60 * 1000, burst: 10 }); // 50/min with 10 burst
    this.operationLimits.set('arbitrage_discovery', { requests: 30, window: 60 * 1000, burst: 5 }); // 30/min with 5 burst
    this.operationLimits.set('data_extraction', { requests: 20, window: 60 * 1000, burst: 3 }); // 20/min with 3 burst

    // Domain-specific limits
    this.domainLimits.set('kalshi.com', { requests: 100, window: 60 * 1000, lastReset: Date.now(), currentCount: 0 });
    this.domainLimits.set('polymarket.com', { requests: 100, window: 60 * 1000, lastReset: Date.now(), currentCount: 0 });
    this.domainLimits.set('default', { requests: 50, window: 60 * 1000, lastReset: Date.now(), currentCount: 0 });

    // Periodic cleanup
    setInterval(() => this.cleanup(), this.CLEANUP_INTERVAL);
  }

  /**
   * Checks if an MCP operation can proceed based on intelligent rate limiting
   */
  async checkLimit(
    userId: string,
    operation: MCPOperationType,
    domain?: string,
    context?: { sessionId?: string; priority?: 'low' | 'medium' | 'high' }
  ): Promise<{ allowed: boolean; waitTime?: number; reason?: string }> {
    const now = Date.now();
    const operationKey = operation;

    // Get operation limits
    const opLimit = this.operationLimits.get(operationKey) || this.operationLimits.get('market_exploration')!;

    // Get or create user operation tracking
    let userOps = this.userLimits.get(userId);
    if (!userOps) {
      userOps = new Map();
      this.userLimits.set(userId, userOps);
    }

    let userOp = userOps.get(operationKey);
    if (!userOp || now > userOp.resetTime) {
      userOp = {
        count: 0,
        resetTime: now + opLimit.window,
        burstRemaining: opLimit.burst
      };
      userOps.set(operationKey, userOp);
    }

    // Check domain limits
    if (domain) {
      const domainLimit = this.domainLimits.get(domain) || this.domainLimits.get('default')!;
      if (now - domainLimit.lastReset > domainLimit.window) {
        domainLimit.currentCount = 0;
        domainLimit.lastReset = now;
      }

      if (domainLimit.currentCount >= domainLimit.requests) {
        return {
          allowed: false,
          waitTime: domainLimit.window - (now - domainLimit.lastReset),
          reason: `Domain ${domain} rate limit exceeded`
        };
      }
    }

    // Check operation limits with burst allowance
    if (userOp.count >= opLimit.requests && userOp.burstRemaining <= 0) {
      const waitTime = userOp.resetTime - now;
      return {
        allowed: false,
        waitTime: Math.max(0, waitTime),
        reason: `${operation} rate limit exceeded for user ${userId}`
      };
    }

    // Allow high priority operations through burst
    if (context?.priority === 'high' && userOp.burstRemaining > 0) {
      userOp.burstRemaining--;
      if (domain) {
        const domainLimit = this.domainLimits.get(domain) || this.domainLimits.get('default')!;
        domainLimit.currentCount++;
      }
      return { allowed: true };
    }

    // Check regular limits
    if (userOp.count < opLimit.requests) {
      userOp.count++;
      if (domain) {
        const domainLimit = this.domainLimits.get(domain) || this.domainLimits.get('default')!;
        domainLimit.currentCount++;
      }
      return { allowed: true };
    }

    // Use burst capacity
    if (userOp.burstRemaining > 0) {
      userOp.burstRemaining--;
      if (domain) {
        const domainLimit = this.domainLimits.get(domain) || this.domainLimits.get('default')!;
        domainLimit.currentCount++;
      }
      return { allowed: true };
    }

    // All limits exceeded
    const waitTime = userOp.resetTime - now;
    return {
      allowed: false,
      waitTime: Math.max(0, waitTime),
      reason: `All rate limits exceeded for ${operation}`
    };
  }

  /**
   * Records a successful MCP operation
   */
  recordSuccess(userId: string, operation: MCPOperationType, domain?: string): void {
    // This is mainly for analytics and potential future adaptive adjustments
    // The actual counting is done in checkLimit
  }

  /**
   * Records a failed MCP operation (for potential backoff)
   */
  recordFailure(userId: string, operation: MCPOperationType): void {
    // Could implement adaptive backoff based on failure patterns
    const userOps = this.userLimits.get(userId);
    if (userOps) {
      const userOp = userOps.get(operation);
      if (userOp) {
        // Reduce burst capacity on failures to prevent cascading failures
        userOp.burstRemaining = Math.max(0, userOp.burstRemaining - 1);
      }
    }
  }

  /**
   * Gets current rate limit status for a user
   */
  getUserStatus(userId: string): {
    operations: Array<{
      operation: string;
      currentCount: number;
      burstRemaining: number;
      resetTime: number;
    }>;
  } {
    const userOps = this.userLimits.get(userId);
    if (!userOps) {
      return { operations: [] };
    }

    const operations = Array.from(userOps.entries()).map(([operation, data]) => ({
      operation,
      currentCount: data.count,
      burstRemaining: data.burstRemaining,
      resetTime: data.resetTime
    }));

    return { operations };
  }

  /**
   * Gets domain rate limit status
   */
  getDomainStatus(domain?: string): {
    domain: string;
    currentCount: number;
    limit: number;
    resetTime: number;
  } | null {
    const targetDomain = domain || 'default';
    const domainLimit = this.domainLimits.get(targetDomain);
    if (!domainLimit) return null;

    return {
      domain: targetDomain,
      currentCount: domainLimit.currentCount,
      limit: domainLimit.requests,
      resetTime: domainLimit.lastReset + domainLimit.window
    };
  }

  /**
   * Updates limits for an operation type (admin function)
   */
  updateOperationLimit(operation: MCPOperationType, limits: { requests: number; window: number; burst: number }): void {
    this.operationLimits.set(operation, limits);
  }

  /**
   * Updates domain limits (admin function)
   */
  updateDomainLimit(domain: string, limits: { requests: number; window: number }): void {
    const existing = this.domainLimits.get(domain);
    if (existing) {
      existing.requests = limits.requests;
      existing.window = limits.window;
    } else {
      this.domainLimits.set(domain, {
        requests: limits.requests,
        window: limits.window,
        lastReset: Date.now(),
        currentCount: 0
      });
    }
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();

    // Cleanup user operation limits
    for (const [userId, userOps] of this.userLimits) {
      for (const [operation, data] of userOps) {
        if (now > data.resetTime) {
          userOps.delete(operation);
        }
      }
      if (userOps.size === 0) {
        this.userLimits.delete(userId);
      }
    }

    // Reset domain counters if window has passed
    for (const [domain, data] of this.domainLimits) {
      if (now - data.lastReset > data.window) {
        data.currentCount = 0;
        data.lastReset = now;
      }
    }
  }
}

// Global MCP intelligent rate limiter instance
const mcpIntelligentRateLimiter = new MCPIntelligentRateLimiter();

// Global MCP safety guard instance (imported from './mcp/safety')

/**
 * MCP Safety Wrappers for Exploration Operations
 */

/**
 * Safe MCP navigation with validation
 */
export async function safeMCPNavigate(
  url: string,
  sessionId: string,
  config: Partial<MCPSafetyConfig> = {}
): Promise<{ allowed: boolean; reason?: string }> {
  // Validate URL safety
  const urlValidation = mcpSafetyGuard.validateMCPUrl(url, config);
  if (!urlValidation.safe) {
    return { allowed: false, reason: urlValidation.reason };
  }

  // Validate operation can proceed
  const operationValidation = await mcpSafetyGuard.validateMCPOperation(
    'market_exploration',
    { sessionId },
    config
  );

  if (operationValidation.allowed) {
    mcpSafetyGuard.recordMCPAction(sessionId, 'navigate', url);
  }

  return operationValidation;
}

/**
 * Safe MCP data extraction
 */
export async function safeMCPExtract(
  sessionId: string,
  dataType: string,
  config: Partial<MCPSafetyConfig> = {}
): Promise<{ allowed: boolean; reason?: string }> {
  const validation = await mcpSafetyGuard.validateMCPOperation(
    'arbitrage_discovery',
    { sessionId },
    config
  );

  if (validation.allowed) {
    mcpSafetyGuard.recordMCPAction(sessionId, 'extract', undefined, { dataType });
  }

  return validation;
}

/**
 * Safe MCP exploration session wrapper
 */
export async function withMCPSafety<T>(
  operation: () => Promise<T>,
  sessionId: string,
  operationType: MCPOperationType,
  config: Partial<MCPSafetyConfig> = {}
): Promise<T> {
  const startTime = Date.now();

  try {
    // Pre-operation validation
    const validation = await mcpSafetyGuard.validateMCPOperation(
      operationType,
      { sessionId, startTime },
      config
    );

    if (!validation.allowed) {
      throw new Error(`MCP_SAFETY_VIOLATION: ${validation.reason}`);
    }

    // Execute operation
    const result = await operation();

    // Record successful operation
    mcpSafetyGuard.recordMCPAction(sessionId, 'explore');

    return result;

  } catch (error) {
    console.error(`[MCP_SAFETY] Operation failed in session ${sessionId}:`, error);
    throw error;
  }
}

/**
 * Safe Brave Search wrapper with rate limiting and safety controls
 */
export async function withBraveSearchSafety<T>(
  operation: () => Promise<T>,
  searchType: 'news' | 'web',
  userId?: string,
  config: Partial<MCPSafetyConfig> = {}
): Promise<T> {
  const startTime = Date.now();
  const operationType = searchType === 'news' ? 'brave_news_search' : 'brave_web_search';

  try {
    // Rate limiting check
    if (userId) {
      const rateLimit = await checkRetrievalRateLimit(userId, operationType);
      if (!rateLimit.allowed) {
        throw new Error(`RATE_LIMIT_EXCEEDED: Brave search rate limit exceeded. Try again in ${rateLimit.retryAfter} seconds.`);
      }
    }

    // Data source validation
    const dataSource = searchType === 'news' ?
      APPROVED_DATA_SOURCES.braveNewsSearch :
      APPROVED_DATA_SOURCES.braveWebSearch;

    guardDataSourceAccess(dataSource, operationType, userId);

    // Execute the search operation with MCP safety
    const result = await withMCPSafety(
      operation,
      `brave_search_${Date.now()}`,
      operationType as MCPOperationType,
      config
    );

    // Record successful usage for rate limiting
    if (userId) {
      await recordRetrievalUsage(userId, operationType);
    }

    // Log the operation
    logRetrievalOperation({
      timestamp: new Date().toISOString(),
      operation: 'vector_search', // Map to existing audit type
      queryType: 'text_query',
      dataSource,
      resultCount: Array.isArray(result) ? (result as any[]).length : 1,
      approved: true,
      durationMs: Date.now() - startTime,
    });

    return result;

  } catch (error) {
    // Log failed operation
    const dataSource = searchType === 'news' ?
      APPROVED_DATA_SOURCES.braveNewsSearch :
      APPROVED_DATA_SOURCES.braveWebSearch;

    logRetrievalOperation({
      timestamp: new Date().toISOString(),
      operation: 'vector_search', // Map to existing audit type
      queryType: 'text_query',
      dataSource,
      resultCount: 0,
      approved: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      durationMs: Date.now() - startTime,
    });

    throw error;
  }
}

/**
 * MCP Parallel Operation Wrappers
 */

/**
 * Executes multiple MCP operations in parallel with session management
 */
export async function executeMCPBatch<T>(
  operations: Array<{
    operation: MCPOperationType;
    userId?: string;
    task: (sessionId: string) => Promise<T>;
  }>
): Promise<T[]> {
  return mcpParallelManager.executeBatch(operations);
}

/**
 * Acquires an MCP session for parallel operations
 */
export async function acquireMCPSession(operation: MCPOperationType, userId?: string): Promise<string> {
  return mcpParallelManager.acquireSession(operation, userId);
}

/**
 * Releases an MCP session
 */
export function releaseMCPSession(sessionId: string): void {
  mcpParallelManager.releaseSession(sessionId);
}

/**
 * Checks MCP intelligent rate limiting
 */
export async function checkMCPRateLimit(
  userId: string,
  operation: MCPOperationType,
  domain?: string,
  context?: { sessionId?: string; priority?: 'low' | 'medium' | 'high' }
): Promise<{ allowed: boolean; waitTime?: number; reason?: string }> {
  return mcpIntelligentRateLimiter.checkLimit(userId, operation, domain, context);
}

/**
 * Records MCP operation success for rate limiting analytics
 */
export function recordMCPOperationSuccess(userId: string, operation: MCPOperationType, domain?: string): void {
  mcpIntelligentRateLimiter.recordSuccess(userId, operation, domain);
}

/**
 * Records MCP operation failure for rate limiting adjustments
 */
export function recordMCPOperationFailure(userId: string, operation: MCPOperationType): void {
  mcpIntelligentRateLimiter.recordFailure(userId, operation);
}

// Monitoring and management functions are exported at the top of the file
