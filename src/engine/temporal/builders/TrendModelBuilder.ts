/**
 * Trend Model Foundation Builders
 * Deterministic construction of trend structures.
 * 
 * Rules:
 * - Require explicit caller inputs for all required fields
 * - Throw descriptive errors on missing required fields
 * - Never generate IDs, never generate timestamps
 * - Never infer directions, strengths, or classifications
 * - Validate enum values and required field presence
 * - No optional defaults, all optional fields caller-provided
 */

import type {
  TrendInputSurface,
  TrendIdentity,
  TrendStructure,
  TrendSet,
  TrendMembership,
  FullTrendContext,
  TrendDirection,
  TrendStrength,
  TrendClassificationType,
} from "../contracts/TrendModelContract.ts";
import {
  TrendInputSurfaceEntity,
  TrendIdentityEntity,
  TrendStructureEntity,
  TrendSetEntity,
  TrendMembershipEntity,
  FullTrendContextEntity,
} from "../entities/TrendModelEntity.ts";

/**
 * TrendInputSurfaceBuilder
 * Build explicit window/comparison reference surface.
 */
export class TrendInputSurfaceBuilder {
  private currentWindowId?: string;
  private previousWindowId?: string;
  private baselineWindowId?: string;
  private comparisonStructureId?: string;
  private comparisonSetId?: string;
  private lineageChainId?: string;
  private inputSurfaceEstablishedAt?: number;
  private inputSurfaceMetadata?: Record<string, unknown>;

  withCurrentWindowId(id: string): this {
    if (!id || typeof id !== "string") {
      throw new Error("TrendInputSurfaceBuilder: currentWindowId must be non-empty string");
    }
    this.currentWindowId = id;
    return this;
  }

  withPreviousWindowId(id: string): this {
    if (!id || typeof id !== "string") {
      throw new Error("TrendInputSurfaceBuilder: previousWindowId must be non-empty string");
    }
    this.previousWindowId = id;
    return this;
  }

  withBaselineWindowId(id?: string): this {
    if (id !== undefined && typeof id !== "string") {
      throw new Error("TrendInputSurfaceBuilder: baselineWindowId must be string if provided");
    }
    this.baselineWindowId = id;
    return this;
  }

  withComparisonStructureId(id?: string): this {
    if (id !== undefined && typeof id !== "string") {
      throw new Error("TrendInputSurfaceBuilder: comparisonStructureId must be string if provided");
    }
    this.comparisonStructureId = id;
    return this;
  }

  withComparisonSetId(id?: string): this {
    if (id !== undefined && typeof id !== "string") {
      throw new Error("TrendInputSurfaceBuilder: comparisonSetId must be string if provided");
    }
    this.comparisonSetId = id;
    return this;
  }

  withLineageChainId(id?: string): this {
    if (id !== undefined && typeof id !== "string") {
      throw new Error("TrendInputSurfaceBuilder: lineageChainId must be string if provided");
    }
    this.lineageChainId = id;
    return this;
  }

  withInputSurfaceEstablishedAt(timestamp: number): this {
    if (typeof timestamp !== "number" || timestamp < 0) {
      throw new Error(
        "TrendInputSurfaceBuilder: inputSurfaceEstablishedAt must be non-negative number"
      );
    }
    this.inputSurfaceEstablishedAt = timestamp;
    return this;
  }

  withInputSurfaceMetadata(metadata?: Record<string, unknown>): this {
    if (
      metadata !== undefined &&
      (typeof metadata !== "object" || metadata === null || Array.isArray(metadata))
    ) {
      throw new Error("TrendInputSurfaceBuilder: inputSurfaceMetadata must be object if provided");
    }
    this.inputSurfaceMetadata = metadata;
    return this;
  }

