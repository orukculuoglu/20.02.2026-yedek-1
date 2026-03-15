import { SignalCandidate } from '../scoring';
import { SignalEvaluationContext } from '../context';

/**
 * Generate a deterministic signal ID.
 *
 * @param candidate - The signal candidate
 * @param context - The evaluation context
 * @returns Deterministic signal ID
 *
 * Format: signal:{avid}:{signalType}:{ruleId}:{bucket}
 *
 * Bucket = Math.floor(timestamp / 60000) provides 60-second window deduplication.
 * This prevents duplicate signals for the same rule within 1-minute windows.
 *
 * Example: signal:VIN123:BRAKE_WEAR:rule-001:1710502800
 */
export function generateSignalId(
  candidate: SignalCandidate,
  context: SignalEvaluationContext,
): string {
  // Calculate timestamp bucket (1-minute window)
  const bucket = Math.floor(candidate.timestamp / 60000);

  return `signal:${context.avid}:${candidate.signalType}:${candidate.ruleId}:${bucket}`;
}
