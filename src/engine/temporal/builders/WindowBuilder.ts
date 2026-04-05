/**
 * Window Builder
 * Deterministic construction of temporal window entities.
 * Requires explicit inputs. No implicit generation or defaults.
 */

import type {
  MultiWindowTemporalContract,
  TemporalWindowBoundary,
  TemporalWindowMetadata,
  WindowTypeContract,
  TemporalComparisonContract,
  WindowRelationship,
} from "../contracts/index.ts";
import { WindowType, WindowRole } from "../contracts/index.ts";
import type {
  TemporalWindowEntity,
  BoundaryInstance,
  WindowTypeInstance,
  ComparisonContractInstance,
} from "../entities/index.ts";
import type { CanonicalWindowIdentity } from "../entities/WindowIdentity.ts";

/**
 * WindowBuilder
 * Constructs TemporalWindowEntity from fully explicit components.
 * 
 * No implicit generation. All fields must be provided by caller.
 * All structural validity is enforced but not inferred.
 */
export class WindowBuilder {
  /**
   * build
   * Construct a TemporalWindowEntity from explicit components.
   * 
   * @param identity - Canonical window identity (required, no generation)
   * @param contract - Multi-window temporal contract (required)
   * @param entityCreatedAt - Entity creation timestamp in Unix ms (required, no auto-fill)
   * @returns Fully constructed TemporalWindowEntity
   */
  static build(
    identity: CanonicalWindowIdentity,
    contract: MultiWindowTemporalContract,
    entityCreatedAt: number
  ): TemporalWindowEntity {
    // Validate inputs are present and valid types
    if (!identity) {
      throw new Error("WindowBuilder.build: identity is required");
    }
    if (!contract) {
      throw new Error("WindowBuilder.build: contract is required");
    }
    if (typeof entityCreatedAt !== "number" || entityCreatedAt < 0) {
      throw new Error("WindowBuilder.build: entityCreatedAt must be a non-negative number");
    }

    // Construct entity with explicit fields
    const entity: TemporalWindowEntity = {
      identity,
      contract,
      entityCreatedAt,
    };

    return entity;
  }

  /**
   * buildWithComponents
   * Alternative constructor that builds entity from discrete contract components.
   * Still requires all fields explicit (no inference).
   * 
   * @param identity - Canonical window identity
   * @param id - Window ID (must match identity.identifier.id conceptually)
   * @param metadata - Window metadata
   * @param boundary - Temporal boundaries
   * @param windowType - Window type/role contract
   * @param comparison - Comparison specification
   * @param relationships - Inter-window relationships
   * @param entityCreatedAt - Entity creation timestamp
   * @returns Fully constructed TemporalWindowEntity
   */
  static buildWithComponents(
    identity: CanonicalWindowIdentity,
    id: string,
    metadata: TemporalWindowMetadata,
    boundary: TemporalWindowBoundary,
    windowType: WindowTypeContract,
    comparison: TemporalComparisonContract,
    relationships: WindowRelationship[],
    entityCreatedAt: number
  ): TemporalWindowEntity {
    // Validate all inputs
    if (!identity) {
      throw new Error("WindowBuilder.buildWithComponents: identity is required");
    }
    if (!id || typeof id !== "string") {
      throw new Error("WindowBuilder.buildWithComponents: id must be a non-empty string");
    }
    
    // Enforce identity/contract ID consistency
    if (identity.identifier.id !== id) {
      throw new Error(
        `WindowBuilder.buildWithComponents: identity.identifier.id ("${identity.identifier.id}") must match id ("${id}")`
      );
    }
    
    if (!metadata) {
      throw new Error("WindowBuilder.buildWithComponents: metadata is required");
    }
    if (!boundary) {
      throw new Error("WindowBuilder.buildWithComponents: boundary is required");
    }
    if (!windowType) {
      throw new Error("WindowBuilder.buildWithComponents: windowType is required");
    }
    if (!comparison) {
      throw new Error("WindowBuilder.buildWithComponents: comparison is required");
    }
    if (!Array.isArray(relationships)) {
      throw new Error("WindowBuilder.buildWithComponents: relationships must be an array");
    }
    if (typeof entityCreatedAt !== "number" || entityCreatedAt < 0) {
      throw new Error("WindowBuilder.buildWithComponents: entityCreatedAt must be a non-negative number");
    }

    // Build contract from components
    const contract: MultiWindowTemporalContract = {
      id,
      metadata,
      boundary,
      windowType,
      comparison,
      relationships,
    };

    // Construct entity
    const entity: TemporalWindowEntity = {
      identity,
      contract,
      entityCreatedAt,
    };

    return entity;
  }
}

