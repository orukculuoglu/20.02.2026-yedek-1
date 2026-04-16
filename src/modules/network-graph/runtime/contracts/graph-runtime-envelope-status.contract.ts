/**
 * Graph Runtime Envelope Status Vocabulary
 * Defines the status classification for graph runtime envelopes.
 * Status reflects the structural state of the complete runtime envelope.
 * No business meaning, no workflow meaning, no policy meaning.
 */

/**
 * GraphRuntimeEnvelopeStatus
 * Enumeration of envelope status states.
 * Reflects structural readiness of the complete runtime envelope.
 */
export enum GraphRuntimeEnvelopeStatus {
  /** Envelope is structurally ready: assembly succeeded and integrity is valid */
  READY = "ready",

  /** Envelope integrity check failed: assembly succeeded but structural defects exist */
  INTEGRITY_FAILED = "integrity_failed",

  /** Envelope contains empty graph: no nodes, edges, or relations */
  EMPTY = "empty",
}
