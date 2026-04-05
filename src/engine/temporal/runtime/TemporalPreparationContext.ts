/**
 * Temporal Preparation Context
 * Explicit input specification for runtime preparation stage.
 * All inputs caller-provided. No inference, no defaults.
 */

import type {
  TemporalWindowEntity,
  WindowSetMemberEntity,
} from "../entities/index.ts";
import type { PartitionedWindowSetEntity } from "../operators/PartitionOperator.ts";
import type { AssembledWindowCollection } from "../operators/WindowCollectionOperator.ts";

/**
 * ComparisonReadyWindowPair
 * Explicit specification of two windows prepared for comparison.
 * No calculation, no inference of comparison semantics.
 * All IDs and timestamps caller-provided, not generated.
 */
export interface ComparisonReadyWindowPair {
  leftWindowId: string;
  rightWindowId: string;
  comparisonIntent: "direct" | "anchored" | "offset" | "concurrent";
  
  // Explicit IDs/timestamps (caller-provided, no runtime generation)
  comparisonStructureId: string;
  preparedAt: number;              // Unix milliseconds (caller-provided)
  
  metadata: Record<string, unknown>;  // Caller-provided context only
}

/**
 * CollectionAssemblyIntent
 * Explicit specification of how windows should be assembled into collections.
 * Caller specifies exact ordering, membership, and structural constraints.
 * All IDs and timestamps caller-provided, not generated.
 */
export interface CollectionAssemblyIntent {
  intent: "full_ordered" | "required_only" | "explicit_subset" | "custom";
  orderingStrategy?: "chronological" | "createdTime" | "explicit";
  windowFilter?: (window: TemporalWindowEntity) => boolean;
  explicitWindowIds?: string[];
  
  // Explicit IDs/timestamps (caller-provided, no runtime generation)
  // Required even if collection may not be assembled (windows may not match intent)
  collectionId: string;
  collectionAssembledAt: number;   // Unix milliseconds (caller-provided)
  
  metadata: Record<string, unknown>;
}

/**
 * PartitioningIntent
 * Explicit specification of partitioning strategy and rules.
 * Caller must provide complete partitioning rules (indices, predicates, or explicit IDs).
 * All IDs and timestamps caller-provided, not generated.
 */
export interface PartitioningIntent {
  strategy: "indices" | "predicate" | "explicit";
  // For indices strategy:
  indexRanges?: Array<[number, number]>;
  // For predicate strategy:
  memberPredicates?: Array<[string, (m: WindowSetMemberEntity) => boolean]>;
  // For explicit strategy:
  windowIdGroups?: Record<string, string[]>;
  
  // Explicit IDs/timestamps (caller-provided, no runtime generation)
  // Required even if partitioning may not complete (windows may not match intent)
  partitionId: string;
  collectionId: string;            // Reference ID for this partition's collection context
  createdAt: number;               // Unix milliseconds (caller-provided)
  
  metadata: Record<string, unknown>;
}

/**
 * TemporalPreparationContext
 * Complete input specification for runtime preparation stage.
 * All fields explicitly provided by caller.
 * No inference, no hidden metadata generation.
 */
export interface TemporalPreparationContext {
  // Explicit inputs (all required, caller-provided)
  windowEntities: TemporalWindowEntity[];
  windowMembers: WindowSetMemberEntity[];

  // Explicit structural intents (caller-specified)
  collectionAssemblyIntent: CollectionAssemblyIntent;
  partitioningIntent?: PartitioningIntent;
  comparisonPairs?: ComparisonReadyWindowPair[];

  // Explicit identifiers
  preparationId: string;
  runtimeSessionId: string;
  preparedAt: number;             // Unix milliseconds (caller-provided, not auto-filled)

  // Explicit metadata (caller-provided context only)
  metadata: Record<string, unknown>;
}

/**
 * TemporalPreparationContextValidator
 * Structural validation of preparation context.
 * Validates only declared structure, not domain semantics.
 */
export class TemporalPreparationContextValidator {
  /**
   * validate
   * Check structural completeness and type correctness of context.
   * Does NOT validate business logic or domain semantics.
   *
   * @param context - Context to validate
   * @returns Object with isValid flag and error messages
   */
  static validate(context: TemporalPreparationContext): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validate window entities
    if (!Array.isArray(context.windowEntities)) {
      errors.push("context.windowEntities must be an array");
    } else if (context.windowEntities.length === 0) {
      errors.push("context.windowEntities must be non-empty");
    } else {
      for (let i = 0; i < context.windowEntities.length; i++) {
        const window = context.windowEntities[i];
        if (!window || !window.contract || !window.contract.id) {
          errors.push(`context.windowEntities[${i}] is invalid or missing contract.id`);
        }
      }
    }

