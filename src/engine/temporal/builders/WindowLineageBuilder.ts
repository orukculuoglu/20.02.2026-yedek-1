/**
 * Window Lineage Builders
 * Deterministic builders for lineage entities.
 * All inputs explicit, throw on missing required fields.
 * Never generate IDs, never generate timestamps, never infer relations.
 */

import type {
  WindowLineageReference,
  WindowLineageContract,
  WindowLineageChain,
  WindowLineageRole,
  WindowLineageRelationType,
  WindowLineageAncestry,
} from "../contracts/WindowLineageContract.ts";
import type { WindowLineageMembershipEntity } from "../entities/WindowLineageEntity.ts";
import {
  WindowLineageEntity,
  WindowLineageChainEntity,
  WindowLineageAncestryEntity,
} from "../entities/WindowLineageEntity.ts";

/**
 * WindowLineageReferenceBuilder
 * Deterministic builder for WindowLineageReference.
 * All fields required, explicit specification only.
 */
export class WindowLineageReferenceBuilder {
  private windowId: string | undefined;
  private role: WindowLineageRole | undefined;
  private relationType: WindowLineageRelationType | undefined;
  private relationshipEstablishedAt: number | undefined;
  private relationshipMetadata: Record<string, unknown> | undefined;

  /**
   * withWindowId
   * Specify the referenced window ID.
   *
   * @param id - Window identifier (caller-provided)
   * @throws If id is empty string or not a string
   */
  withWindowId(id: string): this {
    if (typeof id !== "string" || id.length === 0) {
      throw new Error("WindowLineageReferenceBuilder: windowId must be non-empty string");
    }
    this.windowId = id;
    return this;
  }

  /**
   * withRole
   * Specify the role of the referenced window.
   *
   * @param role - Valid lineage role
   * @throws If role is invalid
   */
  withRole(role: WindowLineageRole): this {
    const validRoles: WindowLineageRole[] = [
      "previous",
      "current",
      "next",
      "baseline",
      "reference",
    ];
    if (!validRoles.includes(role)) {
      throw new Error(`WindowLineageReferenceBuilder: invalid role "${role}"`);
    }
    this.role = role;
    return this;
  }

  /**
   * withRelationType
   * Specify the type of relationship.
   *
   * @param type - Valid relation type
   * @throws If type is invalid
   */
  withRelationType(type: WindowLineageRelationType): this {
    const validTypes: WindowLineageRelationType[] = [
      "sequential_predecessor",
      "sequential_successor",
      "baseline_anchor",
      "reference_anchor",
      "temporal_sibling",
      "custom_relation",
    ];
    if (!validTypes.includes(type)) {
      throw new Error(`WindowLineageReferenceBuilder: invalid relationType "${type}"`);
    }
    this.relationType = type;
    return this;
  }

  /**
   * withRelationshipEstablishedAt
   * Specify when the relationship was established (caller-provided timestamp).
   *
   * @param timestamp - Unix milliseconds (caller-provided)
   * @throws If timestamp is not a positive number
   */
  withRelationshipEstablishedAt(timestamp: number): this {
    if (typeof timestamp !== "number" || timestamp < 0) {
      throw new Error(
        "WindowLineageReferenceBuilder: relationshipEstablishedAt must be non-negative number"
      );
    }
    this.relationshipEstablishedAt = timestamp;
    return this;
  }

  /**
   * withRelationshipMetadata
   * Optionally specify metadata about the relationship.
   *
   * @param metadata - Optional metadata object (caller-provided)
   * @throws If metadata is not a plain object
   */
  withRelationshipMetadata(metadata: Record<string, unknown>): this {
    if (typeof metadata !== "object" || metadata === null || Array.isArray(metadata)) {
      throw new Error(
        "WindowLineageReferenceBuilder: relationshipMetadata must be plain object"
      );
    }
    this.relationshipMetadata = { ...metadata };
    return this;
  }

  /**
   * build
   * Construct the WindowLineageReference.
   *
   * @returns Complete WindowLineageReference
   * @throws If any required field is missing
   */
  build(): WindowLineageReference {
    if (this.windowId === undefined) {
      throw new Error("WindowLineageReferenceBuilder: windowId is required");
    }
    if (this.role === undefined) {
      throw new Error("WindowLineageReferenceBuilder: role is required");
    }
    if (this.relationType === undefined) {
      throw new Error("WindowLineageReferenceBuilder: relationType is required");
    }
    if (this.relationshipEstablishedAt === undefined) {
      throw new Error("WindowLineageReferenceBuilder: relationshipEstablishedAt is required");
    }

    return {
      windowId: this.windowId,
      role: this.role,
      relationType: this.relationType,
      relationshipEstablishedAt: this.relationshipEstablishedAt,
      relationshipMetadata: this.relationshipMetadata,
    };
  }
}

