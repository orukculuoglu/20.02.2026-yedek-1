/**
 * Temporal Interpretation Result
 * Deterministic interpretation-ready outputs from comparison results.
 * Explainable summaries without workflow implications.
 * No recommendations, no severity escalation, no business action language.
 * Pure informational markers.
 */

import type { ComparisonResult } from "./TemporalComparisonResult.ts";

/**
 * InterpretationMarker
 * Explainable markers derived from comparison results.
 * Informational flags with no implicit business implication.
 * Only severity: "informational", "important", or "critical" for user awareness.
 */
export interface InterpretationMarker {
  // Marker identifier
  markerId: string;

  // Marker type: descriptive category
  markerType: "delta_significant" | "volatility_detected" | "overlap_found" | "threshold_breach";

  // Which comparison this marker is associated with
  comparisonId: string;

  // Human-readable message for this marker
  message: string;

  // Severity level for user awareness ONLY
  // No implication for action - purely classification
  severity: "informational" | "important" | "critical";

  // Supporting data (context-specific)
  // Optional: only populated if explicitly available
  supportingData?: Record<string, unknown>;

  // Optional metadata for this marker
  metadata?: Record<string, unknown>;
}

/**
 * ComparisonInterpretation
 * Interpretation summary for a single comparison.
 * Combines evaluation results with explainable markers.
 */
export interface ComparisonInterpretation {
  // Comparison identifier
  comparisonId: string;

  // Interpretation status based on marker count
  // normal = no markers, marked = some markers, multi_breach = multiple breaches
  status: "normal" | "marked" | "multi_breach";

  // Markers associated with this comparison
  markers: InterpretationMarker[];

  // Summary message (short text)
  summary: string;

  // Count of markers
  markerCount: number;

  // Optional metadata
  metadata?: Record<string, unknown>;
}

/**
 * TemporalEvaluationOutput
 * Complete evaluation output combining comparison and interpretation.
 * Ready for downstream analysis or review systems.
 * Contains no business decision logic, no recommendations, no escalation.
 */
export interface TemporalEvaluationOutput {
  // Evaluation context
  evaluationId: string;
  evaluationSessionId: string;
  evaluationStartedAt: number;
  evaluationCompletedAt: number;

  // Source comparison result
  sourceComparisonResult: ComparisonResult;

  // Interpretations per comparison
  comparisons: ComparisonInterpretation[];

  // Interpretations per stage
  stageInterpretations: Array<{
    stageId: string;
    stageMarkerCount: number;
    breachCount: number;
    markers: InterpretationMarker[];
  }>;

  // Overall summary
  evaluationSummary: {
    // Total comparisons evaluated
    totalComparisonsEvaluated: number;

    // Total markers generated
    totalMarkersGenerated: number;

    // Total threshold breaches
    totalBreaches: number;

    // Comparison status distribution
    normalCount: number;
    markedCount: number;
    multiBreachCount: number;
  };

  // Validation/readiness
  isReady: boolean;
  
  // Any validation errors during evaluation
  readinessErrors: string[];

  // Optional metadata
  metadata?: Record<string, unknown>;
}
