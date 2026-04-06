/**
 * Temporal Execution Stage
 * Stage and step definitions for execution flow.
 * No semantic interpretation, purely structural sequencing.
 * All identifiers and timestamps caller-provided.
 */

/**
 * ExecutionStep
 * Atomic unit of work within an execution stage.
 * Pure structural definition, no business semantics.
 */
export interface ExecutionStep {
  // Unique step identifier (caller-provided)
  stepId: string;
  
  // Human-readable step name for logging/debugging
  stepName: string;
  
  // 0-based position of this step within its stage
  // Used for explicit ordering without inference
  stepPosition: number;
  
  // Caller-provided semantic type identifier
  // No interpretation; caller defines what this means
  stepType: string;
  
  // Other step IDs this step depends on
  // Can include steps from other stages in the execution plan
  // Empty array means no dependencies
  stepDependencies: string[];
  
  // When this step was defined (caller-provided)
  createdAt: number;
  
  // Metadata for step context
  metadata: Record<string, unknown>;
}

/**
 * ExecutionStage
 * Grouping of steps that form a cohesive execution unit.
 * Pure structural definition, no business semantics.
 */
export interface ExecutionStage {
  // Unique stage identifier (caller-provided, matches intent.stageId)
  stageId: string;
  
  // Human-readable stage name
  stageName: string;
  
  // 0-based position of this stage in the execution plan
  // Used for explicit sequencing without inference
  stagePosition: number;
  
  // All steps that belong to this stage
  // Steps are the atomic units within the stage
  steps: ExecutionStep[];
  
  // Other stage IDs this stage depends on
  // Stage can only execute after all dependencies complete
  // Empty array means no dependencies
  stageDependencies: string[];
  
  // When this stage was created (caller-provided)
  createdAt: number;
  
  // Metadata for stage context
  metadata: Record<string, unknown>;
}

/**
 * ExecutionStageValidator
 * Validate stage and step structural integrity.
 */
export class ExecutionStageValidator {
  /**
   * validateStage
   * Check structural completeness of an execution stage.
   *
   * @param stage - Stage to validate
   * @returns Validation result
   */
  static validateStage(stage: ExecutionStage): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validate stage identifiers
    if (!stage.stageId || typeof stage.stageId !== "string") {
      errors.push("stage.stageId must be a non-empty string");
    }
    if (!stage.stageName || typeof stage.stageName !== "string") {
      errors.push("stage.stageName must be a non-empty string");
    }
    if (typeof stage.stagePosition !== "number" || stage.stagePosition < 0) {
      errors.push("stage.stagePosition must be a non-negative number");
    }

    // Validate steps
    if (!Array.isArray(stage.steps)) {
      errors.push("stage.steps must be an array");
    } else if (stage.steps.length === 0) {
      errors.push("stage.steps must be non-empty");
    } else {
      for (let i = 0; i < stage.steps.length; i++) {
        const step = stage.steps[i];
        
        if (!step.stepId || typeof step.stepId !== "string") {
          errors.push(`stage.steps[${i}].stepId must be a non-empty string`);
        }
        if (!step.stepName || typeof step.stepName !== "string") {
          errors.push(`stage.steps[${i}].stepName must be a non-empty string`);
        }
        if (typeof step.stepPosition !== "number" || step.stepPosition < 0) {
          errors.push(`stage.steps[${i}].stepPosition must be a non-negative number`);
        }
        if (!step.stepType || typeof step.stepType !== "string") {
          errors.push(`stage.steps[${i}].stepType must be a non-empty string`);
        }
        if (typeof step.createdAt !== "number" || step.createdAt < 0) {
          errors.push(`stage.steps[${i}].createdAt must be a non-negative number`);
        }
        if (!Array.isArray(step.stepDependencies)) {
          errors.push(`stage.steps[${i}].stepDependencies must be an array`);
        }
      }
    }

    // Validate timestamps
    if (typeof stage.createdAt !== "number" || stage.createdAt < 0) {
      errors.push("stage.createdAt must be a non-negative number");
    }

    // Validate dependencies
    if (!Array.isArray(stage.stageDependencies)) {
      errors.push("stage.stageDependencies must be an array");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * validateStep
   * Check structural completeness of an execution step.
   *
   * @param step - Step to validate
   * @returns Validation result
   */
  static validateStep(step: ExecutionStep): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!step.stepId || typeof step.stepId !== "string") {
      errors.push("step.stepId must be a non-empty string");
    }
    if (!step.stepName || typeof step.stepName !== "string") {
      errors.push("step.stepName must be a non-empty string");
    }
    if (typeof step.stepPosition !== "number" || step.stepPosition < 0) {
      errors.push("step.stepPosition must be a non-negative number");
    }
    if (!step.stepType || typeof step.stepType !== "string") {
      errors.push("step.stepType must be a non-empty string");
    }
    if (typeof step.createdAt !== "number" || step.createdAt < 0) {
      errors.push("step.createdAt must be a non-negative number");
    }
    if (!Array.isArray(step.stepDependencies)) {
      errors.push("step.stepDependencies must be an array");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
