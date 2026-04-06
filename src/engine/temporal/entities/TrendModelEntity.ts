/**
 * Trend Model Foundation Entities
 * Immutable structural containers for trend representation.
 * 
 * Rules:
 * - Pure data containers, no behavior methods
 * - All fields readonly
 * - No computed values or query helpers
 * - 1:1 mapping to contract interfaces
 * - Copy constructors for defensive copying
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

/**
 * TrendInputSurfaceEntity
 * Immutable structural binding of source references.
 */
export class TrendInputSurfaceEntity implements TrendInputSurface {
  readonly currentWindowId: string;
  readonly previousWindowId: string;
  readonly baselineWindowId?: string;
  readonly comparisonStructureId?: string;
  readonly comparisonSetId?: string;
  readonly lineageChainId?: string;
  readonly inputSurfaceEstablishedAt: number;
  readonly inputSurfaceMetadata?: Record<string, unknown>;

  constructor(surface: TrendInputSurface) {
    this.currentWindowId = surface.currentWindowId;
    this.previousWindowId = surface.previousWindowId;
    this.baselineWindowId = surface.baselineWindowId;
    this.comparisonStructureId = surface.comparisonStructureId;
    this.comparisonSetId = surface.comparisonSetId;
    this.lineageChainId = surface.lineageChainId;
    this.inputSurfaceEstablishedAt = surface.inputSurfaceEstablishedAt;
    this.inputSurfaceMetadata = surface.inputSurfaceMetadata
      ? { ...surface.inputSurfaceMetadata }
      : undefined;
  }
}

/**
 * TrendIdentityEntity
 * Immutable trend identification binding.
 */
export class TrendIdentityEntity implements TrendIdentity {
  readonly trendId: string;
  readonly trendType: string;
  readonly trendEstablishedAt: number;
  readonly identityMetadata?: Record<string, unknown>;

  constructor(identity: TrendIdentity) {
    this.trendId = identity.trendId;
    this.trendType = identity.trendType;
    this.trendEstablishedAt = identity.trendEstablishedAt;
    this.identityMetadata = identity.identityMetadata
      ? { ...identity.identityMetadata }
      : undefined;
  }
}

/**
 * TrendStructureEntity
 * Immutable core trend structure binding.
 */
export class TrendStructureEntity implements TrendStructure {
  readonly trendId: string;
  readonly trendType: string;
  readonly inputSurface: TrendInputSurface;
  readonly direction: TrendDirection;
  readonly strength: TrendStrength;
  readonly classificationLabel?: TrendClassificationType;
  readonly trendEstablishedAt: number;
  readonly trendMetadata?: Record<string, unknown>;

  constructor(structure: TrendStructure) {
    this.trendId = structure.trendId;
    this.trendType = structure.trendType;
    this.inputSurface = new TrendInputSurfaceEntity(structure.inputSurface);
    this.direction = structure.direction;
    this.strength = structure.strength;
    this.classificationLabel = structure.classificationLabel;
    this.trendEstablishedAt = structure.trendEstablishedAt;
    this.trendMetadata = structure.trendMetadata
      ? { ...structure.trendMetadata }
      : undefined;
  }
}

/**
 * TrendSetEntity
 * Immutable trend grouping container.
 */
export class TrendSetEntity implements TrendSet {
  readonly trendSetId: string;
  readonly trendIds: string[];
  readonly setType: string;
  readonly setEstablishedAt: number;
  readonly setMetadata?: Record<string, unknown>;

  constructor(set: TrendSet) {
    this.trendSetId = set.trendSetId;
    this.trendIds = [...set.trendIds];
    this.setType = set.setType;
    this.setEstablishedAt = set.setEstablishedAt;
    this.setMetadata = set.setMetadata ? { ...set.setMetadata } : undefined;
  }
}

/**
 * TrendMembershipEntity
 * Immutable trend set membership binding.
 */
export class TrendMembershipEntity implements TrendMembership {
  readonly trendId: string;
  readonly trendSetId: string;
  readonly positionInSet?: number;
  readonly membershipEstablishedAt: number;
  readonly membershipMetadata?: Record<string, unknown>;

  constructor(membership: TrendMembership) {
    this.trendId = membership.trendId;
    this.trendSetId = membership.trendSetId;
    this.positionInSet = membership.positionInSet;
    this.membershipEstablishedAt = membership.membershipEstablishedAt;
    this.membershipMetadata = membership.membershipMetadata
      ? { ...membership.membershipMetadata }
      : undefined;
  }
}

/**
 * FullTrendContextEntity
 * Immutable complete trend context binding.
 */
export class FullTrendContextEntity implements FullTrendContext {
  readonly contextId: string;
  readonly identity: TrendIdentity;
  readonly inputSurface: TrendInputSurface;
  readonly previousTrendId?: string;
  readonly nextTrendId?: string;
  readonly relatedTrendIds?: string[];
  readonly contextEstablishedAt: number;
  readonly contextMetadata?: Record<string, unknown>;

  constructor(context: FullTrendContext) {
    this.contextId = context.contextId;
    this.identity = new TrendIdentityEntity(context.identity);
    this.inputSurface = new TrendInputSurfaceEntity(context.inputSurface);
    this.previousTrendId = context.previousTrendId;
    this.nextTrendId = context.nextTrendId;
    this.relatedTrendIds = context.relatedTrendIds ? [...context.relatedTrendIds] : undefined;
    this.contextEstablishedAt = context.contextEstablishedAt;
    this.contextMetadata = context.contextMetadata
      ? { ...context.contextMetadata }
      : undefined;
  }
}
