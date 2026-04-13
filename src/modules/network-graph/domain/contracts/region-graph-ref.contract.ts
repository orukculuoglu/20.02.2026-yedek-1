/**
 * Region Graph Reference Contract
 * Minimal structural reference for region entities in graph nodes.
 * Caller provides region identifiers and optional metadata.
 * No business logic, no hierarchy logic, pure structural reference.
 */

/**
 * RegionGraphRef
 * Minimal structural reference to a region entity.
 * Graph nodes may carry this reference to link to operational regions.
 * Caller must explicitly provide region identifiers.
 */
export interface RegionGraphRef {
  /** Region entity identifier (caller-provided, required) */
  regionId: string;

  /** Region code (caller-provided, optional) */
  regionCode?: string;

  /** Region display name (caller-provided, optional) */
  regionName?: string;
}
