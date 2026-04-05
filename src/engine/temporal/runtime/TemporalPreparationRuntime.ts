/**
 * Temporal Preparation Runtime
 * Deterministic structural orchestration of temporal foundation components.
 * Wires contracts, entities, builders, and operators for execution preparation.
 * 
 * Responsibility:
 * - Accept explicit temporal foundation inputs
 * - Orchestrate collection assembly per caller specifications
 * - Orchestrate partitioning per caller specifications
 * - Prepare comparison-ready window pairs
 * - Return deterministic results
 * 
 * NOT RESPONSIBLE FOR:
 * - Business logic, interpretation, semantic meaning
 * - Scoring, anomaly detection, pressure/liquidity semantics
 * - Async operations, side effects, persistence
 * - Hidden branching based on domain assumptions
 * - Default value generation, inference
 */

import type {
  TemporalWindowEntity,
  WindowSetMemberEntity,
} from "../entities/index.ts";
import { WindowCollectionOperator } from "../operators/WindowCollectionOperator.ts";
import { PartitionOperator } from "../operators/PartitionOperator.ts";
import type {
  TemporalPreparationContext,
  ComparisonReadyWindowPair,
  CollectionAssemblyIntent,
  PartitioningIntent,
} from "./TemporalPreparationContext.ts";
import { TemporalPreparationContextValidator } from "./TemporalPreparationContext.ts";
import type {
  TemporalPreparationResult,
  ComparisonReadyStructure,
} from "./TemporalPreparationResult.ts";
import { TemporalPreparationResultBuilder } from "./TemporalPreparationResult.ts";

/**
 * TemporalPreparationRuntime
 * Orchestrates preparation of temporal foundation components for execution.
 * All methods deterministic, all inputs explicit, no inference.
 */
export class TemporalPreparationRuntime {
  /**
   * prepare
   * Main entry point: orchestrate complete preparation workflow.
   *
   * @param context - Explicit preparation context with all inputs
   * @returns Preparation result with assembled structures
   */
  static prepare(context: TemporalPreparationContext): TemporalPreparationResult {
    // Validate context structure
    const contextValidation = TemporalPreparationContextValidator.validate(context);
    if (!contextValidation.isValid) {
      throw new Error(
        `TemporalPreparationRuntime.prepare: Invalid context\n${contextValidation.errors.join(
          "\n"
        )}`
      );
    }

    // Orchestrate collection assembly per intent
    const assembledCollection = this.prepareCollection(
      context.windowEntities,
      context.windowMembers,
      context.collectionAssemblyIntent
    );

    // Orchestrate partitioning if intent provided
    let partitionedSet = null;
    if (context.partitioningIntent) {
      partitionedSet = this.preparePartition(
        context.windowEntities,
        context.windowMembers,
        context.partitioningIntent
      );
    }

    // Orchestrate comparison pairs if provided
    const comparisonStructures = this.prepareComparisonsIfIntended(
      context.windowEntities,
      context.comparisonPairs || []
    );

    // Build result
    const result = TemporalPreparationResultBuilder.build(
      context.preparationId,
      context.runtimeSessionId,
      context.preparedAt,
      context.windowEntities.length,
      context.windowMembers.length,
      assembledCollection,
      partitionedSet,
      comparisonStructures,
      context.metadata
    );

    return result;
  }

  /**
   * prepareCollection
   * Deterministically orchestrate collection assembly per caller intent.
   * No inference, all decisions explicit.
   *
   * @param windows - Source windows
   * @param members - Source members
   * @param intent - Explicit assembly intent from caller
   * @returns Assembled collection or null
   */
  private static prepareCollection(
    windows: TemporalWindowEntity[],
    members: WindowSetMemberEntity[],
    intent: CollectionAssemblyIntent
  ): ReturnType<typeof WindowCollectionOperator.assembleCollection> | null {
    // Determine windows to assemble based on intent
    let targetWindows: TemporalWindowEntity[] = [];

    if (intent.intent === "full_ordered") {
      // Full collection with explicit ordering
      targetWindows = windows;

      // Apply ordering if specified
      if (intent.orderingStrategy === "chronological") {
        targetWindows = WindowCollectionOperator.orderWindows(targetWindows, {
          sortBy: "timestamp",
          timestampField: "start",
          direction: "asc",
        });
      } else if (intent.orderingStrategy === "createdTime") {
        // Sort by entityCreatedAt (ascending)
        targetWindows = targetWindows.sort(
          (a, b) => a.entityCreatedAt - b.entityCreatedAt
        );
      }
      // If no ordering strategy specified, use as-is
    } else if (intent.intent === "required_only") {
      // Filter windows with required members only
      const requiredMemberWindowIds = new Set(
        members.filter(m => m.isRequired).map(m => m.windowId)
      );
      targetWindows = windows.filter(w => requiredMemberWindowIds.has(w.contract.id));
    } else if (intent.intent === "explicit_subset") {
      // Filter to explicit window IDs
      if (!intent.explicitWindowIds) {
        throw new Error(
          "TemporalPreparationRuntime.prepareCollection: explicit_subset intent requires explicitWindowIds"
        );
      }
      const windowIdSet = new Set(intent.explicitWindowIds);
      targetWindows = windows.filter(w => windowIdSet.has(w.contract.id));
    } else if (intent.intent === "custom") {
      // Apply custom filter function
      if (!intent.windowFilter) {
        throw new Error(
          "TemporalPreparationRuntime.prepareCollection: custom intent requires windowFilter"
        );
      }
      targetWindows = windows.filter(intent.windowFilter);
    }

    // Filter members to target windows
    const targetWindowIds = new Set(targetWindows.map(w => w.contract.id));
    const targetMembers = members.filter(m => targetWindowIds.has(m.windowId));

    // Validate we have windows and members
    if (targetWindows.length === 0 || targetMembers.length === 0) {
      return null;  // No collection prepared
    }

    // Assemble collection using caller-provided ID and timestamp
    const collection = WindowCollectionOperator.assembleCollection(
      intent.collectionId,
      targetWindows,
      targetMembers,
      intent.collectionAssembledAt
    );

    // Validate structure
    try {
      WindowCollectionOperator.validateCollectionStructure(collection);
    } catch (error) {
      throw new Error(`TemporalPreparationRuntime.prepareCollection: ${String(error)}`);
    }

    return collection;
  }

