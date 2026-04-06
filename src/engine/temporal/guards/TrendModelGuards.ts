/**
 * Trend Model Foundation Guards
 * Structural type guards for trend containers.
 * 
 * Rules:
 * - Validate structure/shape only, no domain semantics
 * - Deterministic, side-effect-free
 * - No business logic, no interpretation
 */

import type {
  TrendDirection,
  TrendStrength,
  TrendClassificationType,
  TrendInputSurface,
  TrendIdentity,
  TrendStructure,
  TrendSet,
  TrendMembership,
  FullTrendContext,
} from "../contracts/TrendModelContract.ts";

/**
 * isTrendDirection
 * Check if value is valid TrendDirection.
 */
export function isTrendDirection(value: unknown): value is TrendDirection {
  if (typeof value !== "string") return false;
  const validDirections: TrendDirection[] = [
    "increasing",
    "decreasing",
    "flat",
    "mixed",
    "undefined",
  ];
  return validDirections.includes(value as TrendDirection);
}

/**
 * isTrendStrength
 * Check if value is valid TrendStrength.
 */
export function isTrendStrength(value: unknown): value is TrendStrength {
  if (typeof value !== "string") return false;
  const validStrengths: TrendStrength[] = ["weak", "moderate", "strong", "extreme", "undefined"];
  return validStrengths.includes(value as TrendStrength);
}

/**
 * isTrendClassificationType
 * Check if value is valid TrendClassificationType.
 */
export function isTrendClassificationType(value: unknown): value is TrendClassificationType {
  if (typeof value !== "string") return false;
  const validTypes: TrendClassificationType[] = [
    "directional_trend",
    "magnitude_trend",
    "continuity_trend",
    "distribution_trend",
    "custom_trend",
  ];
  return validTypes.includes(value as TrendClassificationType);
}

/**
 * isTrendInputSurface
 * Check if value conforms to TrendInputSurface contract.
 */
export function isTrendInputSurface(value: unknown): value is TrendInputSurface {
  if (!value || typeof value !== "object") return false;

  const surface = value as Record<string, unknown>;

  // Required fields
  if (typeof surface.currentWindowId !== "string") return false;
  if (typeof surface.previousWindowId !== "string") return false;
  if (typeof surface.inputSurfaceEstablishedAt !== "number") return false;

  // Optional fields
  if (surface.baselineWindowId !== undefined && typeof surface.baselineWindowId !== "string") {
    return false;
  }
  if (
    surface.comparisonStructureId !== undefined &&
    typeof surface.comparisonStructureId !== "string"
  ) {
    return false;
  }
  if (surface.comparisonSetId !== undefined && typeof surface.comparisonSetId !== "string") {
    return false;
  }
  if (surface.lineageChainId !== undefined && typeof surface.lineageChainId !== "string") {
    return false;
  }
  if (
    surface.inputSurfaceMetadata !== undefined &&
    (typeof surface.inputSurfaceMetadata !== "object" ||
      surface.inputSurfaceMetadata === null ||
      Array.isArray(surface.inputSurfaceMetadata))
  ) {
    return false;
  }

  return true;
}

/**
 * isTrendIdentity
 * Check if value conforms to TrendIdentity contract.
 */
export function isTrendIdentity(value: unknown): value is TrendIdentity {
  if (!value || typeof value !== "object") return false;

  const identity = value as Record<string, unknown>;

  // Required fields
  if (typeof identity.trendId !== "string") return false;
  if (typeof identity.trendType !== "string") return false;
  if (typeof identity.trendEstablishedAt !== "number") return false;

  // Optional fields
  if (
    identity.identityMetadata !== undefined &&
    (typeof identity.identityMetadata !== "object" ||
      identity.identityMetadata === null ||
      Array.isArray(identity.identityMetadata))
  ) {
    return false;
  }

  return true;
}

/**
 * isTrendStructure
 * Check if value conforms to TrendStructure contract.
 */
export function isTrendStructure(value: unknown): value is TrendStructure {
  if (!value || typeof value !== "object") return false;

  const structure = value as Record<string, unknown>;

  // Required fields
  if (typeof structure.trendId !== "string") return false;
  if (typeof structure.trendType !== "string") return false;
  if (!isTrendInputSurface(structure.inputSurface)) return false;
  if (!isTrendDirection(structure.direction)) return false;
  if (!isTrendStrength(structure.strength)) return false;
  if (typeof structure.trendEstablishedAt !== "number") return false;

  // Optional fields
  if (
    structure.classificationLabel !== undefined &&
    !isTrendClassificationType(structure.classificationLabel)
  ) {
    return false;
  }
  if (
    structure.trendMetadata !== undefined &&
    (typeof structure.trendMetadata !== "object" ||
      structure.trendMetadata === null ||
      Array.isArray(structure.trendMetadata))
  ) {
    return false;
  }

  return true;
}

/**
 * isTrendSet
 * Check if value conforms to TrendSet contract.
 */
export function isTrendSet(value: unknown): value is TrendSet {
  if (!value || typeof value !== "object") return false;

  const set = value as Record<string, unknown>;

  // Required fields
  if (typeof set.trendSetId !== "string") return false;
  if (!Array.isArray(set.trendIds)) return false;
  if (!set.trendIds.every((id: unknown) => typeof id === "string")) return false;
  if (typeof set.setType !== "string") return false;
  if (typeof set.setEstablishedAt !== "number") return false;

  // Optional fields
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
 * isTrendMembership
 * Check if value conforms to TrendMembership contract.
 */
export function isTrendMembership(value: unknown): value is TrendMembership {
  if (!value || typeof value !== "object") return false;

  const membership = value as Record<string, unknown>;

  // Required fields
  if (typeof membership.trendId !== "string") return false;
  if (typeof membership.trendSetId !== "string") return false;
  if (typeof membership.membershipEstablishedAt !== "number") return false;

  // Optional fields
  if (membership.positionInSet !== undefined && typeof membership.positionInSet !== "number") {
    return false;
  }
  if (
    membership.membershipMetadata !== undefined &&
    (typeof membership.membershipMetadata !== "object" ||
      membership.membershipMetadata === null ||
      Array.isArray(membership.membershipMetadata))
  ) {
    return false;
  }

  return true;
}

/**
 * isFullTrendContext
 * Check if value conforms to FullTrendContext contract.
 */
export function isFullTrendContext(value: unknown): value is FullTrendContext {
  if (!value || typeof value !== "object") return false;

  const context = value as Record<string, unknown>;

  // Required fields
  if (typeof context.contextId !== "string") return false;
  if (!isTrendIdentity(context.identity)) return false;
  if (!isTrendInputSurface(context.inputSurface)) return false;
  if (typeof context.contextEstablishedAt !== "number") return false;

  // Optional fields
  if (context.previousTrendId !== undefined && typeof context.previousTrendId !== "string") {
    return false;
  }
  if (context.nextTrendId !== undefined && typeof context.nextTrendId !== "string") {
    return false;
  }
  if (context.relatedTrendIds !== undefined) {
    if (!Array.isArray(context.relatedTrendIds)) return false;
    if (!context.relatedTrendIds.every((id: unknown) => typeof id === "string")) return false;
  }
  if (
    context.contextMetadata !== undefined &&
    (typeof context.contextMetadata !== "object" ||
      context.contextMetadata === null ||
      Array.isArray(context.contextMetadata))
  ) {
    return false;
  }

  return true;
}
