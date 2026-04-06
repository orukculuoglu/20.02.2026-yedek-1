/**
 * Temporal Analytics Input
 * Analytics-ready payload contracts.
 * Derived from execution plan, no semantic interpretation.
 * Purely structural comparison, stage, and route payloads.
 */

/**
 * ComparisonAnalyticsPayload
 * Analytics-ready data for a single comparison.
 * Contains only data explicitly available from execution plan.
 * Window references and overlap must come from explicit sources.
 * No scoring, no interpretation, no fabricated defaults.
 */
export interface ComparisonAnalyticsPayload {
  // Comparison structure identifier (from execution preparation)
  // Caller must explicitly reference this comparison
  comparisonId: string;

  // Window references for this comparison
  // Optional: only populated if available from execution plan metadata
  leftWindowId?: string;
  rightWindowId?: string;

  // Comparison intent (direct, anchored, offset, concurrent)
  // Optional: only populated if available from execution plan metadata
  comparisonIntent?: "direct" | "anchored" | "offset" | "concurrent";

  // Temporal overlap information
  // Optional: only populated if available from execution plan metadata
  overlapStartTimestamp?: number | null;
  overlapEndTimestamp?: number | null;
  overlapDays?: number | null;

  // Which execution stages will process this comparison
  // Stage IDs in execution order (derived from stage metadata)
  processingStageIds: string[];

  // Metadata for this comparison payload
  // Optional: only populated if explicit data available from stage metadata
  // No fallback empty objects
  metadata?: Record<string, unknown>;
}

/**
 * StageAnalyticsPayload
 * Analytics-ready data for an execution stage.
 * Contains structural information about what will execute.
 * No business logic, no scoring.
 */
export interface StageAnalyticsPayload {
  // Stage identifier (from execution)
  stageId: string;

  // Stage name for logging/debugging
  stageName: string;

  // Position in execution route
  routePosition: number;

  // Number of steps in this stage
  stepCount: number;

  // Step identifiers in this stage
  stepIds: string[];

  // Stage dependencies (other stages that must execute first)
  stageDependencies: string[];

  // Comparisons that will be processed in this stage
  // References to comparison structure IDs
  comparisonIdsInScope: string[];

  // Metadata for this stage payload
  metadata: Record<string, unknown>;
}

/**
 * RouteAnalyticsPayload
 * Analytics-ready data for the execution route.
 * Shows sequential ordering and dependencies.
 * No interpretation, purely structural.
 */
export interface RouteAnalyticsPayload {
  // Execution route: ordered list of stage IDs
  executionRoute: string[];

  // Total stages in route
  stageCount: number;

  // Total steps across all stages
  totalStepCount: number;

  // Backward dependency mapping
  // For each stage, which stages depend on it
  dependentStages: Map<string, Set<string>>;

  // Metadata for this route payload
  metadata: Record<string, unknown>;
}

/**
 * AnalyticsReadyInput
 * Complete analytics-ready input derived from execution plan.
 * Combines comparisons, stages, and route payloads.
 * Ready for downstream analytics consumption.
 * No business logic, all identifiers from prior layers.
 */
export interface AnalyticsReadyInput {
  // Unique analytics input identifier (caller-provided)
  analyticsInputId: string;

  // Analytics session context identifier
  analyticsSessionId: string;

  // When analytics input was created (caller-provided)
  createdAt: number;

  // Reference to source execution plan
  executionPlanId: string;
  executionPlanSessionId: string;

  // Analytics-ready comparison payloads
  // One payload per comparison in scope
  comparisons: ComparisonAnalyticsPayload[];

  // Analytics-ready stage payloads
  // One payload per stage in scope
  stages: StageAnalyticsPayload[];

  // Analytics-ready route payload
  // Single payload describing execution sequencing
  route: RouteAnalyticsPayload;

  // Total counts for quick access
  comparisonCount: number;
  stageCount: number;
  stepCount: number;

  // Metadata for analytics input
  metadata: Record<string, unknown>;
}
