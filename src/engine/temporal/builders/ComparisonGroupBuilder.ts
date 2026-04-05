/**
 * Comparison Group Builder
 * Deterministic construction of comparison groups and group entities.
 * Requires explicit inputs. No analytical processing.
 */

import type {
  ComparisonPair,
  ComparisonGroup,
  ComparisonGroupType,
} from "../contracts/index.ts";
import type {
  ComparisonPairEntity,
  ComparisonGroupEntity,
} from "../entities/index.ts";

/**
 * ComparisonGroupBuilder
 * Constructs ComparisonGroup contracts from fully explicit specifications.
 * 
 * Enforces structural consistency only. No domain inference.
 */
export class ComparisonGroupBuilder {
  /**
   * build
   * Construct a ComparisonGroup contract from explicit components.
   * 
   * @param groupId - Unique identifier (no generation)
   * @param pairs - Array of comparison pairs (must be provided and non-empty)
   * @param windowIds - All unique window IDs in group (must be provided explicitly)
   * @param groupType - Classification of group structure
   * @param createdAt - Timestamp of group definition (Unix ms)
   * @returns Fully constructed ComparisonGroup
   */
  static build(
    groupId: string,
    pairs: ComparisonPair[],
    windowIds: string[],
    groupType: ComparisonGroupType,
    createdAt: number
  ): ComparisonGroup {
    // Validate group ID
    if (!groupId || typeof groupId !== "string") {
      throw new Error("ComparisonGroupBuilder.build: groupId must be a non-empty string");
    }

    // Validate pairs array
    if (!Array.isArray(pairs)) {
      throw new Error("ComparisonGroupBuilder.build: pairs must be an array");
    }
    if (pairs.length === 0) {
      throw new Error("ComparisonGroupBuilder.build: pairs must contain at least one pair");
    }
    // Validate each pair has required fields
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i];
      if (!pair || typeof pair !== "object") {
        throw new Error(`ComparisonGroupBuilder.build: pairs[${i}] must be a valid object`);
      }
      if (!pair.pairId || typeof pair.pairId !== "string") {
        throw new Error(`ComparisonGroupBuilder.build: pairs[${i}].pairId must be a non-empty string`);
      }
    }

    // Validate window IDs array
    if (!Array.isArray(windowIds)) {
      throw new Error("ComparisonGroupBuilder.build: windowIds must be an array");
    }
    if (windowIds.length === 0) {
      throw new Error("ComparisonGroupBuilder.build: windowIds must contain at least one window");
    }
    // Validate each window ID
    for (let i = 0; i < windowIds.length; i++) {
      if (typeof windowIds[i] !== "string" || windowIds[i].length === 0) {
        throw new Error(`ComparisonGroupBuilder.build: windowIds[${i}] must be a non-empty string`);
      }
    }

    // Validate group type
    if (!groupType || typeof groupType !== "string") {
      throw new Error("ComparisonGroupBuilder.build: groupType must be a string");
    }

    // Validate timestamp
    if (typeof createdAt !== "number" || createdAt < 0) {
      throw new Error("ComparisonGroupBuilder.build: createdAt must be a non-negative number");
    }

    return {
      groupId,
      pairs,
      windowIds,
      groupType,
      createdAt,
    };
  }

  /**
   * buildWithValidation
   * Build a group with explicit structural consistency checks.
   * Ensures all pairs reference windows from the group's windowIds set.
   * 
   * @param groupId - Group identifier
   * @param pairs - Array of comparison pairs
   * @param windowIds - All window IDs in group
   * @param groupType - Group type
   * @param createdAt - Creation timestamp
   * @returns Fully constructed and validated ComparisonGroup
   */
  static buildWithValidation(
    groupId: string,
    pairs: ComparisonPair[],
    windowIds: string[],
    groupType: ComparisonGroupType,
    createdAt: number
  ): ComparisonGroup {
    // Build with standard validation
    const group = this.build(groupId, pairs, windowIds, groupType, createdAt);

    // Additional structural check: all pairs must reference windows in the group
    const windowIdSet = new Set(group.windowIds);

    for (let i = 0; i < group.pairs.length; i++) {
      const pair = group.pairs[i];
      if (!windowIdSet.has(pair.leftWindowId)) {
        throw new Error(
          `ComparisonGroupBuilder.buildWithValidation: pairs[${i}].leftWindowId "${pair.leftWindowId}" not in windowIds`
        );
      }
      if (!windowIdSet.has(pair.rightWindowId)) {
        throw new Error(
          `ComparisonGroupBuilder.buildWithValidation: pairs[${i}].rightWindowId "${pair.rightWindowId}" not in windowIds`
        );
      }
    }

    return group;
  }
}

/**
 * ComparisonGroupEntityBuilder
 * Constructs ComparisonGroupEntity (decorated group) from explicit components.
 */
