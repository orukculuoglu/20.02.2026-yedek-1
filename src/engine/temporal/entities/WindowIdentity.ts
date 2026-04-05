/**
 * Window Identity Models
 * Explicit structural identity representations for temporal windows.
 * Identity must be deterministic and fully explicit.
 * No implicit generation logic.
 */

/**
 * TemporalWindowIdentifier
 * Explicit identifier for a temporal window.
 * Single, deterministic, immutable identity for a window instance.
 * 
 * Format: Must be provided by caller.
 * No generation, no hashing, no transformation.
 */
export interface TemporalWindowIdentifier {
  id: string;                    // The authoritative identifier
  generatedAt: number;           // When identifier was assigned (Unix ms)
  source: "provided" | "external" | "migrated";  // Where the id came from
}

/**
 * CanonicalWindowIdentity
 * Complete structural identity for a canonical temporal window.
 * Bundles the identifier with creation lifecycle traceback.
 * 
 * Purpose: Serve as the single authoritative reference for a window.
 * No references to this window duplicated elsewhere.
 */
export interface CanonicalWindowIdentity {
  identifier: TemporalWindowIdentifier;
  
  // Window family/classification at identity level
  windowType: "REFERENCE" | "COMPARISON" | "BASELINE" | "SNAPSHOT";
  windowRole: "PRIMARY" | "SECONDARY" | "CONTROL" | "TARGET" | "ANCHOR";
  
  // Creation metadata (identity lifecycle)
  createdAt: number;             // When window entity was created (Unix ms)
  version: string;               // Semantic version of this identity schema
}

/**
 * WindowIdentityReference
 * Minimal reference to another window's identity.
 * Used in relationships and inter-window links.
 * 
 * Does not duplicate full identity; just the ID + type for validation.
 */
export interface WindowIdentityReference {
  windowId: string;              // Reference to canonical identifier
  referencedType: "REFERENCE" | "COMPARISON" | "BASELINE" | "SNAPSHOT";
  referencedRole: "PRIMARY" | "SECONDARY" | "CONTROL" | "TARGET" | "ANCHOR";
}

/**
 * WindowIdentitySet
 * Explicit collection of window identities.
 * Used when multiple windows need coordinated identity tracking.
 */
export interface WindowIdentitySet {
  setId: string;
  windowIdentities: CanonicalWindowIdentity[];
  createdAt: number;             // When set was assembled (Unix ms)
}
