import type { IndexPublicationEnvelope, IndexRuntimeContext } from './contracts';
import { IndexExecutionErrorClass } from './contracts';
import type { IndexRecord } from '../domain/schemas/index-record';

/**
 * Creates publication envelopes for IndexRecords
 * Deterministic, structured output for downstream consumers
 * No external persistence - internal messaging only
 */
export class IndexPublicationService {
  /**
   * Create publication envelope from IndexRecord
   * Wraps the record with execution metadata and publication context
   */
  static publish(
    indexRecord: IndexRecord,
    runtimeContext: IndexRuntimeContext,
    calculatorInfo: { name: string; version?: string },
  ): IndexPublicationEnvelope {
    try {
      // Validate inputs
      if (!indexRecord || typeof indexRecord !== 'object') {
        throw new Error(`Invalid index record: ${typeof indexRecord}`);
      }

      if (!runtimeContext || typeof runtimeContext !== 'object') {
        throw new Error(`Invalid runtime context: ${typeof runtimeContext}`);
      }

      if (!calculatorInfo || typeof calculatorInfo.name !== 'string') {
        throw new Error(`Invalid calculator info: ${typeof calculatorInfo}`);
      }

      // Generate publication ID (deterministic format)
      const publicationId = this.generatePublicationId(indexRecord, runtimeContext);

      // Create publication envelope
      const envelope: IndexPublicationEnvelope = {
        publicationId,
        publishedAt: new Date(),
        indexRecord,
        publicationContext: {
          runtimeId: runtimeContext.executionId,
          sourceType: runtimeContext.sourceType,
          executedAt: runtimeContext.executedAt,
          executionDurationMs: runtimeContext.executionDurationMs,
          calculatorName: calculatorInfo.name,
          calculatorInstance: calculatorInfo.version || 'unknown',
        },
      };

      return envelope;
    } catch (err) {
      const error = new IndexExecutionErrorClass(
        `IndexPublicationService failed to create envelope: ${err instanceof Error ? err.message : String(err)}`,
        'PUBLICATION_ERROR',
      );
      error.details = {
        indexRecordId: indexRecord?.indexId,
        runtimeId: runtimeContext?.executionId,
        originalError: err instanceof Error ? err.message : String(err),
      };
      throw error;
    }
  }

  /**
   * Generate deterministic publication ID
   * Format: pub_{indexType}_{subjectId}_{timestamp}_{sequence}
   */
  private static generatePublicationId(
    indexRecord: IndexRecord,
    runtimeContext: IndexRuntimeContext,
  ): string {
    try {
      const timestamp = runtimeContext.executedAt.getTime();
      const sequence = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0');

      const subjectId = indexRecord.subjectId || 'unknown';
      return `pub_${runtimeContext.indexType}_${subjectId.substring(0, 8)}_${timestamp}_${sequence}`;
    } catch {
      // Fallback to simple ID
      return `pub_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }
  }

  /**
   * Extract downstream-ready part of publication envelope
   * Useful for transmission or queuing
   */
  static toDownstreamMessage(envelope: IndexPublicationEnvelope): {
    publicationId: string;
    publishedAt: string;
    indexRecord: Record<string, unknown>;
    sourceType: string;
    executionDurationMs: number;
  } {
    // Cast IndexRecord to Record<string, unknown> for downstream transmission
    return {
      publicationId: envelope.publicationId,
      publishedAt: envelope.publishedAt.toISOString(),
      indexRecord: envelope.indexRecord as unknown as Record<string, unknown>,
      sourceType: envelope.publicationContext.sourceType,
      executionDurationMs: envelope.publicationContext.executionDurationMs,
    };
  }

  /**
   * Get publication summary for logging
   */
  static summarize(envelope: IndexPublicationEnvelope): string {
    const rec = envelope.indexRecord;
    const ctx = envelope.publicationContext;

    return (
      `Publication ${envelope.publicationId}: ` +
      `[${rec.indexType}] ${rec.subjectId} = ` +
      `${rec.score.toFixed(3)} (${rec.band}) ` +
      `conf=${rec.confidence.toFixed(2)} ` +
      `calc=${ctx.calculatorName} ` +
      `duration=${ctx.executionDurationMs}ms`
    );
  }
}
