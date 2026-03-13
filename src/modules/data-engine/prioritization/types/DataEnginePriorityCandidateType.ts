/**
 * DataEnginePriorityCandidateType — Phase 10
 *
 * Enumeration of priority-ready pattern candidate types.
 *
 * Each type represents a structural pattern extracted from profile domains,
 * ready for downstream priority consideration (but NOT scored or prioritized at this phase).
 *
 * This taxonomy remains compact and deterministic.
 */

export enum DataEnginePriorityCandidateType {
  /**
   * COMPONENT_PRIORITY_CANDIDATE
   *
   * Source domain: COMPONENT_HEALTH_PROFILE
   *
   * Represents: Component involvement patterns ready for component-level consideration.
   *
   * Examples:
   * - brake_pad with high recurrence across events
   * - transmission_fluid with medium recurrence
   * - suspension_arm involved in multiple repairs
   *
   * priorityKey: component identifier
   * priorityBasis: recurrence level or involvement count
   */
  COMPONENT_PRIORITY_CANDIDATE = 'COMPONENT_PRIORITY_CANDIDATE',

  /**
   * SERVICE_PRIORITY_CANDIDATE
   *
   * Source domain: MAINTENANCE_BEHAVIOR_PROFILE
   *
   * Represents: Service/maintenance clustering patterns ready for service-level consideration.
   *
   * Examples:
   * - MAINTENANCE_RECORD with dense clustering
   * - DIAGNOSTIC_INSPECTION with moderate frequency
   * - REPAIR_REQUEST with high cluster strength
   *
   * priorityKey: service type or event family
   * priorityBasis: cluster strength or frequency intensity
   */
  SERVICE_PRIORITY_CANDIDATE = 'SERVICE_PRIORITY_CANDIDATE',

  /**
   * ACTOR_PRIORITY_CANDIDATE
   *
   * Source domain: SERVICE_DEPENDENCY_PROFILE
   *
   * Represents: Service provider/actor dependency patterns ready for actor-level consideration.
   *
   * Examples:
   * - WORKSHOP_A:MECHANIC with high concentration
   * - DIAGNOSTIC_CENTER:INSPECTOR with medium involvement
   * - Primary service provider relationship
   *
   * priorityKey: actor identifier (sourceId:role)
   * priorityBasis: concentration level or involvement intensity
   */
  ACTOR_PRIORITY_CANDIDATE = 'ACTOR_PRIORITY_CANDIDATE',

  /**
   * TEMPORAL_PRIORITY_CANDIDATE
   *
   * Source domain: USAGE_INTENSITY_PROFILE
   *
   * Represents: Temporal usage clustering and intensity patterns ready for temporal-level consideration.
   *
   * Examples:
   * - 2024-01-25 with high event density
   * - Dense usage window with concentrated events
   * - Temporal concentration period
   *
   * priorityKey: time window identifier (ISO date)
   * priorityBasis: density level or event count
   */
  TEMPORAL_PRIORITY_CANDIDATE = 'TEMPORAL_PRIORITY_CANDIDATE',

  /**
   * COMPOSITE_PRIORITY_CANDIDATE
   *
   * Source domains: Multiple intersecting profile domains
   *
   * Represents: Multi-domain convergence patterns ready for composite-level consideration.
   *
   * Examples:
   * - brake_pad (component) + dense maintenance + same workshop mechanic
   * - engine_oil (component) + high service frequency + one diagnostic center
   * - Pattern convergence indicating coordinated systemic interaction
   *
   * priorityKey: composite identifier (multiple domain references)
   * priorityBasis: "composite_overlap" + number of domains converging
   *
   * Composites indicate when multiple behavioral dimensions align on the same vehicle state.
   * NOT a decision signal. Just structural observation of convergence.
   */
  COMPOSITE_PRIORITY_CANDIDATE = 'COMPOSITE_PRIORITY_CANDIDATE',
}
