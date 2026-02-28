/**
 * Auto Expert Module - Main Index Export
 * Exports all public API for this module
 */

// Types
export type {
  ReportStatus,
  ChecklistResult,
  RiskFlag,
  AuditAction,
  ChecklistItem,
  ChecklistSection,
  ExpertReport,
  ExpertAuditLog,
  CreateReportPayload,
  UpdateItemPayload,
} from './types';

// Store & Audit
export { reportStore } from './store';
export { auditStore } from './audit';

// Scoring
export { recomputeScoreAndFlags } from './scoring.stub';

// Routes
export { AutoExpertRoutes, AutoExpertBoot, autoExpertRoutes } from './routes';

// Pages (can be used independently)
export { OtoEkspertizDashboard } from './pages/OtoEkspertizDashboard';
export { ExpertReportList } from './pages/ExpertReportList';
export { ExpertReportDetail } from './pages/ExpertReportDetail';

// Components (can be used independently)
export { StatusBadge } from './components/StatusBadge';
export { RiskBadges } from './components/RiskBadges';
export { ScorePanel } from './components/ScorePanel';
export { ChecklistSectionAccordion } from './components/ChecklistSectionAccordion';
