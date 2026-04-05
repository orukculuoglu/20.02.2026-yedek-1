/**
 * Temporal Preparation Result
 * Explicit output contract of runtime preparation stage.
 * All fields represent completed structural assembly only.
 * No business logic, no interpretation, no scoring.
 */

import type {
  TemporalWindowEntity,
  WindowSetMemberEntity,
} from "../entities/index.ts";
import type { AssembledWindowCollection } from "../operators/WindowCollectionOperator.ts";
import type { PartitionedWindowSetEntity } from "../operators/PartitionOperator.ts";

/**
 * ComparisonReadyStructure
 * Explicitly prepared window pair ready for structural comparison operations.
 * Contains only structural information, no semantics.
 */
export interface ComparisonReadyStructure {
  id: string;
  leftWindowId: string;
  rightWindowId: string;
  leftWindow: TemporalWindowEntity;
  rightWindow: TemporalWindowEntity;
  comparisonIntent: "direct" | "anchored" | "offset" | "concurrent";
  structuralOverlap: {
    overlapStartTimestamp: number;
    overlapEndTimestamp: number;
    overlapDays: number;
  } | null;
  preparedAt: number;
}

/**
 * TemporalPreparationResult
 * Complete output of preparation stage.
 * Contains all prepared structural elements without business logic.
 */
export interface TemporalPreparationResult {
  // Execution context
  preparationId: string;
  runtimeSessionId: string;
  preparedAt: number;

  // Structural inputs (for reference/traceability)
  inputWindowCount: number;
  inputMemberCount: number;

  // Prepared structural outputs
  assembledCollection: AssembledWindowCollection | null;
  partitionedSet: PartitionedWindowSetEntity | null;
  comparisonStructures: ComparisonReadyStructure[];

  // Structural validation results
  isValid: boolean;
  validationErrors: string[];

  // Metadata tracking
  metadata: Record<string, unknown>;
}

/**
 * TemporalPreparationResultBuilder
 * Deterministic construction of preparation results.
 * Assembles structural outputs without interpretation.
 */
export class TemporalPreparationResultBuilder {
  /**
   * build
   * Construct a preparation result from explicit structural components.
   *
   * @param preparationId - Unique preparation identifier
   * @param runtimeSessionId - Associated runtime session identifier
   * @param preparedAt - Timestamp of preparation (Unix ms)
   * @param inputWindowCount - Count of input windows
   * @param inputMemberCount - Count of input members
   * @param assembledCollection - Prepared window collection (optional)
   * @param partitionedSet - Prepared partitioned set (optional)
   * @param comparisonStructures - Prepared comparison pairs
   * @param metadata - Caller-provided context
   * @returns Complete preparation result
   */
  static build(
    preparationId: string,
    runtimeSessionId: string,
    preparedAt: number,
    inputWindowCount: number,
    inputMemberCount: number,
    assembledCollection: AssembledWindowCollection | null,
    partitionedSet: PartitionedWindowSetEntity | null,
    comparisonStructures: ComparisonReadyStructure[],
    metadata: Record<string, unknown>
  ): TemporalPreparationResult {
    // Validate required fields
    if (!preparationId || typeof preparationId !== "string") {
      throw new Error("TemporalPreparationResultBuilder.build: preparationId must be a non-empty string");
    }
    if (!runtimeSessionId || typeof runtimeSessionId !== "string") {
      throw new Error("TemporalPreparationResultBuilder.build: runtimeSessionId must be a non-empty string");
    }
    if (typeof preparedAt !== "number" || preparedAt < 0) {
      throw new Error("TemporalPreparationResultBuilder.build: preparedAt must be a non-negative number");
    }
    if (typeof inputWindowCount !== "number" || inputWindowCount < 0) {
      throw new Error("TemporalPreparationResultBuilder.build: inputWindowCount must be a non-negative number");
    }
    if (typeof inputMemberCount !== "number" || inputMemberCount < 0) {
      throw new Error("TemporalPreparationResultBuilder.build: inputMemberCount must be a non-negative number");
    }
    if (!Array.isArray(comparisonStructures)) {
      throw new Error("TemporalPreparationResultBuilder.build: comparisonStructures must be an array");
    }

    // Validate structural outputs
    const validationErrors: string[] = [];

    // Collection validation
    if (assembledCollection) {
      if (!assembledCollection.collectionId) {
        validationErrors.push("assembledCollection.collectionId is missing");
      }
      if (!Array.isArray(assembledCollection.windows)) {
        validationErrors.push("assembledCollection.windows must be an array");
      }
      if (!Array.isArray(assembledCollection.members)) {
        validationErrors.push("assembledCollection.members must be an array");
      }
    }

    // Partitioned set validation
    if (partitionedSet) {
      if (!partitionedSet.contract) {
        validationErrors.push("partitionedSet.contract is missing");
      }
      if (!Array.isArray(partitionedSet.partitionDetails)) {
        validationErrors.push("partitionedSet.partitionDetails must be an array");
      }
    }

    // Comparison structures validation
    for (let i = 0; i < comparisonStructures.length; i++) {
      const comp = comparisonStructures[i];
      if (!comp.id || !comp.leftWindowId || !comp.rightWindowId) {
        validationErrors.push(`comparisonStructures[${i}] is missing required fields`);
      }
      if (!comp.leftWindow || !comp.rightWindow) {
        validationErrors.push(`comparisonStructures[${i}] is missing window entities`);
      }
    }

    const isValid = validationErrors.length === 0;

    return {
      preparationId,
      runtimeSessionId,
      preparedAt,
      inputWindowCount,
      inputMemberCount,
      assembledCollection,
      partitionedSet,
      comparisonStructures,
      isValid,
      validationErrors,
      metadata,
    };
  }

