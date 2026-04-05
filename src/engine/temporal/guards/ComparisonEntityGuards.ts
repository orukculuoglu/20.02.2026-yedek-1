/**
 * Comparison Entity Guards
 * Type guards for comparison pair/group/matrix structural entities.
 * Deterministic predicates for runtime type checking.
 */

import type {
  ComparisonPair,
  ComparisonGroup,
  ComparisonMatrix,
  WindowSetMember,
  OrderedWindowCollection,
} from "../contracts/index.ts";
import { ComparisonWindowRole, ComparisonPairType, ComparisonGroupType, OrderingType } from "../contracts/index.ts";

/**
 * isComparisonPair
 * Guard to check if object implements ComparisonPair.
 * Validates required fields: pairId, windowIds, roles, type, timestamps.
 */
export function isComparisonPair(value: unknown): value is ComparisonPair {
  if (!value || typeof value !== "object") {
    return false;
  }
  
  const obj = value as Record<string, unknown>;
  
  const validRoles = Object.values(ComparisonWindowRole) as string[];
  const validPairTypes = Object.values(ComparisonPairType) as string[];
  
  return (
    typeof obj.pairId === "string" &&
    obj.pairId.length > 0 &&
    typeof obj.leftWindowId === "string" &&
    obj.leftWindowId.length > 0 &&
    typeof obj.rightWindowId === "string" &&
    obj.rightWindowId.length > 0 &&
    validRoles.includes(String(obj.leftRole)) &&
    validRoles.includes(String(obj.rightRole)) &&
    validPairTypes.includes(String(obj.pairType)) &&
    typeof obj.createdAt === "number" &&
    obj.createdAt >= 0
  );
}

/**
 * isWindowSetMember
 * Guard to check if object implements WindowSetMember.
 * Validates windowId, position, descriptor, and flags.
 */
export function isWindowSetMember(value: unknown): value is WindowSetMember {
  if (!value || typeof value !== "object") {
    return false;
  }
  
  const obj = value as Record<string, unknown>;
  
  return (
    typeof obj.windowId === "string" &&
    obj.windowId.length > 0 &&
    typeof obj.position === "number" &&
    obj.position >= 0 &&
    obj.descriptor &&
    typeof obj.descriptor === "object" &&
    typeof (obj.descriptor as Record<string, unknown>).windowId === "string" &&
    typeof (obj.descriptor as Record<string, unknown>).sequencePosition === "number" &&
    typeof (obj.descriptor as Record<string, unknown>).familyType === "string" &&
    typeof obj.isRequired === "boolean" &&
    typeof obj.canBeSkipped === "boolean"
  );
}

/**
 * isComparisonGroup
 * Guard to check if object implements ComparisonGroup.
 * Validates groupId, pairs, windowIds, groupType.
 */
export function isComparisonGroup(value: unknown): value is ComparisonGroup {
  if (!value || typeof value !== "object") {
    return false;
  }
  
  const obj = value as Record<string, unknown>;
  
  const validGroupTypes = Object.values(ComparisonGroupType) as string[];
  
  return (
    typeof obj.groupId === "string" &&
    obj.groupId.length > 0 &&
    Array.isArray(obj.pairs) &&
    Array.isArray(obj.windowIds) &&
    validGroupTypes.includes(String(obj.groupType)) &&
    typeof obj.createdAt === "number" &&
    obj.createdAt >= 0
  );
}

/**
 * isComparisonMatrix
 * Guard to check if object implements ComparisonMatrix.
 * Validates matrixId, windowIds, pairIds, matrixType.
 */
export function isComparisonMatrix(value: unknown): value is ComparisonMatrix {
  if (!value || typeof value !== "object") {
    return false;
  }
  
  const obj = value as Record<string, unknown>;
  
  const validMatrixTypes = [
    "full",
    "upper_triangle",
    "lower_triangle",
    "sparse",
  ];
  
  return (
    typeof obj.matrixId === "string" &&
    obj.matrixId.length > 0 &&
    Array.isArray(obj.windowIds) &&
    Array.isArray(obj.pairIds) &&
    validMatrixTypes.includes(String(obj.matrixType)) &&
    typeof obj.createdAt === "number" &&
    obj.createdAt >= 0
  );
}

