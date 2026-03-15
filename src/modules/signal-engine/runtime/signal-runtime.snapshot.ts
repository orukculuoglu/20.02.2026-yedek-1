import { SignalEvaluationContext } from '../context';
import { SignalRuleDefinition, SignalRuleMatch } from '../rules';
import { SignalCandidate } from '../scoring';
import { Signal } from '../domain';
import { SignalRuntimeSnapshot } from './signal-runtime.types';

/**
 * Create a metadata snapshot of Signal Engine execution.
 *
 * @param input - Signal Engine execution data
 * @returns Deterministic runtime snapshot
 *
 * Snapshot captures:
 * - avid, vehicleId from context
 * - timestamp from context
 * - ruleCount from rules array
 * - matchCount from matches array
 * - candidateCount from candidates array
 * - signalCount from signals array
 * - signalTypes: unique signal types from signals
 */
export function createSignalRuntimeSnapshot(input: {
  context: SignalEvaluationContext;
  rules: SignalRuleDefinition[];
  matches: SignalRuleMatch[];
  candidates: SignalCandidate[];
  signals: Signal[];
}): SignalRuntimeSnapshot {
  // Extract unique signal types from signals
  const signalTypes = Array.from(
    new Set(input.signals.map((signal) => signal.signalType)),
  ).sort();

  return {
    avid: input.context.avid,
    vehicleId: input.context.vehicleId,
    timestamp: input.context.timestamp,
    ruleCount: input.rules.length,
    matchCount: input.matches.length,
    candidateCount: input.candidates.length,
    signalCount: input.signals.length,
    signalTypes,
  };
}
