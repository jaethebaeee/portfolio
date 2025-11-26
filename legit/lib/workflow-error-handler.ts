/**
 * Workflow Error Handler
 * 에러 분류, 재시도 전략, 에러 처리 로직
 */

export enum ErrorCategory {
  NETWORK = 'network',
  API_ERROR = 'api_error',
  DATA_ERROR = 'data_error',
  TIMEOUT = 'timeout',
  PERMISSION = 'permission',
  VALIDATION = 'validation',
  RATE_LIMIT = 'rate_limit',
  UNKNOWN = 'unknown'
}

export interface RetryStrategy {
  shouldRetry: boolean;
  delay: number;
  maxRetries: number;
}

export class WorkflowErrorHandler {
  /**
   * 에러를 카테고리로 분류
   */
  static classifyError(error: Error | string): ErrorCategory {
    const message = typeof error === 'string' ? error.toLowerCase() : error.message.toLowerCase();
    
    // 네트워크 오류
    if (message.includes('network') || 
        message.includes('timeout') || 
        message.includes('econnrefused') ||
        message.includes('enotfound') ||
        message.includes('econnreset')) {
      return ErrorCategory.NETWORK;
    }
    
    // API 오류
    if (message.includes('api') || 
        message.includes('http') || 
        message.includes('status') ||
        message.includes('bad request') ||
        message.includes('internal server error')) {
      return ErrorCategory.API_ERROR;
    }
    
    // 데이터 오류
    if (message.includes('not found') || 
        message.includes('invalid') || 
        message.includes('missing') ||
        message.includes('required')) {
      return ErrorCategory.DATA_ERROR;
    }
    
    // 권한 오류
    if (message.includes('unauthorized') || 
        message.includes('forbidden') || 
        message.includes('permission') ||
        message.includes('access denied')) {
      return ErrorCategory.PERMISSION;
    }
    
    // 타임아웃
    if (message.includes('timeout') || message.includes('timed out')) {
      return ErrorCategory.TIMEOUT;
    }
    
    // Rate Limit
    if (message.includes('rate limit') || 
        message.includes('too many requests') ||
        message.includes('429')) {
      return ErrorCategory.RATE_LIMIT;
    }
    
    // 검증 오류
    if (message.includes('validation') || 
        message.includes('invalid format') ||
        message.includes('malformed')) {
      return ErrorCategory.VALIDATION;
    }
    
    return ErrorCategory.UNKNOWN;
  }
  
  /**
   * 재시도 가능 여부 판단
   */
  static shouldRetry(
    error: Error | string, 
    retryCount: number, 
    maxRetries: number = 3
  ): boolean {
    if (retryCount >= maxRetries) return false;
    
    const category = this.classifyError(error);
    
    // 재시도 가능한 에러 타입
    const retryableCategories = [
      ErrorCategory.NETWORK,
      ErrorCategory.TIMEOUT,
      ErrorCategory.API_ERROR,
      ErrorCategory.RATE_LIMIT
    ];
    
    return retryableCategories.includes(category);
  }
  
  /**
   * 재시도 전략 계산 (Exponential Backoff with Jitter)
   */
  static getRetryStrategy(
    error: Error | string,
    retryCount: number,
    baseDelay: number = 1000,
    maxDelay: number = 60000
  ): RetryStrategy {
    const category = this.classifyError(error);
    const shouldRetry = this.shouldRetry(error, retryCount);
    
    // Rate Limit의 경우 더 긴 대기 시간
    if (category === ErrorCategory.RATE_LIMIT) {
      const delay = Math.min(baseDelay * Math.pow(2, retryCount) * 2, maxDelay);
      return {
        shouldRetry,
        delay: delay + Math.random() * 2000, // 0-2초 jitter
        maxRetries: 5 // Rate limit은 더 많이 재시도
      };
    }
    
    // 일반적인 Exponential Backoff with Jitter
    const exponentialDelay = baseDelay * Math.pow(2, retryCount);
    const jitter = Math.random() * 1000; // 0-1초 랜덤
    const delay = Math.min(exponentialDelay + jitter, maxDelay);
    
    return {
      shouldRetry,
      delay,
      maxRetries: 3
    };
  }
  
  /**
   * 에러 메시지 포맷팅
   */
  static formatError(error: Error | string, context?: Record<string, any>): string {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const category = this.classifyError(error);
    
    let formatted = `[${category.toUpperCase()}] ${errorMessage}`;
    
    if (context) {
      const contextStr = Object.entries(context)
        .map(([key, value]) => `${key}=${value}`)
        .join(', ');
      formatted += ` | Context: ${contextStr}`;
    }
    
    if (error instanceof Error && error.stack) {
      formatted += ` | Stack: ${error.stack.split('\n')[0]}`;
    }
    
    return formatted;
  }
  
  /**
   * 에러 심각도 판단
   */
  static getSeverity(error: Error | string): 'low' | 'medium' | 'high' | 'critical' {
    const category = this.classifyError(error);
    
    switch (category) {
      case ErrorCategory.PERMISSION:
      case ErrorCategory.VALIDATION:
        return 'high'; // 즉시 수정 필요
      case ErrorCategory.DATA_ERROR:
        return 'medium'; // 데이터 확인 필요
      case ErrorCategory.NETWORK:
      case ErrorCategory.TIMEOUT:
        return 'low'; // 일시적 문제
      case ErrorCategory.RATE_LIMIT:
        return 'medium'; // 설정 조정 필요
      default:
        return 'medium';
    }
  }
}

