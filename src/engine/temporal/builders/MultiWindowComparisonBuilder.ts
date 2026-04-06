/**
 * Multi-Window Comparison Foundation Builders
 * Deterministic construction of comparison structures.
 * 
 * Rules:
 * - Require explicit caller inputs for all required fields
 * - Throw descriptive errors on missing required fields
 * - Never generate IDs, never generate timestamps
 * - Never infer roles, arrangements, or ordering
 * - Validate enum values and required field presence
 * - No optional defaults, all optional fields caller-provided
 */

import type {
  ComparisonMember,
  ComparisonStructure,
  ComparisonSet,
  AnchoredComparison,
  BaselineComparison,
  RollingComparison,
  ComparisonArrangementType,
} from "../contracts/MultiWindowComparisonContract.ts";
import type { ComparisonWindowRole } from "../contracts/ComparisonEntities.ts";
import {
  ComparisonMemberEntity,
  ComparisonStructureEntity,
  ComparisonSetEntity,
  AnchoredComparisonEntity,
  BaselineComparisonEntity,
  RollingComparisonEntity,
} from "../entities/MultiWindowComparisonEntity.ts";

/**
 * ComparisonMemberBuilder
 * Build explicit window-to-comparison role binding.
 */
export class ComparisonMemberBuilder {
  private windowId?: string;
  private roleInComparison?: ComparisonWindowRole;
  private positionInComparison?: number;
  private membershipEstablishedAt?: number;
  private membershipMetadata?: Record<string, unknown>;

  withWindowId(windowId: string): this {
    if (!windowId || typeof windowId !== "string") {
      throw new Error("ComparisonMemberBuilder: windowId must be non-empty string");
    }
    this.windowId = windowId;
    return this;
  }

  withRoleInComparison(role: ComparisonWindowRole): this {
    if (!role || typeof role !== "string") {
      throw new Error("ComparisonMemberBuilder: roleInComparison must be valid role");
    }
    // Validate against existing ComparisonWindowRole enum values
    const validRoles = ["SOURCE", "TARGET", "BASELINE", "OBSERVATION", "REFERENCE", "CONTROL"];
    if (!validRoles.includes(role)) {
      throw new Error(
        `ComparisonMemberBuilder: roleInComparison '${role}' is not valid (expected: ${validRoles.join(", ")})`
      );
    }
    this.roleInComparison = role as unknown as ComparisonWindowRole;
    return this;
  }

  withPositionInComparison(position?: number): this {
    if (position !== undefined && typeof position !== "number") {
      throw new Error("ComparisonMemberBuilder: positionInComparison must be number if provided");
    }
    this.positionInComparison = position;
    return this;
  }

  withMembershipEstablishedAt(timestamp: number): this {
    if (typeof timestamp !== "number" || timestamp < 0) {
      throw new Error("ComparisonMemberBuilder: membershipEstablishedAt must be non-negative number");
    }
    this.membershipEstablishedAt = timestamp;
    return this;
  }

  withMembershipMetadata(metadata?: Record<string, unknown>): this {
    if (metadata !== undefined && (typeof metadata !== "object" || metadata === null || Array.isArray(metadata))) {
      throw new Error("ComparisonMemberBuilder: membershipMetadata must be object if provided");
    }
    this.membershipMetadata = metadata;
    return this;
  }

  build(): ComparisonMemberEntity {
    if (!this.windowId) {
      throw new Error("ComparisonMemberBuilder: windowId is required");
    }
    if (!this.roleInComparison) {
      throw new Error("ComparisonMemberBuilder: roleInComparison is required");
    }
    if (this.membershipEstablishedAt === undefined) {
      throw new Error("ComparisonMemberBuilder: membershipEstablishedAt is required");
    }

    return new ComparisonMemberEntity({
      windowId: this.windowId,
      roleInComparison: this.roleInComparison,
      positionInComparison: this.positionInComparison,
      membershipEstablishedAt: this.membershipEstablishedAt,
      membershipMetadata: this.membershipMetadata,
    });
  }
}

/**
 * ComparisonStructureBuilder
 * Build explicit comparison structure with members and arrangement.
 */
export class ComparisonStructureBuilder {
  private comparisonStructureId?: string;
  private members: ComparisonMember[] = [];
  private arrangementType?: ComparisonArrangementType;
  private targetWindowId?: string;
  private referenceWindowId?: string;
  private baselineWindowId?: string;
  private comparisonEstablishedAt?: number;
  private comparisonMetadata?: Record<string, unknown>;

