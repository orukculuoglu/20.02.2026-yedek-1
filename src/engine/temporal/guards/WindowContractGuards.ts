/**
 * Window Contract Guards
 * Type guards for core temporal contracts and window state variants.
 * Deterministic predicates for runtime type checking.
 */

import type {
  MultiWindowTemporalContract,
  TemporalWindowBoundary,
  TemporalWindowMetadata,
  WindowTypeContract,
  TemporalComparisonContract,
  WindowRelationship,
  ObservedWindowState,
  BaselineWindowState,
  ReferenceWindowState,
  WindowState,
  StateSnapshot,
} from "../contracts/index.ts";

/**
 * isTemporalWindowBoundary
 * Guard to check if object implements TemporalWindowBoundary.
 * Validates structure: startTimestamp and endTimestamp as numbers.
 */
export function isTemporalWindowBoundary(
  value: unknown
): value is TemporalWindowBoundary {
  if (!value || typeof value !== "object") {
    return false;
  }
  
  const obj = value as Record<string, unknown>;
  
  return (
    typeof obj.startTimestamp === "number" &&
    typeof obj.endTimestamp === "number" &&
    obj.startTimestamp >= 0 &&
    obj.endTimestamp >= obj.startTimestamp
  );
}

/**
 * isTemporalWindowMetadata
 * Guard to check if object implements TemporalWindowMetadata.
 * Validates structure: createdAt as number, version as string.
 */
export function isTemporalWindowMetadata(
  value: unknown
): value is TemporalWindowMetadata {
  if (!value || typeof value !== "object") {
    return false;
  }
  
  const obj = value as Record<string, unknown>;
  
  return (
    typeof obj.createdAt === "number" &&
    typeof obj.version === "string" &&
    obj.createdAt >= 0 &&
    obj.version.length > 0
  );
}

/**
 * isWindowTypeContract
 * Guard to check if object implements WindowTypeContract.
 * Validates type and role enums explicitly.
 */
export function isWindowTypeContract(
  value: unknown
): value is WindowTypeContract {
  if (!value || typeof value !== "object") {
    return false;
  }
  
  const obj = value as Record<string, unknown>;
  
  const validTypes = ["REFERENCE", "COMPARISON", "BASELINE", "SNAPSHOT"];
  const validRoles = ["PRIMARY", "SECONDARY", "CONTROL", "TARGET", "ANCHOR"];
  
  return (
    validTypes.includes(String(obj.type)) &&
    validRoles.includes(String(obj.role))
  );
}

/**
 * isTemporalComparisonContract
 * Guard to check if object implements TemporalComparisonContract.
 * Validates comparison type, alignment, and grain.
 */
export function isTemporalComparisonContract(
  value: unknown
): value is TemporalComparisonContract {
  if (!value || typeof value !== "object") {
    return false;
  }
  
  const obj = value as Record<string, unknown>;
  
  const validComparisonTypes = ["ABSOLUTE", "RELATIVE", "DELTA", "RATIO", "INDEX"];
  const validAlignments = [
    "ALIGNED",
    "ANCHORED_START",
    "ANCHORED_END",
    "SLIDING",
    "OFFSET",
    "CONCURRENT",
  ];
  const validGrains = [
    "MILLISECOND",
    "SECOND",
    "MINUTE",
    "HOUR",
    "DAY",
    "WEEK",
    "MONTH",
    "QUARTER",
    "YEAR",
  ];
  
  return (
    validComparisonTypes.includes(String(obj.comparisonType)) &&
    validAlignments.includes(String(obj.alignmentType)) &&
    validGrains.includes(String(obj.grain))
  );
}

/**
 * isMultiWindowTemporalContract
 * Guard to check if object implements MultiWindowTemporalContract.
 * Validates presence of all required fields with correct types.
 */
export function isMultiWindowTemporalContract(
  value: unknown
): value is MultiWindowTemporalContract {
  if (!value || typeof value !== "object") {
    return false;
  }
  
  const obj = value as Record<string, unknown>;
  
  // Required fields: id, metadata, windowType, boundary, comparison, relationships
  return (
    typeof obj.id === "string" &&
    obj.id.length > 0 &&
    isTemporalWindowMetadata(obj.metadata) &&
    isWindowTypeContract(obj.windowType) &&
    isTemporalWindowBoundary(obj.boundary) &&
    isTemporalComparisonContract(obj.comparison) &&
    Array.isArray(obj.relationships)
  );
}

/**
 * isObservedWindowState
 * Guard to check if object implements ObservedWindowState.
 * Validates state type is "observed" and includes dataQuality.
 */
export function isObservedWindowState(
  value: unknown
): value is ObservedWindowState {
  if (!value || typeof value !== "object") {
    return false;
  }
  
  const obj = value as Record<string, unknown>;
  
  const validQualities = ["verified", "provisional", "unverified"];
  
  return (
    typeof obj.windowId === "string" &&
    obj.stateType === "observed" &&
    validQualities.includes(String(obj.dataQuality)) &&
    typeof obj.capturedAt === "number" &&
    typeof obj.version === "string"
  );
}

/**
 * isBaselineWindowState
 * Guard to check if object implements BaselineWindowState.
 * Validates state type is "baseline" and includes baselineClassification.
 */
export function isBaselineWindowState(
  value: unknown
): value is BaselineWindowState {
  if (!value || typeof value !== "object") {
    return false;
  }
  
  const obj = value as Record<string, unknown>;
  
  const validClassifications = ["expected", "historical", "seasonal", "control"];
  
  return (
    typeof obj.windowId === "string" &&
    obj.stateType === "baseline" &&
    validClassifications.includes(String(obj.baselineClassification)) &&
    typeof obj.capturedAt === "number" &&
    typeof obj.version === "string"
  );
}

/**
 * isReferenceWindowState
 * Guard to check if object implements ReferenceWindowState.
 * Validates state type is "reference".
 */
export function isReferenceWindowState(
  value: unknown
): value is ReferenceWindowState {
  if (!value || typeof value !== "object") {
    return false;
  }
  
  const obj = value as Record<string, unknown>;
  
  return (
    typeof obj.windowId === "string" &&
    obj.stateType === "reference" &&
    typeof obj.capturedAt === "number" &&
    typeof obj.version === "string"
  );
}

/**
 * isWindowState
 * Guard to check if object implements any WindowState variant.
 * Discriminates between observed, baseline, and reference states.
 */
export function isWindowState(value: unknown): value is WindowState {
  return (
    isObservedWindowState(value) ||
    isBaselineWindowState(value) ||
    isReferenceWindowState(value)
  );
}

/**
 * isStateSnapshot
 * Guard to check if object implements StateSnapshot.
 * Validates presence of snapshot fields and states array.
 */
export function isStateSnapshot(value: unknown): value is StateSnapshot {
  if (!value || typeof value !== "object") {
    return false;
  }
  
  const obj = value as Record<string, unknown>;
  
  return (
    typeof obj.snapshotId === "string" &&
    obj.snapshotId.length > 0 &&
    Array.isArray(obj.states) &&
    (obj.states as unknown[]).every((s) => isWindowState(s)) &&
    typeof obj.capturedAt === "number" &&
    obj.capturedAt >= 0
  );
}
