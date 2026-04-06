/**
 * Temporal Pattern Runtime
 * Orchestrates pressure and pattern reading from evaluation outputs.
 * Pure structural pattern derivation, no business logic, no hidden defaults.
 * All inputs explicit from caller, all readings only from source evaluation data.
 */

import type { TemporalPatternContext, PressureReadingOptions, PatternReadingOptions } from "./TemporalPatternContext.ts";
import { TemporalPatternContextValidator } from "./TemporalPatternContext.ts";
import type { TemporalEvaluationOutput } from "../evaluation/index.ts";
import type {
  RepeatedBreachSurface,
  StageDensitySurface,
  RouteAccumulationSurface,
  OverlapConcentrationSurface,
  PressureSurfaces,
} from "./TemporalPressureResult.ts";
import type {
  DriftSurface,
  RepetitionCluster,
  ConcentrationArea,
  PatternMarker,
  PatternSurfaces,
} from "./TemporalPatternResult.ts";

/**
 * TemporalPatternRuntime
 * Reads patterns and pressure from evaluation outputs.
 * Pure structural derivation, no business semantics.
 * Only creates readings for which explicit source data exists.
 */
export class TemporalPatternRuntime {
  /**
   * read
   * Main entry point: derive pressure and pattern surfaces from evaluation output.
   *
   * @param context - Explicit pattern context with all inputs
   * @returns Object containing both pressure and pattern surfaces
   */
  static read(
    context: TemporalPatternContext
  ): {
    pressureSurfaces: PressureSurfaces;
    patternSurfaces: PatternSurfaces;
  } {
    // Validate context structure
    const contextValidation = TemporalPatternContextValidator.validate(context);
    if (!contextValidation.isValid) {
      throw new Error(
        `TemporalPatternRuntime.read: Invalid context\n${contextValidation.errors.join("\n")}`
      );
    }

    const evaluationOutput = context.sourceEvaluationOutput;
    const pressureOptions = context.pressureReadingOptions;
    const patternOptions = context.patternReadingOptions;

    // Read pressure surfaces
    const pressureSurfaces = this.readPressureSurfaces(
      context,
      evaluationOutput,
      pressureOptions
    );

    // Read pattern surfaces
    const patternSurfaces = this.readPatternSurfaces(context, evaluationOutput, patternOptions);

    return {
      pressureSurfaces,
      patternSurfaces,
    };
  }

