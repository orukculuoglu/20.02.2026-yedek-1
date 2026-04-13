/**
 * Fleet Graph Reference Contract
 * Minimal structural reference for fleet entities in graph nodes.
 * Caller provides fleet identifiers and optional metadata.
 * No business logic, no fleet runtime logic, pure structural reference.
 */

/**
 * FleetGraphRef
 * Minimal structural reference to a fleet entity.
 * Graph nodes may carry this reference to link to operational fleets.
 * Caller must explicitly provide fleet identifiers.
 */
export interface FleetGraphRef {
  /** Fleet entity identifier (caller-provided, required) */
  fleetId: string;

  /** Fleet code (caller-provided, optional) */
  fleetCode?: string;

  /** Fleet display name (caller-provided, optional) */
  fleetName?: string;
}
