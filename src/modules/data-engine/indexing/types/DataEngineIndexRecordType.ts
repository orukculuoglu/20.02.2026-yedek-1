/**
 * Data Engine Index Record Type Taxonomy
 *
 * Defines explicit index record families for Phase 6 Index Preparation.
 * Each type represents a distinct indexing dimension used for future
 * phase consumption (Phase 7+, query services, analytics).
 *
 * Kept compact and practical—only essential dimensions included.
 */

export enum DataEngineIndexRecordType {
  /**
   * VEHICLE_TIMELINE
   * Chronological record of all events and observations against a vehicle.
   * One record per event/observation, ordered by event timestamp.
   * Used for temporal queries, maintenance history, sequence analysis.
   */
  VEHICLE_TIMELINE = 'VEHICLE_TIMELINE',

  /**
   * VEHICLE_COMPONENT
   * Components and assets involved with a vehicle.
   * One record per unique component, references all events mentioning it.
   * Used for part-centric queries, inventory, replacement tracking.
   */
  VEHICLE_COMPONENT = 'VEHICLE_COMPONENT',

  /**
   * VEHICLE_ACTOR
   * Actors (service centers, mechanics, systems) involved with a vehicle.
   * One record per unique actor role pair.
   * Used for provider analytics, accountability, service history.
   */
  VEHICLE_ACTOR = 'VEHICLE_ACTOR',

  /**
   * VEHICLE_EVENT_TYPE
   * Semantic grouping of event types for a vehicle.
   * One record per distinct event type family.
   * Used for categorization, signal preparation, pattern matching.
   */
  VEHICLE_EVENT_TYPE = 'VEHICLE_EVENT_TYPE',
}
