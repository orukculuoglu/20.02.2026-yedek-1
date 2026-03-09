/**
 * Expertise Data Feed Contract
 * Phase 12.1: Final data feed model from Expertise Module → Data Engine
 *
 * Purpose:
 * Define the structured payload that Expertise module provides to Data Engine
 * for downstream consumption, aggregation, and further processing.
 *
 * Design:
 * - PURE: No snapshot writes, no side effects
 * - READ-ONLY: Aggregates existing snapshot data via accessors
 * - STRUCTURED: Shaped for Data Engine integration
 * - DETERMINISTIC: Same vehicle/snapshot always produces consistent feed
 * - NON-CREATIVE: Reshapes existing Phase 9-11 outputs, no new generation
 *
 * Data Flow:
 * VehicleAggregate → Expertise Engine (Phases 9-10) → Snapshot Storage
 *   ↓
 * Snapshot: summary, recommendations, actions
 *   ↓
 * Expertise Data Feed Builder → ExpertiseDataFeedPayload
 *   ↓
 * Data Engine: Ingests feed → Aggregates → Further processing
 *
 * This feed represents the FINAL structured output of Expertise module
 * ready for consumption by other systems/modules.
 */

import {
  getVehicleIntelligenceSummary,
  getVehicleIntelligenceRecommendations,
  getVehicleIntelligenceActions,
} from '../../vehicle-state/snapshotAccessor';

/**
 * Intelligence Summary segment of feed
 * Aggregated metrics from Phase 9 intelligence analysis
 */
export interface ExpertiseIntelligenceSummary {
  compositeScore?: number;              // Overall vehicle health 0-100
  compositeLevel?: string;              // Qualitative level: EXCELLENT, GOOD, FAIR, AT_RISK, CRITICAL
  trustIndex?: number;                  // Data trust/confidence 0-100
  reliabilityIndex?: number;            // Vehicle reliability 0-100
  maintenanceDiscipline?: number;       // Owner maintenance history 0-100
  structuralRisk?: number;              // Structural/body risk 0-100
  mechanicalRisk?: number;              // Mechanical system risk 0-100
  insuranceRisk?: number;               // Insurance claim likelihood 0-100
  serviceGapScore?: number;             // Service interval gap 0-100
  confidence?: number;                  // Analysis confidence 0-100
  dataSourceCount?: number;             // Number of data sources used
  analysisTimestamp?: string;           // ISO timestamp of analysis
  lastUpdatedAt?: string;               // ISO timestamp of last update
}

/**
 * Recommendation segment of feed
 * Structured recommendations from Phase 10
 */
export interface ExpertiseRecommendation {
  key: string;                          // Unique recommendation identifier
  title: string;                        // User-facing title (Turkish)
  severity: 'high' | 'medium' | 'low';  // Severity level
  priorityScore?: number;               // Phase 10.4: Priority within severity
  status?: 'NEW' | 'SEEN' | 'APPLIED' | 'DISMISSED'; // Phase 10.2: Lifecycle status
  group?: 'maintenance' | 'risk' | 'insurance' | 'data-quality'; // Phase 10.5: Category
}

/**
 * Action segment of feed
 * Structured actions derived from recommendations (Phase 11)
 */
export interface ExpertiseAction {
  key: string;                          // Unique action identifier
  title: string;                        // User-facing title (Turkish)
  actionType: string;                   // Action type (e.g., SCHEDULE_MAINTENANCE)
  priority: 'high' | 'medium' | 'low';  // Operational priority
  status?: 'NEW' | 'SEEN' | 'READY' | 'EXECUTED' | 'DISMISSED'; // Phase 11.4: Action lifecycle
  group?: 'maintenance' | 'risk' | 'insurance' | 'data-quality'; // Category
  sourceRecommendationKey?: string;     // Links back to recommendation
}

/**
 * Metadata about the feed payload
 */
export interface ExpertiseDataFeedMetadata {
  recommendationCount?: number;         // Total recommendations in feed
  highSeverityRecommendationCount?: number; // High-severity recommendations
  actionCount?: number;                 // Total actions in feed
  generatedAt: string;                  // ISO timestamp of feed generation
  sourceModule: 'EXPERTISE';            // Always 'EXPERTISE' for this contract
}

