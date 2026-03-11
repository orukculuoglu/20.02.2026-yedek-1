/**
 * Data Engine Core - Phase 1 Public API
 *
 * Unified export point for all Phase 1 core object model definitions.
 *
 * Folder Organization:
 * - models/ : Canonical entity structures (DataEngineEntity, DataEngineFeedEnvelope)
 * - types/ : Type definitions and unions (DataSourceType, DataEngineTimestampModel)
 * - metadata/ : Metadata structures (FeedMetadataStructure)
 * - examples/ : Realistic example objects and documentation
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export type { DataSourceType } from './types/DataSourceType';
export type { DataEngineTimestampModel } from './types/DataEngineTimestampModel';

// ═══════════════════════════════════════════════════════════════════════════════
// METADATA EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export type { FeedMetadataStructure } from './metadata/FeedMetadataStructure';

// ═══════════════════════════════════════════════════════════════════════════════
// MODEL EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export type { DataEngineEntity } from './models/DataEngineEntity';
export type { DataEngineFeedEnvelope } from './models/DataEngineFeedEnvelope';

// ═══════════════════════════════════════════════════════════════════════════════
// EXAMPLE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export {
  exampleServiceMaintenanceFeed,
  exampleInsuranceClaimFeed,
  exampleTelematicsDiagnosticFeed,
  exampleMaintenanceEntity,
} from './examples/feedExamples';