  withComparisonStructureId(id: string): this {
    if (!id || typeof id !== "string") {
      throw new Error("ComparisonStructureBuilder: comparisonStructureId must be non-empty string");
    }
    this.comparisonStructureId = id;
    return this;
  }

  withMember(member: ComparisonMember): this {
    if (!member || typeof member !== "object") {
      throw new Error("ComparisonStructureBuilder: member must be valid ComparisonMember object");
    }
    this.members.push(member);
    return this;
  }

  withMembers(members: ComparisonMember[]): this {
    if (!Array.isArray(members)) {
      throw new Error("ComparisonStructureBuilder: members must be array");
    }
    this.members = Array.from(members);
    return this;
  }

  withArrangementType(type: ComparisonArrangementType): this {
    if (!type || typeof type !== "string") {
      throw new Error("ComparisonStructureBuilder: arrangementType must be valid type");
    }
    const validTypes: ComparisonArrangementType[] = [
      "pairwise",
      "anchored",
      "baseline_set",
      "rolling_set",
      "explicit_group",
    ];
    if (!validTypes.includes(type)) {
      throw new Error(
        `ComparisonStructureBuilder: arrangementType '${type}' is not valid (expected: ${validTypes.join(", ")})`
      );
    }
    this.arrangementType = type;
    return this;
  }

  withTargetWindowId(id?: string): this {
    if (id !== undefined && typeof id !== "string") {
      throw new Error("ComparisonStructureBuilder: targetWindowId must be string if provided");
    }
    this.targetWindowId = id;
    return this;
  }

  withReferenceWindowId(id?: string): this {
    if (id !== undefined && typeof id !== "string") {
      throw new Error("ComparisonStructureBuilder: referenceWindowId must be string if provided");
    }
    this.referenceWindowId = id;
    return this;
  }

  withBaselineWindowId(id?: string): this {
    if (id !== undefined && typeof id !== "string") {
      throw new Error("ComparisonStructureBuilder: baselineWindowId must be string if provided");
    }
    this.baselineWindowId = id;
    return this;
  }

  withComparisonEstablishedAt(timestamp: number): this {
    if (typeof timestamp !== "number" || timestamp < 0) {
      throw new Error("ComparisonStructureBuilder: comparisonEstablishedAt must be non-negative number");
    }
    this.comparisonEstablishedAt = timestamp;
    return this;
  }

  withComparisonMetadata(metadata?: Record<string, unknown>): this {
    if (metadata !== undefined && (typeof metadata !== "object" || metadata === null || Array.isArray(metadata))) {
      throw new Error("ComparisonStructureBuilder: comparisonMetadata must be object if provided");
    }
    this.comparisonMetadata = metadata;
    return this;
  }

  build(): ComparisonStructureEntity {
    if (!this.comparisonStructureId) {
      throw new Error("ComparisonStructureBuilder: comparisonStructureId is required");
    }
    if (this.members.length === 0) {
      throw new Error("ComparisonStructureBuilder: at least one member is required");
    }
    if (!this.arrangementType) {
      throw new Error("ComparisonStructureBuilder: arrangementType is required");
    }
    if (this.comparisonEstablishedAt === undefined) {
      throw new Error("ComparisonStructureBuilder: comparisonEstablishedAt is required");
    }

    return new ComparisonStructureEntity({
      comparisonStructureId: this.comparisonStructureId,
      members: this.members,
      arrangementType: this.arrangementType,
      targetWindowId: this.targetWindowId,
      referenceWindowId: this.referenceWindowId,
      baselineWindowId: this.baselineWindowId,
      comparisonEstablishedAt: this.comparisonEstablishedAt,
      comparisonMetadata: this.comparisonMetadata,
    });
  }
}

/**
 * ComparisonSetBuilder
 * Build explicit ordered set of windows with membership tracking.
 */
export class ComparisonSetBuilder {
  private comparisonSetId?: string;
  private windowIds: string[] = [];
  private arrangementType?: ComparisonArrangementType;
  private membershipList: ComparisonMember[] = [];
  private targetWindowId?: string;
  private referenceAnchors?: string[];
  private baselineAnchors?: string[];
  private setEstablishedAt?: number;
  private setMetadata?: Record<string, unknown>;

