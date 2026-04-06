/**
 * Temporal Pressure Result
 * Structural pressure/accumulation readings from comparison results.
 * Surfaces: repeated breaches, stage density, route accumulation, overlap concentration.
 * No business meaning attached - purely structural measurements.
 */

/**
 * RepeatedBreachSurface
 * Comparisons that exceed repeated-breach threshold.
 * Indicates pressure concentration in specific comparisons.
 */
export interface RepeatedBreachSurface {
  // Comparison identifier
  comparisonId: string;

  // Total count of breaches in this comparison
  breachCount: number;

  // Whether this exceeds repeated-breach threshold
  isRepeatedBreach: boolean;

  // Breach details from evaluation
  // Contains which markers/thresholds triggered
  breachDetails: {
    markerIds: string[];
    markerTypes: string[];
  };

  // Track back to evaluation output
  sourceEvaluationId: string;

  // Optional metadata
  metadata?: Record<string, unknown>;
}

/**
 * StageDensitySurface
 * Breach/marker density measurements per stage.
 * Indicates pressure concentration in specific stages.
 */
export interface StageDensitySurface {
  // Stage identifier
  stageId: string;

  // Count of comparisons in this stage
  comparisonCountInStage: number;

  // Count of breaches in this stage
  breachCountInStage: number;

  // Count of markers in this stage
  markerCountInStage: number;

  // Density ratio: breaches / comparisons (if comparisons > 0)
  densityRatio?: number;

  // Whether this stage exceeds density threshold
  isDense: boolean;

  // Track back to evaluation output
  sourceEvaluationId: string;

  // Optional metadata
  metadata?: Record<string, unknown>;
}

/**
 * RouteAccumulationSurface
 * Pattern of breach accumulation across stage sequence.
 * Indicates how pressure builds across progression.
 */
export interface RouteAccumulationSurface {
  // Track back to evaluation output
  sourceEvaluationId: string;

  // Sequence of stages in route order
  stageProgression: Array<{
    position: number;
    stageId: string;
    breachCount: number;
    markerCount: number;
  }>;

  // Cumulative breach count at each stage
  cumulativeBreaches: Array<{
    position: number;
    stageId: string;
    cumulativeTotal: number;
  }>;

  // Direction of accumulation (increasing, decreasing, flat, mixed)
  accumulationTrend: "increasing" | "decreasing" | "flat" | "mixed";

  // Optional metadata
  metadata?: Record<string, unknown>;
}

/**
 * OverlapConcentrationSurface
 * How concentrated overlaps are across comparisons.
 * Indicates if overlaps cluster in specific comparisons or spread evenly.
 */
export interface OverlapConcentrationSurface {
  // Track back to evaluation output
  sourceEvaluationId: string;

  // Total comparisons with overlaps
  comparisonCountWithOverlap: number;

  // Total overlap markers found
  totalOverlapMarkers: number;

  // Average overlaps per comparison (if comparisons > 0)
  averageOverlapsPerComparison?: number;

  // Distribution: which comparisons have most overlaps
  topComparisons: Array<{
    comparisonId: string;
    overlapCount: number;
    overlapDays?: number;
  }>;

  // Concentration index (higher = more concentrated in few comparisons)
  // Ratio of top-25% comparisons' overlaps to total
  concentrationIndex?: number;

  // Optional metadata
  metadata?: Record<string, unknown>;
}

/**
 * PressureSurfaces
 * Complete set of pressure-oriented structural readings.
 */
export interface PressureSurfaces {
  // Reading context
  readingId: string;
  readingSessionId: string;
  readingStartedAt: number;

  // Track back
  sourceEvaluationId: string;

  // Repeated breach surface
  repeatedBreaches: RepeatedBreachSurface[];

  // Stage density surface
  stageDensities: StageDensitySurface[];

  // Route accumulation surface (if requested by options)
  routeAccumulation?: RouteAccumulationSurface;

  // Overlap concentration surface (if requested by options)
  overlapConcentration?: OverlapConcentrationSurface;

  // Summary stats
  summary: {
    totalComparisonsAnalyzed: number;
    comparisonsWithRepeatedBreaches: number;
    denseStagesCount: number;
    totalBreachesInAllComparisons: number;
    averageBreachesPerComparison: number;
  };

  // Optional metadata
  metadata?: Record<string, unknown>;
}
