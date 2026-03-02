/**
 * Rate Limiter (Token Bucket)
 * Prevents event spam by limiting requests per time interval
 * 
 * Pattern:
 * - Start with maxTokens
 * - Each request uses 1 token
 * - Tokens refill at fixed interval
 * - If no tokens available, reject request
 */

interface TokenBucket {
  tokens: number;
  maxTokens: number;
  lastRefillTime: number;
  intervalMs: number;
}

/**
 * Create a rate limiter with token bucket pattern
 * 
 * @param maxRequests - Max requests allowed per interval
 * @param intervalMs - Time interval in milliseconds
 */
export function createRateLimiter(
  maxRequests: number = 20,
  intervalMs: number = 10000
): {
  allow(): boolean;
  getTokens(): number;
  reset(): void;
} {
  const bucket: TokenBucket = {
    tokens: maxRequests,
    maxTokens: maxRequests,
    lastRefillTime: Date.now(),
    intervalMs,
  };

  /**
   * Check if request is allowed (consume token if available)
   */
  function allow(): boolean {
    // Refill tokens based on elapsed time
    const now = Date.now();
    const elapsed = now - bucket.lastRefillTime;
    const intervalsElapsed = elapsed / bucket.intervalMs;

    if (intervalsElapsed > 0) {
      // Add tokens (cap at maxTokens)
      bucket.tokens = Math.min(
        bucket.maxTokens,
        bucket.tokens + intervalsElapsed * bucket.maxTokens
      );
      bucket.lastRefillTime = now;
    }

    // Try to consume a token
    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;

      if (import.meta.env.DEV) {
        console.debug("[DE-Rate] Request allowed", {
          tokensRemaining: Math.floor(bucket.tokens),
        });
      }

      return true;
    }

    if (import.meta.env.DEV) {
      console.debug("[DE-Rate] Request rate limited", {
        tokensRemaining: Math.floor(bucket.tokens),
        maxTokens: bucket.maxTokens,
      });
    }

    return false;
  }

  /**
   * Get current token count
   */
  function getTokens(): number {
    // Refill first
    const now = Date.now();
    const elapsed = now - bucket.lastRefillTime;
    const intervalsElapsed = elapsed / bucket.intervalMs;

    if (intervalsElapsed > 0) {
      bucket.tokens = Math.min(
        bucket.maxTokens,
        bucket.tokens + intervalsElapsed * bucket.maxTokens
      );
      bucket.lastRefillTime = now;
    }

    return Math.floor(bucket.tokens);
  }

  /**
   * Reset rate limiter (DEV only)
   */
  function reset(): void {
    bucket.tokens = bucket.maxTokens;
    bucket.lastRefillTime = Date.now();

    if (import.meta.env.DEV) {
      console.debug("[DE-Rate] Rate limiter reset");
    }
  }

  return {
    allow,
    getTokens,
    reset,
  };
}
