/**
 * Temporal Execution Context
 * Explicit input specification for execution stage.
 * Holds preparation result + execution configuration.
 * All identifiers and timestamps caller-provided.
 */

import type { TemporalPreparationResult } from "../runtime/index.ts";

/**
 * ExecutionStageIntent
 * Explicit specification of what execution should do in a single stage.
 * Caller defines stages, dependencies, and configuration.
 * No defaults, no inference.
 */
export interface ExecutionStageIntent {
  // Unique stage identifier (caller-provided)
  stageId: string;
  
  // Human-readable stage name for logging/debugging
  stageName: string;
  
  // When this stage configuration was prepared (caller-provided)
  stagePreparedAt: number;
  
  // Other stage IDs this stage depends on (must execute after them)
  // Empty array means no dependencies
  stageDependencies: string[];
  
  // Stage-specific configuration (caller-provided context)
  stageConfiguration: Record<string, unknown>;
  
  // Metadata for stage context
  metadata: Record<string, unknown>;
}

/**
 * TemporalExecutionContext
 * Complete input specification for execution stage.
 * All fields explicitly provided by caller.
 * No inference, no hidden generation.
 */
export interface TemporalExecutionContext {
  // Explicit execution identifiers (caller-provided)
  executionId: string;
  executionSessionId: string;
  
  // When execution was initiated (caller-provided)
  executionStartedAt: number;
  
  // The preparation result that was prepared (explicit input)
  // This is what the execution stage will process
  preparationResult: TemporalPreparationResult;
  
  // Explicit execution stages caller wants to perform
  // Defines what should happen during execution
  stageIntents: ExecutionStageIntent[];
  
  // Explicit metadata (caller-provided context only)
  metadata: Record<string, unknown>;
}

/**
 * TemporalExecutionContextValidator
 * Structural validation of execution context.
 * Validates only declared structure, not domain semantics.
 */
export class TemporalExecutionContextValidator {
  /**
   * validate
   * Check structural completeness and type correctness of context.
   * Does NOT validate business logic or domain semantics.
   *
   * @param context - Context to validate
   * @returns Object with isValid flag and error messages
   */
  static validate(context: TemporalExecutionContext): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validate execution identifiers
    if (!context.executionId || typeof context.executionId !== "string") {
      errors.push("context.executionId must be a non-empty string");
    }
    if (!context.executionSessionId || typeof context.executionSessionId !== "string") {
      errors.push("context.executionSessionId must be a non-empty string");
    }
    if (typeof context.executionStartedAt !== "number" || context.executionStartedAt < 0) {
      errors.push("context.executionStartedAt must be a non-negative number (Unix milliseconds)");
    }

    // Validate preparation result exists
    if (!context.preparationResult) {
      errors.push("context.preparationResult is required");
    } else {
      if (!context.preparationResult.preparationId) {
        errors.push("context.preparationResult.preparationId is missing");
      }
      if (typeof context.preparationResult.inputWindowCount !== "number") {
        errors.push("context.preparationResult.inputWindowCount must be a number");
      }
      if (typeof context.preparationResult.inputMemberCount !== "number") {
        errors.push("context.preparationResult.inputMemberCount must be a number");
      }
    }

    // Validate stage intents
    if (!Array.isArray(context.stageIntents)) {
      errors.push("context.stageIntents must be an array");
    } else if (context.stageIntents.length === 0) {
      errors.push("context.stageIntents must be non-empty");
    } else {
      for (let i = 0; i < context.stageIntents.length; i++) {
        const stage = context.stageIntents[i];
        
        if (!stage.stageId || typeof stage.stageId !== "string") {
          errors.push(`context.stageIntents[${i}].stageId must be a non-empty string`);
        }
        if (!stage.stageName || typeof stage.stageName !== "string") {
          errors.push(`context.stageIntents[${i}].stageName must be a non-empty string`);
        }
        if (typeof stage.stagePreparedAt !== "number" || stage.stagePreparedAt < 0) {
          errors.push(
            `context.stageIntents[${i}].stagePreparedAt must be a non-negative number (Unix milliseconds)`
          );
        }
        if (!Array.isArray(stage.stageDependencies)) {
          errors.push(`context.stageIntents[${i}].stageDependencies must be an array`);
        }
      }

      // Validate stage dependency references
      const stageIdSet = new Set(context.stageIntents.map(s => s.stageId));
      for (let i = 0; i < context.stageIntents.length; i++) {
        const stage = context.stageIntents[i];
        for (const depId of stage.stageDependencies) {
          if (!stageIdSet.has(depId)) {
            errors.push(
              `context.stageIntents[${i}].stageDependencies references unknown stage ID "${depId}"`
            );
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
