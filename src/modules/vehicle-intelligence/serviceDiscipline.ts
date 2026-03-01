/**
 * Vehicle Intelligence Module - Service Discipline Analyzer
 * Analyzes service patterns for explainability and discipline scoring
 */

import type { ServiceRecord } from './types';

/**
 * Service discipline analysis result
 */
export interface ServiceDisciplineAnalysis {
  timeGapScore: number; // 0-100: lower = larger gaps between services
  kmGapScore: number; // 0-100: lower = larger km intervals between services
  regularityScore: number; // 0-100: higher = consistent intervals, lower = erratic
  disciplineScore: number; // 0-100: combined weighted score
  lastServiceDate?: string; // ISO date of last service
  daysSinceLastService?: number; // Days since last service (today)
  estimatedKmSinceLastService?: number; // Est. km driven since last service
}

/**
 * Analyze service discipline from service records and km history
 * Provides explainable metrics for maintenance discipline assessment
 */
export function analyzeServiceDiscipline(
  serviceRecords: ServiceRecord[],
  kmHistory: Array<{ date: string; km: number }>
): ServiceDisciplineAnalysis {
  // If no service records, default to low scores
  if (serviceRecords.length === 0) {
    return {
      timeGapScore: 0,
      kmGapScore: 0,
      regularityScore: 0,
      disciplineScore: 0,
      lastServiceDate: undefined,
      daysSinceLastService: undefined,
      estimatedKmSinceLastService: undefined,
    };
  }

  // Sort records by date
  const sorted = [...serviceRecords].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const lastServiceDate = sorted[sorted.length - 1].date;
  const today = new Date();
  const lastServiceDateObj = new Date(lastServiceDate);
  const daysSinceLastService = Math.round(
    (today.getTime() - lastServiceDateObj.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Estimate km since last service
  let estimatedKmSinceLastService: number | undefined;
  if (kmHistory.length > 0) {
    const lastKmRecord = kmHistory[kmHistory.length - 1];
    const lastServiceKmRecord = kmHistory
      .filter((r) => new Date(r.date) <= lastServiceDateObj)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    if (lastServiceKmRecord) {
      estimatedKmSinceLastService = lastKmRecord.km - lastServiceKmRecord.km;
    }
  }

  // ========== TIME GAP SCORE ==========
  // Calculate gaps between consecutive services (in days)
  const timeGaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const prevDate = new Date(sorted[i - 1].date);
    const currDate = new Date(sorted[i].date);
    const daysDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
    timeGaps.push(daysDiff);
  }

  // Also add gap from last service to today
  timeGaps.push(daysSinceLastService ?? 0);

  // Time gap score: penalize gaps > 180 days
  // Max gap score is 100 if mean gap <= 180 days
  const maxTimeGap = Math.max(...timeGaps);
  const meanTimeGap = timeGaps.length > 0 ? timeGaps.reduce((a, b) => a + b, 0) / timeGaps.length : 0;

  // Score: 100 if max gap <= 180, penalize every 10 days over 180
  let timeGapScore = 100;
  if (maxTimeGap > 180) {
    const penalty = Math.round(((maxTimeGap - 180) / 10) * 5); // ~5 points per 10 days over
    timeGapScore = Math.max(0, 100 - penalty);
  }

  // ========== KM GAP SCORE ==========
  let kmGapScore = 100;
  if (kmHistory.length > 1) {
    // Calculate km gaps between consecutive services
    const kmGaps: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      const prevServiceDate = new Date(sorted[i - 1].date);
      const currServiceDate = new Date(sorted[i].date);

      // Find km at these dates
      const prevKmRecord = kmHistory
        .filter((r) => new Date(r.date) <= prevServiceDate)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

      const currKmRecord = kmHistory
        .filter((r) => new Date(r.date) <= currServiceDate)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

      if (prevKmRecord && currKmRecord) {
        const kmDiff = currKmRecord.km - prevKmRecord.km;
        kmGaps.push(kmDiff);
      }
    }

    // Add km since last service
    if (estimatedKmSinceLastService !== undefined) {
      kmGaps.push(estimatedKmSinceLastService);
    }

    // Score: penalize intervals > 15000 km
    const maxKmGap = kmGaps.length > 0 ? Math.max(...kmGaps) : 0;
    if (maxKmGap > 15000) {
      const penalty = Math.round(((maxKmGap - 15000) / 1000) * 2); // ~2 points per 1000 km over
      kmGapScore = Math.max(0, 100 - penalty);
    }
  }

  // ========== REGULARITY SCORE ==========
  // Lower variation => higher score
  // Calculate standard deviation of intervals
  let regularityScore = 100;
  if (timeGaps.length > 1) {
    const mean = timeGaps.reduce((a, b) => a + b, 0) / timeGaps.length;
    const variance =
      timeGaps.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / timeGaps.length;
    const stdDev = Math.sqrt(variance);

    // Coefficient of variation (CV) = stdDev / mean
    const cv = mean > 0 ? stdDev / mean : 0;

    // If CV > 0.5, services are highly irregular (score drops significantly)
    // If CV < 0.2, services are very regular
    if (cv > 0.5) {
      regularityScore = Math.max(20, 100 - cv * 100);
    } else {
      regularityScore = Math.min(100, 100 - cv * 50);
    }
  }

  // ========== COMBINED DISCIPLINE SCORE ==========
  // Weighted formula: 0.5*regularity + 0.3*(100-timeGap) + 0.2*(100-kmGap)
  // But timeGapScore and kmGapScore already account for penalty,
  // so we use them as-is (higher is better)
  const disciplineScore = Math.round(
    0.5 * regularityScore +
    0.3 * timeGapScore +
    0.2 * kmGapScore
  );

  return {
    timeGapScore,
    kmGapScore,
    regularityScore,
    disciplineScore: Math.max(0, Math.min(100, disciplineScore)),
    lastServiceDate,
    daysSinceLastService,
    estimatedKmSinceLastService,
  };
}
