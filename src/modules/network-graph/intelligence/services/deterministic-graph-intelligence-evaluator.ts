/**
 * Deterministic Graph Intelligence Evaluator Service
 * Structural evaluator that transforms graph intelligence input into observable results.
 * Deterministic: same input always produces same result.
 * No scoring, no propagation, no policy, only structural observation production.
 * Behavior strictly grounded in explicit input structures: no hidden interpretation of observation modes.
 * Produces results with explicit local vs network intelligence separation (Phase 5).
 */

import type { GraphIntelligenceInput } from "../contracts/graph-intelligence-input.contract";
import type { GraphIntelligenceResult } from "../contracts/graph-intelligence-result.contract";
import type {
  GraphIntelligenceLocalObservation,
  GraphIntelligenceNetworkObservation,
} from "../contracts/graph-intelligence-observation.contract";
import type { GraphIntelligenceEvaluator } from "../contracts/graph-intelligence-evaluator.contract";

/**
 * DeterministicGraphIntelligenceEvaluator
 * Minimal implementation of structural graph intelligence evaluation.
 * Reads explicitly provided input structures, produces deterministic observations.
 * No side effects, no mutation, no hidden business logic.
 * Observation modes (subgraph, component, focused) are not interpreted: only full_graph is operationalized.
 * If no scope is provided, produces minimal network observation of full structure.
 * Result separates local and network observations into explicit branches (Phase 5).
 */
export const DeterministicGraphIntelligenceEvaluator: GraphIntelligenceEvaluator = {
  evaluate(input: GraphIntelligenceInput): GraphIntelligenceResult {
    // Extract input components
    const { envelope, scope, context } = input;
    const localObservations: GraphIntelligenceLocalObservation[] = [];
    const networkObservations: GraphIntelligenceNetworkObservation[] = [];

    // Correlate request if context provided
    const requestId = context?.requestId;

    // Get assembled graph from envelope
    const assembledGraph = envelope.assemblyResult.assembledGraph;

    // Process observation scope: produce local observations for explicitly focused entities
    if (scope) {
      // If explicit node focus is provided, produce local observations
      if (scope.focusNodeIds && scope.focusNodeIds.length > 0) {
        for (const nodeId of scope.focusNodeIds) {
          // Verify node exists in assembled graph (read-only check)
          if (assembledGraph.nodes.some((n) => n.nodeId === nodeId)) {
            const localObservation: GraphIntelligenceLocalObservation = {
              kind: "local",
              entityKind: "node",
              entityId: nodeId,
            };
            localObservations.push(localObservation);
          }
        }
      }

      // If explicit edge focus is provided, produce local observations
      if (scope.focusEdgeIds && scope.focusEdgeIds.length > 0) {
        for (const edgeId of scope.focusEdgeIds) {
          // Verify edge exists in assembled graph (read-only check)
          if (assembledGraph.edges.some((e) => e.edgeId === edgeId)) {
            const localObservation: GraphIntelligenceLocalObservation = {
              kind: "local",
              entityKind: "edge",
              entityId: edgeId,
            };
            localObservations.push(localObservation);
          }
        }
      }

      // If explicit relation focus is provided, produce local observations
      if (scope.focusRelationIds && scope.focusRelationIds.length > 0) {
        for (const relationId of scope.focusRelationIds) {
          // Verify relation exists in assembled graph (read-only check)
          if (assembledGraph.relations.some((r) => r.relationId === relationId)) {
            const localObservation: GraphIntelligenceLocalObservation = {
              kind: "local",
              entityKind: "relation",
              entityId: relationId,
            };
            localObservations.push(localObservation);
          }
        }
      }

      // If observation mode is "full_graph", produce network observation of complete structure
      // Note: other modes (subgraph, component, focused) have no structural grounding in Phase 1 input
      if (scope.observationMode === "full_graph") {
        const allNodeIds = assembledGraph.nodes.map((n) => n.nodeId);
        const allEdgeIds = assembledGraph.edges.map((e) => e.edgeId);
        const allRelationIds = assembledGraph.relations.map((r) => r.relationId);

        // Produce network observation only if at least one entity type is present
        if (
          allNodeIds.length > 0 ||
          allEdgeIds.length > 0 ||
          allRelationIds.length > 0
        ) {
          const networkObservation: GraphIntelligenceNetworkObservation = {
            kind: "network",
            nodeIds: allNodeIds.length > 0 ? allNodeIds : undefined,
            edgeIds: allEdgeIds.length > 0 ? allEdgeIds : undefined,
            relationIds: allRelationIds.length > 0 ? allRelationIds : undefined,
          };
          networkObservations.push(networkObservation);
        }
      }
    }

    // If no scope provided, produce minimal network observation of full structure
    if (!scope) {
      const allNodeIds = assembledGraph.nodes.map((n) => n.nodeId);
      const allEdgeIds = assembledGraph.edges.map((e) => e.edgeId);
      const allRelationIds = assembledGraph.relations.map((r) => r.relationId);

      if (
        allNodeIds.length > 0 ||
        allEdgeIds.length > 0 ||
        allRelationIds.length > 0
      ) {
        const networkObservation: GraphIntelligenceNetworkObservation = {
          kind: "network",
          nodeIds: allNodeIds.length > 0 ? allNodeIds : undefined,
          edgeIds: allEdgeIds.length > 0 ? allEdgeIds : undefined,
          relationIds: allRelationIds.length > 0 ? allRelationIds : undefined,
        };
        networkObservations.push(networkObservation);
      }
    }

    // Compose result with explicit local vs network separation
    const result: GraphIntelligenceResult = {
      requestId,
      ...(localObservations.length > 0 && { local: { observations: localObservations } }),
      ...(networkObservations.length > 0 && { network: { observations: networkObservations } }),
    };

    return result;
  },
};