  /**
   * readPressureSurfaces
   * Derive pressure readings from evaluation output.
   * Pressure = structural measurements of accumulation, density, concentration.
   *
   * @param context - Full pattern context
   * @param evaluationOutput - Evaluation output to read
   * @param pressureOptions - Pressure reading configuration
   * @returns Complete pressure surfaces
   */
  private static readPressureSurfaces(
    context: TemporalPatternContext,
    evaluationOutput: TemporalEvaluationOutput,
    pressureOptions: PressureReadingOptions
  ): PressureSurfaces {
    const repeatedBreaches: RepeatedBreachSurface[] = [];
    const stageDensities: StageDensitySurface[] = [];

    // Read repeated breaches per comparison
    for (const comparison of evaluationOutput.comparisons) {
      const breachCount = comparison.markers.filter(m => m.severity !== "informational").length;

      if (breachCount > 0) {
        const repeated: RepeatedBreachSurface = {
          comparisonId: comparison.comparisonId,
          breachCount,
          isRepeatedBreach: breachCount >= pressureOptions.repeatedBreachThreshold,
          breachDetails: {
            markerIds: comparison.markers.map(m => m.markerId),
            markerTypes: Array.from(new Set(comparison.markers.map(m => m.markerType))),
          },
          sourceEvaluationId: evaluationOutput.evaluationId,
          metadata: context.metadata,
        };
        repeatedBreaches.push(repeated);
      }
    }

    // Read stage densities
    for (const stageInterpretation of evaluationOutput.stageInterpretations) {
      const breachCount = stageInterpretation.breachCount;
      const markerCount = stageInterpretation.stageMarkerCount;

      // Find comparison count in stage
      const sourceStageResult = evaluationOutput.sourceComparisonResult.stageResults.find(
        sr => sr.stageId === stageInterpretation.stageId
      );
      const comparisonCount = sourceStageResult?.comparisonCount;

      const densityRatio = comparisonCount !== undefined && comparisonCount > 0 ? breachCount / comparisonCount : undefined;

      const stageDensity: StageDensitySurface = {
        stageId: stageInterpretation.stageId,
        comparisonCountInStage: comparisonCount ?? 0,
        breachCountInStage: breachCount,
        markerCountInStage: markerCount,
        densityRatio,
        isDense: breachCount >= pressureOptions.stageDensityThreshold,
        sourceEvaluationId: evaluationOutput.evaluationId,
        metadata: context.metadata,
      };
      stageDensities.push(stageDensity);
    }

    // Read route accumulation (if requested)
    let routeAccumulation: RouteAccumulationSurface | undefined;
    if (pressureOptions.trackRouteAccumulation) {
      routeAccumulation = this.readRouteAccumulation(evaluationOutput, context);
    }

    // Read overlap concentration (if requested)
    let overlapConcentration: OverlapConcentrationSurface | undefined;
    if (pressureOptions.measureOverlapConcentration) {
      overlapConcentration = this.readOverlapConcentration(evaluationOutput, context);
    }

    // Calculate summary statistics
    const totalBreaches = repeatedBreaches.reduce((sum, rb) => sum + rb.breachCount, 0);
    const comparisonCount = evaluationOutput.comparisons.length;
    const denseStagesCount = stageDensities.filter(sd => sd.isDense).length;

    const summary = {
      totalComparisonsAnalyzed: comparisonCount,
      comparisonsWithRepeatedBreaches: repeatedBreaches.filter(rb => rb.isRepeatedBreach).length,
      denseStagesCount,
      totalBreachesInAllComparisons: totalBreaches,
      averageBreachesPerComparison: comparisonCount > 0 ? totalBreaches / comparisonCount : 0,
    };

    return {
      readingId: context.readingId,
      readingSessionId: context.readingSessionId,
      readingStartedAt: context.readingStartedAt,
      sourceEvaluationId: evaluationOutput.evaluationId,
      repeatedBreaches,
      stageDensities,
      routeAccumulation,
      overlapConcentration,
      summary,
      metadata: context.metadata,
    };
  }

