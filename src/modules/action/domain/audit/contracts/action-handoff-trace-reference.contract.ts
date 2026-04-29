/**
 * ActionHandoffTraceReferenceBase - Base structure for action handoff trace references
 */
interface ActionHandoffTraceReferenceBase {
  readonly handoffId?: string;
  readonly handoffBatchId?: string;
  readonly selectedActionId?: string;
}

/**
 * ActionHandoffTraceReference - Non-hollow handoff trace reference
 * Union ensures at least one reference is required.
 */
export type ActionHandoffTraceReference =
  | (ActionHandoffTraceReferenceBase & { readonly handoffId: string })
  | (ActionHandoffTraceReferenceBase & { readonly handoffBatchId: string })
  | (ActionHandoffTraceReferenceBase & { readonly selectedActionId: string });
