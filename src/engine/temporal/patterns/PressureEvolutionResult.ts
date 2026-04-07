/**
 * Pressure Evolution Result
 * Explicit output contracts for deterministic pressure evolution evaluation.
 * All results represent computed outputs from explicit caller-provided inputs only.
 * No business logic, no interpretation, no policy.
 */

/**
 * PressureEvolutionStage
 * Explicit pressure evolution stage derived from direction + strength combination.
 * Structural representation of pressure state within evolution progression.
 * All stage types strictly mapped from explicit direction/strength pairs.
 */
export interface PressureEvolutionStage {
  /** Unique identifier for this stage (caller-provided) */
  stageId: string;

  /** Source trend identifier */
  sourceTrendId: string;

  /** Stage type classification derived from direction + strength mapping */
  stageType:
    | "emergence"
    | "acceleration"
    | "stabilization"
    | "deceleration"
    | "reversal"
    | "continuation"
    | "undefined";

  /** Position within evolution sequence (0-based index, caller-provided) */
  stagePosition: number;

  /** Structural label describing activation condition (runtime-derived from stage type) */
  activationConditionLabel: string;

  /** Timestamp when stage was activated (caller-provided, Unix milliseconds) */
  activatedAt: number;

  /** Optional metadata for stage context (caller-provided) */
  metadata?: Record<string, unknown>;
}

/**
 * PressureEvolutionTransition
 * Explicit transition between two pressure evolution stages.
 * Only created when stage type changes from previous surface.
 * Transition reason is structural only.
 */
export interface PressureEvolutionTransition {
  /** Unique identifier for this transition (caller-provided) */
  transitionId: string;

  /** Source trend identifier */
  sourceTrendId: string;

  /** Previous stage type */
  fromStageType:
    | "emergence"
    | "acceleration"
    | "stabilization"
    | "deceleration"
    | "reversal"
    | "continuation"
    | "undefined";

  /** New stage type */
  toStageType:
    | "emergence"
    | "acceleration"
    | "stabilization"
    | "deceleration"
    | "reversal"
    | "continuation"
    | "undefined";

  /** Structural transition reason (no business logic) */
  transitionReason: "stage_changed" | "stage_unchanged" | "no_previous_surface";

  /** Timestamp when transition occurred (caller-provided, Unix milliseconds) */
  transitionedAt: number;

  /** Optional metadata for transition context (caller-provided) */
  metadata?: Record<string, unknown>;
}

/**
 * PressureEvolutionSurface
 * Complete structural representation of pressure evolution state.
 * Binds stage, optional transition, and evolution label together.
 * No business meaning assigned, purely structural.
 */
export interface PressureEvolutionSurface {
  /** Unique identifier for this pressure evolution surface (caller-provided) */
  pressureEvolutionId: string;

  /** Source trend identifier */
  sourceTrendId: string;

  /** Source runtime identifier */
  sourceRuntimeId: string;

  /** Current stage of pressure evolution */
  currentStage: PressureEvolutionStage;

  /** Optional previous stage from prior evolution (if provided by caller) */
  previousStage?: PressureEvolutionStage;

  /** Optional transition (present only if stage type changed) */
  transition?: PressureEvolutionTransition;

  /** Evolution label derived strictly from currentStage.stageType */
  evolutionLabel:
    | "emerging_pressure"
    | "accelerating_pressure"
    | "stable_pressure"
    | "decelerating_pressure"
    | "reversing_pressure"
    | "continuing_pressure"
    | "undefined_pressure";

  /** Timestamp when pressure evolution surface was evaluated (caller-provided, Unix milliseconds) */
  evaluatedAt: number;

  /** Optional metadata for surface context (caller-provided) */
  metadata?: Record<string, unknown>;
}

/**
 * PressureEvolutionResult
 * Complete explicit output of deterministic pressure evolution evaluation.
 * Contains pressure evolution surface and readiness status.
 * All results strictly derived from explicit caller-provided inputs.
 * No business logic, no interpretation, no policy.
 */
export interface PressureEvolutionResult {
  /** Unique identifier for this evolution runtime execution */
  evolutionRuntimeId: string;

  /** Associated evolution session identifier */
  evolutionSessionId: string;

  /** Timestamp when evolution runtime started */
  evolutionStartedAt: number;

