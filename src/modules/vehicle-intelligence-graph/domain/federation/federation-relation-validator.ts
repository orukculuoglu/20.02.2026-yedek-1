import { FederationRelation } from './federation-relation';

export function isValidFederationRelation(relation: FederationRelation): boolean {
  return relation.fromGraphId !== relation.targetGraphId;
}
