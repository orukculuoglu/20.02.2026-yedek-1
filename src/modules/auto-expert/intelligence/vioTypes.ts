/**
 * Auto-Expert Module - Vehicle Intelligence Output (VIO) Contract
 * Standardized machine-readable output for external module consumption
 * Version: 1.0
 */

import type { DerivedMetrics } from '../../vehicle-intelligence/types';

/**
 * Intelligence index with machine key, optional label, value, and confidence
 */
export interface IntelligenceIndex {
  key: string; // machine key (e.g., "trustIndex", "structuralRisk")
  label?: string; // optional UI label (e.g., "Trust Index")
  value: number; // 0-100
  scale: '0-100';
  confidence: number; // 0-100 - confidence in this index
  evidenceSources: string[]; // sources supporting this index
  meta?: Record<string, any>; // Additional metadata including confidenceReason
}

/**
 * Intelligence signal - actionable insight or alert with confidence
 */
export interface IntelligenceSignal {
  code: string; // e.g., "ODOMETER_ANOMALY_DETECTED", "HIGH_STRUCTURAL_RISK"
  severity: 'low' | 'medium' | 'high'; // Severity level
  confidence: number; // 0-100 - confidence in this signal
  evidenceSources: string[]; // sources supporting this signal
  evidenceCount?: number; // How many data points support this signal
  meta?: Record<string, any>; // Additional metadata for signal context
}

/**
 * Part Life Features - extracted for Part Life Analysis module
 * Used to track vehicle aging, maintenance patterns, and parts lifecycle
 */
export interface PartLifeFeatures {
  avgDailyKm: number; // Average km driven per day
  kmSlope: number; // Km progression rate (km/month approx)
  lastServiceKm?: number; // Km at last service
  lastServiceDate?: string; // ISO date of last service
  obdFaultCount: number; // Total OBD fault codes recorded
}

/**
 * Vehicle Intelligence Output (VIO)
 * Main contract for machine-readable vehicle analysis
 * Designed for consumption by:
 * - Data Engine (for aggregations)
 * - Risk Analysis (for risk scoring)
 * - Part Life Analysis (lifecycle predictions)
 */
export interface VehicleIntelligenceOutput {
  vehicleId: string; // Unique vehicle identifier
  version: '1.0'; // Output version (for backward compatibility)
  schemaVersion: '1.1'; // Schema version (updated when contract changes)
  generatedAt: string; // ISO timestamp when output was generated

  // Intelligence indexes (0-100 scores)
  indexes: IntelligenceIndex[];

  // Action signals and alerts
  signals: IntelligenceSignal[];

  // Derived metrics (risk scores, intelligence analysis)
  derived?: DerivedMetrics;

  // Features for downstream analysis
  partLifeFeatures: PartLifeFeatures;

  // Human-readable summary
  summary: string;
}
