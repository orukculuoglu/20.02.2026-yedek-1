import { TrustRelation } from './trust-relation';

export function isValidTrustRelation(relation: TrustRelation): boolean {
  return relation.fromNodeId !== relation.toNodeId;
}
