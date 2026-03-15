import {
  SignalRuleDefinition,
  SignalRuleCondition,
} from './signal-rule.types';
import { evaluateOperator } from './signal-rule.operator';
import { SignalEvaluationContext } from '../context';

/**
 * Resolve a dot-path fact from the evaluation context.
 * Safely traverses nested objects without runtime errors.
 *
 * @param context - The evaluation context
 * @param fact - Dot-separated path (example: "indexes.brakeWear")
 * @returns The resolved value or undefined
 */
function resolveFact(context: SignalEvaluationContext, fact: string): unknown {
  const parts = fact.split('.');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = context;

  for (const part of parts) {
    if (
      current === null ||
      current === undefined ||
      typeof current !== 'object'
    ) {
      return undefined;
    }
    current = current[part];
  }

  return current;
}

/**
 * Evaluate a single rule condition against the evaluation context.
 *
 * @param condition - The rule condition to evaluate
 * @param context - The evaluation context
 * @returns true if condition is satisfied
 */
function evaluateCondition(
  condition: SignalRuleCondition,
  context: SignalEvaluationContext,
): boolean {
  const factValue = resolveFact(context, condition.fact);
  return evaluateOperator(condition.operator, factValue, condition.value);
}

/**
 * Evaluate a complete rule against an evaluation context.
 * Supports all, any, and none condition groups.
 * All groups must evaluate to true for the overall rule to match.
 *
 * @param rule - The rule definition to evaluate
 * @param context - The evaluation context
 * @returns true if rule matches (all groups pass)
 *
 * Logic:
 * - "all" group: all conditions must be true
 * - "any" group: at least one condition must be true
 * - "none" group: no condition must be true
 * - If multiple groups exist, ALL groups must pass
 */
export function evaluateRule(
  rule: SignalRuleDefinition,
  context: SignalEvaluationContext,
): boolean {
  const whenConditions = rule.when;

  // Evaluate "all" group: all conditions must pass
  if (whenConditions.all && whenConditions.all.length > 0) {
    const allPass = whenConditions.all.every((condition) =>
      evaluateCondition(condition, context),
    );
    if (!allPass) {
      return false;
    }
  }

  // Evaluate "any" group: at least one condition must pass
  if (whenConditions.any && whenConditions.any.length > 0) {
    const anyPass = whenConditions.any.some((condition) =>
      evaluateCondition(condition, context),
    );
    if (!anyPass) {
      return false;
    }
  }

  // Evaluate "none" group: no condition must pass
  if (whenConditions.none && whenConditions.none.length > 0) {
    const nonePass = whenConditions.none.some((condition) =>
      evaluateCondition(condition, context),
    );
    if (nonePass) {
      return false;
    }
  }

  // All groups passed
  return true;
}
