import { SignalWorkflowIntegrationInput, SignalWorkflowIntegrationResult } from './signal-workflow-integration.types';
import { mapSignalToWorkflowRuntime } from './signal-workflow-mapper';

/**
 * Service for Signal → Workflow integration.
 * Bridges Signal Engine outputs to Workflow Runtime input pipeline.
 *
 * Responsibilities:
 * - Accept signal workflow integration input
 * - Map signal data to workflow runtime input
 * - Normalize recommendations deterministically
 * - Return integration result ready for runtime execution
 *
 * This is an integration preparation layer only.
 * Does NOT execute WorkflowRuntimeService.
 * Does NOT create workflows or work orders.
 * Does NOT persist or queue.
 *
 * All operations are deterministic: same input → same output.
 */
export class SignalWorkflowIntegrationService {
  /**
   * Prepare signal for workflow runtime execution.
   *
   * Process:
   * 1. Map signal input to workflow runtime input structure
   * 2. Normalize recommendations
   * 3. Return integration result
   *
   * @param input - Signal workflow integration input
   * @returns Integration result with mapped runtime input
   */
  static prepareSignalForRuntime(input: SignalWorkflowIntegrationInput): SignalWorkflowIntegrationResult {
    return mapSignalToWorkflowRuntime(input);
  }
}
