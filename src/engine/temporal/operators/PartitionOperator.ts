/**
 * Partition Operator
 * Deterministic partitioning of window collections into explicit groups/subsets.
 * Partition rules must be fully explicit; no heuristics.
 * No clustering, no auto-grouping, no semantic inference.
 */

import type {
  TemporalWindowEntity,
  WindowSetMemberEntity,
} from "../entities/index.ts";
import type { PartitionedWindowSet as PartitionedWindowSetContract } from "../contracts/index.ts";

/**
 * PartitionRule
 * Explicit specification of how to partition a collection.
 * Caller must provide the complete partitioning logic.
 */
export interface PartitionRule {
  /**
   * strategy: Partitioning strategy
   * - indices: partition by explicit index ranges
   * - predicate: partition by explicit member predicate function
   * - explicit: partition by explicit window ID lists
   */
  strategy: "indices" | "predicate" | "explicit";
}

/**
 * IndexRangePartition
 * Partition definition using explicit index ranges.
 */
export interface IndexRangePartition extends PartitionRule {
  strategy: "indices";
  
  /**
   * ranges: Array of [startIndex, endIndex] pairs (inclusive).
   * Indices must be within bounds of the collection.
   */
  ranges: Array<[number, number]>;
}

/**
 * PredicatePartition
 * Partition definition using explicit member filter predicates.
 */
export interface PredicatePartition extends PartitionRule {
  strategy: "predicate";
  
  /**
   * partitions: Array of [name, predicate] pairs.
   * Each partition name must be unique.
   */
  partitions: Array<[string, (member: WindowSetMemberEntity) => boolean]>;
}

/**
 * ExplicitPartition
 * Partition definition using explicit window ID groupings.
 */
export interface ExplicitPartition extends PartitionRule {
  strategy: "explicit";
  
  /**
   * partitions: Record mapping partition names to arrays of window IDs.
   * Each window ID must be unique across all partitions.
   */
  partitions: Record<string, string[]>;
}

/**
 * PartitionedWindowSetEntity
 * Operator-level representation of a partitioned window set.
 * Extends contract details with entity-level window and member tracking.
 */
export interface PartitionedWindowSetEntity {
  contract: PartitionedWindowSetContract;
  partitionDetails: Array<{
    name: string;
    windows: TemporalWindowEntity[];
    members: WindowSetMemberEntity[];
    windowCount: number;
  }>;
  createdAt: number;             // When partitioning was performed (Unix ms)
}

/**
 * PartitionOperator
 * Deterministically partitions explicit window collections.
 * No heuristic clustering; partition rules must be fully explicit.
 */
export class PartitionOperator {
  /**
   * partitionByIndices
   * Partition windows by explicit index ranges.
   * 
   * @param windows - Source windows (must be non-empty)
   * @param members - Source members (must be non-empty)
   * @param partition - Index range partition definition
   * @param partitionId - Unique partition identifier
   * @param collectionId - Source collection identifier
   * @param createdAt - Timestamp when partitioning was performed (Unix ms)
   * @returns Partitioned window set entity with explicit ranges
   */
  static partitionByIndices(
    windows: TemporalWindowEntity[],
    members: WindowSetMemberEntity[],
    partition: IndexRangePartition,
    partitionId: string,
    collectionId: string,
    createdAt: number
  ): PartitionedWindowSetEntity {
    // Validate inputs
    if (!Array.isArray(windows) || windows.length === 0) {
      throw new Error("PartitionOperator.partitionByIndices: windows must be a non-empty array");
    }
    if (!Array.isArray(members) || members.length === 0) {
      throw new Error("PartitionOperator.partitionByIndices: members must be a non-empty array");
    }
    if (!partition || !Array.isArray(partition.ranges)) {
      throw new Error("PartitionOperator.partitionByIndices: partition.ranges must be an array");
    }
    if (partition.ranges.length === 0) {
      throw new Error("PartitionOperator.partitionByIndices: partition.ranges must be non-empty");
    }
    if (!partitionId || typeof partitionId !== "string") {
      throw new Error("PartitionOperator.partitionByIndices: partitionId must be a non-empty string");
    }
    if (!collectionId || typeof collectionId !== "string") {
      throw new Error("PartitionOperator.partitionByIndices: collectionId must be a non-empty string");
    }
    if (typeof createdAt !== "number" || createdAt < 0) {
      throw new Error("PartitionOperator.partitionByIndices: createdAt must be a non-negative number");
    }

    // Validate all ranges
    for (let i = 0; i < partition.ranges.length; i++) {
      const [start, end] = partition.ranges[i];
      if (typeof start !== "number" || typeof end !== "number") {
        throw new Error(`PartitionOperator.partitionByIndices: ranges[${i}] must be [number, number]`);
      }
      if (start < 0 || end >= windows.length) {
        throw new Error(
          `PartitionOperator.partitionByIndices: ranges[${i}] [${start}, ${end}] out of bounds [0, ${windows.length - 1}]`
        );
      }
      if (start > end) {
        throw new Error(`PartitionOperator.partitionByIndices: ranges[${i}] start must be <= end`);
      }
    }

    // Create partition details by index ranges
    const partitionDetails: Array<{
      name: string;
      windows: TemporalWindowEntity[];
      members: WindowSetMemberEntity[];
      windowCount: number;
    }> = [];

    const contractPartitions: Record<string, string[]> = {};

    for (let i = 0; i < partition.ranges.length; i++) {
      const [start, end] = partition.ranges[i];
      const rangeWindows = windows.slice(start, end + 1);
      const windowIds = new Set(rangeWindows.map(w => w.contract.id));
      const rangeMembers = members.filter(m => windowIds.has(m.windowId));
      const partName = `range_${i}_[${start},${end}]`;

      partitionDetails.push({
        name: partName,
        windows: rangeWindows,
        members: rangeMembers,
        windowCount: rangeWindows.length,
      });

      contractPartitions[partName] = Array.from(windowIds);
    }

    const contract: PartitionedWindowSetContract = {
      partitionId,
      collectionId,
      partitions: contractPartitions,
      partitionScheme: "custom",
      createdAt,
    };

    return {
      contract,
      partitionDetails,
      createdAt,
    };
  }

