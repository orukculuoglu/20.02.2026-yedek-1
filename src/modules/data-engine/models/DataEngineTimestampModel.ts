/**
 * Data Engine Timestamp Model
 *
 * Distinguishes critical time concepts for event causality, observation latency,
 * ingestion tracking, and processing sequencing.
 *
 * All timestamps are ISO 8601 UTC format.
 */

/**
 * Data Engine timestamp envelope.
 *
 * Distinguishes critical time concepts for:
 * - Event causality (when something actually happened)
 * - Observation latency (how quickly it was recorded)
 * - Ingestion tracking (when it entered the Data Engine)
 * - Processing sequencing (for deterministic ordering)
 *
 * All timestamps are ISO 8601 UTC format.
 */
export interface DataEngineTimestampModel {
  /**
   * Event timestamp.
   * When the event occurred in the real world / source system.
   * This is the causally relevant moment.
   *
   * Example: A repair completed at 2026-03-11T14:30:00Z
   */
  readonly eventTimestamp: string;

  /**
   * Observed timestamp.
   * When the event was first recorded/observed by the originating system.
   * May differ from eventTimestamp due to source system delays.
   *
   * Example: Recorded in shop system at 2026-03-11T14:35:00Z (5 min delay)
   */
  readonly observedTimestamp: string;

  /**
   * Ingested timestamp.
   * When this Data Engine received/imported this feed record.
   * Marks entry into the aggregation system.
   *
   * Example: Imported at 2026-03-11T15:00:00Z (25 min after observation)
   */
  readonly ingestedTimestamp: string;

  /**
   * Processed timestamp (optional).
   * When the Data Engine Core completed normalization preparation.
   * Only set after structural processing is complete.
   *
   * Example: Processed at 2026-03-11T15:05:00Z
   */
  readonly processedTimestamp?: string;
}
