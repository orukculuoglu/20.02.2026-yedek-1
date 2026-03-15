import { SignalSeverity, SignalPriority } from '../domain';
import { getDefaultPriorityForSeverity } from '../registry/signal-priority.registry';
import { SignalRuleMatch } from '../rules';
import { SignalEvaluationContext } from '../context';

/**
 * Valid priority levels.
 */
const VALID_PRIORITIES: SignalPriority[] = [
  SignalPriority.LOW,
  SignalPriority.MEDIUM,
  SignalPriority.HIGH,
  SignalPriority.CRITICAL,
];

/**
 * Resolve deterministic priority from rule match and registry.
 *
 * @param ruleMatch - The matched rule
 * @param severity - The resolved severity level
 * @param context - The evaluation context
 * @returns Resolved priority level
 *
 * Rules:
 * - Primary: use priority from ruleMatch if defined
 * - Registry: resolve from severity using getDefaultPriorityForSeverity()
 * - Fallback: never needed (registry always returns valid priority)
 * - Deterministic: same input always produces same output
 */
export function resolvePriority(
  ruleMatch: SignalRuleMatch,
  severity: SignalSeverity,
  context: SignalEvaluationContext,
): SignalPriority {
  // Use priority from rule match if defined and valid
  if (
    ruleMatch.priority &&
    typeof ruleMatch.priority === 'string' &&
    VALID_PRIORITIES.includes(ruleMatch.priority as SignalPriority)
  ) {
    return ruleMatch.priority as SignalPriority;
  }

  // Resolve from severity registry
  return getDefaultPriorityForSeverity(severity);
}