  build(): TrendInputSurfaceEntity {
    if (!this.currentWindowId) {
      throw new Error("TrendInputSurfaceBuilder: currentWindowId is required");
    }
    if (!this.previousWindowId) {
      throw new Error("TrendInputSurfaceBuilder: previousWindowId is required");
    }
    if (this.inputSurfaceEstablishedAt === undefined) {
      throw new Error("TrendInputSurfaceBuilder: inputSurfaceEstablishedAt is required");
    }

    return new TrendInputSurfaceEntity({
      currentWindowId: this.currentWindowId,
      previousWindowId: this.previousWindowId,
      baselineWindowId: this.baselineWindowId,
      comparisonStructureId: this.comparisonStructureId,
      comparisonSetId: this.comparisonSetId,
      lineageChainId: this.lineageChainId,
      inputSurfaceEstablishedAt: this.inputSurfaceEstablishedAt,
      inputSurfaceMetadata: this.inputSurfaceMetadata,
    });
  }
}

/**
 * TrendIdentityBuilder
 * Build explicit trend identity.
 */
export class TrendIdentityBuilder {
  private trendId?: string;
  private trendType?: string;
  private trendEstablishedAt?: number;
  private identityMetadata?: Record<string, unknown>;

  withTrendId(id: string): this {
    if (!id || typeof id !== "string") {
      throw new Error("TrendIdentityBuilder: trendId must be non-empty string");
    }
    this.trendId = id;
    return this;
  }

  withTrendType(type: string): this {
    if (!type || typeof type !== "string") {
      throw new Error("TrendIdentityBuilder: trendType must be non-empty string");
    }
    this.trendType = type;
    return this;
  }

  withTrendEstablishedAt(timestamp: number): this {
    if (typeof timestamp !== "number" || timestamp < 0) {
      throw new Error("TrendIdentityBuilder: trendEstablishedAt must be non-negative number");
    }
    this.trendEstablishedAt = timestamp;
    return this;
  }

  withIdentityMetadata(metadata?: Record<string, unknown>): this {
    if (
      metadata !== undefined &&
      (typeof metadata !== "object" || metadata === null || Array.isArray(metadata))
    ) {
      throw new Error("TrendIdentityBuilder: identityMetadata must be object if provided");
    }
    this.identityMetadata = metadata;
    return this;
  }

  build(): TrendIdentityEntity {
    if (!this.trendId) {
      throw new Error("TrendIdentityBuilder: trendId is required");
    }
    if (!this.trendType) {
      throw new Error("TrendIdentityBuilder: trendType is required");
    }
    if (this.trendEstablishedAt === undefined) {
      throw new Error("TrendIdentityBuilder: trendEstablishedAt is required");
    }

    return new TrendIdentityEntity({
      trendId: this.trendId,
      trendType: this.trendType,
      trendEstablishedAt: this.trendEstablishedAt,
      identityMetadata: this.identityMetadata,
    });
  }
}

/**
 * TrendStructureBuilder
 * Build complete trend structure.
 */
export class TrendStructureBuilder {
  private trendId?: string;
  private trendType?: string;
  private inputSurface?: TrendInputSurface;
  private direction?: TrendDirection;
  private strength?: TrendStrength;
  private classificationLabel?: TrendClassificationType;
  private trendEstablishedAt?: number;
  private trendMetadata?: Record<string, unknown>;

  withTrendId(id: string): this {
    if (!id || typeof id !== "string") {
      throw new Error("TrendStructureBuilder: trendId must be non-empty string");
    }
    this.trendId = id;
    return this;
  }

  withTrendType(type: string): this {
    if (!type || typeof type !== "string") {
      throw new Error("TrendStructureBuilder: trendType must be non-empty string");
    }
    this.trendType = type;
    return this;
  }

  withInputSurface(surface: TrendInputSurface): this {
    if (!surface || typeof surface !== "object") {
      throw new Error("TrendStructureBuilder: inputSurface must be valid TrendInputSurface object");
    }
    this.inputSurface = surface;
    return this;
  }