  /**
   * partitionByPredicate
   * Partition windows by explicit member filter predicates.
   * 
   * @param windows - Source windows
   * @param members - Source members
   * @param partition - Predicate partition definition
   * @param partitionId - Unique partition identifier
   * @param collectionId - Source collection identifier
   * @param createdAt - Timestamp when partitioning was performed (Unix ms)
   * @returns Partitioned window set entity with named predicates
   */
  static partitionByPredicate(
    windows: TemporalWindowEntity[],
    members: WindowSetMemberEntity[],
    partition: PredicatePartition,
    partitionId: string,
    collectionId: string,
    createdAt: number
  ): PartitionedWindowSetEntity {
    // Validate inputs
    if (!Array.isArray(windows) || windows.length === 0) {
      throw new Error("PartitionOperator.partitionByPredicate: windows must be a non-empty array");
    }
    if (!Array.isArray(members) || members.length === 0) {
      throw new Error("PartitionOperator.partitionByPredicate: members must be a non-empty array");
    }
    if (!partition || !Array.isArray(partition.partitions)) {
      throw new Error("PartitionOperator.partitionByPredicate: partition.partitions must be an array");
    }
    if (partition.partitions.length === 0) {
      throw new Error("PartitionOperator.partitionByPredicate: partition.partitions must be non-empty");
    }
    if (!partitionId || typeof partitionId !== "string") {
      throw new Error("PartitionOperator.partitionByPredicate: partitionId must be a non-empty string");
    }
    if (!collectionId || typeof collectionId !== "string") {
      throw new Error("PartitionOperator.partitionByPredicate: collectionId must be a non-empty string");
    }
    if (typeof createdAt !== "number" || createdAt < 0) {
      throw new Error("PartitionOperator.partitionByPredicate: createdAt must be a non-negative number");
    }

    // Validate predicates and check for duplicate names
    const names = new Set<string>();
    for (let i = 0; i < partition.partitions.length; i++) {
      const [name, predicate] = partition.partitions[i];
      if (!name || typeof name !== "string") {
        throw new Error(`PartitionOperator.partitionByPredicate: partitions[${i}][0] must be a non-empty string`);
      }
      if (typeof predicate !== "function") {
        throw new Error(`PartitionOperator.partitionByPredicate: partitions[${i}][1] must be a function`);
      }
      if (names.has(name)) {
        throw new Error(`PartitionOperator.partitionByPredicate: duplicate partition name "${name}"`);
      }
      names.add(name);
    }

    // Create partitions by predicate
    const partitionDetails: Array<{
      name: string;
      windows: TemporalWindowEntity[];
      members: WindowSetMemberEntity[];
      windowCount: number;
    }> = [];

    const contractPartitions: Record<string, string[]> = {};

    for (let i = 0; i < partition.partitions.length; i++) {
      const [name, predicate] = partition.partitions[i];
      const filteredMembers = members.filter(predicate);
      const windowIds = new Set(filteredMembers.map(m => m.windowId));
      const filteredWindows = windows.filter(w => windowIds.has(w.contract.id));

      partitionDetails.push({
        name,
        windows: filteredWindows,
        members: filteredMembers,
        windowCount: filteredWindows.length,
      });

      contractPartitions[name] = Array.from(windowIds);
    }

    const contract: PartitionedWindowSetContract = {
      partitionId,
      collectionId,
      partitions: contractPartitions,
      partitionScheme: "custom",
      createdAt,
    };

    return {
      contract,
      partitionDetails,
      createdAt,
    };
  }

