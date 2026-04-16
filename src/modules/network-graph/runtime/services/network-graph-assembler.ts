/**
 * Network Graph Assembler
 * Deterministic graph assembly service.
 * Transforms caller-provided graph assembly input into runtime-ready assembled graph.
 * No validation, no enforcement, no enrichment, pure deterministic assembly.
 */

import type { AssembledNetworkGraph } from "../entities/assembled-network-graph.entity.ts";
import type { GraphRuntimeState } from "../contracts/graph-runtime-state.contract.ts";
import type { GraphAssemblyInput } from "../contracts/graph-assembly-input.contract.ts";
import type { GraphAssemblyResult } from "../contracts/graph-assembly-result.contract.ts";
import type { NetworkGraphAssembler } from "../contracts/network-graph-assembler.contract.ts";

/**
 * StandardNetworkGraphAssembler
 * Minimal deterministic graph assembler implementation.
 * Accepts explicit assembly input and produces assembled graph output.
 * No validation, no routing, no embedded intelligence.
 */
export const standardNetworkGraphAssembler: NetworkGraphAssembler = {
  /**
   * Assemble a graph from explicit input.
   * Deterministically transforms GraphAssemblyInput into GraphAssemblyResult.
   *
   * Assembly process:
   * 1. Extract collections from input
   * 2. Build runtime state from collection sizes
   * 3. Create assembled graph carrier with state
   * 4. Wrap result and return
   *
   * No validation, no normalization, no transformation of input contents.
   */
  assemble(input: GraphAssemblyInput): GraphAssemblyResult {
    // Extract collections from input
    const nodes = input.nodes;
    const edges = input.edges;
    const relations = input.relations;

    // Determine runtime state from collections
    const nodeCount = nodes.length;
    const edgeCount = edges.length;
    const relationCount = relations.length;
    const isEmpty = nodeCount === 0 && edgeCount === 0 && relationCount === 0;

    // Construct explicit runtime state
    const runtimeState: GraphRuntimeState = {
      assemblyStatus: "assembled",
      isEmpty,
      nodeCount,
      edgeCount,
      relationCount,
    };

    // Construct assembled graph carrier
    const assembledGraph: AssembledNetworkGraph = {
      graphId: input.graphId,
      nodes,
      edges,
      relations,
      runtimeState,
      metadata: input.metadata,
      timestamps: input.timestamps,
    };

    // Return assembly result
    const result: GraphAssemblyResult = {
      assembledGraph,
    };

    return result;
  },
};
