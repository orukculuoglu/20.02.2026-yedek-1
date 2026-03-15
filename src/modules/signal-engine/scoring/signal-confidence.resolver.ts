import { SignalRuleMatch } from '../rules';
import { SignalEvaluationContext } from '../context';

/**
 * Resolve deterministic confidence score from rule match and context.
 *
 * @param ruleMatch - The matched rule
 * @param context - The evaluation context
 * @returns Confidence score between 0 and 1
 *
 * Rules:
 * - Base confidence: 0.7
 * - Increase by 0.05 for each evidence field (max 5 fields) = +0.25
 * - Clamp final value between 0 and 1
 * - Deterministic: same input always produces same output
 */
export function resolveConfidence(
  ruleMatch: SignalRuleMatch,
  context: SignalEvaluationContext,
): number {
  let confidence = 0.7;

  // Increase confidence based on evidence fields present
  if (ruleMatch.evidence && typeof ruleMatch.evidence === 'object') {
    const evidenceFieldCount = Object.keys(ruleMatch.evidence).length;
    // Each evidence field adds 0.05, max 5 fields = +0.25
    const evidenceBonus = Math.min(evidenceFieldCount * 0.05, 0.25);
    confidence += evidenceBonus;
  }

  // Clamp between 0 and 1
  confidence = Math.max(0, Math.min(1, confidence));

  return confidence;
}
