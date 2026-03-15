import { SignalSeverity } from '../domain';
import { SignalRuleMatch } from '../rules';
import { SignalEvaluationContext } from '../context';
import { SignalCandidate } from './signal-score.types';
import { resolveConfidence } from './signal-confidence.resolver';
import { resolveSeverity } from './signal-severity.resolver';
import { resolvePriority } from './signal-priority.resolver';

/**
 * Mapping of severity levels to strength weights.
 * Used to calculate final strength score.
 */
const SEVERITY_WEIGHT_MAP: Record<SignalSeverity, number> = {
  [SignalSeverity.LOW]: 0.25,
  [SignalSeverity.MEDIUM]: 0.5,
  [SignalSeverity.HIGH]: 0.75,
  [SignalSeverity.CRITICAL]: 1.0,
};

/**
 * Engine for deterministic signal candidate scoring.
 * Transforms rule matches into scored candidates ready for signal creation.
 *
 * This engine does NOT create Signal entities.
 * It only calculates scoring attributes used for signal construction.
 */
export class SignalScoringEngine {
  /**
   * Score rule matches and produce signal candidates.
   *
   * @param ruleMatches - Array of matched rules
   * @param context - The evaluation context
   * @returns Array of scored signal candidates
   *
   * Logic:
   * - Iterate ruleMatches
   * - For each match:
   *   - Resolve severity (from match or context override)
   *   - Resolve priority (from match or severity registry)
   *   - Resolve confidence (base 0.7 + evidence bonus)
   *   - Calculate strength = confidence × severity weight
   *   - Create SignalCandidate with all fields
   * - Return candidates in order
   */
  score(
    ruleMatches: SignalRuleMatch[],
    context: SignalEvaluationContext,
  ): SignalCandidate[] {
    const candidates: SignalCandidate[] = [];

    for (const ruleMatch of ruleMatches) {
      // Resolve severity
      const severity = resolveSeverity(ruleMatch, context);

      // Resolve priority
      const priority = resolvePriority(ruleMatch, severity, context);

      // Resolve confidence
      const confidence = resolveConfidence(ruleMatch, context);

      // Calculate strength using severity weight
      const severityWeight = SEVERITY_WEIGHT_MAP[severity];
      const strength = confidence * severityWeight;

      // Create candidate
      const candidate: SignalCandidate = {
        ruleId: ruleMatch.ruleId,
        signalType: ruleMatch.signalType,
        severity,
        priority,
        confidence,
        strength,
        timestamp: context.timestamp,
        ...(ruleMatch.evidence && { evidence: ruleMatch.evidence }),
      };

      candidates.push(candidate);
    }

    return candidates;
  }
}