/**
 * Final Expertise Data Feed Payload
 * Complete structured output from Expertise Module
 *
 * Usage:
 * This payload is consumed by:
 * - Data Engine (for aggregation and further processing)
 * - Reporting systems (for analytics)
 * - External integrations (via work order bridge)
 * - UI displays (dashboards, analysis views)
 *
 * This is the FINAL handoff contract from Expertise → Data Engine.
 */
export interface ExpertiseDataFeedPayload {
  vehicleId: string;                    // Vehicle identifier (required)

  intelligenceSummary?: ExpertiseIntelligenceSummary;  // Phase 9: Intelligence metrics

  recommendations?: ExpertiseRecommendation[];         // Phase 10: Recommendations list

  actions?: ExpertiseAction[];                         // Phase 11: Actions list

  metadata?: ExpertiseDataFeedMetadata;                // Feed metadata
}

/**
 * Build final expertise data feed from snapshot
 * Pure builder function: reads snapshot → shapes feed payload
 *
 * Process:
 * 1. Validate vehicleId
 * 2. Read summary, recommendations, actions from snapshot accessors
 * 3. Shape into feed structure
 * 4. Add metadata
 * 5. Return payload or null if insufficient data
 *
 * @param vehicleId - Vehicle identifier
 * @returns ExpertiseDataFeedPayload or null if no data
 */
export function buildExpertiseDataFeed(vehicleId: string): ExpertiseDataFeedPayload | null {
  // Validate input
  if (!vehicleId) {
    return null;
  }

  // Step 1: Read snapshot data via safe accessors
  const summary = getVehicleIntelligenceSummary(vehicleId);
  const recommendations = getVehicleIntelligenceRecommendations(vehicleId);
  const actions = getVehicleIntelligenceActions(vehicleId);

  // Step 2: Check if any data exists
  if (!summary && (!recommendations || recommendations.length === 0) && (!actions || actions.length === 0)) {
    return null; // No expertise data for this vehicle
  }

  // Step 3: Calculate high-severity count
  const highSeverityCount = recommendations
    ? recommendations.filter((r) => r.severity === 'high').length
    : 0;

  // Step 4: Build metadata
  const metadata: ExpertiseDataFeedMetadata = {
    recommendationCount: recommendations?.length ?? 0,
    highSeverityRecommendationCount: highSeverityCount,
    actionCount: actions?.length ?? 0,
    generatedAt: new Date().toISOString(),
    sourceModule: 'EXPERTISE',
  };

  // Step 5: Shape recommendations segment
  let recommendationsSegment: ExpertiseRecommendation[] | undefined;
  if (recommendations && recommendations.length > 0) {
    recommendationsSegment = recommendations.map((rec) => ({
      key: rec.key,
      title: rec.title,
      severity: rec.severity,
      priorityScore: rec.priorityScore,
      status: rec.status,
      group: rec.group,
    }));
  }

  // Step 6: Shape actions segment
  let actionsSegment: ExpertiseAction[] | undefined;
  if (actions && actions.length > 0) {
    actionsSegment = actions.map((act) => ({
      key: act.key,
      title: act.title,
      actionType: act.actionType,
      priority: act.priority,
      status: act.status,
      group: act.group,
      sourceRecommendationKey: act.sourceRecommendationKey,
    }));
  }

  // Step 7: Shape intelligence summary segment
  let summarySegment: ExpertiseIntelligenceSummary | undefined;
  if (summary) {
    summarySegment = {
      compositeScore: summary.compositeScore,
      compositeLevel: summary.compositeLevel,
      trustIndex: summary.trustIndex,
      reliabilityIndex: summary.reliabilityIndex,
      maintenanceDiscipline: summary.maintenanceDiscipline,
      structuralRisk: summary.structuralRisk,
      mechanicalRisk: summary.mechanicalRisk,
      insuranceRisk: summary.insuranceRisk,
      serviceGapScore: summary.serviceGapScore,
      confidence: summary.confidence,
      dataSourceCount: summary.dataSourceCount,
      analysisTimestamp: summary.analysisTimestamp,
      lastUpdatedAt: summary.lastUpdatedAt,
    };
  }

  // Step 8: Build final payload
  const payload: ExpertiseDataFeedPayload = {
    vehicleId,
    intelligenceSummary: summarySegment,
    recommendations: recommendationsSegment,
    actions: actionsSegment,
    metadata,
  };

  return payload;
}

