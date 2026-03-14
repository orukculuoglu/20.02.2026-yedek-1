import { IndexInputEvidence } from '../input/schemas/index-input-evidence';
import { EvidenceType } from '../input/enums/evidence-type';
import type { GraphNode } from '../../../vehicle-intelligence-graph/domain/nodes/graph-node';
import type { GraphEdge } from '../../../vehicle-intelligence-graph/domain/edges/graph-edge';
import type { GraphSignal } from '../../../vehicle-intelligence-graph/domain/signal/graph-signal';
import type { GraphIndex } from '../../../vehicle-intelligence-graph/domain/index/graph-index';

/**
 * GraphIndexEvidenceBuilder constructs explainable evidence from Graph artifacts.
 * Packages Graph data into standardized evidence types for index calculators.
 * 
 * Responsibility:
 * - Convert Graph artifacts into 8 evidence types
 * - Extract confidence values from Graph trust metrics
 * - Create human-readable labels and units
 * - Link evidence back to source refs
 * - Package evidence with metadata
 */
export class GraphIndexEvidenceBuilder {
  /**
   * Build MEASUREMENT evidence from GraphNode metadata
   */
  static fromNodeMetadata(node: GraphNode, metricName: string, relatedRefIds?: string[]): IndexInputEvidence {
    const nodeRecord = node as unknown as Record<string, unknown>;
    const metadata = node.metadata || {};

    return {
      evidenceType: EvidenceType.MEASUREMENT,
      label: `Node measurement: ${metricName}`,
      value: String(metadata[metricName] ?? `No ${metricName} in metadata`),
      unit: this.inferUnit(metricName),
      confidence: this.extractTrustScore(node.trust),
      timestamp: GraphIndexEvidenceBuilder.toDate(node.updatedAt || node.createdAt),
      relatedRefIds,
      metadata: {
        nodeId: node.id,
        nodeType: nodeRecord.nodeType,
        vehicleId: node.vehicleId,
        source: 'graph-node-metadata',
      },
    };
  }

  /**
   * Build SIGNAL evidence from GraphSignal
   */
  static fromGraphSignal(signal: GraphSignal, relatedRefIds?: string[]): IndexInputEvidence {
    const signalRecord = signal as unknown as Record<string, unknown>;

    return {
      evidenceType: EvidenceType.SIGNAL,
      label: `Signal: ${signalRecord.signalType ?? 'unknown'}`,
      value: String(signalRecord.severity || 'low'),
      unit: 'severity',
      confidence: (signalRecord.confidence as number) ?? 0.5,
      timestamp: (signalRecord.generatedAt as Date) || new Date(),
      relatedRefIds,
      metadata: {
        signalId: signalRecord.signalId,
        signalType: signalRecord.signalType,
        vehicleId: signalRecord.vehicleId,
        explanation: signalRecord.explanation,
        sourceNodeCount: ((signalRecord.sourceNodeIds as string[]) || []).length,
        source: 'graph-signal',
      },
    };
  }

  /**
   * Build EVENT evidence from GraphNode of type EventNode
   */
  static fromEventNode(node: GraphNode, relatedRefIds?: string[]): IndexInputEvidence {
    const nodeRecord = node as unknown as Record<string, unknown>;
    const metadata = node.metadata || {};

    return {
      evidenceType: EvidenceType.EVENT,
      label: `Event: ${metadata.eventType ?? 'occurrence'}`,
      value: String(metadata.eventDetails ?? 'Event recorded'),
      unit: 'event',
      confidence: this.extractTrustScore(node.trust),
      timestamp: GraphIndexEvidenceBuilder.toDate(node.createdAt),
      relatedRefIds,
      metadata: {
        nodeId: node.id,
        vehicleId: node.vehicleId,
        eventType: metadata.eventType,
        eventTime: metadata.eventTime,
        eventCode: metadata.eventCode,
        source: 'graph-event-node',
      },
    };
  }

