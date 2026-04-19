/**
 * Runtime Context Contract
 *
 * Structural composition of runtime state surfaces.
 * Brings together capacity, stock, timing, and availability state
 * for use by later consuming layers.
 *
 * RESPONSIBILITY:
 * - Composes individual state surfaces into complete context
 * - Provides bounded context without being generic metadata bag
 * - Used by later layers for context-based decisions
 * - Immutable: snapshot of complete runtime context
 * - All components caller-provided: no generation, no inference
 *
 * SCOPE:
 * - Structural-only: no real data integration yet
 * - No database/API/event service integration
 * - No persistence of context
 * - No analytics or reporting
 * - Just a contract for how runtime context is carried
 *
 * KEY CHARACTERISTICS:
 * - RuntimeContext is immutable
 * - All state components are optional (not all states always relevant)
 * - Each state surface is independently caller-provided
 * - No cross-state computation or inference
 * - Available for later layer consumption
 *
 * STATE VS CONTEXT SEPARATION:
 * - State: measured/operational condition (capacity, stock, timing, availability)
 * - Context: bounded surrounding evaluation information (composition of states)
 * - RuntimeContext is the context boundary (not a catch-all data bag)
 */

import type { CapacityState } from "./capacity-state.contract";
import type { StockState } from "./stock-state.contract";
import type { SLATimeState } from "./sla-time-state.contract";
import type { AvailabilityState } from "./availability-state.contract";

/**
 * RuntimeContext: Complete bounded runtime context surface
 *
 * Composition of runtime state surfaces needed for later layer decisions.
 * Carries capacity, stock, timing, and availability state.
 *
 * COMPOSITION:
 * - Capacity state (optional): resource capacity conditions
 * - Stock state (optional): inventory conditions
 * - Timing state (optional): timing and constraint information
 * - Availability state (optional): operational readiness conditions
 *
 * RESPONSIBILITY:
 * - RuntimeContext is immutable: produced by caller, consumed by later layers
 * - All state components are optional (not all states always relevant)
 * - Each state is independently provided (no inference)
 * - Later layers receive this and use relevant states for their decisions
 * - No constraint logic in this foundation
 * - Snapshot only: immutable state at evaluation time
 */
export interface RuntimeContext {
  /**
   * Unique identifier for this runtime context snapshot.
   * Caller-provided: identifies this context point.
   */
  readonly contextId: string;

  /**
   * Capacity state (optional).
   * Provided if capacity information is relevant.
   * Later layers may use for capacity-related decisions.
   * Null if capacity state not included.
   */
  readonly capacityState: CapacityState | null;

  /**
   * Stock state (optional).
   * Provided if inventory information is relevant.
   * Later layers may use for stock-related decisions.
   * Null if stock state not included.
   */
  readonly stockState: StockState | null;

  /**
   * Timing state (optional).
   * Provided if timing information is relevant.
   * Later layers may use for timing-related decisions.
   * Null if timing state not included.
   */
  readonly slaTimeState: SLATimeState | null;

  /**
   * Availability state (optional).
   * Provided if availability information is relevant.
   * Later layers may use for availability-related decisions.
   * Null if availability state not included.
   */
  readonly availabilityState: AvailabilityState | null;
}

/**
 * Runtime Context Semantics:
 *
 * WHAT THIS IS:
 * - Bounded composition of runtime state surfaces
 * - Context structure for later layer consumption
 * - Snapshot of all runtime conditions at evaluation time
 * - Foundation for later layer decision-making
 *
 * WHAT THIS IS NOT:
 * - Not generic metadata bag (bounded to specific state types)
 * - Not constraint evaluation (that's deferred to later layers)
 * - Not real data source (no integration yet)
 * - Not persistence (immutable snapshot only)
 * - Not analytics (no aggregation, no metrics)
 * - Not generated from external sources (all caller-provided)
 *
 * STATE VS CONTEXT:
 * - State: individual measured conditions (CapacityState, StockState, etc.)
 * - Context: bounded composition of states (RuntimeContext)
 * - This is context, not state (assembles multiple state surfaces)
 * - Each state is independent; context just composes them
 *
 * HOW LATER LAYERS MAY USE THIS:
 * - Later layers receive RuntimeContext
 * - Select and use relevant state surface(s) for their decisions
 * - Example: capacity constraint layer uses capacityState if provided
 * - Example: stock constraint layer uses stockState if provided
 * - Example: timing layer uses slaTimeState if provided
 * - Each layer only processes its relevant state(s)
 * - Layers may combine states or use them individually
 * - No fixed consumption pattern; layers are flexible
 * - Implementation and flow determined by consuming layers
 *
 * OPTIONAL COMPONENTS RATIONALE:
 * - Not all states relevant for all evaluations
 * - Some layers only need capacity state
 * - Some only need stock or timing state
 * - Optional fields allow flexibility without forcing all states
 * - Caller controls which states are included
 * - Later layers check what's available before using
 * - Supports multiple consumption patterns
 */

