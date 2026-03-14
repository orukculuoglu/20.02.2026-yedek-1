import { IndexInputSnapshot } from '../input/schemas/index-input-snapshot';
import type { GraphNode } from '../../../vehicle-intelligence-graph/domain/nodes/graph-node';
import type { GraphEdge } from '../../../vehicle-intelligence-graph/domain/edges/graph-edge';
import type { GraphSignal } from '../../../vehicle-intelligence-graph/domain/signal/graph-signal';
import type { GraphIndex } from '../../../vehicle-intelligence-graph/domain/index/graph-index';

/**
 * GraphIndexSnapshotBuilder generates deterministic freshness and completeness metadata.
 * Captures the time-aware ingestion state of Graph artifacts.
 * 
 * Responsibility:
 * - Calculate freshness from latest graph timestamps
 * - Determine temporal coverage from validFrom/validTo windows
 * - Track data completeness metrics
 * - Detect stale data conditions
 * - Generate snapshot metadata
 */
export class GraphIndexSnapshotBuilder {
  private static readonly STALE_THRESHOLD_SECONDS = 7 * 24 * 60 * 60; // 7 days

  /**
   * Build snapshot from a collection of GraphNodes
   */
  static fromGraphNodes(nodes: GraphNode[], capturedAt: Date = new Date()): IndexInputSnapshot {
    return {
      snapshotId: this.generateSnapshotId(),
      capturedAt,
      freshnessSeconds: this.calculateFreshnessFromNodes(nodes, capturedAt),
      temporalCoverage: this.calculateTemporalCoverageFromNodes(nodes),
      stale: this.isStaleFromNodes(nodes, capturedAt),
      missingDataFlags: this.detectMissingDataFromNodes(nodes),
      totalDataPoints: nodes.length,
      dataCompletenessPercent: this.calculateCompletenessFromNodes(nodes),
    };
  }

  /**
   * Build snapshot from a GraphIndex summary
   */
  static fromGraphIndex(index: GraphIndex, capturedAt: Date = new Date()): IndexInputSnapshot {
    const indexRecord = index as unknown as Record<string, unknown>;
    const summaries = (indexRecord.summaries || {}) as Record<string, unknown>;

    return {
      snapshotId: this.generateSnapshotId(),
      capturedAt,
      freshnessSeconds: this.calculateFreshnessFromIndex(index, capturedAt),
      temporalCoverage: this.calculateTemporalCoverageFromIndex(index),
      stale: this.isStaleFromIndex(index, capturedAt),
      missingDataFlags: this.detectMissingDataFromIndex(index),
      totalDataPoints: (summaries.eventCount as number) ?? 0,
      dataCompletenessPercent: this.calculateCompletenessFromIndex(index),
    };
  }

  /**
   * Build combined snapshot from multiple artifact types
   */
  static combine(
    nodes: GraphNode[],
    edges: GraphEdge[],
    signals: GraphSignal[],
    index: GraphIndex | undefined,
    capturedAt: Date = new Date(),
  ): IndexInputSnapshot {
    const snapshots = [
      this.fromGraphNodes(nodes, capturedAt),
      index ? this.fromGraphIndex(index, capturedAt) : null,
    ].filter((s) => s !== null) as IndexInputSnapshot[];

    if (snapshots.length === 0) {
      return {
        snapshotId: this.generateSnapshotId(),
        capturedAt,
        freshnessSeconds: Infinity,
        temporalCoverage: 'unknown',
        stale: true,
        missingDataFlags: ['no-data-available'],
        totalDataPoints: 0,
        dataCompletenessPercent: 0,
      };
    }

    if (snapshots.length === 1) {
      return snapshots[0];
    }

    // Merge multiple snapshots (prefer freshest, most complete)
    return {
      snapshotId: this.generateSnapshotId(),
      capturedAt,
      freshnessSeconds: Math.min(...snapshots.map((s) => s.freshnessSeconds)),
      temporalCoverage: snapshots.map((s) => s.temporalCoverage).join(' + '),
      stale: snapshots.some((s) => s.stale),
      missingDataFlags: Array.from(new Set(snapshots.flatMap((s) => s.missingDataFlags))),
      totalDataPoints: snapshots.reduce((sum, s) => sum + (s.totalDataPoints ?? 0), 0),
      dataCompletenessPercent:
        snapshots.reduce((sum, s) => sum + (s.dataCompletenessPercent ?? 0), 0) / snapshots.length,
    };
  }

