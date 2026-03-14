import { ProvenanceRelation } from './provenance-relation';

export function isValidProvenanceRelation(relation: ProvenanceRelation): boolean {
  return relation.fromNodeId !== relation.toNodeId;
}
