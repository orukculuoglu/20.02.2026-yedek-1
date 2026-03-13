/**
 * Vehicle Intelligence Graph - Root Binding Validator
 *
 * Validates that a VehicleRootBinding complies with the canonical root attachment policy.
 */

import type { VehicleRootBinding } from './vehicle-root-binding';
import { ROOT_BINDING_RULES } from './root-binding-rules';

/**
 * Validates a root binding against canonical rules
 *
 * Checks that:
 * 1. A binding rule exists for the target node type
 * 2. The binding uses the correct edge type for its target node type
 *
 * @param binding The binding to validate
 * @returns true if the binding is valid, false otherwise
 */
export function isValidRootBinding(binding: VehicleRootBinding): boolean {
  const expectedEdgeType = ROOT_BINDING_RULES[binding.targetNodeType];
  return expectedEdgeType !== undefined && binding.bindingEdgeType === expectedEdgeType;
}
