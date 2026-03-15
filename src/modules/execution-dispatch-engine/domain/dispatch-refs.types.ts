/**
 * Cross-layer reference tracking for Execution / Dispatch Engine.
 *
 * Preserves complete traceability chain across all upstream AVID Motor 2 layers:
 * - Signal Engine (signal, graph, index, composite, source)
 * - Workflow Engine (workflow, work order)
 * - Execution / Dispatch Engine (dispatch)
 *
 * No data is lost; every dispatch maintains full ancestry for audit trails and deep linking.
 */
export interface DispatchRefs {
  workflowRefs: string[];
  workOrderRefs: string[];
  signalRefs: string[];
  graphRefs: string[];
  indexRefs: string[];
  compositeRefs: string[];
  sourceRefs: string[];
}
