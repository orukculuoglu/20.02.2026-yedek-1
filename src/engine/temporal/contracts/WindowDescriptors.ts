/**
 * Window Descriptors and Family Models
 * Structural identity and grouping for windows within collections.
 * Deterministic, no business logic.
 */

/**
 * WindowFamilyType enum
 * Explicit classification of window family membership.
 * Determines the category a window belongs to within an analysis domain.
 */
export enum WindowFamilyType {
  OBSERVATION = "OBSERVATION",     // Current/recent observed data window
  HISTORICAL = "HISTORICAL",       // Historical reference window
  CONTROL = "CONTROL",             // Unaffected control window
  BASELINE = "BASELINE",           // Expected/normal baseline window
  REFERENCE = "REFERENCE",         // Explicit reference point
  TREND = "TREND",                 // Window in trend sequence
}

/**
 * WindowDescriptor
 * Provides structural identity for a window within a grouped/collection context.
 * Complements the canonical window ID with collection-specific position and role metadata.
 * 
 * Note: Does not duplicate canonical windowId. Serves as reference to existing window.
 * Temporal span is accessed from the canonical MultiWindowTemporalContract.boundary.
 */
export interface WindowDescriptor {
  windowId: string;           // Reference to canonical MultiWindowTemporalContract.id
  sequencePosition: number;   // 0-based position in ordered collection
  familyType: WindowFamilyType;
}

/**
 * WindowFamily
 * Explicit grouping of windows by family membership.
 * Allows semantic clustering of windows without embedding logic.
 */
export interface WindowFamily {
  familyId: string;
  familyType: WindowFamilyType;
  familyLabel: string;        // Machine-readable name (e.g., "observation_q3_2024")
  memberIds: string[];        // Canonical IDs of windows in this family
  createdAt: number;          // When family was defined (Unix ms)
}
