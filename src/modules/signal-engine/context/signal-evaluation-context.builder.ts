import {
  SignalEvaluationContext,
  SignalEvaluationInput,
} from './signal-evaluation-context.types';

/**
 * Builder for creating normalized SignalEvaluationContext from upstream inputs.
 * Ensures deterministic timestamp assignment and validates required fields.
 * 
 * This builder does NOT implement rule logic or modify upstream payloads.
 * It only prepares structured input for future signal evaluation.
 */
export class SignalEvaluationContextBuilder {
  /**
   * Build a deterministic evaluation context from upstream inputs.
   *
   * @param input - Upstream intelligence structures
   * @returns SignalEvaluationContext with assigned timestamp
   *
   * Rules:
   * - Assigns timestamp using Date.now()
   * - Copies all upstream structures as-is (no modification)
   * - Requires avid field
   * - Returns deterministic context object
   */
  build(input: SignalEvaluationInput): SignalEvaluationContext {
    return {
      avid: input.avid,
      vehicleId: input.vehicleId,
      timestamp: Date.now(),

      ...(input.indexes && { indexes: input.indexes }),
      ...(input.composites && { composites: input.composites }),
      ...(input.graph && { graph: input.graph }),
      ...(input.events && { events: input.events }),

      ...(input.vehicleContext && { vehicleContext: input.vehicleContext }),

      ...(input.metadata && { metadata: input.metadata }),
    };
  }
}
