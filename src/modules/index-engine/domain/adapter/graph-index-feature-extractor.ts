import { IndexInputFeatureSet } from '../input/schemas/index-input-feature-set';
import type { GraphNode } from '../../../vehicle-intelligence-graph/domain/nodes/graph-node';
import type { GraphEdge } from '../../../vehicle-intelligence-graph/domain/edges/graph-edge';
import type { GraphSignal } from '../../../vehicle-intelligence-graph/domain/signal/graph-signal';
import type { GraphIndex } from '../../../vehicle-intelligence-graph/domain/index/graph-index';

/**
 * GraphIndexFeatureExtractor derives the 9 normalized calculator-ready features from Graph artifacts.
 * Performs deterministic transformations to extract features for index calculations.
 * 
 * Responsibility:
 * - Extract repeatedFailureCount from signal patterns
 * - Calculate maintenanceDelayDays from temporal gaps
 * - Count unresolvedSignalCount from active signals
 * - Derive sourceDiversity from unique sources
 * - Calculate eventRecencyScore from timestamps
 * - Extract trustWeightedEvidenceScore from graph trust metrics
 * - Derive provenanceStrength from graph provenance
 * - Calculate utilizationRate from edge patterns
 * - Determine entityAgeInDays from node creation
 */
export class GraphIndexFeatureExtractor {
  /**
   * Extract complete feature set from Graph artifacts
   */
  static extract(
    nodes: GraphNode[],
    edges: GraphEdge[],
    signals: GraphSignal[],
    index: GraphIndex | undefined,
    now: Date = new Date(),
  ): IndexInputFeatureSet {
    return {
      repeatedFailureCount: this.extractRepeatedFailureCount(signals),
      maintenanceDelayDays: this.extractMaintenanceDelayDays(nodes),
      unresolvedSignalCount: this.extractUnresolvedSignalCount(signals),
      sourceDiversity: this.extractSourceDiversity(nodes),
      eventRecencyScore: this.extractEventRecencyScore(nodes, now),
      trustWeightedEvidenceScore: this.extractTrustWeightedEvidenceScore(nodes),
      provenanceStrength: this.extractProvenanceStrength(nodes),
      utilizationRate: this.extractUtilizationRate(edges, nodes),
      entityAgeInDays: this.extractEntityAgeInDays(nodes, now),
    };
  }

  /**
   * Extract repeatedFailureCount from signal patterns
   * Identifies recurring failure signals indicating systemic issues
   */
  static extractRepeatedFailureCount(signals: GraphSignal[]): number {
    if (signals.length === 0) {
      return 0;
    }

    // Count high-severity signals (critical + high)
    let failureCount = 0;
    for (const signal of signals) {
      const signalRecord = signal as unknown as Record<string, unknown>;
      const severity = String(signalRecord.severity ?? '').toLowerCase();

      if (severity === 'critical' || severity === 'high') {
        failureCount++;
      }
    }

    // Look for repeating patterns (same signal type appearing multiple times)
    const signalsByType = new Map<string, number>();
    for (const signal of signals) {
      const signalRecord = signal as unknown as Record<string, unknown>;
      const signalType = String(signalRecord.signalType ?? 'unknown');

      signalsByType.set(signalType, (signalsByType.get(signalType) ?? 0) + 1);
    }

    // Add count for signals appearing more than once (repeated)
    for (const count of signalsByType.values()) {
      if (count > 1) {
        failureCount += count - 1; // Count repeats, not first occurrence
      }
    }

    return failureCount;
  }

  /**
   * Extract maintenanceDelayDays from temporal gaps
   * Identifies period since last maintenance action
   */
  static extractMaintenanceDelayDays(nodes: GraphNode[], now: Date = new Date()): number {
    // Look for maintenance-related nodes
    const maintenanceNodes = nodes.filter((n) => {
      const nodeRecord = n as unknown as Record<string, unknown>;
      const nodeType = String(nodeRecord.nodeType ?? '').toLowerCase();
      return nodeType.includes('maintenance') || nodeType.includes('service') || nodeType.includes('repair');
    });

    if (maintenanceNodes.length === 0) {
      return 0; // No maintenance nodes found, no delay
    }

    // Find most recent maintenance action
    const mostRecent = maintenanceNodes.reduce((acc, current) => {
      const currentTime = GraphIndexFeatureExtractor.toMilliseconds(current.updatedAt || current.createdAt);
      const accTime = GraphIndexFeatureExtractor.toMilliseconds(acc.updatedAt || acc.createdAt);
      return currentTime > accTime ? current : acc;
    });

    const timeSinceLastMaintenance = now.getTime() - GraphIndexFeatureExtractor.toMilliseconds(mostRecent.updatedAt || mostRecent.createdAt);
    return Math.max(0, timeSinceLastMaintenance / (1000 * 60 * 60 * 24)); // Convert to days
  }

