/**
 * DataEngineInterpretedSignalType — Phase 8
 *
 * Enumeration of interpreted signal patterns.
 *
 * Phase 7 signals represent raw patterns.
 * Phase 8 interprets them into higher-level semantic patterns.
 *
 * Mapping:
 * TIMELINE_DENSITY → TEMPORAL_ANOMALY_PATTERN
 * COMPONENT_RECURRENCE → COMPONENT_DEGRADATION_PATTERN
 * ACTOR_CONCENTRATION → ACTOR_DEPENDENCY_PATTERN
 * EVENT_TYPE_FREQUENCY → SERVICE_CLUSTER_PATTERN
 */

export enum DataEngineInterpretedSignalType {
  /**
   * TEMPORAL_ANOMALY_PATTERN
   *
   * Interpreted from: TIMELINE_DENSITY signals
   *
   * Indicates clustering of observations/events in a specific time window.
   * Higher density suggests temporal concentration point.
   *
   * patternKey: ISO date (day) of concentration
   * patternValue: density level or event count in window
   */
  TEMPORAL_ANOMALY_PATTERN = 'TEMPORAL_ANOMALY_PATTERN',

  /**
   * COMPONENT_DEGRADATION_PATTERN
   *
   * Interpreted from: COMPONENT_RECURRENCE signals
   *
   * Indicates repeated involvement of component across multiple events.
   * Recurrence suggests potential degradation or systematic involvement.
   *
   * patternKey: canonical component identifier
   * patternValue: recurrence intensity (high/medium/low)
   */
  COMPONENT_DEGRADATION_PATTERN = 'COMPONENT_DEGRADATION_PATTERN',

  /**
   * ACTOR_DEPENDENCY_PATTERN
   *
   * Interpreted from: ACTOR_CONCENTRATION signals
   *
   * Indicates concentration of vehicle interactions with specific actor.
   * High concentration suggests dependency or primary relationship.
   *
   * patternKey: actor identifier (sourceId:role)
   * patternValue: concentration level or involvement intensity
   */
  ACTOR_DEPENDENCY_PATTERN = 'ACTOR_DEPENDENCY_PATTERN',

  /**
   * SERVICE_CLUSTER_PATTERN
   *
   * Interpreted from: EVENT_TYPE_FREQUENCY signals
   *
   * Indicates clustering of specific service/event types.
   * Frequency suggests systematic or recurring need for service family.
   *
   * patternKey: event type family identifier
   * patternValue: cluster strength or frequency intensity
   */
  SERVICE_CLUSTER_PATTERN = 'SERVICE_CLUSTER_PATTERN',
}