  withComparisonSetId(id: string): this {
    if (!id || typeof id !== "string") {
      throw new Error("ComparisonSetBuilder: comparisonSetId must be non-empty string");
    }
    this.comparisonSetId = id;
    return this;
  }

  withWindowId(id: string): this {
    if (!id || typeof id !== "string") {
      throw new Error("ComparisonSetBuilder: windowId must be non-empty string");
    }
    this.windowIds.push(id);
    return this;
  }

  withWindowIds(ids: string[]): this {
    if (!Array.isArray(ids)) {
      throw new Error("ComparisonSetBuilder: windowIds must be array");
    }
    this.windowIds = ids.filter((id) => typeof id === "string" && id.length > 0);
    if (this.windowIds.length !== ids.length) {
      throw new Error("ComparisonSetBuilder: all windowIds must be non-empty strings");
    }
    return this;
  }

  withArrangementType(type: ComparisonArrangementType): this {
    if (!type || typeof type !== "string") {
      throw new Error("ComparisonSetBuilder: arrangementType must be valid type");
    }
    const validTypes: ComparisonArrangementType[] = [
      "pairwise",
      "anchored",
      "baseline_set",
      "rolling_set",
      "explicit_group",
    ];
    if (!validTypes.includes(type)) {
      throw new Error(
        `ComparisonSetBuilder: arrangementType '${type}' is not valid (expected: ${validTypes.join(", ")})`
      );
    }
    this.arrangementType = type;
    return this;
  }

  withMembership(member: ComparisonMember): this {
    if (!member || typeof member !== "object") {
      throw new Error("ComparisonSetBuilder: member must be valid ComparisonMember object");
    }
    this.membershipList.push(member);
    return this;
  }

  withMembershipList(members: ComparisonMember[]): this {
    if (!Array.isArray(members)) {
      throw new Error("ComparisonSetBuilder: membershipList must be array");
    }
    this.membershipList = Array.from(members);
    return this;
  }

  withTargetWindowId(id?: string): this {
    if (id !== undefined && typeof id !== "string") {
      throw new Error("ComparisonSetBuilder: targetWindowId must be string if provided");
    }
    this.targetWindowId = id;
    return this;
  }

  withReferenceAnchors(ids?: string[]): this {
    if (ids !== undefined) {
      if (!Array.isArray(ids)) {
        throw new Error("ComparisonSetBuilder: referenceAnchors must be string array if provided");
      }
      if (!ids.every((id) => typeof id === "string")) {
        throw new Error("ComparisonSetBuilder: all referenceAnchors must be strings");
      }
    }
    this.referenceAnchors = ids;
    return this;
  }

  withBaselineAnchors(ids?: string[]): this {
    if (ids !== undefined) {
      if (!Array.isArray(ids)) {
        throw new Error("ComparisonSetBuilder: baselineAnchors must be string array if provided");
      }
      if (!ids.every((id) => typeof id === "string")) {
        throw new Error("ComparisonSetBuilder: all baselineAnchors must be strings");
      }
    }
    this.baselineAnchors = ids;
    return this;
  }

  withSetEstablishedAt(timestamp: number): this {
    if (typeof timestamp !== "number" || timestamp < 0) {
      throw new Error("ComparisonSetBuilder: setEstablishedAt must be non-negative number");
    }
    this.setEstablishedAt = timestamp;
    return this;
  }

  withSetMetadata(metadata?: Record<string, unknown>): this {
    if (metadata !== undefined && (typeof metadata !== "object" || metadata === null || Array.isArray(metadata))) {
      throw new Error("ComparisonSetBuilder: setMetadata must be object if provided");
    }
    this.setMetadata = metadata;
    return this;
  }

  build(): ComparisonSetEntity {
    if (!this.comparisonSetId) {
      throw new Error("ComparisonSetBuilder: comparisonSetId is required");
    }
    if (this.windowIds.length === 0) {
      throw new Error("ComparisonSetBuilder: at least one windowId is required");
    }
    if (!this.arrangementType) {
      throw new Error("ComparisonSetBuilder: arrangementType is required");
    }
    if (this.membershipList.length === 0) {
      throw new Error("ComparisonSetBuilder: at least one membership is required");
    }
    if (this.setEstablishedAt === undefined) {
      throw new Error("ComparisonSetBuilder: setEstablishedAt is required");
    }

    return new ComparisonSetEntity({
      comparisonSetId: this.comparisonSetId,
      windowIds: this.windowIds,
      arrangementType: this.arrangementType,
      membershipList: this.membershipList,
      targetWindowId: this.targetWindowId,
      referenceAnchors: this.referenceAnchors,
      baselineAnchors: this.baselineAnchors,
      setEstablishedAt: this.setEstablishedAt,
      setMetadata: this.setMetadata,
    });
  }
}

