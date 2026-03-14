/**
 * Enumeration of entity types that can be indexed.
 * Determines what domain object is being measured by an IndexRecord.
 * 
 * - VEHICLE: An individual vehicle entity
 * - VEHICLE_FLEET: A fleet of vehicles
 * - VEHICLE_COMPONENT: A specific component within a vehicle
 * - VEHICLE_SYSTEM: A system composed of multiple components
 * - DATA_SOURCE: A data source providing vehicle intelligence
 */
export enum IndexSubjectType {
  VEHICLE = 'VEHICLE',
  VEHICLE_FLEET = 'VEHICLE_FLEET',
  VEHICLE_COMPONENT = 'VEHICLE_COMPONENT',
  VEHICLE_SYSTEM = 'VEHICLE_SYSTEM',
  DATA_SOURCE = 'DATA_SOURCE',
}
