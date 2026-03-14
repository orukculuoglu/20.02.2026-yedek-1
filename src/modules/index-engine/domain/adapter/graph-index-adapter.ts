import { IndexInput } from '../input/schemas/index-input';
import { IndexSubjectType } from '../enums/index-subject-type';
import type { GraphNode } from '../../../vehicle-intelligence-graph/domain/nodes/graph-node';
import type { GraphEdge } from '../../../vehicle-intelligence-graph/domain/edges/graph-edge';
import type { GraphSignal } from '../../../vehicle-intelligence-graph/domain/signal/graph-signal';
import type { GraphIndex } from '../../../vehicle-intelligence-graph/domain/index/graph-index';
import type { GraphQueryResult } from '../../../vehicle-intelligence-graph/domain/query/graph-query-result';
import { GraphIndexRefBuilder } from './graph-index-ref-builder';
import { GraphIndexEvidenceBuilder } from './graph-index-evidence-builder';
import { GraphIndexSnapshotBuilder } from './graph-index-snapshot-builder';
import { GraphIndexFeatureExtractor } from './graph-index-feature-extractor';

/**
 * GraphIndexAdapter transforms Vehicle Intelligence Graph artifacts into Index Engine inputs.
 * Provides deterministic, explainable conversion from Graph data to IndexInput schema.
 * 
 * DESIGN PRINCIPLES:
 * - Pure transformation: No side effects, no external I/O
 * - Deterministic: Same input always produces same output
 * - Traceable: All Index inputs linked to source Graph artifacts
 * - Resilient: Handles missing/incomplete Graph data gracefully
 * - Modular: Uses specialized builder components for refs, evidence, snapshots, features
 * 
 * WORKFLOW:
 * 1. Accept Graph artifacts (nodes, edges, signals, indices) + QueryResult context
 * 2. Extract features using GraphIndexFeatureExtractor (9 factors)
 * 3. Build evidence using GraphIndexEvidenceBuilder (8 types)
 * 4. Generate snapshot using GraphIndexSnapshotBuilder (freshness/coverage/completeness)
 * 5. Create refs using GraphIndexRefBuilder (traceability)
 * 6. Assemble IndexInput with all components + metadata
 * 
 * USAGE:
 * const input = GraphIndexAdapter.fromQuery(
 *   nodes, edges, signals, graphIndex, queryResult, vehicleId
 * );
 * // Pass input to IndexCalculator
 */
export class GraphIndexAdapter {
  /**
   * Transform complete Graph query result into IndexInput
   *
   * @param nodes - GraphNodes from query result
   * @param edges - GraphEdges from query result
   * @param signals - GraphSignals related to query
   * @param graphIndex - GraphIndex providing summaries
   * @param queryResult - GraphQueryResult metadata
   * @param vehicleId - Vehicle being indexed
   * @param capturedAt - Timestamp for snapshot
   * @returns IndexInput ready for index calculation
   */
  static fromQuery(
    nodes: GraphNode[],
    edges: GraphEdge[],
    signals: GraphSignal[],
    graphIndex: GraphIndex | undefined,
    queryResult: GraphQueryResult,
    vehicleId: string,
    capturedAt: Date = new Date(),
  ): IndexInput {
    return this.fromArtifacts(
      nodes,
      edges,
      signals,
      graphIndex,
      vehicleId,
      {
        queryId: queryResult.queryId,
        queryType: queryResult.queryType,
        matchedNodeCount: queryResult.matchedNodeIds.length,
        matchedEdgeCount: queryResult.matchedEdgeIds.length,
      },
      capturedAt,
      queryResult,
    );
  }

