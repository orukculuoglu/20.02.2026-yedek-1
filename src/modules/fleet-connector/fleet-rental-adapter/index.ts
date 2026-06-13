/**
 * Fleet Rental Adapter Module
 *
 * Translates FleetRental domain model to Fleet Connector read model.
 *
 * Exports:
 * - deriveFleetNormalizationReadModelFromFleetRental: Adapter function
 * - FleetRentalReadModelAdapterInput: Input interface
 */

export {
  deriveFleetNormalizationReadModelFromFleetRental,
  type FleetRentalReadModelAdapterInput,
} from './fleet-rental-read-model.adapter';
