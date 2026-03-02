/**
 * Data Engine Runtime Configuration
 * Allows dynamic adjustment of resilience layer settings without code changes
 * 
 * Configuration is persisted in localStorage and can be modified at runtime
 * for tuning rate limits, circuit breaker behavior, and adaptive backoff strategy
 */

export interface DataEngineRuntimeConfig {
  maxRequestsPerWindow: number;      // Max events per time window (default: 20)
  windowMs: number;                   // Time window in milliseconds (default: 10000)
  circuitFailureThreshold: number;    // Failures before circuit opens (default: 5)
  circuitOpenTimeoutMs: number;       // Time to wait before HALF_OPEN (default: 30000)
  halfOpenMaxAttempts: number;        // Test attempts in HALF_OPEN (default: 2)
  adaptiveBackoffEnabled: boolean;    // Enable self-tuning (default: true)
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: DataEngineRuntimeConfig = {
  maxRequestsPerWindow: 20,
  windowMs: 10000,
  circuitFailureThreshold: 5,
  circuitOpenTimeoutMs: 30000,
  halfOpenMaxAttempts: 2,
  adaptiveBackoffEnabled: true,
};

const STORAGE_KEY = "DE_RUNTIME_CONFIG_V1";

/**
 * Current runtime configuration (in memory)
 */
let currentConfig: DataEngineRuntimeConfig = { ...DEFAULT_CONFIG };

/**
 * Initialize from localStorage on module load
 */
function initializeFromStorage(): void {
  try {
    if (typeof localStorage === "undefined") {
      return; // SSR environment, use in-memory only
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<DataEngineRuntimeConfig>;
      currentConfig = { ...DEFAULT_CONFIG, ...parsed };

      if (import.meta.env.DEV) {
        console.debug("[DE-Config] Loaded from storage", currentConfig);
      }
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("[DE-Config] Failed to load from storage", error);
    }
  }
}

/**
 * Persist configuration to localStorage
 */
function persistToStorage(): void {
  try {
    if (typeof localStorage === "undefined") {
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentConfig));

    if (import.meta.env.DEV) {
      console.debug("[DE-Config] Persisted to storage", currentConfig);
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("[DE-Config] Failed to persist to storage", error);
    }
  }
}

/**
 * Get current runtime configuration
 */
export function getRuntimeConfig(): DataEngineRuntimeConfig {
  return { ...currentConfig };
}

/**
 * Update runtime configuration (partial override)
 * Safety guardrails:
 * - maxRequestsPerWindow: min 5, max 100
 * - circuitOpenTimeoutMs: max 120000 (2 minutes)
 */
export function updateRuntimeConfig(
  partial: Partial<DataEngineRuntimeConfig>
): void {
  const updated: DataEngineRuntimeConfig = { ...currentConfig, ...partial };

  // Apply safety guardrails
  if (updated.maxRequestsPerWindow < 5) {
    updated.maxRequestsPerWindow = 5;

    if (import.meta.env.DEV) {
      console.debug(
        "[DE-Config] Clamped maxRequestsPerWindow to minimum (5)"
      );
    }
  }

  if (updated.maxRequestsPerWindow > 100) {
    updated.maxRequestsPerWindow = 100;

    if (import.meta.env.DEV) {
      console.debug("[DE-Config] Clamped maxRequestsPerWindow to maximum (100)");
    }
  }

  if (updated.circuitOpenTimeoutMs > 120000) {
    updated.circuitOpenTimeoutMs = 120000;

    if (import.meta.env.DEV) {
      console.debug(
        "[DE-Config] Clamped circuitOpenTimeoutMs to maximum (120s)"
      );
    }
  }

  if (updated.circuitFailureThreshold < 2) {
    updated.circuitFailureThreshold = 2;

    if (import.meta.env.DEV) {
      console.debug(
        "[DE-Config] Clamped circuitFailureThreshold to minimum (2)"
      );
    }
  }

  currentConfig = updated;
  persistToStorage();

  if (import.meta.env.DEV) {
    console.debug("[DE-Config] Configuration updated", currentConfig);
  }
}

