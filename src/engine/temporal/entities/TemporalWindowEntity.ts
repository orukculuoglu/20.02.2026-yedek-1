/**
 * Temporal Window Entity Models
 * Concrete entity models implementing or wrapping the temporal contracts.
 * Represent canonical instantiated temporal window structures.
 * No behavior beyond structural methods.
 */

import type {
  MultiWindowTemporalContract,
  TemporalWindowBoundary,
  WindowRelationship,
} from "../contracts/index.ts";
import type { CanonicalWindowIdentity } from "./WindowIdentity.ts";

/**
 * TemporalWindowEntity
 * Concrete structural representation of a temporal window.
 * Wraps the contract and adds identity-level tracking.
 * 
 * Invariants:
 * - id in this entity matches the contract id
 * - All fields are explicit and required
 * - No default values
 * - Pure structural composition, no behavior
 */
export interface TemporalWindowEntity {
  // Canonical reference
  identity: CanonicalWindowIdentity;
  
  // Contract implementation
  contract: MultiWindowTemporalContract;
  
  // Entity-level metadata (beyond contract metadata)
  entityCreatedAt: number;       // When entity was instantiated (Unix ms)
}

/**
 * TemporalWindowSnapshot
 * Point-in-time capture of a window's structural state.
 * For archival or comparison purposes.
 */
export interface TemporalWindowSnapshot {
  snapshotId: string;
  windowId: string;              // Reference to original window
  boundary: TemporalWindowBoundary;
  extractedAt: number;           // When snapshot was taken (Unix ms)
  snapshotVersion: string;       // Semantic version
}

/**
 * BoundaryInstance
 * Concrete instantiation of a temporal window boundary.
 * Wraps the contract boundary with entity-level tracking.
 */
export interface BoundaryInstance {
  boundaryId: string;
  windowId: string;              // Reference to window
  start: number;                 // Unix milliseconds, inclusive
  end: number;                   // Unix milliseconds, inclusive
  durationMs: number;            // Computed: end - start
  createdAt: number;             // When boundary was instantiated (Unix ms)
}

/**
 * WindowTypeInstance
 * Concrete instantiation of a window's type/role classification.
 */
export interface WindowTypeInstance {
  instanceId: string;
  windowId: string;              // Reference to window
  type: "REFERENCE" | "COMPARISON" | "BASELINE" | "SNAPSHOT";
  role: "PRIMARY" | "SECONDARY" | "CONTROL" | "TARGET" | "ANCHOR";
  assignedAt: number;            // When type was assigned (Unix ms)
}

/**
 * ComparisonContractInstance
 * Concrete instantiation of a window's comparison specification.
 */
export interface ComparisonContractInstance {
  instanceId: string;
  windowId: string;              // Reference to window
  comparisonType: "absolute" | "relative" | "delta" | "ratio" | "index";
  alignmentType: "aligned" | "anchored_start" | "anchored_end" | "sliding" | "offset" | "concurrent";
  grain: "millisecond" | "second" | "minute" | "hour" | "day" | "week" | "month" | "quarter" | "year";
  assignedAt: number;            // When comparison contract was assigned (Unix ms)
}

/**
 * RelationshipInstance
 * Concrete instantiation of a relationship between windows.
 * Uses the contract's WindowRelationship discriminated union directly.
 */
export interface RelationshipInstance {
  instanceId: string;
  relationship: WindowRelationship;  // Canonical relationship structure from contracts
  createdAt: number;                 // When relationship instance was established (Unix ms)
}

/**
 * TemporalWindowEntityCollection
 * Explicit collection of multiple window entities.
 * For coordinated multi-window operations.
 */
export interface TemporalWindowEntityCollection {
  collectionId: string;
  windows: TemporalWindowEntity[];
  relationships: RelationshipInstance[];
  collectionCreatedAt: number;   // When collection was assembled (Unix ms)
}