/**
 * AnchoredComparisonBuilder
 * Build anchor-centric comparison structure.
 */
export class AnchoredComparisonBuilder {
  private anchoredComparisonId?: string;
  private anchorWindowId?: string;
  private anchorRole?: ComparisonWindowRole;
  private comparedWindowIds: string[] = [];
  private comparedWindowRoles: ComparisonWindowRole[] = [];
  private anchoringEstablishedAt?: number;
  private anchoringMetadata?: Record<string, unknown>;

  withAnchoredComparisonId(id: string): this {
    if (!id || typeof id !== "string") {
      throw new Error("AnchoredComparisonBuilder: anchoredComparisonId must be non-empty string");
    }
    this.anchoredComparisonId = id;
    return this;
  }

  withAnchorWindowId(id: string): this {
    if (!id || typeof id !== "string") {
      throw new Error("AnchoredComparisonBuilder: anchorWindowId must be non-empty string");
    }
    this.anchorWindowId = id;
    return this;
  }

  withAnchorRole(role: ComparisonWindowRole): this {
    if (!role || typeof role !== "string") {
      throw new Error("AnchoredComparisonBuilder: anchorRole must be valid role");
    }
    const validRoles = ["SOURCE", "TARGET", "BASELINE", "OBSERVATION", "REFERENCE", "CONTROL"];
    if (!validRoles.includes(role)) {
      throw new Error(
        `AnchoredComparisonBuilder: anchorRole '${role}' is not valid (expected: ${validRoles.join(", ")})`
      );
    }
    this.anchorRole = role as unknown as ComparisonWindowRole;
    return this;
  }

  withComparedWindowId(id: string, role: ComparisonWindowRole): this {
    if (!id || typeof id !== "string") {
      throw new Error("AnchoredComparisonBuilder: compared windowId must be non-empty string");
    }
    if (!role || typeof role !== "string") {
      throw new Error("AnchoredComparisonBuilder: compared role must be valid role");
    }
    const validRoles = ["SOURCE", "TARGET", "BASELINE", "OBSERVATION", "REFERENCE", "CONTROL"];
    if (!validRoles.includes(role)) {
      throw new Error(
        `AnchoredComparisonBuilder: compared role '${role}' is not valid (expected: ${validRoles.join(", ")})`
      );
    }
    this.comparedWindowIds.push(id);
    this.comparedWindowRoles.push(role as unknown as ComparisonWindowRole);
    return this;
  }

  withAnchoringEstablishedAt(timestamp: number): this {
    if (typeof timestamp !== "number" || timestamp < 0) {
      throw new Error("AnchoredComparisonBuilder: anchoringEstablishedAt must be non-negative number");
    }
    this.anchoringEstablishedAt = timestamp;
    return this;
  }

  withAnchoringMetadata(metadata?: Record<string, unknown>): this {
    if (metadata !== undefined && (typeof metadata !== "object" || metadata === null || Array.isArray(metadata))) {
      throw new Error("AnchoredComparisonBuilder: anchoringMetadata must be object if provided");
    }
    this.anchoringMetadata = metadata;
    return this;
  }

  build(): AnchoredComparisonEntity {
    if (!this.anchoredComparisonId) {
      throw new Error("AnchoredComparisonBuilder: anchoredComparisonId is required");
    }
    if (!this.anchorWindowId) {
      throw new Error("AnchoredComparisonBuilder: anchorWindowId is required");
    }
    if (!this.anchorRole) {
      throw new Error("AnchoredComparisonBuilder: anchorRole is required");
    }
    if (this.comparedWindowIds.length === 0) {
      throw new Error("AnchoredComparisonBuilder: at least one compared window is required");
    }
    if (this.anchoringEstablishedAt === undefined) {
      throw new Error("AnchoredComparisonBuilder: anchoringEstablishedAt is required");
    }

    return new AnchoredComparisonEntity({
      anchoredComparisonId: this.anchoredComparisonId,
      anchorWindowId: this.anchorWindowId,
      anchorRole: this.anchorRole,
      comparedWindowIds: this.comparedWindowIds,
      comparedWindowRoles: this.comparedWindowRoles,
      anchoringEstablishedAt: this.anchoringEstablishedAt,
      anchoringMetadata: this.anchoringMetadata,
    });
  }
}