/**
 * Reset to default configuration
 */
export function resetRuntimeConfig(): void {
  currentConfig = { ...DEFAULT_CONFIG };
  persistToStorage();

  if (import.meta.env.DEV) {
    console.debug("[DE-Config] Reset to defaults", currentConfig);
  }
}

/**
 * Apply adaptive backoff based on latency and failure metrics
 * Called by sender when adaptiveBackoffEnabled is true
 * 
 * High pressure scenario:
 * - latency > 1500ms OR failureRate > 30%
 * - Reduces throughput and extends circuit timeout
 * 
 * Stabilized scenario:
 * - latency < 500ms AND failureRate < 5%
 * - Gradually restores defaults
 */
export function applyAdaptiveBackoff(
  metrics: {
    averageLatencyMs: number;
    failureRate: number;
  }
): void {
  const current = getRuntimeConfig();

  if (!current.adaptiveBackoffEnabled) {
    return;
  }

  const { averageLatencyMs, failureRate } = metrics;

  // HIGH PRESSURE: Reduce throughput and extend timeouts
  if (averageLatencyMs > 1500 || failureRate > 0.3) {
    const newMaxRequests = Math.max(
      5,
      Math.floor(current.maxRequestsPerWindow * 0.75) // Reduce by 25%
    );

    const newCircuitTimeout = Math.min(
      120000,
      current.circuitOpenTimeoutMs + Math.floor(current.circuitOpenTimeoutMs * 0.5) // Increase by 50%
    );

    if (
      newMaxRequests !== current.maxRequestsPerWindow ||
      newCircuitTimeout !== current.circuitOpenTimeoutMs
    ) {
      updateRuntimeConfig({
        maxRequestsPerWindow: newMaxRequests,
        circuitOpenTimeoutMs: newCircuitTimeout,
      });

      if (import.meta.env.DEV) {
        console.debug("[DE-Config] Applied pressure backoff", {
          latency: averageLatencyMs,
          failureRate: (failureRate * 100).toFixed(1) + "%",
          newMaxRequests,
          newCircuitTimeout,
        });
      }
    }

    return;
  }

  // STABILIZED: Gradually restore defaults
  if (averageLatencyMs < 500 && failureRate < 0.05) {
    const defaultMaxRequests = DEFAULT_CONFIG.maxRequestsPerWindow;
    const defaultCircuitTimeout = DEFAULT_CONFIG.circuitOpenTimeoutMs;

    // Restore gradually (10% towards default per call)
    const newMaxRequests =
      current.maxRequestsPerWindow < defaultMaxRequests
        ? Math.min(
            defaultMaxRequests,
            current.maxRequestsPerWindow +
              Math.ceil(
                (defaultMaxRequests - current.maxRequestsPerWindow) * 0.1
              )
          )
        : current.maxRequestsPerWindow;

    const newCircuitTimeout =
      current.circuitOpenTimeoutMs > defaultCircuitTimeout
        ? Math.max(
            defaultCircuitTimeout,
            current.circuitOpenTimeoutMs -
              Math.ceil(
                (current.circuitOpenTimeoutMs - defaultCircuitTimeout) * 0.1
              )
          )
        : current.circuitOpenTimeoutMs;

    if (
      newMaxRequests !== current.maxRequestsPerWindow ||
      newCircuitTimeout !== current.circuitOpenTimeoutMs
    ) {
      updateRuntimeConfig({
        maxRequestsPerWindow: newMaxRequests,
        circuitOpenTimeoutMs: newCircuitTimeout,
      });

      if (import.meta.env.DEV) {
        console.debug("[DE-Config] Applied recovery restore", {
          latency: averageLatencyMs,
          failureRate: (failureRate * 100).toFixed(1) + "%",
          newMaxRequests,
          newCircuitTimeout,
        });
      }
    }
  }
}

// Load configuration from storage on module initialization
initializeFromStorage();
