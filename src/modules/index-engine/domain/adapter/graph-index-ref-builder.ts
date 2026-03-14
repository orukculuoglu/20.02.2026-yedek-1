import { IndexInputRef } from '../input/schemas/index-input-ref';
import { RefType } from '../input/enums/ref-type';
import { RelationType } from '../input/enums/relation-type';
import type { GraphNode } from '../../../vehicle-intelligence-graph/domain/nodes/graph-node';
import type { GraphEdge } from '../../../vehicle-intelligence-graph/domain/edges/graph-edge';
import type { GraphSignal } from '../../../vehicle-intelligence-graph/domain/signal/graph-signal';
import type { GraphIndex } from '../../../vehicle-intelligence-graph/domain/index/graph-index';
import type { GraphQueryResult } from '../../../vehicle-intelligence-graph/domain/query/graph-query-result';

/**
 * GraphIndexRefBuilder creates deterministic traceability references from Graph artifacts.
 * Links Index inputs to their source evidence in the Vehicle Intelligence Graph.
 * 
 * Responsibility:
 * - Convert GraphNode/Edge/Signal/Index into IndexInputRef objects
 * - Determine appropriate RelationType based on context
 * - Create refs for the QueryResult level
 * - Track data source mappings from provenance
 */
export class GraphIndexRefBuilder {
  /**
   * Create IndexInputRef from a GraphNode
   */
  static fromGraphNode(node: GraphNode, relationType: RelationType = RelationType.DIRECT): IndexInputRef {
    return {
      refType: RefType.GRAPH_NODE,
      refId: node.id,
      sourceModule: 'vehicle-intelligence-graph',
      relationType,
      observedAt: GraphIndexRefBuilder.toDate(node.updatedAt || node.createdAt),
      metadata: {
        nodeType: (node as unknown as Record<string, unknown>).nodeType,
        vehicleId: node.vehicleId,
        context: node.context,
      },
    };
  }

  /**
   * Create IndexInputRef from a GraphEdge
   */
  static fromGraphEdge(edge: GraphEdge, relationType: RelationType = RelationType.CONTEXTUAL): IndexInputRef {
    return {
      refType: RefType.GRAPH_EDGE,
      refId: edge.id,
      sourceModule: 'vehicle-intelligence-graph',
      relationType,
      observedAt: GraphIndexRefBuilder.toDate(edge.createdAt),
      metadata: {
        edgeType: (edge as unknown as Record<string, unknown>).edgeType,
        fromNodeId: (edge as unknown as Record<string, unknown>).fromNodeId,
        toNodeId: (edge as unknown as Record<string, unknown>).toNodeId,
        vehicleId: edge.vehicleId,
        context: edge.context,
      },
    };
  }

  /**
   * Create IndexInputRef from a GraphSignal
   */
  static fromGraphSignal(signal: GraphSignal, relationType: RelationType = RelationType.DIRECT): IndexInputRef {
    return {
      refType: RefType.GRAPH_SIGNAL,
      refId: (signal as unknown as Record<string, unknown>).signalId as string,
      sourceModule: 'vehicle-intelligence-graph',
      relationType,
      observedAt: (signal as unknown as Record<string, unknown>).generatedAt as Date,
      metadata: {
        signalType: (signal as unknown as Record<string, unknown>).signalType,
        severity: (signal as unknown as Record<string, unknown>).severity,
        confidence: (signal as unknown as Record<string, unknown>).confidence,
        vehicleId: (signal as unknown as Record<string, unknown>).vehicleId,
        explanation: (signal as unknown as Record<string, unknown>).explanation,
      },
    };
  }

  /**
   * Create IndexInputRef from a GraphIndex
   */
  static fromGraphIndex(index: GraphIndex, relationType: RelationType = RelationType.CONTEXTUAL): IndexInputRef {
    const indexRecord = index as unknown as Record<string, unknown>;
    return {
      refType: RefType.GRAPH_INDEX,
      refId: indexRecord.indexId as string,
      sourceModule: 'vehicle-intelligence-graph',
      relationType,
      observedAt: indexRecord.createdAt as Date,
      metadata: {
        indexType: indexRecord.indexType,
        vehicleId: indexRecord.vehicleId,
        nodeCount: (indexRecord.nodeIds as string[])?.length ?? 0,
        edgeCount: (indexRecord.edgeIds as string[])?.length ?? 0,
        context: indexRecord.context,
      },
    };
  }

  /**
   * Create IndexInputRef from a GraphQueryResult
   */
  static fromGraphQueryResult(result: GraphQueryResult): IndexInputRef {
    return {
      refType: RefType.CALCULATION,
      refId: result.queryId,
      sourceModule: 'vehicle-intelligence-graph',
      relationType: RelationType.DIRECT,
      observedAt: new Date(),
      metadata: {
        queryType: result.queryType,
        vehicleId: result.vehicleId,
        matchedNodeCount: result.matchedNodeIds.length,
        matchedEdgeCount: result.matchedEdgeIds.length,
        resultCount: result.resultCount,
      },
    };
  }

  /**
   * Extract data source refs from Graph provenance
   * Creates DATA_SOURCE refs for traceability
   */
  static fromProvenance(
    provenance: Record<string, unknown>,
    vehicleId: string,
    relationType: RelationType = RelationType.CAUSATIVE,
  ): IndexInputRef[] {
    const refs: IndexInputRef[] = [];

    if (!provenance) {
      return refs;
    }

    // Common provenance patterns
    if (provenance.source) {
      refs.push({
        refType: RefType.DATA_SOURCE,
        refId: String(provenance.source),
        sourceModule: 'vehicle-intelligence-graph',
        relationType,
        observedAt: new Date(),
        metadata: {
          vehicleId,
          provenanceSource: provenance.source,
        },
      });
    }

    if (provenance.sources && Array.isArray(provenance.sources)) {
      for (const source of provenance.sources as unknown[]) {
        refs.push({
          refType: RefType.DATA_SOURCE,
          refId: String(source),
          sourceModule: 'vehicle-intelligence-graph',
          relationType,
          observedAt: new Date(),
          metadata: {
            vehicleId,
            provenanceSource: source,
          },
        });
      }
    }

    return refs;
  }

  /**
   * Aggregate refs from multiple sources into a deduplicated set
   */
  static deduplicateRefs(refs: IndexInputRef[]): IndexInputRef[] {
    const refMap = new Map<string, IndexInputRef>();

    for (const ref of refs) {
      const key = `${ref.refType}:${ref.refId}`;
      if (!refMap.has(key)) {
        refMap.set(key, ref);
      }
    }

    return Array.from(refMap.values());
  }

  /**
   * Convert value to Date safely (handles Date | string)
   */
  private static toDate(date: Date | string | undefined, defaultDate: Date = new Date()): Date {
    if (!date) return defaultDate;
    if (typeof date === 'string') return new Date(date);
    return date as Date;
  }
}
