/**
 * Graph Structural Integrity Evaluator
 * Minimal deterministic structural integrity assessment service.
 * Evaluates assembled graph structure for defects after assembly.
 * No semantic validation, no traversal, no graph intelligence.
 */

import type { AssembledNetworkGraph } from "../entities/assembled-network-graph.entity.ts";
import type { GraphStructuralIntegrityResult } from "../contracts/graph-structural-integrity-result.contract.ts";
import type { GraphStructuralIntegrityIssue } from "../contracts/graph-structural-integrity-issue.contract.ts";
import { GraphStructuralIntegrityIssueCode } from "../contracts/graph-structural-integrity-issue-code.contract.ts";
import { GraphStructuralIntegrityIssueSeverity } from "../contracts/graph-structural-integrity-issue-severity.contract.ts";

/**
 * StandardGraphStructuralIntegrityEvaluator
 * Minimal deterministic structural integrity evaluator.
 * Performs only explicit structural checks: duplicates, missing references, empty state.
 * No validation of business rules, no semantic interpretation, no graph navigation.
 * Deterministic: same input always produces same output.
 */
export const standardGraphStructuralIntegrityEvaluator = {
  /**
   * Evaluate structural integrity of an assembled graph.
   * Checks for duplicate identifiers, missing node references, and empty state.
   * Returns explicit list of detected structural issues.
   *
   * Checks performed:
   * 1. Empty graph (no nodes, edges, relations)
   * 2. Duplicate node identifiers
   * 3. Duplicate edge identifiers
   * 4. Duplicate relation identifiers
   * 5. Edge sourceNodeId exists in nodes collection
   * 6. Edge targetNodeId exists in nodes collection
   *
   * @param graph - Assembled network graph to evaluate
   * @returns Structural integrity result with detected issues
   */
  evaluate(graph: AssembledNetworkGraph): GraphStructuralIntegrityResult {
    const issues: GraphStructuralIntegrityIssue[] = [];

    // Check 1: Graph completely empty
    if (graph.nodes.length === 0 && graph.edges.length === 0 && graph.relations.length === 0) {
      issues.push({
        code: GraphStructuralIntegrityIssueCode.GRAPH_EMPTY,
        severity: GraphStructuralIntegrityIssueSeverity.INFO,
        message: "Graph is empty: contains no nodes, edges, or relations.",
      });
    }

    // Check 2: Duplicate node identifiers
    const nodeIds = new Set<string>();
    const duplicateNodeIds = new Set<string>();
    for (const node of graph.nodes) {
      if (nodeIds.has(node.nodeId)) {
        duplicateNodeIds.add(node.nodeId);
      }
      nodeIds.add(node.nodeId);
    }
    for (const duplicateId of duplicateNodeIds) {
      issues.push({
        code: GraphStructuralIntegrityIssueCode.DUPLICATE_NODE_ID,
        severity: GraphStructuralIntegrityIssueSeverity.ERROR,
        message: `Duplicate node identifier: ${duplicateId}`,
        relatedEntityId: duplicateId,
        relatedEntityType: "node",
      });
    }

    // Check 3: Duplicate edge identifiers
    const edgeIds = new Set<string>();
    const duplicateEdgeIds = new Set<string>();
    for (const edge of graph.edges) {
      if (edgeIds.has(edge.edgeId)) {
        duplicateEdgeIds.add(edge.edgeId);
      }
      edgeIds.add(edge.edgeId);
    }
    for (const duplicateId of duplicateEdgeIds) {
      issues.push({
        code: GraphStructuralIntegrityIssueCode.DUPLICATE_EDGE_ID,
        severity: GraphStructuralIntegrityIssueSeverity.ERROR,
        message: `Duplicate edge identifier: ${duplicateId}`,
        relatedEntityId: duplicateId,
        relatedEntityType: "edge",
      });
    }

    // Check 4: Duplicate relation identifiers
    const relationIds = new Set<string>();
    const duplicateRelationIds = new Set<string>();
    for (const relation of graph.relations) {
      if (relationIds.has(relation.relationId)) {
        duplicateRelationIds.add(relation.relationId);
      }
      relationIds.add(relation.relationId);
    }
    for (const duplicateId of duplicateRelationIds) {
      issues.push({
        code: GraphStructuralIntegrityIssueCode.DUPLICATE_RELATION_ID,
        severity: GraphStructuralIntegrityIssueSeverity.ERROR,
        message: `Duplicate relation identifier: ${duplicateId}`,
        relatedEntityId: duplicateId,
        relatedEntityType: "relation",
      });
    }

    // Check 5 & 6: Edge node references exist in nodes collection
    for (const edge of graph.edges) {
      const sourceNodeExists = graph.nodes.some((node) => node.nodeId === edge.sourceNodeId);
      if (!sourceNodeExists) {
        issues.push({
          code: GraphStructuralIntegrityIssueCode.EDGE_SOURCE_NODE_MISSING,
          severity: GraphStructuralIntegrityIssueSeverity.ERROR,
          message: `Edge references missing source node: edge=${edge.edgeId}, sourceNodeId=${edge.sourceNodeId}`,
          relatedEntityId: edge.sourceNodeId,
          relatedEntityType: "node",
        });
      }

      const targetNodeExists = graph.nodes.some((node) => node.nodeId === edge.targetNodeId);
      if (!targetNodeExists) {
        issues.push({
          code: GraphStructuralIntegrityIssueCode.EDGE_TARGET_NODE_MISSING,
          severity: GraphStructuralIntegrityIssueSeverity.ERROR,
          message: `Edge references missing target node: edge=${edge.edgeId}, targetNodeId=${edge.targetNodeId}`,
          relatedEntityId: edge.targetNodeId,
          relatedEntityType: "node",
        });
      }
    }

    // Count issues by severity
    const errorCount = issues.filter((issue) => issue.severity === GraphStructuralIntegrityIssueSeverity.ERROR).length;
    const warningCount = issues.filter((issue) => issue.severity === GraphStructuralIntegrityIssueSeverity.WARNING).length;
    const issueCount = issues.length;

    // Determine structural validity: valid if no ERROR-severity issues
    const isStructurallyValid = errorCount === 0;

    return {
      isStructurallyValid,
      issues,
      issueCount,
      errorCount,
      warningCount,
    };
  },
};