  /**
   * Calculate freshness in seconds (time since latest update)
   */
  private static calculateFreshnessFromNodes(nodes: GraphNode[], capturedAt: Date): number {
    if (nodes.length === 0) {
      return Infinity;
    }

    const latestTimestamp = Math.max(
      ...nodes.map((n) => GraphIndexSnapshotBuilder.toMilliseconds(n.updatedAt || n.createdAt)),
    );

    return Math.max(0, (capturedAt.getTime() - latestTimestamp) / 1000);
  }

  /**
   * Calculate freshness from GraphIndex
   */
  private static calculateFreshnessFromIndex(index: GraphIndex, capturedAt: Date): number {
    const indexRecord = index as unknown as Record<string, unknown>;
    const createdAt = new Date(indexRecord.createdAt as string | Date);
    return Math.max(0, (capturedAt.getTime() - createdAt.getTime()) / 1000);
  }

  /**
   * Calculate temporal coverage description from node validity windows
   */
  private static calculateTemporalCoverageFromNodes(nodes: GraphNode[]): string {
    if (nodes.length === 0) {
      return 'unknown';
    }

    const validFromDates = nodes.map((n) => n.validFrom).filter((d) => d);
    const validToDates = nodes.map((n) => n.validTo).filter((d) => d);

    if (validFromDates.length === 0 || validToDates.length === 0) {
      return 'unrestricted';
    }

    const earliest = new Date(
      Math.min(...validFromDates.map((d) => this.toMilliseconds(d))),
    );
    const latest = new Date(
      Math.max(...validToDates.map((d) => this.toMilliseconds(d))),
    );

    const daysOfCoverage = (latest.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24);

    if (daysOfCoverage < 1) {
      return 'last hour';
    } else if (daysOfCoverage < 7) {
      return `last ${Math.round(daysOfCoverage)} days`;
    } else if (daysOfCoverage < 30) {
      return `last ${Math.round(daysOfCoverage / 7)} weeks`;
    } else {
      return `last ${Math.round(daysOfCoverage / 30)} months`;
    }
  }

  /**
   * Calculate temporal coverage from GraphIndex
   */
  private static calculateTemporalCoverageFromIndex(index: GraphIndex): string {
    const indexRecord = index as unknown as Record<string, unknown>;
    const timeRange = indexRecord.timeRange as { start?: Date | string; end?: Date | string };

    if (!timeRange || !timeRange.start || !timeRange.end) {
      return 'unknown';
    }

    const start = this.toDate(timeRange.start);
    const end = this.toDate(timeRange.end);
    const daysOfCoverage = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

    if (daysOfCoverage < 1) {
      return 'last hour';
    } else if (daysOfCoverage < 7) {
      return `last ${Math.round(daysOfCoverage)} days`;
    } else if (daysOfCoverage < 30) {
      return `last ${Math.round(daysOfCoverage / 7)} weeks`;
    } else {
      return `last ${Math.round(daysOfCoverage / 30)} months`;
    }
  }

  /**
   * Determine if snapshot is stale (older than threshold)
   */
  private static isStaleFromNodes(nodes: GraphNode[], capturedAt: Date): boolean {
    const freshness = this.calculateFreshnessFromNodes(nodes, capturedAt);
    return freshness > this.STALE_THRESHOLD_SECONDS;
  }

  /**
   * Determine if GraphIndex is stale
   */
  private static isStaleFromIndex(index: GraphIndex, capturedAt: Date): boolean {
    const freshness = this.calculateFreshnessFromIndex(index, capturedAt);
    return freshness > this.STALE_THRESHOLD_SECONDS;
  }

  /**
   * Detect missing or problematic data flags
   */
  private static detectMissingDataFromNodes(nodes: GraphNode[]): string[] {
    const flags: string[] = [];

    if (nodes.length === 0) {
      flags.push('no-graph-nodes');
    }

    // Check for incomplete context
    const nodesWithoutContext = nodes.filter((n) => !n.context || Object.keys(n.context).length === 0);
    if (nodesWithoutContext.length > nodes.length * 0.5) {
      flags.push('incomplete-context');
    }

    // Check for incomplete metadata
    const nodesWithoutMetadata = nodes.filter((n) => !n.metadata || Object.keys(n.metadata).length === 0);
    if (nodesWithoutMetadata.length > nodes.length * 0.5) {
      flags.push('incomplete-metadata');
    }

    // Check for low trust scores
    const lowTrustNodes = nodes.filter((n) => {
      const trust = n.trust as unknown as Record<string, unknown>;
      return !trust || (typeof trust === 'object' && Object.values(trust).length === 0);
    });
    if (lowTrustNodes.length > nodes.length * 0.7) {
      flags.push('low-trust-coverage');
    }

    return flags;
  }

