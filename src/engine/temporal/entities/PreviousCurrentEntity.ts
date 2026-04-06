/**
 * Previous/Current Continuity Entities
 * Concrete entity models for continuity relationships.
 * Structural representation only - no behavior, no query methods, no computation.
 */

import type {
  ContinuityReference,
  PreviousCurrentContract,
  ContinuityPairIdentity,
  ContinuitySet,
  ContinuityMembership,
  FullContinuityAncestry,
  ContinuityRole,
  ContinuityRelationType,
} from "../contracts/PreviousCurrentContract.ts";

/**
 * ContinuityReferenceEntity
 * Concrete entity representing a reference from one window to another in continuity.
 * Canonical preservation of all caller-provided continuity data.
 * No behavior, no inference, no computation.
 */
export class ContinuityReferenceEntity implements ContinuityReference {
  readonly windowId: string;
  readonly role: ContinuityRole;
  readonly relationType: ContinuityRelationType;
  readonly continuityEstablishedAt: number;
  readonly continuityMetadata?: Record<string, unknown>;

  constructor(reference: ContinuityReference) {
    this.windowId = reference.windowId;
    this.role = reference.role;
    this.relationType = reference.relationType;
    this.continuityEstablishedAt = reference.continuityEstablishedAt;
    this.continuityMetadata = reference.continuityMetadata
      ? { ...reference.continuityMetadata }
      : undefined;
  }
}

/**
 * PreviousCurrentEntity
 * Concrete entity representing an explicit previous → current window pairing.
 * Canonical preservation of caller-provided continuity data.
 * No behavior, no inference, no computation.
 */
export class PreviousCurrentEntity implements PreviousCurrentContract {
  readonly currentWindowId: string;
  readonly previousWindowId: string;
  readonly nextWindowId?: string;
  readonly continuityRelationType: ContinuityRelationType;
  readonly continuityEstablishedAt: number;
  readonly currentStartedAt: number;
  readonly continuityMetadata?: Record<string, unknown>;

  constructor(contract: PreviousCurrentContract) {
    this.currentWindowId = contract.currentWindowId;
    this.previousWindowId = contract.previousWindowId;
    this.nextWindowId = contract.nextWindowId;
    this.continuityRelationType = contract.continuityRelationType;
    this.continuityEstablishedAt = contract.continuityEstablishedAt;
    this.currentStartedAt = contract.currentStartedAt;
    this.continuityMetadata = contract.continuityMetadata
      ? { ...contract.continuityMetadata }
      : undefined;
  }
}

/**
 * ContinuityPairEntity
 * Concrete entity representing a unique previous-current pairing with identity.
 * Canonical preservation of caller-provided pairing data.
 * No behavior, no inference, no computation.
 */
export class ContinuityPairEntity implements ContinuityPairIdentity {
  readonly pairId: string;
  readonly currentWindowId: string;
  readonly previousWindowId: string;
  readonly pairingEstablishedAt: number;
  readonly pairMetadata?: Record<string, unknown>;

  constructor(identity: ContinuityPairIdentity) {
    this.pairId = identity.pairId;
    this.currentWindowId = identity.currentWindowId;
    this.previousWindowId = identity.previousWindowId;
    this.pairingEstablishedAt = identity.pairingEstablishedAt;
    this.pairMetadata = identity.pairMetadata
      ? { ...identity.pairMetadata }
      : undefined;
  }
}

/**
 * ContinuitySetEntity
 * Concrete entity representing an ordered set of windows in continuity.
 * Canonical preservation of caller-provided set structure.
 * No behavior, no inference, no computation.
 */
export class ContinuitySetEntity implements ContinuitySet {
  readonly setId: string;
  readonly windowIds: string[];
  readonly currentWindowIndex: number;
  readonly continuityType: ContinuityRelationType;
  readonly setEstablishedAt: number;
  readonly setMetadata?: Record<string, unknown>;

  constructor(set: ContinuitySet) {
    this.setId = set.setId;
    this.windowIds = [...set.windowIds];
    this.currentWindowIndex = set.currentWindowIndex;
    this.continuityType = set.continuityType;
    this.setEstablishedAt = set.setEstablishedAt;
    this.setMetadata = set.setMetadata ? { ...set.setMetadata } : undefined;
  }
}

/**
 * ContinuityMembershipEntity
 * Concrete entity representing a window's membership in a continuity set.
 * Links window to its position and role within a continuity sequence.
 * Structural representation only.
 */
export class ContinuityMembershipEntity implements ContinuityMembership {
  readonly windowId: string;
  readonly setId: string;
  readonly positionInSet: number;
  readonly roleInSet: ContinuityRole;
  readonly membershipEstablishedAt: number;
  readonly membershipMetadata?: Record<string, unknown>;

  constructor(membership: ContinuityMembership) {
    this.windowId = membership.windowId;
    this.setId = membership.setId;
    this.positionInSet = membership.positionInSet;
    this.roleInSet = membership.roleInSet;
    this.membershipEstablishedAt = membership.membershipEstablishedAt;
    this.membershipMetadata = membership.membershipMetadata
      ? { ...membership.membershipMetadata }
      : undefined;
  }
}

/**
 * FullContinuityAncestryEntity
 * Concrete entity representing complete continuity context for a window.
 * Full snapshot of a window's position in previous/current/next progression.
 * Structural representation only - no behavior, no computation.
 */
export class FullContinuityAncestryEntity implements FullContinuityAncestry {
  readonly windowId: string;
  readonly role: ContinuityRole;
  readonly previousContext?: ContinuityReference;
  readonly nextContext?: ContinuityReference;
  readonly continuityContextEstablishedAt: number;
  readonly metadata?: Record<string, unknown>;

  constructor(ancestry: FullContinuityAncestry) {
    this.windowId = ancestry.windowId;
    this.role = ancestry.role;
    this.previousContext = ancestry.previousContext
      ? { ...ancestry.previousContext }
      : undefined;
    this.nextContext = ancestry.nextContext ? { ...ancestry.nextContext } : undefined;
    this.continuityContextEstablishedAt = ancestry.continuityContextEstablishedAt;
    this.metadata = ancestry.metadata ? { ...ancestry.metadata } : undefined;
  }
}
