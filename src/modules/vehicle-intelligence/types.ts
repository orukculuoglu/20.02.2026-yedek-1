/**
 * Vehicle Intelligence Module - Types
 * Defines VehicleAggregate and all related data structures
 */

import type { ReasonCodes } from './normalizers/reasonCodes';
import type { ServiceDisciplineAnalysis } from './serviceDiscipline';
import type { ObdIntelligence } from './obdIntelligence';
import type { InsuranceDamageCorrelation } from './correlationIntelligence';

export interface KmHistoryRecord {
  date: string; // ISO date
  km: number;
}

export interface ObdRecord {
  date: string; // ISO date
  faultCode: string; // e.g., "P0300", "P0101"
}

export interface InsuranceRecord {
  date: string; // ISO date
  type: string; // "claim", "renewal", "lapse", "inquiry"
}

export interface DamageRecord {
  date: string; // ISO date
  severity: 'minor' | 'major';
  description?: string;
}

export interface ServiceRecord {
  date: string; // ISO date
  type: string; // "routine", "repair", "maintenance", "recall"
  description?: string;
}

export interface DataSources {
  kmHistory: KmHistoryRecord[];
  obdRecords: ObdRecord[];
  insuranceRecords: InsuranceRecord[];
  damageRecords: DamageRecord[];
  serviceRecords: ServiceRecord[];
}

export interface KmIntelligence {
  hasRollback: boolean;
  rollbackSeverity: number; // 0-100 (severity of rollback if detected)
  rollbackEvidenceCount: number; // Number of rollback points
  volatilityScore: number; // 0-100 (consistency of km progression)
  usageClass: 'low' | 'normal' | 'high'; // Usage intensity classification
}

export interface DerivedMetrics {
  odometerAnomaly: boolean;
  kmIntelligence: KmIntelligence; // Advanced KM analysis
  serviceGapScore: number; // 0-100 (0=perfect, 100=critical)
  serviceDiscipline: ServiceDisciplineAnalysis; // Detailed service pattern analysis
  structuralRisk: number; // 0-100
  mechanicalRisk: number; // 0-100
  insuranceRisk: number; // 0-100
  obdIntelligence: ObdIntelligence; // Fault code analysis
  insuranceDamageCorrelation: InsuranceDamageCorrelation; // Insurance vs damage correlation
}

export interface IntelligenceIndexes {
  trustIndex: number; // 0-100 (100=fully trustworthy)
  reliabilityIndex: number; // 0-100 (100=most reliable)
  maintenanceDiscipline: number; // 0-100 (100=excellent discipline)
}

export interface VehicleAggregate {
  vehicleId: string;
  vin: string;
  plate: string;
  timestamp: string; // When aggregate was built

  dataSources: DataSources;

  derived: DerivedMetrics;

  indexes: IntelligenceIndexes;

  insightSummary: string;

  explain?: {
    reasons: ReasonCodes;
  };
}
