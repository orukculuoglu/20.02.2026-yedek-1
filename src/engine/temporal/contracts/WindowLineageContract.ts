/**
 * Window Lineage Contracts
 * Explicit contracts for temporal window relationships and ancestry.
 * All references, chains, and roles are caller-provided, never inferred.
 */

/**
 * WindowLineageRole
 * Explicit role a window plays in a lineage relationship.
 * Determined only by caller specification, never by inference.
 */
export type WindowLineageRole = "previous" | "current" | "next" | "baseline" | "reference";

/**
 * WindowLineageRelationType
 * Explicit type of relationship between windows.
 * Determined only by caller specification, never by inference.
 */
export type WindowLineageRelationType =
  | "sequential_predecessor" // Previous window in sequence
  | "sequential_successor" // Next window in sequence
  | "baseline_anchor" // Baseline comparison point
  | "reference_anchor" // Reference comparison point
  | "temporal_sibling" // Related but not sequential
  | "custom_relation"; // Custom caller-specified relation

/**
 * WindowLineageReference
 * Explicit reference to a related window.
 * Minimal, structural-only, all data caller-provided.
 */
export interface WindowLineageReference {
  // The window being referenced
  windowId: string;

  // Role this window plays in the relationship
  role: WindowLineageRole;

  // Type of relationship
  relationType: WindowLineageRelationType;

  // When this relationship was established (caller-provided, Unix milliseconds)
  // Can be different from window creation time
  relationshipEstablishedAt: number;

  // Optional metadata about the relationship (caller-provided)
  relationshipMetadata?: Record<string, unknown>;
}

/**
 * WindowLineageContract
 * Contract for a single window with explicit lineage connections.
 * Represents the window's identity within temporal continuity.
 */
export interface WindowLineageContract {
  // The window's identity
  windowId: string;

  // When this window was created/identified (caller-provided, Unix milliseconds)
  windowCreatedAt: number;

  // Explicit role of this window in its lineage context
  // Caller determined, never inferred
  roleInContext: WindowLineageRole;

  // Direct lineage references to other windows
  // Empty array if no related windows (never null/undefined)
  lineageReferences: WindowLineageReference[];

  // Optional: depth in lineage chain if caller tracks it
  // undefined if not provided
  depthInChain?: number;

  // Optional: position in lineage sequence if caller tracks it
  // undefined if not provided
  sequencePosition?: number;

  // Optional metadata about this window's lineage (caller-provided)
  lineageMetadata?: Record<string, unknown>;
}

/**
 * WindowLineageChain
 * Explicit contract for a sequence of related windows.
 * All relationships explicitly caller-specified, never inferred.
 */
export interface WindowLineageChain {
  // Unique chain identifier (caller-provided)
  chainId: string;

  // Windows in this chain (in requested order by caller)
  // Caller determines sequence, never computed
  windowIds: string[];

  // The chain's lineage role/type
  chainRole: WindowLineageRole;

  // When this chain was established (caller-provided, Unix milliseconds)
  chainEstablishedAt: number;

  // Optional chain metadata (caller-provided)
  chainMetadata?: Record<string, unknown>;
}

/**
 * WindowLineageAncestry
 * Contract representing all lineage relationships for a window.
 * Complete specification of window's position in temporal continuity.
 */
export interface WindowLineageAncestry {
  // Central window identity
  windowId: string;

  // This window's role in the ancestry context
  role: WindowLineageRole;

  // Direct predecessors (previous windows)
  // Can be empty
  predecessors: WindowLineageReference[];

  // Direct successors (next windows)
  // Can be empty
  successors: WindowLineageReference[];

  // Baseline anchors (reference points)
  // Can be empty
  baselineAnchors: WindowLineageReference[];

  // Reference anchors (comparison points)
  // Can be empty
  referenceAnchors: WindowLineageReference[];

  // Other related windows
  // Can be empty
  siblings: WindowLineageReference[];

  // Lineage metadata (optional, caller-provided)
  metadata?: Record<string, unknown>;
}