  /**
   * getCollectionMetrics
   * Extract structural metrics from an assembled collection result.
   * No interpretation, only structural counts.
   *
   * @param result - Preparation result with collection
   * @returns Metrics object with counts and boundaries
   */
  static getCollectionMetrics(result: TemporalPreparationResult): {
    windowCount: number;
    memberCount: number;
    avgMembersPerWindow: number;
    earliestStartTimestamp: number;
    latestEndTimestamp: number;
  } | null {
    if (!result.assembledCollection) {
      return null;
    }

    const collection = result.assembledCollection;
    const windowCount = collection.windows.length;
    const memberCount = collection.members.length;
    const avgMembersPerWindow = windowCount > 0 ? memberCount / windowCount : 0;

    let earliestStartTimestamp = Infinity;
    let latestEndTimestamp = 0;

    for (const window of collection.windows) {
      earliestStartTimestamp = Math.min(
        earliestStartTimestamp,
        window.contract.boundary.startTimestamp
      );
      latestEndTimestamp = Math.max(
        latestEndTimestamp,
        window.contract.boundary.endTimestamp
      );
    }

    return {
      windowCount,
      memberCount,
      avgMembersPerWindow,
      earliestStartTimestamp,
      latestEndTimestamp,
    };
  }

  /**
   * getPartitionMetrics
   * Extract structural metrics from a partitioned set result.
   * No interpretation, only structural counts.
   *
   * @param result - Preparation result with partitioned set
   * @returns Metrics object with partition information
   */
  static getPartitionMetrics(result: TemporalPreparationResult): {
    partitionCount: number;
    totalWindowsAcrossPartitions: number;
    totalMembersAcrossPartitions: number;
    partitionDetails: Record<
      string,
      {
        windowCount: number;
        memberCount: number;
      }
    >;
  } | null {
    if (!result.partitionedSet) {
      return null;
    }

    const partitionedSet = result.partitionedSet;
    const partitionCount = partitionedSet.partitionDetails.length;
    let totalWindowsAcrossPartitions = 0;
    let totalMembersAcrossPartitions = 0;
    const partitionDetails: Record<string, { windowCount: number; memberCount: number }> = {};

    for (const detail of partitionedSet.partitionDetails) {
      const windowCount = detail.windows.length;
      const memberCount = detail.members.length;
      totalWindowsAcrossPartitions += windowCount;
      totalMembersAcrossPartitions += memberCount;
      partitionDetails[detail.name] = {
        windowCount,
        memberCount,
      };
    }

    return {
      partitionCount,
      totalWindowsAcrossPartitions,
      totalMembersAcrossPartitions,
      partitionDetails,
    };
  }
}