  /**
   * Detect missing data from GraphIndex
   */
  private static detectMissingDataFromIndex(index: GraphIndex): string[] {
    const flags: string[] = [];
    const indexRecord = index as unknown as Record<string, unknown>;
    const summaries = (indexRecord.summaries || {}) as Record<string, unknown>;

    // Check for low counts across dimensions
    if ((summaries.vehicleCount as number) === 0) {
      flags.push('no-vehicles');
    }
    if ((summaries.eventCount as number) === 0) {
      flags.push('no-events');
    }
    if ((summaries.sourceCount as number) === 0) {
      flags.push('no-sources');
    }

    // Check trust/provenance
    const trustSummary = indexRecord.trustSummary as Record<string, unknown>;
    if (!trustSummary || Object.keys(trustSummary).length === 0) {
      flags.push('no-trust-data');
    }

    const provenanceSummary = indexRecord.provenanceSummary as Record<string, unknown>;
    if (!provenanceSummary || Object.keys(provenanceSummary).length === 0) {
      flags.push('no-provenance-data');
    }

    return flags;
  }

  /**
   * Calculate data completeness percentage
   */
  private static calculateCompletenessFromNodes(nodes: GraphNode[]): number {
    if (nodes.length === 0) {
      return 0;
    }

    let totalFields = 0;
    let filledFields = 0;

    for (const node of nodes) {
      // Count key fields
      totalFields += 5; // id, nodeType, vehicleId, createdAt, updatedAt

      if (node.id) filledFields++;
      if ((node as unknown as Record<string, unknown>).nodeType) filledFields++;
      if (node.vehicleId) filledFields++;
      if (node.createdAt) filledFields++;
      if (node.updatedAt) filledFields++;

      // Optional fields
      if (node.context && Object.keys(node.context).length > 0) {
        totalFields++;
        filledFields++;
      } else {
        totalFields++;
      }

      if (node.metadata && Object.keys(node.metadata).length > 0) {
        totalFields++;
        filledFields++;
      } else {
        totalFields++;
      }
    }

    return totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
  }

  /**
   * Calculate completeness from GraphIndex
   */
  private static calculateCompletenessFromIndex(index: GraphIndex): number {
    const indexRecord = index as unknown as Record<string, unknown>;
    const nodeIds = ((indexRecord.nodeIds as string[]) || []).length;
    const edgeIds = ((indexRecord.edgeIds as string[]) || []).length;
    const summaries = (indexRecord.summaries || {}) as Record<string, unknown>;

    let totalFields = 0;
    let filledFields = 0;

    // Core fields
    totalFields += 4; // indexId, indexType, vehicleId, nodeIds, edgeIds
    if (indexRecord.indexId) filledFields++;
    if (indexRecord.indexType) filledFields++;
    if (indexRecord.vehicleId) filledFields++;
    if (nodeIds > 0) filledFields++;
    if (edgeIds > 0) filledFields++;

    // Summary fields (event/vehicle/source counts)
    totalFields += 3;
    if ((summaries.eventCount as number) ?? 0 > 0) filledFields++;
    if ((summaries.vehicleCount as number) ?? 0 > 0) filledFields++;
    if ((summaries.sourceCount as number) ?? 0 > 0) filledFields++;

    // Trust & provenance
    totalFields += 2;
    if (indexRecord.trustSummary && Object.keys(indexRecord.trustSummary as Record<string, unknown>).length > 0) {
      filledFields++;
    }
    if (
      indexRecord.provenanceSummary &&
      Object.keys(indexRecord.provenanceSummary as Record<string, unknown>).length > 0
    ) {
      filledFields++;
    }

    return totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
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
   * Generate a simple unique ID for snapshot
   */
  private static generateSnapshotId(): string {
    return `snapshot:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
  }
}