  /**
   * Transform Graph artifacts directly into IndexInput
   * Lower-level API when QueryResult context is not available
   */
  static fromArtifacts(
    nodes: GraphNode[],
    edges: GraphEdge[],
    signals: GraphSignal[],
    graphIndex: GraphIndex | undefined,
    vehicleId: string,
    context?: Record<string, unknown>,
    capturedAt: Date = new Date(),
    queryResult?: GraphQueryResult,
  ): IndexInput {
    // Gather observations
    const observedAt = this.getLatestTimestamp(nodes, edges, signals);

    // Extract features (9-factor model)
    const featureSet = GraphIndexFeatureExtractor.extract(nodes, edges, signals, graphIndex, capturedAt);

    // Build evidence (8 types)
    const evidence = this.buildEvidence(nodes, edges, signals, graphIndex, vehicleId);

    // Generate snapshot (freshness, coverage, completeness)
    const snapshot = GraphIndexSnapshotBuilder.combine(nodes, edges, signals, graphIndex, capturedAt);

    // Build refs (traceability)
    const refs = this.buildRefs(nodes, edges, signals, graphIndex, queryResult, vehicleId);

    // Calculate aggregated scores
    const trustScore = this.aggregateTrustScore(nodes);
    const provenanceScore = this.aggregateProvenanceScore(nodes);

    // Extract data quality indicator
    const dataQualityScore = this.calculateDataQualityScore(snapshot);

    // Count aggregates
    const eventCount = nodes.filter((n) =>
      String((n as unknown as Record<string, unknown>).nodeType ?? '').toLowerCase().includes('event'),
    ).length;

    const sourceCount = this.countUniqueSources(nodes);
    const intelligenceCount = nodes.length;
    const signalCount = signals.length;

    // Build validity windows
    const { validFrom, validTo } = this.calculateValidityWindows(nodes, edges);

    // Assemble IndexInput
    const input: IndexInput = {
      inputId: `${IndexSubjectType.VEHICLE}:${vehicleId}:${capturedAt.getTime()}`,
      subjectType: IndexSubjectType.VEHICLE,
      subjectId: vehicleId,
      observedAt,
      validAt: capturedAt,
      validFrom,
      validTo,
      eventCount,
      sourceCount,
      intelligenceCount,
      signalCount,
      trustScore,
      provenanceScore,
      dataQualityScore,
      refs,
      evidence,
      featureSet,
      snapshot,
      metadata: {
        ...context,
        adapter: 'GraphIndexAdapter',
        version: '1.0.0',
        nodeCount: nodes.length,
        edgeCount: edges.length,
        signalCount: signals.length,
        hasGraphIndex: !!graphIndex,
      },
    };

    return input;
  }

  /**
   * Build all evidence from Graph artifacts
   */
  private static buildEvidence(
    nodes: GraphNode[],
    edges: GraphEdge[],
    signals: GraphSignal[],
    graphIndex: GraphIndex | undefined,
    vehicleId: string,
  ) {
    const evidence = [];

    // Create signal evidence
    for (const signal of signals) {
      evidence.push(GraphIndexEvidenceBuilder.fromGraphSignal(signal));
    }

    // Create evidence from signal patterns
    const signalPatternEvidence = GraphIndexEvidenceBuilder.aggregateEvidenceFromSignals(signals, vehicleId);
    evidence.push(...signalPatternEvidence);

    // Create status evidence from GraphIndex
    if (graphIndex) {
      const summaries = ((graphIndex as unknown as Record<string, unknown>).summaries || {}) as Record<string, unknown>;
      const statusFields = ['eventCount', 'vehicleCount', 'sourceCount'];

      for (const field of statusFields) {
        if (summaries[field] !== undefined) {
          evidence.push(
            GraphIndexEvidenceBuilder.fromGraphIndexStatus(
              graphIndex,
              field,
              [(graphIndex as unknown as Record<string, unknown>).indexId as string],
            ),
          );
        }
      }
    }

    // Create node metadata evidence
    const sampleNodes = nodes.slice(0, Math.min(3, nodes.length));
    for (const node of sampleNodes) {
      if (node.metadata && Object.keys(node.metadata).length > 0) {
        const firstMetricKey = Object.keys(node.metadata)[0];
        evidence.push(GraphIndexEvidenceBuilder.fromNodeMetadata(node, firstMetricKey, [node.id]));
      }
    }

    return evidence;
  }

