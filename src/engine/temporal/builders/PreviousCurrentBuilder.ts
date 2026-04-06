/**
 * Previous/Current Window Continuity Builders
 * Deterministic builders for continuity entities.
 * All inputs explicit, throw on missing required fields.
 * Never generate IDs, never generate timestamps, never infer roles/types.
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
import {
  ContinuityReferenceEntity,
  PreviousCurrentEntity,
  ContinuityPairEntity,
  ContinuitySetEntity,
  ContinuityMembershipEntity,
  FullContinuityAncestryEntity,
} from "../entities/PreviousCurrentEntity.ts";

/**
 * ContinuityReferenceBuilder
 * Deterministic builder for ContinuityReference.
 * All fields required, explicit specification only.
 */
export class ContinuityReferenceBuilder {
  private windowId: string | undefined;
  private role: ContinuityRole | undefined;
  private relationType: ContinuityRelationType | undefined;
  private continuityEstablishedAt: number | undefined;
  private continuityMetadata: Record<string, unknown> | undefined;

  withWindowId(id: string): this {
    if (typeof id !== "string" || id.length === 0) {
      throw new Error("ContinuityReferenceBuilder: windowId must be non-empty string");
    }
    this.windowId = id;
    return this;
  }

  withRole(role: ContinuityRole): this {
    const validRoles: ContinuityRole[] = ["previous", "current", "next"];
    if (!validRoles.includes(role)) {
      throw new Error(`ContinuityReferenceBuilder: invalid role "${role}"`);
    }
    this.role = role;
    return this;
  }

  withRelationType(type: ContinuityRelationType): this {
    const validTypes: ContinuityRelationType[] = [
      "sequential_progression",
      "paired_reference",
      "temporal_anchor",
      "custom_continuity",
    ];
    if (!validTypes.includes(type)) {
      throw new Error(`ContinuityReferenceBuilder: invalid relationType "${type}"`);
    }
    this.relationType = type;
    return this;
  }

  withContinuityEstablishedAt(timestamp: number): this {
    if (typeof timestamp !== "number" || timestamp < 0) {
      throw new Error(
        "ContinuityReferenceBuilder: continuityEstablishedAt must be non-negative number"
      );
    }
    this.continuityEstablishedAt = timestamp;
    return this;
  }

  withContinuityMetadata(metadata: Record<string, unknown>): this {
    if (typeof metadata !== "object" || metadata === null || Array.isArray(metadata)) {
      throw new Error("ContinuityReferenceBuilder: continuityMetadata must be plain object");
    }
    this.continuityMetadata = { ...metadata };
    return this;
  }

  build(): ContinuityReferenceEntity {
    if (this.windowId === undefined) {
      throw new Error("ContinuityReferenceBuilder: windowId is required");
    }
    if (this.role === undefined) {
      throw new Error("ContinuityReferenceBuilder: role is required");
    }
    if (this.relationType === undefined) {
      throw new Error("ContinuityReferenceBuilder: relationType is required");
    }
    if (this.continuityEstablishedAt === undefined) {
      throw new Error("ContinuityReferenceBuilder: continuityEstablishedAt is required");
    }

    const reference: ContinuityReference = {
      windowId: this.windowId,
      role: this.role,
      relationType: this.relationType,
      continuityEstablishedAt: this.continuityEstablishedAt,
      continuityMetadata: this.continuityMetadata,
    };

    return new ContinuityReferenceEntity(reference);
  }
}

/**
 * PreviousCurrentBuilder
 * Deterministic builder for PreviousCurrentContract.
 * All required fields explicit, no inference.
 */
export class PreviousCurrentBuilder {
  private currentWindowId: string | undefined;
  private previousWindowId: string | undefined;
  private nextWindowId: string | undefined;
  private continuityRelationType: ContinuityRelationType | undefined;
  private continuityEstablishedAt: number | undefined;
  private currentStartedAt: number | undefined;
  private continuityMetadata: Record<string, unknown> | undefined;

