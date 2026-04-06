/**
 * Temporal Pattern Result
 * Structural pattern readings from evaluation outputs.
 * Surfaces: drift, repetition clusters, concentration areas.
 * No business meaning attached - purely structural observations.
 */

/**
 * DriftSurface
 * Changes in breach/marker counts across stage progression.
 * Indicates if pressure is building, reducing, or shifting.
 */
export interface DriftSurface {
  // Comparison identifier (if single-comparison drift)
  comparisonId?: string;

  // Stage progression with breach counts
  stageProgression: Array<{
    position: number;
    stageId: string;
    breachCount: number;
    markerCount: number;
  }>;

  // Calculated deltas between consecutive stages
  stageDeltaProgression: Array<{
    fromStage: string;
    toStage: string;
    breachCountDelta: number;
    markerCountDelta: number;
    isDrift: boolean;
  }>;

  // Overall drift measure: last - first (in breach counts)
  overallDrift: number;

  // Drift direction: increasing, decreasing, oscillating, stable
  driftPattern: "increasing" | "decreasing" | "oscillating" | "stable";

  // Track back to evaluation output
  sourceEvaluationId: string;

  // Optional metadata
  metadata?: Record<string, unknown>;
}

/**
 * RepetitionCluster
 * Group of comparisons with similar breach patterns.
 * Indicates correlated pressure patterns.
 */
export interface RepetitionCluster {
  // Cluster identifier
  clusterId: string;

  // Comparisons in this cluster
  comparisonIds: string[];

  // Count in cluster
  clusterSize: number;

  // Common pattern they share
  commonPattern: {
    // All have same set of marker types (roughly)
    commonMarkerTypes: string[];
    // Stages where ANY marker from this cluster appears
    stageIdsWithMarkers: string[];
  };

  // Representative metrics (from cluster center)
  representativeMetrics: {
    typicalBreachCount: number;
    typicalMarkerCount: number;
  };

  // Track back to evaluation output
  sourceEvaluationId: string;

  // Optional metadata
  metadata?: Record<string, unknown>;
}

/**
 * ConcentrationArea
 * Geographic/structural area where pressure/patterns cluster.
 * Could be stage-based, route-based, or comparison-group-based.
 */
export interface ConcentrationArea {
  // Area identifier
  areaId: string;

  // Area type: stage-cluster, route-segment, comparison-group
  areaType: "stage_cluster" | "route_segment" | "comparison_group";

  // Members of this area
  stageIds?: string[];
  comparisonIds?: string[];

  // Pressure in this area
  breachCountInArea: number;
  markerCountInArea: number;

  // Concentration intensity (breaches in area / total breaches)
  concentrationIntensity: number;

  // Track back to evaluation output
  sourceEvaluationId: string;

  // Optional metadata
  metadata?: Record<string, unknown>;
}

/**
 * PatternMarker
 * Individual explainable pattern observation.
 * Atomic units of pattern reading.
 */
export interface PatternMarker {
  // Marker identifier
  markerId: string;

  // Marker type: drift detected, cluster detected, concentration detected
  markerType: "drift_detected" | "cluster_detected" | "concentration_detected";

  // What was observed
  observation: string;

  // Which evaluation component triggered this
  triggerSource: {
    // Which comparison/stage/area
    comparisonId?: string;
    stageId?: string;
    areaId?: string;
  };

  // Evidence / supporting details
  detailsUrl?: {
    driftId?: string;
    clusterId?: string;
    areaId?: string;
  };

  // Track back to evaluation output
  sourceEvaluationId: string;

  // Optional metadata
  metadata?: Record<string, unknown>;
}

/**
 * PatternSurfaces
 * Complete set of pattern-oriented structural readings.
 */
export interface PatternSurfaces {
  // Reading context
  readingId: string;
  readingSessionId: string;
  readingStartedAt: number;

  // Track back
  sourceEvaluationId: string;

  // Drift surfaces
  drifts: DriftSurface[];

  // Repetition clusters
  clusters: RepetitionCluster[];

  // Concentration areas
  concentrationAreas: ConcentrationArea[];

  // Individual pattern markers
  patternMarkers: PatternMarker[];

  // Summary stats
  summary: {
    totalDriftsDetected: number;
    totalClustersDetected: number;
    totalConcentrationAreasDetected: number;
    distinctMarkerTypes: string[];
  };

  // Optional metadata
  metadata?: Record<string, unknown>;
}
