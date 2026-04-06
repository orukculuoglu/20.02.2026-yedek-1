/**
 * Multi-Window Comparison Foundation Guards
 * Structural type guards for comparison arrangements.
 * 
 * Rules:
 * - Validate structure/shape only, no domain semantics
 * - Deterministic, side-effect-free
 * - No business logic, no interpretation
 * - Reuses ComparisonWindowRole from existing guards
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
import { ComparisonWindowRole as ComparisonWindowRoleEnum } from "../contracts/ComparisonEntities.ts";

/**
 * isComparisonWindowRole
 * Check if value is valid ComparisonWindowRole (enum value).
 */
function isComparisonWindowRole(value: unknown): value is ComparisonWindowRole {
  if (typeof value !== "string") return false;
  const validRoles = Object.values(ComparisonWindowRoleEnum) as string[];
  return validRoles.includes(value);
}

/**
 * isComparisonArrangementType
 * Check if value is valid ComparisonArrangementType.
 */
export function isComparisonArrangementType(
  value: unknown
): value is ComparisonArrangementType {
  if (typeof value !== "string") return false;
  const validTypes: ComparisonArrangementType[] = [
    "pairwise",
    "anchored",
    "baseline_set",
    "rolling_set",
    "explicit_group",
  ];
  return validTypes.includes(value as ComparisonArrangementType);
}

/**
 * isComparisonMember
 * Check if value conforms to ComparisonMember contract.
 */
export function isComparisonMember(value: unknown): value is ComparisonMember {
  if (!value || typeof value !== "object") return false;

  const member = value as Record<string, unknown>;

  // Required fields
  if (typeof member.windowId !== "string") return false;
  if (!isComparisonWindowRole(member.roleInComparison)) return false;
  if (typeof member.membershipEstablishedAt !== "number") return false;

  // Optional fields
  if (member.positionInComparison !== undefined && typeof member.positionInComparison !== "number") {
    return false;
  }
  if (
    member.membershipMetadata !== undefined &&
    (typeof member.membershipMetadata !== "object" ||
      member.membershipMetadata === null ||
      Array.isArray(member.membershipMetadata))
  ) {
    return false;
  }

  return true;
}

/**
 * isComparisonStructure
 * Check if value conforms to ComparisonStructure contract.
 */
export function isComparisonStructure(value: unknown): value is ComparisonStructure {
  if (!value || typeof value !== "object") return false;

  const structure = value as Record<string, unknown>;

  // Required fields
  if (typeof structure.comparisonStructureId !== "string") return false;
  if (!Array.isArray(structure.members)) return false;
  if (!structure.members.every((m: unknown) => isComparisonMember(m))) return false;
  if (!isComparisonArrangementType(structure.arrangementType)) return false;
  if (typeof structure.comparisonEstablishedAt !== "number") return false;

  // Optional fields
  if (structure.targetWindowId !== undefined && typeof structure.targetWindowId !== "string") {
    return false;
  }
  if (
    structure.referenceWindowId !== undefined &&
    typeof structure.referenceWindowId !== "string"
  ) {
    return false;
  }
  if (
    structure.baselineWindowId !== undefined &&
    typeof structure.baselineWindowId !== "string"
  ) {
    return false;
  }
  if (
    structure.comparisonMetadata !== undefined &&
    (typeof structure.comparisonMetadata !== "object" ||
      structure.comparisonMetadata === null ||
      Array.isArray(structure.comparisonMetadata))
  ) {
    return false;
  }

  return true;
}

/**
 * isComparisonSet
 * Check if value conforms to ComparisonSet contract.
 */
export function isComparisonSet(value: unknown): value is ComparisonSet {
  if (!value || typeof value !== "object") return false;

  const set = value as Record<string, unknown>;

  // Required fields
  if (typeof set.comparisonSetId !== "string") return false;
  if (!Array.isArray(set.windowIds)) return false;
  if (!set.windowIds.every((id: unknown) => typeof id === "string")) return false;
  if (!isComparisonArrangementType(set.arrangementType)) return false;
  if (!Array.isArray(set.membershipList)) return false;
  if (!set.membershipList.every((m: unknown) => isComparisonMember(m))) return false;
  if (typeof set.setEstablishedAt !== "number") return false;

  // Optional fields
  if (set.targetWindowId !== undefined && typeof set.targetWindowId !== "string") {
    return false;
  }
  if (set.referenceAnchors !== undefined) {
    if (!Array.isArray(set.referenceAnchors)) return false;
    if (!set.referenceAnchors.every((id: unknown) => typeof id === "string")) return false;
  }
  if (set.baselineAnchors !== undefined) {
    if (!Array.isArray(set.baselineAnchors)) return false;
    if (!set.baselineAnchors.every((id: unknown) => typeof id === "string")) return false;
  }
  if (
    set.setMetadata !== undefined &&
    (typeof set.setMetadata !== "object" ||
      set.setMetadata === null ||
      Array.isArray(set.setMetadata))
  ) {
    return false;
  }

  return true;
}