  /**
   * Build all refs from Graph artifacts
   */
  private static buildRefs(
    nodes: GraphNode[],
    edges: GraphEdge[],
    signals: GraphSignal[],
    graphIndex: GraphIndex | undefined,
    queryResult: GraphQueryResult | undefined,
    vehicleId: string,
  ) {
    const allRefs = [];

    // Add refs from nodes
    for (const node of nodes) {
      allRefs.push(GraphIndexRefBuilder.fromGraphNode(node));

      // Add provenance refs
      const provenanceRefs = GraphIndexRefBuilder.fromProvenance(node.provenance, vehicleId);
      allRefs.push(...provenanceRefs);
    }

    // Add refs from edges
    for (const edge of edges) {
      allRefs.push(GraphIndexRefBuilder.fromGraphEdge(edge));
    }

    // Add refs from signals
    for (const signal of signals) {
      allRefs.push(GraphIndexRefBuilder.fromGraphSignal(signal));
    }

    // Add refs from GraphIndex
    if (graphIndex) {
      allRefs.push(GraphIndexRefBuilder.fromGraphIndex(graphIndex));
    }

    // Add query result ref (if available)
    if (queryResult) {
      allRefs.push(GraphIndexRefBuilder.fromGraphQueryResult(queryResult));
    }

    // Deduplicate
    return GraphIndexRefBuilder.deduplicateRefs(allRefs);
  }

  /**
   * Calculate aggregated trust score from all nodes
   */
  private static aggregateTrustScore(nodes: GraphNode[]): number {
    if (nodes.length === 0) {
      return 0.5; // Default neutral
    }

    let totalTrust = 0;
    let countedNodes = 0;

    for (const node of nodes) {
      const trustValue = this.extractTrustValue(node.trust);
      if (trustValue !== null) {
        totalTrust += trustValue;
        countedNodes++;
      }
    }

    if (countedNodes === 0) {
      return 0.5;
    }

    return totalTrust / countedNodes;
  }

  /**
   * Calculate aggregated provenance score from all nodes
   */
  private static aggregateProvenanceScore(nodes: GraphNode[]): number {
    if (nodes.length === 0) {
      return 0.5;
    }

    let totalProvenance = 0;
    let countedNodes = 0;

    for (const node of nodes) {
      const provenanceValue = this.extractProvenanceValue(node.provenance);
      if (provenanceValue !== null) {
        totalProvenance += provenanceValue;
        countedNodes++;
      }
    }

    if (countedNodes === 0) {
      return 0.5;
    }

    return totalProvenance / countedNodes;
  }

