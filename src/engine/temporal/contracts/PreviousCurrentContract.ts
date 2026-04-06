/**
 * Previous/Current Window Continuity Contracts
 * Explicit contracts for modeling temporal continuity between windows.
 * Previous → Current → (Next) progression with caller-provided binding.
 * No inference, no automatic role assignment, all caller-specified.
 */

/**
 * ContinuityRole
 * Explicit role a window plays within a continuity sequence.
 * Determined only by caller specification, never inferred.
 */
export type ContinuityRole = "previous" | "current" | "next";

/**
 * ContinuityRelationType
 * Explicit type of relationship between previous and current windows.
 * Determined only by caller specification.
 */
export type ContinuityRelationType =
  | "sequential_progression" // Ordered sequence: previous → current
  | "paired_reference" // Previous directly references current
  | "temporal_anchor" // Previous is baseline for current
  | "custom_continuity"; // Custom caller-defined continuity

/**
 * ContinuityReference
 * Explicit reference linking two windows in continuity.
 * Minimal, structural-only, all data caller-provided.
 */
export interface ContinuityReference {
  // The window being referenced
  windowId: string;

  // Role of referenced window in continuity
  role: ContinuityRole;

  // Type of continuity relationship
  relationType: ContinuityRelationType;

  // When this continuity linkage was established (caller-provided, Unix milliseconds)
  continuityEstablishedAt: number;

  // Optional metadata about continuity (caller-provided)
  continuityMetadata?: Record<string, unknown>;
}

/**
 * PreviousCurrentContract
 * Contract for an explicit previous → current window pairing.
 * Represents minimal continuity: what came before and what is now.
 */
export interface PreviousCurrentContract {
  // The current window in the pairing
  currentWindowId: string;

  // The previous window (what came before current)
  previousWindowId: string;

  // The next window (optional, what comes after current)
  nextWindowId?: string;

  // Type of continuity relationship
  continuityRelationType: ContinuityRelationType;

  // When this continuity was established (caller-provided, Unix milliseconds)
  continuityEstablishedAt: number;

  // When current window status began (caller-provided, Unix milliseconds)
  currentStartedAt: number;

  // Optional metadata about continuity (caller-provided)
  continuityMetadata?: Record<string, unknown>;
}

/**
 * ContinuityPairIdentity
 * Unique identity for a previous-current pairing.
 * Used to reference and track pairs.
 */
export interface ContinuityPairIdentity {
  // Unique pair identifier (caller-provided)
  pairId: string;

  // Current window in pair
  currentWindowId: string;

  // Previous window in pair
  previousWindowId: string;

  // When this pairing was established (caller-provided, Unix milliseconds)
  pairingEstablishedAt: number;

  // Optional pair metadata (caller-provided)
  pairMetadata?: Record<string, unknown>;
}

/**
 * ContinuitySet
 * Explicit contract for an ordered set of windows in continuity.
 * Represents a sequence: previous, current, (next), with explicit ordering.
 */
export interface ContinuitySet {
  // Unique set identifier (caller-provided)
  setId: string;

  // Windows in this continuity set (in caller-provided order)
  windowIds: string[];

  // Which window is current in this set (index into windowIds)
  currentWindowIndex: number;

  // Type of continuity in this set
  continuityType: ContinuityRelationType;

  // When this set was established (caller-provided, Unix milliseconds)
  setEstablishedAt: number;

  // Optional set metadata (caller-provided)
  setMetadata?: Record<string, unknown>;
}

/**
 * ContinuityMembership
 * Explicit membership of a window within a continuity set.
 * Links window to its position and role in a continuity sequence.
 */
export interface ContinuityMembership {
  // The window in this membership
  windowId: string;

  // The continuity set this window belongs to
  setId: string;

  // Position in set (0-indexed, caller-provided)
  positionInSet: number;

  // Role of this window in set (caller-provided)
  roleInSet: ContinuityRole;

  // When this membership was established (caller-provided, Unix milliseconds)
  membershipEstablishedAt: number;

  // Optional membership metadata (caller-provided)
  membershipMetadata?: Record<string, unknown>;
}

/**
 * FullContinuityAncestry
 * Complete continuity context for a window.
 * Explicit specification of window's position in previous/current/next progression.
 */
export interface FullContinuityAncestry {
  // Central window identity
  windowId: string;

  // This window's role in continuity (caller-provided)
  role: ContinuityRole;

  // Previous windows in continuity (optional, if window is current or next)
  previousContext?: ContinuityReference;

  // Next windows in continuity (optional, if window is previous or current)
  nextContext?: ContinuityReference;

  // When this window's continuity context was established (caller-provided, Unix milliseconds)
  continuityContextEstablishedAt: number;

  // Optional ancestry metadata (caller-provided)
  metadata?: Record<string, unknown>;
}