  /**
   * Build PATTERN evidence from detected relationships (via GraphEdge frequencies)
   */
  static fromPatternDetection(
    patternName: string,
    frequency: number,
    confidence: number,
    vehicleId: string,
    relatedRefIds?: string[],
  ): IndexInputEvidence {
    return {
      evidenceType: EvidenceType.PATTERN,
      label: `Pattern detected: ${patternName}`,
      value: frequency,
      unit: 'occurrences',
      confidence,
      timestamp: new Date(),
      relatedRefIds,
      metadata: {
        patternName,
        vehicleId,
        source: 'pattern-detection',
      },
    };
  }

  /**
   * Build STATUS evidence from GraphIndex summaries
   */
  static fromGraphIndexStatus(index: GraphIndex, statusField: string, relatedRefIds?: string[]): IndexInputEvidence {
    const indexRecord = index as unknown as Record<string, unknown>;
    const summaries = (indexRecord.summaries || {}) as Record<string, unknown>;

    return {
      evidenceType: EvidenceType.STATUS,
      label: `Status: ${statusField}`,
      value: String(summaries[statusField] ?? 'unknown'),
      unit: this.inferUnit(statusField),
      confidence: this.extractTrustScore(indexRecord.trustSummary as Record<string, unknown>),
      timestamp: (indexRecord.createdAt as Date) || new Date(),
      relatedRefIds,
      metadata: {
        indexId: indexRecord.indexId,
        indexType: indexRecord.indexType,
        vehicleId: indexRecord.vehicleId,
        statusField,
        source: 'graph-index-status',
      },
    };
  }

  /**
   * Build DIAGNOSTIC evidence from signal explanations and error codes
   */
  static fromDiagnosticSignal(
    signal: GraphSignal,
    diagnosticCode: string,
    relatedRefIds?: string[],
  ): IndexInputEvidence {
    const signalRecord = signal as unknown as Record<string, unknown>;

    return {
      evidenceType: EvidenceType.DIAGNOSTIC,
      label: `Diagnostic: ${diagnosticCode}`,
      value: String(signalRecord.explanation || diagnosticCode),
      unit: 'code',
      confidence: (signalRecord.confidence as number) ?? 0.7,
      timestamp: (signalRecord.generatedAt as Date) || new Date(),
      relatedRefIds,
      metadata: {
        diagnosticCode,
        signalId: signalRecord.signalId,
        signalType: signalRecord.signalType,
        vehicleId: signalRecord.vehicleId,
        severity: signalRecord.severity,
        source: 'diagnostic-signal',
      },
    };
  }

  /**
   * Build ESTIMATION evidence from calculated/derived values
   */
  static fromEstimation(
    estimationName: string,
    estimatedValue: number | string,
    basedOnNodeCount: number,
    confidence: number,
    vehicleId: string,
    relatedRefIds?: string[],
  ): IndexInputEvidence {
    return {
      evidenceType: EvidenceType.ESTIMATION,
      label: `Estimation: ${estimationName}`,
      value: estimatedValue,
      unit: this.inferUnit(estimationName),
      confidence,
      timestamp: new Date(),
      relatedRefIds,
      metadata: {
        estimationName,
        basedOnNodeCount,
        vehicleId,
        source: 'estimation',
      },
    };
  }

  /**
   * Build COMPARISON evidence (vs. fleet average, baseline, etc.)
   */
  static fromComparison(
    comparisonLabel: string,
    subjectValue: number,
    baselineValue: number,
    confidence: number,
    vehicleId: string,
    relatedRefIds?: string[],
  ): IndexInputEvidence {
    const variance = subjectValue - baselineValue;
    const percentageVariance = baselineValue !== 0 ? (variance / baselineValue) * 100 : 0;

    return {
      evidenceType: EvidenceType.COMPARISON,
      label: `Comparison: ${comparisonLabel}`,
      value: {
        subject: subjectValue,
        baseline: baselineValue,
        variance,
        percentageVariance,
      },
      unit: 'variance',
      confidence,
      timestamp: new Date(),
      relatedRefIds,
      metadata: {
        comparisonLabel,
        vehicleId,
        subjectValue,
        baselineValue,
        source: 'comparison',
      },
    };
  }