  /**
   * Calculate data quality score from snapshot metrics
   */
  private static calculateDataQualityScore(snapshot: {
    freshnessSeconds: number;
    stale: boolean;
    missingDataFlags: string[];
    dataCompletenessPercent?: number;
  }): number {
    let score = 0.5;

    // Freshness component (40%)
    const freshnessComponent =
      snapshot.freshnessSeconds < 3600 ? 1.0 : snapshot.freshnessSeconds < 86400 ? 0.8 : 0.5;
    score += freshnessComponent * 0.4;

    // Completeness component (40%)
    const completenessPercent = snapshot.dataCompletenessPercent ?? 50;
    const completenessComponent = completenessPercent / 100;
    score += completenessComponent * 0.4;

    // Flag penalty (20%)
    const flagPenalty = Math.min(0.2, snapshot.missingDataFlags.length * 0.05);
    score -= flagPenalty;

    // Stale penalty
    if (snapshot.stale) {
      score *= 0.7; // 30% reduction for stale data
    }

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Count unique data sources
   */
  private static countUniqueSources(nodes: GraphNode[]): number {
    const sources = new Set<string>();

    for (const node of nodes) {
      const provenance = node.provenance as unknown as Record<string, unknown>;
      if (provenance) {
        if (provenance.source) {
          sources.add(String(provenance.source));
        }
        if (Array.isArray(provenance.sources)) {
          for (const source of provenance.sources as unknown[]) {
            sources.add(String(source));
          }
        }
      }
    }

    return sources.size;
  }

  /**
   * Get latest timestamp from all artifacts
   */
  private static getLatestTimestamp(
    nodes: GraphNode[],
    edges: GraphEdge[],
    signals: GraphSignal[],
  ): Date {
    const timestamps = [];

    for (const node of nodes) {
      timestamps.push(this.toMilliseconds(node.updatedAt || node.createdAt));
    }

    for (const edge of edges) {
      timestamps.push(this.toMilliseconds(edge.createdAt));
    }

    for (const signal of signals) {
      const signalRecord = signal as unknown as Record<string, unknown>;
      const generatedAt = signalRecord.generatedAt as Date;
      if (generatedAt) {
        timestamps.push(generatedAt.getTime());
      }
    }

    if (timestamps.length === 0) {
      return new Date();
    }

    return new Date(Math.max(...timestamps));
  }

  /**
   * Calculate validity windows from artifact temporal data
   */
  private static calculateValidityWindows(
    nodes: GraphNode[],
    edges: GraphEdge[],
  ): { validFrom: Date; validTo: Date } {
    const validFromDates: Date[] = [];
    const validToDates: Date[] = [];

    // Collect from nodes
    for (const node of nodes) {
      if (node.validFrom) validFromDates.push(this.toDate(node.validFrom));
      if (node.validTo) validToDates.push(this.toDate(node.validTo));
    }

    // Collect from edges
    for (const edge of edges) {
      if (edge.validFrom) validFromDates.push(this.toDate(edge.validFrom));
      if (edge.validTo) validToDates.push(this.toDate(edge.validTo));
    }

    let validFrom = new Date();
    let validTo = new Date();

    if (validFromDates.length > 0) {
      validFrom = new Date(Math.min(...validFromDates.map((d) => this.toMilliseconds(d))));
    }

    if (validToDates.length > 0) {
      validTo = new Date(Math.max(...validToDates.map((d) => this.toMilliseconds(d))));
    } else {
      // Default to 30 days from now
      validTo = new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000);
    }

    return { validFrom, validTo };
  }

  /**
   * Convert date to milliseconds safely (handles Date | string)
   */
  private static toMilliseconds(date: Date | string | undefined): number {
    if (!date) return 0;
    if (typeof date === 'string') return new Date(date).getTime();
    return (date as Date).getTime();
  }

  /**
   * Convert value to Date safely (handles Date | string)
   */
  private static toDate(date: Date | string | undefined, defaultDate: Date = new Date()): Date {
    if (!date) return defaultDate;
    if (typeof date === 'string') return new Date(date);
    return date as Date;
  }

  /**
   * Extract normalized trust value
   */
  private static extractTrustValue(trust: Record<string, unknown> | unknown): number | null {
    if (!trust || typeof trust !== 'object') {
      return null;
    }

    const trustRecord = trust as Record<string, unknown>;

    if (typeof trustRecord.score === 'number') {
      return Math.max(0, Math.min(1, trustRecord.score / 100));
    }

    if (typeof trustRecord.level === 'number') {
      return Math.max(0, Math.min(1, trustRecord.level));
    }

    if (typeof trustRecord.confidence === 'number') {
      return Math.max(0, Math.min(1, trustRecord.confidence));
    }

    if (typeof trustRecord.value === 'number') {
      return Math.max(0, Math.min(1, trustRecord.value));
    }

    return null;
  }

  /**
   * Extract normalized provenance value
   */
  private static extractProvenanceValue(provenance: Record<string, unknown> | unknown): number | null {
    if (!provenance || typeof provenance !== 'object') {
      return null;
    }

    const provenanceRecord = provenance as Record<string, unknown>;
    let score = 0.5;
    let hasData = false;

    if (provenanceRecord.source) {
      score += 0.1;
      hasData = true;
    }

    if (Array.isArray(provenanceRecord.sources) && (provenanceRecord.sources as unknown[]).length > 0) {
      score = Math.min(1.0, score + 0.15);
      hasData = true;
    }

    if (provenanceRecord.chain || provenanceRecord.lineage || provenanceRecord.parent) {
      score = Math.min(1.0, score + 0.1);
      hasData = true;
    }

    return hasData ? score : null;
  }
}
