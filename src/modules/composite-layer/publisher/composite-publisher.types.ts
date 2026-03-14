import type { CompositeRecord } from '../core/composite.types';
import type { CompositeType } from '../core/composite.enums';
import type { CompositeSeverity } from '../core/composite.severity';

/**
 * Signal handoff projection shape.
 * Minimal canonical form for Signal Engine consumption.
 */
export interface CompositeSignalProjection {
  compositeType: CompositeType;
  compositeId: string;
  normalizedScore: number;
  confidence: number;
  bandLabel?: string;
  severity?: CompositeSeverity;
  validFrom?: string;
  validTo?: string;
}

/**
 * Timeline / graph projection shape.
 * Preserves contextual and temporal information for timeline views.
 */
export interface CompositeTimelineProjection {
  compositeType: CompositeType;
  compositeId: string;
  vehicleId?: string;
  fleetId?: string;
  score: number;
  normalizedScore: number;
  bandLabel?: string;
  severity?: CompositeSeverity;
  createdAt: string;
}

/**
 * Dashboard summary projection shape.
 * High-level information for UI / dashboard consumption.
 */
export interface CompositeDashboardProjection {
  compositeType: CompositeType;
  compositeId: string;
  normalizedScore: number;
  confidence: number;
  summary?: string;
  topDrivers: string[];
  bandLabel?: string;
  severity?: CompositeSeverity;
}

/**
 * Publication envelope wrapping record and all projection shapes.
 * Deterministic container for downstream consumption.
 */
export interface CompositePublicationEnvelope {
  projectionKey: string;
  compositeType: CompositeType;
  recordId: string;
  createdAt: string;
  record: CompositeRecord;
  signalPayload: CompositeSignalProjection;
  timelinePayload: CompositeTimelineProjection;
  dashboardPayload: CompositeDashboardProjection;
}

/**
 * Publication result wrapper.
 * Top-level result object for all publication operations.
 */
export interface CompositePublicationResult {
  envelope: CompositePublicationEnvelope;
}