/**
 * WindowLineageEntityBuilder
 * Deterministic builder for WindowLineageEntity.
 * All fields explicit, no inference, no defaults.
 */
export class WindowLineageEntityBuilder {
  private windowId: string | undefined;
  private windowCreatedAt: number | undefined;
  private roleInContext: WindowLineageRole | undefined;
  private lineageReferences: WindowLineageReference[] = [];
  private depthInChain: number | undefined;
  private sequencePosition: number | undefined;
  private lineageMetadata: Record<string, unknown> | undefined;

  /**
   * withWindowId
   * Specify the window ID.
   *
   * @param id - Window identifier (caller-provided)
   * @throws If id is empty string
   */
  withWindowId(id: string): this {
    if (typeof id !== "string" || id.length === 0) {
      throw new Error("WindowLineageEntityBuilder: windowId must be non-empty string");
    }
    this.windowId = id;
    return this;
  }

  /**
   * withWindowCreatedAt
   * Specify when the window was created (caller-provided timestamp).
   *
   * @param timestamp - Unix milliseconds
   * @throws If timestamp is not a non-negative number
   */
  withWindowCreatedAt(timestamp: number): this {
    if (typeof timestamp !== "number" || timestamp < 0) {
      throw new Error("WindowLineageEntityBuilder: windowCreatedAt must be non-negative number");
    }
    this.windowCreatedAt = timestamp;
    return this;
  }

  /**
   * withRoleInContext
   * Specify this window's role in the lineage context.
   *
   * @param role - Valid lineage role
   * @throws If role is invalid
   */
  withRoleInContext(role: WindowLineageRole): this {
    const validRoles: WindowLineageRole[] = [
      "previous",
      "current",
      "next",
      "baseline",
      "reference",
    ];
    if (!validRoles.includes(role)) {
      throw new Error(`WindowLineageEntityBuilder: invalid roleInContext "${role}"`);
    }
    this.roleInContext = role;
    return this;
  }

  /**
   * addLineageReference
   * Add a lineage reference.
   * Can be called multiple times to add multiple references.
   *
   * @param reference - WindowLineageReference to add
   * @throws If reference is invalid
   */
  addLineageReference(reference: WindowLineageReference): this {
    if (!reference || typeof reference !== "object") {
      throw new Error("WindowLineageEntityBuilder: reference must be valid object");
    }
    if (typeof reference.windowId !== "string" || reference.windowId.length === 0) {
      throw new Error("WindowLineageEntityBuilder: reference.windowId must be non-empty string");
    }
    this.lineageReferences.push(reference);
    return this;
  }

  /**
   * withLineageReferences
   * Set all lineage references at once.
   * Replaces any previously added references.
   *
   * @param references - Array of WindowLineageReference
   * @throws If references is not an array
   */
  withLineageReferences(references: WindowLineageReference[]): this {
    if (!Array.isArray(references)) {
      throw new Error("WindowLineageEntityBuilder: references must be array");
    }
    this.lineageReferences = [...references];
    return this;
  }

  /**
   * withDepthInChain
   * Optionally specify depth in lineage chain.
   *
   * @param depth - Chain depth (0-indexed position)
   * @throws If depth is not a non-negative number
   */
  withDepthInChain(depth: number): this {
    if (typeof depth !== "number" || depth < 0) {
      throw new Error("WindowLineageEntityBuilder: depthInChain must be non-negative number");
    }
    this.depthInChain = depth;
    return this;
  }

  /**
   * withSequencePosition
   * Optionally specify sequence position.
   *
   * @param position - Sequence position
   * @throws If position is not a non-negative number
   */
  withSequencePosition(position: number): this {
    if (typeof position !== "number" || position < 0) {
      throw new Error("WindowLineageEntityBuilder: sequencePosition must be non-negative number");
    }
    this.sequencePosition = position;
    return this;
  }

  /**
   * withLineageMetadata
   * Optionally specify lineage metadata.
   *
   * @param metadata - Metadata object (caller-provided)
   * @throws If metadata is not a plain object
   */
  withLineageMetadata(metadata: Record<string, unknown>): this {
    if (typeof metadata !== "object" || metadata === null || Array.isArray(metadata)) {
      throw new Error("WindowLineageEntityBuilder: lineageMetadata must be plain object");
    }
    this.lineageMetadata = { ...metadata };
    return this;
  }

