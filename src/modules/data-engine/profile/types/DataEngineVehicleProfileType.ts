/**
 * DataEngineVehicleProfileType — Phase 9
 *
 * Enumeration of vehicle profile domains.
 *
 * Each domain aggregates related interpreted signals into a cohesive view.
 *
 * A complete vehicle intelligence profile contains all 5 domains.
 */

export enum DataEngineVehicleProfileDomain {
  /**
   * VEHICLE_BEHAVIOR_PROFILE
   *
   * Synthesized behavioral overview across all signal types.
   *
   * Aggregates: All interpreted signal patterns
   *
   * Represents: General structural behavioral state of the vehicle
   * - Pattern density summary
   * - Signal clustering overview
   * - Behavioral consistency indicators
   */
  VEHICLE_BEHAVIOR_PROFILE = 'VEHICLE_BEHAVIOR_PROFILE',

  /**
   * MAINTENANCE_BEHAVIOR_PROFILE
   *
   * Service cluster and maintenance event patterns.
   *
   * Aggregates: SERVICE_CLUSTER_PATTERN signals
   *
   * Represents: Service/maintenance behavioral patterns
   * - Service type clustering
   * - Frequency of different service families
   * - Maintenance event concentration
   */
  MAINTENANCE_BEHAVIOR_PROFILE = 'MAINTENANCE_BEHAVIOR_PROFILE',

  /**
   * COMPONENT_HEALTH_PROFILE
   *
   * Component involvement and recurrence patterns.
   *
   * Aggregates: COMPONENT_DEGRADATION_PATTERN signals
   *
   * Represents: Component structural health indicators
   * - Component recurrence across events
   * - Multi-event involvement tracking
   * - Component behavioral consistency
   */
  COMPONENT_HEALTH_PROFILE = 'COMPONENT_HEALTH_PROFILE',

  /**
   * SERVICE_DEPENDENCY_PROFILE
   *
   * Actor concentration and service provider patterns.
   *
   * Aggregates: ACTOR_DEPENDENCY_PATTERN signals
   *
   * Represents: Service provider dependency relationships
   * - Primary service provider relationships
   * - Actor concentration metrics
   * - Service actor specialization patterns
   */
  SERVICE_DEPENDENCY_PROFILE = 'SERVICE_DEPENDENCY_PROFILE',

  /**
   * USAGE_INTENSITY_PROFILE
   *
   * Temporal event clustering and density patterns.
   *
   * Aggregates: TEMPORAL_ANOMALY_PATTERN signals
   *
   * Represents: Vehicle usage intensity and patterns
   * - Usage clustering in time windows
   * - Event temporal distribution
   * - Usage concentration periods
   */
  USAGE_INTENSITY_PROFILE = 'USAGE_INTENSITY_PROFILE',
}
