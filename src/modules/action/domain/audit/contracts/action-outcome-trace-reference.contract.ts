/**
 * ActionOutcomeTraceReferenceBase - Base structure for action outcome trace references
 */
interface ActionOutcomeTraceReferenceBase {
  readonly outcomeId?: string;
  readonly outcomeFlowId?: string;
  readonly selectedActionId?: string;
  readonly handoffId?: string;
}

/**
 * ActionOutcomeTraceReference - Non-hollow outcome trace reference
 * Union ensures at least one reference is required.
 */
export type ActionOutcomeTraceReference =
  | (ActionOutcomeTraceReferenceBase & { readonly outcomeId: string })
  | (ActionOutcomeTraceReferenceBase & { readonly outcomeFlowId: string })
  | (ActionOutcomeTraceReferenceBase & { readonly selectedActionId: string })
  | (ActionOutcomeTraceReferenceBase & { readonly handoffId: string });