  /**
   * build
   * Construct the WindowLineageEntity.
   *
   * @returns Complete WindowLineageEntity
   * @throws If any required field is missing
   */
  build(): WindowLineageEntity {
    if (this.windowId === undefined) {
      throw new Error("WindowLineageEntityBuilder: windowId is required");
    }
    if (this.windowCreatedAt === undefined) {
      throw new Error("WindowLineageEntityBuilder: windowCreatedAt is required");
    }
    if (this.roleInContext === undefined) {
      throw new Error("WindowLineageEntityBuilder: roleInContext is required");
    }

    const contract: WindowLineageContract = {
      windowId: this.windowId,
      windowCreatedAt: this.windowCreatedAt,
      roleInContext: this.roleInContext,
      lineageReferences: this.lineageReferences,
      depthInChain: this.depthInChain,
      sequencePosition: this.sequencePosition,
      lineageMetadata: this.lineageMetadata,
    };

    return new WindowLineageEntity(contract);
  }
}

/**
 * WindowLineageChainEntityBuilder
 * Deterministic builder for WindowLineageChainEntity.
 * All fields explicit, no inference, no defaults.
 */
export class WindowLineageChainEntityBuilder {
  private chainId: string | undefined;
  private windowIds: string[] = [];
  private chainRole: WindowLineageRole | undefined;
  private chainEstablishedAt: number | undefined;
  private chainMetadata: Record<string, unknown> | undefined;

  /**
   * withChainId
   * Specify the chain ID.
   *
   * @param id - Chain identifier (caller-provided)
   * @throws If id is empty string
   */
  withChainId(id: string): this {
    if (typeof id !== "string" || id.length === 0) {
      throw new Error("WindowLineageChainEntityBuilder: chainId must be non-empty string");
    }
    this.chainId = id;
    return this;
  }

  /**
   * withWindowIds
   * Specify the windows in this chain (in caller-provided order).
   *
   * @param ids - Array of window IDs
   * @throws If ids is not a non-empty array of strings
   */
  withWindowIds(ids: string[]): this {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error("WindowLineageChainEntityBuilder: windowIds must be non-empty array");
    }
    if (!ids.every(id => typeof id === "string" && id.length > 0)) {
      throw new Error("WindowLineageChainEntityBuilder: all windowIds must be non-empty strings");
    }
    this.windowIds = [...ids];
    return this;
  }

  /**
   * withChainRole
   * Specify the role of this chain.
   *
   * @param role - Valid lineage role
   * @throws If role is invalid
   */
  withChainRole(role: WindowLineageRole): this {
    const validRoles: WindowLineageRole[] = [
      "previous",
      "current",
      "next",
      "baseline",
      "reference",
    ];
    if (!validRoles.includes(role)) {
      throw new Error(`WindowLineageChainEntityBuilder: invalid chainRole "${role}"`);
    }
    this.chainRole = role;
    return this;
  }

  /**
   * withChainEstablishedAt
   * Specify when the chain was established (caller-provided timestamp).
   *
   * @param timestamp - Unix milliseconds
   * @throws If timestamp is not a non-negative number
   */
  withChainEstablishedAt(timestamp: number): this {
    if (typeof timestamp !== "number" || timestamp < 0) {
      throw new Error(
        "WindowLineageChainEntityBuilder: chainEstablishedAt must be non-negative number"
      );
    }
    this.chainEstablishedAt = timestamp;
    return this;
  }

  /**
   * withChainMetadata
   * Optionally specify chain metadata.
   *
   * @param metadata - Metadata object (caller-provided)
   * @throws If metadata is not a plain object
   */
  withChainMetadata(metadata: Record<string, unknown>): this {
    if (typeof metadata !== "object" || metadata === null || Array.isArray(metadata)) {
      throw new Error("WindowLineageChainEntityBuilder: chainMetadata must be plain object");
    }
    this.chainMetadata = { ...metadata };
    return this;
  }

  /**
   * build
   * Construct the WindowLineageChainEntity.
   *
   * @returns Complete WindowLineageChainEntity
   * @throws If any required field is missing
   */
  build(): WindowLineageChainEntity {
    if (this.chainId === undefined) {
      throw new Error("WindowLineageChainEntityBuilder: chainId is required");
    }
    if (this.windowIds.length === 0) {
      throw new Error("WindowLineageChainEntityBuilder: windowIds is required (non-empty)");
    }
    if (this.chainRole === undefined) {
      throw new Error("WindowLineageChainEntityBuilder: chainRole is required");
    }
    if (this.chainEstablishedAt === undefined) {
      throw new Error("WindowLineageChainEntityBuilder: chainEstablishedAt is required");
    }

    const contract: WindowLineageChain = {
      chainId: this.chainId,
      windowIds: this.windowIds,
      chainRole: this.chainRole,
      chainEstablishedAt: this.chainEstablishedAt,
      chainMetadata: this.chainMetadata,
    };

    return new WindowLineageChainEntity(contract);
  }
}

/**
 * WindowLineageAncestryEntityBuilder
 * Deterministic builder for WindowLineageAncestryEntity.
 * All fields explicit, can start with empty ancestry.
 */