  /**
   * readPatternSurfaces
   * Derive pattern readings from evaluation output.
   * Patterns = structural analysis of drift, clusters, concentrations.
   *
   * @param context - Full pattern context
   * @param evaluationOutput - Evaluation output to read
   * @param patternOptions - Pattern reading configuration
   * @returns Complete pattern surfaces
   */
  private static readPatternSurfaces(
    context: TemporalPatternContext,
    evaluationOutput: TemporalEvaluationOutput,
    patternOptions: PatternReadingOptions
  ): PatternSurfaces {
    const drifts: DriftSurface[] = [];
    const clusters: RepetitionCluster[] = [];
    const concentrationAreas: ConcentrationArea[] = [];
    const patternMarkers: PatternMarker[] = [];

    // Analyze drift across stages
    const stageProgression = evaluationOutput.stageInterpretations.map((si, idx) =>
      ({
        position: idx,
        stageId: si.stageId,
        breachCount: si.breachCount,
        markerCount: si.stageMarkerCount,
      })
    );

    if (stageProgression.length > 0) {
      const stageDeltaProgression = [];
      for (let i = 0; i < stageProgression.length - 1; i++) {
        const current = stageProgression[i];
        const next = stageProgression[i + 1];
        const breachDelta = next.breachCount - current.breachCount;
        const markerDelta = next.markerCount - current.markerCount;

        stageDeltaProgression.push({
          fromStage: current.stageId,
          toStage: next.stageId,
          breachCountDelta: breachDelta,
          markerCountDelta: markerDelta,
          isDrift: Math.abs(breachDelta) >= patternOptions.driftDeltaThreshold,
        });
      }

      const overallDrift =
        stageProgression[stageProgression.length - 1].breachCount -
        stageProgression[0].breachCount;

      let driftPattern: "increasing" | "decreasing" | "oscillating" | "stable" = "stable";
      if (overallDrift > patternOptions.driftDeltaThreshold) {
        driftPattern = "increasing";
      } else if (overallDrift < -patternOptions.driftDeltaThreshold) {
        driftPattern = "decreasing";
      } else {
        const hasIncrease = stageDeltaProgression.some(d => d.breachCountDelta > 0);
        const hasDecrease = stageDeltaProgression.some(d => d.breachCountDelta < 0);
        if (hasIncrease && hasDecrease) {
          driftPattern = "oscillating";
        }
      }

      if (driftPattern !== "stable") {
        const drift: DriftSurface = {
          stageProgression,
          stageDeltaProgression,
          overallDrift,
          driftPattern,
          sourceEvaluationId: evaluationOutput.evaluationId,
          metadata: context.metadata,
        };
        drifts.push(drift);

        patternMarkers.push({
          markerId: `drift_${evaluationOutput.evaluationId}_overall`,
          markerType: "drift_detected",
          observation: `Overall drift: ${driftPattern} (delta: ${overallDrift})`,
          triggerSource: {},
          sourceEvaluationId: evaluationOutput.evaluationId,
          metadata: context.metadata,
        });
      }
    }

    // Analyze patterns per comparison (if clustering requested)
    if (patternOptions.clusterByPattern) {
      const comparisonPatterns = new Map<string, string>();

      // Create pattern signature for each comparison
      for (const comparison of evaluationOutput.comparisons) {
        const markerTypes = Array.from(new Set(comparison.markers.map(m => m.markerType)))
          .sort()
          .join("|");
        comparisonPatterns.set(comparison.comparisonId, markerTypes);
      }

      // Group by pattern
      const patternGroups = new Map<string, string[]>();
      for (const [compId, pattern] of comparisonPatterns) {
        if (!patternGroups.has(pattern)) {
          patternGroups.set(pattern, []);
        }
        patternGroups.get(pattern)!.push(compId);
      }

      // Create clusters for groups that meet minimum size
      let clusterId = 0;
      for (const [pattern, compIds] of patternGroups) {
        if (compIds.length >= patternOptions.minClusterSize) {
          const markerTypes = pattern.length > 0 ? pattern.split("|") : [];

          // Find common stages (where ANY marker from this cluster appears)
          const stagesWithMarkers = new Set<string>();
          for (const compId of compIds) {
            const comparison = evaluationOutput.comparisons.find(c => c.comparisonId === compId);
            if (comparison) {
              comparison.markers.forEach(m => {
                const stageMarker = evaluationOutput.stageInterpretations.find(si =>
                  si.markers.some(m2 => m2.markerId === m.markerId)
                );
                if (stageMarker) {
                  stagesWithMarkers.add(stageMarker.stageId);
                }
              });
            }
          }

          // Calculate representative metrics
          const totalBreaches = compIds.reduce((sum, id) => {
            const comp = evaluationOutput.comparisons.find(c => c.comparisonId === id);
            return (
              sum +
              (comp?.markers.filter(m => m.severity !== "informational").length ?? 0)
            );
          }, 0);

          const cluster: RepetitionCluster = {
            clusterId: `cluster_${clusterId}`,
            comparisonIds: compIds,
            clusterSize: compIds.length,
            commonPattern: {
              commonMarkerTypes: markerTypes,
              stageIdsWithMarkers: Array.from(stagesWithMarkers),
            },
            representativeMetrics: {
              typicalBreachCount: Math.round(totalBreaches / compIds.length),
              typicalMarkerCount: Math.round(
                compIds.reduce((sum, id) => {
                  const comp = evaluationOutput.comparisons.find(c => c.comparisonId === id);
                  return sum + (comp?.markers.length ?? 0);
                }, 0) / compIds.length
              ),
            },
            sourceEvaluationId: evaluationOutput.evaluationId,
            metadata: context.metadata,
          };

          clusters.push(cluster);

          patternMarkers.push({
            markerId: `cluster_${clusterId}`,
            markerType: "cluster_detected",
            observation: `Pattern cluster: ${compIds.length} comparisons with markers [${markerTypes.join(", ")}]`,
            triggerSource: { comparisonId: compIds[0] },
            detailsUrl: { clusterId: `cluster_${clusterId}` },
            sourceEvaluationId: evaluationOutput.evaluationId,
            metadata: context.metadata,
          });

          clusterId++;
        }
      }
    }

    // Identify concentration areas (stages with highest breach count)
    // Only create if caller specifies a top stage count
    if (context.pressureReadingOptions.concentrationAreaTopStageCount && context.pressureReadingOptions.concentrationAreaTopStageCount > 0) {
      let areaId = 0;
      const topDenseStages = evaluationOutput.stageInterpretations
        .filter(si => si.breachCount > 0)
        .sort((a, b) => b.breachCount - a.breachCount)
        .slice(0, context.pressureReadingOptions.concentrationAreaTopStageCount);

      const totalBreaches = evaluationOutput.sourceComparisonResult.totalBreaches;

      for (const denseStage of topDenseStages) {
        const currentAreaId = `area_${areaId}`;
        const breachesInArea = denseStage.breachCount;
        const concentration = totalBreaches > 0 ? breachesInArea / totalBreaches : 0;

        const area: ConcentrationArea = {
          areaId: currentAreaId,
          areaType: "stage_cluster",
          stageIds: [denseStage.stageId],
          breachCountInArea: breachesInArea,
          markerCountInArea: denseStage.stageMarkerCount,
          concentrationIntensity: concentration,
          sourceEvaluationId: evaluationOutput.evaluationId,
          metadata: context.metadata,
        };

        concentrationAreas.push(area);

        patternMarkers.push({
          markerId: `concentration_${areaId}`,
          markerType: "concentration_detected",
          observation: `Breach concentration in stage ${denseStage.stageId}: ${breachesInArea} breaches (${(concentration * 100).toFixed(1)}% of total)`,
          triggerSource: { stageId: denseStage.stageId },
          detailsUrl: { areaId: currentAreaId },
          sourceEvaluationId: evaluationOutput.evaluationId,
          metadata: context.metadata,
        });

        areaId++;
      }
    }

    // Build summary
    const distinctMarkerTypesSet = new Set(
      evaluationOutput.comparisons.flatMap(c =>
        c.markers.map(m => m.markerType)
      )
    );
    const distinctMarkerTypes: string[] = Array.from(distinctMarkerTypesSet);

    return {
      readingId: context.readingId,
      readingSessionId: context.readingSessionId,
      readingStartedAt: context.readingStartedAt,
      sourceEvaluationId: evaluationOutput.evaluationId,
      drifts,
      clusters,
      concentrationAreas,
      patternMarkers,
      summary: {
        totalDriftsDetected: drifts.length,
        totalClustersDetected: clusters.length,
        totalConcentrationAreasDetected: concentrationAreas.length,
        distinctMarkerTypes,
      },
      metadata: context.metadata,
    };
  }

