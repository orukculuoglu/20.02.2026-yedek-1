/**
 * Execution Preparation Integration
 * Bridges temporal preparation results to execution contexts.
 * Responsible for:
 * - Adapting prepared structures to executor expectations
 * - Validating execution readiness
 * - Creating execution-ready wrappers without adding business logic
 * 
 * NOT RESPONSIBLE FOR:
 * - Business interpretation or semantic processing
 * - Execution orchestration (that's the executor's job)
 * - Assumption inference or default generation
 */

import type {
  TemporalPreparationResult,
  ComparisonReadyStructure,
} from "./index.ts";
import type { TemporalWindowEntity, WindowSetMemberEntity } from "../entities/index.ts";

/**
 * ExecutionPreparationContractBuilder
 * Creates execution-ready contracts from preparation results without interpretation.
 */
export class ExecutionPreparationContractBuilder {
  /**
   * buildExecutionContext
   * Create execution context wrapper that holds prepared structures.
   * No semantic processing, no runtime generation of IDs or timestamps.
   * All identifiers caller-provided.
   *
   * @param preparationResult - Temporal preparation result
   * @param executionSessionId - Executor-assigned session ID
   * @param executionPrepId - Explicit execution prep context ID (caller-provided)
   * @param executionPreparedAt - Explicit timestamp for execution preparation (caller-provided)
   * @returns Execution context with prepared structures
   */
  static buildExecutionContext(
    preparationResult: TemporalPreparationResult,
    executionSessionId: string,
    executionPrepId: string,
    executionPreparedAt: number
  ): ExecutionPreparationContract {
    return {
      id: executionPrepId,
      executionSessionId,
      preparationSessionId: preparationResult.preparationId,
      runtimeSessionId: preparationResult.runtimeSessionId,
      preparedAt: preparationResult.preparedAt,
      
      // Raw counts for executor awareness
      windowCount: preparationResult.inputWindowCount,
      memberCount: preparationResult.inputMemberCount,
      
      // Prepared structures
      assembledCollection: preparationResult.assembledCollection,
      partitionedSet: preparationResult.partitionedSet,
      comparisonStructures: preparationResult.comparisonStructures,
      
      // Metadata for execution context (caller-provided timestamp, not runtime-generated)
      metadata: {
        ...preparationResult.metadata,
        executionPreparedAt,
      },
    };
  }

  /**
   * extractWindowsFromResult
   * Extract all window entities from preparation result.
   * Useful for executors that need direct access to window data.
   *
   * @param preparationResult - Temporal preparation result
   * @returns Array of all windows in preparation
   */
  static extractWindowsFromResult(
    preparationResult: TemporalPreparationResult
  ): TemporalWindowEntity[] {
    const windows: TemporalWindowEntity[] = [];

    // Extract from assembled collection
    if (preparationResult.assembledCollection) {
      preparationResult.assembledCollection.windows.forEach(w => {
        if (!windows.some(existing => existing.contract.id === w.contract.id)) {
          windows.push(w);
        }
      });
    }

    // Extract from partitioned set
    if (preparationResult.partitionedSet) {
      preparationResult.partitionedSet.partitionDetails.forEach(partition => {
        partition.windows.forEach(w => {
          if (!windows.some(existing => existing.contract.id === w.contract.id)) {
            windows.push(w);
          }
        });
      });
    }

    // Extract from comparison structures
    preparationResult.comparisonStructures.forEach(comp => {
      if (!windows.some(existing => existing.contract.id === comp.leftWindow.contract.id)) {
        windows.push(comp.leftWindow);
      }
      if (!windows.some(existing => existing.contract.id === comp.rightWindow.contract.id)) {
        windows.push(comp.rightWindow);
      }
    });

    return windows;
  }

  /**
   * extractMembersFromResult
   * Extract all member entities from preparation result.
   * Useful for executors that need direct access to member data.
   *
   * @param preparationResult - Temporal preparation result
   * @returns Array of all members in preparation
   */
  static extractMembersFromResult(
    preparationResult: TemporalPreparationResult
  ): WindowSetMemberEntity[] {
    const members: WindowSetMemberEntity[] = [];

    // Extract from assembled collection
    if (preparationResult.assembledCollection) {
      preparationResult.assembledCollection.members.forEach(m => {
        if (!members.some(existing => existing.memberEntityId === m.memberEntityId)) {
          members.push(m);
        }
      });
    }

    // Extract from partitioned set
    if (preparationResult.partitionedSet) {
      preparationResult.partitionedSet.partitionDetails.forEach(partition => {
        partition.members.forEach(m => {
          if (!members.some(existing => existing.memberEntityId === m.memberEntityId)) {
            members.push(m);
          }
        });
      });
    }

    return members;
  }
}

