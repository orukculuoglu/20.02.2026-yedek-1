/**
 * Data Engine Signal Type Taxonomy
 *
 * Defines explicit signal families for Phase 7 Signal Preparation.
 * Each type represents a distinct signal dimension used for downstream
 * processing (Phase 8+, decision engines, analytics, recommendations).
 *
 * Kept compact and practical—only essential signal families included.
 */

export enum DataEngineSignalType {
  /**
   * TIMELINE_DENSITY
   * Indicates clustering or density of events/observations in time.
   * High density suggests rapid succession of events within a window.
   * Used for temporal pattern recognition, anomaly detection, urgency signals.
   */
  TIMELINE_DENSITY = 'TIMELINE_DENSITY',

  /**
   * COMPONENT_RECURRENCE
   * Indicates repeated involvement of the same component.
   * High recurrence suggests chronic issues or wear patterns.
   * Used for predictive maintenance, component lifecycle tracking.
   */
  COMPONENT_RECURRENCE = 'COMPONENT_RECURRENCE',

  /**
   * ACTOR_CONCENTRATION
   * Indicates repeated concentration around same actor/provider/source.
   * High concentration suggests single-point service or relationship patterns.
   * Used for provider analytics, relationship tracking, accountability.
   */
  ACTOR_CONCENTRATION = 'ACTOR_CONCENTRATION',

  /**
   * EVENT_TYPE_FREQUENCY
   * Indicates repeated frequency of same event family/type.
   * High frequency suggests category dominance in event stream.
   * Used for event pattern recognition, category concentration analysis.
   */
  EVENT_TYPE_FREQUENCY = 'EVENT_TYPE_FREQUENCY',
}