  /**
   * readRouteAccumulation
   * Analyze how pressure builds across stage sequence.
   *
   * @param evaluationOutput - Evaluation output to analyze
   * @param context - Pattern context
   * @returns Route accumulation surface
   */
  private static readRouteAccumulation(
    evaluationOutput: TemporalEvaluationOutput,
    context: TemporalPatternContext
  ): RouteAccumulationSurface {
    const stageProgression = evaluationOutput.stageInterpretations.map((si, idx) => ({
      position: idx,
      stageId: si.stageId,
      breachCount: si.breachCount,
      markerCount: si.stageMarkerCount,
    }));

    const cumulativeBreaches: Array<{
      position: number;
      stageId: string;
      cumulativeTotal: number;
    }> = [];

    let cumulative = 0;
    for (const stage of stageProgression) {
      cumulative += stage.breachCount;
      cumulativeBreaches.push({
        position: stage.position,
        stageId: stage.stageId,
        cumulativeTotal: cumulative,
      });
    }

    // Determine trend
    let accumulationTrend: "increasing" | "decreasing" | "flat" | "mixed" = "flat";
    if (stageProgression.length > 1) {
      const firstBreaches = stageProgression[0].breachCount;
      const lastBreaches = stageProgression[stageProgression.length - 1].breachCount;

      if (lastBreaches > firstBreaches) {
        accumulationTrend = "increasing";
      } else if (lastBreaches < firstBreaches) {
        accumulationTrend = "decreasing";
      } else {
        const allIncreasing = stageProgression.every((s, i) =>
          i === 0 ? true : s.breachCount >= stageProgression[i - 1].breachCount
        );
        const allDecreasing = stageProgression.every((s, i) =>
          i === 0 ? true : s.breachCount <= stageProgression[i - 1].breachCount
        );

        if (!allIncreasing && !allDecreasing) {
          accumulationTrend = "mixed";
        }
      }
    }

    return {
      sourceEvaluationId: evaluationOutput.evaluationId,
      stageProgression,
      cumulativeBreaches,
      accumulationTrend,
      metadata: context.metadata,
    };
  }

