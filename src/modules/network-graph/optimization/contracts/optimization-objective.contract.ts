/**
 * Optimization Objective Contract
 * Defines explicit optimization targets and their optimization direction.
 * Caller-provided structural language for specifying "what better means".
 * Single-objective deterministic optimization boundary.
 * 
 * OBJECTIVE BOUNDARY CLOSURE:
 * - This layer defines ONLY what to optimize toward
 * - Optimization is always single-objective with explicit target and direction
 * - Multi-objective weighting is explicitly OUT OF SCOPE (use composition, not weighting)
 * - No implicit priority ordering, no fallback objectives, no policy override
 * - All identifiers and scope decisions are caller-provided only
 * - This layer is structural-only: defines the optimization intent, not the optimization algorithm
 * 
 * WHAT OPTIMIZATION OBJECTIVE MEANS:
 * - "best action" = action that optimizes this single explicit target in this direction
 * - Same objective → same semantic meaning across all invocations (deterministic)
 * - Objective guides action evaluation and selection, nothing else
 * - Objective is not a recommendation, not a decision, not a policy override
 * - Objective is not a confidence measure, severity indicator, or priority marker
 * 
 * WHAT OPTIMIZATION OBJECTIVE IS NOT:
 * - NOT multi-objective with implicit weighting (single objective only)
 * - NOT weighted priority ordering (no weights, no implicit precedence)
 * - NOT execution preference or delivery guarantee (optimization goal only)
 * - NOT policy enforcement or entity approval (optimization scope only)
 * - NOT decision logic or recommendation behavior
 * - NOT scoring engine or ranking logic
 * - NOT ML inference, probabilistic model, or dynamic learning
 * - NOT hidden priority expansion or fallback semantics
 * - NOT generic metadata bag (explicit target/direction only)
 * 
 * SEPARATION OF CONCERNS:
 * - Optimization boundary: objective + constraints + tie-break guide action evaluation
 * - Decisioning boundary: SEPARATE layer may consume optimization result to make decisions
 * - Execution boundary: SEPARATE layer may consume decision to perform execution
 * - No flow-through of optimization intent into decisioning or execution semantics
 */

/**
 * OptimizationObjectiveTarget
 * Named optimization targets that can be optimized towards.
 * Bounded vocabulary of responsibility-based optimization directions.
 * 
 * Explicit targets:
 * - cost: financial cost minimization
 * - time: duration or latency minimization
 * - capacity_usage: resource capacity utilization minimization
 * - availability: service availability or uptime maximization
 * - regional_balance: geographic distribution maximization
 * - inventory_balance: inventory level distribution maximization
 * - efficiency: operational efficiency maximization
 * - throughput: processing throughput maximization
 * 
 * Target selection is caller-provided only. No runtime target generation or inference.
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
 * Binary choice ensures objective semantics remain deterministic and unambiguous.
 */
export type OptimizationDirection = "minimize" | "maximize";

/**
 * OptimizationObjective
 * Caller-provided specification of what optimization target and direction to pursue.
 * Structural-only: defines the optimization intent without embedding runtime behavior.
 * Single-objective design: one target per optimization invocation.
 */
export interface OptimizationObjective {
  /** Explicitly named optimization target (caller-provided, no inference) */
  readonly target: OptimizationObjectiveTarget;

  /** Direction: minimize or maximize the target (caller-provided, no fallback) */
  readonly direction: OptimizationDirection;

  /** Optional entity scope: if present, optimization applies to these specific entities only (caller-provided) */
  readonly entityScope?: readonly string[];
}

/**
 * Optimization objective semantics:
 * - Structural-only definition of optimization intent
 * - No scoring logic, no weighting, no hidden priority expansion
 * - No inference, no fallback objectives, no implicit ordering
 * - Caller defines what "better" means through explicit target + direction
 * - Optimizer consumes this objective to guide candidate action evaluation
 * - All values are caller-provided; no runtime defaults, no generation
 * - entityScope (if present) constrains which entities the objective can apply to
 * - entityScope (if absent) means objective applies to all entities in context
 * 
 * Single-objective doctrine:
 * - Each optimization invocation optimizes exactly ONE objective
 * - Multiple objectives require separate invocations or composition at caller level
 * - No weighting, no implicit prioritization, no combined scoring
 * - Each invocation produces one result for one objective
 * 
 * Boundary preservation:
 * - Objective does NOT make decisions (that's decisioning layer responsibility)
 * - Objective does NOT enforce policy (that's constraint layer responsibility)
 * - Objective does NOT recommend actions (that's application layer responsibility)
 * - Objective guides optimization; downstream layers consume optimization output
 */
