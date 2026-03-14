import { FederationRelation } from '../domain/federation/federation-relation';
import { FederationEdgeType } from '../domain/enums/federation-edge-type';

export const validFederationRelation: FederationRelation = {
  fromGraphId: 'graph:vehicle:12345:vig',
  targetGraphId: 'graph:fleet:region:us-west:fleet-intelligence',
  relationType: FederationEdgeType.LINKED_TO_FLEET_GRAPH,
  vehicleId: 'vehicle:12345',
  linkedAt: '2026-03-14T12:00:00Z',
  context: {
    fleetOperator: 'ACME_LOGISTICS',
    region: 'US_WEST',
  },
  provenance: {
    linkedBy: 'fleet_coordinator_system',
    linkReason: 'fleet_maintenance_sync',
  },
  metadata: {
    federationLevel: 'CONTROLLED',
    dataSharedCategories: ['MAINTENANCE', 'DIAGNOSTICS'],
  },
};

export const invalidFederationRelation: FederationRelation = {
  fromGraphId: 'graph:vehicle:67890:vig',
  targetGraphId: 'graph:vehicle:67890:vig',
  relationType: FederationEdgeType.FEDERATED_WITH_EXTERNAL_GRAPH,
  vehicleId: 'vehicle:67890',
  linkedAt: '2026-03-14T12:05:00Z',
};