  /**
   * Extract unresolvedSignalCount from active signals
   * Counts signals that haven't been resolved
   */
  static extractUnresolvedSignalCount(signals: GraphSignal[]): number {
    // Assume signals without explicit resolution status are unresolved
    let unresolved = 0;

    for (const signal of signals) {
      const signalRecord = signal as unknown as Record<string, unknown>;
      const status = signalRecord.status || signalRecord.resolved || signalRecord.closed;

      // If no status/resolved/closed field present or if status != resolved/closed, count as unresolved
      if (!status || status === false || String(status).toLowerCase() !== 'resolved') {
        unresolved++;
      }
    }

    return unresolved;
  }

  /**
   * Extract sourceDiversity from unique sources
   * Higher diversity (0.0-1.0) indicates data from multiple independent sources
   */
  static extractSourceDiversity(nodes: GraphNode[]): number {
    if (nodes.length === 0) {
      return 0;
    }

    // Extract all unique provenance sources
    const uniqueSources = new Set<string>();

    for (const node of nodes) {
      const provenance = node.provenance as unknown as Record<string, unknown>;
      if (provenance) {
        // Add direct source
        if (provenance.source) {
          uniqueSources.add(String(provenance.source));
        }

        // Add all sources in array
        if (Array.isArray(provenance.sources)) {
          for (const source of provenance.sources as unknown[]) {
            uniqueSources.add(String(source));
          }
        }

        // Add system/module info
        if (provenance.system) {
          uniqueSources.add(String(provenance.system));
        }
      }

      // Also check metadata for source info
      const metadata = node.metadata as unknown as Record<string, unknown>;
      if (metadata && metadata.sourceId) {
        uniqueSources.add(String(metadata.sourceId));
      }
    }

    // Normalize: max realistically 5-10 sources, cap at 1.0
    const maxExpectedSources = 10;
    return Math.min(1.0, uniqueSources.size / maxExpectedSources);
  }

  /**
   * Extract eventRecencyScore (0.0-1.0)
   * 1.0 = very recent (< 1 day), 0.0 = very old (> 90 days)
   */
  static extractEventRecencyScore(nodes: GraphNode[], now: Date = new Date()): number {
    if (nodes.length === 0) {
      return 0;
    }

    // Use most recent node timestamp
    const latestTimestamp = Math.max(...nodes.map((n) => GraphIndexFeatureExtractor.toMilliseconds(n.updatedAt || n.createdAt)));

    const ageMs = now.getTime() - latestTimestamp;
    const ageDays = ageMs / (1000 * 60 * 60 * 24);

    // Scoring: 0 days = 1.0, 90+ days = 0.0, linear in between
    if (ageDays <= 0) {
      return 1.0;
    } else if (ageDays >= 90) {
      return 0.0;
    } else {
      return 1.0 - (ageDays / 90) * 0.9; // Stay slightly above 0.0 for very old data
    }
  }

  /**
   * Extract trustWeightedEvidenceScore (0.0-1.0)
   * Aggregate trust metric from all graph nodes
   */
  static extractTrustWeightedEvidenceScore(nodes: GraphNode[]): number {
    if (nodes.length === 0) {
      return 0;
    }

    let totalTrust = 0;
    let countedNodes = 0;

    for (const node of nodes) {
      const trustScore = this.extractTrustValue(node.trust);
      if (trustScore !== null) {
        totalTrust += trustScore;
        countedNodes++;
      }
    }

    if (countedNodes === 0) {
      // Default: assume moderate trust if no trust data
      return 0.5;
    }

    const averageTrust = totalTrust / countedNodes;

    // Weight by node count (more nodes with trust = more weight)
    const nodeWeighting = Math.min(1.0, countedNodes / 20); // 20+ nodes gets full weight
    return averageTrust * 0.7 + nodeWeighting * 0.3;
  }

