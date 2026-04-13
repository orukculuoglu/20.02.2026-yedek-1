/**
 * Service Graph Reference Contract
 * Minimal structural reference for service entities in graph nodes.
 * Caller provides service identifiers and optional metadata.
 * No business logic, no service runtime behavior, pure structural reference.
 */

/**
 * ServiceGraphRef
 * Minimal structural reference to a service entity.
 * Graph nodes may carry this reference to link to operational services.
 * Caller must explicitly provide service identifiers.
 */
export interface ServiceGraphRef {
  /** Service entity identifier (caller-provided, required) */
  serviceId: string;

  /** Service code/SKU (caller-provided, optional) */
  serviceCode?: string;

  /** Service display name (caller-provided, optional) */
  serviceName?: string;
}