  /**
   * readOverlapConcentration
   * Measure how concentrated overlaps are across comparisons.
   *
   * @param evaluationOutput - Evaluation output to analyze
   * @param context - Pattern context
   * @returns Overlap concentration surface
   */
  private static readOverlapConcentration(
    evaluationOutput: TemporalEvaluationOutput,
    context: TemporalPatternContext
  ): OverlapConcentrationSurface {
    // Find all overlap markers
    const overlapsByComparison = new Map<string, number[]>();

    for (const comparison of evaluationOutput.comparisons) {
      const overlapMarkers = comparison.markers.filter(m => m.markerType === "overlap_found");
      if (overlapMarkers.length > 0) {
        const overlapValues = overlapMarkers
          .map(m => m.supportingData?.measured)
          .filter((v): v is number => typeof v === "number" && v > 0);

        if (overlapValues.length > 0) {
          overlapsByComparison.set(comparison.comparisonId, overlapValues);
        }
      }
    }

    const comparisonCountWithOverlap = overlapsByComparison.size;
    const totalOverlapMarkers = Array.from(overlapsByComparison.values()).reduce(
      (sum, arr) => sum + arr.length,
      0
    );
    const averageOverlapsPerComparison =
      comparisonCountWithOverlap > 0 ? totalOverlapMarkers / comparisonCountWithOverlap : undefined;

    // Find top comparisons (caller-controlled limit)
    const topComparisonLimit = context.pressureReadingOptions.concentrationIndexTopComparisonCount;
    const topComparisons = Array.from(overlapsByComparison.entries())
      .map(([compId, overlaps]) => ({
        comparisonId: compId,
        overlapCount: overlaps.length,
        overlapDays: overlaps.reduce((a, b) => a + b, 0),
      }))
      .sort((a, b) => b.overlapCount - a.overlapCount)
      .slice(0, topComparisonLimit ?? comparisonCountWithOverlap);

    // Calculate concentration index (only if caller specifies a top comparison count)
    let concentrationIndex: number | undefined;
    if (topComparisonLimit && topComparisonLimit > 0 && totalOverlapMarkers > 0) {
      const topOverlapSum = topComparisons.reduce((sum, c) => sum + c.overlapCount, 0);
      concentrationIndex = topOverlapSum / totalOverlapMarkers;
    }

    return {
      sourceEvaluationId: evaluationOutput.evaluationId,
      comparisonCountWithOverlap,
      totalOverlapMarkers,
      averageOverlapsPerComparison,
      topComparisons,
      concentrationIndex,
      metadata: context.metadata,
    };
  }
}
