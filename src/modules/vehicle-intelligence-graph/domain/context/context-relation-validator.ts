import { ContextRelation } from './context-relation';

export function isValidContextRelation(relation: ContextRelation): boolean {
  // Prevent self-referencing contextual edges
  if (relation.fromNodeId === relation.contextNodeId) {
    return false;
  }

  return true;
}