export class WindowLineageAncestryEntityBuilder {
  private windowId: string | undefined;
  private role: WindowLineageRole | undefined;
  private predecessors: WindowLineageReference[] = [];
  private successors: WindowLineageReference[] = [];
  private baselineAnchors: WindowLineageReference[] = [];
  private referenceAnchors: WindowLineageReference[] = [];
  private siblings: WindowLineageReference[] = [];
  private metadata: Record<string, unknown> | undefined;

  /**
   * withWindowId
   * Specify the window ID.
   *
   * @param id - Window identifier (caller-provided)
   * @throws If id is empty string
   */
  withWindowId(id: string): this {
    if (typeof id !== "string" || id.length === 0) {
      throw new Error("WindowLineageAncestryEntityBuilder: windowId must be non-empty string");
    }
    this.windowId = id;
    return this;
  }

  /**
   * withRole
   * Specify the window's role in ancestry context.
   *
   * @param role - Valid lineage role
   * @throws If role is invalid
   */
  withRole(role: WindowLineageRole): this {
    const validRoles: WindowLineageRole[] = [
      "previous",
      "current",
      "next",
      "baseline",
      "reference",
    ];
    if (!validRoles.includes(role)) {
      throw new Error(`WindowLineageAncestryEntityBuilder: invalid role "${role}"`);
    }
    this.role = role;
    return this;
  }

  /**
   * withPredecessors
   * Set all predecessors at once.
   *
   * @param refs - Array of predecessor references
   * @throws If refs is not an array
   */
  withPredecessors(refs: WindowLineageReference[]): this {
    if (!Array.isArray(refs)) {
      throw new Error("WindowLineageAncestryEntityBuilder: predecessors must be array");
    }
    this.predecessors = [...refs];
    return this;
  }

  /**
   * withSuccessors
   * Set all successors at once.
   *
   * @param refs - Array of successor references
   * @throws If refs is not an array
   */
  withSuccessors(refs: WindowLineageReference[]): this {
    if (!Array.isArray(refs)) {
      throw new Error("WindowLineageAncestryEntityBuilder: successors must be array");
    }
    this.successors = [...refs];
    return this;
  }

  /**
   * withBaselineAnchors
   * Set all baseline anchors at once.
   *
   * @param refs - Array of baseline anchor references
   * @throws If refs is not an array
   */
  withBaselineAnchors(refs: WindowLineageReference[]): this {
    if (!Array.isArray(refs)) {
      throw new Error("WindowLineageAncestryEntityBuilder: baselineAnchors must be array");
    }
    this.baselineAnchors = [...refs];
    return this;
  }

  /**
   * withReferenceAnchors
   * Set all reference anchors at once.
   *
   * @param refs - Array of reference anchor references
   * @throws If refs is not an array
   */
  withReferenceAnchors(refs: WindowLineageReference[]): this {
    if (!Array.isArray(refs)) {
      throw new Error("WindowLineageAncestryEntityBuilder: referenceAnchors must be array");
    }
    this.referenceAnchors = [...refs];
    return this;
  }

  /**
   * withSiblings
   * Set all sibling references at once.
   *
   * @param refs - Array of sibling references
   * @throws If refs is not an array
   */
  withSiblings(refs: WindowLineageReference[]): this {
    if (!Array.isArray(refs)) {
      throw new Error("WindowLineageAncestryEntityBuilder: siblings must be array");
    }
    this.siblings = [...refs];
    return this;
  }

  /**
   * withMetadata
   * Optionally specify ancestry metadata.
   *
   * @param metadata - Metadata object (caller-provided)
   * @throws If metadata is not a plain object
   */
  withMetadata(metadata: Record<string, unknown>): this {
    if (typeof metadata !== "object" || metadata === null || Array.isArray(metadata)) {
      throw new Error("WindowLineageAncestryEntityBuilder: metadata must be plain object");
    }
    this.metadata = { ...metadata };
    return this;
  }

  /**
   * build
   * Construct the WindowLineageAncestryEntity.
   *
   * @returns Complete WindowLineageAncestryEntity
   * @throws If any required field is missing
   */
  build(): WindowLineageAncestryEntity {
    if (this.windowId === undefined) {
      throw new Error("WindowLineageAncestryEntityBuilder: windowId is required");
    }
    if (this.role === undefined) {
      throw new Error("WindowLineageAncestryEntityBuilder: role is required");
    }

    const ancestry: WindowLineageAncestry = {
      windowId: this.windowId,
      role: this.role,
      predecessors: this.predecessors,
      successors: this.successors,
      baselineAnchors: this.baselineAnchors,
      referenceAnchors: this.referenceAnchors,
      siblings: this.siblings,
      metadata: this.metadata,
    };

    return new WindowLineageAncestryEntity(ancestry);
  }
}
