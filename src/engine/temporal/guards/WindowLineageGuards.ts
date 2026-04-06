/**
 * Window Lineage Guards
 * Deterministic type guards for lineage structures.
 * Structural validation only, no domain semantics.
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

/**
 * isWindowLineageRole
 * Check if value is a valid WindowLineageRole.
 * Structural validation only.
 *
 * @param value - Value to check
 * @returns True if value is valid role
 */
export function isWindowLineageRole(value: unknown): value is WindowLineageRole {
  if (typeof value !== "string") return false;
  const validRoles: WindowLineageRole[] = [
    "previous",
    "current",
    "next",
    "baseline",
    "reference",
  ];
  return validRoles.includes(value as WindowLineageRole);
}

/**
 * isWindowLineageRelationType
 * Check if value is a valid WindowLineageRelationType.
 * Structural validation only.
 *
 * @param value - Value to check
 * @returns True if value is valid relation type
 */
export function isWindowLineageRelationType(
  value: unknown
): value is WindowLineageRelationType {
  if (typeof value !== "string") return false;
  const validTypes: WindowLineageRelationType[] = [
    "sequential_predecessor",
    "sequential_successor",
    "baseline_anchor",
    "reference_anchor",
    "temporal_sibling",
    "custom_relation",
  ];
  return validTypes.includes(value as WindowLineageRelationType);
}

/**
 * isWindowLineageReference
 * Check if value conforms to WindowLineageReference contract.
 * Structural validation only, no domain semantics.
 *
 * @param value - Value to check
 * @returns True if value is valid WindowLineageReference
 */
export function isWindowLineageReference(value: unknown): value is WindowLineageReference {
  if (!value || typeof value !== "object") return false;

  const ref = value as Record<string, unknown>;

  // Required fields
  if (typeof ref.windowId !== "string") return false;
  if (!isWindowLineageRole(ref.role)) return false;
  if (!isWindowLineageRelationType(ref.relationType)) return false;
  if (typeof ref.relationshipEstablishedAt !== "number") return false;

  // Optional fields
  if (
    ref.relationshipMetadata !== undefined &&
    (typeof ref.relationshipMetadata !== "object" ||
      ref.relationshipMetadata === null ||
      Array.isArray(ref.relationshipMetadata))
  ) {
    return false;
  }

  return true;
}

/**
 * isWindowLineageContract
 * Check if value conforms to WindowLineageContract.
 * Structural validation only, no domain semantics.
 *
 * @param value - Value to check
 * @returns True if value is valid WindowLineageContract
 */
export function isWindowLineageContract(value: unknown): value is WindowLineageContract {
  if (!value || typeof value !== "object") return false;

  const contract = value as Record<string, unknown>;

  // Required fields
  if (typeof contract.windowId !== "string") return false;
  if (typeof contract.windowCreatedAt !== "number") return false;
  if (!isWindowLineageRole(contract.roleInContext)) return false;

  // lineageReferences must be array
  if (!Array.isArray(contract.lineageReferences)) return false;
  if (!contract.lineageReferences.every(isWindowLineageReference)) return false;

  // Optional fields
  if (contract.depthInChain !== undefined && typeof contract.depthInChain !== "number") {
    return false;
  }
  if (contract.sequencePosition !== undefined && typeof contract.sequencePosition !== "number") {
    return false;
  }
  if (
    contract.lineageMetadata !== undefined &&
    (typeof contract.lineageMetadata !== "object" ||
      contract.lineageMetadata === null ||
      Array.isArray(contract.lineageMetadata))
  ) {
    return false;
  }

  return true;
}

/**
 * isWindowLineageChain
 * Check if value conforms to WindowLineageChain.
 * Structural validation only, no domain semantics.
 *
 * @param value - Value to check
 * @returns True if value is valid WindowLineageChain
 */
export function isWindowLineageChain(value: unknown): value is WindowLineageChain {
  if (!value || typeof value !== "object") return false;

  const chain = value as Record<string, unknown>;

  // Required fields
  if (typeof chain.chainId !== "string") return false;
  if (!Array.isArray(chain.windowIds)) return false;
  if (!chain.windowIds.every((id: unknown) => typeof id === "string")) return false;
  if (!isWindowLineageRole(chain.chainRole)) return false;
  if (typeof chain.chainEstablishedAt !== "number") return false;

  // Optional fields
  if (
    chain.chainMetadata !== undefined &&
    (typeof chain.chainMetadata !== "object" ||
      chain.chainMetadata === null ||
      Array.isArray(chain.chainMetadata))
  ) {
    return false;
  }

  return true;
}

/**
 * isWindowLineageMembership
 * Check if value conforms to WindowLineageMembershipEntity.
 * Structural validation only, no domain semantics.
 *
 * @param value - Value to check
 * @returns True if value is valid membership entity
 */
export function isWindowLineageMembership(value: unknown): value is WindowLineageMembershipEntity {
  if (!value || typeof value !== "object") return false;

  const membership = value as Record<string, unknown>;

  // Required fields
  if (typeof membership.windowId !== "string") return false;
  if (typeof membership.chainId !== "string") return false;
  if (typeof membership.positionInChain !== "number") return false;
  if (typeof membership.membershipEstablishedAt !== "number") return false;

  // Optional fields
  if (membership.depthInLineage !== undefined && typeof membership.depthInLineage !== "number") {
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
 * isWindowLineageAncestry
 * Check if value conforms to WindowLineageAncestry.
 * Structural validation only, no domain semantics.
 *
 * @param value - Value to check
 * @returns True if value is valid ancestry entity
 */
export function isWindowLineageAncestry(value: unknown): value is WindowLineageAncestry {
  if (!value || typeof value !== "object") return false;

  const ancestry = value as Record<string, unknown>;

  // Required fields
  if (typeof ancestry.windowId !== "string") return false;
  if (!isWindowLineageRole(ancestry.role)) return false;

  // All lineage arrays required but can be empty
  if (!Array.isArray(ancestry.predecessors)) return false;
  if (!ancestry.predecessors.every(isWindowLineageReference)) return false;

  if (!Array.isArray(ancestry.successors)) return false;
  if (!ancestry.successors.every(isWindowLineageReference)) return false;

  if (!Array.isArray(ancestry.baselineAnchors)) return false;
  if (!ancestry.baselineAnchors.every(isWindowLineageReference)) return false;

  if (!Array.isArray(ancestry.referenceAnchors)) return false;
  if (!ancestry.referenceAnchors.every(isWindowLineageReference)) return false;

  if (!Array.isArray(ancestry.siblings)) return false;
  if (!ancestry.siblings.every(isWindowLineageReference)) return false;

  // Optional metadata
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