/**
 * ExecutionPreparationValidator
 * Validates that preparation result is execution-ready.
 */
export class ExecutionPreparationValidator {
  /**
   * validate
   * Check that preparation result meets execution requirements.
   *
   * @param preparationResult - Temporal preparation result
   * @param requirements - Execution requirements
   * @returns Validation result
   */
  static validate(
    preparationResult: TemporalPreparationResult,
    requirements: ExecutionRequirements
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check if collection required
    if (requirements.requireCollection && !preparationResult.assembledCollection) {
      errors.push("ExecutionPreparationValidator: Collection required but not prepared");
    }

    // Check if partition required
    if (requirements.requirePartition && !preparationResult.partitionedSet) {
      errors.push("ExecutionPreparationValidator: Partition required but not prepared");
    }

    // Check minimum window count
    if (
      requirements.minimumWindowCount !== undefined &&
      preparationResult.inputWindowCount < requirements.minimumWindowCount
    ) {
      errors.push(
        `ExecutionPreparationValidator: Minimum window count ${requirements.minimumWindowCount} not met (got ${preparationResult.inputWindowCount})`
      );
    }

    // Check minimum member count
    if (
      requirements.minimumMemberCount !== undefined &&
      preparationResult.inputMemberCount < requirements.minimumMemberCount
    ) {
      errors.push(
        `ExecutionPreparationValidator: Minimum member count ${requirements.minimumMemberCount} not met (got ${preparationResult.inputMemberCount})`
      );
    }

    // Validate comparison structures if required
    if (requirements.requireComparisons && preparationResult.comparisonStructures.length === 0) {
      errors.push("ExecutionPreparationValidator: Comparisons required but not prepared");
    }

    // Validate structural integrity of prepared objects
    if (preparationResult.assembledCollection) {
      if (preparationResult.assembledCollection.windows.length === 0) {
        errors.push(
          "ExecutionPreparationValidator: Assembled collection has no windows"
        );
      }
      if (preparationResult.assembledCollection.members.length === 0) {
        errors.push(
          "ExecutionPreparationValidator: Assembled collection has no members"
        );
      }
    }

    if (preparationResult.partitionedSet) {
      if (preparationResult.partitionedSet.partitionDetails.length === 0) {
        errors.push("ExecutionPreparationValidator: Partitioned set has no partitions");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

/**
 * ExecutionRequirements
 * Specifies what an executor needs from a preparation result.
 */
export interface ExecutionRequirements {
  /**
   * Whether executor requires a collection
   */
  requireCollection?: boolean;

  /**
   * Whether executor requires a partition
   */
  requirePartition?: boolean;

  /**
   * Whether executor requires comparison structures
   */
  requireComparisons?: boolean;

  /**
   * Minimum number of windows executor expects
   */
  minimumWindowCount?: number;

  /**
   * Minimum number of members executor expects
   */
  minimumMemberCount?: number;
}

/**
 * ExecutionPreparationContract
 * Wrapper holding prepared structures ready for execution.
 */
export interface ExecutionPreparationContract {
  /**
   * Unique ID for this execution preparation instance
   */
  id: string;

  /**
   * Executor-assigned session ID
   */
  executionSessionId: string;

  /**
   * Preparation session ID
   */
  preparationSessionId: string;

  /**
   * Runtime session ID
   */
  runtimeSessionId: string;

  /**
   * When preparation was created
   */
  preparedAt: number;

  /**
   * Number of windows in preparation
   */
  windowCount: number;

  /**
   * Number of members in preparation
   */
  memberCount: number;

  /**
   * Assembled collection (if prepared)
   */
  assembledCollection: TemporalPreparationResult["assembledCollection"];

  /**
   * Partitioned set (if prepared)
   */
  partitionedSet: TemporalPreparationResult["partitionedSet"];

  /**
   * Comparison structures (if prepared)
   */
  comparisonStructures: ComparisonReadyStructure[];

  /**
   * Metadata for execution context
   */
  metadata: Record<string, unknown>;
}