  /** Timestamp when evolution runtime completed */
  evolutionCompletedAt: number;

  /** Pressure evolution surface with stage, optional transition, and label */
  pressureEvolutionSurface: PressureEvolutionSurface;

  /** Overall readiness indicator: true if all required surfaces computed successfully */
  isReady: boolean;

  /** Array of readiness errors if isReady is false (absent if isReady is true) */
  readinessErrors: string[];

  /** Optional metadata for result context (caller-provided) */
  metadata?: Record<string, unknown>;
}

/**
 * PressureEvolutionResultBuilder
 * Deterministic construction of pressure evolution results.
 * Assembles explicit computation outputs without interpretation.
 */
export class PressureEvolutionResultBuilder {
  /**
   * build
   * Construct a complete pressure evolution result from explicit components.
   *
   * @param evolutionRuntimeId - Unique evolution runtime execution identifier
   * @param evolutionSessionId - Associated evolution session identifier
   * @param evolutionStartedAt - Timestamp when evolution runtime started
   * @param evolutionCompletedAt - Timestamp when evolution runtime completed
   * @param pressureEvolutionSurface - Computed pressure evolution surface
   * @param metadata - Optional context metadata
   * @returns Complete pressure evolution result
   */
  static build(
    evolutionRuntimeId: string,
    evolutionSessionId: string,
    evolutionStartedAt: number,
    evolutionCompletedAt: number,
    pressureEvolutionSurface: PressureEvolutionSurface,
    metadata?: Record<string, unknown>
  ): PressureEvolutionResult {
    // Validate required fields
    if (!evolutionRuntimeId || typeof evolutionRuntimeId !== "string") {
      throw new Error("PressureEvolutionResultBuilder.build: evolutionRuntimeId must be a non-empty string");
    }
    if (!evolutionSessionId || typeof evolutionSessionId !== "string") {
      throw new Error("PressureEvolutionResultBuilder.build: evolutionSessionId must be a non-empty string");
    }
    if (typeof evolutionStartedAt !== "number" || evolutionStartedAt < 0) {
      throw new Error("PressureEvolutionResultBuilder.build: evolutionStartedAt must be a non-negative number");
    }
    if (typeof evolutionCompletedAt !== "number" || evolutionCompletedAt < 0) {
      throw new Error("PressureEvolutionResultBuilder.build: evolutionCompletedAt must be a non-negative number");
    }
    if (!pressureEvolutionSurface || typeof pressureEvolutionSurface !== "object") {
      throw new Error("PressureEvolutionResultBuilder.build: pressureEvolutionSurface must be an object");
    }

    // Validate surface structure
    const readinessErrors: string[] = [];

    if (!pressureEvolutionSurface.pressureEvolutionId) {
      readinessErrors.push("pressureEvolutionSurface.pressureEvolutionId is missing");
    }
    if (!pressureEvolutionSurface.sourceTrendId) {
      readinessErrors.push("pressureEvolutionSurface.sourceTrendId is missing");
    }
    if (!pressureEvolutionSurface.sourceRuntimeId) {
      readinessErrors.push("pressureEvolutionSurface.sourceRuntimeId is missing");
    }
    if (!pressureEvolutionSurface.currentStage) {
      readinessErrors.push("pressureEvolutionSurface.currentStage is missing");
    } else {
      const stage = pressureEvolutionSurface.currentStage;
      if (!stage.stageId) {
        readinessErrors.push("pressureEvolutionSurface.currentStage.stageId is missing");
      }
      if (!stage.stageType) {
        readinessErrors.push("pressureEvolutionSurface.currentStage.stageType is missing");
      }
    }
    if (!pressureEvolutionSurface.evolutionLabel) {
      readinessErrors.push("pressureEvolutionSurface.evolutionLabel is missing");
    }
    if (typeof pressureEvolutionSurface.evaluatedAt !== "number") {
      readinessErrors.push("pressureEvolutionSurface.evaluatedAt must be a number");
    }

    const isReady = readinessErrors.length === 0;

    return {
      evolutionRuntimeId,
      evolutionSessionId,
      evolutionStartedAt,
      evolutionCompletedAt,
      pressureEvolutionSurface,
      isReady,
      readinessErrors,
      metadata: metadata ? { ...metadata } : undefined,
    };
  }
}
