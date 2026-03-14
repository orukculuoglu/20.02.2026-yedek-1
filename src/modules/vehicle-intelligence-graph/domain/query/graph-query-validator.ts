import { GraphQuery } from './graph-query';

export function isValidGraphQuery(query: GraphQuery): boolean {
  if (!query.queryId) {
    return false;
  }
  if (!query.vehicleId) {
    return false;
  }
  if (query.maxDepth !== undefined && query.maxDepth <= 0) {
    return false;
  }
  return true;
}
