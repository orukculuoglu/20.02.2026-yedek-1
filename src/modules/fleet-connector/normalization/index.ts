/**
 * Fleet Normalization Module
 * 
 * Pure mapper that transforms external fleet vehicle records into
 * safe normalized internal records.
 * 
 * Exports:
 * - FleetNormalizationMapperRuntimeInput: Input structure for the mapper
 * - normalizeExternalFleetVehicleRecord: Normalization transformation function
 */

export type {
  FleetNormalizationMapperRuntimeInput,
} from './fleet-normalization-mapper.input';

export { normalizeExternalFleetVehicleRecord } from './fleet-normalization-mapper';
