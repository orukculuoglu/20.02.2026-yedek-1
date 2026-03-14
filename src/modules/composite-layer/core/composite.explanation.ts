/**
 * CompositeExplanation provides human-readable and machine-readable
 * interpretation of a composite score
 */
export interface CompositeExplanation {
  /**
   * One-line summary of the composite result
   * Example: "Vehicle demonstrates strong overall health with excellent reliability"
   */
  summary: string;

  /**
   * List of key factors that contributed to this score
   */
  contributingFactors?: string[];

  /**
   * Factors pushing the score up (positive direction)
   */
  strongestPositiveDrivers?: string[];

  /**
   * Factors pulling the score down (negative direction)
   */
  strongestNegativeDrivers?: string[];

  /**
   * Notes about the confidence level and data quality
   */
  confidenceNotes?: string[];

  /**
   * List of inputs that were missing or unavailable
   */
  missingInputs?: string[];

  /**
   * Contextual comparison notes (vs fleet average, etc)
   */
  comparisonNotes?: string[];
}
