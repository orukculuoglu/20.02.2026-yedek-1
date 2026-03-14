import type { IndexPublicationEnvelope } from './contracts';

/**
 * Validators for runtime and publication contracts
 */
export class IndexRuntimeValidators {
  /**
   * Validate publication envelope structure
   */
  static validatePublicationEnvelope(envelope: unknown): envelope is IndexPublicationEnvelope {
    if (!envelope || typeof envelope !== 'object') {
      return false;
    }

    const env = envelope as Record<string, unknown>;

    // Required fields
    if (typeof env.publicationId !== 'string' || !env.publicationId) {
      return false;
    }

    if (!(env.publishedAt instanceof Date)) {
      return false;
    }

    if (!env.indexRecord || typeof env.indexRecord !== 'object') {
      return false;
    }

    if (!env.publicationContext || typeof env.publicationContext !== 'object') {
      return false;
    }

    const ctx = env.publicationContext as Record<string, unknown>;

    // Publication context fields
    if (typeof ctx.runtimeId !== 'string' || !ctx.runtimeId) {
      return false;
    }

    if (ctx.sourceType !== 'GRAPH_QUERY' && ctx.sourceType !== 'GRAPH_ARTIFACTS') {
      return false;
    }

    if (!(ctx.executedAt instanceof Date)) {
      return false;
    }

    if (typeof ctx.executionDurationMs !== 'number' || ctx.executionDurationMs < 0) {
      return false;
    }

    if (typeof ctx.calculatorName !== 'string' || !ctx.calculatorName) {
      return false;
    }

    if (typeof ctx.calculatorInstance !== 'string' || !ctx.calculatorInstance) {
      return false;
    }

    return true;
  }

  /**
   * Validate execution context structure
   */
  static validateExecutionContext(context: unknown): context is {
    executionId: string;
    executedAt: Date;
    executionDurationMs: number;
    sourceType: 'GRAPH_QUERY' | 'GRAPH_ARTIFACTS';
  } {
    if (!context || typeof context !== 'object') {
      return false;
    }

    const ctx = context as Record<string, unknown>;

    if (typeof ctx.executionId !== 'string' || !ctx.executionId) {
      return false;
    }

    if (!(ctx.executedAt instanceof Date)) {
      return false;
    }

    if (typeof ctx.executionDurationMs !== 'number' || ctx.executionDurationMs < 0) {
      return false;
    }

    if (ctx.sourceType !== 'GRAPH_QUERY' && ctx.sourceType !== 'GRAPH_ARTIFACTS') {
      return false;
    }

    return true;
  }
}
