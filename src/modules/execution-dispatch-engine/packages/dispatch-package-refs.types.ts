/**
 * Dispatch Package References
 *
 * Maintains complete traceability for a dispatch package across Layer 8 and upstream sources.
 * This interface preserves connections to all related entities and their sources.
 */
export interface DispatchPackageRefs {
  /**
   * References to the dispatch intent(s) included in this package
   */
  dispatchRefs: string[];

  /**
   * References to the target actor(s) receiving this package
   */
  actorRefs: string[];

  /**
   * References to the delivery channel(s) used for this package
   */
  channelRefs: string[];

  /**
   * References to upstream workflow contexts
   */
  workflowRefs: string[];

  /**
   * References to upstream work order contexts
   */
  workOrderRefs: string[];

  /**
   * References to upstream signal sources
   */
  signalRefs: string[];

  /**
   * References to original data sources
   */
  sourceRefs: string[];
}
