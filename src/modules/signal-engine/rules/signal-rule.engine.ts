import {
  SignalRuleDefinition,
  SignalRuleMatch,
} from './signal-rule.types';
import { evaluateRule } from './signal-rule.evaluator';
import { SignalEvaluationContext } from '../context';

/**
 * Engine for deterministic signal rule evaluation.
 * Evaluates a set of rules against an evaluation context and returns matches.
 *
 * This engine does NOT create Signal entities.
 * It only evaluates rules and returns matched rule definitions with evidence.
 */
export class SignalRuleEngine {
  private rules: SignalRuleDefinition[];

  /**
   * Create a new SignalRuleEngine.
   *
   * @param rules - Array of rule definitions to evaluate
   */
  constructor(rules: SignalRuleDefinition[]) {
    this.rules = rules;
  }

  /**
   * Evaluate all rules against an evaluation context.
   *
   * @param context - The evaluation context to test against
   * @returns Array of matched rules with evidence
   *
   * Logic:
   * - Iterate through all rules
   * - Call evaluateRule() for each rule
   * - When rule matches, create SignalRuleMatch with evidence
   * - Return all matches in order
   */
  evaluate(context: SignalEvaluationContext): SignalRuleMatch[] {
    const matches: SignalRuleMatch[] = [];

    for (const rule of this.rules) {
      if (evaluateRule(rule, context)) {
        const match: SignalRuleMatch = {
          ruleId: rule.ruleId,
          signalType: rule.signalType,
          severity: rule.severity,
          ...(rule.priority && { priority: rule.priority }),
          evidence: {
            ruleId: rule.ruleId,
            timestamp: context.timestamp,
            avid: context.avid,
            vehicleId: context.vehicleId,
          },
        };

        matches.push(match);
      }
    }

    return matches;
  }
}