  withDirection(direction: TrendDirection): this {
    if (!direction || typeof direction !== "string") {
      throw new Error("TrendStructureBuilder: direction must be valid direction");
    }
    const validDirections: TrendDirection[] = [
      "increasing",
      "decreasing",
      "flat",
      "mixed",
      "undefined",
    ];
    if (!validDirections.includes(direction)) {
      throw new Error(
        `TrendStructureBuilder: direction '${direction}' is not valid (expected: ${validDirections.join(", ")})`
      );
    }
    this.direction = direction;
    return this;
  }

  withStrength(strength: TrendStrength): this {
    if (!strength || typeof strength !== "string") {
      throw new Error("TrendStructureBuilder: strength must be valid strength");
    }
    const validStrengths: TrendStrength[] = ["weak", "moderate", "strong", "extreme", "undefined"];
    if (!validStrengths.includes(strength)) {
      throw new Error(
        `TrendStructureBuilder: strength '${strength}' is not valid (expected: ${validStrengths.join(", ")})`
      );
    }
    this.strength = strength;
    return this;
  }

  withClassificationLabel(label?: TrendClassificationType): this {
    if (label !== undefined && typeof label !== "string") {
      throw new Error("TrendStructureBuilder: classificationLabel must be string if provided");
    }
    const validTypes: TrendClassificationType[] = [
      "directional_trend",
      "magnitude_trend",
      "continuity_trend",
      "distribution_trend",
      "custom_trend",
    ];
    if (label !== undefined && !validTypes.includes(label)) {
      throw new Error(
        `TrendStructureBuilder: classificationLabel '${label}' is not valid (expected: ${validTypes.join(", ")})`
      );
    }
    this.classificationLabel = label;
    return this;
  }

  withTrendEstablishedAt(timestamp: number): this {
    if (typeof timestamp !== "number" || timestamp < 0) {
      throw new Error("TrendStructureBuilder: trendEstablishedAt must be non-negative number");
    }
    this.trendEstablishedAt = timestamp;
    return this;
  }

  withTrendMetadata(metadata?: Record<string, unknown>): this {
    if (
      metadata !== undefined &&
      (typeof metadata !== "object" || metadata === null || Array.isArray(metadata))
    ) {
      throw new Error("TrendStructureBuilder: trendMetadata must be object if provided");
    }
    this.trendMetadata = metadata;
    return this;
  }

  build(): TrendStructureEntity {
    if (!this.trendId) {
      throw new Error("TrendStructureBuilder: trendId is required");
    }
    if (!this.trendType) {
      throw new Error("TrendStructureBuilder: trendType is required");
    }
    if (!this.inputSurface) {
      throw new Error("TrendStructureBuilder: inputSurface is required");
    }
    if (!this.direction) {
      throw new Error("TrendStructureBuilder: direction is required");
    }
    if (!this.strength) {
      throw new Error("TrendStructureBuilder: strength is required");
    }
    if (this.trendEstablishedAt === undefined) {
      throw new Error("TrendStructureBuilder: trendEstablishedAt is required");
    }

    return new TrendStructureEntity({
      trendId: this.trendId,
      trendType: this.trendType,
      inputSurface: this.inputSurface,
      direction: this.direction,
      strength: this.strength,
      classificationLabel: this.classificationLabel,
      trendEstablishedAt: this.trendEstablishedAt,
      trendMetadata: this.trendMetadata,
    });
  }
}

/**
 * TrendSetBuilder
 * Build explicit trend grouping.
 */
export class TrendSetBuilder {
  private trendSetId?: string;
  private trendIds: string[] = [];
  private setType?: string;
  private setEstablishedAt?: number;
  private setMetadata?: Record<string, unknown>;

  withTrendSetId(id: string): this {
    if (!id || typeof id !== "string") {
      throw new Error("TrendSetBuilder: trendSetId must be non-empty string");
    }
    this.trendSetId = id;
    return this;
  }

  withTrendId(id: string): this {
    if (!id || typeof id !== "string") {
      throw new Error("TrendSetBuilder: trendId must be non-empty string");
    }
    this.trendIds.push(id);
    return this;
  }