  /**
   * preparePartition
   * Deterministically orchestrate partitioning per caller intent.
   * No inference, all partition rules explicit.
   *
   * @param windows - Source windows
   * @param members - Source members
   * @param intent - Explicit partitioning intent from caller
   * @returns Partitioned window set
   */
  private static preparePartition(
    windows: TemporalWindowEntity[],
    members: WindowSetMemberEntity[],
    intent: PartitioningIntent
  ): ReturnType<typeof PartitionOperator.partitionByIndices> {
    // Use caller-provided IDs and timestamps (no runtime generation)
    const partitionId = intent.partitionId;
    const collectionId = intent.collectionId;
    const createdAt = intent.createdAt;

    if (intent.strategy === "indices") {
      if (!intent.indexRanges) {
        throw new Error(
          "TemporalPreparationRuntime.preparePartition: indices strategy requires indexRanges"
        );
      }
      return PartitionOperator.partitionByIndices(
        windows,
        members,
        {
          strategy: "indices",
          ranges: intent.indexRanges,
        },
        partitionId,
        collectionId,
        createdAt
      );
    } else if (intent.strategy === "predicate") {
      if (!intent.memberPredicates) {
        throw new Error(
          "TemporalPreparationRuntime.preparePartition: predicate strategy requires memberPredicates"
        );
      }
      return PartitionOperator.partitionByPredicate(
        windows,
        members,
        {
          strategy: "predicate",
          partitions: intent.memberPredicates,
        },
        partitionId,
        collectionId,
        createdAt
      );
    } else if (intent.strategy === "explicit") {
      if (!intent.windowIdGroups) {
        throw new Error(
          "TemporalPreparationRuntime.preparePartition: explicit strategy requires windowIdGroups"
        );
      }
      return PartitionOperator.partitionByExplicit(
        windows,
        members,
        {
          strategy: "explicit",
          partitions: intent.windowIdGroups,
        },
        partitionId,
        collectionId,
        createdAt
      );
    } else {
      throw new Error(
        `TemporalPreparationRuntime.preparePartition: unknown strategy "${intent.strategy}"`
      );
    }
  }

  /**
   * prepareComparisonsIfIntended
   * Deterministically prepare comparison-ready window pairs.
   * Only structural assembly, no comparison semantics.
   * Uses caller-provided IDs and timestamps (no runtime generation).
   *
   * @param windows - Source windows
   * @param comparisonPairs - Explicit comparison pair intents (caller provides all IDs/timestamps)
   * @returns Array of comparison-ready structures
   */
  private static prepareComparisonsIfIntended(
    windows: TemporalWindowEntity[],
    comparisonPairs: ComparisonReadyWindowPair[]
  ): ComparisonReadyStructure[] {
    if (comparisonPairs.length === 0) {
      return [];
    }

    const windowMap = new Map(windows.map(w => [w.contract.id, w]));
    const results: ComparisonReadyStructure[] = [];

    for (let i = 0; i < comparisonPairs.length; i++) {
      const pair = comparisonPairs[i];

      // Validate window IDs exist
      const leftWindow = windowMap.get(pair.leftWindowId);
      const rightWindow = windowMap.get(pair.rightWindowId);

      if (!leftWindow) {
        throw new Error(
          `TemporalPreparationRuntime.prepareComparisonsIfIntended: comparisonPairs[${i}] left window ID "${pair.leftWindowId}" not found`
        );
      }
      if (!rightWindow) {
        throw new Error(
          `TemporalPreparationRuntime.prepareComparisonsIfIntended: comparisonPairs[${i}] right window ID "${pair.rightWindowId}" not found`
        );
      }

      // Calculate structural overlap (no interpretation, just boundaries)
      const overlapStart = Math.max(
        leftWindow.contract.boundary.startTimestamp,
        rightWindow.contract.boundary.startTimestamp
      );
      const overlapEnd = Math.min(
        leftWindow.contract.boundary.endTimestamp,
        rightWindow.contract.boundary.endTimestamp
      );

      const structuralOverlap =
        overlapStart < overlapEnd
          ? {
              overlapStartTimestamp: overlapStart,
              overlapEndTimestamp: overlapEnd,
              overlapDays: Math.round((overlapEnd - overlapStart) / (24 * 60 * 60 * 1000)),
            }
          : null;

      // Use caller-provided ID and timestamp (no runtime generation)
      const comparisonStructure: ComparisonReadyStructure = {
        id: pair.comparisonStructureId,
        leftWindowId: pair.leftWindowId,
        rightWindowId: pair.rightWindowId,
        leftWindow,
        rightWindow,
        comparisonIntent: pair.comparisonIntent,
        structuralOverlap,
        preparedAt: pair.preparedAt,
      };

      results.push(comparisonStructure);
    }

    return results;
  }
}