  /**
   * partitionByExplicit
   * Partition windows by explicit window ID groupings.
   * 
   * @param windows - Source windows
   * @param members - Source members
   * @param partition - Explicit partition definition
   * @param partitionId - Unique partition identifier
   * @param collectionId - Source collection identifier
   * @param createdAt - Timestamp when partitioning was performed (Unix ms)
   * @returns Partitioned window set entity with explicit groupings
   */
  static partitionByExplicit(
    windows: TemporalWindowEntity[],
    members: WindowSetMemberEntity[],
    partition: ExplicitPartition,
    partitionId: string,
    collectionId: string,
    createdAt: number
  ): PartitionedWindowSetEntity {
    // Validate inputs
    if (!Array.isArray(windows) || windows.length === 0) {
      throw new Error("PartitionOperator.partitionByExplicit: windows must be a non-empty array");
    }
    if (!Array.isArray(members) || members.length === 0) {
      throw new Error("PartitionOperator.partitionByExplicit: members must be a non-empty array");
    }
    if (!partition || typeof partition.partitions !== "object") {
      throw new Error("PartitionOperator.partitionByExplicit: partition.partitions must be an object");
    }
    const partitionKeys = Object.keys(partition.partitions);
    if (partitionKeys.length === 0) {
      throw new Error("PartitionOperator.partitionByExplicit: partition.partitions must be non-empty");
    }
    if (!partitionId || typeof partitionId !== "string") {
      throw new Error("PartitionOperator.partitionByExplicit: partitionId must be a non-empty string");
    }
    if (!collectionId || typeof collectionId !== "string") {
      throw new Error("PartitionOperator.partitionByExplicit: collectionId must be a non-empty string");
    }
    if (typeof createdAt !== "number" || createdAt < 0) {
      throw new Error("PartitionOperator.partitionByExplicit: createdAt must be a non-negative number");
    }

    // Build source window ID set
    const sourceWindowIds = new Set(windows.map(w => w.contract.id));

    // Validate all window IDs exist and check for duplicates across partitions
    const seenIds = new Set<string>();
    for (let i = 0; i < partitionKeys.length; i++) {
      const partName = partitionKeys[i];
      const partWindowIds = partition.partitions[partName];
      
      if (!Array.isArray(partWindowIds)) {
        throw new Error(
          `PartitionOperator.partitionByExplicit: partition.partitions["${partName}"] must be an array`
        );
      }

      for (let j = 0; j < partWindowIds.length; j++) {
        const windowId = partWindowIds[j];
        if (!windowId || typeof windowId !== "string") {
          throw new Error(
            `PartitionOperator.partitionByExplicit: partition.partitions["${partName}"][${j}] must be a non-empty string`
          );
        }
        if (!sourceWindowIds.has(windowId)) {
          throw new Error(
            `PartitionOperator.partitionByExplicit: window ID "${windowId}" not found in source windows`
          );
        }
        if (seenIds.has(windowId)) {
          throw new Error(
            `PartitionOperator.partitionByExplicit: window ID "${windowId}" appears in multiple partitions`
          );
        }
        seenIds.add(windowId);
      }
    }

    // Create partitions by explicit window IDs
    const partitionDetails: Array<{
      name: string;
      windows: TemporalWindowEntity[];
      members: WindowSetMemberEntity[];
      windowCount: number;
    }> = [];

    const contractPartitions: Record<string, string[]> = {};

    for (let i = 0; i < partitionKeys.length; i++) {
      const partName = partitionKeys[i];
      const partWindowIds = partition.partitions[partName];
      const windowIdSet = new Set(partWindowIds);
      
      const partWindows = windows.filter(w => windowIdSet.has(w.contract.id));
      const partMembers = members.filter(m => windowIdSet.has(m.windowId));

      partitionDetails.push({
        name: partName,
        windows: partWindows,
        members: partMembers,
        windowCount: partWindows.length,
      });

      contractPartitions[partName] = partWindowIds;
    }

    const contract: PartitionedWindowSetContract = {
      partitionId,
      collectionId,
      partitions: contractPartitions,
      partitionScheme: "custom",
      createdAt,
    };

    return {
      contract,
      partitionDetails,
      createdAt,
    };
  }
}