  withCurrentWindowId(id: string): this {
    if (typeof id !== "string" || id.length === 0) {
      throw new Error("PreviousCurrentBuilder: currentWindowId must be non-empty string");
    }
    this.currentWindowId = id;
    return this;
  }

  withPreviousWindowId(id: string): this {
    if (typeof id !== "string" || id.length === 0) {
      throw new Error("PreviousCurrentBuilder: previousWindowId must be non-empty string");
    }
    this.previousWindowId = id;
    return this;
  }

  withNextWindowId(id: string): this {
    if (typeof id !== "string" || id.length === 0) {
      throw new Error("PreviousCurrentBuilder: nextWindowId must be non-empty string");
    }
    this.nextWindowId = id;
    return this;
  }

  withContinuityRelationType(type: ContinuityRelationType): this {
    const validTypes: ContinuityRelationType[] = [
      "sequential_progression",
      "paired_reference",
      "temporal_anchor",
      "custom_continuity",
    ];
    if (!validTypes.includes(type)) {
      throw new Error(`PreviousCurrentBuilder: invalid continuityRelationType "${type}"`);
    }
    this.continuityRelationType = type;
    return this;
  }

  withContinuityEstablishedAt(timestamp: number): this {
    if (typeof timestamp !== "number" || timestamp < 0) {
      throw new Error("PreviousCurrentBuilder: continuityEstablishedAt must be non-negative number");
    }
    this.continuityEstablishedAt = timestamp;
    return this;
  }

  withCurrentStartedAt(timestamp: number): this {
    if (typeof timestamp !== "number" || timestamp < 0) {
      throw new Error("PreviousCurrentBuilder: currentStartedAt must be non-negative number");
    }
    this.currentStartedAt = timestamp;
    return this;
  }

  withContinuityMetadata(metadata: Record<string, unknown>): this {
    if (typeof metadata !== "object" || metadata === null || Array.isArray(metadata)) {
      throw new Error("PreviousCurrentBuilder: continuityMetadata must be plain object");
    }
    this.continuityMetadata = { ...metadata };
    return this;
  }

  build(): PreviousCurrentEntity {
    if (this.currentWindowId === undefined) {
      throw new Error("PreviousCurrentBuilder: currentWindowId is required");
    }
    if (this.previousWindowId === undefined) {
      throw new Error("PreviousCurrentBuilder: previousWindowId is required");
    }
    if (this.continuityRelationType === undefined) {
      throw new Error("PreviousCurrentBuilder: continuityRelationType is required");
    }
    if (this.continuityEstablishedAt === undefined) {
      throw new Error("PreviousCurrentBuilder: continuityEstablishedAt is required");
    }
    if (this.currentStartedAt === undefined) {
      throw new Error("PreviousCurrentBuilder: currentStartedAt is required");
    }

    const contract: PreviousCurrentContract = {
      currentWindowId: this.currentWindowId,
      previousWindowId: this.previousWindowId,
      nextWindowId: this.nextWindowId,
      continuityRelationType: this.continuityRelationType,
      continuityEstablishedAt: this.continuityEstablishedAt,
      currentStartedAt: this.currentStartedAt,
      continuityMetadata: this.continuityMetadata,
    };

    return new PreviousCurrentEntity(contract);
  }
}

/**
 * ContinuityPairBuilder
 * Deterministic builder for ContinuityPairIdentity.
 * All fields explicit, no ID generation.
 */
export class ContinuityPairBuilder {
  private pairId: string | undefined;
  private currentWindowId: string | undefined;
  private previousWindowId: string | undefined;
  private pairingEstablishedAt: number | undefined;
  private pairMetadata: Record<string, unknown> | undefined;

  withPairId(id: string): this {
    if (typeof id !== "string" || id.length === 0) {
      throw new Error("ContinuityPairBuilder: pairId must be non-empty string");
    }
    this.pairId = id;
    return this;
  }

