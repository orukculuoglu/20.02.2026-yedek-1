/**
 * Fleet Normalization Read Models Module
 * 
 * Pure aggregate information extraction from normalized fleet vehicle data.
 * 
 * Exports:
 * - FleetNormalizationReadModel: Aggregate read model structure
 * - FleetStatusDistribution: Generic status distribution type
 * - createFleetNormalizationReadModel: Read model transformation function
 * - ExternalFleetOperationalStatus, ExternalFleetRentalStatus, ExternalFleetMaintenanceStatus: Status enums
 */

export type {
  FleetNormalizationReadModel,
  FleetStatusDistribution,
} from './fleet-normalization-read-model.result';

export {
  ExternalFleetOperationalStatus,
  ExternalFleetRentalStatus,
  ExternalFleetMaintenanceStatus,
} from './fleet-normalization-read-model.result';

export { createFleetNormalizationReadModel } from './fleet-normalization-read-model';
