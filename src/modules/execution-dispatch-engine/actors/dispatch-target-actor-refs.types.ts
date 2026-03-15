/**
 * Dispatch Target Actor References
 *
 * Maintains complete cross-ecosystem traceability for a target actor.
 * This interface preserves connections to upstream and external systems
 * to ensure actor provenance and identity binding across domains.
 */
export interface DispatchTargetActorRefs {
  /**
   * External system identifiers (databases, third-party platforms, etc.)
   */
  externalRefs: string[];

  /**
   * Service network references (API endpoints, service registries)
   */
  serviceNetworkRefs: string[];

  /**
   * Fleet management system references
   */
  fleetRefs: string[];

  /**
   * Insurance domain system references
   */
  insuranceRefs: string[];

  /**
   * Inspection/assessment domain references
   */
  inspectionRefs: string[];

  /**
   * ERP (Enterprise Resource Planning) system references
   */
  erpRefs: string[];

  /**
   * Source actor references (upstream systems, original data providers)
   */
  sourceRefs: string[];
}
