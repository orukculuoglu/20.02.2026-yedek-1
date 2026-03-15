import { SignalRuleOperator } from './signal-rule.types';

/**
 * Safe operator evaluation for rule conditions.
 * Handles all operators deterministically without runtime crashes.
 *
 * @param operator - The operator to evaluate
 * @param left - The left-hand value (fact)
 * @param right - The right-hand value (condition value)
 * @returns true if condition is satisfied, false otherwise
 *
 * Rules:
 * - Comparison is type-safe
 * - Invalid comparisons return false
 * - null/undefined handled gracefully
 * - No runtime exceptions
 */
export function evaluateOperator(
  operator: SignalRuleOperator,
  left: unknown,
  right?: unknown,
): boolean {
  switch (operator) {
    case 'EQ':
      return left === right;

    case 'NEQ':
      return left !== right;

    case 'GT':
      // Safe numeric comparison
      if (typeof left === 'number' && typeof right === 'number') {
        return left > right;
      }
      return false;

    case 'GTE':
      // Safe numeric comparison
      if (typeof left === 'number' && typeof right === 'number') {
        return left >= right;
      }
      return false;

    case 'LT':
      // Safe numeric comparison
      if (typeof left === 'number' && typeof right === 'number') {
        return left < right;
      }
      return false;

    case 'LTE':
      // Safe numeric comparison
      if (typeof left === 'number' && typeof right === 'number') {
        return left <= right;
      }
      return false;

    case 'IN':
      // Check if left is in array (right)
      if (Array.isArray(right)) {
        return right.includes(left);
      }
      return false;

    case 'NOT_IN':
      // Check if left is NOT in array (right)
      if (Array.isArray(right)) {
        return !right.includes(left);
      }
      return false;

    case 'EXISTS':
      // Check if left value exists (not null/undefined)
      return left !== null && left !== undefined;

    case 'NOT_EXISTS':
      // Check if left value does NOT exist (null/undefined)
      return left === null || left === undefined;

    default:
      // Unknown operator returns false
      return false;
  }
}