/**
 * BaselineComparisonBuilder
 * Build baseline-centric comparison structure.
 */
export class BaselineComparisonBuilder {
  private baselineComparisonId?: string;
  private baselineWindowId?: string;
  private comparedWindowIds: string[] = [];
  private comparedWindowRole?: ComparisonWindowRole;
  private baselineEstablishedAt?: number;
  private baselineMetadata?: Record<string, unknown>;

  withBaselineComparisonId(id: string): this {
    if (!id || typeof id !== "string") {
      throw new Error("BaselineComparisonBuilder: baselineComparisonId must be non-empty string");
    }
    this.baselineComparisonId = id;
    return this;
  }

  withBaselineWindowId(id: string): this {
    if (!id || typeof id !== "string") {
      throw new Error("BaselineComparisonBuilder: baselineWindowId must be non-empty string");
    }
    this.baselineWindowId = id;
    return this;
  }

  withComparedWindowId(id: string): this {
    if (!id || typeof id !== "string") {
      throw new Error("BaselineComparisonBuilder: compared windowId must be non-empty string");
    }
    this.comparedWindowIds.push(id);
    return this;
  }

  withComparedWindowIds(ids: string[]): this {
    if (!Array.isArray(ids)) {
      throw new Error("BaselineComparisonBuilder: compared windowIds must be array");
    }
    this.comparedWindowIds = ids.filter((id) => typeof id === "string" && id.length > 0);
    if (this.comparedWindowIds.length !== ids.length) {
      throw new Error("BaselineComparisonBuilder: all compared windowIds must be non-empty strings");
    }
    return this;
  }

  withComparedWindowRole(role: ComparisonWindowRole): this {
    if (!role || typeof role !== "string") {
      throw new Error("BaselineComparisonBuilder: comparedWindowRole must be valid role");
    }
    const validRoles = ["SOURCE", "TARGET", "BASELINE", "OBSERVATION", "REFERENCE", "CONTROL"];
    if (!validRoles.includes(role)) {
      throw new Error(
        `BaselineComparisonBuilder: comparedWindowRole '${role}' is not valid (expected: ${validRoles.join(", ")})`
      );
    }
    this.comparedWindowRole = role as unknown as ComparisonWindowRole;
    return this;
  }

  withBaselineEstablishedAt(timestamp: number): this {
    if (typeof timestamp !== "number" || timestamp < 0) {
      throw new Error("BaselineComparisonBuilder: baselineEstablishedAt must be non-negative number");
    }
    this.baselineEstablishedAt = timestamp;
    return this;
  }

  withBaselineMetadata(metadata?: Record<string, unknown>): this {
    if (metadata !== undefined && (typeof metadata !== "object" || metadata === null || Array.isArray(metadata))) {
      throw new Error("BaselineComparisonBuilder: baselineMetadata must be object if provided");
    }
    this.baselineMetadata = metadata;
    return this;
  }

  build(): BaselineComparisonEntity {
    if (!this.baselineComparisonId) {
      throw new Error("BaselineComparisonBuilder: baselineComparisonId is required");
    }
    if (!this.baselineWindowId) {
      throw new Error("BaselineComparisonBuilder: baselineWindowId is required");
    }
    if (this.comparedWindowIds.length === 0) {
      throw new Error("BaselineComparisonBuilder: at least one compared window is required");
    }
    if (!this.comparedWindowRole) {
      throw new Error("BaselineComparisonBuilder: comparedWindowRole is required");
    }
    if (this.baselineEstablishedAt === undefined) {
      throw new Error("BaselineComparisonBuilder: baselineEstablishedAt is required");
    }

    return new BaselineComparisonEntity({
      baselineComparisonId: this.baselineComparisonId,
      baselineWindowId: this.baselineWindowId,
      comparedWindowIds: this.comparedWindowIds,
      comparedWindowRole: this.comparedWindowRole,
      baselineEstablishedAt: this.baselineEstablishedAt,
      baselineMetadata: this.baselineMetadata,
    });
  }
}

/**
 * RollingComparisonBuilder
 * Build rolling/sequential comparison structure.
 */
