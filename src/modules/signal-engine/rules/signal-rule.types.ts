/**
 * Operators for deterministic rule condition evaluation.
 * All operators are safe and handle edge cases without runtime errors.
 */
export type SignalRuleOperator =
  | 'EQ'
  | 'NEQ'
  | 'GT'
  | 'GTE'
  | 'LT'
  | 'LTE'
  | 'IN'
  | 'NOT_IN'
  | 'EXISTS'
  | 'NOT_EXISTS';

/**
 * Atomic rule condition.
 * Evaluates a fact against a value using the specified operator.
 */
export interface SignalRuleCondition {
  fact: string;
  operator: SignalRuleOperator;
  value?: unknown;
}

/**
 * Complete rule definition for signal evaluation.
 * Groups conditions using logical operators (all, any, none).
 * All groups must evaluate to true for the overall rule to match.
 */
export interface SignalRuleDefinition {
  ruleId: string;
  signalType: string;
  description?: string;

  when: {
    all?: SignalRuleCondition[];
    any?: SignalRuleCondition[];
    none?: SignalRuleCondition[];
  };

  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  metadata?: Record<string, unknown>;
}

/**
 * Result of evaluating a rule against a SignalEvaluationContext.
 * Created only when a rule matches; includes evidence of the match.
 */
export interface SignalRuleMatch {
  ruleId: string;
  signalType: string;
  severity: string;
  priority?: string;
  evidence?: Record<string, unknown>;
}
