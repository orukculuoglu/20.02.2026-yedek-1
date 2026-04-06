/**
 * Window Lineage Entities
 * Concrete entity models for lineage relationships.
 * Structural representation only - no behavior, no query methods, no computation.
 */

import type {
  WindowLineageReference,
  WindowLineageContract,
  WindowLineageChain,
  WindowLineageRole,
  WindowLineageAncestry,
} from "../contracts/WindowLineageContract.ts";

/**
 * WindowLineageEntity
 * Concrete entity representing a window with explicit lineage.
 * Canonical preservation of all caller-provided lineage data.
 * No behavior, no inference, no computation, no query methods.
 */
export class WindowLineageEntity implements WindowLineageContract {
  readonly windowId: string;
  readonly windowCreatedAt: number;
  readonly roleInContext: WindowLineageRole;
  readonly lineageReferences: WindowLineageReference[];
  readonly depthInChain?: number;
  readonly sequencePosition?: number;
  readonly lineageMetadata?: Record<string, unknown>;

  constructor(contract: WindowLineageContract) {
    this.windowId = contract.windowId;
    this.windowCreatedAt = contract.windowCreatedAt;
    this.roleInContext = contract.roleInContext;
    this.lineageReferences = [...contract.lineageReferences];
    this.depthInChain = contract.depthInChain;
    this.sequencePosition = contract.sequencePosition;
    this.lineageMetadata = contract.lineageMetadata
      ? { ...contract.lineageMetadata }
      : undefined;
  }
}

/**
 * WindowLineageChainEntity
 * Concrete entity representing a chain/sequence of related windows.
 * Canonical preservation of caller-provided chain structure.
 * No behavior, no inference, no computation, no query methods.
 */
export class WindowLineageChainEntity implements WindowLineageChain {
  readonly chainId: string;
  readonly windowIds: string[];
  readonly chainRole: WindowLineageRole;
  readonly chainEstablishedAt: number;
  readonly chainMetadata?: Record<string, unknown>;

  constructor(contract: WindowLineageChain) {
    this.chainId = contract.chainId;
    this.windowIds = [...contract.windowIds];
    this.chainRole = contract.chainRole;
    this.chainEstablishedAt = contract.chainEstablishedAt;
    this.chainMetadata = contract.chainMetadata
      ? { ...contract.chainMetadata }
      : undefined;
  }
}

/**
 * WindowLineageMembershipEntity
 * Concrete entity representing a window's membership in a lineage chain.
 * Links a window to its position and role within a chain.
 * Structural representation only.
 */
export interface WindowLineageMembershipEntity {
  // The window being positioned
  windowId: string;

  // The chain this window belongs to
  chainId: string;

  // Position in chain (0-indexed, caller-provided)
  positionInChain: number;

  // Depth in lineage (caller-provided if tracked)
  depthInLineage?: number;

  // When this membership was established (caller-provided, Unix milliseconds)
  membershipEstablishedAt: number;

  // Optional membership metadata (caller-provided)
  membershipMetadata?: Record<string, unknown>;
}

/**
 * WindowLineageAncestryEntity
 * Concrete entity representing complete lineage relationships for a window.
 * Full snapshot of a window's position in temporal continuity.
 * Structural representation only - no behavior, no computation, no query methods.
 */
export class WindowLineageAncestryEntity implements WindowLineageAncestry {
  readonly windowId: string;
  readonly role: WindowLineageRole;
  readonly predecessors: WindowLineageReference[];
  readonly successors: WindowLineageReference[];
  readonly baselineAnchors: WindowLineageReference[];
  readonly referenceAnchors: WindowLineageReference[];
  readonly siblings: WindowLineageReference[];
  readonly metadata?: Record<string, unknown>;

  constructor(ancestry: WindowLineageAncestry) {
    this.windowId = ancestry.windowId;
    this.role = ancestry.role;
    this.predecessors = [...ancestry.predecessors];
    this.successors = [...ancestry.successors];
    this.baselineAnchors = [...ancestry.baselineAnchors];
    this.referenceAnchors = [...ancestry.referenceAnchors];
    this.siblings = [...ancestry.siblings];
    this.metadata = ancestry.metadata ? { ...ancestry.metadata } : undefined;
  }
}
