import { Signal, SignalSeverity, SignalPriority } from '../domain';
import { SignalEntity } from '../domain/signal.entity';
import { CreateSignalInput } from '../domain/signal.entity';
import { SignalCategory } from '../domain';
import { SignalCandidate } from '../scoring';
import { SignalEvaluationContext } from '../context';
import { generateSignalId } from './signal-id.util';
import { SIGNAL_TYPE_DEFINITIONS } from '../registry/signal-type.registry';

/**
 * Engine for building Signal entities from scored candidates.
 * Connects scoring output with the Signal domain model.
 *
 * This engine does NOT implement rule evaluation or scoring logic.
 * It only transforms candidates into Signal entities using the existing factory.
 */
export class SignalBuilderEngine {
  /**
   * Build Signal entities from scored candidates.
   *
   * @param candidates - Array of scored signal candidates
   * @param context - The evaluation context
   * @returns Array of built Signal entities
   *
   * Logic:
   * - For each candidate:
   *   - Generate deterministic signal ID
   *   - Build source references from context
   *   - Resolve signal category from registry
   *   - Call SignalEntity.createSignal() with all fields
   * - Return signals in order
   */
  build(
    candidates: SignalCandidate[],
    context: SignalEvaluationContext,
  ): Signal[] {
    const signals: Signal[] = [];

    for (const candidate of candidates) {
      // Generate deterministic signal ID
      const signalId = generateSignalId(candidate, context);

      // Build source references from context
      const sourceIndexRefs = context.indexes
        ? Object.keys(context.indexes)
        : undefined;

      const sourceCompositeRefs = context.composites
        ? Object.keys(context.composites)
        : undefined;

      const sourceEventRefs = context.events ? Object.keys(context.events) : undefined;

      const sourceGraphRefs = context.graph ? Object.keys(context.graph) : undefined;

      // Resolve signal category from registry
      const signalTypeDefinition = SIGNAL_TYPE_DEFINITIONS[candidate.signalType];
      const signalCategory =
        signalTypeDefinition?.category || SignalCategory.OPERATIONAL_ANOMALY;

      // Build SignalEntity input
      const signalInput: CreateSignalInput = {
        signalId,
        avid: context.avid,
        vehicleId: context.vehicleId,
        signalType: candidate.signalType,
        signalCategory,
        severity: candidate.severity as SignalSeverity,
        priority: candidate.priority as SignalPriority,
        confidence: candidate.confidence,
        detectedAt: candidate.timestamp,
        effectiveAt: candidate.timestamp,

        ...(sourceIndexRefs && { sourceIndexRefs }),
        ...(sourceCompositeRefs && { sourceCompositeRefs }),
        ...(sourceEventRefs && { sourceEventRefs }),
        ...(sourceGraphRefs && { sourceGraphRefs }),

        trace: {
          ruleId: candidate.ruleId,
          evaluatedAt: context.timestamp,
        },

        metadata: {
          strength: candidate.strength,
          ...(candidate.evidence && { evidence: candidate.evidence }),
        },
      };

      // Create signal using domain factory
      const signal = SignalEntity.createSignal(signalInput);
      signals.push(signal);
    }

    return signals;
  }
}