/**
 * BoundaryBuilder
 * Constructs BoundaryInstance from explicit time range.
 * No calculation, no inference.
 */
export class BoundaryBuilder {
  /**
   * build
   * Construct a BoundaryInstance from explicit values.
   * 
   * @param boundaryId - Unique identifier for boundary (no generation)
   * @param windowId - Reference to window
   * @param startTimestamp - Start time in Unix ms (inclusive)
   * @param endTimestamp - End time in Unix ms (inclusive)
   * @returns Fully constructed BoundaryInstance with computed durationMs
   */
  static build(
    boundaryId: string,
    windowId: string,
    startTimestamp: number,
    endTimestamp: number,
    createdAt: number
  ): BoundaryInstance {
    // Validate inputs
    if (!boundaryId || typeof boundaryId !== "string") {
      throw new Error("BoundaryBuilder.build: boundaryId must be a non-empty string");
    }
    if (!windowId || typeof windowId !== "string") {
      throw new Error("BoundaryBuilder.build: windowId must be a non-empty string");
    }
    if (typeof startTimestamp !== "number" || startTimestamp < 0) {
      throw new Error("BoundaryBuilder.build: startTimestamp must be a non-negative number");
    }
    if (typeof endTimestamp !== "number" || endTimestamp < 0) {
      throw new Error("BoundaryBuilder.build: endTimestamp must be a non-negative number");
    }
    if (endTimestamp < startTimestamp) {
      throw new Error("BoundaryBuilder.build: endTimestamp must be >= startTimestamp");
    }
    if (typeof createdAt !== "number" || createdAt < 0) {
      throw new Error("BoundaryBuilder.build: createdAt must be a non-negative number");
    }

    // Compute duration (only arithmetic, no interpretation)
    const durationMs = endTimestamp - startTimestamp;

    return {
      boundaryId,
      windowId,
      start: startTimestamp,
      end: endTimestamp,
      durationMs,
      createdAt,
    };
  }
}

/**
 * WindowTypeBuilder
 * Constructs WindowTypeInstance from explicit type and role.
 */
export class WindowTypeBuilder {
  /**
   * build
   * Construct a WindowTypeInstance with explicit classification.
   * 
   * @param instanceId - Unique identifier for this instance
   * @param windowId - Reference to window
   * @param type - Window type contract (WindowType enum)
   * @param role - Window role contract (WindowRole enum)
   * @param assignedAt - Timestamp of assignment
   * @returns Fully constructed WindowTypeInstance
   */
  static build(
    instanceId: string,
    windowId: string,
    type: WindowType,
    role: WindowRole,
    assignedAt: number
  ): WindowTypeInstance {
    // Validate inputs
    if (!instanceId || typeof instanceId !== "string") {
      throw new Error("WindowTypeBuilder.build: instanceId must be a non-empty string");
    }
    if (!windowId || typeof windowId !== "string") {
      throw new Error("WindowTypeBuilder.build: windowId must be a non-empty string");
    }
    if (!type || typeof type !== "string") {
      throw new Error("WindowTypeBuilder.build: type must be a valid WindowType");
    }
    if (!role || typeof role !== "string") {
      throw new Error("WindowTypeBuilder.build: role must be a valid WindowRole");
    }
    if (typeof assignedAt !== "number" || assignedAt < 0) {
      throw new Error("WindowTypeBuilder.build: assignedAt must be a non-negative number");
    }

    return {
      instanceId,
      windowId,
      type,
      role,
      assignedAt,
    };
  }
}
