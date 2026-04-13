/**
 * Graph Timestamp Contracts
 * Minimal timestamp type specifications for graph entities.
 * All timestamps are caller-provided only.
 * No timestamp generation, no Date.now(), pure structural specification.
 */

/**
 * GraphTimestamps
 * Minimal timestamp specification for graph entities.
 * Caller must provide all timestamp values.
 */
export interface GraphTimestamps {
  /** Creation timestamp (caller-provided, optional, Unix milliseconds) */
  createdAt?: number;

  /** Last update timestamp (caller-provided, optional, Unix milliseconds) */
  updatedAt?: number;
}