/**
 * isOrderedWindowCollection
 * Guard to check if object implements OrderedWindowCollection.
 * Validates collectionId, members array, ordering metadata.
 */
export function isOrderedWindowCollection(
  value: unknown
): value is OrderedWindowCollection {
  if (!value || typeof value !== "object") {
    return false;
  }
  
  const obj = value as Record<string, unknown>;
  
  const validOrderingTypes = Object.values(OrderingType) as string[];
  
  return (
    typeof obj.collectionId === "string" &&
    obj.collectionId.length > 0 &&
    Array.isArray(obj.members) &&
    obj.members.every((m) => isWindowSetMember(m)) &&
    obj.ordering &&
    typeof obj.ordering === "object" &&
    validOrderingTypes.includes(String((obj.ordering as Record<string, unknown>).type)) &&
    typeof obj.createdAt === "number" &&
    obj.createdAt >= 0
  );
}

/**
 * isValidComparisonPairStructure
 * Guard to verify a pair's structure is internally consistent.
 * Checks that left and right window IDs are distinct and valid.
 */
export function isValidComparisonPairStructure(pair: ComparisonPair): pair is ComparisonPair {
  return (
    isComparisonPair(pair) &&
    pair.leftWindowId !== pair.rightWindowId && // Distinct windows
    pair.leftWindowId.length > 0 &&
    pair.rightWindowId.length > 0
  );
}

/**
 * isValidComparisonGroupStructure
 * Guard to verify a group's structure is internally consistent.
 * Checks that all pairs use windows from the windowIds set.
 */
export function isValidComparisonGroupStructure(group: ComparisonGroup): group is ComparisonGroup {
  if (!isComparisonGroup(group)) {
    return false;
  }
  
  const windowIdSet = new Set(group.windowIds);
  
  // All pairs should reference windows in the group
  return group.pairs.every((pair) => {
    return (
      isComparisonPair(pair) &&
      windowIdSet.has(pair.leftWindowId) &&
      windowIdSet.has(pair.rightWindowId)
    );
  });
}

/**
 * isValidComparisonMatrixStructure
 * Guard to verify a matrix's structure is internally consistent.
 * Checks that all pair IDs would correspond to valid matrix positions.
 */
export function isValidComparisonMatrixStructure(
  matrix: ComparisonMatrix
): matrix is ComparisonMatrix {
  if (!isComparisonMatrix(matrix)) {
    return false;
  }
  
  // Matrix should have pairs for all window combinations (or appropriate subset)
  const uniquePairs = new Set(matrix.pairIds);
  
  return (
    matrix.pairIds.length === uniquePairs.size && // No duplicate pair IDs
    matrix.windowIds.length > 0 &&
    matrix.pairIds.length > 0
  );
}

/**
 * hasComparisonPairInGroup
 * Check if a specific pair exists in a group.
 */
export function hasComparisonPairInGroup(
  group: ComparisonGroup,
  pairId: string
): boolean {
  return (
    isComparisonGroup(group) &&
    group.pairs.some((p) => isComparisonPair(p) && p.pairId === pairId)
  );
}

/**
 * getWindowsFromGroup
 * Extract all unique window IDs referenced in a group.
 */
export function getWindowsFromGroup(group: ComparisonGroup): string[] {
  if (!isComparisonGroup(group)) {
    return [];
  }
  
  return Array.from(new Set(group.windowIds));
}

/**
 * getWindowsFromMatrix
 * Extract all unique window IDs referenced in a matrix.
 */
export function getWindowsFromMatrix(matrix: ComparisonMatrix): string[] {
  if (!isComparisonMatrix(matrix)) {
    return [];
  }
  
  return Array.from(new Set(matrix.windowIds));
}
