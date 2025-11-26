/**
 * Circuit Breaker for Workflow Execution
 * Prevents cascading failures and provides resilience
 */

interface CircuitBreakerState {
  CLOSED: 'closed';      // Normal operation
  OPEN: 'open';         // Failing, requests rejected
  HALF_OPEN: 'half-open'; // Testing if service recovered
}

interface CircuitBreakerConfig {
  failureThreshold: number;    // Failures before opening
  recoveryTimeout: number;     // Time to wait before half-open
  monitoringPeriod: number;    // Time window for failure tracking
  successThreshold: number;    // Successes needed to close circuit
}

interface FailureRecord {
  timestamp: number;
  error: string;
  nodeId?: string;
}

export class WorkflowCircuitBreaker {
  private state: CircuitBreakerState['CLOSED'] | CircuitBreakerState['OPEN'] | CircuitBreakerState['HALF_OPEN'] = 'closed';
  private failures: FailureRecord[] = [];
  private successes = 0;
  private lastFailureTime = 0;
  private nextAttemptTime = 0;

  private config: CircuitBreakerConfig;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = {
      failureThreshold: 5,
      recoveryTimeout: 60000, // 1 minute
      monitoringPeriod: 300000, // 5 minutes
      successThreshold: 3,
      ...config
    };
  }

  async execute<T>(operation: () => Promise<T>, context?: { nodeId?: string }): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() < this.nextAttemptTime) {
        throw new Error(`Circuit breaker is OPEN. Next attempt at ${new Date(this.nextAttemptTime).toISOString()}`);
      }
      this.state = 'half-open';
    }

    try {
      const result = await operation();

      this.onSuccess();
      return result;
    } catch (error: any) {
      this.onFailure(error.message, context?.nodeId);
      throw error;
    }
  }

  private onSuccess(): void {
    if (this.state === 'half-open') {
      this.successes++;
      if (this.successes >= this.config.successThreshold) {
        this.close();
      }
    } else {
      // Reset consecutive failures on success
      this.failures = this.failures.filter(
        f => Date.now() - f.timestamp > this.config.monitoringPeriod
      );
    }
  }

  private onFailure(error: string, nodeId?: string): void {
    const failure: FailureRecord = {
      timestamp: Date.now(),
      error,
      nodeId
    };

    this.failures.push(failure);
    this.lastFailureTime = failure.timestamp;

    // Clean old failures
    this.failures = this.failures.filter(
      f => Date.now() - f.timestamp <= this.config.monitoringPeriod
    );

    // Check if we should open the circuit
    if (this.failures.length >= this.config.failureThreshold) {
      this.open();
    }
  }

  private open(): void {
    this.state = 'open';
    this.nextAttemptTime = Date.now() + this.config.recoveryTimeout;
    console.warn(`Circuit breaker opened. Next attempt at ${new Date(this.nextAttemptTime).toISOString()}`);
  }

  private close(): void {
    this.state = 'closed';
    this.failures = [];
    this.successes = 0;
    console.info('Circuit breaker closed. Normal operation resumed.');
  }

  getState(): {
    state: string;
    failureCount: number;
    lastFailureTime: number;
    nextAttemptTime: number;
    successCount: number;
  } {
    return {
      state: this.state,
      failureCount: this.failures.length,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime,
      successCount: this.successes
    };
  }

  // Manual reset for testing/admin purposes
  reset(): void {
    this.state = 'closed';
    this.failures = [];
    this.successes = 0;
    this.lastFailureTime = 0;
    this.nextAttemptTime = 0;
  }

  // Force open for maintenance
  forceOpen(): void {
    this.open();
  }
}

// Global circuit breaker instances
export const workflowCircuitBreaker = new WorkflowCircuitBreaker({
  failureThreshold: 10,
  recoveryTimeout: 300000, // 5 minutes
  monitoringPeriod: 600000, // 10 minutes
  successThreshold: 5
});

export const messagingCircuitBreaker = new WorkflowCircuitBreaker({
  failureThreshold: 3,
  recoveryTimeout: 60000, // 1 minute
  monitoringPeriod: 300000, // 5 minutes
  successThreshold: 2
});

// Circuit breaker for external API calls
export const apiCircuitBreaker = new WorkflowCircuitBreaker({
  failureThreshold: 5,
  recoveryTimeout: 120000, // 2 minutes
  monitoringPeriod: 600000, // 10 minutes
  successThreshold: 3
});
