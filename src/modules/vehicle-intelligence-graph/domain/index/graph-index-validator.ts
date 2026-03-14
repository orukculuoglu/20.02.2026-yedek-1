import { GraphIndex } from './graph-index';

export function isValidGraphIndex(index: GraphIndex): boolean {
  if (!index.indexId) {
    return false;
  }
  if (!index.vehicleId) {
    return false;
  }
  return true;
}