  /**
   * Extract provenanceStrength (0.0-1.0)
   * Measures depth and reliability of data lineage
   */
  static extractProvenanceStrength(nodes: GraphNode[]): number {
    if (nodes.length === 0) {
      return 0;
    }

    let totalProvenance = 0;
    let countedNodes = 0;

    for (const node of nodes) {
      const provenanceScore = this.extractProvenanceValue(node.provenance);
      if (provenanceScore !== null) {
        totalProvenance += provenanceScore;
        countedNodes++;
      }
    }

    if (countedNodes === 0) {
      return 0.5; // Default moderate provenance
    }

    return totalProvenance / countedNodes;
  }

  /**
   * Extract utilizationRate (0.0-1.0)
   * Derived from edge density and relationship patterns
   * 1.0 = highly connected (many relationships), 0.0 = isolated
   */
  static extractUtilizationRate(edges: GraphEdge[], nodes: GraphNode[]): number {
    if (nodes.length === 0) {
      return 0;
    }

    // Calculate edge density: actual edges / potential edges
    const maxPossibleEdges = nodes.length * (nodes.length - 1) / 2; // Undirected graph

    if (maxPossibleEdges === 0) {
      return 0;
    }

    const actualEdges = edges.length;
    const density = actualEdges / maxPossibleEdges;

    // Normalize to 0.0-1.0 range (cap high density at 1.0)
    return Math.min(1.0, density * 10); // Multiply by 10 to spread the range
  }

  /**
   * Extract entityAgeInDays
   * Time since entity (vehicle) was created in the graph
   */
  static extractEntityAgeInDays(nodes: GraphNode[], now: Date = new Date()): number {
    if (nodes.length === 0) {
      return 0;
    }

    // Find the earliest node creation time (vehicle inception)
    const earliestCreation = Math.min(...nodes.map((n) => GraphIndexFeatureExtractor.toMilliseconds(n.createdAt)));

    const ageMs = now.getTime() - earliestCreation;
    return Math.max(0, ageMs / (1000 * 60 * 60 * 24)); // Convert to days
  }

  /**
   * Extract normalized trust value from trust record
   * Returns 0.0-1.0 or null if no trust data
   */
  private static extractTrustValue(trust: Record<string, unknown> | unknown): number | null {
    if (!trust || typeof trust !== 'object') {
      return null;
    }

    const trustRecord = trust as Record<string, unknown>;

    // Try common trust field patterns
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

    // As fallback, count non-empty fields as indicator
    const fields = Object.values(trustRecord).filter((v) => v !== null && v !== undefined && v !== '');
    return fields.length > 0 ? 0.7 : null;
  }

  /**
   * Extract normalized provenance value from provenance record
   * Returns 0.0-1.0 or null if no provenance data
   */
  private static extractProvenanceValue(provenance: Record<string, unknown> | unknown): number | null {
    if (!provenance || typeof provenance !== 'object') {
      return null;
    }

    const provenanceRecord = provenance as Record<string, unknown>;
    let score = 0.5; // Start at neutral
    let hasData = false;

    // Source information
    if (provenanceRecord.source) {
      score += 0.1;
      hasData = true;
    }

    // Source array indicates multiple sources
    if (Array.isArray(provenanceRecord.sources) && (provenanceRecord.sources as unknown[]).length > 0) {
      score = Math.min(1.0, score + 0.15);
      hasData = true;
    }

    // Chain or lineage information
    if (provenanceRecord.chain || provenanceRecord.lineage || provenanceRecord.parent) {
      score = Math.min(1.0, score + 0.1);
      hasData = true;
    }

    // Timestamp information
    if (provenanceRecord.createdAt || provenanceRecord.timestamp) {
      score = Math.min(1.0, score + 0.05);
      hasData = true;
    }

    // System/module information
    if (provenanceRecord.system || provenanceRecord.module) {
      score = Math.min(1.0, score + 0.05);
      hasData = true;
    }

    return hasData ? score : null;
  }

  /**
   * Convert date to milliseconds safely (handles Date | string)
   */
  private static toMilliseconds(date: Date | string | undefined): number {
    if (!date) return 0;
    if (typeof date === 'string') return new Date(date).getTime();
    return (date as Date).getTime();
  }
}