  /**
   * Extract trust score from graph trust record
   * Returns normalized 0.0-1.0 value
   */
  private static extractTrustScore(trust: Record<string, unknown> | unknown): number {
    if (!trust || typeof trust !== 'object') {
      return 0.5; // Default to neutral
    }

    const trustRecord = trust as Record<string, unknown>;

    // Check for common trust field patterns
    if (typeof trustRecord.score === 'number') {
      return Math.max(0, Math.min(1, trustRecord.score / 100));
    }

    if (typeof trustRecord.level === 'number') {
      return Math.max(0, Math.min(1, trustRecord.level));
    }

    if (typeof trustRecord.confidence === 'number') {
      return Math.max(0, Math.min(1, trustRecord.confidence));
    }

    // Count non-null fields as approximate trust indicator
    const fields = Object.values(trustRecord).filter((v) => v !== null && v !== undefined);
    return fields.length > 0 ? 0.7 : 0.3;
  }

  /**
   * Infer appropriate unit based on field name
   */
  private static inferUnit(fieldName: string): string {
    const lowerName = fieldName.toLowerCase();

    if (lowerName.includes('time') || lowerName.includes('age') || lowerName.includes('delay')) {
      return 'days';
    }
    if (lowerName.includes('count') || lowerName.includes('number') || lowerName.includes('frequency')) {
      return 'count';
    }
    if (lowerName.includes('rate') || lowerName.includes('percentage') || lowerName.includes('percent')) {
      return 'percentage';
    }
    if (lowerName.includes('score') || lowerName.includes('confidence') || lowerName.includes('trust')) {
      return 'score';
    }
    if (lowerName.includes('distance') || lowerName.includes('mileage') || lowerName.includes('odometer')) {
      return 'km';
    }
    if (
      lowerName.includes('temperature') ||
      lowerName.includes('temp') ||
      lowerName.includes('celsius') ||
      lowerName.includes('fahrenheit')
    ) {
      return '°C';
    }
    if (lowerName.includes('pressure') || lowerName.includes('psi') || lowerName.includes('bar')) {
      return 'bar';
    }
    if (lowerName.includes('voltage') || lowerName.includes('volt')) {
      return 'V';
    }
    if (lowerName.includes('current') || lowerName.includes('amp')) {
      return 'A';
    }

    return 'unit';
  }

  /**
   * Aggregate evidence from multiple signal types into a collection
   */
  static aggregateEvidenceFromSignals(signals: GraphSignal[], vehicleId: string): IndexInputEvidence[] {
    const evidence: IndexInputEvidence[] = [];

    // Group signals by type
    const signalsByType = new Map<string, GraphSignal[]>();
    for (const signal of signals) {
      const signalRecord = signal as unknown as Record<string, unknown>;
      const signalType = String(signalRecord.signalType ?? 'unknown');
      if (!signalsByType.has(signalType)) {
        signalsByType.set(signalType, []);
      }
      signalsByType.get(signalType)!.push(signal);
    }

    // Create evidence for each signal type
    for (const [signalType, typeSignals] of signalsByType) {
      const signalIds = typeSignals.map((s) => (s as unknown as Record<string, unknown>).signalId as string);

      // Aggregate confidence
      const avgConfidence =
        typeSignals.reduce((sum, s) => sum + ((s as unknown as Record<string, unknown>).confidence as number), 0) /
        typeSignals.length;

      evidence.push(
        this.fromPatternDetection(`${signalType} signals`, typeSignals.length, avgConfidence, vehicleId, signalIds),
      );
    }

    return evidence;
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