/**
 * FEED STRUCTURE REFERENCE
 *
 * The Expertise Data Feed consists of 4 segments:
 *
 * 1. VEHICLE ID (Required)
 *    ─────────────────────
 *    vehicleId: string
 *    Vehicle identifier for Data Engine routing
 *
 * 2. INTELLIGENCE SUMMARY (Optional)
 *    ──────────────────────────────
 *    Phase 9 Output: Aggregated metrics from vehicle intelligence analysis
 *    - All scores: 0-100 range
 *    - Composite: Overall vehicle health assessment
 *    - Indices: Trust, Reliability, Maintenance, Risk (structural/mechanical), Insurance
 *    - Service Gap: Maintenance interval analysis
 *    - Confidence: Analysis certainty
 *    - Sources: Data lineage tracking
 *
 * 3. RECOMMENDATIONS (Optional)
 *    ─────────────────────────
 *    Phase 10 Output: Ranked suggestions for vehicle management
 *    - Severity: High (critical), Medium (important), Low (advisory)
 *    - Priority Score: Fine-grained ranking within severity level
 *    - Status: Lifecycle tracking (NEW → SEEN → APPLIED/DISMISSED)
 *    - Group: Category for filtering/organization
 *    - Deduplication: Unique keys prevent duplicates
 *
 * 4. ACTIONS (Optional)
 *    ──────────────────
 *    Phase 11 Output: Operational tasks derived from recommendations
 *    - Action Types: Service, Inspection, Insurance Review, Data Quality
 *    - Priority: Operational priority (high, medium, low)
 *    - Status: Action lifecycle (NEW → SEEN → READY → EXECUTED/DISMISSED)
 *    - Source: Link back to originating recommendation
 *    - Group: Category for organizational context
 *
 * 5. METADATA (Required)
 *    ──────────────────
 *    Feed metadata:
 *    - Counts: Recommendations, high-severity, actions
 *    - Timestamp: When feed was generated
 *    - Source: Always 'EXPERTISE'
 *
 * ════════════════════════════════════════════════════════════════════
 *
 * DATA LINEAGE:
 * VehicleAggregate (vehicle-intelligence/types.ts)
 *   ↓ Pass to engines
 * generateVehicleIntelligenceRecommendations() [recommendationEngine.ts]
 *   → VehicleIntelligenceRecommendations[]
 *   ↓ Stored in
 * snapshot.vehicleIntelligenceRecommendations
 *   ↓ Pass to engine
 * generateVehicleActionsFromRecommendations() [actionEngine.ts]
 *   → VehicleAction[]
 *   ↓ Stored in
 * snapshot.vehicleIntelligenceActions
 *   ↓ Plus
 * snapshot.vehicleIntelligenceSummary (Phase 9)
 *   ↓ Read via accessors
 * getVehicleIntelligenceSummary()
 * getVehicleIntelligenceRecommendations()
 * getVehicleIntelligenceActions()
 *   ↓ Shaped by
 * buildExpertiseDataFeed()
 *   ↓ Returns
 * ExpertiseDataFeedPayload
 *   ↓ Consumed by
 * Data Engine, Reporting, Integrations, UI
 *
 * ════════════════════════════════════════════════════════════════════
 *
 * NOTES:
 * - All snapshot reads use safe accessors (return empty arrays if missing)
 * - Payload can have any segment missing (all optional except vehicleId)
 * - Returns null only if vehicleId invalid or no data exists
 * - Pure function: no state changes, deterministic output
 * - Safe for concurrent reads from multiple modules
 * - Backward compatible: new fields won't break consumers
 */
