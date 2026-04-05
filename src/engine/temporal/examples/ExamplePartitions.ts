/**
 * Example Partitions
 * Concrete examples of window collection partitioning.
 * Demonstrates three partitioning strategies: indices, predicates, and explicit IDs.
 */

import type {
  PartitionedWindowSetEntity,
} from "../operators/PartitionOperator.ts";
import { PartitionOperator } from "../operators/PartitionOperator.ts";
import { ExampleEntities } from "./ExampleEntities.ts";
import { ExampleMembers, ExampleCollections } from "./ExampleCollections.ts";

/**
 * Example partition outputs using all three partitioning strategies
 */
export class ExamplePartitions {
  /**
   * Index-based partitioning
   * Partition the three windows into explicit ranges:
   * - Part 1: indices [0,0] = primary window only
   * - Part 2: indices [1,2] = secondary and tertiary windows
   *
   * @returns Partitioned window set with index-based grouping
   */
  static getIndexBasedPartition(): PartitionedWindowSetEntity {
    const windows = ExampleEntities.getAllEntities();
    const members = ExampleMembers.getAllMembers();

    return PartitionOperator.partitionByIndices(
      windows,
      members,
      {
        strategy: "indices",
        ranges: [
          [0, 0],  // Primary window only
          [1, 2],  // Secondary and tertiary windows
        ],
      },
      "partition-indices-001",
      "coll-full-001",
      1744079400000
    );
  }

  /**
   * Predicate-based partitioning
   * Partition members by explicit family classification predicates:
   * - "observation_members": members with family === "OBSERVATION"
   * - "required_members": members with isRequired === true
   * - "optional_members": members with canBeSkipped === true
   *
   * @returns Partitioned window set with predicate-based grouping
   */
  static getPredicateBasedPartition(): PartitionedWindowSetEntity {
    const windows = ExampleEntities.getAllEntities();
    const members = ExampleMembers.getAllMembers();

    return PartitionOperator.partitionByPredicate(
      windows,
      members,
      {
        strategy: "predicate",
        partitions: [
          [
            "observation_members",
            (m) => m.family === "OBSERVATION",
          ],
          [
            "required_members",
            (m) => m.isRequired,
          ],
          [
            "optional_members",
            (m) => m.canBeSkipped,
          ],
        ],
      },
      "partition-predicates-001",
      "coll-full-001",
      1744079400000
    );
  }

  /**
   * Explicit ID-based partitioning
   * Partition windows into explicit named groups:
   * - "primary_reference": primary reference window only
   * - "comparison_control": secondary comparison and tertiary baseline windows
   *
   * @returns Partitioned window set with explicit grouping
   */
  static getExplicitIdPartition(): PartitionedWindowSetEntity {
    const windows = ExampleEntities.getAllEntities();
    const members = ExampleMembers.getAllMembers();

    return PartitionOperator.partitionByExplicit(
      windows,
      members,
      {
        strategy: "explicit",
        partitions: {
          primary_reference: ["win-ref-001"],
          comparison_control: ["win-comp-001", "win-baseline-001"],
        },
      },
      "partition-explicit-001",
      "coll-full-001",
      1744079400000
    );
  }

  /**
   * Verification: Cross-strategy consistency
   * Ensures that different partitioning strategies can be applied consistently
   * without conflicts or structural violations.
   *
   * @returns Object with verification results
   */
  static verifyPartitioningConsistency(): {
    indicesPartition: PartitionedWindowSetEntity;
    predicatePartition: PartitionedWindowSetEntity;
    explicitPartition: PartitionedWindowSetEntity;
    allValid: boolean;
    partitionCounts: Record<string, { indices: number; predicate: number; explicit: number }>;
  } {
    const indices = this.getIndexBasedPartition();
    const predicate = this.getPredicateBasedPartition();
    const explicit = this.getExplicitIdPartition();

    const allValid =
      indices.partitionDetails.every(p => p.windowCount > 0) &&
      predicate.partitionDetails.every(p => p.windowCount > 0) &&
      explicit.partitionDetails.every(p => p.windowCount > 0);

    const partitionCounts: Record<string, { indices: number; predicate: number; explicit: number }> = {};

    // Count partitions by strategy
    for (const partition of indices.partitionDetails) {
      partitionCounts[partition.name] = {
        indices: partition.windowCount,
        predicate: 0,
        explicit: 0,
      };
    }

    for (const partition of predicate.partitionDetails) {
      if (!partitionCounts[partition.name]) {
        partitionCounts[partition.name] = { indices: 0, predicate: 0, explicit: 0 };
      }
      partitionCounts[partition.name].predicate = partition.windowCount;
    }

    for (const partition of explicit.partitionDetails) {
      if (!partitionCounts[partition.name]) {
        partitionCounts[partition.name] = { indices: 0, predicate: 0, explicit: 0 };
      }
      partitionCounts[partition.name].explicit = partition.windowCount;
    }

    return {
      indicesPartition: indices,
      predicatePartition: predicate,
      explicitPartition: explicit,
      allValid,
      partitionCounts,
    };
  }

  /**
   * Get partition coverage analysis
   * Analyzes which windows and members are included in each partition
   *
   * @param partition - Partition to analyze
   * @returns Coverage analysis object
   */
  static getPartitionCoverage(partition: PartitionedWindowSetEntity): {
    totalPartitions: number;
    totalWindows: number;
    totalMembers: number;
    windowsPerPartition: Record<string, number>;
    membersPerPartition: Record<string, number>;
  } {
    const analysis = {
      totalPartitions: partition.partitionDetails.length,
      totalWindows: 0,
      totalMembers: 0,
      windowsPerPartition: {} as Record<string, number>,
      membersPerPartition: {} as Record<string, number>,
    };

    for (const detail of partition.partitionDetails) {
      analysis.totalWindows += detail.windows.length;
      analysis.totalMembers += detail.members.length;
      analysis.windowsPerPartition[detail.name] = detail.windows.length;
      analysis.membersPerPartition[detail.name] = detail.members.length;
    }

    return analysis;
  }

  /**
   * Verify partition integrity
   * Ensures partition structure is valid and consistent
   *
   * @param partition - Partition to verify
   * @returns Verification result
   */
  static verifyPartitionIntegrity(partition: PartitionedWindowSetEntity): {
    isValid: boolean;
    partitionCount: number;
    errorMessages: string[];
  } {
    const errors: string[] = [];

    // Check partition details exist
    if (!partition.partitionDetails || partition.partitionDetails.length === 0) {
      errors.push("partition.partitionDetails is empty");
    }

    // Check contract structure
    if (!partition.contract) {
      errors.push("partition.contract is missing");
    } else if (!partition.contract.partitions) {
      errors.push("partition.contract.partitions is missing");
    }

    // Check partition consistency
    for (const detail of partition.partitionDetails) {
      if (!detail.name) {
        errors.push("partition detail has no name");
      }
      if (!Array.isArray(detail.windows)) {
        errors.push(`partition "${detail.name}" has invalid windows array`);
      }
      if (!Array.isArray(detail.members)) {
        errors.push(`partition "${detail.name}" has invalid members array`);
      }
      if (detail.windowCount !== detail.windows.length) {
        errors.push(`partition "${detail.name}" windowCount mismatch`);
      }
    }

    return {
      isValid: errors.length === 0,
      partitionCount: partition.partitionDetails.length,
      errorMessages: errors,
    };
  }
}