  withCurrentWindowId(id: string): this {
    if (typeof id !== "string" || id.length === 0) {
      throw new Error("ContinuityPairBuilder: currentWindowId must be non-empty string");
    }
    this.currentWindowId = id;
    return this;
  }

  withPreviousWindowId(id: string): this {
    if (typeof id !== "string" || id.length === 0) {
      throw new Error("ContinuityPairBuilder: previousWindowId must be non-empty string");
    }
    this.previousWindowId = id;
    return this;
  }

  withPairingEstablishedAt(timestamp: number): this {
    if (typeof timestamp !== "number" || timestamp < 0) {
      throw new Error("ContinuityPairBuilder: pairingEstablishedAt must be non-negative number");
    }
    this.pairingEstablishedAt = timestamp;
    return this;
  }

  withPairMetadata(metadata: Record<string, unknown>): this {
    if (typeof metadata !== "object" || metadata === null || Array.isArray(metadata)) {
      throw new Error("ContinuityPairBuilder: pairMetadata must be plain object");
    }
    this.pairMetadata = { ...metadata };
    return this;
  }

  build(): ContinuityPairEntity {
    if (this.pairId === undefined) {
      throw new Error("ContinuityPairBuilder: pairId is required");
    }
    if (this.currentWindowId === undefined) {
      throw new Error("ContinuityPairBuilder: currentWindowId is required");
    }
    if (this.previousWindowId === undefined) {
      throw new Error("ContinuityPairBuilder: previousWindowId is required");
    }
    if (this.pairingEstablishedAt === undefined) {
      throw new Error("ContinuityPairBuilder: pairingEstablishedAt is required");
    }

    const identity: ContinuityPairIdentity = {
      pairId: this.pairId,
      currentWindowId: this.currentWindowId,
      previousWindowId: this.previousWindowId,
      pairingEstablishedAt: this.pairingEstablishedAt,
      pairMetadata: this.pairMetadata,
    };

    return new ContinuityPairEntity(identity);
  }
}

/**
 * ContinuitySetBuilder
 * Deterministic builder for ContinuitySet.
 * All fields explicit, caller provides window order.
 */
export class ContinuitySetBuilder {
  private setId: string | undefined;
  private windowIds: string[] | undefined;
  private currentWindowIndex: number | undefined;
  private continuityType: ContinuityRelationType | undefined;
  private setEstablishedAt: number | undefined;
  private setMetadata: Record<string, unknown> | undefined;

  withSetId(id: string): this {
    if (typeof id !== "string" || id.length === 0) {
      throw new Error("ContinuitySetBuilder: setId must be non-empty string");
    }
    this.setId = id;
    return this;
  }

