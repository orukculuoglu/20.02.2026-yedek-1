import { WorkflowPriority } from '../domain';

/**
 * Deterministically resolve workflow priority.
 *
 * @param requestedPriority - Explicitly requested priority
 * @returns Resolved WorkflowPriority
 *
 * Resolution logic:
 * 1. If requestedPriority is provided, use it (explicit request takes precedence)
 * 2. Otherwise, use MEDIUM as deterministic fallback
 *
 * The priority resolution is deterministic and truthful to available inputs.
 * Only uses data present in the WorkflowEngineInput contract.
 */
export function resolveWorkflowPriority(
  requestedPriority: WorkflowPriority | undefined,
): WorkflowPriority {
  // 1. Explicit request takes precedence
  if (requestedPriority !== undefined) {
    return requestedPriority;
  }

  // 2. Deterministic fallback when no explicit priority is provided
  return WorkflowPriority.MEDIUM;
}
