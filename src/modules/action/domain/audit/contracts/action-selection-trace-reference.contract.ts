/**
 * ActionSelectionTraceReferenceBase - Base structure for action selection trace references
 */
interface ActionSelectionTraceReferenceBase {
  readonly candidateActionId?: string;
  readonly selectedActionId?: string;
  readonly selectionId?: string;
}

/**
 * ActionSelectionTraceReference - Non-hollow selection trace reference
 * Union ensures at least one reference is required.
 */
export type ActionSelectionTraceReference =
  | (ActionSelectionTraceReferenceBase & { readonly candidateActionId: string })
  | (ActionSelectionTraceReferenceBase & { readonly selectedActionId: string })
  | (ActionSelectionTraceReferenceBase & { readonly selectionId: string });
