/**
 * Graph Runtime State Contract
 * Structural specification for explicit runtime state of an assembled graph.
 * Carries descriptive state information placed with assembled graph output.
 * All values are caller-provided from the assembly operation only.
 * No validation, no enforcement, no derivation logic, pure structural state specification.
 */

/**
 * GraphRuntimeState
 * Minimal structural specification for assembled graph runtime state.
 * Carries explicit state information about an assembled graph.
 * State values are provided by the assembler when building AssembledNetworkGraph.
 */
export interface GraphRuntimeState {
  /** Assembly status descriptor (caller-provided, required) */
  assemblyStatus: "assembled" | "pending" | "failed";

  /** Whether the graph is empty (caller-provided, required) */
  isEmpty: boolean;

  /** Node collection size in the assembled graph (caller-provided, required) */
  nodeCount: number;

  /** Edge collection size in the assembled graph (caller-provided, required) */
  edgeCount: number;

  /** Relation collection size in the assembled graph (caller-provided, required) */
  relationCount: number;
}
