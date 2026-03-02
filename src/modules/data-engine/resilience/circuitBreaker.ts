/**
 * Circuit Breaker Pattern
 * Protects against cascading failures by rejecting requests when backend is failing
 * 
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Too many failures, requests rejected immediately
 * - HALF_OPEN: Testing if backend recovered, limited requests allowed
 */

export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface CircuitBreakerConfig {
  failureThreshold: number;      // Failures before opening circuit (default: 5)
  openTimeoutMs: number;         // Time to wait before trying HALF_OPEN (default: 30s)
  halfOpenMaxAttempts: number;   // Max attempts in HALF_OPEN before deciding (default: 2)
}

interface CircuitBreakerState {
  state: CircuitState;
  failureCount: number;
  lastFailureTime?: number;
  halfOpenAttempts: number;
}

/**
 * Create a circuit breaker instance
 * Each sender should have its own isolated circuit breaker
 */
export function createCircuitBreaker(
  config?: Partial<CircuitBreakerConfig>
): {
  canRequest(): boolean;
  recordSuccess(): void;
  recordFailure(): void;
  getState(): CircuitState;
} {
  // Merge with defaults
  const cfg: CircuitBreakerConfig = {
    failureThreshold: 5,
    openTimeoutMs: 30000,          // 30 seconds
    halfOpenMaxAttempts: 2,
    ...config,
  };

  // Internal state
  const state: CircuitBreakerState = {
    state: "CLOSED",
    failureCount: 0,
    lastFailureTime: undefined,
    halfOpenAttempts: 0,
  };

  const now = () => Date.now();

  /**
   * Check if a request is allowed
   */
  function canRequest(): boolean {
    if (state.state === "CLOSED") {
      return true;
    }

    if (state.state === "OPEN") {
      // Check if we should transition to HALF_OPEN
      const timeSinceFailure = now() - (state.lastFailureTime || 0);
      if (timeSinceFailure > cfg.openTimeoutMs) {
        state.state = "HALF_OPEN";
        state.halfOpenAttempts = 0;

        if (import.meta.env.DEV) {
          console.debug("[DE-Circuit] Transitioning to HALF_OPEN", {
            timeSinceFailure,
            openTimeoutMs: cfg.openTimeoutMs,
          });
        }

        return true; // Allow first HALF_OPEN attempt
      }

      return false; // Circuit is OPEN, reject
    }

    if (state.state === "HALF_OPEN") {
      // Only allow limited attempts
      return state.halfOpenAttempts < cfg.halfOpenMaxAttempts;
    }

    return false;
  }

  /**
   * Record successful request
   */
  function recordSuccess(): void {
    if (state.state === "HALF_OPEN") {
      // Success in HALF_OPEN → reset circuit
      state.state = "CLOSED";
      state.failureCount = 0;
      state.halfOpenAttempts = 0;

      if (import.meta.env.DEV) {
        console.debug("[DE-Circuit] HALF_OPEN → CLOSED (success)");
      }
    } else if (state.state === "CLOSED") {
      // Success in CLOSED → decrement failure count slowly
      if (state.failureCount > 0) {
        state.failureCount--;
      }
    }
  }

  /**
   * Record failed request
   */
  function recordFailure(): void {
    state.failureCount++;
    state.lastFailureTime = now();

    if (state.state === "HALF_OPEN") {
      // Failure in HALF_OPEN → back to OPEN
      state.state = "OPEN";
      state.halfOpenAttempts = 0;

      if (import.meta.env.DEV) {
        console.debug("[DE-Circuit] HALF_OPEN → OPEN (failure)");
      }
    } else if (state.state === "CLOSED") {
      // Check if we should open the circuit
      if (state.failureCount >= cfg.failureThreshold) {
        state.state = "OPEN";

        if (import.meta.env.DEV) {
          console.debug("[DE-Circuit] CLOSED → OPEN", {
            failureCount: state.failureCount,
            threshold: cfg.failureThreshold,
          });
        }
      }
    }

    if (state.state === "HALF_OPEN") {
      state.halfOpenAttempts++;
    }
  }

  /**
   * Get current circuit state
   */
  function getState(): CircuitState {
    return state.state;
  }

  return {
    canRequest,
    recordSuccess,
    recordFailure,
    getState,
  };
}
