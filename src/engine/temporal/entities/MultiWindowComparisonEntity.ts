/**
 * Multi-Window Comparison Foundation Entities
 * Immutable structural containers for comparison arrangements.
 * 
 * Rules:
 * - Pure data containers, no behavior methods
 * - All fields readonly
 * - No computed values or query helpers
 * - 1:1 mapping to contract interfaces
 * - Copy constructors for defensive copying
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

/**
 * ComparisonMemberEntity
 * Immutable binding of window to comparison role.
 */
export class ComparisonMemberEntity implements ComparisonMember {
  readonly windowId: string;
  readonly roleInComparison: ComparisonWindowRole;
  readonly positionInComparison?: number;
  readonly membershipEstablishedAt: number;
  readonly membershipMetadata?: Record<string, unknown>;

  constructor(member: ComparisonMember) {
    this.windowId = member.windowId;
    this.roleInComparison = member.roleInComparison;
    this.positionInComparison = member.positionInComparison;
    this.membershipEstablishedAt = member.membershipEstablishedAt;
    this.membershipMetadata = member.membershipMetadata
      ? { ...member.membershipMetadata }
      : undefined;
  }
}

/**
 * ComparisonStructureEntity
 * Immutable multi-window comparison identity and composition.
 */
export class ComparisonStructureEntity implements ComparisonStructure {
  readonly comparisonStructureId: string;
  readonly members: ComparisonMember[];
  readonly arrangementType: ComparisonArrangementType;
  readonly targetWindowId?: string;
  readonly referenceWindowId?: string;
  readonly baselineWindowId?: string;
  readonly comparisonEstablishedAt: number;
  readonly comparisonMetadata?: Record<string, unknown>;

  constructor(structure: ComparisonStructure) {
    this.comparisonStructureId = structure.comparisonStructureId;
    this.members = structure.members.map((m) => new ComparisonMemberEntity(m));
    this.arrangementType = structure.arrangementType;
    this.targetWindowId = structure.targetWindowId;
    this.referenceWindowId = structure.referenceWindowId;
    this.baselineWindowId = structure.baselineWindowId;
    this.comparisonEstablishedAt = structure.comparisonEstablishedAt;
    this.comparisonMetadata = structure.comparisonMetadata
      ? { ...structure.comparisonMetadata }
      : undefined;
  }
}

/**
 * ComparisonSetEntity
 * Immutable ordered group of windows with explicit membership.
 */
export class ComparisonSetEntity implements ComparisonSet {
  readonly comparisonSetId: string;
  readonly windowIds: string[];
  readonly arrangementType: ComparisonArrangementType;
  readonly membershipList: ComparisonMember[];
  readonly targetWindowId?: string;
  readonly referenceAnchors?: string[];
  readonly baselineAnchors?: string[];
  readonly setEstablishedAt: number;
  readonly setMetadata?: Record<string, unknown>;

  constructor(set: ComparisonSet) {
    this.comparisonSetId = set.comparisonSetId;
    this.windowIds = [...set.windowIds];
    this.arrangementType = set.arrangementType;
    this.membershipList = set.membershipList.map((m) => new ComparisonMemberEntity(m));
    this.targetWindowId = set.targetWindowId;
    this.referenceAnchors = set.referenceAnchors ? [...set.referenceAnchors] : undefined;
    this.baselineAnchors = set.baselineAnchors ? [...set.baselineAnchors] : undefined;
    this.setEstablishedAt = set.setEstablishedAt;
    this.setMetadata = set.setMetadata ? { ...set.setMetadata } : undefined;
  }
}

/**
 * AnchoredComparisonEntity
 * Immutable anchor-centric comparison structure.
 */
export class AnchoredComparisonEntity implements AnchoredComparison {
  readonly anchoredComparisonId: string;
  readonly anchorWindowId: string;
  readonly anchorRole: ComparisonWindowRole;
  readonly comparedWindowIds: string[];
  readonly comparedWindowRoles: ComparisonWindowRole[];
  readonly anchoringEstablishedAt: number;
  readonly anchoringMetadata?: Record<string, unknown>;

  constructor(anchored: AnchoredComparison) {
    this.anchoredComparisonId = anchored.anchoredComparisonId;
    this.anchorWindowId = anchored.anchorWindowId;
    this.anchorRole = anchored.anchorRole;
    this.comparedWindowIds = [...anchored.comparedWindowIds];
    this.comparedWindowRoles = [...anchored.comparedWindowRoles];
    this.anchoringEstablishedAt = anchored.anchoringEstablishedAt;
    this.anchoringMetadata = anchored.anchoringMetadata
      ? { ...anchored.anchoringMetadata }
      : undefined;
  }
}

/**
 * BaselineComparisonEntity
 * Immutable baseline-centric comparison structure.
 */
export class BaselineComparisonEntity implements BaselineComparison {
  readonly baselineComparisonId: string;
  readonly baselineWindowId: string;
  readonly comparedWindowIds: string[];
  readonly comparedWindowRole: ComparisonWindowRole;
  readonly baselineEstablishedAt: number;
  readonly baselineMetadata?: Record<string, unknown>;

  constructor(baseline: BaselineComparison) {
    this.baselineComparisonId = baseline.baselineComparisonId;
    this.baselineWindowId = baseline.baselineWindowId;
    this.comparedWindowIds = [...baseline.comparedWindowIds];
    this.comparedWindowRole = baseline.comparedWindowRole;
    this.baselineEstablishedAt = baseline.baselineEstablishedAt;
    this.baselineMetadata = baseline.baselineMetadata
      ? { ...baseline.baselineMetadata }
      : undefined;
  }
}

/**
 * RollingComparisonEntity
 * Immutable rolling/sequential comparison structure.
 */
export class RollingComparisonEntity implements RollingComparison {
  readonly rollingComparisonId: string;
  readonly orderedWindowIds: string[];
  readonly windowRoles: ComparisonWindowRole[];
  readonly segmentBoundaries?: number[];
  readonly rollingEstablishedAt: number;
  readonly rollingMetadata?: Record<string, unknown>;

  constructor(rolling: RollingComparison) {
    this.rollingComparisonId = rolling.rollingComparisonId;
    this.orderedWindowIds = [...rolling.orderedWindowIds];
    this.windowRoles = [...rolling.windowRoles];
    this.segmentBoundaries = rolling.segmentBoundaries
      ? [...rolling.segmentBoundaries]
      : undefined;
    this.rollingEstablishedAt = rolling.rollingEstablishedAt;
    this.rollingMetadata = rolling.rollingMetadata
      ? { ...rolling.rollingMetadata }
      : undefined;
  }
}
