/**
 * Previous/Current Window Continuity Guards
 * Deterministic type guards for continuity structures.
 * Structural validation only, no domain semantics.
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

/**
 * isContinuityRole
 * Check if value is a valid ContinuityRole.
 * Structural validation only.
 *
 * @param value - Value to check
 * @returns True if value is valid role
 */
export function isContinuityRole(value: unknown): value is ContinuityRole {
  if (typeof value !== "string") return false;
  const validRoles: ContinuityRole[] = ["previous", "current", "next"];
  return validRoles.includes(value as ContinuityRole);
}

/**
 * isContinuityRelationType
 * Check if value is a valid ContinuityRelationType.
 * Structural validation only.
 *
 * @param value - Value to check
 * @returns True if value is valid continuity type
 */
export function isContinuityRelationType(value: unknown): value is ContinuityRelationType {
  if (typeof value !== "string") return false;
  const validTypes: ContinuityRelationType[] = [
    "sequential_progression",
    "paired_reference",
    "temporal_anchor",
    "custom_continuity",
  ];
  return validTypes.includes(value as ContinuityRelationType);
}

/**
 * isContinuityReference
 * Check if value conforms to ContinuityReference contract.
 * Structural validation only, no domain semantics.
 *
 * @param value - Value to check
 * @returns True if value is valid ContinuityReference
 */
export function isContinuityReference(value: unknown): value is ContinuityReference {
  if (!value || typeof value !== "object") return false;

  const ref = value as Record<string, unknown>;

  // Required fields
  if (typeof ref.windowId !== "string") return false;
  if (!isContinuityRole(ref.role)) return false;
  if (!isContinuityRelationType(ref.relationType)) return false;
  if (typeof ref.continuityEstablishedAt !== "number") return false;

  // Optional fields
  if (
    ref.continuityMetadata !== undefined &&
    (typeof ref.continuityMetadata !== "object" ||
      ref.continuityMetadata === null ||
      Array.isArray(ref.continuityMetadata))
  ) {
    return false;
  }

  return true;
}

/**
 * isPreviousCurrentContract
 * Check if value conforms to PreviousCurrentContract.
 * Structural validation only, no domain semantics.
 *
 * @param value - Value to check
 * @returns True if value is valid PreviousCurrentContract
 */
export function isPreviousCurrentContract(value: unknown): value is PreviousCurrentContract {
  if (!value || typeof value !== "object") return false;

  const contract = value as Record<string, unknown>;

  // Required fields
  if (typeof contract.currentWindowId !== "string") return false;
  if (typeof contract.previousWindowId !== "string") return false;
  if (!isContinuityRelationType(contract.continuityRelationType)) return false;
  if (typeof contract.continuityEstablishedAt !== "number") return false;
  if (typeof contract.currentStartedAt !== "number") return false;

  // Optional fields
  if (contract.nextWindowId !== undefined && typeof contract.nextWindowId !== "string") {
    return false;
  }
  if (
    contract.continuityMetadata !== undefined &&
    (typeof contract.continuityMetadata !== "object" ||
      contract.continuityMetadata === null ||
      Array.isArray(contract.continuityMetadata))
  ) {
    return false;
  }

  return true;
}

/**
 * isContinuityPairIdentity
 * Check if value conforms to ContinuityPairIdentity.
 * Structural validation only, no domain semantics.
 *
 * @param value - Value to check
 * @returns True if value is valid ContinuityPairIdentity
 */
export function isContinuityPairIdentity(value: unknown): value is ContinuityPairIdentity {
  if (!value || typeof value !== "object") return false;

  const pair = value as Record<string, unknown>;

  // Required fields
  if (typeof pair.pairId !== "string") return false;
  if (typeof pair.currentWindowId !== "string") return false;
  if (typeof pair.previousWindowId !== "string") return false;
  if (typeof pair.pairingEstablishedAt !== "number") return false;

  // Optional fields
  if (
    pair.pairMetadata !== undefined &&
    (typeof pair.pairMetadata !== "object" ||
      pair.pairMetadata === null ||
      Array.isArray(pair.pairMetadata))
  ) {
    return false;
  }

  return true;
}

/**
 * isContinuitySet
 * Check if value conforms to ContinuitySet.
 * Structural validation only, no domain semantics.
 *
 * @param value - Value to check
 * @returns True if value is valid ContinuitySet
 */
export function isContinuitySet(value: unknown): value is ContinuitySet {
  if (!value || typeof value !== "object") return false;

  const set = value as Record<string, unknown>;

  // Required fields
  if (typeof set.setId !== "string") return false;
  if (!Array.isArray(set.windowIds)) return false;
  if (!set.windowIds.every((id: unknown) => typeof id === "string")) return false;
  if (typeof set.currentWindowIndex !== "number") return false;
  if (!isContinuityRelationType(set.continuityType)) return false;
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
 * isContinuityMembership
 * Check if value conforms to ContinuityMembership.
 * Structural validation only, no domain semantics.
 *
 * @param value - Value to check
 * @returns True if value is valid ContinuityMembership
 */
export function isContinuityMembership(value: unknown): value is ContinuityMembership {
  if (!value || typeof value !== "object") return false;

  const membership = value as Record<string, unknown>;

  // Required fields
  if (typeof membership.windowId !== "string") return false;
  if (typeof membership.setId !== "string") return false;
  if (typeof membership.positionInSet !== "number") return false;
  if (!isContinuityRole(membership.roleInSet)) return false;
  if (typeof membership.membershipEstablishedAt !== "number") return false;

  // Optional fields
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
 * isFullContinuityAncestry
 * Check if value conforms to FullContinuityAncestry.
 * Structural validation only, no domain semantics.
 *
 * @param value - Value to check
 * @returns True if value is valid FullContinuityAncestry
 */
export function isFullContinuityAncestry(value: unknown): value is FullContinuityAncestry {
  if (!value || typeof value !== "object") return false;

  const ancestry = value as Record<string, unknown>;

  // Required fields
  if (typeof ancestry.windowId !== "string") return false;
  if (!isContinuityRole(ancestry.role)) return false;
  if (typeof ancestry.continuityContextEstablishedAt !== "number") return false;

  // Optional fields
  if (
    ancestry.previousContext !== undefined &&
    !isContinuityReference(ancestry.previousContext)
  ) {
    return false;
  }
  if (ancestry.nextContext !== undefined && !isContinuityReference(ancestry.nextContext)) {
    return false;
  }
  if (
    ancestry.metadata !== undefined &&
    (typeof ancestry.metadata !== "object" ||
      ancestry.metadata === null ||
      Array.isArray(ancestry.metadata))
  ) {
    return false;
  }

  return true;
}
