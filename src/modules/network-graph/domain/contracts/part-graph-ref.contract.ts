/**
 * Part Graph Reference Contract
 * Minimal structural reference for part entities in graph nodes.
 * Caller provides part identifiers and optional metadata.
 * No business logic, no part matching logic, pure structural reference.
 */

/**
 * PartGraphRef
 * Minimal structural reference to a part entity.
 * Graph nodes may carry this reference to link to operational parts.
 * Caller must explicitly provide part identifiers.
 */
export interface PartGraphRef {
  /** Part entity identifier (caller-provided, required) */
  partId: string;

  /** Part number/SKU (caller-provided, optional) */
  partNumber?: string;

  /** Part display name (caller-provided, optional) */
  partName?: string;
}
