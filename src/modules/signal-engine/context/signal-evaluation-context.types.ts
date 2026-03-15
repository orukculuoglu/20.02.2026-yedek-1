/**
 * Normalized evaluation context prepared from upstream intelligence inputs.
 * Used by the Signal Rule Engine for deterministic signal evaluation.
 * 
 * This context aggregates all upstream intelligence structures (indexes, composites,
 * graph, events) into a single, deterministic object with assigned timestamp.
 */
export interface SignalEvaluationContext {
  avid: string;
  vehicleId?: string;
  timestamp: number;

  indexes?: Record<string, unknown>;
  composites?: Record<string, unknown>;
  graph?: Record<string, unknown>;
  events?: Record<string, unknown>;

  vehicleContext?: Record<string, unknown>;

  metadata?: Record<string, unknown>;
}

/**
 * Input contract for creating a SignalEvaluationContext.
 * Accepts upstream intelligence structures without timestamp.
 * 
 * Timestamp will be assigned deterministically by the builder.
 */
export interface SignalEvaluationInput {
  avid: string;
  vehicleId?: string;

  indexes?: Record<string, unknown>;
  composites?: Record<string, unknown>;
  graph?: Record<string, unknown>;
  events?: Record<string, unknown>;

  vehicleContext?: Record<string, unknown>;

  metadata?: Record<string, unknown>;
}
