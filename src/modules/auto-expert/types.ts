/**
 * Auto Expert Inspection Module - Types and Domain Models
 * Phase 1: Core domain model for vehicle inspection reports
 */

export type ReportStatus = 'Draft' | 'Final';
export type ChecklistResult = 'OK' | 'Minor' | 'Major';
export type RiskFlag = 'StructuralRisk' | 'MechanicalRisk' | 'AirbagRisk';
export type AuditAction = 'CREATE' | 'UPDATE_ITEM' | 'FINALIZE' | 'RISK_SYNC' | 'RISK_SYNC_FAILED' | 'VIO_GENERATED' | 'VIO_FAILED';

/**
 * ChecklistItem - Individual inspection item
 */
export interface ChecklistItem {
  id: string;
  label: string;
  result: ChecklistResult;
  weight: number;
  scoreImpact: number; // Phase 1: defaults to 0
  riskTrigger?: RiskFlag; // Which risk flag this item can trigger
}

/**
 * ChecklistSection - Group of inspection items (e.g. "Body & Paint")
 */
export interface ChecklistSection {
  id: string;
  name: string;
  items: ChecklistItem[];
}

/**
 * ExpertReport - Main inspection report entity
 */
export interface ExpertReport {
  id: string;
  vehicleId: string;
  vin: string;
  plate: string;
  vehicleModel?: string; // e.g. "Fiat Egea"
  expertName?: string; // e.g. "Ali Yılmaz"
  status: ReportStatus;
  checklist: ChecklistSection[];
  score: number;
  riskFlags: RiskFlag[];
  createdBy: string;
  createdAt: string; // ISO timestamp
  finalizedAt?: string; // ISO timestamp when finalized
}

/**
 * ExpertAuditLog - Audit trail for compliance
 */
export interface ExpertAuditLog {
  id: string;
  reportId: string;
  action: AuditAction;
  actorId: string;
  at: string; // ISO timestamp
  meta?: Record<string, unknown>;
}

/**
 * CreateReportPayload - Input for creating new report
 */
export interface CreateReportPayload {
  vehicleId: string;
  vin: string;
  plate: string;
  createdBy: string;
}

/**
 * UpdateItemPayload - Input for updating a checklist item result
 */
export interface UpdateItemPayload {
  sectionId: string;
  itemId: string;
  result: ChecklistResult;
}
