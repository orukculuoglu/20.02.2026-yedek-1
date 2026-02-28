/**
 * Vehicle Intelligence Module - Public API
 */

export * from './types';
export * from './vehicleAggregator';
export { vehicleIntelligenceStore } from './vehicleStore';
export { generateInsight, generateStatusBadge, generateSummaryLine } from './insightGenerator';