  withTrendIds(ids: string[]): this {
    if (!Array.isArray(ids)) {
      throw new Error("TrendSetBuilder: trendIds must be array");
    }
    this.trendIds = ids.filter((id) => typeof id === "string" && id.length > 0);
    if (this.trendIds.length !== ids.length) {
      throw new Error("TrendSetBuilder: all trendIds must be non-empty strings");
    }
    return this;
  }

  withSetType(type: string): this {
    if (!type || typeof type !== "string") {
      throw new Error("TrendSetBuilder: setType must be non-empty string");
    }
    this.setType = type;
    return this;
  }

  withSetEstablishedAt(timestamp: number): this {
    if (typeof timestamp !== "number" || timestamp < 0) {
      throw new Error("TrendSetBuilder: setEstablishedAt must be non-negative number");
    }
    this.setEstablishedAt = timestamp;
    return this;
  }

  withSetMetadata(metadata?: Record<string, unknown>): this {
    if (
      metadata !== undefined &&
      (typeof metadata !== "object" || metadata === null || Array.isArray(metadata))
    ) {
      throw new Error("TrendSetBuilder: setMetadata must be object if provided");
    }
    this.setMetadata = metadata;
    return this;
  }

  build(): TrendSetEntity {
    if (!this.trendSetId) {
      throw new Error("TrendSetBuilder: trendSetId is required");
    }
    if (this.trendIds.length === 0) {
      throw new Error("TrendSetBuilder: at least one trendId is required");
    }
    if (!this.setType) {
      throw new Error("TrendSetBuilder: setType is required");
    }
    if (this.setEstablishedAt === undefined) {
      throw new Error("TrendSetBuilder: setEstablishedAt is required");
    }

    return new TrendSetEntity({
      trendSetId: this.trendSetId,
      trendIds: this.trendIds,
      setType: this.setType,
      setEstablishedAt: this.setEstablishedAt,
      setMetadata: this.setMetadata,
    });
  }
}

/**
 * TrendMembershipBuilder
 * Build explicit trend set membership.
 */
export class TrendMembershipBuilder {
  private trendId?: string;
  private trendSetId?: string;
  private positionInSet?: number;
  private membershipEstablishedAt?: number;
  private membershipMetadata?: Record<string, unknown>;

  withTrendId(id: string): this {
    if (!id || typeof id !== "string") {
      throw new Error("TrendMembershipBuilder: trendId must be non-empty string");
    }
    this.trendId = id;
    return this;
  }

  withTrendSetId(id: string): this {
    if (!id || typeof id !== "string") {
      throw new Error("TrendMembershipBuilder: trendSetId must be non-empty string");
    }
    this.trendSetId = id;
    return this;
  }

  withPositionInSet(position?: number): this {
    if (position !== undefined && typeof position !== "number") {
      throw new Error("TrendMembershipBuilder: positionInSet must be number if provided");
    }
    this.positionInSet = position;
    return this;
  }

  withMembershipEstablishedAt(timestamp: number): this {
    if (typeof timestamp !== "number" || timestamp < 0) {
      throw new Error("TrendMembershipBuilder: membershipEstablishedAt must be non-negative number");
    }
    this.membershipEstablishedAt = timestamp;
    return this;
  }

  withMembershipMetadata(metadata?: Record<string, unknown>): this {
    if (
      metadata !== undefined &&
      (typeof metadata !== "object" || metadata === null || Array.isArray(metadata))
    ) {
      throw new Error("TrendMembershipBuilder: membershipMetadata must be object if provided");
    }
    this.membershipMetadata = metadata;
    return this;
  }

  build(): TrendMembershipEntity {
    if (!this.trendId) {
      throw new Error("TrendMembershipBuilder: trendId is required");
    }
    if (!this.trendSetId) {
      throw new Error("TrendMembershipBuilder: trendSetId is required");
    }
    if (this.membershipEstablishedAt === undefined) {
      throw new Error("TrendMembershipBuilder: membershipEstablishedAt is required");
    }

    return new TrendMembershipEntity({
      trendId: this.trendId,
      trendSetId: this.trendSetId,
      positionInSet: this.positionInSet,
      membershipEstablishedAt: this.membershipEstablishedAt,
      membershipMetadata: this.membershipMetadata,
    });
  }
}

