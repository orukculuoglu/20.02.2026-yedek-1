import type {
  CompositeRuntimeExecutionResult,
  CompositeRuntimeIntegrationResult,
} from './composite-runtime.types';
import type { CompositePublicationEnvelope } from '../publisher/composite-publisher.types';
import type { CompositeSignalProjection } from '../publisher/composite-publisher.types';

/**
 * Prepare integration result from runtime execution.
 *
 * Collects all publication envelopes and signal payloads
 * from executed units in deterministic order.
 *
 * Preserves ordering from execution units without transformation.
 * No external system calls.
 *
 * @param execution - Complete execution result
 * @returns CompositeRuntimeIntegrationResult with downstream payloads
 */
export function integrateCompositeRuntimeResult(
  execution: CompositeRuntimeExecutionResult,
): CompositeRuntimeIntegrationResult {
  // Collect publications and signal payloads from executed units
  const publications: CompositePublicationEnvelope[] = [];
  const signalPayloads: CompositeSignalProjection[] = [];

  for (const unit of execution.executionUnits) {
    // Only collect from successfully executed units
    if (unit.executed && unit.publication && unit.signalPayload) {
      publications.push(unit.publication);
      signalPayloads.push(unit.signalPayload);
    }
  }

  return {
    execution,
    signalPayloads,
    publications,
  };
}
