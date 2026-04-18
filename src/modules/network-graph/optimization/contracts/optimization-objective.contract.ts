/**
 * Optimization Objective Contract
 * Defines explicit optimization targets and their optimization direction.
 * Caller-provided structural language for specifying "what better means".
 * No scoring runtime, no inference, no hidden defaults.
 */

/**
 * OptimizationObjectiveTarget
 * Named optimization targets that can be optimized towards.
 * Bounded vocabulary of responsibility-based optimization directions.
 */
export type OptimizationObjectiveTarget =
  | "cost"              // Minimize total cost
  | "time"              // Minimize total time or latency
  | "capacity_usage"    // Minimize capacity utilization
  | "availability"      // Maximize availability or uptime
  | "regional_balance"  // Maximize balanced distribution across regions
  | "inventory_balance" // Maximize balanced inventory levels
  | "efficiency"        // Maximize efficiency metric
  | "throughput";       // Maximize throughput

/**
 * OptimizationDirection
 * Explicit direction: whether to minimize or maximize the target.
 */
export type OptimizationDirection = "minimize" | "maximize";

/**
 * OptimizationObjective
 * Caller-provided specification of what optimization target and direction to pursue.
 * Structural-only: defines the optimization intent without runtime behavior.
 */
export interface OptimizationObjective {
  /** Explicitly named optimization target (caller-provided) */
  readonly target: OptimizationObjectiveTarget;

  /** Direction: minimize or maximize the target (caller-provided) */
  readonly direction: OptimizationDirection;

  /** Optional scope constraint: apply optimization to specific entity subset if needed (caller-provided) */
  readonly entityScope?: readonly string[];
}

/**
 * Optimization objective behavior:
 * - Structural-only definition of optimization intent
 * - No scoring logic, no weighting, no inference
 * - Caller defines what "better" means through explicit objective
 * - Evaluator or optimizer consumes this objective to guide its decisions
 * - All values are caller-provided; no runtime defaults or generation
 */