/**
 * FullTrendContextBuilder
 * Build complete trend context.
 */
export class FullTrendContextBuilder {
  private contextId?: string;
  private identity?: TrendIdentity;
  private inputSurface?: TrendInputSurface;
  private previousTrendId?: string;
  private nextTrendId?: string;
  private relatedTrendIds?: string[];
  private contextEstablishedAt?: number;
  private contextMetadata?: Record<string, unknown>;

  withContextId(id: string): this {
    if (!id || typeof id !== "string") {
      throw new Error("FullTrendContextBuilder: contextId must be non-empty string");
    }
    this.contextId = id;
    return this;
  }

  withIdentity(identity: TrendIdentity): this {
    if (!identity || typeof identity !== "object") {
      throw new Error("FullTrendContextBuilder: identity must be valid TrendIdentity object");
    }
    this.identity = identity;
    return this;
  }

  withInputSurface(surface: TrendInputSurface): this {
    if (!surface || typeof surface !== "object") {
      throw new Error("FullTrendContextBuilder: inputSurface must be valid TrendInputSurface object");
    }
    this.inputSurface = surface;
    return this;
  }

  withPreviousTrendId(id?: string): this {
    if (id !== undefined && typeof id !== "string") {
      throw new Error("FullTrendContextBuilder: previousTrendId must be string if provided");
    }
    this.previousTrendId = id;
    return this;
  }

  withNextTrendId(id?: string): this {
    if (id !== undefined && typeof id !== "string") {
      throw new Error("FullTrendContextBuilder: nextTrendId must be string if provided");
    }
    this.nextTrendId = id;
    return this;
  }

  withRelatedTrendIds(ids?: string[]): this {
    if (ids !== undefined) {
      if (!Array.isArray(ids)) {
        throw new Error("FullTrendContextBuilder: relatedTrendIds must be string array if provided");
      }
      if (!ids.every((id) => typeof id === "string")) {
        throw new Error("FullTrendContextBuilder: all relatedTrendIds must be strings");
      }
    }
    this.relatedTrendIds = ids;
    return this;
  }

  withContextEstablishedAt(timestamp: number): this {
    if (typeof timestamp !== "number" || timestamp < 0) {
      throw new Error("FullTrendContextBuilder: contextEstablishedAt must be non-negative number");
    }
    this.contextEstablishedAt = timestamp;
    return this;
  }

  withContextMetadata(metadata?: Record<string, unknown>): this {
    if (
      metadata !== undefined &&
      (typeof metadata !== "object" || metadata === null || Array.isArray(metadata))
    ) {
      throw new Error("FullTrendContextBuilder: contextMetadata must be object if provided");
    }
    this.contextMetadata = metadata;
    return this;
  }

  build(): FullTrendContextEntity {
    if (!this.contextId) {
      throw new Error("FullTrendContextBuilder: contextId is required");
    }
    if (!this.identity) {
      throw new Error("FullTrendContextBuilder: identity is required");
    }
    if (!this.inputSurface) {
      throw new Error("FullTrendContextBuilder: inputSurface is required");
    }
    if (this.contextEstablishedAt === undefined) {
      throw new Error("FullTrendContextBuilder: contextEstablishedAt is required");
    }

    return new FullTrendContextEntity({
      contextId: this.contextId,
      identity: this.identity,
      inputSurface: this.inputSurface,
      previousTrendId: this.previousTrendId,
      nextTrendId: this.nextTrendId,
      relatedTrendIds: this.relatedTrendIds,
      contextEstablishedAt: this.contextEstablishedAt,
      contextMetadata: this.contextMetadata,
    });
  }
}