export class ComparisonGroupEntityBuilder {
  /**
   * build
   * Construct a ComparisonGroupEntity from group and entity metadata.
   * 
   * @param entityId - Entity identity (no generation)
   * @param group - ComparisonGroup contract
   * @param pairs - Array of ComparisonPairEntity instances
   * @param windowIds - All unique window IDs in group
   * @param groupType - Group type classification
   * @param instantiatedAt - Entity instantiation timestamp
   * @returns Fully constructed ComparisonGroupEntity
   */
  static build(
    entityId: string,
    group: ComparisonGroup,
    pairs: ComparisonPairEntity[],
    windowIds: string[],
    groupType: ComparisonGroupType,
    instantiatedAt: number
  ): ComparisonGroupEntity {
    // Validate entity ID
    if (!entityId || typeof entityId !== "string") {
      throw new Error("ComparisonGroupEntityBuilder.build: entityId must be a non-empty string");
    }

    // Validate group
    if (!group) {
      throw new Error("ComparisonGroupEntityBuilder.build: group is required");
    }

    // Validate pairs array
    if (!Array.isArray(pairs)) {
      throw new Error("ComparisonGroupEntityBuilder.build: pairs must be an array");
    }
    if (pairs.length === 0) {
      throw new Error("ComparisonGroupEntityBuilder.build: pairs must contain at least one pair entity");
    }
    // Validate each pair entity
    for (let i = 0; i < pairs.length; i++) {
      if (!pairs[i] || typeof pairs[i] !== "object") {
        throw new Error(`ComparisonGroupEntityBuilder.build: pairs[${i}] must be a valid object`);
      }
      if (!pairs[i].entityId || typeof pairs[i].entityId !== "string") {
        throw new Error(`ComparisonGroupEntityBuilder.build: pairs[${i}].entityId must be a non-empty string`);
      }
    }

    // Validate window IDs
    if (!Array.isArray(windowIds)) {
      throw new Error("ComparisonGroupEntityBuilder.build: windowIds must be an array");
    }
    if (windowIds.length === 0) {
      throw new Error("ComparisonGroupEntityBuilder.build: windowIds must contain at least one window");
    }
    for (let i = 0; i < windowIds.length; i++) {
      if (typeof windowIds[i] !== "string" || windowIds[i].length === 0) {
        throw new Error(`ComparisonGroupEntityBuilder.build: windowIds[${i}] must be a non-empty string`);
      }
    }

    // Validate group type
    if (!groupType || typeof groupType !== "string") {
      throw new Error("ComparisonGroupEntityBuilder.build: groupType must be a string");
    }

    // Validate timestamp
    if (typeof instantiatedAt !== "number" || instantiatedAt < 0) {
      throw new Error("ComparisonGroupEntityBuilder.build: instantiatedAt must be a non-negative number");
    }

    return {
      entityId,
      group,
      pairs,
      windowIds,
      groupType,
      instantiatedAt,
    };
  }

  /**
   * buildFromGroup
   * Convenience method: build entity from ComparisonGroup contract.
   * Caller must provide the pair entities separately.
   * 
   * @param entityId - Entity identity
   * @param group - Pre-constructed ComparisonGroup
   * @param pairs - Array of ComparisonPairEntity instances
   * @param instantiatedAt - Entity instantiation timestamp
   * @returns Fully constructed ComparisonGroupEntity
   */
  static buildFromGroup(
    entityId: string,
    group: ComparisonGroup,
    pairs: ComparisonPairEntity[],
    instantiatedAt: number
  ): ComparisonGroupEntity {
    return this.build(
      entityId,
      group,
      pairs,
      group.windowIds,
      group.groupType,
      instantiatedAt
    );
  }

  /**
   * buildWithValidation
   * Build a group entity with explicit structural consistency checks.
   * Ensures all pairs reference windows from the group's windowIds set.
   * 
   * @param entityId - Entity identity
   * @param group - ComparisonGroup contract
   * @param pairs - Array of ComparisonPairEntity instances
   * @param windowIds - All unique window IDs
   * @param groupType - Group type
   * @param instantiatedAt - Entity instantiation timestamp
   * @returns Fully constructed and validated ComparisonGroupEntity
   */
  static buildWithValidation(
    entityId: string,
    group: ComparisonGroup,
    pairs: ComparisonPairEntity[],
    windowIds: string[],
    groupType: ComparisonGroupType,
    instantiatedAt: number
  ): ComparisonGroupEntity {
    // Build with standard validation
    const entity = this.build(entityId, group, pairs, windowIds, groupType, instantiatedAt);

    // Additional check: all pair entities must reference windows in the group
    const windowIdSet = new Set(windowIds);

    for (let i = 0; i < entity.pairs.length; i++) {
      const pairEntity = entity.pairs[i];
      if (!windowIdSet.has(pairEntity.leftWindowId)) {
        throw new Error(
          `ComparisonGroupEntityBuilder.buildWithValidation: pairs[${i}].leftWindowId "${pairEntity.leftWindowId}" not in windowIds`
        );
      }
      if (!windowIdSet.has(pairEntity.rightWindowId)) {
        throw new Error(
          `ComparisonGroupEntityBuilder.buildWithValidation: pairs[${i}].rightWindowId "${pairEntity.rightWindowId}" not in windowIds`
        );
      }
    }

    return entity;
  }
}
