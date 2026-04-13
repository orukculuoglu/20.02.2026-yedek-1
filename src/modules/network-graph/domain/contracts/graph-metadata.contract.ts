/**
 * Graph Metadata Contracts
 * Minimal metadata type specifications for graph entities.
 * All metadata is caller-provided and optional.
 * No defaults, no validation logic, pure structural specification.
 */

/**
 * GraphMetadata
 * Minimal metadata specification for graph entities.
 * Caller may optionally provide descriptive metadata.
 */
export interface GraphMetadata {
  /** Human-readable label or name (optional, caller-provided) */
  label?: string;

  /** Detailed description or annotation (optional, caller-provided) */
  description?: string;

  /** Tags or classification labels (optional, caller-provided array) */
  tags?: string[];

  /** Source reference or origin (optional, caller-provided) */
  sourceReference?: string;
}
