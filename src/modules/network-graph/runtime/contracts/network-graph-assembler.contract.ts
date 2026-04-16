/**
 * Network Graph Assembler Contract
 * Structural contract for graph assembly operations.
 * Defines the interface for transforming assembly input into assembled graph output.
 * No validation, no enforcement, pure assembly transformation contract.
 */

import type { GraphAssemblyInput } from "./graph-assembly-input.contract.ts";
import type { GraphAssemblyResult } from "./graph-assembly-result.contract.ts";

/**
 * NetworkGraphAssembler
 * Minimal contract for deterministic graph assembly operations.
 * Defines the assembly transformation surface only.
 * Implementation is responsible for producing AssembledNetworkGraph from GraphAssemblyInput.
 */
export interface NetworkGraphAssembler {
  /**
   * Assemble a graph from explicit input.
   * Transforms GraphAssemblyInput into GraphAssemblyResult deterministically.
   * No validation, no enforcement, no enrichment.
   *
   * @param input - Graph assembly input with nodes, edges, and relations to assemble
   * @returns Assembly result containing the assembled graph and runtime state
   */
  assemble(input: GraphAssemblyInput): GraphAssemblyResult;
}