  withWindowIds(ids: string[]): this {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error("ContinuitySetBuilder: windowIds must be non-empty array");
    }
    if (!ids.every(id => typeof id === "string" && id.length > 0)) {
      throw new Error("ContinuitySetBuilder: all windowIds must be non-empty strings");
    }
    this.windowIds = [...ids];
    return this;
  }

  withCurrentWindowIndex(index: number): this {
    if (typeof index !== "number" || index < 0) {
      throw new Error("ContinuitySetBuilder: currentWindowIndex must be non-negative number");
    }
    this.currentWindowIndex = index;
    return this;
  }

  withContinuityType(type: ContinuityRelationType): this {
    const validTypes: ContinuityRelationType[] = [
      "sequential_progression",
      "paired_reference",
      "temporal_anchor",
      "custom_continuity",
    ];
    if (!validTypes.includes(type)) {
      throw new Error(`ContinuitySetBuilder: invalid continuityType "${type}"`);
    }
    this.continuityType = type;
    return this;
  }

  withSetEstablishedAt(timestamp: number): this {
    if (typeof timestamp !== "number" || timestamp < 0) {
      throw new Error("ContinuitySetBuilder: setEstablishedAt must be non-negative number");
    }
    this.setEstablishedAt = timestamp;
    return this;
  }

  withSetMetadata(metadata: Record<string, unknown>): this {
    if (typeof metadata !== "object" || metadata === null || Array.isArray(metadata)) {
      throw new Error("ContinuitySetBuilder: setMetadata must be plain object");
    }
    this.setMetadata = { ...metadata };
    return this;
  }

  build(): ContinuitySetEntity {
    if (this.setId === undefined) {
      throw new Error("ContinuitySetBuilder: setId is required");
    }
    if (this.windowIds === undefined || this.windowIds.length === 0) {
      throw new Error("ContinuitySetBuilder: windowIds is required (non-empty)");
    }
    if (this.currentWindowIndex === undefined) {
      throw new Error("ContinuitySetBuilder: currentWindowIndex is required");
    }
    if (this.currentWindowIndex >= this.windowIds.length) {
      throw new Error("ContinuitySetBuilder: currentWindowIndex must be within windowIds bounds");
    }
    if (this.continuityType === undefined) {
      throw new Error("ContinuitySetBuilder: continuityType is required");
    }
    if (this.setEstablishedAt === undefined) {
      throw new Error("ContinuitySetBuilder: setEstablishedAt is required");
    }

    const set: ContinuitySet = {
      setId: this.setId,
      windowIds: this.windowIds,
      currentWindowIndex: this.currentWindowIndex,
      continuityType: this.continuityType,
      setEstablishedAt: this.setEstablishedAt,
      setMetadata: this.setMetadata,
    };

    return new ContinuitySetEntity(set);
  }
}

/**
 * ContinuityMembershipBuilder
 * Deterministic builder for ContinuityMembership.
 * All fields explicit, no inference of position or role.
 */
export class ContinuityMembershipBuilder {
  private windowId: string | undefined;
  private setId: string | undefined;
  private positionInSet: number | undefined;
  private roleInSet: ContinuityRole | undefined;
  private membershipEstablishedAt: number | undefined;
  private membershipMetadata: Record<string, unknown> | undefined;

  withWindowId(id: string): this {
    if (typeof id !== "string" || id.length === 0) {
      throw new Error("ContinuityMembershipBuilder: windowId must be non-empty string");
    }
    this.windowId = id;
    return this;
  }

  withSetId(id: string): this {
    if (typeof id !== "string" || id.length === 0) {
      throw new Error("ContinuityMembershipBuilder: setId must be non-empty string");
    }
    this.setId = id;
    return this;
  }

  withPositionInSet(position: number): this {
    if (typeof position !== "number" || position < 0) {
      throw new Error("ContinuityMembershipBuilder: positionInSet must be non-negative number");
    }
    this.positionInSet = position;
    return this;
  }

  withRoleInSet(role: ContinuityRole): this {
    const validRoles: ContinuityRole[] = ["previous", "current", "next"];
    if (!validRoles.includes(role)) {
      throw new Error(`ContinuityMembershipBuilder: invalid roleInSet "${role}"`);
    }
    this.roleInSet = role;
    return this;
  }

  withMembershipEstablishedAt(timestamp: number): this {
    if (typeof timestamp !== "number" || timestamp < 0) {
      throw new Error(
        "ContinuityMembershipBuilder: membershipEstablishedAt must be non-negative number"
      );
    }
    this.membershipEstablishedAt = timestamp;
    return this;
  }

  withMembershipMetadata(metadata: Record<string, unknown>): this {
    if (typeof metadata !== "object" || metadata === null || Array.isArray(metadata)) {
      throw new Error("ContinuityMembershipBuilder: membershipMetadata must be plain object");
    }
    this.membershipMetadata = { ...metadata };
    return this;
  }

