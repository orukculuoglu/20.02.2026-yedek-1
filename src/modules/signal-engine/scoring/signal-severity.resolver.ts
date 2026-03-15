import { SignalSeverity } from '../domain';
import { SignalRuleMatch } from '../rules';
import { SignalEvaluationContext } from '../context';

/**
 * Valid severity levels.
 */
const VALID_SEVERITIES: SignalSeverity[] = [
  SignalSeverity.LOW,
  SignalSeverity.MEDIUM,
  SignalSeverity.HIGH,
  SignalSeverity.CRITICAL,
];

/**
 * Resolve deterministic severity from rule match and context.
 *
 * @param ruleMatch - The matched rule
 * @param context - The evaluation context
 * @returns Resolved severity level
 *
 * Rules:
 * - Primary: use severity from ruleMatch
 * - Override: check context.metadata?.severityHint
 * - Fallback: return MEDIUM if no valid severity found
 * - Deterministic: same input always produces same output
 */
export function resolveSeverity(
  ruleMatch: SignalRuleMatch,
  context: SignalEvaluationContext,
): SignalSeverity {
  // Check for severity hint override in context metadata
  if (context.metadata && typeof context.metadata === 'object') {
    const metadata = context.metadata as Record<string, unknown>;
    const severityHint = metadata.severityHint;

    if (
      typeof severityHint === 'string' &&
      VALID_SEVERITIES.includes(severityHint as SignalSeverity)
    ) {
      return severityHint as SignalSeverity;
    }
  }

  // Use severity from rule match if valid
  if (
    typeof ruleMatch.severity === 'string' &&
    VALID_SEVERITIES.includes(ruleMatch.severity as SignalSeverity)
  ) {
    return ruleMatch.severity as SignalSeverity;
  }

  // Fallback to MEDIUM
  return SignalSeverity.MEDIUM;
}
