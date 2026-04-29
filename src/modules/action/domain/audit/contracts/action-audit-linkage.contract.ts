/**
 * ActionAuditLinkageBase - Shared base structure for all audit linkage variants
 * All linkage references are optional in the base, but union enforces at least one is required.
 */
interface ActionAuditLinkageBase {
  /**
   * Optional reference identifier to the action
   */
  readonly actionId?: string;

  /**
   * Optional reference identifier to the action candidate
   */
  readonly candidateActionId?: string;

  /**
   * Optional reference identifier to the selected action
   */
  readonly selectedActionId?: string;

  /**
   * Optional reference identifier to the action selection / final selection surface
   */
  readonly selectionId?: string;

  /**
   * Optional reference identifier to the execution handoff
   */
  readonly handoffId?: string;

  /**
   * Optional reference identifier to a handoff batch or group
   */
  readonly handoffBatchId?: string;

  /**
   * Optional reference identifier to the action outcome
   */
  readonly outcomeId?: string;

  /**
   * Optional reference identifier to the action outcome flow
   */
  readonly outcomeFlowId?: string;

  /**
   * Optional reference identifier to the policy that triggered this action
   */
  readonly policyId?: string;

  /**
   * Optional reference identifier to the policy evaluation
   */
  readonly evaluationId?: string;
}

/**
 * ActionAuditLinkage - Structural linkage connecting audit log entry to prior Action Runtime structures
 * Pure reference structure with no loading, resolution, or execution tracing behavior.
 * Non-hollow: ensures at least one linkage reference is present at compile time.
 * Union-based: type-level guarantee that exactly one of the 10 reference types is required and non-optional.
 * Links log entry back to the action flow through at least one prior structure reference.
 */
export type ActionAuditLinkage = 
  | (ActionAuditLinkageBase & { readonly actionId: string })
  | (ActionAuditLinkageBase & { readonly candidateActionId: string })
  | (ActionAuditLinkageBase & { readonly selectedActionId: string })
  | (ActionAuditLinkageBase & { readonly selectionId: string })
  | (ActionAuditLinkageBase & { readonly handoffId: string })
  | (ActionAuditLinkageBase & { readonly handoffBatchId: string })
  | (ActionAuditLinkageBase & { readonly outcomeId: string })
  | (ActionAuditLinkageBase & { readonly outcomeFlowId: string })
  | (ActionAuditLinkageBase & { readonly policyId: string })
  | (ActionAuditLinkageBase & { readonly evaluationId: string })