  build(): ContinuityMembershipEntity {
    if (this.windowId === undefined) {
      throw new Error("ContinuityMembershipBuilder: windowId is required");
    }
    if (this.setId === undefined) {
      throw new Error("ContinuityMembershipBuilder: setId is required");
    }
    if (this.positionInSet === undefined) {
      throw new Error("ContinuityMembershipBuilder: positionInSet is required");
    }
    if (this.roleInSet === undefined) {
      throw new Error("ContinuityMembershipBuilder: roleInSet is required");
    }
    if (this.membershipEstablishedAt === undefined) {
      throw new Error("ContinuityMembershipBuilder: membershipEstablishedAt is required");
    }

    const membership: ContinuityMembership = {
      windowId: this.windowId,
      setId: this.setId,
      positionInSet: this.positionInSet,
      roleInSet: this.roleInSet,
      membershipEstablishedAt: this.membershipEstablishedAt,
      membershipMetadata: this.membershipMetadata,
    };

    return new ContinuityMembershipEntity(membership);
  }
}

/**
 * FullContinuityAncestryBuilder
 * Deterministic builder for FullContinuityAncestry.
 * All fields explicit, can be built with or without previous/next context.
 */
export class FullContinuityAncestryBuilder {
  private windowId: string | undefined;
  private role: ContinuityRole | undefined;
  private previousContext: ContinuityReference | undefined;
  private nextContext: ContinuityReference | undefined;
  private continuityContextEstablishedAt: number | undefined;
  private metadata: Record<string, unknown> | undefined;

  withWindowId(id: string): this {
    if (typeof id !== "string" || id.length === 0) {
      throw new Error("FullContinuityAncestryBuilder: windowId must be non-empty string");
    }
    this.windowId = id;
    return this;
  }

  withRole(role: ContinuityRole): this {
    const validRoles: ContinuityRole[] = ["previous", "current", "next"];
    if (!validRoles.includes(role)) {
      throw new Error(`FullContinuityAncestryBuilder: invalid role "${role}"`);
    }
    this.role = role;
    return this;
  }

  withPreviousContext(reference: ContinuityReference): this {
    if (!reference || typeof reference !== "object") {
      throw new Error("FullContinuityAncestryBuilder: previousContext must be valid object");
    }
    this.previousContext = { ...reference };
    return this;
  }

  withNextContext(reference: ContinuityReference): this {
    if (!reference || typeof reference !== "object") {
      throw new Error("FullContinuityAncestryBuilder: nextContext must be valid object");
    }
    this.nextContext = { ...reference };
    return this;
  }

  withContinuityContextEstablishedAt(timestamp: number): this {
    if (typeof timestamp !== "number" || timestamp < 0) {
      throw new Error(
        "FullContinuityAncestryBuilder: continuityContextEstablishedAt must be non-negative number"
      );
    }
    this.continuityContextEstablishedAt = timestamp;
    return this;
  }

  withMetadata(metadata: Record<string, unknown>): this {
    if (typeof metadata !== "object" || metadata === null || Array.isArray(metadata)) {
      throw new Error("FullContinuityAncestryBuilder: metadata must be plain object");
    }
    this.metadata = { ...metadata };
    return this;
  }

  build(): FullContinuityAncestryEntity {
    if (this.windowId === undefined) {
      throw new Error("FullContinuityAncestryBuilder: windowId is required");
    }
    if (this.role === undefined) {
      throw new Error("FullContinuityAncestryBuilder: role is required");
    }
    if (this.continuityContextEstablishedAt === undefined) {
      throw new Error("FullContinuityAncestryBuilder: continuityContextEstablishedAt is required");
    }

    const ancestry: FullContinuityAncestry = {
      windowId: this.windowId,
      role: this.role,
      previousContext: this.previousContext,
      nextContext: this.nextContext,
      continuityContextEstablishedAt: this.continuityContextEstablishedAt,
      metadata: this.metadata,
    };

    return new FullContinuityAncestryEntity(ancestry);
  }
}
