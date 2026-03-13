import { TemporalRelation } from './temporal-relation';
import { TemporalEdgeType } from '../enums/temporal-edge-type';

export function isValidTemporalRelation(relation: TemporalRelation): boolean {
  // Prevent self-relations
  if (relation.fromNodeId === relation.toNodeId) {
    return false;
  }

  // VALID_DURING requires at least one time bound
  if (relation.relationType === TemporalEdgeType.VALID_DURING) {
    if (!relation.validFrom && !relation.validTo) {
      return false;
    }
  }

  return true;
}