    // Validate window members
    if (!Array.isArray(context.windowMembers)) {
      errors.push("context.windowMembers must be an array");
    } else if (context.windowMembers.length === 0) {
      errors.push("context.windowMembers must be non-empty");
    } else {
      for (let i = 0; i < context.windowMembers.length; i++) {
        const member = context.windowMembers[i];
        if (!member || !member.memberEntityId || !member.windowId) {
          errors.push(`context.windowMembers[${i}] is invalid or missing required fields`);
        }
      }
    }

    // Validate collection assembly intent
    if (!context.collectionAssemblyIntent) {
      errors.push("context.collectionAssemblyIntent is required");
    } else {
      const validIntents = ["full_ordered", "required_only", "explicit_subset", "custom"];
      if (!validIntents.includes(context.collectionAssemblyIntent.intent)) {
        errors.push(
          `context.collectionAssemblyIntent.intent must be one of: ${validIntents.join(", ")}`
        );
      }

      // Validate explicit IDs/timestamps are provided
      if (!context.collectionAssemblyIntent.collectionId || typeof context.collectionAssemblyIntent.collectionId !== "string") {
        errors.push("context.collectionAssemblyIntent.collectionId must be a non-empty string");
      }
      if (typeof context.collectionAssemblyIntent.collectionAssembledAt !== "number" || context.collectionAssemblyIntent.collectionAssembledAt < 0) {
        errors.push(
          "context.collectionAssemblyIntent.collectionAssembledAt must be a non-negative number (Unix milliseconds)"
        );
      }

      // If explicit_subset intent, require explicitWindowIds
      if (
        context.collectionAssemblyIntent.intent === "explicit_subset" &&
        !Array.isArray(context.collectionAssemblyIntent.explicitWindowIds)
      ) {
        errors.push(
          "explicit_subset intent requires collectionAssemblyIntent.explicitWindowIds array"
        );
      }

      // If custom intent, require windowFilter
      if (
        context.collectionAssemblyIntent.intent === "custom" &&
        typeof context.collectionAssemblyIntent.windowFilter !== "function"
      ) {
        errors.push("custom intent requires collectionAssemblyIntent.windowFilter function");
      }
    }

    // Validate partitioning intent if provided
    if (context.partitioningIntent) {
      const validStrategies = ["indices", "predicate", "explicit"];
      if (!validStrategies.includes(context.partitioningIntent.strategy)) {
        errors.push(
          `context.partitioningIntent.strategy must be one of: ${validStrategies.join(", ")}`
        );
      }

      // Validate explicit IDs/timestamps are provided
      if (!context.partitioningIntent.partitionId || typeof context.partitioningIntent.partitionId !== "string") {
        errors.push("context.partitioningIntent.partitionId must be a non-empty string");
      }
      if (!context.partitioningIntent.collectionId || typeof context.partitioningIntent.collectionId !== "string") {
        errors.push("context.partitioningIntent.collectionId must be a non-empty string");
      }
      if (typeof context.partitioningIntent.createdAt !== "number" || context.partitioningIntent.createdAt < 0) {
        errors.push(
          "context.partitioningIntent.createdAt must be a non-negative number (Unix milliseconds)"
        );
      }

      // Validate strategy-specific requirements
      if (context.partitioningIntent.strategy === "indices") {
        if (!Array.isArray(context.partitioningIntent.indexRanges)) {
          errors.push("indices strategy requires partitioningIntent.indexRanges array");
        }
      } else if (context.partitioningIntent.strategy === "predicate") {
        if (!Array.isArray(context.partitioningIntent.memberPredicates)) {
          errors.push("predicate strategy requires partitioningIntent.memberPredicates array");
        }
      } else if (context.partitioningIntent.strategy === "explicit") {
        if (typeof context.partitioningIntent.windowIdGroups !== "object") {
          errors.push("explicit strategy requires partitioningIntent.windowIdGroups object");
        }
      }
    }

    // Validate identifiers
    if (!context.preparationId || typeof context.preparationId !== "string") {
      errors.push("context.preparationId must be a non-empty string");
    }
    if (!context.runtimeSessionId || typeof context.runtimeSessionId !== "string") {
      errors.push("context.runtimeSessionId must be a non-empty string");
    }
    if (typeof context.preparedAt !== "number" || context.preparedAt < 0) {
      errors.push("context.preparedAt must be a non-negative number (Unix milliseconds)");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