export class RollingComparisonBuilder {
  private rollingComparisonId?: string;
  private orderedWindowIds: string[] = [];
  private windowRoles: ComparisonWindowRole[] = [];
  private segmentBoundaries?: number[];
  private rollingEstablishedAt?: number;
  private rollingMetadata?: Record<string, unknown>;

  withRollingComparisonId(id: string): this {
    if (!id || typeof id !== "string") {
      throw new Error("RollingComparisonBuilder: rollingComparisonId must be non-empty string");
    }
    this.rollingComparisonId = id;
    return this;
  }

  withOrderedWindowId(id: string, role: ComparisonWindowRole): this {
    if (!id || typeof id !== "string") {
      throw new Error("RollingComparisonBuilder: ordered windowId must be non-empty string");
    }
    if (!role || typeof role !== "string") {
      throw new Error("RollingComparisonBuilder: window role must be valid role");
    }
    const validRoles = ["SOURCE", "TARGET", "BASELINE", "OBSERVATION", "REFERENCE", "CONTROL"];
    if (!validRoles.includes(role)) {
      throw new Error(
        `RollingComparisonBuilder: window role '${role}' is not valid (expected: ${validRoles.join(", ")})`
      );
    }
    this.orderedWindowIds.push(id);
    this.windowRoles.push(role as unknown as ComparisonWindowRole);
    return this;
  }

  withOrderedWindowIds(ids: string[], roles: ComparisonWindowRole[]): this {
    if (!Array.isArray(ids) || !Array.isArray(roles)) {
      throw new Error("RollingComparisonBuilder: ordered windowIds and roles must be arrays");
    }
    if (ids.length !== roles.length) {
      throw new Error("RollingComparisonBuilder: windowIds and roles must have same length");
    }
    for (const id of ids) {
      if (!id || typeof id !== "string") {
        throw new Error("RollingComparisonBuilder: all windowIds must be non-empty strings");
      }
    }
    const validRoles = ["SOURCE", "TARGET", "BASELINE", "OBSERVATION", "REFERENCE", "CONTROL"];
    for (const role of roles) {
      if (!role || typeof role !== "string") {
        throw new Error("RollingComparisonBuilder: all roles must be valid roles");
      }
      if (!validRoles.includes(role)) {
        throw new Error(`RollingComparisonBuilder: role '${role}' is not valid`);
      }
    }
    this.orderedWindowIds = Array.from(ids);
    this.windowRoles = Array.from(roles) as ComparisonWindowRole[];
    return this;
  }

  withSegmentBoundaries(boundaries?: number[]): this {
    if (boundaries !== undefined) {
      if (!Array.isArray(boundaries)) {
        throw new Error("RollingComparisonBuilder: segmentBoundaries must be array if provided");
      }
      if (!boundaries.every((b) => typeof b === "number")) {
        throw new Error("RollingComparisonBuilder: all segmentBoundaries must be numbers");
      }
    }
    this.segmentBoundaries = boundaries;
    return this;
  }

  withRollingEstablishedAt(timestamp: number): this {
    if (typeof timestamp !== "number" || timestamp < 0) {
      throw new Error("RollingComparisonBuilder: rollingEstablishedAt must be non-negative number");
    }
    this.rollingEstablishedAt = timestamp;
    return this;
  }

  withRollingMetadata(metadata?: Record<string, unknown>): this {
    if (metadata !== undefined && (typeof metadata !== "object" || metadata === null || Array.isArray(metadata))) {
      throw new Error("RollingComparisonBuilder: rollingMetadata must be object if provided");
    }
    this.rollingMetadata = metadata;
    return this;
  }

  build(): RollingComparisonEntity {
    if (!this.rollingComparisonId) {
      throw new Error("RollingComparisonBuilder: rollingComparisonId is required");
    }
    if (this.orderedWindowIds.length === 0) {
      throw new Error("RollingComparisonBuilder: at least one ordered window is required");
    }
    if (this.rollingEstablishedAt === undefined) {
      throw new Error("RollingComparisonBuilder: rollingEstablishedAt is required");
    }

    return new RollingComparisonEntity({
      rollingComparisonId: this.rollingComparisonId,
      orderedWindowIds: this.orderedWindowIds,
      windowRoles: this.windowRoles,
      segmentBoundaries: this.segmentBoundaries,
      rollingEstablishedAt: this.rollingEstablishedAt,
      rollingMetadata: this.rollingMetadata,
    });
  }
}