/**
 * isAnchoredComparison
 * Check if value conforms to AnchoredComparison contract.
 */
export function isAnchoredComparison(value: unknown): value is AnchoredComparison {
  if (!value || typeof value !== "object") return false;

  const anchored = value as Record<string, unknown>;

  // Required fields
  if (typeof anchored.anchoredComparisonId !== "string") return false;
  if (typeof anchored.anchorWindowId !== "string") return false;
  if (!isComparisonWindowRole(anchored.anchorRole)) return false;
  if (!Array.isArray(anchored.comparedWindowIds)) return false;
  if (!anchored.comparedWindowIds.every((id: unknown) => typeof id === "string")) return false;
  if (!Array.isArray(anchored.comparedWindowRoles)) return false;
  if (
    !anchored.comparedWindowRoles.every((role: unknown) => isComparisonWindowRole(role))
  ) {
    return false;
  }
  if (anchored.comparedWindowIds.length !== anchored.comparedWindowRoles.length) {
    return false;
  }
  if (typeof anchored.anchoringEstablishedAt !== "number") return false;

  // Optional fields
  if (
    anchored.anchoringMetadata !== undefined &&
    (typeof anchored.anchoringMetadata !== "object" ||
      anchored.anchoringMetadata === null ||
      Array.isArray(anchored.anchoringMetadata))
  ) {
    return false;
  }

  return true;
}

/**
 * isBaselineComparison
 * Check if value conforms to BaselineComparison contract.
 */
export function isBaselineComparison(value: unknown): value is BaselineComparison {
  if (!value || typeof value !== "object") return false;

  const baseline = value as Record<string, unknown>;

  // Required fields
  if (typeof baseline.baselineComparisonId !== "string") return false;
  if (typeof baseline.baselineWindowId !== "string") return false;
  if (!Array.isArray(baseline.comparedWindowIds)) return false;
  if (!baseline.comparedWindowIds.every((id: unknown) => typeof id === "string")) return false;
  if (!isComparisonWindowRole(baseline.comparedWindowRole)) return false;
  if (typeof baseline.baselineEstablishedAt !== "number") return false;

  // Optional fields
  if (
    baseline.baselineMetadata !== undefined &&
    (typeof baseline.baselineMetadata !== "object" ||
      baseline.baselineMetadata === null ||
      Array.isArray(baseline.baselineMetadata))
  ) {
    return false;
  }

  return true;
}

/**
 * isRollingComparison
 * Check if value conforms to RollingComparison contract.
 */
export function isRollingComparison(value: unknown): value is RollingComparison {
  if (!value || typeof value !== "object") return false;

  const rolling = value as Record<string, unknown>;

  // Required fields
  if (typeof rolling.rollingComparisonId !== "string") return false;
  if (!Array.isArray(rolling.orderedWindowIds)) return false;
  if (!rolling.orderedWindowIds.every((id: unknown) => typeof id === "string")) return false;
  if (!Array.isArray(rolling.windowRoles)) return false;
  if (!rolling.windowRoles.every((role: unknown) => isComparisonWindowRole(role))) return false;
  if (rolling.orderedWindowIds.length !== rolling.windowRoles.length) return false;
  if (typeof rolling.rollingEstablishedAt !== "number") return false;

  // Optional fields
  if (rolling.segmentBoundaries !== undefined) {
    if (!Array.isArray(rolling.segmentBoundaries)) return false;
    if (!rolling.segmentBoundaries.every((b: unknown) => typeof b === "number")) return false;
  }
  if (
    rolling.rollingMetadata !== undefined &&
    (typeof rolling.rollingMetadata !== "object" ||
      rolling.rollingMetadata === null ||
      Array.isArray(rolling.rollingMetadata))
  ) {
    return false;
  }

  return true;
}
