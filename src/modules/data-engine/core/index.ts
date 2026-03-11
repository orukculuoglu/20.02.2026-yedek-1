/**
 * Data Engine Core — Phase 1 Public API
 *
 * Re-exports all Phase 1 type definitions and examples.
 * Provides unified entry point for consumers.
 */

// Core type definitions
export type {
  DataSourceType,
  DataEngineTimestampModel,
  FeedMetadataStructure,
  DataEngineEntity,
  DataEngineFeedEnvelope,
} from './phase1.types';

// Example objects for reference and testing
export {
  exampleServiceMaintenanceFeed,
  exampleInsuranceClaimFeed,
  exampleTelematicsDiagnosticFeed,
  exampleMaintenanceEntity,
} from './phase1.examples';
